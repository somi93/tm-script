const STYLE_ID = 'tmu-page-layout-style';

const TMU_PAGE_LAYOUT_CSS = `
.tmu-page-layout-2col,
.tmu-page-layout-3rail{
display:grid!important;
gap:var(--tmu-page-gap,var(--tmu-space-lg));
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
gap:var(--tmu-section-gap,var(--tmu-space-lg))
}
.tmu-page-card-grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(var(--tmu-card-grid-min,220px),1fr));
gap:var(--tmu-card-grid-gap,var(--tmu-space-md))
}
.tmu-stack{
display:flex;
flex-direction:column;
min-width:0
}
.tmu-stack-density-tight{
gap:var(--tmu-space-md)
}
.tmu-stack-density-regular{
gap:var(--tmu-space-md)
}
.tmu-stack-density-cozy{
gap:var(--tmu-space-lg)
}
.tmu-stack-density-roomy{
gap:var(--tmu-space-lg)
}
.tmu-page-density-compact{
--tmu-page-gap:var(--tmu-space-lg);
--tmu-section-gap:var(--tmu-space-lg)
}
.tmu-page-density-regular{
--tmu-page-gap:var(--tmu-space-lg);
--tmu-section-gap:var(--tmu-space-lg)
}
.tmu-page-density-roomy{
--tmu-page-gap:var(--tmu-space-xl);
--tmu-section-gap:var(--tmu-space-xl)
}
.tmu-card-grid-density-compact{
--tmu-card-grid-gap:var(--tmu-space-md)
}
.tmu-card-grid-density-tight{
--tmu-card-grid-gap:var(--tmu-space-sm)
}
.tmu-card-grid-density-regular{
--tmu-card-grid-gap:var(--tmu-space-md)
}
.tmu-card-grid-density-roomy{
--tmu-card-grid-gap:var(--tmu-space-lg)
}
.tmu-page-stack-early>.tmu-page-sidebar-stack{
order:initial
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