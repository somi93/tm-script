const STYLE_ID = 'tmu-button-style';

export const TMU_BUTTON_CSS = `
/* ── Button ── */
.tmu-btn {
    border: 1px solid transparent; cursor: pointer;
    font-family: inherit; font-weight: 800; letter-spacing: 0.02em;
    transition: background 0.15s, opacity 0.15s, border-color 0.15s, color 0.15s;
    box-shadow: none;
}
.tmu-btn-size-xs { min-height: 22px; padding: 0 5px;   font-size: var(--tmu-font-xs); }
.tmu-btn-size-sm { min-height: 26px; padding: 1px 8px;  font-size: var(--tmu-font-xs); }
.tmu-btn-size-md { min-height: 28px; padding: 2px 10px; font-size: var(--tmu-font-sm); }
.tmu-btn-size-lg { min-height: 32px; padding: 4px 14px; font-size: var(--tmu-font-sm); }
.tmu-btn-size-xl { min-height: 38px; padding: 6px 18px; font-size: var(--tmu-font-md); }
.tmu-btn.tmu-btn-size-xs { font-weight: 600; }
.tmu-btn.tmu-btn-size-sm { font-weight: 700; }
.tmu-btn.tmu-btn-size-md,
.tmu-btn.tmu-btn-size-lg,
.tmu-btn.tmu-btn-size-xl { font-weight: 800; }
.tmu-btn-icon                    { padding: 0 !important; }
.tmu-btn-icon.tmu-btn-size-xs    { width: 22px; height: 22px; }
.tmu-btn-icon.tmu-btn-size-sm    { width: 26px; height: 26px; }
.tmu-btn-icon.tmu-btn-size-md    { width: 28px; height: 28px; }
.tmu-btn-icon.tmu-btn-size-lg    { width: 32px; height: 32px; }
.tmu-btn-icon.tmu-btn-size-xl    { width: 38px; height: 38px; }
.tmu-btn-variant-button { display: inline-flex; align-items: center; justify-content: center; gap: var(--tmu-space-sm); }
.tmu-btn-variant-icon {
    display: inline-flex; align-items: center; justify-content: center;
    background: none !important; border: none !important; padding: 0 !important; min-width: 0;
    box-shadow: none !important;
}
.tmu-btn-variant-icon:hover:not(:disabled) { background: none !important; }
.tmu-btn-block { width: 100%; }
.tmu-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.tmu-btn:hover:not(:disabled) { transform: none; }
.tmu-btn:focus-visible { outline: 1px solid var(--tmu-border-pill-active); outline-offset: 2px; }
.tmu-btn-primary   { background: var(--tmu-color-secondary); color: var(--tmu-text-inverse); }
.tmu-btn-primary:hover:not(:disabled)   { background: var(--tmu-color-primary); }
.tmu-btn-secondary { background: var(--tmu-color-surface) !important; color: var(--tmu-text-panel-label); border: none !important; }
.tmu-btn-secondary:hover:not(:disabled) { background: var(--tmu-surface-item-hover) !important; color: var(--tmu-text-strong); border: none !important; }
.tmu-btn-danger    { background: var(--tmu-danger-fill); color: var(--tmu-danger); }
.tmu-btn-danger:hover:not(:disabled)    { background: var(--tmu-border-danger); color: var(--tmu-text-inverse); }
.tmu-btn-lime      { background: var(--tmu-success-fill); color: var(--tmu-text-accent-soft); display: flex; align-items: center; justify-content: center; gap: var(--tmu-space-sm); }
.tmu-btn-lime:hover:not(:disabled)      { background: var(--tmu-color-primary); color: var(--tmu-text-inverse); }
.tmu-btn-active { background: var(--tmu-color-primary) !important; }
`;

export function injectTmButtonCss(target = document.head) {
    if (!target) return;
    if (target === document.head) {
        if (document.getElementById(STYLE_ID)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID}`)) {
        return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = TMU_BUTTON_CSS;
    target.appendChild(style);
}

injectTmButtonCss();

export const TmButton = {
    /**
     * Creates a <button> element.
     *
     * @param {object}       opts
     * @param {string}      [opts.label]   — plain text label (use OR slot, not both)
     * @param {Node|string} [opts.slot]    — DOM node or HTML string for rich content
     * @param {string}      [opts.id]
     * @param {string}      [opts.title]
    * @param {string}      [opts.variant] — 'button' | 'icon' (default: 'button')
    * @param {string}      [opts.color]   — 'primary' | 'secondary' | 'danger' | 'lime' (default: 'lime')
     * @param {string}      [opts.size]    — 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
     * @param {string|null} [opts.icon]    — SVG string for icon-only square button; skips label/slot
     * @param {string}      [opts.shape]   — 'md' | 'full' (default: 'md')
     * @param {string}      [opts.cls]     — extra CSS classes
     * @param {boolean}     [opts.block]
     * @param {boolean}     [opts.disabled]
     * @param {string}      [opts.type]    — button type attribute (default: 'button')
     * @param {object}      [opts.attrs]   — extra attributes to set on the button element
     * @param {Function}    [opts.onClick]
     * @returns {HTMLButtonElement}
     */
    button({ label, slot, id, title = '', variant = 'button', color = 'lime', size = 'md', icon = null, shape = 'md', cls = '', block = false, disabled = false, active = false, type = 'button', attrs = {}, onClick } = {}) {
        const VALID_SIZES = new Set(['xs', 'sm', 'md', 'lg', 'xl']);
        const SHAPES = { md: 'rounded-md', full: 'rounded-full' };
        const COLORS = new Set(['primary', 'secondary', 'danger', 'lime']);
        const resolvedVariant = COLORS.has(variant) ? 'button' : variant;
        const resolvedColor = COLORS.has(variant) ? variant : color;
        const sizeClass = `tmu-btn-size-${VALID_SIZES.has(size) ? size : 'md'}`;
        const btn = document.createElement('button');
        btn.className = `tmu-btn tmu-btn-variant-${resolvedVariant} tmu-btn-${resolvedColor} ${SHAPES[shape] || SHAPES.md} ${sizeClass}${icon ? ' tmu-btn-icon' : ''}${block ? ' tmu-btn-block' : ''}${active ? ' tmu-btn-active' : ''}${cls ? ' ' + cls : ''}`;
        if (id) btn.id = id;
        if (title) btn.title = title;
        btn.type = type;
        if (disabled) btn.disabled = true;
        Object.entries(attrs || {}).forEach(([key, value]) => {
            if (value == null || value === false) return;
            if (value === true) {
                btn.setAttribute(key, '');
                return;
            }
            btn.setAttribute(key, String(value));
        });

        if (icon) {
            btn.innerHTML = icon;
        } else if (slot instanceof Node) {
            btn.appendChild(slot);
        } else if (typeof slot === 'string') {
            btn.innerHTML = slot;
        } else if (label != null) {
            btn.textContent = label;
        }

        if (onClick) btn.addEventListener('click', onClick);
        return btn;
    },
};
