document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Button ── */
.tmu-btn {
    border: none; cursor: pointer;
    font-family: inherit; font-weight: 700; letter-spacing: 0.3px;
    transition: background 0.15s, opacity 0.15s;
}
.tmu-btn-block { width: 100%; }
.tmu-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.tmu-btn-primary   { background: #3d6828; color: #e8f5d8; }
.tmu-btn-primary:hover:not(:disabled)   { background: #4e8234; }
.tmu-btn-secondary { background: rgba(42,74,28,0.4); color: #90b878; border: 1px solid #3d6828; }
.tmu-btn-secondary:hover:not(:disabled) { background: rgba(42,74,28,0.7); color: #e8f5d8; }
.tmu-btn-danger    { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
.tmu-btn-danger:hover:not(:disabled)    { background: rgba(239,68,68,0.25); }
.tmu-btn-lime      { background: rgba(108,192,64,0.12); border: 1px solid rgba(108,192,64,0.3); color: #80e048; display: flex; align-items: center; justify-content: center; gap: 6px; }
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
     * @param {string}      [opts.variant] — 'primary' | 'secondary' | 'danger' | 'lime' (default: 'lime')
     * @param {string}      [opts.size]    — 'xs' | 'sm' | 'md' (default: 'md')
     * @param {string}      [opts.cls]     — extra CSS classes
     * @param {boolean}     [opts.block]
     * @param {boolean}     [opts.disabled]
     * @param {Function}    [opts.onClick]
     * @returns {HTMLButtonElement}
     */
    button({ label, slot, id, variant = 'lime', size = 'md', cls = '', block = false, disabled = false, onClick } = {}) {
        const SIZES = { xs: 'py-0 px-2 text-xs', sm: 'py-1 px-3 text-sm', md: 'py-2 px-3 text-sm' };
        const btn = document.createElement('button');
        btn.className = `tmu-btn tmu-btn-${variant} rounded-md ${SIZES[size] || SIZES.md}${block ? ' tmu-btn-block' : ''}${cls ? ' ' + cls : ''}`;
        if (id) btn.id = id;
        if (disabled) btn.disabled = true;

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
