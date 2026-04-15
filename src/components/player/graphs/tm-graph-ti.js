import { TmUtils } from '../../../lib/tm-utils.js';
import { graphUiColors, buildAges, drawChart, attachTooltip } from './tm-graph-utils.js';

'use strict';

export const buildTiChart = (el, player) => {
    const records = player.records || {};
    const sortedKeys = TmUtils.sortAgeKeys(Object.keys(records));
    const pairs = sortedKeys
        .map(k => { const [y, m] = k.split('.').map(Number); return { age: y + m / 12, value: records[k]?.TI ?? null }; })
        .filter(p => p.value != null);
    if (pairs.length < 2) return;
    const ages = pairs.map(p => p.age);
    const values = pairs.map(p => Number(p.value));
    const uiColors = graphUiColors();
    const wrap = document.createElement('div');
    wrap.className = 'tmg-chart-wrap rounded-md';
    wrap.innerHTML = `<div class="tmg-chart-title text-md font-bold">Training Intensity</div><canvas class="tmg-canvas" style="width:100%;height:260px;"></canvas><div class="tmg-tooltip py-1 px-2 rounded-sm text-sm"></div>`;
    el.appendChild(wrap);
    const canvas = wrap.querySelector('canvas');
    requestAnimationFrame(() => { const info = drawChart(canvas, ages, values, { lineColor: uiColors.neutralLine, fillColor: uiColors.chartFill }); attachTooltip(wrap, canvas, info); });
};
