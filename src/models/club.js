import { TmLib } from '../lib/tm-lib.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmClubService } from '../services/club.js';
import { applyPlayerPositionRatings, normalizeSquadPlayer } from '../utils/normalize/player.js';
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

            player.records = DBPlayer?.records || {};

            const latestRecord = DBPlayer?.records?.[player.ageMonthsString];
            if (!Array.isArray(latestRecord?.skills) || !player.skills?.length) return player;

            player.skills = player.skills.map((skill, skillIndex) => ({
                ...skill,
                value: latestRecord.skills[skillIndex] != null ? Number(latestRecord.skills[skillIndex]) : skill.value,
            }));
            applyPlayerPositionRatings(player);
            const last2Records = Object.values(player.records).reverse().slice(0, 2);
            if(Array.isArray(last2Records) && last2Records.length === 2) {
                player.ti = Number(last2Records[0].TI);
                // console.log(player.name, player.ti);
                // if(player.ti === 0) console.log(player.id, player.graphs, player.records);
                player.TI_change = Number(last2Records[0].TI) - Number(last2Records[1].TI);
            }
            return player;
        }));
    },
};
