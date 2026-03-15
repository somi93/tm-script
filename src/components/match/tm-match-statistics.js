import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmMatchUtils } from '../../utils/match.js';

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
    h += `<div class="rnd-stat-divider"></div>
        ${_barRow('Shots', stats.homeShots, stats.awayShots)}
        ${_barRow('On Target', stats.homeSoT, stats.awaySoT)}
        ${'<div class="rnd-stat-divider"></div>'}
        ${_barRow('Yellow Cards', stats.homeYellow, stats.awayYellow)}
        ${_barRow('Red Cards', stats.homeRed, stats.awayRed)}
        ${'<div class="rnd-stat-divider"></div>'}
        ${_barRow('Set Pieces', stats.homeSetPieces, stats.awaySetPieces)}
        ${stats.homePenalties || stats.awayPenalties ? _barRow('Penalties', stats.homePenalties, stats.awayPenalties) : ''}`;
    return h;
};

// ── Section 3: Attacking styles ──────────────────────────────────────────────
const _buildAttackingStyles = ({ plays, homeId, homeClub, awayClub, curMin, curEvtIdx, isEventVisible, buildReportEventHtml, playerNames }) => {
    const { ATTACK_STYLES, STYLE_ORDER } = TmConst;

    const advData = { home: {}, away: {} };
    STYLE_ORDER.forEach(s => {
        advData.home[s] = { a: 0, l: 0, sh: 0, g: 0, events: [] };
        advData.away[s] = { a: 0, l: 0, sh: 0, g: 0, events: [] };
    });

    for (const minKey of Object.keys(plays)) {
        const eMin = Number(minKey);
        (plays[minKey] || []).forEach(play => {
            if (!isEventVisible(eMin, play.reportEvtIdx, curMin, curEvtIdx)) return;
            const side = String(play.team) === homeId ? 'home' : 'away';

            if (/^p_/.test(play.style)) {
                const pd = advData[side]['Penalties'];
                pd.a++;
                if (play.outcome === 'goal') { pd.g++; pd.sh++; }
                else if (play.outcome === 'shot') pd.sh++;
                pd.events.push({ min: eMin, evt: play, evtIdx: play.reportEvtIdx, result: play.outcome });
                return;
            }

            const styleEntry = ATTACK_STYLES.find(s => s.key === play.style);
            if (!styleEntry) return;

            const d = advData[side][styleEntry.label];
            d.a++;
            if (play.outcome === 'goal') { d.g++; d.sh++; }
            else if (play.outcome === 'shot') d.sh++;
            else d.l++;
            d.events.push({ min: eMin, evt: play, evtIdx: play.reportEvtIdx, result: play.outcome });
        });
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


    return `<div class="rnd-adv-section">
                <div class="rnd-adv-title">Attacking Styles</div>
                ${buildAdvTable(homeClub, 'home', 'home')}
                ${buildAdvTable(awayClub, 'away', 'away')}
            </div>`;
};

// ── Section 4: Player statistics ─────────────────────────────────────────────
const _buildPlayerStats = ({ plays, mData, pStats, matchEnded, homeId, homeClub, awayClub, matchEndMin, buildReportEventHtml, playerNames }) => {
    const { ACTION_LABELS, ACTION_CLS, POSITION_ORDER, PLAYER_STAT_TABLE, PLAYER_STAT_ZERO } = TmConst;
    const ratClr = TmUtils.ratingColor;

    const subEvents = TmMatchUtils.buildSubstitutionMap(plays);
    const colCount = PLAYER_STAT_TABLE.length + 2 + (matchEnded ? 1 : 0); // name + min + cols + [rat]

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

        let t = `<div class="rnd-adv-team-label" style="color:${sideClass === 'home' ? '#80e048' : '#5ba8f0'}">${teamName}</div>`;
        t += '<table class="rnd-adv-table">';
        t += '<tr><th>Player</th><th title="Minutes Played">Min</th>';
        PLAYER_STAT_TABLE.forEach(col => { t += `<th title="${col.title}">${col.abbr}</th>`; });
        if (matchEnded) t += '<th>Rat</th>';
        t += '</tr>';

        const totals = {};
        PLAYER_STAT_TABLE.forEach(col => { totals[col.key] = 0; });

        players.forEach(({ id, p, minsPlayed }) => {
            const s = { ...PLAYER_STAT_ZERO, ...pStats[id] };
            const isGK = p.position === 'gk';
            const rowId = `plr-${sideClass}-${id}`;
            const hasEvts = s.events?.length > 0;
            const isSub = p.position.includes('sub');

            PLAYER_STAT_TABLE.forEach(col => {
                const k = (isGK && col.gkKey) ? col.gkKey : col.key;
                totals[col.key] += s[k] || 0;
            });

            t += `<tr class="rnd-adv-row${hasEvts ? '' : ' rnd-adv-total'}" ${hasEvts ? 'data-adv-target="' + rowId + '"' : ''}>`;
            t += `<td>${isSub ? '<span style="color:#6a9a58;font-size:9px">↑</span> ' : ''}${playerNames[id] || id}${hasEvts ? ' <span class="adv-arrow">&#9654;</span>' : ''}</td>`;
            t += `<td style="color:#8aac72">${minsPlayed}'</td>`;
            PLAYER_STAT_TABLE.forEach(col => {
                const k = (isGK && col.gkKey) ? col.gkKey : col.key;
                const v = s[k] || 0;
                const extra = (isGK && col.gkKey) ? ' title="Saves"' : '';
                const suffix = (isGK && col.gkKey) ? ' 🧤' : '';
                t += `<td${extra}>${v}${suffix}</td>`;
            });
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

        t += '<tr class="rnd-adv-row rnd-adv-total"><td>Total</td><td></td>';
        PLAYER_STAT_TABLE.forEach(col => { t += `<td>${totals[col.key]}</td>`; });
        if (matchEnded) t += '<td></td>';
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
        const plays = mData.plays || {};
        const homeIds = new Set(Object.keys(mData.lineup.home));
        const stats = TmMatchUtils.extractStats(homeIds, homeId, {
            upToMin: curMin, upToEvtIdx: curEvtIdx, plays,
        });
        const matchEnded = !liveState || liveState.ended;
        const sortedMins = Object.keys(plays).map(Number).sort((a, b) => a - b);
        const matchEndMin = md?.regular_last_min || Math.max(...sortedMins, 90);
        const playerNames = buildPlayerNames(mData);
        const pStats = {};
        for (const p of Object.values({ ...mData.lineup.home, ...mData.lineup.away })) {
            const pid = String(p.player_id);
            const { perMinute, events } = TmMatchUtils.getPlayerStats(plays, pid, { upToMin: curMin, upToEvtIdx: curEvtIdx, recordEvents: true });
            pStats[pid] = { ...TmMatchUtils.aggregateStats(perMinute), events };
        }

        let html = '<div class="rnd-stats-wrap">';
        html += _buildTeamHeader(homeClub, awayClub, homeId, awayId);
        html += _buildStatBars(stats, md, matchEnded);
        html += _buildAttackingStyles({ plays, homeId, homeClub, awayClub, curMin, curEvtIdx, isEventVisible, buildReportEventHtml, playerNames });
        html += _buildPlayerStats({ plays, mData, pStats, matchEnded, homeId, homeClub, awayClub, matchEndMin, buildReportEventHtml, playerNames });
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

