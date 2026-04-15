import { buildHistoryEvidenceProfile, HISTORY_SYNC_STRATEGY, selectHistorySyncStrategy } from './profile.js';
import { loadHistorySyncSources } from './sources.js';
import { enrichHistoryRecords, saveHistoryRecords, saveWeeklySkillChanges } from './shared.js';
import { syncFromAnchoredEstimate, syncFromExactCurrentTI, syncFromSkillGraphs } from './strategies.js';

const executeHistorySyncStrategy = ({ player, DBPlayer, profile, strategy }) => {
    switch (strategy) {
        case HISTORY_SYNC_STRATEGY.NOOP:
            return {};
        case HISTORY_SYNC_STRATEGY.SKILL_GRAPHS:
            return syncFromSkillGraphs({ player, DBPlayer, profile });
        case HISTORY_SYNC_STRATEGY.EXACT_CURRENT_TI:
            return syncFromExactCurrentTI({ player, DBPlayer, profile });
        case HISTORY_SYNC_STRATEGY.ANCHORED_ESTIMATE:
            return syncFromAnchoredEstimate({ player, DBPlayer, profile });
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

    if (Number(player.id) === 140907932) {
        const prev = DBPlayer?.records || {};
        const wc = player?.weeklyChanges;
        const SKILL_KEYS = player.isGK
            ? ['str','sta','pac','han','one','ref','aer','jum','com','kic','thr']
            : ['str','sta','pac','mar','tac','wor','pos','pas','cro','tec','hea','fin','lon','set'];
        const allKeys = [...new Set([...Object.keys(prev), ...Object.keys(historyRecords)])].sort();
        console.group('[WC:DEBUG] 140907932 resync diff | strategy:', strategy, '| weeklyChanges:', wc?.skillChanges ?? 'none');
        for (const key of allKeys) {
            const before = prev[key]?.skills;
            const after = historyRecords[key]?.skills;
            if (!after) continue;
            const changes = SKILL_KEYS.map((k, i) => {
                const b = before?.[i] != null ? Number(before[i]) : null;
                const a = Number(after[i]);
                const delta = b != null ? a - b : null;
                const wcTag = wc?.skillChanges?.[i] ?? null;
                return `${k}:${b != null ? b.toFixed(2) : '?'}→${a.toFixed(2)}${delta != null ? `(${delta >= 0 ? '+' : ''}${delta.toFixed(2)})` : ''}${wcTag ? `[${wcTag}]` : ''}`;
            });
            console.log(`  ${key}:`, changes.join('  '));
        }
        console.groupEnd();
    }
    await saveHistoryRecords(player, DBPlayer, historyRecords);
    return historyRecords;
};

export const TmPlayerHistorySyncWorkflow = {
    syncPlayerHistory,
    syncMissingRecords: syncPlayerHistory,
    saveWeeklySkillChanges,
    buildHistoryEvidenceProfile,
    selectHistorySyncStrategy,
    loadHistorySyncSources,
};