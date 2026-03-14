// tm-history-styles.js - Club History page CSS injection
// Depends on: nothing
// Exposed as: TmHistoryStyles = { inject }

    const inject = () => {
        if (document.getElementById('tsa-history-style')) return;
        const style = document.createElement('style');
        style.id = 'tsa-history-style';
        style.textContent = `
/* === TM History Enhanced === */
/* ── Widen main column ── */
.column2_a{width:780px!important}

/* ── Wrapper — uses tmu-card base, extras only ── */
.tmh-outer{ color:#c8e0b4; margin-bottom:16px; }

/* ── Tabs ── */
.tmh-tabs{display:flex;background:#274a18;border-bottom:1px solid #3d6828}
.tmh-tab{flex:1;padding:8px 12px;text-align:center;
  font-size:12px;font-weight:600;text-transform:uppercase;
  letter-spacing:.5px;color:#90b878;cursor:pointer;
  border-bottom:2px solid transparent;transition:all .15s}
.tmh-tab:hover{color:#c8e0b4;background:#305820}
.tmh-tab.active{color:#e8f5d8;border-bottom-color:#6cc040;background:#305820}

/* ── Body area ── */
.tmh-wrap{padding:10px 14px 16px;font-size:13px;min-height:220px}

/* ── Season bar ── */
.tmh-sbar{display:flex;align-items:center;gap:8px;padding:6px 10px;
  background:rgba(42,74,28,.35);border:1px solid #2a4a1c;border-radius:6px;
  margin-bottom:10px;flex-wrap:wrap}
.tmh-sbar label{color:#6a9a58;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.4px}
.tmh-sbar select{background:rgba(42,74,28,.4);color:#c8e0b4;border:1px solid #2a4a1c;
  padding:4px 8px;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600}
.tmh-sbar select:focus{border-color:#6cc040;outline:none}

/* ── Buttons — use tmu-btn tmu-btn-secondary, busy state only ── */
.tmh-btn.busy{opacity:.5;pointer-events:none}

/* ── Arrow nav — uses tmu-btn tmu-btn-secondary, dis state only ── */
.tmh-arrow.dis{opacity:.25;pointer-events:none}

/* ── Section header ── */
.tmh-sec{color:#6a9a58;font-size:10px;font-weight:700;margin:14px 0 6px;
  padding:6px 10px;background:rgba(42,74,28,.3);border:1px solid #2a4a1c;
  border-radius:6px;text-transform:uppercase;letter-spacing:.6px}

/* ── Tables (matches tsa-table style) ── */
.tmh-tbl{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px}
.tmh-tbl th{padding:6px 6px;font-size:10px;font-weight:700;
  color:#6a9a58;text-transform:uppercase;letter-spacing:.4px;
  border-bottom:1px solid #2a4a1c;text-align:left;
  cursor:pointer;user-select:none;white-space:nowrap;transition:color .15s}
.tmh-tbl th.r{text-align:right}
.tmh-tbl th.c{text-align:center}
.tmh-tbl th:hover{color:#c8e0b4}
.tmh-tbl td{padding:5px 6px;border-bottom:1px solid rgba(42,74,28,.4);color:#c8e0b4;
  font-variant-numeric:tabular-nums}
.tmh-tbl td.r{text-align:right}
.tmh-tbl td.c{text-align:center}
.tmh-tbl tr:hover{background:rgba(255,255,255,.03)}
.tmh-tbl a{color:#80e048;text-decoration:none;font-weight:600}
.tmh-tbl a:hover{color:#c8e0b4;text-decoration:underline}
.tmh-tbl .tmh-tot td{border-top:2px solid #3d6828;color:#e0f0cc;font-weight:800}
.tmh-tbl .tmh-avg td{color:#6a9a58;font-weight:600}

/* ── Summary cards ── */
.tmh-cards{display:flex;gap:14px;margin-bottom:12px;padding:10px 14px;
  background:rgba(42,74,28,.3);border:1px solid #2a4a1c;border-radius:8px;flex-wrap:wrap}
.tmh-cards>div{min-width:80px}
.tmh-cards .lbl{color:#6a9a58;font-size:9px;text-transform:uppercase;letter-spacing:.5px;font-weight:700}
.tmh-cards .val{font-size:16px;font-weight:800;margin-top:3px}
.tmh-pos{color:#80e048}.tmh-neg{color:#ff4c4c}.tmh-neut{color:#ffd700}

/* ── Stars ── */
.tmh-stars{white-space:nowrap}
.tmh-stars img{width:12px;height:12px;vertical-align:middle}

/* ── Loading / placeholder ── */
.tmh-load{text-align:center;color:#6a9a58;padding:30px;font-size:13px}
.tmh-ph{text-align:center;color:#5a7a48;padding:40px;font-size:13px;font-style:italic}

/* ── Records native tables ── */
.tmh-wrap table.border_bottom{width:100%;font-size:12px}
.tmh-wrap table.border_bottom td{padding:5px 6px;color:#c8e0b4}
.tmh-wrap table.border_bottom tr:hover{background:rgba(255,255,255,.03)}
.tmh-wrap table.border_bottom a{color:#80e048}

/* ── Progress bar ── */
.tmh-prog{width:100%;height:5px;background:#274a18;border-radius:3px;margin:8px 0;overflow:hidden}
.tmh-prog-bar{height:100%;background:linear-gradient(90deg,#4a9030,#80e040);border-radius:3px;transition:width .4s}

/* ── Position colors ── */
.tmh-pos-gk{color:#6cc040}.tmh-pos-d{color:#6eb5ff}.tmh-pos-m{color:#ffd740}.tmh-pos-f{color:#ff7043}
.tmh-pos-cell,.tmh-age-cell,.tmh-asi-cell,.tmh-r5-cell{white-space:nowrap}

/* ── Match list (Matches tab) ── */
.tmh-month-hdr{font-size:10px;color:#4a7a3a;text-transform:uppercase;
  letter-spacing:1.5px;padding:12px 0 4px;font-weight:700;
  border-bottom:1px solid rgba(80,160,48,.08)}
.tmh-match-row{position:relative;display:flex;align-items:center;gap:0;
  padding:7px 8px;margin:2px 0;border-radius:6px;font-size:13px;
  cursor:pointer;transition:background .15s}
.tmh-match-row:hover{background:rgba(255,255,255,.05)}
.tmh-match-row.tmh-win{border-left:3px solid #5ab03a}
.tmh-match-row.tmh-loss{border-left:3px solid #e05040}
.tmh-match-row.tmh-draw{border-left:3px solid #5a6a4a}
.tmh-match-date{color:#4a7a3a;font-size:10px;width:32px;flex-shrink:0;font-weight:600;text-align:center}
.tmh-match-type{font-size:8px;font-weight:700;color:#6a9a58;
  background:rgba(0,0,0,.25);padding:1px 5px;border-radius:3px;
  text-transform:uppercase;letter-spacing:.5px;flex-shrink:0;margin-right:8px;width:100px;text-align:center}
.tmh-match-home{text-align:right;color:#b8d8a0;font-size:12px;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;padding-right:8px;flex:1}
.tmh-match-result{font-weight:800;color:#e0f0d0;width:44px;text-align:center;
  font-size:14px;flex-shrink:0;letter-spacing:1px}
.tmh-match-away{flex:1;text-align:left;color:#b8d8a0;font-size:12px;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;padding-left:8px}
.tmh-match-home.tmh-winner{color:#6adc3a;font-weight:700}
.tmh-match-away.tmh-winner{color:#6adc3a;font-weight:700}

/* ── Match summary bar ── */
.tmh-match-summary{display:flex;gap:14px;margin-bottom:10px;padding:10px 14px;
  background:rgba(42,74,28,.3);border:1px solid #2a4a1c;border-radius:8px;flex-wrap:wrap}
.tmh-match-summary>div{min-width:60px}
.tmh-match-summary .lbl{color:#6a9a58;font-size:9px;text-transform:uppercase;letter-spacing:.5px;font-weight:700}
.tmh-match-summary .val{font-size:16px;font-weight:800;margin-top:3px}

/* ── Match filter buttons ── */
.tmh-filter-bar{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap}
.tmh-filter{display:inline-block;padding:3px 10px;background:rgba(42,74,28,.4);
  border:1px solid #2a4a1c;border-radius:4px;color:#8aac72;font-size:10px;
  font-weight:600;cursor:pointer;transition:all .15s;text-transform:uppercase;letter-spacing:.3px}
.tmh-filter:hover{background:rgba(42,74,28,.7);color:#c8e0b4}
.tmh-filter.active{background:#3d6828;border-color:#6cc040;color:#e0f0cc}

/* ── Match hover tooltip ── */
.tmh-tooltip{position:fixed;z-index:999999;
  background:#111f0a;border:1px solid rgba(80,160,48,.25);
  border-radius:10px;padding:14px 20px;
  min-width:420px;max-width:540px;
  max-height:70vh;overflow-y:auto;
  box-shadow:0 8px 32px rgba(0,0,0,.6);
  pointer-events:none;opacity:0;transition:opacity .15s}
.tmh-tooltip.visible{opacity:1}
.tmh-tooltip-header{display:flex;align-items:center;justify-content:center;
  gap:14px;padding-bottom:12px;margin-bottom:10px;
  border-bottom:1px solid rgba(80,160,48,.12)}
.tmh-tooltip-logo{width:40px;height:40px;object-fit:contain;
  filter:drop-shadow(0 1px 3px rgba(0,0,0,.4))}
.tmh-tooltip-team{font-size:15px;font-weight:700;color:#c8e4b0;
  max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tmh-tooltip-score{font-size:28px;font-weight:800;color:#fff;
  letter-spacing:3px;text-shadow:0 0 16px rgba(128,224,64,.15)}
.tmh-tooltip-meta{display:flex;align-items:center;justify-content:center;
  gap:18px;font-size:11px;color:#5a7a48;margin-bottom:10px}
.tmh-tooltip-meta span{display:flex;align-items:center;gap:3px}
.tmh-tooltip-events{display:flex;flex-direction:column;gap:5px}
.tmh-tooltip-evt{display:flex;align-items:center;gap:10px;
  font-size:13px;color:#a0c890;padding:3px 0}
.tmh-tooltip-evt.away-evt{flex-direction:row-reverse;text-align:right}
.tmh-tooltip-evt.away-evt .tmh-tooltip-evt-min{text-align:left}
.tmh-tooltip-evt-min{font-weight:700;color:#80b868;min-width:32px;
  font-size:13px;text-align:right;flex-shrink:0}
.tmh-tooltip-evt-icon{flex-shrink:0;font-size:16px}
.tmh-tooltip-evt-text{color:#b8d8a0}
.tmh-tooltip-evt-assist{font-size:12px;color:#5a8a48;font-weight:500;margin-left:2px}
.tmh-tooltip-divider{height:1px;background:rgba(80,160,48,.1);margin:8px 0}
.tmh-tooltip-mom{margin-top:10px;padding-top:10px;
  border-top:1px solid rgba(80,160,48,.1);
  font-size:13px;color:#6a9a58;text-align:center}
.tmh-tooltip-mom span{color:#e8d44a;font-weight:700}
.tmh-tooltip-stats{display:grid;grid-template-columns:1fr auto 1fr;gap:4px 12px;
  margin:10px 0;font-size:14px}
.tmh-tooltip-stat-home{text-align:right;font-weight:700;color:#b8d8a0}
.tmh-tooltip-stat-label{text-align:center;font-size:10px;color:#5a7a48;
  text-transform:uppercase;letter-spacing:.8px;font-weight:600;padding:0 6px}
.tmh-tooltip-stat-away{text-align:left;font-weight:700;color:#b8d8a0}
.tmh-tooltip-stat-home.leading{color:#6adc3a}
.tmh-tooltip-stat-away.leading{color:#6adc3a}
.tmh-tooltip-loading{text-align:center;padding:8px;font-size:10px;color:#5a7a48}

/* ── League tab ── */
.tmh-league-summary{display:flex;gap:12px;margin-bottom:12px;padding:10px 14px;
  background:rgba(42,74,28,.3);border:1px solid #2a4a1c;border-radius:8px;flex-wrap:wrap}
.tmh-league-summary>div{min-width:70px}
.tmh-league-summary .lbl{color:#6a9a58;font-size:9px;text-transform:uppercase;letter-spacing:.5px;font-weight:700}
.tmh-league-summary .val{font-size:16px;font-weight:800;margin-top:3px}
.tmh-div1{color:#6adc3a}.tmh-div2{color:#6eb5ff}.tmh-div3{color:#ffd740}.tmh-div4{color:#ff7043}.tmh-div5{color:#cc88ff}
.tmh-league-promoted td{background:rgba(106,220,58,.06)!important}
.tmh-league-relegated td{background:rgba(224,80,64,.06)!important}
.tmh-league-champion td{background:rgba(232,212,74,.06)!important}
.tmh-league-current td{font-style:italic;color:#8aac72!important}
`;
        document.head.appendChild(style);
    };

    export const TmHistoryStyles = { inject };
