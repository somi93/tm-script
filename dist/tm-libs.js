
// ─── lib/tm-constants.js ────────────────────────────────────

/**
 * tm-constants.js — Shared constants for TrophyManager userscripts
 *
 * Usage (via Tampermonkey @require, must load before tm-lib.js):
 *   // @require  file://H:/projects/Moji/tmscripts/lib/tm-constants.js
 *
 * Exposed as: window.TmConst
 */

(function () {
    'use strict';

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

    window.TmConst = {
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
    };

})();



// ─── lib/tm-position.js ─────────────────────────────────────

// tm-position.js — Canonical position helper
// Depends on: tm-constants.js  (window.TmConst.POSITION_MAP)
// Exposed as: window.TmPosition
(function () {
    'use strict';

    const MAP = window.TmConst.POSITION_MAP;

    // Maps POSITION_MAP id → filter group key used by shortlist filter buttons
    const FILTER_GROUPS = { 9: 'gk', 0: 'de', 1: 'de', 2: 'dm', 3: 'dm', 4: 'mf', 5: 'mf', 6: 'om', 7: 'om', 8: 'fw' };

    // Colors for grouped display (charts, legends) keyed by POSITION_MAP id
    const GROUP_COLORS = {
        9: '#4ade80',               // GK
        0: '#60a5fa', 1: '#60a5fa', // DC, DLR
        2: '#818cf8', 3: '#818cf8', // DMC, DMLR
        4: '#fbbf24', 5: '#fbbf24', // MC, MLR
        6: '#fb923c', 7: '#fb923c', // OMC, OMLR
        8: '#f87171',               // F
    };

    // Short group labels keyed by POSITION_MAP id
    const GROUP_LABELS = {
        9: 'GK', 0: 'DC', 1: 'DLR', 2: 'DMC', 3: 'DMLR',
        4: 'MC', 5: 'MLR', 6: 'OMC', 7: 'OMLR', 8: 'F',
    };

    // Normalize a raw position string to a POSITION_MAP key
    const norm = (pos) => (pos || '').replace(/sub/i, '').trim().toLowerCase().split(/[\/,]/)[0];

    window.TmPosition = {

        /**
         * Display label for a position string.
         * e.g. "subdc" → "DC",  "dl" → "DL",  null → "?"
         */
        label(pos) {
            if (!pos) return '?';
            const cleaned = pos.replace(/sub/i, '').trim().toUpperCase().split(/[\/,]/)[0];
            return cleaned || 'SUB';
        },

        /**
         * Position color from POSITION_MAP (for chips, badges).
         * e.g. 'gk' → '#4ade80'
         */
        color(pos) {
            return MAP[norm(pos)]?.color ?? '#aaa';
        },

        /**
         * Integer POSITION_MAP id for a position string key.
         * e.g. 'gk' → 9,  'dc' → 0
         */
        idFor(pos) {
            return MAP[norm(pos)]?.id ?? 0;
        },

        /**
         * Stat group classification: 'gk' | 'def' | 'mid' | 'att'
         * Used for grouping players in stats tables.
         */
        group(pos) {
            const p = norm(pos);
            if (p === 'gk') return 'gk';
            if (/^d/.test(p) || p === 'lb' || p === 'rb' || p === 'sw') return 'def';
            if (/^(fc|st|cf|lw|rw|lf|rf|fw)/.test(p)) return 'att';
            return 'mid';
        },

        /**
         * Chip variant key for TmUI.chip(): 'gk' | 'd' | 'm' | 'f'
         */
        variant(pos) {
            const p = norm(pos);
            if (p === 'gk') return 'gk';
            if (/^d/.test(p)) return 'd';
            if (/^f/.test(p) || /^(fc|st|cf|lw|rw)/.test(p)) return 'f';
            return 'm';
        },

        /**
         * CSS class for position pill in the history (tmh-* namespace).
         * e.g. 'gk' → 'tmh-pos-gk', 'dc' → 'tmh-pos-d'
         */
        cssClass(pos) {
            const p = norm(pos);
            if (!p) return '';
            if (p === 'gk') return 'tmh-pos-gk';
            if (/^dm/.test(p)) return 'tmh-pos-m';
            if (/^d/.test(p)) return 'tmh-pos-d';
            if (/^f/.test(p) || /^(fc|st|cf)/.test(p)) return 'tmh-pos-f';
            return 'tmh-pos-m';
        },

        /**
         * Filter group for a POSITION_MAP id number.
         * e.g. 9 → 'gk', 4 → 'mf', 8 → 'fw'
         */
        filterGroup(id) {
            return FILTER_GROUPS[id] ?? 'mf';
        },

        /**
         * Group color for a POSITION_MAP id number (charts, legends).
         * e.g. 9 → '#4ade80', 8 → '#f87171'
         */
        groupColor(id) {
            return GROUP_COLORS[id] ?? '#aaa';
        },

        /**
         * Short group label for a POSITION_MAP id number.
         * e.g. 9 → 'GK', 1 → 'DLR', 8 → 'F'
         */
        groupLabel(id) {
            return GROUP_LABELS[id] ?? '?';
        },
    };

})();



// ─── lib/tm-utils.js ────────────────────────────────────────

/**
 * tm-utils.js — Pure utility helpers for TrophyManager userscripts
 *
 * Must load after tm-constants.js.
 * Exposed as: window.TmUtils
 */

(function () {
    'use strict';

    const { COLOR_LEVELS } = window.TmConst;

    const getColor = (value, thresholds) => {
        for (let i = 0; i < thresholds.length; i++) {
            if (value >= thresholds[i]) return COLOR_LEVELS[i].color;
        }
        return COLOR_LEVELS[COLOR_LEVELS.length - 1].color;
    };

    /* Parse a coin / ASI / wage value (number or formatted string like "1,234") to integer */
    const parseNum = (v, fallback = 0) => {
        if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
        return parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10) || fallback;
    };

    /* Convert "age.months" key (e.g. "23.4") to absolute month count */
    const ageToMonths = (k) => { const [y, m] = k.split('.').map(Number); return y * 12 + m; };

    /* Convert absolute month count back to "age.months" key */
    const monthsToAge = (m) => `${Math.floor(m / 12)}.${m % 12}`;

    /* Classify a position string into a stat group: 'gk' | 'def' | 'mid' | 'att' */
    const classifyPosition = (pos) => window.TmPosition.group(pos || '');

    /* Format a position string for display (e.g. "subdc" → "DC", falsy → "?") */
    const posLabel = (pos) => window.TmPosition.label(pos);

    /* Round a number to 2 decimal places, returning a string (e.g. 3.1 → "3.10") */
    const fix2 = v => (Math.round(v * 100) / 100).toFixed(2);

    /* Format a large number with M/B/k suffix (for coins, ASI, wages: 1234567 → "1.2M") */
    const fmtCoins = (n) => {
        if (n == null || isNaN(n) || n === 0) return '-';
        if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(0) + 'k';
        return String(Math.round(n));
    };

    /* Map a match rating (0–10) to a hex color string (green → red scale) */
    const ratingColor = (r) => {
        if (!r || r === 0) return '#5a7a48';
        const v = Number(r);
        if (v >= 9.0) return '#00c040';
        if (v >= 8.5) return '#00dd50';
        if (v >= 8.0) return '#22e855';
        if (v >= 7.5) return '#44ee55';
        if (v >= 7.0) return '#66dd44';
        if (v >= 6.5) return '#88cc33';
        if (v >= 6.0) return '#99bb22';
        if (v >= 5.5) return '#aacc00';
        if (v >= 5.0) return '#bbcc00';
        if (v >= 4.5) return '#dd9900';
        if (v >= 4.0) return '#ee7733';
        if (v >= 3.5) return '#ee5533';
        if (v >= 3.0) return '#dd3333';
        if (v >= 2.0) return '#cc2222';
        return '#bb1111';
    };

    /**
     * Standard sort-header toggle.
     * Returns new { key, dir } where dir is 1 (asc) or -1 (desc).
     * @param {*} clickedKey
     * @param {*} currentKey
     * @param {number} currentDir — 1 or -1
     * @param {number} [defaultDir=-1] — direction when switching to a new column
     */
    const toggleSort = (clickedKey, currentKey, currentDir, defaultDir = -1) => {
        if (clickedKey === currentKey) return { key: currentKey, dir: currentDir * -1 };
        return { key: clickedKey, dir: defaultDir };
    };

    /**
     * Map a skill integer value (1–20) to a hex color string.
     * 20 → gold, 19 → silver, 16+ → green, 12+ → yellow, 8+ → orange, else → red.
     * @param {number|string} v
     * @returns {string}
     */
    const skillColor = (v) => {
        const n = parseInt(v);
        if (!n || n <= 0) return '#2a3a28';
        if (n >= 20) return '#d4af37';
        if (n >= 19) return '#c0c0c0';
        if (n >= 16) return '#66dd44';
        if (n >= 12) return '#cccc00';
        if (n >= 8)  return '#ee9900';
        return '#ee6633';
    };

    /**
     * Return display text and star CSS suffix for a skill value.
     * @param {number|string} v
     * @returns {{ display: string, starCls: string }}
     *   starCls is '' for plain values, ' star-gold' for 20, ' star-silver' for 19.
     */
    const formatSkill = (v) => {
        const n = parseInt(v);
        if (n >= 20) return { display: '★', starCls: ' star-gold' };
        if (n >= 19) return { display: '★', starCls: ' star-silver' };
        return { display: String(isFinite(n) ? n : ''), starCls: '' };
    };

    /**
     * TI efficiency weight for decimal skill distribution.
     * Returns the fraction of overflow points absorbed per unit above integer level.
     * @param {number} lvl — current integer skill level
     * @returns {number}
     */
    const skillEff = (lvl) => {
        if (lvl >= 20) return 0;
        const bracket = window.TmConst.SKILL_EFFICIENCY_BRACKETS.find(([min]) => lvl >= min);
        return bracket ? bracket[1] : 0.15;
    };

    /**
     * Returns top-3 threshold values for a set of columns across rows.
     * Used for CSS highlighting (top1/top2/top3) in stats tables.
     * @param {object[]} rows    — data rows
     * @param {string[]} cols    — column keys to compute thresholds for
     * @param {Function} getValue — (row, colKey) => number
     * @returns {{ [colKey]: { v1, v2, v3 } }}
     */
    const getTopNThresholds = (rows, cols, getValue) => {
        const tops = {};
        cols.forEach(col => {
            const vals = rows.map(r => getValue(r, col)).filter(v => v > 0);
            const sorted = [...new Set(vals)].sort((a, b) => b - a);
            tops[col] = { v1: sorted[0] || -1, v2: sorted[1] || -1, v3: sorted[2] || -1 };
        });
        return tops;
    };

    /**
     * Returns CSS class ('top1'/'top2'/'top3'/'') for a value against precomputed thresholds.
     * @param {number} val    — value to classify
     * @param {string} col    — column key
     * @param {object} tops   — result of getTopNThresholds()
     * @returns {string}
     */
    const topNClass = (val, col, tops) => {
        if (val <= 0) return '';
        const t = tops[col];
        if (!t) return '';
        if (val >= t.v1) return 'top1';
        if (val >= t.v2) return 'top2';
        if (val >= t.v3) return 'top3';
        return '';
    };

    window.TmUtils = { getColor, parseNum, ageToMonths, monthsToAge, classifyPosition, posLabel, fix2, fmtCoins, ratingColor, toggleSort, skillColor, formatSkill, skillEff, getTopNThresholds, topNClass };

})();



// ─── lib/tm-lib.js ──────────────────────────────────────────

﻿/**
 * tm-lib.js — Shared utility library for TrophyManager userscripts
 *
 * Exposed as: window.TmLib
 *
 */

(function () {
    'use strict';

    const {
        WEIGHT_R5, WEIGHT_RB,
        WAGE_RATE, _TRAINING1, _SEASON_DAYS,
        POS_MULTIPLIERS,
        ASI_WEIGHT_OUTFIELD, ASI_WEIGHT_GK,
        TRAINING_GROUPS_OUT, TRAINING_GROUPS_GK,
        ROUTINE_DECAY,
    } = window.TmConst;
    const { ageToMonths, monthsToAge } = window.TmUtils;


    /* ─── Internal helpers ─── */
    const _fix2 = v => (Math.round(v * 100) / 100).toFixed(2);
    /* Extract numeric value from either a plain number or a skill object { value } */
    const _sv = s => (typeof s === 'object' && s !== null) ? (s.value ?? 0) : Number(s);


    /* ═══════════════════════════════════════════════════════════
       _calcRemainderRaw — canonical raw-array remainder calculation.
       Shared by all scripts. Uses parseFloat for skillSum (handles
       both integer and decimal skills). Full guard: > 0.9 || !not20.
       Returns { remainder, remainderW2, not20, ratingR, rec }
       ═══════════════════════════════════════════════════════════ */
    const _calcRemainderRaw = (posIdx, skills, asi) => {
        const weight = posIdx === 9 ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
        const skillSum = skills.reduce((s, v) => s + parseFloat(v), 0);
        const remainder = Math.round((Math.pow(2, Math.log(weight * asi) / Math.log(128)) - skillSum) * 10) / 10;
        let rec = 0, ratingR = 0, rW1 = 0, rW2 = 0, not20 = 0;
        for (let i = 0; i < WEIGHT_RB[posIdx].length; i++) {
            rec     += skills[i] * WEIGHT_RB[posIdx][i];
            ratingR += skills[i] * WEIGHT_R5[posIdx][i];
            if (skills[i] !== 20) { rW1 += WEIGHT_RB[posIdx][i]; rW2 += WEIGHT_R5[posIdx][i]; not20++; }
        }
        if (remainder / not20 > 0.9 || !not20) { not20 = posIdx === 9 ? 11 : 14; rW1 = 1; rW2 = 5; }
        return { remainder, remainderW2: rW2, not20, ratingR, rec: parseFloat(_fix2((rec + remainder * rW1 / not20 - 2) / 3)) };
    };

    /* ═══════════════════════════════════════════════════════════
       calcR5 — compute R5 rating from raw arrays.
       @param posIdx  0=DC 1=DLR 2=DMC 3=DMLR 4=MC 5=MLR 6=OMC 7=OMLR 8=F 9=GK
       @param skills  numeric array (int or float) — 14 outfield / 11 GK
       @param asi     player ASI
       @param rou     routine 0–40 (omit or 0 = no bonus)
       @returns {number}
       ═══════════════════════════════════════════════════════════ */
    const calcR5 = (posIdx, skills, asi, rou) => {
        const r = _calcRemainderRaw(posIdx, skills, asi);
        const { pow, E } = Math;
        const routineBonus = (3 / 100) * (100 - 100 * pow(E, -(rou || 0) * 0.035));
        let rating = parseFloat(_fix2(r.ratingR + r.remainder * r.remainderW2 / r.not20 + routineBonus * 5));
        const goldstar = skills.filter(s => s === 20).length;
        const denom = skills.length - goldstar || 1;
        const skillsB = skills.map(s => s === 20 ? 20 : s + r.remainder / denom);
        /* Stamina (index 1) gets no routine bonus; all other skills do */
        const sr = skillsB.map((s, i) => i === 1 ? s : s + routineBonus);
        if (skills.length !== 11) {
            /* Outfield-only bonuses */
            const hb = sr[10] > 12
                ? parseFloat(_fix2((pow(E, (sr[10] - 10) ** 3 / 1584.77) - 1) * 0.8
                    + pow(E, sr[0] ** 2 * 0.007 / 8.73021) * 0.15
                    + pow(E, sr[6] ** 2 * 0.007 / 8.73021) * 0.05)) : 0;
            const fk = parseFloat(_fix2(pow(E, (sr[13] + sr[12] + sr[9] * 0.5) ** 2 * 0.002) / 327.92526));
            const ck = parseFloat(_fix2(pow(E, (sr[13] + sr[8]  + sr[9] * 0.5) ** 2 * 0.002) / 983.65770));
            const pk = parseFloat(_fix2(pow(E, (sr[13] + sr[11] + sr[9] * 0.5) ** 2 * 0.002) / 1967.31409));
            const ds = sr[0]**2 + sr[1]**2*0.5 + sr[2]**2*0.5 + sr[3]**2 + sr[4]**2 + sr[5]**2 + sr[6]**2;
            const os = sr[0]**2*0.5 + sr[1]**2*0.5 + sr[2]**2 + sr[3]**2 + sr[4]**2 + sr[5]**2 + sr[6]**2;
            const m = POS_MULTIPLIERS[posIdx];
            return parseFloat(_fix2(rating + hb + fk + ck + pk
                + parseFloat(_fix2(ds / 6 / 22.9**2)) * m
                + parseFloat(_fix2(os / 6 / 22.9**2)) * m));
        }
        /* GK: no set-piece / heading / positional bonuses */
        return parseFloat(_fix2(rating));
    };

    /* calcRec — REC score from raw arrays. @returns {number} */
    const calcRec = (posIdx, skills, asi) => _calcRemainderRaw(posIdx, skills, asi).rec;

    /* ═══════════════════════════════════════════════════════════
       calculatePlayerR5 — compute R5 for a player object.
       @returns {string} R5 rounded to 2 decimal places.
       ═══════════════════════════════════════════════════════════ */
    const calculatePlayerR5 = (position, player) =>
        calcR5(position.id, player.skills.map(_sv), player.asi, player.routine || 0).toFixed(2);

    /* ═══════════════════════════════════════════════════════════
       calculatePlayerREC — compute REC for a player object.
       @returns {string} REC rounded to 2 decimal places.
       ═══════════════════════════════════════════════════════════ */
    const calculatePlayerREC = (position, player) =>
        calcRec(position.id, player.skills.map(_sv), player.asi).toFixed(2);

    /* ═══════════════════════════════════════════════════════════
       TI / session constants & helpers
       ═══════════════════════════════════════════════════════════ */

    const _getCurrentSession = () => {
        const now = new Date();
        let day = (now.getTime() - _TRAINING1.getTime()) / 1000 / 3600 / 24;
        while (day > _SEASON_DAYS - 16 / 24) day -= _SEASON_DAYS;
        const s = Math.floor(day / 7) + 1;
        return s <= 0 ? 12 : s;
    };

    const calculateTIPerSession = (player) => {
        const totalTI = calculateTI(player);
        const session = _getCurrentSession();
        return totalTI !== null && session > 0 ? Number((totalTI / session).toFixed(1)) : null;
    }

    /* @returns {number|null} raw TI (total skill potential points), null if data insufficient */
    const calculateTI = (player) => {
        const { asi, wage, isGK } = player;
        if (!asi || !wage || wage <= window.TmConst.MIN_WAGE_FOR_TI) return null;
        const w = isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
        const { pow, log, round } = Math;
        const log27 = log(pow(2, 7));
        return round((pow(2, log(w * asi) / log27) - pow(2, log(w * wage / WAGE_RATE) / log27)) * 10);
    };

    /* ═══════════════════════════════════════════════════════════
       calcASIProjection — project future ASI, skill sum and
       sell-to-agent value after N trainings at a given avg TI.
       ═══════════════════════════════════════════════════════════ */
    const calcASIProjection = ({ player, trainings, avgTI }) => {
        const { asi, isGK = false, ageMonths = 0 } = player;
        const K = ASI_WEIGHT_OUTFIELD; // 263533760000 — same constant used for outfield AND GK formula base
        const base = Math.pow(asi * K, 1 / 7);
        const added = (avgTI * trainings) / 10;

        let newASI;
        let curSkillSum, futSkillSum;
        if (isGK) {
            const ss11 = base / 14 * 11;
            const fs11 = ss11 + added;
            newASI = Math.round(Math.pow(fs11 / 11 * 14, 7) / K);
            curSkillSum = ss11;
            futSkillSum = fs11;
        } else {
            newASI = Math.round(Math.pow(base + added, 7) / K);
            curSkillSum = base;
            futSkillSum = base + added;
        }

        const _agentVal = (si, totMonths) => {
            const a = totMonths / 12;
            if (a < 18) return 0;
            let p = Math.round(si * 500 * Math.pow(25 / a, 2.5));
            if (isGK) p = Math.round(p * 0.75);
            return p;
        };

        const curAgentVal = _agentVal(asi, ageMonths);
        const futAgentVal = _agentVal(newASI, ageMonths + trainings);

        return {
            newASI,
            asiDiff: newASI - asi,
            curSkillSum,
            futSkillSum,
            curAgentVal,
            futAgentVal,
            agentDiff: futAgentVal - curAgentVal,
        };
    };

    /* ─── Expose public API ─── */
    /* ═══════════════════════════════════════════════════════════
       Age key utilities & record gap filling
       ═══════════════════════════════════════════════════════════ */

    /* Distribute ASI-derived remainder equally across non-maxed skills. Returns plain number array for DB storage.
       SIMPLE FALLBACK ONLY — no training-group weights, no chaining across records.
       Use computeGrowthDecimals() (TmLib, multi-record chained) for the training-aware version,
       or TmLib.calcSkillDecimals() (single-snapshot training-aware) for the inspector.
       Named with 'Simple' suffix to prevent accidental misuse as the canonical version. */
    const calcSkillDecimalsSimple = (player) => {
        const K = player.isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
        if (!Array.isArray(player.skills)) {
            console.error('[calcSkillDecimalsSimple] player.skills missing or not array', player);
            return [];
        }
        const nums = player.skills.map(v => (typeof v === 'object' && v !== null) ? (parseFloat(v.value) || 0) : (parseFloat(v) || 0));
        const allSum = nums.reduce((s, v) => s + v, 0);
        const remainder = Math.round((Math.pow(2, Math.log(K * player.asi) / Math.log(128)) - allSum) * 10) / 10;
        const nonStar = nums.filter(v => v < 20).length;
        if (remainder <= 0) return nums;
        if (nonStar === 0) return nums.map(v => v + remainder / nums.length);  // all maxed — distribute equally
        return nums.map(v => v === 20 ? 20 : v + remainder / nonStar);
    };


    /**
     * Fill gaps in a records map by linearly interpolating SI and skills
     * between consecutive real snapshots. Mutates the records object in place.
     * Inserted entries are marked { _estimated: true }.
     * @param {Object} records — plain { "Y.M": { SI, skills } } map
     */
    const fillMissingMonths = (records) => {
        const keys = Object.keys(records).sort((a, b) => ageToMonths(a) - ageToMonths(b));
        const intSkills = (r) => r.skills.map(v => Math.floor(typeof v === 'string' ? parseFloat(v) : v));
        for (let idx = 0; idx < keys.length - 1; idx++) {
            const aM = ageToMonths(keys[idx]);
            const bM = ageToMonths(keys[idx + 1]);
            const gap = bM - aM;
            if (gap <= 1) continue;
            const rA = records[keys[idx]], rB = records[keys[idx + 1]];
            const siA = parseInt(rA.SI) || 0, siB = parseInt(rB.SI) || 0;
            const skA = intSkills(rA), skB = intSkills(rB);
            for (let step = 1; step < gap; step++) {
                const t = step / gap;
                const interpKey = monthsToAge(aM + step);
                if (records[interpKey]) continue;
                records[interpKey] = {
                    SI: Math.round(siA + (siB - siA) * t),
                    REREC: null, R5: null,
                    skills: skA.map((sa, i) => sa + Math.floor((skB[i] - sa) * t)),
                    _estimated: true
                };
            }
        }
    };

    /**
     * Training-aware decimal distribution for a single-snapshot record.
     * Returns an array of full (integer + decimal) skill values.
     * Use computeGrowthDecimals for multi-record chained pipelines;
     * use calcSkillDecimalsSimple as a no-training-data fallback.
     * @param {number[]} intSkills — integer skill values (length 11 or 14)
     * @param {number}   asi       — ASI value
     * @param {boolean}  isGK
     * @param {number[]} [gw]      — training group weight array; defaults to equal weights
     * @returns {number[]} full (decimal) skill values
     */
    const calcSkillDecimals = (intSkills, asi, isGK, gw) => {
        const N = intSkills.length;
        const GRP = isGK ? TRAINING_GROUPS_GK : TRAINING_GROUPS_OUT;
        const GRP_COUNT = GRP.length;
        if (!gw) gw = new Array(GRP_COUNT).fill(1 / GRP_COUNT);
        const KASIW = isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
        const totalPts = Math.pow(2, Math.log(KASIW * asi) / Math.log(128));
        const remainder = totalPts - intSkills.reduce((a, b) => a + b, 0);
        const eff = window.TmUtils.skillEff;
        const base = new Array(N).fill(0);
        let overflow = 0;
        for (let gi = 0; gi < GRP_COUNT; gi++) {
            const grp = GRP[gi], perSk = gw[gi] / grp.length;
            for (const si of grp) {
                if (si >= N) continue;
                if (intSkills[si] >= 20) overflow += perSk;
                else base[si] = perSk;
            }
        }
        const nonMax = intSkills.filter(v => v < 20).length;
        const ovfEach = nonMax > 0 ? overflow / nonMax : 0;
        const wE = base.map((b, i) => intSkills[i] >= 20 ? 0 : (b + ovfEach) * eff(intSkills[i]));
        const tot = wE.reduce((a, b) => a + b, 0);
        const shares = tot > 0 ? wE.map(x => x / tot) : new Array(N).fill(nonMax > 0 ? 1 / nonMax : 0);
        let dec = shares.map(s => Math.max(0, remainder * s));
        const CAP = 0.99;
        let passes = 0;
        do {
            let ovfl = 0, freeCount = 0;
            for (let i = 0; i < N; i++) {
                if (intSkills[i] >= 20) { dec[i] = 0; continue; }
                if (dec[i] > CAP) { ovfl += dec[i] - CAP; dec[i] = CAP; }
                else if (dec[i] < CAP) freeCount++;
            }
            if (ovfl > 0.0001 && freeCount > 0) {
                const add = ovfl / freeCount;
                for (let i = 0; i < N; i++) if (intSkills[i] < 20 && dec[i] < CAP) dec[i] += add;
            } else break;
        } while (++passes < 20);
        return intSkills.map((v, i) => v >= 20 ? 20 : v + dec[i]);
    };

    /**
     * Training-aware, chained decimal distribution across an age-key record sequence.
     * Standard multi-record version — propagates decimals chronologically using training
     * group weights and TI efficiency curves. Use this for full history pipelines.
     * For single-snapshot (inspector) use: TmLib.calcSkillDecimals(intSkills, asi, isGK, gw?).
     * For single-record fallback (no history): calcSkillDecimalsSimple() here in TmLib.
     * Returns a map from each ageKey to its decimal-fraction array (parallel to skills).
     * @param {Object}    records — plain { "Y.M": { SI, skills } } map
     * @param {string[]}  ageKeys — sorted age keys
     * @param {{ isGK: boolean }} player
     * @param {number[]}  gw — training group weight array (length 1 for GK, 6 for outfield)
     * @returns {Object<string, number[]>} ageKey → decimal array
     */
    const computeGrowthDecimals = (records, ageKeys, player, gw) => {
        const N = player.isGK ? 11 : 14;
        const GRP = player.isGK ? TRAINING_GROUPS_GK : TRAINING_GROUPS_OUT;
        const GRP_COUNT = GRP.length;
        const ASI_WEIGHT = player.isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
        const totalPts = (si) => Math.pow(2, Math.log(ASI_WEIGHT * (si || 0)) / Math.log(128));
        const eff = window.TmUtils.skillEff;
        const calcShares = (intS) => {
            const base = new Array(N).fill(0);
            let overflow = 0;
            for (let gi = 0; gi < GRP_COUNT; gi++) {
                const grp = GRP[gi];
                const perSk = gw[gi] / grp.length;
                for (const si of grp) {
                    if (intS[si] >= 20) overflow += perSk;
                    else base[si] = perSk;
                }
            }
            const nonMax = intS.filter(v => v < 20).length;
            const ovfEach = nonMax > 0 ? overflow / nonMax : 0;
            const w = base.map((b, i) => intS[i] >= 20 ? 0 : b + ovfEach);
            const wE = w.map((wi, i) => wi * eff(intS[i]));
            const tot = wE.reduce((a, b) => a + b, 0);
            return tot > 0 ? wE.map(x => x / tot) : new Array(N).fill(0);
        };
        const capDecimals = (decArr, intArr) => {
            const CAP = 0.99;
            const d = [...decArr];
            let overflow = 0, passes = 0;
            do {
                overflow = 0;
                let freeCount = 0;
                for (let i = 0; i < N; i++) {
                    if (intArr[i] >= 20) { d[i] = 0; continue; }
                    if (d[i] > CAP) { overflow += d[i] - CAP; d[i] = CAP; }
                    else if (d[i] < CAP) freeCount++;
                }
                if (overflow > 0.0001 && freeCount > 0) {
                    const add = overflow / freeCount;
                    for (let i = 0; i < N; i++) {
                        if (intArr[i] < 20 && d[i] < CAP) d[i] += add;
                    }
                }
            } while (overflow > 0.0001 && ++passes < 20);
            return d;
        };
        const safeSkills = (skills) => skills.map(v => {
            const n = typeof v === 'object' ? v.value : v;
            return isFinite(n) ? Math.floor(n) : 0;
        });
        const result = {};
        const r0 = records[ageKeys[0]];
        const rem0 = totalPts(r0.SI) - safeSkills(r0.skills).reduce((a, b) => a + b, 0);
        let dec = capDecimals(calcShares(safeSkills(r0.skills)).map(s => Math.max(0, rem0 * s)), safeSkills(r0.skills));
        result[ageKeys[0]] = dec;
        for (let m = 1; m < ageKeys.length; m++) {
            const prevKey = ageKeys[m - 1], currKey = ageKeys[m];
            const piSkills = safeSkills(records[prevKey].skills), ciSkills = safeSkills(records[currKey].skills);
            const ptg = totalPts(records[prevKey].SI), ctg = totalPts(records[currKey].SI);
            const delta = ctg - ptg;
            const cRem = ctg - ciSkills.reduce((a, b) => a + b, 0);
            const gains = calcShares(piSkills).map(s => delta * s);
            let newDec = dec.map((d, i) => d + gains[i]);
            for (let i = 0; i < N; i++) {
                const chg = ciSkills[i] - piSkills[i];
                if (chg > 0) { newDec[i] -= chg; if (newDec[i] < 0) newDec[i] = 0; }
                if (ciSkills[i] >= 20) newDec[i] = 0;
            }
            const ndSum = newDec.reduce((a, b) => a + b, 0);
            if (ndSum > 0.001) {
                const scale = cRem / ndSum;
                dec = capDecimals(newDec.map((d, i) => ciSkills[i] >= 20 ? 0 : d * scale), ciSkills);
            } else {
                dec = capDecimals(calcShares(ciSkills).map(s => Math.max(0, cRem * s)), ciSkills);
            }
            result[currKey] = dec;
        }
        return result;
    };

    /**
     * Estimate past routine values for a set of age keys from games-played history.
     * @param {number}   liveRou    — current (live) routine value
     * @param {number}   liveAgeY   — current age in full years
     * @param {number}   liveAgeM   — current age month component (0-11)
     * @param {{ gpBySeason: Object<number,number>, curSeason: number }|null} gpData
     * @param {string[]} ageKeys    — "Y.M" formatted age keys to estimate
     * @returns {Object<string,number>}  ageKey → estimated routine
     */
    const buildRoutineMap = (liveRou, liveAgeY, liveAgeM, gpData, ageKeys) => {
        const map = {};
        if (!gpData) { ageKeys.forEach(k => { map[k] = liveRou; }); return map; }
        const { gpBySeason, curSeason } = gpData;
        const curWeek = _getCurrentSession();
        const curAgeMonths = liveAgeY * 12 + liveAgeM;
        for (const ageKey of ageKeys) {
            const recMon = ageToMonths(ageKey);
            const weeksBack = curAgeMonths - recMon;
            if (weeksBack <= 0) { map[ageKey] = liveRou; continue; }
            let gamesAfter = 0;
            for (let w = 0; w < weeksBack; w++) {
                const absWeek = (curSeason - 65) * 12 + (curWeek - 1) - w;
                const season = 65 + Math.floor(absWeek / 12);
                const gp = gpBySeason[season] || 0;
                gamesAfter += (season === curSeason) ? (curWeek > 0 ? gp / curWeek : 0) : gp / 12;
            }
            map[ageKey] = Math.max(0, Math.round((liveRou - gamesAfter * ROUTINE_DECAY) * 10) / 10);
        }
        return map;
    };

    /* ═══════════════════════════════════════════════════════════
       getPositionIndex — normalize a position string to a 0–9 index.
       Handles comma-separated strings (takes first token), strips
       non-alpha chars, case-insensitive.
       0=DC 1=DLR 2=DMC 3=DMLR 4=MC 5=MLR 6=OMC 7=OMLR 8=F 9=GK
       @returns {number} 0–9, defaults to 8 (FC) for unknown positions
       ═══════════════════════════════════════════════════════════ */
    const getPositionIndex = pos => {
        const p = (pos || '').split(',')[0].toLowerCase().replace(/[^a-z]/g, '');
        switch (p) {
            case 'gk':                              return 9;
            case 'dc': case 'dcl': case 'dcr':     return 0;
            case 'dl': case 'dr':                   return 1;
            case 'dmc': case 'dmcl': case 'dmcr':  return 2;
            case 'dml': case 'dmr':                 return 3;
            case 'mc': case 'mcl': case 'mcr':     return 4;
            case 'ml': case 'mr':                   return 5;
            case 'omc': case 'omcl': case 'omcr':  return 6;
            case 'oml': case 'omr':                 return 7;
            default:                                return 8;
        }
    };

    window.TmLib = {
        getPositionIndex,
        calcR5,
        calcRec,
        calcSkillDecimalsSimple,
        calcSkillDecimals,
        fillMissingMonths,
        computeGrowthDecimals,
        buildRoutineMap,
        calculatePlayerR5,
        calculatePlayerREC,
        calcASIProjection,
        getCurrentSession: _getCurrentSession,
        calculateTI,
        calculateTIPerSession,
    };

})();



// ─── lib/tm-playerdb.js ─────────────────────────────────────

/**
 * tm-playerdb.js — IndexedDB storage for TrophyManager player data
 *
 * Usage (via Tampermonkey @require):
 *   // @require  file://H:/projects/Moji/tmscripts/lib/tm-playerdb.js
 *
 * Exposed globals:
 *   window.TmPlayerDB      — active players, preloaded into RAM cache on init
 *   window.TmPlayerArchiveDB — retired/deleted players, never preloaded, read on-demand
 *
 * TmPlayerDB API:
 *   .init()             → Promise — opens DB, migrates localStorage, preloads cache
 *   .get(pid)           → object|null  (sync, from cache)
 *   .set(pid, value)    → Promise
 *   .remove(pid)        → Promise
 *   .allPids()          → string[]
 *   .archive(pid)       → Promise — moves record to ArchiveDB and removes from active
 *
 * TmPlayerArchiveDB API:
 *   .init()             → Promise
 *   .get(pid)           → Promise<object|null>  (async, on-demand)
 *   .set(pid, value)    → Promise
 */

(function () {
    'use strict';

    /* ═══════════════════════════════════════════════════════════
       TmPlayerDB — active players
       Preloads all records into sync cache on init.
       localStorage has 5 MB limit; IndexedDB has hundreds of MB.
       ═══════════════════════════════════════════════════════════ */
    const PlayerDB = (() => {
        const DB_NAME = 'TMPlayerData';
        const STORE_NAME = 'players';
        const DB_VERSION = 1;
        let db = null;
        const cache = {};

        const open = () => new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const d = e.target.result;
                if (!d.objectStoreNames.contains(STORE_NAME))
                    d.createObjectStore(STORE_NAME);
            };
            req.onsuccess = (e) => { db = e.target.result; resolve(db); };
            req.onerror = (e) => reject(e.target.error);
        });

        /** Sync read from cache (call after init) */
        const get = (pid) => cache[pid] || null;

        /** Async write: updates cache immediately + persists to IndexedDB */
        const set = (pid, value) => {
            cache[pid] = value;
            if (!db) return Promise.resolve();
            const idbKey = parseInt(pid);
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).put(value, isFinite(idbKey) ? idbKey : pid);
                tx.oncomplete = () => resolve();
                tx.onerror = (e) => reject(e.target.error);
            }).catch(e => console.warn('[DB] write failed:', e));
        };

        /** Async delete: removes from cache + IndexedDB (deletes both integer and string key variants) */
        const remove = (pid) => {
            delete cache[pid];
            if (!db) return Promise.resolve();
            const idbKey = parseInt(pid);
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                if (isFinite(idbKey)) store.delete(idbKey);
                store.delete(String(pid));
                tx.oncomplete = () => resolve();
                tx.onerror = (e) => reject(e.target.error);
            }).catch(e => console.warn('[DB] delete failed:', e));
        };

        /** Get all pids (from cache, sync) */
        const allPids = () => Object.keys(cache);

        /** Move a record to ArchiveDB and remove from active */
        const archive = (pid) => {
            const record = get(pid);
            if (!record) return Promise.resolve();
            return window.TmPlayerArchiveDB.set(pid, record).then(() => remove(pid));
        };

        /** Init: open DB → migrate localStorage → preload cache */
        const init = async () => {
            await open();

            /* Migrate existing localStorage _data keys to IndexedDB */
            const toMigrate = [];
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (!k || !k.endsWith('_data')) continue;
                const pid = k.replace('_data', '');
                if (!/^\d+$/.test(pid)) continue;
                try {
                    const data = JSON.parse(localStorage.getItem(k));
                    if (data) toMigrate.push({ pid, data });
                    keysToRemove.push(k);
                } catch (e) { keysToRemove.push(k); }
            }
            if (toMigrate.length > 0) {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                for (const item of toMigrate) store.put(item.data, parseInt(item.pid));
                await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
                for (const k of keysToRemove) localStorage.removeItem(k);
                console.log(`%c[DB] Migrated ${toMigrate.length} player(s) from localStorage → IndexedDB`,
                    'font-weight:bold;color:#6cc040');
            }

            /* Preload ALL records into sync cache */
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const reqAll = store.getAll();
            const reqKeys = store.getAllKeys();
            await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
            for (let i = 0; i < reqKeys.result.length; i++)
                cache[reqKeys.result[i]] = reqAll.result[i];

            console.log(`[DB] Loaded ${Object.keys(cache).length} player(s) from IndexedDB`);

            /* Request persistent storage so Chrome won't auto-evict */
            if (navigator.storage && navigator.storage.persist) {
                navigator.storage.persist().then(granted => {
                    console.log(`[DB] Persistent storage: ${granted ? '✓ granted' : '✗ denied'}`);
                });
            }
        };

        return { init, get, set, remove, allPids, archive };
    })();

    /* ═══════════════════════════════════════════════════════════
       TmPlayerArchiveDB — retired/deleted players
       Never preloaded into RAM. Read on-demand only.
       Keeps TmPlayerDB cache lean as player count grows.
       ═══════════════════════════════════════════════════════════ */
    const PlayerArchiveDB = (() => {
        const DB_NAME = 'TMPlayerArchive';
        const STORE_NAME = 'players';
        const DB_VERSION = 1;
        let db = null;

        const open = () => new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const d = e.target.result;
                if (!d.objectStoreNames.contains(STORE_NAME))
                    d.createObjectStore(STORE_NAME);
            };
            req.onsuccess = (e) => { db = e.target.result; resolve(db); };
            req.onerror = (e) => reject(e.target.error);
        });

        const init = () => open().catch(e => console.warn('[ArchiveDB] open failed:', e));

        /** Async write — no cache */
        const set = (pid, value) => {
            if (!db) return Promise.resolve();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).put(value, pid);
                tx.oncomplete = () => resolve();
                tx.onerror = (e) => reject(e.target.error);
            }).catch(e => console.warn('[ArchiveDB] write failed:', e));
        };

        /** Async read — on-demand only */
        const get = (pid) => {
            if (!db) return Promise.resolve(null);
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const req = tx.objectStore(STORE_NAME).get(pid);
                req.onsuccess = () => resolve(req.result ?? null);
                req.onerror = (e) => reject(e.target.error);
            }).catch(() => null);
        };

        return { init, get, set };
    })();

    window.TmPlayerDB = PlayerDB;
    window.TmPlayerArchiveDB = PlayerArchiveDB;

    /* ═══════════════════════════════════════════════════════════
       TmMatchCacheDB — compressed match records
       Keyed by matchId (integer). Lazy-open: no explicit init() needed.
       Stores TmApi.compressMatch() output, not raw API blobs.
       ═══════════════════════════════════════════════════════════ */
    const MatchCacheDB = (() => {
        const DB_NAME = 'TMMatchCache';
        const STORE_NAME = 'matches';
        const DB_VERSION = 1;
        let db = null;
        let openPromise = null;

        const open = () => new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const d = e.target.result;
                if (!d.objectStoreNames.contains(STORE_NAME))
                    d.createObjectStore(STORE_NAME);
            };
            req.onsuccess = (e) => { db = e.target.result; resolve(db); };
            req.onerror = (e) => reject(e.target.error);
        });

        const ensureOpen = () => {
            if (db) return Promise.resolve(db);
            if (!openPromise) openPromise = open().catch(e => {
                openPromise = null;
                console.warn('[MatchCacheDB] open failed:', e);
                return null;
            });
            return openPromise;
        };

        /** @param {string|number} matchId  @returns {Promise<object|null>} */
        const get = (matchId) => ensureOpen().then(d => {
            if (!d) return null;
            return new Promise((resolve) => {
                const req = d.transaction(STORE_NAME, 'readonly')
                    .objectStore(STORE_NAME).get(parseInt(matchId));
                req.onsuccess = () => resolve(req.result ?? null);
                req.onerror = () => resolve(null);
            });
        });

        /** @param {string|number} matchId  @param {object} data  @returns {Promise<void>} */
        const set = (matchId, data) => ensureOpen().then(d => {
            if (!d) return;
            return new Promise((resolve) => {
                const tx = d.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).put(data, parseInt(matchId));
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            });
        });

        /**
         * Delete all entries whose matchId is NOT in the given set.
         * @param {(string|number)[]} keepIds
         * @returns {Promise<number>} count of deleted entries
         */
        const pruneExcept = (keepIds) => ensureOpen().then(d => {
            if (!d) return 0;
            const keepSet = new Set(keepIds.map(id => parseInt(id)));
            return new Promise((resolve) => {
                const tx = d.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                let deleted = 0;
                store.openCursor().onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (!cursor) return;
                    if (!keepSet.has(cursor.key)) { cursor.delete(); deleted++; }
                    cursor.continue();
                };
                tx.oncomplete = () => resolve(deleted);
                tx.onerror = () => resolve(0);
            });
        });

        return { get, set, pruneExcept };
    })();

    window.TmMatchCacheDB = MatchCacheDB;

})();



// ─── lib/tm-dbsync.js ───────────────────────────────────────

﻿/**
 * tm-dbsync.js €” Player DB sync orchestration for TrophyManager userscripts
 *
 * Depends on: window.TmConst, window.TmLib, window.TmPlayerDB, window.TmApi
 * Load order: tm-constants.js †’ tm-utils.js †’ tm-lib.js †’ tm-playerdb.js †’ tm-dbsync.js †’ tm-services.js
 *
 * Exposed as: window.TmSync
 */

(function () {
    'use strict';

    const { GRAPH_KEYS_OUT, GRAPH_KEYS_GK, ASI_WEIGHT_GK, ASI_WEIGHT_OUTFIELD } = window.TmConst;
    const { ageToMonths } = window.TmUtils;
    const { calcSkillDecimalsSimple, fillMissingMonths, computeGrowthDecimals, getCurrentSession, calculatePlayerR5, calculatePlayerREC } = window.TmLib;

    /* ”€”€”€ Private helpers (only used by analyzeGrowth) ”€”€”€ */

    /**
     * Compute training group weight array from training API response.
     * @param {boolean} isGK
     * @param {object|null} trainingInfo €” Raw training API response
     * @returns {number[]} gw €” group weights (length 1 for GK, 6 for outfield)
     */
    const buildGroupWeights = (player, trainingInfo) => {
        const count = player.isGK ? 1 : 6;
        const gw = new Array(count).fill(1 / count);
        if (player.isGK || !trainingInfo?.custom) return gw;
        const c = trainingInfo.custom;
        const cd = c.custom;
        if (c.custom_on && cd) {
            let dtot = 0;
            const dots = [];
            for (let i = 0; i < 6; i++) {
                const d = parseInt(cd['team' + (i + 1)]?.points) || 0;
                dots.push(d); dtot += d;
            }
            const sm = window.TmConst.SMOOTH_WEIGHT, den = dtot + 6 * sm;
            return dots.map(d => (d + sm) / den);
        } else {
            const STD_FOCUS = window.TmConst.STD_FOCUS;
            const fg = STD_FOCUS[String(c.team || '3')] ?? 1;
            const gw2 = new Array(6).fill(0.125);
            gw2[fg] = 0.375;
            return gw2;
        }
    };

    /* Wraps TmLib.buildRoutineMap; accepts raw player object + history API response */
    const buildRoutineMap = (ageKeys, tooltipPlayer, historyInfo) => {
        const curRoutine = tooltipPlayer?.routine;
        if (curRoutine == null || !historyInfo?.table?.total) return {};
        const totalRows = historyInfo.table.total
            .map(r => ({ ...r, season: parseInt(r.season) }))
            .filter(r => isFinite(r.season));
        if (!totalRows.length) return {};
        const gpBySeason = {};
        totalRows.forEach(r => { gpBySeason[r.season] = (gpBySeason[r.season] || 0) + (parseInt(r.games) || 0); });
        const curSeason = Math.max(...totalRows.map(r => r.season));
        return window.TmLib.buildRoutineMap(
            curRoutine,
            parseInt(tooltipPlayer?.age) || 0, parseInt(tooltipPlayer?.months) || 0,
            { gpBySeason, curSeason }, ageKeys
        );
    };

    /* -----------------------------------------------------------
       SYNC PLAYER STORE
       Decision matrix on every player page visit:
         hasCurWeek + (graphSync or opponent) †’ dispatches tm:growthUpdated (decimals already in DB)
         opponent with no cur week            †’ savePlayerVisit (no graphs access)
         graphSync + cur week missing         †’ savePlayerVisit (add this week)
         own player, no graphSync             †’ fetch graphs + fill full history
       @param {object}   player        Tooltip player object
       @param {object}   DBPlayer      Player object from the database
       ----------------------------------------------------------- */
    function syncPlayerStore(player, DBPlayer) {
        const api = window.TmApi;
        const isOwnPlayer = player.isOwnPlayer;
        if (!isOwnPlayer) {
            return savePlayerVisit(player, DBPlayer);
        }

        /* Skip full graph sync if current week already fully computed */
        const ageKey = player.ageMonthsString;
        const curRec = DBPlayer?.records?.[ageKey];
        const allComputed = DBPlayer?.records &&
            Object.values(DBPlayer.records).every(r => r.R5 != null && r.REREC != null);
        if (curRec?.R5 != null && curRec?.REREC != null && allComputed) {
            console.log(`[syncPlayerStore] ${ageKey} already fully computed €” dispatching growthUpdated`);
            window.dispatchEvent(new CustomEvent('tm:growthUpdated', { detail: { pid: player.id } }));
            return Promise.resolve(DBPlayer);
        }

        /* If only the current week is missing but all past records are computed,
           savePlayerVisit is enough €” no need to rebuild everything from graphs */
        const hasOtherRecords = DBPlayer?.records && Object.keys(DBPlayer.records).length > 0;
        const pastRecordsOk = hasOtherRecords &&
            Object.entries(DBPlayer.records)
                .filter(([k]) => k !== ageKey)
                .every(([, r]) => r.R5 != null && r.REREC != null);
        if (!curRec && pastRecordsOk) {
            console.log(`[syncPlayerStore] ${ageKey} missing, past records OK €” savePlayerVisit`);
            return savePlayerVisit(player, DBPlayer);
        }

        console.log('[syncPlayerStore] †’ fetching graphs+training+history');
        const graphKeys = player.isGK ? GRAPH_KEYS_GK : GRAPH_KEYS_OUT;

        /* If player already has training data from squad API, reconstruct trainingInfo
           from player.training (type id) + player.trainingCustom (JSON string) */
        const trainingInfoFromPlayer = (() => {
            if (player.isGK) return null;
            const raw = player.training_custom;
            const customParsed = raw ? (typeof raw === 'object' ? raw : (() => { try { return JSON.parse(raw); } catch (e) { return null; } })()) : null;
            if (!customParsed && !player.training) return null;
            return { custom: { team: String(player.training || '3'), custom_on: customParsed ? 1 : 0, custom: customParsed || {} } };
        })();

        const trainReq = trainingInfoFromPlayer
            ? Promise.resolve(trainingInfoFromPlayer)
            : api.fetchPlayerInfo(player.id, 'training');
        const histReq = api.fetchPlayerInfo(player.id, 'history');
        return Promise.all([api.fetchPlayerInfo(player.id, 'graphs'), trainReq, histReq]).then(([data, t, h]) => {
            if (!data) {
                console.warn('[syncPlayerStore] Graphs request failed €” falling back to savePlayerVisit');
                return savePlayerVisit(player, DBPlayer);
            }
            const newDBPlayer = buildStoreFromGraphs(player, data.graphs, DBPlayer, graphKeys);
            if (!newDBPlayer) {
                console.warn('[syncPlayerStore] buildStoreFromGraphs returned null €” falling back to savePlayerVisit');
                return savePlayerVisit(player, DBPlayer);
            }
            console.log(`[syncPlayerStore] buildStoreFromGraphs OK €” ${Object.keys(newDBPlayer.records).length} weeks, calling analyzeGrowth`);
            return analyzeGrowth(player, DBPlayer, t, h, newDBPlayer);
        });
    }

    /* -----------------------------------------------------------
       BUILD STORE FROM GRAPHS ENDPOINT DATA
       Parses the graphs API response into a PlayerDB store object.
       Reconstructs ASI history from skill_index (preferred) or by
       back-calculating from TI values (same formula as ASI calculator).
       Returns the populated store on success, null on bad/missing data.
       ----------------------------------------------------------- */
    function buildStoreFromGraphs(player, graphsRaw, DBPlayer, graphKeys) {
        try {
            const g = graphsRaw;
            if (!g?.[graphKeys[0]] || g[graphKeys[0]].length < 2) {
                console.warn('[buildStoreFromGraphs] missing or too-short graph data for key', graphKeys[0], '†’ null');
                return null;
            }
            const weekCount = g[graphKeys[0]].length;
            const SI = player.asi;
            const K = player.isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;

            const asiArr = (() => {
                /* skill_index preferred; may have extra pre-pro entry €” take last weekCount */
                if (g.skill_index?.length >= weekCount)
                    return g.skill_index.slice(-weekCount).map(v => parseInt(v) || 0);
                if (g.ti?.length >= weekCount) {
                    const tiOff = g.ti.length - weekCount; /* usually 1: TI has extra pre-pro entry */
                    const arr = new Array(weekCount);
                    arr[weekCount - 1] = SI; /* current ASI from tooltip */
                    for (let j = weekCount - 2; j >= 0; j--) {
                        const ti = parseInt(g.ti[j + 1 + tiOff]) || 0;
                        const base = Math.pow(arr[j + 1] * K, 1 / 7);
                        arr[j] = Math.max(0, Math.round(Math.pow(base - ti / 10, 7) / K));
                    }
                    return arr;
                }
                return new Array(weekCount).fill(0);
            })();

            const oldRecords = DBPlayer.records;
            DBPlayer.graphSync = true;
            DBPlayer.lastSeen = Date.now();
            DBPlayer.records = Object.fromEntries(
                Array.from({ length: weekCount }, (_, i) => {
                    const ageMonths = player.ageMonths - (weekCount - 1 - i);
                    const key = `${Math.floor(ageMonths / 12)}.${ageMonths % 12}`;
                    const existing = oldRecords[key];
                    const existingValid = existing?.locked && Array.isArray(existing.skills) && existing.skills.every(v => v != null && isFinite(v));
                    if (existingValid) return [key, existing];
                    return [key, {
                        SI: parseInt(asiArr[i]) || 0,
                        REREC: null,
                        R5: null,
                        skills: graphKeys.map(k => parseInt(g[k]?.[i]) || 0),
                        routine: null
                    }];
                })
            );
            return DBPlayer;
        } catch (e) {
            console.warn('[buildStoreFromGraphs] exception:', e.message);
            return null;
        }
    }

    /* -----------------------------------------------------------
       SAVE PLAYER VISIT TO GROWTH RECORD
       Writes DBPlayer.records["year.month"] = { SI, skills } on every visit.
       Skips locked records (written by squad sync). Calls analyzeGrowth
       afterwards to compute REREC/R5/decimals (fetches training+history
       internally if not provided).
       ----------------------------------------------------------- */
    function savePlayerVisit(player, DBPlayer) {
        const year = player.age;
        const month = player.months;
        const SI = player.asi;
        if (!SI || SI <= 0 || !year) {
            console.warn('[savePlayerVisit] early return — missing SI or age', { SI, year });
            return Promise.resolve(null);
        }
        const ageKey = `${year}.${month}`;
        try {
            if (!DBPlayer) DBPlayer = { records: {} };
            if (!DBPlayer.records) DBPlayer.records = {};
            const skillsC = calcSkillDecimalsSimple(player);
            if (DBPlayer.records[ageKey]?.locked) {
                console.log(`[TmPlayer] Record ${ageKey} is locked (squad sync) €” skipping overwrite`);
                return Promise.resolve(DBPlayer);
            }
            const existingRec = DBPlayer.records[ageKey];
            console.log(`[savePlayerVisit] existing record for ${ageKey}:`, existingRec);
            if (existingRec?.R5 != null && existingRec?.REREC != null &&
                Object.values(DBPlayer.records).every(r => r.R5 != null && r.REREC != null)) {
                DBPlayer.lastSeen = Date.now();
                window.TmPlayerDB.set(player.id, DBPlayer);
                return Promise.resolve(DBPlayer);
            }
            DBPlayer.records[ageKey] = { SI, REREC: null, R5: null, skills: skillsC, routine: null };
            DBPlayer.lastSeen = Date.now();
            window.TmPlayerDB.set(player.id, DBPlayer);
            console.log(`[savePlayerVisit] saved record ${ageKey}, calling analyzeGrowth`);
            return analyzeGrowth(player, DBPlayer);
        } catch (e) {
            console.warn('[TmPlayer] savePlayerVisit failed:', e.message);
            return Promise.resolve(null);
        }
    }

    /* -----------------------------------------------------------
       GROWTH ANALYSIS €” Week-by-week decimal estimation using
       training weights + TI efficiency curves.
       ----------------------------------------------------------- */
    function analyzeGrowth(player, DBPlayer, trainingInfo, historyInfo, overrideRecord) {

        if (overrideRecord) {
            DBPlayer = overrideRecord;
        }
        if (!DBPlayer?.records) { console.warn('[analyzeGrowth] no records, abort'); return Promise.resolve(null); }

        /* Single-record case: can't propagate decimals, but still compute R5/REREC with calcSkillDecimalsSimple */
        if (Object.keys(DBPlayer.records).length < 2) {
            const positions = player.positions?.length ? player.positions : [{ id: 0 }];
            const key = Object.keys(DBPlayer.records)[0];
            const record = DBPlayer.records[key];
            const skillsC = calcSkillDecimalsSimple(player);
            const fakePlayer = { skills: skillsC, asi: parseInt(record.SI) || 0, routine: player.routine || 0 };
            record.REREC = Math.max(...positions.map(p => Number(calculatePlayerREC(p, fakePlayer))));
            record.R5 = Math.max(...positions.map(p => Number(calculatePlayerR5(p, fakePlayer))));
            record.skills = skillsC;
            record.routine = player.routine ?? null;
            window.TmPlayerDB.set(player.id, DBPlayer);
            console.log('[TmPlayer] Single-record growth analysis completed for player', player.id, { record });
            window.dispatchEvent(new CustomEvent('tm:growthUpdated', { detail: { pid: player.id } }));
            return Promise.resolve(DBPlayer);
        }

        fillMissingMonths(DBPlayer.records);
        const ageKeys = Object.keys(DBPlayer.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));

        const run = (trainingInfo, historyInfo) => {
            const gw = buildGroupWeights(player, trainingInfo);
            const decsByKey = computeGrowthDecimals(DBPlayer.records, ageKeys, player, gw);
            const routineMap = buildRoutineMap(ageKeys, player, historyInfo);
            const positions = player.positions?.length ? player.positions : [{ id: 0 }];
            for (let m = 0; m < ageKeys.length; m++) {
                const key = ageKeys[m];
                const rec = DBPlayer.records[key];
                const ci = rec.skills.map(v => { const n = (typeof v === 'object' && v !== null) ? parseFloat(v.value) : parseFloat(v); return isFinite(n) ? Math.floor(n) : 0; });
                const dec = decsByKey[key];
                const allMax = ci.every(v => v >= 20);
                const skillsC = allMax
                    ? (() => {
                        const K = player.isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
                        const totalPts = Math.pow(2, Math.log(K * (parseInt(rec.SI) || 0)) / Math.log(128));
                        const rem = totalPts - ci.reduce((a, b) => a + b, 0);
                        return ci.map(v => v + rem / ci.length);
                    })()
                    : ci.map((v, i) => v >= 20 ? 20 : v + (isFinite(dec[i]) ? dec[i] : 0));
                const fakePlayer = { skills: skillsC, asi: parseInt(rec.SI) || 0, routine: routineMap[key] ?? rec.routine ?? 0 };
                rec.REREC = Math.max(...positions.map(p => Number(calculatePlayerREC(p, fakePlayer))));
                rec.R5 = Math.max(...positions.map(p => Number(calculatePlayerR5(p, fakePlayer))));
                rec.skills = skillsC;
                rec.routine = routineMap[key] ?? rec.routine ?? null;
            }
            console.log('[TmPlayer] Growth analysis completed for player', player.id, { ageKeys, records: DBPlayer.records });
            window.TmPlayerDB.set(player.id, DBPlayer);
            window.dispatchEvent(new CustomEvent('tm:growthUpdated', { detail: { pid: player.id } }));
            return DBPlayer;
        };

        if (trainingInfo !== undefined && historyInfo !== undefined) {
            return Promise.resolve(run(trainingInfo, historyInfo));
        } else {
            return Promise.all([
                window.TmApi.fetchPlayerInfo(player.id, 'training'),
                window.TmApi.fetchPlayerInfo(player.id, 'history'),
            ]).then(([t, h]) => run(t, h));
        }
    }

    window.TmSync = {
        syncPlayerStore,
        savePlayerVisit,
        analyzeGrowth,
        buildStoreFromGraphs,
    };


})();



// ─── lib/tm-services.js ─────────────────────────────────────

/**
 * tm-services.js — TrophyManager API service layer
 *
 * Usage (via Tampermonkey @require):
 *   // @require  https://raw.githubusercontent.com/.../lib/tm-services.js
 *
 * Exposed as: window.TmApi
 *
 * All functions return a Promise that always resolves (never rejects).
 * On network failure or JSON parse error the promise resolves to null.
 *
 * API:
 *   TmApi.fetchClubFixtures(clubId)                  → Promise<object|null>
 *   TmApi.fetchLeagueFixtures(country, div, group)   → Promise<object|null>
 *   TmApi.fetchClubMatchHistory(clubId, sid)         → Promise<string|null>
 *   TmApi.fetchMatchTooltip(matchId, season)         → Promise<object|null>
 *   TmApi.fetchTooltipRaw(playerId)                  → Promise<object|null>
 *   TmApi.fetchMatchH2H(homeId, awayId, date)        → Promise<object|null>
 *   TmApi.fetchLeagueDivisions(country)              → Promise<object|null>
 *   TmApi.fetchSquadPost(clubId)                     → Promise<object|null>
 *   TmApi.fetchClubTransferHistory(clubId, sid)      → Promise<string|null>
 *   TmApi.fetchClubRecords(clubId)                   → Promise<string|null>
 *   TmApi.fetchClubLeagueHistory(clubId, sid)        → Promise<string|null>
 *   TmApi.fetchPlayerTooltip(pid)                    → Promise<{player,club,...}|null>
 *   TmApi.fetchPlayerInfo(pid, type, extra={})        → Promise<data|null>
 *   TmApi.fetchSquadRaw(clubId)                      → Promise<{squad,post,...}|null>
 *   TmApi.fetchTransfer(playerId)                    → Promise<data|null>
 *   TmApi.saveTraining(data)                         → Promise<void>
 *   TmApi.saveTrainingType(playerId, teamId)         → Promise<void>
 *   TmApi.normalizePlayer(p, DBPlayer)               → p  (mutates in place, returns p)
 */

(function () {
    'use strict';

    const _errors = [];
    const _logError = (context, err) => {
        const entry = { context, err, time: Date.now() };
        _errors.push(entry);
        if (typeof window.TmApi?.onError === 'function') window.TmApi.onError(entry);
        console.warn(`[TmApi] ${context}`, err);
    };

    const _post = (url, data) => new Promise(resolve => {
        const $ = window.jQuery;
        if (!$) { resolve(null); return; }
        $.post(url, data)
            .done(res => {
                try { resolve(typeof res === 'object' ? res : JSON.parse(res)); }
                catch (e) { _logError(`JSON parse: ${url}`, e); resolve(null); }
            })
            .fail((xhr, s, e) => { _logError(`POST ${url}`, e || s); resolve(null); });
    });

    const _get = (url) => new Promise(resolve => {
        const $ = window.jQuery;
        if (!$) { resolve(null); return; }
        $.get(url)
            .done(res => {
                try { resolve(typeof res === 'object' ? res : JSON.parse(res)); }
                catch (e) { _logError(`JSON parse: ${url}`, e); resolve(null); }
            })
            .fail((xhr, s, e) => { _logError(`GET ${url}`, e || s); resolve(null); });
    });

    const _getHtml = (url) => new Promise(resolve => {
        const $ = window.jQuery;
        if (!$) { resolve(null); return; }
        $.ajax({ url, type: 'GET', dataType: 'html' })
            .done(res => resolve(res || null))
            .fail(() => resolve(null));
    });

    // ─── In-flight deduplication ────────────────────────────────────────────
    // Prevents multiple concurrent identical fetches for the same key.
    const _inflight = new Map();
    const _dedup = (key, promiseFn) => {
        if (_inflight.has(key)) return _inflight.get(key);
        const p = promiseFn().finally(() => _inflight.delete(key));
        _inflight.set(key, p);
        return p;
    };

    // ─── Private transfer calc helpers ─────────────────────────────────────
    const _SKILL_NAME_TO_KEY = {
        'Strength':'str','Stamina':'sta','Pace':'pac','Marking':'mar','Tackling':'tac',
        'Workrate':'wor','Positioning':'pos','Passing':'pas','Crossing':'cro',
        'Technique':'tec','Heading':'hea','Finishing':'fin','Longshots':'lon','Set Pieces':'set',
        'Handling':'han','One on ones':'one','Reflexes':'ref','Aerial Ability':'ari',
        'Jumping':'jum','Communication':'com','Kicking':'kic','Throwing':'thr',
    };
    const _GK_WEIGHT_ORDER  = window.TmConst.SKILL_KEYS_GK_WEIGHT;
    const _OUTFIELD_SKILLS  = window.TmConst.SKILL_KEYS_OUT;
    const _getPosIndex = pos => window.TmLib.getPositionIndex(pos);

    function _skillsToArray(skillsObj, posIdx) {
        const order = posIdx === 9 ? _GK_WEIGHT_ORDER : _OUTFIELD_SKILLS;
        return order.map(k => skillsObj[k] || 0);
    }

    // ─────────────────────────────────────────────────────────────────────────

    window.TmApi = {

        /**
         * Fetch club fixtures (all matches for a given club this season).
         * @param {string|number} clubId
         * @returns {Promise<object|null>}
         */
        fetchClubFixtures(clubId) {
            return _post('/ajax/fixtures.ajax.php', { type: 'club', var1: clubId });
        },

        /**
         * Fetch league fixtures for a given country/division/group.
         * @param {string|number} country
         * @param {string|number} division
         * @param {string|number} group
         * @returns {Promise<object|null>}
         */
        fetchLeagueFixtures(country, division, group) {
            return _post('/ajax/fixtures.ajax.php', { type: 'league', var1: country, var2: division, var3: group });
        },

        /**
         * Fetch the match history HTML page for a club in a given season.
         * Returns the raw HTML string (not JSON) or null on failure.
         * @param {string|number} clubId
         * @param {string|number} seasonId
         * @returns {Promise<string|null>}
         */
        fetchClubMatchHistory(clubId, seasonId) {
            return _getHtml(`/history/club/matches/${clubId}/${seasonId}/`);
        },

        /**
         * Fetch the match tooltip (past seasons) from tooltip.ajax.php.
         * @param {string|number} matchId
         * @param {string|number} season
         * @returns {Promise<object|null>}
         */
        fetchMatchTooltip(matchId, season) {
            return _post('/ajax/tooltip.ajax.php', { type: 'match', match_id: matchId, season });
        },

        /**
         * Fetch raw player tooltip response without normalization or DB writes.
         * Use this when you need the plain API response in non-playerdb contexts.
         * @param {string|number} playerId
         * @returns {Promise<object|null>}
         */
        fetchTooltipRaw(playerId) {
            return _dedup(`tooltip:${playerId}`, () => _post('/ajax/tooltip.ajax.php', { player_id: playerId }));
        },

        /**
         * Fetch head-to-head match history between two clubs.
         * @param {string|number} homeId
         * @param {string|number} awayId
         * @param {number} date — Unix timestamp of kickoff
         * @returns {Promise<object|null>}
         */
        fetchMatchH2H(homeId, awayId, date) {
            return _get(`/ajax/match_h2h.ajax.php?home_team=${homeId}&away_team=${awayId}&date=${date}`);
        },

        /**
         * Fetch available league divisions for a given country.
         * @param {string} country — country suffix (e.g. 'cs', 'de')
         * @returns {Promise<object|null>}
         */
        fetchLeagueDivisions(country) {
            return _post('https://trophymanager.com/ajax/league_get_divisions.ajax.php', { get: 'new', country });
        },

        /**
         * Fetch the players_get_select post map for a club (raw, no normalization).
         * Returns a { [playerId: string]: player } map, or null on failure.
         * @param {string|number} clubId
         * @returns {Promise<object|null>}
         */
        fetchSquadPost(clubId) {
            return _post('/ajax/players_get_select.ajax.php', { type: 'change', club_id: clubId }).then(data => {
                if (!data?.post) return null;
                const map = {};
                for (const [id, p] of Object.entries(data.post)) map[String(id)] = p;
                return map;
            });
        },

        /**
         * Fetch the club transfer history HTML page for a given season.
         * @param {string|number} clubId
         * @param {string|number} seasonId
         * @returns {Promise<string|null>}
         */
        fetchClubTransferHistory(clubId, seasonId) {
            return _getHtml(`/history/club/transfers/${clubId}/${seasonId}/`);
        },

        /**
         * Fetch the club records HTML page.
         * @param {string|number} clubId
         * @returns {Promise<string|null>}
         */
        fetchClubRecords(clubId) {
            return _getHtml(`/history/club/records/${clubId}/`);
        },

        /**
         * Fetch the club league history HTML page for a given season.
         * @param {string|number} clubId
         * @param {string|number} seasonId
         * @returns {Promise<string|null>}
         */
        fetchClubLeagueHistory(clubId, seasonId) {
            return _getHtml(`/history/club/league/${clubId}/${seasonId}/`);
        },

        /**
         * Fetch a shortlist page and return the parsed players_ar array.
         * @param {number} [start] — page offset (omit for first/random page)
         * @returns {Promise<Array>}
         */
        fetchShortlistPage(start) {
            const url = start != null ? `/shortlist/?start=${start}` : '/shortlist/';
            return _getHtml(url).then(html => {
                if (!html) return [];
                const m = html.match(/var\s+players_ar\s*=\s*(\[[\s\S]*?\]);/);
                if (!m) return [];
                try { return JSON.parse(m[1]); } catch { return []; }
            });
        },

        /**
         * Fetch the player tooltip endpoint.
         * Returns the full parsed response (contains .player, .club, etc.) or null.
         * @param {string|number} pid
         * @returns {Promise<{player: object, club: object, [key: string]: any}|null>}
         */
        /**
         * Fetch the full match data object for a given match ID.
         * @param {string|number} matchId
         * @returns {Promise<object|null>}
         */
        fetchMatch(matchId) {
            return _get(`/ajax/match.ajax.php?id=${matchId}`);
        },

        /**
         * Strip unnecessary fields from a raw match API response.
         * Removes: udseende2/looks from lineup, text_team from report events,
         * colors/logos/form/meta from club sections.
         * Result is ~30% smaller and fully compatible with all scripts.
         * @param {object} raw — raw response from match.ajax.php
         * @returns {object} compressed match object
         */
        compressMatch(raw) {
            const cPlayer = p => ({
                player_id: p.player_id,
                name: p.name,
                nameLast: p.nameLast,
                position: p.position,
                fp: p.fp,
                no: p.no,
                rating: p.rating,
                mom: p.mom,
                rec: p.rec,
                routine: p.routine,
                age: p.age,
            });
            const cLineupSide = side => {
                const out = {};
                for (const [pid, p] of Object.entries(raw.lineup?.[side] || {}))
                    out[pid] = cPlayer(p);
                return out;
            };
            const cReport = report => {
                const out = {};
                for (const [min, events] of Object.entries(report || {})) {
                    out[min] = events.map(evt => {
                        const e = {};
                        if (evt.type !== undefined) e.type = evt.type;
                        if (evt.club !== undefined) e.club = evt.club;
                        if (evt.severity !== undefined) e.severity = evt.severity;
                        if (evt.parameters) e.parameters = evt.parameters;
                        if (evt.chance) {
                            e.chance = {};
                            if (evt.chance.video) e.chance.video = evt.chance.video;
                            if (evt.chance.text) e.chance.text = evt.chance.text;
                            // text_team dropped — not used by any script
                        }
                        return e;
                    });
                }
                return out;
            };
            const cClub = c => ({
                id: c.id,
                club_name: c.club_name,
                club_nick: c.club_nick,
                fanclub: c.fanclub,
                stadium: c.stadium,
                manager_name: c.manager_name,
                country: c.country,
                division: c.division,
                group: c.group,
            });
            const md = raw.match_data || {};
            return {
                match_data: {
                    attacking_style: md.attacking_style,
                    mentality: md.mentality,
                    focus_side: md.focus_side,
                    possession: md.possession,
                    attendance: md.attendance,
                    regular_last_min: md.regular_last_min,
                    extra_time: md.extra_time,
                    last_min: md.last_min,
                    halftime: md.halftime,
                    captain: md.captain,
                    venue: md.venue,
                },
                lineup: {
                    home: cLineupSide('home'),
                    away: cLineupSide('away'),
                },
                report: cReport(raw.report),
                club: {
                    home: raw.club?.home ? cClub(raw.club.home) : undefined,
                    away: raw.club?.away ? cClub(raw.club.away) : undefined,
                },
            };
        },

        /**
         * Fetch a match, using TmMatchCacheDB as a cache.
         * First call: fetches from TM API, compresses, stores, returns.
         * Subsequent calls: returns stored compressed record instantly.
         * @param {string|number} matchId
         * @returns {Promise<object|null>}
         */
        async fetchMatchCached(matchId) {
            const db = window.TmMatchCacheDB;
            const cached = await db.get(matchId);
            if (cached) return cached;
            const raw = await this.fetchMatch(matchId);
            if (!raw) return null;
            const compressed = this.compressMatch(raw);
            db.set(matchId, compressed); // fire-and-forget
            return compressed;
        },

        fetchPlayerTooltip(player_id) {
            return _dedup(`tooltip:${player_id}`, () => _post('/ajax/tooltip.ajax.php', { player_id })).then(data => {
                if (!data?.player) return data;
                data.retired = data.player.club_id === null || data.club === null;
                const DBPlayer = window.TmPlayerDB.get(player_id);
                if (data.retired) {
                    if (DBPlayer) {
                        window.TmPlayerArchiveDB.set(player_id, DBPlayer).then(() => window.TmPlayerDB.remove(player_id));
                        console.log(`%c[Cleanup] Archived retired/deleted player ${player_id}`, 'font-weight:bold;color:#fbbf24');
                    }
                    return data;
                }
                this.normalizePlayer(data.player, DBPlayer);
                return data;
            });
        },

        /**
         * Fetch the players_get_info endpoint.
         * show_non_pro_graphs is always included automatically.
         * @param {string|number} pid
         * @param {string} type — 'history' | 'training' | 'graphs' | 'scout' | etc.
         * @param {object} [extra={}] — optional extra params (e.g. { scout_id: '123' })
         * @returns {Promise<object|null>}
         */
        fetchPlayerInfo(pid, type, extra = {}) {
            return _post('/ajax/players_get_info.ajax.php', {
                player_id: pid,
                type,
                show_non_pro_graphs: true,
                ...extra
            });
        },

        /**
         * Fetch the squad player list for a club (players_get_select endpoint).
         * All entries in data.post are normalized in place via normalizePlayer.
         * @param {string|number} clubId
         * @returns {Promise<{squad: object[], post: object, [key: string]: any}|null>}
         */
        fetchSquadRaw(clubId) {
            return _post('/ajax/players_get_select.ajax.php', { type: 'change', club_id: clubId })
                .then(data => {
                    if (data?.post) {
                        const players = Object.values(data.post).map(player => {
                            player.club_id = clubId;  // not included in this endpoint but needed for normalization
                            const DBPlayer = window.TmPlayerDB.get(player.id);
                            this.normalizePlayer(player, DBPlayer);
                            return player;
                        });
                        data.post = players;
                    }
                    return data;

                });
        },

        /**
         * Fetch the current transfer status for a listed player.
         * @param {string|number} playerId
         * @returns {Promise<object|null>}
         */
        fetchTransfer(playerId) {
            return _post('/ajax/transfer_get.ajax.php', { type: 'transfer_reload', player_id: playerId });
        },

        /**
         * Search the transfer market by a pre-built hash string.
         * Returns the raw API response { list: [], refresh: bool } or null on error.
         * The `list` array contains raw TM transfer player objects — call
         * normalizeTransferPlayer() on each entry before use.
         * @param {string} hash   — path-style hash built by buildHash() / buildHashRaw()
         * @param {string|number} clubId — SESSION.id (used by TM to exclude own players)
         * @returns {Promise<{list: object[], refresh: boolean}|null>}
         */
        fetchTransferSearch(hash, clubId) {
            return _post('/ajax/transfer.ajax.php', { search: hash, club_id: clubId });
        },

        /**
         * Map a TM position string to a 0-9 index used by R5/Rec weight tables.
         * GK=9, DC=0, DR/DL=1, DMC=2, DMR/DML=3, MC=4, MR/ML=5, OMC=6, OMR/OML=7, FC/F=8.
         * Also exposed here so display code can import it without redeclaring locally.
         * @param {string} pos
         * @returns {number}
         */
        getPosIndex: _getPosIndex,

        /**
         * Normalise a raw transfer-list player object in place.
         * Adds computed helper fields:
         *   _gk    {boolean}  — true for goalkeepers
         *   _ageP  {object}   — { years, months, totalMonths, decimal }
         *   _ss    {object}   — { sum, count, total, max } star-sum of scouted skills
         * @param {object} p — raw player from transfer list
         * @returns {object} the same object (mutated), for chaining
         */
        normalizeTransferPlayer(p) {
            const OUTFIELD = ['str','sta','pac','mar','tac','wor','pos','pas','cro','tec','hea','fin','lon','set'];
            const GK       = ['str','sta','pac','han','one','ref','ari','jum','com','kic','thr'];
            const gk = !!(p.fp && p.fp[0] === 'gk');
            const skills = gk ? GK : OUTFIELD;
            let sum = 0, count = 0;
            for (const s of skills) { if (p[s] > 0) { sum += p[s]; count++; } }
            const age = parseFloat(p.age) || 0;
            const years  = Math.floor(age);
            const months = Math.round((age - years) * 100);
            p._gk  = gk;
            p._ss  = { sum, count, total: skills.length, max: skills.length * 20 };
            p._ageP = { years, months, totalMonths: years * 12 + months, decimal: years + months / 12 };
            return p;
        },

        /**
         * Compute R5 range estimate from transfer-list skills (no tooltip needed).
         * Uses assumed routine range [0 … 4.2*(age-15)].
         * Requires player to be pre-normalized via normalizeTransferPlayer().
         * @param {object} p — normalized transfer player
         * @returns {{ r5Lo, r5Hi, recCalc, routineMax }|null}
         */
        estimateTransferPlayer(p) {
            const asi = p.asi || 0;
            if (!asi) return null;
            const skillKeys = p._gk ? _GK_WEIGHT_ORDER : _OUTFIELD_SKILLS;
            const skills = skillKeys.map(k => p[k] || 0);
            if (skills.every(s => s === 0)) return null;
            const positions = [...(p.fp || [])].sort((a, b) => _getPosIndex(a) - _getPosIndex(b));
            if (!positions.length) return null;
            const ageYears = p._ageP ? p._ageP.years : Math.floor(parseFloat(p.age) || 20);
            const routineMax = Math.max(0, window.TmConst.ROUTINE_SCALE * (ageYears - window.TmConst.ROUTINE_AGE_MIN));
            let r5Lo = null, r5Hi = null, recCalc = null;
            for (const pos of positions) {
                const pi = _getPosIndex(pos);
                const lo  = window.TmLib.calcR5(pi, skills, asi, 0);
                const hi  = window.TmLib.calcR5(pi, skills, asi, routineMax);
                const rec = window.TmLib.calcRec(pi, skills, asi);
                if (r5Lo === null || lo > r5Lo) r5Lo = lo;
                if (r5Hi === null || hi > r5Hi) r5Hi = hi;
                if (recCalc === null || rec > recCalc) recCalc = rec;
            }
            return { r5Lo, r5Hi, recCalc, routineMax };
        },

        /**
         * Enrich a transfer player with tooltip-derived values: recSort, recCalc,
         * r5 (exact if routine known), r5Lo, r5Hi, ti, skills.
         * Does NOT do any DB access — pure calculation.
         * Requires player to be pre-normalized via normalizeTransferPlayer().
         * @param {object} player        — normalized transfer player (has _gk, _ageP)
         * @param {object} tooltipData   — raw response from tooltip.ajax.php
         * @param {number} currentSession — TmLib.getCurrentSession() result
         * @returns {{ recSort, recCalc, r5, r5Lo, r5Hi, ti, skills }|null}
         */
        enrichTransferFromTooltip(player, tooltipData, currentSession) {
            if (!tooltipData?.player) return null;
            const tp = tooltipData.player;

            const recSort = tp.rec_sort !== undefined ? parseFloat(tp.rec_sort) : null;

            const wageNum = window.TmUtils.parseNum(tp.wage);
            const asiNum  = player.asi || window.TmUtils.parseNum(tp.asi || tp.skill_index);
            const favpos  = tp.favposition || '';
            const isGK    = favpos.split(',')[0].toLowerCase() === 'gk';
            let ti = null;
            if (asiNum && wageNum) {
                const tiRaw = window.TmLib.calculateTI({ asi: asiNum, wage: wageNum, isGK });
                if (tiRaw !== null && currentSession > 0)
                    ti = Number((tiRaw / currentSession).toFixed(1));
            }

            let skills = null;
            if (tp.skills && Array.isArray(tp.skills)) {
                skills = {};
                for (const sk of tp.skills) {
                    const key = _SKILL_NAME_TO_KEY[sk.name];
                    if (!key) continue;
                    const v = sk.value;
                    if (typeof v === 'string') {
                        if (v.includes('star_silver')) skills[key] = 19;
                        else if (v.includes('star'))   skills[key] = 20;
                        else skills[key] = parseInt(v) || 0;
                    } else {
                        skills[key] = parseInt(v) || 0;
                    }
                }
            }

            const tooltipRoutine = tp.routine != null ? parseFloat(tp.routine) : null;
            let recCalc = null, r5 = null, r5Lo = null, r5Hi = null;
            if (skills && asiNum) {
                const positions = favpos.split(',').map(s => s.trim()).filter(Boolean);
                if (positions.length) {
                    const ageYears = player._ageP ? player._ageP.years : Math.floor(parseFloat(player.age) || 20);
                    const routineMax = Math.max(0, window.TmConst.ROUTINE_SCALE * (ageYears - window.TmConst.ROUTINE_AGE_MIN));
                    for (const pos of positions) {
                        const pix = _getPosIndex(pos);
                        const sax = _skillsToArray(skills, pix);
                        const rec = window.TmLib.calcRec(pix, sax, asiNum);
                        const lo  = window.TmLib.calcR5(pix, sax, asiNum, 0);
                        const hi  = window.TmLib.calcR5(pix, sax, asiNum, routineMax);
                        if (recCalc === null || rec > recCalc) recCalc = rec;
                        if (r5Lo === null || lo > r5Lo) r5Lo = lo;
                        if (r5Hi === null || hi > r5Hi) r5Hi = hi;
                        if (tooltipRoutine !== null) {
                            const exact = window.TmLib.calcR5(pix, sax, asiNum, tooltipRoutine);
                            if (r5 === null || exact > r5) r5 = exact;
                        }
                    }
                }
            }

            return { recSort, recCalc, r5, r5Lo, r5Hi, ti, skills };
        },

        /**
         * Save a custom training plan.
         * The caller is responsible for building the full training_post payload.
         * @param {object} data — fully-formed training_post payload
         * @returns {Promise<void>}
         */
        saveTraining(data) {
            return _post('/ajax/training_post.ajax.php', data).then(() => { });
        },

        /**
         * Save the training type / position group for a player.
         * @param {string|number} playerId
         * @param {string|number} teamId
         * @returns {Promise<void>}
         */
        saveTrainingType(playerId, teamId) {
            return _post('/ajax/training_post.ajax.php', {
                type: 'player_pos',
                player_id: playerId,
                team_id: teamId
            }).then(() => { });
        },

        /**
         * One-time migration: backfill meta (name, pos, isGK, country) on existing DB records
         * that were saved before the meta field existed. Safe to call on every tooltip fetch —
         * no-ops once the record already has meta.pos populated.
         * @param {object} player — normalized player object
         * @param {object|null} DBPlayer — existing DB record for this player, or null if not found
         */
        _migratePlayerMeta(player, DBPlayer) {
            try {
                if (!DBPlayer || !DBPlayer.meta) {
                    if (!DBPlayer) DBPlayer = {};
                    DBPlayer.meta = {
                        name: player.name || '',
                        pos: player.favposition,
                        isGK: player.isGK,
                        country: player.country || '',
                        club_id: player.club_id != null ? String(player.club_id) : undefined,
                    };
                    window.TmPlayerDB.set(player.id, DBPlayer);
                } else {
                    let dirty = false;
                    if (!DBPlayer.meta.name && player.name) { DBPlayer.meta.name = player.name; dirty = true; }
                    if (!DBPlayer.meta.country && player.country) { DBPlayer.meta.country = player.country; dirty = true; }
                    // pos + isGK always sync — player may have changed position
                    if (player.favposition && player.favposition !== DBPlayer.meta.pos) {
                        DBPlayer.meta.pos = player.favposition;
                        DBPlayer.meta.isGK = player.isGK;
                        dirty = true;
                    } else if (DBPlayer.meta.isGK == null) { DBPlayer.meta.isGK = player.isGK; dirty = true; }
                    // club_id always sync — player may have transferred
                    if (player.club_id != null && String(player.club_id) !== DBPlayer.meta.club_id) {
                        DBPlayer.meta.club_id = String(player.club_id); dirty = true;
                    }
                    if (dirty) window.TmPlayerDB.set(player.id, DBPlayer);
                }
            } catch (e) { _logError('_migratePlayerMeta', e); }
        },

        /**
         * Parses all raw string/numeric scalar fields on a player object in-place.
         * Called by normalizePlayer() before skill or position resolution.
         */
        _parseScalars(player) {
            player.asi = TmUtils.parseNum(player.asi || player.skill_index);
            player.wage = TmUtils.parseNum(player.wage);
            player.age = parseInt(player.age) || 0;
            player.id = parseInt(player.player_id || player.id);
            player.months = parseInt(player.month || player.months) || 0;
            player.ageMonths = player.age * 12 + player.months;
            player.ageMonthsString = `${player.age}.${player.months}`;
            player.trainingCustom = player.training_custom || '';
            player.training = player.training || '';
            const s = window.SESSION;
            const ownClubIds = s ? [s.main_id, s.b_team].filter(Boolean).map(Number) : [];
            player.isOwnPlayer = ownClubIds.includes(Number(player.club_id));
            player.routine = parseFloat(player.rutine || player.routine) || 0;
            player.isGK = String(player.favposition || '').split(',')[0].trim().toLowerCase() === 'gk';
        },

        /**
         * Resolves a player's skills array from one of three sources (in priority order):
         *   1. IndexedDB record for the player's current age key
         *   2. Tooltip-API rich objects (already { key, value } shaped)
         *   3. Squad-API flat numeric fields on the player object
         * Returns an array of skill objects matching the given defs.
         */
        _resolveSkills(player, defs, DBRecord) {
            const ageKey = player.ageMonthsString;
            if (DBRecord && DBRecord.records?.[ageKey]) {
                const skills = DBRecord.records[ageKey].skills;
                return defs.map(def => {
                    const raw = skills[def.id];
                    const v = (typeof raw === 'object' && raw !== null) ? raw.value : raw;
                    return { ...def, value: parseFloat(v) || 0 };
                });
            }
            if (player.skills && Array.isArray(player.skills) && typeof player.skills[0] === 'object' && 'key' in player.skills[0]) {
                /* Tooltip API: skills already rich objects — reorder to match defs and normalise value */
                return defs.map(def => {
                    const sk = player.skills.find(s => s.key === def.key || (def.key2 && s.key === def.key2));
                    const raw = sk?.value ?? 0;
                    const value = typeof raw === 'string' && raw.includes('star') ? (raw.includes('silver') ? 19 : 20) : (parseFloat(raw) || 0);
                    return { ...def, value };
                });
            }
            /* Squad API: individual numeric fields on player — use key, falling back to removing underscores */
            return defs.map(def => {
                const raw = player[def.key] ?? player[def.key.replace(/_/g, '')];
                return { ...def, value: parseFloat(raw) || 0 };
            });
        },

        /**
         * Converts string fields (asi, wage, age, months, routine) to numbers.
         * Safe to call multiple times (idempotent once numeric).
         * @param {object} player — raw player from fetchPlayerTooltip / tooltip.ajax.php
         * @param {object|null} DBPlayer — existing DB record for this player, or null if not found
         * @returns {object} the same player, mutated
         */
        normalizePlayer(player, DBPlayer, { skipSync = false } = {}) {
            this._parseScalars(player);
            this._migratePlayerMeta(player, DBPlayer);
            const defs = player.isGK ? TmConst.SKILL_DEFS_GK : TmConst.SKILL_DEFS_OUT;
            player.skills = this._resolveSkills(player, defs, DBPlayer);
            const applyPositions = () => {
                player.positions = String(player.favposition || '').split(',').map(s => {
                    const pos = s.trim().toLowerCase();
                    const positionData = TmConst.POSITION_MAP[pos];
                    if (!positionData) return null;
                    return {
                        ...positionData,
                        r5: TmLib.calculatePlayerR5(positionData, player),
                        rec: TmLib.calculatePlayerREC(positionData, player)
                    };
                }).filter(Boolean).sort((a, b) => a.ordering - b.ordering);
                player.r5 = Math.max(0, ...player.positions.map(p => parseFloat(p.r5) || 0));
                player.rec = Math.max(0, ...player.positions.map(p => parseFloat(p.rec) || 0));
                player.ti = TmLib.calculateTIPerSession(player);
            };

            const syncPromise = skipSync ? null : window.TmSync?.syncPlayerStore(player, DBPlayer);
            if (syncPromise instanceof Promise) {
                syncPromise.then(updatedDB => {
                    const curRec = updatedDB?.records?.[player.ageMonthsString];
                    if (!curRec?.skills) return;
                    player.skills = this._resolveSkills(player, defs, updatedDB);
                    applyPositions();
                    window.dispatchEvent(new CustomEvent('tm:player-synced', { detail: { id: player.id, player } }));
                });
            }

            applyPositions();
            player.name = player.player_name || player.name;
            return player;
        },

        errors: _errors,
        onError: null,

    };

})();



// ─── lib/tm-squad.js ────────────────────────────────────────

/**
 * tm-squad.js — Squad page utilities for TrophyManager userscripts
 *
 * Usage (via Tampermonkey @require):
 *   // @require  file://H:/projects/Moji/tmscripts/lib/tm-squad.js
 *
 * Exposed as: window.TmSquad
 *
 * API:
 *   TmSquad.extractSkills(skillsArr, isGK)   → number[]  (tooltip format)
 *   TmSquad.extractSkillsFromPost(p)          → { isGK, skills, labels }  (API post format)
 *   TmSquad.parseSquadHash()                 → { a: boolean, b: boolean }
 *   TmSquad.ensureAllPlayersVisible()        → Promise<void>
 *   TmSquad.createSquadLoader()              → { update, done, error }
 *   TmSquad.parseSquadPage()                 → player[] | undefined
 */

(function () {
    'use strict';

    const { SKILL_LABELS_OUT, SKILL_NAMES_GK_SHORT, SKILL_NAMES_OUT, SKILL_NAMES_GK } = window.TmConst;

    /**
     * Extract a flat integer skill array from the tooltip skills object array.
     * Tooltip provides skills as [{ name: "Strength", value: "15" }, ...].
     * @param {Array<{name: string, value: string|number}>} skillsArr
     * @param {boolean} isGK
     * @returns {number[]}
     */
    const extractSkills = (skillsArr, isGK) => {
        const names = isGK ? SKILL_NAMES_GK : SKILL_NAMES_OUT;
        return names.map(name => {
            const sk = skillsArr.find(s => s.name === name);
            if (!sk) return 0;
            const v = sk.value;
            if (typeof v === 'string') {
                if (v.includes('star_silver')) return 19;
                if (v.includes('star')) return 20;
                return parseInt(v) || 0;
            }
            return parseInt(v) || 0;
        });
    };

    /**
     * Parse URL hash squad visibility flags.
     * Hash format: #/a/{true|false}/b/{true|false}/
     * @returns {{ a: boolean, b: boolean }}
     */
    const parseSquadHash = () => {
        const h = location.hash || '';
        const aMatch = h.match(/\/a\/(true|false)/i);
        const bMatch = h.match(/\/b\/(true|false)/i);
        return {
            a: aMatch ? aMatch[1] === 'true' : true,
            b: bMatch ? bMatch[1] === 'true' : false
        };
    };

    /**
     * Ensure both the main squad (A) and reserves (B) are visible on /players/.
     * Sets the hash to #/a/true/b/true/ and clicks toggle buttons as a fallback.
     * @returns {Promise<void>}
     */
    const ensureAllPlayersVisible = () => new Promise((resolve) => {
        const sqDiv = document.getElementById('sq');
        if (!sqDiv) { resolve(); return; }

        const vis = parseSquadHash();
        if (vis.a && vis.b) { resolve(); return; }

        const onHashChange = () => {
            window.removeEventListener('hashchange', onHashChange);
            setTimeout(resolve, 500);
        };
        window.addEventListener('hashchange', onHashChange);
        location.hash = '#/a/true/b/true/';

        setTimeout(() => {
            window.removeEventListener('hashchange', onHashChange);
            if (!vis.a) { const btn = document.getElementById('toggle_a_team'); if (btn) btn.click(); }
            if (!vis.b) { const btn = document.getElementById('toggle_b_team'); if (btn) btn.click(); }
            setTimeout(resolve, 500);
        }, 1500);
    });

    /**
     * Create a fixed top-of-page progress bar overlay for squad sync operations.
     * Delegates to TmUI.progressBar({ title, inline: false }).
     * @returns {{ update(current, total, name): void, done(count): void, error(msg): void }}
     */
    const createSquadLoader = () => {
        const bar = window.TmUI.progressBar({ title: '⚡ Squad Sync' });
        return {
            update(current, total, name) {
                bar.update(current, total, `${current}/${total} — ${name}`);
            },
            done(count) {
                bar.done(`✓ ${count} players processed`);
            },
            error(msg) {
                bar.error(msg);
            },
        };
    };

    /**
     * Parse all player rows from the #sq squad table on /players/.
     * Detects GK section via .splitter rows; reads skills, improvements, TI.
     * @returns {Array<object>|undefined}
     */
    const parseSquadPage = () => {
        const sqDiv = document.getElementById('sq');
        if (!sqDiv) { console.warn('[Squad] No #sq div found'); return; }

        const allRows = sqDiv.querySelectorAll('table tbody tr');
        if (!allRows.length) { console.warn('[Squad] No player rows found'); return; }

        let isGKSection = false;
        const players = [];

        allRows.forEach((row) => {
            if (row.classList.contains('splitter')) { isGKSection = true; return; }
            if (row.classList.contains('header')) return;

            const cells = row.querySelectorAll('td');
            if (cells.length < 10) return;

            const link = row.querySelector('a[player_link]');
            if (!link) return;
            const pid  = link.getAttribute('player_link');
            const name = link.textContent.trim();

            const numEl  = cells[0]?.querySelector('span.faux_link');
            const number = numEl ? parseInt(numEl.textContent) || 0 : 0;

            const ageText = cells[2]?.textContent?.trim() || '0.0';
            const [ageYears, ageMonths] = ageText.split('.').map(s => parseInt(s) || 0);

            const posEl  = cells[3]?.querySelector('.favposition');
            const posText = posEl ? posEl.textContent.trim() : '';

            const skillCount    = isGKSection ? 11 : 14;
            const skillStartIdx = 4;
            const skills  = [];
            const improved = [];

            for (let i = 0; i < skillCount; i++) {
                const cell = cells[skillStartIdx + i];
                if (!cell) { skills.push(0); continue; }

                const innerDiv = cell.querySelector('div.skill');
                if (!innerDiv) { skills.push(0); continue; }

                const hasPartUp = innerDiv.classList.contains('part_up');
                const hasOneUp  = innerDiv.classList.contains('one_up');

                const starImg = innerDiv.querySelector('img');
                let skillVal = 0;
                if (starImg) {
                    const src = starImg.getAttribute('src') || '';
                    if (src.includes('star_silver')) skillVal = 19;
                    else if (src.includes('star')) skillVal = 20;
                } else {
                    skillVal = parseInt(innerDiv.textContent.trim()) || 0;
                }

                skills.push(skillVal);
                if (hasPartUp) improved.push({ index: i, type: 'part_up', skillName: isGKSection ? SKILL_NAMES_GK_SHORT[i] : SKILL_LABELS_OUT[i] });
                else if (hasOneUp) improved.push({ index: i, type: 'one_up', skillName: isGKSection ? SKILL_NAMES_GK_SHORT[i] : SKILL_LABELS_OUT[i] });
            }

            const tiIdx       = skillStartIdx + skillCount + (isGKSection ? 3 : 0);
            const TI          = parseInt(cells[tiIdx]?.textContent?.trim()) || 0;
            const TI_change   = parseInt((cells[tiIdx + 1]?.textContent?.trim() || '0').replace('+', '')) || 0;

            const partUpCount = improved.filter(x => x.type === 'part_up').length;
            const oneUpCount  = improved.filter(x => x.type === 'one_up').length;

            players.push({
                pid, name, number, ageYears, ageMonths,
                position: posText, isGK: isGKSection,
                skills, improved, partUpCount, oneUpCount,
                totalImproved: partUpCount + oneUpCount,
                TI, TI_change,
                totalSkill: skills.reduce((s, v) => s + v, 0)
            });
        });

        return players;
    };

    // Skill field names from players_get_select API in TmLib.mapPlayer weight order
    const POST_FIELDS_OUT = ['strength', 'stamina', 'pace', 'marking', 'tackling', 'workrate',
        'positioning', 'passing', 'crossing', 'technique', 'heading', 'finishing', 'longshots', 'setpieces'];
    const POST_LABELS_OUT = ['Str', 'Sta', 'Pac', 'Mar', 'Tac', 'Wor', 'Pos', 'Pas', 'Cro', 'Tec', 'Hea', 'Fin', 'Lon', 'Set'];
    const POST_FIELDS_GK  = ['strength', 'pace', 'jumping', 'stamina', 'oneonones', 'reflexes',
        'arialability', 'communication', 'kicking', 'throwing', 'handling'];
    const POST_LABELS_GK  = ['Str', 'Pac', 'Jum', 'Sta', 'One', 'Ref', 'Aer', 'Com', 'Kic', 'Thr', 'Han'];

    /**
     * Extract skills from a squad API player (players_get_select).
     * Skills are ordered to match TmLib.mapPlayer weight arrays.
     * @param {object} p - squad player (raw or normalized)
     * @returns {{ isGK: boolean, skills: number[], labels: string[] }}
     */
    const extractSkillsFromPost = p => {
        const isGK = parseInt(p.handling) > 0;
        const fields = isGK ? POST_FIELDS_GK : POST_FIELDS_OUT;
        const labels = isGK ? POST_LABELS_GK : POST_LABELS_OUT;
        return { isGK, skills: fields.map(f => parseInt(p[f]) || 0), labels };
    };

    window.TmSquad = {
        extractSkills,
        extractSkillsFromPost,
        parseSquadHash,
        ensureAllPlayersVisible,
        createSquadLoader,
        parseSquadPage,
    };

})();



// ─── components/shared/tm-canvas-utils.js ───────────────────

// ==UserScript==
// @name         TM Canvas Utils
// ==/UserScript==
(function () {
    'use strict';

    /* Compute "nice" tick values for a chart axis.
       Returns an array of n+/-1 evenly-spaced round numbers covering [min, max]. */
    const calcTicks = (min, max, n) => {
        if (max === min) return [min];
        const range = max - min; const raw = range / n;
        const mag = Math.pow(10, Math.floor(Math.log10(raw)));
        const res = raw / mag; let step;
        if (res <= 1.5) step = mag; else if (res <= 3) step = 2 * mag; else if (res <= 7) step = 5 * mag; else step = 10 * mag;
        const ticks = []; let t = Math.ceil(min / step) * step;
        while (t <= max + step * 0.01) { ticks.push(Math.round(t * 10000) / 10000); t += step; }
        return ticks;
    };

    /* Set up a canvas for DPR-aware rendering.
       Writes canvas.width/height, applies ctx.scale, returns { ctx, cssW, cssH, dpr }.
       Returns null if the canvas is too small to render. */
    const setupCanvas = (canvas) => {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const cssW = canvas.clientWidth, cssH = canvas.clientHeight;
        if (cssW < 10 || cssH < 10) return null;
        canvas.width = cssW * dpr; canvas.height = cssH * dpr;
        ctx.scale(dpr, dpr);
        return { ctx, cssW, cssH, dpr };
    };

    /* Draw horizontal Y-grid lines + left-side labels, and vertical X-grid lines + bottom labels.
       Also draws the "Age" x-axis title and an optional rotated y-axis title.

       params: {
           pL, pR, pT, pB     — padding (pixels)
           cssW, cssH         — canvas CSS dimensions
           cW, cH             — chart content width/height (derived: cssW-pL-pR, cssH-pT-pB)
           xS, yS             — scale functions: data-value → pixel
           yTicks             — array of y tick values
           ageMin, ageMax     — integer range for x ticks
           gridColor          — stroke color for grid lines
           axisColor          — fill color for labels
           formatY            — (tick) => string
           xAxisLabel         — label drawn below x axis (default: 'Age')
           yAxisLabel         — optional rotated label on left side
       }
    */
    const drawGrid = (ctx, params) => {
        const {
            pL, pT, pB, cssW, cssH, cW, cH,
            xS, yS, yTicks, ageMin, ageMax,
            gridColor, axisColor,
            formatY = v => v.toFixed(1),
            xAxisLabel = 'Age',
            yAxisLabel = null
        } = params;

        const FONT_SM = '11px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
        const FONT_MD = '12px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';

        /* Y grid + labels */
        ctx.font = FONT_SM; ctx.textAlign = 'right';
        yTicks.forEach(tick => {
            const y = yS(tick);
            if (y < pT - 1 || y > pT + cH + 1) return;
            ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pL, y); ctx.lineTo(pL + cW, y); ctx.stroke();
            ctx.fillStyle = axisColor; ctx.fillText(formatY(tick), pL - 6, y + 4);
        });

        /* X grid + labels */
        ctx.textAlign = 'center';
        for (let a = ageMin; a <= ageMax; a++) {
            const x = xS(a);
            ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x, pT); ctx.lineTo(x, pT + cH); ctx.stroke();
            ctx.fillStyle = axisColor; ctx.fillText(String(a), x, pT + cH + 16);
        }

        /* X axis title */
        ctx.fillStyle = axisColor;
        ctx.font = FONT_MD; ctx.textAlign = 'center';
        ctx.fillText(xAxisLabel, cssW / 2, cssH - 2);

        /* Optional rotated Y axis title */
        if (yAxisLabel) {
            ctx.save();
            ctx.translate(12, pT + cH / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = axisColor;
            ctx.font = FONT_MD; ctx.textAlign = 'center';
            ctx.fillText(yAxisLabel, 0, 0);
            ctx.restore();
        }
    };

    window.TmCanvasUtils = { calcTicks, setupCanvas, drawGrid };
})();



// ─── components/shared/tm-ui.js ─────────────────────────────

// ==UserScript==
// @name         TM UI — Shared component primitives
// @description  Lightweight UI factory used by all TM components. No dependencies.
// ==/UserScript==
(function () {
    'use strict';

    const CSS = `
/* ── TmUI shared primitives (tmu-*) ── */
.tmu-btn {
    border: none; cursor: pointer;
    font-family: inherit; font-weight: 700; letter-spacing: 0.3px;
    transition: background 0.15s, opacity 0.15s;
}
.tmu-btn-block { width: 100%; }
.tmu-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.tmu-btn-primary   { background: #3d6828; color: #e8f5d8; }
.tmu-btn-primary:hover:not(:disabled)   { background: #4e8234; }
.tmu-btn-secondary { background: rgba(42,74,28,0.4); color: #90b878; border: 1px solid #3d6828; }
.tmu-btn-secondary:hover:not(:disabled) { background: rgba(42,74,28,0.7); color: #e8f5d8; }
.tmu-btn-danger    { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
.tmu-btn-danger:hover:not(:disabled)    { background: rgba(239,68,68,0.25); }
.tmu-btn-lime      { background: rgba(108,192,64,0.12); border: 1px solid rgba(108,192,64,0.3); color: #80e048; display: flex; align-items: center; justify-content: center; gap: 6px; }
.tmu-btn-lime:hover:not(:disabled)      { background: rgba(108,192,64,0.22); }
.tmu-input {
    border-radius: 4px;
    background: rgba(0,0,0,.25); border: 1px solid rgba(42,74,28,.6);
    color: #e8f5d8; font-weight: 600;
    font-family: inherit; text-align: right; outline: none;
    transition: border-color 0.15s;
}
.tmu-input:focus { border-color: #6cc040; }
.tmu-input::placeholder { color: #5a7a48; }
.tmu-input-sm { width: 70px; }
.tmu-input-md { width: 110px; }
.tmu-input-full { width: 100%; }
.tmu-field {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.tmu-field-label {
    font-size: 10px; font-weight: 600; color: #90b878;
    text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap;
}
.tmu-card { background: #1c3410; border: 1px solid #3d6828; border-radius: 8px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-bottom: 8px; }
.tmu-card-head {
    font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.5px;
    padding: 10px 12px 6px; display: flex; align-items: center; justify-content: space-between; gap: 6px;
    border-bottom: 1px solid #3d6828;
}
.tmu-card-head-btn {
    background: none; border: none; color: #6a9a58; cursor: pointer;
    font-size: 13px; padding: 0 2px; line-height: 1; transition: color .15s;
}
.tmu-card-head-btn:hover { color: #80e048; }
.tmu-card-body { padding:12px 12px; display: flex; flex-direction: column; gap: 8px; }
.tmu-divider { height: 1px; background: #3d6828; margin: 0; }
.tmu-divider-label { display: flex; align-items: center; gap: 8px; color: #6a9a58; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0 2px; margin-top: 2px; }
.tmu-divider-label::after { content: ''; flex: 1; height: 1px; background: rgba(42,74,28,.5); }
.tmu-spinner { display: inline-block; border-radius: 50%; border-style: solid; border-color: #6a9a58; border-top-color: transparent; animation: tmu-spin 0.6s linear infinite; vertical-align: middle; }
.tmu-spinner-sm { width: 10px; height: 10px; border-width: 2px; }
.tmu-spinner-md { width: 16px; height: 16px; border-width: 2px; }
@keyframes tmu-spin { to { transform: rotate(360deg); } }
.tmu-row { display: flex; align-items: center; gap: 8px; }
.tmu-col { min-width: 0; }
.tmu-col-1{flex:0 0 8.333%}  .tmu-col-2{flex:0 0 16.667%} .tmu-col-3{flex:0 0 25%}     .tmu-col-4{flex:0 0 33.333%}
.tmu-col-5{flex:0 0 41.667%} .tmu-col-6{flex:0 0 50%}     .tmu-col-7{flex:0 0 58.333%} .tmu-col-8{flex:0 0 66.667%}
.tmu-col-9{flex:0 0 75%}     .tmu-col-10{flex:0 0 83.333%}.tmu-col-11{flex:0 0 91.667%}.tmu-col-12{flex:0 0 100%}
.tmu-list-item {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; color: #90b878; font-size: 12px; font-weight: 600;
    text-decoration: none; transition: all 0.15s;
}
.tmu-list-icon { font-size: 14px; width: 20px; text-align: center; flex-shrink: 0; }
.tmu-list-lbl  { flex: 1; }
button.tmu-list-item {
    background: transparent; border: none; cursor: pointer;
    font-family: inherit; text-align: left; width: 100%; border-radius: 5px;
}
.tmu-card-body-flush { padding: 4px; gap: 2px; }
.tmu-stat-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 4px 0; font-size: 11px; color: #c8e0b4;
}
.tmu-stat-row + .tmu-stat-row { border-top: 1px solid rgba(61,104,40,.15); }
.tmu-stat-lbl { color: #6a9a58; font-weight: 600; font-size: 10px; text-transform: uppercase; }
.tmu-stat-val { font-weight: 700; font-variant-numeric: tabular-nums; }
/* ── Shared color variants ── */
.yellow { color: #fbbf24; }
.red    { color: #f87171; }
.green  { color: #4ade80; }
.blue   { color: #60a5fa; }
.purple { color: #c084fc; }
.lime   { color: #80e048; }
.muted  { color: #8aac72; }
.gold   { color: gold; }
.silver { color: silver; }
.orange { color: #ee9900; }
/* ── Typography utilities ── */
.text-xs  { font-size: 10px; } .text-sm  { font-size: 12px; } .text-md  { font-size: 14px; }
.text-lg  { font-size: 16px; } .text-xl  { font-size: 18px; } .text-2xl { font-size: 20px; }
.font-normal { font-weight: 400; } .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
.uppercase { text-transform: uppercase; } .lowercase { text-transform: lowercase; } .capitalize { text-transform: capitalize; }
/* ── Border-radius utilities ── */
.rounded-sm { border-radius: 4px; } .rounded-md { border-radius: 6px; }
.rounded-lg { border-radius: 8px; } .rounded-xl { border-radius: 12px; } .rounded-full { border-radius: 9999px; }
/* ── Spacing utilities (4px base scale) ── */
.pt-0{padding-top:0}      .pt-1{padding-top:4px}    .pt-2{padding-top:8px}    .pt-3{padding-top:12px}   .pt-4{padding-top:16px}   .pt-5{padding-top:20px}   .pt-6{padding-top:24px}
.pb-0{padding-bottom:0}   .pb-1{padding-bottom:4px} .pb-2{padding-bottom:8px} .pb-3{padding-bottom:12px}.pb-4{padding-bottom:16px}.pb-5{padding-bottom:20px}.pb-6{padding-bottom:24px}
.pl-0{padding-left:0}     .pl-1{padding-left:4px}   .pl-2{padding-left:8px}   .pl-3{padding-left:12px}  .pl-4{padding-left:16px}  .pl-5{padding-left:20px}  .pl-6{padding-left:24px}
.pr-0{padding-right:0}    .pr-1{padding-right:4px}  .pr-2{padding-right:8px}  .pr-3{padding-right:12px} .pr-4{padding-right:16px} .pr-5{padding-right:20px} .pr-6{padding-right:24px}
.px-0{padding-left:0;padding-right:0}       .px-1{padding-left:4px;padding-right:4px}     .px-2{padding-left:8px;padding-right:8px}     .px-3{padding-left:12px;padding-right:12px}
.px-4{padding-left:16px;padding-right:16px} .px-5{padding-left:20px;padding-right:20px}   .px-6{padding-left:24px;padding-right:24px}
.py-0{padding-top:0;padding-bottom:0}       .py-1{padding-top:4px;padding-bottom:4px}     .py-2{padding-top:8px;padding-bottom:8px}     .py-3{padding-top:12px;padding-bottom:12px}
.py-4{padding-top:16px;padding-bottom:16px} .py-5{padding-top:20px;padding-bottom:20px}   .py-6{padding-top:24px;padding-bottom:24px}
.pa-0{padding:0} .pa-1{padding:4px} .pa-2{padding:8px} .pa-3{padding:12px} .pa-4{padding:16px} .pa-5{padding:20px} .pa-6{padding:24px}
.mt-0{margin-top:0}      .mt-1{margin-top:4px}    .mt-2{margin-top:8px}    .mt-3{margin-top:12px}   .mt-4{margin-top:16px}   .mt-5{margin-top:20px}   .mt-6{margin-top:24px}
.mb-0{margin-bottom:0}   .mb-1{margin-bottom:4px} .mb-2{margin-bottom:8px} .mb-3{margin-bottom:12px}.mb-4{margin-bottom:16px}.mb-5{margin-bottom:20px}.mb-6{margin-bottom:24px}
.ml-0{margin-left:0}     .ml-1{margin-left:4px}   .ml-2{margin-left:8px}   .ml-3{margin-left:12px}  .ml-4{margin-left:16px}  .ml-5{margin-left:20px}  .ml-6{margin-left:24px}
.mr-0{margin-right:0}    .mr-1{margin-right:4px}  .mr-2{margin-right:8px}  .mr-3{margin-right:12px} .mr-4{margin-right:16px} .mr-5{margin-right:20px} .mr-6{margin-right:24px}
.mx-0{margin-left:0;margin-right:0}       .mx-1{margin-left:4px;margin-right:4px}     .mx-2{margin-left:8px;margin-right:8px}     .mx-3{margin-left:12px;margin-right:12px}
.mx-4{margin-left:16px;margin-right:16px} .mx-5{margin-left:20px;margin-right:20px}   .mx-6{margin-left:24px;margin-right:24px}
.my-0{margin-top:0;margin-bottom:0}       .my-1{margin-top:4px;margin-bottom:4px}     .my-2{margin-top:8px;margin-bottom:8px}     .my-3{margin-top:12px;margin-bottom:12px}
.my-4{margin-top:16px;margin-bottom:16px} .my-5{margin-top:20px;margin-bottom:20px}   .my-6{margin-top:24px;margin-bottom:24px}
.ma-0{margin:0} .ma-1{margin:4px} .ma-2{margin:8px} .ma-3{margin:12px} .ma-4{margin:16px} .ma-5{margin:20px} .ma-6{margin:24px}
/* ── Table ── */
.tmu-tbl{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px}
.tmu-tbl thead th{padding:6px 6px;font-size:10px;font-weight:700;color:#6a9a58;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid #2a4a1c;text-align:left;white-space:nowrap;transition:color .15s}
.tmu-tbl thead th.r{text-align:right} .tmu-tbl thead th.c{text-align:center}
.tmu-tbl thead th.sortable{cursor:pointer;user-select:none}
.tmu-tbl thead th.sortable:hover{color:#c8e0b4}
.tmu-tbl thead th.sort-active{color:#c8e0b4}
.tmu-tbl tbody td{padding:5px 6px;border-bottom:1px solid rgba(42,74,28,.4);color:#c8e0b4;font-variant-numeric:tabular-nums}
.tmu-tbl tbody td.r{text-align:right} .tmu-tbl tbody td.c{text-align:center}
.tmu-tbl tbody tr:hover{background:rgba(255,255,255,.03)}
.tmu-tbl a{color:#80e048;text-decoration:none;font-weight:600}
.tmu-tbl a:hover{color:#c8e0b4;text-decoration:underline}
.tmu-tbl-tot td{border-top:2px solid #3d6828;color:#e0f0cc;font-weight:800}
.tmu-tbl-avg td{color:#6a9a58;font-weight:600}
/* ── Chip ── */
.tmu-chip{display:inline-block;padding:1px 7px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:.3px;line-height:16px}
.tmu-chip-gk{background:rgba(108,192,64,.15);color:#6cc040}
.tmu-chip-d {background:rgba(110,181,255,.12);color:#6eb5ff}
.tmu-chip-m {background:rgba(255,215,64,.1); color:#ffd740}
.tmu-chip-f {background:rgba(255,112,67,.12);color:#ff7043}
.tmu-chip-default{background:rgba(200,224,180,.08);color:#8aac72}
/* ── Progress bar ── */
.tmu-prog-overlay{position:fixed;top:0;left:0;right:0;z-index:99999;
  background:rgba(20,30,15,0.95);border-bottom:2px solid #6cc040;
  padding:10px 20px;font-family:Arial,sans-serif;color:#e8f5d8;transition:opacity 0.5s}
.tmu-prog-inner{display:flex;align-items:center;gap:12px;max-width:900px;margin:0 auto}
.tmu-prog-title{font-size:14px;font-weight:700;color:#6cc040;white-space:nowrap}
.tmu-prog-track{flex:1;background:rgba(108,192,64,0.15);border-radius:8px;height:18px;
  overflow:hidden;border:1px solid rgba(108,192,64,0.3)}
.tmu-prog-bar{height:100%;width:0%;background:linear-gradient(90deg,#3d6828,#6cc040);
  border-radius:8px;transition:width 0.3s}
.tmu-prog-text{font-size:12px;min-width:180px;text-align:right}
.tmu-prog-inline{width:100%;height:5px;background:#274a18;border-radius:3px;
  margin:8px 0;overflow:hidden}
.tmu-prog-inline .tmu-prog-bar{border-radius:3px;transition:width .4s}
/* ── Modal ── */
#tmu-modal-overlay{position:fixed;inset:0;z-index:200000;background:rgba(0,0,0,0.78);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px)}
.tmu-modal{background:linear-gradient(160deg,#1a2e14 0%,#0e1e0a 100%);border:1px solid #4a9030;border-radius:12px;padding:28px 24px 20px;max-width:440px;width:calc(100% - 40px);box-shadow:0 20px 60px rgba(0,0,0,0.9),0 0 0 1px rgba(74,144,48,0.15);color:#c8e0b4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.tmu-modal-icon{font-size:30px;margin-bottom:10px;line-height:1}
.tmu-modal-title{font-size:15px;font-weight:800;color:#e0f0cc;margin-bottom:8px}
.tmu-modal-msg{font-size:12px;color:#90b878;line-height:1.65;margin-bottom:22px}
.tmu-modal-btns{display:flex;flex-direction:column;gap:8px}
.tmu-modal-btn{padding:10px 16px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;border:none;transition:all 0.14s;font-family:inherit;text-align:left}
.tmu-modal-btn-primary{background:#3d6828;color:#e8f5d8;border:1px solid #6cc040}
.tmu-modal-btn-primary:hover{background:#4d8030}
.tmu-modal-btn-secondary{background:rgba(61,104,40,0.15);color:#80c050;border:1px solid #3d6828}
.tmu-modal-btn-secondary:hover{background:rgba(61,104,40,0.3)}
.tmu-modal-btn-danger{background:rgba(60,15,5,0.3);color:#a05040;border:1px solid #5a2a1a}
.tmu-modal-btn-danger:hover{background:rgba(80,20,5,0.5);color:#c06050}
.tmu-modal-btn-sub{font-size:10px;font-weight:400;opacity:.7;display:block;margin-top:2px}
.tmu-prompt-input{width:100%;box-sizing:border-box;margin-bottom:14px;background:rgba(0,0,0,.3);border:1px solid #3d6828;border-radius:5px;color:#e8f5d8;padding:8px 10px;font-size:12px;font-family:inherit;outline:none}
.tmu-prompt-input:focus{border-color:#6cc040}
/* ── Tab bar (tmu-tabs / tmu-tab) ── */
.tmu-tabs{display:flex;gap:6px;flex-wrap:wrap}
.tmu-tab{padding:4px 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:#90b878;cursor:pointer;border-radius:4px;background:rgba(42,74,28,.3);border:1px solid rgba(42,74,28,.6);transition:all .15s;font-family:inherit;-webkit-appearance:none;appearance:none}
.tmu-tab:hover:not(:disabled){color:#c8e0b4;background:rgba(42,74,28,.5);border-color:#3d6828}
.tmu-tab.active{color:#e8f5d8;background:#305820;border-color:#3d6828}
.tmu-tab:disabled{opacity:.4;cursor:not-allowed}
/* ── State (loading / empty / error) ── */
.tmu-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 20px;gap:8px;text-align:center}
.tmu-state-text{color:#6a9a58;font-size:12px;font-weight:600;letter-spacing:.5px}
.tmu-state-empty .tmu-state-text{color:#5a7a48;font-style:italic;font-weight:400}
.tmu-state-error .tmu-state-text{color:#f87171}
.tmu-state-sm{padding:8px 12px;gap:5px}
.tmu-state-sm .tmu-state-text{font-size:10px;letter-spacing:.3px}
`;

    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    let _tblCounter = 0;

    /**
     * Creates a <button> element.
     *
     * @param {object}          opts
     * @param {string}         [opts.label]    — plain text label (use OR slot, not both)
     * @param {Node|string}    [opts.slot]     — DOM node or HTML string for rich content
     * @param {string}         [opts.id]       — sets btn.id (prefer keeping a ref instead)
     * @param {string}         [opts.variant]  — 'primary' | 'secondary' | 'danger'  (default: 'primary')
     * @param {string}         [opts.cls]      — extra CSS classes
     * @param {boolean}        [opts.disabled]
     * @param {Function}       [opts.onClick]
     * @returns {HTMLButtonElement}
     */
    const button = ({ label, slot, id, variant = 'lime', size = 'md', cls = '', block = false, disabled = false, onClick } = {}) => {
        const SIZES = { xs: 'py-0 px-2 text-xs', sm: 'py-1 px-3 text-sm', md: 'py-2 px-3 text-sm' };
        const btn = document.createElement('button');
        btn.className = `tmu-btn tmu-btn-${variant} rounded-md ${SIZES[size] || SIZES.md}${block ? ' tmu-btn-block' : ''}${cls ? ' ' + cls : ''}`;
        if (id) btn.id = id;
        if (disabled) btn.disabled = true;

        if (slot instanceof Node) {
            btn.appendChild(slot);
        } else if (typeof slot === 'string') {
            btn.innerHTML = slot;
        } else if (label != null) {
            btn.textContent = label;
        }

        if (onClick) btn.addEventListener('click', onClick);
        return btn;
    };

    /**
     * Sets innerHTML on el, hydrates <tm-button> tags, collects [data-ref] elements.
     * Returns a single refs object with both button and DOM refs.
     *
     * Use `let refs; refs = TmUI.render(...)` so handlers can close over refs lazily.
     *
     * @param {Element} el        — element to render into (innerHTML will be replaced)
     * @param {string}  html      — template string
     * @param {object}  handlers  — { actionName: Function } matched to data-action
     * @returns {object}          — { [action]: HTMLButtonElement, [data-ref]: Element }
     *
     * @example
     * let refs;
     * refs = TmUI.render(root, `
     *     <input data-ref="name">
     *     <tm-button data-label="Save" data-action="save"></tm-button>
     * `, { save: () => console.log(refs.name.value) });
     */
    const render = (el, html, handlers = {}) => {
        if (html !== undefined) el.innerHTML = html;
        const refs = {};

        // tm-card: wrap children in .tmu-card > [head] + .tmu-card-body
        // Process deepest-first so nested cards work correctly
        el.querySelectorAll('tm-card').forEach(tmCard => {
            const card = document.createElement('div');
            card.className = 'tmu-card';
            if (tmCard.dataset.ref) card.dataset.ref = tmCard.dataset.ref;

            if (tmCard.dataset.title) {
                const head = document.createElement('div');
                head.className = 'tmu-card-head';
                const titleSpan = document.createElement('span');
                titleSpan.textContent = tmCard.dataset.icon
                    ? tmCard.dataset.icon + ' ' + tmCard.dataset.title
                    : tmCard.dataset.title;
                head.appendChild(titleSpan);
                if (tmCard.dataset.headAction) {
                    const action = tmCard.dataset.headAction;
                    const hBtn = document.createElement('button');
                    hBtn.type = 'button';
                    hBtn.className = 'tmu-card-head-btn';
                    hBtn.textContent = tmCard.dataset.headIcon || '↻';
                    if (handlers[action]) hBtn.addEventListener('click', handlers[action]);
                    head.appendChild(hBtn);
                    refs[action] = hBtn;
                }
                if (tmCard.dataset.headRef) refs[tmCard.dataset.headRef] = head;
                card.appendChild(head);
            }

            const body = document.createElement('div');
            body.className = 'tmu-card-body' + (tmCard.dataset.flush !== undefined ? ' tmu-card-body-flush' : '');
            while (tmCard.firstChild) body.appendChild(tmCard.firstChild);
            card.appendChild(body);
            tmCard.replaceWith(card);
        });

        el.querySelectorAll('tm-divider').forEach(tmDivider => {
            const label = tmDivider.dataset.label;
            if (label) {
                const div = document.createElement('div');
                div.className = 'tmu-divider-label';
                div.textContent = label;
                tmDivider.replaceWith(div);
            } else {
                const div = document.createElement('div');
                div.className = 'tmu-divider';
                tmDivider.replaceWith(div);
            }
        });

        el.querySelectorAll('tm-button').forEach(tmBtn => {
            const action = tmBtn.dataset.action;
            const inner = tmBtn.innerHTML.trim();
            const btn = button({
                label: inner ? undefined : tmBtn.dataset.label,
                slot: inner || undefined,
                id: tmBtn.dataset.id,
                variant: tmBtn.dataset.variant,
                size: tmBtn.dataset.size,
                cls: tmBtn.dataset.cls,
                block: tmBtn.hasAttribute('data-block'),
                onClick: action ? handlers[action] : undefined,
            });
            if (tmBtn.getAttribute('title')) btn.title = tmBtn.getAttribute('title');
            if (tmBtn.getAttribute('style')) btn.setAttribute('style', tmBtn.getAttribute('style'));
            const skipAttrs = new Set(['data-label','data-variant','data-action','data-id','data-block','data-size','data-cls']);
            for (const attr of tmBtn.attributes) {
                if (attr.name.startsWith('data-') && !skipAttrs.has(attr.name)) btn.setAttribute(attr.name, attr.value);
            }
            tmBtn.replaceWith(btn);
            if (action) refs[action] = btn;
        });

        el.querySelectorAll('tm-input').forEach(tmInput => {
            const input = document.createElement('input');
            const size = tmInput.dataset.size || 'sm';
            input.className = `tmu-input tmu-input-${size} py-1 px-2 text-sm`;
            if (tmInput.dataset.ref) input.dataset.ref = tmInput.dataset.ref;
            if (tmInput.dataset.type) input.type = tmInput.dataset.type;
            if (tmInput.dataset.value) input.value = tmInput.dataset.value;
            if (tmInput.dataset.placeholder) input.placeholder = tmInput.dataset.placeholder;
            if (tmInput.dataset.min) input.min = tmInput.dataset.min;
            if (tmInput.dataset.max) input.max = tmInput.dataset.max;
            if (tmInput.dataset.step) input.step = tmInput.dataset.step;

            if (tmInput.dataset.label) {
                const row = document.createElement('div');
                row.className = 'tmu-field';
                const lbl = document.createElement('span');
                lbl.className = 'tmu-field-label';
                lbl.textContent = tmInput.dataset.label;
                row.appendChild(lbl);
                row.appendChild(input);
                tmInput.replaceWith(row);
            } else {
                tmInput.replaceWith(input);
            }
        });

        el.querySelectorAll('tm-stat').forEach(tmStat => {
            const row = document.createElement('div');
            const cls = tmStat.dataset.cls || '';
            row.className = 'tmu-stat-row' + (cls ? ' ' + cls : '');
            const lbl = document.createElement('span');
            const lblCls = tmStat.dataset.lblCls || '';
            lbl.className = 'tmu-stat-lbl' + (lblCls ? ' ' + lblCls : '');
            lbl.textContent = tmStat.dataset.label || '';
            row.appendChild(lbl);
            const val = document.createElement('span');
            const variant = tmStat.dataset.variant || tmStat.className;
            const valCls = tmStat.dataset.valCls || '';
            val.className = 'tmu-stat-val' + (variant ? ' ' + variant : '') + (valCls ? ' ' + valCls : '');
            if (tmStat.innerHTML.trim()) val.innerHTML = tmStat.innerHTML;
            else val.textContent = tmStat.dataset.value || '';
            if (tmStat.dataset.ref) val.dataset.ref = tmStat.dataset.ref;
            row.appendChild(val);
            tmStat.replaceWith(row);
        });

        el.querySelectorAll('tm-list-item').forEach(tmItem => {
            const action = tmItem.dataset.action;
            const node = action ? document.createElement('button') : document.createElement('a');
            node.className = 'tmu-list-item';
            if (tmItem.dataset.variant) node.classList.add(tmItem.dataset.variant);
            if (action) {
                node.type = 'button';
                if (handlers[action]) node.addEventListener('click', handlers[action]);
                refs[action] = node;
            } else {
                node.href = tmItem.dataset.href || '#';
            }
            if (tmItem.dataset.icon) {
                const icon = document.createElement('span');
                icon.className = 'tmu-list-icon';
                icon.textContent = tmItem.dataset.icon;
                node.appendChild(icon);
            }
            if (tmItem.dataset.label) {
                const lbl = document.createElement('span');
                lbl.className = 'tmu-list-lbl';
                lbl.textContent = tmItem.dataset.label;
                node.appendChild(lbl);
            }
            if (tmItem.dataset.ref) node.dataset.ref = tmItem.dataset.ref;
            tmItem.replaceWith(node);
        });

        el.querySelectorAll('[data-ref]').forEach(node => {
            refs[node.dataset.ref] = node;
        });

        el.querySelectorAll('tm-row').forEach(tmRow => {
            const div = document.createElement('div');
            const cls = tmRow.dataset.cls || '';
            div.className = 'tmu-row' + (cls ? ' ' + cls : '');
            if (tmRow.dataset.justify) div.style.justifyContent = tmRow.dataset.justify;
            if (tmRow.dataset.align)   div.style.alignItems     = tmRow.dataset.align;
            if (tmRow.dataset.gap)     div.style.gap            = tmRow.dataset.gap;
            while (tmRow.firstChild) div.appendChild(tmRow.firstChild);
            tmRow.replaceWith(div);
        });

        el.querySelectorAll('tm-col').forEach(tmCol => {
            const div = document.createElement('div');
            const size = tmCol.dataset.size;
            const cls  = tmCol.dataset.cls || '';
            div.className = 'tmu-col' + (size ? ' tmu-col-' + size : '') + (cls ? ' ' + cls : '');
            while (tmCol.firstChild) div.appendChild(tmCol.firstChild);
            tmCol.replaceWith(div);
        });

        el.querySelectorAll('tm-spinner').forEach(tmSpinner => {
            const span = document.createElement('span');
            const size = tmSpinner.dataset.size || 'sm';
            const cls  = tmSpinner.dataset.cls || '';
            span.className = `tmu-spinner tmu-spinner-${size}${cls ? ' ' + cls : ''}`;
            tmSpinner.replaceWith(span);
        });

        return refs;
    };

    const stat = (label, html = '', variant = '') =>
        `<div class="tmu-stat-row"><span class="tmu-stat-lbl">${label}</span><span class="tmu-stat-val${variant ? ' ' + variant : ''}">${html}</span></div>`;

    /**
     * Creates a chip (<span>) element.
     *
     * @param {string} text     — displayed text
     * @param {string} variant  — 'gk' | 'd' | 'm' | 'f' | 'default' (or any extra css class)
     * @returns {string}        — HTML string
     */
    const chip = (text, variant = 'default') =>
        `<span class="tmu-chip tmu-chip-${variant}">${text}</span>`;

    /**
     * Reusable sortable data table that supports per-column render slots.
     *
     * @param {object}   opts
     * @param {Array}    opts.headers        — column definitions (see below)
     * @param {Array}    opts.items          — data rows (plain objects)
     * @param {string}  [opts.sortKey]       — initial sort column key (default: first sortable column)
     * @param {number}  [opts.sortDir]       — 1 = asc, -1 = desc (default: -1)
     * @param {string}  [opts.cls]           — extra CSS class on <table>
     * @param {Function}[opts.onRowClick]    — (item, sortedIndex) => void
     *
     * Header definition object:
     *   { key, label, align?, cls?, thCls?, width?, sortable?, sort?, render? }
     *   - key       {string}   field name in the item object
     *   - label     {string}   column header text
     *   - align     {string}   'l' | 'c' | 'r'  (applied to both th and td)
     *   - cls       {string}   extra class on every <td>
     *   - thCls     {string}   extra class on <th>
     *   - width     {string}   CSS width on <th> e.g. '80px'
     *   - sortable  {boolean}  default true
     *   - sort      {Function} custom comparator (a, b) => number (receives raw items)
     *   - render    {Function} (value, item) => HTML string  — the cell "slot"
     *                          omit to render value as plain text
     *
     * @returns {HTMLDivElement}  wrapper element with a .refresh({ items, sortKey, sortDir }) method
     *
     * @example
     * const t = TmUI.table({
     *     headers: [
     *         { key: 'pos',  label: 'Pos',  align: 'c',
     *           render: (val) => TmUI.chip(val, val.toLowerCase()) },
     *         { key: 'name', label: 'Player',
     *           render: (val, item) => `<a href="${item.url}">${val}</a>` },
     *         { key: 'asi',  label: 'ASI', align: 'r' },
     *     ],
     *     items: players,
     *     sortKey: 'asi',
     *     sortDir: -1,
     * });
     * container.appendChild(t);
     *
     * // later:
     * t.refresh({ items: newPlayers });
     */
    const table = ({ headers = [], items = [], groupHeaders = [], footer = [], sortKey = null, sortDir = -1, cls = '', rowCls = null, onRowClick = null } = {}) => {
        const wrap = document.createElement('div');
        const id = 'tmu-tbl-' + (++_tblCounter);

        let _items = items;
        let _footer = footer;
        let _sk = sortKey != null ? sortKey : (headers.find(h => h.sortable !== false) || {}).key || null;
        let _sd = sortDir;

        function _render() {
            const sortHdr = _sk ? headers.find(h => h.key === _sk) : null;
            const sorted = _items.slice().sort((a, b) => {
                if (!sortHdr) return 0;
                if (sortHdr.sort) return _sd * sortHdr.sort(a, b);
                const va = a[_sk], vb = b[_sk];
                if (typeof va === 'number' && typeof vb === 'number') return _sd * (va - vb);
                return _sd * String(va ?? '').localeCompare(String(vb ?? ''));
            });

            const arrow = _sd > 0 ? ' ▲' : ' ▼';
            let h = `<table class="tmu-tbl${cls ? ' ' + cls : ''}" id="${id}"><thead>`;

            groupHeaders.forEach(row => {
                const rc = row.cls || '';
                h += `<tr${rc ? ` class="${rc}"` : ''}>`;
                (row.cells || []).forEach(cell => {
                    const cc = cell.cls || '';
                    h += `<th${cc ? ` class="${cc}"` : ''}${cell.colspan ? ` colspan="${cell.colspan}"` : ''}${cell.rowspan ? ` rowspan="${cell.rowspan}"` : ''}>${cell.label ?? ''}</th>`;
                });
                h += '</tr>';
            });

            h += '<tr>';
            headers.forEach(hdr => {
                const align = hdr.align && hdr.align !== 'l' ? ' ' + hdr.align : '';
                const canSort = hdr.sortable !== false;
                const isActive = canSort && _sk === hdr.key;
                const thCls = [canSort ? 'sortable' : '', isActive ? 'sort-active' : '', align, hdr.thCls || ''].filter(Boolean).join(' ');
                h += `<th${thCls ? ` class="${thCls}"` : ''}${canSort ? ` data-sk="${hdr.key}"` : ''}${hdr.width ? ` style="width:${hdr.width}"` : ''}${hdr.title ? ` title="${hdr.title}"` : ''}>`;
                h += hdr.label + (isActive ? arrow : '') + '</th>';
            });

            h += '</tr></thead><tbody>';

            sorted.forEach((item, i) => {
                const rc = rowCls ? rowCls(item) : '';
                h += `<tr${rc ? ` class="${rc}"` : ''}${onRowClick ? ` data-ri="${i}"` : ''}>`;
                headers.forEach(hdr => {
                    const val = item[hdr.key];
                    const align = hdr.align && hdr.align !== 'l' ? ' ' + hdr.align : '';
                    const tdCls = [align, hdr.cls || ''].filter(Boolean).join(' ');
                    const content = hdr.render ? hdr.render(val, item, i) : (val == null ? '' : val);
                    h += `<td${tdCls ? ` class="${tdCls}"` : ''}>${content}</td>`;
                });
                h += '</tr>';
            });

            h += '</tbody>';

            if (_footer.length) {
                h += '<tfoot>';
                _footer.forEach(fRow => {
                    const rc = fRow.cls || '';
                    h += `<tr${rc ? ` class="${rc}"` : ''}>`;
                    (fRow.cells || []).forEach((cell, ci) => {
                        const hdr = headers[ci];
                        const defaultAlign = hdr && hdr.align && hdr.align !== 'l' ? ' ' + hdr.align : '';
                        if (cell == null || typeof cell !== 'object') {
                            h += `<td${defaultAlign ? ` class="${defaultAlign}"` : ''}>${cell ?? ''}</td>`;
                        } else {
                            const tc = [defaultAlign, cell.cls || ''].filter(Boolean).join(' ');
                            h += `<td${tc ? ` class="${tc}"` : ''}>${cell.content ?? ''}</td>`;
                        }
                    });
                    h += '</tr>';
                });
                h += '</tfoot>';
            }

            h += '</table>';
            wrap.innerHTML = h;

            const tbl = wrap.firstElementChild;

            tbl.querySelectorAll('thead th[data-sk]').forEach(th => {
                th.addEventListener('click', () => {
                    const key = th.dataset.sk;
                    if (_sk === key) { _sd *= -1; } else { _sk = key; _sd = -1; }
                    _render();
                });
            });

            if (onRowClick) {
                tbl.querySelectorAll('tbody tr[data-ri]').forEach(tr => {
                    const i = +tr.dataset.ri;
                    tr.addEventListener('click', () => onRowClick(sorted[i], i));
                });
            }
        }

        _render();

        /** Update items and/or sort state, then re-render. */
        wrap.refresh = ({ items: newItems, sortKey: sk, sortDir: sd, footer: newFooter } = {}) => {
            if (newItems !== undefined) _items = newItems;
            if (sk !== undefined) _sk = sk;
            if (sd !== undefined) _sd = sd;
            if (newFooter !== undefined) _footer = newFooter;
            _render();
        };

        return wrap;
    };

    /**
     * Create a progress bar.
     *
     * @param {object}         [opts]
     * @param {string}         [opts.title]    — label shown at the left (default: '⚡ Processing')
     * @param {boolean}        [opts.inline]   — true: slim inline bar (append to container); false: fixed top overlay
     * @param {HTMLElement}    [opts.container] — required when inline:true; bar is appended here
     * @param {number}         [opts.fadeDelay] — ms before overlay auto-hides after done() (default: 2500)
     * @returns {{ update(current, total, label?): void, done(msg?): void, error(msg): void, remove(): void }}
     */
    const progressBar = ({ title = '⚡ Processing', inline = false, container = null, fadeDelay = 2500 } = {}) => {
        const wrap = document.createElement('div');

        if (inline) {
            wrap.className = 'tmu-prog-inline';
            wrap.innerHTML = '<div class="tmu-prog-bar"></div>';
            if (container) container.appendChild(wrap);
        } else {
            wrap.className = 'tmu-prog-overlay';
            wrap.innerHTML =
                `<div class="tmu-prog-inner">` +
                `<div class="tmu-prog-title">${title}</div>` +
                `<div class="tmu-prog-track"><div class="tmu-prog-bar"></div></div>` +
                `<div class="tmu-prog-text">Initializing...</div>` +
                `</div>`;
            document.body.appendChild(wrap);
        }

        const barEl = () => wrap.querySelector('.tmu-prog-bar');
        const txtEl = () => wrap.querySelector('.tmu-prog-text');

        return {
            update(current, total, label) {
                const pct = total > 0 ? Math.round((current / total) * 100) : 0;
                const b = barEl();
                if (b) b.style.width = pct + '%';
                const t = txtEl();
                if (t) t.textContent = label != null ? label : `${current}/${total}`;
            },
            done(msg) {
                const b = barEl(), t = txtEl();
                if (b) b.style.width = '100%';
                if (t) { t.style.color = '#6cc040'; t.textContent = msg != null ? msg : '✓ Done'; }
                if (!inline) setTimeout(() => {
                    wrap.style.opacity = '0';
                    setTimeout(() => wrap.remove(), 600);
                }, fadeDelay);
            },
            error(msg) {
                const t = txtEl();
                if (t) { t.style.color = '#f87171'; t.textContent = msg; }
                if (!inline) setTimeout(() => wrap.remove(), 4000);
            },
            remove() { wrap.remove(); },
        };
    };

    const modal = ({ icon, title, message, buttons }) =>
        new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.id = 'tmu-modal-overlay';
            overlay.innerHTML =
                `<div class="tmu-modal">` +
                `<div class="tmu-modal-icon">${icon || ''}</div>` +
                `<div class="tmu-modal-title">${title}</div>` +
                `<div class="tmu-modal-msg">${message}</div>` +
                `<div class="tmu-modal-btns">${buttons.map(b =>
                    `<button class="tmu-modal-btn tmu-modal-btn-${b.style || 'secondary'}" data-val="${b.value}">` +
                    `${b.label}${b.sub ? `<span class="tmu-modal-btn-sub">${b.sub}</span>` : ''}` +
                    `</button>`
                ).join('')}</div></div>`;
            const closeWith = val => { overlay.remove(); resolve(val); };
            const onKey = e => {
                if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); closeWith('cancel'); }
            };
            overlay.addEventListener('click', e => {
                if (e.target === overlay) { document.removeEventListener('keydown', onKey); closeWith('cancel'); }
            });
            document.addEventListener('keydown', onKey);
            overlay.querySelectorAll('.tmu-modal-btn').forEach(btn =>
                btn.addEventListener('click', () => { document.removeEventListener('keydown', onKey); closeWith(btn.dataset.val); })
            );
            document.body.appendChild(overlay);
        });

    const prompt = ({ icon, title, placeholder, defaultValue }) =>
        new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.id = 'tmu-modal-overlay';
            const esc = s => (s || '').replace(/"/g, '&quot;');
            overlay.innerHTML =
                `<div class="tmu-modal">` +
                `<div class="tmu-modal-icon">${icon || ''}</div>` +
                `<div class="tmu-modal-title">${title}</div>` +
                `<input type="text" class="tmu-prompt-input" placeholder="${esc(placeholder)}" value="${esc(defaultValue)}" />` +
                `<div class="tmu-modal-btns">` +
                `<button class="tmu-modal-btn tmu-modal-btn-primary" data-val="ok">💾 Save</button>` +
                `<button class="tmu-modal-btn tmu-modal-btn-danger" data-val="cancel">Cancel</button>` +
                `</div></div>`;
            const getVal = () => overlay.querySelector('.tmu-prompt-input').value.trim();
            const closeWith = val => { overlay.remove(); resolve(val); };
            const onKey = e => {
                if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); closeWith(null); }
                if (e.key === 'Enter') { document.removeEventListener('keydown', onKey); closeWith(getVal() || null); }
            };
            overlay.addEventListener('click', e => {
                if (e.target === overlay) { document.removeEventListener('keydown', onKey); closeWith(null); }
            });
            document.addEventListener('keydown', onKey);
            overlay.querySelector('[data-val="ok"]').addEventListener('click', () => { document.removeEventListener('keydown', onKey); closeWith(getVal() || null); });
            overlay.querySelector('[data-val="cancel"]').addEventListener('click', () => { document.removeEventListener('keydown', onKey); closeWith(null); });
            document.body.appendChild(overlay);
            setTimeout(() => overlay.querySelector('.tmu-prompt-input').focus(), 50);
        });

    /**
     * Creates a tab bar DOM node.
     *
     * @param {object}   opts
     * @param {Array}    opts.items    — [{ key, label, disabled? }]
     * @param {string}   opts.active   — initially active key
     * @param {Function} opts.onChange — (key) => void — called on tab switch (not called for disabled tabs)
     * @returns {HTMLDivElement}  — div.tmu-tabs with buttons inside; override className for custom styling
     */
    const tabs = ({ items, active, onChange }) => {
        const wrap = document.createElement('div');
        wrap.className = 'tmu-tabs';
        items.forEach(({ key, label, disabled }) => {
            const btn = document.createElement('button');
            btn.className = 'tmu-tab' + (key === active ? ' active' : '');
            btn.dataset.tab = key;
            btn.textContent = label;
            if (disabled) btn.disabled = true;
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                wrap.querySelectorAll('.tmu-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                onChange(key);
            });
            wrap.appendChild(btn);
        });
        return wrap;
    };

    /**
     * Returns a sort-direction indicator string for use in table headers.
     *
     * @param {string}  key      — column key being rendered
     * @param {string}  sortKey  — currently active sort column
     * @param {boolean} asc      — true = ascending
     * @returns {string}         — ' ▲', ' ▼', or ''
     */
    const sortArrow = (key, sortKey, asc) => key === sortKey ? (asc ? ' ▲' : ' ▼') : '';

    /**
     * Returns an HTML string for a colored skill value with optional decimal superscript.
     * Renders:
     *   —  null/undefined → muted dash
     *   —  floor ≥ 20   → gold ★
     *   —  floor ≥ 19   → silver ★ + decimal superscript
     *   —  otherwise    → colored integer + decimal superscript
     *
     * @param {number|null} val — skill value (may have decimals)
     * @returns {string}        — HTML string
     */
    const skillBadge = (val) => {
        if (val == null) return '<span style="color:#4a5a40">—</span>';
        const floor = Math.floor(val);
        const frac = val - floor;
        const fracStr = frac > 0.005
            ? `<sup style="font-size:8px;opacity:.75">.${Math.round(frac * 100).toString().padStart(2, '0')}</sup>`
            : '';
        if (floor >= 20) return '<span style="color:#d4af37;font-size:13px">★</span>';
        if (floor >= 19) return `<span style="color:#c0c0c0;font-size:13px">★${fracStr}</span>`;
        return `<span style="color:${window.TmUtils.skillColor(floor)}">${floor}${fracStr}</span>`;
    };

    /**
     * Positions a body-appended tooltip element near an anchor element,
     * with viewport edge clamping (right and bottom edges).
     *
     * @param {HTMLElement} el     — the tooltip element (already in DOM)
     * @param {Element}     anchor — element to anchor against
     */
    const positionTooltip = (el, anchor) => {
        const rect = anchor.getBoundingClientRect();
        el.style.top  = (rect.bottom + window.scrollY + 4) + 'px';
        el.style.left = (rect.left + window.scrollX) + 'px';
        requestAnimationFrame(() => {
            const tipRect = el.getBoundingClientRect();
            if (tipRect.right > window.innerWidth - 10)
                el.style.left = (window.innerWidth - tipRect.width - 10) + 'px';
            if (tipRect.bottom > window.innerHeight + window.scrollY - 10)
                el.style.top = (rect.top + window.scrollY - tipRect.height - 4) + 'px';
        });
    };

    /**
     * Build the standard position chip HTML used across squad, transfer, and shortlist tables.
     * The chip container uses the primary position color for background (10% opacity) and border (25% opacity).
     *
     * @param {string} primaryColor  — hex color of the first/primary position
     * @param {string} innerHTML     — pre-built inner HTML (colored position label spans)
     * @param {string} [cls]         — optional CSS class (default: 'tm-pos-chip')
     * @returns {string} HTML string
     */
    const positionChip = (primaryColor, innerHTML, cls = 'tm-pos-chip') =>
        `<span class="${cls}" style="background:${primaryColor}22;border:1px solid ${primaryColor}44">${innerHTML}</span>`;

    /**
     * Returns an HTML string for a loading state.
     * @param {string} [msg='Loading…']
     * @param {boolean} [compact]  — true: use .tmu-state-sm (smaller padding, font)
     * @returns {string}
     */
    const loading = (msg = 'Loading\u2026', compact = false) =>
        `<div class="tmu-state${compact ? ' tmu-state-sm' : ''}">`+
        `<span class="tmu-spinner tmu-spinner-md"></span>`+
        `<span class="tmu-state-text">${msg}</span></div>`;

    /**
     * Returns an HTML string for an empty state.
     * @param {string} [msg='No data']
     * @param {boolean} [compact]
     * @returns {string}
     */
    const empty = (msg = 'No data', compact = false) =>
        `<div class="tmu-state tmu-state-empty${compact ? ' tmu-state-sm' : ''}">`+
        `<span class="tmu-state-text">${msg}</span></div>`;

    /**
     * Returns an HTML string for an error state.
     * @param {string} [msg='Error']
     * @param {boolean} [compact]
     * @returns {string}
     */
    const error = (msg = 'Error', compact = false) =>
        `<div class="tmu-state tmu-state-error${compact ? ' tmu-state-sm' : ''}">`+
        `<span>\u26a0</span>`+
        `<span class="tmu-state-text">${msg}</span></div>`;

    window.TmUI = { button, render, stat, chip, table, progressBar, modal, prompt, tabs, sortArrow, skillBadge, positionTooltip, positionChip, loading, empty, error };

})();

