import { TmTrainingService } from '../services/training.js';

export const TmTrainingModel = {
    adaptSquadTraining(player) {
        return TmTrainingService.adaptSquadTraining(player);
    },

    normalizeTrainingState(raw) {
        return TmTrainingService.normalizeTrainingState(raw);
    },

    saveTraining(data) {
        return TmTrainingService.saveTraining(data);
    },

    saveTrainingType(playerId, teamId) {
        return TmTrainingService.saveTrainingType(playerId, teamId);
    },
};
