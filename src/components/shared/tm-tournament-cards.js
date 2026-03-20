import { TmMatchRow } from './tm-match-row.js';
import { TmUI } from './tm-ui.js';

const STYLE_ID = 'tmvu-tournament-cards-style';

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
        .tmvu-cup-note {
            padding: 10px 12px;
            background: rgba(42,74,28,.24);
            border: 1px solid rgba(61,104,40,.26);
            border-radius: 8px;
            color: #a8cb95;
            line-height: 1.55;
        }

        .tmvu-cup-note p {
            margin: 0;
        }

        .tmvu-cup-note a {
            color: #e8f5d8;
            text-decoration: none;
        }

        .tmvu-cup-route-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .tmvu-cup-route-item {
            padding: 10px 12px;
            background: rgba(42,74,28,.22);
            border: 1px solid rgba(61,104,40,.24);
            border-radius: 8px;
        }

        .tmvu-cup-route-round {
            margin-bottom: 6px;
            color: #90b878;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .08em;
        }

        .tmvu-cup-route-item .tmvu-match-row {
            padding: 0;
            border: none;
            background: transparent !important;
            border-radius: 0;
        }

        .tmvu-cup-round-groups {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .tmvu-cup-round-group {
            padding: 12px;
            background: rgba(42,74,28,.22);
            border: 1px solid rgba(61,104,40,.24);
            border-radius: 8px;
        }

        .tmvu-cup-round-group .tmvu-match-list {
            margin-top: 8px;
        }

        .tmvu-cup-history-winners {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .tmvu-cup-history-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: rgba(42,74,28,.24);
            border: 1px solid rgba(61,104,40,.24);
            border-radius: 8px;
        }

        .tmvu-cup-history-item img {
            width: 42px;
            height: 42px;
            object-fit: contain;
            flex-shrink: 0;
        }

        .tmvu-cup-history-copy {
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
        }

        .tmvu-cup-history-club {
            line-height: 1.2;
        }

        .tmvu-cup-history-item a {
            color: #e8f5d8;
            text-decoration: none;
            font-weight: 700;
        }

        .tmvu-cup-history-item a:hover {
            text-decoration: underline;
        }

        .tmvu-cup-history-league {
            color: #8aac72;
            font-size: 11px;
            line-height: 1.35;
            text-align: left;
        }

        .tmvu-cup-side-copy {
            color: #a8cb95;
            line-height: 1.6;
        }

        .tmvu-cup-side-copy p {
            margin: 0 0 10px;
        }

        .tmvu-cup-side-copy p:last-child {
            margin-bottom: 0;
        }
    `;

    document.head.appendChild(style);
};

const buildFixtureList = (matches, { season = null } = {}) => {
    injectStyles();
    return `
        <div class="tmvu-match-list">
            ${matches.map((match, index) => TmMatchRow.render({
                matchId: match.matchId,
                season,
                isPlayed: match.isPlayed,
                isHighlight: match.isHighlight,
                scoreText: match.scoreText,
                scoreHref: match.scoreHref,
                home: match.home,
                away: match.away,
            }, {
                index,
                showLogos: false,
            })).join('')}
        </div>
    `;
};

const buildGroupedFixtureList = (groups, { season = null } = {}) => {
    injectStyles();
    return `
        <div class="tmvu-cup-round-groups">
            ${(groups || []).map(group => `
                <section class="tmvu-cup-round-group">
                    <div class="tmvu-cup-route-round">${escapeHtml(group.label || 'Round')}</div>
                    ${buildFixtureList(group.matches || [], { season })}
                </section>
            `).join('')}
        </div>
    `;
};

const renderDrawCard = (section, { season = null, icon = '⚔' } = {}) => {
    injectStyles();
    const wrap = document.createElement('section');
    TmUI.render(wrap, `
        <tm-card data-title="${escapeHtml(section.title)}" data-icon="${icon}">
            ${buildFixtureList(section.rows || [], { season })}
        </tm-card>
    `);
    return wrap.firstElementChild || wrap;
};

const renderGroupedFixturesCard = (section, { season = null, icon = '📅' } = {}) => {
    injectStyles();
    const wrap = document.createElement('section');
    TmUI.render(wrap, `
        <tm-card data-title="${escapeHtml(section.title)}" data-icon="${icon}">
            ${buildGroupedFixtureList(section.groups || [], { season })}
        </tm-card>
    `);
    return wrap.firstElementChild || wrap;
};

const renderRouteCard = (routeRows, overview = {}, { season = null, title = 'Route', icon = '📈' } = {}) => {
    injectStyles();
    const wrap = document.createElement('section');
    TmUI.render(wrap, `
        <tm-card data-title="${escapeHtml(title)}" data-icon="${icon}">
            <div class="tmvu-cup-route-list">
                ${routeRows.map((match, index) => `
                    <div class="tmvu-cup-route-item">
                        <div class="tmvu-cup-route-round">${escapeHtml(match.roundLabel || 'Match')}</div>
                        ${TmMatchRow.render({
                            matchId: match.matchId,
                            season,
                            isPlayed: match.isPlayed,
                            isHighlight: match.isHighlight,
                            scoreText: match.scoreText,
                            scoreHref: match.scoreHref,
                            home: match.home,
                            away: match.away,
                        }, {
                            index,
                            showLogos: false,
                        })}
                    </div>
                `).join('')}
            </div>
            ${overview.sponsorHtml ? `<div class="tmvu-cup-note">${overview.sponsorHtml}</div>` : ''}
        </tm-card>
    `);
    return wrap.firstElementChild || wrap;
};

const renderHistoryCard = (history, { title = 'History', icon = '📜' } = {}) => {
    injectStyles();
    const wrap = document.createElement('section');
    TmUI.render(wrap, `
        <tm-card data-title="${escapeHtml(title)}" data-icon="${icon}">
            <div class="tmvu-cup-history-winners">
                ${(history.historyItems || []).map(item => `
                    <div class="tmvu-cup-history-item">
                        ${item.imageSrc ? `<img src="${item.imageSrc}" alt="Tournament history">` : ''}
                        <div class="tmvu-cup-history-copy">
                            <div class="tmvu-cup-history-club">${item.clubHtml || ''}</div>
                            <div class="tmvu-cup-history-league">${escapeHtml(item.leagueText)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="tmvu-cup-side-copy">
                ${(history.paragraphs || []).join('')}
            </div>
        </tm-card>
    `);
    return wrap.firstElementChild || wrap;
};

export const TmTournamentCards = {
    injectStyles,
    buildFixtureList,
    buildGroupedFixtureList,
    renderDrawCard,
    renderGroupedFixturesCard,
    renderRouteCard,
    renderHistoryCard,
};