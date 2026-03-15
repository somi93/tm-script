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
