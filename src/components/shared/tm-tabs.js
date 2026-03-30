const STYLE_ID = 'tmu-tabs-style';

export const TMU_TABS_CSS = `
/* ── Tab bar (tmu-tabs / tmu-tab) ── */
.tmu-tabs{
display:flex;align-items:stretch;
background:var(--tmu-tabs-bg,var(--tmu-tabs-primary-bg));
border:1px solid var(--tmu-tabs-border,var(--tmu-tabs-primary-border));
overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;
scrollbar-color:var(--tmu-tabs-scrollbar,var(--tmu-tabs-primary-border)) transparent
}
.tmu-card-body-flush > .tmu-tabs:first-child{
border-top:0;
border-left:0;
border-right:0
}
.tmu-tabs-color-primary{
--tmu-tabs-bg:var(--tmu-tabs-primary-bg);
--tmu-tabs-border:var(--tmu-tabs-primary-border);
--tmu-tabs-text:var(--tmu-tabs-primary-text);
--tmu-tabs-hover-text:var(--tmu-tabs-primary-hover-text);
--tmu-tabs-hover-bg:var(--tmu-tabs-primary-hover-bg);
--tmu-tabs-active-text:var(--tmu-tabs-primary-active-text);
--tmu-tabs-active-bg:var(--tmu-tabs-primary-active-bg);
--tmu-tabs-active-border:var(--tmu-tabs-primary-active-border)
}
.tmu-tabs-color-secondary{
--tmu-tabs-bg:var(--tmu-tabs-secondary-bg);
--tmu-tabs-border:var(--tmu-tabs-secondary-border);
--tmu-tabs-text:var(--tmu-tabs-secondary-text);
--tmu-tabs-hover-text:var(--tmu-tabs-secondary-hover-text);
--tmu-tabs-hover-bg:var(--tmu-tabs-secondary-hover-bg);
--tmu-tabs-active-text:var(--tmu-tabs-secondary-active-text);
--tmu-tabs-active-bg:var(--tmu-tabs-secondary-active-bg);
--tmu-tabs-active-border:var(--tmu-tabs-secondary-active-border)
}
.tmu-tabs-stretch .tmu-tab{flex:1 1 0;min-width:0}
.tmu-tab{padding:8px 12px;text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--tmu-tabs-text,var(--tmu-tabs-primary-text));cursor:pointer;border:none;border-bottom:2px solid transparent;transition:all .15s;background:transparent;font-family:inherit;-webkit-appearance:none;appearance:none;display:flex;align-items:center;justify-content:center;gap:6px;flex:0 0 auto;min-width:max-content}
.tmu-tab:hover:not(:disabled){color:var(--tmu-tabs-hover-text,var(--tmu-tabs-primary-hover-text));background:var(--tmu-tabs-hover-bg,var(--tmu-tabs-primary-hover-bg))}
.tmu-tab.active{color:var(--tmu-tabs-active-text,var(--tmu-tabs-primary-active-text));border-bottom-color:var(--tmu-tabs-active-border,var(--tmu-tabs-primary-active-border));background:var(--tmu-tabs-active-bg,var(--tmu-tabs-primary-active-bg))}
.tmu-tab:disabled{opacity:.4;cursor:not-allowed}
.tmu-tab-icon{font-size:14px;line-height:1;flex-shrink:0}
`;

export function injectTmTabsCss(target = document.head) {
    if (!target) return;
    if (target === document.head) {
        if (document.getElementById(STYLE_ID)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID}`)) {
        return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = TMU_TABS_CSS;
    target.appendChild(style);
}

injectTmTabsCss();

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
