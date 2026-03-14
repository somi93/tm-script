/**
 * tm-constants.js — Shared constants for TrophyManager userscripts
 *
 * Usage (via Tampermonkey @require, must load before tm-lib.js):
 *   // @require  file://H:/projects/Moji/tmscripts/lib/tm-constants.js
 *
 * Exposed as: TmConst
 */


    const WEIGHT_R5 = [
        [0.41029304, 0.18048062, 0.56730138, 1.06344654, 1.02312672, 0.40831256, 0.58235457, 0.12717479, 0.05454137, 0.09089830, 0.42381693, 0.04626272, 0.02199046, 0],
        [0.42126371, 0.18293193, 0.60567629, 0.91904794, 0.89070915, 0.40038476, 0.56146633, 0.15053902, 0.15955429, 0.15682932, 0.42109742, 0.09460329, 0.03589655, 0],
        [0.23412419, 0.32032289, 0.62194779, 0.63162534, 0.63143081, 0.45218831, 0.47370658, 0.55054737, 0.17744915, 0.39932519, 0.26915814, 0.16413124, 0.07404301, 0],
        [0.27276905, 0.26814289, 0.61104798, 0.39865092, 0.42862643, 0.43582015, 0.46617076, 0.44931076, 0.25175412, 0.46446692, 0.29986350, 0.43843061, 0.21494592, 0],
        [0.25219260, 0.25112993, 0.56090649, 0.18230261, 0.18376490, 0.45928749, 0.53498118, 0.59461481, 0.09851189, 0.61601950, 0.31243959, 0.65402884, 0.29982016, 0],
        [0.28155678, 0.24090675, 0.60680245, 0.19068879, 0.20018012, 0.45148647, 0.48230007, 0.42982389, 0.26268609, 0.57933805, 0.31712419, 0.65824985, 0.29885649, 0],
        [0.22029884, 0.29229690, 0.63248227, 0.09904394, 0.10043602, 0.47469498, 0.52919791, 0.77555880, 0.10531819, 0.71048302, 0.27667115, 0.56813972, 0.21537826, 0],
        [0.21151292, 0.35804710, 0.88688492, 0.14391236, 0.13769621, 0.46586605, 0.34446036, 0.51377701, 0.59723919, 0.75126119, 0.16550722, 0.29966502, 0.12417045, 0],
        [0.35479780, 0.14887553, 0.43273380, 0.00023928, 0.00021111, 0.46931131, 0.57731335, 0.41686333, 0.05607604, 0.62121195, 0.45370457, 1.03660702, 0.43205492, 0],
        [0.45462811, 0.30278232, 0.45462811, 0.90925623, 0.45462811, 0.90925623, 0.45462811, 0.45462811, 0.30278232, 0.15139116, 0.15139116]
    ];

    const WEIGHT_RB = [
        [0.10493615, 0.05208547, 0.07934211, 0.14448971, 0.13159554, 0.06553072, 0.07778375, 0.06669303, 0.05158306, 0.02753168, 0.12055170, 0.01350989, 0.02549169, 0.03887550],
        [0.07715535, 0.04943315, 0.11627229, 0.11638685, 0.12893778, 0.07747251, 0.06370799, 0.03830611, 0.10361093, 0.06253997, 0.09128094, 0.01314110, 0.02449199, 0.03726305],
        [0.08219824, 0.08668831, 0.07434242, 0.09661001, 0.08894242, 0.08998026, 0.09281287, 0.08868309, 0.04753574, 0.06042619, 0.05396986, 0.05059984, 0.05660203, 0.03060871],
        [0.06744248, 0.06641401, 0.09977251, 0.08253749, 0.09709316, 0.09241026, 0.08513703, 0.06127851, 0.10275520, 0.07985941, 0.04618960, 0.03927270, 0.05285911, 0.02697852],
        [0.07304213, 0.08174111, 0.07248656, 0.08482334, 0.07078726, 0.09568392, 0.09464529, 0.09580381, 0.04746231, 0.07093008, 0.04595281, 0.05955544, 0.07161249, 0.03547345],
        [0.06527363, 0.06410270, 0.09701305, 0.07406706, 0.08563595, 0.09648566, 0.08651209, 0.06357183, 0.10819222, 0.07386495, 0.03245554, 0.05430668, 0.06572005, 0.03279859],
        [0.07842736, 0.07744888, 0.07201150, 0.06734457, 0.05002348, 0.08350204, 0.08207655, 0.11181914, 0.03756112, 0.07486004, 0.06533972, 0.07457344, 0.09781475, 0.02719742],
        [0.06545375, 0.06145378, 0.10503536, 0.06421508, 0.07627526, 0.09232981, 0.07763931, 0.07001035, 0.11307331, 0.07298351, 0.04248486, 0.06462713, 0.07038293, 0.02403557],
        [0.07738289, 0.05022488, 0.07790481, 0.01356516, 0.01038191, 0.06495444, 0.07721954, 0.07701905, 0.02680715, 0.07759692, 0.12701687, 0.15378395, 0.12808992, 0.03805251],
        [0.07466384, 0.07466384, 0.07466384, 0.14932769, 0.10452938, 0.14932769, 0.10452938, 0.10344411, 0.07512610, 0.04492581, 0.04479831]
    ];

    /* ─── Color levels & display thresholds ─── */
    const COLOR_LEVELS = [
        { color: '#ff4c4c' }, { color: '#ff8c00' }, { color: '#ffd700' },
        { color: '#90ee90' }, { color: '#00cfcf' }, { color: '#5b9bff' }, { color: '#cc88ff' }
    ];
    const R5_THRESHOLDS = [110, 100, 90, 80, 70, 60, 0];
    const TI_THRESHOLDS = [12, 9, 6, 4, 2, 1, -Infinity];
    const REC_THRESHOLDS = [5.5, 5, 4, 3, 2, 1, 0];
    const RTN_THRESHOLDS = [90, 60, 40, 30, 20, 10, 0];

    const WAGE_RATE = 15.8079;
    const _TRAINING1 = new Date('2023-01-16T23:00:00Z');
    const _SEASON_DAYS = 84;

    /* Positional defense/offense bonus multipliers (outfield only, index 0-8) */
    const POS_MULTIPLIERS = [0.3, 0.3, 0.9, 0.6, 1.5, 0.9, 0.9, 0.6, 0.3];

    /* ASI → total skill points formula constants */
    const ASI_WEIGHT_OUTFIELD = 263533760000; // 2^9 * 5^4 * 7^7 * 128
    const ASI_WEIGHT_GK = 48717927500;
    const SKILL_DEFS = [
        // shared (isGK + isOutfield) — must stay at the top; indices 0-2 match both weight matrices
        { name: 'Strength', key: 'strength', isGK: true, isOutfield: true, category: 'Physical', id: 0 },
        { name: 'Stamina', key: 'stamina', isGK: true, isOutfield: true, category: 'Physical', id: 1 },
        { name: 'Pace', key: 'pace', isGK: true, isOutfield: true, category: 'Physical', id: 2 },
        // outfield-only (indices 3-13 after filter)
        { name: 'Marking', key: 'marking', isOutfield: true, category: 'Tactical', id: 3 },
        { name: 'Tackling', key: 'tackling', isOutfield: true, category: 'Tactical', id: 4 },
        { name: 'Workrate', key: 'workrate', isOutfield: true, category: 'Tactical', id: 5 },
        { name: 'Positioning', key: 'positioning', isOutfield: true, category: 'Tactical', id: 6 },
        { name: 'Passing', key: 'passing', isOutfield: true, category: 'Technical', id: 7 },
        { name: 'Crossing', key: 'crossing', isOutfield: true, category: 'Technical', id: 8 },
        { name: 'Technique', key: 'technique', isOutfield: true, category: 'Technical', id: 9 },
        { name: 'Heading', key: 'heading', isOutfield: true, category: 'Physical', id: 10 },
        { name: 'Finishing', key: 'finishing', isOutfield: true, category: 'Technical', id: 11 },
        { name: 'Longshots', key: 'longshots', isOutfield: true, category: 'Technical', id: 12 },
        { name: 'Set Pieces', key: 'set_pieces', isOutfield: true, category: 'Technical', id: 13 },
        // GK-only (indices 3-10 after filter)
        { name: 'Handling', key: 'handling', isGK: true, category: 'Technical', id: 3 },
        { name: 'One on ones', key: 'oneonones', isGK: true, category: 'Tactical', key2: 'one_on_ones', id: 4 },
        { name: 'Reflexes', key: 'reflexes', isGK: true, category: 'Technical', id: 5 },
        { name: 'Aerial Ability', key: 'arialability', isGK: true, category: 'Tactical', key2: 'aerial_ability', id: 6 },
        { name: 'Jumping', key: 'jumping', isGK: true, category: 'Physical', id: 7 },
        { name: 'Communication', key: 'communication', isGK: true, category: 'Tactical', id: 8 },
        { name: 'Kicking', key: 'kicking', isGK: true, category: 'Technical', id: 9 },
        { name: 'Throwing', key: 'throwing', isGK: true, category: 'Technical', id: 10 },
    ];

    const SKILL_DEFS_OUT = SKILL_DEFS.filter(s => s.isOutfield);
    const SKILL_DEFS_GK = SKILL_DEFS.filter(s => s.isGK);

    /* ─── Transfer-API short skill keys (in API response order) ─────────── */
    const SKILL_KEYS_OUT = ['str','sta','pac','mar','tac','wor','pos','pas','cro','tec','hea','fin','lon','set'];
    /* GK: str/sta/pac come first (shared), then GK-only in Transfer-API response order.
       NOTE: GRAPH_KEYS_GK (below) follows the ASI weight-matrix index order — different sequence. */
    const SKILL_KEYS_GK  = ['str','sta','pac','han','one','ref','ari','jum','com','kic','thr'];
    const SKILL_KEYS_ALL = [...SKILL_KEYS_OUT, ...SKILL_KEYS_GK.filter(s => !SKILL_KEYS_OUT.includes(s))];
    const SKILL_LABELS   = {
        str:'Str', sta:'Sta', pac:'Pac', mar:'Mar', tac:'Tac', wor:'Wor',
        pos:'Pos', pas:'Pas', cro:'Cro', tec:'Tec', hea:'Hea', fin:'Fin',
        lon:'Lon', set:'Set', han:'Han', one:'One', ref:'Ref', ari:'Aer',
        jum:'Jum', com:'Com', kic:'Kic', thr:'Thr',
    };

    /* Ordered short-label arrays derived from SKILL_LABELS.
       SKILL_LABELS_GK follows the weight-matrix / GRAPH_KEYS_GK index order, NOT SKILL_KEYS_GK order. */
    const SKILL_LABELS_OUT = SKILL_KEYS_OUT.map(k => SKILL_LABELS[k]);
    const SKILL_LABELS_GK  = ['str','pac','jum','sta','one','ref','ari','com','kic','thr','han'].map(k => SKILL_LABELS[k]);
    /* Short skill keys in ASI weight-matrix index order for GK. Same underlying sequence as
       GRAPH_KEYS_GK but using the short-key aliases. Different from SKILL_KEYS_GK (Transfer-API order).
       Use this wherever index must align with WEIGHT_R5[9] / WEIGHT_RB[9]. */
    const SKILL_KEYS_GK_WEIGHT = ['str','pac','jum','sta','one','ref','ari','com','kic','thr','han'];
    /* SKILL_KEYS_GK order short labels (different from SKILL_LABELS_GK which is weight-matrix order) */
    const SKILL_NAMES_GK_SHORT = SKILL_KEYS_GK.map(k => SKILL_LABELS[k]);
    /* Full names in SKILL_KEYS_OUT / SKILL_KEYS_GK order (matches tooltip skill name strings) */
    const SKILL_NAMES_OUT = SKILL_DEFS_OUT.map(s => s.name);
    const SKILL_NAMES_GK  = SKILL_DEFS_GK.map(s => s.name);

    /* Graphs API long-key order. GRAPH_KEYS_GK matches the ASI weight-matrix index order
       (short-key equivalent of SKILL_LABELS_GK). Different from SKILL_KEYS_GK. */
    const GRAPH_KEYS_OUT = SKILL_DEFS_OUT.map(s => s.key);
    const GRAPH_KEYS_GK = ['strength', 'pace', 'jumping', 'stamina', 'one_on_ones', 'reflexes', 'aerial_ability', 'communication', 'kicking', 'throwing', 'handling'];

    const POSITION_MAP = {
        gk: { id: 9, position: 'GK', ordering: 0, color: '#4ade80' },
        dc: { id: 0, position: 'DC', ordering: 1, color: '#60a5fa' },
        dl: { id: 1, position: 'DL', ordering: 2, color: '#60a5fa' },
        dr: { id: 1, position: 'DR', ordering: 2, color: '#60a5fa' },
        dmc: { id: 2, position: 'DMC', ordering: 3, color: '#fbbf24' },
        dml: { id: 3, position: 'DML', ordering: 4, color: '#fbbf24' },
        dmr: { id: 3, position: 'DMR', ordering: 4, color: '#fbbf24' },
        mc: { id: 4, position: 'MC', ordering: 5, color: '#fbbf24' },
        ml: { id: 5, position: 'ML', ordering: 6, color: '#fbbf24' },
        mr: { id: 5, position: 'MR', ordering: 6, color: '#fbbf24' },
        omc: { id: 6, position: 'OMC', ordering: 8, color: '#fbbf24' },
        oml: { id: 7, position: 'OML', ordering: 7, color: '#fbbf24' },
        omr: { id: 7, position: 'OMR', ordering: 7, color: '#fbbf24' },
        fc: { id: 8, position: 'FC', ordering: 9, color: '#f87171' },
    };
    
    const AGE_THRESHOLDS = [30, 28, 26, 24, 22, 20, 0];

    // ─── Match video patterns ─────────────────────────────────────────────
    const PASS_VIDS    = /^(short|preshort|through|longball|gkthrow|gkkick)/;
    const CROSS_VIDS   = /^(wing(?!start)|cornerkick|freekick)/;
    const DEFWIN_VIDS  = /^defwin/;
    const FINISH_VIDS  = /^(finish|finishlong|header|acrobat)/;
    const RUN_DUEL_VIDS = /^finrun/;

    // ─── Attacking style classification ──────────────────────────────────
    const ATTACK_STYLES = [
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
    const STYLE_ORDER   = ['Direct', 'Short Passing', 'Through Balls', 'Long Balls', 'Wings', 'Corners', 'Free Kicks', 'Penalties'];
    const SKIP_PREFIXES = new Set(['card', 'cod', 'inj']);

    // ─── Tactic maps ──────────────────────────────────────────────────────
    const STYLE_MAP    = { 1: 'Balanced', 2: 'Direct', 3: 'Wings', 4: 'Short Passing', 5: 'Long Balls', 6: 'Through Balls' };
    const MENTALITY_MAP = { 1: 'V.Def', 2: 'Def', 3: 'Sl.Def', 4: 'Normal', 5: 'Sl.Att', 6: 'Att', 7: 'V.Att' };

    // ─── Gameplay / training calibration ─────────────────────────────────
    const SHARE_BONUS   = 0.25;  // routine share bonus per match
    const ROUTINE_CAP   = 40.0;  // max routine value (%)
    const ROUTINE_DECAY = 0.1;   // routine point loss per game missed
    const STD_FOCUS     = { '1': 3, '2': 0, '3': 1, '4': 5, '5': 4, '6': 2 };  // training group → weight-matrix index
    const SMOOTH_WEIGHT = 0.5;   // Laplace smoothing for custom training dot weights

    /* Training group definitions — index into SKILL_KEYS_OUT/GK.
       TRAINING_GROUPS_OUT: 6 groups [Str/Wor/Sta, Mar/Tac, Cro/Pac, Pas/Tec/Set, Hea/Pos, Fin/Lon]
       TRAINING_GROUPS_GK : 1 group  [all 11 GK skills] */
    const TRAINING_GROUPS_OUT = [[0,5,1], [3,4], [8,2], [7,9,13], [10,6], [11,12]];
    const TRAINING_GROUPS_GK  = [[0,1,2,3,4,5,6,7,8,9,10]];
    /* Human-readable names for standard training type IDs 1-6 */
    const TRAINING_NAMES  = { '1':'Technical','2':'Fitness','3':'Tactical','4':'Finishing','5':'Defending','6':'Wings' };
    /* Short per-group labels (parallel to TRAINING_GROUPS_OUT) */
    const TRAINING_LABELS = ['Str/Wor/Sta','Mar/Tac','Cro/Pac','Pas/Tec/Set','Hea/Pos','Fin/Lon'];

    // ─── Gameplay balance factors ─────────────────────────────────────────
    const GAMEPLAY = {
        HOME_ADVANTAGE:  0.04,  // ~4% home advantage applied in match prediction
        BLOOM_THRESHOLD: 18,    // skill level at which efficiency drops to lowest bracket
    };

    // ─── Application constants ────────────────────────────────────────────
    const MIN_WAGE_FOR_TI   = 30000;  // minimum wage for TI calculation
    const ROUTINE_SCALE     = 4.2;    // routine max = ROUTINE_SCALE * (ageYears - ROUTINE_AGE_MIN)
    const ROUTINE_AGE_MIN   = 15;     // minimum age for routine accumulation
    const POLL_INTERVAL_MS  = 60000;  // transfer sidebar / live polling interval
    const DEFAULT_PAGE_SIZE = 50;     // default pagination page size
    /* Skill efficiency brackets — fraction of overflow points absorbed per integer level.
       Format: [minLevel, efficiencyRate]. Evaluated top-to-bottom; first match wins. */
    const SKILL_EFFICIENCY_BRACKETS = [[18, 0.04], [15, 0.05], [5, 0.10], [0, 0.15]];

    // ─── Position ordering (full 24-slot, ascending: GK=0 … FCR=23) ─────
    const POSITION_ORDER = { gk: 0, dl: 1, dcl: 2, dc: 3, dcr: 4, dr: 5, dml: 6, dmcl: 7, dmc: 8, dmcr: 9, dmr: 10, ml: 11, mcl: 12, mc: 13, mcr: 14, mr: 15, oml: 16, omcl: 17, omc: 18, omcr: 19, omr: 20, fcl: 21, fc: 22, fcr: 23 };

    // ─── Match event action labels & CSS classes ──────────────────────────
    const ACTION_LABELS = { pass_ok: 'pass ✓', pass_fail: 'pass ✗', cross_ok: 'cross ✓', cross_fail: 'cross ✗', shot: 'shot', save: 'save', goal: 'goal', assist: 'assist', duel_won: 'duel ✓', duel_lost: 'duel ✗', intercept: 'INT', tackle: 'TKL', header_clear: 'HC', tackle_fail: 'TF', foul: 'foul', yellow: '🟨', red: '🟥' };
    const ACTION_CLS    = { pass_ok: 'shot', pass_fail: 'lost', cross_ok: 'shot', cross_fail: 'lost', shot: 'shot', save: 'shot', goal: 'goal', assist: 'goal', duel_won: 'shot', duel_lost: 'lost', intercept: 'shot', tackle: 'shot', header_clear: 'shot', tackle_fail: 'lost', foul: 'lost', yellow: 'lost', red: 'lost' };

    export const TmConst = {
        WEIGHT_R5,
        WEIGHT_RB,
        COLOR_LEVELS,
        R5_THRESHOLDS,
        TI_THRESHOLDS,
        REC_THRESHOLDS,
        AGE_THRESHOLDS,
        RTN_THRESHOLDS,
        WAGE_RATE,
        _TRAINING1,
        _SEASON_DAYS,
        POS_MULTIPLIERS,
        ASI_WEIGHT_OUTFIELD,
        ASI_WEIGHT_GK,
        GRAPH_KEYS_OUT,
        GRAPH_KEYS_GK,
        POSITION_MAP,
        SKILL_DEFS,
        SKILL_DEFS_OUT,
        SKILL_DEFS_GK,
        SKILL_KEYS_OUT,
        SKILL_KEYS_GK,
        SKILL_KEYS_ALL,
        SKILL_LABELS,
        SKILL_LABELS_OUT,
        SKILL_LABELS_GK,
        SKILL_KEYS_GK_WEIGHT,
        SKILL_NAMES_GK_SHORT,
        SKILL_NAMES_OUT,
        SKILL_NAMES_GK,
        PASS_VIDS,
        CROSS_VIDS,
        DEFWIN_VIDS,
        FINISH_VIDS,
        RUN_DUEL_VIDS,
        ATTACK_STYLES,
        STYLE_ORDER,
        SKIP_PREFIXES,
        STYLE_MAP,
        MENTALITY_MAP,
        SHARE_BONUS,
        ROUTINE_CAP,
        ROUTINE_DECAY,
        STD_FOCUS,
        SMOOTH_WEIGHT,
        TRAINING_GROUPS_OUT,
        TRAINING_GROUPS_GK,
        TRAINING_NAMES,
        TRAINING_LABELS,
        MIN_WAGE_FOR_TI,
        ROUTINE_SCALE,
        ROUTINE_AGE_MIN,
        POLL_INTERVAL_MS,
        DEFAULT_PAGE_SIZE,
        SKILL_EFFICIENCY_BRACKETS,
        GAMEPLAY,
        POSITION_ORDER,
        ACTION_LABELS,
        ACTION_CLS,
    };

