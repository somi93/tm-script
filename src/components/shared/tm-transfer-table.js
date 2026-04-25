import { TmLeagueTable } from '../league/tm-league-table.js';
import { fetchClubTransfers } from '../../models/club.js';
import { TmStars } from './tm-stars.js';

export const TmTransferTable = {
    /**
     * Parse one <tr> from a TM transfer history table.
     * Returns null for header/total rows (no player link).
     * Result: { pid, name, url, rec, isRetired, clubId, clubName, price }
     */
    parseRow(tr) {
        const tds = tr.querySelectorAll('td');
        if (tds.length < 4) return null;
        const playerA = tds[0].querySelector('a[player_link]');
        if (!playerA) return null;
        const recTd = tds[1];
        const isRetired = recTd.textContent.trim() === 'Retired';
        let stars = 0;
        recTd.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src') || '';
            if (src.includes('half_star')) stars += 0.5;
            else if (src.includes('star') && !src.includes('dark_star')) stars += 1;
        });
        const clubA = tds[2].querySelector('a[club_link]');
        return {
            pid: playerA.getAttribute('player_link'),
            name: playerA.textContent.trim(),
            url: playerA.getAttribute('href'),
            rec: stars * 3.38,
            isRetired,
            clubId: clubA ? clubA.getAttribute('club_link') : null,
            clubName: clubA ? clubA.textContent.trim() : tds[2].textContent.trim(),
            price: parseFloat(tds[3].textContent.trim().replace(/,/g, '')) || 0,
        };
    },

    /**
     * Fetch and parse a club's transfer history page for a given season.
     * opts: { leagueClubId?, leagueClubName?, isMe? }
     * Returns Promise<{ bought, sold, totalBought, totalSold, balance } | null>
     */
    fetchClub(clubId, season, opts = {}) {
        return fetchClubTransfers(clubId, season, opts);
    },

    /**
     * Mount a sortable player transfer table onto `el`.
     * rows: [{ pid, name, url, rec, isRetired, clubId, clubName, price,
     *           leagueClubId?, leagueClubName?, isMe?, season? }]
     * opts: { clubLabel, teamLabel?, showSeason? }
     */
    mount(el, rows, opts = {}) {
        const hasTeam = !!opts.teamLabel;
        const hasSeason = !!opts.showSeason;
        const enriched = rows.map((r, i) => ({
            ...r,
            // _sortVals: [#, name, teamName, clubName, rec, price, season]
            _sortVals: [i + 1, r.name, r.leagueClubName || '', r.clubName || '', r.rec || 0, r.price, r.season || 0],
        }));
        const buildRowsHtml = data => data.map((r, i) => {
            const recCell = r.isRetired
                ? `<td class="tsa-tr-rec" style="color:var(--tmu-text-dim);font-style:italic">Ret</td>`
                : `<td class="tsa-tr-rec"><span style="font-size:var(--tmu-font-md)">${TmStars.recommendation(r.rec / 3.38)}</span></td>`;
            const teamTd = hasTeam
                ? `<td><a href="/club/${r.leagueClubId}/" target="_blank" style="color:${r.isMe ? 'var(--tmu-accent)' : 'var(--tmu-text-main)'};text-decoration:none">${r.leagueClubName}</a></td>`
                : '';
            const clubTd = r.clubId
                ? `<td style="color:var(--tmu-text-muted)"><a href="/club/${r.clubId}/" target="_blank" style="color:inherit;text-decoration:none">${r.clubName}</a></td>`
                : `<td style="color:var(--tmu-text-muted)">${r.clubName || ''}</td>`;
            const seasonTd = hasSeason ? `<td style="text-align:center">S${r.season}</td>` : '';
            return `<tr class="${r.isMe ? 'tsa-stats-me' : ''}">
                <td class="tsa-stats-rank">${i + 1}</td>
                <td class="tsa-stats-name"><a href="${r.url || '/players/' + r.pid + '/'}">${r.name}</a></td>
                ${recCell}${teamTd}${clubTd}${seasonTd}
                <td class="tsa-stats-val">${r.price.toFixed(1)}</td>
            </tr>`;
        }).join('');
        TmLeagueTable.mountSortable(el, {
            headerRows: [[
                { label: '#',         sortIndex: 0, style: 'text-align:right;width:32px' },
                { label: 'Player',    sortIndex: 1, style: 'text-align:left' },
                { label: 'Rec',       sortIndex: 4, style: 'text-align:right;width:80px' },
                ...(hasTeam ? [{ label: opts.teamLabel, sortIndex: 2, style: 'text-align:left' }] : []),
                { label: opts.clubLabel || 'Club', sortIndex: 3, style: 'text-align:left' },
                ...(hasSeason ? [{ label: 'Season', sortIndex: 6, style: 'text-align:center;width:64px' }] : []),
                { label: 'Price (M)', sortIndex: 5, style: 'text-align:right;width:80px' },
            ]],
            getRows: () => enriched,
            renderRows: buildRowsHtml,
            defaultAsc: idx => idx === 1 || idx === 2 || idx === 3,
        });
    },
};
