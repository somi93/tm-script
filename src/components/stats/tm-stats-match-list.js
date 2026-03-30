import { TmTable } from '../shared/tm-table.js';

// tm-stats-match-list.js — Match list component for team tab
// API: TmStatsMatchList.build(matches) → HTMLElement
const MATCH_TYPE_LABELS = { league: 'League', friendly: 'Friendly', fl: 'FL', cup: 'Cup', other: 'Other' };

const buildTeamHtml = (teamId, teamName, isUs, alignRight = false) => `
    <span class="tsa-ml-team${alignRight ? ' tsa-ml-team-right' : ''}">
        <img class="tsa-ml-logo" src="/pics/club_logos/${teamId}_140.png" onerror="this.style.display='none'">
        <span class="tsa-ml-team-name${isUs ? ' is-us' : ''}">${teamName}</span>
    </span>
`;

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

        const table = TmTable.table({
            cls: ' tsa-ml-table',
            items: sorted,
            headers: [
                {
                    key: 'date',
                    label: 'Date',
                    sortable: false,
                    render: (_value, row) => `<span class="tsa-ml-date">${row.matchInfo.date || '-'}</span>`,
                },
                {
                    key: 'type',
                    label: 'Type',
                    sortable: false,
                    render: (_value, row) => {
                        const typeLabel = MATCH_TYPE_LABELS[row.matchType] || row.matchType;
                        return `<span class="tsa-ml-type">${typeLabel}</span>`;
                    },
                },
                {
                    key: 'home',
                    label: 'Home',
                    align: 'r',
                    sortable: false,
                    render: (_value, row) => buildTeamHtml(row.matchInfo.hometeam, row.matchInfo.hometeam_name, row.matchInfo.isHome, true),
                },
                {
                    key: 'vs',
                    label: '',
                    align: 'c',
                    sortable: false,
                    render: () => '<span class="tsa-ml-vs">vs</span>',
                },
                {
                    key: 'away',
                    label: 'Away',
                    sortable: false,
                    render: (_value, row) => buildTeamHtml(row.matchInfo.awayteam, row.matchInfo.awayteam_name, !row.matchInfo.isHome),
                },
                {
                    key: 'result',
                    label: 'Result',
                    sortable: false,
                    render: (_value, row) => {
                        const [homeGoals, awayGoals] = row.matchInfo.result.split('-').map(Number);
                        const ourGoals = row.matchInfo.isHome ? homeGoals : awayGoals;
                        const oppGoals = row.matchInfo.isHome ? awayGoals : homeGoals;
                        const resultCls = ourGoals > oppGoals ? 'win' : ourGoals < oppGoals ? 'loss' : 'draw';
                        return `<span class="tsa-ml-result ${resultCls}">${row.matchInfo.result}</span>`;
                    },
                },
                {
                    key: 'link',
                    label: '',
                    sortable: false,
                    render: (_value, row) => `<a class="tsa-ml-link" href="/matches/${row.matchInfo.id}/" target="_blank">▶</a>`,
                },
            ],
        });

        wrap.appendChild(table);
        return wrap;
    },
};
