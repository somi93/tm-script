(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/constants/skills.js
  var skills_exports = {};
  __export(skills_exports, {
    ASI_WEIGHT_GK: () => ASI_WEIGHT_GK,
    ASI_WEIGHT_OUTFIELD: () => ASI_WEIGHT_OUTFIELD,
    COLOR_LEVELS: () => COLOR_LEVELS,
    GRAPH_KEYS_GK: () => GRAPH_KEYS_GK,
    GRAPH_KEYS_OUT: () => GRAPH_KEYS_OUT,
    POS_MULTIPLIERS: () => POS_MULTIPLIERS,
    R5_THRESHOLDS: () => R5_THRESHOLDS,
    REC_THRESHOLDS: () => REC_THRESHOLDS,
    RTN_THRESHOLDS: () => RTN_THRESHOLDS,
    SKILL_DEFS: () => SKILL_DEFS,
    SKILL_DEFS_GK: () => SKILL_DEFS_GK,
    SKILL_DEFS_OUT: () => SKILL_DEFS_OUT,
    SKILL_EFFICIENCY_BRACKETS: () => SKILL_EFFICIENCY_BRACKETS,
    SKILL_KEYS_ALL: () => SKILL_KEYS_ALL,
    SKILL_KEYS_GK: () => SKILL_KEYS_GK,
    SKILL_KEYS_GK_WEIGHT: () => SKILL_KEYS_GK_WEIGHT,
    SKILL_KEYS_OUT: () => SKILL_KEYS_OUT,
    SKILL_LABELS: () => SKILL_LABELS,
    SKILL_LABELS_GK: () => SKILL_LABELS_GK,
    SKILL_LABELS_OUT: () => SKILL_LABELS_OUT,
    SKILL_NAMES_GK: () => SKILL_NAMES_GK,
    SKILL_NAMES_GK_SHORT: () => SKILL_NAMES_GK_SHORT,
    SKILL_NAMES_OUT: () => SKILL_NAMES_OUT,
    TI_THRESHOLDS: () => TI_THRESHOLDS,
    WEIGHT_R5: () => WEIGHT_R5,
    WEIGHT_RB: () => WEIGHT_RB
  });
  var WEIGHT_R5 = [
    [0.41029304, 0.18048062, 0.56730138, 1.06344654, 1.02312672, 0.40831256, 0.58235457, 0.12717479, 0.05454137, 0.0908983, 0.42381693, 0.04626272, 0.02199046, 0],
    [0.42126371, 0.18293193, 0.60567629, 0.91904794, 0.89070915, 0.40038476, 0.56146633, 0.15053902, 0.15955429, 0.15682932, 0.42109742, 0.09460329, 0.03589655, 0],
    [0.23412419, 0.32032289, 0.62194779, 0.63162534, 0.63143081, 0.45218831, 0.47370658, 0.55054737, 0.17744915, 0.39932519, 0.26915814, 0.16413124, 0.07404301, 0],
    [0.27276905, 0.26814289, 0.61104798, 0.39865092, 0.42862643, 0.43582015, 0.46617076, 0.44931076, 0.25175412, 0.46446692, 0.2998635, 0.43843061, 0.21494592, 0],
    [0.2521926, 0.25112993, 0.56090649, 0.18230261, 0.1837649, 0.45928749, 0.53498118, 0.59461481, 0.09851189, 0.6160195, 0.31243959, 0.65402884, 0.29982016, 0],
    [0.28155678, 0.24090675, 0.60680245, 0.19068879, 0.20018012, 0.45148647, 0.48230007, 0.42982389, 0.26268609, 0.57933805, 0.31712419, 0.65824985, 0.29885649, 0],
    [0.22029884, 0.2922969, 0.63248227, 0.09904394, 0.10043602, 0.47469498, 0.52919791, 0.7755588, 0.10531819, 0.71048302, 0.27667115, 0.56813972, 0.21537826, 0],
    [0.21151292, 0.3580471, 0.88688492, 0.14391236, 0.13769621, 0.46586605, 0.34446036, 0.51377701, 0.59723919, 0.75126119, 0.16550722, 0.29966502, 0.12417045, 0],
    [0.3547978, 0.14887553, 0.4327338, 23928e-8, 21111e-8, 0.46931131, 0.57731335, 0.41686333, 0.05607604, 0.62121195, 0.45370457, 1.03660702, 0.43205492, 0],
    [0.45462811, 0.30278232, 0.45462811, 0.90925623, 0.45462811, 0.90925623, 0.45462811, 0.45462811, 0.30278232, 0.15139116, 0.15139116]
  ];
  var WEIGHT_RB = [
    [0.10493615, 0.05208547, 0.07934211, 0.14448971, 0.13159554, 0.06553072, 0.07778375, 0.06669303, 0.05158306, 0.02753168, 0.1205517, 0.01350989, 0.02549169, 0.0388755],
    [0.07715535, 0.04943315, 0.11627229, 0.11638685, 0.12893778, 0.07747251, 0.06370799, 0.03830611, 0.10361093, 0.06253997, 0.09128094, 0.0131411, 0.02449199, 0.03726305],
    [0.08219824, 0.08668831, 0.07434242, 0.09661001, 0.08894242, 0.08998026, 0.09281287, 0.08868309, 0.04753574, 0.06042619, 0.05396986, 0.05059984, 0.05660203, 0.03060871],
    [0.06744248, 0.06641401, 0.09977251, 0.08253749, 0.09709316, 0.09241026, 0.08513703, 0.06127851, 0.1027552, 0.07985941, 0.0461896, 0.0392727, 0.05285911, 0.02697852],
    [0.07304213, 0.08174111, 0.07248656, 0.08482334, 0.07078726, 0.09568392, 0.09464529, 0.09580381, 0.04746231, 0.07093008, 0.04595281, 0.05955544, 0.07161249, 0.03547345],
    [0.06527363, 0.0641027, 0.09701305, 0.07406706, 0.08563595, 0.09648566, 0.08651209, 0.06357183, 0.10819222, 0.07386495, 0.03245554, 0.05430668, 0.06572005, 0.03279859],
    [0.07842736, 0.07744888, 0.0720115, 0.06734457, 0.05002348, 0.08350204, 0.08207655, 0.11181914, 0.03756112, 0.07486004, 0.06533972, 0.07457344, 0.09781475, 0.02719742],
    [0.06545375, 0.06145378, 0.10503536, 0.06421508, 0.07627526, 0.09232981, 0.07763931, 0.07001035, 0.11307331, 0.07298351, 0.04248486, 0.06462713, 0.07038293, 0.02403557],
    [0.07738289, 0.05022488, 0.07790481, 0.01356516, 0.01038191, 0.06495444, 0.07721954, 0.07701905, 0.02680715, 0.07759692, 0.12701687, 0.15378395, 0.12808992, 0.03805251],
    [0.07466384, 0.07466384, 0.07466384, 0.14932769, 0.10452938, 0.14932769, 0.10452938, 0.10344411, 0.0751261, 0.04492581, 0.04479831]
  ];
  var COLOR_LEVELS = [
    { color: "#ff4c4c" },
    { color: "#ff8c00" },
    { color: "#ffd700" },
    { color: "#90ee90" },
    { color: "#00cfcf" },
    { color: "#5b9bff" },
    { color: "#cc88ff" }
  ];
  var R5_THRESHOLDS = [110, 100, 90, 80, 70, 60, 0];
  var TI_THRESHOLDS = [12, 9, 6, 4, 2, 1, -Infinity];
  var REC_THRESHOLDS = [5.5, 5, 4, 3, 2, 1, 0];
  var RTN_THRESHOLDS = [90, 60, 40, 30, 20, 10, 0];
  var POS_MULTIPLIERS = [0.3, 0.3, 0.9, 0.6, 1.5, 0.9, 0.9, 0.6, 0.3];
  var ASI_WEIGHT_OUTFIELD = 26353376e4;
  var ASI_WEIGHT_GK = 48717927500;
  var SKILL_DEFS = [
    // shared (isGK + isOutfield) — must stay at the top; indices 0-2 match both weight matrices
    { name: "Strength", key: "strength", isGK: true, isOutfield: true, category: "Physical", id: 0 },
    { name: "Stamina", key: "stamina", isGK: true, isOutfield: true, category: "Physical", id: 1 },
    { name: "Pace", key: "pace", isGK: true, isOutfield: true, category: "Physical", id: 2 },
    // outfield-only (indices 3-13 after filter)
    { name: "Marking", key: "marking", isOutfield: true, category: "Tactical", id: 3 },
    { name: "Tackling", key: "tackling", isOutfield: true, category: "Tactical", id: 4 },
    { name: "Workrate", key: "workrate", isOutfield: true, category: "Tactical", id: 5 },
    { name: "Positioning", key: "positioning", isOutfield: true, category: "Tactical", id: 6 },
    { name: "Passing", key: "passing", isOutfield: true, category: "Technical", id: 7 },
    { name: "Crossing", key: "crossing", isOutfield: true, category: "Technical", id: 8 },
    { name: "Technique", key: "technique", isOutfield: true, category: "Technical", id: 9 },
    { name: "Heading", key: "heading", isOutfield: true, category: "Physical", id: 10 },
    { name: "Finishing", key: "finishing", isOutfield: true, category: "Technical", id: 11 },
    { name: "Longshots", key: "longshots", isOutfield: true, category: "Technical", id: 12 },
    { name: "Set Pieces", key: "set_pieces", isOutfield: true, category: "Technical", id: 13 },
    // GK-only (indices 3-10 after filter)
    { name: "Handling", key: "handling", isGK: true, category: "Technical", id: 3 },
    { name: "One on ones", key: "oneonones", isGK: true, category: "Tactical", key2: "one_on_ones", id: 4 },
    { name: "Reflexes", key: "reflexes", isGK: true, category: "Technical", id: 5 },
    { name: "Aerial Ability", key: "arialability", isGK: true, category: "Tactical", key2: "aerial_ability", id: 6 },
    { name: "Jumping", key: "jumping", isGK: true, category: "Physical", id: 7 },
    { name: "Communication", key: "communication", isGK: true, category: "Tactical", id: 8 },
    { name: "Kicking", key: "kicking", isGK: true, category: "Technical", id: 9 },
    { name: "Throwing", key: "throwing", isGK: true, category: "Technical", id: 10 }
  ];
  var SKILL_DEFS_OUT = SKILL_DEFS.filter((s) => s.isOutfield);
  var SKILL_DEFS_GK = SKILL_DEFS.filter((s) => s.isGK);
  var SKILL_KEYS_OUT = ["str", "sta", "pac", "mar", "tac", "wor", "pos", "pas", "cro", "tec", "hea", "fin", "lon", "set"];
  var SKILL_KEYS_GK = ["str", "sta", "pac", "han", "one", "ref", "ari", "jum", "com", "kic", "thr"];
  var SKILL_KEYS_ALL = [...SKILL_KEYS_OUT, ...SKILL_KEYS_GK.filter((s) => !SKILL_KEYS_OUT.includes(s))];
  var SKILL_LABELS = {
    str: "Str",
    sta: "Sta",
    pac: "Pac",
    mar: "Mar",
    tac: "Tac",
    wor: "Wor",
    pos: "Pos",
    pas: "Pas",
    cro: "Cro",
    tec: "Tec",
    hea: "Hea",
    fin: "Fin",
    lon: "Lon",
    set: "Set",
    han: "Han",
    one: "One",
    ref: "Ref",
    ari: "Aer",
    jum: "Jum",
    com: "Com",
    kic: "Kic",
    thr: "Thr"
  };
  var SKILL_LABELS_OUT = SKILL_KEYS_OUT.map((k) => SKILL_LABELS[k]);
  var SKILL_LABELS_GK = ["str", "pac", "jum", "sta", "one", "ref", "ari", "com", "kic", "thr", "han"].map((k) => SKILL_LABELS[k]);
  var SKILL_KEYS_GK_WEIGHT = ["str", "pac", "jum", "sta", "one", "ref", "ari", "com", "kic", "thr", "han"];
  var SKILL_NAMES_GK_SHORT = SKILL_KEYS_GK.map((k) => SKILL_LABELS[k]);
  var SKILL_NAMES_OUT = SKILL_DEFS_OUT.map((s) => s.name);
  var SKILL_NAMES_GK = SKILL_DEFS_GK.map((s) => s.name);
  var GRAPH_KEYS_OUT = SKILL_DEFS_OUT.map((s) => s.key);
  var GRAPH_KEYS_GK = ["strength", "pace", "jumping", "stamina", "one_on_ones", "reflexes", "aerial_ability", "communication", "kicking", "throwing", "handling"];
  var SKILL_EFFICIENCY_BRACKETS = [[18, 0.04], [15, 0.05], [5, 0.1], [0, 0.15]];

  // src/constants/player.js
  var player_exports = {};
  __export(player_exports, {
    AGE_THRESHOLDS: () => AGE_THRESHOLDS,
    MIN_WAGE_FOR_TI: () => MIN_WAGE_FOR_TI,
    POSITION_MAP: () => POSITION_MAP,
    POSITION_ORDER: () => POSITION_ORDER,
    WAGE_RATE: () => WAGE_RATE
  });
  var POSITION_MAP = {
    gk: { id: 9, position: "GK", ordering: 0, color: "#4ade80" },
    dc: { id: 0, position: "DC", ordering: 1, color: "#60a5fa" },
    dcl: { id: 0, position: "DCL", ordering: 1, color: "#60a5fa" },
    dcr: { id: 0, position: "DCR", ordering: 1, color: "#60a5fa" },
    dl: { id: 1, position: "DL", ordering: 2, color: "#60a5fa" },
    dr: { id: 1, position: "DR", ordering: 2, color: "#60a5fa" },
    dmc: { id: 2, position: "DMC", ordering: 3, color: "#fbbf24" },
    dmcl: { id: 2, position: "DMCL", ordering: 3, color: "#fbbf24" },
    dmcr: { id: 2, position: "DMCR", ordering: 3, color: "#fbbf24" },
    dml: { id: 3, position: "DML", ordering: 4, color: "#fbbf24" },
    dmr: { id: 3, position: "DMR", ordering: 4, color: "#fbbf24" },
    mc: { id: 4, position: "MC", ordering: 5, color: "#fbbf24" },
    mcl: { id: 4, position: "MCL", ordering: 5, color: "#fbbf24" },
    mcr: { id: 4, position: "MCR", ordering: 5, color: "#fbbf24" },
    ml: { id: 5, position: "ML", ordering: 6, color: "#fbbf24" },
    mr: { id: 5, position: "MR", ordering: 6, color: "#fbbf24" },
    omc: { id: 6, position: "OMC", ordering: 8, color: "#fbbf24" },
    omcl: { id: 6, position: "OMCL", ordering: 8, color: "#fbbf24" },
    omcr: { id: 6, position: "OMCR", ordering: 8, color: "#fbbf24" },
    oml: { id: 7, position: "OML", ordering: 7, color: "#fbbf24" },
    omr: { id: 7, position: "OMR", ordering: 7, color: "#fbbf24" },
    fc: { id: 8, position: "FC", ordering: 9, color: "#f87171" },
    fcl: { id: 8, position: "FCL", ordering: 9, color: "#f87171" },
    fcr: { id: 8, position: "FCR", ordering: 9, color: "#f87171" }
  };
  var POSITION_ORDER = {
    gk: 0,
    dl: 1,
    dcl: 2,
    dc: 3,
    dcr: 4,
    dr: 5,
    dml: 6,
    dmcl: 7,
    dmc: 8,
    dmcr: 9,
    dmr: 10,
    ml: 11,
    mcl: 12,
    mc: 13,
    mcr: 14,
    mr: 15,
    oml: 16,
    omcl: 17,
    omc: 18,
    omcr: 19,
    omr: 20,
    fcl: 21,
    fc: 22,
    fcr: 23
  };
  var AGE_THRESHOLDS = [30, 28, 26, 24, 22, 20, 0];
  var WAGE_RATE = 15.8079;
  var MIN_WAGE_FOR_TI = 3e4;

  // src/constants/match.js
  var match_exports = {};
  __export(match_exports, {
    ACTION_CLS: () => ACTION_CLS,
    ACTION_LABELS: () => ACTION_LABELS,
    ATTACK_STYLES: () => ATTACK_STYLES,
    CROSS_VIDS: () => CROSS_VIDS,
    DEFWIN_VIDS: () => DEFWIN_VIDS,
    FINISH_VIDS: () => FINISH_VIDS,
    FOCUS_MAP: () => FOCUS_MAP,
    MENTALITY_MAP: () => MENTALITY_MAP,
    MENTALITY_MAP_LONG: () => MENTALITY_MAP_LONG,
    PASS_VIDS: () => PASS_VIDS,
    RUN_DUEL_VIDS: () => RUN_DUEL_VIDS,
    SKIP_PREFIXES: () => SKIP_PREFIXES,
    STYLE_MAP: () => STYLE_MAP,
    STYLE_MAP_SHORT: () => STYLE_MAP_SHORT,
    STYLE_ORDER: () => STYLE_ORDER
  });
  var PASS_VIDS = /^(short|preshort|through|longball|gkthrow|gkkick)/;
  var CROSS_VIDS = /^(wing(?!start)|cornerkick|freekick)/;
  var DEFWIN_VIDS = /^defwin/;
  var FINISH_VIDS = /^(finish|finishlong|header|acrobat)/;
  var RUN_DUEL_VIDS = /^finrun/;
  var ATTACK_STYLES = [
    { key: "cou", label: "Direct" },
    { key: "kco", label: "Direct" },
    { key: "klo", label: "Long Balls" },
    { key: "sho", label: "Short Passing" },
    { key: "thr", label: "Through Balls" },
    { key: "lon", label: "Long Balls" },
    { key: "win", label: "Wings" },
    { key: "doe", label: "Corners" },
    { key: "dire", label: "Free Kicks" }
  ];
  var STYLE_ORDER = ["Direct", "Short Passing", "Through Balls", "Long Balls", "Wings", "Corners", "Free Kicks", "Penalties"];
  var SKIP_PREFIXES = /* @__PURE__ */ new Set(["card", "cod", "inj"]);
  var STYLE_MAP = { 1: "Balanced", 2: "Direct", 3: "Wings", 4: "Short Passing", 5: "Long Balls", 6: "Through Balls" };
  var STYLE_MAP_SHORT = { 1: "Balanced", 2: "Direct", 3: "Wings", 4: "Short", 5: "Long", 6: "Through" };
  var MENTALITY_MAP = { 1: "V.Def", 2: "Def", 3: "Sl.Def", 4: "Normal", 5: "Sl.Att", 6: "Att", 7: "V.Att" };
  var MENTALITY_MAP_LONG = { 1: "Very Defensive", 2: "Defensive", 3: "Slightly Defensive", 4: "Normal", 5: "Slightly Attacking", 6: "Attacking", 7: "Very Attacking" };
  var FOCUS_MAP = { 1: "Balanced", 2: "Left", 3: "Central", 4: "Right" };
  var ACTION_LABELS = {
    pass_ok: "pass \u2713",
    pass_fail: "pass \u2717",
    cross_ok: "cross \u2713",
    cross_fail: "cross \u2717",
    shot: "shot",
    save: "save",
    goal: "goal",
    assist: "assist",
    duel_won: "duel \u2713",
    duel_lost: "duel \u2717",
    intercept: "INT",
    tackle: "TKL",
    header_clear: "HC",
    tackle_fail: "TF",
    foul: "foul",
    yellow: "\u{1F7E8}",
    red: "\u{1F7E5}"
  };
  var ACTION_CLS = {
    pass_ok: "shot",
    pass_fail: "lost",
    cross_ok: "shot",
    cross_fail: "lost",
    shot: "shot",
    save: "shot",
    goal: "goal",
    assist: "goal",
    duel_won: "shot",
    duel_lost: "lost",
    intercept: "shot",
    tackle: "shot",
    header_clear: "shot",
    tackle_fail: "lost",
    foul: "lost",
    yellow: "lost",
    red: "lost"
  };

  // src/constants/stats.js
  var stats_exports = {};
  __export(stats_exports, {
    PLAYER_STAT_COLS: () => PLAYER_STAT_COLS,
    PLAYER_STAT_TABLE: () => PLAYER_STAT_TABLE,
    PLAYER_STAT_ZERO: () => PLAYER_STAT_ZERO
  });
  var PLAYER_STAT_COLS = [
    // ── Goals & Shooting ──────────────────────────────────────────────────
    {
      key: "goals",
      abbr: "G",
      title: "Goals",
      icon: "\u26BD",
      section: "shooting",
      outfieldOrder: 1,
      gkOrder: 2,
      matchOrder: 6,
      lineupIcon: true
    },
    {
      key: "assists",
      abbr: "A",
      title: "Assists",
      icon: "\u{1F45F}",
      section: "passing",
      outfieldOrder: 1,
      gkOrder: 1,
      matchOrder: 7,
      lineupIcon: true
    },
    {
      key: "keyPasses",
      abbr: "KP",
      title: "Key Passes",
      icon: "\u{1F511}",
      section: "passing",
      outfieldOrder: 2,
      gkOrder: 2
    },
    {
      key: "shots",
      abbr: "Sh",
      title: "Shots / Saves",
      icon: "\u{1F3AF}",
      section: "shooting",
      outfieldOrder: 2,
      matchOrder: 5,
      gkKey: "saves",
      gkAbbr: "Sv"
    },
    {
      key: "saves",
      title: "Saves",
      icon: "\u{1F9E4}",
      section: "shooting",
      gkOrder: 1
    },
    {
      key: "shotsOnTarget",
      abbr: "SoT",
      title: "Shots on Target",
      icon: "\u2705",
      section: "shooting",
      outfieldOrder: 3
    },
    {
      key: "goalsFoot",
      title: "Foot Goals",
      icon: "\u{1F9B6}",
      section: "shooting",
      outfieldOrder: 4
    },
    {
      key: "goalsHead",
      title: "Head Goals",
      icon: "\u{1F5E3}\uFE0F",
      section: "shooting",
      outfieldOrder: 5
    },
    // ── Passing (computed card entries) ───────────────────────────────────
    {
      key: "__passAcc",
      title: "Pass %",
      icon: "\u{1F4E8}",
      section: "passing",
      outfieldOrder: 3,
      gkOrder: 3
    },
    {
      key: "__crossAcc",
      title: "Cross %",
      icon: "\u2197\uFE0F",
      section: "passing",
      outfieldOrder: 4,
      gkOrder: 4
    },
    {
      key: "__totalPass",
      title: "Total",
      icon: "\u{1F4C8}",
      section: "passing",
      outfieldOrder: 5,
      gkOrder: 5
    },
    // ── Passing (table columns) ───────────────────────────────────────────
    {
      key: "passesCompleted",
      abbr: "SP",
      title: "Successful Passes",
      matchOrder: 1
    },
    {
      key: "passesFailed",
      abbr: "UP",
      title: "Unsuccessful Passes",
      warn: true,
      matchOrder: 2
    },
    {
      key: "crossesCompleted",
      abbr: "SC",
      title: "Successful Crosses",
      matchOrder: 3
    },
    {
      key: "crossesFailed",
      abbr: "UC",
      title: "Unsuccessful Crosses",
      warn: true,
      matchOrder: 4
    },
    // ── Defending & Duels ─────────────────────────────────────────────────
    {
      key: "interceptions",
      abbr: "INT",
      title: "Interceptions",
      icon: "\u{1F441}\uFE0F",
      section: "defending",
      outfieldOrder: 1,
      gkOrder: 1
    },
    {
      key: "tackles",
      abbr: "TKL",
      title: "Tackles",
      icon: "\u{1F9B5}",
      section: "defending",
      outfieldOrder: 2,
      gkOrder: 2
    },
    {
      key: "headerClearances",
      abbr: "HC",
      title: "Header Clearances",
      icon: "\u{1F5E3}\uFE0F",
      section: "defending",
      outfieldOrder: 3,
      gkOrder: 3
    },
    {
      key: "tackleFails",
      abbr: "TF",
      title: "Tackle Fails",
      icon: "\u274C",
      section: "defending",
      outfieldOrder: 4,
      gkOrder: 4,
      warn: true
    },
    {
      key: "duelsWon",
      abbr: "DW",
      title: "Duels Won",
      matchOrder: 8
    },
    {
      key: "duelsLost",
      abbr: "DL",
      title: "Duels Lost",
      warn: true,
      matchOrder: 9
    },
    {
      key: "fouls",
      abbr: "Fls",
      title: "Fouls Committed",
      icon: "\u26A0\uFE0F",
      section: "defending",
      outfieldOrder: 5,
      gkOrder: 5,
      warn: true
    },
    {
      key: "yellowCards",
      abbr: "\u{1F7E8}",
      title: "Yellow Cards",
      yc: true,
      lineupIcon: true
    },
    {
      key: "yellowRedCards",
      abbr: "\u{1F7E8}\u{1F7E5}",
      title: "Yellow-Red Cards",
      lineupIcon: true
    },
    {
      key: "redCards",
      abbr: "\u{1F7E5}",
      title: "Red Cards",
      rc: true,
      lineupIcon: true
    },
    // ── Lineup-only status flags ───────────────────────────────────────────
    {
      key: "injured",
      title: "Injured",
      icon: "\u271A",
      iconStyle: "color:#ff3c3c;font-size:13px;font-weight:800",
      lineupIcon: true,
      lineupBool: true
    },
    {
      key: "subIn",
      title: "Subbed In",
      icon: "\u{1F53C}",
      lineupIcon: true,
      lineupBool: true
    },
    {
      key: "subOut",
      title: "Subbed Out",
      icon: "\u{1F53D}",
      lineupIcon: true,
      lineupBool: true
    }
  ];
  var PLAYER_STAT_TABLE = PLAYER_STAT_COLS.filter((c) => c.matchOrder != null).sort((a, b) => a.matchOrder - b.matchOrder);
  var PLAYER_STAT_ZERO = {
    passesCompleted: 0,
    passesFailed: 0,
    crossesCompleted: 0,
    crossesFailed: 0,
    shots: 0,
    shotsOnTarget: 0,
    shotsOffTarget: 0,
    shotsFoot: 0,
    shotsOnTargetFoot: 0,
    goalsFoot: 0,
    shotsHead: 0,
    shotsOnTargetHead: 0,
    goalsHead: 0,
    saves: 0,
    goals: 0,
    assists: 0,
    keyPasses: 0,
    duelsWon: 0,
    duelsLost: 0,
    interceptions: 0,
    tackles: 0,
    headerClearances: 0,
    tackleFails: 0,
    fouls: 0,
    yellowCards: 0,
    yellowRedCards: 0,
    redCards: 0,
    setpieceTakes: 0,
    freekickGoals: 0,
    penaltiesTaken: 0,
    penaltiesScored: 0,
    subIn: false,
    subOut: false,
    injured: false
  };

  // src/constants/training.js
  var training_exports = {};
  __export(training_exports, {
    ROUTINE_AGE_MIN: () => ROUTINE_AGE_MIN,
    ROUTINE_CAP: () => ROUTINE_CAP,
    ROUTINE_DECAY: () => ROUTINE_DECAY,
    ROUTINE_SCALE: () => ROUTINE_SCALE,
    SHARE_BONUS: () => SHARE_BONUS,
    SMOOTH_WEIGHT: () => SMOOTH_WEIGHT,
    STD_FOCUS: () => STD_FOCUS,
    TRAINING_GROUPS_GK: () => TRAINING_GROUPS_GK,
    TRAINING_GROUPS_OUT: () => TRAINING_GROUPS_OUT,
    TRAINING_LABELS: () => TRAINING_LABELS,
    TRAINING_NAMES: () => TRAINING_NAMES,
    _SEASON_DAYS: () => _SEASON_DAYS,
    _TRAINING1: () => _TRAINING1
  });
  var _TRAINING1 = /* @__PURE__ */ new Date("2023-01-16T23:00:00Z");
  var _SEASON_DAYS = 84;
  var SHARE_BONUS = 0.25;
  var ROUTINE_CAP = 40;
  var ROUTINE_DECAY = 0.1;
  var SMOOTH_WEIGHT = 0.5;
  var STD_FOCUS = { "1": 3, "2": 0, "3": 1, "4": 5, "5": 4, "6": 2 };
  var TRAINING_GROUPS_OUT = [[0, 5, 1], [3, 4], [8, 2], [7, 9, 13], [10, 6], [11, 12]];
  var TRAINING_GROUPS_GK = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]];
  var TRAINING_NAMES = { "1": "Technical", "2": "Fitness", "3": "Tactical", "4": "Finishing", "5": "Defending", "6": "Wings" };
  var TRAINING_LABELS = ["Str/Wor/Sta", "Mar/Tac", "Cro/Pac", "Pas/Tec/Set", "Hea/Pos", "Fin/Lon"];
  var ROUTINE_SCALE = 4.2;
  var ROUTINE_AGE_MIN = 15;

  // src/constants/app.js
  var app_exports = {};
  __export(app_exports, {
    DEFAULT_PAGE_SIZE: () => DEFAULT_PAGE_SIZE,
    GAMEPLAY: () => GAMEPLAY,
    POLL_INTERVAL_MS: () => POLL_INTERVAL_MS
  });
  var POLL_INTERVAL_MS = 6e4;
  var DEFAULT_PAGE_SIZE = 50;
  var GAMEPLAY = {
    HOME_ADVANTAGE: 0.04,
    // ~4% home advantage applied in match prediction
    BLOOM_THRESHOLD: 18
    // skill level at which efficiency drops to lowest bracket
  };

  // src/lib/tm-constants.js
  var TmConst = {
    ...skills_exports,
    ...player_exports,
    ...match_exports,
    ...stats_exports,
    ...training_exports,
    ...app_exports
  };

  // src/components/shared/tm-button.js
  document.head.appendChild(Object.assign(document.createElement("style"), {
    textContent: `
/* \u2500\u2500 Button \u2500\u2500 */
.tmu-btn {
    border: none; cursor: pointer;
    font-family: inherit; font-weight: 700; letter-spacing: 0.3px;
    transition: background 0.15s, opacity 0.15s;
}
.tmu-btn-variant-button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.tmu-btn-variant-icon {
    display: inline-flex; align-items: center; justify-content: center;
    background: none !important; border: none !important; padding: 0 !important; min-width: 0;
}
.tmu-btn-variant-icon:hover:not(:disabled) { background: none !important; }
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
`
  }));
  var TmButton = {
    /**
     * Creates a <button> element.
     *
     * @param {object}       opts
     * @param {string}      [opts.label]   — plain text label (use OR slot, not both)
     * @param {Node|string} [opts.slot]    — DOM node or HTML string for rich content
     * @param {string}      [opts.id]
     * @param {string}      [opts.title]
    * @param {string}      [opts.variant] — 'button' | 'icon' (default: 'button')
    * @param {string}      [opts.color]   — 'primary' | 'secondary' | 'danger' | 'lime' (default: 'lime')
     * @param {string}      [opts.size]    — 'xs' | 'sm' | 'md' (default: 'md')
     * @param {string}      [opts.shape]   — 'md' | 'full' (default: 'md')
     * @param {string}      [opts.cls]     — extra CSS classes
     * @param {boolean}     [opts.block]
     * @param {boolean}     [opts.disabled]
     * @param {string}      [opts.type]    — button type attribute (default: 'button')
     * @param {object}      [opts.attrs]   — extra attributes to set on the button element
     * @param {Function}    [opts.onClick]
     * @returns {HTMLButtonElement}
     */
    button({ label, slot, id, title = "", variant = "button", color = "lime", size = "md", shape = "md", cls = "", block = false, disabled = false, type = "button", attrs = {}, onClick } = {}) {
      const SIZES = { xs: "py-0 px-2 text-xs", sm: "py-1 px-3 text-sm", md: "py-2 px-3 text-sm" };
      const SHAPES = { md: "rounded-md", full: "rounded-full" };
      const COLORS = /* @__PURE__ */ new Set(["primary", "secondary", "danger", "lime"]);
      const resolvedVariant = COLORS.has(variant) ? "button" : variant;
      const resolvedColor = COLORS.has(variant) ? variant : color;
      const btn = document.createElement("button");
      btn.className = `tmu-btn tmu-btn-variant-${resolvedVariant} tmu-btn-${resolvedColor} ${SHAPES[shape] || SHAPES.md} ${SIZES[size] || SIZES.md}${block ? " tmu-btn-block" : ""}${cls ? " " + cls : ""}`;
      if (id) btn.id = id;
      if (title) btn.title = title;
      btn.type = type;
      if (disabled) btn.disabled = true;
      Object.entries(attrs || {}).forEach(([key, value]) => {
        if (value == null || value === false) return;
        if (value === true) {
          btn.setAttribute(key, "");
          return;
        }
        btn.setAttribute(key, String(value));
      });
      if (slot instanceof Node) {
        btn.appendChild(slot);
      } else if (typeof slot === "string") {
        btn.innerHTML = slot;
      } else if (label != null) {
        btn.textContent = label;
      }
      if (onClick) btn.addEventListener("click", onClick);
      return btn;
    }
  };

  // src/components/shared/tm-checkbox.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
.tmu-checkbox-wrap {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: #8aac72;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
}
.tmu-checkbox-wrap:has(.tmu-checkbox:disabled) {
    cursor: not-allowed;
    color: #5a7a48;
}
.tmu-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 13px;
    height: 13px;
    margin: 0;
    position: relative;
    cursor: pointer;
    flex: 0 0 auto;
    border: 1px solid var(--tmu-checkbox-border, rgba(255,255,255,0.25));
    border-radius: 2px;
    background: var(--tmu-checkbox-bg, rgba(255,255,255,0.08));
    transition: background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.tmu-checkbox::after {
    content: '';
    position: absolute;
    left: 3px;
    top: 0px;
    width: 3px;
    height: 7px;
    border: solid rgba(10,18,6,0.92);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    opacity: 0;
}
.tmu-checkbox:checked {
    background: var(--tmu-checkbox-checked-bg, #4a8a30);
    border-color: var(--tmu-checkbox-checked-border, var(--tmu-checkbox-checked-bg, #4a8a30));
}
.tmu-checkbox:checked::after {
    opacity: 1;
}
.tmu-checkbox:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(128,224,72,0.22);
}
.tmu-checkbox:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}
.tmu-checkbox-label {
    cursor: inherit;
}
` }));
  var TmCheckbox = {
    checkbox({
      id,
      name,
      checked = false,
      cls = "",
      disabled = false,
      value,
      attrs = {},
      onChange
    } = {}) {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.className = `tmu-checkbox${cls ? " " + cls : ""}`;
      if (id) input.id = id;
      if (name) input.name = name;
      if (checked) input.checked = true;
      if (disabled) input.disabled = true;
      if (value !== void 0 && value !== null) input.value = String(value);
      Object.entries(attrs).forEach(([key, val]) => {
        if (val === void 0 || val === null) return;
        input.setAttribute(key, String(val));
      });
      if (onChange) input.addEventListener("change", onChange);
      return input;
    },
    checkboxField({
      id,
      name,
      checked = false,
      label = "",
      cls = "",
      inputCls = "",
      labelCls = "",
      disabled = false,
      value,
      attrs = {},
      onChange
    } = {}) {
      const row = document.createElement("label");
      row.className = `tmu-checkbox-wrap${cls ? " " + cls : ""}`;
      const input = TmCheckbox.checkbox({
        id,
        name,
        checked,
        cls: inputCls,
        disabled,
        value,
        attrs,
        onChange
      });
      row.appendChild(input);
      if (label) {
        const text = document.createElement("span");
        text.className = `tmu-checkbox-label${labelCls ? " " + labelCls : ""}`;
        text.textContent = label;
        row.appendChild(text);
      }
      row.inputEl = input;
      return row;
    }
  };

  // src/components/shared/tm-input.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Input / Field \u2500\u2500 */
.tmu-input {
    border-radius: 4px;
    background: rgba(0,0,0,.25);
    border: 1px solid rgba(42,74,28,.6);
    color: #e8f5d8;
    font-weight: 600;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
}
.tmu-input:focus { border-color: #6cc040; }
.tmu-input:disabled { color: #6a7f5c; cursor: not-allowed; }
.tmu-input::placeholder { color: #5a7a48; }
.tmu-input[type="number"] { -moz-appearance: textfield; }
.tmu-input[type="number"]::-webkit-inner-spin-button,
.tmu-input[type="number"]::-webkit-outer-spin-button { opacity: 1; filter: invert(0.6); }
.tmu-input-xs { width: 54px; }
.tmu-input-sm { width: 70px; }
.tmu-input-md { width: 110px; }
.tmu-input-lg { width: 180px; }
.tmu-input-xl { width: 200px; }
.tmu-input-full { width: 100%; }
.tmu-input-grow { flex: 1; min-width: 0; }
.tmu-input-align-left { text-align: left; }
.tmu-input-align-center { text-align: center; }
.tmu-input-align-right { text-align: right; }
.tmu-input-density-compact { min-height: 26px; padding: 4px 8px; }
.tmu-input-density-regular { min-height: 30px; padding: 4px 8px; }
.tmu-input-density-comfy { min-height: 34px; padding: 8px 10px; }
.tmu-input-tone-default { }
.tmu-input-tone-overlay {
    background: rgba(0,0,0,.35);
    border-color: rgba(61,104,40,.4);
    color: #c8e0b4;
}
.tmu-input-tone-overlay:focus { border-color: rgba(108,192,64,.6); }
.tmu-input-tone-overlay:disabled { color: #3a5228; }
.tmu-input-tone-overlay::placeholder { color: #4a6a38; }
.tmu-field { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.tmu-field-label { font-size: 10px; font-weight: 600; color: #90b878; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; }
` }));
  var TmInput = {
    input({
      id,
      name,
      type = "text",
      value = "",
      placeholder = "",
      size = "md",
      tone = "default",
      density = "regular",
      align = "left",
      grow = false,
      cls = "",
      disabled = false,
      autocomplete,
      min,
      max,
      step,
      attrs = {},
      onInput,
      onChange
    } = {}) {
      const input = document.createElement("input");
      input.type = type;
      input.className = `tmu-input tmu-input-${size} tmu-input-tone-${tone} tmu-input-density-${density} tmu-input-align-${align} text-sm${grow ? " tmu-input-grow" : ""}${cls ? " " + cls : ""}`;
      if (id) input.id = id;
      if (name) input.name = name;
      if (value !== void 0 && value !== null) input.value = String(value);
      if (placeholder) input.placeholder = placeholder;
      if (autocomplete !== void 0) input.autocomplete = autocomplete;
      if (min !== void 0) input.min = String(min);
      if (max !== void 0) input.max = String(max);
      if (step !== void 0) input.step = String(step);
      if (disabled) input.disabled = true;
      Object.entries(attrs).forEach(([key, val]) => {
        if (val === void 0 || val === null) return;
        input.setAttribute(key, String(val));
      });
      if (onInput) input.addEventListener("input", onInput);
      if (onChange) input.addEventListener("change", onChange);
      return input;
    },
    field({ label, input, cls = "" } = {}) {
      const row = document.createElement("div");
      row.className = `tmu-field${cls ? " " + cls : ""}`;
      if (label) {
        const lbl = document.createElement("span");
        lbl.className = "tmu-field-label";
        lbl.textContent = label;
        row.appendChild(lbl);
      }
      if (input) row.appendChild(input);
      return row;
    }
  };

  // src/components/shared/tm-autocomplete.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
.tmu-ac {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
}
.tmu-ac-leading {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.tmu-ac-drop {
    display: none;
    position: absolute;
    top: calc(100% + 2px);
    left: 0;
    right: 0;
    background: #0d1a07;
    border: 1px solid rgba(61,104,40,0.5);
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 100;
    scrollbar-width: thin;
    scrollbar-color: #3d6828 transparent;
    box-shadow: 0 6px 20px rgba(0,0,0,0.6);
}
.tmu-ac-drop.tmu-ac-drop-open {
    display: block;
}
.tmu-ac-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    font-size: 11px;
    color: #c8e0b4;
    cursor: pointer;
    border-bottom: 1px solid rgba(61,104,40,0.08);
}
.tmu-ac-item:hover {
    background: rgba(61,104,40,0.22);
    color: #e8f5d8;
}
.tmu-ac-item.tmu-ac-item-active {
    color: #6cc040;
    font-weight: 700;
}
.tmu-ac-item-icon,
.tmu-ac-media {
    width: 20px;
    height: 13px;
    object-fit: cover;
    border-radius: 2px;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
` }));
  var setLeadingContent = (host, content) => {
    host.innerHTML = "";
    if (!content) {
      host.hidden = true;
      return;
    }
    if (typeof content === "string") {
      host.innerHTML = content;
    } else {
      host.appendChild(content);
    }
    host.hidden = false;
  };
  var TmAutocomplete = {
    autocomplete({
      id,
      name,
      value = "",
      placeholder = "",
      size = "full",
      tone = "default",
      density = "regular",
      grow = true,
      cls = "",
      disabled = false,
      autocomplete = "off",
      attrs = {},
      leading = null,
      onInput,
      onChange
    } = {}) {
      const root = document.createElement("div");
      root.className = `tmu-ac${cls ? ` ${cls}` : ""}`;
      const leadingHost = document.createElement("div");
      leadingHost.className = "tmu-ac-leading";
      root.appendChild(leadingHost);
      setLeadingContent(leadingHost, leading);
      const input = TmInput.input({
        id,
        name,
        value,
        placeholder,
        size,
        tone,
        density,
        grow,
        disabled,
        autocomplete,
        attrs: {
          "aria-autocomplete": "list",
          ...attrs
        },
        onInput,
        onChange
      });
      root.appendChild(input);
      const drop = document.createElement("div");
      drop.className = "tmu-ac-drop";
      root.appendChild(drop);
      root.inputEl = input;
      root.dropEl = drop;
      root.leadingEl = leadingHost;
      root.setLeading = (content) => setLeadingContent(leadingHost, content);
      root.hideDrop = () => drop.classList.remove("tmu-ac-drop-open");
      root.showDrop = () => {
        if (!drop.childElementCount) return;
        drop.classList.add("tmu-ac-drop-open");
      };
      root.setItems = (items = []) => {
        drop.innerHTML = "";
        items.forEach((item) => {
          if (!item) return;
          drop.appendChild(item);
        });
        if (drop.childElementCount) root.showDrop();
        else root.hideDrop();
      };
      root.setValue = (nextValue = "") => {
        input.value = String(nextValue);
      };
      root.setDisabled = (nextDisabled) => {
        input.disabled = !!nextDisabled;
      };
      return root;
    },
    autocompleteItem({ label = "", icon = null, active = false, onSelect } = {}) {
      const el2 = document.createElement("div");
      el2.className = `tmu-ac-item${active ? " tmu-ac-item-active" : ""}`;
      if (icon) {
        if (typeof icon === "string") {
          const wrap = document.createElement("span");
          wrap.className = "tmu-ac-item-icon";
          wrap.innerHTML = icon;
          el2.appendChild(wrap);
        } else {
          el2.appendChild(icon);
        }
      }
      el2.appendChild(document.createTextNode(label));
      if (onSelect) {
        el2.addEventListener("mousedown", (event) => {
          event.preventDefault();
          onSelect();
        });
      }
      return el2;
    }
  };

  // src/components/shared/tm-badge.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Badge \u2500\u2500 */
.tmu-badge{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:0;border:1px solid transparent;box-sizing:border-box;line-height:1.2;text-decoration:none}
.tmu-badge-label{color:inherit;opacity:.92}
.tmu-badge-value{color:#fff;font-weight:inherit}
.tmu-badge-icon{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto}
.tmu-badge a{color:#fff;text-decoration:none}
.tmu-badge a:hover{text-decoration:underline}
.tmu-badge-size-xs{min-height:16px;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;letter-spacing:.05em}
.tmu-badge-size-sm{min-height:18px;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.04em}
.tmu-badge-size-md{min-height:22px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.03em}
.tmu-badge-shape-rounded{border-radius:4px}
.tmu-badge-shape-full{border-radius:999px}
.tmu-badge-weight-regular{font-weight:600}
.tmu-badge-weight-bold{font-weight:700}
.tmu-badge-weight-heavy{font-weight:800}
.tmu-badge-uppercase{text-transform:uppercase}
.tmu-badge-tone-muted{background:rgba(200,224,180,.08);border-color:rgba(200,224,180,.12);color:#8aac72}
.tmu-badge-tone-success{background:#1a3a10;border-color:rgba(108,192,64,.3);color:#6cc040}
.tmu-badge-tone-warn{background:#4a2a10;border-color:rgba(240,160,64,.3);color:#f0a040}
.tmu-badge-tone-info{background:#10304a;border-color:rgba(96,176,255,.34);color:#60b0ff}
.tmu-badge-tone-accent{background:#2a1040;border-color:rgba(192,144,255,.34);color:#c090ff}
.tmu-badge-tone-danger{background:#3a1a1a;border-color:rgba(240,64,64,.28);color:#f04040}
.tmu-badge-tone-live{background:#0a2a1a;border-color:#40c080;color:#80ffcc}
.tmu-badge-tone-preview{background:#0a1830;border-color:#2060a0;color:#a0c8ff}
.tmu-badge-tone-highlight{background:#2a1a00;border-color:#a06010;color:#ffe080}
` }));
  var TmBadge = {
    /**
     * Backward compatible usage:
     *   badge('LIVE', 'live')
     * New usage:
     *   badge({ label: 'ASI', value: '12345', tone: 'highlight' })
     * @returns {string} HTML string
     */
    badge(input, tone = "muted") {
      if (typeof input !== "object" || input == null || Array.isArray(input)) {
        return `<span class="tmu-badge tmu-badge-size-sm tmu-badge-shape-rounded tmu-badge-weight-bold tmu-badge-tone-${tone}">${input != null ? input : ""}</span>`;
      }
      const {
        label = "",
        value = "",
        slot = "",
        icon = "",
        size = "sm",
        shape = "rounded",
        weight = "bold",
        uppercase = false,
        cls = "",
        attrs = {}
      } = input;
      const classes = [
        "tmu-badge",
        `tmu-badge-size-${size}`,
        `tmu-badge-shape-${shape}`,
        `tmu-badge-weight-${weight}`,
        `tmu-badge-tone-${tone || "muted"}`
      ];
      if (uppercase) classes.push("tmu-badge-uppercase");
      if (cls) classes.push(cls);
      const attrText2 = Object.entries(attrs).filter(([, valueAttr]) => valueAttr !== void 0 && valueAttr !== null).map(([key, valueAttr]) => ` ${key}="${String(valueAttr).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`).join("");
      const content = slot || [
        icon ? `<span class="tmu-badge-icon">${icon}</span>` : "",
        value !== "" ? `<span class="tmu-badge-label">${label}</span><span class="tmu-badge-value">${value}</span>` : label
      ].join("");
      return `<span class="${classes.join(" ")}"${attrText2}>${content}</span>`;
    }
  };

  // src/components/shared/tm-chip.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Chip \u2500\u2500 */
.tmu-chip{display:inline-flex;align-items:center;justify-content:center;gap:4px;border:1px solid transparent;box-sizing:border-box}
.tmu-chip-label{color:inherit;opacity:.9}
.tmu-chip-value{color:#fff;font-weight:inherit}
.tmu-chip a{color:#fff;text-decoration:none}
.tmu-chip a:hover{text-decoration:underline}
.tmu-chip-size-xs{min-height:16px;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;letter-spacing:.05em;line-height:1.2}
.tmu-chip-size-sm{min-height:18px;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.04em;line-height:1.2}
.tmu-chip-size-md{min-height:22px;padding:0 8px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.04em;line-height:1.2}
.tmu-chip-shape-rounded{border-radius:4px}
.tmu-chip-shape-full{border-radius:999px}
.tmu-chip-weight-regular{font-weight:600}
.tmu-chip-weight-bold{font-weight:700}
.tmu-chip-weight-heavy{font-weight:800}
.tmu-chip-uppercase{text-transform:uppercase}
.tmu-chip-gk,.tmu-chip-tone-success{background:rgba(108,192,64,.15);border-color:rgba(108,192,64,.24);color:#6cc040}
.tmu-chip-d {background:rgba(110,181,255,.12);border-color:rgba(110,181,255,.2);color:#6eb5ff}
.tmu-chip-m {background:rgba(255,215,64,.1);border-color:rgba(255,215,64,.18);color:#ffd740}
.tmu-chip-f {background:rgba(255,112,67,.12);border-color:rgba(255,112,67,.2);color:#ff7043}
.tmu-chip-default,.tmu-chip-tone-muted{background:rgba(200,224,180,.08);border-color:rgba(200,224,180,.12);color:#8aac72}
.tmu-chip-tone-overlay{background:rgba(42,74,28,.34);border-color:rgba(78,130,54,.22);color:#c8e0b4}
.tmu-chip-tone-warn{background:rgba(245,158,11,.15);border-color:rgba(245,158,11,.24);color:#f59e0b}
` }));
  var TmChip = {
    /**
     * Backward compatible usage:
     *   chip('GK', 'gk')
     * New usage:
     *   chip({ label: 'GK', tone: 'warn', size: 'xs', shape: 'rounded' })
     * @returns {string} HTML string
     */
    chip(input, variant = "default") {
      if (typeof input !== "object" || input == null || Array.isArray(input)) {
        return `<span class="tmu-chip tmu-chip-size-sm tmu-chip-shape-rounded tmu-chip-${variant}">${input != null ? input : ""}</span>`;
      }
      const {
        label = "",
        value = "",
        slot = "",
        tone = "muted",
        size = "sm",
        shape = size === "md" ? "full" : "rounded",
        weight = size === "md" ? "heavy" : "bold",
        uppercase = false,
        cls = "",
        attrs = {}
      } = input;
      const classes = [
        "tmu-chip",
        `tmu-chip-size-${size}`,
        `tmu-chip-shape-${shape}`,
        `tmu-chip-weight-${weight}`,
        `tmu-chip-tone-${tone}`
      ];
      if (uppercase) classes.push("tmu-chip-uppercase");
      if (cls) classes.push(cls);
      const attrText2 = Object.entries(attrs).filter(([, value2]) => value2 !== void 0 && value2 !== null).map(([key, value2]) => ` ${key}="${String(value2).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`).join("");
      const content = slot || (value !== "" ? `<span class="tmu-chip-label">${label}</span><span class="tmu-chip-value">${value}</span>` : label);
      return `<span class="${classes.join(" ")}"${attrText2}>${content}</span>`;
    }
  };

  // src/components/shared/tm-compare-stat.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Comparative stat row \u2500\u2500 */
.tmu-cstat{min-width:0}
.tmu-cstat-header{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:5px}
.tmu-cstat-val{font-weight:800;min-width:32px;font-variant-numeric:tabular-nums}
.tmu-cstat-val-left{text-align:left}
.tmu-cstat-val-right{text-align:right}
.tmu-cstat-val-leading{font-weight:900}
.tmu-cstat-label{font-weight:600;color:#8aac72;font-size:11px;text-transform:uppercase;letter-spacing:.08em}
.tmu-cstat-bar{display:flex;overflow:hidden;background:rgba(0,0,0,.18);gap:2px}
.tmu-cstat-seg{transition:width .5s cubic-bezier(.4,0,.2,1);min-width:3px}
.tmu-cstat-size-sm{padding:8px 0}
.tmu-cstat-size-sm .tmu-cstat-val{font-size:14px;min-width:30px}
.tmu-cstat-size-sm .tmu-cstat-val-leading{font-size:16px}
.tmu-cstat-size-sm .tmu-cstat-bar{height:6px;border-radius:3px}
.tmu-cstat-size-sm .tmu-cstat-seg{border-radius:3px}
.tmu-cstat-size-md{padding:10px 16px}
.tmu-cstat-size-md .tmu-cstat-val{font-size:15px}
.tmu-cstat-size-md .tmu-cstat-val-leading{font-size:17px}
.tmu-cstat-size-md .tmu-cstat-bar{height:7px;border-radius:4px}
.tmu-cstat-size-md .tmu-cstat-seg{border-radius:3px}
.tmu-cstat-highlight{background:rgba(60,120,40,.06)}
.tmu-cstat-tone-home,.tmu-cstat-tone-for{color:#80e048}
.tmu-cstat-tone-away,.tmu-cstat-tone-against{color:#5ba8f0}
.tmu-cstat-seg.tmu-cstat-tone-home,.tmu-cstat-seg.tmu-cstat-tone-for{background:linear-gradient(90deg,#4a9030,#6cc048)}
.tmu-cstat-seg.tmu-cstat-tone-away,.tmu-cstat-seg.tmu-cstat-tone-against{background:linear-gradient(90deg,#3a7ab8,#5b9bff)}
` }));
  var parseComparable = (value) => {
    const numeric = Number.parseFloat(String(value != null ? value : "").replace(/[^\d.+-]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  };
  var TmCompareStat = {
    compareStat({
      label = "",
      leftValue = "",
      rightValue = "",
      leftNumber,
      rightNumber,
      leftTone = "home",
      rightTone = "away",
      size = "md",
      highlight = false,
      cls = "",
      attrs = {}
    } = {}) {
      const leftNumeric = leftNumber != null ? leftNumber : parseComparable(leftValue);
      const rightNumeric = rightNumber != null ? rightNumber : parseComparable(rightValue);
      const total = leftNumeric + rightNumeric;
      const leftPct = total === 0 ? 50 : Math.round(leftNumeric / total * 100);
      const rightPct = 100 - leftPct;
      const classes = ["tmu-cstat", `tmu-cstat-size-${size}`];
      if (highlight) classes.push("tmu-cstat-highlight");
      if (cls) classes.push(cls);
      const attrText2 = Object.entries(attrs).filter(([, valueAttr]) => valueAttr !== void 0 && valueAttr !== null).map(([key, valueAttr]) => ` ${key}="${String(valueAttr).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`).join("");
      const leftLead = leftNumeric > rightNumeric ? " tmu-cstat-val-leading" : "";
      const rightLead = rightNumeric > leftNumeric ? " tmu-cstat-val-leading" : "";
      return `<div class="${classes.join(" ")}"${attrText2}><div class="tmu-cstat-header"><span class="tmu-cstat-val tmu-cstat-val-left tmu-cstat-tone-${leftTone}${leftLead}">${leftValue}</span><span class="tmu-cstat-label">${label}</span><span class="tmu-cstat-val tmu-cstat-val-right tmu-cstat-tone-${rightTone}${rightLead}">${rightValue}</span></div><div class="tmu-cstat-bar"><div class="tmu-cstat-seg tmu-cstat-tone-${leftTone}" style="width:${leftPct}%"></div><div class="tmu-cstat-seg tmu-cstat-tone-${rightTone}" style="width:${rightPct}%"></div></div></div>`;
    }
  };

  // src/components/shared/tm-metric.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Metric \u2500\u2500 */
.tmu-metric{min-width:0}
.tmu-metric-copy{min-width:0}
.tmu-metric-label{color:#7fa669;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
.tmu-metric-value{margin-top:4px;color:#eef8e8;font-weight:800;line-height:1.25;word-break:break-word;font-variant-numeric:tabular-nums}
.tmu-metric-note{margin-top:4px;color:#8aac72;font-size:11px;line-height:1.45}
.tmu-metric-value a,.tmu-metric-note a{color:inherit;text-decoration:none}
.tmu-metric-value a:hover,.tmu-metric-note a:hover{text-decoration:underline}
.tmu-metric-size-sm .tmu-metric-value{font-size:14px}
.tmu-metric-size-md .tmu-metric-value{font-size:16px}
.tmu-metric-size-lg .tmu-metric-value{font-size:18px;font-weight:900}
.tmu-metric-size-xl .tmu-metric-value{font-size:28px;font-weight:900;line-height:1}
.tmu-metric-align-left{text-align:left}
.tmu-metric-align-center{text-align:center}
.tmu-metric-align-right{text-align:right}
.tmu-metric-layout-card{padding:12px 14px;border-radius:10px;background:rgba(12,24,9,.35);border:1px solid rgba(61,104,40,.18)}
.tmu-metric-layout-split{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:5px 10px;border-radius:4px;background:rgba(42,74,28,.25);border:1px solid rgba(42,74,28,.4)}
.tmu-metric-layout-split .tmu-metric-copy{flex:1 1 auto;min-width:0}
.tmu-metric-layout-split .tmu-metric-value{margin-top:0;text-align:right;font-size:12px}
.tmu-metric-layout-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.tmu-metric-layout-row .tmu-metric-copy{flex:1 1 auto}
.tmu-metric-layout-row .tmu-metric-label{font-size:11px;letter-spacing:.04em;text-transform:none;color:#8aac72}
.tmu-metric-layout-row .tmu-metric-value{margin-top:0;text-align:right}
.tmu-metric-layout-row.tmu-metric-size-sm .tmu-metric-value{font-size:14px}
.tmu-metric-layout-row.tmu-metric-size-md .tmu-metric-value{font-size:16px}
.tmu-metric-layout-row.tmu-metric-size-lg .tmu-metric-value{font-size:18px}
.tmu-metric-label-bottom .tmu-metric-label{margin-top:3px}
.tmu-metric-label-bottom .tmu-metric-value{margin-top:0}
.tmu-metric-size-xl.tmu-metric-label-bottom .tmu-metric-label{font-size:9px;letter-spacing:.05em}
.tmu-metric-tone-muted{background:rgba(12,24,9,.28);border-color:rgba(61,104,40,.14)}
.tmu-metric-tone-overlay{background:rgba(18,33,12,.34);border-color:rgba(61,104,40,.16)}
.tmu-metric-tone-panel{background:linear-gradient(180deg, rgba(0,0,0,.16), rgba(42,74,28,.24));border-color:rgba(74,144,48,.2);box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
.tmu-metric-tone-success{background:rgba(21,48,16,.34);border-color:rgba(108,192,64,.18)}
.tmu-metric-tone-warn{background:rgba(48,34,10,.32);border-color:rgba(245,158,11,.2)}
.tmu-metric-tone-danger{background:rgba(52,18,18,.32);border-color:rgba(239,68,68,.18)}
` }));
  var TmMetric = {
    /**
     * metric({ label, value, note, layout, tone, size, align, labelPosition })
     * @returns {string} HTML string
     */
    metric({
      label = "",
      value = "",
      note = "",
      layout = "card",
      tone = "overlay",
      size = "md",
      align = "left",
      labelPosition = "top",
      cls = "",
      attrs = {},
      valueCls = "",
      valueAttrs = {},
      noteCls = ""
    } = {}) {
      const classes = [
        "tmu-metric",
        `tmu-metric-layout-${layout}`,
        `tmu-metric-tone-${tone}`,
        `tmu-metric-size-${size}`,
        `tmu-metric-align-${align}`,
        `tmu-metric-label-${labelPosition}`
      ];
      if (cls) classes.push(cls);
      const attrText2 = Object.entries(attrs).filter(([, valueAttr]) => valueAttr !== void 0 && valueAttr !== null).map(([key, valueAttr]) => ` ${key}="${String(valueAttr).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`).join("");
      const valueAttrText = Object.entries(valueAttrs).filter(([, valueAttr]) => valueAttr !== void 0 && valueAttr !== null).map(([key, valueAttr]) => ` ${key}="${String(valueAttr).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`).join("");
      if (layout === "row" || layout === "split") {
        return `<div class="${classes.join(" ")}"${attrText2}><div class="tmu-metric-copy"><div class="tmu-metric-label">${label}</div>${note ? `<div class="tmu-metric-note ${noteCls}">${note}</div>` : ""}</div><div class="tmu-metric-value ${valueCls}"${valueAttrText}>${value}</div></div>`;
      }
      const labelHtml = `<div class="tmu-metric-label">${label}</div>`;
      const valueHtml = `<div class="tmu-metric-value ${valueCls}"${valueAttrText}>${value}</div>`;
      const mainHtml = labelPosition === "bottom" ? `${valueHtml}${labelHtml}` : `${labelHtml}${valueHtml}`;
      return `<div class="${classes.join(" ")}"${attrText2}>${mainHtml}${note ? `<div class="tmu-metric-note ${noteCls}">${note}</div>` : ""}</div>`;
    }
  };

  // src/components/shared/tm-stat.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Stat row \u2500\u2500 */
.tmu-stat-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 11px; color: #c8e0b4; }
.tmu-stat-row + .tmu-stat-row { border-top: 1px solid rgba(61,104,40,.15); }
.tmu-stat-lbl { color: #6a9a58; font-weight: 600; font-size: 10px; text-transform: uppercase; }
.tmu-stat-val { font-weight: 700; font-variant-numeric: tabular-nums; }
` }));
  var TmStat = {
    /**
     * Returns an HTML string for a label/value stat row.
     * @param {string} label
     * @param {string} [html]    — value HTML (default: '')
     * @param {string} [variant] — extra CSS class on .tmu-stat-val
     * @returns {string}
     */
    stat: (label, html = "", variant = "") => `<div class="tmu-stat-row"><span class="tmu-stat-lbl">${label}</span><span class="tmu-stat-val${variant ? " " + variant : ""}">${html}</span></div>`
  };

  // src/components/shared/tm-tooltip-stats.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Tooltip stat triplets \u2500\u2500 */
.tmu-tstats{display:grid;grid-template-columns:1fr auto 1fr;gap:4px 12px;margin:10px 0;font-size:14px}
.tmu-tstats-home{text-align:right;font-weight:700;color:#b8d8a0}
.tmu-tstats-label{text-align:center;font-size:10px;color:#5a7a48;text-transform:uppercase;letter-spacing:.08em;font-weight:600;padding:0 6px}
.tmu-tstats-away{text-align:left;font-weight:700;color:#b8d8a0}
.tmu-tstats-home.is-leading,.tmu-tstats-away.is-leading{color:#6adc3a}
` }));
  var escapeHtml = (value) => String(value != null ? value : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  var attrText = (attrs = {}) => Object.entries(attrs).filter(([, value]) => value !== void 0 && value !== null).map(([key, value]) => ` ${key}="${escapeHtml(value)}"`).join("");
  var parseComparable2 = (value) => {
    const numeric = Number.parseFloat(String(value != null ? value : "").replace(/[^\d.+-]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  };
  var buildMatchRows = ({ possession, statistics = {} } = {}) => {
    const rows = [];
    if (possession) {
      const homePossession = Number(possession.home || 0);
      const awayPossession = Number(possession.away || 0);
      rows.push({
        label: "Possession",
        leftValue: `${homePossession}%`,
        rightValue: `${awayPossession}%`,
        leftNumber: homePossession,
        rightNumber: awayPossession
      });
    }
    const shotsHome = Number(statistics.home_shots || 0);
    const shotsAway = Number(statistics.away_shots || 0);
    if (shotsHome || shotsAway) {
      rows.push({
        label: "Shots",
        leftValue: shotsHome,
        rightValue: shotsAway,
        leftNumber: shotsHome,
        rightNumber: shotsAway
      });
    }
    const onTargetHome = Number(statistics.home_on_target || 0);
    const onTargetAway = Number(statistics.away_on_target || 0);
    if (onTargetHome || onTargetAway) {
      rows.push({
        label: "On Target",
        leftValue: onTargetHome,
        rightValue: onTargetAway,
        leftNumber: onTargetHome,
        rightNumber: onTargetAway
      });
    }
    return rows;
  };
  var TmTooltipStats = {
    tooltipStats({ rows = [], cls = "", attrs = {} } = {}) {
      const visibleRows = rows.filter((row) => row && row.label !== void 0 && row.label !== null);
      if (!visibleRows.length) return "";
      const classes = ["tmu-tstats"];
      if (cls) classes.push(cls);
      const html = visibleRows.map((row) => {
        var _a, _b, _c, _d;
        const leftValue = (_a = row.leftValue) != null ? _a : "";
        const rightValue = (_b = row.rightValue) != null ? _b : "";
        const leftNumber = (_c = row.leftNumber) != null ? _c : parseComparable2(leftValue);
        const rightNumber = (_d = row.rightNumber) != null ? _d : parseComparable2(rightValue);
        const leftLead = leftNumber > rightNumber ? " is-leading" : "";
        const rightLead = rightNumber > leftNumber ? " is-leading" : "";
        return `<span class="tmu-tstats-home${leftLead}">${escapeHtml(leftValue)}</span><span class="tmu-tstats-label">${escapeHtml(row.label)}</span><span class="tmu-tstats-away${rightLead}">${escapeHtml(rightValue)}</span>`;
      }).join("");
      return `<div class="${classes.join(" ")}"${attrText(attrs)}>${html}</div>`;
    },
    matchTooltipStats({ possession, statistics = {}, cls = "", attrs = {} } = {}) {
      const rows = buildMatchRows({ possession, statistics });
      return this.tooltipStats({ rows, cls, attrs });
    }
  };

  // src/components/shared/tm-render.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Card \u2500\u2500 */
.tmu-card { background: #1c3410; border: 1px solid #28451d; border-radius: 8px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-bottom: 8px; box-shadow: 0 0 9px #192a19; }
.tmu-card-head { font-size: 10px; font-weight: 700; color: #6a9a58; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px 6px; display: flex; align-items: center; justify-content: space-between; gap: 6px; border-bottom: 1px solid #3d6828; }
.tmu-card-head-btn { background: none; border: none; color: #6a9a58; cursor: pointer; font-size: 13px; padding: 0 2px; line-height: 1; transition: color .15s; }
.tmu-card-head-btn:hover { color: #80e048; }
.tmu-card-body { padding: 12px 12px; display: flex; flex-direction: column; gap: 8px; }
.tmu-card-body-flush { padding: 4px; gap: 2px; }
/* \u2500\u2500 Divider \u2500\u2500 */
.tmu-divider { height: 1px; background: #3d6828; margin: 0; }
.tmu-divider-label { display: flex; align-items: center; gap: 8px; color: #6a9a58; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0 2px; margin-top: 2px; }
.tmu-divider-label::after { content: ''; flex: 1; height: 1px; background: rgba(42,74,28,.5); }
/* \u2500\u2500 List item \u2500\u2500 */
.tmu-list-item { display: flex; align-items: center; gap: 8px; padding: 10px 14px; color: #90b878; font-size: 12px; font-weight: 600; text-decoration: none; transition: all 0.15s; }
.tmu-list-icon { font-size: 14px; width: 20px; text-align: center; flex-shrink: 0; }
.tmu-list-lbl  { flex: 1; }
button.tmu-list-item { background: transparent; border: none; cursor: pointer; font-family: inherit; text-align: left; width: 100%; border-radius: 5px; }
` }));
  var TmRender = {
    /**
     * Sets innerHTML on el, hydrates custom <tm-*> tags, collects [data-ref] elements.
     * Returns a refs object mapping action names and data-ref values to their DOM nodes.
     *
     * @param {Element} el       — target element (innerHTML replaced)
     * @param {string}  html     — template string
     * @param {object}  handlers — { actionName: Function } matched to data-action
     * @returns {object}         — { [action|ref]: Element }
     */
    render(el2, html, handlers = {}) {
      if (html !== void 0) el2.innerHTML = html;
      const refs = {};
      el2.querySelectorAll("tm-card").forEach((tmCard) => {
        const card = document.createElement("div");
        card.className = "tmu-card";
        if (tmCard.dataset.ref) card.dataset.ref = tmCard.dataset.ref;
        if (tmCard.dataset.title) {
          const head = document.createElement("div");
          head.className = "tmu-card-head";
          const titleSpan = document.createElement("span");
          titleSpan.textContent = tmCard.dataset.icon ? tmCard.dataset.icon + " " + tmCard.dataset.title : tmCard.dataset.title;
          head.appendChild(titleSpan);
          if (tmCard.dataset.headAction) {
            const action = tmCard.dataset.headAction;
            const hBtn = document.createElement("button");
            hBtn.type = "button";
            hBtn.className = "tmu-card-head-btn";
            hBtn.textContent = tmCard.dataset.headIcon || "\u21BB";
            if (handlers[action]) hBtn.addEventListener("click", handlers[action]);
            head.appendChild(hBtn);
            refs[action] = hBtn;
          }
          if (tmCard.dataset.headRef) refs[tmCard.dataset.headRef] = head;
          card.appendChild(head);
        }
        const body = document.createElement("div");
        body.className = "tmu-card-body" + (tmCard.dataset.flush !== void 0 ? " tmu-card-body-flush" : "");
        while (tmCard.firstChild) body.appendChild(tmCard.firstChild);
        card.appendChild(body);
        tmCard.replaceWith(card);
      });
      el2.querySelectorAll("tm-divider").forEach((tmDivider) => {
        const label = tmDivider.dataset.label;
        const div = document.createElement("div");
        div.className = label ? "tmu-divider-label" : "tmu-divider";
        if (label) div.textContent = label;
        tmDivider.replaceWith(div);
      });
      el2.querySelectorAll("tm-button").forEach((tmBtn) => {
        const action = tmBtn.dataset.action;
        const inner = tmBtn.innerHTML.trim();
        const btn = TmButton.button({
          label: inner ? void 0 : tmBtn.dataset.label,
          slot: inner || void 0,
          id: tmBtn.dataset.id,
          variant: tmBtn.dataset.variant,
          color: tmBtn.dataset.color || tmBtn.dataset.variant,
          size: tmBtn.dataset.size,
          cls: tmBtn.dataset.cls,
          block: tmBtn.hasAttribute("data-block"),
          onClick: action ? handlers[action] : void 0
        });
        if (tmBtn.getAttribute("title")) btn.title = tmBtn.getAttribute("title");
        if (tmBtn.getAttribute("style")) btn.setAttribute("style", tmBtn.getAttribute("style"));
        const skipAttrs = /* @__PURE__ */ new Set(["data-label", "data-variant", "data-color", "data-action", "data-id", "data-block", "data-size", "data-cls"]);
        for (const attr of tmBtn.attributes) {
          if (attr.name.startsWith("data-") && !skipAttrs.has(attr.name)) btn.setAttribute(attr.name, attr.value);
        }
        tmBtn.replaceWith(btn);
        if (action) refs[action] = btn;
      });
      el2.querySelectorAll("tm-input").forEach((tmInput) => {
        const input = TmInput.input({
          size: tmInput.dataset.size || "sm",
          type: tmInput.dataset.type || "text",
          value: tmInput.dataset.value || "",
          placeholder: tmInput.dataset.placeholder || "",
          min: tmInput.dataset.min,
          max: tmInput.dataset.max,
          step: tmInput.dataset.step
        });
        if (tmInput.dataset.ref) input.dataset.ref = tmInput.dataset.ref;
        if (tmInput.dataset.label) {
          const row = TmInput.field({ label: tmInput.dataset.label, input });
          tmInput.replaceWith(row);
        } else {
          tmInput.replaceWith(input);
        }
      });
      el2.querySelectorAll("tm-stat").forEach((tmStat) => {
        const row = document.createElement("div");
        const cls = tmStat.dataset.cls || "";
        row.className = "tmu-stat-row" + (cls ? " " + cls : "");
        const lbl = document.createElement("span");
        const lblCls = tmStat.dataset.lblCls || "";
        lbl.className = "tmu-stat-lbl" + (lblCls ? " " + lblCls : "");
        lbl.textContent = tmStat.dataset.label || "";
        row.appendChild(lbl);
        const val = document.createElement("span");
        const variant = tmStat.dataset.variant || tmStat.className;
        const valCls = tmStat.dataset.valCls || "";
        val.className = "tmu-stat-val" + (variant ? " " + variant : "") + (valCls ? " " + valCls : "");
        if (tmStat.innerHTML.trim()) val.innerHTML = tmStat.innerHTML;
        else val.textContent = tmStat.dataset.value || "";
        if (tmStat.dataset.ref) val.dataset.ref = tmStat.dataset.ref;
        row.appendChild(val);
        tmStat.replaceWith(row);
      });
      el2.querySelectorAll("tm-list-item").forEach((tmItem) => {
        const action = tmItem.dataset.action;
        const node = action ? document.createElement("button") : document.createElement("a");
        node.className = "tmu-list-item";
        if (tmItem.dataset.variant) node.classList.add(tmItem.dataset.variant);
        if (action) {
          node.type = "button";
          if (handlers[action]) node.addEventListener("click", handlers[action]);
          refs[action] = node;
        } else {
          node.href = tmItem.dataset.href || "#";
        }
        if (tmItem.dataset.icon) {
          const icon = document.createElement("span");
          icon.className = "tmu-list-icon";
          icon.textContent = tmItem.dataset.icon;
          node.appendChild(icon);
        }
        if (tmItem.dataset.label) {
          const lbl = document.createElement("span");
          lbl.className = "tmu-list-lbl";
          lbl.textContent = tmItem.dataset.label;
          node.appendChild(lbl);
        }
        if (tmItem.dataset.ref) node.dataset.ref = tmItem.dataset.ref;
        tmItem.replaceWith(node);
      });
      el2.querySelectorAll("[data-ref]").forEach((node) => {
        refs[node.dataset.ref] = node;
      });
      el2.querySelectorAll("tm-row").forEach((tmRow) => {
        const div = document.createElement("div");
        const cls = tmRow.dataset.cls || "";
        div.className = "tmu-row" + (cls ? " " + cls : "");
        if (tmRow.dataset.justify) div.style.justifyContent = tmRow.dataset.justify;
        if (tmRow.dataset.align) div.style.alignItems = tmRow.dataset.align;
        if (tmRow.dataset.gap) div.style.gap = tmRow.dataset.gap;
        while (tmRow.firstChild) div.appendChild(tmRow.firstChild);
        tmRow.replaceWith(div);
      });
      el2.querySelectorAll("tm-col").forEach((tmCol) => {
        const div = document.createElement("div");
        const size = tmCol.dataset.size;
        const cls = tmCol.dataset.cls || "";
        div.className = "tmu-col" + (size ? " tmu-col-" + size : "") + (cls ? " " + cls : "");
        while (tmCol.firstChild) div.appendChild(tmCol.firstChild);
        tmCol.replaceWith(div);
      });
      el2.querySelectorAll("tm-spinner").forEach((tmSpinner) => {
        const span = document.createElement("span");
        const size = tmSpinner.dataset.size || "sm";
        const cls = tmSpinner.dataset.cls || "";
        span.className = `tmu-spinner tmu-spinner-${size}${cls ? " " + cls : ""}`;
        tmSpinner.replaceWith(span);
      });
      return refs;
    }
  };

  // src/components/shared/tm-skill.js
  var TmSkill = {
    /**
     * Returns a sort-direction indicator for table headers.
     * @param {string}  key     — column key being rendered
     * @param {string}  sortKey — currently active sort column
     * @param {boolean} asc     — true = ascending
     * @returns {string}        — ' ▲', ' ▼', or ''
     */
    sortArrow: (key, sortKey, asc) => key === sortKey ? asc ? " \u25B2" : " \u25BC" : "",
    /**
     * Returns an HTML string for a colored skill value with optional decimal superscript.
     *   — null/undefined → muted dash
     *   — floor ≥ 20    → gold ★
     *   — floor ≥ 19    → silver ★ + decimal superscript
     *   — otherwise     → colored integer + decimal superscript
     *
     * @param {number|null} val
     * @returns {string} HTML string
     */
    skillBadge(val) {
      if (val == null) return '<span style="color:#4a5a40">\u2014</span>';
      const floor = Math.floor(val);
      const frac = val - floor;
      const fracStr = frac > 5e-3 ? `<sup style="font-size:8px;opacity:.75">.${Math.round(frac * 100).toString().padStart(2, "0")}</sup>` : "";
      if (floor >= 20) return '<span style="color:#d4af37;font-size:13px">\u2605</span>';
      if (floor >= 19) return `<span style="color:#c0c0c0;font-size:13px">\u2605${fracStr}</span>`;
      return `<span style="color:${TmUtils.skillColor(floor)}">${floor}${fracStr}</span>`;
    }
  };

  // src/components/shared/tm-tooltip.js
  var TmTooltip = {
    /**
     * Positions a body-appended tooltip near an anchor element,
     * clamping to right and bottom viewport edges.
     *
     * @param {HTMLElement} el     — tooltip element (already in DOM)
     * @param {Element}     anchor — element to anchor against
     */
    positionTooltip(el2, anchor) {
      const rect = anchor.getBoundingClientRect();
      el2.style.top = rect.bottom + window.scrollY + 4 + "px";
      el2.style.left = rect.left + window.scrollX + "px";
      requestAnimationFrame(() => {
        const tipRect = el2.getBoundingClientRect();
        if (tipRect.right > window.innerWidth - 10)
          el2.style.left = window.innerWidth - tipRect.width - 10 + "px";
        if (tipRect.bottom > window.innerHeight + window.scrollY - 10)
          el2.style.top = rect.top + window.scrollY - tipRect.height - 4 + "px";
      });
    },
    /**
     * Builds the standard position chip HTML (used across squad, transfer, shortlist tables).
     *
     * @param {string} primaryColor — hex color of the primary position
     * @param {string} innerHTML    — pre-built inner HTML
     * @param {string} [cls]        — CSS class (default: 'tm-pos-chip')
     * @returns {string} HTML string
     */
    positionChip: (primaryColor, innerHTML, cls = "tm-pos-chip") => `<span class="${cls}" style="background:${primaryColor}22;border:1px solid ${primaryColor}44">${innerHTML}</span>`,
    /**
     * Renders a country flag `<ib>` element, or empty string if no country.
     * @param {string} country — country code (e.g. 'gb', 'de')
     * @param {string} [cls]   — extra CSS class to append
     * @returns {string} HTML string
     */
    flag: (country, cls = "") => country ? `<ib class="flag-img-${country}${cls ? " " + cls : ""}"></ib>` : ""
  };

  // src/components/shared/tm-table.js
  document.head.appendChild(Object.assign(document.createElement("style"), {
    textContent: `
/* \u2500\u2500 Table \u2500\u2500 */
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
.tmu-tbl .tmu-grp-row th{background:rgba(42,74,28,.35);color:#6a9a58;font-size:9px;text-align:center;letter-spacing:.2px;border-bottom:1px solid #2a4a1c;padding:2px 4px;white-space:nowrap;font-weight:600;text-transform:none;border-right:1px solid #2a4a1c}
`
  }));
  var _tblCounter = 0;
  var TmTable = {
    table({ headers = [], items = [], groupHeaders = [], footer = [], sortKey = null, sortDir = -1, cls = "", prependIndex = false, rowCls = null, onRowClick = null } = {}) {
      const wrap = document.createElement("div");
      const id = "tmu-tbl-" + ++_tblCounter;
      const indexCfg = prependIndex ? {
        label: "#",
        align: "c",
        cls: "",
        thCls: "",
        width: "32px",
        render: null,
        ...typeof prependIndex === "object" ? prependIndex : {}
      } : null;
      let _items = items;
      let _footer = footer;
      let _sk = sortKey != null ? sortKey : (headers.find((h) => h.sortable !== false) || {}).key || null;
      let _sd = sortDir;
      function _render() {
        const sortHdr = _sk ? headers.find((h2) => h2.key === _sk) : null;
        const sorted = _items.slice().sort((a, b) => {
          if (!sortHdr) return 0;
          if (sortHdr.sort) return _sd * sortHdr.sort(a, b);
          const va = a[_sk], vb = b[_sk];
          if (typeof va === "number" && typeof vb === "number") return _sd * (va - vb);
          return _sd * String(va != null ? va : "").localeCompare(String(vb != null ? vb : ""));
        });
        const arrow = _sd > 0 ? " \u25B2" : " \u25BC";
        let h = `<table class="tmu-tbl${cls ? " " + cls : ""}" id="${id}"><thead>`;
        groupHeaders.forEach((row) => {
          const rc = row.cls || "";
          h += `<tr${rc ? ` class="${rc}"` : ""}>`;
          (row.cells || []).forEach((cell) => {
            var _a;
            const cc = cell.cls || "";
            h += `<th${cc ? ` class="${cc}"` : ""}${cell.colspan ? ` colspan="${cell.colspan}"` : ""}${cell.rowspan ? ` rowspan="${cell.rowspan}"` : ""}>${(_a = cell.label) != null ? _a : ""}</th>`;
          });
          h += "</tr>";
        });
        h += "<tr>";
        if (indexCfg) {
          const align = indexCfg.align && indexCfg.align !== "l" ? " " + indexCfg.align : "";
          const thCls = [align, indexCfg.thCls || ""].filter(Boolean).join(" ");
          h += `<th${thCls ? ` class="${thCls}"` : ""}${indexCfg.width ? ` style="width:${indexCfg.width}"` : ""}>${indexCfg.label}</th>`;
        }
        headers.forEach((hdr) => {
          const align = hdr.align && hdr.align !== "l" ? " " + hdr.align : "";
          const canSort = hdr.sortable !== false;
          const isActive = canSort && _sk === hdr.key;
          const thCls = [canSort ? "sortable" : "", isActive ? "sort-active" : "", align, hdr.thCls || ""].filter(Boolean).join(" ");
          h += `<th${thCls ? ` class="${thCls}"` : ""}${canSort ? ` data-sk="${hdr.key}"` : ""}${hdr.width ? ` style="width:${hdr.width}"` : ""}${hdr.title ? ` title="${hdr.title}"` : ""}>`;
          h += hdr.label + (isActive ? arrow : "") + "</th>";
        });
        h += "</tr></thead><tbody>";
        sorted.forEach((item, i) => {
          const rc = rowCls ? rowCls(item, i) : "";
          h += `<tr${rc ? ` class="${rc}"` : ""}${onRowClick ? ` data-ri="${i}"` : ""}>`;
          if (indexCfg) {
            const align = indexCfg.align && indexCfg.align !== "l" ? " " + indexCfg.align : "";
            const tdCls = [align, indexCfg.cls || ""].filter(Boolean).join(" ");
            const content = typeof indexCfg.render === "function" ? indexCfg.render(item, i) : i + 1;
            h += `<td${tdCls ? ` class="${tdCls}"` : ""}>${content}</td>`;
          }
          headers.forEach((hdr) => {
            const val = item[hdr.key];
            const align = hdr.align && hdr.align !== "l" ? " " + hdr.align : "";
            const tdCls = [align, hdr.cls || ""].filter(Boolean).join(" ");
            const content = hdr.render ? hdr.render(val, item, i) : val == null ? "" : val;
            h += `<td${tdCls ? ` class="${tdCls}"` : ""}>${content}</td>`;
          });
          h += "</tr>";
        });
        h += "</tbody>";
        if (_footer.length) {
          h += "<tfoot>";
          _footer.forEach((fRow) => {
            const rc = fRow.cls || "";
            h += `<tr${rc ? ` class="${rc}"` : ""}>`;
            if (indexCfg) {
              h += "<td></td>";
            }
            (fRow.cells || []).forEach((cell, ci) => {
              var _a;
              const hdr = headers[ci];
              const defaultAlign = hdr && hdr.align && hdr.align !== "l" ? " " + hdr.align : "";
              if (cell == null || typeof cell !== "object") {
                h += `<td${defaultAlign ? ` class="${defaultAlign}"` : ""}>${cell != null ? cell : ""}</td>`;
              } else {
                const tc = [defaultAlign, cell.cls || ""].filter(Boolean).join(" ");
                h += `<td${tc ? ` class="${tc}"` : ""}>${(_a = cell.content) != null ? _a : ""}</td>`;
              }
            });
            h += "</tr>";
          });
          h += "</tfoot>";
        }
        h += "</table>";
        wrap.innerHTML = h;
        const tbl = wrap.firstElementChild;
        tbl.querySelectorAll("thead th[data-sk]").forEach((th) => {
          th.addEventListener("click", () => {
            const key = th.dataset.sk;
            if (_sk === key) {
              _sd *= -1;
            } else {
              _sk = key;
              _sd = -1;
            }
            _render();
          });
        });
        if (onRowClick) {
          tbl.querySelectorAll("tbody tr[data-ri]").forEach((tr) => {
            const i = +tr.dataset.ri;
            tr.addEventListener("click", () => onRowClick(sorted[i], i));
          });
        }
      }
      _render();
      wrap.refresh = ({ items: newItems, sortKey: sk, sortDir: sd, footer: newFooter } = {}) => {
        if (newItems !== void 0) _items = newItems;
        if (sk !== void 0) _sk = sk;
        if (sd !== void 0) _sd = sd;
        if (newFooter !== void 0) _footer = newFooter;
        _render();
      };
      return wrap;
    }
  };

  // src/components/shared/tm-modal.js
  document.head.appendChild(Object.assign(document.createElement("style"), {
    textContent: `
/* \u2500\u2500 Modal \u2500\u2500 */
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
.tmu-prompt-field{margin-bottom:14px}
`
  }));
  var htmlOf = (node) => node ? node.outerHTML : "";
  var buttonHtml = ({ style = "secondary", label = "", sub = "", attrs = {} } = {}) => htmlOf(TmButton.button({
    slot: `${label}${sub ? `<span class="tmu-modal-btn-sub">${sub}</span>` : ""}`,
    color: style === "danger" ? "danger" : style === "primary" ? "primary" : "secondary",
    size: "sm",
    cls: `tmu-modal-btn tmu-modal-btn-${style}`,
    attrs
  }));
  var inputHtml = (opts = {}) => htmlOf(TmInput.input({
    size: "full",
    density: "comfy",
    tone: "overlay",
    grow: true,
    ...opts
  }));
  var TmModal = {
    modal({ icon, title, message, buttons }) {
      return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.id = "tmu-modal-overlay";
        overlay.innerHTML = `<div class="tmu-modal"><div class="tmu-modal-icon">${icon || ""}</div><div class="tmu-modal-title">${title}</div><div class="tmu-modal-msg">${message}</div><div class="tmu-modal-btns">${buttons.map(
          (b) => buttonHtml({
            style: b.style || "secondary",
            label: b.label,
            sub: b.sub,
            attrs: { "data-val": b.value }
          })
        ).join("")}</div></div>`;
        const closeWith = (val) => {
          overlay.remove();
          resolve(val);
        };
        const onKey = (e) => {
          if (e.key === "Escape") {
            document.removeEventListener("keydown", onKey);
            closeWith("cancel");
          }
        };
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            document.removeEventListener("keydown", onKey);
            closeWith("cancel");
          }
        });
        document.addEventListener("keydown", onKey);
        overlay.querySelectorAll(".tmu-modal-btn").forEach(
          (btn) => btn.addEventListener("click", () => {
            document.removeEventListener("keydown", onKey);
            closeWith(btn.dataset.val);
          })
        );
        document.body.appendChild(overlay);
      });
    },
    prompt({ icon, title, placeholder, defaultValue }) {
      return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.id = "tmu-modal-overlay";
        const esc = (s) => (s || "").replace(/"/g, "&quot;");
        overlay.innerHTML = `<div class="tmu-modal"><div class="tmu-modal-icon">${icon || ""}</div><div class="tmu-modal-title">${title}</div><div class="tmu-prompt-field">${inputHtml({ id: "tmu-prompt-input", type: "text", placeholder: esc(placeholder), value: esc(defaultValue) })}</div><div class="tmu-modal-btns">` + buttonHtml({ style: "primary", label: "\u{1F4BE} Save", attrs: { "data-val": "ok" } }) + buttonHtml({ style: "danger", label: "Cancel", attrs: { "data-val": "cancel" } }) + `</div></div>`;
        const getVal = () => overlay.querySelector("#tmu-prompt-input").value.trim();
        const closeWith = (val) => {
          overlay.remove();
          resolve(val);
        };
        const onKey = (e) => {
          if (e.key === "Escape") {
            document.removeEventListener("keydown", onKey);
            closeWith(null);
          }
          if (e.key === "Enter") {
            document.removeEventListener("keydown", onKey);
            closeWith(getVal() || null);
          }
        };
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            document.removeEventListener("keydown", onKey);
            closeWith(null);
          }
        });
        document.addEventListener("keydown", onKey);
        overlay.querySelector('[data-val="ok"]').addEventListener("click", () => {
          document.removeEventListener("keydown", onKey);
          closeWith(getVal() || null);
        });
        overlay.querySelector('[data-val="cancel"]').addEventListener("click", () => {
          document.removeEventListener("keydown", onKey);
          closeWith(null);
        });
        document.body.appendChild(overlay);
        setTimeout(() => overlay.querySelector("#tmu-prompt-input").focus(), 50);
      });
    }
  };

  // src/components/shared/tm-progress.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Progress bar \u2500\u2500 */
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
` }));
  var TmProgress = {
    progressBar({ title = "\u26A1 Processing", inline = false, container = null, fadeDelay = 2500 } = {}) {
      const wrap = document.createElement("div");
      if (inline) {
        wrap.className = "tmu-prog-inline";
        wrap.innerHTML = '<div class="tmu-prog-bar"></div>';
        if (container) container.appendChild(wrap);
      } else {
        wrap.className = "tmu-prog-overlay";
        wrap.innerHTML = `<div class="tmu-prog-inner"><div class="tmu-prog-title">${title}</div><div class="tmu-prog-track"><div class="tmu-prog-bar"></div></div><div class="tmu-prog-text">Initializing...</div></div>`;
        document.body.appendChild(wrap);
      }
      const barEl = () => wrap.querySelector(".tmu-prog-bar");
      const txtEl = () => wrap.querySelector(".tmu-prog-text");
      return {
        update(current, total, label) {
          const pct = total > 0 ? Math.round(current / total * 100) : 0;
          const b = barEl();
          if (b) b.style.width = pct + "%";
          const t = txtEl();
          if (t) t.textContent = label != null ? label : `${current}/${total}`;
        },
        done(msg) {
          const b = barEl(), t = txtEl();
          if (b) b.style.width = "100%";
          if (t) {
            t.style.color = "#6cc040";
            t.textContent = msg != null ? msg : "\u2713 Done";
          }
          if (!inline) setTimeout(() => {
            wrap.style.opacity = "0";
            setTimeout(() => wrap.remove(), 600);
          }, fadeDelay);
        },
        error(msg) {
          const t = txtEl();
          if (t) {
            t.style.color = "#f87171";
            t.textContent = msg;
          }
          if (!inline) setTimeout(() => wrap.remove(), 4e3);
        },
        remove() {
          wrap.remove();
        }
      };
    }
  };

  // src/components/shared/tm-tabs.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 Tab bar (tmu-tabs / tmu-tab) \u2500\u2500 */
.tmu-tabs{
display:flex;align-items:stretch;
background:var(--tmu-tabs-bg,var(--tmu-tabs-primary-bg,#274a18));
border:1px solid var(--tmu-tabs-border,var(--tmu-tabs-primary-border,#3d6828));
overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;
scrollbar-color:var(--tmu-tabs-scrollbar,var(--tmu-tabs-primary-border,#3d6828)) transparent
}
.tmu-tabs-color-primary{
--tmu-tabs-bg:var(--tmu-tabs-primary-bg,#274a18);
--tmu-tabs-border:var(--tmu-tabs-primary-border,#3d6828);
--tmu-tabs-text:var(--tmu-tabs-primary-text,#90b878);
--tmu-tabs-hover-text:var(--tmu-tabs-primary-hover-text,#c8e0b4);
--tmu-tabs-hover-bg:var(--tmu-tabs-primary-hover-bg,#305820);
--tmu-tabs-active-text:var(--tmu-tabs-primary-active-text,#e8f5d8);
--tmu-tabs-active-bg:var(--tmu-tabs-primary-active-bg,#305820);
--tmu-tabs-active-border:var(--tmu-tabs-primary-active-border,#6cc040)
}
.tmu-tabs-color-secondary{
--tmu-tabs-bg:var(--tmu-tabs-secondary-bg,#1f2e16);
--tmu-tabs-border:var(--tmu-tabs-secondary-border,#455f34);
--tmu-tabs-text:var(--tmu-tabs-secondary-text,#9eb88a);
--tmu-tabs-hover-text:var(--tmu-tabs-secondary-hover-text,#d2e4c6);
--tmu-tabs-hover-bg:var(--tmu-tabs-secondary-hover-bg,#314726);
--tmu-tabs-active-text:var(--tmu-tabs-secondary-active-text,#f0f7ea);
--tmu-tabs-active-bg:var(--tmu-tabs-secondary-active-bg,#314726);
--tmu-tabs-active-border:var(--tmu-tabs-secondary-active-border,#8fb96c)
}
.tmu-tabs-stretch .tmu-tab{flex:1 1 0;min-width:0}
.tmu-tab{padding:8px 12px;text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--tmu-tabs-text,var(--tmu-tabs-primary-text,#90b878));cursor:pointer;border:none;border-bottom:2px solid transparent;transition:all .15s;background:transparent;font-family:inherit;-webkit-appearance:none;appearance:none;display:flex;align-items:center;justify-content:center;gap:6px;flex:0 0 auto;min-width:max-content}
.tmu-tab:hover:not(:disabled){color:var(--tmu-tabs-hover-text,var(--tmu-tabs-primary-hover-text,#c8e0b4));background:var(--tmu-tabs-hover-bg,var(--tmu-tabs-primary-hover-bg,#305820))}
.tmu-tab.active{color:var(--tmu-tabs-active-text,var(--tmu-tabs-primary-active-text,#e8f5d8));border-bottom-color:var(--tmu-tabs-active-border,var(--tmu-tabs-primary-active-border,#6cc040));background:var(--tmu-tabs-active-bg,var(--tmu-tabs-primary-active-bg,#305820))}
.tmu-tab:disabled{opacity:.4;cursor:not-allowed}
.tmu-tab-icon{font-size:14px;line-height:1;flex-shrink:0}
` }));
  var setActive = (wrap, activeKey) => {
    wrap.querySelectorAll(".tmu-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === String(activeKey));
    });
  };
  var TmTabs = {
    tabs({ items, active, onChange, stretch = false, color = "primary", cls = "", itemCls = "" }) {
      const wrap = document.createElement("div");
      wrap.className = ["tmu-tabs", `tmu-tabs-color-${color}`, stretch ? "tmu-tabs-stretch" : "", cls].filter(Boolean).join(" ");
      items.forEach(({ key, label, slot, disabled, icon, cls: itemOwnCls, title }) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = ["tmu-tab", itemCls, itemOwnCls, key === active ? "active" : ""].filter(Boolean).join(" ");
        btn.dataset.tab = key;
        if (title) btn.title = title;
        if (icon) {
          const iconEl = document.createElement("span");
          iconEl.className = "tmu-tab-icon";
          iconEl.textContent = icon;
          btn.appendChild(iconEl);
          const labelEl = document.createElement("span");
          labelEl.textContent = label;
          btn.appendChild(labelEl);
        } else if (slot instanceof Node) {
          btn.appendChild(slot);
        } else if (typeof slot === "string") {
          btn.innerHTML = slot;
        } else {
          btn.textContent = label;
        }
        if (disabled) btn.disabled = true;
        btn.addEventListener("click", () => {
          if (btn.disabled) return;
          setActive(wrap, key);
          onChange == null ? void 0 : onChange(key);
        });
        wrap.appendChild(btn);
      });
      return wrap;
    },
    setActive
  };

  // src/components/shared/tm-state.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* \u2500\u2500 State (loading / empty / error) \u2500\u2500 */
.tmu-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 20px;gap:8px;text-align:center}
.tmu-state-text{color:#6a9a58;font-size:12px;font-weight:600;letter-spacing:.5px}
.tmu-state-empty .tmu-state-text{color:#5a7a48;font-style:italic;font-weight:400}
.tmu-state-error .tmu-state-text{color:#f87171}
.tmu-state-sm{padding:8px 12px;gap:5px}
.tmu-state-sm .tmu-state-text{font-size:10px;letter-spacing:.3px}
` }));
  var TmState = {
    loading: (msg = "Loading\u2026", compact = false) => `<div class="tmu-state${compact ? " tmu-state-sm" : ""}"><span class="tmu-spinner tmu-spinner-md"></span><span class="tmu-state-text">${msg}</span></div>`,
    empty: (msg = "No data", compact = false) => `<div class="tmu-state tmu-state-empty${compact ? " tmu-state-sm" : ""}"><span class="tmu-state-text">${msg}</span></div>`,
    error: (msg = "Error", compact = false) => `<div class="tmu-state tmu-state-error${compact ? " tmu-state-sm" : ""}"><span>\u26A0</span><span class="tmu-state-text">${msg}</span></div>`
  };

  // src/components/shared/tm-ui.js
  document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
/* -- Spinner -- */
.tmu-spinner { display: inline-block; border-radius: 50%; border-style: solid; border-color: #6a9a58; border-top-color: transparent; animation: tmu-spin 0.6s linear infinite; vertical-align: middle; }
.tmu-spinner-sm { width: 10px; height: 10px; border-width: 2px; }
.tmu-spinner-md { width: 16px; height: 16px; border-width: 2px; }
@keyframes tmu-spin { to { transform: rotate(360deg); } }
/* -- Row / Col grid -- */
.tmu-row { display: flex; align-items: center; gap: 8px; }
.tmu-col { min-width: 0; }
.tmu-col-1{flex:0 0 8.333%}  .tmu-col-2{flex:0 0 16.667%} .tmu-col-3{flex:0 0 25%}     .tmu-col-4{flex:0 0 33.333%}
.tmu-col-5{flex:0 0 41.667%} .tmu-col-6{flex:0 0 50%}     .tmu-col-7{flex:0 0 58.333%} .tmu-col-8{flex:0 0 66.667%}
.tmu-col-9{flex:0 0 75%}     .tmu-col-10{flex:0 0 83.333%}.tmu-col-11{flex:0 0 91.667%}.tmu-col-12{flex:0 0 100%}
/* -- Color variants -- */
.yellow { color: #fbbf24; } .red    { color: #f87171; } .green  { color: #4ade80; }
.blue   { color: #60a5fa; } .purple { color: #c084fc; } .lime   { color: #80e048; }
.muted  { color: #8aac72; } .gold   { color: gold;    } .silver { color: silver;  } .orange { color: #ee9900; }
/* -- Typography -- */
.text-xs  { font-size: 10px; } .text-sm  { font-size: 12px; } .text-md  { font-size: 14px; }
.text-lg  { font-size: 16px; } .text-xl  { font-size: 18px; } .text-2xl { font-size: 20px; }
.font-normal { font-weight: 400; } .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
.uppercase { text-transform: uppercase; } .lowercase { text-transform: lowercase; } .capitalize { text-transform: capitalize; }
/* -- Border-radius -- */
.rounded-sm { border-radius: 4px; } .rounded-md { border-radius: 6px; }
.rounded-lg { border-radius: 8px; } .rounded-xl { border-radius: 12px; } .rounded-full { border-radius: 9999px; }
/* -- Spacing (4px base scale) -- */
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
` }));
  var TmUI = {
    ...TmButton,
    ...TmCheckbox,
    ...TmAutocomplete,
    ...TmBadge,
    ...TmInput,
    ...TmChip,
    ...TmCompareStat,
    ...TmMetric,
    ...TmStat,
    ...TmTooltipStats,
    ...TmRender,
    ...TmSkill,
    ...TmTooltip,
    ...TmTable,
    ...TmModal,
    ...TmProgress,
    ...TmTabs,
    ...TmState
  };

  // src/lib/tm-position.js
  var ensureChipCSS = /* @__PURE__ */ (() => {
    let done = false;
    return () => {
      if (done || typeof document === "undefined") return;
      done = true;
      const s = document.createElement("style");
      s.id = "tm-pos-chip-styles";
      s.textContent = `.tm-pos-chip{display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.3px;line-height:16px;text-align:center;min-width:28px;text-transform:uppercase;}`;
      document.head.appendChild(s);
    };
  })();
  var MAP = TmConst.POSITION_MAP;
  var FILTER_GROUPS = { 9: "gk", 0: "de", 1: "de", 2: "dm", 3: "dm", 4: "mf", 5: "mf", 6: "om", 7: "om", 8: "fw" };
  var GROUP_COLORS = {
    9: "#4ade80",
    // GK
    0: "#60a5fa",
    1: "#60a5fa",
    // DC, DLR
    2: "#818cf8",
    3: "#818cf8",
    // DMC, DMLR
    4: "#fbbf24",
    5: "#fbbf24",
    // MC, MLR
    6: "#fb923c",
    7: "#fb923c",
    // OMC, OMLR
    8: "#f87171"
    // F
  };
  var GROUP_LABELS = {
    9: "GK",
    0: "DC",
    1: "DLR",
    2: "DMC",
    3: "DMLR",
    4: "MC",
    5: "MLR",
    6: "OMC",
    7: "OMLR",
    8: "F"
  };
  var norm = (pos) => (pos || "").replace(/sub/i, "").trim().toLowerCase().split(/[\/,]/)[0];
  var TmPosition = {
    /**
     * Display label for a position string.
     * e.g. "subdc" → "DC",  "dl" → "DL",  null → "?"
     */
    label(pos) {
      if (!pos) return "?";
      const cleaned = pos.replace(/sub/i, "").trim().toUpperCase().split(/[\/,]/)[0];
      return cleaned || "SUB";
    },
    /**
     * Position color from POSITION_MAP (for chips, badges).
     * e.g. 'gk' → '#4ade80'
     */
    color(pos) {
      var _a, _b;
      return (_b = (_a = MAP[norm(pos)]) == null ? void 0 : _a.color) != null ? _b : "#aaa";
    },
    /**
     * Integer POSITION_MAP id for a position string key.
     * e.g. 'gk' → 9,  'dc' → 0
     */
    idFor(pos) {
      var _a, _b;
      return (_b = (_a = MAP[norm(pos)]) == null ? void 0 : _a.id) != null ? _b : 0;
    },
    /**
     * Stat group classification: 'gk' | 'def' | 'mid' | 'att'
     * Used for grouping players in stats tables.
     */
    group(pos) {
      const p = norm(pos);
      if (p === "gk") return "gk";
      if (/^d/.test(p) || p === "lb" || p === "rb" || p === "sw") return "def";
      if (/^(fc|st|cf|lw|rw|lf|rf|fw)/.test(p)) return "att";
      return "mid";
    },
    /**
     * Chip variant key for TmUI.chip(): 'gk' | 'd' | 'm' | 'f'
     */
    variant(pos) {
      const p = norm(pos);
      if (p === "gk") return "gk";
      if (/^d/.test(p)) return "d";
      if (/^f/.test(p) || /^(fc|st|cf|lw|rw)/.test(p)) return "f";
      return "m";
    },
    /**
     * CSS class for position pill in the history (tmh-* namespace).
     * e.g. 'gk' → 'tmh-pos-gk', 'dc' → 'tmh-pos-d'
     */
    cssClass(pos) {
      const p = norm(pos);
      if (!p) return "";
      if (p === "gk") return "tmh-pos-gk";
      if (/^dm/.test(p)) return "tmh-pos-m";
      if (/^d/.test(p)) return "tmh-pos-d";
      if (/^f/.test(p) || /^(fc|st|cf)/.test(p)) return "tmh-pos-f";
      return "tmh-pos-m";
    },
    /**
     * Filter group for a POSITION_MAP id number.
     * e.g. 9 → 'gk', 4 → 'mf', 8 → 'fw'
     */
    filterGroup(id) {
      var _a;
      return (_a = FILTER_GROUPS[id]) != null ? _a : "mf";
    },
    /**
     * Group color for a POSITION_MAP id number (charts, legends).
     * e.g. 9 → '#4ade80', 8 → '#f87171'
     */
    groupColor(id) {
      var _a;
      return (_a = GROUP_COLORS[id]) != null ? _a : "#aaa";
    },
    /**
     * Short group label for a POSITION_MAP id number.
     * e.g. 9 → 'GK', 1 → 'DLR', 8 → 'F'
     */
    groupLabel(id) {
      var _a;
      return (_a = GROUP_LABELS[id]) != null ? _a : "?";
    },
    /**
     * Render a position chip — identical layout to the squad table.
     * @param {Array<{position:string,color:string}> | Array<string>} positions
     * @param {string} [cls] CSS class for the outer chip span
     */
    chip(positions, cls = "tm-pos-chip") {
      ensureChipCSS();
      if (!positions || Array.isArray(positions) && !positions.length) return "-";
      const arr = Array.isArray(positions) ? positions : [positions];
      const items = arr.map((pp) => {
        var _a, _b, _c, _d;
        if (typeof pp === "string") {
          const key = norm(pp);
          const entry = (_a = MAP[key]) != null ? _a : MAP[key.replace(/[lrc]$/, "")];
          return { label: (_b = entry == null ? void 0 : entry.position) != null ? _b : key.replace(/sub/i, "").toUpperCase(), color: (_c = entry == null ? void 0 : entry.color) != null ? _c : "#aaa" };
        }
        return { label: pp.position, color: (_d = pp.color) != null ? _d : "#aaa" };
      });
      if (!items.length) return "-";
      const firstColor = items[0].color;
      const inner = items.map((it) => `<span style="color:${it.color}">${it.label}</span>`).join('<span style="color:#6a9a58">, </span>');
      return TmUI.positionChip(firstColor, inner, cls);
    }
  };

  // src/lib/tm-utils.js
  var { COLOR_LEVELS: COLOR_LEVELS2 } = TmConst;
  var getColor = (value, thresholds) => {
    for (let i = 0; i < thresholds.length; i++) {
      if (value >= thresholds[i]) return COLOR_LEVELS2[i].color;
    }
    return COLOR_LEVELS2[COLOR_LEVELS2.length - 1].color;
  };
  var parseNum = (v, fallback = 0) => {
    if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
    return parseInt(String(v != null ? v : "").replace(/[^0-9]/g, ""), 10) || fallback;
  };
  var ageToMonths = (k) => {
    const [y, m] = k.split(".").map(Number);
    return y * 12 + m;
  };
  var monthsToAge = (m) => `${Math.floor(m / 12)}.${m % 12}`;
  var classifyPosition = (pos) => TmPosition.group(pos || "");
  var posLabel = (pos) => TmPosition.label(pos);
  var fix2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
  var fmtCoins = (n) => {
    if (n == null || isNaN(n) || n === 0) return "-";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(0) + "k";
    return String(Math.round(n));
  };
  var ratingColor = (r) => {
    if (!r || r === 0) return "#5a7a48";
    const v = Number(r);
    if (v >= 9) return "#00c040";
    if (v >= 8.5) return "#00dd50";
    if (v >= 8) return "#22e855";
    if (v >= 7.5) return "#44ee55";
    if (v >= 7) return "#66dd44";
    if (v >= 6.5) return "#88cc33";
    if (v >= 6) return "#99bb22";
    if (v >= 5.5) return "#aacc00";
    if (v >= 5) return "#bbcc00";
    if (v >= 4.5) return "#dd9900";
    if (v >= 4) return "#ee7733";
    if (v >= 3.5) return "#ee5533";
    if (v >= 3) return "#dd3333";
    if (v >= 2) return "#cc2222";
    return "#bb1111";
  };
  var toggleSort = (clickedKey, currentKey, currentDir, defaultDir = -1) => {
    if (clickedKey === currentKey) return { key: currentKey, dir: currentDir * -1 };
    return { key: clickedKey, dir: defaultDir };
  };
  var skillColor = (v) => {
    const n = parseInt(v);
    if (!n || n <= 0) return "#2a3a28";
    if (n >= 20) return "#d4af37";
    if (n >= 19) return "#c0c0c0";
    if (n >= 16) return "#66dd44";
    if (n >= 12) return "#cccc00";
    if (n >= 8) return "#ee9900";
    return "#ee6633";
  };
  var formatSkill = (v) => {
    const n = parseInt(v);
    if (n >= 20) return { display: "\u2605", starCls: " star-gold" };
    if (n >= 19) return { display: "\u2605", starCls: " star-silver" };
    return { display: String(isFinite(n) ? n : ""), starCls: "" };
  };
  var skillEff = (lvl) => {
    if (lvl >= 20) return 0;
    const bracket = TmConst.SKILL_EFFICIENCY_BRACKETS.find(([min]) => lvl >= min);
    return bracket ? bracket[1] : 0.15;
  };
  var getTopNThresholds = (rows, cols, getValue) => {
    const tops = {};
    cols.forEach((col) => {
      const vals = rows.map((r) => getValue(r, col)).filter((v) => v > 0);
      const sorted = [...new Set(vals)].sort((a, b) => b - a);
      tops[col] = { v1: sorted[0] || -1, v2: sorted[1] || -1, v3: sorted[2] || -1 };
    });
    return tops;
  };
  var topNClass = (val, col, tops) => {
    if (val <= 0) return "";
    const t = tops[col];
    if (!t) return "";
    if (val >= t.v1) return "top1";
    if (val >= t.v2) return "top2";
    if (val >= t.v3) return "top3";
    return "";
  };
  var getMainContainer = (root = document) => root.querySelector(".tmvu-main, .main_center");
  var getMainContainers = (root = document) => Array.from(root.querySelectorAll(".tmvu-main, .main_center"));
  var r5Color = /* @__PURE__ */ (() => {
    const cache = /* @__PURE__ */ new Map();
    const hsl2rgb = (h, s, l) => {
      s /= 100;
      l /= 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(h / 60 % 2 - 1));
      const m = l - c / 2;
      let r, g, b;
      if (h < 60) {
        r = c;
        g = x;
        b = 0;
      } else if (h < 120) {
        r = x;
        g = c;
        b = 0;
      } else {
        r = 0;
        g = c;
        b = x;
      }
      return "#" + [r + m, g + m, b + m].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
    };
    const topColors = {
      95: "#8db024",
      96: "#7aad22",
      97: "#68a820",
      98: "#57a31e",
      99: "#479e1c",
      100: "#38991a",
      101: "#2e9418",
      102: "#258e16",
      103: "#1d8814",
      104: "#168212",
      105: "#107c10",
      106: "#0c720e",
      107: "#09680c",
      108: "#075e0a",
      109: "#055408",
      110: "#044a07",
      111: "#034106",
      112: "#033905",
      113: "#023204",
      114: "#022c04",
      115: "#022603",
      116: "#012103",
      117: "#011d02",
      118: "#011902"
    };
    const tiers = [
      [25, 50, 0, 10, 65, 68, 28, 32],
      [50, 70, 10, 25, 68, 72, 34, 40],
      [70, 80, 25, 42, 72, 75, 42, 46],
      [80, 90, 42, 58, 75, 78, 46, 48],
      [90, 95, 58, 78, 78, 80, 48, 46]
    ];
    return (v) => {
      if (!v) return "#5a7a48";
      const rounded = Math.round(v);
      if (cache.has(rounded)) return cache.get(rounded);
      let color;
      if (rounded >= 95) {
        color = topColors[Math.min(118, rounded)] || topColors[118];
      } else {
        const clamped = Math.max(25, Math.min(95, v));
        let hue = 0, sat = 65, lit = 28;
        for (const [from, to, h0, h1, s0, s1, l0, l1] of tiers) {
          if (clamped <= to) {
            const t = (clamped - from) / (to - from);
            hue = h0 + t * (h1 - h0);
            sat = s0 + t * (s1 - s0);
            lit = l0 + t * (l1 - l0);
            break;
          }
        }
        color = hsl2rgb(hue, sat, lit);
      }
      cache.set(rounded, color);
      return color;
    };
  })();
  var TmUtils = { getColor, parseNum, ageToMonths, monthsToAge, classifyPosition, posLabel, fix2, fmtCoins, ratingColor, r5Color, toggleSort, skillColor, formatSkill, skillEff, getTopNThresholds, topNClass, getMainContainer, getMainContainers };

  // src/components/player/tm-player-tooltip.js
  var CSS = `
.tmpt-tip {
    display: none; position: absolute; z-index: 9999;
    background: linear-gradient(135deg, #1a2e14 0%, #243a1a 100%);
    border: 1px solid #4a9030; border-radius: 8px;
    padding: 10px 12px; min-width: 200px; max-width: 280px;
    box-shadow: 0 6px 24px rgba(0,0,0,0.6);
    pointer-events: none; font-size: 11px; color: #c8e0b4;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-sizing: border-box;
}
.tmpt-header {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 8px; padding-bottom: 6px;
    border-bottom: 1px solid rgba(74,144,48,0.3);
}
.tmpt-name { font-size: 13px; font-weight: 700; color: #e0f0cc; }
.tmpt-pos  { font-size: 10px; color: #8abc78; font-weight: 600; }
.tmpt-badges { display: flex; gap: 6px; margin-left: auto; }
.tmpt-badges .tmu-badge { white-space: nowrap; }
.tmpt-skills { display: flex; gap: 12px; margin-bottom: 6px; }
.tmpt-skills-col { flex: 1; min-width: 0; }
.tmpt-skill {
    display: flex; justify-content: space-between;
    padding: 1px 0; border-bottom: 1px solid rgba(74,144,48,0.12);
}
.tmpt-skill-name { color: #8abc78; font-size: 10px; }
.tmpt-skill-val  { font-weight: 700; font-size: 11px; }
.tmpt-footer {
    display: flex; gap: 8px; justify-content: center;
    padding-top: 6px; border-top: 1px solid rgba(74,144,48,0.3);
}
.tmpt-stat { text-align: center; }
.tmpt-stat-val { font-size: 14px; font-weight: 800; }
.tmpt-stat-lbl { font-size: 9px; color: #6a9a58; text-transform: uppercase; }
`;
  var styleEl = document.createElement("style");
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);
  var renderHTML = (player) => {
    const { getColor: getColor3 } = TmUtils;
    const { R5_THRESHOLDS: R5_THRESHOLDS2, REC_THRESHOLDS: REC_THRESHOLDS2, TI_THRESHOLDS: TI_THRESHOLDS2 } = TmConst;
    const badgeHtml = (opts, tone = "muted") => TmUI.badge({ size: "sm", shape: "rounded", weight: "bold", ...opts }, tone);
    let h = '<div class="tmpt-header">';
    h += `<div><div class="tmpt-name">${player.name}</div>`;
    const noStr = player.no ? ` \xB7 #${player.no}` : "";
    h += `<div class="tmpt-pos">${(player.positions || []).map((pos) => pos.position).join(", ")}${noStr} \xB7 Age ${player.ageMonthsString}</div></div>`;
    h += '<div class="tmpt-badges">';
    if (player.r5 != null) {
      h += badgeHtml({ slot: `<span class="tmu-badge-label">R5</span><span class="tmu-badge-value" style="color:${getColor3(player.r5, R5_THRESHOLDS2)}">${player.r5}</span>` });
    } else if (player.r5Range) {
      const { lo, hi } = player.r5Range;
      const rangeStr = lo != null && lo.toFixed(1) !== hi.toFixed(1) ? `${lo.toFixed(1)}\u2013${hi.toFixed(1)}` : `${hi.toFixed(1)}`;
      h += badgeHtml({ slot: `<span class="tmu-badge-label">R5</span><span class="tmu-badge-value" style="color:${getColor3(hi != null ? hi : 0, R5_THRESHOLDS2)}">${rangeStr}</span>` });
    }
    if (player.ti != null)
      h += badgeHtml({ slot: `<span class="tmu-badge-label">TI</span><span class="tmu-badge-value" style="color:${getColor3(player.ti, TI_THRESHOLDS2)}">${player.ti.toFixed(1)}</span>` });
    h += "</div></div>";
    const fieldLeft = [0, 1, 2, 3, 4, 5, 6];
    const fieldRight = [7, 8, 9, 10, 11, 12, 13];
    const gkLeft = [0, 3, 1];
    const gkRight = [10, 4, 5, 6, 2, 7, 8, 9];
    const leftIdx = player.isGK ? gkLeft : fieldLeft;
    const rightIdx = player.isGK ? gkRight : fieldRight;
    const renderCol = (indices) => {
      let c = '<div class="tmpt-skills-col">';
      indices.forEach((i) => {
        const skill = player.skills[i];
        if (!skill) return;
        const val = skill.value;
        const display = TmUI.skillBadge(val);
        c += `<div class="tmpt-skill">
                        <span class="tmpt-skill-name">${skill.name}</span>
                        <span class="tmpt-skill-val">${display}</span>
                    </div>`;
      });
      return c + "</div>";
    };
    h += '<div class="tmpt-skills">' + renderCol(leftIdx) + renderCol(rightIdx) + "</div>";
    const stats = player.footerStats || [
      player.asi != null ? { val: player.asi.toLocaleString(), lbl: "ASI", color: "#e0f0cc" } : null,
      player.rec != null ? { val: Number(player.rec), lbl: "REC", color: getColor3(Number(player.rec), REC_THRESHOLDS2) } : null,
      player.routine != null ? { val: player.routine.toFixed(1), lbl: "Routine", color: "#8abc78" } : null
    ].filter(Boolean);
    if (stats.length)
      h += `<div class="tmpt-footer">${stats.map(
        (s) => `<div class="tmpt-stat"><div class="tmpt-stat-val" style="color:${s.color}">${s.val}</div><div class="tmpt-stat-lbl">${s.lbl}</div></div>`
      ).join("")}</div>`;
    if (player.note)
      h += `<div style="margin-top:7px;padding-top:6px;border-top:1px solid rgba(74,144,48,0.25);font-size:10px;color:#90b878;line-height:1.5">\u{1F4CB} ${player.note}</div>`;
    return h;
  };
  var el = null;
  var ensureEl = () => {
    if (el) return;
    el = document.createElement("div");
    el.className = "tmpt-tip";
    document.body.appendChild(el);
  };
  var show = (anchor, player) => {
    ensureEl();
    el.innerHTML = renderHTML(player);
    el.style.display = "block";
    TmUI.positionTooltip(el, anchor);
  };
  var hide = () => {
    if (el) el.style.display = "none";
  };
  var TmPlayerTooltip = { renderHTML, show, hide };

  // src/components/transfer/tm-transfer-sidebar.js
  var TmTransferSidebar = {
    build() {
      const { SKILL_KEYS_OUT: SKILL_KEYS_OUT2, SKILL_KEYS_GK: SKILL_KEYS_GK2, SKILL_LABELS: SKILL_LABELS2 } = TmConst;
      const buttonHtml2 = (opts) => TmUI.button(opts).outerHTML;
      const checkboxFieldHtml = (opts) => TmUI.checkboxField(opts).outerHTML;
      const inputHtml2 = (opts) => TmUI.input({ type: "number", size: "full", density: "regular", grow: true, ...opts }).outerHTML;
      const skillSelectOpts = (withNone = true) => {
        const combined = [...SKILL_KEYS_OUT2, ...SKILL_KEYS_GK2.filter((s2) => !SKILL_KEYS_OUT2.includes(s2))];
        let s = withNone ? '<option value="0">\u2014</option>' : "";
        for (const sk of combined) s += `<option value="${sk}">${SKILL_LABELS2[sk]}</option>`;
        return s;
      };
      const valOpts = `<option value="0">\u2265</option>${[...Array(20)].map((_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("")}`;
      return `
    <div id="tms-sidebar" class="tmvu-transfer-sidebar">
      <div id="tms-filter-box">
      <div class="tms-sb-section">
        <div class="tms-sb-head">Age Range
          ${checkboxFieldHtml({ id: "tms-for", checked: true, label: "Foreigners", cls: "tms-for-inline" })}
        </div>
        <div class="tms-sb-body">
          <div class="tms-range-row">
            ${inputHtml2({ id: "tms-amin", min: 18, max: 37, value: 18, placeholder: "Min" })}
            <span class="tms-range-sep">\u2013</span>
            ${inputHtml2({ id: "tms-amax", min: 18, max: 37, value: 37, placeholder: "Max" })}
          </div>
        </div>
      </div>

      <div class="tms-sb-section">
        <div class="tms-sb-head">Recommendation</div>
        <div class="tms-sb-body">
          <div class="tms-range-row">
            ${inputHtml2({ id: "tms-rmin", min: 0, max: 5, step: 0.01, value: 0, placeholder: "Min" })}
            <span class="tms-range-sep">\u2013</span>
            ${inputHtml2({ id: "tms-rmax", min: 0, max: 5, step: 0.01, value: 5, placeholder: "Max" })}
          </div>
        </div>
      </div>

      <div class="tms-sb-section">
        <div class="tms-sb-head">R5 <span class="tms-post-note">post-filter</span></div>
        <div class="tms-sb-body">
          <div class="tms-range-row">
            ${inputHtml2({ id: "tms-r5min", min: 0, max: 200, step: 0.1, placeholder: "Min" })}
            <span class="tms-range-sep">\u2013</span>
            ${inputHtml2({ id: "tms-r5max", min: 0, max: 200, step: 0.1, placeholder: "Max" })}
          </div>
        </div>
      </div>

      <div class="tms-sb-section">
        <div class="tms-sb-head">TI <span class="tms-post-note">post-filter</span></div>
        <div class="tms-sb-body">
          <div class="tms-range-row">
            ${inputHtml2({ id: "tms-timin", min: -100, max: 200, step: 0.1, placeholder: "Min" })}
            <span class="tms-range-sep">\u2013</span>
            ${inputHtml2({ id: "tms-timax", min: -100, max: 200, step: 0.1, placeholder: "Max" })}
          </div>
        </div>
      </div>

      <div class="tms-sb-section">
        <div class="tms-sb-body">
          <div class="tms-pos-formation">
            <div class="tms-pos-formation-empty"></div>
            <div class="tms-filter-btn tms-gk" data-fp="gk">GK</div>
            <div class="tms-pos-formation-empty"></div>
            <div class="tms-filter-btn tms-de" data-fp="dl">DL</div>
            <div class="tms-filter-btn tms-de" data-fp="dc">DC</div>
            <div class="tms-filter-btn tms-de" data-fp="dr">DR</div>
            <div class="tms-filter-btn tms-dm" data-fp="dml">DML</div>
            <div class="tms-filter-btn tms-dm" data-fp="dmc">DMC</div>
            <div class="tms-filter-btn tms-dm" data-fp="dmr">DMR</div>
            <div class="tms-filter-btn tms-mf" data-fp="ml">ML</div>
            <div class="tms-filter-btn tms-mf" data-fp="mc">MC</div>
            <div class="tms-filter-btn tms-mf" data-fp="mr">MR</div>
            <div class="tms-filter-btn tms-om" data-fp="oml">OML</div>
            <div class="tms-filter-btn tms-om" data-fp="omc">OMC</div>
            <div class="tms-filter-btn tms-om" data-fp="omr">OMR</div>
            <div class="tms-pos-formation-empty"></div>
            <div class="tms-filter-btn tms-fw" data-fp="fc">FC</div>
            <div class="tms-pos-formation-empty"></div>
          </div>
        </div>
      </div>
      <div class="tms-primary-actions">
        ${buttonHtml2({ id: "tms-search-btn", label: "\u{1F50D} Search 100", color: "primary", block: true })}
        ${buttonHtml2({ id: "tms-findall-btn", label: "\u2B07\uFE0F Find All", color: "secondary", size: "sm", block: true })}
      </div>
      <div class="tms-sb-section" style="margin-top:6px">
        <div class="tms-sb-head">Saved Filters</div>
        <div class="tms-sb-body">
          <select id="tms-saved-filters-sel" class="tms-sel" style="width:100%;margin-bottom:6px"><option value="">\u2014 no saved filters \u2014</option></select>
          <div class="tms-filter-actions">
            <div class="tms-filter-action-cell">${buttonHtml2({ id: "tms-filter-load-btn", label: "\u{1F4C2} Load", color: "secondary", size: "xs", block: true })}</div>
            <div class="tms-filter-action-cell tms-filter-action-cell-wide">${buttonHtml2({ id: "tms-filter-save-btn", label: "\u{1F4BE} Save Current", color: "secondary", size: "xs", block: true })}</div>
            <div class="tms-filter-action-cell">${buttonHtml2({ id: "tms-filter-del-btn", label: "\u{1F5D1}", color: "danger", size: "xs", block: true })}</div>
          </div>
        </div>
      </div>
      <div class="tms-more-toggle-wrap">${buttonHtml2({
        id: "tms-more-toggle",
        color: "secondary",
        size: "xs",
        block: true,
        cls: "tms-more-toggle",
        slot: '<span class="tms-more-toggle-content"><span>More Filters</span><span class="tms-more-arrow">\u25BC</span></span>'
      })}</div>
      <div class="tms-more-body" id="tms-more-body">
        <div class="tms-sb-section">
          <div class="tms-sb-head">Max Price</div>
          <div class="tms-sb-body">
            <div class="tms-row">
              <select id="tms-cost" class="tms-sel">
                <option value="0" selected>Any</option>
                <option value="aff">Affordable</option>
                <option value="5">5 Mil</option>
                <option value="25">25 Mil</option>
                <option value="50">50 Mil</option>
                <option value="100">100 Mil</option>
                <option value="250">250 Mil</option>
                <option value="500">500 Mil</option>
              </select>
            </div>
          </div>
        </div>

        <div class="tms-sb-section">
          <div class="tms-sb-head">Time Left</div>
          <div class="tms-sb-body">
            <div class="tms-row">
              <select id="tms-time" class="tms-sel">
                <option value="0" selected>Any</option>
                <option value="1">15 Minutes</option>
                <option value="2">1 Hour</option>
                <option value="3">6 Hours</option>
                <option value="4">1 Day</option>
                <option value="5">2 Days</option>
                <option value="6">4 Days</option>
              </select>
            </div>
          </div>
        </div>

        <div class="tms-sb-section">
          <div class="tms-sb-head">Skill Filters</div>
          <div class="tms-sb-body">
            <div class="tms-skill-row">
              <select class="tms-sel" id="tms-sf-s0">${skillSelectOpts()}</select>
              <select class="tms-sel" id="tms-sf-v0" style="width:46px">${valOpts}</select>
            </div>
            <div class="tms-skill-row">
              <select class="tms-sel" id="tms-sf-s1">${skillSelectOpts()}</select>
              <select class="tms-sel" id="tms-sf-v1" style="width:46px">${valOpts}</select>
            </div>
            <div class="tms-skill-row">
              <select class="tms-sel" id="tms-sf-s2">${skillSelectOpts()}</select>
              <select class="tms-sel" id="tms-sf-v2" style="width:46px">${valOpts}</select>
            </div>
          </div>
        </div>
      </div>
      </div>

    </div>`;
    }
  };

  // src/components/transfer/tm-transfer-styles.js
  var TmTransferStyles = {
    inject() {
      if (document.getElementById("tms-style")) return;
      const css = `
    /* \u2500\u2500\u2500 Root layout \u2500\u2500\u2500 */
    .tmvu-main.tmvu-transfer-page {
        display: flex !important;
        gap: 16px;
        align-items: flex-start;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #c8e0b4;
    }

    /* \u2500\u2500\u2500 Sidebar \u2500\u2500\u2500 */
    #tms-sidebar,
    .tmvu-transfer-sidebar {
        width: 250px;
        min-width: 250px;
        background: transparent;
        box-sizing: border-box;
        position: sticky;
        top: 8px;
        max-height: calc(100vh - 20px);
        overflow-y: auto;
    }
    #tms-sidebar::-webkit-scrollbar, .tmvu-transfer-sidebar::-webkit-scrollbar { width: 4px; }
    #tms-sidebar::-webkit-scrollbar-track, .tmvu-transfer-sidebar::-webkit-scrollbar-track { background: #111; }
    #tms-sidebar::-webkit-scrollbar-thumb, .tmvu-transfer-sidebar::-webkit-scrollbar-thumb { background: #3d6828; border-radius: 2px; }

    /* Card-style sections (matching tm-player widget style) */
    .tms-sb-section {
        background: #1c3410;
        border: 1px solid #3d6828;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 8px;
    }
    .tms-sb-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 10px;
        font-weight: 700;
        color: #6a9a58;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 8px 12px 6px;
        border-bottom: 1px solid rgba(61,104,40,0.3);
    }
    .tms-for-inline {
        display: flex; align-items: center; gap: 4px;
        font-size: 10px; font-weight: 600; color: #90b878;
        text-transform: none; letter-spacing: 0; cursor: pointer;
    }
    .tms-sb-body {
        padding: 8px 10px;
    }

    .tms-pos-formation { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3px; }
    .tms-pos-formation-empty { pointer-events: none; }
    .tms-primary-actions { display: flex; flex-direction: column; gap: 6px; }
    .tms-filter-actions { display: flex; gap: 4px; }
    .tms-filter-action-cell { flex: 1; }
    .tms-filter-action-cell-wide { flex: 2; }
    .tms-more-toggle-wrap { margin: 16px 0; }
    .tms-more-toggle-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }
    .tms-more-toggle .tms-more-arrow { font-size: 9px; transition: transform .2s; }
    .tms-more-toggle.open .tms-more-arrow { transform: rotate(180deg); }
    .tms-more-body { display: none; }
    .tms-more-body.open { display: block; }

    .tms-filter-btn {
        padding: 5px 5px;
        border-radius: 5px;
        font-size: 11px;
        font-weight: 700;
        border: 1px solid rgba(61,104,40,0.45);
        background: rgba(0,0,0,0.15);
        color: #90b878;
        cursor: pointer;
        text-align: center;
        transition: all 0.12s;
        user-select: none;
    }
    .tms-filter-btn.active  { background: #3d6828; color: #e8f5d8; border-color: #6cc040; }
    .tms-filter-btn:hover   { background: #2a4a1c; }
    .tms-filter-btn.tms-gk  { color: #4ade80; }
    .tms-filter-btn.tms-de  { color: #60a5fa; }
    .tms-filter-btn.tms-dm  { color: #fbbf24; }
    .tms-filter-btn.tms-mf  { color: #fbbf24; }
    .tms-filter-btn.tms-om  { color: #fb923c; }
    .tms-filter-btn.tms-fw  { color: #f87171; }

    .tms-row { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
    .tms-row:last-child { margin-bottom: 0; }
    .tms-range-row { display: flex; align-items: center; gap: 4px; }
    .tms-range-sep { font-size: 10px; color: #5a7a48; flex-shrink: 0; }
    .tms-lbl { font-size: 10px; color: #8aac72; font-weight: 600; min-width: 30px; letter-spacing: 0.3px; text-transform: uppercase; }
    .tms-sel {
        flex: 1;
        background: rgba(0,0,0,0.25);
        border: 1px solid rgba(42,74,28,0.6);
        border-radius: 4px;
        color: #e8f5d8;
        font-size: 12px;
        font-weight: 600;
        padding: 5px 8px;
        outline: none;
        cursor: pointer;
        font-family: inherit;
        transition: border-color 0.15s;
    }
    .tms-sel:focus { border-color: #6cc040; }

    .tms-check-row { display: flex; align-items: center; gap: 6px; }
    .tms-check-row label { font-size: 11px; color: #90b878; cursor: pointer; }
    .tms-check-row input[type=checkbox] { accent-color: #6cc040; cursor: pointer; }

    .tms-skill-row { display: grid; grid-template-columns: 1fr auto; gap: 4px; margin-bottom: 4px; }
    .tms-skill-row:last-child { margin-bottom: 0; }
    .tms-skill-row .tms-sel { font-size: 10px; }

    .tms-post-note {
        font-size: 9px;
        font-weight: 400;
        color: #4a7a38;
        text-transform: none;
        letter-spacing: 0;
        margin-left: 4px;
    }

    #tms-filter-box {
        background: #162e0e;
        border: 1px solid #3d6828;
        border-radius: 8px;
        padding: 8px;
        margin-bottom: 8px;
    }
    #tms-filter-box .tms-sb-section { margin-bottom: 6px; }
    #tms-filter-box .tms-sb-section:last-of-type { margin-bottom: 8px; }

    /* \u2500\u2500\u2500 Main content \u2500\u2500\u2500 */
    #tms-main,
    .tmvu-transfer-main { flex: 1 1 auto; min-width: 0; position: relative; }
    .tms-spacer { flex: 1; }
    #tms-toolbar {
        position: absolute;
        top: 4px; right: 4px;
        z-index: 5;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        background: rgba(22,46,14,0.92);
        padding: 2px 8px;
        border-radius: 4px;
        pointer-events: none;
    }
    #tms-hits {
        font-size: 12px;
        font-weight: 800;
        color: #80e048;
        font-variant-numeric: tabular-nums;
    }
    #tms-toolbar .tms-toolbar-label {
        font-size: 11px;
        color: #6a9a58;
    }

    /* \u2500\u2500\u2500 Table \u2500\u2500\u2500 */
    .tms-table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid #2a4a1c; }
    .tms-table-wrap::-webkit-scrollbar { height: 4px; }
    .tms-table-wrap::-webkit-scrollbar-track { background: #111; }
    .tms-table-wrap::-webkit-scrollbar-thumb { background: #3d6828; border-radius: 2px; }

    #tms-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
        color: #c8e0b4;
    }
    #tms-table thead tr { border-bottom: 1px solid #2a4a1c;background: rgba(0,0,0,0.2); }
    #tms-table th {
        background: #162e0e;
        color: #6a9a58;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        padding: 6px 8px;
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
        position: sticky;
        top: 0;
        z-index: 2;
        background: #162e0e;
    }
    #tms-table th:hover { color: #c8e0b4; background: #243d18; }
    #tms-table th.sort-asc::after  { content: ' \u25B2'; color: #6cc040; }
    #tms-table th.sort-desc::after { content: ' \u25BC'; color: #6cc040; }
    #tms-table td {
        padding: 4px 7px;
        border-bottom: 1px solid rgba(42,74,28,.4);
        vertical-align: middle;
        white-space: nowrap;
    }
    #tms-table .tms-player-row { background: #1c3410; }
    #tms-table tbody .tms-player-row:nth-child(odd)  { background: #1c3410; }
    #tms-table tbody .tms-player-row:nth-child(even) { background: #162e0e; }
    #tms-table .tms-player-row:hover { background: #243d18 !important; cursor: pointer; }
    #tms-table .tms-player-row.tms-expanded { background: rgba(255,255,255,.07); }

    /* Column-specific */
    .tms-col-flag { width: 24px; text-align: center; }
    .tms-col-name { max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
    .tms-col-name a { color: #80e048; text-decoration: none; font-weight: 600; }
    .tms-col-name a:hover { color: #c8e0b4; text-decoration: underline; }
    .tms-note-icon {
        display: inline-block;
        margin-left: 5px;
        font-size: 11px;
        cursor: default;
        opacity: 0.75;
        vertical-align: middle;
        position: relative;
    }
    .tms-note-icon:hover { opacity: 1; }
    .tms-note-icon::after {
        content: attr(data-note);
        display: none;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: calc(100% + 5px);
        background: #1a2e14;
        border: 1px solid #4a9030;
        border-radius: 5px;
        padding: 5px 8px;
        font-size: 11px;
        color: #c8e0b4;
        white-space: pre-wrap;
        max-width: 260px;
        min-width: 100px;
        word-break: break-word;
        z-index: 100002;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        pointer-events: none;
        line-height: 1.5;
    }
    .tms-note-icon:hover::after { display: block; }
    .tms-col-age  { text-align: center; white-space: nowrap; }
    .tms-col-r    { text-align: right; font-variant-numeric: tabular-nums; }
    .tms-col-c    { text-align: center; }
    .tms-age-y  { font-size: 13px; font-weight: 700; color: #e8f5d8; }
    .tms-age-mo { font-size: 10px; color: #8aac72; margin-left: 1px; }
    .tms-pos {
        font-size: 10px;
        font-weight: 700;
        padding: 1px 3px;
        border-radius: 3px;
        display: inline-block;
    }
    .tms-pos-chip {
        display: inline-block; padding: 1px 6px; border-radius: 4px;
        font-size: 10px; font-weight: 700; letter-spacing: 0.3px;
        line-height: 16px; text-align: center; min-width: 28px;
    }
    .tms-pos-bar { width: 3px; padding: 0 !important; border-radius: 2px; }
    .tms-col-posbar { width: 4px; padding: 0 !important; }
    .tms-rec {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 700;
    }
    [data-transfer-reload] {
        width: 22px;
        height: 22px;
        color: #4a7a38;
        font-size: 13px;
        line-height: 1;
        margin-right: 3px;
        vertical-align: middle;
    }
    [data-transfer-reload].tms-reloading { animation: tms-spin 0.7s linear infinite; pointer-events: none; color: #6cc040; }

    /* Pending tooltip indicator */
    .tms-tip-pending {
        color: #4a5a40;
        font-size: 10px;
        animation: tms-pending-blink 1.2s ease-in-out infinite;
    }
    @keyframes tms-pending-blink { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }

    /* Skill columns (skills mode) */
    .tms-skill { text-align: center; padding: 4px 2px !important; }
    .tms-skill0 { color: #4a5a40; font-size: 10px; }
    .tms-bar-wrap { display: flex; align-items: center; gap: 3px; min-width: 38px; }
    .tms-bar { height: 8px; border-radius: 2px; min-width: 2px; flex-shrink: 0; }
    .tms-bar-wrap span { font-size: 10px; min-width: 12px; }

    /* \u2500\u2500\u2500 Expanded row \u2500\u2500\u2500 */
    tr.tms-expand-row td { padding: 12px 10px !important; background: #1c3410 !important; cursor: default; }
    .tms-expand-inner { display: flex; gap: 20px; flex-wrap: wrap; }
    .tms-expand-skills { flex: 1; min-width: 240px; }
    .tms-expand-analysis { width: 215px; min-width: 190px; }
    .tms-exp-head {
        font-size: 9px;
        font-weight: 700;
        color: #6a9a58;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        margin-bottom: 8px;
    }
    .tms-skill-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
    .tms-skill-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 5px 2px;
        background: rgba(0,0,0,0.25);
        border-radius: 4px;
        border: 1px solid rgba(61,104,40,0.3);
    }
    .tms-sk-name { font-size: 9px; color: #6a9a58; text-transform: uppercase; }
    .tms-sk-bar  { width: 100%; height: 5px; background: rgba(0,0,0,0.3); border-radius: 2px; overflow: hidden; }
    .tms-sk-fill { height: 100%; border-radius: 2px; }
    .tms-sk-val  { font-size: 12px; font-weight: 700; }
    .tms-an-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        border-bottom: 1px solid rgba(61,104,40,0.2);
        font-size: 11px;
    }
    .tms-an-row:last-child { border-bottom: none; }
    .tms-an-lbl { color: #6a9a58; font-weight: 600; }
    .tms-an-val { color: #c8e0b4; font-weight: 700; font-variant-numeric: tabular-nums; }

    /* \u2500\u2500\u2500 Loading / empty \u2500\u2500\u2500 */
    #tms-loading { text-align: center; padding: 50px 20px; color: #6a9a58; font-size: 13px; }
    .tms-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #3d6828;
        border-top-color: #6cc040;
        border-radius: 50%;
        animation: tms-spin 0.7s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
    }
    @keyframes tms-spin { to { transform: rotate(360deg); } }

    /* \u2500\u2500\u2500 Player row tooltip \u2500\u2500\u2500 */
    .tms-player-tip {
        position: fixed; z-index: 100001;
        background: linear-gradient(135deg, #1a2e14 0%, #243a1a 100%);
        border: 1px solid #4a9030; border-radius: 8px;
        padding: 10px 12px; min-width: 220px; max-width: 280px;
        box-shadow: 0 6px 24px rgba(0,0,0,0.6);
        pointer-events: none; font-size: 11px; color: #c8e0b4;
        opacity: 0; transition: opacity .15s ease;
    }
    .tms-player-tip.visible { opacity: 1; }
    .tms-player-tip-header {
        display: flex; align-items: flex-start; gap: 8px;
        margin-bottom: 8px; padding-bottom: 6px;
        border-bottom: 1px solid rgba(74,144,48,0.3);
    }
    .tms-player-tip-name { font-size: 13px; font-weight: 700; color: #e0f0cc; }
    .tms-player-tip-pos { font-size: 10px; color: #8abc78; font-weight: 600; margin-top: 2px; }
    .tms-player-tip-badges { display: flex; flex-direction: column; gap: 3px; margin-left: auto; align-items: flex-end; }
    .tms-player-tip-badge { font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 4px; background: rgba(0,0,0,0.3); }
    .tms-player-tip-skills { display: flex; gap: 12px; margin-bottom: 6px; }
    .tms-player-tip-skills-col { flex: 1; min-width: 0; }
    .tms-player-tip-skill {
        display: flex; justify-content: space-between;
        padding: 1px 0; border-bottom: 1px solid rgba(74,144,48,0.12);
    }
    .tms-player-tip-skill-name { color: #8abc78; font-size: 10px; }
    .tms-player-tip-skill-val { font-weight: 700; font-size: 11px; }
    .tms-player-tip-footer {
        display: flex; gap: 6px; justify-content: center;
        padding-top: 6px; border-top: 1px solid rgba(74,144,48,0.3);
    }
    .tms-player-tip-stat { text-align: center; }
    .tms-player-tip-stat-val { font-size: 13px; font-weight: 800; }
    .tms-player-tip-stat-lbl { font-size: 9px; color: #6a9a58; text-transform: uppercase; letter-spacing: 0.3px; }

    /* \u2500\u2500\u2500 Websocket-compatible watched rows \u2500\u2500\u2500 */
    #tms-table tr.tms-bump td             { background: rgba(255,200,40,0.10) !important; }
    #tms-table tr.tms-bump a              { color: #ffe680; }
    #tms-table tr.watched-player td           { background: rgba(108,192,64,0.18) !important; }
    #tms-table tr.watched-player-currentbid td{ background: rgba(0,220,110,0.25) !important; box-shadow: inset 0 0 0 1px #00e676; }
    #tms-table tr.watched-player-outbid td   { background: rgba(255,60,40,0.2) !important; box-shadow: inset 0 0 0 1px #ff4c4c; }
    #tms-table tr.watched-player a           { color: #e8f5d8; }

    /* \u2500\u2500\u2500 Time cell \u2500\u2500\u2500 */
    .tms-time-cell { position: relative; text-align: right; }
    .tms-time-cell::after {
        content: '';
        background: url(/pics/ultra2/clock2.png) no-repeat center;
        background-size: contain;
        display: inline-block;
        width: 13px; height: 13px;
        vertical-align: text-bottom;
        margin-left: 2px;
    }
    .tms-time-cell .countdown-split-seconds,
    .tms-time-cell .countdown-split-minutes,
    .tms-time-cell .countdown-split-hours {
        width: 18px; text-align: left; padding-left: 2px;
    }

    /* \u2500\u2500\u2500 Hide TM's page content, our UI lives directly on body \u2500\u2500\u2500 */
    #right_col, .column3_a, .column3_b, .column2_a { display: none !important; }

    /* \u2500\u2500\u2500 Custom modal \u2500\u2500\u2500 */
    #tms-modal-overlay {
        position: fixed; inset: 0; z-index: 200000;
        background: rgba(0,0,0,0.78);
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(3px);
    }
    .tms-modal {
        background: linear-gradient(160deg, #1a2e14 0%, #0e1e0a 100%);
        border: 1px solid #4a9030;
        border-radius: 12px;
        padding: 28px 24px 20px;
        max-width: 440px;
        width: calc(100% - 40px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(74,144,48,0.15);
        color: #c8e0b4;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .tms-modal-icon { font-size: 30px; margin-bottom: 10px; line-height: 1; }
    .tms-modal-title { font-size: 15px; font-weight: 800; color: #e0f0cc; margin-bottom: 8px; }
    .tms-modal-msg { font-size: 12px; color: #90b878; line-height: 1.65; margin-bottom: 22px; }
            `;
      const el2 = document.createElement("style");
      el2.id = "tms-style";
      el2.textContent = css;
      document.head.appendChild(el2);
    }
  };

  // src/lib/tm-lib.js
  var {
    WEIGHT_R5: WEIGHT_R52,
    WEIGHT_RB: WEIGHT_RB2,
    WAGE_RATE: WAGE_RATE2,
    _TRAINING1: _TRAINING12,
    _SEASON_DAYS: _SEASON_DAYS2,
    POS_MULTIPLIERS: POS_MULTIPLIERS2,
    ASI_WEIGHT_OUTFIELD: ASI_WEIGHT_OUTFIELD2,
    ASI_WEIGHT_GK: ASI_WEIGHT_GK2,
    TRAINING_GROUPS_OUT: TRAINING_GROUPS_OUT2,
    TRAINING_GROUPS_GK: TRAINING_GROUPS_GK2,
    ROUTINE_DECAY: ROUTINE_DECAY2
  } = TmConst;
  var { ageToMonths: ageToMonths2, monthsToAge: monthsToAge2 } = TmUtils;
  var _fix2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
  var _sv = (s) => {
    var _a;
    return typeof s === "object" && s !== null ? (_a = s.value) != null ? _a : 0 : Number(s);
  };
  var _calcRemainderRaw = (posIdx, skills, asi) => {
    const weight = posIdx === 9 ? ASI_WEIGHT_GK2 : ASI_WEIGHT_OUTFIELD2;
    const skillSum = skills.reduce((s, v) => s + parseFloat(v), 0);
    const remainder = Math.round((Math.pow(2, Math.log(weight * asi) / Math.log(128)) - skillSum) * 10) / 10;
    let rec = 0, ratingR = 0, rW1 = 0, rW2 = 0, not20 = 0;
    for (let i = 0; i < WEIGHT_RB2[posIdx].length; i++) {
      rec += skills[i] * WEIGHT_RB2[posIdx][i];
      ratingR += skills[i] * WEIGHT_R52[posIdx][i];
      if (skills[i] !== 20) {
        rW1 += WEIGHT_RB2[posIdx][i];
        rW2 += WEIGHT_R52[posIdx][i];
        not20++;
      }
    }
    if (remainder / not20 > 0.9 || !not20) {
      not20 = posIdx === 9 ? 11 : 14;
      rW1 = 1;
      rW2 = 5;
    }
    return { remainder, remainderW2: rW2, not20, ratingR, rec: parseFloat(_fix2((rec + remainder * rW1 / not20 - 2) / 3)) };
  };
  var calcR5 = (posIdx, skills, asi, rou) => {
    const r = _calcRemainderRaw(posIdx, skills, asi);
    const { pow, E } = Math;
    const routineBonus = 3 / 100 * (100 - 100 * pow(E, -(rou || 0) * 0.035));
    let rating = parseFloat(_fix2(r.ratingR + r.remainder * r.remainderW2 / r.not20 + routineBonus * 5));
    const goldstar = skills.filter((s) => s === 20).length;
    const denom = skills.length - goldstar || 1;
    const skillsB = skills.map((s) => s === 20 ? 20 : s + r.remainder / denom);
    const sr = skillsB.map((s, i) => i === 1 ? s : s + routineBonus);
    if (skills.length !== 11) {
      const hb = sr[10] > 12 ? parseFloat(_fix2((pow(E, (sr[10] - 10) ** 3 / 1584.77) - 1) * 0.8 + pow(E, sr[0] ** 2 * 7e-3 / 8.73021) * 0.15 + pow(E, sr[6] ** 2 * 7e-3 / 8.73021) * 0.05)) : 0;
      const fk = parseFloat(_fix2(pow(E, (sr[13] + sr[12] + sr[9] * 0.5) ** 2 * 2e-3) / 327.92526));
      const ck = parseFloat(_fix2(pow(E, (sr[13] + sr[8] + sr[9] * 0.5) ** 2 * 2e-3) / 983.6577));
      const pk = parseFloat(_fix2(pow(E, (sr[13] + sr[11] + sr[9] * 0.5) ** 2 * 2e-3) / 1967.31409));
      const ds = sr[0] ** 2 + sr[1] ** 2 * 0.5 + sr[2] ** 2 * 0.5 + sr[3] ** 2 + sr[4] ** 2 + sr[5] ** 2 + sr[6] ** 2;
      const os = sr[0] ** 2 * 0.5 + sr[1] ** 2 * 0.5 + sr[2] ** 2 + sr[3] ** 2 + sr[4] ** 2 + sr[5] ** 2 + sr[6] ** 2;
      const m = POS_MULTIPLIERS2[posIdx];
      return parseFloat(_fix2(rating + hb + fk + ck + pk + parseFloat(_fix2(ds / 6 / 22.9 ** 2)) * m + parseFloat(_fix2(os / 6 / 22.9 ** 2)) * m));
    }
    return parseFloat(_fix2(rating));
  };
  var calcRec = (posIdx, skills, asi) => _calcRemainderRaw(posIdx, skills, asi).rec;
  var calculatePlayerR5 = (position, player) => {
    console.log("[calculatePlayerR5] calculating R5 for position", position, "player", player);
    return calcR5(position.id, player.skills.map(_sv), player.asi, player.routine || 0).toFixed(2);
  };
  var calculatePlayerREC = (position, player) => calcRec(position.id, player.skills.map(_sv), player.asi).toFixed(2);
  var _getCurrentSession = () => {
    const now = /* @__PURE__ */ new Date();
    let day = (now.getTime() - _TRAINING12.getTime()) / 1e3 / 3600 / 24;
    while (day > _SEASON_DAYS2 - 16 / 24) day -= _SEASON_DAYS2;
    const s = Math.floor(day / 7) + 1;
    return s <= 0 ? 12 : s;
  };
  var calculateTIPerSession = (player) => {
    const totalTI = calculateTI(player);
    const session = _getCurrentSession();
    return totalTI !== null && session > 0 ? Number((totalTI / session).toFixed(1)) : null;
  };
  var calculateTI = (player) => {
    const { asi, wage, isGK } = player;
    if (!asi || !wage || wage <= TmConst.MIN_WAGE_FOR_TI) return null;
    const w = isGK ? ASI_WEIGHT_GK2 : ASI_WEIGHT_OUTFIELD2;
    const { pow, log, round } = Math;
    const log27 = log(pow(2, 7));
    return round((pow(2, log(w * asi) / log27) - pow(2, log(w * wage / WAGE_RATE2) / log27)) * 10);
  };
  var calcASIProjection = ({ player, trainings, avgTI }) => {
    const { asi, isGK = false, ageMonths = 0 } = player;
    const K = ASI_WEIGHT_OUTFIELD2;
    const base = Math.pow(asi * K, 1 / 7);
    const added = avgTI * trainings / 10;
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
      agentDiff: futAgentVal - curAgentVal
    };
  };
  var calcSkillDecimalsSimple = (player) => {
    const K = player.isGK ? ASI_WEIGHT_GK2 : ASI_WEIGHT_OUTFIELD2;
    if (!Array.isArray(player.skills)) {
      console.error("[calcSkillDecimalsSimple] player.skills missing or not array", player);
      return [];
    }
    const nums = player.skills.map((v) => typeof v === "object" && v !== null ? parseFloat(v.value) || 0 : parseFloat(v) || 0);
    const allSum = nums.reduce((s, v) => s + v, 0);
    const remainder = Math.round((Math.pow(2, Math.log(K * player.asi) / Math.log(128)) - allSum) * 10) / 10;
    const nonStar = nums.filter((v) => v < 20).length;
    if (remainder <= 0) return nums;
    if (nonStar === 0) return nums.map((v) => v + remainder / nums.length);
    return nums.map((v) => v === 20 ? 20 : v + remainder / nonStar);
  };
  var fillMissingMonths = (records) => {
    const keys = Object.keys(records).sort((a, b) => ageToMonths2(a) - ageToMonths2(b));
    const intSkills = (r) => r.skills.map((v) => Math.floor(typeof v === "string" ? parseFloat(v) : v));
    for (let idx = 0; idx < keys.length - 1; idx++) {
      const aM = ageToMonths2(keys[idx]);
      const bM = ageToMonths2(keys[idx + 1]);
      const gap = bM - aM;
      if (gap <= 1) continue;
      const rA = records[keys[idx]], rB = records[keys[idx + 1]];
      const siA = parseInt(rA.SI) || 0, siB = parseInt(rB.SI) || 0;
      const skA = intSkills(rA), skB = intSkills(rB);
      for (let step = 1; step < gap; step++) {
        const t = step / gap;
        const interpKey = monthsToAge2(aM + step);
        if (records[interpKey]) continue;
        records[interpKey] = {
          SI: Math.round(siA + (siB - siA) * t),
          REREC: null,
          R5: null,
          skills: skA.map((sa, i) => sa + Math.floor((skB[i] - sa) * t)),
          _estimated: true
        };
      }
    }
  };
  var calcSkillDecimals = (intSkills, asi, isGK, gw) => {
    const N = intSkills.length;
    const GRP = isGK ? TRAINING_GROUPS_GK2 : TRAINING_GROUPS_OUT2;
    const GRP_COUNT = GRP.length;
    if (!gw) gw = new Array(GRP_COUNT).fill(1 / GRP_COUNT);
    const KASIW = isGK ? ASI_WEIGHT_GK2 : ASI_WEIGHT_OUTFIELD2;
    const totalPts = Math.pow(2, Math.log(KASIW * asi) / Math.log(128));
    const remainder = totalPts - intSkills.reduce((a, b) => a + b, 0);
    const eff = TmUtils.skillEff;
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
    const nonMax = intSkills.filter((v) => v < 20).length;
    const ovfEach = nonMax > 0 ? overflow / nonMax : 0;
    const wE = base.map((b, i) => intSkills[i] >= 20 ? 0 : (b + ovfEach) * eff(intSkills[i]));
    const tot = wE.reduce((a, b) => a + b, 0);
    const shares = tot > 0 ? wE.map((x) => x / tot) : new Array(N).fill(nonMax > 0 ? 1 / nonMax : 0);
    let dec = shares.map((s) => Math.max(0, remainder * s));
    const CAP = 0.99;
    let passes = 0;
    do {
      let ovfl = 0, freeCount = 0;
      for (let i = 0; i < N; i++) {
        if (intSkills[i] >= 20) {
          dec[i] = 0;
          continue;
        }
        if (dec[i] > CAP) {
          ovfl += dec[i] - CAP;
          dec[i] = CAP;
        } else if (dec[i] < CAP) freeCount++;
      }
      if (ovfl > 1e-4 && freeCount > 0) {
        const add = ovfl / freeCount;
        for (let i = 0; i < N; i++) if (intSkills[i] < 20 && dec[i] < CAP) dec[i] += add;
      } else break;
    } while (++passes < 20);
    return intSkills.map((v, i) => v >= 20 ? 20 : v + dec[i]);
  };
  var computeGrowthDecimals = (records, ageKeys, player, gw) => {
    const N = player.isGK ? 11 : 14;
    const GRP = player.isGK ? TRAINING_GROUPS_GK2 : TRAINING_GROUPS_OUT2;
    const GRP_COUNT = GRP.length;
    const ASI_WEIGHT = player.isGK ? ASI_WEIGHT_GK2 : ASI_WEIGHT_OUTFIELD2;
    const totalPts = (si) => Math.pow(2, Math.log(ASI_WEIGHT * (si || 0)) / Math.log(128));
    const eff = TmUtils.skillEff;
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
      const nonMax = intS.filter((v) => v < 20).length;
      const ovfEach = nonMax > 0 ? overflow / nonMax : 0;
      const w = base.map((b, i) => intS[i] >= 20 ? 0 : b + ovfEach);
      const wE = w.map((wi, i) => wi * eff(intS[i]));
      const tot = wE.reduce((a, b) => a + b, 0);
      return tot > 0 ? wE.map((x) => x / tot) : new Array(N).fill(0);
    };
    const capDecimals = (decArr, intArr) => {
      const CAP = 0.99;
      const d = [...decArr];
      let overflow = 0, passes = 0;
      do {
        overflow = 0;
        let freeCount = 0;
        for (let i = 0; i < N; i++) {
          if (intArr[i] >= 20) {
            d[i] = 0;
            continue;
          }
          if (d[i] > CAP) {
            overflow += d[i] - CAP;
            d[i] = CAP;
          } else if (d[i] < CAP) freeCount++;
        }
        if (overflow > 1e-4 && freeCount > 0) {
          const add = overflow / freeCount;
          for (let i = 0; i < N; i++) {
            if (intArr[i] < 20 && d[i] < CAP) d[i] += add;
          }
        }
      } while (overflow > 1e-4 && ++passes < 20);
      return d;
    };
    const safeSkills = (skills) => skills.map((v) => {
      const n = typeof v === "object" ? v.value : v;
      return isFinite(n) ? Math.floor(n) : 0;
    });
    const result = {};
    const r0 = records[ageKeys[0]];
    const rem0 = totalPts(r0.SI) - safeSkills(r0.skills).reduce((a, b) => a + b, 0);
    let dec = capDecimals(calcShares(safeSkills(r0.skills)).map((s) => Math.max(0, rem0 * s)), safeSkills(r0.skills));
    result[ageKeys[0]] = dec;
    for (let m = 1; m < ageKeys.length; m++) {
      const prevKey = ageKeys[m - 1], currKey = ageKeys[m];
      const piSkills = safeSkills(records[prevKey].skills), ciSkills = safeSkills(records[currKey].skills);
      const ptg = totalPts(records[prevKey].SI), ctg = totalPts(records[currKey].SI);
      const delta = ctg - ptg;
      const cRem = ctg - ciSkills.reduce((a, b) => a + b, 0);
      const gains = calcShares(piSkills).map((s) => delta * s);
      let newDec = dec.map((d, i) => d + gains[i]);
      for (let i = 0; i < N; i++) {
        const chg = ciSkills[i] - piSkills[i];
        if (chg > 0) {
          newDec[i] -= chg;
          if (newDec[i] < 0) newDec[i] = 0;
        }
        if (ciSkills[i] >= 20) newDec[i] = 0;
      }
      const ndSum = newDec.reduce((a, b) => a + b, 0);
      if (ndSum > 1e-3) {
        const scale = cRem / ndSum;
        dec = capDecimals(newDec.map((d, i) => ciSkills[i] >= 20 ? 0 : d * scale), ciSkills);
      } else {
        dec = capDecimals(calcShares(ciSkills).map((s) => Math.max(0, cRem * s)), ciSkills);
      }
      result[currKey] = dec;
    }
    return result;
  };
  var buildRoutineMap = (liveRou, liveAgeY, liveAgeM, gpData, ageKeys) => {
    const map = {};
    if (!gpData) {
      ageKeys.forEach((k) => {
        map[k] = liveRou;
      });
      return map;
    }
    const { gpBySeason, curSeason } = gpData;
    const curWeek = _getCurrentSession();
    const curAgeMonths = liveAgeY * 12 + liveAgeM;
    for (const ageKey of ageKeys) {
      const recMon = ageToMonths2(ageKey);
      const weeksBack = curAgeMonths - recMon;
      if (weeksBack <= 0) {
        map[ageKey] = liveRou;
        continue;
      }
      let gamesAfter = 0;
      for (let w = 0; w < weeksBack; w++) {
        const absWeek = (curSeason - 65) * 12 + (curWeek - 1) - w;
        const season = 65 + Math.floor(absWeek / 12);
        const gp = gpBySeason[season] || 0;
        gamesAfter += season === curSeason ? curWeek > 0 ? gp / curWeek : 0 : gp / 12;
      }
      map[ageKey] = Math.max(0, Math.round((liveRou - gamesAfter * ROUTINE_DECAY2) * 10) / 10);
    }
    return map;
  };
  var getPositionIndex = (pos) => {
    const p = (pos || "").split(",")[0].toLowerCase().replace(/[^a-z]/g, "");
    switch (p) {
      case "gk":
        return 9;
      case "dc":
      case "dcl":
      case "dcr":
        return 0;
      case "dl":
      case "dr":
        return 1;
      case "dmc":
      case "dmcl":
      case "dmcr":
        return 2;
      case "dml":
      case "dmr":
        return 3;
      case "mc":
      case "mcl":
      case "mcr":
        return 4;
      case "ml":
      case "mr":
        return 5;
      case "omc":
      case "omcl":
      case "omcr":
        return 6;
      case "oml":
      case "omr":
        return 7;
      default:
        return 8;
    }
  };
  var TmLib = {
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
    calculateTIPerSession
  };

  // src/components/transfer/tm-transfer-table.js
  var SKILL_NAMES = TmConst.SKILL_LABELS;
  var GK_SKILLS = TmConst.SKILL_KEYS_GK;
  var OUTFIELD_SKILLS = TmConst.SKILL_KEYS_OUT;
  var POSITION_MAP2 = TmConst.POSITION_MAP || {};
  var SKILL_LONG = {
    str: "Strength",
    sta: "Stamina",
    pac: "Pace",
    mar: "Marking",
    tac: "Tackling",
    wor: "Workrate",
    pos: "Positioning",
    pas: "Passing",
    cro: "Crossing",
    tec: "Technique",
    hea: "Heading",
    fin: "Finishing",
    lon: "Longshots",
    set: "Set Pieces",
    han: "Handling",
    one: "One on ones",
    ref: "Reflexes",
    ari: "Aerial",
    jum: "Jumping",
    com: "Communication",
    kic: "Kicking",
    thr: "Throwing"
  };
  var BREAKDOWN_COLS = [
    { key: "posbar", label: "", sort: false, cls: "tms-col-posbar" },
    { key: "flag", label: "", sort: false, cls: "tms-col-flag" },
    { key: "name", label: "Name", sort: true, cls: "tms-col-name" },
    { key: "age", label: "Age", sort: true, cls: "tms-col-age" },
    { key: "fp", label: "Pos", sort: false, cls: "tms-col-c" },
    { key: "r5", label: "R5", sort: true, cls: "tms-col-r" },
    { key: "rec", label: "Rec", sort: true, cls: "tms-col-c" },
    { key: "ti", label: "TI", sort: true, cls: "tms-col-r" },
    { key: "asi", label: "ASI", sort: true, cls: "tms-col-r" },
    { key: "bid", label: "Bid", sort: true, cls: "tms-col-r" },
    { key: "time", label: "Time", sort: true, cls: "tms-col-r" },
    { key: "act", label: "", sort: false, cls: "" }
  ];
  var getColor2 = TmUtils.getColor;
  function fmtNum(n) {
    return TmUtils.fmtCoins(n);
  }
  function fmtRec(val) {
    const { REC_THRESHOLDS: REC_THRESHOLDS2 } = TmConst;
    if (val == null || val === "") return '<span style="color:#4a5a40">\u2014</span>';
    const num = parseFloat(val);
    const disp = Number.isInteger(num) ? String(num) : num.toFixed(2);
    const clr = getColor2(num, REC_THRESHOLDS2);
    return `<span class="tms-rec" style="background:rgba(0,0,0,0.25);border:1px solid ${clr}44;color:${clr}">${disp}</span>`;
  }
  function tiHtml(ti) {
    const { TI_THRESHOLDS: TI_THRESHOLDS2 } = TmConst;
    if (ti === null || ti === void 0) return '<span style="color:#4a5a40">\u2014</span>';
    const clr = getColor2(ti, TI_THRESHOLDS2);
    return `<span style="color:${clr};font-weight:700">${ti.toFixed(1)}</span>`;
  }
  function fmtR5(r5) {
    const { R5_THRESHOLDS: R5_THRESHOLDS2 } = TmConst;
    if (r5 == null) return '<span class="tms-tip-pending">\u2026</span>';
    const clr = getColor2(r5, R5_THRESHOLDS2);
    return `<span style="color:${clr};font-weight:700">${r5.toFixed(1)}</span>`;
  }
  function fmtAge(ageFloat) {
    const years = Math.floor(ageFloat);
    const months = Math.round((ageFloat - years) * 100);
    return `<span class="tms-age-y">${years}.${months}</span>`;
  }
  function fmtPos(fp) {
    if (!fp || !fp.length) return "-";
    const sorted = [...fp].sort((a, b) => TmLib.getPositionIndex(a) - TmLib.getPositionIndex(b));
    return TmPosition.chip(sorted);
  }
  var skillColor2 = TmUtils.skillColor;
  function skillCell(val) {
    if (!val || val <= 0) return `<td class="tms-skill tms-skill0">-</td>`;
    const pct = val / 20 * 100;
    const clr = skillColor2(val);
    return `<td class="tms-skill"><div class="tms-bar-wrap"><div class="tms-bar" style="width:${pct}%;background:${clr}"></div><span>${val}</span></div></td>`;
  }
  function fmtR5Range(lo, hi) {
    const { R5_THRESHOLDS: R5_THRESHOLDS2 } = TmConst;
    if (lo == null || hi == null) return '<span class="tms-tip-pending">\u2026</span>';
    const loFixed = lo.toFixed(1), hiFixed = hi.toFixed(1);
    const clrLo = getColor2(lo, R5_THRESHOLDS2);
    const clrHi = getColor2(hi, R5_THRESHOLDS2);
    if (loFixed === hiFixed)
      return `<span style="color:${clrHi};font-weight:700;opacity:0.75">${hiFixed}</span>`;
    return `<span style="opacity:0.75"><span style="color:${clrLo};font-weight:700;font-size:10px">${loFixed}</span><span style="color:#4a6a38;font-size:9px">\u2013</span><span style="color:${clrHi};font-weight:700;font-size:10px">${hiFixed}</span></span>`;
  }
  function buildBidBtn(p, tooltipCache) {
    const nameJs = (p.name_js || p.name || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    const fetched = tooltipCache[p.id] && !tooltipCache[p.id].estimated;
    const reloadBtn = fetched ? "" : TmUI.button({
      label: "\u21BB",
      variant: "icon",
      color: "secondary",
      title: "Fetch stats",
      attrs: { "data-pid": p.id, "data-transfer-reload": "" }
    }).outerHTML;
    const bidBtn = TmUI.button({
      label: "Bid",
      color: "secondary",
      size: "xs",
      title: "Place Bid",
      attrs: {
        onclick: `event.stopPropagation();tlpop_pop_transfer_bid('${p.next_bid || 0}',${p.pro || 0},'${p.id}','${nameJs}')`
      }
    }).outerHTML;
    return `${reloadBtn}${bidBtn}`;
  }
  function buildPlayerRow(p, tooltipCache) {
    const nameLink = `<a href="/players/${p.id}/" target="_blank" onclick="event.stopPropagation()">${p.name || p.id}</a>`;
    const timeId = `tms-td-${p.id}`;
    const timeTd = p.time > 0 ? `<span id="${timeId}" class="tms-time-cell"></span>` : "\u2014";
    const bidCls = `bid_${p.id}`;
    const cachedTip = tooltipCache[p.id];
    const recHtml = cachedTip ? fmtRec(cachedTip.recCalc != null ? cachedTip.recCalc : cachedTip.recSort) : fmtRec(p.rec);
    const barClr = p.fp && p.fp.length ? (() => {
      var _a, _b;
      const str = p.fp[0];
      if (str === "gk") return "#4ade80";
      const pos = str.replace(/[lcrk]$/, "");
      return ((_a = POSITION_MAP2[str]) == null ? void 0 : _a.color) || ((_b = POSITION_MAP2[pos]) == null ? void 0 : _b.color) || "#4a5a40";
    })() : "#4a5a40";
    const noteIcon = p.txt ? `<span class="tms-note-icon" data-note="${p.txt.replace(/"/g, "&quot;")}">\u{1F4CB}</span>` : "";
    return `<tr class="tms-player-row${p.bump ? " tms-bump" : ""}" id="player_row_${p.id}" data-pid="${p.id}">
  <td class="tms-pos-bar" style="background:${barClr}"></td>
  <td class="tms-col-flag">${p.flag || ""}</td>
  <td class="tms-col-name">${nameLink}</td>
  <td class="tms-col-age">${fmtAge(p.age)}</td>
  <td class="tms-col-c">${fmtPos(p.fp)}</td>
  <td class="tms-col-r" id="tms-r5-${p.id}">${cachedTip && cachedTip.r5 != null ? fmtR5(cachedTip.r5) : cachedTip && (cachedTip.r5Lo != null || cachedTip.r5Hi != null) ? fmtR5Range(cachedTip.r5Lo, cachedTip.r5Hi) : '<span class="tms-tip-pending">\u2026</span>'}</td>
  <td class="tms-col-c" id="tms-rec-${p.id}">${recHtml}</td>
  <td class="tms-col-r" id="tms-ti-${p.id}">${cachedTip ? tiHtml(cachedTip.ti) : '<span class="tms-tip-pending">\u2026</span>'}</td>
  <td class="tms-col-r" style="color:#e0f0cc">${p.asi ? fmtNum(p.asi) : "\u2014"}</td>
  <td class="tms-col-r ${bidCls}">${fmtNum(p.bid) || "\u2014"}</td>
  <td class="tms-col-r">${timeTd}</td>
  <td>${buildBidBtn(p, tooltipCache)}${noteIcon}</td>
</tr>`;
  }
  function thSortClass(currentSortKey, currentSortDir, key) {
    if (currentSortKey !== key) return "";
    return currentSortDir === 1 ? " sort-asc" : " sort-desc";
  }
  function createBreakdownTableElement(players, sortKey, sortDir, tooltipCache, onSort) {
    const wrap = document.createElement("div");
    const thCols = BREAKDOWN_COLS.map((c) => {
      if (!c.sort) return `<th class="${c.cls || ""}">${c.label}</th>`;
      return `<th data-sort="${c.key}" class="${c.cls || ""} ${thSortClass(sortKey, sortDir, c.key)}">${c.label}</th>`;
    }).join("");
    wrap.innerHTML = `<div class="tms-table-wrap"><table id="tms-table"><thead><tr>${thCols}</tr></thead><tbody>${players.map((p) => buildPlayerRow(p, tooltipCache)).join("")}</tbody></table></div>`;
    if (typeof onSort === "function") {
      wrap.querySelectorAll("#tms-table th[data-sort]").forEach((th) => {
        th.addEventListener("click", () => onSort(th.dataset.sort));
      });
    }
    return wrap.firstElementChild;
  }
  function createSkillsTableElement(skillKeys, skillLabels, sortKey, sortDir, onSort) {
    const wrap = document.createElement("div");
    const thSkills = skillKeys.map((skillKey) => `<th>${skillLabels[skillKey]}</th>`).join("");
    wrap.innerHTML = `<div class="tms-table-wrap"><table id="tms-table"><thead><tr><th class="tms-col-posbar"></th><th class="tms-col-flag"></th><th data-sort="name" class="${thSortClass(sortKey, sortDir, "name")}">Name</th><th data-sort="age" class="${thSortClass(sortKey, sortDir, "age")}">Age</th><th>Pos</th>${thSkills}<th data-sort="time" class="${thSortClass(sortKey, sortDir, "time")}">Time</th><th></th></tr></thead></table></div>`;
    if (typeof onSort === "function") {
      wrap.querySelectorAll("#tms-table th[data-sort]").forEach((th) => {
        th.addEventListener("click", () => onSort(th.dataset.sort));
      });
    }
    return wrap.firstElementChild;
  }
  function buildExpandRow(p, tooltipCache, colCount, skillsMode) {
    const gk = p._gk;
    const skills = gk ? GK_SKILLS : OUTFIELD_SKILLS;
    const ss = p._ss;
    const ageP = p._ageP;
    const tip = tooltipCache[p.id];
    const skillCells = skills.map((s) => {
      const val = tip && tip.skills && tip.skills[s] != null ? tip.skills[s] : p[s] || 0;
      const pct = val / 20 * 100;
      const clr = skillColor2(val);
      return `<div class="tms-skill-cell">
  <span class="tms-sk-name">${SKILL_NAMES[s]}</span>
  <div class="tms-sk-bar"><div class="tms-sk-fill" style="width:${pct}%;background:${clr}"></div></div>
  <span class="tms-sk-val" style="color:${clr}">${val || "\u2014"}</span>
</div>`;
    }).join("");
    const bidN = fmtNum(p.bid);
    const recDisp = tip ? fmtRec(tip.recCalc != null ? tip.recCalc : tip.recSort) : fmtRec(p.rec);
    const r5Disp = tip ? tip.r5 != null ? fmtR5(tip.r5) : fmtR5Range(tip.r5Lo, tip.r5Hi) : '<span style="color:#4a5a40">Loading\u2026</span>';
    const tiDisp = tip ? tiHtml(tip.ti) : '<span style="color:#4a5a40">Loading\u2026</span>';
    const skillNote = tip ? "(from tooltip)" : "(transfer list stars)";
    return `<tr class="tms-expand-row">
  <td colspan="${colCount}">
    <div class="tms-expand-inner">
      <div class="tms-expand-skills">
        <div class="tms-exp-head">Skills \u2014 ${ss.count}/${ss.total} scouted &nbsp;<span style="font-weight:400;color:#4a5a40">${skillNote}</span></div>
        <div class="tms-skill-grid">${skillCells}</div>
      </div>
      <div class="tms-expand-analysis">
        <div class="tms-exp-head">Analysis</div>
        <div class="tms-an-row"><span class="tms-an-lbl">Age</span><span class="tms-an-val">${ageP.years}.${ageP.months}</span></div>
        <div class="tms-an-row"><span class="tms-an-lbl">ASI</span><span class="tms-an-val">${p.asi ? fmtNum(p.asi) : "\u2014"}</span></div>
        <div class="tms-an-row"><span class="tms-an-lbl">Rec</span><span class="tms-an-val">${recDisp}</span></div>
        <div class="tms-an-row"><span class="tms-an-lbl">R5</span><span class="tms-an-val">${r5Disp}</span></div>
        <div class="tms-an-row"><span class="tms-an-lbl">TI / session</span><span class="tms-an-val">${tiDisp}</span></div>
        <div class="tms-an-row"><span class="tms-an-lbl">Current Bid</span><span class="tms-an-val">${bidN}</span></div>
        <div class="tms-an-row"><span class="tms-an-lbl">Position</span><span class="tms-an-val">${(p.fp || []).join(", ")}</span></div>
        <div class="tms-an-row"><span class="tms-an-lbl">Type</span><span class="tms-an-val">${gk ? "Goalkeeper" : "Outfield"}</span></div>
      </div>
    </div>
  </td>
</tr>`;
  }
  function adaptForTooltip(p, tooltipCache) {
    const { R5_THRESHOLDS: R5_THRESHOLDS2, REC_THRESHOLDS: REC_THRESHOLDS2, TI_THRESHOLDS: TI_THRESHOLDS2 } = TmConst;
    const tip = tooltipCache[p.id];
    const gk = p._gk;
    const skillKeys = gk ? GK_SKILLS : OUTFIELD_SKILLS;
    const ageP = p._ageP || {};
    const positions = (p.fp || []).map((s) => {
      if (s === "gk") return { position: "GK" };
      const side = s.slice(-1);
      const base = s.slice(0, s.length - 1);
      const sl = { l: "L", c: "C", r: "R", k: "" }[side] || "";
      return { position: base.toUpperCase() + sl };
    });
    const skills = skillKeys.map((key) => {
      var _a;
      return {
        name: SKILL_LONG[key] || key,
        value: tip && tip.skills ? (_a = tip.skills[key]) != null ? _a : null : null
      };
    });
    const recVal = tip ? tip.recCalc != null ? tip.recCalc : tip.recSort : null;
    const r5 = tip ? tip.r5 : null;
    const r5Lo = tip ? tip.r5Lo : null;
    const r5Hi = tip ? tip.r5Hi : null;
    const ti = tip ? tip.ti : null;
    const r5FooterVal = r5 != null ? r5 : r5Hi;
    const r5FooterDisp = r5 != null ? r5.toFixed(1) : r5Hi != null ? r5Lo != null && r5Lo.toFixed(1) !== r5Hi.toFixed(1) ? r5Lo.toFixed(1) + "\u2013" + r5Hi.toFixed(1) : r5Hi.toFixed(1) : "\u2026";
    return {
      name: p.name || String(p.id),
      positions,
      no: 0,
      ageMonthsString: `${ageP.years || "?"}.${String(ageP.months || 0).padStart(2, "0")}`,
      r5,
      r5Range: r5 == null && (r5Lo != null || r5Hi != null) ? { lo: r5Lo, hi: r5Hi } : null,
      ti,
      isGK: gk,
      skills,
      asi: p.asi || 0,
      rec: recVal,
      routine: null,
      note: p.txt || null,
      footerStats: [
        { val: r5FooterDisp, lbl: "R5", color: r5FooterVal != null ? getColor2(r5FooterVal, R5_THRESHOLDS2) : "#6a9a58" },
        { val: recVal != null ? recVal.toFixed(2) : "\u2026", lbl: "Rec", color: recVal != null ? getColor2(recVal, REC_THRESHOLDS2) : "#6a9a58" },
        { val: ti != null ? ti.toFixed(1) : "\u2026", lbl: "TI", color: ti != null ? getColor2(ti, TI_THRESHOLDS2) : "#6a9a58" },
        { val: fmtNum(p.asi) || "\u2014", lbl: "ASI", color: "#e0f0cc" },
        { val: fmtNum(p.bid) || "\u2014", lbl: "Bid", color: "#c8e0b4" }
      ]
    };
  }
  var TmTransferTable = {
    BREAKDOWN_COLS,
    GK_SKILLS,
    OUTFIELD_SKILLS,
    SKILL_NAMES,
    // Formatters
    getColor: getColor2,
    fmtNum,
    fmtRec,
    tiHtml,
    fmtR5,
    fmtAge,
    fmtPos,
    skillColor: skillColor2,
    skillCell,
    fmtR5Range,
    thSortClass,
    // Builders
    createBreakdownTableElement,
    createSkillsTableElement,
    buildBidBtn,
    buildPlayerRow,
    buildExpandRow,
    adaptForTooltip
  };

  // src/lib/tm-playerdb.js
  var PlayerDB = /* @__PURE__ */ (() => {
    const DB_NAME = "TMPlayerData";
    const STORE_NAME = "players";
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
      req.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
      };
      req.onerror = (e) => reject(e.target.error);
    });
    const get = (pid) => cache[pid] || null;
    const set = (pid, value) => {
      cache[pid] = value;
      if (!db) return Promise.resolve();
      const idbKey = parseInt(pid);
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(value, isFinite(idbKey) ? idbKey : pid);
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      }).catch((e) => console.warn("[DB] write failed:", e));
    };
    const remove = (pid) => {
      delete cache[pid];
      if (!db) return Promise.resolve();
      const idbKey = parseInt(pid);
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        if (isFinite(idbKey)) store.delete(idbKey);
        store.delete(String(pid));
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      }).catch((e) => console.warn("[DB] delete failed:", e));
    };
    const allPids = () => Object.keys(cache);
    const archive = (pid) => {
      const record = get(pid);
      if (!record) return Promise.resolve();
      return TmPlayerArchiveDB.set(pid, record).then(() => remove(pid));
    };
    const init = async () => {
      await open();
      const toMigrate = [];
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.endsWith("_data")) continue;
        const pid = k.replace("_data", "");
        if (!/^\d+$/.test(pid)) continue;
        try {
          const data = JSON.parse(localStorage.getItem(k));
          if (data) toMigrate.push({ pid, data });
          keysToRemove.push(k);
        } catch (e) {
          keysToRemove.push(k);
        }
      }
      if (toMigrate.length > 0) {
        const tx2 = db.transaction(STORE_NAME, "readwrite");
        const store2 = tx2.objectStore(STORE_NAME);
        for (const item of toMigrate) store2.put(item.data, parseInt(item.pid));
        await new Promise((res, rej) => {
          tx2.oncomplete = res;
          tx2.onerror = rej;
        });
        for (const k of keysToRemove) localStorage.removeItem(k);
        console.log(
          `%c[DB] Migrated ${toMigrate.length} player(s) from localStorage \u2192 IndexedDB`,
          "font-weight:bold;color:#6cc040"
        );
      }
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const reqAll = store.getAll();
      const reqKeys = store.getAllKeys();
      await new Promise((res, rej) => {
        tx.oncomplete = res;
        tx.onerror = rej;
      });
      for (let i = 0; i < reqKeys.result.length; i++)
        cache[reqKeys.result[i]] = reqAll.result[i];
      console.log(`[DB] Loaded ${Object.keys(cache).length} player(s) from IndexedDB`);
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().then((granted) => {
          console.log(`[DB] Persistent storage: ${granted ? "\u2713 granted" : "\u2717 denied"}`);
        });
      }
    };
    return { init, get, set, remove, allPids, archive };
  })();
  var PlayerArchiveDB = /* @__PURE__ */ (() => {
    const DB_NAME = "TMPlayerArchive";
    const STORE_NAME = "players";
    const DB_VERSION = 1;
    let db = null;
    const open = () => new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE_NAME))
          d.createObjectStore(STORE_NAME);
      };
      req.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
      };
      req.onerror = (e) => reject(e.target.error);
    });
    const init = () => open().catch((e) => console.warn("[ArchiveDB] open failed:", e));
    const set = (pid, value) => {
      if (!db) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(value, pid);
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      }).catch((e) => console.warn("[ArchiveDB] write failed:", e));
    };
    const get = (pid) => {
      if (!db) return Promise.resolve(null);
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(pid);
        req.onsuccess = () => {
          var _a;
          return resolve((_a = req.result) != null ? _a : null);
        };
        req.onerror = (e) => reject(e.target.error);
      }).catch(() => null);
    };
    return { init, get, set };
  })();
  var TmPlayerDB = PlayerDB;
  var TmPlayerArchiveDB = PlayerArchiveDB;

  // src/services/player.js
  var _tooltipResolvedCache = /* @__PURE__ */ new Map();
  var TmPlayerService = {
    /**
     * Fetch raw player tooltip response without normalization or DB writes.
     * Use this when you need the plain API response in non-playerdb contexts.
     * @param {string|number} playerId
     * @returns {Promise<object|null>}
     */
    fetchTooltipRaw(playerId) {
      return _dedup(`tooltip:${playerId}`, () => _post("/ajax/tooltip.ajax.php", { player_id: playerId }));
    },
    /**
     * Like fetchTooltipRaw but keeps the resolved promise in a page-level cache.
     * Subsequent calls return the same promise immediately — no re-fetch, no re-dedup.
     * @param {string|number} playerId
     * @returns {Promise<object|null>}
     */
    fetchTooltipCached(playerId) {
      const pid = String(playerId);
      if (!_tooltipResolvedCache.has(pid)) {
        _tooltipResolvedCache.set(pid, this.fetchTooltipRaw(pid));
      }
      return _tooltipResolvedCache.get(pid);
    },
    fetchPlayerTooltip(player_id) {
      return _dedup(`tooltip:${player_id}`, () => _post("/ajax/tooltip.ajax.php", { player_id })).then((data) => {
        if (!(data == null ? void 0 : data.player)) return data;
        data.retired = data.player.club_id === null || data.club === null;
        const DBPlayer = TmPlayerDB.get(player_id);
        if (data.retired) {
          if (DBPlayer) {
            TmPlayerArchiveDB.set(player_id, DBPlayer).then(() => TmPlayerDB.remove(player_id));
            console.log(`%c[Cleanup] Archived retired/deleted player ${player_id}`, "font-weight:bold;color:#fbbf24");
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
      return _post("/ajax/players_get_info.ajax.php", {
        player_id: pid,
        type,
        show_non_pro_graphs: true,
        ...extra
      });
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
            name: player.name || "",
            pos: player.favposition,
            isGK: player.isGK,
            country: player.country || "",
            club_id: player.club_id != null ? String(player.club_id) : void 0
          };
          TmPlayerDB.set(player.id, DBPlayer);
        } else {
          let dirty = false;
          if (!DBPlayer.meta.name && player.name) {
            DBPlayer.meta.name = player.name;
            dirty = true;
          }
          if (!DBPlayer.meta.country && player.country) {
            DBPlayer.meta.country = player.country;
            dirty = true;
          }
          if (player.favposition && player.favposition !== DBPlayer.meta.pos) {
            DBPlayer.meta.pos = player.favposition;
            DBPlayer.meta.isGK = player.isGK;
            dirty = true;
          } else if (DBPlayer.meta.isGK == null) {
            DBPlayer.meta.isGK = player.isGK;
            dirty = true;
          }
          if (player.club_id != null && String(player.club_id) !== DBPlayer.meta.club_id) {
            DBPlayer.meta.club_id = String(player.club_id);
            dirty = true;
          }
          if (dirty) TmPlayerDB.set(player.id, DBPlayer);
        }
      } catch (e) {
        _logError("_migratePlayerMeta", e);
      }
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
      player.trainingCustom = player.training_custom || "";
      player.training = player.training || "";
      const s = window.SESSION;
      const ownClubIds = s ? [s.main_id, s.b_team].filter(Boolean).map(Number) : [];
      player.isOwnPlayer = ownClubIds.includes(Number(player.club_id));
      player.routine = parseFloat(player.rutine || player.routine) || 0;
      player.isGK = String(player.favposition || "").split(",")[0].trim().toLowerCase() === "gk";
    },
    /**
     * Resolves a player's skills array from one of three sources (in priority order):
     *   1. IndexedDB record for the player's current age key
     *   2. Tooltip-API rich objects (already { key, value } shaped)
     *   3. Squad-API flat numeric fields on the player object
     * Returns an array of skill objects matching the given defs.
     */
    _resolveSkills(player, defs, DBRecord) {
      var _a;
      const ageKey = player.ageMonthsString;
      if (DBRecord && ((_a = DBRecord.records) == null ? void 0 : _a[ageKey])) {
        const skills = DBRecord.records[ageKey].skills;
        return defs.map((def) => {
          const raw = skills[def.id];
          const v = typeof raw === "object" && raw !== null ? raw.value : raw;
          return { ...def, value: parseFloat(v) || 0 };
        });
      }
      if (player.skills && Array.isArray(player.skills) && typeof player.skills[0] === "object" && "key" in player.skills[0]) {
        return defs.map((def) => {
          var _a2;
          const sk = player.skills.find((s) => s.key === def.key || def.key2 && s.key === def.key2);
          const raw = (_a2 = sk == null ? void 0 : sk.value) != null ? _a2 : 0;
          const value = typeof raw === "string" && raw.includes("star") ? raw.includes("silver") ? 19 : 20 : parseFloat(raw) || 0;
          return { ...def, value };
        });
      }
      return defs.map((def) => {
        var _a2;
        const raw = (_a2 = player[def.key]) != null ? _a2 : player[def.key.replace(/_/g, "")];
        return { ...def, value: parseFloat(raw) || 0 };
      });
    },
    /**
     * Converts string fields (asi, wage, age, months, routine) to numbers.
     * Safe to call multiple times (idempotent once numeric).
     * @param {object} player — raw player from fetchPlayerTooltip / tooltip.ajax.php
     * @param {object|null} DBPlayer — existing DB record for this player, or null if not found
     * @param {{skipSync?: boolean}} [options]
     * @returns {object} the same player, mutated
     */
    normalizePlayer(player, DBPlayer, { skipSync = false } = {}) {
      var _a;
      const shouldSync = !skipSync;
      this._parseScalars(player);
      if (shouldSync) this._migratePlayerMeta(player, DBPlayer);
      const defs = player.isGK ? TmConst.SKILL_DEFS_GK : TmConst.SKILL_DEFS_OUT;
      player.skills = this._resolveSkills(player, defs, DBPlayer);
      const applyPositions = () => {
        player.positions = String(player.favposition || "").split(",").map((s) => {
          const pos = s.trim().toLowerCase();
          const positionData = TmConst.POSITION_MAP[pos];
          if (!positionData) return null;
          return {
            ...positionData,
            r5: TmLib.calculatePlayerR5(positionData, player),
            rec: TmLib.calculatePlayerREC(positionData, player)
          };
        }).filter(Boolean).sort((a, b) => a.ordering - b.ordering);
        player.r5 = Math.max(0, ...player.positions.map((p) => parseFloat(p.r5) || 0));
        player.rec = Math.max(0, ...player.positions.map((p) => parseFloat(p.rec) || 0));
        player.ti = TmLib.calculateTIPerSession(player);
      };
      const syncPromise = shouldSync ? (_a = TmSync) == null ? void 0 : _a.syncPlayerStore(player, DBPlayer) : null;
      if (syncPromise instanceof Promise) {
        syncPromise.then((updatedDB) => {
          var _a2;
          const curRec = (_a2 = updatedDB == null ? void 0 : updatedDB.records) == null ? void 0 : _a2[player.ageMonthsString];
          if (!(curRec == null ? void 0 : curRec.skills)) return;
          player.skills = this._resolveSkills(player, defs, updatedDB);
          applyPositions();
          window.dispatchEvent(new CustomEvent("tm:player-synced", { detail: { id: player.id, player } }));
        });
      }
      applyPositions();
      player.name = player.player_name || player.name;
      return player;
    }
  };

  // src/lib/tm-dbsync.js
  var { GRAPH_KEYS_OUT: GRAPH_KEYS_OUT2, GRAPH_KEYS_GK: GRAPH_KEYS_GK2, ASI_WEIGHT_GK: ASI_WEIGHT_GK3, ASI_WEIGHT_OUTFIELD: ASI_WEIGHT_OUTFIELD3 } = TmConst;
  var { ageToMonths: ageToMonths3 } = TmUtils;
  var { calcSkillDecimalsSimple: calcSkillDecimalsSimple2, fillMissingMonths: fillMissingMonths2, computeGrowthDecimals: computeGrowthDecimals2, getCurrentSession, calculatePlayerR5: calculatePlayerR52, calculatePlayerREC: calculatePlayerREC2 } = TmLib;
  var buildGroupWeights = (player, trainingInfo) => {
    var _a, _b;
    const count = player.isGK ? 1 : 6;
    const gw = new Array(count).fill(1 / count);
    if (player.isGK || !(trainingInfo == null ? void 0 : trainingInfo.custom)) return gw;
    const c = trainingInfo.custom;
    const cd = c.custom;
    if (c.custom_on && cd) {
      let dtot = 0;
      const dots = [];
      for (let i = 0; i < 6; i++) {
        const d = parseInt((_a = cd["team" + (i + 1)]) == null ? void 0 : _a.points) || 0;
        dots.push(d);
        dtot += d;
      }
      const sm = TmConst.SMOOTH_WEIGHT, den = dtot + 6 * sm;
      return dots.map((d) => (d + sm) / den);
    } else {
      const STD_FOCUS2 = TmConst.STD_FOCUS;
      const fg = (_b = STD_FOCUS2[String(c.team || "3")]) != null ? _b : 1;
      const gw2 = new Array(6).fill(0.125);
      gw2[fg] = 0.375;
      return gw2;
    }
  };
  var buildRoutineMap2 = (ageKeys, tooltipPlayer, historyInfo) => {
    var _a;
    const curRoutine = tooltipPlayer == null ? void 0 : tooltipPlayer.routine;
    if (curRoutine == null || !((_a = historyInfo == null ? void 0 : historyInfo.table) == null ? void 0 : _a.total)) return {};
    const totalRows = historyInfo.table.total.map((r) => ({ ...r, season: parseInt(r.season) })).filter((r) => isFinite(r.season));
    if (!totalRows.length) return {};
    const gpBySeason = {};
    totalRows.forEach((r) => {
      gpBySeason[r.season] = (gpBySeason[r.season] || 0) + (parseInt(r.games) || 0);
    });
    const curSeason = Math.max(...totalRows.map((r) => r.season));
    return TmLib.buildRoutineMap(
      curRoutine,
      parseInt(tooltipPlayer == null ? void 0 : tooltipPlayer.age) || 0,
      parseInt(tooltipPlayer == null ? void 0 : tooltipPlayer.months) || 0,
      { gpBySeason, curSeason },
      ageKeys
    );
  };
  function syncPlayerStore(player, DBPlayer) {
    var _a;
    const api = TmPlayerService;
    const isOwnPlayer = player.isOwnPlayer;
    if (!isOwnPlayer) {
      return savePlayerVisit(player, DBPlayer);
    }
    const ageKey = player.ageMonthsString;
    const curRec = (_a = DBPlayer == null ? void 0 : DBPlayer.records) == null ? void 0 : _a[ageKey];
    const allComputed = (DBPlayer == null ? void 0 : DBPlayer.records) && Object.values(DBPlayer.records).every((r) => r.R5 != null && r.REREC != null);
    if ((curRec == null ? void 0 : curRec.R5) != null && (curRec == null ? void 0 : curRec.REREC) != null && allComputed) {
      console.log(`[syncPlayerStore] ${ageKey} already fully computed \u2014 dispatching growthUpdated`);
      window.dispatchEvent(new CustomEvent("tm:growthUpdated", { detail: { pid: player.id } }));
      return Promise.resolve(DBPlayer);
    }
    const hasOtherRecords = (DBPlayer == null ? void 0 : DBPlayer.records) && Object.keys(DBPlayer.records).length > 0;
    const pastRecordsOk = hasOtherRecords && Object.entries(DBPlayer.records).filter(([k]) => k !== ageKey).every(([, r]) => r.R5 != null && r.REREC != null);
    if (!curRec && pastRecordsOk) {
      console.log(`[syncPlayerStore] ${ageKey} missing, past records OK \u2014 savePlayerVisit`);
      return savePlayerVisit(player, DBPlayer);
    }
    console.log("[syncPlayerStore] \u2192 fetching graphs+training+history");
    const graphKeys = player.isGK ? GRAPH_KEYS_GK2 : GRAPH_KEYS_OUT2;
    const trainingInfoFromPlayer = (() => {
      if (player.isGK) return null;
      const raw = player.training_custom;
      const customParsed = raw ? typeof raw === "object" ? raw : (() => {
        try {
          return JSON.parse(raw);
        } catch (e) {
          return null;
        }
      })() : null;
      if (!customParsed && !player.training) return null;
      return { custom: { team: String(player.training || "3"), custom_on: customParsed ? 1 : 0, custom: customParsed || {} } };
    })();
    const trainReq = trainingInfoFromPlayer ? Promise.resolve(trainingInfoFromPlayer) : api.fetchPlayerInfo(player.id, "training");
    const histReq = api.fetchPlayerInfo(player.id, "history");
    return Promise.all([api.fetchPlayerInfo(player.id, "graphs"), trainReq, histReq]).then(([data, t, h]) => {
      if (!data) {
        console.warn("[syncPlayerStore] Graphs request failed \u2014 falling back to savePlayerVisit");
        return savePlayerVisit(player, DBPlayer);
      }
      const newDBPlayer = buildStoreFromGraphs(player, data.graphs, DBPlayer, graphKeys);
      if (!newDBPlayer) {
        console.warn("[syncPlayerStore] buildStoreFromGraphs returned null \u2014 falling back to savePlayerVisit");
        return savePlayerVisit(player, DBPlayer);
      }
      console.log(`[syncPlayerStore] buildStoreFromGraphs OK \u2014 ${Object.keys(newDBPlayer.records).length} weeks, calling analyzeGrowth`);
      return analyzeGrowth(player, DBPlayer, t, h, newDBPlayer);
    });
  }
  function buildStoreFromGraphs(player, graphsRaw, DBPlayer, graphKeys) {
    try {
      const g = graphsRaw;
      if (!(g == null ? void 0 : g[graphKeys[0]]) || g[graphKeys[0]].length < 2) {
        console.warn("[buildStoreFromGraphs] missing or too-short graph data for key", graphKeys[0], "\u2192 null");
        return null;
      }
      const weekCount = g[graphKeys[0]].length;
      const SI = player.asi;
      const K = player.isGK ? ASI_WEIGHT_GK3 : ASI_WEIGHT_OUTFIELD3;
      const asiArr = (() => {
        var _a, _b;
        if (((_a = g.skill_index) == null ? void 0 : _a.length) >= weekCount)
          return g.skill_index.slice(-weekCount).map((v) => parseInt(v) || 0);
        if (((_b = g.ti) == null ? void 0 : _b.length) >= weekCount) {
          const tiOff = g.ti.length - weekCount;
          const arr = new Array(weekCount);
          arr[weekCount - 1] = SI;
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
          const existingValid = (existing == null ? void 0 : existing.locked) && Array.isArray(existing.skills) && existing.skills.every((v) => v != null && isFinite(v));
          if (existingValid) return [key, existing];
          return [key, {
            SI: parseInt(asiArr[i]) || 0,
            REREC: null,
            R5: null,
            skills: graphKeys.map((k) => {
              var _a;
              return parseInt((_a = g[k]) == null ? void 0 : _a[i]) || 0;
            }),
            routine: null
          }];
        })
      );
      return DBPlayer;
    } catch (e) {
      console.warn("[buildStoreFromGraphs] exception:", e.message);
      return null;
    }
  }
  function savePlayerVisit(player, DBPlayer) {
    var _a;
    const year = player.age;
    const month = player.months;
    console.log(`[savePlayerVisit] Player visit: ${year}.${month} (SI: ${player.asi})`, player.ageMonthsString);
    const SI = player.asi;
    if (!SI || SI <= 0 || !year) {
      console.warn("[savePlayerVisit] early return \u2014 missing SI or age", { SI, year });
      return Promise.resolve(null);
    }
    const ageKey = `${year}.${month}`;
    try {
      if (!DBPlayer) DBPlayer = { records: {} };
      if (!DBPlayer.records) DBPlayer.records = {};
      const skillsC = calcSkillDecimalsSimple2(player);
      if ((_a = DBPlayer.records[ageKey]) == null ? void 0 : _a.locked) {
        console.log(`[TmPlayer] Record ${ageKey} is locked (squad sync) \u2014 skipping overwrite`);
        return Promise.resolve(DBPlayer);
      }
      const existingRec = DBPlayer.records[ageKey];
      console.log(`[savePlayerVisit] existing record for ${ageKey}:`, DBPlayer, existingRec);
      if ((existingRec == null ? void 0 : existingRec.R5) != null && (existingRec == null ? void 0 : existingRec.REREC) != null && Object.values(DBPlayer.records).every((r) => r.R5 != null && r.REREC != null)) {
        DBPlayer.lastSeen = Date.now();
        TmPlayerDB.set(player.id, DBPlayer);
        return Promise.resolve(DBPlayer);
      }
      DBPlayer.records[ageKey] = { SI, REREC: null, R5: null, skills: skillsC, routine: null };
      DBPlayer.lastSeen = Date.now();
      TmPlayerDB.set(player.id, DBPlayer);
      console.log(`[savePlayerVisit] saved record ${ageKey}, calling analyzeGrowth`);
      return analyzeGrowth(player, DBPlayer);
    } catch (e) {
      console.warn("[TmPlayer] savePlayerVisit failed:", e.message);
      return Promise.resolve(null);
    }
  }
  function analyzeGrowth(player, DBPlayer, trainingInfo, historyInfo, overrideRecord) {
    var _a, _b;
    console.log(player.skills);
    if (overrideRecord) {
      DBPlayer = overrideRecord;
    }
    if (!(DBPlayer == null ? void 0 : DBPlayer.records)) {
      console.warn("[analyzeGrowth] no records, abort");
      return Promise.resolve(null);
    }
    if (Object.keys(DBPlayer.records).length < 2) {
      const positions = ((_a = player.positions) == null ? void 0 : _a.length) ? player.positions : [{ id: 0 }];
      const key = Object.keys(DBPlayer.records)[0];
      const record = DBPlayer.records[key];
      const skillsC = calcSkillDecimalsSimple2(player);
      const fakePlayer = { skills: skillsC, asi: parseInt(record.SI) || 0, routine: player.routine || 0 };
      record.REREC = Math.max(...positions.map((p) => Number(calculatePlayerREC2(p, fakePlayer))));
      record.R5 = Math.max(...positions.map((p) => Number(calculatePlayerR52(p, fakePlayer))));
      record.skills = skillsC;
      record.routine = (_b = player.routine) != null ? _b : null;
      TmPlayerDB.set(player.id, DBPlayer);
      console.log("[TmPlayer] Single-record growth analysis completed for player", player.id, { record });
      window.dispatchEvent(new CustomEvent("tm:growthUpdated", { detail: { pid: player.id } }));
      return Promise.resolve(DBPlayer);
    }
    fillMissingMonths2(DBPlayer.records);
    const ageKeys = Object.keys(DBPlayer.records).sort((a, b) => ageToMonths3(a) - ageToMonths3(b));
    const run = (trainingInfo2, historyInfo2) => {
      var _a2, _b2, _c, _d, _e;
      const gw = buildGroupWeights(player, trainingInfo2);
      const decsByKey = computeGrowthDecimals2(DBPlayer.records, ageKeys, player, gw);
      const routineMap = buildRoutineMap2(ageKeys, player, historyInfo2);
      const positions = ((_a2 = player.positions) == null ? void 0 : _a2.length) ? player.positions : [{ id: 0 }];
      for (let m = 0; m < ageKeys.length; m++) {
        const key = ageKeys[m];
        const rec = DBPlayer.records[key];
        const ci = rec.skills.map((v) => {
          const n = typeof v === "object" && v !== null ? parseFloat(v.value) : parseFloat(v);
          return isFinite(n) ? Math.floor(n) : 0;
        });
        const dec = decsByKey[key];
        const allMax = ci.every((v) => v >= 20);
        const skillsC = allMax ? (() => {
          const K = player.isGK ? ASI_WEIGHT_GK3 : ASI_WEIGHT_OUTFIELD3;
          const totalPts = Math.pow(2, Math.log(K * (parseInt(rec.SI) || 0)) / Math.log(128));
          const rem = totalPts - ci.reduce((a, b) => a + b, 0);
          return ci.map((v) => v + rem / ci.length);
        })() : ci.map((v, i) => v >= 20 ? 20 : v + (isFinite(dec[i]) ? dec[i] : 0));
        const fakePlayer = { skills: skillsC, asi: parseInt(rec.SI) || 0, routine: (_c = (_b2 = routineMap[key]) != null ? _b2 : rec.routine) != null ? _c : 0 };
        rec.REREC = Math.max(...positions.map((p) => Number(calculatePlayerREC2(p, fakePlayer))));
        rec.R5 = Math.max(...positions.map((p) => Number(calculatePlayerR52(p, fakePlayer))));
        rec.skills = skillsC;
        rec.routine = (_e = (_d = routineMap[key]) != null ? _d : rec.routine) != null ? _e : null;
      }
      console.log("[TmPlayer] Growth analysis completed for player", player.id, { ageKeys, records: DBPlayer.records });
      TmPlayerDB.set(player.id, DBPlayer);
      window.dispatchEvent(new CustomEvent("tm:growthUpdated", { detail: { pid: player.id } }));
      return DBPlayer;
    };
    if (trainingInfo !== void 0 && historyInfo !== void 0) {
      return Promise.resolve(run(trainingInfo, historyInfo));
    } else {
      return Promise.all([
        TmPlayerService.fetchPlayerInfo(player.id, "training"),
        TmPlayerService.fetchPlayerInfo(player.id, "history")
      ]).then(([t, h]) => run(t, h));
    }
  }
  var TmSync = {
    syncPlayerStore,
    savePlayerVisit,
    analyzeGrowth,
    buildStoreFromGraphs
  };

  // src/services/engine.js
  var _errors = [];
  var _logError = (context, err) => {
    const entry = { context, err, time: Date.now() };
    _errors.push(entry);
    if (typeof (TmApi == null ? void 0 : TmApi.onError) === "function") TmApi.onError(entry);
    console.warn(`[TmApi] ${context}`, err);
  };
  var _post = (url, data) => new Promise((resolve) => {
    const $ = window.jQuery;
    if (!$) {
      resolve(null);
      return;
    }
    $.post(url, data).done((res) => {
      try {
        resolve(typeof res === "object" ? res : JSON.parse(res));
      } catch (e) {
        _logError(`JSON parse: ${url}`, e);
        resolve(null);
      }
    }).fail((xhr, s, e) => {
      _logError(`POST ${url}`, e || s);
      resolve(null);
    });
  });
  var _inflight = /* @__PURE__ */ new Map();
  var _dedup = (key, promiseFn) => {
    if (_inflight.has(key)) return _inflight.get(key);
    const p = promiseFn().finally(() => _inflight.delete(key));
    _inflight.set(key, p);
    return p;
  };

  // src/services/transfer.js
  var _SKILL_NAME_TO_KEY = {
    "Strength": "str",
    "Stamina": "sta",
    "Pace": "pac",
    "Marking": "mar",
    "Tackling": "tac",
    "Workrate": "wor",
    "Positioning": "pos",
    "Passing": "pas",
    "Crossing": "cro",
    "Technique": "tec",
    "Heading": "hea",
    "Finishing": "fin",
    "Longshots": "lon",
    "Set Pieces": "set",
    "Handling": "han",
    "One on ones": "one",
    "Reflexes": "ref",
    "Aerial Ability": "ari",
    "Jumping": "jum",
    "Communication": "com",
    "Kicking": "kic",
    "Throwing": "thr"
  };
  var _GK_WEIGHT_ORDER = TmConst.SKILL_KEYS_GK_WEIGHT;
  var _OUTFIELD_SKILLS = TmConst.SKILL_KEYS_OUT;
  function _skillsToArray(skillsObj, posIdx) {
    const order = posIdx === 9 ? _GK_WEIGHT_ORDER : _OUTFIELD_SKILLS;
    return order.map((k) => skillsObj[k] || 0);
  }
  var TmTransferService = {
    /**
     * Fetch the current transfer status for a listed player.
     * @param {string|number} playerId
     * @returns {Promise<object|null>}
     */
    fetchTransfer(playerId) {
      return _post("/ajax/transfer_get.ajax.php", { type: "transfer_reload", player_id: playerId });
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
      return _post("/ajax/transfer.ajax.php", { search: hash, club_id: clubId });
    },
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
      const OUTFIELD = ["str", "sta", "pac", "mar", "tac", "wor", "pos", "pas", "cro", "tec", "hea", "fin", "lon", "set"];
      const GK = ["str", "sta", "pac", "han", "one", "ref", "ari", "jum", "com", "kic", "thr"];
      const positions = Array.isArray(p.fp) ? p.fp : String(p.fp || "").split(",");
      p.fp = positions.map((pos) => String(pos || "").trim().toLowerCase()).filter(Boolean);
      const gk = p.fp[0] === "gk";
      const skills = gk ? GK : OUTFIELD;
      let sum = 0, count = 0;
      for (const s of skills) {
        if (p[s] > 0) {
          sum += p[s];
          count++;
        }
      }
      const age = parseFloat(p.age) || 0;
      const years = Math.floor(age);
      const months = Math.round((age - years) * 100);
      p._gk = gk;
      p._ss = { sum, count, total: skills.length, max: skills.length * 20 };
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
      const skills = skillKeys.map((k) => p[k] || 0);
      if (skills.every((s) => s === 0)) return null;
      const positions = [...p.fp || []].sort((a, b) => TmLib.getPositionIndex(a) - TmLib.getPositionIndex(b));
      if (!positions.length) return null;
      const ageYears = p._ageP ? p._ageP.years : Math.floor(parseFloat(p.age) || 20);
      const routineMax = Math.max(0, TmConst.ROUTINE_SCALE * (ageYears - TmConst.ROUTINE_AGE_MIN));
      let r5Lo = null, r5Hi = null, recCalc = null;
      for (const pos of positions) {
        const pi = TmLib.getPositionIndex(pos);
        const lo = TmLib.calcR5(pi, skills, asi, 0);
        const hi = TmLib.calcR5(pi, skills, asi, routineMax);
        const rec = TmLib.calcRec(pi, skills, asi);
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
      if (!(tooltipData == null ? void 0 : tooltipData.player)) return null;
      const tp = tooltipData.player;
      const recSort = tp.rec_sort !== void 0 ? parseFloat(tp.rec_sort) : null;
      const wageNum = TmUtils.parseNum(tp.wage);
      const asiNum = player.asi || TmUtils.parseNum(tp.asi || tp.skill_index);
      const favpos = tp.favposition || "";
      const isGK = favpos.split(",")[0].toLowerCase() === "gk";
      let ti = null;
      if (asiNum && wageNum) {
        const tiRaw = TmLib.calculateTI({ asi: asiNum, wage: wageNum, isGK });
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
          if (typeof v === "string") {
            if (v.includes("star_silver")) skills[key] = 19;
            else if (v.includes("star")) skills[key] = 20;
            else skills[key] = parseInt(v) || 0;
          } else {
            skills[key] = parseInt(v) || 0;
          }
        }
      }
      const tooltipRoutine = tp.routine != null ? parseFloat(tp.routine) : null;
      let recCalc = null, r5 = null, r5Lo = null, r5Hi = null;
      if (skills && asiNum) {
        const positions = favpos.split(",").map((s) => s.trim()).filter(Boolean);
        if (positions.length) {
          const ageYears = player._ageP ? player._ageP.years : Math.floor(parseFloat(player.age) || 20);
          const routineMax = Math.max(0, TmConst.ROUTINE_SCALE * (ageYears - TmConst.ROUTINE_AGE_MIN));
          for (const pos of positions) {
            const pix = TmLib.getPositionIndex(pos);
            const sax = _skillsToArray(skills, pix);
            const rec = TmLib.calcRec(pix, sax, asiNum);
            const lo = TmLib.calcR5(pix, sax, asiNum, 0);
            const hi = TmLib.calcR5(pix, sax, asiNum, routineMax);
            if (recCalc === null || rec > recCalc) recCalc = rec;
            if (r5Lo === null || lo > r5Lo) r5Lo = lo;
            if (r5Hi === null || hi > r5Hi) r5Hi = hi;
            if (tooltipRoutine !== null) {
              const exact = TmLib.calcR5(pix, sax, asiNum, tooltipRoutine);
              if (r5 === null || exact > r5) r5 = exact;
            }
          }
        }
      }
      return { recSort, recCalc, r5, r5Lo, r5Hi, ti, skills };
    }
  };

  // src/pages/transfer.js
  (function() {
    "use strict";
    const $ = window.jQuery;
    if (!$) return;
    if (!/^\/transfer\/?$/.test(location.pathname)) return;
    const SAVED_FILTERS_KEY = "tms_saved_filters";
    const { SKILL_KEYS_ALL: ALL_SKILLS, SKILL_LABELS: SKILL_NAMES2 } = TmConst;
    const FP_MAP = {
      gk: { group: "gk", side: null },
      dl: { group: "de", side: "le" },
      dc: { group: "de", side: "ce" },
      dr: { group: "de", side: "ri" },
      dml: { group: "dm", side: "le" },
      dmc: { group: "dm", side: "ce" },
      dmr: { group: "dm", side: "ri" },
      ml: { group: "mf", side: "le" },
      mc: { group: "mf", side: "ce" },
      mr: { group: "mf", side: "ri" },
      oml: { group: "om", side: "le" },
      omc: { group: "om", side: "ce" },
      omr: { group: "om", side: "ri" },
      fc: { group: "fw", side: null }
    };
    let allPlayers = [];
    let sortKey = "time";
    let sortDir = 1;
    let isLoading = false;
    let skillsMode = false;
    let tooltipCache = {};
    const tooltipPromiseCache = /* @__PURE__ */ new Map();
    let tooltipFetchAbort = false;
    let findAllRunning = false;
    let findAllAbort = false;
    const fmtRec2 = TmTransferTable.fmtRec;
    const tiHtml2 = TmTransferTable.tiHtml;
    const fmtR52 = TmTransferTable.fmtR5;
    const fmtR5Range2 = TmTransferTable.fmtR5Range;
    const BREAKDOWN_COLS2 = TmTransferTable.BREAKDOWN_COLS;
    const getCurrentSession2 = TmLib.getCurrentSession;
    const CURRENT_SESSION = getCurrentSession2();
    function computeAllEstimates(players) {
      for (const p of players) {
        if (tooltipCache[p.id] && !tooltipCache[p.id].estimated) continue;
        const est = TmTransferService.estimateTransferPlayer(p);
        if (est) {
          console.log(`[TMS] ${p.name_js || p.name} | age ${p.age} | routineMax ${est.routineMax.toFixed(1)} | R5: ${est.r5Lo != null ? est.r5Lo.toFixed(1) : "?"}-${est.r5Hi != null ? est.r5Hi.toFixed(1) : "?"} | Rec: ${est.recCalc != null ? est.recCalc.toFixed(2) : "?"}`);
          tooltipCache[p.id] = {
            estimated: true,
            r5Lo: est.r5Lo,
            r5Hi: est.r5Hi,
            recCalc: est.recCalc,
            r5: null,
            recSort: null,
            ti: null,
            skills: null
          };
        }
      }
    }
    function processPlayer(p) {
      return TmTransferService.normalizeTransferPlayer(p);
    }
    function tooltipPid(playerOrId) {
      return String(typeof playerOrId === "object" ? playerOrId == null ? void 0 : playerOrId.id : playerOrId);
    }
    function hasFullTooltip(playerOrId) {
      const pid = tooltipPid(playerOrId);
      return !!(tooltipCache[pid] && !tooltipCache[pid].estimated);
    }
    function decRecToTM(val) {
      return Math.min(10, Math.max(0, Math.floor(parseFloat(val) * 2)));
    }
    const buildExpandRow2 = (p, colCount) => TmTransferTable.buildExpandRow(p, tooltipCache, colCount, skillsMode);
    function getPostFilters() {
      const r5min = $("#tms-r5min").val();
      const r5max = $("#tms-r5max").val();
      const timin = $("#tms-timin").val();
      const timax = $("#tms-timax").val();
      return {
        r5min: r5min !== "" ? parseFloat(r5min) : null,
        r5max: r5max !== "" ? parseFloat(r5max) : null,
        timin: timin !== "" ? parseFloat(timin) : null,
        timax: timax !== "" ? parseFloat(timax) : null
      };
    }
    function passesPostFilters(p, pf) {
      const tip = tooltipCache[p.id];
      if (!tip) return true;
      if (tip.r5 != null) {
        if (pf.r5min !== null && tip.r5 < pf.r5min) return false;
        if (pf.r5max !== null && tip.r5 > pf.r5max) return false;
      } else {
        if (pf.r5min !== null && tip.r5Hi != null && tip.r5Hi < pf.r5min) return false;
        if (pf.r5max !== null && tip.r5Lo != null && tip.r5Lo > pf.r5max) return false;
      }
      if (pf.timin !== null && tip.ti != null && tip.ti < pf.timin) return false;
      if (pf.timax !== null && tip.ti != null && tip.ti > pf.timax) return false;
      return true;
    }
    function getVisible() {
      const pf = getPostFilters();
      let arr = allPlayers.filter((p) => passesPostFilters(p, pf));
      arr.sort((a, b) => {
        if (a.bump && !b.bump) return -1;
        if (!a.bump && b.bump) return 1;
        let av, bv;
        switch (sortKey) {
          case "name":
            av = (a.name || "").toLowerCase();
            bv = (b.name || "").toLowerCase();
            break;
          case "age":
            av = a.age || 0;
            bv = b.age || 0;
            break;
          case "rec": {
            const ta = tooltipCache[a.id];
            const tb = tooltipCache[b.id];
            av = ta && ta.recCalc != null ? ta.recCalc : ta && ta.recSort != null ? ta.recSort : a.rec || 0;
            bv = tb && tb.recCalc != null ? tb.recCalc : tb && tb.recSort != null ? tb.recSort : b.rec || 0;
            break;
          }
          case "r5": {
            const ta = tooltipCache[a.id];
            const tb = tooltipCache[b.id];
            av = ta ? ta.r5 != null ? ta.r5 : ta.r5Hi != null ? ta.r5Hi : -9999 : -9999;
            bv = tb ? tb.r5 != null ? tb.r5 : tb.r5Hi != null ? tb.r5Hi : -9999 : -9999;
            break;
          }
          case "ti": {
            const ta = tooltipCache[a.id];
            const tb = tooltipCache[b.id];
            av = ta && ta.ti != null ? ta.ti : -9999;
            bv = tb && tb.ti != null ? tb.ti : -9999;
            break;
          }
          case "asi":
            av = a.asi || 0;
            bv = b.asi || 0;
            break;
          case "bid":
            av = a.bid || 0;
            bv = b.bid || 0;
            break;
          default:
          case "time":
            av = a.time || 0;
            bv = b.time || 0;
            break;
        }
        if (typeof av === "string") return sortDir * av.localeCompare(bv);
        return sortDir * (av - bv);
      });
      return arr;
    }
    function startCountdowns(arr) {
      arr.forEach((p) => {
        if (!p.time || p.time <= 0) return;
        const $span = $(`#tms-td-${p.id}`);
        if (!$span.length) return;
        if (window.countDowns && window.countDowns[p.id]) {
          try {
            $span.html(window.countDowns[p.id].getJQ());
            return;
          } catch (e) {
          }
        }
        if (!window.Countdown) {
          $span.text(p.time + "s");
          return;
        }
        const cd = new window.Countdown(p.time, "", "highest", true, (cntdwn) => {
          if (!cntdwn || !cntdwn.getJQ) return;
          const $row = cntdwn.getJQ().closest("tr");
          if (!$row.length) return;
          if ($row.hasClass("watched-player-currentbid")) {
            $row.find(".tms-time-cell").text("Won").removeClass("tms-time-cell");
          } else if ($row.hasClass("watched-player-outbid")) {
            $row.find(".tms-time-cell").text("Lost").removeClass("tms-time-cell");
          } else {
            $row.find("td").css({ color: "#ff3636" });
            $row.find(".tms-bid-btn").remove();
            cntdwn.getJQ().closest("td").html("\u2014");
            setTimeout(() => $row.fadeOut(800, () => $row.remove()), 3e3);
          }
        });
        if (window.countDowns) window.countDowns[p.id] = cd;
        try {
          $span.html(cd.getJQ());
        } catch (e) {
          $span.text(p.time + "s");
        }
      });
    }
    function removePlayerTip() {
      TmPlayerTooltip.hide();
    }
    function refreshDisplay() {
      const $wrap = $("#tms-table-wrap");
      if (!$wrap.length) return;
      const arr = getVisible();
      $("#tms-hits").text(arr.length);
      if (!arr.length) {
        $wrap.html('<div id="tms-loading">No players found. Try adjusting your filters.</div>');
        return;
      }
      if (skillsMode) {
        const tableEl = TmTransferTable.createSkillsTableElement(ALL_SKILLS, SKILL_NAMES2, sortKey, sortDir, (key) => {
          const defaultDir = key === "time" ? 1 : key === "name" ? 1 : -1;
          ({ key: sortKey, dir: sortDir } = TmUtils.toggleSort(key, sortKey, sortDir, defaultDir));
          refreshDisplay();
        });
        $wrap.empty().append(tableEl);
        startCountdowns(arr);
      } else {
        const tableEl = TmTransferTable.createBreakdownTableElement(arr, sortKey, sortDir, tooltipCache, (key) => {
          const defaultDir = key === "time" ? 1 : key === "name" ? 1 : -1;
          ({ key: sortKey, dir: sortDir } = TmUtils.toggleSort(key, sortKey, sortDir, defaultDir));
          refreshDisplay();
        });
        $wrap.empty().append(tableEl);
        startCountdowns(arr);
      }
      removePlayerTip();
      $("#tms-table tbody").on("mouseenter", ".tms-player-row", function() {
        const pid = $(this).data("pid");
        const player = allPlayers.find((x) => x.id == pid);
        if (!player) return;
        const nameCell = this.querySelector(".tms-col-name") || this;
        const $row = $(this);
        TmPlayerTooltip.show(nameCell, TmTransferTable.adaptForTooltip(player, tooltipCache));
        const cachedTip = tooltipCache[pid];
        if (!cachedTip || cachedTip.estimated) {
          fetchOnePlayer(player).then(() => {
            if ($row.is(":hover"))
              TmPlayerTooltip.show(nameCell, TmTransferTable.adaptForTooltip(player, tooltipCache));
          });
        }
      }).on("mouseleave", ".tms-player-row", removePlayerTip);
      if (typeof window.make_highlighted_rows === "function") {
        try {
          window.make_highlighted_rows();
        } catch (e) {
        }
      }
    }
    function updateTooltipCells(pid, tip) {
      const recVal = tip.recCalc != null ? tip.recCalc : tip.recSort;
      const pf = getPostFilters();
      const failsRec = (() => {
        if (recVal == null) return false;
        const decMin = parseFloat($("#tms-rmin").val()) || 0;
        const decMax = parseFloat($("#tms-rmax").val());
        const maxVal = isNaN(decMax) ? 5 : decMax;
        return (decMin > 0 || maxVal < 5) && (recVal < decMin || recVal > maxVal);
      })();
      const failsR5 = tip.r5 != null ? pf.r5min !== null && tip.r5 < pf.r5min || pf.r5max !== null && tip.r5 > pf.r5max : pf.r5min !== null && tip.r5Hi != null && tip.r5Hi < pf.r5min || pf.r5max !== null && tip.r5Lo != null && tip.r5Lo > pf.r5max;
      const failsTI = pf.timin !== null && tip.ti != null && tip.ti < pf.timin || pf.timax !== null && tip.ti != null && tip.ti > pf.timax;
      if (failsRec || failsR5 || failsTI) {
        const $row = $(`#player_row_${pid}`);
        $row.next(".tms-expand-row").remove();
        $row.remove();
        allPlayers = allPlayers.filter((p) => String(p.id) !== String(pid));
        const parts = ($("#tms-hits").text() || "").split("/");
        const shown = parseInt(parts[0]) || 0;
        const total = parseInt(parts[1]) || 0;
        $("#tms-hits").text((shown > 0 ? shown - 1 : 0) + " / " + (total > 0 ? total - 1 : 0));
        return;
      }
      $(`#player_row_${pid} [data-transfer-reload]`).remove();
      const $rec = $(`#tms-rec-${pid}`);
      if ($rec.length && recVal != null) $rec.html(fmtRec2(recVal));
      const $r5 = $(`#tms-r5-${pid}`);
      if ($r5.length) {
        if (tip.r5 != null) $r5.html(fmtR52(tip.r5));
        else if (tip.r5Lo != null || tip.r5Hi != null) $r5.html(fmtR5Range2(tip.r5Lo, tip.r5Hi));
      }
      const $ti = $(`#tms-ti-${pid}`);
      if ($ti.length) $ti.html(tiHtml2(tip.ti));
      const $expRow = $(`#player_row_${pid}`).next(".tms-expand-row");
      if ($expRow.length) {
        const player = allPlayers.find((x) => x.id == pid);
        if (player) {
          const colCount = skillsMode ? 5 + ALL_SKILLS.length + 2 : BREAKDOWN_COLS2.length;
          $expRow.replaceWith(buildExpandRow2(player, colCount));
        }
      }
      const $hovRow = $(`#player_row_${pid}`);
      if ($hovRow.length && $hovRow.is(":hover")) {
        const player = allPlayers.find((x) => x.id == pid);
        if (player) {
          const anchor = $hovRow[0].querySelector(".tms-col-name") || $hovRow[0];
          TmPlayerTooltip.show(anchor, TmTransferTable.adaptForTooltip(player, tooltipCache));
        }
      }
    }
    async function fetchOnePlayer(p) {
      const pid = tooltipPid(p);
      if (hasFullTooltip(pid)) return tooltipCache[pid];
      if (tooltipPromiseCache.has(pid)) return tooltipPromiseCache.get(pid);
      const request = TmPlayerService.fetchTooltipCached(pid).then((data) => {
        const tip = TmTransferService.enrichTransferFromTooltip(p, data, CURRENT_SESSION);
        if (!tip) return null;
        tooltipCache[pid] = tip;
        updateTooltipCells(pid, tip);
        return tip;
      }).finally(() => {
        tooltipPromiseCache.delete(pid);
      });
      tooltipPromiseCache.set(pid, request);
      return request;
    }
    async function startTooltipFetch(players) {
      tooltipFetchAbort = false;
      const uncached = players.filter((p) => !hasFullTooltip(p.id) && !tooltipPromiseCache.has(tooltipPid(p)));
      await Promise.all(uncached.map(async (p) => {
        if (!tooltipFetchAbort) await fetchOnePlayer(p);
      }));
    }
    function buildHash() {
      let h = "/";
      const activeFps = $("[data-fp].active").map(function() {
        return $(this).data("fp");
      }).get();
      if (activeFps.length) {
        const groups = /* @__PURE__ */ new Set(), sides = /* @__PURE__ */ new Set();
        for (const fp of activeFps) {
          const m = FP_MAP[fp];
          if (!m) continue;
          groups.add(m.group);
          if (m.side) sides.add(m.side);
        }
        for (const g of groups) h += g + "/";
        for (const s of sides) h += s + "/";
      }
      if ($("#tms-for").is(":checked")) h += "for/";
      const amin = $("#tms-amin").val(), amax = $("#tms-amax").val();
      if (amin !== "18") h += `amin/${amin}/`;
      if (amax !== "37") h += `amax/${amax}/`;
      const recMin = parseFloat($("#tms-rmin").val()) || 0;
      const recMax = parseFloat($("#tms-rmax").val());
      const tmRmin = decRecToTM(recMin);
      const tmRmax = decRecToTM(isNaN(recMax) ? 5 : recMax);
      if (tmRmin > 0) h += `rmin/${tmRmin}/`;
      if (tmRmax < 10) h += `rmax/${tmRmax}/`;
      const cost = $("#tms-cost").val();
      if (cost && cost !== "0") h += `cost/${cost}/`;
      const time = $("#tms-time").val();
      if (time && time !== "0") h += `time/${time}/`;
      for (let i = 0; i < 3; i++) {
        const sk = $(`#tms-sf-s${i}`).val();
        const sv = $(`#tms-sf-v${i}`).val();
        if (sk && sk !== "0" && sv && sv !== "0") h += `${sk}/${sv}/`;
      }
      return h;
    }
    function doSearch() {
      if (isLoading) return;
      isLoading = true;
      tooltipFetchAbort = true;
      findAllAbort = true;
      $("#tms-table-wrap").html('<div id="tms-loading"><span class="tms-spinner"></span> Searching transfer market\u2026</div>');
      if (window.countDowns) {
        for (const id in window.countDowns) {
          window.countDowns[id] = null;
        }
        window.countDowns = {};
      }
      const hash = buildHash();
      const clubId = window.SESSION ? window.SESSION.id : 0;
      TmTransferService.fetchTransferSearch(hash, clubId).then(function(data) {
        isLoading = false;
        if (!data) {
          $("#tms-table-wrap").html('<div id="tms-loading" style="color:#ff7373">No data received. Please try again.</div>');
          return;
        }
        if (data.refresh) {
          location.reload();
          return;
        }
        const raw = Array.isArray(data.list) ? data.list : [];
        window.transfer_info_ar = raw;
        allPlayers = raw.map(processPlayer);
        computeAllEstimates(allPlayers);
        refreshDisplay();
        tooltipFetchAbort = true;
        setTimeout(() => startTooltipFetch(allPlayers), 300);
      }).catch(function(error) {
        console.warn("[TMS] Search failed", error);
        isLoading = false;
        $("#tms-table-wrap").html('<div id="tms-loading" style="color:#ff7373">Network error. Please try again.</div>');
      });
    }
    function readCurrentFilterState() {
      const positions = $("[data-fp].active").map(function() {
        return $(this).data("fp");
      }).get();
      const skills = [];
      for (let i = 0; i < 3; i++) {
        skills.push([$(`#tms-sf-s${i}`).val() || "0", $(`#tms-sf-v${i}`).val() || "0"]);
      }
      return {
        positions,
        foreigners: $("#tms-for").is(":checked"),
        amin: $("#tms-amin").val(),
        amax: $("#tms-amax").val(),
        rmin: $("#tms-rmin").val(),
        rmax: $("#tms-rmax").val(),
        cost: $("#tms-cost").val(),
        time: $("#tms-time").val(),
        skills,
        r5min: $("#tms-r5min").val(),
        r5max: $("#tms-r5max").val(),
        timin: $("#tms-timin").val(),
        timax: $("#tms-timax").val()
      };
    }
    function applyFilterState(state) {
      if (!state) return;
      $("[data-fp]").removeClass("active");
      (state.positions || []).forEach((fp) => $(`[data-fp="${fp}"]`).addClass("active"));
      $("#tms-for").prop("checked", !!state.foreigners);
      $("#tms-amin").val(state.amin != null ? state.amin : "18");
      $("#tms-amax").val(state.amax != null ? state.amax : "37");
      $("#tms-rmin").val(state.rmin != null ? state.rmin : "0");
      $("#tms-rmax").val(state.rmax != null ? state.rmax : "5");
      $("#tms-cost").val(state.cost || "0");
      $("#tms-time").val(state.time || "0");
      const skills = state.skills || [];
      for (let i = 0; i < 3; i++) {
        const [sk, sv] = skills[i] || ["0", "0"];
        $(`#tms-sf-s${i}`).val(sk);
        $(`#tms-sf-v${i}`).val(sv);
      }
      $("#tms-r5min").val(state.r5min || "");
      $("#tms-r5max").val(state.r5max || "");
      $("#tms-timin").val(state.timin || "");
      $("#tms-timax").val(state.timax || "");
      const hasMore = state.cost && state.cost !== "0" || state.time && state.time !== "0" || skills.some(([sk]) => sk && sk !== "0");
      if (hasMore) {
        $("#tms-more-toggle").addClass("open");
        $("#tms-more-body").addClass("open");
      }
    }
    function getSavedFilters() {
      try {
        return JSON.parse(localStorage.getItem(SAVED_FILTERS_KEY) || "{}");
      } catch (e) {
        return {};
      }
    }
    function saveNamedFilter(name, state) {
      const filters = getSavedFilters();
      filters[name] = state;
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
    }
    function deleteNamedFilter(name) {
      const filters = getSavedFilters();
      delete filters[name];
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
    }
    function populateSavedFiltersDropdown() {
      const filters = getSavedFilters();
      const names = Object.keys(filters);
      const $sel = $("#tms-saved-filters-sel");
      if (!$sel.length) return;
      const current = $sel.val();
      $sel.empty();
      if (names.length === 0) {
        $sel.append('<option value="">\u2014 no saved filters \u2014</option>');
      } else {
        $sel.append('<option value="">\u2014 select filter \u2014</option>');
        for (const name of names) {
          $sel.append(`<option value="${name}"${name === current ? " selected" : ""}>${name}</option>`);
        }
      }
    }
    function readBaseFilters() {
      return {
        foreigners: $("#tms-for").is(":checked"),
        amin: $("#tms-amin").val() || "18",
        amax: $("#tms-amax").val() || "37",
        rmin: $("#tms-rmin").val() || "0",
        rmax: $("#tms-rmax").val() || "5",
        cost: $("#tms-cost").val() || "0",
        time: $("#tms-time").val() || "0",
        skills: [0, 1, 2].map((i) => [$(`#tms-sf-s${i}`).val() || "0", $(`#tms-sf-v${i}`).val() || "0"])
      };
    }
    function buildHashRaw({ positions = [], sides = [], foreigners, amin, amax, rmin, rmax, cost, time, skills = [] }) {
      let h = "/";
      for (const p of positions) h += p + "/";
      for (const s of sides) h += s + "/";
      if (foreigners) h += "for/";
      if (amin && amin !== "18") h += `amin/${amin}/`;
      if (amax && amax !== "37") h += `amax/${amax}/`;
      if (rmin && rmin !== "0") h += `rmin/${rmin}/`;
      if (rmax && rmax !== "10") h += `rmax/${rmax}/`;
      if (cost && cost !== "0") h += `cost/${cost}/`;
      if (time && time !== "0") h += `time/${time}/`;
      for (const [sk, sv] of skills) {
        if (sk && sk !== "0" && sv && sv !== "0") h += `${sk}/${sv}/`;
      }
      return h;
    }
    function fetchWithHash(hash) {
      const clubId = window.SESSION ? window.SESSION.id : 0;
      return TmTransferService.fetchTransferSearch(hash, clubId).then((data) => Array.isArray(data == null ? void 0 : data.list) ? data.list : []);
    }
    const showModal = (opts) => TmUI.modal(opts);
    const promptModal = (opts) => TmUI.prompt(opts);
    async function findAllPlayers() {
      if (isLoading || findAllRunning) return;
      const _amin = Math.max(18, parseInt($("#tms-amin").val()) || 18);
      const _amax = Math.min(37, parseInt($("#tms-amax").val()) || 37);
      const _hasPos = $("[data-fp].active").length > 0;
      const _rmin = parseFloat($("#tms-rmin").val()) || 0;
      const _rmax = parseFloat($("#tms-rmax").val());
      const _hasRec = _rmin > 0 || !isNaN(_rmax) && _rmax < 5;
      if (_amax - _amin > 3 && !_hasPos && !_hasRec) {
        const choice = await showModal({
          icon: "\u26A0\uFE0F",
          title: "This scan may take a long time",
          message: 'A wide age range is selected and no <strong style="color:#c8e0b4">position</strong> or <strong style="color:#c8e0b4">recommendation</strong> filter is active.<br><br>Consider adding one to speed things up significantly.',
          buttons: [
            { label: "Proceed Anyway", value: "ok", style: "secondary" },
            { label: "Cancel", value: "cancel", style: "danger" }
          ]
        });
        if (choice !== "ok") return;
      }
      findAllRunning = true;
      findAllAbort = false;
      tooltipFetchAbort = true;
      if (window.countDowns) {
        for (const id in window.countDowns) window.countDowns[id] = null;
        window.countDowns = {};
      }
      const base = readBaseFilters();
      const rminNum = Math.max(0, decRecToTM(base.rmin));
      const rmaxNum = Math.min(10, decRecToTM(parseFloat(base.rmax) || 5));
      const aminNum = Math.max(18, parseInt(base.amin) || 18);
      const amaxNum = Math.min(37, parseInt(base.amax) || 37);
      const activeFps = $("[data-fp].active").map(function() {
        return $(this).data("fp");
      }).get();
      const fpKeys = activeFps.length ? activeFps : Object.keys(FP_MAP);
      const posCombos = fpKeys.map((fp) => {
        const m = FP_MAP[fp];
        return { positions: [m.group], sides: m.side ? [m.side] : [] };
      });
      const ages = [];
      for (let a = aminNum; a <= amaxNum; a++) ages.push(a);
      const recRanges = [];
      for (let r = rminNum; r < rmaxNum; r++) recRanges.push([r, r + 1]);
      if (recRanges.length === 0) recRanges.push([rminNum, rmaxNum]);
      const tasks = [];
      for (const pos of posCombos) {
        for (const age of ages) {
          for (const [lo, hi] of recRanges) {
            tasks.push({ pos, age, recLo: lo, recHi: hi });
          }
        }
      }
      const collected = /* @__PURE__ */ new Map();
      const total = tasks.length;
      let done = 0;
      const updateProgress = () => {
        const pct = total > 0 ? Math.round(done / total * 100) : 0;
        $("#tms-table-wrap").html(
          `<div id="tms-loading"><span class="tms-spinner"></span>Scanning\u2026 <strong style="color:#c8e0b4">${done}/${total}</strong> (${pct}%) &mdash; <span style="color:#80e048">${collected.size}</span> players found&hellip;</div>`
        );
      };
      updateProgress();
      await Promise.all(tasks.map(async (task) => {
        if (findAllAbort) return;
        const hash = buildHashRaw({
          ...base,
          positions: task.pos.positions,
          sides: task.pos.sides,
          amin: String(task.age),
          amax: String(task.age),
          rmin: String(task.recLo),
          rmax: String(task.recHi)
        });
        const result = await fetchWithHash(hash);
        if (!findAllAbort) {
          for (const p of result) collected.set(p.id, p);
        }
        done++;
        updateProgress();
      }));
      findAllRunning = false;
      if (findAllAbort) return;
      const foundCount = collected.size;
      let fetchTooltips = true;
      if (foundCount > 600) {
        const choice = await showModal({
          icon: "\u{1F4CA}",
          title: `${foundCount} players found`,
          message: 'Fetching full stats (R5, Rec, TI) for this many players may take several minutes.<br><br>Or get an <strong style="color:#c8e0b4">instant R5 range estimate</strong> based on transfer-data skills and assumed routine <span style="color:#80e048">0 \u2013 4.2 \xD7 (age \u2212 15)</span>, with no API calls.',
          buttons: [
            { label: "Full Analysis", value: "full", style: "primary", sub: "Fetches R5 \xB7 Rec \xB7 TI via tooltip API \u2014 slower" },
            { label: "Quick Estimate", value: "estimate", style: "secondary", sub: "Shows R5 range instantly, no extra API calls" },
            { label: "Cancel", value: "cancel", style: "danger" }
          ]
        });
        if (choice === "cancel") return;
        fetchTooltips = choice === "full";
      }
      allPlayers = [...collected.values()].map(processPlayer);
      computeAllEstimates(allPlayers);
      refreshDisplay();
      if (fetchTooltips) setTimeout(() => startTooltipFetch(allPlayers), 300);
    }
    function buildLayout() {
      console.log("Building layout");
      if ($("#tms-main").length || $("#tms-sidebar").length) return;
      const layoutHtml = `
  ${TmTransferSidebar.build()}
    <div id="tms-main" class="tmvu-transfer-main">
    <div id="tms-toolbar">
      <span id="tms-hits">0</span>
      <span class="tms-toolbar-label"> players</span>
    </div>
    <div id="tms-table-wrap">
      <div id="tms-loading"><span class="tms-spinner"></span> Loading transfer market\u2026</div>
    </div>
  </div>
<div id="transfer_list" style="display:none"></div>
        `;
      const mainContainer = TmUtils.getMainContainer();
      if (mainContainer) {
        mainContainer.classList.add("tmvu-transfer-page");
        mainContainer.querySelectorAll(".column1_d").forEach((node) => node.remove());
        mainContainer.insertAdjacentHTML("beforeend", layoutHtml);
        return;
      }
      $("body").append(layoutHtml);
    }
    function bindEvents() {
      $(document).on("click", "#tms-search-btn", doSearch);
      $(document).on("keydown", "#tms-sidebar", function(e) {
        if (e.key === "Enter") doSearch();
      });
      $(document).on("click", "[data-transfer-reload]", function(e) {
        e.stopPropagation();
        const pid = $(this).data("pid");
        const player = allPlayers.find((x) => x.id == pid);
        if (!player) return;
        $(this).addClass("tms-reloading");
        fetchOnePlayer(player);
      });
      $(document).on("click", "[data-fp]", function() {
        $(this).toggleClass("active");
      });
      $(document).on("click", "#tms-findall-btn", findAllPlayers);
      $(document).on("click", "#tms-more-toggle", function() {
        $(this).toggleClass("open");
        $("#tms-more-body").toggleClass("open");
      });
      $(document).on("click", "#tms-filter-save-btn", async function() {
        const currentSel = $("#tms-saved-filters-sel").val();
        const name = await promptModal({
          icon: "\u{1F4BE}",
          title: "Save Current Filter",
          placeholder: "Enter filter name\u2026",
          defaultValue: currentSel || ""
        });
        if (!name) return;
        saveNamedFilter(name, readCurrentFilterState());
        populateSavedFiltersDropdown();
        $("#tms-saved-filters-sel").val(name);
      });
      $(document).on("click", "#tms-filter-load-btn", function() {
        const name = $("#tms-saved-filters-sel").val();
        if (!name) return;
        const state = getSavedFilters()[name];
        if (!state) return;
        applyFilterState(state);
        doSearch();
      });
      $(document).on("click", "#tms-filter-del-btn", async function() {
        const name = $("#tms-saved-filters-sel").val();
        if (!name) return;
        const confirmed = await showModal({
          icon: "\u{1F5D1}\uFE0F",
          title: "Delete saved filter",
          message: `Delete "<strong style="color:#c8e0b4">${name}</strong>"?`,
          buttons: [
            { label: "Delete", value: "ok", style: "danger" },
            { label: "Cancel", value: "cancel", style: "secondary" }
          ]
        });
        if (confirmed !== "ok") return;
        deleteNamedFilter(name);
        populateSavedFiltersDropdown();
      });
      $(document).on("input", "#tms-r5min, #tms-r5max, #tms-timin, #tms-timax", function() {
        refreshDisplay();
      });
      $(document).on("click", "#tms-mode-bd", function() {
        skillsMode = false;
        $(this).addClass("active");
        $("#tms-mode-sk").removeClass("active");
        refreshDisplay();
      });
      $(document).on("click", "#tms-mode-sk", function() {
        skillsMode = true;
        $(this).addClass("active");
        $("#tms-mode-bd").removeClass("active");
        refreshDisplay();
      });
    }
    function neutralizeTM() {
      console.log("Neutralizing TM rendering");
      if (window.hashCheck) {
        clearInterval(window.hashCheck);
        window.hashCheck = null;
      }
      window.makeTable = function(arr) {
        if (arr) window.transfer_info_ar = arr;
      };
      window.sort_it = function() {
      };
      window.startSearch = function() {
      };
      window.check_hash = function() {
      };
      window.popFilterImages = function() {
      };
    }
    function init() {
      neutralizeTM();
      TmTransferStyles.inject();
      buildLayout();
      bindEvents();
      populateSavedFiltersDropdown();
      setTimeout(doSearch, 150);
      console.log("Transfer Market Scanner initialized");
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();
})();
