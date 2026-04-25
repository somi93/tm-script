import { _dedup, _post } from './engine.js';
import { normalizeYouthPlayer } from '../utils/normalize/youth.js';

export const TmYouthService = {
    async fetchYouthPlayers(options = {}) {
        return _dedup('youth:players:nosync', async () => {
            const data = await _post('/ajax/youth.ajax.php', { type: 'get' });
            if (!data || !Array.isArray(data.players)) return null;
            return {
                cash: data.cash,
                squad_size: data.squad_size,
                players: data.players.map(normalizeYouthPlayer).reverse(),
            };
        });
    },

    async fetchNewYouthPlayers({ age, position } = {}) {
        const data = await _post('/ajax/youth.ajax.php', { type: 'new', age, position });
        if (!data) return null;
        if (data.error) return { error: String(data.error) };

        const rawPlayers = Object.values(data)
            .filter(p => p && typeof p === 'object' && (p.id || p.player_id));
        return { players: rawPlayers.map(normalizeYouthPlayer) };
    },

    actOnYouthPlayer({ playerId, action }) {
        return _post('/ajax/youth.ajax.php', {
            type: 'act',
            player_id: playerId,
            action,
        });
    },
};