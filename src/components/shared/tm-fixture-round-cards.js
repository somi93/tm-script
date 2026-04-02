import { TmMatchRow } from './tm-match-row.js';
import { TmUI } from './tm-ui.js';

const STYLE_ID = 'tmvu-round-navigator-style';
const htmlOf = (node) => node ? node.outerHTML : '';

const navButtonHtml = ({ action = '', title = '', disabled = false, path }) => {
    const button = TmUI.button({
        slot: `<svg viewBox="0 0 24 24"><path d="${path}"/></svg>`,
        variant: 'icon',
        color: 'secondary',
        disabled,
        title,
        attrs: action ? { 'data-action': action } : {},
    });

    return htmlOf(button);
};

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-round-panel .tmu-card-head.rnd-nav {
            padding: var(--tmu-space-sm) var(--tmu-space-lg);
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

        .tmvu-round-panel .tmu-card-head.rnd-nav .tmu-btn {
            width: 26px;
            height: 26px;
            min-width: 26px;
            font-size: 0;
            line-height: 0;
            border-radius: var(--tmu-space-xs);
            padding: 0;
            color: var(--tmu-text-main);
            transition: color 0.15s;
        }

        .tmvu-round-panel .tmu-card-head.rnd-nav .tmu-btn svg {
            width: 16px;
            height: 16px;
            fill: currentColor;
        }

        .tmvu-round-panel .tmu-card-head.rnd-nav .tmu-btn:disabled {
            opacity: 0.3;
            cursor: default;
        }

        .tmvu-round-panel .tmu-card-head.rnd-nav .tmu-btn:not(:disabled):hover {
            color: var(--tmu-text-inverse);
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
                    ${navButtonHtml({ disabled: true, path: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' })}
                    <span class="rnd-title">${titlePrefix} —</span>
                    ${navButtonHtml({ disabled: true, path: 'M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z' })}
                </div>
                ${TmUI.empty('No rounds available', true)}
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
                ${navButtonHtml({ action: 'prev', disabled: currentIndex <= 0, title: 'Previous round', path: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' })}
                <span class="rnd-title">${titlePrefix} ${round.roundNum}</span>
                ${navButtonHtml({ action: 'next', disabled: currentIndex >= rounds.length - 1, title: 'Next round', path: 'M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z' })}
            </div>
            <div class="tmvu-round-body">${rowsHtml}</div>
        </div>
    `);

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
    container.onclick = (event) => {
        const actionButton = event.target.closest('[data-action]');
        if (!actionButton || !container.contains(actionButton) || actionButton.disabled) return;

        const currentState = container.__tmvuRoundNavigatorState;
        if (!currentState) return;

        const action = actionButton.getAttribute('data-action');
        if (action === 'prev') {
            if (currentState.currentIndex <= 0) return;
            currentState.currentIndex -= 1;
        } else if (action === 'next') {
            if (currentState.currentIndex >= currentState.rounds.length - 1) return;
            currentState.currentIndex += 1;
        } else {
            return;
        }

        renderNavigator(container, currentState);
        currentState.onRoundChange?.({
            rounds: currentState.rounds,
            currentIndex: currentState.currentIndex,
            currentRound: currentState.rounds[currentState.currentIndex],
        });
    };

    renderNavigator(container, state);
    onRoundChange?.({ rounds: state.rounds, currentIndex: state.currentIndex, currentRound: state.rounds[state.currentIndex] || null });
    return container;
}

export const TmFixtureRoundCards = { mount };