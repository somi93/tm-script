document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Chip ── */
.tmu-chip{display:inline-flex;align-items:center;justify-content:center;gap:var(--tmu-space-xs);border:1px solid transparent;box-sizing:border-box}
.tmu-chip-label{color:inherit;opacity:.9}
.tmu-chip-value{color:var(--tmu-text-inverse);font-weight:inherit}
.tmu-chip a{color:var(--tmu-text-inverse);text-decoration:none}
.tmu-chip a:hover{text-decoration:underline}
.tmu-chip-size-xs{min-height:16px;padding:0 var(--tmu-space-sm);border-radius:var(--tmu-space-xs);font-size:var(--tmu-font-2xs);font-weight:700;letter-spacing:.05em;line-height:1.2}
.tmu-chip-size-sm{min-height:18px;padding:0 var(--tmu-space-sm);border-radius:var(--tmu-space-xs);font-size:var(--tmu-font-xs);font-weight:700;letter-spacing:.04em;line-height:1.2}
.tmu-chip-size-md{min-height:22px;padding:0 var(--tmu-space-sm);border-radius:999px;font-size:var(--tmu-font-xs);font-weight:800;letter-spacing:.04em;line-height:1.2}
.tmu-chip-shape-rounded{border-radius:var(--tmu-space-xs)}
.tmu-chip-shape-full{border-radius:999px}
.tmu-chip-weight-regular{font-weight:600}
.tmu-chip-weight-bold{font-weight:700}
.tmu-chip-weight-heavy{font-weight:800}
.tmu-chip-uppercase{text-transform:uppercase}
.tmu-chip-gk,.tmu-chip-tone-success{background:var(--tmu-success-fill-soft);border-color:var(--tmu-border-success);color:var(--tmu-success)}
.tmu-chip-d {background:var(--tmu-info-fill);border-color:var(--tmu-border-info);color:var(--tmu-info-strong)}
.tmu-chip-m {background:var(--tmu-highlight-fill);border-color:var(--tmu-border-highlight);color:var(--tmu-text-highlight)}
.tmu-chip-f {background:var(--tmu-warning-fill);border-color:var(--tmu-border-warning);color:var(--tmu-warning-soft)}
.tmu-chip-default,.tmu-chip-tone-muted{background:var(--tmu-surface-dark-soft);border-color:var(--tmu-border-soft-alpha);color:var(--tmu-text-muted)}
.tmu-chip-tone-overlay{background:var(--tmu-surface-overlay);border-color:var(--tmu-border-input-overlay);color:var(--tmu-text-main)}
.tmu-chip-tone-warn{background:var(--tmu-warning-fill);border-color:var(--tmu-border-warning);color:var(--tmu-warning-soft)}
` }));

export const TmChip = {
    /**
     * Backward compatible usage:
     *   chip('GK', 'gk')
     * New usage:
     *   chip({ label: 'GK', tone: 'warn', size: 'xs', shape: 'rounded' })
     * @returns {string} HTML string
     */
    chip(input, variant = 'default') {
        if (typeof input !== 'object' || input == null || Array.isArray(input)) {
            return `<span class="tmu-chip tmu-chip-size-sm tmu-chip-shape-rounded tmu-chip-${variant}">${input ?? ''}</span>`;
        }

        const {
            label = '',
            value = '',
            slot = '',
            tone = 'muted',
            size = 'sm',
            shape = size === 'md' ? 'full' : 'rounded',
            weight = size === 'md' ? 'heavy' : 'bold',
            uppercase = false,
            cls = '',
            attrs = {},
        } = input;

        const classes = [
            'tmu-chip',
            `tmu-chip-size-${size}`,
            `tmu-chip-shape-${shape}`,
            `tmu-chip-weight-${weight}`,
            `tmu-chip-tone-${tone}`,
        ];
        if (uppercase) classes.push('tmu-chip-uppercase');
        if (cls) classes.push(cls);

        const attrText = Object.entries(attrs)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => ` ${key}="${String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
            .join('');

        const content = slot || (value !== ''
            ? `<span class="tmu-chip-label">${label}</span><span class="tmu-chip-value">${value}</span>`
            : label);

        return `<span class="${classes.join(' ')}"${attrText}>${content}</span>`;
    },
};
