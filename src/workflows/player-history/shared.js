import { TmConst } from '../../lib/tm-constants.js';
import { TmLib } from '../../lib/tm-lib.js';
import { TmPlayerDB } from '../../lib/tm-playerdb.js';
import { TmUtils } from '../../lib/tm-utils.js';

const {
    GRAPH_KEYS_OUT, GRAPH_KEYS_GK,
    TRAINING_GROUPS_OUT, TRAINING_GROUPS_GK,
    ASI_WEIGHT_OUTFIELD, ASI_WEIGHT_GK,
    STD_FOCUS, SMOOTH_WEIGHT,
} = TmConst;

const { skillValue, sortAgeKeys, safeGrowthSkills, skillEff } = TmUtils;

export const getHistoryStatKeys = (isGK) => isGK ? GRAPH_KEYS_GK : GRAPH_KEYS_OUT;

export const getMergedHistoryKeys = (DBPlayer, records) => sortAgeKeys(
    Object.keys(DBPlayer?.records || {}).concat(Object.keys(records || {}))
);

const capGrowthDecimals = (decArr, intArr, count) => {
    const cap = 0.99;
    const decimals = [...decArr];
    let overflow = 0;
    let passes = 0;
    do {
        overflow = 0;
        let freeCount = 0;
        for (let index = 0; index < count; index++) {
            if (intArr[index] >= 20) {
                decimals[index] = 0;
                continue;
            }
            if (decimals[index] > cap) {
                overflow += decimals[index] - cap;
                decimals[index] = cap;
            } else if (decimals[index] < cap) {
                freeCount++;
            }
        }
        if (overflow > 0.0001 && freeCount > 0) {
            const increment = overflow / freeCount;
            for (let index = 0; index < count; index++) {
                if (intArr[index] < 20 && decimals[index] < cap) decimals[index] += increment;
            }
        }
    } while (overflow > 0.0001 && ++passes < 20);

    return decimals;
};

export const normalizeTrainingWeights = (training, isGK) => {
    const groups = isGK ? TRAINING_GROUPS_GK : TRAINING_GROUPS_OUT;
    const groupCount = groups.length;
    const skillCount = isGK ? 11 : 14;
    const equal = new Array(groupCount).fill(1 / groupCount);

    if (isGK) return [1];

    if (Array.isArray(training)) {
        const dots = training.slice(0, groupCount).map(value => Math.max(0, Number(value) || 0));
        if (!dots.some(Boolean)) return equal;
        const smoothed = dots.map(value => value + SMOOTH_WEIGHT);
        const total = smoothed.reduce((sum, value) => sum + value, 0);
        return total > 0 ? smoothed.map(value => value / total) : equal;
    }

    if (training && typeof training === 'object') {
        if (Array.isArray(training.custom)) return normalizeTrainingWeights(training.custom, isGK);
        if (training.standard != null) return normalizeTrainingWeights(training.standard, isGK);
    }

    const focusIdx = STD_FOCUS?.[String(training)];
    if (focusIdx == null) return equal;
    const weights = groups.map(group => 0.75 * (group.length / skillCount));
    weights[focusIdx] += 0.25;
    const total = weights.reduce((sum, value) => sum + value, 0);
    return total > 0 ? weights.map(value => value / total) : equal;
};

const calcGrowthShares = ({ intSkills, isGK, getWeights, monthIndex = 0 }) => {
    const count = isGK ? 11 : 14;
    const groups = isGK ? TRAINING_GROUPS_GK : TRAINING_GROUPS_OUT;
    const groupCount = groups.length;
    const weights = getWeights(monthIndex, intSkills);
    const base = new Array(count).fill(0);
    let overflow = 0;

    for (let groupIndex = 0; groupIndex < groupCount; groupIndex++) {
        const group = groups[groupIndex];
        const perSkill = weights[groupIndex] / group.length;
        for (const skillIndex of group) {
            if (intSkills[skillIndex] >= 20) overflow += perSkill;
            else base[skillIndex] = perSkill;
        }
    }

    const nonMax = intSkills.filter(value => value < 20).length;
    const overflowEach = nonMax > 0 ? overflow / nonMax : 0;
    const weighted = base.map((value, index) => intSkills[index] >= 20 ? 0 : value + overflowEach);
    const actual = weighted.map((value, index) => value * skillEff(intSkills[index]));
    const total = actual.reduce((sum, value) => sum + value, 0);
    return total > 0 ? actual.map(value => value / total) : new Array(count).fill(0);
};

const computeGrowthDecimalsInternal = (records, ageKeys, player, getWeights) => {
    const count = player.isGK ? 11 : 14;
    const asiWeight = player.isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
    const totalPoints = (si) => Math.pow(2, Math.log(asiWeight * (si || 0)) / Math.log(128));

    const result = {};
    const firstRecord = records[ageKeys[0]];
    const firstSkills = safeGrowthSkills(firstRecord.skills);
    const firstRemainder = totalPoints(firstRecord.SI) - firstSkills.reduce((sum, value) => sum + value, 0);
    let decimals = capGrowthDecimals(calcGrowthShares({
        intSkills: firstSkills,
        isGK: player.isGK,
        getWeights,
        monthIndex: 0,
    }).map(share => Math.max(0, firstRemainder * share)), firstSkills, count);
    result[ageKeys[0]] = decimals;

    for (let monthIndex = 1; monthIndex < ageKeys.length; monthIndex++) {
        const prevKey = ageKeys[monthIndex - 1];
        const currKey = ageKeys[monthIndex];
        const prevSkills = safeGrowthSkills(records[prevKey].skills);
        const currSkills = safeGrowthSkills(records[currKey].skills);
        const prevTotal = totalPoints(records[prevKey].SI);
        const currTotal = totalPoints(records[currKey].SI);
        const delta = currTotal - prevTotal;
        const currRemainder = currTotal - currSkills.reduce((sum, value) => sum + value, 0);
        const gains = calcGrowthShares({
            intSkills: prevSkills,
            isGK: player.isGK,
            getWeights,
            monthIndex: monthIndex - 1,
        }).map(share => delta * share);
        let nextDecimals = decimals.map((value, index) => value + gains[index]);

        for (let index = 0; index < count; index++) {
            const skillChange = currSkills[index] - prevSkills[index];
            if (skillChange > 0) {
                nextDecimals[index] -= skillChange;
                if (nextDecimals[index] < 0) nextDecimals[index] = 0;
            }
            if (currSkills[index] >= 20) nextDecimals[index] = 0;
        }

        const nextSum = nextDecimals.reduce((sum, value) => sum + value, 0);
        if (nextSum > 0.001) {
            const scale = currRemainder / nextSum;
            decimals = capGrowthDecimals(nextDecimals.map((value, index) => currSkills[index] >= 20 ? 0 : value * scale), currSkills, count);
        } else {
            decimals = capGrowthDecimals(calcGrowthShares({
                intSkills: currSkills,
                isGK: player.isGK,
                getWeights,
                monthIndex,
            }).map(share => Math.max(0, currRemainder * share)), currSkills, count);
        }

        result[currKey] = decimals;
    }

    return result;
};

export const reconstructSkillHistory = ({
    player,
    skillIndexHistory,
    skillHistoryByKey,
    tiHistory = null,
    routineHistory = null,
    ageKeys = null,
}) => {

    // if (player.id === 140811640) console.log(skillHistoryByKey);
    if (!Array.isArray(skillIndexHistory) || !skillIndexHistory.length) {
        throw new Error('skillIndexHistory is required');
    }

    // if (player.id === 141412439) console.log(player);
    const resolvedSkillKeys = getHistoryStatKeys(player?.isGK);
    const resolvedAgeKeys = ageKeys || skillIndexHistory.map((_, index) => `${Math.floor(index / 12)}.${index % 12}`);
    const monthCount = skillIndexHistory.length;
    if (resolvedAgeKeys.length !== monthCount) throw new Error('ageKeys length mismatch');

    const monthlySkills = resolvedAgeKeys.map((_, monthIndex) =>
        resolvedSkillKeys.map((key) => skillHistoryByKey?.[key]?.[monthIndex])
    );

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

    const decimals = computeGrowthDecimalsInternal(records, resolvedAgeKeys, { isGK: player?.isGK }, () =>
        normalizeTrainingWeights(player?.training ?? null, player?.isGK)
    );

    const reconstructed = {};
    resolvedAgeKeys.forEach((key, monthIndex) => {
        const intSkills = safeGrowthSkills(records[key].skills);
        reconstructed[key] = {
            ageKey: key,
            SI: records[key].SI,
            TI: Math.round(Number(tiHistory?.[monthIndex] ?? 0)),
            routine: Number(routineHistory?.[monthIndex] ?? 0),
            skills: intSkills.map((value, index) => value + decimals[key][index]),
        };
    });

    return reconstructed;
};

export const reconstructSkillHistoryFromGraph = (player, DBPlayer, graphData, records) => {
    const historyKeys = Array.isArray(graphData?.ageKeys) && graphData.ageKeys.length
        ? sortAgeKeys(graphData.ageKeys)
        : getMergedHistoryKeys(DBPlayer, records);
    const statKeys = getHistoryStatKeys(player?.isGK);
    const graphRecords = graphData?.recordsByAgeKey || {};

    return reconstructSkillHistory({
        player,
        ageKeys: historyKeys,
        skillIndexHistory: historyKeys.map((key) => Number(graphRecords[key]?.SI ?? 0)),
        tiHistory: historyKeys.map((key) => Number(graphRecords[key]?.TI ?? 0)),
        skillHistoryByKey: statKeys.reduce((acc, statKey, statIndex) => {
            acc[statKey] = historyKeys.map((key) => Number(graphRecords[key]?.skills?.[statIndex] ?? 0));
            return acc;
        }, {}),
    });
};

export const buildWeightedIntegerSeries = (total, count, liveTI = null) => {
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

export const reconstructSkillHistoryFromEstimate = (player, DBPlayer, missingKeys, options = {}) => {
    if (player.id === 137234654) console.log(player.graphs);
    const { graphRecordsByAgeKey = null, liveTI = player?.ti } = options;
    const graphRecords = graphRecordsByAgeKey || {};

    const allGraphKeys = sortAgeKeys(Object.keys(graphRecords));
    if (!allGraphKeys.length) return {};

    const endKey = player?.ageMonthsString || allGraphKeys.at(-1);
    const endSkills = Array.isArray(player?.skills) ? player.skills.map(skillValue) : [];
    if (!endSkills.length) return {};

    const historyKeys = sortAgeKeys([...allGraphKeys, ...(allGraphKeys.includes(endKey) ? [] : [endKey])]);
    const statKeys = getHistoryStatKeys(player?.isGK);

    // All records with any skill data serve as anchors (pre-estimated by buildPlayerGraphs)
    const guessedRecords = {};
    for (const key of allGraphKeys) {
        const rec = graphRecords[key];
        if (rec?.skills?.some(v => v != null)) {
            guessedRecords[key] = {
                SI: Number(rec.SI ?? 0),
                TI: Number(rec.TI ?? 0),
                routine: Number(rec.routine ?? 0),
                skills: rec.skills.map(v => Math.floor(skillValue(v) || 0)),
            };
        }
    }

    // Live end anchor
    const existingEndTI = graphRecords[endKey]?.TI;
    guessedRecords[endKey] = {
        SI: Number(player?.asi ?? 0),
        TI: Math.round(Number(existingEndTI != null ? existingEndTI : (liveTI ?? 0))),
        routine: Number(player?.routine ?? 0),
        skills: endSkills.map(v => Math.floor(skillValue(v) || 0)),
    };

    return reconstructSkillHistory({
        player,
        ageKeys: historyKeys,
        skillIndexHistory: historyKeys.map(key => Number(guessedRecords[key]?.SI ?? 0)),
        tiHistory: historyKeys.map(key => Number(guessedRecords[key]?.TI ?? 0)),
        routineHistory: historyKeys.map(key => Number(guessedRecords[key]?.routine ?? 0)),
        skillHistoryByKey: statKeys.reduce((acc, statKey, statIndex) => {
            acc[statKey] = historyKeys.map(key => guessedRecords[key]?.skills?.[statIndex] ?? 0);
            return acc;
        }, {}),
    });
};

export const enrichHistoryRecords = (player, history) => {
    const preferredPositions = player.positions.filter(position => position.preferred);
    const positionsForRatings = preferredPositions.length ? preferredPositions : player.positions;
    Object.keys(history).forEach((ageKey) => {
        const historyRecord = history[ageKey];
        const snapshot = {
            ...player,
            asi: historyRecord.SI,
            skills: historyRecord.skills,
            routine: historyRecord.routine ?? 0,
        };

        let maxR5 = null;
        let maxRec = null;
        positionsForRatings.forEach((position) => {
            const r5 = Number(TmLib.calculatePlayerR5(position, snapshot));
            const rec = Number(TmLib.calculatePlayerREC(position, snapshot));
            if (Number.isFinite(r5) && (maxR5 === null || r5 > maxR5)) maxR5 = r5;
            if (Number.isFinite(rec) && (maxRec === null || rec > maxRec)) maxRec = rec;
        });

        history[ageKey] = {
            ...historyRecord,
            R5: maxR5,
            REREC: maxRec,
        };
    });

    return history;
};

export const saveHistoryRecords = async (player, DBPlayer, historyRecords) => {
    const mergedRecords = enrichHistoryRecords(player, {
        ...(DBPlayer?.records || {}),
        ...(historyRecords || {}),
    });
    if (!Object.keys(mergedRecords).length) return historyRecords;
    // if (player.id === 145086218) {
    //     console.log('saveHistoryRecords', player.name, historyRecords, mergedRecords);
    // }
    const preferredPositions = player.positions.filter(position => position.preferred);
    await TmPlayerDB.set(player.id, {
        ...(DBPlayer || {}),
        _v: DBPlayer?._v || 1,
        meta: {
            ...(DBPlayer?.meta || {}),
            name: DBPlayer?.meta?.name || player.name,
            pos: DBPlayer?.meta?.pos || (preferredPositions.length
                ? preferredPositions.map(position => position.position).join(', ')
                : player.positions.filter(position => position.preferred || position.r5 != null).map(position => position.position).join(', ')),
        },
        records: mergedRecords,
    });

    return mergedRecords;
};