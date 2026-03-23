const STYLE_ID = 'tm-summary-strip-style';

const CSS_TEXT = `
.tmu-summary-strip{
    display:flex;
    gap:14px;
    margin-bottom:12px;
    padding:10px 14px;
    background:rgba(42,74,28,.3);
    border:1px solid #2a4a1c;
    border-radius:8px;
    flex-wrap:wrap;
}
.tmu-summary-strip-boxed{
    gap:8px;
    padding:8px 10px;
    background:#162e0e;
}
.tmu-summary-item{
    display:flex;
    flex-direction:column;
    min-width:80px;
}
.tmu-summary-item-center{
    align-items:center;
    text-align:center;
}
.tmu-summary-item-value-first .tmu-summary-label{
    margin-top:2px;
}
.tmu-summary-item-value-first .tmu-summary-value{
    margin-top:0;
}
.tmu-summary-strip-boxed .tmu-summary-item{
    min-width:72px;
    padding:5px 10px;
    background:#1c3410;
    border-radius:6px;
    align-items:center;
    text-align:center;
}
.tmu-summary-label{
    color:#6a9a58;
    font-size:9px;
    text-transform:uppercase;
    letter-spacing:.5px;
    font-weight:700;
}
.tmu-summary-value{
    font-size:16px;
    font-weight:800;
    margin-top:3px;
    color:#c8e0b4;
}
`;

function ensureStyle(target) {
    if (!target) return;
    if (target === document.head) {
        if (document.getElementById(STYLE_ID)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID}`)) {
        return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS_TEXT;
    target.appendChild(style);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderItem(item, opts) {
    const itemCls = [
        'tmu-summary-item',
        opts.align === 'center' ? 'tmu-summary-item-center' : '',
        opts.valueFirst ? 'tmu-summary-item-value-first' : '',
        opts.itemCls || '',
        item.itemCls || '',
    ].filter(Boolean).join(' ');
    const itemStyle = item.minWidth || opts.itemMinWidth ? ` style="min-width:${item.minWidth || opts.itemMinWidth}"` : '';
    const labelCls = ['tmu-summary-label', opts.labelCls || '', item.labelCls || ''].filter(Boolean).join(' ');
    const valueCls = ['tmu-summary-value', opts.valueCls || '', item.valueCls || ''].filter(Boolean).join(' ');
    const labelHtml = `<div class="${labelCls}">${escapeHtml(item.label)}</div>`;
    const valueHtml = `<div class="${valueCls}"${item.valueStyle ? ` style="${item.valueStyle}"` : ''}>${item.valueHtml != null ? item.valueHtml : escapeHtml(item.value)}</div>`;

    return `<div class="${itemCls}"${itemStyle}>${opts.valueFirst ? valueHtml + labelHtml : labelHtml + valueHtml}</div>`;
}

export const TmSummaryStrip = {
    cssText: CSS_TEXT,
    injectCSS(target = document.head) {
        ensureStyle(target);
    },
    render(items = [], opts = {}) {
        ensureStyle(document.head);
        const wrapCls = [
            'tmu-summary-strip',
            opts.variant === 'boxed' ? 'tmu-summary-strip-boxed' : '',
            opts.cls || '',
        ].filter(Boolean).join(' ');
        return `<div class="${wrapCls}">${items.map(item => renderItem(item, opts)).join('')}</div>`;
    },
};