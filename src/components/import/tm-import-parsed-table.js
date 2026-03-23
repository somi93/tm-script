import { TmTable } from '../shared/tm-table.js';

const formatMeta = (format) => {
    if (format === 'v3') {
        return { text: 'v3 native restore', color: '#34d399' };
    }
    return { text: 'legacy sync', color: '#94a3b8' };
};

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const TmImportParsedTable = {
    create(players = [], { filename = '', format = 'legacy', existingCount = 0 } = {}) {
        const root = document.createElement('div');
        const totalRecords = players.reduce((sum, player) => sum + player.ageKeys.length, 0);
        const formatInfo = formatMeta(format);

        root.innerHTML = `
            <div class="tmi-parsed">
                <div class="tmi-parsed-header">
                    Parsed ${players.length} players, ${totalRecords} records from ${escapeHtml(filename)}
                    <span style="color:${formatInfo.color};font-weight:400;font-size:12px"> — ${formatInfo.text}</span>
                    ${existingCount > 0 ? `<span style="color:#fbbf24;font-weight:400;font-size:12px"> — ${existingCount} already in DB</span>` : ''}
                </div>
                <div class="tmi-table-scroll"></div>
            </div>`;

        const tableWrap = root.querySelector('.tmi-table-scroll');
        tableWrap.appendChild(TmTable.table({
            cls: 'tmi-table',
            items: players,
            prependIndex: { align: 'c' },
            headers: [
                { key: 'pid', label: 'Player ID', sortable: false, render: (value) => `<a href="https://trophymanager.com/players/${value}/" target="_blank">${value}</a>` },
                { key: 'records', label: 'Records', align: 'c', sortable: false, render: (_, player) => player.ageKeys.length },
                { key: 'isGK', label: 'GK', align: 'c', sortable: false, render: (value) => value ? '🧤' : '' },
                { key: 'ageRange', label: 'Age Range', sortable: false, render: (_, player) => {
                    const firstAge = player.ageKeys[0];
                    const lastAge = player.ageKeys[player.ageKeys.length - 1];
                    return firstAge === lastAge ? firstAge : `${firstAge} → ${lastAge}`;
                } },
                { key: 'inDB', label: 'In DB', align: 'c', sortable: false, render: (value) => value ? '✓' : '—' },
            ],
        }));

        return root;
    },
};