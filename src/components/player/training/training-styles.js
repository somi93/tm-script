'use strict';

import { ensureTmTheme } from '../../shared/tm-theme.js';
import { injectTmUiCss } from '../../shared/tm-ui.js';
import { injectTmButtonCss } from '../../shared/tm-button.js';
import { injectTmTabsCss } from '../../shared/tm-tabs.js';
import { injectTmTableCss } from '../../shared/tm-table.js';

export const TMT_CSS = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:host{display:block;all:initial;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--tmu-text-main);line-height:1.4}
.tmt-wrap{background:transparent;border-radius:0;border:none;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--tmu-text-main);font-size:var(--tmu-font-sm)}
.tmt-state{padding:var(--tmu-space-xl) var(--tmu-space-md);text-align:center}
.tmt-state-icon{font-size:var(--tmu-font-xl);margin-bottom:var(--tmu-space-sm)}
.tmt-state-title{color:var(--tmu-text-strong);font-weight:700;font-size:var(--tmu-font-md);margin-bottom:var(--tmu-space-xs)}
.tmt-state-copy{color:var(--tmu-text-faint);font-size:var(--tmu-font-xs)}
.tmt-tabs{display:flex;width:100%;gap:0;padding:var(--tmu-space-md) var(--tmu-space-lg) var(--tmu-space-sm);flex-wrap:nowrap;background:transparent;border:none;overflow:visible}.tmt-tab{flex:1 1 0;padding:var(--tmu-space-xs) var(--tmu-space-md);font-size:var(--tmu-font-xs);border:1px solid var(--tmu-border-input);border-radius:0;text-align:center;justify-content:center}.tmt-tab:hover:not(:disabled){border-color:var(--tmu-border-embedded)}.tmt-tab.active{border-bottom-color:var(--tmu-border-embedded)}.tmt-tab-pro::after{content:'PRO';display:inline-block;background:var(--tmu-success-fill);color:var(--tmu-success);padding:0 var(--tmu-space-xs);border-radius:var(--tmu-space-xs);font-size:var(--tmu-font-2xs);font-weight:800;letter-spacing:.5px;margin-left:var(--tmu-space-xs);vertical-align:middle}
.tmt-body{display:flex;flex-direction:column;gap:var(--tmu-space-md);padding:var(--tmu-space-sm) var(--tmu-space-lg) var(--tmu-space-lg);font-size:var(--tmu-font-sm)}
.tmt-sbar,.tmt-summary-card,.tmt-summary-pool,.tmt-table-shell,.tmt-footer{background:var(--tmu-surface-card-soft);border:1px solid var(--tmu-border-soft-alpha-strong);border-radius:var(--tmu-space-md);box-shadow:none}
.tmt-sbar{display:flex;align-items:center;gap:var(--tmu-space-sm);padding:var(--tmu-space-sm) var(--tmu-space-md);flex-wrap:wrap}
.tmt-sbar-label{color:var(--tmu-text-faint);font-size:var(--tmu-font-xs);font-weight:600;text-transform:uppercase;letter-spacing:0.4px}
.tmt-sbar select{background:var(--tmu-surface-overlay-soft);color:var(--tmu-text-main);border:1px solid var(--tmu-border-soft-alpha-mid);padding:var(--tmu-space-xs) var(--tmu-space-sm);border-radius:var(--tmu-space-sm);font-size:var(--tmu-font-xs);cursor:pointer;font-weight:600;font-family:inherit}
.tmt-sbar select:focus{border-color:var(--tmu-success);outline:none}
.tmt-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--tmu-space-sm)}
.tmt-summary-card,.tmt-summary-pool{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0;padding:var(--tmu-space-sm) var(--tmu-space-md)}
.tmt-summary-card{min-height:56px}
.tmt-summary-pool{grid-column:1 / -1;align-items:flex-start}
.tmt-summary-label{margin-top:var(--tmu-space-xs);color:var(--tmu-text-faint);font-size:var(--tmu-font-2xs);text-transform:uppercase;letter-spacing:.5px;font-weight:700}
.tmt-summary-value{font-size:var(--tmu-font-lg);font-weight:800;color:var(--tmu-text-main)}
.tmt-pool-bar{height:6px;background:var(--tmu-surface-overlay-soft);border-radius:var(--tmu-space-xs);overflow:hidden;display:flex;gap:0;margin-top:var(--tmu-space-sm)}
.tmt-pool-seg{height:100%;border-radius:var(--tmu-space-xs);transition:width 0.3s ease;min-width:0}.tmt-pool-rem{flex:1;height:100%}
.tmt-table-shell{overflow:hidden}
.tmt-tbl{width:100%;border-collapse:collapse;font-size:var(--tmu-font-xs);margin-bottom:var(--tmu-space-sm)}
.tmt-tbl th{padding:var(--tmu-space-sm);font-size:var(--tmu-font-xs);font-weight:700;color:var(--tmu-text-faint);text-transform:uppercase;letter-spacing:0.4px;border-bottom:1px solid var(--tmu-border-soft);text-align:left;white-space:nowrap}.tmt-tbl th.c{text-align:center}
.tmt-tbl td{padding:var(--tmu-space-xs) var(--tmu-space-sm);border-bottom:1px solid var(--tmu-border-faint);color:var(--tmu-text-main);font-variant-numeric:tabular-nums;vertical-align:middle}.tmt-tbl td.c{text-align:center}
.tmt-tbl tr:hover{background:var(--tmu-border-contrast)}
.tmt-tbl th:nth-child(2),.tmt-tbl td:nth-child(2){width:56px}
.tmt-tbl th:nth-child(4),.tmt-tbl td:nth-child(4){width:1%;white-space:nowrap}
.tmt-team-label{font-weight:700;color:var(--tmu-text-strong);white-space:nowrap}
.tmt-skills-copy{display:block;color:var(--tmu-text-strong);font-size:var(--tmu-font-sm);line-height:1.4;white-space:normal}
.tmt-clr-bar{width:3px;padding:0;border-radius:0}
.tmt-dots{display:inline-flex;gap:var(--tmu-space-xs);align-items:center}
.tmt-dot{width:18px;height:18px;border-radius:50%;transition:all 0.15s;cursor:pointer;display:inline-block}
.tmt-dot-empty{background:var(--tmu-border-contrast);border:1px solid var(--tmu-border-input)}.tmt-dot-empty:hover{background:var(--tmu-surface-overlay-soft);border-color:var(--tmu-border-embedded)}
.tmt-dot-filled{box-shadow:0 0 6px var(--tmu-shadow-ring),inset 0 1px 0 var(--tmu-border-contrast);border:1px solid var(--tmu-border-soft-alpha-mid)}
.tmt-btn:disabled{opacity:.2}
.tmt-points-cell{display:flex;align-items:center;justify-content:flex-end;gap:var(--tmu-space-sm);width:100%}
.tmt-pts{font-size:var(--tmu-font-sm);font-weight:800;color:var(--tmu-text-strong);min-width:14px;text-align:center}
.tmt-footer{display:flex;align-items:center;justify-content:space-between;padding:var(--tmu-space-md) var(--tmu-space-md);gap:var(--tmu-space-md);flex-wrap:wrap}
.tmt-footer-total .lbl{color:var(--tmu-text-faint);font-size:var(--tmu-font-2xs);text-transform:uppercase;letter-spacing:0.5px;font-weight:700}
.tmt-footer-total .val{font-size:var(--tmu-font-lg);font-weight:900;color:var(--tmu-text-strong);letter-spacing:-0.5px}.tmt-footer-total .dim{color:var(--tmu-text-faint);font-weight:600}
.tmt-footer-acts{display:flex;gap:var(--tmu-space-sm)}
.tmt-act{text-transform:uppercase;letter-spacing:.4px}
.tmt-summary-success{color:var(--tmu-success)}
.tmt-summary-strong{color:var(--tmu-text-strong)}
.tmt-pool-wrap{width:100%;min-width:0;display:flex;align-items:flex-end}
.tmt-pool-wrap .tmt-pool-bar{width:100%}.tmt-readonly .tmt-btn{opacity:0.25;pointer-events:none}.tmt-readonly .tmt-dot{pointer-events:none;cursor:default}
.tmt-readonly .tmt-act{opacity:0.25;pointer-events:none}.tmt-readonly #type-select{pointer-events:none;opacity:0.6}
.tmt-readonly .tmt-tab{pointer-events:none}
.tmt-readonly-badge{display:none}.tmt-readonly .tmt-readonly-badge{display:inline-flex;align-items:center;gap:var(--tmu-space-xs);font-size:var(--tmu-font-xs);font-weight:700;color:var(--tmu-warning);background:var(--tmu-warning-fill);border:1px solid var(--tmu-border-warning);border-radius:var(--tmu-space-xs);padding:0 var(--tmu-space-sm);margin-left:var(--tmu-space-sm);vertical-align:middle}`;

export const attachSharedShadowStyles = (root) => {
    ensureTmTheme(root);
    injectTmUiCss(root);
    injectTmButtonCss(root);
    injectTmTableCss(root);
    injectTmTabsCss(root);
};
