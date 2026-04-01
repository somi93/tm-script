/**
 * constants/match.js — Match video patterns, tactic maps, style classification, and action labels
 */

// ─── Match video patterns ─────────────────────────────────────────────
export const PASS_VIDS    = /^(short|preshort|through|longball|gkthrow|gkkick)/;
export const CROSS_VIDS   = /^(wing(?!start)|cornerkick|freekick)/;
export const DEFWIN_VIDS  = /^defwin/;
export const FINISH_VIDS  = /^(finish|finishlong|header|acrobat)/;
export const RUN_DUEL_VIDS = /^finrun/;

// ─── Attacking style classification ──────────────────────────────────
export const ATTACK_STYLES = [
    { key: 'cou',  label: 'Direct' },
    { key: 'kco',  label: 'Direct' },
    { key: 'klo',  label: 'Long Balls' },
    { key: 'sho',  label: 'Short Passing' },
    { key: 'thr',  label: 'Through Balls' },
    { key: 'lon',  label: 'Long Balls' },
    { key: 'win',  label: 'Wings' },
    { key: 'doe',  label: 'Corners' },
    { key: 'dire', label: 'Free Kicks' },
];
export const STYLE_ORDER   = ['Direct', 'Short Passing', 'Through Balls', 'Long Balls', 'Wings', 'Corners', 'Free Kicks', 'Penalties'];
export const SKIP_PREFIXES = new Set(['card', 'cod', 'inj']);

// ─── Tactic maps ──────────────────────────────────────────────────────
export const STYLE_MAP       = { 1: 'Balanced', 2: 'Direct', 3: 'Wings', 4: 'Short Passing', 5: 'Long Balls', 6: 'Through Balls' };
export const STYLE_MAP_SHORT = { 1: 'Balanced', 2: 'Direct', 3: 'Wings', 4: 'Short', 5: 'Long', 6: 'Through' };
export const MENTALITY_MAP      = { 1: 'V.Def', 2: 'Def', 3: 'Sl.Def', 4: 'Normal', 5: 'Sl.Att', 6: 'Att', 7: 'V.Att' };
export const MENTALITY_MAP_LONG = { 1: 'Very Defensive', 2: 'Defensive', 3: 'Slightly Defensive', 4: 'Normal', 5: 'Slightly Attacking', 6: 'Attacking', 7: 'Very Attacking' };
export const FOCUS_MAP          = { 1: 'Balanced', 2: 'Left', 3: 'Central', 4: 'Right' };
