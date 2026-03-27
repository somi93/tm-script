document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Metric ── */
.tmu-metric{position:relative;min-width:0}
.tmu-metric-copy{min-width:0}
.tmu-metric-label{color:#9dbd82;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;line-height:1.2}
.tmu-metric-value{margin-top:8px;color:#f2f8ec;font-weight:800;line-height:1.1;letter-spacing:-.02em;word-break:break-word;font-variant-numeric:tabular-nums;text-wrap:balance}
.tmu-metric-note{margin-top:8px;color:#a6c18f;font-size:11px;line-height:1.45}
.tmu-metric-value a,.tmu-metric-note a{color:inherit;text-decoration:none}
.tmu-metric-value a:hover,.tmu-metric-note a:hover{text-decoration:underline}
.tmu-metric-size-sm .tmu-metric-value{font-size:14px}
.tmu-metric-size-md .tmu-metric-value{font-size:17px}
.tmu-metric-size-lg .tmu-metric-value{font-size:20px;font-weight:900}
.tmu-metric-size-xl .tmu-metric-value{font-size:30px;font-weight:900;line-height:.98}
.tmu-metric-align-left{text-align:left}
.tmu-metric-align-center{text-align:center}
.tmu-metric-align-right{text-align:right}
.tmu-metric-layout-card{padding:16px 18px 15px;border-radius:14px;background:linear-gradient(180deg,rgba(30,55,20,.42),rgba(12,24,9,.3));border:1px solid rgba(104,153,69,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 10px 24px rgba(0,0,0,.12)}
.tmu-metric-layout-split{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 13px;border-radius:12px;background:linear-gradient(180deg,rgba(49,82,34,.24),rgba(26,44,18,.22));border:1px solid rgba(90,126,42,.24);box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
.tmu-metric-layout-split .tmu-metric-copy{flex:1 1 auto;min-width:0}
.tmu-metric-layout-split .tmu-metric-label{font-size:9px}
.tmu-metric-layout-split .tmu-metric-value{margin-top:0;text-align:right;font-size:13px;line-height:1.15}
.tmu-metric-layout-row{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:8px 10px;border:1px solid transparent;border-radius:10px}
.tmu-metric-layout-row .tmu-metric-copy{flex:1 1 auto}
.tmu-metric-layout-row .tmu-metric-label{font-size:11px;letter-spacing:.02em;text-transform:none;color:#90b178;font-weight:600}
.tmu-metric-layout-row .tmu-metric-note{margin-top:3px;font-size:10px}
.tmu-metric-layout-row .tmu-metric-value{margin-top:0;text-align:right;line-height:1.15}
.tmu-metric-layout-row.tmu-metric-size-sm .tmu-metric-value{font-size:14px}
.tmu-metric-layout-row.tmu-metric-size-md .tmu-metric-value{font-size:17px}
.tmu-metric-layout-row.tmu-metric-size-lg .tmu-metric-value{font-size:20px}
.tmu-metric-label-bottom .tmu-metric-label{margin-top:3px}
.tmu-metric-label-bottom .tmu-metric-value{margin-top:0}
.tmu-metric-size-xl.tmu-metric-label-bottom .tmu-metric-label{font-size:9px;letter-spacing:.05em}
.tmu-metric-tone-muted{background:linear-gradient(180deg,rgba(25,39,18,.3),rgba(12,24,9,.24));border-color:rgba(80,109,58,.16)}
.tmu-metric-tone-overlay{background:linear-gradient(180deg,rgba(27,48,19,.34),rgba(14,26,10,.28));border-color:rgba(86,129,54,.18)}
.tmu-metric-tone-panel{background:linear-gradient(180deg,rgba(34,58,23,.42),rgba(16,29,11,.28));border-color:rgba(108,192,64,.2);box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 10px 24px rgba(0,0,0,.12)}
.tmu-metric-tone-success{background:linear-gradient(180deg,rgba(31,66,20,.4),rgba(17,38,12,.28));border-color:rgba(108,192,64,.24)}
.tmu-metric-tone-warn{background:linear-gradient(180deg,rgba(67,50,16,.34),rgba(39,25,10,.26));border-color:rgba(245,158,11,.24)}
.tmu-metric-tone-danger{background:linear-gradient(180deg,rgba(64,24,24,.34),rgba(35,15,15,.26));border-color:rgba(239,68,68,.22)}
` }));

export const TmMetric = {
    /**
     * metric({ label, value, note, layout, tone, size, align, labelPosition })
     * @returns {string} HTML string
     */
    metric({
        label = '',
        value = '',
        note = '',
        layout = 'card',
        tone = 'overlay',
        size = 'md',
        align = 'left',
        labelPosition = 'top',
        cls = '',
        attrs = {},
        valueCls = '',
        valueAttrs = {},
        noteCls = '',
    } = {}) {
        const classes = [
            'tmu-metric',
            `tmu-metric-layout-${layout}`,
            `tmu-metric-tone-${tone}`,
            `tmu-metric-size-${size}`,
            `tmu-metric-align-${align}`,
            `tmu-metric-label-${labelPosition}`,
        ];
        if (cls) classes.push(cls);

        const attrText = Object.entries(attrs)
            .filter(([, valueAttr]) => valueAttr !== undefined && valueAttr !== null)
            .map(([key, valueAttr]) => ` ${key}="${String(valueAttr).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
            .join('');
        const valueAttrText = Object.entries(valueAttrs)
            .filter(([, valueAttr]) => valueAttr !== undefined && valueAttr !== null)
            .map(([key, valueAttr]) => ` ${key}="${String(valueAttr).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
            .join('');

        if (layout === 'row' || layout === 'split') {
            return `<div class="${classes.join(' ')}"${attrText}><div class="tmu-metric-copy"><div class="tmu-metric-label">${label}</div>${note ? `<div class="tmu-metric-note ${noteCls}">${note}</div>` : ''}</div><div class="tmu-metric-value ${valueCls}"${valueAttrText}>${value}</div></div>`;
        }

        const labelHtml = `<div class="tmu-metric-label">${label}</div>`;
        const valueHtml = `<div class="tmu-metric-value ${valueCls}"${valueAttrText}>${value}</div>`;
        const mainHtml = labelPosition === 'bottom'
            ? `${valueHtml}${labelHtml}`
            : `${labelHtml}${valueHtml}`;

        return `<div class="${classes.join(' ')}"${attrText}>${mainHtml}${note ? `<div class="tmu-metric-note ${noteCls}">${note}</div>` : ''}</div>`;
    },
};