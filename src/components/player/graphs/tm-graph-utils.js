import { TmCanvasUtils } from '../../shared/tm-canvas-utils.js';
import { TmUI } from '../../shared/tm-ui.js';

'use strict';

const { calcTicks, setupCanvas, drawGrid } = TmCanvasUtils;

const themeColor = (name, fallback) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
};

export const graphUiColors = () => ({
    neutralLine: themeColor('--tmu-text-inverse', 'var(--tmu-text-inverse)'),
    chartFill: themeColor('--tmu-border-contrast', 'var(--tmu-border-contrast)'),
    chartFillSoft: themeColor('--tmu-surface-overlay-soft', 'var(--tmu-surface-overlay-soft)'),
    grid: themeColor('--tmu-border-soft-alpha-mid', 'var(--tmu-border-soft-alpha-mid)'),
    axis: themeColor('--tmu-text-panel-label', 'var(--tmu-text-panel-label)'),
    pointStroke: themeColor('--tmu-shadow-ring', 'var(--tmu-shadow-ring)'),
    frame: themeColor('--tmu-border-soft-alpha-strong', 'var(--tmu-border-soft-alpha-strong)'),
    infoLine: themeColor('--tmu-info-strong', 'var(--tmu-info-strong)'),
    infoFill: themeColor('--tmu-border-info', 'var(--tmu-border-info)'),
});

export const buildAges = (n, years, months) => {
    const cur = years + months / 12;
    const ages = [];
    for (let i = 0; i < n; i++) ages.push(cur - (n - 1 - i) / 12);
    return ages;
};

export const drawChart = (canvas, ages, values, opts = {}) => {
    const uiColors = graphUiColors();
    const { lineColor = uiColors.neutralLine, fillColor = uiColors.chartFill, gridColor = uiColors.grid, axisColor = uiColors.axis, dotRadius = 2.5, yMinOverride, yMaxOverride, formatY = v => String(Math.round(v)) } = opts;
    const setup = setupCanvas(canvas); if (!setup) return null;
    const { ctx, cssW, cssH } = setup;
    if (ages.length === 1) { ages = [ages[0] - 1 / 12, ages[0]]; values = [values[0], values[0]]; }
    const pL = 50, pR = 10, pT = 12, pB = 30, cW = cssW - pL - pR, cH = cssH - pT - pB;
    const minA = Math.floor(Math.min(...ages)), maxA = Math.ceil(Math.max(...ages));
    const rMin = Math.min(...values), rMax = Math.max(...values), m = (rMax - rMin) * 0.06 || 1;
    const yMin = yMinOverride !== undefined ? yMinOverride : Math.floor(rMin - m);
    const yMax = yMaxOverride !== undefined ? yMaxOverride : Math.ceil(rMax + m);
    const xS = v => pL + ((v - minA) / (maxA - minA)) * cW;
    const yS = v => pT + cH - ((v - yMin) / (yMax - yMin)) * cH;
    ctx.clearRect(0, 0, cssW, cssH); ctx.fillStyle = uiColors.chartFillSoft; ctx.fillRect(pL, pT, cW, cH);
    const yTicks = calcTicks(yMin, yMax, 6);
    drawGrid(ctx, { pL, pT, pB, cssW, cssH, cW, cH, xS, yS, yTicks, ageMin: minA, ageMax: maxA, gridColor, axisColor, formatY });
    ctx.beginPath(); ctx.moveTo(xS(ages[0]), yS(values[0]));
    for (let i = 1; i < values.length; i++) ctx.lineTo(xS(ages[i]), yS(values[i]));
    ctx.lineTo(xS(ages[ages.length - 1]), pT + cH); ctx.lineTo(xS(ages[0]), pT + cH); ctx.closePath();
    ctx.fillStyle = fillColor; ctx.fill();
    ctx.beginPath(); ctx.strokeStyle = lineColor; ctx.lineWidth = 1.8; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.moveTo(xS(ages[0]), yS(values[0]));
    for (let i = 1; i < values.length; i++) ctx.lineTo(xS(ages[i]), yS(values[i]));
    ctx.stroke();
    for (let i = 0; i < values.length; i++) {
        ctx.beginPath(); ctx.arc(xS(ages[i]), yS(values[i]), dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = lineColor; ctx.fill();
        ctx.strokeStyle = uiColors.pointStroke; ctx.lineWidth = 0.8; ctx.stroke();
    }
    ctx.strokeStyle = uiColors.frame; ctx.lineWidth = 1; ctx.strokeRect(pL, pT, cW, cH);
    return { xS, yS, ages, values, formatY };
};

export const drawMultiLine = (canvas, ages, seriesData, opts = {}) => {
    const uiColors = graphUiColors();
    const { gridColor = uiColors.grid, axisColor = uiColors.axis, yMinOverride, yMaxOverride, formatY = v => String(Math.round(v)), dotRadius = 1.5, yTickCount = 6 } = opts;
    const setup = setupCanvas(canvas); if (!setup) return null;
    const { ctx, cssW, cssH } = setup;
    if (ages.length === 1) { ages = [ages[0] - 1 / 12, ages[0]]; seriesData = seriesData.map(s => ({ ...s, values: [s.values[0], s.values[0]] })); }
    const pL = 50, pR = 10, pT = 12, pB = 30, cW = cssW - pL - pR, cH = cssH - pT - pB;
    const vis = seriesData.filter(s => s.visible); let all = []; vis.forEach(s => all.push(...s.values)); if (!all.length) all = [0, 1];
    const rMin = Math.min(...all), rMax = Math.max(...all), m = (rMax - rMin) * 0.06 || 1;
    const yMin = yMinOverride !== undefined ? yMinOverride : Math.floor(rMin - m);
    const yMax = yMaxOverride !== undefined ? yMaxOverride : Math.ceil(rMax + m);
    const minA = Math.floor(Math.min(...ages)), maxA = Math.ceil(Math.max(...ages));
    const xS = v => pL + ((v - minA) / (maxA - minA)) * cW;
    const yS = v => pT + cH - ((v - yMin) / (yMax - yMin)) * cH;
    ctx.clearRect(0, 0, cssW, cssH); ctx.fillStyle = uiColors.chartFillSoft; ctx.fillRect(pL, pT, cW, cH);
    const yTicks = calcTicks(yMin, yMax, yTickCount);
    drawGrid(ctx, { pL, pT, pB, cssW, cssH, cW, cH, xS, yS, yTicks, ageMin: minA, ageMax: maxA, gridColor, axisColor, formatY });
    vis.forEach(s => {
        ctx.beginPath(); ctx.strokeStyle = s.color; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.moveTo(xS(ages[0]), yS(s.values[0]));
        for (let i = 1; i < s.values.length; i++) ctx.lineTo(xS(ages[i]), yS(s.values[i]));
        ctx.stroke();
        for (let i = 0; i < s.values.length; i++) {
            ctx.beginPath(); ctx.arc(xS(ages[i]), yS(s.values[i]), dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = s.color; ctx.fill();
        }
    });
    ctx.strokeStyle = uiColors.frame; ctx.lineWidth = 1; ctx.strokeRect(pL, pT, cW, cH);
    return { xS, yS, ages, seriesData, formatY };
};

export const attachTooltip = (wrap, canvas, info) => {
    const tip = wrap.querySelector('.tmg-tooltip'); if (!tip) return;
    canvas.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top;
        let best = -1, bd = Infinity;
        for (let i = 0; i < info.ages.length; i++) {
            const d = Math.hypot(mx - info.xS(info.ages[i]), my - info.yS(info.values[i]));
            if (d < bd && d < 25) { bd = d; best = i; }
        }
        if (best >= 0) {
            const a = info.ages[best], v = info.values[best];
            const ay = Math.floor(a), am = Math.round((a - ay) * 12);
            tip.innerHTML = `<b>Age:</b> ${ay}y ${am}m &nbsp; <b>Value:</b> ${info.formatY(v)}`;
            tip.style.display = 'block';
            const px = info.xS(a), py = info.yS(v);
            let tx = px - tip.offsetWidth / 2; if (tx < 0) tx = 0; if (tx + tip.offsetWidth > canvas.clientWidth) tx = canvas.clientWidth - tip.offsetWidth;
            tip.style.left = tx + 'px'; tip.style.top = (py - 32) + 'px';
        } else tip.style.display = 'none';
    });
    canvas.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
};

export const attachMultiTooltip = (wrap, canvas, infoGetter) => {
    const tip = wrap.querySelector('.tmg-tooltip'); if (!tip) return;
    canvas.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top;
        const info = infoGetter(); if (!info) return;
        let best = null, bd = Infinity;
        info.seriesData.filter(s => s.visible).forEach(s => {
            for (let i = 0; i < s.values.length; i++) {
                const d = Math.hypot(mx - info.xS(info.ages[i]), my - info.yS(s.values[i]));
                if (d < bd && d < 25) { bd = d; best = { series: s, idx: i }; }
            }
        });
        if (best) {
            const a = info.ages[best.idx], v = best.series.values[best.idx];
            const ay = Math.floor(a), am = Math.round((a - ay) * 12);
            tip.innerHTML = `<span style="color:${best.series.color}">●</span> <b>${best.series.label}:</b> ${info.formatY(v)} &nbsp; <b>Age:</b> ${ay}y ${am}m`;
            tip.style.display = 'block';
            const px = info.xS(a), py = info.yS(v);
            let tx = px - tip.offsetWidth / 2; if (tx < 0) tx = 0; if (tx + tip.offsetWidth > canvas.clientWidth) tx = canvas.clientWidth - tip.offsetWidth;
            tip.style.left = tx + 'px'; tip.style.top = (py - 32) + 'px';
        } else tip.style.display = 'none';
    });
    canvas.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
};

export const checkboxHtml = opts => {
    const node = TmUI.checkbox(opts);
    return node?.outerHTML || '';
};

export const ENABLE_INFO = {
    skill_index: { title: 'Skill Index', desc: "Monitor your player's ASI increase each training.", enableKey: 'skill_index' },
    recommendation: { title: 'Recommendation', desc: 'See when your player gained new recommendation stars.', enableKey: 'recommendation' },
    skills: { title: 'Skills', desc: 'Monitor when a player gained a point in a certain skill.', enableKey: 'skills' },
    peaks: { title: 'Peaks', desc: 'See what % of weekly training went into each peak area.', enableKey: 'peaks' }
};

export const buildEnableCard = (container, key, playerId) => {
    console.log('[Graphs] Building enable card for', key);
    const info = ENABLE_INFO[key];
    if (!info) return;
    const card = document.createElement('div');
    card.className = 'tmg-enable-card rounded-md py-4 px-4';
    card.innerHTML = `<tm-row data-justify="space-between" data-align="center" data-gap="12px"><div><div class="tmg-enable-title text-md font-bold">${info.title}</div><div class="tmg-enable-desc text-sm">${info.desc}</div></div><tm-button data-variant="primary" data-size="sm" data-cls="font-bold uppercase px-4" data-action="enableGraph">Enable <img src="/pics/pro_icon.png" class="pro_icon"></tm-button></tm-row>`;
    TmUI?.render(card, undefined, {
        enableGraph: () => { if (typeof window.graph_enable === 'function') window.graph_enable(playerId, info.enableKey); }
    });
    container.appendChild(card);
};
