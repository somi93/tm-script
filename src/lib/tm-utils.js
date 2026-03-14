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

export const TmUtils = { getColor, parseNum, ageToMonths, monthsToAge, classifyPosition, posLabel, fix2, fmtCoins, ratingColor, toggleSort, skillColor, formatSkill, skillEff, getTopNThresholds, topNClass };

