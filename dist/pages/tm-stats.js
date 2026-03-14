
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



// ─── components/stats/tm-stats-styles.js ────────────────────

(function () {
    'use strict';

    window.TmStatsStyles = {
        inject() {
            if (document.getElementById('tsa-stats-style')) return;
            const style = document.createElement('style');
            style.id = 'tsa-stats-style';
            style.textContent = `
            .column2_a {
                width: 1100px !important;
            }
            .main_center {
                width: 1300px !important;
            }
            .tsa-wrap {
                background: #1c3410; border-radius: 8px;
                border: 1px solid #3d6828; overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                color: #c8e0b4; margin-bottom: 16px;
            }
            .tsa-header {
                background: linear-gradient(180deg, #162e0e 0%, #1c3a14 50%, #152c0d 100%);
                padding: 16px 20px 10px;
                border-bottom: 2px solid rgba(80,160,48,.2);
                text-align: center;
            }
            .tsa-title {
                font-size: 16px; font-weight: 800; color: #e8f5d8;
                letter-spacing: 0.5px; margin-bottom: 4px;
            }
            .tsa-subtitle {
                font-size: 11px; color: #6a9a58; letter-spacing: 0.5px;
            }
            .tsa-tabs {
                display: flex; background: #274a18;
                border-bottom: 1px solid #3d6828;
            }
            .tsa-tab {
                flex: 1; padding: 8px 12px; text-align: center;
                font-size: 12px; font-weight: 600; text-transform: uppercase;
                letter-spacing: 0.5px; color: #90b878; cursor: pointer;
                border-bottom: 2px solid transparent; transition: all 0.15s;
            }
            .tsa-tab:hover { color: #c8e0b4; background: #305820; }
            .tsa-tab.active { color: #e8f5d8; border-bottom-color: #6cc040; background: #305820; }
            .tsa-body {
                padding: 10px 14px 16px; font-size: 13px;
                overflow-y: auto;
            }
            .tsa-progress {
                font-size: 11px; color: #5a7a48; margin-top: 6px;
            }

            /* ── Filter buttons ── */
            .tsa-filters {
                display: flex; gap: 4px; justify-content: center;
                margin-bottom: 12px;
            }
            .tsa-filter-btn {
                background: rgba(42,74,28,.4); border: 1px solid #2a4a1c;
                border-radius: 6px; padding: 4px 14px;
                font-size: 11px; font-weight: 600; color: #8aac72;
                cursor: pointer; transition: all 0.15s;
                text-transform: uppercase; letter-spacing: 0.4px;
            }
            .tsa-filter-btn:hover { background: rgba(42,74,28,.7); color: #c8e0b4; }
            .tsa-filter-btn.active {
                background: #4a9030; border-color: #6cc040;
                color: #e8f5d8; box-shadow: 0 0 8px rgba(108,192,64,.2);
            }

            /* ── Player sub-tab buttons ── */
            .tsa-subtabs {
                display: flex; gap: 4px; justify-content: center;
                margin-bottom: 12px;
            }
            .tsa-subtab-btn {
                background: rgba(42,74,28,.3); border: 1px solid #2a4a1c;
                border-radius: 8px; padding: 5px 18px;
                font-size: 11px; font-weight: 700; color: #7aaa60;
                cursor: pointer; transition: all 0.15s;
                text-transform: uppercase; letter-spacing: 0.5px;
            }
            .tsa-subtab-btn:hover { background: rgba(42,74,28,.6); color: #c8e0b4; }
            .tsa-subtab-btn.active {
                background: rgba(74,144,48,.35); border-color: #5aaa40;
                color: #e8f5d8; box-shadow: 0 0 10px rgba(108,192,64,.15);
            }

            /* ── Match type filter ── */
            .tsa-match-filters {
                display: flex; gap: 4px; justify-content: center;
                margin-bottom: 10px; flex-wrap: wrap;
            }
            .tsa-mf-btn {
                background: rgba(42,74,28,.3); border: 1px solid #2a4a1c;
                border-radius: 12px; padding: 3px 10px;
                font-size: 10px; font-weight: 600; color: #6a9a58;
                cursor: pointer; transition: all 0.15s;
                white-space: nowrap;
            }
            .tsa-mf-btn:hover { background: rgba(42,74,28,.6); color: #c8e0b4; }
            .tsa-mf-btn.active {
                background: rgba(74,144,48,.3); border-color: #4a9030;
                color: #c8e0b4;
            }

            /* ── Tactic dropdown filters ── */
            .tsa-tactic-row {
                display: flex; align-items: center; gap: 6px;
                margin-bottom: 6px; flex-wrap: wrap; justify-content: center;
            }
            .tsa-tactic-row:last-child { margin-bottom: 10px; }
            .tsa-tr-label {
                font-size: 9px; font-weight: 700; color: #5a8a48;
                text-transform: uppercase; letter-spacing: 0.6px;
                min-width: 28px;
            }
            .tsa-dd-wrap {
                position: relative; display: inline-block;
            }
            .tsa-dd-btn {
                background: rgba(42,74,28,.35); border: 1px solid #2a4a1c;
                border-radius: 6px; padding: 3px 8px;
                font-size: 10px; font-weight: 600; color: #8aac72;
                cursor: pointer; transition: all 0.15s;
                white-space: nowrap; display: flex; align-items: center; gap: 4px;
                user-select: none; min-width: 60px;
            }
            .tsa-dd-btn:hover { background: rgba(42,74,28,.6); color: #c8e0b4; }
            .tsa-dd-btn.has-filter {
                background: rgba(74,144,48,.25); border-color: #4a9030;
                color: #c8e0b4;
            }
            .tsa-dd-btn .tsa-dd-arrow {
                font-size: 8px; opacity: 0.6; margin-left: auto;
            }
            .tsa-dd-btn .tsa-dd-icon {
                font-size: 11px; line-height: 1;
            }
            .tsa-dd-panel {
                display: none; position: absolute; top: calc(100% + 3px); left: 0;
                min-width: 160px; max-height: 240px; overflow-y: auto;
                background: #1a3210; border: 1px solid #3d6828;
                border-radius: 6px; box-shadow: 0 6px 20px rgba(0,0,0,.5);
                z-index: 100; padding: 4px 0;
            }
            .tsa-dd-panel.open { display: block; }
            .tsa-dd-panel.align-right { left: auto; right: 0; }
            .tsa-dd-opt {
                padding: 5px 10px; font-size: 10px; font-weight: 600;
                color: #8aac72; cursor: pointer; display: flex;
                align-items: center; gap: 6px; transition: background 0.1s;
                white-space: nowrap;
            }
            .tsa-dd-opt:hover { background: rgba(74,144,48,.2); color: #c8e0b4; }
            .tsa-dd-opt .tsa-dd-check {
                width: 14px; height: 14px; border-radius: 3px;
                border: 1px solid #3d6828; background: rgba(42,74,28,.3);
                display: flex; align-items: center; justify-content: center;
                font-size: 10px; color: #6cc040; flex-shrink: 0;
            }
            .tsa-dd-opt.selected .tsa-dd-check {
                background: rgba(74,144,48,.4); border-color: #6cc040;
            }
            .tsa-dd-opt .tsa-dd-cnt {
                font-size: 9px; opacity: 0.5; margin-left: auto;
            }
            .tsa-dd-opt.tsa-dd-all {
                border-bottom: 1px solid rgba(61,104,40,.4);
                margin-bottom: 2px; padding-bottom: 6px;
                color: #6a9a58;
            }
            .tsa-dd-opt.tsa-dd-all.selected { color: #c8e0b4; }
            .tsa-dd-tags {
                display: flex; gap: 2px; flex-wrap: wrap; max-width: 120px;
            }
            .tsa-dd-tag {
                background: rgba(74,144,48,.3); border-radius: 3px;
                padding: 0 4px; font-size: 9px; color: #c8e0b4;
                line-height: 1.5;
            }

            /* ── Tables ── */
            .tsa-table {
                width: 100%; border-collapse: collapse; font-size: 11px;
            }
            .tsa-table th {
                padding: 6px 6px; font-size: 10px; font-weight: 700;
                color: #6a9a58; text-transform: uppercase; letter-spacing: 0.4px;
                border-bottom: 1px solid #2a4a1c; text-align: center;
                cursor: pointer; user-select: none; white-space: nowrap;
                transition: color 0.15s;
            }
            .tsa-table th:hover { color: #c8e0b4; }
            .tsa-table th.sorted-asc::after { content: ' ▲'; font-size: 8px; }
            .tsa-table th.sorted-desc::after { content: ' ▼'; font-size: 8px; }
            
            .tsa-table td {
                padding: 5px 6px; text-align: center;
                border-bottom: 1px solid rgba(42,74,28,.4);
                font-variant-numeric: tabular-nums;
            }
            .tsa-table td:first-child {
                text-align: left; font-weight: 600; color: #c8e0b4;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 140px;
            }
            .tsa-table tr:hover { background: rgba(255,255,255,.03); }
            .tsa-table td.zero { color: #4a6a3a; }
            .tsa-table td.good { color: #80e048; font-weight: 700; }
            .tsa-table td.warn { color: #c87848; }
            .tsa-table td.top1 { color: #ffd700; font-weight: 800; text-shadow: 0 0 6px rgba(255,215,0,.3); }
            .tsa-table td.top2 { color: #c0c0c0; font-weight: 700; }
            .tsa-table td.top3 { color: #cd7f32; font-weight: 700; }
            .tsa-table tr.tsa-total-row td {
                font-weight: 800; border-top: 2px solid #3d6828;
                color: #e0f0cc;
            }
            .tsa-table tr.tsa-total-row td:first-child { color: #8aac72; }

            /* ── Column group borders ── */
            .tsa-table th.col-group-start,
            .tsa-table td.col-group-start {
                border-left: 1px solid #3d6828;
            }
            /* ── Column group header rows ── */
            .tsa-table tr.tsa-super-row th {
                font-size: 9px; padding: 2px 6px; color: #7ab85c;
                text-transform: uppercase; letter-spacing: 0.6px;
                border-bottom: none; cursor: default;
                font-weight: 700;
            }
            .tsa-table tr.tsa-super-row th:hover { color: #7ab85c; }
            .tsa-table tr.tsa-group-row th {
                font-size: 9px; padding: 2px 6px; color: #5a8a48;
                text-transform: uppercase; letter-spacing: 0.6px;
                border-bottom: none; cursor: default;
                font-weight: 600;
            }
            .tsa-table tr.tsa-group-row th:hover { color: #5a8a48; }

            /* ── Position badge ── */
            .tsa-pos {
                display: inline-block; font-size: 9px; font-weight: 700;
                padding: 1px 4px; border-radius: 3px; margin-right: 4px;
                text-transform: uppercase; letter-spacing: 0.3px;
                min-width: 22px; text-align: center;
            }
            .tsa-pos-gk { background: #8b6914; color: #ffd700; }
            .tsa-pos-def { background: #1a4a8a; color: #7ab8ff; }
            .tsa-pos-mid { background: #2a6a2a; color: #80e048; }
            .tsa-pos-att { background: #8a2a2a; color: #ff7a7a; }

            /* ── Match filter W-D-L ── */
            .tsa-mf-wdl {
                font-size: 9px; margin-left: 3px; opacity: 0.7;
            }

            /* ── Team tab bar stats ── */
            .tsa-stat-row {
                padding: 8px 0;
            }
            .tsa-stat-header {
                display: flex; align-items: baseline; justify-content: space-between;
                margin-bottom: 4px;
            }
            .tsa-stat-val {
                font-weight: 800; font-size: 14px; min-width: 30px;
                font-variant-numeric: tabular-nums;
            }
            .tsa-stat-val.for { text-align: left; color: #80e048; }
            .tsa-stat-val.against { text-align: right; color: #5ba8f0; }
            .tsa-stat-val.leading { font-size: 16px; }
            .tsa-stat-label {
                font-weight: 600; color: #8aac72; font-size: 11px;
                text-transform: uppercase; letter-spacing: 0.8px;
            }
            .tsa-stat-bar-wrap {
                display: flex; height: 6px; border-radius: 3px;
                overflow: hidden; background: rgba(0,0,0,.18); gap: 2px;
            }
            .tsa-stat-seg {
                border-radius: 3px; transition: width 0.5s; min-width: 3px;
            }
            .tsa-stat-seg.for { background: linear-gradient(90deg, #4a9030, #6cc048); }
            .tsa-stat-seg.against { background: linear-gradient(90deg, #3a7ab8, #5b9bff); }
            .tsa-stat-divider {
                height: 1px; margin: 0;
                background: linear-gradient(90deg, transparent, #3d6828 20%, #3d6828 80%, transparent);
            }

            /* ── Section titles ── */
            .tsa-section-title {
                text-align: center; font-size: 11px; font-weight: 700;
                color: #8aac72; text-transform: uppercase; letter-spacing: 1.2px;
                margin: 14px 0 8px; padding-top: 10px;
                border-top: 1px solid #3d6828;
            }
            .tsa-section-title:first-child { border-top: none; margin-top: 0; }

            /* ── Adv-table span colors (TmUI-rendered) ── */
            .tsa-wrap .tmu-tbl span.adv-zero { color: #3a5a2a; }
            .tsa-wrap .tmu-tbl span.adv-goal { color: #80e048; font-weight: 700; }
            .tsa-wrap .tmu-tbl span.adv-shot { color: #c8d868; }
            .tsa-wrap .tmu-tbl span.adv-lost { color: #c87848; }
            .tsa-wrap .tmu-tbl tr.tsa-adv-total td {
                font-weight: 800; border-top: 1px solid #3d6828; color: #e0f0cc;
            }
            .tsa-wrap .tmu-tbl tr.tsa-adv-total td:first-child { color: #8aac72; }

            /* ── Rating colors ── */
            .tsa-rat { font-weight: 700; }

            /* ── Player name link ── */
            .tsa-plr-link {
                color: #c8e0b4; text-decoration: none; font-weight: 600;
                transition: color 0.15s;
            }
            .tsa-plr-link:hover { color: #80e048; text-decoration: underline; }

            /* ── Percentage cells ── */
            .tsa-pct { color: #8ab878; font-size: 11px; font-style: italic; }

            /* ── Low minutes warning (per90 unreliable) ── */
            .tsa-low-mins td { opacity: 0.55; }
            .tsa-low-mins td:first-child { opacity: 1; }
            .tsa-low-mins .tsa-low-mins-icon {
                font-size: 9px; color: #c87848; margin-left: 3px;
                cursor: help;
            }

            /* ── Summary cards ── */
            .tsa-summary-cards {
                display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;
                margin-bottom: 14px;
            }

            /* ── Match List ── */
            .tsa-match-list { margin-top: 16px; }
            .tsa-match-list-title {
                font-size: 13px; font-weight: 700; color: #a0cc80; margin-bottom: 8px;
                border-bottom: 1px solid #2a4a1a; padding-bottom: 4px;
            }
            .tsa-ml-table {
                width: 100%; border-collapse: collapse; font-size: 12px;
            }
            .tsa-ml-table th {
                text-align: left; font-size: 10px; color: #6a9a58; padding: 4px 6px;
                border-bottom: 1px solid #2a4a1a; font-weight: 600; text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .tsa-ml-table td {
                padding: 5px 6px; border-bottom: 1px solid #1e3a12; color: #c8e0b4;
                vertical-align: middle;
            }
            .tsa-ml-table tr:hover td { background: rgba(108,192,64,0.06); }
            .tsa-ml-team {
                display: inline-flex; align-items: center; gap: 5px;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 160px;
            }
            .tsa-ml-logo {
                width: 18px; height: 18px; object-fit: contain;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,.3));
                flex-shrink: 0;
            }
            .tsa-ml-team-name {
                overflow: hidden; text-overflow: ellipsis; font-weight: 600;
            }
            .tsa-ml-team-name.is-us { color: #80e048; }
            .tsa-ml-vs { color: #5a8a48; font-size: 11px; padding: 0 4px; }
            .tsa-ml-result {
                font-weight: 700; font-size: 13px; letter-spacing: 1px;
            }
            .tsa-ml-result.win { color: #80e048; }
            .tsa-ml-result.draw { color: #bbcc00; }
            .tsa-ml-result.loss { color: #ee5533; }
            .tsa-ml-type {
                font-size: 10px; color: #7aaa60; background: rgba(108,192,64,0.08);
                padding: 1px 6px; border-radius: 3px; white-space: nowrap;
            }
            .tsa-ml-date { color: #6a9a58; font-size: 11px; white-space: nowrap; }
            .tsa-ml-link {
                color: #6cc040; text-decoration: none; font-size: 11px;
            }
            .tsa-ml-link:hover { color: #80e048; text-decoration: underline; }

            .tsa-summary-card {
                background: linear-gradient(145deg, #243d18, #1e3414);
                border: 1px solid #3d6828; border-radius: 8px;
                padding: 10px 6px; text-align: center;
            }
            .tsa-summary-val {
                font-size: 20px; font-weight: 800; color: #e8f5d8;
                line-height: 1.1;
            }
            .tsa-summary-lbl {
                font-size: 9px; color: #6a9a58; text-transform: uppercase;
                letter-spacing: 0.4px; margin-top: 3px;
            }

            /* ── Scrollbar ── */
            .tsa-body::-webkit-scrollbar { width: 6px; }
            .tsa-body::-webkit-scrollbar-track { background: #162e0e; }
            .tsa-body::-webkit-scrollbar-thumb { background: #3d6828; border-radius: 3px; }
            .tsa-body::-webkit-scrollbar-thumb:hover { background: #4a9030; }

            /* ── Legend ── */
            .tsa-legend {
                margin-top: 14px; padding: 10px 14px;
                background: rgba(42,74,28,.25); border: 1px solid #2a4a1c;
                border-radius: 8px;
            }
            .tsa-legend-title {
                font-size: 10px; font-weight: 700; color: #6a9a58;
                text-transform: uppercase; letter-spacing: 0.8px;
                margin-bottom: 8px;
            }
            .tsa-legend-grid {
                display: grid; grid-template-columns: 1fr 1fr;
                gap: 6px 16px;
            }
            .tsa-legend-item {
                font-size: 10px; color: #8aac72; line-height: 1.4;
            }
            .tsa-legend-key {
                display: inline-block; font-weight: 700; color: #c8e0b4;
                background: rgba(74,144,48,.2); border-radius: 3px;
                padding: 0 4px; margin-right: 4px; font-size: 9px;
                letter-spacing: 0.3px;
            }

            /* ── Cell color spans (used in TmUI tables) ── */
            .tsa-wrap .cell-zero  { color: #4a6a3a; }
            .tsa-wrap .cell-good  { color: #80e048; font-weight: 700; }
            .tsa-wrap .cell-warn  { color: #c87848; }
            .tsa-wrap .cell-top1  { color: #ffd700; font-weight: 800; text-shadow: 0 0 6px rgba(255,215,0,.3); }
            .tsa-wrap .cell-top2  { color: #c0c0c0; font-weight: 700; }
            .tsa-wrap .cell-top3  { color: #cd7f32; font-weight: 700; }
            .tsa-wrap .cell-yc    { color: #ffd700; font-weight: 700; }
            .tsa-wrap .cell-rc    { color: #ff4444; font-weight: 700; }

            /* ── TmUI table in stats wrap ── */
            .tsa-wrap .tmu-tbl { margin-bottom: 0; }
            .tsa-wrap .tmu-tbl tbody td:first-child { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
            .tsa-wrap .tmu-tbl thead th.col-group-start,
            .tsa-wrap .tmu-tbl tbody td.col-group-start,
            .tsa-wrap .tmu-tbl tfoot td.col-group-start { border-left: 1px solid #3d6828; }
            `;
            document.head.appendChild(style);
        },
    };

})();



// ─── components/stats/tm-stats-aggregator.js ────────────────

(function () {
    'use strict';

    const { STYLE_ORDER } = window.TmConst;

    window.TmStatsAggregator = {
        /**
         * Aggregate all match data into player/team summaries.
         * Pure function — reads allMatchData + filters, returns new state objects.
         *
         * @param {Array}  allMatchData
         * @param {Object} filters  { activeMatchType, filterOurFormation, filterOurStyle,
         *                            filterOurMentality, filterOppFormation, filterOppStyle,
         *                            filterOppMentality }
         * @returns {{ playerAgg, teamAggFor, teamAggAgainst, teamOverall, lastFilteredMatches }}
         */
        aggregate(allMatchData, filters) {
            const {
                activeMatchType,
                filterOurFormation, filterOurStyle, filterOurMentality,
                filterOppFormation, filterOppStyle, filterOppMentality,
            } = filters;

            const playerAgg = {};
            const teamAggFor = {};
            const teamAggAgainst = {};
            STYLE_ORDER.forEach(s => {
                teamAggFor[s]     = { a: 0, l: 0, sh: 0, g: 0 };
                teamAggAgainst[s] = { a: 0, l: 0, sh: 0, g: 0 };
            });
            const teamOverall = {
                matches: 0, wins: 0, draws: 0, losses: 0,
                goalsFor: 0, goalsAgainst: 0,
                shotsFor: 0, shotsAgainst: 0,
                soTFor: 0, soTAgainst: 0,
                yellowFor: 0, yellowAgainst: 0,
                redFor: 0, redAgainst: 0,
                setPiecesFor: 0, setPiecesAgainst: 0,
                penaltiesFor: 0, penaltiesAgainst: 0,
                possFor: 0, possAgainst: 0, possCount: 0,
            };

            const lastFilteredMatches = allMatchData.filter(md => {
                if (activeMatchType !== 'all' && md.matchType !== activeMatchType) return false;
                if (filterOurFormation && !filterOurFormation.has(md.ourFormation)) return false;
                if (filterOurStyle     && !filterOurStyle.has(md.ourStyle))         return false;
                if (filterOurMentality && !filterOurMentality.has(md.ourMentality)) return false;
                if (filterOppFormation && !filterOppFormation.has(md.oppFormation)) return false;
                if (filterOppStyle     && !filterOppStyle.has(md.oppStyle))         return false;
                if (filterOppMentality && !filterOppMentality.has(md.oppMentality)) return false;
                return true;
            });

            lastFilteredMatches.forEach(md => {
                const { matchInfo, matchStats, advFor: af, advAgainst: aa, playerMatchData, isHome } = md;

                // Team overall
                teamOverall.matches++;
                const [h, a] = matchInfo.result.split('-').map(Number);
                const ourGoals = isHome ? h : a;
                const oppGoals = isHome ? a : h;
                teamOverall.goalsFor     += ourGoals;
                teamOverall.goalsAgainst += oppGoals;
                if (ourGoals > oppGoals)      teamOverall.wins++;
                else if (ourGoals === oppGoals) teamOverall.draws++;
                else                           teamOverall.losses++;

                teamOverall.shotsFor       += isHome ? matchStats.homeShots    : matchStats.awayShots;
                teamOverall.shotsAgainst   += isHome ? matchStats.awayShots    : matchStats.homeShots;
                teamOverall.soTFor         += isHome ? matchStats.homeSoT      : matchStats.awaySoT;
                teamOverall.soTAgainst     += isHome ? matchStats.awaySoT      : matchStats.homeSoT;
                teamOverall.yellowFor      += isHome ? matchStats.homeYellow   : matchStats.awayYellow;
                teamOverall.yellowAgainst  += isHome ? matchStats.awayYellow   : matchStats.homeYellow;
                teamOverall.redFor         += isHome ? matchStats.homeRed      : matchStats.awayRed;
                teamOverall.redAgainst     += isHome ? matchStats.awayRed      : matchStats.homeRed;
                teamOverall.setPiecesFor   += isHome ? matchStats.homeSetPieces: matchStats.awaySetPieces;
                teamOverall.setPiecesAgainst += isHome ? matchStats.awaySetPieces: matchStats.homeSetPieces;
                teamOverall.penaltiesFor   += isHome ? matchStats.homePenalties: matchStats.awayPenalties;
                teamOverall.penaltiesAgainst += isHome ? matchStats.awayPenalties: matchStats.homePenalties;
                if (matchStats.homePoss || matchStats.awayPoss) {
                    teamOverall.possFor     += isHome ? matchStats.homePoss : matchStats.awayPoss;
                    teamOverall.possAgainst += isHome ? matchStats.awayPoss : matchStats.homePoss;
                    teamOverall.possCount++;
                }

                // Attacking styles
                STYLE_ORDER.forEach(s => {
                    ['a', 'l', 'sh', 'g'].forEach(k => {
                        teamAggFor[s][k]     += af[s]?.[k] ?? 0;
                        teamAggAgainst[s][k] += aa[s]?.[k] ?? 0;
                    });
                });

                // Player stats
                Object.entries(playerMatchData).forEach(([pid, ps]) => {
                    if (!playerAgg[pid]) {
                        playerAgg[pid] = {
                            name: ps.name, position: ps.position, isGK: ps.isGK,
                            matches: 0, minutes: 0, rating: 0, ratingCount: 0,
                            sp: 0, up: 0, sc: 0, uc: 0, sh: 0, sot: 0, soff: 0, shf: 0, sotf: 0, gf: 0,
                            shh: 0, soth: 0, gh: 0, sv: 0, g: 0, a: 0, dw: 0, dl: 0,
                            int: 0, tkl: 0, hc: 0, tf: 0, kp: 0, stp: 0, fkg: 0,
                            pen: 0, peng: 0, yc: 0, rc: 0, fouls: 0,
                        };
                    }
                    const pa = playerAgg[pid];
                    pa.matches++;
                    pa.minutes += ps.minutes;
                    if (ps.rating > 0) { pa.rating += ps.rating; pa.ratingCount++; }
                    pa.sp   += ps.sp;   pa.up  += ps.up;  pa.sc  += ps.sc;  pa.uc += ps.uc;
                    pa.sh   += ps.sh;   pa.sot += ps.sot; pa.soff+= ps.soff;
                    pa.shf  += ps.shf;  pa.sotf+= ps.sotf;pa.gf  += ps.gf;
                    pa.shh  += ps.shh;  pa.soth+= ps.soth;pa.gh  += ps.gh;
                    pa.sv   += ps.sv;   pa.g   += ps.g;   pa.a   += ps.a;
                    pa.dw   += ps.dw;   pa.dl  += ps.dl;
                    pa.int  += ps.int;  pa.tkl += ps.tkl; pa.hc  += ps.hc;  pa.tf += ps.tf;
                    pa.kp   += ps.kp;   pa.stp += ps.stp; pa.fkg += ps.fkg;
                    pa.pen  += ps.pen;  pa.peng+= ps.peng;
                    pa.yc   += ps.yc;   pa.rc  += ps.rc;  pa.fouls += ps.fouls;
                    // Update name from latest appearance
                    pa.name = ps.name;
                    if (!ps.position.includes('sub')) pa.position = ps.position;
                    pa.isGK = ps.isGK || pa.isGK;
                });
            });

            return { playerAgg, teamAggFor, teamAggAgainst, teamOverall, lastFilteredMatches };
        },
    };

})();



// ─── components/stats/tm-stats-match-processor.js ───────────

(function () {
    'use strict';

    const {
        ATTACK_STYLES, STYLE_ORDER, SKIP_PREFIXES,
        STYLE_MAP, MENTALITY_MAP,
    } = window.TmConst;

    const getFormation = (lineup) => {
        const positions = Object.values(lineup)
            .map(p => (p.position || '').toLowerCase())
            .filter(pos => pos && !pos.startsWith('sub') && pos !== 'gk');
        let def = 0, dm = 0, mid = 0, am = 0, att = 0;
        positions.forEach(p => {
            if (/^(d[^m]|sw|lb|rb|wb)/.test(p)) def++;
            else if (/^dmc/.test(p)) dm++;
            else if (/^(mc|ml|mr)/.test(p)) mid++;
            else if (/^amc/.test(p)) am++;
            else att++; // fc, fcl, fcr, st, wl, wr, lw, rw, etc.
        });
        const lines = [def];
        if (dm > 0) lines.push(dm);
        if (mid > 0) lines.push(mid);
        if (am > 0) lines.push(am);
        lines.push(att);
        return lines.join('-');
    };


    const classifyMatchType = (matchtype) => {
        switch (matchtype) {
            case 'l': return 'league';
            case 'f': return 'friendly';
            case 'fl': return 'fl';
            case 'c': case 'cl': case 'cup': return 'cup';
            default: return 'other';
        }
    };


    window.TmStatsMatchProcessor = {
        process(matchInfo, mData, clubId) {
            const isHome = matchInfo.isHome;
            const ourSide = isHome ? 'home' : 'away';
            const oppSide = isHome ? 'away' : 'home';
            const ourLineup = mData.lineup?.[ourSide] || {};
            const oppLineup = mData.lineup?.[oppSide] || {};
            const report = mData.report || {};
            const homeIds = new Set(Object.keys(mData.lineup?.home || {}));
            const md = mData.match_data || {};
            const matchType = classifyMatchType(matchInfo.matchtype);

            // Build player name map
            const allLineup = { ...ourLineup, ...oppLineup };
            const playerNames = {};
            Object.entries(allLineup).forEach(([id, p]) => {
                playerNames[id] = p.name || p.nameLast || id;
            });

            // ── Sub events for minutes calculation ──
            const sortedMins = Object.keys(report).map(Number).sort((a, b) => a - b);
            const subEvents = {};
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
            const matchEndMin = md.regular_last_min || Math.max(...sortedMins, 90);

            // ── Per-player stats from shared video + parameter processor ──
            const pStats = window.TmMatchUtils.buildPlayerEventStats(report);

            // ── Basic match stats ──
            const matchStats = {
                homeYellow: 0, awayYellow: 0, homeRed: 0, awayRed: 0,
                homeShots: 0, awayShots: 0, homeSoT: 0, awaySoT: 0,
                homeSetPieces: 0, awaySetPieces: 0, homePenalties: 0, awayPenalties: 0,
                homePoss: 0, awayPoss: 0,
                homeGoalsReport: 0, awayGoalsReport: 0,
            };

            // ── Attacking styles for this match ──
            const advFor = {};
            const advAgainst = {};
            STYLE_ORDER.forEach(s => {
                advFor[s] = { a: 0, l: 0, sh: 0, g: 0 };
                advAgainst[s] = { a: 0, l: 0, sh: 0, g: 0 };
            });
            const unclassifiedGoals = []; // debug: goals not matching any attacking style

            if (md.possession) {
                matchStats.homePoss = Number(md.possession.home) || 0;
                matchStats.awayPoss = Number(md.possession.away) || 0;
            }

            const homeId = String(mData.club?.home?.id || matchInfo.hometeam);

            for (const min of sortedMins) {
                const evts = report[String(min)] || [];
                for (let si = 0; si < evts.length; si++) {
                    const evt = evts[si];

                    // Basic match stats from parameters
                    if (evt.parameters) {
                        const gPrefix = evt.type ? evt.type.replace(/[0-9]+.*/, '') : '';
                        evt.parameters.forEach(param => {
                            if (param.yellow) {
                                if (homeIds.has(String(param.yellow))) matchStats.homeYellow++;
                                else matchStats.awayYellow++;
                            }
                            if (param.yellow_red) {
                                if (homeIds.has(String(param.yellow_red))) matchStats.homeRed++;
                                else matchStats.awayRed++;
                            }
                            if (param.red) {
                                if (homeIds.has(String(param.red))) matchStats.homeRed++;
                                else matchStats.awayRed++;
                            }
                            if (param.shot) {
                                const isHomeSide = String(param.shot.team) === homeId;
                                if (isHomeSide) { matchStats.homeShots++; if (param.shot.target === 'on') matchStats.homeSoT++; }
                                else { matchStats.awayShots++; if (param.shot.target === 'on') matchStats.awaySoT++; }
                            }
                            if (param.set_piece && gPrefix === 'dire') {
                                if (homeIds.has(String(param.set_piece))) matchStats.homeSetPieces++;
                                else matchStats.awaySetPieces++;
                            }
                        });

                        // Penalty detection
                        const isPenalty = evt.parameters.some(p => p.penalty);
                        const hasGoalParam = evt.parameters.some(p => p.goal);
                        if (isPenalty && hasGoalParam) {
                            const goalParam = evt.parameters.find(p => p.goal);
                            if (goalParam && homeIds.has(String(goalParam.goal.player))) matchStats.homePenalties++;
                            else if (goalParam) matchStats.awayPenalties++;
                        }
                    }

                    // Attacking styles
                    if (evt.type) {
                        const prefix = evt.type.replace(/[0-9]+.*/, '');

                        // Handle penalty events (type starts with p_)
                        const isPenEvt = /^p_/.test(evt.type);
                        const hasShot = evt.parameters?.some(p => p.shot);
                        const hasGoal = evt.parameters?.some(p => p.goal);
                        const hasPenParam = evt.parameters?.some(p => p.penalty);

                        if (isPenEvt && hasPenParam && hasGoal) {
                            // Penalty goal → Penalties row
                            const club = String(evt.club);
                            const isOurAttack = club === clubId;
                            const pd = isOurAttack ? advFor['Penalties'] : advAgainst['Penalties'];
                            pd.a++; pd.g++; pd.sh++;
                        } else if (isPenEvt && hasShot && !hasGoal) {
                            // Penalty shot missed/saved
                            const club = String(evt.club);
                            const isOurAttack = club === clubId;
                            const pd = isOurAttack ? advFor['Penalties'] : advAgainst['Penalties'];
                            pd.a++; pd.sh++;
                        } else if (!isPenEvt && !SKIP_PREFIXES.has(prefix)) {
                            const styleEntry = ATTACK_STYLES.find(s => s.key === prefix);
                            if (styleEntry) {
                                const label = styleEntry.label;
                                const club = String(evt.club);
                                const isOurAttack = club === clubId;
                                const d = isOurAttack ? advFor[label] : advAgainst[label];
                                d.a++;
                                if (hasGoal) { d.g++; d.sh++; }
                                else if (hasShot) { d.sh++; }
                                else { d.l++; }
                            } else if (hasGoal) {
                                // Goal in event with unrecognized type
                                const club = String(evt.club);
                                unclassifiedGoals.push({ min, type: evt.type, prefix, club, isOur: club === clubId, evt });
                            }
                        } else if (isPenEvt && !hasPenParam && hasGoal) {
                            // p_ event with goal but no penalty param — unusual
                            const club = String(evt.club);
                            unclassifiedGoals.push({ min, type: evt.type, prefix, club, isOur: club === clubId, evt, note: 'p_ without penalty param' });
                        }
                    }

                }
            }

            matchStats.homeGoalsReport = Object.keys(pStats).reduce((s, id) => homeIds.has(id) ? s + (pStats[id].g || 0) : s, 0);
            matchStats.awayGoalsReport = Object.keys(pStats).reduce((s, id) => !homeIds.has(id) ? s + (pStats[id].g || 0) : s, 0);

            // ── Compute per-player minutes and ratings for OUR players ──
            const ourPlayerIds = Object.keys(ourLineup);
            const playerMatchData = {};
            ourPlayerIds.forEach(id => {
                const p = ourLineup[id];
                const isSub = p.position.includes('sub');
                const se = subEvents[String(p.player_id)] || {};
                if (isSub && !se.subInMin) return; // never played
                let minsPlayed;
                if (isSub) {
                    const endMin = se.subOutMin || matchEndMin;
                    minsPlayed = endMin - se.subInMin;
                } else {
                    const endMin = se.subOutMin || matchEndMin;
                    minsPlayed = endMin;
                }
                const pid = String(p.player_id);
                const st = pStats[pid] || { sp: 0, up: 0, sc: 0, uc: 0, sh: 0, sot: 0, soff: 0, shf: 0, sotf: 0, gf: 0, shh: 0, soth: 0, gh: 0, sv: 0, g: 0, a: 0, dw: 0, dl: 0, int: 0, tkl: 0, hc: 0, tf: 0, kp: 0, stp: 0, fkg: 0, pen: 0, peng: 0, yc: 0, rc: 0, fouls: 0 };
                const rating = p.rating ? Number(p.rating) : 0;
                const isGK = p.position === 'gk';

                playerMatchData[pid] = {
                    name: p.name || p.nameLast || pid,
                    position: p.position,
                    isGK,
                    minutes: minsPlayed,
                    rating,
                    ...st,
                };
            });

            // ── Extract tactics ──
            const ourStyle = STYLE_MAP[md.attacking_style?.[ourSide]] || 'Unknown';
            const oppStyle = STYLE_MAP[md.attacking_style?.[oppSide]] || 'Unknown';
            const ourMentality = MENTALITY_MAP[md.mentality?.[ourSide]] || 'Unknown';
            const oppMentality = MENTALITY_MAP[md.mentality?.[oppSide]] || 'Unknown';
            const ourFormation = getFormation(ourLineup);
            const oppFormation = getFormation(oppLineup);

            return {
                matchInfo,
                matchType,
                matchStats,
                advFor,
                advAgainst,
                playerMatchData,
                isHome,
                unclassifiedGoals,
                ourStyle,
                oppStyle,
                ourMentality,
                oppMentality,
                ourFormation,
                oppFormation,
            };
        },
    };

})();



// ─── components/stats/tm-stats-match-list.js ────────────────

// tm-stats-match-list.js — Match list component for team tab
// API: window.TmStatsMatchList.build(matches) → HTMLElement
(function () {
    const MATCH_TYPE_LABELS = { league: 'League', friendly: 'Friendly', fl: 'FL', cup: 'Cup', other: 'Other' };

    window.TmStatsMatchList = {
        build(matches) {
            const sorted = [...matches].sort((a, b) => {
                const da = a.matchInfo.date || '';
                const db = b.matchInfo.date || '';
                return db.localeCompare(da);
            });

            const wrap = document.createElement('div');
            wrap.className = 'tsa-match-list';

            const title = document.createElement('div');
            title.className = 'tsa-match-list-title';
            title.textContent = `Matches (${matches.length})`;
            wrap.appendChild(title);

            const table = document.createElement('table');
            table.className = 'tsa-ml-table';
            table.innerHTML = `<thead><tr>
                <th>Date</th><th>Type</th>
                <th colspan="3" style="text-align:center">Match</th>
                <th>Result</th><th></th>
            </tr></thead>`;

            const tbody = document.createElement('tbody');
            sorted.forEach(md => {
                const mi = md.matchInfo;
                const [h, a] = mi.result.split('-').map(Number);
                const ourGoals = mi.isHome ? h : a;
                const oppGoals = mi.isHome ? a : h;
                const resultCls = ourGoals > oppGoals ? 'win' : ourGoals < oppGoals ? 'loss' : 'draw';
                const typeLabel = MATCH_TYPE_LABELS[md.matchType] || md.matchType;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="tsa-ml-date">${mi.date || '-'}</td>
                    <td><span class="tsa-ml-type">${typeLabel}</span></td>
                    <td style="text-align:right"><span class="tsa-ml-team"><img class="tsa-ml-logo" src="/pics/club_logos/${mi.hometeam}_140.png" onerror="this.style.display='none'"><span class="tsa-ml-team-name${mi.isHome ? ' is-us' : ''}">${mi.hometeam_name}</span></span></td>
                    <td class="tsa-ml-vs" style="text-align:center">vs</td>
                    <td><span class="tsa-ml-team"><img class="tsa-ml-logo" src="/pics/club_logos/${mi.awayteam}_140.png" onerror="this.style.display='none'"><span class="tsa-ml-team-name${!mi.isHome ? ' is-us' : ''}">${mi.awayteam_name}</span></span></td>
                    <td><span class="tsa-ml-result ${resultCls}">${mi.result}</span></td>
                    <td><a class="tsa-ml-link" href="/matches/${mi.id}/" target="_blank">▶</a></td>
                `;
                tbody.appendChild(tr);
            });

            table.appendChild(tbody);
            wrap.appendChild(table);
            return wrap;
        },
    };
})();



// ─── components/stats/tm-stats-basic-table.js ───────────────

// ==UserScript==
// @name         TM Stats — Basic Player Table Component
// @namespace    https://trophymanager.com
// @version      1.0.0
// @description  Builds the Basic sub-tab player table for the Season Match Analysis script.
//               Depends on: TmUI (tm-ui.js)
//               CSS classes (.tsa-pos-*, .tsa-plr-link, .tsa-low-mins*, .tsa-rat, .cell-*)
//               are injected by tm-stats.user.js.
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ── Pure helpers (mirrors tm-stats.user.js local functions) ──────────

    const _ratClr  = window.TmUtils.ratingColor;
    const _fix2    = window.TmUtils.fix2;
    const _posGroup = window.TmUtils.classifyPosition;
    const _posLabel = window.TmUtils.posLabel;

    const _getDisplayValue = (total, matches, minutes, filter) => {
        if (filter === 'total')   return total;
        if (filter === 'average') return matches > 0 ? (total / matches) : 0;
        if (filter === 'per90')   return minutes > 0 ? (total / minutes * 90) : 0;
        return total;
    };

    const _fmtVal = (val, filter) => {
        if (filter === 'total') return typeof val === 'number' ? val : val;
        return Number(val).toFixed(2);
    };

    const _topCls = (val, col, tops) => window.TmUtils.topNClass(val, col, tops);

    // ── Component ─────────────────────────────────────────────────────────

    /**
     * Build the basic-tab outfield player table.
     *
     * @param {object[]} outfield      — aggregated player records (from playerAgg)
     * @param {object}   opts
     * @param {string}   opts.filter         — 'total' | 'average' | 'per90'
     * @param {object}   opts.tops           — { colKey: { v1, v2, v3 } } top-3 thresholds
     * @param {number}   opts.matchTypeCount — total match count shown in footer
     * @returns {HTMLDivElement}  TmUI table wrapper element
     */
    const build = (outfield, { filter: f, tops, matchTypeCount }) => {
        const dv = (val) => {
            const raw = f === 'total' ? val : Number(val);
            if (!raw) return '-';
            return _fmtVal(val, f);
        };
        const cc = (val, colKey, warnType) => {
            const raw = f === 'total' ? val : Number(val);
            if (!raw) return 'cell-zero';
            const t = _topCls(raw, colKey, tops);
            if (t) return 'cell-' + t;
            return warnType ? 'cell-' + warnType : '';
        };

        let totMin = 0, totRat = 0, totRatC = 0;
        let totG = 0, totA = 0, totKP = 0, totYC = 0, totRC = 0, totFouls = 0;

        const items = outfield.map(p => {
            const m = p.matches, mins = p.minutes, rat = p.avgRating;
            const gv     = _getDisplayValue(p.g,     m, mins, f);
            const av     = _getDisplayValue(p.a,     m, mins, f);
            const kpv    = _getDisplayValue(p.kp,    m, mins, f);
            const foulsv = _getDisplayValue(p.fouls, m, mins, f);
            const pg = _posGroup(p.position);
            const pl = _posLabel(p.position);
            const po = { gk: 0, def: 1, mid: 2, att: 3 }[pg] ?? 2;
            const minsDisp = f === 'per90' ? "90'" :
                f === 'average' ? (m > 0 ? Math.round(mins / m) : 0) + "'" :
                mins + "'";
            totMin += mins; totG += p.g; totA += p.a;
            totKP += p.kp; totYC += p.yc; totRC += p.rc; totFouls += p.fouls;
            if (rat > 0) { totRat += p.rating; totRatC += p.ratingCount; }
            return {
                pid: p.pid, name: p.name, pg, pl,
                posSort: po * 1000 + pl.charCodeAt(0),
                matches: m, minSort: mins, minsDisp,
                rat, gv, av, kpv, foulsv,
                yc: p.yc, rc: p.rc,
                lowMins: f === 'per90' && mins < 90,
            };
        });

        const tRat = totRatC > 0 ? totRat / totRatC : 0;
        const tf = v => v || '-';

        return TmUI.table({
            headers: [
                { key: 'name',    label: 'Player',
                  render: (val, it) =>
                      `<a href="/players/${it.pid}/#/page/history/" class="tsa-plr-link" target="_blank">${val}</a>` +
                      (it.lowMins ? '<span class="tsa-low-mins-icon" title="Less than 90 min — per90 stats unreliable">⚠</span>' : '') },
                { key: 'posSort', label: 'Pos', align: 'c',
                  render: (_, it) => `<span class="tsa-pos tsa-pos-${it.pg}">${it.pl}</span>` },
                { key: 'matches', label: 'M',      align: 'c' },
                { key: 'minSort', label: 'Min',    align: 'c',
                  render: (_, it) => it.minsDisp },
                { key: 'rat',     label: 'Rat',    align: 'c',
                  render: (val) => val > 0
                      ? `<span class="tsa-rat" style="color:${_ratClr(val)}">${val.toFixed(2)}</span>`
                      : `<span class="cell-zero">-</span>` },
                { key: 'gv',     label: 'G',      align: 'c',
                  render: (val) => `<span class="${cc(val,'g','good')}">${dv(val)}</span>` },
                { key: 'av',     label: 'A',      align: 'c',
                  render: (val) => `<span class="${cc(val,'a','good')}">${dv(val)}</span>` },
                { key: 'kpv',    label: 'KP',     align: 'c',
                  render: (val) => `<span class="${cc(val,'kp','')}">${dv(val)}</span>` },
                { key: 'yc',     label: '🟨',     align: 'c',
                  render: (val) => `<span class="${val ? 'cell-yc' : 'cell-zero'}">${val || '-'}</span>` },
                { key: 'rc',     label: '🟥',     align: 'c',
                  render: (val) => `<span class="${val ? 'cell-rc' : 'cell-zero'}">${val || '-'}</span>` },
                { key: 'foulsv', label: 'Fouls',  align: 'c',
                  render: (val) => `<span class="${cc(val,'fouls','warn')}">${dv(val)}</span>` },
            ],
            items,
            sortKey: 'gv',
            sortDir: -1,
            rowCls: (it) => it.lowMins ? 'tsa-low-mins' : '',
            footer: [{
                cls: 'tmu-tbl-tot',
                cells: [
                    `Total (${outfield.length})`, '', matchTypeCount, `${totMin}'`,
                    { content: `<span class="tsa-rat" style="color:${_ratClr(tRat)}">${tRat > 0 ? tRat.toFixed(2) : '-'}</span>` },
                    { content: `<span class="${totG ? 'cell-good' : 'cell-zero'}">${tf(totG)}</span>` },
                    { content: `<span class="${totA ? 'cell-good' : 'cell-zero'}">${tf(totA)}</span>` },
                    tf(totKP),
                    { content: `<span class="${totYC ? 'cell-yc' : 'cell-zero'}">${tf(totYC)}</span>` },
                    { content: `<span class="${totRC ? 'cell-rc' : 'cell-zero'}">${tf(totRC)}</span>` },
                    tf(totFouls),
                ],
            }],
        });
    };

    window.TmStatsBasicTable = { build };

})();



// ─── components/stats/tm-stats-attacking-table.js ───────────

// tm-stats-attacking-table.js — Attacking stats table component (multi-level headers)
// API: window.TmStatsAttackingTable.build(outfield, { filter, tops, matchTypeCount }) → HTMLElement (TmUI.table widget)
// Depends on: TmUI (tm-ui.js), TmUtils (tm-utils.js)
(function () {
    const _ratClr  = window.TmUtils.ratingColor;

    const _posGroup = window.TmUtils.classifyPosition;
    const _posLabel = window.TmUtils.posLabel;

    const _getDisplayValue = (total, matches, minutes, filter) => {
        if (filter === 'total') return total;
        if (filter === 'average') return matches > 0 ? (total / matches) : 0;
        if (filter === 'per90') return minutes > 0 ? (total / minutes * 90) : 0;
        return total;
    };

    const _fmtVal = (val, filter) => {
        if (filter === 'total') return typeof val === 'number' ? val : val;
        return Number(val).toFixed(2);
    };

    const _pctStr = (part, total) => total > 0 ? Math.round(part / total * 100) + '%' : '-';

    const _topCls = (val, col, tops) => window.TmUtils.topNClass(val, col, tops);

    window.TmStatsAttackingTable = {
        build(outfield, { filter: f = 'total', tops = {}, matchTypeCount = 0 } = {}) {
            const dv = (val) => {
                const raw = f === 'total' ? val : Number(val);
                if (!raw) return '-';
                return _fmtVal(val, f);
            };
            const cc = (val, colKey, warnType) => {
                const raw = f === 'total' ? val : Number(val);
                if (!raw) return 'cell-zero';
                const t = _topCls(raw, colKey, tops);
                if (t) return 'cell-' + t;
                return warnType ? 'cell-' + warnType : '';
            };
            const pct = (part, total) => `<span class="tsa-pct">${_pctStr(part, total)}</span>`;

            let totM = 0, totMin = 0, totRat = 0, totRatC = 0;
            let totG = 0, totA = 0, totSh = 0, totSoT = 0;
            let totShF = 0, totSoTF = 0, totGF = 0;
            let totShH = 0, totSoTH = 0, totGH = 0;
            let totSP = 0, totUP = 0, totSC = 0, totUC = 0;
            let totSTP = 0, totFKG = 0, totPen = 0, totPenG = 0;

            const items = outfield.map(p => {
                const m = p.matches, mins = p.minutes;
                const fv = stat => _getDisplayValue(p[stat] || 0, m, mins, f);
                const tpRaw = (p.sp || 0) + (p.up || 0);
                const tcRaw = (p.sc || 0) + (p.uc || 0);
                const pg = _posGroup(p.position);
                const pl = _posLabel(p.position);
                const po = { gk: 0, def: 1, mid: 2, att: 3 }[pg] ?? 2;
                const minsDisp = f === 'per90' ? "90'" :
                    f === 'average' ? (m > 0 ? Math.round(mins / m) : 0) + "'" :
                    mins + "'";

                totM += m; totMin += mins;
                totG += p.g || 0; totA += p.a || 0;
                totSh += p.sh || 0; totSoT += p.sot || 0;
                totShF += p.shf || 0; totSoTF += p.sotf || 0; totGF += p.gf || 0;
                totShH += p.shh || 0; totSoTH += p.soth || 0; totGH += p.gh || 0;
                totSP += p.sp || 0; totUP += p.up || 0;
                totSC += p.sc || 0; totUC += p.uc || 0;
                totSTP += p.stp || 0; totFKG += p.fkg || 0;
                totPen += p.pen || 0; totPenG += p.peng || 0;
                if (p.avgRating > 0) { totRat += p.rating; totRatC += p.ratingCount; }

                return {
                    pid: p.pid, name: p.name, pg, pl,
                    posSort: po * 1000 + pl.charCodeAt(0),
                    matches: m, minSort: mins, minsDisp,
                    rat: p.avgRating,
                    // Shooting Total
                    sh: fv('sh'), sot: fv('sot'), g: fv('g'),
                    gpct: (p.sh || 0) > 0 ? (p.g || 0) / p.sh : 0,
                    // Shooting Foot
                    shf: fv('shf'), sotf: fv('sotf'), gf: fv('gf'),
                    gfpct: (p.shf || 0) > 0 ? (p.gf || 0) / p.shf : 0,
                    // Shooting Head
                    shh: fv('shh'), soth: fv('soth'), gh: fv('gh'),
                    ghpct: (p.shh || 0) > 0 ? (p.gh || 0) / p.shh : 0,
                    // Passes
                    tp: _getDisplayValue(tpRaw, m, mins, f), sp: fv('sp'),
                    cppct: tpRaw > 0 ? (p.sp || 0) / tpRaw : 0,
                    a: fv('a'),
                    // Crosses
                    tc: _getDisplayValue(tcRaw, m, mins, f), sc: fv('sc'),
                    crpct: tcRaw > 0 ? (p.sc || 0) / tcRaw : 0,
                    // FK
                    stp: fv('stp'), fkg: fv('fkg'),
                    // Pen
                    pen: fv('pen'), peng: fv('peng'),
                    // Raw values for percentage display
                    _shRaw: p.sh || 0, _gRaw: p.g || 0,
                    _shfRaw: p.shf || 0, _gfRaw: p.gf || 0,
                    _shhRaw: p.shh || 0, _ghRaw: p.gh || 0,
                    _tpRaw: tpRaw, _spRaw: p.sp || 0,
                    _tcRaw: tcRaw, _scRaw: p.sc || 0,
                    lowMins: f === 'per90' && mins < 90,
                };
            });

            const tRat = totRatC > 0 ? totRat / totRatC : 0;
            const tf = v => v || '-';
            const totTP = totSP + totUP;
            const totTC = totSC + totUC;

            return TmUI.table({
                cls: 'tsa-table',
                groupHeaders: [
                    {
                        cls: 'tsa-super-row',
                        cells: [
                            { label: '', colspan: 5, rowspan: 2 },
                            { label: 'Shooting', colspan: 12, cls: 'col-group-start' },
                            { label: 'Passes', colspan: 4, rowspan: 2, cls: 'col-group-start' },
                            { label: 'Crosses', colspan: 3, rowspan: 2, cls: 'col-group-start' },
                            { label: 'FK', colspan: 2, rowspan: 2, cls: 'col-group-start' },
                            { label: 'Pen', colspan: 2, rowspan: 2, cls: 'col-group-start' },
                        ],
                    },
                    {
                        cls: 'tsa-group-row',
                        cells: [
                            { label: 'Total', colspan: 4, cls: 'col-group-start' },
                            { label: 'Foot',  colspan: 4, cls: 'col-group-start' },
                            { label: 'Head',  colspan: 4, cls: 'col-group-start' },
                        ],
                    },
                ],
                headers: [
                    { key: 'name',    label: 'Player',
                      render: (val, it) =>
                          `<a href="/players/${it.pid}/#/page/history/" class="tsa-plr-link" target="_blank">${val}</a>` +
                          (it.lowMins ? '<span class="tsa-low-mins-icon" title="Less than 90 min — per90 stats unreliable">⚠</span>' : '') },
                    { key: 'posSort', label: 'Pos',  align: 'c', title: 'Position',
                      render: (_, it) => `<span class="tsa-pos tsa-pos-${it.pg}">${it.pl}</span>` },
                    { key: 'matches', label: 'M',    align: 'c', title: 'Matches' },
                    { key: 'minSort', label: 'Min',  align: 'c', title: 'Minutes',
                      render: (_, it) => it.minsDisp },
                    { key: 'rat',     label: 'Rat',  align: 'c', title: 'Avg Rating',
                      render: (val) => val > 0
                          ? `<span class="tsa-rat" style="color:${_ratClr(val)}">${val.toFixed(2)}</span>`
                          : `<span class="cell-zero">-</span>` },
                    // Shooting Total
                    { key: 'sh',    label: 'Σ',  align: 'c', title: 'Total Shots',      thCls: 'col-group-start', cls: 'col-group-start',
                      render: (val) => `<span class="${cc(val,'sh','')}">${dv(val)}</span>` },
                    { key: 'sot',   label: 'OT', align: 'c', title: 'On Target',
                      render: (val) => `<span class="${cc(val,'sot','')}">${dv(val)}</span>` },
                    { key: 'g',     label: 'G',  align: 'c', title: 'Goals',
                      render: (val) => `<span class="${cc(val,'g','good')}">${dv(val)}</span>` },
                    { key: 'gpct',  label: '%',  align: 'c', title: 'Conversion %',
                      render: (_, it) => pct(it._gRaw, it._shRaw) },
                    // Shooting Foot
                    { key: 'shf',   label: 'Σ',  align: 'c', title: 'Foot Shots',       thCls: 'col-group-start', cls: 'col-group-start',
                      render: (val) => `<span class="${cc(val,'shf','')}">${dv(val)}</span>` },
                    { key: 'sotf',  label: 'OT', align: 'c', title: 'On Target (Foot)',
                      render: (val) => `<span class="${cc(val,'sotf','')}">${dv(val)}</span>` },
                    { key: 'gf',    label: 'G',  align: 'c', title: 'Goals (Foot)',
                      render: (val) => `<span class="${cc(val,'gf','good')}">${dv(val)}</span>` },
                    { key: 'gfpct', label: '%',  align: 'c', title: 'Conversion % (Foot)',
                      render: (_, it) => pct(it._gfRaw, it._shfRaw) },
                    // Shooting Head
                    { key: 'shh',   label: 'Σ',  align: 'c', title: 'Header Shots',     thCls: 'col-group-start', cls: 'col-group-start',
                      render: (val) => `<span class="${cc(val,'shh','')}">${dv(val)}</span>` },
                    { key: 'soth',  label: 'OT', align: 'c', title: 'On Target (Head)',
                      render: (val) => `<span class="${cc(val,'soth','')}">${dv(val)}</span>` },
                    { key: 'gh',    label: 'G',  align: 'c', title: 'Goals (Head)',
                      render: (val) => `<span class="${cc(val,'gh','good')}">${dv(val)}</span>` },
                    { key: 'ghpct', label: '%',  align: 'c', title: 'Conversion % (Head)',
                      render: (_, it) => pct(it._ghRaw, it._shhRaw) },
                    // Passes
                    { key: 'tp',    label: 'Σ',  align: 'c', title: 'Total Passes',      thCls: 'col-group-start', cls: 'col-group-start',
                      render: (val) => `<span class="${cc(val,'tp','')}">${dv(val)}</span>` },
                    { key: 'sp',    label: '✓',  align: 'c', title: 'Completed Passes',
                      render: (val) => `<span class="${cc(val,'sp','')}">${dv(val)}</span>` },
                    { key: 'cppct', label: '%',  align: 'c', title: 'Completion %',
                      render: (_, it) => pct(it._spRaw, it._tpRaw) },
                    { key: 'a',     label: 'A',  align: 'c', title: 'Assists',
                      render: (val) => `<span class="${cc(val,'a','good')}">${dv(val)}</span>` },
                    // Crosses
                    { key: 'tc',    label: 'Σ',  align: 'c', title: 'Total Crosses',     thCls: 'col-group-start', cls: 'col-group-start',
                      render: (val) => `<span class="${cc(val,'','')}">${dv(val)}</span>` },
                    { key: 'sc',    label: '✓',  align: 'c', title: 'Successful Crosses',
                      render: (val) => `<span class="${cc(val,'sc','')}">${dv(val)}</span>` },
                    { key: 'crpct', label: '%',  align: 'c', title: 'Cross Success %',
                      render: (_, it) => pct(it._scRaw, it._tcRaw) },
                    // FK
                    { key: 'stp',   label: 'Σ',  align: 'c', title: 'Free Kicks',        thCls: 'col-group-start', cls: 'col-group-start',
                      render: (val) => `<span class="${cc(val,'stp','')}">${dv(val)}</span>` },
                    { key: 'fkg',   label: 'G',  align: 'c', title: 'Free Kick Goals',
                      render: (val) => `<span class="${val ? 'cell-good' : 'cell-zero'}">${dv(val)}</span>` },
                    // Pen
                    { key: 'pen',   label: 'Σ',  align: 'c', title: 'Penalties Taken',   thCls: 'col-group-start', cls: 'col-group-start',
                      render: (val) => `<span class="${cc(val,'pen','')}">${dv(val)}</span>` },
                    { key: 'peng',  label: 'G',  align: 'c', title: 'Penalty Goals',
                      render: (val) => `<span class="${val ? 'cell-good' : 'cell-zero'}">${dv(val)}</span>` },
                ],
                items,
                sortKey: 'g',
                sortDir: -1,
                rowCls: (it) => it.lowMins ? 'tsa-low-mins' : '',
                footer: [{
                    cls: 'tmu-tbl-tot',
                    cells: [
                        `Total (${outfield.length})`, '', matchTypeCount, `${totMin}'`,
                        { content: `<span class="tsa-rat" style="color:${_ratClr(tRat)}">${tRat > 0 ? tRat.toFixed(2) : '-'}</span>` },
                        // Shooting Total
                        { content: tf(totSh),  cls: 'col-group-start' }, tf(totSoT),
                        { content: `<span class="${totG  ? 'cell-good' : 'cell-zero'}">${tf(totG)}</span>` },
                        { content: pct(totG,  totSh) },
                        // Shooting Foot
                        { content: tf(totShF), cls: 'col-group-start' }, tf(totSoTF),
                        { content: `<span class="${totGF ? 'cell-good' : 'cell-zero'}">${tf(totGF)}</span>` },
                        { content: pct(totGF, totShF) },
                        // Shooting Head
                        { content: tf(totShH), cls: 'col-group-start' }, tf(totSoTH),
                        { content: `<span class="${totGH ? 'cell-good' : 'cell-zero'}">${tf(totGH)}</span>` },
                        { content: pct(totGH, totShH) },
                        // Passes
                        { content: tf(totTP),  cls: 'col-group-start' }, tf(totSP),
                        { content: pct(totSP, totTP) },
                        { content: `<span class="${totA  ? 'cell-good' : 'cell-zero'}">${tf(totA)}</span>` },
                        // Crosses
                        { content: tf(totTC),  cls: 'col-group-start' }, tf(totSC),
                        { content: pct(totSC, totTC) },
                        // FK
                        { content: tf(totSTP), cls: 'col-group-start' },
                        { content: `<span class="${totFKG  ? 'cell-good' : 'cell-zero'}">${tf(totFKG)}</span>` },
                        // Pen
                        { content: tf(totPen), cls: 'col-group-start' },
                        { content: `<span class="${totPenG ? 'cell-good' : 'cell-zero'}">${tf(totPenG)}</span>` },
                    ],
                }],
            });
        },
    };
})();



// ─── components/stats/tm-stats-defending-table.js ───────────

// ==UserScript==
// @name         TM Stats — Defending Player Table Component
// @namespace    https://trophymanager.com
// @version      1.0.0
// @description  Builds the Defending sub-tab player table for the Season Match Analysis script.
//               Depends on: TmUI (tm-ui.js)
//               CSS classes (.tsa-pos-*, .tsa-plr-link, .tsa-low-mins*, .tsa-rat, .cell-*,
//               .col-group-start, .tsa-pct, .tsa-legend-*) are injected by tm-stats.user.js.
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ── Pure helpers ──────────────────────────────────────────────────────

    const _ratClr  = window.TmUtils.ratingColor;

    const _posGroup = window.TmUtils.classifyPosition;
    const _posLabel = window.TmUtils.posLabel;

    const _getDisplayValue = (total, matches, minutes, filter) => {
        if (filter === 'total')   return total;
        if (filter === 'average') return matches > 0 ? (total / matches) : 0;
        if (filter === 'per90')   return minutes > 0 ? (total / minutes * 90) : 0;
        return total;
    };

    const _fmtVal = (val, filter) => {
        if (filter === 'total') return val;
        return Number(val).toFixed(2);
    };

    const _topCls = (val, col, tops) => window.TmUtils.topNClass(val, col, tops);

    const _pctStr = (part, total) => total > 0 ? Math.round(part / total * 100) + '%' : '-';

    // ── Component ─────────────────────────────────────────────────────────

    /**
     * Build the defending-tab outfield player table + legend.
     *
     * @param {object[]} outfield
     * @param {object}   opts
     * @param {string}   opts.filter         — 'total' | 'average' | 'per90'
     * @param {object}   opts.tops           — { colKey: { v1, v2, v3 } }
     * @param {number}   opts.matchTypeCount
     * @returns {HTMLDivElement}  wrapper containing the TmUI table + legend
     */
    const build = (outfield, { filter: f, tops, matchTypeCount }) => {
        const dv = (val) => {
            const raw = f === 'total' ? val : Number(val);
            if (!raw) return '-';
            return _fmtVal(val, f);
        };
        const cc = (val, colKey, warnType) => {
            const raw = f === 'total' ? val : Number(val);
            if (!raw) return 'cell-zero';
            const t = _topCls(raw, colKey, tops);
            if (t) return 'cell-' + t;
            return warnType ? 'cell-' + warnType : '';
        };

        let totMin = 0, totRat = 0, totRatC = 0;
        let totINT = 0, totTKL = 0, totHC = 0, totTF = 0;
        let totDW = 0, totDL = 0, totFouls = 0, totYC = 0;

        const items = outfield.map(p => {
            const m = p.matches, mins = p.minutes, rat = p.avgRating;
            const intv   = _getDisplayValue(p.int,          m, mins, f);
            const tklv   = _getDisplayValue(p.tkl,          m, mins, f);
            const hcv    = _getDisplayValue(p.hc,           m, mins, f);
            const tfv    = _getDisplayValue(p.tf,           m, mins, f);
            const dwv    = _getDisplayValue(p.dw,           m, mins, f);
            const tdv    = _getDisplayValue(p.dw + p.dl,    m, mins, f);
            const foulsv = _getDisplayValue(p.fouls,        m, mins, f);
            const pg = _posGroup(p.position);
            const pl = _posLabel(p.position);
            const po = { gk: 0, def: 1, mid: 2, att: 3 }[pg] ?? 2;
            const minsDisp = f === 'per90' ? "90'" :
                f === 'average' ? (m > 0 ? Math.round(mins / m) : 0) + "'" :
                mins + "'";
            const dwpct = p.dw + p.dl > 0 ? p.dw / (p.dw + p.dl) * 100 : 0;

            totMin += mins;
            totINT += p.int; totTKL += p.tkl; totHC += p.hc; totTF += p.tf;
            totDW += p.dw; totDL += p.dl; totFouls += p.fouls; totYC += p.yc;
            if (rat > 0) { totRat += p.rating; totRatC += p.ratingCount; }

            return {
                pid: p.pid, name: p.name, pg, pl,
                posSort: po * 1000 + pl.charCodeAt(0),
                matches: m, minSort: mins, minsDisp,
                rat, intv, tklv, hcv, tfv, dwv, tdv, foulsv,
                dwpct,
                yc: p.yc,
                _dw: p.dw, _dl: p.dl,   // raw for footer pct
                lowMins: f === 'per90' && mins < 90,
            };
        });

        const tRat = totRatC > 0 ? totRat / totRatC : 0;
        const tf = v => v || '-';
        const totTD = totDW + totDL;

        const tbl = TmUI.table({
            headers: [
                { key: 'name',    label: 'Player',
                  render: (val, it) =>
                      `<a href="/players/${it.pid}/#/page/history/" class="tsa-plr-link" target="_blank">${val}</a>` +
                      (it.lowMins ? '<span class="tsa-low-mins-icon" title="Less than 90 min — per90 stats unreliable">⚠</span>' : '') },
                { key: 'posSort', label: 'Pos', align: 'c',
                  render: (_, it) => `<span class="tsa-pos tsa-pos-${it.pg}">${it.pl}</span>` },
                { key: 'matches', label: 'M',    align: 'c' },
                { key: 'minSort', label: 'Min',  align: 'c',
                  render: (_, it) => it.minsDisp },
                { key: 'rat',     label: 'Rat',  align: 'c',
                  render: (val) => val > 0
                      ? `<span class="tsa-rat" style="color:${_ratClr(val)}">${val.toFixed(2)}</span>`
                      : `<span class="cell-zero">-</span>` },
                // Defending group
                { key: 'intv',   label: 'INT',   align: 'c', thCls: 'col-group-start', cls: 'col-group-start',
                  render: (val) => `<span class="${cc(val,'int','')}">${dv(val)}</span>` },
                { key: 'tklv',   label: 'TKL',   align: 'c',
                  render: (val) => `<span class="${cc(val,'tkl','')}">${dv(val)}</span>` },
                { key: 'hcv',    label: 'HC',    align: 'c',
                  render: (val) => `<span class="${cc(val,'hc','')}">${dv(val)}</span>` },
                { key: 'tfv',    label: 'TF',    align: 'c',
                  render: (val) => `<span class="${cc(val,'','warn')}">${dv(val)}</span>` },
                // Duels group
                { key: 'tdv',    label: 'Σ',     align: 'c', thCls: 'col-group-start', cls: 'col-group-start',
                  render: (val) => `<span class="${cc(val,'','')}">${dv(val)}</span>` },
                { key: 'dwv',    label: 'W',     align: 'c',
                  render: (val) => `<span class="${cc(val,'dw','')}">${dv(val)}</span>` },
                { key: 'dwpct',  label: '%',     align: 'c', sortable: false,
                  render: (_, it) => `<span class="tsa-pct">${_pctStr(it._dw, it._dw + it._dl)}</span>` },
                // Discipline group
                { key: 'foulsv', label: 'Fouls', align: 'c', thCls: 'col-group-start', cls: 'col-group-start',
                  render: (val) => `<span class="${cc(val,'fouls','warn')}">${dv(val)}</span>` },
                { key: 'yc',     label: '🟨',    align: 'c',
                  render: (val) => `<span class="${val ? 'cell-yc' : 'cell-zero'}">${val || '-'}</span>` },
            ],
            items,
            sortKey: 'intv',
            sortDir: -1,
            rowCls: (it) => it.lowMins ? 'tsa-low-mins' : '',
            footer: [{
                cls: 'tmu-tbl-tot',
                cells: [
                    `Total (${outfield.length})`, '', matchTypeCount, `${totMin}'`,
                    { content: `<span class="tsa-rat" style="color:${_ratClr(tRat)}">${tRat > 0 ? tRat.toFixed(2) : '-'}</span>` },
                    // Defending
                    { content: tf(totINT),  cls: 'col-group-start' },
                    tf(totTKL), tf(totHC), tf(totTF),
                    // Duels
                    { content: tf(totTD),   cls: 'col-group-start' },
                    tf(totDW),
                    { content: `<span class="tsa-pct">${_pctStr(totDW, totTD)}</span>` },
                    // Discipline
                    { content: tf(totFouls), cls: 'col-group-start' },
                    { content: `<span class="${totYC ? 'cell-yc' : 'cell-zero'}">${tf(totYC)}</span>` },
                ],
            }],
        });

        // Wrap table + legend together
        const wrap = document.createElement('div');
        wrap.appendChild(tbl);

        const legend = document.createElement('div');
        legend.className = 'tsa-legend';
        legend.innerHTML = `
            <div class="tsa-legend-title">Column Descriptions</div>
            <div class="tsa-legend-grid">
                <div class="tsa-legend-item"><span class="tsa-legend-key">INT</span> Interceptions — read the play and intercepted the ball without a physical challenge</div>
                <div class="tsa-legend-item"><span class="tsa-legend-key">TKL</span> Tackles Won — successful challenges where the defender physically took the ball</div>
                <div class="tsa-legend-item"><span class="tsa-legend-key">HC</span> Header Clearances — aerial duels won, heading the ball away on crosses and corners</div>
                <div class="tsa-legend-item"><span class="tsa-legend-key">TF</span> Tackles Failed — attempted to stop attacker in a 1v1 run but got beaten, leading to a shot</div>
                <div class="tsa-legend-item"><span class="tsa-legend-key">Duels W</span> Duels Won — stopped the attacker in a 1v1 running duel or defensive situation</div>
                <div class="tsa-legend-item"><span class="tsa-legend-key">Fouls</span> Fouls Committed — times the player committed a foul during play</div>
            </div>`;
        wrap.appendChild(legend);

        return wrap;
    };

    window.TmStatsDefendingTable = { build };

})();



// ─── components/stats/tm-stats-adv-table.js ─────────────────

// tm-stats-adv-table.js — Attacking Styles table component
// API: window.TmStatsAdvTable.build(advData, { tf, mCount }) → HTMLElement
(function () {
    const STYLE_ORDER = [
        'Direct', 'Short Passing', 'Through Balls', 'Long Balls',
        'Wings', 'Corners', 'Free Kicks', 'Penalties'
    ];

    const _fix2 = window.TmUtils.fix2;

    function _fv(v, tf, mCount) {
        return tf === 'average' ? _fix2(v / mCount) : v;
    }

    function _dv(v, tf, mCount) {
        return v === 0 ? '-' : _fv(v, tf, mCount);
    }

    function _span(cls, content) {
        return `<span class="${cls}">${content}</span>`;
    }

    window.TmStatsAdvTable = {
        build(advData, { tf = 'total', mCount = 1 } = {}) {
            const items = STYLE_ORDER.map(style => {
                const d = advData[style] || { a: 0, l: 0, sh: 0, g: 0 };
                return { style, a: d.a, l: d.l, sh: d.sh, g: d.g };
            });

            let totA = 0, totL = 0, totSh = 0, totG = 0;
            items.forEach(it => { totA += it.a; totL += it.l; totSh += it.sh; totG += it.g; });
            const totPct = totA ? Math.round(totG / totA * 100) + '%' : '-';

            const headers = [
                {
                    key: 'style', label: 'Style', align: 'left', sortable: false,
                },
                {
                    key: 'a', label: 'Att', align: 'center', sortable: false,
                    render: (_, it) => it.a === 0
                        ? _span('adv-zero', '-')
                        : String(_fv(it.a, tf, mCount)),
                },
                {
                    key: 'l', label: 'Lost', align: 'center', sortable: false,
                    render: (_, it) => _span(it.l === 0 ? 'adv-zero' : 'adv-lost', _dv(it.l, tf, mCount)),
                },
                {
                    key: 'sh', label: 'Shot', align: 'center', sortable: false,
                    render: (_, it) => _span(it.sh === 0 ? 'adv-zero' : 'adv-shot', _dv(it.sh, tf, mCount)),
                },
                {
                    key: 'g', label: 'Goal', align: 'center', sortable: false,
                    render: (_, it) => _span(it.g === 0 ? 'adv-zero' : 'adv-goal', _dv(it.g, tf, mCount)),
                },
                {
                    key: 'pct', label: 'Conv%', align: 'center', sortable: false,
                    render: (_, it) => it.a ? Math.round(it.g / it.a * 100) + '%' : '-',
                },
            ];

            const footer = [{
                cls: 'tsa-adv-total',
                cells: [
                    'Total',
                    totA === 0 ? _span('adv-zero', '-') : String(_fv(totA, tf, mCount)),
                    _span(totL === 0 ? 'adv-zero' : 'adv-lost', _dv(totL, tf, mCount)),
                    _span(totSh === 0 ? 'adv-zero' : 'adv-shot', _dv(totSh, tf, mCount)),
                    _span(totG === 0 ? 'adv-zero' : 'adv-goal', _dv(totG, tf, mCount)),
                    totPct,
                ],
            }];

            return TmUI.table({ items, headers, footer });
        },
    };
})();



// ─── components/stats/tm-stats-gk-table.js ──────────────────

// ==UserScript==
// @name         TM Stats — Goalkeeper Table Component
// @namespace    https://trophymanager.com
// @version      1.0.0
// @description  Builds the Goalkeeper table (shown on all player sub-tabs) for the Season Match Analysis script.
//               Depends on: TmUI (tm-ui.js)
//               CSS classes (.tsa-plr-link, .tsa-low-mins*, .tsa-rat, .tsa-pct, .cell-*)
//               are injected by tm-stats.user.js.
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ── Pure helpers ──────────────────────────────────────────────────────

    const _ratClr  = window.TmUtils.ratingColor;

    const _getDisplayValue = (total, matches, minutes, filter) => {
        if (filter === 'total')   return total;
        if (filter === 'average') return matches > 0 ? (total / matches) : 0;
        if (filter === 'per90')   return minutes > 0 ? (total / minutes * 90) : 0;
        return total;
    };

    const _fmtVal = (val, filter) => {
        if (filter === 'total') return val;
        return Number(val).toFixed(2);
    };

    const _pctStr = (part, total) => total > 0 ? Math.round(part / total * 100) + '%' : '-';

    // ── Component ─────────────────────────────────────────────────────────

    /**
     * Build the goalkeeper table shown below outfield tables on all sub-tabs.
     *
     * @param {object[]} keepers        — aggregated keeper records
     * @param {object}   opts
     * @param {string}   opts.filter    — 'total' | 'average' | 'per90'
     * @param {boolean}  opts.showCards — show 🟨/🟥 columns (basic sub-tab only)
     * @returns {HTMLDivElement}  wrapper with section title + TmUI table
     */
    const build = (keepers, { filter: f, showCards }) => {
        const dv = (val) => {
            const raw = f === 'total' ? val : Number(val);
            if (!raw) return '-';
            return _fmtVal(val, f);
        };

        const items = keepers.map(p => {
            const m = p.matches, mins = p.minutes, rat = p.avgRating;
            const svv = _getDisplayValue(p.sv,          m, mins, f);
            const gv  = _getDisplayValue(p.g,           m, mins, f);
            const av  = _getDisplayValue(p.a,           m, mins, f);
            const spv = _getDisplayValue(p.sp,          m, mins, f);
            const tpv = _getDisplayValue(p.sp + p.up,   m, mins, f);
            const minsDisp = f === 'per90' ? "90'" :
                f === 'average' ? (m > 0 ? Math.round(mins / m) : 0) + "'" :
                mins + "'";
            return {
                pid: p.pid, name: p.name,
                matches: m, minSort: mins, minsDisp,
                rat, svv, gv, av, spv, tpv,
                yc: p.yc, rc: p.rc,
                _sp: p.sp, _tp: p.sp + p.up,
                lowMins: f === 'per90' && mins < 90,
            };
        });

        const headers = [
            { key: 'name',    label: 'Player',
              render: (val, it) =>
                  `<a href="/players/${it.pid}/#/page/history/" class="tsa-plr-link" target="_blank">${val}</a>` +
                  (it.lowMins ? '<span class="tsa-low-mins-icon" title="Less than 90 min — per90 stats unreliable">⚠</span>' : '') },
            { key: 'matches', label: 'M',   align: 'c' },
            { key: 'minSort', label: 'Min', align: 'c', render: (_, it) => it.minsDisp },
            { key: 'rat',     label: 'Rat', align: 'c',
              render: (val) => val > 0
                  ? `<span class="tsa-rat" style="color:${_ratClr(val)}">${val.toFixed(2)}</span>`
                  : `<span class="cell-zero">-</span>` },
            { key: 'svv',     label: 'Sv',  align: 'c', render: (val) => dv(val) },
            { key: 'gv',      label: 'G',   align: 'c', render: (val) => dv(val) },
            { key: 'av',      label: 'A',   align: 'c', render: (val) => dv(val) },
            { key: 'spv',     label: '✓',   align: 'c', render: (val) => dv(val) },
            { key: 'tpv',     label: 'Σ',   align: 'c', render: (val) => dv(val) },
            { key: '_sp',     label: '%',   align: 'c', sortable: false,
              render: (_, it) => `<span class="tsa-pct">${_pctStr(it._sp, it._tp)}</span>` },
        ];

        if (showCards) {
            headers.push(
                { key: 'yc', label: '🟨', align: 'c',
                  render: (val) => `<span class="${val ? 'cell-yc' : 'cell-zero'}">${val || '-'}</span>` },
                { key: 'rc', label: '🟥', align: 'c',
                  render: (val) => `<span class="${val ? 'cell-rc' : 'cell-zero'}">${val || '-'}</span>` },
            );
        }

        const tbl = TmUI.table({
            headers,
            items,
            sortKey: 'svv',
            sortDir: -1,
            rowCls: (it) => it.lowMins ? 'tsa-low-mins' : '',
        });

        const wrap = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'tsa-section-title';
        title.style.marginTop = '16px';
        title.textContent = 'Goalkeepers';
        wrap.appendChild(title);
        wrap.appendChild(tbl);
        return wrap;
    };

    window.TmStatsGKTable = { build };

})();



// ─── components/stats/tm-stats-team-tab.js ──────────────────

(function () {
    'use strict';

    const fix2 = v => (Math.round(v * 100) / 100).toFixed(2);

    const collectTacticValues = (opts) => {
        const base = opts.getActiveMatchType() === 'all' ? opts.getAllMatchData() : opts.getAllMatchData().filter(m => m.matchType === opts.getActiveMatchType());

        const allFilters = {
            ourFormation: opts.getFilterOurFormation(),
            ourStyle: opts.getFilterOurStyle(),
            ourMentality: opts.getFilterOurMentality(),
            oppFormation: opts.getFilterOppFormation(),
            oppStyle: opts.getFilterOppStyle(),
            oppMentality: opts.getFilterOppMentality(),
        };

        // Filter matches by all active filters EXCEPT the excluded one
        const filterExcluding = (excludeKey) => {
            return base.filter(md => {
                for (const [key, set] of Object.entries(allFilters)) {
                    if (key === excludeKey || !set) continue;
                    if (!set.has(md[key])) return false;
                }
                return true;
            });
        };

        const count = (arr, key) => {
            const map = {};
            arr.forEach(md => { const v = md[key]; map[v] = (map[v] || 0) + 1; });
            return Object.entries(map).sort((a, b) => b[1] - a[1]);
        };

        return {
            ourFormations: count(filterExcluding('ourFormation'), 'ourFormation'),
            ourStyles: count(filterExcluding('ourStyle'), 'ourStyle'),
            ourMentalities: count(filterExcluding('ourMentality'), 'ourMentality'),
            oppFormations: count(filterExcluding('oppFormation'), 'oppFormation'),
            oppStyles: count(filterExcluding('oppStyle'), 'oppStyle'),
            oppMentalities: count(filterExcluding('oppMentality'), 'oppMentality'),
        };
    };

    const pruneStaleFilters = (opts) => {
        const tv = collectTacticValues(opts);
        const prune = (filterSet, available, setter) => {
            if (!filterSet) return;
            const availKeys = new Set(available.map(([v]) => v));
            const cleaned = new Set([...filterSet].filter(v => availKeys.has(v)));
            if (cleaned.size === 0) setter(null);
            else if (cleaned.size !== filterSet.size) setter(cleaned);
        };
        prune(opts.getFilterOurFormation(), tv.ourFormations, opts.setFilterOurFormation);
        prune(opts.getFilterOurStyle(), tv.ourStyles, opts.setFilterOurStyle);
        prune(opts.getFilterOurMentality(), tv.ourMentalities, opts.setFilterOurMentality);
        prune(opts.getFilterOppFormation(), tv.oppFormations, opts.setFilterOppFormation);
        prune(opts.getFilterOppStyle(), tv.oppStyles, opts.setFilterOppStyle);
        prune(opts.getFilterOppMentality(), tv.oppMentalities, opts.setFilterOppMentality);
    };

    const buildDropdown = (label, icon, values, filterSet, dataAttr) => {
        const isAll = !filterSet;
        // Button display
        let btnContent;
        if (isAll) {
            btnContent = `<span class="tsa-dd-icon">${icon}</span>${label}: All`;
        } else {
            const tags = [...filterSet].map(v => `<span class="tsa-dd-tag">${v}</span>`).join('');
            btnContent = `<span class="tsa-dd-icon">${icon}</span><span class="tsa-dd-tags">${tags}</span>`;
        }
        let html = `<div class="tsa-dd-wrap">`;
        html += `<div class="tsa-dd-btn${isAll ? '' : ' has-filter'}" data-dd="${dataAttr}">${btnContent}<span class="tsa-dd-arrow">▾</span></div>`;
        html += `<div class="tsa-dd-panel" data-dd-panel="${dataAttr}">`;
        // "All" option
        html += `<div class="tsa-dd-opt tsa-dd-all${isAll ? ' selected' : ''}" data-tactic="${dataAttr}" data-val="__all__"><span class="tsa-dd-check">${isAll ? '✓' : ''}</span>All<span class="tsa-dd-cnt">${values.reduce((s, v) => s + v[1], 0)}</span></div>`;
        values.forEach(([val, cnt]) => {
            const sel = isAll || filterSet.has(val);
            html += `<div class="tsa-dd-opt${sel && !isAll ? ' selected' : ''}" data-tactic="${dataAttr}" data-val="${val}"><span class="tsa-dd-check">${sel && !isAll ? '✓' : ''}</span>${val}<span class="tsa-dd-cnt">${cnt}</span></div>`;
        });
        html += `</div></div>`;
        return html;
    };

    window.TmStatsTeamTab = {
        render(opts) {
            opts.aggregateIfNeeded();
            const body = document.getElementById('tsa-body');
            if (!body) return;

            const t = opts.getTeamOverall();

            // Match type filter buttons
            let html = opts.renderMatchTypeButtons();

            // Total/Average filter
            html += '<div class="tsa-filters">';
            ['total', 'average'].forEach(f => {
                const label = f.charAt(0).toUpperCase() + f.slice(1);
                html += `<div class="tsa-filter-btn${opts.getActiveTeamFilter() === f ? ' active' : ''}" data-tfilter="${f}">${label}</div>`;
            });
            html += '</div>';

            // Tactic dropdown filters
            const tv = collectTacticValues(opts);
            const hasOurFilters = tv.ourFormations.length > 1 || tv.ourStyles.length > 1 || tv.ourMentalities.length > 1;
            const hasOppFilters = tv.oppFormations.length > 1 || tv.oppStyles.length > 1 || tv.oppMentalities.length > 1;
            if (hasOurFilters) {
                html += '<div class="tsa-tactic-row">';
                html += '<span class="tsa-tr-label">Our:</span>';
                if (tv.ourFormations.length > 1) html += buildDropdown('Form', '📋', tv.ourFormations, opts.getFilterOurFormation(), 'ourFormation');
                if (tv.ourStyles.length > 1) html += buildDropdown('Style', '🎯', tv.ourStyles, opts.getFilterOurStyle(), 'ourStyle');
                if (tv.ourMentalities.length > 1) html += buildDropdown('Ment', '⚔', tv.ourMentalities, opts.getFilterOurMentality(), 'ourMentality');
                html += '</div>';
            }
            if (hasOppFilters) {
                html += '<div class="tsa-tactic-row">';
                html += '<span class="tsa-tr-label">Opp:</span>';
                if (tv.oppFormations.length > 1) html += buildDropdown('Form', '📋', tv.oppFormations, opts.getFilterOppFormation(), 'oppFormation');
                if (tv.oppStyles.length > 1) html += buildDropdown('Style', '🎯', tv.oppStyles, opts.getFilterOppStyle(), 'oppStyle');
                if (tv.oppMentalities.length > 1) html += buildDropdown('Ment', '⚔', tv.oppMentalities, opts.getFilterOppMentality(), 'oppMentality');
                html += '</div>';
            }

            const tf = opts.getActiveTeamFilter();
            const m = t.matches || 1;

            // Summary cards
            html += '<div class="tsa-summary-cards">';
            html += `<div class="tsa-summary-card"><div class="tsa-summary-val">${t.matches}</div><div class="tsa-summary-lbl">Matches</div></div>`;
            html += `<div class="tsa-summary-card"><div class="tsa-summary-val" style="color:#80e048">${t.wins}</div><div class="tsa-summary-lbl">Wins</div></div>`;
            html += `<div class="tsa-summary-card"><div class="tsa-summary-val" style="color:#bbcc00">${t.draws}</div><div class="tsa-summary-lbl">Draws</div></div>`;
            html += `<div class="tsa-summary-card"><div class="tsa-summary-val" style="color:#ee5533">${t.losses}</div><div class="tsa-summary-lbl">Losses</div></div>`;
            const gd = t.goalsFor - t.goalsAgainst;
            const gdSign = gd > 0 ? '+' : '';
            const gdColor = gd > 0 ? '#80e048' : gd < 0 ? '#ee5533' : '#bbcc00';
            html += `<div class="tsa-summary-card"><div class="tsa-summary-val" style="color:${gdColor}">${gdSign}${gd}</div><div class="tsa-summary-lbl">Goal Diff</div></div>`;
            html += '</div>';

            // Helper to apply avg/total filter to bar values
            const bv = (val) => tf === 'average' ? fix2(val / m) : val;

            // Bar stats – For vs Against
            const barRow = (label, forVal, agVal, suffix) => {
                const fv = tf === 'average' ? Number(fix2(forVal / m)) : forVal;
                const av = tf === 'average' ? Number(fix2(agVal / m)) : agVal;
                const fDisplay = tf === 'average' ? fix2(forVal / m) : forVal;
                const aDisplay = tf === 'average' ? fix2(agVal / m) : agVal;
                const sfx = suffix || '';
                const total = fv + av;
                const fPct = total === 0 ? 50 : Math.round(fv / total * 100);
                const aPct = 100 - fPct;
                const fLead = fv > av ? ' leading' : '';
                const aLead = av > fv ? ' leading' : '';
                return `<div class="tsa-stat-row">
                    <div class="tsa-stat-header">
                        <span class="tsa-stat-val for${fLead}">${fDisplay}${sfx}</span>
                        <span class="tsa-stat-label">${label}</span>
                        <span class="tsa-stat-val against${aLead}">${aDisplay}${sfx}</span>
                    </div>
                    <div class="tsa-stat-bar-wrap">
                        <div class="tsa-stat-seg for" style="width:${fPct}%"></div>
                        <div class="tsa-stat-seg against" style="width:${aPct}%"></div>
                    </div>
                </div>`;
            };

            const statLabel = tf === 'average' ? 'Match Statistics — Per Match Average (For vs Against)' : 'Match Statistics (For vs Against)';
            html += `<div class="tsa-section-title">${statLabel}</div>`;

            html += barRow('Goals', t.goalsFor, t.goalsAgainst);
            html += '<div class="tsa-stat-divider"></div>';
            if (t.possCount > 0) {
                const avgPossFor = Math.round(t.possFor / t.possCount);
                const avgPossAgainst = Math.round(t.possAgainst / t.possCount);
                html += barRow('Avg Possession', avgPossFor, avgPossAgainst, '%');
                html += '<div class="tsa-stat-divider"></div>';
            }
            html += barRow('Shots', t.shotsFor, t.shotsAgainst);
            html += barRow('On Target', t.soTFor, t.soTAgainst);
            html += '<div class="tsa-stat-divider"></div>';
            html += barRow('Yellow Cards', t.yellowFor, t.yellowAgainst);
            html += barRow('Red Cards', t.redFor, t.redAgainst);
            html += '<div class="tsa-stat-divider"></div>';
            html += barRow('Free Kicks', t.setPiecesFor, t.setPiecesAgainst);
            html += barRow('Penalties', t.penaltiesFor, t.penaltiesAgainst);

            // Attacking Styles – Our attacks
            html += '<div class="tsa-section-title">Our Attacking Styles</div>';
            html += '<div id="tsa-adv-tbl-for"></div>';

            // Attacking Styles – Opponent attacks
            html += '<div class="tsa-section-title">Opponent Attacking Styles</div>';
            html += '<div id="tsa-adv-tbl-against"></div>';

            // ── Match list ──
            html += '<div id="tsa-ml"></div>';

            body.innerHTML = html;

            // Inject adv-table components
            const phFor = body.querySelector('#tsa-adv-tbl-for');
            if (phFor) phFor.replaceWith(TmStatsAdvTable.build(opts.getTeamAggFor(), { tf, mCount: m }));
            const phAgainst = body.querySelector('#tsa-adv-tbl-against');
            if (phAgainst) phAgainst.replaceWith(TmStatsAdvTable.build(opts.getTeamAggAgainst(), { tf, mCount: m }));
            const phMl = body.querySelector('#tsa-ml');
            if (phMl) phMl.replaceWith(TmStatsMatchList.build(opts.getLastFilteredMatches()));

            // Wire match type filter
            body.querySelectorAll('.tsa-mf-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    opts.setActiveMatchType(btn.dataset.mtype);
                    // Reset tactic filters when match type changes
                    opts.setFilterOurFormation(null);
                    opts.setFilterOurStyle(null);
                    opts.setFilterOurMentality(null);
                    opts.setFilterOppFormation(null);
                    opts.setFilterOppStyle(null);
                    opts.setFilterOppMentality(null);
                    opts.rerender();
                });
            });
            // Wire team filter (total/average)
            body.querySelectorAll('[data-tfilter]').forEach(btn => {
                btn.addEventListener('click', () => {
                    opts.setActiveTeamFilter(btn.dataset.tfilter);
                    opts.rerender();
                });
            });
            // Wire dropdown open/close
            const filterMap = {
                ourFormation: v => opts.setFilterOurFormation(v),
                ourStyle: v => opts.setFilterOurStyle(v),
                ourMentality: v => opts.setFilterOurMentality(v),
                oppFormation: v => opts.setFilterOppFormation(v),
                oppStyle: v => opts.setFilterOppStyle(v),
                oppMentality: v => opts.setFilterOppMentality(v),
            };
            const filterGet = {
                ourFormation: () => opts.getFilterOurFormation(),
                ourStyle: () => opts.getFilterOurStyle(),
                ourMentality: () => opts.getFilterOurMentality(),
                oppFormation: () => opts.getFilterOppFormation(),
                oppStyle: () => opts.getFilterOppStyle(),
                oppMentality: () => opts.getFilterOppMentality(),
            };

            const closeAllDropdowns = () => {
                body.querySelectorAll('.tsa-dd-panel.open').forEach(p => p.classList.remove('open'));
            };

            // Toggle dropdown on button click
            body.querySelectorAll('.tsa-dd-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const attr = btn.dataset.dd;
                    const panel = body.querySelector(`.tsa-dd-panel[data-dd-panel="${attr}"]`);
                    const wasOpen = panel.classList.contains('open');
                    closeAllDropdowns();
                    if (!wasOpen) {
                        // Check if panel would go off-screen right
                        panel.classList.add('open');
                        const rect = panel.getBoundingClientRect();
                        if (rect.right > window.innerWidth - 10) {
                            panel.classList.add('align-right');
                        }
                    }
                });
            });

            // Handle option clicks
            body.querySelectorAll('.tsa-dd-opt').forEach(opt => {
                opt.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const attr = opt.dataset.tactic;
                    const val = opt.dataset.val;
                    const currentSet = filterGet[attr]();
                    const allVals = [...body.querySelectorAll(`.tsa-dd-opt[data-tactic="${attr}"]:not(.tsa-dd-all)`)].map(o => o.dataset.val);

                    if (val === '__all__') {
                        // Reset to all
                        filterMap[attr](null);
                    } else if (!currentSet) {
                        // Currently all — first click selects only this one
                        filterMap[attr](new Set([val]));
                    } else if (currentSet.has(val)) {
                        // Toggle off
                        currentSet.delete(val);
                        if (currentSet.size === 0) filterMap[attr](null);
                    } else {
                        // Toggle on
                        currentSet.add(val);
                        if (currentSet.size === allVals.length) filterMap[attr](null);
                    }
                    pruneStaleFilters(opts);
                    opts.setLastAggKey(null);
                    opts.rerender();
                });
            });

            // Close dropdowns on outside click
            const outsideClick = (e) => {
                if (!e.target.closest('.tsa-dd-wrap')) closeAllDropdowns();
            };
            document.addEventListener('click', outsideClick, { once: true, capture: true });
            // Re-register on each render since body.innerHTML is replaced
            body.addEventListener('click', (e) => {
                if (!e.target.closest('.tsa-dd-wrap')) closeAllDropdowns();
            });
        },
    };

})();



// ─── components/stats/tm-stats-player-tab.js ────────────────

(function () {
    'use strict';

    const getDisplayValue = (total, matches, minutes, filter) => {
        if (filter === 'total') return total;
        if (filter === 'average') return matches > 0 ? (total / matches) : 0;
        if (filter === 'per90') return minutes > 0 ? (total / minutes * 90) : 0;
        return total;
    };

    const getTopValues = (players, columns, filter) => {
        return window.TmUtils.getTopNThresholds(players, columns, (p, col) => {
            if (col === 'rat') return p.avgRating;
            const raw = col === 'tp' ? (p.sp || 0) + (p.up || 0)
                : col === 'tc' ? (p.sc || 0) + (p.uc || 0)
                    : col === 'td' ? (p.dw || 0) + (p.dl || 0)
                        : (p[col] || 0);
            return getDisplayValue(raw, p.matches, p.minutes, filter);
        });
    };

    window.TmStatsPlayerTab = {
        render(opts) {
            opts.aggregateIfNeeded();
            const body = document.getElementById('tsa-body');
            if (!body) return;

            const matchTypeCount = opts.getTeamOverall().matches;

            // Match type filter buttons with W-D-L
            let html = opts.renderMatchTypeButtons();

            // Total/Average/Per90 filter
            html += '<div class="tsa-filters">';
            ['total', 'average', 'per90'].forEach(f => {
                const label = f === 'per90' ? 'Per 90 min' : f.charAt(0).toUpperCase() + f.slice(1);
                html += `<div class="tsa-filter-btn${opts.getActiveFilter() === f ? ' active' : ''}" data-filter="${f}">${label}</div>`;
            });
            html += '</div>';

            // Sub-tab buttons
            html += '<div class="tsa-subtabs">';
            [['basic', 'Basic'], ['attacking', 'Attacking'], ['defending', 'Defending']].forEach(([k, label]) => {
                html += `<div class="tsa-subtab-btn${opts.getActivePlayerSubTab() === k ? ' active' : ''}" data-subtab="${k}">${label}</div>`;
            });
            html += '</div>';

            // Player table
            const players = Object.entries(opts.getPlayerAgg()).map(([pid, pa]) => ({
                pid,
                ...pa,
                avgRating: pa.ratingCount > 0 ? pa.rating / pa.ratingCount : 0,
            }));

            const f = opts.getActiveFilter();

            // Compute top 3 for highlighting (outfield only)
            const outfield = players.filter(p => !p.isGK);
            const keepers = players.filter(p => p.isGK);
            const topCols = ['g', 'gf', 'gh', 'a', 'shf', 'shh', 'sotf', 'soth', 'sot', 'sh', 'tp', 'sp', 'sc', 'int', 'tkl', 'hc', 'stp', 'rat', 'kp', 'dw', 'fouls'];
            const tops = getTopValues(outfield, topCols, f);

            // ═══ BASIC TAB ═══
            if (opts.getActivePlayerSubTab() === 'basic') {
                html += '<div id="tsa-basic-tbl"></div>';
            }

            // ═══ ATTACKING TAB ═══
            if (opts.getActivePlayerSubTab() === 'attacking') {
                html += '<div id="tsa-attacking-tbl"></div>';
            }

            // ═══ DEFENDING TAB ═══
            if (opts.getActivePlayerSubTab() === 'defending') {
                html += '<div id="tsa-defending-tbl"></div>';
            }

            // ── Goalkeeper table ──
            if (keepers.length > 0) {
                html += '<div id="tsa-gk-tbl"></div>';
            }

            body.innerHTML = html;

            // ── Inject player sub-tab tables ──
            if (opts.getActivePlayerSubTab() === 'basic') {
                const ph = body.querySelector('#tsa-basic-tbl');
                if (ph) ph.replaceWith(TmStatsBasicTable.build(outfield, { filter: f, tops, matchTypeCount }));
            }
            if (opts.getActivePlayerSubTab() === 'attacking') {
                const ph = body.querySelector('#tsa-attacking-tbl');
                if (ph) ph.replaceWith(TmStatsAttackingTable.build(outfield, { filter: f, tops, matchTypeCount }));
            }
            if (opts.getActivePlayerSubTab() === 'defending') {
                const ph = body.querySelector('#tsa-defending-tbl');
                if (ph) ph.replaceWith(TmStatsDefendingTable.build(outfield, { filter: f, tops, matchTypeCount }));
            }
            if (keepers.length > 0) {
                const ph = body.querySelector('#tsa-gk-tbl');
                if (ph) ph.replaceWith(TmStatsGKTable.build(keepers, { filter: f, showCards: opts.getActivePlayerSubTab() === 'basic' }));
            }

            // Wire events
            body.querySelectorAll('.tsa-subtab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    opts.setActivePlayerSubTab(btn.dataset.subtab);
                    opts.rerender();
                });
            });
            body.querySelectorAll('.tsa-filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    opts.setActiveFilter(btn.dataset.filter);
                    opts.rerender();
                });
            });
            body.querySelectorAll('.tsa-mf-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    opts.setActiveMatchType(btn.dataset.mtype);
                    // Reset tactic filters when match type changes
                    opts.setFilterOurFormation(null);
                    opts.setFilterOurStyle(null);
                    opts.setFilterOurMentality(null);
                    opts.setFilterOppFormation(null);
                    opts.setFilterOppStyle(null);
                    opts.setFilterOppMentality(null);
                    opts.rerender();
                });
            });
        },
    };

})();


// ─── tm-stats.user.js (guarded: /^\/statistics\/club\//) ──────────────
if (/^\/statistics\/club\//.test(location.pathname)) {

(function () {
    'use strict';

    // ─── Extract club ID from URL ────────────────────────────────────────
    const urlMatch = location.pathname.match(/\/statistics\/club\/(\d+)/);
    if (!urlMatch) return;
    const CLUB_ID = urlMatch[1];


    // ─── State ───────────────────────────────────────────────────────────
    let allMatchData = [];       // Array of processed match data objects
    let playerAgg = {};          // playerId → aggregated stats
    let teamAggFor = {};         // Our attacking styles (for)
    let teamAggAgainst = {};     // Opponent attacking styles (against)
    let teamOverall = {};        // Overall match stats (shots, cards, etc.)
    let lastFilteredMatches = []; // Filtered match list (after all filters)
    let activeTab = 'player';
    let activeFilter = 'total';  // total | average | per90
    let activeTeamFilter = 'total'; // total | average  (team tab)
    let activeMatchType = 'all'; // all | league | friendly | cup | fl
    let lastAggKey = null; // track when aggregation needs refresh
    // Multi-select tactic filters (null = all selected)
    let filterOurFormation = null;   // Set or null
    let filterOurStyle = null;
    let filterOurMentality = null;
    let filterOppFormation = null;
    let filterOppStyle = null;
    let filterOppMentality = null;
    let activePlayerSubTab = 'basic'; // basic | attacking | defending
    let loadingComplete = false;
    let matchCount = { total: 0, loaded: 0 };

    // ─── Collect played matches from fixtures ────────────────────────────
    const getPlayedMatches = (fixturesData) => {
        const matches = [];
        Object.values(fixturesData).forEach(month => {
            if (!month.matches) return;
            month.matches.forEach(m => {
                if (m.result && m.result !== 'x-x') {
                    matches.push({
                        id: m.id,
                        date: m.date,
                        matchtype: m.matchtype,
                        matchtype_name: m.matchtype_sort || m.matchtype_name,
                        hometeam: String(m.hometeam),
                        awayteam: String(m.awayteam),
                        hometeam_name: m.hometeam_name,
                        awayteam_name: m.awayteam_name,
                        result: m.result,
                        isHome: String(m.hometeam) === CLUB_ID,
                    });
                }
            });
        });
        return matches;
    };

    // ─── Aggregate all match data (only when filters change) ──────────
    const getAggKey = () => JSON.stringify([activeMatchType,
        filterOurFormation ? [...filterOurFormation] : null,
        filterOurStyle ? [...filterOurStyle] : null,
        filterOurMentality ? [...filterOurMentality] : null,
        filterOppFormation ? [...filterOppFormation] : null,
        filterOppStyle ? [...filterOppStyle] : null,
        filterOppMentality ? [...filterOppMentality] : null]);
    const aggregateIfNeeded = () => {
        const key = getAggKey();
        if (lastAggKey === key) return;
        const result = TmStatsAggregator.aggregate(allMatchData, {
            activeMatchType,
            filterOurFormation, filterOurStyle, filterOurMentality,
            filterOppFormation, filterOppStyle, filterOppMentality,
        });
        playerAgg = result.playerAgg;
        teamAggFor = result.teamAggFor;
        teamAggAgainst = result.teamAggAgainst;
        teamOverall = result.teamOverall;
        lastFilteredMatches = result.lastFilteredMatches;
        lastAggKey = key;
    };

    // ─── Render functions ────────────────────────────────────────────────

    // ─── Collect unique tactic values with cascading filters ────────────
    // For each filter field, show only values that exist in matches passing
    // all OTHER active filters (so options narrow as you select).
    // ─── Shared match type filter buttons ────────────────────────────────
    const MATCH_TYPES = [
        { key: 'all', label: 'All' },
        { key: 'league', label: 'League' },
        { key: 'friendly', label: 'Friendly' },
        { key: 'fl', label: 'FL' },
        { key: 'cup', label: 'Cup' },
    ];

    const renderMatchTypeButtons = () => {
        let html = '<div class="tsa-match-filters">';
        MATCH_TYPES.forEach(mt => {
            const count = mt.key === 'all' ? allMatchData.length : allMatchData.filter(m => m.matchType === mt.key).length;
            if (count === 0 && mt.key !== 'all') return;
            const wdl = getWDL(mt.key);
            html += `<div class="tsa-mf-btn${activeMatchType === mt.key ? ' active' : ''}" data-mtype="${mt.key}">${mt.label} (${count}) <span class="tsa-mf-wdl">${wdl.w}W-${wdl.d}D-${wdl.l}L</span></div>`;
        });
        html += '</div>';
        return html;
    };

    // ─── Get W-D-L for a match type filter ────────────────────────────────
    const getWDL = (matchTypeKey) => {
        const matches = matchTypeKey === 'all' ? allMatchData : allMatchData.filter(m => m.matchType === matchTypeKey);
        let w = 0, d = 0, l = 0;
        matches.forEach(md => {
            const [h, a] = md.matchInfo.result.split('-').map(Number);
            const our = md.isHome ? h : a;
            const opp = md.isHome ? a : h;
            if (our > opp) w++; else if (our === opp) d++; else l++;
        });
        return { w, d, l };
    };

    const renderPlayerTab = () => TmStatsPlayerTab.render({
        aggregateIfNeeded,
        renderMatchTypeButtons,
        getTeamOverall: () => teamOverall,
        getPlayerAgg: () => playerAgg,
        getActiveFilter: () => activeFilter,
        setActiveFilter: v => { activeFilter = v; },
        getActiveMatchType: () => activeMatchType,
        setActiveMatchType: v => { activeMatchType = v; },
        getActivePlayerSubTab: () => activePlayerSubTab,
        setActivePlayerSubTab: v => { activePlayerSubTab = v; },
        setFilterOurFormation: v => { filterOurFormation = v; },
        setFilterOurStyle: v => { filterOurStyle = v; },
        setFilterOurMentality: v => { filterOurMentality = v; },
        setFilterOppFormation: v => { filterOppFormation = v; },
        setFilterOppStyle: v => { filterOppStyle = v; },
        setFilterOppMentality: v => { filterOppMentality = v; },
        rerender: () => renderPlayerTab(),
    });

    const renderTeamTab = () => TmStatsTeamTab.render({
        aggregateIfNeeded,
        renderMatchTypeButtons,
        getTeamOverall: () => teamOverall,
        getTeamAggFor: () => teamAggFor,
        getTeamAggAgainst: () => teamAggAgainst,
        getLastFilteredMatches: () => lastFilteredMatches,
        getAllMatchData: () => allMatchData,
        getActiveTeamFilter: () => activeTeamFilter,
        setActiveTeamFilter: v => { activeTeamFilter = v; },
        getActiveMatchType: () => activeMatchType,
        setActiveMatchType: v => { activeMatchType = v; },
        getFilterOurFormation: () => filterOurFormation,
        setFilterOurFormation: v => { filterOurFormation = v; },
        getFilterOurStyle: () => filterOurStyle,
        setFilterOurStyle: v => { filterOurStyle = v; },
        getFilterOurMentality: () => filterOurMentality,
        setFilterOurMentality: v => { filterOurMentality = v; },
        getFilterOppFormation: () => filterOppFormation,
        setFilterOppFormation: v => { filterOppFormation = v; },
        getFilterOppStyle: () => filterOppStyle,
        setFilterOppStyle: v => { filterOppStyle = v; },
        getFilterOppMentality: () => filterOppMentality,
        setFilterOppMentality: v => { filterOppMentality = v; },
        setLastAggKey: v => { lastAggKey = v; },
        rerender: () => renderTeamTab(),
    });

    const renderCurrentTab = () => {
        if (activeTab === 'player') renderPlayerTab();
        else renderTeamTab();
    };

    // ─── Build the main container ────────────────────────────────────────
    const buildUI = () => {
        const container = document.querySelector('.column2_a');
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        const wrap = document.createElement('div');
        wrap.className = 'tsa-wrap';
        wrap.innerHTML = `
            <div class="tsa-header">
                <div class="tsa-title">Season Match Analysis</div>
                <div class="tsa-subtitle" id="tsa-subtitle">Loading...</div>
            </div>
            <div class="tsa-tabs">
                <div class="tsa-tab${activeTab === 'player' ? ' active' : ''}" data-tab="player">Player</div>
                <div class="tsa-tab${activeTab === 'team' ? ' active' : ''}" data-tab="team">Team</div>
            </div>
            <div class="tsa-body" id="tsa-body">
                ${TmUI.loading('Loading match data…')}
                <div class="tsa-progress" id="tsa-progress">0 / 0 matches</div>
            </div>
        `;

        container.appendChild(wrap);

        // Tab click handling
        wrap.querySelectorAll('.tsa-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                if (!loadingComplete) return;
                wrap.querySelectorAll('.tsa-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                activeTab = tab.dataset.tab;
                renderCurrentTab();
            });
        });
    };

    const updateProgress = () => {
        const el = document.getElementById('tsa-progress');
        if (el) el.textContent = `${matchCount.loaded} / ${matchCount.total} matches`;
    };

    // ─── Main initialization ─────────────────────────────────────────────
    const init = async () => {
        TmStatsStyles.inject();
        buildUI();

        try {
            // 1. Fetch fixtures (TmMatchCacheDB opens lazily on first fetchMatchCached call)
            const fixtures = await window.TmApi.fetchClubFixtures(CLUB_ID);
            if (!fixtures) throw new Error('Failed to fetch fixtures');
            const playedMatches = getPlayedMatches(fixtures);
            matchCount.total = playedMatches.length;
            matchCount.loaded = 0;
            updateProgress();

            // Prune stale entries from previous seasons (fire-and-forget)
            window.TmMatchCacheDB.pruneExcept(playedMatches.map(m => m.id));

            // 2. Fetch each match in batches of 3 — served from IndexedDB cache after first visit
            const BATCH_SIZE = 3;
            for (let i = 0; i < playedMatches.length; i += BATCH_SIZE) {
                const batch = playedMatches.slice(i, i + BATCH_SIZE);
                const results = await Promise.all(
                    batch.map(async (matchInfo) => {
                        try {
                            const mData = await TmApi.fetchMatchCached(matchInfo.id);
                            if (!mData) throw new Error('null response');
                            return TmStatsMatchProcessor.process(matchInfo, mData, CLUB_ID);
                        } catch (err) {
                            console.warn(`Failed to load match ${matchInfo.id}:`, err);
                            return null;
                        }
                    })
                );
                results.forEach(r => { if (r) allMatchData.push(r); });
                matchCount.loaded += batch.length;
                updateProgress();
            }

            // 3. Done loading
            loadingComplete = true;
            lastAggKey = null; // force first aggregation

            // Get club name from first match data if available
            if (allMatchData.length > 0) {
                const firstMatch = allMatchData[0];
                const clubName = firstMatch.matchInfo.isHome
                    ? firstMatch.matchInfo.hometeam_name
                    : firstMatch.matchInfo.awayteam_name;
                const subtitle = document.querySelector('.tsa-subtitle');
                if (subtitle) subtitle.textContent = `${clubName} — ${allMatchData.length} matches analyzed`;
            }

            renderCurrentTab();

        } catch (err) {
            console.error('TM Season Analysis error:', err);
            const body = document.getElementById('tsa-body');
            if (body) body.innerHTML = TmUI.error(`Error loading data: ${err.message}`);
        }
    };

    // Wait for jQuery and page load
    const waitForReady = () => {
        if (typeof $ !== 'undefined' && document.querySelector('.column2_a')) {
            init();
        } else {
            setTimeout(waitForReady, 500);
        }
    };

    waitForReady();
})();
}
