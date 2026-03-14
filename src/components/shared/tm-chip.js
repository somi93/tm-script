document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Chip ── */
.tmu-chip{display:inline-block;padding:1px 7px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:.3px;line-height:16px}
.tmu-chip-gk{background:rgba(108,192,64,.15);color:#6cc040}
.tmu-chip-d {background:rgba(110,181,255,.12);color:#6eb5ff}
.tmu-chip-m {background:rgba(255,215,64,.1); color:#ffd740}
.tmu-chip-f {background:rgba(255,112,67,.12);color:#ff7043}
.tmu-chip-default{background:rgba(200,224,180,.08);color:#8aac72}
` }));

export const TmChip = {
    /**
     * @param {string} text
     * @param {string} variant — 'gk' | 'd' | 'm' | 'f' | 'default'
     * @returns {string} HTML string
     */
    chip: (text, variant = 'default') =>
        `<span class="tmu-chip tmu-chip-${variant}">${text}</span>`,
};
