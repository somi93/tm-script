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
const { ageToMonths } = TmUtils;


/* ─── Internal helpers ─── */
const _fix2 = v => (Math.round(v * 100) / 100).toFixed(2);
/* Extract numeric value from either a plain number or a skill object { value } */
const _sv = s => (typeof s === 'object' && s !== null) ? Number(s.value ?? 0) : Number(s);


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
const calcSkillDecimals = (intSkills, asi, isGK, gw) => {
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

const _safeGrowthSkills = (skills) => skills.map(v => {
    const n = typeof v === 'object' ? v.value : v;
    return isFinite(n) ? Math.floor(n) : 0;
});

const _getHistoryStatKeys = (isGK) => isGK ? GRAPH_KEYS_GK : GRAPH_KEYS_OUT;

const _getGraphHistorySkillMap = (graphData, isGK) => {
    if (isGK) {
        return {
            strength: graphData?.strength,
            pace: graphData?.pace,
            jumping: graphData?.jumping,
            stamina: graphData?.stamina,
            one_on_ones: graphData?.one_on_ones ?? graphData?.oneonones,
            reflexes: graphData?.reflexes,
            aerial_ability: graphData?.aerial_ability ?? graphData?.arialability,
            communication: graphData?.communication,
            kicking: graphData?.kicking,
            throwing: graphData?.throwing,
            handling: graphData?.handling,
        };
    }

    return {
        strength: graphData?.strength,
        stamina: graphData?.stamina,
        pace: graphData?.pace,
        marking: graphData?.marking,
        tackling: graphData?.tackling,
        workrate: graphData?.workrate,
        positioning: graphData?.positioning,
        passing: graphData?.passing,
        crossing: graphData?.crossing,
        technique: graphData?.technique,
        heading: graphData?.heading,
        finishing: graphData?.finishing,
        longshots: graphData?.longshots,
        set_pieces: graphData?.set_pieces,
    };
};

const _buildTIHistory = (skillIndexHistory, tiHistory = null, isGK = false) => {
    const skillIndex = Array.isArray(skillIndexHistory) ? skillIndexHistory.map(Number) : [];
    return skillIndex.map((asi, index) => {
        const explicitTI = Number(tiHistory?.[index]);
        if (index > 0 && Number.isFinite(asi) && Number.isFinite(skillIndex[index - 1])) {
            const prevSkillSum = calcAsiSkillSum({ asi: skillIndex[index - 1], isGK });
            const currentSkillSum = calcAsiSkillSum({ asi, isGK });
            const derivedTI = Math.round((currentSkillSum - prevSkillSum) * 10);
            if (!Number.isFinite(explicitTI) || explicitTI === 0) return derivedTI;
        }
        return Number.isFinite(explicitTI) ? explicitTI : 0;
    });
};

const _getMergedHistoryKeys = (DBPlayer, records) => _sortAgeKeys(
    Object.keys(DBPlayer?.records || {}).concat(Object.keys(records || {}))
);

const _capGrowthDecimals = (decArr, intArr, N) => {
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

const _normalizeTrainingWeights = (training, isGK) => {
    const grp = isGK ? TRAINING_GROUPS_GK : TRAINING_GROUPS_OUT;
    const grpCount = grp.length;
    const skillCount = isGK ? 11 : 14;
    const equal = new Array(grpCount).fill(1 / grpCount);
    if (isGK) return [1];
    if (Array.isArray(training)) {
        const dots = training.slice(0, grpCount).map(v => Math.max(0, Number(v) || 0));
        if (!dots.some(Boolean)) return equal;
        const smoothed = dots.map(v => v + SMOOTH_WEIGHT);
        const total = smoothed.reduce((sum, value) => sum + value, 0);
        return total > 0 ? smoothed.map(v => v / total) : equal;
    }
    if (training && typeof training === 'object') {
        if (Array.isArray(training.custom)) return _normalizeTrainingWeights(training.custom, isGK);
        if (training.standard != null) return _normalizeTrainingWeights(training.standard, isGK);
    }
    const focusIdx = STD_FOCUS?.[String(training)];
    if (focusIdx == null) return equal;
    const weights = grp.map(group => 0.75 * (group.length / skillCount));
    weights[focusIdx] += 0.25;
    const total = weights.reduce((sum, value) => sum + value, 0);
    return total > 0 ? weights.map(v => v / total) : equal;
};

const _computeGrowthDecimalsInternal = (records, ageKeys, player, getWeights) => {
    const N = player.isGK ? 11 : 14;
    const GRP = player.isGK ? TRAINING_GROUPS_GK : TRAINING_GROUPS_OUT;
    const GRP_COUNT = GRP.length;
    const ASI_WEIGHT = player.isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
    const totalPts = (si) => Math.pow(2, Math.log(ASI_WEIGHT * (si || 0)) / Math.log(128));
    const eff = TmUtils.skillEff;
    const calcShares = (intS, monthIndex) => {
        const gw = getWeights(monthIndex, intS);
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
    const result = {};
    const r0 = records[ageKeys[0]];
    const firstSkills = _safeGrowthSkills(r0.skills);
    const rem0 = totalPts(r0.SI) - firstSkills.reduce((a, b) => a + b, 0);
    let dec = _capGrowthDecimals(calcShares(firstSkills, 0).map(s => Math.max(0, rem0 * s)), firstSkills, N);
    result[ageKeys[0]] = dec;
    for (let m = 1; m < ageKeys.length; m++) {
        const prevKey = ageKeys[m - 1], currKey = ageKeys[m];
        const piSkills = _safeGrowthSkills(records[prevKey].skills), ciSkills = _safeGrowthSkills(records[currKey].skills);
        const ptg = totalPts(records[prevKey].SI), ctg = totalPts(records[currKey].SI);
        const delta = ctg - ptg;
        const cRem = ctg - ciSkills.reduce((a, b) => a + b, 0);
        const gains = calcShares(piSkills, m - 1).map(s => delta * s);
        let newDec = dec.map((d, i) => d + gains[i]);
        for (let i = 0; i < N; i++) {
            const chg = ciSkills[i] - piSkills[i];
            if (chg > 0) { newDec[i] -= chg; if (newDec[i] < 0) newDec[i] = 0; }
            if (ciSkills[i] >= 20) newDec[i] = 0;
        }
        const ndSum = newDec.reduce((a, b) => a + b, 0);
        if (ndSum > 0.001) {
            const scale = cRem / ndSum;
            dec = _capGrowthDecimals(newDec.map((d, i) => ciSkills[i] >= 20 ? 0 : d * scale), ciSkills, N);
        } else {
            dec = _capGrowthDecimals(calcShares(ciSkills, m).map(s => Math.max(0, cRem * s)), ciSkills, N);
        }
        result[currKey] = dec;
    }
    return result;
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
    const grpCount = player.isGK ? 1 : 6;
    const weights = Array.isArray(gw) && gw.length === grpCount ? gw : new Array(grpCount).fill(1 / grpCount);
    return _computeGrowthDecimalsInternal(records, ageKeys, player, () => weights);
};

/**
 * Reconstruct full monthly skill values (integer + decimal) from history.
 * `trainingHistory` can be a single custom-dot array / standard id, or an array of
 * month-by-month entries using the same shapes.
 */
const reconstructSkillHistory = ({
    skillIndexHistory,
    skillHistory,
    trainingHistory,
    currentTraining,
    tiHistory = null,
    ageKeys = null,
    isGK = false,
    skillKeys = null,
}) => {
    if (!Array.isArray(skillIndexHistory) || !skillIndexHistory.length) {
        throw new Error('skillIndexHistory is required');
    }
    const defaultSkillKeys = _getHistoryStatKeys(isGK);
    const resolvedSkillKeys = skillKeys || defaultSkillKeys;
    const resolvedAgeKeys = ageKeys || skillIndexHistory.map((_, i) => `${Math.floor(i / 12)}.${i % 12}`);
    const monthCount = skillIndexHistory.length;
    if (resolvedAgeKeys.length !== monthCount) throw new Error('ageKeys length mismatch');

    const monthlySkills = Array.isArray(skillHistory)
        ? (Array.isArray(skillHistory[0])
            ? skillHistory
            : resolvedAgeKeys.map((_, monthIndex) => skillHistory.map(arr => arr[monthIndex])))
        : resolvedAgeKeys.map((_, monthIndex) => resolvedSkillKeys.map(key => skillHistory?.[key]?.[monthIndex]));

    if (monthlySkills.length !== monthCount || monthlySkills.some(skills => !Array.isArray(skills))) {
        throw new Error('skillHistory shape is invalid');
    }

    const records = {};
    resolvedAgeKeys.forEach((key, monthIndex) => {
        records[key] = {
            SI: Number(skillIndexHistory[monthIndex]) || 0,
            skills: monthlySkills[monthIndex],
        };
    });

    const monthlyTraining = Array.isArray(trainingHistory) && trainingHistory.length === monthCount && Array.isArray(trainingHistory[0])
        ? trainingHistory
        : resolvedAgeKeys.map((_, monthIndex) => {
            if (Array.isArray(trainingHistory) && trainingHistory.length === monthCount && !Array.isArray(trainingHistory[0])) {
                return trainingHistory[monthIndex];
            }
            return trainingHistory ?? currentTraining;
        });
    const resolvedTIHistory = _buildTIHistory(skillIndexHistory, tiHistory, isGK);

    const decimals = _computeGrowthDecimalsInternal(records, resolvedAgeKeys, { isGK }, (monthIndex) =>
        _normalizeTrainingWeights(monthlyTraining?.[monthIndex], isGK)
    );

    const reconstructed = {};
    resolvedAgeKeys.forEach((key, monthIndex) => {
        const intSkills = _safeGrowthSkills(records[key].skills);
        reconstructed[key] = {
            ageKey: key,
            SI: records[key].SI,
            TI: Number(resolvedTIHistory[monthIndex] ?? 0),
            skills: intSkills.map((value, index) => value + decimals[key][index]),
        };
    });

    return reconstructed;
};

const reconstructSkillHistoryFromGraph = (player, DBPlayer, graphData, records) => {
    const historyKeys = _getMergedHistoryKeys(DBPlayer, records);
    const n = graphData?.skill_index?.length || 0;
    const isGK = player?.isGK ?? false;
    const statKeys = _getHistoryStatKeys(isGK);
    const graphSkillMap = _getGraphHistorySkillMap(graphData, isGK);
    const currentTraining = player?.training ?? null;
    const resolveGraphIndex = (key) => {
        const [y, m] = key.split('.').map(Number);
        const idx = (n - 1) - (player.ageMonths - (y * 12 + m));
        return idx >= 0 && idx < n ? idx : -1;
    };

    return reconstructSkillHistory({
        ageKeys: historyKeys,
        isGK: player?.isGK ?? false,
        currentTraining,
        skillIndexHistory: historyKeys.map((key) => {
            const idx = resolveGraphIndex(key);
            if (idx !== -1) return Number(graphData?.skill_index?.[idx] ?? 0);
            return Number(DBPlayer?.records?.[key]?.SI ?? records?.[key]?.SI ?? 0);
        }),
        tiHistory: historyKeys.map(key => Number(DBPlayer?.records?.[key]?.TI ?? records?.[key]?.TI ?? 0)),
        skillHistory: statKeys.reduce((acc, statKey) => {
            acc[statKey] = historyKeys.map((key) => {
                const idx = resolveGraphIndex(key);
                const statIndex = statKeys.indexOf(statKey);
                if (idx !== -1) return Number(graphSkillMap[statKey]?.[idx] ?? 0);
                return Math.floor(DBPlayer?.records?.[key]?.skills?.[statIndex] ?? 0);
            });
            return acc;
        }, {}),
    });
};

const reconstructSkillHistoryFromRecords = (player, DBPlayer, records) => {
    const historyKeys = _getMergedHistoryKeys(DBPlayer, records);
    const statKeys = _getHistoryStatKeys(player?.isGK ?? false);
    const currentTraining = player?.training ?? null;
    const fallbackSkills = Array.isArray(player?.skills)
        ? player.skills.map(skill => Math.floor(_sv(skill) || 0))
        : new Array(player?.isGK ? 11 : 14).fill(0);
    const resolvedRecords = {};
    let previousSkills = fallbackSkills;

    historyKeys.forEach((key) => {
        const record = DBPlayer?.records?.[key] || records?.[key] || {};
        const intSkills = Array.isArray(record.skills) && record.skills.length
            ? record.skills.map(skill => Math.floor(_sv(skill) || 0))
            : previousSkills;
        previousSkills = intSkills;
        resolvedRecords[key] = {
            SI: Number(record.SI ?? 0),
            TI: Number(record.TI ?? 0),
            skills: intSkills,
        };
    });

    return reconstructSkillHistory({
        ageKeys: historyKeys,
        isGK: player?.isGK ?? false,
        currentTraining,
        skillIndexHistory: historyKeys.map(key => resolvedRecords[key].SI),
        tiHistory: historyKeys.map(key => resolvedRecords[key].TI),
        skillHistory: statKeys.reduce((acc, statKey, statIndex) => {
            acc[statKey] = historyKeys.map(key => resolvedRecords[key].skills?.[statIndex] ?? 0);
            return acc;
        }, {}),
    });
};

const _sortAgeKeys = (keys) => Array.from(new Set(keys || []))
    .sort((a, b) => {
        const [ay, am] = String(a).split('.').map(Number);
        const [by, bm] = String(b).split('.').map(Number);
        return ay * 12 + am - (by * 12 + bm);
    });

const _sumSkillValues = (skills) => (Array.isArray(skills) ? skills.reduce((sum, skill) => sum + _sv(skill), 0) : 0);

const _calcASIFromSkillSum = (skillSum, isGK) => {
    const K = isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
    return Math.max(0, Math.round(Math.pow(Math.max(0, skillSum), 7) / K));
};

const _buildWeightedIntegerSeries = (total, count, liveTI = null) => {
    const safeTotal = Math.round(Number(total) || 0);
    if (count <= 0) return [];
    if (count === 1) return [safeTotal];

    const sign = safeTotal < 0 ? -1 : 1;
    const magnitude = Math.abs(safeTotal);

    const avg = magnitude / count;
    const liveRaw = Number.isFinite(Number(liveTI)) ? Math.round(Number(liveTI)) : sign * avg;
    const live = Math.abs(liveRaw);
    const slope = Math.min(0.75, Math.abs(live - avg) / Math.max(1, avg || 1));
    const rawWeights = Array.from({ length: count }, (_, index) => {
        const progress = count === 1 ? 1 : index / (count - 1);
        const directional = live >= avg ? progress : 1 - progress;
        return 1 + directional * slope;
    });
    const rawTotal = rawWeights.reduce((sum, weight) => sum + weight, 0) || 1;
    const quotas = rawWeights.map(weight => magnitude * weight / rawTotal);
    const series = quotas.map(value => Math.floor(value));
    let remainder = magnitude - series.reduce((sum, value) => sum + value, 0);

    quotas
        .map((value, index) => ({ index, frac: value - Math.floor(value) }))
        .sort((a, b) => b.frac - a.frac)
        .forEach(({ index }) => {
            if (remainder <= 0) return;
            series[index] += 1;
            remainder -= 1;
        });

    return series.map(value => value * sign);
};

const reconstructSkillHistoryFromGuess = (player, DBPlayer, missingKeys) => {
    const segmentKeys = _sortAgeKeys(missingKeys);
    if (!segmentKeys.length || !DBPlayer?.records) return {};

    const historyKeys = _sortAgeKeys(Object.keys(DBPlayer.records).concat(segmentKeys));
    const firstMissingIndex = historyKeys.indexOf(segmentKeys[0]);
    if (firstMissingIndex <= 0) return {};

    const startKey = historyKeys[firstMissingIndex - 1];
    const startRecord = DBPlayer.records[startKey];
    if (!startRecord?.skills?.length) return {};

    const endKey = player?.ageMonthsString || segmentKeys.at(-1);
    const endSkills = Array.isArray(player?.skills) ? player.skills.map(_sv) : [];
    if (!endSkills.length) return {};

    const startSkills = startRecord.skills.map(_sv);
    const startIntSkills = startSkills.map(skill => Math.floor(skill || 0));
    const endIntSkills = endSkills.map(skill => Math.floor(skill || 0));
    const startSum = _sumSkillValues(startSkills);
    const endSum = _sumSkillValues(endSkills);
    const totalTI = Math.round((endSum - startSum) * 10);
    const tiSeries = _buildWeightedIntegerSeries(totalTI, segmentKeys.length, player?.ti);
    const cumulativeTI = tiSeries.reduce((acc, ti, index) => {
        acc.push(ti + (acc[index - 1] || 0));
        return acc;
    }, []);
    const currentTraining = player?.training ?? null;
    const statKeys = _getHistoryStatKeys(player?.isGK ?? false);
    const guessedRecords = {};

    historyKeys.forEach((key) => {
        if (!segmentKeys.includes(key)) {
            const record = DBPlayer.records[key] || {};
            guessedRecords[key] = {
                SI: Number(record.SI ?? 0),
                TI: Number(record.TI ?? 0),
                skills: Array.isArray(record.skills) ? record.skills.map(skill => Math.floor(_sv(skill) || 0)) : startIntSkills,
            };
            return;
        }

        const segmentIndex = segmentKeys.indexOf(key);
        const progress = totalTI > 0
            ? cumulativeTI[segmentIndex] / totalTI
            : (segmentIndex + 1) / segmentKeys.length;
        const intSkills = startIntSkills.map((value, skillIndex) => {
            const delta = Math.max(0, endIntSkills[skillIndex] - value);
            const advanced = segmentIndex === segmentKeys.length - 1 ? delta : Math.floor(delta * progress + 1e-9);
            return value + Math.min(delta, advanced);
        });
        const skillSum = startSum + ((cumulativeTI[segmentIndex] || 0) / 10);
        guessedRecords[key] = {
            SI: key === endKey ? Number(player?.asi ?? 0) : _calcASIFromSkillSum(skillSum, player?.isGK ?? false),
            TI: Number(tiSeries[segmentIndex] ?? 0),
            skills: intSkills,
        };
    });

    const reconstructed = reconstructSkillHistory({
        ageKeys: historyKeys,
        isGK: player?.isGK ?? false,
        currentTraining,
        skillIndexHistory: historyKeys.map(key => guessedRecords[key]?.SI ?? 0),
        tiHistory: historyKeys.map(key => guessedRecords[key]?.TI ?? 0),
        skillHistory: statKeys.reduce((acc, statKey, statIndex) => {
            acc[statKey] = historyKeys.map(key => guessedRecords[key]?.skills?.[statIndex] ?? 0);
            return acc;
        }, {}),
    });

    if (reconstructed[endKey]) {
        reconstructed[endKey] = {
            ...reconstructed[endKey],
            SI: Number(player?.asi ?? reconstructed[endKey].SI ?? 0),
            skills: endSkills,
        };
    }

    return reconstructed;
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
    calcSkillDecimalsSimple,
    calcSkillDecimals,
    computeGrowthDecimals,
    reconstructSkillHistory,
    reconstructSkillHistoryFromGraph,
    reconstructSkillHistoryFromRecords,
    reconstructSkillHistoryFromGuess,
    buildRoutineMap,
    calculatePlayerR5,
    calculatePlayerREC,
    calcASIProjection,
    getCurrentSession: _getCurrentSession,
    calculateTI,
    calculateTIPerSession,
};

