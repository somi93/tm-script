
// ─── components/r5history/tm-r5history-styles.js ────────────

(function () {
    'use strict';

    window.TmR5HistoryStyles = {
        inject() {
            if (document.getElementById('tmrc-styles')) return;
            const style = document.createElement('style');
            style.id = 'tmrc-styles';
            style.textContent = `
/* Button */
.tmrc-btn {
    display: inline-block; padding: 4px 14px; margin-left: 10px;
    background: linear-gradient(135deg, #2a5a1c, #1c3a10);
    border: 1px solid #4a8a30; border-radius: 6px;
    color: #c8e0b4; font-size: 12px; font-weight: 700;
    cursor: pointer; text-decoration: none; vertical-align: middle;
    transition: all 0.2s;
}
.tmrc-btn:hover { background: linear-gradient(135deg, #3a7a2c, #2a5a1c); color: #fff; border-color: #6cc040; }

/* Modal overlay */
.tmrc-overlay {
    display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.85); z-index: 99999;
    align-items: center; justify-content: center;
}
.tmrc-overlay.open { display: flex; }

/* Modal */
.tmrc-modal {
    background: linear-gradient(135deg, #1a2e14 0%, #162810 100%);
    border: 1px solid #3a6a28; border-radius: 12px;
    width: 94vw; max-width: 1400px; height: 88vh;
    display: flex; flex-direction: column;
    box-shadow: 0 12px 48px rgba(0,0,0,0.7);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4;
}
.tmrc-modal * { box-sizing: border-box; }

/* Header */
.tmrc-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-bottom: 1px solid #2a4a1c;
}
.tmrc-title { font-size: 16px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px; }
.tmrc-close {
    background: none; border: none; color: #6a9a58; font-size: 22px;
    cursor: pointer; padding: 4px 8px; border-radius: 4px; line-height: 1;
}
.tmrc-close:hover { color: #ef4444; background: rgba(239,68,68,0.15); }

/* Filters bar */
.tmrc-filters {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-bottom: 1px solid #2a4a1c;
    flex-wrap: wrap;
}
.tmrc-filter-label { font-size: 11px; color: #6a9a58; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-right: 4px; }
.tmrc-filter-btn {
    padding: 4px 12px; border-radius: 5px; border: 1px solid #3a5a2a;
    background: #1c3410; color: #8abc78; font-size: 11px; font-weight: 700;
    cursor: pointer; transition: all 0.15s;
}
.tmrc-filter-btn:hover { background: #243d18; border-color: #5a8a40; }
.tmrc-filter-btn.active { background: #2a5a1c; border-color: #6cc040; color: #fff; }

/* Body: chart + legend side by side */
.tmrc-body {
    display: flex; flex: 1; min-height: 0;
}

/* Chart area */
.tmrc-chart-area {
    flex: 1; min-width: 0; position: relative;
    padding: 10px;
}
.tmrc-canvas {
    width: 100%; height: 100%; display: block; cursor: crosshair;
}
.tmrc-tooltip {
    display: none; position: absolute; z-index: 10;
    background: rgba(20,40,15,0.95); border: 1px solid #4a8a30;
    border-radius: 6px; padding: 6px 10px; font-size: 11px;
    color: #c8e0b4; pointer-events: none; white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5);
}

/* Legend sidebar */
.tmrc-legend {
    width: 280px; min-width: 280px; max-width: 280px;
    border-left: 1px solid #2a4a1c;
    overflow-y: auto; padding: 8px 0;
}
.tmrc-legend-title {
    font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.5px;
    padding: 4px 12px 6px; border-bottom: 1px solid #2a4a1c;
    margin-bottom: 4px;
}
.tmrc-legend-item {
    display: flex; align-items: center; gap: 6px;
    padding: 3px 12px; cursor: pointer; transition: background 0.12s;
    border-left: 3px solid transparent;
}
.tmrc-legend-item:hover { background: rgba(106,154,88,0.1); }
.tmrc-legend-item.highlighted { background: rgba(106,154,88,0.2); }
.tmrc-legend-item.hidden-player { opacity: 0.35; }
.tmrc-legend-cb {
    width: 13px; height: 13px; cursor: pointer; accent-color: #4a8a30; flex-shrink: 0;
}
.tmrc-legend-swatch {
    width: 14px; height: 3px; border-radius: 2px; flex-shrink: 0;
}
.tmrc-legend-name {
    font-size: 11px; font-weight: 500; color: #c8e0b4; flex: 1;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    text-decoration: none;
}
.tmrc-legend-name:hover { color: #fff; text-decoration: underline; }
.tmrc-legend-pos {
    font-size: 9px; font-weight: 700;
}
.tmrc-legend-age {
    font-size: 9px; font-weight: 600; color: #6a9a58; text-align: right; min-width: 28px;
}
.tmrc-legend-r5 {
    font-size: 10px; font-weight: 700; text-align: right; min-width: 36px;
}

/* Summary stats */
.tmrc-stats {
    display: flex; gap: 16px; padding: 8px 20px;
    border-top: 1px solid #2a4a1c; font-size: 11px;
}
.tmrc-stat { display: flex; align-items: center; gap: 4px; }
.tmrc-stat-lbl { color: #6a9a58; font-weight: 600; }
.tmrc-stat-val { color: #e0f0cc; font-weight: 700; }

/* Issues button */
.tmrc-issues-btn {
    padding: 3px 10px; border-radius: 5px; border: 1px solid #b45309;
    background: rgba(180,83,9,0.2); color: #fbbf24; font-size: 11px; font-weight: 700;
    cursor: pointer; transition: all 0.15s; margin-left: 8px;
}
.tmrc-issues-btn:hover { background: rgba(180,83,9,0.4); border-color: #fbbf24; }

/* Issues panel */
.tmrc-issues-panel {
    max-height: 80vh; overflow-y: auto; padding: 10px 20px;
    border-bottom: 1px solid #2a4a1c; background: rgba(180,83,9,0.06);
    font-size: 11px;
}
.tmrc-issues-panel table { width: 100%; border-collapse: collapse; }
.tmrc-issues-panel th {
    text-align: left; font-size: 10px; color: #6a9a58; font-weight: 700;
    text-transform: uppercase; padding: 3px 8px; border-bottom: 1px solid #2a4a1c;
}
.tmrc-issues-panel td {
    padding: 3px 8px; border-bottom: 1px solid rgba(42,74,28,0.4); color: #c8e0b4;
}
.tmrc-issues-panel a { color: #fbbf24; text-decoration: none; }
.tmrc-issues-panel a:hover { color: #fff; text-decoration: underline; }
.tmrc-null { color: #ef4444; font-weight: 700; }
.tmrc-ok { color: #4ade80; }

/* Scrollbar */
.tmrc-legend::-webkit-scrollbar { width: 6px; }
.tmrc-legend::-webkit-scrollbar-track { background: transparent; }
.tmrc-legend::-webkit-scrollbar-thumb { background: #3a5a2a; border-radius: 3px; }

/* Legend search */
.tmrc-legend-search {
    display: flex; padding: 6px 10px; border-bottom: 1px solid #2a4a1c;
}
.tmrc-legend-search input {
    width: 100%; padding: 4px 8px; border-radius: 5px;
    border: 1px solid #3a5a2a; background: #162e0e; color: #c8e0b4;
    font-size: 11px; font-family: inherit; outline: none;
    transition: border-color 0.2s;
}
.tmrc-legend-search input::placeholder { color: #5a7a48; }
.tmrc-legend-search input:focus { border-color: #6cc040; background: #1a3412; }

/* Legend header buttons */
.tmrc-legend-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 4px 12px 6px; border-bottom: 1px solid #2a4a1c; margin-bottom: 0;
}
.tmrc-legend-hdr-title {
    font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.5px;
}
.tmrc-legend-hdr-btns { display: flex; gap: 4px; }
.tmrc-legend-hdr-btn {
    padding: 2px 8px; border-radius: 4px; border: 1px solid #3a5a2a;
    background: #1c3410; color: #8abc78; font-size: 9px; font-weight: 700;
    cursor: pointer; transition: all 0.15s;
}
.tmrc-legend-hdr-btn:hover { background: #2a5a1c; border-color: #6cc040; color: #fff; }

/* Zoom controls */
.tmrc-zoom-controls {
    position: absolute; top: 14px; right: 18px; display: flex; gap: 4px; z-index: 5;
}
.tmrc-zoom-btn {
    padding: 3px 10px; border-radius: 5px; border: 1px solid #3a5a2a;
    background: rgba(28,52,16,0.85); color: #8abc78; font-size: 11px; font-weight: 700;
    cursor: pointer; transition: all 0.15s; backdrop-filter: blur(4px);
}
.tmrc-zoom-btn:hover { background: #2a5a1c; border-color: #6cc040; color: #fff; }
`;
            document.head.appendChild(style);
        }
    };

})();



// ─── components/r5history/tm-r5history-chart.js ─────────────

(function () {
    'use strict';

    const { calcTicks, setupCanvas, drawGrid } = window.TmCanvasUtils;

    window.TmR5HistoryChart = {

        /* draw(canvas, visibleSeries, opts, zoomState)
           zoomState = { ageMin, ageMax, yMin, yMax } or null for auto-fit
           Returns chartInfo = { xS, yS, yMin, yMax, ageMin, ageMax } */
        draw(canvas, visibleSeries, opts = {}, zoomState = null) {
            const { gridColor = 'rgba(255,255,255,0.08)', axisColor = '#9ab889' } = opts;
            const setup = setupCanvas(canvas);
            if (!setup) return null;
            const { ctx, cssW, cssH } = setup;

            const pL = 52, pR = 14, pT = 14, pB = 32;
            const cW = cssW - pL - pR, cH = cssH - pT - pB;

            /* Compute age range from all visible data */
            let allAges = [], allVals = [];
            visibleSeries.forEach(s => { allAges.push(...s.ages); allVals.push(...s.values); });
            if (!allVals.length) { allVals = [0, 100]; allAges = [15, 37]; }

            let ageMin, ageMax, yMin, yMax;
            if (zoomState) {
                ageMin = zoomState.ageMin; ageMax = zoomState.ageMax;
                yMin = zoomState.yMin; yMax = zoomState.yMax;
            } else {
                ageMin = Math.floor(Math.min(...allAges));
                ageMax = Math.ceil(Math.max(...allAges));
                const rMin = Math.min(...allVals), rMax = Math.max(...allVals);
                const mg = (rMax - rMin) * 0.06 || 5;
                yMin = Math.floor(rMin - mg);
                yMax = Math.ceil(rMax + mg);
            }

            const xS = v => pL + ((v - ageMin) / (Math.max(ageMax, ageMin + 1) - ageMin)) * cW;
            const yS = v => pT + cH - ((v - yMin) / (Math.max(yMax, yMin + 1) - yMin)) * cH;

            /* Background */
            ctx.clearRect(0, 0, cssW, cssH);
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(pL, pT, cW, cH);

            /* Y grid + labels */
            const yTicks = calcTicks(yMin, yMax, 8);
            drawGrid(ctx, { pL, pT, pB, cssW, cssH, cW, cH, xS, yS, yTicks, ageMin, ageMax, gridColor, axisColor, yAxisLabel: 'R5 Rating' });

            /* Draw lines — non-highlighted first, highlighted on top */
            const anyHL = visibleSeries.some(v => v.highlighted);
            const drawOrder = [...visibleSeries.filter(s => !s.highlighted), ...visibleSeries.filter(s => s.highlighted)];

            drawOrder.forEach(s => {
                const alpha = s.highlighted ? 1.0 : (anyHL ? 0.12 : 0.75);
                const lw = s.highlighted ? 2.8 : 1.3;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = s.color;
                ctx.lineWidth = lw;
                ctx.lineJoin = 'round'; ctx.lineCap = 'round';
                ctx.beginPath();
                let first = true;
                for (let i = 0; i < s.ages.length; i++) {
                    const x = xS(s.ages[i]), y = yS(s.values[i]);
                    if (first) { ctx.moveTo(x, y); first = false; }
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();

                /* Dots only for highlighted players */
                if (s.highlighted) {
                    for (let i = 0; i < s.ages.length; i++) {
                        ctx.beginPath();
                        ctx.arc(xS(s.ages[i]), yS(s.values[i]), 2.5, 0, Math.PI * 2);
                        ctx.fillStyle = s.color; ctx.fill();
                    }
                }
                ctx.restore();
            });

            /* Border */
            ctx.strokeStyle = 'rgba(120,180,80,0.3)'; ctx.lineWidth = 1;
            ctx.strokeRect(pL, pT, cW, cH);

            return { xS, yS, yMin, yMax, ageMin, ageMax };
        },

        /* attachTooltip(canvas, tipEl, getSeriesFn, chartInfoGetter) */
        attachTooltip(canvas, tipEl, getSeriesFn, chartInfoGetter) {
            const { R5_THRESHOLDS } = window.TmConst;
            const { getColor } = window.TmUtils;

            canvas.addEventListener('mousemove', e => {
                const info = chartInfoGetter();
                if (!info) return;
                const rect = canvas.getBoundingClientRect();
                const mx = e.clientX - rect.left, my = e.clientY - rect.top;
                const vis = getSeriesFn();
                let best = null, bd = Infinity;

                vis.forEach(s => {
                    for (let i = 0; i < s.ages.length; i++) {
                        const dx = mx - info.xS(s.ages[i]);
                        const dy = my - info.yS(s.values[i]);
                        const d = Math.sqrt(dx * dx + dy * dy);
                        if (d < bd && d < 30) { bd = d; best = { s, i }; }
                    }
                });

                if (best) {
                    const { s, i } = best;
                    const age = s.ages[i], val = s.values[i];
                    const ay = Math.floor(age), am = Math.round((age - ay) * 12);
                    tipEl.innerHTML = `<span style="color:${s.color}">●</span> <b>${s.name}</b> <span style="color:#6a9a58">(${s.posLabel})</span><br>` +
                        `<b>R5:</b> <span style="color:${getColor(val, R5_THRESHOLDS)}">${Number(val).toFixed(2)}</span> &nbsp; <b>Age:</b> ${ay}y ${am}m`;
                    tipEl.style.display = 'block';
                    const px = info.xS(age), py = info.yS(val);
                    let tx = px - tipEl.offsetWidth / 2;
                    if (tx < 0) tx = 4;
                    if (tx + tipEl.offsetWidth > canvas.clientWidth) tx = canvas.clientWidth - tipEl.offsetWidth - 4;
                    let ty = py - 50;
                    if (ty < 0) ty = py + 16;
                    tipEl.style.left = tx + 'px';
                    tipEl.style.top = ty + 'px';
                } else {
                    tipEl.style.display = 'none';
                }
            });
            canvas.addEventListener('mouseleave', () => { tipEl.style.display = 'none'; });
        },
    };

})();


// ─── tm-r5history.user.js (guarded: /^\/players\/?$/) ──────────
if (/^\/players\/?$/.test(location.pathname)) {

(function () {
    'use strict';

    const $ = window.jQuery;
    if (!$) return;

    /* Abort if this is a specific player page like /players/12345/ */
    if (/\/players\/\d+/.test(location.pathname)) return;

    /* ═══════════════════════════════════════════════════════════
       CONSTANTS
       ═══════════════════════════════════════════════════════════ */
    const { R5_THRESHOLDS } = window.TmConst;

    /* Position group labels for filters */
    const POS_GROUPS = [
        { key: 'all',  label: 'All',  match: () => true },
        { key: 'gk',   label: 'GK',   match: idx => idx === 9 },
        { key: 'dc',   label: 'DC',   match: idx => idx === 0 },
        { key: 'dlr',  label: 'DR/DL', match: idx => idx === 1 },
        { key: 'dmc',  label: 'DMC',  match: idx => idx === 2 },
        { key: 'dmlr', label: 'DMR/DML', match: idx => idx === 3 },
        { key: 'mc',   label: 'MC',   match: idx => idx === 4 },
        { key: 'mlr',  label: 'MR/ML', match: idx => idx === 5 },
        { key: 'omc',  label: 'OMC',  match: idx => idx === 6 },
        { key: 'omlr', label: 'OMR/OML', match: idx => idx === 7 },
        { key: 'f',    label: 'FC',   match: idx => idx === 8 }
    ];

    /* Distinct line colors per player */
    const LINE_COLORS = [
        '#ff6384','#36a2eb','#ffce56','#4bc0c0','#9966ff','#ff9f40',
        '#e56b6f','#57cc99','#80b1d3','#fdb462','#b3de69','#fb8072',
        '#bc80bd','#8dd3c7','#fccde5','#bebada','#d9d9d9','#ccebc5',
        '#ff7043','#ab47bc','#26c6da','#9ccc65','#ef5350','#42a5f5',
        '#66bb6a','#ffa726','#8d6e63','#78909c','#ec407a','#5c6bc0',
        '#29b6f6','#d4e157','#ff7043','#26a69a','#7e57c2','#c62828',
        '#00897b','#f06292','#ba68c8','#4dd0e1','#aed581','#ffb74d'
    ];

    /* ═══════════════════════════════════════════════════════════
       UTILITIES
       ═══════════════════════════════════════════════════════════ */
    const getColor = window.TmUtils.getColor;

    const getPositionIndex = window.TmLib.getPositionIndex;

    const posGroupColor = posIdx => window.TmPosition.groupColor(posIdx);
    const posLabel = posIdx => window.TmPosition.groupLabel(posIdx);

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

            if(pid === '139497948') {
                console.log(r5Values);
            }
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
        ov.innerHTML = `
            <div class="tmrc-modal">
                <div class="tmrc-head">
                    <div class="tmrc-title">📊 Squad R5 History
                        <button class="tmrc-issues-btn" id="tmrc-issues-btn" style="display:none" title="Players with incomplete sync">⚠ Sync Issues</button>
                    </div>
                    <button class="tmrc-close" title="Close">✕</button>
                </div>
                <div class="tmrc-issues-panel" id="tmrc-issues-panel" style="display:none"></div>
                <div class="tmrc-filters" id="tmrc-filters"></div>
                <div class="tmrc-body">
                    <div class="tmrc-chart-area">
                        <canvas class="tmrc-canvas" id="tmrc-canvas"></canvas>
                        <div class="tmrc-tooltip" id="tmrc-tip"></div>
                        <div class="tmrc-zoom-controls" id="tmrc-zoom-controls">
                            <button class="tmrc-zoom-btn" id="tmrc-zoom-in" title="Zoom In">+</button>
                            <button class="tmrc-zoom-btn" id="tmrc-zoom-out" title="Zoom Out">−</button>
                            <button class="tmrc-zoom-btn" id="tmrc-zoom-reset" title="Reset Zoom">↺</button>
                        </div>
                    </div>
                    <div class="tmrc-legend" id="tmrc-legend"></div>
                </div>
                <div class="tmrc-stats" id="tmrc-stats"></div>
            </div>
        `;
        document.body.appendChild(ov);

        /* Close handlers */
        ov.querySelector('.tmrc-close').addEventListener('click', () => ov.classList.remove('open'));
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('open')) ov.classList.remove('open'); });

        /* Issues button toggle */
        ov.querySelector('#tmrc-issues-btn').addEventListener('click', () => {
            const panel = ov.querySelector('#tmrc-issues-panel');
            if (panel.style.display === 'none') {
                renderIssuesPanel(panel);
                panel.style.display = 'block';
            } else {
                panel.style.display = 'none';
            }
        });

        return ov;
    };

    const renderIssuesPanel = (panel) => {
        if (!syncIssues.length) { panel.innerHTML = '<div style="color:#4ade80;padding:8px">All players fully synced!</div>'; return; }
        const tag = (v, total) => v > 0 ? `<span class="tmrc-null">${v}/${total}</span>` : `<span class="tmrc-ok">✓</span>`;
        let h = `<table><thead><tr><th>Player</th><th>Pos</th><th>v</th><th>Records</th><th>R5 null</th><th>REREC null</th><th>Routine null</th><th>No pos</th></tr></thead><tbody>`;
        syncIssues.forEach(p => {
            h += `<tr>
                <td><a href="https://trophymanager.com/players/${p.pid}/" target="_blank">${p.name}</a></td>
                <td>${p.pos || '<span class="tmrc-null">—</span>'}</td>
                <td>${p.v}</td>
                <td>${p.total}</td>
                <td>${tag(p.nullR5, p.total)}</td>
                <td>${tag(p.nullRerec, p.total)}</td>
                <td>${tag(p.nullRoutine, p.total)}</td>
                <td>${p.noMeta ? '<span class="tmrc-null">YES</span>' : '<span class="tmrc-ok">✓</span>'}</td>
            </tr>`;
        });
        h += '</tbody></table>';
        panel.innerHTML = h;
    };

    const renderFilters = () => {
        const container = overlay.querySelector('#tmrc-filters');
        let h = '<span class="tmrc-filter-label">Position:</span>';
        POS_GROUPS.forEach(g => {
            const active = currentFilter === g.key ? ' active' : '';
            h += `<button class="tmrc-filter-btn${active}" data-filter="${g.key}">${g.label}</button>`;
        });
        h += `<span style="margin-left:12px;display:inline-flex;align-items:center;gap:4px;cursor:pointer" id="tmrc-myplayers">
            <input type="checkbox" id="tmrc-myplayers-cb" style="cursor:pointer;accent-color:#4a8a30"${myPlayersOnly ? ' checked' : ''}/>
            <label for="tmrc-myplayers-cb" style="font-size:11px;font-weight:600;color:#8abc78;cursor:pointer">My Players</label>
        </span>`;
        container.innerHTML = h;

        container.querySelectorAll('.tmrc-filter-btn').forEach(btn => {
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

        let h = `<div class="tmrc-legend-hdr">
            <span class="tmrc-legend-hdr-title">Players (${filteredChecked}/${filteredLegend.length}${searchLower ? ' / ' + totalCount : ''})</span>
            <div class="tmrc-legend-hdr-btns">
                <button class="tmrc-legend-hdr-btn" id="tmrc-sel-all" title="Select All">All</button>
                <button class="tmrc-legend-hdr-btn" id="tmrc-sel-none" title="Deselect All">None</button>
            </div>
        </div>
        <div class="tmrc-legend-search">
            <input type="text" id="tmrc-legend-search-input" placeholder="Search players..." value="${legendSearch.replace(/"/g, '&quot;')}">
        </div>`;

        filteredLegend.forEach(s => {
            const lastR5 = s.values[s.values.length - 1];
            const lastAge = s.ages[s.ages.length - 1];
            const ageY = Math.floor(lastAge);
            const ageM = Math.round((lastAge - ageY) * 12);
            const hlClass = s.highlighted ? ' highlighted' : '';
            const hidClass = !s.visible ? ' hidden-player' : '';
            h += `<div class="tmrc-legend-item${hlClass}${hidClass}" data-pid="${s.pid}" style="border-left-color:${s.color}">
                <input type="checkbox" class="tmrc-legend-cb" data-pid="${s.pid}" ${s.visible ? 'checked' : ''}>
                <div class="tmrc-legend-swatch" style="background:${s.color}"></div>
                <a class="tmrc-legend-name" href="https://trophymanager.com/players/${s.pid}/" target="_blank" title="${s.name}">${s.name}</a>
                <div class="tmrc-legend-pos" style="color:${posGroupColor(s.posIdx)}">${s.posLabel}</div>
                <div class="tmrc-legend-age">${ageY}.${ageM}</div>
                <div class="tmrc-legend-r5" style="color:${getColor(lastR5, R5_THRESHOLDS)}">${Number(lastR5).toFixed(1)}</div>
            </div>`;
        });
        container.innerHTML = h;

        /* Checkbox toggle */
        container.querySelectorAll('.tmrc-legend-cb').forEach(cb => {
            cb.addEventListener('change', (e) => {
                e.stopPropagation();
                const pid = cb.dataset.pid;
                const s = allSeries.find(x => x.pid === pid);
                if (s) { s.visible = cb.checked; }
                renderAll();
            });
        });

        /* Search input */
        const searchInput = container.querySelector('#tmrc-legend-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                legendSearch = searchInput.value;
                renderAll();
            });
            /* Keep focus + cursor position after re-render */
            requestAnimationFrame(() => {
                searchInput.focus();
                searchInput.selectionStart = searchInput.selectionEnd = searchInput.value.length;
            });
        }

        /* All / None buttons — apply only to filtered (visible in legend) players */
        const allBtn = container.querySelector('#tmrc-sel-all');
        const noneBtn = container.querySelector('#tmrc-sel-none');
        const filteredPids = new Set(filteredLegend.map(s => s.pid));
        if (allBtn) allBtn.addEventListener('click', () => {
            allSeries.forEach(s => { if (filteredPids.has(s.pid)) s.visible = true; });
            renderAll();
        });
        if (noneBtn) noneBtn.addEventListener('click', () => {
            allSeries.forEach(s => { if (filteredPids.has(s.pid)) s.visible = false; });
            renderAll();
        });

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
        if (!visibleSeries.length) { container.innerHTML = '<span style="color:#6a9a58">No data</span>'; return; }
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
            <div class="tmrc-stat"><span class="tmrc-stat-lbl">Best:</span> <span class="tmrc-stat-val" style="color:${getColor(max, R5_THRESHOLDS)}">${max.toFixed(2)}</span> <span style="color:#6a9a58;font-size:10px">(${best?.name || '?'})</span></div>
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
        const zoomIn = document.getElementById('tmrc-zoom-in');
        const zoomOut = document.getElementById('tmrc-zoom-out');
        const zoomReset = document.getElementById('tmrc-zoom-reset');

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

        if (zoomIn) zoomIn.addEventListener('click', () => btnZoom(0.7));
        if (zoomOut) zoomOut.addEventListener('click', () => btnZoom(1.4));
        if (zoomReset) zoomReset.addEventListener('click', () => {
            zoomAgeMin = zoomAgeMax = zoomYMin = zoomYMax = null;
            redrawChart();
        });
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

        const btn = document.createElement('span');
        btn.className = 'tmrc-btn';
        btn.textContent = '📊 R5 History';
        btn.title = 'Show R5 rating history for all tracked players';
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
}
