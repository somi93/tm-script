import { TmImportStyles } from '../components/import/tm-import-styles.js';
import { TmImportSync } from '../components/import/tm-import-sync.js';
import { TmLib } from '../lib/tm-lib.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmPlayerService } from '../services/player.js';
import { TmClubService } from '../services/club.js';
import { TmUtils } from '../lib/tm-utils.js';

(function () {
    'use strict';

console.log('[TM Import] Script loaded 2');
    if (!/^\/history\/club/.test(location.pathname)) return;
console.log('[TM Import] Script loaded 1');
    const $ = window.jQuery;
    if (!$) return;

    const PlayerDB = TmPlayerDB;

    /* ═══════════════════════════════════════════════════════════
       Constants & Calculations
       ═══════════════════════════════════════════════════════════ */
    const getPositionIndex = TmLib.getPositionIndex;

    /* R5 / REC calculation — delegates to TmLib */
    const calculateR5F = TmLib.calcR5;
    const calculateRemaindersF = (posIdx, skills, asi) => ({ rec: TmLib.calcRec(posIdx, skills, asi) });

    const { ageToMonths } = TmUtils;
    const buildRoutineMap = TmLib.buildRoutineMap;

    /* ═══════════════════════════════════════════════════════════
       Fetch helpers
       ═══════════════════════════════════════════════════════════ */
    const fetchTip = (pid) => TmPlayerService.fetchTooltipRaw(pid).then(data => data?.player || null);

    const fetchPlayerInfo = (pid, type) => TmPlayerService.fetchPlayerInfo(pid, type);

    /* Fetch squad data for any club — cached per club_id */
    const clubPostCache = {};
    const fetchClubTraining = (clubId) => {
        clubId = String(clubId);
        if (clubPostCache[clubId]) return Promise.resolve(clubPostCache[clubId]);
        return TmClubService.fetchSquadPost(clubId).then(post => {
            clubPostCache[clubId] = post || {};
            return clubPostCache[clubId];
        });
    };

    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    /* ═══════════════════════════════════════════════════════════
       Import pipeline — delegated to TmImportSync component
       ═══════════════════════════════════════════════════════════ */
    const parseImportFile = TmImportSync.parseImportFile;
    const parseAge = TmImportSync.parseAge;
    const syncPlayer = TmImportSync.syncPlayer;

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
                ({ key: dbSortCol, dir: dbSortDir } = TmUtils.toggleSort(col, dbSortCol, dbSortDir, defaultDir));
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
