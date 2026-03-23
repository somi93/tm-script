export const TmImportStyles = {
        inject() {
            if (document.getElementById('tmi-import-style')) return;
            const style = document.createElement('style');
            style.id = 'tmi-import-style';
            style.textContent = `
/* ── Base ── */
.tmi-page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; font-size: 13px; padding: 12px 14px;
}
.tmi-page h2 { margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #e8f5d8; }

.tmi-toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

/* ── Wrap container ── */
.tmi-wrap {
    background: #1c3410; border: 1px solid #3d6828; border-radius: 8px;
    overflow: hidden; margin-bottom: 12px;
}
.tmi-wrap-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; background: linear-gradient(180deg, #274a18, #1c3410);
    border-bottom: 1px solid #3d6828;
}
.tmi-wrap-head h2 { margin: 0; font-size: 14px; color: #e8f5d8; font-weight: 700; }
.tmi-wrap-body { padding: 12px 14px; }

/* ── Section title ── */
.tmi-section-title {
    color: #6a9a58; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.6px;
    padding-bottom: 6px; border-bottom: 1px solid #2a4a1c;
    margin-bottom: 8px;
}

/* ── DB player list ── */
.tmi-db-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px;
}
.tmi-db-header h2 { margin: 0; }
.tmi-db-count { font-size: 11px; color: #6a9a58; font-weight: 400; }
.tmi-db-table {
    width: 100%; border-collapse: collapse; font-size: 11px;
}
.tmi-db-table th {
    text-align: left; padding: 6px 6px; font-size: 10px; font-weight: 700;
    color: #6a9a58; text-transform: uppercase; letter-spacing: 0.4px;
    border-bottom: 1px solid #2a4a1c; white-space: nowrap;
    cursor: pointer; user-select: none;
}
.tmi-db-table th:hover { color: #c8e0b4; }
.tmi-db-table th.sorted { color: #6cc040; }
.tmi-db-table th .sort-arrow { font-size: 9px; margin-left: 2px; }
.tmi-db-table td {
    padding: 5px 6px; border-bottom: 1px solid rgba(42,74,28,.4);
    color: #c8e0b4; font-variant-numeric: tabular-nums; vertical-align: middle;
}
.tmi-db-table tbody tr:nth-child(odd) { background: #1c3410; }
.tmi-db-table tbody tr:nth-child(even) { background: #162e0e; }
.tmi-db-table tbody tr:hover { background: #243d18 !important; }
.tmi-db-table .c { text-align: center; }
.tmi-db-table .r { text-align: right; font-variant-numeric: tabular-nums; }
.tmi-db-table a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmi-db-table a:hover { color: #c8e0b4; text-decoration: underline; }
.tmi-db-table .pos-cell { color: #8aac72; font-size: 11px; }
.tmi-db-scroll {
    max-height: 70vh; overflow-y: auto;
    border: 1px solid #2a4a1c; border-radius: 6px; background: #162e0e;
}
.tmi-empty {
    text-align: center; color: #5a7a48; padding: 40px 20px;
    font-size: 13px; font-style: italic;
}

.tmi-toolbar .tmu-btn[aria-expanded='true'] {
    background: rgba(108,192,64,.18);
    border-color: #6cc040;
    color: #eff8e8;
    box-shadow: 0 0 8px rgba(108,192,64,.15);
}

.tmi-toolbar .tmu-btn[data-tone='warn'] {
    color: #d4a020;
    border-color: rgba(251,191,36,.3);
}

.tmi-toolbar .tmu-btn[data-tone='warn']:hover:not(:disabled) {
    border-color: rgba(251,191,36,.5);
    color: #fbbf24;
    background: rgba(251,191,36,.08);
}

/* ── Collapsible import section ── */
.tmi-import-section { display: none; margin-bottom: 12px; }
.tmi-import-section.open { display: block; }

/* ── File drop zone ── */
.tmi-dropzone {
    border: 2px dashed #3d6828; border-radius: 8px; padding: 24px;
    text-align: center; cursor: pointer; transition: all 0.15s;
    margin-bottom: 12px; color: #6a9a58; background: rgba(42,74,28,.15);
}
.tmi-dropzone:hover, .tmi-dropzone.dragover {
    border-color: #6cc040; background: rgba(42,74,28,.35);
}
.tmi-dropzone-icon { font-size: 24px; margin-bottom: 6px; }
.tmi-dropzone-text { font-size: 13px; color: #8aac72; }
.tmi-dropzone-sub { font-size: 11px; color: #5a7a48; margin-top: 4px; }
.tmi-file-input { display: none; }

/* ── Parsed players table ── */
.tmi-parsed { margin-bottom: 12px; }
.tmi-parsed-header {
    font-weight: 700; color: #80e048; margin-bottom: 8px; font-size: 13px;
}
.tmi-table {
    width: 100%; border-collapse: collapse; font-size: 11px;
}
.tmi-table th {
    text-align: left; padding: 6px 6px; font-size: 10px; font-weight: 700;
    color: #6a9a58; text-transform: uppercase; letter-spacing: 0.4px;
    border-bottom: 1px solid #2a4a1c;
}
.tmi-table td {
    padding: 5px 6px; border-bottom: 1px solid rgba(42,74,28,.4);
    color: #c8e0b4;
}
.tmi-table tbody tr:hover { background: rgba(255,255,255,.03); }
.tmi-table .c { text-align: center; }
.tmi-table .r { text-align: right; }
.tmi-table a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmi-table a:hover { color: #c8e0b4; text-decoration: underline; }
.tmi-table-scroll {
    max-height: 200px; overflow-y: auto;
    border: 1px solid #2a4a1c; border-radius: 6px; background: #162e0e;
}

/* ── Progress ── */
.tmi-progress { margin: 12px 0; }
.tmi-progress-bar-wrap {
    background: #1a2e10; border-radius: 6px; height: 22px; overflow: hidden;
    border: 1px solid #2a4a1c; position: relative; margin-bottom: 6px;
}
.tmi-progress-bar {
    height: 100%; background: linear-gradient(90deg, #3a7025, #6cc040);
    transition: width 0.3s; width: 0%; border-radius: 6px;
}
.tmi-progress-pct {
    position: absolute; inset: 0; display: flex; align-items: center;
    justify-content: center; font-size: 11px; font-weight: 700; color: #e8f5d8;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
.tmi-progress-text { font-size: 12px; color: #6a9a58; }

/* ── Log ── */
.tmi-log {
    background: #162e0e; border: 1px solid #2a4a1c; border-radius: 6px;
    padding: 10px; max-height: 200px; overflow-y: auto; font-family: monospace;
    font-size: 11px; line-height: 1.5; white-space: pre-wrap; color: #8aac72;
    margin-top: 12px;
}
.tmi-log .ok { color: #6cc040; }
.tmi-log .warn { color: #fbbf24; }
.tmi-log .err { color: #f87171; }

/* ── Actions ── */
.tmi-actions {
    display: flex; gap: 10px; margin-top: 12px; align-items: center;
}
.tmi-status { font-size: 12px; color: #6a9a58; }

/* ── Summary ── */
.tmi-summary {
    background: rgba(108,192,64,.08); border: 1px solid #4a9030; border-radius: 6px;
    padding: 12px; margin-top: 12px; color: #80e048; font-weight: 600; font-size: 13px;
}

/* ── Danger button ── */
/* ── Bad routine results panel ── */
.tmi-routine-panel {
    margin-bottom: 12px;
}
.tmi-routine-panel .tmi-wrap-body { max-height: 50vh; overflow-y: auto; }
.tmi-routine-cat {
    color: #6a9a58; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.6px;
    padding: 8px 0 4px; border-bottom: 1px solid #2a4a1c;
    margin: 10px 0 6px;
}
.tmi-routine-cat:first-child { margin-top: 0; }
.tmi-routine-cat span { color: #fbbf24; font-size: 12px; margin-left: 6px; }
`;
            document.head.appendChild(style);
        }
    };

