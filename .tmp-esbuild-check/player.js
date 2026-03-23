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
  var SKILL_DEFS_OUT = SKILL_DEFS.filter((s6) => s6.isOutfield);
  var SKILL_DEFS_GK = SKILL_DEFS.filter((s6) => s6.isGK);
  var SKILL_KEYS_OUT = ["str", "sta", "pac", "mar", "tac", "wor", "pos", "pas", "cro", "tec", "hea", "fin", "lon", "set"];
  var SKILL_KEYS_GK = ["str", "sta", "pac", "han", "one", "ref", "ari", "jum", "com", "kic", "thr"];
  var SKILL_KEYS_ALL = [...SKILL_KEYS_OUT, ...SKILL_KEYS_GK.filter((s6) => !SKILL_KEYS_OUT.includes(s6))];
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
  var SKILL_NAMES_OUT = SKILL_DEFS_OUT.map((s6) => s6.name);
  var SKILL_NAMES_GK = SKILL_DEFS_GK.map((s6) => s6.name);
  var GRAPH_KEYS_OUT = SKILL_DEFS_OUT.map((s6) => s6.key);
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
      const el = document.createElement("div");
      el.className = `tmu-ac-item${active ? " tmu-ac-item-active" : ""}`;
      if (icon) {
        if (typeof icon === "string") {
          const wrap = document.createElement("span");
          wrap.className = "tmu-ac-item-icon";
          wrap.innerHTML = icon;
          el.appendChild(wrap);
        } else {
          el.appendChild(icon);
        }
      }
      el.appendChild(document.createTextNode(label));
      if (onSelect) {
        el.addEventListener("mousedown", (event) => {
          event.preventDefault();
          onSelect();
        });
      }
      return el;
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
    render(el, html, handlers = {}) {
      if (html !== void 0) el.innerHTML = html;
      const refs = {};
      el.querySelectorAll("tm-card").forEach((tmCard) => {
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
      el.querySelectorAll("tm-divider").forEach((tmDivider) => {
        const label = tmDivider.dataset.label;
        const div = document.createElement("div");
        div.className = label ? "tmu-divider-label" : "tmu-divider";
        if (label) div.textContent = label;
        tmDivider.replaceWith(div);
      });
      el.querySelectorAll("tm-button").forEach((tmBtn) => {
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
      el.querySelectorAll("tm-input").forEach((tmInput) => {
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
      el.querySelectorAll("tm-stat").forEach((tmStat) => {
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
      el.querySelectorAll("tm-list-item").forEach((tmItem) => {
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
      el.querySelectorAll("[data-ref]").forEach((node) => {
        refs[node.dataset.ref] = node;
      });
      el.querySelectorAll("tm-row").forEach((tmRow) => {
        const div = document.createElement("div");
        const cls = tmRow.dataset.cls || "";
        div.className = "tmu-row" + (cls ? " " + cls : "");
        if (tmRow.dataset.justify) div.style.justifyContent = tmRow.dataset.justify;
        if (tmRow.dataset.align) div.style.alignItems = tmRow.dataset.align;
        if (tmRow.dataset.gap) div.style.gap = tmRow.dataset.gap;
        while (tmRow.firstChild) div.appendChild(tmRow.firstChild);
        tmRow.replaceWith(div);
      });
      el.querySelectorAll("tm-col").forEach((tmCol) => {
        const div = document.createElement("div");
        const size = tmCol.dataset.size;
        const cls = tmCol.dataset.cls || "";
        div.className = "tmu-col" + (size ? " tmu-col-" + size : "") + (cls ? " " + cls : "");
        while (tmCol.firstChild) div.appendChild(tmCol.firstChild);
        tmCol.replaceWith(div);
      });
      el.querySelectorAll("tm-spinner").forEach((tmSpinner) => {
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
    positionTooltip(el, anchor) {
      const rect = anchor.getBoundingClientRect();
      el.style.top = rect.bottom + window.scrollY + 4 + "px";
      el.style.left = rect.left + window.scrollX + "px";
      requestAnimationFrame(() => {
        const tipRect = el.getBoundingClientRect();
        if (tipRect.right > window.innerWidth - 10)
          el.style.left = window.innerWidth - tipRect.width - 10 + "px";
        if (tipRect.bottom > window.innerHeight + window.scrollY - 10)
          el.style.top = rect.top + window.scrollY - tipRect.height - 4 + "px";
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
        const esc = (s6) => (s6 || "").replace(/"/g, "&quot;");
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
      const s6 = document.createElement("style");
      s6.id = "tm-pos-chip-styles";
      s6.textContent = `.tm-pos-chip{display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.3px;line-height:16px;text-align:center;min-width:28px;text-transform:uppercase;}`;
      document.head.appendChild(s6);
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
    const hsl2rgb = (h, s6, l) => {
      s6 /= 100;
      l /= 100;
      const c = (1 - Math.abs(2 * l - 1)) * s6;
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
  var _sv = (s6) => {
    var _a;
    return typeof s6 === "object" && s6 !== null ? (_a = s6.value) != null ? _a : 0 : Number(s6);
  };
  var _calcRemainderRaw = (posIdx, skills, asi) => {
    const weight = posIdx === 9 ? ASI_WEIGHT_GK2 : ASI_WEIGHT_OUTFIELD2;
    const skillSum = skills.reduce((s6, v) => s6 + parseFloat(v), 0);
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
    const goldstar = skills.filter((s6) => s6 === 20).length;
    const denom = skills.length - goldstar || 1;
    const skillsB = skills.map((s6) => s6 === 20 ? 20 : s6 + r.remainder / denom);
    const sr = skillsB.map((s6, i) => i === 1 ? s6 : s6 + routineBonus);
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
    const s6 = Math.floor(day / 7) + 1;
    return s6 <= 0 ? 12 : s6;
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
    const allSum = nums.reduce((s6, v) => s6 + v, 0);
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
    let dec = shares.map((s6) => Math.max(0, remainder * s6));
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
    let dec = capDecimals(calcShares(safeSkills(r0.skills)).map((s6) => Math.max(0, rem0 * s6)), safeSkills(r0.skills));
    result[ageKeys[0]] = dec;
    for (let m = 1; m < ageKeys.length; m++) {
      const prevKey = ageKeys[m - 1], currKey = ageKeys[m];
      const piSkills = safeSkills(records[prevKey].skills), ciSkills = safeSkills(records[currKey].skills);
      const ptg = totalPts(records[prevKey].SI), ctg = totalPts(records[currKey].SI);
      const delta = ctg - ptg;
      const cRem = ctg - ciSkills.reduce((a, b) => a + b, 0);
      const gains = calcShares(piSkills).map((s6) => delta * s6);
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
        dec = capDecimals(calcShares(ciSkills).map((s6) => Math.max(0, cRem * s6)), ciSkills);
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

  // src/components/player/tm-asi-calculator.js
  var CSS = `
/* \u2500\u2500 ASI Calculator (tmac-*) \u2500\u2500 */
.tmac-result {
    background: rgba(42,74,28,.3); border: 1px solid rgba(42,74,28,.5);
    display: none;
}
.tmac-result.show { display: block; }
.tmac-result .tmu-stat-val { color: #e8f5d8; }
`;
  var s = document.createElement("style");
  s.textContent = CSS;
  document.head.appendChild(s);
  var mount = (container, { player = null } = {}) => {
    if (!container) return;
    document.querySelectorAll('[id="tmac-standalone"]').forEach((node) => node.remove());
    const mo = (player == null ? void 0 : player.ageMonths) > 0 ? player.ageMonths % 12 : null;
    const defaultTrainings = mo !== null ? mo >= 11 ? 12 : 11 - mo : "";
    const root = document.createElement("div");
    root.id = "tmac-standalone";
    const refs = TmUI.render(root, `
            <tm-card data-title="ASI Calculator" data-icon="\u{1F4CA}">
                <tm-input data-label="Trainings" data-ref="trainings" data-type="number" data-value="${defaultTrainings}" data-placeholder="12" data-min="1" data-max="500"></tm-input>
                <tm-input data-label="Avg TI" data-ref="ti" data-type="number" data-value="${(player == null ? void 0 : player.ti) || ""}" data-placeholder="8" data-min="-10" data-max="10" data-step="0.1"></tm-input>
                <tm-button data-label="Calculate" data-action="calc"></tm-button>
                <div data-ref="result" class="tmac-result rounded-md py-2 px-3">
                    <tm-stat data-label="Age" data-value="-" data-ref="age" data-val-cls="text-md"></tm-stat>
                    <tm-stat data-label="New ASI" data-value="-" data-ref="asi" data-val-cls="text-md"></tm-stat>
                    <tm-stat data-label="Skill Sum" data-value="-" data-ref="skillsum" data-val-cls="text-md"></tm-stat>
                    <tm-stat data-label="Sell To Agent" data-value="-" data-ref="sta" data-val-cls="text-md"></tm-stat>
                </div>
            </tm-card>`, {
      calc: () => {
        const trainings = parseInt(refs.trainings.value) || 0;
        const avgTIVal = parseFloat(refs.ti.value) || 0;
        if (trainings <= 0 || avgTIVal === 0 || !(player == null ? void 0 : player.asi)) return;
        const proj = TmLib.calcASIProjection({ player, trainings, avgTI: avgTIVal });
        refs.result.classList.add("show");
        if ((player == null ? void 0 : player.ageMonths) > 0) {
          const totMo = player.ageMonths + trainings;
          refs.age.textContent = `${Math.floor(totMo / 12)}.${totMo % 12}`;
        } else {
          refs.age.textContent = "-";
        }
        const diffHtml = (val) => {
          const sign = val >= 0 ? "+" : "";
          const cls = val >= 0 ? "lime" : "red";
          return `<span class="text-xs font-bold ml-1 ${cls}">${sign}${val.toLocaleString()}</span>`;
        };
        refs.asi.innerHTML = `${proj.newASI.toLocaleString()}${diffHtml(proj.asiDiff)}`;
        refs.skillsum.textContent = `${proj.curSkillSum.toFixed(1)} \u2192 ${proj.futSkillSum.toFixed(1)}`;
        if ((player == null ? void 0 : player.ageMonths) > 0) {
          refs.sta.innerHTML = `${proj.futAgentVal.toLocaleString()}${diffHtml(proj.agentDiff)}`;
        } else {
          refs.sta.textContent = "-";
        }
      }
    });
    container.appendChild(root);
  };
  var TmAsiCalculator = { mount };

  // src/components/player/tm-best-estimate.js
  var CSS2 = `
/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   BEST ESTIMATE CARD (tmbe-*)
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
.tmbe-title-stars { letter-spacing: 1px; line-height: 1; margin-left: auto; }
.tmbe-grid {
    display: grid; grid-template-columns: 1fr; gap: 6px; margin-bottom: 14px;
}
.tmbe-item {
    background: rgba(42,74,28,.25); border: 1px solid rgba(42,74,28,.4);
}
.tmbe-peak-item {
    flex-direction: column !important; align-items: stretch !important; gap: 6px; padding: 8px 10px !important;
}
.tmbe-peak-reach { line-height: 1; }
.tmbe-reach-tag { color: #5a7a48; }
.tmbe-bar-row {
    display: flex; flex-direction: column; gap: 3px; padding: 6px 0;
    border-bottom: 1px solid rgba(42,74,28,.3);
}
.tmbe-bar-row:last-child { border-bottom: none; }
.tmbe-bar-label { color: #90b878; }
.tmbe-bar-track {
    width: 100%; height: 6px; background: rgba(0,0,0,.3); border-radius: 3px;
    overflow: hidden; position: relative;
}
.tmbe-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.tmbe-bar-fill-reach {
    position: absolute; top: 0; left: 0; height: 100%;
    border-radius: 3px; transition: width 0.3s;
}
.tmbe-bar-val { font-variant-numeric: tabular-nums; }
.tmbe-conf {
    display: inline-block; letter-spacing: 0.3px;
    vertical-align: middle; white-space: nowrap;
}
`;
  var s2 = document.createElement("style");
  s2.textContent = CSS2;
  document.head.appendChild(s2);
  var SPECIALTIES = ["None", "Strength", "Stamina", "Pace", "Marking", "Tackling", "Workrate", "Positioning", "Passing", "Crossing", "Technique", "Heading", "Finishing", "Longshots", "Set Pieces"];
  var PEAK_SUMS = {
    outfield: { phy: [64, 70, 74, 80], tac: [64, 70, 74, 80], tec: [96, 105, 111, 120] },
    gk: { phy: [64, 70, 74, 80], tac: [50, 55, 60], tec: [68, 74, 80] }
  };
  var skillColor2 = (v) => {
    v = parseInt(v);
    if (v >= 19) return "#6cc040";
    if (v >= 16) return "#80e048";
    if (v >= 13) return "#c8e0b4";
    if (v >= 10) return "#fbbf24";
    if (v >= 7) return "#f97316";
    return "#f87171";
  };
  var potColor = (pot) => {
    pot = parseInt(pot);
    if (pot >= 18) return "#6cc040";
    if (pot >= 15) return "#5b9bff";
    if (pot >= 12) return "#c8e0b4";
    if (pot >= 9) return "#fbbf24";
    return "#f87171";
  };
  var barColor = (val, max) => {
    const r = val / max;
    if (r >= 0.75) return "#6cc040";
    if (r >= 0.5) return "#80e048";
    if (r >= 0.25) return "#fbbf24";
    return "#f87171";
  };
  var reachColor = (pct) => {
    if (pct >= 90) return "#6cc040";
    if (pct >= 80) return "#80e048";
    if (pct >= 70) return "#fbbf24";
    if (pct >= 60) return "#f97316";
    return "#f87171";
  };
  var bloomColor = (txt) => {
    if (!txt) return "#c8e0b4";
    const t = txt.toLowerCase();
    if (t === "bloomed") return "#6cc040";
    if (t.includes("late bloom")) return "#80e048";
    if (t.includes("middle")) return "#fbbf24";
    if (t.includes("starting")) return "#f97316";
    if (t.includes("not bloomed")) return "#f87171";
    return "#c8e0b4";
  };
  var cleanPeakText = (txt) => txt ? txt.replace(/^\s*-\s*/, "").replace(/\s*(physique|tactical ability|technical ability)\s*$/i, "").trim() : "";
  var extractTier = (txt) => {
    if (!txt) return null;
    const m = txt.match(/\((\d)\/(\d)\)/);
    return m ? { val: parseInt(m[1]), max: parseInt(m[2]) } : null;
  };
  var confPct = (skill) => Math.round((parseInt(skill) || 0) / 20 * 100);
  var combinedStarsHtml = (current, potMax) => {
    current = parseFloat(current) || 0;
    potMax = parseFloat(potMax) || 0;
    if (potMax < current) potMax = current;
    let h = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= current) h += '<span class="tmsc-star-full">\u2605</span>';
      else if (i - 0.5 <= current && current < i) {
        h += potMax >= i ? '<span class="tmsc-star-split">\u2605</span>' : '<span class="tmsc-star-half">\u2605</span>';
      } else if (i <= potMax) h += '<span class="tmsc-star-green">\u2605</span>';
      else if (i - 0.5 <= potMax && potMax < i) h += '<span class="tmsc-star-green-half">\u2605</span>';
      else h += '<span class="tmsc-star-empty">\u2605</span>';
    }
    return h;
  };
  var getCurrentBloomStatus = (allReports, scouts, age) => {
    if (!allReports || !allReports.length || age === null) return { text: "-", certain: false, range: null };
    const getDevSkill = (r) => {
      if (!scouts) return 0;
      const s6 = Object.values(scouts).find((sc) => String(sc.id) === String(r.scoutid));
      return s6 ? parseInt(s6.development) || 0 : 0;
    };
    const phaseFor = (start) => {
      if (age < start) return "not";
      if (age >= start + 3) return "done";
      const y = age - start;
      return y < 1 ? "starting" : y < 2 ? "middle" : "late";
    };
    const PHASE_LABEL = { not: "Not bloomed", starting: "Starting", middle: "Middle", late: "Late bloom", done: "Bloomed" };
    const statusFrom = (start) => {
      const range = `${start}.0\u2013${start + 2}.11`;
      const p = phaseFor(start);
      if (p === "done") return { text: "Bloomed", certain: true, range: null };
      const notBloomedTxt = bloomType ? `Not bloomed (${bloomType})` : "Not bloomed";
      const text = p === "not" ? notBloomedTxt : p === "starting" ? "Starting to bloom" : p === "middle" ? "In the middle of his bloom" : "In his late bloom";
      return { text, certain: true, range };
    };
    let seenBloomed = false;
    let bloomType = null, possibleStarts = null;
    let bloomTypeBestDevSk = -1, bloomTypeBestDate = "";
    for (const r of allReports) {
      const bt = r.bloom_status_txt || "";
      if (!bt || bt === "-") continue;
      if (bt === "Bloomed") {
        seenBloomed = true;
        continue;
      }
      if (!bt.includes("Not bloomed")) continue;
      const hasType = bt.includes("Early") || bt.includes("Normal") || bt.includes("Late");
      if (!hasType) continue;
      const devSk = getDevSkill(r);
      const rDate = r.done || "";
      if (devSk > bloomTypeBestDevSk || devSk === bloomTypeBestDevSk && rDate > bloomTypeBestDate) {
        bloomTypeBestDevSk = devSk;
        bloomTypeBestDate = rDate;
        if (bt.includes("Early")) {
          bloomType = "Early";
          possibleStarts = [16, 17];
        } else if (bt.includes("Normal")) {
          bloomType = "Normal";
          possibleStarts = [18, 19];
        } else {
          bloomType = "Late";
          possibleStarts = [20, 21, 22];
        }
      }
    }
    const MIN_PHASE_DEV = 15;
    const bloomWinMin = possibleStarts ? possibleStarts[0] : Infinity;
    const bloomWinMax = possibleStarts ? possibleStarts[possibleStarts.length - 1] + 3 : -Infinity;
    let maxPhaseDevSkInWindow = 0;
    for (const r of allReports) {
      const bt = r.bloom_status_txt || "";
      if (!bt || bt.includes("Not bloomed") || bt === "Bloomed" || bt === "-") continue;
      const rAge = parseFloat(r.report_age) || 0;
      if (rAge < bloomWinMin || rAge >= bloomWinMax) continue;
      const devSk = getDevSkill(r);
      if (devSk > maxPhaseDevSkInWindow) maxPhaseDevSkInWindow = devSk;
    }
    const phaseThreshold = maxPhaseDevSkInWindow >= MIN_PHASE_DEV ? MIN_PHASE_DEV : maxPhaseDevSkInWindow;
    let bestPhase = null;
    for (const r of allReports) {
      const bt = r.bloom_status_txt || "";
      if (!bt || bt.includes("Not bloomed") || bt === "Bloomed" || bt === "-") continue;
      const rAge = parseFloat(r.report_age) || 0;
      const rFloor = Math.floor(rAge);
      const devSk = getDevSkill(r);
      let candidateStart = null;
      if (bt.includes("Starting") && !bt.includes("Not")) candidateStart = rFloor;
      else if (bt.toLowerCase().includes("middle")) candidateStart = rFloor - 1;
      else if (bt.toLowerCase().includes("late bloom")) candidateStart = rFloor - 2;
      if (candidateStart === null) continue;
      const inWindow = possibleStarts && rAge >= bloomWinMin && rAge < bloomWinMax;
      if (inWindow && devSk < phaseThreshold) continue;
      if (possibleStarts && !possibleStarts.includes(candidateStart)) continue;
      if (!bestPhase || devSk > bestPhase.devSkill) {
        bestPhase = { knownStart: candidateStart, devSkill: devSk };
      }
    }
    if (bestPhase) {
      let dominated = false;
      for (const r of allReports) {
        const bt = r.bloom_status_txt || "";
        if (!bt.includes("Not bloomed")) continue;
        const rAge = parseFloat(r.report_age) || 0;
        const devSk = getDevSkill(r);
        if (rAge >= bestPhase.knownStart && devSk > bestPhase.devSkill) {
          dominated = true;
          break;
        }
      }
      if (!dominated) return statusFrom(bestPhase.knownStart);
    }
    if (seenBloomed) return { text: "Bloomed", certain: true, range: null };
    if (!possibleStarts) return { text: "-", certain: false, range: null };
    for (const r of allReports) {
      const bt = r.bloom_status_txt || "";
      if (!bt.includes("Not bloomed")) continue;
      const rAge = parseFloat(r.report_age) || 0;
      possibleStarts = possibleStarts.filter((s6) => s6 > rAge);
    }
    if (possibleStarts.length === 0) return { text: "-", certain: false, range: null };
    if (possibleStarts.length === 1) return statusFrom(possibleStarts[0]);
    const rangeStr = possibleStarts.map((s6) => `${s6}.0\u2013${s6 + 2}.11`).join(" or ");
    const phases = possibleStarts.map((s6) => phaseFor(s6));
    const unique = [...new Set(phases)];
    const notBloomedLabel = bloomType ? `Not bloomed (${bloomType})` : "Not bloomed";
    if (unique.length === 1) {
      if (unique[0] === "not") return { text: notBloomedLabel, certain: true, range: rangeStr };
      if (unique[0] === "done") return { text: "Bloomed", certain: true, range: null };
      return { text: PHASE_LABEL[unique[0]], certain: true, range: rangeStr };
    }
    const allBlooming = phases.every((p) => p !== "not" && p !== "done");
    if (allBlooming) {
      const labels = unique.map((p) => PHASE_LABEL[p]).join(" or ");
      return { text: "Blooming", certain: true, phases: labels, range: rangeStr };
    }
    let parts = [];
    if (phases.includes("not")) parts.push(notBloomedLabel);
    const bloomPhases = unique.filter((p) => p !== "not" && p !== "done");
    if (bloomPhases.length) parts.push("Blooming (" + bloomPhases.map((p) => PHASE_LABEL[p]).join("/") + ")");
    if (phases.includes("done")) parts.push("Bloomed");
    return { text: parts.join(" or "), certain: false, range: rangeStr };
  };
  var render = (container, { scoutData = {}, player = null, title = "Best Estimate", icon = "\u2605" } = {}) => {
    const isGK = player.isGK;
    const age = player && player.age != null ? player.age + (player.months || 0) / 12 : null;
    const recSort = player && player.rec_sort != null ? parseFloat(player.rec_sort) : null;
    const skills = player.skills.filter((skill) => isGK ? skill.isGK : skill.isOutfield);
    const data = scoutData;
    const hasScouts = data && data.reports && data.reports.length && data.scouts;
    let scouts = {}, regular = [];
    let potPick = null, bloomPick = null, phyPick = null, tacPick = null, tecPick = null, psyPick = null;
    if (hasScouts) {
      scouts = data.scouts;
      regular = data.reports.filter((r) => r.scout_name !== "YD" && r.scoutid !== "0");
      if (regular.length) {
        const scoutSkill = (r, field) => {
          const s6 = Object.values(scouts).find((s7) => String(s7.id) === String(r.scoutid));
          return s6 ? parseInt(s6[field]) || 0 : 0;
        };
        const pickBest = (field) => {
          let best = null, bs = -1, bd = "";
          for (const r of regular) {
            const sk = scoutSkill(r, field);
            const d = r.done || "";
            if (sk > bs || sk === bs && d > bd) {
              best = r;
              bs = sk;
              bd = d;
            }
          }
          return best ? { report: best, conf: confPct(bs) } : null;
        };
        const pickBestPot = () => {
          let best = null, bs = -1, bd = "";
          for (const r of regular) {
            const s6 = Object.values(scouts).find((s7) => String(s7.id) === String(r.scoutid));
            const rAge = parseInt(r.report_age) || 0;
            let sk = 0;
            if (s6) {
              const senYth = rAge < 20 ? parseInt(s6.youths) || 0 : parseInt(s6.seniors) || 0;
              const dev = parseInt(s6.development) || 0;
              sk = Math.min(senYth, dev);
            }
            const d = r.done || "";
            if (sk > bs || sk === bs && d > bd) {
              best = r;
              bs = sk;
              bd = d;
            }
          }
          return best ? { report: best, conf: confPct(bs) } : null;
        };
        potPick = pickBestPot();
        bloomPick = pickBest("development");
        phyPick = pickBest("physical");
        tacPick = pickBest("tactical");
        tecPick = pickBest("technical");
        psyPick = pickBest("psychology");
      }
    }
    if (!regular.length && !skills.length) return;
    const skillCategories = [
      { label: "Physique", category: "Physical", key: "phy", pick: phyPick, peakField: "peak_phy_txt" },
      { label: "Tactical", category: "Tactical", key: "tac", pick: tacPick, peakField: "peak_tac_txt" },
      { label: "Technical", category: "Technical", key: "tec", pick: tecPick, peakField: "peak_tec_txt" }
    ].map(({ label, category, key, pick, peakField }) => {
      const value = skills.filter((s6) => s6.category === category).reduce((sum, s6) => sum + (s6.value || 0), 0).toFixed(2);
      const peakArr = (isGK ? PEAK_SUMS.gk : PEAK_SUMS.outfield)[key];
      const text = pick ? cleanPeakText(pick.report[peakField]) : "";
      const conf = pick ? pick.conf : null;
      return { label, value, pick, peakArr, text, conf };
    });
    const pot = potPick ? parseInt(potPick.report.old_pot) || 0 : 0;
    const potStarsVal = potPick ? (parseFloat(potPick.report.potential) || 0) / 2 : 0;
    const rec = potPick ? parseFloat(potPick.report.rec) || 0 : 0;
    const bloomResult = getCurrentBloomStatus(regular, scouts, age);
    const bloomTxt = bloomResult.text || "-";
    const devTxt = bloomPick ? bloomPick.report.dev_status : "-";
    let specVal = 0, specLabel = "None", specConf = null;
    for (const { pick } of skillCategories) {
      if (pick) {
        const s6 = parseInt(pick.report.specialist) || 0;
        if (s6 > 0) {
          specVal = s6;
          specLabel = SPECIALTIES[s6] || "None";
          specConf = pick.conf;
          break;
        }
      }
    }
    const cb = (conf) => {
      if (conf === null) return "";
      if (conf === 0) return '<span class="tmbe-conf text-xs font-bold rounded-sm ml-1 py-0 px-1" style="background:rgba(90,122,72,.15);color:#5a7a48">?</span>';
      let bg, clr;
      if (conf >= 90) {
        bg = "rgba(108,192,64,.15)";
        clr = "#6cc040";
      } else if (conf >= 70) {
        bg = "rgba(251,191,36,.12)";
        clr = "#fbbf24";
      } else {
        bg = "rgba(248,113,113,.1)";
        clr = "#f87171";
      }
      return `<span class="tmbe-conf text-xs font-bold rounded-sm ml-1 py-0 px-1" style="background:${bg};color:${clr}">${conf}%</span>`;
    };
    let peaksH = "";
    for (const p of skillCategories) {
      if (!p.peakArr) continue;
      const maxPeakSum = p.peakArr[p.peakArr.length - 1];
      const tier = extractTier(p.text);
      const curSum = p.value || null;
      if (tier && curSum !== null) {
        const peakSum = p.peakArr[tier.val - 1];
        const peakPct = peakSum / maxPeakSum * 100;
        const curPct = curSum / maxPeakSum * 100;
        const c = barColor(tier.val, tier.max);
        const rPct = Math.round(curSum / peakSum * 100);
        const rC = reachColor(rPct);
        const mPct = Math.round(curSum / maxPeakSum * 100);
        const mC = reachColor(mPct);
        const reachLbl = `<tm-row data-cls="tmbe-peak-reach my-2 text-xs font-bold" data-justify="space-between" data-gap="12px"><tm-row data-gap="4px"><span class="tmbe-reach-tag text-xs font-semibold uppercase">Peak</span><span style="color:${rC}">${rPct}%</span><span class="text-xs" style="color:#90b878;font-weight:400">(${curSum}/${peakSum})</span></tm-row><tm-row data-gap="4px"><span class="tmbe-reach-tag text-xs font-semibold uppercase">Max</span><span style="color:${mC}">${mPct}%</span><span class="text-xs" style="color:#90b878;font-weight:400">(${curSum}/${maxPeakSum})</span></tm-row></tm-row>`;
        peaksH += `<div class="tmbe-item tmbe-peak-item rounded-sm py-2 px-2"><tm-row data-justify="space-between"><span class="tmbe-lbl text-xs font-semibold uppercase">${p.label}</span><span class="tmbe-val text-sm font-bold" style="color:${c}">${tier.val}/${tier.max}${p.conf !== null ? cb(p.conf) : ""}</span></tm-row>${reachLbl}<div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${peakPct}%;background:${c};opacity:0.35"></div><div class="tmbe-bar-fill-reach" style="width:${curPct}%;background:${rC}"></div></div></div>`;
      } else if (curSum !== null) {
        const mPct = Math.round(curSum / maxPeakSum * 100);
        const curPct = curSum / maxPeakSum * 100;
        const mC = reachColor(mPct);
        const reachLbl = `<tm-row data-cls="tmbe-peak-reach text-xs font-bold" data-justify="space-between" data-gap="12px"><tm-row data-gap="4px"><span class="tmbe-reach-tag text-xs font-semibold uppercase">Max</span><span style="color:${mC}">${mPct}%</span><span class="text-xs" style="color:#90b878;font-weight:400">(${curSum}/${maxPeakSum})</span></tm-row></tm-row>`;
        peaksH += `<div class="tmbe-item tmbe-peak-item rounded-sm py-2 px-2"><tm-row data-justify="space-between"><span class="tmbe-lbl text-xs font-semibold uppercase">${p.label}</span><span class="tmbe-val text-sm font-bold" style="color:#5a7a48">?</span></tm-row>${reachLbl}<div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${curPct}%;background:${mC}"></div></div></div>`;
      } else if (tier) {
        const peakSum = p.peakArr[tier.val - 1];
        const peakPct = peakSum / maxPeakSum * 100;
        const c = barColor(tier.val, tier.max);
        peaksH += `<div class="tmbe-item tmbe-peak-item rounded-sm py-2 px-2"><tm-row data-justify="space-between"><span class="tmbe-lbl text-xs font-semibold uppercase">${p.label}</span><span class="tmbe-val text-sm font-bold" style="color:${c}">${tier.val}/${tier.max}${p.conf !== null ? cb(p.conf) : ""}</span></tm-row><div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${peakPct}%;background:${c}"></div></div></div>`;
      }
    }
    let persH = "";
    if (psyPick) {
      const pers = [{ label: "Leadership", value: parseInt(psyPick.report.charisma) || 0 }, { label: "Professionalism", value: parseInt(psyPick.report.professionalism) || 0 }, { label: "Aggression", value: parseInt(psyPick.report.aggression) || 0 }];
      for (const p of pers) {
        const pct = p.value / 20 * 100;
        const c = skillColor2(p.value);
        persH += `<div class="tmbe-bar-row"><tm-row data-justify="space-between"><span class="tmbe-bar-label text-sm font-semibold">${p.label}</span><tm-row data-gap="8px"><span class="tmbe-bar-val text-sm font-bold" style="color:${c}">${p.value}</span>${cb(psyPick.conf)}</tm-row></tm-row><div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${pct}%;background:${c}"></div></div></div>`;
      }
    } else if (!hasScouts) {
      for (const lbl of ["Leadership", "Professionalism", "Aggression"]) {
        persH += `<tm-stat data-label="${lbl}" data-value="?" data-variant="muted"></tm-stat>`;
      }
    }
    const currentRating = recSort !== null ? recSort : rec;
    const hasData = regular.length > 0;
    let h = `<tm-card data-title="${title}" data-icon="${icon}" data-head-ref="head">`;
    h += `<div class="tmbe-grid">`;
    h += `<tm-stat data-label="Potential" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span style="color:${hasData ? potColor(pot) : "#5a7a48"}">${hasData ? pot : "?"}${potPick ? cb(potPick.conf) : ""}</span></tm-stat>`;
    const beBloomClr = hasData ? bloomResult.certain ? bloomResult.phases ? "#80e048" : bloomColor(bloomTxt) : "#fbbf24" : "#5a7a48";
    const beBloomTxt = hasData ? !bloomResult.certain && !bloomResult.phases ? bloomResult.text || bloomResult.range || "-" : bloomTxt : "?";
    let beBloomSub = "";
    if (hasData && bloomResult.phases) beBloomSub += `<span style="display:block;font-size:9px;color:#90b878;font-weight:600;margin-top:1px">${bloomResult.phases}</span>`;
    if (hasData && bloomResult.range && bloomTxt !== "Bloomed") beBloomSub += `<span style="display:block;font-size:9px;color:#6a9a58;font-weight:600;margin-top:1px">${bloomResult.range}</span>`;
    h += `<tm-stat data-label="Bloom" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span style="color:${beBloomClr}">${beBloomTxt}${bloomPick ? cb(bloomPick.conf) : ""}${beBloomSub}</span></tm-stat>`;
    h += `<tm-stat data-label="Development" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span style="color:${hasData ? "#e8f5d8" : "#5a7a48"}">${hasData ? devTxt : "?"}${bloomPick ? cb(bloomPick.conf) : ""}</span></tm-stat>`;
    h += `<tm-stat data-label="Specialty" data-cls="tmbe-item rounded-sm py-1 px-2" data-lbl-cls="text-xs uppercase" data-val-cls="text-sm"><span style="color:${hasData ? specVal > 0 ? "#fbbf24" : "#5a7a48" : "#5a7a48"}">${hasData ? specLabel : "?"}${specConf !== null ? cb(specConf) : ""}</span></tm-stat>`;
    if (peaksH) h += `<tm-divider data-label="Peak Development"></tm-divider>${peaksH}`;
    h += `</div>`;
    if (persH) h += `<tm-divider data-label="Personality"></tm-divider>${persH}`;
    h += `</tm-card>`;
    const refs = TmUI.render(container, h);
    if (refs.head) {
      const starsSpan = document.createElement("span");
      starsSpan.className = "tmbe-title-stars text-xl";
      starsSpan.innerHTML = combinedStarsHtml(currentRating, potStarsVal);
      refs.head.appendChild(starsSpan);
    }
  };
  var TmBestEstimate = { render };

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

  // src/components/shared/tm-canvas-utils.js
  var calcTicks = (min, max, n) => {
    if (max === min) return [min];
    const range = max - min;
    const raw = range / n;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const res = raw / mag;
    let step;
    if (res <= 1.5) step = mag;
    else if (res <= 3) step = 2 * mag;
    else if (res <= 7) step = 5 * mag;
    else step = 10 * mag;
    const ticks = [];
    let t = Math.ceil(min / step) * step;
    while (t <= max + step * 0.01) {
      ticks.push(Math.round(t * 1e4) / 1e4);
      t += step;
    }
    return ticks;
  };
  var setupCanvas = (canvas) => {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth, cssH = canvas.clientHeight;
    if (cssW < 10 || cssH < 10) return null;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.scale(dpr, dpr);
    return { ctx, cssW, cssH, dpr };
  };
  var drawGrid = (ctx, params) => {
    const {
      pL,
      pT,
      pB,
      cssW,
      cssH,
      cW,
      cH,
      xS,
      yS,
      yTicks,
      ageMin,
      ageMax,
      gridColor,
      axisColor,
      formatY = (v) => v.toFixed(1),
      xAxisLabel = "Age",
      yAxisLabel = null
    } = params;
    const FONT_SM = '11px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
    const FONT_MD = '12px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
    ctx.font = FONT_SM;
    ctx.textAlign = "right";
    yTicks.forEach((tick) => {
      const y = yS(tick);
      if (y < pT - 1 || y > pT + cH + 1) return;
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pL, y);
      ctx.lineTo(pL + cW, y);
      ctx.stroke();
      ctx.fillStyle = axisColor;
      ctx.fillText(formatY(tick), pL - 6, y + 4);
    });
    ctx.textAlign = "center";
    for (let a = ageMin; a <= ageMax; a++) {
      const x = xS(a);
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, pT);
      ctx.lineTo(x, pT + cH);
      ctx.stroke();
      ctx.fillStyle = axisColor;
      ctx.fillText(String(a), x, pT + cH + 16);
    }
    ctx.fillStyle = axisColor;
    ctx.font = FONT_MD;
    ctx.textAlign = "center";
    ctx.fillText(xAxisLabel, cssW / 2, cssH - 2);
    if (yAxisLabel) {
      ctx.save();
      ctx.translate(12, pT + cH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = axisColor;
      ctx.font = FONT_MD;
      ctx.textAlign = "center";
      ctx.fillText(yAxisLabel, 0, 0);
      ctx.restore();
    }
  };
  var TmCanvasUtils = { calcTicks, setupCanvas, drawGrid };

  // src/components/player/tm-graphs-mod.js
  var TmGraphsMod = (() => {
    const CSS8 = `
.tmg-chart-wrap {
    position: relative; background: rgba(0,0,0,0.18);
    border: 1px solid rgba(120,180,80,0.25);
    padding: 6px 4px 4px; margin: 6px 0 10px;
}
.tmg-chart-title { color: #e8f5d8; padding: 2px 8px 4px; letter-spacing: 0.3px; }
.tmg-canvas { display: block; cursor: crosshair; }
.tmg-tooltip {
    position: absolute; background: rgba(0,0,0,0.88); color: #fff;
    pointer-events: none;
    z-index: 1000; white-space: nowrap; display: none;
    border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
.tmg-legend {
    display: grid; grid-template-columns: 1fr 1fr; gap: 1px 12px;
    padding: 8px 12px 4px; max-width: 450px; margin: 0 auto;
}
.tmg-legend.tmg-legend-inline {
    grid-template-columns: repeat(3, auto); justify-content: center; gap: 1px 18px;
}
.tmg-legend-item {
    display: flex; align-items: center; gap: 3px;
    color: #ccc; cursor: pointer; user-select: none; padding: 1px 0;
}
.tmg-legend-dot { font-size: 9px; line-height: 1; }
.tmg-enable-card {
    background: rgba(0,0,0,0.18); border: 1px solid rgba(120,180,80,0.25);
    margin: 6px 0 10px;
}
.tmg-enable-title { color: #6a9a58; letter-spacing: 0.3px; }
.tmg-enable-desc { color: #5a7a48; margin-top: 2px; }
.tmg-skill-arrow { margin-left: 1px; }
`;
    (() => {
      const s6 = document.createElement("style");
      s6.textContent = CSS8;
      document.head.appendChild(s6);
    })();
    const htmlOf2 = (node) => (node == null ? void 0 : node.outerHTML) || "";
    const checkboxHtml = (opts) => htmlOf2(TmUI.checkbox(opts));
    let lastData = null;
    let containerRef = null;
    let _isGK2 = false, _playerId2 = null, _playerASI = 0, _ownClubIds = [], _isOwnPlayer = false;
    const ageToMonths4 = TmUtils.ageToMonths;
    const SKILL_META = [
      { key: "strength", label: "Strength", color: "#22cc22" },
      { key: "stamina", label: "Stamina", color: "#00bcd4" },
      { key: "pace", label: "Pace", color: "#8bc34a" },
      { key: "marking", label: "Marking", color: "#f44336" },
      { key: "tackling", label: "Tackling", color: "#26a69a" },
      { key: "workrate", label: "Workrate", color: "#3f51b5" },
      { key: "positioning", label: "Positioning", color: "#9c27b0" },
      { key: "passing", label: "Passing", color: "#e91e63" },
      { key: "crossing", label: "Crossing", color: "#2196f3" },
      { key: "technique", label: "Technique", color: "#ff4081" },
      { key: "heading", label: "Heading", color: "#757575" },
      { key: "finishing", label: "Finishing", color: "#4caf50" },
      { key: "longshots", label: "Longshots", color: "#00e5ff" },
      { key: "set_pieces", label: "Set Pieces", color: "#607d8b" }
    ];
    const SKILL_META_GK = [
      { key: "strength", label: "Strength", color: "#22cc22" },
      { key: "stamina", label: "Stamina", color: "#00bcd4" },
      { key: "pace", label: "Pace", color: "#8bc34a" },
      { key: "handling", label: "Handling", color: "#f44336" },
      { key: "one_on_ones", label: "One on ones", color: "#26a69a" },
      { key: "reflexes", label: "Reflexes", color: "#3f51b5" },
      { key: "aerial_ability", label: "Aerial Ability", color: "#9c27b0" },
      { key: "jumping", label: "Jumping", color: "#e91e63" },
      { key: "communication", label: "Communication", color: "#2196f3" },
      { key: "kicking", label: "Kicking", color: "#ff4081" },
      { key: "throwing", label: "Throwing", color: "#757575" }
    ];
    const getSkillMeta = () => _isGK2 ? SKILL_META_GK : SKILL_META;
    const PEAK_META = [
      { key: "physical", label: "Physical", color: "#ffeb3b" },
      { key: "tactical", label: "Tactical", color: "#00e5ff" },
      { key: "technical", label: "Technical", color: "#ff4081" }
    ];
    const { calcTicks: calcTicks2, setupCanvas: setupCanvas2, drawGrid: drawGrid2 } = TmCanvasUtils;
    const buildAges = (n, years, months) => {
      const cur = years + months / 12;
      const ages = [];
      for (let i = 0; i < n; i++) ages.push(cur - (n - 1 - i) / 12);
      return ages;
    };
    const drawChart = (canvas, ages, values, opts = {}) => {
      const { lineColor = "#fff", fillColor = "rgba(255,255,255,0.06)", gridColor = "rgba(255,255,255,0.10)", axisColor = "#9ab889", dotRadius = 2.5, yMinOverride, yMaxOverride, formatY = (v) => String(Math.round(v)) } = opts;
      const setup = setupCanvas2(canvas);
      if (!setup) return null;
      const { ctx, cssW, cssH } = setup;
      if (ages.length === 1) {
        ages = [ages[0] - 1 / 12, ages[0]];
        values = [values[0], values[0]];
      }
      const pL = 50, pR = 10, pT = 12, pB = 30, cW = cssW - pL - pR, cH = cssH - pT - pB;
      const minA = Math.floor(Math.min(...ages)), maxA = Math.ceil(Math.max(...ages));
      const rMin = Math.min(...values), rMax = Math.max(...values), m = (rMax - rMin) * 0.06 || 1;
      const yMin = yMinOverride !== void 0 ? yMinOverride : Math.floor(rMin - m);
      const yMax = yMaxOverride !== void 0 ? yMaxOverride : Math.ceil(rMax + m);
      const xS = (v) => pL + (v - minA) / (maxA - minA) * cW;
      const yS = (v) => pT + cH - (v - yMin) / (yMax - yMin) * cH;
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(pL, pT, cW, cH);
      const yTicks = calcTicks2(yMin, yMax, 6);
      drawGrid2(ctx, { pL, pT, pB, cssW, cssH, cW, cH, xS, yS, yTicks, ageMin: minA, ageMax: maxA, gridColor, axisColor, formatY });
      ctx.beginPath();
      ctx.moveTo(xS(ages[0]), yS(values[0]));
      for (let i = 1; i < values.length; i++) ctx.lineTo(xS(ages[i]), yS(values[i]));
      ctx.lineTo(xS(ages[ages.length - 1]), pT + cH);
      ctx.lineTo(xS(ages[0]), pT + cH);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.8;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.moveTo(xS(ages[0]), yS(values[0]));
      for (let i = 1; i < values.length; i++) ctx.lineTo(xS(ages[i]), yS(values[i]));
      ctx.stroke();
      for (let i = 0; i < values.length; i++) {
        ctx.beginPath();
        ctx.arc(xS(ages[i]), yS(values[i]), dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.25)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(120,180,80,0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(pL, pT, cW, cH);
      return { xS, yS, ages, values, formatY };
    };
    const drawMultiLine = (canvas, ages, seriesData, opts = {}) => {
      const { gridColor = "rgba(255,255,255,0.10)", axisColor = "#9ab889", yMinOverride, yMaxOverride, formatY = (v) => String(Math.round(v)), dotRadius = 1.5, yTickCount = 6 } = opts;
      const setup = setupCanvas2(canvas);
      if (!setup) return null;
      const { ctx, cssW, cssH } = setup;
      if (ages.length === 1) {
        ages = [ages[0] - 1 / 12, ages[0]];
        seriesData = seriesData.map((s6) => ({ ...s6, values: [s6.values[0], s6.values[0]] }));
      }
      const pL = 50, pR = 10, pT = 12, pB = 30, cW = cssW - pL - pR, cH = cssH - pT - pB;
      const vis = seriesData.filter((s6) => s6.visible);
      let all = [];
      vis.forEach((s6) => all.push(...s6.values));
      if (!all.length) all = [0, 1];
      const rMin = Math.min(...all), rMax = Math.max(...all), m = (rMax - rMin) * 0.06 || 1;
      const yMin = yMinOverride !== void 0 ? yMinOverride : Math.floor(rMin - m);
      const yMax = yMaxOverride !== void 0 ? yMaxOverride : Math.ceil(rMax + m);
      const minA = Math.floor(Math.min(...ages)), maxA = Math.ceil(Math.max(...ages));
      const xS = (v) => pL + (v - minA) / (maxA - minA) * cW;
      const yS = (v) => pT + cH - (v - yMin) / (yMax - yMin) * cH;
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(pL, pT, cW, cH);
      const yTicks = calcTicks2(yMin, yMax, yTickCount);
      drawGrid2(ctx, { pL, pT, pB, cssW, cssH, cW, cH, xS, yS, yTicks, ageMin: minA, ageMax: maxA, gridColor, axisColor, formatY });
      vis.forEach((s6) => {
        ctx.beginPath();
        ctx.strokeStyle = s6.color;
        ctx.lineWidth = 1.5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.moveTo(xS(ages[0]), yS(s6.values[0]));
        for (let i = 1; i < s6.values.length; i++) ctx.lineTo(xS(ages[i]), yS(s6.values[i]));
        ctx.stroke();
        for (let i = 0; i < s6.values.length; i++) {
          ctx.beginPath();
          ctx.arc(xS(ages[i]), yS(s6.values[i]), dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = s6.color;
          ctx.fill();
        }
      });
      ctx.strokeStyle = "rgba(120,180,80,0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(pL, pT, cW, cH);
      return { xS, yS, ages, seriesData, formatY };
    };
    const attachTooltip = (wrap, canvas, info) => {
      const tip = wrap.querySelector(".tmg-tooltip");
      if (!tip) return;
      canvas.addEventListener("mousemove", (e) => {
        const r = canvas.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        let best = -1, bd = Infinity;
        for (let i = 0; i < info.ages.length; i++) {
          const d = Math.hypot(mx - info.xS(info.ages[i]), my - info.yS(info.values[i]));
          if (d < bd && d < 25) {
            bd = d;
            best = i;
          }
        }
        if (best >= 0) {
          const a = info.ages[best], v = info.values[best];
          const ay = Math.floor(a), am = Math.round((a - ay) * 12);
          tip.innerHTML = `<b>Age:</b> ${ay}y ${am}m &nbsp; <b>Value:</b> ${info.formatY(v)}`;
          tip.style.display = "block";
          const px = info.xS(a), py = info.yS(v);
          let tx = px - tip.offsetWidth / 2;
          if (tx < 0) tx = 0;
          if (tx + tip.offsetWidth > canvas.clientWidth) tx = canvas.clientWidth - tip.offsetWidth;
          tip.style.left = tx + "px";
          tip.style.top = py - 32 + "px";
        } else tip.style.display = "none";
      });
      canvas.addEventListener("mouseleave", () => {
        tip.style.display = "none";
      });
    };
    const attachMultiTooltip = (wrap, canvas, infoGetter) => {
      const tip = wrap.querySelector(".tmg-tooltip");
      if (!tip) return;
      canvas.addEventListener("mousemove", (e) => {
        const r = canvas.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        const info = infoGetter();
        if (!info) return;
        let best = null, bd = Infinity;
        info.seriesData.filter((s6) => s6.visible).forEach((s6) => {
          for (let i = 0; i < s6.values.length; i++) {
            const d = Math.hypot(mx - info.xS(info.ages[i]), my - info.yS(s6.values[i]));
            if (d < bd && d < 25) {
              bd = d;
              best = { series: s6, idx: i };
            }
          }
        });
        if (best) {
          const a = info.ages[best.idx], v = best.series.values[best.idx];
          const ay = Math.floor(a), am = Math.round((a - ay) * 12);
          tip.innerHTML = `<span style="color:${best.series.color}">\u25CF</span> <b>${best.series.label}:</b> ${info.formatY(v)} &nbsp; <b>Age:</b> ${ay}y ${am}m`;
          tip.style.display = "block";
          const px = info.xS(a), py = info.yS(v);
          let tx = px - tip.offsetWidth / 2;
          if (tx < 0) tx = 0;
          if (tx + tip.offsetWidth > canvas.clientWidth) tx = canvas.clientWidth - tip.offsetWidth;
          tip.style.left = tx + "px";
          tip.style.top = py - 32 + "px";
        } else tip.style.display = "none";
      });
      canvas.addEventListener("mouseleave", () => {
        tip.style.display = "none";
      });
    };
    const CHART_DEFS = [
      { key: "ti", title: "Training Intensity", opts: { lineColor: "#fff", fillColor: "rgba(255,255,255,0.05)" }, prepareData: (raw) => {
        const v = [];
        for (let i = 0; i < raw.length; i++) {
          if (i === 0 && typeof raw[i] === "number" && Number(raw[i]) === 0) continue;
          v.push(Number(raw[i]));
        }
        return v;
      } },
      { key: "skill_index", title: "ASI", opts: { lineColor: "#fff", fillColor: "rgba(255,255,255,0.05)", formatY: (v) => v >= 1e3 ? Math.round(v).toLocaleString() : String(Math.round(v)) }, prepareData: (raw) => raw.map(Number) },
      { key: "recommendation", title: "REC", opts: { lineColor: "#fff", fillColor: "rgba(255,255,255,0.05)", yMinOverride: 0, formatY: (v) => v.toFixed(1) }, prepareData: (raw) => {
        const v = raw.map(Number);
        return v;
      }, yMaxFn: (vals) => Math.max(6, Math.ceil(Math.max(...vals) * 10) / 10) }
    ];
    const MULTI_DEFS = [
      { title: "Skills", get meta() {
        return getSkillMeta();
      }, showToggle: true, enableKey: "skills", getSeriesData: (g) => {
        const sm = getSkillMeta();
        return sm.map((m) => ({ key: m.key, label: m.label, color: m.color, values: (g[m.key] || []).map(Number), visible: true }));
      }, opts: { yMinOverride: 0, yMaxOverride: 20, dotRadius: 1.5, yTickCount: 11 } },
      {
        title: "Peaks",
        meta: PEAK_META,
        showToggle: false,
        enableKey: "peaks",
        getSeriesData: (g) => {
          const pk = g.peaks || {};
          console.log("[Graphs] Raw peaks data", { pk });
          if (_isGK2) {
            const PHYS2 = ["strength", "stamina", "pace", "jumping"];
            const TACT2 = ["one_on_ones", "aerial_ability", "communication"];
            const TECH2 = ["handling", "reflexes", "kicking", "throwing"];
            const L2 = (g[PHYS2[0]] || []).length;
            if (L2 < 1) return PEAK_META.map((m) => ({ key: m.key, label: m.label, color: m.color, values: [], visible: true }));
            const sumAt2 = (keys, i) => keys.reduce((s6, k) => s6 + ((g[k] || [])[i] || 0), 0);
            const phys2 = [], tact2 = [], tech2 = [];
            for (let i = 0; i < L2; i++) {
              phys2.push(Math.round(sumAt2(PHYS2, i) / 80 * 1e3) / 10);
              tact2.push(Math.round(sumAt2(TACT2, i) / 60 * 1e3) / 10);
              tech2.push(Math.round(sumAt2(TECH2, i) / 80 * 1e3) / 10);
            }
            return [
              { key: "physical", label: "Physical", color: "#ffeb3b", values: phys2, visible: true },
              { key: "tactical", label: "Tactical", color: "#00e5ff", values: tact2, visible: true },
              { key: "technical", label: "Technical", color: "#ff4081", values: tech2, visible: true }
            ];
          }
          const PHYS = ["strength", "stamina", "pace", "heading"];
          const TACT = ["marking", "tackling", "workrate", "positioning"];
          const TECH = ["passing", "crossing", "technique", "finishing", "longshots", "set_pieces"];
          const L = (g[PHYS[0]] || []).length;
          if (L < 1) return PEAK_META.map((m) => ({ key: m.key, label: m.label, color: m.color, values: [], visible: true }));
          const sumAt = (keys, i) => keys.reduce((s6, k) => s6 + ((g[k] || [])[i] || 0), 0);
          const phys = [], tact = [], tech = [];
          for (let i = 0; i < L; i++) {
            phys.push(Math.round(sumAt(PHYS, i) / 80 * 1e3) / 10);
            tact.push(Math.round(sumAt(TACT, i) / 80 * 1e3) / 10);
            tech.push(Math.round(sumAt(TECH, i) / 120 * 1e3) / 10);
          }
          console.log("[Graphs] Peaks computed from skills", { g });
          return [
            { key: "physical", label: "Physical", color: "#ffeb3b", values: phys, visible: true },
            { key: "tactical", label: "Tactical", color: "#00e5ff", values: tact, visible: true },
            { key: "technical", label: "Technical", color: "#ff4081", values: tech, visible: true }
          ];
        },
        opts: { dotRadius: 1.5, yMinOverride: 0, yMaxOverride: 100, formatY: (v) => v.toFixed(1) + "%" },
        legendInline: true
      }
    ];
    const buildSingleChart = (el, def, graphData, player) => {
      let values, ages;
      let enhanced = false;
      if (def.key === "skill_index" && (!graphData[def.key] || graphData[def.key].length < 2)) {
        if (_playerASI > 0 && graphData.ti && graphData.ti.length >= 2) {
          try {
            const tiRaw = graphData.ti;
            const tiStart = typeof tiRaw[0] === "number" && tiRaw[0] === 0 || tiRaw[0] === "0" || tiRaw[0] === 0 ? 1 : 0;
            const tiVals = tiRaw.slice(tiStart).map((v) => parseInt(v) || 0);
            const L = tiVals.length;
            if (L >= 2) {
              const K = _isGK2 ? 48717927500 : Math.pow(2, 9) * Math.pow(5, 4) * Math.pow(7, 7);
              const asiArr = new Array(L);
              asiArr[L - 1] = _playerASI;
              for (let j = L - 2; j >= 0; j--) {
                const ti = tiVals[j + 1];
                const base = Math.pow(asiArr[j + 1] * K, 1 / 7);
                asiArr[j] = Math.max(0, Math.round(Math.pow(base - ti / 10, 7) / K));
              }
              values = asiArr;
              ages = buildAges(L, player.years, player.months);
              enhanced = true;
              console.log(`[Graphs] ASI reconstructed from TI (${L} points)`);
            }
          } catch (e) {
            console.warn("[Graphs] ASI from TI failed", e);
          }
        }
        if (!values) {
          try {
            const store = TmPlayerDB.get(_playerId2);
            if (store && store.records) {
              const keys = Object.keys(store.records).sort((a, b) => ageToMonths4(a) - ageToMonths4(b));
              const tmpAges = [], tmpVals = [];
              keys.forEach((k) => {
                const si = parseInt(store.records[k].SI) || 0;
                if (si <= 0) return;
                tmpAges.push(ageToMonths4(k) / 12);
                tmpVals.push(si);
              });
              if (tmpVals.length > 0 && _playerASI > 0) {
                const curAge = player.years + player.months / 12;
                const lastAge = tmpAges[tmpAges.length - 1];
                if (curAge > lastAge + 1e-3) {
                  tmpAges.push(curAge);
                  tmpVals.push(_playerASI);
                }
              }
              if (tmpVals.length >= 1) {
                values = tmpVals;
                ages = tmpAges;
                enhanced = true;
              }
            }
          } catch (e) {
          }
        }
        if (!values) return;
      } else if (def.key === "recommendation" && (!graphData[def.key] || graphData[def.key].length < 2)) {
        try {
          const store = TmPlayerDB.get(_playerId2);
          if (store && store._v >= 3 && store.records) {
            const keys = Object.keys(store.records).sort((a, b) => ageToMonths4(a) - ageToMonths4(b));
            const tmpAges = [], tmpVals = [];
            keys.forEach((k) => {
              const rec = store.records[k];
              if (rec.REREC == null) return;
              tmpAges.push(ageToMonths4(k) / 12);
              tmpVals.push(rec.REREC);
            });
            if (tmpVals.length >= 1) {
              values = tmpVals;
              ages = tmpAges;
              enhanced = true;
            }
          }
        } catch (e) {
        }
        if (!values) return;
      } else if (def.key === "ti" && (!graphData[def.key] || graphData[def.key].length < 2)) {
        const K = _isGK2 ? 48717927500 : Math.pow(2, 9) * Math.pow(5, 4) * Math.pow(7, 7);
        if (graphData.skill_index && graphData.skill_index.length >= 2) {
          try {
            const asiRaw = graphData.skill_index.map(Number);
            const tiVals = [];
            for (let i = 1; i < asiRaw.length; i++) {
              const prev = Math.pow(asiRaw[i - 1] * K, 1 / 7);
              const cur = Math.pow(asiRaw[i] * K, 1 / 7);
              tiVals.push(Math.round((cur - prev) * 10));
            }
            if (tiVals.length >= 2) {
              values = tiVals;
              ages = buildAges(tiVals.length, player.years, player.months);
              enhanced = true;
              console.log(`[Graphs] TI computed from ASI graph (${tiVals.length} points)`);
            }
          } catch (e) {
            console.warn("[Graphs] TI from ASI graph failed", e);
          }
        }
        if (!values) {
          try {
            const store = TmPlayerDB.get(_playerId2);
            if (store && store.records) {
              const keys = Object.keys(store.records).sort((a, b) => ageToMonths4(a) - ageToMonths4(b));
              let changed = false;
              for (let i = 1; i < keys.length; i++) {
                const rec = store.records[keys[i]];
                if (rec.TI != null) continue;
                const prevSI = Number(store.records[keys[i - 1]].SI) || 0;
                const curSI = Number(rec.SI) || 0;
                if (prevSI > 0 && curSI > 0) {
                  rec.TI = Math.round((Math.pow(curSI * K, 1 / 7) - Math.pow(prevSI * K, 1 / 7)) * 10);
                  changed = true;
                }
              }
              if (changed) TmPlayerDB.set(_playerId2, store);
              const tiVals = [], tiAges = [];
              for (let i = 1; i < keys.length; i++) {
                const rec = store.records[keys[i]];
                if (rec.TI == null) continue;
                tiVals.push(rec.TI);
                tiAges.push(ageToMonths4(keys[i]) / 12);
              }
              if (tiVals.length >= 2) {
                values = tiVals;
                ages = tiAges;
                enhanced = true;
                console.log(`[Graphs] TI from IndexedDB (${tiVals.length} points, ${changed ? "computed & saved" : "already stored"})`);
              }
            }
          } catch (e) {
          }
        }
        if (!values) return;
      } else {
        const raw = graphData[def.key];
        if (!raw) return;
        values = def.prepareData(raw);
        if (!values.length) return;
        ages = buildAges(values.length, player.years, player.months);
      }
      let recSpliceIdx = -1;
      if (def.key === "recommendation") {
        try {
          const store = TmPlayerDB.get(_playerId2);
          if (store && store._v >= 3 && store.records) {
            const curAgeMonths = player.years * 12 + player.months;
            const L = values.length;
            for (let i = 0; i < L; i++) {
              const am = curAgeMonths - (L - 1 - i);
              const key = `${Math.floor(am / 12)}.${am % 12}`;
              const rec = store.records[key];
              if (rec && rec.REREC != null) {
                if (recSpliceIdx < 0) recSpliceIdx = i;
                values[i] = rec.REREC;
              }
            }
            if (recSpliceIdx >= 0) console.log(`[Graphs] REC hybrid: TM data 0..${recSpliceIdx - 1}, our data ${recSpliceIdx}..${L - 1}`);
          }
        } catch (e) {
        }
      }
      const chartOpts = { ...def.opts };
      if (def.yMaxFn) chartOpts.yMaxOverride = def.yMaxFn(values);
      if (recSpliceIdx >= 0 || enhanced && def.key === "recommendation") {
        chartOpts.formatY = (v) => v % 1 === 0 ? v.toFixed(1) : v.toFixed(2);
      }
      const wrap = document.createElement("div");
      wrap.className = "tmg-chart-wrap rounded-md";
      let enhLabel = "";
      if (enhanced && def.key === "skill_index") enhLabel = ' <span class="text-xs font-normal" style="color:#f0c040">(from TI)</span>';
      else if (enhanced && def.key === "ti") enhLabel = ' <span class="text-xs font-normal" style="color:#f0c040">(from ASI)</span>';
      else if (enhanced && def.key === "recommendation") enhLabel = ' <span class="text-xs font-normal blue">(computed)</span>';
      else if (recSpliceIdx >= 0) enhLabel = ' <span class="text-xs font-normal" style="color:#38bdf8">(enhanced)</span>';
      wrap.innerHTML = `<div class="tmg-chart-title text-md font-bold">${def.title}${enhLabel}</div><canvas class="tmg-canvas" style="width:100%;height:260px;"></canvas><div class="tmg-tooltip py-1 px-2 rounded-sm text-sm"></div>`;
      el.appendChild(wrap);
      const canvas = wrap.querySelector("canvas");
      requestAnimationFrame(() => {
        const info = drawChart(canvas, ages, values, chartOpts);
        attachTooltip(wrap, canvas, info);
      });
    };
    const buildStoreSkillGraphData = (player) => {
      try {
        const store = TmPlayerDB.get(_playerId2);
        if (!store || !store.records) {
          console.log("[Skills] No store or no records");
          return null;
        }
        const sm = getSkillMeta();
        const expectedLen = sm.length;
        const sortedKeys = Object.keys(store.records).sort((a, b) => ageToMonths4(a) - ageToMonths4(b));
        console.log("[Skills] store._v:", store._v, "total records:", sortedKeys.length, "isGK:", _isGK2);
        const skillArrays = {};
        sm.forEach((m) => {
          skillArrays[m.key] = [];
        });
        let count = 0;
        sortedKeys.forEach((k) => {
          var _a;
          const rec = store.records[k];
          const hasSkills = rec.skills && rec.skills.length >= expectedLen;
          const nonZero = hasSkills && rec.skills.some((v) => v !== 0);
          if (!hasSkills || !nonZero) {
            console.log(`[Skills] skip ${k}: hasSkills=${hasSkills}, nonZero=${nonZero}`, (_a = rec.skills) == null ? void 0 : _a.slice(0, 3));
            return;
          }
          sm.forEach((m, i) => {
            skillArrays[m.key].push(rec.skills[i]);
          });
          count++;
        });
        console.log("[Skills] usable records with skills:", count);
        if (count < 1) return null;
        skillArrays._ages = sortedKeys.filter((k) => {
          const r = store.records[k];
          return r.skills && r.skills.length >= expectedLen && r.skills.some((v) => v !== 0);
        }).map((k) => ageToMonths4(k) / 12);
        return skillArrays;
      } catch (e) {
        console.log("[Skills] error:", e);
        return null;
      }
    };
    const buildMultiChart = (el, def, graphData, player, skillpoints, isOwnPlayer) => {
      var _a;
      let seriesData = def.getSeriesData(graphData);
      let fromStore = false;
      let storeAges = null;
      if (!seriesData.length || !seriesData[0].values.length) {
        const storeGD = buildStoreSkillGraphData(player);
        if (storeGD) {
          storeAges = storeGD._ages;
          seriesData = def.getSeriesData(storeGD);
        }
        if (!seriesData.length || !seriesData[0].values.length) {
          if (isOwnPlayer && def.enableKey) {
            buildEnableCard(el, def.enableKey);
          } else if (def.enableKey) {
            const msg = document.createElement("div");
            msg.className = "rounded-md text-sm";
            msg.style.cssText = "background:rgba(0,0,0,0.15);border:1px solid rgba(120,180,80,0.2);padding:10px 14px;margin:4px 0 8px;color:#5a7a48;";
            msg.textContent = `${def.title}: No data available (graph not enabled)`;
            el.appendChild(msg);
          }
          return;
        }
        fromStore = true;
      }
      const ages = storeAges || buildAges(seriesData[0].values.length, player.years, player.months);
      const wrap = document.createElement("div");
      wrap.className = "tmg-chart-wrap rounded-md";
      const upSet = new Set((skillpoints == null ? void 0 : skillpoints.up) || []);
      const downSet = new Set((skillpoints == null ? void 0 : skillpoints.down) || []);
      const legendCls = def.legendInline ? "tmg-legend tmg-legend-inline" : "tmg-legend";
      let legendH = `<div class="${legendCls}">`;
      seriesData.forEach((s6, i) => {
        let arr = "";
        if (upSet.has(s6.key)) arr = '<span class="tmg-skill-arrow text-xs" style="color:#4caf50">\u25B2</span>';
        else if (downSet.has(s6.key)) arr = '<span class="tmg-skill-arrow text-xs" style="color:#f44336">\u25BC</span>';
        legendH += `<label class="tmg-legend-item text-sm">${checkboxHtml({
          checked: true,
          attrs: {
            "data-idx": i,
            style: `--tmu-checkbox-checked-bg:${s6.color};--tmu-checkbox-checked-border:${s6.color};`
          }
        })}<span class="tmg-legend-dot" style="color:${s6.color}">\u25CF</span>${s6.label}${arr}</label>`;
      });
      legendH += "</div>";
      let toggleH = def.showToggle ? '<tm-row data-justify="center" data-gap="6px" data-cls="pt-1 pb-1"><tm-button data-variant="secondary" data-size="sm" data-cls="tmg-btn uppercase" data-action="all">All</tm-button><tm-button data-variant="secondary" data-size="sm" data-cls="tmg-btn uppercase" data-action="none">None</tm-button></tm-row>' : "";
      const computedLabel = fromStore ? ' <span class="text-xs font-normal blue">(computed)</span>' : "";
      const enableKey = fromStore && isOwnPlayer && def.enableKey ? def.enableKey : null;
      const enableBtnH = enableKey ? `<tm-button data-variant="lime" data-size="xs" data-cls="tmg-enable-btn font-bold uppercase" data-action="enableGraph" style="margin-left:auto;">Enable <img src="/pics/pro_icon.png" class="pro_icon"></tm-button>` : "";
      wrap.innerHTML = `<div class="tmg-chart-title text-md font-bold" style="display:flex;align-items:center;gap:8px;">${def.title}${computedLabel}${enableBtnH}</div><canvas class="tmg-canvas" style="width:100%;height:280px;"></canvas><div class="tmg-tooltip py-1 px-2 rounded-sm text-sm"></div>${legendH}${toggleH}`;
      el.appendChild(wrap);
      const canvas = wrap.querySelector("canvas");
      let curInfo = null;
      const redraw = () => {
        curInfo = drawMultiLine(canvas, ages, seriesData, def.opts);
      };
      const handlers = {};
      if (enableKey) handlers.enableGraph = () => {
        if (typeof window.graph_enable === "function") window.graph_enable(_playerId2, enableKey);
      };
      if (def.showToggle) {
        handlers.all = () => {
          seriesData.forEach((s6) => s6.visible = true);
          wrap.querySelectorAll(".tmg-legend .tmu-checkbox").forEach((cb) => {
            cb.checked = true;
          });
          redraw();
        };
        handlers.none = () => {
          seriesData.forEach((s6) => s6.visible = false);
          wrap.querySelectorAll(".tmg-legend .tmu-checkbox").forEach((cb) => {
            cb.checked = false;
          });
          redraw();
        };
      }
      (_a = TmUI) == null ? void 0 : _a.render(wrap, void 0, handlers);
      wrap.querySelectorAll(".tmg-legend .tmu-checkbox").forEach((cb) => {
        cb.addEventListener("change", () => {
          const i = parseInt(cb.dataset.idx, 10);
          seriesData[i].visible = cb.checked;
          redraw();
        });
      });
      attachMultiTooltip(wrap, canvas, () => curInfo);
      requestAnimationFrame(() => redraw());
    };
    const ENABLE_INFO = {
      skill_index: { title: "Skill Index", desc: "Monitor your player's ASI increase each training.", enableKey: "skill_index" },
      recommendation: { title: "Recommendation", desc: "See when your player gained new recommendation stars.", enableKey: "recommendation" },
      skills: { title: "Skills", desc: "Monitor when a player gained a point in a certain skill.", enableKey: "skills" },
      peaks: { title: "Peaks", desc: "See what % of weekly training went into each peak area.", enableKey: "peaks" }
    };
    const buildR5Chart = (el, player) => {
      var _a;
      try {
        const store = TmPlayerDB.get(_playerId2);
        if (!store || store._v < 3 || !store.records) return;
        const keys = Object.keys(store.records).sort((a, b) => ageToMonths4(a) - ageToMonths4(b));
        const ages = [], values = [];
        keys.forEach((k) => {
          const rec = store.records[k];
          if (rec.R5 == null) return;
          ages.push(ageToMonths4(k) / 12);
          values.push(rec.R5);
        });
        if (values.length < 2) return;
        const rawMin = Math.min(...values), rawMax = Math.max(...values);
        const yMin = rawMin < 30 ? Math.floor(rawMin) : 30;
        const yMax = rawMax > 120 ? Math.ceil(rawMax) : 120;
        const opts = {
          lineColor: "#5b9bff",
          fillColor: "rgba(91,155,255,0.06)",
          yMinOverride: yMin,
          yMaxOverride: yMax,
          formatY: (v) => v % 1 === 0 ? v.toFixed(1) : v.toFixed(2)
        };
        const wrap = document.createElement("div");
        wrap.className = "tmg-chart-wrap rounded-md";
        wrap.innerHTML = `<div class="tmg-chart-title text-md font-bold" style="display:flex;align-items:center;justify-content:space-between">
                    <span>R5 <span class="text-xs font-normal blue">(computed)</span></span>
                    <tm-button data-variant="secondary" data-size="xs" data-cls="tmg-export-btn" title="Export to Excel">\u2B07 Excel</tm-button>
                </div><canvas class="tmg-canvas" style="width:100%;height:260px;"></canvas><div class="tmg-tooltip py-1 px-2 rounded-sm text-sm"></div>`;
        el.appendChild(wrap);
        (_a = TmUI) == null ? void 0 : _a.render(wrap);
        wrap.querySelector(".tmg-export-btn").addEventListener("click", () => {
          const row = values.map((v) => v.toFixed(2).replace(".", ",")).join(";");
          const csv = "sep=;\r\n" + row + "\r\n";
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `R5_player_${_playerId2}.csv`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 500);
        });
        const canvas = wrap.querySelector("canvas");
        requestAnimationFrame(() => {
          const info = drawChart(canvas, ages, values, opts);
          attachTooltip(wrap, canvas, info);
        });
      } catch (e) {
      }
    };
    const buildEnableCard = (container, key) => {
      var _a;
      console.log("[Graphs] Building enable card for", key);
      const info = ENABLE_INFO[key];
      if (!info) return;
      const card = document.createElement("div");
      card.className = "tmg-enable-card rounded-md py-4 px-4";
      card.innerHTML = `<tm-row data-justify="space-between" data-align="center" data-gap="12px"><div><div class="tmg-enable-title text-md font-bold">${info.title}</div><div class="tmg-enable-desc text-sm">${info.desc}</div></div><tm-button data-variant="lime" data-size="sm" data-cls="tmg-enable-btn font-bold uppercase px-4" data-action="enableGraph">Enable <img src="/pics/pro_icon.png" class="pro_icon"></tm-button></tm-row>`;
      (_a = TmUI) == null ? void 0 : _a.render(card, void 0, {
        enableGraph: () => {
          if (typeof window.graph_enable === "function") window.graph_enable(_playerId2, info.enableKey);
        }
      });
      container.appendChild(card);
    };
    const render5 = (container, data, { isGK = false, playerId, playerASI = 0, ownClubIds = [], isOwnPlayer = false } = {}) => {
      containerRef = container;
      lastData = data;
      _isGK2 = isGK;
      _playerId2 = playerId;
      _playerASI = playerASI;
      _ownClubIds = ownClubIds;
      _isOwnPlayer = isOwnPlayer;
      container.innerHTML = "";
      const graphData = data.graphs;
      const player = data.player;
      const skillpoints = data.skillpoints;
      if (!graphData || !player) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#5a7a48;font-style:italic">No graph data available</div>';
        return;
      }
      buildSingleChart(container, CHART_DEFS[0], graphData, player);
      buildR5Chart(container, player);
      for (let i = 1; i < CHART_DEFS.length; i++) buildSingleChart(container, CHART_DEFS[i], graphData, player);
      MULTI_DEFS.forEach((def) => buildMultiChart(container, def, graphData, player, skillpoints, isOwnPlayer));
    };
    const reRender4 = () => {
      if (containerRef && lastData) render5(containerRef, lastData, { isGK: _isGK2, playerId: _playerId2, playerASI: _playerASI, ownClubIds: _ownClubIds, isOwnPlayer: _isOwnPlayer });
    };
    return { render: render5, reRender: reRender4 };
  })();

  // src/components/player/tm-player-card.js
  var CSS3 = `
/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   PLAYER CARD (tmpc-*)
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
.tmpc-header {
    display: flex; gap: 16px; padding: 14px; align-items: flex-start;
}
.tmpc-photo {
    width: 110px; min-width: 110px; border-radius: 6px;
    border: 3px solid #3d6828; display: block;
}
.tmpc-info { flex: 1; min-width: 0; }
.tmpc-top-grid {
    display: grid; grid-template-columns: 1fr auto;
    gap: 2px 8px; align-items: center; margin-bottom: 10px;
}
.tmpc-name {
    font-size: 16px; font-weight: 800; color: #e8f5d8;
    line-height: 1.2;
}
.tmpc-pos-row {
    display: flex; align-items: center; gap: 6px;
    flex-wrap: wrap;
}
.tmpc-details {
    display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px;
}
.tmpc-val {
    color: #c8e0b4; font-size: 12px; font-weight: 700;
    font-variant-numeric: tabular-nums;
}
.tmpc-pos-ratings {
    border-top: 1px solid #3d6828; padding: 6px 14px;
}
.tmpc-rating-row {
    display: flex; align-items: center; gap: 10px;
    padding: 5px 0;
}
.tmpc-rating-row + .tmpc-rating-row { border-top: 1px solid rgba(61,104,40,.2); }
.tmpc-pos-bar {
    width: 4px; height: 22px; border-radius: 2px; flex-shrink: 0;
}
.tmpc-pos-name {
    font-size: 11px; font-weight: 700; min-width: 32px;
    letter-spacing: 0.3px;
}
.tmpc-pos-stat {
    display: flex; align-items: baseline; gap: 4px; margin-left: auto;
}
.tmpc-pos-stat + .tmpc-pos-stat { margin-left: 16px; }
.tmpc-pos-stat-lbl {
    color: #6a9a58; font-size: 9px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.3px;
}
.tmpc-pos-stat-val {
    font-size: 14px; font-weight: 800; letter-spacing: -0.3px;
    font-variant-numeric: tabular-nums;
}
.tmpc-expand-toggle {
    display: flex; align-items: center; justify-content: center;
    gap: 6px; padding: 4px 0; cursor: pointer;
    border-top: 1px solid rgba(61,104,40,.25);
    color: #6a9a58; font-size: 10px; font-weight: 600;
    letter-spacing: 0.4px; text-transform: uppercase;
    transition: color .15s;
}
.tmpc-expand-toggle:hover { color: #80e048; }
.tmpc-expand-chevron {
    display: inline-block; font-size: 10px; transition: transform .2s;
}
.tmpc-expand-toggle.tmpc-expanded .tmpc-expand-chevron { transform: rotate(180deg); }
.tmpc-all-positions {
    max-height: 0; overflow: hidden; transition: max-height .3s ease;
}
.tmpc-all-positions.tmpc-expanded {
    max-height: 600px;
}
.tmpc-all-positions .tmpc-rating-row.tmpc-is-player-pos {
    background: rgba(61,104,40,.15);
}
.tmpc-rec-stars { font-size: 14px; letter-spacing: 1px; margin-top: 2px; line-height: 1; }
.tmpc-star-full { color: #fbbf24; }
.tmpc-star-half {
    background: linear-gradient(90deg, #fbbf24 50%, #3d6828 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmpc-star-empty { color: #3d6828; }
.tmpc-flag { vertical-align: middle; margin-left: 4px; }
`;
  var s3 = document.createElement("style");
  s3.textContent = CSS3;
  document.head.appendChild(s3);
  var render2 = ({ player, club } = {}) => {
    var _a, _b;
    const { calculatePlayerR5: calculatePlayerR53, calculatePlayerREC: calculatePlayerREC3 } = TmLib;
    const { getColor: getColor2 } = TmUtils;
    const { R5_THRESHOLDS: R5_THRESHOLDS2, REC_THRESHOLDS: REC_THRESHOLDS2, TI_THRESHOLDS: TI_THRESHOLDS2, RTN_THRESHOLDS: RTN_THRESHOLDS2, POSITION_MAP: POSITION_MAP2 } = TmConst;
    const badgeHtml2 = (opts, tone = "muted") => TmUI.badge({ size: "md", shape: "rounded", weight: "heavy", ...opts }, tone);
    const infoTable = document.querySelector("table.info_table.zebra");
    if (!infoTable || !player) return null;
    const imgEl = infoTable.querySelector('img[src*="player_pic"]');
    const photoSrc = imgEl ? imgEl.getAttribute("src") : "/pics/player_pic2.php";
    const infoWrapper = infoTable.closest("div.std") || infoTable.parentElement;
    const asiDisplay = player.asi > 0 ? player.asi.toLocaleString() : "-";
    const wageNum = player.wage || 0;
    const wageDisplay = wageNum > 0 ? `\u20AC ${wageNum.toLocaleString()}` : "-";
    const statusHtml = typeof player.status === "string" ? player.status : "";
    const clubName = (club == null ? void 0 : club.club_name) || (club == null ? void 0 : club.name) || "-";
    const clubHref = club ? `/club/${player.club_id || club.id}/` : "";
    const clubCountry = (club == null ? void 0 : club.country) || "";
    const clubFlag = clubCountry ? `<span class="flag-img-${clubCountry}" style="display:inline-block;vertical-align:middle;margin-left:4px"></span>` : "";
    const playerName = player.name || "Player";
    const posEl = document.querySelector(".favposition.long");
    const posText = posEl ? posEl.textContent.trim() : "";
    const flagEl = document.querySelector(".box_sub_header .country_link");
    const flagHtml = flagEl ? flagEl.outerHTML : "";
    const hasNT = !!document.querySelector(".nt_icon");
    const recTd = (_b = (_a = [...infoTable.querySelectorAll("tr")].find((tr) => {
      var _a2;
      return ((_a2 = tr.querySelector("th")) == null ? void 0 : _a2.textContent.trim()) === "Recommendation";
    })) == null ? void 0 : _a.querySelector("td")) != null ? _b : null;
    let recStarsHtml = "";
    if (recTd) {
      const halfStars = (recTd.innerHTML.match(/half_star\.png/g) || []).length;
      const darkStars = (recTd.innerHTML.match(/dark_star\.png/g) || []).length;
      const allStarMatches = (recTd.innerHTML.match(/star\.png/g) || []).length;
      const fullStars = allStarMatches - halfStars - darkStars;
      for (let i = 0; i < fullStars; i++) recStarsHtml += '<span class="tmpc-star-full">\u2605</span>';
      if (halfStars) recStarsHtml += '<span class="tmpc-star-half">\u2605</span>';
      const empty = 5 - fullStars - (halfStars ? 1 : 0);
      for (let i = 0; i < empty; i++) recStarsHtml += '<span class="tmpc-star-empty">\u2605</span>';
    }
    const ntBadge = hasNT ? badgeHtml2({ icon: "\u{1F3C6}", label: "NT", size: "xs", weight: "bold" }, "warn") : "";
    const posChips = TmPosition.chip(player.positions);
    let positionRatings = "";
    if ((player.positions || []).length > 0) {
      let playerPositions = "";
      for (const position of player.positions) {
        playerPositions += `
                <div class="tmpc-rating-row">
                    <div class="tmpc-pos-bar" style="background:${position.color}"></div>
                    <span class="tmpc-pos-name" style="color:${position.color}">${position.position}</span>
                    <span class="tmpc-pos-stat">
                        <span class="tmpc-pos-stat-lbl">R5</span>
                        <span class="tmpc-pos-stat-val" style="color:${getColor2(position.r5, R5_THRESHOLDS2)}">${position.r5}</span>
                    </span>
                    <span class="tmpc-pos-stat">
                        <span class="tmpc-pos-stat-lbl">REC</span>
                        <span class="tmpc-pos-stat-val" style="color:${getColor2(position.rec, REC_THRESHOLDS2)}">${position.rec}</span>
                    </span> 
                </div>`;
      }
      let allPositions = "";
      if (!player.isGK) {
        const positions = (() => {
          const map = /* @__PURE__ */ new Map();
          const positionData = Object.values(POSITION_MAP2).filter((position) => position.id !== 9);
          for (const position of positionData) {
            if (map.has(position.id)) map.get(position.id).position += ", " + position.position;
            else map.set(position.id, { ...position });
          }
          return [...map.values()];
        })();
        let allPositionRatings = "";
        for (const position of positions) {
          const isPlayerPosition = player.positions.some((pos) => pos.id === position.id);
          const positionR5 = calculatePlayerR53(position, player);
          const positionRec = calculatePlayerREC3(position, player);
          const playerCls = isPlayerPosition ? " tmpc-is-player-pos" : "";
          allPositionRatings += `
                    <div class="tmpc-rating-row${playerCls}">
                        <div class="tmpc-pos-bar" style="background:${position.color}"></div>
                        <span class="tmpc-pos-name" style="color:${position.color}">${position.position}</span>
                        <span class="tmpc-pos-stat">
                            <span class="tmpc-pos-stat-lbl">R5</span>
                            <span class="tmpc-pos-stat-val" style="color:${getColor2(positionR5, R5_THRESHOLDS2)}">${positionR5}</span>
                        </span>
                        <span class="tmpc-pos-stat">
                            <span class="tmpc-pos-stat-lbl">REC</span>
                            <span class="tmpc-pos-stat-val" style="color:${getColor2(positionRec, REC_THRESHOLDS2)}">${positionRec}</span>
                        </span>
                    </div>`;
        }
        allPositions = `
                <div class="tmpc-expand-toggle" onclick="this.classList.toggle('tmpc-expanded');this.nextElementSibling.classList.toggle('tmpc-expanded')">
                    <span>All Positions</span>
                    <span class="tmpc-expand-chevron">\u25BC</span>
                </div>
                <div class="tmpc-all-positions">
                ${allPositionRatings}
                </div>
                `;
      }
      positionRatings += `<div class="tmpc-pos-ratings">
                ${playerPositions}
                ${allPositions}
            </div>`;
    }
    let html = `
        <tm-card data-flush>
            <div class="tmpc-header">
                <img class="tmpc-photo" src="${photoSrc}">
                <div class="tmpc-info">
                    <div class="tmpc-top-grid">
                        <div class="tmpc-name">${playerName} ${flagHtml}</div>
                        ${badgeHtml2({ slot: `<span class="tmu-badge-label">ASI</span><span class="tmu-badge-value" style="color:${player.asi > 0 ? "#e8f5d8" : "#5a7a48"}">${asiDisplay}</span>` })}
                        <div class="tmpc-pos-row">${posChips || posText}${ntBadge}</div>
                        ${badgeHtml2({ slot: `<span class="tmu-badge-label">TI</span><span class="tmu-badge-value" style="color:${getColor2(player.ti, TI_THRESHOLDS2)}">${player.ti || "\u2014"}</span>` })}
                    </div>
                    <div class="tmpc-details">
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">Club</span>
                            <span class="tmpc-val">
                                <a href="${clubHref}" style="color:#80e048;text-decoration:none;font-weight:600">${clubName}</a> ${clubFlag}
                            </span>
                        </tm-row>
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">Age</span>
                            <span class="tmpc-val">${player.ageMonthsString}</span>
                        </tm-row>
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">Wage</span>
                            <span class="tmpc-val" style="color:#fbbf24">${wageDisplay}</span>
                        </tm-row>
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">Status</span>
                            <span class="tmpc-val">${statusHtml}</span>
                        </tm-row>
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">REC</span>
                            <span class="tmpc-rec-stars">${recStarsHtml}</span>
                        </tm-row>
                        <tm-row data-justify="space-between">
                            <span class="tmu-stat-lbl">Routine</span>
                            <span class="tmpc-val" style="color:${getColor2(player.routine, RTN_THRESHOLDS2)}">${player.routine.toFixed(1)}</span>
                        </tm-row>
                    </div> 
                </div>
            </div>
            ${positionRatings}
        </tm-card>`;
    const col = document.querySelector(".column2_a");
    if (!col) return null;
    const box = col.querySelector(":scope > .box");
    const boxBody = box ? box.querySelector(":scope > .box_body") : null;
    if (box && boxBody) {
      [...boxBody.children].forEach((el) => {
        if (!el.classList.contains("box_shadow")) col.appendChild(el);
      });
      box.remove();
    }
    col.querySelectorAll(":scope > h3").forEach((h) => h.remove());
    const subHeader = document.querySelector(".box_sub_header.align_center");
    if (subHeader) subHeader.remove();
    const cardEl = document.createElement("div");
    TmUI.render(cardEl, html);
    const cardNode = cardEl.firstElementChild;
    if (infoWrapper && infoWrapper.parentNode === col) {
      col.replaceChild(cardNode, infoWrapper);
    } else {
      col.prepend(cardNode);
    }
    return;
  };
  var TmPlayerCard = { render: render2 };

  // src/components/player/tm-player-data-table.js
  var attrsToHtml = (attrs = {}) => Object.entries(attrs).filter(([, value]) => value !== void 0 && value !== null && value !== false).map(([key, value]) => value === true ? ` ${key}` : ` ${key}="${String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`).join("");
  var renderCell = (cell, tagName) => {
    var _a;
    if (typeof cell === "string") return `<${tagName}>${cell}</${tagName}>`;
    const className = cell.cls ? ` class="${cell.cls}"` : "";
    const attrs = attrsToHtml(cell.attrs);
    return `<${tagName}${className}${attrs}>${(_a = cell.content) != null ? _a : ""}</${tagName}>`;
  };
  var renderRow = (row, tagName) => {
    if (typeof row === "string") return row;
    const className = row.cls ? ` class="${row.cls}"` : "";
    const attrs = attrsToHtml(row.attrs);
    return `<tr${className}${attrs}>${(row.cells || []).map((cell) => renderCell(cell, tagName)).join("")}</tr>`;
  };
  var TmPlayerDataTable = {
    table({ tableClass, headerRows = [], bodyRows = [] }) {
      return `<table class="${tableClass}"><thead>${headerRows.map((row) => renderRow(row, "th")).join("")}</thead><tbody>${bodyRows.map((row) => renderRow(row, "td")).join("")}</tbody></table>`;
    }
  };

  // src/components/player/tm-history-mod.js
  var CSS4 = `
/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   HISTORY (tmph-*)
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
#tmph-root {
    display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; line-height: 1.4;
}
.tmph-wrap {
    background: transparent; border-radius: 0; border: none; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; font-size: 13px;
}
.tmph-tabs { display: flex; gap: 6px; padding: 10px 14px 6px; flex-wrap: wrap; }
.tmph-tab {
    padding: 4px 12px; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.4px; color: #90b878; cursor: pointer;
    border-radius: 4px; background: rgba(42,74,28,.3); border: 1px solid rgba(42,74,28,.6);
    transition: all 0.15s; font-family: inherit; -webkit-appearance: none; appearance: none;
}
.tmph-tab:hover { color: #c8e0b4; background: rgba(42,74,28,.5); border-color: #3d6828; }
.tmph-tab.active { color: #e8f5d8; background: #305820; border-color: #3d6828; }
.tmph-body { padding: 6px 14px 16px; font-size: 13px; min-height: 120px; }
.tmph-tbl { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 4px; }
.tmph-tbl th {
    padding: 6px; font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #2a4a1c;
    text-align: left; white-space: nowrap;
}
.tmph-tbl th.c { text-align: center; }
.tmph-tbl th.r { text-align: right; }
.tmph-tbl td {
    padding: 5px 6px; border-bottom: 1px solid rgba(42,74,28,.4);
    color: #c8e0b4; font-variant-numeric: tabular-nums; vertical-align: middle;
}
.tmph-tbl td.c { text-align: center; }
.tmph-tbl td.r { text-align: right; }
.tmph-tbl tr:hover { background: rgba(255,255,255,.03); }
.tmph-tbl a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmph-tbl a:hover { color: #c8e0b4; text-decoration: underline; }
.tmph-tbl .tmph-tot td { border-top: 2px solid #3d6828; color: #e0f0cc; font-weight: 800; }
.tmph-transfer td {
    background: rgba(42,74,28,.2); color: #6a9a58; font-size: 10px;
    padding: 4px 6px; border-bottom: 1px solid rgba(42,74,28,.3);
}
.tmph-xfer-sum { background: rgba(251,191,36,.08); padding: 1px 8px; border-radius: 3px; border: 1px solid rgba(251,191,36,.2); }
.tmph-div { white-space: nowrap; font-size: 11px; }
.tmph-club { display: flex; align-items: center; gap: 6px; white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
.tmph-tbl td.tmph-r-good { color: #6cc040; }
.tmph-tbl td.tmph-r-low { color: #f87171; }
.tmph-empty { text-align: center; color: #5a7a48; padding: 40px; font-size: 13px; font-style: italic; }
`;
  var _s = document.createElement("style");
  _s.textContent = CSS4;
  document.head.appendChild(_s);
  var _ntData = null;
  var _historyData = null;
  var _isGK = false;
  var _activeTab = "nat";
  var _root = null;
  var q = (sel) => _root ? _root.querySelector(sel) : null;
  var extractClubName = (html) => {
    if (!html) return "-";
    const m = html.match(/>([^<]+)<\/a>/);
    return m ? m[1] : html === "-" ? "-" : html.replace(/<[^>]+>/g, "").trim() || "-";
  };
  var extractClubLink = (html) => {
    if (!html) return "";
    const m = html.match(/href="([^"]+)"/);
    return m ? m[1] : "";
  };
  var fixDivFlags = (s6) => s6 ? s6.replace(/class='flag-img-([^']+)'/g, "class='flag-img-$1 tmsq-flag'") : "";
  var ratingClass = (r) => {
    const v = parseFloat(r);
    if (isNaN(v) || v === 0) return "";
    if (v >= 6) return "tmph-r-good";
    if (v < 4.5) return "tmph-r-low";
    return "";
  };
  var calcRating = (rating, games) => {
    const r = parseFloat(rating), g = parseInt(games);
    if (!r || !g || g === 0) return "-";
    return (r / g).toFixed(2);
  };
  var fmtNum = (n) => n == null || n === "" || n === 0 ? "0" : Number(n).toLocaleString();
  var buildNTTable = (nt) => {
    if (!nt) return '<div class="tmph-empty">Not called up for any national team</div>';
    const avgR = nt.matches > 0 ? nt.rating.toFixed(1) : "-";
    const rc = ratingClass(avgR);
    return TmPlayerDataTable.table({
      tableClass: "tmph-tbl",
      headerRows: [{
        cells: [
          { content: "Country" },
          { content: "" },
          { content: "Gp", cls: "c" },
          { content: _isGK ? "Con" : "G", cls: "c" },
          { content: "A", cls: "c" },
          { content: "Cards", cls: "c" },
          { content: "Rating", cls: "c" },
          { content: "Mom", cls: "c", attrs: { style: "color:#e8a832" } }
        ]
      }],
      bodyRows: [{
        cells: [
          { content: `<div class="tmph-club">${nt.country}</div>` },
          { content: nt.flagHtml, cls: "tmph-div" },
          { content: nt.matches, cls: "c" },
          { content: nt.goals, cls: "c font-semibold", attrs: { style: "color:#6cc040" } },
          { content: nt.assists, cls: "c", attrs: { style: "color:#5b9bff" } },
          { content: nt.cards, cls: "c yellow" },
          { content: avgR, cls: `c font-bold ${rc}`.trim() },
          { content: nt.mom, cls: "c font-bold", attrs: { style: "color:#e8a832" } }
        ]
      }]
    });
  };
  var buildTable = (rows) => {
    if (!rows || !rows.length) return '<div class="tmph-empty">No history data available</div>';
    const totalRow = rows.find((r) => r.season === "total");
    const dataRows = rows.filter((r) => r.season !== "total");
    const bodyRows = [];
    for (const row of dataRows) {
      if (row.season === "transfer") {
        bodyRows.push({
          cls: "tmph-transfer",
          cells: [{
            content: `<tm-row data-justify="center" data-gap="8px"><span class="blue" style="font-size:13px;line-height:1">\u21C4</span><span class="muted text-xs font-semibold uppercase">Transfer</span><span class="tmph-xfer-sum yellow font-bold text-sm">${row.transfer}</span></tm-row>`,
            attrs: { colspan: 8 }
          }]
        });
        continue;
      }
      const cn = extractClubName(row.klubnavn), cl = extractClubLink(row.klubnavn);
      const cnH = cl ? `<a href="${cl}" target="_blank">${cn}</a>` : cn;
      const divH = fixDivFlags(row.division_string);
      const avgR = calcRating(row.rating, row.games);
      bodyRows.push({
        cells: [
          { content: row.season, cls: "c font-bold" },
          { content: `<div class="tmph-club">${cnH}</div>` },
          { content: divH, cls: "tmph-div" },
          { content: row.games || 0, cls: "c" },
          { content: _isGK ? row.conceded || 0 : row.goals || 0, cls: "c font-semibold", attrs: { style: "color:#6cc040" } },
          { content: row.assists || 0, cls: "c", attrs: { style: "color:#5b9bff" } },
          { content: row.cards || 0, cls: "c yellow" },
          { content: avgR, cls: `r font-bold ${ratingClass(avgR)}`.trim() }
        ]
      });
    }
    if (totalRow) {
      const tr = calcRating(totalRow.rating, totalRow.games);
      bodyRows.push({
        cls: "tmph-tot",
        cells: [
          { content: "Career Total", cls: "c", attrs: { colspan: 2 } },
          { content: "" },
          { content: fmtNum(totalRow.games), cls: "c" },
          { content: fmtNum(_isGK ? totalRow.conceded : totalRow.goals), cls: "c", attrs: { style: "color:#6cc040" } },
          { content: fmtNum(totalRow.assists), cls: "c", attrs: { style: "color:#5b9bff" } },
          { content: fmtNum(totalRow.cards), cls: "c yellow" },
          { content: tr, cls: "r" }
        ]
      });
    }
    return TmPlayerDataTable.table({
      tableClass: "tmph-tbl",
      headerRows: [{
        cells: [
          { content: "S", cls: "c", attrs: { style: "width:36px" } },
          { content: "Club" },
          { content: "Division" },
          { content: "Gp", cls: "c" },
          { content: _isGK ? "Con" : "G", cls: "c" },
          { content: "A", cls: "c" },
          { content: "Cards", cls: "c" },
          { content: "Rating", cls: "r" }
        ]
      }],
      bodyRows
    });
  };
  var parseNT = () => {
    const h3s = document.querySelectorAll("h3.dark");
    for (const h3 of h3s) {
      const txt = h3.textContent;
      if (!txt.includes("Called up for") && !txt.includes("Previously played for")) continue;
      const countryLink = h3.querySelector("a.country_link");
      const countryName = countryLink ? countryLink.textContent.trim() : "";
      const flagLinks = h3.querySelectorAll(".country_link");
      const flagEl = flagLinks.length > 1 ? flagLinks[flagLinks.length - 1] : flagLinks[0];
      const flagHtml = flagEl ? flagEl.outerHTML : "";
      const nextDiv = h3.nextElementSibling;
      const table = nextDiv && nextDiv.querySelector("table");
      if (!table) continue;
      const tds = table.querySelectorAll("tr:not(:first-child) td, tr.odd td");
      if (tds.length >= 6) {
        h3.style.display = "none";
        if (nextDiv) nextDiv.style.display = "none";
        _ntData = {
          country: countryName,
          flagHtml,
          matches: parseInt(tds[0].textContent) || 0,
          goals: parseInt(tds[1].textContent) || 0,
          assists: parseInt(tds[2].textContent) || 0,
          cards: parseInt(tds[3].textContent) || 0,
          rating: parseFloat(tds[4].textContent) || 0,
          mom: parseInt(tds[5].textContent) || 0
        };
        return _ntData;
      }
    }
    _ntData = null;
    return null;
  };
  var render3 = (container, data, { isGK = false } = {}) => {
    var _a;
    _historyData = data.table;
    _isGK = isGK;
    _activeTab = "nat";
    container.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.id = "tmph-root";
    container.appendChild(wrapper);
    _root = wrapper;
    const TAB_LABELS = { nat: "League", cup: "Cup", int: "International", total: "Total" };
    if (_ntData) TAB_LABELS.nt = "National Team";
    const tabsEl = TmUI.tabs({
      items: Object.entries(TAB_LABELS).map(([key, label]) => ({
        key,
        label,
        disabled: key === "nt" ? !_ntData : !(_historyData[key] || []).length
      })),
      active: _activeTab,
      onChange: (key) => {
        var _a2;
        _activeTab = key;
        const c = q("#tmph-tab-content");
        if (c) c.innerHTML = key === "nt" ? buildNTTable(_ntData) : buildTable(_historyData[key]);
        if (c) (_a2 = TmUI) == null ? void 0 : _a2.render(c);
      }
    });
    tabsEl.className = "tmph-tabs";
    _root.innerHTML = `<div class="tmph-wrap"></div>`;
    const wrap = _root.querySelector(".tmph-wrap");
    wrap.appendChild(tabsEl);
    const bodyEl = document.createElement("div");
    bodyEl.className = "tmph-body";
    bodyEl.id = "tmph-tab-content";
    bodyEl.innerHTML = buildTable(_historyData[_activeTab]);
    wrap.appendChild(bodyEl);
    (_a = TmUI) == null ? void 0 : _a.render(_root);
  };
  var reRender = ({ isGK = _isGK } = {}) => {
    if (!_root || !_historyData) return;
    const panel = _root.closest(".tmpe-panel") || _root.parentNode;
    if (panel) render3(panel, { table: _historyData }, { isGK });
  };
  var TmHistoryMod = { parseNT, render: render3, reRender };

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
      const s6 = window.SESSION;
      const ownClubIds = s6 ? [s6.main_id, s6.b_team].filter(Boolean).map(Number) : [];
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
          const sk = player.skills.find((s6) => s6.key === def.key || def.key2 && s6.key === def.key2);
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
        player.positions = String(player.favposition || "").split(",").map((s6) => {
          const pos = s6.trim().toLowerCase();
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
    }).fail((xhr, s6, e) => {
      _logError(`POST ${url}`, e || s6);
      resolve(null);
    });
  });
  var _getHtml = (url) => new Promise((resolve) => {
    const $ = window.jQuery;
    if (!$) {
      resolve(null);
      return;
    }
    $.ajax({ url, type: "GET", dataType: "html" }).done((res) => resolve(res || null)).fail(() => resolve(null));
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
      for (const s6 of skills) {
        if (p[s6] > 0) {
          sum += p[s6];
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
      if (skills.every((s6) => s6 === 0)) return null;
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
        const positions = favpos.split(",").map((s6) => s6.trim()).filter(Boolean);
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

  // src/components/player/tm-player-sidebar.js
  var CSS5 = `
/* \u2500\u2500 Player Sidebar (tmps-*) \u2500\u2500 */
.tmps-sidebar {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.tmps-sidebar .tmu-card {
    margin-bottom: 14px;
}
.tmps-sidebar .tmu-card-head {
    padding: 12px 14px 9px;
}
.tmps-sidebar .tmu-card-body {
    padding: 14px 14px;
    gap: 11px;
}
.tmps-sidebar .tmu-card-body.tmu-card-body-flush {
    padding: 7px;
    gap: 5px;
}
.tmps-sidebar .tmu-list-item {
    min-height: 42px;
}
.tmps-sidebar .tmu-stat-row {
    padding: 6px 0;
}
.tmps-note {
    background: rgba(42,74,28,0.5); border: 1px solid rgba(61,104,40,.3);
    line-height: 1.4;
}
.tmps-award-list {
    display: flex; flex-direction: column; gap: 0;
}
.tmps-award + .tmps-award { border-top: 1px solid rgba(61,104,40,.2); }
.tmps-award-icon {
    width: 28px; height: 28px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
}
.tmps-award-icon.gold { background: rgba(212,175,55,0.15); }
.tmps-award-icon.silver { background: rgba(96,165,250,0.15); }
.tmps-award-body { flex: 1; min-width: 0; }
.tmps-award-title {
    color: #e8f5d8; line-height: 1.2;
}
.tmps-award-sub {
    line-height: 1.3; margin-top: 1px;
}
.tmps-award-sub a { text-decoration: none; }
.tmps-award-sub a:hover { text-decoration: underline; }
.tmps-award-season {
    flex-shrink: 0; font-variant-numeric: tabular-nums;
}

/* \u2500\u2500 Transfer Live Card (tmtf-*) \u2500\u2500 */
`;
  var s4 = document.createElement("style");
  s4.textContent = CSS5;
  document.head.appendChild(s4);
  var fmtCoin = (v) => {
    const n = TmUtils.parseNum(v);
    return n ? n.toLocaleString("en-US") : "0";
  };
  var cleanPendingBidCopy = (transferBox) => {
    const paragraph = transferBox.querySelector("p");
    if (!paragraph) return "";
    const clone = paragraph.cloneNode(true);
    clone.querySelectorAll("span.button").forEach((node) => node.remove());
    return clone.textContent.replace(/\s+/g, " ").replace(/\s+of\s+$/, "").trim();
  };
  var renderPendingBidCopy = (copy, amount) => {
    const fallback = "You have a pending bid on this player";
    const safeCopy = copy || fallback;
    const amountHtml = `<span class="tmu-stat-val yellow"><span class="coin">${amount}</span></span>`;
    if (amount && safeCopy.includes(amount)) {
      return safeCopy.replace(amount, amountHtml);
    }
    if (/\sof$/i.test(safeCopy)) {
      return `${safeCopy} ${amountHtml}`;
    }
    return `${safeCopy} of ${amountHtml}`;
  };
  var mountLiveTransfer = (tfCard, transferListed) => {
    let tfInterval = null;
    let fetchTransfer;
    const refs = TmUI.render(tfCard, `
            <tm-card data-title="Transfer" data-icon="\u{1F504}" data-head-action="reload">
                <div data-ref="body"></div>
            </tm-card>`, { reload: () => fetchTransfer() });
    const renderTransfer = (d) => {
      const isExpired = d.expiry === "expired";
      const hasBuyer = d.buyer_id && d.buyer_id !== "0" && d.buyer_name;
      const isAgent = !hasBuyer && TmUtils.parseNum(d.current_bid) > 0;
      const curBid = TmUtils.parseNum(d.current_bid);
      let tpl = `<tm-stat data-label="Expiry" data-value="${isExpired ? "Expired" : d.expiry}" data-variant="${isExpired ? "red" : "yellow"}"></tm-stat>`;
      if (curBid > 0)
        tpl += `<tm-stat data-label="Current Bid" class="lime"><span class="coin">${fmtCoin(curBid)}</span></tm-stat>`;
      if (hasBuyer)
        tpl += `<tm-stat data-label="Bidder" class="blue"><a href="/club/${d.buyer_id}">${d.buyer_name}</a></tm-stat>`;
      else if (isAgent && !isExpired)
        tpl += `<tm-stat data-label="Bidder" data-value="Agent" data-variant="purple"></tm-stat>`;
      if (!isExpired && d.next_bid) {
        const nextVal = TmUtils.parseNum(d.next_bid);
        tpl += `<tm-stat data-label="${curBid > 0 ? "Next Bid" : "Min Bid"}" class="lime"><span class="coin">${fmtCoin(nextVal)}</span></tm-stat>`;
      }
      if (isExpired) {
        if (hasBuyer) {
          tpl += `<tm-stat data-label="Sold To" class="green"><a href="/club/${d.buyer_id}">${d.buyer_name}</a></tm-stat>`;
          tpl += `<tm-stat data-label="Price" class="green"><span class="coin">${fmtCoin(d.current_bid)}</span></tm-stat>`;
        } else if (curBid > 0) {
          tpl += `<tm-stat data-label="Result" data-value="Sold to Agent" data-variant="purple"></tm-stat>`;
          tpl += `<tm-stat data-label="Price" class="green"><span class="coin">${fmtCoin(d.current_bid)}</span></tm-stat>`;
        } else {
          tpl += `<tm-stat data-label="Result" data-value="Not Sold" data-variant="red"></tm-stat>`;
        }
      }
      let bidHandler = null;
      if (!isExpired && !transferListed.isOwnPlayer) {
        const nb = d.next_bid ? fmtCoin(d.next_bid) : transferListed.minBid;
        tpl += `<tm-button data-label="\u{1F528} Make Bid" data-block data-action="bid"></tm-button>`;
        bidHandler = () => tlpop_pop_transfer_bid(nb, 1, transferListed.playerId, transferListed.playerName);
      }
      TmUI.render(refs.body, tpl, bidHandler ? { bid: bidHandler } : {});
      if (isExpired && tfInterval) {
        clearInterval(tfInterval);
        tfInterval = null;
      }
    };
    fetchTransfer = () => {
      refs.reload.innerHTML = '<span class="tmu-spinner tmu-spinner-sm ml-1"></span>';
      refs.reload.disabled = true;
      TmTransferService.fetchTransfer(transferListed.playerId).then((d) => {
        refs.reload.innerHTML = "\u21BB";
        refs.reload.disabled = false;
        if (d == null ? void 0 : d.success) renderTransfer(d);
      });
    };
    fetchTransfer();
    tfInterval = setInterval(fetchTransfer, TmConst.POLL_INTERVAL_MS);
  };
  var mount2 = (container, opts = {}) => {
    var _a;
    const { player, sourceRoot: providedSourceRoot = null } = opts;
    if (!container) return;
    if (!container.__tmpsSourceRoot) {
      container.__tmpsSourceRoot = providedSourceRoot ? providedSourceRoot.cloneNode(true) : container.cloneNode(true);
    }
    const sourceRoot = container.__tmpsSourceRoot;
    const transferBox = sourceRoot.querySelector(".transfer_box");
    const btnData = [];
    let transferListed = null;
    let pendingBid = null;
    if (transferBox) {
      const tbText = transferBox.textContent || "";
      if (tbText.includes("transferlisted") && player) {
        const minBidEl = transferBox.querySelector(".transfer_bid .coin");
        const minBid = minBidEl ? minBidEl.textContent.replace(/,/g, "").trim() : "0";
        transferListed = { playerId: player.id, playerName: player.name || "", minBid, isOwnPlayer: !!player.isOwnPlayer };
      }
      if (!transferListed && /pending bid/i.test(tbText)) {
        const amount = ((_a = transferBox.querySelector(".coin")) == null ? void 0 : _a.textContent.trim()) || "0";
        const withdrawBtn = Array.from(transferBox.querySelectorAll("span.button")).find((btn) => /withdraw bid/i.test(btn.textContent || ""));
        const copy = cleanPendingBidCopy(transferBox);
        if (withdrawBtn) {
          pendingBid = {
            amount,
            copy,
            onclick: withdrawBtn.getAttribute("onclick") || ""
          };
        }
      }
      if (!transferListed && !pendingBid) {
        transferBox.querySelectorAll("span.button").forEach((btn) => {
          const onclick = btn.getAttribute("onclick") || "";
          const label = btn.textContent.trim();
          let icon = "\u26A1", cls = "muted";
          if (/set_asking/i.test(onclick)) {
            icon = "\u{1F4B0}";
            cls = "yellow";
          } else if (/reject/i.test(onclick)) {
            icon = "\u{1F6AB}";
            cls = "red";
          } else if (/transferlist/i.test(onclick)) {
            icon = "\u{1F4CB}";
            cls = "green";
          } else if (/fire/i.test(onclick)) {
            icon = "\u{1F5D1}\uFE0F";
            cls = "red";
          }
          btnData.push({ onclick, label, icon, cls });
        });
      }
    }
    const otherBtns = [];
    const otherSection = sourceRoot.querySelectorAll(".box_body .std.align_center");
    const otherDiv = otherSection.length > 1 ? otherSection[1] : otherSection[0] && !otherSection[0].classList.contains("transfer_box") ? otherSection[0] : null;
    let noteText = "";
    const notePar = sourceRoot.querySelector("p.dark.rounded");
    if (notePar) {
      noteText = notePar.innerHTML.replace(/<span[^>]*>Note:\s*<\/span>/i, "").replace(/<br\s*\/?>/gi, " ").trim();
    }
    if (otherDiv) {
      otherDiv.querySelectorAll("span.button").forEach((btn) => {
        const onclick = btn.getAttribute("onclick") || "";
        const label = btn.textContent.trim();
        let icon = "\u2699\uFE0F", cls = "muted";
        if (/note/i.test(label)) {
          icon = "\u{1F4DD}";
          cls = "blue";
        } else if (/nickname/i.test(label)) {
          icon = "\u{1F3F7}\uFE0F";
          cls = "muted";
        } else if (/favorite.*pos/i.test(label)) {
          icon = "\u{1F504}";
          cls = "muted";
        } else if (/compare/i.test(label)) {
          icon = "\u2696\uFE0F";
          cls = "blue";
        } else if (/demote/i.test(label)) {
          icon = "\u2B07\uFE0F";
          cls = "red";
        } else if (/promote/i.test(label)) {
          icon = "\u2B06\uFE0F";
          cls = "green";
        }
        otherBtns.push({ onclick, label, icon, cls });
      });
    }
    const awardRows = [];
    sourceRoot.querySelectorAll(".award_row").forEach((li) => {
      const img = li.querySelector("img");
      const imgSrc = img ? img.getAttribute("src") : "";
      const rawText = li.textContent.trim();
      let awardType = "", awardIcon = "\u{1F3C6}", iconCls = "gold";
      if (/award_year_u21/.test(imgSrc)) {
        awardType = "U21 Player of the Year";
        awardIcon = "\u{1F31F}";
        iconCls = "silver";
      } else if (/award_year/.test(imgSrc)) {
        awardType = "Player of the Year";
        awardIcon = "\u{1F3C6}";
        iconCls = "gold";
      } else if (/award_goal_u21/.test(imgSrc)) {
        awardType = "U21 Top Scorer";
        awardIcon = "\u26BD";
        iconCls = "silver";
      } else if (/award_goal/.test(imgSrc)) {
        awardType = "Top Scorer";
        awardIcon = "\u26BD";
        iconCls = "gold";
      }
      const seasonMatch = rawText.match(/season\s+(\d+)/i);
      const season = seasonMatch ? seasonMatch[1] : "";
      const leagueLink = li.querySelector("a[league_link]");
      const leagueName = leagueLink ? leagueLink.textContent.trim() : "";
      const leagueHref = leagueLink ? leagueLink.getAttribute("href") : "";
      const flagEl = li.querySelector(".country_link");
      const flagHtml = flagEl ? flagEl.outerHTML : "";
      let statText = "";
      const goalMatch = rawText.match(/(\d+)\s+goals?\s+in\s+(\d+)\s+match/i);
      const ratingMatch = rawText.match(/rating\s+of\s+([\d.]+)\s+in\s+(\d+)\s+match/i);
      if (goalMatch) statText = `${goalMatch[1]} goals / ${goalMatch[2]} games`;
      else if (ratingMatch) statText = `${ratingMatch[1]} avg / ${ratingMatch[2]} games`;
      awardRows.push({ awardType, awardIcon, iconCls, season, leagueName, leagueHref, flagHtml, statText });
    });
    const handlers = {};
    let h = '<div class="tmps-sidebar">';
    if (btnData.length > 0) {
      btnData.forEach((b, i) => {
        handlers[`tf_${i}`] = new Function(b.onclick);
      });
      h += '<tm-card data-title="Transfer Options" data-flush>';
      h += btnData.map(
        (b, i) => `<tm-list-item data-action="tf_${i}" data-icon="${b.icon}" data-label="${b.label}" data-variant="${b.cls}"></tm-list-item>`
      ).join("");
      h += "</tm-card>";
    }
    if (pendingBid) {
      handlers.pending_withdraw = new Function(pendingBid.onclick);
      h += '<tm-card data-title="Pending bid" data-icon="\u26A1" data-flush>';
      h += `<div class="text-sm muted px-3 pt-3 pb-2">${renderPendingBidCopy(pendingBid.copy, pendingBid.amount)}</div>`;
      h += '<div class="px-3 pt-2 pb-4"><tm-button data-label="Withdraw Bid" data-variant="secondary" data-block data-action="pending_withdraw"></tm-button></div>';
      h += "</tm-card>";
    }
    if (transferListed) {
      h += '<div data-ref="tmtf-live"></div>';
    }
    if (noteText || otherBtns.length > 0) {
      otherBtns.forEach((b, i) => {
        handlers[`opt_${i}`] = /compare/i.test(b.label) ? () => window.tmCompareOpen() : new Function(b.onclick);
      });
      h += '<tm-card data-title="Options" data-flush>';
      if (noteText) h += `<div class="tmps-note rounded-md muted text-sm mt-0 mx-2 mb-2 py-1 px-2">${noteText}</div>`;
      h += otherBtns.map(
        (b, i) => `<tm-list-item data-action="opt_${i}" data-icon="${b.icon}" data-label="${b.label}" data-variant="${b.cls}"></tm-list-item>`
      ).join("");
      h += "</tm-card>";
    }
    if (awardRows.length > 0) {
      h += '<tm-card data-title="Awards" data-icon="\u{1F3C6}" data-flush><div class="tmps-award-list">';
      for (const a of awardRows) {
        h += `
                    <tm-row data-cls="tmps-award py-2 px-3" data-gap="10px">
                        <div class="tmps-award-icon rounded-md text-lg ${a.iconCls}">${a.awardIcon}</div>
                        <div class="tmps-award-body">
                            <div class="tmps-award-title text-sm font-bold">${a.awardType}</div>`;
        let sub = "";
        if (a.flagHtml) sub += a.flagHtml + " ";
        if (a.leagueName) sub += a.leagueHref ? `<a href="${a.leagueHref}" class="lime">${a.leagueName}</a>` : a.leagueName;
        if (a.statText) sub += (sub ? " \xB7 " : "") + a.statText;
        if (sub) h += `<div class="tmps-award-sub text-xs muted">${sub}</div>`;
        h += `        </div>`;
        if (a.season) h += `<span class="tmps-award-season text-sm font-bold yellow">S${a.season}</span>`;
        h += `    </tm-row>`;
      }
      h += "</div></tm-card>";
    }
    h += "</div>";
    const sidebarRefs = TmUI.render(container, h, handlers);
    if (transferListed) {
      const tfCard = sidebarRefs["tmtf-live"];
      if (tfCard) mountLiveTransfer(tfCard, transferListed);
    }
  };
  var TmPlayerSidebar = { mount: mount2 };

  // src/components/player/tm-player-styles.js
  var inject = () => {
    if (document.getElementById("tsa-player-style")) return;
    const style = document.createElement("style");
    style.id = "tsa-player-style";
    style.textContent = `
/* -- Shared widget styles -- */
.tm-widget { background: #1c3410; border: 1px solid #3d6828; border-radius: 8px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.tm-lbl { color: #6a9a58; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
.tm-kv-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; }

/* -- Layout widths -- */
.column1 { width: 286px !important; margin-right: 10px !important; margin-left: 2px !important; }
.column2_a { width: 538px !important; margin-left: 0 !important; margin-right: 10px !important; }
.column3_a { width: 326px !important; margin-left: 0 !important; margin-right: 2px !important; }

body.tmvu-shell-active .tmvu-main {
    display: grid !important;
    grid-template-columns: minmax(248px, 286px) minmax(0, 1fr) minmax(294px, 330px);
    gap: 14px;
    align-items: start;
}

body.tmvu-shell-active .tmvu-main > * {
    min-width: 0;
}

body.tmvu-shell-active .column1,
body.tmvu-shell-active .column2_a,
body.tmvu-shell-active .column3_a {
    width: auto !important;
    margin: 0 !important;
    float: none !important;
}

body.tmvu-shell-active .column3_a {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-self: start;
}

body.tmvu-shell-active .column3_a > * {
    width: 100%;
}

/* -- Hide native TM tabs -- */
.tabs_outer { display: none !important; }
.tabs_content { display: none !important; }

.column1 > .box { display: none !important; }

/* -- Strip TM box chrome in column2_a -- */
.column2_a > .box,
.column2_a > .box > .box_body { background: none !important; border: none !important; padding: 0 !important; box-shadow: none !important; }
.column2_a > .box > .box_head,
.column2_a .box_shadow,
.column2_a .box_footer,
.column2_a > h3 { display: none !important; }

/* ---------------------------------------
   COMPARE MODAL (tmc-*)
   --------------------------------------- */
.tmc-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 99999;
    display: flex; align-items: center; justify-content: center;
}
.tmc-modal {
    background: #1a3311; border: 1px solid #3d6828; border-radius: 10px;
    width: 500px; max-width: 96vw; max-height: 90vh; display: flex; flex-direction: column;
    box-shadow: 0 8px 40px rgba(0,0,0,0.7); overflow: hidden;
}
.tmc-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; background: #274a18; border-bottom: 1px solid #3d6828;
    font-weight: 700; color: #e8f5d8; font-size: 14px; flex-shrink: 0;
}
.tmc-close-btn { background: none; border: none; color: #90b878; cursor: pointer; font-size: 16px; padding: 0 4px; line-height: 1; }
.tmc-close-btn:hover { color: #e8f5d8; }
.tmc-modal-body { flex: 1; overflow-y: auto; padding: 12px 14px; min-height: 0; }
.tmc-input-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.tmc-input-icon { font-size: 14px; flex-shrink: 0; }
.tmc-input {
    flex: 1; background: rgba(0,0,0,0.3); border: 1px solid #3d6828; border-radius: 5px;
    color: #e8f5d8; padding: 6px 10px; font-size: 12px; font-family: inherit; outline: none;
}
.tmc-input:focus { border-color: #6cc040; }
.tmc-player-list { margin-top: 8px; max-height: 340px; overflow-y: auto; border: 1px solid rgba(61,104,40,0.4); border-radius: 6px; }
.tmc-player-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid rgba(61,104,40,0.25); transition: background 0.1s; }
.tmc-player-row:last-child { border-bottom: none; }
.tmc-player-row:hover { background: rgba(108,192,64,0.12); }
.tmc-row-name { flex: 1; color: #e8f5d8; font-size: 12px; font-weight: 600; }
.tmc-row-sub { font-size: 10px; color: #8aac72; }
.tmc-row-count { font-size: 10px; color: #5a7a48; font-weight: 700; }
.tmc-list-header { padding: 5px 12px 3px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #5a7a48; background: rgba(61,104,40,0.18); border-bottom: 1px solid rgba(61,104,40,0.25); }
.tmc-squad-badge { display: inline-block; font-size: 9px; font-weight: 700; line-height: 1; padding: 1px 4px; border-radius: 3px; background: #2d5a1a; color: #a8d888; margin-left: 4px; vertical-align: middle; }
.tmc-empty-list, .tmc-loading-msg { padding: 24px; text-align: center; color: #5a7a48; font-size: 12px; font-style: italic; }
.tmc-error-msg { padding: 24px; text-align: center; color: #f87171; font-size: 12px; }
.tmc-back-btn { background: rgba(42,74,28,.5); color: #8aac72; border: 1px solid #3d6828; border-radius: 5px; padding: 4px 12px; font-size: 11px; cursor: pointer; font-family: inherit; margin-bottom: 12px; display: block; }
.tmc-back-btn:hover { background: #305820; color: #c8e0b4; }
.tmc-compare-wrap { font-size: 12px; }
.tmc-compare-header { display: flex; align-items: center; gap: 0; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid rgba(61,104,40,0.4); }
.tmc-compare-col { flex: 1; text-align: center; }
.tmc-compare-vs { width: 32px; height: 32px; border-radius: 50%; background: rgba(61,104,40,0.4); color: #5a7a48; font-weight: 800; font-size: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tmc-player-name { color: #e8f5d8; font-weight: 700; font-size: 13px; }
.tmc-player-sub { color: #8aac72; font-size: 10px; margin-top: 2px; }
.tmc-section-title { font-size: 10px; font-weight: 700; color: #5a7a48; text-transform: uppercase; letter-spacing: 0.8px; margin: 12px 0 6px; padding-bottom: 3px; border-bottom: 1px solid rgba(61,104,40,0.3); }
.tmc-stat-grid { display: flex; gap: 6px; margin-bottom: 4px; }
.tmc-stat-card { flex: 1; background: rgba(42,74,28,0.35); border: 1px solid rgba(61,104,40,0.3); border-radius: 6px; padding: 8px 4px; text-align: center; }
.tmc-stat-card-label { font-size: 9px; font-weight: 700; color: #5a7a48; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; }
.tmc-stat-card-vals { display: flex; align-items: center; justify-content: center; gap: 6px; }
.tmc-stat-card-v { font-weight: 700; font-size: 14px; }
.tmc-stat-card-sep { color: #3d6828; font-size: 10px; }
.tmc-skill-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.tmc-skill-cell { display: flex; align-items: center; padding: 5px 8px; border-bottom: 1px solid rgba(61,104,40,0.15); gap: 6px; }
.tmc-skill-cell:nth-last-child(-n+2) { border-bottom: none; }
.tmc-skill-name { color: #8aac72; font-size: 11px; white-space: nowrap; flex: 1; }
.tmc-skill-vals { display: flex; align-items: baseline; gap: 1px; font-size: 12px; white-space: nowrap; }
.tmc-skill-v { font-weight: 400; font-size: 11px; }
.tmc-skill-v.win { font-weight: 800; font-size: 13px; }
.tmc-skill-sep { color: #3d6828; font-size: 10px; margin: 0 1px; }
`;
    document.head.appendChild(style);
  };
  var TmPlayerStyles = { inject };

  // src/components/shared/tm-scout-report-cards.js
  var STYLE_ID = "tm-scout-report-cards-style";
  var SPECIALTIES2 = ["None", "Strength", "Stamina", "Pace", "Marking", "Tackling", "Workrate", "Positioning", "Passing", "Crossing", "Technique", "Heading", "Finishing", "Longshots", "Set Pieces"];
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
        .tmsc-empty { text-align: center; color: #5a7a48; padding: 40px; font-size: 13px; font-style: italic; }
        .tmsc-stars { font-size: 20px; letter-spacing: 2px; line-height: 1; }
        .tmsc-star-full { color: #fbbf24; }
        .tmsc-star-half {
            background: linear-gradient(90deg, #fbbf24 50%, #3d6828 50%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .tmsc-star-empty { color: #3d6828; }
        .tmsc-report { display: flex; flex-direction: column; gap: 14px; }
        .tmsc-report-header { padding-bottom: 10px; border-bottom: 1px solid #2a4a1c; }
        .tmsc-report-scout { color: #e8f5d8; font-weight: 700; font-size: 14px; margin-bottom: 4px; }
        .tmsc-report-date {
            color: #6a9a58; font-size: 11px; font-weight: 600;
            background: rgba(42,74,28,.4); padding: 3px 10px; border-radius: 4px; white-space: nowrap;
        }
        .tmsc-report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .tmsc-report-grid .tmu-metric.wide { grid-column: 1 / -1; }
        .tmsc-section-title {
            color: #6a9a58; font-size: 10px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.6px; padding-bottom: 6px; border-bottom: 1px solid #2a4a1c; margin-bottom: 8px;
        }
        .tmsc-bar-row { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
        .tmsc-bar-label { color: #90b878; font-size: 11px; font-weight: 600; width: 100px; flex-shrink: 0; }
        .tmsc-bar-track {
            flex: 1; height: 6px; background: #1a2e10; border-radius: 3px;
            overflow: hidden; max-width: 120px; position: relative;
        }
        .tmsc-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
        .tmsc-bar-text { font-size: 11px; font-weight: 600; min-width: 60px; }
        .tmsc-error {
            text-align: center; color: #f87171; padding: 10px; font-size: 12px; font-weight: 600;
            background: rgba(248,113,113,.06); border: 1px solid rgba(248,113,113,.15);
            border-radius: 4px; margin-bottom: 10px;
        }
        .tmsc-report-divider { border: none; border-top: 1px dashed #3d6828; margin: 16px 0; }
        .tmsc-report-count {
            color: #6a9a58; font-size: 10px; text-align: center; padding: 4px 0;
            font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .tmsc-star-green { color: #6cc040; }
        .tmsc-star-green-half {
            background: linear-gradient(90deg, #6cc040 50%, #3d6828 50%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .tmsc-star-split {
            background: linear-gradient(90deg, #fbbf24 50%, #6cc040 50%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .tmsc-report .tmu-badge { vertical-align: middle; }
        .tmsc-report-scout .tmu-badge,
        .tmu-metric-value .tmu-badge,
        .tmsc-bar-row .tmu-badge { margin-left: 6px; }
    `;
    document.head.appendChild(style);
  }
  var potColor2 = (pot) => {
    const value = parseInt(pot, 10) || 0;
    if (value >= 18) return "#6cc040";
    if (value >= 15) return "#5b9bff";
    if (value >= 12) return "#c8e0b4";
    if (value >= 9) return "#fbbf24";
    return "#f87171";
  };
  var extractTier2 = (txt) => {
    if (!txt) return null;
    const match = txt.match(/\((\d)\/(\d)\)/);
    return match ? { val: parseInt(match[1], 10), max: parseInt(match[2], 10) } : null;
  };
  var barColor2 = (val, max) => {
    const ratio = val / max;
    if (ratio >= 0.75) return "#6cc040";
    if (ratio >= 0.5) return "#80e048";
    if (ratio >= 0.25) return "#fbbf24";
    return "#f87171";
  };
  var bloomColor2 = (txt) => {
    if (!txt) return "#c8e0b4";
    const normalized = txt.toLowerCase();
    if (normalized === "bloomed") return "#6cc040";
    if (normalized.includes("late bloom")) return "#80e048";
    if (normalized.includes("middle")) return "#fbbf24";
    if (normalized.includes("starting")) return "#f97316";
    if (normalized.includes("not bloomed")) return "#f87171";
    return "#c8e0b4";
  };
  var cleanPeakText2 = (txt) => txt ? txt.replace(/^\s*-\s*/, "").replace(/\s*(physique|tactical ability|technical ability)\s*$/i, "").trim() : "";
  var confPct2 = (skill) => Math.round((parseInt(skill, 10) || 0) / 20 * 100);
  var badgeHtml = (opts, tone = "muted") => TmUI.badge({ size: "xs", shape: "rounded", weight: "bold", ...opts }, tone);
  var metricHtml = (opts) => TmUI.metric(opts);
  var confBadge = (pct) => {
    const tone = pct >= 90 ? "success" : pct >= 70 ? "live" : pct >= 50 ? "highlight" : "danger";
    return badgeHtml({ label: `${pct}%` }, tone);
  };
  var splitMetricHtml = ({ label, value, valueColor = "", wide = false }) => metricHtml({
    label,
    value,
    layout: "split",
    tone: "overlay",
    size: "sm",
    cls: wide ? "wide" : "",
    valueAttrs: valueColor ? { style: `color:${valueColor}` } : {}
  });
  var greenStarsHtml = (rec) => {
    const rating = parseFloat(rec) || 0;
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.25;
    let html = "";
    for (let index = 0; index < full; index += 1) html += '<span class="tmsc-star-green">\u2605</span>';
    if (half) html += '<span class="tmsc-star-green-half">\u2605</span>';
    const empty = 5 - full - (half ? 1 : 0);
    for (let index = 0; index < empty; index += 1) html += '<span class="tmsc-star-empty">\u2605</span>';
    return html;
  };
  var combinedStarsHtml2 = (current, potMax) => {
    let currentValue = parseFloat(current) || 0;
    let potentialValue = parseFloat(potMax) || 0;
    if (potentialValue < currentValue) potentialValue = currentValue;
    let html = "";
    for (let index = 1; index <= 5; index += 1) {
      if (index <= currentValue) html += '<span class="tmsc-star-full">\u2605</span>';
      else if (index - 0.5 <= currentValue && currentValue < index) html += potentialValue >= index ? '<span class="tmsc-star-split">\u2605</span>' : '<span class="tmsc-star-half">\u2605</span>';
      else if (index <= potentialValue) html += '<span class="tmsc-star-green">\u2605</span>';
      else if (index - 0.5 <= potentialValue && potentialValue < index) html += '<span class="tmsc-star-green-half">\u2605</span>';
      else html += '<span class="tmsc-star-empty">\u2605</span>';
    }
    return html;
  };
  function getScoutForReport(report, scouts = {}) {
    if (!(report == null ? void 0 : report.scoutid)) return null;
    return Object.values(scouts).find((scout) => String(scout.id) === String(report.scoutid)) || null;
  }
  function cardHtml(report, { scouts = {} } = {}) {
    injectStyles();
    const pot = parseInt(report == null ? void 0 : report.old_pot, 10) || 0;
    const potStarsVal = (parseFloat(report == null ? void 0 : report.potential) || 0) / 2;
    if ((report == null ? void 0 : report.scout_name) === "YD" || (report == null ? void 0 : report.scoutid) === "0") {
      return `<div class="tmsc-report"><tm-row data-justify="space-between" data-align="flex-start" data-cls="tmsc-report-header"><div><div class="tmsc-stars">${greenStarsHtml(potStarsVal)}</div><div class="tmsc-report-scout">Youth Development${badgeHtml({ label: "YD" }, "success")}</div></div><div class="tmsc-report-date">${report.done || "-"}</div></tm-row><div class="tmsc-report-grid">${splitMetricHtml({ label: "Potential", value: String(pot), valueColor: potColor2(pot), wide: true })}${splitMetricHtml({ label: "Age at report", value: report.report_age || "-", wide: true })}</div></div>`;
    }
    const spec = parseInt(report == null ? void 0 : report.specialist, 10) || 0;
    const specLabel = SPECIALTIES2[spec] || "None";
    const scout = getScoutForReport(report, scouts);
    let potConf = null;
    let bloomConf = null;
    let phyConf = null;
    let tacConf = null;
    let tecConf = null;
    let psyConf = null;
    let specConf = null;
    if (scout) {
      const age = parseInt(report.report_age, 10) || 0;
      const senYth = age < 20 ? parseInt(scout.youths, 10) || 0 : parseInt(scout.seniors, 10) || 0;
      const dev = parseInt(scout.development, 10) || 0;
      potConf = confPct2(Math.min(senYth, dev));
      bloomConf = confPct2(dev);
      phyConf = confPct2(parseInt(scout.physical, 10) || 0);
      tacConf = confPct2(parseInt(scout.tactical, 10) || 0);
      tecConf = confPct2(parseInt(scout.technical, 10) || 0);
      psyConf = confPct2(parseInt(scout.psychology, 10) || 0);
      if (spec > 0) {
        const physicalSpec = [1, 2, 3, 11];
        const tacticalSpec = [4, 5, 6, 7];
        if (physicalSpec.includes(spec)) specConf = phyConf;
        else if (tacticalSpec.includes(spec)) specConf = tacConf;
        else specConf = tecConf;
      }
    }
    const peaks = [
      { label: "Physique", text: cleanPeakText2(report.peak_phy_txt), conf: phyConf },
      { label: "Tactical", text: cleanPeakText2(report.peak_tac_txt), conf: tacConf },
      { label: "Technical", text: cleanPeakText2(report.peak_tec_txt), conf: tecConf }
    ];
    let peaksHtml = "";
    for (const peak of peaks) {
      const tier = extractTier2(peak.text);
      if (!tier) continue;
      const pct = tier.val / tier.max * 100;
      const color = barColor2(tier.val, tier.max);
      peaksHtml += `<div class="tmsc-bar-row"><span class="tmsc-bar-label">${peak.label}</span><div class="tmsc-bar-track"><div class="tmsc-bar-fill" style="width:${pct}%;background:${color}"></div></div><span class="tmsc-bar-text" style="color:${color}">${tier.val}/${tier.max}</span>${peak.conf !== null ? confBadge(peak.conf) : ""}</div>`;
    }
    const personality = [
      { label: "Leadership", value: parseInt(report.charisma, 10) || 0 },
      { label: "Professionalism", value: parseInt(report.professionalism, 10) || 0 },
      { label: "Aggression", value: parseInt(report.aggression, 10) || 0 }
    ];
    let personalityHtml = "";
    for (const item of personality) {
      const pct = item.value / 20 * 100;
      const color = TmUtils.skillColor(item.value);
      personalityHtml += `<div class="tmsc-bar-row"><span class="tmsc-bar-label">${item.label}</span><div class="tmsc-bar-track"><div class="tmsc-bar-fill" style="width:${pct}%;background:${color}"></div></div><span class="tmsc-bar-text" style="color:${color}">${item.value}</span>${psyConf !== null ? confBadge(psyConf) : ""}</div>`;
    }
    return `<div class="tmsc-report"><tm-row data-justify="space-between" data-align="flex-start" data-cls="tmsc-report-header"><div><div class="tmsc-stars">${combinedStarsHtml2(report.rec, potStarsVal)}</div><div class="tmsc-report-scout">${report.scout_name || "Unknown"}</div></div><div class="tmsc-report-date">${report.done || "-"}</div></tm-row><div class="tmsc-report-grid">${splitMetricHtml({ label: "Potential", value: `${pot}${potConf !== null ? confBadge(potConf) : ""}`, valueColor: potColor2(pot) })}${splitMetricHtml({ label: "Age", value: report.report_age || "-" })}${splitMetricHtml({ label: "Bloom", value: `${report.bloom_status_txt || "-"}${bloomConf !== null ? confBadge(bloomConf) : ""}`, valueColor: bloomColor2(report.bloom_status_txt) })}${splitMetricHtml({ label: "Development", value: `${report.dev_status || "-"}${bloomConf !== null ? confBadge(bloomConf) : ""}` })}${splitMetricHtml({ label: "Specialty", value: `${specLabel}${specConf !== null ? confBadge(specConf) : ""}`, valueColor: spec > 0 ? "#fbbf24" : "#5a7a48", wide: true })}</div><div><div class="tmsc-section-title">Peak Development</div>${peaksHtml}</div><div><div class="tmsc-section-title">Personality</div>${personalityHtml}</div></div>`;
  }
  function listHtml({ reports = [], scouts = {}, error = "", emptyText = "No scout reports available" } = {}) {
    injectStyles();
    let html = "";
    if (error) {
      const msg = error === "multi_scout" ? "This scout is already on a mission" : error === "multi_bid" ? "Scout already scouting this player" : error;
      html += `<div class="tmsc-error">${msg}</div>`;
    }
    if (!reports.length) return html + `<div class="tmsc-empty">${emptyText}</div>`;
    if (reports.length > 1) html += `<div class="tmsc-report-count">${reports.length} Reports</div>`;
    for (let index = 0; index < reports.length; index += 1) {
      if (index > 0) html += '<hr class="tmsc-report-divider">';
      html += cardHtml(reports[index], { scouts });
    }
    return html;
  }
  function bestEstimateHtml({ scoutData = {}, player = null, title = "Best Estimate", icon = "\u2605" } = {}) {
    injectStyles();
    if (!player || !Array.isArray(player.skills)) return "";
    if (!scoutData || !Array.isArray(scoutData.reports) || !scoutData.reports.length) return "";
    const container = document.createElement("div");
    TmBestEstimate.render(container, { scoutData, player, title, icon });
    return container.innerHTML;
  }
  var TmScoutReportCards = {
    cardHtml,
    bestEstimateHtml,
    listHtml
  };

  // src/components/player/tm-scout-mod.js
  var CSS6 = `
/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   SCOUT (tmsc-*)
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
#tmsc-root {
    display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; line-height: 1.4;
}
.tmsc-wrap {
    background: transparent; border-radius: 0; border: none; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; font-size: 13px;
}
.tmsc-tabs { display: flex; gap: 6px; padding: 10px 14px 6px; flex-wrap: wrap; }
.tmsc-tab {
    padding: 4px 12px; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.4px; color: #90b878; cursor: pointer;
    border-radius: 4px; background: rgba(42,74,28,.3); border: 1px solid rgba(42,74,28,.6);
    transition: all 0.15s; font-family: inherit; -webkit-appearance: none; appearance: none;
}
.tmsc-tab:hover { color: #c8e0b4; background: rgba(42,74,28,.5); border-color: #3d6828; }
.tmsc-tab.active { color: #e8f5d8; background: #305820; border-color: #3d6828; }
.tmsc-body { padding: 6px 14px 16px; font-size: 13px; min-height: 120px; }
.tmsc-tbl { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 4px; }
.tmsc-tbl th {
    padding: 6px; font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #2a4a1c;
    text-align: left; white-space: nowrap;
}
.tmsc-tbl th.c { text-align: center; }
.tmsc-tbl td {
    padding: 5px 6px; border-bottom: 1px solid rgba(42,74,28,.4);
    color: #c8e0b4; font-variant-numeric: tabular-nums; vertical-align: middle;
}
.tmsc-tbl td.c { text-align: center; }
.tmsc-tbl tr:hover { background: rgba(255,255,255,.03); }
.tmsc-tbl a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmsc-tbl a:hover { color: #c8e0b4; text-decoration: underline; }
.tmsc-empty { text-align: center; color: #5a7a48; padding: 40px; font-size: 13px; font-style: italic; }
.tmsc-stars { font-size: 20px; letter-spacing: 2px; line-height: 1; }
.tmsc-star-full { color: #fbbf24; }
.tmsc-star-half {
    background: linear-gradient(90deg, #fbbf24 50%, #3d6828 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-star-empty { color: #3d6828; }
.tmsc-report { display: flex; flex-direction: column; gap: 14px; }
.tmsc-report-header { padding-bottom: 10px; border-bottom: 1px solid #2a4a1c; }
.tmsc-report-scout { color: #e8f5d8; font-weight: 700; font-size: 14px; margin-bottom: 4px; }
.tmsc-report-date {
    color: #6a9a58; font-size: 11px; font-weight: 600;
    background: rgba(42,74,28,.4); padding: 3px 10px; border-radius: 4px; white-space: nowrap;
}
.tmsc-section-title {
    color: #6a9a58; font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; padding-bottom: 6px; border-bottom: 1px solid #2a4a1c; margin-bottom: 8px;
}
.tmsc-bar-row { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
.tmsc-bar-label { color: #90b878; font-size: 11px; font-weight: 600; width: 100px; flex-shrink: 0; }
.tmsc-bar-track {
    flex: 1; height: 6px; background: #1a2e10; border-radius: 3px;
    overflow: hidden; max-width: 120px; position: relative;
}
.tmsc-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.tmsc-bar-fill-reach {
    position: absolute; top: 0; left: 0; height: 100%;
    border-radius: 3px; transition: width 0.3s;
}
.tmsc-bar-text { font-size: 11px; font-weight: 600; min-width: 60px; }
.tmsc-league-cell { white-space: nowrap; font-size: 11px; }
.tmsc-league-cell a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmsc-league-cell a:hover { color: #c8e0b4; text-decoration: underline; }
.tmsc-club-cell a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmsc-club-cell a:hover { color: #c8e0b4; text-decoration: underline; }
.tmsc-online { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-left: 4px; vertical-align: middle; }
.tmsc-online.on { background: #6cc040; box-shadow: 0 0 4px rgba(108,192,64,.5); }
.tmsc-online.off { background: #3d3d3d; }
.tmsc-error {
    text-align: center; color: #f87171; padding: 10px; font-size: 12px; font-weight: 600;
    background: rgba(248,113,113,.06); border: 1px solid rgba(248,113,113,.15);
    border-radius: 4px; margin-bottom: 10px;
}
.tmsc-report-divider { border: none; border-top: 1px dashed #3d6828; margin: 16px 0; }
.tmsc-report-count {
    color: #6a9a58; font-size: 10px; text-align: center; padding: 4px 0;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
}
.tmsc-star-green { color: #6cc040; }
.tmsc-star-green-half {
    background: linear-gradient(90deg, #6cc040 50%, #3d6828 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-star-split {
    background: linear-gradient(90deg, #fbbf24 50%, #6cc040 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-best-wrap {
    background: rgba(42,74,28,.3); border: 1px solid #2a4a1c;
    border-radius: 6px; padding: 12px; margin-bottom: 6px;
}
.tmsc-best-title {
    color: #6cc040; font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
}
.tmsc-best-title::before { content: '\u2605'; font-size: 13px; }
`;
  var _s2 = document.createElement("style");
  _s2.textContent = CSS6;
  document.head.appendChild(_s2);
  var _scoutData = null;
  var _root2 = null;
  var _activeTab2 = "report";
  var _containerRef = null;
  var _playerId = null;
  var q2 = (sel) => _root2 ? _root2.querySelector(sel) : null;
  var qa = (sel) => _root2 ? _root2.querySelectorAll(sel) : [];
  var fixFlags = (html) => html ? html.replace(/class='flag-img-([^']+)'/g, "class='flag-img-$1 tmsq-flag'").replace(/class="flag-img-([^"]+)"/g, 'class="flag-img-$1 tmsq-flag"') : "";
  var cashColor = (c) => {
    if (!c) return "#c8e0b4";
    if (c.includes("Astonishingly")) return "#6cc040";
    if (c.includes("Incredibly")) return "#80e048";
    if (c.includes("Very rich")) return "#a0d880";
    if (c.includes("Rich")) return "#c8e0b4";
    if (c.includes("Terrible")) return "#f87171";
    if (c.includes("Poor")) return "#f97316";
    return "#c8e0b4";
  };
  var onlineDot = (on) => `<span class="tmsc-online ${on ? "on" : "off"}"></span>`;
  var buildScoutsTable = (scouts) => {
    if (!scouts || !Object.keys(scouts).length) return '<div class="tmsc-empty">No scouts hired</div>';
    const skills = ["seniors", "youths", "physical", "tactical", "technical", "development", "psychology"];
    const bodyRows = [];
    for (const s6 of Object.values(scouts)) {
      const skillCells = skills.map((sk) => {
        const v = parseInt(s6[sk]) || 0;
        return { content: v, cls: "c font-semibold", attrs: { style: `color:${TmUtils.skillColor(v)}` } };
      });
      const bc = s6.away ? "tmsc-send-btn tmsc-away" : "tmsc-send-btn";
      const bl = s6.away ? s6.returns || "Away" : "Send";
      bodyRows.push({
        cells: [
          { content: `${s6.name} ${s6.surname}`, cls: "font-semibold", attrs: { style: "color:#e8f5d8;white-space:nowrap" } },
          ...skillCells,
          { content: `<tm-button data-variant="secondary" data-size="xs" data-cls="${bc}" data-scout-id="${s6.id}" ${s6.away ? `title="${s6.returns || ""}"` : ""}>${bl}</tm-button>`, cls: "c" }
        ]
      });
    }
    return TmPlayerDataTable.table({
      tableClass: "tmsc-tbl",
      headerRows: [{
        cells: [
          { content: "Name" },
          { content: "Sen", cls: "c" },
          { content: "Yth", cls: "c" },
          { content: "Phy", cls: "c" },
          { content: "Tac", cls: "c" },
          { content: "Tec", cls: "c" },
          { content: "Dev", cls: "c" },
          { content: "Psy", cls: "c" },
          { content: "", cls: "c" }
        ]
      }],
      bodyRows
    });
  };
  var buildInterested = (interested) => {
    if (!interested || !interested.length) return '<div class="tmsc-empty">No interested clubs</div>';
    const bodyRows = interested.map((c) => {
      const ch = fixFlags(c.club_link || "");
      const lh = fixFlags(c.league_link || "");
      const cc = cashColor(c.cash);
      return {
        cells: [
          { content: `${ch} ${onlineDot(c.online)}`, cls: "tmsc-club-cell" },
          { content: lh, cls: "tmsc-league-cell" },
          { content: c.cash, attrs: { style: `color:${cc};font-weight:600;font-size:11px` } }
        ]
      };
    });
    return TmPlayerDataTable.table({
      tableClass: "tmsc-tbl",
      headerRows: [{ cells: [{ content: "Club" }, { content: "League" }, { content: "Financial" }] }],
      bodyRows
    });
  };
  var getContent = (tab) => {
    switch (tab) {
      case "report":
        return TmScoutReportCards.listHtml({ reports: _scoutData.reports || [], scouts: _scoutData.scouts || {}, error: _scoutData.error, emptyText: "No scout reports available" });
      case "scouts":
        return buildScoutsTable(_scoutData.scouts);
      case "interested":
        return buildInterested(_scoutData.interested);
      default:
        return "";
    }
  };
  var bindSendButtons = () => {
    qa(".tmsc-send-btn").forEach((btn) => {
      if (btn.classList.contains("tmsc-away")) return;
      btn.addEventListener("click", () => {
        const scoutId = btn.dataset.scoutId;
        btn.disabled = true;
        btn.textContent = "...";
        TmPlayerService.fetchPlayerInfo(_playerId, "scout", { scout_id: scoutId }).then((d) => {
          if (!d) {
            btn.textContent = "Error";
            btn.style.color = "#f87171";
            setTimeout(() => {
              btn.textContent = "Send";
              btn.disabled = false;
              btn.style.color = "";
            }, 2e3);
            return;
          }
          if (d.scouts || d.reports) {
            render4(_containerRef, d, { playerId: _playerId });
          } else {
            btn.textContent = "Sent";
            btn.style.background = "#274a18";
            btn.style.color = "#6cc040";
          }
        });
      });
    });
  };
  var render4 = (container, data, { playerId = _playerId } = {}) => {
    var _a;
    _containerRef = container;
    _scoutData = data;
    _playerId = playerId;
    _activeTab2 = data.reports && data.reports.length ? "report" : "scouts";
    container.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.id = "tmsc-root";
    container.appendChild(wrapper);
    _root2 = wrapper;
    const TAB_LABELS = { report: "Report", scouts: "Scouts", interested: "Interested" };
    const hasData = (k) => k === "report" ? !!(data.reports && data.reports.length > 0) : k === "interested" ? !!(data.interested && data.interested.length > 0) : k === "scouts" ? !!(data.scouts && Object.keys(data.scouts).length > 0) : true;
    const tabsEl = TmUI.tabs({
      items: Object.entries(TAB_LABELS).map(([key, label]) => ({ key, label, disabled: !hasData(key) })),
      active: _activeTab2,
      onChange: (key) => {
        var _a2;
        _activeTab2 = key;
        const c = q2("#tmsc-tab-content");
        if (!c) return;
        c.innerHTML = getContent(key);
        (_a2 = TmUI) == null ? void 0 : _a2.render(c);
        if (key === "scouts") bindSendButtons();
      }
    });
    tabsEl.className = "tmsc-tabs";
    _root2.innerHTML = '<div class="tmsc-wrap"></div>';
    const scWrap = _root2.querySelector(".tmsc-wrap");
    scWrap.appendChild(tabsEl);
    const bodyEl = document.createElement("div");
    bodyEl.className = "tmsc-body";
    bodyEl.id = "tmsc-tab-content";
    bodyEl.innerHTML = getContent(_activeTab2);
    scWrap.appendChild(bodyEl);
    (_a = TmUI) == null ? void 0 : _a.render(_root2);
    bindSendButtons();
  };
  var reRender2 = () => {
    if (_containerRef && _scoutData) render4(_containerRef, _scoutData);
  };
  var TmScoutMod = { render: render4, reRender: reRender2 };

  // src/components/player/tm-skills-grid.js
  var CSS7 = `
/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   SKILLS GRID (tmps-*)
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
.tmps-wrap .tmu-card-body { padding: 0; gap: 0; }
.tmps-grid .tmu-stat-row:hover { background: rgba(255,255,255,.03); }
.tmps-grid .tmu-stat-lbl { text-transform: none; letter-spacing: 0; }
.tmps-star { line-height: 1; }
.tmps-dec  { opacity: .75; vertical-align: super; letter-spacing: 0; }
.tmps-hidden .tmu-stat-lbl { color: #5a7a48; text-transform: none; letter-spacing: 0; }
.tmps-hidden .tmu-stat-val { color: #6a9a58; }
.tmps-unlock .tmu-btn img { height: 12px; vertical-align: middle; }
`;
  var s5 = document.createElement("style");
  s5.textContent = CSS7;
  document.head.appendChild(s5);
  var SKILL_ORDER = [
    ["Strength", "Passing"],
    ["Stamina", "Crossing"],
    ["Pace", "Technique"],
    ["Marking", "Heading"],
    ["Tackling", "Finishing"],
    ["Workrate", "Longshots"],
    ["Positioning", "Set Pieces"]
  ];
  var GK_SKILL_ORDER = [
    ["Strength", "Handling"],
    ["Stamina", "One on ones"],
    ["Pace", "Reflexes"],
    [null, "Aerial Ability"],
    [null, "Jumping"],
    [null, "Communication"],
    [null, "Kicking"],
    [null, "Throwing"]
  ];
  var skillColor3 = (v) => {
    if (v >= 20) return "gold";
    if (v >= 19) return "silver";
    if (v >= 16) return "lime";
    if (v >= 12) return "yellow";
    if (v >= 8) return "orange";
    return "red";
  };
  var renderVal = (v) => {
    const floor = Math.floor(v);
    const frac = v - floor;
    if (floor >= 20) return `<span class="tmps-star text-lg gold">\u2605</span>`;
    if (floor >= 19) {
      const fracStr = frac > 5e-3 ? `<span class="tmps-dec text-xs">.${Math.round(frac * 100).toString().padStart(2, "0")}</span>` : "";
      return `<span class="tmps-star text-lg silver">\u2605${fracStr}</span>`;
    }
    const dispVal = frac > 5e-3 ? `${floor}<span class="tmps-dec text-xs">.${Math.round(frac * 100).toString().padStart(2, "0")}</span>` : floor;
    return `<span class="${skillColor3(floor)}">${dispVal}</span>`;
  };
  var _mountedPlayer = null;
  var mount3 = ({ player }) => {
    _mountedPlayer = player;
    const build = () => {
      const skillTable = document.querySelector("table.skill_table.zebra");
      if (!skillTable) return false;
      const hiddenTable = document.querySelector("#hidden_skill_table");
      const hiddenSkills = [];
      let hasHiddenValues = false;
      if (hiddenTable) {
        hiddenTable.querySelectorAll("tr").forEach((row) => {
          const ths = row.querySelectorAll("th");
          const tds = row.querySelectorAll("td");
          ths.forEach((th, i) => {
            const name = th.textContent.trim();
            const td = tds[i];
            let val = "", numVal = 0;
            if (td) {
              const tip = td.getAttribute("tooltip") || "";
              const tipMatch = tip.match(/(\d+)\/20/);
              if (tipMatch) numVal = parseInt(tipMatch[1]) || 0;
              val = td.textContent.trim();
            }
            if (name) {
              hiddenSkills.push({ name, val, numVal });
              if (val) hasHiddenValues = true;
            }
          });
        });
      }
      const skills = player.skills || [];
      let leftCol = "", rightCol = "";
      const activeOrder = player.isGK ? GK_SKILL_ORDER : SKILL_ORDER;
      activeOrder.forEach(([left, right]) => {
        const skillLeft = skills.find((skill) => skill.name === left);
        const skillRight = skills.find((skill) => skill.name === right);
        if (left) {
          leftCol += `
                        <tm-stat data-label="${left}" data-cls="py-1 px-3" data-lbl-cls="text-sm" data-val-cls="text-md">${renderVal(skillLeft == null ? void 0 : skillLeft.value)}</tm-stat>`;
        } else {
          leftCol += `<div class="tmu-stat-row py-1 px-3" style="visibility:hidden"><span class="tmu-stat-lbl">&nbsp;</span><span class="tmu-stat-val">&nbsp;</span></div>`;
        }
        if (right) {
          rightCol += `<tm-stat data-label="${right}" data-cls="py-1 px-3" data-lbl-cls="text-sm" data-val-cls="text-md">${renderVal(skillRight == null ? void 0 : skillRight.value)}</tm-stat>`;
        }
      });
      let hiddenH = "";
      let unlockBtn = null;
      if (hasHiddenValues) {
        let hLeft = "", hRight = "";
        hiddenSkills.forEach((hs, i) => {
          const cls = hs.numVal ? skillColor3(hs.numVal) : "muted";
          const row = `<tm-stat data-label="${hs.name}" data-cls="py-1 px-3" data-lbl-cls="text-xs" data-val-cls="text-xs"><span class="${cls}">${hs.val || "-"}</span></tm-stat>`;
          if (i % 2 === 0) hLeft += row;
          else hRight += row;
        });
        hiddenH = `<tm-divider></tm-divider><tm-row data-cls="tmps-hidden" data-align="stretch" data-gap="0"><tm-col data-size="6">${hLeft}</tm-col><tm-col data-size="6">${hRight}</tm-col></tm-row>`;
      } else {
        unlockBtn = document.querySelector(".hidden_skills_text .button");
        hiddenH = `<tm-divider></tm-divider><tm-row data-justify="center" data-cls="tmps-unlock py-2 px-3"><tm-button data-action="unlock">Assess Hidden Skills <img src="/pics/pro_icon.png" class="pro_icon ml-1"></tm-button></tm-row>`;
      }
      const html = `<tm-card><tm-row data-cls="tmps-grid" data-align="stretch" data-gap="0"><tm-col data-size="6">${leftCol}</tm-col><tm-col data-size="6">${rightCol}</tm-col></tm-row>${hiddenH}</tm-card>`;
      const parentDiv = skillTable.closest("div.std");
      if (parentDiv) {
        const newDiv = document.createElement("div");
        newDiv.className = "tmps-wrap";
        parentDiv.parentNode.replaceChild(newDiv, parentDiv);
        TmUI.render(newDiv, html, { unlock: () => unlockBtn && unlockBtn.click() });
      }
      return true;
    };
    let retries = 0;
    const tryBuild = () => {
      if (!build() && retries++ < 30) setTimeout(tryBuild, 200);
    };
    tryBuild();
  };
  var reRender3 = () => {
    if (!_mountedPlayer) return;
    const wrap = document.querySelector(".tmps-wrap");
    if (!wrap) return;
    wrap.remove();
    mount3({ player: _mountedPlayer });
  };
  var TmSkillsGrid = { mount: mount3, reRender: reRender3 };

  // src/services/club.js
  var TmClubService = {
    /**
     * Fetch club fixtures (all matches for a given club this season).
     * @param {string|number} clubId
     * @returns {Promise<object|null>}
     */
    fetchClubFixtures(clubId) {
      return _post("/ajax/fixtures.ajax.php", { type: "club", var1: clubId });
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
     * Fetch the players_get_select post map for a club (raw, no normalization).
     * Returns a { [playerId: string]: player } map, or null on failure.
     * @param {string|number} clubId
     * @returns {Promise<object|null>}
     */
    async fetchSquadPost(clubId) {
      return _dedup(`club:squad-post:${clubId}`, async () => {
        const data = await _post("/ajax/players_get_select.ajax.php", { type: "change", club_id: clubId });
        if (!(data == null ? void 0 : data.post)) return null;
        const map = {};
        for (const [id, p] of Object.entries(data.post)) map[String(id)] = p;
        return map;
      });
    },
    /**
     * Fetch the squad player list for a club (players_get_select endpoint).
     * All entries in data.post are normalized in place via normalizePlayer.
     * @param {string|number} clubId
     * @returns {Promise<{squad: object[], post: object, [key: string]: any}|null>}
     */
    async fetchSquadRaw(clubId, { skipSync = false } = {}) {
      return _dedup(`club:squad-raw:${clubId}:${skipSync ? "nosync" : "sync"}`, async () => {
        const data = await _post("/ajax/players_get_select.ajax.php", { type: "change", club_id: clubId });
        if (data == null ? void 0 : data.post) {
          const players = Object.values(data.post).map((player) => {
            player.club_id = clubId;
            const DBPlayer = TmPlayerDB.get(player.id || player.player_id);
            TmPlayerService.normalizePlayer(player, DBPlayer, { skipSync });
            return player;
          });
          data.post = players;
        }
        return data;
      });
    }
  };

  // src/services/training.js
  var TRAINING_SKILL_NAMES = {
    strength: "Strength",
    stamina: "Stamina",
    pace: "Pace",
    marking: "Marking",
    tackling: "Tackling",
    workrate: "Workrate",
    positioning: "Positioning",
    passing: "Passing",
    crossing: "Crossing",
    technique: "Technique",
    heading: "Heading",
    finishing: "Finishing",
    longshots: "Longshots",
    set_pieces: "Set Pieces"
  };
  var TmTrainingService = {
    fetchPlayerTraining(playerId) {
      return _post("/ajax/players_get_info.ajax.php", {
        player_id: playerId,
        type: "training",
        show_non_pro_graphs: true
      });
    },
    adaptSquadTraining(player) {
      const isGK = String((player == null ? void 0 : player.favposition) || "").split(",")[0].trim().toLowerCase() === "gk";
      if (isGK) return { custom: { gk: true } };
      const customStr = String((player == null ? void 0 : player.training_custom) || "");
      const isCustom = customStr.length === 6;
      const custom = {};
      for (let index = 0; index < 6; index++) {
        custom[`team${index + 1}`] = {
          points: isCustom ? parseInt(customStr[index], 10) || 0 : 0,
          skills: [],
          label: TmConst.TRAINING_LABELS[index] || `Team ${index + 1}`
        };
      }
      custom.points_spend = 0;
      return {
        custom: {
          gk: false,
          custom_on: isCustom ? 1 : 0,
          team: String((player == null ? void 0 : player.training) || "3"),
          custom
        }
      };
    },
    normalizeTrainingState(data) {
      const custom = data == null ? void 0 : data.custom;
      if (!custom || custom.gk) {
        return {
          isGK: true,
          customOn: false,
          currentType: "",
          maxPool: 0,
          totalAllocated: 0,
          remaining: 0,
          teams: [],
          modeLabel: "Goalkeeper",
          typeLabel: "Automatic",
          dots: ""
        };
      }
      const customData = custom.custom || {};
      const teams = Array.from({ length: 6 }, (_, index) => {
        const team = customData[`team${index + 1}`] || {};
        return {
          num: index + 1,
          label: team.label || TmConst.TRAINING_LABELS[index] || `Team ${index + 1}`,
          points: parseInt(team.points, 10) || 0,
          skills: Array.isArray(team.skills) ? team.skills : [],
          skillLabels: Array.isArray(team.skills) ? team.skills.map((skill) => TRAINING_SKILL_NAMES[skill] || skill) : []
        };
      });
      const totalAllocated = teams.reduce((sum, team) => sum + team.points, 0);
      const pointsSpend = parseInt(customData.points_spend, 10) || 0;
      const maxPool = Math.max(totalAllocated + pointsSpend, totalAllocated, 10);
      const currentType = String(custom.team || "3");
      const customOn = Boolean(custom.custom_on);
      return {
        isGK: false,
        customOn,
        currentType,
        maxPool,
        totalAllocated,
        remaining: Math.max(0, maxPool - totalAllocated),
        teams,
        modeLabel: customOn ? "Custom" : "Standard",
        typeLabel: TmConst.TRAINING_NAMES[currentType] || "Unknown",
        dots: teams.map((team) => team.points).join("")
      };
    },
    buildCustomTrainingPayload(playerId, trainingState) {
      const payload = {
        type: "custom",
        on: 1,
        player_id: playerId,
        "custom[points_spend]": 0,
        "custom[player_id]": playerId,
        "custom[saved]": ""
      };
      ((trainingState == null ? void 0 : trainingState.teams) || []).forEach((team, index) => {
        const key = `custom[team${index + 1}]`;
        payload[`${key}[num]`] = index + 1;
        payload[`${key}[label]`] = team.label || TmConst.TRAINING_LABELS[index] || `Team ${index + 1}`;
        payload[`${key}[points]`] = parseInt(team.points, 10) || 0;
        payload[`${key}[skills][]`] = team.skills || [];
      });
      return payload;
    },
    /**
     * Save a custom training plan.
     * The caller is responsible for building the full training_post payload.
     * @param {object} data — fully-formed training_post payload
     * @returns {Promise<void>}
     */
    async saveTraining(data) {
      await _post("/ajax/training_post.ajax.php", data);
    },
    /**
     * Save the training type / position group for a player.
     * @param {string|number} playerId
     * @param {string|number} teamId
     * @returns {Promise<void>}
     */
    async saveTrainingType(playerId, teamId) {
      await _post("/ajax/training_post.ajax.php", {
        type: "player_pos",
        player_id: playerId,
        team_id: teamId
      });
    }
  };

  // src/components/player/tm-training-mod.js
  var TmTrainingMod = /* @__PURE__ */ (() => {
    const TRAINING_TYPES = { "1": "Technical", "2": "Fitness", "3": "Tactical", "4": "Finishing", "5": "Defending", "6": "Wings" };
    const MAX_PTS = 4;
    const SKILL_NAMES = { strength: "Strength", stamina: "Stamina", pace: "Pace", marking: "Marking", tackling: "Tackling", workrate: "Workrate", positioning: "Positioning", passing: "Passing", crossing: "Crossing", technique: "Technique", heading: "Heading", finishing: "Finishing", longshots: "Longshots", set_pieces: "Set Pieces" };
    const COLORS = ["#6cc040", "#5b9bff", "#fbbf24", "#f97316", "#a78bfa", "#f87171"];
    const htmlOf2 = (node) => node ? node.outerHTML : "";
    const buttonHtml2 = (opts) => TmUI.button(opts).outerHTML;
    const tabsHtml = (customOn2) => htmlOf2(TmUI.tabs({
      items: [
        { key: "std", label: "Standard" },
        { key: "cus", label: "Custom", cls: "tmt-tab-pro" }
      ],
      active: customOn2 ? "cus" : "std",
      color: "primary",
      cls: "tmt-tabs",
      itemCls: "tmt-tab"
    }));
    const TMT_CSS = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:host{display:block;all:initial;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#c8e0b4;line-height:1.4}
.rounded-md{border-radius:6px}.text-xs{font-size:10px}.text-sm{font-size:12px}.px-2{padding-left:8px;padding-right:8px}.px-3{padding-left:12px;padding-right:12px}.py-0{padding-top:0;padding-bottom:0}.py-1{padding-top:4px;padding-bottom:4px}
.tmu-btn{border:none;cursor:pointer;font-family:inherit;font-weight:700;letter-spacing:.3px;transition:background .15s,opacity .15s}.tmu-btn-variant-button{display:inline-flex;align-items:center;justify-content:center;gap:6px}.tmu-btn-variant-icon{display:inline-flex;align-items:center;justify-content:center;background:none!important;border:none!important;padding:0!important;min-width:0}.tmu-btn-variant-icon:hover:not(:disabled){background:none!important}.tmu-btn-block{width:100%}.tmu-btn:disabled{opacity:.45;cursor:not-allowed}.tmu-btn-primary{background:#3d6828;color:#e8f5d8}.tmu-btn-primary:hover:not(:disabled){background:#4e8234}.tmu-btn-secondary{background:rgba(42,74,28,.4);color:#90b878;border:1px solid #3d6828}.tmu-btn-secondary:hover:not(:disabled){background:rgba(42,74,28,.7);color:#e8f5d8}.tmu-btn-danger{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3)}.tmu-btn-danger:hover:not(:disabled){background:rgba(239,68,68,.25)}.tmu-btn-lime{background:rgba(108,192,64,.12);border:1px solid rgba(108,192,64,.3);color:#80e048;display:flex;align-items:center;justify-content:center;gap:6px}.tmu-btn-lime:hover:not(:disabled){background:rgba(108,192,64,.22)}
.tmu-tabs{display:flex;align-items:stretch;background:var(--tmu-tabs-bg,var(--tmu-tabs-primary-bg,#274a18));border:1px solid var(--tmu-tabs-border,var(--tmu-tabs-primary-border,#3d6828));overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;scrollbar-color:var(--tmu-tabs-scrollbar,var(--tmu-tabs-primary-border,#3d6828)) transparent}.tmu-tabs-color-primary{--tmu-tabs-bg:var(--tmu-tabs-primary-bg,#274a18);--tmu-tabs-border:var(--tmu-tabs-primary-border,#3d6828);--tmu-tabs-text:var(--tmu-tabs-primary-text,#90b878);--tmu-tabs-hover-text:var(--tmu-tabs-primary-hover-text,#c8e0b4);--tmu-tabs-hover-bg:var(--tmu-tabs-primary-hover-bg,#305820);--tmu-tabs-active-text:var(--tmu-tabs-primary-active-text,#e8f5d8);--tmu-tabs-active-bg:var(--tmu-tabs-primary-active-bg,#305820);--tmu-tabs-active-border:var(--tmu-tabs-primary-active-border,#6cc040)}.tmu-tabs-color-secondary{--tmu-tabs-bg:var(--tmu-tabs-secondary-bg,#1f2e16);--tmu-tabs-border:var(--tmu-tabs-secondary-border,#455f34);--tmu-tabs-text:var(--tmu-tabs-secondary-text,#9eb88a);--tmu-tabs-hover-text:var(--tmu-tabs-secondary-hover-text,#d2e4c6);--tmu-tabs-hover-bg:var(--tmu-tabs-secondary-hover-bg,#314726);--tmu-tabs-active-text:var(--tmu-tabs-secondary-active-text,#f0f7ea);--tmu-tabs-active-bg:var(--tmu-tabs-secondary-active-bg,#314726);--tmu-tabs-active-border:var(--tmu-tabs-secondary-active-border,#8fb96c)}.tmu-tabs-stretch .tmu-tab{flex:1 1 0;min-width:0}.tmu-tab{padding:8px 12px;text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--tmu-tabs-text,var(--tmu-tabs-primary-text,#90b878));cursor:pointer;border:none;border-bottom:2px solid transparent;transition:all .15s;background:transparent;font-family:inherit;-webkit-appearance:none;appearance:none;display:flex;align-items:center;justify-content:center;gap:6px;flex:0 0 auto;min-width:max-content}.tmu-tab:hover:not(:disabled){color:var(--tmu-tabs-hover-text,var(--tmu-tabs-primary-hover-text,#c8e0b4));background:var(--tmu-tabs-hover-bg,var(--tmu-tabs-primary-hover-bg,#305820))}.tmu-tab.active{color:var(--tmu-tabs-active-text,var(--tmu-tabs-primary-active-text,#e8f5d8));border-bottom-color:var(--tmu-tabs-active-border,var(--tmu-tabs-primary-active-border,#6cc040));background:var(--tmu-tabs-active-bg,var(--tmu-tabs-primary-active-bg,#305820))}.tmu-tab:disabled{opacity:.4;cursor:not-allowed}.tmu-tab-icon{font-size:14px;line-height:1;flex-shrink:0}
.tmt-wrap{background:transparent;border-radius:0;border:none;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#c8e0b4;font-size:13px}
.tmt-tabs{gap:6px;padding:10px 14px 6px;flex-wrap:wrap;background:transparent;border:none;overflow:visible}.tmt-tab{padding:4px 12px;font-size:11px;border:1px solid rgba(42,74,28,.6);border-radius:4px}.tmt-tab:hover:not(:disabled){border-color:#3d6828}.tmt-tab.active{border-bottom-color:#3d6828}.tmt-tab-pro::after{content:'PRO';display:inline-block;background:rgba(108,192,64,.2);color:#6cc040;padding:1px 5px;border-radius:3px;font-size:9px;font-weight:800;letter-spacing:.5px;margin-left:4px;vertical-align:middle}
.tmt-body{padding:10px 14px 16px;font-size:13px}
.tmt-sbar{display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(42,74,28,.35);border:1px solid #2a4a1c;border-radius:6px;margin-bottom:10px;flex-wrap:wrap}
.tmt-sbar-label{color:#6a9a58;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px}
.tmt-sbar select{background:rgba(42,74,28,.4);color:#c8e0b4;border:1px solid #2a4a1c;padding:4px 8px;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600;font-family:inherit}
.tmt-sbar select:focus{border-color:#6cc040;outline:none}
.tmt-cards{display:flex;gap:14px;margin-bottom:12px;padding:12px 14px;background:rgba(42,74,28,.3);border:1px solid #2a4a1c;border-radius:8px;flex-wrap:wrap}
.tmt-cards>div{min-width:80px}.tmt-cards .lbl{color:#6a9a58;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;font-weight:700}.tmt-cards .val{font-size:16px;font-weight:800;margin-top:3px}
.tmt-pool-bar{height:6px;background:rgba(0,0,0,.2);border-radius:3px;overflow:hidden;display:flex;gap:1px;margin-top:8px}
.tmt-pool-seg{height:100%;border-radius:3px;transition:width 0.3s ease;min-width:0}.tmt-pool-rem{flex:1;height:100%}
.tmt-tbl{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px}
.tmt-tbl th{padding:6px;font-size:10px;font-weight:700;color:#6a9a58;text-transform:uppercase;letter-spacing:0.4px;border-bottom:1px solid #2a4a1c;text-align:left;white-space:nowrap}.tmt-tbl th.c{text-align:center}
.tmt-tbl td{padding:5px 6px;border-bottom:1px solid rgba(42,74,28,.4);color:#c8e0b4;font-variant-numeric:tabular-nums;vertical-align:middle}.tmt-tbl td.c{text-align:center}
.tmt-tbl tr:hover{background:rgba(255,255,255,.03)}
.tmt-clr-bar{width:3px;padding:0;border-radius:2px}
.tmt-dots{display:inline-flex;gap:3px;align-items:center}
.tmt-dot{width:18px;height:18px;border-radius:50%;transition:all 0.15s;cursor:pointer;display:inline-block}
.tmt-dot-empty{background:rgba(255,255,255,.06);border:1px solid rgba(42,74,28,.6)}.tmt-dot-empty:hover{background:rgba(255,255,255,.12);border-color:rgba(42,74,28,.9)}
.tmt-dot-filled{box-shadow:0 0 6px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.15)}
.tmt-btn{width:24px;height:24px;min-width:24px;padding:0;line-height:1;font-size:14px}.tmt-btn:active:not(:disabled){background:rgba(74,144,48,.3)}.tmt-btn:disabled{opacity:.2}
.tmt-pts{font-size:13px;font-weight:800;color:#e8f5d8;min-width:14px;text-align:center}
.tmt-footer{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(42,74,28,.3);border:1px solid #2a4a1c;border-radius:8px;gap:10px;flex-wrap:wrap}
.tmt-footer-total .lbl{color:#6a9a58;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;font-weight:700}
.tmt-footer-total .val{font-size:18px;font-weight:900;color:#e8f5d8;letter-spacing:-0.5px}.tmt-footer-total .dim{color:#6a9a58;font-weight:600}
.tmt-footer-acts{display:flex;gap:6px}
.tmt-act{text-transform:uppercase;letter-spacing:.4px}.tmt-act.dng:hover{border-color:rgba(248,113,113,.3);color:#f87171;background:rgba(248,113,113,.08)}
.tmt-saved{display:inline-block;font-size:10px;font-weight:700;color:#6cc040;background:rgba(108,192,64,.12);border:1px solid rgba(108,192,64,.25);border-radius:4px;padding:2px 8px;margin-left:8px;opacity:0;transition:opacity 0.3s;vertical-align:middle}.tmt-saved.vis{opacity:1}
.tmt-custom-off .tmt-cards{display:none}.tmt-custom-off .tmt-tbl{display:none}.tmt-custom-off .tmt-footer{display:none}
.tmt-wrap:not(.tmt-custom-off) .tmt-sbar{display:none}
.tmt-readonly .tmt-btn{opacity:0.25;pointer-events:none}.tmt-readonly .tmt-dot{pointer-events:none;cursor:default}
.tmt-readonly .tmt-act{opacity:0.25;pointer-events:none}.tmt-readonly #type-select{pointer-events:none;opacity:0.6}
.tmt-readonly .tmt-tab{pointer-events:none}
.tmt-readonly-badge{display:none}.tmt-readonly .tmt-readonly-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;color:#fbbf24;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.25);border-radius:4px;padding:2px 8px;margin-left:8px;vertical-align:middle}`;
    let _container = null, _data = null, _playerId2 = null, _readOnly = false;
    let trainingData = null, teamPoints = [0, 0, 0, 0, 0, 0], originalPoints = [0, 0, 0, 0, 0, 0], maxPool = 0, customOn = false, currentType = "3", shadow = null, customDataRef = null;
    const q3 = (sel) => shadow ? shadow.querySelector(sel) : null;
    const qa2 = (sel) => shadow ? shadow.querySelectorAll(sel) : [];
    const renderPoolBar = () => {
      const tot = teamPoints.reduce((a, b) => a + b, 0);
      let s6 = "";
      for (let i = 0; i < 6; i++) {
        if (teamPoints[i] > 0) {
          s6 += `<div class="tmt-pool-seg" style="width:${(teamPoints[i] / maxPool * 100).toFixed(2)}%;background:${COLORS[i]};opacity:0.7"></div>`;
        }
      }
      const rem = ((maxPool - tot) / maxPool * 100).toFixed(2);
      if (rem > 0) s6 += `<div class="tmt-pool-rem" style="width:${rem}%"></div>`;
      return s6;
    };
    const renderDots = (idx) => {
      const pts = teamPoints[idx];
      const c = COLORS[idx];
      let h = "";
      for (let i = 0; i < MAX_PTS; i++) {
        h += i < pts ? `<span class="tmt-dot tmt-dot-filled" data-team="${idx}" data-seg="${i}" style="background:${c}"></span>` : `<span class="tmt-dot tmt-dot-empty" data-team="${idx}" data-seg="${i}"></span>`;
      }
      return h;
    };
    let saveDebounce = null, saveTimer = null;
    const flashSaved = () => {
      const el = q3("#saved");
      if (!el) return;
      el.classList.add("vis");
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => el.classList.remove("vis"), 1800);
    };
    const saveCustomTraining = () => {
      const tot = teamPoints.reduce((a, b) => a + b, 0);
      if (tot !== maxPool || !customDataRef) return;
      clearTimeout(saveDebounce);
      saveDebounce = setTimeout(() => {
        const d = { type: "custom", on: 1, player_id: _playerId2, "custom[points_spend]": 0, "custom[player_id]": _playerId2, "custom[saved]": "" };
        for (let i = 0; i < 6; i++) {
          const t = customDataRef["team" + (i + 1)];
          const p = `custom[team${i + 1}]`;
          d[`${p}[num]`] = i + 1;
          d[`${p}[label]`] = t.label || `Team ${i + 1}`;
          d[`${p}[points]`] = teamPoints[i];
          d[`${p}[skills][]`] = t.skills;
        }
        TmTrainingService.saveTraining(d).then(() => flashSaved());
      }, 300);
    };
    const saveTrainingType = (type) => {
      TmTrainingService.saveTrainingType(_playerId2, type).then(() => flashSaved());
    };
    const updateUI = () => {
      const tot = teamPoints.reduce((a, b) => a + b, 0);
      const rem = maxPool - tot;
      const barEl = q3("#pool-bar");
      if (barEl) barEl.innerHTML = renderPoolBar();
      const uEl = q3("#card-used");
      if (uEl) uEl.textContent = tot;
      const fEl = q3("#card-free");
      if (fEl) {
        fEl.textContent = rem;
        fEl.style.color = rem > 0 ? "#fbbf24" : "#6a9a58";
      }
      for (let i = 0; i < 6; i++) {
        const dEl = q3(`#dots-${i}`);
        if (dEl) dEl.innerHTML = renderDots(i);
        const pEl = q3(`#pts-${i}`);
        if (pEl) pEl.textContent = teamPoints[i];
      }
      const tEl = q3("#total");
      if (tEl) tEl.innerHTML = `${tot}<span class="dim">/${maxPool}</span>`;
      qa2(".tmt-minus").forEach((b) => {
        b.disabled = teamPoints[parseInt(b.dataset.team)] <= 0;
      });
      qa2(".tmt-plus").forEach((b) => {
        b.disabled = teamPoints[parseInt(b.dataset.team)] >= MAX_PTS || rem <= 0;
      });
      bindDotClicks();
    };
    const bindDotClicks = () => {
      qa2(".tmt-dot").forEach((dot) => {
        dot.onclick = () => {
          const ti = parseInt(dot.dataset.team);
          const si = parseInt(dot.dataset.seg);
          const tp = si + 1;
          const tot = teamPoints.reduce((a, b) => a + b, 0);
          const cur = teamPoints[ti];
          if (tp === cur) teamPoints[ti] = si;
          else if (tp > cur) {
            const need = tp - cur;
            const avail = maxPool - tot;
            teamPoints[ti] = need <= avail ? tp : cur + avail;
          } else teamPoints[ti] = tp;
          updateUI();
          saveCustomTraining();
        };
      });
    };
    const bindEvents = () => {
      var _a, _b, _c;
      qa2(".tmt-plus").forEach((b) => {
        b.addEventListener("click", () => {
          const i = parseInt(b.dataset.team);
          if (teamPoints[i] < MAX_PTS && teamPoints.reduce((a, b2) => a + b2, 0) < maxPool) {
            teamPoints[i]++;
            updateUI();
            saveCustomTraining();
          }
        });
      });
      qa2(".tmt-minus").forEach((b) => {
        b.addEventListener("click", () => {
          const i = parseInt(b.dataset.team);
          if (teamPoints[i] > 0) {
            teamPoints[i]--;
            updateUI();
            saveCustomTraining();
          }
        });
      });
      bindDotClicks();
      (_a = q3("#btn-clear")) == null ? void 0 : _a.addEventListener("click", () => {
        teamPoints.fill(0);
        updateUI();
        saveCustomTraining();
      });
      (_b = q3("#btn-reset")) == null ? void 0 : _b.addEventListener("click", () => {
        teamPoints = [...originalPoints];
        updateUI();
        saveCustomTraining();
      });
      const tS = q3('.tmt-tab[data-tab="std"]'), tC = q3('.tmt-tab[data-tab="cus"]'), w = q3(".tmt-wrap");
      tS == null ? void 0 : tS.addEventListener("click", () => {
        if (customOn) {
          customOn = false;
          tS.classList.add("active");
          tC.classList.remove("active");
          w.classList.add("tmt-custom-off");
          saveTrainingType(currentType);
        }
      });
      tC == null ? void 0 : tC.addEventListener("click", () => {
        if (!customOn) {
          customOn = true;
          tC.classList.add("active");
          tS.classList.remove("active");
          w.classList.remove("tmt-custom-off");
          saveCustomTraining();
        }
      });
      (_c = q3("#type-select")) == null ? void 0 : _c.addEventListener("change", (e) => {
        const v = e.target.value;
        if (v !== currentType) {
          currentType = v;
          saveTrainingType(v);
        }
      });
      updateUI();
    };
    const render5 = (container, data, { playerId, readOnly = false } = {}) => {
      _container = container;
      _data = data;
      _playerId2 = playerId;
      _readOnly = readOnly;
      trainingData = data;
      const custom = data == null ? void 0 : data.custom;
      if (!custom || custom.gk) {
        container.innerHTML = "";
        const host2 = document.createElement("div");
        container.appendChild(host2);
        shadow = host2.attachShadow({ mode: "open" });
        shadow.innerHTML = `<style>${TMT_CSS}</style><div class="tmt-wrap"><div class="tmt-body" style="text-align:center;padding:20px 14px"><div style="font-size:22px;margin-bottom:6px">\u{1F9E4}</div><div style="color:#e8f5d8;font-weight:700;font-size:14px;margin-bottom:4px">Goalkeeper Training</div><div style="color:#6a9a58;font-size:11px">Training is automatically set and cannot be changed for goalkeepers.</div></div></div>`;
        return;
      }
      const customData = custom.custom;
      customOn = !!custom.custom_on;
      currentType = String(custom.team || "3");
      customDataRef = customData;
      for (let i = 0; i < 6; i++) {
        const t = customData["team" + (i + 1)];
        teamPoints[i] = parseInt(t.points) || 0;
        originalPoints[i] = teamPoints[i];
      }
      const totalAlloc = teamPoints.reduce((a, b) => a + b, 0);
      maxPool = totalAlloc + (parseInt(customData.points_spend) || 0);
      if (maxPool < 1) maxPool = 10;
      const rem = maxPool - totalAlloc;
      container.innerHTML = "";
      const host = document.createElement("div");
      container.appendChild(host);
      shadow = host.attachShadow({ mode: "open" });
      let typeOpts = customOn ? '<option value="" selected>\u2014 Select \u2014</option>' : "";
      Object.entries(TRAINING_TYPES).forEach(([id, name]) => {
        typeOpts += `<option value="${id}" ${!customOn && id === currentType ? "selected" : ""}>${name}</option>`;
      });
      let teamRows = "";
      for (let i = 0; i < 6; i++) {
        const t = customData["team" + (i + 1)];
        const skills = t.skills.map((s6) => SKILL_NAMES[s6] || s6).join(", ");
        teamRows += `<tr data-team="${i}"><td class="tmt-clr-bar" style="background:${COLORS[i]}"></td><td style="font-weight:700;color:#e8f5d8;white-space:nowrap">T${i + 1}</td><td style="color:#8aac72;font-size:11px">${skills}</td><td class="c"><div style="display:flex;align-items:center;gap:6px;justify-content:center">${buttonHtml2({ label: "\u2212", color: "secondary", size: "xs", cls: "tmt-btn tmt-minus", id: `tmt-minus-${i}`, attrs: { "data-team": i } })}<span class="tmt-dots" id="dots-${i}">${renderDots(i)}</span><span class="tmt-pts" id="pts-${i}">${teamPoints[i]}</span>${buttonHtml2({ label: "+", color: "secondary", size: "xs", cls: "tmt-btn tmt-plus", id: `tmt-plus-${i}`, attrs: { "data-team": i } })}</div></td></tr>`;
      }
      shadow.innerHTML = `<style>${TMT_CSS}</style>
<div class="tmt-wrap ${customOn ? "" : "tmt-custom-off"} ${_readOnly ? "tmt-readonly" : ""}">
    ${tabsHtml(customOn).replace("</div>", '<span class="tmt-readonly-badge">\u{1F441} View only</span></div>')}
<div class="tmt-body">
<div class="tmt-sbar" id="type-bar"><span class="tmt-sbar-label">Training Type</span><select id="type-select">${typeOpts}</select></div>
<div class="tmt-cards"><div><div class="lbl">Allocated</div><div class="val" style="color:#6cc040" id="card-used">${totalAlloc}</div></div><div><div class="lbl">Remaining</div><div class="val" style="color:${rem > 0 ? "#fbbf24" : "#6a9a58"}" id="card-free">${rem}</div></div><div><div class="lbl">Total Pool</div><div class="val" style="color:#e8f5d8">${maxPool}</div></div><div style="flex:1;display:flex;align-items:flex-end"><div class="tmt-pool-bar" id="pool-bar" style="width:100%">${renderPoolBar()}</div></div></div>
<table class="tmt-tbl" id="teams-tbl"><thead><tr><th style="width:3px;padding:0"></th><th style="width:30px">Team</th><th>Skills</th><th class="c">Points</th></tr></thead><tbody id="teams-body">${teamRows}</tbody></table>
    <div class="tmt-footer"><div class="tmt-footer-total"><div class="lbl">Total Training</div><div class="val" id="total">${totalAlloc}<span class="dim">/${maxPool}</span></div></div><div class="tmt-footer-acts">${buttonHtml2({ id: "btn-clear", label: "Clear All", color: "danger", size: "sm", cls: "tmt-act dng" })}${buttonHtml2({ id: "btn-reset", label: "Reset", color: "secondary", size: "sm", cls: "tmt-act" })}</div></div>
</div></div>`;
      if (!_readOnly) bindEvents();
    };
    const reRender4 = () => {
      if (_container && _data) render5(_container, _data, { playerId: _playerId2, readOnly: _readOnly });
    };
    return { render: render5, reRender: reRender4 };
  })();

  // src/components/player/tm-tabs-mod.js
  var TmTabsMod = (() => {
    const CSS8 = `
#tmpe-container {
    margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.tmpe-panels {
    border: 1px solid #3d6828; border-top: none;
    border-radius: 0 0 8px 8px;
    padding: 0; min-height: 120px;
    background: #1c3410;
}
.tmpe-panel {
    animation: tmpe-fadeIn 0.25s ease-out;
    padding: 8px;
}
@keyframes tmpe-fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
    (() => {
      const s6 = document.createElement("style");
      s6.textContent = CSS8;
      document.head.appendChild(s6);
    })();
    const TABS_DEF = [
      { key: "history", label: "History", mod: TmHistoryMod },
      { key: "scout", label: "Scout", mod: TmScoutMod },
      { key: "training", label: "Training", mod: TmTrainingMod },
      { key: "graphs", label: "Graphs", mod: TmGraphsMod }
    ];
    const TAB_ICONS = { history: "\u{1F4CB}", scout: "\u{1F50D}", training: "\u2699", graphs: "\u{1F4CA}" };
    const dataLoaded = {};
    let player = null;
    let _getOwnClubIds = () => [];
    let rootContainer = null;
    const _isGK2 = () => String((player == null ? void 0 : player.favposition) || "").split(",")[0].trim().toLowerCase() === "gk";
    const _playerASI = () => (player == null ? void 0 : player.asi) > 0 ? player.asi : 0;
    const _playerClubId = () => {
      var _a;
      return (_a = player == null ? void 0 : player.club_id) != null ? _a : null;
    };
    const getProps = () => {
      var _a, _b;
      const ownIds = _getOwnClubIds();
      const clubId = String((_a = _playerClubId()) != null ? _a : "");
      return {
        isGK: _isGK2(),
        playerId: (_b = player == null ? void 0 : player.id) != null ? _b : null,
        playerASI: _playerASI(),
        ownClubIds: ownIds,
        isOwnPlayer: !!clubId && ownIds.includes(clubId)
      };
    };
    const _adaptSquadTraining = (sp) => {
      const gk = String(sp.favposition || "").split(",")[0].trim().toLowerCase() === "gk";
      if (gk) return { custom: { gk: true } };
      const customStr = sp.training_custom || "";
      const isCustom = customStr.length === 6;
      const custom = {};
      for (let i = 0; i < 6; i++) {
        custom[`team${i + 1}`] = { points: isCustom ? parseInt(customStr[i]) || 0 : 0, skills: [], label: `Team ${i + 1}` };
      }
      custom.points_spend = 0;
      return { custom: { gk: false, custom_on: isCustom, team: String(sp.training || "3"), custom } };
    };
    const _ERR_HTML = (msg) => TmUI.error(msg);
    const _fetchTraining = (panel) => {
      var _a, _b;
      const ownIds = _getOwnClubIds();
      const clubId = String((_a = _playerClubId()) != null ? _a : "");
      const isOwn = !!clubId && ownIds.includes(clubId);
      const playerId = (_b = player == null ? void 0 : player.id) != null ? _b : null;
      if (isOwn) {
        TmPlayerService.fetchPlayerInfo(playerId, "training").then((data) => {
          if (!data) {
            panel.innerHTML = _ERR_HTML("Failed to load data");
            return;
          }
          dataLoaded["training"] = true;
          TmTrainingMod.render(panel, data, getProps());
        });
      } else {
        if (!clubId) {
          panel.innerHTML = _ERR_HTML("Cannot load training \u2014 club not yet loaded, try again");
          return;
        }
        TmClubService.fetchSquadRaw(clubId).then((data) => {
          var _a2;
          const post = (_a2 = data == null ? void 0 : data.post) != null ? _a2 : {};
          const sp = (post || []).find((p) => Number(p.id) === Number(player == null ? void 0 : player.id));
          if (!sp) {
            panel.innerHTML = _ERR_HTML("Player not found in squad data");
            return;
          }
          dataLoaded["training"] = true;
          TmTrainingMod.render(panel, _adaptSquadTraining(sp), { playerId, readOnly: true });
        });
      }
    };
    const switchTab = (key) => {
      var _a;
      rootContainer == null ? void 0 : rootContainer.querySelectorAll(".tmpe-main-tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === key));
      rootContainer == null ? void 0 : rootContainer.querySelectorAll(".tmpe-panel").forEach((p) => p.style.display = p.dataset.tab === key ? "" : "none");
      if (dataLoaded[key]) return;
      const panel = rootContainer == null ? void 0 : rootContainer.querySelector(`.tmpe-panel[data-tab="${key}"]`);
      if (!panel) return;
      panel.innerHTML = TmUI.loading();
      if (key === "training") {
        _fetchTraining(panel);
        return;
      }
      TmPlayerService.fetchPlayerInfo((_a = player == null ? void 0 : player.id) != null ? _a : null, key).then((data) => {
        if (!data) {
          panel.innerHTML = TmUI.error("Failed to load data");
          return;
        }
        dataLoaded[key] = true;
        const tab = TABS_DEF.find((t) => t.key === key);
        if (tab) tab.mod.render(panel, data, getProps());
      });
    };
    const isLoaded = (key) => !!dataLoaded[key];
    let resizeTimer = null;
    let initRetries = 0;
    let _cssInjector = null;
    const _tryMount = () => {
      const tabsContent = document.querySelector(".tabs_content");
      if (!tabsContent) {
        if (initRetries++ < 50) setTimeout(_tryMount, 200);
        return;
      }
      _cssInjector == null ? void 0 : _cssInjector();
      const container = document.createElement("div");
      container.id = "tmpe-container";
      rootContainer = container;
      const bar = TmUI.tabs({
        items: TABS_DEF.map((t) => ({
          key: t.key,
          label: t.label,
          icon: TAB_ICONS[t.key] || ""
        })),
        active: "history",
        color: "primary",
        stretch: true,
        cls: "tmpe-tabs-bar",
        itemCls: "tmpe-main-tab",
        onChange: switchTab
      });
      container.appendChild(bar);
      const panels = document.createElement("div");
      panels.className = "tmpe-panels";
      TABS_DEF.forEach((t) => {
        const p = document.createElement("div");
        p.className = "tmpe-panel";
        p.dataset.tab = t.key;
        p.style.display = "none";
        panels.appendChild(p);
      });
      container.appendChild(panels);
      tabsContent.parentNode.insertBefore(container, tabsContent);
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => TmGraphsMod.reRender(), 300);
      });
      switchTab("history");
    };
    const mount4 = ({ player: p, getOwnClubIds, injectCSS }) => {
      player = p;
      _getOwnClubIds = getOwnClubIds;
      _cssInjector = injectCSS;
      initRetries = 0;
      _tryMount();
    };
    return { mount: mount4, isLoaded, switchTab };
  })();

  // src/pages/player.js
  (function() {
    "use strict";
    var _a;
    if (document.body.dataset.tmPlayerPageInit === "1") return;
    document.body.dataset.tmPlayerPageInit = "1";
    const $ = window.jQuery;
    if (!$) return;
    const urlMatch = location.pathname.match(/\/players\/(\d+)/);
    if (!urlMatch) return;
    const PLAYER_ID = urlMatch[1];
    const nativeSidebarSnapshot = ((_a = document.querySelector(".column3_a")) == null ? void 0 : _a.cloneNode(true)) || null;
    const PlayerDB2 = TmPlayerDB;
    const PlayerArchiveDB2 = TmPlayerArchiveDB;
    let player = null;
    let club = null;
    const getOwnClubIds = () => {
      const s6 = window.SESSION;
      if (!s6) return [];
      const ids = [];
      if (s6.main_id) ids.push(String(s6.main_id));
      if (s6.b_team) ids.push(String(s6.b_team));
      return ids;
    };
    const injectCSS = () => TmPlayerStyles.inject();
    const ensureSidebarLayout = () => {
      const col3 = document.querySelector(".column3_a");
      if (!col3) return null;
      if (!col3.__tmvuNativeSnapshot) {
        col3.__tmvuNativeSnapshot = nativeSidebarSnapshot ? nativeSidebarSnapshot.cloneNode(true) : col3.cloneNode(true);
      }
      let sidebarSlot = col3.querySelector("#tmps-sidebar-slot");
      let calcSlot = col3.querySelector("#tmac-slot");
      if (!sidebarSlot || !calcSlot) {
        col3.innerHTML = "";
        sidebarSlot = document.createElement("div");
        sidebarSlot.id = "tmps-sidebar-slot";
        calcSlot = document.createElement("div");
        calcSlot.id = "tmac-slot";
        col3.appendChild(sidebarSlot);
        col3.appendChild(calcSlot);
      }
      return {
        col3,
        sidebarSlot,
        calcSlot,
        nativeSnapshot: col3.__tmvuNativeSnapshot
      };
    };
    const applyTooltip = (data) => {
      var _a2;
      if (!data || !data.player) return;
      if (data.retired) return;
      player = data.player;
      club = (_a2 = data.club) != null ? _a2 : null;
      TmScoutMod.reRender();
      const parsedNTData = TmHistoryMod.parseNT();
      TmPlayerCard.render({
        player,
        club
      });
      const sidebarLayout = ensureSidebarLayout();
      if (sidebarLayout == null ? void 0 : sidebarLayout.sidebarSlot) {
        TmPlayerSidebar.mount(sidebarLayout.sidebarSlot, {
          player,
          sourceRoot: sidebarLayout.nativeSnapshot
        });
      }
      if (sidebarLayout == null ? void 0 : sidebarLayout.calcSlot) {
        TmAsiCalculator.mount(sidebarLayout.calcSlot, { player });
      }
      if (parsedNTData && TmTabsMod.isLoaded("history")) TmHistoryMod.reRender();
      fetchBestEstimate();
      TmSkillsGrid.mount({ player });
      TmTabsMod.mount({ player, getOwnClubIds, injectCSS });
    };
    Promise.all([
      PlayerDB2.init().then(() => PlayerArchiveDB2.init()).catch((e) => {
        console.warn("[DB] IndexedDB init failed, falling back:", e);
      }),
      TmPlayerService.fetchPlayerTooltip(PLAYER_ID)
    ]).then(([, data]) => applyTooltip(data));
    const fetchBestEstimate = () => {
      const col1 = document.querySelector(".column1");
      if (!col1) return;
      const existing = col1.querySelector("#tmbe-standalone");
      if (existing) existing.remove();
      const el = document.createElement("div");
      el.id = "tmbe-standalone";
      col1.prepend(el);
      TmPlayerService.fetchPlayerInfo(PLAYER_ID, "scout").then((data) => {
        TmBestEstimate.render(el, {
          scoutData: data || {},
          player
        });
      });
    };
    window.addEventListener("tm:growthUpdated", () => {
      try {
        TmGraphsMod.reRender();
      } catch (e) {
      }
      try {
        TmSkillsGrid.reRender();
      } catch (e) {
      }
    });
  })();
})();
