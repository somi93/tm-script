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
import { TmTabs }     from './tm-tabs.js';
import { TmState }    from './tm-state.js';

document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
:root{
--tmu-surface-card:#182713;
--tmu-surface-card-soft:#16270f;
--tmu-surface-panel:#1c3410;
--tmu-surface-tab:#1d2d15;
--tmu-surface-tab-hover:#24391a;
--tmu-surface-tab-active:#213617;
--tmu-border-soft:#28451d;
--tmu-border-strong:#355628;
--tmu-border-contrast:rgba(255,255,255,.02);
--tmu-shadow-ring:rgba(9,18,7,.22);
--tmu-shadow-elev:rgba(7,14,5,.26);
--tmu-text-strong:#e8f5d8;
--tmu-text-main:#c8e0b4;
--tmu-text-muted:#8aac72;
--tmu-text-dim:#5a7a48;
--tmu-accent:#80e048;
--tmu-success:#6cc040;
--tmu-warning:#fbbf24;
--tmu-danger:#f87171;
--tmu-info:#60a5fa;
--tmu-purple:#c084fc;
--tmu-tabs-primary-bg:var(--tmu-surface-tab);
--tmu-tabs-primary-border:var(--tmu-border-soft);
--tmu-tabs-primary-text:#8faa79;
--tmu-tabs-primary-hover-text:#d1e5c2;
--tmu-tabs-primary-hover-bg:var(--tmu-surface-tab-hover);
--tmu-tabs-primary-active-text:#edf7e7;
--tmu-tabs-primary-active-bg:var(--tmu-surface-tab-active);
--tmu-tabs-primary-active-border:#7fbc4d;
--tmu-tabs-secondary-bg:#182511;
--tmu-tabs-secondary-border:#233a18;
--tmu-tabs-secondary-text:#7f9d6c;
--tmu-tabs-secondary-hover-text:#c7ddba;
--tmu-tabs-secondary-hover-bg:#203117;
--tmu-tabs-secondary-active-text:#e8f3e0;
--tmu-tabs-secondary-active-bg:var(--tmu-surface-tab);
--tmu-tabs-secondary-active-border:#6ca246
}
/* -- Spinner -- */
.tmu-spinner { display: inline-block; border-radius: 50%; border-style: solid; border-color: #6a9a58; border-top-color: transparent; animation: tmu-spin 0.6s linear infinite; vertical-align: middle; }
.tmu-spinner-sm { width: 10px; height: 10px; border-width: 2px; }
.tmu-spinner-md { width: 16px; height: 16px; border-width: 2px; }
@keyframes tmu-spin { to { transform: rotate(360deg); } }
/* -- Row / Col grid -- */
.tmu-row { display: flex; align-items: center; gap: 8px; }
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
.tmu-text-accent{color:var(--tmu-accent)}
.tmu-text-success{color:var(--tmu-success)}
.tmu-text-warning{color:var(--tmu-warning)}
.tmu-text-danger{color:var(--tmu-danger)}
.tmu-text-info{color:var(--tmu-info)}

/* -- Color variants -- */
.yellow { color: var(--tmu-warning); } .red    { color: var(--tmu-danger); } .green  { color: #4ade80; }
.blue   { color: var(--tmu-info); } .purple { color: var(--tmu-purple); } .lime   { color: var(--tmu-accent); }
.muted  { color: var(--tmu-text-muted); } .gold   { color: gold;    } .silver { color: silver;  } .orange { color: #ee9900; }
/* -- Typography -- */
.text-xs  { font-size: 10px; } .text-sm  { font-size: 12px; } .text-md  { font-size: 14px; }
.text-lg  { font-size: 16px; } .text-xl  { font-size: 18px; } .text-2xl { font-size: 20px; }
.font-normal { font-weight: 400; } .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
.uppercase { text-transform: uppercase; } .lowercase { text-transform: lowercase; } .capitalize { text-transform: capitalize; }
/* -- Border-radius -- */
.rounded-sm { border-radius: 4px; } .rounded-md { border-radius: 6px; }
.rounded-lg { border-radius: 8px; } .rounded-xl { border-radius: 12px; } .rounded-full { border-radius: 9999px; }
/* -- Spacing (4px base scale) -- */
.pt-0{padding-top:0}      .pt-1{padding-top:4px}    .pt-2{padding-top:8px}    .pt-3{padding-top:12px}   .pt-4{padding-top:16px}   .pt-5{padding-top:20px}   .pt-6{padding-top:24px}
.pb-0{padding-bottom:0}   .pb-1{padding-bottom:4px} .pb-2{padding-bottom:8px} .pb-3{padding-bottom:12px}.pb-4{padding-bottom:16px}.pb-5{padding-bottom:20px}.pb-6{padding-bottom:24px}
.pl-0{padding-left:0}     .pl-1{padding-left:4px}   .pl-2{padding-left:8px}   .pl-3{padding-left:12px}  .pl-4{padding-left:16px}  .pl-5{padding-left:20px}  .pl-6{padding-left:24px}
.pr-0{padding-right:0}    .pr-1{padding-right:4px}  .pr-2{padding-right:8px}  .pr-3{padding-right:12px} .pr-4{padding-right:16px} .pr-5{padding-right:20px} .pr-6{padding-right:24px}
.px-0{padding-left:0;padding-right:0}       .px-1{padding-left:4px;padding-right:4px}     .px-2{padding-left:8px;padding-right:8px}     .px-3{padding-left:12px;padding-right:12px}
.px-4{padding-left:16px;padding-right:16px} .px-5{padding-left:20px;padding-right:20px}   .px-6{padding-left:24px;padding-right:24px}
.py-0{padding-top:0;padding-bottom:0}       .py-1{padding-top:4px;padding-bottom:4px}     .py-2{padding-top:8px;padding-bottom:8px}     .py-3{padding-top:12px;padding-bottom:12px}
.py-4{padding-top:16px;padding-bottom:16px} .py-5{padding-top:20px;padding-bottom:20px}   .py-6{padding-top:24px;padding-bottom:24px}
.pa-0{padding:0} .pa-1{padding:4px} .pa-2{padding:8px} .pa-3{padding:12px} .pa-4{padding:16px} .pa-5{padding:20px} .pa-6{padding:24px}
.mt-0{margin-top:0}      .mt-1{margin-top:4px}    .mt-2{margin-top:8px}    .mt-3{margin-top:12px}   .mt-4{margin-top:16px}   .mt-5{margin-top:20px}   .mt-6{margin-top:24px}
.mb-0{margin-bottom:0}   .mb-1{margin-bottom:4px} .mb-2{margin-bottom:8px} .mb-3{margin-bottom:12px}.mb-4{margin-bottom:16px}.mb-5{margin-bottom:20px}.mb-6{margin-bottom:24px}
.ml-0{margin-left:0}     .ml-1{margin-left:4px}   .ml-2{margin-left:8px}   .ml-3{margin-left:12px}  .ml-4{margin-left:16px}  .ml-5{margin-left:20px}  .ml-6{margin-left:24px}
.mr-0{margin-right:0}    .mr-1{margin-right:4px}  .mr-2{margin-right:8px}  .mr-3{margin-right:12px} .mr-4{margin-right:16px} .mr-5{margin-right:20px} .mr-6{margin-right:24px}
.mx-0{margin-left:0;margin-right:0}       .mx-1{margin-left:4px;margin-right:4px}     .mx-2{margin-left:8px;margin-right:8px}     .mx-3{margin-left:12px;margin-right:12px}
.mx-4{margin-left:16px;margin-right:16px} .mx-5{margin-left:20px;margin-right:20px}   .mx-6{margin-left:24px;margin-right:24px}
.my-0{margin-top:0;margin-bottom:0}       .my-1{margin-top:4px;margin-bottom:4px}     .my-2{margin-top:8px;margin-bottom:8px}     .my-3{margin-top:12px;margin-bottom:12px}
.my-4{margin-top:16px;margin-bottom:16px} .my-5{margin-top:20px;margin-bottom:20px}   .my-6{margin-top:24px;margin-bottom:24px}
.ma-0{margin:0} .ma-1{margin:4px} .ma-2{margin:8px} .ma-3{margin:12px} .ma-4{margin:16px} .ma-5{margin:20px} .ma-6{margin:24px}
` }));

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
