/**
 * TmLeagueStats
 *
 * Handles player statistics, club statistics, and transfers: parse, fetch, render.
 * Reads and writes shared state via window.TmLeagueCtx.
 */

    if (!document.getElementById('tsa-league-stats-style')) {
        const _s = document.createElement('style');
        _s.id = 'tsa-league-stats-style';
        _s.textContent = `
            .tsa-stats-bar {
                display: flex; align-items: center; justify-content: space-between;
                flex-wrap: wrap; gap: 6px; padding: 8px 10px;
                border-bottom: 1px solid rgba(61,104,40,0.3);
            }
            .tsa-stats-bar-mode { background: rgba(0,0,0,0.15); padding: 6px 10px; }
            .tsa-stat-mode-btns { display: flex; gap: 4px; }
            .tsa-stat-mode-btn {
                padding: 3px 14px; background: rgba(61,104,40,0.3);
                border: 1px solid rgba(61,104,40,0.5); border-radius: 4px;
                color: #7aaa60; font-size: 10px; font-weight: 700;
                letter-spacing: 0.5px; text-transform: uppercase;
                cursor: pointer; transition: background 0.15s, color 0.15s;
            }
            .tsa-stat-mode-btn:hover { background: rgba(61,104,40,0.6); color: #c8e0b4; }
            .tsa-stat-btns { display: flex; flex-wrap: wrap; gap: 4px; }
            .tsa-stat-team-btns { display: flex; gap: 4px; }
            .tsa-stat-btn, .tsa-stat-team-btn {
                padding: 3px 9px; background: rgba(61,104,40,0.3);
                border: 1px solid rgba(61,104,40,0.5); border-radius: 4px;
                color: #7aaa60; font-size: 10px; font-weight: 700;
                letter-spacing: 0.4px; text-transform: uppercase;
                cursor: pointer; transition: background 0.15s, color 0.15s;
            }
            .tsa-stat-btn:hover, .tsa-stat-team-btn:hover { background: rgba(61,104,40,0.6); color: #c8e0b4; }
            .tsa-stat-btn-active { background: #3d6828 !important; color: #e8f5d8 !important; border-color: #6cc040 !important; }
            .tsa-stats-scroll { overflow-y: auto; }
            .tsa-stats-table { width: 100%; border-collapse: collapse; font-size: 11px; color: #c8e0b4; }
            .tsa-stats-table thead tr { background: rgba(0,0,0,0.25); position: sticky; top: 0; }
            .tsa-stats-table th {
                padding: 5px 8px; color: #6a9a58; font-size: 10px;
                text-transform: uppercase; letter-spacing: 0.5px;
                font-weight: 700; text-align: left;
                border-bottom: 1px solid rgba(61,104,40,0.4); user-select: none;
            }
            .tsa-stats-table th[data-si]:hover { color: #c8e0b4; }
            .tsa-stats-table th.tsa-stats-val { text-align: right; }
            .tsa-stats-table td { padding: 4px 8px; border-bottom: 1px solid rgba(61,104,40,0.15); }
            .tsa-stats-table tbody tr:nth-child(even) { background: rgba(0,0,0,0.15); }
            .tsa-stats-table tbody tr:hover { background: rgba(61,104,40,0.2); }
            .tsa-stats-rank { color: #5a7a48; width: 28px; text-align: right; padding-right: 6px !important; }
            .tsa-stats-name a { color: #c8e0b4; text-decoration: none; }
            .tsa-stats-name a:hover { color: #6cc040; }
            .tsa-stats-club { color: #6a9a58; font-size: 10px; }
            .tsa-stats-val { text-align: right; font-weight: 700; color: #e8f5d8; }
            .tsa-stats-me { background: rgba(108,192,64,0.10) !important; box-shadow: inset 3px 0 0 rgba(108,192,64,0.55); }
            .tsa-stats-me .tsa-stats-name a { color: #8fdc60; }
            .tsa-stats-me .tsa-stats-val { color: #6cc040; }
            .tsa-tr-rec { text-align: center; font-weight: 700; font-size: 11px; }
            .tsa-tr-section { margin-bottom: 2px; }
            .tsa-tr-head {
                padding: 6px 10px; font-size: 11px; font-weight: 700;
                color: #6a9a58; text-transform: uppercase; letter-spacing: 0.5px;
                background: rgba(0,0,0,0.2); border-top: 1px solid rgba(61,104,40,0.3);
            }
            .tsa-tr-count { display: inline-block; margin-left: 6px; background: rgba(61,104,40,0.35); color: #c8e0b4; border-radius: 8px; padding: 0 6px; font-size: 10px; }
            .tsa-tr-totals {
                display: flex; gap: 16px; justify-content: flex-end;
                padding: 8px 12px; font-size: 11px; color: #6a9a58;
                border-top: 2px solid rgba(61,104,40,0.4); background: rgba(0,0,0,0.15);
            }
        `;
        document.head.appendChild(_s);
    }

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
                <button class="tsa-stat-mode-btn${isPlayers ? ' tsa-stat-btn-active' : ''}" data-mode="players">Players</button>
                <button class="tsa-stat-mode-btn${!isPlayers ? ' tsa-stat-btn-active' : ''}" data-mode="clubs">Clubs</button>
            </div>`;
        const statBtns = statDefs
            .map(([k, v]) => `<button class="tsa-stat-btn${curStat === k ? ' tsa-stat-btn-active' : ''}" data-stat="${k}">${v}</button>`)
            .join('');
        const teamToggle = isPlayers ? `
            <div class="tsa-stat-team-btns">
                <button class="tsa-stat-team-btn${s.statsTeamType === 0 ? ' tsa-stat-btn-active' : ''}" data-team="0">Main</button>
                <button class="tsa-stat-team-btn${s.statsTeamType === 1 ? ' tsa-stat-btn-active' : ''}" data-team="1">U21</button>
            </div>` : '';

        container.innerHTML = `
            <div class="tsa-stats-bar tsa-stats-bar-mode">${modeBtns}</div>
            <div class="tsa-stats-bar">
                <div class="tsa-stat-btns">${statBtns}</div>
                ${teamToggle}
            </div>
            <div id="tsa-stats-table-wrap"><div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">Loading…</div></div>
        `;
        container.querySelectorAll('.tsa-stat-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => { s.statsMode = btn.dataset.mode; renderPlayerStatsTab(); });
        });
        container.querySelectorAll('.tsa-stat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (isPlayers) s.statsStatType = btn.dataset.stat;
                else s.statsClubStat = btn.dataset.stat;
                renderPlayerStatsTab();
            });
        });
        container.querySelectorAll('.tsa-stat-team-btn').forEach(btn => {
            btn.addEventListener('click', () => { s.statsTeamType = parseInt(btn.dataset.team); renderPlayerStatsTab(); });
        });

        const attachStatsSort = (wrap, getRows, buildHtml) => {
            let sortCol = -1, sortAsc = true;
            const render = () => {
                const sorted = [...getRows()];
                if (sortCol >= 0) {
                    sorted.sort((a, b) => {
                        const va = parseFloat(a._sortVals[sortCol]);
                        const vb = parseFloat(b._sortVals[sortCol]);
                        if (!isNaN(va) && !isNaN(vb)) return sortAsc ? va - vb : vb - va;
                        return sortAsc
                            ? String(a._sortVals[sortCol]).localeCompare(String(b._sortVals[sortCol]))
                            : String(b._sortVals[sortCol]).localeCompare(String(a._sortVals[sortCol]));
                    });
                }
                const tbody = wrap.querySelector('tbody');
                if (tbody) tbody.innerHTML = buildHtml(sorted);
                wrap.querySelectorAll('thead th[data-si]').forEach(th => {
                    const si = parseInt(th.dataset.si);
                    th.textContent = th.dataset.label + (si === sortCol ? (sortAsc ? ' ▲' : ' ▼') : '');
                });
            };
            wrap.querySelectorAll('thead th[data-si]').forEach(th => {
                th.style.cursor = 'pointer';
                const si = parseInt(th.dataset.si);
                th.addEventListener('click', () => {
                    if (sortCol === si) sortAsc = !sortAsc;
                    else { sortCol = si; sortAsc = (si === 1 || si === 2); }
                    render();
                });
            });
        };

        if (isPlayers) {
            fetchPlayerStats(s.statsStatType, season, s.statsTeamType, rows => {
                const wrap = document.getElementById('tsa-stats-table-wrap');
                if (!wrap) return;
                if (!rows || !rows.length) { wrap.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">No data.</div>`; return; }
                const colLabel = playerColLabels[s.statsStatType] || 'Value';
                const enriched = rows.map(r => ({ ...r, _sortVals: [r.rank, r.name, r.clubName, r.val] }));
                const buildRowsHtml = data => data.map(r => `
                    <tr class="${r.isMe ? 'tsa-stats-me' : ''}">
                        <td class="tsa-stats-rank">${r.rank}</td>
                        <td class="tsa-stats-name"><a href="/players/${r.playerId}/" target="_blank">${r.name}</a></td>
                        <td class="tsa-stats-club">${r.clubName}</td>
                        <td class="tsa-stats-val">${r.val}</td>
                    </tr>`).join('');
                wrap.innerHTML = `<div class="tsa-stats-scroll"><table class="tsa-stats-table">
                    <thead><tr>
                        <th data-si="0" data-label="#">#</th>
                        <th data-si="1" data-label="Player" style="text-align:left">Player</th>
                        <th data-si="2" data-label="Club" style="text-align:left">Club</th>
                        <th data-si="3" data-label="${colLabel}" class="tsa-stats-val">${colLabel}</th>
                    </tr></thead>
                    <tbody>${buildRowsHtml(enriched)}</tbody>
                </table></div>`;
                attachStatsSort(wrap, () => enriched, buildRowsHtml);
            });
        } else {
            fetchClubStats(s.statsClubStat, season, rows => {
                const wrap = document.getElementById('tsa-stats-table-wrap');
                if (!wrap) return;
                if (!rows || !rows.length) { wrap.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">No data.</div>`; return; }
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
                const headCols = cols.map((c, ci) =>
                    `<th data-si="${ci + 2}" data-label="${c}" class="tsa-stats-val">${c}</th>`).join('');
                wrap.innerHTML = `<div class="tsa-stats-scroll"><table class="tsa-stats-table">
                    <thead><tr>
                        <th data-si="0" data-label="#">#</th>
                        <th data-si="1" data-label="Club" style="text-align:left">Club</th>
                        ${headCols}
                    </tr></thead>
                    <tbody>${buildRowsHtml(enriched)}</tbody>
                </table></div>`;
                attachStatsSort(wrap, () => enriched, buildRowsHtml);
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
        container.innerHTML = `<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">Loading Season ${season} transfers…</div>`;

        fetchTransfers(season, data => {
            if (!data) {
                container.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">Failed to load transfers.</div>`;
                return;
            }
            const recColor = v => {
                if (v >= 18) return '#6cc040';
                if (v >= 15) return '#c8e0b4';
                if (v >= 12) return '#fbbf24';
                return '#9ca3af';
            };
            const recDisplay = v => (v / 3.38).toFixed(2);
            const attachSort = (wrap, getRows, buildHtml) => {
                let sortCol = -1, sortAsc = true;
                const render = () => {
                    const sorted = [...getRows()];
                    if (sortCol >= 0) {
                        sorted.sort((a, b) => {
                            const va = parseFloat(a._sortVals[sortCol]);
                            const vb = parseFloat(b._sortVals[sortCol]);
                            if (!isNaN(va) && !isNaN(vb)) return sortAsc ? va - vb : vb - va;
                            return sortAsc
                                ? String(a._sortVals[sortCol]).localeCompare(String(b._sortVals[sortCol]))
                                : String(b._sortVals[sortCol]).localeCompare(String(a._sortVals[sortCol]));
                        });
                    }
                    const tbody = wrap.querySelector('tbody');
                    if (tbody) tbody.innerHTML = buildHtml(sorted);
                    wrap.querySelectorAll('thead th[data-si]').forEach(th => {
                        const si = parseInt(th.dataset.si);
                        th.textContent = th.dataset.label + (si === sortCol ? (sortAsc ? ' ▲' : ' ▼') : '');
                    });
                };
                wrap.querySelectorAll('thead th[data-si]').forEach(th => {
                    const si = parseInt(th.dataset.si);
                    th.style.cursor = 'pointer';
                    th.addEventListener('click', () => {
                        if (sortCol === si) sortAsc = !sortAsc;
                        else { sortCol = si; sortAsc = (si === 1 || si === 2); }
                        render();
                    });
                });
            };
            const buildSection = (rows, clubLabel) => {
                const enriched = rows.map((r, i) => ({
                    ...r, _sortVals: [i + 1, r.name, r.clubName, r.rec, r.price]
                }));
                const buildRowsHtml = data => data.map((r, i) => {
                    const recCell = r.isRetired
                        ? `<td class="tsa-tr-rec" style="color:#5a7a48;font-style:italic">Ret</td>`
                        : `<td class="tsa-tr-rec" style="color:${recColor(r.rec)}">${recDisplay(r.rec)}</td>`;
                    return `<tr class="${r.isMe ? 'tsa-stats-me' : ''}">
                        <td class="tsa-stats-rank">${i + 1}</td>
                        <td class="tsa-stats-name"><a href="/players/${r.playerId}/" target="_blank">${r.name}</a></td>
                        ${recCell}
                        <td class="tsa-stats-club"><a href="/club/${r.clubId}/" target="_blank" style="color:${r.isMe ? '#8fdc60' : '#6a9a58'};text-decoration:none">${r.clubName}</a></td>
                        <td class="tsa-stats-val">${r.price.toFixed(1)}</td>
                    </tr>`;
                }).join('');
                const html = `<div class="tsa-stats-scroll"><table class="tsa-stats-table">
                    <thead><tr>
                        <th data-si="0" data-label="#">#</th>
                        <th data-si="1" data-label="Player" style="text-align:left">Player</th>
                        <th data-si="3" data-label="Rec" style="text-align:center">Rec</th>
                        <th data-si="2" data-label="${clubLabel}" style="text-align:left">${clubLabel}</th>
                        <th data-si="4" data-label="Price" class="tsa-stats-val">Price (M)</th>
                    </tr></thead>
                    <tbody>${buildRowsHtml(enriched)}</tbody>
                </table></div>`;
                return { enriched, buildRowsHtml, html };
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
                const balCol = bal > 0 ? '#6cc040' : bal < 0 ? '#ef4444' : '#c8e0b4';
                return `<tr class="${g.isMe ? 'tsa-stats-me' : ''}">
                    <td class="tsa-stats-rank">${i + 1}</td>
                    <td class="tsa-stats-name"><a href="/club/${g.clubId}/" target="_blank" style="color:${g.isMe ? '#8fdc60' : '#6a9a58'};text-decoration:none">${g.clubName}</a></td>
                    <td class="tsa-stats-val">${g.bCount}</td>
                    <td class="tsa-stats-val">${g.bTotal.toFixed(1)}</td>
                    <td class="tsa-stats-val">${g.sCount}</td>
                    <td class="tsa-stats-val">${g.sTotal.toFixed(1)}</td>
                    <td class="tsa-stats-val" style="color:${balCol};font-weight:700">${bal >= 0 ? '+' : ''}${bal.toFixed(1)}</td>
                </tr>`;
            }).join('');
            const teamsHtml = `<div class="tsa-stats-scroll"><table class="tsa-stats-table">
                <thead>
                    <tr>
                        <th rowspan="2" data-si="0" data-label="#">#</th>
                        <th rowspan="2" data-si="1" data-label="Club" style="text-align:left">Club</th>
                        <th colspan="2" style="text-align:center;border-bottom:1px solid rgba(108,192,64,0.2);color:#6cc040">💰 Bought</th>
                        <th colspan="2" style="text-align:center;border-bottom:1px solid rgba(108,192,64,0.2);color:#6cc040">💸 Sold</th>
                        <th rowspan="2" data-si="6" data-label="Bal" class="tsa-stats-val">Bal</th>
                    </tr>
                    <tr>
                        <th data-si="2" data-label="Pl" class="tsa-stats-val">Pl</th>
                        <th data-si="3" data-label="Total" class="tsa-stats-val">Total</th>
                        <th data-si="4" data-label="Pl" class="tsa-stats-val">Pl</th>
                        <th data-si="5" data-label="Total" class="tsa-stats-val">Total</th>
                    </tr>
                </thead>
                <tbody>${buildTeamRowsHtml(teamEnriched)}</tbody>
            </table></div>`;
            const teamData = { enriched: teamEnriched, buildRowsHtml: buildTeamRowsHtml, html: teamsHtml };

            const bal = parseFloat((data.totals.balance || '').replace(/,/g, ''));
            const balColor = isNaN(bal) ? '#c8e0b4' : (bal >= 0 ? '#6cc040' : '#ef4444');
            const totalsHtml = data.totals.bought ? `
                <div class="tsa-tr-totals">
                    <span>Bought: <strong style="color:#c8e0b4">${data.totals.bought}M</strong></span>
                    <span>Sold: <strong style="color:#c8e0b4">${data.totals.sold}M</strong></span>
                    <span>Balance: <strong style="color:${balColor}">${data.totals.balance}M</strong></span>
                </div>` : '';

            container.innerHTML = `
                <div class="tsa-stats-bar tsa-stats-bar-mode">
                    <div class="tsa-stat-mode-btns">
                        <button class="tsa-stat-mode-btn${s.transfersView === 'bought' ? ' tsa-stat-btn-active' : ''}" data-tv="bought">💰 Bought <span class="tsa-tr-count">${data.bought.length}</span></button>
                        <button class="tsa-stat-mode-btn${s.transfersView === 'sold' ? ' tsa-stat-btn-active' : ''}" data-tv="sold">💸 Sold <span class="tsa-tr-count">${data.sold.length}</span></button>
                        <button class="tsa-stat-mode-btn${s.transfersView === 'teams' ? ' tsa-stat-btn-active' : ''}" data-tv="teams">🏟 Teams</button>
                    </div>
                </div>
                <div id="tsa-tr-bought-wrap" style="display:${s.transfersView === 'bought' ? '' : 'none'}">${bought.html}</div>
                <div id="tsa-tr-sold-wrap" style="display:${s.transfersView === 'sold' ? '' : 'none'}">${sold.html}</div>
                <div id="tsa-tr-teams-wrap" style="display:${s.transfersView === 'teams' ? '' : 'none'}">
                    <div id="tsa-tr-teams-inner">${teamData.html}</div>
                </div>
                ${totalsHtml}
            `;
            const allWraps = {
                bought: document.getElementById('tsa-tr-bought-wrap'),
                sold: document.getElementById('tsa-tr-sold-wrap'),
                teams: document.getElementById('tsa-tr-teams-wrap'),
            };
            container.querySelectorAll('.tsa-stat-mode-btn[data-tv]').forEach(btn => {
                btn.addEventListener('click', () => {
                    s.transfersView = btn.dataset.tv;
                    container.querySelectorAll('.tsa-stat-mode-btn[data-tv]').forEach(b =>
                        b.classList.toggle('tsa-stat-btn-active', b.dataset.tv === s.transfersView));
                    Object.entries(allWraps).forEach(([k, el]) => { if (el) el.style.display = k === s.transfersView ? '' : 'none'; });
                });
            });
            attachSort(allWraps.bought, () => bought.enriched, bought.buildRowsHtml);
            attachSort(allWraps.sold, () => sold.enriched, sold.buildRowsHtml);
            attachSort(document.getElementById('tsa-tr-teams-inner'), () => teamData.enriched, teamData.buildRowsHtml);
        });
    };

    export const TmLeagueStats = {
        CLUB_STAT_COLS,
        parsePlayerStats,
        fetchPlayerStats,
        parseClubStats,
        fetchClubStats,
        parseTransfers,
        fetchTransfers,
        renderPlayerStatsTab,
        renderTransfersTab
    };
