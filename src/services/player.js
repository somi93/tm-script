import { _post } from './engine.js';
import {
    normalizeTooltipPlayer,
    normalizeSquadPlayer,
    normalizePlayerStats,
    normalizePlayerGraphs,
    normalizePlayerTraining,
    normalizeSquadPlayerTraining,
} from '../utils/normalize/player.js';

export const TmPlayerService = {
    async fetchPlayerTooltip(playerId) {
        const data = await _post('/ajax/tooltip.ajax.php', { player_id: playerId });
        return data ? normalizeTooltipPlayer(data) : null;
    },

    async fetchPlayerInfo(pid, type, extra = {}) {
        return _post('/ajax/players_get_info.ajax.php', {
            player_id: pid,
            type,
            show_non_pro_graphs: true,
            ...extra,
        });
    },

    async fetchPlayerGraphs(player) {
        const data = await this.fetchPlayerInfo(player.id, 'graphs');
        if (!data) return null;
        return {
            graphs: normalizePlayerGraphs(data?.graphs, player),
            player,
            skillpoints: data?.skillpoints ?? null,
        };
    },

    async fetchPlayerHistory(playerId) {
        const data = await this.fetchPlayerInfo(playerId, 'history');
        return data ? normalizePlayerStats(data) : null;
    },

    async fetchPlayerTraining(playerId) {
        const data = await this.fetchPlayerInfo(playerId, 'training');
        return data ? normalizePlayerTraining(data) : null;
    },

    async fetchPlayerTrainingForSync(player) {
        if (player?.isOwnPlayer) {
            return this.fetchPlayerTraining(player.id);
        }

        const data = await _post('/ajax/players_get_select.ajax.php', {
            type: 'change',
            club_id: player?.club_id,
        });
        return normalizeSquadPlayerTraining(data?.post?.[player.id]);
    },

    normalizeSquadPlayer(postPlayer) {
        return normalizeSquadPlayer(postPlayer);
    },

    normalizePlayer(player) {
        return player;
    },
};