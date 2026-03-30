import { TmUI } from '../shared/tm-ui.js';
import { TmTable } from '../shared/tm-table.js';
import { TmUtils } from '../../lib/tm-utils.js';

const htmlOf = node => node?.outerHTML || '';
const chipHtml = opts => htmlOf(TmUI.chip(opts));
const inputHtml = opts => htmlOf(TmUI.input(opts));

export const TmImportDbTable = {
    create(players = []) {
        const root = document.createElement('div');
        let searchQuery = '';

        const applySearch = () => {
            const rows = root.querySelectorAll('tbody tr[data-search]');
            const countEl = root.querySelector('[data-role="db-count"]');
            const query = searchQuery.trim().toLowerCase();
            let visibleCount = 0;

            rows.forEach(row => {
                const isVisible = !query || row.dataset.search.includes(query);
                row.style.display = isVisible ? '' : 'none';
                if (isVisible) visibleCount += 1;
            });

            if (countEl) {
                countEl.textContent = query ? `(${visibleCount}/${players.length})` : `(${players.length})`;
            }
        };

        const render = () => {
            if (players.length === 0) {
                root.innerHTML = TmUI.empty('No players in database yet. Import a JSON file to get started.');
                return;
            }

            root.innerHTML = `
                <div class="tmi-wrap">
                    <div class="tmi-wrap-head">
                        <h2>Player Database <span class="tmi-db-count" data-role="db-count">(${players.length})</span></h2>
                        ${inputHtml({ type: 'text', size: 'xl', density: 'regular', placeholder: 'Search name or ID…' })}
                    </div>
                    <div class="tmi-db-scroll"></div>
                </div>`;

            const searchInput = root.querySelector('input');
            const scrollWrap = root.querySelector('.tmi-db-scroll');
            const table = TmTable.table({
                cls: 'tmi-db-table',
                items: players,
                sortKey: 'name',
                sortDir: 1,
                rowAttrs: (player) => ({ 'data-search': `${player.name.toLowerCase()} ${player.pid}` }),
                afterRender: () => applySearch(),
                headers: [
                    { key: 'name', label: 'Name', defaultSortDir: 1, render: (value, player) => `<a href="https://trophymanager.com/players/${player.pid}/" target="_blank">${value}</a>` },
                    { key: 'pos', label: 'Pos', defaultSortDir: 1, cls: 'pos-cell', render: (value, player) => player.isGK ? chipHtml({ label: 'GK', tone: 'warn', size: 'xs', shape: 'rounded', uppercase: true }) : value },
                    { key: 'records', label: 'Rec', align: 'c', defaultSortDir: -1 },
                    { key: 'last', label: 'Last Age', defaultSortDir: -1, sort: (left, right) => TmUtils.ageToMonths(left.last || '0.0') - TmUtils.ageToMonths(right.last || '0.0') },
                    { key: 'si', label: 'SI', align: 'r', defaultSortDir: -1, sort: (left, right) => left.lastSI - right.lastSI, render: (_, player) => player.lastSI > 0 ? player.lastSI.toLocaleString() : '—' },
                    { key: 'r5', label: 'R5', align: 'r', defaultSortDir: -1, sort: (left, right) => left.lastR5 - right.lastR5, render: (_, player) => player.lastR5 > 0 ? player.lastR5.toFixed(2) : '—' },
                    { key: 'rec', label: 'REC', align: 'r', defaultSortDir: -1, sort: (left, right) => left.lastREREC - right.lastREREC, render: (_, player) => player.lastREREC > 0 ? player.lastREREC.toFixed(2) : '—' },
                    { key: 'routine', label: 'Rtn', align: 'r', defaultSortDir: -1, sort: (left, right) => (left.routine ?? -1) - (right.routine ?? -1), render: (_, player) => player.routine != null ? player.routine.toFixed(1) : '—' },
                ],
            });
            scrollWrap.appendChild(table);

            if (searchInput) {
                searchInput.value = searchQuery;
                searchInput.addEventListener('input', () => {
                    searchQuery = searchInput.value;
                    applySearch();
                });
            }

            applySearch();
        };

        render();
        return root;
    },
};