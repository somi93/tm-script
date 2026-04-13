import { _post, _dedup, _logError } from './engine.js';

export const TmTacticsService = {

    fetchTacticsRaw(reserves, national, miniGameId) {
        return _dedup(`tactics:get:${reserves}:${national}:${miniGameId}`, () =>
            _post('/ajax/tactics_get.ajax.php', { reserves, national, miniGameId })
        );
    },

    async fetchTactics(reserves, national, miniGameId, { clubId = '' } = {}) {
        return this.fetchTacticsRaw(reserves, national, miniGameId, { clubId });
    },
};