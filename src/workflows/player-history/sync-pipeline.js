import { attachSyncStatus } from './filter.js';
import { buildHistorySkeletons } from './sources.js';
import { fillTIandASI } from './ti_asi.js';
import { attachSkillsAnchor } from './skills.js';
import { attachRoutine } from './routine.js';
import { attachR5Rec } from './r5rec.js';
import { saveHistoryRecords } from './save.js';

/**
 * Run the full sync pipeline on an array of players.
 * @param {object[]} players — raw normalized players (may include non-own players)
 * @param {function(done:number, total:number):void} [onProgress] — called after each player's fetch
 * @param {{ mode?: 'full'|'missing-only' }} [opts]
 *   mode 'full' (default): sync if missing months OR no fullySynced; writes fullySynced.
 *   mode 'missing-only': sync only if missing months; does NOT write fullySynced.
 * @returns {Promise<object[]>}
 */
export const runSyncPipeline = async (players, onProgress, { mode = 'full' } = {}) => {
    // Step 3: Attach needSync + DBPlayer
    const withSync = await attachSyncStatus(players, { mode });

    // Step 4: Fetch graphs + training for needSync players
    const withData = await buildHistorySkeletons(withSync, onProgress);

    // Step 5: Fill TI and ASI per month
    fillTIandASI(withData);

    // Step 7a: Find anchor + apply decimal skills forward
    attachSkillsAnchor(withData);

    // Step 9: Fill routine via interpolation
    attachRoutine(withData);

    // Step 10+11: R5/REC per month + mark fullySynced on current month (full mode only)
    const needSync = withData.filter(p => p.needSync);
    for (const player of needSync) {
        attachR5Rec([player]);
        if (mode === 'full') {
            const currentRecord = player.records?.[player.ageMonthsString];
            if (currentRecord) currentRecord.fullySynced = true;
        }
    }

    // Save to DB
    await saveHistoryRecords(withData);

    return withData;
};
