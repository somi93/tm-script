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

// ─── Match event action labels & CSS classes ──────────────────────────
export const ACTION_LABELS = {
    pass_ok: 'pass ✓', pass_fail: 'pass ✗', cross_ok: 'cross ✓', cross_fail: 'cross ✗',
    shot: 'shot', save: 'save', goal: 'goal', assist: 'assist',
    duel_won: 'duel ✓', duel_lost: 'duel ✗',
    intercept: 'INT', tackle: 'TKL', header_clear: 'HC', tackle_fail: 'TF',
    foul: 'foul', yellow: '🟨', red: '🟥'
};
export const ACTION_CLS = {
    pass_ok: 'shot', pass_fail: 'lost', cross_ok: 'shot', cross_fail: 'lost',
    shot: 'shot', save: 'shot', goal: 'goal', assist: 'goal',
    duel_won: 'shot', duel_lost: 'lost',
    intercept: 'shot', tackle: 'shot', header_clear: 'shot', tackle_fail: 'lost',
    foul: 'lost', yellow: 'lost', red: 'lost'
};
