import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { mountNationalTeamsSideMenu } from '../components/national-teams/tm-national-teams-side-menu.js';
import { TmTable } from '../components/shared/tm-table.js';
import { TmUI } from '../components/shared/tm-ui.js';

const STYLE_ID = 'tmvu-national-teams-statistics-style';

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const fetchDocument = async (path) => {
    const response = await window.fetch(path, { credentials: 'same-origin' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    return new DOMParser().parseFromString(html, 'text/html');
};

const isNumericLike = (value) => /^-?\d+(?:[.,]\d+)?$/.test(String(value || '').trim());

const parseStatisticsTable = (contentBox) => {
    const visibleTab = Array.from(contentBox.querySelectorAll('#tab0, .tab_container, .tab_content, .tabs_content > div'))
        .find(node => node && node.nodeType === 1 && !/display\s*:\s*none/i.test(node.getAttribute('style') || ''));
    const scope = visibleTab || contentBox;
    const table = scope.querySelector('table');
    if (!table) return null;

    const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
    const headerCells = Array.from(headerRow?.querySelectorAll('th, td') || []);
    if (!headerCells.length) return null;

    const headers = headerCells.map((cell, index) => {
        const label = cleanText(cell.textContent) || (index === 0 ? 'Name' : `Col ${index + 1}`);
        const key = index === 0 ? 'player' : `col${index}`;
        const align = index === 0 ? 'l' : 'r';
        return {
            key,
            label,
            align,
            sortable: true,
            sort: index === 0
                ? ((a, b) => String(a.playerSort || '').localeCompare(String(b.playerSort || '')))
                : ((a, b) => (Number(a[`sort${index}`]) || 0) - (Number(b[`sort${index}`]) || 0)),
            render: index === 0
                ? ((_, item) => item.playerHtml || escapeHtml(item.playerSort || ''))
                : ((value) => escapeHtml(value ?? '')),
        };
    });

    const bodyRows = Array.from(table.querySelectorAll('tbody tr')).filter(row => row.querySelectorAll('td').length >= headerCells.length);
    const items = bodyRows.map((row, rowIndex) => {
        const cells = Array.from(row.querySelectorAll('td'));
        const playerCell = cells[0];
        const playerLink = playerCell?.querySelector('a[href*="/players/"]');
        const playerHtml = playerLink
            ? `<a href="${playerLink.getAttribute('href') || '#'}" target="_blank" style="color:inherit;text-decoration:none">${escapeHtml(cleanText(playerLink.textContent))}</a>`
            : escapeHtml(cleanText(playerCell?.textContent || ''));
        const item = {
            player: cleanText(playerCell?.textContent || ''),
            playerSort: cleanText(playerCell?.textContent || ''),
            playerHtml,
            _rowClass: /highlighted_row/.test(row.className || '') ? 'tmu-psb-me' : '',
        };

        cells.forEach((cell, index) => {
            const text = cleanText(cell.textContent);
            if (index === 0) return;
            item[`col${index}`] = text;
            item[`sort${index}`] = isNumericLike(text) ? Number(text.replace(',', '.')) : rowIndex;
        });

        return item;
    });

    return { headers, items };
};

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-nt-statistics-page {
            --tmu-page-sidebar-width: 200px;
        }

        .tmvu-nt-statistics-title {
            font-size: var(--tmu-font-sm);
            font-weight: 700;
            color: var(--tmu-text-strong);
            letter-spacing: 0.3px;
        }

        .tmvu-nt-statistics-wrap {
            padding: var(--tmu-space-lg);
        }

        .tmvu-nt-statistics-wrap .tmu-tbl a:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
};

export function initNationalTeamsStatisticsPage(main) {
    if (!main || !main.isConnected) return;
    const routeMatch = window.location.pathname.match(/^\/statistics\/national-teams\/([a-z]{2,3})(?:\/players\/[^/]+)?\/?$/i);
    if (!routeMatch) return;

    const countryCode = routeMatch[1].toLowerCase();

    const init = async () => {
        injectTmPageLayoutStyles();
        injectStyles();

        main.innerHTML = TmUI.loading('Loading national team statistics...');

        const sourceRoot = document.querySelector('.main_center');
        let dataRoot = sourceRoot;
        let contentBox = dataRoot?.querySelector('.column2_a > .box') || null;

        if (!contentBox) {
            const doc = await fetchDocument(window.location.pathname);
            dataRoot = doc;
            contentBox = doc.querySelector('.column2_a > .box');
        }

        if (!contentBox) {
            main.innerHTML = TmUI.error('Failed to load national team statistics.');
            return;
        }

        const title = cleanText(contentBox.querySelector('.box_head h2')?.textContent || 'Statistics');
        const tableData = parseStatisticsTable(contentBox);

        main.innerHTML = '';
        main.classList.add('tmvu-nt-statistics-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');

        mountNationalTeamsSideMenu(main, {
            root: dataRoot,
            id: 'tmvu-national-teams-statistics-nav',
            countryCode,
            currentSeason: Number(window.SESSION?.season) || null,
        });

        const mainColumn = document.createElement('section');
        mainColumn.className = 'tmu-page-section-stack';
        const card = document.createElement('section');
        card.className = 'tmu-card';
        card.innerHTML = `
            <div class="tmu-card-head">
                <span class="tmvu-nt-statistics-title">${escapeHtml(title)}</span>
            </div>
            <div class="tmu-card-body tmu-card-body-flush">
                <div class="tmvu-nt-statistics-wrap" data-ref="table"></div>
            </div>
        `;
        mainColumn.appendChild(card);
        main.appendChild(mainColumn);

        const tableHost = card.querySelector('[data-ref="table"]');
        if (!tableHost) {
            main.innerHTML = TmUI.error('Failed to initialize national team statistics.');
            return;
        }

        if (!tableData?.headers?.length || !tableData.items?.length) {
            tableHost.innerHTML = TmUI.empty('No statistics table found.', true);
            return;
        }

        const defaultSortKey = tableData.headers.find(header => header.key !== 'player')?.key || 'player';

        tableHost.appendChild(TmTable.table({
            cls: 'tmu-tbl',
            headers: tableData.headers,
            items: tableData.items,
            sortKey: defaultSortKey,
            sortDir: -1,
            rowCls: (item) => item._rowClass || '',
        }));
    };

    init().catch((error) => {
        console.error('Failed to initialize national team statistics page:', error);
        main.innerHTML = TmUI.error(`Error loading national team statistics: ${error.message}`);
    });
}