import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmFixturesList } from '../components/shared/tm-fixtures-list.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { mountNationalTeamsSideMenu } from '../components/national-teams/tm-national-teams-side-menu.js';
import { TmApi } from '../services/index.js';

const STYLE_ID = 'tmvu-national-teams-fixtures-style';

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const extractCountryCode = (href) => href.match(/\/national-teams\/([a-z]{2,3})\//i)?.[1]?.toLowerCase() || '';

const normalizeFlagHtml = (value) => {
    const html = String(value || '').trim();
    if (!html) return '';
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return wrapper.firstElementChild?.innerHTML || wrapper.innerHTML || '';
};

const parseFixturesResponse = (payload) => Object.entries(payload || {})
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([monthKey, month]) => {
        const matches = Array.from(month?.matches || []).map(match => ({
            date: cleanText(match?.date || ''),
            matchId: String(match?.id || ''),
            homeId: cleanText(match?.hometeam || ''),
            homeName: cleanText(match?.hometeamname || ''),
            homeHref: extractHrefFromHtml(match?.home_link),
            homeFlagHtml: normalizeFlagHtml(match?.home_flag),
            awayId: cleanText(match?.awayteam || ''),
            awayName: cleanText(match?.awayteamname || ''),
            awayHref: extractHrefFromHtml(match?.away_link),
            awayFlagHtml: normalizeFlagHtml(match?.away_flag),
            result: cleanText(match?.result || wrapperText(match?.match_link) || 'x-x'),
            matchtype_name: cleanText(match?.matchtype_name || match?.matchtype_sort || ''),
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

const wrapperText = (value) => {
    const html = String(value || '').trim();
    if (!html) return '';
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return cleanText(wrapper.textContent || '');
};

const extractHrefFromHtml = (value) => {
    const html = String(value || '').trim();
    if (!html) return '#';
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return wrapper.querySelector('a[href]')?.getAttribute('href') || '#';
};

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-nt-fixtures-page {
            --tmu-page-sidebar-width: 200px;
        }

        .tmvu-nt-fixtures-title {
            font-size: var(--tmu-font-sm);
            font-weight: 700;
            color: var(--tmu-text-strong);
            letter-spacing: 0.3px;
        }

        .tmvu-nt-fixtures-panel {
            padding: var(--tmu-space-lg);
        }
    `;
    document.head.appendChild(style);
};

export function initNationalTeamsFixturesPage(main) {
    if (!main || !main.isConnected) return;
    const routeMatch = window.location.pathname.match(/^\/fixtures\/national-teams\/([a-z]{2,3})\/?$/i);
    if (!routeMatch) return;

    const countryCode = routeMatch[1].toLowerCase();
    const sourceRoot = document.querySelector('.main_center') || main;
    const contentBox = sourceRoot.querySelector('.column2_a > .box');
    if (!contentBox) return;

    injectTmPageLayoutStyles();
    injectStyles();

    const title = cleanText(contentBox.querySelector('.box_head h2')?.textContent || 'Fixtures');

    main.innerHTML = '';
    main.classList.add('tmvu-nt-fixtures-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');

    mountNationalTeamsSideMenu(main, {
        root: sourceRoot,
        id: 'tmvu-national-teams-fixtures-nav',
        countryCode,
        currentSeason: Number(window.SESSION?.season) || null,
    });

    const mainColumn = document.createElement('section');
    mainColumn.className = 'tmu-page-section-stack';
    const card = document.createElement('section');
    card.className = 'tmu-card';
    card.innerHTML = `
        <div class="tmu-card-head">
            <span class="tmvu-nt-fixtures-title">${escapeHtml(title)}</span>
        </div>
        <div class="tmu-card-body tmu-card-body-flush">
            <div data-ref="tabs"></div>
            <div data-ref="panel" class="tmvu-nt-fixtures-panel"></div>
        </div>
    `;
    mainColumn.appendChild(card);
    main.appendChild(mainColumn);

    const tabsHost = card.querySelector('[data-ref="tabs"]');
    const panelHost = card.querySelector('[data-ref="panel"]');
    let months = [];
    let activeMonthKey = '';

    const renderMonth = (monthKey) => {
        const month = months.find(item => item.key === monthKey) || months[0];
        if (!month) {
            panelHost.innerHTML = TmUI.empty('No fixtures listed.', true);
            return;
        }
        panelHost.innerHTML = month.groups.length
            ? TmFixturesList.render(month.groups, { myClubId: countryCode, linkUpcoming: true, showType: true })
            : TmUI.empty('No fixtures listed.', true);
        TmFixturesList.bindHover(panelHost, { season: Number(window.SESSION?.season) || '' });
        TmFixturesList.bindRowNav(panelHost);
    };

    const renderTabs = () => {
        tabsHost.innerHTML = '';
        if (!months.length) return;
        tabsHost.appendChild(TmUI.tabs({
            items: months.map(month => ({ key: month.key, label: month.label })),
            active: activeMonthKey,
            onChange: (nextKey) => {
                activeMonthKey = nextKey;
                renderMonth(nextKey);
            },
        }));
    };

    const init = async () => {
        panelHost.innerHTML = TmUI.loading('Loading fixtures...');
        const data = await TmApi.fetchFixtures(countryCode);
        if (!data) {
            tabsHost.innerHTML = '';
            panelHost.innerHTML = TmUI.error('Failed to load fixtures.');
            return;
        }
        months = parseFixturesResponse(data);
        activeMonthKey = months.find(month => month.active)?.key || months[0]?.key || '';
        renderTabs();
        renderMonth(activeMonthKey);
    };

    init();
}