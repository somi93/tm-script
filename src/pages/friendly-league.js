import { TmPageHero } from '../components/shared/tm-page-hero.js';
import { TmFixtureRoundCards } from '../components/shared/tm-fixture-round-cards.js';
import { TmFixturesList } from '../components/shared/tm-fixtures-list.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmTabs } from '../components/shared/tm-tabs.js';
import { TmButton } from '../components/shared/tm-button.js';
import { TmMatchHoverCard } from '../components/shared/tm-match-hover-card.js';
import { TmSeasonBar } from '../components/shared/tm-season-bar.js';
import { TmStandingsParser } from '../components/shared/tm-standings-parser.js';
import { TmStandingsPanel } from '../components/shared/tm-standings-panel.js';
import { TmStandingsTable } from '../components/shared/tm-standings-table.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { mountPlayerStatsBrowser, PLAYER_STAT_DEFS, PLAYER_COL_LABELS, parsePlayerStatsHtml } from '../components/shared/tm-player-stats-browser.js';
import { TmLeagueModel } from '../models/league.js';

'use strict';

const CURRENT_SEASON = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;
let main = null;
let sourceRoot = null;
const STYLE_ID = 'tmvu-friendly-league-style';
let LEAGUE_ID = '';
let ACTIVE_TAB = 'overview';
let LEAGUE_FIXTURES_PROMISE = null;
let FRIENDLY_STATS_DOC_CACHE = null;
let INITIAL_STATS_STAT = 'goals';
let currentRouteRoot = null;
let FRIENDLY_STATS_META = null;
let FRIENDLY_HISTORY_DOC_CACHE = null;
let FRIENDLY_HISTORY_META = null;
let INITIAL_HISTORY_TYPE = 'standings';
let INITIAL_HISTORY_SEASON = '';

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const hasValue = (value) => value !== null && value !== undefined && value !== '';
const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const metricHtml = (opts) => TmUI.metric(opts);
const wrapperText = (value) => {
    const html = String(value || '').trim();
    if (!html) return '';
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return cleanText(wrapper.textContent || '');
};

const extractHrefFromHtml = (value) => {
    const html = String(value || '').trim();
    if (!html) return '';
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return wrapper.querySelector('a[href]')?.getAttribute('href') || '';
};

const normalizeFlagHtml = (value) => {
    const html = String(value || '').trim();
    if (!html) return '';
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return wrapper.firstElementChild?.innerHTML || wrapper.innerHTML || '';
};

const parseFriendlyLeagueFixtures = (payload) => Object.entries(payload || {})
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([monthKey, month]) => {
        const matches = Array.from(month?.matches || []).map(match => ({
            date: cleanText(match?.date || ''),
            matchId: String(match?.id || ''),
            homeId: cleanText(match?.hometeam || ''),
            homeName: cleanText(match?.hometeam_name || ''),
            homeHref: extractHrefFromHtml(match?.home_link),
            homeFlagHtml: normalizeFlagHtml(match?.home_flag),
            awayId: cleanText(match?.awayteam || ''),
            awayName: cleanText(match?.awayteam_name || ''),
            awayHref: extractHrefFromHtml(match?.away_link),
            awayFlagHtml: normalizeFlagHtml(match?.away_flag),
            result: cleanText(match?.result || wrapperText(match?.match_link) || 'x-x'),
            matchHref: extractHrefFromHtml(match?.match_link),
            matchtype_name: cleanText(match?.matchtype_sort || wrapperText(match?.matchtype_name) || 'Friendly League'),
            matchtype_sort: cleanText(match?.matchtype_sort || 'Friendly League'),
        })).filter(match => match.matchId && match.homeName && match.awayName);

        if (!matches.length) return null;
        return {
            key: monthKey,
            label: cleanText(month?.date_name || `${month?.month || 'Month'} ${monthKey.slice(0, 4)}`),
            active: Boolean(month?.current_month),
            groups: TmFixturesList.fromMatches(matches),
        };
    })
    .filter(Boolean);

const getFriendlyLeagueFixtures = () => {
    if (!LEAGUE_FIXTURES_PROMISE) {
        LEAGUE_FIXTURES_PROMISE = LEAGUE_ID
            ? TmLeagueModel.fetchLeagueFixtures('friendly-league', { var1: LEAGUE_ID })
            : Promise.resolve(null);
    }
    return LEAGUE_FIXTURES_PROMISE;
};

const getFriendlyLeagueStatisticsHtml = async (stat = 'goals') => {
    const key = String(stat || 'goals');
    if (!FRIENDLY_STATS_DOC_CACHE) FRIENDLY_STATS_DOC_CACHE = new Map();
    if (FRIENDLY_STATS_DOC_CACHE.has(key)) return FRIENDLY_STATS_DOC_CACHE.get(key);

    const html = await TmLeagueModel.fetchFriendlyLeagueStatisticsHtml(LEAGUE_ID, key);
    FRIENDLY_STATS_DOC_CACHE.set(key, html || '');
    return html || '';
};

const parseFriendlyLeagueStatisticsMeta = (source) => {
    const root = typeof source === 'string'
        ? new DOMParser().parseFromString(source, 'text/html')
        : source;
    const contentBox = root?.querySelector('.column2_a > .box');
    const statSelect = contentBox?.querySelector('#stats_players');
    const statDefs = Array.from(statSelect?.querySelectorAll('option') || [])
        .map((option) => [option.value, cleanText(option.textContent)])
        .filter(([value, label]) => value && label);
    const teamLabels = Array.from(contentBox?.querySelectorAll('.tabs [set_active]') || [])
        .map((tab) => cleanText(tab.textContent))
        .filter(Boolean);

    return {
        title: cleanText(contentBox?.querySelector('.box_head h2')?.textContent || 'Statistics'),
        statDefs: statDefs.length ? statDefs : PLAYER_STAT_DEFS,
        teamLabels: teamLabels.length ? teamLabels : ['Main team', 'Under 21'],
        initialStat: cleanText(statSelect?.value || INITIAL_STATS_STAT || 'goals') || 'goals',
    };
};

const getFriendlyLeagueHistoryHtml = async (type = 'standings', seasonValue = '') => {
    const key = `${type}|${seasonValue}`;
    if (!FRIENDLY_HISTORY_DOC_CACHE) FRIENDLY_HISTORY_DOC_CACHE = new Map();
    if (FRIENDLY_HISTORY_DOC_CACHE.has(key)) return FRIENDLY_HISTORY_DOC_CACHE.get(key);

    const routeHasHistoryDom = !!currentRouteRoot?.querySelector('#league_type_form, #stats_type, #stats_season');
    if (routeHasHistoryDom && ACTIVE_TAB === 'history' && type === INITIAL_HISTORY_TYPE && seasonValue === INITIAL_HISTORY_SEASON) {
        const html = currentRouteRoot.outerHTML || '';
        FRIENDLY_HISTORY_DOC_CACHE.set(key, html);
        return html;
    }

    const html = await TmLeagueModel.fetchFriendlyLeagueHistoryHtml(type, seasonValue);
    FRIENDLY_HISTORY_DOC_CACHE.set(key, html || '');
    return html || '';
};

const parseFriendlyLeagueHistoryMeta = (source) => {
    const root = typeof source === 'string'
        ? new DOMParser().parseFromString(source, 'text/html')
        : source;
    const contentBox = root?.querySelector('.column2_a > .box');
    const typeSelect = contentBox?.querySelector('#stats_type');
    const seasonSelect = contentBox?.querySelector('#stats_season');
    const typeDefs = Array.from(typeSelect?.querySelectorAll('option') || [])
        .map(option => ({ value: cleanText(option.value), label: cleanText(option.textContent) }))
        .filter(option => option.value && option.label);
    const seasons = Array.from(seasonSelect?.querySelectorAll('option') || [])
        .map(option => ({ id: cleanText(option.value), label: cleanText(option.textContent) }))
        .filter(option => option.id && option.label);

    return {
        title: cleanText(contentBox?.querySelector('.box_head h2')?.textContent || 'History'),
        typeDefs: typeDefs.length ? typeDefs : [
            { value: 'standings', label: 'Standings' },
            { value: 'matches', label: 'Matches' },
        ],
        seasons,
        initialType: INITIAL_HISTORY_TYPE,
        initialSeason: INITIAL_HISTORY_SEASON || seasons[0]?.id || '',
    };
};

const parseFriendlyLeagueHistoryStandings = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const table = doc.querySelector('.column2_a table.border_bottom, .column2_a .box_body table');
    if (!table) return [];
    const myClubId = (typeof SESSION !== 'undefined' && SESSION.main_id) ? String(SESSION.main_id) : null;

    return Array.from(table.querySelectorAll('tbody tr')).map((tr) => {
        const cells = Array.from(tr.querySelectorAll('td'));
        const clubLink = tr.querySelector('a[club_link]');
        if (!clubLink || cells.length < 8) return null;
        const goals = cleanText(cells[6]?.textContent || '0-0').split('-');
        return {
            rank: Number.parseInt(cleanText(cells[0]?.textContent || '0'), 10) || 0,
            clubId: cleanText(clubLink.getAttribute('club_link') || ''),
            clubName: cleanText(clubLink.textContent || ''),
            gp: Number.parseInt(cleanText(cells[2]?.textContent || '0'), 10) || 0,
            w: Number.parseInt(cleanText(cells[3]?.textContent || '0'), 10) || 0,
            d: Number.parseInt(cleanText(cells[4]?.textContent || '0'), 10) || 0,
            l: Number.parseInt(cleanText(cells[5]?.textContent || '0'), 10) || 0,
            gf: Number.parseInt(goals[0] || '0', 10) || 0,
            ga: Number.parseInt(goals[1] || '0', 10) || 0,
            pts: Number.parseInt(cleanText(cells[7]?.textContent || '0'), 10) || 0,
            isMe: tr.classList.contains('highlighted_row_done') || (myClubId && cleanText(clubLink.getAttribute('club_link')) === myClubId),
        };
    }).filter(Boolean);
};

const parseFriendlyLeagueHistoryMatches = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const headings = Array.from(doc.querySelectorAll('h3.slide_toggle_open, .column2_a h3'));
    const groups = [];

    headings.forEach((heading) => {
        let list = heading.nextElementSibling;
        while (list && !(list.tagName === 'UL' && list.classList.contains('match_list'))) list = list.nextElementSibling;
        if (!list) return;

        let currentDay = 1;
        const matches = [];
        list.querySelectorAll('li').forEach((item) => {
            const dayImg = item.querySelector('.match_date img[src*="calendar_numeral_"]');
            const dayMatch = dayImg?.getAttribute('src')?.match(/calendar_numeral_(\d+)/i);
            if (dayMatch) currentDay = Number.parseInt(dayMatch[1], 10) || currentDay;

            const homeLink = item.querySelector('.hometeam a[club_link]');
            const awayLink = item.querySelector('.awayteam a[club_link]');
            const scoreLink = item.querySelector('a.match_link, .match_results a[href*="/matches/"]');
            if (!homeLink || !awayLink || !scoreLink) return;

            matches.push({
                day: currentDay,
                matchId: scoreLink.getAttribute('href')?.match(/\/matches\/(\d+)\//)?.[1] || '',
                matchHref: scoreLink.getAttribute('href') || '',
                homeId: cleanText(homeLink.getAttribute('club_link') || ''),
                homeName: cleanText(homeLink.textContent || ''),
                awayId: cleanText(awayLink.getAttribute('club_link') || ''),
                awayName: cleanText(awayLink.textContent || ''),
                result: cleanText(scoreLink.textContent || ''),
            });
        });

        if (!matches.length) return;
        const shortMonth = cleanText(heading.textContent).split(' ')[0].slice(0, 3);
        const byDay = new Map();
        matches.forEach((match) => {
            const key = String(match.day);
            if (!byDay.has(key)) byDay.set(key, []);
            byDay.get(key).push(match);
        });
        groups.push({
            label: cleanText(heading.textContent),
            groups: Array.from(byDay.entries()).map(([day, dayMatches]) => ({
                label: `${day} ${shortMonth}`,
                matches: dayMatches,
            })),
        });
    });

    return groups;
};

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

            .tmvu-fl-panel-title {
                font-size: var(--tmu-font-sm);
                font-weight: 700;
                color: var(--tmu-text-strong);
                letter-spacing: 0.3px;
            }

            .tmvu-fl-fixtures-panel {
                padding: var(--tmu-space-lg);
            }

            .tmvu-fl-history-panel {
                padding: var(--tmu-space-lg);
            }

            .tmvu-fl-history-stack {
                display: flex;
                flex-direction: column;
                gap: var(--tmu-space-lg);
            }

            .tmvu-fl-history-month {
                border: 1px solid var(--tmu-border-faint);
                border-radius: var(--tmu-radius-md);
                overflow: hidden;
                background: var(--tmu-surface-card-soft);
            }

            .tmvu-fl-history-month-title {
                padding: var(--tmu-space-sm) var(--tmu-space-md);
                font-size: var(--tmu-font-sm);
                font-weight: 700;
                color: var(--tmu-text-strong);
                background: var(--tmu-surface-header);
                border-bottom: 1px solid var(--tmu-border-faint);
            }

            .tmvu-fl-history-controls {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: var(--tmu-space-sm);
                margin-bottom: var(--tmu-space-md);
            }

            .tmvu-fl-history-type-tabs {
                flex: 1 1 auto;
                min-width: 220px;
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

const extractFriendlyLeagueId = (root) => root?.querySelector('.content_menu a[href^="/friendly-league/"]')
    ?.getAttribute('href')
    ?.match(/\/friendly-league\/(\d+)\//i)?.[1] || '';

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
            main: `<div class="tmvu-fl-byline">${overview.ownerHtml}</div>`,
            side: '<div class="tmvu-fl-mark">🤝</div>',
        },
    });
    return wrap.firstElementChild || wrap;
};

let standingsPanel = null;

const createTabCard = (menuItems, activeHref) => {
    const card = document.createElement('div');
    card.className = 'tmu-flat-panel';

    const navItems = menuItems.filter(item => item.type === 'link');
    const overviewHref = navItems.find(item => !/fixtures|statistics|history/i.test(item.href))?.href || activeHref;
    const fixturesHref = navItems.find(item => /fixtures/i.test(item.href))?.href || '';
    const statisticsHref = navItems.find(item => /statistics/i.test(item.href))?.href || '';
    const historyHref = navItems.find(item => /history/i.test(item.href))?.href || '';
    const renderedActiveHref = ACTIVE_TAB === 'fixtures' && fixturesHref
        ? fixturesHref
        : ACTIVE_TAB === 'statistics' && statisticsHref
            ? statisticsHref
            : ACTIVE_TAB === 'history' && historyHref
                ? historyHref
            : overviewHref;
    if (navItems.length > 1) {
        const tabBar = TmTabs.tabs({
            items: navItems.map(item => ({ key: item.href, label: item.label, icon: item.icon })),
            active: renderedActiveHref,
            stretch: true,
            onChange: (key) => {
                if (key === fixturesHref) {
                    ACTIVE_TAB = 'fixtures';
                    render();
                    return;
                }
                if (key === statisticsHref) {
                    ACTIVE_TAB = 'statistics';
                    render();
                    return;
                }
                if (key === historyHref) {
                    ACTIVE_TAB = 'history';
                    render();
                    return;
                }
                if (key === overviewHref) {
                    ACTIVE_TAB = 'overview';
                    render();
                    return;
                }
                window.location.href = key;
            },
        });
        card.appendChild(tabBar);
    }

    return card;
};

const renderHistoryCard = (menuItems, activeHref, overview) => {
    const card = createTabCard(menuItems, activeHref);
    const historyCard = document.createElement('section');
    historyCard.className = 'tmu-card';
    historyCard.innerHTML = `
        <div class="tmu-card-head">
            <span class="tmvu-fl-panel-title">${escapeHtml(FRIENDLY_HISTORY_META?.title || 'History')}</span>
        </div>
        <div class="tmu-card-body tmvu-fl-history-panel">
            <div data-ref="controls" class="tmvu-fl-history-controls"></div>
            <div data-ref="content">${TmUI.loading('Loading history...', true)}</div>
        </div>
    `;
    card.appendChild(historyCard);

    const controlsHost = historyCard.querySelector('[data-ref="controls"]');
    const contentHost = historyCard.querySelector('[data-ref="content"]');
    const myClubId = overview.standingsRows.find(row => row.isMe)?.clubId || String(window.SESSION?.main_id || '');

    const init = async () => {
        const initialHtml = await getFriendlyLeagueHistoryHtml(INITIAL_HISTORY_TYPE, INITIAL_HISTORY_SEASON);
        FRIENDLY_HISTORY_META = parseFriendlyLeagueHistoryMeta(initialHtml || currentRouteRoot);
        const titleEl = historyCard.querySelector('.tmvu-fl-panel-title');
        if (titleEl) titleEl.textContent = FRIENDLY_HISTORY_META?.title || 'History';

        let activeType = FRIENDLY_HISTORY_META?.initialType || INITIAL_HISTORY_TYPE;
        let activeSeason = FRIENDLY_HISTORY_META?.initialSeason || INITIAL_HISTORY_SEASON || FRIENDLY_HISTORY_META?.seasons?.[0]?.id || '';

        const renderHistory = async () => {
            contentHost.innerHTML = TmUI.loading('Loading history...', true);
            const html = await getFriendlyLeagueHistoryHtml(activeType, activeSeason);
            if (!html) {
                contentHost.innerHTML = TmUI.error('Failed to load history.');
                return;
            }

            if (activeType === 'matches') {
                const months = parseFriendlyLeagueHistoryMatches(html);
                if (!months.length) {
                    contentHost.innerHTML = TmUI.empty('No history listed.', true);
                    return;
                }
                contentHost.innerHTML = `
                    <div class="tmvu-fl-history-stack">
                        ${months.map(month => `
                            <section class="tmvu-fl-history-month">
                                <div class="tmvu-fl-history-month-title">${escapeHtml(month.label)}</div>
                                ${TmFixturesList.render(month.groups, { myClubId, season: CURRENT_SEASON, linkUpcoming: true, showType: false })}
                            </section>
                        `).join('')}
                    </div>
                `;
                TmFixturesList.bindHover(contentHost, { season: CURRENT_SEASON });
                TmFixturesList.bindRowNav(contentHost);
                return;
            }

            const rows = parseFriendlyLeagueHistoryStandings(html);
            contentHost.innerHTML = rows.length
                ? TmStandingsTable.buildHtml({ rows, nameLabel: 'Club' })
                : TmUI.empty('No history listed.', true);
        };

        controlsHost.innerHTML = '';
        controlsHost.appendChild(TmUI.tabs({
            items: (FRIENDLY_HISTORY_META?.typeDefs || []).map(item => ({ key: item.value, label: item.label })),
            active: activeType,
            cls: 'tmvu-fl-history-type-tabs',
            onChange: (nextType) => {
                activeType = nextType;
                renderHistory();
            },
        }));

        TmSeasonBar.mount(controlsHost, {
            seasons: FRIENDLY_HISTORY_META?.seasons || [],
            current: activeSeason,
            label: false,
            onChange: (nextSeason) => {
                activeSeason = nextSeason;
                renderHistory();
            },
        });

        renderHistory();
    };

    init().catch(() => {
        contentHost.innerHTML = TmUI.error('Failed to load history.');
    });

    return card;
};

const renderFixturesCard = (menuItems, activeHref, overview) => {
    const card = createTabCard(menuItems, activeHref);
    const fixturesCard = document.createElement('section');
    fixturesCard.className = 'tmu-card';
    fixturesCard.innerHTML = `
        <div class="tmu-card-head">
            <span class="tmvu-fl-panel-title">Fixtures</span>
        </div>
        <div class="tmu-card-body tmu-card-body-flush">
            <div data-ref="tabs"></div>
            <div data-ref="panel" class="tmvu-fl-fixtures-panel">${TmUI.loading('Loading fixtures...', true)}</div>
        </div>
    `;
    card.appendChild(fixturesCard);

    const tabsHost = card.querySelector('[data-ref="tabs"]');
    const panelHost = card.querySelector('[data-ref="panel"]');
    const myClubId = overview.standingsRows.find(row => row.isMe)?.clubId || String(window.SESSION?.main_id || '');

    const renderMonth = (months, activeMonthKey) => {
        const month = months.find(item => item.key === activeMonthKey) || months[0];
        if (!month) {
            panelHost.innerHTML = TmUI.empty('No fixtures listed.', true);
            return;
        }
        panelHost.innerHTML = month.groups.length
            ? TmFixturesList.render(month.groups, { myClubId, linkUpcoming: true, showType: true, season: CURRENT_SEASON })
            : TmUI.empty('No fixtures listed.', true);
        TmFixturesList.bindHover(panelHost, { season: CURRENT_SEASON });
        TmFixturesList.bindRowNav(panelHost);
    };

    const init = async () => {
        const data = await getFriendlyLeagueFixtures();
        const months = parseFriendlyLeagueFixtures(data);
        const activeMonthKey = months.find(month => month.active)?.key || months[0]?.key || '';
        if (!months.length) {
            tabsHost.innerHTML = '';
            panelHost.innerHTML = TmUI.empty('No fixtures listed.', true);
            return;
        }
        tabsHost.innerHTML = '';
        tabsHost.appendChild(TmUI.tabs({
            items: months.map(month => ({ key: month.key, label: month.label })),
            active: activeMonthKey,
            onChange: (nextKey) => renderMonth(months, nextKey),
        }));
        renderMonth(months, activeMonthKey);
    };

    init();
    return card;
};

const renderStatisticsCard = (menuItems, activeHref) => {
    const card = createTabCard(menuItems, activeHref);
    const statsCard = document.createElement('section');
    statsCard.className = 'tmu-card';
    statsCard.innerHTML = `
        <div class="tmu-card-head">
            <span class="tmvu-fl-panel-title">${escapeHtml(FRIENDLY_STATS_META?.title || 'Statistics')}</span>
        </div>
        <div class="tmu-card-body">
            <div data-ref="stats-browser">${TmUI.loading('Loading statistics...', true)}</div>
        </div>
    `;
    card.appendChild(statsCard);

    const browserHost = statsCard.querySelector('[data-ref="stats-browser"]');
    if (!browserHost) return card;

    const init = async () => {
        const initialHtml = await getFriendlyLeagueStatisticsHtml(INITIAL_STATS_STAT);
        FRIENDLY_STATS_META = parseFriendlyLeagueStatisticsMeta(initialHtml || currentRouteRoot);
        const titleEl = statsCard.querySelector('.tmvu-fl-panel-title');
        if (titleEl) titleEl.textContent = FRIENDLY_STATS_META?.title || 'Statistics';

        browserHost.innerHTML = '';
        mountPlayerStatsBrowser(browserHost, {
            statDefs: FRIENDLY_STATS_META?.statDefs || PLAYER_STAT_DEFS,
            initialStat: FRIENDLY_STATS_META?.initialStat || INITIAL_STATS_STAT,
            initialTeam: 0,
            teamLabels: FRIENDLY_STATS_META?.teamLabels || ['Main team', 'Under 21'],
            fetchFn: (stat, team, onDone) => {
                getFriendlyLeagueStatisticsHtml(stat)
                    .then((html) => onDone(parsePlayerStatsHtml(html, team)))
                    .catch(() => onDone(null));
            },
            colLabel: PLAYER_COL_LABELS,
        });
    };

    init().catch(() => {
        browserHost.innerHTML = TmUI.error('Failed to load statistics.');
    });

    return card;
};

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
    const fixtures = await getFriendlyLeagueFixtures();
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

    if (ACTIVE_TAB === 'fixtures') {
        standingsPanel = null;
        mainColumn.appendChild(renderFixturesCard(menuItems, activeHref, overview));
    } else if (ACTIVE_TAB === 'statistics') {
        standingsPanel = null;
        mainColumn.appendChild(renderStatisticsCard(menuItems, activeHref));
    } else if (ACTIVE_TAB === 'history') {
        standingsPanel = null;
        mainColumn.appendChild(renderHistoryCard(menuItems, activeHref, overview));
    } else {
        const standingsCard = createTabCard(menuItems, activeHref);
        const standingsWrap = document.createElement('div');
        standingsPanel = TmStandingsPanel.mount(standingsWrap, {
            rows: overview.standingsRows,
            liveZoneMap: {},
        });
        standingsCard.appendChild(standingsWrap);
        mainColumn.appendChild(standingsCard);
    }

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

export async function initFriendlyLeaguePage(mountedMain) {
    const currentPath = window.location.pathname;
    const routeMatch = currentPath.match(/^\/friendly-league(?:\/(\d+))?\/?$/i)
        || currentPath.match(/^\/fixtures\/friendly-league\/(\d+)\/?$/i)
        || currentPath.match(/^\/statistics\/friendly-league\/(\d+)(?:\/([^/]+))?\/?$/i);
    const historyMatch = currentPath.match(/^\/history\/friendly-league\/(standings|matches)(?:\/(.+))?\/?$/i);
    const nativeMain = document.querySelector('.main_center');
    if (!mountedMain || !nativeMain || (!routeMatch && !historyMatch)) return;
    if (!nativeMain.querySelector('.column1 .content_menu, .column2_a > .box')) return;

    main = mountedMain;
    sourceRoot = nativeMain;
    currentRouteRoot = nativeMain;
    LEAGUE_ID = routeMatch?.[1]
        || extractFriendlyLeagueId(nativeMain)
        || nativeMain.querySelector('#new_message_button')?.getAttribute('onclick')?.match(/pop_create_chat\((\d+),/)?.[1]
        || '';
    ACTIVE_TAB = /^\/fixtures\//i.test(currentPath)
        ? 'fixtures'
        : /^\/statistics\//i.test(currentPath)
            ? 'statistics'
            : /^\/history\//i.test(currentPath)
                ? 'history'
            : 'overview';
    INITIAL_STATS_STAT = routeMatch?.[2] || cleanText(nativeMain.querySelector('#stats_players')?.value || 'goals') || 'goals';
    INITIAL_HISTORY_TYPE = cleanText(historyMatch?.[1] || nativeMain.querySelector('#stats_type')?.value || 'standings') || 'standings';
    INITIAL_HISTORY_SEASON = cleanText(historyMatch?.[2] || nativeMain.querySelector('#stats_season')?.value || '');
    LEAGUE_FIXTURES_PROMISE = null;
    FRIENDLY_STATS_DOC_CACHE = null;
    FRIENDLY_HISTORY_DOC_CACHE = null;
    FRIENDLY_STATS_META = ACTIVE_TAB === 'statistics' ? parseFriendlyLeagueStatisticsMeta(nativeMain) : null;
    FRIENDLY_HISTORY_META = ACTIVE_TAB === 'history' ? parseFriendlyLeagueHistoryMeta(nativeMain) : null;

    if (ACTIVE_TAB !== 'overview' && LEAGUE_ID) {
        const overviewHtml = await TmLeagueModel.fetchFriendlyLeaguePageHtml(LEAGUE_ID);
        if (overviewHtml) {
            const overviewDoc = new DOMParser().parseFromString(overviewHtml, 'text/html');
            const overviewRoot = overviewDoc.querySelector('.main_center');
            if (overviewRoot) sourceRoot = overviewRoot;
        }
    }

    if (!sourceRoot) sourceRoot = nativeMain;
    render();
}