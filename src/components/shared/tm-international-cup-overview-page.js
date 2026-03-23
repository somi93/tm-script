import { TmMatchHoverCard } from './tm-match-hover-card.js';
import { TmHeroCard } from './tm-hero-card.js';
import { TmSectionCard } from './tm-section-card.js';
import { TmStandingsParser } from './tm-standings-parser.js';
import { TmStandingsTable } from './tm-standings-table.js';
import { TmTournamentPage } from './tm-tournament-page.js';
import { TmTournamentCards } from './tm-tournament-cards.js';
import { TmUI } from './tm-ui.js';

export function mountInternationalCupOverviewPage() {
    const main = document.querySelector('.tmvu-main, .main_center');
    if (!main) return;

    const sourceRoot = main.cloneNode(true);
    const STYLE_ID = 'tmvu-international-cup-overview-style';
    const CURRENT_SEASON = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;

    const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const htmlOf = (node) => node ? node.outerHTML : '';

    const stripShadow = (root) => {
        if (!root) return null;
        const clone = root.cloneNode(true);
        clone.querySelectorAll('.box_shadow').forEach(node => node.remove());
        return clone;
    };

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-main.tmvu-icup-page {
                display: grid !important;
                grid-template-columns: 184px minmax(0, .95fr) 360px;
                gap: 16px;
                align-items: start;
            }

            .tmvu-icup-main,
            .tmvu-icup-side {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .tmvu-icup-stage .small {
                color: #7fa669;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-icup-stage .button,
            .tmvu-icup-stage .faux_link {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 32px;
                padding: 0 12px;
                border-radius: 999px;
                border: 1px solid rgba(255,255,255,.1);
                background: rgba(42,74,28,.32);
                color: #e8f5d8;
                font-size: 11px;
                font-weight: 700;
                text-decoration: none;
                cursor: pointer;
            }

            .tmvu-icup-stage .button:hover,
            .tmvu-icup-stage .faux_link:hover {
                background: rgba(108,192,64,.14);
                color: #fff;
                text-decoration: none;
            }

            .tmvu-icup-stage,
            .tmvu-icup-side-body {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .tmvu-icup-stage h3,
            .tmvu-icup-side-body h3 {
                margin: 0;
                color: #e8f5d8;
                font-size: 14px;
                line-height: 1.35;
            }

            .tmvu-icup-stage .std,
            .tmvu-icup-side-body .std {
                color: #d6e8ca;
                font-size: 12px;
                line-height: 1.6;
            }

            .tmvu-icup-stage table:not(.tsa-table),
            .tmvu-icup-side-body table:not(.tsa-table) {
                width: 100%;
                border-collapse: collapse;
                border-spacing: 0;
                overflow: hidden;
                border-radius: 10px;
                background: rgba(12,24,9,.28);
                border: 1px solid rgba(61,104,40,.18);
            }

            .tmvu-icup-stage table:not(.tsa-table) th,
            .tmvu-icup-stage table:not(.tsa-table) td,
            .tmvu-icup-side-body table:not(.tsa-table) th,
            .tmvu-icup-side-body table:not(.tsa-table) td {
                padding: 9px 8px;
                color: #d7ebc9;
                font-size: 12px;
                border: 0;
                border-bottom: 1px solid rgba(61,104,40,.14);
            }

            .tmvu-icup-stage table:not(.tsa-table) th,
            .tmvu-icup-side-body table:not(.tsa-table) th {
                background: rgba(42,74,28,.42);
                color: #eef8e8;
                font-weight: 800;
            }

            .tmvu-icup-stage .match_list {
                list-style: none;
                padding: 0;
                margin: 0;
                border: 1px solid rgba(61,104,40,.18);
                border-radius: 10px;
                overflow: hidden;
            }

            .tmvu-icup-stage .match_list li {
                position: relative;
                display: grid;
                grid-template-columns: 62px minmax(0, 1fr) 62px minmax(0, 1fr);
                gap: 10px;
                align-items: center;
                padding: 10px 12px;
                margin: 0;
                line-height: 1.35;
                white-space: normal;
                border-bottom: 1px solid rgba(61,104,40,.14);
                background: rgba(12,24,9,.28);
            }

            .tmvu-icup-stage .match_list li:last-child {
                border-bottom: none;
            }

            .tmvu-icup-stage .match_list .match_date {
                position: static;
                display: inline-flex;
                align-items: center;
                justify-content: flex-start;
                width: auto;
            }

            .tmvu-icup-stage .match_list .matchtype {
                display: none;
            }

            .tmvu-icup-stage .match_list .hometeam,
            .tmvu-icup-stage .match_list .awayteam {
                width: auto;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                min-width: 0;
                overflow: hidden;
            }

            .tmvu-icup-stage .match_list .hometeam {
                justify-content: flex-end;
                text-align: right;
            }

            .tmvu-icup-stage .match_list .awayteam {
                justify-content: flex-start;
                text-align: left;
            }

            .tmvu-icup-stage .match_list .match_result {
                width: auto;
                text-align: center;
                font-size: 13px;
                font-weight: 800;
                color: #eef8e8;
            }

            .tmvu-icup-stage .match_list .match_result a {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 44px;
                padding: 4px 8px;
                border-radius: 999px;
                background: rgba(42,74,28,.32);
            }

            @media (max-width: 1220px) {
                .tmvu-main.tmvu-icup-page {
                    grid-template-columns: 184px minmax(0, 1fr);
                }

                .tmvu-icup-side {
                    grid-column: 1 / -1;
                }
            }
        `;

        document.head.appendChild(style);
    };

    const parseMenu = () => Array.from(sourceRoot.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
        if (node.tagName === 'HR') return [{ type: 'separator' }];
        if (node.tagName !== 'A') return [];
        const label = cleanText(node.textContent);
        const href = node.getAttribute('href') || '#';
        let icon = '🏆';
        if (/coeff/i.test(label)) icon = '∑';
        else if (/stat/i.test(label)) icon = '📊';
        return [{ type: 'link', href, label, icon, isSelected: node.classList.contains('selected') }];
    });

    const parseTournamentState = () => {
        const options = Array.from(sourceRoot.querySelectorAll('#change_league option')).map(option => ({
            id: String(option.value || ''),
            label: cleanText(option.textContent),
        })).filter(option => option.id && option.label);

        const selectedId = window.location.pathname.match(/^\/international-cup\/(\d+)\/?$/i)?.[1]
            || options.find(option => option.label === cleanText(sourceRoot.querySelector('.box_sub_header .large')?.textContent))?.id
            || options[0]?.id
            || '';

        return { options, selectedId };
    };

    const parseHeader = () => {
        const box = sourceRoot.querySelector('.column2_a > .box');
        const subHeader = box?.querySelector('.box_sub_header');
        const tournamentName = cleanText(subHeader?.querySelector('.large')?.textContent || 'International Cup');
        return { box, tournamentName };
    };

    const parseContentSections = (box) => {
        const body = box?.querySelector('.box_body');
        if (!body) return [];

        const sections = [];
        let current = null;

        Array.from(body.children).forEach(node => {
            if (node.classList.contains('box_shadow') || node.classList.contains('box_sub_header') || node.id === 'change_league') return;
            if (node.tagName === 'H3') {
                current = { title: cleanText(node.textContent), nodes: [] };
                sections.push(current);
                return;
            }
            if (!current) return;
            current.nodes.push(stripShadow(node));
        });

        return sections.filter(section => section.nodes.length);
    };

    const extractClubId = (node) => {
        if (!node) return '';
        const explicit = node.getAttribute('club_link');
        if (explicit) return String(explicit);
        const href = node.getAttribute('href') || '';
        const match = href.match(/\/club\/(\d+)\//);
        return match ? match[1] : '';
    };

    const extractCountryFlagHtml = (node) => {
        if (!node) return '';
        const countryAnchor = node.querySelector('a.country_link[href*="/national-teams/"], a[href*="/national-teams/"]');
        return countryAnchor?.innerHTML || '';
    };

    const extractMatchId = (node) => {
        if (!node) return '';
        const explicit = node.getAttribute('match_link');
        if (explicit) return String(explicit);
        const href = node.getAttribute('href') || '';
        const match = href.match(/\/matches\/(\d+)\//);
        return match ? match[1] : '';
    };

    const parseMatchListItem = (item) => {
        const homeAnchor = item.querySelector('.hometeam a[club_link], .hometeam a[href*="/club/"]');
        const awayAnchor = item.querySelector('.awayteam a[club_link], .awayteam a[href*="/club/"]');
        if (!homeAnchor || !awayAnchor) return null;

        const matchDateNode = item.querySelector('.match_date');
        const scoreAnchor = item.querySelector('.match_result a[match_link], .match_result a[href*="/matches/"]');
        const scoreText = cleanText(item.querySelector('.match_result')?.textContent || '—');
        const matchId = extractMatchId(scoreAnchor);
        const scoreHref = matchId ? `/matches/${matchId}/` : '';
        const dateLabel = cleanText(
            matchDateNode?.getAttribute('tooltip')
            || matchDateNode?.getAttribute('title')
            || matchDateNode?.textContent
            || ''
        );

        return {
            roundLabel: dateLabel,
            dateLabel,
            matchId,
            scoreText,
            scoreHref,
            isPlayed: /^\d+\s*-\s*\d+$/.test(scoreText),
            isHighlight: false,
            home: {
                id: extractClubId(homeAnchor),
                name: cleanText(homeAnchor.textContent),
                href: homeAnchor.getAttribute('href') || '#',
                flagHtml: extractCountryFlagHtml(item.querySelector('.hometeam')),
            },
            away: {
                id: extractClubId(awayAnchor),
                name: cleanText(awayAnchor.textContent),
                href: awayAnchor.getAttribute('href') || '#',
                flagHtml: extractCountryFlagHtml(item.querySelector('.awayteam')),
            },
        };
    };

    const parseSidePanel = () => {
        const box = sourceRoot.querySelector('.column3_a .box');
        if (!box) return null;
        const title = cleanText(box.querySelector('.box_head h2')?.textContent || 'Tournament Notes');
        const body = stripShadow(box.querySelector('.box_body'));
        const winners = Array.from(body?.querySelectorAll('.align_center[style*="display: inline-block"]') || []).map(node => {
            const clubAnchor = node.querySelector('a[club_link], a[href*="/club/"]');
            const clone = node.cloneNode(true);
            clone.querySelectorAll('img, a[club_link], a[href*="/club/"]').forEach(el => el.remove());
            return {
                imageSrc: node.querySelector('img')?.getAttribute('src') || '',
                clubHtml: clubAnchor?.outerHTML || '',
                leagueText: cleanText(clone.textContent || ''),
            };
        });
        body?.querySelectorAll('.align_center[style*="display: inline-block"]').forEach(node => node.remove());
        return {
            title,
            winners,
            html: body ? body.innerHTML : '',
        };
    };

    const getSectionIcon = (title) => {
        if (/semi|quarter|final/i.test(title)) return '⚔';
        if (/group stage/i.test(title)) return '🌐';
        if (/qualification/i.test(title)) return '🛫';
        return '📋';
    };

    const buildMatchGroups = (nodes) => {
        const allMatches = nodes.flatMap(node => {
            if (!node || node.tagName !== 'UL' || !node.classList.contains('match_list')) return [];
            return Array.from(node.querySelectorAll('li')).map(parseMatchListItem).filter(Boolean);
        });

        return allMatches.reduce((groups, match) => {
            const boundaryKey = match.dateLabel || match.roundLabel || '';
            const lastGroup = groups[groups.length - 1];
            if (lastGroup && lastGroup.boundaryKey === boundaryKey) {
                lastGroup.matches.push(match);
                return groups;
            }
            groups.push({
                label: `Match day ${groups.length + 1}${boundaryKey ? ` · ${boundaryKey}` : ''}`,
                boundaryKey,
                matches: [match],
            });
            return groups;
        }, []);
    };

    const renderStandingsTable = (table) => {
        const groups = TmStandingsParser.parseNativeGroupedTable(table);
        if (groups.length > 1 || (groups.length === 1 && groups[0].title)) {
            return TmStandingsTable.buildGroupedHtml({ groups });
        }
        const rows = TmStandingsParser.parseNativeTable(table);
        if (!rows.length) return '';
        return `<div class="tmvu-standings-wrap">${TmStandingsTable.buildHtml({ rows })}</div>`;
    };

    const openTournamentDialog = async ({ options, selectedId }) => {
        const selected = await TmUI.modal({
            icon: '🏆',
            title: 'Change Tournament',
            message: 'Pick the tournament you want to open.',
            buttons: options.map(option => ({
                value: option.id,
                label: option.label,
                sub: option.id === selectedId ? 'Current selection' : '',
                style: option.id === selectedId ? 'primary' : 'secondary',
            })).concat([{ value: 'cancel', label: 'Cancel', style: 'danger' }]),
        });

        if (!selected || selected === 'cancel' || selected === selectedId) return;
        window.location.href = `/international-cup/${selected}/`;
    };

    const renderHero = (header, tournamentState) => {
        const wrap = document.createElement('section');
        const tournamentLabel = tournamentState.options.find(option => option.id === tournamentState.selectedId)?.label || header.tournamentName;
        TmHeroCard.mount(wrap, {
            slots: {
                kicker: 'International Competition',
                title: escapeHtml(tournamentLabel),
                subtitle: 'Continental bracket, groups, qualifiers and archive in one view.',
                actions: TmHeroCard.button({
                    id: 'tmvu-icup-change',
                    label: 'Change tournament',
                }),
            },
        });

        wrap.querySelector('#tmvu-icup-change')?.addEventListener('click', () => openTournamentDialog(tournamentState));
        return wrap;
    };

    const renderSection = (section) => {
        const host = document.createElement('section');
        const matchGroups = buildMatchGroups(section.nodes);

        if (matchGroups.length === section.nodes.filter(Boolean).length) {
            if (matchGroups.length > 1) {
                return TmTournamentCards.renderGroupedFixturesCard({
                    title: section.title,
                    groups: matchGroups,
                }, {
                    season: CURRENT_SEASON,
                    icon: getSectionIcon(section.title),
                });
            }
            const merged = matchGroups.flatMap(group => group.matches);
            return TmTournamentCards.renderDrawCard({ title: section.title, rows: merged }, { season: CURRENT_SEASON, icon: getSectionIcon(section.title) });
        }

        let renderedGroupedFixtures = false;
        const bodyHtml = section.nodes.map(node => {
            if (!node) return '';
            if (node.tagName === 'UL' && node.classList.contains('match_list')) {
                if (matchGroups.length > 1) {
                    if (renderedGroupedFixtures) return '';
                    renderedGroupedFixtures = true;
                    return TmTournamentCards.buildGroupedFixtureList(matchGroups, { season: CURRENT_SEASON });
                }
                const matches = Array.from(node.querySelectorAll('li')).map(parseMatchListItem).filter(Boolean);
                return matches.length ? TmTournamentCards.buildFixtureList(matches, { season: CURRENT_SEASON }) : htmlOf(node);
            }
            if (node.tagName === 'TABLE') {
                return renderStandingsTable(node) || htmlOf(node);
            }
            const table = node.querySelector?.('table');
            if (table && node.children.length === 1) {
                return renderStandingsTable(table) || htmlOf(node);
            }
            return htmlOf(node);
        }).join('');

        TmSectionCard.mount(host, {
            title: section.title,
            icon: getSectionIcon(section.title),
            cardVariant: 'soft',
            hostClass: 'tmvu-icup-host',
            bodyClass: 'tmvu-icup-stage',
            bodyHtml,
        });
        return host;
    };

    const renderSidePanel = (panel) => TmTournamentCards.renderHistoryCard({
        historyItems: panel.winners || [],
        paragraphs: [panel.html],
    }, {
        title: panel.title,
        icon: '🏁',
    });

    injectStyles();
    TmStandingsTable.injectStyles();
    TmTournamentCards.injectStyles();
    TmMatchHoverCard.injectStyles();

    const header = parseHeader();
    if (!header.box) return;

    const sections = parseContentSections(header.box);
    const sidePanel = parseSidePanel();
    const tournamentState = parseTournamentState();
    const emptySideNote = sidePanel ? null : TmUI.noticeElement('Tournament side information was not available on the source page.', {
        tag: 'section',
        tone: 'muted',
    });

    TmTournamentPage.mount(main, {
        pageClass: 'tmvu-icup-page',
        navId: 'tmvu-icup-nav',
        navClass: 'tmvu-icup-nav',
        menuItems: parseMenu(),
        currentHref: window.location.pathname,
        mainClass: 'tmvu-icup-main',
        sideClass: 'tmvu-icup-side',
        mainNodes: [renderHero(header, tournamentState), ...sections.map(renderSection)],
        sideNodes: [sidePanel ? renderSidePanel(sidePanel) : null, emptySideNote],
        season: CURRENT_SEASON,
    });
}
