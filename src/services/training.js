import { _post } from './engine.js';

export const TmTrainingService = {

    /**
     * Save a custom training plan.
     * The caller is responsible for building the full training_post payload.
     * @param {object} data — fully-formed training_post payload
     * @returns {Promise<void>}
     */
    async saveTraining(data) {
        await _post('/ajax/training_post.ajax.php', data);
    },

    /**
     * Save the training type / position group for a player.
     * @param {string|number} playerId
     * @param {string|number} teamId
     * @returns {Promise<void>}
     */
    async saveTrainingType(playerId, teamId) {
        await _post('/ajax/training_post.ajax.php', {
            type: 'player_pos',
            player_id: playerId,
            team_id: teamId
        });
    },

}