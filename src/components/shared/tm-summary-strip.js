const STYLE_ID = 'tm-summary-strip-style';

const CSS_TEXT = `
.tmu-summary-strip{
    display:flex;
    gap:var(--tmu-space-lg);
    margin-bottom:var(--tmu-space-md);
    padding:var(--tmu-space-md) var(--tmu-space-lg);
    background:var(--tmu-surface-panel);
    border:1px solid var(--tmu-border-soft);
    border-radius:var(--tmu-space-sm);
    flex-wrap:wrap;
}
.tmu-summary-strip-boxed{
    gap:var(--tmu-space-sm);
    padding:var(--tmu-space-sm) var(--tmu-space-md);
    background:var(--tmu-surface-card-soft);
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
    margin-top:var(--tmu-space-xs);
}
.tmu-summary-item-value-first .tmu-summary-value{
    margin-top:0;
}
.tmu-summary-strip-boxed .tmu-summary-item{
    min-width:72px;
    padding:var(--tmu-space-xs) var(--tmu-space-md);
    background:var(--tmu-surface-panel);
    border-radius:var(--tmu-space-sm);
    align-items:center;
    text-align:center;
}
.tmu-summary-label{
    color:var(--tmu-text-faint);
    font-size:9px;
    text-transform:uppercase;
    letter-spacing:.5px;
    font-weight:700;
}
.tmu-summary-value{
    font-size:16px;
    font-weight:800;
    margin-top:var(--tmu-space-xs);
    color:var(--tmu-text-main);
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