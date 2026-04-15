/**
 * Step 9: Fill routine for all months that have no routine.
 *
 * Anchors:
 *   - index 0  → value 0  (if no routine known there)
 *   - current month (last) → player.routine (already set in skeleton)
 *   - any DB record with routine → its value
 *
 * Between consecutive anchors: linear interpolation, rounded to 1 decimal.
 * Records before the first known routine anchor are filled linearly from 0.
 */
export const attachRoutine = (players) => {
    for (const player of players) {
        if (!player.needSync) continue;
        const { monthKeys, records } = player;
        if (!monthKeys?.length) continue;

        const n = monthKeys.length;

        // Build anchors from records that already have routine; force idx=0 → 0
        const anchors = [{ idx: 0, value: 0 }];
        for (let i = 1; i < n; i++) {
            const rou = records[monthKeys[i]]?.routine;
            if (rou != null && Number.isFinite(Number(rou))) {
                anchors.push({ idx: i, value: Number(rou) });
            }
        }

        // Ensure first anchor at idx 0 reflects DB/routine if it was already set
        const firstRecordRoutine = records[monthKeys[0]]?.routine;
        if (firstRecordRoutine != null && Number.isFinite(Number(firstRecordRoutine))) {
            anchors[0].value = Number(firstRecordRoutine);
        }

        // Guarantee last month is an anchor (already set via player.routine in skeleton)
        const lastIdx = n - 1;
        const existingLast = anchors.findIndex(a => a.idx === lastIdx);
        const lastValue = Number(records[monthKeys[lastIdx]]?.routine ?? 0);
        if (existingLast >= 0) {
            anchors[existingLast].value = lastValue;
        } else {
            anchors.push({ idx: lastIdx, value: lastValue });
        }

        // Linear interpolation between each pair of consecutive anchors
        for (let ai = 0; ai < anchors.length - 1; ai++) {
            const { idx: i1, value: v1 } = anchors[ai];
            const { idx: i2, value: v2 } = anchors[ai + 1];
            for (let i = i1; i <= i2; i++) {
                const t = i2 > i1 ? (i - i1) / (i2 - i1) : 1;
                const interpolated = Math.round((v1 + (v2 - v1) * t) * 10) / 10;
                if (records[monthKeys[i]]) {
                    records[monthKeys[i]].routine = interpolated;
                }
            }
        }
    }
    return players;
};
