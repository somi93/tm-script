export const TmImportStyles = {
        inject() {
            if (document.getElementById('tmi-import-style')) return;
            const style = document.createElement('style');
            style.id = 'tmi-import-style';
            style.textContent = `
/* ── Base ── */
.tmi-page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--tmu-text-main); font-size: 13px; padding: 12px 14px;
}
.tmi-page h2 { margin: 0 0 12px; font-size: 15px; font-weight: 700; color: var(--tmu-text-strong); }

.tmi-toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

/* ── Wrap container ── */
.tmi-wrap {
    background: var(--tmu-surface-panel); border: 1px solid var(--tmu-border-embedded); border-radius: 8px;
    overflow: hidden; margin-bottom: 12px;
}
.tmi-wrap-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; background: linear-gradient(180deg, var(--tmu-surface-tab-hover), var(--tmu-surface-panel));
    border-bottom: 1px solid var(--tmu-border-embedded);
}
.tmi-wrap-head h2 { margin: 0; font-size: 14px; color: var(--tmu-text-strong); font-weight: 700; }
.tmi-wrap-body { padding: 12px 14px; }

/* ── DB player list ── */
.tmi-db-count { font-size: 11px; color: var(--tmu-text-faint); font-weight: 400; }
.tmi-db-table {
    width: 100%; border-collapse: collapse; font-size: 11px;
}
.tmi-db-table th {
    text-align: left; padding: 6px 6px; font-size: 10px; font-weight: 700;
    color: var(--tmu-text-faint); text-transform: uppercase; letter-spacing: 0.4px;
    border-bottom: 1px solid var(--tmu-border-soft); white-space: nowrap;
    cursor: pointer; user-select: none;
}
.tmi-db-table th:hover { color: var(--tmu-text-main); }
.tmi-db-table td {
    padding: 5px 6px; border-bottom: 1px solid var(--tmu-border-faint);
    color: var(--tmu-text-main); font-variant-numeric: tabular-nums; vertical-align: middle;
}
.tmi-db-table tbody tr:nth-child(odd) { background: var(--tmu-surface-panel); }
.tmi-db-table tbody tr:nth-child(even) { background: var(--tmu-surface-card-soft); }
.tmi-db-table tbody tr:hover { background: var(--tmu-surface-tab-hover) !important; }
.tmi-db-table .c { text-align: center; }
.tmi-db-table .r { text-align: right; font-variant-numeric: tabular-nums; }
.tmi-db-table a { color: var(--tmu-accent); text-decoration: none; font-weight: 600; }
.tmi-db-table a:hover { color: var(--tmu-text-main); text-decoration: underline; }
.tmi-db-table .pos-cell { color: var(--tmu-text-muted); font-size: 11px; }
.tmi-db-scroll {
    max-height: 70vh; overflow-y: auto;
    border: 1px solid var(--tmu-border-soft); border-radius: 6px; background: var(--tmu-surface-card-soft);
}
.tmi-toolbar .tmu-btn[aria-expanded='true'] {
    background: var(--tmu-surface-tab-active);
    border-color: var(--tmu-success);
    color: var(--tmu-text-strong);
    box-shadow: 0 0 8px var(--tmu-success-fill-soft);
}

.tmi-toolbar .tmu-btn[data-tone='warn'] {
    color: var(--tmu-warning-soft);
    border-color: var(--tmu-border-warning);
}

.tmi-toolbar .tmu-btn[data-tone='warn']:hover:not(:disabled) {
    border-color: var(--tmu-border-warning);
    color: var(--tmu-warning);
    background: var(--tmu-warning-fill);
}

/* ── Collapsible import section ── */
.tmi-import-section { display: none; margin-bottom: 12px; }
.tmi-import-section.open { display: block; }

/* ── File drop zone ── */
.tmi-dropzone {
    border: 2px dashed var(--tmu-border-embedded); border-radius: 8px; padding: 24px;
    text-align: center; cursor: pointer; transition: all 0.15s;
    margin-bottom: 12px; color: var(--tmu-text-faint); background: var(--tmu-surface-tab);
}
.tmi-dropzone:hover, .tmi-dropzone.dragover {
    border-color: var(--tmu-success); background: var(--tmu-surface-tab-active);
}
.tmi-dropzone-icon { font-size: 24px; margin-bottom: 6px; }
.tmi-dropzone-text { font-size: 13px; color: var(--tmu-text-muted); }
.tmi-dropzone-sub { font-size: 11px; color: var(--tmu-text-dim); margin-top: 4px; }
.tmi-file-input { display: none; }

/* ── Parsed players table ── */
.tmi-parsed { margin-bottom: 12px; }
.tmi-parsed-header {
    font-weight: 700; color: var(--tmu-accent); margin-bottom: 8px; font-size: 13px;
}
.tmi-table {
    width: 100%; border-collapse: collapse; font-size: 11px;
}
.tmi-table th {
    text-align: left; padding: 6px 6px; font-size: 10px; font-weight: 700;
    color: var(--tmu-text-faint); text-transform: uppercase; letter-spacing: 0.4px;
    border-bottom: 1px solid var(--tmu-border-soft);
}
.tmi-table td {
    padding: 5px 6px; border-bottom: 1px solid var(--tmu-border-faint);
    color: var(--tmu-text-main);
}
.tmi-table tbody tr:hover { background: var(--tmu-border-contrast); }
.tmi-table .c { text-align: center; }
.tmi-table .r { text-align: right; }
.tmi-table a { color: var(--tmu-accent); text-decoration: none; font-weight: 600; }
.tmi-table a:hover { color: var(--tmu-text-main); text-decoration: underline; }
.tmi-table-scroll {
    max-height: 200px; overflow-y: auto;
    border: 1px solid var(--tmu-border-soft); border-radius: 6px; background: var(--tmu-surface-card-soft);
}

/* ── Progress ── */
.tmi-progress { margin: 12px 0; }
.tmi-progress-bar-wrap {
    background: var(--tmu-success-fill); border-radius: 6px; height: 22px; overflow: hidden;
    border: 1px solid var(--tmu-border-soft); position: relative; margin-bottom: 6px;
}
.tmi-progress-bar {
    height: 100%; background: linear-gradient(90deg, var(--tmu-border-embedded), var(--tmu-success));
    transition: width 0.3s; width: 0%; border-radius: 6px;
}
.tmi-progress-pct {
    position: absolute; inset: 0; display: flex; align-items: center;
    justify-content: center; font-size: 11px; font-weight: 700; color: var(--tmu-text-strong);
    text-shadow: 0 1px 2px var(--tmu-shadow-panel);
}
.tmi-progress-text { font-size: 12px; color: var(--tmu-text-faint); }

/* ── Log ── */
.tmi-log {
    background: var(--tmu-surface-card-soft); border: 1px solid var(--tmu-border-soft); border-radius: 6px;
    padding: 10px; max-height: 200px; overflow-y: auto; font-family: monospace;
    font-size: 11px; line-height: 1.5; white-space: pre-wrap; color: var(--tmu-text-muted);
    margin-top: 12px;
}
.tmi-log .ok { color: var(--tmu-success); }
.tmi-log .warn { color: var(--tmu-warning); }
.tmi-log .err { color: var(--tmu-danger); }

/* ── Actions ── */
.tmi-actions {
    display: flex; gap: 10px; margin-top: 12px; align-items: center;
}
.tmi-status { font-size: 12px; color: var(--tmu-text-faint); }

/* ── Summary ── */
.tmi-summary {
    background: var(--tmu-success-fill); border: 1px solid var(--tmu-border-success); border-radius: 6px;
    padding: 12px; margin-top: 12px; color: var(--tmu-accent); font-weight: 600; font-size: 13px;
}

/* ── Danger button ── */
/* ── Bad routine results panel ── */
.tmi-routine-panel {
    margin-bottom: 12px;
}
.tmi-routine-panel .tmi-wrap-body { max-height: 50vh; overflow-y: auto; }
.tmi-routine-cat {
    color: var(--tmu-text-faint); font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.6px;
    padding: 8px 0 4px; border-bottom: 1px solid var(--tmu-border-soft);
    margin: 10px 0 6px;
}
.tmi-routine-cat:first-child { margin-top: 0; }
.tmi-routine-cat span { color: var(--tmu-warning); font-size: 12px; margin-left: 6px; }
`;
            document.head.appendChild(style);
        }
    };

