// tm-stats-match-list.js — Match list component for team tab
// API: TmStatsMatchList.build(matches) → HTMLElement
    const MATCH_TYPE_LABELS = { league: 'League', friendly: 'Friendly', fl: 'FL', cup: 'Cup', other: 'Other' };

    export const TmStatsMatchList = {
        build(matches) {
            const sorted = [...matches].sort((a, b) => {
                const da = a.matchInfo.date || '';
                const db = b.matchInfo.date || '';
                return db.localeCompare(da);
            });

            const wrap = document.createElement('div');
            wrap.className = 'tsa-match-list';

            const title = document.createElement('div');
            title.className = 'tsa-match-list-title';
            title.textContent = `Matches (${matches.length})`;
            wrap.appendChild(title);

            const table = document.createElement('table');
            table.className = 'tsa-ml-table';
            table.innerHTML = `<thead><tr>
                <th>Date</th><th>Type</th>
                <th colspan="3" style="text-align:center">Match</th>
                <th>Result</th><th></th>
            </tr></thead>`;

            const tbody = document.createElement('tbody');
            sorted.forEach(md => {
                const mi = md.matchInfo;
                const [h, a] = mi.result.split('-').map(Number);
                const ourGoals = mi.isHome ? h : a;
                const oppGoals = mi.isHome ? a : h;
                const resultCls = ourGoals > oppGoals ? 'win' : ourGoals < oppGoals ? 'loss' : 'draw';
                const typeLabel = MATCH_TYPE_LABELS[md.matchType] || md.matchType;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="tsa-ml-date">${mi.date || '-'}</td>
                    <td><span class="tsa-ml-type">${typeLabel}</span></td>
                    <td style="text-align:right"><span class="tsa-ml-team"><img class="tsa-ml-logo" src="/pics/club_logos/${mi.hometeam}_140.png" onerror="this.style.display='none'"><span class="tsa-ml-team-name${mi.isHome ? ' is-us' : ''}">${mi.hometeam_name}</span></span></td>
                    <td class="tsa-ml-vs" style="text-align:center">vs</td>
                    <td><span class="tsa-ml-team"><img class="tsa-ml-logo" src="/pics/club_logos/${mi.awayteam}_140.png" onerror="this.style.display='none'"><span class="tsa-ml-team-name${!mi.isHome ? ' is-us' : ''}">${mi.awayteam_name}</span></span></td>
                    <td><span class="tsa-ml-result ${resultCls}">${mi.result}</span></td>
                    <td><a class="tsa-ml-link" href="/matches/${mi.id}/" target="_blank">▶</a></td>
                `;
                tbody.appendChild(tr);
            });

            table.appendChild(tbody);
            wrap.appendChild(table);
            return wrap;
        },
    };
