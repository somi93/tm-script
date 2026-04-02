document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Metric ── */
.tmu-metric{position:relative;min-width:0}
.tmu-metric-copy{min-width:0}
.tmu-metric-label{color:var(--tmu-text-panel-label);font-size:var(--tmu-font-xs);font-weight:700;text-transform:uppercase;letter-spacing:.12em;line-height:1.2}
.tmu-metric-value{margin-top:var(--tmu-space-sm);color:var(--tmu-text-strong);font-weight:800;line-height:1.1;letter-spacing:-.02em;word-break:break-word;font-variant-numeric:tabular-nums;text-wrap:balance}
.tmu-metric-note{margin-top:var(--tmu-space-sm);color:var(--tmu-text-accent-soft);font-size:var(--tmu-font-xs);line-height:1.45}
.tmu-metric-value a,.tmu-metric-note a{color:inherit;text-decoration:none}
.tmu-metric-value a:hover,.tmu-metric-note a:hover{text-decoration:underline}
.tmu-metric-size-sm .tmu-metric-value{font-size:var(--tmu-font-md)}
.tmu-metric-size-md .tmu-metric-value{font-size:17px}
.tmu-metric-size-lg .tmu-metric-value{font-size:var(--tmu-font-xl);font-weight:900}
.tmu-metric-size-xl .tmu-metric-value{font-size:var(--tmu-font-3xl);font-weight:900;line-height:.98}
.tmu-metric-align-left{text-align:left}
.tmu-metric-align-center{text-align:center}
.tmu-metric-align-right{text-align:right}
.tmu-metric-layout-card{padding:var(--tmu-space-lg) var(--tmu-space-xl) var(--tmu-space-lg);border-radius:var(--tmu-space-lg);background:linear-gradient(180deg,var(--tmu-surface-dark-strong),var(--tmu-surface-dark-soft));border:1px solid var(--tmu-border-soft-alpha-mid);box-shadow:inset 0 1px 0 var(--tmu-border-contrast),0 10px 24px var(--tmu-shadow-ring)}
.tmu-metric-layout-split{display:flex;align-items:center;justify-content:space-between;gap:var(--tmu-space-lg);padding:var(--tmu-space-md) var(--tmu-space-lg);border-radius:var(--tmu-space-md);background:linear-gradient(180deg,var(--tmu-surface-accent-soft),var(--tmu-surface-dark-soft));border:1px solid var(--tmu-border-soft-alpha-mid);box-shadow:inset 0 1px 0 var(--tmu-border-contrast)}
.tmu-metric-layout-split .tmu-metric-copy{flex:1 1 auto;min-width:0}
.tmu-metric-layout-split .tmu-metric-label{font-size:var(--tmu-font-2xs)}
.tmu-metric-layout-split .tmu-metric-value{margin-top:0;text-align:right;font-size:var(--tmu-font-sm);line-height:1.15}
.tmu-metric-layout-row{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--tmu-space-lg);padding:var(--tmu-space-sm) var(--tmu-space-md);border:1px solid transparent;border-radius:var(--tmu-space-md)}
.tmu-metric-layout-row .tmu-metric-copy{flex:1 1 auto}
.tmu-metric-layout-row .tmu-metric-label{font-size:var(--tmu-font-xs);letter-spacing:.02em;text-transform:none;color:var(--tmu-text-panel-label);font-weight:600}
.tmu-metric-layout-row .tmu-metric-note{margin-top:var(--tmu-space-xs);font-size:var(--tmu-font-xs)}
.tmu-metric-layout-row .tmu-metric-value{margin-top:0;text-align:right;line-height:1.15}
.tmu-metric-layout-row.tmu-metric-size-sm .tmu-metric-value{font-size:var(--tmu-font-md)}
.tmu-metric-layout-row.tmu-metric-size-md .tmu-metric-value{font-size:17px}
.tmu-metric-layout-row.tmu-metric-size-lg .tmu-metric-value{font-size:var(--tmu-font-xl)}
.tmu-metric-label-bottom .tmu-metric-label{margin-top:var(--tmu-space-xs)}
.tmu-metric-label-bottom .tmu-metric-value{margin-top:0}
.tmu-metric-size-xl.tmu-metric-label-bottom .tmu-metric-label{font-size:var(--tmu-font-2xs);letter-spacing:.05em}
.tmu-metric-tone-muted{background:linear-gradient(180deg,var(--tmu-surface-card-soft),var(--tmu-surface-dark-soft));border-color:var(--tmu-border-soft-alpha)}
.tmu-metric-tone-overlay{background:linear-gradient(180deg,var(--tmu-surface-dark-mid),var(--tmu-surface-dark-soft));border-color:var(--tmu-border-soft-alpha-mid)}
.tmu-metric-tone-panel{background:linear-gradient(180deg,var(--tmu-surface-panel),var(--tmu-surface-dark-soft));border-color:var(--tmu-border-success);box-shadow:inset 0 1px 0 var(--tmu-border-contrast),0 10px 24px var(--tmu-shadow-ring)}
.tmu-metric-tone-success{background:linear-gradient(180deg,var(--tmu-success-fill-strong),var(--tmu-success-fill));border-color:var(--tmu-border-success)}
.tmu-metric-tone-warn{background:linear-gradient(180deg,var(--tmu-warning-fill),var(--tmu-highlight-fill));border-color:var(--tmu-border-warning)}
.tmu-metric-tone-danger{background:linear-gradient(180deg,var(--tmu-danger-fill),var(--tmu-surface-dark-soft));border-color:var(--tmu-border-danger)}
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