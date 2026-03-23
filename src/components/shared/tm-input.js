document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Input / Field ── */
.tmu-input {
    border-radius: 4px;
    background: rgba(0,0,0,.25);
    border: 1px solid rgba(42,74,28,.6);
    color: #e8f5d8;
    font-weight: 600;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
}
.tmu-input:focus { border-color: #6cc040; }
.tmu-input:disabled { color: #6a7f5c; cursor: not-allowed; }
.tmu-input::placeholder { color: #5a7a48; }
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
.tmu-input-density-compact { min-height: 26px; padding: 4px 8px; }
.tmu-input-density-regular { min-height: 30px; padding: 4px 8px; }
.tmu-input-density-comfy { min-height: 34px; padding: 8px 10px; }
.tmu-input-tone-default { }
.tmu-input-tone-overlay {
    background: rgba(0,0,0,.35);
    border-color: rgba(61,104,40,.4);
    color: #c8e0b4;
}
.tmu-input-tone-overlay:focus { border-color: rgba(108,192,64,.6); }
.tmu-input-tone-overlay:disabled { color: #3a5228; }
.tmu-input-tone-overlay::placeholder { color: #4a6a38; }
.tmu-field { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.tmu-field-label { font-size: 10px; font-weight: 600; color: #90b878; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; }
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