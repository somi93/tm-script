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
.tmh-outer{ color:var(--tmu-text-main); margin-bottom:var(--tmu-space-lg); }

/* ── Body area ── */
.tmh-wrap{padding:var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-lg);font-size:var(--tmu-font-sm);min-height:220px}

/* ── Season bar ── */
.tmh-sbar{display:flex;align-items:center;gap:var(--tmu-space-sm);padding:var(--tmu-space-sm) var(--tmu-space-md);
  background:var(--tmu-surface-tab-active);border:1px solid var(--tmu-border-soft);border-radius:var(--tmu-space-sm);
  margin-bottom:var(--tmu-space-md);flex-wrap:wrap}
.tmh-sbar label{color:var(--tmu-text-faint);font-size:var(--tmu-font-xs);font-weight:600;text-transform:uppercase;letter-spacing:.4px}
.tmh-sbar select{background:var(--tmu-surface-tab-hover);color:var(--tmu-text-main);border:1px solid var(--tmu-border-soft);
  padding:var(--tmu-space-xs) var(--tmu-space-sm);border-radius:var(--tmu-space-sm);font-size:var(--tmu-font-xs);cursor:pointer;font-weight:600}
.tmh-sbar select:focus{border-color:var(--tmu-success);outline:none}

/* ── Arrow nav — uses tmu-btn tmu-btn-secondary, dis state only ── */
.tmh-arrow.dis{opacity:.25;pointer-events:none}

/* ── Section header ── */
.tmh-sec{color:var(--tmu-text-faint);font-size:var(--tmu-font-xs);font-weight:700;margin:var(--tmu-space-md) 0 var(--tmu-space-sm);
  padding:var(--tmu-space-sm) var(--tmu-space-md);background:var(--tmu-surface-tab-active);border:1px solid var(--tmu-border-soft);
  border-radius:var(--tmu-space-sm);text-transform:uppercase;letter-spacing:.6px}

/* ── Shared summary strip tone helpers ── */
.tmh-pos{color:var(--tmu-success)}.tmh-neg{color:var(--tmu-danger)}.tmh-neut{color:var(--tmu-warning)}

/* ── Stars ── */
.tmh-stars{white-space:nowrap}
.tmh-stars img{width:12px;height:12px;vertical-align:middle}

/* ── Match filter buttons ── */
.tmh-filter-bar{display:flex;gap:var(--tmu-space-sm);margin-bottom:var(--tmu-space-md);flex-wrap:wrap}

/* ── Loading / placeholder ── */
.tmh-load{text-align:center;color:var(--tmu-text-faint);padding:var(--tmu-space-xxl);font-size:var(--tmu-font-sm)}

/* ── Records native tables ── */
.tmh-wrap table.border_bottom{width:100%;font-size:var(--tmu-font-sm)}
.tmh-wrap table.border_bottom td{padding:var(--tmu-space-xs) var(--tmu-space-sm);color:var(--tmu-text-main);}
.tmh-wrap table.border_bottom tr:hover{background:var(--tmu-border-contrast)}
.tmh-wrap table.border_bottom a{color:var(--tmu-accent)}

/* ── Progress bar ── */
.tmh-prog{width:100%;height:5px;background:var(--tmu-surface-tab-active);border-radius:var(--tmu-space-xs);margin:var(--tmu-space-sm) 0;overflow:hidden}
.tmh-prog-bar{height:100%;background:linear-gradient(90deg,var(--tmu-compare-home-grad-start),var(--tmu-accent));border-radius:var(--tmu-space-xs);transition:width .4s}

/* ── League tab ── */
.tmh-league-summary{margin-bottom:var(--tmu-space-md)}
.tmh-div1{color:var(--tmu-success)}.tmh-div2{color:var(--tmu-info-strong)}.tmh-div3{color:var(--tmu-text-highlight)}.tmh-div4{color:var(--tmu-warning-soft)}.tmh-div5{color:var(--tmu-purple)}
.tmh-league-champion td{background:var(--tmu-highlight-fill)!important}
.tmh-league-current td{font-style:italic;color:var(--tmu-text-muted)!important}
`;
  document.head.appendChild(style);
};

export const TmHistoryStyles = { inject };
