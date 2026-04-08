import { TmButton } from './tm-button.js';
import { TmTable } from './tm-table.js';
import { TmUI } from './tm-ui.js';

const _clean = v => String(v ?? '').replace(/\s+/g, ' ').trim();

export function parsePlayerStatsHtml(html, teamIdx) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tab = doc.getElementById(`tab${teamIdx}`) || (teamIdx === 0 ? doc.querySelector('.tab_container') : null);
    if (!tab) return [];
    const rows = [];
    tab.querySelectorAll('tbody tr').forEach((tr, i) => {
        const tds = tr.querySelectorAll('td');
        if (tds.length < 3) return;
        const playerTd = tds[0];
        const playerA = playerTd.querySelector('a');
        const flagImg = playerTd.querySelector('img');
        const clubA = tds[1].querySelector('a');
        const playerId = playerA
            ? (playerA.getAttribute('player_link') || (playerA.getAttribute('href')?.match(/\/players\/(\d+)/) || [])[1] || '')
            : '';
        const clubId = clubA
            ? (clubA.getAttribute('club_link') || (clubA.getAttribute('href')?.match(/\/club\/(\d+)/) || [])[1] || '')
            : '';
        rows.push({
            rank: i + 1,
            name: _clean(playerA ? playerA.textContent : playerTd.textContent),
            playerId,
            flagHtml: flagImg ? flagImg.outerHTML : '',
            clubName: _clean(clubA ? clubA.textContent : (tds[1]?.textContent ?? '')),
            clubId,
            val: parseFloat(tds[tds.length - 1].textContent.trim()) || 0,
            isMe: tr.classList.contains('highlighted_row'),
        });
    });
    return rows;
}

export const PLAYER_STAT_DEFS = [
    ['goals', 'Goals'], ['assists', 'Assists'], ['productivity', 'Productivity'],
    ['rating', 'Rating'], ['cards', 'Cards'], ['man-of-the-match', 'MoM'],
];

export const PLAYER_COL_LABELS = {
    goals: 'Goals', assists: 'Assists', productivity: 'Pts',
    rating: 'Rating', cards: 'Cards', 'man-of-the-match': 'MoM',
};

if (!document.getElementById('tmu-psb-style')) {
    const s = document.createElement('style');
    s.id = 'tmu-psb-style';
    s.textContent = `.tmu-psb-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--tmu-space-sm);padding:var(--tmu-space-sm) 0;border-bottom:1px solid var(--tmu-border-soft-alpha-strong);margin-bottom:var(--tmu-space-sm)}.tmu-psb-btns,.tmu-psb-team{display:flex;flex-wrap:wrap;gap:var(--tmu-space-xs)}.tmu-psb-rank{color:var(--tmu-text-dim);width:28px;text-align:right;padding-right:var(--tmu-space-sm)!important}.tmu-psb-player a{color:var(--tmu-text-main);text-decoration:none}.tmu-psb-player a:hover{color:var(--tmu-accent)}.tmu-psb-val{text-align:right!important;font-weight:700;color:var(--tmu-text-strong)}.tmu-psb-me{background:var(--tmu-success-fill-faint)!important;box-shadow:inset 3px 0 0 var(--tmu-success)}.tmu-psb-me .tmu-psb-player a{color:var(--tmu-accent)}.tmu-psb-me .tmu-psb-val{color:var(--tmu-success)}`;
    document.head.appendChild(s);
}

export function mountPlayerStatsBrowser(container, {
    statDefs = [],
    initialStat,
    initialTeam = 0,
    showTeamToggle = true,
    teamLabels = ['Main', 'U21'],
    fetchFn,
    colLabel = {},
    onChange,
} = {}) {
    if (!container || !fetchFn) return;

    let activeStat = initialStat ?? statDefs[0]?.[0] ?? '';
    let activeTeam = initialTeam;
    const tableWrap = document.createElement('div');

    const refresh = () => {
        const bar = document.createElement('div');
        bar.className = 'tmu-psb-bar';

        const btns = document.createElement('div');
        btns.className = 'tmu-psb-btns';
        statDefs.forEach(([key, label]) =>
            btns.appendChild(TmButton.button({ color: 'secondary', size: 'xs', label, active: key === activeStat, attrs: { 'data-stat': key } }))
        );
        bar.appendChild(btns);

        if (showTeamToggle && teamLabels.length > 1) {
            const teamEl = document.createElement('div');
            teamEl.className = 'tmu-psb-team';
            teamLabels.forEach((label, i) =>
                teamEl.appendChild(TmButton.button({ color: 'secondary', size: 'xs', label, active: i === activeTeam, attrs: { 'data-team': String(i) } }))
            );
            bar.appendChild(teamEl);
        }

        bar.addEventListener('click', e => {
            const sb = e.target.closest('[data-stat]'), tb = e.target.closest('[data-team]');
            if (sb) { activeStat = sb.dataset.stat; onChange?.(activeStat, activeTeam); refresh(); }
            else if (tb) { activeTeam = +tb.dataset.team; onChange?.(activeStat, activeTeam); refresh(); }
        });

        const existing = container.querySelector('.tmu-psb-bar');
        if (existing) container.replaceChild(bar, existing);
        else { container.innerHTML = ''; container.appendChild(bar); container.appendChild(tableWrap); }

        const stat = activeStat, team = activeTeam;
        tableWrap.innerHTML = TmUI.loading('Loading…');
        fetchFn(stat, team, rows => {
            if (activeStat !== stat || activeTeam !== team) return;
            tableWrap.innerHTML = '';
            if (!rows?.length) { tableWrap.innerHTML = TmUI.empty('No player stats data'); return; }
            const label = typeof colLabel === 'function' ? colLabel(stat) : (colLabel[stat] ?? stat);
            const enriched = rows.map(r => ({ ...r, _sortVals: [r.rank, r.name, r.clubName ?? '', r.val] }));
            tableWrap.appendChild(TmTable.table({
                cls: 'tmu-tbl',
                items: enriched,
                groupHeaders: [{ cells: [
                    { label: '#',      key: 'sort-0', cls: 'r', style: 'width:40px' },
                    { label: 'Player', key: 'sort-1' },
                    { label: 'Club',   key: 'sort-2' },
                    { label,           key: 'sort-3', cls: 'r' },
                ]}],
                sortDefs: {
                    'sort-0': { defaultSortDir: -1, sort: (a, b) => (a._sortVals[0]||0) - (b._sortVals[0]||0) },
                    'sort-1': { defaultSortDir:  1, sort: (a, b) => String(a._sortVals[1]).localeCompare(String(b._sortVals[1])) },
                    'sort-2': { defaultSortDir:  1, sort: (a, b) => String(a._sortVals[2]).localeCompare(String(b._sortVals[2])) },
                    'sort-3': { defaultSortDir: -1, sort: (a, b) => (parseFloat(a._sortVals[3])||0) - (parseFloat(b._sortVals[3])||0) },
                },
                renderRowsHtml: data => data.map(r => `
                    <tr class="${r.isMe ? 'tmu-psb-me' : ''}">
                        <td class="tmu-psb-rank r">${r.rank}</td>
                        <td class="tmu-psb-player">${r.flagHtml ?? ''}<a href="/players/${r.playerId}/" target="_blank">${r.name}</a></td>
                        <td>${r.clubId ? `<a href="/club/${r.clubId}/" target="_blank" style="color:inherit;text-decoration:none">${r.clubName}</a>` : (r.clubName ?? '')}</td>
                        <td class="tmu-psb-val r">${r.val}</td>
                    </tr>`).join(''),
            }));
        });
    };

    refresh();
}
