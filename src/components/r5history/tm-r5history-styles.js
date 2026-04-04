export const TmR5HistoryStyles = {
        inject() {
            if (document.getElementById('tmrc-styles')) return;
            const style = document.createElement('style');
            style.id = 'tmrc-styles';
            style.textContent = `

/* Modal overlay */
.tmrc-overlay {
    display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: var(--tmu-shadow-panel); z-index: 99999;
    align-items: center; justify-content: center;
}
.tmrc-overlay.open { display: flex; }

/* Modal */
.tmrc-modal {
    background: linear-gradient(135deg, var(--tmu-surface-card) 0%, var(--tmu-surface-card-soft) 100%);
    border: 1px solid var(--tmu-border-embedded); border-radius: var(--tmu-space-md);
    width: 94vw; max-width: 1400px; height: 88vh;
    display: flex; flex-direction: column;
    box-shadow: 0 12px 48px var(--tmu-shadow-panel);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--tmu-text-main);
}
.tmrc-modal * { box-sizing: border-box; }

/* Header */
.tmrc-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--tmu-space-lg) var(--tmu-space-xl); border-bottom: 1px solid var(--tmu-border-soft);
}
.tmrc-title { font-size: var(--tmu-font-lg); font-weight: 800; color: var(--tmu-text-inverse); display: flex; align-items: center; gap: var(--tmu-space-sm); }
#tmrc-close { color: var(--tmu-text-faint); }
#tmrc-close:hover:not(:disabled) { color: var(--tmu-danger); }

/* Filters bar */
.tmrc-filters {
    display: flex; align-items: center; gap: var(--tmu-space-sm);
    padding: var(--tmu-space-md) var(--tmu-space-xl); border-bottom: 1px solid var(--tmu-border-soft);
    flex-wrap: wrap;
}
.tmrc-filter-label { font-size: var(--tmu-font-xs); color: var(--tmu-text-faint); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-right: var(--tmu-space-xs); }

/* Body: chart + legend side by side */
.tmrc-body {
    display: flex; flex: 1; min-height: 0;
}

/* Chart area */
.tmrc-chart-area {
    flex: 1; min-width: 0; position: relative;
    padding: var(--tmu-space-md);
}
.tmrc-canvas {
    width: 100%; height: 100%; display: block; cursor: crosshair;
}
.tmrc-tooltip {
    display: none; position: absolute; z-index: 10;
    background: var(--tmu-surface-input-dark-focus); border: 1px solid var(--tmu-border-success);
    border-radius: var(--tmu-space-sm); padding: var(--tmu-space-sm) var(--tmu-space-md); font-size: var(--tmu-font-xs);
    color: var(--tmu-text-main); pointer-events: none; white-space: nowrap;
    box-shadow: 0 4px 16px var(--tmu-shadow-panel);
}

/* Legend sidebar */
.tmrc-legend {
    width: 280px; min-width: 280px; max-width: 280px;
    border-left: 1px solid var(--tmu-border-soft);
    overflow-y: auto; padding: var(--tmu-space-sm) 0;
}
.tmrc-legend-item {
    display: flex; align-items: center; gap: var(--tmu-space-sm);
    padding: var(--tmu-space-xs) var(--tmu-space-md); cursor: pointer; transition: background 0.12s;
    border-left: 3px solid transparent;
}
.tmrc-legend-item:hover { background: var(--tmu-success-fill-faint); }
.tmrc-legend-item.highlighted { background: var(--tmu-success-fill-soft); }
.tmrc-legend-item.hidden-player { opacity: 0.35; }
.tmrc-legend-swatch {
    width: 14px; height: 3px; border-radius: var(--tmu-space-xs); flex-shrink: 0;
}
.tmrc-legend-name {
    font-size: var(--tmu-font-xs); font-weight: 500; color: var(--tmu-text-main); flex: 1;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    text-decoration: none;
}
.tmrc-legend-name:hover { color: var(--tmu-text-inverse); text-decoration: underline; }
.tmrc-legend-pos {
    font-size: var(--tmu-font-2xs); font-weight: 700;
}
.tmrc-legend-age {
    font-size: var(--tmu-font-2xs); font-weight: 600; color: var(--tmu-text-faint); text-align: right; min-width: 28px;
}
.tmrc-legend-r5 {
    font-size: var(--tmu-font-xs); font-weight: 700; text-align: right; min-width: 36px;
}

/* Summary stats */
.tmrc-stats {
    display: flex; gap: var(--tmu-space-lg); padding: var(--tmu-space-sm) var(--tmu-space-xl);
    border-top: 1px solid var(--tmu-border-soft); font-size: var(--tmu-font-xs);
}
.tmrc-stat { display: flex; align-items: center; gap: var(--tmu-space-xs); }
.tmrc-stat-lbl { color: var(--tmu-text-faint); font-weight: 600; }
.tmrc-stat-val { color: var(--tmu-text-strong); font-weight: 700; }

#tmrc-issues-btn[data-tone='warn'] {
    border-color: var(--tmu-border-highlight);
    background: var(--tmu-highlight-fill);
    color: var(--tmu-warning);
}
#tmrc-issues-btn[data-tone='warn']:hover:not(:disabled) {
    background: var(--tmu-warning-fill);
    border-color: var(--tmu-warning);
}

/* Issues panel */
.tmrc-issues-panel {
    max-height: 80vh; overflow-y: auto; padding: var(--tmu-space-md) var(--tmu-space-xl);
    border-bottom: 1px solid var(--tmu-border-soft); background: var(--tmu-highlight-fill);
    font-size: var(--tmu-font-xs);
}
.tmrc-issues-table { margin-bottom: 0; }
.tmrc-issues-table a { color: var(--tmu-warning); text-decoration: none; }
.tmrc-issues-table a:hover { color: var(--tmu-text-inverse); text-decoration: underline; }
.tmrc-null { color: var(--tmu-danger); font-weight: 700; }
.tmrc-ok { color: var(--tmu-success); }

/* Scrollbar */
.tmrc-legend::-webkit-scrollbar { width: 6px; }
.tmrc-legend::-webkit-scrollbar-track { background: transparent; }
.tmrc-legend::-webkit-scrollbar-thumb { background: var(--tmu-border-embedded); border-radius: var(--tmu-space-xs); }

/* Legend search */
.tmrc-legend-search {
    display: flex; padding: var(--tmu-space-sm) var(--tmu-space-md); border-bottom: 1px solid var(--tmu-border-soft);
}

/* Legend header buttons */
.tmrc-legend-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--tmu-space-xs) var(--tmu-space-md) var(--tmu-space-sm); border-bottom: 1px solid var(--tmu-border-soft); margin-bottom: 0;
}
.tmrc-legend-hdr-title {
    font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-faint);
    text-transform: uppercase; letter-spacing: 0.5px;
}
.tmrc-legend-hdr-btns { display: flex; gap: var(--tmu-space-xs); }

/* Zoom controls */
.tmrc-zoom-controls {
    position: absolute; top: var(--tmu-space-lg); right: var(--tmu-space-xl); display: flex; gap: var(--tmu-space-xs); z-index: 5;
}
.tmrc-zoom-controls .tmu-btn {
    flex: 0 0 auto;
    backdrop-filter: blur(4px);
    background: var(--tmu-surface-panel-dark);
}
`;
            document.head.appendChild(style);
        }
    };

