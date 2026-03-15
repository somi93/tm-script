
/**
 * tm-playerdb.js — IndexedDB storage for TrophyManager player data
 *
 * Usage (via Tampermonkey @require):
 *   // @require  file://H:/projects/Moji/tmscripts/lib/tm-playerdb.js
 *
 * Exposed globals:
 *   TmPlayerDB      — active players, preloaded into RAM cache on init
 *   TmPlayerArchiveDB — retired/deleted players, never preloaded, read on-demand
 *
 * TmPlayerDB API:
 *   .init()             → Promise — opens DB, migrates localStorage, preloads cache
 *   .get(pid)           → object|null  (sync, from cache)
 *   .set(pid, value)    → Promise
 *   .remove(pid)        → Promise
 *   .allPids()          → string[]
 *   .archive(pid)       → Promise — moves record to ArchiveDB and removes from active
 *
 * TmPlayerArchiveDB API:
 *   .init()             → Promise
 *   .get(pid)           → Promise<object|null>  (async, on-demand)
 *   .set(pid, value)    → Promise
 */


    /* ═══════════════════════════════════════════════════════════
       TmPlayerDB — active players
       Preloads all records into sync cache on init.
       localStorage has 5 MB limit; IndexedDB has hundreds of MB.
       ═══════════════════════════════════════════════════════════ */
    const PlayerDB = (() => {
        const DB_NAME = 'TMPlayerData';
        const STORE_NAME = 'players';
        const DB_VERSION = 1;
        let db = null;
        const cache = {};

        const open = () => new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const d = e.target.result;
                if (!d.objectStoreNames.contains(STORE_NAME))
                    d.createObjectStore(STORE_NAME);
            };
            req.onsuccess = (e) => { db = e.target.result; resolve(db); };
            req.onerror = (e) => reject(e.target.error);
        });

        /** Sync read from cache (call after init) */
        const get = (pid) => cache[pid] || null;

        /** Async write: updates cache immediately + persists to IndexedDB */
        const set = (pid, value) => {
            cache[pid] = value;
            if (!db) return Promise.resolve();
            const idbKey = parseInt(pid);
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).put(value, isFinite(idbKey) ? idbKey : pid);
                tx.oncomplete = () => resolve();
                tx.onerror = (e) => reject(e.target.error);
            }).catch(e => console.warn('[DB] write failed:', e));
        };

        /** Async delete: removes from cache + IndexedDB (deletes both integer and string key variants) */
        const remove = (pid) => {
            delete cache[pid];
            if (!db) return Promise.resolve();
            const idbKey = parseInt(pid);
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                if (isFinite(idbKey)) store.delete(idbKey);
                store.delete(String(pid));
                tx.oncomplete = () => resolve();
                tx.onerror = (e) => reject(e.target.error);
            }).catch(e => console.warn('[DB] delete failed:', e));
        };

        /** Get all pids (from cache, sync) */
        const allPids = () => Object.keys(cache);

        /** Move a record to ArchiveDB and remove from active */
        const archive = (pid) => {
            const record = get(pid);
            if (!record) return Promise.resolve();
            return TmPlayerArchiveDB.set(pid, record).then(() => remove(pid));
        };

        /** Init: open DB → migrate localStorage → preload cache */
        const init = async () => {
            await open();

            /* Migrate existing localStorage _data keys to IndexedDB */
            const toMigrate = [];
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (!k || !k.endsWith('_data')) continue;
                const pid = k.replace('_data', '');
                if (!/^\d+$/.test(pid)) continue;
                try {
                    const data = JSON.parse(localStorage.getItem(k));
                    if (data) toMigrate.push({ pid, data });
                    keysToRemove.push(k);
                } catch (e) { keysToRemove.push(k); }
            }
            if (toMigrate.length > 0) {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                for (const item of toMigrate) store.put(item.data, parseInt(item.pid));
                await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
                for (const k of keysToRemove) localStorage.removeItem(k);
                console.log(`%c[DB] Migrated ${toMigrate.length} player(s) from localStorage → IndexedDB`,
                    'font-weight:bold;color:#6cc040');
            }

            /* Preload ALL records into sync cache */
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const reqAll = store.getAll();
            const reqKeys = store.getAllKeys();
            await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
            for (let i = 0; i < reqKeys.result.length; i++)
                cache[reqKeys.result[i]] = reqAll.result[i];

            console.log(`[DB] Loaded ${Object.keys(cache).length} player(s) from IndexedDB`);

            /* Request persistent storage so Chrome won't auto-evict */
            if (navigator.storage && navigator.storage.persist) {
                navigator.storage.persist().then(granted => {
                    console.log(`[DB] Persistent storage: ${granted ? '✓ granted' : '✗ denied'}`);
                });
            }
        };

        return { init, get, set, remove, allPids, archive };
    })();

    /* ═══════════════════════════════════════════════════════════
       TmPlayerArchiveDB — retired/deleted players
       Never preloaded into RAM. Read on-demand only.
       Keeps TmPlayerDB cache lean as player count grows.
       ═══════════════════════════════════════════════════════════ */
    const PlayerArchiveDB = (() => {
        const DB_NAME = 'TMPlayerArchive';
        const STORE_NAME = 'players';
        const DB_VERSION = 1;
        let db = null;

        const open = () => new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const d = e.target.result;
                if (!d.objectStoreNames.contains(STORE_NAME))
                    d.createObjectStore(STORE_NAME);
            };
            req.onsuccess = (e) => { db = e.target.result; resolve(db); };
            req.onerror = (e) => reject(e.target.error);
        });

        const init = () => open().catch(e => console.warn('[ArchiveDB] open failed:', e));

        /** Async write — no cache */
        const set = (pid, value) => {
            if (!db) return Promise.resolve();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).put(value, pid);
                tx.oncomplete = () => resolve();
                tx.onerror = (e) => reject(e.target.error);
            }).catch(e => console.warn('[ArchiveDB] write failed:', e));
        };

        /** Async read — on-demand only */
        const get = (pid) => {
            if (!db) return Promise.resolve(null);
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const req = tx.objectStore(STORE_NAME).get(pid);
                req.onsuccess = () => resolve(req.result ?? null);
                req.onerror = (e) => reject(e.target.error);
            }).catch(() => null);
        };

        return { init, get, set };
    })();

    export const TmPlayerDB = PlayerDB;
    export const TmPlayerArchiveDB = PlayerArchiveDB;

    /* ═══════════════════════════════════════════════════════════
       TmMatchCacheDB — compressed match records
       Keyed by matchId (integer). Lazy-open: no explicit init() needed.
       Stores TmApi.compressMatch() output, not raw API blobs.
       ═══════════════════════════════════════════════════════════ */
    const MatchCacheDB = (() => {
        const DB_NAME = 'TMMatchCache';
        const STORE_NAME = 'matches';
        const DB_VERSION = 1;
        let db = null;
        let openPromise = null;

        const open = () => new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const d = e.target.result;
                if (!d.objectStoreNames.contains(STORE_NAME))
                    d.createObjectStore(STORE_NAME);
            };
            req.onsuccess = (e) => { db = e.target.result; resolve(db); };
            req.onerror = (e) => reject(e.target.error);
        });

        const ensureOpen = () => {
            if (db) return Promise.resolve(db);
            if (!openPromise) openPromise = open().catch(e => {
                openPromise = null;
                console.warn('[MatchCacheDB] open failed:', e);
                return null;
            });
            return openPromise;
        };

        /** @param {string|number} matchId  @returns {Promise<object|null>} */
        const get = (matchId) => ensureOpen().then(d => {
            if (!d) return null;
            return new Promise((resolve) => {
                const req = d.transaction(STORE_NAME, 'readonly')
                    .objectStore(STORE_NAME).get(parseInt(matchId));
                req.onsuccess = () => resolve(req.result ?? null);
                req.onerror = () => resolve(null);
            });
        });

        /** @param {string|number} matchId  @param {object} data  @returns {Promise<void>} */
        const set = (matchId, data) => ensureOpen().then(d => {
            if (!d) return;
            return new Promise((resolve) => {
                const tx = d.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).put(data, parseInt(matchId));
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            });
        });

        /**
         * Delete all entries whose matchId is NOT in the given set.
         * @param {(string|number)[]} keepIds
         * @returns {Promise<number>} count of deleted entries
         */
        const pruneExcept = (keepIds) => ensureOpen().then(d => {
            if (!d) return 0;
            const keepSet = new Set(keepIds.map(id => parseInt(id)));
            return new Promise((resolve) => {
                const tx = d.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                let deleted = 0;
                store.openCursor().onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (!cursor) return;
                    if (!keepSet.has(cursor.key)) { cursor.delete(); deleted++; }
                    cursor.continue();
                };
                tx.oncomplete = () => resolve(deleted);
                tx.onerror = () => resolve(0);
            });
        });

        return { get, set, pruneExcept };
    })();

    export const TmMatchCacheDB = MatchCacheDB;

