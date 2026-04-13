import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmMatchHoverCard } from '../components/shared/tm-match-hover-card.js';
import { TmMatchRow } from '../components/shared/tm-match-row.js';
import { TmTournamentCards } from '../components/shared/tm-tournament-cards.js';
import { mountNationalTeamsSideMenu } from '../components/national-teams/tm-national-teams-side-menu.js';
import { TmTable } from '../components/shared/tm-table.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmPosition } from '../lib/tm-position.js';
import { TmUtils } from '../lib/tm-utils.js';
import { TmPlayerModel } from '../models/player.js';

export function initNationalTeamsPage(main) {
    if (!main || !main.isConnected) return;

    const routeMatch = window.location.pathname.match(/^\/national-teams\/(?:([a-z]{2,3})\/?)?$/i);
    if (!routeMatch) return;
    const sourceRoot = (document.querySelector('.main_center') || main).cloneNode(true);
    const STYLE_ID = 'tmvu-national-teams-style';
    const { R5_THRESHOLDS } = TmConst;
    const CURRENT_SEASON = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;

    const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const metricHtml = (opts) => TmUI.metric(opts);
    const decodeHtmlEntities = (value) => {
        const text = String(value || '');
        if (!text.includes('&')) return text;
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    };

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        injectTmPageLayoutStyles();

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-nt-page {
                --tmu-page-main-track: minmax(0, 0.9fr);
                --tmu-page-rail-width: 390px;
            }

            .tmvu-nt-overview-card.tmu-card {
                border-color: transparent;
            }

            .tmvu-nt-country {
                display: flex;
                align-items: center;
                gap: var(--tmu-space-md);
            }

            .tmvu-nt-country ib,
            .tmvu-nt-country img {
                flex-shrink: 0;
            }

            .tmvu-nt-subcopy {
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-sm);
                line-height: 1.6;
                max-width: 54ch;
            }

            .tmvu-nt-subcopy a {
                color: var(--tmu-text-strong);
                text-decoration: none;
            }

            .tmvu-nt-subcopy a:hover {
                text-decoration: underline;
            }

            .tmvu-nt-logo-shell {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 132px;
                border-radius: 18px;
                background:
                    radial-gradient(circle at center, var(--tmu-success-fill-hover), var(--tmu-success-fill-faint) 60%, transparent 75%),
                    linear-gradient(180deg, var(--tmu-surface-panel-dark), var(--tmu-surface-dark-soft));
                border: 1px solid var(--tmu-border-soft-alpha-mid);
            }

            .tmvu-nt-logo-shell img {
                width: 104px;
                height: 104px;
                object-fit: contain;
                filter: drop-shadow(0 8px 18px var(--tmu-surface-overlay-strong));
            }

            .tmvu-nt-stat-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: var(--tmu-space-md);
            }

            .tmvu-nt-standings-wrap,
            .tmvu-nt-squad-wrap {
                border: 1px solid var(--tmu-border-soft-alpha-mid);
                overflow: hidden;
                background: var(--tmu-surface-dark-soft);
            }

            .tmvu-nt-standings-wrap table,
            .tmvu-nt-squad-wrap table {
                width: 100%;
                border-collapse: collapse;
            }

            .tmvu-nt-standings-wrap td,
            .tmvu-nt-standings-wrap th,
            .tmvu-nt-squad-wrap td,
            .tmvu-nt-squad-wrap th {
                border: 0;
            }

            .tmvu-nt-standings-wrap tr,
            .tmvu-nt-squad-wrap tr {
                background: transparent !important;
            }

            .tmvu-nt-standings-wrap tr:nth-child(even),
            .tmvu-nt-squad-wrap tr:nth-child(even) {
                background: var(--tmu-border-contrast) !important;
            }

            .tmvu-nt-standings-wrap td,
            .tmvu-nt-standings-wrap th {
                padding: var(--tmu-space-md) var(--tmu-space-sm);
                color: var(--tmu-text-main);
                font-size: var(--tmu-font-sm);
                text-align: center;
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
            }

            .tmvu-nt-standings-wrap td.name,
            .tmvu-nt-standings-wrap .align_left {
                text-align: left;
            }

            .tmvu-nt-standings-wrap .highlighted_row_done td,
            .tmvu-nt-standings-wrap .highlight_td {
                background: var(--tmu-success-fill-soft) !important;
                color: var(--tmu-text-strong);
                font-weight: 700;
            }

            .tmvu-nt-standings-wrap a,
            .tmvu-nt-squad-wrap a,
            .tmvu-nt-fixture-team a,
            .tmvu-nt-trophy-title a {
                color: var(--tmu-text-strong);
                text-decoration: none;
            }

            .tmvu-nt-standings-wrap a:hover,
            .tmvu-nt-squad-wrap a:hover,
            .tmvu-nt-fixture-team a:hover,
            .tmvu-nt-trophy-title a:hover {
                text-decoration: underline;
            }

            .tmvu-nt-standings-wrap img[src*="/pics/trophies/"] {
                width: 56px;
                height: 56px;
                object-fit: contain;
                filter: drop-shadow(0 4px 10px var(--tmu-surface-overlay));
            }

            .tmvu-nt-fixture-row {
                position: relative;
                display: grid;
                grid-template-columns: 58px minmax(0, 1fr) auto minmax(0, 1fr) 54px;
                gap: var(--tmu-space-md);
                align-items: center;
                padding: var(--tmu-space-md) var(--tmu-space-md);
                border-radius: var(--tmu-space-md);
                border: 1px solid var(--tmu-border-soft-alpha);
                background: var(--tmu-surface-dark-mid);
            }

            .tmvu-nt-fixture-date {
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-xs);
                font-weight: 700;
            }

            .tmvu-nt-fixture-team {
                min-width: 0;
                display: inline-flex;
                align-items: center;
                gap: var(--tmu-space-sm);
                color: var(--tmu-text-main);
                font-size: var(--tmu-font-sm);
            }

            .tmvu-nt-fixture-team.home {
                justify-content: flex-end;
                text-align: right;
            }

            .tmvu-nt-fixture-team.away {
                justify-content: flex-start;
                text-align: left;
            }

            .tmvu-nt-fixture-team.is-focus {
                color: var(--tmu-text-strong);
                font-weight: 800;
            }

            .tmvu-nt-fixture-team a.normal {
                flex: 1 1 auto;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .tmvu-nt-fixture-score a,
            .tmvu-nt-fixture-score span {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 58px;
                min-height: 30px;
                padding: 0 var(--tmu-space-md);
                border-radius: 999px;
                background: var(--tmu-surface-accent-soft);
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-sm);
                font-weight: 800;
                text-decoration: none;
            }

            .tmvu-nt-fixture-type {
                justify-self: end;
                min-width: 40px;
                padding: var(--tmu-space-xs) var(--tmu-space-sm);
                border-radius: 999px;
                background: var(--tmu-preview-fill);
                color: var(--tmu-text-preview);
                font-size: var(--tmu-font-xs);
                font-weight: 800;
                text-align: center;
                letter-spacing: .06em;
            }

            .tmvu-nt-trophy-item {
                display: grid;
                grid-template-columns: 72px minmax(0, 1fr);
                gap: var(--tmu-space-md);
                align-items: center;
                padding: var(--tmu-space-md) var(--tmu-space-md);
                border-radius: var(--tmu-space-md);
                background: var(--tmu-surface-dark-mid);
                border: 1px solid var(--tmu-border-soft-alpha);
            }

            .tmvu-nt-trophy-icon {
                height: 58px;
                background-position: center;
                background-repeat: no-repeat;
                background-size: contain;
                filter: saturate(1.05);
            }

            .tmvu-nt-trophy-title {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-sm);
                font-weight: 700;
                line-height: 1.4;
            }

            .tmvu-nt-trophy-season {
                margin-top: var(--tmu-space-xs);
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-xs);
            }

            .tmvu-nt-squad-wrap td {
                padding: var(--tmu-space-sm);
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
                color: var(--tmu-text-main);
                font-size: var(--tmu-font-sm);
            }

            .tmvu-nt-squad-wrap th {
                padding: var(--tmu-space-sm) var(--tmu-space-md);
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-xs);
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: .08em;
                background: var(--tmu-surface-accent-soft);
            }

            .tmvu-nt-squad-wrap tr:last-child td {
                border-bottom: none;
            }

            .tmvu-nt-squad-wrap th:first-child,
            .tmvu-nt-squad-wrap td:first-child {
                text-align: right;
                white-space: nowrap;
            }

            .tmvu-nt-squad-wrap th:nth-child(2),
            .tmvu-nt-squad-wrap td:nth-child(2) {
                text-align: left;
                padding-right: 0;
            }

            .tmvu-nt-squad-wrap th:nth-child(3),
            .tmvu-nt-squad-wrap td:nth-child(3) {
                width: 180px;
                padding-left: 0;
                padding-right: 0;
            }

            .tmvu-nt-squad-wrap th:last-child,
            .tmvu-nt-squad-wrap td:last-child {
                text-align: right;
                white-space: nowrap;
            }

            .tmvu-nt-squad-name a {
                color: var(--tmu-text-strong);
                text-decoration: none;
                font-weight: 700;
            }

            .tmvu-nt-squad-name a:hover {
                text-decoration: underline;
            }

            .tmvu-nt-squad-wrap .favposition {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0;
                font-weight: 700;
            }

            @media (max-width: 1220px) {
                .tmvu-nt-page {
                    --tmu-page-main-track: minmax(0, 0.94fr);
                    --tmu-page-rail-width: 350px;
                }
            }
        `;

        document.head.appendChild(style);
    };

    const parseFactTable = (table) => Array.from(table?.querySelectorAll('tr') || []).map(row => {
        const label = cleanText(row.querySelector('th')?.textContent || '');
        const valueCell = row.querySelector('td:last-child');
        const valueHtml = valueCell?.innerHTML?.trim() || '';
        if (!label || !valueHtml) return null;
        return { label, valueHtml };
    }).filter(Boolean);

    const sanitizeStandingsTable = (table) => {
        if (!table) return '';
        const clone = table.cloneNode(true);
        clone.querySelectorAll('td[rowspan] img[src*="/pics/trophies/"]').forEach(img => {
            img.closest('td[rowspan]')?.remove();
        });
        return clone.outerHTML;
    };

    const parseOverview = () => {
        const box = sourceRoot.querySelector('.column2_a > .box');
        if (!box) return null;

        const subHeader = box.querySelector('.box_sub_header');
        const countryNode = subHeader?.querySelector('.large');
        const changeLink = subHeader?.querySelector('.float_right');
        const overviewTable = box.querySelector('.std table.zebra');
        const logoSrc = overviewTable?.querySelector('img[src*="/pics/nt_logos/"]')?.getAttribute('src') || '';
        const facts = parseFactTable(overviewTable);

        const sections = Array.from(box.querySelectorAll('h3')).map(heading => {
            const title = cleanText(heading.textContent);
            const body = heading.nextElementSibling;
            if (!body || !body.classList.contains('std')) return null;

            const factTable = body.querySelector('table.zebra:not(.group_table):not(.fixtures_table)');
            const standingsTable = body.querySelector('table.group_table');
            const fixtureTable = body.querySelector('table.fixtures_table');

            if (factTable) {
                return { type: 'facts', title, items: parseFactTable(factTable) };
            }

            if (standingsTable) {
                return { type: 'standings', title, html: sanitizeStandingsTable(standingsTable) };
            }

            if (fixtureTable) {
                return { type: 'fixtures', title, rows: parseFixtures(fixtureTable) };
            }

            return null;
        }).filter(Boolean);

        const countryInfoSection = sections.find(section => section.type === 'facts');
        const uetaChampionsCup = countryInfoSection?.items.find(item => /ueta champions cup spots/i.test(item.label)) || null;

        return {
            countryName: cleanText(countryNode?.textContent || 'National Team'),
            countryHtml: countryNode?.innerHTML || escapeHtml(cleanText(countryNode?.textContent || 'National Team')),
            changeHtml: changeLink?.outerHTML || '',
            logoSrc,
            facts,
            uetaChampionsCup,
            sections,
        };
    };

    function parseFixtures(table) {
        const extractTeam = (cell) => {
            const teamAnchor = cell.querySelector('a[href*="/national-teams/"]');
            const countryAnchor = cell.querySelector('a.country_link, a[href*="/national-teams/"][class*="country"]');
            const flagEl = cell.querySelector('ib[class*="flag-img-"], img[class*="flag-img-"]');
            const flagHtml = countryAnchor ? countryAnchor.innerHTML : (flagEl ? flagEl.outerHTML : '');
            return {
                id: '',
                name: cleanText(teamAnchor?.textContent || cell.textContent || ''),
                href: teamAnchor?.getAttribute('href') || '#',
                flagHtml,
            };
        };

        return Array.from(table.querySelectorAll('tr')).map(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) return null;

            const homeCell = row.querySelector('td.home') || cells[1];
            const awayCell = row.querySelector('td.away') || cells[3];
            const resultCell = cells[2];
            const matchHref = resultCell.querySelector('a')?.getAttribute('href') || '';
            const matchId = matchHref.match(/\/(?:matches\/nt|matches)\/(\d+)\//)?.[1] || '';
            const scoreText = cleanText(resultCell.textContent || 'vs') || 'vs';

            return {
                matchId,
                season: CURRENT_SEASON,
                scoreText,
                scoreHref: matchId ? `/matches/${matchId}/` : '',
                isPlayed: /\d+\s*-\s*\d+/.test(scoreText),
                isHighlight: homeCell.classList.contains('bold') || awayCell.classList.contains('bold'),
                home: extractTeam(homeCell),
                away: extractTeam(awayCell),
            };
        }).filter(Boolean);
    }

    const parseTrophies = () => {
        const trophyHead = Array.from(sourceRoot.querySelectorAll('.column3_a .box_head h2')).find(node => /trophies/i.test(node.textContent || ''));
        const trophyBody = trophyHead?.closest('.box_head')?.nextElementSibling;
        return Array.from(trophyBody?.querySelectorAll('.clearfix') || []).map(row => {
            const icon = row.children[0];
            const content = row.children[1];
            const subtle = content?.querySelector('.subtle');
            const season = cleanText(subtle?.textContent || '');
            if (subtle) subtle.remove();
            return {
                iconStyle: icon?.getAttribute('style') || '',
                titleHtml: content?.innerHTML?.replace(/<br\s*\/?>/gi, ' ').trim() || '',
                season,
            };
        }).filter(item => item.titleHtml);
    };

    const parseSquad = () => {
        const squadHead = Array.from(sourceRoot.querySelectorAll('.column3_a .box_head h2')).find(node => /squad/i.test(node.textContent || ''));
        const squadBody = squadHead?.closest('.box_head')?.nextElementSibling;
        const rows = Array.from(squadBody?.querySelectorAll('table tr') || []).map(row => {
            const cells = row.querySelectorAll('td');
            const playerAnchor = row.querySelector('a[player_link], a[href*="/players/"]');
            if (!playerAnchor || cells.length < 3) return null;
            const playerId = playerAnchor.getAttribute('player_link') || playerAnchor.getAttribute('href')?.match(/\/players\/(\d+)\//)?.[1] || '';

            return {
                playerId: String(playerId),
                number: cleanText(cells[0].textContent),
                name: decodeHtmlEntities(cleanText(playerAnchor.textContent)),
                href: playerAnchor.getAttribute('href') || '#',
            };
        }).filter(row => row && row.playerId);

        return { rows };
    };

    const formatAge = (player) => {
        const years = Number(player?.age) || 0;
        const months = Number(player?.months ?? player?.month) || 0;
        return `${years}.${String(months).padStart(2, '0')}`;
    };

    const formatR5 = (value) => {
        if (!Number.isFinite(Number(value))) return '<span style="color:var(--tmu-text-faint)">—</span>';
        const numeric = Number(value);
        return `<span style="color:${TmUtils.getColor(numeric, R5_THRESHOLDS)};font-weight:700">${TmUtils.formatR5(numeric)}</span>`;
    };

    const loadSquadPlayers = async (squad) => {
        const players = await Promise.all(squad.rows.map(async row => {
            try {
                const response = await TmPlayerModel.fetchPlayerTooltip(row.playerId);
                const player = response?.player;
                if (!player) return null;
                return {
                    id: String(player.id || row.playerId),
                    href: `/players/${player.id || row.playerId}/`,
                    name: decodeHtmlEntities(player.name || row.name),
                    age: formatAge(player),
                    posHtml: TmPosition.chip(player.positions || []),
                    r5Html: formatR5(player.r5),
                };
            } catch {
                return null;
            }
        }));

        return players.filter(Boolean);
    };

    const buildSquadTable = (players) => {
        if (!players.length) return TmUI.empty('No squad players available.', true);

        const table = TmTable.table({
            items: players,
            headers: [
                { key: 'age', label: 'Age', sortable: false, render: (value) => escapeHtml(value) },
                { key: 'posHtml', label: 'Pos', sortable: false, render: (value) => value },
                {
                    key: 'name',
                    label: 'Name',
                    sortable: false,
                    render: (_value, player) => `<span class="tmvu-nt-squad-name"><a href="${player.href}">${escapeHtml(player.name)}</a></span>`,
                },
                { key: 'r5Html', label: 'R5', sortable: false, render: (value) => value },
            ],
            cls: ' tmvu-nt-squad-table',
        });

        return `
            <div class="tmvu-nt-squad-wrap">
                ${table.outerHTML}
            </div>
        `;
    };

    const hydrateSquadCard = async (host, squad) => {
        if (!host) return;
        host.innerHTML = TmUI.loading('Loading squad...', true);

        try {
            const players = await loadSquadPlayers(squad);
            host.innerHTML = buildSquadTable(players);
        } catch (error) {
            host.innerHTML = TmUI.error(`Failed to load squad: ${error.message}`, true);
        }
    };

    const renderOverviewCard = (overview) => {
        const wrap = document.createElement('section');
        const quickFacts = overview.facts.slice(0, 6);
        if (overview.uetaChampionsCup && !quickFacts.some(item => /ueta champions cup spots/i.test(item.label))) {
            quickFacts.push(overview.uetaChampionsCup);
        }
        const changeHtml = overview.changeHtml
            ? overview.changeHtml
                .replace(/\bfloat_right\b/g, '')
                .replace(/class="([^"]*)"/, (_, classes) => `class="${`${classes} tmu-btn tmu-btn-secondary rounded-full py-1 px-3 text-sm`.replace(/\s+/g, ' ').trim()}"`)
            : '';

        TmHeroCard.mount(wrap, {
            cardClass: 'tmvu-nt-overview-card',
            sideClass: 'tmvu-nt-logo-shell',
            slots: {
                kicker: 'National Team',
                title: `<span class="tmvu-nt-country">${overview.countryHtml}</span>`,
                subtitle: '<span class="tmvu-nt-subcopy">Recent form, trophies, fixtures and senior squad in one place.</span>',
                actions: changeHtml,
                side: overview.logoSrc ? `<img src="${overview.logoSrc}" alt="${escapeHtml(overview.countryName)} logo">` : '',
                footer: `
                    <div class="tmvu-nt-stat-grid">
                        ${quickFacts.map(item => metricHtml({ label: escapeHtml(item.label), value: item.valueHtml, tone: 'overlay', size: 'sm' })).join('')}
                    </div>
                `,
            },
        });

        return wrap.firstElementChild || wrap;
    };

    const renderStandingsCard = (title, html) => {
        const wrap = document.createElement('section');
        TmUI.render(wrap, `
            <tm-card data-title="${escapeHtml(title)}" data-icon="🏁">
                <div class="tmvu-nt-standings-wrap">${html}</div>
            </tm-card>
        `);
        return wrap.firstElementChild || wrap;
    };

    const renderFixturesCard = (title, rows) => {
        const wrap = document.createElement('section');
        TmUI.render(wrap, `
            <tm-card data-title="${escapeHtml(title)}" data-icon="📅" data-flush>
                ${rows.length ? TmTournamentCards.buildFixtureList(rows, { season: CURRENT_SEASON }) : TmUI.empty('No matches listed.', true)}
            </tm-card>
        `);
        return wrap.firstElementChild || wrap;
    };

    const renderTrophiesCard = (items) => {
        const wrap = document.createElement('section');
        TmUI.render(wrap, `
            <tm-card data-title="Trophies" data-icon="🏆">
                ${items.length ? `
                    <div class="tmvu-nt-trophy-list tmu-stack tmu-stack-density-tight">
                        ${items.map(item => `
                            <div class="tmvu-nt-trophy-item">
                                <div class="tmvu-nt-trophy-icon" style="${item.iconStyle}"></div>
                                <div>
                                    <div class="tmvu-nt-trophy-title">${item.titleHtml}</div>
                                    ${item.season ? `<div class="tmvu-nt-trophy-season">${escapeHtml(item.season)}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : TmUI.empty('No trophies listed.', true)}
            </tm-card>
        `);
        return wrap.firstElementChild || wrap;
    };

    const renderSquadCard = (squad) => {
        const wrap = document.createElement('section');
        TmUI.render(wrap, `
            <tm-card data-title="Squad" data-icon="👥" data-flush>
                <div data-ref="squad-host"></div>
            </tm-card>
        `);
        return wrap.firstElementChild || wrap;
    };

    const render = () => {
        injectStyles();
        TmMatchHoverCard.injectStyles();

        const overview = parseOverview();
        if (!overview) return;
        const trophies = parseTrophies();
        const squad = parseSquad();

        main.classList.add('tmvu-nt-page', 'tmu-page-layout-3rail', 'tmu-page-density-regular');
        main.innerHTML = '';

        const { navEl: sideMenuEl } = mountNationalTeamsSideMenu(main, {
            root: sourceRoot,
            id: 'tmvu-national-teams-nav',
            className: 'tmvu-national-teams-nav tmu-page-sidebar-stack',
            countryCode: routeMatch[1] || cleanText(window.SESSION?.country || ''),
            currentSeason: CURRENT_SEASON,
        });

        const mainColumn = document.createElement('section');
        mainColumn.className = 'tmvu-nt-main tmu-page-section-stack';
        mainColumn.appendChild(renderOverviewCard(overview));

        overview.sections.forEach(section => {
            if (section.type === 'standings' && section.html) {
                mainColumn.appendChild(renderStandingsCard(section.title, section.html));
            }
            if (section.type === 'fixtures') {
                mainColumn.appendChild(renderFixturesCard(section.title, section.rows));
            }
        });

        const sideColumn = document.createElement('aside');
        sideColumn.className = 'tmvu-nt-side tmu-page-rail-stack';
        sideColumn.appendChild(renderTrophiesCard(trophies));
        const squadCard = renderSquadCard(squad);
        sideColumn.appendChild(squadCard);

        main.append(mainColumn, sideColumn);
        hydrateSquadCard(squadCard.querySelector('[data-ref="squad-host"]'), squad);
        TmMatchRow.enhance(main, { season: CURRENT_SEASON });
    };

    render();
}