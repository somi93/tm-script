export const TmTransferStyles = {
        inject() {
            if (document.getElementById('tms-style')) return;
            const css = `
    /* ─── Root layout ─── */
    #tms-root {
        display: flex;
        gap: 0;
        align-items: flex-start;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #c8e0b4;
    }

    /* ─── Sidebar ─── */
    #tms-sidebar {
        width: 250px;
        min-width: 250px;
        background: transparent;
        box-sizing: border-box;
        position: sticky;
        top: 8px;
        max-height: calc(100vh - 20px);
        overflow-y: auto;
    }
    #tms-sidebar::-webkit-scrollbar { width: 4px; }
    #tms-sidebar::-webkit-scrollbar-track { background: #111; }
    #tms-sidebar::-webkit-scrollbar-thumb { background: #3d6828; border-radius: 2px; }

    /* Card-style sections (matching tm-player widget style) */
    .tms-sb-section {
        background: #1c3410;
        border: 1px solid #3d6828;
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
        color: #6a9a58;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 8px 12px 6px;
        border-bottom: 1px solid rgba(61,104,40,0.3);
    }
    .tms-for-inline {
        display: flex; align-items: center; gap: 4px;
        font-size: 10px; font-weight: 600; color: #90b878;
        text-transform: none; letter-spacing: 0; cursor: pointer;
    }
    .tms-for-inline input[type=checkbox] { accent-color: #6cc040; cursor: pointer; margin: 0; }
    .tms-sb-body {
        padding: 8px 10px;
    }

    .tms-pos-formation { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3px; }
    .tms-pos-formation-empty { pointer-events: none; }
    .tms-more-toggle {
        display: flex; align-items: center; justify-content: space-between;
        width: 100%; padding: 6px 10px; margin: 16px 0;
        background: rgba(42,74,28,0.25); border: 1px solid #2a4a1c;
        border-radius: 6px; color: #6a9a58; font-size: 10px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.5px;
        cursor: pointer; user-select: none;
    }
    .tms-more-toggle:hover { background: rgba(42,74,28,0.5); color: #c8e0b4; }
    .tms-more-toggle .tms-more-arrow { font-size: 9px; transition: transform .2s; }
    .tms-more-toggle.open .tms-more-arrow { transform: rotate(180deg); }
    .tms-more-body { display: none; }
    .tms-more-body.open { display: block; }

    .tms-filter-btn {
        padding: 5px 5px;
        border-radius: 5px;
        font-size: 11px;
        font-weight: 700;
        border: 1px solid rgba(61,104,40,0.45);
        background: rgba(0,0,0,0.15);
        color: #90b878;
        cursor: pointer;
        text-align: center;
        transition: all 0.12s;
        user-select: none;
    }
    .tms-filter-btn.active  { background: #3d6828; color: #e8f5d8; border-color: #6cc040; }
    .tms-filter-btn:hover   { background: #2a4a1c; }
    .tms-filter-btn.tms-gk  { color: #4ade80; }
    .tms-filter-btn.tms-de  { color: #60a5fa; }
    .tms-filter-btn.tms-dm  { color: #fbbf24; }
    .tms-filter-btn.tms-mf  { color: #fbbf24; }
    .tms-filter-btn.tms-om  { color: #fb923c; }
    .tms-filter-btn.tms-fw  { color: #f87171; }

    .tms-row { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
    .tms-row:last-child { margin-bottom: 0; }
    .tms-range-row { display: flex; align-items: center; gap: 4px; }
    .tms-range-row .tms-num { flex: 1; min-width: 0; }
    .tms-range-sep { font-size: 10px; color: #5a7a48; flex-shrink: 0; }
    .tms-lbl { font-size: 10px; color: #8aac72; font-weight: 600; min-width: 30px; letter-spacing: 0.3px; text-transform: uppercase; }
    .tms-sel {
        flex: 1;
        background: rgba(0,0,0,0.25);
        border: 1px solid rgba(42,74,28,0.6);
        border-radius: 4px;
        color: #e8f5d8;
        font-size: 12px;
        font-weight: 600;
        padding: 5px 8px;
        outline: none;
        cursor: pointer;
        font-family: inherit;
        transition: border-color 0.15s;
    }
    .tms-sel:focus { border-color: #6cc040; }
    .tms-num { -moz-appearance: textfield; }
    .tms-num::-webkit-inner-spin-button,
    .tms-num::-webkit-outer-spin-button { opacity: 1; filter: invert(0.6); }
    .tms-num::placeholder { color: #5a7a48; }

    .tms-check-row { display: flex; align-items: center; gap: 6px; }
    .tms-check-row label { font-size: 11px; color: #90b878; cursor: pointer; }
    .tms-check-row input[type=checkbox] { accent-color: #6cc040; cursor: pointer; }

    .tms-skill-row { display: grid; grid-template-columns: 1fr auto; gap: 4px; margin-bottom: 4px; }
    .tms-skill-row:last-child { margin-bottom: 0; }
    .tms-skill-row .tms-sel { font-size: 10px; }

    .tms-post-note {
        font-size: 9px;
        font-weight: 400;
        color: #4a7a38;
        text-transform: none;
        letter-spacing: 0;
        margin-left: 4px;
    }

    #tms-search-btn {
        width: 100%;
        padding: 9px;
        border-radius: 7px;
        border: none;
        background: #3d6828;
        color: #e8f5d8;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s;
        letter-spacing: 0.3px;
        font-family: inherit;
        margin-bottom: 6px;
    }
    #tms-search-btn:hover { background: #4d8030; }
    #tms-findall-btn {
        width: 100%;
        padding: 8px;
        border-radius: 7px;
        border: 1px solid #3d6828;
        background: rgba(61,104,40,0.12);
        color: #6cc040;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s;
        letter-spacing: 0.3px;
        font-family: inherit;
    }
    #tms-findall-btn:hover { background: rgba(61,104,40,0.3); }

    #tms-filter-box {
        background: #162e0e;
        border: 1px solid #3d6828;
        border-radius: 8px;
        padding: 8px;
        margin-bottom: 8px;
    }
    #tms-filter-box .tms-sb-section { margin-bottom: 6px; }
    #tms-filter-box .tms-sb-section:last-of-type { margin-bottom: 8px; }
    #tms-filter-box #tms-search-btn { margin-bottom: 5px; }
    #tms-filter-box #tms-findall-btn { margin-bottom: 0; }

    /* ─── Main content ─── */
    #tms-main { flex: 1; min-width: 0; padding-left: 12px; position: relative; }
    .tms-spacer { flex: 1; }
    #tms-toolbar {
        position: absolute;
        top: 4px; right: 4px;
        z-index: 5;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        background: rgba(22,46,14,0.92);
        padding: 2px 8px;
        border-radius: 4px;
        pointer-events: none;
    }
    #tms-hits {
        font-size: 12px;
        font-weight: 800;
        color: #80e048;
        font-variant-numeric: tabular-nums;
    }
    #tms-toolbar .tms-toolbar-label {
        font-size: 11px;
        color: #6a9a58;
    }

    /* ─── Table ─── */
    .tms-table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid #2a4a1c; }
    .tms-table-wrap::-webkit-scrollbar { height: 4px; }
    .tms-table-wrap::-webkit-scrollbar-track { background: #111; }
    .tms-table-wrap::-webkit-scrollbar-thumb { background: #3d6828; border-radius: 2px; }

    #tms-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
        color: #c8e0b4;
    }
    #tms-table thead tr { border-bottom: 1px solid #2a4a1c;background: rgba(0,0,0,0.2); }
    #tms-table th {
        background: #162e0e;
        color: #6a9a58;
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
        background: #162e0e;
    }
    #tms-table th:hover { color: #c8e0b4; background: #243d18; }
    #tms-table th.sort-asc::after  { content: ' ▲'; color: #6cc040; }
    #tms-table th.sort-desc::after { content: ' ▼'; color: #6cc040; }
    #tms-table td {
        padding: 4px 7px;
        border-bottom: 1px solid rgba(42,74,28,.4);
        vertical-align: middle;
        white-space: nowrap;
    }
    #tms-table .tms-player-row { background: #1c3410; }
    #tms-table tbody .tms-player-row:nth-child(odd)  { background: #1c3410; }
    #tms-table tbody .tms-player-row:nth-child(even) { background: #162e0e; }
    #tms-table .tms-player-row:hover { background: #243d18 !important; cursor: pointer; }
    #tms-table .tms-player-row.tms-expanded { background: rgba(255,255,255,.07); }

    /* Column-specific */
    .tms-col-flag { width: 24px; text-align: center; }
    .tms-col-name { max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
    .tms-col-name a { color: #80e048; text-decoration: none; font-weight: 600; }
    .tms-col-name a:hover { color: #c8e0b4; text-decoration: underline; }
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
        background: #1a2e14;
        border: 1px solid #4a9030;
        border-radius: 5px;
        padding: 5px 8px;
        font-size: 11px;
        color: #c8e0b4;
        white-space: pre-wrap;
        max-width: 260px;
        min-width: 100px;
        word-break: break-word;
        z-index: 100002;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        pointer-events: none;
        line-height: 1.5;
    }
    .tms-note-icon:hover::after { display: block; }
    .tms-col-age  { text-align: center; white-space: nowrap; }
    .tms-col-r    { text-align: right; font-variant-numeric: tabular-nums; }
    .tms-col-c    { text-align: center; }
    .tms-age-y  { font-size: 13px; font-weight: 700; color: #e8f5d8; }
    .tms-age-mo { font-size: 10px; color: #8aac72; margin-left: 1px; }
    .tms-pos {
        font-size: 10px;
        font-weight: 700;
        padding: 1px 3px;
        border-radius: 3px;
        display: inline-block;
    }
    .tms-pos-chip {
        display: inline-block; padding: 1px 6px; border-radius: 4px;
        font-size: 10px; font-weight: 700; letter-spacing: 0.3px;
        line-height: 16px; text-align: center; min-width: 28px;
    }
    .tms-pos-bar { width: 3px; padding: 0 !important; border-radius: 2px; }
    .tms-col-posbar { width: 4px; padding: 0 !important; }
    .tms-rec {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 700;
    }
    .tms-bid-btn {
        padding: 3px 8px;
        border-radius: 3px;
        border: 1px solid #3d6828;
        background: rgba(61,104,40,0.25);
        color: #6cc040;
        font-size: 10px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.12s;
    }
    .tms-bid-btn:hover { background: #3d6828; color: #e8f5d8; }
    .tms-reload-btn {
        padding: 2px 6px;
        border-radius: 3px;
        border: 1px solid #2a4a1c;
        background: transparent;
        color: #4a7a38;
        font-size: 13px;
        line-height: 1;
        cursor: pointer;
        transition: color 0.12s, border-color 0.12s;
        margin-right: 3px;
        vertical-align: middle;
    }
    .tms-reload-btn:hover { color: #6cc040; border-color: #4a8030; }
    .tms-reload-btn.tms-reloading { animation: tms-spin 0.7s linear infinite; pointer-events: none; color: #6cc040; }

    /* Pending tooltip indicator */
    .tms-tip-pending {
        color: #4a5a40;
        font-size: 10px;
        animation: tms-pending-blink 1.2s ease-in-out infinite;
    }
    @keyframes tms-pending-blink { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }

    /* Skill columns (skills mode) */
    .tms-skill { text-align: center; padding: 4px 2px !important; }
    .tms-skill0 { color: #4a5a40; font-size: 10px; }
    .tms-bar-wrap { display: flex; align-items: center; gap: 3px; min-width: 38px; }
    .tms-bar { height: 8px; border-radius: 2px; min-width: 2px; flex-shrink: 0; }
    .tms-bar-wrap span { font-size: 10px; min-width: 12px; }

    /* ─── Expanded row ─── */
    tr.tms-expand-row td { padding: 12px 10px !important; background: #1c3410 !important; cursor: default; }
    .tms-expand-inner { display: flex; gap: 20px; flex-wrap: wrap; }
    .tms-expand-skills { flex: 1; min-width: 240px; }
    .tms-expand-analysis { width: 215px; min-width: 190px; }
    .tms-exp-head {
        font-size: 9px;
        font-weight: 700;
        color: #6a9a58;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        margin-bottom: 8px;
    }
    .tms-skill-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
    .tms-skill-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 5px 2px;
        background: rgba(0,0,0,0.25);
        border-radius: 4px;
        border: 1px solid rgba(61,104,40,0.3);
    }
    .tms-sk-name { font-size: 9px; color: #6a9a58; text-transform: uppercase; }
    .tms-sk-bar  { width: 100%; height: 5px; background: rgba(0,0,0,0.3); border-radius: 2px; overflow: hidden; }
    .tms-sk-fill { height: 100%; border-radius: 2px; }
    .tms-sk-val  { font-size: 12px; font-weight: 700; }
    .tms-an-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        border-bottom: 1px solid rgba(61,104,40,0.2);
        font-size: 11px;
    }
    .tms-an-row:last-child { border-bottom: none; }
    .tms-an-lbl { color: #6a9a58; font-weight: 600; }
    .tms-an-val { color: #c8e0b4; font-weight: 700; font-variant-numeric: tabular-nums; }

    /* ─── Loading / empty ─── */
    #tms-loading { text-align: center; padding: 50px 20px; color: #6a9a58; font-size: 13px; }
    .tms-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #3d6828;
        border-top-color: #6cc040;
        border-radius: 50%;
        animation: tms-spin 0.7s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
    }
    @keyframes tms-spin { to { transform: rotate(360deg); } }

    /* ─── Player row tooltip ─── */
    .tms-player-tip {
        position: fixed; z-index: 100001;
        background: linear-gradient(135deg, #1a2e14 0%, #243a1a 100%);
        border: 1px solid #4a9030; border-radius: 8px;
        padding: 10px 12px; min-width: 220px; max-width: 280px;
        box-shadow: 0 6px 24px rgba(0,0,0,0.6);
        pointer-events: none; font-size: 11px; color: #c8e0b4;
        opacity: 0; transition: opacity .15s ease;
    }
    .tms-player-tip.visible { opacity: 1; }
    .tms-player-tip-header {
        display: flex; align-items: flex-start; gap: 8px;
        margin-bottom: 8px; padding-bottom: 6px;
        border-bottom: 1px solid rgba(74,144,48,0.3);
    }
    .tms-player-tip-name { font-size: 13px; font-weight: 700; color: #e0f0cc; }
    .tms-player-tip-pos { font-size: 10px; color: #8abc78; font-weight: 600; margin-top: 2px; }
    .tms-player-tip-badges { display: flex; flex-direction: column; gap: 3px; margin-left: auto; align-items: flex-end; }
    .tms-player-tip-badge { font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 4px; background: rgba(0,0,0,0.3); }
    .tms-player-tip-skills { display: flex; gap: 12px; margin-bottom: 6px; }
    .tms-player-tip-skills-col { flex: 1; min-width: 0; }
    .tms-player-tip-skill {
        display: flex; justify-content: space-between;
        padding: 1px 0; border-bottom: 1px solid rgba(74,144,48,0.12);
    }
    .tms-player-tip-skill-name { color: #8abc78; font-size: 10px; }
    .tms-player-tip-skill-val { font-weight: 700; font-size: 11px; }
    .tms-player-tip-footer {
        display: flex; gap: 6px; justify-content: center;
        padding-top: 6px; border-top: 1px solid rgba(74,144,48,0.3);
    }
    .tms-player-tip-stat { text-align: center; }
    .tms-player-tip-stat-val { font-size: 13px; font-weight: 800; }
    .tms-player-tip-stat-lbl { font-size: 9px; color: #6a9a58; text-transform: uppercase; letter-spacing: 0.3px; }

    /* ─── Websocket-compatible watched rows ─── */
    #tms-table tr.tms-bump td             { background: rgba(255,200,40,0.10) !important; }
    #tms-table tr.tms-bump a              { color: #ffe680; }
    #tms-table tr.watched-player td           { background: rgba(108,192,64,0.18) !important; }
    #tms-table tr.watched-player-currentbid td{ background: rgba(0,220,110,0.25) !important; box-shadow: inset 0 0 0 1px #00e676; }
    #tms-table tr.watched-player-outbid td   { background: rgba(255,60,40,0.2) !important; box-shadow: inset 0 0 0 1px #ff4c4c; }
    #tms-table tr.watched-player a           { color: #e8f5d8; }

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
    .column1_d{display: none !important;}
    .main_center{padding-top: 0!important;padding-bottom: 0 !important;} 
    /* ─── Our outer wrapper, full-width, directly on body ─── */
    #tms-outer {
        display: block;
        width: calc(100% - 20px);
        max-width: 1400px;
        margin: 10px auto 0;
        font-family: Arial, sans-serif;
        font-size: 12px;
        color: #c8ddb8;
        box-sizing: border-box;
    }
    #tms-root { width: 100%; }

    /* ─── Custom modal ─── */
    #tms-modal-overlay {
        position: fixed; inset: 0; z-index: 200000;
        background: rgba(0,0,0,0.78);
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(3px);
    }
    .tms-modal {
        background: linear-gradient(160deg, #1a2e14 0%, #0e1e0a 100%);
        border: 1px solid #4a9030;
        border-radius: 12px;
        padding: 28px 24px 20px;
        max-width: 440px;
        width: calc(100% - 40px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(74,144,48,0.15);
        color: #c8e0b4;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .tms-modal-icon { font-size: 30px; margin-bottom: 10px; line-height: 1; }
    .tms-modal-title { font-size: 15px; font-weight: 800; color: #e0f0cc; margin-bottom: 8px; }
    .tms-modal-msg { font-size: 12px; color: #90b878; line-height: 1.65; margin-bottom: 22px; }
    .tms-modal-btns { display: flex; flex-direction: column; gap: 8px; }
    .tms-modal-btn {
        padding: 10px 16px; border-radius: 7px;
        font-size: 12px; font-weight: 700;
        cursor: pointer; border: none;
        transition: all 0.14s; font-family: inherit;
        text-align: left;
    }
    .tms-modal-btn-primary   { background: #3d6828; color: #e8f5d8; border: 1px solid #6cc040; }
    .tms-modal-btn-primary:hover { background: #4d8030; }
    .tms-modal-btn-secondary { background: rgba(61,104,40,0.15); color: #80c050; border: 1px solid #3d6828; }
    .tms-modal-btn-secondary:hover { background: rgba(61,104,40,0.3); }
    .tms-modal-btn-danger    { background: rgba(60,15,5,0.3); color: #a05040; border: 1px solid #5a2a1a; }
    .tms-modal-btn-danger:hover { background: rgba(80,20,5,0.5); color: #c06050; }
    .tms-modal-btn-sub { font-size: 10px; font-weight: 400; opacity: 0.7; display: block; margin-top: 2px; }

    /* ─── Saved filters ─── */
    .tms-filter-action-btn {
        flex: 1;
        padding: 5px 6px;
        border-radius: 5px;
        font-size: 10px;
        font-weight: 700;
        border: 1px solid rgba(61,104,40,0.45);
        background: rgba(0,0,0,0.15);
        color: #90b878;
        cursor: pointer;
        transition: all 0.12s;
        font-family: inherit;
    }
    .tms-filter-action-btn:hover { background: #2a4a1c; color: #c8e0b4; }
    .tms-filter-action-btn.tms-filter-del { color: #a05040; border-color: rgba(90,42,26,0.45); }
    .tms-filter-action-btn.tms-filter-del:hover { background: rgba(80,20,5,0.4); color: #c06050; }
            `;
            const el = document.createElement('style');
            el.id = 'tms-style';
            el.textContent = css;
            document.head.appendChild(el);
        },
    };

