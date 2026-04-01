
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
 *
 * TmPlayerArchiveDB API:
 *   .init()             → Promise
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
        let initPromise = null;
        const cache = {};
        const cacheKey = (pid) => String(pid);

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
        const get = (pid) => cache[cacheKey(pid)] || null;

        /** Async write: updates cache immediately + persists to IndexedDB */
        const set = (pid, value) => {
            const key = cacheKey(pid);
            const prev = cache[key] || null;
            if (prev?.graphSync && !value?.graphSync) {
                console.warn('[DB] graphSync downgrade detected', {
                    pid,
                    prevGraphSync: prev.graphSync,
                    nextGraphSync: value?.graphSync,
                    prevGraphWeekCount: prev?.graphWeekCount ?? null,
                    nextGraphWeekCount: value?.graphWeekCount ?? null,
                    prevRecordCount: Object.keys(prev?.records || {}).length,
                    nextRecordCount: Object.keys(value?.records || {}).length,
                    stack: new Error().stack,
                });
            }
            cache[key] = value;
            if (!db) return Promise.resolve();
            const idbKey = parseInt(pid);
            console.log('[DB] Writing player', pid, 'to IndexedDB (graphSync:', value?.graphSync, 'weekCount:', value?.graphWeekCount, 'recordCount:', Object.keys(value?.records || {}).length, ')');
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).put(value, isFinite(idbKey) ? idbKey : pid);
                tx.oncomplete = () => resolve();
                tx.onerror = (e) => reject(e.target.error);
            }).catch(e => console.warn('[DB] write failed:', e));
        };

        /** Async delete: removes from cache + IndexedDB (deletes both integer and string key variants) */
        const remove = (pid) => {
            delete cache[cacheKey(pid)];
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

        /** Init: open DB → migrate localStorage → preload cache */
        const init = async () => {
            if (db) return db;
            if (initPromise) return initPromise;

            initPromise = (async () => {
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
                    'font-weight:bold;color:var(--tmu-success)');
            }

            /* Preload ALL records into sync cache */
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const reqAll = store.getAll();
            const reqKeys = store.getAllKeys();
            await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
            for (let i = 0; i < reqKeys.result.length; i++)
                cache[cacheKey(reqKeys.result[i])] = reqAll.result[i];

            console.log(`[DB] Loaded ${Object.keys(cache).length} player(s) from IndexedDB`);

            /* Request persistent storage so Chrome won't auto-evict */
            if (navigator.storage && navigator.storage.persist) {
                navigator.storage.persist().then(granted => {
                    console.log(`[DB] Persistent storage: ${granted ? '✓ granted' : '✗ denied'}`);
                });
            }
            return db;
            })();

            try {
                return await initPromise;
            } catch (error) {
                initPromise = null;
                throw error;
            }
        };

        return { init, get, set, remove, allPids };
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
        let initPromise = null;

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

        const init = () => {
            if (db) return Promise.resolve(db);
            if (initPromise) return initPromise;
            initPromise = open().catch(e => {
                initPromise = null;
                console.warn('[ArchiveDB] open failed:', e);
                return null;
            });
            return initPromise;
        };

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

        return { init, set };
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

        return { get, set };
    })();

    export const TmMatchCacheDB = MatchCacheDB;

