import { TmLib } from '../../lib/tm-lib.js';
import { buildWeightedIntegerSeries } from './shared.js';

const keyToAbs = (key) => {
    const [a, m] = String(key).split('.').map(Number);
    return a * 12 + m;
};

const absToKey = (abs) => `${Math.floor(abs / 12)}.${abs % 12}`;

/**
 * Given a known ASI at monthKey and TI for that month,
 * return the ASI of the previous month by projecting backward (negate TI).
 */
const asiOneMonthBack = (asi, ti, isGK) =>
    TmLib.calcASIProjection({ player: { asi, isGK }, trainings: 1, avgTI: -ti }).newASI;

/**
 * Fill TI and ASI for own players.
 * TI: directly from graphData.TI (index 0 = live, 1..n = history oldest→newest).
 * ASI: start with player.asi at current month, go backward using calcASIProjection.
 */
const fillOwnPlayerTIandASI = (player) => {
    const { monthKeys, records, graphData } = player;
    const currentKey = player.ageMonthsString;
    const currentAbs = keyToAbs(currentKey);
    const graphMonths = graphData?.TI?.length ? graphData.TI.length - 1 : 0;

    // TI from graph: TI[0] = live session (skip), TI[1..n] = monthly history oldest→newest
    for (let i = 0; i < graphMonths; i++) {
        const abs = currentAbs - graphMonths + 1 + i;
        const key = absToKey(abs);
        if (records[key]) {
            const ti = graphData.TI[i + 1];
            records[key].TI = ti != null ? Number(ti) : null;
        }
    }

    // ASI backward: start from current, go left one month at a time
    records[currentKey].ASI = player.asi;
    for (let i = monthKeys.length - 2; i >= 0; i--) {
        const key = monthKeys[i];
        const nextKey = monthKeys[i + 1];
        const nextASI = records[nextKey]?.ASI;
        const nextTI = records[nextKey]?.TI;
        if (nextASI == null || nextTI == null) continue;
        records[key].ASI = asiOneMonthBack(nextASI, nextTI, player.isGK);
    }
};

/**
 * Fill TI and ASI for foreign players.
 * ASI anchors from DB records (SI field). Between two anchors, total TI =
 * projection-derived difference distributed with buildWeightedIntegerSeries.
 * ASI for all months computed backward from current using calcASIProjection.
 */
const fillForeignPlayerTIandASI = (player) => {
    const { monthKeys, records, DBPlayer } = player;
    const currentKey = player.ageMonthsString;
    const liveTI = player.ti ?? null;

    records[currentKey].ASI = player.asi;

    // ASI anchors: current month + any DB records with SI
    const anchors = monthKeys
        .map(key => {
            const asi = key === currentKey
                ? player.asi
                : (DBPlayer?.records?.[key]?.SI ?? null);
            return asi != null && Number.isFinite(Number(asi))
                ? { key, abs: keyToAbs(key), asi: Number(asi) }
                : null;
        })
        .filter(Boolean);

    // Between consecutive anchors: compute total TI and distribute
    for (let ai = 0; ai < anchors.length - 1; ai++) {
        const startA = anchors[ai];
        const endA = anchors[ai + 1];
        const gapKeys = monthKeys.filter(k => {
            const abs = keyToAbs(k);
            return abs > startA.abs && abs <= endA.abs;
        });
        if (!gapKeys.length) continue;

        // Forward project from startA to endA to get correct total TI
        const totalTI = Math.round(
            TmLib.calcASIProjection({ player: { asi: startA.asi, isGK: player.isGK }, trainings: gapKeys.length, avgTI: liveTI }).newASI
                === endA.asi
                ? liveTI * gapKeys.length
                : (endA.asi - startA.asi) * 10
        );
        const series = buildWeightedIntegerSeries(totalTI, gapKeys.length, liveTI);
        gapKeys.forEach((key, i) => { records[key].TI = series[i]; });
    }

    // ASI backward: start from current, use filled TI values
    for (let i = monthKeys.length - 2; i >= 0; i--) {
        const key = monthKeys[i];
        const nextKey = monthKeys[i + 1];
        const nextASI = records[nextKey]?.ASI;
        const nextTI = records[nextKey]?.TI;
        if (nextASI == null || nextTI == null) continue;
        records[key].ASI = asiOneMonthBack(nextASI, nextTI, player.isGK);
    }
};

/**
 * Step 5: Fill TI and ASI for all players with needSync.
 * Mutates player.records in-place, returns same array.
 *
 * @param {object[]} players
 * @returns {object[]}
 */
export const fillTIandASI = (players) => {
    for (const player of players) {
        if (!player.needSync) continue;
        if (player.isOwnPlayer && player.graphData?.TI?.length) {
            fillOwnPlayerTIandASI(player);
        } else {
            fillForeignPlayerTIandASI(player);
        }
    }
    return players;
};
