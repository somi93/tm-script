import { TmUI } from '../components/shared/tm-ui.js';
import { TmConst } from './tm-constants.js';

// tm-position.js — Canonical position helper
// Depends on: tm-constants.js  (TmConst.POSITION_MAP)
// Exposed as: TmPosition

const ensureChipCSS = (() => {
    let done = false;
    return () => {
        if (done || typeof document === 'undefined') return;
        done = true;
        const s = document.createElement('style');
        s.id = 'tm-pos-chip-styles';
        s.textContent = `.tm-pos-chip{display:inline-block;padding:0 var(--tmu-space-sm);border-radius:var(--tmu-space-xs);`
            + `font-size:var(--tmu-font-xs);font-weight:700;letter-spacing:.3px;`
            + `line-height:16px;text-align:center;min-width:28px;text-transform:uppercase;}`;
        document.head.appendChild(s);
    };
})();

const MAP = TmConst.POSITION_MAP;

// Maps POSITION_MAP id → filter group key used by shortlist filter buttons
const FILTER_GROUPS = { 9: 'gk', 0: 'de', 1: 'de', 2: 'dm', 3: 'dm', 4: 'mf', 5: 'mf', 6: 'om', 7: 'om', 8: 'fw' };

// Colors for grouped display (charts, legends) keyed by POSITION_MAP id
const GROUP_COLORS = {
    9: 'var(--tmu-success-strong)',               // GK
    0: 'var(--tmu-info-dark)', 1: 'var(--tmu-info-dark)',   // DC, DLR
    2: 'var(--tmu-warning)', 3: 'var(--tmu-warning)', // DMC, DMLR
    4: 'var(--tmu-warning)', 5: 'var(--tmu-warning)', // MC, MLR
    6: 'var(--tmu-warning)', 7: 'var(--tmu-warning)', // OMC, OMLR
    8: 'var(--tmu-danger-deep)',               // F
};

// Short group labels keyed by POSITION_MAP id
const GROUP_LABELS = {
    9: 'GK', 0: 'DC', 1: 'DLR', 2: 'DMC', 3: 'DMLR',
    4: 'MC', 5: 'MLR', 6: 'OMC', 7: 'OMLR', 8: 'F',
};

// Normalize a raw position string to a POSITION_MAP key
const norm = (pos) => (pos || '').replace(/sub/i, '').trim().toLowerCase().split(/[\/,]/)[0];

export const TmPosition = {

    /**
     * Display label for a position string.
     * e.g. "subdc" → "DC",  "dl" → "DL",  null → "?"
     */
    label(pos) {
        if (!pos) return '?';
        const cleaned = pos.replace(/sub/i, '').trim().toUpperCase().split(/[\/,]/)[0];
        return cleaned || 'SUB';
    },

    /**
     * Stat group classification: 'gk' | 'def' | 'mid' | 'att'
     * Used for grouping players in stats tables.
     */
    group(pos) {
        const p = norm(pos);
        if (p === 'gk') return 'gk';
        if (/^d/.test(p) || p === 'lb' || p === 'rb' || p === 'sw') return 'def';
        if (/^(fc|st|cf|lw|rw|lf|rf|fw)/.test(p)) return 'att';
        return 'mid';
    },

    /**
     * Chip variant key for TmUI.chip(): 'gk' | 'd' | 'm' | 'f'
     */
    variant(pos) {
        const p = norm(pos);
        if (p === 'gk') return 'gk';
        if (/^d/.test(p)) return 'd';
        if (/^f/.test(p) || /^(fc|st|cf|lw|rw)/.test(p)) return 'f';
        return 'm';
    },

    /**
     * Filter group for a POSITION_MAP id number.
     * e.g. 9 → 'gk', 4 → 'mf', 8 → 'fw'
     */
    filterGroup(id) {
        return FILTER_GROUPS[id] ?? 'mf';
    },

    /**
     * Group color for a POSITION_MAP id number (charts, legends).
     * e.g. 9 → success token, 8 → danger token
     */
    groupColor(id) {
        return GROUP_COLORS[id] ?? 'var(--tmu-text-disabled)';
    },

    /**
     * Short group label for a POSITION_MAP id number.
     * e.g. 9 → 'GK', 1 → 'DLR', 8 → 'F'
     */
    groupLabel(id) {
        return GROUP_LABELS[id] ?? '?';
    },

    /**
     * Render a position chip — identical layout to the squad table.
     * @param {Array<{position:string,color:string}> | Array<string>} positions
     * @param {string} [cls] CSS class for the outer chip span
     */
    chip(positions, cls = 'tm-pos-chip', { attrs = {} } = {}) {
        ensureChipCSS();
        if (!positions || (Array.isArray(positions) && !positions.length)) return '-';
        const arr = Array.isArray(positions) ? positions : [positions];
        const items = arr.map(pp => {
            if (typeof pp === 'string') {
                const key = norm(pp);
                const entry = MAP[key] ?? MAP[key.replace(/[lrc]$/, '')];
                return { label: entry?.position ?? key.replace(/sub/i, '').toUpperCase(), color: entry?.color ?? 'var(--tmu-text-disabled)' };
            }
            return { label: pp.position, color: pp.color ?? 'var(--tmu-text-disabled)' };
        });
        if (!items.length) return '-';
        const firstColor = items[0].color;
        const inner = items
            .map(it => `<span style="color:${it.color}">${it.label}</span>`)
            .join('<span style="color:var(--tmu-text-faint)">, </span>');
        const attrStr = Object.entries(attrs)
            .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, '&quot;')}"`).join('');
        return TmUI.positionChip(firstColor, inner, cls, attrStr);
    },

    /**
     * Mood penalty for placing a player in a given posKey.
     * Returns 0-4 (0 = natural position, 4 = maximum unhappiness).
     */
    moodPenalty(player, posKey) {
        const LINE_PEN = {
            1: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 },
            2: { 1: 1, 2: 0, 3: 1, 4: 2, 5: 3 },
            3: { 1: 2, 2: 1, 3: 0, 4: 1, 5: 2 },
            4: { 1: 3, 2: 2, 3: 1, 4: 0, 5: 1 },
            5: { 1: 4, 2: 3, 3: 2, 4: 1, 5: 0 },
        };
        const placed = MAP[String(posKey || '').toLowerCase()];
        if (!placed) return 0;
        const favs = Array.isArray(player?.positions) ? player.positions.filter(p => p.preferred) : [];
        if (!favs.length) return 0;
        if (placed.row === 0) return favs.some(p => p.row === 0) ? 0 : 4;
        if (favs.some(p => p.row === 0)) return 4;
        const side = c => c === 0 ? 'L' : (c === 4 ? 'R' : 'C');
        const ps = side(placed.col);
        let best = 4;
        for (const fav of favs) {
            const fs = side(fav.col);
            let pen = (fs !== ps) ? ((fs === 'C' || ps === 'C') ? 2 : 1) : 0;
            pen += LINE_PEN[placed.row]?.[fav.row] ?? 4;
            best = Math.min(best, Math.min(pen, 4));
        }
        return best;
    },
};

