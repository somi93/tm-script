/**
 * TmLeagueStats
 *
 * Handles player statistics, club statistics, and transfers: parse, fetch, render.
 * Reads and writes shared state via window.TmLeagueCtx.
 */

import { TmButton } from '../shared/tm-button.js';
import { TmLeagueTable } from './tm-league-table.js';
import { TmUI } from '../shared/tm-ui.js';
import { mountPlayerStatsBrowser, PLAYER_STAT_DEFS, PLAYER_COL_LABELS, parsePlayerStatsHtml } from '../shared/tm-player-stats-browser.js';

if (!document.getElementById('tsa-league-stats-style')) {
    const _s = document.createElement('style');
    _s.id = 'tsa-league-stats-style';
    _s.textContent = `
            .tsa-stats-bar {
                display: flex; align-items: center; justify-content: space-between;
                flex-wrap: wrap; gap: var(--tmu-space-sm); padding: var(--tmu-space-sm) var(--tmu-space-md);
                border-bottom: 1px solid var(--tmu-border-soft-alpha-strong);
            }
            .tsa-stat-btns { display: flex; flex-wrap: wrap; gap: var(--tmu-space-xs); }
            .tsa-stat-team-btns { display: flex; gap: var(--tmu-space-xs); }
            .tsa-stat-btn-active { background: var(--tmu-border-embedded) !important; color: var(--tmu-text-strong) !important; }
            .tsa-stats-rank { color: var(--tmu-text-dim); width: 28px; text-align: right; padding-right: var(--tmu-space-sm) !important; }
            .tsa-stats-name a { color: var(--tmu-text-main); text-decoration: none; }
            .tsa-stats-name a:hover { color: var(--tmu-accent); }
            .tsa-stats-val { text-align: right; font-weight: 700; color: var(--tmu-text-strong); }
            .tsa-stats-me { background: var(--tmu-success-fill-faint) !important; box-shadow: inset 3px 0 0 var(--tmu-success); }
            .tsa-stats-me .tsa-stats-name a { color: var(--tmu-accent); }
            .tsa-stats-me .tsa-stats-val { color: var(--tmu-success); }
            .tsa-tr-rec { text-align: right; }
            .tsa-tr-count { display: inline-block; margin-left: var(--tmu-space-sm); background: var(--tmu-text-inverse); color: var(--tmu-text-disabled); border-radius: var(--tmu-space-sm); padding: 0 var(--tmu-space-sm); font-size: var(--tmu-font-xs); }
            .tsa-tr-totals {
                display: flex; gap: var(--tmu-space-lg); justify-content: flex-end;
                padding: var(--tmu-space-sm) var(--tmu-space-md); font-size: var(--tmu-font-xs); color: var(--tmu-text-faint);
                border-top: 2px solid var(--tmu-border-faint); background: var(--tmu-surface-overlay-soft);
            }
        `;
    document.head.appendChild(_s);
}

const buttonHtml = ({ label, slot, cls = '', active = false, ...opts }) => TmButton.button({
    color: 'primary',
    size: 'sm',
    label,
    slot,
    cls,
    active,
    ...opts,
}).outerHTML;

const CLUB_STAT_COLS = {
    goals: ['Avg GF', 'Avg GA', 'Clean Sheets', 'No Goals Scored'],
    attendance: ['Home Avg', 'Away Avg', 'Total Avg'],
    injuries: ['Injuries', 'Total Days', 'Avg Days'],
    possession: ['Home %', 'Away %', 'Avg %'],
    cards: ['Yellow', 'Red', 'Total']
};

const CLUB_STAT_DEFS = [
    ['goals', 'Goals'], ['attendance', 'Attendance'],
    ['injuries', 'Injuries'], ['possession', 'Possession'], ['cards', 'Cards'],
];

const fetchPlayerStats = (stat, season, teamIdx, onDone) => {
    const s = window.TmLeagueCtx;
    const key = `${stat}|${season}|${teamIdx}`;
    if (s.statsCache[key]) { onDone(s.statsCache[key]); return; }
    const seasonStr = season ? `${season}/` : '';
    window.fetch(`/statistics/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/players/${stat}/${seasonStr}`)
        .then(r => r.text())
        .then(html => {
            const rows = parsePlayerStatsHtml(html, teamIdx);
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

const renderPlayerStatsTab = () => {
    const s = window.TmLeagueCtx;
    const container = document.getElementById('tsa-stats-content');
    if (!container) return;
    const season = s.displayedSeason !== null
        ? s.displayedSeason
        : (typeof SESSION !== 'undefined' ? SESSION.season : null);

    const isPlayers = s.statsMode === 'players';

    container.innerHTML = `
        <div class="tsa-stats-bar">
            <div>
                ${buttonHtml({ cls: 'tsa-stat-mode-btn', label: 'Players', active: isPlayers, attrs: { 'data-mode': 'players' } })}
                ${buttonHtml({ cls: 'tsa-stat-mode-btn', label: 'Clubs', active: !isPlayers, attrs: { 'data-mode': 'clubs' } })}
            </div>
        </div>
        <div id="tsa-stats-content-inner"></div>
    `;
    container.querySelector('.tsa-stats-bar').addEventListener('click', e => {
        const btn = e.target.closest('.tsa-stat-mode-btn[data-mode]');
        if (btn) { s.statsMode = btn.dataset.mode; renderPlayerStatsTab(); }
    });

    const inner = document.getElementById('tsa-stats-content-inner');
    if (!inner) return;

    if (isPlayers) {
        mountPlayerStatsBrowser(inner, {
            statDefs: PLAYER_STAT_DEFS,
            initialStat: s.statsStatType,
            initialTeam: s.statsTeamType,
            fetchFn: (stat, team, cb) => fetchPlayerStats(stat, season, team, cb),
            colLabel: PLAYER_COL_LABELS,
            onChange: (stat, team) => { s.statsStatType = stat; s.statsTeamType = team; },
        });
        return;
    }

    // ── Clubs mode ────────────────────────────────────────────────────────────
    const curStat = s.statsClubStat;
    inner.innerHTML = `
        <div class="tsa-stats-bar">
            <div class="tsa-stat-btns">
                ${CLUB_STAT_DEFS.map(([k, v]) => buttonHtml({ cls: 'tsa-stat-btn', label: v, active: curStat === k, attrs: { 'data-stat': k } })).join('')}
            </div>
        </div>
        <div id="tsa-stats-table-wrap">${TmUI.loading('Loading…')}</div>
    `;
    inner.querySelector('.tsa-stats-bar').addEventListener('click', e => {
        const btn = e.target.closest('.tsa-stat-btn[data-stat]');
        if (btn) { s.statsClubStat = btn.dataset.stat; renderPlayerStatsTab(); }
    });

    fetchClubStats(s.statsClubStat, season, rows => {
        const wrap = document.getElementById('tsa-stats-table-wrap');
        if (!wrap) return;
        if (!rows?.length) { wrap.innerHTML = TmUI.empty('No club stats data'); return; }
        const cols = CLUB_STAT_COLS[s.statsClubStat] || [];
        const enriched = rows.map(r => ({ ...r, _sortVals: [0, r.clubName, ...r.vals] }));
        enriched.sort((a, b) => (parseFloat(b._sortVals[2]) || 0) - (parseFloat(a._sortVals[2]) || 0));
        enriched.forEach((r, i) => { r._sortVals[0] = i + 1; });
        TmLeagueTable.mountSortable(wrap, {
            headerRows: [[
                { label: '#', sortIndex: 0, style: 'text-align:right' },
                { label: 'Club', sortIndex: 1, style: 'text-align:left' },
                ...cols.map((label, i) => ({ label, sortIndex: i + 2, className: 'tsa-stats-val', style: 'text-align:right' })),
            ]],
            getRows: () => enriched,
            renderRows: data => data.map((r, i) => `
                <tr class="${r.isMe ? 'tsa-stats-me' : ''}">
                    <td class="tsa-stats-rank">${i + 1}</td>
                    <td class="tsa-stats-name"><a href="/club/${r.clubId}/" target="_blank">${r.clubName}</a></td>
                    ${r.vals.map(v => `<td class="tsa-stats-val">${v}</td>`).join('')}
                </tr>`).join(''),
        });
    });
};
export const TmLeagueStats = { renderPlayerStatsTab };
