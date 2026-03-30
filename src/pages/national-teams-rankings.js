import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmUI } from '../components/shared/tm-ui.js';

(function () {
    'use strict';

    if (!/^\/national-teams\/rankings\/(?:[^/]+\/)?$/i.test(window.location.pathname)) return;

    const main = document.querySelector('.tmvu-main, .main_center');
    if (!main) return;

    const sourceRoot = main.cloneNode(true);
    const STYLE_ID = 'tmvu-national-teams-rankings-style';

    const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-main.tmvu-nt-rankings-page {
                display: flex !important;
                gap: 16px;
                align-items: flex-start;
            }

            .tmvu-nt-rankings-main {
                flex: 1 1 auto;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .tmvu-nt-rankings-copy {
                color: var(--tmu-text-muted);
                font-size: 12px;
                line-height: 1.6;
                max-width: 68ch;
            }

            .tmvu-nt-rankings-tabs {
                margin-bottom: 6px;
            }

            .tmvu-nt-rankings-table-wrap {
                border: 1px solid rgba(61,104,40,.2);
                border-radius: 10px;
                overflow: hidden;
                background: rgba(12,24,9,.28);
            }

            .tmvu-nt-rankings-table-wrap table {
                width: 100%;
                border-collapse: collapse;
            }

            .tmvu-nt-rankings-table-wrap th,
            .tmvu-nt-rankings-table-wrap td {
                padding: 10px 12px;
                border: 0;
                border-bottom: 1px solid rgba(61,104,40,.14);
                font-size: 12px;
            }

            .tmvu-nt-rankings-table-wrap thead th,
            .tmvu-nt-rankings-table-wrap tbody tr:first-child th {
                background: rgba(128,224,72,.06);
                color: var(--tmu-text-panel-label);
                font-size: 10px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-nt-rankings-table-wrap tbody tr {
                background: transparent !important;
            }

            .tmvu-nt-rankings-table-wrap tbody tr:nth-child(even) {
                background: rgba(255,255,255,.025) !important;
            }

            .tmvu-nt-rankings-table-wrap td {
                color: var(--tmu-text-strong);
            }

            .tmvu-nt-rankings-table-wrap a {
                color: var(--tmu-text-strong);
                text-decoration: none;
                font-weight: 700;
            }

            .tmvu-nt-rankings-table-wrap a:hover {
                color: var(--tmu-accent);
                text-decoration: underline;
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

    const parsePanels = (box) => {
        const labelById = new Map();
        box.querySelectorAll('.tabs [set_active]').forEach(tab => {
            const id = tab.getAttribute('set_active') || '';
            if (!id) return;
            labelById.set(id, cleanText(tab.textContent) || 'Tab');
        });

        return Array.from(box.querySelectorAll('.tab_container > div[id]')).map((panel, index) => {
            const table = panel.querySelector('table');
            if (!table) return null;

            return {
                id: panel.id,
                label: labelById.get(panel.id) || `Tab ${index + 1}`,
                tableHtml: table.outerHTML,
            };
        }).filter(Boolean);
    };

    const parseOverview = () => {
        const box = sourceRoot.querySelector('.column2_a > .box');
        if (!box) return null;

        const title = cleanText(box.querySelector('.box_head h2')?.textContent || 'National Team Rankings');
        const subHeader = box.querySelector('.box_sub_header');
        const region = cleanText(subHeader?.querySelector('.large')?.textContent || 'Region');
        const changeNode = subHeader?.querySelector('.faux_link');
        const panels = parsePanels(box);

        return {
            title,
            region,
            changeHtml: changeNode?.outerHTML || '',
            panels,
        };
    };

    const renderHeroCard = (overview) => {
        const wrap = document.createElement('section');
        const changeHtml = overview.changeHtml
            ? overview.changeHtml.replace(/class="([^"]*)"/, (_, classes) => `class="${`${classes} tmu-btn tmu-btn-secondary rounded-full py-1 px-3 text-sm`.replace(/\s+/g, ' ').trim()}"`)
            : '';

        TmHeroCard.mount(wrap, {
            cardClass: 'tmvu-nt-rankings-hero-card',
            slots: {
                kicker: 'Rankings',
                title: `${escapeHtml(overview.region)} ${escapeHtml(overview.title)}`,
                actions: changeHtml,
            },
        });

        return wrap.firstElementChild || wrap;
    };

    const renderTableCard = (overview) => {
        const wrap = document.createElement('section');
        const refs = TmUI.render(wrap, `
            <tm-card data-title="Standings" data-icon="🏁">
                <div data-ref="tabs"></div>
                <div data-ref="panel"></div>
            </tm-card>
        `);

        const state = { active: overview.panels[0]?.id || '' };
        const renderPanel = (panelId) => {
            const panel = overview.panels.find(item => item.id === panelId) || overview.panels[0];
            if (!panel) {
                refs.panel.innerHTML = TmUI.notice('No rankings table was available.', { variant: 'footnote' });
                return;
            }

            refs.panel.innerHTML = `
                <div class="tmvu-nt-rankings-table-wrap">${panel.tableHtml}</div>
                ${TmUI.notice('Source data is kept intact; only the presentation is normalized into the same shell used on our other standalone pages.', { variant: 'footnote' })}
            `;
        };

        const tabs = TmUI.tabs({
            items: overview.panels.map(panel => ({ key: panel.id, label: panel.label })),
            active: state.active,
            onChange: (key) => {
                state.active = key;
                renderPanel(key);
            },
        });
        tabs.classList.add('tmvu-nt-rankings-tabs');
        refs.tabs.appendChild(tabs);
        renderPanel(state.active);

        return wrap.firstElementChild || wrap;
    };

    const render = () => {
        injectStyles();

        const overview = parseOverview();
        if (!overview || !overview.panels.length) return;

        const menuItems = parseMenu();
        const activeHref = menuItems.find(item => item.isSelected)?.href || window.location.pathname;

        main.classList.add('tmvu-nt-rankings-page');
        main.innerHTML = '';

        TmSideMenu.mount(main, {
            id: 'tmvu-national-teams-rankings-nav',
            items: menuItems,
            currentHref: activeHref,
        });

        const mainColumn = document.createElement('section');
        mainColumn.className = 'tmvu-nt-rankings-main';
        mainColumn.appendChild(renderHeroCard(overview));
        mainColumn.appendChild(renderTableCard(overview));

        main.appendChild(mainColumn);
    };

    render();
})();