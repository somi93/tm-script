'use strict';

// ── Direct IDB helpers (no dependency on TmPlayerDB module) ──────────────────

const IDB_ACTIVE   = { name: 'TMPlayerData',     store: 'players', version: 1 };
const IDB_ARCHIVED = { name: 'TMArchivedPlayers', store: 'players', version: 1 };

const openIdb = ({ name, store, version }) => new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version);
    req.onupgradeneeded = e => {
        if (!e.target.result.objectStoreNames.contains(store))
            e.target.result.createObjectStore(store);
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
});

const idbGetAll = async (cfg) => {
    const db    = await openIdb(cfg);
    const tx    = db.transaction(cfg.store, 'readonly');
    const s     = tx.objectStore(cfg.store);
    const [values, keys] = await Promise.all([
        new Promise((res, rej) => { const r = s.getAll();    r.onsuccess = () => res(r.result); r.onerror = rej; }),
        new Promise((res, rej) => { const r = s.getAllKeys(); r.onsuccess = () => res(r.result); r.onerror = rej; }),
    ]);
    db.close();
    const out = {};
    keys.forEach((k, i) => { out[k] = values[i]; });
    return out;
};

const idbPutAll = async (cfg, records) => {
    const db = await openIdb(cfg);
    const tx = db.transaction(cfg.store, 'readwrite');
    const s  = tx.objectStore(cfg.store);
    let count = 0;
    for (const [k, v] of Object.entries(records)) {
        const key = parseInt(k);
        s.put(v, isFinite(key) ? key : k);
        count++;
    }
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
    db.close();
    return count;
};

// ── Export ────────────────────────────────────────────────────────────────────

const downloadJson = (obj, filename) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
};

const exportDb = async (cfg, label, statusEl) => {
    statusEl.textContent = `Exporting ${label}…`;
    try {
        const records = await idbGetAll(cfg);
        const count   = Object.keys(records).length;
        if (!count) { statusEl.textContent = `${label}: no records to export.`; return; }
        const date = new Date().toISOString().slice(0, 10);
        downloadJson({ version: 1, exportedAt: new Date().toISOString(), players: records }, `tm-${cfg.name.toLowerCase()}-${date}.json`);
        statusEl.textContent = `✓ Exported ${count} player record(s).`;
    } catch (e) {
        statusEl.textContent = `Error: ${e.message}`;
    }
};

// ── Import ────────────────────────────────────────────────────────────────────

const importFromFile = (cfg, label, statusEl) => {
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept = '.json,application/json';
    input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        statusEl.textContent = 'Reading file…';
        try {
            const text    = await file.text();
            const parsed  = JSON.parse(text);
            // Accept either { players: {...} } wrapper or bare { pid: record } flat object
            const records = parsed?.players ?? parsed;
            if (typeof records !== 'object' || Array.isArray(records))
                throw new Error('Invalid format — expected an object keyed by player ID.');
            const validEntries = Object.entries(records).filter(([k]) => /^\d+$/.test(k));
            if (!validEntries.length) throw new Error('No valid numeric player IDs found.');
            statusEl.textContent = `Importing ${validEntries.length} record(s) into ${label}…`;
            const count = await idbPutAll(cfg, Object.fromEntries(validEntries));
            statusEl.textContent = `✓ Imported ${count} player record(s) into ${label}.`;
            refreshSummary(statusEl.closest('section').parentElement);
        } catch (e) {
            statusEl.textContent = `Error: ${e.message}`;
        }
    };
    input.click();
};

// ── Summary ───────────────────────────────────────────────────────────────────

const refreshSummary = async (container) => {
    const el = container.querySelector('#imp-summary');
    if (!el) return;
    el.textContent = 'Counting…';
    try {
        const [active, archived] = await Promise.all([
            idbGetAll(IDB_ACTIVE).then(r => Object.keys(r).length).catch(() => 0),
            idbGetAll(IDB_ARCHIVED).then(r => Object.keys(r).length).catch(() => 0),
        ]);
        el.textContent = `Active DB: ${active} player(s)  ·  Archive DB: ${archived} player(s)`;
    } catch (e) {
        el.textContent = `Could not read DB: ${e.message}`;
    }
};

// ── Page ──────────────────────────────────────────────────────────────────────

export function initImportPage(main) {
    if (!main || !main.isConnected) return;

    main.innerHTML = `
        <section style="padding:24px;display:grid;gap:20px;max-width:640px;">

            <div>
                <h2 style="margin:0 0 6px;">Player DB Import / Export</h2>
                <p id="imp-summary" style="margin:0;color:var(--tmu-text-faint);font-size:var(--tmu-font-sm);">Counting…</p>
            </div>

            <section style="display:grid;gap:10px;">
                <h3 style="margin:0;font-size:var(--tmu-font-sm);text-transform:uppercase;letter-spacing:1px;color:var(--tmu-text-faint);">Active Players (TMPlayerData)</h3>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="tmu-btn tmu-btn-secondary" id="btn-export-active">Export JSON</button>
                    <button class="tmu-btn tmu-btn-secondary" id="btn-import-active">Import JSON</button>
                </div>
                <p id="status-active" style="margin:0;font-size:var(--tmu-font-sm);color:var(--tmu-text-faint);min-height:1.4em;"></p>
            </section>

            <section style="display:grid;gap:10px;">
                <h3 style="margin:0;font-size:var(--tmu-font-sm);text-transform:uppercase;letter-spacing:1px;color:var(--tmu-text-faint);">Archived Players (TMArchivedPlayers)</h3>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="tmu-btn tmu-btn-secondary" id="btn-export-archived">Export JSON</button>
                    <button class="tmu-btn tmu-btn-secondary" id="btn-import-archived">Import JSON</button>
                </div>
                <p id="status-archived" style="margin:0;font-size:var(--tmu-font-sm);color:var(--tmu-text-faint);min-height:1.4em;"></p>
            </section>

        </section>
    `;

    const statusActive   = main.querySelector('#status-active');
    const statusArchived = main.querySelector('#status-archived');

    main.querySelector('#btn-export-active')  .addEventListener('click', () => exportDb(IDB_ACTIVE,   'Active players',   statusActive));
    main.querySelector('#btn-export-archived').addEventListener('click', () => exportDb(IDB_ARCHIVED, 'Archived players', statusArchived));
    main.querySelector('#btn-import-active')  .addEventListener('click', () => importFromFile(IDB_ACTIVE,   'TMPlayerData',     statusActive));
    main.querySelector('#btn-import-archived').addEventListener('click', () => importFromFile(IDB_ARCHIVED, 'TMArchivedPlayers', statusArchived));

    refreshSummary(main);
}
