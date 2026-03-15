/**
 * constants/skills.js — ASI weight matrices, skill definitions, and rating thresholds
 */

// ─── ASI weight matrices (R5 = relative5, RB = relative-base) ───────────
export const WEIGHT_R5 = [
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

export const WEIGHT_RB = [
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

// ─── Color levels & display thresholds ────────────────────────────────
export const COLOR_LEVELS = [
    { color: '#ff4c4c' }, { color: '#ff8c00' }, { color: '#ffd700' },
    { color: '#90ee90' }, { color: '#00cfcf' }, { color: '#5b9bff' }, { color: '#cc88ff' }
];
export const R5_THRESHOLDS  = [110, 100, 90, 80, 70, 60, 0];
export const TI_THRESHOLDS  = [12, 9, 6, 4, 2, 1, -Infinity];
export const REC_THRESHOLDS = [5.5, 5, 4, 3, 2, 1, 0];
export const RTN_THRESHOLDS = [90, 60, 40, 30, 20, 10, 0];

// ─── ASI formula constants ────────────────────────────────────────────
/* Positional defense/offense bonus multipliers (outfield only, index 0-8) */
export const POS_MULTIPLIERS    = [0.3, 0.3, 0.9, 0.6, 1.5, 0.9, 0.9, 0.6, 0.3];
export const ASI_WEIGHT_OUTFIELD = 263533760000; // 2^9 * 5^4 * 7^7 * 128
export const ASI_WEIGHT_GK       = 48717927500;

// ─── Skill definitions ────────────────────────────────────────────────
export const SKILL_DEFS = [
    // shared (isGK + isOutfield) — must stay at the top; indices 0-2 match both weight matrices
    { name: 'Strength', key: 'strength', isGK: true, isOutfield: true, category: 'Physical', id: 0 },
    { name: 'Stamina',  key: 'stamina',  isGK: true, isOutfield: true, category: 'Physical', id: 1 },
    { name: 'Pace',     key: 'pace',     isGK: true, isOutfield: true, category: 'Physical', id: 2 },
    // outfield-only (indices 3-13 after filter)
    { name: 'Marking',     key: 'marking',    isOutfield: true, category: 'Tactical',  id: 3 },
    { name: 'Tackling',    key: 'tackling',   isOutfield: true, category: 'Tactical',  id: 4 },
    { name: 'Workrate',    key: 'workrate',   isOutfield: true, category: 'Tactical',  id: 5 },
    { name: 'Positioning', key: 'positioning',isOutfield: true, category: 'Tactical',  id: 6 },
    { name: 'Passing',     key: 'passing',    isOutfield: true, category: 'Technical', id: 7 },
    { name: 'Crossing',    key: 'crossing',   isOutfield: true, category: 'Technical', id: 8 },
    { name: 'Technique',   key: 'technique',  isOutfield: true, category: 'Technical', id: 9 },
    { name: 'Heading',     key: 'heading',    isOutfield: true, category: 'Physical',  id: 10 },
    { name: 'Finishing',   key: 'finishing',  isOutfield: true, category: 'Technical', id: 11 },
    { name: 'Longshots',   key: 'longshots',  isOutfield: true, category: 'Technical', id: 12 },
    { name: 'Set Pieces',  key: 'set_pieces', isOutfield: true, category: 'Technical', id: 13 },
    // GK-only (indices 3-10 after filter)
    { name: 'Handling',      key: 'handling',      isGK: true, category: 'Technical', id: 3 },
    { name: 'One on ones',   key: 'oneonones',     isGK: true, category: 'Tactical',  key2: 'one_on_ones',    id: 4 },
    { name: 'Reflexes',      key: 'reflexes',      isGK: true, category: 'Technical', id: 5 },
    { name: 'Aerial Ability',key: 'arialability',  isGK: true, category: 'Tactical',  key2: 'aerial_ability', id: 6 },
    { name: 'Jumping',       key: 'jumping',       isGK: true, category: 'Physical',  id: 7 },
    { name: 'Communication', key: 'communication', isGK: true, category: 'Tactical',  id: 8 },
    { name: 'Kicking',       key: 'kicking',       isGK: true, category: 'Technical', id: 9 },
    { name: 'Throwing',      key: 'throwing',      isGK: true, category: 'Technical', id: 10 },
];

export const SKILL_DEFS_OUT = SKILL_DEFS.filter(s => s.isOutfield);
export const SKILL_DEFS_GK  = SKILL_DEFS.filter(s => s.isGK);

// ─── Transfer-API short skill keys (in API response order) ───────────
export const SKILL_KEYS_OUT = ['str', 'sta', 'pac', 'mar', 'tac', 'wor', 'pos', 'pas', 'cro', 'tec', 'hea', 'fin', 'lon', 'set'];
/* GK: str/sta/pac come first (shared), then GK-only in Transfer-API response order.
   NOTE: SKILL_KEYS_GK_WEIGHT (below) follows the ASI weight-matrix index order — different sequence. */
export const SKILL_KEYS_GK  = ['str', 'sta', 'pac', 'han', 'one', 'ref', 'ari', 'jum', 'com', 'kic', 'thr'];
export const SKILL_KEYS_ALL = [...SKILL_KEYS_OUT, ...SKILL_KEYS_GK.filter(s => !SKILL_KEYS_OUT.includes(s))];

export const SKILL_LABELS = {
    str: 'Str', sta: 'Sta', pac: 'Pac', mar: 'Mar', tac: 'Tac', wor: 'Wor',
    pos: 'Pos', pas: 'Pas', cro: 'Cro', tec: 'Tec', hea: 'Hea', fin: 'Fin',
    lon: 'Lon', set: 'Set', han: 'Han', one: 'One', ref: 'Ref', ari: 'Aer',
    jum: 'Jum', com: 'Com', kic: 'Kic', thr: 'Thr',
};

/* Ordered short-label arrays derived from SKILL_LABELS.
   SKILL_LABELS_GK follows the weight-matrix / GRAPH_KEYS_GK index order, NOT SKILL_KEYS_GK order. */
export const SKILL_LABELS_OUT     = SKILL_KEYS_OUT.map(k => SKILL_LABELS[k]);
export const SKILL_LABELS_GK      = ['str', 'pac', 'jum', 'sta', 'one', 'ref', 'ari', 'com', 'kic', 'thr', 'han'].map(k => SKILL_LABELS[k]);
/* Short skill keys in ASI weight-matrix index order for GK. Different from SKILL_KEYS_GK (Transfer-API order). */
export const SKILL_KEYS_GK_WEIGHT = ['str', 'pac', 'jum', 'sta', 'one', 'ref', 'ari', 'com', 'kic', 'thr', 'han'];
/* SKILL_KEYS_GK order short labels (different from SKILL_LABELS_GK which is weight-matrix order) */
export const SKILL_NAMES_GK_SHORT = SKILL_KEYS_GK.map(k => SKILL_LABELS[k]);
/* Full names in SKILL_KEYS_OUT / SKILL_KEYS_GK order (matches tooltip skill name strings) */
export const SKILL_NAMES_OUT = SKILL_DEFS_OUT.map(s => s.name);
export const SKILL_NAMES_GK  = SKILL_DEFS_GK.map(s => s.name);

/* Graphs API long-key order. GRAPH_KEYS_GK matches the ASI weight-matrix index order
   (short-key equivalent of SKILL_LABELS_GK). Different from SKILL_KEYS_GK. */
export const GRAPH_KEYS_OUT = SKILL_DEFS_OUT.map(s => s.key);
export const GRAPH_KEYS_GK  = ['strength', 'pace', 'jumping', 'stamina', 'one_on_ones', 'reflexes', 'aerial_ability', 'communication', 'kicking', 'throwing', 'handling'];

/* Skill efficiency brackets — fraction of overflow points absorbed per integer level.
   Format: [minLevel, efficiencyRate]. Evaluated top-to-bottom; first match wins. */
export const SKILL_EFFICIENCY_BRACKETS = [[18, 0.04], [15, 0.05], [5, 0.10], [0, 0.15]];
