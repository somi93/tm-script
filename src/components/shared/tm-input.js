document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Input / Field ── */
.tmu-input {
    border-radius: var(--tmu-space-xs);
    background: var(--tmu-surface-overlay);
    border: 1px solid var(--tmu-border-input);
    color: var(--tmu-text-strong);
    font-weight: 600;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
}
.tmu-input:focus { border-color: var(--tmu-success); }
.tmu-input:disabled { color: var(--tmu-text-disabled); cursor: not-allowed; }
.tmu-input::placeholder { color: var(--tmu-text-dim); }
.tmu-input[type="number"] { -moz-appearance: textfield; }
.tmu-input[type="number"]::-webkit-inner-spin-button,
.tmu-input[type="number"]::-webkit-outer-spin-button { opacity: 1; filter: invert(0.6); }
.tmu-input-xs { width: 54px; }
.tmu-input-sm { width: 70px; }
.tmu-input-md { width: 110px; }
.tmu-input-lg { width: 180px; }
.tmu-input-xl { width: 200px; }
.tmu-input-full { width: 100%; }
.tmu-input-grow { flex: 1; min-width: 0; }
.tmu-input-align-left { text-align: left; }
.tmu-input-align-center { text-align: center; }
.tmu-input-align-right { text-align: right; }
.tmu-input-density-compact { min-height: 26px; padding: var(--tmu-space-xs) var(--tmu-space-sm); }
.tmu-input-density-regular { min-height: 30px; padding: var(--tmu-space-xs) var(--tmu-space-sm); }
.tmu-input-density-comfy { min-height: 34px; padding: var(--tmu-space-sm) var(--tmu-space-md); }
.tmu-input-tone-default { }
.tmu-input-tone-overlay {
    background: var(--tmu-surface-overlay-strong);
    border-color: var(--tmu-border-input-overlay);
    color: var(--tmu-text-main);
}
.tmu-input-tone-overlay:focus { border-color: var(--tmu-border-success); }
.tmu-input-tone-overlay:disabled { color: var(--tmu-text-disabled-strong); }
.tmu-input-tone-overlay::placeholder { color: var(--tmu-text-disabled); }
.tmu-field { display: flex; align-items: center; justify-content: space-between; gap: var(--tmu-space-sm); }
.tmu-field-label { font-size: var(--tmu-font-xs); font-weight: 600; color: var(--tmu-text-panel-label); text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; }
` }));

export const TmInput = {
    input({
        id,
        name,
        type = 'text',
        value = '',
        placeholder = '',
        size = 'md',
        tone = 'default',
        density = 'regular',
        align = 'left',
        grow = false,
        cls = '',
        disabled = false,
        autocomplete,
        min,
        max,
        step,
        attrs = {},
        onInput,
        onChange,
    } = {}) {
        const input = document.createElement('input');
        input.type = type;
        input.className = `tmu-input tmu-input-${size} tmu-input-tone-${tone} tmu-input-density-${density} tmu-input-align-${align} text-sm${grow ? ' tmu-input-grow' : ''}${cls ? ' ' + cls : ''}`;
        if (id) input.id = id;
        if (name) input.name = name;
        if (value !== undefined && value !== null) input.value = String(value);
        if (placeholder) input.placeholder = placeholder;
        if (autocomplete !== undefined) input.autocomplete = autocomplete;
        if (min !== undefined) input.min = String(min);
        if (max !== undefined) input.max = String(max);
        if (step !== undefined) input.step = String(step);
        if (disabled) input.disabled = true;
        Object.entries(attrs).forEach(([key, val]) => {
            if (val === undefined || val === null) return;
            input.setAttribute(key, String(val));
        });
        if (onInput) input.addEventListener('input', onInput);
        if (onChange) input.addEventListener('change', onChange);
        return input;
    },

    field({ label, input, cls = '' } = {}) {
        const row = document.createElement('div');
        row.className = `tmu-field${cls ? ' ' + cls : ''}`;
        if (label) {
            const lbl = document.createElement('span');
            lbl.className = 'tmu-field-label';
            lbl.textContent = label;
            row.appendChild(lbl);
        }
        if (input) row.appendChild(input);
        return row;
    },
};