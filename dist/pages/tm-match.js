
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



// ─── components/match/tm-match-styles.js ────────────────────

﻿// tm-match-styles.js - Match dialog CSS injection for TM Match Viewer
// Depends on: nothing
// Exposed as: window.TmMatchStyles = { inject }
(function () {
    'use strict';

    const inject = () => {
        if (document.getElementById('tsa-match-style')) return;
        const style = document.createElement('style');
        style.id = 'tsa-match-style';
        style.textContent = `
            /* ── Match Dialog ── */
            .rnd-overlay {
                position: fixed; top:0; left:0; right:0; bottom:0;
                background: rgba(0,0,0,0.65);
                z-index: 10000;
                display: flex; align-items: center; justify-content: center;
            }
            .rnd-dialog {
                background: #1c3410; border: none;
                border-radius: 0; width: 100vw; height: 100vh;
                overflow: hidden; display: flex; flex-direction: column;
            }
            .rnd-dlg-head {
                background: linear-gradient(180deg, #162e0e 0%, #1c3a14 50%, #152c0d 100%);
                padding: 14px 16px 8px;
                position: relative;
                border-bottom: 2px solid rgba(80,160,48,.2);
                overflow: visible; z-index: 2;
            }
            .rnd-dlg-head-content {
                display: flex; flex-direction: column; align-items: center;
            }
            .rnd-dlg-head-row {
                display: flex; align-items: center;
                justify-content: center; width: 100%;
            }
            .rnd-dlg-team-group {
                display: flex; align-items: center; gap: 10px;
                flex: 1; min-width: 0;
            }
            .rnd-dlg-team-group.home { justify-content: flex-end; }
            .rnd-dlg-team-group.away { justify-content: flex-start; }
            .rnd-dlg-team-info {
                display: flex; flex-direction: column; gap: 3px; min-width: 0;
            }
            .rnd-dlg-team-group.home .rnd-dlg-team-info { align-items: flex-end; }
            .rnd-dlg-team-group.away .rnd-dlg-team-info { align-items: flex-start; }
            .rnd-dlg-team {
                color: #eaf6dc; font-weight: 700; font-size: 14px;
                letter-spacing: 0.3px; line-height: 1.2;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 200px;
            }
            .rnd-dlg-chips {
                display: flex; gap: 3px; flex-wrap: wrap;
            }
            .rnd-dlg-team-group.home .rnd-dlg-chips { justify-content: flex-end; }
            .rnd-dlg-chip {
                font-size: 8.5px; font-weight: 600; color: #8cb878;
                background: rgba(0,0,0,.35); padding: 1px 5px;
                border-radius: 4px; white-space: nowrap;
                letter-spacing: 0.2px; line-height: 1.4;
                border: 1px solid rgba(255,255,255,.04);
            }
            .rnd-dlg-chip .chip-val { color: #c8e4b0; font-weight: 700; }
            .rnd-dlg-score-block {
                display: flex; flex-direction: column; align-items: center;
                flex-shrink: 0; padding: 0 14px;
            }
            .rnd-dlg-score {
                color: #ffffff; font-weight: 800; font-size: 32px;
                letter-spacing: 3px; line-height: 1;
                text-shadow: 0 0 20px rgba(128,224,64,.2), 0 1px 3px rgba(0,0,0,.5);
            }
            .rnd-dlg-datetime {
                text-align: center; margin-top: 2px;
                font-size: 10.5px; color: #6a9a58; letter-spacing: 0.3px;
                font-weight: 500;
            }
            .rnd-dlg-close {
                position: absolute; top: 6px; right: 6px;
                background: rgba(255,255,255,.05); border: none; border-radius: 50%;
                color: rgba(232,245,216,.4); font-size: 17px; cursor: pointer;
                width: 26px; height: 26px;
                display: flex; align-items: center; justify-content: center;
                transition: all 0.2s; z-index: 3; line-height: 1;
            }
            .rnd-dlg-close:hover { background: rgba(255,255,255,.15); color: #e8f5d8; transform: scale(1.1); }

            /* ── Live replay ── */
            .rnd-live-bar {
                display: flex; align-items: center; gap: 10px;
                background: #1a3a10; padding: 6px 24px;
                border-bottom: 1px solid #3d6828; justify-content: center;
            }
            .rnd-live-min {
                font-size: 16px; font-weight: 700; color: #80e040;
                min-width: 48px; text-align: center;
                animation: rnd-pulse 1.2s ease-in-out infinite;
            }
            @keyframes rnd-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
            .rnd-live-progress {
                flex: 1; max-width: 400px; height: 6px;
                background: #274a18; border-radius: 3px; overflow: hidden;
            }
            .rnd-live-progress-fill {
                height: 100%; background: linear-gradient(90deg, #4a9030, #80e040);
                border-radius: 3px; transition: width 0.4s;
            }
            .rnd-live-btn {
                background: none; border: 1px solid #5aa838; border-radius: 3px;
                color: #c8e0b4; font-size: 14px; cursor: pointer;
                width: 28px; height: 28px;
                display: flex; align-items: center; justify-content: center;
                transition: background 0.15s;
            }
            .rnd-live-btn:hover { background: rgba(255,255,255,0.1); }
            .rnd-live-label {
                font-size: 11px; color: #5a7a48; text-transform: uppercase;
                letter-spacing: 1px; font-weight: 600;
            }
            .rnd-live-ended .rnd-live-min { color: #90b878; animation: none; }
            .rnd-live-feed-line {
                padding: 6px 0; border-bottom: 1px solid #274a18;
                animation: rnd-feedIn 0.4s ease;
            }
            @keyframes rnd-feedIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
            .rnd-live-feed-min {
                font-size: 11px; font-weight: 700; color: #80e040;
                margin-right: 6px;
            }
            .rnd-live-feed-text { color: #c8e0b4; font-size: 13px; }
            .rnd-tabs {
                display: flex; background: #274a18;
                border-bottom: 1px solid #3d6828;
            }
            .rnd-tab {
                flex: 1; padding: 6px 8px; text-align: center;
                font-size: 11px; font-weight: 600; text-transform: uppercase;
                letter-spacing: 0.5px; color: #90b878; cursor: pointer;
                border-bottom: 2px solid transparent; transition: all 0.15s;
            }
            .rnd-tab:hover { color: #c8e0b4; background: #305820; }
            .rnd-tab.active { color: #e8f5d8; border-bottom-color: #6cc040; background: #305820; }
            .rnd-dlg-body {
                overflow-y: auto; padding: 8px 32px;
                flex: 1; color: #c8e0b4; font-size: 13px;
            }
            .rnd-event-row {
                display: flex; align-items: flex-start; gap: 8px;
                padding: 4px 0; border-bottom: 1px solid #325a1e;
            }
            .rnd-event-min { color: #90b878; font-weight: 600; min-width: 28px; text-align: right; }
            .rnd-event-icon { min-width: 18px; text-align: center; }
            .rnd-event-text { flex: 1; color: #c8e0b4; }
            /* ── Venue tab ── */
            .rnd-venue-wrap { max-width: 900px; margin: 0 auto; }
            .rnd-venue-hero {
                position: relative; border-radius: 14px; overflow: hidden;
                background: linear-gradient(135deg, #1a3d0f 0%, #2d5e1a 40%, #1a4a0e 100%);
                margin-bottom: 20px; padding: 30px 24px 24px;
                border: 1px solid #3d6828;
                box-shadow: 0 6px 24px rgba(0,0,0,0.4);
            }
            .rnd-venue-hero::before {
                content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                background: repeating-linear-gradient(90deg, transparent, transparent 48%, rgba(255,255,255,0.02) 48%, rgba(255,255,255,0.02) 52%);
                pointer-events: none;
            }
            .rnd-venue-stadium-svg { display: block; margin: 0 auto 20px; opacity: 0.55; }
            .rnd-venue-name {
                text-align: center; font-size: 22px; font-weight: 800; color: #e8f5d8;
                letter-spacing: 0.5px; margin-bottom: 4px; text-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            .rnd-venue-city {
                text-align: center; font-size: 13px; color: #a0c888; margin-bottom: 10px;
                letter-spacing: 1px; text-transform: uppercase;
            }
            .rnd-venue-tournament {
                text-align: center; margin-bottom: 0;
            }
            .rnd-venue-tournament span {
                display: inline-block; background: rgba(74,144,48,0.35); padding: 4px 14px;
                border-radius: 20px; font-size: 11px; color: #b8d8a0; letter-spacing: 0.5px;
                border: 1px solid rgba(144,184,120,0.2);
            }
            .rnd-venue-cards {
                display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;
            }
            .rnd-venue-card {
                background: linear-gradient(145deg, #243d18, #1e3414);
                border: 1px solid #3d6828; border-radius: 12px; padding: 16px;
                text-align: center; position: relative; overflow: hidden;
            }
            .rnd-venue-card::after {
                content: ''; position: absolute; top: -20px; right: -20px;
                width: 60px; height: 60px; border-radius: 50%;
                background: rgba(74,144,48,0.1);
            }
            .rnd-venue-card-icon { font-size: 24px; margin-bottom: 6px; }
            .rnd-venue-card-value {
                font-size: 22px; font-weight: 800; color: #e8f5d8; margin-bottom: 2px;
            }
            .rnd-venue-card-label { font-size: 11px; color: #90b878; text-transform: uppercase; letter-spacing: 0.5px; }
            .rnd-venue-gauge-wrap {
                background: linear-gradient(145deg, #243d18, #1e3414);
                border: 1px solid #3d6828; border-radius: 12px; padding: 18px;
                margin-bottom: 16px;
            }
            .rnd-venue-gauge-header {
                display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
            }
            .rnd-venue-gauge-title { font-size: 12px; color: #90b878; text-transform: uppercase; letter-spacing: 0.5px; }
            .rnd-venue-gauge-value { font-size: 14px; font-weight: 700; color: #e8f5d8; }
            .rnd-venue-gauge-bar {
                height: 10px; background: #162e0d; border-radius: 5px; overflow: hidden;
                position: relative;
            }
            .rnd-venue-gauge-fill {
                height: 100%; border-radius: 5px;
                transition: width 0.6s ease;
            }
            .rnd-venue-gauge-fill.attendance {
                background: linear-gradient(90deg, #4a9030, #6cc048, #8ae060);
            }
            .rnd-venue-gauge-fill.pitch {
                background: linear-gradient(90deg, #8B4513, #6aa030, #4a9030);
            }
            .rnd-venue-weather {
                background: linear-gradient(145deg, #243d18, #1e3414);
                border: 1px solid #3d6828; border-radius: 12px; padding: 20px;
                margin-bottom: 16px; display: flex; align-items: center; gap: 18px;
            }
            .rnd-venue-weather-icon { font-size: 48px; line-height: 1; }
            .rnd-venue-weather-info { flex: 1; }
            .rnd-venue-weather-text { font-size: 18px; font-weight: 700; color: #e8f5d8; margin-bottom: 2px; }
            .rnd-venue-weather-sub { font-size: 12px; color: #90b878; }
            .rnd-venue-facilities {
                display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px;
            }
            .rnd-venue-facility {
                background: linear-gradient(145deg, #243d18, #1e3414);
                border: 1px solid #3d6828; border-radius: 10px; padding: 12px 8px;
                text-align: center; transition: border-color 0.2s;
            }
            .rnd-venue-facility.active { border-color: #4a9030; background: linear-gradient(145deg, #2a4d1c, #234218); }
            .rnd-venue-facility-icon { font-size: 22px; margin-bottom: 4px; }
            .rnd-venue-facility-label { font-size: 10px; color: #90b878; text-transform: uppercase; letter-spacing: 0.3px; }
            .rnd-venue-facility .rnd-venue-facility-status {
                font-size: 10px; margin-top: 3px; color: #6b8a58; font-weight: 600;
            }
            .rnd-venue-facility.active .rnd-venue-facility-status { color: #8ae060; }

            /* ── Report tab ── */
            .rnd-report-event {
                border-bottom: 1px solid #325a1e; padding: 10px 0;
            }
            .rnd-report-event:last-child { border-bottom: none; }
            .rnd-report-min-header {
                color: #90b878; font-weight: 700; font-size: 12px;
                margin-bottom: 4px; text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .rnd-report-text {
                color: #c8e0b4; font-size: 13px; line-height: 1.6;
            }
            .rnd-report-text .rnd-goal-text { color: #80d848; font-weight: 700; }
            .rnd-report-text .rnd-yellow-text { color: #ffd700; }
            .rnd-report-text .rnd-red-text { color: #ff4c4c; font-weight: 700; }
            .rnd-report-text .rnd-sub-text { color: #5b9bff; }
            .rnd-report-text .rnd-player-name { color: #e8f5d8; font-weight: 600; }

            /* ── Dialog logos ── */
            .rnd-dlg-logo {
                width: 44px; height: 44px; flex-shrink: 0;
                filter: drop-shadow(0 2px 6px rgba(0,0,0,.5));
                object-fit: contain; pointer-events: none;
            }

            /* ── Statistics tab ── */
            .rnd-stats-wrap {
                max-width: 560px; margin: 0 auto; padding: 4px 0 12px;
            }
            .rnd-stats-team-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 10px 16px 14px; margin-bottom: 4px;
            }
            .rnd-stats-team-side {
                display: flex; align-items: center; gap: 10px;
            }
            .rnd-stats-team-side.away { flex-direction: row-reverse; }
            .rnd-stats-team-logo {
                width: 36px; height: 36px; object-fit: contain;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,.3));
            }
            .rnd-stats-team-name {
                font-weight: 700; font-size: 14px; color: #e8f5d8;
                letter-spacing: 0.2px;
            }
            .rnd-stats-vs {
                font-size: 11px; color: #6a9a55; font-weight: 600;
                text-transform: uppercase; letter-spacing: 1px;
            }
            .rnd-stat-row {
                padding: 10px 16px;
            }
            .rnd-stat-header {
                display: flex; align-items: baseline; justify-content: space-between;
                margin-bottom: 5px;
            }
            .rnd-stat-val {
                font-weight: 800; font-size: 15px; min-width: 32px;
                font-variant-numeric: tabular-nums;
            }
            .rnd-stat-val.home { text-align: left; color: #80e048; }
            .rnd-stat-val.away { text-align: right; color: #5ba8f0; }
            .rnd-stat-val.leading { font-size: 17px; }
            .rnd-stat-label {
                font-weight: 600; color: #8aac72; font-size: 11px;
                text-transform: uppercase; letter-spacing: 0.8px;
            }
            .rnd-stat-bar-wrap {
                display: flex; height: 7px; border-radius: 4px;
                overflow: hidden; background: rgba(0,0,0,.18);
                gap: 2px;
            }
            .rnd-stat-seg {
                border-radius: 3px;
                transition: width 0.5s cubic-bezier(.4,0,.2,1);
                min-width: 3px;
            }
            .rnd-stat-seg.home {
                background: linear-gradient(90deg, #4a9030, #6cc048);
            }
            .rnd-stat-seg.away {
                background: linear-gradient(90deg, #3a7ab8, #5b9bff);
            }
            .rnd-stat-divider {
                height: 1px; margin: 0 16px;
                background: linear-gradient(90deg, transparent, #3d6828 20%, #3d6828 80%, transparent);
            }
            .rnd-stat-row-highlight {
                background: rgba(60,120,40,.06);
                border-radius: 8px; margin: 2px 8px;
                padding: 10px 12px;
            }

            /* ── Advanced Stats (Attacking Styles) ── */
            .rnd-adv-section {
                margin-top: 16px; padding-top: 12px;
                border-top: 1px solid #3d6828;
            }
            .rnd-adv-title {
                text-align: center; font-size: 11px; font-weight: 700;
                color: #8aac72; text-transform: uppercase; letter-spacing: 1.2px;
                margin-bottom: 10px;
            }
            .rnd-adv-team-label {
                font-size: 11px; font-weight: 700; color: #b0d898;
                text-transform: uppercase; letter-spacing: 0.8px;
                padding: 6px 12px 4px; margin-top: 6px;
            }
            .rnd-adv-table {
                width: 100%; border-collapse: collapse; font-size: 12px;
            }
            .rnd-adv-table th {
                padding: 5px 8px; font-size: 10px; font-weight: 700;
                color: #6a9a58; text-transform: uppercase; letter-spacing: 0.5px;
                border-bottom: 1px solid #2a4a1c; text-align: center;
            }
            .rnd-adv-table th:first-child { text-align: left; }
            .rnd-adv-row {
                cursor: pointer; transition: background 0.15s;
            }
            .rnd-adv-row:hover { background: rgba(255,255,255,.04); }
            .rnd-adv-row td {
                padding: 5px 8px; text-align: center;
                border-bottom: 1px solid rgba(42,74,28,.5);
                font-variant-numeric: tabular-nums;
            }
            .rnd-adv-row td:first-child {
                text-align: left; font-weight: 600; color: #c8e0b4;
            }
            .rnd-adv-row td.adv-zero { color: #4a6a3a; }
            .rnd-adv-row td.adv-goal { color: #80e048; font-weight: 700; }
            .rnd-adv-row td.adv-shot { color: #c8d868; }
            .rnd-adv-row td.adv-lost { color: #c87848; }
            .rnd-adv-row .adv-arrow {
                display: inline-block; font-size: 9px; margin-left: 4px;
                transition: transform 0.2s; color: #6a9a58;
            }
            .rnd-adv-row.expanded .adv-arrow { transform: rotate(90deg); }
            .rnd-adv-row.rnd-adv-total td {
                font-weight: 800; border-top: 1px solid #3d6828;
                color: #e0f0cc; cursor: default;
            }
            .rnd-adv-row.rnd-adv-total td:first-child { color: #8aac72; }
            .rnd-adv-events {
                display: none;
            }
            .rnd-adv-events.visible { display: table-row; }
            .rnd-adv-events td {
                padding: 0; border-bottom: 1px solid rgba(42,74,28,.3);
            }
            .rnd-adv-evt-list {
                padding: 4px 0 6px 0; font-size: 11px;
            }
            .rnd-adv-evt {
                padding: 2px 0; color: #a0c088;
                display: flex; align-items: stretch; gap: 0;
                border-bottom: 1px solid rgba(42,74,28,.25);
            }
            .rnd-adv-evt:last-child { border-bottom: none; }
            .rnd-adv-evt .adv-result-tag {
                font-size: 9px; font-weight: 700; padding: 6px 5px 0;
                text-transform: uppercase; white-space: nowrap;
                min-width: 52px; text-align: center;
                align-self: flex-start;
            }
            .rnd-adv-evt .adv-result-tag.goal { color: #80e048; }
            .rnd-adv-evt .adv-result-tag.shot { color: #c8d868; }
            .rnd-adv-evt .adv-result-tag.lost { color: #c87848; }
            .rnd-adv-evt .rnd-acc { flex: 1; border-bottom: none; }
            .rnd-adv-evt .rnd-acc-head { padding: 4px 6px; min-height: auto; }
            .rnd-adv-evt .rnd-acc-min { font-size: 11px; min-width: 28px; }
            .rnd-adv-evt .rnd-acc-body { padding: 0 6px 6px; }
            .rnd-adv-evt .rnd-player-name { color: #e0f0cc; font-weight: 600; }

            /* ── Player Card Dialog ── */
            .rnd-plr-overlay {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,.7); z-index: 100002;
                display: flex; align-items: center; justify-content: center;
                animation: rndFadeIn .15s ease;
            }
            .rnd-plr-dialog {
                background: linear-gradient(160deg, #1a3d0f 0%, #0e2508 60%, #122a0a 100%);
                border: 1px solid #3d6828; border-radius: 14px;
                width: 680px; max-width: 96vw; max-height: 88vh;
                overflow-y: auto; color: #c8e0b4;
                box-shadow: 0 12px 60px rgba(0,0,0,.7), 0 0 0 1px rgba(74,144,48,.15);
            }
            .rnd-plr-header {
                display: flex; align-items: center; gap: 16px;
                padding: 20px 24px 16px;
                background: linear-gradient(180deg, rgba(42,74,28,.3) 0%, transparent 100%);
                border-bottom: 1px solid #2a4a1c; position: relative;
            }
            .rnd-plr-face {
                width: 84px; height: 84px; border-radius: 50%;
                border: 3px solid #4a9030; overflow: hidden;
                flex-shrink: 0; background: #0e200a;
                box-shadow: 0 4px 16px rgba(0,0,0,.4);
            }
            .rnd-plr-face img { width: 100%; height: 100%; object-fit: cover; }
            .rnd-plr-info { flex: 1; min-width: 0; }
            .rnd-plr-name-row {
                display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
            }
            .rnd-plr-name {
                font-size: 20px; font-weight: 800; color: #e0f0cc;
                text-decoration: none; cursor: pointer;
            }
            .rnd-plr-name:hover { color: #fff; text-decoration: underline; }
            .rnd-plr-link {
                color: #6a9a58; font-size: 14px; text-decoration: none;
                transition: color .15s;
            }
            .rnd-plr-link:hover { color: #80e048; }
            .rnd-plr-badges {
                display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px;
            }
            .rnd-plr-badge {
                display: inline-flex; align-items: center; gap: 4px;
                background: rgba(42,74,28,.5); border: 1px solid #2a4a1c;
                border-radius: 12px; padding: 2px 8px;
                font-size: 11px; color: #8aac72;
            }
            .rnd-plr-badge .badge-icon { font-size: 12px; }
            .rnd-plr-rating-wrap {
                text-align: center; flex-shrink: 0; min-width: 64px;
            }
            .rnd-plr-rating-big {
                font-size: 32px; font-weight: 900; line-height: 1;
            }
            .rnd-plr-rating-label {
                font-size: 9px; color: #6a9a58; text-transform: uppercase;
                letter-spacing: 0.5px; margin-top: 2px;
            }
            .rnd-plr-close {
                position: absolute; top: 10px; right: 14px;
                background: rgba(42,74,28,.4); border: 1px solid #2a4a1c;
                color: #8aac72; width: 28px; height: 28px; border-radius: 50%;
                font-size: 16px; cursor: pointer; display: flex;
                align-items: center; justify-content: center;
                transition: all .15s;
            }
            .rnd-plr-close:hover { background: rgba(74,144,48,.3); color: #e0f0cc; }
            .rnd-plr-body { padding: 16px 24px 20px; }
            .rnd-plr-stats-row {
                display: grid; grid-template-columns: repeat(5, 1fr);
                gap: 8px; margin-bottom: 16px;
            }
            .rnd-plr-stat-card {
                background: rgba(42,74,28,.35); border: 1px solid #2a4a1c;
                border-radius: 8px; padding: 10px 4px 8px;
                text-align: center; transition: background .15s;
            }
            .rnd-plr-stat-card:hover { background: rgba(42,74,28,.55); }
            .rnd-plr-stat-icon { font-size: 16px; margin-bottom: 2px; }
            .rnd-plr-stat-val {
                font-size: 22px; font-weight: 800; color: #e0f0cc; line-height: 1.1;
            }
            .rnd-plr-stat-lbl {
                font-size: 9px; color: #6a9a58; text-transform: uppercase;
                letter-spacing: 0.3px; margin-top: 2px;
            }
            .rnd-plr-stat-card.green .rnd-plr-stat-val { color: #66dd44; }
            .rnd-plr-stat-card.red .rnd-plr-stat-val { color: #ee6633; }
            .rnd-plr-stat-card.gold .rnd-plr-stat-val { color: #f0d040; }
            .rnd-plr-section-title {
                font-size: 10px; font-weight: 700; color: #6a9a58;
                text-transform: uppercase; letter-spacing: 1px;
                margin: 14px 0 8px; padding-bottom: 5px;
                border-bottom: 1px solid #2a4a1c;
                display: flex; align-items: center; gap: 6px;
            }
            .rnd-plr-section-title .sec-icon { font-size: 13px; }

            /* ── Player Card Profile Section ── */
            .rnd-plr-profile-wrap {
                background: rgba(42,74,28,.25); border: 1px solid #2a4a1c;
                border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;
            }
            .rnd-plr-country-row {
                display: flex; align-items: center; gap: 6px;
                margin-bottom: 10px; padding-bottom: 8px;
                border-bottom: 1px solid rgba(42,74,28,.4);
            }
            .rnd-plr-country-flag {
                height: 14px; vertical-align: -1px;
            }
            .rnd-plr-country-name {
                font-size: 11px; color: #8aac72; font-weight: 600;
            }
            .rnd-plr-skills-grid {
                display: grid; grid-template-columns: 1fr 1fr;
                gap: 0 20px; margin-bottom: 12px;
            }
            .rnd-plr-skill-row {
                display: flex; align-items: center; justify-content: space-between;
                padding: 2px 6px; border-radius: 3px;
                transition: background .1s;
            }
            .rnd-plr-skill-row:hover { background: rgba(42,74,28,.4); }
            .rnd-plr-skill-name {
                font-size: 10px; color: #8abc78; font-weight: 600;
                text-transform: uppercase; letter-spacing: .3px;
            }
            .rnd-plr-skill-val {
                font-size: 12px; font-weight: 800; min-width: 22px;
                text-align: right;
            }
            .rnd-plr-skill-star { color: #d4af37; }
            .rnd-plr-skill-star.silver { color: #c0c0c0; }
            .rnd-plr-profile-footer {
                display: grid; grid-template-columns: repeat(4, 1fr);
                gap: 8px; padding-top: 10px;
                border-top: 1px solid rgba(42,74,28,.4);
            }
            .rnd-plr-profile-stat {
                text-align: center; padding: 6px 4px;
                background: rgba(0,0,0,.15); border-radius: 6px;
            }
            .rnd-plr-profile-stat-val {
                font-size: 16px; font-weight: 800; line-height: 1.2;
            }
            .rnd-plr-profile-stat-lbl {
                font-size: 8px; color: #6a9a58; text-transform: uppercase;
                letter-spacing: .5px; margin-top: 2px; font-weight: 700;
            }

            /* ── Tactics cards ── */
            .rnd-tactics-section {
                margin-top: 6px; padding: 6px;
                background: linear-gradient(180deg, rgba(20,40,14,.6), rgba(16,32,10,.8));
                border-radius: 8px; border: 1px solid #2a4a1c;
            }
            .rnd-tactics-grid { display: flex; flex-direction: column; gap: 0; }
            .rnd-tactic-row {
                display: flex; align-items: center; gap: 6px;
                padding: 5px 8px;
                border-bottom: 1px solid rgba(60,100,40,.15);
            }
            .rnd-tactic-row:last-child { border-bottom: none; }
            .rnd-tactic-row.r5-row {
                padding: 7px 8px; margin-bottom: 2px;
                background: rgba(0,0,0,.12); border-radius: 6px;
                border-bottom: none;
            }
            .rnd-tactic-icon {
                font-size: 12px; line-height: 1; width: 18px;
                text-align: center; flex-shrink: 0;
            }
            .rnd-tactic-label {
                font-size: 9px; color: #7a9a68; text-transform: uppercase;
                letter-spacing: 0.6px; font-weight: 700; min-width: 52px;
                flex-shrink: 0;
            }
            .rnd-tactic-meter {
                flex: 1; height: 4px; background: rgba(0,0,0,.25); border-radius: 2px;
                overflow: hidden;
            }
            .rnd-tactic-meter-fill {
                height: 100%; border-radius: 2px; transition: width 0.4s ease;
            }
            .rnd-tactic-meter-fill.home { background: linear-gradient(90deg, #3a7025, #6cc048); }
            .rnd-tactic-meter-fill.away { background: linear-gradient(90deg, #3a70b0, #5b9bff); }
            .rnd-tactic-value {
                font-size: 10px; font-weight: 700; color: #d0e8c0;
                min-width: 0; text-align: right;
                white-space: nowrap;
            }
            .rnd-tactic-value-pill {
                font-size: 9px; font-weight: 700; padding: 1px 6px;
                border-radius: 4px; white-space: nowrap;
            }
            .rnd-tactic-value-pill.home {
                background: rgba(80,160,50,.15); color: #80d848;
            }
            .rnd-tactic-value-pill.away {
                background: rgba(60,120,200,.15); color: #6ab0ff;
            }
            .rnd-tactic-focus-icon {
                font-size: 13px; line-height: 1;
            }

            /* ── Report event badges ── */
            .rnd-report-evt-badge {
                display: inline-flex; align-items: center; gap: 6px;
                padding: 5px 12px; border-radius: 4px; margin-bottom: 6px;
                font-size: 12px; font-weight: 600;
            }
            .rnd-report-evt-badge.evt-goal { background: rgba(80,200,60,0.15); color: #80d848; }
            .rnd-report-evt-badge.evt-yellow { background: rgba(255,215,0,0.12); color: #ffd700; }
            .rnd-report-evt-badge.evt-red { background: rgba(255,76,76,0.12); color: #ff4c4c; }
            .rnd-report-evt-badge.evt-sub { background: rgba(91,155,255,0.12); color: #5b9bff; }
            .rnd-report-evt-badge.evt-injury { background: rgba(255,140,60,0.12); color: #ff8c3c; }

            /* ── Details timeline ── */
            .rnd-timeline { margin-top: 16px; }
            .rnd-tl-row {
                display: flex; align-items: center;
                border-bottom: 1px solid #325a1e;
                padding: 8px 0; min-height: 32px;
            }
            .rnd-tl-row:last-child { border-bottom: none; }
            .rnd-tl-goal { background: rgba(80,200,60,0.08); }
            .rnd-tl-home {
                flex: 1; text-align: right; padding-right: 14px;
                color: #e0f0cc; font-size: 13px;
            }
            .rnd-tl-min {
                width: 44px; text-align: center; flex-shrink: 0;
                color: #90b878; font-weight: 700; font-size: 12px;
                background: #274a18; border-radius: 3px; padding: 2px 0;
            }
            .rnd-tl-away {
                flex: 1; text-align: left; padding-left: 14px;
                color: #e0f0cc; font-size: 13px;
            }

            /* ── Report accordion ── */
            .rnd-acc { border-bottom: 1px solid #325a1e; }
            .rnd-acc:last-child { border-bottom: none; }
            .rnd-acc-head {
                display: flex; align-items: center;
                padding: 8px 0; min-height: 32px; cursor: pointer;
                transition: background 0.15s;
            }
            .rnd-acc-head:hover { background: rgba(255,255,255,0.03); }
            .rnd-acc-goal { background: rgba(80,200,60,0.08); }
            .rnd-acc-home {
                flex: 1; text-align: right; padding-right: 14px;
                color: #e0f0cc; font-size: 13px;
            }
            .rnd-acc-min {
                width: 44px; text-align: center; flex-shrink: 0;
                color: #90b878; font-weight: 700; font-size: 12px;
                background: #274a18; border-radius: 3px; padding: 2px 0;
            }
            .rnd-acc-away {
                flex: 1; text-align: left; padding-left: 14px;
                color: #e0f0cc; font-size: 13px;
            }
            .rnd-acc-body {
                display: none; padding: 8px 14px 12px;
                background: rgba(0,0,0,0.15); border-radius: 0 0 4px 4px;
            }
            .rnd-acc.open .rnd-acc-body { display: block; }
            .rnd-acc-chevron {
                width: 14px; height: 14px; flex-shrink: 0;
                fill: #5a7a48; transition: transform 0.2s;
                margin: 0 4px;
            }
            .rnd-acc.open .rnd-acc-chevron { transform: rotate(90deg); }

            /* ── Lineups tab ── */
            .rnd-lu-outer { display: flex; flex-direction: column; }
            .rnd-lu-wrap { display: flex; gap: 0; }
            .rnd-lu-list {
                flex: 0 0 25%; font-size: 12px;
                padding: 0 8px; box-sizing: border-box;
            }
            .rnd-lu-list-title {
                font-weight: 700; font-size: 13px; color: #e8f5d8;
                padding: 6px 0; border-bottom: 1px solid #3d6828;
                margin-bottom: 4px; display: flex; align-items: center; gap: 8px;
            }
            .rnd-lu-list-title img { width: 24px; height: 24px; }
            .rnd-lu-badge {
                font-size: 10px; font-weight: 600; color: #b8d8a0; background: rgba(0,0,0,.2);
                padding: 2px 6px; border-radius: 3px; margin-left: auto; white-space: nowrap;
            }
            .rnd-lu-badge + .rnd-lu-badge { margin-left: 4px; }
            .rnd-lu-player {
                display: flex; align-items: center; gap: 6px;
                padding: 4px 0; border-bottom: 1px solid #274a18;
            }
            .rnd-lu-player:last-child { border-bottom: none; }
            .rnd-lu-clickable { cursor: pointer; transition: background .15s; }
            .rnd-lu-clickable:hover { background: rgba(74,144,48,.15); }
            .rnd-lu-no {
                width: 22px; height: 22px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 10px; font-weight: 700; flex-shrink: 0;
            }
            .rnd-lu-name { flex: 1; color: #c8e0b4; font-size: 12px; }
            .rnd-lu-pos { color: #90b878; font-size: 10px; text-transform: uppercase; width: 30px; text-align: center; }
            .rnd-lu-rating { font-weight: 700; font-size: 12px; width: 32px; text-align: right; }
            .rnd-lu-r5 {
                font-weight: 700; font-size: 10px; min-width: 36px;
                text-align: center; border-radius: 10px;
                padding: 1px 5px; color: #fff; flex-shrink: 0;
                background: #3a5a2a;
            }
            .rnd-lu-sub-header {
                font-size: 11px; color: #5a7a48; text-transform: uppercase;
                letter-spacing: 1px; padding: 8px 0 4px; font-weight: 600;
            }
            .rnd-lu-captain {
                font-size: 10px; font-weight: 800; color: #ffd700;
                margin-left: 2px;
            }
            .rnd-lu-mom {
                font-size: 10px; margin-left: 2px;
            }
            .rnd-pitch-captain {
                position: absolute; top: 50%; left: 50%;
                transform: translate(30%, -100%);
                font-size: 9px; font-weight: 900; color: #fff;
                background: #d4a017; border-radius: 50%;
                width: 16px; height: 16px;
                display: flex; align-items: center; justify-content: center;
                z-index: 4; box-shadow: 0 1px 3px rgba(0,0,0,0.5);
                border: 1.5px solid #ffd700;
            }
            .rnd-pitch-mom {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-130%, -100%);
                font-size: 12px; z-index: 4;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));
            }

            /* Pitch */
            .rnd-pitch-wrap { flex: 0 0 50%; display: flex; flex-direction: column; align-items: center; justify-content: start; gap: 8px; }
            /* Unity 3D viewport row: feed | viewport | stats */
            .rnd-unity-row {
                display: flex; gap: 0; width: 100%;
                margin-bottom: 8px; align-items: stretch;
            }
            .rnd-unity-feed {
                flex: 0 0 25%; min-width: 0; display: flex; flex-direction: column;
                gap: 3px; overflow-y: auto; overflow-x: hidden;
                scrollbar-width: none; /* Firefox */
                padding: 6px 8px; box-sizing: border-box;
                min-height: 200px; /* expanded by JS (syncUnityPanelHeights) when Unity is active */
            }
            .rnd-unity-feed::-webkit-scrollbar { display: none; } /* Chrome/Edge */
            .rnd-unity-feed-line {
                display: flex; align-items: baseline; gap: 5px;
                font-size: 13px; color: #b8d8a0; line-height: 1.4;
                padding: 2px 0;
                animation: rnd-fade-in 0.4s ease;
            }
            .rnd-unity-feed-min {
                font-size: 9px; font-weight: 700; color: #80e040;
                background: rgba(0,0,0,0.3); border-radius: 3px;
                padding: 1px 4px; white-space: nowrap; flex-shrink: 0;
            }
            .rnd-unity-feed-text { color: #c8e0b4; }
            .rnd-unity-feed-text .rnd-player-name { color: #e8f5d8; font-weight: 600; }
            @keyframes rnd-fade-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
            .rnd-unity-stats {
                flex: 0 0 25%; display: flex; flex-direction: column;
                gap: 0; padding: 6px; box-sizing: border-box;
                font-size: 11px; overflow-y: auto;
                background: rgba(16,32,10,.4);
                border-radius: 8px; border: 1px solid rgba(60,100,40,.2);
                min-height: 200px;
            }
            /* When Unity viewport is hidden: expand feed+stats to fill the full row */
            .rnd-unity-row.rnd-no-unity { gap: 8px; }
            .rnd-unity-row.rnd-no-unity .rnd-unity-feed,
            .rnd-unity-row.rnd-no-unity .rnd-unity-stats { flex: 0 0 calc(50% - 4px); }
            .rnd-unity-stat-row {
                padding: 5px 6px;
                border-bottom: 1px solid rgba(60,100,40,.12);
                transition: background .2s;
            }
            .rnd-unity-stat-row:last-child { border-bottom: none; }
            .rnd-unity-stat-row:hover { background: rgba(60,120,40,.08); }
            .rnd-unity-stat-hdr {
                display: flex; align-items: center; justify-content: space-between;
                margin-bottom: 3px;
            }
            .rnd-unity-stat-hdr .val {
                font-weight: 800; font-size: 13px; min-width: 18px;
                font-variant-numeric: tabular-nums;
            }
            .rnd-unity-stat-hdr .val.home { text-align: left; color: #80e048; }
            .rnd-unity-stat-hdr .val.away { text-align: right; color: #5ba8f0; }
            .rnd-unity-stat-hdr .val.lead { font-size: 15px; }
            .rnd-unity-stat-label {
                font-size: 8px; color: #6a9a55; text-transform: uppercase;
                letter-spacing: 0.8px; font-weight: 700; text-align: center; flex: 1;
            }
            .rnd-unity-stat-bar {
                display: flex; height: 5px; border-radius: 3px; overflow: hidden;
                background: rgba(0,0,0,.2); gap: 2px;
            }
            .rnd-unity-stat-bar .seg {
                transition: width 0.5s cubic-bezier(.4,0,.2,1);
                min-width: 2px; border-radius: 2px;
            }
            .rnd-unity-stat-bar .seg.home { background: linear-gradient(90deg, #4a9030, #6cc048); }
            .rnd-unity-stat-bar .seg.away { background: linear-gradient(90deg, #3a7ab8, #5b9bff); }
            .rnd-unity-viewport {
                position: relative; border: 2px solid #4a9030;
                border-radius: 8px; overflow: hidden;
                background: #0a0a0a;
                width: 100%; max-width: 400px;
                margin: 0 auto;
                aspect-ratio: 780 / 447;
            }
            .rnd-unity-viewport .webgl-content {
                position: relative !important;
                top: auto !important; left: auto !important;
                right: auto !important; bottom: auto !important;
                transform: none !important;
                width: 100% !important; height: 100% !important;
                margin: 0 !important; padding: 0 !important;
                display: block !important;
            }
            .rnd-unity-viewport #gameContainer {
                position: relative !important;
                top: auto !important; left: auto !important;
                right: auto !important; bottom: auto !important;
                transform: none !important;
                width: 100% !important; height: 100% !important;
                margin: 0 !important; padding: 0 !important;
            }
            .rnd-unity-viewport #gameContainer .footer { display: none !important; }
            .rnd-unity-viewport canvas {
                width: 100% !important; height: 100% !important;
                display: block !important;
                object-fit: contain;
            }
            /* Hide datetime & show inline time when live */
            .rnd-dlg-head.rnd-live-active .rnd-dlg-datetime { display: none; }
            .rnd-dlg-head-time {
                display: none; gap: 8px; align-items: center;
                justify-content: center; margin-top: 6px;
                padding-top: 6px;
                border-top: 1px solid rgba(80,160,48,.12);
            }
            .rnd-dlg-head.rnd-live-active .rnd-dlg-head-time { display: flex; }
            .rnd-dlg-head-time .rnd-live-min {
                font-size: 14px; font-weight: 800; color: #80e040;
                background: rgba(0,0,0,.45); padding: 2px 10px;
                border-radius: 8px; min-width: 48px; text-align: center;
                letter-spacing: 0.5px;
                box-shadow: 0 0 10px rgba(128,224,64,.15);
                animation: rnd-pulse 1.2s ease-in-out infinite;
            }
            .rnd-dlg-head-time .rnd-live-progress {
                flex: 1; max-width: 180px; height: 4px;
                background: rgba(0,0,0,.4); border-radius: 2px; overflow: hidden;
            }
            .rnd-dlg-head-time .rnd-live-progress-fill {
                height: 100%; border-radius: 2px; transition: width 0.4s;
                background: linear-gradient(90deg, #4a9030, #80e040);
                box-shadow: 0 0 6px rgba(128,224,64,.3);
            }
            .rnd-dlg-head-time .rnd-live-btn {
                background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
                border-radius: 50%; color: #a0d090; font-size: 12px;
                cursor: pointer; width: 26px; height: 26px;
                display: flex; align-items: center; justify-content: center;
                transition: all 0.2s;
            }
            .rnd-dlg-head-time .rnd-live-btn:hover {
                background: rgba(255,255,255,.14); border-color: rgba(255,255,255,.25);
                transform: scale(1.1);
            }
            .rnd-live-filter-group {
                display: flex; gap: 1px;
                background: rgba(0,0,0,.35); border-radius: 10px;
                padding: 2px;
            }
            .rnd-live-filter-btn {
                background: none; border: none; border-radius: 8px;
                color: #7aaa68; font-size: 10px; font-weight: 600;
                cursor: pointer; padding: 2px 8px;
                transition: all 0.2s; white-space: nowrap;
                letter-spacing: 0.3px; text-transform: uppercase;
            }
            .rnd-live-filter-btn:hover { color: #b8dca8; }
            .rnd-live-filter-btn.active {
                background: rgba(108,192,64,.2); color: #80e040;
                box-shadow: 0 0 6px rgba(128,224,64,.15);
            }
            .rnd-live-filter-btn.live-btn.active {
                background: rgba(220,40,40,.2); color: #ff4444;
                box-shadow: 0 0 8px rgba(255,60,60,.25);
            }
            .rnd-live-filter-btn.live-btn::before {
                content: ''; display: inline-block;
                width: 6px; height: 6px; border-radius: 50%;
                background: #ff4444; margin-right: 4px;
                vertical-align: middle;
            }
            .rnd-live-filter-btn.live-btn.active::before {
                animation: rnd-live-dot 1.2s ease-in-out infinite;
            }
            @keyframes rnd-live-dot { 0%,100%{opacity:1} 50%{opacity:.3} }
            .rnd-live-filter-btn:disabled {
                opacity: 0.35; cursor: not-allowed;
                pointer-events: none;
            }
            .rnd-r5-compare { display: flex; gap: 12px; width: 100%; justify-content: center; align-items: center; }
            .rnd-r5-side { display: flex; align-items: center; gap: 6px; flex: 1; }
            .rnd-r5-side.away { flex-direction: row-reverse; }
            .rnd-r5-side-label { font-size: 11px; color: #8ab87a; white-space: nowrap; font-weight: 600; }
            .rnd-r5-side-meter { flex: 1; height: 8px; background: rgba(0,0,0,.25); border-radius: 4px; overflow: hidden; }
            .rnd-r5-side-meter-fill { height: 100%; border-radius: 4px; transition: width .6s ease; }
            .rnd-r5-side-meter-fill.home { background: linear-gradient(90deg, #6cbf4a, #a8e06a); }
            .rnd-r5-side-meter-fill.away { background: linear-gradient(90deg, #e06a6a, #f0a0a0); }
            .rnd-r5-side-val { font-size: 13px; font-weight: 700; min-width: 32px; text-align: center; }
            .rnd-pitch {
                position: relative; width: 100%;
                background: linear-gradient(90deg, #2d6b1e 0%, #357a22 50%, #2d6b1e 100%);
                border: 2px solid #4a9030; border-radius: 6px; overflow: hidden;
            }
            .rnd-pitch-lines {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                pointer-events: none; z-index: 0;
            }
            .rnd-pitch-grid {
                position: relative; z-index: 1;
                display: grid;
                grid-template-columns: repeat(12, 8.333%);
                grid-template-rows: repeat(5, 20%);
                width: 100%; aspect-ratio: 3 / 2;
            }
            .rnd-pitch-cell {
                position: relative; overflow: visible;
            }
            .rnd-pitch-face {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                width: 70%; max-width: 48px; aspect-ratio: 1;
                border-radius: 50%; overflow: hidden;
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                z-index: 2;
            }
            .rnd-pitch-face img {
                width: 100%; height: 100%; object-fit: cover;
                border-radius: 50%;
            }
            .rnd-pitch-info {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, 0);
                margin-top: 40%;
                display: flex; flex-direction: column; align-items: center;
                z-index: 3; pointer-events: none;
            }
            .rnd-pitch-label {
                font-size: 10px; color: #fff;
                text-shadow: 0 1px 3px rgba(0,0,0,0.9);
                white-space: nowrap;
                text-align: center;
                font-weight: 600; line-height: 1.2;
            }
            .rnd-pitch-rating {
                font-size: 9px; font-weight: 700;
                padding: 0 3px; border-radius: 3px;
                background: rgba(0,0,0,0.4); line-height: 1.3;
            }
            .rnd-pitch-events {
                display: flex; gap: 1px; flex-wrap: wrap;
                justify-content: center; font-size: 9px;
            }
            /* ── Pitch hover tooltip ── */
            .rnd-pitch-cell[data-pid] { cursor: pointer; }
            .rnd-pitch-tooltip {
                position: fixed; z-index: 100001;
                background: linear-gradient(135deg, #1a2e14 0%, #243a1a 100%);
                border: 1px solid #4a9030; border-radius: 8px;
                padding: 10px 12px; min-width: 200px; max-width: 280px;
                box-shadow: 0 6px 24px rgba(0,0,0,0.6);
                pointer-events: none; font-size: 11px; color: #c8e0b4;
                opacity: 0; transition: opacity .15s ease;
            }
            .rnd-pitch-tooltip.visible { opacity: 1; }
            .rnd-pitch-tooltip-header {
                display: flex; align-items: center; gap: 8px;
                margin-bottom: 8px; padding-bottom: 6px;
                border-bottom: 1px solid rgba(74,144,48,0.3);
            }
            .rnd-pitch-tooltip-name { font-size: 13px; font-weight: 700; color: #e0f0cc; }
            .rnd-pitch-tooltip-pos { font-size: 10px; color: #8abc78; font-weight: 600; }
            .rnd-pitch-tooltip-badges { display: flex; gap: 6px; margin-left: auto; }
            .rnd-pitch-tooltip-badge {
                font-size: 10px; font-weight: 700; padding: 2px 6px;
                border-radius: 4px; background: rgba(0,0,0,0.3);
            }
            .rnd-pitch-tooltip-skills {
                display: flex; gap: 12px; margin-bottom: 6px;
            }
            .rnd-pitch-tooltip-skills-col {
                flex: 1; min-width: 0;
            }
            .rnd-pitch-tooltip-skill {
                display: flex; justify-content: space-between;
                padding: 1px 0; border-bottom: 1px solid rgba(74,144,48,0.12);
            }
            .rnd-pitch-tooltip-skill-name { color: #8abc78; font-size: 10px; }
            .rnd-pitch-tooltip-skill-val { font-weight: 700; font-size: 11px; }
            .rnd-pitch-tooltip-footer {
                display: flex; gap: 8px; justify-content: center;
                padding-top: 6px; border-top: 1px solid rgba(74,144,48,0.3);
            }
            .rnd-pitch-tooltip-stat {
                text-align: center;
            }
            .rnd-pitch-tooltip-stat-val { font-size: 14px; font-weight: 800; }
            .rnd-pitch-tooltip-stat-lbl { font-size: 9px; color: #6a9a58; text-transform: uppercase; }
            .rnd-lu-events {
                display: flex; gap: 1px; flex-shrink: 0; font-size: 11px;
                margin-left: 2px;
            }

            /* H2H tab */
            .rnd-h2h-wrap { max-width: 640px; margin: 0 auto; padding: 8px 0 16px; }

            /* ── Summary cards ── */
            .rnd-h2h-summary {
                display: flex; gap: 10px; margin-bottom: 16px;
                justify-content: center;
            }
            .rnd-h2h-section {
                flex: 1; background: rgba(0,0,0,.2);
                border-radius: 10px; padding: 14px 16px 10px;
                text-align: center; border: 1px solid rgba(255,255,255,.04);
            }
            .rnd-h2h-section-title {
                font-size: 10px; color: #6a9a58; text-transform: uppercase;
                letter-spacing: 1.2px; margin-bottom: 10px; font-weight: 700;
            }
            .rnd-h2h-bar-wrap {
                display: flex; height: 28px; border-radius: 6px;
                overflow: hidden; margin-bottom: 8px;
                background: rgba(0,0,0,.2);
            }
            .rnd-h2h-bar {
                display: flex; align-items: center; justify-content: center;
                font-size: 12px; font-weight: 800; color: #fff;
                min-width: 30px; transition: width 0.5s ease;
            }
            .rnd-h2h-bar.home { background: linear-gradient(135deg, #3d8a28, #5ab03a); }
            .rnd-h2h-bar.draw { background: rgba(255,255,255,.08); color: #8a9a7a; }
            .rnd-h2h-bar.away { background: linear-gradient(135deg, #2a6aa0, #4a8ac8); }
            .rnd-h2h-legend {
                display: flex; justify-content: space-between;
                font-size: 10px; color: #7aaa68; font-weight: 500;
            }

            /* ── Overall record strip ── */
            .rnd-h2h-record {
                display: flex; align-items: center; justify-content: center;
                gap: 24px; padding: 10px 0 14px;
                border-bottom: 1px solid rgba(80,160,48,.12);
                margin-bottom: 4px;
            }
            .rnd-h2h-record-side {
                display: flex; align-items: center; gap: 8px;
            }
            .rnd-h2h-record-side.away { flex-direction: row-reverse; }
            .rnd-h2h-record-logo {
                width: 28px; height: 28px; object-fit: contain;
                filter: drop-shadow(0 1px 3px rgba(0,0,0,.4));
            }
            .rnd-h2h-record-name {
                font-size: 12px; font-weight: 700; color: #c8e4b0;
                max-width: 150px; white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis;
            }
            .rnd-h2h-record-stat {
                display: flex; flex-direction: column; align-items: center;
            }
            .rnd-h2h-record-num {
                font-size: 22px; font-weight: 800; line-height: 1;
            }
            .rnd-h2h-record-num.home { color: #5ab03a; }
            .rnd-h2h-record-num.draw { color: #7a8a6a; }
            .rnd-h2h-record-num.away { color: #4a8ac8; }
            .rnd-h2h-record-label {
                font-size: 8px; color: #5a7a48; text-transform: uppercase;
                letter-spacing: 1px; font-weight: 600; margin-top: 2px;
            }
            .rnd-h2h-goals-summary {
                text-align: center; font-size: 10px; color: #5a7a48;
                margin-top: -6px; padding-bottom: 6px;
            }
            .rnd-h2h-goals-summary span { color: #8abc78; font-weight: 700; }

            /* ── Match list ── */
            .rnd-h2h-matches { padding-top: 4px; }
            .rnd-h2h-season {
                font-size: 9px; color: #4a7a3a; text-transform: uppercase;
                letter-spacing: 1.5px; padding: 12px 0 4px; font-weight: 700;
                border-bottom: 1px solid rgba(80,160,48,.08);
            }
            .rnd-h2h-match {
                position: relative;
                display: flex; align-items: center; gap: 0;
                padding: 7px 8px; margin: 2px 0; border-radius: 6px;
                font-size: 13px; cursor: pointer;
                transition: background 0.15s;
            }
            .rnd-h2h-match:hover { background: rgba(255,255,255,.05); }
            .rnd-h2h-match.h2h-readonly { cursor: default; }
            .rnd-h2h-match.h2h-win { border-left: 3px solid #5ab03a; }
            .rnd-h2h-match.h2h-loss { border-left: 3px solid #4a8ac8; }
            .rnd-h2h-match.h2h-draw { border-left: 3px solid #5a6a4a; }
            .rnd-h2h-date {
                color: #4a7a3a; font-size: 10px; width: 72px; flex-shrink: 0;
                font-weight: 500;
            }
            .rnd-h2h-type-badge {
                font-size: 8px; font-weight: 700; color: #6a9a58;
                background: rgba(0,0,0,.25); padding: 1px 5px;
                border-radius: 3px; text-transform: uppercase;
                letter-spacing: 0.5px; flex-shrink: 0; margin-right: 8px;
                width: 100px;
            }
            .rnd-h2h-home {
                margin-left: 16px; text-align: right; color: #b8d8a0;
                font-size: 12px; white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis; padding-right: 8px;
            }
            .rnd-h2h-result {
                font-weight: 800; color: #e0f0d0; width: 44px;
                text-align: center; font-size: 14px; flex-shrink: 0;
                letter-spacing: 1px;
            }
            .rnd-h2h-away {
                flex: 1; text-align: left; color: #b8d8a0;
                font-size: 12px; white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis; padding-left: 8px;
            }
            .rnd-h2h-home.winner { color: #6adc3a; font-weight: 700; }
            .rnd-h2h-away.winner { color: #6adc3a; font-weight: 700; }
            .rnd-h2h-att {
                font-size: 9px; color: #3a6a2a; width: 50px;
                text-align: right; flex-shrink: 0; font-variant-numeric: tabular-nums;
            }

            /* ── Hover tooltip ── */
            .rnd-h2h-tooltip {
                position: absolute; z-index: 100;
                background: #111f0a; border: 1px solid rgba(80,160,48,.25);
                border-radius: 10px; padding: 18px 24px;
                min-width: 520px; max-width: 600px;
                box-shadow: 0 8px 32px rgba(0,0,0,.6);
                pointer-events: none; opacity: 0;
                transition: opacity 0.15s;
                left: 50%; top: 100%; transform: translateX(-50%);
                margin-top: 4px;
            }
            .rnd-h2h-tooltip.visible { opacity: 1; }
            .rnd-h2h-tooltip-header {
                display: flex; align-items: center; justify-content: center;
                gap: 14px; padding-bottom: 12px; margin-bottom: 10px;
                border-bottom: 1px solid rgba(80,160,48,.12);
            }
            .rnd-h2h-tooltip-logo {
                width: 40px; height: 40px; object-fit: contain;
                filter: drop-shadow(0 1px 3px rgba(0,0,0,.4));
            }
            .rnd-h2h-tooltip-team {
                font-size: 15px; font-weight: 700; color: #c8e4b0;
                max-width: 180px; white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis;
            }
            .rnd-h2h-tooltip-score {
                font-size: 28px; font-weight: 800; color: #fff;
                letter-spacing: 3px;
                text-shadow: 0 0 16px rgba(128,224,64,.15);
            }
            .rnd-h2h-tooltip-meta {
                display: flex; align-items: center; justify-content: center;
                gap: 18px; font-size: 11px; color: #5a7a48;
                margin-bottom: 10px;
            }
            .rnd-h2h-tooltip-meta span { display: flex; align-items: center; gap: 3px; }
            .rnd-h2h-tooltip-events {
                display: flex; flex-direction: column; gap: 5px;
            }
            .rnd-h2h-tooltip-evt {
                display: flex; align-items: center; gap: 10px;
                font-size: 13px; color: #a0c890; padding: 3px 0;
            }
            .rnd-h2h-tooltip-evt.away-evt { flex-direction: row-reverse; text-align: right; }
            .rnd-h2h-tooltip-evt.away-evt .rnd-h2h-tooltip-evt-min { text-align: left; }
            .rnd-h2h-tooltip-evt-min {
                font-weight: 700; color: #80b868; min-width: 32px;
                font-size: 13px; text-align: right; flex-shrink: 0;
            }
            .rnd-h2h-tooltip-evt-icon { flex-shrink: 0; font-size: 16px; }
            .rnd-h2h-tooltip-evt-text { color: #b8d8a0; }
            .rnd-h2h-tooltip-evt-assist {
                font-size: 12px; color: #5a8a48; font-weight: 500; margin-left: 2px;
            }
            .rnd-h2h-tooltip-mom {
                margin-top: 10px; padding-top: 10px;
                border-top: 1px solid rgba(80,160,48,.1);
                font-size: 13px; color: #6a9a58; text-align: center;
            }
            .rnd-h2h-tooltip-mom span { color: #e8d44a; font-weight: 700; }

            /* ── Rich tooltip extras ── */
            .rnd-h2h-tooltip-divider {
                height: 1px; background: rgba(80,160,48,.1); margin: 8px 0;
            }
            .rnd-h2h-tooltip-stats {
                display: grid; grid-template-columns: 1fr auto 1fr; gap: 4px 12px;
                margin: 10px 0; font-size: 14px;
            }
            .rnd-h2h-tooltip-stat-home {
                text-align: right; font-weight: 700; color: #b8d8a0;
            }
            .rnd-h2h-tooltip-stat-label {
                text-align: center; font-size: 10px; color: #5a7a48;
                text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;
                padding: 0 6px;
            }
            .rnd-h2h-tooltip-stat-away {
                text-align: left; font-weight: 700; color: #b8d8a0;
            }
            .rnd-h2h-tooltip-stat-home.leading { color: #6adc3a; }
            .rnd-h2h-tooltip-stat-away.leading { color: #6adc3a; }
            .rnd-h2h-tooltip-subs {
                display: flex; flex-direction: column; gap: 3px;
                margin-top: 6px;
            }
            .rnd-h2h-tooltip-sub {
                display: flex; align-items: center; gap: 8px;
                font-size: 11px; color: #7aaa68;
            }
            /* (subs section currently unused) */
            .rnd-h2h-tooltip-sub-icon { flex-shrink: 0; }
            .rnd-h2h-tooltip-ratings {
                display: flex; justify-content: space-between;
                margin-top: 10px; padding-top: 10px;
                border-top: 1px solid rgba(80,160,48,.1);
            }
            .rnd-h2h-tooltip-rating-side {
                display: flex; flex-direction: column; gap: 3px; font-size: 12px;
            }
            .rnd-h2h-tooltip-rating-side.away { align-items: flex-end; }
            .rnd-h2h-tooltip-rating-player {
                display: flex; align-items: center; gap: 6px; color: #8ab878;
            }
            .rnd-h2h-tooltip-rating-player .r-val {
                font-weight: 800; min-width: 28px; font-size: 13px;
            }
            .rnd-h2h-tooltip-rating-player .r-val.high { color: #6adc3a; }
            .rnd-h2h-tooltip-rating-player .r-val.mid { color: #c8c848; }
            .rnd-h2h-tooltip-rating-player .r-val.low { color: #c86a4a; }
            /* ── League Tab ── */
            .rnd-league-wrap {
                max-width: 100%; margin: 0 auto; padding: 0 0 20px;
            }
            .rnd-league-header {
                display: flex; align-items: center; justify-content: center;
                gap: 14px; padding: 14px 20px 14px;
                background: linear-gradient(180deg, rgba(42,74,28,.25) 0%, transparent 100%);
                border-bottom: 1px solid rgba(80,160,48,.12);
                margin-bottom: 4px;
            }
            .rnd-league-title {
                font-size: 12px; font-weight: 700; color: #b0d8a0;
                text-transform: uppercase; letter-spacing: 1.5px;
            }
            .rnd-league-minute-badge {
                display: inline-flex; align-items: center; gap: 4px;
                background: rgba(106,220,58,.1); border: 1px solid rgba(106,220,58,.25);
                border-radius: 12px; padding: 3px 12px;
                font-size: 12px; font-weight: 700; color: #6adc3a;
                animation: rnd-pulse-score 1.5s ease-in-out infinite;
            }
            @keyframes rnd-pulse-score {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.55; }
            }
            .rnd-league-columns {
                display: flex; gap: 24px; padding: 0 16px;
            }
            .rnd-league-col-matches { flex: 1; min-width: 0; }
            .rnd-league-col-standings { flex: 1.15; min-width: 0; overflow-x: auto; }
            .rnd-league-col-title {
                font-size: 10px; font-weight: 700; color: #6a9a58;
                text-transform: uppercase; letter-spacing: 1.5px;
                padding: 8px 12px 10px; margin-bottom: 0;
                border-bottom: 1px solid rgba(80,160,48,.1);
            }

            /* ── Match card ── */
            .rnd-league-match {
                position: relative;
                display: flex; align-items: center; gap: 0;
                padding: 10px 14px; border-radius: 0;
                font-size: 13px; cursor: default;
                transition: background 0.15s;
                border-left: 3px solid transparent;
            }
            .rnd-league-match:nth-child(even) {
                background: rgba(0,0,0,.12);
            }
            .rnd-league-match:nth-child(odd) {
                background: rgba(0,0,0,.03);
            }
            .rnd-league-match:hover { background: rgba(255,255,255,.06); }
            .rnd-league-match.rnd-league-current {
                background: rgba(74,144,48,.18) !important;
                border-left-color: #6cc040;
            }
            .rnd-league-match.rnd-league-current:hover {
                background: rgba(74,144,48,.25) !important;
            }
            .rnd-league-home {
                flex: 1; text-align: right; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis;
                color: #c8e4b0; font-size: 13px; font-weight: 600;
                padding-right: 8px;
            }
            .rnd-league-away {
                flex: 1; text-align: left; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis;
                color: #c8e4b0; font-size: 13px; font-weight: 600;
                padding-left: 8px;
            }
            .rnd-league-logo {
                width: 22px; height: 22px; vertical-align: middle;
                flex-shrink: 0;
                filter: drop-shadow(0 1px 3px rgba(0,0,0,.35));
            }
            .rnd-league-score-block {
                display: flex; align-items: center; justify-content: center;
                width: 70px; margin: 0 6px; flex-shrink: 0;
                background: rgba(0,0,0,.25); border-radius: 5px;
                padding: 4px 0;
            }
            .rnd-league-score-num {
                width: 22px; text-align: center;
                font-weight: 800; font-size: 16px; color: #e0f0d0;
                font-variant-numeric: tabular-nums; line-height: 1;
            }
            .rnd-league-score-sep {
                color: #4a6a3a; font-weight: 600; margin: 0 4px;
                font-size: 13px;
            }
            .rnd-league-match.live .rnd-league-score-block {
                background: rgba(106,220,58,.12);
                border: 1px solid rgba(106,220,58,.2);
            }
            .rnd-league-match.live .rnd-league-score-num {
                color: #6adc3a;
            }
            .rnd-league-events {
                display: flex; flex-wrap: wrap; gap: 1px 8px;
                justify-content: center;
                padding: 2px 20px 5px;
                font-size: 10px;
            }
            .rnd-league-evt {
                font-size: 10px; color: #8abc78;
            }
            .rnd-league-evt .evt-min {
                color: #5a7a48; font-weight: 600; font-size: 9px;
            }

            /* ── League Tooltip ── */
            .rnd-league-tooltip {
                position: absolute; z-index: 100;
                background: linear-gradient(160deg, #1a3d0f 0%, #0e2508 60%, #122a0a 100%);
                border: 1px solid rgba(80,160,48,.25);
                border-radius: 12px; padding: 0;
                min-width: 320px; max-width: 400px;
                box-shadow: 0 12px 48px rgba(0,0,0,.7), 0 0 0 1px rgba(74,144,48,.1);
                pointer-events: none; opacity: 0;
                transition: opacity 0.15s;
                overflow: hidden;
            }
            .rnd-league-tooltip.visible { opacity: 1; }
            .rnd-league-tt-head {
                display: flex; align-items: center; justify-content: center;
                gap: 8px; padding: 12px 16px;
                background: linear-gradient(180deg, rgba(42,74,28,.3) 0%, transparent 100%);
                border-bottom: 1px solid rgba(80,160,48,.1);
            }
            .rnd-league-tt-team {
                font-size: 11px; font-weight: 700; color: #c8e8b0;
                max-width: 100px; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis;
            }
            .rnd-league-tt-score {
                display: flex; align-items: center; gap: 0;
                background: rgba(0,0,0,.25); border-radius: 6px;
                padding: 4px 10px;
            }
            .rnd-league-tt-score-num {
                font-size: 20px; font-weight: 800; color: #e0f0d0;
                min-width: 16px; text-align: center; line-height: 1;
            }
            .rnd-league-tt-score-sep {
                color: #4a6a3a; margin: 0 5px; font-size: 14px;
            }
            .rnd-league-tt-logo {
                width: 24px; height: 24px;
                filter: drop-shadow(0 1px 3px rgba(0,0,0,.4));
            }
            .rnd-league-tt-stats {
                padding: 10px 16px;
            }
            .rnd-league-tt-stat-row {
                display: flex; align-items: center; margin-bottom: 6px;
            }
            .rnd-league-tt-stat-row:last-child { margin-bottom: 0; }
            .rnd-league-tt-val {
                font-weight: 800; font-size: 13px; min-width: 24px;
                font-variant-numeric: tabular-nums;
            }
            .rnd-league-tt-val.home { text-align: right; color: #80e048; }
            .rnd-league-tt-val.away { text-align: left; color: #5ba8f0; }
            .rnd-league-tt-val.leading { font-size: 15px; }
            .rnd-league-tt-label {
                flex: 1; text-align: center;
                font-size: 9px; color: #6a9a58; font-weight: 700;
                text-transform: uppercase; letter-spacing: 0.8px;
            }
            .rnd-league-tt-bar {
                flex: 1; display: flex; height: 4px; border-radius: 2px;
                overflow: hidden; background: rgba(0,0,0,.2); gap: 1px;
                margin: 0 8px;
            }
            .rnd-league-tt-seg {
                border-radius: 2px; min-width: 2px;
                transition: width 0.3s ease;
            }
            .rnd-league-tt-seg.home {
                background: linear-gradient(90deg, #4a9030, #6cc048);
            }
            .rnd-league-tt-seg.away {
                background: linear-gradient(90deg, #3a7ab8, #5b9bff);
            }
            .rnd-league-tt-events {
                border-top: 1px solid rgba(80,160,48,.08);
                padding: 8px 16px 10px;
                font-size: 10px; color: #8abc78;
            }
            .rnd-league-tt-evt-row {
                display: flex; gap: 8px;
                padding: 2px 0;
                border-bottom: 1px solid rgba(80,160,48,.04);
            }
            .rnd-league-tt-evt-row:last-child { border-bottom: none; }
            .tt-evt-home {
                flex: 1; text-align: right; color: #8abc78;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .tt-evt-away {
                flex: 1; text-align: left; color: #8abc78;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .rnd-league-tt-events .evt-min {
                color: #5a7a48; font-weight: 600; font-size: 9px;
            }

            /* ── League Standings ── */
            .rnd-league-tbl {
                width: 100%; border-collapse: collapse;
                font-size: 12px;
            }
            .rnd-league-tbl th {
                padding: 8px 6px; text-align: center;
                color: #6a9a58; font-weight: 700;
                border-bottom: 2px solid rgba(80,160,48,.18);
                font-size: 10px; white-space: nowrap;
                text-transform: uppercase; letter-spacing: 0.8px;
            }
            .rnd-league-tbl th:first-child,
            .rnd-league-tbl td:first-child { text-align: center; width: 48px; }
            .rnd-league-tbl th:nth-child(2),
            .rnd-league-tbl td:nth-child(2) { text-align: left; }
            .rnd-league-tbl td {
                padding: 7px 6px; text-align: center;
                color: #90c480; border-bottom: 1px solid rgba(255,255,255,.03);
                white-space: nowrap; font-variant-numeric: tabular-nums;
                font-size: 12px;
            }
            .rnd-league-tbl tr {
                transition: background .12s;
            }
            .rnd-league-tbl tr:nth-child(even) {
                background: rgba(0,0,0,.12);
            }
            .rnd-league-tbl tr:nth-child(odd) {
                background: rgba(0,0,0,.03);
            }
            .rnd-league-tbl tr:hover { background: rgba(255,255,255,.06); }
            .rnd-league-tbl tr.rnd-league-hl {
                background: rgba(74,144,48,.15) !important;
            }
            .rnd-league-tbl tr.rnd-league-hl:hover {
                background: rgba(74,144,48,.22) !important;
            }
            .rnd-league-tbl tr.rnd-league-hl td {
                color: #c0e8b0; font-weight: 600;
            }
            .rnd-league-tbl td.pts {
                color: #e0f0cc; font-weight: 800; font-size: 13px;
            }
            .rnd-league-tbl td.pos-num {
                font-weight: 700; color: #6a8a58; font-size: 11px;
            }
            .rnd-league-tbl .club-cell {
                display: flex; align-items: center; gap: 6px;
                max-width: 170px; overflow: hidden; text-overflow: ellipsis;
            }
            .rnd-league-tbl .club-logo {
                width: 18px; height: 18px; flex-shrink: 0;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,.3));
            }
            .rnd-league-tbl .club-name {
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                font-weight: 500;
            }
            .rnd-league-tbl td.gd-pos { color: #5ab03a; }
            .rnd-league-tbl td.gd-neg { color: #c86a4a; }
            .rnd-league-tbl td.w-col { color: #5ab03a; }
            .rnd-league-tbl td.l-col { color: #c86a4a; }

            /* ── Position arrows ── */
            .pos-arrow {
                display: inline-block; font-size: 9px; margin-left: 3px;
                font-weight: 700; vertical-align: middle;
            }
            .pos-arrow.pos-up { color: #5ee038; }
            .pos-arrow.pos-down { color: #e05a3a; }
            .pos-arrow.pos-same { color: #4a6a3a; font-size: 8px; }

            /* ── Zone indicators ── */
            .rnd-league-tbl tr.zone-relegation {
                border-left: 3px solid #d64040;
            }
            .rnd-league-tbl tr.zone-relegation td:first-child {
                border-left: 3px solid #d64040;
            }
            .rnd-league-tbl tr.zone-relegation td {
                color: #d09090;
            }
            .rnd-league-tbl tr.zone-relegation td.pos-num {
                color: #d64040;
            }
            .rnd-league-tbl tr.zone-playoff {
                border-left: 3px solid #d6a030;
            }
            .rnd-league-tbl tr.zone-playoff td:first-child {
                border-left: 3px solid #d6a030;
            }
            .rnd-league-tbl tr.zone-playoff td.pos-num {
                color: #d6a030;
            }

            /* ── Legend ── */
            .rnd-league-legend {
                display: flex; gap: 16px; padding: 8px 12px 4px;
                font-size: 10px; color: #6a8a58;
            }
            .legend-item {
                display: flex; align-items: center; gap: 5px;
            }
            .legend-dot {
                width: 10px; height: 10px; border-radius: 2px;
            }
            .legend-dot.legend-rel { background: #d64040; }
            .legend-dot.legend-po { background: #d6a030; }

            /* ── Analysis Tab ── */
            .rnd-analysis-wrap {
                max-width: 100%; padding: 0 0 20px;
            }
            .rnd-an-section {
                margin-bottom: 2px;
                background: rgba(0,0,0,.08);
                border-bottom: 1px solid rgba(80,160,48,.06);
            }
            .rnd-an-section-head {
                display: flex; align-items: center; gap: 8px;
                padding: 12px 20px 8px;
                font-size: 10px; font-weight: 700; color: #6a9a58;
                text-transform: uppercase; letter-spacing: 1.5px;
            }
            .rnd-an-section-head .an-icon { font-size: 14px; }

            /* Form strip */
            .rnd-an-form-row {
                display: flex; align-items: center; gap: 12px;
                padding: 6px 20px 14px;
            }
            .rnd-an-form-side {
                flex: 1; display: flex; align-items: center; gap: 6px;
            }
            .rnd-an-form-side.away { justify-content: flex-end; flex-direction: row-reverse; }
            .rnd-an-form-label {
                font-size: 11px; font-weight: 700; color: #8aac78;
                min-width: 40px;
            }
            .rnd-an-form-side.home .rnd-an-form-label { text-align: right; }
            .rnd-an-form-side.away .rnd-an-form-label { text-align: left; }
            .rnd-an-form-dots {
                display: flex; gap: 3px;
            }
            .rnd-an-form-dot {
                width: 22px; height: 22px; border-radius: 4px;
                display: flex; align-items: center; justify-content: center;
                font-size: 10px; font-weight: 800; color: #fff;
                text-shadow: 0 1px 2px rgba(0,0,0,.4);
            }
            .rnd-an-form-dot.w { background: #3a9a2a; }
            .rnd-an-form-dot.d { background: #8a8a3a; }
            .rnd-an-form-dot.l { background: #b84a3a; }
            .rnd-an-form-pts {
                font-size: 13px; font-weight: 800; color: #c8e8b0;
                min-width: 24px; text-align: center;
            }

            /* Form comparison bar */
            .rnd-an-form-bar-wrap {
                padding: 0 20px 12px;
            }
            .rnd-an-form-bar {
                display: flex; height: 6px; border-radius: 3px;
                overflow: hidden; background: rgba(0,0,0,.2); gap: 1px;
            }
            .rnd-an-form-seg {
                border-radius: 3px; transition: width 0.3s;
            }
            .rnd-an-form-seg.home { background: linear-gradient(90deg, #4a9030, #6cc048); }
            .rnd-an-form-seg.away { background: linear-gradient(90deg, #3a7ab8, #5b9bff); }

            /* Strength bars */
            .rnd-an-strength-row {
                display: flex; align-items: center; gap: 0;
                padding: 5px 20px;
            }
            .rnd-an-strength-row:nth-child(even) { background: rgba(0,0,0,.06); }
            .rnd-an-str-val {
                min-width: 44px; font-weight: 800; font-size: 13px;
                font-variant-numeric: tabular-nums;
            }
            .rnd-an-str-val.home { text-align: right; color: #80e048; padding-right: 8px; }
            .rnd-an-str-val.away { text-align: left; color: #5ba8f0; padding-left: 8px; }
            .rnd-an-str-val.leading { font-size: 15px; }
            .rnd-an-str-label {
                min-width: 54px; text-align: center;
                font-size: 10px; font-weight: 700; color: #6a9a58;
                text-transform: uppercase; letter-spacing: 0.5px;
            }
            .rnd-an-str-bar {
                flex: 1; height: 8px; border-radius: 4px;
                background: rgba(0,0,0,.2); overflow: hidden;
            }
            .rnd-an-str-fill {
                height: 100%; border-radius: 4px; transition: width 0.5s ease;
            }
            .rnd-an-str-fill.home { background: linear-gradient(90deg, #3a7828, #6cc048); float: right; }
            .rnd-an-str-fill.away { background: linear-gradient(90deg, #5b9bff, #3a7ab8); }

            /* Key players */
            .rnd-an-keys {
                display: flex; gap: 0; padding: 0;
            }
            .rnd-an-keys-side {
                flex: 1; display: flex; flex-direction: column; gap: 2px;
                padding: 6px 12px 12px;
            }
            .rnd-an-keys-side.away { border-left: 1px solid rgba(80,160,48,.06); }
            .rnd-an-key-player {
                display: flex; align-items: center; gap: 8px;
                padding: 6px 8px; border-radius: 6px;
                transition: background .12s;
            }
            .rnd-an-key-player:nth-child(even) { background: rgba(0,0,0,.06); }
            .rnd-an-key-player:hover { background: rgba(255,255,255,.05); }
            .rnd-an-key-face {
                width: 36px; height: 36px; border-radius: 50%;
                overflow: hidden; flex-shrink: 0;
                border: 2px solid rgba(80,160,48,.3);
            }
            .rnd-an-key-face img {
                width: 100%; height: 100%; object-fit: cover; object-position: top;
            }
            .rnd-an-key-info { flex: 1; min-width: 0; }
            .rnd-an-key-name {
                font-size: 12px; font-weight: 600; color: #c8e4b0;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .rnd-an-key-meta {
                font-size: 10px; color: #6a9a58;
            }
            .rnd-an-key-r5 {
                font-size: 14px; font-weight: 800;
                font-variant-numeric: tabular-nums;
                min-width: 40px; text-align: right;
            }
            .rnd-an-key-rank {
                font-size: 16px; font-weight: 800; color: #3a5a2a;
                min-width: 20px; text-align: center;
            }

            /* Profile stats grid */
            .rnd-an-profile-grid {
                display: grid; grid-template-columns: 1fr 1fr;
                gap: 2px; padding: 0 20px 12px;
            }
            .rnd-an-profile-card {
                display: flex; align-items: center; gap: 10px;
                padding: 10px 14px; background: rgba(0,0,0,.08);
                border-radius: 6px;
            }
            .rnd-an-profile-icon { font-size: 18px; }
            .rnd-an-profile-info { flex: 1; }
            .rnd-an-profile-label {
                font-size: 9px; font-weight: 700; color: #5a7a48;
                text-transform: uppercase; letter-spacing: 1px;
            }
            .rnd-an-profile-vals {
                display: flex; gap: 8px; margin-top: 2px;
            }
            .rnd-an-profile-val {
                font-size: 14px; font-weight: 800;
            }
            .rnd-an-profile-val.home { color: #80e048; }
            .rnd-an-profile-val.away { color: #5ba8f0; }
            .rnd-an-profile-vs {
                font-size: 10px; color: #4a6a3a; font-weight: 600;
            }

            /* Tactical matchup */
            .rnd-an-tactics {
                display: flex; gap: 0; padding: 0;
            }
            .rnd-an-tactic-side {
                flex: 1; padding: 8px 20px 14px;
            }
            .rnd-an-tactic-side.away {
                border-left: 1px solid rgba(80,160,48,.06);
            }
            .rnd-an-tactic-team {
                font-size: 11px; font-weight: 700; color: #8aac78;
                margin-bottom: 6px;
            }
            .rnd-an-tactic-item {
                display: flex; align-items: center; gap: 6px;
                padding: 4px 0; font-size: 12px; color: #a0c890;
            }
            .rnd-an-tactic-item .t-icon { font-size: 13px; width: 20px; text-align: center; }
            .rnd-an-tactic-item .t-label {
                font-size: 9px; color: #5a7a48; text-transform: uppercase;
                letter-spacing: 0.5px; min-width: 55px;
            }
            .rnd-an-tactic-item .t-val { font-weight: 700; color: #c8e4b0; }

            /* Unavailable */
            .rnd-an-unavail {
                display: flex; gap: 0; padding: 0;
            }
            .rnd-an-unavail-side {
                flex: 1; padding: 6px 20px 12px;
            }
            .rnd-an-unavail-side.away {
                border-left: 1px solid rgba(80,160,48,.06);
            }
            .rnd-an-unavail-player {
                display: flex; align-items: center; gap: 6px;
                padding: 4px 0; font-size: 12px; color: #c86a4a;
            }
            .rnd-an-unavail-none {
                font-size: 11px; color: #5a7a48; font-style: italic;
                padding: 4px 0;
            }

            /* Prediction */
            .rnd-an-prediction {
                display: flex; flex-direction: column; align-items: center;
                padding: 16px 20px 20px; gap: 10px;
            }
            .rnd-an-pred-teams {
                display: flex; align-items: center; gap: 16px; width: 100%;
            }
            .rnd-an-pred-side {
                flex: 1; text-align: center;
            }
            .rnd-an-pred-logo {
                width: 48px; height: 48px;
                filter: drop-shadow(0 2px 6px rgba(0,0,0,.4));
            }
            .rnd-an-pred-name {
                font-size: 11px; font-weight: 700; color: #8aac78;
                margin-top: 4px;
            }
            .rnd-an-pred-pct {
                font-size: 28px; font-weight: 800; margin-top: 2px;
            }
            .rnd-an-pred-pct.home { color: #80e048; }
            .rnd-an-pred-pct.away { color: #5ba8f0; }
            .rnd-an-pred-pct.draw { color: #b8b848; }
            .rnd-an-pred-bar-wrap {
                width: 100%; display: flex; gap: 2px;
                height: 10px; border-radius: 5px; overflow: hidden;
            }
            .rnd-an-pred-seg {
                height: 100%; border-radius: 5px; transition: width 0.5s;
            }
            .rnd-an-pred-seg.home { background: linear-gradient(90deg, #4a9030, #6cc048); }
            .rnd-an-pred-seg.draw { background: linear-gradient(90deg, #8a8a3a, #b8b848); }
            .rnd-an-pred-seg.away { background: linear-gradient(90deg, #3a7ab8, #5b9bff); }
            .rnd-an-pred-label {
                font-size: 10px; font-weight: 700; color: #6a9a58;
                text-transform: uppercase; letter-spacing: 1px;
                text-align: center;
            }
            .rnd-an-pred-draw {
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    };

    window.TmMatchStyles = { inject };

})();



// ─── components/match/tm-match-utils.js ─────────────────────

// tm-match-utils.js — Shared match event parsing utilities
// Depends on: nothing
// Exposed as: window.TmMatchUtils
(function () {
    'use strict';

    window.TmMatchUtils = {

        /**
         * Resolve a player's display name from a match lineup object.
         * @param {object} lineup — mData.lineup (has .home and .away sub-objects keyed by player_id)
         * @param {string|number} pid — player id
         * @returns {string} last name, or full name, or '?'
         */
        resolvePlayerName(lineup, pid) {
            if (!pid) return '?';
            const p = lineup?.home?.[String(pid)] || lineup?.away?.[String(pid)];
            return p?.nameLast || p?.name || '?';
        },

        /**
         * Returns true if the given player id is in the home side's lineup.
         * @param {Set<string>} homeIds — Set of home player ids as strings
         * @param {string|number} pid
         * @returns {boolean}
         */
        isHome(homeIds, pid) {
            return homeIds.has(String(pid));
        },

        /**
         * Iterate all visible events in a match report, in minute order.
         * Calls cb(min, si, evt) for each event that passes the visibility filter.
         *
         * @param {object}   report          — mData.report keyed by minute string
         * @param {object}   [opts]
         * @param {number}   [opts.upToMin=999]        — stop processing after this minute
         * @param {number}   [opts.upToEvtIdx=999]     — secondary event index ceiling (used with isEventVisible)
         * @param {Function} [opts.isEventVisible]     — (min, si, upToMin, upToEvtIdx) => boolean
         * @param {Function} cb                        — (min, si, evt) => void
         */
        eachEvent(report, opts, cb) {
            if (typeof opts === 'function') { cb = opts; opts = {}; }
            const { upToMin = 999, upToEvtIdx = 999, isEventVisible = null } = opts;
            const sortedMins = Object.keys(report).map(Number).sort((a, b) => a - b);
            for (const min of sortedMins) {
                if (min > upToMin) break;
                const evts = report[String(min)] || [];
                evts.forEach((evt, si) => {
                    if (isEventVisible && !isEventVisible(min, si, upToMin, upToEvtIdx)) return;
                    cb(min, si, evt);
                });
            }
        },

        /**
         * Extract aggregated match statistics from a report object.
         *
         * @param {object}  report   — mData.report
         * @param {Set}     homeIds  — Set<string> of home player IDs
         * @param {string}  homeId   — home club ID (string) — used to identify shot ownership
         * @param {object}  [opts]
         * @param {number}  [opts.upToMin]         — see eachEvent
         * @param {number}  [opts.upToEvtIdx]      — see eachEvent
         * @param {Function}[opts.isEventVisible]  — see eachEvent
         * @param {object}  [opts.lineup]          — mData.lineup — if provided, events[] is populated with named entries
         * @returns {{ homeGoals, awayGoals, homeYellow, awayYellow, homeRed, awayRed,
         *            homeShots, awayShots, homeSoT, awaySoT,
         *            homeSetPieces, awaySetPieces, homePenalties, awayPenalties,
         *            events: Array<{min, icon, name, side}> }}
         */
        extractStats(report, homeIds, homeId, opts = {}) {
            const stats = {
                homeGoals: 0, awayGoals: 0,
                homeYellow: 0, awayYellow: 0, homeRed: 0, awayRed: 0,
                homeShots: 0, awayShots: 0, homeSoT: 0, awaySoT: 0,
                homeSetPieces: 0, awaySetPieces: 0, homePenalties: 0, awayPenalties: 0,
                events: [],
            };
            const lineup = opts.lineup || null;
            const self = this;
            this.eachEvent(report, opts, (min, si, evt) => {
                if (!evt.parameters) return;
                const params = Array.isArray(evt.parameters) ? evt.parameters : [evt.parameters];
                const isPen = params.some(p => p.penalty);
                params.forEach(p => {
                    if (p.goal) {
                        const home = self.isHome(homeIds, p.goal.player);
                        if (home) stats.homeGoals++; else stats.awayGoals++;
                        if (isPen) { if (home) stats.homePenalties++; else stats.awayPenalties++; }
                        if (lineup) stats.events.push({ min, icon: '⚽', name: self.resolvePlayerName(lineup, p.goal.player), side: home ? 'home' : 'away' });
                    }
                    if (p.yellow) {
                        const home = self.isHome(homeIds, p.yellow);
                        if (home) stats.homeYellow++; else stats.awayYellow++;
                        if (lineup) stats.events.push({ min, icon: '🟨', name: self.resolvePlayerName(lineup, p.yellow), side: home ? 'home' : 'away' });
                    }
                    if (p.yellow_red) {
                        const home = self.isHome(homeIds, p.yellow_red);
                        if (home) stats.homeRed++; else stats.awayRed++;
                        if (lineup) stats.events.push({ min, icon: '🟥', name: self.resolvePlayerName(lineup, p.yellow_red), side: home ? 'home' : 'away' });
                    }
                    if (p.red) {
                        const home = self.isHome(homeIds, p.red);
                        if (home) stats.homeRed++; else stats.awayRed++;
                        if (lineup) stats.events.push({ min, icon: '🟥', name: self.resolvePlayerName(lineup, p.red), side: home ? 'home' : 'away' });
                    }
                    if (p.shot) {
                        const home = String(p.shot.team) === homeId;
                        if (home) { stats.homeShots++; if (p.shot.target === 'on') stats.homeSoT++; }
                        else { stats.awayShots++; if (p.shot.target === 'on') stats.awaySoT++; }
                    }
                    if (p.set_piece) {
                        const home = self.isHome(homeIds, p.set_piece);
                        if (home) stats.homeSetPieces++; else stats.awaySetPieces++;
                    }
                });
            });
            return stats;
        },

        /**
         * Render the goals+cards events section HTML from legacy tooltip API data.
         * (tooltip.ajax.php format — events have .minute, .scorer_name, .score, .assist_id)
         * @param {Array} goals  — sorted goal event objects with .isHome flag
         * @param {Array} cards  — sorted card event objects with .isHome flag
         * @returns {string} HTML string (empty string if no events)
         */
        renderLegacyEvents(goals, cards) {
            if (!goals.length && !cards.length) return '';
            let t = '<div class="rnd-h2h-tooltip-events">';
            goals.forEach(e => {
                const sideClass = e.isHome ? '' : ' away-evt';
                t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
                t += `<span class="rnd-h2h-tooltip-evt-min">${e.minute}'</span>`;
                t += `<span class="rnd-h2h-tooltip-evt-icon">⚽</span>`;
                t += `<span class="rnd-h2h-tooltip-evt-text">${e.scorer_name || ''}`;
                if (e.assist_id && e.assist_id !== '') {
                    t += ` <span class="rnd-h2h-tooltip-evt-assist">(${e.score})</span>`;
                } else {
                    t += ` <span class="rnd-h2h-tooltip-evt-assist">${e.score}</span>`;
                }
                t += `</span></div>`;
            });
            if (goals.length && cards.length) t += '<div class="rnd-h2h-tooltip-divider"></div>';
            cards.forEach(e => {
                const icon = e.score === 'yellow' ? '🟡' : e.score === 'orange' ? '🟡🟡→🔴' : '🔴';
                const sideClass = e.isHome ? '' : ' away-evt';
                t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
                t += `<span class="rnd-h2h-tooltip-evt-min">${e.minute}'</span>`;
                t += `<span class="rnd-h2h-tooltip-evt-icon">${icon}</span>`;
                t += `<span class="rnd-h2h-tooltip-evt-text">${e.scorer_name || ''}</span>`;
                t += `</div>`;
            });
            t += '</div>';
            return t;
        },

        /**
         * Build per-player event statistics from a match report.
         * Processes both video segments (pass/cross/finish/defwin/runduel/save/foul)
         * and evt.parameters (goals, assists, cards, set-pieces, penalties).
         *
         * @param {object}   report                  — mData.report keyed by minute string
         * @param {object}   [opts]
         * @param {Function} [opts.isEventVisible]   — (min, si, upToMin, upToEvtIdx) => bool
         * @param {number}   [opts.upToMin=999]       — ceiling arg for isEventVisible
         * @param {number}   [opts.upToEvtIdx=999]    — secondary ceiling arg
         * @param {string}   [opts.pidFilter]         — if set, only accumulate for this player ID
         * @param {boolean}  [opts.recordEvents=false] — if true, populate events[] per player
         * @returns {Object<string, object>}          — map of stringified playerId → statObject
         */
        buildPlayerEventStats(report, opts = {}) {
            const {
                isEventVisible = null,
                upToMin = 999,
                upToEvtIdx = 999,
                pidFilter = null,
                recordEvents = false,
            } = opts;

            const { PASS_VIDS, CROSS_VIDS, DEFWIN_VIDS, FINISH_VIDS, RUN_DUEL_VIDS } = window.TmConst;
            const pStats = {};

            const ensureP = (rawId) => {
                if (!rawId) return null;
                const id = String(rawId);
                if (pidFilter && id !== pidFilter) return null;
                if (!pStats[id]) {
                    pStats[id] = {
                        sp: 0, up: 0, sc: 0, uc: 0,
                        sh: 0, sot: 0, soff: 0, shf: 0, sotf: 0, gf: 0, shh: 0, soth: 0, gh: 0,
                        sv: 0,
                        g: 0, a: 0, kp: 0,
                        dw: 0, dl: 0, int: 0, tkl: 0, hc: 0, tf: 0,
                        fouls: 0, yc: 0, rc: 0,
                        stp: 0, fkg: 0, pen: 0, peng: 0,
                    };
                    if (recordEvents) pStats[id].events = [];
                }
                return pStats[id];
            };

            const addEvent = (rawId, min, si, evt, action) => {
                if (!recordEvents) return;
                const p = ensureP(rawId);
                if (p) p.events.push({ min, evtIdx: si, evt, action });
            };

            const sortedMins = Object.keys(report).map(Number).sort((a, b) => a - b);
            for (const min of sortedMins) {
                const evts = report[String(min)] || [];
                for (let si = 0; si < evts.length; si++) {
                    if (isEventVisible && !isEventVisible(min, si, upToMin, upToEvtIdx)) continue;
                    const evt = evts[si];
                    const vids = evt.chance?.video;
                    const evtHasShot = evt.parameters?.some(pr => pr.shot);
                    const evtShotOnTarget = evt.parameters?.find(pr => pr.shot)?.shot?.target === 'on';

                    if (vids && Array.isArray(vids)) {
                        for (let vi = 0; vi < vids.length; vi++) {
                            const v = vids[vi];

                            // ── Passes ──
                            if (PASS_VIDS.test(v.video)) {
                                const rawId = /^gk(throw|kick)/.test(v.video) ? v.gk : v.att1;
                                const p = ensureP(rawId);
                                if (p) {
                                    const sid = String(rawId);
                                    const isPreshort = /^preshort/.test(v.video);
                                    const textLines = evt.chance?.text?.[vi] || [];
                                    if (isPreshort && !textLines.some(l => l.includes('[player=' + sid + ']'))) {
                                        // Skip — att1 in preshort is part of buildup, not the actual passer
                                    } else {
                                        const failed = vi + 1 < vids.length && DEFWIN_VIDS.test(vids[vi + 1].video);
                                        if (failed) { p.up++; addEvent(rawId, min, si, evt, 'pass_fail'); }
                                        else { p.sp++; if (evtHasShot) p.kp++; addEvent(rawId, min, si, evt, 'pass_ok'); }
                                    }
                                }
                            }

                            // ── Crosses ──
                            if (CROSS_VIDS.test(v.video) && v.att1) {
                                const p = ensureP(v.att1);
                                if (p) {
                                    if (/^freekick/.test(v.video) && evtHasShot) {
                                        p.sh++; p.shf++;
                                        if (evtShotOnTarget) { p.sot++; p.sotf++; } else p.soff++;
                                        addEvent(v.att1, min, si, evt, 'shot');
                                    } else {
                                        const failed = vi + 1 < vids.length && DEFWIN_VIDS.test(vids[vi + 1].video);
                                        if (failed) { p.uc++; addEvent(v.att1, min, si, evt, 'cross_fail'); }
                                        else { p.sc++; if (evtHasShot) p.kp++; addEvent(v.att1, min, si, evt, 'cross_ok'); }
                                    }
                                }
                            }

                            // ── Finishes (shots) ──
                            if (FINISH_VIDS.test(v.video) && v.att1) {
                                const nextIsAlsoFinish = vi + 1 < vids.length && FINISH_VIDS.test(vids[vi + 1].video);
                                if (!nextIsAlsoFinish) {
                                    const p = ensureP(v.att1);
                                    if (p) {
                                        const isHead = /^header/.test(v.video);
                                        p.sh++;
                                        if (isHead) {
                                            p.shh++;
                                            if (evtShotOnTarget) { p.sot++; p.soth++; } else p.soff++;
                                        } else {
                                            p.shf++;
                                            if (evtShotOnTarget) { p.sot++; p.sotf++; } else p.soff++;
                                        }
                                        const shooterId = String(v.att1);
                                        const hasGoalForShooter = evt.parameters?.some(pr => pr.goal && String(pr.goal.player) === shooterId);
                                        if (!hasGoalForShooter) addEvent(v.att1, min, si, evt, 'shot');
                                    }
                                }
                            }

                            // ── Defensive actions (defwin) ──
                            if (DEFWIN_VIDS.test(v.video)) {
                                const prevVideo = vi > 0 ? vids[vi - 1].video : '';
                                const isFinrunBefore = RUN_DUEL_VIDS.test(prevVideo);
                                const isCornerkickBefore = /^cornerkick/.test(prevVideo);
                                const tLines = (evt.chance?.text || []).flat();
                                const winner = [v.def1, v.def2].find(d => d && tLines.some(l => l.includes('[player=' + d + ']')));
                                if (winner) {
                                    const p = ensureP(winner);
                                    if (p) {
                                        if (isFinrunBefore || !isCornerkickBefore) p.dw++;
                                        const defwinTextLines = evt.chance?.text?.[vi] || [];
                                        const isHeader = defwinTextLines.some(l => /\bheader\b|\bhead(ed|s)?\b/i.test(l));
                                        if (/^defwin5$/.test(v.video) || isHeader) {
                                            p.hc++; addEvent(winner, min, si, evt, 'header_clear');
                                        } else if (/^defwin(3|6)$/.test(v.video)) {
                                            p.tkl++; addEvent(winner, min, si, evt, 'tackle');
                                        } else {
                                            p.int++; addEvent(winner, min, si, evt, 'intercept');
                                        }
                                    }
                                }
                            }

                            // ── Duel losses / tackle fails (run duel) ──
                            if (RUN_DUEL_VIDS.test(v.video)) {
                                const nextIsDefwin = vi + 1 < vids.length && DEFWIN_VIDS.test(vids[vi + 1].video);
                                if (!nextIsDefwin) {
                                    const prevVideo = vi > 0 ? vids[vi - 1].video : '';
                                    if (!/^cornerkick/.test(prevVideo)) {
                                        const tLines = (evt.chance?.text || []).flat();
                                        [v.def1, v.def2].forEach(d => {
                                            if (!d) return;
                                            const p = ensureP(d);
                                            if (p && tLines.some(l => l.includes('[player=' + d + ']'))) {
                                                p.dl++; addEvent(d, min, si, evt, 'duel_lost');
                                            }
                                        });
                                    }
                                    const nextVid = vi + 1 < vids.length ? vids[vi + 1].video : '';
                                    if (FINISH_VIDS.test(nextVid) && v.def1) {
                                        const p = ensureP(v.def1);
                                        if (p) { p.tf++; addEvent(v.def1, min, si, evt, 'tackle_fail'); }
                                    }
                                }
                            }

                            // ── Saves ──
                            if (/^save/.test(v.video) && v.gk) {
                                const p = ensureP(v.gk);
                                if (p) { p.sv++; addEvent(v.gk, min, si, evt, 'save'); }
                            }

                            // ── Fouls ──
                            if (/^foulcall/.test(v.video) && v.def1) {
                                const p = ensureP(v.def1);
                                if (p) { p.fouls++; addEvent(v.def1, min, si, evt, 'foul'); }
                            }
                        }
                    }

                    // ── Goals, assists, cards, set-pieces from parameters ──
                    if (evt.parameters) {
                        const isPenGoal = evt.parameters.some(pr => pr.penalty);
                        const gPrefix = evt.type ? evt.type.replace(/[0-9]+.*/, '') : '';
                        evt.parameters.forEach(param => {
                            if (param.goal) {
                                const scorer = String(param.goal.player);
                                const p = ensureP(scorer);
                                if (p) {
                                    p.g++;
                                    if (!isPenGoal) {
                                        const evtVids = evt.chance?.video;
                                        const isHeaderGoal = evtVids && Array.isArray(evtVids) && evtVids.some(v => /^header/.test(v.video));
                                        if (isHeaderGoal) p.gh++; else p.gf++;
                                    }
                                    if (gPrefix === 'dire') p.fkg++;
                                    addEvent(scorer, min, si, evt, 'goal');
                                }
                                if (param.goal.assist) {
                                    const ap = ensureP(param.goal.assist);
                                    if (ap) { ap.a++; addEvent(param.goal.assist, min, si, evt, 'assist'); }
                                }
                            }
                            if (param.yellow) {
                                const p = ensureP(param.yellow);
                                if (p) { p.yc++; addEvent(param.yellow, min, si, evt, 'yellow'); }
                            }
                            if (param.yellow_red) {
                                const p = ensureP(param.yellow_red);
                                if (p) { p.yc++; p.rc++; addEvent(param.yellow_red, min, si, evt, 'red'); }
                            }
                            if (param.red) {
                                const p = ensureP(param.red);
                                if (p) { p.rc++; addEvent(param.red, min, si, evt, 'red'); }
                            }
                            if (param.penalty) {
                                const p = ensureP(param.penalty);
                                if (p) p.pen++;
                            }
                            if (param.set_piece && gPrefix === 'dire') {
                                const p = ensureP(param.set_piece);
                                if (p) p.stp++;
                            }
                        });
                        // Penalty goal: track peng separately
                        const hasGoalParam = evt.parameters.some(pr => pr.goal);
                        if (isPenGoal && hasGoalParam) {
                            const penPlayer = evt.parameters.find(pr => pr.penalty);
                            if (penPlayer) {
                                const p = ensureP(penPlayer.penalty);
                                if (p) p.peng++;
                            }
                        }
                    }
                }
            }

            return pStats;
        },

        /**
         * Render the goals+cards events section HTML from full match API data.
         * (match.ajax.php format — events have .min, .name, .assist, .type)
         * @param {Array} goals  — goal event objects with .isHome flag
         * @param {Array} cards  — card event objects with .isHome flag
         * @returns {string} HTML string (empty string if no events)
         */
        renderRichEvents(goals, cards) {
            if (!goals.length && !cards.length) return '';
            let t = '<div class="rnd-h2h-tooltip-events">';
            goals.forEach(e => {
                const sideClass = e.isHome ? '' : ' away-evt';
                t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
                t += `<span class="rnd-h2h-tooltip-evt-min">${e.min}'</span>`;
                t += `<span class="rnd-h2h-tooltip-evt-icon">⚽</span>`;
                t += `<span class="rnd-h2h-tooltip-evt-text">${e.name}`;
                if (e.assist) t += ` <span class="rnd-h2h-tooltip-evt-assist">(${e.assist})</span>`;
                t += `</span></div>`;
            });
            if (goals.length && cards.length) t += '<div class="rnd-h2h-tooltip-divider"></div>';
            cards.forEach(e => {
                const icon = e.type === 'yellow' ? '🟡' : '🔴';
                const sideClass = e.isHome ? '' : ' away-evt';
                t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
                t += `<span class="rnd-h2h-tooltip-evt-min">${e.min}'</span>`;
                t += `<span class="rnd-h2h-tooltip-evt-icon">${icon}</span>`;
                t += `<span class="rnd-h2h-tooltip-evt-text">${e.name}</span>`;
                t += `</div>`;
            });
            t += '</div>';
            return t;
        },
    };

})();



// ─── components/match/tm-match-dialog.js ────────────────────

/**
 * tm-match-dialog.js — Match dialog overlay HTML builder
 *
 * Exposed as: window.TmMatchDialog
 * Usage: window.TmMatchDialog.build(mData, matchIsFuture, matchIsLive) → jQuery overlay
 */
(function () {
    'use strict';

    const MENTALITY_MAP    = { 1: 'V.Def', 2: 'Def', 3: 'Sl.Def', 4: 'Normal', 5: 'Sl.Att', 6: 'Att', 7: 'V.Att' };
    const STYLE_MAP_SHORT  = { 1: 'Balanced', 2: 'Direct', 3: 'Wings', 4: 'Short', 5: 'Long', 6: 'Through' };
    const FOCUS_MAP_SHORT  = { 1: 'Balanced', 2: 'Left', 3: 'Central', 4: 'Right' };

    const buildChips = (md, side) => {
        let c = '';
        const ment = md.mentality ? (MENTALITY_MAP[md.mentality[side]] || md.mentality[side]) : '?';
        c += `<span class="rnd-dlg-chip" id="rnd-chip-ment-${side}">⚔ <span class="chip-val">${ment}</span></span>`;
        const style = md.attacking_style ? (STYLE_MAP_SHORT[md.attacking_style[side]] || md.attacking_style[side]) : '?';
        c += `<span class="rnd-dlg-chip">🎯 <span class="chip-val">${style}</span></span>`;
        const focus = md.focus_side ? (FOCUS_MAP_SHORT[md.focus_side[side]] || md.focus_side[side]) : '?';
        c += `<span class="rnd-dlg-chip">◎ <span class="chip-val">${focus}</span></span>`;
        c += `<span class="rnd-dlg-chip" id="rnd-chip-r5-${side}">R5 <span class="chip-val">···</span></span>`;
        return c;
    };

    const buildDatetime = (md) => {
        const ko = md.venue?.kickoff_readable || '';
        const d = ko ? new Date(ko.replace(' ', 'T')).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
        const t = md.match_time_of_day || '';
        return (d || '') + (t ? ' · ' + t : '');
    };

    const buildTabs = (matchIsFuture, isLeague) => {
        if (matchIsFuture) return `
            <div class="rnd-tab active" data-tab="lineups">Expected Lineups</div>
            <div class="rnd-tab" data-tab="analysis">Analysis</div>
            <div class="rnd-tab" data-tab="venue">Venue</div>
            <div class="rnd-tab" data-tab="h2h">H2H</div>`;
        return `
            <div class="rnd-tab" data-tab="details">Details</div>
            <div class="rnd-tab" data-tab="statistics">Statistics</div>
            <div class="rnd-tab" data-tab="report">Report</div>
            <div class="rnd-tab active" data-tab="lineups">Lineups</div>
            <div class="rnd-tab" data-tab="analysis">Analysis</div>
            ${isLeague ? '<div class="rnd-tab" data-tab="league">League</div>' : ''}
            <div class="rnd-tab" data-tab="venue">Venue</div>
            <div class="rnd-tab" data-tab="h2h">H2H</div>`;
    };

    window.TmMatchDialog = {
        /**
         * Build the full dialog overlay element.
         * @param {object} mData        — full match data object
         * @param {boolean} matchIsFuture
         * @param {boolean} matchIsLive
         * @returns {jQuery} overlay element (not yet appended to DOM)
         */
        build(mData, matchIsFuture, matchIsLive) {
            const md = mData.match_data;
            const homeClub    = mData.club.home.club_name;
            const awayClub    = mData.club.away.club_name;
            const homeLogoId  = mData.club.home.id;
            const awayLogoId  = mData.club.away.id;
            const isLeague    = md.venue?.matchtype === 'l';

            const liveControls = matchIsFuture ? '' : `
                <div class="rnd-live-progress"><div class="rnd-live-progress-fill" id="rnd-live-progress-head" style="width:0%"></div></div>
                <div class="rnd-live-filter-group">
                  <button class="rnd-live-filter-btn" data-filter="all">All</button>
                  <button class="rnd-live-filter-btn${matchIsLive ? '' : ' active'}" data-filter="key">Key</button>
                  ${matchIsLive ? '<button class="rnd-live-filter-btn live-btn active" data-filter="live">Live</button>' : ''}
                </div>
                <button class="rnd-live-btn" id="rnd-live-play-head" title="Play / Pause">▶</button>
                <button class="rnd-live-btn" id="rnd-live-skip-head" title="Skip to end">⏭</button>`;

            return $(`
                <div class="rnd-overlay" id="rnd-overlay">
                    <div class="rnd-dialog">
                        <div class="rnd-dlg-head">
                            <button class="rnd-dlg-close" id="rnd-dlg-close">&times;</button>
                            <div class="rnd-dlg-head-content">
                              <div class="rnd-dlg-head-row">
                                <div class="rnd-dlg-team-group home">
                                  <div class="rnd-dlg-team-info">
                                    <span class="rnd-dlg-team">${homeClub}</span>
                                    <div class="rnd-dlg-chips">${buildChips(md, 'home')}</div>
                                  </div>
                                  <img class="rnd-dlg-logo" src="/pics/club_logos/${homeLogoId}_140.png" onerror="this.style.display='none'">
                                </div>
                                <div class="rnd-dlg-score-block">
                                  <span class="rnd-dlg-score">0 - 0</span>
                                  <div class="rnd-dlg-datetime">${buildDatetime(md)}</div>
                                </div>
                                <div class="rnd-dlg-team-group away">
                                  <img class="rnd-dlg-logo" src="/pics/club_logos/${awayLogoId}_140.png" onerror="this.style.display='none'">
                                  <div class="rnd-dlg-team-info">
                                    <span class="rnd-dlg-team">${awayClub}</span>
                                    <div class="rnd-dlg-chips">${buildChips(md, 'away')}</div>
                                  </div>
                                </div>
                              </div>
                              <div class="rnd-dlg-head-time">
                                <span class="rnd-live-min" id="rnd-live-min-head">${matchIsFuture ? '⏳' : '0:00'}</span>
                                ${liveControls}
                              </div>
                            </div>
                        </div>
                        <div class="rnd-tabs">${buildTabs(matchIsFuture, isLeague)}</div>
                        <div class="rnd-dlg-body" id="rnd-dlg-body"></div>
                    </div>
                </div>
            `);
        },
    };

})();



// ─── components/match/tm-match-venue.js ─────────────────────

(function () {
    'use strict';

    window.TmMatchVenue = {
        render(body, mData) {
        const md = mData.match_data;
        const venue = md.venue;
        const weatherBase = (venue.weather || '').replace(/\d+/g, '');
        const weatherMap = {
            sunny: { icon: '☀️', text: 'Sunny', desc: 'Clear skies' },
            cloudy: { icon: '⛅', text: 'Cloudy', desc: 'Partly cloudy' },
            rainy: { icon: '🌧️', text: 'Rain', desc: 'Wet conditions' },
            snow: { icon: '❄️', text: 'Snow', desc: 'Snowy pitch' },
            overcast: { icon: '☁️', text: 'Overcast', desc: 'Heavy clouds' }
        };
        const w = weatherMap[weatherBase] || { icon: '🌤️', text: weatherBase.charAt(0).toUpperCase() + weatherBase.slice(1), desc: '' };

        const capacity = Number(venue.capacity) || 0;
        const attendance = Number(md.attendance) || 0;
        const attPct = capacity ? Math.round(attendance / capacity * 100) : 0;
        const pitchPct = Number(venue.pitch_condition) || 0;

        // Stadium SVG illustration
        const stadiumSvg = `<svg class="rnd-venue-stadium-svg" width="220" height="80" viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="110" cy="65" rx="100" ry="12" fill="#2a5a16" stroke="#4a9030" stroke-width="1"/>
            <path d="M25 65 L25 30 Q25 22 33 20 L55 16 Q60 15 60 20 L60 65" fill="#1e4412" stroke="#4a9030" stroke-width="0.8"/>
            <path d="M60 65 L60 22 Q60 14 68 12 L102 6 Q110 5 110 12 L110 65" fill="#1a3d0f" stroke="#4a9030" stroke-width="0.8"/>
            <path d="M110 65 L110 12 Q110 5 118 6 L152 12 Q160 14 160 22 L160 65" fill="#1a3d0f" stroke="#4a9030" stroke-width="0.8"/>
            <path d="M160 65 L160 20 Q160 15 165 16 L187 20 Q195 22 195 30 L195 65" fill="#1e4412" stroke="#4a9030" stroke-width="0.8"/>
            <rect x="70" y="50" width="80" height="15" rx="2" fill="#2d5e1a" stroke="#4a9030" stroke-width="0.6"/>
            <line x1="110" y1="50" x2="110" y2="65" stroke="#4a9030" stroke-width="0.4"/>
            <circle cx="110" cy="57" r="4" stroke="#4a9030" stroke-width="0.4" fill="none"/>
            <rect x="72" y="53" width="12" height="9" rx="1" fill="none" stroke="#4a9030" stroke-width="0.4"/>
            <rect x="136" y="53" width="12" height="9" rx="1" fill="none" stroke="#4a9030" stroke-width="0.4"/>
            ${[35, 50, 65, 80, 140, 155, 170, 185].map(x => `<rect x="${x - 1}" y="${x < 110 ? 28 : 28}" width="2" height="4" rx="0.5" fill="#6cc048" opacity="0.5"/>`).join('')}
            <ellipse cx="45" cy="26" rx="14" ry="3" fill="none" stroke="#4a9030" stroke-width="0.4" opacity="0.4"/>
            <ellipse cx="175" cy="26" rx="14" ry="3" fill="none" stroke="#4a9030" stroke-width="0.4" opacity="0.4"/>
        </svg>`;

        let html = '<div class="rnd-venue-wrap">';

        // Hero section with stadium
        html += '<div class="rnd-venue-hero">';
        html += stadiumSvg;
        html += `<div class="rnd-venue-name">${venue.name}</div>`;
        html += `<div class="rnd-venue-city">📍 ${venue.city}</div>`;
        html += `<div class="rnd-venue-tournament"><span>🏆 ${venue.tournament}</span></div>`;
        html += '</div>';

        // Capacity & Attendance cards
        html += '<div class="rnd-venue-cards">';
        html += `<div class="rnd-venue-card">
            <div class="rnd-venue-card-icon">🏟️</div>
            <div class="rnd-venue-card-value">${capacity.toLocaleString()}</div>
            <div class="rnd-venue-card-label">Capacity</div>
        </div>`;
        html += `<div class="rnd-venue-card">
            <div class="rnd-venue-card-icon">👥</div>
            <div class="rnd-venue-card-value">${attendance ? attendance.toLocaleString() : '—'}</div>
            <div class="rnd-venue-card-label">Attendance</div>
        </div>`;
        html += '</div>';

        // Attendance gauge bar
        if (attendance && capacity) {
            html += '<div class="rnd-venue-gauge-wrap">';
            html += '<div class="rnd-venue-gauge-header">';
            html += '<span class="rnd-venue-gauge-title">Stadium Fill</span>';
            html += `<span class="rnd-venue-gauge-value">${attPct}%</span>`;
            html += '</div>';
            html += `<div class="rnd-venue-gauge-bar"><div class="rnd-venue-gauge-fill attendance" style="width:${attPct}%"></div></div>`;
            html += '</div>';
        }

        // Weather card
        html += '<div class="rnd-venue-weather">';
        html += `<div class="rnd-venue-weather-icon">${w.icon}</div>`;
        html += '<div class="rnd-venue-weather-info">';
        html += `<div class="rnd-venue-weather-text">${w.text}</div>`;
        html += `<div class="rnd-venue-weather-sub">${w.desc}</div>`;
        html += '</div></div>';

        // Pitch condition gauge
        html += '<div class="rnd-venue-gauge-wrap">';
        html += '<div class="rnd-venue-gauge-header">';
        html += '<span class="rnd-venue-gauge-title">Pitch Condition</span>';
        html += `<span class="rnd-venue-gauge-value">${pitchPct}%</span>`;
        html += '</div>';
        const pitchColor = pitchPct >= 80 ? '#4a9030' : pitchPct >= 50 ? '#b8a030' : '#a04030';
        html += `<div class="rnd-venue-gauge-bar"><div class="rnd-venue-gauge-fill" style="width:${pitchPct}%;background:linear-gradient(90deg,${pitchColor},${pitchColor}dd)"></div></div>`;
        html += '</div>';

        // Facilities grid
        html += '<div class="rnd-venue-facilities">';
        const facilities = [
            { key: 'sprinklers', icon: '💧', label: 'Sprinklers' },
            { key: 'draining', icon: '🚰', label: 'Draining' },
            { key: 'pitchcover', icon: '🛡️', label: 'Pitch Cover' },
            { key: 'heating', icon: '🔥', label: 'Heating' },
        ];
        facilities.forEach(f => {
            const active = venue[f.key] ? 'active' : '';
            html += `<div class="rnd-venue-facility ${active}">
                <div class="rnd-venue-facility-icon">${f.icon}</div>
                <div class="rnd-venue-facility-label">${f.label}</div>
                <div class="rnd-venue-facility-status">${venue[f.key] ? '✓ Yes' : '✗ No'}</div>
            </div>`;
        });
        html += '</div>';

        html += '</div>';
        body.html(html);
        }
    };
})();



// ─── components/match/tm-match-h2h.js ───────────────────────

(function () {
    'use strict';

    window.TmMatchH2H = {
        render(body, mData) {
        body.html(TmUI.loading('Loading H2H…'));

        const homeId = String(mData.club.home.id);
        const awayId = String(mData.club.away.id);
        const homeName = mData.club.home.club_name;
        const awayName = mData.club.away.club_name;
        const homeLogo = mData.club.home.logo || `/pics/club_logos/${homeId}_140.png`;
        const awayLogo = mData.club.away.logo || `/pics/club_logos/${awayId}_140.png`;
        const kickoff = mData.match_data.venue.kickoff || Math.floor(Date.now() / 1000);

        window.TmApi.fetchMatchH2H(homeId, awayId, kickoff).then(data => {
            if (!data) return;

            // Compute totals for record strip
            const allStats = data.all || {};
            const hWins = allStats[homeId]?.w || 0;
            const aWins = allStats[awayId]?.w || 0;
            const draws = allStats[homeId]?.d || 0;
            const hGoalsTotal = allStats[homeId]?.gf || 0;
            const aGoalsTotal = allStats[awayId]?.gf || 0;

            let html = '<div class="rnd-h2h-wrap">';

            // Record strip: logo name [W] [D] [W] name logo
            html += `<div class="rnd-h2h-record">
                <div class="rnd-h2h-record-side">
                    <img class="rnd-h2h-record-logo" src="${homeLogo}" onerror="this.style.display='none'">
                    <span class="rnd-h2h-record-name">${homeName}</span>
                </div>
                <div class="rnd-h2h-record-stat">
                    <span class="rnd-h2h-record-num home">${hWins}</span>
                    <span class="rnd-h2h-record-label">Wins</span>
                </div>
                <div class="rnd-h2h-record-stat">
                    <span class="rnd-h2h-record-num draw">${draws}</span>
                    <span class="rnd-h2h-record-label">Draws</span>
                </div>
                <div class="rnd-h2h-record-stat">
                    <span class="rnd-h2h-record-num away">${aWins}</span>
                    <span class="rnd-h2h-record-label">Wins</span>
                </div>
                <div class="rnd-h2h-record-side away">
                    <img class="rnd-h2h-record-logo" src="${awayLogo}" onerror="this.style.display='none'">
                    <span class="rnd-h2h-record-name">${awayName}</span>
                </div>
            </div>`;

            // Goals summary line
            if (hGoalsTotal || aGoalsTotal) {
                html += `<div class="rnd-h2h-goals-summary">Goals: <span>${hGoalsTotal}</span> – <span>${aGoalsTotal}</span></div>`;
            }

            // Match history grouped by season (newest first)
            html += '<div class="rnd-h2h-matches">';
            if (data.matches) {
                const seasons = Object.keys(data.matches).sort((a, b) => Number(b) - Number(a));
                const currentSeason = SESSION?.season;
                const clubNames = {};
                clubNames[homeId] = homeName;
                clubNames[awayId] = awayName;

                seasons.forEach(season => {
                    html += `<div class="rnd-h2h-season">Season ${season}</div>`;
                    data.matches[season].forEach(m => {
                        const [hGoals, aGoals] = (m.result || '0-0').split('-').map(Number);
                        const mHomeId = String(m.hometeam);
                        const hName = clubNames[mHomeId] || m.hometeam;
                        const aName = clubNames[String(m.awayteam)] || m.awayteam;
                        const hWin = hGoals > aGoals;
                        const aWin = aGoals > hGoals;
                        const isDraw = hGoals === aGoals;
                        // Determine result class from perspective of the "home" club in H2H
                        let resultClass = 'h2h-draw';
                        if (hWin && mHomeId === homeId || aWin && mHomeId !== homeId) resultClass = 'h2h-win';
                        else if (!isDraw) resultClass = 'h2h-loss';
                        let div = m.division ? `Division ${m.division}` : (m.matchtype || '');
                        if (m.matchtype === "fl") {
                            div = "Friendly league";
                        }
                        if (m.matchtype === "f") {
                            div = "Quick match";
                        } else if (["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"].includes(m.matchtype)) {
                            div = "Cup";
                        } else if (["ueg", "ue1", "ue2"].includes(m.matchtype)) {
                            div = "Conference League";
                        } else if (["clg", "cl1", "cl2"].includes(m.matchtype)) {
                            div = "Champions League";
                        }
                        const isOldSeason = Number(season) !== currentSeason;
                        html += `<div class="rnd-h2h-match ${resultClass}${isOldSeason ? ' h2h-readonly' : ''}" data-mid="${m.id}" data-season="${season}">`;
                        html += `<div class="rnd-h2h-date">${m.date || ''}</div>`;
                        if (div) html += `<span class="rnd-h2h-type-badge">${div}</span>`;
                        html += `<div class="rnd-h2h-home${hWin ? ' winner' : ''}">${hName}</div>`;
                        html += `<div class="rnd-h2h-result">${m.result}</div>`;
                        html += `<div class="rnd-h2h-away${aWin ? ' winner' : ''}">${aName}</div>`;
                        if (m.attendance_format) html += `<div class="rnd-h2h-att">🏟 ${m.attendance_format}</div>`;
                        html += `</div>`;
                    });
                });
            }
            html += '</div></div>';

            body.html(html);

            // ── Tooltip cache & hover logic ──
            const tooltipCache = {};
            let tooltipEl = null;
            let tooltipTimer = null;
            let tooltipHideTimer = null;
            const currentSeasonNum = SESSION?.season || 0;

            // ── Tooltip from tooltip.ajax.php (older seasons, same layout as rich) ──
            const buildTooltipContent = (d) => {
                const hName = d.hometeam_name || '';
                const aName = d.awayteam_name || '';
                // Try to get team IDs for logos from the H2H context
                const hLogoId = d.hometeam || '';
                const aLogoId = d.awayteam || '';
                const hLogoUrl = hLogoId ? `/pics/club_logos/${hLogoId}_140.png` : '';
                const aLogoUrl = aLogoId ? `/pics/club_logos/${aLogoId}_140.png` : '';

                let t = '';
                // Header with logos (identical to rich tooltip)
                t += `<div class="rnd-h2h-tooltip-header">`;
                if (hLogoUrl) t += `<img class="rnd-h2h-tooltip-logo" src="${hLogoUrl}" onerror="this.style.display='none'">`;
                t += `<span class="rnd-h2h-tooltip-team">${hName}</span>`;
                t += `<span class="rnd-h2h-tooltip-score">${d.result || ''}</span>`;
                t += `<span class="rnd-h2h-tooltip-team">${aName}</span>`;
                if (aLogoUrl) t += `<img class="rnd-h2h-tooltip-logo" src="${aLogoUrl}" onerror="this.style.display='none'">`;
                t += `</div>`;

                // Meta
                t += `<div class="rnd-h2h-tooltip-meta">`;
                if (d.date) t += `<span>📅 ${d.date}</span>`;
                if (d.attendance_format) t += `<span>🏟 ${d.attendance_format}</span>`;
                t += `</div>`;

                // Events: goals & cards (same structure as rich)
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

                // MOM
                if (report.mom_name) {
                    t += `<div class="rnd-h2h-tooltip-mom">⭐ Man of the Match: <span>${report.mom_name}</span></div>`;
                }
                return t;
            };

            // ── Rich tooltip from match.ajax.php (current season) ──
            const buildRichTooltip = (mData) => {
                const md = mData.match_data || {};
                const club = mData.club || {};
                const hName = club.home?.club_name || '';
                const aName = club.away?.club_name || '';
                const hId = String(club.home?.id || '');
                const aId = String(club.away?.id || '');
                const hLogo = club.home?.logo || `/pics/club_logos/${hId}_140.png`;
                const aLogo = club.away?.logo || `/pics/club_logos/${aId}_140.png`;
                const report = mData.report || {};

                // Find final score from report
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
                // If halftime has score, at least use that
                if (finalScore === '0 - 0' && md.halftime?.chance?.text) {
                    const htText = md.halftime.chance.text.flat().join(' ');
                    const sm = htText.match(/(\d+)-(\d+)/);
                    if (sm) finalScore = sm[1] + ' - ' + sm[2];
                }

                let t = '';
                // Header with logos
                t += `<div class="rnd-h2h-tooltip-header">`;
                t += `<img class="rnd-h2h-tooltip-logo" src="${hLogo}" onerror="this.style.display='none'">`;
                t += `<span class="rnd-h2h-tooltip-team">${hName}</span>`;
                t += `<span class="rnd-h2h-tooltip-score">${finalScore}</span>`;
                t += `<span class="rnd-h2h-tooltip-team">${aName}</span>`;
                t += `<img class="rnd-h2h-tooltip-logo" src="${aLogo}" onerror="this.style.display='none'">`;
                t += `</div>`;

                // Meta
                t += `<div class="rnd-h2h-tooltip-meta">`;
                const ko = md.venue?.kickoff_readable || '';
                if (ko) {
                    const d = new Date(ko.replace(' ', 'T'));
                    t += `<span>📅 ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>`;
                }
                if (md.venue?.name) t += `<span>🏟 ${md.venue.name}</span>`;
                if (md.attendance) t += `<span>👥 ${Number(md.attendance).toLocaleString()}</span>`;
                t += `</div>`;

                // Key events: goals, cards, subs — extracted from report
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
                            if (p.sub) {
                                const plIn = mData.lineup?.home?.[p.sub.player_in] || mData.lineup?.away?.[p.sub.player_in];
                                const plOut = mData.lineup?.home?.[p.sub.player_out] || mData.lineup?.away?.[p.sub.player_out];
                                keyEvents.push({
                                    min, type: 'sub', isHome,
                                    nameIn: plIn?.nameLast || plIn?.name || '?',
                                    nameOut: plOut?.nameLast || plOut?.name || '?'
                                });
                            }
                        });
                    });
                });

                // Goals & cards section
                const goals = keyEvents.filter(e => e.type === 'goal');
                const cards = keyEvents.filter(e => e.type === 'yellow' || e.type === 'red');

                t += window.TmMatchUtils.renderRichEvents(goals, cards);

                // Stats: possession, shots
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

                // MOM
                const allPlayers = [...Object.values(mData.lineup?.home || {}), ...Object.values(mData.lineup?.away || {})];
                const mom = allPlayers.find(p => p.mom === 1 || p.mom === '1');
                if (mom) {
                    t += `<div class="rnd-h2h-tooltip-mom">⭐ Man of the Match: <span>${mom.nameLast || mom.name}</span> (${parseFloat(mom.rating).toFixed(1)})</div>`;
                }

                return t;
            };

            const showTooltip = (el, mid, season) => {
                clearTimeout(tooltipHideTimer);
                if (tooltipEl) tooltipEl.remove();
                const isCurrentSeason = Number(season) === currentSeasonNum;
                tooltipEl = $('<div class="rnd-h2h-tooltip"></div>');
                $(el).append(tooltipEl);

                if (tooltipCache[mid]) {
                    const cached = tooltipCache[mid];
                    tooltipEl.html(cached._rich ? buildRichTooltip(cached) : buildTooltipContent(cached));
                    requestAnimationFrame(() => tooltipEl.addClass('visible'));
                } else {
                    tooltipEl.html(TmUI.loading('Loading…', true));
                    requestAnimationFrame(() => tooltipEl.addClass('visible'));
                    const onFail = () => { if (tooltipEl) tooltipEl.html(TmUI.error('Failed', true)); };
                    if (isCurrentSeason) {
                        // Current season → full match data endpoint
                        window.TmApi.fetchMatch(mid).then(d => {
                            if (!d) { onFail(); return; }
                            d._rich = true;
                            tooltipCache[mid] = d;
                            if (tooltipEl && tooltipEl.closest('.rnd-h2h-match').data('mid') == mid) {
                                tooltipEl.html(buildRichTooltip(d));
                            }
                        });
                    } else {
                        // Older season → tooltip endpoint
                        window.TmApi.fetchMatchTooltip(mid, season).then(d => {
                            if (!d) { onFail(); return; }
                            // Attach team IDs from H2H context for logos
                            d._homeId = homeId;
                            d._awayId = awayId;
                            tooltipCache[mid] = d;
                            if (tooltipEl && tooltipEl.closest('.rnd-h2h-match').data('mid') == mid) {
                                tooltipEl.html(buildTooltipContent(d));
                            }
                        });
                    }
                }
            };

            const hideTooltip = () => {
                tooltipHideTimer = setTimeout(() => {
                    if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
                }, 100);
            };

            body.on('mouseenter', '.rnd-h2h-match', function () {
                const el = this;
                const mid = $(el).data('mid');
                const season = $(el).data('season');
                clearTimeout(tooltipTimer);
                tooltipTimer = setTimeout(() => showTooltip(el, mid, season), 300);
            });
            body.on('mouseleave', '.rnd-h2h-match', function () {
                clearTimeout(tooltipTimer);
                hideTooltip();
            });

            // Click on match → open in new tab (current season only)
            body.on('click', '.rnd-h2h-match', function () {
                if ($(this).hasClass('h2h-readonly')) return;
                const mid = $(this).data('mid');
                if (mid) window.open('/matches/' + mid, '_blank');
            });
        }).fail(() => {
            body.html(TmUI.error('Failed to load H2H data'));
        });
        }
    };
})();



// ─── components/match/tm-match-statistics.js ────────────────

(function () {
    'use strict';

    window.TmMatchStatistics = {
        render(body, mData, curMin = 999, curEvtIdx = 999, opts = {}) {
            const liveState            = opts.liveState;
            const isEventVisible       = opts.isEventVisible;
            const buildPlayerNames     = opts.buildPlayerNames;
            const buildReportEventHtml = opts.buildReportEventHtml;
        const md = mData.match_data;
        const homeClub = mData.club.home.club_name;
        const awayClub = mData.club.away.club_name;
        const homeId = String(mData.club.home.id);
        const awayId = String(mData.club.away.id);
        const homeLogo = `/pics/club_logos/${homeId}_140.png`;
        const awayLogo = `/pics/club_logos/${awayId}_140.png`;

        // ── Count stats from report (filtered by current step) ──
        const homeIds = new Set(Object.keys(mData.lineup.home));
        const report = mData.report || {};
        const stats = window.TmMatchUtils.extractStats(report, homeIds, homeId, {
            upToMin: curMin, upToEvtIdx: curEvtIdx, isEventVisible,
        });

        let html = '<div class="rnd-stats-wrap">';

        // Team header with logos
        html += '<div class="rnd-stats-team-header">';
        html += `<div class="rnd-stats-team-side home"><img class="rnd-stats-team-logo" src="${homeLogo}" onerror="this.style.display='none'"><span class="rnd-stats-team-name">${homeClub}</span></div>`;
        html += '<span class="rnd-stats-vs">vs</span>';
        html += `<div class="rnd-stats-team-side away"><img class="rnd-stats-team-logo" src="${awayLogo}" onerror="this.style.display='none'"><span class="rnd-stats-team-name">${awayClub}</span></div>`;
        html += '</div>';

        // Helper: single combined bar row
        const barRow = (label, hVal, aVal, highlight = false) => {
            const hNum = typeof hVal === 'string' ? parseFloat(hVal) : hVal;
            const aNum = typeof aVal === 'string' ? parseFloat(aVal) : aVal;
            const total = hNum + aNum;
            const hPct = total === 0 ? 50 : Math.round(hNum / total * 100);
            const aPct = 100 - hPct;
            const hLead = hNum > aNum ? ' leading' : '';
            const aLead = aNum > hNum ? ' leading' : '';
            const cls = highlight ? 'rnd-stat-row rnd-stat-row-highlight' : 'rnd-stat-row';
            return `<div class="${cls}">
                <div class="rnd-stat-header">
                    <span class="rnd-stat-val home${hLead}">${hVal}</span>
                    <span class="rnd-stat-label">${label}</span>
                    <span class="rnd-stat-val away${aLead}">${aVal}</span>
                </div>
                <div class="rnd-stat-bar-wrap">
                    <div class="rnd-stat-seg home" style="width:${hPct}%"></div>
                    <div class="rnd-stat-seg away" style="width:${aPct}%"></div>
                </div>
            </div>`;
        };

        // Possession (only available at full time)
        const matchEnded = !liveState || liveState.ended;
        if (md.possession && matchEnded) {
            const h = Number(md.possession.home), a = Number(md.possession.away);
            html += barRow('Possession', h + '%', a + '%', true);
        }

        html += '<div class="rnd-stat-divider"></div>';
        html += barRow('Shots', stats.homeShots, stats.awayShots);
        html += barRow('On Target', stats.homeSoT, stats.awaySoT);
        html += '<div class="rnd-stat-divider"></div>';
        html += barRow('Yellow Cards', stats.homeYellow, stats.awayYellow);
        html += barRow('Red Cards', stats.homeRed, stats.awayRed);
        html += '<div class="rnd-stat-divider"></div>';
        html += barRow('Set Pieces', stats.homeSetPieces, stats.awaySetPieces);
        if (stats.homePenalties || stats.awayPenalties) {
            html += barRow('Penalties', stats.homePenalties, stats.awayPenalties);
        }

        // ── Advanced Stats: Attacking Styles ──
        const { ATTACK_STYLES, STYLE_ORDER, SKIP_PREFIXES } = window.TmConst;
        const playerNames = buildPlayerNames(mData);

        // Collect per-style, per-side data
        const advData = { home: {}, away: {} };
        STYLE_ORDER.forEach(s => { advData.home[s] = { a: 0, l: 0, sh: 0, g: 0, events: [] }; advData.away[s] = { a: 0, l: 0, sh: 0, g: 0, events: [] }; });

        const sortedMins = Object.keys(report).map(Number).sort((a, b) => a - b);
        for (const min of sortedMins) {
            const evts = report[String(min)] || [];
            for (let si = 0; si < evts.length; si++) {
                const evt = evts[si];
                if (!evt.type) continue;
                if (!isEventVisible(min, si, curMin, curEvtIdx)) continue;
                const prefix = evt.type.replace(/[0-9]+.*/, '');

                // Handle penalty events (type starts with p_)
                const isPenEvt = /^p_/.test(evt.type);
                const hasShot = evt.parameters?.some(p => p.shot);
                const hasGoal = evt.parameters?.some(p => p.goal);
                const hasPenParam = evt.parameters?.some(p => p.penalty);

                if (isPenEvt && hasPenParam && hasGoal) {
                    const club = String(evt.club);
                    const side = club === homeId ? 'home' : 'away';
                    const pd = advData[side]['Penalties'];
                    pd.a++; pd.g++; pd.sh++;
                    pd.events.push({ min, evt, evtIdx: si, result: 'goal' });
                    continue;
                } else if (isPenEvt && hasShot && !hasGoal) {
                    const club = String(evt.club);
                    const side = club === homeId ? 'home' : 'away';
                    const pd = advData[side]['Penalties'];
                    pd.a++; pd.sh++;
                    pd.events.push({ min, evt, evtIdx: si, result: 'shot' });
                    continue;
                }

                if (SKIP_PREFIXES.has(prefix)) continue;
                const styleEntry = ATTACK_STYLES.find(s => s.key === prefix);
                if (!styleEntry) continue;
                const label = styleEntry.label;
                const club = String(evt.club);
                const side = club === homeId ? 'home' : 'away';
                const d = advData[side][label];
                d.a++;
                let result = 'lost';
                if (hasGoal) { d.g++; d.sh++; result = 'goal'; }
                else if (hasShot) { d.sh++; result = 'shot'; }
                else { d.l++; }
                d.events.push({ min, evt, evtIdx: si, result });
            }
        }

        // Build advanced section HTML
        html += '<div class="rnd-adv-section">';
        html += '<div class="rnd-adv-title">Attacking Styles</div>';

        const buildAdvTable = (teamName, side, sideClass) => {
            let t = `<div class="rnd-adv-team-label" style="color:${sideClass === 'home' ? '#80e048' : '#5ba8f0'}">${teamName}</div>`;
            t += '<table class="rnd-adv-table">';
            t += '<tr><th>Style</th><th>Att</th><th>Lost</th><th>Shot</th><th>Goal</th><th>Conv%</th></tr>';
            let totA = 0, totL = 0, totSh = 0, totG = 0;
            STYLE_ORDER.forEach(style => {
                const d = advData[side][style];
                totA += d.a; totL += d.l; totSh += d.sh; totG += d.g;
                const pct = d.a ? Math.round(d.g / d.a * 100) + '%' : '-';
                const cls = (v, type) => v === 0 ? 'adv-zero' : type;
                const rowId = `adv-${sideClass}-${style.replace(/\s/g, '-')}`;
                const hasEvents = d.events.length > 0;
                t += `<tr class="rnd-adv-row${hasEvents ? '' : ' rnd-adv-total'}" ${hasEvents ? 'data-adv-target="' + rowId + '"' : ''}>`;
                t += `<td>${style}${hasEvents ? ' <span class="adv-arrow">&#9654;</span>' : ''}</td>`;
                t += `<td class="${cls(d.a, '')}">${d.a}</td>`;
                t += `<td class="${cls(d.l, 'adv-lost')}">${d.l}</td>`;
                t += `<td class="${cls(d.sh, 'adv-shot')}">${d.sh}</td>`;
                t += `<td class="${cls(d.g, 'adv-goal')}">${d.g}</td>`;
                t += `<td class="${cls(d.a ? d.g : 0, '')}">${pct}</td>`;
                t += '</tr>';
                if (hasEvents) {
                    t += `<tr class="rnd-adv-events" id="${rowId}"><td colspan="6"><div class="rnd-adv-evt-list">`;
                    d.events.forEach(e => {
                        t += `<div class="rnd-adv-evt"><span class="adv-result-tag ${e.result}">${e.result}</span>${buildReportEventHtml(e.evt, e.min, e.evtIdx, playerNames, homeId)}</div>`;
                    });
                    t += '</div></td></tr>';
                }
            });
            // Total row
            const totPct = totA ? Math.round(totG / totA * 100) + '%' : '-';
            t += '<tr class="rnd-adv-row rnd-adv-total">';
            t += `<td>Total</td><td>${totA}</td><td>${totL}</td><td>${totSh}</td><td>${totG}</td><td>${totPct}</td>`;
            t += '</tr>';
            t += '</table>';
            return t;
        };

        html += buildAdvTable(homeClub, 'home', 'home');
        html += buildAdvTable(awayClub, 'away', 'away');
        html += '</div>';

        // ── Player Statistics (from video segments) ──
        const pStats = window.TmMatchUtils.buildPlayerEventStats(report, {
            isEventVisible, upToMin: curMin, upToEvtIdx: curEvtIdx,
            recordEvents: true,
        });

        html += '<div class="rnd-adv-section">';
        html += '<div class="rnd-adv-title">Player Statistics</div>';

        const ACTION_LABELS = { pass_ok: 'pass \u2713', pass_fail: 'pass \u2717', cross_ok: 'cross \u2713', cross_fail: 'cross \u2717', shot: 'shot', save: 'save', goal: 'goal', assist: 'assist', duel_won: 'duel \u2713', duel_lost: 'duel \u2717', intercept: 'INT', tackle: 'TKL', header_clear: 'HC', tackle_fail: 'TF', foul: 'foul', yellow: '\uD83D\uDFE8', red: '\uD83D\uDFE5' };
        const ACTION_CLS = { pass_ok: 'shot', pass_fail: 'lost', cross_ok: 'shot', cross_fail: 'lost', shot: 'shot', save: 'shot', goal: 'goal', assist: 'goal', duel_won: 'shot', duel_lost: 'lost', intercept: 'shot', tackle: 'shot', header_clear: 'shot', tackle_fail: 'lost', foul: 'lost', yellow: 'lost', red: 'lost' };

        // Build sub events for minutes-played calculation
        const subEvents = {};  // playerId → { subInMin, subOutMin }
        for (const min of sortedMins) {
            (report[String(min)] || []).forEach(evt => {
                if (!evt.parameters) return;
                evt.parameters.forEach(param => {
                    if (param.sub) {
                        const inId = String(param.sub.player_in);
                        const outId = String(param.sub.player_out);
                        if (!subEvents[inId]) subEvents[inId] = {};
                        subEvents[inId].subInMin = min;
                        if (!subEvents[outId]) subEvents[outId] = {};
                        subEvents[outId].subOutMin = min;
                    }
                });
            });
        }
        const matchEndMin = mData.match_data?.regular_last_min || Math.max(...sortedMins, 90);
        const posOrder = { gk: 0, dl: 1, dcl: 2, dc: 3, dcr: 4, dr: 5, dml: 6, dmcl: 7, dmc: 8, dmcr: 9, dmr: 10, ml: 11, mcl: 12, mc: 13, mcr: 14, mr: 15, oml: 16, omcl: 17, omc: 18, omcr: 19, omr: 20, fcl: 21, fc: 22, fcr: 23 };
        const ratClr = window.TmUtils.ratingColor;

        const buildPlayerTable = (teamName, side, sideClass) => {
            const lineup = mData.lineup[side];
            const starters = [], playedSubs = [];
            Object.entries(lineup).forEach(([id, p]) => {
                const isSub = p.position.includes('sub');
                const se = subEvents[String(p.player_id)] || {};
                if (isSub && !se.subInMin) return;  // Sub who never played — skip
                let minsPlayed;
                if (isSub) {
                    const endMin = se.subOutMin || matchEndMin;
                    minsPlayed = endMin - se.subInMin;
                } else {
                    const endMin = se.subOutMin || matchEndMin;
                    minsPlayed = endMin;
                }
                const entry = { id: String(p.player_id), p, minsPlayed };
                if (isSub) playedSubs.push(entry);
                else starters.push(entry);
            });
            starters.sort((a, b) => (posOrder[a.p.position] ?? 99) - (posOrder[b.p.position] ?? 99));
            playedSubs.sort((a, b) => (subEvents[a.id]?.subInMin || 99) - (subEvents[b.id]?.subInMin || 99));
            const players = [...starters, ...playedSubs];

            let t = `<div class="rnd-adv-team-label" style="color:${sideClass === 'home' ? '#80e048' : '#5ba8f0'}">${teamName}</div>`;
            t += '<table class="rnd-adv-table">';
            const colCount = matchEnded ? 12 : 11;
            t += '<tr><th>Player</th><th title="Minutes Played">Min</th><th title="Successful Passes">SP</th><th title="Unsuccessful Passes">UP</th><th title="Successful Crosses">SC</th><th title="Unsuccessful Crosses">UC</th><th title="Shots / Saves">Sh</th><th>G</th><th>A</th><th title="Duels Won">DW</th><th title="Duels Lost">DL</th>' + (matchEnded ? '<th>Rat</th>' : '') + '</tr>';
            let totSP = 0, totUP = 0, totSC = 0, totUC = 0, totSh = 0, totG = 0, totA = 0, totDW = 0, totDL = 0;
            players.forEach(({ id, p, minsPlayed }) => {
                const s = pStats[id] || { sp: 0, up: 0, sc: 0, uc: 0, sh: 0, sv: 0, g: 0, a: 0, dw: 0, dl: 0, events: [] };
                const isGK = p.position === 'gk';
                totSP += s.sp; totUP += s.up; totSC += s.sc; totUC += s.uc; totSh += (isGK ? s.sv : s.sh); totG += s.g; totA += s.a; totDW += s.dw; totDL += s.dl;
                const rowId = `plr-${sideClass}-${id}`;
                const hasEvts = s.events.length > 0;
                const cls = (v, type) => v === 0 ? 'adv-zero' : type;
                const isSub = p.position.includes('sub');
                t += `<tr class="rnd-adv-row${hasEvts ? '' : ' rnd-adv-total'}" ${hasEvts ? 'data-adv-target="' + rowId + '"' : ''}>`;
                t += `<td>${isSub ? '<span style="color:#6a9a58;font-size:9px">↑</span> ' : ''}${playerNames[id] || id}${hasEvts ? ' <span class="adv-arrow">&#9654;</span>' : ''}</td>`;
                t += `<td style="color:#8aac72">${minsPlayed}'</td>`;
                t += `<td class="${cls(s.sp, '')}">${s.sp}</td>`;
                t += `<td class="${cls(s.up, 'adv-lost')}">${s.up}</td>`;
                t += `<td class="${cls(s.sc, '')}">${s.sc}</td>`;
                t += `<td class="${cls(s.uc, 'adv-lost')}">${s.uc}</td>`;
                t += isGK ? `<td class="${cls(s.sv, 'adv-shot')}" title="Saves">${s.sv} 🧤</td>` : `<td class="${cls(s.sh, 'adv-shot')}">${s.sh}</td>`;
                t += `<td class="${cls(s.g, 'adv-goal')}">${s.g}</td>`;
                t += `<td class="${cls(s.a, 'adv-goal')}">${s.a}</td>`;
                t += `<td class="${cls(s.dw, '')}">${s.dw}</td>`;
                t += `<td class="${cls(s.dl, 'adv-lost')}">${s.dl}</td>`;
                if (matchEnded) {
                    const rFmt = p.rating ? Number(p.rating).toFixed(2) : '-';
                    t += `<td style="font-weight:700;color:${ratClr(p.rating)}">${rFmt}</td>`;
                }
                t += '</tr>';
                if (hasEvts) {
                    t += `<tr class="rnd-adv-events" id="${rowId}"><td colspan="${colCount}"><div class="rnd-adv-evt-list">`;
                    s.events.forEach(ev => {
                        const acls = ACTION_CLS[ev.action] || '';
                        const albl = ACTION_LABELS[ev.action] || ev.action;
                        t += `<div class="rnd-adv-evt"><span class="adv-result-tag ${acls}">${albl}</span>${buildReportEventHtml(ev.evt, ev.min, ev.evtIdx, playerNames, homeId)}</div>`;
                    });
                    t += '</div></td></tr>';
                }
            });
            const clsT = (v, type) => v === 0 ? 'adv-zero' : type;
            t += '<tr class="rnd-adv-row rnd-adv-total">';
            t += `<td>Total</td><td></td><td>${totSP}</td><td class="${clsT(totUP, 'adv-lost')}">${totUP}</td><td>${totSC}</td><td class="${clsT(totUC, 'adv-lost')}">${totUC}</td><td>${totSh}</td><td class="${clsT(totG, 'adv-goal')}">${totG}</td><td class="${clsT(totA, 'adv-goal')}">${totA}</td><td>${totDW}</td><td class="${clsT(totDL, 'adv-lost')}">${totDL}</td>` + (matchEnded ? '<td></td>' : '');
            t += '</tr>';
            t += '</table>';
            return t;
        };

        html += buildPlayerTable(homeClub, 'home', 'home');
        html += buildPlayerTable(awayClub, 'away', 'away');
        html += '</div>';

        html += '</div>';
        body.html(html);

        // Wire up expand/collapse for adv rows
        body.find('.rnd-adv-row[data-adv-target]').on('click', function () {
            const targetId = $(this).data('adv-target');
            const evtRow = document.getElementById(targetId);
            if (evtRow) {
                $(this).toggleClass('expanded');
                $(evtRow).toggleClass('visible');
            }
        });
        // Wire up accordion toggle for embedded report events
        body.off('click.rndacc').on('click.rndacc', '.rnd-acc-head', function (e) {
            e.stopPropagation();
            $(this).closest('.rnd-acc').toggleClass('open');
        });
        }
    };
})();



// ─── components/match/tm-match-analysis.js ──────────────────

(function () {
    'use strict';

    const { R5_THRESHOLDS } = window.TmConst;
    const getColor = window.TmUtils.getColor;

    window.TmMatchAnalysis = {
        render(body, mData, opts = {}) {
            const getPlayerData = opts.getPlayerData;
            body.html(TmUI.loading('Analyzing squads\u2026'));

            const homeId = String(mData.club.home.id);
            const awayId = String(mData.club.away.id);
            const homeName = mData.club.home.club_name;
            const awayName = mData.club.away.club_name;
            const homeColor = '#' + (mData.club.home.colors?.club_color1 || '4a9030');
            const awayColor = '#' + (mData.club.away.colors?.club_color1 || '5b9bff');
            const md = mData.match_data;

            // Position categories
            const GK_POS = new Set(['gk']);
            const DEF_POS = new Set(['dl', 'dr', 'dc', 'dcl', 'dcr']);
            const MID_POS = new Set(['dml', 'dmr', 'dmc', 'dmcl', 'dmcr', 'ml', 'mr', 'mc', 'mcl', 'mcr', 'oml', 'omr', 'omc', 'omcl', 'omcr']);
            const ATT_POS = new Set(['fcl', 'fc', 'fcr']);

            const getLine = (pos) => {
                if (GK_POS.has(pos)) return 'GK';
                if (DEF_POS.has(pos)) return 'DEF';
                if (MID_POS.has(pos)) return 'MID';
                if (ATT_POS.has(pos)) return 'ATT';
                return 'SUB';
            };

            // Detect formation from starters
            const detectFormation = (lineup) => {
                let d = 0, m = 0, a = 0;
                Object.values(lineup).forEach(p => {
                    if (p.position.includes('sub')) return;
                    const line = getLine(p.position);
                    if (line === 'DEF') d++;
                    else if (line === 'MID') m++;
                    else if (line === 'ATT') a++;
                });
                return `${d}-${m}-${a}`;
            };

            // Form analysis
            const calcForm = (form) => {
                if (!form || !form.length) return { dots: [], pts: 0, last5: 0 };
                const dots = form.map(f => f.result);
                const pts = dots.reduce((s, r) => s + (r === 'w' ? 3 : r === 'd' ? 1 : 0), 0);
                const last5 = dots.slice(-5).reduce((s, r) => s + (r === 'w' ? 3 : r === 'd' ? 1 : 0), 0);
                return { dots, pts, last5 };
            };

            const homeForm = calcForm(mData.club.home.form);
            const awayForm = calcForm(mData.club.away.form);

            // Fetch R5 for all players
            const routineMap = new Map();
            const positionMap = new Map();
            const allPlayers = [...Object.values(mData.lineup.home), ...Object.values(mData.lineup.away)];
            allPlayers.forEach(p => {
                routineMap.set(p.player_id, parseFloat(p.routine));
                if (p.fp) positionMap.set(p.player_id, p.fp);
            });

            Promise.all(allPlayers.map(p =>
                getPlayerData(p.player_id, routineMap, positionMap)
                    .then(d => ({ id: p.player_id, r5: d.R5, age: d.Age }))
                    .catch(() => ({ id: p.player_id, r5: null, age: null }))
            )).then(results => {
                // Build per-player R5 map
                const r5Map = new Map();
                const ageMap = new Map();
                results.forEach(({ id, r5, age }) => {
                    if (r5 !== null) r5Map.set(String(id), r5);
                    if (age !== null) ageMap.set(String(id), age);
                });

                // Group by line for each side
                const lineR5 = { home: { GK: [], DEF: [], MID: [], ATT: [], ALL: [] }, away: { GK: [], DEF: [], MID: [], ATT: [], ALL: [] } };
                const lineAges = { home: [], away: [] };
                const lineRoutines = { home: [], away: [] };
                const playerDetails = { home: [], away: [] };

                ['home', 'away'].forEach(side => {
                    Object.values(mData.lineup[side]).forEach(p => {
                        const pid = String(p.player_id);
                        const isSub = p.position.includes('sub');
                        const r5 = r5Map.get(pid);
                        const age = ageMap.get(pid);
                        const line = isSub ? 'SUB' : getLine(p.position);
                        const routine = parseFloat(p.routine) || 0;

                        if (r5 !== undefined) {
                            if (!isSub) {
                                if (lineR5[side][line]) lineR5[side][line].push(r5);
                                lineR5[side].ALL.push(r5);
                            }
                            playerDetails[side].push({
                                name: p.nameLast || p.name,
                                no: p.no, fp: (p.fp || p.position).split(',')[0].toUpperCase(),
                                r5, age: age ? Math.floor(age / 12) : parseInt(p.age),
                                routine, isSub, pid,
                                udseende2: p.udseende2
                            });
                        }
                        if (!isSub) {
                            if (age) lineAges[side].push(age);
                            lineRoutines[side].push(routine);
                        }
                    });
                    // Sort by R5 descending
                    playerDetails[side].sort((a, b) => b.r5 - a.r5);
                });

                const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
                const avgR5 = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / 11 : 0; // Always /11

                // Build HTML
                let html = '<div class="rnd-analysis-wrap">';

                // ── 1. FORM ──
                html += '<div class="rnd-an-section">';
                html += '<div class="rnd-an-section-head"><span class="an-icon">📊</span> Form Guide</div>';
                html += '<div class="rnd-an-form-row">';
                // Home form
                html += '<div class="rnd-an-form-side home">';
                html += `<span class="rnd-an-form-label">${homeName.length > 12 ? homeName.substring(0, 12) + '…' : homeName}</span>`;
                html += '<div class="rnd-an-form-dots">';
                homeForm.dots.forEach(r => {
                    html += `<div class="rnd-an-form-dot ${r}">${r.toUpperCase()}</div>`;
                });
                html += `</div><span class="rnd-an-form-pts">${homeForm.pts}</span>`;
                html += '</div>';
                // Away form
                html += '<div class="rnd-an-form-side away">';
                html += `<span class="rnd-an-form-label">${awayName.length > 12 ? awayName.substring(0, 12) + '…' : awayName}</span>`;
                html += '<div class="rnd-an-form-dots">';
                awayForm.dots.forEach(r => {
                    html += `<div class="rnd-an-form-dot ${r}">${r.toUpperCase()}</div>`;
                });
                html += `</div><span class="rnd-an-form-pts">${awayForm.pts}</span>`;
                html += '</div>';
                html += '</div>';
                // Form comparison bar
                const totalFormPts = homeForm.pts + awayForm.pts || 1;
                html += '<div class="rnd-an-form-bar-wrap"><div class="rnd-an-form-bar">';
                html += `<div class="rnd-an-form-seg home" style="width:${Math.round(homeForm.pts / totalFormPts * 100)}%"></div>`;
                html += `<div class="rnd-an-form-seg away" style="width:${Math.round(awayForm.pts / totalFormPts * 100)}%"></div>`;
                html += '</div></div>';
                html += '</div>';

                // ── 2. SQUAD STRENGTH ──
                html += '<div class="rnd-an-section">';
                html += '<div class="rnd-an-section-head"><span class="an-icon">💪</span> Squad Strength (R5)</div>';

                const lines = ['GK', 'DEF', 'MID', 'ATT', 'ALL'];
                const lineLabels = { GK: 'Keeper', DEF: 'Defence', MID: 'Midfield', ATT: 'Attack', ALL: 'Overall' };
                lines.forEach(line => {
                    const hR5 = line === 'ALL' ? avgR5(lineR5.home.ALL) : avg(lineR5.home[line]);
                    const aR5 = line === 'ALL' ? avgR5(lineR5.away.ALL) : avg(lineR5.away[line]);
                    const maxR5 = Math.max(hR5, aR5, 1);
                    const hPct = Math.round(hR5 / maxR5 * 100);
                    const aPct = Math.round(aR5 / maxR5 * 100);
                    const hLead = hR5 > aR5 ? ' leading' : '';
                    const aLead = aR5 > hR5 ? ' leading' : '';
                    const isOverall = line === 'ALL';

                    html += `<div class="rnd-an-strength-row"${isOverall ? ' style="padding:8px 20px;border-top:1px solid rgba(80,160,48,.1)"' : ''}>`;
                    html += `<span class="rnd-an-str-val home${hLead}" style="color:${getColor(hR5, R5_THRESHOLDS)}">${hR5.toFixed(1)}</span>`;
                    html += `<div class="rnd-an-str-bar"><div class="rnd-an-str-fill home" style="width:${hPct}%"></div></div>`;
                    html += `<span class="rnd-an-str-label">${isOverall ? '⭐ ' : ''}${lineLabels[line]}</span>`;
                    html += `<div class="rnd-an-str-bar"><div class="rnd-an-str-fill away" style="width:${aPct}%"></div></div>`;
                    html += `<span class="rnd-an-str-val away${aLead}" style="color:${getColor(aR5, R5_THRESHOLDS)}">${aR5.toFixed(1)}</span>`;
                    html += '</div>';
                });
                html += '</div>';

                // ── 3. KEY PLAYERS ──
                html += '<div class="rnd-an-section">';
                html += '<div class="rnd-an-section-head"><span class="an-icon">🌟</span> Key Players</div>';
                html += '<div class="rnd-an-keys">';

                const faceUrl = (u, clrHex) => {
                    if (!u) return '';
                    return `https://trophymanager.com/pics/player_pic2.php?face=${u.face || 1}&nose=${u.nose || 1}&eyes=${u.eyes || 1}&ears=${u.ears || 1}&mouth=${u.mouth || 1}&brows=${u.brows || 1}&hcolor=${u.hair_color || 1}&scolor=${u.skin_color || 1}&hair=${u.hair || 1}&age=25&rgb=${clrHex}&w=72`;
                };

                ['home', 'away'].forEach(side => {
                    const clr = side === 'home' ? homeColor.replace('#', '') : awayColor.replace('#', '');
                    const top5 = playerDetails[side].filter(p => !p.isSub).slice(0, 5);
                    html += `<div class="rnd-an-keys-side${side === 'away' ? ' away' : ''}">`;
                    top5.forEach((p, i) => {
                        const url = faceUrl(p.udseende2, clr);
                        html += `<div class="rnd-an-key-player">`;
                        html += `<span class="rnd-an-key-rank">${i + 1}</span>`;
                        if (url) html += `<div class="rnd-an-key-face" style="border-color:${side === 'home' ? homeColor : awayColor}"><img src="${url}" onerror="this.style.display='none'"></div>`;
                        html += `<div class="rnd-an-key-info"><div class="rnd-an-key-name">${p.name}</div><div class="rnd-an-key-meta">${p.fp} · ${p.age}y · Rtn ${p.routine.toFixed(1)}</div></div>`;
                        html += `<span class="rnd-an-key-r5" style="color:${getColor(p.r5, R5_THRESHOLDS)}">${p.r5.toFixed(1)}</span>`;
                        html += '</div>';
                    });
                    html += '</div>';
                });
                html += '</div></div>';

                // ── 4. SQUAD PROFILE ──
                html += '<div class="rnd-an-section">';
                html += '<div class="rnd-an-section-head"><span class="an-icon">📋</span> Squad Profile</div>';
                html += '<div class="rnd-an-profile-grid">';

                const hAvgAge = avg(lineAges.home) / 12;
                const aAvgAge = avg(lineAges.away) / 12;
                const hAvgRtn = avg(lineRoutines.home);
                const aAvgRtn = avg(lineRoutines.away);
                const hStarterR5 = avgR5(lineR5.home.ALL);
                const aStarterR5 = avgR5(lineR5.away.ALL);
                const hSubs = playerDetails.home.filter(p => p.isSub);
                const aSubs = playerDetails.away.filter(p => p.isSub);
                const hBenchR5 = hSubs.length ? avg(hSubs.map(p => p.r5)) : 0;
                const aBenchR5 = aSubs.length ? avg(aSubs.map(p => p.r5)) : 0;

                html += `<div class="rnd-an-profile-card"><span class="rnd-an-profile-icon">🎂</span><div class="rnd-an-profile-info"><div class="rnd-an-profile-label">Avg Age</div><div class="rnd-an-profile-vals"><span class="rnd-an-profile-val home">${hAvgAge.toFixed(1)}</span><span class="rnd-an-profile-vs">vs</span><span class="rnd-an-profile-val away">${aAvgAge.toFixed(1)}</span></div></div></div>`;
                html += `<div class="rnd-an-profile-card"><span class="rnd-an-profile-icon">📈</span><div class="rnd-an-profile-info"><div class="rnd-an-profile-label">Avg Routine</div><div class="rnd-an-profile-vals"><span class="rnd-an-profile-val home">${hAvgRtn.toFixed(1)}</span><span class="rnd-an-profile-vs">vs</span><span class="rnd-an-profile-val away">${aAvgRtn.toFixed(1)}</span></div></div></div>`;
                html += `<div class="rnd-an-profile-card"><span class="rnd-an-profile-icon">⭐</span><div class="rnd-an-profile-info"><div class="rnd-an-profile-label">Starting XI R5</div><div class="rnd-an-profile-vals"><span class="rnd-an-profile-val home" style="color:${getColor(hStarterR5, R5_THRESHOLDS)}">${hStarterR5.toFixed(1)}</span><span class="rnd-an-profile-vs">vs</span><span class="rnd-an-profile-val away" style="color:${getColor(aStarterR5, R5_THRESHOLDS)}">${aStarterR5.toFixed(1)}</span></div></div></div>`;
                html += `<div class="rnd-an-profile-card"><span class="rnd-an-profile-icon">🪑</span><div class="rnd-an-profile-info"><div class="rnd-an-profile-label">Bench Avg R5</div><div class="rnd-an-profile-vals"><span class="rnd-an-profile-val home" style="color:${getColor(hBenchR5, R5_THRESHOLDS)}">${hBenchR5.toFixed(1)}</span><span class="rnd-an-profile-vs">vs</span><span class="rnd-an-profile-val away" style="color:${getColor(aBenchR5, R5_THRESHOLDS)}">${aBenchR5.toFixed(1)}</span></div></div></div>`;
                html += '</div></div>';

                // ── 5. TACTICAL MATCHUP ──
                html += '<div class="rnd-an-section">';
                html += '<div class="rnd-an-section-head"><span class="an-icon">⚔️</span> Tactical Matchup</div>';
                html += '<div class="rnd-an-tactics">';

                const mentalityMap = { 1: 'Very Defensive', 2: 'Defensive', 3: 'Slightly Defensive', 4: 'Normal', 5: 'Slightly Attacking', 6: 'Attacking', 7: 'Very Attacking' };
                const styleMap = { 1: 'Balanced', 2: 'Direct', 3: 'Wings', 4: 'Short Passing', 5: 'Long Balls', 6: 'Through Balls' };
                const focusMap = { 1: 'Balanced', 2: 'Left', 3: 'Central', 4: 'Right' };

                ['home', 'away'].forEach(side => {
                    const formation = detectFormation(mData.lineup[side]);
                    const ment = md.mentality ? (mentalityMap[md.mentality[side]] || '?') : '?';
                    const style = md.attacking_style && md.attacking_style[side] ? (styleMap[md.attacking_style[side]] || '?') : '—';
                    const focus = md.focus_side && md.focus_side[side] ? (focusMap[md.focus_side[side]] || '?') : '—';
                    const name = side === 'home' ? homeName : awayName;

                    html += `<div class="rnd-an-tactic-side${side === 'away' ? ' away' : ''}">`;
                    html += `<div class="rnd-an-tactic-team">${name}</div>`;
                    html += `<div class="rnd-an-tactic-item"><span class="t-icon">📐</span><span class="t-label">Formation</span><span class="t-val">${formation}</span></div>`;
                    html += `<div class="rnd-an-tactic-item"><span class="t-icon">⚔️</span><span class="t-label">Mentality</span><span class="t-val">${ment}</span></div>`;
                    html += `<div class="rnd-an-tactic-item"><span class="t-icon">🎯</span><span class="t-label">Style</span><span class="t-val">${style}</span></div>`;
                    html += `<div class="rnd-an-tactic-item"><span class="t-icon">◎</span><span class="t-label">Focus</span><span class="t-val">${focus}</span></div>`;
                    html += '</div>';
                });
                html += '</div></div>';

                // ── 6. UNAVAILABLE PLAYERS ──
                const hOut = md.lineup_out?.home ? Object.values(md.lineup_out.home) : [];
                const aOut = md.lineup_out?.away ? Object.values(md.lineup_out.away) : [];
                if (hOut.length || aOut.length) {
                    html += '<div class="rnd-an-section">';
                    html += '<div class="rnd-an-section-head"><span class="an-icon">🚫</span> Unavailable</div>';
                    html += '<div class="rnd-an-unavail">';
                    html += '<div class="rnd-an-unavail-side">';
                    if (hOut.length) hOut.forEach(p => { html += `<div class="rnd-an-unavail-player">✕ ${p.name}</div>`; });
                    else html += '<div class="rnd-an-unavail-none">Full squad available</div>';
                    html += '</div>';
                    html += '<div class="rnd-an-unavail-side away">';
                    if (aOut.length) aOut.forEach(p => { html += `<div class="rnd-an-unavail-player">✕ ${p.name}</div>`; });
                    else html += '<div class="rnd-an-unavail-none">Full squad available</div>';
                    html += '</div>';
                    html += '</div></div>';
                }

                // ── 7. PREDICTION ──
                html += '<div class="rnd-an-section">';
                html += '<div class="rnd-an-section-head"><span class="an-icon">🔮</span> Match Prediction</div>';
                html += '<div class="rnd-an-prediction">';

                // Weighted prediction: 50% R5, 30% form, 20% home advantage
                const hR5Score = hStarterR5;
                const aR5Score = aStarterR5;
                const r5Diff = hR5Score - aR5Score; // positive = home stronger

                // Form score (points / max possible)
                const hFormScore = homeForm.dots.length ? homeForm.pts / (homeForm.dots.length * 3) : 0.5;
                const aFormScore = awayForm.dots.length ? awayForm.pts / (awayForm.dots.length * 3) : 0.5;

                // Composite strength (0-1 scale)
                const homeAdv = window.TmConst.GAMEPLAY.HOME_ADVANTAGE;
                const r5Weight = 0.70;
                const formWeight = 0.15;
                const haWeight = 0.15;

                // Normalize R5 to 0-1 (range 40-120)
                const r5Norm = (v) => Math.max(0, Math.min(1, (v - 40) / 80));
                const hStrength = r5Norm(hR5Score) * r5Weight + hFormScore * formWeight + (0.5 + homeAdv) * haWeight;
                const aStrength = r5Norm(aR5Score) * r5Weight + aFormScore * formWeight + (0.5 - homeAdv) * haWeight;

                // Convert to win/draw/loss probabilities
                const diff = hStrength - aStrength;
                const drawBase = 0.24; // Base draw probability
                const drawProb = Math.max(0.08, drawBase - Math.abs(diff) * 0.6);
                const remaining = 1 - drawProb;
                const sigmoid = (x) => 1 / (1 + Math.exp(-x * 12));
                const hWinRaw = sigmoid(diff);
                let hWin = Math.round(hWinRaw * remaining * 100);
                let draw = Math.round(drawProb * 100);
                let aWin = 100 - hWin - draw;
                if (aWin < 0) { aWin = 0; hWin = 100 - draw; }

                html += '<div class="rnd-an-pred-teams">';
                html += '<div class="rnd-an-pred-side">';
                html += `<img class="rnd-an-pred-logo" src="/pics/club_logos/${homeId}_140.png" onerror="this.style.display='none'">`;
                html += `<div class="rnd-an-pred-name">${homeName}</div>`;
                html += `<div class="rnd-an-pred-pct home">${hWin}%</div>`;
                html += '<div class="rnd-an-pred-label">Win</div>';
                html += '</div>';
                html += '<div class="rnd-an-pred-draw">';
                html += `<div class="rnd-an-pred-pct draw">${draw}%</div>`;
                html += '<div class="rnd-an-pred-label">Draw</div>';
                html += '</div>';
                html += '<div class="rnd-an-pred-side">';
                html += `<img class="rnd-an-pred-logo" src="/pics/club_logos/${awayId}_140.png" onerror="this.style.display='none'">`;
                html += `<div class="rnd-an-pred-name">${awayName}</div>`;
                html += `<div class="rnd-an-pred-pct away">${aWin}%</div>`;
                html += '<div class="rnd-an-pred-label">Win</div>';
                html += '</div>';
                html += '</div>';
                html += '<div class="rnd-an-pred-bar-wrap">';
                html += `<div class="rnd-an-pred-seg home" style="width:${hWin}%"></div>`;
                html += `<div class="rnd-an-pred-seg draw" style="width:${draw}%"></div>`;
                html += `<div class="rnd-an-pred-seg away" style="width:${aWin}%"></div>`;
                html += '</div>';
                html += '</div></div>';

                html += '</div>'; // wrap
                body.html(html);
            });
        }
    };
})();



// ─── components/match/tm-match-lineups.js ───────────────────

(function () {
    'use strict';

    const _showPlayerDialog = (playerId, mData, curMin, curEvtIdx, opts) => {
        const { getLiveState, buildPlayerNames, buildReportEventHtml, isEventVisible,
            isMatchFuture,
            fetchTooltip, getColor, REC_THRESHOLDS } = opts;
        const liveState = getLiveState();
        // Remove any existing dialog
        $('.rnd-plr-overlay').remove();

        const pid = String(playerId);
        const homeId = mData.club.home.id;
        const isHome = !!mData.lineup.home[pid];
        const lineup = isHome ? mData.lineup.home : mData.lineup.away;
        const p = lineup[pid];
        if (!p) return;

        const clubColor = '#' + ((isHome ? mData.club.home : mData.club.away).colors?.club_color1 || '4a9030');
        const clubName = (isHome ? mData.club.home : mData.club.away).club_name || '';

        // Face URL
        const u = p.udseende2 || {};
        const clrHex = clubColor.replace('#', '');
        const fUrl = `https://trophymanager.com/pics/player_pic2.php?face=${u.face || 1}&nose=${u.nose || 1}&eyes=${u.eyes || 1}&ears=${u.ears || 1}&mouth=${u.mouth || 1}&brows=${u.brows || 1}&hcolor=${u.hair_color || 1}&scolor=${u.skin_color || 1}&hair=${u.hair || 1}&age=${p.age || 25}&rgb=${clrHex}&w=96`;

        const ratClr = window.TmUtils.ratingColor;

        // Player names map for accordion rendering
        const playerNames = buildPlayerNames(mData);

        // ── Compute player stats from video segments ──
        const report = mData.report || {};
        const pStats = window.TmMatchUtils.buildPlayerEventStats(report, {
            isEventVisible, upToMin: curMin, upToEvtIdx: curEvtIdx,
            pidFilter: pid, recordEvents: true,
        });
        const st = pStats[pid] || {};
        const isGK = p.position === 'gk';
        const playerEvents = st.events || [];
        const sortedMins = Object.keys(report).map(Number).sort((a, b) => a - b);

        // ── Minutes played ──
        const isSub = p.position.includes('sub');
        let minsPlayed;
        const subEvts = {};
        for (const min of sortedMins) {
            (report[String(min)] || []).forEach(evt => {
                if (!evt.parameters) return;
                evt.parameters.forEach(param => {
                    if (param.sub) {
                        if (String(param.sub.player_in) === pid) subEvts.subInMin = min;
                        if (String(param.sub.player_out) === pid) subEvts.subOutMin = min;
                    }
                });
            });
        }
        const matchEndMin = mData.match_data?.regular_last_min || Math.max(...sortedMins, 90);
        if (isSub) {
            minsPlayed = subEvts.subInMin ? (subEvts.subOutMin || matchEndMin) - subEvts.subInMin : 0;
        } else {
            minsPlayed = subEvts.subOutMin || matchEndMin;
        }

        // ── Position display ──
        const posDisplay = isSub ? (p.fp || '').split(',')[0].toUpperCase() : p.position.toUpperCase();

        // ── Build HTML ──
        const ACTION_LABELS = { pass_ok: 'pass ✓', pass_fail: 'pass ✗', cross_ok: 'cross ✓', cross_fail: 'cross ✗', shot: 'shot', save: 'save', goal: 'goal', assist: 'assist', duel_won: 'duel ✓', duel_lost: 'duel ✗', intercept: 'INT', tackle: 'TKL', header_clear: 'HC', tackle_fail: 'TF', foul: 'foul', yellow: '🟨', red: '🟥' };
        const ACTION_CLS = { pass_ok: 'shot', pass_fail: 'lost', cross_ok: 'shot', cross_fail: 'lost', shot: 'shot', save: 'shot', goal: 'goal', assist: 'goal', duel_won: 'shot', duel_lost: 'lost', intercept: 'shot', tackle: 'shot', header_clear: 'shot', tackle_fail: 'lost', foul: 'lost', yellow: 'lost', red: 'lost' };

        const playerUrl = `https://trophymanager.com/players/${pid}/#/page/history/`;
        const matchFuture = isMatchFuture(mData);
        const matchEnded = !matchFuture && (!liveState || liveState.ended);

        let html = '<div class="rnd-plr-overlay"><div class="rnd-plr-dialog" style="position:relative">';
        html += '<button class="rnd-plr-close">&times;</button>';

        // Header: face + info + R5 (loaded async)
        html += '<div class="rnd-plr-header">';
        html += `<div class="rnd-plr-face"><img src="${fUrl}" alt="${p.no}"></div>`;
        html += '<div class="rnd-plr-info">';
        html += '<div class="rnd-plr-name-row">';
        html += `<a class="rnd-plr-name" href="${playerUrl}" target="_blank">${p.name || p.nameLast || ''}</a>`;
        html += `<a class="rnd-plr-link" href="${playerUrl}" target="_blank" title="Open player profile">&#x1F517;</a>`;
        html += '</div>';
        html += '<div class="rnd-plr-badges">';
        html += `<span class="rnd-plr-badge"><span class="badge-icon">👕</span> #${p.no}</span>`;
        html += `<span class="rnd-plr-badge"><span class="badge-icon">📍</span> ${posDisplay}</span>`;
        html += `<span class="rnd-plr-badge" id="rnd-plr-age-badge-${pid}"><span class="badge-icon">🎂</span> ${p.age || '?'}</span>`;
        if (matchEnded) html += `<span class="rnd-plr-badge"><span class="badge-icon">⏱️</span> ${minsPlayed}'</span>`;
        html += '</div></div>';
        if (matchEnded && p.rating) {
            const rVal = Number(p.rating).toFixed(2);
            html += '<div class="rnd-plr-rating-wrap">';
            html += `<div class="rnd-plr-rating-big" style="color:${ratClr(p.rating)}">${rVal}</div>`;
            html += '<div class="rnd-plr-rating-label">Rating</div>';
            html += '</div>';
        }
        html += '</div>';

        // Body: profile + stats + chances
        html += '<div class="rnd-plr-body">';

        // ── Player Profile (skills, ASI, R5, REC, Routine) — loaded async ──
        html += '<div class="rnd-plr-section-title"><span class="sec-icon">🧑</span> Player Profile</div>';
        html += `<div class="rnd-plr-profile-wrap" id="rnd-plr-profile-${pid}">${TmUI.loading('Loading player data…')}</div>`;

        // ── Match Stats (hidden for future matches) ──
        if (!matchFuture) {
            // ── Shooting ──
            html += '<div class="rnd-plr-section-title"><span class="sec-icon">🎯</span> Shooting</div>';
            html += '<div class="rnd-plr-stats-row">';
            if (isGK) {
                [{ icon: '🧤', lbl: 'Saves', val: st.sv, cls: st.sv > 0 ? 'green' : '' },
                { icon: '⚽', lbl: 'Goals', val: st.g, cls: st.g > 0 ? 'gold' : '' },
                { icon: '👟', lbl: 'Assists', val: st.a, cls: st.a > 0 ? 'gold' : '' },
                { icon: '🔑', lbl: 'Key Pass', val: st.kp, cls: st.kp > 0 ? '' : '' },
                { icon: '🎯', lbl: 'Shots', val: st.sh, cls: '' },
                ].forEach(s => {
                    html += `<div class="rnd-plr-stat-card ${s.cls}"><div class="rnd-plr-stat-icon">${s.icon}</div><div class="rnd-plr-stat-val">${s.val}</div><div class="rnd-plr-stat-lbl">${s.lbl}</div></div>`;
                });
            } else {
                [{ icon: '⚽', lbl: 'Goals', val: st.g, cls: st.g > 0 ? 'gold' : '' },
                { icon: '🎯', lbl: 'Shots', val: st.sh, cls: '' },
                { icon: '✅', lbl: 'On Target', val: st.sot, cls: st.sot > 0 ? 'green' : '' },
                { icon: '🦶', lbl: 'Foot G', val: st.gf, cls: st.gf > 0 ? 'gold' : '' },
                { icon: '🗣️', lbl: 'Head G', val: st.gh, cls: st.gh > 0 ? 'gold' : '' },
                ].forEach(s => {
                    html += `<div class="rnd-plr-stat-card ${s.cls}"><div class="rnd-plr-stat-icon">${s.icon}</div><div class="rnd-plr-stat-val">${s.val}</div><div class="rnd-plr-stat-lbl">${s.lbl}</div></div>`;
                });
            }
            html += '</div>';

            // ── Passing & Creativity ──
            html += '<div class="rnd-plr-section-title"><span class="sec-icon">📊</span> Passing & Creativity</div>';
            html += '<div class="rnd-plr-stats-row">';
            const totalPasses = st.sp + st.up;
            const passAcc = totalPasses > 0 ? Math.round(st.sp / totalPasses * 100) : 0;
            const totalCross = st.sc + st.uc;
            const crossAcc = totalCross > 0 ? Math.round(st.sc / totalCross * 100) : 0;
            [{ icon: '👟', lbl: 'Assists', val: st.a, cls: st.a > 0 ? 'gold' : '' },
            { icon: '🔑', lbl: 'Key Pass', val: st.kp, cls: st.kp > 0 ? '' : '' },
            { icon: '📨', lbl: `Pass ${passAcc}%`, val: `${st.sp}/${totalPasses}`, cls: passAcc >= 70 ? 'green' : totalPasses > 0 ? 'red' : '' },
            { icon: '↗️', lbl: `Cross ${crossAcc}%`, val: `${st.sc}/${totalCross}`, cls: crossAcc >= 50 ? 'green' : totalCross > 0 ? 'red' : '' },
            { icon: '📈', lbl: 'Total', val: totalPasses + totalCross, cls: '' },
            ].forEach(s => {
                html += `<div class="rnd-plr-stat-card ${s.cls}"><div class="rnd-plr-stat-icon">${s.icon}</div><div class="rnd-plr-stat-val">${s.val}</div><div class="rnd-plr-stat-lbl">${s.lbl}</div></div>`;
            });
            html += '</div>';

            // ── Defending & Duels ──
            html += '<div class="rnd-plr-section-title"><span class="sec-icon">🛡️</span> Defending & Duels</div>';
            html += '<div class="rnd-plr-stats-row">';
            [{ icon: '👁️', lbl: 'INT', val: st.int, cls: st.int > 0 ? 'green' : '' },
            { icon: '🦵', lbl: 'TKL', val: st.tkl, cls: st.tkl > 0 ? 'green' : '' },
            { icon: '🗣️', lbl: 'HC', val: st.hc, cls: st.hc > 0 ? 'green' : '' },
            { icon: '❌', lbl: 'TF', val: st.tf, cls: st.tf > 0 ? 'red' : '' },
            { icon: '⚠️', lbl: 'Fouls', val: st.fouls, cls: st.fouls > 0 ? 'red' : '' },
            ].forEach(s => {
                html += `<div class="rnd-plr-stat-card ${s.cls}"><div class="rnd-plr-stat-icon">${s.icon}</div><div class="rnd-plr-stat-val">${s.val}</div><div class="rnd-plr-stat-lbl">${s.lbl}</div></div>`;
            });
            html += '</div>';

            // Chances list
            if (playerEvents.length) {
                html += '<div class="rnd-plr-section-title"><span class="sec-icon">⚡</span> Chances Involved (' + playerEvents.length + ')</div>';
                html += '<div class="rnd-adv-evt-list">';
                playerEvents.forEach(ev => {
                    const acls = ACTION_CLS[ev.action] || '';
                    const albl = ACTION_LABELS[ev.action] || '';
                    html += '<div class="rnd-adv-evt">';
                    if (albl) html += `<span class="adv-result-tag ${acls}">${albl}</span>`;
                    html += buildReportEventHtml(ev.evt, ev.min, ev.evtIdx, playerNames, homeId);
                    html += '</div>';
                });
                html += '</div>';
            } else {
                html += '<div style="text-align:center;padding:12px;color:#4a6a38;font-size:12px">No recorded chances</div>';
            }
        } // end !matchFuture

        html += '</div></div></div>';

        // Append to body
        const $overlay = $(html).appendTo('body');

        // Close handlers
        $overlay.find('.rnd-plr-close').on('click', () => $overlay.remove());
        $overlay.on('click', (e) => { if ($(e.target).hasClass('rnd-plr-overlay')) $overlay.remove(); });

        // Wire accordion for embedded events
        $overlay.on('click', '.rnd-acc-head', function (e) {
            e.stopPropagation();
            $(this).closest('.rnd-acc').toggleClass('open');
        });

        // ── Async: load player profile (skills, ASI, Routine) ──
        const profileEl = $overlay.find(`#rnd-plr-profile-${pid}`);
        const routineMap = new Map();
        const positionMap = new Map();
        // Populate from lineup data
        const allLineupForCard = { ...mData.lineup.home, ...mData.lineup.away };
        Object.entries(allLineupForCard).forEach(([id, lp]) => {
            routineMap.set(id, Number(lp.routine));
            if (!lp.position.includes('sub')) positionMap.set(id, lp.position);
        });

        fetchTooltip(pid).then(rawData => {
            if (!profileEl.length || !profileEl.closest('body').length) return;
            const player = JSON.parse(JSON.stringify(rawData.player));
            if (routineMap.has(pid)) player.routine = String(routineMap.get(pid));
            if (positionMap.has(pid)) player.favposition = positionMap.get(pid);

            const DBPlayer = window.TmPlayerDB.get(parseInt(player.player_id));
            window.TmApi.normalizePlayer(player, DBPlayer, { skipSync: true });
            const skills = player.skills.map(s => s.value);
            const isGKProfile = player.isGK;

            const GK_NAMES = window.TmConst.SKILL_NAMES_GK_SHORT;
            const FIELD_NAMES = window.TmConst.SKILL_LABELS_OUT;
            const skillNames = isGKProfile ? GK_NAMES : FIELD_NAMES;

            const r5 = player.r5;
            const rec = player.rec;

            const svc = window.TmUtils.skillColor;
            const fmtVal = (val) => {
                const { display, starCls } = window.TmUtils.formatSkill(val);
                const suffix = starCls === ' star-gold' ? ' rnd-plr-skill-star' : starCls === ' star-silver' ? ' rnd-plr-skill-star silver' : '';
                return { display, starCls: suffix };
            };

            // Build skills grid
            const leftIdx = isGKProfile ? [0, 1, 2] : [0, 1, 2, 3, 4, 5, 6];
            const rightIdx = isGKProfile ? [3, 4, 5, 6, 7, 8, 9, 10] : [7, 8, 9, 10, 11, 12, 13];

            let ph = '';
            // Country row
            if (player.country) {
                const flagUrl = `https://trophymanager.com/pics/flags/gradient/${player.country}.png`;
                const countryName = player.country_name || player.country || '';
                ph += `<div class="rnd-plr-country-row">`;
                ph += `<img class="rnd-plr-country-flag" src="${flagUrl}" onerror="this.style.display='none'">`;
                ph += `<span class="rnd-plr-country-name">${countryName}</span>`;
                ph += `</div>`;
            }

            ph += '<div class="rnd-plr-skills-grid">';
            // Left column
            ph += '<div>';
            leftIdx.forEach(i => {
                const val = typeof skills[i] === 'number' ? skills[i] : parseInt(skills[i]);
                const { display, starCls } = fmtVal(val);
                ph += `<div class="rnd-plr-skill-row">`;
                ph += `<span class="rnd-plr-skill-name">${skillNames[i] || ''}</span>`;
                ph += `<span class="rnd-plr-skill-val${starCls}" style="color:${svc(val)}">${display}</span>`;
                ph += '</div>';
            });
            ph += '</div>';
            // Right column
            ph += '<div>';
            rightIdx.forEach(i => {
                const val = typeof skills[i] === 'number' ? skills[i] : parseInt(skills[i]);
                const { display, starCls } = fmtVal(val);
                ph += `<div class="rnd-plr-skill-row">`;
                ph += `<span class="rnd-plr-skill-name">${skillNames[i] || ''}</span>`;
                ph += `<span class="rnd-plr-skill-val${starCls}" style="color:${svc(val)}">${display}</span>`;
                ph += '</div>';
            });
            ph += '</div>';
            ph += '</div>';

            // Footer: ASI, R5, REC, Routine
            ph += '<div class="rnd-plr-profile-footer">';
            ph += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:#e0f0cc">${player.asi.toLocaleString()}</div><div class="rnd-plr-profile-stat-lbl">ASI</div></div>`;
            ph += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:${getColor(r5, R5_THRESHOLDS)}">${r5}</div><div class="rnd-plr-profile-stat-lbl">R5</div></div>`;
            ph += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:${getColor(rec, REC_THRESHOLDS)}">${rec}</div><div class="rnd-plr-profile-stat-lbl">REC</div></div>`;
            ph += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:#8abc78">${parseFloat(player.routine).toFixed(1)}</div><div class="rnd-plr-profile-stat-lbl">Routine</div></div>`;
            ph += '</div>';

            profileEl.html(ph);

            // Update age badge with months
            const ageBadge = $(`#rnd-plr-age-badge-${pid}`);
            if (ageBadge.length) {
                const ageMonths = Number(player.months || 0);
                const ageYears = Number(player.age || 0);
                const ageDisplay = ageMonths ? `${ageYears}.${ageMonths}` : String(ageYears || '?');
                ageBadge.html(`<span class="badge-icon">🎂</span> ${ageDisplay}`);
            }
        }).catch(() => {
            profileEl.html(TmUI.error('Failed to load profile'));
        });
    };

    window.TmMatchLineups = {
        render(body, mData, curMin = 999, curEvtIdx = 999, opts) {
            const { getLiveState, getUnityState, isMatchPage, moveUnityCanvas, saveUnityCanvas,
                updateUnityStats, computeActiveRoster, isMatchFuture, isEventVisible,
                getPlayerData, fetchTooltip,
                getColor, REC_THRESHOLDS } = opts;
            const liveState = getLiveState();
            const unityState = getUnityState ? getUnityState() : null;
            const matchFuture = isMatchFuture(mData);
            const matchEnded = !matchFuture && (!liveState || liveState.ended);
            const homeColor = '#' + (mData.club.home.colors?.club_color1 || '4a9030');
            const awayColor = '#' + (mData.club.away.colors?.club_color1 || '5b9bff');
            const homeId = mData.club.home.id;
            const awayId = mData.club.away.id;

            // Split starters and subs
            const splitLineup = (lineup) => {
                const starters = [], subs = [];
                Object.values(lineup).forEach(p => {
                    if (p.position.includes('sub')) subs.push(p); else starters.push(p);
                });
                // Sort starters by position order
                const posOrder = { gk: 0, dl: 1, dcl: 2, dc: 3, dcr: 4, dr: 5, dml: 6, dmcl: 7, dmc: 8, dmcr: 9, dmr: 10, ml: 11, mcl: 12, mc: 13, mcr: 14, mr: 15, oml: 16, omcl: 17, omc: 18, omcr: 19, omr: 20, fcl: 21, fc: 22, fcr: 23 };
                starters.sort((a, b) => (posOrder[a.position] ?? 99) - (posOrder[b.position] ?? 99));
                subs.sort((a, b) => Number(a.position.replace('sub', '')) - Number(b.position.replace('sub', '')));
                return { starters, subs };
            };

            const home = splitLineup(mData.lineup.home);
            const away = splitLineup(mData.lineup.away);

            // Build event stats per player from report (filtered by current step)
            const pEvents = {};  // player_id → { goals, assists, yellows, reds, subIn, subOut, injured }
            const initPE = () => ({ goals: 0, assists: 0, yellows: 0, reds: 0, subIn: false, subOut: false, injured: false });
            const report = mData.report || {};
            if (!matchFuture) Object.keys(report).forEach(minKey => {
                const eMin = Number(minKey);
                report[minKey].forEach((evt, si) => {
                    if (!isEventVisible(eMin, si, curMin, curEvtIdx)) return;
                    if (!evt.parameters) return;
                    evt.parameters.forEach(param => {
                        if (param.goal) {
                            const pid = String(param.goal.player);
                            if (!pEvents[pid]) pEvents[pid] = initPE();
                            pEvents[pid].goals++;
                            if (param.goal.assist) {
                                const aid = String(param.goal.assist);
                                if (!pEvents[aid]) pEvents[aid] = initPE();
                                pEvents[aid].assists++;
                            }
                        }
                        if (param.yellow) {
                            const pid = String(param.yellow);
                            if (!pEvents[pid]) pEvents[pid] = initPE();
                            pEvents[pid].yellows++;
                        }
                        if (param.yellow_red) {
                            const pid = String(param.yellow_red);
                            if (!pEvents[pid]) pEvents[pid] = initPE();
                            pEvents[pid].reds++; pEvents[pid].yellows++;
                        }
                        if (param.red) {
                            const pid = String(param.red);
                            if (!pEvents[pid]) pEvents[pid] = initPE();
                            pEvents[pid].reds++;
                        }
                        if (param.injury) {
                            const pid = String(param.injury);
                            if (!pEvents[pid]) pEvents[pid] = initPE();
                            pEvents[pid].injured = true;
                        }
                        if (param.sub) {
                            const inId = String(param.sub.player_in);
                            const outId = String(param.sub.player_out);
                            if (!pEvents[inId]) pEvents[inId] = initPE();
                            if (!pEvents[outId]) pEvents[outId] = initPE();
                            pEvents[inId].subIn = true;
                            pEvents[outId].subOut = true;
                        }
                    });
                });
            });

            // Build event icons string for a player
            const eventIcons = (pid) => {
                const e = pEvents[String(pid)];
                if (!e) return '';
                let s = '';
                if (e.goals) s += (e.goals > 1 ? e.goals + '×' : '') + '⚽';
                if (e.assists) s += (e.assists > 1 ? e.assists + '×' : '') + '👟';
                if (e.yellows) s += (e.yellows > 1 ? e.yellows + '×' : '') + '🟨';
                if (e.reds) s += (e.reds > 1 ? e.reds + '×' : '') + '🟥';
                if (e.injured) s += '<span style="color:#ff3c3c;font-size:13px;font-weight:800">✚</span>';
                if (e.subIn) s += '🔼';
                if (e.subOut) s += '🔽';
                return s;
            };

            // Format name: "M. Radic" from "V. Tutić" or nameLast="Tutić", name="V. Tutić"
            const fmtName = (p) => {
                const full = p.name || '';
                const last = p.nameLast || '';
                if (last && full) {
                    const firstChar = full.charAt(0);
                    return `${firstChar}. ${last}`;
                }
                return last || full;
            };

            // Match rating color (1-10 scale, 5.0 = cutoff between red and green)
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
            const r5Color = (v) => {
                if (!v) return '#5a7a48';
                // Below 95: piecewise HSL tiers
                // 95-120: explicit per-integer colors for max visual differentiation
                const hsl2rgb = (h, s, l) => {
                    s /= 100; l /= 100;
                    const c = (1 - Math.abs(2 * l - 1)) * s;
                    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
                    const m = l - c / 2;
                    let r, g, b;
                    if (h < 60) { r = c; g = x; b = 0; }
                    else if (h < 120) { r = x; g = c; b = 0; }
                    else { r = 0; g = c; b = x; }
                    return '#' + [r + m, g + m, b + m].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
                };
                // Explicit lookup for 95-120 — each integer has a unique, distinguishable color
                const topColors = {
                    95: '#8db024', // olive-yellow-green
                    96: '#7aad22', // yellow-green
                    97: '#68a820', // limey green
                    98: '#57a31e', // lime green
                    99: '#479e1c', // green-lime
                    100: '#38991a', // medium green
                    101: '#2e9418', // green
                    102: '#258e16', // rich green
                    103: '#1d8814', // deeper green
                    104: '#168212', // forest green
                    105: '#107c10', // vivid forest
                    106: '#0c720e', // dark vivid green
                    107: '#09680c', // dark green
                    108: '#075e0a', // darker green
                    109: '#055408', // very dark green
                    110: '#044a07', // deep emerald
                    111: '#034106', // deepest green
                    112: '#033905', // near-black green
                    113: '#023204', //
                    114: '#022c04', //
                    115: '#022603', // almost black-green
                    116: '#012103', //
                    117: '#011d02', //
                    118: '#011902', // darkest
                };
                const rounded = Math.round(v);
                if (rounded >= 95) return topColors[Math.min(118, rounded)] || topColors[118];
                // Below 95: HSL tiers
                const tiers = [
                    [25, 50, 0, 10, 65, 68, 28, 32],
                    [50, 70, 10, 25, 68, 72, 34, 40],
                    [70, 80, 25, 42, 72, 75, 42, 46],
                    [80, 90, 42, 58, 75, 78, 46, 48],
                    [90, 95, 58, 78, 78, 80, 48, 46],
                ];
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
                return hsl2rgb(hue, sat, lit);
            };

            // Captain IDs from match_data
            const captains = mData.match_data.captain || {};
            const homeCaptainId = String(captains.home || '');
            const awayCaptainId = String(captains.away || '');

            const renderList = (team, color, side) => {
                const captainId = side === 'home' ? homeCaptainId : awayCaptainId;
                let h = '';
                team.starters.forEach(p => {
                    const pid = String(p.player_id);
                    const evts = eventIcons(p.player_id);
                    const isCaptain = pid === captainId;
                    const isMom = matchEnded && Number(p.mom) === 1;
                    h += `<div class="rnd-lu-player rnd-lu-clickable" data-pid="${pid}">`;
                    h += `<div class="rnd-lu-no" style="background:${color};color:#fff">${p.no}</div>`;
                    h += `<span class="rnd-lu-name">${fmtName(p)}`;
                    if (isCaptain) h += ` <span class="rnd-lu-captain" title="Captain">©</span>`;
                    if (isMom) h += ` <span class="rnd-lu-mom" title="Man of the Match">⭐</span>`;
                    h += `</span>`;
                    if (evts) h += `<span class="rnd-lu-events">${evts}</span>`;
                    h += `<span class="rnd-lu-pos">${p.position.toUpperCase()}</span>`;
                    if (matchEnded) {
                        const rFmt = p.rating ? Number(p.rating).toFixed(2) : '-';
                        h += `<span class="rnd-lu-rating" style="color:${ratingColor(p.rating)}">${rFmt}</span>`;
                    }
                    h += `<span class="rnd-lu-r5" data-pid="${p.player_id}">···</span>`;
                    h += `</div>`;
                });
                h += `<div class="rnd-lu-sub-header">Substitutes</div>`;
                team.subs.forEach(p => {
                    const pid = String(p.player_id);
                    const evts = eventIcons(p.player_id);
                    const isCaptain = pid === captainId;
                    const isMom = matchEnded && Number(p.mom) === 1;
                    h += `<div class="rnd-lu-player rnd-lu-clickable" data-pid="${pid}">`;
                    h += `<div class="rnd-lu-no" style="background:${color};color:#fff;opacity:0.6">${p.no}</div>`;
                    h += `<span class="rnd-lu-name" style="color:#7a9a68">${fmtName(p)}`;
                    if (isCaptain) h += ` <span class="rnd-lu-captain" title="Captain">©</span>`;
                    if (isMom) h += ` <span class="rnd-lu-mom" title="Man of the Match">⭐</span>`;
                    h += `</span>`;
                    if (evts) h += `<span class="rnd-lu-events">${evts}</span>`;
                    h += `<span class="rnd-lu-pos">${(p.fp || '').split(',')[0].toUpperCase()}</span>`;
                    if (matchEnded) {
                        const rFmtS = p.rating ? Number(p.rating).toFixed(2) : '-';
                        h += `<span class="rnd-lu-rating" style="color:${ratingColor(p.rating)}">${rFmtS}</span>`;
                    }
                    h += `<span class="rnd-lu-r5" data-pid="${p.player_id}">···</span>`;
                    h += `</div>`;
                });
                return h;
            };

            // ── Position → grid cell [row, col] (1-based) ──
            // Grid: 12 columns (home GK=1 ... away GK=12), 5 rows (L=1, CL=2, C=3, CR=4, R=5)
            // Home cols: GK=1, D=2, DM=3, M=4, OM=5, FC=6
            // Away cols: FC=7, OM=8, M=9, DM=10, D=11, GK=12
            // Rows: L=1, CL=2, C=3, CR=4, R=5  (for home DL is bottom=row5, DR is top=row1)
            const homePosMap = {
                gk: [3, 1],
                dl: [1, 2], dcl: [2, 2], dc: [3, 2], dcr: [4, 2], dr: [5, 2],
                dml: [1, 3], dmcl: [2, 3], dmc: [3, 3], dmcr: [4, 3], dmr: [5, 3],
                ml: [1, 4], mcl: [2, 4], mc: [3, 4], mcr: [4, 4], mr: [5, 4],
                oml: [1, 5], omcl: [2, 5], omc: [3, 5], omcr: [4, 5], omr: [5, 5],
                fcl: [2, 6], fc: [3, 6], fcr: [4, 6]
            };
            const awayPosMap = {
                gk: [3, 12],
                dl: [5, 11], dcl: [4, 11], dc: [3, 11], dcr: [2, 11], dr: [1, 11],
                dml: [5, 10], dmcl: [4, 10], dmc: [3, 10], dmcr: [2, 10], dmr: [1, 10],
                ml: [5, 9], mcl: [4, 9], mc: [3, 9], mcr: [2, 9], mr: [1, 9],
                oml: [5, 8], omcl: [4, 8], omc: [3, 8], omcr: [2, 8], omr: [1, 8],
                fcl: [4, 7], fc: [3, 7], fcr: [2, 7]
            };

            // SVG pitch markings (horizontal: 150 wide x 100 tall, ratio 3:2 matches container)
            const lw = 0.4, clr = 'rgba(255,255,255,0.22)', clr2 = 'rgba(255,255,255,0.3)';
            const pitchSVG = `<svg class="rnd-pitch-lines" viewBox="0 0 150 100" preserveAspectRatio="xMidYMid meet">
            <!-- outer boundary -->
            <rect x="0" y="0" width="150" height="100" fill="none" stroke="${clr}" stroke-width="0.5"/>
            <!-- halfway line -->
            <line x1="75" y1="0" x2="75" y2="100" stroke="${clr}" stroke-width="${lw}"/>
            <!-- center circle & spot -->
            <circle cx="75" cy="50" r="13" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <circle cx="75" cy="50" r="1.2" fill="${clr2}"/>
            <!-- LEFT penalty area (24 deep, 60 wide centered) -->
            <rect x="0" y="20" width="24" height="60" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- LEFT goal area (8 deep, 28 wide centered) -->
            <rect x="0" y="36" width="8" height="28" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- LEFT penalty spot -->
            <circle cx="16" cy="50" r="1.2" fill="${clr2}"/>
            <!-- LEFT penalty arc (D) -->
            <path d="M 24 39.75 A 13 13 0 0 1 24 60.25" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- RIGHT penalty area -->
            <rect x="126" y="20" width="24" height="60" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- RIGHT goal area -->
            <rect x="142" y="36" width="8" height="28" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- RIGHT penalty spot -->
            <circle cx="134" cy="50" r="1.2" fill="${clr2}"/>
            <!-- RIGHT penalty arc (D) -->
            <path d="M 126 39.75 A 13 13 0 0 0 126 60.25" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- corner arcs -->
            <path d="M 0 1.5 A 1.5 1.5 0 0 1 1.5 0" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 0 98.5 A 1.5 1.5 0 0 0 1.5 100" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 148.5 0 A 1.5 1.5 0 0 1 150 1.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 150 98.5 A 1.5 1.5 0 0 0 148.5 100" fill="none" stroke="${clr}" stroke-width="${lw}"/>
        </svg>`;

            // Build face image URL from udseende2 data
            const faceUrl = (p, clubColor) => {
                const u = p.udseende2 || {};
                const clrHex = clubColor.replace('#', '');
                return `https://trophymanager.com/pics/player_pic2.php?face=${u.face || 1}&nose=${u.nose || 1}&eyes=${u.eyes || 1}&ears=${u.ears || 1}&mouth=${u.mouth || 1}&brows=${u.brows || 1}&hcolor=${u.hair_color || 1}&scolor=${u.skin_color || 1}&hair=${u.hair || 1}&age=${p.age || 25}&rgb=${clrHex}&w=96`;
            };
            const faceNode = (p, clubColor) => {
                const url = faceUrl(p, clubColor);
                return `<div class="rnd-pitch-face" style="border:2.5px solid ${clubColor}">`
                    + `<img src="${url}" alt="${p.no}"></div>`;
            };

            // Build grid cells: 5 rows × 12 cols = 60 cells
            // Use active roster (subs in, reds out) for pitch placement
            const roster = computeActiveRoster(mData, curMin, curEvtIdx);
            const allLineup = { ...mData.lineup.home, ...mData.lineup.away };

            const cellMap = {};  // "row-col" → html
            const cellPidMap = {};  // "row-col" → player id
            const placeNode = (pid, posMap, color, overridePos) => {
                const p = allLineup[pid];
                if (!p) return;
                const posKey = overridePos || p.position;
                const pos = posMap[posKey];
                if (!pos) return;
                const [row, col] = pos;
                const key = `${row}-${col}`;
                const evts = eventIcons(p.player_id);
                const rFmt = (matchEnded && p.rating) ? Number(p.rating).toFixed(1) : '';
                const isCaptain = String(p.player_id) === homeCaptainId || String(p.player_id) === awayCaptainId;
                const isMom = matchEnded && Number(p.mom) === 1;
                cellPidMap[key] = pid;
                let h = faceNode(p, color);
                // Captain armband indicator on face
                if (isCaptain) h += `<div class="rnd-pitch-captain">C</div>`;
                // MOM star on face
                if (isMom) h += `<div class="rnd-pitch-mom">⭐</div>`;
                h += `<div class="rnd-pitch-info">`;
                h += `<div class="rnd-pitch-label">${p.nameLast || fmtName(p)}</div>`;
                if (rFmt) h += `<div class="rnd-pitch-rating" style="color:${ratingColor(p.rating)}">${rFmt}</div>`;
                if (evts) h += `<div class="rnd-pitch-events">${evts}</div>`;
                h += `</div>`;
                cellMap[key] = h;
            };
            roster.homeActive.forEach(pid => {
                const overridePos = roster.subbedPositions.get(pid);
                placeNode(pid, homePosMap, homeColor, overridePos);
            });
            roster.awayActive.forEach(pid => {
                const overridePos = roster.subbedPositions.get(pid);
                placeNode(pid, awayPosMap, awayColor, overridePos);
            });

            // Build grid HTML
            let gridHTML = '';
            for (let r = 1; r <= 5; r++) {
                for (let c = 1; c <= 12; c++) {
                    const key = `${r}-${c}`;
                    const pidAttr = cellPidMap[key] ? ` data-pid="${cellPidMap[key]}"` : '';
                    gridHTML += `<div class="rnd-pitch-cell"${pidAttr}>${cellMap[key] || ''}</div>`;
                }
            }

            let html = '';

            // ── Build per-side tactics HTML ──
            const md = mData.match_data;
            const mentalityMap = { 1: 'Very Defensive', 2: 'Defensive', 3: 'Slightly Defensive', 4: 'Normal', 5: 'Slightly Attacking', 6: 'Attacking', 7: 'Very Attacking' };
            const styleMap = { 1: 'Balanced', 2: 'Direct', 3: 'Wings', 4: 'Short Passing', 5: 'Long Balls', 6: 'Through Balls' };
            const focusMap = { 1: 'Balanced', 2: 'Left', 3: 'Central', 4: 'Right' };
            const focusIcons = { Balanced: '⚖️', Left: '⬅️', Central: '⬆️', Right: '➡️' };

            // Compute live mentality (apply mentality_change events up to current minute)
            const homeClubId = String(mData.club.home.id);
            const awayClubId = String(mData.club.away.id);

            const liveMentality = {
                home: Number(md.mentality ? md.mentality.home : 4),
                away: Number(md.mentality ? md.mentality.away : 4)
            };
            {
                const rpt = mData.report || {};
                Object.keys(rpt).forEach(minKey => {
                    const eMin = Number(minKey);
                    (rpt[minKey] || []).forEach((evt, si) => {
                        if (!isEventVisible(eMin, si, curMin, curEvtIdx)) return;
                        if (!evt.parameters) return;
                        evt.parameters.forEach(param => {
                            if (param.mentality_change) {
                                const mc = param.mentality_change;
                                const teamId = String(mc.team);
                                if (teamId === homeClubId) liveMentality.home = Number(mc.mentality);
                                else if (teamId === awayClubId) liveMentality.away = Number(mc.mentality);
                            }
                        });
                    });
                });
            }
            const buildTactics = (side) => {
                const future = isMatchFuture(mData);
                let t = '<div class="rnd-tactics-section"><div class="rnd-tactics-grid">';
                // Avg R5 (filled async)
                t += `<div class="rnd-tactic-row r5-row" data-avg-r5="${side}">
                <span class="rnd-tactic-icon">⭐</span>
                <span class="rnd-tactic-label">Avg R5</span>
                <div class="rnd-tactic-meter"><div class="rnd-r5-side-meter-fill ${side}" style="width:0%"></div></div>
                <span class="rnd-r5-side-val" style="font-size:11px;font-weight:800;color:#e0f0cc;min-width:36px;text-align:right">···</span>
            </div>`;
                // Mentality (live)
                {
                    const lvl = liveMentality[side];
                    const val = mentalityMap[lvl] || lvl;
                    t += `<div class="rnd-tactic-row">
                    <span class="rnd-tactic-icon">⚔️</span>
                    <span class="rnd-tactic-label">Mentality</span>
                    <div class="rnd-tactic-meter"><div class="rnd-tactic-meter-fill ${side}" style="width:${Math.round(lvl / 7 * 100)}%"></div></div>
                    <span class="rnd-tactic-value">${val}</span>
                </div>`;
                }
                // Attacking Style
                if (md.attacking_style && md.attacking_style[side]) {
                    const sVal = styleMap[md.attacking_style[side]] || md.attacking_style[side];
                    t += `<div class="rnd-tactic-row">
                    <span class="rnd-tactic-icon">🎯</span>
                    <span class="rnd-tactic-label">Style</span>
                    <span class="rnd-tactic-value-pill ${side}">${sVal}</span>
                </div>`;
                }
                // Focus Side
                if (md.focus_side && md.focus_side[side]) {
                    const fVal = focusMap[md.focus_side[side]] || md.focus_side[side];
                    const fIcon = focusIcons[fVal] || '⬆️';
                    t += `<div class="rnd-tactic-row">
                    <span class="rnd-tactic-icon">◎</span>
                    <span class="rnd-tactic-label">Focus</span>
                    <span class="rnd-tactic-value-pill ${side}">${fIcon} ${fVal}</span>
                </div>`;
                }
                // Lineup Out (unavailable players) — prematch only
                if (future && md.lineup_out && md.lineup_out[side]) {
                    const outPlayers = Object.values(md.lineup_out[side]);
                    if (outPlayers.length) {
                        t += `<div class="rnd-tactic-row" style="margin-top:6px;border-top:1px solid rgba(80,160,48,.1);padding-top:6px">
                        <span class="rnd-tactic-icon">🚫</span>
                        <span class="rnd-tactic-label" style="color:#c86a4a">Unavailable</span>
                    </div>`;
                        outPlayers.forEach(op => {
                            t += `<div class="rnd-tactic-row">
                            <span class="rnd-tactic-icon" style="font-size:10px;color:#c86a4a">✕</span>
                            <span class="rnd-tactic-value" style="color:#c86a4a;font-size:11px">${op.name}</span>
                        </div>`;
                        });
                    }
                }
                t += '</div></div>';
                return t;
            };

            const isLive = liveState && !liveState.ended;
            // During live: if rnd-lu-wrap already exists, update ONLY the wrap content
            // This avoids destroying/recreating the Unity viewport (no blink)
            const existingWrap = body.find('.rnd-lu-wrap');
            if (isLive && existingWrap.length) {
                // Build only the wrap content (lists + pitch)
                let wrapHtml = '';
                wrapHtml += `<div class="rnd-lu-list">${renderList(home, homeColor, 'home')}${buildTactics('home')}</div>`;
                wrapHtml += `<div class="rnd-pitch-wrap">
              <div class="rnd-pitch">${pitchSVG}<div class="rnd-pitch-grid">${gridHTML}</div></div>
            </div>`;
                wrapHtml += `<div class="rnd-lu-list">${renderList(away, awayColor, 'away')}${buildTactics('away')}</div>`;
                existingWrap.html(wrapHtml);
            } else {
                // First render or match ended: full rebuild — save canvas first
                saveUnityCanvas();
                if (isLive) {
                    html += '<div class="rnd-lu-outer">';
                }
                // Unity viewport row: feed | viewport | stats (hide when match ended)
                if (isMatchPage && isLive) {
                    const noUnityClass = (!unityState || !unityState.available) ? ' rnd-no-unity' : '';
                    html += `<div class="rnd-unity-row${noUnityClass}">`;
                    html += '<div class="rnd-unity-feed" id="rnd-unity-feed"></div>';
                    html += '<div id="rnd-unity-viewport" class="rnd-unity-viewport" style="display:none;flex:1 1 auto;"></div>';
                    html += '<div class="rnd-unity-stats" id="rnd-unity-stats"></div>';
                    html += '</div>';
                }
                html += '<div class="rnd-lu-wrap">';
                html += `<div class="rnd-lu-list">${renderList(home, homeColor, 'home')}${buildTactics('home')}</div>`;
                html += `<div class="rnd-pitch-wrap">
              <div class="rnd-pitch">${pitchSVG}<div class="rnd-pitch-grid">${gridHTML}</div></div>
            </div>`;
                html += `<div class="rnd-lu-list">${renderList(away, awayColor, 'away')}${buildTactics('away')}</div>`;
                html += '</div>';
                if (isLive) html += '</div>';

                body.html(html);

                // Player card dialog click handler
                body.on('click', '.rnd-lu-clickable', function () {
                    const clickedPid = $(this).data('pid');
                    if (!clickedPid) return;
                    // Read live state at click time, not at render time
                    const _ls = getLiveState();
                    const cMin = _ls ? _ls.min : 999;
                    const cIdx = _ls ? _ls.curEvtIdx : 999;
                    const cParamIdx = (_ls && !_ls.ended && !_ls.curEvtComplete) ? cIdx - 1 : cIdx;
                    _showPlayerDialog(clickedPid, mData, cMin, cParamIdx, opts);
                });

                // Initialize stats panel with zeros
                updateUnityStats();

                // ── Pitch hover tooltip ──
                const GK_SKILL_NAMES = ['Str', 'Sta', 'Pac', 'Han', 'One', 'Ref', 'Aer', 'Jum', 'Com', 'Kic', 'Thr'];
                const FIELD_SKILL_NAMES = ['Str', 'Sta', 'Pac', 'Mar', 'Tac', 'Wor', 'Pos', 'Pas', 'Cro', 'Tec', 'Hea', 'Fin', 'Lon', 'Set'];
                let pitchTooltipEl = null;
                let pitchTooltipTimer = null;

                const removePitchTooltip = () => {
                    clearTimeout(pitchTooltipTimer);
                    if (pitchTooltipEl) { pitchTooltipEl.remove(); pitchTooltipEl = null; }
                };

                const skillValColor = window.TmUtils.skillColor;

                body.on('mouseenter', '.rnd-pitch-cell[data-pid], .rnd-lu-player[data-pid]', function (e) {
                    const cell = $(this);
                    const pid = String(cell.data('pid'));
                    removePitchTooltip();

                    // Create tooltip with loading state
                    pitchTooltipEl = $('<div class="rnd-pitch-tooltip"></div>').html(TmUI.loading('Loading…', true)).appendTo('body');
                    const tt = pitchTooltipEl;

                    // Position tooltip
                    const rect = this.getBoundingClientRect();
                    const ttLeft = rect.right + 8;
                    const ttTop = rect.top;
                    tt.css({ left: ttLeft + 'px', top: ttTop + 'px' });

                    // Show after brief delay
                    pitchTooltipTimer = setTimeout(() => {
                        tt.addClass('visible');
                    }, 80);

                    // Fetch player data
                    fetchTooltip(pid).then(rawData => {
                        if (!pitchTooltipEl || pitchTooltipEl !== tt) return; // tooltip was removed
                        const player = JSON.parse(JSON.stringify(rawData.player));
                        const lineupP = allLineup[pid];
                        if (routineMap.has(pid)) player.routine = String(routineMap.get(pid));
                        if (positionMap.has(pid)) player.favposition = positionMap.get(pid);

                        const DBPlayer = window.TmPlayerDB.get(parseInt(player.player_id));
                        window.TmApi.normalizePlayer(player, DBPlayer, { skipSync: true });
                        const skills = player.skills.map(s => s.value);
                        const isGK = player.isGK;
                        const skillNames = isGK ? GK_SKILL_NAMES : FIELD_SKILL_NAMES;

                        const r5 = player.r5;
                        const rec = player.rec;

                        let h = '<div class="rnd-pitch-tooltip-header">';
                        h += `<div><div class="rnd-pitch-tooltip-name">${player.name || lineupP?.name || ''}</div>`;
                        const ageYears = Number(player.age || lineupP?.age || 0);
                        const ageMonths = Number(player.months || 0);
                        const ageDisplay = ageMonths ? `${ageYears}.${ageMonths}` : String(ageYears || '?');
                        let infoLine = `${(lineupP?.position || '').toUpperCase()} · #${lineupP?.no || ''} · Age ${ageDisplay}`;
                        if (player.country) {
                            const flagUrl = `https://trophymanager.com/pics/flags/gradient/${player.country}.png`;
                            infoLine += ` · <img src="${flagUrl}" style="height:11px;vertical-align:-1px;margin:0 2px" onerror="this.style.display='none'">`;
                        }
                        h += `<div class="rnd-pitch-tooltip-pos">${infoLine}</div></div>`;
                        h += '<div class="rnd-pitch-tooltip-badges">';
                        h += `<span class="rnd-pitch-tooltip-badge" style="color:${r5Color(r5)}">R5 ${r5.toFixed(2)}</span>`;
                        h += '</div></div>';

                        // Skills two-column layout
                        const fieldLeft = [0, 1, 2, 3, 4, 5, 6];    // Str,Sta,Pac,Mar,Tac,Wor,Pos
                        const fieldRight = [7, 8, 9, 10, 11, 12, 13]; // Pas,Cro,Tec,Hea,Fin,Lon,Set
                        const gkLeft = [0, 1, 2];                   // Str,Sta,Pac
                        const gkRight = [3, 4, 5, 6, 7, 8, 9, 10];  // Han,One,Ref,Aer,Jum,Com,Kic,Thr
                        const leftIdx = isGK ? gkLeft : fieldLeft;
                        const rightIdx = isGK ? gkRight : fieldRight;

                        const renderCol = (indices) => {
                            let c = '<div class="rnd-pitch-tooltip-skills-col">';
                            indices.forEach(i => {
                                const val = typeof skills[i] === 'number' ? skills[i] : parseInt(skills[i]);
                                const display = window.TmUtils.formatSkill(val).display;
                                c += `<div class="rnd-pitch-tooltip-skill">`;
                                c += `<span class="rnd-pitch-tooltip-skill-name">${skillNames[i] || ''}</span>`;
                                c += `<span class="rnd-pitch-tooltip-skill-val" style="color:${skillValColor(val)}">${display}</span>`;
                                c += '</div>';
                            });
                            c += '</div>';
                            return c;
                        };
                        h += '<div class="rnd-pitch-tooltip-skills">';
                        h += renderCol(leftIdx);
                        h += renderCol(rightIdx);
                        h += '</div>';

                        // Footer: ASI, REC, Routine, Rating
                        h += '<div class="rnd-pitch-tooltip-footer">';
                        h += `<div class="rnd-pitch-tooltip-stat"><div class="rnd-pitch-tooltip-stat-val" style="color:#e0f0cc">${player.asi.toLocaleString()}</div><div class="rnd-pitch-tooltip-stat-lbl">ASI</div></div>`;
                        h += `<div class="rnd-pitch-tooltip-stat"><div class="rnd-pitch-tooltip-stat-val" style="color:${getColor(rec, REC_THRESHOLDS)}">${rec}</div><div class="rnd-pitch-tooltip-stat-lbl">REC</div></div>`;
                        h += `<div class="rnd-pitch-tooltip-stat"><div class="rnd-pitch-tooltip-stat-val" style="color:#8abc78">${parseFloat(player.routine).toFixed(1)}</div><div class="rnd-pitch-tooltip-stat-lbl">Routine</div></div>`;
                        h += '</div>';

                        tt.html(h);

                        // Reposition if off-screen
                        const ttRect = tt[0].getBoundingClientRect();
                        if (ttRect.right > window.innerWidth - 10) {
                            tt.css('left', (rect.left - ttRect.width - 8) + 'px');
                        }
                        if (ttRect.bottom > window.innerHeight - 10) {
                            tt.css('top', Math.max(10, window.innerHeight - ttRect.height - 10) + 'px');
                        }
                    }).catch(() => {
                        if (pitchTooltipEl === tt) {
                            tt.html(TmUI.empty('No data', true));
                        }
                    });
                });

                body.on('mouseleave', '.rnd-pitch-cell[data-pid], .rnd-lu-player[data-pid]', removePitchTooltip);

                // ── Unity: move canvas into viewport on match page ──
                if (isMatchPage && unityState.available) {
                    setTimeout(() => {
                        const vp = document.getElementById('rnd-unity-viewport');
                        if (vp) {
                            moveUnityCanvas();
                            vp.style.display = 'block';
                        }
                    }, 100);
                }
            }



            // Async: fetch R5 for all players
            const routineMap = new Map();
            const positionMap = new Map();
            const allPlayers = [...Object.values(mData.lineup.home), ...Object.values(mData.lineup.away)];
            allPlayers.forEach(p => {
                routineMap.set(p.player_id, parseFloat(p.routine));
                if (p.fp) positionMap.set(p.player_id, p.fp);
            });
            // Active roster IDs for avg R5 (based on current live minute — subs/reds applied)
            const homeActiveIds = roster.homeActive;
            const awayActiveIds = roster.awayActive;
            Promise.all(allPlayers.map(p =>
                getPlayerData(p.player_id, routineMap, positionMap)
                    .then(d => ({ id: p.player_id, r5: d.R5 }))
                    .catch(() => ({ id: p.player_id, r5: null }))
            )).then(results => {
                const homeR5s = [], awayR5s = [];
                results.forEach(({ id, r5 }) => {
                    const el = body.find(`.rnd-lu-r5[data-pid="${id}"]`);
                    if (el.length && r5 !== null) {
                        el.text(r5).css('background', r5Color(r5));
                    }
                    // Only currently active players count for avg R5
                    if (r5 !== null) {
                        if (homeActiveIds.has(String(id))) homeR5s.push(r5);
                        else if (awayActiveIds.has(String(id))) awayR5s.push(r5);
                    }
                });
                // Fill avg R5 bars (always /11 even if red card reduced count)
                const fillAvg = (side, vals) => {
                    if (!vals.length) return;
                    const avg = vals.reduce((a, b) => a + b, 0) / 11;
                    const pct = Math.min(100, Math.max(0, Math.round((avg - 40) / (120 - 40) * 100)));
                    const card = body.find(`[data-avg-r5="${side}"]`);
                    card.find('.rnd-r5-side-meter-fill').css('width', pct + '%');
                    card.find('.rnd-r5-side-val').text(avg.toFixed(2)).css('color', r5Color(avg));
                };
                fillAvg('home', homeR5s);
                fillAvg('away', awayR5s);
                // Update header R5 chips
                const headerR5 = (side, vals) => {
                    if (!vals.length) return;
                    const avg = vals.reduce((a, b) => a + b, 0) / 11;
                    $(`#rnd-chip-r5-${side} .chip-val`).text(avg.toFixed(2));
                };
                headerR5('home', homeR5s);
                headerR5('away', awayR5s);
            });
        },
        showPlayer(playerId, mData, curMin, curEvtIdx, opts) {
            _showPlayerDialog(playerId, mData, curMin, curEvtIdx, opts);
        }
    };
})();



// ─── components/match/tm-match-league.js ────────────────────

(function () {
    'use strict';

    let leagueTabCache = null;

    window.TmMatchLeague = {
        render(body, mData, curMin = 999, curEvtIdx = 999) {
        body.html('<div style="text-align:center;padding:20px;color:#5a7a48">⏳ Loading league data...</div>');

        const homeId = String(mData.club.home.id);
        const awayId = String(mData.club.away.id);
        const homeName = mData.club.home.club_name;
        const awayName = mData.club.away.club_name;

        // Extract league info from match_data.chatroom or club data
        // chatroom format varies: "cs" (country code for league matches)
        // We need country, division, group from the clubs
        const country = mData.club.home.country || mData.match_data?.chatroom || '';
        const division = mData.club.home.division || '1';
        const group = mData.club.home.group || '1';

        if (!country) {
            body.html('<div style="text-align:center;padding:20px;color:#ff6b6b">Cannot determine league info</div>');
            return;
        }

        const buildLeagueView = (fixtures) => {
            // Extract the date of the current match from kickoff_readable ("YYYY-MM-DD HH:MM")
            const koReadable = mData.match_data?.venue?.kickoff_readable || '';
            const matchDate = koReadable.split(' ')[0]; // "YYYY-MM-DD"

            // Collect all matches
            const allMatches = [];
            const clubNamesMap = {};
            Object.values(fixtures).forEach(month => {
                if (month?.matches) {
                    month.matches.forEach(m => {
                        allMatches.push(m);
                        if (m.hometeam_name) clubNamesMap[String(m.hometeam)] = m.hometeam_name;
                        if (m.awayteam_name) clubNamesMap[String(m.awayteam)] = m.awayteam_name;
                    });
                }
            });

            // Group by date → rounds
            const byDate = {};
            allMatches.forEach(m => {
                (byDate[m.date] = byDate[m.date] || []).push(m);
            });
            const sortedDates = Object.keys(byDate).sort((a, b) => new Date(a) - new Date(b));

            // Find current round: matches on the same date as this match
            let currentRoundDate = null;
            let currentRoundNum = 0;
            for (let i = 0; i < sortedDates.length; i++) {
                if (sortedDates[i] === matchDate) {
                    currentRoundDate = sortedDates[i];
                    currentRoundNum = i + 1;
                    break;
                }
            }

            if (!currentRoundDate) {
                body.html('<div style="text-align:center;padding:20px;color:#ff6b6b">Could not find current round</div>');
                return;
            }

            const currentRoundMatches = byDate[currentRoundDate];

            // Build standings from all rounds BEFORE the current round
            const standings = {}; // clubId → { p, w, d, l, gf, ga, pts, name }
            const initClub = (id, name) => {
                if (!standings[id]) standings[id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, name: name || id };
            };

            // All matches from previous rounds
            for (const date of sortedDates) {
                if (date >= currentRoundDate) break;
                byDate[date].forEach(m => {
                    if (!m.result) return;
                    const [hg, ag] = m.result.split('-').map(Number);
                    const hId = String(m.hometeam);
                    const aId = String(m.awayteam);
                    initClub(hId, clubNamesMap[hId] || hId);
                    initClub(aId, clubNamesMap[aId] || aId);
                    standings[hId].p++; standings[aId].p++;
                    standings[hId].gf += hg; standings[hId].ga += ag;
                    standings[aId].gf += ag; standings[aId].ga += hg;
                    if (hg > ag) { standings[hId].w++; standings[hId].pts += 3; standings[aId].l++; }
                    else if (hg < ag) { standings[aId].w++; standings[aId].pts += 3; standings[hId].l++; }
                    else { standings[hId].d++; standings[aId].d++; standings[hId].pts++; standings[aId].pts++; }
                });
            }

            // Ensure all current round teams are in standings
            currentRoundMatches.forEach(m => {
                initClub(String(m.hometeam), clubNamesMap[String(m.hometeam)] || String(m.hometeam));
                initClub(String(m.awayteam), clubNamesMap[String(m.awayteam)] || String(m.awayteam));
            });

            // Compute pre-round rankings (before current round results)
            const preRoundRank = {}; // clubId → position
            const preRoundSorted = Object.entries(standings)
                .map(([id, s]) => ({ id, pts: s.pts, gd: s.gf - s.ga, gf: s.gf }))
                .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
            preRoundSorted.forEach((s, i) => { preRoundRank[s.id] = i + 1; });

            // Now fetch live data for current round matches to get live scores
            const matchIds = currentRoundMatches.map(m => String(m.id));
            const liveScores = {}; // matchId → { homeGoals, awayGoals, homeId, awayId, events[], live_min }
            let loaded = 0;

            const finalize = () => {
                // Apply current round live scores to standings
                Object.values(liveScores).forEach(ls => {
                    const hId = ls.homeId;
                    const aId = ls.awayId;
                    initClub(hId, clubNamesMap[hId] || hId);
                    initClub(aId, clubNamesMap[aId] || aId);
                    const hg = ls.homeGoals;
                    const ag = ls.awayGoals;
                    standings[hId].p++; standings[aId].p++;
                    standings[hId].gf += hg; standings[hId].ga += ag;
                    standings[aId].gf += ag; standings[aId].ga += hg;
                    if (hg > ag) { standings[hId].w++; standings[hId].pts += 3; standings[aId].l++; }
                    else if (hg < ag) { standings[aId].w++; standings[aId].pts += 3; standings[hId].l++; }
                    else { standings[hId].d++; standings[aId].d++; standings[hId].pts++; standings[aId].pts++; }
                });

                // Sort standings: pts desc, then GD desc, then GF desc
                const sorted = Object.entries(standings)
                    .map(([id, s]) => ({ id, ...s, gd: s.gf - s.ga }))
                    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

                // Determine live minute display (use curMin from replay state)
                const liveMinDisplay = (curMin > 0 && curMin < 999)
                    ? Math.floor(curMin) + "'"
                    : null;

                // ── Build HTML ──
                // Helper: group events by player+icon → "⚽ Crain 6' 16' 32'"
                const groupEvents = (events) => {
                    const map = new Map();
                    events.forEach(ev => {
                        const key = ev.icon + '|' + ev.name;
                        if (!map.has(key)) map.set(key, { icon: ev.icon, name: ev.name, mins: [] });
                        map.get(key).mins.push(ev.min);
                    });
                    return Array.from(map.values());
                };

                let html = '<div class="rnd-league-wrap">';

                // Header
                html += '<div class="rnd-league-header">';
                html += `<span class="rnd-league-title">Round ${currentRoundNum}</span>`;
                if (liveMinDisplay) {
                    html += `<span class="rnd-league-minute-badge">⏱ ${liveMinDisplay}</span>`;
                }
                html += '</div>';

                html += '<div class="rnd-league-columns">';

                // ── LEFT: Matches ──
                html += '<div class="rnd-league-col-matches">';
                html += '<div class="rnd-league-col-title">Matches</div>';

                currentRoundMatches.forEach((m, mi) => {
                    const mid = String(m.id);
                    const hId = String(m.hometeam);
                    const aId = String(m.awayteam);
                    const hName = clubNamesMap[hId] || hId;
                    const aName = clubNamesMap[aId] || aId;
                    const isCurrent = (hId === homeId && aId === awayId) || (hId === awayId && aId === homeId);
                    const ls = liveScores[mid];
                    let hGoals = '–', aGoals = '–';
                    let isLive = false;
                    if (ls) {
                        hGoals = ls.homeGoals; aGoals = ls.awayGoals;
                        isLive = ls.live_min > 0;
                    } else if (m.result) {
                        const parts = m.result.split('-');
                        hGoals = parts[0]; aGoals = parts[1];
                    }

                    html += `<div class="rnd-league-match${isCurrent ? ' rnd-league-current' : ''}${isLive ? ' live' : ''}" data-mid="${mid}">`;
                    const hRC = ls ? ls.homeRC : 0;
                    const aRC = ls ? ls.awayRC : 0;
                    html += `<span class="rnd-league-home">${hName}${hRC ? ' 🟥' : ''}</span>`;
                    html += `<img class="rnd-league-logo" src="/pics/club_logos/${hId}_25.png" onerror="this.style.visibility='hidden'">`;
                    html += '<span class="rnd-league-score-block">';
                    html += `<span class="rnd-league-score-num">${hGoals}</span>`;
                    html += '<span class="rnd-league-score-sep">–</span>';
                    html += `<span class="rnd-league-score-num">${aGoals}</span>`;
                    html += '</span>';
                    html += `<img class="rnd-league-logo" src="/pics/club_logos/${aId}_25.png" onerror="this.style.visibility='hidden'">`;
                    html += `<span class="rnd-league-away">${aRC ? '🟥 ' : ''}${aName}</span>`;
                    html += '</div>';
                });
                html += '</div>';

                // ── RIGHT: Standings ──
                html += '<div class="rnd-league-col-standings">';
                html += '<div class="rnd-league-col-title">Standings</div>';
                html += '<table class="rnd-league-tbl">';
                html += '<tr><th>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr>';
                const totalTeams = sorted.length;
                sorted.forEach((s, i) => {
                    const isHL = s.id === homeId || s.id === awayId;
                    const pos = i + 1;
                    const gdCls = s.gd > 0 ? ' gd-pos' : (s.gd < 0 ? ' gd-neg' : '');

                    // Position change arrow
                    const prevPos = preRoundRank[s.id] || pos;
                    const diff = prevPos - pos; // positive = moved up, negative = moved down
                    let arrow = '';
                    if (diff > 0) arrow = `<span class="pos-arrow pos-up">▲${diff}</span>`;
                    else if (diff < 0) arrow = `<span class="pos-arrow pos-down">▼${Math.abs(diff)}</span>`;
                    else arrow = `<span class="pos-arrow pos-same">–</span>`;

                    // Zone classes: relegation (last 4), baraž (11-14)
                    let zoneCls = '';
                    if (pos > totalTeams - 4) zoneCls = ' zone-relegation';
                    else if (pos >= 11 && pos <= 14) zoneCls = ' zone-playoff';

                    html += `<tr class="${isHL ? 'rnd-league-hl' : ''}${zoneCls}">`;
                    html += `<td class="pos-num">${pos} ${arrow}</td>`;
                    html += `<td><div class="club-cell"><img class="club-logo" src="/pics/club_logos/${s.id}_25.png" onerror="this.style.display='none'"><span class="club-name">${s.name}</span></div></td>`;
                    html += `<td>${s.p}</td><td class="w-col">${s.w}</td><td>${s.d}</td><td class="l-col">${s.l}</td>`;
                    html += `<td>${s.gf}</td><td>${s.ga}</td><td class="${gdCls}">${s.gd > 0 ? '+' : ''}${s.gd}</td>`;
                    html += `<td class="pts">${s.pts}</td>`;
                    html += '</tr>';
                });
                html += '</table>';
                html += '<div class="rnd-league-legend">';
                html += '<span class="legend-item"><span class="legend-dot legend-rel"></span>Relegation</span>';
                html += '<span class="legend-item"><span class="legend-dot legend-po"></span>Playoff</span>';
                html += '</div>';
                html += '</div>';

                html += '</div>'; // columns
                html += '</div>'; // wrap
                body.html(html);

                // ── Hover tooltip for match rows ──
                const $tooltip = $('<div class="rnd-league-tooltip"></div>').appendTo(body);

                const ttBar = (hVal, aVal) => {
                    const total = hVal + aVal;
                    const hPct = total === 0 ? 50 : Math.round(hVal / total * 100);
                    return `<div class="rnd-league-tt-bar"><div class="rnd-league-tt-seg home" style="width:${hPct}%"></div><div class="rnd-league-tt-seg away" style="width:${100 - hPct}%"></div></div>`;
                };

                body.on('mouseenter', '.rnd-league-match', function (e) {
                    const mid = $(this).data('mid');
                    const ls = liveScores[String(mid)];
                    if (!ls) return;
                    const hN = ls.homeName || clubNamesMap[ls.homeId] || ls.homeId;
                    const aN = ls.awayName || clubNamesMap[ls.awayId] || ls.awayId;

                    let t = '<div class="rnd-league-tt-head">';
                    t += `<img class="rnd-league-tt-logo" src="/pics/club_logos/${ls.homeId}_25.png" onerror="this.style.display='none'">`;
                    t += `<span class="rnd-league-tt-team">${hN}</span>`;
                    t += '<span class="rnd-league-tt-score">';
                    t += `<span class="rnd-league-tt-score-num">${ls.homeGoals}</span>`;
                    t += '<span class="rnd-league-tt-score-sep">–</span>';
                    t += `<span class="rnd-league-tt-score-num">${ls.awayGoals}</span>`;
                    t += '</span>';
                    t += `<span class="rnd-league-tt-team">${aN}</span>`;
                    t += `<img class="rnd-league-tt-logo" src="/pics/club_logos/${ls.awayId}_25.png" onerror="this.style.display='none'">`;
                    t += '</div>';

                    t += '<div class="rnd-league-tt-stats">';
                    const statRow = (label, hv, av) => {
                        const hLead = hv > av ? ' leading' : '';
                        const aLead = av > hv ? ' leading' : '';
                        return `<div class="rnd-league-tt-stat-row"><span class="rnd-league-tt-val home${hLead}">${hv}</span>${ttBar(hv, av)}<span class="rnd-league-tt-label">${label}</span>${ttBar(hv, av)}<span class="rnd-league-tt-val away${aLead}">${av}</span></div>`;
                    };
                    t += statRow('Shots', ls.homeShots, ls.awayShots);
                    t += statRow('On Target', ls.homeSoT, ls.awaySoT);
                    t += statRow('Yellow', ls.homeYC, ls.awayYC);
                    t += statRow('Red', ls.homeRC, ls.awayRC);
                    t += '</div>';

                    if (ls.events.length) {
                        t += '<div class="rnd-league-tt-events">';
                        const homeEvts = groupEvents(ls.events.filter(e => e.side === 'home'));
                        const awayEvts = groupEvents(ls.events.filter(e => e.side === 'away'));
                        const maxLen = Math.max(homeEvts.length, awayEvts.length);
                        for (let ei = 0; ei < maxLen; ei++) {
                            const he = homeEvts[ei];
                            const ae = awayEvts[ei];
                            t += '<div class="rnd-league-tt-evt-row">';
                            t += `<span class="tt-evt-home">${he ? `${he.name} ${he.icon} <span class="evt-min">${he.mins.map(m => m + "'").join(' ')}</span>` : ''}</span>`;
                            t += `<span class="tt-evt-away">${ae ? `${ae.icon} ${ae.name} <span class="evt-min">${ae.mins.map(m => m + "'").join(' ')}</span>` : ''}</span>`;
                            t += '</div>';
                        }
                        t += '</div>';
                    }
                    $tooltip.html(t);
                    const rect = this.getBoundingClientRect();
                    const bodyRect = body[0].getBoundingClientRect();
                    $tooltip.css({
                        top: rect.bottom - bodyRect.top + 6,
                        left: Math.max(4, rect.left - bodyRect.left + (rect.width / 2) - 160)
                    }).addClass('visible');
                }).on('mouseleave', '.rnd-league-match', function () {
                    $tooltip.removeClass('visible');
                });
            };

            // Fetch live data for each match in current round
            if (matchIds.length === 0) {
                finalize();
                return;
            }

            matchIds.forEach(mid => {
                window.TmApi.fetchMatch(mid).then(md => {
                    if (!md) {
                        // If fetch fails, use fixture result as fallback
                        const m = currentRoundMatches.find(x => String(x.id) === mid);
                        if (m && m.result) {
                            const [hg, ag] = m.result.split('-').map(Number);
                            liveScores[mid] = {
                                homeGoals: hg, awayGoals: ag,
                                homeId: String(m.hometeam), awayId: String(m.awayteam),
                                events: [], live_min: 0
                            };
                        }
                        return;
                    }
                    const hId = String(md.club?.home?.id || '');
                    const aId = String(md.club?.away?.id || '');
                    const report = md.report || {};
                    const livMin = md.match_data?.live_min || 0;

                    // Update club names from live data
                    if (md.club?.home?.club_name) clubNamesMap[hId] = md.club.home.club_name;
                    if (md.club?.away?.club_name) clubNamesMap[aId] = md.club.away.club_name;

                    // Extract goals, shots, cards from report up to curMin
                    const homeLineupIds = new Set(Object.keys(md.lineup?.home || {}));
                    const ms = window.TmMatchUtils.extractStats(report, homeLineupIds, hId, {
                        upToMin: curMin, lineup: md.lineup,
                    });
                    const homeGoals = ms.homeGoals, awayGoals = ms.awayGoals;
                    const homeShots = ms.homeShots, awayShots = ms.awayShots;
                    const homeSoT = ms.homeSoT, awaySoT = ms.awaySoT;
                    const homeYC = ms.homeYellow, awayYC = ms.awayYellow;
                    const homeRC = ms.homeRed, awayRC = ms.awayRed;
                    const events = ms.events;

                    liveScores[mid] = {
                        homeGoals, awayGoals, homeId: hId, awayId: aId, events, live_min: livMin,
                        homeShots, awayShots, homeSoT, awaySoT, homeYC, awayYC, homeRC, awayRC,
                        homeName: md.club?.home?.club_name || '', awayName: md.club?.away?.club_name || ''
                    };
                }).finally(() => {
                    loaded++;
                    if (loaded >= matchIds.length) finalize();
                });
            });
        };

        // Check cache
        if (leagueTabCache && leagueTabCache.country === country && leagueTabCache.division === division) {
            buildLeagueView(leagueTabCache.fixtures);
            return;
        }

        // Fetch fixtures
        window.TmApi.fetchLeagueFixtures(country, division, group)
            .then(fixtures => {
                if (!fixtures) { body.html('<div style="text-align:center;padding:20px;color:#ff6b6b">Failed to load league data</div>'); return; }
                leagueTabCache = { country, division, group, fixtures };
                buildLeagueView(fixtures);
            });
        }
    };
})();


// ─── tm-match.user.js (guarded: /^\/matches\/\d+/) ──────────────
if (/^\/matches\/\d+/.test(location.pathname)) {
﻿// ==UserScript==
// @name         TM Match Viewer
// @namespace    https://trophymanager.com
// @version      1.4.0
// @description  Enhanced match viewer with live replay, lineups, statistics, venue and H2H tabs
// @match        https://trophymanager.com/matches/*
// @require      file://H:/projects/Moji/tmscripts/lib/tm-constants.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-position.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-utils.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-lib.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-playerdb.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-services.js
// @require      file://H:/projects/Moji/tmscripts/components/shared/tm-ui.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-styles.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-utils.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-dialog.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-venue.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-h2h.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-analysis.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-league.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-statistics.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-lineups.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ─── Constants ───────────────────────────────────────────────────────
    const { REC_THRESHOLDS } = window.TmConst;

    // ─── Utility helpers ─────────────────────────────────────────────────
    const parseNum = str => Number(String(str).replace(/,/g, ''));

    const getColor = window.TmUtils.getColor;

    // ─── Player data fetching (with Promise-based cache) ─────────────────
    const tooltipCache = new Map();

    const fetchTooltip = playerId => {
        const pid = String(playerId);
        if (!tooltipCache.has(pid)) {
            tooltipCache.set(pid, window.TmApi.fetchTooltipRaw(playerId).then(data => {
                if (!data) throw new Error('tooltip fetch failed');
                return data;
            }));
        }
        return tooltipCache.get(pid);
    };

    const getPlayerData = (playerId, routineMap, positionMap) => {
        return fetchTooltip(playerId).then(rawData => {
            const player = JSON.parse(JSON.stringify(rawData.player));
            if (routineMap.has(playerId)) player.routine = String(routineMap.get(playerId));
            if (positionMap.has(playerId)) player.favposition = positionMap.get(playerId);
            const DBPlayer = window.TmPlayerDB.get(parseInt(player.player_id));
            window.TmApi.normalizePlayer(player, DBPlayer, { skipSync: true });
            return { Age: player.ageMonths, REC: player.rec, R5: player.r5 };
        });
    };

    const injectStyles = () => window.TmMatchStyles.inject();

    // ─── Match cache & rating cells ─────────────────────────────────────
    const roundMatchCache = new Map(); // matchId -> {homeR5, awayR5, data}

    // ─── Match dialog ────────────────────────────────────────────────────
    // ── Live replay state (shared across tabs) ──
    let liveState = null;
    let prematchTimer = null;
    // liveState = { min, sec, curEvtIdx, curLineIdx, playing, timer, mData, speed:1000,
    //               maxMin, ended, schedule, eventMinList, eventMinIdx }

    // ── Unity 3D integration state ──
    let unityState = {
        available: false,       // gameInstance exists on page
        ready: false,           // lineup loaded, ready to play clips
        playing: false,         // currently playing a clip sequence
        pendingMinute: null,    // minute waiting for finished_loading
        loadedMinutes: [],      // minutes that finished loading
        playedMinutes: [],      // minutes that finished playing
        canvasParent: null,     // original parent of the Unity canvas
        tmPaused: false,        // whether we've paused TM's replay
        clipTextQueue: [],      // flat list of {evtIdx, lineIdx} for current minute (first event only)
        clipTextCursor: 0,      // how many text lines we've shown
        clipTextGroups: [],     // group boundaries [{start, count}]
        clipGroupCursor: 0,     // how many groups we've shown
        clipPostQueue: [],      // remaining events' text, shown after animation
        activeMinute: null,     // the minute currently being clip-played
        clipFirstShown: false,  // whether first text group was shown on starting_clip
        clipSkippedFirst: false, // whether we skipped the first finished_clip
    };

    // ── Unity integration helpers ──
    const getUW = () => {
        return typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    };

    const initUnity = () => {
        const uw = getUW();
        const poll = setInterval(() => {
            if (uw.gameInstance || uw.gameInstanceLoaded) {
                clearInterval(poll);
                unityState.available = true;
                unityState.ready = true;  // flash_ready already fired before our override
                console.log('[RND] Unity gameInstance detected, assuming ready');
                stopTMReplay();
                setupStargateOverride();
                // If Lineups tab already rendered, move canvas immediately
                const vp = document.getElementById('rnd-unity-viewport');
                if (vp) {
                    moveUnityCanvas();
                    vp.style.display = 'block';
                }
                // Auto-play live match if paused (e.g. page refresh)
                if (liveState && !liveState.playing && !liveState.ended) {
                    console.log('[RND] Auto-playing live match after Unity detected');
                    livePlay();
                }
            }
        }, 500);
        setTimeout(() => clearInterval(poll), 30000);
    };

    const stopTMReplay = () => {
        const uw = getUW();
        if (unityState.tmPaused) return;
        unityState.tmPaused = true;
        // Pause TM's replay system completely
        if (uw.flash_status) {
            uw.flash_status.playback_mode = 'pause';
            uw.flash_status.enabled = false;  // prevent TM from sending clips
        }
        // Kill TM's run_match loop
        uw._orig_run_match = uw.run_match;
        uw.run_match = function () { /* noop */ };
        // Also kill TM's text display functions so they don't interfere
        if (uw.show_next_action_text_entry) {
            uw._orig_show_next_action_text_entry = uw.show_next_action_text_entry;
            uw.show_next_action_text_entry = function () { /* noop */ };
        }
        if (uw.prepare_next_minute) {
            uw._orig_prepare_next_minute = uw.prepare_next_minute;
            uw.prepare_next_minute = function () { /* noop */ };
        }
        // Clear any pending setTimeout from TM's run_match chain
        // (clear a range of recent timer IDs to catch the pending one)
        const lastId = setTimeout(() => { }, 0);
        for (let i = lastId - 20; i <= lastId; i++) {
            clearTimeout(i);
        }
        console.log('[RND] TM replay stopped completely');
    };

    // Build flat text-line queue for a minute
    // Only the FIRST event is synced to the animation (distributed by groups over clip duration)
    // Remaining events are queued as postQueue, shown after animation finishes
    const buildClipTextQueue = (mData, minute) => {
        const report = mData.report || {};
        const evts = report[String(minute)] || [];
        const queue = [];
        const groups = []; // each entry = { start, count } into queue
        const postQueue = []; // remaining events' text lines
        evts.forEach((evt, evtIdx) => {
            if (!evt.chance || !evt.chance.text) return;
            let flatIdx = 0;
            if (evtIdx === 0) {
                // First event: animation-synced text
                evt.chance.text.forEach(textArr => {
                    const groupStart = queue.length;
                    let groupCount = 0;
                    textArr.forEach(line => {
                        if (!line || !line.trim()) return;
                        queue.push({ evtIdx, lineIdx: flatIdx });
                        flatIdx++;
                        groupCount++;
                    });
                    if (groupCount > 0) groups.push({ start: groupStart, count: groupCount });
                });
            } else {
                // Remaining events: post-animation text
                evt.chance.text.forEach(textArr => {
                    textArr.forEach(line => {
                        if (!line || !line.trim()) return;
                        postQueue.push({ evtIdx, lineIdx: flatIdx });
                        flatIdx++;
                    });
                });
            }
        });
        return { queue, groups, postQueue };
    };

    // Show ONE text line from the clip queue
    const advanceClipTextOneLine = () => {
        if (!liveState || !unityState.clipTextQueue.length) return;
        const idx = unityState.clipTextCursor;
        if (idx >= unityState.clipTextQueue.length) return;
        const entry = unityState.clipTextQueue[idx];
        unityState.clipTextCursor = idx + 1;

        liveState.curEvtIdx = entry.evtIdx;
        liveState.curLineIdx = entry.lineIdx;

        // Check if this event is complete
        const report = liveState.mData.report || {};
        const evts = report[String(liveState.min)] || [];
        const evt = evts[entry.evtIdx];
        const total = evt ? countEventLines(evt) : 1;
        const isComplete = entry.lineIdx >= total - 1;
        liveState.curEvtComplete = isComplete;
        liveState.justCompleted = isComplete;

        updateLiveHeader();
        refreshActiveTab();
        // Also update the unity side panels
        updateUnityFeed();
        // Only update stats when event is fully complete
        if (isComplete) updateUnityStats();
    };

    // ── Update the left-side feed panel next to viewport (current minute only) ──
    const updateUnityFeed = () => {
        const container = $('#rnd-unity-feed');
        if (!container.length || !liveState) return;
        const mData = liveState.mData;
        const report = mData.report || {};
        const playerNames = buildPlayerNames(mData);
        const curMin = liveState.min;
        const curEvtIdx = liveState.curEvtIdx;
        const curLineIdx = liveState.curLineIdx;
        const allLines = [];
        // Only show events for the CURRENT minute
        const evts = report[String(curMin)] || [];
        for (let ei = 0; ei < evts.length; ei++) {
            if (!isEventVisible(curMin, ei, curMin, curEvtIdx)) continue;
            const evt = evts[ei];
            if (!evt || !evt.chance || !evt.chance.text) continue;
            let flatIdx = 0;
            evt.chance.text.forEach(textArr => {
                textArr.forEach(line => {
                    if (!line || !line.trim()) return;
                    if (ei === curEvtIdx && flatIdx > curLineIdx) { flatIdx++; return; }
                    allLines.push({ min: curMin, text: line });
                    flatIdx++;
                });
            });
        }
        let html = '';
        allLines.forEach(item => {
            let resolved = resolvePlayerTags(item.text, playerNames);
            resolved = resolved.replace(/\[(goal|yellow|red|sub|assist)\]/g, '');
            html += `<div class="rnd-unity-feed-line"><span class="rnd-unity-feed-min">${item.min}'</span><span class="rnd-unity-feed-text">${resolved}</span></div>`;
        });
        container.html(html);
        // Auto-scroll to bottom
        container.scrollTop(container[0].scrollHeight);
    };

    // ── Update the right-side mini stats panel next to viewport ──
    const updateUnityStats = () => {
        const container = $('#rnd-unity-stats');
        if (!container.length || !liveState) return;
        const mData = liveState.mData;
        const homeId = String(mData.club.home.id);
        const homeIds = new Set(Object.keys(mData.lineup.home));
        const report = mData.report || {};
        const curMin = liveState.min;
        const curEvtIdx = liveState.curEvtIdx;
        let hShots = 0, aShots = 0, hSoT = 0, aSoT = 0, hGoals = 0, aGoals = 0;
        let hYellow = 0, aYellow = 0, hRed = 0, aRed = 0, hSetPieces = 0, aSetPieces = 0;
        const sortedMins = Object.keys(report).map(Number).sort((a, b) => a - b);
        for (const min of sortedMins) {
            const evts = report[String(min)] || [];
            for (let ei = 0; ei < evts.length; ei++) {
                if (!isEventVisible(min, ei, curMin, curEvtIdx)) continue;
                const evt = evts[ei];
                if (!evt || !evt.parameters) continue;
                evt.parameters.forEach(p => {
                    if (p.shot) {
                        const isHome = String(p.shot.team) === homeId;
                        if (isHome) { hShots++; if (p.shot.target === 'on') hSoT++; }
                        else { aShots++; if (p.shot.target === 'on') aSoT++; }
                    }
                    if (p.goal) {
                        const scorerId = String(p.goal.player);
                        const isHome = homeIds.has(scorerId);
                        if (isHome) hGoals++; else aGoals++;
                    }
                    if (p.yellow) {
                        if (homeIds.has(String(p.yellow))) hYellow++; else aYellow++;
                    }
                    if (p.yellow_red) {
                        if (homeIds.has(String(p.yellow_red))) hRed++; else aRed++;
                    }
                    if (p.red) {
                        if (homeIds.has(String(p.red))) hRed++; else aRed++;
                    }
                    if (p.set_piece) {
                        if (homeIds.has(String(p.set_piece))) hSetPieces++; else aSetPieces++;
                    }
                });
            }
        }
        const miniBar = (label, hv, av) => {
            const total = hv + av;
            const hp = total === 0 ? 50 : Math.round(hv / total * 100);
            const ap = 100 - hp;
            const hLead = hv > av ? ' lead' : '';
            const aLead = av > hv ? ' lead' : '';
            return `<div class="rnd-unity-stat-row">
                <div class="rnd-unity-stat-hdr"><span class="val home${hLead}">${hv}</span><span class="rnd-unity-stat-label">${label}</span><span class="val away${aLead}">${av}</span></div>
                <div class="rnd-unity-stat-bar"><div class="seg home" style="width:${hp}%"></div><div class="seg away" style="width:${ap}%"></div></div>
            </div>`;
        };
        let h = '';
        h += miniBar('Shots', hShots, aShots);
        h += miniBar('On Target', hSoT, aSoT);
        h += miniBar('Goals', hGoals, aGoals);
        h += miniBar('Yellow', hYellow, aYellow);
        h += miniBar('Red', hRed, aRed);
        h += miniBar('Set Pieces', hSetPieces, aSetPieces);
        container.html(h);
    };

    // Flush all remaining text lines at once (for finished_playing)
    const flushClipText = () => {
        if (!liveState) return;
        // Flush remaining animation text (first event)
        while (unityState.clipTextCursor < unityState.clipTextQueue.length) {
            advanceClipTextOneLine();
        }
        // Append and flush post-animation text (remaining events)
        if (unityState.clipPostQueue && unityState.clipPostQueue.length > 0) {
            unityState.clipPostQueue.forEach(entry => {
                unityState.clipTextQueue.push(entry);
            });
            unityState.clipPostQueue = [];
            while (unityState.clipTextCursor < unityState.clipTextQueue.length) {
                advanceClipTextOneLine();
            }
        }
    };

    // Advance the next text group (called on each finished_clip from Unity)
    const advanceClipTextGroup = () => {
        const groups = unityState.clipTextGroups || [];
        const gi = unityState.clipGroupCursor || 0;
        if (gi >= groups.length) return;
        const group = groups[gi];
        // Show all lines in this group at once
        for (let j = 0; j < group.count; j++) {
            if (unityState.clipTextCursor < unityState.clipTextQueue.length) {
                advanceClipTextOneLine();
            }
        }
        unityState.clipGroupCursor = gi + 1;
        console.log('[RND] Advanced text group ' + gi + ' (' + group.count + ' lines)');
    };

    const setupStargateOverride = () => {
        const uw = getUW();
        uw._orig_stargate = uw.stargate;
        uw.stargate = function (vars) {
            console.log('[RND] stargate:', JSON.stringify(vars));

            if (vars.flash_ready) {
                unityState.ready = true;
                console.log('[RND] Unity ready');
            }

            if (vars.finished_loading) {
                const min = vars.finished_loading.id;
                unityState.loadedMinutes.push(min);
                console.log('[RND] Clips loaded for minute', min);
                if (unityState.pendingMinute === min) {
                    unityState.pendingMinute = null;
                    playUnityClips(min);
                }
            }

            // A single clip finished → show the next text group
            // Skip the first finished_clip because its text was already shown on starting_clip
            if (vars.finished_clip) {
                if (unityState.clipFirstShown && !unityState.clipSkippedFirst) {
                    // First clip just finished; text was already shown via starting_clip
                    unityState.clipSkippedFirst = true;
                    console.log('[RND] Skipping finished_clip for group 0 (already shown on start)');
                } else {
                    advanceClipTextGroup();
                }
            }

            // A clip is starting
            if (vars.starting_clip) {
                unityState.playing = true;
                // Show first text group immediately when the first clip starts
                if (!unityState.clipFirstShown) {
                    unityState.clipFirstShown = true;
                    advanceClipTextGroup();
                }
                // Goal clip → update score after a short delay
                if (vars.starting_clip.clip && vars.starting_clip.clip.substring(0, 4) === 'goal') {
                    setTimeout(() => {
                        updateLiveHeader();
                        refreshActiveTab();
                    }, 1200);
                }
            }

            // All clips for a minute finished → let timer advance to next minute
            if (vars.finished_playing) {
                const min = vars.finished_playing.id;
                unityState.playedMinutes.push(min);
                unityState.playing = false;
                console.log('[RND] All clips finished for minute', min);
                // Show any remaining lines
                flushClipText();
                // Clear activeMinute so liveStep resumes normal schedule-based flow
                unityState.activeMinute = null;
                // Force sec to 59 so liveStep advances to next minute on next tick
                if (liveState) {
                    liveState.sec = 59;
                    // Apply deferred filter switch if pending
                    if (liveState.pendingFilterSwitch) {
                        applyFilterSwitch(liveState.pendingFilterSwitch);
                    }
                }
            }
        };
    };

    // Save canvas to a hidden container so it survives tab switches
    const saveUnityCanvas = () => {
        if (!unityState.available) return;
        const webglContent = document.querySelector('.webgl-content');
        if (!webglContent) return;
        // Don't save if already in safe container
        if (webglContent.parentElement && webglContent.parentElement.id === 'rnd-unity-safe') return;
        let safe = document.getElementById('rnd-unity-safe');
        if (!safe) {
            safe = document.createElement('div');
            safe.id = 'rnd-unity-safe';
            safe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;';
            document.body.appendChild(safe);
        }
        safe.appendChild(webglContent);
        console.log('[RND] Canvas saved to safe container');
    };

    const moveUnityCanvas = () => {
        if (!unityState.available) return;
        const webglContent = document.querySelector('.webgl-content');
        if (!webglContent) return;
        const target = document.getElementById('rnd-unity-viewport');
        if (!target) return;
        // Remember original parent so we could restore if needed
        if (!unityState.canvasParent) unityState.canvasParent = webglContent.parentElement;
        // Move the .webgl-content into our viewport
        target.innerHTML = '';
        target.appendChild(webglContent);
        // Make .webgl-content visible (TM hides it initially)
        webglContent.style.display = 'block';
        // Clear inline dimensions on #gameContainer (it has width:300px;height:200px)
        const gc = document.getElementById('gameContainer');
        if (gc) {
            gc.style.width = '100%';
            gc.style.height = '100%';
            gc.style.margin = '0';
        }
        // Show viewport
        target.style.display = 'block';
        // Remove no-unity layout class now that canvas is present
        const row = document.querySelector('.rnd-unity-row');
        if (row) row.classList.remove('rnd-no-unity');
        console.log('[RND] Canvas moved into viewport');
        // Sync feed & stats height to viewport height
        syncUnityPanelHeights();
    };

    // Keep feed and stats panels the same height as the viewport
    const syncUnityPanelHeights = () => {
        const vp = document.getElementById('rnd-unity-viewport');
        if (!vp) return;
        requestAnimationFrame(() => {
            const h = vp.offsetHeight;
            if (!h) return;
            const feed = document.getElementById('rnd-unity-feed');
            const stats = document.getElementById('rnd-unity-stats');
            if (feed) feed.style.maxHeight = h + 'px';
            if (stats) stats.style.maxHeight = h + 'px';
        });
    };

    const loadUnityClips = (minute, mData) => {
        const uw = getUW();
        if (!unityState.available || !uw.gameInstance) return false;
        const report = mData.report || {};
        const evts = report[String(minute)] || [];
        const videoList = [];
        evts.forEach(evt => {
            if (evt.chance && evt.chance.video) {
                const v = evt.chance.video;
                if (Array.isArray(v)) {
                    videoList.push(...v);
                } else {
                    videoList.push(v);
                }
            }
        });
        if (videoList.length === 0) return false;
        console.log('[RND] Loading clips for minute', minute, videoList.length, 'clips');
        // Prepare the text queue for this minute
        const { queue, groups, postQueue } = buildClipTextQueue(mData, minute);
        unityState.clipTextQueue = queue;
        unityState.clipTextGroups = groups;
        unityState.clipPostQueue = postQueue;
        unityState.clipTextCursor = 0;
        unityState.clipGroupCursor = 0;
        unityState.activeMinute = minute;
        unityState.clipFirstShown = false;
        unityState.clipSkippedFirst = false;
        unityState.pendingMinute = minute;
        uw.gameInstance.SendMessage('ClipsViewerScript', 'PrepareMinute', JSON.stringify({
            queue: videoList,
            id: minute
        }));
        return true;
    };

    const playUnityClips = (minute) => {
        const uw = getUW();
        if (!unityState.available || !uw.gameInstance) return;
        unityState.playing = true;
        console.log('[RND] Playing clips for minute', minute);
        uw.gameInstance.SendMessage('ClipsViewerScript', 'PlayMinute', JSON.stringify({ id: minute }));
    };

    const LINE_INTERVAL = 3;  // seconds between lines within a minute
    const POST_DELAY = 3;     // seconds after last line before advancing to next minute

    // ── Count total non-empty lines in an event's chance.text ──
    const countEventLines = (evt) => {
        if (!evt.chance || !evt.chance.text) return 1;
        let n = 0;
        evt.chance.text.forEach(textArr => {
            textArr.forEach(line => { if (line && line.trim()) n++; });
        });
        return Math.max(1, n);
    };

    // ── Calculate current match minute from kickoff timestamp ──
    const calculateLiveMinute = (kickoff) => {
        const now = Math.floor(Date.now() / 1000);
        const elapsed = now - kickoff;
        if (elapsed < 0) return null; // not started
        const FIRST_HALF = 45 * 60;  // 2700s
        const HT_BREAK = 15 * 60;  // 900s
        if (elapsed < FIRST_HALF) {
            return { minute: Math.floor(elapsed / 60), second: elapsed % 60, isHT: false };
        } else if (elapsed < FIRST_HALF + HT_BREAK) {
            return { minute: 45, second: 0, isHT: true };
        } else {
            const sh = elapsed - FIRST_HALF - HT_BREAK;
            return { minute: 45 + Math.floor(sh / 60), second: sh % 60, isHT: false };
        }
    };

    // ── Check if match is currently in progress (via API's live_min) ──
    const isMatchCurrentlyLive = (mData) => {
        const lm = mData.match_data?.live_min;
        return typeof lm === 'number' && lm > 0;
    };

    // ── Check if match is in the future (not yet started) ──
    const isMatchFuture = (mData) => {
        const md = mData.match_data;
        // Negative live_min means countdown to kickoff → match is in the future
        const lm = md?.live_min;
        if (typeof lm === 'number' && lm < 0) return true;
        // Positive live_min means match is in progress
        if (typeof lm === 'number' && lm > 0) return false;
        // Fallback: check kickoff timestamp
        const ko = md?.venue?.kickoff;
        if (ko) {
            const now = Math.floor(Date.now() / 1000);
            return Number(ko) > now;
        }
        return false;
    };

    // ── Derive effective kickoff timestamp from API's live_min ──
    // live_min = total real elapsed minutes since kickoff (includes HT break).
    // calculateLiveMinute then handles the 45min/15min-HT/second-half split.
    const deriveKickoff = (mData) => {
        const lm = mData.match_data.live_min;
        const now = Math.floor(Date.now() / 1000);
        return now - Math.round(lm * 60);
    };

    // ── Build per-minute schedule: which lines appear at which second ──
    const buildSchedule = (report, keyOnly = false) => {
        const schedule = {};     // min → [{evtIdx, lineIdx, sec}]
        const eventMinList = []; // sorted list of minutes that have events
        const mins = Object.keys(report).map(Number).sort((a, b) => a - b);
        mins.forEach(min => {
            const evts = report[min] || [];
            const entries = [];
            let secCursor = 0;
            evts.forEach((evt, evtIdx) => {
                if (keyOnly && evt.severity !== 1) return;
                const lineCount = countEventLines(evt);
                for (let li = 0; li < lineCount; li++) {
                    entries.push({ evtIdx, lineIdx: li, sec: secCursor });
                    secCursor += LINE_INTERVAL;
                }
            });
            if (entries.length > 0) {
                schedule[min] = entries;
                eventMinList.push(min);
            }
        });
        return { schedule, eventMinList };
    };

    // ── Check if an event is visible at the current live step (event-level) ──
    const isEventVisible = (evtMin, evtIdx, curMin, curEvtIdx) => {
        if (evtMin < curMin) return true;
        if (evtMin === curMin && evtIdx <= curEvtIdx) return true;
        return false;
    };

    // ── Compute score up to current step ──
    const scoreAtStep = (mData, curMin, curEvtIdx) => {
        const score = [0, 0];
        const homeId = String(mData.club.home.id);
        const report = mData.report || {};
        Object.keys(report).forEach(minKey => {
            const min = Number(minKey);
            (report[minKey] || []).forEach((evt, si) => {
                if (!isEventVisible(min, si, curMin, curEvtIdx)) return;
                if (!evt.parameters) return;
                evt.parameters.forEach(p => {
                    if (p.goal) {
                        if (String(evt.club) === homeId) score[0]++; else score[1]++;
                    }
                });
            });
        });
        return score;
    };

    // ── Compute active roster at current step (subs + red cards) ──
    // Returns { home: Set<playerId>, away: Set<playerId>, subbedPositions: Map<playerId, position> }
    const computeActiveRoster = (mData, curMin, curEvtIdx) => {
        const homeIds = new Set(Object.keys(mData.lineup.home));
        const homeActive = new Set();
        const awayActive = new Set();
        // Start with starters
        Object.values(mData.lineup.home).forEach(p => {
            if (!p.position.includes('sub')) homeActive.add(String(p.player_id));
        });
        Object.values(mData.lineup.away).forEach(p => {
            if (!p.position.includes('sub')) awayActive.add(String(p.player_id));
        });

        // Track position of subbed-in players (inherit from subbed-out player)
        const subbedPositions = new Map(); // player_id → position

        const report = mData.report || {};
        Object.keys(report).forEach(minKey => {
            const min = Number(minKey);
            (report[minKey] || []).forEach((evt, si) => {
                if (!isEventVisible(min, si, curMin, curEvtIdx)) return;
                if (!evt.parameters) return;
                evt.parameters.forEach(param => {
                    if (param.sub) {
                        const inId = String(param.sub.player_in);
                        const outId = String(param.sub.player_out);
                        const isHome = homeActive.has(outId) || homeIds.has(outId);
                        // Find position of outgoing player
                        const outPlayer = mData.lineup[isHome ? 'home' : 'away'][outId];
                        const outPos = subbedPositions.get(outId) || (outPlayer ? outPlayer.position : null);
                        if (outPos) subbedPositions.set(inId, outPos);
                        if (isHome) { homeActive.delete(outId); homeActive.add(inId); }
                        else { awayActive.delete(outId); awayActive.add(inId); }
                    }
                    if (param.red || param.yellow_red) {
                        const pid = String(param.red || param.yellow_red);
                        homeActive.delete(pid);
                        awayActive.delete(pid);
                    }
                });
            });
        });
        return { homeActive, awayActive, subbedPositions };
    };

    // ── Update live header (score + minute + progress) ──
    const updateLiveHeader = () => {
        if (!liveState) return;
        // Defer score update: don't count current event's goal until all its text lines are shown
        const scoreEvtIdx = (!liveState.ended && !liveState.curEvtComplete) ? liveState.curEvtIdx - 1 : liveState.curEvtIdx;
        const s = scoreAtStep(liveState.mData, liveState.min, scoreEvtIdx);
        $('#rnd-overlay .rnd-dlg-score').text(`${s[0]} - ${s[1]}`);
        const minDisplay = liveState.ended ? 'FT'
            : liveState.liveIsHT ? 'HT'
                : `${liveState.min}:${String(liveState.sec).padStart(2, '0')}`;
        $('#rnd-live-min-head').text(minDisplay);
        const maxMin = liveState.maxMin || 90;
        const pct = Math.min(100, Math.round((liveState.min * 60 + liveState.sec) / (maxMin * 60) * 100));
        $('#rnd-live-progress-head').css('width', pct + '%');
        if (liveState.ended) {
            $('#rnd-overlay .rnd-dlg-head').removeClass('rnd-live-active');
            $('#rnd-live-play-head').html('▶');
        }
        // Live-update mentality chips from report mentality_change events
        if (liveState.mData) {
            const mentalityMapH = { 1: 'V.Def', 2: 'Def', 3: 'Sl.Def', 4: 'Normal', 5: 'Sl.Att', 6: 'Att', 7: 'V.Att' };
            const homeClubId = String(liveState.mData.club.home.id);
            const awayClubId = String(liveState.mData.club.away.id);
            const mdH = liveState.mData.match_data;
            const curMent = {
                home: Number(mdH.mentality ? mdH.mentality.home : 4),
                away: Number(mdH.mentality ? mdH.mentality.away : 4)
            };
            const rpt = liveState.mData.report || {};
            Object.keys(rpt).forEach(mk => {
                const eMin = Number(mk);
                (rpt[mk] || []).forEach((evt, si) => {
                    if (!isEventVisible(eMin, si, liveState.min, scoreEvtIdx)) return;
                    if (!evt.parameters) return;
                    evt.parameters.forEach(p => {
                        if (p.mentality_change) {
                            const tid = String(p.mentality_change.team);
                            if (tid === homeClubId) curMent.home = Number(p.mentality_change.mentality);
                            else if (tid === awayClubId) curMent.away = Number(p.mentality_change.mentality);
                        }
                    });
                });
            });
            const hChip = $('#rnd-chip-ment-home');
            if (hChip.length) hChip.find('.chip-val').text(mentalityMapH[curMent.home] || curMent.home);
            const aChip = $('#rnd-chip-ment-away');
            if (aChip.length) aChip.find('.chip-val').text(mentalityMapH[curMent.away] || curMent.away);
        }
    };



    // ── Refresh whichever tab is active ──
    const refreshActiveTab = () => {
        if (!liveState) return;
        const tab = $('#rnd-overlay .rnd-tab.active').attr('data-tab');
        if (!tab) return;
        // When match ended/skipped, always do full render
        if (liveState.ended) {
            renderDialogTab(tab, liveState.mData);
            return;
        }
        // Report tab: append/update lines from schedule for current minute
        if (tab === 'report') {
            const entries = liveState.schedule[liveState.min] || [];
            const maxLinePerEvt = {};
            entries.forEach(e => {
                if (e.sec <= liveState.sec) {
                    if (maxLinePerEvt[e.evtIdx] === undefined || e.lineIdx > maxLinePerEvt[e.evtIdx]) {
                        maxLinePerEvt[e.evtIdx] = e.lineIdx;
                    }
                }
            });
            Object.entries(maxLinePerEvt).forEach(([eidx, lidx]) => {
                appendReportText(liveState.mData, liveState.min, Number(eidx), lidx);
            });
            return;
        }
        // Details tab: re-render only when an event just became complete (all text shown)
        if (tab === 'details') {
            if (liveState.justCompleted) renderDialogTab(tab, liveState.mData);
            return;
        }
        // Statistics tab: same — only re-render on event completion
        if (tab === 'statistics') {
            if (liveState.justCompleted) renderDialogTab(tab, liveState.mData);
            return;
        }
        // Lineups tab: re-render only when an event completes (goals, subs, etc. deferred)
        if (tab === 'lineups') {
            if (liveState.justCompleted) renderDialogTab(tab, liveState.mData);
            return;
        }
        // Other tabs: don't re-render during live
    };

    // ── Build HTML for a single report event accordion ──
    // maxLineIdx: how many individual lines to show (-1 = all)
    // hideBadges: when true, hide goal/red/sub badges (show text preview instead)
    const buildReportEventHtml = (evt, min, evtIdx, playerNames, homeId, maxLineIdx = -1, hideBadges = false) => {
        const chance = evt.chance;
        if (!chance || !chance.text) return '';

        const evtClub = String(evt.club || 0);
        const isHome = evtClub === homeId;
        const isNeutral = !evt.club || evtClub === '0';

        let headerBadges = '';
        let hasEvents = false;
        if (evt.parameters && !hideBadges) {
            evt.parameters.forEach(param => {
                if (param.goal) {
                    hasEvents = true;
                    const scorer = playerNames[param.goal.player] || '?';
                    const score = param.goal.score ? param.goal.score.join('-') : '';
                    let b = `⚽ ${scorer}`;
                    if (score) b += ` (${score})`;
                    if (param.goal.assist) b += ` <span style="font-size:11px;color:#90b878">ast. ${playerNames[param.goal.assist] || '?'}</span>`;
                    headerBadges += `<div class="rnd-report-evt-badge evt-goal">${b}</div>`;
                }
                if (param.yellow) { hasEvents = true; headerBadges += `<div class="rnd-report-evt-badge evt-yellow">🟨 ${playerNames[param.yellow] || '?'}</div>`; }
                if (param.yellow_red) { hasEvents = true; headerBadges += `<div class="rnd-report-evt-badge evt-red">🟥🟨 ${playerNames[param.yellow_red] || '?'}</div>`; }
                if (param.red) { hasEvents = true; headerBadges += `<div class="rnd-report-evt-badge evt-red">🟥 ${playerNames[param.red] || '?'}</div>`; }
                if (param.injury) {
                    hasEvents = true;
                    headerBadges += `<div class="rnd-report-evt-badge evt-injury"><span style="color:#ff3c3c;font-weight:800">✚</span> ${playerNames[param.injury] || '?'}</div>`;
                }
                if (param.sub) {
                    hasEvents = true;
                    const pIn = playerNames[param.sub.player_in] || '?';
                    const pOut = playerNames[param.sub.player_out] || '?';
                    headerBadges += `<div class="rnd-report-evt-badge evt-sub">🔄 ↑${pIn} ↓${pOut}</div>`;
                }
            });
        }

        // Build lines, respecting maxLineIdx limit (flat line count)
        const lines = [];
        let flatIdx = 0;
        chance.text.forEach((textArr) => {
            textArr.forEach(line => {
                if (!line || !line.trim()) return;
                if (maxLineIdx >= 0 && flatIdx > maxLineIdx) { flatIdx++; return; }
                let resolved = resolvePlayerTags(line, playerNames);
                resolved = resolved.replace(/\[goal\]/g, '<span class="rnd-goal-text">⚽ ');
                resolved = resolved.replace(/\[yellow\]/g, '<span class="rnd-yellow-text">🟨 ');
                resolved = resolved.replace(/\[red\]/g, '<span class="rnd-red-text">🟥 ');
                resolved = resolved.replace(/\[sub\]/g, '<span class="rnd-sub-text">🔄 ');
                resolved = resolved.replace(/\[assist\]/g, '');
                const openTags = (resolved.match(/<span class="rnd-(goal|yellow|red|sub)-text">/g) || []).length;
                for (let t = 0; t < openTags; t++) resolved += '</span>';
                lines.push(resolved);
                flatIdx++;
            });
        });

        const goalCls = headerBadges.includes('evt-goal') ? ' rnd-acc-goal' : '';
        const chevron = '<svg class="rnd-acc-chevron" viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>';
        let headerContent = headerBadges;
        if (!hasEvents) {
            const preview = lines.length ? lines[0] : '';
            headerContent = `<span style="color:#90b878;font-size:12px">${preview}</span>`;
        }

        const totalLines = countEventLines(evt);
        let html = `<div class="rnd-acc" data-acc="${min}-${evtIdx}" data-line-count="${maxLineIdx >= 0 ? maxLineIdx + 1 : totalLines}">`;
        html += `<div class="rnd-acc-head${goalCls}">`;
        html += `<div class="rnd-acc-home">${isHome ? headerContent : ''}</div>`;
        html += `<div class="rnd-acc-min">${min}'</div>`;
        html += `<div class="rnd-acc-away">${!isHome && !isNeutral ? headerContent : (isNeutral ? headerContent : '')}</div>`;
        html += chevron;
        html += `</div>`;
        html += `<div class="rnd-acc-body"><div class="rnd-report-text">${lines.join('<br>')}</div></div>`;
        html += `</div>`;
        return html;
    };

    // ── Append or update lines in the Report tab (line-level stepping) ──
    const appendReportText = (mData, curMin, curEvtIdx, curLineIdx) => {
        const container = $('#rnd-report-timeline');
        // If container doesn't exist, the Report tab hasn't been rendered yet — do full render
        if (!container.length) {
            renderDialogTab('report', mData);
            return;
        }

        const report = mData.report || {};
        const evts = report[String(curMin)] || [];
        const evt = evts[curEvtIdx];
        if (!evt || !evt.chance || !evt.chance.text) return;

        const playerNames = buildPlayerNames(mData);
        const homeId = String(mData.club.home.id);
        const key = `${curMin}-${curEvtIdx}`;
        const existing = container.find(`[data-acc="${key}"]`);

        // During live, hide badges until all lines of this event are shown
        const totalLines = countEventLines(evt);
        const isComplete = curLineIdx >= totalLines - 1;
        const hideBadges = liveState && !liveState.ended && !isComplete;

        if (existing.length) {
            // Event accordion already exists — update with one more line
            const oldCount = Number(existing.attr('data-line-count') || 0);
            if (curLineIdx < oldCount) return;  // already shown this line
            // Re-build the accordion with updated line count
            const newHtml = buildReportEventHtml(evt, curMin, curEvtIdx, playerNames, homeId, curLineIdx, hideBadges);
            if (!newHtml) return;
            const wasOpen = existing.hasClass('open');
            const $new = $(newHtml);
            if (wasOpen) $new.addClass('open');
            existing.replaceWith($new);
        } else {
            // New event — collapse all other accordions, then append with auto-open
            container.find('.rnd-acc.open').removeClass('open');
            const evtHtml = buildReportEventHtml(evt, curMin, curEvtIdx, playerNames, homeId, curLineIdx, hideBadges);
            if (!evtHtml) return;
            const $el = $(evtHtml).addClass('rnd-live-feed-line open');
            container.append($el);
        }

        // Auto-scroll the dialog body to show the latest content
        const dlgBody = $('#rnd-dlg-body');
        dlgBody.animate({ scrollTop: dlgBody[0].scrollHeight }, 300);
    };

    // ── Advance one second in the live replay ──
    const liveStep = () => {
        if (!liveState || !liveState.playing) return;

        // ── LIVE mode: wall-clock driven ticking ──
        if (liveState.filterMode === 'live') {
            const kickoff = liveState.liveKickoff;
            if (!kickoff) return;
            const info = calculateLiveMinute(kickoff);
            const lastMin = liveState.mData.match_data.last_min || 90;
            if (!info || info.minute > lastMin) {
                // Match ended
                liveState.min = lastMin; liveState.sec = 59;
                liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
                liveState.ended = true; liveState.playing = false;
                liveState.liveIsHT = false;
                updateLiveHeader(); refreshActiveTab();
                return;
            }
            const prevMin = liveState.min;
            liveState.min = info.minute;
            liveState.sec = info.second;
            liveState.liveIsHT = info.isHT;
            if (info.isHT) {
                // Halftime — all first-half events visible, just tick clock
                liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
                liveState.curEvtComplete = true;
                updateLiveHeader();
                liveState.timer = setTimeout(liveStep, liveState.speed);
                return;
            }
            // If Unity clips are playing for this minute, just tick the clock
            if (unityState.activeMinute === liveState.min) {
                updateLiveHeader();
                liveState.timer = setTimeout(liveStep, liveState.speed);
                return;
            }
            // Show all events up to current minute
            liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
            liveState.curEvtComplete = true;
            const minuteChanged = liveState.min !== prevMin;
            liveState.justCompleted = minuteChanged;
            // Load Unity clips when entering a new event minute
            if (minuteChanged && unityState.available && unityState.ready) {
                const hasClips = loadUnityClips(liveState.min, liveState.mData);
                if (hasClips) {
                    // Clips loaded — animation will play, text driven by stargate callbacks
                    updateLiveHeader();
                    refreshActiveTab();
                    liveState.timer = setTimeout(liveStep, liveState.speed);
                    return;
                }
            }
            updateLiveHeader();
            if (minuteChanged) refreshActiveTab();
            liveState.timer = setTimeout(liveStep, liveState.speed);
            return;
        }

        liveState.sec++;

        // ── If Unity clips are active for this minute, just tick the clock ──
        if (unityState.activeMinute === liveState.min) {
            // Clock advances, but text is driven by stargate callbacks (advanceClipText)
            // Don't process schedule, don't advance minute — wait for finished_playing
            updateLiveHeader();
            liveState.timer = setTimeout(liveStep, liveState.speed);
            return;
        }

        // Check if current minute is finished (past last line + delay, or >= 60)
        const entries = liveState.schedule[liveState.min] || [];
        const lastSec = entries.length > 0 ? entries[entries.length - 1].sec : -1;
        const minuteEnd = lastSec + POST_DELAY;

        if (liveState.sec > minuteEnd || liveState.sec >= 60) {
            // Move to next event minute
            const nextIdx = liveState.eventMinIdx + 1;
            if (nextIdx >= liveState.eventMinList.length) {
                // Match finished
                liveState.min = liveState.maxMin;
                liveState.sec = 59;
                liveState.curEvtIdx = 999;
                liveState.curLineIdx = 999;
                liveState.playing = false;
                liveState.ended = true;
                updateLiveHeader();
                refreshActiveTab();
                return;
            }
            liveState.eventMinIdx = nextIdx;
            liveState.min = liveState.eventMinList[nextIdx];
            liveState.sec = 0;
            // Reset event tracking to prevent score from briefly showing future goals
            liveState.curEvtIdx = -1;
            liveState.curEvtComplete = false;

            // ── Unity 3D: trigger clip loading when entering a new minute with videos ──
            if (unityState.available && unityState.ready) {
                const hasClips = loadUnityClips(liveState.min, liveState.mData);
                if (hasClips) {
                    // Timer keeps running — clock ticks, text driven by clip callbacks
                    updateLiveHeader();
                    liveState.timer = setTimeout(liveStep, liveState.speed);
                    return;
                }
            }
        }

        // Check schedule for new lines at current second (non-clip minutes only)
        let hasNew = false;
        liveState.justCompleted = false;
        const curEntries = liveState.schedule[liveState.min] || [];
        const report = liveState.mData.report || {};
        const evts = report[String(liveState.min)] || [];
        curEntries.forEach(entry => {
            if (entry.sec === liveState.sec) {
                liveState.curEvtIdx = entry.evtIdx;
                liveState.curLineIdx = entry.lineIdx;
                hasNew = true;
                // Check if event just became complete (all text lines shown)
                const evt = evts[entry.evtIdx];
                const total = evt ? countEventLines(evt) : 1;
                const isComplete = entry.lineIdx >= total - 1;
                liveState.curEvtComplete = isComplete;
                if (isComplete) liveState.justCompleted = true;
            }
        });

        updateLiveHeader();
        if (hasNew) refreshActiveTab();
        liveState.timer = setTimeout(liveStep, liveState.speed);
    };

    const livePlay = () => {
        if (!liveState || liveState.ended) return;
        liveState.playing = true;
        $('#rnd-live-play-head').html('⏸');
        // If Unity was paused mid-animation, unpause it
        if (unityState.activeMinute !== null) {
            const uw = getUW();
            if (uw.gameInstance) {
                uw.gameInstance.SendMessage('ClipsViewerScript', 'OnPauseGame');
            }
        }
        liveStep();
    };
    const livePause = () => {
        if (!liveState) return;
        liveState.playing = false;
        clearTimeout(liveState.timer);
        $('#rnd-live-play-head').html('▶');
        // Immediately pause Unity animation if playing
        if (unityState.playing && unityState.activeMinute !== null) {
            const uw = getUW();
            if (uw.gameInstance) {
                uw.gameInstance.SendMessage('ClipsViewerScript', 'OnPauseGame');
            }
        }
    };
    const liveToggle = () => {
        if (!liveState) return;
        if (liveState.playing) livePause(); else livePlay();
    };

    // Apply a deferred or immediate filter mode switch (All ↔ Key ↔ Live)
    const applyFilterSwitch = (mode) => {
        if (!liveState) return;
        // LIVE mode: switch to all-events schedule and jump to current wall-clock minute
        if (mode === 'live') {
            const sch = liveState.scheduleAll;
            liveState.schedule = sch.schedule;
            liveState.eventMinList = sch.eventMinList;
            liveState.maxMin = sch.eventMinList.length ? sch.eventMinList[sch.eventMinList.length - 1] : 90;
            let kickoff = liveState.liveKickoff;
            if (!kickoff && isMatchCurrentlyLive(liveState.mData)) {
                kickoff = deriveKickoff(liveState.mData);
                liveState.liveKickoff = kickoff;
            }
            const info = kickoff ? calculateLiveMinute(kickoff) : null;
            const lastMin = liveState.mData.match_data.last_min || 90;
            if (info && info.minute <= lastMin) {
                liveState.min = info.minute;
                liveState.sec = info.second;
                liveState.liveIsHT = info.isHT;
                liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
                liveState.curEvtComplete = true; liveState.justCompleted = true;
                liveState.ended = false;
            } else {
                // Match over
                liveState.min = lastMin; liveState.sec = 59;
                liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
                liveState.ended = true; liveState.playing = false;
                liveState.liveIsHT = false;
            }
            liveState.pendingFilterSwitch = null;
            console.log('[RND] Filter switch applied: live (min ' + liveState.min + ')');
            updateLiveHeader(); refreshActiveTab();
            return;
        }
        liveState.liveIsHT = false;
        const sch = mode === 'key' ? liveState.scheduleKey : liveState.scheduleAll;
        liveState.schedule = sch.schedule;
        liveState.eventMinList = sch.eventMinList;
        liveState.maxMin = sch.eventMinList.length ? sch.eventMinList[sch.eventMinList.length - 1] : 90;
        // Find next event minute AFTER current (don't re-play the minute we just finished)
        const curMin = liveState.min;
        let newIdx = sch.eventMinList.findIndex(m => m > curMin);
        if (newIdx < 0) {
            // No more minutes — match finished
            liveState.min = liveState.maxMin;
            liveState.sec = 59;
            liveState.curEvtIdx = 999;
            liveState.curLineIdx = 999;
            liveState.playing = false;
            liveState.ended = true;
            liveState.pendingFilterSwitch = null;
            updateLiveHeader();
            refreshActiveTab();
            return;
        }
        liveState.eventMinIdx = newIdx;
        liveState.min = sch.eventMinList[newIdx];
        liveState.sec = -1;
        liveState.curEvtIdx = -1;
        liveState.curLineIdx = -1;
        liveState.curEvtComplete = true;
        liveState.justCompleted = false;
        liveState.pendingFilterSwitch = null;
        console.log('[RND] Filter switch applied: ' + mode);
        // Load Unity clips for the new minute (so animation + clip-driven text work)
        if (unityState.available && unityState.ready) {
            loadUnityClips(liveState.min, liveState.mData);
        }
        updateLiveHeader();
        refreshActiveTab();
    };

    const liveSkip = () => {
        if (!liveState) return;
        livePause();
        liveState.min = liveState.maxMin;
        liveState.sec = 59;
        liveState.curEvtIdx = 999;
        liveState.curLineIdx = 999;
        liveState.eventMinIdx = liveState.eventMinList.length;
        liveState.ended = true;
        updateLiveHeader();
        refreshActiveTab();
    };

    const openMatchDialog = (matchId) => {
        const cached = roundMatchCache.get(String(matchId));
        // If not cached yet, fetch on-demand
        const show = (mData) => {
            // Determine if this match is in the future
            const matchIsFuture = isMatchFuture(mData);

            // Determine if match is currently live
            const matchIsLive = !matchIsFuture && isMatchCurrentlyLive(mData);

            // Build schedules & live state only for non-future matches
            if (!matchIsFuture) {
                const rpt = mData.report || {};
                const allSch = buildSchedule(rpt, false);
                const keySch = buildSchedule(rpt, true);
                const { schedule: keySchedule, eventMinList: keyEventMinList } = keySch;
                const maxMin = keyEventMinList.length ? keyEventMinList[keyEventMinList.length - 1] : 90;

                if (liveState && liveState.timer) clearTimeout(liveState.timer);
                if (matchIsLive) {
                    const { schedule: allSchedule, eventMinList: allEventMinList } = allSch;
                    const allMaxMin = allEventMinList.length ? allEventMinList[allEventMinList.length - 1] : 90;
                    const effectiveKickoff = deriveKickoff(mData);
                    const info = calculateLiveMinute(effectiveKickoff);
                    const lastMin = mData.match_data.last_min || 90;
                    const liveMin = info ? Math.min(info.minute, lastMin) : Math.floor(mData.match_data.live_min);
                    const liveSec = info ? info.second : 0;
                    const liveHT = info ? info.isHT : false;
                    console.log('[RND] LIVE detected — live_min:', mData.match_data.live_min, '→ min:', liveMin, 'sec:', liveSec, 'HT:', liveHT);
                    liveState = {
                        min: liveMin, sec: liveSec,
                        curEvtIdx: 999, curLineIdx: 999,
                        curEvtComplete: true, justCompleted: false,
                        playing: false, timer: null, mData,
                        speed: 1000, maxMin: allMaxMin,
                        ended: info ? info.minute > lastMin : false,
                        schedule: allSchedule, eventMinList: allEventMinList, eventMinIdx: 0,
                        filterMode: 'live', liveIsHT: liveHT,
                        liveKickoff: effectiveKickoff,
                        scheduleAll: allSch, scheduleKey: keySch
                    };
                } else {
                    liveState = {
                        min: keyEventMinList.length ? keyEventMinList[0] : 0,
                        sec: -1,
                        curEvtIdx: -1, curLineIdx: -1,
                        curEvtComplete: true, justCompleted: false,
                        playing: false, timer: null, mData,
                        speed: 1000, maxMin, ended: false,
                        schedule: keySchedule, eventMinList: keyEventMinList, eventMinIdx: 0,
                        filterMode: 'key', liveIsHT: false,
                        liveKickoff: null,
                        scheduleAll: allSch, scheduleKey: keySch
                    };
                }
            } else {
                // Future match: no live state needed
                if (liveState && liveState.timer) clearTimeout(liveState.timer);
                liveState = null;
            }

            // Build dialog overlay
            const overlay = window.TmMatchDialog.build(mData, matchIsFuture, matchIsLive);

            $('body').append(overlay).css('overflow', 'hidden');

            const closeDialog = () => {
                if (liveState && liveState.timer) clearTimeout(liveState.timer);
                liveState = null;
                if (prematchTimer) { clearTimeout(prematchTimer); prematchTimer = null; }
                overlay.remove();
                $('body').css('overflow', '');
            };

            // Close handlers
            overlay.on('click', '#rnd-dlg-close', closeDialog);
            overlay.on('click', (e) => { if (e.target === overlay[0]) closeDialog(); });
            $(document).one('keydown.rndDlg', (e) => {
                if (e.key === 'Escape') { closeDialog(); $(document).off('keydown.rndDlg'); }
            });

            // Live replay controls & filters (skip for future matches)
            if (!matchIsFuture) {
                overlay.on('click', '#rnd-live-play-head', liveToggle);
                overlay.on('click', '#rnd-live-skip-head', liveSkip);
                overlay.on('click', '.rnd-live-filter-btn', function () {
                    const mode = $(this).data('filter');
                    if (!liveState || liveState.filterMode === mode) return;
                    liveState.filterMode = mode;
                    overlay.find('.rnd-live-filter-btn').removeClass('active');
                    $(this).addClass('active');
                    if (unityState.activeMinute !== null || unityState.playing) {
                        liveState.pendingFilterSwitch = mode;
                        console.log('[RND] Filter switch deferred until animation finishes');
                        return;
                    }
                    applyFilterSwitch(mode);
                });
            }

            // Tab switching
            overlay.on('click', '.rnd-tab', function () {
                overlay.find('.rnd-tab').removeClass('active');
                $(this).addClass('active');
                renderDialogTab($(this).attr('data-tab'), mData);
            });

            // Render default tab + start live replay
            // Add rnd-live-active class to header when live
            if (!matchIsFuture) {
                $('#rnd-overlay .rnd-dlg-head').addClass('rnd-live-active');
            }
            renderDialogTab('lineups', mData);
            if (!matchIsFuture) {
                updateLiveHeader();
                setTimeout(() => livePlay(), 500);
            } else {
                // Schedule auto-reload when match kicks off
                const lm = mData.match_data?.live_min;
                if (typeof lm === 'number' && lm < 0) {
                    const msUntilKickoff = Math.abs(lm) * 60 * 1000 + 5000; // +5s buffer
                    if (prematchTimer) clearTimeout(prematchTimer);
                    prematchTimer = setTimeout(() => {
                        prematchTimer = null;
                        // Close current dialog, clear cache, re-open with fresh data
                        closeDialog();
                        roundMatchCache.delete(String(matchId));
                        openMatchDialog(matchId);
                    }, msUntilKickoff);
                    console.log('[RND] Prematch timer set — auto-reload in', Math.round(msUntilKickoff / 1000), 'seconds');
                }
            }


        };

        if (cached && cached.data) {
            show(cached.data);
        } else {
            // Fetch match data on demand
            window.TmApi.fetchMatch(matchId).then(mData => { if (mData) show(mData); });
        }
    };

    const renderDialogTab = (tab, mData) => {
        // Save Unity canvas before destroying lineups tab DOM
        // Skip for lineups — it handles in-place updates without destroying viewport
        if (tab !== 'lineups') saveUnityCanvas();
        const body = $('#rnd-dlg-body');
        const curMin = liveState ? liveState.min : 999;
        const curEvtIdx = liveState ? liveState.curEvtIdx : 999;
        // For tabs showing parameters (goals/subs/reds), defer until event text is complete
        const paramEvtIdx = (liveState && !liveState.ended && !liveState.curEvtComplete) ? curEvtIdx - 1 : curEvtIdx;
        const matchEnded = !liveState || liveState.ended;
        const sharedOpts = {
            getLiveState: () => liveState,
            getUnityState: () => unityState,
            isMatchPage: true,
            moveUnityCanvas, saveUnityCanvas, updateUnityStats,
            computeActiveRoster, isMatchFuture, isEventVisible,
            getPlayerData,
            fetchTooltip, parseNum, getColor,
            REC_THRESHOLDS,
            buildPlayerNames, buildReportEventHtml, resolvePlayerTags,
        };
        const statsOpts = { liveState, isEventVisible, buildPlayerNames, buildReportEventHtml, matchEnded };
        switch (tab) {
            case 'details': renderDetailsTab(body, mData, curMin, paramEvtIdx); break;
            case 'statistics': TmMatchStatistics.render(body, mData, curMin, paramEvtIdx, statsOpts); break;
            case 'report': renderReportTab(body, mData, curMin, curEvtIdx); break;
            case 'lineups': TmMatchLineups.render(body, mData, curMin, paramEvtIdx, sharedOpts); break;
            case 'venue': TmMatchVenue.render(body, mData); break;
            case 'h2h': TmMatchH2H.render(body, mData); break;
            case 'league': TmMatchLeague.render(body, mData, curMin, paramEvtIdx); break;
            case 'analysis': TmMatchAnalysis.render(body, mData, { getPlayerData }); break;
        }
    };

    // ── Helper: build player name lookup ──
    const buildPlayerNames = (mData) => {
        const names = {};
        ['home', 'away'].forEach(side => {
            Object.values(mData.lineup[side]).forEach(p => {
                names[p.player_id] = p.nameLast || p.name;
            });
        });
        return names;
    };

    // ── Helper: resolve [player=ID] tags in text ──
    const resolvePlayerTags = (text, playerNames) => {
        return text.replace(/\[player=(\d+)\]/g, (_, id) => {
            const name = playerNames[id] || id;
            return `<span class="rnd-player-name">${name}</span>`;
        });
    };

    const renderDetailsTab = (body, mData, curMin = 999, curEvtIdx = 999) => {
        const playerNames = buildPlayerNames(mData);
        const homeIds = new Set(Object.keys(mData.lineup.home));
        const homeId = String(mData.club.home.id);

        let html = '<div style="max-width:900px;margin:0 auto">';

        // ── Parse key events from report (filtered by current step) ──
        const events = [];
        const report = mData.report || {};
        Object.keys(report).sort((a, b) => Number(a) - Number(b)).forEach(minKey => {
            const min = Number(minKey);
            report[minKey].forEach((evt, si) => {
                if (!isEventVisible(min, si, curMin, curEvtIdx)) return;
                if (!evt.parameters) return;
                evt.parameters.forEach(param => {
                    if (param.goal) {
                        events.push({
                            min, type: 'goal',
                            isHome: String(evt.club) === homeId,
                            player: playerNames[param.goal.player] || '?',
                            assist: param.goal.assist ? (playerNames[param.goal.assist] || null) : null
                        });
                    }
                    if (param.yellow) {
                        events.push({
                            min, type: 'yellow',
                            isHome: homeIds.has(String(param.yellow)),
                            player: playerNames[param.yellow] || '?'
                        });
                    }
                    if (param.yellow_red) {
                        events.push({
                            min, type: 'yellowred',
                            isHome: homeIds.has(String(param.yellow_red)),
                            player: playerNames[param.yellow_red] || '?'
                        });
                    }
                    if (param.sub) {
                        const isHome = homeIds.has(String(param.sub.player_in)) || homeIds.has(String(param.sub.player_out));
                        events.push({
                            min, type: 'sub', isHome,
                            playerIn: playerNames[param.sub.player_in] || '?',
                            playerOut: playerNames[param.sub.player_out] || '?'
                        });
                    }
                    if (param.injury) {
                        const pid = String(param.injury);
                        events.push({
                            min, type: 'injury',
                            isHome: homeIds.has(pid),
                            player: playerNames[pid] || '?'
                        });
                    }
                });
            });
        });

        // ── Build event text (icon placement depends on side) ──
        const evtText = (evt, side) => {
            const icons = { goal: '⚽', yellow: '🟨', yellowred: '🟥', sub: '🔄', injury: '<span style="color:#ff3c3c;font-weight:800">✚</span>' };
            const icon = icons[evt.type];
            let text = '';
            if (evt.type === 'goal') {
                text = `<strong style="color:#f0fce0">${evt.player}</strong>`;
                if (evt.assist) text += ` <span style="color:#90b878;font-size:11px">(${evt.assist})</span>`;
            } else if (evt.type === 'sub') {
                text = `<span style="color:#80d848">↑ ${evt.playerIn}</span>  <span style="color:#c07050">↓ ${evt.playerOut}</span>`;
            } else if (evt.type === 'injury') {
                text = `<span style="color:#ff8c3c">${evt.player}</span>`;
            } else {
                text = evt.player;
            }
            return side === 'home' ? `${text} ${icon}` : `${icon} ${text}`;
        };

        // ── Render timeline ──
        html += '<div class="rnd-timeline">';
        events.forEach(evt => {
            const cls = evt.type === 'goal' ? ' rnd-tl-goal' : '';
            html += `<div class="rnd-tl-row${cls}">`;
            html += `<div class="rnd-tl-home">${evt.isHome ? evtText(evt, 'home') : ''}</div>`;
            html += `<div class="rnd-tl-min">${evt.min}'</div>`;
            html += `<div class="rnd-tl-away">${!evt.isHome ? evtText(evt, 'away') : ''}</div>`;
            html += `</div>`;
        });
        html += '</div></div>';

        body.html(html);
    };

    const renderReportTab = (body, mData, curMin = 999, curEvtIdx = 999) => {
        const playerNames = buildPlayerNames(mData);
        const homeId = String(mData.club.home.id);
        const report = mData.report || {};
        const allMinutes = Object.keys(report).sort((a, b) => Number(a) - Number(b));

        let html = '<div style="max-width:900px;margin:0 auto"><div id="rnd-report-timeline" class="rnd-timeline">';

        allMinutes.forEach(minKey => {
            const min = Number(minKey);
            report[minKey].forEach((evt, evtIdx) => {
                if (!isEventVisible(min, evtIdx, curMin, curEvtIdx)) return;
                html += buildReportEventHtml(evt, min, evtIdx, playerNames, homeId);
            });
        });

        html += '</div></div>';
        body.html(html);

        // Accordion toggle (delegated)
        body.off('click.rndacc').on('click.rndacc', '.rnd-acc-head', function () {
            $(this).closest('.rnd-acc').toggleClass('open');
        });
    };

    // ─── Loading indicator ───────────────────────────────────────────────
    const cleanupPage = () => {
        if (liveState && liveState.timer) clearTimeout(liveState.timer);
        liveState = null;
        $('#rnd-overlay').remove();
        $('body').css('overflow', '');
        unityState = {
            available: false, ready: false, playing: false,
            pendingMinute: null, loadedMinutes: [], playedMinutes: [],
            canvasParent: null, tmPaused: false,
            clipTextQueue: [], clipTextCursor: 0,
            clipTextGroups: [], clipGroupCursor: 0,
            clipPostQueue: [], activeMinute: null,
            clipFirstShown: false, clipSkippedFirst: false
        };
    };

    const initForCurrentPage = () => {
        cleanupPage();
        injectStyles();
        initUnity();
        const matchId = window.location.pathname.match(/\/matches\/(\d+)/)?.[1];
        if (!matchId) return;
        // Remove TM's default Rounds widget and ad placeholder
        try { $('.banner_placeholder.rectangle')[0].parentNode.removeChild($('.banner_placeholder.rectangle')[0]); } catch (e) { }
        try { $('.column3_a .box').has('h2').filter(function () { return $(this).find('h2').text().trim().toUpperCase() === 'ROUNDS'; }).remove(); } catch (e) { }
        const pollInterval = setInterval(() => {
            if ($('body').length && document.readyState !== 'loading') {
                clearInterval(pollInterval);
                openMatchDialog(matchId);
            }
        }, 500);
    };

    initForCurrentPage();
})();
}
