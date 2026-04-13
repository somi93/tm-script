export const TMSC_CSS = `
/* ═══════════════════════════════════════
   SCOUT (tmsc-*)
   ═══════════════════════════════════════ */
#tmsc-root {
    display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--tmu-text-main); line-height: 1.4;
}
.tmsc-wrap {
    background: transparent; border-radius: 0; border: none; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--tmu-text-main); font-size: var(--tmu-font-sm);
}
.tmu-tabs.tmsc-tabs { margin: var(--tmu-space-md) var(--tmu-space-lg) var(--tmu-space-sm); border-radius: var(--tmu-space-sm); overflow: hidden; }
.tmsc-body { padding: var(--tmu-space-sm) var(--tmu-space-lg) var(--tmu-space-lg); font-size: var(--tmu-font-sm); min-height: 120px; }
.tmsc-tbl { width: 100%; border-collapse: collapse; font-size: var(--tmu-font-xs); margin-bottom: var(--tmu-space-xs); }
.tmsc-tbl th {
    padding: var(--tmu-space-sm); font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-faint);
    text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid var(--tmu-border-soft);
    text-align: left; white-space: nowrap;
}
.tmsc-tbl th.c { text-align: center; }
.tmsc-tbl td {
    padding: var(--tmu-space-xs) var(--tmu-space-sm); border-bottom: 1px solid var(--tmu-border-faint);
    color: var(--tmu-text-main); font-variant-numeric: tabular-nums; vertical-align: middle;
}
.tmsc-tbl td.c { text-align: center; }
.tmsc-tbl tr:hover { background: var(--tmu-border-contrast); }
.tmsc-tbl a { color: var(--tmu-accent); text-decoration: none; font-weight: 600; }
.tmsc-tbl a:hover { color: var(--tmu-text-main); text-decoration: underline; }
.tmsc-stars { font-size: var(--tmu-font-xl); letter-spacing: 2px; line-height: 1; }
.tmsc-star-full { color: var(--tmu-warning); }
.tmsc-star-half {
    background: linear-gradient(90deg, var(--tmu-warning) 50%, var(--tmu-border-embedded) 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-star-empty { color: var(--tmu-border-embedded); }
.tmsc-report { display: flex; flex-direction: column; gap: var(--tmu-space-lg); }
.tmsc-report-header { padding-bottom: var(--tmu-space-md); border-bottom: 1px solid var(--tmu-border-soft); }
.tmsc-report-scout { color: var(--tmu-text-strong); font-weight: 700; font-size: var(--tmu-font-md); margin-bottom: var(--tmu-space-xs); }
.tmsc-report-date {
    color: var(--tmu-text-faint); font-size: var(--tmu-font-xs); font-weight: 600;
    background: var(--tmu-surface-tab-active); padding: var(--tmu-space-xs) var(--tmu-space-md); border-radius: var(--tmu-space-xs); white-space: nowrap;
}
.tmsc-section-title {
    color: var(--tmu-text-faint); font-size: var(--tmu-font-xs); font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; padding-bottom: var(--tmu-space-sm); border-bottom: 1px solid var(--tmu-border-soft); margin-bottom: var(--tmu-space-sm);
}
.tmsc-bar-row { display: flex; align-items: center; gap: var(--tmu-space-md); padding: var(--tmu-space-xs) 0; }
.tmsc-bar-label { color: var(--tmu-text-panel-label); font-size: var(--tmu-font-xs); font-weight: 600; width: 100px; flex-shrink: 0; }
.tmsc-bar-track {
    flex: 1; height: 6px; background: var(--tmu-success-fill); border-radius: var(--tmu-space-xs);
    overflow: hidden; max-width: 120px; position: relative;
}
.tmsc-bar-fill { height: 100%; border-radius: var(--tmu-space-xs); transition: width 0.3s; }
.tmsc-bar-fill-reach {
    position: absolute; top: 0; left: 0; height: 100%;
    border-radius: var(--tmu-space-xs); transition: width 0.3s;
}
.tmsc-bar-text { font-size: var(--tmu-font-xs); font-weight: 600; min-width: 60px; }
.tmsc-league-cell { white-space: nowrap; font-size: var(--tmu-font-xs); }
.tmsc-league-cell a { color: var(--tmu-accent); text-decoration: none; font-weight: 600; }
.tmsc-league-cell a:hover { color: var(--tmu-text-main); text-decoration: underline; }
.tmsc-club-cell a { color: var(--tmu-accent); text-decoration: none; font-weight: 600; }
.tmsc-club-cell a:hover { color: var(--tmu-text-main); text-decoration: underline; }
.tmsc-online { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-left: var(--tmu-space-xs); vertical-align: middle; }
.tmsc-online.on { background: var(--tmu-success); box-shadow: 0 0 4px var(--tmu-success-fill-strong); }
.tmsc-online.off { background: var(--tmu-text-disabled-strong); }
.tmsc-error {
    text-align: center; color: var(--tmu-danger); padding: var(--tmu-space-md); font-size: var(--tmu-font-sm); font-weight: 600;
    background: var(--tmu-danger-fill); border: 1px solid var(--tmu-border-danger);
    border-radius: var(--tmu-space-xs); margin-bottom: var(--tmu-space-md);
}
.tmsc-report-divider { border: none; border-top: 1px dashed var(--tmu-border-embedded); margin: var(--tmu-space-lg) 0; }
.tmsc-report-count {
    color: var(--tmu-text-faint); font-size: var(--tmu-font-xs); text-align: center; padding: var(--tmu-space-xs) 0;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
}
.tmsc-star-green { color: var(--tmu-success); }
.tmsc-star-green-half {
    background: linear-gradient(90deg, var(--tmu-success) 50%, var(--tmu-border-embedded) 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-star-split {
    background: linear-gradient(90deg, var(--tmu-warning) 50%, var(--tmu-success) 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-best-wrap {
    background: var(--tmu-surface-tab-active); border: 1px solid var(--tmu-border-soft);
    border-radius: var(--tmu-space-sm); padding: var(--tmu-space-md); margin-bottom: var(--tmu-space-sm);
}
.tmsc-best-title {
    color: var(--tmu-success); font-size: var(--tmu-font-xs); font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; margin-bottom: var(--tmu-space-md); display: flex; align-items: center; gap: var(--tmu-space-sm);
}
.tmsc-best-title::before { content: '★'; font-size: var(--tmu-font-sm); }
`;

const _s = document.createElement('style');
_s.textContent = TMSC_CSS;
document.head.appendChild(_s);
