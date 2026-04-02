/**
 * TmLeagueStats
 *
 * Handles player statistics, club statistics, and transfers: parse, fetch, render.
 * Reads and writes shared state via window.TmLeagueCtx.
 */

import { TmButton } from '../shared/tm-button.js';
import { TmLeagueTable } from './tm-league-table.js';
import { TmUI } from '../shared/tm-ui.js';

if (!document.getElementById('tsa-league-stats-style')) {
    const _s = document.createElement('style');
    _s.id = 'tsa-league-stats-style';
    _s.textContent = `
            .tsa-stats-bar {
                display: flex; align-items: center; justify-content: space-between;
                flex-wrap: wrap; gap: var(--tmu-space-sm); padding: var(--tmu-space-sm) var(--tmu-space-md);
                border-bottom: 1px solid var(--tmu-border-soft-alpha-strong);
            }
            .tsa-stats-bar-mode { background: var(--tmu-surface-overlay-soft); padding: var(--tmu-space-sm) var(--tmu-space-md); }
            .tsa-stat-mode-btns { display: flex; gap: var(--tmu-space-xs); }
            .tsa-stat-btns { display: flex; flex-wrap: wrap; gap: var(--tmu-space-xs); }
            .tsa-stat-team-btns { display: flex; gap: var(--tmu-space-xs); }
            .tsa-stat-btn-active { background: var(--tmu-border-embedded) !important; color: var(--tmu-text-strong) !important; }
            .tsa-stats-table { width: 100%; border-collapse: collapse; font-size: var(--tmu-font-xs); color: var(--tmu-text-main); }
            .tsa-stats-table thead tr { background: var(--tmu-surface-overlay); position: sticky; top: 0; }
            .tsa-stats-table th {
                padding: var(--tmu-space-xs) var(--tmu-space-sm); color: var(--tmu-text-faint); font-size: var(--tmu-font-xs);
                text-transform: uppercase; letter-spacing: 0.5px;
                font-weight: 700; text-align: left;
                border-bottom: 1px solid var(--tmu-border-input-overlay); user-select: none;
            }
            .tsa-stats-table th[data-si]:hover { color: var(--tmu-text-main); }
            .tsa-stats-table th.tsa-stats-val { text-align: right; }
            .tsa-stats-table td { padding: var(--tmu-space-xs) var(--tmu-space-sm); border-bottom: 1px solid var(--tmu-border-soft-alpha); }
            .tsa-stats-table tbody tr:nth-child(even) { background: var(--tmu-surface-overlay-soft); }
            .tsa-stats-table tbody tr:hover { background: var(--tmu-success-fill-soft); }
            .tsa-stats-rank { color: var(--tmu-text-dim); width: 28px; text-align: right; padding-right: var(--tmu-space-sm) !important; }
            .tsa-stats-name a { color: var(--tmu-text-main); text-decoration: none; }
            .tsa-stats-name a:hover { color: var(--tmu-accent); }
            .tsa-stats-club { color: var(--tmu-text-faint); font-size: var(--tmu-font-xs); }
            .tsa-stats-val { text-align: right; font-weight: 700; color: var(--tmu-text-strong); }
            .tsa-stats-me { background: var(--tmu-success-fill-faint) !important; box-shadow: inset 3px 0 0 var(--tmu-success); }
            .tsa-stats-me .tsa-stats-name a { color: var(--tmu-accent); }
            .tsa-stats-me .tsa-stats-val { color: var(--tmu-success); }
            .tsa-tr-rec { text-align: center; font-weight: 700; font-size: var(--tmu-font-xs); }
            .tsa-tr-count { display: inline-block; margin-left: var(--tmu-space-sm); background: var(--tmu-surface-accent-soft); color: var(--tmu-text-strong); border-radius: var(--tmu-space-sm); padding: 0 var(--tmu-space-sm); font-size: var(--tmu-font-xs); }
            .tsa-tr-totals {
                display: flex; gap: var(--tmu-space-lg); justify-content: flex-end;
                padding: var(--tmu-space-sm) var(--tmu-space-md); font-size: var(--tmu-font-xs); color: var(--tmu-text-faint);
                border-top: 2px solid var(--tmu-border-faint); background: var(--tmu-surface-overlay-soft);
            }
        `;
    document.head.appendChild(_s);
}

const buttonHtml = ({ label, slot, cls = '', active = false, ...opts }) => TmButton.button({
    color: 'secondary',
    size: 'xs',
    label,
    slot,
    cls: `${cls}${active ? ' tsa-stat-btn-active' : ''}`,
    ...opts,
}).outerHTML;

const CLUB_STAT_COLS = {
    goals: ['Avg GF', 'Avg GA', 'Clean Sheets', 'No Goals Scored'],
    attendance: ['Home Avg', 'Away Avg', 'Total Avg'],
    injuries: ['Injuries', 'Total Days', 'Avg Days'],
    possession: ['Home %', 'Away %', 'Avg %'],
    cards: ['Yellow', 'Red', 'Total']
};

const parsePlayerStats = (html, teamIdx) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tab = doc.getElementById(teamIdx === 0 ? 'tab0' : 'tab1');
    if (!tab) return [];
    const rows = [];
    tab.querySelectorAll('tbody tr').forEach((tr, i) => {
        const tds = tr.querySelectorAll('td');
        if (tds.length < 3) return;
        const playerA = tds[0].querySelector('a[player_link]');
        const clubA = tds[1].querySelector('a[club_link]');
        const valText = tds[tds.length - 1].textContent.trim();
        rows.push({
            rank: i + 1,
            name: playerA ? playerA.textContent.trim() : tds[0].textContent.trim(),
            playerId: playerA ? playerA.getAttribute('player_link') : '',
            clubName: clubA ? clubA.textContent.trim() : '',
            clubId: clubA ? clubA.getAttribute('club_link') : '',
            val: parseFloat(valText) || 0,
            isMe: tr.classList.contains('highlighted_row')
        });
    });
    return rows;
};

const fetchPlayerStats = (stat, season, teamIdx, onDone) => {
    const s = window.TmLeagueCtx;
    const key = `${stat}|${season}|${teamIdx}`;
    if (s.statsCache[key]) { onDone(s.statsCache[key]); return; }
    const seasonStr = season ? `${season}/` : '';
    window.fetch(`/statistics/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/players/${stat}/${seasonStr}`)
        .then(r => r.text())
        .then(html => {
            const rows = parsePlayerStats(html, teamIdx);
            s.statsCache[key] = rows;
            onDone(rows);
        })
        .catch(() => onDone(null));
};

const parseClubStats = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tab = doc.getElementById('tab0') || doc.querySelector('.tab_container');
    if (!tab) return [];
    const rows = [];
    tab.querySelectorAll('tbody tr').forEach(tr => {
        const tds = tr.querySelectorAll('td');
        let clubTdIdx = -1, clubA = null;
        for (let i = 0; i < tds.length; i++) {
            const a = tds[i].querySelector('a[club_link]');
            if (a) { clubA = a; clubTdIdx = i; break; }
        }
        if (!clubA) return;
        const vals = [];
        for (let i = clubTdIdx + 1; i < tds.length; i++) vals.push(tds[i].textContent.trim());
        rows.push({
            clubName: clubA.textContent.trim(),
            clubId: clubA.getAttribute('club_link'),
            vals,
            isMe: tr.classList.contains('highlighted_row')
        });
    });
    return rows;
};

const fetchClubStats = (stat, season, onDone) => {
    const s = window.TmLeagueCtx;
    const key = `club|${stat}|${season}`;
    if (s.statsCache[key]) { onDone(s.statsCache[key]); return; }
    const seasonStr = season ? `${season}/` : '';
    window.fetch(`/statistics/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/clubs/${stat}/${seasonStr}`)
        .then(r => r.text())
        .then(html => {
            const rows = parseClubStats(html);
            s.statsCache[key] = rows;
            onDone(rows);
        })
        .catch(() => onDone(null));
};

const parseTransfers = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const myId = typeof SESSION !== 'undefined' ? String(SESSION.id) : null;
    const result = { bought: [], sold: [], totals: {} };
    let boughtTable = null, soldTable = null;
    doc.querySelectorAll('h3').forEach(h3 => {
        const text = h3.textContent.trim().toLowerCase();
        let next = h3.nextElementSibling;
        while (next && next.tagName !== 'TABLE') next = next.nextElementSibling;
        if (!next) return;
        if (text.includes('bought')) boughtTable = next;
        else if (text.includes('sold')) soldTable = next;
    });
    const parseRows = (table) => {
        if (!table) return [];
        const rows = [];
        table.querySelectorAll('tr').forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length < 4) return;
            const playerA = tds[0].querySelector('a[player_link]');
            if (!playerA) return;
            const recTd = tds[1];
            const clubA = tds[2].querySelector('a[club_link]');
            if (!clubA) return;
            const recVal = parseFloat(recTd.getAttribute('sortvalue')) || 0;
            const isRetired = recTd.textContent.trim() === 'Retired';
            const price = parseFloat(tds[3].textContent.trim().replace(/,/g, '')) || 0;
            const clubId = clubA.getAttribute('club_link');
            rows.push({
                name: playerA.textContent.trim(),
                playerId: playerA.getAttribute('player_link'),
                rec: recVal, isRetired,
                clubName: clubA.textContent.trim(),
                clubId, price,
                isMe: myId && clubId === myId
            });
        });
        return rows;
    };
    result.bought = parseRows(boughtTable);
    result.sold = parseRows(soldTable);
    doc.querySelectorAll('td').forEach(td => {
        const strong = td.querySelector('strong');
        if (!strong) return;
        const text = td.textContent;
        if (text.includes('Total Bought:')) result.totals.bought = strong.textContent.trim();
        else if (text.includes('Total Sold:')) result.totals.sold = strong.textContent.trim();
        else if (text.includes('Balance:')) result.totals.balance = strong.textContent.trim();
    });
    return result;
};

const fetchTransfers = (season, onDone) => {
    const s = window.TmLeagueCtx;
    const key = `transfers|${season}`;
    if (s.statsCache[key]) { onDone(s.statsCache[key]); return; }
    window.fetch(`/history/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/transfers/${season}/`)
        .then(r => r.text())
        .then(html => {
            const data = parseTransfers(html);
            s.statsCache[key] = data;
            onDone(data);
        })
        .catch(() => onDone(null));
};

const renderPlayerStatsTab = () => {
    const s = window.TmLeagueCtx;
    const container = document.getElementById('tsa-stats-content');
    if (!container) return;
    const season = s.displayedSeason !== null
        ? s.displayedSeason
        : (typeof SESSION !== 'undefined' ? SESSION.season : null);

    const playerStatDefs = [
        ['goals', 'Goals'], ['assists', 'Assists'], ['productivity', 'Productivity'],
        ['rating', 'Rating'], ['cards', 'Cards'], ['man-of-the-match', 'MoM']
    ];
    const clubStatDefs = [
        ['goals', 'Goals'], ['attendance', 'Attendance'],
        ['injuries', 'Injuries'], ['possession', 'Possession'], ['cards', 'Cards']
    ];
    const playerColLabels = {
        goals: 'Goals', assists: 'Assists', productivity: 'Pts',
        rating: 'Rating', cards: 'Cards', 'man-of-the-match': 'MoM'
    };

    const isPlayers = s.statsMode === 'players';
    const statDefs = isPlayers ? playerStatDefs : clubStatDefs;
    const curStat = isPlayers ? s.statsStatType : s.statsClubStat;

    const modeBtns = `
            <div class="tsa-stat-mode-btns">
                ${buttonHtml({ cls: 'tsa-stat-mode-btn', label: 'Players', active: isPlayers })}
                ${buttonHtml({ cls: 'tsa-stat-mode-btn', label: 'Clubs', active: !isPlayers })}
            </div>`;
    const statBtns = statDefs
        .map(([k, v]) => buttonHtml({ cls: 'tsa-stat-btn', label: v, active: curStat === k }))
        .join('');
    const teamToggle = isPlayers ? `
            <div class="tsa-stat-team-btns">
                ${buttonHtml({ cls: 'tsa-stat-team-btn', label: 'Main', active: s.statsTeamType === 0 })}
                ${buttonHtml({ cls: 'tsa-stat-team-btn', label: 'U21', active: s.statsTeamType === 1 })}
            </div>` : '';

    container.innerHTML = `
            <div class="tsa-stats-bar tsa-stats-bar-mode">${modeBtns}</div>
            <div class="tsa-stats-bar">
                <div class="tsa-stat-btns">${statBtns}</div>
                ${teamToggle}
            </div>
            <div id="tsa-stats-table-wrap">${TmUI.loading('Loading…')}</div>
        `;
    const modeButtons = container.querySelectorAll('.tsa-stat-mode-btn');
    if (modeButtons[0]) modeButtons[0].dataset.mode = 'players';
    if (modeButtons[1]) modeButtons[1].dataset.mode = 'clubs';
    container.querySelectorAll('.tsa-stat-btn').forEach((btn, index) => {
        btn.dataset.stat = statDefs[index]?.[0] || '';
    });
    container.querySelectorAll('.tsa-stat-team-btn').forEach((btn, index) => {
        btn.dataset.team = String(index);
    });
    container.onclick = (event) => {
        const modeButton = event.target.closest('.tsa-stat-mode-btn[data-mode]');
        if (modeButton && container.contains(modeButton)) {
            s.statsMode = modeButton.dataset.mode;
            renderPlayerStatsTab();
            return;
        }

        const statButton = event.target.closest('.tsa-stat-btn[data-stat]');
        if (statButton && container.contains(statButton)) {
            if (isPlayers) s.statsStatType = statButton.dataset.stat;
            else s.statsClubStat = statButton.dataset.stat;
            renderPlayerStatsTab();
            return;
        }

        const teamButton = event.target.closest('.tsa-stat-team-btn[data-team]');
        if (teamButton && container.contains(teamButton)) {
            s.statsTeamType = parseInt(teamButton.dataset.team, 10);
            renderPlayerStatsTab();
        }
    };

    if (isPlayers) {
        fetchPlayerStats(s.statsStatType, season, s.statsTeamType, rows => {
            const wrap = document.getElementById('tsa-stats-table-wrap');
            if (!wrap) return;
            if (!rows || !rows.length) { wrap.innerHTML = TmUI.empty('No player stats data'); return; }
            const colLabel = playerColLabels[s.statsStatType] || 'Value';
            const enriched = rows.map(r => ({ ...r, _sortVals: [r.rank, r.name, r.clubName, r.val] }));
            const buildRowsHtml = data => data.map(r => `
                    <tr class="${r.isMe ? 'tsa-stats-me' : ''}">
                        <td class="tsa-stats-rank">${r.rank}</td>
                        <td class="tsa-stats-name"><a href="/players/${r.playerId}/" target="_blank">${r.name}</a></td>
                        <td class="tsa-stats-club">${r.clubName}</td>
                        <td class="tsa-stats-val">${r.val}</td>
                    </tr>`).join('');
            TmLeagueTable.mountSortable(wrap, {
                headerRows: [[
                    { label: '#', sortIndex: 0 },
                    { label: 'Player', sortIndex: 1, style: 'text-align:left' },
                    { label: 'Club', sortIndex: 2, style: 'text-align:left' },
                    { label: colLabel, sortIndex: 3, className: 'tsa-stats-val' },
                ]],
                getRows: () => enriched,
                renderRows: buildRowsHtml,
            });
        });
    } else {
        fetchClubStats(s.statsClubStat, season, rows => {
            const wrap = document.getElementById('tsa-stats-table-wrap');
            if (!wrap) return;
            if (!rows || !rows.length) { wrap.innerHTML = TmUI.empty('No club stats data'); return; }
            const cols = CLUB_STAT_COLS[s.statsClubStat] || [];
            const enriched = rows.map(r => ({ ...r, _sortVals: [0, r.clubName, ...r.vals] }));
            enriched.sort((a, b) => (parseFloat(b._sortVals[2]) || 0) - (parseFloat(a._sortVals[2]) || 0));
            enriched.forEach((r, i) => { r._rank = i + 1; r._sortVals[0] = i + 1; });
            const buildRowsHtml = data => data.map((r, i) => {
                const valCells = r.vals.map(v => `<td class="tsa-stats-val">${v}</td>`).join('');
                return `<tr class="${r.isMe ? 'tsa-stats-me' : ''}">
                        <td class="tsa-stats-rank">${i + 1}</td>
                        <td class="tsa-stats-name"><a href="/club/${r.clubId}/" target="_blank">${r.clubName}</a></td>
                        ${valCells}
                    </tr>`;
            }).join('');
            TmLeagueTable.mountSortable(wrap, {
                headerRows: [[
                    { label: '#', sortIndex: 0 },
                    { label: 'Club', sortIndex: 1, style: 'text-align:left' },
                    ...cols.map((label, index) => ({ label, sortIndex: index + 2, className: 'tsa-stats-val' })),
                ]],
                getRows: () => enriched,
                renderRows: buildRowsHtml,
            });
        });
    }
};

const renderTransfersTab = () => {
    const s = window.TmLeagueCtx;
    const container = document.getElementById('tsa-transfers-content');
    if (!container) return;
    const season = s.displayedSeason !== null
        ? s.displayedSeason
        : (typeof SESSION !== 'undefined' ? SESSION.season : null);
    container.innerHTML = TmUI.loading(`Loading Season ${season} transfers…`);

    fetchTransfers(season, data => {
        if (!data) {
            container.innerHTML = TmUI.error('Failed to load transfers.');
            return;
        }
        const recColor = v => {
            if (v >= 18) return 'var(--tmu-success)';
            if (v >= 15) return 'var(--tmu-text-main)';
            if (v >= 12) return 'var(--tmu-warning)';
            return 'var(--tmu-text-disabled)';
        };
        const recDisplay = v => (v / 3.38).toFixed(2);
        const buildSection = (rows, clubLabel) => {
            const enriched = rows.map((r, i) => ({
                ...r, _sortVals: [i + 1, r.name, r.clubName, r.rec, r.price]
            }));
            const buildRowsHtml = data => data.map((r, i) => {
                const recCell = r.isRetired
                    ? `<td class="tsa-tr-rec" style="color:var(--tmu-text-dim);font-style:italic">Ret</td>`
                    : `<td class="tsa-tr-rec" style="color:${recColor(r.rec)}">${recDisplay(r.rec)}</td>`;
                return `<tr class="${r.isMe ? 'tsa-stats-me' : ''}">
                        <td class="tsa-stats-rank">${i + 1}</td>
                        <td class="tsa-stats-name"><a href="/players/${r.playerId}/" target="_blank">${r.name}</a></td>
                        ${recCell}
                        <td class="tsa-stats-club"><a href="/club/${r.clubId}/" target="_blank" style="color:${r.isMe ? 'var(--tmu-accent)' : 'var(--tmu-text-faint)'};text-decoration:none">${r.clubName}</a></td>
                        <td class="tsa-stats-val">${r.price.toFixed(1)}</td>
                    </tr>`;
            }).join('');
            return {
                enriched, buildRowsHtml, headerRows: [[
                    { label: '#', sortIndex: 0 },
                    { label: 'Player', sortIndex: 1, style: 'text-align:left' },
                    { label: 'Rec', sortIndex: 3, style: 'text-align:center' },
                    { label: clubLabel, sortIndex: 2, style: 'text-align:left' },
                    { label: 'Price (M)', sortIndex: 4, className: 'tsa-stats-val', dataLabel: 'Price' },
                ]]
            };
        };
        const bought = buildSection(data.bought, 'Buyer');
        const sold = buildSection(data.sold, 'Seller');

        const teamMap = {};
        const ensureClub = r => {
            if (!teamMap[r.clubId]) teamMap[r.clubId] = {
                clubId: r.clubId, clubName: r.clubName, isMe: r.isMe,
                bCount: 0, bTotal: 0, sCount: 0, sTotal: 0
            };
        };
        data.bought.forEach(r => { ensureClub(r); teamMap[r.clubId].bCount++; teamMap[r.clubId].bTotal += r.price; });
        data.sold.forEach(r => { ensureClub(r); teamMap[r.clubId].sCount++; teamMap[r.clubId].sTotal += r.price; });
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
                <td class="tsa-stats-name"><a href="/club/${g.clubId}/" target="_blank" style="color:${g.isMe ? 'var(--tmu-accent)' : 'var(--tmu-text-faint)'};text-decoration:none">${g.clubName}</a></td>
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
                    { label: '#', sortIndex: 0, rowspan: 2 },
                    { label: 'Club', sortIndex: 1, style: 'text-align:left', rowspan: 2 },
                    { label: '💰 Bought', colspan: 2, style: 'text-align:center;border-bottom:1px solid var(--tmu-border-success);color:var(--tmu-success)' },
                    { label: '💸 Sold', colspan: 2, style: 'text-align:center;border-bottom:1px solid var(--tmu-border-success);color:var(--tmu-success)' },
                    { label: 'Bal', sortIndex: 6, className: 'tsa-stats-val', rowspan: 2 },
                ],
                [
                    { label: 'Pl', sortIndex: 2, className: 'tsa-stats-val' },
                    { label: 'Total', sortIndex: 3, className: 'tsa-stats-val' },
                    { label: 'Pl', sortIndex: 4, className: 'tsa-stats-val' },
                    { label: 'Total', sortIndex: 5, className: 'tsa-stats-val' },
                ],
            ],
        };

        const bal = parseFloat((data.totals.balance || '').replace(/,/g, ''));
        const balColor = isNaN(bal) ? 'var(--tmu-text-main)' : (bal >= 0 ? 'var(--tmu-success)' : 'var(--tmu-danger)');
        const totalsHtml = data.totals.bought ? `
                <div class="tsa-tr-totals">
                    <span>Bought: <strong style="color:var(--tmu-text-main)">${data.totals.bought}M</strong></span>
                    <span>Sold: <strong style="color:var(--tmu-text-main)">${data.totals.sold}M</strong></span>
                    <span>Balance: <strong style="color:${balColor}">${data.totals.balance}M</strong></span>
                </div>` : '';

        container.innerHTML = `
                <div class="tsa-stats-bar tsa-stats-bar-mode">
                    <div class="tsa-stat-mode-btns">
                        ${buttonHtml({ cls: 'tsa-stat-mode-btn', active: s.transfersView === 'bought', slot: `💰 Bought <span class="tsa-tr-count">${data.bought.length}</span>` })}
                        ${buttonHtml({ cls: 'tsa-stat-mode-btn', active: s.transfersView === 'sold', slot: `💸 Sold <span class="tsa-tr-count">${data.sold.length}</span>` })}
                        ${buttonHtml({ cls: 'tsa-stat-mode-btn', active: s.transfersView === 'teams', slot: '🏟 Teams' })}
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
        TmLeagueTable.mountSortable(allWraps.bought, {
            headerRows: bought.headerRows,
            getRows: () => bought.enriched,
            renderRows: bought.buildRowsHtml,
        });
        TmLeagueTable.mountSortable(allWraps.sold, {
            headerRows: sold.headerRows,
            getRows: () => sold.enriched,
            renderRows: sold.buildRowsHtml,
        });
        TmLeagueTable.mountSortable(document.getElementById('tsa-tr-teams-inner'), {
            headerRows: teamData.headerRows,
            getRows: () => teamData.enriched,
            renderRows: teamData.buildRowsHtml,
        });
    });
};

export const TmLeagueStats = {
    renderPlayerStatsTab,
    renderTransfersTab
};
