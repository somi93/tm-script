import { TmMatchRow } from './tm-match-row.js';
import { TmUI } from './tm-ui.js';

const STYLE_ID = 'tmvu-round-navigator-style';

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-round-panel .tmu-card-head.rnd-nav {
            padding: 8px 14px;
        }

        .tmvu-round-panel {
            overflow: visible !important;
        }

        .tmvu-round-panel .tmvu-round-body,
        .tmvu-round-panel .tmvu-match-list {
            overflow: visible;
        }

        .tmvu-round-panel .tmvu-match-row {
            z-index: 0;
        }

        .tmvu-round-panel .tmvu-match-row:hover {
            z-index: 3;
        }

        .tmvu-round-panel .rnd-title {
            flex: 1;
            text-align: center;
        }

        .tmvu-round-panel .rnd-nav-btn {
            width: 26px;
            height: 26px;
            font-size: 0;
            line-height: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            padding: 0;
            background: none;
            border: none;
            color: #a0c888;
            cursor: pointer;
            transition: color 0.15s;
        }

        .tmvu-round-panel .rnd-nav-btn svg {
            width: 16px;
            height: 16px;
            fill: currentColor;
        }

        .tmvu-round-panel .rnd-nav-btn:disabled {
            opacity: 0.3;
            cursor: default;
        }

        .tmvu-round-panel .rnd-nav-btn:not(:disabled):hover {
            color: #fff;
        }

        .tmvu-round-panel .tmvu-round-empty {
            text-align: center;
            padding: 12px;
            color: #5a7a48;
            font-size: 12px;
        }
    `;

    document.head.appendChild(style);
}

function buildRounds(fixtures) {
    const matches = [];
    Object.values(fixtures || {}).forEach(month => {
        if (!month?.matches) return;
        month.matches.forEach(match => matches.push(match));
    });

    const byDate = {};
    matches.forEach(match => {
        if (!match?.date) return;
        (byDate[match.date] = byDate[match.date] || []).push(match);
    });

    return Object.keys(byDate)
        .sort((left, right) => new Date(left) - new Date(right))
        .map((date, index) => ({
            roundNum: index + 1,
            date,
            matches: byDate[date],
        }));
}

function getCurrentIndex(rounds) {
    if (!rounds.length) return 0;
    let currentIndex = 0;
    for (let index = rounds.length - 1; index >= 0; index -= 1) {
        if (rounds[index].matches.some(match => match.result)) {
            currentIndex = index;
            break;
        }
    }
    return currentIndex;
}

function renderNavigator(container, state) {
    const { rounds, currentIndex, titlePrefix, season, highlightClubId, upcomingLabel, onRoundChange } = state;

    if (!rounds.length) {
        TmUI.render(container, `
            <div class="tmu-card tmvu-round-panel">
                <div class="tmu-card-head rnd-nav">
                    <button class="rnd-nav-btn" disabled><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></button>
                    <span class="rnd-title">${titlePrefix} —</span>
                    <button class="rnd-nav-btn" disabled><svg viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg></button>
                </div>
                <div class="tmvu-round-empty">No rounds available</div>
            </div>
        `);
        return;
    }

    const round = rounds[currentIndex];
    const rowsHtml = `<div class="tmvu-match-list">${round.matches.map((match, index) => TmMatchRow.render({
        matchId: match.id,
        season,
        isPlayed: !!match.result,
        isHighlight: highlightClubId ? String(match.hometeam) === String(highlightClubId) || String(match.awayteam) === String(highlightClubId) : false,
        scoreText: match.result || upcomingLabel,
        scoreHref: match.id ? `/matches/${match.id}/` : '',
        home: {
            id: match.hometeam,
            name: match.hometeam_name,
            href: match.hometeam ? `/club/${match.hometeam}/` : '#',
        },
        away: {
            id: match.awayteam,
            name: match.awayteam_name,
            href: match.awayteam ? `/club/${match.awayteam}/` : '#',
        },
    }, { index, showLogos: false })).join('')}</div>`;

    TmUI.render(container, `
        <div class="tmu-card tmvu-round-panel">
            <div class="tmu-card-head rnd-nav">
                <button class="rnd-nav-btn" data-action="prev" ${currentIndex <= 0 ? 'disabled' : ''} title="Previous round"><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></button>
                <span class="rnd-title">${titlePrefix} ${round.roundNum}</span>
                <button class="rnd-nav-btn" data-action="next" ${currentIndex >= rounds.length - 1 ? 'disabled' : ''} title="Next round"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg></button>
            </div>
            <div class="tmvu-round-body">${rowsHtml}</div>
        </div>
    `);

    container.querySelector('[data-action="prev"]')?.addEventListener('click', () => {
        if (state.currentIndex <= 0) return;
        state.currentIndex -= 1;
        renderNavigator(container, state);
        onRoundChange?.({ rounds: state.rounds, currentIndex: state.currentIndex, currentRound: state.rounds[state.currentIndex] });
    });

    container.querySelector('[data-action="next"]')?.addEventListener('click', () => {
        if (state.currentIndex >= state.rounds.length - 1) return;
        state.currentIndex += 1;
        renderNavigator(container, state);
        onRoundChange?.({ rounds: state.rounds, currentIndex: state.currentIndex, currentRound: state.rounds[state.currentIndex] });
    });

    TmMatchRow.enhance(container, { season });
}

function mount(container, { fixtures, season = null, highlightClubId = '', titlePrefix = 'Round', upcomingLabel = '—', initialIndex, onRoundChange } = {}) {
    if (!container) return null;

    injectStyles();

    const rounds = buildRounds(fixtures);
    const currentIndex = Number.isInteger(initialIndex)
        ? Math.max(0, Math.min(initialIndex, Math.max(0, rounds.length - 1)))
        : getCurrentIndex(rounds);

    const state = {
        rounds,
        currentIndex,
        season,
        highlightClubId,
        titlePrefix,
        upcomingLabel,
        onRoundChange,
    };

    container.__tmvuRoundNavigatorState = state;
    renderNavigator(container, state);
    onRoundChange?.({ rounds: state.rounds, currentIndex: state.currentIndex, currentRound: state.rounds[state.currentIndex] || null });
    return container;
}

export const TmFixtureRoundCards = { mount };