document.head.appendChild(Object.assign(document.createElement('style'), {
    textContent: `
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
.tmu-btn-primary   { background: var(--tmu-border-strong, #3d6828); color: var(--tmu-text-strong, #e8f5d8); }
.tmu-btn-primary:hover:not(:disabled)   { background: #4e8234; }
.tmu-btn-secondary { background: rgba(42,74,28,0.4); color: var(--tmu-text-muted, #90b878); border: 1px solid var(--tmu-border-soft, #3d6828); }
.tmu-btn-secondary:hover:not(:disabled) { background: rgba(42,74,28,0.7); color: var(--tmu-text-strong, #e8f5d8); }
.tmu-btn-danger    { background: rgba(239,68,68,0.15); color: var(--tmu-danger, #f87171); border: 1px solid rgba(239,68,68,0.3); }
.tmu-btn-danger:hover:not(:disabled)    { background: rgba(239,68,68,0.25); }
.tmu-btn-lime      { background: rgba(108,192,64,0.12); border: 1px solid rgba(108,192,64,0.3); color: var(--tmu-accent, #80e048); display: flex; align-items: center; justify-content: center; gap: 6px; }
.tmu-btn-lime:hover:not(:disabled)      { background: rgba(108,192,64,0.22); }
` }));

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
