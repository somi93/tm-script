import { graphUiColors, buildAges, drawChart, attachTooltip } from './tm-graph-utils.js';

'use strict';

const asiK = isGK => isGK ? 48717927500 : (Math.pow(2, 9) * Math.pow(5, 4) * Math.pow(7, 7));

export const buildTiChart = (el, graphData, player) => {
    let values, ages;
    let enhanced = false;

    if (!graphData.ti || graphData.ti.length < 2) {
        /* Fallback: compute TI from ASI graph data */
        if (graphData.skill_index && graphData.skill_index.length >= 2) {
            try {
                const K = asiK(player.isGK);
                const asiRaw = graphData.skill_index.map(Number);
                const tiVals = [];
                for (let i = 1; i < asiRaw.length; i++) {
                    const prev = Math.pow(asiRaw[i - 1] * K, 1 / 7);
                    const cur = Math.pow(asiRaw[i] * K, 1 / 7);
                    tiVals.push(Math.round((cur - prev) * 10));
                }
                if (tiVals.length >= 2) {
                    values = tiVals;
                    ages = buildAges(tiVals.length, player.years, player.months);
                    enhanced = true;
                    console.log(`[Graphs] TI computed from ASI graph (${tiVals.length} points)`);
                }
            } catch (e) { console.warn('[Graphs] TI from ASI graph failed', e); }
        }
        if (!values) return;
    } else {
        const raw = graphData.ti;
        const v = [];
        for (let i = 0; i < raw.length; i++) {
            if (i === 0 && typeof raw[i] === 'number' && Number(raw[i]) === 0) continue;
            v.push(Number(raw[i]));
        }
        if (!v.length) return;
        values = v;
        ages = buildAges(values.length, player.years, player.months);
    }

    const uiColors = graphUiColors();
    const chartOpts = { lineColor: uiColors.neutralLine, fillColor: uiColors.chartFill };
    const enhLabel = enhanced ? ' <span class="text-xs font-normal" style="color:var(--tmu-text-warm-accent)">(from ASI)</span>' : '';
    const wrap = document.createElement('div');
    wrap.className = 'tmg-chart-wrap rounded-md';
    wrap.innerHTML = `<div class="tmg-chart-title text-md font-bold">Training Intensity${enhLabel}</div><canvas class="tmg-canvas" style="width:100%;height:260px;"></canvas><div class="tmg-tooltip py-1 px-2 rounded-sm text-sm"></div>`;
    el.appendChild(wrap);
    const canvas = wrap.querySelector('canvas');
    requestAnimationFrame(() => { const info = drawChart(canvas, ages, values, chartOpts); attachTooltip(wrap, canvas, info); });
};
