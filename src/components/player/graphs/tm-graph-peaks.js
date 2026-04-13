import { buildAges, drawMultiLine, attachMultiTooltip, checkboxHtml, buildEnableCard } from './tm-graph-utils.js';

'use strict';

const getPeaks = isGK => {
    return [
        {
            label: 'Physical',
            color: '#ffeb3b',
            values: [],
            visible: true,
            keys: isGK ? ['strength', 'stamina', 'pace', 'jumping'] : ['strength', 'stamina', 'pace', 'heading']
        },
        {
            label: 'Tactical',
            color: '#4caf50',
            values: [],
            visible: true,
            keys: isGK ? ['one_on_ones', 'aerial_ability', 'communication'] : ['marking', 'tackling', 'workrate', 'positioning']
        },
        {
            label: 'Technical',
            color: '#ff4081',
            values: [],
            visible: true,
            keys: isGK ? ['handling', 'reflexes', 'kicking', 'throwing'] : ['passing', 'crossing', 'technique', 'finishing', 'longshots', 'set_pieces']
        }
    ]
}


export const buildPeaksChart = (el, graphData, player) => {
    const numberOfTrainings = (graphData.strength || []).length;
    if (!numberOfTrainings) {
        if (player.isOwnPlayer) {
            buildEnableCard(el, 'peaks', player.id);
        } else {
            const msg = document.createElement('div');
            msg.className = 'rounded-md text-sm';
            msg.style.cssText = 'background:var(--tmu-surface-overlay-soft);border:1px solid var(--tmu-border-soft-alpha);padding:var(--tmu-space-md) var(--tmu-space-md);margin:var(--tmu-space-xs) 0 var(--tmu-space-sm);color:var(--tmu-text-dim);';
            msg.textContent = 'Peaks: No data available (graph not enabled)';
            el.appendChild(msg);
        }
        return;
    }
    const peaks = getPeaks(player.isGK).map(peak => {
        return {
            ...peak,
            values: Array(numberOfTrainings).fill(0).map((_, i) => {
                const peakTotal = peak.keys.reduce((total, skill) => {
                    total += graphData[skill][i];
                    return total
                }, 0);
                return peakTotal / (peak.keys.length * 20) * 100
            })
        }
    });
    const ages = buildAges(numberOfTrainings, player.years, player.months);
    const wrap = document.createElement('div');
    wrap.className = 'tmg-chart-wrap rounded-md';
    let legendH = '<div class="tmg-legend tmg-legend-inline">';
    peaks.forEach((s, i) => {
        legendH += `<label class="tmg-legend-item text-sm">${checkboxHtml({
            checked: true,
            attrs: { 'data-idx': i, style: `--tmu-checkbox-checked-bg:${s.color};--tmu-checkbox-checked-border:${s.color};` },
        })}<span class="tmg-legend-dot" style="color:${s.color}">●</span>${s.label}</label>`;
    });
    legendH += '</div>';
    wrap.innerHTML = `<div class="tmg-chart-title text-md font-bold">Peaks</div>
        <canvas class="tmg-canvas" style="width:100%;height:280px;"></canvas>
        <div class="tmg-tooltip py-1 px-2 rounded-sm text-sm">
    </div>${legendH}`;
    el.appendChild(wrap);

    const canvas = wrap.querySelector('canvas');
    let curInfo = null;
    const opts = { dotRadius: 1.5, yMinOverride: 0, yMaxOverride: 100, formatY: v => v.toFixed(1) + '%' };
    const redraw = () => { curInfo = drawMultiLine(canvas, ages, peaks, opts); };
    wrap.onchange = (event) => {
        const checkbox = event.target.closest('.tmg-legend .tmu-checkbox');
        if (!checkbox || !wrap.contains(checkbox)) return;
        const index = parseInt(checkbox.dataset.idx, 10);
        if (!Number.isFinite(index) || !peaks[index]) return;
        peaks[index].visible = checkbox.checked;
        redraw();
    };
    attachMultiTooltip(wrap, canvas, () => curInfo);
    requestAnimationFrame(() => redraw());
};
