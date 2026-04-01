export const TmTransferStyles = {
    inject() {
        if (document.getElementById('tms-style')) return;
        const css = `
    /* ─── Root layout ─── */
    .tmvu-main.tmvu-transfer-page {
        display: flex !important;
        gap: 16px;
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
        top: 8px;
        max-height: calc(100vh - 20px);
        overflow-y: auto;
    }
    #tms-sidebar::-webkit-scrollbar, .tmvu-transfer-sidebar::-webkit-scrollbar { width: 4px; }
    #tms-sidebar::-webkit-scrollbar-track, .tmvu-transfer-sidebar::-webkit-scrollbar-track { background: var(--tmu-shadow-panel); }
    #tms-sidebar::-webkit-scrollbar-thumb, .tmvu-transfer-sidebar::-webkit-scrollbar-thumb { background: var(--tmu-border-embedded); border-radius: 2px; }

    /* Card-style sections (matching tm-player widget style) */
    .tms-sb-section {
        background: var(--tmu-surface-panel);
        border: 1px solid var(--tmu-border-embedded);
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 8px;
    }
    .tms-sb-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 10px;
        font-weight: 700;
        color: var(--tmu-text-faint);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 8px 12px 6px;
        border-bottom: 1px solid var(--tmu-border-success);
    }
    .tms-for-inline {
        display: flex; align-items: center; gap: 4px;
        font-size: 10px; font-weight: 600; color: var(--tmu-text-panel-label);
        text-transform: none; letter-spacing: 0; cursor: pointer;
    }
    .tms-sb-body {
        padding: 8px 10px;
    }

    .tms-pos-formation { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3px; }
    .tms-pos-formation-empty { pointer-events: none; }
    .tms-primary-actions { display: flex; flex-direction: column; gap: 6px; }
    .tms-filter-actions { display: flex; gap: 4px; }
    .tms-filter-action-cell { flex: 1; }
    .tms-filter-action-cell-wide { flex: 2; }
    .tms-more-toggle-wrap { margin: 16px 0; }
    .tms-more-toggle-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }
    .tms-more-toggle .tms-more-arrow { font-size: 9px; transition: transform .2s; }
    .tms-more-toggle.open .tms-more-arrow { transform: rotate(180deg); }
    .tms-more-body { display: none; }
    .tms-more-body.open { display: block; }

    .tms-filter-btn {
        padding: 5px 5px;
        border-radius: 5px;
        font-size: 11px;
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

    .tms-row { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
    .tms-row:last-child { margin-bottom: 0; }
    .tms-range-row { display: flex; align-items: center; gap: 4px; }
    .tms-range-sep { font-size: 10px; color: var(--tmu-text-dim); flex-shrink: 0; }
    .tms-range-wrap { opacity: 0.75; }
    .tms-range-val { font-size: 10px; font-weight: 700; }
    .tms-strong-val { font-weight: 700; }
    .tms-muted { color: var(--tmu-text-disabled-strong); }
    .tms-sel {
        flex: 1;
        background: var(--tmu-surface-overlay);
        border: 1px solid var(--tmu-border-input);
        border-radius: 4px;
        color: var(--tmu-text-strong);
        font-size: 12px;
        font-weight: 600;
        padding: 5px 8px;
        outline: none;
        cursor: pointer;
        font-family: inherit;
        transition: border-color 0.15s;
    }
    .tms-sel:focus { border-color: var(--tmu-success); }

    .tms-skill-row { display: grid; grid-template-columns: 1fr auto; gap: 4px; margin-bottom: 4px; }
    .tms-skill-row:last-child { margin-bottom: 0; }
    .tms-skill-row .tms-sel { font-size: 10px; }

    .tms-post-note {
        font-size: 9px;
        font-weight: 400;
        color: var(--tmu-text-dim);
        text-transform: none;
        letter-spacing: 0;
        margin-left: 4px;
    }

    #tms-filter-box {
        background: var(--tmu-surface-embedded);
        border: 1px solid var(--tmu-border-embedded);
        border-radius: 8px;
        padding: 8px;
        margin-bottom: 8px;
    }
    #tms-filter-box .tms-sb-section { margin-bottom: 6px; }
    #tms-filter-box .tms-sb-section:last-of-type { margin-bottom: 8px; }

    /* ─── Main content ─── */
    #tms-main,
    .tmvu-transfer-main { flex: 1 1 auto; min-width: 0; position: relative; }
    #tms-toolbar {
        position: absolute;
        top: 4px; right: 4px;
        z-index: 5;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        background: var(--tmu-surface-embedded);
        padding: 2px 8px;
        border-radius: 4px;
        pointer-events: none;
    }
    #tms-hits {
        font-size: 12px;
        font-weight: 800;
        color: var(--tmu-accent);
        font-variant-numeric: tabular-nums;
    }
    #tms-toolbar .tms-toolbar-label {
        font-size: 11px;
        color: var(--tmu-text-faint);
    }

    /* ─── Table ─── */
    .tms-table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid var(--tmu-border-soft); }
    .tms-table-wrap::-webkit-scrollbar { height: 4px; }
    .tms-table-wrap::-webkit-scrollbar-track { background: var(--tmu-shadow-panel); }
    .tms-table-wrap::-webkit-scrollbar-thumb { background: var(--tmu-border-embedded); border-radius: 2px; }

    #tms-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
        color: var(--tmu-text-main);
    }
    #tms-table thead tr { border-bottom: 1px solid var(--tmu-border-soft);background: var(--tmu-surface-overlay); }
    #tms-table th {
        background: var(--tmu-surface-embedded);
        color: var(--tmu-text-faint);
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        padding: 6px 8px;
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
        padding: 4px 7px;
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
        margin-left: 5px;
        font-size: 11px;
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
        top: calc(100% + 5px);
        background: var(--tmu-surface-panel);
        border: 1px solid var(--tmu-border-live);
        border-radius: 5px;
        padding: 5px 8px;
        font-size: 11px;
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
    .tms-age-y  { font-size: 13px; font-weight: 700; color: var(--tmu-text-strong); }
    .tms-age-mo { font-size: 10px; color: var(--tmu-text-muted); margin-left: 1px; }
    .tms-pos-bar { width: 3px; padding: 0 !important; border-radius: 2px; }
    .tms-col-posbar { width: 4px; padding: 0 !important; }
    .tms-rec {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 700;
    }
    [data-transfer-reload] {
        width: 22px;
        height: 22px;
        color: var(--tmu-text-dim);
        font-size: 13px;
        line-height: 1;
        margin-right: 3px;
        vertical-align: middle;
    }
    [data-transfer-reload].tms-reloading { animation: tms-spin 0.7s linear infinite; pointer-events: none; color: var(--tmu-success); }

    /* Pending tooltip indicator */
    .tms-tip-pending {
        color: var(--tmu-text-disabled-strong);
        font-size: 10px;
        animation: tms-pending-blink 1.2s ease-in-out infinite;
    }
    @keyframes tms-pending-blink { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }

    /* Skill columns (skills mode) */
    .tms-skill { text-align: center; padding: 4px 2px !important; }
    .tms-skill0 { color: var(--tmu-text-disabled-strong); font-size: 10px; }
    .tms-bar-wrap { display: flex; align-items: center; gap: 3px; min-width: 38px; }
    .tms-bar { height: 8px; border-radius: 2px; min-width: 2px; flex-shrink: 0; }
    .tms-bar-wrap span { font-size: 10px; min-width: 12px; }

    /* ─── Expanded row ─── */
    tr.tms-expand-row td { padding: 12px 10px !important; background: var(--tmu-surface-panel) !important; cursor: default; }
    .tms-expand-inner { display: flex; gap: 20px; flex-wrap: wrap; }
    .tms-expand-skills { flex: 1; min-width: 240px; }
    .tms-expand-analysis { width: 215px; min-width: 190px; }
    .tms-exp-head {
        font-size: 9px;
        font-weight: 700;
        color: var(--tmu-text-faint);
        text-transform: uppercase;
        letter-spacing: 0.6px;
        margin-bottom: 8px;
    }
    .tms-expand-note { font-weight: 400; color: var(--tmu-text-disabled-strong); }
    .tms-skill-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
    .tms-skill-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 5px 2px;
        background: var(--tmu-surface-overlay);
        border-radius: 4px;
        border: 1px solid var(--tmu-border-success);
    }
    .tms-sk-name { font-size: 9px; color: var(--tmu-text-faint); text-transform: uppercase; }
    .tms-sk-bar  { width: 100%; height: 5px; background: var(--tmu-surface-overlay-strong); border-radius: 2px; overflow: hidden; }
    .tms-sk-fill { height: 100%; border-radius: 2px; }
    .tms-sk-val  { font-size: 12px; font-weight: 700; }
    .tms-an-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        border-bottom: 1px solid var(--tmu-border-faint);
        font-size: 11px;
    }
    .tms-an-row:last-child { border-bottom: none; }
    .tms-an-lbl { color: var(--tmu-text-faint); font-weight: 600; }
    .tms-an-val { color: var(--tmu-text-main); font-weight: 700; font-variant-numeric: tabular-nums; }

    /* ─── Loading / empty ─── */
    #tms-loading { text-align: center; padding: 50px 20px; color: var(--tmu-text-faint); font-size: 13px; }
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
        margin-left: 2px;
    }
    .tms-time-cell .countdown-split-seconds,
    .tms-time-cell .countdown-split-minutes,
    .tms-time-cell .countdown-split-hours {
        width: 18px; text-align: left; padding-left: 2px;
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
        border-radius: 12px;
        padding: 28px 24px 20px;
        max-width: 440px;
        width: calc(100% - 40px);
        box-shadow: 0 20px 60px var(--tmu-shadow-panel), 0 0 0 1px var(--tmu-success-fill-soft);
        color: var(--tmu-text-main);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .tms-modal-icon { font-size: 30px; margin-bottom: 10px; line-height: 1; }
    .tms-modal-title { font-size: 15px; font-weight: 800; color: var(--tmu-text-strong); margin-bottom: 8px; }
    .tms-modal-msg { font-size: 12px; color: var(--tmu-text-panel-label); line-height: 1.65; margin-bottom: 22px; }
            `;
        const el = document.createElement('style');
        el.id = 'tms-style';
        el.textContent = css;
        document.head.appendChild(el);
    },
};

