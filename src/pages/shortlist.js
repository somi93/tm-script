import { TmUI } from '../components/shared/tm-ui.js';
import { TmPlayersTable } from '../components/shared/tm-players-table.js';
import { TmBidsDialog } from '../components/bids/tm-bids-dialog.js';
import { TmPlayerTooltip } from '../components/player/tooltip/tm-player-tooltip.js';
import { TmPlayerModel, refreshPlayerSkills } from '../models/player.js';
import { runSyncPipeline } from '../workflows/player-history/sync-pipeline.js';
import { purgeRetiredPlayers } from '../workflows/purge-retired.js';
import { TmShortlistTable } from '../components/shortlist/tm-shortlist-table.js';
import { TmShortlistFilters } from '../components/shortlist/tm-shortlist-filters.js';
import { TmShortlistModel } from '../models/shortlist.js';
import { TmUtils } from '../lib/tm-utils.js';
import { SKILL_DEFS_OUT, SKILL_DEFS_GK } from '../constants/skills.js';
import { POSITION_MAP } from '../constants/player.js';
import { applyPlayerPositionRatings } from '../utils/normalize/player.js';

'use strict';

function fmtLastSeen(ts) {
    if (!ts) return '—';
    const days = Math.floor((Date.now() - ts) / 86400000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 14) return `${days}d ago`;
    if (days < 60) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

// ── Convert a DB store entry to the standard player model ──────────────
function dbRecordToPlayer(pid, dbStore) {
    if (!dbStore?.records) return null;
    const keys = Object.keys(dbStore.records).sort((a, b) => {
        const [ay, am] = a.split('.').map(Number);
        const [by, bm] = b.split('.').map(Number);
        return (ay * 12 + am) - (by * 12 + bm);
    });
    if (!keys.length) return null;
    const lastKey = keys[keys.length - 1];
    const [ky, km] = lastKey.split('.').map(Number);
    const weeksSince = (Date.now() - (dbStore.lastSeen || 0)) / 604800000;
    const addMonths = Math.floor(weeksSince);
    const totalM = km + addMonths;
    const newYears = ky + Math.floor(totalM / 12);
    const newMonth = totalM % 12;
    const dbRec = dbStore.records[lastKey] || {};
    const meta = dbStore.meta || {};
    const isGK = !!meta.isGK;
    const favPos = meta.pos || 'mc';
    const skillDefs = isGK ? SKILL_DEFS_GK : SKILL_DEFS_OUT;
    const rawSkills = dbRec.skills || [];
    const skills = skillDefs.map((def, i) => ({ ...def, value: Number(rawSkills[i]) || 0 }));
    const asi = dbRec.ASI || dbRec.SI || 0;
    const routine = dbRec.routine || 0;
    const preferredKeys = new Set(
        String(favPos).split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    );
    const positions = Object.entries(POSITION_MAP)
        .filter(([, p]) => p.main && (isGK ? p.position === 'GK' : p.position !== 'GK'))
        .map(([key, p]) => ({ ...p, key, r5: null, rec: null, preferred: preferredKeys.has(key) }));
    const player = { skills, asi, routine, isGK, positions };
    applyPlayerPositionRatings(player);
    return {
        id: String(pid),
        name: meta.name || '',
        country: meta.country || '',
        positions: player.positions,
        isGK,
        age: newYears,
        month: newMonth,
        ageMonthsString: `${newYears}.${newMonth}`,
        asi,
        r5: player.r5,
        rec: player.rec,
        ti: dbRec.TI ?? null,
        routine,
        wage: 0,
        skills,
        timeleft: 0,
        timeleft_string: '',
        curbid: '',
        lastSeen: dbStore.lastSeen || 0,
        stale: weeksSince >= 1,
    };
}

// ── Load all entries from TMPlayerData IndexedDB ───────────────────────
function loadAllFromDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('TMPlayerData', 1);
        req.onupgradeneeded = e => {
            const d = e.target.result;
            if (!d.objectStoreNames.contains('players')) d.createObjectStore('players');
        };
        req.onsuccess = e => {
            const db = e.target.result;
            const tx = db.transaction('players', 'readonly');
            const store = tx.objectStore('players');
            const reqAll = store.getAll();
            const reqKeys = store.getAllKeys();
            tx.oncomplete = () => {
                const result = {};
                for (let i = 0; i < reqKeys.result.length; i++)
                    result[String(reqKeys.result[i])] = reqAll.result[i];
                resolve(result);
            };
            tx.onerror = () => resolve({});
        };
        req.onerror = () => resolve({});
    });
}

export function initShortlistPage(main) {
    if (!main || !main.isConnected) return;
    const initialEntries = window.players_ar;
    if (!Array.isArray(initialEntries) || !initialEntries.length) return;

    main.classList.add('tmvu-shortlist-page', 'tmu-page-density-regular');
    TmShortlistTable.injectCSS();

    // Preserve bid/note fields from raw TM data — not available from tooltip API
    const bidFieldsById = new Map(initialEntries.map(entry => [String(entry.id), {
        timeleft: Math.max(0, Number(entry.time) || 0),
        timeleft_string: String(entry.timeleft_string || ''),
        curbid: String(entry.curbid || ''),
        note: entry.txt || entry.note || null,
    }]));

    const DISCOVERY_ROUNDS = 5;

    // ── Shortlist tab state ────────────────────────────────────────────
    let allPlayers = [];
    let done = 0;
    let total = initialEntries.length;
    let discovering = true;
    let sortCol = 'timeleft', sortDir = 1;
    let page = 0;
    const PAGE_SIZE = 50;

    // ── Database tab state ─────────────────────────────────────────────
    let indexedPlayers = null;
    let indexedLoading = false;
    const ixReloading = new Set(); // pids currently being reloaded
    let ixPurging = false;
    let ixPurgeProgress = null; // {done, total, archived}
    let ixSortCol = 'r5', ixSortDir = -1;
    let ixPage = 0;
    const IX_PAGE_SIZE = 50;

    // ── Shared state ───────────────────────────────────────────────────
    let activeTab = 'shortlist';
    let filterState = {
        fName: '',
        fPos: new Set(), fSide: new Set(),
        fAgeMin: 0, fAgeMax: 99,
        fR5Min: '', fR5Max: '', fRecMin: '', fRecMax: '', fTiMin: '', fTiMax: '',
    };
    let _renderPending = false;

    // ── Panel root ─────────────────────────────────────────────────────
    const panel = document.createElement('div');
    panel.id = 'tmsl-panel';
    panel.className = 'tmu-panel-page';
    main.appendChild(panel);

    // ── Helpers ────────────────────────────────────────────────────────
    function getSlFiltered() {
        const f = allPlayers.filter(p => TmShortlistFilters.playerMatchesFilters(p, filterState));
        f.sort((a, b) => {
            if (sortCol === 'timeleft') {
                const va = a.timeleft > 0 ? a.timeleft : 999999999;
                const vb = b.timeleft > 0 ? b.timeleft : 999999999;
                return sortDir * (va - vb);
            }
            if (sortCol === 'name') return sortDir * String(a.name || '').localeCompare(String(b.name || ''));
            return sortDir * ((a[sortCol] ?? -Infinity) - (b[sortCol] ?? -Infinity));
        });
        return f;
    }

    function getIxFiltered() {
        if (!indexedPlayers) return null;
        const f = indexedPlayers.filter(p => TmShortlistFilters.playerMatchesFilters(p, filterState));
        f.sort((a, b) => {
            if (ixSortCol === 'name') return ixSortDir * String(a.name || '').localeCompare(String(b.name || ''));
            return ixSortDir * ((a[ixSortCol] ?? -Infinity) - (b[ixSortCol] ?? -Infinity));
        });
        return f;
    }

    function scheduleRender() {
        if (_renderPending) return;
        _renderPending = true;
        requestAnimationFrame(() => { _renderPending = false; render(); });
    }

    // ── Database tab loader ────────────────────────────────────────────
    async function loadIndexedTab() {
        if (indexedLoading) return;
        indexedLoading = true;
        scheduleRender();
        try {
            const allStores = await loadAllFromDB();
            indexedPlayers = Object.entries(allStores)
                .map(([pid, store]) => dbRecordToPlayer(pid, store))
                .filter(Boolean);
        } catch {
            indexedPlayers = [];
        }
        indexedLoading = false;
        scheduleRender();
    }

    // ── Render ─────────────────────────────────────────────────────────
    function setPanelHTML(h) {
        const nameInput = panel.querySelector('#tmsl-name');
        const nameFocused = nameInput && document.activeElement === nameInput;
        const nameSelStart = nameFocused ? nameInput.selectionStart : null;
        const nameSelEnd   = nameFocused ? nameInput.selectionEnd   : null;
        panel.innerHTML = h;
        if (nameFocused) {
            const restored = panel.querySelector('#tmsl-name');
            if (restored) {
                restored.focus();
                try { restored.setSelectionRange(nameSelStart, nameSelEnd); } catch {}
            }
        }
    }

    function mountTable(players, opts) {
        const tmp = document.createElement('div');
        TmPlayersTable.mount(tmp, players, opts);
        const slot = panel.querySelector('#tmsl-table-slot');
        if (slot && tmp.firstChild) slot.replaceWith(tmp.firstChild);
    }

    function renderPagination(currentPage, totalPages, count, idPrev, idNext) {
        if (totalPages <= 1) return '';
        const from = currentPage * PAGE_SIZE + 1;
        const to = Math.min((currentPage + 1) * PAGE_SIZE, count);
        return '<div class="tmsl-pagination">'
            + TmUI.button({ id: idPrev, label: '← Prev', color: 'secondary', size: 'xs', disabled: currentPage === 0 }).outerHTML
            + `<span style="font-size:var(--tmu-font-sm);color:var(--tmu-text-accent-soft)">${from}–${to} of ${count}</span>`
            + TmUI.button({ id: idNext, label: 'Next →', color: 'secondary', size: 'xs', disabled: currentPage >= totalPages - 1 }).outerHTML
            + '</div>';
    }

    function render() {
        const isLoading = discovering || done < total;
        let loadLabel;
        if (discovering && done === 0) loadLabel = '⏳ Discovering…';
        else if (isLoading) loadLabel = `⏳ ${done}/${total}`;
        else loadLabel = `✓ ${total} loaded`;
        const loadBtnHtml = TmUI.button({ label: loadLabel, color: 'secondary', size: 'xs', disabled: true }).outerHTML;

        const slFiltered = getSlFiltered();
        const ixFiltered = getIxFiltered();

        const slCount = slFiltered.length < allPlayers.length
            ? `(${slFiltered.length}/${allPlayers.length})`
            : `(${allPlayers.length})`;
        const ixCount = ixFiltered !== null
            ? (ixFiltered.length < indexedPlayers.length
                ? `(${ixFiltered.length}/${indexedPlayers.length})`
                : `(${indexedPlayers.length})`)
            : '';

        const tabs = TmUI.tabs({
            items: [
                { key: 'shortlist', slot: `📋 Shortlist <span class="tmsl-tab-count">${slCount}</span>` },
                { key: 'indexed',   slot: `🗄️ Database${ixCount ? ` <span class="tmsl-tab-count">${ixCount}</span>` : ''}` },
            ],
            active: activeTab,
            color: 'primary',
        });

        let h = tabs.outerHTML;
        h += TmShortlistFilters.buildFilters(filterState, { loadHtml: loadBtnHtml });

        if (activeTab === 'shortlist') {
            const totalPages = Math.max(1, Math.ceil(slFiltered.length / PAGE_SIZE));
            page = Math.min(page, totalPages - 1);
            const slice = slFiltered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

            h += '<div id="tmsl-table-slot">';
            if (!slFiltered.length && !isLoading) h += TmUI.empty('No players match current filters');
            else if (!slice.length && isLoading) h += TmUI.loading(`Loading… ${done}/${total}`);
            h += '</div>';
            h += renderPagination(page, totalPages, slFiltered.length, 'tmsl-sl-prev', 'tmsl-sl-next');

            setPanelHTML(h);
            if (slice.length) {
                mountTable(slice, {
                    sortKey: sortCol, sortDir,
                    nameDecorator: p => p.note
                        ? `<span class="tmsl-note-icon" data-note="${String(p.note).replace(/"/g, '&quot;')}">📋</span>`
                        : '',
                    rowCls: null,
                    rowAttrs: p => ({ 'data-pid': String(p.id) }),
                    onRowClick: p => { if (Number(p.timeleft) > 0) TmBidsDialog.open(p); },
                    onSort: col => {
                        const r = TmUtils.toggleSort(col, sortCol, sortDir, (col === 'name' || col === 'pos') ? 1 : -1);
                        sortCol = r.key; sortDir = r.dir; page = 0; render();
                    },
                });
            }
        } else {
            const ixTotalPages = ixFiltered ? Math.max(1, Math.ceil(ixFiltered.length / IX_PAGE_SIZE)) : 1;
            ixPage = ixFiltered ? Math.min(ixPage, ixTotalPages - 1) : 0;
            const ixSlice = ixFiltered ? ixFiltered.slice(ixPage * IX_PAGE_SIZE, (ixPage + 1) * IX_PAGE_SIZE) : [];

            h += '<div id="tmsl-table-slot">';
            if (indexedLoading) h += TmUI.loading('Loading database…');
            else if (!ixFiltered) h += TmUI.empty('Database is empty');
            else if (!ixFiltered.length) h += TmUI.empty('No players match current filters');
            h += '</div>';
            if (ixFiltered) h += renderPagination(ixPage, ixTotalPages, ixFiltered.length, 'tmsl-ix-prev', 'tmsl-ix-next');

            const purgeLabel = ixPurging
                ? `Purging… ${ixPurgeProgress?.done ?? 0}/${ixPurgeProgress?.total ?? 0} (archived: ${ixPurgeProgress?.archived ?? 0})`
                : 'Purge Retired';
            const purgeBtn = TmUI.button({
                id: 'tmsl-ix-purge',
                label: purgeLabel,
                color: 'danger', size: 'xs',
                disabled: ixPurging || indexedLoading || !indexedPlayers?.length,
                attrs: ixPurging ? {} : { 'data-ix-purge': '1' },
            }).outerHTML;
            h += `<div style="display:flex;justify-content:flex-end;padding:4px 0">${purgeBtn}</div>`;

            setPanelHTML(h);
            if (ixSlice.length) {
                mountTable(ixSlice, {
                    sortKey: ixSortCol, sortDir: ixSortDir,
                    columns: { timeleft: false, curbid: false },
                    rowCls: null,
                    rowAttrs: p => ({ 'data-pid': String(p.id) }),
                    onRowClick: null,
                    onSort: col => {
                        const r = TmUtils.toggleSort(col, ixSortCol, ixSortDir, (col === 'name' || col === 'pos') ? 1 : -1);
                        ixSortCol = r.key; ixSortDir = r.dir; ixPage = 0; render();
                    },
                    extraColsAfter: [{
                        key: 'lastSeen', label: 'Updated', sortable: true, align: 'r', width: '80px',
                        sort: (a, b) => (a.lastSeen || 0) - (b.lastSeen || 0),
                        render: (v, p) => {
                            const age = fmtLastSeen(p.lastSeen);
                            const color = p.stale ? 'var(--tmu-text-warn)' : 'var(--tmu-text-accent-soft)';
                            const reloading = ixReloading.has(String(p.id));
                            const btn = TmUI.button({
                                slot: reloading ? '…' : '&#x21BB;',
                                variant: 'icon', size: 'xs',
                                title: 'Sync to DB',
                                attrs: { 'data-ix-reload': String(p.id) },
                            }).outerHTML;
                            return `<span style="display:inline-flex;gap:4px;align-items:center;color:${color}">`
                                + `<span style="font-size:var(--tmu-font-xs)">${age}</span>${btn}</span>`;
                        },
                    }],
                });
            }
        }
    }

    // ── Events ─────────────────────────────────────────────────────────
    TmShortlistFilters.bindFilters(panel, {
        onGroupFilter: g => {
            if (filterState.fPos.has(g)) filterState.fPos.delete(g); else filterState.fPos.add(g);
            page = 0; ixPage = 0; render();
        },
        onSideFilter: s => {
            if (filterState.fSide.has(s)) filterState.fSide.delete(s); else filterState.fSide.add(s);
            page = 0; ixPage = 0; render();
        },
        onNumFilter: (id, value) => {
            const map = {
                'tmsl-agemin': ['fAgeMin', v => parseInt(v) || 0],
                'tmsl-agemax': ['fAgeMax', v => parseInt(v) || 99],
                'tmsl-r5min': ['fR5Min', v => v],
                'tmsl-r5max': ['fR5Max', v => v],
                'tmsl-recmin': ['fRecMin', v => v],
                'tmsl-recmax': ['fRecMax', v => v],
                'tmsl-timin': ['fTiMin', v => v],
                'tmsl-timax': ['fTiMax', v => v],
            };
            const mapEntry = map[id];
            if (mapEntry) filterState[mapEntry[0]] = mapEntry[1](value);
            page = 0; ixPage = 0; render();
        },
        onTextFilter: (id, value) => {
            if (id === 'tmsl-name') filterState.fName = value;
            page = 0; ixPage = 0; render();
        },
    });

    panel.addEventListener('click', e => {
        const tabBtn = e.target.closest('.tmu-tab[data-tab]');
        if (tabBtn && panel.contains(tabBtn)) {
            const key = tabBtn.dataset.tab;
            if (key === activeTab) return;
            activeTab = key;
            if (key === 'indexed' && !indexedPlayers && !indexedLoading) loadIndexedTab();
            else scheduleRender();
            return;
        }
        if (e.target.closest('#tmsl-sl-prev')) { page = Math.max(0, page - 1); render(); return; }
        if (e.target.closest('#tmsl-sl-next')) { page++; render(); return; }
        if (e.target.closest('#tmsl-ix-prev')) { ixPage = Math.max(0, ixPage - 1); render(); return; }
        if (e.target.closest('#tmsl-ix-next')) { ixPage++; render(); return; }

        const purgeBtn = e.target.closest('[data-ix-purge]');
        if (purgeBtn && panel.contains(purgeBtn) && !ixPurging && indexedPlayers?.length) {
            ixPurging = true;
            ixPurgeProgress = { done: 0, total: indexedPlayers.length, archived: 0 };
            scheduleRender();
            const pids = indexedPlayers.map(p => String(p.id));
            let lastArchived = 0;
            purgeRetiredPlayers(pids, progress => {
                ixPurgeProgress = progress;
                // if archived count increased, this pid was just archived — remove it live
                if (progress.archived > lastArchived) {
                    lastArchived = progress.archived;
                    indexedPlayers = indexedPlayers.filter(p => String(p.id) !== progress.pid);
                }
                scheduleRender();
            }).then(({ archived }) => {
                // final clean up: remove all archived pids from list
                const archivedSet = new Set(archived);
                indexedPlayers = (indexedPlayers || []).filter(p => !archivedSet.has(String(p.id)));
            }).catch(() => {}).finally(() => {
                ixPurging = false;
                ixPurgeProgress = null;
                scheduleRender();
            });
            return;
        }

        const reloadBtn = e.target.closest('[data-ix-reload]');
        if (reloadBtn && panel.contains(reloadBtn)) {
            e.stopPropagation();
            const pid = reloadBtn.dataset.ixReload;
            if (ixReloading.has(pid)) return;
            ixReloading.add(pid);
            scheduleRender();
            TmPlayerModel.fetchPlayerTooltip(pid)
                .then(async player => {
                    if (!player) return;
                    const results = await runSyncPipeline([player], undefined, { mode: 'missing-only' });
                    const result = results[0];
                    if (result?.archived) {
                        // player has no club → was archived, remove from indexed list
                        if (indexedPlayers) {
                            const idx = indexedPlayers.findIndex(p => String(p.id) === String(pid));
                            if (idx !== -1) indexedPlayers.splice(idx, 1);
                        }
                        return;
                    }
                    if (result?.needSync) refreshPlayerSkills(result);
                    // rebuild indexed entry from updated DB
                    const allStores = await loadAllFromDB();
                    const updatedStore = allStores[String(pid)];
                    if (updatedStore && indexedPlayers) {
                        const rebuilt = dbRecordToPlayer(pid, updatedStore);
                        if (rebuilt) {
                            const idx = indexedPlayers.findIndex(p => String(p.id) === String(pid));
                            if (idx !== -1) indexedPlayers[idx] = rebuilt;
                            else indexedPlayers.push(rebuilt);
                        }
                    }
                })
                .catch(() => {})
                .finally(() => { ixReloading.delete(pid); scheduleRender(); });
            return;
        }
    });

    panel.addEventListener('mouseover', e => {
        const row = e.target.closest('tr[data-pid]');
        if (!row || !panel.contains(row)) return;
        const searchList = activeTab === 'shortlist' ? allPlayers : (indexedPlayers || []);
        const player = searchList.find(p => String(p.id) === row.dataset.pid);
        if (!player) return;
        const anchor = row.querySelector('.tmpt-link') || row;
        TmPlayerTooltip.show(anchor, player);
    });

    panel.addEventListener('mouseout', e => {
        if (e.target.closest('tr[data-pid]')) TmPlayerTooltip.hide();
    });

    // ── Initial render ─────────────────────────────────────────────────
    render();

    // ── Fetch tooltip helper ───────────────────────────────────────────
    function queueTooltipFetch(id) {
        TmPlayerModel.fetchTooltipCached(id).then(player => {
            done++;
            if (player) {
                const bf = bidFieldsById.get(String(id)) || {};
                player.timeleft = bf.timeleft ?? 0;
                player.timeleft_string = bf.timeleft_string ?? '';
                player.curbid = bf.curbid ?? '';
                if (bf.note) player.note = bf.note;
                allPlayers.push(player);
            }
            scheduleRender();
        }).catch(() => { done++; scheduleRender(); });
    }

    // ── Fetch all shortlist players progressively ──────────────────────
    for (const entry of initialEntries) queueTooltipFetch(entry.id);

    // ── Discovery rounds — TM returns ~200 random players per call ─────
    (async () => {
        const seen = new Set(initialEntries.map(e => String(e.id)));
        for (let i = 0; i < DISCOVERY_ROUNDS; i++) {
            try {
                const discoveredEntries = await TmShortlistModel.fetchShortlistPage();
                for (const entry of discoveredEntries) {
                    const id = String(entry.id);
                    if (seen.has(id)) continue;
                    seen.add(id);
                    total++;
                    bidFieldsById.set(id, {
                        timeleft: Math.max(0, Number(entry.time) || 0),
                        timeleft_string: String(entry.timeleft_string || ''),
                        curbid: String(entry.curbid || ''),
                        note: entry.txt || entry.note || null,
                    });
                    queueTooltipFetch(id);
                }
            } catch { /* ignore */ }
        }
        discovering = false;
        scheduleRender();
    })();
}


