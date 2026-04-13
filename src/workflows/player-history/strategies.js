import {
    enrichHistoryRecords,
    reconstructSkillHistoryFromEstimate,
    reconstructSkillHistoryFromGraph,
} from './shared.js';

export const syncFromSkillGraphs = ({ player, DBPlayer, profile }) => {
    const { graphs } = player;
    const records = {};

    for (const key of profile.missingAgeKeys) {
        const skillIndex = Number(graphs?.recordsByAgeKey?.[key]?.SI);
        if (!Number.isFinite(skillIndex)) continue;
        records[key] = { SI: skillIndex };
    }

    return enrichHistoryRecords(player, reconstructSkillHistoryFromGraph(player, DBPlayer, graphs, records));
};

export const syncFromExactCurrentTI = ({ player, DBPlayer, profile, options = {} }) => {
    
    return enrichHistoryRecords(player, reconstructSkillHistoryFromEstimate(player, DBPlayer, profile.missingAgeKeys, {
        graphRecordsByAgeKey: player?.graphs?.recordsByAgeKey || null,
        liveTI: player?.ti,
        exactLastTI: player?.ti,
        forceFullSync: Boolean(options.forceFullSync),
    }));
};

export const syncFromAnchoredEstimate = ({ player, DBPlayer, profile, options = {} }) => {
    return enrichHistoryRecords(player, reconstructSkillHistoryFromEstimate(player, DBPlayer, profile.missingAgeKeys, {
        graphRecordsByAgeKey: player?.graphs?.recordsByAgeKey || null,
        liveTI: Number.isFinite(Number(player?.ti)) ? player.ti : null,
        forceFullSync: Boolean(options.forceFullSync),
    }));
};