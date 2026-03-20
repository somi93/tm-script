import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmMatchHoverCard } from './tm-match-hover-card.js';
import { TmMatchRatings } from './tm-match-ratings.js';

const { R5_THRESHOLDS } = TmConst;
const getColor = TmUtils.getColor;
const STYLE_ID = 'tmvu-match-row-style';

const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-match-list {
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(61,104,40,0.18);
            border-radius: 10px;
            overflow: hidden;
        }

        .tmvu-match-row {
            position: relative;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            align-items: center;
            column-gap: 10px;
            padding: 9px 10px;
            border-bottom: 1px solid rgba(42,74,28,0.3);
            cursor: pointer;
            transition: background 0.12s;
            font-size: 12px;
        }

        .tmvu-match-row:last-child {
            border-bottom: none;
        }

        .tmvu-match-row:hover {
            background: #243d18 !important;
        }

        .tmvu-match-even {
            background: #1c3410;
        }

        .tmvu-match-odd {
            background: #162e0e;
        }

        .tmvu-match-highlight {
            outline: 1px solid rgba(108,192,64,0.25);
            outline-offset: -1px;
        }

        .tmvu-match-team {
            min-width: 0;
            display: flex;
            align-items: center;
            color: #c8e0b4;
        }

        .tmvu-match-team-home {
            justify-content: flex-end;
            text-align: right;
        }

        .tmvu-match-team-away {
            justify-content: flex-start;
            text-align: left;
        }

        .tmvu-match-team-inner {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            min-width: 0;
            max-width: 100%;
        }

        .tmvu-match-team-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .tmvu-match-team-name a {
            color: #c8e0b4;
            text-decoration: none;
        }

        .tmvu-match-team-name a:hover {
            text-decoration: underline;
        }

        .tmvu-match-flag {
            display: inline-flex;
            align-items: center;
            flex-shrink: 0;
            line-height: 1;
        }

        .tmvu-match-flag img,
        .tmvu-match-flag .flag,
        .tmvu-match-flag [class*="flag-img-"] {
            display: inline-block;
            vertical-align: middle;
        }

        .tmvu-match-score {
            text-align: center;
            font-size: 13px;
            font-weight: 700;
            line-height: 1.2;
            padding: 2px 6px;
            border-radius: 3px;
            display: inline-block;
            color: #e0f0d0;
            text-decoration: none;
        }

        .tmvu-match-score:hover {
            background: rgba(255,255,255,0.06);
        }

        .tmvu-match-score-upcoming {
            color: #4a6a3a;
            font-weight: 400;
            font-size: 11px;
        }

        .tmvu-match-logo {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
        }

        .tmvu-match-rating {
            width: auto;
            min-width: 0;
            font-size: 12px;
            font-weight: 700;
            font-variant-numeric: tabular-nums;
            color: #90b878;
            line-height: 1;
            white-space: nowrap;
        }

        .tmvu-match-rating-home {
            text-align: right;
        }

        .tmvu-match-rating-away {
            text-align: left;
        }
    `;
    document.head.appendChild(style);
};

const renderTeam = (team, side, showLogos) => {
    const safeName = escapeHtml(team?.name || 'Unknown');
    const rating = `<span class="tmvu-match-rating tmvu-match-rating-${side}" data-role="${side}-rating">—</span>`;
    const logo = showLogos && team?.id
        ? `<img class="tmvu-match-logo" src="/pics/club_logos/${team.id}_25.png" onerror="this.style.visibility='hidden'" alt="">`
        : rating;
    const flag = team?.flagHtml ? `<span class="tmvu-match-flag">${team.flagHtml}</span>` : '';
    const name = `<span class="tmvu-match-team-name"><a href="${team?.href || '#'}">${safeName}</a></span>`;
    if (side === 'home') return `${name}${flag}${logo}`;
    return `${logo}${flag}${name}`;
};

const render = ({
    matchId,
    season,
    isPlayed,
    isHighlight,
    scoreText,
    scoreHref,
    home,
    away,
}, {
    index = 0,
    showLogos = true,
} = {}) => {
    injectStyles();
    const scoreClass = isPlayed ? 'tmvu-match-score' : 'tmvu-match-score tmvu-match-score-upcoming';
    const safeScore = escapeHtml(scoreText || '—');
    const scoreHtml = scoreHref
        ? `<a class="${scoreClass}" href="${scoreHref}">${safeScore}</a>`
        : `<span class="${scoreClass}">${safeScore}</span>`;

    return `
        <div class="tmvu-match-row ${index % 2 === 0 ? 'tmvu-match-even' : 'tmvu-match-odd'}${isHighlight ? ' tmvu-match-highlight' : ''}"
            data-mid="${matchId || ''}" data-season="${season || ''}" data-played="${isPlayed ? '1' : '0'}">
            <div class="tmvu-match-team tmvu-match-team-home">
                <span class="tmvu-match-team-inner">${renderTeam(home, 'home', showLogos)}</span>
            </div>
            ${scoreHtml}
            <div class="tmvu-match-team tmvu-match-team-away">
                <span class="tmvu-match-team-inner">${renderTeam(away, 'away', showLogos)}</span>
            </div>
        </div>
    `;
};

const updateRatingCells = (matchId, homeR5, awayR5) => {
    const colorHome = getColor(homeR5, R5_THRESHOLDS);
    const colorAway = getColor(awayR5, R5_THRESHOLDS);
    document.querySelectorAll(`.tmvu-match-row[data-mid="${matchId}"]`).forEach(row => {
        const homeEl = row.querySelector('[data-role="home-rating"]');
        const awayEl = row.querySelector('[data-role="away-rating"]');
        if (homeEl) {
            homeEl.textContent = homeR5.toFixed(2);
            homeEl.style.color = colorHome;
        }
        if (awayEl) {
            awayEl.textContent = awayR5.toFixed(2);
            awayEl.style.color = colorAway;
        }
    });
};

const enhance = (scope, { season } = {}) => {
    injectStyles();
    const rows = Array.from(scope.querySelectorAll('.tmvu-match-row[data-mid]')).filter(row => row.dataset.mid);
    rows.forEach(row => {
        if (row.dataset.clickBound !== '1') {
            row.dataset.clickBound = '1';
            row.addEventListener('click', event => {
                if (event.target.closest('a')) return;
                const matchId = row.dataset.mid;
                if (matchId) window.location.href = `/matches/${matchId}/`;
            });
        }

        if (row.dataset.played === '1' && row.dataset.r5Requested !== '1') {
            row.dataset.r5Requested = '1';
            TmMatchRatings.fetchMatchR5(row.dataset.mid).then(result => {
                if (!result) return;
                updateRatingCells(row.dataset.mid, result.homeR5, result.awayR5);
            });
        }
    });
    TmMatchHoverCard.bind(rows.filter(row => row.dataset.played === '1'), { season });
};

export const TmMatchRow = {
    injectStyles,
    render,
    enhance,
};