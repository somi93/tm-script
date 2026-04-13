import { _dedup, _post } from './engine.js';

export const TmYouthService = {
    async fetchYouthPlayers(options = {}) {
        return _dedup('youth:players:nosync', async () => {
            const data = await _post('/ajax/youth.ajax.php', { type: 'get' });
            return data && Array.isArray(data.players) ? data : null;
        });
    },

    async fetchNewYouthPlayers({ age, position } = {}) {
        const data = await _post('/ajax/youth.ajax.php', { type: 'new', age, position });
        if (!data) return null;
        if (data.error) {
            return { error: String(data.error) };
        }

        return {
            players: Object.values(data)
                .filter(player => player && typeof player === 'object' && (player.id || player.player_id)),
        };
    },

    actOnYouthPlayer({ playerId, action }) {
        return _post('/ajax/youth.ajax.php', {
            type: 'act',
            player_id: playerId,
            action,
        });
    },
};