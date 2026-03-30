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
.column2_a,.tmvu-club-main{width:780px!important}

/* ── Wrapper — uses tmu-card base, extras only ── */
.tmh-outer{ color:var(--tmu-text-main); margin-bottom:16px; }

/* ── Body area ── */
.tmh-wrap{padding:10px 14px 16px;font-size:13px;min-height:220px}

/* ── Season bar ── */
.tmh-sbar{display:flex;align-items:center;gap:8px;padding:6px 10px;
  background:rgba(42,74,28,.35);border:1px solid var(--tmu-border-soft);border-radius:6px;
  margin-bottom:10px;flex-wrap:wrap}
.tmh-sbar label{color:var(--tmu-text-faint);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.4px}
.tmh-sbar select{background:rgba(42,74,28,.4);color:var(--tmu-text-main);border:1px solid var(--tmu-border-soft);
  padding:4px 8px;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600}
.tmh-sbar select:focus{border-color:var(--tmu-success);outline:none}

/* ── Arrow nav — uses tmu-btn tmu-btn-secondary, dis state only ── */
.tmh-arrow.dis{opacity:.25;pointer-events:none}

/* ── Section header ── */
.tmh-sec{color:var(--tmu-text-faint);font-size:10px;font-weight:700;margin:14px 0 6px;
  padding:6px 10px;background:rgba(42,74,28,.3);border:1px solid var(--tmu-border-soft);
  border-radius:6px;text-transform:uppercase;letter-spacing:.6px}

/* ── Tables (matches tsa-table style) ── */
.tmh-tbl{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px}
.tmh-tbl th{padding:6px 6px;font-size:10px;font-weight:700;
  color:var(--tmu-text-faint);text-transform:uppercase;letter-spacing:.4px;
  border-bottom:1px solid var(--tmu-border-soft);text-align:left;
  cursor:pointer;user-select:none;white-space:nowrap;transition:color .15s}
.tmh-tbl th.r{text-align:right}
.tmh-tbl th.c{text-align:center}
.tmh-tbl th:hover{color:var(--tmu-text-main);}
.tmh-tbl td{padding:5px 6px;border-bottom:1px solid var(--tmu-border-faint);color:var(--tmu-text-main);
  font-variant-numeric:tabular-nums}
.tmh-tbl td.r{text-align:right}
.tmh-tbl td.c{text-align:center}
.tmh-tbl tr:hover{background:rgba(255,255,255,.03)}
.tmh-tbl a{color:var(--tmu-accent);text-decoration:none;font-weight:600}
.tmh-tbl a:hover{color:var(--tmu-text-main);text-decoration:underline}
.tmh-tbl .tmh-tot td{border-top:2px solid var(--tmu-border-embedded);color:var(--tmu-text-strong);font-weight:800}
.tmh-tbl .tmh-avg td{color:var(--tmu-text-faint);font-weight:600}

/* ── Shared summary strip tone helpers ── */
.tmh-summary-strip { margin-bottom:12px; }
.tmh-pos{color:var(--tmu-success)}.tmh-neg{color:var(--tmu-danger)}.tmh-neut{color:var(--tmu-warning)}

/* ── Stars ── */
.tmh-stars{white-space:nowrap}
.tmh-stars img{width:12px;height:12px;vertical-align:middle}

/* ── Loading / placeholder ── */
.tmh-load{text-align:center;color:var(--tmu-text-faint);padding:30px;font-size:13px}
.tmh-ph{text-align:center;color:var(--tmu-text-dim);padding:40px;font-size:13px;font-style:italic}

/* ── Records native tables ── */
.tmh-wrap table.border_bottom{width:100%;font-size:12px}
.tmh-wrap table.border_bottom td{padding:5px 6px;color:var(--tmu-text-main);}
.tmh-wrap table.border_bottom tr:hover{background:rgba(255,255,255,.03)}
.tmh-wrap table.border_bottom a{color:var(--tmu-accent)}

/* ── Progress bar ── */
.tmh-prog{width:100%;height:5px;background:var(--tmu-surface-tab-active);border-radius:3px;margin:8px 0;overflow:hidden}
.tmh-prog-bar{height:100%;background:linear-gradient(90deg,var(--tmu-compare-home-grad-start),var(--tmu-accent));border-radius:3px;transition:width .4s}

/* ── Position colors ── */
.tmh-pos-gk{color:var(--tmu-success)}.tmh-pos-d{color:#6eb5ff}.tmh-pos-m{color:#ffd740}.tmh-pos-f{color:#ff7043}
.tmh-pos-cell,.tmh-age-cell,.tmh-asi-cell,.tmh-r5-cell{white-space:nowrap}

/* ── Match list (Matches tab) ── */
.tmh-month-hdr{font-size:10px;color:var(--tmu-text-faint);text-transform:uppercase;
  letter-spacing:1.5px;padding:12px 0 4px;font-weight:700;
  border-bottom:1px solid rgba(80,160,48,.08)}
.tmh-match-row{position:relative;display:flex;align-items:center;gap:0;
  padding:7px 8px;margin:2px 0;border-radius:6px;font-size:13px;
  cursor:pointer;transition:background .15s}
.tmh-match-row:hover{background:rgba(255,255,255,.05)}
.tmh-match-row.tmh-win{border-left:3px solid var(--tmu-success)}
.tmh-match-row.tmh-loss{border-left:3px solid var(--tmu-danger)}
.tmh-match-row.tmh-draw{border-left:3px solid var(--tmu-text-dim)}
.tmh-match-date{color:var(--tmu-text-faint);font-size:10px;width:32px;flex-shrink:0;font-weight:600;text-align:center}
.tmh-match-type{font-size:8px;font-weight:700;color:var(--tmu-text-faint);
  background:rgba(0,0,0,.25);padding:1px 5px;border-radius:3px;
  text-transform:uppercase;letter-spacing:.5px;flex-shrink:0;margin-right:8px;width:100px;text-align:center}
.tmh-match-home{text-align:right;color:var(--tmu-text-main);font-size:12px;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;padding-right:8px;flex:1}
.tmh-match-result{font-weight:800;color:var(--tmu-text-strong);width:44px;text-align:center;
  font-size:14px;flex-shrink:0;letter-spacing:1px}
.tmh-match-away{flex:1;text-align:left;color:var(--tmu-text-main);font-size:12px;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;padding-left:8px}
.tmh-match-home.tmh-winner{color:var(--tmu-success);font-weight:700}
.tmh-match-away.tmh-winner{color:var(--tmu-success);font-weight:700}

/* ── Match summary bar ── */
.tmh-match-summary{margin-bottom:10px}

/* ── Match filter buttons ── */
.tmh-filter-bar{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap}
.tmh-filter{display:inline-block;padding:3px 10px;background:rgba(42,74,28,.4);
  border:1px solid var(--tmu-border-soft);border-radius:4px;color:var(--tmu-text-muted);font-size:10px;
  font-weight:600;cursor:pointer;transition:all .15s;text-transform:uppercase;letter-spacing:.3px}
.tmh-filter:hover{background:rgba(42,74,28,.7);color:var(--tmu-text-main);}
.tmh-filter.active{background:var(--tmu-border-embedded);border-color:var(--tmu-success);color:var(--tmu-text-strong)}

/* ── Match hover tooltip ── */
.tmh-tooltip.rnd-h2h-tooltip{position:fixed;z-index:999999;
  padding:14px 20px;min-width:420px;max-width:540px;
  max-height:70vh;overflow-y:auto}
.tmh-tooltip.visible{opacity:1}
.tmh-tooltip-stats{margin:10px 0}
.tmh-tooltip .rnd-h2h-tooltip-team{max-width:160px}
/* ── League tab ── */
.tmh-league-summary{margin-bottom:12px}
.tmh-div1{color:var(--tmu-success)}.tmh-div2{color:#6eb5ff}.tmh-div3{color:#ffd740}.tmh-div4{color:#ff7043}.tmh-div5{color:#cc88ff}
.tmh-league-promoted td{background:rgba(106,220,58,.06)!important}
.tmh-league-relegated td{background:rgba(224,80,64,.06)!important}
.tmh-league-champion td{background:rgba(232,212,74,.06)!important}
.tmh-league-current td{font-style:italic;color:var(--tmu-text-muted)!important}
`;
  document.head.appendChild(style);
};

export const TmHistoryStyles = { inject };
