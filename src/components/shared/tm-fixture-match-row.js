const STYLE_ID = 'tmvu-fixture-match-row-style';

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
        .tmvu-fixture-row {
            position: relative;
            display: flex;
            align-items: center;
            padding: 5px 10px;
            border-bottom: 1px solid rgba(42,74,28,0.3);
            cursor: pointer;
            transition: background 0.12s;
            font-size: 12px;
            gap: 4px;
        }
        .tmvu-fixture-row:hover { background: #243d18 !important; }
        .tmvu-fixture-even { background: #1c3410; }
        .tmvu-fixture-odd  { background: #162e0e; }
        .tmvu-fixture-highlight { outline: 1px solid rgba(108,192,64,0.25); }
        .tmvu-fixture-team { flex: 1; display: flex; align-items: center; gap: 5px; color: #c8e0b4; min-width: 0; }
        .tmvu-fixture-team-home { justify-content: flex-end; }
        .tmvu-fixture-team-away { justify-content: flex-start; }
        .tmvu-fixture-team-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tmvu-fixture-my-team .tmvu-fixture-team-name { color: #e8f5d8; font-weight: 600; }
        .tmvu-fixture-score {
            width: 54px; min-width: 54px; text-align: center;
            font-size: 12px; font-weight: 700; padding: 2px 4px;
            border-radius: 3px; display: inline-block; flex-shrink: 0;
        }
        .tmvu-fixture-score-win      { color: #4ade80; }
        .tmvu-fixture-score-loss     { color: #fca5a5; }
        .tmvu-fixture-score-draw     { color: #fde68a; }
        .tmvu-fixture-score-neutral  { color: #e0f0d0; }
        .tmvu-fixture-score-upcoming { color: #4a6a3a; font-weight: 400; font-size: 11px; }
        .tmvu-fixture-tv { width: 16px; display: inline-block; text-align: center; font-size: 11px; flex-shrink: 0; }
        .tmvu-fixture-logo { width: 16px; height: 16px; flex-shrink: 0; }
    `;
    document.head.appendChild(style);
};

const normalizeMatch = (match) => ({
    matchId: match?.matchId ?? match?.id ?? '',
    homeId: String(match?.homeId ?? match?.hometeam ?? ''),
    homeName: match?.homeName ?? match?.hometeam_name ?? '',
    awayId: String(match?.awayId ?? match?.awayteam ?? ''),
    awayName: match?.awayName ?? match?.awayteam_name ?? '',
    scoreText: match?.scoreText ?? match?.result ?? match?.score ?? '',
    tv: match?.tv,
});

const getScoreColorClass = ({ scoreText, myClubId, isHomeMe, isAwayMe, isMyMatch }) => {
    let colorClass = 'tmvu-fixture-score-neutral';
    if (!scoreText || !myClubId) return colorClass;

    const parts = String(scoreText).split('-').map(part => Number(String(part).trim()));
    const [homeGoals, awayGoals] = parts;
    if (Number.isNaN(homeGoals) || Number.isNaN(awayGoals)) return colorClass;

    if ((isHomeMe && homeGoals > awayGoals) || (isAwayMe && awayGoals > homeGoals)) return 'tmvu-fixture-score-win';
    if ((isHomeMe && homeGoals < awayGoals) || (isAwayMe && awayGoals < homeGoals)) return 'tmvu-fixture-score-loss';
    if (isMyMatch) return 'tmvu-fixture-score-draw';
    return colorClass;
};

const render = (match, {
    index = 0,
    myClubId = null,
    season = '',
    extraClass = '',
    showTvBadge = false,
    linkUpcoming = false,
} = {}) => {
    injectStyles();

    const normalized = normalizeMatch(match);
    const matchId = String(normalized.matchId || '');
    const homeId = normalized.homeId;
    const awayId = normalized.awayId;
    const isHomeMe = myClubId && homeId === String(myClubId);
    const isAwayMe = myClubId && awayId === String(myClubId);
    const isMyMatch = isHomeMe || isAwayMe;
    const hasScore = !!normalized.scoreText;
    const scoreColorClass = getScoreColorClass({ scoreText: normalized.scoreText, myClubId, isHomeMe, isAwayMe, isMyMatch });
    const scoreClasses = [
        'tmvu-fixture-score',
        hasScore ? scoreColorClass : 'tmvu-fixture-score-upcoming',
    ].join(' ');
    const scoreLabel = escapeHtml(normalized.scoreText || '—');
    const scoreHref = matchId ? `/matches/${matchId}/` : '';
    const shouldLinkScore = !!scoreHref && (hasScore || linkUpcoming);
    const scoreHtml = shouldLinkScore
        ? `<a href="${scoreHref}" class="${scoreClasses}" style="text-decoration:none">${scoreLabel}</a>`
        : `<span class="${scoreClasses}">${scoreLabel}</span>`;
    const tvBadge = showTvBadge
        ? (String(normalized.tv) === '1' ? '<span class="tmvu-fixture-tv" title="TV">📺</span>' : '<span class="tmvu-fixture-tv"></span>')
        : '';

    return `<div class="tmvu-fixture-row ${index % 2 === 0 ? 'tmvu-fixture-even' : 'tmvu-fixture-odd'}${isMyMatch ? ' tmvu-fixture-highlight' : ''}${extraClass ? ` ${extraClass}` : ''}"
            data-mid="${escapeHtml(matchId)}" data-season="${escapeHtml(season)}"
            data-home-id="${escapeHtml(homeId)}" data-away-id="${escapeHtml(awayId)}">
            <div class="tmvu-fixture-team tmvu-fixture-team-home${isHomeMe ? ' tmvu-fixture-my-team' : ''}">
                <span class="tmvu-fixture-team-name">${escapeHtml(normalized.homeName)}</span>
                <img class="tmvu-fixture-logo" src="/pics/club_logos/${escapeHtml(homeId)}_25.png" onerror="this.style.visibility='hidden'" alt="">
            </div>
            ${scoreHtml}
            <div class="tmvu-fixture-team tmvu-fixture-team-away${isAwayMe ? ' tmvu-fixture-my-team' : ''}">
                <img class="tmvu-fixture-logo" src="/pics/club_logos/${escapeHtml(awayId)}_25.png" onerror="this.style.visibility='hidden'" alt="">
                <span class="tmvu-fixture-team-name">${escapeHtml(normalized.awayName)}</span>
                ${tvBadge}
            </div>
        </div>`;
};

export const TmFixtureMatchRow = {
    injectStyles,
    render,
};