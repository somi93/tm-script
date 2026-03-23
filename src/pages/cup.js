import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { TmMatchHoverCard } from '../components/shared/tm-match-hover-card.js';
import { TmTournamentPage } from '../components/shared/tm-tournament-page.js';
import { TmTournamentCards } from '../components/shared/tm-tournament-cards.js';
import { TmUI } from '../components/shared/tm-ui.js';

(function () {
    'use strict';

    if (!/^\/cup\/?$/.test(window.location.pathname)) return;

    const main = document.querySelector('.tmvu-main, .main_center');
    if (!main) return;
    const sourceRoot = main.cloneNode(true);

    const STYLE_ID = 'tmvu-cup-style';
    const CURRENT_SEASON = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-main.tmvu-cup-page {
                display: grid !important;
                grid-template-columns: 184px minmax(0, 0.88fr) 360px;
                gap: 16px;
                align-items: start;
            }

            .tmvu-cup-main,
            .tmvu-cup-side {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .tmvu-cup-side {
                align-self: start;
            }

            .tmvu-cup-emblem {
                width: 74px;
                height: 74px;
                object-fit: contain;
                filter: drop-shadow(0 6px 16px rgba(0,0,0,.35));
            }

            .tmvu-cup-club {
                color: #e8f5d8;
                font-size: 22px;
                font-weight: 800;
                line-height: 1.05;
                text-decoration: none;
            }

            .tmvu-cup-club:hover {
                color: #f4faed;
                text-decoration: underline;
            }

            .tmvu-cup-subcopy {
                margin-top: 8px;
                color: #8aac72;
                font-size: 12px;
                line-height: 1.45;
            }

            .tmvu-cup-subcopy a {
                color: #c8e0b4;
                text-decoration: none;
            }

            .tmvu-cup-subcopy a:hover {
                text-decoration: underline;
            }

            .tmvu-cup-round {
                margin-top: 14px;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
            }

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

            @media (max-width: 1320px) {
                .tmvu-main.tmvu-cup-page {
                    grid-template-columns: 184px minmax(0, 0.94fr) 320px;
                }
            }
        `;

        document.head.appendChild(style);
    };

    const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const htmlOf = (node) => node ? node.outerHTML : '';
    const metricHtml = (opts) => TmUI.metric(opts);

    const extractClubId = (node) => {
        if (!node) return '';
        const explicit = node.getAttribute('club_link');
        if (explicit) return String(explicit);
        const href = node.getAttribute('href') || '';
        const match = href.match(/\/club\/(\d+)\//);
        return match ? match[1] : '';
    };

    const extractMatchId = (node) => {
        if (!node) return '';
        const explicit = node.getAttribute('match_link');
        if (explicit) return String(explicit);
        const href = node.getAttribute('href') || '';
        const match = href.match(/\/matches\/(\d+)\//);
        return match ? match[1] : '';
    };

    const parseMatchRow = (row, roundLabel = '') => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length < 3) return null;

        const progressMode = cells.length >= 4;
        const roundCell = progressMode ? cells[0] : null;
        const homeCell = progressMode ? cells[1] : cells[0];
        const scoreCell = progressMode ? cells[2] : cells[1];
        const awayCell = progressMode ? cells[3] : cells[2];
        const homeAnchor = homeCell?.querySelector('a[club_link], a[href*="/club/"]');
        const awayAnchor = awayCell?.querySelector('a[club_link], a[href*="/club/"]');
        if (!homeAnchor || !awayAnchor) return null;

        const scoreAnchor = scoreCell?.querySelector('a[match_link], [match_link], a[href*="/matches/"]');
        const scoreText = cleanText(scoreCell?.textContent || '');
        const matchId = extractMatchId(scoreAnchor);
        const scoreHref = matchId ? `/matches/${matchId}/` : '';

        return {
            roundLabel: cleanText(roundCell?.textContent || roundLabel),
            matchId,
            scoreText: scoreText || '—',
            scoreHref,
            scoreHtml: scoreCell?.innerHTML || '',
            isPlayed: /\d+\s*-\s*\d+/.test(scoreText),
            isHighlight: row.classList.contains('highlighted_row_done') || !!row.querySelector('.highlight_td'),
            home: {
                id: extractClubId(homeAnchor),
                name: cleanText(homeAnchor.textContent) || cleanText(homeCell?.textContent || ''),
                href: homeAnchor.getAttribute('href') || '#',
            },
            away: {
                id: extractClubId(awayAnchor),
                name: cleanText(awayAnchor.textContent) || cleanText(awayCell?.textContent || ''),
                href: awayAnchor.getAttribute('href') || '#',
            },
        };
    };

    const parseMenu = () => {
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
    };

    const parseOverview = () => {
        const box = sourceRoot.querySelector('.column2_a > .box');
        if (!box) return null;

        const clubLink = box.querySelector('.box_sub_header .large a[club_link]');
        const competitionWrap = box.querySelector('.box_sub_header .large');
        const changeLink = box.querySelector('.box_sub_header a.float_right');
        const emblem = box.querySelector('.align_center img');
        const roundLink = box.querySelector('.align_center a[href*="/fixtures/cup/"]');
        const roundText = cleanText(box.querySelector('.align_center')?.textContent || '');
        const progressHeading = Array.from(box.querySelectorAll('h3')).find(node => /progress/i.test(node.textContent || ''));
        const progressStd = progressHeading?.nextElementSibling;
        const progressRows = Array.from(progressStd?.querySelectorAll('table tr') || []).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                round: cleanText(cells[0]?.textContent || ''),
                homeHtml: cells[1] ? cells[1].innerHTML : '',
                scoreHtml: cells[2] ? cells[2].innerHTML : '',
                awayHtml: cells[3] ? cells[3].innerHTML : '',
                isHighlight: row.classList.contains('highlighted_row_done') || row.querySelector('.highlight_td'),
            };
        });
        const sponsorHtml = progressStd?.querySelector('p')?.outerHTML || '';

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
            progressRows,
            sponsorHtml,
        };
    };

    const parseDrawSections = () => {
        const secondBox = sourceRoot.querySelectorAll('.column2_a > .box')[1];
        if (!secondBox) return [];

        const sections = [];
        let currentTitle = '';
        Array.from(secondBox.querySelector('.box_body')?.children || []).forEach(node => {
            if (node.tagName === 'H3') {
                currentTitle = cleanText(node.textContent);
                return;
            }
            if (!currentTitle || !node.classList.contains('std')) return;

            const rows = Array.from(node.querySelectorAll('table tr'))
                .map(row => parseMatchRow(row, currentTitle))
                .filter(Boolean);

            sections.push({ title: currentTitle, rows });
        });

        return sections;
    };

    const parseRouteRows = () => {
        const box = sourceRoot.querySelector('.column2_a > .box');
        if (!box) return [];
        const heading = Array.from(box.querySelectorAll('h3')).find(node => /progress/i.test(node.textContent || ''));
        const progressStd = heading?.nextElementSibling;
        return Array.from(progressStd?.querySelectorAll('table tr') || [])
            .map(row => parseMatchRow(row))
            .filter(Boolean);
    };

    const parseHistoryPanel = () => {
        const box = sourceRoot.querySelector('.column3_a .box');
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
    };

    const renderOverviewCard = (overview) => {
        const wrap = document.createElement('section');
        TmHeroCard.mount(wrap, {
            cardClass: 'tmvu-cup-hero-card',
            slots: {
                kicker: 'Cup',
                title: `<a class="tmvu-cup-club" href="${overview.clubHref}">${overview.clubName}</a>`,
                main: `
                    <div class="tmvu-cup-subcopy">${overview.competitionHtml}</div>
                    <div class="tmvu-cup-round">
                        ${overview.currentRoundHref && overview.currentRoundLabel ? metricHtml({ label: 'Current Round', value: `<a href="${overview.currentRoundHref}">${escapeHtml(overview.currentRoundLabel)}</a>`, tone: 'overlay', size: 'sm' }) : ''}
                        ${overview.roundText ? metricHtml({ label: 'Status', value: escapeHtml(overview.roundText), tone: 'overlay', size: 'sm' }) : ''}
                        ${overview.changeHtml ? metricHtml({ label: 'Club', value: overview.changeHtml, tone: 'overlay', size: 'sm' }) : ''}
                    </div>
                `,
                side: overview.emblemSrc ? `<img class="tmvu-cup-emblem" src="${overview.emblemSrc}" alt="">` : '',
            },
        });
        return wrap.firstElementChild || wrap;
    };

    const renderRouteCard = (routeRows, overview) => TmTournamentCards.renderRouteCard(routeRows, overview, { season: CURRENT_SEASON });

    const renderDrawCard = (section) => TmTournamentCards.renderDrawCard(section, { season: CURRENT_SEASON });

    const renderHistoryCard = (history) => TmTournamentCards.renderHistoryCard(history);

    const render = () => {
        injectStyles();
        TmTournamentCards.injectStyles();
        TmMatchHoverCard.injectStyles();

        const menuItems = parseMenu();
        const overview = parseOverview();
        const routeRows = parseRouteRows();
        const drawSections = parseDrawSections();
        const history = parseHistoryPanel();
        if (!overview) return;

        TmTournamentPage.mount(main, {
            pageClass: 'tmvu-cup-page',
            navId: 'tmvu-cup-nav',
            navClass: 'tmvu-cup-nav',
            menuItems,
            currentHref: '/cup/',
            mainClass: 'tmvu-cup-main',
            sideClass: 'tmvu-cup-side',
            mainNodes: [renderOverviewCard(overview), ...drawSections.map(renderDrawCard)],
            sideNodes: [routeRows.length ? renderRouteCard(routeRows, overview) : null, history ? renderHistoryCard(history) : null],
            season: CURRENT_SEASON,
        });
    };

    render();
})();