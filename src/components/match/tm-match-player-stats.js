/**
 * tm-match-player-stats.js — Per-player stat card HTML builders
 *
 * Exposes: buildPlayerStatSections(st, isGK)
 *
 * Renders stat card sections derived dynamically from TmConst.PLAYER_STAT_COLS.
 * Entries with outfieldSection / gkSection metadata are grouped and sorted
 * per position type. Shared by player dialog, stats tabs, tooltips, etc.
 */

import { TmConst } from '../../lib/tm-constants.js';

const { PLAYER_STAT_COLS } = TmConst;

// Section header metadata (icon + title per section name key).
const _SECTIONS = {
    shooting:  { icon: '🎯', title: 'Shooting' },
    passing:   { icon: '📊', title: 'Passing & Creativity' },
    defending: { icon: '🛡️', title: 'Defending & Duels' },
};

// ── Computed keys injected into st before rendering ──────────────────────────
const _enrichSt = (st) => {
    const totalPasses = (st.passesCompleted ?? 0) + (st.passesFailed ?? 0);
    const totalCross  = (st.crossesCompleted ?? 0) + (st.crossesFailed ?? 0);
    return {
        ...st,
        __passAcc:   totalPasses > 0 ? Math.round(st.passesCompleted / totalPasses * 100) : 0,
        __crossAcc:  totalCross  > 0 ? Math.round(st.crossesCompleted / totalCross  * 100) : 0,
        __totalPass: totalPasses + totalCross,
    };
};

// ── Label overrides for computed keys ────────────────────────────────────────
const _lbl = (col, st) => {
    if (col.key === '__passAcc')  return `Pass ${st.__passAcc}%`;
    if (col.key === '__crossAcc') return `Cross ${st.__crossAcc}%`;
    return col.lbl;
};

const _val = (col, st) => {
    if (col.key === '__passAcc')  return `${st.passesCompleted}/${(st.passesCompleted ?? 0) + (st.passesFailed ?? 0)}`;
    if (col.key === '__crossAcc') return `${st.crossesCompleted}/${(st.crossesCompleted ?? 0) + (st.crossesFailed ?? 0)}`;
    return st[col.key] ?? 0;
};

// ── Renderers ────────────────────────────────────────────────────────────────
const _card = (col, st) => {
    const val = _val(col, st);
    const lbl = _lbl(col, st);
    const cls = col.cardCls(st);
    return `<div class="rnd-plr-stat-card ${cls}"><div class="rnd-plr-stat-icon">${col.icon}</div><div class="rnd-plr-stat-val">${val}</div><div class="rnd-plr-stat-lbl">${lbl}</div></div>`;
};

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Build the per-player stat sections HTML for a given player stats object.
 * Card columns and grouping are derived from PLAYER_STAT_COLS entries that
 * have outfieldSection / gkSection metadata.
 * @param {object}  st    — player stats object from buildPlayerEventStats
 * @param {boolean} isGK  — true if GK (uses gkSection / gkOrder)
 * @returns {string} HTML string
 */
export const buildPlayerStatSections = (st, isGK) => {
    const enriched    = _enrichSt(st);
    const sectionProp = isGK ? 'gkSection'    : 'outfieldSection';
    const orderProp   = isGK ? 'gkOrder'      : 'outfieldOrder';

    const groups = new Map();
    for (const col of PLAYER_STAT_COLS) {
        const sec = col[sectionProp];
        if (!sec || !col.cardCls) continue;
        if (!groups.has(sec)) groups.set(sec, []);
        groups.get(sec).push(col);
    }
    for (const cols of groups.values())
        cols.sort((a, b) => (a[orderProp] ?? 99) - (b[orderProp] ?? 99));

    let html = '';
    for (const [secName, cols] of groups) {
        const meta = _SECTIONS[secName];
        html += `<div class="rnd-plr-section-title"><span class="sec-icon">${meta.icon}</span> ${meta.title}</div>`;
        html += `<div class="rnd-plr-stats-row">${cols.map(c => _card(c, enriched)).join('')}</div>`;
    }
    return html;
};

