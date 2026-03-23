document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Chip ── */
.tmu-chip{display:inline-flex;align-items:center;justify-content:center;gap:4px;border:1px solid transparent;box-sizing:border-box}
.tmu-chip-label{color:inherit;opacity:.9}
.tmu-chip-value{color:#fff;font-weight:inherit}
.tmu-chip a{color:#fff;text-decoration:none}
.tmu-chip a:hover{text-decoration:underline}
.tmu-chip-size-xs{min-height:16px;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;letter-spacing:.05em;line-height:1.2}
.tmu-chip-size-sm{min-height:18px;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.04em;line-height:1.2}
.tmu-chip-size-md{min-height:22px;padding:0 8px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.04em;line-height:1.2}
.tmu-chip-shape-rounded{border-radius:4px}
.tmu-chip-shape-full{border-radius:999px}
.tmu-chip-weight-regular{font-weight:600}
.tmu-chip-weight-bold{font-weight:700}
.tmu-chip-weight-heavy{font-weight:800}
.tmu-chip-uppercase{text-transform:uppercase}
.tmu-chip-gk,.tmu-chip-tone-success{background:rgba(108,192,64,.15);border-color:rgba(108,192,64,.24);color:#6cc040}
.tmu-chip-d {background:rgba(110,181,255,.12);border-color:rgba(110,181,255,.2);color:#6eb5ff}
.tmu-chip-m {background:rgba(255,215,64,.1);border-color:rgba(255,215,64,.18);color:#ffd740}
.tmu-chip-f {background:rgba(255,112,67,.12);border-color:rgba(255,112,67,.2);color:#ff7043}
.tmu-chip-default,.tmu-chip-tone-muted{background:rgba(200,224,180,.08);border-color:rgba(200,224,180,.12);color:#8aac72}
.tmu-chip-tone-overlay{background:rgba(42,74,28,.34);border-color:rgba(78,130,54,.22);color:#c8e0b4}
.tmu-chip-tone-warn{background:rgba(245,158,11,.15);border-color:rgba(245,158,11,.24);color:#f59e0b}
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
