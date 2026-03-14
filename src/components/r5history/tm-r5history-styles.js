export const TmR5HistoryStyles = {
        inject() {
            if (document.getElementById('tmrc-styles')) return;
            const style = document.createElement('style');
            style.id = 'tmrc-styles';
            style.textContent = `
/* Button */
.tmrc-btn {
    display: inline-block; padding: 4px 14px; margin-left: 10px;
    background: linear-gradient(135deg, #2a5a1c, #1c3a10);
    border: 1px solid #4a8a30; border-radius: 6px;
    color: #c8e0b4; font-size: 12px; font-weight: 700;
    cursor: pointer; text-decoration: none; vertical-align: middle;
    transition: all 0.2s;
}
.tmrc-btn:hover { background: linear-gradient(135deg, #3a7a2c, #2a5a1c); color: #fff; border-color: #6cc040; }

/* Modal overlay */
.tmrc-overlay {
    display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.85); z-index: 99999;
    align-items: center; justify-content: center;
}
.tmrc-overlay.open { display: flex; }

/* Modal */
.tmrc-modal {
    background: linear-gradient(135deg, #1a2e14 0%, #162810 100%);
    border: 1px solid #3a6a28; border-radius: 12px;
    width: 94vw; max-width: 1400px; height: 88vh;
    display: flex; flex-direction: column;
    box-shadow: 0 12px 48px rgba(0,0,0,0.7);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4;
}
.tmrc-modal * { box-sizing: border-box; }

/* Header */
.tmrc-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-bottom: 1px solid #2a4a1c;
}
.tmrc-title { font-size: 16px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px; }
.tmrc-close {
    background: none; border: none; color: #6a9a58; font-size: 22px;
    cursor: pointer; padding: 4px 8px; border-radius: 4px; line-height: 1;
}
.tmrc-close:hover { color: #ef4444; background: rgba(239,68,68,0.15); }

/* Filters bar */
.tmrc-filters {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-bottom: 1px solid #2a4a1c;
    flex-wrap: wrap;
}
.tmrc-filter-label { font-size: 11px; color: #6a9a58; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-right: 4px; }
.tmrc-filter-btn {
    padding: 4px 12px; border-radius: 5px; border: 1px solid #3a5a2a;
    background: #1c3410; color: #8abc78; font-size: 11px; font-weight: 700;
    cursor: pointer; transition: all 0.15s;
}
.tmrc-filter-btn:hover { background: #243d18; border-color: #5a8a40; }
.tmrc-filter-btn.active { background: #2a5a1c; border-color: #6cc040; color: #fff; }

/* Body: chart + legend side by side */
.tmrc-body {
    display: flex; flex: 1; min-height: 0;
}

/* Chart area */
.tmrc-chart-area {
    flex: 1; min-width: 0; position: relative;
    padding: 10px;
}
.tmrc-canvas {
    width: 100%; height: 100%; display: block; cursor: crosshair;
}
.tmrc-tooltip {
    display: none; position: absolute; z-index: 10;
    background: rgba(20,40,15,0.95); border: 1px solid #4a8a30;
    border-radius: 6px; padding: 6px 10px; font-size: 11px;
    color: #c8e0b4; pointer-events: none; white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5);
}

/* Legend sidebar */
.tmrc-legend {
    width: 280px; min-width: 280px; max-width: 280px;
    border-left: 1px solid #2a4a1c;
    overflow-y: auto; padding: 8px 0;
}
.tmrc-legend-title {
    font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.5px;
    padding: 4px 12px 6px; border-bottom: 1px solid #2a4a1c;
    margin-bottom: 4px;
}
.tmrc-legend-item {
    display: flex; align-items: center; gap: 6px;
    padding: 3px 12px; cursor: pointer; transition: background 0.12s;
    border-left: 3px solid transparent;
}
.tmrc-legend-item:hover { background: rgba(106,154,88,0.1); }
.tmrc-legend-item.highlighted { background: rgba(106,154,88,0.2); }
.tmrc-legend-item.hidden-player { opacity: 0.35; }
.tmrc-legend-cb {
    width: 13px; height: 13px; cursor: pointer; accent-color: #4a8a30; flex-shrink: 0;
}
.tmrc-legend-swatch {
    width: 14px; height: 3px; border-radius: 2px; flex-shrink: 0;
}
.tmrc-legend-name {
    font-size: 11px; font-weight: 500; color: #c8e0b4; flex: 1;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    text-decoration: none;
}
.tmrc-legend-name:hover { color: #fff; text-decoration: underline; }
.tmrc-legend-pos {
    font-size: 9px; font-weight: 700;
}
.tmrc-legend-age {
    font-size: 9px; font-weight: 600; color: #6a9a58; text-align: right; min-width: 28px;
}
.tmrc-legend-r5 {
    font-size: 10px; font-weight: 700; text-align: right; min-width: 36px;
}

/* Summary stats */
.tmrc-stats {
    display: flex; gap: 16px; padding: 8px 20px;
    border-top: 1px solid #2a4a1c; font-size: 11px;
}
.tmrc-stat { display: flex; align-items: center; gap: 4px; }
.tmrc-stat-lbl { color: #6a9a58; font-weight: 600; }
.tmrc-stat-val { color: #e0f0cc; font-weight: 700; }

/* Issues button */
.tmrc-issues-btn {
    padding: 3px 10px; border-radius: 5px; border: 1px solid #b45309;
    background: rgba(180,83,9,0.2); color: #fbbf24; font-size: 11px; font-weight: 700;
    cursor: pointer; transition: all 0.15s; margin-left: 8px;
}
.tmrc-issues-btn:hover { background: rgba(180,83,9,0.4); border-color: #fbbf24; }

/* Issues panel */
.tmrc-issues-panel {
    max-height: 80vh; overflow-y: auto; padding: 10px 20px;
    border-bottom: 1px solid #2a4a1c; background: rgba(180,83,9,0.06);
    font-size: 11px;
}
.tmrc-issues-panel table { width: 100%; border-collapse: collapse; }
.tmrc-issues-panel th {
    text-align: left; font-size: 10px; color: #6a9a58; font-weight: 700;
    text-transform: uppercase; padding: 3px 8px; border-bottom: 1px solid #2a4a1c;
}
.tmrc-issues-panel td {
    padding: 3px 8px; border-bottom: 1px solid rgba(42,74,28,0.4); color: #c8e0b4;
}
.tmrc-issues-panel a { color: #fbbf24; text-decoration: none; }
.tmrc-issues-panel a:hover { color: #fff; text-decoration: underline; }
.tmrc-null { color: #ef4444; font-weight: 700; }
.tmrc-ok { color: #4ade80; }

/* Scrollbar */
.tmrc-legend::-webkit-scrollbar { width: 6px; }
.tmrc-legend::-webkit-scrollbar-track { background: transparent; }
.tmrc-legend::-webkit-scrollbar-thumb { background: #3a5a2a; border-radius: 3px; }

/* Legend search */
.tmrc-legend-search {
    display: flex; padding: 6px 10px; border-bottom: 1px solid #2a4a1c;
}
.tmrc-legend-search input {
    width: 100%; padding: 4px 8px; border-radius: 5px;
    border: 1px solid #3a5a2a; background: #162e0e; color: #c8e0b4;
    font-size: 11px; font-family: inherit; outline: none;
    transition: border-color 0.2s;
}
.tmrc-legend-search input::placeholder { color: #5a7a48; }
.tmrc-legend-search input:focus { border-color: #6cc040; background: #1a3412; }

/* Legend header buttons */
.tmrc-legend-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 4px 12px 6px; border-bottom: 1px solid #2a4a1c; margin-bottom: 0;
}
.tmrc-legend-hdr-title {
    font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.5px;
}
.tmrc-legend-hdr-btns { display: flex; gap: 4px; }
.tmrc-legend-hdr-btn {
    padding: 2px 8px; border-radius: 4px; border: 1px solid #3a5a2a;
    background: #1c3410; color: #8abc78; font-size: 9px; font-weight: 700;
    cursor: pointer; transition: all 0.15s;
}
.tmrc-legend-hdr-btn:hover { background: #2a5a1c; border-color: #6cc040; color: #fff; }

/* Zoom controls */
.tmrc-zoom-controls {
    position: absolute; top: 14px; right: 18px; display: flex; gap: 4px; z-index: 5;
}
.tmrc-zoom-btn {
    padding: 3px 10px; border-radius: 5px; border: 1px solid #3a5a2a;
    background: rgba(28,52,16,0.85); color: #8abc78; font-size: 11px; font-weight: 700;
    cursor: pointer; transition: all 0.15s; backdrop-filter: blur(4px);
}
.tmrc-zoom-btn:hover { background: #2a5a1c; border-color: #6cc040; color: #fff; }
`;
            document.head.appendChild(style);
        }
    };

