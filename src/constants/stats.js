/**
 * constants/stats.js — Player stat column definitions (unified for all three rendering surfaces)
 *
 * Single source of truth for:
 *   1. Stats-page outfield table   → entries with abbr  (top/warn/yc/rc flags)
 *   2. Match statistics compact table → entries with matchOrder (gkKey/gkAbbr override)
 *   3. Player dialog card sections → entries with cardCls (outfieldSection/gkSection grouping)
 *
 * Card section names: 'shooting' | 'passing' | 'defending'
 * Entries without abbr are card-only (not rendered in any table).
 * Computed entries (key starting '__') are derived in the renderer via _enrichSt().
 */

export const PLAYER_STAT_COLS = [
    // ── Goals & Shooting ──────────────────────────────────────────────────
    {
        key: 'goals',
        abbr: 'G', title: 'Goals', lbl: 'Goals', icon: '⚽',
        cardCls: st => st.goals > 0 ? 'gold' : '',
        outfieldSection: 'shooting', outfieldOrder: 1,
        gkSection: 'shooting', gkOrder: 2,
        top: true, matchOrder: 6, matchCls: v => v === 0 ? 'adv-zero' : 'adv-goal'
    },

    {
        key: 'assists',
        abbr: 'A', title: 'Assists', lbl: 'Assists', icon: '👟',
        cardCls: st => st.assists > 0 ? 'gold' : '',
        outfieldSection: 'passing', outfieldOrder: 1,
        gkSection: 'shooting', gkOrder: 3,
        top: true, matchOrder: 7, matchCls: v => v === 0 ? 'adv-zero' : 'adv-goal'
    },

    {
        key: 'keyPasses',
        abbr: 'KP', title: 'Key Passes', lbl: 'Key Pass', icon: '🔑',
        cardCls: () => '',
        outfieldSection: 'passing', outfieldOrder: 2,
        gkSection: 'shooting', gkOrder: 4,
        top: true
    },

    {
        key: 'shots',
        abbr: 'Sh', title: 'Shots / Saves', lbl: 'Shots', icon: '🎯',
        cardCls: () => '',
        outfieldSection: 'shooting', outfieldOrder: 2,
        gkSection: 'shooting', gkOrder: 5,
        top: true, matchOrder: 5, gkKey: 'saves', gkAbbr: 'Sv', matchCls: v => v === 0 ? 'adv-zero' : 'adv-shot'
    },

    {
        key: 'saves',
        lbl: 'Saves', icon: '🧤',
        cardCls: st => st.saves > 0 ? 'green' : '',
        outfieldSection: null,
        gkSection: 'shooting', gkOrder: 1
    },

    {
        key: 'shotsOnTarget',
        abbr: 'SoT', title: 'Shots on Target', lbl: 'On Target', icon: '✅',
        cardCls: st => st.shotsOnTarget > 0 ? 'green' : '',
        outfieldSection: 'shooting', outfieldOrder: 3,
        gkSection: null,
        top: true
    },

    {
        key: 'goalsFoot',
        lbl: 'Foot G', icon: '🦶',
        cardCls: st => st.goalsFoot > 0 ? 'gold' : '',
        outfieldSection: 'shooting', outfieldOrder: 4,
        gkSection: null
    },

    {
        key: 'goalsHead',
        lbl: 'Head G', icon: '🗣️',
        cardCls: st => st.goalsHead > 0 ? 'gold' : '',
        outfieldSection: 'shooting', outfieldOrder: 5,
        gkSection: null
    },

    // ── Passing (computed card entries) ───────────────────────────────────
    {
        key: '__passAcc',
        lbl: 'Pass %', icon: '📨',
        cardCls: st => (st.passesCompleted + st.passesFailed) > 0 ? (st.__passAcc >= 70 ? 'green' : 'red') : '',
        outfieldSection: 'passing', outfieldOrder: 3,
        gkSection: 'passing', gkOrder: 3
    },

    {
        key: '__crossAcc',
        lbl: 'Cross %', icon: '↗️',
        cardCls: st => (st.crossesCompleted + st.crossesFailed) > 0 ? (st.__crossAcc >= 50 ? 'green' : 'red') : '',
        outfieldSection: 'passing', outfieldOrder: 4,
        gkSection: 'passing', gkOrder: 4
    },

    {
        key: '__totalPass',
        lbl: 'Total', icon: '📈',
        cardCls: () => '',
        outfieldSection: 'passing', outfieldOrder: 5,
        gkSection: 'passing', gkOrder: 5
    },

    // ── Passing (table columns) ───────────────────────────────────────────
    {
        key: 'passesCompleted',
        abbr: 'SP', title: 'Successful Passes',
        top: true, matchOrder: 1, matchCls: v => v === 0 ? 'adv-zero' : ''
    },

    {
        key: 'passesFailed',
        abbr: 'UP', title: 'Unsuccessful Passes',
        warn: true, matchOrder: 2, matchCls: v => v === 0 ? 'adv-zero' : 'adv-lost'
    },

    {
        key: 'crossesCompleted',
        abbr: 'SC', title: 'Successful Crosses',
        top: true, matchOrder: 3, matchCls: v => v === 0 ? 'adv-zero' : ''
    },

    {
        key: 'crossesFailed',
        abbr: 'UC', title: 'Unsuccessful Crosses',
        warn: true, matchOrder: 4, matchCls: v => v === 0 ? 'adv-zero' : 'adv-lost'
    },

    // ── Defending & Duels ─────────────────────────────────────────────────
    {
        key: 'interceptions',
        abbr: 'INT', title: 'Interceptions', lbl: 'INT', icon: '👁️',
        cardCls: st => st.interceptions > 0 ? 'green' : '',
        outfieldSection: 'defending', outfieldOrder: 1,
        gkSection: 'defending', gkOrder: 1,
        top: true
    },

    {
        key: 'tackles',
        abbr: 'TKL', title: 'Tackles', lbl: 'TKL', icon: '🦵',
        cardCls: st => st.tackles > 0 ? 'green' : '',
        outfieldSection: 'defending', outfieldOrder: 2,
        gkSection: 'defending', gkOrder: 2,
        top: true
    },

    {
        key: 'headerClearances',
        abbr: 'HC', title: 'Header Clearances', lbl: 'HC', icon: '🗣️',
        cardCls: st => st.headerClearances > 0 ? 'green' : '',
        outfieldSection: 'defending', outfieldOrder: 3,
        gkSection: 'defending', gkOrder: 3,
        top: true
    },

    {
        key: 'tackleFails',
        abbr: 'TF', title: 'Tackle Fails', lbl: 'TF', icon: '❌',
        cardCls: st => st.tackleFails > 0 ? 'red' : '',
        outfieldSection: 'defending', outfieldOrder: 4,
        gkSection: 'defending', gkOrder: 4,
        warn: true
    },

    {
        key: 'duelsWon',
        abbr: 'DW', title: 'Duels Won',
        top: true, matchOrder: 8, matchCls: v => v === 0 ? 'adv-zero' : ''
    },

    {
        key: 'duelsLost',
        abbr: 'DL', title: 'Duels Lost',
        warn: true, matchOrder: 9, matchCls: v => v === 0 ? 'adv-zero' : 'adv-lost'
    },

    {
        key: 'fouls',
        abbr: 'Fls', title: 'Fouls Committed', lbl: 'Fouls', icon: '⚠️',
        cardCls: st => st.fouls > 0 ? 'red' : '',
        outfieldSection: 'defending', outfieldOrder: 5,
        gkSection: 'defending', gkOrder: 5,
        warn: true
    },

    {
        key: 'yellowCards',
        abbr: '🟨', title: 'Yellow Cards',
        yc: true
    },

    {
        key: 'redCards',
        abbr: '🟥', title: 'Red Cards',
        rc: true
    },
];

// Derived — compact match statistics table, ordered by matchOrder.
export const PLAYER_STAT_TABLE = PLAYER_STAT_COLS
    .filter(c => c.matchOrder != null)
    .sort((a, b) => a.matchOrder - b.matchOrder);

// ─── Canonical zero-state for a player stats object ───────────────────
// Matches the initialisation in buildPlayerEventStats → ensureP.
export const PLAYER_STAT_ZERO = {
    passesCompleted: 0, passesFailed: 0, crossesCompleted: 0, crossesFailed: 0,
    shots: 0, shotsOnTarget: 0, shotsOffTarget: 0, shotsFoot: 0, shotsOnTargetFoot: 0, goalsFoot: 0,
    shotsHead: 0, shotsOnTargetHead: 0, goalsHead: 0,
    saves: 0, goals: 0, assists: 0, keyPasses: 0,
    duelsWon: 0, duelsLost: 0, interceptions: 0, tackles: 0, headerClearances: 0, tackleFails: 0,
    fouls: 0, yellowCards: 0, redCards: 0,
    setpieceTakes: 0, freekickGoals: 0, penaltiesTaken: 0, penaltiesScored: 0,
    subIn: false, subOut: false, injured: false,
};
