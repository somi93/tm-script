import { TmConst } from '../lib/tm-constants.js';
import { _post } from './engine.js';

const TRAINING_SKILL_NAMES = {
    strength: 'Strength',
    stamina: 'Stamina',
    pace: 'Pace',
    marking: 'Marking',
    tackling: 'Tackling',
    workrate: 'Workrate',
    positioning: 'Positioning',
    passing: 'Passing',
    crossing: 'Crossing',
    technique: 'Technique',
    heading: 'Heading',
    finishing: 'Finishing',
    longshots: 'Longshots',
    set_pieces: 'Set Pieces',
};

export const TmTrainingService = {
    adaptSquadTraining(player) {
        if (player?.isGK) return { custom: { gk: true } };

        const customArr = Array.isArray(player?.training?.custom) ? player.training.custom : [];
        const isCustom = customArr.length === 6 && customArr.some(v => v > 0);
        const custom = {};
        for (let index = 0; index < 6; index++) {
            custom[`team${index + 1}`] = {
                points: isCustom ? (customArr[index] || 0) : 0,
                skills: [],
                label: TmConst.TRAINING_LABELS[index] || `Team ${index + 1}`,
            };
        }
        custom.points_spend = 0;
        return {
            custom: {
                gk: false,
                custom_on: isCustom ? 1 : 0,
                team: String(player?.training?.standard || '3'),
                custom,
            },
        };
    },

    normalizeTrainingState(data) {
        const custom = data?.custom;
        if (!custom || custom.gk) {
            return {
                isGK: true,
                customOn: false,
                currentType: '',
                maxPool: 0,
                totalAllocated: 0,
                remaining: 0,
                teams: [],
                modeLabel: 'Goalkeeper',
                typeLabel: 'Automatic',
                dots: '',
            };
        }

        const customData = custom.custom || {};
        const teams = Array.from({ length: 6 }, (_, index) => {
            const team = customData[`team${index + 1}`] || {};
            return {
                num: index + 1,
                label: team.label || TmConst.TRAINING_LABELS[index] || `Team ${index + 1}`,
                points: parseInt(team.points, 10) || 0,
                skills: Array.isArray(team.skills) ? team.skills : [],
                skillLabels: Array.isArray(team.skills) ? team.skills.map(skill => TRAINING_SKILL_NAMES[skill] || skill) : [],
            };
        });

        const totalAllocated = teams.reduce((sum, team) => sum + team.points, 0);
        const pointsSpend = parseInt(customData.points_spend, 10) || 0;
        const maxPool = Math.max(totalAllocated + pointsSpend, totalAllocated, 10);
        const currentType = String(custom.team || '3');
        const customOn = Boolean(custom.custom_on);

        return {
            isGK: false,
            customOn,
            currentType,
            maxPool,
            totalAllocated,
            remaining: Math.max(0, maxPool - totalAllocated),
            teams,
            modeLabel: customOn ? 'Custom' : 'Standard',
            typeLabel: TmConst.TRAINING_NAMES[currentType] || 'Unknown',
            dots: teams.map(team => team.points).join(''),
        };
    },

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
            team_id: teamId,
        });
    },
};