/**
 * tm-player-row.js — Shared player row component
 *
 * A single <div> row showing: [position-color bar] [#no] [pos chip] [name] [icon]
 * Visual matches the tactics squad/player-list table rows exactly.
 *
 * Usage:
 *   const el = TmPlayerRow.build(player, { posKey: 'dc', state: 'active' });
 *   TmPlayerRow.setState(el, 'off');
 *
 * States:
 *   'active'   — full opacity (starter/sub currently on pitch)
 *   'bench'    — 0.4 opacity (unused sub)
 *   'off'      — 0.4 opacity + red name + ↓ icon (player substituted off)
 *   'sub-in'   — full opacity + green ↑ icon (came on as sub)
 */

import { TmPosition } from '../../lib/tm-position.js';
import { TmConst }    from '../../lib/tm-constants.js';
import { TmUtils }   from '../../lib/tm-utils.js';
import { TmStars }   from './tm-stars.js';

const STYLE_ID = 'tm-player-row-style';

export function injectTmPlayerRowStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        .tm-pr {
            display: flex; align-items: center; gap: 5px;
            padding: 3px 6px 3px 0; min-width: 0;
            transition: opacity .2s;
        }
        .tm-pr-bar {
            flex-shrink: 0;
            width: 4px; min-height: 18px; border-radius: 2px;
            align-self: stretch;
        }
        .tm-pr-no {
            flex-shrink: 0; width: 22px;
            font-size: 10px; color: var(--tmu-text-muted);
            text-align: right; font-variant-numeric: tabular-nums;
        }
        .tm-pr-pos { flex-shrink: 0; }
        .tm-pr-name {
            flex: 1; min-width: 0;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            font-size: 12px; font-weight: 600;
            color: var(--tmu-text-inverse);
            transition: color .2s;
        }
        .tm-pr-icon {
            flex-shrink: 0; width: 12px;
            font-size: 10px; text-align: center;
            transition: color .2s;
        }
        .tm-pr-stats {
            flex-shrink: 0; display: flex; align-items: center; gap: 4px;
        }
        .tm-pr-stars { font-size: 9px; letter-spacing: -1px; }
        .tm-pr-rec, .tm-pr-r5, .tm-pr-rtn {
            font-size: 10px; font-weight: 700; font-variant-numeric: tabular-nums;
            flex-shrink: 0;
        }
        .tm-pr-rec { min-width: 30px; text-align: right; }
        .tm-pr-r5  { min-width: 28px; text-align: right; }
        .tm-pr-rtn { min-width: 24px; text-align: right; }

        /* states */
        .tm-pr[data-state="active"] { opacity: 1; }
        .tm-pr[data-state="sub-in"] { opacity: 1; }
        .tm-pr[data-state="sub-in"] .tm-pr-icon { color: #4caf50; }
        .tm-pr[data-state="bench"]  { opacity: 0.4; }
        .tm-pr[data-state="off"]    { opacity: 0.4; }
        .tm-pr[data-state="off"] .tm-pr-name  { color: var(--tmu-danger); }
        .tm-pr[data-state="off"] .tm-pr-icon  { color: var(--tmu-danger); }
    `;
    document.head.appendChild(s);
}

// ─── Resolve position color (matches POSITION_MAP colors) ────────────────────
function posColor(posKey) {
    if (!posKey) return 'var(--tmu-text-dim)';
    const meta = TmConst.POSITION_MAP[(posKey || '').toLowerCase()];
    if (meta?.color) return meta.color;
    // fallback by variant
    const v = TmPosition.variant(posKey);
    const map = { gk: 'var(--tmu-success-strong)', d: 'var(--tmu-info-dark)', m: 'var(--tmu-warning)', f: 'var(--tmu-danger-deep)' };
    return map[v] || 'var(--tmu-text-dim)';
}

// ─── Clean display name (skip raw identifiers like '19-20-lb-l2p1a4') ────────
function cleanName(p) {
    const n = (p.lastname || p.name || '?').trim();
    if (/^['"\d]/.test(n))
        return p.positions?.find(pos => pos.preferred)?.key?.toUpperCase()
            || p.positions?.[0]?.key?.toUpperCase()
            || (p.fp || '').split(',')[0].toUpperCase()
            || '?';
    return n;
}

// ─── State → icon character ────────────────────────────────────────────────────
const ICONS = { 'sub-in': '↑', 'off': '↓', 'active': '', 'bench': '' };

// ─── Public API ───────────────────────────────────────────────────────────────
export const TmPlayerRow = {
    /**
     * Build a new row element.
     * @param {object} player   — must have: id, name|lastname, no, position|fp
     * @param {object} opts
     *   @param {string}  [opts.posKey]  — explicit position key (falls back to player.position / player.fp)
     *   @param {string}  [opts.state]   — 'active' | 'bench' | 'off' | 'sub-in'  (default: 'active')
     * @returns {HTMLDivElement}
     */
    build(player, { posKey, state = 'active' } = {}) {
        injectTmPlayerRowStyles();

        // Resolve the actual playing slot — explicit posKey or player.position (match ctx).
        // Bench slots ('sub1'..'sub5') carry no position info; treat as absent.
        const raw = posKey || player.position || '';
        const slot = /^sub/i.test(raw) ? '' : raw.toLowerCase();

        // Preferred position(s) from normalized positions array
        const pref = player.positions?.filter(p => p.preferred);
        const lead = pref?.length ? pref[0] : player.positions?.[0];

        // Bar color: match slot key (lookup) or normalized position color
        const barColor = slot ? posColor(slot) : (lead?.color || posColor(lead?.key || ''));

        // Chip: single slot string for match context, full preferred array for tactics
        const chipPositions = slot ? [slot] : (pref?.length ? pref : (lead ? [lead] : []));

        const el = document.createElement('div');
        el.className = 'tm-pr';
        el.dataset.state = state;
        el.dataset.id = String(player.id ?? player.player_id ?? '');

        const bar = document.createElement('span');
        bar.className = 'tm-pr-bar';
        bar.style.background = barColor;

        const no = document.createElement('span');
        no.className = 'tm-pr-no';
        no.textContent = player.no != null ? player.no : '−';

        const posWrap = document.createElement('span');
        posWrap.className = 'tm-pr-pos';
        posWrap.innerHTML = chipPositions.length ? TmPosition.chip(chipPositions) : '';

        const name = document.createElement('span');
        name.className = 'tm-pr-name';
        name.textContent = cleanName(player);

        el.append(bar, no, posWrap, name);

        // Stats: resolve rec/r5/routine from already-normalized player.positions[]
        const posId = slot ? TmConst.POSITION_MAP[slot]?.id : null;
        const posRating = posId != null
            ? player.positions?.find(p => p.id === posId)
            : (player.positions?.find(p => p.preferred) ?? player.positions?.[0]);
        const rec = posRating?.rec != null && Number.isFinite(+posRating.rec) ? +posRating.rec : null;
        const r5  = posRating?.r5  != null && Number.isFinite(+posRating.r5)  ? +posRating.r5  : null;
        const rtn = player.routine > 0 && Number.isFinite(+player.routine) ? +player.routine : null;

        if (rec != null || r5 != null || rtn != null) {
            const stats = document.createElement('span');
            stats.className = 'tm-pr-stats';
            if (rec != null) {
                const s = document.createElement('span');
                s.className = 'tm-pr-stars';
                s.innerHTML = TmStars.recommendation(rec, '') || '';
                stats.appendChild(s);
                const rv = document.createElement('span');
                rv.className = 'tm-pr-rec';
                rv.style.color = TmUtils.getColor(rec, TmConst.REC_THRESHOLDS);
                rv.textContent = rec.toFixed(2);
                stats.appendChild(rv);
            }
            if (r5 != null) {
                const rv = document.createElement('span');
                rv.className = 'tm-pr-r5';
                rv.style.color = TmUtils.getColor(r5, TmConst.R5_THRESHOLDS);
                rv.textContent = TmUtils.formatR5(r5);
                stats.appendChild(rv);
            }
            if (rtn != null) {
                const rv = document.createElement('span');
                rv.className = 'tm-pr-rtn';
                rv.style.color = TmUtils.getColor(rtn, TmConst.RTN_THRESHOLDS);
                rv.textContent = rtn.toFixed(1);
                stats.appendChild(rv);
            }
            el.appendChild(stats);
        }

        const icon = document.createElement('span');
        icon.className = 'tm-pr-icon';
        icon.textContent = ICONS[state] ?? '';
        el.appendChild(icon);
        return el;
    },

    /**
     * Update the state of an existing row element (no DOM rebuild).
     * @param {HTMLElement} el
     * @param {string}      state  — 'active' | 'bench' | 'off' | 'sub-in'
     */
    setState(el, state) {
        if (!el || el.dataset.state === state) return;
        el.dataset.state = state;
        const icon = el.querySelector('.tm-pr-icon');
        if (icon) icon.textContent = ICONS[state] ?? '';
    },

    /**
     * Refresh bar color and pos chip after player.positions is enriched.
     * Does not rebuild the element — only updates bar bg and posWrap innerHTML.
     */
    refreshPos(el, player) {
        if (!el) return;
        const raw = player.position || '';
        const slot = /^sub/i.test(raw) ? '' : raw.toLowerCase();
        const pref = player.positions?.filter(p => p.preferred);
        const lead = pref?.length ? pref[0] : player.positions?.[0];
        const barColor = slot ? posColor(slot) : (lead?.color || posColor(lead?.key || ''));
        const chipPositions = slot ? [slot] : (pref?.length ? pref : (lead ? [lead] : []));
        const bar = el.querySelector('.tm-pr-bar');
        const posWrap = el.querySelector('.tm-pr-pos');
        if (bar) bar.style.background = barColor;
        if (posWrap) posWrap.innerHTML = chipPositions.length ? TmPosition.chip(chipPositions) : '';
    },
};
