import { TmConst } from '../../lib/tm-constants.js';
import { TmLib } from '../../lib/tm-lib.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmPlayerService } from '../../services/player.js';

const { GRAPH_KEYS_OUT, GRAPH_KEYS_GK } = TmConst;
const { sortAgeKeys, skillValue } = TmUtils;

const normalizeGraphNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : null;

const deriveTIFromSkillIndex = (previousSkillIndex, currentSkillIndex, isGK) => {
    if (!Number.isFinite(Number(previousSkillIndex)) || !Number.isFinite(Number(currentSkillIndex))) return null;
    const previousSkillSum = TmLib.calcAsiSkillSum({ asi: Number(previousSkillIndex), isGK });
    const currentSkillSum = TmLib.calcAsiSkillSum({ asi: Number(currentSkillIndex), isGK });
    return Math.round((currentSkillSum - previousSkillSum) * 10);
};

const populateMissingTIFromSkillIndex = (player, ageKeys, recordsByAgeKey) => {
    for (let index = 1; index < ageKeys.length; index += 1) {
        const ageKey = ageKeys[index];
        const previousKey = ageKeys[index - 1];
        const derivedTI = deriveTIFromSkillIndex(
            recordsByAgeKey[previousKey]?.SI,
            recordsByAgeKey[ageKey]?.SI,
            player?.isGK,
        );

        if (derivedTI == null) continue;

        const currentTI = normalizeGraphNumber(recordsByAgeKey[ageKey]?.TI);
        if (currentTI != null && !(currentTI === 0 && derivedTI !== 0)) continue;

        recordsByAgeKey[ageKey].TI = derivedTI;
    }
};

const buildGraphAgeKeysFromSeries = (player, graphData) => {
    const graphLength = graphData?.skill_index?.length || 0;
    if (!graphLength) return [];

    return Array.from({ length: graphLength }, (_, index) => {
        const totalMonths = player.ageMonths - (graphLength - 1 - index);
        return `${Math.floor(totalMonths / 12)}.${totalMonths % 12}`;
    });
};

const buildPlayerGraphs = (player, DBPlayer, rawGraphs = null) => {
    const statKeys = player?.isGK ? GRAPH_KEYS_GK : GRAPH_KEYS_OUT;
    const dbKeys = sortAgeKeys(Object.keys(DBPlayer?.records || {}));
    const currentAgeKey = player?.ageMonthsString || null;
    const recordsByAgeKey = rawGraphs ? {} : {};

    if (!rawGraphs) {
        dbKeys.forEach((ageKey) => {
            const record = DBPlayer?.records?.[ageKey];
            recordsByAgeKey[ageKey] = {
                SI: normalizeGraphNumber(record?.SI),
                TI: normalizeGraphNumber(record?.TI),
                skills: Array.isArray(record?.skills) ? record.skills.map(skillValue) : new Array(statKeys.length).fill(null),
            };
        });
    }

    const remoteAgeKeys = buildGraphAgeKeysFromSeries(player, rawGraphs);
    remoteAgeKeys.forEach((ageKey, graphIndex) => {
        const existing = recordsByAgeKey[ageKey] || {
            SI: null,
            TI: null,
            skills: new Array(statKeys.length).fill(null),
        };

        const skillIndexValue = rawGraphs?.skill_index?.[graphIndex];
        if (skillIndexValue != null) existing.SI = Number(skillIndexValue);
        const tiValue = rawGraphs?.TI?.[graphIndex];
        if (tiValue != null) existing.TI = Number(tiValue);

        statKeys.forEach((statKey, statIndex) => {
            const statValue = rawGraphs?.[statKey]?.[graphIndex];
            if (statValue != null) existing.skills[statIndex] = Number(statValue);
        });

        recordsByAgeKey[ageKey] = existing;
    });
    if (currentAgeKey) {
        const existing = recordsByAgeKey[currentAgeKey] || {
            SI: null,
            TI: null,
            skills: new Array(statKeys.length).fill(null),
        };

        if (Number.isFinite(Number(player?.asi))) existing.SI = Number(player.asi);
        if (Number.isFinite(Number(player?.ti))) existing.TI = Number(player.ti);
        if (Array.isArray(player?.skills) && player.skills.length) existing.skills = player.skills.map(skillValue);

        recordsByAgeKey[currentAgeKey] = existing;
    }
    const ageKeys = sortAgeKeys(Object.keys(recordsByAgeKey));
    if (!ageKeys.length) return null;

    if (!rawGraphs) populateMissingTIFromSkillIndex(player, ageKeys, recordsByAgeKey);

    return {
        source: rawGraphs?.source || (rawGraphs ? 'remote' : 'indexeddb'),
        sparse: !rawGraphs || Boolean(rawGraphs?.sparse),
        hasTIGraph: Boolean(rawGraphs?.TI?.length),
        hasSkillGraphs: statKeys.some((statKey) => Array.isArray(rawGraphs?.[statKey]) && rawGraphs[statKey].length > 0),
        ageKeys,
        recordsByAgeKey,
    };
};

export const loadHistorySyncSources = async (player, DBPlayer) => {
    const [training, graphs] = await Promise.all([
        TmPlayerService.fetchPlayerTrainingForSync(player),
        player?.isOwnPlayer ? TmPlayerService.fetchPlayerGraphs(player) : Promise.resolve(null),
    ]);

    player.training = training;
    player.graphs = buildPlayerGraphs(player, DBPlayer, graphs);
    return player;
};