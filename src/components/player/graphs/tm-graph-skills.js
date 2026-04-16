import { TmUI } from '../../shared/tm-ui.js';
import { SKILL_DEFS_OUT, SKILL_DEFS_GK, GRAPH_KEYS_OUT, GRAPH_KEYS_GK } from '../../../constants/skills.js';
import { TmUtils } from '../../../lib/tm-utils.js';
import { TmPlayerService } from '../../../services/player.js';
import { buildAges, drawMultiLine, attachMultiTooltip, checkboxHtml, buildEnableCard } from './tm-graph-utils.js';

'use strict';

const SKILL_META = SKILL_DEFS_OUT.map(s => ({ key: s.key, label: s.name, color: s.color }));
const SKILL_META_GK = SKILL_DEFS_GK.map(s => ({ key: s.key2 || s.key, label: s.name, color: s.color }));

export const buildSkillsChart = async (el, player) => {
    if (player.isOwnPlayer) {
        const graphData = await TmPlayerService.fetchPlayerGraphs(player);
        if (graphData?.graphs?.strength == null) {
            buildEnableCard(el, 'skills', player.id);
            return;
        }
    }

    const records = player.records || {};
    const sortedKeys = TmUtils.sortAgeKeys(Object.keys(records));
    const statKeys = player.isGK ? GRAPH_KEYS_GK : GRAPH_KEYS_OUT;
    const keyIdx = Object.fromEntries(statKeys.map((k, i) => [k, i]));
    const sm = player.isGK ? SKILL_META_GK : SKILL_META;
    const seriesData = sm.map(m => ({
        key: m.key, label: m.label, color: m.color, visible: true,
        values: sortedKeys.map(k => records[k]?.skills?.[keyIdx[m.key]] ?? 0).map(Number),
    }));

    if (!seriesData.length || !seriesData[0].values.length) return;

    const ages = sortedKeys.map(k => { const [y, m] = k.split('.').map(Number); return y + m / 12; });
    const wrap = document.createElement('div');
    wrap.className = 'tmg-chart-wrap rounded-md';
    const upSet = new Set();
    const downSet = new Set();
    let legendH = '<div class="tmg-legend">';
    seriesData.forEach((s, i) => {
        let arr = '';
        if (upSet.has(s.key)) arr = '<span class="tmg-skill-arrow text-xs" style="color:var(--tmu-success)">▲</span>';
        else if (downSet.has(s.key)) arr = '<span class="tmg-skill-arrow text-xs" style="color:var(--tmu-danger)">▼</span>';
        legendH += `<label class="tmg-legend-item text-sm">${checkboxHtml({
            checked: true,
            attrs: { 'data-idx': i, style: `--tmu-checkbox-checked-bg:${s.color};--tmu-checkbox-checked-border:${s.color};` },
        })}<span class="tmg-legend-dot" style="color:${s.color}">●</span>${s.label}${arr}</label>`;
    });
    legendH += '</div>';
    const toggleH = '<tm-row data-justify="center" data-gap="6px" data-cls="pt-1 pb-1"><tm-button data-variant="primary" data-size="sm" data-cls="uppercase" data-action="all">All</tm-button><tm-button data-variant="primary" data-size="sm" data-cls="uppercase" data-action="none">None</tm-button></tm-row>';
    wrap.innerHTML = `<div class="tmg-chart-title text-md font-bold">Skills</div><canvas class="tmg-canvas" style="width:100%;height:280px;"></canvas><div class="tmg-tooltip py-1 px-2 rounded-sm text-sm"></div>${legendH}${toggleH}`;
    el.appendChild(wrap);

    const canvas = wrap.querySelector('canvas');
    let curInfo = null;
    const opts = { yMinOverride: 0, yMaxOverride: 20, dotRadius: 1.5, yTickCount: 11, formatY: v => v.toFixed(2) };
    const redraw = () => { curInfo = drawMultiLine(canvas, ages, seriesData, opts); };
    TmUI?.render(wrap, undefined, {
        all: () => { seriesData.forEach(s => s.visible = true); wrap.querySelectorAll('.tmg-legend .tmu-checkbox').forEach(cb => { cb.checked = true; }); redraw(); },
        none: () => { seriesData.forEach(s => s.visible = false); wrap.querySelectorAll('.tmg-legend .tmu-checkbox').forEach(cb => { cb.checked = false; }); redraw(); },
    });
    wrap.onchange = (event) => {
        const checkbox = event.target.closest('.tmg-legend .tmu-checkbox');
        if (!checkbox || !wrap.contains(checkbox)) return;
        const index = parseInt(checkbox.dataset.idx, 10);
        if (!Number.isFinite(index) || !seriesData[index]) return;
        seriesData[index].visible = checkbox.checked;
        redraw();
    };
    attachMultiTooltip(wrap, canvas, () => curInfo);
    requestAnimationFrame(() => redraw());
};
