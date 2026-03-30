import { TmInput } from './tm-input.js';

document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
.tmu-ac {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
}
.tmu-ac-leading {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.tmu-ac-drop {
    display: none;
    position: absolute;
    top: calc(100% + 2px);
    left: 0;
    right: 0;
    background: var(--tmu-surface-card-soft);
    border: 1px solid var(--tmu-border-faint);
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 100;
    scrollbar-width: thin;
    scrollbar-color: var(--tmu-border-embedded) transparent;
    box-shadow: 0 6px 20px rgba(0,0,0,0.6);
}
.tmu-ac-drop.tmu-ac-drop-open {
    display: block;
}
.tmu-ac-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    font-size: 11px;
    color: var(--tmu-text-main);
    cursor: pointer;
    border-bottom: 1px solid var(--tmu-border-input-overlay);
}
.tmu-ac-item:hover {
    background: var(--tmu-surface-tab-hover);
    color: var(--tmu-text-strong);
}
.tmu-ac-item.tmu-ac-item-active {
    color: var(--tmu-success);
    font-weight: 700;
}
.tmu-ac-item-icon,
.tmu-ac-media {
    width: 20px;
    height: 13px;
    object-fit: cover;
    border-radius: 2px;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
` }));

const setLeadingContent = (host, content) => {
    host.innerHTML = '';
    if (!content) {
        host.hidden = true;
        return;
    }
    if (typeof content === 'string') {
        host.innerHTML = content;
    } else {
        host.appendChild(content);
    }
    host.hidden = false;
};

export const TmAutocomplete = {
    autocomplete({
        id,
        name,
        value = '',
        placeholder = '',
        size = 'full',
        tone = 'default',
        density = 'regular',
        grow = true,
        cls = '',
        disabled = false,
        autocomplete = 'off',
        attrs = {},
        leading = null,
        onInput,
        onChange,
    } = {}) {
        const root = document.createElement('div');
        root.className = `tmu-ac${cls ? ` ${cls}` : ''}`;

        const leadingHost = document.createElement('div');
        leadingHost.className = 'tmu-ac-leading';
        root.appendChild(leadingHost);
        setLeadingContent(leadingHost, leading);

        const input = TmInput.input({
            id,
            name,
            value,
            placeholder,
            size,
            tone,
            density,
            grow,
            disabled,
            autocomplete,
            attrs: {
                'aria-autocomplete': 'list',
                ...attrs,
            },
            onInput,
            onChange,
        });
        root.appendChild(input);

        const drop = document.createElement('div');
        drop.className = 'tmu-ac-drop';
        root.appendChild(drop);

        root.inputEl = input;
        root.dropEl = drop;
        root.leadingEl = leadingHost;
        root.setLeading = (content) => setLeadingContent(leadingHost, content);
        root.hideDrop = () => drop.classList.remove('tmu-ac-drop-open');
        root.showDrop = () => {
            if (!drop.childElementCount) return;
            drop.classList.add('tmu-ac-drop-open');
        };
        root.setItems = (items = []) => {
            drop.innerHTML = '';
            items.forEach(item => {
                if (!item) return;
                drop.appendChild(item);
            });
            if (drop.childElementCount) root.showDrop();
            else root.hideDrop();
        };
        root.setValue = (nextValue = '') => {
            input.value = String(nextValue);
        };
        root.setDisabled = (nextDisabled) => {
            input.disabled = !!nextDisabled;
        };

        return root;
    },

    autocompleteItem({ label = '', icon = null, active = false, onSelect } = {}) {
        const el = document.createElement('div');
        el.className = `tmu-ac-item${active ? ' tmu-ac-item-active' : ''}`;
        if (icon) {
            if (typeof icon === 'string') {
                const wrap = document.createElement('span');
                wrap.className = 'tmu-ac-item-icon';
                wrap.innerHTML = icon;
                el.appendChild(wrap);
            } else {
                el.appendChild(icon);
            }
        }
        el.appendChild(document.createTextNode(label));
        if (onSelect) {
            el.addEventListener('mousedown', event => {
                event.preventDefault();
                onSelect();
            });
        }
        return el;
    },
};