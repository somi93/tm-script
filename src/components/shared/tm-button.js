const STYLE_ID = 'tmu-button-style';

export const TMU_BUTTON_CSS = `
/* ── Button ── */
.tmu-btn {
    border: none; cursor: pointer;
    font-family: inherit; font-weight: 700; letter-spacing: 0.3px;
    transition: background 0.15s, opacity 0.15s;
}
.tmu-btn-variant-button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.tmu-btn-variant-icon {
    display: inline-flex; align-items: center; justify-content: center;
    background: none !important; border: none !important; padding: 0 !important; min-width: 0;
}
.tmu-btn-variant-icon:hover:not(:disabled) { background: none !important; }
.tmu-btn-block { width: 100%; }
.tmu-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.tmu-btn-primary   { background: var(--tmu-border-strong); color: var(--tmu-text-strong); }
.tmu-btn-primary:hover:not(:disabled)   { background: var(--tmu-accent-fill); }
.tmu-btn-secondary { background: var(--tmu-surface-overlay); color: var(--tmu-text-panel-label); border: 1px solid var(--tmu-border-soft); }
.tmu-btn-secondary:hover:not(:disabled) { background: var(--tmu-surface-overlay-strong); color: var(--tmu-text-strong); }
.tmu-btn-danger    { background: color-mix(in srgb, var(--tmu-danger) 15%, transparent); color: var(--tmu-danger); border: 1px solid var(--tmu-border-danger); }
.tmu-btn-danger:hover:not(:disabled)    { background: color-mix(in srgb, var(--tmu-danger) 25%, transparent); }
.tmu-btn-lime      { background: color-mix(in srgb, var(--tmu-success) 12%, transparent); border: 1px solid var(--tmu-border-success); color: var(--tmu-accent); display: flex; align-items: center; justify-content: center; gap: 6px; }
.tmu-btn-lime:hover:not(:disabled)      { background: color-mix(in srgb, var(--tmu-success) 22%, transparent); }
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
     * @param {string}      [opts.size]    — 'xs' | 'sm' | 'md' (default: 'md')
     * @param {string}      [opts.shape]   — 'md' | 'full' (default: 'md')
     * @param {string}      [opts.cls]     — extra CSS classes
     * @param {boolean}     [opts.block]
     * @param {boolean}     [opts.disabled]
     * @param {string}      [opts.type]    — button type attribute (default: 'button')
     * @param {object}      [opts.attrs]   — extra attributes to set on the button element
     * @param {Function}    [opts.onClick]
     * @returns {HTMLButtonElement}
     */
    button({ label, slot, id, title = '', variant = 'button', color = 'lime', size = 'md', shape = 'md', cls = '', block = false, disabled = false, type = 'button', attrs = {}, onClick } = {}) {
        const SIZES = { xs: 'py-0 px-2 text-xs', sm: 'py-1 px-3 text-sm', md: 'py-2 px-3 text-sm' };
        const SHAPES = { md: 'rounded-md', full: 'rounded-full' };
        const COLORS = new Set(['primary', 'secondary', 'danger', 'lime']);
        const resolvedVariant = COLORS.has(variant) ? 'button' : variant;
        const resolvedColor = COLORS.has(variant) ? variant : color;
        const btn = document.createElement('button');
        btn.className = `tmu-btn tmu-btn-variant-${resolvedVariant} tmu-btn-${resolvedColor} ${SHAPES[shape] || SHAPES.md} ${SIZES[size] || SIZES.md}${block ? ' tmu-btn-block' : ''}${cls ? ' ' + cls : ''}`;
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

        if (slot instanceof Node) {
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
