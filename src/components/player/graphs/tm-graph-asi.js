import { graphUiColors, buildAges, drawChart, attachTooltip } from './tm-graph-utils.js';
import { TmLib } from '../../../lib/tm-lib.js';

'use strict';

export const buildAsiChart = (el, graphData, player) => {
    let values, ages;
    let enhanced = false;

    if (!graphData.skill_index || graphData.skill_index.length < 2) {
        /* Fallback: reconstruct ASI by stepping backwards through TI */
        values = [player.asi];
        (graphData.ti || []).map(Number).slice(2).reverse().forEach(ti => {
            const previousASI = TmLib.calcASIProjection({
                player: {
                    asi: values[0]
                },
                trainings: 1,
                avgTI: -ti
            });
            values.unshift(previousASI.newASI);
        });
    } else {
        values = graphData.skill_index.map(Number);
    }
    if (!values.length) return;
    ages = buildAges(values.length, player.age, player.month);
    const uiColors = graphUiColors();
    const chartOpts = {
        lineColor: uiColors.neutralLine,
        fillColor: uiColors.chartFill,
        formatY: v => v >= 1000 ? Math.round(v).toLocaleString() : String(Math.round(v))
    };
    const enhLabel = enhanced ? ' <span class="text-xs font-normal" style="color:var(--tmu-text-warm-accent)">(from TI)</span>' : '';
    const wrap = document.createElement('div');
    wrap.className = 'tmg-chart-wrap rounded-md';
    wrap.innerHTML = `<div class="tmg-chart-title text-md font-bold">ASI${enhLabel}</div><canvas class="tmg-canvas" style="width:100%;height:260px;"></canvas><div class="tmg-tooltip py-1 px-2 rounded-sm text-sm"></div>`;
    el.appendChild(wrap);
    const canvas = wrap.querySelector('canvas');
    requestAnimationFrame(() => { const info = drawChart(canvas, ages, values, chartOpts); attachTooltip(wrap, canvas, info); });
};
