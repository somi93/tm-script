
const PlayerCacheDB = (() => {
    const DB_NAME = 'TMPlayerData';
    const STORE_NAME = 'players';
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
            console.warn('[PlayerCacheDB] open failed:', e);
            return null;
        });
        return openPromise;
    };

    /** @param {string|number} playerId  @returns {Promise<object|null>} */
    const get = (playerId) => ensureOpen().then(d => {
        if (!d) return null;
        return new Promise((resolve) => {
            const req = d.transaction(STORE_NAME, 'readonly')
                .objectStore(STORE_NAME).get(parseInt(playerId));
            req.onsuccess = () => resolve(req.result ?? null);
            req.onerror = () => resolve(null);
        });
    });

    /** @param {string|number} playerId  @param {object} data  @returns {Promise<void>} */
    const set = (playerId, data) => ensureOpen().then(d => {
        if (!d) return;
        return new Promise((resolve) => {
            const tx = d.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put(data, parseInt(playerId));
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
        });
    });

    return { get, set };
})();

export const TmPlayerDB = PlayerCacheDB;

// ── Archived players DB (TMArchivedPlayers) ───────────────────────────
const ArchivedPlayerDB = (() => {
    const DB_NAME = 'TMArchivedPlayers';
    const STORE_NAME = 'players';
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
            console.warn('[ArchivedPlayerDB] open failed:', e);
            return null;
        });
        return openPromise;
    };

    const get = (playerId) => ensureOpen().then(d => {
        if (!d) return null;
        return new Promise((resolve) => {
            const req = d.transaction(STORE_NAME, 'readonly')
                .objectStore(STORE_NAME).get(parseInt(playerId));
            req.onsuccess = () => resolve(req.result ?? null);
            req.onerror = () => resolve(null);
        });
    });

    const set = (playerId, data) => ensureOpen().then(d => {
        if (!d) return;
        return new Promise((resolve) => {
            const tx = d.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put(data, parseInt(playerId));
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
        });
    });

    return { get, set };
})();

export const TmPlayerArchiveDB = ArchivedPlayerDB;

/**
 * Move a player record from TMPlayerData → TMArchivedPlayers, then delete from source.
 * @param {string|number} playerId
 * @returns {Promise<boolean>} true if successfully archived
 */
export const archivePlayerRecord = async (playerId) => {
    const record = await TmPlayerDB.get(playerId);
    if (!record) return false;
    await TmPlayerArchiveDB.set(playerId, { ...record, _archivedAt: Date.now() });
    // delete from source using the same DB connection pattern
    await new Promise(resolve => {
        const req = indexedDB.open('TMPlayerData', 1);
        req.onsuccess = e => {
            const d = e.target.result;
            const tx = d.transaction('players', 'readwrite');
            tx.objectStore('players').delete(parseInt(playerId));
            tx.oncomplete = () => { d.close(); resolve(); };
            tx.onerror = () => { d.close(); resolve(); };
        };
        req.onerror = () => resolve();
    });
    return true;
};

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

