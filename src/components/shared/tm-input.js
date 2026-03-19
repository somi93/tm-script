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
.tmu-input::placeholder { color: #5a7a48; }
.tmu-input-sm { width: 70px; }
.tmu-input-md { width: 110px; }
.tmu-input-lg { width: 180px; }
.tmu-input-full { width: 100%; }
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
        cls = '',
        disabled = false,
        autocomplete,
        min,
        max,
        step,
        onInput,
        onChange,
    } = {}) {
        const input = document.createElement('input');
        input.type = type;
        input.className = `tmu-input tmu-input-${size} py-1 px-2 text-sm${cls ? ' ' + cls : ''}`;
        if (id) input.id = id;
        if (name) input.name = name;
        if (value !== undefined && value !== null) input.value = String(value);
        if (placeholder) input.placeholder = placeholder;
        if (autocomplete !== undefined) input.autocomplete = autocomplete;
        if (min !== undefined) input.min = String(min);
        if (max !== undefined) input.max = String(max);
        if (step !== undefined) input.step = String(step);
        if (disabled) input.disabled = true;
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