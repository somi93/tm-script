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

const normalizeTrainingWeights = (training, isGK) => {
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

const computeGrowthDecimalsInternal = (records, ageKeys, player, getWeights) => {
    const count = player.isGK ? 11 : 14;
    const groups = player.isGK ? TRAINING_GROUPS_GK : TRAINING_GROUPS_OUT;
    const groupCount = groups.length;
    const asiWeight = player.isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
    const totalPoints = (si) => Math.pow(2, Math.log(asiWeight * (si || 0)) / Math.log(128));
    const calcShares = (intSkills, monthIndex) => {
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

    const result = {};
    const firstRecord = records[ageKeys[0]];
    const firstSkills = safeGrowthSkills(firstRecord.skills);
    const firstRemainder = totalPoints(firstRecord.SI) - firstSkills.reduce((sum, value) => sum + value, 0);
    let decimals = capGrowthDecimals(calcShares(firstSkills, 0).map(share => Math.max(0, firstRemainder * share)), firstSkills, count);
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
        const gains = calcShares(prevSkills, monthIndex - 1).map(share => delta * share);
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
            decimals = capGrowthDecimals(calcShares(currSkills, monthIndex).map(share => Math.max(0, currRemainder * share)), currSkills, count);
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
    ageKeys = null,
}) => {
    if (!Array.isArray(skillIndexHistory) || !skillIndexHistory.length) {
        throw new Error('skillIndexHistory is required');
    }

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
            TI: Number(tiHistory?.[monthIndex] ?? 0),
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
    console.log(player.name, DBPlayer.records, 3959851289521985219881925);
    if (!DBPlayer?.records) return {};
    console.log(152215215215215125, player.name, forceFullSync);
    const { forceFullSync = false } = options;
    const dbKeys = sortAgeKeys(Object.keys(DBPlayer.records));
    const segmentKeys = forceFullSync
        ? (() => {
            if (!dbKeys.length) return [];
            const endKey = player?.ageMonthsString || dbKeys.at(-1);
            const [fromYear, fromMonth] = String(dbKeys[0] || '').split('.').map(Number);
            const [toYear, toMonth] = String(endKey || '').split('.').map(Number);
            if (!Number.isFinite(fromYear) || !Number.isFinite(fromMonth) || !Number.isFinite(toYear) || !Number.isFinite(toMonth)) return [];

            return Array.from({ length: Math.max(0, (toYear * 12 + toMonth) - (fromYear * 12 + fromMonth) + 1) }, (_, index) => {
                const total = (fromYear * 12 + fromMonth) + index;
                return `${Math.floor(total / 12)}.${total % 12}`;
            }).slice(1);
        })()
        : sortAgeKeys(missingKeys);
    if (!segmentKeys.length) return {};

    const historyKeys = forceFullSync
        ? [dbKeys[0], ...segmentKeys]
        : sortAgeKeys(dbKeys.concat(segmentKeys));
    const firstMissingIndex = historyKeys.indexOf(segmentKeys[0]);
    if (firstMissingIndex <= 0) return {};

    const startKey = historyKeys[firstMissingIndex - 1];
    const startRecord = DBPlayer.records[startKey];
    if (!startRecord?.skills?.length) return {};

    const endKey = player?.ageMonthsString || segmentKeys.at(-1);
    const endSkills = Array.isArray(player?.skills) ? player.skills.map(skillValue) : [];
    if (!endSkills.length) return {};
        console.log(124124421421, player.name, startKey, startRecord.skills, endKey, endSkills);
    const { graphRecordsByAgeKey = null, liveTI = player?.ti, exactLastTI = null } = options;
    const startSkills = startRecord.skills.map(skillValue);
    const startIntSkills = startSkills.map(skill => Math.floor(skill || 0));
    const endIntSkills = endSkills.map(skill => Math.floor(skill || 0));
    const startSum = TmLib.sumSkillValues(startSkills);
    const endSum = TmLib.sumSkillValues(endSkills);
    const totalTI = Math.round((endSum - startSum) * 10);
    const graphTIHistory = segmentKeys.map((key) => {
        const graphTI = graphRecordsByAgeKey?.[key]?.TI;
        return Number.isFinite(Number(graphTI)) ? Math.round(Number(graphTI)) : null;
    });

    let tiSeries;
    if (graphTIHistory.every((value) => value != null)) {
        tiSeries = graphTIHistory;
    } else if (graphTIHistory.some((value) => value != null)) {
        const fallbackSeries = Number.isFinite(Number(exactLastTI)) && segmentKeys.length > 0
            ? (segmentKeys.length === 1
                ? [Math.round(Number(exactLastTI))]
                : [...buildWeightedIntegerSeries(totalTI - Math.round(Number(exactLastTI)), segmentKeys.length - 1, liveTI), Math.round(Number(exactLastTI))])
            : buildWeightedIntegerSeries(totalTI, segmentKeys.length, liveTI);
        tiSeries = graphTIHistory.map((value, index) => value ?? fallbackSeries[index] ?? 0);
    } else if (Number.isFinite(Number(exactLastTI)) && segmentKeys.length > 0) {
        const lastTI = Math.round(Number(exactLastTI));
        if (segmentKeys.length === 1) tiSeries = [lastTI];
        else tiSeries = [...buildWeightedIntegerSeries(totalTI - lastTI, segmentKeys.length - 1, liveTI), lastTI];
    } else {
        tiSeries = buildWeightedIntegerSeries(totalTI, segmentKeys.length, liveTI);
    }

    const resolvedTotalTI = tiSeries.reduce((sum, ti) => sum + ti, 0);
    const cumulativeTI = tiSeries.reduce((acc, ti, index) => {
        acc.push(ti + (acc[index - 1] || 0));
        return acc;
    }, []);
    const statKeys = getHistoryStatKeys(player?.isGK);
    const guessedRecords = {};

    historyKeys.forEach((key) => {
        if (!segmentKeys.includes(key)) {
            const record = DBPlayer.records[key] || {};
            guessedRecords[key] = {
                SI: Number(record.SI ?? 0),
                TI: Number(record.TI ?? 0),
                skills: Array.isArray(record.skills) ? record.skills.map(skill => Math.floor(skillValue(skill) || 0)) : startIntSkills,
            };
            return;
        }

        const segmentIndex = segmentKeys.indexOf(key);
        const progress = resolvedTotalTI > 0 ? cumulativeTI[segmentIndex] / resolvedTotalTI : (segmentIndex + 1) / segmentKeys.length;
        const intSkills = startIntSkills.map((value, skillIndex) => {
            const delta = Math.max(0, endIntSkills[skillIndex] - value);
            const advanced = segmentIndex === segmentKeys.length - 1 ? delta : Math.floor(delta * progress + 1e-9);
            return value + Math.min(delta, advanced);
        });
        const skillSum = startSum + ((cumulativeTI[segmentIndex] || 0) / 10);
        guessedRecords[key] = {
            SI: key === endKey
                ? Number(player?.asi ?? 0)
                : Number(graphRecordsByAgeKey?.[key]?.SI ?? TmLib.calcASIFromSkillSum(skillSum, player?.isGK)),
            TI: Number(tiSeries[segmentIndex] ?? 0),
            skills: intSkills,
        };
    });

    const reconstructed = reconstructSkillHistory({
        player,
        ageKeys: historyKeys,
        skillIndexHistory: historyKeys.map(key => guessedRecords[key]?.SI ?? 0),
        tiHistory: historyKeys.map(key => guessedRecords[key]?.TI ?? 0),
        skillHistoryByKey: statKeys.reduce((acc, statKey, statIndex) => {
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
    console.log(player.name, reconstructed);
    return reconstructed;
};

export const enrichHistoryRecords = (player, history) => {
    console.log(player.name, history);
    const preferredPositions = player.positions.filter(position => position.preferred);
    const positionsForRatings = preferredPositions.length ? preferredPositions : player.positions;
    Object.keys(history).forEach((ageKey) => {
        const historyRecord = history[ageKey];
        const snapshot = {
            ...player,
            asi: historyRecord.SI,
            skills: historyRecord.skills,
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
    if (!historyRecords || !Object.keys(historyRecords).length) return historyRecords;
    // console.log(player.name, historyRecords);
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
        records: {
            ...(DBPlayer?.records || {}),
            ...historyRecords,
        },
    });

    return historyRecords;
};