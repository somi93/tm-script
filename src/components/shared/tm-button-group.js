import { TmButton, injectTmButtonCss } from './tm-button.js';

const STYLE_ID = 'tmu-button-group-style';

const injectStyles = (target = document.head) => {
    if (!target) return;
    const existing = target === document.head
        ? document.getElementById(STYLE_ID)
        : target.querySelector?.(`#${STYLE_ID}`);
    if (existing) return;
    injectTmButtonCss(target);
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        .tmu-btn-group {
            display: inline-flex;
        }
        .tmu-btn-group .tmu-btn {
            border-radius: 0;
            border-right-width: 0;
        }
        .tmu-btn-group .tmu-btn:first-child { border-radius: 4px 0 0 4px; }
        .tmu-btn-group .tmu-btn:last-child  { border-radius: 0 4px 4px 0; border-right-width: 1px; }
        .tmu-btn-group .tmu-btn:only-child  { border-radius: 4px; border-right-width: 1px; }
    `;
    target.appendChild(s);
};

export const TmButtonGroup = {
    /**
     * Creates a segmented button group where one button is active at a time.
     *
     * @param {object}   opts
     * @param {Array}    opts.items    — [{ key, label, title? }]
     * @param {string}   opts.active   — initially active key
     * @param {string}  [opts.size]    — 'xs'|'sm'|'md'|'lg'|'xl' (default: 'sm')
     * @param {string}  [opts.cls]     — extra classes on the wrapper
     * @param {Function} opts.onChange — (key) => void
     * @returns {{ el: HTMLDivElement, setActive(key): void }}
     */
    buttonGroup({ items, active, size = 'sm', cls = '', onChange } = {}) {
        injectStyles();

        const wrap = document.createElement('div');
        wrap.className = ['tmu-btn-group', cls].filter(Boolean).join(' ');

        const buttons = new Map();

        const setActive = (key) => {
            buttons.forEach((btn, k) => {
                btn.classList.toggle('tmu-btn-active', k === key);
            });
        };

        items.forEach(({ key, label, title }) => {
            const btn = TmButton.button({
                label,
                title,
                variant: 'primary',
                size,
                active: key === active,
                onClick: () => {
                    setActive(key);
                    onChange?.(key);
                },
            });
            buttons.set(key, btn);
            wrap.appendChild(btn);
        });

        return { el: wrap, setActive };
    },
};
