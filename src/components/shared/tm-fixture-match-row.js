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
            background: var(--tmu-surface-dark-strong);
            padding: var(--tmu-space-xs) var(--tmu-space-md);
            border-bottom: 1px solid var(--tmu-border-faint);
            cursor: pointer;
            transition: background 0.12s;
            font-size: var(--tmu-font-md);
            gap: var(--tmu-space-xs);
        }
        .tmvu-fixture-row:hover { background: var(--tmu-surface-tab-hover) !important; }
        .tmvu-fixture-team { flex: 1; display: flex; align-items: center; gap: var(--tmu-space-xs); color: var(--tmu-text-main); min-width: 0; }
        .tmvu-fixture-team-home { justify-content: flex-end; }
        .tmvu-fixture-team-away { justify-content: flex-start; }
        .tmvu-fixture-team-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tmvu-fixture-team-winner .tmvu-fixture-team-name { color: var(--tmu-text-strong); font-weight: 700; }
        .tmvu-fixture-team-loser  .tmvu-fixture-team-name { color: var(--tmu-text-faint); }
        .tmvu-fixture-my-team .tmvu-fixture-team-name { color: var(--tmu-text-strong); font-weight: 600; }
        .tmvu-fixture-score {
            width: 54px; min-width: 54px; text-align: center;
            font-size: var(--tmu-font-md); padding: var(--tmu-space-xs) var(--tmu-space-xs);
            border-radius: var(--tmu-space-xs); display: inline-block; flex-shrink: 0;
            text-decoration: none; color: var(--tmu-text-main);
            font-variant-numeric: tabular-nums;
        }
        .tmvu-fixture-score-upcoming { color: var(--tmu-text-dim); font-weight: 400; font-size: var(--tmu-font-sm); }
        .tmvu-fixture-goal-lose { font-weight: 400; color: var(--tmu-text-faint); }
        .tmvu-fixture-tv { position: absolute; left: var(--tmu-space-xs); top: 50%; transform: translateY(-50%); width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; color: var(--tmu-color-primary); pointer-events: none; }
        .tmvu-fixture-logo { width: 25px; height: 25px; flex-shrink: 0; }
        .tmvu-fixture-type-slot { width: 52px; flex-shrink: 0; display: flex; align-items: center; }
        .tmvu-fixture-type { font-size: 10px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; padding: 1px 5px; border-radius: 3px; flex-shrink: 0; opacity: 0.75; }
        .tmvu-fixture-type-league          { background: rgba(var(--tmu-color-primary-rgb,56,132,255),0.15); color: var(--tmu-color-primary); }
        .tmvu-fixture-type-friendly        { background: var(--tmu-surface-accent); color: var(--tmu-text-dim); }
        .tmvu-fixture-type-friendly_league { background: rgba(168,85,247,0.12); color: #c084fc; }
        .tmvu-fixture-type-cup             { background: rgba(var(--tmu-warning-rgb,234,179,8),0.15); color: var(--tmu-warning); }
        .tmvu-fixture-type-international_cup { background: rgba(var(--tmu-info-strong-rgb,56,189,248),0.15); color: var(--tmu-info-strong); }
    `;
    document.head.appendChild(style);
};

const MATCH_TYPE_MAP = {
    'League':            { key: 'league',            label: 'League',     fullName: 'League' },
    'Friendly':          { key: 'friendly',          label: 'Friendly',   fullName: 'Friendly' },
    'Friendly League':   { key: 'friendly_league',   label: 'Fr. League', fullName: 'Friendly League' },
    'Cup':               { key: 'cup',               label: 'Cup',        fullName: 'Cup' },
    'International':     { key: 'international_cup', label: 'Int. Cup',   fullName: 'International Cup' },
    'International Cup': { key: 'international_cup', label: 'Int. Cup',   fullName: 'International Cup' },
};

const normalizeMatch = (match) => {
    const typeName = match?.matchtype_sort || match?.matchtype_name || '';
    const typeMeta = MATCH_TYPE_MAP[typeName] || null;
    return {
        matchId: match?.matchId ?? match?.id ?? '',
        homeId: String(match?.homeId ?? match?.hometeam ?? ''),
        homeName: match?.homeName ?? match?.hometeam_name ?? '',
        awayId: String(match?.awayId ?? match?.awayteam ?? ''),
        awayName: match?.awayName ?? match?.awayteam_name ?? '',
        scoreText: match?.scoreText ?? match?.result ?? match?.score ?? '',
        tv: match?.tv,
        typeMeta,
    };
};

const parseWinner = (scoreText) => {
    if (!scoreText) return null;
    const parts = String(scoreText).split('-').map(part => Number(String(part).trim()));
    const [hg, ag] = parts;
    if (Number.isNaN(hg) || Number.isNaN(ag)) return null;
    if (hg > ag) return 'home';
    if (ag > hg) return 'away';
    return 'draw';
};

const renderScoreHtml = (scoreText, winner, scoreHref, linkable) => {
    const parts = scoreText ? String(scoreText).trim().split('-') : [];
    let inner;
    if (winner && parts.length === 2) {
        inner = `<span>${escapeHtml(parts[0].trim())}</span>-<span>${escapeHtml(parts[1].trim())}</span>`;
    } else if (scoreText) {
        inner = escapeHtml(scoreText);
    } else {
        return `<span class="tmvu-fixture-score tmvu-fixture-score-upcoming">—</span>`;
    }
    if (linkable && scoreHref) {
        return `<a href="${scoreHref}" class="tmvu-fixture-score">${inner}</a>`;
    }
    return `<span class="tmvu-fixture-score">${inner}</span>`;
};

const render = (match, {
    index = 0,
    myClubId = null,
    season = '',
    extraClass = '',
    showTvBadge = false,
    linkUpcoming = false,
    showType = false,
} = {}) => {
    injectStyles();

    const normalized = normalizeMatch(match);
    const matchId = String(normalized.matchId || '');
    const homeId = normalized.homeId;
    const awayId = normalized.awayId;
    const isHomeMe = myClubId && homeId === String(myClubId);
    const isAwayMe = myClubId && awayId === String(myClubId);
    const hasScore = !!normalized.scoreText;
    const winner = hasScore ? parseWinner(normalized.scoreText) : null;
    const scoreHref = matchId ? `/matches/${matchId}/` : '';
    const scoreHtml = renderScoreHtml(normalized.scoreText, winner, scoreHref, !!scoreHref && (hasScore || linkUpcoming));
    const tvBadge = showTvBadge
        ? (String(normalized.tv) === '1'
            ? '<span class="tmvu-fixture-tv" title="TV"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg></span>'
            : '')
        : '';
    const typeBadge = showType
        ? `<span class="tmvu-fixture-type-slot">${normalized.typeMeta ? `<span class="tmvu-fixture-type tmvu-fixture-type-${normalized.typeMeta.key}" title="${normalized.typeMeta.fullName}">${normalized.typeMeta.label}</span>` : ''}</span>`
        : '';

    const homeWinCls = winner === 'home' ? ' tmvu-fixture-team-winner' : winner === 'away' ? ' tmvu-fixture-team-loser' : '';
    const awayWinCls = winner === 'away' ? ' tmvu-fixture-team-winner' : winner === 'home' ? ' tmvu-fixture-team-loser' : '';

    return `<div class="tmvu-fixture-row${extraClass ? ` ${extraClass}` : ''}"
            data-mid="${escapeHtml(matchId)}" data-season="${escapeHtml(season)}"
            data-home-id="${escapeHtml(homeId)}" data-away-id="${escapeHtml(awayId)}">
            ${tvBadge}
            ${typeBadge}
            <div class="tmvu-fixture-team tmvu-fixture-team-home${isHomeMe ? ' tmvu-fixture-my-team' : ''}${homeWinCls}">
                <span class="tmvu-fixture-team-name">${escapeHtml(normalized.homeName)}</span>
                <img class="tmvu-fixture-logo" src="/pics/club_logos/${escapeHtml(homeId)}_25.png" onerror="this.style.visibility='hidden'" alt="">
            </div>
            ${scoreHtml}
            <div class="tmvu-fixture-team tmvu-fixture-team-away${isAwayMe ? ' tmvu-fixture-my-team' : ''}${awayWinCls}">
                <img class="tmvu-fixture-logo" src="/pics/club_logos/${escapeHtml(awayId)}_25.png" onerror="this.style.visibility='hidden'" alt="">
                <span class="tmvu-fixture-team-name">${escapeHtml(normalized.awayName)}</span>
            </div>
        </div>`;
};

export const TmFixtureMatchRow = {
    render,
};