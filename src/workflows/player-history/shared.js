import { TmConst } from '../../lib/tm-constants.js';

const {
    TRAINING_GROUPS_OUT, TRAINING_GROUPS_GK,
    STD_FOCUS, SMOOTH_WEIGHT,
} = TmConst;

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
