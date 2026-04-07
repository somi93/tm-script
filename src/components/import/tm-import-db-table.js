import { TmPlayersTable } from '../shared/tm-players-table.js';
import { TmUI } from '../shared/tm-ui.js';

const inputHtml = opts => TmUI.input(opts)?.outerHTML || '';

const adapt = (p) => ({
    id: p.pid,
    name: p.name || '',
    fp: p.pos || '',
    age: p.last || '0.0',
    asi: p.lastSI || null,
    r5: p.lastR5 || null,
    rec: p.lastREREC || null,
    routine: p.routine ?? null,
    records: p.records,
});

export const TmImportDbTable = {
    create(players = []) {
        const root = document.createElement('div');
        let searchQuery = '';
        let tableWrap = null;

        const getFiltered = () => {
            const q = searchQuery.trim().toLowerCase();
            return !q ? players : players.filter(p =>
                (p.name || '').toLowerCase().includes(q) || String(p.pid || '').includes(q)
            );
        };

        const updateCount = (filtered) => {
            const countEl = root.querySelector('[data-role="db-count"]');
            if (countEl) countEl.textContent = searchQuery.trim()
                ? `(${filtered.length}/${players.length})`
                : `(${players.length})`;
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

            tableWrap = TmPlayersTable.mount(scrollWrap, players.map(adapt), {
                columns: { timeleft: false, curbid: false },
                sortKey: 'age',
                sortDir: -1,
                rowCls: null,
                onRowClick: null,
                extraColsAfter: [{
                    key: 'records',
                    label: '#',
                    align: 'c',
                    sort: (a, b) => (a.records || 0) - (b.records || 0),
                    render: (_, p) => `<span class="tmu-tabular" style="color:var(--tmu-text-muted)">${p.records ?? '—'}</span>`,
                }],
            });

            if (searchInput) {
                searchInput.value = searchQuery;
                searchInput.addEventListener('input', () => {
                    searchQuery = searchInput.value;
                    const filtered = getFiltered();
                    tableWrap.refresh(filtered.map(adapt));
                    updateCount(filtered);
                });
            }
        };

        render();
        return root;
    },
};