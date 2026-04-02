import { TmR5HistoryChart } from '../components/r5history/tm-r5history-chart.js';
import { TmR5HistoryStyles } from '../components/r5history/tm-r5history-styles.js';
import { TmTable } from '../components/shared/tm-table.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmLib } from '../lib/tm-lib.js';
import { TmPosition } from '../lib/tm-position.js';
import { TmUtils } from '../lib/tm-utils.js';

(function () {
    'use strict';

    const $ = window.jQuery;
    if (!$) return;

    /* Abort if this is a specific player page like /players/12345/ */
    if (/\/players\/\d+/.test(location.pathname)) return;

    /* ═══════════════════════════════════════════════════════════
       CONSTANTS
       ═══════════════════════════════════════════════════════════ */
    const { R5_THRESHOLDS } = TmConst;

    /* Position group labels for filters */
    const POS_GROUPS = [
        { key: 'all', label: 'All', match: () => true },
        { key: 'gk', label: 'GK', match: idx => idx === 9 },
        { key: 'dc', label: 'DC', match: idx => idx === 0 },
        { key: 'dlr', label: 'DR/DL', match: idx => idx === 1 },
        { key: 'dmc', label: 'DMC', match: idx => idx === 2 },
        { key: 'dmlr', label: 'DMR/DML', match: idx => idx === 3 },
        { key: 'mc', label: 'MC', match: idx => idx === 4 },
        { key: 'mlr', label: 'MR/ML', match: idx => idx === 5 },
        { key: 'omc', label: 'OMC', match: idx => idx === 6 },
        { key: 'omlr', label: 'OMR/OML', match: idx => idx === 7 },
        { key: 'f', label: 'FC', match: idx => idx === 8 }
    ];

    /* Distinct line colors per player */
    const LINE_COLORS = [
        '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40',
        '#e56b6f', '#57cc99', '#80b1d3', '#fdb462', '#b3de69', '#fb8072',
        '#bc80bd', '#8dd3c7', '#fccde5', '#bebada', '#d9d9d9', '#ccebc5',
        '#ff7043', '#ab47bc', '#26c6da', '#9ccc65', '#ef5350', '#42a5f5',
        '#66bb6a', '#ffa726', '#8d6e63', '#78909c', '#ec407a', '#5c6bc0',
        '#29b6f6', '#d4e157', '#ff7043', '#26a69a', '#7e57c2', '#c62828',
        '#00897b', '#f06292', '#ba68c8', '#4dd0e1', '#aed581', '#ffb74d'
    ];

    /* ═══════════════════════════════════════════════════════════
       UTILITIES
       ═══════════════════════════════════════════════════════════ */
    const getColor = TmUtils.getColor;
    const htmlOf = node => node?.outerHTML || '';
    const buttonHtml = opts => htmlOf(TmUI.button(opts));
    const checkboxHtml = opts => htmlOf(TmUI.checkbox(opts));
    const checkboxFieldHtml = opts => htmlOf(TmUI.checkboxField(opts));
    const inputHtml = opts => htmlOf(TmUI.input({ size: 'full', density: 'compact', tone: 'overlay', grow: true, ...opts }));

    const getPositionIndex = TmLib.getPositionIndex;

    const posGroupColor = posIdx => TmPosition.groupColor(posIdx);
    const posLabel = posIdx => TmPosition.groupLabel(posIdx);

    /* ═══════════════════════════════════════════════════════════
       IndexedDB — read-only access to TMPlayerData
       ═══════════════════════════════════════════════════════════ */
    const openDB = () => new Promise((resolve, reject) => {
        const req = indexedDB.open('TMPlayerData', 1);
        req.onupgradeneeded = e => {
            const d = e.target.result;
            if (!d.objectStoreNames.contains('players'))
                d.createObjectStore('players');
        };
        req.onsuccess = e => resolve(e.target.result);
        req.onerror = e => reject(e.target.error);
    });

    const loadAllPlayers = async () => {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('players', 'readonly');
            const store = tx.objectStore('players');
            const reqAll = store.getAll();
            const reqKeys = store.getAllKeys();
            tx.oncomplete = () => {
                const result = {};
                for (let i = 0; i < reqKeys.result.length; i++)
                    result[reqKeys.result[i]] = reqAll.result[i];
                resolve(result);
            };
            tx.onerror = e => reject(e.target.error);
        });
    };

    /* ═══════════════════════════════════════════════════════════
       PARSE SQUAD TABLE — get current squad player IDs + positions
       ═══════════════════════════════════════════════════════════ */
    const parseSquadTable = () => {
        const players = {};
        document.querySelectorAll('#sq a[player_link]').forEach(a => {
            const pid = a.getAttribute('player_link');
            const name = a.textContent.trim();
            const tr = a.closest('tr');
            if (!tr || !pid) return;

            /* Position from favposition span */
            const fpSpan = tr.querySelector('.favposition');
            let pos = '';
            if (fpSpan) {
                /* Extract position text: spans like <span class="d">D</span>/<span class="dm">DM</span> C */
                pos = fpSpan.textContent.trim().replace(/\s+/g, ' ');
            }

            players[pid] = { name, pos };
        });
        return players;
    };

    /* Resolve position index: prefer meta.pos, else parse from squad table, else detect GK */
    const resolvePosition = (store, sqInfo) => {
        if (store.meta && store.meta.pos) {
            const p = store.meta.pos.split(',')[0].trim();
            return getPositionIndex(p);
        }
        if (sqInfo && sqInfo.pos) {
            /* Parse e.g. "D/DM C" → "D" or "Gk" → "GK" */
            const raw = sqInfo.pos.split(/[\/,]/)[0].replace(/\s+/g, '').trim();
            const idx = getPositionIndex(raw);
            if (idx !== 0 || raw.toLowerCase().startsWith('d')) return idx;
        }
        /* Detect GK from skill count */
        const recs = store.records ? Object.values(store.records) : [];
        const firstRec = recs.find(r => r.skills && r.skills.length > 0);
        if (firstRec && firstRec.skills.length === 11) return 9;
        return 0;
    };

    /* ═══════════════════════════════════════════════════════════
       BUILD PLAYER DATA SERIES
       ═══════════════════════════════════════════════════════════ */
    const buildPlayerSeries = (allStores, squadInfo) => {
        const series = [];
        let colorIdx = 0;

        for (const [pid, store] of Object.entries(allStores)) {
            if (!store || !store.records) continue;
            const keys = Object.keys(store.records).sort((a, b) => {
                const [ay, am] = a.split('.').map(Number);
                const [by, bm] = b.split('.').map(Number);
                return (ay * 12 + am) - (by * 12 + bm);
            });
            if (keys.length < 2) continue;

            const posIdx = resolvePosition(store, squadInfo[pid]);
            const name = (store.meta && store.meta.name) || (squadInfo[pid] && squadInfo[pid].name) || `Player ${pid}`;

            const ages = [];
            const r5Values = [];

            for (const key of keys) {
                const rec = store.records[key];
                const r5 = Number(rec.R5);
                if (!r5 || isNaN(r5) || r5 <= 0) continue;

                const [yr, mo] = key.split('.').map(Number);
                const age = yr + mo / 12;
                if (age < 15 || age > 37) continue;

                ages.push(age);
                r5Values.push(r5);
            }

            if (ages.length < 2) continue;

            const color = LINE_COLORS[colorIdx % LINE_COLORS.length];
            colorIdx++;
            series.push({
                pid,
                name,
                posIdx,
                posLabel: posLabel(posIdx),
                color,
                ages,
                values: r5Values,
                visible: true,
                highlighted: false
            });
        }

        /* Sort by position group then name */
        series.sort((a, b) => {
            const pa = a.posIdx === 9 ? -1 : a.posIdx;
            const pb = b.posIdx === 9 ? -1 : b.posIdx;
            if (pa !== pb) return pa - pb;
            return a.name.localeCompare(b.name);
        });

        /* Re-assign colors after sort */
        series.forEach((s, i) => { s.color = LINE_COLORS[i % LINE_COLORS.length]; });

        return series;
    };



    /* ═══════════════════════════════════════════════════════════
       DIALOG STATE + RENDERING
       ═══════════════════════════════════════════════════════════ */
    let allSeries = [];
    let currentFilter = 'all';
    let myPlayersOnly = false;
    let legendSearch = '';
    let squadPids = new Set();
    let syncIssues = [];
    let chartInfo = null;
    let overlay = null;

    /* Zoom state */
    let zoomAgeMin = null, zoomAgeMax = null;
    let zoomYMin = null, zoomYMax = null;
    let isPanning = false, panStart = null, panAgeRange = null, panYRange = null;

    const getVisibleSeries = () => {
        const grp = POS_GROUPS.find(g => g.key === currentFilter);
        return allSeries.filter(s => {
            if (!s.visible) return false;
            if (grp && !grp.match(s.posIdx)) return false;
            if (myPlayersOnly && !squadPids.has(s.pid)) return false;
            return true;
        });
    };

    const createDialog = () => {
        const ov = document.createElement('div');
        ov.className = 'tmrc-overlay';
        const issuesButton = buttonHtml({
            id: 'tmrc-issues-btn',
            label: '⚠ Sync Issues',
            title: 'Players with incomplete sync',
            color: 'secondary',
            size: 'xs',
            attrs: { 'data-tone': 'warn' },
        });
        const closeButton = buttonHtml({
            id: 'tmrc-close',
            label: '✕',
            title: 'Close',
            variant: 'icon',
        });
        const zoomInButton = buttonHtml({ id: 'tmrc-zoom-in', label: '+', title: 'Zoom In', color: 'secondary', size: 'xs' });
        const zoomOutButton = buttonHtml({ id: 'tmrc-zoom-out', label: '−', title: 'Zoom Out', color: 'secondary', size: 'xs' });
        const zoomResetButton = buttonHtml({ id: 'tmrc-zoom-reset', label: '↺', title: 'Reset Zoom', color: 'secondary', size: 'xs' });
        ov.innerHTML = `
            <div class="tmrc-modal">
                <div class="tmrc-head">
                    <div class="tmrc-title">📊 Squad R5 History
                        ${issuesButton}
                    </div>
                    ${closeButton}
                </div>
                <div class="tmrc-issues-panel" id="tmrc-issues-panel" style="display:none"></div>
                <div class="tmrc-filters" id="tmrc-filters"></div>
                <div class="tmrc-body">
                    <div class="tmrc-chart-area">
                        <canvas class="tmrc-canvas" id="tmrc-canvas"></canvas>
                        <div class="tmrc-tooltip" id="tmrc-tip"></div>
                        <div class="tmrc-zoom-controls" id="tmrc-zoom-controls">
                            ${zoomInButton}
                            ${zoomOutButton}
                            ${zoomResetButton}
                        </div>
                    </div>
                    <div class="tmrc-legend" id="tmrc-legend"></div>
                </div>
                <div class="tmrc-stats" id="tmrc-stats"></div>
            </div>
        `;
        document.body.appendChild(ov);

        /* Close handlers */
        ov.onclick = (event) => {
            if (event.target.closest('#tmrc-close')) {
                ov.classList.remove('open');
                return;
            }

            if (!event.target.closest('#tmrc-issues-btn')) return;
            const panel = ov.querySelector('#tmrc-issues-panel');
            if (panel.style.display === 'none') {
                renderIssuesPanel(panel);
                panel.style.display = 'block';
            } else {
                panel.style.display = 'none';
            }
        };
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('open')) ov.classList.remove('open'); });

        return ov;
    };

    const renderIssuesPanel = (panel) => {
        if (!syncIssues.length) { panel.innerHTML = TmUI.info('All players fully synced!', true); return; }
        const tag = (v, total) => v > 0 ? `<span class="tmrc-null">${v}/${total}</span>` : `<span class="tmrc-ok">✓</span>`;
        const table = TmTable.table({
            cls: ' tmrc-issues-table',
            items: syncIssues,
            headers: [
                {
                    key: 'name',
                    label: 'Player',
                    sortable: false,
                    render: (_value, item) => `<a href="https://trophymanager.com/players/${item.pid}/" target="_blank">${item.name}</a>`,
                },
                {
                    key: 'pos',
                    label: 'Pos',
                    sortable: false,
                    render: (value) => value || '<span class="tmrc-null">—</span>',
                },
                { key: 'v', label: 'v', align: 'c', sortable: false },
                { key: 'total', label: 'Records', align: 'c', sortable: false },
                {
                    key: 'nullR5',
                    label: 'R5 null',
                    align: 'c',
                    sortable: false,
                    render: (value, item) => tag(value, item.total),
                },
                {
                    key: 'nullRerec',
                    label: 'REREC null',
                    align: 'c',
                    sortable: false,
                    render: (value, item) => tag(value, item.total),
                },
                {
                    key: 'nullRoutine',
                    label: 'Routine null',
                    align: 'c',
                    sortable: false,
                    render: (value, item) => tag(value, item.total),
                },
                {
                    key: 'noMeta',
                    label: 'No pos',
                    align: 'c',
                    sortable: false,
                    render: (value) => value ? '<span class="tmrc-null">YES</span>' : '<span class="tmrc-ok">✓</span>',
                },
            ],
        });
        panel.replaceChildren(table);
    };

    const renderFilters = () => {
        const container = overlay.querySelector('#tmrc-filters');
        let h = '<span class="tmrc-filter-label">Position:</span>';
        POS_GROUPS.forEach(g => {
            h += buttonHtml({
                label: g.label,
                color: currentFilter === g.key ? 'lime' : 'secondary',
                size: 'xs',
                attrs: { 'data-filter': g.key },
            });
        });
        h += `<span style="margin-left:12px" id="tmrc-myplayers">${checkboxFieldHtml({
            id: 'tmrc-myplayers-cb',
            checked: myPlayersOnly,
            label: 'My Players',
        })}</span>`;
        container.innerHTML = h;

        container.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                currentFilter = btn.dataset.filter;
                legendSearch = '';
                zoomAgeMin = zoomAgeMax = zoomYMin = zoomYMax = null;
                renderAll();
            });
        });

        const cb = container.querySelector('#tmrc-myplayers-cb');
        if (cb) {
            cb.addEventListener('change', () => {
                myPlayersOnly = cb.checked;
                zoomAgeMin = zoomAgeMax = zoomYMin = zoomYMax = null;
                renderAll();
            });
        }
    };

    const renderLegend = (visibleSeries) => {
        const container = overlay.querySelector('#tmrc-legend');
        /* Sort legend by current R5 descending */
        const sorted = [...visibleSeries].sort((a, b) => {
            const aLast = a.values[a.values.length - 1] || 0;
            const bLast = b.values[b.values.length - 1] || 0;
            return bLast - aLast;
        });

        /* Also include hidden (unchecked) players that pass filter */
        const grp = POS_GROUPS.find(g => g.key === currentFilter);
        const hiddenInFilter = allSeries.filter(s => {
            if (s.visible) return false;
            if (grp && !grp.match(s.posIdx)) return false;
            if (myPlayersOnly && !squadPids.has(s.pid)) return false;
            return true;
        }).sort((a, b) => a.name.localeCompare(b.name));

        const allInLegend = [...sorted, ...hiddenInFilter];
        const totalCount = allInLegend.length;

        /* Apply search filter */
        const searchLower = legendSearch.toLowerCase();
        const filteredLegend = searchLower
            ? allInLegend.filter(s => s.name.toLowerCase().includes(searchLower))
            : allInLegend;
        const filteredChecked = filteredLegend.filter(s => s.visible).length;

        const selectAllButton = buttonHtml({ id: 'tmrc-sel-all', label: 'All', title: 'Select All', color: 'secondary', size: 'xs' });
        const selectNoneButton = buttonHtml({ id: 'tmrc-sel-none', label: 'None', title: 'Deselect All', color: 'secondary', size: 'xs' });
        let h = `<div class="tmrc-legend-hdr">
            <span class="tmrc-legend-hdr-title">Players (${filteredChecked}/${filteredLegend.length}${searchLower ? ' / ' + totalCount : ''})</span>
            <div class="tmrc-legend-hdr-btns">
                ${selectAllButton}
                ${selectNoneButton}
            </div>
        </div>
        <div class="tmrc-legend-search">
            ${inputHtml({ id: 'tmrc-legend-search-input', type: 'text', placeholder: 'Search players...', value: legendSearch.replace(/"/g, '&quot;') })}
        </div>`;

        filteredLegend.forEach(s => {
            const lastR5 = s.values[s.values.length - 1];
            const lastAge = s.ages[s.ages.length - 1];
            const ageY = Math.floor(lastAge);
            const ageM = Math.round((lastAge - ageY) * 12);
            const hlClass = s.highlighted ? ' highlighted' : '';
            const hidClass = !s.visible ? ' hidden-player' : '';
            h += `<div class="tmrc-legend-item${hlClass}${hidClass}" data-pid="${s.pid}" style="border-left-color:${s.color}">
                ${checkboxHtml({ cls: 'tmrc-legend-cb', checked: s.visible, attrs: { 'data-pid': s.pid } })}
                <div class="tmrc-legend-swatch" style="background:${s.color}"></div>
                <a class="tmrc-legend-name" href="https://trophymanager.com/players/${s.pid}/" target="_blank" title="${s.name}">${s.name}</a>
                <div class="tmrc-legend-pos" style="color:${posGroupColor(s.posIdx)}">${s.posLabel}</div>
                <div class="tmrc-legend-age">${ageY}.${ageM}</div>
                <div class="tmrc-legend-r5" style="color:${getColor(lastR5, R5_THRESHOLDS)}">${Number(lastR5).toFixed(1)}</div>
            </div>`;
        });
        container.innerHTML = h;

        if (container.dataset.tmrcLegendBound !== '1') {
            container.dataset.tmrcLegendBound = '1';

            container.addEventListener('change', (e) => {
                const cb = e.target.closest('.tmrc-legend-cb[data-pid]');
                if (!cb || !container.contains(cb)) return;
                e.stopPropagation();
                const s = allSeries.find(x => x.pid === cb.dataset.pid);
                if (s) s.visible = cb.checked;
                renderAll();
            });

            container.addEventListener('input', (e) => {
                const searchInput = e.target.closest('#tmrc-legend-search-input');
                if (!searchInput || !container.contains(searchInput)) return;
                legendSearch = searchInput.value;
                renderAll();
            });

            container.addEventListener('click', (e) => {
                const allBtn = e.target.closest('#tmrc-sel-all');
                if (allBtn && container.contains(allBtn)) {
                    const filteredPids = new Set(Array.from(container.querySelectorAll('.tmrc-legend-item[data-pid]')).map(el => el.dataset.pid));
                    allSeries.forEach(s => { if (filteredPids.has(s.pid)) s.visible = true; });
                    renderAll();
                    return;
                }

                const noneBtn = e.target.closest('#tmrc-sel-none');
                if (!noneBtn || !container.contains(noneBtn)) return;
                const filteredPids = new Set(Array.from(container.querySelectorAll('.tmrc-legend-item[data-pid]')).map(el => el.dataset.pid));
                allSeries.forEach(s => { if (filteredPids.has(s.pid)) s.visible = false; });
                renderAll();
            });
        }

        /* Search input */
        const searchInput = container.querySelector('#tmrc-legend-search-input');
        if (searchInput) {
            /* Keep focus + cursor position after re-render */
            requestAnimationFrame(() => {
                searchInput.focus();
                searchInput.selectionStart = searchInput.selectionEnd = searchInput.value.length;
            });
        }

        /* Hover = highlight (on the row area, not the checkbox) */
        container.querySelectorAll('.tmrc-legend-item').forEach(el => {
            const pid = el.dataset.pid;
            el.addEventListener('mouseenter', () => {
                const vis = getVisibleSeries();
                vis.forEach(s => { s.highlighted = (s.pid === pid); });
                redrawChart();
                updateLegendHighlights(container, filteredLegend);
            });
            el.addEventListener('mouseleave', () => {
                const vis = getVisibleSeries();
                vis.forEach(s => { s.highlighted = false; });
                redrawChart();
                updateLegendHighlights(container, filteredLegend);
            });
        });
    };

    const updateLegendHighlights = (container, visibleSeries) => {
        container.querySelectorAll('.tmrc-legend-item').forEach(el => {
            const pid = el.dataset.pid;
            const s = visibleSeries.find(x => x.pid === pid);
            el.classList.toggle('highlighted', s ? s.highlighted : false);
        });
    };

    const renderStats = (visibleSeries) => {
        const container = overlay.querySelector('#tmrc-stats');
        if (!visibleSeries.length) { container.innerHTML = TmUI.empty('No data', true); return; }
        const lastVals = visibleSeries.map(s => s.values[s.values.length - 1]);
        const avg = lastVals.reduce((a, b) => a + b, 0) / lastVals.length;
        const max = Math.max(...lastVals);
        const min = Math.min(...lastVals);
        const best = visibleSeries.find(s => s.values[s.values.length - 1] === max);
        const totalWeeks = visibleSeries.reduce((s, p) => s + p.ages.length, 0);
        container.innerHTML = `
            <div class="tmrc-stat"><span class="tmrc-stat-lbl">Players:</span> <span class="tmrc-stat-val">${visibleSeries.length}</span></div>
            <div class="tmrc-stat"><span class="tmrc-stat-lbl">Total records:</span> <span class="tmrc-stat-val">${totalWeeks}</span></div>
            <div class="tmrc-stat"><span class="tmrc-stat-lbl">Avg R5:</span> <span class="tmrc-stat-val" style="color:${getColor(avg, R5_THRESHOLDS)}">${avg.toFixed(2)}</span></div>
            <div class="tmrc-stat"><span class="tmrc-stat-lbl">Best:</span> <span class="tmrc-stat-val" style="color:${getColor(max, R5_THRESHOLDS)}">${max.toFixed(2)}</span> <span style="color:var(--tmu-text-faint);font-size:var(--tmu-font-xs)">(${best?.name || '?'})</span></div>
            <div class="tmrc-stat"><span class="tmrc-stat-lbl">Min:</span> <span class="tmrc-stat-val" style="color:${getColor(min, R5_THRESHOLDS)}">${min.toFixed(2)}</span></div>
        `;
    };

    const redrawChart = () => {
        const canvas = document.getElementById('tmrc-canvas');
        if (!canvas) return;
        const vis = getVisibleSeries();
        const zoomState = zoomAgeMin !== null
            ? { ageMin: zoomAgeMin, ageMax: zoomAgeMax, yMin: zoomYMin, yMax: zoomYMax }
            : null;
        chartInfo = TmR5HistoryChart.draw(canvas, vis, undefined, zoomState);
    };

    const renderAll = () => {
        if (!overlay) return;
        renderFilters();
        const vis = getVisibleSeries();
        renderLegend(vis);
        renderStats(vis);
        redrawChart();

        /* Update issues button visibility */
        const issBtn = overlay.querySelector('#tmrc-issues-btn');
        if (issBtn) {
            if (syncIssues.length > 0) {
                issBtn.style.display = 'inline-block';
                issBtn.textContent = `⚠ Sync Issues (${syncIssues.length})`;
            } else {
                issBtn.style.display = 'none';
            }
        }

        /* Zoom button handlers (attach once) */
        attachZoomHandlers();
    };

    /* ═══════════════════════════════════════════════════════════
       ZOOM HANDLERS
       ═══════════════════════════════════════════════════════════ */
    let zoomHandlersAttached = false;
    const attachZoomHandlers = () => {
        if (zoomHandlersAttached) return;
        zoomHandlersAttached = true;

        const canvas = document.getElementById('tmrc-canvas');
        if (!canvas) return;

        /* Wheel zoom: centered on mouse position */
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (!chartInfo) return;

            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            /* Current ranges */
            const aMin = zoomAgeMin !== null ? zoomAgeMin : chartInfo.ageMin;
            const aMax = zoomAgeMax !== null ? zoomAgeMax : chartInfo.ageMax;
            const vMin = zoomYMin !== null ? zoomYMin : chartInfo.yMin;
            const vMax = zoomYMax !== null ? zoomYMax : chartInfo.yMax;

            /* Mouse position as fraction of chart area */
            const pL = 52, pT = 14, pR = 14, pB = 32;
            const cW = canvas.clientWidth - pL - pR;
            const cH = canvas.clientHeight - pT - pB;
            const fx = Math.max(0, Math.min(1, (mx - pL) / cW));
            const fy = Math.max(0, Math.min(1, 1 - (my - pT) / cH));

            const factor = e.deltaY > 0 ? 1.15 : 0.87;

            /* Zoom age axis around mouse X */
            const ageRange = aMax - aMin;
            const newAgeRange = ageRange * factor;
            const ageAtMouse = aMin + fx * ageRange;
            zoomAgeMin = ageAtMouse - fx * newAgeRange;
            zoomAgeMax = ageAtMouse + (1 - fx) * newAgeRange;

            /* Zoom Y axis around mouse Y */
            const yRange = vMax - vMin;
            const newYRange = yRange * factor;
            const yAtMouse = vMin + fy * yRange;
            zoomYMin = yAtMouse - fy * newYRange;
            zoomYMax = yAtMouse + (1 - fy) * newYRange;

            redrawChart();
        }, { passive: false });

        /* Drag to pan */
        canvas.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            if (zoomAgeMin === null) return; /* no zoom = no pan */
            isPanning = true;
            panStart = { x: e.clientX, y: e.clientY };
            panAgeRange = { min: zoomAgeMin, max: zoomAgeMax };
            panYRange = { min: zoomYMin, max: zoomYMax };
            canvas.style.cursor = 'grabbing';
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isPanning || !panStart) return;
            const canvas = document.getElementById('tmrc-canvas');
            if (!canvas) return;

            const pL = 52, pR = 14, pT = 14, pB = 32;
            const cW = canvas.clientWidth - pL - pR;
            const cH = canvas.clientHeight - pT - pB;
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;

            const ageRange = panAgeRange.max - panAgeRange.min;
            const yRange = panYRange.max - panYRange.min;
            const ageDelta = -(dx / cW) * ageRange;
            const yDelta = (dy / cH) * yRange;

            zoomAgeMin = panAgeRange.min + ageDelta;
            zoomAgeMax = panAgeRange.max + ageDelta;
            zoomYMin = panYRange.min + yDelta;
            zoomYMax = panYRange.max + yDelta;

            redrawChart();
        });

        window.addEventListener('mouseup', () => {
            if (isPanning) {
                isPanning = false;
                const canvas = document.getElementById('tmrc-canvas');
                if (canvas) canvas.style.cursor = 'crosshair';
            }
        });

        /* Button handlers */
        const zoomControls = document.getElementById('tmrc-zoom-controls');

        const btnZoom = (factor) => {
            if (!chartInfo) return;
            const aMin = zoomAgeMin !== null ? zoomAgeMin : chartInfo.ageMin;
            const aMax = zoomAgeMax !== null ? zoomAgeMax : chartInfo.ageMax;
            const vMin = zoomYMin !== null ? zoomYMin : chartInfo.yMin;
            const vMax = zoomYMax !== null ? zoomYMax : chartInfo.yMax;

            const aMid = (aMin + aMax) / 2, yMid = (vMin + vMax) / 2;
            const aHalf = (aMax - aMin) / 2 * factor;
            const yHalf = (vMax - vMin) / 2 * factor;
            zoomAgeMin = aMid - aHalf; zoomAgeMax = aMid + aHalf;
            zoomYMin = yMid - yHalf; zoomYMax = yMid + yHalf;
            redrawChart();
        };

        if (zoomControls) {
            zoomControls.onclick = (event) => {
                if (event.target.closest('#tmrc-zoom-in')) {
                    btnZoom(0.7);
                    return;
                }
                if (event.target.closest('#tmrc-zoom-out')) {
                    btnZoom(1.4);
                    return;
                }
                if (!event.target.closest('#tmrc-zoom-reset')) return;
                zoomAgeMin = zoomAgeMax = zoomYMin = zoomYMax = null;
                redrawChart();
            };
        }
    };

    const openDialog = async () => {
        try {
            const allStores = await loadAllPlayers();
            const squadInfo = parseSquadTable();
            squadPids = new Set(Object.keys(squadInfo));

            allSeries = buildPlayerSeries(allStores, squadInfo);

            /* Build sync issues list — players with null REREC/R5/routine */
            syncIssues = [];
            for (const [pid, store] of Object.entries(allStores)) {
                if (!store || !store.records) continue;
                const name = (store.meta && store.meta.name) || (squadInfo[pid] && squadInfo[pid].name) || `Player ${pid}`;
                const pos = (store.meta && store.meta.pos) || '';
                const recs = Object.entries(store.records);
                const nullRerec = recs.filter(([, r]) => r.REREC === null || r.REREC === undefined).length;
                const nullR5 = recs.filter(([, r]) => r.R5 === null || r.R5 === undefined).length;
                const nullRoutine = recs.filter(([, r]) => r.routine === null || r.routine === undefined).length;
                const noMeta = !store.meta || !store.meta.pos;
                if (nullRerec || nullR5 || nullRoutine || noMeta) {
                    syncIssues.push({ pid, name, pos, total: recs.length, nullRerec, nullR5, nullRoutine, noMeta, v: store._v || 1 });
                }
            }
            syncIssues.sort((a, b) => (b.nullR5 + b.nullRerec + b.nullRoutine) - (a.nullR5 + a.nullRerec + a.nullRoutine));
            console.log(`[R5 History] Sync issues: ${syncIssues.length} players with null values`);

            if (!allSeries.length) {
                alert('No player R5 history data found in IndexedDB.\nVisit individual player pages first to sync data.');
                return;
            }

            console.log(`[R5 History] Loaded ${allSeries.length} players from IndexedDB`);

            if (!overlay) {
                overlay = createDialog();
            }

            overlay.classList.add('open');
            currentFilter = 'all';
            legendSearch = '';

            /* Render after a tick so the modal is visible and canvas has dimensions */
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    renderAll();

                    /* Attach tooltip once */
                    const canvas = document.getElementById('tmrc-canvas');
                    const tipEl = document.getElementById('tmrc-tip');
                    if (canvas && tipEl && !canvas._tmrcTipAttached) {
                        TmR5HistoryChart.attachTooltip(canvas, tipEl, getVisibleSeries, () => chartInfo);
                        canvas._tmrcTipAttached = true;
                    }
                });
            });

        } catch (err) {
            console.error('[R5 History] Error:', err);
            alert('Error loading player data: ' + err.message);
        }
    };

    /* ═══════════════════════════════════════════════════════════
       INJECT BUTTON
       ═══════════════════════════════════════════════════════════ */
    const injectButton = () => {
        const h2 = document.querySelector('.box_head h2');
        if (!h2) return;

        const btn = TmUI.button({
            id: 'tmrc-launch-btn',
            label: '📊 R5 History',
            title: 'Show R5 rating history for all tracked players',
            color: 'secondary',
            size: 'sm',
        });
        btn.addEventListener('click', openDialog);

        h2.appendChild(btn);
    };

    /* ═══════════════════════════════════════════════════════════
       RESIZE HANDLER
       ═══════════════════════════════════════════════════════════ */
    let resizeTimer;
    window.addEventListener('resize', () => {
        if (!overlay || !overlay.classList.contains('open')) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(redrawChart, 200);
    });

    /* ═══════════════════════════════════════════════════════════
       INIT
       ═══════════════════════════════════════════════════════════ */
    TmR5HistoryStyles.inject();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(injectButton, 500));
    } else {
        setTimeout(injectButton, 500);
    }

})();
