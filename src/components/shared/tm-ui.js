import { TmButton }   from './tm-button.js';
import { TmCheckbox } from './tm-checkbox.js';
import { TmAutocomplete } from './tm-autocomplete.js';
import { TmBadge }    from './tm-badge.js';
import { TmInput }    from './tm-input.js';
import { TmChip }     from './tm-chip.js';
import { TmCompareStat } from './tm-compare-stat.js';
import { TmMetric }   from './tm-metric.js';
import { TmNotice }   from './tm-notice.js';
import { TmStat }     from './tm-stat.js';
import { TmTooltipStats } from './tm-tooltip-stats.js';
import { TmRender }   from './tm-render.js';
import { TmSkill }    from './tm-skill.js';
import { TmTooltip }  from './tm-tooltip.js';
import { TmTable }    from './tm-table.js';
import { TmModal }    from './tm-modal.js';
import { TmProgress } from './tm-progress.js';
import { ensureTmTheme } from './tm-theme.js';
import { TmTabs }     from './tm-tabs.js';
import { TmState }    from './tm-state.js';

ensureTmTheme();

const STYLE_ID = 'tmu-ui-style';

const TMU_UI_CSS = `
/* -- Spinner -- */
.tmu-spinner { display: inline-block; border-radius: 50%; border-style: solid; border-color: var(--tmu-spinner); border-top-color: transparent; animation: tmu-spin 0.6s linear infinite; vertical-align: middle; }
.tmu-spinner-sm { width: 10px; height: 10px; border-width: 2px; }
.tmu-spinner-md { width: 16px; height: 16px; border-width: 2px; }
@keyframes tmu-spin { to { transform: rotate(360deg); } }
/* -- Row / Col grid -- */
.tmu-row { display: flex; align-items: center; gap: var(--tmu-space-sm); }
.tmu-col { min-width: 0; }
.tmu-col-1{flex:0 0 8.333%}  .tmu-col-2{flex:0 0 16.667%} .tmu-col-3{flex:0 0 25%}     .tmu-col-4{flex:0 0 33.333%}
.tmu-col-5{flex:0 0 41.667%} .tmu-col-6{flex:0 0 50%}     .tmu-col-7{flex:0 0 58.333%} .tmu-col-8{flex:0 0 66.667%}
.tmu-col-9{flex:0 0 75%}     .tmu-col-10{flex:0 0 83.333%}.tmu-col-11{flex:0 0 91.667%}.tmu-col-12{flex:0 0 100%}
/* -- Theme utilities -- */
.tmu-surface-card{background:var(--tmu-surface-card)}
.tmu-surface-card-soft{background:var(--tmu-surface-card-soft)}
.tmu-surface-panel{background:var(--tmu-surface-panel)}
.tmu-surface-tab{background:var(--tmu-surface-tab)}
.tmu-surface-tab-hover{background:var(--tmu-surface-tab-hover)}
.tmu-surface-tab-active{background:var(--tmu-surface-tab-active)}
.tmu-border-soft{border-color:var(--tmu-border-soft)}
.tmu-border-strong{border-color:var(--tmu-border-strong)}
.tmu-text-strong{color:var(--tmu-text-strong)}
.tmu-text-main{color:var(--tmu-text-main)}
.tmu-text-muted{color:var(--tmu-text-muted)}
.tmu-text-dim{color:var(--tmu-text-dim)}
.tmu-text-faint{color:var(--tmu-text-faint)}
.tmu-text-panel-label{color:var(--tmu-text-panel-label)}
.tmu-text-inverse{color:var(--tmu-text-inverse)}
.tmu-text-accent{color:var(--tmu-accent)}
.tmu-text-accent-soft{color:var(--tmu-text-accent-soft)}
.tmu-text-success{color:var(--tmu-success)}
.tmu-text-warning{color:var(--tmu-warning)}
.tmu-text-danger{color:var(--tmu-danger)}
.tmu-text-info{color:var(--tmu-info)}
.tmu-text-warm-strong{color:var(--tmu-text-warm-strong)}
.tmu-text-warm-muted{color:var(--tmu-text-warm-muted)}
.tmu-text-warm-accent{color:var(--tmu-text-warm-accent)}

/* -- Semantic text utilities -- */
.tmu-kicker{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--tmu-text-panel-label)}
.tmu-meta{font-size:11px;color:var(--tmu-text-faint)}
.tmu-note{color:var(--tmu-text-muted);line-height:1.6}
.tmu-tabular{font-variant-numeric:tabular-nums}

/* -- Color variants -- */
.yellow { color: var(--tmu-warning); } .red    { color: var(--tmu-danger); } .green  { color: var(--tmu-success-strong); }
.blue   { color: var(--tmu-info); } .purple { color: var(--tmu-purple); } .lime   { color: var(--tmu-accent); }
.muted  { color: var(--tmu-text-muted); } .gold   { color: var(--tmu-metal-gold); } .silver { color: var(--tmu-metal-silver); } .orange { color: var(--tmu-warning-soft); }
/* -- Typography -- */
.text-xs  { font-size: 10px; } .text-sm  { font-size: 12px; } .text-md  { font-size: 14px; }
.text-lg  { font-size: 16px; } .text-xl  { font-size: 18px; } .text-2xl { font-size: 20px; }
.font-normal { font-weight: 400; } .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
.uppercase { text-transform: uppercase; } .lowercase { text-transform: lowercase; } .capitalize { text-transform: capitalize; }
/* -- Border-radius -- */
.rounded-sm { border-radius: var(--tmu-space-xs); } .rounded-md { border-radius: var(--tmu-space-sm); }
.rounded-lg { border-radius: var(--tmu-space-sm); } .rounded-xl { border-radius: var(--tmu-space-md); } .rounded-full { border-radius: 9999px; }
/* -- Spacing tokens -- */
.pt-0{padding-top:0}      .pt-1{padding-top:var(--tmu-space-xs)}    .pt-2{padding-top:var(--tmu-space-sm)}    .pt-3{padding-top:var(--tmu-space-md)}   .pt-4{padding-top:var(--tmu-space-lg)}   .pt-5{padding-top:var(--tmu-space-xl)}   .pt-6{padding-top:var(--tmu-space-xxl)}
.pb-0{padding-bottom:0}   .pb-1{padding-bottom:var(--tmu-space-xs)} .pb-2{padding-bottom:var(--tmu-space-sm)} .pb-3{padding-bottom:var(--tmu-space-md)}.pb-4{padding-bottom:var(--tmu-space-lg)}.pb-5{padding-bottom:var(--tmu-space-xl)}.pb-6{padding-bottom:var(--tmu-space-xxl)}
.pl-0{padding-left:0}     .pl-1{padding-left:var(--tmu-space-xs)}   .pl-2{padding-left:var(--tmu-space-sm)}   .pl-3{padding-left:var(--tmu-space-md)}  .pl-4{padding-left:var(--tmu-space-lg)}  .pl-5{padding-left:var(--tmu-space-xl)}  .pl-6{padding-left:var(--tmu-space-xxl)}
.pr-0{padding-right:0}    .pr-1{padding-right:var(--tmu-space-xs)}  .pr-2{padding-right:var(--tmu-space-sm)}  .pr-3{padding-right:var(--tmu-space-md)} .pr-4{padding-right:var(--tmu-space-lg)} .pr-5{padding-right:var(--tmu-space-xl)} .pr-6{padding-right:var(--tmu-space-xxl)}
.px-0{padding-left:0;padding-right:0}       .px-1{padding-left:var(--tmu-space-xs);padding-right:var(--tmu-space-xs)}     .px-2{padding-left:var(--tmu-space-sm);padding-right:var(--tmu-space-sm)}     .px-3{padding-left:var(--tmu-space-md);padding-right:var(--tmu-space-md)}
.px-4{padding-left:var(--tmu-space-lg);padding-right:var(--tmu-space-lg)} .px-5{padding-left:var(--tmu-space-xl);padding-right:var(--tmu-space-xl)}   .px-6{padding-left:var(--tmu-space-xxl);padding-right:var(--tmu-space-xxl)}
.py-0{padding-top:0;padding-bottom:0}       .py-1{padding-top:var(--tmu-space-xs);padding-bottom:var(--tmu-space-xs)}     .py-2{padding-top:var(--tmu-space-sm);padding-bottom:var(--tmu-space-sm)}     .py-3{padding-top:var(--tmu-space-md);padding-bottom:var(--tmu-space-md)}
.py-4{padding-top:var(--tmu-space-lg);padding-bottom:var(--tmu-space-lg)} .py-5{padding-top:var(--tmu-space-xl);padding-bottom:var(--tmu-space-xl)}   .py-6{padding-top:var(--tmu-space-xxl);padding-bottom:var(--tmu-space-xxl)}
.pa-0{padding:0} .pa-1{padding:var(--tmu-space-xs)} .pa-2{padding:var(--tmu-space-sm)} .pa-3{padding:var(--tmu-space-md)} .pa-4{padding:var(--tmu-space-lg)} .pa-5{padding:var(--tmu-space-xl)} .pa-6{padding:var(--tmu-space-xxl)}
.mt-0{margin-top:0}      .mt-1{margin-top:var(--tmu-space-xs)}    .mt-2{margin-top:var(--tmu-space-sm)}    .mt-3{margin-top:var(--tmu-space-md)}   .mt-4{margin-top:var(--tmu-space-lg)}   .mt-5{margin-top:var(--tmu-space-xl)}   .mt-6{margin-top:var(--tmu-space-xxl)}
.mb-0{margin-bottom:0}   .mb-1{margin-bottom:var(--tmu-space-xs)} .mb-2{margin-bottom:var(--tmu-space-sm)} .mb-3{margin-bottom:var(--tmu-space-md)}.mb-4{margin-bottom:var(--tmu-space-lg)}.mb-5{margin-bottom:var(--tmu-space-xl)}.mb-6{margin-bottom:var(--tmu-space-xxl)}
.ml-0{margin-left:0}     .ml-1{margin-left:var(--tmu-space-xs)}   .ml-2{margin-left:var(--tmu-space-sm)}   .ml-3{margin-left:var(--tmu-space-md)}  .ml-4{margin-left:var(--tmu-space-lg)}  .ml-5{margin-left:var(--tmu-space-xl)}  .ml-6{margin-left:var(--tmu-space-xxl)}
.mr-0{margin-right:0}    .mr-1{margin-right:var(--tmu-space-xs)}  .mr-2{margin-right:var(--tmu-space-sm)}  .mr-3{margin-right:var(--tmu-space-md)} .mr-4{margin-right:var(--tmu-space-lg)} .mr-5{margin-right:var(--tmu-space-xl)} .mr-6{margin-right:var(--tmu-space-xxl)}
.mx-0{margin-left:0;margin-right:0}       .mx-1{margin-left:var(--tmu-space-xs);margin-right:var(--tmu-space-xs)}     .mx-2{margin-left:var(--tmu-space-sm);margin-right:var(--tmu-space-sm)}     .mx-3{margin-left:var(--tmu-space-md);margin-right:var(--tmu-space-md)}
.mx-4{margin-left:var(--tmu-space-lg);margin-right:var(--tmu-space-lg)} .mx-5{margin-left:var(--tmu-space-xl);margin-right:var(--tmu-space-xl)}   .mx-6{margin-left:var(--tmu-space-xxl);margin-right:var(--tmu-space-xxl)}
.my-0{margin-top:0;margin-bottom:0}       .my-1{margin-top:var(--tmu-space-xs);margin-bottom:var(--tmu-space-xs)}     .my-2{margin-top:var(--tmu-space-sm);margin-bottom:var(--tmu-space-sm)}     .my-3{margin-top:var(--tmu-space-md);margin-bottom:var(--tmu-space-md)}
.my-4{margin-top:var(--tmu-space-lg);margin-bottom:var(--tmu-space-lg)} .my-5{margin-top:var(--tmu-space-xl);margin-bottom:var(--tmu-space-xl)}   .my-6{margin-top:var(--tmu-space-xxl);margin-bottom:var(--tmu-space-xxl)}
.ma-0{margin:0} .ma-1{margin:var(--tmu-space-xs)} .ma-2{margin:var(--tmu-space-sm)} .ma-3{margin:var(--tmu-space-md)} .ma-4{margin:var(--tmu-space-lg)} .ma-5{margin:var(--tmu-space-xl)} .ma-6{margin:var(--tmu-space-xxl)}
`;

export function injectTmUiCss(target = document.head) {
    if (!target) return;
    if (target === document.head) {
        if (document.getElementById(STYLE_ID)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID}`)) {
        return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = TMU_UI_CSS;
    target.appendChild(style);
}

injectTmUiCss();

// Backward-compatible facade  all sub-components are accessible via TmUI.method()
export const TmUI = {
    ...TmButton,
    ...TmCheckbox,
    ...TmAutocomplete,
    ...TmBadge,
    ...TmInput,
    ...TmChip,
    ...TmCompareStat,
    ...TmMetric,
    ...TmNotice,
    ...TmStat,
    ...TmTooltipStats,
    ...TmRender,
    ...TmSkill,
    ...TmTooltip,
    ...TmTable,
    ...TmModal,
    ...TmProgress,
    ...TmTabs,
    ...TmState,
};
