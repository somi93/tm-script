import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmMatchUtils } from './tm-match-utils.js';

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

// ── Section 2: Stat bars (possession, shots, cards, set pieces) ──────────────
const _buildStatBars = (stats, md, matchEnded) => {
    let h = '';
    if (md.possession && matchEnded) {
        const home = Number(md.possession.home), away = Number(md.possession.away);
        h += _barRow('Possession', home + '%', away + '%', true);
    }
    h += '<div class="rnd-stat-divider"></div>';
    h += _barRow('Shots', stats.homeShots, stats.awayShots);
    h += _barRow('On Target', stats.homeSoT, stats.awaySoT);
    h += '<div class="rnd-stat-divider"></div>';
    h += _barRow('Yellow Cards', stats.homeYellow, stats.awayYellow);
    h += _barRow('Red Cards', stats.homeRed, stats.awayRed);
    h += '<div class="rnd-stat-divider"></div>';
    h += _barRow('Set Pieces', stats.homeSetPieces, stats.awaySetPieces);
    if (stats.homePenalties || stats.awayPenalties) h += _barRow('Penalties', stats.homePenalties, stats.awayPenalties);
    return h;
};

// ── Section 3: Attacking styles ──────────────────────────────────────────────
const _buildAttackingStyles = ({ report, homeId, homeClub, awayClub, sortedMins, curMin, curEvtIdx, isEventVisible, buildReportEventHtml, playerNames }) => {
    const { ATTACK_STYLES, STYLE_ORDER, SKIP_PREFIXES } = TmConst;

    const advData = { home: {}, away: {} };
    STYLE_ORDER.forEach(s => {
        advData.home[s] = { a: 0, l: 0, sh: 0, g: 0, events: [] };
        advData.away[s] = { a: 0, l: 0, sh: 0, g: 0, events: [] };
    });

    for (const min of sortedMins) {
        const evts = report[String(min)] || [];
        for (let si = 0; si < evts.length; si++) {
            const evt = evts[si];
            if (!evt.type) continue;
            if (!isEventVisible(min, si, curMin, curEvtIdx)) continue;
            const prefix = evt.type.replace(/[0-9]+.*/, '');
            const isPenEvt = /^p_/.test(evt.type);
            const hasShot = evt.parameters?.some(p => p.shot);
            const hasGoal = evt.parameters?.some(p => p.goal);
            const hasPenParam = evt.parameters?.some(p => p.penalty);
            if (isPenEvt && hasPenParam && hasGoal) {
                const side = String(evt.club) === homeId ? 'home' : 'away';
                const pd = advData[side]['Penalties'];
                pd.a++; pd.g++; pd.sh++;
                pd.events.push({ min, evt, evtIdx: si, result: 'goal' });
                continue;
            } else if (isPenEvt && hasShot && !hasGoal) {
                const side = String(evt.club) === homeId ? 'home' : 'away';
                const pd = advData[side]['Penalties'];
                pd.a++; pd.sh++;
                pd.events.push({ min, evt, evtIdx: si, result: 'shot' });
                continue;
            }
            if (SKIP_PREFIXES.has(prefix)) continue;
            const styleEntry = ATTACK_STYLES.find(s => s.key === prefix);
            if (!styleEntry) continue;
            const side = String(evt.club) === homeId ? 'home' : 'away';
            const d = advData[side][styleEntry.label];
            d.a++;
            let result = 'lost';
            if (hasGoal) { d.g++; d.sh++; result = 'goal'; }
            else if (hasShot) { d.sh++; result = 'shot'; }
            else { d.l++; }
            d.events.push({ min, evt, evtIdx: si, result });
        }
    }

    const buildAdvTable = (teamName, side, sideClass) => {
        let t = `<div class="rnd-adv-team-label" style="color:${sideClass === 'home' ? '#80e048' : '#5ba8f0'}">${teamName}</div>`;
        t += '<table class="rnd-adv-table">';
        t += '<tr><th>Style</th><th>Att</th><th>Lost</th><th>Shot</th><th>Goal</th><th>Conv%</th></tr>';
        let totA = 0, totL = 0, totSh = 0, totG = 0;
        STYLE_ORDER.forEach(style => {
            const d = advData[side][style];
            totA += d.a; totL += d.l; totSh += d.sh; totG += d.g;
            const pct = d.a ? Math.round(d.g / d.a * 100) + '%' : '-';
            const cls = (v, type) => v === 0 ? 'adv-zero' : type;
            const rowId = `adv-${sideClass}-${style.replace(/\s/g, '-')}`;
            const hasEvents = d.events.length > 0;
            t += `<tr class="rnd-adv-row${hasEvents ? '' : ' rnd-adv-total'}" ${hasEvents ? 'data-adv-target="' + rowId + '"' : ''}>`;
            t += `<td>${style}${hasEvents ? ' <span class="adv-arrow">&#9654;</span>' : ''}</td>`;
            t += `<td class="${cls(d.a, '')}">${d.a}</td>`;
            t += `<td class="${cls(d.l, 'adv-lost')}">${d.l}</td>`;
            t += `<td class="${cls(d.sh, 'adv-shot')}">${d.sh}</td>`;
            t += `<td class="${cls(d.g, 'adv-goal')}">${d.g}</td>`;
            t += `<td class="${cls(d.a ? d.g : 0, '')}">${pct}</td>`;
            t += '</tr>';
            if (hasEvents) {
                t += `<tr class="rnd-adv-events" id="${rowId}"><td colspan="6"><div class="rnd-adv-evt-list">`;
                d.events.forEach(e => {
                    t += `<div class="rnd-adv-evt"><span class="adv-result-tag ${e.result}">${e.result}</span>${buildReportEventHtml(e.evt, e.min, e.evtIdx, playerNames, homeId)}</div>`;
                });
                t += '</div></td></tr>';
            }
        });
        const totPct = totA ? Math.round(totG / totA * 100) + '%' : '-';
        t += '<tr class="rnd-adv-row rnd-adv-total">';
        t += `<td>Total</td><td>${totA}</td><td>${totL}</td><td>${totSh}</td><td>${totG}</td><td>${totPct}</td>`;
        t += '</tr></table>';
        return t;
    };

    let h = '<div class="rnd-adv-section">';
    h += '<div class="rnd-adv-title">Attacking Styles</div>';
    h += buildAdvTable(homeClub, 'home', 'home');
    h += buildAdvTable(awayClub, 'away', 'away');
    h += '</div>';
    return h;
};

// ── Section 4: Player statistics ─────────────────────────────────────────────
const _buildPlayerStats = ({ report, mData, pStats, matchEnded, homeId, homeClub, awayClub, sortedMins, matchEndMin, buildReportEventHtml, playerNames }) => {
    const { ACTION_LABELS, ACTION_CLS, POSITION_ORDER } = TmConst;
    const ratClr = TmUtils.ratingColor;

    const subEvents = {};
    for (const min of sortedMins) {
        (report[String(min)] || []).forEach(evt => {
            if (!evt.parameters) return;
            evt.parameters.forEach(param => {
                if (param.sub) {
                    const inId = String(param.sub.player_in);
                    const outId = String(param.sub.player_out);
                    if (!subEvents[inId]) subEvents[inId] = {};
                    subEvents[inId].subInMin = min;
                    if (!subEvents[outId]) subEvents[outId] = {};
                    subEvents[outId].subOutMin = min;
                }
            });
        });
    }

    const buildPlayerTable = (teamName, side, sideClass) => {
        const lineup = mData.lineup[side];
        const starters = [], playedSubs = [];
        Object.entries(lineup).forEach(([id, p]) => {
            const isSub = p.position.includes('sub');
            const se = subEvents[String(p.player_id)] || {};
            if (isSub && !se.subInMin) return;
            const endMin = se.subOutMin || matchEndMin;
            const minsPlayed = isSub ? endMin - se.subInMin : endMin;
            const entry = { id: String(p.player_id), p, minsPlayed };
            if (isSub) playedSubs.push(entry); else starters.push(entry);
        });
        starters.sort((a, b) => (POSITION_ORDER[a.p.position] ?? 99) - (POSITION_ORDER[b.p.position] ?? 99));
        playedSubs.sort((a, b) => (subEvents[a.id]?.subInMin || 99) - (subEvents[b.id]?.subInMin || 99));
        const players = [...starters, ...playedSubs];

        const colCount = matchEnded ? 12 : 11;
        let t = `<div class="rnd-adv-team-label" style="color:${sideClass === 'home' ? '#80e048' : '#5ba8f0'}">${teamName}</div>`;
        t += '<table class="rnd-adv-table">';
        t += '<tr><th>Player</th><th title="Minutes Played">Min</th><th title="Successful Passes">SP</th><th title="Unsuccessful Passes">UP</th><th title="Successful Crosses">SC</th><th title="Unsuccessful Crosses">UC</th><th title="Shots / Saves">Sh</th><th>G</th><th>A</th><th title="Duels Won">DW</th><th title="Duels Lost">DL</th>' + (matchEnded ? '<th>Rat</th>' : '') + '</tr>';
        let totSP = 0, totUP = 0, totSC = 0, totUC = 0, totSh = 0, totG = 0, totA = 0, totDW = 0, totDL = 0;

        players.forEach(({ id, p, minsPlayed }) => {
            const s = pStats[id] || { sp: 0, up: 0, sc: 0, uc: 0, sh: 0, sv: 0, g: 0, a: 0, dw: 0, dl: 0, events: [] };
            const isGK = p.position === 'gk';
            totSP += s.sp; totUP += s.up; totSC += s.sc; totUC += s.uc;
            totSh += (isGK ? s.sv : s.sh); totG += s.g; totA += s.a; totDW += s.dw; totDL += s.dl;
            const rowId = `plr-${sideClass}-${id}`;
            const hasEvts = s.events.length > 0;
            const cls = (v, type) => v === 0 ? 'adv-zero' : type;
            const isSub = p.position.includes('sub');
            t += `<tr class="rnd-adv-row${hasEvts ? '' : ' rnd-adv-total'}" ${hasEvts ? 'data-adv-target="' + rowId + '"' : ''}>`;
            t += `<td>${isSub ? '<span style="color:#6a9a58;font-size:9px">↑</span> ' : ''}${playerNames[id] || id}${hasEvts ? ' <span class="adv-arrow">&#9654;</span>' : ''}</td>`;
            t += `<td style="color:#8aac72">${minsPlayed}'</td>`;
            t += `<td class="${cls(s.sp, '')}">${s.sp}</td>`;
            t += `<td class="${cls(s.up, 'adv-lost')}">${s.up}</td>`;
            t += `<td class="${cls(s.sc, '')}">${s.sc}</td>`;
            t += `<td class="${cls(s.uc, 'adv-lost')}">${s.uc}</td>`;
            t += isGK ? `<td class="${cls(s.sv, 'adv-shot')}" title="Saves">${s.sv} 🧤</td>` : `<td class="${cls(s.sh, 'adv-shot')}">${s.sh}</td>`;
            t += `<td class="${cls(s.g, 'adv-goal')}">${s.g}</td>`;
            t += `<td class="${cls(s.a, 'adv-goal')}">${s.a}</td>`;
            t += `<td class="${cls(s.dw, '')}">${s.dw}</td>`;
            t += `<td class="${cls(s.dl, 'adv-lost')}">${s.dl}</td>`;
            if (matchEnded) {
                const rFmt = p.rating ? Number(p.rating).toFixed(2) : '-';
                t += `<td style="font-weight:700;color:${ratClr(p.rating)}">${rFmt}</td>`;
            }
            t += '</tr>';
            if (hasEvts) {
                t += `<tr class="rnd-adv-events" id="${rowId}"><td colspan="${colCount}"><div class="rnd-adv-evt-list">`;
                s.events.forEach(ev => {
                    const acls = ACTION_CLS[ev.action] || '';
                    const albl = ACTION_LABELS[ev.action] || ev.action;
                    t += `<div class="rnd-adv-evt"><span class="adv-result-tag ${acls}">${albl}</span>${buildReportEventHtml(ev.evt, ev.min, ev.evtIdx, playerNames, homeId)}</div>`;
                });
                t += '</div></td></tr>';
            }
        });

        const clsT = (v, type) => v === 0 ? 'adv-zero' : type;
        t += '<tr class="rnd-adv-row rnd-adv-total">';
        t += `<td>Total</td><td></td><td>${totSP}</td><td class="${clsT(totUP, 'adv-lost')}">${totUP}</td><td>${totSC}</td><td class="${clsT(totUC, 'adv-lost')}">${totUC}</td><td>${totSh}</td><td class="${clsT(totG, 'adv-goal')}">${totG}</td><td class="${clsT(totA, 'adv-goal')}">${totA}</td><td>${totDW}</td><td class="${clsT(totDL, 'adv-lost')}">${totDL}</td>` + (matchEnded ? '<td></td>' : '');
        t += '</tr></table>';
        return t;
    };

    let h = '<div class="rnd-adv-section">';
    h += '<div class="rnd-adv-title">Player Statistics</div>';
    h += buildPlayerTable(homeClub, 'home', 'home');
    h += buildPlayerTable(awayClub, 'away', 'away');
    h += '</div>';
    return h;
};

export const TmMatchStatistics = {
    render(body, mData, curMin = 999, curEvtIdx = 999, opts = {}) {
        const { liveState, isEventVisible, buildPlayerNames, buildReportEventHtml } = opts;
        const md = mData.match_data;
        const homeClub = mData.club.home.club_name;
        const awayClub = mData.club.away.club_name;
        const homeId = String(mData.club.home.id);
        const awayId = String(mData.club.away.id);
        const report = mData.report || {};
        const homeIds = new Set(Object.keys(mData.lineup.home));
        const stats = TmMatchUtils.extractStats(report, homeIds, homeId, {
            upToMin: curMin, upToEvtIdx: curEvtIdx, isEventVisible,
        });
        const matchEnded = !liveState || liveState.ended;
        const sortedMins = Object.keys(report).map(Number).sort((a, b) => a - b);
        const matchEndMin = md?.regular_last_min || Math.max(...sortedMins, 90);
        const playerNames = buildPlayerNames(mData);
        const pStats = TmMatchUtils.buildPlayerEventStats(report, {
            isEventVisible, upToMin: curMin, upToEvtIdx: curEvtIdx, recordEvents: true,
        });

        let html = '<div class="rnd-stats-wrap">';
        html += _buildTeamHeader(homeClub, awayClub, homeId, awayId);
        html += _buildStatBars(stats, md, matchEnded);
        html += _buildAttackingStyles({ report, homeId, homeClub, awayClub, sortedMins, curMin, curEvtIdx, isEventVisible, buildReportEventHtml, playerNames });
        html += _buildPlayerStats({ report, mData, pStats, matchEnded, homeId, homeClub, awayClub, sortedMins, matchEndMin, buildReportEventHtml, playerNames });
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

