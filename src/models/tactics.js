import { TmTacticsService } from '../services/tactics.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { normalizeTacticsPlayer, applyPlayerPositionRatings } from '../utils/normalize/player.js';

const SPECIAL_KEYS = ['captain', 'corner', 'penalty', 'freekick'];

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

    async fetchTactics(reserves, national, miniGameId, { initialSettings = {} } = {}) {
        const raw = await TmTacticsService.fetchTacticsRaw(reserves, national, miniGameId);
        if (!raw) return null;

        const players = await Promise.all(
            (raw.players || []).map(p => _enrichFromDb(normalizeTacticsPlayer(p)))
        );

        const assoc = raw.formation_assoc || {};

        players.forEach(player => {
            const position = (player.positions || []).find(p => Number(assoc[p.key]) === player.id);
            if (position) {
                position.playing = true;
            }
        });

        const specialRoles = {};
        for (const role of SPECIAL_KEYS) {
            specialRoles[role] = assoc[role] ? Number(assoc[role]) : null;
        }
        return {
            players,
            specialRoles,
            formation_assoc: assoc,
            mentality: Number(initialSettings.mentality) || 4,
            attacking: Number(initialSettings.style) || 1,
            focus: Number(initialSettings.focus) || 1,
        };
    },

    fetchCondOrders(reserves, national, miniGameId) {
        return TmTacticsService.fetchCondOrders(reserves, national, miniGameId);
    },

    saveCondOrder(coData, reserves, national, miniGameId) {
        return TmTacticsService.saveCondOrder(coData, reserves, national, miniGameId);
    },

    deleteCondOrder(num, reserves, national, miniGameId) {
        return TmTacticsService.deleteCondOrder(num, reserves, national, miniGameId);
    },

    postLineupSave(assoc, changedPlayers, reserves, national, miniGameId) {
        return TmTacticsService.postLineupSave(assoc, changedPlayers, reserves, national, miniGameId);
    },

    saveSettingValue(saveKey, value, reserves, national, miniGameId) {
        return TmTacticsService.saveSettingValue(saveKey, value, reserves, national, miniGameId);
    },
};

export { CLUB_COUNTRY, isForeigner, isUnavailable } from '../services/tactics.js';
