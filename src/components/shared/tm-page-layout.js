const STYLE_ID = 'tmu-page-layout-style';

const TMU_PAGE_LAYOUT_CSS = `
.tmu-page-layout-2col,
.tmu-page-layout-3rail{
display:grid!important;
gap:var(--tmu-page-gap,16px);
align-items:start
}
.tmu-page-layout-2col{
grid-template-columns:var(--tmu-page-sidebar-width,184px) var(--tmu-page-main-track,minmax(0,1fr))
}
.tmu-page-layout-3rail{
grid-template-columns:var(--tmu-page-sidebar-width,184px) var(--tmu-page-main-track,minmax(0,1fr)) var(--tmu-page-rail-width,340px)
}
.tmu-page-sidebar-stack,
.tmu-page-section-stack,
.tmu-page-rail-stack{
min-width:0;
display:flex;
flex-direction:column;
gap:var(--tmu-section-gap,16px)
}
.tmu-page-card-grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(var(--tmu-card-grid-min,220px),1fr));
gap:var(--tmu-card-grid-gap,12px)
}
.tmu-stack{
display:flex;
flex-direction:column;
min-width:0
}
.tmu-stack-density-tight{
gap:10px
}
.tmu-stack-density-regular{
gap:12px
}
.tmu-stack-density-cozy{
gap:14px
}
.tmu-stack-density-roomy{
gap:16px
}
.tmu-page-density-compact{
--tmu-page-gap:14px;
--tmu-section-gap:14px
}
.tmu-page-density-regular{
--tmu-page-gap:16px;
--tmu-section-gap:16px
}
.tmu-page-density-roomy{
--tmu-page-gap:20px;
--tmu-section-gap:20px
}
.tmu-card-grid-density-compact{
--tmu-card-grid-gap:10px
}
.tmu-card-grid-density-tight{
--tmu-card-grid-gap:6px
}
.tmu-card-grid-density-regular{
--tmu-card-grid-gap:12px
}
.tmu-card-grid-density-roomy{
--tmu-card-grid-gap:16px
}
.tmu-page-stack-early>.tmu-page-sidebar-stack{
order:initial
}
@media (max-width:1240px){
.tmu-page-layout-3rail.tmu-page-rail-break-wide{
grid-template-columns:var(--tmu-page-sidebar-width,184px) var(--tmu-page-main-track,minmax(0,1fr))
}
.tmu-page-layout-3rail.tmu-page-rail-break-wide>.tmu-page-rail-stack{
grid-column:2
}
}
@media (max-width:1100px){
.tmu-page-layout-3rail{
grid-template-columns:var(--tmu-page-sidebar-width,184px) var(--tmu-page-main-track,minmax(0,1fr))
}
.tmu-page-layout-3rail>.tmu-page-rail-stack{
grid-column:1/-1
}
}
@media (max-width:960px){
.tmu-page-stack-early.tmu-page-layout-2col,
.tmu-page-stack-early.tmu-page-layout-3rail{
grid-template-columns:minmax(0,1fr)
}
.tmu-page-stack-early.tmu-page-layout-2col>.tmu-page-sidebar-stack,
.tmu-page-stack-early.tmu-page-layout-3rail>.tmu-page-sidebar-stack{
order:2
}
.tmu-page-stack-early.tmu-page-layout-3rail>.tmu-page-rail-stack{
grid-column:auto
}
}
@media (max-width:820px){
.tmu-page-layout-2col,
.tmu-page-layout-3rail{
grid-template-columns:minmax(0,1fr)
}
.tmu-page-layout-2col>.tmu-page-sidebar-stack,
.tmu-page-layout-3rail>.tmu-page-sidebar-stack{
order:2
}
.tmu-page-layout-3rail>.tmu-page-rail-stack{
grid-column:auto
}
}
`;

export function injectTmPageLayoutStyles(target = document.head) {
    if (!target) return;
    if (target === document.head) {
        if (document.getElementById(STYLE_ID)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID}`)) {
        return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = TMU_PAGE_LAYOUT_CSS;
    target.appendChild(style);
}

injectTmPageLayoutStyles();