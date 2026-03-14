
// ─── components/import/tm-import-styles.js ──────────────────

(function () {
    'use strict';

    window.TmImportStyles = {
        inject() {
            if (document.getElementById('tmi-import-style')) return;
            const style = document.createElement('style');
            style.id = 'tmi-import-style';
            style.textContent = `
/* ── Base ── */
.tmi-page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; font-size: 13px; padding: 12px 14px;
}
.tmi-page h2 { margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #e8f5d8; }

/* ── Wrap container ── */
.tmi-wrap {
    background: #1c3410; border: 1px solid #3d6828; border-radius: 8px;
    overflow: hidden; margin-bottom: 12px;
}
.tmi-wrap-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; background: linear-gradient(180deg, #274a18, #1c3410);
    border-bottom: 1px solid #3d6828;
}
.tmi-wrap-head h2 { margin: 0; font-size: 14px; color: #e8f5d8; font-weight: 700; }
.tmi-wrap-body { padding: 12px 14px; }

/* ── Section title ── */
.tmi-section-title {
    color: #6a9a58; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.6px;
    padding-bottom: 6px; border-bottom: 1px solid #2a4a1c;
    margin-bottom: 8px;
}

/* ── DB player list ── */
.tmi-db-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px;
}
.tmi-db-header h2 { margin: 0; }
.tmi-db-count { font-size: 11px; color: #6a9a58; font-weight: 400; }
.tmi-db-search {
    background: rgba(0,0,0,.25); border: 1px solid rgba(42,74,28,.6);
    border-radius: 4px; padding: 5px 10px; color: #e8f5d8;
    font-size: 12px; font-weight: 600; width: 200px; outline: none;
    transition: border-color 0.15s;
}
.tmi-db-search:focus { border-color: #6cc040; }
.tmi-db-search::placeholder { color: #5a7a48; }
.tmi-db-table {
    width: 100%; border-collapse: collapse; font-size: 11px;
}
.tmi-db-table th {
    text-align: left; padding: 6px 6px; font-size: 10px; font-weight: 700;
    color: #6a9a58; text-transform: uppercase; letter-spacing: 0.4px;
    border-bottom: 1px solid #2a4a1c; white-space: nowrap;
    cursor: pointer; user-select: none;
}
.tmi-db-table th:hover { color: #c8e0b4; }
.tmi-db-table th.sorted { color: #6cc040; }
.tmi-db-table th .sort-arrow { font-size: 9px; margin-left: 2px; }
.tmi-db-table td {
    padding: 5px 6px; border-bottom: 1px solid rgba(42,74,28,.4);
    color: #c8e0b4; font-variant-numeric: tabular-nums; vertical-align: middle;
}
.tmi-db-table tbody tr:nth-child(odd) { background: #1c3410; }
.tmi-db-table tbody tr:nth-child(even) { background: #162e0e; }
.tmi-db-table tbody tr:hover { background: #243d18 !important; }
.tmi-db-table .c { text-align: center; }
.tmi-db-table .r { text-align: right; font-variant-numeric: tabular-nums; }
.tmi-db-table a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmi-db-table a:hover { color: #c8e0b4; text-decoration: underline; }
.tmi-db-table .gk-badge {
    display: inline-block; font-size: 9px; font-weight: 700;
    padding: 1px 6px; border-radius: 3px; letter-spacing: 0.5px;
    background: rgba(245,158,11,.15); color: #f59e0b;
}
.tmi-db-table .pos-cell { color: #8aac72; font-size: 11px; }
.tmi-db-scroll {
    max-height: 70vh; overflow-y: auto;
    border: 1px solid #2a4a1c; border-radius: 6px; background: #162e0e;
}
.tmi-empty {
    text-align: center; color: #5a7a48; padding: 40px 20px;
    font-size: 13px; font-style: italic;
}

/* ── Buttons ── */
.tmi-btn {
    background: rgba(42,74,28,.4); border: 1px solid #2a4a1c;
    border-radius: 6px; padding: 6px 14px;
    font-size: 11px; font-weight: 600; color: #8aac72;
    cursor: pointer; transition: all 0.15s;
    text-transform: uppercase; letter-spacing: 0.4px;
    font-family: inherit;
}
.tmi-btn:hover { background: rgba(42,74,28,.7); color: #c8e0b4; }
.tmi-btn.active { background: #4a9030; border-color: #6cc040; color: #e8f5d8; }
.tmi-sync-btn {
    background: linear-gradient(180deg, #4a9030, #3a7025);
    border: 1px solid #5aa838; border-radius: 6px;
    padding: 8px 20px; font-size: 12px; font-weight: 700;
    color: #e8f5d8; cursor: pointer; transition: all 0.15s;
    text-transform: uppercase; letter-spacing: 0.4px;
    font-family: inherit;
}
.tmi-sync-btn:hover { background: linear-gradient(180deg, #5aa838, #4a9030); color: #fff; }
.tmi-sync-btn:disabled { background: #274a18; border-color: #3d6828; color: #5a7a48; cursor: not-allowed; }

/* ── Collapsible import section ── */
.tmi-import-section { display: none; margin-bottom: 12px; }
.tmi-import-section.open { display: block; }

/* ── File drop zone ── */
.tmi-dropzone {
    border: 2px dashed #3d6828; border-radius: 8px; padding: 24px;
    text-align: center; cursor: pointer; transition: all 0.15s;
    margin-bottom: 12px; color: #6a9a58; background: rgba(42,74,28,.15);
}
.tmi-dropzone:hover, .tmi-dropzone.dragover {
    border-color: #6cc040; background: rgba(42,74,28,.35);
}
.tmi-dropzone-icon { font-size: 24px; margin-bottom: 6px; }
.tmi-dropzone-text { font-size: 13px; color: #8aac72; }
.tmi-dropzone-sub { font-size: 11px; color: #5a7a48; margin-top: 4px; }
.tmi-file-input { display: none; }

/* ── Parsed players table ── */
.tmi-parsed { margin-bottom: 12px; }
.tmi-parsed-header {
    font-weight: 700; color: #80e048; margin-bottom: 8px; font-size: 13px;
}
.tmi-table {
    width: 100%; border-collapse: collapse; font-size: 11px;
}
.tmi-table th {
    text-align: left; padding: 6px 6px; font-size: 10px; font-weight: 700;
    color: #6a9a58; text-transform: uppercase; letter-spacing: 0.4px;
    border-bottom: 1px solid #2a4a1c;
}
.tmi-table td {
    padding: 5px 6px; border-bottom: 1px solid rgba(42,74,28,.4);
    color: #c8e0b4;
}
.tmi-table tbody tr:hover { background: rgba(255,255,255,.03); }
.tmi-table .c { text-align: center; }
.tmi-table .r { text-align: right; }
.tmi-table a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmi-table a:hover { color: #c8e0b4; text-decoration: underline; }
.tmi-table-scroll {
    max-height: 200px; overflow-y: auto;
    border: 1px solid #2a4a1c; border-radius: 6px; background: #162e0e;
}

/* ── Progress ── */
.tmi-progress { margin: 12px 0; }
.tmi-progress-bar-wrap {
    background: #1a2e10; border-radius: 6px; height: 22px; overflow: hidden;
    border: 1px solid #2a4a1c; position: relative; margin-bottom: 6px;
}
.tmi-progress-bar {
    height: 100%; background: linear-gradient(90deg, #3a7025, #6cc040);
    transition: width 0.3s; width: 0%; border-radius: 6px;
}
.tmi-progress-pct {
    position: absolute; inset: 0; display: flex; align-items: center;
    justify-content: center; font-size: 11px; font-weight: 700; color: #e8f5d8;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
.tmi-progress-text { font-size: 12px; color: #6a9a58; }

/* ── Log ── */
.tmi-log {
    background: #162e0e; border: 1px solid #2a4a1c; border-radius: 6px;
    padding: 10px; max-height: 200px; overflow-y: auto; font-family: monospace;
    font-size: 11px; line-height: 1.5; white-space: pre-wrap; color: #8aac72;
    margin-top: 12px;
}
.tmi-log .ok { color: #6cc040; }
.tmi-log .warn { color: #fbbf24; }
.tmi-log .err { color: #f87171; }

/* ── Actions ── */
.tmi-actions {
    display: flex; gap: 10px; margin-top: 12px; align-items: center;
}
.tmi-status { font-size: 12px; color: #6a9a58; }

/* ── Summary ── */
.tmi-summary {
    background: rgba(108,192,64,.08); border: 1px solid #4a9030; border-radius: 6px;
    padding: 12px; margin-top: 12px; color: #80e048; font-weight: 600; font-size: 13px;
}

/* ── Danger button ── */
.tmi-btn-dng { color: #c87848; border-color: rgba(200,120,72,.3); }
.tmi-btn-dng:hover {
    border-color: rgba(248,113,113,.3); color: #f87171;
    background: rgba(248,113,113,.08);
}

/* ── Warning button ── */
.tmi-btn-warn { color: #d4a020; border-color: rgba(251,191,36,.3); }
.tmi-btn-warn:hover {
    border-color: rgba(251,191,36,.5); color: #fbbf24;
    background: rgba(251,191,36,.08);
}

/* ── Bad routine results panel ── */
.tmi-routine-panel {
    margin-bottom: 12px;
}
.tmi-routine-panel .tmi-wrap-body { max-height: 50vh; overflow-y: auto; }
.tmi-routine-cat {
    color: #6a9a58; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.6px;
    padding: 8px 0 4px; border-bottom: 1px solid #2a4a1c;
    margin: 10px 0 6px;
}
.tmi-routine-cat:first-child { margin-top: 0; }
.tmi-routine-cat span { color: #fbbf24; font-size: 12px; margin-left: 6px; }
`;
            document.head.appendChild(style);
        }
    };

})();



// ─── components/import/tm-import-sync.js ────────────────────

/* =============================================================
   TmImportSync — Import pipeline for old-format player JSON
   Shared component for tm-import.user.js

   Exports: window.TmImportSync = { parseImportFile, parseAge, syncPlayer }
   ============================================================= */
(function () {
    'use strict';

    const { ageToMonths } = window.TmUtils;
    const { getPositionIndex, calcR5, calcRec, fillMissingMonths, computeGrowthDecimals, buildRoutineMap } = window.TmLib;

    const calculateR5F = calcR5;
    const calculateRemaindersF = (posIdx, skills, asi) => ({ rec: calcRec(posIdx, skills, asi) });

    /* ─── Parse import file (old R6 format) ─────────────────────
       { "pid": { SI: { "17.3": 7200 }, skills: { "17.3": [10,9,...] } } }
       Returns: [{ pid, records, ageKeys, isGK }]                    */
    const parseImportFile = (json) => {
        const players = [];
        for (const [pid, data] of Object.entries(json)) {
            if (!pid || !/^\d+$/.test(pid)) continue;
            if (!data || !data.SI || !data.skills) continue;

            const allKeys = new Set([
                ...Object.keys(data.SI || {}),
                ...Object.keys(data.skills || {})
            ]);
            const ageKeys = [...allKeys].sort((a, b) => ageToMonths(a) - ageToMonths(b));

            const records = {};
            for (const key of ageKeys) {
                const si = parseInt(data.SI[key]) || 0;
                const rawSkills = data.skills[key] || [];
                const skills = rawSkills.map(v => {
                    const n = typeof v === 'string' ? parseFloat(v) : v;
                    return Math.floor(n);
                });
                if (si > 0 && skills.length > 0) {
                    records[key] = { SI: si, skills };
                }
            }

            const recKeys = Object.keys(records).sort((a, b) => ageToMonths(a) - ageToMonths(b));

            if (recKeys.length > 0) {
                const isGK = records[recKeys[0]].skills.length === 11;
                players.push({ pid, records, ageKeys: recKeys, isGK });
            }
        }
        return players;
    };

    /* ─── Parse age from tooltip ─────────────────────────────────
       Returns: { years, months } or null                           */
    const parseAge = (tip) => {
        if (!tip) return null;
        const m = (tip.age || '').match(/(\d+)\s*(?:years?|y|г|let|Jahr|año|an)?\s*(\d+)/i);
        if (m) return { years: parseInt(m[1]), months: parseInt(m[2]) };
        const ageVal = parseFloat(tip.age);
        if (ageVal > 0) return { years: Math.floor(ageVal), months: Math.round((ageVal % 1) * 12) };
        return null;
    };

    /* ─── Sync a single player — full v3 pipeline ───────────────
       p          : { pid, records, ageKeys, isGK }
       tip        : tooltip API response (player object)
       histData   : history API response
       squadPlayer: squad API player object or null (own players only)
       logFn      : (msg, cls?) → void — caller-provided log function
       Returns: v3Store saved to PlayerDB                           */
    const syncPlayer = async (p, tip, histData, squadPlayer, logFn) => {
        const { pid, records, isGK } = p;
        const PlayerDB = window.TmPlayerDB;

        /* ── Position ── */
        const favpos = tip.favposition || '';
        const firstPos = favpos.split(',')[0].trim();
        const posIdx = isGK ? 9 : getPositionIndex(firstPos);

        /* ── Current age / routine from tooltip ── */
        const curRoutine = parseFloat(tip.routine) || 0;
        const age = parseAge(tip);
        let curAgeTotalMonths = 0;
        if (age) {
            curAgeTotalMonths = age.years * 12 + age.months;
        } else {
            const lastKey = p.ageKeys[p.ageKeys.length - 1];
            const [ly, lm] = lastKey.split('.').map(Number);
            curAgeTotalMonths = ly * 12 + lm + 1;
            logFn(`  ⚠ Could not parse age from tooltip, using fallback ${Math.floor(curAgeTotalMonths / 12)}.${curAgeTotalMonths % 12}`);
        }

        /* ── Build working store with file records ── */
        const store = { records: {} };
        for (const [key, rec] of Object.entries(records)) {
            store.records[key] = { SI: rec.SI, skills: [...rec.skills] };
        }

        /* ── Fill gaps: interpolate missing months ── */
        fillMissingMonths(store.records);

        const ageKeys = Object.keys(store.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));

        /* ── Routine computation from history ── */
        let gpData = null;
        if (histData?.table?.total) {
            const totalRows = histData.table.total
                .map(r => ({ ...r, season: parseInt(r.season) }))
                .filter(r => isFinite(r.season));
            if (totalRows.length > 0) {
                const gpBySeason = {};
                totalRows.forEach(r => { gpBySeason[r.season] = (gpBySeason[r.season] || 0) + (parseInt(r.games) || 0); });
                gpData = { gpBySeason, curSeason: Math.max(...totalRows.map(r => r.season)) };
            }
        }
        const routineMap = buildRoutineMap(
            curRoutine,
            Math.floor(curAgeTotalMonths / 12), curAgeTotalMonths % 12,
            gpData, ageKeys
        );

        /* ── Training weights ── */
        const GRP_COUNT = isGK ? 1 : 6;
        let gw = new Array(GRP_COUNT).fill(1 / GRP_COUNT);

        if (!isGK && squadPlayer) {
            try {
                const STD_FOCUS = { '1': 3, '2': 0, '3': 1, '4': 5, '5': 4, '6': 2 };
                const customStr = squadPlayer.training_custom || '';
                const trainType = String(squadPlayer.training || '3');

                if (customStr.length === 6) {
                    const dots = [];
                    let dtot = 0;
                    for (let i = 0; i < 6; i++) {
                        const d = parseInt(customStr[i]) || 1;
                        dots.push(d); dtot += d;
                    }
                    const sm = 0.5;
                    const den = dtot + 6 * sm;
                    gw = dots.map(d => (d + sm) / den);
                    logFn(`  Training: Custom dots=[${dots.join(',')}]`);
                } else {
                    const fg = STD_FOCUS[trainType] ?? 1;
                    gw = new Array(6).fill(0.125);
                    gw[fg] = 0.375;
                    logFn(`  Training: Standard ${window.TmConst.TRAINING_NAMES[trainType] || trainType}`);
                }
            } catch (e) { /* balanced */ }
        } else if (!isGK) {
            logFn(`  Training: Not in squad, using balanced weights`);
        }

        /* ── Decimal distribution + build v3 store ── */
        const decsByKey = computeGrowthDecimals(store.records, ageKeys, { isGK }, gw);

        const v3Store = { _v: 3, lastSeen: Date.now(), records: {} };
        v3Store.meta = { name: tip.name || '', pos: favpos, isGK };

        for (const ageKey of ageKeys) {
            const rec = store.records[ageKey];
            const intS = rec.skills.map(v => Math.floor(typeof v === 'string' ? parseFloat(v) : v));
            const dec = decsByKey[ageKey];
            const skillsC = intS.map((v, i) => v >= 20 ? 20 : v + (dec[i] || 0));
            const rtn = routineMap[ageKey] ?? null;
            v3Store.records[ageKey] = {
                SI: rec.SI,
                REREC: Number(calculateRemaindersF(posIdx, skillsC, rec.SI).rec),
                R5: Number(calculateR5F(posIdx, skillsC, rec.SI, rtn || 0)),
                skills: skillsC.map(v => Math.round(v * 100) / 100),
                routine: rtn,
                locked: true
            };
        }

        /* ── Merge: preserve existing DB records not in the import file ── */
        const existing = PlayerDB.get(pid);
        if (existing && existing.records) {
            for (const [key, rec] of Object.entries(existing.records)) {
                if (!v3Store.records[key]) {
                    v3Store.records[key] = rec;
                }
            }
            if (existing.graphSync) v3Store.graphSync = true;
        }

        await PlayerDB.set(pid, v3Store);

        const recCount = Object.keys(v3Store.records).length;
        const lastKey = ageKeys[ageKeys.length - 1];
        const lastRec = v3Store.records[lastKey];
        const lastR5 = lastRec ? Number(lastRec.R5).toFixed(2) : '?';
        logFn(`  ✓ Saved ${recCount} records → v3 | Last R5: ${lastR5}`);
        console.log(`%c[Import] ✓ ${pid} — ${tip.name || '?'} — ${recCount} records → v3 | R5=${lastR5}`,
            'font-weight:bold;color:#6cc040');

        return v3Store;
    };

    window.TmImportSync = { parseImportFile, parseAge, syncPlayer };
})();


// ─── tm-import.user.js (guarded: /^\/history/) ─────────────
if (/^\/history/.test(location.pathname)) {

(function () {
    'use strict';

    const $ = window.jQuery;
    if (!$) return;

    const PlayerDB = window.TmPlayerDB;

    /* ═══════════════════════════════════════════════════════════
       Constants & Calculations
       ═══════════════════════════════════════════════════════════ */
    const getPositionIndex = window.TmLib.getPositionIndex;

    /* R5 / REC calculation — delegates to TmLib */
    const calculateR5F = window.TmLib.calcR5;
    const calculateRemaindersF = (posIdx, skills, asi) => ({ rec: window.TmLib.calcRec(posIdx, skills, asi) });

    const { ageToMonths } = window.TmUtils;
    const buildRoutineMap = window.TmLib.buildRoutineMap;

    /* ═══════════════════════════════════════════════════════════
       Fetch helpers
       ═══════════════════════════════════════════════════════════ */
    const fetchTip = (pid) => window.TmApi.fetchTooltipRaw(pid).then(data => data?.player || null);

    const fetchPlayerInfo = (pid, type) => window.TmApi.fetchPlayerInfo(pid, type);

    /* Fetch squad data for any club — cached per club_id */
    const clubPostCache = {};
    const fetchClubTraining = (clubId) => {
        clubId = String(clubId);
        if (clubPostCache[clubId]) return Promise.resolve(clubPostCache[clubId]);
        return window.TmApi.fetchSquadPost(clubId).then(post => {
            clubPostCache[clubId] = post || {};
            return clubPostCache[clubId];
        });
    };

    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    /* ═══════════════════════════════════════════════════════════
       Import pipeline — delegated to TmImportSync component
       ═══════════════════════════════════════════════════════════ */
    const parseImportFile = window.TmImportSync.parseImportFile;
    const parseAge = window.TmImportSync.parseAge;
    const syncPlayer = window.TmImportSync.syncPlayer;

    /* ═══════════════════════════════════════════════════════════
       CSS
       ═══════════════════════════════════════════════════════════ */
    /* ═══════════════════════════════════════════════════════════
       UI — Render directly into .main_center on /history page
       ═══════════════════════════════════════════════════════════ */
    let parsedPlayers = null;
    let isSyncing = false;

    const buildUI = () => {
        TmImportStyles.inject();

        const allMc = document.querySelectorAll('.main_center');
        const mc = allMc[allMc.length - 1];
        if (!mc) return;

        /* Clear existing content inside the existing .main_center */
        mc.innerHTML = '';
        mc.style.display = '';

        mc.innerHTML = `
            <div class="tmi-page">

            <!-- Import / Export toolbar -->
            <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
                <button class="tmi-btn" id="tmi-import-toggle">Import JSON</button>
                <button class="tmi-btn" id="tmi-export-btn">Export JSON</button>
                <button class="tmi-btn tmi-btn-warn" id="tmi-routine-btn">Bad Routine</button>
                <button class="tmi-btn tmi-btn-dng" id="tmi-purge-btn">Purge Retired</button>
            </div>

            <!-- Collapsible import section -->
            <div class="tmi-import-section" id="tmi-import-section">
              <div class="tmi-wrap">
                <div class="tmi-wrap-body">
                <div class="tmi-dropzone" id="tmi-dropzone">
                    <div class="tmi-dropzone-icon">📄</div>
                    <div class="tmi-dropzone-text">Drop JSON file here or click to browse</div>
                    <div class="tmi-dropzone-sub">Accepts old R6 format: { "playerId": { SI, REREC, R5, skills } }</div>
                    <input type="file" accept=".json,.txt" class="tmi-file-input" id="tmi-file-input">
                </div>
                <div id="tmi-parsed-area"></div>
                <div id="tmi-progress-area" style="display:none">
                    <div class="tmi-progress">
                        <div class="tmi-progress-bar-wrap">
                            <div class="tmi-progress-bar" id="tmi-bar"></div>
                            <div class="tmi-progress-pct" id="tmi-pct">0%</div>
                        </div>
                        <div class="tmi-progress-text" id="tmi-progress-text"></div>
                    </div>
                </div>
                <div class="tmi-log" id="tmi-log" style="display:none"></div>
                <div id="tmi-summary-area"></div>
                <div class="tmi-actions" id="tmi-actions" style="display:none">
                    <button class="tmi-sync-btn" id="tmi-sync-btn">Start Sync</button>
                    <span class="tmi-status" id="tmi-status"></span>
                </div>
                </div>
              </div>
            </div>

            <!-- DB player list -->
            <div id="tmi-db-area"></div>
            </div>
        `;

        /* Toggle import section */
        const toggleBtn = mc.querySelector('#tmi-import-toggle');
        const importSection = mc.querySelector('#tmi-import-section');
        toggleBtn.addEventListener('click', () => {
            const isOpen = importSection.classList.toggle('open');
            toggleBtn.textContent = isOpen ? '▼ Import JSON' : 'Import JSON';
            if (isOpen) toggleBtn.classList.add('active');
            else toggleBtn.classList.remove('active');
        });

        /* File input */
        const dropzone = mc.querySelector('#tmi-dropzone');
        const fileInput = mc.querySelector('#tmi-file-input');
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
        });
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleFile(e.target.files[0]);
        });

        /* Sync button */
        mc.querySelector('#tmi-sync-btn').addEventListener('click', startSync);

        /* Export */
        mc.querySelector('#tmi-export-btn').addEventListener('click', exportDB);

        /* Purge retired */
        mc.querySelector('#tmi-purge-btn').addEventListener('click', purgeRetired);

        /* Bad routine */
        mc.querySelector('#tmi-routine-btn').addEventListener('click', showBadRoutine);

        /* Render DB player list */
        renderDBList();
    };

    /* ═══════════════════════════════════════════════════════════
       Export DB → JSON file download
       ═══════════════════════════════════════════════════════════ */
    const exportDB = () => {
        const pids = PlayerDB.allPids();
        if (pids.length === 0) { alert('Database is empty — nothing to export.'); return; }

        const dump = {};
        for (const pid of pids) {
            dump[pid] = PlayerDB.get(pid);
        }

        const json = JSON.stringify(dump, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tm-playerdb-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    /* ═══════════════════════════════════════════════════════════
       Purge retired players from IndexedDB
       ═══════════════════════════════════════════════════════════ */
    const purgeRetired = async () => {
        const pids = PlayerDB.allPids();
        if (pids.length === 0) { alert('Database is empty.'); return; }
        if (!confirm(`Check ${pids.length} players via tooltip and remove retired ones?`)) return;

        const purgeBtn = document.getElementById('tmi-purge-btn');
        if (purgeBtn) { purgeBtn.disabled = true; purgeBtn.textContent = 'Checking…'; }

        const retired = [];
        let checked = 0;

        for (const pid of pids) {
            checked++;
            if (purgeBtn) purgeBtn.textContent = `${checked}/${pids.length} (${retired.length} retired)`;

            try {
                const tip = await fetchTip(pid);
                await delay(80);

                /* Retired player → tooltip has club: null */
                if (!tip || !tip.club_id) {
                    retired.push({ pid, name: (tip && tip.name) || `#${pid}` });
                }
            } catch (e) {
                console.warn(`[Import] purge check failed for ${pid}:`, e);
            }
        }

        if (retired.length === 0) {
            alert('No retired players found.');
            if (purgeBtn) { purgeBtn.disabled = false; purgeBtn.textContent = 'Purge Retired'; }
            return;
        }

        const names = retired.map(r => `${r.name} (${r.pid})`).join('\n');
        if (!confirm(`Found ${retired.length} retired player(s). Remove them from DB?\n\n${names}`)) {
            if (purgeBtn) { purgeBtn.disabled = false; purgeBtn.textContent = 'Purge Retired'; }
            return;
        }

        for (const r of retired) {
            await PlayerDB.remove(r.pid);
        }

        console.log(`%c[Import] Purged ${retired.length} retired player(s): ${retired.map(r => r.pid).join(', ')}`,
            'font-weight:bold;color:#f87171');

        if (purgeBtn) { purgeBtn.disabled = false; purgeBtn.textContent = 'Purge Retired'; }
        renderDBList();
        alert(`Removed ${retired.length} retired player(s) from database.`);
    };

    /* ═══════════════════════════════════════════════════════════
       Show players with bad routine data
       ═══════════════════════════════════════════════════════════ */
    const showBadRoutine = async () => {
        const pids = PlayerDB.allPids();
        if (pids.length === 0) { alert('Database is empty.'); return; }

        /* Toggle: if panel already shown, remove it and return */
        const existing = document.getElementById('tmi-routine-panel');
        if (existing) { existing.remove(); return; }

        const routineBtn = document.getElementById('tmi-routine-btn');
        const allZeroCandidates = [];  /* players where every routine is 0 or null */
        const bigJumps = [];           /* players with routine jump > 3 between consecutive records */

        for (const pid of pids) {
            const store = PlayerDB.get(pid);
            if (!store || !store.records) continue;
            const meta = store.meta || {};
            const name = meta.name || `#${pid}`;

            const recKeys = Object.keys(store.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));
            if (recKeys.length === 0) continue;

            /* Check all-zero routine */
            const routines = recKeys.map(k => store.records[k].routine);
            const allNull = routines.every(r => r == null || r === 0);
            if (allNull && recKeys.length > 1) {
                allZeroCandidates.push({ pid, name, records: recKeys.length });
            }

            /* Check jumps > 3 between consecutive records */
            const jumps = [];
            for (let i = 1; i < recKeys.length; i++) {
                const prevR = store.records[recKeys[i - 1]].routine;
                const currR = store.records[recKeys[i]].routine;
                if (prevR == null || currR == null) continue;
                const diff = Math.abs(currR - prevR);
                if (diff > 3) {
                    jumps.push({
                        from: recKeys[i - 1], to: recKeys[i],
                        prevR: prevR.toFixed(1), currR: currR.toFixed(1),
                        diff: diff.toFixed(1)
                    });
                }
            }
            if (jumps.length > 0) {
                bigJumps.push({ pid, name, jumps });
            }
        }

        /* For all-zero candidates: fetch history to check if they actually have games */
        const allZero = [];
        if (allZeroCandidates.length > 0) {
            if (routineBtn) { routineBtn.disabled = true; routineBtn.textContent = 'Checking 0s…'; }
            for (let i = 0; i < allZeroCandidates.length; i++) {
                const p = allZeroCandidates[i];
                if (routineBtn) routineBtn.textContent = `Checking ${i + 1}/${allZeroCandidates.length}…`;
                try {
                    const histData = await fetchPlayerInfo(p.pid, 'history');
                    await delay(80);
                    let totalGames = 0;
                    if (histData && histData.table && histData.table.total) {
                        histData.table.total.forEach(r => {
                            totalGames += parseInt(r.games) || 0;
                        });
                    }
                    if (totalGames > 0) {
                        /* Has games but routine=0 → bad, needs fix */
                        allZero.push({ pid: p.pid, name: p.name, records: p.records, games: totalGames });
                    }
                    /* totalGames === 0 → legit zero routine, skip */
                } catch (e) {
                    /* fetch failed, include to be safe */
                    allZero.push({ pid: p.pid, name: p.name, records: p.records, games: '?' });
                }
            }
            if (routineBtn) { routineBtn.disabled = false; routineBtn.textContent = 'Bad Routine'; }
        }

        /* Render results into tmi-db-area (above the table) */
        const area = document.getElementById('tmi-db-area');
        if (!area) return;

        if (allZero.length === 0 && bigJumps.length === 0) {
            alert('No routine issues found.');
            return;
        }

        /* Collect unique PIDs for fix */
        const badPidSet = new Set();
        allZero.forEach(p => badPidSet.add(p.pid));
        bigJumps.forEach(p => badPidSet.add(p.pid));
        const badPids = [...badPidSet];

        let html = '<div id="tmi-routine-panel" class="tmi-routine-panel"><div class="tmi-wrap"><div class="tmi-wrap-head"><h2>Routine Issues</h2><button class="tmi-sync-btn" id="tmi-fix-routine-btn" style="padding:5px 14px;font-size:11px">Fix Routine (' + badPids.length + ')</button></div><div class="tmi-wrap-body">';

        if (allZero.length > 0) {
            html += `<div class="tmi-routine-cat">Routine = 0 but has games <span>${allZero.length}</span></div>`;
            html += '<table class="tmi-db-table"><thead><tr><th>Name</th><th class="c">Records</th><th class="c">Games</th></tr></thead><tbody>';
            for (const p of allZero) {
                html += `<tr><td><a href="https://trophymanager.com/players/${p.pid}/" target="_blank">${p.name}</a></td><td class="c">${p.records}</td><td class="c">${p.games}</td></tr>`;
            }
            html += '</tbody></table>';
        }

        if (bigJumps.length > 0) {
            html += `<div class="tmi-routine-cat">Routine jump &gt; 3 <span>${bigJumps.length}</span></div>`;
            html += '<table class="tmi-db-table"><thead><tr><th>Name</th><th>Age</th><th class="r">From</th><th class="r">To</th><th class="r">Δ</th></tr></thead><tbody>';
            for (const p of bigJumps) {
                for (let j = 0; j < p.jumps.length; j++) {
                    const jmp = p.jumps[j];
                    html += `<tr>
                        <td>${j === 0 ? `<a href="https://trophymanager.com/players/${p.pid}/" target="_blank">${p.name}</a>` : ''}</td>
                        <td>${jmp.from} → ${jmp.to}</td>
                        <td class="r">${jmp.prevR}</td>
                        <td class="r">${jmp.currR}</td>
                        <td class="r" style="color:#fbbf24;font-weight:700">${jmp.diff}</td>
                    </tr>`;
                }
            }
            html += '</tbody></table>';
        }

        html += '</div></div></div>';

        area.insertAdjacentHTML('afterbegin', html);

        /* Wire up Fix button */
        const fixBtn = document.getElementById('tmi-fix-routine-btn');
        if (fixBtn) fixBtn.addEventListener('click', () => fixBadRoutine(badPids));
    };

    /* ═══════════════════════════════════════════════════════════
       Fix routine — re-fetch history & recompute for bad players
       ═══════════════════════════════════════════════════════════ */
    const fixBadRoutine = async (pids) => {
        if (!pids || pids.length === 0) return;

        const fixBtn = document.getElementById('tmi-fix-routine-btn');
        if (fixBtn) { fixBtn.disabled = true; fixBtn.textContent = 'Fixing…'; }

        let fixed = 0, failed = 0;

        for (let i = 0; i < pids.length; i++) {
            const pid = pids[i];
            if (fixBtn) fixBtn.textContent = `${i + 1}/${pids.length} fixing…`;

            try {
                const store = PlayerDB.get(pid);
                if (!store || !store.records) { failed++; continue; }

                const meta = store.meta || {};
                const isGK = !!meta.isGK;
                const favpos = meta.pos || '';
                const firstPos = favpos.split(',')[0].trim();
                const posIdx = isGK ? 9 : getPositionIndex(firstPos);

                /* Re-fetch tooltip for current routine + age */
                const tip = await fetchTip(pid);
                await delay(80);
                if (!tip) { failed++; continue; }

                const curRoutine = parseFloat(tip.routine) || 0;
                const age = parseAge(tip);
                let curAgeTotalMonths = 0;
                if (age) {
                    curAgeTotalMonths = age.years * 12 + age.months;
                } else {
                    const recKeys = Object.keys(store.records);
                    const lastKey = recKeys.sort((a, b) => ageToMonths(b) - ageToMonths(a))[0];
                    const [ly, lm] = lastKey.split('.').map(Number);
                    curAgeTotalMonths = ly * 12 + lm + 1;
                }

                /* Re-fetch history for games per season */
                const histData = await fetchPlayerInfo(pid, 'history');
                await delay(80);

                /* Recompute routine map */
                const recKeys = Object.keys(store.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));
                let gpData = null;
                if (histData?.table?.total) {
                    const totalRows = histData.table.total
                        .map(r => ({ ...r, season: parseInt(r.season) }))
                        .filter(r => isFinite(r.season));
                    if (totalRows.length > 0) {
                        const gpBySeason = {};
                        totalRows.forEach(r => { gpBySeason[r.season] = (gpBySeason[r.season] || 0) + (parseInt(r.games) || 0); });
                        gpData = { gpBySeason, curSeason: Math.max(...totalRows.map(r => r.season)) };
                    }
                }
                const routineMap = buildRoutineMap(
                    curRoutine,
                    Math.floor(curAgeTotalMonths / 12), curAgeTotalMonths % 12,
                    gpData, recKeys
                );

                /* Update each record's routine, R5, REREC */
                for (const ageKey of recKeys) {
                    const rec = store.records[ageKey];
                    const rtn = routineMap[ageKey] ?? curRoutine;
                    rec.routine = rtn;
                    rec.REREC = Number(calculateRemaindersF(posIdx, rec.skills, rec.SI).rec);
                    rec.R5 = Number(calculateR5F(posIdx, rec.skills, rec.SI, rtn));
                }

                await PlayerDB.set(pid, store);
                fixed++;
                console.log(`[Import] Fixed routine for ${meta.name || pid}`);

            } catch (e) {
                console.warn(`[Import] Fix routine failed for ${pid}:`, e);
                failed++;
            }

            await delay(50);
        }

        if (fixBtn) { fixBtn.disabled = false; fixBtn.textContent = `Done (${fixed} fixed)`; }

        /* Remove panel and refresh */
        const panel = document.getElementById('tmi-routine-panel');
        if (panel) panel.remove();
        renderDBList();

        console.log(`%c[Import] Routine fix: ${fixed} fixed, ${failed} failed`,
            'font-weight:bold;color:#6cc040');
    };

    /* ═══════════════════════════════════════════════════════════
       DB Player List — sortable, searchable
       ═══════════════════════════════════════════════════════════ */
    let dbSortCol = 'name';
    let dbSortDir = 1;  // 1 = asc, -1 = desc

    const renderDBList = () => {
        const area = document.getElementById('tmi-db-area');
        if (!area) return;

        const pids = PlayerDB.allPids();
        const players = [];
        for (const pid of pids) {
            const store = PlayerDB.get(pid);
            if (!store) continue;
            const meta = store.meta || {};
            const recKeys = Object.keys(store.records || {}).sort((a, b) => ageToMonths(a) - ageToMonths(b));
            const first = recKeys[0] || '—';
            const last = recKeys[recKeys.length - 1] || '—';
            const lastRec = recKeys.length > 0 ? store.records[recKeys[recKeys.length - 1]] : null;
            const lastR5 = lastRec ? (Number(lastRec.R5) || 0) : 0;
            const lastREREC = lastRec ? (Number(lastRec.REREC) || 0) : 0;
            const lastSI = lastRec ? (Number(lastRec.SI) || 0) : 0;
            const routine = lastRec && lastRec.routine != null ? Number(lastRec.routine) : null;
            players.push({
                pid, name: meta.name || `#${pid}`, pos: meta.pos || '?',
                isGK: !!meta.isGK, records: recKeys.length,
                first, last, lastR5, lastREREC, lastSI, routine
            });
        }

        if (players.length === 0) {
            area.innerHTML = '<div class="tmi-empty">No players in database yet. Import a JSON file to get started.</div>';
            return;
        }

        /* Sort */
        const cmp = (a, b) => {
            let va, vb;
            switch (dbSortCol) {
                case 'name': va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
                case 'pos': va = a.pos; vb = b.pos; break;
                case 'records': va = a.records; vb = b.records; break;
                case 'r5': va = a.lastR5; vb = b.lastR5; break;
                case 'rec': va = a.lastREREC; vb = b.lastREREC; break;
                case 'si': va = a.lastSI; vb = b.lastSI; break;
                case 'routine': va = a.routine ?? -1; vb = b.routine ?? -1; break;
                case 'last': va = ageToMonths(a.last || '0.0'); vb = ageToMonths(b.last || '0.0'); break;
                default: va = a.name.toLowerCase(); vb = b.name.toLowerCase();
            }
            if (va < vb) return dbSortDir * -1;
            if (va > vb) return dbSortDir * 1;
            return 0;
        };
        players.sort(cmp);

        const arrow = (col) => dbSortCol === col ? `<span class="sort-arrow">${dbSortDir === 1 ? '▲' : '▼'}</span>` : '';

        let html = `
            <div class="tmi-wrap">
            <div class="tmi-wrap-head">
                <h2>Player Database <span class="tmi-db-count">(${players.length})</span></h2>
                <input type="text" class="tmi-db-search" id="tmi-db-search" placeholder="Search name or ID…">
            </div>
            <div class="tmi-db-scroll">
            <table class="tmi-db-table" id="tmi-db-table">
                <thead><tr>
                    <th data-col="name">Name${arrow('name')}</th>
                    <th data-col="pos">Pos${arrow('pos')}</th>
                    <th data-col="records" class="c">Rec${arrow('records')}</th>
                    <th data-col="last">Last Age${arrow('last')}</th>
                    <th data-col="si" class="r">SI${arrow('si')}</th>
                    <th data-col="r5" class="r">R5${arrow('r5')}</th>
                    <th data-col="rec" class="r">REC${arrow('rec')}</th>
                    <th data-col="routine" class="r">Rtn${arrow('routine')}</th>
                </tr></thead>
                <tbody id="tmi-db-tbody">`;

        for (const p of players) {
            html += `<tr data-search="${p.name.toLowerCase()} ${p.pid}">
                <td><a href="https://trophymanager.com/players/${p.pid}/" target="_blank">${p.name}</a></td>
                <td class="pos-cell">${p.isGK ? '<span class="gk-badge">GK</span>' : p.pos}</td>
                <td class="c">${p.records}</td>
                <td>${p.last}</td>
                <td class="r">${p.lastSI > 0 ? p.lastSI.toLocaleString() : '—'}</td>
                <td class="r">${p.lastR5 > 0 ? p.lastR5.toFixed(2) : '—'}</td>
                <td class="r">${p.lastREREC > 0 ? p.lastREREC.toFixed(2) : '—'}</td>
                <td class="r">${p.routine != null ? p.routine.toFixed(1) : '—'}</td>
            </tr>`;
        }

        html += '</tbody></table></div></div>';
        area.innerHTML = html;

        /* Sort click handlers */
        area.querySelectorAll('.tmi-db-table th[data-col]').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.dataset.col;
                const defaultDir = (col === 'name' || col === 'pos') ? 1 : -1;
                ({ key: dbSortCol, dir: dbSortDir } = window.TmUtils.toggleSort(col, dbSortCol, dbSortDir, defaultDir));
                renderDBList();
            });
        });

        /* Search */
        const searchInput = area.querySelector('#tmi-db-search');
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.toLowerCase();
            area.querySelectorAll('#tmi-db-tbody tr').forEach(tr => {
                tr.style.display = tr.dataset.search.includes(q) ? '' : 'none';
            });
        });
    };

    /* ═══════════════════════════════════════════════════════════
       File handling
       ═══════════════════════════════════════════════════════════ */
    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                parsedPlayers = parseImportFile(json);
                if (parsedPlayers.length === 0) {
                    showParsed('<div style="color:#f87171;font-weight:600">No valid players found in file</div>');
                    return;
                }
                displayParsed(parsedPlayers, file.name);
            } catch (err) {
                showParsed(`<div style="color:#f87171;font-weight:600">Parse error: ${err.message}</div>`);
            }
        };
        reader.readAsText(file);
    };

    const showParsed = (html) => {
        const area = document.getElementById('tmi-parsed-area');
        if (area) area.innerHTML = html;
    };

    const displayParsed = (players, filename) => {
        const totalRecs = players.reduce((s, p) => s + p.ageKeys.length, 0);
        const dbCount = players.filter(p => PlayerDB.get(p.pid)).length;

        let html = `
            <div class="tmi-parsed">
                <div class="tmi-parsed-header">
                    Parsed ${players.length} players, ${totalRecs} records from ${filename}
                    ${dbCount > 0 ? `<span style="color:#fbbf24;font-weight:400;font-size:12px"> — ${dbCount} already in DB</span>` : ''}
                </div>
                <div class="tmi-table-scroll">
                    <table class="tmi-table">
                        <thead><tr>
                            <th>#</th>
                            <th>Player ID</th>
                            <th class="c">Records</th>
                            <th class="c">GK</th>
                            <th>Age Range</th>
                            <th class="c">In DB</th>
                        </tr></thead>
                        <tbody>`;

        players.forEach((p, i) => {
            const first = p.ageKeys[0];
            const last = p.ageKeys[p.ageKeys.length - 1];
            const range = first === last ? first : `${first} → ${last}`;
            const inDB = PlayerDB.get(p.pid) ? '✓' : '—';
            html += `<tr>
                <td class="c">${i + 1}</td>
                <td><a href="https://trophymanager.com/players/${p.pid}/" target="_blank">${p.pid}</a></td>
                <td class="c">${p.ageKeys.length}</td>
                <td class="c">${p.isGK ? '🧤' : ''}</td>
                <td>${range}</td>
                <td class="c">${inDB}</td>
            </tr>`;
        });

        html += `</tbody></table></div></div>`;
        showParsed(html);

        /* Show sync button */
        const actions = document.getElementById('tmi-actions');
        if (actions) actions.style.display = 'flex';
    };

    /* ═══════════════════════════════════════════════════════════
       Sync orchestrator
       ═══════════════════════════════════════════════════════════ */
    const startSync = async () => {
        if (!parsedPlayers || parsedPlayers.length === 0 || isSyncing) return;
        isSyncing = true;

        const syncBtn = document.getElementById('tmi-sync-btn');
        const statusEl = document.getElementById('tmi-status');
        const progressArea = document.getElementById('tmi-progress-area');
        const barEl = document.getElementById('tmi-bar');
        const pctEl = document.getElementById('tmi-pct');
        const progressText = document.getElementById('tmi-progress-text');
        const logEl = document.getElementById('tmi-log');
        const summaryArea = document.getElementById('tmi-summary-area');

        if (syncBtn) syncBtn.disabled = true;
        if (progressArea) progressArea.style.display = 'block';
        if (logEl) { logEl.style.display = 'block'; logEl.innerHTML = ''; }
        if (summaryArea) summaryArea.innerHTML = '';

        const logFn = (msg, cls) => {
            if (!logEl) return;
            const span = document.createElement('span');
            if (cls) span.className = cls;
            span.textContent = msg + '\n';
            logEl.appendChild(span);
            logEl.scrollTop = logEl.scrollHeight;
        };

        const updateProgress = (idx, total, text) => {
            const pct = Math.round(((idx + 1) / total) * 100);
            if (barEl) barEl.style.width = pct + '%';
            if (pctEl) pctEl.textContent = pct + '%';
            if (progressText) progressText.textContent = text;
        };

        let successCount = 0;
        let failCount = 0;
        const players = parsedPlayers;

        logFn(`Starting sync for ${players.length} players...`, 'ok');
        console.log(`%c[Import] ═══ Starting sync for ${players.length} players ═══`, 'font-weight:bold;color:#38bdf8');

        for (let i = 0; i < players.length; i++) {
            const p = players[i];
            updateProgress(i, players.length, `Player ${i + 1}/${players.length} — #${p.pid} — Fetching tooltip...`);

            try {
                /* Step 1: Fetch tooltip */
                const tip = await fetchTip(p.pid);
                await delay(80);

                if (!tip) {
                    logFn(`✗ #${p.pid} — tooltip failed, skipping`, 'err');
                    failCount++;
                    continue;
                }

                const playerName = tip.name || `#${p.pid}`;
                logFn(`── ${playerName} (#${p.pid}) ──`);
                updateProgress(i, players.length, `Player ${i + 1}/${players.length} — ${playerName} — Fetching history...`);

                /* Step 2: Fetch history */
                const histData = await fetchPlayerInfo(p.pid, 'history');
                await delay(80);

                /* Step 3: Fetch training via player's club (cached per club) */
                let squadPlayer = null;
                const playerClubId = tip.club_id;
                if (playerClubId) {
                    updateProgress(i, players.length, `Player ${i + 1}/${players.length} — ${playerName} — Fetching club training...`);
                    const clubPost = await fetchClubTraining(playerClubId);
                    squadPlayer = clubPost[String(p.pid)] || null;
                    if (!squadPlayer) logFn(`  ⚠ Player not found in club ${playerClubId} squad data`);
                } else {
                    logFn(`  ⚠ No club_id in tooltip, using balanced training weights`);
                }

                updateProgress(i, players.length, `Player ${i + 1}/${players.length} — ${playerName} — Computing...`);

                /* Step 4: Sync */
                await syncPlayer(p, tip, histData, squadPlayer, logFn);
                successCount++;

            } catch (err) {
                logFn(`✗ #${p.pid} — error: ${err.message}`, 'err');
                console.warn(`[Import] Error syncing player ${p.pid}:`, err);
                failCount++;
            }

            await delay(50);
        }

        /* Done */
        updateProgress(players.length - 1, players.length, 'Complete!');
        if (barEl) barEl.style.width = '100%';
        if (pctEl) pctEl.textContent = '100%';

        logFn('');
        logFn(`═══ Sync complete: ${successCount} OK, ${failCount} failed ═══`, successCount > 0 ? 'ok' : 'warn');
        console.log(`%c[Import] ═══ Sync complete: ${successCount} OK, ${failCount} failed ═══`,
            'font-weight:bold;color:#6cc040');

        if (summaryArea) {
            summaryArea.innerHTML = `
                <div class="tmi-summary">
                    ✓ Synced ${successCount} player(s) to IndexedDB v3
                    ${failCount > 0 ? `<span style="color:#fbbf24"> — ${failCount} failed</span>` : ''}
                </div>
            `;
        }

        if (syncBtn) syncBtn.disabled = false;
        if (statusEl) statusEl.textContent = '';
        isSyncing = false;

        /* Refresh DB player list */
        renderDBList();
    };

    /* ═══════════════════════════════════════════════════════════
       Init
       ═══════════════════════════════════════════════════════════ */
    PlayerDB.init().then(() => {
        buildUI();
        console.log('[Import] History page ready — DB loaded');
    }).catch(e => {
        console.warn('[Import] DB init failed:', e);
    });

})();
}
