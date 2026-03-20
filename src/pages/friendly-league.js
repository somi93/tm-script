import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { TmFixtureRoundCards } from '../components/shared/tm-fixture-round-cards.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmButton } from '../components/shared/tm-button.js';
import { TmMatchHoverCard } from '../components/shared/tm-match-hover-card.js';
import { TmStandingsParser } from '../components/shared/tm-standings-parser.js';
import { TmStandingsTable } from '../components/shared/tm-standings-table.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TMLeagueService } from '../services/league.js';

(function () {
    'use strict';

    const routeMatch = window.location.pathname.match(/^\/friendly-league(?:\/(\d+))?\/?$/i);
    if (!routeMatch) return;

    const CURRENT_SEASON = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;
    const main = document.querySelector('.tmvu-main, .main_center');
    if (!main) return;

    const sourceRoot = main.cloneNode(true);
    const STYLE_ID = 'tmvu-friendly-league-style';
    const LEAGUE_ID = routeMatch[1] || sourceRoot.querySelector('#new_message_button')?.getAttribute('onclick')?.match(/pop_create_chat\((\d+),/)?.[1] || '';

    const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const hasValue = (value) => value !== null && value !== undefined && value !== '';
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
            .tmvu-main.tmvu-fl-page {
                display: grid !important;
                grid-template-columns: 184px minmax(0, 0.96fr) 390px;
                gap: 16px;
                align-items: start;
            }

            .tmvu-fl-main,
            .tmvu-fl-side {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .tmvu-fl-byline {
                color: #8aac72;
                font-size: 12px;
                line-height: 1.6;
            }

            .tmvu-fl-byline a {
                color: #d8efc2;
                text-decoration: none;
            }

            .tmvu-fl-byline a:hover {
                text-decoration: underline;
            }

            .tmvu-fl-pill-row {
                margin-top: 12px;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .tmvu-fl-pill {
                display: inline-flex;
                align-items: center;
                min-height: 30px;
                padding: 0 10px;
                border-radius: 999px;
                background: rgba(42,74,28,.32);
                border: 1px solid rgba(61,104,40,.26);
                color: #d8efc2;
                font-size: 11px;
                font-weight: 700;
            }

            .tmvu-fl-pill strong {
                color: #fff;
                margin-left: 4px;
            }

            .tmvu-fl-mark {
                width: 84px;
                height: 84px;
                border-radius: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                background:
                    radial-gradient(circle at center, rgba(108,192,64,.16), rgba(108,192,64,.02) 64%, transparent 76%),
                    linear-gradient(180deg, rgba(12,24,9,.5), rgba(12,24,9,.12));
                border: 1px solid rgba(61,104,40,.24);
                color: #eff8e8;
                font-size: 28px;
            }

            .tmvu-fl-chat-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .tmvu-fl-chat-item {
                padding: 10px 12px;
                border-radius: 10px;
                background: rgba(12,24,9,.34);
                border: 1px solid rgba(61,104,40,.18);
                color: #d7ebc9;
                line-height: 1.6;
            }

            .tmvu-fl-chat-item a {
                color: #eef8e8;
                text-decoration: none;
                font-weight: 700;
            }

            .tmvu-fl-chat-item a:hover {
                text-decoration: underline;
            }

            .tmvu-fl-chat-action {
                margin-bottom: 10px;
            }

            .tmvu-fl-empty {
                padding: 8px 2px 2px;
                color: #8aac72;
                font-size: 12px;
            }

            @media (max-width: 1220px) {
                .tmvu-main.tmvu-fl-page {
                    grid-template-columns: 184px minmax(0, 1fr) 320px;
                }
            }
        `;

        document.head.appendChild(style);
    };

    const parseMenu = () => Array.from(sourceRoot.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
        if (node.tagName === 'HR') return [{ type: 'separator' }];
        if (node.tagName !== 'A') return [];
        const label = cleanText(node.textContent);
        return [{
            type: 'link',
            href: node.getAttribute('href') || '#',
            label,
            icon: /fixtures/i.test(label) ? '📅' : /statistics/i.test(label) ? '📊' : /history/i.test(label) ? '📜' : '🤝',
            isSelected: node.classList.contains('selected'),
        }];
    });

    const parseOverview = () => {
        const box = sourceRoot.querySelector('.column2_a > .box');
        if (!box) return null;

        const subHeader = box.querySelector('.box_sub_header');
        const nameNode = subHeader?.querySelector('.large');
        const ownerNode = subHeader?.querySelector('.italic');
        const standingsTable = box.querySelector('#league_table');
        const standingsRows = parseStandingsRows(standingsTable);
        const highlightedRow = standingsRows.find(row => row.isMe);

        return {
            title: cleanText(nameNode?.textContent || 'Friendly League'),
            ownerHtml: ownerNode?.innerHTML || '',
            rank: highlightedRow ? String(highlightedRow.rank) : '',
            goals: highlightedRow ? `${highlightedRow.gf}:${highlightedRow.ga}` : '',
            points: highlightedRow ? String(highlightedRow.pts) : '',
            standingsRows,
        };
    };

    const parseStandingsRows = (table) => TmStandingsParser.parseNativeTable(table);

    const parseChat = () => {
        const chatBox = sourceRoot.querySelector('#forum_box');
        const actionNode = sourceRoot.querySelector('#new_message_button')?.cloneNode(true) || null;
        const messages = Array.from(chatBox?.querySelectorAll('p') || []).map(node => node.outerHTML);
        return { actionNode, messages };
    };

    const renderOverviewCard = (overview) => {
        const wrap = document.createElement('section');
        TmHeroCard.mount(wrap, {
            cardClass: 'tmvu-fl-hero-card',
            slots: {
                kicker: 'Friendly League',
                title: escapeHtml(overview.title),
                main: `
                    <div class="tmvu-fl-byline">${overview.ownerHtml}</div>
                    <div class="tmvu-fl-pill-row">
                        ${hasValue(overview.rank) ? `<span class="tmvu-fl-pill">Your Rank<strong>#${escapeHtml(overview.rank)}</strong></span>` : ''}
                        ${hasValue(overview.points) ? `<span class="tmvu-fl-pill">Points<strong>${escapeHtml(overview.points)}</strong></span>` : ''}
                        ${hasValue(overview.goals) ? `<span class="tmvu-fl-pill">Goals<strong>${escapeHtml(overview.goals)}</strong></span>` : ''}
                    </div>
                `,
                side: '<div class="tmvu-fl-mark">🤝</div>',
            },
        });
        return wrap.firstElementChild || wrap;
    };

    const renderStandingsCard = (overview) => {
        const wrap = document.createElement('section');
        TmUI.render(wrap, `
            <tm-card data-title="Standings" data-icon="🏁">
                <div class="tmvu-standings-wrap">${TmStandingsTable.buildHtml({ rows: overview.standingsRows })}</div>
            </tm-card>
        `);
        return wrap.firstElementChild || wrap;
    };

    const renderChatCard = (chat) => {
        const wrap = document.createElement('section');
        TmUI.render(wrap, `
            <tm-card data-title="Chat" data-icon="💬">
                ${chat.actionNode ? '<div class="tmvu-fl-chat-action"></div>' : ''}
                ${chat.messages.length ? `
                    <div class="tmvu-fl-chat-list">
                        ${chat.messages.map(message => `<div class="tmvu-fl-chat-item">${message}</div>`).join('')}
                    </div>
                ` : '<div class="tmvu-fl-empty">No chat messages yet.</div>'}
            </tm-card>
        `);

        const card = wrap.firstElementChild || wrap;
        if (chat.actionNode) {
            const actionMount = card.querySelector('.tmvu-fl-chat-action');
            const button = TmButton.button({
                slot: chat.actionNode.innerHTML || 'Post Chat',
                variant: 'lime',
                onClick: (event) => {
                    event.preventDefault();
                    chat.actionNode.click();
                },
            });
            actionMount?.appendChild(button);
        }

        return card;
    };

    const hydrateRoundCards = async (sideColumn, overview) => {
        const fixtures = LEAGUE_ID ? await TMLeagueService.fetchLeagueFixtures('friendly-league', { var1: LEAGUE_ID }) : null;
        const highlightClubId = overview.standingsRows.find(row => row.isMe)?.clubId || '';
        TmFixtureRoundCards.mount(sideColumn.querySelector('#tmvu-fl-round-panel'), {
            fixtures,
            season: CURRENT_SEASON,
            highlightClubId,
            titlePrefix: 'Round',
        });
    };

    const render = () => {
        injectStyles();
        TmStandingsTable.injectStyles();
        TmMatchHoverCard.injectStyles();

        const overview = parseOverview();
        if (!overview) return;

        const menuItems = parseMenu();
        const activeHref = menuItems.find(item => item.isSelected)?.href || (LEAGUE_ID ? `/friendly-league/${LEAGUE_ID}/` : '/friendly-league/');
        const chat = parseChat();

        main.classList.add('tmvu-fl-page');
        main.innerHTML = '';

        TmSideMenu.mount(main, {
            id: 'tmvu-friendly-league-nav',
            className: 'tmvu-friendly-league-nav',
            items: menuItems,
            currentHref: activeHref,
        });

        const mainColumn = document.createElement('section');
        mainColumn.className = 'tmvu-fl-main';
        mainColumn.appendChild(renderOverviewCard(overview));
        mainColumn.appendChild(renderStandingsCard(overview));

        const sideColumn = document.createElement('aside');
        sideColumn.className = 'tmvu-fl-side';
        const roundPanel = document.createElement('div');
        roundPanel.id = 'tmvu-fl-round-panel';
        roundPanel.innerHTML = '<div class="tmu-card"><div class="tmvu-fl-empty">Loading fixtures...</div></div>';
        sideColumn.appendChild(roundPanel);
        sideColumn.appendChild(renderChatCard(chat));

        main.append(mainColumn, sideColumn);
        hydrateRoundCards(sideColumn, overview);
    };

    render();
})();