
// ─── components/player/tm-player-tooltip.js ─────────────────

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



// ─── components/player/tm-player-styles.js ──────────────────

// tm-player-styles.js - Player page CSS injection
// Depends on: nothing
// Exposed as: window.TmPlayerStyles = { inject }
(function () {
    'use strict';

    const inject = () => {
        if (document.getElementById('tsa-player-style')) return;
        const style = document.createElement('style');
        style.id = 'tsa-player-style';
        style.textContent = `
/* -- Shared widget styles -- */
.tm-widget { background: #1c3410; border: 1px solid #3d6828; border-radius: 8px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.tm-lbl { color: #6a9a58; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
.tm-kv-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; }

/* -- Layout widths -- */
.main_center { width: 1200px !important; }
.column1 { width: 300px !important; margin-right: 8px !important; margin-left: 4px !important; }
.column2_a { width: 550px !important; margin-left: 0 !important; margin-right: 8px !important; }
.column3_a { margin-left: 0 !important; margin-right: 4px !important; }

/* -- Hide native TM tabs -- */
.tabs_outer { display: none !important; }
.tabs_content { display: none !important; }

.column1 > .box { display: none !important; }

/* -- Strip TM box chrome in column2_a -- */
.column2_a > .box,
.column2_a > .box > .box_body { background: none !important; border: none !important; padding: 0 !important; box-shadow: none !important; }
.column2_a > .box > .box_head,
.column2_a .box_shadow,
.column2_a .box_footer,
.column2_a > h3 { display: none !important; }

/* ---------------------------------------
   COMPARE MODAL (tmc-*)
   --------------------------------------- */
.tmc-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 99999;
    display: flex; align-items: center; justify-content: center;
}
.tmc-modal {
    background: #1a3311; border: 1px solid #3d6828; border-radius: 10px;
    width: 500px; max-width: 96vw; max-height: 90vh; display: flex; flex-direction: column;
    box-shadow: 0 8px 40px rgba(0,0,0,0.7); overflow: hidden;
}
.tmc-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; background: #274a18; border-bottom: 1px solid #3d6828;
    font-weight: 700; color: #e8f5d8; font-size: 14px; flex-shrink: 0;
}
.tmc-close-btn { background: none; border: none; color: #90b878; cursor: pointer; font-size: 16px; padding: 0 4px; line-height: 1; }
.tmc-close-btn:hover { color: #e8f5d8; }
.tmc-modal-body { flex: 1; overflow-y: auto; padding: 12px 14px; min-height: 0; }
.tmc-input-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.tmc-input-icon { font-size: 14px; flex-shrink: 0; }
.tmc-input {
    flex: 1; background: rgba(0,0,0,0.3); border: 1px solid #3d6828; border-radius: 5px;
    color: #e8f5d8; padding: 6px 10px; font-size: 12px; font-family: inherit; outline: none;
}
.tmc-input:focus { border-color: #6cc040; }
.tmc-player-list { margin-top: 8px; max-height: 340px; overflow-y: auto; border: 1px solid rgba(61,104,40,0.4); border-radius: 6px; }
.tmc-player-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid rgba(61,104,40,0.25); transition: background 0.1s; }
.tmc-player-row:last-child { border-bottom: none; }
.tmc-player-row:hover { background: rgba(108,192,64,0.12); }
.tmc-row-name { flex: 1; color: #e8f5d8; font-size: 12px; font-weight: 600; }
.tmc-row-sub { font-size: 10px; color: #8aac72; }
.tmc-row-count { font-size: 10px; color: #5a7a48; font-weight: 700; }
.tmc-list-header { padding: 5px 12px 3px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #5a7a48; background: rgba(61,104,40,0.18); border-bottom: 1px solid rgba(61,104,40,0.25); }
.tmc-squad-badge { display: inline-block; font-size: 9px; font-weight: 700; line-height: 1; padding: 1px 4px; border-radius: 3px; background: #2d5a1a; color: #a8d888; margin-left: 4px; vertical-align: middle; }
.tmc-empty-list, .tmc-loading-msg { padding: 24px; text-align: center; color: #5a7a48; font-size: 12px; font-style: italic; }
.tmc-error-msg { padding: 24px; text-align: center; color: #f87171; font-size: 12px; }
.tmc-back-btn { background: rgba(42,74,28,.5); color: #8aac72; border: 1px solid #3d6828; border-radius: 5px; padding: 4px 12px; font-size: 11px; cursor: pointer; font-family: inherit; margin-bottom: 12px; display: block; }
.tmc-back-btn:hover { background: #305820; color: #c8e0b4; }
.tmc-compare-wrap { font-size: 12px; }
.tmc-compare-header { display: flex; align-items: center; gap: 0; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid rgba(61,104,40,0.4); }
.tmc-compare-col { flex: 1; text-align: center; }
.tmc-compare-vs { width: 32px; height: 32px; border-radius: 50%; background: rgba(61,104,40,0.4); color: #5a7a48; font-weight: 800; font-size: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tmc-player-name { color: #e8f5d8; font-weight: 700; font-size: 13px; }
.tmc-player-sub { color: #8aac72; font-size: 10px; margin-top: 2px; }
.tmc-section-title { font-size: 10px; font-weight: 700; color: #5a7a48; text-transform: uppercase; letter-spacing: 0.8px; margin: 12px 0 6px; padding-bottom: 3px; border-bottom: 1px solid rgba(61,104,40,0.3); }
.tmc-stat-grid { display: flex; gap: 6px; margin-bottom: 4px; }
.tmc-stat-card { flex: 1; background: rgba(42,74,28,0.35); border: 1px solid rgba(61,104,40,0.3); border-radius: 6px; padding: 8px 4px; text-align: center; }
.tmc-stat-card-label { font-size: 9px; font-weight: 700; color: #5a7a48; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; }
.tmc-stat-card-vals { display: flex; align-items: center; justify-content: center; gap: 6px; }
.tmc-stat-card-v { font-weight: 700; font-size: 14px; }
.tmc-stat-card-sep { color: #3d6828; font-size: 10px; }
.tmc-skill-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.tmc-skill-cell { display: flex; align-items: center; padding: 5px 8px; border-bottom: 1px solid rgba(61,104,40,0.15); gap: 6px; }
.tmc-skill-cell:nth-last-child(-n+2) { border-bottom: none; }
.tmc-skill-name { color: #8aac72; font-size: 11px; white-space: nowrap; flex: 1; }
.tmc-skill-vals { display: flex; align-items: baseline; gap: 1px; font-size: 12px; white-space: nowrap; }
.tmc-skill-v { font-weight: 400; font-size: 11px; }
.tmc-skill-v.win { font-weight: 800; font-size: 13px; }
.tmc-skill-sep { color: #3d6828; font-size: 10px; margin: 0 1px; }
`;
        document.head.appendChild(style);
    };

    window.TmPlayerStyles = { inject };
})();



// ─── components/player/tm-player-card.js ────────────────────

// ==UserScript==
// @name         TmPlayerCard
// @description  Player card component for TrophyManager player pages.
// ==/UserScript==
(function () {
    'use strict';

    const CSS = `
/* ═══════════════════════════════════════
   PLAYER CARD (tmpc-*)
   ═══════════════════════════════════════ */
.tmpc-header {
    display: flex; gap: 16px; padding: 14px; align-items: flex-start;
}
.tmpc-photo {
    width: 110px; min-width: 110px; border-radius: 6px;
    border: 3px solid #3d6828; display: block;
}
.tmpc-info { flex: 1; min-width: 0; }
.tmpc-top-grid {
    display: grid; grid-template-columns: 1fr auto;
    gap: 2px 8px; align-items: center; margin-bottom: 10px;
}
.tmpc-name {
    font-size: 16px; font-weight: 800; color: #e8f5d8;
    line-height: 1.2;
}
.tmpc-badge-chip {
    font-size: 12px; font-weight: 800; letter-spacing: -0.3px;
    line-height: 16px;
    font-variant-numeric: tabular-nums;
    display: inline-flex; align-items: baseline; gap: 4px;
    padding: 1px 8px; border-radius: 4px;
    background: rgba(232,245,216,0.08); border: 1px solid rgba(232,245,216,0.15);
    justify-self: end;
}
.tmpc-badge-lbl {
    color: #6a9a58; font-size: 9px; font-weight: 600;
    text-transform: uppercase;
}
.tmpc-pos-row {
    display: flex; align-items: center; gap: 6px;
    flex-wrap: wrap;
}
.tmpc-pos {
    display: inline-block; padding: 1px 6px; border-radius: 4px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.3px;
    line-height: 16px; text-align: center; min-width: 28px;
}
.tmpc-details {
    display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px;
}
.tmpc-val {
    color: #c8e0b4; font-size: 12px; font-weight: 700;
    font-variant-numeric: tabular-nums;
}
.tmpc-pos-ratings {
    border-top: 1px solid #3d6828; padding: 6px 14px;
}
.tmpc-rating-row {
    display: flex; align-items: center; gap: 10px;
    padding: 5px 0;
}
.tmpc-rating-row + .tmpc-rating-row { border-top: 1px solid rgba(61,104,40,.2); }
.tmpc-pos-bar {
    width: 4px; height: 22px; border-radius: 2px; flex-shrink: 0;
}
.tmpc-pos-name {
    font-size: 11px; font-weight: 700; min-width: 32px;
    letter-spacing: 0.3px;
}
.tmpc-pos-stat {
    display: flex; align-items: baseline; gap: 4px; margin-left: auto;
}
.tmpc-pos-stat + .tmpc-pos-stat { margin-left: 16px; }
.tmpc-pos-stat-lbl {
    color: #6a9a58; font-size: 9px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.3px;
}
.tmpc-pos-stat-val {
    font-size: 14px; font-weight: 800; letter-spacing: -0.3px;
    font-variant-numeric: tabular-nums;
}
.tmpc-expand-toggle {
    display: flex; align-items: center; justify-content: center;
    gap: 6px; padding: 4px 0; cursor: pointer;
    border-top: 1px solid rgba(61,104,40,.25);
    color: #6a9a58; font-size: 10px; font-weight: 600;
    letter-spacing: 0.4px; text-transform: uppercase;
    transition: color .15s;
}
.tmpc-expand-toggle:hover { color: #80e048; }
.tmpc-expand-chevron {
    display: inline-block; font-size: 10px; transition: transform .2s;
}
.tmpc-expand-toggle.tmpc-expanded .tmpc-expand-chevron { transform: rotate(180deg); }
.tmpc-all-positions {
    max-height: 0; overflow: hidden; transition: max-height .3s ease;
}
.tmpc-all-positions.tmpc-expanded {
    max-height: 600px;
}
.tmpc-all-positions .tmpc-rating-row.tmpc-is-player-pos {
    background: rgba(61,104,40,.15);
}
.tmpc-rec-stars { font-size: 14px; letter-spacing: 1px; margin-top: 2px; line-height: 1; }
.tmpc-star-full { color: #fbbf24; }
.tmpc-star-half {
    background: linear-gradient(90deg, #fbbf24 50%, #3d6828 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmpc-star-empty { color: #3d6828; }
.tmpc-flag { vertical-align: middle; margin-left: 4px; }
.tmpc-nt {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 9px; font-weight: 700; color: #fbbf24;
    background: rgba(251,191,36,.12); border: 1px solid rgba(251,191,36,.25);
    padding: 1px 6px; border-radius: 4px; margin-left: 6px;
    vertical-align: middle; letter-spacing: 0.3px; line-height: 14px;
}
`;
    const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);

    /**
     * render({ player, club, dbRecord })
     *
     * @param {object}      props.player    - Raw tooltip player object (from fetchPlayerInfo).
     * @param {object|null} props.club      - Raw tooltip club object, or null.
     *
     * Finds .column2_a in the page, restructures it, and inserts the player card.
     * Returns { asi, ti, routine } so the caller can update shared state, or null if prerequisites not met.
     */
    const render = ({ player, club } = {}) => {
        const { calculatePlayerR5, calculatePlayerREC } = window.TmLib;
        const { getColor } = window.TmUtils;
        const { R5_THRESHOLDS, REC_THRESHOLDS, TI_THRESHOLDS, RTN_THRESHOLDS, POSITION_MAP } = window.TmConst;
        const infoTable = document.querySelector('table.info_table.zebra');
        if (!infoTable || !player) return null;

        /* DOM layout refs */
        const imgEl = infoTable.querySelector('img[src*="player_pic"]');
        const photoSrc = imgEl ? imgEl.getAttribute('src') : '/pics/player_pic2.php';
        const infoWrapper = infoTable.closest('div.std') || infoTable.parentElement;

        /* ── Data from player object ── */
        const asiDisplay = player.asi > 0 ? player.asi.toLocaleString() : '-';

        const wageNum = player.wage || 0;
        const wageDisplay = wageNum > 0 ? `€ ${wageNum.toLocaleString()}` : '-';

        const statusHtml = typeof player.status === 'string' ? player.status : '';

        /* ── Club ── */
        const clubName = club?.club_name || club?.name || '-';
        const clubHref = club ? `/club/${player.club_id || club.id}/` : '';
        const clubCountry = club?.country || '';
        const clubFlag = clubCountry ? `<span class="flag-img-${clubCountry}" style="display:inline-block;vertical-align:middle;margin-left:4px"></span>` : '';

        /* ── DOM-only: flag, NT badge, position text fallback ── */
        const playerName = player.name || 'Player';
        const posEl = document.querySelector('.favposition.long');
        const posText = posEl ? posEl.textContent.trim() : '';
        const flagEl = document.querySelector('.box_sub_header .country_link');
        const flagHtml = flagEl ? flagEl.outerHTML : '';
        const hasNT = !!document.querySelector('.nt_icon');

        /* Recommendation stars from DOM */
        const recTd = [...infoTable.querySelectorAll('tr')]
            .find(tr => tr.querySelector('th')?.textContent.trim() === 'Recommendation')
            ?.querySelector('td') ?? null;
        let recStarsHtml = '';
        if (recTd) {
            const halfStars = (recTd.innerHTML.match(/half_star\.png/g) || []).length;
            const darkStars = (recTd.innerHTML.match(/dark_star\.png/g) || []).length;
            const allStarMatches = (recTd.innerHTML.match(/star\.png/g) || []).length;
            const fullStars = allStarMatches - halfStars - darkStars;
            for (let i = 0; i < fullStars; i++) recStarsHtml += '<span class="tmpc-star-full">★</span>';
            if (halfStars) recStarsHtml += '<span class="tmpc-star-half">★</span>';
            const empty = 5 - fullStars - (halfStars ? 1 : 0);
            for (let i = 0; i < empty; i++) recStarsHtml += '<span class="tmpc-star-empty">★</span>';
        }
        const ntBadge = hasNT ? `<span class="tmpc-nt">🏆 NT</span>` : '';
        const posChips = player.positions.map(position => {
            return `<span class="tmpc-pos" style="background:${position.color}22;border:1px solid ${position.color}44;color:${position.color}">${position.position}</span>`;
        }).join('');

        let positionRatings = '';
        /* Position ratings — R5 & REC per position */
        if ((player.positions || []).length > 0) {
            let playerPositions = '';
            for (const position of player.positions) {
                playerPositions += `
                <div class="tmpc-rating-row">
                    <div class="tmpc-pos-bar" style="background:${position.color}"></div>
                    <span class="tmpc-pos-name" style="color:${position.color}">${position.position}</span>
                    <span class="tmpc-pos-stat">
                        <span class="tmpc-pos-stat-lbl">R5</span>
                        <span class="tmpc-pos-stat-val" style="color:${getColor(position.r5, R5_THRESHOLDS)}">${position.r5}</span>
                    </span>
                    <span class="tmpc-pos-stat">
                        <span class="tmpc-pos-stat-lbl">REC</span>
                        <span class="tmpc-pos-stat-val" style="color:${getColor(position.rec, REC_THRESHOLDS)}">${position.rec}</span>
                    </span> 
                </div>`;
            }
            /* Expand chevron for all positions */
            let allPositions = '';
            if (!player.isGK) {
                const positions = (() => {
                    const map = new Map();
                    const positionData = Object.values(POSITION_MAP)
                        .filter(position => position.id !== 9);
                    for (const position of positionData) {
                        if (map.has(position.id)) map.get(position.id).position += ', ' + position.position;
                        else map.set(position.id, { ...position });
                    }
                    return [...map.values()];
                })();
                let allPositionRatings = '';
                for (const position of positions) {
                    const isPlayerPosition = player.positions.some(pos => pos.id === position.id);
                    const positionR5 = calculatePlayerR5(position, player);
                    const positionRec = calculatePlayerREC(position, player);
                    const playerCls = isPlayerPosition ? ' tmpc-is-player-pos' : '';
                    allPositionRatings += `
                    <div class="tmpc-rating-row${playerCls}">
                        <div class="tmpc-pos-bar" style="background:${position.color}"></div>
                        <span class="tmpc-pos-name" style="color:${position.color}">${position.position}</span>
                        <span class="tmpc-pos-stat">
                            <span class="tmpc-pos-stat-lbl">R5</span>
                            <span class="tmpc-pos-stat-val" style="color:${getColor(positionR5, R5_THRESHOLDS)}">${positionR5}</span>
                        </span>
                        <span class="tmpc-pos-stat">
                            <span class="tmpc-pos-stat-lbl">REC</span>
                            <span class="tmpc-pos-stat-val" style="color:${getColor(positionRec, REC_THRESHOLDS)}">${positionRec}</span>
                        </span>
                    </div>`;
                }
                allPositions = `
                <div class="tmpc-expand-toggle" onclick="this.classList.toggle('tmpc-expanded');this.nextElementSibling.classList.toggle('tmpc-expanded')">
                    <span>All Positions</span>
                    <span class="tmpc-expand-chevron">▼</span>
                </div>
                <div class="tmpc-all-positions">
                ${allPositionRatings}
                </div>
                `
            }
            positionRatings += `<div class="tmpc-pos-ratings">
                ${playerPositions}
                ${allPositions}
            </div>`;
        }
        /* Build HTML */
        let html = `
        <tm-card data-flush>
            <div class="tmpc-header">
                <img class="tmpc-photo" src="${photoSrc}">
                <div class="tmpc-info">
                    <div class="tmpc-top-grid">
                        <div class="tmpc-name">${playerName} ${flagHtml}</div>
                        <span class="tmpc-badge-chip">
                            <span class="tmpc-badge-lbl">ASI</span>
                            <span style="color:${player.asi > 0 ? '#e8f5d8' : '#5a7a48'}">${asiDisplay}</span>
                        </span>
                        <div class="tmpc-pos-row">${posChips || posText}${ntBadge}</div>
                        <span class="tmpc-badge-chip">
                            <span class="tmpc-badge-lbl">TI</span>
                            <span style="color:${getColor(player.ti, TI_THRESHOLDS)}">${player.ti || '—'}</span>
                        </span>
                    </div>
                    <div class="tmpc-details">
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">Club</span>
                            <span class="tmpc-val">
                                <a href="${clubHref}" style="color:#80e048;text-decoration:none;font-weight:600">${clubName}</a> ${clubFlag}
                            </span>
                        </tm-row>
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">Age</span>
                            <span class="tmpc-val">${player.ageMonthsString}</span>
                        </tm-row>
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">Wage</span>
                            <span class="tmpc-val" style="color:#fbbf24">${wageDisplay}</span>
                        </tm-row>
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">Status</span>
                            <span class="tmpc-val">${statusHtml}</span>
                        </tm-row>
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">REC</span>
                            <span class="tmpc-rec-stars">${recStarsHtml}</span>
                        </tm-row>
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">Routine</span>
                            <span class="tmpc-val" style="color:${getColor(player.routine, RTN_THRESHOLDS)}">${player.routine.toFixed(1)}</span>
                        </tm-row>
                    </div> 
                </div>
            </div>
            ${positionRatings}
        </tm-card>`;

        /* ── Clean column2_a: strip TM box chrome ── */
        const col = document.querySelector('.column2_a');
        if (!col) return null;
        const box = col.querySelector(':scope > .box');
        const boxBody = box ? box.querySelector(':scope > .box_body') : null;
        if (box && boxBody) {
            [...boxBody.children].forEach(el => {
                if (!el.classList.contains('box_shadow')) col.appendChild(el);
            });
            box.remove();
        }
        col.querySelectorAll(':scope > h3').forEach(h => h.remove());
        const subHeader = document.querySelector('.box_sub_header.align_center');
        if (subHeader) subHeader.remove();

        /* Replace info_table wrapper with our card */
        const cardEl = document.createElement('div');
        TmUI.render(cardEl, html);
        const cardNode = cardEl.firstElementChild;
        if (infoWrapper && infoWrapper.parentNode === col) {
            col.replaceChild(cardNode, infoWrapper);
        } else {
            col.prepend(cardNode);
        }

        return;
    };

    window.TmPlayerCard = { render };
})();



// ─── components/player/tm-player-sidebar.js ─────────────────

// ==UserScript==
// @name         TM Player Sidebar Component
// @description  Rebuilds column3_a on the player page: transfer options, live transfer card, other options, notes, awards. Depends on TmApi.
// ==/UserScript==
(function () {
    'use strict';

    const CSS = `
/* ── Player Sidebar (tmps-*) ── */
.tmps-sidebar {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.tmps-note {
    background: rgba(42,74,28,0.5); border: 1px solid rgba(61,104,40,.3);
    line-height: 1.4;
}
.tmps-award-list {
    display: flex; flex-direction: column; gap: 0;
}
.tmps-award + .tmps-award { border-top: 1px solid rgba(61,104,40,.2); }
.tmps-award-icon {
    width: 28px; height: 28px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
}
.tmps-award-icon.gold { background: rgba(212,175,55,0.15); }
.tmps-award-icon.silver { background: rgba(96,165,250,0.15); }
.tmps-award-body { flex: 1; min-width: 0; }
.tmps-award-title {
    color: #e8f5d8; line-height: 1.2;
}
.tmps-award-sub {
    line-height: 1.3; margin-top: 1px;
}
.tmps-award-sub a { text-decoration: none; }
.tmps-award-sub a:hover { text-decoration: underline; }
.tmps-award-season {
    flex-shrink: 0; font-variant-numeric: tabular-nums;
}

/* ── Transfer Live Card (tmtf-*) ── */
`;
    const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);

    /* ── Helpers ── */
    const fmtCoin = (v) => {
        const n = TmUtils.parseNum(v);
        return n ? n.toLocaleString('en-US') : '0';
    };

    /* ── Live transfer polling ── */
    const mountLiveTransfer = (tfCard, transferListed) => {
        let tfInterval = null;

        let fetchTransfer;
        const refs = TmUI.render(tfCard, `
            <tm-card data-title="Transfer" data-icon="🔄" data-head-action="reload">
                <div data-ref="body"></div>
            </tm-card>`, { reload: () => fetchTransfer() });

        const renderTransfer = (d) => {
            const isExpired = d.expiry === 'expired';
            const hasBuyer = d.buyer_id && d.buyer_id !== '0' && d.buyer_name;
            const isAgent = !hasBuyer && TmUtils.parseNum(d.current_bid) > 0;
            const curBid = TmUtils.parseNum(d.current_bid);

            let tpl = `<tm-stat data-label="Expiry" data-value="${isExpired ? 'Expired' : d.expiry}" data-variant="${isExpired ? 'red' : 'yellow'}"></tm-stat>`;

            if (curBid > 0)
                tpl += `<tm-stat data-label="Current Bid" class="lime"><span class="coin">${fmtCoin(curBid)}</span></tm-stat>`;

            if (hasBuyer)
                tpl += `<tm-stat data-label="Bidder" class="blue"><a href="/club/${d.buyer_id}">${d.buyer_name}</a></tm-stat>`;
            else if (isAgent && !isExpired)
                tpl += `<tm-stat data-label="Bidder" data-value="Agent" data-variant="purple"></tm-stat>`;

            if (!isExpired && d.next_bid) {
                const nextVal = TmUtils.parseNum(d.next_bid);
                tpl += `<tm-stat data-label="${curBid > 0 ? 'Next Bid' : 'Min Bid'}" class="lime"><span class="coin">${fmtCoin(nextVal)}</span></tm-stat>`;
            }

            if (isExpired) {
                if (hasBuyer) {
                    tpl += `<tm-stat data-label="Sold To" class="green"><a href="/club/${d.buyer_id}">${d.buyer_name}</a></tm-stat>`;
                    tpl += `<tm-stat data-label="Price" class="green"><span class="coin">${fmtCoin(d.current_bid)}</span></tm-stat>`;
                } else if (curBid > 0) {
                    tpl += `<tm-stat data-label="Result" data-value="Sold to Agent" data-variant="purple"></tm-stat>`;
                    tpl += `<tm-stat data-label="Price" class="green"><span class="coin">${fmtCoin(d.current_bid)}</span></tm-stat>`;
                } else {
                    tpl += `<tm-stat data-label="Result" data-value="Not Sold" data-variant="red"></tm-stat>`;
                }
            }

            let bidHandler = null;
            if (!isExpired) {
                const nb = d.next_bid ? fmtCoin(d.next_bid) : transferListed.minBid;
                tpl += `<tm-button data-label="🔨 Make Bid / Agent" data-action="bid"></tm-button>`;
                bidHandler = () => tlpop_pop_transfer_bid(nb, 1, transferListed.playerId, transferListed.playerName);
            }

            TmUI.render(refs.body, tpl, bidHandler ? { bid: bidHandler } : {});

            if (isExpired && tfInterval) {
                clearInterval(tfInterval);
                tfInterval = null;
            }
        };

        fetchTransfer = () => {
            refs.reload.innerHTML = '<span class="tmu-spinner tmu-spinner-sm ml-1"></span>';
            refs.reload.disabled = true;
            TmApi.fetchTransfer(transferListed.playerId).then(d => {
                refs.reload.innerHTML = '↻';
                refs.reload.disabled = false;
                if (d?.success) renderTransfer(d);
            });
        };

        fetchTransfer();
        tfInterval = setInterval(fetchTransfer, window.TmConst.POLL_INTERVAL_MS);
    };

    /**
     * mount(container)
     *
     * Reads existing DOM inside `container` (.column3_a), extracts transfer
     * buttons, options, notes and awards, then replaces the contents with a
     * styled sidebar. Starts live transfer polling when relevant.
     *
     * @param {Element} container - The .column3_a element.
     */
    const mount = (container) => {
        /* ── Extract transfer buttons ── */
        const transferBox = container.querySelector('.transfer_box');
        const btnData = [];
        let transferListed = null;

        if (transferBox) {
            const tbText = transferBox.textContent || '';
            const bidBtn = transferBox.querySelector('[onclick*="tlpop_pop_transfer_bid"]');
            if (bidBtn && tbText.includes('transferlisted')) {
                const bidMatch = bidBtn.getAttribute('onclick').match(/tlpop_pop_transfer_bid\(['"]([^'"]*)['"]\s*,\s*\d+\s*,\s*(\d+)\s*,\s*['"]([^'"]*)['"]/);
                if (bidMatch) {
                    transferListed = { minBid: bidMatch[1], playerId: bidMatch[2], playerName: bidMatch[3] };
                }
            }
            if (!transferListed) {
                transferBox.querySelectorAll('span.button').forEach(btn => {
                    const onclick = btn.getAttribute('onclick') || '';
                    const label = btn.textContent.trim();
                    let icon = '⚡', cls = 'muted';
                    if (/set_asking/i.test(onclick)) { icon = '💰'; cls = 'yellow'; }
                    else if (/reject/i.test(onclick)) { icon = '🚫'; cls = 'red'; }
                    else if (/transferlist/i.test(onclick)) { icon = '📋'; cls = 'green'; }
                    else if (/fire/i.test(onclick)) { icon = '🗑️'; cls = 'red'; }
                    btnData.push({ onclick, label, icon, cls });
                });
            }
        }

        /* ── Extract other options & note ── */
        const otherBtns = [];
        const otherSection = container.querySelectorAll('.box_body .std.align_center');
        const otherDiv = otherSection.length > 1
            ? otherSection[1]
            : (otherSection[0] && !otherSection[0].classList.contains('transfer_box') ? otherSection[0] : null);

        let noteText = '';
        const notePar = container.querySelector('p.dark.rounded');
        if (notePar) {
            noteText = notePar.innerHTML
                .replace(/<span[^>]*>Note:\s*<\/span>/i, '')
                .replace(/<br\s*\/?>/gi, ' ')
                .trim();
        }

        if (otherDiv) {
            otherDiv.querySelectorAll('span.button').forEach(btn => {
                const onclick = btn.getAttribute('onclick') || '';
                const label = btn.textContent.trim();
                let icon = '⚙️', cls = 'muted';
                if (/note/i.test(label)) { icon = '📝'; cls = 'blue'; }
                else if (/nickname/i.test(label)) { icon = '🏷️'; cls = 'muted'; }
                else if (/favorite.*pos/i.test(label)) { icon = '🔄'; cls = 'muted'; }
                else if (/compare/i.test(label)) { icon = '⚖️'; cls = 'blue'; }
                else if (/demote/i.test(label)) { icon = '⬇️'; cls = 'red'; }
                else if (/promote/i.test(label)) { icon = '⬆️'; cls = 'green'; }
                otherBtns.push({ onclick, label, icon, cls });
            });
        }

        /* ── Extract awards ── */
        const awardRows = [];
        container.querySelectorAll('.award_row').forEach(li => {
            const img = li.querySelector('img');
            const imgSrc = img ? img.getAttribute('src') : '';
            const rawText = li.textContent.trim();

            let awardType = '', awardIcon = '🏆', iconCls = 'gold';
            if (/award_year_u21/.test(imgSrc)) { awardType = 'U21 Player of the Year'; awardIcon = '🌟'; iconCls = 'silver'; }
            else if (/award_year/.test(imgSrc)) { awardType = 'Player of the Year'; awardIcon = '🏆'; iconCls = 'gold'; }
            else if (/award_goal_u21/.test(imgSrc)) { awardType = 'U21 Top Scorer'; awardIcon = '⚽'; iconCls = 'silver'; }
            else if (/award_goal/.test(imgSrc)) { awardType = 'Top Scorer'; awardIcon = '⚽'; iconCls = 'gold'; }

            const seasonMatch = rawText.match(/season\s+(\d+)/i);
            const season = seasonMatch ? seasonMatch[1] : '';

            const leagueLink = li.querySelector('a[league_link]');
            const leagueName = leagueLink ? leagueLink.textContent.trim() : '';
            const leagueHref = leagueLink ? leagueLink.getAttribute('href') : '';
            const flagEl = li.querySelector('.country_link');
            const flagHtml = flagEl ? flagEl.outerHTML : '';

            let statText = '';
            const goalMatch = rawText.match(/(\d+)\s+goals?\s+in\s+(\d+)\s+match/i);
            const ratingMatch = rawText.match(/rating\s+of\s+([\d.]+)\s+in\s+(\d+)\s+match/i);
            if (goalMatch) statText = `${goalMatch[1]} goals / ${goalMatch[2]} games`;
            else if (ratingMatch) statText = `${ratingMatch[1]} avg / ${ratingMatch[2]} games`;

            awardRows.push({ awardType, awardIcon, iconCls, season, leagueName, leagueHref, flagHtml, statText });
        });

        /* ── Build HTML ── */
        const handlers = {};
        let h = '<div class="tmps-sidebar">';

        if (btnData.length > 0) {
            btnData.forEach((b, i) => { handlers[`tf_${i}`] = new Function(b.onclick); });
            h += '<tm-card data-title="Transfer Options" data-flush>';
            h += btnData.map((b, i) =>
                `<tm-list-item data-action="tf_${i}" data-icon="${b.icon}" data-label="${b.label}" data-variant="${b.cls}"></tm-list-item>`
            ).join('');
            h += '</tm-card>';
        }

        if (transferListed) {
            h += '<div data-ref="tmtf-live"></div>';
        }

        if (noteText || otherBtns.length > 0) {
            otherBtns.forEach((b, i) => {
                handlers[`opt_${i}`] = /compare/i.test(b.label)
                    ? () => window.tmCompareOpen()
                    : new Function(b.onclick);
            });
            h += '<tm-card data-title="Options" data-flush>';
            if (noteText) h += `<div class="tmps-note rounded-md muted text-sm mt-0 mx-2 mb-2 py-1 px-2">${noteText}</div>`;
            h += otherBtns.map((b, i) =>
                `<tm-list-item data-action="opt_${i}" data-icon="${b.icon}" data-label="${b.label}" data-variant="${b.cls}"></tm-list-item>`
            ).join('');
            h += '</tm-card>';
        }

        if (awardRows.length > 0) {
            h += '<tm-card data-title="Awards" data-icon="🏆" data-flush><div class="tmps-award-list">';
            for (const a of awardRows) {
                h += `
                    <tm-row data-cls="tmps-award py-2 px-3" data-gap="10px">
                        <div class="tmps-award-icon rounded-md text-lg ${a.iconCls}">${a.awardIcon}</div>
                        <div class="tmps-award-body">
                            <div class="tmps-award-title text-sm font-bold">${a.awardType}</div>`;
                let sub = '';
                if (a.flagHtml) sub += a.flagHtml + ' ';
                if (a.leagueName) sub += a.leagueHref ? `<a href="${a.leagueHref}" class="lime">${a.leagueName}</a>` : a.leagueName;
                if (a.statText) sub += (sub ? ' · ' : '') + a.statText;
                if (sub) h += `<div class="tmps-award-sub text-xs muted">${sub}</div>`;
                h += `        </div>`;
                if (a.season) h += `<span class="tmps-award-season text-sm font-bold yellow">S${a.season}</span>`;
                h += `    </tm-row>`;
            }
            h += '</div></tm-card>';
        }

        h += '</div>';

        const sidebarRefs = TmUI.render(container, h, handlers);

        if (transferListed) {
            const tfCard = sidebarRefs['tmtf-live'];
            if (tfCard) mountLiveTransfer(tfCard, transferListed);
        }
    };

    window.TmPlayerSidebar = { mount };

})();



// ─── components/player/tm-sidebar-nav.js ────────────────────

// ==UserScript==
// @name         TM Sidebar Nav Component
// @description  Replaces the native TM content_menu with a styled icon-nav card in column1.
// ==/UserScript==
(function () {
    'use strict';

    const CSS = `
/* ── Sidebar Nav (tmcn-*) ── */
.tmcn-nav {
    background: #1c3410; border: 1px solid #3d6828; border-radius: 8px;
    overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin-bottom: 10px;
}
.tmcn-nav .tmu-list-item { border-bottom: 1px solid rgba(42,74,28,.5); }
.tmcn-nav .tmu-list-item:last-child { border-bottom: none; }
.tmcn-nav .tmu-list-item:hover { background: rgba(42,74,28,.4); color: #e8f5d8; }
`;
    const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);

    const ICONS = {
        'Squad Overview': '👥',
        'Statistics': '📊',
        'History': '📜',
        'Fixtures': '📅',
    };

    /**
     * mount(container)
     *
     * Reads existing .content_menu links inside `container`, renders a styled
     * icon-nav card, and prepends it to `container`.
     *
     * @param {Element} container - The .column1 element.
     */
    const mount = (container) => {
        const links = container.querySelectorAll('.content_menu a');
        if (!links.length) return;

        const items = [...links].map(a => {
            const label = a.textContent.trim();
            const href = a.getAttribute('href') || '#';
            const icon = ICONS[label] || '📋';
            return `<tm-list-item data-href="${href}" data-icon="${icon}" data-label="${label}"></tm-list-item>`;
        }).join('');

        const root = document.createElement('div');
        TmUI.render(root, `<div class="tmcn-nav">${items}</div>`);
        container.prepend(root.firstChild);
    };

    window.TmSidebarNav = { mount };

})();



// ─── components/player/tm-skills-grid.js ────────────────────

// ==UserScript==
// @name         TM Skills Grid Component
// @description  Replaces the native skill_table with a styled two-column grid. Depends on PlayerDB and PLAYER_ID passed via mount().
// ==/UserScript==
(function () {
    'use strict';

    const CSS = `
/* ═══════════════════════════════════════
   SKILLS GRID (tmps-*)
   ═══════════════════════════════════════ */
.tmps-wrap .tmu-card-body { padding: 0; gap: 0; }
.tmps-grid .tmu-stat-row:hover { background: rgba(255,255,255,.03); }
.tmps-grid .tmu-stat-lbl { text-transform: none; letter-spacing: 0; }
.tmps-star { line-height: 1; }
.tmps-dec  { opacity: .75; vertical-align: super; letter-spacing: 0; }
.tmps-hidden .tmu-stat-lbl { color: #5a7a48; text-transform: none; letter-spacing: 0; }
.tmps-hidden .tmu-stat-val { color: #6a9a58; }
.tmps-unlock .tmu-btn img { height: 12px; vertical-align: middle; }
`;
    const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);

    const SKILL_ORDER = [
        ['Strength', 'Passing'],
        ['Stamina', 'Crossing'],
        ['Pace', 'Technique'],
        ['Marking', 'Heading'],
        ['Tackling', 'Finishing'],
        ['Workrate', 'Longshots'],
        ['Positioning', 'Set Pieces'],
    ];

    const GK_SKILL_ORDER = [
        ['Strength', 'Handling'],
        ['Stamina', 'One on ones'],
        ['Pace', 'Reflexes'],
        [null, 'Aerial Ability'],
        [null, 'Jumping'],
        [null, 'Communication'],
        [null, 'Kicking'],
        [null, 'Throwing'],
    ];

    const skillColor = v => {
        if (v >= 20) return 'gold';
        if (v >= 19) return 'silver';
        if (v >= 16) return 'lime';
        if (v >= 12) return 'yellow';
        if (v >= 8) return 'orange';
        return 'red';
    };

    const renderVal = (v) => {
        const floor = Math.floor(v);
        const frac = v - floor;
        if (floor >= 20) return `<span class="tmps-star text-lg gold">★</span>`;
        if (floor >= 19) {
            const fracStr = frac > 0.005 ? `<span class="tmps-dec text-xs">.${Math.round(frac * 100).toString().padStart(2, '0')}</span>` : '';
            return `<span class="tmps-star text-lg silver">★${fracStr}</span>`;
        }
        const dispVal = frac > 0.005
            ? `${floor}<span class="tmps-dec text-xs">.${Math.round(frac * 100).toString().padStart(2, '0')}</span>`
            : floor;
        return `<span class="${skillColor(floor)}">${dispVal}</span>`;
    };

    let _mountedPlayer = null;

    /**
     * mount(props)
     *
     * Finds the native skill_table, rebuilds it as a styled grid, and
     * replaces it in the DOM. Retries up to 30 times (200 ms apart) if
     * the table is not yet present.
     *
     * @param {object}        props
     * @param {object|null}   props.player    - Player object
     */
    const mount = ({ player }) => {
        _mountedPlayer = player;
        const build = () => {
            const skillTable = document.querySelector('table.skill_table.zebra');
            if (!skillTable) return false;

            /* Parse hidden skills from DOM */
            const hiddenTable = document.querySelector('#hidden_skill_table');
            const hiddenSkills = [];
            let hasHiddenValues = false;
            if (hiddenTable) {
                hiddenTable.querySelectorAll('tr').forEach(row => {
                    const ths = row.querySelectorAll('th');
                    const tds = row.querySelectorAll('td');
                    ths.forEach((th, i) => {
                        const name = th.textContent.trim();
                        const td = tds[i];
                        let val = '', numVal = 0;
                        if (td) {
                            const tip = td.getAttribute('tooltip') || '';
                            const tipMatch = tip.match(/(\d+)\/20/);
                            if (tipMatch) numVal = parseInt(tipMatch[1]) || 0;
                            val = td.textContent.trim();
                        }
                        if (name) {
                            hiddenSkills.push({ name, val, numVal });
                            if (val) hasHiddenValues = true;
                        }
                    });
                });
            }

            /* Use player.skills — already {name, value, ...} objects with decimal values */
            const skills = player.skills || [];

            /* Build main grid columns */
            let leftCol = '', rightCol = '';
            const activeOrder = player.isGK ? GK_SKILL_ORDER : SKILL_ORDER;
            activeOrder.forEach(([left, right]) => {
                const skillLeft = skills.find(skill => skill.name === left);
                const skillRight = skills.find(skill => skill.name === right);
                
                if (left) {
                    leftCol += `
                        <tm-stat data-label="${left}" data-cls="py-1 px-3" data-lbl-cls="text-sm" data-val-cls="text-md">${renderVal(skillLeft?.value)}</tm-stat>`;
                } else {
                    leftCol += `<div class="tmu-stat-row py-1 px-3" style="visibility:hidden"><span class="tmu-stat-lbl">&nbsp;</span><span class="tmu-stat-val">&nbsp;</span></div>`;
                }
                if (right) {
                    rightCol += `<tm-stat data-label="${right}" data-cls="py-1 px-3" data-lbl-cls="text-sm" data-val-cls="text-md">${renderVal(skillRight?.value)}</tm-stat>`;
                }
            });

            /* Build hidden / unlock section */
            let hiddenH = '';
            let unlockBtn = null;
            if (hasHiddenValues) {
                let hLeft = '', hRight = '';
                hiddenSkills.forEach((hs, i) => {
                    const cls = hs.numVal ? skillColor(hs.numVal) : 'muted';
                    const row = `<tm-stat data-label="${hs.name}" data-cls="py-1 px-3" data-lbl-cls="text-xs" data-val-cls="text-xs"><span class="${cls}">${hs.val || '-'}</span></tm-stat>`;
                    if (i % 2 === 0) hLeft += row; else hRight += row;
                });
                hiddenH = `<tm-divider></tm-divider><tm-row data-cls="tmps-hidden" data-align="stretch" data-gap="0"><tm-col data-size="6">${hLeft}</tm-col><tm-col data-size="6">${hRight}</tm-col></tm-row>`;
            } else {
                unlockBtn = document.querySelector('.hidden_skills_text .button');
                hiddenH = `<tm-divider></tm-divider><tm-row data-justify="center" data-cls="tmps-unlock py-2 px-3"><tm-button data-action="unlock">Assess Hidden Skills <img src="/pics/pro_icon.png" class="pro_icon ml-1"></tm-button></tm-row>`;
            }

            const html = `<tm-card><tm-row data-cls="tmps-grid" data-align="stretch" data-gap="0"><tm-col data-size="6">${leftCol}</tm-col><tm-col data-size="6">${rightCol}</tm-col></tm-row>${hiddenH}</tm-card>`;

            const parentDiv = skillTable.closest('div.std');
            if (parentDiv) {
                const newDiv = document.createElement('div');
                newDiv.className = 'tmps-wrap';
                parentDiv.parentNode.replaceChild(newDiv, parentDiv);
                TmUI.render(newDiv, html, { unlock: () => unlockBtn && unlockBtn.click() });
            }
            return true;
        };

        let retries = 0;
        const tryBuild = () => {
            if (!build() && retries++ < 30) setTimeout(tryBuild, 200);
        };
        tryBuild();
    };

    const reRender = () => {
        if (!_mountedPlayer) return;
        const wrap = document.querySelector('.tmps-wrap');
        if (!wrap) return;
        wrap.remove();
        mount({ player: _mountedPlayer });
    };

    window.TmSkillsGrid = { mount, reRender };

})();



// ─── components/player/tm-training-mod.js ───────────────────

// ==UserScript==
// @name         TM Training Mod
// ==/UserScript==
'use strict';

window.TmTrainingMod = (() => {
    const TRAINING_TYPES = { '1': 'Technical', '2': 'Fitness', '3': 'Tactical', '4': 'Finishing', '5': 'Defending', '6': 'Wings' };
    const MAX_PTS = 4;
    const SKILL_NAMES = { strength: 'Strength', stamina: 'Stamina', pace: 'Pace', marking: 'Marking', tackling: 'Tackling', workrate: 'Workrate', positioning: 'Positioning', passing: 'Passing', crossing: 'Crossing', technique: 'Technique', heading: 'Heading', finishing: 'Finishing', longshots: 'Longshots', set_pieces: 'Set Pieces' };
    const COLORS = ['#6cc040', '#5b9bff', '#fbbf24', '#f97316', '#a78bfa', '#f87171'];

    const TMT_CSS = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:host{display:block;all:initial;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#c8e0b4;line-height:1.4}
.tmt-wrap{background:transparent;border-radius:0;border:none;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#c8e0b4;font-size:13px}
.tmt-tabs{display:flex;gap:6px;padding:10px 14px 6px;flex-wrap:wrap}
.tmt-tab{padding:4px 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:#90b878;cursor:pointer;border-radius:4px;background:rgba(42,74,28,.3);border:1px solid rgba(42,74,28,.6);transition:all 0.15s;font-family:inherit;-webkit-appearance:none;appearance:none}
.tmt-tab:hover{color:#c8e0b4;background:rgba(42,74,28,.5);border-color:#3d6828}.tmt-tab.active{color:#e8f5d8;background:#305820;border-color:#3d6828}
.tmt-pro{display:inline-block;background:rgba(108,192,64,.2);color:#6cc040;padding:1px 5px;border-radius:3px;font-size:9px;font-weight:800;letter-spacing:0.5px;margin-left:4px;vertical-align:middle}
.tmt-body{padding:10px 14px 16px;font-size:13px}
.tmt-sbar{display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(42,74,28,.35);border:1px solid #2a4a1c;border-radius:6px;margin-bottom:10px;flex-wrap:wrap}
.tmt-sbar-label{color:#6a9a58;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px}
.tmt-sbar select{background:rgba(42,74,28,.4);color:#c8e0b4;border:1px solid #2a4a1c;padding:4px 8px;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600;font-family:inherit}
.tmt-sbar select:focus{border-color:#6cc040;outline:none}
.tmt-cards{display:flex;gap:14px;margin-bottom:12px;padding:12px 14px;background:rgba(42,74,28,.3);border:1px solid #2a4a1c;border-radius:8px;flex-wrap:wrap}
.tmt-cards>div{min-width:80px}.tmt-cards .lbl{color:#6a9a58;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;font-weight:700}.tmt-cards .val{font-size:16px;font-weight:800;margin-top:3px}
.tmt-pool-bar{height:6px;background:rgba(0,0,0,.2);border-radius:3px;overflow:hidden;display:flex;gap:1px;margin-top:8px}
.tmt-pool-seg{height:100%;border-radius:3px;transition:width 0.3s ease;min-width:0}.tmt-pool-rem{flex:1;height:100%}
.tmt-tbl{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px}
.tmt-tbl th{padding:6px;font-size:10px;font-weight:700;color:#6a9a58;text-transform:uppercase;letter-spacing:0.4px;border-bottom:1px solid #2a4a1c;text-align:left;white-space:nowrap}.tmt-tbl th.c{text-align:center}
.tmt-tbl td{padding:5px 6px;border-bottom:1px solid rgba(42,74,28,.4);color:#c8e0b4;font-variant-numeric:tabular-nums;vertical-align:middle}.tmt-tbl td.c{text-align:center}
.tmt-tbl tr:hover{background:rgba(255,255,255,.03)}
.tmt-clr-bar{width:3px;padding:0;border-radius:2px}
.tmt-dots{display:inline-flex;gap:3px;align-items:center}
.tmt-dot{width:18px;height:18px;border-radius:50%;transition:all 0.15s;cursor:pointer;display:inline-block}
.tmt-dot-empty{background:rgba(255,255,255,.06);border:1px solid rgba(42,74,28,.6)}.tmt-dot-empty:hover{background:rgba(255,255,255,.12);border-color:rgba(42,74,28,.9)}
.tmt-dot-filled{box-shadow:0 0 6px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.15)}
.tmt-btn{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;background:rgba(42,74,28,.4);border:1px solid #2a4a1c;border-radius:6px;color:#8aac72;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.15s;padding:0;line-height:1;font-family:inherit;-webkit-appearance:none;appearance:none}
.tmt-btn:hover:not(:disabled){background:rgba(42,74,28,.7);color:#c8e0b4}.tmt-btn:active:not(:disabled){background:rgba(74,144,48,.3)}.tmt-btn:disabled{opacity:0.2;cursor:not-allowed}
.tmt-pts{font-size:13px;font-weight:800;color:#e8f5d8;min-width:14px;text-align:center}
.tmt-footer{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(42,74,28,.3);border:1px solid #2a4a1c;border-radius:8px;gap:10px;flex-wrap:wrap}
.tmt-footer-total .lbl{color:#6a9a58;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;font-weight:700}
.tmt-footer-total .val{font-size:18px;font-weight:900;color:#e8f5d8;letter-spacing:-0.5px}.tmt-footer-total .dim{color:#6a9a58;font-weight:600}
.tmt-footer-acts{display:flex;gap:6px}
.tmt-act{display:inline-block;padding:4px 14px;background:rgba(42,74,28,.4);border:1px solid #2a4a1c;border-radius:6px;color:#8aac72;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;text-transform:uppercase;letter-spacing:0.4px;font-family:inherit;-webkit-appearance:none;appearance:none}
.tmt-act:hover{background:rgba(42,74,28,.7);color:#c8e0b4}
.tmt-act.dng:hover{border-color:rgba(248,113,113,.3);color:#f87171;background:rgba(248,113,113,.08)}
.tmt-saved{display:inline-block;font-size:10px;font-weight:700;color:#6cc040;background:rgba(108,192,64,.12);border:1px solid rgba(108,192,64,.25);border-radius:4px;padding:2px 8px;margin-left:8px;opacity:0;transition:opacity 0.3s;vertical-align:middle}.tmt-saved.vis{opacity:1}
.tmt-custom-off .tmt-cards{display:none}.tmt-custom-off .tmt-tbl{display:none}.tmt-custom-off .tmt-footer{display:none}
.tmt-wrap:not(.tmt-custom-off) .tmt-sbar{display:none}
.tmt-readonly .tmt-btn{opacity:0.25;pointer-events:none}.tmt-readonly .tmt-dot{pointer-events:none;cursor:default}
.tmt-readonly .tmt-act{opacity:0.25;pointer-events:none}.tmt-readonly #type-select{pointer-events:none;opacity:0.6}
.tmt-readonly .tmt-tab{pointer-events:none}
.tmt-readonly-badge{display:none}.tmt-readonly .tmt-readonly-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;color:#fbbf24;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.25);border-radius:4px;padding:2px 8px;margin-left:8px;vertical-align:middle}`;

    let _container = null, _data = null, _playerId = null, _readOnly = false;
    let trainingData = null, teamPoints = [0, 0, 0, 0, 0, 0], originalPoints = [0, 0, 0, 0, 0, 0], maxPool = 0, customOn = false, currentType = '3', shadow = null, customDataRef = null;
    const q = (sel) => shadow ? shadow.querySelector(sel) : null;
    const qa = (sel) => shadow ? shadow.querySelectorAll(sel) : [];

    const renderPoolBar = () => { const tot = teamPoints.reduce((a, b) => a + b, 0); let s = ''; for (let i = 0; i < 6; i++) { if (teamPoints[i] > 0) { s += `<div class="tmt-pool-seg" style="width:${(teamPoints[i] / maxPool * 100).toFixed(2)}%;background:${COLORS[i]};opacity:0.7"></div>`; } } const rem = ((maxPool - tot) / maxPool * 100).toFixed(2); if (rem > 0) s += `<div class="tmt-pool-rem" style="width:${rem}%"></div>`; return s; };
    const renderDots = (idx) => { const pts = teamPoints[idx]; const c = COLORS[idx]; let h = ''; for (let i = 0; i < MAX_PTS; i++) { h += i < pts ? `<span class="tmt-dot tmt-dot-filled" data-team="${idx}" data-seg="${i}" style="background:${c}"></span>` : `<span class="tmt-dot tmt-dot-empty" data-team="${idx}" data-seg="${i}"></span>`; } return h; };

    let saveDebounce = null, saveTimer = null;
    const flashSaved = () => { const el = q('#saved'); if (!el) return; el.classList.add('vis'); clearTimeout(saveTimer); saveTimer = setTimeout(() => el.classList.remove('vis'), 1800); };
    const saveCustomTraining = () => { const tot = teamPoints.reduce((a, b) => a + b, 0); if (tot !== maxPool || !customDataRef) return; clearTimeout(saveDebounce); saveDebounce = setTimeout(() => { const d = { type: 'custom', on: 1, player_id: _playerId, 'custom[points_spend]': 0, 'custom[player_id]': _playerId, 'custom[saved]': '' }; for (let i = 0; i < 6; i++) { const t = customDataRef['team' + (i + 1)]; const p = `custom[team${i + 1}]`; d[`${p}[num]`] = i + 1; d[`${p}[label]`] = t.label || `Team ${i + 1}`; d[`${p}[points]`] = teamPoints[i]; d[`${p}[skills][]`] = t.skills; } TmApi.saveTraining(d).then(() => flashSaved()); }, 300); };
    const saveTrainingType = (type) => { TmApi.saveTrainingType(_playerId, type).then(() => flashSaved()); };

    const updateUI = () => {
        const tot = teamPoints.reduce((a, b) => a + b, 0); const rem = maxPool - tot;
        const barEl = q('#pool-bar'); if (barEl) barEl.innerHTML = renderPoolBar();
        const uEl = q('#card-used'); if (uEl) uEl.textContent = tot;
        const fEl = q('#card-free'); if (fEl) { fEl.textContent = rem; fEl.style.color = rem > 0 ? '#fbbf24' : '#6a9a58'; }
        for (let i = 0; i < 6; i++) { const dEl = q(`#dots-${i}`); if (dEl) dEl.innerHTML = renderDots(i); const pEl = q(`#pts-${i}`); if (pEl) pEl.textContent = teamPoints[i]; }
        const tEl = q('#total'); if (tEl) tEl.innerHTML = `${tot}<span class="dim">/${maxPool}</span>`;
        qa('.tmt-minus').forEach(b => { b.disabled = teamPoints[parseInt(b.dataset.team)] <= 0; });
        qa('.tmt-plus').forEach(b => { b.disabled = teamPoints[parseInt(b.dataset.team)] >= MAX_PTS || rem <= 0; });
        bindDotClicks();
    };

    const bindDotClicks = () => { qa('.tmt-dot').forEach(dot => { dot.onclick = () => { const ti = parseInt(dot.dataset.team); const si = parseInt(dot.dataset.seg); const tp = si + 1; const tot = teamPoints.reduce((a, b) => a + b, 0); const cur = teamPoints[ti]; if (tp === cur) teamPoints[ti] = si; else if (tp > cur) { const need = tp - cur; const avail = maxPool - tot; teamPoints[ti] = need <= avail ? tp : cur + avail; } else teamPoints[ti] = tp; updateUI(); saveCustomTraining(); }; }); };

    const bindEvents = () => {
        qa('.tmt-plus').forEach(b => { b.addEventListener('click', () => { const i = parseInt(b.dataset.team); if (teamPoints[i] < MAX_PTS && teamPoints.reduce((a, b) => a + b, 0) < maxPool) { teamPoints[i]++; updateUI(); saveCustomTraining(); } }); });
        qa('.tmt-minus').forEach(b => { b.addEventListener('click', () => { const i = parseInt(b.dataset.team); if (teamPoints[i] > 0) { teamPoints[i]--; updateUI(); saveCustomTraining(); } }); });
        bindDotClicks();
        q('#btn-clear')?.addEventListener('click', () => { teamPoints.fill(0); updateUI(); saveCustomTraining(); });
        q('#btn-reset')?.addEventListener('click', () => { teamPoints = [...originalPoints]; updateUI(); saveCustomTraining(); });
        const tS = q('#tab-std'), tC = q('#tab-cus'), w = q('.tmt-wrap');
        tS?.addEventListener('click', () => { if (customOn) { customOn = false; tS.classList.add('active'); tC.classList.remove('active'); w.classList.add('tmt-custom-off'); saveTrainingType(currentType); } });
        tC?.addEventListener('click', () => { if (!customOn) { customOn = true; tC.classList.add('active'); tS.classList.remove('active'); w.classList.remove('tmt-custom-off'); saveCustomTraining(); } });
        q('#type-select')?.addEventListener('change', (e) => { const v = e.target.value; if (v !== currentType) { currentType = v; saveTrainingType(v); } });
        updateUI();
    };

    const render = (container, data, { playerId, readOnly = false } = {}) => {
        _container = container; _data = data; _playerId = playerId; _readOnly = readOnly;
        trainingData = data;

        const custom = data?.custom;

        if (!custom || custom.gk) {
            container.innerHTML = '';
            const host = document.createElement('div');
            container.appendChild(host);
            shadow = host.attachShadow({ mode: 'open' });
            shadow.innerHTML = `<style>${TMT_CSS}</style><div class="tmt-wrap"><div class="tmt-body" style="text-align:center;padding:20px 14px"><div style="font-size:22px;margin-bottom:6px">🧤</div><div style="color:#e8f5d8;font-weight:700;font-size:14px;margin-bottom:4px">Goalkeeper Training</div><div style="color:#6a9a58;font-size:11px">Training is automatically set and cannot be changed for goalkeepers.</div></div></div>`;
            return;
        }

        const customData = custom.custom;
        customOn = !!custom.custom_on;
        currentType = String(custom.team || '3');
        customDataRef = customData;

        for (let i = 0; i < 6; i++) { const t = customData['team' + (i + 1)]; teamPoints[i] = parseInt(t.points) || 0; originalPoints[i] = teamPoints[i]; }
        const totalAlloc = teamPoints.reduce((a, b) => a + b, 0);
        maxPool = totalAlloc + (parseInt(customData.points_spend) || 0); if (maxPool < 1) maxPool = 10;
        const rem = maxPool - totalAlloc;

        container.innerHTML = ''; const host = document.createElement('div'); container.appendChild(host);
        shadow = host.attachShadow({ mode: 'open' });

        let typeOpts = customOn ? '<option value="" selected>— Select —</option>' : '';
        Object.entries(TRAINING_TYPES).forEach(([id, name]) => { typeOpts += `<option value="${id}" ${!customOn && id === currentType ? 'selected' : ''}>${name}</option>`; });

        let teamRows = '';
        for (let i = 0; i < 6; i++) { const t = customData['team' + (i + 1)]; const skills = t.skills.map(s => SKILL_NAMES[s] || s).join(', '); teamRows += `<tr data-team="${i}"><td class="tmt-clr-bar" style="background:${COLORS[i]}"></td><td style="font-weight:700;color:#e8f5d8;white-space:nowrap">T${i + 1}</td><td style="color:#8aac72;font-size:11px">${skills}</td><td class="c"><div style="display:flex;align-items:center;gap:6px;justify-content:center"><button class="tmt-btn tmt-minus" data-team="${i}">−</button><span class="tmt-dots" id="dots-${i}">${renderDots(i)}</span><span class="tmt-pts" id="pts-${i}">${teamPoints[i]}</span><button class="tmt-btn tmt-plus" data-team="${i}">+</button></div></td></tr>`; }

        shadow.innerHTML = `<style>${TMT_CSS}</style>
<div class="tmt-wrap ${customOn ? '' : 'tmt-custom-off'} ${_readOnly ? 'tmt-readonly' : ''}">
<div class="tmt-tabs"><button class="tmt-tab ${!customOn ? 'active' : ''}" id="tab-std">Standard</button><button class="tmt-tab ${customOn ? 'active' : ''}" id="tab-cus">Custom <span class="tmt-pro">PRO</span></button><span class="tmt-readonly-badge">👁 View only</span></div>
<div class="tmt-body">
<div class="tmt-sbar" id="type-bar"><span class="tmt-sbar-label">Training Type</span><select id="type-select">${typeOpts}</select></div>
<div class="tmt-cards"><div><div class="lbl">Allocated</div><div class="val" style="color:#6cc040" id="card-used">${totalAlloc}</div></div><div><div class="lbl">Remaining</div><div class="val" style="color:${rem > 0 ? '#fbbf24' : '#6a9a58'}" id="card-free">${rem}</div></div><div><div class="lbl">Total Pool</div><div class="val" style="color:#e8f5d8">${maxPool}</div></div><div style="flex:1;display:flex;align-items:flex-end"><div class="tmt-pool-bar" id="pool-bar" style="width:100%">${renderPoolBar()}</div></div></div>
<table class="tmt-tbl" id="teams-tbl"><thead><tr><th style="width:3px;padding:0"></th><th style="width:30px">Team</th><th>Skills</th><th class="c">Points</th></tr></thead><tbody id="teams-body">${teamRows}</tbody></table>
<div class="tmt-footer"><div class="tmt-footer-total"><div class="lbl">Total Training</div><div class="val" id="total">${totalAlloc}<span class="dim">/${maxPool}</span></div></div><div class="tmt-footer-acts"><button class="tmt-act dng" id="btn-clear">Clear All</button><button class="tmt-act" id="btn-reset">Reset</button></div></div>
</div></div>`;
        if (!_readOnly) bindEvents();
    };

    const reRender = () => { if (_container && _data) render(_container, _data, { playerId: _playerId, readOnly: _readOnly }); };

    return { render, reRender };
})();



// ─── components/player/tm-history-mod.js ────────────────────

// ==UserScript==
// @name         TM History Module Component
// @description  Renders the player history tab (league/cup/international/total/NT sub-tabs). Depends on TmApi.
// ==/UserScript==
(function () {
    'use strict';

    const CSS = `
/* ═══════════════════════════════════════
   HISTORY (tmph-*)
   ═══════════════════════════════════════ */
#tmph-root {
    display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; line-height: 1.4;
}
.tmph-wrap {
    background: transparent; border-radius: 0; border: none; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; font-size: 13px;
}
.tmph-tabs { display: flex; gap: 6px; padding: 10px 14px 6px; flex-wrap: wrap; }
.tmph-tab {
    padding: 4px 12px; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.4px; color: #90b878; cursor: pointer;
    border-radius: 4px; background: rgba(42,74,28,.3); border: 1px solid rgba(42,74,28,.6);
    transition: all 0.15s; font-family: inherit; -webkit-appearance: none; appearance: none;
}
.tmph-tab:hover { color: #c8e0b4; background: rgba(42,74,28,.5); border-color: #3d6828; }
.tmph-tab.active { color: #e8f5d8; background: #305820; border-color: #3d6828; }
.tmph-body { padding: 6px 14px 16px; font-size: 13px; min-height: 120px; }
.tmph-tbl { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 4px; }
.tmph-tbl th {
    padding: 6px; font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #2a4a1c;
    text-align: left; white-space: nowrap;
}
.tmph-tbl th.c { text-align: center; }
.tmph-tbl th.r { text-align: right; }
.tmph-tbl td {
    padding: 5px 6px; border-bottom: 1px solid rgba(42,74,28,.4);
    color: #c8e0b4; font-variant-numeric: tabular-nums; vertical-align: middle;
}
.tmph-tbl td.c { text-align: center; }
.tmph-tbl td.r { text-align: right; }
.tmph-tbl tr:hover { background: rgba(255,255,255,.03); }
.tmph-tbl a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmph-tbl a:hover { color: #c8e0b4; text-decoration: underline; }
.tmph-tbl .tmph-tot td { border-top: 2px solid #3d6828; color: #e0f0cc; font-weight: 800; }
.tmph-transfer td {
    background: rgba(42,74,28,.2); color: #6a9a58; font-size: 10px;
    padding: 4px 6px; border-bottom: 1px solid rgba(42,74,28,.3);
}
.tmph-xfer-sum { background: rgba(251,191,36,.08); padding: 1px 8px; border-radius: 3px; border: 1px solid rgba(251,191,36,.2); }
.tmph-div { white-space: nowrap; font-size: 11px; }
.tmph-club { display: flex; align-items: center; gap: 6px; white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
.tmph-tbl td.tmph-r-good { color: #6cc040; }
.tmph-tbl td.tmph-r-low { color: #f87171; }
.tmph-empty { text-align: center; color: #5a7a48; padding: 40px; font-size: 13px; font-style: italic; }
`;
    const _s = document.createElement('style');
    _s.textContent = CSS;
    document.head.appendChild(_s);

    /* ── internal state ── */
    let _ntData = null;
    let _historyData = null;
    let _isGK = false;
    let _activeTab = 'nat';
    let _root = null;

    const q = (sel) => _root ? _root.querySelector(sel) : null;
    const qa = (sel) => _root ? _root.querySelectorAll(sel) : [];

    /* ── helpers ── */
    const extractClubName = (html) => { if (!html) return '-'; const m = html.match(/>([^<]+)<\/a>/); return m ? m[1] : (html === '-' ? '-' : html.replace(/<[^>]+>/g, '').trim() || '-'); };
    const extractClubLink = (html) => { if (!html) return ''; const m = html.match(/href="([^"]+)"/); return m ? m[1] : ''; };
    const fixDivFlags = (s) => s ? s.replace(/class='flag-img-([^']+)'/g, "class='flag-img-$1 tmsq-flag'") : '';
    const ratingClass = (r) => { const v = parseFloat(r); if (isNaN(v) || v === 0) return ''; if (v >= 6.0) return 'tmph-r-good'; if (v < 4.5) return 'tmph-r-low'; return ''; };
    const calcRating = (rating, games) => { const r = parseFloat(rating), g = parseInt(games); if (!r || !g || g === 0) return '-'; return (r / g).toFixed(2); };
    const fmtNum = (n) => (n == null || n === '' || n === 0) ? '0' : Number(n).toLocaleString();

    const buildNTTable = (nt) => {
        if (!nt) return '<div class="tmph-empty">Not called up for any national team</div>';
        const avgR = nt.matches > 0 ? nt.rating.toFixed(1) : '-';
        const rc = ratingClass(avgR);
        return `<table class="tmph-tbl"><thead><tr><th>Country</th><th></th><th class="c">Gp</th><th class="c">${_isGK ? 'Con' : 'G'}</th><th class="c">A</th><th class="c">Cards</th><th class="c">Rating</th><th class="c" style="color:#e8a832">Mom</th></tr></thead>`
            + `<tbody><tr><td><div class="tmph-club">${nt.country}</div></td><td class="tmph-div">${nt.flagHtml}</td><td class="c">${nt.matches}</td><td class="c font-semibold" style="color:#6cc040">${nt.goals}</td><td class="c" style="color:#5b9bff">${nt.assists}</td><td class="c yellow">${nt.cards}</td><td class="c font-bold ${rc}">${avgR}</td><td class="c font-bold" style="color:#e8a832">${nt.mom}</td></tr></tbody></table>`;
    };

    const buildTable = (rows) => {
        if (!rows || !rows.length) return '<div class="tmph-empty">No history data available</div>';
        const totalRow = rows.find(r => r.season === 'total');
        const dataRows = rows.filter(r => r.season !== 'total');
        let tb = '';
        for (const row of dataRows) {
            if (row.season === 'transfer') {
                tb += `<tr class="tmph-transfer"><td colspan="8"><tm-row data-justify="center" data-gap="8px"><span class="blue" style="font-size:13px;line-height:1">⇄</span><span class="muted text-xs font-semibold uppercase">Transfer</span><span class="tmph-xfer-sum yellow font-bold text-sm">${row.transfer}</span></tm-row></td></tr>`;
                continue;
            }
            const cn = extractClubName(row.klubnavn), cl = extractClubLink(row.klubnavn);
            const cnH = cl ? `<a href="${cl}" target="_blank">${cn}</a>` : cn;
            const divH = fixDivFlags(row.division_string);
            const avgR = calcRating(row.rating, row.games);
            tb += `<tr><td class="c font-bold">${row.season}</td><td><div class="tmph-club">${cnH}</div></td><td class="tmph-div">${divH}</td><td class="c">${row.games || 0}</td><td class="c font-semibold" style="color:#6cc040">${_isGK ? (row.conceded || 0) : (row.goals || 0)}</td><td class="c" style="color:#5b9bff">${row.assists || 0}</td><td class="c yellow">${row.cards || 0}</td><td class="r font-bold ${ratingClass(avgR)}">${avgR}</td></tr>`;
        }
        if (totalRow) {
            const tr = calcRating(totalRow.rating, totalRow.games);
            tb += `<tr class="tmph-tot"><td class="c" colspan="2">Career Total</td><td></td><td class="c">${fmtNum(totalRow.games)}</td><td class="c" style="color:#6cc040">${fmtNum(_isGK ? totalRow.conceded : totalRow.goals)}</td><td class="c" style="color:#5b9bff">${fmtNum(totalRow.assists)}</td><td class="c yellow">${fmtNum(totalRow.cards)}</td><td class="r">${tr}</td></tr>`;
        }
        return `<table class="tmph-tbl"><thead><tr><th class="c" style="width:36px">S</th><th>Club</th><th>Division</th><th class="c">Gp</th><th class="c">${_isGK ? 'Con' : 'G'}</th><th class="c">A</th><th class="c">Cards</th><th class="r">Rating</th></tr></thead><tbody>${tb}</tbody></table>`;
    };

    /**
     * parseNT()
     *
     * Scrapes national team stats from the original TM DOM (must be called
     * before any operation that cleans the DOM, e.g. TmPlayerCard.render).
     * Hides the native NT section and stores the data internally.
     *
     * @returns {object|null}  Parsed NT data, or null if not found.
     */
    const parseNT = () => {
        const h3s = document.querySelectorAll('h3.dark');
        for (const h3 of h3s) {
            const txt = h3.textContent;
            if (!txt.includes('Called up for') && !txt.includes('Previously played for')) continue;
            const countryLink = h3.querySelector('a.country_link');
            const countryName = countryLink ? countryLink.textContent.trim() : '';
            const flagLinks = h3.querySelectorAll('.country_link');
            const flagEl = flagLinks.length > 1 ? flagLinks[flagLinks.length - 1] : flagLinks[0];
            const flagHtml = flagEl ? flagEl.outerHTML : '';
            const nextDiv = h3.nextElementSibling;
            const table = nextDiv && nextDiv.querySelector('table');
            if (!table) continue;
            const tds = table.querySelectorAll('tr:not(:first-child) td, tr.odd td');
            if (tds.length >= 6) {
                h3.style.display = 'none';
                if (nextDiv) nextDiv.style.display = 'none';
                _ntData = {
                    country: countryName,
                    flagHtml,
                    matches: parseInt(tds[0].textContent) || 0,
                    goals: parseInt(tds[1].textContent) || 0,
                    assists: parseInt(tds[2].textContent) || 0,
                    cards: parseInt(tds[3].textContent) || 0,
                    rating: parseFloat(tds[4].textContent) || 0,
                    mom: parseInt(tds[5].textContent) || 0,
                };
                return _ntData;
            }
        }
        _ntData = null;
        return null;
    };

    /**
     * render(container, data, { isGK })
     *
     * Renders the full history tab into container.
     * Called by the tab system when the user first opens the History tab.
     *
     * @param {Element}  container
     * @param {object}   data       - API response: { table: { nat, cup, int, total } }
     * @param {object}   [opts]
     * @param {boolean}  [opts.isGK=false]
     */
    const render = (container, data, { isGK = false } = {}) => {
        _historyData = data.table;
        _isGK = isGK;
        _activeTab = 'nat';
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.id = 'tmph-root';
        container.appendChild(wrapper);
        _root = wrapper;

        const TAB_LABELS = { nat: 'League', cup: 'Cup', int: 'International', total: 'Total' };
        if (_ntData) TAB_LABELS.nt = 'National Team';

        const tabsEl = window.TmUI.tabs({
            items: Object.entries(TAB_LABELS).map(([key, label]) => ({
                key, label,
                disabled: key === 'nt' ? !_ntData : !(_historyData[key] || []).length,
            })),
            active: _activeTab,
            onChange: (key) => {
                _activeTab = key;
                const c = q('#tmph-tab-content');
                if (c) c.innerHTML = key === 'nt' ? buildNTTable(_ntData) : buildTable(_historyData[key]);
                if (c) window.TmUI?.render(c);
            },
        });
        tabsEl.className = 'tmph-tabs';

        _root.innerHTML = `<div class="tmph-wrap"></div>`;
        const wrap = _root.querySelector('.tmph-wrap');
        wrap.appendChild(tabsEl);
        const bodyEl = document.createElement('div');
        bodyEl.className = 'tmph-body';
        bodyEl.id = 'tmph-tab-content';
        bodyEl.innerHTML = buildTable(_historyData[_activeTab]);
        wrap.appendChild(bodyEl);
        window.TmUI?.render(_root);
    };

    /**
     * reRender({ isGK })
     *
     * Re-renders the tab using stored data. Pass updated isGK if the player
     * position became known after the initial render (e.g. tooltip arrived).
     *
     * @param {object}  [opts]
     * @param {boolean} [opts.isGK]  - If provided, updates stored isGK.
     */
    const reRender = ({ isGK = _isGK } = {}) => {
        if (!_root || !_historyData) return;
        const panel = _root.closest('.tmpe-panel') || _root.parentNode;
        if (panel) render(panel, { table: _historyData }, { isGK });
    };

    window.TmHistoryMod = { parseNT, render, reRender };
})();



// ─── components/player/tm-graphs-mod.js ─────────────────────

// ==UserScript==
// @name         TM Graphs Mod
// ==/UserScript==
'use strict';

window.TmGraphsMod = (() => {
    const CSS = `
.tmg-chart-wrap {
    position: relative; background: rgba(0,0,0,0.18);
    border: 1px solid rgba(120,180,80,0.25);
    padding: 6px 4px 4px; margin: 6px 0 10px;
}
.tmg-chart-title { color: #e8f5d8; padding: 2px 8px 4px; letter-spacing: 0.3px; }
.tmg-canvas { display: block; cursor: crosshair; }
.tmg-tooltip {
    position: absolute; background: rgba(0,0,0,0.88); color: #fff;
    pointer-events: none;
    z-index: 1000; white-space: nowrap; display: none;
    border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
.tmg-legend {
    display: grid; grid-template-columns: 1fr 1fr; gap: 1px 12px;
    padding: 8px 12px 4px; max-width: 450px; margin: 0 auto;
}
.tmg-legend.tmg-legend-inline {
    grid-template-columns: repeat(3, auto); justify-content: center; gap: 1px 18px;
}
.tmg-legend-item {
    display: flex; align-items: center; gap: 3px;
    color: #ccc; cursor: pointer; user-select: none; padding: 1px 0;
}
.tmg-legend-item input[type="checkbox"] {
    appearance: none; -webkit-appearance: none; width: 13px; height: 13px; min-width: 13px;
    border: 1px solid rgba(255,255,255,0.25); border-radius: 2px; cursor: pointer; margin: 0;
}
.tmg-legend-dot { font-size: 9px; line-height: 1; }
.tmg-enable-card {
    background: rgba(0,0,0,0.18); border: 1px solid rgba(120,180,80,0.25);
    margin: 6px 0 10px;
}
.tmg-enable-title { color: #6a9a58; letter-spacing: 0.3px; }
.tmg-enable-desc { color: #5a7a48; margin-top: 2px; }
.tmg-enable-btn { display: inline-flex; gap: 4px; white-space: nowrap; appearance: none; }
.tmg-enable-btn .pro_icon { height: 12px; vertical-align: middle; position: relative; top: -1px; }
.tmg-skill-arrow { margin-left: 1px; }
`;
    (() => { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); })();

    let lastData = null;
    let containerRef = null;
    let _isGK = false, _playerId = null, _playerASI = 0, _ownClubIds = [], _isOwnPlayer = false;
    const ageToMonths = window.TmUtils.ageToMonths;

    const SKILL_META = [
        { key: 'strength', label: 'Strength', color: '#22cc22' }, { key: 'stamina', label: 'Stamina', color: '#00bcd4' },
        { key: 'pace', label: 'Pace', color: '#8bc34a' }, { key: 'marking', label: 'Marking', color: '#f44336' },
        { key: 'tackling', label: 'Tackling', color: '#26a69a' }, { key: 'workrate', label: 'Workrate', color: '#3f51b5' },
        { key: 'positioning', label: 'Positioning', color: '#9c27b0' }, { key: 'passing', label: 'Passing', color: '#e91e63' },
        { key: 'crossing', label: 'Crossing', color: '#2196f3' }, { key: 'technique', label: 'Technique', color: '#ff4081' },
        { key: 'heading', label: 'Heading', color: '#757575' }, { key: 'finishing', label: 'Finishing', color: '#4caf50' },
        { key: 'longshots', label: 'Longshots', color: '#00e5ff' }, { key: 'set_pieces', label: 'Set Pieces', color: '#607d8b' }
    ];
    const SKILL_META_GK = [
        { key: 'strength', label: 'Strength', color: '#22cc22' }, { key: 'stamina', label: 'Stamina', color: '#00bcd4' },
        { key: 'pace', label: 'Pace', color: '#8bc34a' }, { key: 'handling', label: 'Handling', color: '#f44336' },
        { key: 'one_on_ones', label: 'One on ones', color: '#26a69a' }, { key: 'reflexes', label: 'Reflexes', color: '#3f51b5' },
        { key: 'aerial_ability', label: 'Aerial Ability', color: '#9c27b0' }, { key: 'jumping', label: 'Jumping', color: '#e91e63' },
        { key: 'communication', label: 'Communication', color: '#2196f3' }, { key: 'kicking', label: 'Kicking', color: '#ff4081' },
        { key: 'throwing', label: 'Throwing', color: '#757575' }
    ];
    const getSkillMeta = () => _isGK ? SKILL_META_GK : SKILL_META;
    const PEAK_META = [
        { key: 'physical', label: 'Physical', color: '#ffeb3b' },
        { key: 'tactical', label: 'Tactical', color: '#00e5ff' },
        { key: 'technical', label: 'Technical', color: '#ff4081' }
    ];

    const { calcTicks, setupCanvas, drawGrid } = window.TmCanvasUtils;

    const buildAges = (n, years, months) => { const cur = years + months / 12; const ages = []; for (let i = 0; i < n; i++)ages.push(cur - (n - 1 - i) / 12); return ages; };

    const drawChart = (canvas, ages, values, opts = {}) => {
        const { lineColor = '#fff', fillColor = 'rgba(255,255,255,0.06)', gridColor = 'rgba(255,255,255,0.10)', axisColor = '#9ab889', dotRadius = 2.5, yMinOverride, yMaxOverride, formatY = v => String(Math.round(v)) } = opts;
        const setup = setupCanvas(canvas); if (!setup) return null;
        const { ctx, cssW, cssH } = setup;
        const pL = 50, pR = 10, pT = 12, pB = 30, cW = cssW - pL - pR, cH = cssH - pT - pB;
        const minA = Math.floor(Math.min(...ages)), maxA = Math.ceil(Math.max(...ages));
        const rMin = Math.min(...values), rMax = Math.max(...values), m = (rMax - rMin) * 0.06 || 1;
        const yMin = yMinOverride !== undefined ? yMinOverride : Math.floor(rMin - m);
        const yMax = yMaxOverride !== undefined ? yMaxOverride : Math.ceil(rMax + m);
        const xS = v => pL + ((v - minA) / (maxA - minA)) * cW; const yS = v => pT + cH - ((v - yMin) / (yMax - yMin)) * cH;
        ctx.clearRect(0, 0, cssW, cssH); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(pL, pT, cW, cH);
        const yTicks = calcTicks(yMin, yMax, 6);
        drawGrid(ctx, { pL, pT, pB, cssW, cssH, cW, cH, xS, yS, yTicks, ageMin: minA, ageMax: maxA, gridColor, axisColor, formatY });
        ctx.beginPath(); ctx.moveTo(xS(ages[0]), yS(values[0])); for (let i = 1; i < values.length; i++)ctx.lineTo(xS(ages[i]), yS(values[i]));
        ctx.lineTo(xS(ages[ages.length - 1]), pT + cH); ctx.lineTo(xS(ages[0]), pT + cH); ctx.closePath(); ctx.fillStyle = fillColor; ctx.fill();
        ctx.beginPath(); ctx.strokeStyle = lineColor; ctx.lineWidth = 1.8; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.moveTo(xS(ages[0]), yS(values[0])); for (let i = 1; i < values.length; i++)ctx.lineTo(xS(ages[i]), yS(values[i])); ctx.stroke();
        for (let i = 0; i < values.length; i++) { ctx.beginPath(); ctx.arc(xS(ages[i]), yS(values[i]), dotRadius, 0, Math.PI * 2); ctx.fillStyle = lineColor; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.8; ctx.stroke(); }
        ctx.strokeStyle = 'rgba(120,180,80,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(pL, pT, cW, cH);
        return { xS, yS, ages, values, formatY };
    };

    const drawMultiLine = (canvas, ages, seriesData, opts = {}) => {
        const { gridColor = 'rgba(255,255,255,0.10)', axisColor = '#9ab889', yMinOverride, yMaxOverride, formatY = v => String(Math.round(v)), dotRadius = 1.5, yTickCount = 6 } = opts;
        const setup = setupCanvas(canvas); if (!setup) return null;
        const { ctx, cssW, cssH } = setup;
        const pL = 50, pR = 10, pT = 12, pB = 30, cW = cssW - pL - pR, cH = cssH - pT - pB;
        const vis = seriesData.filter(s => s.visible); let all = []; vis.forEach(s => all.push(...s.values)); if (!all.length) all = [0, 1];
        const rMin = Math.min(...all), rMax = Math.max(...all), m = (rMax - rMin) * 0.06 || 1;
        const yMin = yMinOverride !== undefined ? yMinOverride : Math.floor(rMin - m);
        const yMax = yMaxOverride !== undefined ? yMaxOverride : Math.ceil(rMax + m);
        const minA = Math.floor(Math.min(...ages)), maxA = Math.ceil(Math.max(...ages));
        const xS = v => pL + ((v - minA) / (maxA - minA)) * cW; const yS = v => pT + cH - ((v - yMin) / (yMax - yMin)) * cH;
        ctx.clearRect(0, 0, cssW, cssH); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(pL, pT, cW, cH);
        const yTicks = calcTicks(yMin, yMax, yTickCount);
        drawGrid(ctx, { pL, pT, pB, cssW, cssH, cW, cH, xS, yS, yTicks, ageMin: minA, ageMax: maxA, gridColor, axisColor, formatY });
        vis.forEach(s => { ctx.beginPath(); ctx.strokeStyle = s.color; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.moveTo(xS(ages[0]), yS(s.values[0])); for (let i = 1; i < s.values.length; i++)ctx.lineTo(xS(ages[i]), yS(s.values[i])); ctx.stroke(); for (let i = 0; i < s.values.length; i++) { ctx.beginPath(); ctx.arc(xS(ages[i]), yS(s.values[i]), dotRadius, 0, Math.PI * 2); ctx.fillStyle = s.color; ctx.fill(); } });
        ctx.strokeStyle = 'rgba(120,180,80,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(pL, pT, cW, cH);
        return { xS, yS, ages, seriesData, formatY };
    };

    const attachTooltip = (wrap, canvas, info) => {
        const tip = wrap.querySelector('.tmg-tooltip'); if (!tip) return;
        canvas.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top; let best = -1, bd = Infinity; for (let i = 0; i < info.ages.length; i++) { const d = Math.hypot(mx - info.xS(info.ages[i]), my - info.yS(info.values[i])); if (d < bd && d < 25) { bd = d; best = i; } } if (best >= 0) { const a = info.ages[best], v = info.values[best]; const ay = Math.floor(a), am = Math.round((a - ay) * 12); tip.innerHTML = `<b>Age:</b> ${ay}y ${am}m &nbsp; <b>Value:</b> ${info.formatY(v)}`; tip.style.display = 'block'; const px = info.xS(a), py = info.yS(v); let tx = px - tip.offsetWidth / 2; if (tx < 0) tx = 0; if (tx + tip.offsetWidth > canvas.clientWidth) tx = canvas.clientWidth - tip.offsetWidth; tip.style.left = tx + 'px'; tip.style.top = (py - 32) + 'px'; } else tip.style.display = 'none'; });
        canvas.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    };

    const attachMultiTooltip = (wrap, canvas, infoGetter) => {
        const tip = wrap.querySelector('.tmg-tooltip'); if (!tip) return;
        canvas.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top; const info = infoGetter(); if (!info) return; let best = null, bd = Infinity; info.seriesData.filter(s => s.visible).forEach(s => { for (let i = 0; i < s.values.length; i++) { const d = Math.hypot(mx - info.xS(info.ages[i]), my - info.yS(s.values[i])); if (d < bd && d < 25) { bd = d; best = { series: s, idx: i }; } } }); if (best) { const a = info.ages[best.idx], v = best.series.values[best.idx]; const ay = Math.floor(a), am = Math.round((a - ay) * 12); tip.innerHTML = `<span style="color:${best.series.color}">●</span> <b>${best.series.label}:</b> ${info.formatY(v)} &nbsp; <b>Age:</b> ${ay}y ${am}m`; tip.style.display = 'block'; const px = info.xS(a), py = info.yS(v); let tx = px - tip.offsetWidth / 2; if (tx < 0) tx = 0; if (tx + tip.offsetWidth > canvas.clientWidth) tx = canvas.clientWidth - tip.offsetWidth; tip.style.left = tx + 'px'; tip.style.top = (py - 32) + 'px'; } else tip.style.display = 'none'; });
        canvas.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    };

    const CHART_DEFS = [
        { key: 'ti', title: 'Training Intensity', opts: { lineColor: '#fff', fillColor: 'rgba(255,255,255,0.05)' }, prepareData: raw => { const v = []; for (let i = 0; i < raw.length; i++) { if (i === 0 && typeof raw[i] === 'number' && Number(raw[i]) === 0) continue; v.push(Number(raw[i])); } return v; } },
        { key: 'skill_index', title: 'ASI', opts: { lineColor: '#fff', fillColor: 'rgba(255,255,255,0.05)', formatY: v => v >= 1000 ? Math.round(v).toLocaleString() : String(Math.round(v)) }, prepareData: raw => raw.map(Number) },
        { key: 'recommendation', title: 'REC', opts: { lineColor: '#fff', fillColor: 'rgba(255,255,255,0.05)', yMinOverride: 0, formatY: v => v.toFixed(1) }, prepareData: raw => { const v = raw.map(Number); return v; }, yMaxFn: vals => Math.max(6, Math.ceil(Math.max(...vals) * 10) / 10) }
    ];

    const MULTI_DEFS = [
        { title: 'Skills', get meta() { return getSkillMeta(); }, showToggle: true, enableKey: 'skills', getSeriesData: g => { const sm = getSkillMeta(); return sm.map(m => ({ key: m.key, label: m.label, color: m.color, values: (g[m.key] || []).map(Number), visible: true })); }, opts: { yMinOverride: 0, yMaxOverride: 20, dotRadius: 1.5, yTickCount: 11 } },
        {
            title: 'Peaks', meta: PEAK_META, showToggle: false, enableKey: 'peaks', getSeriesData: g => {
                const pk = g.peaks || {};
                console.log('[Graphs] Raw peaks data', { pk });
                /* Compute peaks from skills */
                if (_isGK) {
                    /* GK: Physical: Str+Sta+Pac+Jum (4×20=80), Tactical: 1v1+Aer+Com (3×20=60), Technical: Han+Ref+Kic+Thr (4×20=80) */
                    const PHYS = ['strength', 'stamina', 'pace', 'jumping'];
                    const TACT = ['one_on_ones', 'aerial_ability', 'communication'];
                    const TECH = ['handling', 'reflexes', 'kicking', 'throwing'];
                    const L = (g[PHYS[0]] || []).length;
                    if (L < 2) return PEAK_META.map(m => ({ key: m.key, label: m.label, color: m.color, values: [], visible: true }));
                    const sumAt = (keys, i) => keys.reduce((s, k) => s + ((g[k] || [])[i] || 0), 0);
                    const phys = [], tact = [], tech = [];
                    for (let i = 0; i < L; i++) {
                        phys.push(Math.round(sumAt(PHYS, i) / 80 * 1000) / 10);
                        tact.push(Math.round(sumAt(TACT, i) / 60 * 1000) / 10);
                        tech.push(Math.round(sumAt(TECH, i) / 80 * 1000) / 10);
                    }
                    return [
                        { key: 'physical', label: 'Physical', color: '#ffeb3b', values: phys, visible: true },
                        { key: 'tactical', label: 'Tactical', color: '#00e5ff', values: tact, visible: true },
                        { key: 'technical', label: 'Technical', color: '#ff4081', values: tech, visible: true }
                    ];
                }
                /* Outfield: Physical: Str+Sta+Pac+Hea (4×20=80), Tactical: Mar+Tac+Wor+Pos (4×20=80), Technical: Pas+Cro+Tec+Fin+Lon+Set (6×20=120) */
                const PHYS = ['strength', 'stamina', 'pace', 'heading'];
                const TACT = ['marking', 'tackling', 'workrate', 'positioning'];
                const TECH = ['passing', 'crossing', 'technique', 'finishing', 'longshots', 'set_pieces'];
                const L = (g[PHYS[0]] || []).length;
                if (L < 2) return PEAK_META.map(m => ({ key: m.key, label: m.label, color: m.color, values: [], visible: true }));
                const sumAt = (keys, i) => keys.reduce((s, k) => s + ((g[k] || [])[i] || 0), 0);
                const phys = [], tact = [], tech = [];
                for (let i = 0; i < L; i++) {
                    phys.push(Math.round(sumAt(PHYS, i) / 80 * 1000) / 10);
                    tact.push(Math.round(sumAt(TACT, i) / 80 * 1000) / 10);
                    tech.push(Math.round(sumAt(TECH, i) / 120 * 1000) / 10);
                }
                console.log('[Graphs] Peaks computed from skills', { g });
                return [
                    { key: 'physical', label: 'Physical', color: '#ffeb3b', values: phys, visible: true },
                    { key: 'tactical', label: 'Tactical', color: '#00e5ff', values: tact, visible: true },
                    { key: 'technical', label: 'Technical', color: '#ff4081', values: tech, visible: true }
                ];
            }, opts: { dotRadius: 1.5, yMinOverride: 0, yMaxOverride: 100, formatY: v => v.toFixed(1) + '%' }, legendInline: true
        }
    ];

    const buildSingleChart = (el, def, graphData, player) => {
        let values, ages;
        let enhanced = false;

        /* ASI fallback: if TM's skill_index is missing, reconstruct from TI or store */
        if (def.key === 'skill_index' && (!graphData[def.key] || graphData[def.key].length < 2)) {
            /* Priority 1: reconstruct ASI from TI array + current _playerASI */
            if (_playerASI > 0 && graphData.ti && graphData.ti.length >= 2) {
                try {
                    const tiRaw = graphData.ti;
                    /* TI array usually has a dummy 0 at index 0; skip it */
                    const tiStart = (typeof tiRaw[0] === 'number' && tiRaw[0] === 0) || tiRaw[0] === '0' || tiRaw[0] === 0 ? 1 : 0;
                    const tiVals = tiRaw.slice(tiStart).map(v => parseInt(v) || 0);
                    const L = tiVals.length;
                    if (L >= 2) {
                        const K = _isGK ? 48717927500 : (Math.pow(2, 9) * Math.pow(5, 4) * Math.pow(7, 7));
                        const asiArr = new Array(L);
                        asiArr[L - 1] = _playerASI;
                        for (let j = L - 2; j >= 0; j--) {
                            const ti = tiVals[j + 1];
                            const base = Math.pow(asiArr[j + 1] * K, 1 / 7);
                            asiArr[j] = Math.max(0, Math.round(Math.pow(base - ti / 10, 7) / K));
                        }
                        values = asiArr;
                        ages = buildAges(L, player.years, player.months);
                        enhanced = true;
                        console.log(`[Graphs] ASI reconstructed from TI (${L} points)`);
                    }
                } catch (e) { console.warn('[Graphs] ASI from TI failed', e); }
            }
            /* Priority 2: fall back to store SI records */
            if (!values) {
                try {
                    const store = window.TmPlayerDB.get(_playerId);
                    if (store && store.records) {
                        const keys = Object.keys(store.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));
                        const tmpAges = [], tmpVals = [];
                        keys.forEach(k => {
                            const si = parseInt(store.records[k].SI) || 0;
                            if (si <= 0) return;
                            tmpAges.push(ageToMonths(k) / 12);
                            tmpVals.push(si);
                        });
                        /* Extend to current age using live _playerASI from page */
                        if (tmpVals.length > 0 && _playerASI > 0) {
                            const curAge = player.years + player.months / 12;
                            const lastAge = tmpAges[tmpAges.length - 1];
                            if (curAge > lastAge + 0.001) {
                                tmpAges.push(curAge);
                                tmpVals.push(_playerASI);
                            }
                        }
                        if (tmpVals.length >= 2) {
                            values = tmpVals;
                            ages = tmpAges;
                            enhanced = true;
                        }
                    }
                } catch (e) { }
            }
            if (!values) return;
            /* REC fallback: if TM's recommendation is missing, use our store REREC */
        } else if (def.key === 'recommendation' && (!graphData[def.key] || graphData[def.key].length < 2)) {
            try {
                const store = window.TmPlayerDB.get(_playerId);
                if (store && store._v >= 3 && store.records) {
                    const keys = Object.keys(store.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));
                    const tmpAges = [], tmpVals = [];
                    keys.forEach(k => {
                        const rec = store.records[k];
                        if (rec.REREC == null) return;
                        tmpAges.push(ageToMonths(k) / 12);
                        tmpVals.push(rec.REREC);
                    });
                    if (tmpVals.length >= 2) {
                        values = tmpVals;
                        ages = tmpAges;
                        enhanced = true;
                    }
                }
            } catch (e) { }
            if (!values) return;
            /* TI fallback: compute from ASI differences when TM's TI graph is missing */
        } else if (def.key === 'ti' && (!graphData[def.key] || graphData[def.key].length < 2)) {
            const K = _isGK ? 48717927500 : (Math.pow(2, 9) * Math.pow(5, 4) * Math.pow(7, 7));
            /* Priority 1: compute TI from ASI graph data */
            if (graphData.skill_index && graphData.skill_index.length >= 2) {
                try {
                    const asiRaw = graphData.skill_index.map(Number);
                    const tiVals = [];
                    for (let i = 1; i < asiRaw.length; i++) {
                        const prev = Math.pow(asiRaw[i - 1] * K, 1 / 7);
                        const cur = Math.pow(asiRaw[i] * K, 1 / 7);
                        tiVals.push(Math.round((cur - prev) * 10));
                    }
                    if (tiVals.length >= 2) {
                        values = tiVals;
                        /* TI[i] corresponds to training from age[i] to age[i+1], so ages start one later */
                        ages = buildAges(tiVals.length, player.years, player.months);
                        enhanced = true;
                        console.log(`[Graphs] TI computed from ASI graph (${tiVals.length} points)`);
                    }
                } catch (e) { console.warn('[Graphs] TI from ASI graph failed', e); }
            }
            /* Priority 2: use TI from IndexedDB (compute & persist if missing) */
            if (!values) {
                try {
                    const store = window.TmPlayerDB.get(_playerId);
                    if (store && store.records) {
                        const keys = Object.keys(store.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));
                        /* Fill missing TI into records and persist */
                        let changed = false;
                        for (let i = 1; i < keys.length; i++) {
                            const rec = store.records[keys[i]];
                            if (rec.TI != null) continue;
                            const prevSI = Number(store.records[keys[i - 1]].SI) || 0;
                            const curSI = Number(rec.SI) || 0;
                            if (prevSI > 0 && curSI > 0) {
                                rec.TI = Math.round((Math.pow(curSI * K, 1 / 7) - Math.pow(prevSI * K, 1 / 7)) * 10);
                                changed = true;
                            }
                        }
                        if (changed) window.TmPlayerDB.set(_playerId, store);
                        /* Build graph arrays from stored TI */
                        const tiVals = [], tiAges = [];
                        for (let i = 1; i < keys.length; i++) {
                            const rec = store.records[keys[i]];
                            if (rec.TI == null) continue;
                            tiVals.push(rec.TI);
                            tiAges.push(ageToMonths(keys[i]) / 12);
                        }
                        if (tiVals.length >= 2) {
                            values = tiVals;
                            ages = tiAges;
                            enhanced = true;
                            console.log(`[Graphs] TI from IndexedDB (${tiVals.length} points, ${changed ? 'computed & saved' : 'already stored'})`);
                        }
                    }
                } catch (e) { }
            }
            if (!values) return;
        } else {
            const raw = graphData[def.key]; if (!raw) return;
            values = def.prepareData(raw); if (!values.length) return;
            ages = buildAges(values.length, player.years, player.months);
        }

        /* REC hybrid: splice our v3 REREC (0.01 precision) over TM's (0.10) */
        let recSpliceIdx = -1;
        if (def.key === 'recommendation') {
            try {
                const store = window.TmPlayerDB.get(_playerId);
                if (store && store._v >= 3 && store.records) {
                    const curAgeMonths = player.years * 12 + player.months;
                    const L = values.length;
                    for (let i = 0; i < L; i++) {
                        const am = curAgeMonths - (L - 1 - i);
                        const key = `${Math.floor(am / 12)}.${am % 12}`;
                        const rec = store.records[key];
                        if (rec && rec.REREC != null) {
                            if (recSpliceIdx < 0) recSpliceIdx = i;
                            values[i] = rec.REREC;
                        }
                    }
                    if (recSpliceIdx >= 0) console.log(`[Graphs] REC hybrid: TM data 0..${recSpliceIdx - 1}, our data ${recSpliceIdx}..${L - 1}`);
                }
            } catch (e) { }
        }

        /* Dynamic yMax: use yMaxFn if defined (e.g. REC → min 6.0) */
        const chartOpts = { ...def.opts };
        if (def.yMaxFn) chartOpts.yMaxOverride = def.yMaxFn(values);
        /* When we have enhanced REC data, show 2 decimals in tooltip */
        if (recSpliceIdx >= 0 || (enhanced && def.key === 'recommendation')) {
            chartOpts.formatY = v => v % 1 === 0 ? v.toFixed(1) : v.toFixed(2);
        }

        const wrap = document.createElement('div'); wrap.className = 'tmg-chart-wrap rounded-md';
        let enhLabel = '';
        if (enhanced && def.key === 'skill_index') enhLabel = ' <span class="text-xs font-normal" style="color:#f0c040">(from TI)</span>';
        else if (enhanced && def.key === 'ti') enhLabel = ' <span class="text-xs font-normal" style="color:#f0c040">(from ASI)</span>';
        else if (enhanced && def.key === 'recommendation') enhLabel = ' <span class="text-xs font-normal blue">(computed)</span>';
        else if (recSpliceIdx >= 0) enhLabel = ' <span class="text-xs font-normal" style="color:#38bdf8">(enhanced)</span>';
        wrap.innerHTML = `<div class="tmg-chart-title text-md font-bold">${def.title}${enhLabel}</div><canvas class="tmg-canvas" style="width:100%;height:260px;"></canvas><div class="tmg-tooltip py-1 px-2 rounded-sm text-sm"></div>`;
        el.appendChild(wrap);
        const canvas = wrap.querySelector('canvas');
        requestAnimationFrame(() => { const info = drawChart(canvas, ages, values, chartOpts); attachTooltip(wrap, canvas, info); });
    };

    /* Build per-skill arrays from v3 store records — fallback when TM skills unavailable */
    const buildStoreSkillGraphData = (player) => {
        try {
            const store = window.TmPlayerDB.get(_playerId);
            if (!store || !store.records) { console.log('[Skills] No store or no records'); return null; }
            const sm = getSkillMeta();
            const expectedLen = sm.length; /* 14 for outfield, 11 for GK */
            const sortedKeys = Object.keys(store.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));
            console.log('[Skills] store._v:', store._v, 'total records:', sortedKeys.length, 'isGK:', _isGK);
            const skillArrays = {};
            sm.forEach(m => { skillArrays[m.key] = []; });
            let count = 0;
            sortedKeys.forEach(k => {
                const rec = store.records[k];
                const hasSkills = rec.skills && rec.skills.length >= expectedLen;
                const nonZero = hasSkills && rec.skills.some(v => v !== 0);
                if (!hasSkills || !nonZero) {
                    console.log(`[Skills] skip ${k}: hasSkills=${hasSkills}, nonZero=${nonZero}`, rec.skills?.slice(0, 3));
                    return;
                }
                sm.forEach((m, i) => { skillArrays[m.key].push(rec.skills[i]); });
                count++;
            });
            console.log('[Skills] usable records with skills:', count);
            if (count < 2) return null;
            skillArrays._ages = sortedKeys.filter(k => {
                const r = store.records[k];
                return r.skills && r.skills.length >= expectedLen && r.skills.some(v => v !== 0);
            }).map(k => ageToMonths(k) / 12);
            return skillArrays;
        } catch (e) { console.log('[Skills] error:', e); return null; }
    };

    const buildMultiChart = (el, def, graphData, player, skillpoints, isOwnPlayer) => {
        let seriesData = def.getSeriesData(graphData);
        let fromStore = false;
        let storeAges = null;
        if (!seriesData.length || !seriesData[0].values.length) {
            /* Try store fallback */
            const storeGD = buildStoreSkillGraphData(player);
            if (storeGD) {
                storeAges = storeGD._ages;
                seriesData = def.getSeriesData(storeGD);
            }
            if (!seriesData.length || !seriesData[0].values.length) {
                /* No data at all — show enable card if own player, else info msg */
                if (isOwnPlayer && def.enableKey) {
                    buildEnableCard(el, def.enableKey);
                } else if (def.enableKey) {
                    const msg = document.createElement('div');
                    msg.className = 'rounded-md text-sm';
                    msg.style.cssText = 'background:rgba(0,0,0,0.15);border:1px solid rgba(120,180,80,0.2);padding:10px 14px;margin:4px 0 8px;color:#5a7a48;';
                    msg.textContent = `${def.title}: No data available (graph not enabled)`;
                    el.appendChild(msg);
                }
                return;
            }
            fromStore = true;
        }
        const ages = storeAges || buildAges(seriesData[0].values.length, player.years, player.months);
        const wrap = document.createElement('div'); wrap.className = 'tmg-chart-wrap rounded-md';
        const upSet = new Set((skillpoints?.up) || []); const downSet = new Set((skillpoints?.down) || []);
        const legendCls = def.legendInline ? 'tmg-legend tmg-legend-inline' : 'tmg-legend';
        let legendH = `<div class="${legendCls}">`;
        seriesData.forEach((s, i) => { let arr = ''; if (upSet.has(s.key)) arr = '<span class="tmg-skill-arrow text-xs" style="color:#4caf50">▲</span>'; else if (downSet.has(s.key)) arr = '<span class="tmg-skill-arrow text-xs" style="color:#f44336">▼</span>'; legendH += `<label class="tmg-legend-item text-sm"><input type="checkbox" data-idx="${i}" checked style="background:${s.color}"><span class="tmg-legend-dot" style="color:${s.color}">●</span>${s.label}${arr}</label>`; });
        legendH += '</div>';
        let toggleH = def.showToggle ? '<tm-row data-justify="center" data-gap="6px" data-cls="pt-1 pb-1"><tm-button data-variant="secondary" data-size="sm" data-cls="tmg-btn uppercase" data-action="all">All</tm-button><tm-button data-variant="secondary" data-size="sm" data-cls="tmg-btn uppercase" data-action="none">None</tm-button></tm-row>' : '';
        const computedLabel = fromStore ? ' <span class="text-xs font-normal blue">(computed)</span>' : '';
        const enableKey = (fromStore && isOwnPlayer && def.enableKey) ? def.enableKey : null;
        const enableBtnH = enableKey
            ? `<tm-button data-variant="lime" data-size="xs" data-cls="tmg-enable-btn font-bold uppercase" data-action="enableGraph" style="margin-left:auto;">Enable <img src="/pics/pro_icon.png" class="pro_icon"></tm-button>`
            : '';
        wrap.innerHTML = `<div class="tmg-chart-title text-md font-bold" style="display:flex;align-items:center;gap:8px;">${def.title}${computedLabel}${enableBtnH}</div><canvas class="tmg-canvas" style="width:100%;height:280px;"></canvas><div class="tmg-tooltip py-1 px-2 rounded-sm text-sm"></div>${legendH}${toggleH}`;
        el.appendChild(wrap);
        const canvas = wrap.querySelector('canvas'); let curInfo = null;
        const redraw = () => { curInfo = drawMultiLine(canvas, ages, seriesData, def.opts); };
        const handlers = {};
        if (enableKey) handlers.enableGraph = () => { if (typeof window.graph_enable === 'function') window.graph_enable(_playerId, enableKey); };
        if (def.showToggle) {
            handlers.all = () => { seriesData.forEach(s => s.visible = true); wrap.querySelectorAll('.tmg-legend input[type="checkbox"]').forEach((cb, i) => { cb.checked = true; cb.style.background = seriesData[i].color; }); redraw(); };
            handlers.none = () => { seriesData.forEach(s => s.visible = false); wrap.querySelectorAll('.tmg-legend input[type="checkbox"]').forEach((cb, i) => { cb.checked = false; cb.style.background = 'rgba(255,255,255,0.08)'; }); redraw(); };
        }
        window.TmUI?.render(wrap, undefined, handlers);
        wrap.querySelectorAll('.tmg-legend input[type="checkbox"]').forEach(cb => { cb.addEventListener('change', () => { const i = parseInt(cb.dataset.idx); seriesData[i].visible = cb.checked; cb.style.background = cb.checked ? seriesData[i].color : 'rgba(255,255,255,0.08)'; redraw(); }); });
        attachMultiTooltip(wrap, canvas, () => curInfo);
        requestAnimationFrame(() => redraw());
    };

    /* Enable button descriptions */
    const ENABLE_INFO = {
        skill_index: { title: 'Skill Index', desc: 'Monitor your player\'s ASI increase each training.', enableKey: 'skill_index' },
        recommendation: { title: 'Recommendation', desc: 'See when your player gained new recommendation stars.', enableKey: 'recommendation' },
        skills: { title: 'Skills', desc: 'Monitor when a player gained a point in a certain skill.', enableKey: 'skills' },
        peaks: { title: 'Peaks', desc: 'See what % of weekly training went into each peak area.', enableKey: 'peaks' }
    };

    /* R5 chart — reads R5 values from our v3 store (not from TM endpoint) */
    const buildR5Chart = (el, player) => {
        try {
            const store = window.TmPlayerDB.get(_playerId);
            if (!store || store._v < 3 || !store.records) return;
            const keys = Object.keys(store.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));
            const ages = [], values = [];
            keys.forEach(k => {
                const rec = store.records[k];
                if (rec.R5 == null) return;
                ages.push(ageToMonths(k) / 12);
                values.push(rec.R5);
            });
            if (values.length < 2) return;

            const rawMin = Math.min(...values), rawMax = Math.max(...values);
            const yMin = rawMin < 30 ? Math.floor(rawMin) : 30;
            const yMax = rawMax > 120 ? Math.ceil(rawMax) : 120;
            const opts = {
                lineColor: '#5b9bff', fillColor: 'rgba(91,155,255,0.06)',
                yMinOverride: yMin, yMaxOverride: yMax,
                formatY: v => v % 1 === 0 ? v.toFixed(1) : v.toFixed(2)
            };

            const wrap = document.createElement('div'); wrap.className = 'tmg-chart-wrap rounded-md';
            wrap.innerHTML = `<div class="tmg-chart-title text-md font-bold" style="display:flex;align-items:center;justify-content:space-between">
                    <span>R5 <span class="text-xs font-normal blue">(computed)</span></span>
                    <tm-button data-variant="secondary" data-size="xs" data-cls="tmg-export-btn" title="Export to Excel">⬇ Excel</tm-button>
                </div><canvas class="tmg-canvas" style="width:100%;height:260px;"></canvas><div class="tmg-tooltip py-1 px-2 rounded-sm text-sm"></div>`;
            el.appendChild(wrap);
            window.TmUI?.render(wrap);
            wrap.querySelector('.tmg-export-btn').addEventListener('click', () => {
                const row = values.map(v => v.toFixed(2).replace('.', ',')).join(';');
                const csv = 'sep=;\r\n' + row + '\r\n';
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `R5_player_${_playerId}.csv`;
                document.body.appendChild(a); a.click();
                setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
            });
            const canvas = wrap.querySelector('canvas');
            requestAnimationFrame(() => { const info = drawChart(canvas, ages, values, opts); attachTooltip(wrap, canvas, info); });
        } catch (e) { }
    };

    const buildEnableCard = (container, key) => {
        console.log('[Graphs] Building enable card for', key);
        const info = ENABLE_INFO[key];
        if (!info) return;
        const card = document.createElement('div');
        card.className = 'tmg-enable-card rounded-md py-4 px-4';
        card.innerHTML = `<tm-row data-justify="space-between" data-align="center" data-gap="12px"><div><div class="tmg-enable-title text-md font-bold">${info.title}</div><div class="tmg-enable-desc text-sm">${info.desc}</div></div><tm-button data-variant="lime" data-size="sm" data-cls="tmg-enable-btn font-bold uppercase px-4" data-action="enableGraph">Enable <img src="/pics/pro_icon.png" class="pro_icon"></tm-button></tm-row>`;
        window.TmUI?.render(card, undefined, {
            enableGraph: () => { if (typeof window.graph_enable === 'function') window.graph_enable(_playerId, info.enableKey); }
        });
        container.appendChild(card);
    };

    const render = (container, data, { isGK = false, playerId, playerASI = 0, ownClubIds = [], isOwnPlayer = false } = {}) => {
        containerRef = container;
        lastData = data;
        _isGK = isGK; _playerId = playerId; _playerASI = playerASI; _ownClubIds = ownClubIds; _isOwnPlayer = isOwnPlayer;
        container.innerHTML = '';
        const graphData = data.graphs;
        const player = data.player;
        const skillpoints = data.skillpoints;
        if (!graphData || !player) { container.innerHTML = '<div style="text-align:center;padding:40px;color:#5a7a48;font-style:italic">No graph data available</div>'; return; }

        /* TI chart first */
        buildSingleChart(container, CHART_DEFS[0], graphData, player);

        /* R5 chart — built entirely from our v3 store */
        buildR5Chart(container, player);

        /* Remaining charts (ASI, REC) */
        for (let i = 1; i < CHART_DEFS.length; i++) buildSingleChart(container, CHART_DEFS[i], graphData, player);

        MULTI_DEFS.forEach(def => buildMultiChart(container, def, graphData, player, skillpoints, isOwnPlayer));
    };

    const reRender = () => { if (containerRef && lastData) render(containerRef, lastData, { isGK: _isGK, playerId: _playerId, playerASI: _playerASI, ownClubIds: _ownClubIds, isOwnPlayer: _isOwnPlayer }); };

    return { render, reRender };
})();



// ─── components/player/tm-scout-mod.js ──────────────────────

// ==UserScript==
// @name         TM Scout Module Component
// @description  Renders the Scout tab (reports, scouts table, interested clubs). Depends on TmApi.
// ==/UserScript==
(function () {
    'use strict';

    const CSS = `
/* ═══════════════════════════════════════
   SCOUT (tmsc-*)
   ═══════════════════════════════════════ */
#tmsc-root {
    display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; line-height: 1.4;
}
.tmsc-wrap {
    background: transparent; border-radius: 0; border: none; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; font-size: 13px;
}
.tmsc-tabs { display: flex; gap: 6px; padding: 10px 14px 6px; flex-wrap: wrap; }
.tmsc-tab {
    padding: 4px 12px; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.4px; color: #90b878; cursor: pointer;
    border-radius: 4px; background: rgba(42,74,28,.3); border: 1px solid rgba(42,74,28,.6);
    transition: all 0.15s; font-family: inherit; -webkit-appearance: none; appearance: none;
}
.tmsc-tab:hover { color: #c8e0b4; background: rgba(42,74,28,.5); border-color: #3d6828; }
.tmsc-tab.active { color: #e8f5d8; background: #305820; border-color: #3d6828; }
.tmsc-body { padding: 6px 14px 16px; font-size: 13px; min-height: 120px; }
.tmsc-tbl { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 4px; }
.tmsc-tbl th {
    padding: 6px; font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #2a4a1c;
    text-align: left; white-space: nowrap;
}
.tmsc-tbl th.c { text-align: center; }
.tmsc-tbl td {
    padding: 5px 6px; border-bottom: 1px solid rgba(42,74,28,.4);
    color: #c8e0b4; font-variant-numeric: tabular-nums; vertical-align: middle;
}
.tmsc-tbl td.c { text-align: center; }
.tmsc-tbl tr:hover { background: rgba(255,255,255,.03); }
.tmsc-tbl a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmsc-tbl a:hover { color: #c8e0b4; text-decoration: underline; }
.tmsc-empty { text-align: center; color: #5a7a48; padding: 40px; font-size: 13px; font-style: italic; }
.tmsc-stars { font-size: 20px; letter-spacing: 2px; line-height: 1; }
.tmsc-star-full { color: #fbbf24; }
.tmsc-star-half {
    background: linear-gradient(90deg, #fbbf24 50%, #3d6828 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-star-empty { color: #3d6828; }
.tmsc-report { display: flex; flex-direction: column; gap: 14px; }
.tmsc-report-header { padding-bottom: 10px; border-bottom: 1px solid #2a4a1c; }
.tmsc-report-scout { color: #e8f5d8; font-weight: 700; font-size: 14px; margin-bottom: 4px; }
.tmsc-report-date {
    color: #6a9a58; font-size: 11px; font-weight: 600;
    background: rgba(42,74,28,.4); padding: 3px 10px; border-radius: 4px; white-space: nowrap;
}
.tmsc-report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.tmsc-report-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 5px 10px; background: rgba(42,74,28,.25); border-radius: 4px;
    border: 1px solid rgba(42,74,28,.4);
}
.tmsc-report-label { color: #6a9a58; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
.tmsc-report-value { color: #e8f5d8; font-weight: 700; font-size: 12px; }
.tmsc-report-item.wide { grid-column: 1 / -1; }
.tmsc-section-title {
    color: #6a9a58; font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; padding-bottom: 6px; border-bottom: 1px solid #2a4a1c; margin-bottom: 8px;
}
.tmsc-bar-row { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
.tmsc-bar-label { color: #90b878; font-size: 11px; font-weight: 600; width: 100px; flex-shrink: 0; }
.tmsc-bar-track {
    flex: 1; height: 6px; background: #1a2e10; border-radius: 3px;
    overflow: hidden; max-width: 120px; position: relative;
}
.tmsc-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.tmsc-bar-fill-reach {
    position: absolute; top: 0; left: 0; height: 100%;
    border-radius: 3px; transition: width 0.3s;
}
.tmsc-bar-text { font-size: 11px; font-weight: 600; min-width: 60px; }
.tmsc-league-cell { white-space: nowrap; font-size: 11px; }
.tmsc-league-cell a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmsc-league-cell a:hover { color: #c8e0b4; text-decoration: underline; }
.tmsc-club-cell a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmsc-club-cell a:hover { color: #c8e0b4; text-decoration: underline; }
.tmsc-send-btn { text-transform: uppercase; letter-spacing: 0.4px; padding: 4px 14px; }
.tmsc-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.tmu-btn.tmsc-away { background: transparent; border-color: rgba(61,104,40,.4); color: #5a7a48; font-size: 9px; pointer-events: none; }
.tmsc-online { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-left: 4px; vertical-align: middle; }
.tmsc-online.on { background: #6cc040; box-shadow: 0 0 4px rgba(108,192,64,.5); }
.tmsc-online.off { background: #3d3d3d; }
.tmsc-yd-badge {
    display: inline-block; background: #274a18; color: #6cc040; font-size: 9px;
    font-weight: 700; padding: 1px 6px; border-radius: 3px; border: 1px solid #3d6828;
    margin-left: 6px; letter-spacing: 0.5px; vertical-align: middle;
}
.tmsc-error {
    text-align: center; color: #f87171; padding: 10px; font-size: 12px; font-weight: 600;
    background: rgba(248,113,113,.06); border: 1px solid rgba(248,113,113,.15);
    border-radius: 4px; margin-bottom: 10px;
}
.tmsc-report-divider { border: none; border-top: 1px dashed #3d6828; margin: 16px 0; }
.tmsc-report-count {
    color: #6a9a58; font-size: 10px; text-align: center; padding: 4px 0;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
}
.tmsc-star-green { color: #6cc040; }
.tmsc-star-green-half {
    background: linear-gradient(90deg, #6cc040 50%, #3d6828 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-star-split {
    background: linear-gradient(90deg, #fbbf24 50%, #6cc040 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-conf {
    display: inline-block; font-size: 9px; font-weight: 700; padding: 1px 5px;
    border-radius: 3px; margin-left: 6px; letter-spacing: 0.3px;
    vertical-align: middle; white-space: nowrap;
}
.tmsc-best-wrap {
    background: rgba(42,74,28,.3); border: 1px solid #2a4a1c;
    border-radius: 6px; padding: 12px; margin-bottom: 6px;
}
.tmsc-best-title {
    color: #6cc040; font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
}
.tmsc-best-title::before { content: '★'; font-size: 13px; }
`;
    const _s = document.createElement('style');
    _s.textContent = CSS;
    document.head.appendChild(_s);

    /* ── state ── */
    let _scoutData = null;
    let _root = null;
    let _activeTab = 'report';
    let _containerRef = null;
    let _playerId = null;

    const q = (sel) => _root ? _root.querySelector(sel) : null;
    const qa = (sel) => _root ? _root.querySelectorAll(sel) : [];

    /* ── helpers ── */
    const SPECIALTIES = ['None', 'Strength', 'Stamina', 'Pace', 'Marking', 'Tackling', 'Workrate', 'Positioning', 'Passing', 'Crossing', 'Technique', 'Heading', 'Finishing', 'Longshots', 'Set Pieces'];
    const skillColor = (v) => { v = parseInt(v); if (v >= 19) return '#6cc040'; if (v >= 16) return '#80e048'; if (v >= 13) return '#c8e0b4'; if (v >= 10) return '#fbbf24'; if (v >= 7) return '#f97316'; return '#f87171'; };
    const potColor = (pot) => { pot = parseInt(pot); if (pot >= 18) return '#6cc040'; if (pot >= 15) return '#5b9bff'; if (pot >= 12) return '#c8e0b4'; if (pot >= 9) return '#fbbf24'; return '#f87171'; };
    const extractTier = (txt) => { if (!txt) return null; const m = txt.match(/\((\d)\/(\d)\)/); return m ? { val: parseInt(m[1]), max: parseInt(m[2]) } : null; };
    const barColor = (val, max) => { const r = val / max; if (r >= 0.75) return '#6cc040'; if (r >= 0.5) return '#80e048'; if (r >= 0.25) return '#fbbf24'; return '#f87171'; };
    const fixFlags = (html) => html ? html.replace(/class='flag-img-([^']+)'/g, "class='flag-img-$1 tmsq-flag'").replace(/class="flag-img-([^"]+)"/g, 'class="flag-img-$1 tmsq-flag"') : '';
    const bloomColor = (txt) => { if (!txt) return '#c8e0b4'; const t = txt.toLowerCase(); if (t === 'bloomed') return '#6cc040'; if (t.includes('late bloom')) return '#80e048'; if (t.includes('middle')) return '#fbbf24'; if (t.includes('starting')) return '#f97316'; if (t.includes('not bloomed')) return '#f87171'; return '#c8e0b4'; };
    const cashColor = (c) => { if (!c) return '#c8e0b4'; if (c.includes('Astonishingly')) return '#6cc040'; if (c.includes('Incredibly')) return '#80e048'; if (c.includes('Very rich')) return '#a0d880'; if (c.includes('Rich')) return '#c8e0b4'; if (c.includes('Terrible')) return '#f87171'; if (c.includes('Poor')) return '#f97316'; return '#c8e0b4'; };
    const cleanPeakText = (txt) => txt ? txt.replace(/^\s*-\s*/, '').replace(/\s*(physique|tactical ability|technical ability)\s*$/i, '').trim() : '';
    const confPct = (skill) => Math.round((parseInt(skill) || 0) / 20 * 100);
    const confBadge = (pct) => { const c = pct >= 90 ? '#6cc040' : pct >= 70 ? '#80e048' : pct >= 50 ? '#fbbf24' : '#f87171'; const bg = pct >= 90 ? 'rgba(108,192,64,.12)' : pct >= 70 ? 'rgba(128,224,72,.1)' : pct >= 50 ? 'rgba(251,191,36,.1)' : 'rgba(248,113,113,.1)'; return `<span class="tmsc-conf" style="color:${c};background:${bg}">${pct}%</span>`; };
    const onlineDot = (on) => `<span class="tmsc-online ${on ? 'on' : 'off'}"></span>`;
    const getScoutForReport = (r) => { if (!_scoutData || !_scoutData.scouts || !r.scoutid) return null; return Object.values(_scoutData.scouts).find(s => String(s.id) === String(r.scoutid)) || null; };

    const greenStarsHtml = (rec) => { rec = parseFloat(rec) || 0; const full = Math.floor(rec); const half = (rec % 1) >= 0.25; let h = ''; for (let i = 0; i < full; i++) h += '<span class="tmsc-star-green">★</span>'; if (half) h += '<span class="tmsc-star-green-half">★</span>'; const e = 5 - full - (half ? 1 : 0); for (let i = 0; i < e; i++) h += '<span class="tmsc-star-empty">★</span>'; return h; };

    const combinedStarsHtml = (current, potMax) => {
        current = parseFloat(current) || 0; potMax = parseFloat(potMax) || 0;
        if (potMax < current) potMax = current;
        let h = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= current) h += '<span class="tmsc-star-full">★</span>';
            else if (i - 0.5 <= current && current < i) {
                if (potMax >= i) h += '<span class="tmsc-star-split">★</span>';
                else h += '<span class="tmsc-star-half">★</span>';
            }
            else if (i <= potMax) h += '<span class="tmsc-star-green">★</span>';
            else if (i - 0.5 <= potMax && potMax < i) h += '<span class="tmsc-star-green-half">★</span>';
            else h += '<span class="tmsc-star-empty">★</span>';
        }
        return h;
    };

    const buildScoutsTable = (scouts) => {
        if (!scouts || !Object.keys(scouts).length) return '<div class="tmsc-empty">No scouts hired</div>';
        const skills = ['seniors', 'youths', 'physical', 'tactical', 'technical', 'development', 'psychology'];
        let rows = '';
        for (const s of Object.values(scouts)) {
            let sc = ''; for (const sk of skills) { const v = parseInt(s[sk]) || 0; sc += `<td class="c font-semibold" style="color:${skillColor(v)}">${v}</td>`; }
            const bc = s.away ? 'tmsc-send-btn tmsc-away' : 'tmsc-send-btn';
            const bl = s.away ? (s.returns || 'Away') : 'Send';
            rows += `<tr><td class="font-semibold" style="color:#e8f5d8;white-space:nowrap">${s.name} ${s.surname}</td>${sc}<td class="c"><tm-button data-variant="secondary" data-size="xs" data-cls="${bc}" data-scout-id="${s.id}" ${s.away ? 'title="' + (s.returns || '') + '"' : ''}>${bl}</tm-button></td></tr>`;
        }
        return `<table class="tmsc-tbl"><thead><tr><th>Name</th><th class="c">Sen</th><th class="c">Yth</th><th class="c">Phy</th><th class="c">Tac</th><th class="c">Tec</th><th class="c">Dev</th><th class="c">Psy</th><th class="c"></th></tr></thead><tbody>${rows}</tbody></table>`;
    };

    const buildReportCard = (r) => {
        const pot = parseInt(r.old_pot) || 0;
        const potStarsVal = (parseFloat(r.potential) || 0) / 2;
        if (r.scout_name === 'YD' || r.scoutid === '0') {
            return `<div class="tmsc-report"><tm-row data-justify="space-between" data-align="flex-start" data-cls="tmsc-report-header"><div><div class="tmsc-stars">${greenStarsHtml(potStarsVal)}</div><div class="tmsc-report-scout">Youth Development<span class="tmsc-yd-badge">YD</span></div></div><div class="tmsc-report-date">${r.done || '-'}</div></tm-row><div class="tmsc-report-grid"><div class="tmsc-report-item wide"><span class="tmsc-report-label">Potential</span><span class="tmsc-report-value" style="color:${potColor(pot)}">${pot}</span></div><div class="tmsc-report-item wide"><span class="tmsc-report-label">Age at report</span><span class="tmsc-report-value">${r.report_age || '-'}</span></div></div></div>`;
        }
        const spec = parseInt(r.specialist) || 0; const specLabel = SPECIALTIES[spec] || 'None';
        const scout = getScoutForReport(r);
        let potConf = null, bloomConf = null, phyConf = null, tacConf = null, tecConf = null, psyConf = null, specConf = null;
        if (scout) { const age = parseInt(r.report_age) || 0; const senYth = age < 20 ? (parseInt(scout.youths) || 0) : (parseInt(scout.seniors) || 0); const dev = parseInt(scout.development) || 0; potConf = confPct(Math.min(senYth, dev)); bloomConf = confPct(dev); phyConf = confPct(parseInt(scout.physical) || 0); tacConf = confPct(parseInt(scout.tactical) || 0); tecConf = confPct(parseInt(scout.technical) || 0); psyConf = confPct(parseInt(scout.psychology) || 0); if (spec > 0) { const phyS = [1, 2, 3, 11]; const tacS = [4, 5, 6, 7]; if (phyS.includes(spec)) specConf = phyConf; else if (tacS.includes(spec)) specConf = tacConf; else specConf = tecConf; } }
        const peaks = [{ label: 'Physique', text: cleanPeakText(r.peak_phy_txt), conf: phyConf }, { label: 'Tactical', text: cleanPeakText(r.peak_tac_txt), conf: tacConf }, { label: 'Technical', text: cleanPeakText(r.peak_tec_txt), conf: tecConf }];
        let peaksH = '';
        for (const p of peaks) { const tier = extractTier(p.text); if (tier) { const pct = (tier.val / tier.max) * 100; const c = barColor(tier.val, tier.max); peaksH += `<div class="tmsc-bar-row"><span class="tmsc-bar-label">${p.label}</span><div class="tmsc-bar-track"><div class="tmsc-bar-fill" style="width:${pct}%;background:${c}"></div></div><span class="tmsc-bar-text" style="color:${c}">${tier.val}/${tier.max}</span>${p.conf !== null ? confBadge(p.conf) : ''}</div>`; } }
        const charisma = parseInt(r.charisma) || 0; const professionalism = parseInt(r.professionalism) || 0; const aggression = parseInt(r.aggression) || 0;
        const pers = [{ label: 'Leadership', value: charisma }, { label: 'Professionalism', value: professionalism }, { label: 'Aggression', value: aggression }];
        let persH = '';
        for (const p of pers) { const pct = (p.value / 20) * 100; const c = skillColor(p.value); persH += `<div class="tmsc-bar-row"><span class="tmsc-bar-label">${p.label}</span><div class="tmsc-bar-track"><div class="tmsc-bar-fill" style="width:${pct}%;background:${c}"></div></div><span class="tmsc-bar-text" style="color:${c}">${p.value}</span>${psyConf !== null ? confBadge(psyConf) : ''}</div>`; }
        return `<div class="tmsc-report"><tm-row data-justify="space-between" data-align="flex-start" data-cls="tmsc-report-header"><div><div class="tmsc-stars">${combinedStarsHtml(r.rec, potStarsVal)}</div><div class="tmsc-report-scout">${r.scout_name || 'Unknown'}</div></div><div class="tmsc-report-date">${r.done || '-'}</div></tm-row><div class="tmsc-report-grid"><div class="tmsc-report-item"><span class="tmsc-report-label">Potential</span><span class="tmsc-report-value" style="color:${potColor(pot)}">${pot}${potConf !== null ? confBadge(potConf) : ''}</span></div><div class="tmsc-report-item"><span class="tmsc-report-label">Age</span><span class="tmsc-report-value">${r.report_age || '-'}</span></div><div class="tmsc-report-item"><span class="tmsc-report-label">Bloom</span><span class="tmsc-report-value" style="color:${bloomColor(r.bloom_status_txt)}">${r.bloom_status_txt || '-'}${bloomConf !== null ? confBadge(bloomConf) : ''}</span></div><div class="tmsc-report-item"><span class="tmsc-report-label">Development</span><span class="tmsc-report-value">${r.dev_status || '-'}${bloomConf !== null ? confBadge(bloomConf) : ''}</span></div><div class="tmsc-report-item wide"><span class="tmsc-report-label">Specialty</span><span class="tmsc-report-value" style="color:${spec > 0 ? '#fbbf24' : '#5a7a48'}">${specLabel}${specConf !== null ? confBadge(specConf) : ''}</span></div></div><div><div class="tmsc-section-title">Peak Development</div>${peaksH}</div><div><div class="tmsc-section-title">Personality</div>${persH}</div></div>`;
    };

    const buildReport = (reports, error) => {
        let h = '';
        if (error) { const msg = error === 'multi_scout' ? 'This scout is already on a mission' : error === 'multi_bid' ? 'Scout already scouting this player' : error; h += `<div class="tmsc-error">${msg}</div>`; }
        if (!reports || !reports.length) return h + '<div class="tmsc-empty">No scout reports available</div>';
        if (reports.length > 1) h += `<div class="tmsc-report-count">${reports.length} Reports</div>`;
        for (let i = 0; i < reports.length; i++) { if (i > 0) h += '<hr class="tmsc-report-divider">'; h += buildReportCard(reports[i]); }
        return h;
    };

    const buildInterested = (interested) => {
        if (!interested || !interested.length) return '<div class="tmsc-empty">No interested clubs</div>';
        let rows = '';
        for (const c of interested) { const ch = fixFlags(c.club_link || ''); const lh = fixFlags(c.league_link || ''); const cc = cashColor(c.cash); rows += `<tr><td class="tmsc-club-cell">${ch} ${onlineDot(c.online)}</td><td class="tmsc-league-cell">${lh}</td><td style="color:${cc};font-weight:600;font-size:11px">${c.cash}</td></tr>`; }
        return `<table class="tmsc-tbl"><thead><tr><th>Club</th><th>League</th><th>Financial</th></tr></thead><tbody>${rows}</tbody></table>`;
    };

    const getContent = (tab) => {
        switch (tab) {
            case 'report': return buildReport(_scoutData.reports, _scoutData.error);
            case 'scouts': return buildScoutsTable(_scoutData.scouts);
            case 'interested': return buildInterested(_scoutData.interested);
            default: return '';
        }
    };

    const bindSendButtons = () => {
        qa('.tmsc-send-btn').forEach(btn => {
            if (btn.classList.contains('tmsc-away')) return;
            btn.addEventListener('click', () => {
                const scoutId = btn.dataset.scoutId;
                btn.disabled = true; btn.textContent = '...';
                TmApi.fetchPlayerInfo(_playerId, 'scout', { scout_id: scoutId }).then(d => {
                    if (!d) { btn.textContent = 'Error'; btn.style.color = '#f87171'; setTimeout(() => { btn.textContent = 'Send'; btn.disabled = false; btn.style.color = ''; }, 2000); return; }
                    if (d.scouts || d.reports) { render(_containerRef, d, { playerId: _playerId }); }
                    else { btn.textContent = 'Sent'; btn.style.background = '#274a18'; btn.style.color = '#6cc040'; }
                });
            });
        });
    };

    /**
     * render(container, data, { playerId })
     *
     * Renders the scout tab into container.
     *
     * @param {Element} container
     * @param {object}  data      - API response: { reports, scouts, interested, error }
     * @param {object}  [opts]
     * @param {string}  [opts.playerId]
     */
    const render = (container, data, { playerId = _playerId } = {}) => {
        _containerRef = container;
        _scoutData = data;
        _playerId = playerId;
        _activeTab = (data.reports && data.reports.length) ? 'report' : 'scouts';
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.id = 'tmsc-root';
        container.appendChild(wrapper);
        _root = wrapper;

        const TAB_LABELS = { report: 'Report', scouts: 'Scouts', interested: 'Interested' };
        const hasData = k => k === 'report' ? !!(data.reports && data.reports.length > 0)
            : k === 'interested' ? !!(data.interested && data.interested.length > 0)
            : k === 'scouts' ? !!(data.scouts && Object.keys(data.scouts).length > 0) : true;
        const tabsEl = window.TmUI.tabs({
            items: Object.entries(TAB_LABELS).map(([key, label]) => ({ key, label, disabled: !hasData(key) })),
            active: _activeTab,
            onChange: (key) => {
                _activeTab = key;
                const c = q('#tmsc-tab-content'); if (!c) return;
                c.innerHTML = getContent(key);
                window.TmUI?.render(c);
                if (key === 'scouts') bindSendButtons();
            },
        });
        tabsEl.className = 'tmsc-tabs';
        _root.innerHTML = '<div class="tmsc-wrap"></div>';
        const scWrap = _root.querySelector('.tmsc-wrap');
        scWrap.appendChild(tabsEl);
        const bodyEl = document.createElement('div');
        bodyEl.className = 'tmsc-body';
        bodyEl.id = 'tmsc-tab-content';
        bodyEl.innerHTML = getContent(_activeTab);
        scWrap.appendChild(bodyEl);
        window.TmUI?.render(_root);
        bindSendButtons();
    };

    /**
     * reRender()  — re-renders with stored data.
     */
    const reRender = () => { if (_containerRef && _scoutData) render(_containerRef, _scoutData); };

    window.TmScoutMod = { render, reRender };
})();



// ─── components/player/tm-asi-calculator.js ─────────────────

// ==UserScript==
// @name         TM ASI Calculator Component
// @description  Standalone ASI projection widget. Depends on TmLib (tm-lib.js).
// ==/UserScript==
(function () {
    'use strict';

    const CSS = `
/* ── ASI Calculator (tmac-*) ── */
.tmac-result {
    background: rgba(42,74,28,.3); border: 1px solid rgba(42,74,28,.5);
    display: none;
}
.tmac-result.show { display: block; }
.tmac-result .tmu-stat-val { color: #e8f5d8; }
`;
    const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);

    /**
     * mount(container, props)
     *
     * @param {Element}      container  - DOM element to append the widget into.
     * @param {object}       props
     * @param {object}       props.player  - Raw tooltip player object.
     * @param {object|null}  props.player  - Normalized player object (asi, age, months, favposition, ti).
     */
    const mount = (container, { player = null } = {}) => {
        if (!container) return;
        const mo = player?.ageMonths > 0 ? player.ageMonths % 12 : null;
        const defaultTrainings = mo !== null ? (mo >= 11 ? 12 : 11 - mo) : '';

        const root = document.createElement('div');
        const refs = TmUI.render(root, `
            <tm-card data-title="ASI Calculator" data-icon="📊">
                <tm-input data-label="Trainings" data-ref="trainings" data-type="number" data-value="${defaultTrainings}" data-placeholder="12" data-min="1" data-max="500"></tm-input>
                <tm-input data-label="Avg TI" data-ref="ti" data-type="number" data-value="${player?.ti || ''}" data-placeholder="8" data-min="-10" data-max="10" data-step="0.1"></tm-input>
                <tm-button data-label="Calculate" data-action="calc"></tm-button>
                <div data-ref="result" class="tmac-result rounded-md py-2 px-3">
                    <tm-stat data-label="Age" data-value="-" data-ref="age" data-val-cls="text-md"></tm-stat>
                    <tm-stat data-label="New ASI" data-value="-" data-ref="asi" data-val-cls="text-md"></tm-stat>
                    <tm-stat data-label="Skill Sum" data-value="-" data-ref="skillsum" data-val-cls="text-md"></tm-stat>
                    <tm-stat data-label="Sell To Agent" data-value="-" data-ref="sta" data-val-cls="text-md"></tm-stat>
                </div>
            </tm-card>`, {
            calc: () => {
                const trainings = parseInt(refs.trainings.value) || 0;
                const avgTIVal = parseFloat(refs.ti.value) || 0;
                if (trainings <= 0 || avgTIVal === 0 || !player?.asi) return;

                const proj = TmLib.calcASIProjection({ player, trainings, avgTI: avgTIVal });

                refs.result.classList.add('show');

                if (player?.ageMonths > 0) {
                    const totMo = player.ageMonths + trainings;
                    refs.age.textContent = `${Math.floor(totMo / 12)}.${totMo % 12}`;
                } else {
                    refs.age.textContent = '-';
                }

                const diffHtml = (val) => {
                    const sign = val >= 0 ? '+' : '';
                    const cls = val >= 0 ? 'lime' : 'red';
                    return `<span class="text-xs font-bold ml-1 ${cls}">${sign}${val.toLocaleString()}</span>`;
                };

                refs.asi.innerHTML =
                    `${proj.newASI.toLocaleString()}${diffHtml(proj.asiDiff)}`;

                refs.skillsum.textContent =
                    `${proj.curSkillSum.toFixed(1)} → ${proj.futSkillSum.toFixed(1)}`;

                if (player?.ageMonths > 0) {
                    refs.sta.innerHTML =
                        `${proj.futAgentVal.toLocaleString()}${diffHtml(proj.agentDiff)}`;
                } else {
                    refs.sta.textContent = '-';
                }
            },
        });
        container.appendChild(root);
    };

    window.TmAsiCalculator = { mount };

})();



// ─── components/player/tm-best-estimate.js ──────────────────

// ==UserScript==
// @name         TM Best Estimate Component
// @description  Best Estimate card widget. Depends on no external libs — fully self-contained.
// ==/UserScript==
(function () {
    'use strict';

    const CSS = `
/* ═══════════════════════════════════════
   BEST ESTIMATE CARD (tmbe-*)
   ═══════════════════════════════════════ */
.tmbe-title-stars { letter-spacing: 1px; line-height: 1; margin-left: auto; }
.tmbe-grid {
    display: grid; grid-template-columns: 1fr; gap: 6px; margin-bottom: 14px;
}
.tmbe-item {
    background: rgba(42,74,28,.25); border: 1px solid rgba(42,74,28,.4);
}
.tmbe-peak-item {
    flex-direction: column !important; align-items: stretch !important; gap: 6px; padding: 8px 10px !important;
}
.tmbe-peak-reach { line-height: 1; }
.tmbe-reach-tag { color: #5a7a48; }
.tmbe-bar-row {
    display: flex; flex-direction: column; gap: 3px; padding: 6px 0;
    border-bottom: 1px solid rgba(42,74,28,.3);
}
.tmbe-bar-row:last-child { border-bottom: none; }
.tmbe-bar-label { color: #90b878; }
.tmbe-bar-track {
    width: 100%; height: 6px; background: rgba(0,0,0,.3); border-radius: 3px;
    overflow: hidden; position: relative;
}
.tmbe-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.tmbe-bar-fill-reach {
    position: absolute; top: 0; left: 0; height: 100%;
    border-radius: 3px; transition: width 0.3s;
}
.tmbe-bar-val { font-variant-numeric: tabular-nums; }
.tmbe-conf {
    display: inline-block; letter-spacing: 0.3px;
    vertical-align: middle; white-space: nowrap;
}
`;
    const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);

    /* ── Private helpers ── */
    const SPECIALTIES = ['None', 'Strength', 'Stamina', 'Pace', 'Marking', 'Tackling', 'Workrate', 'Positioning', 'Passing', 'Crossing', 'Technique', 'Heading', 'Finishing', 'Longshots', 'Set Pieces'];
    const PEAK_SUMS = {
        outfield: { phy: [64, 70, 74, 80], tac: [64, 70, 74, 80], tec: [96, 105, 111, 120] },
        gk: { phy: [64, 70, 74, 80], tac: [50, 55, 60], tec: [68, 74, 80] }
    };

    const skillColor = (v) => { v = parseInt(v); if (v >= 19) return '#6cc040'; if (v >= 16) return '#80e048'; if (v >= 13) return '#c8e0b4'; if (v >= 10) return '#fbbf24'; if (v >= 7) return '#f97316'; return '#f87171'; };
    const potColor = (pot) => { pot = parseInt(pot); if (pot >= 18) return '#6cc040'; if (pot >= 15) return '#5b9bff'; if (pot >= 12) return '#c8e0b4'; if (pot >= 9) return '#fbbf24'; return '#f87171'; };
    const barColor = (val, max) => { const r = val / max; if (r >= 0.75) return '#6cc040'; if (r >= 0.5) return '#80e048'; if (r >= 0.25) return '#fbbf24'; return '#f87171'; };
    const reachColor = (pct) => { if (pct >= 90) return '#6cc040'; if (pct >= 80) return '#80e048'; if (pct >= 70) return '#fbbf24'; if (pct >= 60) return '#f97316'; return '#f87171'; };
    const bloomColor = (txt) => { if (!txt) return '#c8e0b4'; const t = txt.toLowerCase(); if (t === 'bloomed') return '#6cc040'; if (t.includes('late bloom')) return '#80e048'; if (t.includes('middle')) return '#fbbf24'; if (t.includes('starting')) return '#f97316'; if (t.includes('not bloomed')) return '#f87171'; return '#c8e0b4'; };
    const cleanPeakText = (txt) => txt ? txt.replace(/^\s*-\s*/, '').replace(/\s*(physique|tactical ability|technical ability)\s*$/i, '').trim() : '';
    const extractTier = (txt) => { if (!txt) return null; const m = txt.match(/\((\d)\/(\d)\)/); return m ? { val: parseInt(m[1]), max: parseInt(m[2]) } : null; };
    const confPct = (skill) => Math.round((parseInt(skill) || 0) / 20 * 100);

    const combinedStarsHtml = (current, potMax) => {
        current = parseFloat(current) || 0; potMax = parseFloat(potMax) || 0;
        if (potMax < current) potMax = current;
        let h = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= current) h += '<span class="tmsc-star-full">★</span>';
            else if (i - 0.5 <= current && current < i) {
                h += potMax >= i ? '<span class="tmsc-star-split">★</span>' : '<span class="tmsc-star-half">★</span>';
            }
            else if (i <= potMax) h += '<span class="tmsc-star-green">★</span>';
            else if (i - 0.5 <= potMax && potMax < i) h += '<span class="tmsc-star-green-half">★</span>';
            else h += '<span class="tmsc-star-empty">★</span>';
        }
        return h;
    };

    /* getCurrentBloomStatus — age is the player's current decimal age (e.g. 22.7) */
    const getCurrentBloomStatus = (allReports, scouts, age) => {
        if (!allReports || !allReports.length || age === null) return { text: '-', certain: false, range: null };
        const getDevSkill = (r) => {
            if (!scouts) return 0;
            const s = Object.values(scouts).find(sc => String(sc.id) === String(r.scoutid));
            return s ? (parseInt(s.development) || 0) : 0;
        };
        const phaseFor = (start) => {
            if (age < start) return 'not';
            if (age >= start + 3) return 'done';
            const y = age - start;
            return y < 1 ? 'starting' : y < 2 ? 'middle' : 'late';
        };
        const PHASE_LABEL = { not: 'Not bloomed', starting: 'Starting', middle: 'Middle', late: 'Late bloom', done: 'Bloomed' };
        const statusFrom = (start) => {
            const range = `${start}.0\u2013${start + 2}.11`;
            const p = phaseFor(start);
            if (p === 'done') return { text: 'Bloomed', certain: true, range: null };
            const notBloomedTxt = bloomType ? `Not bloomed (${bloomType})` : 'Not bloomed';
            const text = p === 'not' ? notBloomedTxt : p === 'starting' ? 'Starting to bloom' : p === 'middle' ? 'In the middle of his bloom' : 'In his late bloom';
            return { text, certain: true, range };
        };

        let seenBloomed = false;
        let bloomType = null, possibleStarts = null;
        let bloomTypeBestDevSk = -1, bloomTypeBestDate = '';
        for (const r of allReports) {
            const bt = r.bloom_status_txt || '';
            if (!bt || bt === '-') continue;
            if (bt === 'Bloomed') { seenBloomed = true; continue; }
            if (!bt.includes('Not bloomed')) continue;
            const hasType = bt.includes('Early') || bt.includes('Normal') || bt.includes('Late');
            if (!hasType) continue;
            const devSk = getDevSkill(r);
            const rDate = r.done || '';
            if (devSk > bloomTypeBestDevSk || (devSk === bloomTypeBestDevSk && rDate > bloomTypeBestDate)) {
                bloomTypeBestDevSk = devSk; bloomTypeBestDate = rDate;
                if (bt.includes('Early')) { bloomType = 'Early'; possibleStarts = [16, 17]; }
                else if (bt.includes('Normal')) { bloomType = 'Normal'; possibleStarts = [18, 19]; }
                else { bloomType = 'Late'; possibleStarts = [20, 21, 22]; }
            }
        }

        const MIN_PHASE_DEV = 15;
        const bloomWinMin = possibleStarts ? possibleStarts[0] : Infinity;
        const bloomWinMax = possibleStarts ? possibleStarts[possibleStarts.length - 1] + 3 : -Infinity;
        let maxPhaseDevSkInWindow = 0;
        for (const r of allReports) {
            const bt = r.bloom_status_txt || '';
            if (!bt || bt.includes('Not bloomed') || bt === 'Bloomed' || bt === '-') continue;
            const rAge = parseFloat(r.report_age) || 0;
            if (rAge < bloomWinMin || rAge >= bloomWinMax) continue;
            const devSk = getDevSkill(r);
            if (devSk > maxPhaseDevSkInWindow) maxPhaseDevSkInWindow = devSk;
        }
        const phaseThreshold = maxPhaseDevSkInWindow >= MIN_PHASE_DEV ? MIN_PHASE_DEV : maxPhaseDevSkInWindow;

        let bestPhase = null;
        for (const r of allReports) {
            const bt = r.bloom_status_txt || '';
            if (!bt || bt.includes('Not bloomed') || bt === 'Bloomed' || bt === '-') continue;
            const rAge = parseFloat(r.report_age) || 0;
            const rFloor = Math.floor(rAge);
            const devSk = getDevSkill(r);
            let candidateStart = null;
            if (bt.includes('Starting') && !bt.includes('Not')) candidateStart = rFloor;
            else if (bt.toLowerCase().includes('middle')) candidateStart = rFloor - 1;
            else if (bt.toLowerCase().includes('late bloom')) candidateStart = rFloor - 2;
            if (candidateStart === null) continue;
            const inWindow = possibleStarts && rAge >= bloomWinMin && rAge < bloomWinMax;
            if (inWindow && devSk < phaseThreshold) continue;
            if (possibleStarts && !possibleStarts.includes(candidateStart)) continue;
            if (!bestPhase || devSk > bestPhase.devSkill) {
                bestPhase = { knownStart: candidateStart, devSkill: devSk };
            }
        }

        if (bestPhase) {
            let dominated = false;
            for (const r of allReports) {
                const bt = r.bloom_status_txt || '';
                if (!bt.includes('Not bloomed')) continue;
                const rAge = parseFloat(r.report_age) || 0;
                const devSk = getDevSkill(r);
                if (rAge >= bestPhase.knownStart && devSk > bestPhase.devSkill) { dominated = true; break; }
            }
            if (!dominated) return statusFrom(bestPhase.knownStart);
        }

        if (seenBloomed) return { text: 'Bloomed', certain: true, range: null };
        if (!possibleStarts) return { text: '-', certain: false, range: null };

        for (const r of allReports) {
            const bt = r.bloom_status_txt || '';
            if (!bt.includes('Not bloomed')) continue;
            const rAge = parseFloat(r.report_age) || 0;
            possibleStarts = possibleStarts.filter(s => s > rAge);
        }
        if (possibleStarts.length === 0) return { text: '-', certain: false, range: null };
        if (possibleStarts.length === 1) return statusFrom(possibleStarts[0]);

        const rangeStr = possibleStarts.map(s => `${s}.0\u2013${s + 2}.11`).join(' or ');
        const phases = possibleStarts.map(s => phaseFor(s));
        const unique = [...new Set(phases)];
        const notBloomedLabel = bloomType ? `Not bloomed (${bloomType})` : 'Not bloomed';
        if (unique.length === 1) {
            if (unique[0] === 'not') return { text: notBloomedLabel, certain: true, range: rangeStr };
            if (unique[0] === 'done') return { text: 'Bloomed', certain: true, range: null };
            return { text: PHASE_LABEL[unique[0]], certain: true, range: rangeStr };
        }
        const allBlooming = phases.every(p => p !== 'not' && p !== 'done');
        if (allBlooming) {
            const labels = unique.map(p => PHASE_LABEL[p]).join(' or ');
            return { text: 'Blooming', certain: true, phases: labels, range: rangeStr };
        }
        let parts = [];
        if (phases.includes('not')) parts.push(notBloomedLabel);
        const bloomPhases = unique.filter(p => p !== 'not' && p !== 'done');
        if (bloomPhases.length) parts.push('Blooming (' + bloomPhases.map(p => PHASE_LABEL[p]).join('/') + ')');
        if (phases.includes('done')) parts.push('Bloomed');
        return { text: parts.join(' or '), certain: false, range: rangeStr };
    };

    /**
     * render(container, props)
     *
     * @param {Element}  container          - DOM element to render the card into.
     * @param {object}   props
     * @param {object}   props.scoutData    - Raw data from TmApi.fetchPlayerInfo(id, 'scout').
     * @param {object}   props.player       - Raw tooltip player object (p from fetchPlayerInfo).
     */
    const render = (container, { scoutData = {}, player = null } = {}) => {
        const isGK = player.isGK;
        const age = player && player.age != null ? player.age + (player.months || 0) / 12 : null;
        const recSort = player && player.rec_sort != null ? parseFloat(player.rec_sort) : null;

        const skills = player.skills.filter(skill => isGK ? skill.isGK : skill.isOutfield);
        const data = scoutData;
        const hasScouts = data && data.reports && data.reports.length && data.scouts;
        let scouts = {}, regular = [];
        let potPick = null, bloomPick = null, phyPick = null, tacPick = null, tecPick = null, psyPick = null;
        if (hasScouts) {
            scouts = data.scouts;
            regular = data.reports.filter(r => r.scout_name !== 'YD' && r.scoutid !== '0');
            if (regular.length) {
                const scoutSkill = (r, field) => { const s = Object.values(scouts).find(s => String(s.id) === String(r.scoutid)); return s ? (parseInt(s[field]) || 0) : 0; };
                const pickBest = (field) => { let best = null, bs = -1, bd = ''; for (const r of regular) { const sk = scoutSkill(r, field); const d = r.done || ''; if (sk > bs || (sk === bs && d > bd)) { best = r; bs = sk; bd = d; } } return best ? { report: best, conf: confPct(bs) } : null; };
                const pickBestPot = () => { let best = null, bs = -1, bd = ''; for (const r of regular) { const s = Object.values(scouts).find(s => String(s.id) === String(r.scoutid)); const rAge = parseInt(r.report_age) || 0; let sk = 0; if (s) { const senYth = rAge < 20 ? (parseInt(s.youths) || 0) : (parseInt(s.seniors) || 0); const dev = parseInt(s.development) || 0; sk = Math.min(senYth, dev); } const d = r.done || ''; if (sk > bs || (sk === bs && d > bd)) { best = r; bs = sk; bd = d; } } return best ? { report: best, conf: confPct(bs) } : null; };
                potPick = pickBestPot(); bloomPick = pickBest('development'); phyPick = pickBest('physical');
                tacPick = pickBest('tactical'); tecPick = pickBest('technical'); psyPick = pickBest('psychology');
            }
        }

        if (!regular.length && !skills.length) return;

        const skillCategories = [
            { label: 'Physique',  category: 'Physical',  key: 'phy', pick: phyPick, peakField: 'peak_phy_txt' },
            { label: 'Tactical',  category: 'Tactical',  key: 'tac', pick: tacPick, peakField: 'peak_tac_txt' },
            { label: 'Technical', category: 'Technical', key: 'tec', pick: tecPick, peakField: 'peak_tec_txt' },
        ].map(({ label, category, key, pick, peakField }) => {
            const value = skills.filter(s => s.category === category).reduce((sum, s) => sum + (s.value || 0), 0).toFixed(2);
            const peakArr = (isGK ? PEAK_SUMS.gk : PEAK_SUMS.outfield)[key];
            const text = pick ? cleanPeakText(pick.report[peakField]) : '';
            const conf = pick ? pick.conf : null;
            return { label, value, pick, peakArr, text, conf };
        });

        const pot = potPick ? parseInt(potPick.report.old_pot) || 0 : 0;
        const potStarsVal = potPick ? (parseFloat(potPick.report.potential) || 0) / 2 : 0;
        const rec = potPick ? parseFloat(potPick.report.rec) || 0 : 0;
        const bloomResult = getCurrentBloomStatus(regular, scouts, age);
        const bloomTxt = bloomResult.text || '-';
        const devTxt = bloomPick ? bloomPick.report.dev_status : '-';
        let specVal = 0, specLabel = 'None', specConf = null;
        for (const { pick } of skillCategories) { if (pick) { const s = parseInt(pick.report.specialist) || 0; if (s > 0) { specVal = s; specLabel = SPECIALTIES[s] || 'None'; specConf = pick.conf; break; } } }

        const cb = (conf) => {
            if (conf === null) return '';
            if (conf === 0) return '<span class="tmbe-conf text-xs font-bold rounded-sm ml-1 py-0 px-1" style="background:rgba(90,122,72,.15);color:#5a7a48">?</span>';
            let bg, clr;
            if (conf >= 90) { bg = 'rgba(108,192,64,.15)'; clr = '#6cc040'; }
            else if (conf >= 70) { bg = 'rgba(251,191,36,.12)'; clr = '#fbbf24'; }
            else { bg = 'rgba(248,113,113,.1)'; clr = '#f87171'; }
            return `<span class="tmbe-conf text-xs font-bold rounded-sm ml-1 py-0 px-1" style="background:${bg};color:${clr}">${conf}%</span>`;
        };

        /* Peak bars with reach */
        let peaksH = '';
        for (const p of skillCategories) {
            if (!p.peakArr) continue;
            const maxPeakSum = p.peakArr[p.peakArr.length - 1];
            const tier = extractTier(p.text);
            const curSum = p.value || null;

            if (tier && curSum !== null) {
                const peakSum = p.peakArr[tier.val - 1];
                const peakPct = (peakSum / maxPeakSum) * 100;
                const curPct = (curSum / maxPeakSum) * 100;
                const c = barColor(tier.val, tier.max);
                const rPct = Math.round(curSum / peakSum * 100); const rC = reachColor(rPct);
                const mPct = Math.round(curSum / maxPeakSum * 100); const mC = reachColor(mPct);
                const reachLbl = `<tm-row data-cls="tmbe-peak-reach my-2 text-xs font-bold" data-justify="space-between" data-gap="12px"><tm-row data-gap="4px"><span class="tmbe-reach-tag text-xs font-semibold uppercase">Peak</span><span style="color:${rC}">${rPct}%</span><span class="text-xs" style="color:#90b878;font-weight:400">(${curSum}/${peakSum})</span></tm-row><tm-row data-gap="4px"><span class="tmbe-reach-tag text-xs font-semibold uppercase">Max</span><span style="color:${mC}">${mPct}%</span><span class="text-xs" style="color:#90b878;font-weight:400">(${curSum}/${maxPeakSum})</span></tm-row></tm-row>`;
                peaksH += `<div class="tmbe-item tmbe-peak-item rounded-sm py-2 px-2"><tm-row data-justify="space-between"><span class="tmbe-lbl text-xs font-semibold uppercase">${p.label}</span><span class="tmbe-val text-sm font-bold" style="color:${c}">${tier.val}/${tier.max}${p.conf !== null ? cb(p.conf) : ''}</span></tm-row>${reachLbl}<div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${peakPct}%;background:${c};opacity:0.35"></div><div class="tmbe-bar-fill-reach" style="width:${curPct}%;background:${rC}"></div></div></div>`;
            } else if (curSum !== null) {
                const mPct = Math.round(curSum / maxPeakSum * 100);
                const curPct = (curSum / maxPeakSum) * 100;
                const mC = reachColor(mPct);
                const reachLbl = `<tm-row data-cls="tmbe-peak-reach text-xs font-bold" data-justify="space-between" data-gap="12px"><tm-row data-gap="4px"><span class="tmbe-reach-tag text-xs font-semibold uppercase">Max</span><span style="color:${mC}">${mPct}%</span><span class="text-xs" style="color:#90b878;font-weight:400">(${curSum}/${maxPeakSum})</span></tm-row></tm-row>`;
                peaksH += `<div class="tmbe-item tmbe-peak-item rounded-sm py-2 px-2"><tm-row data-justify="space-between"><span class="tmbe-lbl text-xs font-semibold uppercase">${p.label}</span><span class="tmbe-val text-sm font-bold" style="color:#5a7a48">?</span></tm-row>${reachLbl}<div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${curPct}%;background:${mC}"></div></div></div>`;
            } else if (tier) {
                const peakSum = p.peakArr[tier.val - 1];
                const peakPct = (peakSum / maxPeakSum) * 100;
                const c = barColor(tier.val, tier.max);
                peaksH += `<div class="tmbe-item tmbe-peak-item rounded-sm py-2 px-2"><tm-row data-justify="space-between"><span class="tmbe-lbl text-xs font-semibold uppercase">${p.label}</span><span class="tmbe-val text-sm font-bold" style="color:${c}">${tier.val}/${tier.max}${p.conf !== null ? cb(p.conf) : ''}</span></tm-row><div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${peakPct}%;background:${c}"></div></div></div>`;
            }
        }

        /* Personality */
        let persH = '';
        if (psyPick) {
            const pers = [{ label: 'Leadership', value: parseInt(psyPick.report.charisma) || 0 }, { label: 'Professionalism', value: parseInt(psyPick.report.professionalism) || 0 }, { label: 'Aggression', value: parseInt(psyPick.report.aggression) || 0 }];
            for (const p of pers) { const pct = (p.value / 20) * 100; const c = skillColor(p.value); persH += `<div class="tmbe-bar-row"><tm-row data-justify="space-between"><span class="tmbe-bar-label text-sm font-semibold">${p.label}</span><tm-row data-gap="8px"><span class="tmbe-bar-val text-sm font-bold" style="color:${c}">${p.value}</span>${cb(psyPick.conf)}</tm-row></tm-row><div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${pct}%;background:${c}"></div></div></div>`; }
        } else if (!hasScouts) {
            for (const lbl of ['Leadership', 'Professionalism', 'Aggression']) {
                persH += `<tm-stat data-label="${lbl}" data-value="?" data-variant="muted"></tm-stat>`;
            }
        }

        const currentRating = recSort !== null ? recSort : rec;
        const hasData = regular.length > 0;

        let h = `<tm-card data-title="Best Estimate" data-icon="★" data-head-ref="head">`;
        h += `<div class="tmbe-grid">`;
        h += `<tm-stat data-label="Potential" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span style="color:${hasData ? potColor(pot) : '#5a7a48'}">${hasData ? pot : '?'}${potPick ? cb(potPick.conf) : ''}</span></tm-stat>`;

        const beBloomClr = hasData ? (bloomResult.certain ? (bloomResult.phases ? '#80e048' : bloomColor(bloomTxt)) : '#fbbf24') : '#5a7a48';
        const beBloomTxt = hasData ? (!bloomResult.certain && !bloomResult.phases ? (bloomResult.text || bloomResult.range || '-') : bloomTxt) : '?';
        let beBloomSub = '';
        if (hasData && bloomResult.phases) beBloomSub += `<span style="display:block;font-size:9px;color:#90b878;font-weight:600;margin-top:1px">${bloomResult.phases}</span>`;
        if (hasData && bloomResult.range && bloomTxt !== 'Bloomed') beBloomSub += `<span style="display:block;font-size:9px;color:#6a9a58;font-weight:600;margin-top:1px">${bloomResult.range}</span>`;
        h += `<tm-stat data-label="Bloom" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span style="color:${beBloomClr}">${beBloomTxt}${bloomPick ? cb(bloomPick.conf) : ''}${beBloomSub}</span></tm-stat>`;
        h += `<tm-stat data-label="Development" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span style="color:${hasData ? '#e8f5d8' : '#5a7a48'}">${hasData ? devTxt : '?'}${bloomPick ? cb(bloomPick.conf) : ''}</span></tm-stat>`;
        h += `<tm-stat data-label="Specialty" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span style="color:${hasData ? (specVal > 0 ? '#fbbf24' : '#5a7a48') : '#5a7a48'}">${hasData ? specLabel : '?'}${specConf !== null ? cb(specConf) : ''}</span></tm-stat>`;
        if (peaksH) h += `<tm-divider data-label="Peak Development"></tm-divider>${peaksH}`;
        h += `</div>`;
        if (persH) h += `<tm-divider data-label="Personality"></tm-divider>${persH}`;
        h += `</tm-card>`;

        const refs = TmUI.render(container, h);
        if (refs.head) {
            const starsSpan = document.createElement('span');
            starsSpan.className = 'tmbe-title-stars text-xl';
            starsSpan.innerHTML = combinedStarsHtml(currentRating, potStarsVal);
            refs.head.appendChild(starsSpan);
        }
    };

    window.TmBestEstimate = { render };

})();



// ─── components/player/tm-tabs-mod.js ───────────────────────

// ==UserScript==
// @name         TM Tabs Mod
// ==/UserScript==
'use strict';

window.TmTabsMod = (() => {
    const CSS = `
#tmpe-container {
    margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.tmpe-tabs-bar {
    display: flex; background: #274a18;
    border: 1px solid #3d6828; border-bottom: none;
    border-radius: 8px 8px 0 0; overflow: hidden;
}
.tmpe-main-tab {
    flex: 1; padding: 8px 12px; text-align: center; font-size: 12px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.5px; color: #90b878; cursor: pointer;
    border: none; border-bottom: 2px solid transparent; transition: all 0.15s;
    background: transparent; font-family: inherit;
    -webkit-appearance: none; appearance: none;
    display: flex; align-items: center; justify-content: center; gap: 6px;
}
.tmpe-main-tab .tmpe-icon { font-size: 14px; line-height: 1; }
.tmpe-main-tab:hover { color: #c8e0b4; background: #305820; }
.tmpe-main-tab.active { color: #e8f5d8; border-bottom-color: #6cc040; background: #305820; }
.tmpe-panels {
    border: 1px solid #3d6828; border-top: none;
    border-radius: 0 0 8px 8px;
    padding: 0; min-height: 120px;
    background: #1c3410;
}
.tmpe-panel {
    animation: tmpe-fadeIn 0.25s ease-out;
    padding: 8px;
}
@keyframes tmpe-fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
    (() => { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); })();

    const TABS_DEF = [
        { key: 'history', label: 'History', mod: TmHistoryMod },
        { key: 'scout', label: 'Scout', mod: TmScoutMod },
        { key: 'training', label: 'Training', mod: TmTrainingMod },
        { key: 'graphs', label: 'Graphs', mod: TmGraphsMod },
    ];
    const TAB_ICONS = { history: '📋', scout: '🔍', training: '⚙', graphs: '📊' };

    const dataLoaded = {};
    let player = null;
    let _getOwnClubIds = () => [];

    const _isGK = () => String(player?.favposition || '').split(',')[0].trim().toLowerCase() === 'gk';
    const _playerASI = () => (player?.asi > 0) ? player.asi : 0;
    const _playerClubId = () => player?.club_id ?? null;

    const getProps = () => {
        const ownIds = _getOwnClubIds();
        const clubId = String(_playerClubId() ?? '');
        return {
            isGK: _isGK(),
            playerId: player?.id ?? null,
            playerASI: _playerASI(),
            ownClubIds: ownIds,
            isOwnPlayer: !!clubId && ownIds.includes(clubId),
        };
    };

    /* Build a TmTrainingMod-compatible data object from a squad player entry.
       squad player has: training (type string), training_custom (6-char dots string), favposition */
    const _adaptSquadTraining = (sp) => {
        const gk = String(sp.favposition || '').split(',')[0].trim().toLowerCase() === 'gk';
        if (gk) return { custom: { gk: true } };
        const customStr = sp.training_custom || '';
        const isCustom = customStr.length === 6;
        const custom = {};
        for (let i = 0; i < 6; i++) {
            custom[`team${i + 1}`] = { points: isCustom ? (parseInt(customStr[i]) || 0) : 0, skills: [], label: `Team ${i + 1}` };
        }
        custom.points_spend = 0;
        return { custom: { gk: false, custom_on: isCustom, team: String(sp.training || '3'), custom } };
    };

    const _ERR_HTML = (msg) => TmUI.error(msg);

    /* Fetch training for own player (full edit) or foreign player (read-only via squad) */
    const _fetchTraining = (panel) => {
        const ownIds = _getOwnClubIds();
        const clubId = String(_playerClubId() ?? '');
        const isOwn = !!clubId && ownIds.includes(clubId);

        const playerId = player?.id ?? null;
        if (isOwn) {
            TmApi.fetchPlayerInfo(playerId, 'training').then(data => {
                if (!data) { panel.innerHTML = _ERR_HTML('Failed to load data'); return; }
                dataLoaded['training'] = true;
                TmTrainingMod.render(panel, data, getProps());
            });
        } else {
            if (!clubId) { panel.innerHTML = _ERR_HTML('Cannot load training — club not yet loaded, try again'); return; }
            TmApi.fetchSquadRaw(clubId).then(data => {
                const post = data?.post ?? {};
                const sp = post[String(playerId)];
                if (!sp) { panel.innerHTML = _ERR_HTML('Player not found in squad data'); return; }
                dataLoaded['training'] = true;
                TmTrainingMod.render(panel, _adaptSquadTraining(sp), { playerId, readOnly: true });
            });
        }
    };

    const switchTab = (key) => {
        document.querySelectorAll('.tmpe-main-tab').forEach(b =>
            b.classList.toggle('active', b.dataset.tab === key));
        document.querySelectorAll('.tmpe-panel').forEach(p =>
            p.style.display = p.dataset.tab === key ? '' : 'none');

        if (dataLoaded[key]) return;

        const panel = document.querySelector(`.tmpe-panel[data-tab="${key}"]`);
        if (!panel) return;

        panel.innerHTML = TmUI.loading();

        if (key === 'training') { _fetchTraining(panel); return; }

        TmApi.fetchPlayerInfo(player?.id ?? null, key).then(data => {
            if (!data) {
                panel.innerHTML = TmUI.error('Failed to load data');
                return;
            }
            dataLoaded[key] = true;
            const tab = TABS_DEF.find(t => t.key === key);
            if (tab) tab.mod.render(panel, data, getProps());
        });
    };

    const isLoaded = (key) => !!dataLoaded[key];

    let resizeTimer = null;
    let initRetries = 0;
    let _cssInjector = null;

    const _tryMount = () => {
        const tabsContent = document.querySelector('.tabs_content');
        if (!tabsContent) {
            if (initRetries++ < 50) setTimeout(_tryMount, 200);
            return;
        }

        _cssInjector?.();

        const container = document.createElement('div');
        container.id = 'tmpe-container';

        const bar = document.createElement('div');
        bar.className = 'tmpe-tabs-bar';
        TABS_DEF.forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'tmpe-main-tab';
            btn.dataset.tab = t.key;
            btn.innerHTML = `<span class="tmpe-icon">${TAB_ICONS[t.key] || ''}</span>${t.label}`;
            btn.addEventListener('click', () => switchTab(t.key));
            bar.appendChild(btn);
        });
        container.appendChild(bar);

        const panels = document.createElement('div');
        panels.className = 'tmpe-panels';
        TABS_DEF.forEach(t => {
            const p = document.createElement('div');
            p.className = 'tmpe-panel';
            p.dataset.tab = t.key;
            p.style.display = 'none';
            panels.appendChild(p);
        });
        container.appendChild(panels);

        tabsContent.parentNode.insertBefore(container, tabsContent);

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => TmGraphsMod.reRender(), 300);
        });

        switchTab('history');
    };

    const mount = ({ player: p, getOwnClubIds, injectCSS }) => {
        player = p;
        _getOwnClubIds = getOwnClubIds;
        _cssInjector = injectCSS;
        initRetries = 0;
        _tryMount();
    };

    return { mount, isLoaded, switchTab };
})();



// ─── components/league/tm-league-styles.js ──────────────────

// tm-league-styles.js - League page CSS injection
// Depends on: nothing
// Exposed as: window.TmLeagueStyles = { inject }
(function () {
    'use strict';

    const inject = () => {
        if (document.getElementById('tsa-league-style')) return;
        const style = document.createElement('style');
        style.id = 'tsa-league-style';
        style.textContent = `
            .tsa-controls {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border-bottom: 1px solid rgba(61,104,40,0.3);
                font-size: 12px;
                color: #c8e0b4;
            }
            .tsa-input {
                width: 44px;
                padding: 3px 4px;
                text-align: center;
                background: rgba(0,0,0,0.25);
                border: 1px solid rgba(61,104,40,0.45);
                border-radius: 4px;
                color: #e8f5d8;
                font-size: 12px;
                outline: none;
            }
            .tsa-input:focus { border-color: #6cc040; }
            .tsa-btn {
                padding: 4px 14px;
                background: #3d6828;
                border: none;
                border-radius: 5px;
                color: #e8f5d8;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                transition: background 0.15s;
            }
            .tsa-btn:hover { background: #4d8030; }
            .tsa-btn:disabled { opacity: 0.3; cursor: default; }
            .tsa-progress {
                font-size: 11px;
                color: #6a9a58;
                margin-left: auto;
            }
            .tsa-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
            }
            .tsa-table thead tr { background: rgba(0,0,0,0.2); border-bottom: 1px solid #2a4a1c; }
            .tsa-table th {
                padding: 6px 8px;
                text-align: right;
                font-weight: 700;
                font-size: 10px;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                color: #6a9a58;
                background: #162e0e;
                border-bottom: 1px solid #2a4a1c;
                cursor: pointer;
                user-select: none;
                transition: color 0.15s;
                white-space: nowrap;
            }
            .tsa-table th:hover { color: #c8e0b4; background: #243d18; }
            .tsa-table th.tsa-left { text-align: left; }
            .tsa-table th.tsa-active { color: #6cc040; }
            .tsa-table td {
                padding: 5px 8px;
                text-align: right;
                border-bottom: 1px solid rgba(42,74,28,0.4);
                font-variant-numeric: tabular-nums;
                color: #c8e0b4;
            }
            .tsa-table td.tsa-left { text-align: left; }
            .tsa-table tr.tsa-even { background: #1c3410; }
            .tsa-table tr.tsa-odd  { background: #162e0e; }
            .tsa-table tbody tr:hover { background: #243d18 !important; cursor: pointer; }
            .tsa-rank { color: #6a9a58; font-size: 11px; }
            .tsa-club { color: #c8e0b4; font-weight: 500; }

            /* ── Sidebar restyling ── */
            .column1_a .box, .column3_a .box {
                background: #1c3410 !important;
                border: 1px solid #3d6828 !important;
                border-radius: 8px !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
                overflow: hidden !important;
                margin-bottom: 8px !important;
            }
            .column1_a .box h2, .column3_a .box h2 {
                background: transparent !important;
                color: #6a9a58 !important;
                font-size: 10px !important;
                font-weight: 700 !important;
                letter-spacing: 0.5px !important;
                text-transform: uppercase !important;
                padding: 8px 12px 6px !important;
                border-bottom: 1px solid rgba(61,104,40,0.3) !important;
                margin: 0 !important;
            }
            .column1_a .box table, .column3_a .box table {
                background: transparent !important;
            }
            .column1_a .box td, .column1_a .box th,
            .column3_a .box td, .column3_a .box th {
                color: #c8e0b4 !important;
                border-color: rgba(42,74,28,0.4) !important;
                font-size: 12px !important;
            }
            .column1_a .box tr:nth-child(even) td,
            .column3_a .box tr:nth-child(even) td { background: #1c3410 !important; }
            .column1_a .box tr:nth-child(odd) td,
            .column3_a .box tr:nth-child(odd) td  { background: #162e0e !important; }
            .column1_a .box a, .column3_a .box a { color: #c8e0b4 !important; }
            .column1_a .box a:hover, .column3_a .box a:hover { color: #e8f5d8 !important; }
            /* Hide the native overall_table container */
            #overall_table_wrapper, #tsa-standings-native-wrap { display: none !important; }
            /* Layout */
            div.main_center { width: 1120px !important; max-width: 1120px !important;background-color: transparent !important; }
            .column2_a { width: 700px !important; margin-left: 0 !important; margin-right: 8px !important; }
            .column3_a, .column3 { width: 400px !important; }
            .column3_a .box{display: none !important;}
            .column1_a, .column1 { display: none !important; }
            /* Navigation tabs — player script style */
            .tsa-nav-tabs {
                display: flex;
                background: #274a18;
                border: 1px solid #3d6828;
                border-radius: 8px 8px 0 0;
                overflow: hidden;
                margin-bottom: 4px;
            }
            .tsa-tab {
                flex: 1;
                padding: 8px 12px;
                text-align: center;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #90b878;
                border: none;
                border-bottom: 2px solid transparent;
                transition: all 0.15s;
                background: transparent;
                text-decoration: none !important;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                white-space: nowrap;
            }
            .tsa-tab-icon { font-size: 14px; line-height: 1; }
            .tsa-tab:hover { color: #c8e0b4; background: #305820; }
            .tsa-tab.tsa-tab-active { color: #e8f5d8; border-bottom-color: #6cc040; background: #305820; }

            /* ── History mode banner ── */
            .tsa-history-banner {
                display: flex; align-items: center; gap: 8px;
                padding: 5px 10px; font-size: 10px; font-weight: 700;
                color: #fbbf24; background: rgba(251,191,36,0.08);
                border-bottom: 1px solid rgba(251,191,36,0.25);
            }
            .tsa-history-live-btn {
                background: none; border: 1px solid rgba(251,191,36,0.4);
                border-radius: 3px; color: #fbbf24; font-size: 10px;
                font-weight: 700; cursor: pointer; padding: 1px 6px;
                margin-left: auto;
            }
            .tsa-history-live-btn:hover { background: rgba(251,191,36,0.15); }

            /* ── Feed ── */
            .tsa-feed-list { display: flex; flex-direction: column; }
            .tsa-feed-entry {
                display: flex; gap: 8px; padding: 8px 10px;
                border-bottom: 1px solid rgba(61,104,40,0.2);
            }
            .tsa-feed-entry:last-child { border-bottom: none; }
            .tsa-feed-sub {
                padding: 5px 8px; background: rgba(0,0,0,0.15);
                border-left: 2px solid rgba(61,104,40,0.3);
                margin: 2px 0;
            }
            .tsa-feed-logo { flex-shrink: 0; width: 25px; }
            .tsa-feed-icon { width: 25px; height: 25px; object-fit: contain; border-radius: 3px; }
            .tsa-feed-body { flex: 1; min-width: 0; }
            .tsa-feed-text { font-size: 11px; color: #c8e0b4; line-height: 1.5; }
            .tsa-feed-club { color: #6cc040; text-decoration: none; font-weight: 600; }
            .tsa-feed-club:hover { color: #e8f8d8; }
            .tsa-feed-player { color: #a0d878; text-decoration: none; }
            .tsa-feed-player:hover { color: #e8f8d8; }
            .tsa-feed-link { color: #6a9a58; text-decoration: none; }
            .tsa-feed-link:hover { color: #c8e0b4; }
            .tsa-feed-money { color: #fbbf24; font-weight: 700; }
            .tsa-feed-stars { color: #6cc040; letter-spacing: 1px; }
            .tsa-feed-time { color: #3d6828; font-size: 10px; margin-left: 6px; white-space: nowrap; }
            .tsa-feed-actions { display: flex; gap: 10px; margin-top: 3px; }
            .tsa-feed-like-btn {
                font-size: 11px; color: #4a7038; cursor: pointer;
                display: flex; align-items: center; gap: 2px;
                transition: color 0.12s; user-select: none;
            }
            .tsa-feed-like-btn:hover { color: #6cc040; }
            .tsa-feed-like-btn[data-liked="1"] { color: #ef4444; }
            .tsa-feed-subs { margin-top: 3px; }
            .tsa-feed-more {
                font-size: 10px; color: #4a7038; cursor: pointer;
                margin-top: 4px; padding: 2px 0; user-select: none;
            }
            .tsa-feed-more:hover { color: #6cc040; }

            /* ── Native #feed reskin ── */
            #feed {
                background: rgba(8,18,4,0.88) !important;
                color: #c8e0b4 !important; 
            }
            #feed .feed_top {
                background: rgba(0,0,0,0.35) !important;
                border-bottom: 1px solid rgba(61,104,40,0.3) !important;
                padding: 5px 10px !important; color: #3d6828 !important; font-size: 11px !important;
            }
            #feed .feed_post { background: transparent !important; padding: 8px 10px !important; }
            #feed .feed_post.border_bottom { border-bottom: 1px solid rgba(61,104,40,0.18) !important; }
            #feed .feed_post:hover { background: rgba(61,104,40,0.05) !important; }
            #feed .post_text { font-size: 13px !important; line-height: 1.5 !important; color: #fff !important; }
            #feed .post_text a, #feed .post_text .nowrap a { color: #6cc040 !important; text-decoration: none !important; }
            #feed .post_text a:hover { color: #d0f0b0 !important; }
            #feed .post_text .subtle { color: #ddd !important; font-size: 10px !important; }
            #feed .feed_like { font-size: 11px !important; font-weight: 700 !important; color: #fff !important; }
            #feed .feed_like.like_hidden { visibility: hidden !important; }
            #feed .hover_options { font-size: 10px !important; }
            #feed .hover_options .faux_link { color: #4a7038 !important; }
            #feed .hover_options .faux_link:hover { color: #6cc040 !important; }
            #feed .hover_options .like_icon { opacity: 0.55 !important; cursor: pointer !important; filter: sepia(1) saturate(2) hue-rotate(60deg) !important; }
            #feed .hover_options .like_icon:hover { opacity: 1 !important; }
            #feed .comments { margin-top: 5px !important; }
            #feed .comment_text { font-size: 12px !important; color: #fff !important; }
            #feed .comment_text a { color: #5a9040 !important; text-decoration: none !important; }
            #feed .comment_text a:hover { color: #c8e0b4 !important; }
            #feed .comment_like.positive { background-color: #070 !important; font-size: 10px !important; }
            #feed .comment_time { color: #ccc !important; font-size: 10px !important; }
            #feed .comment_like.like_icon { opacity: 0.4 !important; cursor: pointer !important; }
            #feed .comment_like.like_icon:hover { opacity: 0.9 !important; }
            #feed .hidden_comments_link .faux_link { color: #ccc !important; font-size: 10px !important; }
            #feed .hidden_comments_link .faux_link:hover { color: #6cc040 !important; }
            #feed .similar_stories_show, #feed .similar_stories_hide {
                color: #a5aca1 !important;font-size: 12px !important;
            }
            #feed .similar_stories_show:hover, #feed .similar_stories_hide:hover { color: #6a9a58 !important; }
            #feed .textarea_placehold {
                color: #3d6828 !important; font-size: 11px !important; cursor: text !important;
                background: rgba(0,0,0,0.25) !important; border: 1px solid rgba(61,104,40,0.3) !important;
                border-radius: 3px !important; padding: 3px 7px !important;
            }
            #feed .feed_comment_box textarea {
                background: rgba(0,0,0,0.35) !important; color: #c8e0b4 !important;
                border: 1px solid rgba(61,104,40,0.45) !important; border-radius: 3px !important;
                font-size: 11px !important;
            }
            #feed .comment_button .button_border {
                background: rgba(61,104,40,0.35) !important; color: #90b878 !important;
                border: 1px solid rgba(61,104,40,0.5) !important; font-size: 11px !important;
                padding: 3px 10px !important; border-radius: 3px !important; cursor: pointer !important;
            }
            #feed .comment_button .button_border:hover { background: rgba(108,192,64,0.3) !important; color: #c8e0b4 !important; }
            #feed .post_options_button > div { color: #2d4820 !important; font-size: 16px !important; }
            #feed .post_options {
                background: #0c1a07 !important; border: 1px solid rgba(61,104,40,0.5) !important;
                border-radius: 4px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.6) !important;
            }
            #feed .post_option { color: #5a8a48 !important; font-size: 11px !important; padding: 5px 12px !important; }
            #feed .post_option:hover { background: rgba(61,104,40,0.3) !important; color: #c8e0b4 !important; }

            /* ── Feed box outer shell ── */
            .box:has(#feed) {
                background: rgba(8,18,4,0.92) !important;
                border: 1px solid rgba(61,104,40,0.45) !important;
                border-radius: 6px !important; overflow: hidden !important;
            }
            .box:has(#feed) .box_shadow { display: none !important; }
            .tsa-feed-head {
                background: rgba(0,0,0,0.5);
                border-bottom: 1px solid rgba(61,104,40,0.3);
                padding: 7px 12px;
            }
            .tsa-feed-head h2 {
                color: #6cc040; font-size: 13px; margin: 0;
            }
            .box:has(#feed) .box_footer {
            display: none !important;
            }
            .tsa-feed-tabs-outer { background: transparent; margin: 0; padding: 0; }
            .tsa-feed-content { background: transparent; }
            .tsa-feed-tabs {
                display: flex;
                border-bottom: 1px solid rgba(61,104,40,0.4);
                background: rgba(0,0,0,0.12);
                margin: 0; padding: 0;
            }
            .tsa-feed-tabs > div {
                flex: 1;
                padding: 6px 10px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                color: #6a9a58;
                border: none;
                border-bottom: 2px solid transparent;
                background: transparent;
                cursor: pointer;
                transition: all 0.15s;
                text-align: center;
                background: rgba(8,18,4,0.88) !important;
            }
            .tsa-feed-tabs > div > div { pointer-events: none; }
            .tsa-feed-tabs > div:hover { color: #c8e0b4; background: rgba(255,255,255,0.04); }
            .tsa-feed-tabs > div.active_tab {
                color: #e8f5d8; border-bottom-color: #6cc040;
                background: rgba(108,192,64,0.07);
            }

            /* ── Press Announcements panel ── */
            #league_pa, #feed_div { background: transparent !important; }
            #feed_div .feed { list-style: none !important; margin: 0 !important; padding: 0 !important; }
            #feed_div .feed > li {
                padding: 6px 10px !important; font-size: 11px !important;
                border-bottom: 1px solid rgba(61,104,40,0.15) !important;
                background: #1c3410 !important;
            }
            #feed_div .feed > li:hover { background: rgba(61,104,40,0.05) !important; }
            #feed_div .icon_box {
                color: #b8d0a0 !important; font-size: 11px !important;
                line-height: 1.5 !important; background-color: transparent !important;
            }
            #feed_div .icon_box a { color: #6cc040 !important; text-decoration: none !important; }
            #feed_div .icon_box a:hover { color: #d0f0b0 !important; }
            #feed_div .icon_box span { color: #3d6828 !important; font-size: 10px !important; }
            #feed_div .icon_box img {
                filter: sepia(1) saturate(2) hue-rotate(60deg) brightness(0.9) !important;
                width: 14px !important; vertical-align: middle !important;
            }
            #feed_div .add_comment a {
                color: #3d5828 !important; font-size: 10px !important; text-decoration: none !important;
                background: rgba(61,104,40,0.2) !important; border-radius: 3px !important;
                padding: 1px 6px !important;
            }
            #feed_div .add_comment a:hover { color: #6cc040 !important; background: rgba(61,104,40,0.35) !important; }
            #feed_div .feed > li.view_more {
                text-align: center !important; color: #4a7038 !important;
                cursor: pointer !important; border-bottom: none !important; padding: 8px !important;
            }
            #feed_div .feed > li.view_more:hover { color: #6cc040 !important; }
            #press_link .button_border {
                background: rgba(61,104,40,0.3) !important; color: #90b878 !important;
                border: 1px solid rgba(61,104,40,0.5) !important; border-radius: 3px !important;
                font-size: 11px !important; padding: 4px 12px !important; cursor: pointer !important;
            }
            #press_link .button_border:hover { background: rgba(108,192,64,0.3) !important; color: #c8e0b4 !important; }

            /* ── League feed extras ── */
            #feed {margin-top: 0 !important;margin: 0 !important;}
            #feed .feed_top{display: none !important;}
            #feed .logo_container .club_logo { border-radius: 3px !important; opacity: 0.85 !important; }
            #feed .post_text .coin { color: #fff !important; font-weight: 600 !important; }
            #feed .post_text img[src*="star"] { filter: sepia(1) saturate(3) hue-rotate(60deg) !important; }
            #feed .more_feed_button {
                background: rgba(61,104,40,0.35) !important; color: #90b878 !important;
                border-top: 1px solid rgba(61,104,40,0.3) !important; cursor: pointer !important;
                font-size: 11px !important; padding: 8px !important;
            }
            #feed .more_feed_button:hover { background: rgba(61,104,40,0.55) !important; color: #c8e0b4 !important; }

            /* ── Change League button ── */
            .tsa-change-league-btn {
                background: none; border: none;
                color: #6a9a58; font-size: 10px; font-weight: 700;
                letter-spacing: 0.5px; text-transform: uppercase;
                cursor: pointer; padding: 0; flex-shrink: 0;
                font-family: inherit; transition: color 0.15s;
            }
            .tsa-change-league-btn:hover { color: #c8e0b4; }
        `;
        document.head.appendChild(style);
    };

    window.TmLeagueStyles = { inject };
})();



// ─── components/league/tm-league-picker.js ──────────────────

// ==UserScript==
// @name         TM League Picker Component
// @namespace    https://trophymanager.com
// ==/UserScript==

/**
 * window.TmLeaguePicker
 *
 * Handles the "Change League" dialog: country/division/group autocomplete and navigation.
 * Reads leagueCountry/leagueDivision/leagueGroup from window.TmLeagueCtx.
 */
(function () {
    'use strict';

    if (!document.getElementById('tsa-league-picker-style')) {
        const _s = document.createElement('style');
        _s.id = 'tsa-league-picker-style';
        _s.textContent = `
            #tsa-league-dialog-overlay {
                position: fixed; inset: 0; z-index: 99999;
                background: rgba(0,0,0,0.72);
                display: flex; align-items: center; justify-content: center;
            }
            .tsa-ld-box {
                background: #111f0a; border: 1px solid rgba(61,104,40,0.6);
                border-radius: 8px; box-shadow: 0 12px 40px rgba(0,0,0,0.8);
                width: 780px; max-width: 96vw;
                display: flex; flex-direction: column; overflow: visible;
            }
            .tsa-ld-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 10px 14px; background: rgba(0,0,0,0.35);
                border-bottom: 1px solid rgba(61,104,40,0.35);
                border-radius: 8px 8px 0 0;
            }
            .tsa-ld-title { font-size: 12px; font-weight: 700; color: #6cc040; text-transform: uppercase; letter-spacing: 0.6px; }
            .tsa-ld-close { background: none; border: none; color: #4a7038; font-size: 18px; line-height: 1; cursor: pointer; padding: 0 2px; transition: color 0.12s; }
            .tsa-ld-close:hover { color: #c8e0b4; }
            .tsa-ld-body { padding: 0; }
            .tsa-ld-loading { padding: 20px; text-align: center; font-size: 11px; color: #5a7a48; }
            .tsa-ld-picker { display: flex; flex-direction: row; align-items: flex-end; gap: 10px; padding: 14px; }
            .tsa-ld-field { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
            .tsa-ld-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #5a7a48; }
            .tsa-ld-ac-wrap {
                position: relative; display: flex; align-items: center;
                background: rgba(0,0,0,0.35); border: 1px solid rgba(61,104,40,0.4);
                border-radius: 4px;
            }
            .tsa-ld-ac-wrap:focus-within { border-color: rgba(108,192,64,0.6); }
            .tsa-ld-ac-flag { width: 20px; height: 13px; object-fit: cover; border-radius: 2px; margin-left: 8px; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.4); }
            .tsa-ld-ac-input { flex: 1; background: transparent; border: none; outline: none; color: #c8e0b4; font-size: 12px; padding: 8px 10px; font-family: inherit; min-width: 0; }
            .tsa-ld-ac-input:disabled { color: #3a5228; cursor: not-allowed; }
            .tsa-ld-ac-input::placeholder { color: #4a6a38; }
            .tsa-ld-ac-dropdown {
                display: none; position: absolute; top: calc(100% + 2px); left: -1px; right: -1px;
                background: #0d1a07; border: 1px solid rgba(61,104,40,0.5); border-radius: 4px;
                max-height: 200px; overflow-y: auto; z-index: 100;
                scrollbar-width: thin; scrollbar-color: #3d6828 transparent;
                box-shadow: 0 6px 20px rgba(0,0,0,0.6);
            }
            .tsa-ld-ac-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; font-size: 11px; color: #c8e0b4; cursor: pointer; border-bottom: 1px solid rgba(61,104,40,0.08); }
            .tsa-ld-ac-item:hover { background: rgba(61,104,40,0.22); color: #e8f5d8; }
            .tsa-ld-flag { width: 20px; height: 13px; object-fit: cover; border-radius: 2px; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.4); }
            .tsa-ld-footer { display: flex; flex-shrink: 0; }
            .tsa-ld-go {
                padding: 8px 28px; background: #3d6828; border: none; border-radius: 4px;
                color: #e8f5d8; font-size: 12px; font-weight: 700;
                text-transform: uppercase; letter-spacing: 0.5px;
                cursor: pointer; transition: background 0.12s;
            }
            .tsa-ld-go:hover:not(:disabled) { background: #4d8830; }
            .tsa-ld-go:disabled { background: #1e3014; color: #3a5228; cursor: not-allowed; }
        `;
        document.head.appendChild(_s);
    }

    let _leagueDialogData = null;

    const openLeagueDialog = () => {
        const s = window.TmLeagueCtx;
        const existing = document.getElementById('tsa-league-dialog-overlay');
        if (existing) { existing.remove(); return; }

        const overlay = document.createElement('div');
        overlay.id = 'tsa-league-dialog-overlay';
        overlay.innerHTML = `
            <div class="tsa-ld-box" id="tsa-ld-box">
                <div class="tsa-ld-header">
                    <span class="tsa-ld-title">Change League</span>
                    <button class="tsa-ld-close" id="tsa-ld-close">&times;</button>
                </div>
                <div class="tsa-ld-body" id="tsa-ld-body">
                    <div class="tsa-ld-loading">Loading…</div>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        document.getElementById('tsa-ld-close').addEventListener('click', () => overlay.remove());

        window.TmApi.fetchLeagueDivisions(s.leagueCountry || 'cs').then(data => {
            if (!data) { document.getElementById('tsa-ld-body').innerHTML = '<div class="tsa-ld-loading" style="color:#ef4444">Failed to load.</div>'; return; }
            _leagueDialogData = data;
            renderLeaguePicker(data, document.getElementById('tsa-ld-body'));
        });
    };

    const renderLeaguePicker = (data, body) => {
        const s = window.TmLeagueCtx;
        const allCountries = Object.values(data.countries).flat()
            .sort((a, b) => a.country.localeCompare(b.country));
        const currentSuffix = (s.leagueCountry || 'cs').toLowerCase();

        body.innerHTML = `
            <div class="tsa-ld-picker">
                <div class="tsa-ld-field">
                    <label class="tsa-ld-label">Country</label>
                    <div class="tsa-ld-ac-wrap">
                        <img class="tsa-ld-ac-flag" id="tsa-ld-country-flag" src="" style="display:none">
                        <input class="tsa-ld-ac-input" id="tsa-ld-country-input" placeholder="Type to search…" autocomplete="off">
                        <div class="tsa-ld-ac-dropdown" id="tsa-ld-country-drop"></div>
                    </div>
                </div>
                <div class="tsa-ld-field">
                    <label class="tsa-ld-label">Division</label>
                    <div class="tsa-ld-ac-wrap">
                        <input class="tsa-ld-ac-input" id="tsa-ld-div-input" placeholder="Select country first…" autocomplete="off" disabled>
                        <div class="tsa-ld-ac-dropdown" id="tsa-ld-div-drop"></div>
                    </div>
                </div>
                <div class="tsa-ld-field" id="tsa-ld-group-field" style="display:none">
                    <label class="tsa-ld-label">Group</label>
                    <div class="tsa-ld-ac-wrap">
                        <input class="tsa-ld-ac-input" id="tsa-ld-group-input" placeholder="Select group…" autocomplete="off" disabled>
                        <div class="tsa-ld-ac-dropdown" id="tsa-ld-group-drop"></div>
                    </div>
                </div>
                <div class="tsa-ld-footer">
                    <button class="tsa-ld-go" id="tsa-ld-go" disabled>Go</button>
                </div>
            </div>`;

        let selCountry = null, selDivision = null, selGroup = null, divisionData = null;
        const countryInput = document.getElementById('tsa-ld-country-input');
        const countryDrop = document.getElementById('tsa-ld-country-drop');
        const countryFlag = document.getElementById('tsa-ld-country-flag');
        const divInput = document.getElementById('tsa-ld-div-input');
        const divDrop = document.getElementById('tsa-ld-div-drop');
        const groupField = document.getElementById('tsa-ld-group-field');
        const groupInput = document.getElementById('tsa-ld-group-input');
        const groupDrop = document.getElementById('tsa-ld-group-drop');
        const goBtn = document.getElementById('tsa-ld-go');

        const updateGo = () => {
            const nGroups = selDivision ? parseInt(selDivision.groups) || 1 : 0;
            goBtn.disabled = !(selCountry && selDivision && (nGroups <= 1 || selGroup));
        };
        const showDrop = (drop, items) => {
            drop.innerHTML = '';
            items.forEach(el => drop.appendChild(el));
            drop.style.display = items.length ? 'block' : 'none';
        };
        const hideDrop = drop => { drop.style.display = 'none'; };
        const makeItem = (label, flagSuffix, onClick) => {
            const el = document.createElement('div');
            el.className = 'tsa-ld-ac-item';
            if (flagSuffix) {
                const img = document.createElement('img');
                img.className = 'tsa-ld-flag';
                img.src = `/pics/flags/gradient/${flagSuffix}.png`;
                img.onerror = () => { img.style.display = 'none'; };
                el.appendChild(img);
                el.appendChild(document.createTextNode(label));
            } else {
                el.textContent = label;
            }
            el.addEventListener('mousedown', e => { e.preventDefault(); onClick(); });
            return el;
        };

        const applyDivisions = divs => {
            divisionData = divs;
            divInput.placeholder = divs.length ? 'Select division…' : 'No divisions found';
            divInput.disabled = !divs.length;
        };
        const selectGroup = g => {
            selGroup = g;
            groupInput.value = `Group ${g}`;
            hideDrop(groupDrop);
            updateGo();
        };
        const selectDivision = d => {
            selDivision = d;
            selGroup = null;
            divInput.value = d.name;
            hideDrop(divDrop);
            const nGroups = parseInt(d.groups) || 1;
            if (nGroups > 1) {
                groupField.style.display = '';
                groupInput.disabled = false;
                groupInput.value = '';
                groupInput.placeholder = `Select group (1–${nGroups})…`;
                hideDrop(groupDrop);
            } else {
                groupField.style.display = 'none';
                selGroup = 1;
            }
            updateGo();
        };
        const selectCountry = (c, prefetchedDivisions) => {
            selCountry = c;
            selDivision = null;
            selGroup = null;
            countryInput.value = c.country;
            countryFlag.src = `/pics/flags/gradient/${c.suffix}.png`;
            countryFlag.style.display = 'inline';
            hideDrop(countryDrop);
            divInput.value = '';
            groupField.style.display = 'none';
            updateGo();
            if (prefetchedDivisions) {
                applyDivisions(prefetchedDivisions);
            } else {
                divInput.placeholder = 'Loading divisions…';
                divInput.disabled = true;
                window.TmApi.fetchLeagueDivisions(c.suffix).then(d => {
                    if (d) applyDivisions(d.divisions || []);
                });
            }
        };

        const countryDivs = c => c.suffix === currentSuffix ? (data.divisions || []) : null;

        countryInput.addEventListener('focus', () => {
            const q = countryInput.value;
            const items = allCountries
                .filter(c => !q || c.country.toLowerCase().includes(q.toLowerCase()))
                .map(c => makeItem(c.country, c.suffix, () => selectCountry(c, countryDivs(c))));
            showDrop(countryDrop, items);
        });
        countryInput.addEventListener('input', () => {
            const q = countryInput.value.toLowerCase();
            const items = allCountries
                .filter(c => c.country.toLowerCase().includes(q))
                .map(c => makeItem(c.country, c.suffix, () => selectCountry(c, countryDivs(c))));
            showDrop(countryDrop, items);
        });
        countryInput.addEventListener('blur', () => setTimeout(() => hideDrop(countryDrop), 150));

        divInput.addEventListener('focus', () => {
            if (!divisionData) return;
            showDrop(divDrop, divisionData.map(d => makeItem(d.name, null, () => selectDivision(d))));
        });
        divInput.addEventListener('input', () => {
            if (!divisionData) return;
            const q = divInput.value.toLowerCase();
            showDrop(divDrop, divisionData
                .filter(d => d.name.toLowerCase().includes(q))
                .map(d => makeItem(d.name, null, () => selectDivision(d))));
        });
        divInput.addEventListener('blur', () => setTimeout(() => hideDrop(divDrop), 150));

        groupInput.addEventListener('focus', () => {
            if (!selDivision) return;
            const nGroups = parseInt(selDivision.groups) || 1;
            showDrop(groupDrop, Array.from({ length: nGroups }, (_, i) => i + 1)
                .map(g => makeItem(`Group ${g}`, null, () => selectGroup(g))));
        });
        groupInput.addEventListener('blur', () => setTimeout(() => hideDrop(groupDrop), 150));

        goBtn.addEventListener('click', () => {
            if (!selCountry || !selDivision) return;
            document.getElementById('tsa-league-dialog-overlay')?.remove();
            window.location.href = `/league/${selCountry.suffix}/${selDivision.division}/${selGroup || 1}/`;
        });

        const cur = allCountries.find(c => c.suffix === currentSuffix);
        if (cur) {
            selectCountry(cur, data.divisions || []);
            if (s.leagueDivision) {
                const curDiv = (data.divisions || []).find(d => String(d.division) === String(s.leagueDivision));
                if (curDiv) {
                    selectDivision(curDiv);
                    const g = parseInt(s.leagueGroup) || 1;
                    const nGroups = parseInt(curDiv.groups) || 1;
                    if (nGroups > 1) selectGroup(g);
                }
            }
        }
    };

    window.TmLeaguePicker = { openLeagueDialog, renderLeaguePicker };
})();



// ─── components/league/tm-league-standings.js ───────────────

// ==UserScript==
// @name         TM League Standings Component
// @namespace    https://trophymanager.com
// ==/UserScript==

/**
 * window.TmLeagueStandings
 *
 * Handles standings: building from live DOM, parsing/fetching history, and rendering.
 * Reads and writes shared state via window.TmLeagueCtx.
 */
(function () {
    'use strict';

    if (!document.getElementById('tsa-league-standings-style')) {
        const _s = document.createElement('style');
        _s.id = 'tsa-league-standings-style';
        _s.textContent = `
            .std-hover-opp td { background: #2e5c1a !important; outline: 1px solid #6cc040; }
            .std-hover-opp td:first-child { border-left: 3px solid #6cc040 !important; }
            #std-form-tooltip {
                position: fixed; z-index: 9999; pointer-events: none;
                background: #162e0e; border: 1px solid #3d6828;
                border-radius: 5px; padding: 6px 10px;
                font-size: 12px; color: #e8f5d8;
                box-shadow: 0 3px 10px rgba(0,0,0,0.5);
                white-space: nowrap; display: none;
            }
            #std-form-tooltip .sft-score { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
            #std-form-tooltip .sft-opp   { color: #90b878; font-size: 11px; }
            .tsa-standings-wrap { overflow: hidden; }
            .tsa-standings-page-ctrl {
                display: flex; align-items: center; justify-content: flex-end;
                gap: 6px; padding: 5px 10px 0;
            }
            .tsa-standings-page-ctrl span { font-size: 11px; color: #90b878; }
            .std-promo    { }
            .std-promo-po { }
            .std-rel-po   { }
            .std-rel      { }
            .std-me { background: rgba(108,192,64,0.10) !important; box-shadow: inset 3px 0 0 rgba(108,192,64,0.55); }
            .std-sep-green  td { border-bottom: 2px solid #4ade80 !important; }
            .std-sep-orange td { border-bottom: 2px solid #fb923c !important; }
            .std-sep-red    td { border-bottom: 2px solid #ef4444 !important; }
            .form-badge {
                display: inline-flex; align-items: center; justify-content: center;
                width: 18px; height: 18px; border-radius: 3px;
                font-size: 10px; font-weight: 700; cursor: pointer;
                transition: opacity 0.15s; text-decoration: none;
            }
            .form-badge:hover { opacity: 0.75; }
            .form-w { background: #1d6b29; color: #fff; }
            .form-d { background: #b48127; color: #fff; }
            .form-l { background: #7f1d1d; color: #fff; }
            .form-u { background: #1e3a4c; color: #fff; }
            .tsa-std-controls {
                display: flex; align-items: center; justify-content: space-between;
                padding: 5px 10px; background: rgba(0,0,0,0.25);
                border-bottom: 1px solid rgba(61,104,40,0.3); flex-wrap: wrap; gap: 6px;
            }
            .tsa-std-ctrl-group { display: flex; align-items: center; gap: 3px; }
            .tsa-std-ctrl-label {
                font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em;
                color: #3d6828; margin-right: 4px; user-select: none;
            }
            .tsa-std-ctrl-btn {
                background: rgba(61,104,40,0.2); border: 1px solid rgba(61,104,40,0.35);
                color: #5a8a48; font-size: 10px; padding: 3px 8px; border-radius: 3px;
                cursor: pointer; transition: background 0.12s, color 0.12s, border-color 0.12s;
                font-family: inherit; line-height: 1.2;
            }
            .tsa-std-ctrl-btn:hover { background: rgba(61,104,40,0.4); color: #b8d8a0; border-color: rgba(61,104,40,0.6); }
            .tsa-std-ctrl-active {
                background: rgba(108,192,64,0.25) !important; color: #c8e0b4 !important;
                border-color: rgba(108,192,64,0.55) !important; font-weight: 600;
            }
        `;
        document.head.appendChild(_s);
    }

    const buildStandingsFromDOM = () => {
        const s = window.TmLeagueCtx;
        s.standingsRows = [];
        const myClubId = (() => {
            const hi = document.querySelector('#overall_table tr.highlighted_row_done td a[club_link]');
            return hi ? hi.getAttribute('club_link') : null;
        })();

        const formMap = {};
        const playedCountMap = {};
        if (s.fixturesCache) {
            const played = [], upcoming = [];
            Object.values(s.fixturesCache).forEach(month => {
                if (month?.matches) month.matches.forEach(m => {
                    if (m.result) played.push(m); else upcoming.push(m);
                });
            });
            played.sort((a, b) => new Date(a.date) - new Date(b.date));
            played.forEach(m => {
                const res = m.result;
                if (!res) return;
                const parts = res.split('-').map(Number);
                if (parts.length !== 2) return;
                const [hg, ag] = parts;
                const hid = String(m.hometeam), aid = String(m.awayteam);
                if (!formMap[hid]) { formMap[hid] = []; playedCountMap[hid] = 0; }
                if (!formMap[aid]) { formMap[aid] = []; playedCountMap[aid] = 0; }
                formMap[hid].push({ r: hg > ag ? 'W' : hg < ag ? 'L' : 'D', id: m.id, oppId: aid, score: `${hg}–${ag}`, home: true });
                formMap[aid].push({ r: ag > hg ? 'W' : ag < hg ? 'L' : 'D', id: m.id, oppId: hid, score: `${ag}–${hg}`, home: false });
                playedCountMap[hid]++;
                playedCountMap[aid]++;
            });
            upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
            upcoming.forEach(m => {
                const hid = String(m.hometeam), aid = String(m.awayteam);
                if (!formMap[hid]) { formMap[hid] = []; playedCountMap[hid] = 0; }
                if (!formMap[aid]) { formMap[aid] = []; playedCountMap[aid] = 0; }
                formMap[hid].push({ r: '?', id: m.id, oppId: aid, score: '', home: true });
                formMap[aid].push({ r: '?', id: m.id, oppId: hid, score: '', home: false });
            });
        }

        $('#overall_table tbody tr').each(function () {
            const $tr = $(this);
            const cls = ($tr.attr('class') || '').trim();
            const $a = $tr.find('td a[club_link]').first();
            if (!$a.length) return;
            const clubId = $a.attr('club_link');
            const clubName = $a.text().trim();
            const tds = $tr.find('td');
            const rank = parseInt($(tds[0]).text().trim()) || 0;
            const gp = parseInt($(tds[2]).text().trim()) || 0;
            const w = parseInt($(tds[3]).text().trim()) || 0;
            const d = parseInt($(tds[4]).text().trim()) || 0;
            const l = parseInt($(tds[5]).text().trim()) || 0;
            const gf = parseInt($(tds[6]).text().trim()) || 0;
            const ga = parseInt($(tds[7]).text().trim()) || 0;
            const pts = parseInt($(tds[8]).text().trim()) || 0;
            const isMe = cls.includes('highlighted_row_done') || clubId === myClubId;
            let zone = '';
            if (cls.includes('promotion_playoff')) zone = 'promo-po';
            else if (cls.includes('promotion')) zone = 'promo';
            else if (cls.includes('relegation_playoff')) zone = 'rel-po';
            else if (cls.includes('relegation')) zone = 'rel';
            s.standingsRows.push({ rank, clubId, clubName, gp, w, d, l, gf, ga, pts, zone, isMe, form: formMap[clubId] || [], playedCount: playedCountMap[clubId] || 0 });
            if (rank && zone) s.liveZoneMap[rank] = zone;
        });
    };

    const parseHistoryStandings = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const table = doc.querySelector('table.border_bottom');
        if (!table) return [];
        const myClubId = (typeof SESSION !== 'undefined' && SESSION.main_id) ? String(SESSION.main_id) : null;
        const rows = [];
        table.querySelectorAll('tr').forEach(tr => {
            const a = tr.querySelector('td a[club_link]');
            if (!a) return;
            const tds = tr.querySelectorAll('td');
            const cls = tr.className || '';
            const rank = parseInt(tds[0]?.textContent.trim()) || 0;
            const clubId = a.getAttribute('club_link');
            const clubName = a.textContent.trim();
            const gp = parseInt(tds[2]?.textContent.trim()) || 0;
            const w = parseInt(tds[3]?.textContent.trim()) || 0;
            const d = parseInt(tds[4]?.textContent.trim()) || 0;
            const l = parseInt(tds[5]?.textContent.trim()) || 0;
            const goalParts = (tds[6]?.textContent.trim() || '0-0').split('-');
            const gf = parseInt(goalParts[0]) || 0;
            const ga = parseInt(goalParts[1]) || 0;
            const pts = parseInt(tds[7]?.textContent.trim()) || 0;
            let zone = '';
            if (cls.includes('promotion_playoff')) zone = 'promo-po';
            else if (cls.includes('promotion')) zone = 'promo';
            else if (cls.includes('relegation_playoff')) zone = 'rel-po';
            else if (cls.includes('relegation')) zone = 'rel';
            const isMe = cls.includes('highlighted_row_done') || (myClubId && clubId === myClubId);
            rows.push({ rank, clubId, clubName, gp, w, d, l, gf, ga, pts, zone, isMe: !!isMe, form: [], playedCount: 0 });
        });
        return rows;
    };

    const fetchHistoryStandings = (season) => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-standings-content');
        if (!container) return;
        container.innerHTML = `<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">Loading Season ${season}…</div>`;
        window.fetch(`/history/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/standings/${season}/`)
            .then(r => r.text())
            .then(html => {
                const rows = parseHistoryStandings(html);
                if (!rows.length) {
                    container.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">No data for Season ${season}</div>`;
                    return;
                }
                rows.forEach(r => { if (!r.zone && s.liveZoneMap[r.rank]) r.zone = s.liveZoneMap[r.rank]; });
                s.displayedSeason = season;
                s.standingsRows = rows;
                s.formOffset = 0;
                window.TmLeagueStandings.renderLeagueTable();
            })
            .catch(() => {
                container.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">Failed to load Season ${season}</div>`;
            });
    };

    const renderLeagueTable = () => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-standings-content');
        if (!container || !s.standingsRows.length) return;

        const liveSeasonVal = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;
        const isHistory = s.displayedSeason !== null && s.displayedSeason !== liveSeasonVal;
        const historyBanner = isHistory
            ? `<div class="tsa-history-banner">📅 Season ${s.displayedSeason} <button class="tsa-history-live-btn" id="tsa-history-live-btn">↩ Back to live</button></div>`
            : '';

        const isFiltered = !isHistory && (s.stdVenue !== 'total' || s.stdFormN > 0);
        const rows = isFiltered ? (() => {
            const mapped = s.standingsRows.map(r => {
                const played = r.form.filter(f => f.r !== '?');
                const veued = s.stdVenue === 'home' ? played.filter(f => f.home)
                    : s.stdVenue === 'away' ? played.filter(f => !f.home)
                        : played;
                const sliced = s.stdFormN > 0 ? veued.slice(-s.stdFormN) : veued;
                let w = 0, d = 0, l = 0, gf = 0, ga = 0;
                sliced.forEach(f => {
                    if (f.r === 'W') w++;
                    else if (f.r === 'D') d++;
                    else if (f.r === 'L') l++;
                    if (f.score) {
                        const p = f.score.split(/[\u2013\-]/);
                        if (p.length === 2) { gf += parseInt(p[0], 10) || 0; ga += parseInt(p[1], 10) || 0; }
                    }
                });
                return { ...r, gp: sliced.length, w, d, l, gf, ga, pts: w * 3 + d };
            });
            mapped.sort((a, b) => (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf));
            mapped.forEach((r, i) => { r.rank = i + 1; });
            return mapped;
        })() : s.standingsRows;

        const venueBtns = ['total', 'home', 'away'].map(v =>
            `<button class="tsa-std-ctrl-btn${s.stdVenue === v ? ' tsa-std-ctrl-active' : ''}" data-std-venue="${v}">${v.charAt(0).toUpperCase() + v.slice(1)}</button>`
        ).join('');
        const nBtns = [0, 5, 10, 15, 20, 25, 30].map(n =>
            `<button class="tsa-std-ctrl-btn${s.stdFormN === n ? ' tsa-std-ctrl-active' : ''}" data-std-n="${n}">${n === 0 ? 'All' : n}</button>`
        ).join('');
        const controlsHtml = isHistory ? '' : `
            <div class="tsa-std-controls">
                <div class="tsa-std-ctrl-group"><span class="tsa-std-ctrl-label">View</span>${venueBtns}</div>
                <div class="tsa-std-ctrl-group"><span class="tsa-std-ctrl-label">Form</span>${nBtns}</div>
            </div>`;

        const zoneColor = zone => {
            if (zone === 'promo') return '#4ade80';
            if (zone === 'promo-po') return '#fbbf24';
            if (zone === 'rel-po') return '#fb923c';
            if (zone === 'rel') return '#ef4444';
            return null;
        };
        const zoneBg = zone => {
            if (zone === 'promo') return 'rgba(74,222,128,0.18)';
            if (zone === 'promo-po') return 'rgba(251,191,36,0.18)';
            if (zone === 'rel-po') return 'rgba(251,146,60,0.18)';
            if (zone === 'rel') return 'rgba(239,68,68,0.18)';
            return 'transparent';
        };

        const maxPlayedLen = Math.max(0, ...rows.map(r => r.playedCount));
        const maxUpcomingLen = Math.max(0, ...rows.map(r => r.form.length - r.playedCount));
        const canOlder = maxPlayedLen + 1 - s.formOffset > 6;
        const canNewer = s.formOffset > 1 - maxUpcomingLen;

        const formHtml = (form, playedCount) => {
            let slice;
            if (s.stdVenue !== 'total') {
                const isHome = s.stdVenue === 'home';
                const filtered = form.filter(f => f.r !== '?' && (isHome ? f.home : !f.home));
                slice = filtered.slice(-6);
            } else {
                const windowEnd = Math.min(form.length, Math.max(0, playedCount + 1 - s.formOffset));
                const windowStart = Math.max(0, windowEnd - 6);
                slice = form.slice(windowStart, windowEnd);
            }
            if (!slice.length) return '<span style="color:#5a7a48;font-size:10px;">—</span>';
            return slice.map(f => {
                const cls = f.r === 'W' ? 'form-w' : f.r === 'D' ? 'form-d' : f.r === 'L' ? 'form-l' : 'form-u';
                const oppName = (s.standingsRows.find(sr => sr.clubId === f.oppId) || {}).clubName || f.oppId;
                return `<a class="form-badge ${cls}" href="/matches/${f.id}/" target="_blank"
                    data-opp="${f.oppId}" data-score="${f.score || ''}" data-opp-name="${oppName}"
                    data-venue="${f.home ? 'H' : 'A'}">${f.r}</a>`;
            }).join(' ');
        };

        let html = `${historyBanner}${controlsHtml}<table class="tsa-table" style="width:100%">
            <tr>
                <th class="tsa-left" style="width:24px">#</th>
                <th class="tsa-left">Club</th>
                <th title="Games played">Gp</th>
                <th title="Won">W</th>
                <th title="Drawn">D</th>
                <th title="Lost">L</th>
                <th title="Goals for">GF</th>
                <th title="Goals against">GA</th>
                <th title="Points">Pts</th>
                ${isHistory ? '' : `<th class="tsa-right" style="padding-left:6px;white-space:nowrap">
                    <button class="tsa-btn" id="std-form-older" style="padding:0 5px;font-size:14px;line-height:16px;margin-right:4px" ${canOlder ? '' : 'disabled'}>&#8249;</button>
                    Form
                    <button class="tsa-btn" id="std-form-newer" style="padding:0 5px;font-size:14px;line-height:16px;margin-left:4px" ${canNewer ? '' : 'disabled'}>&#8250;</button>
                </th>`}
            </tr>`;

        rows.forEach((r, i) => {
            const effectiveZone = isFiltered ? (s.liveZoneMap[r.rank] || '') : r.zone;
            const nextZone = isFiltered ? (s.liveZoneMap[rows[i + 1]?.rank] || null) : (rows[i + 1]?.zone ?? null);
            const sepClass = isFiltered ? '' : (() => {
                if (r.zone === nextZone || nextZone === null) return '';
                if (nextZone === 'rel') return ' std-sep-red';
                if (nextZone === 'rel-po') return ' std-sep-orange';
                if (r.zone === 'promo' || r.zone === 'promo-po') return ' std-sep-green';
                return '';
            })();
            const rowClass = (i % 2 === 0 ? 'tsa-even' : 'tsa-odd') + (r.isMe ? ' std-me' : '') + sepClass;
            html += `<tr class="${rowClass}" data-club="${r.clubId}">
                <td class="tsa-left tsa-rank" style="background:${zoneBg(effectiveZone)};color:${zoneColor(effectiveZone) || '#6a9a58'};font-weight:700;padding-top:8px;padding-bottom:8px">${r.rank}</td>
                <td class="tsa-left" style="color:#f4f8f0;font-weight:500;white-space:nowrap;padding-top:8px;padding-bottom:8px">
                    <img src="/pics/club_logos/${r.clubId}_25.png" style="width:18px;height:18px;vertical-align:middle;margin-right:4px;flex-shrink:0" onerror="this.style.visibility='hidden'">
                    <a href="/club/${r.clubId}/" style="color:inherit;text-decoration:none">${r.clubName}</a>
                </td>
                <td>${r.gp}</td>
                <td style="color:#4ade80;font-weight:700">${r.w}</td>
                <td style="color:#fde68a">${r.d}</td>
                <td style="color:#fca5a5">${r.l}</td>
                <td>${r.gf}</td>
                <td>${r.ga}</td>
                <td style="font-weight:700;color:#e8f5d8">${r.pts}</td>
                ${isHistory ? '' : `<td class="tsa-right" style="padding-left:6px">${formHtml(r.form, r.playedCount)}</td>`}
            </tr>`;
        });

        html += '</table>';
        container.innerHTML = html;

        container.querySelectorAll('[data-std-venue]').forEach(btn => {
            btn.addEventListener('click', () => { s.stdVenue = btn.dataset.stdVenue; renderLeagueTable(); });
        });
        container.querySelectorAll('[data-std-n]').forEach(btn => {
            btn.addEventListener('click', () => { s.stdFormN = parseInt(btn.dataset.stdN, 10); renderLeagueTable(); });
        });

        document.getElementById('tsa-history-live-btn')?.addEventListener('click', () => {
            s.displayedSeason = null;
            s.historyFixturesData = null;
            const chip = document.getElementById('tsa-ssnpick-chip');
            if (chip) chip.textContent = `Season ${liveSeasonVal}`;
            const ssnList = document.getElementById('tsa-ssnpick-list');
            ssnList?.querySelectorAll('.tsa-ssnpick-item').forEach(el =>
                el.classList.toggle('tsa-ssnpick-active', parseInt(el.dataset.s) === liveSeasonVal));
            s.standingsRows = [];
            s.formOffset = 0;
            buildStandingsFromDOM();
            renderLeagueTable();
            const fixCont = document.getElementById('tsa-fixtures-content');
            if (fixCont && fixCont.style.display !== 'none' && s.fixturesCache)
                window.TmLeagueFixtures.renderFixturesTab(s.fixturesCache);
        });

        let tooltip = document.getElementById('std-form-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'std-form-tooltip';
            document.body.appendChild(tooltip);
        }

        container.querySelectorAll('.form-badge[data-opp]').forEach(badge => {
            badge.addEventListener('mouseenter', e => {
                const oppId = badge.dataset.opp;
                container.querySelectorAll('tr[data-club]').forEach(tr => {
                    tr.classList.toggle('std-hover-opp', tr.dataset.club === oppId);
                });
                const score = badge.dataset.score;
                const oppName = badge.dataset.oppName;
                const venue = badge.dataset.venue;
                const venueLabel = venue === 'H' ? '<span style="color:#90b878">(H)</span>' : '<span style="color:#90b878">(A)</span>';
                tooltip.innerHTML = `<div class="sft-score">${score} ${venueLabel}</div><div class="sft-opp">vs ${oppName}</div>`;
                tooltip.style.left = (e.clientX + 14) + 'px';
                tooltip.style.top = (e.clientY - 10) + 'px';
                tooltip.style.display = 'block';
            });
            badge.addEventListener('mousemove', e => {
                tooltip.style.left = (e.clientX + 14) + 'px';
                tooltip.style.top = (e.clientY - 10) + 'px';
            });
            badge.addEventListener('mouseleave', () => {
                container.querySelectorAll('tr[data-club].std-hover-opp').forEach(tr => tr.classList.remove('std-hover-opp'));
                tooltip.style.display = 'none';
            });
        });

        document.getElementById('std-form-older')?.addEventListener('click', () => { s.formOffset += 6; renderLeagueTable(); });
        document.getElementById('std-form-newer')?.addEventListener('click', () => { s.formOffset -= 6; renderLeagueTable(); });
    };

    window.TmLeagueStandings = { buildStandingsFromDOM, parseHistoryStandings, fetchHistoryStandings, renderLeagueTable };
})();



// ─── components/league/tm-league-fixtures.js ────────────────

// ==UserScript==
// @name         TM League Fixtures Component
// @namespace    https://trophymanager.com
// ==/UserScript==

/**
 * window.TmLeagueFixtures
 *
 * Handles live fixtures tab, history fixtures, and match tooltip helpers.
 * Reads and writes shared state via window.TmLeagueCtx.
 */
(function () {
    'use strict';

    if (!document.getElementById('tsa-league-fixtures-style')) {
        const _s = document.createElement('style');
        _s.id = 'tsa-league-fixtures-style';
        _s.textContent = `
            .fix-month-tabs {
                display: flex; padding: 0;
                border-bottom: 1px solid rgba(61,104,40,0.3);
                background: rgba(0,0,0,0.1);
            }
            .fix-month-tab {
                padding: 7px 16px; font-size: 11px; font-weight: 600;
                color: #6a9a58; border: none; border-bottom: 2px solid transparent;
                background: transparent; cursor: pointer;
                text-transform: uppercase; letter-spacing: 0.5px;
                transition: all 0.15s; margin-bottom: -1px;
            }
            .fix-month-tab:hover { color: #c8e0b4; background: rgba(255,255,255,0.04); }
            .fix-month-tab.fix-month-active { color: #e8f5d8; border-bottom-color: #6cc040; }
            .fix-month-tab.fix-month-current::after { content: '\u25CF'; margin-left: 4px; color: #6cc040; font-size: 7px; vertical-align: 3px; }
            .fix-date-header {
                padding: 4px 12px; font-size: 10px; font-weight: 700;
                color: #6a9a58; text-transform: uppercase; letter-spacing: 0.5px;
                background: rgba(0,0,0,0.15); border-top: 1px solid rgba(61,104,40,0.2);
            }
            .fix-match-row {
                display: flex; align-items: center; padding: 5px 10px;
                border-bottom: 1px solid rgba(42,74,28,0.3);
                cursor: pointer; transition: background 0.12s; font-size: 12px; gap: 4px;
            }
            .fix-match-row:hover { background: #243d18 !important; }
            .fix-even { background: #1c3410; }
            .fix-odd  { background: #162e0e; }
            .fix-my-match { outline: 1px solid rgba(108,192,64,0.25); }
            .fix-team { flex: 1; display: flex; align-items: center; gap: 5px; color: #c8e0b4; min-width: 0; }
            .fix-team-home { justify-content: flex-end; }
            .fix-team-away { justify-content: flex-start; }
            .fix-team-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .fix-team.fix-my-team .fix-team-name { color: #e8f5d8; font-weight: 600; }
            .fix-score {
                width: 54px; min-width: 54px; text-align: center;
                font-size: 12px; font-weight: 700; padding: 2px 4px;
                border-radius: 3px; display: inline-block; flex-shrink: 0;
            }
            .fix-score-win      { color: #4ade80; }
            .fix-score-loss     { color: #fca5a5; }
            .fix-score-draw     { color: #fde68a; }
            .fix-score-neutral  { color: #e0f0d0; }
            .fix-score-upcoming { color: #4a6a3a; font-weight: 400; font-size: 11px; }
            .fix-tv { width: 16px; display: inline-block; text-align: center; font-size: 11px; flex-shrink: 0; }
            .fix-logo { width: 16px; height: 16px; flex-shrink: 0; }
            .hfix-match { position: relative; }
            .rnd-h2h-tooltip {
                position: absolute; z-index: 100;
                background: #111f0a; border: 1px solid rgba(80,160,48,.25);
                border-radius: 10px; padding: 18px 24px;
                min-width: 520px; max-width: 600px;
                box-shadow: 0 8px 32px rgba(0,0,0,.6);
                pointer-events: none; opacity: 0; transition: opacity 0.15s;
                left: 50%; top: 100%; transform: translateX(-50%); margin-top: 4px;
            }
            .rnd-h2h-tooltip.visible { opacity: 1; }
            .rnd-h2h-tooltip-header {
                display: flex; align-items: center; justify-content: center;
                gap: 14px; padding-bottom: 12px; margin-bottom: 10px;
                border-bottom: 1px solid rgba(80,160,48,.12);
            }
            .rnd-h2h-tooltip-logo { width: 40px; height: 40px; object-fit: contain; filter: drop-shadow(0 1px 3px rgba(0,0,0,.4)); }
            .rnd-h2h-tooltip-team { font-size: 15px; font-weight: 700; color: #c8e4b0; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .rnd-h2h-tooltip-score { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: 3px; text-shadow: 0 0 16px rgba(128,224,64,.15); }
            .rnd-h2h-tooltip-meta { display: flex; align-items: center; justify-content: center; gap: 18px; font-size: 11px; color: #5a7a48; margin-bottom: 10px; }
            .rnd-h2h-tooltip-meta span { display: flex; align-items: center; gap: 3px; }
            .rnd-h2h-tooltip-events { display: flex; flex-direction: column; gap: 5px; }
            .rnd-h2h-tooltip-evt { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #a0c890; padding: 3px 0; }
            .rnd-h2h-tooltip-evt.away-evt { flex-direction: row-reverse; text-align: right; }
            .rnd-h2h-tooltip-evt.away-evt .rnd-h2h-tooltip-evt-min { text-align: left; }
            .rnd-h2h-tooltip-evt-min { font-weight: 700; color: #80b868; min-width: 32px; font-size: 13px; text-align: right; flex-shrink: 0; }
            .rnd-h2h-tooltip-evt-icon { flex-shrink: 0; font-size: 16px; }
            .rnd-h2h-tooltip-evt-text { color: #b8d8a0; }
            .rnd-h2h-tooltip-evt-assist { font-size: 12px; color: #5a8a48; font-weight: 500; margin-left: 2px; }
            .rnd-h2h-tooltip-mom { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(80,160,48,.1); font-size: 13px; color: #6a9a58; text-align: center; }
            .rnd-h2h-tooltip-mom span { color: #e8d44a; font-weight: 700; }
            .rnd-h2h-tooltip-divider { height: 1px; background: rgba(80,160,48,.1); margin: 8px 0; }
            .rnd-h2h-tooltip-stats { display: grid; grid-template-columns: 1fr auto 1fr; gap: 4px 12px; margin: 10px 0; font-size: 14px; }
            .rnd-h2h-tooltip-stat-home { text-align: right; font-weight: 700; color: #b8d8a0; }
            .rnd-h2h-tooltip-stat-label { text-align: center; font-size: 10px; color: #5a7a48; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; padding: 0 6px; }
            .rnd-h2h-tooltip-stat-away { text-align: left; font-weight: 700; color: #b8d8a0; }
            .rnd-h2h-tooltip-stat-home.leading { color: #6adc3a; }
            .rnd-h2h-tooltip-stat-away.leading { color: #6adc3a; }
        `;
        document.head.appendChild(_s);
    }

    const parseHistoryMatches = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const h3s = [...doc.querySelectorAll('h3.slide_toggle_open')];
        const groups = [];
        h3s.forEach(h3 => {
            const monthLabel = h3.textContent.trim();
            let ul = h3.nextElementSibling;
            while (ul && !(ul.tagName === 'UL' && ul.classList.contains('match_list'))) ul = ul.nextElementSibling;
            if (!ul) return;
            let currentDay = 1;
            const matches = [];
            ul.querySelectorAll('li').forEach(li => {
                const dateSpan = li.querySelector('.match_date');
                if (dateSpan) {
                    const img = dateSpan.querySelector('img[src]');
                    if (img) {
                        const m = img.getAttribute('src').match(/calendar_numeral_(\d+)/);
                        if (m) currentDay = parseInt(m[1]);
                    }
                }
                const homeA = li.querySelector('.hometeam a[club_link]');
                const awayA = li.querySelector('.awayteam a[club_link]');
                const matchSpan = li.querySelector('[match_link]');
                const scoreA = li.querySelector('a.match_link');
                if (!homeA || !awayA || !matchSpan) return;
                matches.push({
                    day: currentDay,
                    homeId: homeA.getAttribute('club_link'),
                    homeName: homeA.textContent.trim(),
                    awayId: awayA.getAttribute('club_link'),
                    awayName: awayA.textContent.trim(),
                    matchId: matchSpan.getAttribute('match_link'),
                    score: scoreA ? scoreA.textContent.trim() : ''
                });
            });
            if (matches.length) groups.push({ monthLabel, matches });
        });
        return groups;
    };

    const fetchHistoryFixtures = (season) => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-fixtures-content');
        if (container && container.style.display !== 'none') {
            container.innerHTML = TmUI.loading(`Loading Season ${season} fixtures…`);
        }
        window.fetch(`/history/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/matches/${season}/`)
            .then(r => r.text())
            .then(html => {
                const groups = parseHistoryMatches(html);
                s.historyFixturesData = { season, groups };
                const cont = document.getElementById('tsa-fixtures-content');
                if (cont && cont.style.display !== 'none') {
                    renderHistoryFixturesTab(s.historyFixturesData);
                }
            })
            .catch(() => {
                const cont = document.getElementById('tsa-fixtures-content');
                if (cont && cont.style.display !== 'none') {
                    cont.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">Failed to load Season ${season} fixtures</div>`;
                }
            });
    };

    const renderFixturesTab = (fixtures) => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-fixtures-content');
        if (!container || !fixtures) return;

        const myClubId = (s.standingsRows.find(r => r.isMe) || {}).clubId || null;
        const months = Object.entries(fixtures).sort(([a], [b]) => a.localeCompare(b));
        const currentMonthKey = (months.find(([, v]) => v.current_month) || months[0] || [])[0];
        let activeKey = container.dataset.activeMonth || currentMonthKey;
        if (!fixtures[activeKey]) activeKey = currentMonthKey;

        let html = '<div class="fix-month-tabs">';
        months.forEach(([key, data]) => {
            const isActive = key === activeKey;
            const isCurrent = !!data.current_month;
            html += `<button class="fix-month-tab${isActive ? ' fix-month-active' : ''}${isCurrent ? ' fix-month-current' : ''}" data-month="${key}">${data.month}</button>`;
        });
        html += '</div>';

        const monthData = fixtures[activeKey];
        if (monthData && monthData.matches) {
            const byDate = {};
            monthData.matches.forEach(m => { (byDate[m.date] = byDate[m.date] || []).push(m); });
            const sortedDates = Object.keys(byDate).sort();
            let matchIdx = 0;
            html += '<div class="fix-month-body">';
            sortedDates.forEach(date => {
                const d = new Date(date + 'T12:00:00');
                const dayLabel = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
                const round = s.allRounds.find(r => r.date === date);
                const roundLabel = round ? `<span style="color:#4a6a3a;font-size:10px;float:right">Round ${round.roundNum}</span>` : '';
                html += `<div class="fix-date-header">${dayLabel}${roundLabel}</div>`;
                byDate[date].forEach(m => {
                    const homeId = String(m.hometeam);
                    const awayId = String(m.awayteam);
                    const isHomeMe = myClubId && homeId === myClubId;
                    const isAwayMe = myClubId && awayId === myClubId;
                    const isMyMatch = isHomeMe || isAwayMe;
                    const rowBg = matchIdx % 2 === 0 ? 'fix-even' : 'fix-odd';
                    matchIdx++;

                    let scoreHtml = '';
                    if (m.result) {
                        const parts = m.result.split('-').map(Number);
                        const [hg, ag] = parts;
                        let colorClass = 'fix-score-neutral';
                        if (myClubId) {
                            if ((isHomeMe && hg > ag) || (isAwayMe && ag > hg)) colorClass = 'fix-score-win';
                            else if ((isHomeMe && hg < ag) || (isAwayMe && ag < hg)) colorClass = 'fix-score-loss';
                            else if (isMyMatch) colorClass = 'fix-score-draw';
                        }
                        scoreHtml = `<a href="/matches/${m.id}/" class="fix-score ${colorClass}" style="text-decoration:none">${m.result}</a>`;
                    } else {
                        scoreHtml = `<a href="/matches/${m.id}/" class="fix-score fix-score-upcoming" style="text-decoration:none">—</a>`;
                    }

                    const tvBadge = m.tv === '1' ? '<span class="fix-tv" title="TV">📺</span>' : '<span class="fix-tv"></span>';
                    html += `<div class="fix-match-row ${rowBg}${isMyMatch ? ' fix-my-match' : ''}" data-mid="${m.id}">
                        <div class="fix-team fix-team-home${isHomeMe ? ' fix-my-team' : ''}">
                            <span class="fix-team-name">${m.hometeam_name}</span>
                            <img class="fix-logo" src="/pics/club_logos/${homeId}_25.png" onerror="this.style.visibility='hidden'" alt="">
                        </div>
                        ${scoreHtml}
                        <div class="fix-team fix-team-away${isAwayMe ? ' fix-my-team' : ''}">
                            <img class="fix-logo" src="/pics/club_logos/${awayId}_25.png" onerror="this.style.visibility='hidden'" alt="">
                            <span class="fix-team-name">${m.awayteam_name}</span>
                            ${tvBadge}
                        </div>
                    </div>`;
                });
            });
            html += '</div>';
        } else {
            html += '<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">No fixtures available</div>';
        }

        container.innerHTML = html;

        container.querySelectorAll('.fix-month-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                container.dataset.activeMonth = btn.dataset.month;
                renderFixturesTab(s.fixturesCache);
            });
        });
        container.querySelectorAll('.fix-match-row[data-mid]').forEach(row => {
            row.addEventListener('click', e => {
                if (e.target.closest('a')) return;
                window.location.href = `/matches/${row.dataset.mid}/`;
            });
        });
    };

    const buildHistTooltipContent = (d) => {
        const hName = d.hometeam_name || '';
        const aName = d.awayteam_name || '';
        const hLogoId = d.hometeam || '';
        const aLogoId = d.awayteam || '';
        const hLogoUrl = hLogoId ? `/pics/club_logos/${hLogoId}_140.png` : '';
        const aLogoUrl = aLogoId ? `/pics/club_logos/${aLogoId}_140.png` : '';

        let t = '';
        t += `<div class="rnd-h2h-tooltip-header">`;
        if (hLogoUrl) t += `<img class="rnd-h2h-tooltip-logo" src="${hLogoUrl}" onerror="this.style.display='none'">`;
        t += `<span class="rnd-h2h-tooltip-team">${hName}</span>`;
        t += `<span class="rnd-h2h-tooltip-score">${d.result || ''}</span>`;
        t += `<span class="rnd-h2h-tooltip-team">${aName}</span>`;
        if (aLogoUrl) t += `<img class="rnd-h2h-tooltip-logo" src="${aLogoUrl}" onerror="this.style.display='none'">`;
        t += `</div>`;

        t += `<div class="rnd-h2h-tooltip-meta">`;
        if (d.date) t += `<span>📅 ${d.date}</span>`;
        if (d.attendance_format) t += `<span>🏟 ${d.attendance_format}</span>`;
        t += `</div>`;

        const report = d.report || {};
        const hTeamId = String(d.hometeam || hLogoId);
        const goals = [];
        const cards = [];
        Object.keys(report).forEach(k => {
            if (k === 'mom' || k === 'mom_name') return;
            const e = report[k];
            if (!e || !e.minute) return;
            const sc = e.score;
            const isHome = String(e.team_scores) === hTeamId;
            if (sc === 'yellow' || sc === 'red' || sc === 'orange') {
                cards.push({ ...e, isHome });
            } else {
                goals.push({ ...e, isHome });
            }
        });
        goals.sort((a, b) => Number(a.minute) - Number(b.minute));
        cards.sort((a, b) => Number(a.minute) - Number(b.minute));

        t += window.TmMatchUtils.renderLegacyEvents(goals, cards);

        if (report.mom_name) {
            t += `<div class="rnd-h2h-tooltip-mom">⭐ Man of the Match: <span>${report.mom_name}</span></div>`;
        }
        return t;
    };

    const buildHistRichTooltip = (mData) => {
        const md = mData.match_data || {};
        const club = mData.club || {};
        const hName = club.home?.club_name || '';
        const aName = club.away?.club_name || '';
        const hId = String(club.home?.id || '');
        const aId = String(club.away?.id || '');
        const hLogo = club.home?.logo || `/pics/club_logos/${hId}_140.png`;
        const aLogo = club.away?.logo || `/pics/club_logos/${aId}_140.png`;
        const report = mData.report || {};

        let finalScore = '0 - 0';
        const allMins = Object.keys(report).map(Number).sort((a, b) => a - b);
        for (let i = allMins.length - 1; i >= 0; i--) {
            const evts = report[allMins[i]];
            if (!Array.isArray(evts)) continue;
            for (let j = evts.length - 1; j >= 0; j--) {
                const p = evts[j].parameters;
                if (p) {
                    const goal = Array.isArray(p) ? p.find(x => x.goal) : p.goal ? p : null;
                    if (goal) {
                        const g = goal.goal || goal;
                        if (g.score) { finalScore = g.score.join(' - '); break; }
                    }
                }
            }
            if (finalScore !== '0 - 0') break;
        }

        let t = '';
        t += `<div class="rnd-h2h-tooltip-header">`;
        t += `<img class="rnd-h2h-tooltip-logo" src="${hLogo}" onerror="this.style.display='none'">`;
        t += `<span class="rnd-h2h-tooltip-team">${hName}</span>`;
        t += `<span class="rnd-h2h-tooltip-score">${finalScore}</span>`;
        t += `<span class="rnd-h2h-tooltip-team">${aName}</span>`;
        t += `<img class="rnd-h2h-tooltip-logo" src="${aLogo}" onerror="this.style.display='none'">`;
        t += `</div>`;

        t += `<div class="rnd-h2h-tooltip-meta">`;
        const ko = md.venue?.kickoff_readable || '';
        if (ko) {
            const dt = new Date(ko.replace(' ', 'T'));
            t += `<span>📅 ${dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>`;
        }
        if (md.venue?.name) t += `<span>🏟 ${md.venue.name}</span>`;
        if (md.attendance) t += `<span>👥 ${Number(md.attendance).toLocaleString()}</span>`;
        t += `</div>`;

        const keyEvents = [];
        allMins.forEach(min => {
            const evts = report[min];
            if (!Array.isArray(evts)) return;
            evts.forEach(evt => {
                if (!evt.parameters) return;
                const params = Array.isArray(evt.parameters) ? evt.parameters : [evt.parameters];
                const clubId = String(evt.club || '');
                const isHome = clubId === hId;
                params.forEach(p => {
                    if (p.goal) {
                        const scorer = mData.lineup?.home?.[p.goal.player] || mData.lineup?.away?.[p.goal.player];
                        const assistPlayer = mData.lineup?.home?.[p.goal.assist] || mData.lineup?.away?.[p.goal.assist];
                        keyEvents.push({
                            min, type: 'goal', isHome,
                            name: scorer?.nameLast || scorer?.name || '?',
                            assist: assistPlayer?.nameLast || assistPlayer?.name || '',
                            score: p.goal.score ? p.goal.score.join('-') : ''
                        });
                    }
                    if (p.yellow) {
                        const pl = mData.lineup?.home?.[p.yellow] || mData.lineup?.away?.[p.yellow];
                        keyEvents.push({ min, type: 'yellow', isHome, name: pl?.nameLast || pl?.name || '?' });
                    }
                    if (p.yellow_red) {
                        const pl = mData.lineup?.home?.[p.yellow_red] || mData.lineup?.away?.[p.yellow_red];
                        keyEvents.push({ min, type: 'red', isHome, name: pl?.nameLast || pl?.name || '?' });
                    }
                    if (p.red) {
                        const pl = mData.lineup?.home?.[p.red] || mData.lineup?.away?.[p.red];
                        keyEvents.push({ min, type: 'red', isHome, name: pl?.nameLast || pl?.name || '?' });
                    }
                });
            });
        });

        const goals = keyEvents.filter(e => e.type === 'goal');
        const cards = keyEvents.filter(e => e.type === 'yellow' || e.type === 'red');

        t += window.TmMatchUtils.renderRichEvents(goals, cards);

        const poss = md.possession;
        const statsData = md.statistics || {};
        const shotsH = statsData.home_shots || 0;
        const shotsA = statsData.away_shots || 0;
        const onTargetH = statsData.home_on_target || 0;
        const onTargetA = statsData.away_on_target || 0;

        if (poss || shotsH || shotsA) {
            t += `<div class="rnd-h2h-tooltip-stats">`;
            if (poss) {
                const hP = poss.home || 0, aP = poss.away || 0;
                t += `<span class="rnd-h2h-tooltip-stat-home${hP > aP ? ' leading' : ''}">${hP}%</span>`;
                t += `<span class="rnd-h2h-tooltip-stat-label">Possession</span>`;
                t += `<span class="rnd-h2h-tooltip-stat-away${aP > hP ? ' leading' : ''}">${aP}%</span>`;
            }
            if (shotsH || shotsA) {
                t += `<span class="rnd-h2h-tooltip-stat-home${shotsH > shotsA ? ' leading' : ''}">${shotsH}</span>`;
                t += `<span class="rnd-h2h-tooltip-stat-label">Shots</span>`;
                t += `<span class="rnd-h2h-tooltip-stat-away${shotsA > shotsH ? ' leading' : ''}">${shotsA}</span>`;
            }
            if (onTargetH || onTargetA) {
                t += `<span class="rnd-h2h-tooltip-stat-home${onTargetH > onTargetA ? ' leading' : ''}">${onTargetH}</span>`;
                t += `<span class="rnd-h2h-tooltip-stat-label">On Target</span>`;
                t += `<span class="rnd-h2h-tooltip-stat-away${onTargetA > onTargetH ? ' leading' : ''}">${onTargetA}</span>`;
            }
            t += `</div>`;
        }

        const allPlayers = [...Object.values(mData.lineup?.home || {}), ...Object.values(mData.lineup?.away || {})];
        const mom = allPlayers.find(p => p.mom === 1 || p.mom === '1');
        if (mom) {
            t += `<div class="rnd-h2h-tooltip-mom">⭐ Man of the Match: <span>${mom.nameLast || mom.name}</span> (${parseFloat(mom.rating).toFixed(1)})</div>`;
        }
        return t;
    };

    const showHistFixTooltip = (el, mid, season) => {
        const s = window.TmLeagueCtx;
        clearTimeout(s.histFixTooltipHideTimer);
        if (s.histFixTooltipEl) s.histFixTooltipEl.remove();
        const currentSeasonNum = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;
        const isCurrentSeason = Number(season) === currentSeasonNum;
        s.histFixTooltipEl = document.createElement('div');
        s.histFixTooltipEl.className = 'rnd-h2h-tooltip';
        el.appendChild(s.histFixTooltipEl);

        if (s.histFixTooltipCache[mid]) {
            const cached = s.histFixTooltipCache[mid];
            s.histFixTooltipEl.innerHTML = cached._rich ? buildHistRichTooltip(cached) : buildHistTooltipContent(cached);
            requestAnimationFrame(() => s.histFixTooltipEl.classList.add('visible'));
        } else {
            s.histFixTooltipEl.innerHTML = TmUI.loading('Loading…', true);
            requestAnimationFrame(() => s.histFixTooltipEl.classList.add('visible'));
            const onFail = () => { if (s.histFixTooltipEl) s.histFixTooltipEl.innerHTML = TmUI.error('Failed', true); };
            if (isCurrentSeason) {
                window.TmApi.fetchMatch(mid).then(d => {
                    if (!d) { onFail(); return; }
                    d._rich = true;
                    s.histFixTooltipCache[mid] = d;
                    if (s.histFixTooltipEl && s.histFixTooltipEl.closest('[data-mid]')?.dataset.mid == mid) {
                        s.histFixTooltipEl.innerHTML = buildHistRichTooltip(d);
                    }
                });
            } else {
                window.TmApi.fetchMatchTooltip(mid, season).then(d => {
                    if (!d) { onFail(); return; }
                    s.histFixTooltipCache[mid] = d;
                    if (s.histFixTooltipEl && s.histFixTooltipEl.closest('[data-mid]')?.dataset.mid == mid) {
                        s.histFixTooltipEl.innerHTML = buildHistTooltipContent(d);
                    }
                });
            }
        }
    };

    const renderHistoryFixturesTab = (data) => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-fixtures-content');
        if (!container || !data) return;
        const myClubId = (s.standingsRows.find(r => r.isMe) || {}).clubId ||
            ((typeof SESSION !== 'undefined' && SESSION.main_id) ? String(SESSION.main_id) : null);
        const { season, groups } = data;
        const activeIdxRaw = parseInt(container.dataset.historyActiveMonth || '0');
        const activeIdx = isNaN(activeIdxRaw) ? 0 : Math.min(activeIdxRaw, groups.length - 1);

        let html = `<div class="tsa-history-banner">📅 Season ${season} <button class="tsa-history-live-btn" id="tsa-fix-history-live-btn">↩ Back to live</button></div>`;

        if (groups.length > 1) {
            html += '<div class="fix-month-tabs">';
            groups.forEach((g, idx) => {
                html += `<button class="fix-month-tab${idx === activeIdx ? ' fix-month-active' : ''}" data-hidx="${idx}">${g.monthLabel}</button>`;
            });
            html += '</div>';
        }

        const group = groups[activeIdx];
        if (group && group.matches.length) {
            let lastDay = -1;
            let matchIdx = 0;
            html += '<div class="fix-month-body">';
            group.matches.forEach(m => {
                if (m.day !== lastDay) {
                    const shortMonth = group.monthLabel.split(' ')[0].slice(0, 3);
                    html += `<div class="fix-date-header">${m.day} ${shortMonth}</div>`;
                    lastDay = m.day;
                }
                const isHomeMe = myClubId && m.homeId === String(myClubId);
                const isAwayMe = myClubId && m.awayId === String(myClubId);
                const isMyMatch = isHomeMe || isAwayMe;
                const rowBg = matchIdx % 2 === 0 ? 'fix-even' : 'fix-odd';
                matchIdx++;
                let colorClass = 'fix-score-neutral';
                if (m.score && myClubId) {
                    const parts = m.score.split('-').map(Number);
                    const [hg, ag] = parts;
                    if ((isHomeMe && hg > ag) || (isAwayMe && ag > hg)) colorClass = 'fix-score-win';
                    else if ((isHomeMe && hg < ag) || (isAwayMe && ag < hg)) colorClass = 'fix-score-loss';
                    else if (isMyMatch) colorClass = 'fix-score-draw';
                }
                const scoreHtml = m.score
                    ? `<a href="/matches/${m.matchId}/" class="fix-score ${colorClass}" style="text-decoration:none">${m.score}</a>`
                    : `<span class="fix-score fix-score-upcoming">—</span>`;
                html += `<div class="fix-match-row ${rowBg}${isMyMatch ? ' fix-my-match' : ''} hfix-match"
                    data-mid="${m.matchId}" data-season="${season}"
                    data-home-id="${m.homeId}" data-away-id="${m.awayId}"
                    style="position:relative">
                    <div class="fix-team fix-team-home${isHomeMe ? ' fix-my-team' : ''}">
                        <span class="fix-team-name">${m.homeName}</span>
                        <img class="fix-logo" src="/pics/club_logos/${m.homeId}_25.png" onerror="this.style.visibility='hidden'" alt="">
                    </div>
                    ${scoreHtml}
                    <div class="fix-team fix-team-away${isAwayMe ? ' fix-my-team' : ''}">
                        <img class="fix-logo" src="/pics/club_logos/${m.awayId}_25.png" onerror="this.style.visibility='hidden'" alt="">
                        <span class="fix-team-name">${m.awayName}</span>
                    </div>
                </div>`;
            });
            html += '</div>';
        } else {
            html += '<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">No fixtures available</div>';
        }

        container.innerHTML = html;

        container.querySelectorAll('.fix-month-tab[data-hidx]').forEach(btn => {
            btn.addEventListener('click', () => {
                container.dataset.historyActiveMonth = btn.dataset.hidx;
                renderHistoryFixturesTab(s.historyFixturesData);
            });
        });

        document.getElementById('tsa-fix-history-live-btn')?.addEventListener('click', () => {
            const lv = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;
            s.historyFixturesData = null;
            s.displayedSeason = null;
            container.dataset.historyActiveMonth = '0';
            const chip = document.getElementById('tsa-ssnpick-chip');
            if (chip && lv) chip.textContent = `Season ${lv}`;
            document.getElementById('tsa-ssnpick-list')?.querySelectorAll('.tsa-ssnpick-item').forEach(el =>
                el.classList.toggle('tsa-ssnpick-active', parseInt(el.dataset.s) === lv));
            s.standingsRows = [];
            s.formOffset = 0;
            window.TmLeagueStandings.buildStandingsFromDOM();
            window.TmLeagueStandings.renderLeagueTable();
            if (s.fixturesCache) renderFixturesTab(s.fixturesCache);
        });

        container.querySelectorAll('.hfix-match[data-mid]').forEach(row => {
            if (!row.dataset.mid) return;
            row.addEventListener('mouseenter', () => {
                clearTimeout(s.histFixTooltipHideTimer);
                const mid = row.dataset.mid;
                const rowSeason = row.dataset.season;
                s.histFixTooltipTimer = setTimeout(() => showHistFixTooltip(row, mid, rowSeason), 300);
            });
            row.addEventListener('mouseleave', () => {
                clearTimeout(s.histFixTooltipTimer);
                s.histFixTooltipHideTimer = setTimeout(() => {
                    if (s.histFixTooltipEl) { s.histFixTooltipEl.remove(); s.histFixTooltipEl = null; }
                }, 100);
            });
        });
    };

    window.TmLeagueFixtures = {
        parseHistoryMatches,
        fetchHistoryFixtures,
        renderFixturesTab,
        buildHistTooltipContent,
        buildHistRichTooltip,
        renderHistoryFixturesTab
    };
})();



// ─── components/league/tm-league-rounds.js ──────────────────

// ==UserScript==
// @name         TM League Rounds Component
// @namespace    https://trophymanager.com
// ==/UserScript==

/**
 * window.TmLeagueRounds
 *
 * Round navigation widget, per-match R5 ratings, and the full squad-analysis
 * pipeline (processMatchData / startAnalysis).
 *
 * Reads/writes from window.TmLeagueCtx:
 *   allRounds, currentRoundIdx, fixturesCache    (r/w)
 *   clubMap, clubDatas, clubPlayersMap            (r/w)
 *   leagueCountry, leagueDivision, leagueGroup   (r)
 *   panelLeagueName                              (r/w)
 *   numLastRounds, totalExpected, totalProcessed (r/w)
 *   analysisInterval                             (r/w)
 *   R5_THRESHOLDS, getColor                      (r)
 *   fetchSquad, computeTeamStats, updateProgress (r — functions on ctx)
 *
 * Cross-component calls:
 *   window.TmLeagueStandings.buildStandingsFromDOM()
 *   window.TmLeagueStandings.renderLeagueTable()
 *   window.TmLeagueFixtures.renderFixturesTab(fixtures)
 *   window.TmLeagueSkillTable.showSkill()
 */
(function () {
    'use strict';

    if (!document.getElementById('tsa-league-rounds-style')) {
        const _s = document.createElement('style');
        _s.id = 'tsa-league-rounds-style';
        _s.textContent = `
            .tmu-card-head.rnd-nav { padding: 6px 12px; }
            .tmu-card-head.rnd-nav .rnd-title { flex: 1; text-align: center; }
            .rnd-nav-btn {
                width: 24px; height: 24px;
                font-size: 0; line-height: 0;
                display: inline-flex; align-items: center; justify-content: center;
                border-radius: 4px; padding: 0;
                background: none; border: none; color: #a0c888; cursor: pointer;
                transition: color 0.15s;
            }
            .rnd-nav-btn svg { width: 16px; height: 16px; fill: currentColor; }
            .rnd-nav-btn:disabled { opacity: 0.3; cursor: default; }
            .rnd-nav-btn:not(:disabled):hover { color: #fff; }
            .tsa-table td.rnd-home { text-align: right; padding-right: 8px !important; width: 42%; }
            .tsa-table td.rnd-away { text-align: left; padding-left: 8px !important; width: 42%; }
            .rnd-team-wrap { display: inline-flex; align-items: center; gap: 6px; width: 100%; }
            .rnd-home .rnd-team-wrap { justify-content: space-between; }
            .rnd-away .rnd-team-wrap { justify-content: space-between; }
            .rnd-logo { width: 18px; height: 18px; vertical-align: middle; }
            .tsa-table td.rnd-score { width: 16%; cursor: pointer; transition: background 0.15s; }
            .tsa-table td.rnd-score:hover { background: rgba(255,255,255,0.08); }
            .rnd-rating {
                font-size: 11px; font-weight: 700;
                font-variant-numeric: tabular-nums;
                color: #90b878;
            }
            .tsa-table td.rnd-score {
                text-align: center; color: #f0fce0;
                font-weight: 700; font-size: 13px; min-width: 40px;
            }
            .tsa-table td.rnd-score-upcoming { color: #90b878; font-weight: 400; font-size: 11px; }
            .rnd-info-btn {
                background: none; border: none;
                color: #90b878; cursor: pointer;
                font-size: 14px; padding: 2px 4px;
                transition: color 0.15s;
            }
            .rnd-info-btn:hover { color: #c8e0b4; }
            #rnd-content .tsa-table td { padding: 4px 6px; }
        `;
        document.head.appendChild(_s);
    }

    // Module-level caches (not on ctx — private to this component)
    const roundMatchCache   = new Map(); // matchId → { homeR5, awayR5, data }
    const roundFetchInFlight = new Set(); // matchIds currently being fetched

    // ─── Round navigation ────────────────────────────────────────────────

    const buildRounds = (fixtures) => {
        const s = window.TmLeagueCtx;

        // Collect ALL matches (played + upcoming)
        const allMatches = [];
        Object.values(fixtures).forEach(month => {
            if (month?.matches) month.matches.forEach(m => allMatches.push(m));
        });

        // Group by date → each date is one round
        const byDate = {};
        allMatches.forEach(m => {
            (byDate[m.date] = byDate[m.date] || []).push(m);
        });

        // Sort dates ascending, assign round numbers
        const sortedDates = Object.keys(byDate).sort((a, b) => new Date(a) - new Date(b));
        const rounds = sortedDates.map((date, idx) => ({
            roundNum: idx + 1,
            date,
            matches: byDate[date]
        }));

        // Determine current round: last round with any results, or 0
        let current = 0;
        for (let i = rounds.length - 1; i >= 0; i--) {
            if (rounds[i].matches.some(m => m.result)) {
                current = i;
                break;
            }
        }
        s.setRoundsData(rounds, current);

        // Trigger round-panel render if UI is ready
        if (document.getElementById('rnd-content')) renderRound();

        // Rebuild standings form data now that fixtures are loaded
        window.TmLeagueStandings.buildStandingsFromDOM();
        window.TmLeagueStandings.renderLeagueTable();

        // Render fixtures tab (hidden until user clicks it)
        if (document.getElementById('tsa-fixtures-content')) {
            window.TmLeagueFixtures.renderFixturesTab(fixtures);
        }
    };

    const renderRound = () => {
        const s = window.TmLeagueCtx;
        if (!s.allRounds.length) {
            $('#rnd-title').text('Round —');
            $('#rnd-content').html('<div style="text-align:center;padding:12px;color:#5a7a48;font-size:12px;">No rounds available</div>');
            return;
        }
        const round = s.allRounds[s.currentRoundIdx];
        $('#rnd-title').text(`Round ${round.roundNum}`);
        $('#rnd-prev').prop('disabled', s.currentRoundIdx <= 0);
        $('#rnd-next').prop('disabled', s.currentRoundIdx >= s.allRounds.length - 1);

        let html = '<table class="tsa-table">';
        round.matches.forEach((m, idx) => {
            const rowClass  = idx % 2 === 0 ? 'tsa-even' : 'tsa-odd';
            const homeName  = s.clubMap.get(String(m.hometeam)) || m.hometeam;
            const awayName  = s.clubMap.get(String(m.awayteam)) || m.awayteam;
            const score     = m.result ? m.result : '—';
            const scoreClass = m.result ? 'rnd-score' : 'rnd-score rnd-score-upcoming';

            html += `<tr class="${rowClass}">
                <td class="rnd-home">
                    <div class="rnd-team-wrap">
                        <span class="rnd-rating" id="rnd-r-h-${m.id}">—</span>
                        <span class="tsa-club">${homeName}</span>
                    </div>
                </td>
                <td class="${scoreClass}" data-match-id="${m.id}">${score}</td>
                <td class="rnd-away">
                    <div class="rnd-team-wrap">
                        <span class="tsa-club">${awayName}</span>
                        <span class="rnd-rating" id="rnd-r-a-${m.id}">—</span>
                    </div>
                </td>
            </tr>`;
        });
        html += '</table>';
        $('#rnd-content').html(html);

        // Click score → open match page
        $('#rnd-content').off('click', '.rnd-score').on('click', '.rnd-score', function () {
            const mid = $(this).data('match-id');
            if (mid) window.location.href = `/matches/${mid}/`;
        });

        // Fill ratings from cache
        round.matches.forEach(m => {
            const c = roundMatchCache.get(String(m.id));
            if (c) fillRatingCells(String(m.id), c.homeR5, c.awayR5);
        });

        // Fetch ratings for played matches not yet in cache
        fetchRoundRatings(round);
    };

    // ─── Match cache & rating cells ──────────────────────────────────────

    const fetchRoundRatings = (round) => {
        round.matches.forEach(m => {
            if (!m.result) return; // skip upcoming
            const mid = String(m.id);
            if (roundMatchCache.has(mid) || roundFetchInFlight.has(mid)) return;
            roundFetchInFlight.add(mid);
            window.TmApi.fetchMatchCached(mid)
                .then(data => {
                    roundFetchInFlight.delete(mid);
                    if (data) processRoundMatchData(mid, data);
                })
                .catch(e => {
                    roundFetchInFlight.delete(mid);
                    console.warn('[League] fetchRoundRatings error', mid, e);
                });
        });
    };

    const fillRatingCells = (matchId, homeR5, awayR5) => {
        const s = window.TmLeagueCtx;
        const hEl = document.getElementById(`rnd-r-h-${matchId}`);
        const aEl = document.getElementById(`rnd-r-a-${matchId}`);
        if (hEl) {
            hEl.textContent  = homeR5.toFixed(2);
            hEl.style.color  = s.getColor(homeR5, s.R5_THRESHOLDS);
        }
        if (aEl) {
            aEl.textContent  = awayR5.toFixed(2);
            aEl.style.color  = s.getColor(awayR5, s.R5_THRESHOLDS);
        }
    };

    /** Processes a single match for the Rounds panel only (never touches totalProcessed). */
    const processRoundMatchData = (matchId, data) => {
        const s = window.TmLeagueCtx;
        const homeId = String(data.club.home.id);
        const awayId = String(data.club.away.id);
        Promise.all([s.fetchSquad(homeId), s.fetchSquad(awayId)]).then(([homeSquad, awaySquad]) => {
            return Promise.all([
                s.computeTeamStats(Object.keys(data.lineup.home), data.lineup.home, homeSquad),
                s.computeTeamStats(Object.keys(data.lineup.away), data.lineup.away, awaySquad)
            ]);
        }).then(([homeResult, awayResult]) => {
            const homeR5 = Number((homeResult.totals.R5 / 11).toFixed(2));
            const awayR5 = Number((awayResult.totals.R5 / 11).toFixed(2));
            roundMatchCache.set(String(matchId), { homeR5, awayR5, data });
            fillRatingCells(String(matchId), homeR5, awayR5);
        }).catch(e => console.warn('[League] processRoundMatchData error', matchId, e));
    };

    const showLoading = () => {
        $('#tsa-content').html(`
            <div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">
                <div style="margin-bottom:6px;">⏳</div>Analyzing...
            </div>
        `);
    };

    // ─── Full squad-analysis pipeline ────────────────────────────────────

    /** Processes a match for the full analysis (updates clubDatas, clubPlayersMap, totalProcessed). */
    const processMatchData = (matchId, data) => {
        const s = window.TmLeagueCtx;
        const homeId = String(data.club.home.id);
        const awayId = String(data.club.away.id);

        // Capture tournament name from first available match
        if (!s.panelLeagueName && data.match_data?.venue?.tournament) {
            s.panelLeagueName = data.match_data.venue.tournament;
            const el = document.getElementById('tsa-panel-league-name');
            if (el) el.textContent = s.panelLeagueName;
        }

        const homeLineup = data.lineup.home;
        const awayLineup = data.lineup.away;
        Promise.all([s.fetchSquad(homeId), s.fetchSquad(awayId)]).then(([homeSquad, awaySquad]) => {
            return Promise.all([
                s.computeTeamStats(Object.keys(homeLineup), homeLineup, homeSquad),
                s.computeTeamStats(Object.keys(awayLineup), awayLineup, awaySquad)
            ]);
        }).then(([homeResult, awayResult]) => {
            if (!s.clubDatas.has(homeId)) s.clubDatas.set(homeId, []);
            if (!s.clubDatas.has(awayId)) s.clubDatas.set(awayId, []);
            s.clubDatas.get(homeId).push(homeResult.totals);
            s.clubDatas.get(awayId).push(awayResult.totals);

            // Per-player tracking (latest match overwrites previous)
            if (!s.clubPlayersMap.has(homeId)) s.clubPlayersMap.set(homeId, new Map());
            if (!s.clubPlayersMap.has(awayId)) s.clubPlayersMap.set(awayId, new Map());
            homeResult.players.forEach(p => s.clubPlayersMap.get(homeId).set(p.id, {
                name: p.name, pos: p.pos, R5: p.R5, REC: p.REC, Age: p.Age,
                skills: p.skills, isGK: p.isGK, routine: p.routine
            }));
            awayResult.players.forEach(p => s.clubPlayersMap.get(awayId).set(p.id, {
                name: p.name, pos: p.pos, R5: p.R5, REC: p.REC, Age: p.Age,
                skills: p.skills, isGK: p.isGK, routine: p.routine
            }));

            // Cache per-match R5 for Rounds panel
            const homeR5 = Number((homeResult.totals.R5 / 11).toFixed(2));
            const awayR5 = Number((awayResult.totals.R5 / 11).toFixed(2));
            roundMatchCache.set(String(matchId), { homeR5, awayR5, data });
            fillRatingCells(String(matchId), homeR5, awayR5);

            s.totalProcessed += 2;
            s.updateProgress(`Processed ${s.totalProcessed}/${s.totalExpected}`);
        }).catch(e => {
            console.warn('[League] processMatchData error:', e);
            s.totalProcessed += 2;
        });
    };

    const startAnalysis = n => {
        const s = window.TmLeagueCtx;
        s.numLastRounds = n;
        s.beginAnalysis();
        s.updateProgress('Fetching fixtures...');
        showLoading();

        const doAnalysis = (fixtures) => {
            // Collect all played matches
            const allPlayed = [];
            Object.values(fixtures).forEach(month => {
                if (month?.matches) month.matches.forEach(m => { if (m.result) allPlayed.push(m); });
            });

            // Group by date (each date = one matchday)
            const byDate = {};
            allPlayed.forEach(m => {
                (byDate[m.date] = byDate[m.date] || []).push(m);
            });

            // Take last N matchdays
            const dates    = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a)).slice(0, s.numLastRounds);
            const matchIds = dates.flatMap(d => byDate[d].map(m => String(m.id)));

            s.totalExpected = matchIds.length * 2;
            s.updateProgress(`Loading ${matchIds.length} matches (${dates.length} rounds)...`);

            matchIds.forEach(id => {
                window.TmApi.fetchMatchCached(id)
                    .then(data => {
                        if (data) processMatchData(id, data);
                        else s.totalProcessed += 2;
                    })
                    .catch(() => { s.totalProcessed += 2; });
            });

            // Poll for completion, then show skill table
            if (s.analysisInterval) clearInterval(s.analysisInterval);
            s.analysisInterval = setInterval(() => {
                if (s.totalExpected > 0 && s.totalProcessed >= s.totalExpected) {
                    clearInterval(s.analysisInterval);
                    s.analysisInterval = null;
                    s.updateProgress('');
                    window.TmLeagueSkillTable.showSkill();
                }
            }, 500);
        };

        if (s.fixturesCache) {
            doAnalysis(s.fixturesCache);
        } else {
            window.TmApi.fetchLeagueFixtures(s.leagueCountry, s.leagueDivision, s.leagueGroup)
                .then(data => {
                    if (!data) return;
                    s.fixturesCache = data;
                    buildRounds(s.fixturesCache);
                    doAnalysis(s.fixturesCache);
                });
        }
    };

    window.TmLeagueRounds = {
        buildRounds,
        renderRound,
        fetchRoundRatings,
        fillRatingCells,
        processRoundMatchData,
        showLoading,
        processMatchData,
        startAnalysis,
        roundMatchCache,
        roundFetchInFlight,
    };
})();



// ─── components/league/tm-league-stats.js ───────────────────

// ==UserScript==
// @name         TM League Stats Component
// @namespace    https://trophymanager.com
// ==/UserScript==

/**
 * window.TmLeagueStats
 *
 * Handles player statistics, club statistics, and transfers: parse, fetch, render.
 * Reads and writes shared state via window.TmLeagueCtx.
 */
(function () {
    'use strict';

    if (!document.getElementById('tsa-league-stats-style')) {
        const _s = document.createElement('style');
        _s.id = 'tsa-league-stats-style';
        _s.textContent = `
            .tsa-stats-bar {
                display: flex; align-items: center; justify-content: space-between;
                flex-wrap: wrap; gap: 6px; padding: 8px 10px;
                border-bottom: 1px solid rgba(61,104,40,0.3);
            }
            .tsa-stats-bar-mode { background: rgba(0,0,0,0.15); padding: 6px 10px; }
            .tsa-stat-mode-btns { display: flex; gap: 4px; }
            .tsa-stat-mode-btn {
                padding: 3px 14px; background: rgba(61,104,40,0.3);
                border: 1px solid rgba(61,104,40,0.5); border-radius: 4px;
                color: #7aaa60; font-size: 10px; font-weight: 700;
                letter-spacing: 0.5px; text-transform: uppercase;
                cursor: pointer; transition: background 0.15s, color 0.15s;
            }
            .tsa-stat-mode-btn:hover { background: rgba(61,104,40,0.6); color: #c8e0b4; }
            .tsa-stat-btns { display: flex; flex-wrap: wrap; gap: 4px; }
            .tsa-stat-team-btns { display: flex; gap: 4px; }
            .tsa-stat-btn, .tsa-stat-team-btn {
                padding: 3px 9px; background: rgba(61,104,40,0.3);
                border: 1px solid rgba(61,104,40,0.5); border-radius: 4px;
                color: #7aaa60; font-size: 10px; font-weight: 700;
                letter-spacing: 0.4px; text-transform: uppercase;
                cursor: pointer; transition: background 0.15s, color 0.15s;
            }
            .tsa-stat-btn:hover, .tsa-stat-team-btn:hover { background: rgba(61,104,40,0.6); color: #c8e0b4; }
            .tsa-stat-btn-active { background: #3d6828 !important; color: #e8f5d8 !important; border-color: #6cc040 !important; }
            .tsa-stats-scroll { overflow-y: auto; }
            .tsa-stats-table { width: 100%; border-collapse: collapse; font-size: 11px; color: #c8e0b4; }
            .tsa-stats-table thead tr { background: rgba(0,0,0,0.25); position: sticky; top: 0; }
            .tsa-stats-table th {
                padding: 5px 8px; color: #6a9a58; font-size: 10px;
                text-transform: uppercase; letter-spacing: 0.5px;
                font-weight: 700; text-align: left;
                border-bottom: 1px solid rgba(61,104,40,0.4); user-select: none;
            }
            .tsa-stats-table th[data-si]:hover { color: #c8e0b4; }
            .tsa-stats-table th.tsa-stats-val { text-align: right; }
            .tsa-stats-table td { padding: 4px 8px; border-bottom: 1px solid rgba(61,104,40,0.15); }
            .tsa-stats-table tbody tr:nth-child(even) { background: rgba(0,0,0,0.15); }
            .tsa-stats-table tbody tr:hover { background: rgba(61,104,40,0.2); }
            .tsa-stats-rank { color: #5a7a48; width: 28px; text-align: right; padding-right: 6px !important; }
            .tsa-stats-name a { color: #c8e0b4; text-decoration: none; }
            .tsa-stats-name a:hover { color: #6cc040; }
            .tsa-stats-club { color: #6a9a58; font-size: 10px; }
            .tsa-stats-val { text-align: right; font-weight: 700; color: #e8f5d8; }
            .tsa-stats-me { background: rgba(108,192,64,0.10) !important; box-shadow: inset 3px 0 0 rgba(108,192,64,0.55); }
            .tsa-stats-me .tsa-stats-name a { color: #8fdc60; }
            .tsa-stats-me .tsa-stats-val { color: #6cc040; }
            .tsa-tr-rec { text-align: center; font-weight: 700; font-size: 11px; }
            .tsa-tr-section { margin-bottom: 2px; }
            .tsa-tr-head {
                padding: 6px 10px; font-size: 11px; font-weight: 700;
                color: #6a9a58; text-transform: uppercase; letter-spacing: 0.5px;
                background: rgba(0,0,0,0.2); border-top: 1px solid rgba(61,104,40,0.3);
            }
            .tsa-tr-count { display: inline-block; margin-left: 6px; background: rgba(61,104,40,0.35); color: #c8e0b4; border-radius: 8px; padding: 0 6px; font-size: 10px; }
            .tsa-tr-totals {
                display: flex; gap: 16px; justify-content: flex-end;
                padding: 8px 12px; font-size: 11px; color: #6a9a58;
                border-top: 2px solid rgba(61,104,40,0.4); background: rgba(0,0,0,0.15);
            }
        `;
        document.head.appendChild(_s);
    }

    const CLUB_STAT_COLS = {
        goals: ['Avg GF', 'Avg GA', 'Clean Sheets', 'No Goals Scored'],
        attendance: ['Home Avg', 'Away Avg', 'Total Avg'],
        injuries: ['Injuries', 'Total Days', 'Avg Days'],
        possession: ['Home %', 'Away %', 'Avg %'],
        cards: ['Yellow', 'Red', 'Total']
    };

    const parsePlayerStats = (html, teamIdx) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const tab = doc.getElementById(teamIdx === 0 ? 'tab0' : 'tab1');
        if (!tab) return [];
        const rows = [];
        tab.querySelectorAll('tbody tr').forEach((tr, i) => {
            const tds = tr.querySelectorAll('td');
            if (tds.length < 3) return;
            const playerA = tds[0].querySelector('a[player_link]');
            const clubA = tds[1].querySelector('a[club_link]');
            const valText = tds[tds.length - 1].textContent.trim();
            rows.push({
                rank: i + 1,
                name: playerA ? playerA.textContent.trim() : tds[0].textContent.trim(),
                playerId: playerA ? playerA.getAttribute('player_link') : '',
                clubName: clubA ? clubA.textContent.trim() : '',
                clubId: clubA ? clubA.getAttribute('club_link') : '',
                val: parseFloat(valText) || 0,
                isMe: tr.classList.contains('highlighted_row')
            });
        });
        return rows;
    };

    const fetchPlayerStats = (stat, season, teamIdx, onDone) => {
        const s = window.TmLeagueCtx;
        const key = `${stat}|${season}|${teamIdx}`;
        if (s.statsCache[key]) { onDone(s.statsCache[key]); return; }
        const seasonStr = season ? `${season}/` : '';
        window.fetch(`/statistics/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/players/${stat}/${seasonStr}`)
            .then(r => r.text())
            .then(html => {
                const rows = parsePlayerStats(html, teamIdx);
                s.statsCache[key] = rows;
                onDone(rows);
            })
            .catch(() => onDone(null));
    };

    const parseClubStats = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const tab = doc.getElementById('tab0') || doc.querySelector('.tab_container');
        if (!tab) return [];
        const rows = [];
        tab.querySelectorAll('tbody tr').forEach(tr => {
            const tds = tr.querySelectorAll('td');
            let clubTdIdx = -1, clubA = null;
            for (let i = 0; i < tds.length; i++) {
                const a = tds[i].querySelector('a[club_link]');
                if (a) { clubA = a; clubTdIdx = i; break; }
            }
            if (!clubA) return;
            const vals = [];
            for (let i = clubTdIdx + 1; i < tds.length; i++) vals.push(tds[i].textContent.trim());
            rows.push({
                clubName: clubA.textContent.trim(),
                clubId: clubA.getAttribute('club_link'),
                vals,
                isMe: tr.classList.contains('highlighted_row')
            });
        });
        return rows;
    };

    const fetchClubStats = (stat, season, onDone) => {
        const s = window.TmLeagueCtx;
        const key = `club|${stat}|${season}`;
        if (s.statsCache[key]) { onDone(s.statsCache[key]); return; }
        const seasonStr = season ? `${season}/` : '';
        window.fetch(`/statistics/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/clubs/${stat}/${seasonStr}`)
            .then(r => r.text())
            .then(html => {
                const rows = parseClubStats(html);
                s.statsCache[key] = rows;
                onDone(rows);
            })
            .catch(() => onDone(null));
    };

    const parseTransfers = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const myId = typeof SESSION !== 'undefined' ? String(SESSION.id) : null;
        const result = { bought: [], sold: [], totals: {} };
        let boughtTable = null, soldTable = null;
        doc.querySelectorAll('h3').forEach(h3 => {
            const text = h3.textContent.trim().toLowerCase();
            let next = h3.nextElementSibling;
            while (next && next.tagName !== 'TABLE') next = next.nextElementSibling;
            if (!next) return;
            if (text.includes('bought')) boughtTable = next;
            else if (text.includes('sold')) soldTable = next;
        });
        const parseRows = (table) => {
            if (!table) return [];
            const rows = [];
            table.querySelectorAll('tr').forEach(tr => {
                const tds = tr.querySelectorAll('td');
                if (tds.length < 4) return;
                const playerA = tds[0].querySelector('a[player_link]');
                if (!playerA) return;
                const recTd = tds[1];
                const clubA = tds[2].querySelector('a[club_link]');
                if (!clubA) return;
                const recVal = parseFloat(recTd.getAttribute('sortvalue')) || 0;
                const isRetired = recTd.textContent.trim() === 'Retired';
                const price = parseFloat(tds[3].textContent.trim().replace(/,/g, '')) || 0;
                const clubId = clubA.getAttribute('club_link');
                rows.push({
                    name: playerA.textContent.trim(),
                    playerId: playerA.getAttribute('player_link'),
                    rec: recVal, isRetired,
                    clubName: clubA.textContent.trim(),
                    clubId, price,
                    isMe: myId && clubId === myId
                });
            });
            return rows;
        };
        result.bought = parseRows(boughtTable);
        result.sold = parseRows(soldTable);
        doc.querySelectorAll('td').forEach(td => {
            const strong = td.querySelector('strong');
            if (!strong) return;
            const text = td.textContent;
            if (text.includes('Total Bought:')) result.totals.bought = strong.textContent.trim();
            else if (text.includes('Total Sold:')) result.totals.sold = strong.textContent.trim();
            else if (text.includes('Balance:')) result.totals.balance = strong.textContent.trim();
        });
        return result;
    };

    const fetchTransfers = (season, onDone) => {
        const s = window.TmLeagueCtx;
        const key = `transfers|${season}`;
        if (s.statsCache[key]) { onDone(s.statsCache[key]); return; }
        window.fetch(`/history/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/transfers/${season}/`)
            .then(r => r.text())
            .then(html => {
                const data = parseTransfers(html);
                s.statsCache[key] = data;
                onDone(data);
            })
            .catch(() => onDone(null));
    };

    const renderPlayerStatsTab = () => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-stats-content');
        if (!container) return;
        const season = s.displayedSeason !== null
            ? s.displayedSeason
            : (typeof SESSION !== 'undefined' ? SESSION.season : null);

        const playerStatDefs = [
            ['goals', 'Goals'], ['assists', 'Assists'], ['productivity', 'Productivity'],
            ['rating', 'Rating'], ['cards', 'Cards'], ['man-of-the-match', 'MoM']
        ];
        const clubStatDefs = [
            ['goals', 'Goals'], ['attendance', 'Attendance'],
            ['injuries', 'Injuries'], ['possession', 'Possession'], ['cards', 'Cards']
        ];
        const playerColLabels = {
            goals: 'Goals', assists: 'Assists', productivity: 'Pts',
            rating: 'Rating', cards: 'Cards', 'man-of-the-match': 'MoM'
        };

        const isPlayers = s.statsMode === 'players';
        const statDefs = isPlayers ? playerStatDefs : clubStatDefs;
        const curStat = isPlayers ? s.statsStatType : s.statsClubStat;

        const modeBtns = `
            <div class="tsa-stat-mode-btns">
                <button class="tsa-stat-mode-btn${isPlayers ? ' tsa-stat-btn-active' : ''}" data-mode="players">Players</button>
                <button class="tsa-stat-mode-btn${!isPlayers ? ' tsa-stat-btn-active' : ''}" data-mode="clubs">Clubs</button>
            </div>`;
        const statBtns = statDefs
            .map(([k, v]) => `<button class="tsa-stat-btn${curStat === k ? ' tsa-stat-btn-active' : ''}" data-stat="${k}">${v}</button>`)
            .join('');
        const teamToggle = isPlayers ? `
            <div class="tsa-stat-team-btns">
                <button class="tsa-stat-team-btn${s.statsTeamType === 0 ? ' tsa-stat-btn-active' : ''}" data-team="0">Main</button>
                <button class="tsa-stat-team-btn${s.statsTeamType === 1 ? ' tsa-stat-btn-active' : ''}" data-team="1">U21</button>
            </div>` : '';

        container.innerHTML = `
            <div class="tsa-stats-bar tsa-stats-bar-mode">${modeBtns}</div>
            <div class="tsa-stats-bar">
                <div class="tsa-stat-btns">${statBtns}</div>
                ${teamToggle}
            </div>
            <div id="tsa-stats-table-wrap"><div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">Loading…</div></div>
        `;
        container.querySelectorAll('.tsa-stat-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => { s.statsMode = btn.dataset.mode; renderPlayerStatsTab(); });
        });
        container.querySelectorAll('.tsa-stat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (isPlayers) s.statsStatType = btn.dataset.stat;
                else s.statsClubStat = btn.dataset.stat;
                renderPlayerStatsTab();
            });
        });
        container.querySelectorAll('.tsa-stat-team-btn').forEach(btn => {
            btn.addEventListener('click', () => { s.statsTeamType = parseInt(btn.dataset.team); renderPlayerStatsTab(); });
        });

        const attachStatsSort = (wrap, getRows, buildHtml) => {
            let sortCol = -1, sortAsc = true;
            const render = () => {
                const sorted = [...getRows()];
                if (sortCol >= 0) {
                    sorted.sort((a, b) => {
                        const va = parseFloat(a._sortVals[sortCol]);
                        const vb = parseFloat(b._sortVals[sortCol]);
                        if (!isNaN(va) && !isNaN(vb)) return sortAsc ? va - vb : vb - va;
                        return sortAsc
                            ? String(a._sortVals[sortCol]).localeCompare(String(b._sortVals[sortCol]))
                            : String(b._sortVals[sortCol]).localeCompare(String(a._sortVals[sortCol]));
                    });
                }
                const tbody = wrap.querySelector('tbody');
                if (tbody) tbody.innerHTML = buildHtml(sorted);
                wrap.querySelectorAll('thead th[data-si]').forEach(th => {
                    const si = parseInt(th.dataset.si);
                    th.textContent = th.dataset.label + (si === sortCol ? (sortAsc ? ' ▲' : ' ▼') : '');
                });
            };
            wrap.querySelectorAll('thead th[data-si]').forEach(th => {
                th.style.cursor = 'pointer';
                const si = parseInt(th.dataset.si);
                th.addEventListener('click', () => {
                    if (sortCol === si) sortAsc = !sortAsc;
                    else { sortCol = si; sortAsc = (si === 1 || si === 2); }
                    render();
                });
            });
        };

        if (isPlayers) {
            fetchPlayerStats(s.statsStatType, season, s.statsTeamType, rows => {
                const wrap = document.getElementById('tsa-stats-table-wrap');
                if (!wrap) return;
                if (!rows || !rows.length) { wrap.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">No data.</div>`; return; }
                const colLabel = playerColLabels[s.statsStatType] || 'Value';
                const enriched = rows.map(r => ({ ...r, _sortVals: [r.rank, r.name, r.clubName, r.val] }));
                const buildRowsHtml = data => data.map(r => `
                    <tr class="${r.isMe ? 'tsa-stats-me' : ''}">
                        <td class="tsa-stats-rank">${r.rank}</td>
                        <td class="tsa-stats-name"><a href="/players/${r.playerId}/" target="_blank">${r.name}</a></td>
                        <td class="tsa-stats-club">${r.clubName}</td>
                        <td class="tsa-stats-val">${r.val}</td>
                    </tr>`).join('');
                wrap.innerHTML = `<div class="tsa-stats-scroll"><table class="tsa-stats-table">
                    <thead><tr>
                        <th data-si="0" data-label="#">#</th>
                        <th data-si="1" data-label="Player" style="text-align:left">Player</th>
                        <th data-si="2" data-label="Club" style="text-align:left">Club</th>
                        <th data-si="3" data-label="${colLabel}" class="tsa-stats-val">${colLabel}</th>
                    </tr></thead>
                    <tbody>${buildRowsHtml(enriched)}</tbody>
                </table></div>`;
                attachStatsSort(wrap, () => enriched, buildRowsHtml);
            });
        } else {
            fetchClubStats(s.statsClubStat, season, rows => {
                const wrap = document.getElementById('tsa-stats-table-wrap');
                if (!wrap) return;
                if (!rows || !rows.length) { wrap.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">No data.</div>`; return; }
                const cols = CLUB_STAT_COLS[s.statsClubStat] || [];
                const enriched = rows.map(r => ({ ...r, _sortVals: [0, r.clubName, ...r.vals] }));
                enriched.sort((a, b) => (parseFloat(b._sortVals[2]) || 0) - (parseFloat(a._sortVals[2]) || 0));
                enriched.forEach((r, i) => { r._rank = i + 1; r._sortVals[0] = i + 1; });
                const buildRowsHtml = data => data.map((r, i) => {
                    const valCells = r.vals.map(v => `<td class="tsa-stats-val">${v}</td>`).join('');
                    return `<tr class="${r.isMe ? 'tsa-stats-me' : ''}">
                        <td class="tsa-stats-rank">${i + 1}</td>
                        <td class="tsa-stats-name"><a href="/club/${r.clubId}/" target="_blank">${r.clubName}</a></td>
                        ${valCells}
                    </tr>`;
                }).join('');
                const headCols = cols.map((c, ci) =>
                    `<th data-si="${ci + 2}" data-label="${c}" class="tsa-stats-val">${c}</th>`).join('');
                wrap.innerHTML = `<div class="tsa-stats-scroll"><table class="tsa-stats-table">
                    <thead><tr>
                        <th data-si="0" data-label="#">#</th>
                        <th data-si="1" data-label="Club" style="text-align:left">Club</th>
                        ${headCols}
                    </tr></thead>
                    <tbody>${buildRowsHtml(enriched)}</tbody>
                </table></div>`;
                attachStatsSort(wrap, () => enriched, buildRowsHtml);
            });
        }
    };

    const renderTransfersTab = () => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-transfers-content');
        if (!container) return;
        const season = s.displayedSeason !== null
            ? s.displayedSeason
            : (typeof SESSION !== 'undefined' ? SESSION.season : null);
        container.innerHTML = `<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">Loading Season ${season} transfers…</div>`;

        fetchTransfers(season, data => {
            if (!data) {
                container.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">Failed to load transfers.</div>`;
                return;
            }
            const recColor = v => {
                if (v >= 18) return '#6cc040';
                if (v >= 15) return '#c8e0b4';
                if (v >= 12) return '#fbbf24';
                return '#9ca3af';
            };
            const recDisplay = v => (v / 3.38).toFixed(2);
            const attachSort = (wrap, getRows, buildHtml) => {
                let sortCol = -1, sortAsc = true;
                const render = () => {
                    const sorted = [...getRows()];
                    if (sortCol >= 0) {
                        sorted.sort((a, b) => {
                            const va = parseFloat(a._sortVals[sortCol]);
                            const vb = parseFloat(b._sortVals[sortCol]);
                            if (!isNaN(va) && !isNaN(vb)) return sortAsc ? va - vb : vb - va;
                            return sortAsc
                                ? String(a._sortVals[sortCol]).localeCompare(String(b._sortVals[sortCol]))
                                : String(b._sortVals[sortCol]).localeCompare(String(a._sortVals[sortCol]));
                        });
                    }
                    const tbody = wrap.querySelector('tbody');
                    if (tbody) tbody.innerHTML = buildHtml(sorted);
                    wrap.querySelectorAll('thead th[data-si]').forEach(th => {
                        const si = parseInt(th.dataset.si);
                        th.textContent = th.dataset.label + (si === sortCol ? (sortAsc ? ' ▲' : ' ▼') : '');
                    });
                };
                wrap.querySelectorAll('thead th[data-si]').forEach(th => {
                    const si = parseInt(th.dataset.si);
                    th.style.cursor = 'pointer';
                    th.addEventListener('click', () => {
                        if (sortCol === si) sortAsc = !sortAsc;
                        else { sortCol = si; sortAsc = (si === 1 || si === 2); }
                        render();
                    });
                });
            };
            const buildSection = (rows, clubLabel) => {
                const enriched = rows.map((r, i) => ({
                    ...r, _sortVals: [i + 1, r.name, r.clubName, r.rec, r.price]
                }));
                const buildRowsHtml = data => data.map((r, i) => {
                    const recCell = r.isRetired
                        ? `<td class="tsa-tr-rec" style="color:#5a7a48;font-style:italic">Ret</td>`
                        : `<td class="tsa-tr-rec" style="color:${recColor(r.rec)}">${recDisplay(r.rec)}</td>`;
                    return `<tr class="${r.isMe ? 'tsa-stats-me' : ''}">
                        <td class="tsa-stats-rank">${i + 1}</td>
                        <td class="tsa-stats-name"><a href="/players/${r.playerId}/" target="_blank">${r.name}</a></td>
                        ${recCell}
                        <td class="tsa-stats-club"><a href="/club/${r.clubId}/" target="_blank" style="color:${r.isMe ? '#8fdc60' : '#6a9a58'};text-decoration:none">${r.clubName}</a></td>
                        <td class="tsa-stats-val">${r.price.toFixed(1)}</td>
                    </tr>`;
                }).join('');
                const html = `<div class="tsa-stats-scroll"><table class="tsa-stats-table">
                    <thead><tr>
                        <th data-si="0" data-label="#">#</th>
                        <th data-si="1" data-label="Player" style="text-align:left">Player</th>
                        <th data-si="3" data-label="Rec" style="text-align:center">Rec</th>
                        <th data-si="2" data-label="${clubLabel}" style="text-align:left">${clubLabel}</th>
                        <th data-si="4" data-label="Price" class="tsa-stats-val">Price (M)</th>
                    </tr></thead>
                    <tbody>${buildRowsHtml(enriched)}</tbody>
                </table></div>`;
                return { enriched, buildRowsHtml, html };
            };
            const bought = buildSection(data.bought, 'Buyer');
            const sold = buildSection(data.sold, 'Seller');

            const teamMap = {};
            const ensureClub = r => {
                if (!teamMap[r.clubId]) teamMap[r.clubId] = {
                    clubId: r.clubId, clubName: r.clubName, isMe: r.isMe,
                    bCount: 0, bTotal: 0, sCount: 0, sTotal: 0
                };
            };
            data.bought.forEach(r => { ensureClub(r); teamMap[r.clubId].bCount++; teamMap[r.clubId].bTotal += r.price; });
            data.sold.forEach(r => { ensureClub(r); teamMap[r.clubId].sCount++; teamMap[r.clubId].sTotal += r.price; });
            const teamGroups = Object.values(teamMap).sort((a, b) => (b.sTotal - b.bTotal) - (a.sTotal - a.bTotal));
            const teamEnriched = teamGroups.map((g, i) => ({
                ...g,
                _sortVals: [i + 1, g.clubName, g.bCount, g.bTotal, g.sCount, g.sTotal, g.sTotal - g.bTotal]
            }));
            const buildTeamRowsHtml = rows => rows.map((g, i) => {
                const bal = g.sTotal - g.bTotal;
                const balCol = bal > 0 ? '#6cc040' : bal < 0 ? '#ef4444' : '#c8e0b4';
                return `<tr class="${g.isMe ? 'tsa-stats-me' : ''}">
                    <td class="tsa-stats-rank">${i + 1}</td>
                    <td class="tsa-stats-name"><a href="/club/${g.clubId}/" target="_blank" style="color:${g.isMe ? '#8fdc60' : '#6a9a58'};text-decoration:none">${g.clubName}</a></td>
                    <td class="tsa-stats-val">${g.bCount}</td>
                    <td class="tsa-stats-val">${g.bTotal.toFixed(1)}</td>
                    <td class="tsa-stats-val">${g.sCount}</td>
                    <td class="tsa-stats-val">${g.sTotal.toFixed(1)}</td>
                    <td class="tsa-stats-val" style="color:${balCol};font-weight:700">${bal >= 0 ? '+' : ''}${bal.toFixed(1)}</td>
                </tr>`;
            }).join('');
            const teamsHtml = `<div class="tsa-stats-scroll"><table class="tsa-stats-table">
                <thead>
                    <tr>
                        <th rowspan="2" data-si="0" data-label="#">#</th>
                        <th rowspan="2" data-si="1" data-label="Club" style="text-align:left">Club</th>
                        <th colspan="2" style="text-align:center;border-bottom:1px solid rgba(108,192,64,0.2);color:#6cc040">💰 Bought</th>
                        <th colspan="2" style="text-align:center;border-bottom:1px solid rgba(108,192,64,0.2);color:#6cc040">💸 Sold</th>
                        <th rowspan="2" data-si="6" data-label="Bal" class="tsa-stats-val">Bal</th>
                    </tr>
                    <tr>
                        <th data-si="2" data-label="Pl" class="tsa-stats-val">Pl</th>
                        <th data-si="3" data-label="Total" class="tsa-stats-val">Total</th>
                        <th data-si="4" data-label="Pl" class="tsa-stats-val">Pl</th>
                        <th data-si="5" data-label="Total" class="tsa-stats-val">Total</th>
                    </tr>
                </thead>
                <tbody>${buildTeamRowsHtml(teamEnriched)}</tbody>
            </table></div>`;
            const teamData = { enriched: teamEnriched, buildRowsHtml: buildTeamRowsHtml, html: teamsHtml };

            const bal = parseFloat((data.totals.balance || '').replace(/,/g, ''));
            const balColor = isNaN(bal) ? '#c8e0b4' : (bal >= 0 ? '#6cc040' : '#ef4444');
            const totalsHtml = data.totals.bought ? `
                <div class="tsa-tr-totals">
                    <span>Bought: <strong style="color:#c8e0b4">${data.totals.bought}M</strong></span>
                    <span>Sold: <strong style="color:#c8e0b4">${data.totals.sold}M</strong></span>
                    <span>Balance: <strong style="color:${balColor}">${data.totals.balance}M</strong></span>
                </div>` : '';

            container.innerHTML = `
                <div class="tsa-stats-bar tsa-stats-bar-mode">
                    <div class="tsa-stat-mode-btns">
                        <button class="tsa-stat-mode-btn${s.transfersView === 'bought' ? ' tsa-stat-btn-active' : ''}" data-tv="bought">💰 Bought <span class="tsa-tr-count">${data.bought.length}</span></button>
                        <button class="tsa-stat-mode-btn${s.transfersView === 'sold' ? ' tsa-stat-btn-active' : ''}" data-tv="sold">💸 Sold <span class="tsa-tr-count">${data.sold.length}</span></button>
                        <button class="tsa-stat-mode-btn${s.transfersView === 'teams' ? ' tsa-stat-btn-active' : ''}" data-tv="teams">🏟 Teams</button>
                    </div>
                </div>
                <div id="tsa-tr-bought-wrap" style="display:${s.transfersView === 'bought' ? '' : 'none'}">${bought.html}</div>
                <div id="tsa-tr-sold-wrap" style="display:${s.transfersView === 'sold' ? '' : 'none'}">${sold.html}</div>
                <div id="tsa-tr-teams-wrap" style="display:${s.transfersView === 'teams' ? '' : 'none'}">
                    <div id="tsa-tr-teams-inner">${teamData.html}</div>
                </div>
                ${totalsHtml}
            `;
            const allWraps = {
                bought: document.getElementById('tsa-tr-bought-wrap'),
                sold: document.getElementById('tsa-tr-sold-wrap'),
                teams: document.getElementById('tsa-tr-teams-wrap'),
            };
            container.querySelectorAll('.tsa-stat-mode-btn[data-tv]').forEach(btn => {
                btn.addEventListener('click', () => {
                    s.transfersView = btn.dataset.tv;
                    container.querySelectorAll('.tsa-stat-mode-btn[data-tv]').forEach(b =>
                        b.classList.toggle('tsa-stat-btn-active', b.dataset.tv === s.transfersView));
                    Object.entries(allWraps).forEach(([k, el]) => { if (el) el.style.display = k === s.transfersView ? '' : 'none'; });
                });
            });
            attachSort(allWraps.bought, () => bought.enriched, bought.buildRowsHtml);
            attachSort(allWraps.sold, () => sold.enriched, sold.buildRowsHtml);
            attachSort(document.getElementById('tsa-tr-teams-inner'), () => teamData.enriched, teamData.buildRowsHtml);
        });
    };

    window.TmLeagueStats = {
        CLUB_STAT_COLS,
        parsePlayerStats,
        fetchPlayerStats,
        parseClubStats,
        fetchClubStats,
        parseTransfers,
        fetchTransfers,
        renderPlayerStatsTab,
        renderTransfersTab
    };
})();



// ─── components/league/tm-league-skill-table.js ─────────────

// ==UserScript==
// @name         TM League Skill Table Component
// @namespace    https://trophymanager.com
// ==/UserScript==

/**
 * window.TmLeagueSkillTable
 *
 * Renders per-club average skill summary (REC / R5 / Age) and logs detailed
 * player-level data to the console.
 *
 * Reads from window.TmLeagueCtx:
 *   skillData, skillSortCol, skillSortAsc  (r/w)
 *   clubMap, clubDatas, clubPlayersMap     (r)
 *   SKILL_NAMES_FIELD, SKILL_NAMES_GK     (r)
 *   REC_THRESHOLDS, R5_THRESHOLDS, AGE_THRESHOLDS (r)
 *   getColor, sortData                    (r)
 */
(function () {
    'use strict';

    const renderSkillTable = () => {
        const s = window.TmLeagueCtx;
        const { skillData, skillSortCol, skillSortAsc, REC_THRESHOLDS, R5_THRESHOLDS, AGE_THRESHOLDS, getColor } = s;

        const arrow  = col => col !== skillSortCol ? '' : (skillSortAsc ? ' ▲' : ' ▼');
        const active = col => col === skillSortCol ? ' tsa-active' : '';

        let html = `<table class="tsa-table">
            <tr>
                <th class="tsa-left${active('#')}">#</th>
                <th class="tsa-left${active('name')}" data-sort-skill="name">Club${arrow('name')}</th>
                <th class="${active('REC')}" data-sort-skill="REC">REC${arrow('REC')}</th>
                <th class="${active('R5')}" data-sort-skill="R5">R5${arrow('R5')}</th>
                <th class="${active('Age')}" data-sort-skill="Age">Age${arrow('Age')}</th>
            </tr>`;

        skillData.forEach((row, idx) => {
            html += `<tr class="${idx % 2 === 0 ? 'tsa-even' : 'tsa-odd'}">
                <td class="tsa-left tsa-rank">${idx + 1}</td>
                <td class="tsa-left tsa-club">${row.name}</td>
                <td style="color:${getColor(row.REC, REC_THRESHOLDS)};font-weight:700">${row.REC.toFixed(2)}</td>
                <td style="color:${getColor(row.R5,  R5_THRESHOLDS)};font-weight:700">${row.R5.toFixed(2)}</td>
                <td style="color:${getColor(row.Age, AGE_THRESHOLDS)};font-weight:700">${row.Age.toFixed(1)}</td>
            </tr>`;
        });

        html += '</table>';
        $('#tsa-content').html(html);

        $('[data-sort-skill]').on('click', function () {
            const col = $(this).attr('data-sort-skill');
            if (col === s.skillSortCol) s.skillSortAsc = !s.skillSortAsc;
            else { s.skillSortCol = col; s.skillSortAsc = col === 'name'; }
            s.sortData(s.skillData, s.skillSortCol, s.skillSortAsc);
            renderSkillTable();
        });
    };

    const showSkill = () => {
        const s = window.TmLeagueCtx;
        s.skillData = [];
        console.log('%c[Squad Analysis] ═══ Per-Club Player Ratings ═══', 'font-weight:bold;color:#6cc040');

        s.clubMap.forEach((name, id) => {
            if (!s.clubDatas.has(id)) {
                s.skillData.push({ name, REC: 0, R5: 0, Age: 0 });
                return;
            }
            const entries = s.clubDatas.get(id);
            let avgREC = 0, avgR5 = 0, avgAge = 0;
            entries.forEach(cd => {
                avgREC += cd.REC / 11;
                avgR5  += cd.R5  / 11;
                avgAge += cd.Age / 11 / 12;
            });
            const n = entries.length;
            const teamREC = avgREC / n;
            const teamR5  = avgR5  / n;
            const teamAge = avgAge / n;
            s.skillData.push({ name, REC: teamREC, R5: teamR5, Age: teamAge });
        });

        s.sortData(s.skillData, s.skillSortCol, s.skillSortAsc);
        renderSkillTable();
    };

    window.TmLeagueSkillTable = { renderSkillTable, showSkill };
})();



// ─── components/league/tm-league-totr.js ────────────────────

// ==UserScript==
// @name         TM League TOTR Component
// @namespace    https://trophymanager.com
// ==/UserScript==

/**
 * window.TmLeagueTOTR
 *
 * Handles Team of the Round: parsing, fetching and rendering.
 * Reads and writes shared state via window.TmLeagueCtx.
 */
(function () {
    'use strict';

    if (!document.getElementById('tsa-league-totr-style')) {
        const _s = document.createElement('style');
        _s.id = 'tsa-league-totr-style';
        _s.textContent = `
            .totr-nav {
                display: flex; align-items: center; justify-content: space-between;
                padding: 6px 12px; border-bottom: 1px solid rgba(61,104,40,0.3);
            }
            .totr-nav-btn { padding: 2px 14px; font-size: 15px; }
            .totr-round-label { font-size: 12px; font-weight: 700; color: #c8e0b4; letter-spacing: 0.3px; }
            .totr-pitch {
                position: relative;
                background: linear-gradient(180deg, #2d6b1e 0%, #357a22 50%, #2d6b1e 100%);
                border: 2px solid #4a9030; overflow: hidden;
            }
            .totr-pitch-lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
            .totr-pitch-grid {
                position: relative; z-index: 1; display: grid;
                grid-template-columns: repeat(5, 20%);
                grid-template-rows: repeat(9, 11.11%);
                width: 100%; aspect-ratio: 68 / 75;
            }
            .totr-gk-row { position: absolute; bottom: 3%; left: 0; width: 100%; z-index: 2; }
            .totr-gk-cell { position: absolute; transform: translateX(-50%); bottom: 0; display: flex; flex-direction: column; align-items: center; }
            .totr-gk-info { display: flex; flex-direction: column; align-items: center; margin-bottom: 4px; pointer-events: auto; }
            .totr-gk-face {
                width: 95%; max-width: 68px; aspect-ratio: 1;
                border-radius: 50%; overflow: hidden;
                border: 2px solid rgba(255,255,255,0.65);
                box-shadow: 0 2px 8px rgba(0,0,0,0.6); background: #1c3410;
            }
            .totr-gk-face img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
            .totr-pitch-cell { position: relative; overflow: visible; }
            .totr-pitch-face {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                width: 95%; max-width: 68px; aspect-ratio: 1;
                border-radius: 50%; overflow: hidden;
                border: 2px solid rgba(255,255,255,0.65);
                box-shadow: 0 2px 8px rgba(0,0,0,0.6); z-index: 2; background: #1c3410;
            }
            .totr-pitch-face img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
            .totr-pitch-info {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, 0); margin-top: 42%;
                display: flex; flex-direction: column; align-items: center;
                z-index: 3; pointer-events: none;
            }
            .totr-pitch-label {
                font-size: 9px; color: #fff; pointer-events: auto;
                text-shadow: 0 1px 3px rgba(0,0,0,0.95);
                white-space: nowrap; text-align: center;
                font-weight: 700; line-height: 1.2; text-decoration: none;
            }
            .totr-pitch-label:hover { color: #c8ffa0; }
            .totr-pitch-club {
                font-size: 8px; color: rgba(200,255,160,0.65); pointer-events: auto;
                text-shadow: 0 1px 2px rgba(0,0,0,0.9);
                white-space: nowrap; text-align: center;
                font-weight: 500; line-height: 1.2; text-decoration: none;
            }
            .totr-pitch-club:hover { color: #c8ffa0; }
            .totr-pitch-rating { font-size: 9px; font-weight: 700; padding: 0 3px; border-radius: 3px; background: rgba(0,0,0,0.45); line-height: 1.3; }
            .totr-pitch-events { display: flex; gap: 1px; font-size: 8px; justify-content: center; }
        `;
        document.head.appendChild(_s);
    }

    const TOTR_THRESHOLDS = [5.5, 6, 6.5, 7, 7.5, 8, 8.5];

    const parseTOTRHtml = (htmlText) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const rounds = [...doc.querySelectorAll('#date_sel option')].map(opt => ({
            value: opt.value,
            text: opt.textContent.trim(),
            selected: opt.selected
        }));
        const lines = [...doc.querySelectorAll('.field_line')].map(line => {
            const lineName = [...line.classList].find(c => c !== 'field_line') || '';
            const players = [...line.querySelectorAll('.player')].map(p => {
                const playerLink = p.querySelector('a[player_link]');
                const ratingEl = p.querySelector('span[tooltip="Rating"]');
                const goals = p.querySelectorAll('img[src*="ball.gif"]').length;
                const clubLink = p.querySelector('a[club_link]');
                const photoImg = p.querySelector('div[style*="100px"] img');
                return {
                    playerId: playerLink?.getAttribute('player_link') || '',
                    name: playerLink?.textContent.trim() || '',
                    playerHref: playerLink?.getAttribute('href') || '',
                    photo: photoImg?.getAttribute('src') || '',
                    rating: parseFloat(ratingEl?.textContent) || 0,
                    goals,
                    clubName: clubLink?.textContent.trim() || '',
                    clubId: clubLink?.getAttribute('club_link') || ''
                };
            });
            return { lineName, players };
        });
        return { rounds, lines };
    };

    const renderTOTR = (data) => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-totr-content');
        if (!container) return;
        const currentIdx = data.rounds.findIndex(r => r.value === s.totrCurrentDate);
        const canPrev = currentIdx > 0;
        const canNext = currentIdx < data.rounds.length - 1;
        const currentRound = data.rounds[currentIdx] || {};

        const navHtml = `<div class="totr-nav">
            <button class="tsa-btn totr-nav-btn" id="totr-prev" ${canPrev ? '' : 'disabled'}>&#8592;</button>
            <span class="totr-round-label">${currentRound.text || '—'}</span>
            <button class="tsa-btn totr-nav-btn" id="totr-next" ${canNext ? '' : 'disabled'}>&#8594;</button>
        </div>`;

        const lw = 0.4, clr = 'rgba(255,255,255,0.22)', clr2 = 'rgba(255,255,255,0.3)';
        const pitchSVG = `<svg class="totr-pitch-lines" viewBox="0 0 100 110" preserveAspectRatio="none">
            <rect x="0" y="0" width="100" height="110" fill="none" stroke="${clr}" stroke-width="0.5"/>
            <line x1="0" y1="55" x2="100" y2="55" stroke="${clr}" stroke-width="${lw}"/>
            <circle cx="50" cy="55" r="9.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <circle cx="50" cy="55" r="1.2" fill="${clr2}"/>
            <rect x="20.5" y="0" width="59" height="17.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <rect x="36.5" y="0" width="27" height="6" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <circle cx="50" cy="11.7" r="1.2" fill="${clr2}"/>
            <path d="M 40 17.5 A 9.5 9.5 0 0 0 60 17.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <rect x="20.5" y="92.5" width="59" height="17.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <rect x="36.5" y="104" width="27" height="6" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <circle cx="50" cy="98.3" r="1.2" fill="${clr2}"/>
            <path d="M 40 92.5 A 9.5 9.5 0 0 1 60 92.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 0 1.5 A 1.5 1.5 0 0 1 1.5 0" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 98.5 0 A 1.5 1.5 0 0 1 100 1.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 0 108.5 A 1.5 1.5 0 0 0 1.5 110" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 98.5 110 A 1.5 1.5 0 0 0 100 108.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
        </svg>`;

        const lineRowMap = { forwards: 2, midfield: 5, defense: 8 };
        const spreadCols = n => {
            if (n === 1) return [3];
            if (n === 2) return [2, 4];
            if (n === 3) return [1, 3, 5];
            if (n === 4) return [1, 2, 4, 5];
            return [1, 2, 3, 4, 5];
        };

        const byLine = {};
        data.lines.forEach(l => { byLine[l.lineName] = l.players; });

        const cellMap = {};
        Object.entries(lineRowMap).forEach(([lineName, row]) => {
            const players = byLine[lineName] || [];
            const cols = spreadCols(players.length);
            players.forEach((p, i) => {
                const ratingColor = s.getColor(p.rating, TOTR_THRESHOLDS);
                const goalsHtml = p.goals > 0
                    ? `<div class="totr-pitch-events">${'⚽'.repeat(Math.min(p.goals, 4))}${p.goals > 4 ? `×${p.goals}` : ''}</div>`
                    : '';
                cellMap[`${row}-${cols[i]}`] =
                    `<div class="totr-pitch-face"><img src="${p.photo}" alt="" onerror="this.style.opacity=0"></div>` +
                    `<div class="totr-pitch-info">` +
                    `<a href="${p.playerHref}" class="totr-pitch-label">${p.name.split(' ').slice(-1)[0]}</a>` +
                    `<div class="totr-pitch-rating" style="color:${ratingColor}">${p.rating.toFixed(1)}</div>` +
                    (p.clubName ? `<a href="/club/${p.clubId}/" class="totr-pitch-club">${p.clubName}</a>` : '') +
                    goalsHtml +
                    `</div>`;
            });
        });

        let gridHTML = '';
        for (let r = 1; r <= 9; r++) {
            for (let c = 1; c <= 5; c++) {
                gridHTML += `<div class="totr-pitch-cell">${cellMap[`${r}-${c}`] || ''}</div>`;
            }
        }

        const gkPlayers = byLine['goalkeeper'] || [];
        const gkCols = spreadCols(gkPlayers.length);
        let gkOverlay = '';
        gkPlayers.forEach((p, i) => {
            const ratingColor = s.getColor(p.rating, TOTR_THRESHOLDS);
            const goalsHtml = p.goals > 0
                ? `<div class="totr-pitch-events">${'⚽'.repeat(Math.min(p.goals, 4))}${p.goals > 4 ? `×${p.goals}` : ''}</div>`
                : '';
            const colPct = (gkCols[i] - 1) * 20 + 10;
            gkOverlay +=
                `<div class="totr-gk-cell" style="left:${colPct}%">` +
                `<div class="totr-gk-info">` +
                `<a href="${p.playerHref}" class="totr-pitch-label">${p.name.split(' ').slice(-1)[0]}</a>` +
                `<div class="totr-pitch-rating" style="color:${ratingColor}">${p.rating.toFixed(1)}</div>` +
                (p.clubName ? `<a href="/club/${p.clubId}/" class="totr-pitch-club">${p.clubName}</a>` : '') +
                goalsHtml +
                `</div>` +
                `<div class="totr-gk-face"><img src="${p.photo}" alt="" onerror="this.style.opacity=0"></div>` +
                `</div>`;
        });

        container.innerHTML = navHtml +
            `<div class="totr-pitch">${pitchSVG}<div class="totr-pitch-grid">${gridHTML}</div>` +
            (gkOverlay ? `<div class="totr-gk-row">${gkOverlay}</div>` : '') +
            `</div>`;

        document.getElementById('totr-prev')?.addEventListener('click', () => {
            if (currentIdx > 0) fetchAndRenderTOTR(data.rounds[currentIdx - 1].value);
        });
        document.getElementById('totr-next')?.addEventListener('click', () => {
            if (currentIdx < data.rounds.length - 1) fetchAndRenderTOTR(data.rounds[currentIdx + 1].value);
        });
    };

    const fetchAndRenderTOTR = (date) => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-totr-content');
        if (!container) return;
        if (s.totrCache[date]) { s.totrCurrentDate = date; renderTOTR(s.totrCache[date]); return; }
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">Loading...</div>';
        const url = `/league/team-of-the-round/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/${date}/`;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (this.readyState !== 4) return;
            if (this.status !== 200) { container.innerHTML = '<div style="text-align:center;padding:20px;color:#f87171;">Failed to load</div>'; return; }
            const data = parseTOTRHtml(this.responseText);
            s.totrCache[date] = data;
            s.totrCurrentDate = date;
            renderTOTR(data);
        };
        xhr.send();
    };

    window.TmLeagueTOTR = { parseTOTRHtml, renderTOTR, fetchAndRenderTOTR };
})();



// ─── components/league/tm-league-panel.js ───────────────────

// ==UserScript==
// @name         TM League Panel Component
// @namespace    https://trophymanager.com
// ==/UserScript==

/**
 * window.TmLeaguePanel
 *
 * Builds and injects the main tabbed panel (Standings / Fixtures / TOTR / Stats / Transfers)
 * into the page, including the season picker and feed repositioning.
 * Reads and writes shared state via window.TmLeagueCtx.
 */
(function () {
    'use strict';

    if (!document.getElementById('tsa-league-panel-style')) {
        const _s = document.createElement('style');
        _s.id = 'tsa-league-panel-style';
        _s.textContent = `
            /* ── Panel header league name + season ── */
            .tsa-panel-league-name {
                font-size: 11px; font-weight: 700; color: #c8e0b4;
                letter-spacing: 0.3px; text-transform: none;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 240px;
            }
            .tsa-season-label {
                font-size: 10px; color: #6a9a58; font-weight: 700;
                white-space: nowrap; flex-shrink: 0;
            }
            /* ── Season autocomplete picker ── */
            .tsa-ssnpick { position: relative; flex-shrink: 0; }
            .tsa-ssn-chev {
                background: rgba(61,104,40,0.2); border: 1px solid #3d6828;
                border-radius: 8px; color: #a0c888; font-size: 14px; font-weight: 700;
                width: 18px; height: 18px; padding: 0; line-height: 1;
                cursor: pointer; display: flex; align-items: center; justify-content: center;
                transition: background 0.12s, color 0.12s; flex-shrink: 0;
            }
            .tsa-ssn-chev:hover:not(:disabled) { background: rgba(61,104,40,0.5); color: #c8e0b4; }
            .tsa-ssn-chev:disabled { opacity: 0.3; cursor: default; }
            .tsa-ssnpick-chip {
                background: rgba(61,104,40,0.25); border: 1px solid #3d6828;
                border-radius: 10px; color: #a0c888; font-size: 10px; font-weight: 700;
                padding: 1px 8px; cursor: pointer; letter-spacing: 0.2px;
                transition: background 0.12s, color 0.12s;
            }
            .tsa-ssnpick-chip:hover { background: rgba(61,104,40,0.5); color: #c8e0b4; }
            .tsa-ssnpick-pop {
                display: none; flex-direction: column;
                position: absolute; left: 0; top: calc(100% + 5px);
                width: 110px; background: #162b0f;
                border: 1px solid #3d6828; border-radius: 4px;
                box-shadow: 0 8px 20px rgba(0,0,0,0.7); z-index: 9999;
            }
            .tsa-ssnpick-input {
                background: rgba(0,0,0,0.3); border: none;
                border-bottom: 1px solid #3d6828;
                color: #c8e0b4; font-size: 10px; font-weight: 700;
                padding: 5px 8px; outline: none; border-radius: 4px 4px 0 0;
                width: 100%; box-sizing: border-box;
            }
            .tsa-ssnpick-input::placeholder { color: #4a7038; }
            .tsa-ssnpick-list {
                max-height: 160px; overflow-y: auto;
                scrollbar-width: thin; scrollbar-color: #3d6828 transparent;
            }
            .tsa-ssnpick-item {
                padding: 4px 8px; font-size: 10px; color: #7ab060;
                cursor: pointer; white-space: nowrap;
            }
            .tsa-ssnpick-item:hover { background: rgba(108,192,64,0.12); color: #c8e0b4; }
            .tsa-ssnpick-item.tsa-ssnpick-active { color: #6cc040; font-weight: 700; }
            /* ── Panel sub-tabs ── */
            .tsa-panel-tabs {
                display: flex;
                border-bottom: 1px solid rgba(61,104,40,0.4);
                background: rgba(0,0,0,0.12);
            }
            .tsa-panel-tab {
                flex: 1;
                padding: 6px 10px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                color: #6a9a58;
                border: none;
                border-bottom: 2px solid transparent;
                background: transparent;
                cursor: pointer;
                transition: all 0.15s;
            }
            .tsa-panel-tab:hover { color: #c8e0b4; background: rgba(255,255,255,0.04); }
            .tsa-panel-tab.tsa-panel-tab-active { color: #e8f5d8; border-bottom-color: #6cc040; background: rgba(108,192,64,0.07); }
        `;
        document.head.appendChild(_s);
    }

    const injectStandingsPanel = () => {
        if (document.getElementById('tsa-standings-panel')) return;
        const ctx = window.TmLeagueCtx;

        // Hide the native table
        const nativeTable = document.getElementById('overall_table');
        if (nativeTable) {
            const wrapper = nativeTable.closest('.box') || nativeTable.parentElement;
            if (wrapper) wrapper.style.display = 'none';
        }

        // Parse league params from the nav links (most reliable source — full URL always present)
        let lCountry = ctx.leagueCountry, lDivision = ctx.leagueDivision, lGroup = ctx.leagueGroup || '1';
        const navLink = document.querySelector('.column1 .content_menu a[href*="/league/"], .column1_a .content_menu a[href*="/league/"]');
        if (navLink) {
            const parts = navLink.getAttribute('href').split('/').filter(Boolean);
            // parts: ['league', 'cs', '1', '1']
            if (parts.length >= 3) { lCountry = parts[1]; lDivision = parts[2]; lGroup = parts[3] || '1'; }
        }
        // Store for use by fetchAndRenderTOTR (leagueCountry etc. may be wrong on subpages)
        const leagueAnchor = document.querySelector('a[league_link][href*="/league/"].normal.large, a[league_link][href*="/league/"]');
        ctx.setPanelLeague(lCountry, lDivision, lGroup, leagueAnchor?.textContent.trim() || null);

        // League name: try DOM first (link on the page), will be updated from match data later

        const currentSeason = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;

        const panel = document.createElement('div');
        panel.className = 'tmu-card';
        panel.id = 'tsa-standings-panel';
        panel.innerHTML = `
            <div class="tmu-card-head">
                <div style="display:flex;align-items:center;gap:6px;min-width:0">
                    <span id="tsa-panel-league-name" class="tsa-panel-league-name">${ctx.panelLeagueName || 'League'}</span>
                    ${lDivision ? `<span class="tsa-season-label">(${lDivision}.${lGroup})</span>` : ''}
                    ${currentSeason ? `<div class="tsa-ssnpick" id="tsa-ssnpick">
                        <div style="display:flex;align-items:center;gap:2px">
                            <button class="tsa-ssn-chev" id="tsa-ssn-prev" ${currentSeason <= 1 ? 'disabled' : ''}>&lsaquo;</button>
                            <button class="tsa-ssnpick-chip" id="tsa-ssnpick-chip">Season ${currentSeason}</button>
                            <button class="tsa-ssn-chev" id="tsa-ssn-next" disabled>&rsaquo;</button>
                        </div>
                        <div class="tsa-ssnpick-pop" id="tsa-ssnpick-pop">
                            <input class="tsa-ssnpick-input" id="tsa-ssnpick-input" type="text" placeholder="Season #…" autocomplete="off">
                            <div class="tsa-ssnpick-list" id="tsa-ssnpick-list">${Array.from({ length: currentSeason }, (_, i) => currentSeason - i)
                    .map(s => `<div class="tsa-ssnpick-item${s === currentSeason ? ' tsa-ssnpick-active' : ''}" data-s="${s}">Season ${s}</div>`)
                    .join('')
                }</div>
                        </div>
                    </div>` : ''}
                </div>
                <button class="tsa-change-league-btn" id="tsa-change-league-btn">Change League</button>
            </div>
            <div class="tsa-panel-tabs">
                <button class="tsa-panel-tab tsa-panel-tab-active" data-panel="standings">🏆 Standings</button>
                <button class="tsa-panel-tab" data-panel="fixtures">📅 Fixtures</button>
                <button class="tsa-panel-tab" data-panel="totr">⭐ Team of Round</button>
                <button class="tsa-panel-tab" data-panel="stats">📊 Statistics</button>
                <button class="tsa-panel-tab" data-panel="transfers">🔄 Transfers</button>
            </div>
            <div id="tsa-standings-content" class="tsa-standings-wrap"></div>
            <div id="tsa-fixtures-content" style="display:none"></div>
            <div id="tsa-totr-content" style="display:none"></div>
            <div id="tsa-stats-content" style="display:none"></div>
            <div id="tsa-transfers-content" style="display:none"></div>
        `;

        panel.querySelector('#tsa-change-league-btn')?.addEventListener('click', window.TmLeaguePicker.openLeagueDialog);

        panel.querySelectorAll('.tsa-panel-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                panel.querySelectorAll('.tsa-panel-tab').forEach(b => b.classList.remove('tsa-panel-tab-active'));
                btn.classList.add('tsa-panel-tab-active');
                const which = btn.dataset.panel;
                document.getElementById('tsa-standings-content').style.display = which === 'standings' ? '' : 'none';
                document.getElementById('tsa-fixtures-content').style.display = which === 'fixtures' ? '' : 'none';
                document.getElementById('tsa-totr-content').style.display = which === 'totr' ? '' : 'none';
                document.getElementById('tsa-stats-content').style.display = which === 'stats' ? '' : 'none';
                document.getElementById('tsa-transfers-content').style.display = which === 'transfers' ? '' : 'none';
                if (which === 'fixtures') {
                    if (ctx.displayedSeason !== null && ctx.historyFixturesData) window.TmLeagueFixtures.renderHistoryFixturesTab(ctx.historyFixturesData);
                    else if (ctx.displayedSeason !== null && !ctx.historyFixturesData) { /* fetch still in progress, shows loading */ }
                    else if (ctx.fixturesCache) window.TmLeagueFixtures.renderFixturesTab(ctx.fixturesCache);
                }
                if (which === 'totr') {
                    const date = ctx.totrCurrentDate || (ctx.allRounds[ctx.currentRoundIdx] && ctx.allRounds[ctx.currentRoundIdx].date);
                    if (date) window.TmLeagueTOTR.fetchAndRenderTOTR(date);
                    else document.getElementById('tsa-totr-content').innerHTML = '<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">Waiting for fixtures data...</div>';
                }
                if (which === 'stats') window.TmLeagueStats.renderPlayerStatsTab();
                if (which === 'transfers') window.TmLeagueStats.renderTransfersTab();
            });
        });

        // Insert before the overall_table's closest parent .box, or just prepend to column2_a
        const col2 = document.querySelector('.column2_a');
        if (col2) col2.insertBefore(panel, col2.firstChild);
        document.getElementById('tsa-change-league-btn')?.addEventListener('click', window.TmLeaguePicker.openLeagueDialog);

        // Move the native #feed element to appear right after the panel (preserves all TM like/comment JS)
        const nativeFeedEl = document.getElementById('feed');
        if (nativeFeedEl && col2) {
            const feedBox = nativeFeedEl.closest('.box') || nativeFeedEl.parentElement;
            const nodeToMove = (feedBox && feedBox !== col2) ? feedBox : nativeFeedEl;
            col2.insertBefore(nodeToMove, panel.nextSibling);
        }

        // Season autocomplete picker
        const ssnChip = document.getElementById('tsa-ssnpick-chip');
        const ssnPop = document.getElementById('tsa-ssnpick-pop');
        const ssnInput = document.getElementById('tsa-ssnpick-input');
        const ssnList = document.getElementById('tsa-ssnpick-list');
        if (ssnChip && ssnPop) {
            const openPop = () => {
                ssnPop.style.display = 'flex';
                ssnInput.value = '';
                ssnInput.focus();
                // scroll active item into view
                const active = ssnList.querySelector('.tsa-ssnpick-active');
                if (active) active.scrollIntoView({ block: 'nearest' });
            };
            const closePop = () => { ssnPop.style.display = 'none'; };
            ssnChip.addEventListener('click', e => { e.stopPropagation(); ssnPop.style.display === 'none' ? openPop() : closePop(); });
            ssnInput.addEventListener('input', () => {
                const q = ssnInput.value.trim();
                ssnList.querySelectorAll('.tsa-ssnpick-item').forEach(el => {
                    el.style.display = (!q || el.dataset.s.includes(q)) ? '' : 'none';
                });
            });
            ssnInput.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    const visible = [...ssnList.querySelectorAll('.tsa-ssnpick-item')].filter(el => el.style.display !== 'none');
                    if (visible.length === 1) visible[0].click();
                }
                if (e.key === 'Escape') closePop();
            });
            const updateChevrons = () => {
                const shown = ctx.displayedSeason ?? currentSeason;
                const prevBtn = document.getElementById('tsa-ssn-prev');
                const nextBtn = document.getElementById('tsa-ssn-next');
                if (prevBtn) prevBtn.disabled = shown <= 1;
                if (nextBtn) nextBtn.disabled = shown >= currentSeason;
            };
            const navigate = s => {
                ssnList.querySelectorAll('.tsa-ssnpick-item').forEach(el =>
                    el.classList.toggle('tsa-ssnpick-active', parseInt(el.dataset.s) === s));
                const chip = document.getElementById('tsa-ssnpick-chip');
                if (chip) chip.textContent = `Season ${s}`;
                if (s === currentSeason) {
                    ctx.resetToLive();
                    window.TmLeagueStandings.buildStandingsFromDOM();
                    window.TmLeagueStandings.renderLeagueTable();
                    const fixCont = document.getElementById('tsa-fixtures-content');
                    if (fixCont && fixCont.style.display !== 'none' && ctx.fixturesCache) window.TmLeagueFixtures.renderFixturesTab(ctx.fixturesCache);
                    const statsCont = document.getElementById('tsa-stats-content');
                    if (statsCont && statsCont.style.display !== 'none') window.TmLeagueStats.renderPlayerStatsTab();
                    const trCont = document.getElementById('tsa-transfers-content');
                    if (trCont && trCont.style.display !== 'none') window.TmLeagueStats.renderTransfersTab();
                } else {
                    ctx.setDisplayedSeason(s);
                    window.TmLeagueStandings.fetchHistoryStandings(s);
                    window.TmLeagueFixtures.fetchHistoryFixtures(s);
                    const statsCont = document.getElementById('tsa-stats-content');
                    if (statsCont && statsCont.style.display !== 'none') window.TmLeagueStats.renderPlayerStatsTab();
                    const trCont = document.getElementById('tsa-transfers-content');
                    if (trCont && trCont.style.display !== 'none') window.TmLeagueStats.renderTransfersTab();
                }
                updateChevrons();
            };
            ssnList.addEventListener('click', e => {
                const item = e.target.closest('.tsa-ssnpick-item');
                if (!item) return;
                closePop();
                navigate(parseInt(item.dataset.s));
            });
            document.getElementById('tsa-ssn-prev')?.addEventListener('click', e => {
                e.stopPropagation();
                const shown = ctx.displayedSeason ?? currentSeason;
                if (shown > 1) navigate(shown - 1);
            });
            document.getElementById('tsa-ssn-next')?.addEventListener('click', e => {
                e.stopPropagation();
                const shown = ctx.displayedSeason ?? currentSeason;
                if (shown < currentSeason) navigate(shown + 1);
            });
            document.addEventListener('click', e => { if (!document.getElementById('tsa-ssnpick').contains(e.target)) closePop(); });
        }
    };

    window.TmLeaguePanel = { injectStandingsPanel };
})();


// ─── tm-league.user.js (guarded: /^\/league\//) ─────────────
if (/^\/league\//.test(location.pathname)) {
﻿// ==UserScript==
// @name         TM League Enhanced Panel
// @namespace    https://trophymanager.com
// @version      1
// @description  Enhanced league overview for TrophyManager: squad skill ratings, TOTR, standings, transfers, top scorers, and quick league switcher
// @match        https://trophymanager.com/league/*
// @grant        none
// @require      file://H:/projects/Moji/tmscripts/lib/tm-constants.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-position.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-utils.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-lib.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-playerdb.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-dbsync.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-services.js
// @require      file://H:/projects/Moji/tmscripts/components/shared/tm-ui.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-utils.js
// @require      file://H:/projects/Moji/tmscripts/components/league/tm-league-styles.js
// @require      file://H:/projects/Moji/tmscripts/components/league/tm-league-panel.js
// @require      file://H:/projects/Moji/tmscripts/components/league/tm-league-standings.js
// @require      file://H:/projects/Moji/tmscripts/components/league/tm-league-fixtures.js
// @require      file://H:/projects/Moji/tmscripts/components/league/tm-league-totr.js
// @require      file://H:/projects/Moji/tmscripts/components/league/tm-league-stats.js
// @require      file://H:/projects/Moji/tmscripts/components/league/tm-league-picker.js
// @require      file://H:/projects/Moji/tmscripts/components/league/tm-league-skill-table.js
// @require      file://H:/projects/Moji/tmscripts/components/league/tm-league-rounds.js
// ==/UserScript==

(function () {
    'use strict';

    // ─── Constants ───────────────────────────────────────────────────────
    const STORAGE_KEY = 'TM_LEAGUE_LINEUP_NUM_ROUNDS';

    const SKILL_NAMES_FIELD = window.TmConst.SKILL_DEFS_OUT.map(d => d.label || d.key);
    const SKILL_NAMES_GK = window.TmConst.SKILL_DEFS_GK.map(d => d.label || d.key);

    const { REC_THRESHOLDS, R5_THRESHOLDS, AGE_THRESHOLDS } = window.TmConst;

    // ─── Squad fetching via TmApi (one call per club per run) ─────────────
    const squadCache = new Map(); // clubId → Promise<{post:{id:player}}>

    const fetchSquad = clubId => {
        if (!squadCache.has(clubId)) {
            squadCache.set(clubId, window.TmApi.fetchSquadRaw(clubId).then(data => {
                if (!data?.post) return { post: {} };
                if (Array.isArray(data.post)) {
                    const postObj = {};
                    data.post.forEach(p => { postObj[String(p.id)] = p; });
                    data.post = postObj;
                }
                return data;
            }).catch(() => ({ post: {} })));
        }
        return squadCache.get(clubId);
    };

    // ─── Per-player R5 resolution ─────────────────────────────────────────
    // squadPost is the full fetchSquad response: {post: {pid: normalizedPlayer}}.
    // Players in post are already normalized by fetchSquadRaw (r5/rec/positions/ageMonths present).
    // Tooltip fallback only for players no longer in the current squad (transferred), with a cache.
    const tooltipCache = new Map(); // pid → Promise<player|null>

    const getPlayerDataFromSquad = async (pid, squadPost, matchPos) => {
        
        let player = squadPost.post?.[String(pid)];
        if (!player) {
            if (!tooltipCache.has(pid)) {
                tooltipCache.set(pid, window.TmApi.fetchPlayerTooltip(pid)
                    .then(r => r?.player ?? null).catch(() => null));
            }
            player = await tooltipCache.get(pid);
        }
        if (!player) return { Age: 0, R5: 0, REC: 0, isGK: false, skills: [], routine: 0 };
        const posData = player.positions?.find(p => p.position?.toLowerCase() === matchPos);
        const r5 = Number(posData?.r5 ?? player.r5 ?? 0);
        const rec = Number(posData?.rec ?? player.rec ?? 0);
        return { Age: player.ageMonths, R5: r5, REC: rec, isGK: player.isGK, skills: player.skills, routine: player.routine };
    };

    // ─── Team statistics (average R5 of 11 starters) ─────────────────────
    const computeTeamStats = async (playerIds, lineup, squadPost) => {
        const starters = playerIds.filter(id => !lineup[id].position.includes('sub'));
        const players = await Promise.all(starters.map(async id => {
            const matchPos = lineup[id].position;
            const p = await getPlayerDataFromSquad(id, squadPost, matchPos);
            return { id, name: lineup[id].name || String(id), pos: matchPos, ...p };
        }));
        const totals = { Age: 0, REC: 0, R5: 0 };
        players.forEach(p => { totals.Age += p.Age; totals.REC += p.REC; totals.R5 += p.R5; });
        return { totals, players };
    };

    // Page type detection
    let pagePath = window.location.pathname;
    let isLeaguePage = /^\/league\//.test(pagePath);
    let lastInitPath = '';
    let leaguePollInterval = null;

    // ─── State ───────────────────────────────────────────────────────────
    let urlParts = pagePath.split('/').filter(Boolean);
    let leagueCountry = isLeaguePage ? urlParts[1] : null;
    let leagueDivision = isLeaguePage ? urlParts[2] : null;
    let leagueGroup = isLeaguePage ? (urlParts[3] || '1') : null;

    let numLastRounds = parseInt(localStorage.getItem(STORAGE_KEY)) || 5;
    let clubDatas = new Map();
    let clubMap = new Map();
    let clubPlayersMap = new Map(); // clubId → Map<playerId, {pos,R5,REC,Age}>
    let totalExpected = 0;
    let totalProcessed = 0;
    let analysisInterval = null;
    let skillData = [];
    let skillSortCol = 'R5';
    let skillSortAsc = false;

    // ─── Rounds state ────────────────────────────────────────────────────
    let allRounds = [];        // [{roundNum, date, matches}] sorted by date asc
    let currentRoundIdx = 0;   // index into allRounds
    let fixturesCache = null;  // raw fixtures response

    // ─── Team of the Round state ─────────────────────────────────────────
    const totrCache = {};      // date → parsed TOTR data
    let totrCurrentDate = null;
    // Correct league params (parsed from nav link, reliable on all subpages)
    let panelCountry = null, panelDivision = null, panelGroup = null;
    let panelLeagueName = '';

    // ─── Standings state ─────────────────────────────────────────────────
    let standingsRows = [];    // parsed from DOM #overall_table
    let liveZoneMap = {};      // rank → zone, built from live #overall_table (reused for history seasons)
    let formOffset = 0;        // 0=default: 5 recent played + 1 upcoming at pos 6; positive=older; negative=more upcoming
    let stdVenue = 'total';    // 'total' | 'home' | 'away'
    let stdFormN = 0;          // 0=All, 5, 10, 15, 20, 25, 30 – last-N-matches filter
    let displayedSeason = null; // null = live current, number = history mode
    let historyFixturesData = null; // null = live, {season, groups} = history mode
    let histFixTooltipCache = {};
    let histFixTooltipEl = null;
    let histFixTooltipTimer = null;
    let histFixTooltipHideTimer = null;

    // ─── Player stats state ────────────────────────────────────────────────
    let statsStatType = 'goals'; // goals | assists | productivity | rating | cards | man-of-the-match
    let statsTeamType = 0;       // 0 = Main team (tab0), 1 = Under 21 (tab1)
    let statsMode = 'players';   // 'players' | 'clubs'
    let statsClubStat = 'goals'; // goals | attendance | injuries | possession | cards
    let transfersView = 'bought'; // 'bought' | 'sold' | 'teams'
    let statsCache = {};         // keyed by `${mode}|${stat}|${season}|${teamIdx}`


    // --- Shared context: all components access state via window.TmLeagueCtx ---
    // Components read/write state through this object; closure vars are the backing store.
    // Getter/setter pairs keep component access in sync with main-script mutations.
    const ctx = window.TmLeagueCtx = { // eslint-disable-line no-unused-vars
        // ── League identity (set by tm-league.user.js; reset on navigation) ──
        get leagueCountry() { return leagueCountry; }, set leagueCountry(v) { leagueCountry = v; },
        get leagueDivision() { return leagueDivision; }, set leagueDivision(v) { leagueDivision = v; },
        get leagueGroup() { return leagueGroup; }, set leagueGroup(v) { leagueGroup = v; },
        // ── Panel state (set by tm-league-panel.js and shared components) ──
        get panelCountry() { return panelCountry; }, set panelCountry(v) { panelCountry = v; },
        get panelDivision() { return panelDivision; }, set panelDivision(v) { panelDivision = v; },
        get panelGroup() { return panelGroup; }, set panelGroup(v) { panelGroup = v; },
        get panelLeagueName() { return panelLeagueName; }, set panelLeagueName(v) { panelLeagueName = v; },
        // ── Rounds analysis (set by tm-league-rounds.js) ──
        get numLastRounds() { return numLastRounds; }, set numLastRounds(v) { numLastRounds = v; },
        get clubDatas() { return clubDatas; }, set clubDatas(v) { clubDatas = v; },
        get clubMap() { return clubMap; }, set clubMap(v) { clubMap = v; },
        get clubPlayersMap() { return clubPlayersMap; }, set clubPlayersMap(v) { clubPlayersMap = v; },
        get totalExpected() { return totalExpected; }, set totalExpected(v) { totalExpected = v; },
        get totalProcessed() { return totalProcessed; }, set totalProcessed(v) { totalProcessed = v; },
        get analysisInterval() { return analysisInterval; }, set analysisInterval(v) { analysisInterval = v; },
        // ── Skill table (set by tm-league-skill-table.js) ──
        get skillData() { return skillData; }, set skillData(v) { skillData = v; },
        get skillSortCol() { return skillSortCol; }, set skillSortCol(v) { skillSortCol = v; },
        get skillSortAsc() { return skillSortAsc; }, set skillSortAsc(v) { skillSortAsc = v; },
        // ── Rounds list (set by tm-league-rounds.js) ──
        get allRounds() { return allRounds; }, set allRounds(v) { allRounds = v; },
        get currentRoundIdx() { return currentRoundIdx; }, set currentRoundIdx(v) { currentRoundIdx = v; },
        get fixturesCache() { return fixturesCache; }, set fixturesCache(v) { fixturesCache = v; },
        // ── Team of the Round (set by tm-league-totr.js) ──
        get totrCache() { return totrCache; },               // only mutated, not reassigned
        get totrCurrentDate() { return totrCurrentDate; }, set totrCurrentDate(v) { totrCurrentDate = v; },
        // ── Standings (set by tm-league-standings.js) ──
        get standingsRows() { return standingsRows; }, set standingsRows(v) { standingsRows = v; },
        get liveZoneMap() { return liveZoneMap; }, set liveZoneMap(v) { liveZoneMap = v; },
        get formOffset() { return formOffset; }, set formOffset(v) { formOffset = v; },
        get stdVenue() { return stdVenue; }, set stdVenue(v) { stdVenue = v; },
        get stdFormN() { return stdFormN; }, set stdFormN(v) { stdFormN = v; },
        // ── History fixtures (set by tm-league-fixtures.js; displayedSeason also by tm-league-panel.js) ──
        get displayedSeason() { return displayedSeason; }, set displayedSeason(v) { displayedSeason = v; },
        get historyFixturesData() { return historyFixturesData; }, set historyFixturesData(v) { historyFixturesData = v; },
        get histFixTooltipCache() { return histFixTooltipCache; },     // only mutated
        get histFixTooltipEl() { return histFixTooltipEl; }, set histFixTooltipEl(v) { histFixTooltipEl = v; },
        get histFixTooltipTimer() { return histFixTooltipTimer; }, set histFixTooltipTimer(v) { histFixTooltipTimer = v; },
        get histFixTooltipHideTimer() { return histFixTooltipHideTimer; }, set histFixTooltipHideTimer(v) { histFixTooltipHideTimer = v; },
        // ── Stats & transfers (set by tm-league-stats.js) ──
        get statsStatType() { return statsStatType; }, set statsStatType(v) { statsStatType = v; },
        get statsTeamType() { return statsTeamType; }, set statsTeamType(v) { statsTeamType = v; },
        get statsMode() { return statsMode; }, set statsMode(v) { statsMode = v; },
        get statsClubStat() { return statsClubStat; }, set statsClubStat(v) { statsClubStat = v; },
        get transfersView() { return transfersView; }, set transfersView(v) { transfersView = v; },
        get statsCache() { return statsCache; },              // only mutated
        // Functions — lazy getters (defined later in IIFE; called only from events/timers)
        get fetchSquad() { return fetchSquad; },
        get computeTeamStats() { return computeTeamStats; },
        get updateProgress() { return updateProgress; },
        get sortData() { return sortData; },
        // Constants — shared display config, injected from main scope
        getColor: window.TmUtils.getColor, STORAGE_KEY, SKILL_NAMES_FIELD, SKILL_NAMES_GK, REC_THRESHOLDS, R5_THRESHOLDS, AGE_THRESHOLDS,
        // ── Coordinated state transitions ─────────────────────────────────────────────────────
        // Use these instead of direct property writes when multiple fields must change together.
        // They prevent the partial-update bugs that arise when callers forget a related field.
        // ───────────────────────────────────────────────────────────────────────
        /** Set the three panel league params (+ optional name) atomically. */
        setPanelLeague(country, division, group, name) {
            panelCountry = country; panelDivision = division; panelGroup = group;
            if (name != null) panelLeagueName = name;
        },
        /** Switch back to live (current-season) standings view. Clears history-mode state. */
        resetToLive() {
            displayedSeason = null; historyFixturesData = null;
            standingsRows = []; formOffset = 0;
        },
        /** Switch to a history season. Clears stale fixtures data so fetchers refill it. */
        setDisplayedSeason(s) {
            displayedSeason = s; historyFixturesData = null;
        },
        /** Set the rounds list and active index atomically (avoids indexing stale allRounds). */
        setRoundsData(rounds, idx) {
            allRounds = rounds; currentRoundIdx = idx;
        },
        /** Reset analysis accumulation state. Call before kicking off a new analysis pass. */
        beginAnalysis() {
            clubDatas.clear(); clubPlayersMap.clear();
            totalExpected = 0; totalProcessed = 0;
        },
    };
    // ─── UI helpers ──────────────────────────────────────────────────────
    const updateProgress = text => {
        const el = document.getElementById('tm_script_progress');
        if (el) el.textContent = text;
    };

    const sortData = (data, col, asc) => {
        data.sort((a, b) => {
            if (col === 'name') return asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            return asc ? a[col] - b[col] : b[col] - a[col];
        });
    };

    const patchFeedBox = () => {
        try {
            const feedBox = $('#tabfeed').closest('.box');
            if (!feedBox.length) return;
            feedBox.find('.box_head').removeClass('box_head').addClass('tsa-feed-head');
            feedBox.find('.tabs_outer').removeClass('tabs_outer').addClass('tsa-feed-tabs-outer');
            feedBox.find('.tabs_new').removeClass('tabs_new').addClass('tsa-feed-tabs');
            feedBox.find('.tabs_content').removeClass('tabs_content').addClass('tsa-feed-content');
        } catch (e) { }
    };

    const injectStyles = () => window.TmLeagueStyles.inject();

    const cleanupPage = () => {
        if (leaguePollInterval) { clearInterval(leaguePollInterval); leaguePollInterval = null; }
        if (analysisInterval) { clearInterval(analysisInterval); analysisInterval = null; }
        allRounds = [];
        currentRoundIdx = 0;
        fixturesCache = null;
        totrCurrentDate = null;
        Object.keys(totrCache).forEach(k => delete totrCache[k]);
        panelLeagueName = '';
        clubDatas = new Map();
        clubMap = new Map();
        clubPlayersMap = new Map();
        squadCache.clear();
        tooltipCache.clear();
        totalExpected = 0;
        totalProcessed = 0;
        skillData = [];
        standingsRows = [];
        formOffset = 0;
        const navTabs = document.getElementById('tsa-nav-tabs');
        if (navTabs) navTabs.remove();
        const sp = document.getElementById('tsa-standings-panel');
        if (sp) sp.remove();
        const nativeTable = document.getElementById('overall_table');
        if (nativeTable) {
            const wrapper = nativeTable.closest('.box') || nativeTable.parentElement;
            if (wrapper) wrapper.style.display = '';
        }
    };

    const initForCurrentPage = () => {
        const path = window.location.pathname;
        if (path === lastInitPath) return;
        lastInitPath = path;
        pagePath = path;
        isLeaguePage = /^\/league\//.test(path);
        const urlParts = path.split('/').filter(Boolean);
        leagueCountry = isLeaguePage ? urlParts[1] : null;
        leagueDivision = isLeaguePage ? urlParts[2] : null;
        leagueGroup = isLeaguePage ? (urlParts[3] || '1') : null;
        cleanupPage();
        injectStyles();
        patchFeedBox();

        // Remove TM's default Rounds widget and ad placeholder
        try { $('.banner_placeholder.rectangle')[0].parentNode.removeChild($('.banner_placeholder.rectangle')[0]); } catch (e) { }
        try { $('.column3_a .box').has('h2').filter(function () { return $(this).find('h2').text().trim().toUpperCase() === 'ROUNDS'; }).remove(); } catch (e) { }

        const initUI = () => {
            const clubLinks = $('#overall_table td a[club_link]');
            if (!clubLinks.length) return;
            clearInterval(leaguePollInterval);
            leaguePollInterval = null;

            $('#overall_table td').each(function () {
                const id = $(this).children('a').attr('club_link');
                if (id) clubMap.set(id, $(this).children('a')[0].innerHTML);
            });

            // Inject our custom standings panel & initial render (form added after fixtures load)
            window.TmLeaguePanel.injectStandingsPanel();
            window.TmLeagueStandings.buildStandingsFromDOM();
            window.TmLeagueStandings.renderLeagueTable();

            $(".column3_a").append(`
                <div class="tmu-card" id="rnd-panel">
                    <div class="tmu-card-head rnd-nav">
                        <button id="rnd-prev" class="rnd-nav-btn" title="Previous round"><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></button>
                        <span class="rnd-title" id="rnd-title">Round —</span>
                        <button id="rnd-next" class="rnd-nav-btn" title="Next round"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg></button>
                    </div>
                    <div id="rnd-content"></div>
                </div>
            `);

            $(".column3_a").append(`
                <div class="tmu-card mt-2">
                    <div class="tmu-card-head">Squad Analysis</div>
                    <div class="tsa-controls">
                        <span>Last</span>
                        <input id="tm_script_num_matches" type="number" class="tsa-input"
                            value="${numLastRounds}" min="1" max="34">
                        <span>rounds</span>
                        <button id="tm_script_analyze_btn" class="tsa-btn">Analyze</button>
                        <span id="tm_script_progress" class="tsa-progress"></span>
                    </div>
                    <div id="tsa-content"></div>
                </div>
            `);

            document.getElementById('tm_script_analyze_btn').addEventListener('click', () => {
                const n = parseInt($('#tm_script_num_matches').val()) || 5;
                localStorage.setItem(STORAGE_KEY, n);
                window.TmLeagueRounds.startAnalysis(n);
            });

            document.getElementById('rnd-prev').addEventListener('click', () => {
                if (currentRoundIdx > 0) { currentRoundIdx--; window.TmLeagueRounds.renderRound(); }
            });
            document.getElementById('rnd-next').addEventListener('click', () => {
                if (currentRoundIdx < allRounds.length - 1) { currentRoundIdx++; window.TmLeagueRounds.renderRound(); }
            });

            window.TmLeagueRounds.startAnalysis(numLastRounds);
        };

        leaguePollInterval = setInterval(initUI, 500);
        initUI();
    };

    window.TmPlayerDB.init().catch(e => console.warn('[League] TmPlayerDB init failed:', e));
    setInterval(initForCurrentPage, 500);
    initForCurrentPage();
})();
}
