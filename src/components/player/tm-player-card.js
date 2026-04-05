import { TmConst } from '../../lib/tm-constants.js';
import { TmLib } from '../../lib/tm-lib.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmStars } from '../shared/tm-stars.js';

const CSS = `
/* ═══════════════════════════════════════
   PLAYER CARD (tmpc-*)
   ═══════════════════════════════════════ */
.tmpc-header {
    display: flex; gap: var(--tmu-space-lg); padding: var(--tmu-space-lg); align-items: flex-start;
}
.tmpc-photo {
    width: 110px; min-width: 110px; border-radius: var(--tmu-space-sm);
    border: 3px solid var(--tmu-border-faint); display: block;
}
.tmpc-info { flex: 1; min-width: 0; }
.tmpc-top-grid {
    display: grid; grid-template-columns: 1fr auto;
    gap: 0 var(--tmu-space-sm); align-items: center; margin-bottom: var(--tmu-space-md);
}
.tmpc-name {
    font-size: var(--tmu-font-lg); font-weight: 800; color: var(--tmu-text-strong);
    line-height: 1.2;
}
.tmpc-pos-row {
    display: flex; align-items: center; gap: var(--tmu-space-sm);
    flex-wrap: wrap;
}
.tmpc-details {
    display: grid; grid-template-columns: 1fr 1fr; gap: var(--tmu-space-xs) var(--tmu-space-lg);
}
.tmpc-val {
    color: var(--tmu-text-main); font-size: var(--tmu-font-sm); font-weight: 700;
}
.tmpc-pos-ratings {
    border-top: 1px solid var(--tmu-border-faint); padding: var(--tmu-space-sm) var(--tmu-space-lg);
}
.tmpc-rating-row {
    display: flex; align-items: center; gap: var(--tmu-space-md);
    padding: var(--tmu-space-xs) 0;
}
.tmpc-rating-row + .tmpc-rating-row { border-top: 1px solid var(--tmu-border-soft-alpha-mid); }
.tmpc-rating-row:hover { background: var(--tmu-border-contrast); }
.tmpc-pos-bar {
    width: var(--tmu-space-xs); height: 22px; border-radius: var(--tmu-space-xs); flex-shrink: 0;
}
.tmpc-pos-name {
    font-size: var(--tmu-font-xs); font-weight: 700; min-width: 32px;
    letter-spacing: 0.3px;
}
.tmpc-pos-stat {
    display: flex; align-items: baseline; gap: var(--tmu-space-xs); margin-left: auto;
}
.tmpc-pos-stat + .tmpc-pos-stat { margin-left: var(--tmu-space-lg); }
.tmpc-pos-stat-lbl {
    color: var(--tmu-text-dim); font-size: var(--tmu-font-2xs);
}
.tmpc-pos-stat-val {
    font-size: var(--tmu-font-md); font-weight: 800; letter-spacing: -0.3px;
}
.tmpc-expand-toggle {
    display: flex; align-items: center; justify-content: center;
    gap: var(--tmu-space-sm); padding: var(--tmu-space-xs) 0; cursor: pointer;
    border-top: 1px solid var(--tmu-border-faint);
    color: var(--tmu-text-dim); font-size: var(--tmu-font-xs); font-weight: 600;
    letter-spacing: 0.4px; text-transform: uppercase;
    transition: color .15s;
}
.tmpc-expand-toggle:hover { color: var(--tmu-accent); }
.tmpc-expand-chevron {
    display: inline-block; font-size: var(--tmu-font-xs); transition: transform .2s;
}
.tmpc-expand-toggle.tmpc-expanded .tmpc-expand-chevron { transform: rotate(180deg); }
.tmpc-all-positions {
    max-height: 0; overflow: hidden; transition: max-height .3s ease;
}
.tmpc-all-positions.tmpc-expanded {
    max-height: 600px;
}
.tmpc-all-positions .tmpc-rating-row.tmpc-is-player-pos {
    background: var(--tmu-success-fill-soft);
}
.tmpc-rec-stars { font-size: var(--tmu-font-md); letter-spacing: 1px; margin-top: var(--tmu-space-xs); }
.tmpc-club-flag { display: inline-block; vertical-align: middle; margin-left: var(--tmu-space-xs); }
.tmpc-club-link { color: var(--tmu-accent); text-decoration: none; font-weight: 600; }
.tmpc-club-link:hover { text-decoration: underline; }
.tmpc-wage { color: var(--tmu-warning); }
.tmpc-badge-value-muted { color: var(--tmu-text-dim); }
.tmpc-badge-value-strong { color: var(--tmu-text-strong); }
`;
const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);
let _hasNTSnapshot = false;

const extractImageSrc = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const srcMatch = raw.match(/src=['"]([^'"]+)['"]/i);
    return srcMatch ? srcMatch[1] : raw;
};

/**
 * render({ player, club })
 *
 * @param {object}      props.player    - Raw tooltip player object (from fetchPlayerInfo).
 * @param {object|null} props.club      - Raw tooltip club object, or null.
 *
* Reads the native player DOM as source data and renders the player card into our main rail.
 * Returns { asi, ti, routine } so the caller can update shared state, or null if prerequisites not met.
 */
const render = ({ player, club } = {}) => {
    const { calculatePlayerR5, calculatePlayerREC } = TmLib;
    const { getColor } = TmUtils;
    const { R5_THRESHOLDS, REC_THRESHOLDS, TI_THRESHOLDS, RTN_THRESHOLDS, POSITION_MAP } = TmConst;
    const badgeHtml = (opts, tone = 'muted') => TmUI.badge({ size: 'md', shape: 'rounded', weight: 'heavy', ...opts }, tone);
    const infoTable = document.querySelector('table.info_table.zebra');
    const existingCard = document.querySelector('#tmvp-player-card');
    const col = document.querySelector('#tmvp-main');
    if (!player) return null;
    if ((!infoTable && !existingCard) || !col) return null;

    /* DOM layout refs */
    const photoSrc = extractImageSrc(player.appearance) || '/pics/player_pic2.php';

    /* ── Data from player object ── */
    const asiDisplay = player.asi > 0 ? player.asi.toLocaleString() : '-';

    const wageNum = player.wage || 0;
    const wageDisplay = wageNum > 0 ? `€ ${wageNum.toLocaleString()}` : '-';

    const statusHtml = typeof player.status === 'string' ? player.status : '';

    /* ── Club ── */
    const clubName = club?.club_name || club?.name || '-';
    const clubHref = club ? `/club/${player.club_id || club.id}/` : '';
    const clubCountry = club?.country || '';
    const clubFlag = clubCountry ? `<span class="tmpc-club-flag flag-img-${clubCountry}"></span>` : '';

    /* ── Player-data-first: flag, position, recommendation; DOM only as fallback ── */
    const playerName = player.name || 'Player';
    const flagHtml = String(player.flag || '').trim();
    const hasNT = !!document.querySelector('.nt_icon') || _hasNTSnapshot;

    const recStarsHtml = TmStars.recommendation(player?.rec_sort, 'tmpc-rec-stars');
    const ntBadge = hasNT ? badgeHtml({ icon: '🏆', label: 'NT', size: 'xs', weight: 'bold' }, 'warn') : '';
    const posChips = TmPosition.chip(player.positions);

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
                        <span class="tmpc-pos-stat-lbl tmu-kicker">R5</span>
                        <span class="tmpc-pos-stat-val tmu-tabular" style="color:${getColor(position.r5, R5_THRESHOLDS)}">${position.r5}</span>
                    </span>
                    <span class="tmpc-pos-stat">
                        <span class="tmpc-pos-stat-lbl tmu-kicker">REC</span>
                        <span class="tmpc-pos-stat-val tmu-tabular" style="color:${getColor(position.rec, REC_THRESHOLDS)}">${position.rec}</span>
                    </span> 
                </div>`;
        }
        /* Expand chevron for all positions */
        let allPositions = '';
        if (!player.isGK) {
            const positions = Array.isArray(player.allPositionRatings) && player.allPositionRatings.length
                ? player.allPositionRatings
                : (() => {
                    const map = new Map();
                    const positionData = Object.values(POSITION_MAP)
                        .filter(position => position.id !== 9);
                    for (const position of positionData) {
                        if (map.has(position.id)) map.get(position.id).position += ', ' + position.position;
                        else map.set(position.id, { ...position });
                    }
                    return [...map.values()].sort((a, b) => a.ordering - b.ordering);
                })();
            let allPositionRatings = '';
            for (const position of positions) {
                const playerPosition = player.positions.find(pos => pos.id === position.id);
                const isPlayerPosition = !!playerPosition;
                const positionR5 = playerPosition?.r5 ?? calculatePlayerR5(position, player);
                const positionRec = playerPosition?.rec ?? calculatePlayerREC(position, player);
                const playerCls = isPlayerPosition ? ' tmpc-is-player-pos' : '';
                allPositionRatings += `
                    <div class="tmpc-rating-row${playerCls}">
                        <div class="tmpc-pos-bar" style="background:${position.color}"></div>
                        <span class="tmpc-pos-name" style="color:${position.color}">${position.position}</span>
                        <span class="tmpc-pos-stat">
                            <span class="tmpc-pos-stat-lbl tmu-kicker">R5</span>
                            <span class="tmpc-pos-stat-val tmu-tabular" style="color:${getColor(positionR5, R5_THRESHOLDS)}">${positionR5}</span>
                        </span>
                        <span class="tmpc-pos-stat">
                            <span class="tmpc-pos-stat-lbl tmu-kicker">REC</span>
                            <span class="tmpc-pos-stat-val tmu-tabular" style="color:${getColor(positionRec, REC_THRESHOLDS)}">${positionRec}</span>
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
                        ${badgeHtml({ slot: `<span class="tmu-badge-label">ASI</span><span class="tmu-badge-value ${player.asi > 0 ? 'tmpc-badge-value-strong' : 'tmpc-badge-value-muted'}">${asiDisplay}</span>` })}
                        <div class="tmpc-pos-row">${posChips}${ntBadge}</div>
                        ${badgeHtml({ slot: `<span class="tmu-badge-label">TI</span><span class="tmu-badge-value" style="color:${getColor(player.ti, TI_THRESHOLDS)}">${player.ti || '—'}</span>` })}
                    </div>
                    <div class="tmpc-details">
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">Club</span>
                            <span class="tmpc-val tmu-tabular">
                                <a href="${clubHref}" class="tmpc-club-link">${clubName}</a> ${clubFlag}
                            </span>
                        </tm-row>
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">Age</span>
                            <span class="tmpc-val tmu-tabular">${player.ageMonthsString}</span>
                        </tm-row>
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">Wage</span>
                            <span class="tmpc-val tmpc-wage tmu-tabular">${wageDisplay}</span>
                        </tm-row>
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">Status</span>
                            <span class="tmpc-val">${statusHtml}</span>
                        </tm-row>
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">REC</span>
                            ${recStarsHtml}
                        </tm-row>
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">Routine</span>
                            <span class="tmpc-val tmu-tabular" style="color:${getColor(player.routine, RTN_THRESHOLDS)}">${player.routine.toFixed(1)}</span>
                        </tm-row>
                    </div> 
                </div>
            </div>
            ${positionRatings}
        </tm-card>`;

    _hasNTSnapshot = hasNT;

    const cardEl = document.createElement('div');
    TmUI.render(cardEl, html);
    const cardNode = cardEl.firstElementChild;
    if (!cardNode) return null;
    cardNode.id = 'tmvp-player-card';

    if (existingCard && existingCard.parentNode === col) {
        col.replaceChild(cardNode, existingCard);
    } else {
        col.prepend(cardNode);
    }

    return;
};

export const TmPlayerCard = { render };
