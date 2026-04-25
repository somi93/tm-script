import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmClubService } from '../services/club.js';
import { applyPlayerPositionRatings, normalizeSquadPlayer } from '../utils/normalize/player.js';
import { normalizeClubTransfers } from '../utils/normalize/club.js';

export const TmClubModel = {
    fetchClubFixtures(clubId) {
        return TmClubService.fetchClubFixtures(clubId);
    },

    fetchClubMatchHistory(clubId, seasonId) {
        return TmClubService.fetchClubMatchHistory(clubId, seasonId);
    },

    fetchClubLeagueHistory(clubId, seasonId) {
        return TmClubService.fetchClubLeagueHistory(clubId, seasonId);
    },

    fetchClubRecords(clubId) {
        return TmClubService.fetchClubRecords(clubId);
    },

    fetchClubPageHtml(clubId) {
        return TmClubService.fetchClubPageHtml(clubId);
    },

    async fetchSquadRaw(clubId, skillChangesMap = null) {
        const post = await TmClubService.fetchSquadPost(clubId);
        if (!post) return null;

        const players = Object.values(post).map((player) => normalizeSquadPlayer(player));
        return Promise.all(players.map(async (player) => {
            player.weeklyChanges = skillChangesMap?.get(player.id) || null;
            const initialDBPlayer = await TmPlayerDB.get(player.id);

            player.records = initialDBPlayer?.records || {};

            const latestRecord = initialDBPlayer?.records?.[player.ageMonthsString];
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

export const fetchRawPlayers = async (clubId) => {
    if (!clubId) return [];
    const post = await TmClubService.fetchSquadPost(clubId);
    if (!post) return [];
    return Object.values(post).map(normalizeSquadPlayer);
};

export const fetchClubTransfers = async (clubId, season, opts = {}) => {
    const html = await TmClubService.fetchClubTransferHistory(clubId, season);
    return html ? normalizeClubTransfers(html, opts) : null;
};
