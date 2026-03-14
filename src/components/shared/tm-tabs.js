document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Tab bar (tmu-tabs / tmu-tab) ── */
.tmu-tabs{display:flex;gap:6px;flex-wrap:wrap}
.tmu-tab{padding:4px 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:#90b878;cursor:pointer;border-radius:4px;background:rgba(42,74,28,.3);border:1px solid rgba(42,74,28,.6);transition:all .15s;font-family:inherit;-webkit-appearance:none;appearance:none}
.tmu-tab:hover:not(:disabled){color:#c8e0b4;background:rgba(42,74,28,.5);border-color:#3d6828}
.tmu-tab.active{color:#e8f5d8;background:#305820;border-color:#3d6828}
.tmu-tab:disabled{opacity:.4;cursor:not-allowed}
` }));

/**
 * Creates a tab bar DOM node.
 *
 * @param {object}   opts
 * @param {Array}    opts.items    — [{ key, label, disabled? }]
 * @param {string}   opts.active   — initially active key
 * @param {Function} opts.onChange — (key) => void — called on tab switch (not called for disabled tabs)
 * @returns {HTMLDivElement}  — div.tmu-tabs with buttons inside; override className for custom styling
 */
export const TmTabs = {
    tabs({ items, active, onChange }) {
        const wrap = document.createElement('div');
        wrap.className = 'tmu-tabs';
        items.forEach(({ key, label, disabled }) => {
            const btn = document.createElement('button');
            btn.className = 'tmu-tab' + (key === active ? ' active' : '');
            btn.dataset.tab = key;
            btn.textContent = label;
            if (disabled) btn.disabled = true;
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                wrap.querySelectorAll('.tmu-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                onChange(key);
            });
            wrap.appendChild(btn);
        });
        return wrap;
    },
};
