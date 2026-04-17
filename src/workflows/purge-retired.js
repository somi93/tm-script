import { TmPlayerModel } from '../models/player.js';
import { archivePlayerRecord } from '../lib/tm-playerdb.js';

/**
 * Scan player IDs one by one: fetch tooltip, archive those whose club_id is absent.
 *
 * @param {string[]} pids
 * @param {function({done:number, total:number, archived:number, pid:string}):void} [onProgress]
 * @returns {Promise<{archived:string[], kept:string[], failed:string[]}>}
 */
export const purgeRetiredPlayers = async (pids, onProgress) => {
    const archived = [], kept = [], failed = [];
    const total = pids.length;
    for (let i = 0; i < pids.length; i++) {
        const pid = String(pids[i]);
        try {
            const player = await TmPlayerModel.fetchPlayerTooltip(pid);
            if (!player || !player.club_id) {
                await archivePlayerRecord(pid);
                archived.push(pid);
            } else {
                kept.push(pid);
            }
        } catch {
            failed.push(pid);
        }
        onProgress?.({ done: i + 1, total, archived: archived.length, pid });
    }
    return { archived, kept, failed };
};
