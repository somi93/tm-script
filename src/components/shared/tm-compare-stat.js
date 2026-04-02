document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Comparative stat row ── */
.tmu-cstat{min-width:0}
.tmu-cstat-header{display:flex;align-items:baseline;justify-content:space-between;gap:var(--tmu-space-md);margin-bottom:var(--tmu-space-xs)}
.tmu-cstat-val{font-weight:800;min-width:32px;font-variant-numeric:tabular-nums}
.tmu-cstat-val-left{text-align:left}
.tmu-cstat-val-right{text-align:right}
.tmu-cstat-val-leading{font-weight:900}
.tmu-cstat-label{font-weight:600;color:var(--tmu-text-muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em}
.tmu-cstat-bar{display:flex;overflow:hidden;background:var(--tmu-compare-bar-bg);gap:var(--tmu-space-xs)}
.tmu-cstat-seg{transition:width .5s cubic-bezier(.4,0,.2,1);min-width:3px}
.tmu-cstat-size-sm{padding:var(--tmu-space-sm) 0}
.tmu-cstat-size-sm .tmu-cstat-val{font-size:14px;min-width:30px}
.tmu-cstat-size-sm .tmu-cstat-val-leading{font-size:16px}
.tmu-cstat-size-sm .tmu-cstat-bar{height:6px;border-radius:var(--tmu-space-xs)}
.tmu-cstat-size-sm .tmu-cstat-seg{border-radius:var(--tmu-space-xs)}
.tmu-cstat-size-md{padding:var(--tmu-space-md) var(--tmu-space-lg)}
.tmu-cstat-size-md .tmu-cstat-val{font-size:15px}
.tmu-cstat-size-md .tmu-cstat-val-leading{font-size:17px}
.tmu-cstat-size-md .tmu-cstat-bar{height:7px;border-radius:var(--tmu-space-xs)}
.tmu-cstat-size-md .tmu-cstat-seg{border-radius:var(--tmu-space-xs)}
.tmu-cstat-highlight{background:var(--tmu-compare-fill)}
.tmu-cstat-tone-home,.tmu-cstat-tone-for{color:var(--tmu-accent)}
.tmu-cstat-tone-away,.tmu-cstat-tone-against{color:var(--tmu-info-alt)}
.tmu-cstat-seg.tmu-cstat-tone-home,.tmu-cstat-seg.tmu-cstat-tone-for{background:linear-gradient(90deg,var(--tmu-compare-home-grad-start),var(--tmu-compare-home-grad-end))}
.tmu-cstat-seg.tmu-cstat-tone-away,.tmu-cstat-seg.tmu-cstat-tone-against{background:linear-gradient(90deg,var(--tmu-compare-away-grad-start),var(--tmu-compare-away-grad-end))}
` }));

const parseComparable = (value) => {
    const numeric = Number.parseFloat(String(value ?? '').replace(/[^\d.+-]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
};

export const TmCompareStat = {
    compareStat({
        label = '',
        leftValue = '',
        rightValue = '',
        leftNumber,
        rightNumber,
        leftTone = 'home',
        rightTone = 'away',
        size = 'md',
        highlight = false,
        cls = '',
        attrs = {},
    } = {}) {
        const leftNumeric = leftNumber ?? parseComparable(leftValue);
        const rightNumeric = rightNumber ?? parseComparable(rightValue);
        const total = leftNumeric + rightNumeric;
        const leftPct = total === 0 ? 50 : Math.round((leftNumeric / total) * 100);
        const rightPct = 100 - leftPct;

        const classes = ['tmu-cstat', `tmu-cstat-size-${size}`];
        if (highlight) classes.push('tmu-cstat-highlight');
        if (cls) classes.push(cls);

        const attrText = Object.entries(attrs)
            .filter(([, valueAttr]) => valueAttr !== undefined && valueAttr !== null)
            .map(([key, valueAttr]) => ` ${key}="${String(valueAttr).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
            .join('');

        const leftLead = leftNumeric > rightNumeric ? ' tmu-cstat-val-leading' : '';
        const rightLead = rightNumeric > leftNumeric ? ' tmu-cstat-val-leading' : '';

        return `<div class="${classes.join(' ')}"${attrText}><div class="tmu-cstat-header"><span class="tmu-cstat-val tmu-cstat-val-left tmu-cstat-tone-${leftTone}${leftLead}">${leftValue}</span><span class="tmu-cstat-label">${label}</span><span class="tmu-cstat-val tmu-cstat-val-right tmu-cstat-tone-${rightTone}${rightLead}">${rightValue}</span></div><div class="tmu-cstat-bar"><div class="tmu-cstat-seg tmu-cstat-tone-${leftTone}" style="width:${leftPct}%"></div><div class="tmu-cstat-seg tmu-cstat-tone-${rightTone}" style="width:${rightPct}%"></div></div></div>`;
    },
};