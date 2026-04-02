import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmScoutReportCards } from '../components/shared/tm-scout-report-cards.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmTable } from '../components/shared/tm-table.js';
import { TmUI } from '../components/shared/tm-ui.js';
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
    const metricHtml = (opts) => TmUI.metric(opts);
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
            const fireLink = row.querySelector('a[href*="fire_scout_pop"]');
            const fireHref = fireLink?.getAttribute('href') || '';
            const scoutIdMatch = fireHref.match(/,\s*(\d+)\)/);
            const scoutId = scoutIdMatch?.[1] || '';

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
        if (cells.length < 3) return null;

        const playerAnchor = cells[1]?.querySelector('a[href*="/players/"]');
        const playerHref = playerAnchor?.getAttribute('href') || '';
        const playerIdMatch = playerHref.match(/\/players\/(\d+)\//);
        const playerId = playerIdMatch?.[1] || '';
        if (!playerAnchor || !playerId) return null;

        const displayTime = cleanText(cells[0].textContent);
        return {
            id: playerId,
            playerId,
            name: cleanText(playerAnchor.textContent),
            playerHref,
            playerHtml: cells[1].innerHTML,
            displayTime,
            done: displayTime,
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
        injectTmPageLayoutStyles();
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-scouts-hero {
                display: grid;
                grid-template-columns: minmax(0, 1.2fr) minmax(240px, .8fr);
                gap: var(--tmu-space-xl);
                padding: var(--tmu-space-xl);
                border-radius: var(--tmu-space-lg);
                border: 1px solid var(--tmu-border-soft-alpha-mid);
                background:
                    radial-gradient(circle at top left, var(--tmu-success-fill-soft), transparent 34%),
                    linear-gradient(135deg, var(--tmu-surface-panel) 0%, var(--tmu-surface-dark-muted) 100%);
                box-shadow: 0 12px 28px var(--tmu-shadow-elev);
            }

            .tmvu-scouts-kicker {
                color: var(--tmu-text-panel-label);
                font-size: var(--tmu-font-xs);
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-scouts-title {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-3xl);
                font-weight: 900;
                line-height: 1.02;
            }

            .tmvu-scouts-copy {
                margin-top: var(--tmu-space-md);
                color: var(--tmu-text-main);
                font-size: var(--tmu-font-sm);
                line-height: 1.65;
                max-width: 72ch;
            }

            .tmvu-scouts-summary {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: var(--tmu-space-md);
                margin-top: var(--tmu-space-lg);
            }

            .tmvu-scouts-summary .tmu-metric {
                min-width: 0;
            }

            .tmvu-scouts-meta-card {
                padding: var(--tmu-space-lg);
                border-radius: var(--tmu-space-lg);
                border: 1px solid var(--tmu-border-soft-alpha);
                background: var(--tmu-border-contrast);
            }

            .tmvu-scouts-meta-card .tmvu-scouts-top-report {
                padding: 0;
                background: transparent;
                border: 0;
                box-shadow: none;
            }

            .tmvu-scouts-meta-card .tmvu-scouts-top-report .tmu-metric-value {
                font-size: var(--tmu-font-lg);
                line-height: 1.2;
            }

            .tmvu-scouts-stars {
                display: inline-flex;
                gap: 1px;
                vertical-align: middle;
                font-size: var(--tmu-font-md);
                line-height: 1;
            }

            .tmvu-scouts-star-full { color: var(--tmu-warning); }
            .tmvu-scouts-star-green { color: var(--tmu-success); }
            .tmvu-scouts-star-empty { color: var(--tmu-border-embedded); }
            .tmvu-scouts-star-half {
                background: linear-gradient(90deg, var(--tmu-warning) 50%, var(--tmu-border-embedded) 50%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .tmvu-scouts-star-green-half {
                background: linear-gradient(90deg, var(--tmu-success) 50%, var(--tmu-border-embedded) 50%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .tmvu-scouts-inline-metric {
                display: flex;
                flex-direction: column;
                gap: var(--tmu-space-xs);
            }

            .tmvu-scouts-inline-main {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-sm);
                font-weight: 800;
            }

            .tmvu-scouts-inline-sub {
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-xs);
            }

            .tmvu-scouts-report-list {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: var(--tmu-space-lg);
            }

            .tmvu-scouts-report-entry-head {
                display: flex;
                justify-content: space-between;
                gap: var(--tmu-space-md);
                align-items: flex-start;
                padding: 0;
            }

            .tmvu-scouts-report-entry-title a {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-md);
                font-weight: 800;
                text-decoration: none;
            }

            .tmvu-scouts-report-entry-title a:hover {
                color: var(--tmu-text-strong);
                text-decoration: underline;
            }

            .tmvu-scouts-report-entry-copy {
                margin-top: var(--tmu-space-xs);
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-xs);
                line-height: 1.5;
            }

            .tmvu-scouts-fire {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 24px;
                padding: 0 var(--tmu-space-md);
                border-radius: 999px;
                border: 1px solid var(--tmu-border-danger);
                background: var(--tmu-danger-fill);
                color: var(--tmu-danger-strong);
                font-size: var(--tmu-font-xs);
                font-weight: 800;
                letter-spacing: .06em;
                text-transform: uppercase;
                text-decoration: none;
            }

            .tmvu-scouts-fire:hover {
                background: var(--tmu-border-danger);
                color: var(--tmu-text-inverse);
                text-decoration: none;
            }

            .tmvu-scouts-report-card .tmu-card {
                margin: 0;
            }

            @media (max-width: 1100px) {
                .tmvu-scouts-hero {
                    grid-template-columns: 1fr;
                }

                .tmvu-scouts-summary {
                    grid-template-columns: 1fr;
                }

                .tmvu-scouts-report-list {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
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
            container.innerHTML = TmUI.empty('No reports returned.');
            return;
        }

        const reportChipHtml = (label) => TmUI.chip({
            label: escapeHtml(label),
            tone: 'overlay',
            size: 'md',
            shape: 'full',
            uppercase: true,
        });

        container.innerHTML = `<div class="tmvu-scouts-report-list">${items.map(item => {
            if (!item.fullScoutData || !item.tooltipPlayer) {
                return `<div class="tmvu-scouts-report-entry tmu-stack tmu-stack-density-tight"><div class="tmvu-scouts-report-entry-head"><div><div class="tmvu-scouts-report-entry-title"><a href="${escapeHtml(item.playerHref)}">${escapeHtml(item.name)}</a></div><div class="tmvu-scouts-report-entry-copy">${escapeHtml(item.position)} • Age ${item.age || '-'}${item.currentAge ? ` • Now ${escapeHtml(item.currentAge)}` : ''}</div></div>${reportChipHtml('Loading')}</div>${TmUI.info('Best Estimate data is still loading for this player.', true)}</div>`;
            }
            return `<div class="tmvu-scouts-report-entry tmu-stack tmu-stack-density-tight"><div class="tmvu-scouts-report-entry-head"><div><div class="tmvu-scouts-report-entry-title"><a href="${escapeHtml(item.playerHref)}">${escapeHtml(item.name)}</a></div><div class="tmvu-scouts-report-entry-copy">${escapeHtml(item.position)} • Report ${escapeHtml(item.done || item.displayTime || '-')} • ${escapeHtml(item.scoutName || '-')}</div></div>${reportChipHtml(item.currentAge ? `Now ${item.currentAge}` : `Age ${item.age || '-'}`)}</div><div class="tmvu-scouts-report-card">${TmScoutReportCards.bestEstimateHtml({ scoutData: item.fullScoutData, player: item.tooltipPlayer }) || TmUI.info('Best Estimate data is unavailable for this report.', true)}</div></div>`;
        }).join('')}</div>`;
    };

    const bindActions = (scouts) => {
        const byId = Object.fromEntries(scouts.map(scout => [String(scout.id), scout]));
        mainColumn._tmvuScoutsById = byId;
        if (mainColumn.dataset.tmvuScoutsBound === '1') return;

        mainColumn.dataset.tmvuScoutsBound = '1';
        mainColumn.addEventListener('click', event => {
            const link = event.target.closest('.tmvu-scouts-fire');
            if (!link || !mainColumn.contains(link)) return;
            event.preventDefault();
            const scoutId = link.dataset.scoutId || '';
            const scoutName = link.dataset.scoutName || mainColumn._tmvuScoutsById?.[scoutId]?.fullName || 'Scout';
            if (typeof window.fire_scout_pop === 'function') {
                window.fire_scout_pop(scoutName, scoutId);
            }
        });
    };

    const renderPage = (scouts, reports) => {
        const summary = buildSummary(scouts, reports);

        main.innerHTML = '';
        main.classList.add('tmvu-scouts-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');
        TmSideMenu.mount(main, {
            id: 'tmvu-scouts-menu',
            className: 'tmu-page-sidebar-stack',
            items: parseMenu(),
            currentHref: '/scouts/',
        });

        mainColumn = document.createElement('div');
        mainColumn.className = 'tmvu-scouts-main tmu-page-section-stack';
        main.appendChild(mainColumn);

        const hero = document.createElement('section');
        hero.className = 'tmvu-scouts-hero';
        hero.innerHTML = `
            <div>
                <div class="tmvu-scouts-kicker">Scouting Desk</div>
                <div class="tmvu-scouts-title">Scout roster and live reports in one place.</div>
                <div class="tmvu-scouts-copy">Hired scouts stay visible with their full coverage spread, while the reports panel is refreshed from the live scouts reports endpoint instead of relying only on the server-rendered table.</div>
                <div class="tmvu-scouts-summary">
                    ${metricHtml({ label: 'Hired Scouts', value: String(summary.scoutCount), tone: 'overlay', size: 'lg', align: 'center' })}
                    ${metricHtml({ label: 'Reports Loaded', value: String(summary.reportCount), tone: 'overlay', size: 'lg', align: 'center' })}
                    ${metricHtml({ label: 'Avg Coverage', value: `${summary.avgCoverage}/20`, tone: 'overlay', size: 'lg', align: 'center' })}
                </div>
            </div>
            <div class="tmvu-scouts-meta-card tmu-stack tmu-stack-density-tight">
                ${metricHtml({ label: 'Best Ceiling', value: summary.topReport ? escapeHtml(summary.topReport.name) : 'No reports', note: summary.topReport ? `${summary.topReport.potentialStars.toFixed(1)}★ ceiling, ${summary.topReport.skill} → ${summary.topReport.skillPotential}, ${escapeHtml(summary.topReport.scoutName)}` : 'No live reports were returned from the endpoint.', tone: 'overlay', size: 'lg', cls: 'tmvu-scouts-top-report' })}
                ${TmUI.notice('Scout list is parsed from the native page so existing actions like Fire stay compatible. Reports are pulled live from /ajax/scouts_get_reports.ajax.php with a DOM fallback if the request fails.', { tone: 'warm' })}
            </div>
        `;
        mainColumn.appendChild(hero);

        const reportsHost = document.createElement('div');
        mainColumn.appendChild(reportsHost);
        const reportsRefs = TmSectionCard.mount(reportsHost, {
            title: 'Latest Reports',
            icon: '📋',
            cardVariant: 'soft',
            hostClass: 'tmvu-scouts-host',
            bodyClass: 'tmvu-scouts-card-body tmu-stack tmu-stack-density-regular',
            subtitle: 'Best Estimate cards for each latest report, shown three per row.',
        });
        if (reports.length) {
            reportsRefs.body.appendChild(TmUI.noticeElement('Each latest report is enriched with tooltip and scout data, then rendered in the same Best Estimate style used on the player page.', { variant: 'footnote' }));
            renderDetailedReports(reportsRefs.body, reports);
        } else {
            reportsRefs.body.innerHTML = TmUI.empty('No reports returned.');
        }

        const scoutsHost = document.createElement('div');
        mainColumn.appendChild(scoutsHost);
        const scoutsRefs = TmSectionCard.mount(scoutsHost, {
            title: 'Scouts',
            icon: '🕵️',
            cardVariant: 'soft',
            hostClass: 'tmvu-scouts-host',
            bodyClass: 'tmvu-scouts-card-body tmu-stack tmu-stack-density-regular',
            subtitle: 'Live roster from the page, same coverage columns used on the player scout tab.',
        });
        if (scouts.length) scoutsRefs.body.appendChild(buildScoutTable(scouts));
        else scoutsRefs.body.innerHTML = TmUI.empty('No scouts hired.');

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