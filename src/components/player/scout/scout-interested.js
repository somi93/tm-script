'use strict';

import { TmPlayerDataTable } from '../skills/tm-player-data-table.js';
import { TmUI } from '../../shared/tm-ui.js';
import { CountryFlag } from '../../shared/country-flag.js';

const cashColor = (c) => {
    if (!c) return 'var(--tmu-text-strong)';
    if (c.includes('Astonishingly')) return 'var(--tmu-success)';
    if (c.includes('Incredibly')) return 'var(--tmu-accent)';
    if (c.includes('Very rich')) return 'var(--tmu-accent)';
    if (c.includes('Rich')) return 'var(--tmu-text-strong)';
    if (c.includes('Terrible')) return 'var(--tmu-danger)';
    if (c.includes('Poor')) return 'var(--tmu-warning)';
    return 'var(--tmu-text-strong)';
};

const buildTable = (interested) => {
    if (!interested || !interested.length) return TmUI.empty('No interested clubs', true);
    const bodyRows = interested.map(club => {
        return {
            cells: [
                {
                    content: `${CountryFlag.render(club.country, 'tmsq-flag')} 
                    <a href="/club.php?id=${club.id}">${club.name}</a> 
                    ${`<span class="tmsc-online ${club.online ? 'on' : 'off'}"></span>`}`,
                    cls: 'tmsc-club-cell'
                },
                {
                    content: `${club.division}.${club.group}`,
                    cls: 'tmsc-league-cell'
                },
                {
                    content: club.cash,
                    attrs: {
                        style: `color:${cashColor(club.cash)};font-weight:600;font-size:var(--tmu-font-xs)`
                    }
                },
            ],
        };
    });
    return TmPlayerDataTable.table({
        tableClass: 'tmsc-tbl',
        headerRows: [
            {
                cells: [
                    { content: 'Club' },
                    { content: 'League' },
                    { content: 'Financial' }
                ]
            }
        ],
        bodyRows,
    });
};

export const mountScoutInterested = (el, interested) => {
    el.innerHTML = '';
    el.appendChild(buildTable(interested));
};
