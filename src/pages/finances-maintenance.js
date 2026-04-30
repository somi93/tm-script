import { TmPageHero } from '../components/shared/tm-page-hero.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmTable } from '../components/shared/tm-table.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmUtils } from '../lib/tm-utils.js';

'use strict';

const STYLE_ID = 'tmvu-fin-maintenance-style';

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
const FACILITY_MAX_LEVELS = {
    'fast food place': 10,
    'medical center': 2,
    'merchandise stand': 10,
    'merchandise store': 10,
    parking: 10,
    physio: 10,
    restaurant: 10,
    'sausage stand': 10,
    toilets: 10,
    'youth academy': 10,
    'training grounds': 10,
    floodlights: 2,
    'pitch cover': 1,
    'pitch draining': 1,
    sprinklers: 1,
    heating: 1,
};

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
    injectTmPageLayoutStyles();

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
            .tmvu-fin-maint-main,
            .tmvu-fin-maint-side {
                min-width: 0;
            }

            .tmvu-fin-maint-period-btns {
                display: flex;
                gap: var(--tmu-space-sm);
                margin-bottom: var(--tmu-space-sm);
            }

            .tmvu-fin-maint-section-head {
                background: var(--tmu-card-head-bg);
            }

            .tmvu-fin-maint-section-head th {
                padding: var(--tmu-space-sm) var(--tmu-space-md);
                font-size: var(--tmu-font-xs);
                font-weight: 800;
                letter-spacing: .1em;
                text-transform: uppercase;
                color: var(--tmu-text-panel-label);
                text-align: left !important;
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
            }

            .tmvu-fin-maint-table-wrap {
                border: 1px solid var(--tmu-border-soft-alpha);
                border-radius: var(--tmu-space-md);
                overflow: hidden;
                background: var(--tmu-card-bg);
            }

            .tmvu-fin-maint-table {
                width: 100%;
                border-collapse: collapse;
            }

            .tmvu-fin-maint-table th,
            .tmvu-fin-maint-table td {
                padding: var(--tmu-space-md) var(--tmu-space-md);
                border: 0;
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
                font-size: var(--tmu-font-sm);
                vertical-align: middle;
            }

            .tmvu-fin-maint-table thead th {
                background: rgba(255,255,255,.04);
                color: var(--tmu-text-panel-label);
                font-size: var(--tmu-font-xs);
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-fin-maint-table tbody tr {
                background: #2d4315;
            }

            .tmvu-fin-maint-table tbody tr:nth-child(even) {
                background: #35501a;
            }

            .tmvu-fin-maint-table td,
            .tmvu-fin-maint-table th.r {
                text-align: right;
                font-variant-numeric: tabular-nums;
            }

            .tmvu-fin-maint-table th.l,
            .tmvu-fin-maint-table td.l {
                text-align: left;
            }

            .tmvu-fin-maint-table th.c,
            .tmvu-fin-maint-table td.c {
                text-align: center;
            }

            .tmvu-fin-maint-table a {
                color: var(--tmu-text-strong);
                text-decoration: none;
            }

            .tmvu-fin-maint-table a:hover {
                text-decoration: underline;
            }

            .tmvu-fin-maint-table tr.tmvu-fin-maint-total {
                background: #41631f;
            }

            .tmvu-fin-maint-table tr.tmvu-fin-maint-total td,
            .tmvu-fin-maint-table tr.tmvu-fin-maint-total th {
                color: var(--tmu-text-inverse);
                font-weight: 800;
            }

        `;

    document.head.appendChild(style);
};

const parseMenu = (sourceRoot) => Array.from(sourceRoot.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
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

const getPeriodLabel = (period) => period === 'season' ? 'Season' : 'Week';
const getPeriodValue = (row, period) => period === 'season' ? row.season : row.weekly;
const getLevelNumber = (value) => {
    const match = String(value || '').match(/\d+/);
    return match ? Number(match[0]) : 0;
};
const normalizeFacilityName = (value) => cleanText(value).toLowerCase();
const getFacilityMaxLevel = (name) => FACILITY_MAX_LEVELS[normalizeFacilityName(name)] || 10;

const parseRows = (table, type) => {
    if (!table) return [];
    return Array.from(table.querySelectorAll('tr')).slice(1).map(row => {
        const cells = row.querySelectorAll('th, td');
        if (!cells.length) return null;

        if (type === 'stadium' && cells.length >= 4) {
            return {
                type,
                name: cleanText(cells[0]?.textContent),
                capacity: cleanText(cells[1]?.textContent),
                weekly: parseMoney(cells[2]?.textContent || '0'),
                season: parseMoney(cells[3]?.textContent || '0'),
            };
        }

        if (type === 'maintenance' && cells.length >= 4) {
            const nameCell = cells[0];
            const link = nameCell.querySelector('a[href]');
            return {
                type,
                name: cleanText(nameCell.textContent),
                nameHtml: link ? link.outerHTML : escapeHtml(cleanText(nameCell.textContent)),
                level: cleanText(cells[1]?.textContent),
                weekly: parseMoney(cells[2]?.textContent || '0'),
                season: parseMoney(cells[3]?.textContent || '0'),
            };
        }

        if (type === 'totals' && cells.length >= 3) {
            return {
                type,
                name: cleanText(cells[0]?.textContent),
                weekly: parseMoney(cells[cells.length - 2]?.textContent || '0'),
                season: parseMoney(cells[cells.length - 1]?.textContent || '0'),
            };
        }

        return null;
    }).filter(Boolean);
};

const parseData = (sourceRoot) => {
    const boxes = Array.from(sourceRoot.querySelectorAll('#tab0 > h3'));
    const sections = {};

    boxes.forEach(h3 => {
        const title = cleanText(h3.textContent).toLowerCase();
        let next = h3.nextElementSibling;
        while (next && next.tagName !== 'DIV') next = next.nextElementSibling;
        const table = next?.querySelector('table');
        if (!table) return;
        if (title === 'stadium') sections.stadium = parseRows(table, 'stadium');
        else if (title === 'maintenance') sections.maintenance = parseRows(table, 'maintenance');
        else if (title === 'total') sections.totals = parseRows(table, 'totals');
    });

    return {
        title: cleanText(sourceRoot.querySelector('.column2_a .box_head h2')?.textContent || 'Finances'),
        stadium: sections.stadium || [],
        maintenance: sections.maintenance || [],
        totals: sections.totals || [],
    };
};

const summarize = (data) => {
    const totalRow = data.totals.find(row => /^total$/i.test(row.name)) || { weekly: 0, season: 0 };
    const stadiumTotal = data.totals.find(row => /stadium/i.test(row.name)) || data.stadium[0] || { weekly: 0, season: 0 };
    const maintenanceTotal = data.totals.find(row => /maintenance/i.test(row.name)) || { weekly: 0, season: 0 };
    const highestLine = data.maintenance.slice().sort((a, b) => b.weekly - a.weekly)[0] || null;
    const builtLevels = data.maintenance.reduce((sum, row) => sum + getLevelNumber(row.level), 0);
    const maxLevels = data.maintenance.reduce((sum, row) => sum + getFacilityMaxLevel(row.name), 0);
    const builtPercent = maxLevels ? Math.round((builtLevels / maxLevels) * 100) : 0;
    return { totalRow, stadiumTotal, maintenanceTotal, highestLine, builtLevels, maxLevels, builtPercent };
};

const renderHero = (summary, payPeriod) => {
    const wrap = document.createElement('section');
    const periodLabel = getPeriodLabel(payPeriod);
    TmPageHero.mount(wrap, {
        slots: {
            kicker: 'Finances',
            title: 'Maintenance',
            footer: `
                    <div class="tmvu-fin-maint-hero-metrics tmu-page-card-grid tmu-card-grid-density-compact">
                        ${metricHtml({ label: `Stadium / ${periodLabel}`, value: escapeHtml(formatMoney(getPeriodValue(summary.stadiumTotal, payPeriod))), tone: 'overlay', size: 'md' })}
                        ${metricHtml({ label: `Facilities / ${periodLabel}`, value: escapeHtml(formatMoney(getPeriodValue(summary.maintenanceTotal, payPeriod))), tone: 'overlay', size: 'md' })}
                        ${metricHtml({ label: `Total / ${periodLabel}`, value: escapeHtml(formatMoney(getPeriodValue(summary.totalRow, payPeriod))), tone: 'overlay', size: 'lg' })}
                    </div>
                `,
        },
    });
    return wrap.firstElementChild || wrap;
};

const renderCombinedTable = (data, payPeriod) => {
    const periodLabel = getPeriodLabel(payPeriod);
    const totalRow = data.totals.find(row => /^total$/i.test(row.name)) || null;

    const stadiumRowsHtml = data.stadium.map(row => `
            <tr>
                <td class="l">${escapeHtml(row.name)}</td>
                <td class="c">${escapeHtml(row.capacity)}</td>
                <td>${escapeHtml(formatMoney(getPeriodValue(row, payPeriod)))}</td>
            </tr>
        `).join('');

    const maintRowsHtml = data.maintenance.map(row => `
            <tr>
                <td class="l">${row.nameHtml}</td>
                <td class="c">${escapeHtml(row.level)}</td>
                <td>${escapeHtml(formatMoney(getPeriodValue(row, payPeriod)))}</td>
            </tr>
        `).join('');

    const totalHtml = totalRow ? `
            <tr class="tmvu-fin-maint-total">
                <th class="l" colspan="2">Total</th>
                <td>${escapeHtml(formatMoney(getPeriodValue(totalRow, payPeriod)))}</td>
            </tr>
        ` : '';

    const wrap = document.createElement('div');
    wrap.className = 'tmvu-fin-maint-table-wrap';
    wrap.innerHTML = `
            <table class="tmvu-fin-maint-table">
                <thead>
                    <tr>
                        <th class="l">Name</th>
                        <th class="c">Capacity / Level</th>
                        <th>Cost / ${escapeHtml(periodLabel)}</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.stadium.length ? `
                        <tr class="tmvu-fin-maint-section-head"><th colspan="3">🏟 Stadium</th></tr>
                        ${stadiumRowsHtml}
                    ` : ''}
                    ${data.maintenance.length ? `
                        <tr class="tmvu-fin-maint-section-head"><th colspan="3">🏗 Maintenance</th></tr>
                        ${maintRowsHtml}
                    ` : ''}
                    ${totalHtml}
                </tbody>
            </table>
        `;
    return wrap;
};

const renderContent = (data, state, onChange) => {
    const wrap = document.createElement('div');

    const periodBtns = document.createElement('div');
    periodBtns.className = 'tmvu-fin-maint-period-btns';
    ['weekly', 'season'].forEach((key) => {
        const btn = TmUI.button({
            label: key === 'weekly' ? 'Per Week' : 'Per Season',
            color: 'primary',
            size: 'sm',
            active: state.payPeriod === key,
            onClick: () => { state.payPeriod = key; onChange(); },
        });
        periodBtns.appendChild(btn);
    });
    wrap.appendChild(periodBtns);
    wrap.appendChild(renderCombinedTable(data, state.payPeriod));
    return wrap;
};

const render = (main, sourceRoot) => {
    injectStyles();

    const data = parseData(sourceRoot);
    if (!data.stadium.length && !data.maintenance.length && !data.totals.length) return;

    const summary = summarize(data);
    const state = { payPeriod: 'weekly' };

    main.classList.add('tmvu-fin-maint-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');
    main.innerHTML = '';

    TmSideMenu.mount(main, {
        className: 'tmu-page-sidebar-stack',
        id: 'tmvu-fin-maint-side-menu',
        items: parseMenu(sourceRoot),
        currentHref: '/finances/maintenance/',
    });

    const mainCol = document.createElement('div');
    mainCol.className = 'tmvu-fin-maint-main tmu-page-section-stack';

    const paint = () => {
        mainCol.innerHTML = '';
        mainCol.appendChild(renderHero(summary, state.payPeriod));
        mainCol.appendChild(renderContent(data, state, paint));
    };

    paint();

    main.appendChild(mainCol);
};

export function initFinancesMaintenancePage(main) {
    const sourceRoot = document.querySelector('.main_center');
    if (!main || !sourceRoot) return;
    if (!sourceRoot.querySelector('.column1 .content_menu, #tab0 table')) return;
    render(main, sourceRoot);
}