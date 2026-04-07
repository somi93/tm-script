export const TmImportStyles = {
    inject() {
        if (document.getElementById('tmi-import-style')) return;
        const style = document.createElement('style');
        style.id = 'tmi-import-style';
        style.textContent = `
/* ── Base ── */
.tmi-page {
    flex: 1;
    min-width: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--tmu-text-main); font-size: var(--tmu-font-sm); padding: var(--tmu-space-md) var(--tmu-space-lg);
}
.tmi-page h2 { margin: 0 0 var(--tmu-space-md); font-size: var(--tmu-font-md); font-weight: 700; color: var(--tmu-text-strong); }

.tmi-toolbar {
    display: flex;
    gap: var(--tmu-space-sm);
    margin-bottom: var(--tmu-space-md);
    flex-wrap: wrap;
}

/* ── Wrap container ── */
.tmi-wrap {
    background: var(--tmu-surface-panel); border-radius: var(--tmu-space-sm);
    overflow: hidden; margin-bottom: var(--tmu-space-md);
}
.tmi-wrap-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--tmu-space-md) var(--tmu-space-lg); background: linear-gradient(180deg, var(--tmu-surface-tab-hover), var(--tmu-surface-panel));
}
.tmi-wrap-head h2 { margin: 0; font-size: var(--tmu-font-md); color: var(--tmu-text-strong); font-weight: 700; }
.tmi-wrap-body { padding: var(--tmu-space-md) var(--tmu-space-lg); }

/* ── DB player list ── */
.tmi-db-count { font-size: var(--tmu-font-xs); color: var(--tmu-text-faint); font-weight: 400; }
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
.tmi-import-section { display: none; margin-bottom: var(--tmu-space-md); }
.tmi-import-section.open { display: block; }

/* ── File drop zone ── */
.tmi-dropzone {
    border: 2px dashed var(--tmu-border-embedded); border-radius: var(--tmu-space-sm); padding: var(--tmu-space-xxl);
    text-align: center; cursor: pointer; transition: all 0.15s;
    margin-bottom: var(--tmu-space-md); color: var(--tmu-text-faint); background: var(--tmu-surface-tab);
}
.tmi-dropzone:hover, .tmi-dropzone.dragover {
    border-color: var(--tmu-success); background: var(--tmu-surface-tab-active);
}
.tmi-dropzone-icon { font-size: var(--tmu-font-2xl); margin-bottom: var(--tmu-space-sm); }
.tmi-dropzone-text { font-size: var(--tmu-font-sm); color: var(--tmu-text-muted); }
.tmi-dropzone-sub { font-size: var(--tmu-font-xs); color: var(--tmu-text-dim); margin-top: var(--tmu-space-xs); }
.tmi-file-input { display: none; }

/* ── Parsed players table ── */
.tmi-parsed { margin-bottom: var(--tmu-space-md); }
.tmi-parsed-header {
    font-weight: 700; color: var(--tmu-accent); margin-bottom: var(--tmu-space-sm); font-size: var(--tmu-font-sm);
}

/* ── Progress ── */
.tmi-progress { margin: var(--tmu-space-md) 0; }
.tmi-progress-bar-wrap {
    background: var(--tmu-success-fill); border-radius: var(--tmu-space-sm); height: 22px; overflow: hidden;
    border: 1px solid var(--tmu-border-soft); position: relative; margin-bottom: var(--tmu-space-sm);
}
.tmi-progress-bar {
    height: 100%; background: linear-gradient(90deg, var(--tmu-border-embedded), var(--tmu-success));
    transition: width 0.3s; width: 0%; border-radius: var(--tmu-space-sm);
}
.tmi-progress-pct {
    position: absolute; inset: 0; display: flex; align-items: center;
    justify-content: center; font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-strong);
    text-shadow: 0 1px 2px var(--tmu-shadow-panel);
}
.tmi-progress-text { font-size: var(--tmu-font-sm); color: var(--tmu-text-faint); }

/* ── Log ── */
.tmi-log {
    background: var(--tmu-surface-card-soft); border: 1px solid var(--tmu-border-soft); border-radius: var(--tmu-space-sm);
    padding: var(--tmu-space-md); max-height: 200px; overflow-y: auto; font-family: monospace;
    font-size: var(--tmu-font-xs); line-height: 1.5; white-space: pre-wrap; color: var(--tmu-text-muted);
    margin-top: var(--tmu-space-md);
}
.tmi-log .ok { color: var(--tmu-success); }
.tmi-log .warn { color: var(--tmu-warning); }
.tmi-log .err { color: var(--tmu-danger); }

/* ── Actions ── */
.tmi-actions {
    display: flex; gap: var(--tmu-space-md); margin-top: var(--tmu-space-md); align-items: center;
}
.tmi-status { font-size: var(--tmu-font-sm); color: var(--tmu-text-faint); }

/* ── Summary ── */
.tmi-summary {
    background: var(--tmu-success-fill); border: 1px solid var(--tmu-border-success); border-radius: var(--tmu-space-sm);
    padding: var(--tmu-space-md); margin-top: var(--tmu-space-md); color: var(--tmu-accent); font-weight: 600; font-size: var(--tmu-font-sm);
}

/* ── Danger button ── */
/* ── Bad routine results panel ── */
.tmi-routine-panel {
    margin-bottom: var(--tmu-space-md);
}
.tmi-routine-panel .tmi-wrap-body { max-height: 50vh; overflow-y: auto; }
.tmi-routine-cat {
    color: var(--tmu-text-faint); font-size: var(--tmu-font-xs); font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.6px;
    padding: var(--tmu-space-sm) 0 var(--tmu-space-xs); border-bottom: 1px solid var(--tmu-border-soft);
    margin: var(--tmu-space-md) 0 var(--tmu-space-sm);
}
.tmi-routine-cat:first-child { margin-top: 0; }
.tmi-routine-cat span { color: var(--tmu-warning); font-size: var(--tmu-font-sm); margin-left: var(--tmu-space-sm); }
`;
        document.head.appendChild(style);
    }
};

