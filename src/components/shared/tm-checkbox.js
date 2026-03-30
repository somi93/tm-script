document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
.tmu-checkbox-wrap {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: var(--tmu-text-muted);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
}
.tmu-checkbox-wrap:has(.tmu-checkbox:disabled) {
    cursor: not-allowed;
    color: var(--tmu-text-disabled);
}
.tmu-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 13px;
    height: 13px;
    margin: 0;
    position: relative;
    cursor: pointer;
    flex: 0 0 auto;
    border: 1px solid var(--tmu-checkbox-border, rgba(255,255,255,0.25));
    border-radius: 2px;
    background: var(--tmu-checkbox-bg, rgba(255,255,255,0.08));
    transition: background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.tmu-checkbox::after {
    content: '';
    position: absolute;
    left: 3px;
    top: 0px;
    width: 3px;
    height: 7px;
    border: solid rgba(10,18,6,0.92);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    opacity: 0;
}
.tmu-checkbox:checked {
    background: var(--tmu-checkbox-checked-bg, #4a8a30);
    border-color: var(--tmu-checkbox-checked-border, var(--tmu-checkbox-checked-bg, #4a8a30));
}
.tmu-checkbox:checked::after {
    opacity: 1;
}
.tmu-checkbox:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(128,224,72,0.22);
}
.tmu-checkbox:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}
.tmu-checkbox-label {
    cursor: inherit;
}
` }));

export const TmCheckbox = {
    checkbox({
        id,
        name,
        checked = false,
        cls = '',
        disabled = false,
        value,
        attrs = {},
        onChange,
    } = {}) {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = `tmu-checkbox${cls ? ' ' + cls : ''}`;
        if (id) input.id = id;
        if (name) input.name = name;
        if (checked) input.checked = true;
        if (disabled) input.disabled = true;
        if (value !== undefined && value !== null) input.value = String(value);
        Object.entries(attrs).forEach(([key, val]) => {
            if (val === undefined || val === null) return;
            input.setAttribute(key, String(val));
        });
        if (onChange) input.addEventListener('change', onChange);
        return input;
    },

    checkboxField({
        id,
        name,
        checked = false,
        label = '',
        cls = '',
        inputCls = '',
        labelCls = '',
        disabled = false,
        value,
        attrs = {},
        onChange,
    } = {}) {
        const row = document.createElement('label');
        row.className = `tmu-checkbox-wrap${cls ? ' ' + cls : ''}`;
        const input = TmCheckbox.checkbox({
            id,
            name,
            checked,
            cls: inputCls,
            disabled,
            value,
            attrs,
            onChange,
        });
        row.appendChild(input);
        if (label) {
            const text = document.createElement('span');
            text.className = `tmu-checkbox-label${labelCls ? ' ' + labelCls : ''}`;
            text.textContent = label;
            row.appendChild(text);
        }
        row.inputEl = input;
        return row;
    },
};