import { buildHistoryEvidenceProfile, HISTORY_SYNC_STRATEGY, selectHistorySyncStrategy } from './profile.js';
import { loadHistorySyncSources } from './sources.js';
import { saveHistoryRecords } from './shared.js';
import { syncFromAnchoredEstimate, syncFromExactCurrentTI, syncFromSkillGraphs } from './strategies.js';

const executeHistorySyncStrategy = ({ player, DBPlayer, profile, strategy, options = {} }) => {
    switch (strategy) {
        case HISTORY_SYNC_STRATEGY.NOOP:
            return {};
        case HISTORY_SYNC_STRATEGY.SKILL_GRAPHS:
            return syncFromSkillGraphs({ player, DBPlayer, profile });
        case HISTORY_SYNC_STRATEGY.EXACT_CURRENT_TI:
            return syncFromExactCurrentTI({ player, DBPlayer, profile, options });
        case HISTORY_SYNC_STRATEGY.ANCHORED_ESTIMATE:
            return syncFromAnchoredEstimate({ player, DBPlayer, profile, options });
        default:
            return {};
    }
};

const syncPlayerHistory = async (player, DBPlayer, options = {}) => {
    const baseProfile = buildHistoryEvidenceProfile(player, DBPlayer);
    
    // if (!baseProfile.hasMissingAgeKeys) return {};
    await loadHistorySyncSources(player, DBPlayer);

    const profile = buildHistoryEvidenceProfile(player, DBPlayer);
    const strategy = selectHistorySyncStrategy(profile);
    if (strategy === HISTORY_SYNC_STRATEGY.INSUFFICIENT_EVIDENCE) return {};

    const historyRecords = executeHistorySyncStrategy({ player, DBPlayer, profile, strategy, options });
    await saveHistoryRecords(player, DBPlayer, historyRecords);
    return historyRecords;
};

export const TmPlayerHistorySyncWorkflow = {
    syncPlayerHistory,
    syncMissingRecords: syncPlayerHistory,
    buildHistoryEvidenceProfile,
    selectHistorySyncStrategy,
    loadHistorySyncSources,
};