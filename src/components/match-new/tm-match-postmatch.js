/**
 * tm-match-postmatch.js — Full-time player summary replacing the canvas.
 *
 * Shown when the match ends. Fills the center column with two side-by-side
 * player lists (home | away), one row per player showing:
 *   no | pos | name | ⚽ goals | 🅰 assists | card | injury | rating | ★ MOM
 *
 * Data:
 *  - match.report   — post-normalizeReport events (evt.goal, .yellow, .red, .injury, .sub)
 *  - match.plays    — clip actions for subIn detection
 *  - match.home/away.lineup — player objects with .rating, .mom
 */

import { TmConst }   from '../../lib/tm-constants.js';
import { TmUtils }   from '../../lib/tm-utils.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmMatchPlayerDialog } from './tm-match-player-dialog.js';

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLE_ID = 'mp-postmatch-style';
const ensureStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        .pm-wrap {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            overflow: hidden;
            box-sizing: border-box;
        }
        .pm-teams {
            display: flex;
            flex-direction: row;
            gap: 8px;
            flex: 1 1 0;
            overflow: hidden;
            padding: 6px 0;
        }
        .pm-team {
            flex: 1 1 0;
            min-width: 0;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            border: 1px solid var(--tmu-border-soft);
            border-radius: 6px;
            padding: 0 2px 4px;
        }
        .pm-team-hd {
            position: sticky;
            top: 0;
            z-index: 1;
            font-size: var(--tmu-font-sm);
            font-weight: 700;
            color: var(--tmu-text-strong);
            padding: 6px 6px 4px;
            text-align: center;
            background: var(--tmu-surface-dialog);
            border-bottom: 1px solid var(--tmu-border-soft);
            margin-bottom: 2px;
        }
        .pm-row {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 2px 4px;
            border-radius: 3px;
            min-height: 23px;
        }
        .pm-row:hover {
            background: var(--tmu-border-contrast);
        }
        .pm-row-bench {
            opacity: 0.4;
        }
        .pm-row-subin {
            border-left: 2px solid #4caf50;
            padding-left: 5px;
        }
        .pm-divider {
            height: 1px;
            background: var(--tmu-border-soft);
            margin: 3px 4px;
        }
        .pm-no {
            flex-shrink: 0;
            min-width: 16px;
            text-align: right;
            font-size: 10px;
            color: var(--tmu-text-dim);
        }
        .pm-pos {
            flex-shrink: 0;
        }
        .pm-name {
            flex: 1 1 0;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: var(--tmu-font-sm);
            color: var(--tmu-text-main);
        }
        .pm-name-captain::after {
            content: ' (C)';
            font-size: 10px;
            color: var(--tmu-text-dim);
        }
        .pm-events {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 2px;
        }
        .pm-ev-goal {
            font-size: 11px;
            color: var(--tmu-text-live);
            font-weight: 700;
        }
        .pm-ev-assist {
            font-size: 11px;
            color: var(--tmu-text-preview);
        }
        .pm-ev-card {
            font-size: 11px;
        }
        .pm-ev-inj {
            font-size: 11px;
            color: var(--tmu-danger);
            font-weight: 800;
        }
        .pm-right {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 2px;
        }
        .pm-rating {
            font-size: var(--tmu-font-sm);
            font-weight: 700;
            min-width: 26px;
            text-align: right;
        }
        .pm-rating-null {
            color: var(--tmu-text-dim);
            font-weight: 400;
        }
        .pm-mom {
            font-size: 11px;
            color: #f5c518;
        }
        .pm-name-wrap {
            flex: 1 1 0;
            min-width: 0;
            display: flex;
            align-items: center;
            gap: 3px;
            overflow: hidden;
        }
        .pm-name-wrap .pm-name {
            flex-shrink: 1;
        }
        .pm-mom-inline {
            flex-shrink: 0;
            font-size: 11px;
            color: #f5c518;
        }
        .pm-mins {
            flex-shrink: 0;
            font-size: 10px;
            color: var(--tmu-text-dim);
            white-space: nowrap;
        }
    `;
    document.head.appendChild(s);
};

// ── Position sort order ───────────────────────────────────────────────────────

const posOrd = player => TmConst.POSITION_MAP[(player?.position || '').toLowerCase()]?.ordering ?? 99;
const sortByPosition = (a, b) =>
    posOrd(a) - posOrd(b)
    || Number(a?.no ?? 999) - Number(b?.no ?? 999)
    || String(a?.nameLast || a?.name || '').localeCompare(String(b?.nameLast || b?.name || ''));

// ── Minutes played ────────────────────────────────────────────────────────────

/**
 * Compute minutes played per player from sub/injury events in the report.
 * @param {object} match — normalized match
 * @param {number} [upToMinute=Infinity] — treat match as ending at this minute
 * @returns {Map<string, number>}  pid → minutes played (0 for unused subs)
 */
export function buildMinutesPlayed(match, upToMinute = Infinity) {
    const duration = Math.min(match.duration?.total ?? 95, upToMinute);
    const { POSITION_MAP } = TmConst;
    const subInMin  = {}; // pid → minute came on
    const subOutMin = {}; // pid → minute came off

    const sortedMins = Object.keys(match.report || {}).map(Number).sort((a, b) => a - b);
    for (const min of sortedMins) {
        if (min > upToMinute) break;
        for (const evt of (match.report[String(min)] || [])) {
            if (evt.sub) {
                const inPid  = String(evt.sub.player_in  ?? evt.sub.in  ?? '');
                const outPid = String(evt.sub.player_out ?? evt.sub.out ?? '');
                if (inPid)  subInMin[inPid]  ??= min;
                if (outPid) subOutMin[outPid] ??= min;
            }
            if (evt.injury) {
                const pid = String(evt.injury);
                subOutMin[pid] ??= min;
            }
        }
    }

    const result = new Map();
    for (const p of [...match.home.lineup, ...match.away.lineup]) {
        const pid = String(p.id);
        const isStarter = POSITION_MAP[(p.position || '').toLowerCase()] != null;
        if (isStarter) {
            result.set(pid, Math.min(subOutMin[pid] ?? duration, duration));
        } else {
            const inAt = subInMin[pid];
            result.set(pid, (inAt != null && inAt <= upToMinute)
                ? Math.min(subOutMin[pid] ?? duration, duration) - inAt
                : 0);
        }
    }
    return result;
}

// ── Per-player stats from plays ──────────────────────────────────────────────

const STAT_ZERO = () => ({
    shots: 0, shotsOnTarget: 0, shotsFoot: 0, shotsOnTargetFoot: 0, goalsFoot: 0,
    shotsHead: 0, shotsOnTargetHead: 0, goalsHead: 0,
    goals: 0, assists: 0, keyPasses: 0, saves: 0,
    passesCompleted: 0, passesFailed: 0, crossesCompleted: 0, crossesFailed: 0,
    interceptions: 0, tackles: 0, headerClearances: 0, tackleFails: 0,
    duelsWon: 0, duelsLost: 0, fouls: 0,
    yellowCards: 0, yellowRedCards: 0, redCards: 0,
    penaltiesTaken: 0, penaltiesScored: 0, freekickGoals: 0, setpieceTakes: 0,
    subIn: false, subOut: false, injured: false,
});

/**
 * Aggregate per-player stats from the normalized plays structure.
 * @param {object} match — normalized match
 * @param {number} [upToMinute=Infinity] — only include plays up to this minute
 * @returns {object} pid → statsObj
 */
export function buildMatchPlayerStats(match, upToMinute = Infinity) {
    const map = {};
    const ensure = pid => (map[pid] ??= STAT_ZERO());
    for (const [minStr, playsArr] of Object.entries(match.plays || {})) {
        if (Number(minStr) > upToMinute) continue;
        for (const play of playsArr) {
            for (const clip of (play.clips || [])) {
                for (const act of (clip.actions || [])) {
                    const pid = String(act.by || '');
                    if (!pid) continue;
                    const s = ensure(pid);
                    switch (act.action) {
                        case 'shot':
                            s.shots++;
                            if (act.onTarget) s.shotsOnTarget++;
                            if (act.head) { s.shotsHead++; if (act.onTarget) s.shotsOnTargetHead++; }
                            else          { s.shotsFoot++; if (act.onTarget) s.shotsOnTargetFoot++; }
                            if (act.goal) {
                                s.goals++;
                                if (act.head) s.goalsHead++; else s.goalsFoot++;
                                if (act.penalty) s.penaltiesScored++;
                                if (act.freekick) s.freekickGoals++;
                            }
                            if (act.penalty) s.penaltiesTaken++;
                            break;
                        case 'assist':       s.assists++;             break;
                        case 'keyPass':      s.keyPasses++;           break;
                        case 'pass':         act.success ? s.passesCompleted++ : s.passesFailed++;   break;
                        case 'cross':        act.success ? s.crossesCompleted++ : s.crossesFailed++; break;
                        case 'save':         s.saves++;               break;
                        case 'foul':         s.fouls++;               break;
                        case 'duelWon':      s.duelsWon++;            break;
                        case 'duelLost':     s.duelsLost++;           break;
                        case 'tackle':       s.tackles++;             break;
                        case 'interception': s.interceptions++;       break;
                        case 'headerClear':  s.headerClearances++;    break;
                        case 'tackleFail':   s.tackleFails++;         break;
                        case 'yellow':       s.yellowCards++;         break;
                        case 'yellowRed':    s.yellowRedCards++; s.yellowCards++; break;
                        case 'red':          s.redCards++;            break;
                        case 'subIn':        s.subIn  = true;         break;
                        case 'subOut':       s.subOut = true;         break;
                        case 'injury':       s.injured = true;        break;
                        case 'setpiece':     s.setpieceTakes++;       break;
                    }
                }
            }
        }
    }
    return map;
}

// ── Stat aggregation (from report) ───────────────────────────────────────────

/**
 * Aggregate per-player match events from the normalized report.
 * @param {object} report — match.report (post-normalizeReport)
 * @returns {object} pid → { goals, assists, yellow, yellowRed, red, injury }
 */
function buildStats(report) {
    const map = {};
    const s = pid => (map[pid] ??= { goals: 0, assists: 0, yellow: false, yellowRed: false, red: false, injury: false });
    for (const evts of Object.values(report || {})) {
        for (const evt of evts) {
            if (evt.goal) {
                s(String(evt.goal.player)).goals++;
                if (evt.goal.assist) s(String(evt.goal.assist)).assists++;
            }
            if (evt.yellow)     s(String(evt.yellow)).yellow = true;
            if (evt.yellow_red) { s(String(evt.yellow_red)).yellow = true; s(String(evt.yellow_red)).yellowRed = true; }
            if (evt.red)        s(String(evt.red)).red = true;
            if (evt.injury)     s(String(evt.injury)).injury = true;
        }
    }
    return map;
}

/**
 * Collect all pids who came on as a substitute during the match.
 * @param {object} plays — match.plays
 * @returns {Set<string>}
 */
function buildSubInPids(plays) {
    const pids = new Set();
    for (const playsArr of Object.values(plays || {})) {
        for (const play of playsArr) {
            for (const clip of (play.clips || [])) {
                for (const act of (clip.actions || [])) {
                    if (act.action === 'subIn') pids.add(String(act.by));
                }
            }
        }
    }
    return pids;
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function buildPlayerRowHtml(player, isSubRole, subInPids, stats, minsMap) {
    const pid    = String(player.id);
    const st     = stats[pid] || {};
    const isOnBench = isSubRole && !subInPids.has(pid);
    const posKey = (player.position || '').toLowerCase();
    const posChip = posKey ? TmPosition.chip([posKey]) : '<span style="width:28px;display:inline-block"></span>';
    const name   = player.nameLast || player.name || '?';
    const noStr  = player.no != null ? player.no : '−';
    const isCap  = player.captain ? ' pm-name-captain' : '';

    // Events
    let evHtml = '';
    if (st.goals > 0)   evHtml += `<span class="pm-ev-goal">⚽${st.goals > 1 ? `×${st.goals}` : ''}</span>`;
    if (st.assists > 0) evHtml += `<span class="pm-ev-assist">🅰${st.assists > 1 ? `×${st.assists}` : ''}</span>`;
    if (st.yellowRed)   evHtml += `<span class="pm-ev-card">🟥🟨</span>`;
    else if (st.red)    evHtml += `<span class="pm-ev-card">🟥</span>`;
    else if (st.yellow) evHtml += `<span class="pm-ev-card">🟨</span>`;
    if (st.injury)      evHtml += `<span class="pm-ev-inj">✚</span>`;

    // Minutes played
    const mins = minsMap?.get(pid) ?? null;
    const minsHtml = (mins != null && mins > 0)
        ? `<span class="pm-mins">${mins}'</span>`
        : '';

    // MOM inline star
    const isMom = player.mom && player.mom !== 0;
    const momHtml = isMom ? `<span class="pm-mom-inline" title="Man of the Match">★</span>` : '';

    // Rating (right side — no MOM star here anymore)
    let ratingHtml = '';
    if (player.rating != null) {
        const color = TmUtils.getColor(player.rating, TmConst.R5_THRESHOLDS);
        ratingHtml = `<span class="pm-rating" style="color:${color}">${player.rating.toFixed(1)}</span>`;
    } else {
        ratingHtml = `<span class="pm-rating pm-rating-null">−</span>`;
    }

    const benchCls = isOnBench ? ' pm-row-bench' : '';
    const subInCls = isSubRole && !isOnBench ? ' pm-row-subin' : '';

    return `<div class="pm-row${benchCls}${subInCls}" data-pid="${pid}" style="cursor:pointer">` +
        `<span class="pm-no">${noStr}</span>` +
        `<span class="pm-pos">${posChip}</span>` +
        `<div class="pm-name-wrap"><span class="pm-name${isCap}">${name}</span>${momHtml}${minsHtml}</div>` +
        `<span class="pm-events">${evHtml}</span>` +
        `<span class="pm-right">${ratingHtml}</span>` +
        '</div>';
}

function buildTeamHtml(lineup, clubName, stats, subInPids, minsMap) {
    const { POSITION_MAP } = TmConst;

    const starters = lineup
        .filter(p => POSITION_MAP[(p.position || '').toLowerCase()])
        .sort(sortByPosition);

    // Sort subs: those who came on (by position/entry order) first, unused bench dimmed after
    const subs = lineup
        .filter(p => !POSITION_MAP[(p.position || '').toLowerCase()])
        .sort((a, b) => {
            const aPlayed = subInPids.has(String(a.id));
            const bPlayed = subInPids.has(String(b.id));
            if (aPlayed !== bPlayed) return aPlayed ? -1 : 1;
            return sortByPosition(a, b);
        });

    let html = `<div class="pm-team-hd">${clubName}</div>`;
    html += starters.map(p => buildPlayerRowHtml(p, false, subInPids, stats, minsMap)).join('');
    if (subs.length) {
        html += '<div class="pm-divider"></div>';
        html += subs.map(p => buildPlayerRowHtml(p, true, subInPids, stats, minsMap)).join('');
    }

    return `<div class="pm-team">${html}</div>`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export const TmMatchPostMatch = {
    /**
     * Create the post-match summary element.
     * The element is fully rendered on creation (it only needs FT data from match).
     * @param {object} match — normalized match object
     * @returns {{ el: HTMLElement }}
     */
    create(match) {
        ensureStyles();

        const stats     = buildStats(match.report);
        const subInPids = buildSubInPids(match.plays);
        const minsMap   = buildMinutesPlayed(match);
        const playsStats = buildMatchPlayerStats(match);

        const allPlayersById = new Map([
            ...match.home.lineup,
            ...match.away.lineup,
        ].map(p => [String(p.id), p]));

        const homeName = match.home?.club?.name || '?';
        const awayName = match.away?.club?.name || '?';

        const homeHtml = buildTeamHtml(match.home.lineup, homeName, stats, subInPids, minsMap);
        const awayHtml = buildTeamHtml(match.away.lineup, awayName, stats, subInPids, minsMap);

        const wrap = document.createElement('div');
        wrap.className = 'pm-wrap';
        wrap.innerHTML = `<div class="pm-teams">${homeHtml}${awayHtml}</div>`;

        wrap.addEventListener('click', e => {
            const row = e.target.closest('.pm-row[data-pid]');
            if (!row) return;
            const pid = row.dataset.pid;
            const player = allPlayersById.get(pid);
            if (!player) return;
            TmMatchPlayerDialog.open(player, playsStats[pid] || {}, minsMap.get(pid) ?? 0, { showRating: true });
        });

        return { el: wrap };
    },
};
