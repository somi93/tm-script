import { TmPlayerDB } from '../../lib/tm-playerdb.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmCanvasUtils } from '../shared/tm-canvas-utils.js';
import { TmUI } from '../shared/tm-ui.js';

'use strict';

export const TmGraphsMod = (() => {
    const CSS = `
.tmg-chart-wrap {
    position: relative; background: rgba(0,0,0,0.18);
    border: 1px solid rgba(120,180,80,0.25);
    padding: 6px 4px 4px; margin: 6px 0 10px;
}
.tmg-chart-title { color: #e8f5d8; padding: 2px 8px 4px; letter-spacing: 0.3px; }
.tmg-canvas { display: block; cursor: crosshair; }
.tmg-tooltip {
    position: absolute; background: rgba(0,0,0,0.88); color: #fff;
    pointer-events: none;
    z-index: 1000; white-space: nowrap; display: none;
    border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
.tmg-legend {
    display: grid; grid-template-columns: 1fr 1fr; gap: 1px 12px;
    padding: 8px 12px 4px; max-width: 450px; margin: 0 auto;
}
.tmg-legend.tmg-legend-inline {
    grid-template-columns: repeat(3, auto); justify-content: center; gap: 1px 18px;
}
.tmg-legend-item {
    display: flex; align-items: center; gap: 3px;
    color: #ccc; cursor: pointer; user-select: none; padding: 1px 0;
}
.tmg-legend-item input[type="checkbox"] {
    appearance: none; -webkit-appearance: none; width: 13px; height: 13px; min-width: 13px;
    border: 1px solid rgba(255,255,255,0.25); border-radius: 2px; cursor: pointer; margin: 0;
}
.tmg-legend-dot { font-size: 9px; line-height: 1; }
.tmg-enable-card {
    background: rgba(0,0,0,0.18); border: 1px solid rgba(120,180,80,0.25);
    margin: 6px 0 10px;
}
.tmg-enable-title { color: #6a9a58; letter-spacing: 0.3px; }
.tmg-enable-desc { color: #5a7a48; margin-top: 2px; }
.tmg-enable-btn { display: inline-flex; gap: 4px; white-space: nowrap; appearance: none; }
.tmg-enable-btn .pro_icon { height: 12px; vertical-align: middle; position: relative; top: -1px; }
.tmg-skill-arrow { margin-left: 1px; }
`;
    (() => { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); })();

    let lastData = null;
    let containerRef = null;
    let _isGK = false, _playerId = null, _playerASI = 0, _ownClubIds = [], _isOwnPlayer = false;
    const ageToMonths = TmUtils.ageToMonths;

    const SKILL_META = [
        { key: 'strength', label: 'Strength', color: '#22cc22' }, { key: 'stamina', label: 'Stamina', color: '#00bcd4' },
        { key: 'pace', label: 'Pace', color: '#8bc34a' }, { key: 'marking', label: 'Marking', color: '#f44336' },
        { key: 'tackling', label: 'Tackling', color: '#26a69a' }, { key: 'workrate', label: 'Workrate', color: '#3f51b5' },
        { key: 'positioning', label: 'Positioning', color: '#9c27b0' }, { key: 'passing', label: 'Passing', color: '#e91e63' },
        { key: 'crossing', label: 'Crossing', color: '#2196f3' }, { key: 'technique', label: 'Technique', color: '#ff4081' },
        { key: 'heading', label: 'Heading', color: '#757575' }, { key: 'finishing', label: 'Finishing', color: '#4caf50' },
        { key: 'longshots', label: 'Longshots', color: '#00e5ff' }, { key: 'set_pieces', label: 'Set Pieces', color: '#607d8b' }
    ];
    const SKILL_META_GK = [
        { key: 'strength', label: 'Strength', color: '#22cc22' }, { key: 'stamina', label: 'Stamina', color: '#00bcd4' },
        { key: 'pace', label: 'Pace', color: '#8bc34a' }, { key: 'handling', label: 'Handling', color: '#f44336' },
        { key: 'one_on_ones', label: 'One on ones', color: '#26a69a' }, { key: 'reflexes', label: 'Reflexes', color: '#3f51b5' },
        { key: 'aerial_ability', label: 'Aerial Ability', color: '#9c27b0' }, { key: 'jumping', label: 'Jumping', color: '#e91e63' },
        { key: 'communication', label: 'Communication', color: '#2196f3' }, { key: 'kicking', label: 'Kicking', color: '#ff4081' },
        { key: 'throwing', label: 'Throwing', color: '#757575' }
    ];
    const getSkillMeta = () => _isGK ? SKILL_META_GK : SKILL_META;
    const PEAK_META = [
        { key: 'physical', label: 'Physical', color: '#ffeb3b' },
        { key: 'tactical', label: 'Tactical', color: '#00e5ff' },
        { key: 'technical', label: 'Technical', color: '#ff4081' }
    ];

    const { calcTicks, setupCanvas, drawGrid } = TmCanvasUtils;

    const buildAges = (n, years, months) => { const cur = years + months / 12; const ages = []; for (let i = 0; i < n; i++)ages.push(cur - (n - 1 - i) / 12); return ages; };

    const drawChart = (canvas, ages, values, opts = {}) => {
        const { lineColor = '#fff', fillColor = 'rgba(255,255,255,0.06)', gridColor = 'rgba(255,255,255,0.10)', axisColor = '#9ab889', dotRadius = 2.5, yMinOverride, yMaxOverride, formatY = v => String(Math.round(v)) } = opts;
        const setup = setupCanvas(canvas); if (!setup) return null;
        const { ctx, cssW, cssH } = setup;
        if (ages.length === 1) { ages = [ages[0] - 1/12, ages[0]]; values = [values[0], values[0]]; }
        const pL = 50, pR = 10, pT = 12, pB = 30, cW = cssW - pL - pR, cH = cssH - pT - pB;
        const minA = Math.floor(Math.min(...ages)), maxA = Math.ceil(Math.max(...ages));
        const rMin = Math.min(...values), rMax = Math.max(...values), m = (rMax - rMin) * 0.06 || 1;
        const yMin = yMinOverride !== undefined ? yMinOverride : Math.floor(rMin - m);
        const yMax = yMaxOverride !== undefined ? yMaxOverride : Math.ceil(rMax + m);
        const xS = v => pL + ((v - minA) / (maxA - minA)) * cW; const yS = v => pT + cH - ((v - yMin) / (yMax - yMin)) * cH;
        ctx.clearRect(0, 0, cssW, cssH); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(pL, pT, cW, cH);
        const yTicks = calcTicks(yMin, yMax, 6);
        drawGrid(ctx, { pL, pT, pB, cssW, cssH, cW, cH, xS, yS, yTicks, ageMin: minA, ageMax: maxA, gridColor, axisColor, formatY });
        ctx.beginPath(); ctx.moveTo(xS(ages[0]), yS(values[0])); for (let i = 1; i < values.length; i++)ctx.lineTo(xS(ages[i]), yS(values[i]));
        ctx.lineTo(xS(ages[ages.length - 1]), pT + cH); ctx.lineTo(xS(ages[0]), pT + cH); ctx.closePath(); ctx.fillStyle = fillColor; ctx.fill();
        ctx.beginPath(); ctx.strokeStyle = lineColor; ctx.lineWidth = 1.8; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.moveTo(xS(ages[0]), yS(values[0])); for (let i = 1; i < values.length; i++)ctx.lineTo(xS(ages[i]), yS(values[i])); ctx.stroke();
        for (let i = 0; i < values.length; i++) { ctx.beginPath(); ctx.arc(xS(ages[i]), yS(values[i]), dotRadius, 0, Math.PI * 2); ctx.fillStyle = lineColor; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.8; ctx.stroke(); }
        ctx.strokeStyle = 'rgba(120,180,80,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(pL, pT, cW, cH);
        return { xS, yS, ages, values, formatY };
    };

    const drawMultiLine = (canvas, ages, seriesData, opts = {}) => {
        const { gridColor = 'rgba(255,255,255,0.10)', axisColor = '#9ab889', yMinOverride, yMaxOverride, formatY = v => String(Math.round(v)), dotRadius = 1.5, yTickCount = 6 } = opts;
        const setup = setupCanvas(canvas); if (!setup) return null;
        const { ctx, cssW, cssH } = setup;
        if (ages.length === 1) { ages = [ages[0] - 1/12, ages[0]]; seriesData = seriesData.map(s => ({ ...s, values: [s.values[0], s.values[0]] })); }
        const pL = 50, pR = 10, pT = 12, pB = 30, cW = cssW - pL - pR, cH = cssH - pT - pB;
        const vis = seriesData.filter(s => s.visible); let all = []; vis.forEach(s => all.push(...s.values)); if (!all.length) all = [0, 1];
        const rMin = Math.min(...all), rMax = Math.max(...all), m = (rMax - rMin) * 0.06 || 1;
        const yMin = yMinOverride !== undefined ? yMinOverride : Math.floor(rMin - m);
        const yMax = yMaxOverride !== undefined ? yMaxOverride : Math.ceil(rMax + m);
        const minA = Math.floor(Math.min(...ages)), maxA = Math.ceil(Math.max(...ages));
        const xS = v => pL + ((v - minA) / (maxA - minA)) * cW; const yS = v => pT + cH - ((v - yMin) / (yMax - yMin)) * cH;
        ctx.clearRect(0, 0, cssW, cssH); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(pL, pT, cW, cH);
        const yTicks = calcTicks(yMin, yMax, yTickCount);
        drawGrid(ctx, { pL, pT, pB, cssW, cssH, cW, cH, xS, yS, yTicks, ageMin: minA, ageMax: maxA, gridColor, axisColor, formatY });
        vis.forEach(s => { ctx.beginPath(); ctx.strokeStyle = s.color; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.moveTo(xS(ages[0]), yS(s.values[0])); for (let i = 1; i < s.values.length; i++)ctx.lineTo(xS(ages[i]), yS(s.values[i])); ctx.stroke(); for (let i = 0; i < s.values.length; i++) { ctx.beginPath(); ctx.arc(xS(ages[i]), yS(s.values[i]), dotRadius, 0, Math.PI * 2); ctx.fillStyle = s.color; ctx.fill(); } });
        ctx.strokeStyle = 'rgba(120,180,80,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(pL, pT, cW, cH);
        return { xS, yS, ages, seriesData, formatY };
    };

    const attachTooltip = (wrap, canvas, info) => {
        const tip = wrap.querySelector('.tmg-tooltip'); if (!tip) return;
        canvas.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top; let best = -1, bd = Infinity; for (let i = 0; i < info.ages.length; i++) { const d = Math.hypot(mx - info.xS(info.ages[i]), my - info.yS(info.values[i])); if (d < bd && d < 25) { bd = d; best = i; } } if (best >= 0) { const a = info.ages[best], v = info.values[best]; const ay = Math.floor(a), am = Math.round((a - ay) * 12); tip.innerHTML = `<b>Age:</b> ${ay}y ${am}m &nbsp; <b>Value:</b> ${info.formatY(v)}`; tip.style.display = 'block'; const px = info.xS(a), py = info.yS(v); let tx = px - tip.offsetWidth / 2; if (tx < 0) tx = 0; if (tx + tip.offsetWidth > canvas.clientWidth) tx = canvas.clientWidth - tip.offsetWidth; tip.style.left = tx + 'px'; tip.style.top = (py - 32) + 'px'; } else tip.style.display = 'none'; });
        canvas.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    };

    const attachMultiTooltip = (wrap, canvas, infoGetter) => {
        const tip = wrap.querySelector('.tmg-tooltip'); if (!tip) return;
        canvas.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top; const info = infoGetter(); if (!info) return; let best = null, bd = Infinity; info.seriesData.filter(s => s.visible).forEach(s => { for (let i = 0; i < s.values.length; i++) { const d = Math.hypot(mx - info.xS(info.ages[i]), my - info.yS(s.values[i])); if (d < bd && d < 25) { bd = d; best = { series: s, idx: i }; } } }); if (best) { const a = info.ages[best.idx], v = best.series.values[best.idx]; const ay = Math.floor(a), am = Math.round((a - ay) * 12); tip.innerHTML = `<span style="color:${best.series.color}">●</span> <b>${best.series.label}:</b> ${info.formatY(v)} &nbsp; <b>Age:</b> ${ay}y ${am}m`; tip.style.display = 'block'; const px = info.xS(a), py = info.yS(v); let tx = px - tip.offsetWidth / 2; if (tx < 0) tx = 0; if (tx + tip.offsetWidth > canvas.clientWidth) tx = canvas.clientWidth - tip.offsetWidth; tip.style.left = tx + 'px'; tip.style.top = (py - 32) + 'px'; } else tip.style.display = 'none'; });
        canvas.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    };

    const CHART_DEFS = [
        { key: 'ti', title: 'Training Intensity', opts: { lineColor: '#fff', fillColor: 'rgba(255,255,255,0.05)' }, prepareData: raw => { const v = []; for (let i = 0; i < raw.length; i++) { if (i === 0 && typeof raw[i] === 'number' && Number(raw[i]) === 0) continue; v.push(Number(raw[i])); } return v; } },
        { key: 'skill_index', title: 'ASI', opts: { lineColor: '#fff', fillColor: 'rgba(255,255,255,0.05)', formatY: v => v >= 1000 ? Math.round(v).toLocaleString() : String(Math.round(v)) }, prepareData: raw => raw.map(Number) },
        { key: 'recommendation', title: 'REC', opts: { lineColor: '#fff', fillColor: 'rgba(255,255,255,0.05)', yMinOverride: 0, formatY: v => v.toFixed(1) }, prepareData: raw => { const v = raw.map(Number); return v; }, yMaxFn: vals => Math.max(6, Math.ceil(Math.max(...vals) * 10) / 10) }
    ];

    const MULTI_DEFS = [
        { title: 'Skills', get meta() { return getSkillMeta(); }, showToggle: true, enableKey: 'skills', getSeriesData: g => { const sm = getSkillMeta(); return sm.map(m => ({ key: m.key, label: m.label, color: m.color, values: (g[m.key] || []).map(Number), visible: true })); }, opts: { yMinOverride: 0, yMaxOverride: 20, dotRadius: 1.5, yTickCount: 11 } },
        {
            title: 'Peaks', meta: PEAK_META, showToggle: false, enableKey: 'peaks', getSeriesData: g => {
                const pk = g.peaks || {};
                console.log('[Graphs] Raw peaks data', { pk });
                /* Compute peaks from skills */
                if (_isGK) {
                    /* GK: Physical: Str+Sta+Pac+Jum (4×20=80), Tactical: 1v1+Aer+Com (3×20=60), Technical: Han+Ref+Kic+Thr (4×20=80) */
                    const PHYS = ['strength', 'stamina', 'pace', 'jumping'];
                    const TACT = ['one_on_ones', 'aerial_ability', 'communication'];
                    const TECH = ['handling', 'reflexes', 'kicking', 'throwing'];
                    const L = (g[PHYS[0]] || []).length;
                    if (L < 1) return PEAK_META.map(m => ({ key: m.key, label: m.label, color: m.color, values: [], visible: true }));
                    const sumAt = (keys, i) => keys.reduce((s, k) => s + ((g[k] || [])[i] || 0), 0);
                    const phys = [], tact = [], tech = [];
                    for (let i = 0; i < L; i++) {
                        phys.push(Math.round(sumAt(PHYS, i) / 80 * 1000) / 10);
                        tact.push(Math.round(sumAt(TACT, i) / 60 * 1000) / 10);
                        tech.push(Math.round(sumAt(TECH, i) / 80 * 1000) / 10);
                    }
                    return [
                        { key: 'physical', label: 'Physical', color: '#ffeb3b', values: phys, visible: true },
                        { key: 'tactical', label: 'Tactical', color: '#00e5ff', values: tact, visible: true },
                        { key: 'technical', label: 'Technical', color: '#ff4081', values: tech, visible: true }
                    ];
                }
                /* Outfield: Physical: Str+Sta+Pac+Hea (4×20=80), Tactical: Mar+Tac+Wor+Pos (4×20=80), Technical: Pas+Cro+Tec+Fin+Lon+Set (6×20=120) */
                const PHYS = ['strength', 'stamina', 'pace', 'heading'];
                const TACT = ['marking', 'tackling', 'workrate', 'positioning'];
                const TECH = ['passing', 'crossing', 'technique', 'finishing', 'longshots', 'set_pieces'];
                const L = (g[PHYS[0]] || []).length;
                if (L < 1) return PEAK_META.map(m => ({ key: m.key, label: m.label, color: m.color, values: [], visible: true }));
                const sumAt = (keys, i) => keys.reduce((s, k) => s + ((g[k] || [])[i] || 0), 0);
                const phys = [], tact = [], tech = [];
                for (let i = 0; i < L; i++) {
                    phys.push(Math.round(sumAt(PHYS, i) / 80 * 1000) / 10);
                    tact.push(Math.round(sumAt(TACT, i) / 80 * 1000) / 10);
                    tech.push(Math.round(sumAt(TECH, i) / 120 * 1000) / 10);
                }
                console.log('[Graphs] Peaks computed from skills', { g });
                return [
                    { key: 'physical', label: 'Physical', color: '#ffeb3b', values: phys, visible: true },
                    { key: 'tactical', label: 'Tactical', color: '#00e5ff', values: tact, visible: true },
                    { key: 'technical', label: 'Technical', color: '#ff4081', values: tech, visible: true }
                ];
            }, opts: { dotRadius: 1.5, yMinOverride: 0, yMaxOverride: 100, formatY: v => v.toFixed(1) + '%' }, legendInline: true
        }
    ];

    const buildSingleChart = (el, def, graphData, player) => {
        let values, ages;
        let enhanced = false;

        /* ASI fallback: if TM's skill_index is missing, reconstruct from TI or store */
        if (def.key === 'skill_index' && (!graphData[def.key] || graphData[def.key].length < 2)) {
            /* Priority 1: reconstruct ASI from TI array + current _playerASI */
            if (_playerASI > 0 && graphData.ti && graphData.ti.length >= 2) {
                try {
                    const tiRaw = graphData.ti;
                    /* TI array usually has a dummy 0 at index 0; skip it */
                    const tiStart = (typeof tiRaw[0] === 'number' && tiRaw[0] === 0) || tiRaw[0] === '0' || tiRaw[0] === 0 ? 1 : 0;
                    const tiVals = tiRaw.slice(tiStart).map(v => parseInt(v) || 0);
                    const L = tiVals.length;
                    if (L >= 2) {
                        const K = _isGK ? 48717927500 : (Math.pow(2, 9) * Math.pow(5, 4) * Math.pow(7, 7));
                        const asiArr = new Array(L);
                        asiArr[L - 1] = _playerASI;
                        for (let j = L - 2; j >= 0; j--) {
                            const ti = tiVals[j + 1];
                            const base = Math.pow(asiArr[j + 1] * K, 1 / 7);
                            asiArr[j] = Math.max(0, Math.round(Math.pow(base - ti / 10, 7) / K));
                        }
                        values = asiArr;
                        ages = buildAges(L, player.years, player.months);
                        enhanced = true;
                        console.log(`[Graphs] ASI reconstructed from TI (${L} points)`);
                    }
                } catch (e) { console.warn('[Graphs] ASI from TI failed', e); }
            }
            /* Priority 2: fall back to store SI records */
            if (!values) {
                try {
                    const store = TmPlayerDB.get(_playerId);
                    if (store && store.records) {
                        const keys = Object.keys(store.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));
                        const tmpAges = [], tmpVals = [];
                        keys.forEach(k => {
                            const si = parseInt(store.records[k].SI) || 0;
                            if (si <= 0) return;
                            tmpAges.push(ageToMonths(k) / 12);
                            tmpVals.push(si);
                        });
                        /* Extend to current age using live _playerASI from page */
                        if (tmpVals.length > 0 && _playerASI > 0) {
                            const curAge = player.years + player.months / 12;
                            const lastAge = tmpAges[tmpAges.length - 1];
                            if (curAge > lastAge + 0.001) {
                                tmpAges.push(curAge);
                                tmpVals.push(_playerASI);
                            }
                        }
                        if (tmpVals.length >= 1) {
                            values = tmpVals;
                            ages = tmpAges;
                            enhanced = true;
                        }
                    }
                } catch (e) { }
            }
            if (!values) return;
            /* REC fallback: if TM's recommendation is missing, use our store REREC */
        } else if (def.key === 'recommendation' && (!graphData[def.key] || graphData[def.key].length < 2)) {
            try {
                const store = TmPlayerDB.get(_playerId);
                if (store && store._v >= 3 && store.records) {
                    const keys = Object.keys(store.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));
                    const tmpAges = [], tmpVals = [];
                    keys.forEach(k => {
                        const rec = store.records[k];
                        if (rec.REREC == null) return;
                        tmpAges.push(ageToMonths(k) / 12);
                        tmpVals.push(rec.REREC);
                    });
                    if (tmpVals.length >= 1) {
                        values = tmpVals;
                        ages = tmpAges;
                        enhanced = true;
                    }
                }
            } catch (e) { }
            if (!values) return;
            /* TI fallback: compute from ASI differences when TM's TI graph is missing */
        } else if (def.key === 'ti' && (!graphData[def.key] || graphData[def.key].length < 2)) {
            const K = _isGK ? 48717927500 : (Math.pow(2, 9) * Math.pow(5, 4) * Math.pow(7, 7));
            /* Priority 1: compute TI from ASI graph data */
            if (graphData.skill_index && graphData.skill_index.length >= 2) {
                try {
                    const asiRaw = graphData.skill_index.map(Number);
                    const tiVals = [];
                    for (let i = 1; i < asiRaw.length; i++) {
                        const prev = Math.pow(asiRaw[i - 1] * K, 1 / 7);
                        const cur = Math.pow(asiRaw[i] * K, 1 / 7);
                        tiVals.push(Math.round((cur - prev) * 10));
                    }
                    if (tiVals.length >= 2) {
                        values = tiVals;
                        /* TI[i] corresponds to training from age[i] to age[i+1], so ages start one later */
                        ages = buildAges(tiVals.length, player.years, player.months);
                        enhanced = true;
                        console.log(`[Graphs] TI computed from ASI graph (${tiVals.length} points)`);
                    }
                } catch (e) { console.warn('[Graphs] TI from ASI graph failed', e); }
            }
            /* Priority 2: use TI from IndexedDB (compute & persist if missing) */
            if (!values) {
                try {
                    const store = TmPlayerDB.get(_playerId);
                    if (store && store.records) {
                        const keys = Object.keys(store.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));
                        /* Fill missing TI into records and persist */
                        let changed = false;
                        for (let i = 1; i < keys.length; i++) {
                            const rec = store.records[keys[i]];
                            if (rec.TI != null) continue;
                            const prevSI = Number(store.records[keys[i - 1]].SI) || 0;
                            const curSI = Number(rec.SI) || 0;
                            if (prevSI > 0 && curSI > 0) {
                                rec.TI = Math.round((Math.pow(curSI * K, 1 / 7) - Math.pow(prevSI * K, 1 / 7)) * 10);
                                changed = true;
                            }
                        }
                        if (changed) TmPlayerDB.set(_playerId, store);
                        /* Build graph arrays from stored TI */
                        const tiVals = [], tiAges = [];
                        for (let i = 1; i < keys.length; i++) {
                            const rec = store.records[keys[i]];
                            if (rec.TI == null) continue;
                            tiVals.push(rec.TI);
                            tiAges.push(ageToMonths(keys[i]) / 12);
                        }
                        if (tiVals.length >= 2) {
                            values = tiVals;
                            ages = tiAges;
                            enhanced = true;
                            console.log(`[Graphs] TI from IndexedDB (${tiVals.length} points, ${changed ? 'computed & saved' : 'already stored'})`);
                        }
                    }
                } catch (e) { }
            }
            if (!values) return;
        } else {
            const raw = graphData[def.key]; if (!raw) return;
            values = def.prepareData(raw); if (!values.length) return;
            ages = buildAges(values.length, player.years, player.months);
        }

        /* REC hybrid: splice our v3 REREC (0.01 precision) over TM's (0.10) */
        let recSpliceIdx = -1;
        if (def.key === 'recommendation') {
            try {
                const store = TmPlayerDB.get(_playerId);
                if (store && store._v >= 3 && store.records) {
                    const curAgeMonths = player.years * 12 + player.months;
                    const L = values.length;
                    for (let i = 0; i < L; i++) {
                        const am = curAgeMonths - (L - 1 - i);
                        const key = `${Math.floor(am / 12)}.${am % 12}`;
                        const rec = store.records[key];
                        if (rec && rec.REREC != null) {
                            if (recSpliceIdx < 0) recSpliceIdx = i;
                            values[i] = rec.REREC;
                        }
                    }
                    if (recSpliceIdx >= 0) console.log(`[Graphs] REC hybrid: TM data 0..${recSpliceIdx - 1}, our data ${recSpliceIdx}..${L - 1}`);
                }
            } catch (e) { }
        }

        /* Dynamic yMax: use yMaxFn if defined (e.g. REC → min 6.0) */
        const chartOpts = { ...def.opts };
        if (def.yMaxFn) chartOpts.yMaxOverride = def.yMaxFn(values);
        /* When we have enhanced REC data, show 2 decimals in tooltip */
        if (recSpliceIdx >= 0 || (enhanced && def.key === 'recommendation')) {
            chartOpts.formatY = v => v % 1 === 0 ? v.toFixed(1) : v.toFixed(2);
        }

        const wrap = document.createElement('div'); wrap.className = 'tmg-chart-wrap rounded-md';
        let enhLabel = '';
        if (enhanced && def.key === 'skill_index') enhLabel = ' <span class="text-xs font-normal" style="color:#f0c040">(from TI)</span>';
        else if (enhanced && def.key === 'ti') enhLabel = ' <span class="text-xs font-normal" style="color:#f0c040">(from ASI)</span>';
        else if (enhanced && def.key === 'recommendation') enhLabel = ' <span class="text-xs font-normal blue">(computed)</span>';
        else if (recSpliceIdx >= 0) enhLabel = ' <span class="text-xs font-normal" style="color:#38bdf8">(enhanced)</span>';
        wrap.innerHTML = `<div class="tmg-chart-title text-md font-bold">${def.title}${enhLabel}</div><canvas class="tmg-canvas" style="width:100%;height:260px;"></canvas><div class="tmg-tooltip py-1 px-2 rounded-sm text-sm"></div>`;
        el.appendChild(wrap);
        const canvas = wrap.querySelector('canvas');
        requestAnimationFrame(() => { const info = drawChart(canvas, ages, values, chartOpts); attachTooltip(wrap, canvas, info); });
    };

    /* Build per-skill arrays from v3 store records — fallback when TM skills unavailable */
    const buildStoreSkillGraphData = (player) => {
        try {
            const store = TmPlayerDB.get(_playerId);
            if (!store || !store.records) { console.log('[Skills] No store or no records'); return null; }
            const sm = getSkillMeta();
            const expectedLen = sm.length; /* 14 for outfield, 11 for GK */
            const sortedKeys = Object.keys(store.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));
            console.log('[Skills] store._v:', store._v, 'total records:', sortedKeys.length, 'isGK:', _isGK);
            const skillArrays = {};
            sm.forEach(m => { skillArrays[m.key] = []; });
            let count = 0;
            sortedKeys.forEach(k => {
                const rec = store.records[k];
                const hasSkills = rec.skills && rec.skills.length >= expectedLen;
                const nonZero = hasSkills && rec.skills.some(v => v !== 0);
                if (!hasSkills || !nonZero) {
                    console.log(`[Skills] skip ${k}: hasSkills=${hasSkills}, nonZero=${nonZero}`, rec.skills?.slice(0, 3));
                    return;
                }
                sm.forEach((m, i) => { skillArrays[m.key].push(rec.skills[i]); });
                count++;
            });
            console.log('[Skills] usable records with skills:', count);
            if (count < 1) return null;
            skillArrays._ages = sortedKeys.filter(k => {
                const r = store.records[k];
                return r.skills && r.skills.length >= expectedLen && r.skills.some(v => v !== 0);
            }).map(k => ageToMonths(k) / 12);
            return skillArrays;
        } catch (e) { console.log('[Skills] error:', e); return null; }
    };

    const buildMultiChart = (el, def, graphData, player, skillpoints, isOwnPlayer) => {
        let seriesData = def.getSeriesData(graphData);
        let fromStore = false;
        let storeAges = null;
        if (!seriesData.length || !seriesData[0].values.length) {
            /* Try store fallback */
            const storeGD = buildStoreSkillGraphData(player);
            if (storeGD) {
                storeAges = storeGD._ages;
                seriesData = def.getSeriesData(storeGD);
            }
            if (!seriesData.length || !seriesData[0].values.length) {
                /* No data at all — show enable card if own player, else info msg */
                if (isOwnPlayer && def.enableKey) {
                    buildEnableCard(el, def.enableKey);
                } else if (def.enableKey) {
                    const msg = document.createElement('div');
                    msg.className = 'rounded-md text-sm';
                    msg.style.cssText = 'background:rgba(0,0,0,0.15);border:1px solid rgba(120,180,80,0.2);padding:10px 14px;margin:4px 0 8px;color:#5a7a48;';
                    msg.textContent = `${def.title}: No data available (graph not enabled)`;
                    el.appendChild(msg);
                }
                return;
            }
            fromStore = true;
        }
        const ages = storeAges || buildAges(seriesData[0].values.length, player.years, player.months);
        const wrap = document.createElement('div'); wrap.className = 'tmg-chart-wrap rounded-md';
        const upSet = new Set((skillpoints?.up) || []); const downSet = new Set((skillpoints?.down) || []);
        const legendCls = def.legendInline ? 'tmg-legend tmg-legend-inline' : 'tmg-legend';
        let legendH = `<div class="${legendCls}">`;
        seriesData.forEach((s, i) => { let arr = ''; if (upSet.has(s.key)) arr = '<span class="tmg-skill-arrow text-xs" style="color:#4caf50">▲</span>'; else if (downSet.has(s.key)) arr = '<span class="tmg-skill-arrow text-xs" style="color:#f44336">▼</span>'; legendH += `<label class="tmg-legend-item text-sm"><input type="checkbox" data-idx="${i}" checked style="background:${s.color}"><span class="tmg-legend-dot" style="color:${s.color}">●</span>${s.label}${arr}</label>`; });
        legendH += '</div>';
        let toggleH = def.showToggle ? '<tm-row data-justify="center" data-gap="6px" data-cls="pt-1 pb-1"><tm-button data-variant="secondary" data-size="sm" data-cls="tmg-btn uppercase" data-action="all">All</tm-button><tm-button data-variant="secondary" data-size="sm" data-cls="tmg-btn uppercase" data-action="none">None</tm-button></tm-row>' : '';
        const computedLabel = fromStore ? ' <span class="text-xs font-normal blue">(computed)</span>' : '';
        const enableKey = (fromStore && isOwnPlayer && def.enableKey) ? def.enableKey : null;
        const enableBtnH = enableKey
            ? `<tm-button data-variant="lime" data-size="xs" data-cls="tmg-enable-btn font-bold uppercase" data-action="enableGraph" style="margin-left:auto;">Enable <img src="/pics/pro_icon.png" class="pro_icon"></tm-button>`
            : '';
        wrap.innerHTML = `<div class="tmg-chart-title text-md font-bold" style="display:flex;align-items:center;gap:8px;">${def.title}${computedLabel}${enableBtnH}</div><canvas class="tmg-canvas" style="width:100%;height:280px;"></canvas><div class="tmg-tooltip py-1 px-2 rounded-sm text-sm"></div>${legendH}${toggleH}`;
        el.appendChild(wrap);
        const canvas = wrap.querySelector('canvas'); let curInfo = null;
        const redraw = () => { curInfo = drawMultiLine(canvas, ages, seriesData, def.opts); };
        const handlers = {};
        if (enableKey) handlers.enableGraph = () => { if (typeof window.graph_enable === 'function') window.graph_enable(_playerId, enableKey); };
        if (def.showToggle) {
            handlers.all = () => { seriesData.forEach(s => s.visible = true); wrap.querySelectorAll('.tmg-legend input[type="checkbox"]').forEach((cb, i) => { cb.checked = true; cb.style.background = seriesData[i].color; }); redraw(); };
            handlers.none = () => { seriesData.forEach(s => s.visible = false); wrap.querySelectorAll('.tmg-legend input[type="checkbox"]').forEach((cb, i) => { cb.checked = false; cb.style.background = 'rgba(255,255,255,0.08)'; }); redraw(); };
        }
        TmUI?.render(wrap, undefined, handlers);
        wrap.querySelectorAll('.tmg-legend input[type="checkbox"]').forEach(cb => { cb.addEventListener('change', () => { const i = parseInt(cb.dataset.idx); seriesData[i].visible = cb.checked; cb.style.background = cb.checked ? seriesData[i].color : 'rgba(255,255,255,0.08)'; redraw(); }); });
        attachMultiTooltip(wrap, canvas, () => curInfo);
        requestAnimationFrame(() => redraw());
    };

    /* Enable button descriptions */
    const ENABLE_INFO = {
        skill_index: { title: 'Skill Index', desc: 'Monitor your player\'s ASI increase each training.', enableKey: 'skill_index' },
        recommendation: { title: 'Recommendation', desc: 'See when your player gained new recommendation stars.', enableKey: 'recommendation' },
        skills: { title: 'Skills', desc: 'Monitor when a player gained a point in a certain skill.', enableKey: 'skills' },
        peaks: { title: 'Peaks', desc: 'See what % of weekly training went into each peak area.', enableKey: 'peaks' }
    };

    /* R5 chart — reads R5 values from our v3 store (not from TM endpoint) */
    const buildR5Chart = (el, player) => {
        try {
            const store = TmPlayerDB.get(_playerId);
            if (!store || store._v < 3 || !store.records) return;
            const keys = Object.keys(store.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));
            const ages = [], values = [];
            keys.forEach(k => {
                const rec = store.records[k];
                if (rec.R5 == null) return;
                ages.push(ageToMonths(k) / 12);
                values.push(rec.R5);
            });
            if (values.length < 2) return;

            const rawMin = Math.min(...values), rawMax = Math.max(...values);
            const yMin = rawMin < 30 ? Math.floor(rawMin) : 30;
            const yMax = rawMax > 120 ? Math.ceil(rawMax) : 120;
            const opts = {
                lineColor: '#5b9bff', fillColor: 'rgba(91,155,255,0.06)',
                yMinOverride: yMin, yMaxOverride: yMax,
                formatY: v => v % 1 === 0 ? v.toFixed(1) : v.toFixed(2)
            };

            const wrap = document.createElement('div'); wrap.className = 'tmg-chart-wrap rounded-md';
            wrap.innerHTML = `<div class="tmg-chart-title text-md font-bold" style="display:flex;align-items:center;justify-content:space-between">
                    <span>R5 <span class="text-xs font-normal blue">(computed)</span></span>
                    <tm-button data-variant="secondary" data-size="xs" data-cls="tmg-export-btn" title="Export to Excel">⬇ Excel</tm-button>
                </div><canvas class="tmg-canvas" style="width:100%;height:260px;"></canvas><div class="tmg-tooltip py-1 px-2 rounded-sm text-sm"></div>`;
            el.appendChild(wrap);
            TmUI?.render(wrap);
            wrap.querySelector('.tmg-export-btn').addEventListener('click', () => {
                const row = values.map(v => v.toFixed(2).replace('.', ',')).join(';');
                const csv = 'sep=;\r\n' + row + '\r\n';
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `R5_player_${_playerId}.csv`;
                document.body.appendChild(a); a.click();
                setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
            });
            const canvas = wrap.querySelector('canvas');
            requestAnimationFrame(() => { const info = drawChart(canvas, ages, values, opts); attachTooltip(wrap, canvas, info); });
        } catch (e) { }
    };

    const buildEnableCard = (container, key) => {
        console.log('[Graphs] Building enable card for', key);
        const info = ENABLE_INFO[key];
        if (!info) return;
        const card = document.createElement('div');
        card.className = 'tmg-enable-card rounded-md py-4 px-4';
        card.innerHTML = `<tm-row data-justify="space-between" data-align="center" data-gap="12px"><div><div class="tmg-enable-title text-md font-bold">${info.title}</div><div class="tmg-enable-desc text-sm">${info.desc}</div></div><tm-button data-variant="lime" data-size="sm" data-cls="tmg-enable-btn font-bold uppercase px-4" data-action="enableGraph">Enable <img src="/pics/pro_icon.png" class="pro_icon"></tm-button></tm-row>`;
        TmUI?.render(card, undefined, {
            enableGraph: () => { if (typeof window.graph_enable === 'function') window.graph_enable(_playerId, info.enableKey); }
        });
        container.appendChild(card);
    };

    const render = (container, data, { isGK = false, playerId, playerASI = 0, ownClubIds = [], isOwnPlayer = false } = {}) => {
        containerRef = container;
        lastData = data;
        _isGK = isGK; _playerId = playerId; _playerASI = playerASI; _ownClubIds = ownClubIds; _isOwnPlayer = isOwnPlayer;
        container.innerHTML = '';
        const graphData = data.graphs;
        const player = data.player;
        const skillpoints = data.skillpoints;
        if (!graphData || !player) { container.innerHTML = '<div style="text-align:center;padding:40px;color:#5a7a48;font-style:italic">No graph data available</div>'; return; }

        /* TI chart first */
        buildSingleChart(container, CHART_DEFS[0], graphData, player);

        /* R5 chart — built entirely from our v3 store */
        buildR5Chart(container, player);

        /* Remaining charts (ASI, REC) */
        for (let i = 1; i < CHART_DEFS.length; i++) buildSingleChart(container, CHART_DEFS[i], graphData, player);

        MULTI_DEFS.forEach(def => buildMultiChart(container, def, graphData, player, skillpoints, isOwnPlayer));
    };

    const reRender = () => { if (containerRef && lastData) render(containerRef, lastData, { isGK: _isGK, playerId: _playerId, playerASI: _playerASI, ownClubIds: _ownClubIds, isOwnPlayer: _isOwnPlayer }); };

    return { render, reRender };
})();
