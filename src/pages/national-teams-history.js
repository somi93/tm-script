import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmFixturesList } from '../components/shared/tm-fixtures-list.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { mountNationalTeamsSideMenu } from '../components/national-teams/tm-national-teams-side-menu.js';

const STYLE_ID = 'tmvu-national-teams-history-style';
const MONTH_INDEX = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
};

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const extractDay = (item) => {
    const src = item.querySelector('.match_date img')?.getAttribute('src') || '';
    const match = src.match(/calendar_numeral_(\d+)\.png/i);
    return match ? Number(match[1]) : null;
};

const extractMonthMeta = (label) => {
    const match = cleanText(label).match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (!match) return null;
    const month = MONTH_INDEX[match[1].toLowerCase()];
    const year = Number(match[2]);
    if (!month || !year) return null;
    return { month, year };
};

const toIsoDate = (monthMeta, day) => {
    if (!monthMeta || !day) return '';
    const month = String(monthMeta.month).padStart(2, '0');
    const date = String(day).padStart(2, '0');
    return `${monthMeta.year}-${month}-${date}`;
};

const getListItems = (listEl) => Array.from(listEl?.children || []).filter(node => node.tagName === 'LI');

const findMonthHeader = (listEl) => {
    let current = listEl?.previousElementSibling || null;
    while (current) {
        if (current.tagName === 'H3') return current;
        current = current.previousElementSibling;
    }
    return null;
};

const parseMonthMatches = (listEl, monthMeta) => getListItems(listEl).map(item => {
    const homeTeam = item.querySelector('.hometeam');
    const awayTeam = item.querySelector('.awayteam');
    const homeLinks = homeTeam ? Array.from(homeTeam.querySelectorAll('a[href]')) : [];
    const awayLinks = awayTeam ? Array.from(awayTeam.querySelectorAll('a[href]')) : [];
    const resultLink = item.querySelector('.match_results a[href]');
    const day = extractDay(item);
    const date = toIsoDate(monthMeta, day);

    const homeNameLink = homeLinks.find(link => /normal/.test(link.className || '')) || homeLinks.at(-1) || null;
    const awayNameLink = awayLinks.find(link => /normal/.test(link.className || '')) || awayLinks[0] || null;
    const homeFlagLink = homeLinks.find(link => link.querySelector('ib, img')) || null;
    const awayFlagLink = awayLinks.find(link => link.querySelector('ib, img')) || null;

    return {
        date,
        matchId: resultLink?.getAttribute('href')?.match(/\/matches\/(?:nt\/)?(\d+)\//i)?.[1] || '',
        matchHref: resultLink?.getAttribute('href') || '',
        homeId: homeNameLink?.getAttribute('href')?.match(/\/national-teams\/([a-z]{2,3})\//i)?.[1] || '',
        homeName: cleanText(homeNameLink?.textContent || homeTeam?.textContent || ''),
        homeHref: homeNameLink?.getAttribute('href') || '',
        homeFlagHtml: homeFlagLink?.innerHTML || '',
        awayId: awayNameLink?.getAttribute('href')?.match(/\/national-teams\/([a-z]{2,3})\//i)?.[1] || '',
        awayName: cleanText(awayNameLink?.textContent || awayTeam?.textContent || ''),
        awayHref: awayNameLink?.getAttribute('href') || '',
        awayFlagHtml: awayFlagLink?.innerHTML || '',
        result: cleanText(resultLink?.textContent || ''),
        matchtype_name: cleanText(item.querySelector('.matchtype')?.textContent || ''),
    };
}).filter(match => match.matchId && match.homeName && match.awayName && match.date);

const parseHistoryMonths = (contentBox) => {
    const months = [];
    const lists = Array.from(contentBox.querySelectorAll('.box_body ul.match_list'));

    lists.forEach((listEl) => {
        const header = findMonthHeader(listEl);
        const label = cleanText(header?.textContent || '');
        const monthMeta = extractMonthMeta(label);
        if (!monthMeta) return;

        const matches = parseMonthMatches(listEl, monthMeta);
        if (!matches.length) return;

        months.push({
            key: `${monthMeta.year}-${String(monthMeta.month).padStart(2, '0')}-${months.length}`,
            label,
            sortValue: monthMeta.year * 100 + monthMeta.month,
            groups: TmFixturesList.fromMatches(matches),
        });
    });

    return months.sort((left, right) => (right.sortValue || 0) - (left.sortValue || 0));
};

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-nt-history-page {
            --tmu-page-sidebar-width: 200px;
        }

        .tmvu-nt-history-title {
            font-size: var(--tmu-font-sm);
            font-weight: 700;
            color: var(--tmu-text-strong);
            letter-spacing: 0.3px;
        }

        .tmvu-nt-history-panel {
            padding: var(--tmu-space-lg);
        }

        .tmvu-nt-history-stack {
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-lg);
        }

        .tmvu-nt-history-month {
            border: 1px solid var(--tmu-border-faint);
            border-radius: var(--tmu-radius-md);
            overflow: hidden;
            background: var(--tmu-surface-card-soft);
        }

        .tmvu-nt-history-month-title {
            padding: var(--tmu-space-sm) var(--tmu-space-md);
            font-size: var(--tmu-font-sm);
            font-weight: 700;
            color: var(--tmu-text-strong);
            background: var(--tmu-surface-header);
            border-bottom: 1px solid var(--tmu-border-faint);
        }
    `;
    document.head.appendChild(style);
};

export function initNationalTeamsHistoryPage(main) {
    if (!main || !main.isConnected) return;
    const routeMatch = window.location.pathname.match(/^\/history\/national-teams\/([a-z]{2,3})\/?$/i);
    if (!routeMatch) return;

    const countryCode = routeMatch[1].toLowerCase();
    const sourceRoot = document.querySelector('.main_center') || main;
    const contentBox = sourceRoot.querySelector('.column2_a > .box');
    if (!contentBox) return;

    injectTmPageLayoutStyles();
    injectStyles();

    const title = cleanText(contentBox.querySelector('.box_head h2')?.textContent || 'History');
    const months = parseHistoryMonths(contentBox);

    main.innerHTML = '';
    main.classList.add('tmvu-nt-history-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');

    mountNationalTeamsSideMenu(main, {
        root: sourceRoot,
        id: 'tmvu-national-teams-history-nav',
        countryCode,
        currentSeason: Number(window.SESSION?.season) || null,
    });

    const mainColumn = document.createElement('section');
    mainColumn.className = 'tmu-page-section-stack';
    const card = document.createElement('section');
    card.className = 'tmu-card';
    card.innerHTML = `
        <div class="tmu-card-head">
            <span class="tmvu-nt-history-title">${escapeHtml(title)}</span>
        </div>
        <div class="tmu-card-body tmu-card-body-flush">
            <div data-ref="panel" class="tmvu-nt-history-panel"></div>
        </div>
    `;
    mainColumn.appendChild(card);
    main.appendChild(mainColumn);

    const panelHost = card.querySelector('[data-ref="panel"]');

    if (!months.length) {
        panelHost.innerHTML = TmUI.empty('No history listed.', true);
        return;
    }

    panelHost.innerHTML = `
        <div class="tmvu-nt-history-stack">
            ${months.map((month) => `
                <section class="tmvu-nt-history-month">
                    <div class="tmvu-nt-history-month-title">${escapeHtml(month.label)}</div>
                    ${TmFixturesList.render(month.groups, { myClubId: countryCode, linkUpcoming: true, showType: true })}
                </section>
            `).join('')}
        </div>
    `;
    TmFixturesList.bindHover(panelHost, { season: Number(window.SESSION?.season) || '' });
    TmFixturesList.bindRowNav(panelHost);
}