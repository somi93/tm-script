import { TmConst } from './tm-constants.js';
import { TmPosition } from './tm-position.js';

/**
 * tm-utils.js — Pure utility helpers for TrophyManager userscripts
 *
 * Must load after tm-constants.js.
 * Exposed as: TmUtils
 */


const { COLOR_LEVELS } = TmConst;

const getColor = (value, thresholds) => {
    for (let i = 0; i < thresholds.length; i++) {
        if (value >= thresholds[i]) return COLOR_LEVELS[i].color;
    }
    return COLOR_LEVELS[COLOR_LEVELS.length - 1].color;
};

/* Parse a coin / ASI / wage value (number or formatted string like "1,234") to integer */
const parseNum = (v, fallback = 0) => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
    return parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10) || fallback;
};

/* Convert "age.months" key (e.g. "23.4") to absolute month count */
const ageToMonths = (k) => { const [y, m] = k.split('.').map(Number); return y * 12 + m; };

/* Convert absolute month count back to "age.months" key */
const monthsToAge = (m) => `${Math.floor(m / 12)}.${m % 12}`;

/* Classify a position string into a stat group: 'gk' | 'def' | 'mid' | 'att' */
const classifyPosition = (pos) => TmPosition.group(pos || '');

/* Format a position string for display (e.g. "subdc" → "DC", falsy → "?") */
const posLabel = (pos) => TmPosition.label(pos);

/* Round a number to 2 decimal places, returning a string (e.g. 3.1 → "3.10") */
const fix2 = v => (Math.round(v * 100) / 100).toFixed(2);

/* Format a large number with M/B/k suffix (for coins, ASI, wages: 1234567 → "1.2M") */
const fmtCoins = (n) => {
    if (n == null || isNaN(n) || n === 0) return '-';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(0) + 'k';
    return String(Math.round(n));
};

/* Map a match rating (0–10) to a hex color string (green → red scale) */
const ratingColor = (r) => {
    if (!r || r === 0) return '#5a7a48';
    const v = Number(r);
    if (v >= 9.0) return '#00c040';
    if (v >= 8.5) return '#00dd50';
    if (v >= 8.0) return '#22e855';
    if (v >= 7.5) return '#44ee55';
    if (v >= 7.0) return '#66dd44';
    if (v >= 6.5) return '#88cc33';
    if (v >= 6.0) return '#99bb22';
    if (v >= 5.5) return '#aacc00';
    if (v >= 5.0) return '#bbcc00';
    if (v >= 4.5) return '#dd9900';
    if (v >= 4.0) return '#ee7733';
    if (v >= 3.5) return '#ee5533';
    if (v >= 3.0) return '#dd3333';
    if (v >= 2.0) return '#cc2222';
    return '#bb1111';
};

/**
 * Standard sort-header toggle.
 * Returns new { key, dir } where dir is 1 (asc) or -1 (desc).
 * @param {*} clickedKey
 * @param {*} currentKey
 * @param {number} currentDir — 1 or -1
 * @param {number} [defaultDir=-1] — direction when switching to a new column
 */
const toggleSort = (clickedKey, currentKey, currentDir, defaultDir = -1) => {
    if (clickedKey === currentKey) return { key: currentKey, dir: currentDir * -1 };
    return { key: clickedKey, dir: defaultDir };
};

/**
 * Map a skill integer value (1–20) to a hex color string.
 * 20 → gold, 19 → silver, 16+ → green, 12+ → yellow, 8+ → orange, else → red.
 * @param {number|string} v
 * @returns {string}
 */
const skillColor = (v) => {
    const n = parseInt(v);
    if (!n || n <= 0) return '#2a3a28';
    if (n >= 20) return '#d4af37';
    if (n >= 19) return '#c0c0c0';
    if (n >= 16) return '#66dd44';
    if (n >= 12) return '#cccc00';
    if (n >= 8) return '#ee9900';
    return '#ee6633';
};

/**
 * Return display text and star CSS suffix for a skill value.
 * @param {number|string} v
 * @returns {{ display: string, starCls: string }}
 *   starCls is '' for plain values, ' star-gold' for 20, ' star-silver' for 19.
 */
const formatSkill = (v) => {
    const n = parseInt(v);
    if (n >= 20) return { display: '★', starCls: ' star-gold' };
    if (n >= 19) return { display: '★', starCls: ' star-silver' };
    return { display: String(isFinite(n) ? n : ''), starCls: '' };
};

/**
 * TI efficiency weight for decimal skill distribution.
 * Returns the fraction of overflow points absorbed per unit above integer level.
 * @param {number} lvl — current integer skill level
 * @returns {number}
 */
const skillEff = (lvl) => {
    if (lvl >= 20) return 0;
    const bracket = TmConst.SKILL_EFFICIENCY_BRACKETS.find(([min]) => lvl >= min);
    return bracket ? bracket[1] : 0.15;
};

/**
 * Returns top-3 threshold values for a set of columns across rows.
 * Used for CSS highlighting (top1/top2/top3) in stats tables.
 * @param {object[]} rows    — data rows
 * @param {string[]} cols    — column keys to compute thresholds for
 * @param {Function} getValue — (row, colKey) => number
 * @returns {{ [colKey]: { v1, v2, v3 } }}
 */
const getTopNThresholds = (rows, cols, getValue) => {
    const tops = {};
    cols.forEach(col => {
        const vals = rows.map(r => getValue(r, col)).filter(v => v > 0);
        const sorted = [...new Set(vals)].sort((a, b) => b - a);
        tops[col] = { v1: sorted[0] || -1, v2: sorted[1] || -1, v3: sorted[2] || -1 };
    });
    return tops;
};

/**
 * Returns CSS class ('top1'/'top2'/'top3'/'') for a value against precomputed thresholds.
 * @param {number} val    — value to classify
 * @param {string} col    — column key
 * @param {object} tops   — result of getTopNThresholds()
 * @returns {string}
 */
const topNClass = (val, col, tops) => {
    if (val <= 0) return '';
    const t = tops[col];
    if (!t) return '';
    if (val >= t.v1) return 'top1';
    if (val >= t.v2) return 'top2';
    if (val >= t.v3) return 'top3';
    return '';
};

const getMainContainer = (root = document) => root.querySelector('.tmvu-main, .main_center');

const getMainContainers = (root = document) => Array.from(root.querySelectorAll('.tmvu-main, .main_center'));

/* Map an R5 value (25–118) to a hex color string.
   Uses piecewise HSL tiers for < 95, explicit per-integer lookup for 95–118.
   Results are memoised by rounded integer value. */
const r5Color = (() => {
    const cache = new Map();
    const hsl2rgb = (h, s, l) => {
        s /= 100; l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r, g, b;
        if (h < 60)       { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else              { r = 0; g = c; b = x; }
        return '#' + [r + m, g + m, b + m].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
    };
    const topColors = {
        95: '#8db024', 96: '#7aad22', 97: '#68a820', 98: '#57a31e', 99: '#479e1c',
        100: '#38991a', 101: '#2e9418', 102: '#258e16', 103: '#1d8814', 104: '#168212',
        105: '#107c10', 106: '#0c720e', 107: '#09680c', 108: '#075e0a', 109: '#055408',
        110: '#044a07', 111: '#034106', 112: '#033905', 113: '#023204', 114: '#022c04',
        115: '#022603', 116: '#012103', 117: '#011d02', 118: '#011902',
    };
    const tiers = [
        [25, 50,  0, 10, 65, 68, 28, 32],
        [50, 70, 10, 25, 68, 72, 34, 40],
        [70, 80, 25, 42, 72, 75, 42, 46],
        [80, 90, 42, 58, 75, 78, 46, 48],
        [90, 95, 58, 78, 78, 80, 48, 46],
    ];
    return (v) => {
        if (!v) return '#5a7a48';
        const rounded = Math.round(v);
        if (cache.has(rounded)) return cache.get(rounded);
        let color;
        if (rounded >= 95) {
            color = topColors[Math.min(118, rounded)] || topColors[118];
        } else {
            const clamped = Math.max(25, Math.min(95, v));
            let hue = 0, sat = 65, lit = 28;
            for (const [from, to, h0, h1, s0, s1, l0, l1] of tiers) {
                if (clamped <= to) {
                    const t = (clamped - from) / (to - from);
                    hue = h0 + t * (h1 - h0);
                    sat = s0 + t * (s1 - s0);
                    lit = l0 + t * (l1 - l0);
                    break;
                }
            }
            color = hsl2rgb(hue, sat, lit);
        }
        cache.set(rounded, color);
        return color;
    };
})();

export const TmUtils = { getColor, parseNum, ageToMonths, monthsToAge, classifyPosition, posLabel, fix2, fmtCoins, ratingColor, r5Color, toggleSort, skillColor, formatSkill, skillEff, getTopNThresholds, topNClass, getMainContainer, getMainContainers };

