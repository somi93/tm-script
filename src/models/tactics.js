import { TmTacticsService } from '../services/tactics.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { normalizeTacticsPlayer, applyPlayerPositionRatings } from '../utils/normalize/player.js';

const _enrichFromDb = async (player) => {
    const dbPlayer = await TmPlayerDB.get(player.id);
    player.records = dbPlayer?.records || {};

    const latestRecord = dbPlayer?.records?.[player.ageMonthsString];
    if (!Array.isArray(latestRecord?.skills) || !player.skills?.length) return player;

    player.skills = player.skills.map((skill, i) => ({
        ...skill,
        value: latestRecord.skills[i] != null ? Number(latestRecord.skills[i]) : skill.value,
    }));
    applyPlayerPositionRatings(player);
    player.allPositionRatings = player.positions;

    const last2 = Object.values(player.records).reverse().slice(0, 2);
    if (last2.length === 2) {
        player.ti = Number(last2[0].TI);
        player.TI_change = Number(last2[0].TI) - Number(last2[1].TI);
    }

    return player;
};

export const TmTacticsModel = {

    async fetchTactics(reserves, national, miniGameId, { clubId = '' } = {}) {
        const raw = await TmTacticsService.fetchTacticsRaw(reserves, national, miniGameId);
        if (!raw) return null;

        const players = await Promise.all(
            (raw.players || []).map(p => _enrichFromDb(normalizeTacticsPlayer(p)))
        );
        const players_by_id = Object.fromEntries(players.map(p => [String(p.id), p]));

        return {
            players,
            players_by_id,
            formation:        raw.formation        || {},
            formation_by_pos: raw.formation_by_pos || {},
            formation_subs:   raw.formation_subs   || {},
            formation_assoc:  raw.formation_assoc  || {},
            positions:        raw.positions        || [],
        };
    },
};
