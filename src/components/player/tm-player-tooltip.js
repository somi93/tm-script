// ==UserScript==
// @name         TmPlayerTooltip
// @description  Skill tooltip component for squad player models. Depends on TmLib.
// ==/UserScript==
(function () {
    'use strict';

    const CSS = `
.tmpt-tip {
    display: none; position: absolute; z-index: 9999;
    background: linear-gradient(135deg, #1a2e14 0%, #243a1a 100%);
    border: 1px solid #4a9030; border-radius: 8px;
    padding: 10px 12px; min-width: 200px; max-width: 280px;
    box-shadow: 0 6px 24px rgba(0,0,0,0.6);
    pointer-events: none; font-size: 11px; color: #c8e0b4;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-sizing: border-box;
}
.tmpt-header {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 8px; padding-bottom: 6px;
    border-bottom: 1px solid rgba(74,144,48,0.3);
}
.tmpt-name { font-size: 13px; font-weight: 700; color: #e0f0cc; }
.tmpt-pos  { font-size: 10px; color: #8abc78; font-weight: 600; }
.tmpt-badges { display: flex; gap: 6px; margin-left: auto; }
.tmpt-badge {
    font-size: 10px; font-weight: 700; padding: 2px 6px;
    border-radius: 4px; background: rgba(0,0,0,0.3);
}
.tmpt-skills { display: flex; gap: 12px; margin-bottom: 6px; }
.tmpt-skills-col { flex: 1; min-width: 0; }
.tmpt-skill {
    display: flex; justify-content: space-between;
    padding: 1px 0; border-bottom: 1px solid rgba(74,144,48,0.12);
}
.tmpt-skill-name { color: #8abc78; font-size: 10px; }
.tmpt-skill-val  { font-weight: 700; font-size: 11px; }
.tmpt-footer {
    display: flex; gap: 8px; justify-content: center;
    padding-top: 6px; border-top: 1px solid rgba(74,144,48,0.3);
}
.tmpt-stat { text-align: center; }
.tmpt-stat-val { font-size: 14px; font-weight: 800; }
.tmpt-stat-lbl { font-size: 9px; color: #6a9a58; text-transform: uppercase; }
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
        const { getColor } = window.TmUtils;
        const { R5_THRESHOLDS, REC_THRESHOLDS, TI_THRESHOLDS } = window.TmConst;

        // ── Header ────────────────────────────────────────────────────
        let h = '<div class="tmpt-header">';
        h += `<div><div class="tmpt-name">${player.name}</div>`;
        const noStr = player.no ? ` · #${player.no}` : '';
        h += `<div class="tmpt-pos">${player.positions.map(pos => pos.position).join(', ')}${noStr} · Age ${player.ageMonthsString}</div></div>`;

        h += '<div class="tmpt-badges">';
        if (player.r5 != null) {
            h += `<span class="tmpt-badge" style="color:${getColor(player.r5, R5_THRESHOLDS)}">R5 ${player.r5}</span>`;
        } else if (player.r5Range) {
            const { lo, hi } = player.r5Range;
            const rangeStr = lo != null && lo.toFixed(1) !== hi.toFixed(1)
                ? `${lo.toFixed(1)}–${hi.toFixed(1)}` : `${hi.toFixed(1)}`;
            h += `<span class="tmpt-badge" style="color:${getColor(hi ?? 0, R5_THRESHOLDS)}">R5 ${rangeStr}</span>`;
        }
        if (player.ti != null)
            h += `<span class="tmpt-badge" style="color:${getColor(player.ti, TI_THRESHOLDS)}">TI ${player.ti.toFixed(1)}</span>`;
        h += '</div></div>';

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
                const display = window.TmUI.skillBadge(val);
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
            player.asi != null ? { val: player.asi.toLocaleString(), lbl: 'ASI', color: '#e0f0cc' } : null,
            player.rec != null ? { val: Number(player.rec), lbl: 'REC', color: getColor(Number(player.rec), REC_THRESHOLDS) } : null,
            player.routine != null ? { val: player.routine.toFixed(1), lbl: 'Routine', color: '#8abc78' } : null,
        ].filter(Boolean);

        if (stats.length)
            h += `<div class="tmpt-footer">${stats.map(s =>
                `<div class="tmpt-stat"><div class="tmpt-stat-val" style="color:${s.color}">${s.val}</div><div class="tmpt-stat-lbl">${s.lbl}</div></div>`
            ).join('')}</div>`;

        if (player.note)
            h += `<div style="margin-top:7px;padding-top:6px;border-top:1px solid rgba(74,144,48,0.25);font-size:10px;color:#90b878;line-height:1.5">📋 ${player.note}</div>`;

        return h;
    };

    let el = null;
    const ensureEl = () => {
        if (el) return;
        el = document.createElement('div');
        el.className = 'tmpt-tip';
        document.body.appendChild(el);
    };

    /**
     * Show the skill tooltip anchored to a DOM element.
     * @param {Element} anchor — element to position relative to
     * @param {object}  player — standard squad player model
     */
    const show = (anchor, player) => {
        ensureEl();
        el.innerHTML = renderHTML(player);
        el.style.display = 'block';
        window.TmUI.positionTooltip(el, anchor);
    };

    const hide = () => { if (el) el.style.display = 'none'; };

    window.TmPlayerTooltip = { renderHTML, show, hide };

})();
