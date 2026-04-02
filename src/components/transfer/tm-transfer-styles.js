export const TmTransferStyles = {
    inject() {
        if (document.getElementById('tms-style')) return;
        const css = `
    /* ─── Root layout ─── */
    .tmvu-main.tmvu-transfer-page {
        display: flex !important;
        gap: var(--tmu-space-lg);
        align-items: flex-start;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: var(--tmu-text-main);
    }

    /* ─── Sidebar ─── */
    #tms-sidebar,
    .tmvu-transfer-sidebar {
        width: 250px;
        min-width: 250px;
        background: transparent;
        box-sizing: border-box;
        position: sticky;
        top: var(--tmu-space-sm);
        max-height: calc(100vh - 20px);
        overflow-y: auto;
    }
    #tms-sidebar::-webkit-scrollbar, .tmvu-transfer-sidebar::-webkit-scrollbar { width: 4px; }
    #tms-sidebar::-webkit-scrollbar-track, .tmvu-transfer-sidebar::-webkit-scrollbar-track { background: var(--tmu-shadow-panel); }
    #tms-sidebar::-webkit-scrollbar-thumb, .tmvu-transfer-sidebar::-webkit-scrollbar-thumb { background: var(--tmu-border-embedded); border-radius: var(--tmu-space-xs); }

    /* Card-style sections (matching tm-player widget style) */
    .tms-sb-section {
        background: var(--tmu-surface-panel);
        border: 1px solid var(--tmu-border-embedded);
        border-radius: var(--tmu-space-sm);
        overflow: hidden;
        margin-bottom: var(--tmu-space-sm);
    }
    .tms-sb-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: var(--tmu-font-xs);
        font-weight: 700;
        color: var(--tmu-text-faint);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-sm);
        border-bottom: 1px solid var(--tmu-border-success);
    }
    .tms-for-inline {
        display: flex; align-items: center; gap: var(--tmu-space-xs);
        font-size: var(--tmu-font-xs); font-weight: 600; color: var(--tmu-text-panel-label);
        text-transform: none; letter-spacing: 0; cursor: pointer;
    }
    .tms-sb-body {
        padding: var(--tmu-space-sm) var(--tmu-space-md);
    }

    .tms-pos-formation { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--tmu-space-xs); }
    .tms-pos-formation-empty { pointer-events: none; }
    .tms-primary-actions { display: flex; flex-direction: column; gap: var(--tmu-space-sm); }
    .tms-filter-actions { display: flex; gap: var(--tmu-space-xs); }
    .tms-filter-action-cell { flex: 1; }
    .tms-filter-action-cell-wide { flex: 2; }
    .tms-more-toggle-wrap { margin: var(--tmu-space-lg) 0; }
    .tms-more-toggle-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }
    .tms-more-toggle .tms-more-arrow { font-size: var(--tmu-font-2xs); transition: transform .2s; }
    .tms-more-toggle.open .tms-more-arrow { transform: rotate(180deg); }
    .tms-more-body { display: none; }
    .tms-more-body.open { display: block; }

    .tms-filter-btn {
        padding: var(--tmu-space-xs) var(--tmu-space-xs);
        border-radius: var(--tmu-space-xs);
        font-size: var(--tmu-font-xs);
        font-weight: 700;
        border: 1px solid var(--tmu-border-input-overlay);
        background: var(--tmu-surface-overlay);
        color: var(--tmu-text-panel-label);
        cursor: pointer;
        text-align: center;
        transition: all 0.12s;
        user-select: none;
    }
    .tms-filter-btn.active  { background: var(--tmu-border-embedded); color: var(--tmu-text-strong); border-color: var(--tmu-success); }
    .tms-filter-btn:hover   { background: var(--tmu-surface-tab-hover); }
    .tms-filter-btn.tms-gk  { color: var(--tmu-success-strong); }
    .tms-filter-btn.tms-de  { color: var(--tmu-info); }
    .tms-filter-btn.tms-dm  { color: var(--tmu-warning); }
    .tms-filter-btn.tms-mf  { color: var(--tmu-warning); }
    .tms-filter-btn.tms-om  { color: var(--tmu-warning-soft); }
    .tms-filter-btn.tms-fw  { color: var(--tmu-danger); }

    .tms-row { display: flex; align-items: center; gap: var(--tmu-space-sm); margin-bottom: var(--tmu-space-xs); }
    .tms-row:last-child { margin-bottom: 0; }
    .tms-range-row { display: flex; align-items: center; gap: var(--tmu-space-xs); }
    .tms-range-sep { font-size: var(--tmu-font-xs); color: var(--tmu-text-dim); flex-shrink: 0; }
    .tms-range-wrap { opacity: 0.75; }
    .tms-range-val { font-size: var(--tmu-font-xs); font-weight: 700; }
    .tms-strong-val { font-weight: 700; }
    .tms-muted { color: var(--tmu-text-disabled-strong); }
    .tms-sel {
        flex: 1;
        background: var(--tmu-surface-overlay);
        border: 1px solid var(--tmu-border-input);
        border-radius: var(--tmu-space-xs);
        color: var(--tmu-text-strong);
        font-size: var(--tmu-font-sm);
        font-weight: 600;
        padding: var(--tmu-space-xs) var(--tmu-space-sm);
        outline: none;
        cursor: pointer;
        font-family: inherit;
        transition: border-color 0.15s;
    }
    .tms-sel:focus { border-color: var(--tmu-success); }

    .tms-skill-row { display: grid; grid-template-columns: 1fr auto; gap: var(--tmu-space-xs); margin-bottom: var(--tmu-space-xs); }
    .tms-skill-row:last-child { margin-bottom: 0; }
    .tms-skill-row .tms-sel { font-size: var(--tmu-font-xs); }

    .tms-post-note {
        font-size: var(--tmu-font-2xs);
        font-weight: 400;
        color: var(--tmu-text-dim);
        text-transform: none;
        letter-spacing: 0;
        margin-left: var(--tmu-space-xs);
    }

    #tms-filter-box {
        background: var(--tmu-surface-embedded);
        border: 1px solid var(--tmu-border-embedded);
        border-radius: var(--tmu-space-sm);
        padding: var(--tmu-space-sm);
        margin-bottom: var(--tmu-space-sm);
    }
    #tms-filter-box .tms-sb-section { margin-bottom: var(--tmu-space-sm); }
    #tms-filter-box .tms-sb-section:last-of-type { margin-bottom: var(--tmu-space-sm); }

    /* ─── Main content ─── */
    #tms-main,
    .tmvu-transfer-main { flex: 1 1 auto; min-width: 0; position: relative; }
    #tms-toolbar {
        position: absolute;
        top: var(--tmu-space-xs); right: var(--tmu-space-xs);
        z-index: 5;
        display: flex;
        align-items: center;
        gap: var(--tmu-space-xs);
        font-size: var(--tmu-font-xs);
        background: var(--tmu-surface-embedded);
        padding: 0 var(--tmu-space-sm);
        border-radius: var(--tmu-space-xs);
        pointer-events: none;
    }
    #tms-hits {
        font-size: var(--tmu-font-sm);
        font-weight: 800;
        color: var(--tmu-accent);
        font-variant-numeric: tabular-nums;
    }
    #tms-toolbar .tms-toolbar-label {
        font-size: var(--tmu-font-xs);
        color: var(--tmu-text-faint);
    }

    /* ─── Table ─── */
    .tms-table-wrap { overflow-x: auto; border-radius: var(--tmu-space-sm); border: 1px solid var(--tmu-border-soft); }
    .tms-table-wrap::-webkit-scrollbar { height: 4px; }
    .tms-table-wrap::-webkit-scrollbar-track { background: var(--tmu-shadow-panel); }
    .tms-table-wrap::-webkit-scrollbar-thumb { background: var(--tmu-border-embedded); border-radius: var(--tmu-space-xs); }

    #tms-table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--tmu-font-xs);
        color: var(--tmu-text-main);
    }
    #tms-table thead tr { border-bottom: 1px solid var(--tmu-border-soft);background: var(--tmu-surface-overlay); }
    #tms-table th {
        background: var(--tmu-surface-embedded);
        color: var(--tmu-text-faint);
        font-size: var(--tmu-font-xs);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        padding: var(--tmu-space-sm) var(--tmu-space-sm);
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
        position: sticky;
        top: 0;
        z-index: 2;
        background: var(--tmu-surface-embedded);
    }
    #tms-table th:hover { color: var(--tmu-text-main); background: var(--tmu-surface-tab-hover); }
    #tms-table th.sort-asc::after  { content: ' ▲'; color: var(--tmu-success); }
    #tms-table th.sort-desc::after { content: ' ▼'; color: var(--tmu-success); }
    #tms-table td {
        padding: var(--tmu-space-xs) var(--tmu-space-sm);
        border-bottom: 1px solid var(--tmu-border-input-overlay);
        vertical-align: middle;
        white-space: nowrap;
    }
    #tms-table .tms-player-row { background: var(--tmu-surface-panel); }
    #tms-table tbody .tms-player-row:nth-child(odd)  { background: var(--tmu-surface-panel); }
    #tms-table tbody .tms-player-row:nth-child(even) { background: var(--tmu-surface-embedded); }
    #tms-table .tms-player-row:hover { background: var(--tmu-surface-tab-hover) !important; cursor: pointer; }
    #tms-table .tms-player-row.tms-expanded { background: var(--tmu-border-contrast); }

    /* Column-specific */
    .tms-col-flag { width: 24px; text-align: center; }
    .tms-col-name { max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
    .tms-col-name a { color: var(--tmu-accent); text-decoration: none; font-weight: 600; }
    .tms-col-name a:hover { color: var(--tmu-text-main); text-decoration: underline; }
    .tms-note-icon {
        display: inline-block;
        margin-left: var(--tmu-space-xs);
        font-size: var(--tmu-font-xs);
        cursor: default;
        opacity: 0.75;
        vertical-align: middle;
        position: relative;
    }
    .tms-note-icon:hover { opacity: 1; }
    .tms-note-icon::after {
        content: attr(data-note);
        display: none;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: calc(100% + var(--tmu-space-xs));
        background: var(--tmu-surface-panel);
        border: 1px solid var(--tmu-border-live);
        border-radius: var(--tmu-space-xs);
        padding: var(--tmu-space-xs) var(--tmu-space-sm);
        font-size: var(--tmu-font-xs);
        color: var(--tmu-text-main);
        white-space: pre-wrap;
        max-width: 260px;
        min-width: 100px;
        word-break: break-word;
        z-index: 100002;
        box-shadow: 0 4px 14px var(--tmu-shadow-panel);
        pointer-events: none;
        line-height: 1.5;
    }
    .tms-note-icon:hover::after { display: block; }
    .tms-col-age  { text-align: center; white-space: nowrap; }
    .tms-col-r    { text-align: right; font-variant-numeric: tabular-nums; }
    .tms-col-c    { text-align: center; }
    .tms-col-asi  { color: var(--tmu-text-strong); }
    .tms-age-y  { font-size: var(--tmu-font-sm); font-weight: 700; color: var(--tmu-text-strong); }
    .tms-age-mo { font-size: var(--tmu-font-xs); color: var(--tmu-text-muted); margin-left: 0; }
    .tms-pos-bar { width: 3px; padding: 0 !important; border-radius: var(--tmu-space-xs); }
    .tms-col-posbar { width: 4px; padding: 0 !important; }
    .tms-rec {
        display: inline-block;
        padding: 0 var(--tmu-space-sm);
        border-radius: var(--tmu-space-sm);
        font-size: var(--tmu-font-xs);
        font-weight: 700;
    }
    [data-transfer-reload] {
        width: 22px;
        height: 22px;
        color: var(--tmu-text-dim);
        font-size: var(--tmu-font-sm);
        line-height: 1;
        margin-right: var(--tmu-space-xs);
        vertical-align: middle;
    }
    [data-transfer-reload].tms-reloading { animation: tms-spin 0.7s linear infinite; pointer-events: none; color: var(--tmu-success); }

    /* Pending tooltip indicator */
    .tms-tip-pending {
        color: var(--tmu-text-disabled-strong);
        font-size: var(--tmu-font-xs);
        animation: tms-pending-blink 1.2s ease-in-out infinite;
    }
    @keyframes tms-pending-blink { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }

    /* Skill columns (skills mode) */
    .tms-skill { text-align: center; padding: var(--tmu-space-xs) 0 !important; }
    .tms-skill0 { color: var(--tmu-text-disabled-strong); font-size: var(--tmu-font-xs); }
    .tms-bar-wrap { display: flex; align-items: center; gap: var(--tmu-space-xs); min-width: 38px; }
    .tms-bar { height: 8px; border-radius: var(--tmu-space-xs); min-width: 2px; flex-shrink: 0; }
    .tms-bar-wrap span { font-size: var(--tmu-font-xs); min-width: 12px; }

    /* ─── Expanded row ─── */
    tr.tms-expand-row td { padding: var(--tmu-space-md) var(--tmu-space-md) !important; background: var(--tmu-surface-panel) !important; cursor: default; }
    .tms-expand-inner { display: flex; gap: var(--tmu-space-xl); flex-wrap: wrap; }
    .tms-expand-skills { flex: 1; min-width: 240px; }
    .tms-expand-analysis { width: 215px; min-width: 190px; }
    .tms-exp-head {
        font-size: var(--tmu-font-2xs);
        font-weight: 700;
        color: var(--tmu-text-faint);
        text-transform: uppercase;
        letter-spacing: 0.6px;
        margin-bottom: var(--tmu-space-sm);
    }
    .tms-expand-note { font-weight: 400; color: var(--tmu-text-disabled-strong); }
    .tms-skill-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--tmu-space-xs); }
    .tms-skill-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
        padding: var(--tmu-space-xs) 0;
        background: var(--tmu-surface-overlay);
        border-radius: var(--tmu-space-xs);
        border: 1px solid var(--tmu-border-success);
    }
    .tms-sk-name { font-size: var(--tmu-font-2xs); color: var(--tmu-text-faint); text-transform: uppercase; }
    .tms-sk-bar  { width: 100%; height: 5px; background: var(--tmu-surface-overlay-strong); border-radius: var(--tmu-space-xs); overflow: hidden; }
    .tms-sk-fill { height: 100%; border-radius: var(--tmu-space-xs); }
    .tms-sk-val  { font-size: var(--tmu-font-sm); font-weight: 700; }
    .tms-an-row {
        display: flex;
        justify-content: space-between;
        padding: var(--tmu-space-xs) 0;
        border-bottom: 1px solid var(--tmu-border-faint);
        font-size: var(--tmu-font-xs);
    }
    .tms-an-row:last-child { border-bottom: none; }
    .tms-an-lbl { color: var(--tmu-text-faint); font-weight: 600; }
    .tms-an-val { color: var(--tmu-text-main); font-weight: 700; font-variant-numeric: tabular-nums; }

    /* ─── Loading / empty ─── */
    #tms-loading { text-align: center; padding: 48px var(--tmu-space-xl); color: var(--tmu-text-faint); font-size: var(--tmu-font-sm); }
    @keyframes tms-spin { to { transform: rotate(360deg); } }

    /* ─── Websocket-compatible watched rows ─── */
    #tms-table tr.tms-bump td             { background: var(--tmu-warning-fill) !important; }
    #tms-table tr.tms-bump a              { color: var(--tmu-warning) !important; }
    #tms-table tr.watched-player td           { background: var(--tmu-success-fill-soft) !important; }
    #tms-table tr.watched-player-currentbid td{ background: var(--tmu-success-fill-strong) !important; box-shadow: inset 0 0 0 1px var(--tmu-success-strong); }
    #tms-table tr.watched-player-outbid td   { background: var(--tmu-danger-fill) !important; box-shadow: inset 0 0 0 1px var(--tmu-danger); }
    #tms-table tr.watched-player a           { color: var(--tmu-text-strong); }

    /* ─── Time cell ─── */
    .tms-time-cell { position: relative; text-align: right; }
    .tms-time-cell::after {
        content: '';
        background: url(/pics/ultra2/clock2.png) no-repeat center;
        background-size: contain;
        display: inline-block;
        width: 13px; height: 13px;
        vertical-align: text-bottom;
        margin-left: 0;
    }
    .tms-time-cell .countdown-split-seconds,
    .tms-time-cell .countdown-split-minutes,
    .tms-time-cell .countdown-split-hours {
        width: 18px; text-align: left; padding-left: 0;
    }

    /* ─── Hide TM's page content, our UI lives directly on body ─── */
    #right_col, .column3_a, .column3_b, .column2_a { display: none !important; }

    /* ─── Custom modal ─── */
    #tms-modal-overlay {
        position: fixed; inset: 0; z-index: 200000;
        background: var(--tmu-shadow-panel);
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(3px);
    }
    .tms-modal {
        background: linear-gradient(160deg, var(--tmu-surface-panel) 0%, var(--tmu-surface-embedded) 100%);
        border: 1px solid var(--tmu-border-live);
        border-radius: var(--tmu-space-md);
        padding: 28px var(--tmu-space-xxl) var(--tmu-space-xl);
        max-width: 440px;
        width: calc(100% - 40px);
        box-shadow: 0 20px 60px var(--tmu-shadow-panel), 0 0 0 1px var(--tmu-success-fill-soft);
        color: var(--tmu-text-main);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .tms-modal-icon { font-size: var(--tmu-font-3xl); margin-bottom: var(--tmu-space-md); line-height: 1; }
    .tms-modal-title { font-size: var(--tmu-font-md); font-weight: 800; color: var(--tmu-text-strong); margin-bottom: var(--tmu-space-sm); }
    .tms-modal-msg { font-size: var(--tmu-font-sm); color: var(--tmu-text-panel-label); line-height: 1.65; margin-bottom: var(--tmu-space-xl); }
            `;
        const el = document.createElement('style');
        el.id = 'tms-style';
        el.textContent = css;
        document.head.appendChild(el);
    },
};

