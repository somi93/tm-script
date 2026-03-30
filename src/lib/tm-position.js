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
            s.textContent = `.tm-pos-chip{display:inline-block;padding:1px 6px;border-radius:4px;`
                + `font-size:10px;font-weight:700;letter-spacing:.3px;`
                + `line-height:16px;text-align:center;min-width:28px;text-transform:uppercase;}`;
            document.head.appendChild(s);
        };
    })();

    const MAP = TmConst.POSITION_MAP;

    // Maps POSITION_MAP id → filter group key used by shortlist filter buttons
    const FILTER_GROUPS = { 9: 'gk', 0: 'de', 1: 'de', 2: 'dm', 3: 'dm', 4: 'mf', 5: 'mf', 6: 'om', 7: 'om', 8: 'fw' };

    // Colors for grouped display (charts, legends) keyed by POSITION_MAP id
    const GROUP_COLORS = {
        9: '#4ade80',               // GK
        0: '#60a5fa', 1: '#60a5fa', // DC, DLR
        2: '#818cf8', 3: '#818cf8', // DMC, DMLR
        4: '#fbbf24', 5: '#fbbf24', // MC, MLR
        6: '#fb923c', 7: '#fb923c', // OMC, OMLR
        8: '#f87171',               // F
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
         * Position color from POSITION_MAP (for chips, badges).
         * e.g. 'gk' → '#4ade80'
         */
        color(pos) {
            return MAP[norm(pos)]?.color ?? '#aaa';
        },

        /**
         * Integer POSITION_MAP id for a position string key.
         * e.g. 'gk' → 9,  'dc' → 0
         */
        idFor(pos) {
            return MAP[norm(pos)]?.id ?? 0;
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
         * CSS class for position pill in the history (tmh-* namespace).
         * e.g. 'gk' → 'tmh-pos-gk', 'dc' → 'tmh-pos-d'
         */
        cssClass(pos) {
            const p = norm(pos);
            if (!p) return '';
            if (p === 'gk') return 'tmh-pos-gk';
            if (/^dm/.test(p)) return 'tmh-pos-m';
            if (/^d/.test(p)) return 'tmh-pos-d';
            if (/^f/.test(p) || /^(fc|st|cf)/.test(p)) return 'tmh-pos-f';
            return 'tmh-pos-m';
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
         * e.g. 9 → '#4ade80', 8 → '#f87171'
         */
        groupColor(id) {
            return GROUP_COLORS[id] ?? '#aaa';
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
        chip(positions, cls = 'tm-pos-chip') {
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
            return TmUI.positionChip(firstColor, inner, cls);
        },
    };

