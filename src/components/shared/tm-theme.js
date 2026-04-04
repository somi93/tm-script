const THEME_STYLE_ID = 'tmu-theme-style';

const TMU_THEME_CSS = `
:root{
--tmu-color-primary:#00fea7;
--tmu-color-secondary:#0a1614;
--tmu-color-accent:#001810;
--tmu-color-surface:#142420;
--tmu-color-base:#001012;
--tmu-color-elevated:#1e342c;
--tmu-surface-card:var(--tmu-surface-dark-strong);
--tmu-surface-card-soft:var(--tmu-color-surface);
--tmu-surface-panel:var(--tmu-color-base);
--tmu-surface-dark-soft:rgba(0,0,0,.2);
--tmu-surface-dark-mid:rgba(0,0,0,.32);
--tmu-surface-dark-strong:rgba(0,0,0,.46);
--tmu-surface-dark-muted:rgba(0,0,0,.26);
--tmu-surface-item-dark:rgba(255,255,255,.025);
--tmu-surface-input-dark:rgba(6,12,8,.92);
--tmu-surface-input-dark-focus:rgba(6,12,8,.98);
--tmu-surface-panel-dark:rgba(8,14,10,.92);
--tmu-surface-accent-soft:rgba(34,197,94,.1);
--tmu-surface-card-elevated:var(--tmu-color-elevated);
--tmu-surface-card-hero:rgba(26,44,34,.96);
--tmu-surface-item-strong:rgba(255,255,255,.07);
--tmu-surface-item-hover:rgba(34,197,94,.12);
--tmu-surface-header:rgba(6,14,8,.98);
--tmu-surface-header-soft:rgba(6,14,8,.88);
--tmu-surface-nav-pill:transparent;
--tmu-surface-nav-pill-hover:rgba(255,255,255,.05);
--tmu-surface-nav-pill-active:rgba(34,197,94,.14);
--tmu-surface-embedded:var(--tmu-color-surface);
--tmu-surface-overlay-soft:rgba(0,0,0,.15);
--tmu-surface-overlay:rgba(0,0,0,.25);
--tmu-surface-overlay-strong:rgba(0,0,0,.35);
--tmu-surface-tab:var(--tmu-color-surface);
--tmu-surface-tab-hover:var(--tmu-color-elevated);
--tmu-surface-tab-active:rgba(34,197,94,.1);
--tmu-border-soft:rgba(255,255,255,.06);
--tmu-border-strong:var(--tmu-color-primary);
--tmu-border-embedded:var(--tmu-color-primary);
--tmu-border-soft-alpha:rgba(255,255,255,.08);
--tmu-border-soft-alpha-mid:rgba(255,255,255,.13);
--tmu-border-soft-alpha-strong:rgba(255,255,255,.2);
--tmu-border-glow-soft:rgba(34,197,94,.25);
--tmu-border-header:rgba(0,0,0,.4);
--tmu-border-pill:rgba(255,255,255,.1);
--tmu-border-pill-active:rgba(34,197,94,.4);
--tmu-border-contrast:rgba(255,255,255,.02);
--tmu-border-faint:rgba(255,255,255,.07);
--tmu-border-input:rgba(255,255,255,.11);
--tmu-border-input-overlay:rgba(34,197,94,.34);
--tmu-border-success:rgba(34,197,94,.28);
--tmu-border-warning:rgba(251,191,36,.34);
--tmu-border-info:rgba(96,165,250,.3);
--tmu-border-accent:rgba(34,197,94,.22);
--tmu-border-danger:rgba(248,113,113,.3);
--tmu-border-live:#34d399;
--tmu-border-preview:#60a5fa;
--tmu-border-highlight:#fbbf24;
--tmu-shadow-ring:rgba(0,0,0,.35);
--tmu-shadow-elev:rgba(0,0,0,.3);
--tmu-shadow-panel:rgba(0,0,0,.55);
--tmu-shadow-soft:rgba(0,0,0,.22);
--tmu-shadow-deep:rgba(0,0,0,.38);
--tmu-shadow-glow:rgba(34,197,94,.1);
--tmu-shadow-header:rgba(0,0,0,.5);
--tmu-shadow-card-strong:rgba(0,0,0,.32);
--tmu-shadow-pill:rgba(0,0,0,.2);
--tmu-text-strong:#f2f5f3;
--tmu-text-main:#c2cac5;
--tmu-text-muted:#7a8880;
--tmu-text-dim:#4c5c52;
--tmu-text-faint:#5e6e64;
--tmu-text-disabled:#38483e;
--tmu-text-disabled-strong:#2a3830;
--tmu-text-inverse:#fff;
--tmu-text-panel-label:#8a9e92;
--tmu-text-accent-soft:#bbf7d0;
--tmu-text-live:#6ee7b7;
--tmu-text-preview:#93c5fd;
--tmu-text-highlight:#fde68a;
--tmu-text-warm-strong:#f5e8c8;
--tmu-text-warm-muted:#d4c8a4;
--tmu-text-warm-accent:#fbbf24;
--tmu-space-xs:4px;
--tmu-space-sm:8px;
--tmu-space-md:12px;
--tmu-space-lg:16px;
--tmu-space-xl:20px;
--tmu-space-xxl:24px;
--tmu-font-2xs:8px;
--tmu-font-xs:10px;
--tmu-font-sm:12px;
--tmu-font-md:14px;
--tmu-font-lg:16px;
--tmu-font-xl:20px;
--tmu-font-2xl:24px;
--tmu-font-3xl:28px;
--tmu-accent:var(--tmu-color-primary);
--tmu-success:#22bb33;
--tmu-warning:#ff8c00;
--tmu-danger:#bb2124;
--tmu-info:#60a5fa;
--tmu-purple:#c084fc;
--tmu-success-strong:#16a34a;
--tmu-warning-soft:#fbbf24;
--tmu-danger-strong:#f04040;
--tmu-info-strong:#38bdf8;
--tmu-info-dark:#2563eb;
--tmu-danger-deep:#dc2626;
--tmu-info-alt:#60a5fa;
--tmu-accent-fill:var(--tmu-color-accent);
--tmu-success-fill:var(--tmu-color-secondary);
--tmu-success-fill-faint:rgba(34,197,94,.07);
--tmu-success-fill-soft:rgba(34,197,94,.1);
--tmu-success-fill-hover:rgba(34,197,94,.14);
--tmu-success-fill-strong:rgba(34,197,94,.2);
--tmu-warning-fill:#1c1000;
--tmu-info-fill:#04101e;
--tmu-accent-fill-soft:rgba(12,26,16,.7);
--tmu-danger-fill:#1a0808;
--tmu-live-fill:#011a0c;
--tmu-preview-fill:#040c1c;
--tmu-highlight-fill:#1c1000;
--tmu-compare-fill:rgba(34,197,94,.07);
--tmu-compare-bar-bg:rgba(0,0,0,.2);
--tmu-compare-home-grad-start:var(--tmu-color-secondary);
--tmu-compare-home-grad-end:var(--tmu-color-primary);
--tmu-compare-away-grad-start:#1a3060;
--tmu-compare-away-grad-end:#4878c8;
--tmu-spinner:var(--tmu-text-faint);
--tmu-metal-gold:gold;
--tmu-metal-silver:silver;
--tmu-metal-bronze:#cd7f32;
--tmu-tabs-primary-bg:var(--tmu-surface-card);
--tmu-tabs-primary-border:var(--tmu-border-soft-alpha-strong);
--tmu-tabs-primary-text:var(--tmu-text-muted);
--tmu-tabs-primary-hover-text:var(--tmu-text-strong);
--tmu-tabs-primary-hover-bg:var(--tmu-surface-card-elevated);
--tmu-tabs-primary-active-text:var(--tmu-text-strong);
--tmu-tabs-primary-active-bg:var(--tmu-surface-card-soft);
--tmu-tabs-primary-active-border:var(--tmu-accent);
--tmu-tabs-secondary-bg:var(--tmu-surface-card);
--tmu-tabs-secondary-border:var(--tmu-border-soft-alpha-mid);
--tmu-tabs-secondary-text:var(--tmu-text-muted);
--tmu-tabs-secondary-hover-text:var(--tmu-text-strong);
--tmu-tabs-secondary-hover-bg:var(--tmu-surface-item-strong);
--tmu-tabs-secondary-active-text:var(--tmu-text-inverse);
--tmu-tabs-secondary-active-bg:var(--tmu-surface-card-elevated);
--tmu-tabs-secondary-active-border:var(--tmu-color-primary)
}
`;

const TMU_THEME_SHADOW_CSS = TMU_THEME_CSS.replace(':root{', ':host{');

// ── Sports / Dark Red theme override block ───────────────────────────────────
// Palette source: --color-primary:#ff0046, --color-secondary-1:#00141e,
//   --color-secondary-3:#0f2d37, --color-support-1:#001e28, --color-support-5:#010a0f
const TMU_THEME_DIFF_BLUE = `
:root{
--tmu-color-primary:#ff0046;
--tmu-color-secondary:#0f2d37;
--tmu-color-accent:#001e28;
--tmu-color-surface:#0f2d37;
--tmu-color-base:#00141e;
--tmu-color-elevated:#19414f;
--tmu-surface-input-dark:rgba(1,10,15,.92);
--tmu-surface-input-dark-focus:rgba(1,10,15,.98);
--tmu-surface-panel-dark:rgba(1,10,15,.92);
--tmu-surface-card-hero:rgba(15,45,55,.96);
--tmu-surface-accent-soft:rgba(255,0,70,.1);
--tmu-surface-card-elevated:#19414f;
--tmu-surface-card-soft:#0f2d37;
--tmu-surface-panel:#00141e;
--tmu-surface-embedded:#0f2d37;
--tmu-surface-item-hover:rgba(255,0,70,.12);
--tmu-surface-nav-pill-active:rgba(255,0,70,.14);
--tmu-surface-header:rgba(1,10,15,.98);
--tmu-surface-header-soft:rgba(1,10,15,.88);
--tmu-surface-tab:var(--tmu-color-surface);
--tmu-surface-tab-hover:#19414f;
--tmu-surface-tab-active:rgba(255,0,70,.1);
--tmu-border-strong:#ff0046;
--tmu-border-embedded:#ff0046;
--tmu-border-glow-soft:rgba(255,0,70,.25);
--tmu-border-pill-active:rgba(255,0,70,.4);
--tmu-border-input-overlay:rgba(255,0,70,.34);
--tmu-border-success:rgba(255,0,70,.28);
--tmu-border-accent:rgba(255,0,70,.22);
--tmu-border-live:#ff4070;
--tmu-shadow-glow:rgba(255,0,70,.1);
--tmu-text-accent-soft:#ffccd6;
--tmu-text-live:#ff7090;
--tmu-accent:var(--tmu-color-primary);
--tmu-success:#22bb33;
--tmu-accent-fill:var(--tmu-color-accent);
--tmu-success-fill:var(--tmu-color-secondary);
--tmu-success-fill-faint:rgba(255,0,70,.07);
--tmu-success-fill-soft:rgba(255,0,70,.1);
--tmu-success-fill-hover:rgba(255,0,70,.14);
--tmu-success-fill-strong:rgba(255,0,70,.2);
--tmu-live-fill:#1a0008;
--tmu-accent-fill-soft:rgba(0,30,40,.7);
--tmu-tabs-primary-active-border:#ff0046;
--tmu-tabs-secondary-active-border:#ff0046
}
`;

const THEME_STORAGE_KEY = 'tmu-theme-id';

export function getSavedThemeId() {
    try { return localStorage.getItem(THEME_STORAGE_KEY) || 'green'; } catch { return 'green'; }
}

function buildThemeCss(id) {
    return id === 'blue' ? TMU_THEME_CSS + TMU_THEME_DIFF_BLUE : TMU_THEME_CSS;
}

export function applyTheme(id) {
    try { localStorage.setItem(THEME_STORAGE_KEY, id); } catch {}
    let style = document.getElementById(THEME_STYLE_ID);
    if (!style) {
        style = document.createElement('style');
        style.id = THEME_STYLE_ID;
        document.head.appendChild(style);
    }
    style.textContent = buildThemeCss(id);
}

export function ensureTmTheme(target = document.head) {
    if (!target) return;
    if (target === document.head) {
        if (document.getElementById(THEME_STYLE_ID)) return;
    } else if (target.querySelector && target.querySelector(`#${THEME_STYLE_ID}`)) {
        return;
    }
    const style = document.createElement('style');
    style.id = THEME_STYLE_ID;
    const css = target === document.head ? buildThemeCss(getSavedThemeId()) : TMU_THEME_SHADOW_CSS;
    style.textContent = css;
    target.appendChild(style);
}
