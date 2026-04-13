import { TmUI } from '../../shared/tm-ui.js';
import { TmPlayerService } from '../../../services/player.js';
import { buildTiChart } from './tm-graph-ti.js';
import { buildAsiChart } from './tm-graph-asi.js';
import { buildRecChart } from './tm-graph-rec.js';
import { buildSkillsChart } from './tm-graph-skills.js';
import { buildPeaksChart } from './tm-graph-peaks.js';

'use strict';

export const TmGraphsMod = (() => {
    const CSS = `
.tmg-chart-wrap {
        position: relative; background: var(--tmu-surface-overlay-soft);
        border: 1px solid var(--tmu-border-soft-alpha-mid);
    padding: var(--tmu-space-sm) var(--tmu-space-xs) var(--tmu-space-xs); margin: var(--tmu-space-sm) 0 var(--tmu-space-md);
}
.tmg-chart-title { color: var(--tmu-text-strong); padding: 0 var(--tmu-space-sm) var(--tmu-space-xs); letter-spacing: 0.3px; }
.tmg-canvas { display: block; cursor: crosshair; }
.tmg-tooltip {
        position: absolute; background: var(--tmu-surface-overlay-strong); color: var(--tmu-text-inverse);
    pointer-events: none;
    z-index: 1000; white-space: nowrap; display: none;
        border: 1px solid var(--tmu-border-soft-alpha-mid); box-shadow: 0 2px 8px var(--tmu-shadow-panel);
}
.tmg-legend {
    display: grid; grid-template-columns: 1fr 1fr; gap: 0 var(--tmu-space-md);
    padding: var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-xs); max-width: 450px; margin: 0 auto;
}
.tmg-legend.tmg-legend-inline {
    grid-template-columns: repeat(3, auto); justify-content: center; gap: 0 var(--tmu-space-xl);
}
.tmg-legend-item {
    display: flex; align-items: center; gap: var(--tmu-space-xs);
    color: var(--tmu-text-main); cursor: pointer; user-select: none; padding: 0;
}
.tmg-legend-dot { font-size: var(--tmu-font-2xs); line-height: 1; }
.tmg-enable-card {
    background: var(--tmu-surface-overlay-soft); border: 1px solid var(--tmu-border-soft-alpha-mid);
    margin: var(--tmu-space-sm) 0 var(--tmu-space-md);
}
.tmg-enable-title { color: var(--tmu-text-faint); letter-spacing: 0.3px; }
.tmg-enable-desc { color: var(--tmu-text-dim); margin-top: var(--tmu-space-xs); }
.tmg-skill-arrow { margin-left: 0; }
`;
    (() => { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); })();

    let lastData = null;
    let containerRef = null;
    let _player = null;

    const buildR5Chart = () => { };

    const render = (container, data, { player: tooltipPlayer } = {}) => {
        containerRef = container;
        lastData = data;
        _player = tooltipPlayer;
        if (container.dataset.tmgExportBound !== '1') {
            container.dataset.tmgExportBound = '1';
            container.addEventListener('click', (event) => {
                const exportButton = event.target.closest('.tmg-export-btn');
                if (!exportButton || !container.contains(exportButton)) return;
                const chartWrap = exportButton.closest('.tmg-chart-wrap');
                const values = chartWrap?._tmgR5Values;
                if (!Array.isArray(values) || values.length === 0) return;

                const row = values.map(v => v.toFixed(2).replace('.', ',')).join(';');
                const csv = 'sep=;\r\n' + row + '\r\n';
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `R5_player_${_player?.id}.csv`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 500);
            });
        }
        container.innerHTML = '';
        const graphData = data.graphs;
        const player = data.player;
        const skillpoints = data.skillpoints;
        if (!graphData || !player) { container.innerHTML = TmUI.empty('No graph data available'); return; }

        buildTiChart(container, graphData, player);
        buildR5Chart(container, player);
        buildAsiChart(container, graphData, tooltipPlayer);
        buildRecChart(container, graphData, player);
        buildSkillsChart(container, graphData, player, skillpoints);
        buildPeaksChart(container, graphData, player);
    };

    const reRender = () => { if (containerRef && lastData) render(containerRef, lastData, { player: _player }); };

    const load = (container, player) => {
        container.innerHTML = TmUI.loading();
        TmPlayerService.fetchPlayerGraphs(player.id).then(data => {
            if (!data) {
                container.innerHTML = TmUI.error('Failed to load data');
                return;
            }
            render(container, data, { player });
        });
    };

    return { render, reRender, load };
})();
