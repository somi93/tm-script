import { TmUtils } from '../../lib/tm-utils.js';

export const TmSkill = {
    /**
     * Returns a sort-direction indicator for table headers.
     * @param {string}  key     — column key being rendered
     * @param {string}  sortKey — currently active sort column
     * @param {boolean} asc     — true = ascending
     * @returns {string}        — ' ▲', ' ▼', or ''
     */
    sortArrow: (key, sortKey, asc) => key === sortKey ? (asc ? ' ▲' : ' ▼') : '',

    /**
     * Returns an HTML string for a colored skill value with optional decimal superscript.
     *   — null/undefined → muted dash
     *   — floor ≥ 20    → gold ★
     *   — floor ≥ 19    → silver ★ + decimal superscript
     *   — otherwise     → colored integer + decimal superscript
     *
     * @param {number|null} val
     * @returns {string} HTML string
     */
    skillBadge(val) {
        if (val == null) return '<span style="color:var(--tmu-text-disabled-strong)">—</span>';
        const floor = Math.floor(val);
        const frac = val - floor;
        const fracStr = frac > 0.005
            ? `<sup style="font-size:8px;opacity:.75">.${Math.round(frac * 100).toString().padStart(2, '0')}</sup>`
            : '';
        if (floor >= 20) return '<span style="color:var(--tmu-metal-gold);font-size:13px">★</span>';
        if (floor >= 19) return `<span style="color:var(--tmu-metal-silver);font-size:13px">★${fracStr}</span>`;
        return `<span style="color:${TmUtils.skillColor(floor)}">${floor}${fracStr}</span>`;
    },
};
