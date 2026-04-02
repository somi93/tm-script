document.head.appendChild(Object.assign(document.createElement('style'), {
    textContent: `
/* ── Badge ── */
.tmu-badge{display:inline-flex;align-items:center;justify-content:center;gap:var(--tmu-space-sm);min-width:0;border:1px solid transparent;box-sizing:border-box;line-height:1.2;text-decoration:none}
.tmu-badge-label{color:inherit;opacity:.92}
.tmu-badge-value{color:var(--tmu-text-inverse);font-weight:inherit}
.tmu-badge-icon{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto}
.tmu-badge a{color:var(--tmu-text-inverse);text-decoration:none}
.tmu-badge a:hover{text-decoration:underline}
.tmu-badge-size-xs{min-height:16px;padding:0 var(--tmu-space-sm);border-radius:var(--tmu-space-xs);font-size:var(--tmu-font-2xs);font-weight:700;letter-spacing:.05em}
.tmu-badge-size-sm{min-height:18px;padding:0 var(--tmu-space-sm);border-radius:var(--tmu-space-xs);font-size:var(--tmu-font-xs);font-weight:700;letter-spacing:.04em}
.tmu-badge-size-md{min-height:22px;padding:var(--tmu-space-xs) var(--tmu-space-md);border-radius:999px;font-size:var(--tmu-font-sm);font-weight:700;letter-spacing:.03em}
.tmu-badge-shape-rounded{border-radius:var(--tmu-space-xs)}
.tmu-badge-shape-full{border-radius:999px}
.tmu-badge-weight-regular{font-weight:600}
.tmu-badge-weight-bold{font-weight:700}
.tmu-badge-weight-heavy{font-weight:800}
.tmu-badge-uppercase{text-transform:uppercase}
.tmu-badge-tone-muted{background:var(--tmu-surface-dark-soft);border-color:var(--tmu-border-soft-alpha);color:var(--tmu-text-muted)}
.tmu-badge-tone-success{background:var(--tmu-success-fill);border-color:var(--tmu-border-success);color:var(--tmu-success)}
.tmu-badge-tone-warn{background:var(--tmu-warning-fill);border-color:var(--tmu-border-warning);color:var(--tmu-warning-soft)}
.tmu-badge-tone-info{background:var(--tmu-info-fill);border-color:var(--tmu-border-info);color:var(--tmu-info-strong)}
.tmu-badge-tone-accent{background:var(--tmu-accent-fill-soft);border-color:var(--tmu-border-accent);color:var(--tmu-purple)}
.tmu-badge-tone-danger{background:var(--tmu-danger-fill);border-color:var(--tmu-border-danger);color:var(--tmu-danger-strong)}
.tmu-badge-tone-live{background:var(--tmu-live-fill);border-color:var(--tmu-border-live);color:var(--tmu-text-live)}
.tmu-badge-tone-preview{background:var(--tmu-preview-fill);border-color:var(--tmu-border-preview);color:var(--tmu-text-preview)}
.tmu-badge-tone-highlight{background:var(--tmu-highlight-fill);border-color:var(--tmu-border-highlight);color:var(--tmu-text-highlight)}
` }));

export const TmBadge = {
    /**
     * Backward compatible usage:
     *   badge('LIVE', 'live')
     * New usage:
     *   badge({ label: 'ASI', value: '12345', tone: 'highlight' })
     * @returns {string} HTML string
     */
    badge(input, tone = 'muted') {
        if (typeof input !== 'object' || input == null || Array.isArray(input)) {
            return `<span class="tmu-badge tmu-badge-size-sm tmu-badge-shape-rounded tmu-badge-weight-bold tmu-badge-tone-${tone}">${input ?? ''}</span>`;
        }

        const {
            label = '',
            value = '',
            slot = '',
            icon = '',
            size = 'sm',
            shape = 'rounded',
            weight = 'bold',
            uppercase = false,
            cls = '',
            attrs = {},
        } = input;

        const classes = [
            'tmu-badge',
            `tmu-badge-size-${size}`,
            `tmu-badge-shape-${shape}`,
            `tmu-badge-weight-${weight}`,
            `tmu-badge-tone-${tone || 'muted'}`,
        ];
        if (uppercase) classes.push('tmu-badge-uppercase');
        if (cls) classes.push(cls);

        const attrText = Object.entries(attrs)
            .filter(([, valueAttr]) => valueAttr !== undefined && valueAttr !== null)
            .map(([key, valueAttr]) => ` ${key}="${String(valueAttr).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
            .join('');

        const content = slot || [
            icon ? `<span class="tmu-badge-icon">${icon}</span>` : '',
            value !== ''
                ? `<span class="tmu-badge-label">${label}</span><span class="tmu-badge-value">${value}</span>`
                : label,
        ].join('');

        return `<span class="${classes.join(' ')}"${attrText}>${content}</span>`;
    },
};