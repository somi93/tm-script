/**
 * tm-match-player-stats.js — Per-player stat card HTML builders
 *
 * Exposes: buildPlayerStatSections(st, isGK)
 *
 * Renders stat card sections derived dynamically from TmConst.PLAYER_STAT_COLS.
 * Entries with outfieldSection / gkSection metadata are grouped and sorted
 * per position type. Shared by player dialog, stats tabs, tooltips, etc.
 */

import { TmConst } from '../../lib/tm-constants.js';
import { TmMatchReport } from './tm-match-report.js';

const { PLAYER_STAT_COLS, ACTION_LABELS, ACTION_CLS } = TmConst;

// Section header metadata (icon + title per section name key).
const _SECTIONS = {
    shooting: { icon: '🎯', title: 'Shooting' },
    passing: { icon: '📊', title: 'Passing & Creativity' },
    defending: { icon: '🛡️', title: 'Defending & Duels' },
};

// ── Aggregate getPlayerStats() array → st-compatible object ─────────────────
const _aggregateStats = (entries) => {
    const st = {
        passesCompleted: 0, passesFailed: 0, crossesCompleted: 0, crossesFailed: 0,
        shots: 0, shotsOnTarget: 0, shotsOffTarget: 0,
        shotsFoot: 0, shotsOnTargetFoot: 0, goalsFoot: 0,
        shotsHead: 0, shotsOnTargetHead: 0, goalsHead: 0,
        saves: 0, goals: 0, assists: 0, keyPasses: 0,
        duelsWon: 0, duelsLost: 0, interceptions: 0, tackles: 0, headerClearances: 0, tackleFails: 0,
        fouls: 0, yellowCards: 0, yellowRedCards: 0, redCards: 0,
        setpieceTakes: 0, freekickGoals: 0, penaltiesTaken: 0, penaltiesScored: 0,
        subIn: false, subOut: false, injured: false,
    };
    for (const e of entries) {
        if (e.shot) {
            st.shots++;
            if (e.onTarget) st.shotsOnTarget++; else st.shotsOffTarget++;
            if (e.head) { st.shotsHead++; if (e.onTarget) st.shotsOnTargetHead++; }
            if (e.foot) { st.shotsFoot++; if (e.onTarget) st.shotsOnTargetFoot++; }
            if (e.goal) { st.goals++; if (e.head) st.goalsHead++; else st.goalsFoot++; }
            if (e.penalty) st.penaltiesTaken++;
            if (e.goal && e.penalty) st.penaltiesScored++;
            if (e.goal && e.freekick) st.freekickGoals++;
        }
        if (e.assist) st.assists++;
        if (e.keyPass) st.keyPasses++;
        if (e.pass) { e.success ? st.passesCompleted++ : st.passesFailed++; }
        if (e.cross) { e.success ? st.crossesCompleted++ : st.crossesFailed++; }
        if (e.save) st.saves++;
        if (e.foul) st.fouls++;
        if (e.duelWon) st.duelsWon++;
        if (e.duelLost) st.duelsLost++;
        if (e.tackle) st.tackles++;
        if (e.interception) st.interceptions++;
        if (e.headerClear) st.headerClearances++;
        if (e.tackleFail) st.tackleFails++;
        if (e.yellow) st.yellowCards++;
        if (e.yellowRed) st.yellowRedCards++;
        if (e.red) st.redCards++;
        if (e.subIn) st.subIn = true;
        if (e.subOut) st.subOut = true;
        if (e.injury) st.injured = true;
    }
    return st;
};

// ── Computed keys injected into st before rendering ──────────────────────────
const _enrichSt = (st) => {
    const totalPasses = (st.passesCompleted ?? 0) + (st.passesFailed ?? 0);
    const totalCross = (st.crossesCompleted ?? 0) + (st.crossesFailed ?? 0);
    return {
        ...st,
        __passAcc: totalPasses > 0 ? Math.round(st.passesCompleted / totalPasses * 100) : 0,
        __crossAcc: totalCross > 0 ? Math.round(st.crossesCompleted / totalCross * 100) : 0,
        __totalPass: totalPasses + totalCross,
    };
};

// ── Label overrides for computed keys ────────────────────────────────────────
const _lbl = (col, st) => {
    if (col.key === '__passAcc') return `Pass ${st.__passAcc}%`;
    if (col.key === '__crossAcc') return `Cross ${st.__crossAcc}%`;
    return col.title;
};

const _val = (col, st) => {
    if (col.key === '__passAcc') return `${st.passesCompleted}/${(st.passesCompleted ?? 0) + (st.passesFailed ?? 0)}`;
    if (col.key === '__crossAcc') return `${st.crossesCompleted}/${(st.crossesCompleted ?? 0) + (st.crossesFailed ?? 0)}`;
    return st[col.key] ?? 0;
};

// ── Renderers ────────────────────────────────────────────────────────────────
const _card = (col, st) => {
    const val = _val(col, st);
    const lbl = _lbl(col, st);
    return `<div class="rnd-plr-stat-card"><div class="rnd-plr-stat-icon">${col.icon}</div><div class="rnd-plr-stat-val">${val}</div><div class="rnd-plr-stat-lbl">${lbl}</div></div>`;
};

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Build the per-player stat sections HTML for a given player stats array.
 * Accepts the result of TmMatchUtils.getPlayerStats() directly.
 * Card columns and grouping are derived from PLAYER_STAT_COLS entries that
 * have outfieldSection / gkSection metadata.
 * @param {Array}   statsArray — result of TmMatchUtils.getPlayerStats()
 * @param {boolean} isGK       — true if GK (uses gkSection / gkOrder)
 * @returns {string} HTML string
 */
export const buildPlayerStatSections = (statsArray, isGK) => {
    const st = _aggregateStats(statsArray || []);
    const enriched = _enrichSt(st);
    const orderProp = isGK ? 'gkOrder' : 'outfieldOrder';

    const groups = new Map();
    for (const col of PLAYER_STAT_COLS) {
        if (!col.section || col[orderProp] == null) continue;
        if (!groups.has(col.section)) groups.set(col.section, []);
        groups.get(col.section).push(col);
    }
    for (const cols of groups.values())
        cols.sort((a, b) => (a[orderProp] ?? 99) - (b[orderProp] ?? 99));

    let html = '';
    for (const [secName, cols] of groups) {
        const meta = _SECTIONS[secName];
        html += `<div class="rnd-plr-section-title"><span class="sec-icon">${meta.icon}</span> ${meta.title}</div>`;
        html += `<div class="rnd-plr-stats-row">${cols.map(c => _card(c, enriched)).join('')}</div>`;
    }
    return html;
};

/**
 * Build the "Chances Involved" accordion list for a player.
 * Shared by the player dialog and the statistics tab expand rows.
 * @param {Array}    perMinute   — from TmMatchUtils.getPlayerStats()
 * @param {object}   visiblePlays — mData.visiblePlays keyed by minute
 * @param {string}   homeId
 * @param {object}   playerNames  — pid → display name
 * @returns {string} HTML string (empty if no events)
 */
export const buildPlayerEventsHtml = (perMinute, liveState) => {
    const visiblePlays = liveState?.mData?.visiblePlays || {};
    const evtMap = new Map();
    for (const e of (perMinute || [])) {
        if (e.evtIdx == null) continue;
        const key = `${e.min}_${e.evtIdx}`;
        if (evtMap.has(key)) continue;
        const play = (visiblePlays[String(e.min)] || []).find(p => p.reportEvtIdx === e.evtIdx);
        if (!play) continue;
        const action =
            e.shot && e.goal ? 'goal' : e.assist ? 'assist'
                : e.shot ? 'shot' : e.save ? 'save'
                    : e.pass ? (e.success ? 'pass_ok' : 'pass_fail')
                        : e.cross ? (e.success ? 'cross_ok' : 'cross_fail')
                            : e.tackle ? 'tackle' : e.interception ? 'intercept'
                                : e.headerClear ? 'header_clear' : e.duelWon ? 'duel_won'
                                    : e.duelLost ? 'duel_lost' : e.tackleFail ? 'tackle_fail'
                                        : e.foul ? 'foul' : (e.yellowRed || e.red) ? 'red' : e.yellow ? 'yellow' : null;
        if (action) evtMap.set(key, { min: e.min, play, action });
    }
    if (evtMap.size === 0) return '';
    let html = '';
    for (const ev of evtMap.values()) {
        const acls = ACTION_CLS[ev.action] || '';
        const albl = ACTION_LABELS[ev.action] || '';
        html += `<div class="rnd-adv-evt">`;
        if (albl) html += `<span class="adv-result-tag ${acls}">${albl}</span>`;
        html += TmMatchReport.buildEventHtml(ev.play, ev.min, liveState);
        html += `</div>`;
    }
    return html;
};