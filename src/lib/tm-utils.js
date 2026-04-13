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

/* Format an R5 value to exactly 2 decimal places, returning an empty fallback when invalid */
const formatR5 = (v, fallback = '-') => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(2) : fallback;
};

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
    if (!r || r === 0) return 'var(--tmu-text-dim)';
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

const getMainContainer = (root = document) => root.querySelector('.tmvu-main');

const getMainContainers = (root = document) => Array.from(root.querySelectorAll('.tmvu-main'));

const extractFaceUrl = (appearance, fallback = null) => {
    const src = String(appearance || '').match(/src=['"]([^'"]+)['"]/i)?.[1] || fallback;
    if (!src) return null;
    return String(src).replace(/([?&])w=\d+(&?)/i, (_match, prefix, suffix) => {
        if (prefix === '?' && suffix) return '?';
        return suffix ? prefix : '';
    }).replace(/[?&]$/, '');
};

const parseSkillValue = (value) => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;

    const text = String(value || '');
    const attrMatch = text.match(/(?:title|alt)=['"]?(\d+(?:\.\d+)?)/i);
    if (attrMatch) return Number(attrMatch[1]);

    if (/star/i.test(text)) {
        if (/silver/i.test(text)) return 19;
        return 20;
    }

    const numericMatch = text.match(/\d+(?:\.\d+)?/);
    return numericMatch ? Number(numericMatch[0]) : null;
};

const skillValue = (skill) => (typeof skill === 'object' && skill !== null)
    ? Number(skill.value ?? 0)
    : Number(skill);

const sortAgeKeys = (keys) => Array.from(new Set(keys || []))
    .sort((a, b) => {
        const [ay, am] = String(a).split('.').map(Number);
        const [by, bm] = String(b).split('.').map(Number);
        return ay * 12 + am - (by * 12 + bm);
    });

const safeGrowthSkills = (skills) => (Array.isArray(skills) ? skills : []).map((value) => {
    const numeric = typeof value === 'object' ? value.value : value;
    return Number.isFinite(numeric) ? Math.floor(numeric) : 0;
});

const applyTooltipSkills = (player, tooltipSkills) => {
    if (!Array.isArray(player?.skills) || !Array.isArray(tooltipSkills)) return player;

    const tooltipMap = new Map();
    for (const skill of tooltipSkills) {
        if (!skill?.key) continue;
        tooltipMap.set(skill.key, parseSkillValue(skill.value));
    }

    player.skills = player.skills.map(skill => ({
        ...skill,
        value: tooltipMap.get(skill.key) ?? (skill.key2 ? tooltipMap.get(skill.key2) ?? null : null),
    })).filter(skill => skill.value != null);

    return player;
};

const applyPlayerPositions = (player, favposition = '') => {
    if (!Array.isArray(player?.positions)) return player;

    const preferredKeys = new Set(String(favposition || '')
        .split(',')
        .map(value => value.trim().toLowerCase())
        .filter(Boolean));

    player.positions = player.positions
        .filter(position => player.isGK ? position.key === 'gk' : position.key !== 'gk')
        .map(position => ({
            ...position,
            preferred: preferredKeys.has(String(position.key || '').toLowerCase()),
        }));

    return player;
};

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
        if (!v) return 'var(--tmu-text-dim)';
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

const getOwnClubIds = () => {
    const s = window.SESSION;
    if (!s) return [];
    const ids = [];
    if (s.main_id) ids.push(String(s.main_id));
    if (s.b_team) ids.push(String(s.b_team));
    return ids;
};

const applySquadSkills = (player, postPlayer) => {
    if (!Array.isArray(player?.skills)) return player;
    // post data uses 'setpieces' but SKILL_DEFS uses 'set_pieces'
    const remap = { set_pieces: 'setpieces' };
    player.skills = player.skills.map(skill => {
        const postKey = remap[skill.key] ?? skill.key;
        const value = postPlayer[postKey] ?? (skill.key2 ? postPlayer[remap[skill.key2] ?? skill.key2] ?? null : null);
        return { ...skill, value: value != null ? Number(value) : null };
    }).filter(skill => skill.value != null && skill.value !== 0);
    return player;
};

export const TmUtils = { getColor, parseNum, ageToMonths, monthsToAge, classifyPosition, posLabel, fix2, formatR5, fmtCoins, ratingColor, r5Color, toggleSort, skillColor, skillEff, getMainContainer, getMainContainers, extractFaceUrl, parseSkillValue, skillValue, sortAgeKeys, safeGrowthSkills, applyTooltipSkills, applyPlayerPositions, applySquadSkills, getOwnClubIds };

