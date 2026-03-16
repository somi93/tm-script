import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { buildPlayerEventsHtml } from './tm-match-player-stats.js';
import { TmMatchReport } from './tm-match-report.js';

// ── Stat bar row helper ─────────────────────────────────────────────────────
const _barRow = (label, hVal, aVal, highlight = false) => {
    const hNum = typeof hVal === 'string' ? parseFloat(hVal) : hVal;
    const aNum = typeof aVal === 'string' ? parseFloat(aVal) : aVal;
    const total = hNum + aNum;
    const hPct = total === 0 ? 50 : Math.round(hNum / total * 100);
    const aPct = 100 - hPct;
    const hLead = hNum > aNum ? ' leading' : '';
    const aLead = aNum > hNum ? ' leading' : '';
    const cls = highlight ? 'rnd-stat-row rnd-stat-row-highlight' : 'rnd-stat-row';
    return `<div class="${cls}">
        <div class="rnd-stat-header">
            <span class="rnd-stat-val home${hLead}">${hVal}</span>
            <span class="rnd-stat-label">${label}</span>
            <span class="rnd-stat-val away${aLead}">${aVal}</span>
        </div>
        <div class="rnd-stat-bar-wrap">
            <div class="rnd-stat-seg home" style="width:${hPct}%"></div>
            <div class="rnd-stat-seg away" style="width:${aPct}%"></div>
        </div>
    </div>`;
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
const _buildAttackingStyles = (homeAdv, awayAdv, homeClub, awayClub, liveState) => {
    const { STYLE_ORDER } = TmConst;

    const buildAdvTable = (teamName, adv, sideClass) => {
        let t = `<div class="rnd-adv-team-label" style="color:${sideClass === 'home' ? '#80e048' : '#5ba8f0'}">${teamName}</div>`;
        t += '<table class="rnd-adv-table">';
        t += '<tr><th>Style</th><th>Att</th><th title="Attacks that reached a shot">Proslo</th><th title="Possession lost before shot">Nije</th><th>Goal</th><th title="Attacks through to shot / Total">Proslo%</th><th title="Goals / Total attacks">Conv%</th></tr>';
        let totA = 0, totL = 0, totSh = 0, totG = 0;
        STYLE_ORDER.forEach(style => {
            const d = adv[style] || { a: 0, sh: 0, l: 0, g: 0, events: [] };
            totA += d.a; totL += d.l; totSh += d.sh; totG += d.g;
            const pct = d.a ? Math.round(d.g / d.a * 100) + '%' : '-';
            const prosloPct = d.a ? Math.round(d.sh / d.a * 100) + '%' : '-';
            const cls = (v, type) => v === 0 ? 'adv-zero' : type;
            const rowId = `adv-${sideClass}-${style.replace(/\s/g, '-')}`;
            const hasEvents = d.events.length > 0;
            t += `<tr class="rnd-adv-row${hasEvents ? '' : ' rnd-adv-total'}" ${hasEvents ? `data-adv-target="${rowId}"` : ''}>`;
            t += `<td>${style}${hasEvents ? ' <span class="adv-arrow">&#9654;</span>' : ''}</td>`;
            t += `<td class="${cls(d.a, '')}">${d.a}</td>`;
            t += `<td class="${cls(d.sh, 'adv-shot')}">${d.sh}</td>`;
            t += `<td class="${cls(d.l, 'adv-lost')}">${d.l}</td>`;
            t += `<td class="${cls(d.g, 'adv-goal')}">${d.g}</td>`;
            t += `<td class="${cls(d.sh, '')}">${prosloPct}</td>`;
            t += `<td class="${cls(d.a ? d.g : 0, '')}">${pct}</td>`;
            t += '</tr>';
            if (hasEvents) {
                t += `<tr class="rnd-adv-events" id="${rowId}"><td colspan="7"><div class="rnd-adv-evt-list">`;
                d.events.forEach(e => {
                    t += `<div class="rnd-adv-evt"><span class="adv-result-tag ${e.result}">${e.result}</span>${TmMatchReport.buildEventHtml(e.evt, e.min, liveState)}</div>`;
                });
                t += '</div></td></tr>';
            }
        });
        const totPct = totA ? Math.round(totG / totA * 100) + '%' : '-';
        const totProsloPct = totA ? Math.round(totSh / totA * 100) + '%' : '-';
        t += `<tr class="rnd-adv-row rnd-adv-total"><td>Total</td><td>${totA}</td><td>${totSh}</td><td>${totL}</td><td>${totG}</td><td>${totProsloPct}</td><td>${totPct}</td></tr>`;
        t += '</table>';
        return t;
    };

    return `<div class="rnd-adv-section">
                <div class="rnd-adv-title">Attacking Styles</div>
                ${buildAdvTable(homeClub, homeAdv, 'home')}
                ${buildAdvTable(awayClub, awayAdv, 'away')}
            </div>`;
};

// ── Section 4: Player statistics ─────────────────────────────────────────────
const _buildPlayerStats = (homeTeam, awayTeam, matchEnded, liveState) => {
    const ratClr = TmUtils.ratingColor;
    const colCount = matchEnded ? 3 : 2; // name + min [+ rat] — stats are inline chips

    const buildPlayerTable = (team, sideClass) => {
        let t = `<div class="rnd-adv-team-label" style="color:${sideClass === 'home' ? '#80e048' : '#5ba8f0'}">${team.name}</div>`;
        t += '<table class="rnd-adv-table">';
        t += '<tr><th>Player</th><th title="Minutes Played">Min</th>';
        if (matchEnded) t += '<th>Rat</th>';
        t += '<th>Stats</th></tr>';

        for (const p of (team.lineup || [])) {
            const isSub = /^sub\d+$/.test(p.position);
            if (isSub && p.minsPlayed <= 0) continue;

            const name = p.nameLast || p.name || String(p.id || p.player_id);
            const rowId = `plr-${sideClass}-${p.id || p.player_id}`;
            const hasEvts = (p.perMinute?.length > 0);
            const chips = (p.grouped || []).map(g =>
                `<span class="rnd-stat-chip">${g.icon || g.abbr || g.key}&nbsp;<b>${g.count}</b></span>`
            ).join('');

            t += `<tr class="rnd-adv-row${hasEvts ? '' : ' rnd-adv-total'}" ${hasEvts ? `data-adv-target="${rowId}"` : ''}>`;
            t += `<td>${isSub ? '<span style="color:#6a9a58;font-size:9px">↑</span> ' : ''}${name}${hasEvts ? ' <span class="adv-arrow">&#9654;</span>' : ''}</td>`;
            t += `<td style="color:#8aac72">${p.minsPlayed ?? '?'}'</td>`;
            if (matchEnded) {
                const rFmt = p.rating ? Number(p.rating).toFixed(2) : '-';
                t += `<td style="font-weight:700;color:${ratClr(p.rating)}">${rFmt}</td>`;
            }
            t += `<td>${chips}</td>`;
            t += '</tr>';
            if (hasEvts) {
                const evtsHtml = buildPlayerEventsHtml(p.perMinute, liveState);
                if (evtsHtml) t += `<tr class="rnd-adv-events" id="${rowId}"><td colspan="${matchEnded ? 4 : 3}"><div class="rnd-adv-evt-list">${evtsHtml}</div></td></tr>`;
            }
        }

        t += '</table>';
        return t;
    };

    let h = '<div class="rnd-adv-section">';
    h += '<div class="rnd-adv-title">Player Statistics</div>';
    h += buildPlayerTable(homeTeam, 'home');
    h += buildPlayerTable(awayTeam, 'away');
    h += '</div>';
    return h;
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
        html += _buildAttackingStyles(home.stats.advanced, away.stats.advanced, home.name, away.name, liveState);
        html += _buildPlayerStats(home, away, matchEnded, liveState);
        html += '</div>';

        body.html(html);

        body.find('.rnd-adv-row[data-adv-target]').on('click', function () {
            const targetId = $(this).data('adv-target');
            const evtRow = document.getElementById(targetId);
            if (evtRow) {
                $(this).toggleClass('expanded');
                $(evtRow).toggleClass('visible');
            }
        });
        body.off('click.rndacc').on('click.rndacc', '.rnd-acc-head', function (e) {
            e.stopPropagation();
            $(this).closest('.rnd-acc').toggleClass('open');
        });
    },
};

