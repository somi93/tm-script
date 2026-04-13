import { TmUtils } from '../../lib/tm-utils.js';

const { sortAgeKeys } = TmUtils;

export const HISTORY_SYNC_STRATEGY = {
    NOOP: 'noop',
    SKILL_GRAPHS: 'skill-graphs',
    EXACT_CURRENT_TI: 'exact-current-ti',
    ANCHORED_ESTIMATE: 'anchored-estimate',
    INSUFFICIENT_EVIDENCE: 'insufficient-evidence',
};

export const getMissingAgeKeys = (player, DBPlayer) => {
    if (!DBPlayer?.records) return [];
    const keys = sortAgeKeys(Object.keys(DBPlayer.records));
    if (!keys.length) return [];

    const [fromYear, fromMonth] = keys[0].split('.').map(Number);
    const [toYear, toMonth] = String(player?.ageMonthsString || '').split('.').map(Number);
    if (!Number.isFinite(fromYear) || !Number.isFinite(fromMonth) || !Number.isFinite(toYear) || !Number.isFinite(toMonth)) return [];

    const totalFrom = fromYear * 12 + fromMonth;
    const totalTo = toYear * 12 + toMonth;

    return Array.from({ length: Math.max(0, totalTo - totalFrom + 1) }, (_, index) => {
        const total = totalFrom + index;
        return `${Math.floor(total / 12)}.${total % 12}`;
    }).filter((key) => !DBPlayer.records[key]);
};

export const buildHistoryEvidenceProfile = (player, DBPlayer) => {
    const missingAgeKeys = getMissingAgeKeys(player, DBPlayer);
    const dbKeys = sortAgeKeys(Object.keys(DBPlayer?.records || {}));
    const latestDbKey = dbKeys.at(-1) || null;

    return {
        playerId: player?.id ?? null,
        isOwnPlayer: Boolean(player?.isOwnPlayer),
        isGK: Boolean(player?.isGK),
        missingAgeKeys,
        hasMissingAgeKeys: missingAgeKeys.length > 0,
        hasDbHistory: dbKeys.length > 0,
        hasLeftAnchor: Boolean(latestDbKey && DBPlayer?.records?.[latestDbKey]),
        hasCurrentSnapshot: Array.isArray(player?.skills) && player.skills.length > 0,
        hasReliableCurrentTI: Boolean(player?.isOwnPlayer && Number.isFinite(Number(player?.ti))),
        hasTraining: player?.training != null,
        hasTIGraph: Boolean(player?.graphs?.hasTIGraph),
        hasSkillGraphs: Boolean(player?.graphs?.hasSkillGraphs),
        latestDbKey,
    };
};

export const selectHistorySyncStrategy = (profile) => {
    // if (!profile?.hasMissingAgeKeys) return HISTORY_SYNC_STRATEGY.NOOP;
    if (profile.hasSkillGraphs) return HISTORY_SYNC_STRATEGY.SKILL_GRAPHS;
    if (profile.hasReliableCurrentTI && profile.hasCurrentSnapshot) return HISTORY_SYNC_STRATEGY.EXACT_CURRENT_TI;
    if (profile.hasLeftAnchor && profile.hasCurrentSnapshot) return HISTORY_SYNC_STRATEGY.ANCHORED_ESTIMATE;
    return HISTORY_SYNC_STRATEGY.INSUFFICIENT_EVIDENCE;
};