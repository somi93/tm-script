import { TmTable } from '../shared/tm-table.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmUtils } from '../../lib/tm-utils.js';

const playerCellHtml = (player) => `${TmPosition.chip([player.displayPosition || ''])}<span class="rnd-mps-name${player.isKeeper ? ' ml-2 mr-1' : ''}">${player.name}</span>${player.subOut ? '<span class="rnd-mps-sub-flag out" title="Subbed out">↓</span>' : player.subIn ? '<span class="rnd-mps-sub-flag in" title="Subbed in">↑</span>' : ''}`;

const ratingHtml = (rating) => `<span style="color:${rating ? TmUtils.ratingColor(rating) : 'var(--tmu-text-faint)'}">${rating ? rating.toFixed(2) : '-'}</span>`;

export const TmMatchPlayerStatsTable = {
    table({ title, players, headers, tableClass = 'rnd-mps-table', onRowClick }) {
        const table = TmTable.table({
            cls: tableClass,
            headers,
            items: players,
            rowCls: () => 'rnd-mps-row',
            onRowClick,
        });

        const theadLabel = table.querySelector('thead th');
        if (theadLabel) theadLabel.textContent = title;

        return table;
    },

    outfield(players, onRowClick) {
        return this.table({
            title: 'Player',
            players,
            onRowClick,
            headers: [
                { key: 'name', label: 'Player', align: 'l', sortable: false, cls: 'rnd-mps-name-cell', render: (_, player) => playerCellHtml(player) },
                { key: 'minutes', label: 'Min', align: 'c', sortable: false },
                { key: 'shots', label: 'Sh', align: 'c', sortable: false },
                { key: 'shotsOnTarget', label: 'SoT', align: 'c', sortable: false },
                { key: 'goals', label: 'G', align: 'c', sortable: false },
                { key: 'passSummary', label: 'Pass', align: 'c', sortable: false, render: (_, player) => `${player.passesCompleted || 0}/${player.totalPasses || 0}` },
                { key: 'assists', label: 'A', align: 'c', sortable: false },
                { key: 'interceptions', label: 'INT', align: 'c', sortable: false },
                { key: 'tackleFails', label: 'TF', align: 'c', sortable: false },
                { key: 'rating', label: 'RTG', align: 'c', sortable: false, render: (rating) => ratingHtml(rating) },
            ],
        });
    },

    keepers(players, onRowClick) {
        return this.table({
            title: 'Goalkeeper',
            players: players.map(player => ({ ...player, isKeeper: true })),
            tableClass: 'rnd-mps-table rnd-mps-table-gk',
            onRowClick,
            headers: [
                { key: 'name', label: 'Goalkeeper', align: 'l', sortable: false, cls: 'rnd-mps-name-cell', render: (_, player) => playerCellHtml(player) },
                { key: 'minutes', label: 'Min', align: 'c', sortable: false },
                { key: 'saves', label: 'Saves', align: 'c', sortable: false },
                { key: 'goals', label: 'Conc', align: 'c', sortable: false },
                { key: 'passSummary', label: 'Pass', align: 'c', sortable: false, render: (_, player) => `${player.passesCompleted || 0}/${player.totalPasses || 0}` },
                { key: 'assists', label: 'A', align: 'c', sortable: false },
                { key: 'rating', label: 'RTG', align: 'c', sortable: false, render: (rating) => ratingHtml(rating) },
            ],
        });
    },
};