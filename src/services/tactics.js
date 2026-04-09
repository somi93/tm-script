import { _post, _dedup, _logError } from './engine.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmPlayerService } from './player.js';

const sanitizeSkills = player => {
    if (!Array.isArray(player?.skills)) return;
    player.skills = player.skills.filter(skill => skill && typeof skill === 'object');
};

export const TmTacticsService = {

    fetchTacticsRaw(reserves, national, miniGameId) {
        return _dedup(`tactics:get:${reserves}:${national}:${miniGameId}`, () =>
            _post('/ajax/tactics_get.ajax.php', { reserves, national, miniGameId })
        );
    },

    async fetchTactics(reserves, national, miniGameId, { clubId = '' } = {}) {
        let dbReady = true;
        try {
            await TmPlayerDB.init();
        } catch (error) {
            dbReady = false;
            _logError('TacticsService DB init', error);
        }

        const data = await this.fetchTacticsRaw(reserves, national, miniGameId);
        if (!data) return null;

        const players = {};
        const players_by_id = {};

        for (const [key, rawPlayer] of Object.entries(data.players || {})) {
            if (!rawPlayer) continue;

            const player = { ...rawPlayer };
            const playerId = String(player.player_id || player.id || '').trim();

            if (clubId && !player.club_id) player.club_id = clubId;
            sanitizeSkills(player);

            const DBPlayer = dbReady && playerId ? TmPlayerDB.get(playerId) : null;
            TmPlayerService.normalizePlayer(player, DBPlayer, { skipSync: true });

            players[key] = player;
            if (playerId) players_by_id[playerId] = player;
        }

        return {
            ...data,
            players,
            players_by_id,
            formation: data.formation || {},
            formation_by_pos: data.formation_by_pos || {},
            formation_subs: data.formation_subs || {},
            formation_assoc: data.formation_assoc || {},
            positions: data.positions || [],
        };
    },
};