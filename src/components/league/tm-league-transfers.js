import { TmButton } from '../shared/tm-button.js';
import { TmLeagueTable } from './tm-league-table.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmTransferTable } from '../shared/tm-transfer-table.js';

const buttonHtml = ({ label, slot, cls = '', active = false, ...opts }) => TmButton.button({
    color: 'primary', size: 'sm', label, slot, cls, active, ...opts,
}).outerHTML;

const fetchClubsForSeason = (season, onDone) => {
    const s = window.TmLeagueCtx;
    const currentSeason = typeof SESSION !== 'undefined' ? SESSION.season : null;
    if (!season || season === currentSeason) { onDone(s.standingsRows || []); return; }
    const cacheKey = `clubs|${season}`;
    if (s.statsCache[cacheKey]) { onDone(s.statsCache[cacheKey]); return; }
    const { panelCountry, panelDivision, panelGroup } = s;
    if (!panelCountry || !panelDivision) { onDone(s.standingsRows || []); return; }
    const group = panelGroup || '1';
    window.fetch(`/history/league/${panelCountry}/${panelDivision}/${group}/standings/${season}/`)
        .then(r => r.text())
        .then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const clubs = [];
            doc.querySelectorAll('table.border_bottom tr').forEach(tr => {
                const a = tr.querySelector('a[club_link]');
                if (!a) return;
                clubs.push({ clubId: a.getAttribute('club_link'), clubName: a.textContent.trim() });
            });
            s.statsCache[cacheKey] = clubs;
            onDone(clubs);
        })
        .catch(() => onDone(s.standingsRows || []));
};

const fetchAllClubTransfers = (season, onDone) => {
    const s = window.TmLeagueCtx;
    const key = `transfers|${season}`;
    if (s.statsCache[key]) { onDone(s.statsCache[key]); return; }
    const myId = typeof SESSION !== 'undefined' ? String(SESSION.id || SESSION.main_id || '') : '';
    fetchClubsForSeason(season, clubs => {
        if (!clubs.length) { onDone(null); return; }
        Promise.all(clubs.map(club =>
            TmTransferTable.fetchClub(club.clubId, season, { leagueClubId: club.clubId, leagueClubName: club.clubName, isMe: club.clubId === myId })
                .catch(() => ({ bought: [], sold: [] }))
        )).then(results => {
            const data = {
                bought: results.flatMap(r => r.bought),
                sold: results.flatMap(r => r.sold),
            };
            s.statsCache[key] = data;
            onDone(data);
        });
    });
};

const renderTransfersTab = () => {
    const s = window.TmLeagueCtx;
    const container = document.getElementById('tsa-transfers-content');
    if (!container) return;
    const season = s.displayedSeason !== null
        ? s.displayedSeason
        : (typeof SESSION !== 'undefined' ? SESSION.season : null);
    container.innerHTML = TmUI.loading(`Loading Season ${season} transfers…`);

    fetchAllClubTransfers(season, data => {
        if (!data) {
            container.innerHTML = TmUI.error('Failed to load transfers.');
            return;
        }

        const teamMap = {};
        data.bought.forEach(r => {
            const cid = r.leagueClubId;
            if (!teamMap[cid]) teamMap[cid] = { clubId: cid, clubName: r.leagueClubName, isMe: r.isMe, bCount: 0, bTotal: 0, sCount: 0, sTotal: 0 };
            teamMap[cid].bCount++;
            teamMap[cid].bTotal += r.price;
        });
        data.sold.forEach(r => {
            const cid = r.leagueClubId;
            if (!teamMap[cid]) teamMap[cid] = { clubId: cid, clubName: r.leagueClubName, isMe: r.isMe, bCount: 0, bTotal: 0, sCount: 0, sTotal: 0 };
            teamMap[cid].sCount++;
            teamMap[cid].sTotal += r.price;
        });
        const teamGroups = Object.values(teamMap).sort((a, b) => (b.sTotal - b.bTotal) - (a.sTotal - a.bTotal));
        const teamEnriched = teamGroups.map((g, i) => ({
            ...g,
            _sortVals: [i + 1, g.clubName, g.bCount, g.bTotal, g.sCount, g.sTotal, g.sTotal - g.bTotal]
        }));
        const buildTeamRowsHtml = rows => rows.map((g, i) => {
            const bal = g.sTotal - g.bTotal;
            const balCol = bal > 0 ? 'var(--tmu-success)' : bal < 0 ? 'var(--tmu-danger)' : 'var(--tmu-text-main)';
            return `<tr class="${g.isMe ? 'tsa-stats-me' : ''}">
                    <td class="tsa-stats-rank">${i + 1}</td>
                    <td class="tsa-stats-name"><a href="/club/${g.clubId}/" target="_blank" style="color:${g.isMe ? 'var(--tmu-accent)' : 'var(--tmu-text-main)'};text-decoration:none">${g.clubName}</a></td>
                    <td class="tsa-stats-val">${g.bCount}</td>
                    <td class="tsa-stats-val">${g.bTotal.toFixed(1)}</td>
                    <td class="tsa-stats-val">${g.sCount}</td>
                    <td class="tsa-stats-val">${g.sTotal.toFixed(1)}</td>
                    <td class="tsa-stats-val" style="color:${balCol};font-weight:700">${bal >= 0 ? '+' : ''}${bal.toFixed(1)}</td>
                </tr>`;
        }).join('');
        const teamData = {
            enriched: teamEnriched,
            buildRowsHtml: buildTeamRowsHtml,
            headerRows: [
                [
                    { label: '#', sortIndex: 0, style: 'text-align:right', rowspan: 2 },
                    { label: 'Club', sortIndex: 1, style: 'text-align:left', rowspan: 2 },
                    { label: 'Bought', colspan: 2, style: 'text-align:center;border-bottom:1px solid var(--tmu-border-success);color:var(--tmu-success)' },
                    { label: 'Sold', colspan: 2, style: 'text-align:center;border-bottom:1px solid var(--tmu-border-success);color:var(--tmu-success)' },
                    { label: 'Bal', sortIndex: 6, className: 'tsa-stats-val', style: 'text-align:right', rowspan: 2 },
                ],
                [
                    { label: 'Pl', sortIndex: 2, className: 'tsa-stats-val', style: 'text-align:right' },
                    { label: 'Total', sortIndex: 3, className: 'tsa-stats-val', style: 'text-align:right' },
                    { label: 'Pl', sortIndex: 4, className: 'tsa-stats-val', style: 'text-align:right' },
                    { label: 'Total', sortIndex: 5, className: 'tsa-stats-val', style: 'text-align:right' },
                ],
            ],
        };

        const totalBought = data.bought.reduce((acc, r) => acc + r.price, 0);
        const totalSold = data.sold.reduce((acc, r) => acc + r.price, 0);
        const totalBal = totalSold - totalBought;
        const balColor = totalBal >= 0 ? 'var(--tmu-success)' : 'var(--tmu-danger)';
        const totalsHtml = `
            <div class="tsa-tr-totals">
                <span>Bought: <strong style="color:var(--tmu-text-main)">${totalBought.toFixed(1)}M</strong></span>
                <span>Sold: <strong style="color:var(--tmu-text-main)">${totalSold.toFixed(1)}M</strong></span>
                <span>Balance: <strong style="color:${balColor}">${totalBal >= 0 ? '+' : ''}${totalBal.toFixed(1)}M</strong></span>
            </div>`;

        container.innerHTML = `
            <div class="tsa-stats-bar">
                <div>
                    ${buttonHtml({ cls: 'tsa-stat-mode-btn', active: s.transfersView === 'bought', slot: `Bought <span class="tsa-tr-count">${data.bought.length}</span>` })}
                    ${buttonHtml({ cls: 'tsa-stat-mode-btn', active: s.transfersView === 'sold', slot: `Sold <span class="tsa-tr-count">${data.sold.length}</span>` })}
                    ${buttonHtml({ cls: 'tsa-stat-mode-btn', active: s.transfersView === 'teams', slot: 'Teams' })}
                </div>
            </div>
            <div id="tsa-tr-bought-wrap" style="display:${s.transfersView === 'bought' ? '' : 'none'}"></div>
            <div id="tsa-tr-sold-wrap" style="display:${s.transfersView === 'sold' ? '' : 'none'}"></div>
            <div id="tsa-tr-teams-wrap" style="display:${s.transfersView === 'teams' ? '' : 'none'}">
                <div id="tsa-tr-teams-inner"></div>
            </div>
            ${totalsHtml}
        `;
        const transferViewButtons = container.querySelectorAll('.tsa-stat-mode-btn');
        if (transferViewButtons[0]) transferViewButtons[0].dataset.tv = 'bought';
        if (transferViewButtons[1]) transferViewButtons[1].dataset.tv = 'sold';
        if (transferViewButtons[2]) transferViewButtons[2].dataset.tv = 'teams';
        const allWraps = {
            bought: document.getElementById('tsa-tr-bought-wrap'),
            sold: document.getElementById('tsa-tr-sold-wrap'),
            teams: document.getElementById('tsa-tr-teams-wrap'),
        };
        container.onclick = (event) => {
            const button = event.target.closest('.tsa-stat-mode-btn[data-tv]');
            if (!button || !container.contains(button)) return;
            s.transfersView = button.dataset.tv;
            container.querySelectorAll('.tsa-stat-mode-btn[data-tv]').forEach(b =>
                b.classList.toggle('tsa-stat-btn-active', b.dataset.tv === s.transfersView));
            Object.entries(allWraps).forEach(([k, el]) => { if (el) el.style.display = k === s.transfersView ? '' : 'none'; });
        };
        TmTransferTable.mount(allWraps.bought, data.bought, { clubLabel: 'Seller', teamLabel: 'Team' });
        TmTransferTable.mount(allWraps.sold, data.sold, { clubLabel: 'Buyer', teamLabel: 'Team' });
        TmLeagueTable.mountSortable(document.getElementById('tsa-tr-teams-inner'), {
            headerRows: teamData.headerRows,
            getRows: () => teamData.enriched,
            renderRows: teamData.buildRowsHtml,
        });
    });
};

export const TmLeagueTransfers = { renderTransfersTab };
