import { TmBidsSideMenu } from '../components/bids/tm-bids-side-menu.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmUI } from '../components/shared/tm-ui.js';

(function () {
    'use strict';

    if (!/^\/bids\/?$/.test(window.location.pathname)) return;

    const main = document.querySelector('.tmvu-main, .main_center');
    if (!main) return;
    const sourceRoot = main.cloneNode(true);

    const STYLE_ID = 'tmvu-bids-style';

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        injectTmPageLayoutStyles();

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-bids-page {
                --tmu-page-sidebar-width: 240px;
            }

            .tmvu-bids-player {
                display: flex;
                align-items: center;
                gap: var(--tmu-space-sm);
                min-width: 0;
            }

            .tmvu-bids-player-copy,
            .tmvu-bids-club-copy {
                min-width: 0;
            }

            .tmvu-bids-club-line {
                display: inline-flex;
                align-items: center;
                gap: var(--tmu-space-sm);
                min-width: 0;
                flex-wrap: wrap;
            }

            .tmvu-bids-club-price {
                color: var(--tmu-warning);
                font-size: var(--tmu-font-xs);
                font-weight: 800;
                white-space: nowrap;
                padding-left: var(--tmu-space-xs);
            }

            .tmvu-bids-player-name,
            .tmvu-bids-club-name {
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .tmvu-bids-flag,
            .tmvu-bids-flag img {
                width: 14px;
                height: 10px;
                display: inline-block;
                border-radius: var(--tmu-space-xs);
                object-fit: cover;
            }

            .tmvu-bids-status {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 84px;
                padding: var(--tmu-space-xs) var(--tmu-space-sm);
                border-radius: 999px;
                font-size: var(--tmu-font-xs);
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: .04em;
                border: 1px solid transparent;
            }

            .tmvu-bids-status-shortlisted {
                color: var(--tmu-text-preview);
                background: var(--tmu-preview-fill);
                border-color: var(--tmu-border-info);
            }

            .tmvu-bids-status-winning {
                color: var(--tmu-text-strong);
                background: var(--tmu-success-fill-soft);
                border-color: var(--tmu-border-success);
            }

            .tmvu-bids-status-sold,
            .tmvu-bids-status-expired {
                color: var(--tmu-text-inverse);
                background: var(--tmu-danger-fill);
                border-color: var(--tmu-border-danger);
            }

            .tmvu-bids-grid {
                display: grid;
                grid-template-columns: minmax(180px, 2.1fr) 120px minmax(220px, 1.9fr) 90px;
                gap: 0;
                border: 1px solid var(--tmu-border-faint);
                border-radius: var(--tmu-space-sm);
                overflow: hidden;
            }

            .tmvu-bids-grid-head,
            .tmvu-bids-grid-row {
                display: contents;
            }

            .tmvu-bids-grid-head > div {
                padding: var(--tmu-space-sm) var(--tmu-space-md);
                background: var(--tmu-surface-accent-soft);
                color: var(--tmu-text-faint);
                font-size: var(--tmu-font-xs);
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: .05em;
                border-bottom: 1px solid var(--tmu-border-input);
            }

            .tmvu-bids-grid-row > div {
                padding: var(--tmu-space-md) var(--tmu-space-md);
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
                background: var(--tmu-surface-dark-mid);
                color: var(--tmu-text-main);
                min-width: 0;
            }

            .tmvu-bids-grid-row:nth-child(even) > div {
                background: var(--tmu-surface-panel-dark);
            }

            .tmvu-bids-grid-row:last-child > div {
                border-bottom: none;
            }

            .tmvu-bids-cell-r,
            .tmvu-bids-grid-head .tmvu-bids-cell-r {
                text-align: right;
            }

            .transfer-box .cell-bid {
                text-align: left !important;
            }

            .tmvu-bids-cell-c,
            .tmvu-bids-grid-head .tmvu-bids-cell-c {
                text-align: center;
            }

            .tmvu-bids-native-fallback {
                border: 1px solid var(--tmu-border-faint);
                border-radius: var(--tmu-space-sm);
                overflow: hidden;
            }

            .tmvu-bids-native-fallback .players-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .tmvu-bids-native-fallback .header-row {
                display: none;
            }

            .tmvu-bids-native-fallback .player-row {
                display: grid;
                grid-template-columns: minmax(180px, 2.1fr) 120px 110px minmax(160px, 1.6fr) 90px;
            }

            .tmvu-bids-native-fallback .player-row > .p-cell {
                padding: var(--tmu-space-md) var(--tmu-space-md);
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
            }
        `;

        document.head.appendChild(style);
    };

    const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

    const parseMoney = (value) => {
        const match = String(value || '').replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*([KMB])?/i);
        if (!match) return 0;

        const base = Number(match[1]) || 0;
        const suffix = String(match[2] || '').toUpperCase();
        if (suffix === 'B') return base * 1000;
        if (suffix === 'M') return base;
        if (suffix === 'K') return base / 1000;
        return base;
    };

    const statusClass = (status) => {
        const normalized = cleanText(status).toLowerCase();
        if (normalized === 'winning') return 'tmvu-bids-status-winning';
        if (normalized === 'sold') return 'tmvu-bids-status-sold';
        if (normalized === 'expired') return 'tmvu-bids-status-expired';
        return 'tmvu-bids-status-shortlisted';
    };

    const parseMenu = (root) => {
        const anchors = Array.from((root || document).querySelectorAll('.column1 .content_menu a, .column1_a .content_menu a'));
        return anchors.map(anchor => ({
            href: anchor.getAttribute('href') || '#',
            label: cleanText(anchor.textContent),
            isActive: /\bbids?\b/i.test(cleanText(anchor.textContent)) || /\/bids\//.test(anchor.getAttribute('href') || ''),
        }));
    };

    const parseRows = (box, clubLabel) => {
        const rows = Array.from(box.querySelectorAll('.players-list .player-row, .players-list li[id^="pid"], .players-list > li:not(.header-row)'));
        return rows.map(row => {
            const playerAnchor = row.querySelector('.cell-player a[player_link]');
            const playerName = cleanText(playerAnchor?.textContent || 'Player');
            const playerHref = playerAnchor?.getAttribute('href') || '#';
            const playerFlagAnchor = row.querySelector('.cell-player a[href*="/national-teams/"]');
            const playerFlagHtml = playerFlagAnchor ? `<span class="tmvu-bids-flag">${playerFlagAnchor.innerHTML}</span>` : '';

            const clubAnchor = row.querySelector('.cell-club a[club_link]');
            const clubName = cleanText(clubAnchor?.textContent || clubLabel);
            const clubHref = clubAnchor?.getAttribute('href') || '#';
            const clubFlagAnchor = row.querySelector('.cell-club a[href*="/national-teams/"]');
            const clubFlagHtml = clubFlagAnchor ? `<span class="tmvu-bids-flag">${clubFlagAnchor.innerHTML}</span>` : '';

            const status = cleanText(row.querySelector('.cell-status')?.textContent || '');
            const bidText = cleanText(row.querySelector('.cell-bid')?.textContent || '0');
            const bidValue = parseMoney(bidText);
            const expiry = cleanText(row.querySelector('.cell-timeleft')?.textContent || '');

            return {
                id: row.id || playerHref,
                rawHtml: row.outerHTML,
                playerName,
                playerHref,
                playerFlagHtml,
                status,
                bidText,
                bidValue,
                clubName,
                clubHref,
                clubFlagHtml,
                expiry,
            };
        });
    };

    const parseSections = (root) => {
        const boxes = Array.from((root || document).querySelectorAll('.column2_c .transfer-box, .column2_a .transfer-box, .transfer-box.transfers-in-box, .transfer-box.transfers-out-box'));
        return boxes.map(box => {
            const heading = cleanText(box.querySelector('.tbox-header span')?.textContent || 'Bids');
            const clubLabel = /out/i.test(heading) ? 'Buyer' : 'Seller';
            const rows = parseRows(box, clubLabel);
            const totalBid = rows.reduce((sum, row) => sum + row.bidValue, 0);
            return {
                key: /out/i.test(heading) ? 'out' : 'in',
                title: heading,
                clubLabel,
                rawHtml: box.outerHTML,
                rows,
                totalBid,
            };
        });
    };

    const buildSectionTable = (section) => {
        if (!section.rows.length) {
            const empty = document.createElement('div');
            if (section.rawHtml) {
                empty.innerHTML = `<div class="tmvu-bids-native-fallback">${section.rawHtml}</div>`;
                return empty;
            }
            empty.innerHTML = TmUI.empty(`No ${section.title.toLowerCase()} entries`, true);
            return empty;
        }

        const sortedRows = section.rows.slice().sort((a, b) => b.bidValue - a.bidValue);
        const host = document.createElement('div');
        host.innerHTML = `
            <div class="tmvu-bids-grid">
                <div class="tmvu-bids-grid-head">
                    <div>Player</div>
                    <div class="tmvu-bids-cell-c">Status</div>
                    <div class="tmvu-bids-cell-bid">${section.clubLabel}</div>
                    <div class="tmvu-bids-cell-r">Expiry</div>
                </div>
                ${sortedRows.map(item => `
                    <div class="tmvu-bids-grid-row">
                        <div>
                            <div class="tmvu-bids-player">
                                ${item.playerFlagHtml}
                                <div class="tmvu-bids-player-copy">
                                    <a class="tmvu-bids-player-name" href="${item.playerHref}">${item.playerName}</a>
                                </div>
                            </div>
                        </div>
                        <div class="tmvu-bids-cell-c"><span class="tmvu-bids-status ${statusClass(item.status)}">${item.status}</span></div>
                        <div class="tmvu-bids-cell-bid">
                            <div class="tmvu-bids-player">
                                <div class="tmvu-bids-club-copy">
                                    <span class="tmvu-bids-club-line">
                                        <a class="tmvu-bids-club-name" href="${item.clubHref}">${item.clubName}</a>
                                        <span class="tmvu-bids-club-price">${item.bidText}</span>
                                    </span>
                                </div>
                                ${item.clubFlagHtml}
                            </div>
                        </div>
                        <div class="tmvu-bids-cell-r">${item.expiry}</div>
                    </div>
                `).join('')}
            </div>
        `;
        return host;
    };

    const renderSectionCard = (section) => {
        const wrap = document.createElement('section');

        TmUI.render(wrap, `
            <tm-card data-title="${section.title}">
                <div data-ref="table"></div>
            </tm-card>
        `);

        const tableHost = wrap.querySelector('[data-ref="table"]');
        tableHost.replaceWith(buildSectionTable(section));
        return wrap.firstElementChild || wrap;
    };

    const render = () => {
        injectStyles();

        const menuItems = parseMenu(sourceRoot);
        const sections = parseSections(sourceRoot);

        main.classList.add('tmvu-bids-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');
        main.innerHTML = '';

        TmBidsSideMenu.mount(main, {
            className: 'tmu-page-sidebar-stack',
            items: menuItems,
            currentHref: '/bids/',
        });

        const content = document.createElement('section');
        content.className = 'tmvu-bids-main tmu-page-section-stack';

        sections.forEach(section => {
            content.appendChild(renderSectionCard(section));
        });

        main.append(content);
    };

    render();
})();