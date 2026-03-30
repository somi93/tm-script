import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmTable } from '../components/shared/tm-table.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmUtils } from '../lib/tm-utils.js';

(function () {
    'use strict';

    if (!/^\/finances\/wages\/?$/i.test(window.location.pathname)) return;

    const main = document.querySelector('.tmvu-main, .main_center');
    if (!main) return;

    const sourceRoot = main.cloneNode(true);
    const STYLE_ID = 'tmvu-fin-wages-style';

    const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const metricHtml = (opts) => TmUI.metric(opts);
    const parseMoney = (value) => TmUtils.parseNum(cleanText(value));

    const formatMoney = (value) => Number(value || 0).toLocaleString('en-US');
    const iconForMenu = (label) => {
        if (/finance/i.test(label)) return '💰';
        if (/sponsor/i.test(label)) return '🤝';
        if (/maintenance/i.test(label)) return '🏗';
        if (/wages/i.test(label)) return '💸';
        if (/players/i.test(label)) return '👥';
        if (/scouts/i.test(label)) return '🧭';
        return '•';
    };

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-main.tmvu-fin-wages-page {
                display: grid !important;
                grid-template-columns: 184px minmax(0, 1fr) 340px;
                gap: 16px;
                align-items: start;
            }

            .tmvu-fin-wages-main,
            .tmvu-fin-wages-side {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .tmvu-fin-wages-tabs {
                margin-bottom: 8px;
            }

            .tmvu-fin-wages-table-wrap {
                border: 1px solid rgba(61,104,40,.2);
                border-radius: 10px;
                overflow: hidden;
                background: rgba(12,24,9,.28);
            }

            .tmvu-fin-wages-table {
                width: 100%;
                border-collapse: collapse;
            }

            .tmvu-fin-wages-table th,
            .tmvu-fin-wages-table td {
                padding: 10px 12px;
                border: 0;
                border-bottom: 1px solid rgba(61,104,40,.14);
                font-size: 12px;
                vertical-align: middle;
            }

            .tmvu-fin-wages-table thead th {
                background: rgba(128,224,72,.06);
                color: var(--tmu-text-panel-label);
                font-size: 10px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-fin-wages-table tbody tr:nth-child(even) {
                background: rgba(255,255,255,.025);
            }

            .tmvu-fin-wages-table td,
            .tmvu-fin-wages-table th.r {
                text-align: right;
                font-variant-numeric: tabular-nums;
            }

            .tmvu-fin-wages-table th.l,
            .tmvu-fin-wages-table td.l {
                text-align: left;
            }

            .tmvu-fin-wages-table td.c,
            .tmvu-fin-wages-table th.c {
                text-align: center;
            }

            .tmvu-fin-wages-table a {
                color: var(--tmu-text-strong);
                text-decoration: none;
            }

            .tmvu-fin-wages-table a:hover {
                text-decoration: underline;
            }

            .tmvu-fin-wages-table tr.tmvu-fin-wages-total {
                background: rgba(128,224,72,.08);
            }

            .tmvu-fin-wages-table tr.tmvu-fin-wages-total td {
                color: var(--tmu-text-inverse);
                font-weight: 800;
            }

            .tmvu-fin-wages-name {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                min-width: 0;
            }

            .tmvu-fin-wages-name .country_link {
                flex-shrink: 0;
            }

            .tmvu-fin-wages-note {
                color: var(--tmu-text-muted);
                font-size: 12px;
                line-height: 1.55;
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
            icon: iconForMenu(label),
            isSelected: node.classList.contains('selected'),
        }];
    });

    const extractPlayerId = (anchor) => {
        if (!anchor) return '';
        return cleanText(anchor.getAttribute('player_link')) || (cleanText(anchor.getAttribute('href')).match(/\/players\/(\d+)\//)?.[1] || '');
    };

    const parseWageRows = (table, kind) => {
        if (!table) return [];
        return Array.from(table.querySelectorAll('tr')).slice(1).map(row => {
            const cells = row.querySelectorAll('th, td');
            if (!cells.length) return null;

            if (cells.length >= 3 && /total/i.test(row.textContent || '')) {
                return {
                    kind,
                    isTotal: true,
                    label: 'Total',
                    weekly: parseMoney(cells[cells.length - 2]?.textContent || '0'),
                    season: parseMoney(cells[cells.length - 1]?.textContent || '0'),
                };
            }

            if (kind === 'players' && cells.length >= 5) {
                const nameCell = cells[1];
                const playerAnchor = nameCell.querySelector('a[player_link], a[href*="/players/"]');
                const countryAnchor = nameCell.querySelector('a.country_link[href*="/national-teams/"]');
                return {
                    kind,
                    isTotal: false,
                    order: cleanText(cells[0]?.textContent),
                    name: cleanText(playerAnchor?.textContent || nameCell.textContent),
                    nameHtml: `${playerAnchor?.outerHTML || escapeHtml(cleanText(nameCell.textContent))}${countryAnchor ? ` ${countryAnchor.outerHTML}` : ''}`,
                    playerId: extractPlayerId(playerAnchor),
                    age: cleanText(cells[2]?.textContent),
                    weekly: parseMoney(cells[3]?.textContent || '0'),
                    season: parseMoney(cells[4]?.textContent || '0'),
                };
            }

            if (kind === 'staff' && cells.length >= 5) {
                return {
                    kind,
                    isTotal: false,
                    role: cleanText(cells[0]?.textContent),
                    name: cleanText(cells[1]?.textContent),
                    age: cleanText(cells[2]?.textContent),
                    weekly: parseMoney(cells[3]?.textContent || '0'),
                    season: parseMoney(cells[4]?.textContent || '0'),
                };
            }

            return null;
        }).filter(Boolean);
    };

    const parseTabData = () => {
        const tabLabels = Array.from(sourceRoot.querySelectorAll('.column2_a .tabs [set_active]')).map(node => cleanText(node.textContent));
        const playerTable = sourceRoot.querySelector('#tab0 table');
        const staffTable = sourceRoot.querySelector('#tab1 table');

        return {
            players: {
                key: 'players',
                label: tabLabels[0] || 'Players',
                rows: parseWageRows(playerTable, 'players'),
            },
            staff: {
                key: 'staff',
                label: tabLabels[1] || 'Staff',
                rows: parseWageRows(staffTable, 'staff'),
            },
        };
    };

    const summarizeRows = (rows) => {
        const total = rows.find(row => row.isTotal) || { weekly: 0, season: 0 };
        const items = rows.filter(row => !row.isTotal);
        return {
            totalWeekly: total.weekly,
            totalSeason: total.season,
            headcount: items.length,
            avgWeekly: items.length ? Math.round(total.weekly / items.length) : 0,
            avgSeason: items.length ? Math.round(total.season / items.length) : 0,
        };
    };

    const getPeriodLabel = (period) => period === 'season' ? 'Season' : 'Week';
    const getPeriodValue = (row, period) => period === 'season' ? row.season : row.weekly;
    const getSummaryTotal = (summary, period) => period === 'season' ? summary.totalSeason : summary.totalWeekly;
    const getSummaryAverage = (summary, period) => period === 'season' ? summary.avgSeason : summary.avgWeekly;

    const renderHero = (playersSummary, staffSummary, payPeriod) => {
        const wrap = document.createElement('section');
        const periodLabel = getPeriodLabel(payPeriod);
        const playersValue = getSummaryTotal(playersSummary, payPeriod);
        const staffValue = getSummaryTotal(staffSummary, payPeriod);
        TmHeroCard.mount(wrap, {
            cardClass: 'tmvu-fin-wages-hero-card',
            slots: {
                kicker: 'Finances',
                title: 'Wages',
                main: `
                    <div class="tmvu-fin-wages-note">Switch between per-week and per-season payroll without leaving the wages page.</div>
                `,
                footer: `
                    <div class="tmvu-fin-hero-metrics">
                        ${metricHtml({ label: `Players / ${periodLabel}`, value: escapeHtml(formatMoney(playersValue)), tone: 'overlay', size: 'md' })}
                        ${metricHtml({ label: `Staff / ${periodLabel}`, value: escapeHtml(formatMoney(staffValue)), tone: 'overlay', size: 'md' })}
                        ${metricHtml({ label: `Total / ${periodLabel}`, value: escapeHtml(formatMoney(playersValue + staffValue)), tone: 'overlay', size: 'lg' })}
                    </div>
                `,
            },
        });
        return wrap.firstElementChild || wrap;
    };

    const renderTable = (rows, kind, payPeriod) => {
        const items = rows || [];
        const periodLabel = getPeriodLabel(payPeriod);
        const bodyRows = items.filter(row => !row.isTotal);
        const totalRow = items.find(row => row.isTotal) || null;
        const table = TmTable.table({
            cls: ' tmvu-fin-wages-table',
            items: bodyRows,
            headers: [
                { key: 'index', label: '#', align: 'c', sortable: false, render: (_value, row) => escapeHtml(kind === 'players' ? row.order : row.role || '') },
                {
                    key: 'name',
                    label: kind === 'players' ? 'Name' : 'Name / Role',
                    align: 'l',
                    sortable: false,
                    render: (_value, row) => kind === 'players' ? `<span class="tmvu-fin-wages-name">${row.nameHtml}</span>` : escapeHtml(row.name),
                },
                { key: 'age', label: 'Age', align: 'c', sortable: false, render: (value) => escapeHtml(value || '-') },
                { key: 'periodWage', label: `Wage / ${periodLabel}`, align: 'r', sortable: false, render: (_value, row) => escapeHtml(formatMoney(getPeriodValue(row, payPeriod))) },
            ],
            renderRowsHtml: (renderItems) => {
                let html = renderItems.map(row => `
                    <tr>
                        <td class="c">${escapeHtml(kind === 'players' ? row.order : row.role || '')}</td>
                        <td class="l">${kind === 'players' ? `<span class="tmvu-fin-wages-name">${row.nameHtml}</span>` : escapeHtml(row.name)}</td>
                        <td class="c">${escapeHtml(row.age || '-')}</td>
                        <td>${escapeHtml(formatMoney(getPeriodValue(row, payPeriod)))}</td>
                    </tr>
                `).join('');
                if (totalRow) {
                    html += `
                        <tr class="tmvu-fin-wages-total">
                            <td class="l" colspan="3">Total</td>
                            <td>${escapeHtml(formatMoney(getPeriodValue(totalRow, payPeriod)))}</td>
                        </tr>
                    `;
                }
                return html;
            },
        });

        return `
            <div class="tmvu-fin-wages-table-wrap">
                ${table.outerHTML}
            </div>
        `;
    };

    const renderTableCard = (tabsData, state, onChange) => {
        const wrap = document.createElement('section');
        const refs = TmUI.render(wrap, `
            <tm-card data-title="Wage Ledger" data-icon="💸">
                <div data-ref="tabs"></div>
                <div data-ref="period"></div>
                <div data-ref="panel"></div>
            </tm-card>
        `);

        const renderActive = () => {
            refs.panel.innerHTML = renderTable(tabsData[state.active].rows, state.active, state.payPeriod);
        };

        const tabBar = TmUI.tabs({
            items: [
                { key: 'players', label: tabsData.players.label },
                { key: 'staff', label: tabsData.staff.label },
            ],
            active: state.active,
            onChange: (key) => {
                state.active = key;
                onChange();
            },
        });
        tabBar.classList.add('tmvu-fin-wages-tabs');
        refs.tabs.appendChild(tabBar);

        const periodBar = TmUI.tabs({
            items: [
                { key: 'weekly', label: 'Per Week' },
                { key: 'season', label: 'Per Season' },
            ],
            active: state.payPeriod,
            onChange: (key) => {
                state.payPeriod = key;
                onChange();
            },
        });
        periodBar.classList.add('tmvu-fin-wages-tabs');
        refs.period.appendChild(periodBar);

        renderActive();
        return wrap.firstElementChild || wrap;
    };

    const renderSummaryCard = (title, icon, summary, payPeriod) => {
        const wrap = document.createElement('section');
        const periodLabel = getPeriodLabel(payPeriod);
        TmUI.render(wrap, `
            <tm-card data-title="${escapeHtml(title)}" data-icon="${escapeHtml(icon)}">
                <div class="tmvu-fin-highlights">
                    ${metricHtml({ label: 'Headcount', value: escapeHtml(String(summary.headcount)), layout: 'row', tone: 'muted', size: 'sm' })}
                    ${metricHtml({ label: `${periodLabel} Total`, value: escapeHtml(formatMoney(getSummaryTotal(summary, payPeriod))), layout: 'row', tone: 'muted', size: 'sm' })}
                    ${metricHtml({ label: `Avg / ${periodLabel}`, value: escapeHtml(formatMoney(getSummaryAverage(summary, payPeriod))), layout: 'row', tone: 'muted', size: 'sm' })}
                </div>
            </tm-card>
        `);
        return wrap.firstElementChild || wrap;
    };

    const render = () => {
        injectStyles();

        const tabsData = parseTabData();
        if (!tabsData.players.rows.length && !tabsData.staff.rows.length) return;

        const playersSummary = summarizeRows(tabsData.players.rows);
        const staffSummary = summarizeRows(tabsData.staff.rows);

        main.classList.add('tmvu-fin-wages-page');
        main.innerHTML = '';

        TmSideMenu.mount(main, {
            id: 'tmvu-fin-wages-side-menu',
            items: parseMenu(),
            currentHref: '/finances/wages/',
        });

        const mainCol = document.createElement('div');
        mainCol.className = 'tmvu-fin-wages-main';

        const sideCol = document.createElement('aside');
        sideCol.className = 'tmvu-fin-wages-side';

        const state = {
            active: 'players',
            payPeriod: 'weekly',
        };

        const paint = () => {
            mainCol.innerHTML = '';
            sideCol.innerHTML = '';

            mainCol.appendChild(renderHero(playersSummary, staffSummary, state.payPeriod));
            mainCol.appendChild(renderTableCard(tabsData, state, paint));

            sideCol.appendChild(renderSummaryCard('Players Payroll', '👥', playersSummary, state.payPeriod));
            sideCol.appendChild(renderSummaryCard('Staff Payroll', '🧭', staffSummary, state.payPeriod));
        };

        paint();

        main.appendChild(mainCol);
        main.appendChild(sideCol);
    };

    render();
})();