import { TmLib } from '../lib/tm-lib.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmClubService } from '../services/club.js';
import { normalizeSquadPlayer } from '../utils/normalize/player.js';
import { TmPlayerHistorySyncWorkflow } from '../workflows/player-history-sync.js';

export const TmClubModel = {
    async fetchSquadRaw(clubId, sync = false) {
        const post = await TmClubService.fetchSquadPost(clubId);
        if (!post) return null;

        const players = Object.values(post).map((player) => normalizeSquadPlayer(player));
        return Promise.all(players.map(async (player) => {
            const initialDBPlayer = await TmPlayerDB.get(player.id);
            let DBPlayer = initialDBPlayer;

            if (sync) {
                const records = await TmPlayerHistorySyncWorkflow.syncMissingRecords(player, initialDBPlayer);
                if (Object.keys(records || {}).length) {
                    DBPlayer = await TmPlayerDB.get(player.id);
                }
            }

            const latestRecord = DBPlayer?.records?.[player.ageMonthsString];
            if (!Array.isArray(latestRecord?.skills) || !player.skills?.length) return player;

            player.skills = player.skills.map((skill, skillIndex) => ({
                ...skill,
                value: latestRecord.skills[skillIndex] != null ? Number(latestRecord.skills[skillIndex]) : skill.value,
            }));
            player.positions = player.positions.map((position) => ({
                ...position,
                r5: TmLib.calculatePlayerR5(position, player),
                rec: TmLib.calculatePlayerREC(position, player),
            }));

            return player;
        }));
    },
};
