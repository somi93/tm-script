import { TmPlayerDB } from '../../lib/tm-playerdb.js';

/**
 * Step 11: Save all needSync players to DB.
 * Current month record gets fullySynced: true.
 * Merges new computed records on top of existing DBPlayer records.
 */
export const saveHistoryRecords = async (players) => {
    const tasks = players
        .filter(p => p.needSync && p.records)
        .map(async (player) => {
            const { DBPlayer, records, ageMonthsString } = player;

            // Merge: existing DB records as base, new computed records on top
            const merged = { ...(DBPlayer?.records || {}), ...records };

            // Mark current month as fully synced
            if (ageMonthsString && merged[ageMonthsString]) {
                merged[ageMonthsString] = {
                    ...merged[ageMonthsString],
                    fullySynced: true,
                };
            }

            const preferredPositions = (player.positions || []).filter(p => p.preferred);
            await TmPlayerDB.set(player.id, {
                ...(DBPlayer || {}),
                _v: DBPlayer?._v || 1,
                meta: {
                    ...(DBPlayer?.meta || {}),
                    name: DBPlayer?.meta?.name || player.name,
                    pos: DBPlayer?.meta?.pos || (preferredPositions.length
                        ? preferredPositions.map(p => p.position).join(', ')
                        : (player.positions || []).map(p => p.position).join(', ')),
                },
                records: merged,
            });
        });

    await Promise.all(tasks);
};
