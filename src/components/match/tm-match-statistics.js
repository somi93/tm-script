import { TmConst } from '../../lib/tm-constants.js';
import { TmMatchPlayerStatsTable } from './tm-match-player-stats-table.js';
import { TmTable } from '../shared/tm-table.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmMatchAccordion } from './tm-match-accordion.js';
import { TmMatchReport } from './tm-match-report.js';
import { showPlayerDialog } from './tm-match-player-dialog.js';

// ── Stat bar row helper ─────────────────────────────────────────────────────
const _barRow = (label, hVal, aVal, highlight = false) => {
    return TmUI.compareStat({
        label,
        leftValue: String(hVal),
        rightValue: String(aVal),
        leftTone: 'home',
        rightTone: 'away',
        size: 'md',
        highlight,
        cls: highlight ? 'rnd-stat-highlight' : '',
    });
};

// ── Section 1: Team header ───────────────────────────────────────────────────
const _buildTeamHeader = (homeClub, awayClub, homeId, awayId) => {
    const homeLogo = `/pics/club_logos/${homeId}_140.png`;
    const awayLogo = `/pics/club_logos/${awayId}_140.png`;
    let h = '<div class="rnd-stats-team-header">';
    h += `<div class="rnd-stats-team-side home"><img class="rnd-stats-team-logo" src="${homeLogo}" onerror="this.style.display='none'"><span class="rnd-stats-team-name">${homeClub}</span></div>`;
    h += '<span class="rnd-stats-vs">vs</span>';
    h += `<div class="rnd-stats-team-side away"><img class="rnd-stats-team-logo" src="${awayLogo}" onerror="this.style.display='none'"><span class="rnd-stats-team-name">${awayClub}</span></div>`;
    h += '</div>';
    return h;
};

// ── Section 2: Stat bars ─────────────────────────────────────────────────────
const _buildStatBars = (hStats, aStats, md, matchEnded) => {
    let h = '';
    if (md.possession && matchEnded) {
        h += _barRow('Possession', md.possession.home + '%', md.possession.away + '%', true);
    }
    h += '<div class="rnd-stat-divider"></div>';
    h += _barRow('Shots', hStats.shots, aStats.shots);
    h += _barRow('On Target', hStats.shotsOnTarget, aStats.shotsOnTarget);
    h += '<div class="rnd-stat-divider"></div>';
    h += _barRow('Yellow Cards', hStats.yellowCards, aStats.yellowCards);
    h += _barRow('Red Cards', hStats.redCards, aStats.redCards);
    const hPen = hStats.advanced?.Penalties?.a || 0;
    const aPen = aStats.advanced?.Penalties?.a || 0;
    if (hPen || aPen) {
        h += '<div class="rnd-stat-divider"></div>';
        h += _barRow('Penalties', hPen, aPen);
    }
    return h;
};

// ── Section 3: Attacking styles ──────────────────────────────────────────────
const _buildAdvTable = (teamName, adv, sideClass, liveState) => {
    const { STYLE_ORDER } = TmConst;

    const wrap = document.createElement('div');
    const label = document.createElement('div');
    label.className = 'rnd-adv-team-label';
    label.style.color = sideClass === 'home' ? 'var(--tmu-success)' : 'var(--tmu-info)';
    label.textContent = teamName;
    wrap.appendChild(label);

    let totA = 0;
    let totL = 0;
    let totSh = 0;
    let totG = 0;
    const rows = STYLE_ORDER.map(style => {
        const data = adv[style] || { a: 0, sh: 0, l: 0, g: 0, events: [] };
        totA += data.a;
        totL += data.l;
        totSh += data.sh;
        totG += data.g;
        return { style, ...data };
    });

    const cls = (value, type) => value === 0 ? 'adv-zero' : type;
    const table = TmTable.table({
        cls: ' rnd-adv-table',
        items: rows,
        headers: [
            { key: 'style', label: 'Style', sortable: false },
            { key: 'a', label: 'Att', sortable: false },
            { key: 'sh', label: 'Reached', sortable: false, title: 'Attacks that reached a shot' },
            { key: 'l', label: 'Lost', sortable: false, title: 'Possession lost before shot' },
            { key: 'g', label: 'Goal', sortable: false },
            { key: 'reachedPct', label: 'Reached%', sortable: false, title: 'Attacks through to shot / Total' },
            { key: 'convPct', label: 'Conv%', sortable: false, title: 'Goals / Total attacks' },
        ],
        renderRowsHtml: (sortedRows) => {
            let html = '';
            sortedRows.forEach(row => {
                const pct = row.a ? Math.round(row.g / row.a * 100) + '%' : '-';
                const reachedPct = row.a ? Math.round(row.sh / row.a * 100) + '%' : '-';
                const rowId = `adv-${sideClass}-${row.style.replace(/\s/g, '-')}`;
                const hasEvents = row.events.length > 0;
                html += `<tr class="rnd-adv-row${hasEvents ? '' : ' rnd-adv-total'}"${hasEvents ? ` data-adv-target="${rowId}"` : ''}>`;
                html += `<td>${row.style}${hasEvents ? ' <span class="adv-arrow">&#9654;</span>' : ''}</td>`;
                html += `<td class="${cls(row.a, '')}">${row.a}</td>`;
                html += `<td class="${cls(row.sh, 'adv-shot')}">${row.sh}</td>`;
                html += `<td class="${cls(row.l, 'adv-lost')}">${row.l}</td>`;
                html += `<td class="${cls(row.g, 'adv-goal')}">${row.g}</td>`;
                html += `<td class="${cls(row.sh, '')}">${reachedPct}</td>`;
                html += `<td class="${cls(row.a ? row.g : 0, '')}">${pct}</td>`;
                html += '</tr>';
                if (hasEvents) {
                    html += `<tr class="rnd-adv-events" id="${rowId}"><td colspan="7"><div class="rnd-adv-evt-list">`;
                    row.events.forEach(event => {
                        html += `<div class="rnd-adv-evt"><span class="adv-result-tag ${event.result}">${event.result}</span>${TmMatchReport.buildEventHtml(event.evt, event.min, liveState)}</div>`;
                    });
                    html += '</div></td></tr>';
                }
            });

            const totPct = totA ? Math.round(totG / totA * 100) + '%' : '-';
            const totReachedPct = totA ? Math.round(totSh / totA * 100) + '%' : '-';
            html += `<tr class="rnd-adv-row rnd-adv-total"><td>Total</td><td>${totA}</td><td>${totSh}</td><td>${totL}</td><td>${totG}</td><td>${totReachedPct}</td><td>${totPct}</td></tr>`;
            return html;
        },
    });

    wrap.appendChild(table);
    return wrap;
};

const _injectAttackingStyles = (bodyEl, homeAdv, awayAdv, homeClub, awayClub, liveState) => {
    const host = bodyEl.querySelector('#rnd-adv-styles');
    if (!host) return;

    const section = document.createElement('div');
    section.className = 'rnd-adv-section';
    section.innerHTML = '<div class="rnd-adv-title">Attacking Styles</div>';
    section.appendChild(_buildAdvTable(homeClub, homeAdv, 'home', liveState));
    section.appendChild(_buildAdvTable(awayClub, awayAdv, 'away', liveState));
    host.appendChild(section);
};

// ── Section 4: Player statistics ─────────────────────────────────────────────
const _toTablePlayer = (p) => {
    const statsMap = Object.fromEntries((p.grouped || []).map(c => [c.key, c.count]));
    const totalPasses = (statsMap.passesCompleted || 0) + (statsMap.passesFailed || 0);
    const originalPosition = p.originalPosition || p.position || '';
    const currentPosition = p.position || '';
    const subIn = !!statsMap.subIn;
    const subOut = !!statsMap.subOut;
    let displayPosition = currentPosition;
    if (subOut && originalPosition && !/^sub\d+$/.test(originalPosition)) {
        displayPosition = originalPosition;
    } else if (subIn) {
        displayPosition = !/^sub\d+$/.test(currentPosition)
            ? currentPosition
            : ((p.fp || '').split(',')[0] || originalPosition || currentPosition);
    } else if (/^sub\d+$/.test(currentPosition) && !/^sub\d+$/.test(originalPosition)) {
        displayPosition = originalPosition;
    }
    return {
        pid: String(p.id || p.player_id),
        name: p.nameLast || p.name || String(p.id || p.player_id),
        position: p.position || '',
        displayPosition,
        isGK: displayPosition === 'gk' || p.position === 'gk',
        matches: 1,
        minutes: p.minsPlayed || 0,
        rating: p.rating ? Number(p.rating) : 0,
        subIn,
        subOut,
        totalPasses,
        ...Object.fromEntries(TmConst.PLAYER_STAT_COLS.map(c => [c.key, statsMap[c.key] || 0])),
    };
};

const _posOrder = (pos) => {
    const key = String(pos || '').toLowerCase().replace(/[^a-z]/g, '');
    return TmConst.POSITION_MAP?.[key]?.ordering ?? 99;
};

const _injectPlayerStats = (homeTeam, awayTeam, bodyEl, liveState) => {
    const allPlayers = [...homeTeam.lineup, ...awayTeam.lineup];
    const openPlayerDialog = (tablePlayer) => {
        const player = allPlayers.find(item => Number(item.id) === Number(tablePlayer.pid));
        if (player) showPlayerDialog(player, liveState);
    };

    const buildTeamBlock = (team, sideClass, containerId) => {
        const container = bodyEl.querySelector(`#${containerId}`);
        if (!container) return;

        const label = document.createElement('div');
        label.className = 'rnd-adv-team-label';
        label.style.color = sideClass === 'home' ? 'var(--tmu-success)' : 'var(--tmu-info)';
        label.textContent = team.name;
        container.appendChild(label);

        const activePlayers = (team.lineup || []).filter(p => !/^sub\d+$/.test(p.position) || p.minsPlayed > 0);
        const all = activePlayers.map(_toTablePlayer)
            .sort((a, b) => _posOrder(a.displayPosition) - _posOrder(b.displayPosition) || (b.minutes || 0) - (a.minutes || 0) || a.name.localeCompare(b.name));
        const outfield = all.filter(p => !p.isGK);
        const keepers = all.filter(p => p.isGK);
        const wrap = document.createElement('div');
        wrap.className = 'rnd-mps-wrap';
        if (outfield.length) wrap.appendChild(TmMatchPlayerStatsTable.outfield(outfield, openPlayerDialog));
        if (keepers.length) wrap.appendChild(TmMatchPlayerStatsTable.keepers(keepers, openPlayerDialog));
        container.appendChild(wrap);
    };

    buildTeamBlock(homeTeam, 'home', 'rnd-plr-home');
    buildTeamBlock(awayTeam, 'away', 'rnd-plr-away');
};

export const TmMatchStatistics = {
    render(body, liveState) {
        const mData = liveState.mData;
        const home = mData.teams.home;
        const away = mData.teams.away;
        const md = mData.match_data;
        const homeId = String(home.id);
        const awayId = String(away.id);
        const matchEnded = liveState.ended;

        let html = '<div class="rnd-stats-wrap">';
        html += _buildTeamHeader(home.name, away.name, homeId, awayId);
        html += _buildStatBars(home.stats, away.stats, md, matchEnded);
        html += '<div id="rnd-adv-styles"></div>';
        html += '<div class="rnd-adv-section"><div class="rnd-adv-title">Player Statistics</div><div id="rnd-plr-home"></div><div id="rnd-plr-away"></div></div>';
        html += '</div>';

        body.html(html);

        _injectAttackingStyles(body[0], home.stats.advanced, away.stats.advanced, home.name, away.name, liveState);
        _injectPlayerStats(home, away, body[0], liveState);

        body.find('.rnd-adv-row[data-adv-target]').on('click', function () {
            const targetId = $(this).data('adv-target');
            const evtRow = document.getElementById(targetId);
            if (evtRow) {
                $(this).toggleClass('expanded');
                $(evtRow).toggleClass('visible');
            }
        });
        TmMatchAccordion.bindToggles(body, { stopPropagation: true });
    },
};

