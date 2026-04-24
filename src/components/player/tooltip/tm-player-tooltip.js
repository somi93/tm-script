import { TmConst } from '../../../lib/tm-constants.js';
import { TmUtils } from '../../../lib/tm-utils.js';
import { TmUI } from '../../shared/tm-ui.js';
import { TmPosition } from '../../../lib/tm-position.js';
import { TmPlayerAge } from '../../../lib/tm-player-age.js';

const CSS = `
.tmpt-tip {
    display: none; position: fixed; z-index: 10100;
    background: var(--tmu-color-accent);
    isolation: isolate;
    border-radius: var(--tmu-space-sm);
    padding: var(--tmu-space-md); 
    min-width: 300px; 
    max-width: 400px;
    box-shadow: 0 6px 24px var(--tmu-shadow-panel);
    pointer-events: none;
    font-size: var(--tmu-font-sm); 
    color: var(--tmu-text-main);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-sizing: border-box;
}
.tmpt-header {
    display: flex; align-items: center; gap: var(--tmu-space-md);
    margin-bottom: var(--tmu-space-sm); padding-bottom: var(--tmu-space-sm);
    border-bottom: 1px solid var(--tmu-border-soft-alpha-strong);
}
.tmpt-header-left { flex: 1; min-width: 0; }
.tmpt-name { font-size: var(--tmu-font-sm); font-weight: 700; color: var(--tmu-text-strong); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tmpt-no-row { display: flex; align-items: center; gap: var(--tmu-space-xs); margin-top: var(--tmu-space-xs); flex-wrap: wrap; }
.tmpt-header-right {
    display: flex; flex-direction: column; gap: var(--tmu-space-xs);
    align-items: flex-end; flex-shrink: 0;
}
.tmpt-skills { display: flex; gap: var(--tmu-space-md); margin-bottom: var(--tmu-space-sm); }
.tmpt-skills-col { flex: 1; min-width: 0; }
.tmpt-skill {
    display: flex; justify-content: space-between;
    padding: 0; border-bottom: 1px solid var(--tmu-border-soft-alpha);
}
.tmpt-skill-name { color: var(--tmu-text-muted); font-size: var(--tmu-font-sm); }
.tmpt-skill-val  { font-weight: 700; font-size: var(--tmu-font-sm); }
.tmpt-footer {
    display: flex; gap: var(--tmu-space-sm); justify-content: center;
    padding-top: var(--tmu-space-sm); border-top: 1px solid var(--tmu-border-soft-alpha-strong);
}
.tmpt-stat { text-align: center; }
.tmpt-stat-val { font-size: var(--tmu-font-md); font-weight: 800; }
.tmpt-stat-lbl { font-size: var(--tmu-font-2xs); color: var(--tmu-text-faint); text-transform: uppercase; }
`;
const styleEl = document.createElement('style');
styleEl.textContent = CSS;
document.head.appendChild(styleEl);

/**
 * Build the tooltip inner HTML.
 *
 * Supports two modes depending on what's provided:
 *
 * Squad mode (default): player.r5 (exact), player.routine, player.rec, player.no
 * Transfer mode: player.r5Range {lo,hi}, player.ti, player.footerStats [{val,lbl,color}],
 *                player.note, skills with null values (shown as —)
 *
 * @param {object} player
 * @returns {string} HTML string
 */
const renderHTML = player => {
    const { getColor } = TmUtils;
    const { R5_THRESHOLDS, REC_THRESHOLDS, TI_THRESHOLDS } = TmConst;

    // ── Header ────────────────────────────────────────────────────
    const badge = (label, val, color) => TmUI.badge({ label, value: val, size: 'sm', shape: 'rounded', weight: 'bold' }, 'muted')
        .replace('tmu-badge-tone-muted"', `tmu-badge-tone-muted" style="color:${color}"`);

    const prefPositions = (player.positions || []).filter(p => p.preferred);
    const posChip = TmPosition.chip(prefPositions);
    const r5Val = player.r5 != null ? TmUtils.formatR5(player.r5)
        : (player.r5Lo != null || player.r5Hi != null) ? (() => {
            const loStr = TmUtils.formatR5(player.r5Lo, ''); const hiStr = TmUtils.formatR5(player.r5Hi, '');
            return player.r5Lo != null && loStr !== hiStr ? `${loStr}–${hiStr}` : hiStr;
        })() : null;
    const r5Color = player.r5 != null ? getColor(player.r5, R5_THRESHOLDS)
        : player.r5Hi != null ? getColor(player.r5Hi, R5_THRESHOLDS) : 'var(--tmu-text-dim)';

    let h = '<div class="tmpt-header">';

    // Left: name + (#no · age · pos) row
    h += `<div class="tmpt-header-left">`;
    h += `<div class="tmpt-name">${player.name}</div>`;
    h += `<div class="tmpt-no-row">`;
    h += TmPlayerAge.chip(player);
    h += posChip;
    h += `</div></div>`;

    // Right: R5 | TI stacked
    h += `<div class="tmpt-header-right">`;
    h += r5Val != null ? badge('R5', r5Val, r5Color) : '';
    h += player.ti != null ? badge('TI', player.ti.toFixed(1), getColor(player.ti, TI_THRESHOLDS)) : '';
    h += `</div>`;

    h += '</div>';

    // ── Skills ────────────────────────────────────────────────────
    const fieldLeft = [0, 1, 2, 3, 4, 5, 6];
    const fieldRight = [7, 8, 9, 10, 11, 12, 13];
    const gkLeft = [0, 3, 1];
    const gkRight = [10, 4, 5, 6, 2, 7, 8, 9];
    const leftIdx = player.isGK ? gkLeft : fieldLeft;
    const rightIdx = player.isGK ? gkRight : fieldRight;

    const renderCol = indices => {
        let c = '<div class="tmpt-skills-col">';
        indices.forEach(i => {
            const skill = player.skills[i];
            if (!skill) return;
            const val = skill.value;
            const display = TmUI.skillBadge(val);
            c += `<div class="tmpt-skill">
                        <span class="tmpt-skill-name">${skill.name}</span>
                        <span class="tmpt-skill-val">${display}</span>
                    </div>`;
        });
        return c + '</div>';
    };
    h += '<div class="tmpt-skills">' + renderCol(leftIdx) + renderCol(rightIdx) + '</div>';

    // ── Footer ────────────────────────────────────────────────────
    // Custom footerStats takes priority; otherwise build defaults from squad fields
    const stats = player.footerStats || [
        player.asi != null ? { val: player.asi.toLocaleString(), lbl: 'ASI', color: 'var(--tmu-text-strong)' } : null,
        player.rec != null ? { val: Number(player.rec), lbl: 'REC', color: getColor(Number(player.rec), REC_THRESHOLDS) } : null,
        player.routine != null ? { val: player.routine.toFixed(1), lbl: 'Routine', color: 'var(--tmu-success)' } : null,
    ].filter(Boolean);

    if (stats.length)
        h += `<div class="tmpt-footer">${stats.map(s =>
            `<div class="tmpt-stat"><div class="tmpt-stat-val" style="color:${s.color}">${s.val}</div><div class="tmpt-stat-lbl">${s.lbl}</div></div>`
        ).join('')}</div>`;

    if (player.note)
        h += `<div style="margin-top:var(--tmu-space-sm);padding-top:var(--tmu-space-sm);border-top:1px solid var(--tmu-border-soft-alpha-mid);font-size:var(--tmu-font-xs);color:var(--tmu-text-panel-label);line-height:1.5">📋 ${player.note}</div>`;

    return h;
};

let el = null;
let _hideTimer = null;

const cancelHide = () => { clearTimeout(_hideTimer); _hideTimer = null; };
const scheduleHide = () => { _hideTimer = setTimeout(() => { if (el) el.style.display = 'none'; }, 120); };

const ensureEl = () => {
    if (el) return;
    el = document.createElement('div');
    el.className = 'tmpt-tip';
    el.addEventListener('mouseenter', cancelHide);
    el.addEventListener('mouseleave', scheduleHide);
    document.body.appendChild(el);
};

/**
 * Show the skill tooltip anchored to a DOM element.
 * @param {Element} anchor — element to position relative to
 * @param {object}  player — standard squad player model
 */
const show = (anchor, player) => {
    cancelHide();
    ensureEl();
    el.innerHTML = renderHTML(player);
    el.style.display = 'block';
    TmUI.positionTooltip(el, anchor);
};

const hide = () => { scheduleHide(); };

export const TmPlayerTooltip = { show, hide, cancelHide };

