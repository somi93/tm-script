import { TmPageHero } from '../components/shared/tm-page-hero.js';
import { TmFixtureRoundCards } from '../components/shared/tm-fixture-round-cards.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmTabs } from '../components/shared/tm-tabs.js';
import { TmButton } from '../components/shared/tm-button.js';
import { TmMatchHoverCard } from '../components/shared/tm-match-hover-card.js';
import { TmStandingsParser } from '../components/shared/tm-standings-parser.js';
import { TmStandingsPanel } from '../components/shared/tm-standings-panel.js';
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
    const metricHtml = (opts) => TmUI.metric(opts);

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        injectTmPageLayoutStyles();

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-fl-page {
                display: grid !important;
                grid-template-columns: minmax(0, 1fr) 390px;
                align-items: start;
                gap: var(--tmu-space-lg);
            }

            .tmvu-fl-byline {
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-sm);
                line-height: 1.6;
            }

            .tmvu-fl-byline a {
                color: var(--tmu-text-strong);
                text-decoration: none;
            }

            .tmvu-fl-byline a:hover {
                text-decoration: underline;
            }

            .tmvu-fl-mark {
                width: 84px;
                height: 84px;
                border-radius: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                background:
                    radial-gradient(circle at center, var(--tmu-success-fill-soft), transparent 76%),
                    linear-gradient(180deg, var(--tmu-surface-dark-strong), var(--tmu-surface-dark-soft));
                border: 1px solid var(--tmu-border-soft-alpha-mid);
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-3xl);
            }

            .tmvu-fl-overview-metrics {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: var(--tmu-space-sm);
                margin-top: var(--tmu-space-md);
            }

            .tmvu-fl-chat-item {
                padding: var(--tmu-space-md) var(--tmu-space-md);
                border-radius: var(--tmu-space-md);
                background: var(--tmu-surface-dark-muted);
                border: 1px solid var(--tmu-border-soft-alpha);
                color: var(--tmu-text-strong);
                line-height: 1.6;
            }

            .tmvu-fl-chat-item a {
                color: var(--tmu-text-strong);
                text-decoration: none;
                font-weight: 700;
            }

            .tmvu-fl-chat-item a:hover {
                text-decoration: underline;
            }

            .tmvu-fl-chat-action {
                margin-bottom: var(--tmu-space-md);
            }

            @media (max-width: 1220px) {
                .tmvu-fl-page {
                    grid-template-columns: minmax(0, 1fr) 320px;
                }
            }

            @media (max-width: 820px) {
                .tmvu-fl-page {
                    grid-template-columns: 1fr;
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
        TmPageHero.mount(wrap, {
            slots: {
                kicker: 'Friendly League',
                title: escapeHtml(overview.title),
                main: `
                    <div class="tmvu-fl-byline">${overview.ownerHtml}</div>
                    <div class="tmvu-fl-overview-metrics">
                        ${hasValue(overview.rank) ? metricHtml({ label: 'Your Rank', value: `#${escapeHtml(overview.rank)}`, tone: 'overlay', size: 'md', align: 'center' }) : ''}
                        ${hasValue(overview.points) ? metricHtml({ label: 'Points', value: escapeHtml(overview.points), tone: 'overlay', size: 'md', align: 'center' }) : ''}
                        ${hasValue(overview.goals) ? metricHtml({ label: 'Goals', value: escapeHtml(overview.goals), tone: 'overlay', size: 'md', align: 'center' }) : ''}
                    </div>
                `,
                side: '<div class="tmvu-fl-mark">🤝</div>',
            },
        });
        return wrap.firstElementChild || wrap;
    };

    let standingsPanel = null;

    const renderChatCard = (chat) => {
        const wrap = document.createElement('section');
        TmUI.render(wrap, `
            <tm-card data-title="Chat" data-icon="💬">
                ${chat.actionNode ? '<div class="tmvu-fl-chat-action"></div>' : ''}
                ${chat.messages.length ? `
                    <div class="tmvu-fl-chat-list tmu-stack tmu-stack-density-tight">
                        ${chat.messages.map(message => `<div class="tmvu-fl-chat-item">${message}</div>`).join('')}
                    </div>
                ` : TmUI.empty('No chat messages yet.', true)}
            </tm-card>
        `);

        const card = wrap.firstElementChild || wrap;
        if (chat.actionNode) {
            const actionMount = card.querySelector('.tmvu-fl-chat-action');
            const button = TmButton.button({
                slot: chat.actionNode.innerHTML || 'Post Chat',
                color: 'lime',
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
        if (fixtures && standingsPanel) {
            const { formMap, playedCountMap } = TmStandingsPanel.buildFormData(fixtures);
            standingsPanel.setFormData(formMap, playedCountMap);
        }
    };

    const render = () => {
        injectStyles();
        TmMatchHoverCard.injectStyles();

        const overview = parseOverview();
        if (!overview) return;

        const menuItems = parseMenu();
        const activeHref = menuItems.find(item => item.isSelected)?.href || (LEAGUE_ID ? `/friendly-league/${LEAGUE_ID}/` : '/friendly-league/');
        const chat = parseChat();

        main.classList.add('tmvu-fl-page', 'tmu-page-density-regular');
        main.innerHTML = '';

        const mainColumn = document.createElement('section');
        mainColumn.className = 'tmvu-fl-main tmu-page-section-stack';

        mainColumn.appendChild(renderOverviewCard(overview));

        const standingsCard = document.createElement('div');
        standingsCard.className = 'tmu-flat-panel';

        const navItems = menuItems.filter(item => item.type === 'link');
        if (navItems.length > 1) {
            const tabBar = TmTabs.tabs({
                items: navItems.map(item => ({ key: item.href, label: item.label, icon: item.icon })),
                active: activeHref,
                stretch: true,
                onChange: (key) => { window.location.href = key; },
            });
            standingsCard.appendChild(tabBar);
        }

        const standingsWrap = document.createElement('div');
        standingsPanel = TmStandingsPanel.mount(standingsWrap, {
            rows: overview.standingsRows,
            liveZoneMap: {},
        });
        standingsCard.appendChild(standingsWrap);
        mainColumn.appendChild(standingsCard);

        const sideColumn = document.createElement('aside');
        sideColumn.className = 'tmvu-fl-side tmu-page-rail-stack';
        const roundPanel = document.createElement('div');
        roundPanel.id = 'tmvu-fl-round-panel';
        roundPanel.innerHTML = `<div class="tmu-card">${TmUI.loading('Loading fixtures...', true)}</div>`;
        sideColumn.appendChild(roundPanel);
        sideColumn.appendChild(renderChatCard(chat));

        main.append(mainColumn, sideColumn);
        hydrateRoundCards(sideColumn, overview);
    };

    render();
})();