import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmMatchHoverCard } from '../components/shared/tm-match-hover-card.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmPosition } from '../lib/tm-position.js';
import { TmUtils } from '../lib/tm-utils.js';
import { TmPlayerService } from '../services/player.js';

(function () {
    'use strict';

    const routeMatch = window.location.pathname.match(/^\/national-teams\/(?:([a-z]{2,3})\/?)?$/i);
    if (!routeMatch) return;

    const main = document.querySelector('.tmvu-main, .main_center');
    if (!main) return;

    const sourceRoot = main.cloneNode(true);
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
    const decodeHtmlEntities = (value) => {
        const text = String(value || '');
        if (!text.includes('&')) return text;
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    };

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-main.tmvu-nt-page {
                display: grid !important;
                grid-template-columns: 184px minmax(0, 0.9fr) 390px;
                gap: 16px;
                align-items: start;
            }

            .tmvu-nt-main,
            .tmvu-nt-side {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .tmvu-nt-hero {
                position: relative;
                display: grid;
                grid-template-columns: minmax(0, 1fr) 132px;
                gap: 18px;
                align-items: center;
                padding: 6px 2px;
            }

            .tmvu-nt-hero::before {
                content: '';
                position: absolute;
                inset: -12px -12px auto auto;
                width: 180px;
                height: 180px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(108,192,64,.14), rgba(108,192,64,0));
                pointer-events: none;
            }

            .tmvu-nt-country {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #eef8e8;
                font-size: 28px;
                font-weight: 900;
                line-height: 1.08;
            }

            .tmvu-nt-country ib,
            .tmvu-nt-country img {
                flex-shrink: 0;
            }

            .tmvu-nt-change {
                margin-top: 10px;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                min-height: 30px;
                padding: 0 12px;
                border-radius: 999px;
                background: rgba(42,74,28,.32);
                border: 1px solid rgba(61,104,40,.3);
                color: #cfe6bb;
                font-size: 11px;
                font-weight: 700;
                text-decoration: none;
            }

            .tmvu-nt-change:hover {
                color: #fff;
                background: rgba(108,192,64,.14);
            }

            .tmvu-nt-subcopy {
                margin-top: 10px;
                color: #8aac72;
                font-size: 12px;
                line-height: 1.6;
                max-width: 54ch;
            }

            .tmvu-nt-subcopy a {
                color: #d8efc2;
                text-decoration: none;
            }

            .tmvu-nt-subcopy a:hover {
                text-decoration: underline;
            }

            .tmvu-nt-chip-row {
                margin-top: 12px;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .tmvu-nt-chip-row .tmu-chip {
                padding: 4px 10px;
                border-radius: 999px;
                font-size: 11px;
                line-height: 1.2;
                background: rgba(108,192,64,.12);
                border: 1px solid rgba(108,192,64,.2);
                color: #d7efbf;
            }

            .tmvu-nt-logo-shell {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 132px;
                border-radius: 18px;
                background:
                    radial-gradient(circle at center, rgba(108,192,64,.18), rgba(108,192,64,.02) 60%, transparent 75%),
                    linear-gradient(180deg, rgba(10,18,6,.52), rgba(10,18,6,.12));
                border: 1px solid rgba(61,104,40,.24);
            }

            .tmvu-nt-logo-shell img {
                width: 104px;
                height: 104px;
                object-fit: contain;
                filter: drop-shadow(0 8px 18px rgba(0,0,0,.35));
            }

            .tmvu-nt-stat-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 10px;
            }

            .tmvu-nt-stat {
                min-width: 0;
                padding: 12px 14px;
                border-radius: 10px;
                background: rgba(12,24,9,.42);
                border: 1px solid rgba(61,104,40,.18);
            }

            .tmvu-nt-stat-label {
                color: #7fa669;
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: .08em;
            }

            .tmvu-nt-stat-value {
                margin-top: 5px;
                color: #eef8e8;
                font-size: 14px;
                font-weight: 700;
                line-height: 1.4;
                word-break: break-word;
            }

            .tmvu-nt-stat-value a {
                color: #eef8e8;
                text-decoration: none;
            }

            .tmvu-nt-stat-value a:hover {
                text-decoration: underline;
            }

            .tmvu-nt-standings-wrap,
            .tmvu-nt-squad-wrap {
                border: 1px solid rgba(61,104,40,.22);
                border-radius: 10px;
                overflow: hidden;
                background: rgba(12,24,9,.28);
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
                background: rgba(255,255,255,.025) !important;
            }

            .tmvu-nt-standings-wrap td,
            .tmvu-nt-standings-wrap th {
                padding: 9px 8px;
                color: #d7ebc9;
                font-size: 12px;
                text-align: center;
                border-bottom: 1px solid rgba(61,104,40,.16);
            }

            .tmvu-nt-standings-wrap td.name,
            .tmvu-nt-standings-wrap .align_left {
                text-align: left;
            }

            .tmvu-nt-standings-wrap .highlighted_row_done td,
            .tmvu-nt-standings-wrap .highlight_td {
                background: rgba(108,192,64,.12) !important;
                color: #fff;
                font-weight: 700;
            }

            .tmvu-nt-standings-wrap a,
            .tmvu-nt-squad-wrap a,
            .tmvu-nt-fixture-team a,
            .tmvu-nt-trophy-title a {
                color: #eef8e8;
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
                filter: drop-shadow(0 4px 10px rgba(0,0,0,.22));
            }

            .tmvu-nt-fixture-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .tmvu-nt-fixture-row {
                position: relative;
                display: grid;
                grid-template-columns: 58px minmax(0, 1fr) auto minmax(0, 1fr) 54px;
                gap: 10px;
                align-items: center;
                padding: 10px 12px;
                border-radius: 10px;
                border: 1px solid rgba(61,104,40,.2);
                background: rgba(12,24,9,.34);
            }

            .tmvu-nt-fixture-date {
                color: #8aac72;
                font-size: 11px;
                font-weight: 700;
            }

            .tmvu-nt-fixture-team {
                min-width: 0;
                display: inline-flex;
                align-items: center;
                gap: 7px;
                color: #d7ebc9;
                font-size: 12px;
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
                color: #fff;
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
                padding: 0 10px;
                border-radius: 999px;
                background: rgba(42,74,28,.38);
                color: #eef8e8;
                font-size: 13px;
                font-weight: 800;
                text-decoration: none;
            }

            .tmvu-nt-fixture-type {
                justify-self: end;
                min-width: 40px;
                padding: 4px 7px;
                border-radius: 999px;
                background: rgba(96,165,250,.14);
                color: #cfe1ff;
                font-size: 10px;
                font-weight: 800;
                text-align: center;
                letter-spacing: .06em;
            }

            .tmvu-nt-empty {
                padding: 10px 2px 4px;
                color: #8aac72;
                font-size: 12px;
            }

            .tmvu-nt-trophy-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .tmvu-nt-trophy-item {
                display: grid;
                grid-template-columns: 72px minmax(0, 1fr);
                gap: 12px;
                align-items: center;
                padding: 10px 12px;
                border-radius: 10px;
                background: rgba(12,24,9,.34);
                border: 1px solid rgba(61,104,40,.18);
            }

            .tmvu-nt-trophy-icon {
                height: 58px;
                background-position: center;
                background-repeat: no-repeat;
                background-size: contain;
                filter: saturate(1.05);
            }

            .tmvu-nt-trophy-title {
                color: #eef8e8;
                font-size: 13px;
                font-weight: 700;
                line-height: 1.4;
            }

            .tmvu-nt-trophy-season {
                margin-top: 3px;
                color: #8aac72;
                font-size: 11px;
            }

            .tmvu-nt-squad-wrap td {
                padding: 8px;
                border-bottom: 1px solid rgba(61,104,40,.16);
                color: #d7ebc9;
                font-size: 12px;
            }

            .tmvu-nt-squad-wrap th {
                padding: 8px 10px;
                border-bottom: 1px solid rgba(61,104,40,.2);
                color: #8aac72;
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: .08em;
                background: rgba(42,74,28,.28);
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
                color: #eef8e8;
                text-decoration: none;
                font-weight: 700;
            }

            .tmvu-nt-squad-name a:hover {
                text-decoration: underline;
            }

            .tmvu-nt-squad-loading,
            .tmvu-nt-squad-error {
                padding: 10px 2px 4px;
            }

            .tmvu-nt-squad-wrap .favposition {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0;
                font-weight: 700;
            }

            .tmvu-nt-squad-wrap .gk { color: #7fe185; }
            .tmvu-nt-squad-wrap .d { color: #7db9ff; }
            .tmvu-nt-squad-wrap .dm,
            .tmvu-nt-squad-wrap .m,
            .tmvu-nt-squad-wrap .om { color: #ffd45f; }
            .tmvu-nt-squad-wrap .f { color: #ff9476; }
            .tmvu-nt-squad-wrap .side,
            .tmvu-nt-squad-wrap .split { color: #8aac72; }

            @media (max-width: 1220px) {
                .tmvu-main.tmvu-nt-page {
                    grid-template-columns: 184px minmax(0, 0.94fr) 350px;
                }
            }

            @media (max-width: 1040px) {
                .tmvu-main.tmvu-nt-page {
                    grid-template-columns: 184px minmax(0, 1fr);
                }

                .tmvu-nt-side {
                    grid-column: 1 / -1;
                }
            }

            @media (max-width: 760px) {
                .tmvu-main.tmvu-nt-page {
                    grid-template-columns: 1fr;
                }

                .tmvu-nt-hero {
                    grid-template-columns: 1fr;
                }

                .tmvu-nt-logo-shell {
                    max-width: 180px;
                    margin: 0 auto;
                }

                .tmvu-nt-country {
                    font-size: 24px;
                }

                .tmvu-nt-stat-grid {
                    grid-template-columns: 1fr 1fr;
                }

                .tmvu-nt-fixture-row {
                    grid-template-columns: 1fr;
                }

                .tmvu-nt-fixture-date,
                .tmvu-nt-fixture-type,
                .tmvu-nt-fixture-team.home,
                .tmvu-nt-fixture-team.away {
                    justify-self: start;
                    text-align: left;
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
            icon: /players/i.test(label) ? '👥'
                : /tournaments/i.test(label) ? '🏆'
                    : /rankings/i.test(label) ? '📈'
                        : /fixtures/i.test(label) ? '📅'
                            : /statistics/i.test(label) ? '📊'
                                : /history/i.test(label) ? '📜'
                                    : /election/i.test(label) ? '🗳'
                                        : '🌍',
            isSelected: node.classList.contains('selected'),
        }];
    });

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
        return Array.from(table.querySelectorAll('tr')).map(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) return null;

            const homeCell = row.querySelector('td.home') || cells[1];
            const awayCell = row.querySelector('td.away') || cells[3];
            const resultCell = cells[2];
            const typeCell = cells[4];
            const matchHref = resultCell.querySelector('a')?.getAttribute('href') || '';
            const matchId = matchHref.match(/\/(?:matches\/nt|matches)\/(\d+)\//)?.[1] || '';

            return {
                date: cleanText(cells[0].textContent),
                homeHtml: homeCell.innerHTML,
                awayHtml: awayCell.innerHTML,
                resultHtml: resultCell.innerHTML,
                resultHref: matchHref,
                resultText: cleanText(resultCell.textContent || 'vs'),
                matchId,
                type: cleanText(typeCell.textContent),
                focus: homeCell.classList.contains('bold') ? 'home' : awayCell.classList.contains('bold') ? 'away' : '',
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
        if (!Number.isFinite(Number(value))) return '<span style="color:#6a9a58">—</span>';
        const numeric = Number(value);
        return `<span style="color:${TmUtils.getColor(numeric, R5_THRESHOLDS)};font-weight:700">${numeric.toFixed(1)}</span>`;
    };

    const loadSquadPlayers = async (squad) => {
        const players = await Promise.all(squad.rows.map(async row => {
            try {
                const response = await TmPlayerService.fetchPlayerTooltip(row.playerId);
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
        if (!players.length) return '<div class="tmvu-nt-empty">No squad players available.</div>';
        return `
            <div class="tmvu-nt-squad-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Age</th>
                            <th>Pos</th>
                            <th>Name</th>
                            <th>R5</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${players.map(player => `
                            <tr>
                                <td>${escapeHtml(player.age)}</td>
                                <td>${player.posHtml}</td>
                                <td class="tmvu-nt-squad-name"><a href="${player.href}">${escapeHtml(player.name)}</a></td>
                                <td>${player.r5Html}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    const hydrateSquadCard = async (host, squad) => {
        if (!host) return;
        host.innerHTML = `<div class="tmvu-nt-squad-loading">${TmUI.loading('Loading squad...', true)}</div>`;

        try {
            const players = await loadSquadPlayers(squad);
            host.innerHTML = buildSquadTable(players);
        } catch (error) {
            host.innerHTML = `<div class="tmvu-nt-squad-error">${TmUI.error(`Failed to load squad: ${error.message}`, true)}</div>`;
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
                .replace(/class="([^"]*)"/, (_, classes) => `class="${`${classes} tmvu-nt-change`.replace(/\s+/g, ' ').trim()}"`)
            : '';

        TmUI.render(wrap, `
            <tm-card data-title="National Team" data-icon="🌍">
                <div class="tmvu-nt-hero">
                    <div>
                        <div class="tmvu-nt-country">${overview.countryHtml}</div>
                        ${changeHtml ? `<div>${changeHtml}</div>` : ''}
                    </div>
                    <div class="tmvu-nt-logo-shell">
                        ${overview.logoSrc ? `<img src="${overview.logoSrc}" alt="${escapeHtml(overview.countryName)} logo">` : ''}
                    </div>
                </div>
                <div class="tmvu-nt-stat-grid">
                    ${quickFacts.map(item => `
                        <div class="tmvu-nt-stat">
                            <div class="tmvu-nt-stat-label">${escapeHtml(item.label)}</div>
                            <div class="tmvu-nt-stat-value">${item.valueHtml}</div>
                        </div>
                    `).join('')}
                </div>
            </tm-card>
        `);

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
            <tm-card data-title="${escapeHtml(title)}" data-icon="📅">
                ${rows.length ? `
                    <div class="tmvu-nt-fixture-list">
                        ${rows.map(row => `
                            <div class="tmvu-nt-fixture-row" data-mid="${escapeHtml(row.matchId)}" data-season="${CURRENT_SEASON || ''}">
                                <div class="tmvu-nt-fixture-date">${escapeHtml(row.date)}</div>
                                <div class="tmvu-nt-fixture-team home${row.focus === 'home' ? ' is-focus' : ''}">${row.homeHtml}</div>
                                <div class="tmvu-nt-fixture-score">${row.resultHref ? `<a href="${row.resultHref}">${escapeHtml(row.resultText)}</a>` : `<span>${escapeHtml(row.resultText)}</span>`}</div>
                                <div class="tmvu-nt-fixture-team away${row.focus === 'away' ? ' is-focus' : ''}">${row.awayHtml}</div>
                                <div class="tmvu-nt-fixture-type">${escapeHtml(row.type || 'NT')}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="tmvu-nt-empty">No matches listed.</div>'}
            </tm-card>
        `);
        return wrap.firstElementChild || wrap;
    };

    const renderTrophiesCard = (items) => {
        const wrap = document.createElement('section');
        TmUI.render(wrap, `
            <tm-card data-title="Trophies" data-icon="🏆">
                ${items.length ? `
                    <div class="tmvu-nt-trophy-list">
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
                ` : '<div class="tmvu-nt-empty">No trophies listed.</div>'}
            </tm-card>
        `);
        return wrap.firstElementChild || wrap;
    };

    const renderSquadCard = (squad) => {
        const wrap = document.createElement('section');
        TmUI.render(wrap, `
            <tm-card data-title="Squad" data-icon="👥">
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

        const menuItems = parseMenu();
        const activeHref = menuItems.find(item => item.isSelected)?.href || window.location.pathname;
        const trophies = parseTrophies();
        const squad = parseSquad();

        main.classList.add('tmvu-nt-page');
        main.innerHTML = '';

        TmSideMenu.mount(main, {
            id: 'tmvu-national-teams-nav',
            className: 'tmvu-national-teams-nav',
            items: menuItems,
            currentHref: activeHref,
        });

        const mainColumn = document.createElement('section');
        mainColumn.className = 'tmvu-nt-main';
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
        sideColumn.className = 'tmvu-nt-side';
        sideColumn.appendChild(renderTrophiesCard(trophies));
        const squadCard = renderSquadCard(squad);
        sideColumn.appendChild(squadCard);

        main.append(mainColumn, sideColumn);
        hydrateSquadCard(squadCard.querySelector('[data-ref="squad-host"]'), squad);
        TmMatchHoverCard.bind(Array.from(main.querySelectorAll('.tmvu-nt-fixture-row[data-mid]')).filter(row => row.dataset.mid), { season: CURRENT_SEASON });
    };

    render();
})();