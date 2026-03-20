document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Tab bar (tmu-tabs / tmu-tab) ── */
.tmu-tabs{
display:flex;align-items:stretch;
background:var(--tmu-tabs-bg,var(--tmu-tabs-primary-bg,#274a18));
border:1px solid var(--tmu-tabs-border,var(--tmu-tabs-primary-border,#3d6828));
overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;
scrollbar-color:var(--tmu-tabs-scrollbar,var(--tmu-tabs-primary-border,#3d6828)) transparent
}
.tmu-tabs-color-primary{
--tmu-tabs-bg:var(--tmu-tabs-primary-bg,#274a18);
--tmu-tabs-border:var(--tmu-tabs-primary-border,#3d6828);
--tmu-tabs-text:var(--tmu-tabs-primary-text,#90b878);
--tmu-tabs-hover-text:var(--tmu-tabs-primary-hover-text,#c8e0b4);
--tmu-tabs-hover-bg:var(--tmu-tabs-primary-hover-bg,#305820);
--tmu-tabs-active-text:var(--tmu-tabs-primary-active-text,#e8f5d8);
--tmu-tabs-active-bg:var(--tmu-tabs-primary-active-bg,#305820);
--tmu-tabs-active-border:var(--tmu-tabs-primary-active-border,#6cc040)
}
.tmu-tabs-color-secondary{
--tmu-tabs-bg:var(--tmu-tabs-secondary-bg,#1f2e16);
--tmu-tabs-border:var(--tmu-tabs-secondary-border,#455f34);
--tmu-tabs-text:var(--tmu-tabs-secondary-text,#9eb88a);
--tmu-tabs-hover-text:var(--tmu-tabs-secondary-hover-text,#d2e4c6);
--tmu-tabs-hover-bg:var(--tmu-tabs-secondary-hover-bg,#314726);
--tmu-tabs-active-text:var(--tmu-tabs-secondary-active-text,#f0f7ea);
--tmu-tabs-active-bg:var(--tmu-tabs-secondary-active-bg,#314726);
--tmu-tabs-active-border:var(--tmu-tabs-secondary-active-border,#8fb96c)
}
.tmu-tabs-stretch .tmu-tab{flex:1 1 0;min-width:0}
.tmu-tab{padding:8px 12px;text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--tmu-tabs-text,var(--tmu-tabs-primary-text,#90b878));cursor:pointer;border:none;border-bottom:2px solid transparent;transition:all .15s;background:transparent;font-family:inherit;-webkit-appearance:none;appearance:none;display:flex;align-items:center;justify-content:center;gap:6px;flex:0 0 auto;min-width:max-content}
.tmu-tab:hover:not(:disabled){color:var(--tmu-tabs-hover-text,var(--tmu-tabs-primary-hover-text,#c8e0b4));background:var(--tmu-tabs-hover-bg,var(--tmu-tabs-primary-hover-bg,#305820))}
.tmu-tab.active{color:var(--tmu-tabs-active-text,var(--tmu-tabs-primary-active-text,#e8f5d8));border-bottom-color:var(--tmu-tabs-active-border,var(--tmu-tabs-primary-active-border,#6cc040));background:var(--tmu-tabs-active-bg,var(--tmu-tabs-primary-active-bg,#305820))}
.tmu-tab:disabled{opacity:.4;cursor:not-allowed}
.tmu-tab-icon{font-size:14px;line-height:1;flex-shrink:0}
` }));

const setActive = (wrap, activeKey) => {
    wrap.querySelectorAll('.tmu-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === String(activeKey));
    });
};

/**
 * Creates a tab bar DOM node.
 *
 * @param {object}   opts
 * @param {Array}    opts.items    — [{ key, label, slot, disabled? }]
 * @param {string}   opts.active   — initially active key
 * @param {Function} opts.onChange — (key) => void — called on tab switch (not called for disabled tabs)
 * @param {boolean}  opts.stretch  — when true, tabs fill the row evenly
 * @param {string}   opts.color    — palette key for tab colors, defaults to primary
 * @param {string}   opts.cls      — additional classes for the wrapper
 * @param {string}   opts.itemCls  — additional classes for each tab button
 * @returns {HTMLDivElement}  — div.tmu-tabs with buttons inside; override className for custom styling
 */
export const TmTabs = {
    tabs({ items, active, onChange, stretch = false, color = 'primary', cls = '', itemCls = '' }) {
        const wrap = document.createElement('div');
        wrap.className = ['tmu-tabs', `tmu-tabs-color-${color}`, stretch ? 'tmu-tabs-stretch' : '', cls].filter(Boolean).join(' ');
        items.forEach(({ key, label, slot, disabled, icon, cls: itemOwnCls, title }) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = ['tmu-tab', itemCls, itemOwnCls, key === active ? 'active' : ''].filter(Boolean).join(' ');
            btn.dataset.tab = key;
            if (title) btn.title = title;
            if (icon) {
                const iconEl = document.createElement('span');
                iconEl.className = 'tmu-tab-icon';
                iconEl.textContent = icon;
                btn.appendChild(iconEl);
                const labelEl = document.createElement('span');
                labelEl.textContent = label;
                btn.appendChild(labelEl);
            } else if (slot instanceof Node) {
                btn.appendChild(slot);
            } else if (typeof slot === 'string') {
                btn.innerHTML = slot;
            } else {
                btn.textContent = label;
            }
            if (disabled) btn.disabled = true;
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                setActive(wrap, key);
                onChange?.(key);
            });
            wrap.appendChild(btn);
        });
        return wrap;
    },
    setActive,
};
