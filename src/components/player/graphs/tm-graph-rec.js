import { graphUiColors, buildAges, drawChart, attachTooltip } from './tm-graph-utils.js';

'use strict';

export const buildRecChart = (el, graphData, player) => {
    if (!graphData.recommendation || graphData.recommendation.length < 2) return;
    const values = graphData.recommendation.map(Number);
    if (!values.length) return;
    const ages = buildAges(values.length, player.years, player.months);
    const yMaxOverride = Math.max(6, Math.ceil(Math.max(...values) * 10) / 10);
    const uiColors = graphUiColors();
    const chartOpts = {
        lineColor: uiColors.neutralLine,
        fillColor: uiColors.chartFill,
        yMinOverride: 0,
        yMaxOverride,
        formatY: v => v.toFixed(1)
    };
    const wrap = document.createElement('div');
    wrap.className = 'tmg-chart-wrap rounded-md';
    wrap.innerHTML = `<div class="tmg-chart-title text-md font-bold">REC</div><canvas class="tmg-canvas" style="width:100%;height:260px;"></canvas><div class="tmg-tooltip py-1 px-2 rounded-sm text-sm"></div>`;
    el.appendChild(wrap);
    const canvas = wrap.querySelector('canvas');
    requestAnimationFrame(() => { const info = drawChart(canvas, ages, values, chartOpts); attachTooltip(wrap, canvas, info); });
};
