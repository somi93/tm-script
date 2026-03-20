import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmUtils } from '../lib/tm-utils.js';

(function () {
    'use strict';

    if (!/^\/finances\/?$/i.test(window.location.pathname)) return;

    const main = document.querySelector('.tmvu-main, .main_center');
    if (!main) return;

    const sourceRoot = main.cloneNode(true);
    const STYLE_ID = 'tmvu-finances-style';

    const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const parseMoney = (value) => TmUtils.parseNum(cleanText(value));
    const hasValue = (value) => value !== null && value !== undefined && value !== '';

    const formatMoney = (value) => {
        const amount = Number(value || 0);
        const abs = Math.abs(amount).toLocaleString('en-US');
        return amount < 0 ? `-${abs}` : abs;
    };

    const formatSignedMoney = (value) => {
        const amount = Number(value || 0);
        if (!amount) return '0';
        const prefix = amount > 0 ? '+' : '-';
        return `${prefix}${Math.abs(amount).toLocaleString('en-US')}`;
    };

    const deltaClass = (value) => value > 0 ? 'green' : value < 0 ? 'red' : 'muted';
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
            .tmvu-main.tmvu-fin-page {
                display: grid !important;
                grid-template-columns: 184px minmax(0, 1fr) 340px;
                gap: 16px;
                align-items: start;
            }

            .tmvu-fin-main,
            .tmvu-fin-side {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .tmvu-fin-chip-row {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .tmvu-fin-chip {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                min-height: 30px;
                padding: 0 11px;
                border-radius: 999px;
                background: rgba(42,74,28,.32);
                border: 1px solid rgba(61,104,40,.3);
                color: #cfe6bb;
                font-size: 11px;
                font-weight: 700;
            }

            .tmvu-fin-chip strong {
                color: #fff;
                font-weight: 800;
            }

            .tmvu-fin-stat-grid {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 10px;
            }

            .tmvu-fin-stat-card {
                min-width: 0;
                padding: 12px 14px;
                border-radius: 10px;
                background: rgba(12,24,9,.35);
                border: 1px solid rgba(61,104,40,.18);
            }

            .tmvu-fin-stat-label {
                color: #7fa669;
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: .08em;
            }

            .tmvu-fin-stat-value {
                margin-top: 6px;
                color: #eef8e8;
                font-size: 16px;
                font-weight: 800;
                line-height: 1.3;
                word-break: break-word;
            }

            .tmvu-fin-stat-note {
                margin-top: 4px;
                color: #8aac72;
                font-size: 11px;
                line-height: 1.4;
            }

            .tmvu-fin-tabs {
                margin-bottom: 6px;
            }

            .tmvu-fin-table-wrap {
                border: 1px solid rgba(61,104,40,.2);
                border-radius: 10px;
                overflow: hidden;
                background: rgba(12,24,9,.28);
            }

            .tmvu-fin-table {
                width: 100%;
                border-collapse: collapse;
            }

            .tmvu-fin-table th,
            .tmvu-fin-table td {
                padding: 10px 12px;
                border: 0;
                border-bottom: 1px solid rgba(61,104,40,.14);
                font-size: 12px;
            }

            .tmvu-fin-table thead th {
                background: rgba(128,224,72,.06);
                color: #8fb77b;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
                text-align: right;
            }

            .tmvu-fin-table thead th:first-child,
            .tmvu-fin-table tbody th {
                text-align: left;
            }

            .tmvu-fin-table tbody tr:nth-child(even) {
                background: rgba(255,255,255,.025);
            }

            .tmvu-fin-table tbody th {
                color: #deefd2;
                font-weight: 700;
            }

            .tmvu-fin-table tbody td {
                color: #eef8e8;
                text-align: right;
                font-variant-numeric: tabular-nums;
            }

            .tmvu-fin-table tbody tr.tmvu-fin-total {
                background: rgba(128,224,72,.08);
            }

            .tmvu-fin-table tbody tr.tmvu-fin-total th,
            .tmvu-fin-table tbody tr.tmvu-fin-total td {
                color: #fff;
                font-weight: 800;
            }

            .tmvu-fin-label {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                min-width: 0;
            }

            .tmvu-fin-label-dot {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: rgba(128,224,72,.75);
                box-shadow: 0 0 0 4px rgba(128,224,72,.08);
                flex-shrink: 0;
            }

            .tmvu-fin-delta {
                font-weight: 800;
            }

            .tmvu-fin-highlights {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .tmvu-fin-highlight {
                padding: 10px 12px;
                border-radius: 10px;
                background: rgba(12,24,9,.34);
                border: 1px solid rgba(61,104,40,.16);
            }

            .tmvu-fin-highlight-kicker {
                color: #7fa669;
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: .08em;
            }

            .tmvu-fin-highlight-title {
                margin-top: 4px;
                color: #eef8e8;
                font-size: 14px;
                font-weight: 800;
                line-height: 1.4;
            }

            .tmvu-fin-highlight-note {
                margin-top: 4px;
                color: #8aac72;
                font-size: 11px;
                line-height: 1.5;
            }

            .tmvu-fin-balance {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .tmvu-fin-balance-row {
                display: flex;
                align-items: baseline;
                justify-content: space-between;
                gap: 10px;
            }

            .tmvu-fin-balance-label {
                color: #8aac72;
                font-size: 11px;
                font-weight: 700;
            }

            .tmvu-fin-balance-value {
                color: #eef8e8;
                font-size: 18px;
                font-weight: 900;
                text-align: right;
                font-variant-numeric: tabular-nums;
            }

            .tmvu-fin-balance-value.small {
                font-size: 14px;
            }

            .tmvu-fin-footnote {
                color: #789565;
                font-size: 11px;
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

    const parseStatement = (table) => {
        if (!table) return null;

        const rows = Array.from(table.querySelectorAll('tr')).slice(1).map(row => {
            const cells = row.querySelectorAll('th, td');
            if (cells.length < 3) return null;
            const labelCell = cells[0];
            const label = cleanText(labelCell.textContent);
            const tooltip = labelCell.querySelector('[tooltip]')?.getAttribute('tooltip') || '';
            const current = parseMoney(cells[1]?.textContent || '0');
            const previous = parseMoney(cells[2]?.textContent || '0');
            return {
                label,
                tooltip,
                current,
                previous,
                delta: current - previous,
                isTotal: /\btotal\b/i.test(label) || row.classList.contains('bold'),
            };
        }).filter(Boolean);

        const headerCells = table.querySelectorAll('tr:first-child th');
        return {
            columns: [
                cleanText(headerCells[0]?.textContent || ''),
                cleanText(headerCells[1]?.textContent || 'Current'),
                cleanText(headerCells[2]?.textContent || 'Previous'),
            ],
            rows,
            total: rows.find(row => row.isTotal) || null,
        };
    };

    const parseOverview = () => {
        const title = cleanText(sourceRoot.querySelector('.column2_a .box_head h2')?.textContent || 'Finances');
        const balanceText = sourceRoot.querySelector('.column2_a .very_large .coin_big')?.textContent || '0';
        const pendingText = Array.from(sourceRoot.querySelectorAll('.column2_a .align_center'))
            .find(node => /pending transfers/i.test(node.textContent || ''))
            ?.querySelector('.coin')?.textContent || '';

        return {
            title,
            balance: parseMoney(balanceText),
            pending: pendingText ? parseMoney(pendingText) : null,
            week: parseStatement(sourceRoot.querySelector('#finances')),
            season: parseStatement(sourceRoot.querySelector('#finances_year')),
        };
    };

    const summarizeStatement = (statement) => {
        if (!statement) return null;
        const items = statement.rows.filter(row => !row.isTotal);
        const positive = items.filter(row => row.current > 0);
        const negative = items.filter(row => row.current < 0);
        const bestIncome = positive.slice().sort((left, right) => right.current - left.current)[0] || null;
        const biggestCost = negative.slice().sort((left, right) => left.current - right.current)[0] || null;

        return {
            total: statement.total,
            bestIncome,
            biggestCost,
            positiveCount: positive.length,
            negativeCount: negative.length,
        };
    };

    const buildStatCardsHtml = (overview) => {
        const week = summarizeStatement(overview.week);
        const season = summarizeStatement(overview.season);
        const weekTotal = week?.total?.current ?? 0;
        const seasonTotal = season?.total?.current ?? 0;
        const pending = overview.pending ?? 0;

        return `
            <div class="tmvu-fin-stat-grid">
                <div class="tmvu-fin-stat-card">
                    <div class="tmvu-fin-stat-label">Weekly Net</div>
                    <div class="tmvu-fin-stat-value ${deltaClass(weekTotal)}">${escapeHtml(formatSignedMoney(weekTotal))}</div>
                    <div class="tmvu-fin-stat-note">Compared with ${escapeHtml(formatMoney(week?.total?.previous ?? 0))} last week.</div>
                </div>
                <div class="tmvu-fin-stat-card">
                    <div class="tmvu-fin-stat-label">Season Net</div>
                    <div class="tmvu-fin-stat-value ${deltaClass(seasonTotal)}">${escapeHtml(formatSignedMoney(seasonTotal))}</div>
                    <div class="tmvu-fin-stat-note">Compared with ${escapeHtml(formatMoney(season?.total?.previous ?? 0))} last season.</div>
                </div>
                <div class="tmvu-fin-stat-card">
                    <div class="tmvu-fin-stat-label">Pending Transfers</div>
                    <div class="tmvu-fin-stat-value ${deltaClass(pending)}">${escapeHtml(formatMoney(pending))}</div>
                    <div class="tmvu-fin-stat-note">Queued movements that have not hit the balance yet.</div>
                </div>
            </div>
        `;
    };

    const renderHeroCard = (overview) => {
        const wrap = document.createElement('section');
        TmHeroCard.mount(wrap, {
            cardClass: 'tmvu-fin-hero-card',
            slots: {
                kicker: 'Finances',
                title: escapeHtml(overview.title),
                main: `
                    <div class="tmvu-fin-chip-row">
                        <span class="tmvu-fin-chip">Current Balance <strong>${escapeHtml(formatMoney(overview.balance))}</strong></span>
                        ${hasValue(overview.pending) ? `<span class="tmvu-fin-chip">Pending Transfers <strong>${escapeHtml(formatMoney(overview.pending))}</strong></span>` : ''}
                    </div>
                `,
                footer: buildStatCardsHtml(overview),
            },
        });
        return wrap.firstElementChild || wrap;
    };

    const renderStatementTable = (statement) => {
        if (!statement) return '<div class="tmvu-fin-footnote">No financial statement data available.</div>';

        return `
            <div class="tmvu-fin-table-wrap">
                <table class="tmvu-fin-table">
                    <thead>
                        <tr>
                            <th>${escapeHtml(statement.columns[0] || '')}</th>
                            <th>${escapeHtml(statement.columns[1] || 'Current')}</th>
                            <th>${escapeHtml(statement.columns[2] || 'Previous')}</th>
                            <th>Delta</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${statement.rows.map(row => `
                            <tr class="${row.isTotal ? 'tmvu-fin-total' : ''}">
                                <th>
                                    <span class="tmvu-fin-label"${row.tooltip ? ` title="${escapeHtml(row.tooltip)}"` : ''}>
                                        <span class="tmvu-fin-label-dot"></span>
                                        <span>${escapeHtml(row.label)}</span>
                                    </span>
                                </th>
                                <td>${escapeHtml(formatMoney(row.current))}</td>
                                <td>${escapeHtml(formatMoney(row.previous))}</td>
                                <td><span class="tmvu-fin-delta ${deltaClass(row.delta)}">${escapeHtml(formatSignedMoney(row.delta))}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    const renderTableCard = (overview) => {
        const wrap = document.createElement('section');
        const refs = TmUI.render(wrap, `
            <tm-card data-title="Cashflow" data-icon="📑">
                <div data-ref="tabs"></div>
                <div data-ref="panel"></div>
            </tm-card>
        `);

        const state = { active: 'week' };
        const tabBar = TmUI.tabs({
            items: [
                { key: 'week', label: 'Week' },
                { key: 'season', label: 'Season' },
            ],
            active: state.active,
            onChange: (key) => {
                state.active = key;
                refs.panel.innerHTML = renderStatementTable(key === 'week' ? overview.week : overview.season);
            },
        });
        tabBar.classList.add('tmvu-fin-tabs');
        refs.tabs.appendChild(tabBar);
        refs.panel.innerHTML = renderStatementTable(overview.week);
        return wrap.firstElementChild || wrap;
    };

    const renderHighlightsCard = (title, summary, previousLabel) => {
        const wrap = document.createElement('section');
        TmUI.render(wrap, `
            <tm-card data-title="${escapeHtml(title)}" data-icon="📈">
                <div class="tmvu-fin-highlights">
                    <div class="tmvu-fin-highlight">
                        <div class="tmvu-fin-highlight-kicker">Net Result</div>
                        <div class="tmvu-fin-highlight-title ${deltaClass(summary?.total?.current ?? 0)}">${escapeHtml(formatSignedMoney(summary?.total?.current ?? 0))}</div>
                        <div class="tmvu-fin-highlight-note">Reference ${escapeHtml(previousLabel)}: ${escapeHtml(formatMoney(summary?.total?.previous ?? 0))}</div>
                    </div>
                    <div class="tmvu-fin-highlight">
                        <div class="tmvu-fin-highlight-kicker">Largest Income</div>
                        <div class="tmvu-fin-highlight-title">${escapeHtml(summary?.bestIncome?.label || 'None')}</div>
                        <div class="tmvu-fin-highlight-note">${escapeHtml(formatMoney(summary?.bestIncome?.current ?? 0))}</div>
                    </div>
                    <div class="tmvu-fin-highlight">
                        <div class="tmvu-fin-highlight-kicker">Heaviest Cost</div>
                        <div class="tmvu-fin-highlight-title">${escapeHtml(summary?.biggestCost?.label || 'None')}</div>
                        <div class="tmvu-fin-highlight-note">${escapeHtml(formatMoney(summary?.biggestCost?.current ?? 0))}</div>
                    </div>
                </div>
            </tm-card>
        `);
        return wrap.firstElementChild || wrap;
    };

    const renderBalanceCard = (overview) => {
        const wrap = document.createElement('section');
        TmUI.render(wrap, `
            <tm-card data-title="Cash Position" data-icon="🏦">
                <div class="tmvu-fin-balance">
                    <div class="tmvu-fin-balance-row">
                        <span class="tmvu-fin-balance-label">Current Balance</span>
                        <span class="tmvu-fin-balance-value">${escapeHtml(formatMoney(overview.balance))}</span>
                    </div>
                    ${hasValue(overview.pending) ? `
                        <div class="tmvu-fin-balance-row">
                            <span class="tmvu-fin-balance-label">Pending Transfers</span>
                            <span class="tmvu-fin-balance-value small ${deltaClass(overview.pending)}">${escapeHtml(formatMoney(overview.pending))}</span>
                        </div>
                    ` : ''}
                </div>
            </tm-card>
        `);
        return wrap.firstElementChild || wrap;
    };

    const render = () => {
        injectStyles();

        const overview = parseOverview();
        if (!overview.week && !overview.season) return;

        main.classList.add('tmvu-fin-page');
        main.innerHTML = '';

        TmSideMenu.mount(main, {
            id: 'tmvu-fin-side-menu',
            items: parseMenu(),
            currentHref: '/finances/',
        });

        const mainCol = document.createElement('div');
        mainCol.className = 'tmvu-fin-main';

        const sideCol = document.createElement('aside');
        sideCol.className = 'tmvu-fin-side';

        const weekSummary = summarizeStatement(overview.week);
        const seasonSummary = summarizeStatement(overview.season);

        mainCol.appendChild(renderHeroCard(overview));
        mainCol.appendChild(renderTableCard(overview));

        sideCol.appendChild(renderBalanceCard(overview));
        sideCol.appendChild(renderHighlightsCard('Week Snapshot', weekSummary, overview.week?.columns?.[2] || 'last week'));
        sideCol.appendChild(renderHighlightsCard('Season Snapshot', seasonSummary, overview.season?.columns?.[2] || 'last season'));

        main.appendChild(mainCol);
        main.appendChild(sideCol);
    };

    render();
})();