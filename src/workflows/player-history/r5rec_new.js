import { TmLib } from '../../lib/tm-lib.js';

/**
 * Step 10: For each needSync player, compute max R5 and REC per month
 * across all preferred positions (falling back to all positions if none preferred).
 * Stores result as record.r5 and record.rec. Mutates players in-place.
 */
export const attachR5Rec = (players) => {
    for (const player of players) {
        if (!player.needSync) continue;
        if (!Array.isArray(player.positions)) continue;

        const preferredPositions = player.positions.filter(p => p.preferred);
        const positionsForRatings = preferredPositions.length ? preferredPositions : player.positions;

        for (const key of player.monthKeys) {
            const record = player.records[key];
            if (!record || !Array.isArray(record.skills)) continue;

            const snapshot = {
                skills: record.skills,
                asi: record.ASI,
                routine: record.routine ?? 0,
            };

            let maxR5 = null;
            let maxRec = null;

            for (const position of positionsForRatings) {
                const r5 = Number(TmLib.calculatePlayerR5(position, snapshot));
                const rec = Number(TmLib.calculatePlayerREC(position, snapshot));
                if (Number.isFinite(r5) && (maxR5 === null || r5 > maxR5)) maxR5 = r5;
                if (Number.isFinite(rec) && (maxRec === null || rec > maxRec)) maxRec = rec;
            }

            record.r5 = maxR5;
            record.rec = maxRec;
        }
    }

    return players;
};
