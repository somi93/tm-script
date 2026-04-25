import { TmYouthService } from '../services/youth.js';

export const TmYouthModel = {
    fetchNewYouthPlayers(opts) {
        return TmYouthService.fetchNewYouthPlayers(opts);
    },

    fetchYouthPlayers(opts) {
        return TmYouthService.fetchYouthPlayers(opts);
    },

    actOnYouthPlayer(opts) {
        return TmYouthService.actOnYouthPlayer(opts);
    },
};
