import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmPlayerService } from '../services/player.js';
import { applyPlayerPositionRatings } from '../utils/normalize/player.js';

const tooltipCache = new Map();

/**
 * Re-apply decimal skills + recalculate ratings from the latest DB record.
 * Call this after runSyncPipeline to ensure player.skills reflects new decimals.
 */
export const refreshPlayerSkills = (player) => {
	const latestRecord = player.records?.[player.ageMonthsString];
	if (!Array.isArray(latestRecord?.skills) || !player.skills?.length) return;
	player.skills = player.skills.map((skill, index) => ({
		...skill,
		value: latestRecord.skills[index] != null ? Number(latestRecord.skills[index]) : skill.value,
	}));
	applyPlayerPositionRatings(player);
};

export const TmPlayerModel = {
	async fetchPlayerTooltip(playerId) {
		const [player, dbPlayer] = await Promise.all([
			TmPlayerService.fetchPlayerTooltip(playerId),
			TmPlayerDB.get(playerId),
		]);
		if (!player) return null;

		player.records = dbPlayer?.records || {};

		const latestRecord = dbPlayer?.records?.[player.ageMonthsString];
		if (Array.isArray(latestRecord?.skills) && player.skills?.length) {
			player.skills = player.skills.map((skill, index) => ({
				...skill,
				value: latestRecord.skills[index] != null ? Number(latestRecord.skills[index]) : skill.value,
			}));
			applyPlayerPositionRatings(player);
		}

		return player;
	},

	fetchTooltipCached(playerId) {
		if (!tooltipCache.has(playerId)) {
			tooltipCache.set(playerId, this.fetchPlayerTooltip(playerId).finally(() => {
				tooltipCache.delete(playerId);
			}));
		}
		return tooltipCache.get(playerId);
	},

	fetchPlayerInfo(...args) {
		return TmPlayerService.fetchPlayerInfo(...args);
	},

	fetchPlayerGraphs(...args) {
		return TmPlayerService.fetchPlayerGraphs(...args);
	},

	fetchPlayerHistory(...args) {
		return TmPlayerService.fetchPlayerHistory(...args);
	},

	fetchPlayerTraining(...args) {
		return TmPlayerService.fetchPlayerTraining(...args);
	},

	normalizeSquadPlayer(...args) {
		return TmPlayerService.normalizeSquadPlayer(...args);
	},
};
