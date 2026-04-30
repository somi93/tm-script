import { TmPageHero } from './tm-page-hero.js';
import { TmCupModel } from '../../models/cup.js';
import { TmMatchHoverCard } from './tm-match-hover-card.js';
import { injectTmPageLayoutStyles } from './tm-page-layout.js';
import { TmTournamentPage } from './tm-tournament-page.js';
import { TmTournamentCards } from './tm-tournament-cards.js';

const STYLE_ID = 'tmvu-cup-style';

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    injectTmPageLayoutStyles();

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-cup-page {
            --tmu-page-main-track: minmax(0, 0.88fr);
            --tmu-page-rail-width: 360px;
        }

        .tmvu-cup-side {
            align-self: start;
        }

        .tmvu-cup-club {
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-xl);
            font-weight: 800;
            line-height: 1.05;
            text-decoration: none;
        }

        .tmvu-cup-club:hover {
            color: var(--tmu-text-strong);
            text-decoration: underline;
        }

        .tmvu-cup-subcopy {
             margin-top: var(--tmu-space-sm);
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-sm);
            line-height: 1.45;
        }

        .tmvu-cup-subcopy a {
            color: var(--tmu-text-main);
            text-decoration: none;
        }

        .tmvu-cup-subcopy a:hover {
            text-decoration: underline;
        }

        .tmvu-cup-sponsor {
            padding: var(--tmu-space-md);
            background: var(--tmu-card-bg, var(--tmu-surface-tab-active));
            border: 1px solid var(--tmu-border-input-overlay);
            border-radius: var(--tmu-space-sm);
            color: var(--tmu-text-main);
            font-size: var(--tmu-font-sm);
            line-height: 1.55;
            text-align: right;
        }

        .tmvu-cup-sponsor p {
            margin: 0;
        }

        .tmvu-cup-sponsor a {
            color: var(--tmu-text-strong);
            text-decoration: none;
        }
    `;

    document.head.appendChild(style);
}

function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function htmlOf(node) {
    return node ? node.outerHTML : '';
}

function matchFromApi(m, roundLabel = '') {
    return {
        roundLabel,
        matchId: String(m.id || ''),
        scoreText: m.result ? String(m.result) : 'x-x',
        scoreHref: `/matches/${m.id}/`,
        scoreHtml: m.match_link || '',
        isPlayed: m.result != null && /\d/.test(String(m.result)),
        isHighlight: false,
        home: {
            id: String(m.hometeam || ''),
            name: cleanText(m.hometeam_name || ''),
            href: m.home_link?.match(/href="([^"]+)"/)?.[1] || `/club/${m.hometeam}/`,
        },
        away: {
            id: String(m.awayteam || ''),
            name: cleanText(m.awayteam_name || ''),
            href: m.away_link?.match(/href="([^"]+)"/)?.[1] || `/club/${m.awayteam}/`,
        },
    };
}

function parseMenu(sourceRoot) {
    return Array.from(sourceRoot.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
        if (node.tagName === 'HR') return [{ type: 'separator' }];
        if (node.tagName !== 'A') return [];
        return [{
            type: 'link',
            href: node.getAttribute('href') || '#',
            label: cleanText(node.textContent),
            icon: /cup/i.test(node.textContent) ? '🏆' : /fixture/i.test(node.textContent) ? '📅' : /stat/i.test(node.textContent) ? '📊' : /history/i.test(node.textContent) ? '📜' : '📋',
        }];
    });
}

function findMainBox(sourceRoot, n = 0) {
    return sourceRoot.querySelectorAll('.column2_a .box, .column2 .box')[n] || null;
}

function findSideBox(sourceRoot) {
    return sourceRoot.querySelector('.column3_a .box, .column3 .box');
}

function parseOverview(sourceRoot) {
    const box = findMainBox(sourceRoot, 0);
    if (!box) {
        return {
            clubName: 'Cup',
            clubHref: '#',
            changeHtml: '',
            competitionHtml: '',
            emblemSrc: '',
            currentRoundHref: '',
            currentRoundLabel: '',
            roundText: '',
            sponsorHtml: '',
        };
    }

    const clubLink = box.querySelector('.box_sub_header .large a[club_link]');
    const competitionWrap = box.querySelector('.box_sub_header .large');
    const changeLink = box.querySelector('.box_sub_header a.float_right');
    const emblem = box.querySelector('.align_center img');
    const roundLink = box.querySelector('.align_center a[href*="/fixtures/cup/"]');
    const roundText = cleanText(box.querySelector('.align_center')?.textContent || '');
    const progressHeading = Array.from(box.querySelectorAll('h3')).find(node => /progress/i.test(node.textContent || ''));
    const progressStd = progressHeading?.nextElementSibling;
    const sponsorP = progressStd?.querySelector('p')?.cloneNode(true);
    if (sponsorP) {
        const countryLink = sponsorP.querySelector('a[href*="/national-teams/"]');
        if (countryLink && countryLink.nextSibling?.nodeName !== 'BR') {
            countryLink.insertAdjacentHTML('afterend', '<br>');
        }
    }
    const sponsorHtml = sponsorP?.outerHTML || '';

    let competitionHtml = '';
    if (competitionWrap) {
        const clone = competitionWrap.cloneNode(true);
        clone.querySelectorAll('a[club_link]').forEach(node => node.remove());
        clone.querySelectorAll('br').forEach(br => br.replaceWith(document.createTextNode(' ')));
        competitionHtml = clone.innerHTML.trim();
    }

    return {
        clubName: cleanText(clubLink?.textContent || 'Cup'),
        clubHref: clubLink?.getAttribute('href') || '#',
        changeHtml: htmlOf(changeLink),
        competitionHtml,
        emblemSrc: emblem?.getAttribute('src') || '',
        currentRoundHref: roundLink?.getAttribute('href') || '',
        currentRoundLabel: cleanText(roundLink?.textContent || ''),
        roundText,
        sponsorHtml,
    };
}

function extractCupParams(sourceRoot) {
    for (const link of sourceRoot.querySelectorAll('a[href*="/fixtures/cup/"]')) {
        const match = link.getAttribute('href')?.match(/\/fixtures\/cup\/([^/]+)\/(\d+)\//);
        if (match) return { country: match[1], cupId: match[2] };
    }
    const countryLink = sourceRoot.querySelector('a.country_link[href*="/national-teams/"]');
    const countryMatch = countryLink?.getAttribute('href')?.match(/\/national-teams\/([^/]+)\//);
    return { country: countryMatch?.[1] || '', cupId: '' };
}

function buildRouteRows(data, clubId) {
    if (!data || !clubId) return [];
    const tagged = Object.values(data).flatMap(month =>
        (month.matches || []).map(m => ({ m, label: month.date_name || month.month || '' }))
    );
    return tagged
        .filter(({ m }) => String(m.hometeam) === clubId || String(m.awayteam) === clubId)
        .sort((a, b) => String(a.m.date || '').localeCompare(String(b.m.date || '')))
        .map(({ m, label }) => matchFromApi(m, label));
}

function buildDrawSections(data) {
    if (!data) return [];
    return Object.entries(data)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, month]) => ({
            title: month.date_name || month.month || 'Matches',
            rows: (month.matches || []).map(m => matchFromApi(m)),
        }))
        .filter(section => section.rows.length > 0);
}

function buildFixtureGroups(data) {
    if (!data) return [];
    return Object.entries(data)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, month]) => ({
            label: month.date_name || month.month || 'Matches',
            matches: (month.matches || []).map(m => matchFromApi(m)),
        }))
        .filter(group => group.matches.length > 0);
}

function parseHistoryPanel(sourceRoot) {
    const box = findSideBox(sourceRoot);
    if (!box) return null;

    const historyItems = Array.from(box.querySelectorAll('.align_center[style*="display: inline-block"]')).map(node => {
        const clubAnchor = node.querySelector('a[club_link]');
        const clone = node.cloneNode(true);
        clone.querySelectorAll('img, a[club_link]').forEach(el => el.remove());
        return {
            imageSrc: node.querySelector('img')?.getAttribute('src') || '',
            clubHtml: clubAnchor?.outerHTML || '',
            leagueText: cleanText(clone.textContent || ''),
        };
    });

    const paragraphs = Array.from(box.querySelectorAll('.std p')).map(node => node.outerHTML);

    return { historyItems, paragraphs };
}

function renderOverviewCard(overview) {
    const wrap = document.createElement('section');
    TmPageHero.mount(wrap, {
        slots: {
            kicker: 'Cup',
            title: `<a class="tmvu-cup-club" href="${overview.clubHref}">${overview.clubName}</a>`,
            main: `<div class="tmvu-cup-subcopy">${overview.competitionHtml}</div>`,
            side: overview.sponsorHtml ? `<div class="tmvu-cup-sponsor">${overview.sponsorHtml}</div>` : '',
        },
    });
    return wrap.firstElementChild || wrap;
}

export function mountCupPage(main, { mode = 'overview' } = {}) {
    if (!main || !main.isConnected) return;

    const sourceRoot = document.querySelector('.main_center') || main;
    const currentPath = window.location.pathname;
    const isFixturesPage = mode === 'fixtures';
    const currentSeason = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;

    const renderRouteCard = (routeRows, overview) => TmTournamentCards.renderRouteCard(routeRows, { ...overview, sponsorHtml: '' }, { season: currentSeason });
    const renderDrawCard = (section) => TmTournamentCards.renderDrawCard(section, { season: currentSeason });
    const renderHistoryCard = (history) => TmTournamentCards.renderHistoryCard(history);

    const render = async () => {
        try {
            injectStyles();
            TmTournamentCards.injectStyles();
            TmMatchHoverCard.injectStyles();

            const menuItems = parseMenu(sourceRoot);
            const overview = parseOverview(sourceRoot);
            if (!overview) return;

            const { country, cupId } = extractCupParams(sourceRoot);
            const fixturesData = country ? await TmCupModel.fetchCupFixtures(country, cupId) : null;

            const clubId = overview.clubHref?.match(/\/club\/(\d+)\//)?.[1] || '';
            const routeRows = buildRouteRows(fixturesData, clubId);
            const drawSections = buildDrawSections(fixturesData);
            const fixtureGroups = buildFixtureGroups(fixturesData);
            const history = parseHistoryPanel(sourceRoot);

            const fixtureCard = isFixturesPage && fixtureGroups.length
                ? TmTournamentCards.renderGroupedFixturesCard({
                    title: overview.currentRoundLabel || overview.roundText || 'Fixtures',
                    groups: fixtureGroups,
                }, {
                    season: currentSeason,
                    icon: '📅',
                })
                : null;

            TmTournamentPage.mount(main, {
                pageClass: 'tmvu-cup-page tmu-page-layout-3rail tmu-page-density-regular',
                navId: 'tmvu-cup-nav',
                navClass: 'tmvu-cup-nav tmu-page-sidebar-stack',
                menuItems,
                currentHref: currentPath,
                mainClass: 'tmvu-cup-main tmu-page-section-stack',
                sideClass: 'tmvu-cup-side tmu-page-rail-stack',
                mainNodes: isFixturesPage
                    ? [renderOverviewCard(overview), fixtureCard]
                    : [renderOverviewCard(overview), ...drawSections.map(renderDrawCard)],
                sideNodes: [routeRows.length ? renderRouteCard(routeRows, overview) : null, history ? renderHistoryCard(history) : null],
                season: currentSeason,
            });
        } catch (err) {
            console.error('[cup] render error', err);
        }
    };

    render();
}