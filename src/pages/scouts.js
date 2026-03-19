import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmScoutReportCards } from '../components/shared/tm-scout-report-cards.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmTable } from '../components/shared/tm-table.js';
import { TmPlayerService } from '../services/player.js';
import { TmScoutsService } from '../services/scouts.js';
import { TmUtils } from '../lib/tm-utils.js';

(function () {
    'use strict';

    if (!/^\/scouts\/?$/i.test(window.location.pathname)) return;

    const main = document.querySelector('.tmvu-main, .main_center');
    if (!main) return;

    const sourceRoot = main.cloneNode(true);
    const STYLE_ID = 'tmvu-scouts-style';
    let mainColumn = null;

    const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const parseNumber = (value) => {
        const num = parseFloat(String(value ?? '').replace(/[^\d.-]/g, ''));
        return Number.isFinite(num) ? num : 0;
    };
    const parseCellNumber = (cell) => {
        if (!cell) return 0;
        const img = cell.querySelector('img[alt], img[title]');
        return parseInt(img?.getAttribute('alt') || img?.getAttribute('title') || cleanText(cell.textContent), 10) || 0;
    };
    const formatPosition = (value) => cleanText(String(value || '')).split(',').filter(Boolean).map(part => part.trim().toUpperCase()).join(', ') || '-';
    const parseMenu = () => Array.from(sourceRoot.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
        if (node.tagName === 'HR') return [{ type: 'separator' }];
        if (node.tagName !== 'A') return [];
        const label = cleanText(node.textContent);
        const href = node.getAttribute('href') || '#';
        let icon = '🧭';
        if (/hire/i.test(label)) icon = '➕';
        else if (/wage/i.test(label)) icon = '💰';
        return [{ type: 'link', href, label, icon, isSelected: node.classList.contains('selected') }];
    });

    const parseScoutsFromDom = () => {
        const rows = Array.from(sourceRoot.querySelectorAll('.column2_a .std table tr')).slice(1);
        return rows.map(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 9) return null;

            const nameCell = cleanText(cells[0].textContent);
            const match = nameCell.match(/^(.*)\((\d+)\)$/);
            const fullName = cleanText(match?.[1] || nameCell);
            const age = parseInt(match?.[2] || '0', 10) || 0;
            const fireHref = row.querySelector('a[href*="fire_scout_pop"]')?.getAttribute('href') || '';
            const scoutId = fireHref.match(/,\s*(\d+)\)/)?.[1] || '';

            return {
                id: scoutId,
                fullName,
                age,
                seniors: parseCellNumber(cells[1]),
                youths: parseCellNumber(cells[2]),
                physical: parseCellNumber(cells[3]),
                tactical: parseCellNumber(cells[4]),
                technical: parseCellNumber(cells[5]),
                development: parseCellNumber(cells[6]),
                psychology: parseCellNumber(cells[7]),
                fireHref,
            };
        }).filter(Boolean);
    };

    const parseFallbackReports = () => Array.from(sourceRoot.querySelectorAll('#scout_reports table tr')).slice(1).map(row => {
        const cells = row.querySelectorAll('td');
        const playerAnchor = cells[1]?.querySelector('a[href*="/players/"]');
        if (cells.length < 3 || !playerAnchor) return null;
        return {
            id: playerAnchor.getAttribute('href')?.match(/\/players\/(\d+)\//)?.[1] || '',
            playerId: playerAnchor.getAttribute('href')?.match(/\/players\/(\d+)\//)?.[1] || '',
            name: cleanText(playerAnchor.textContent),
            playerHref: playerAnchor.getAttribute('href') || '#',
            playerHtml: cells[1].innerHTML,
            displayTime: cleanText(cells[0].textContent),
            done: cleanText(cells[0].textContent),
            doneTs: 0,
            displayRec: 0,
            potentialStars: 0,
            skill: 0,
            skillPotential: 0,
            age: 0,
            position: '-',
            scoutId: '',
            scoutName: '-',
            peakPhy: 0,
            peakTac: 0,
            peakTec: 0,
            charisma: 0,
            professionalism: 0,
            aggression: 0,
            specialist: 0,
        };
    }).filter(Boolean);

    const normalizeReports = (rawReports, scouts) => {
        const scoutsById = Object.fromEntries(scouts.map(scout => [String(scout.id), scout]));
        return Object.values(rawReports || {}).map(report => {
            const scout = scoutsById[String(report.scoutid)] || null;
            const playerHref = `/players/${report.playerid}/${encodeURIComponent(String(report.name || '').replace(/\s+/g, '-'))}/`;
            return {
                id: String(report.id || report.playerid || ''),
                playerId: String(report.playerid || ''),
                name: cleanText(report.name || ''),
                playerHref,
                displayTime: cleanText(report.display_time || report.done || ''),
                done: cleanText(report.done || ''),
                doneTs: Date.parse(report.done || '') || 0,
                displayRec: parseNumber(report.display_rec ?? report.rec),
                potentialStars: (parseNumber(report.potential) || 0) / 2,
                skill: parseNumber(report.skill),
                skillPotential: parseNumber(report.skill_potential),
                age: parseInt(report.age || '0', 10) || 0,
                position: formatPosition(report.favposition),
                country: cleanText(report.nationalitet || ''),
                scoutId: String(report.scoutid || ''),
                scoutName: scout?.fullName || `Scout ${report.scoutid || ''}`,
                peakPhy: parseInt(report.peak_phy || '0', 10) || 0,
                peakTac: parseInt(report.peak_tac || '0', 10) || 0,
                peakTec: parseInt(report.peak_tec || '0', 10) || 0,
                charisma: parseInt(report.charisma || '0', 10) || 0,
                professionalism: parseInt(report.professionalism || '0', 10) || 0,
                aggression: parseInt(report.aggression || '0', 10) || 0,
                specialist: parseInt(report.specialist || '0', 10) || 0,
            };
        }).sort((left, right) => (right.doneTs - left.doneTs) || (parseInt(right.id, 10) - parseInt(left.id, 10)));
    };

    const buildSummary = (scouts, reports) => {
        const scoutCount = scouts.length;
        const reportCount = reports.length;
        const avgCoverage = scoutCount
            ? Math.round(scouts.reduce((sum, scout) => sum + scout.seniors + scout.youths + scout.physical + scout.tactical + scout.technical + scout.development + scout.psychology, 0) / (scoutCount * 7))
            : 0;
        const topReport = reports.reduce((best, report) => {
            if (!best) return report;
            if (report.potentialStars !== best.potentialStars) return report.potentialStars > best.potentialStars ? report : best;
            return report.displayRec > best.displayRec ? report : best;
        }, null);
        return { scoutCount, reportCount, avgCoverage, topReport };
    };

    const enrichReports = async (reports) => {
        const enriched = await Promise.all(reports.map(async report => {
            if (!report.playerId) return report;
            try {
                const [tooltipData, scoutData] = await Promise.all([
                    TmPlayerService.fetchPlayerTooltip(report.playerId),
                    TmPlayerService.fetchPlayerInfo(report.playerId, 'scout'),
                ]);
                return {
                    ...report,
                    currentAge: tooltipData?.player ? `${tooltipData.player.age}.${tooltipData.player.months || 0}` : '',
                    tooltipPlayer: tooltipData?.player && Array.isArray(tooltipData.player.skills) ? tooltipData.player : null,
                    fullScoutData: Array.isArray(scoutData?.reports) && scoutData.reports.length ? scoutData : null,
                };
            } catch {
                return report;
            }
        }));
        return enriched;
    };

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-main.tmvu-scouts-page {
                display: flex !important;
                gap: 16px;
                align-items: flex-start;
            }

            .tmvu-scouts-main {
                flex: 1 1 auto;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .tmvu-scouts-hero {
                display: grid;
                grid-template-columns: minmax(0, 1.2fr) minmax(240px, .8fr);
                gap: 18px;
                padding: 20px;
                border-radius: 16px;
                border: 1px solid rgba(90,126,42,.24);
                background:
                    radial-gradient(circle at top left, rgba(128,224,72,.11), rgba(128,224,72,0) 34%),
                    linear-gradient(135deg, rgba(19,34,11,.96), rgba(10,18,6,.92));
                box-shadow: 0 12px 28px rgba(0,0,0,.16);
            }

            .tmvu-scouts-kicker,
            .tmvu-scouts-stat-label,
            .tmvu-scouts-meta-label {
                color: #7fa669;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-scouts-title {
                color: #eef8e8;
                font-size: 30px;
                font-weight: 900;
                line-height: 1.02;
            }

            .tmvu-scouts-copy {
                margin-top: 10px;
                color: #a2c089;
                font-size: 12px;
                line-height: 1.65;
                max-width: 72ch;
            }

            .tmvu-scouts-summary {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 14px;
            }

            .tmvu-scouts-stat {
                min-width: 110px;
                padding: 10px 12px;
                border-radius: 12px;
                background: rgba(12,24,9,.34);
                border: 1px solid rgba(90,126,42,.16);
            }

            .tmvu-scouts-stat-value {
                margin-top: 4px;
                color: #eef8e8;
                font-size: 18px;
                font-weight: 900;
                line-height: 1;
            }

            .tmvu-scouts-meta-card {
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 14px;
                border-radius: 14px;
                border: 1px solid rgba(90,126,42,.2);
                background: rgba(255,255,255,.03);
            }

            .tmvu-scouts-meta-value {
                color: #eef8e8;
                font-size: 18px;
                font-weight: 900;
                line-height: 1.2;
            }

            .tmvu-scouts-meta-copy {
                color: #a2c089;
                font-size: 11px;
                line-height: 1.6;
            }

            .tmvu-scouts-grid {
                display: grid;
                grid-template-columns: minmax(0, 1fr) minmax(300px, .72fr);
                gap: 16px;
                align-items: start;
            }

            .tmvu-scouts-host .tmu-card {
                background: #16270f;
                border: 1px solid #28451d;
                border-radius: 12px;
                box-shadow: 0 0 9px #192a19;
            }

            .tmvu-scouts-card-body,
            .tmvu-scouts-side-body {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .tmvu-scouts-note {
                padding: 10px 12px;
                border-radius: 12px;
                border: 1px solid rgba(90,126,42,.18);
                background: rgba(128,224,72,.06);
                color: #d6e8ca;
                font-size: 12px;
                line-height: 1.55;
            }

            .tmvu-scouts-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .tmvu-scouts-list-item {
                padding: 12px;
                border-radius: 12px;
                background: rgba(12,24,9,.34);
                border: 1px solid rgba(90,126,42,.16);
            }

            .tmvu-scouts-list-head,
            .tmvu-scouts-player-head {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                align-items: center;
            }

            .tmvu-scouts-list-name,
            .tmvu-scouts-player-name a {
                color: #eef8e8;
                font-size: 13px;
                font-weight: 800;
                text-decoration: none;
            }

            .tmvu-scouts-player-name a:hover {
                color: #fff;
                text-decoration: underline;
            }

            .tmvu-scouts-list-meta,
            .tmvu-scouts-player-meta {
                margin-top: 8px;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .tmvu-scouts-chip {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 8px;
                border-radius: 999px;
                border: 1px solid rgba(90,126,42,.2);
                background: rgba(255,255,255,.03);
                color: #c8e0b4;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: .04em;
                text-transform: uppercase;
            }

            .tmvu-scouts-table-note {
                color: #8aac72;
                font-size: 11px;
                line-height: 1.55;
            }

            .tmvu-scouts-stars {
                display: inline-flex;
                gap: 1px;
                vertical-align: middle;
                font-size: 14px;
                line-height: 1;
            }

            .tmvu-scouts-star-full { color: #fbbf24; }
            .tmvu-scouts-star-green { color: #6cc040; }
            .tmvu-scouts-star-empty { color: #3d6828; }
            .tmvu-scouts-star-half {
                background: linear-gradient(90deg, #fbbf24 50%, #3d6828 50%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .tmvu-scouts-star-green-half {
                background: linear-gradient(90deg, #6cc040 50%, #3d6828 50%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .tmvu-scouts-inline-metric {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .tmvu-scouts-inline-main {
                color: #eef8e8;
                font-size: 12px;
                font-weight: 800;
            }

            .tmvu-scouts-inline-sub {
                color: #8aac72;
                font-size: 10px;
            }

            .tmvu-scouts-report-list {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 14px;
            }

            .tmvu-scouts-report-entry {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .tmvu-scouts-report-entry-head {
                display: flex;
                justify-content: space-between;
                gap: 12px;
                align-items: flex-start;
                padding: 0 2px;
            }

            .tmvu-scouts-report-entry-title a {
                color: #eef8e8;
                font-size: 14px;
                font-weight: 800;
                text-decoration: none;
            }

            .tmvu-scouts-report-entry-title a:hover {
                color: #fff;
                text-decoration: underline;
            }

            .tmvu-scouts-report-entry-copy {
                margin-top: 4px;
                color: #8aac72;
                font-size: 11px;
                line-height: 1.5;
            }

            .tmvu-scouts-fire {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 24px;
                padding: 0 10px;
                border-radius: 999px;
                border: 1px solid rgba(248,113,113,.26);
                background: rgba(248,113,113,.08);
                color: #ffb5b5;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: .06em;
                text-transform: uppercase;
                text-decoration: none;
            }

            .tmvu-scouts-fire:hover {
                background: rgba(248,113,113,.16);
                color: #ffd4d4;
                text-decoration: none;
            }

            .tmvu-scouts-report-card .tmu-card {
                margin: 0;
            }

            .tmvu-scouts-report-fallback {
                padding: 14px;
                border-radius: 12px;
                border: 1px dashed rgba(90,126,42,.22);
                background: rgba(12,24,9,.28);
                color: #8aac72;
                font-size: 12px;
                line-height: 1.55;
            }

            .tmvu-scouts-empty {
                padding: 22px;
                border-radius: 12px;
                border: 1px dashed rgba(90,126,42,.2);
                color: #8aac72;
                font-size: 12px;
                text-align: center;
            }

            @media (max-width: 1100px) {
                .tmvu-scouts-hero,
                .tmvu-scouts-grid {
                    grid-template-columns: 1fr;
                }

                .tmvu-scouts-report-list {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
            }

            @media (max-width: 860px) {
                .tmvu-main.tmvu-scouts-page {
                    flex-direction: column;
                }

                .tmvu-side-menu {
                    position: static;
                    width: 100%;
                }

                .tmvu-scouts-report-list {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    };

    const buildScoutTable = (scouts) => TmTable.table({
        cls: 'tmvu-scouts-table',
        headers: [
            { key: 'fullName', label: 'Scout', render: (value, item) => `<div class="tmvu-scouts-inline-metric"><span class="tmvu-scouts-inline-main">${escapeHtml(value)}</span><span class="tmvu-scouts-inline-sub">Age ${item.age}</span></div>` },
            { key: 'seniors', label: 'Sen', align: 'c', render: value => `<span style="color:${TmUtils.skillColor(value)};font-weight:700">${value}</span>` },
            { key: 'youths', label: 'Yth', align: 'c', render: value => `<span style="color:${TmUtils.skillColor(value)};font-weight:700">${value}</span>` },
            { key: 'physical', label: 'Phy', align: 'c', render: value => `<span style="color:${TmUtils.skillColor(value)};font-weight:700">${value}</span>` },
            { key: 'tactical', label: 'Tac', align: 'c', render: value => `<span style="color:${TmUtils.skillColor(value)};font-weight:700">${value}</span>` },
            { key: 'technical', label: 'Tec', align: 'c', render: value => `<span style="color:${TmUtils.skillColor(value)};font-weight:700">${value}</span>` },
            { key: 'development', label: 'Dev', align: 'c', render: value => `<span style="color:${TmUtils.skillColor(value)};font-weight:700">${value}</span>` },
            { key: 'psychology', label: 'Psy', align: 'c', render: value => `<span style="color:${TmUtils.skillColor(value)};font-weight:700">${value}</span>` },
            { key: 'id', label: '', align: 'r', sortable: false, render: (_, item) => item.id ? `<a href="#" class="tmvu-scouts-fire" data-scout-id="${escapeHtml(item.id)}" data-scout-name="${escapeHtml(item.fullName)}">Fire</a>` : '' },
        ],
        items: scouts,
        sortKey: 'seniors',
        sortDir: -1,
    });

    const renderDetailedReports = (container, items) => {
        if (!container) return;
        if (!items.length) {
            container.innerHTML = '<div class="tmvu-scouts-empty">No reports returned.</div>';
            return;
        }

        container.innerHTML = `<div class="tmvu-scouts-report-list">${items.map(item => {
            if (!item.fullScoutData || !item.tooltipPlayer) {
                return `<div class="tmvu-scouts-report-entry"><div class="tmvu-scouts-report-entry-head"><div><div class="tmvu-scouts-report-entry-title"><a href="${escapeHtml(item.playerHref)}">${escapeHtml(item.name)}</a></div><div class="tmvu-scouts-report-entry-copy">${escapeHtml(item.position)} • Age ${item.age || '-'}${item.currentAge ? ` • Now ${escapeHtml(item.currentAge)}` : ''}</div></div><div class="tmvu-scouts-chip">Loading</div></div><div class="tmvu-scouts-report-fallback">Best Estimate data is still loading for this player.</div></div>`;
            }
            return `<div class="tmvu-scouts-report-entry"><div class="tmvu-scouts-report-entry-head"><div><div class="tmvu-scouts-report-entry-title"><a href="${escapeHtml(item.playerHref)}">${escapeHtml(item.name)}</a></div><div class="tmvu-scouts-report-entry-copy">${escapeHtml(item.position)} • Report ${escapeHtml(item.done || item.displayTime || '-')} • ${escapeHtml(item.scoutName || '-')}</div></div><div class="tmvu-scouts-chip">${item.currentAge ? `Now ${escapeHtml(item.currentAge)}` : `Age ${item.age || '-'}`}</div></div><div class="tmvu-scouts-report-card">${TmScoutReportCards.bestEstimateHtml({ scoutData: item.fullScoutData, player: item.tooltipPlayer }) || '<div class="tmvu-scouts-report-fallback">Best Estimate data is unavailable for this report.</div>'}</div></div>`;
        }).join('')}</div>`;
    };

    const bindActions = (scouts) => {
        const byId = Object.fromEntries(scouts.map(scout => [String(scout.id), scout]));
        mainColumn.querySelectorAll('.tmvu-scouts-fire').forEach(link => {
            link.addEventListener('click', event => {
                event.preventDefault();
                const scoutId = link.dataset.scoutId || '';
                const scoutName = link.dataset.scoutName || byId[scoutId]?.fullName || 'Scout';
                if (typeof window.fire_scout_pop === 'function') {
                    window.fire_scout_pop(scoutName, scoutId);
                }
            });
        });
    };

    const renderPage = (scouts, reports) => {
        const summary = buildSummary(scouts, reports);

        main.innerHTML = '';
        main.classList.add('tmvu-scouts-page');
        TmSideMenu.mount(main, {
            id: 'tmvu-scouts-menu',
            items: parseMenu(),
            currentHref: '/scouts/',
        });

        mainColumn = document.createElement('div');
        mainColumn.className = 'tmvu-scouts-main';
        main.appendChild(mainColumn);

        const hero = document.createElement('section');
        hero.className = 'tmvu-scouts-hero';
        hero.innerHTML = `
            <div>
                <div class="tmvu-scouts-kicker">Scouting Desk</div>
                <div class="tmvu-scouts-title">Scout roster and live reports in one place.</div>
                <div class="tmvu-scouts-copy">Hired scouts stay visible with their full coverage spread, while the reports panel is refreshed from the live scouts reports endpoint instead of relying only on the server-rendered table.</div>
                <div class="tmvu-scouts-summary">
                    <div class="tmvu-scouts-stat"><div class="tmvu-scouts-stat-label">Hired Scouts</div><div class="tmvu-scouts-stat-value">${summary.scoutCount}</div></div>
                    <div class="tmvu-scouts-stat"><div class="tmvu-scouts-stat-label">Reports Loaded</div><div class="tmvu-scouts-stat-value">${summary.reportCount}</div></div>
                    <div class="tmvu-scouts-stat"><div class="tmvu-scouts-stat-label">Avg Coverage</div><div class="tmvu-scouts-stat-value">${summary.avgCoverage}/20</div></div>
                </div>
            </div>
            <div class="tmvu-scouts-meta-card">
                <div class="tmvu-scouts-meta-label">Best Ceiling</div>
                <div class="tmvu-scouts-meta-value">${summary.topReport ? escapeHtml(summary.topReport.name) : 'No reports'}</div>
                <div class="tmvu-scouts-meta-copy">${summary.topReport ? `${summary.topReport.potentialStars.toFixed(1)}★ ceiling, ${summary.topReport.skill} → ${summary.topReport.skillPotential}, ${escapeHtml(summary.topReport.scoutName)}` : 'No live reports were returned from the endpoint.'}</div>
                <div class="tmvu-scouts-note">Scout list is parsed from the native page so existing actions like Fire stay compatible. Reports are pulled live from /ajax/scouts_get_reports.ajax.php with a DOM fallback if the request fails.</div>
            </div>
        `;
        mainColumn.appendChild(hero);

        const reportsHost = document.createElement('div');
        mainColumn.appendChild(reportsHost);
        const reportsRefs = TmSectionCard.mount(reportsHost, {
            title: 'Latest Reports',
            icon: '📋',
            hostClass: 'tmvu-scouts-host',
            bodyClass: 'tmvu-scouts-card-body',
            subtitle: 'Best Estimate cards for each latest report, shown three per row.',
        });
        if (reports.length) {
            const note = document.createElement('div');
            note.className = 'tmvu-scouts-table-note';
            note.textContent = 'Each latest report is enriched with tooltip and scout data, then rendered in the same Best Estimate style used on the player page.';
            reportsRefs.body.appendChild(note);
            renderDetailedReports(reportsRefs.body, reports);
        } else {
            reportsRefs.body.innerHTML = '<div class="tmvu-scouts-empty">No reports returned.</div>';
        }

        const scoutsHost = document.createElement('div');
        mainColumn.appendChild(scoutsHost);
        const scoutsRefs = TmSectionCard.mount(scoutsHost, {
            title: 'Scouts',
            icon: '🕵️',
            hostClass: 'tmvu-scouts-host',
            bodyClass: 'tmvu-scouts-card-body',
            subtitle: 'Live roster from the page, same coverage columns used on the player scout tab.',
        });
        if (scouts.length) scoutsRefs.body.appendChild(buildScoutTable(scouts));
        else scoutsRefs.body.innerHTML = '<div class="tmvu-scouts-empty">No scouts hired.</div>';

        bindActions(scouts);
    };

    const boot = async () => {
        injectStyles();
        const scouts = parseScoutsFromDom();
        const response = await TmScoutsService.fetchReports();
        const reports = response && Object.keys(response).length ? normalizeReports(response, scouts) : parseFallbackReports();
        renderPage(scouts, reports);
        const enrichedReports = await enrichReports(reports);
        renderPage(scouts, enrichedReports);
    };

    boot();
})();