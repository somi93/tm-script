import { TmScoutsService } from '../services/scouts.js';

export const TmScoutsModel = {
    fetchPlayerScouting(playerId) {
        return TmScoutsService.fetchPlayerScouting(playerId);
    },

    sendScout(playerId, scoutId) {
        return TmScoutsService.sendScout(playerId, scoutId);
    },

    fetchReports(scouts = []) {
        return TmScoutsService.fetchReports(scouts);
    },
};
