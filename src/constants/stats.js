/**
 * constants/stats.js — Player stat column definitions (unified for all three rendering surfaces)
 *
 * Single source of truth for:
 *   1. Stats-page outfield table   → entries with abbr  (warn/yc/rc flags)
 *   2. Match statistics compact table → entries with matchOrder (gkKey/gkAbbr override)
 *   3. Player dialog card sections → entries with section/outfieldOrder/gkOrder grouping
 *
 * section: 'shooting' | 'passing' | 'defending'
 * outfieldOrder — present if shown on outfield player card
 * gkOrder       — present if shown on GK card (GK cannot shoot)
 * Entries without abbr are card-only (not rendered in any table).
 * Computed entries (key starting '__') are derived in the renderer via _enrichSt().
 */

export const PLAYER_STAT_COLS = [
    // ── Goals & Shooting ──────────────────────────────────────────────────
    {
        key: 'goals',
        abbr: 'G', title: 'Goals', icon: '⚽',
        section: 'shooting', outfieldOrder: 1, gkOrder: 2,
        matchOrder: 6
    },

    {
        key: 'assists',
        abbr: 'A', title: 'Assists', icon: '👟',
        section: 'passing', outfieldOrder: 1, gkOrder: 1,
        matchOrder: 7
    },

    {
        key: 'keyPasses',
        abbr: 'KP', title: 'Key Passes', icon: '🔑',
        section: 'passing', outfieldOrder: 2, gkOrder: 2
    },

    {
        key: 'shots',
        abbr: 'Sh', title: 'Shots / Saves', icon: '🎯',
        section: 'shooting', outfieldOrder: 2,
        matchOrder: 5, gkKey: 'saves', gkAbbr: 'Sv'
    },

    {
        key: 'saves',
        title: 'Saves', icon: '🧤',
        section: 'shooting', gkOrder: 1
    },

    {
        key: 'shotsOnTarget',
        abbr: 'SoT', title: 'Shots on Target', icon: '✅',
        section: 'shooting', outfieldOrder: 3
    },

    {
        key: 'goalsFoot',
        title: 'Foot Goals', icon: '🦶',
        section: 'shooting', outfieldOrder: 4
    },

    {
        key: 'goalsHead',
        title: 'Head Goals', icon: '🗣️',
        section: 'shooting', outfieldOrder: 5
    },

    // ── Passing (computed card entries) ───────────────────────────────────
    {
        key: '__passAcc',
        title: 'Pass %', icon: '📨',
        section: 'passing', outfieldOrder: 3, gkOrder: 3
    },

    {
        key: '__crossAcc',
        title: 'Cross %', icon: '↗️',
        section: 'passing', outfieldOrder: 4, gkOrder: 4
    },

    {
        key: '__totalPass',
        title: 'Total', icon: '📈',
        section: 'passing', outfieldOrder: 5, gkOrder: 5
    },

    // ── Passing (table columns) ───────────────────────────────────────────
    {
        key: 'passesCompleted',
        abbr: 'SP', title: 'Successful Passes',
        matchOrder: 1
    },

    {
        key: 'passesFailed',
        abbr: 'UP', title: 'Unsuccessful Passes',
        warn: true, matchOrder: 2
    },

    {
        key: 'crossesCompleted',
        abbr: 'SC', title: 'Successful Crosses',
        matchOrder: 3
    },

    {
        key: 'crossesFailed',
        abbr: 'UC', title: 'Unsuccessful Crosses',
        warn: true, matchOrder: 4
    },

    // ── Defending & Duels ─────────────────────────────────────────────────
    {
        key: 'interceptions',
        abbr: 'INT', title: 'Interceptions', icon: '👁️',
        section: 'defending', outfieldOrder: 1, gkOrder: 1
    },

    {
        key: 'tackles',
        abbr: 'TKL', title: 'Tackles', icon: '🦵',
        section: 'defending', outfieldOrder: 2, gkOrder: 2
    },

    {
        key: 'headerClearances',
        abbr: 'HC', title: 'Header Clearances', icon: '🗣️',
        section: 'defending', outfieldOrder: 3, gkOrder: 3
    },

    {
        key: 'tackleFails',
        abbr: 'TF', title: 'Tackle Fails', icon: '❌',
        section: 'defending', outfieldOrder: 4, gkOrder: 4,
        warn: true
    },

    {
        key: 'duelsWon',
        abbr: 'DW', title: 'Duels Won',
        matchOrder: 8
    },

    {
        key: 'duelsLost',
        abbr: 'DL', title: 'Duels Lost',
        warn: true, matchOrder: 9
    },

    {
        key: 'fouls',
        abbr: 'Fls', title: 'Fouls Committed', icon: '⚠️',
        section: 'defending', outfieldOrder: 5, gkOrder: 5,
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
