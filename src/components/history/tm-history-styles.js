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
  background:var(--tmu-surface-tab-active);border:1px solid var(--tmu-border-soft);border-radius:6px;
  margin-bottom:10px;flex-wrap:wrap}
.tmh-sbar label{color:var(--tmu-text-faint);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.4px}
.tmh-sbar select{background:var(--tmu-surface-tab-hover);color:var(--tmu-text-main);border:1px solid var(--tmu-border-soft);
  padding:4px 8px;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600}
.tmh-sbar select:focus{border-color:var(--tmu-success);outline:none}

/* ── Arrow nav — uses tmu-btn tmu-btn-secondary, dis state only ── */
.tmh-arrow.dis{opacity:.25;pointer-events:none}

/* ── Section header ── */
.tmh-sec{color:var(--tmu-text-faint);font-size:10px;font-weight:700;margin:14px 0 6px;
  padding:6px 10px;background:var(--tmu-surface-tab-active);border:1px solid var(--tmu-border-soft);
  border-radius:6px;text-transform:uppercase;letter-spacing:.6px}

/* ── Shared summary strip tone helpers ── */
.tmh-summary-strip { margin-bottom:12px; }
.tmh-pos{color:var(--tmu-success)}.tmh-neg{color:var(--tmu-danger)}.tmh-neut{color:var(--tmu-warning)}

/* ── Stars ── */
.tmh-stars{white-space:nowrap}
.tmh-stars img{width:12px;height:12px;vertical-align:middle}

/* ── Loading / placeholder ── */
.tmh-load{text-align:center;color:var(--tmu-text-faint);padding:30px;font-size:13px}

/* ── Records native tables ── */
.tmh-wrap table.border_bottom{width:100%;font-size:12px}
.tmh-wrap table.border_bottom td{padding:5px 6px;color:var(--tmu-text-main);}
.tmh-wrap table.border_bottom tr:hover{background:var(--tmu-border-contrast)}
.tmh-wrap table.border_bottom a{color:var(--tmu-accent)}

/* ── Progress bar ── */
.tmh-prog{width:100%;height:5px;background:var(--tmu-surface-tab-active);border-radius:3px;margin:8px 0;overflow:hidden}
.tmh-prog-bar{height:100%;background:linear-gradient(90deg,var(--tmu-compare-home-grad-start),var(--tmu-accent));border-radius:3px;transition:width .4s}

/* ── Match list (Matches tab) ── */
.tmh-match-row{position:relative;display:flex;align-items:center;gap:0;
  padding:7px 8px;margin:2px 0;border-radius:6px;font-size:13px;
  cursor:pointer;transition:background .15s}
.tmh-match-row:hover{background:var(--tmu-border-contrast)}
.tmh-match-row.tmh-win{border-left:3px solid var(--tmu-success)}
.tmh-match-row.tmh-loss{border-left:3px solid var(--tmu-danger)}
.tmh-match-row.tmh-draw{border-left:3px solid var(--tmu-text-dim)}
.tmh-match-date{color:var(--tmu-text-faint);font-size:10px;width:32px;flex-shrink:0;font-weight:600;text-align:center}
.tmh-match-type{font-size:8px;font-weight:700;color:var(--tmu-text-faint);
  background:var(--tmu-surface-overlay);padding:1px 5px;border-radius:3px;
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
.tmh-filter{display:inline-block;padding:3px 10px;background:var(--tmu-surface-tab-active);
  border:1px solid var(--tmu-border-soft);border-radius:4px;color:var(--tmu-text-muted);font-size:10px;
  font-weight:600;cursor:pointer;transition:all .15s;text-transform:uppercase;letter-spacing:.3px}
.tmh-filter:hover{background:var(--tmu-surface-tab-hover);color:var(--tmu-text-main);}
.tmh-filter.active{background:var(--tmu-border-embedded);border-color:var(--tmu-success);color:var(--tmu-text-strong)}

/* ── Match hover tooltip ── */
.tmh-tooltip.rnd-h2h-tooltip{position:fixed;z-index:999999;
  padding:14px 20px;min-width:420px;max-width:540px;
  max-height:70vh;overflow-y:auto}
.tmh-tooltip.visible{opacity:1}
.tmh-tooltip .rnd-h2h-tooltip-team{max-width:160px}
/* ── League tab ── */
.tmh-league-summary{margin-bottom:12px}
.tmh-div1{color:var(--tmu-success)}.tmh-div2{color:var(--tmu-info-strong)}.tmh-div3{color:var(--tmu-text-highlight)}.tmh-div4{color:var(--tmu-warning-soft)}.tmh-div5{color:var(--tmu-purple)}
.tmh-league-champion td{background:var(--tmu-highlight-fill)!important}
.tmh-league-current td{font-style:italic;color:var(--tmu-text-muted)!important}
`;
  document.head.appendChild(style);
};

export const TmHistoryStyles = { inject };
