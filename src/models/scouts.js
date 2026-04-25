import { TmScoutsService } from '../services/scouts.js';

export const TmScoutsModel = {
    fetchPlayerScouting(playerId) {
        return TmScoutsService.fetchPlayerScouting(playerId);
    },

    fetchReports() {
        return TmScoutsService.fetchReports();
    },
};
