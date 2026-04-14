import { TmConst } from './tm-constants.js';
import { TmUtils } from './tm-utils.js';

/**
 * tm-lib.js — Shared utility library for TrophyManager userscripts
 *
 * Exposed as: TmLib
 *
 */


const {
    WEIGHT_R5, WEIGHT_RB,
    WAGE_RATE, _TRAINING1, _SEASON_DAYS,
    POS_MULTIPLIERS,
    ASI_WEIGHT_OUTFIELD, ASI_WEIGHT_GK,
    GRAPH_KEYS_OUT, GRAPH_KEYS_GK,
    TRAINING_GROUPS_OUT, TRAINING_GROUPS_GK,
    ROUTINE_DECAY, STD_FOCUS, SMOOTH_WEIGHT,
} = TmConst;
const { ageToMonths, skillValue } = TmUtils;


/* ─── Internal helpers ─── */
const _fix2 = v => (Math.round(v * 100) / 100).toFixed(2);
/* Extract numeric value from either a plain number or a skill object { value } */
const _sv = skillValue;


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
        rec += skills[i] * WEIGHT_RB[posIdx][i];
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
        const ck = parseFloat(_fix2(pow(E, (sr[13] + sr[8] + sr[9] * 0.5) ** 2 * 0.002) / 983.65770));
        const pk = parseFloat(_fix2(pow(E, (sr[13] + sr[11] + sr[9] * 0.5) ** 2 * 0.002) / 1967.31409));
        const ds = sr[0] ** 2 + sr[1] ** 2 * 0.5 + sr[2] ** 2 * 0.5 + sr[3] ** 2 + sr[4] ** 2 + sr[5] ** 2 + sr[6] ** 2;
        const os = sr[0] ** 2 * 0.5 + sr[1] ** 2 * 0.5 + sr[2] ** 2 + sr[3] ** 2 + sr[4] ** 2 + sr[5] ** 2 + sr[6] ** 2;
        const m = POS_MULTIPLIERS[posIdx];
        return parseFloat(_fix2(rating + hb + fk + ck + pk
            + parseFloat(_fix2(ds / 6 / 22.9 ** 2)) * m
            + parseFloat(_fix2(os / 6 / 22.9 ** 2)) * m));
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
const calculatePlayerR5 = (position, player) => {
    return calcR5(position.id, player.skills.map(_sv), player.asi, player.routine || 0).toFixed(2);
}

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
    if (!asi || !wage || wage <= TmConst.MIN_WAGE_FOR_TI) return null;
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

/* Returns the expected total skill sum for a player based on ASI and position (GK vs outfield). */
const calcAsiSkillSum = (player) => {
    const K = player.isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
    return Math.pow(2, Math.log(K * player.asi) / Math.log(128));
};

const sumSkillValues = (skills) => (Array.isArray(skills)
    ? skills.reduce((sum, skill) => sum + skillValue(skill), 0)
    : 0);

const calcASIFromSkillSum = (skillSum, isGK) => {
    const weight = isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
    return Math.max(0, Math.round(Math.pow(Math.max(0, skillSum), 7) / weight));
};

/* Distribute ASI-derived remainder equally across non-maxed skills. Returns plain number array for DB storage.
   SIMPLE FALLBACK ONLY — no training-group weights, no chaining across records.
   Use computeGrowthDecimals() (TmLib, multi-record chained) for the training-aware version,
   or TmLib.calcSkillDecimals() (single-snapshot training-aware) for the inspector.
   Named with 'Simple' suffix to prevent accidental misuse as the canonical version. */
const calcSkillDecimalsSimple = (player) => {
    const K = player.isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
    const skills = player.skills;
    const nums = skills.map(s => parseFloat(s.value) || 0);
    const allSum = nums.reduce((s, v) => s + v, 0);
    const remainder = Math.round((Math.pow(2, Math.log(K * player.asi) / Math.log(128)) - allSum) * 10) / 10;
    const nonStar = nums.filter(v => v < 20).length;
    let result;
    if (remainder <= 0) result = nums;
    else if (nonStar === 0) result = nums.map(v => v + remainder / nums.length);
    else result = nums.map(v => v === 20 ? 20 : v + remainder / nonStar);
    return skills.map((s, i) => ({ ...s, value: result[i] }));
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
const calcSkillDecimals = (intSkills, asi, isGK, gw, { maxIntegers } = {}) => {
    const N = intSkills.length;
    const GRP = isGK ? TRAINING_GROUPS_GK : TRAINING_GROUPS_OUT;
    const GRP_COUNT = GRP.length;
    if (!gw) gw = new Array(GRP_COUNT).fill(1 / GRP_COUNT);
    const KASIW = isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
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
            const cap = maxIntegers ? Math.max(0, maxIntegers[i] - intSkills[i]) + CAP : CAP;
            if (dec[i] > cap) { ovfl += dec[i] - cap; dec[i] = cap; }
            else if (dec[i] < cap) freeCount++;
        }
        if (ovfl > 0.0001 && freeCount > 0) {
            const add = ovfl / freeCount;
            for (let i = 0; i < N; i++) {
                const cap = maxIntegers ? Math.max(0, maxIntegers[i] - intSkills[i]) + CAP : CAP;
                if (intSkills[i] < 20 && dec[i] < cap) dec[i] += add;
            }
        } else break;
    } while (++passes < 20);
    return intSkills.map((v, i) => v >= 20 ? 20 : v + dec[i]);
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
        case 'gk': return 9;
        case 'dc': case 'dcl': case 'dcr': return 0;
        case 'dl': case 'dr': return 1;
        case 'dmc': case 'dmcl': case 'dmcr': return 2;
        case 'dml': case 'dmr': return 3;
        case 'mc': case 'mcl': case 'mcr': return 4;
        case 'ml': case 'mr': return 5;
        case 'omc': case 'omcl': case 'omcr': return 6;
        case 'oml': case 'omr': return 7;
        default: return 8;
    }
};

export const TmLib = {
    getPositionIndex,
    calcR5,
    calcRec,
    calcAsiSkillSum,
    calcASIFromSkillSum,
    calcSkillDecimalsSimple,
    calcSkillDecimals,
    buildRoutineMap,
    calculatePlayerR5,
    calculatePlayerREC,
    calcASIProjection,
    getCurrentSession: _getCurrentSession,
    calculateTI,
    calculateTIPerSession,
    sumSkillValues,
};

