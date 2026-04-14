import { TmLib } from '../lib/tm-lib.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmPlayerService } from '../services/player.js';
import { applyPlayerPositionRatings } from '../utils/normalize/player.js';
import { TmPlayerHistorySyncWorkflow } from '../workflows/player-history-sync.js';

const tooltipCache = new Map();

export const TmPlayerModel = {
	async fetchPlayerTooltip(playerId) {
		const [player, initialDBPlayer] = await Promise.all([
			TmPlayerService.fetchPlayerTooltip(playerId),
			TmPlayerDB.get(playerId),
		]);
		if (!player) return null;

		const records = await TmPlayerHistorySyncWorkflow.syncMissingRecords(player, initialDBPlayer);
		let DBPlayer = initialDBPlayer;
		if (Object.keys(records || {}).length) {
			DBPlayer = await TmPlayerDB.get(playerId);
		}

		player.records = DBPlayer?.records || {};

		const latestRecord = DBPlayer?.records?.[player.ageMonthsString];
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
