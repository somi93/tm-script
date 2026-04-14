import { TmConst } from '../../lib/tm-constants.js';
import { TmLib } from '../../lib/tm-lib.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmPlayerService } from '../../services/player.js';
import { normalizeTrainingWeights } from './shared.js';

const { GRAPH_KEYS_OUT, GRAPH_KEYS_GK } = TmConst;
const { sortAgeKeys, skillValue } = TmUtils;

const DEBUG_TI_PLAYER_ID = 145086218;

const logTIChange = (player, stage, payload) => {
    if (Number(player?.id) !== DEBUG_TI_PLAYER_ID) return;
    console.log(`[TI:${DEBUG_TI_PLAYER_ID}] ${stage}`, payload);
};

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
        if (currentTI != null) continue;

        logTIChange(player, 'populateMissingTIFromSkillIndex', {
            ageKey,
            previousKey,
            previousSI: recordsByAgeKey[previousKey]?.SI,
            currentSI: recordsByAgeKey[ageKey]?.SI,
            previousTI: currentTI,
            nextTI: derivedTI,
        });
        recordsByAgeKey[ageKey].TI = derivedTI;
    }
};

const buildGraphAgeKeysFromSeries = (player, graphData) => {
    const graphLength = graphData?.ti?.length ? graphData?.ti?.length - 1 : 0;
    if (!graphLength) return [];

    return Array.from({ length: graphLength }, (_, index) => {
        const totalMonths = player.ageMonths - (graphLength - 1 - index);
        return `${Math.floor(totalMonths / 12)}.${totalMonths % 12}`;
    });
};

// Group 1: Leading missing (no prior known record) — forward from zeros, capped at first anchor
const fillLeadingGap = (records, gapKeys, firstKnownKey, isGK, gw) => {
    const count = isGK ? 11 : 14;
    const maxIntegers = (records[firstKnownKey]?.skills ?? []).map(v => Math.floor(Number(v) || 0));
    const zeros = new Array(count).fill(0);
    for (const key of gapKeys) {
        const si = Number(records[key]?.SI);
        if (!Number.isFinite(si) || si <= 0) continue;
        records[key].skills = TmLib.calcSkillDecimals(zeros, si, isGK, gw, { maxIntegers }).map(Math.floor);
    }
};

// Group 2: Interior gap (prior AND next known record) — forward from start anchor, capped at end anchor
const fillInteriorGap = (records, gapKeys, startKey, endKey, isGK, gw) => {
    const count = isGK ? 11 : 14;
    const startInts = (records[startKey]?.skills ?? []).map(v => Math.floor(Number(v) || 0));
    const endInts = (records[endKey]?.skills ?? []).map(v => Math.floor(Number(v) || 0));
    for (const key of gapKeys) {
        const si = Number(records[key]?.SI);
        if (!Number.isFinite(si) || si <= 0) continue;
        records[key].skills = TmLib.calcSkillDecimals(startInts, si, isGK, gw, { maxIntegers: endInts }).map(Math.floor);
    }
};

// Group 3: Trailing missing (no next known record) — forward from last anchor, capped at live player
const fillTrailingGap = (records, gapKeys, startKey, liveInts, isGK, gw) => {
    const startInts = (records[startKey]?.skills ?? []).map(v => Math.floor(Number(v) || 0));
    for (const key of gapKeys) {
        const si = Number(records[key]?.SI);
        if (!Number.isFinite(si) || si <= 0) continue;
        records[key].skills = TmLib.calcSkillDecimals(startInts, si, isGK, gw, { maxIntegers: liveInts }).map(Math.floor);
    }
};

const estimateMissingRoutine = (player, ageKeys, records) => {
    const n = ageKeys.length;
    if (!n) return;
    const liveRoutine = Math.round((Number(player?.routine) || 0) * 10) / 10;

    // Anchors: idx → value. first record = 0, last record = liveRoutine, DB records with routine = their value
    const anchors = [{ idx: 0, value: 0 }];
    for (let i = 1; i < n; i++) {
        const rou = records[ageKeys[i]]?.routine;
        if (rou != null && Number.isFinite(Number(rou))) anchors.push({ idx: i, value: Number(rou) });
    }
    const lastIdx = n - 1;
    const existingLast = anchors.findIndex(a => a.idx === lastIdx);
    if (existingLast >= 0) anchors[existingLast].value = liveRoutine;
    else anchors.push({ idx: lastIdx, value: liveRoutine });

    for (let ai = 0; ai < anchors.length - 1; ai++) {
        const { idx: i1, value: v1 } = anchors[ai];
        const { idx: i2, value: v2 } = anchors[ai + 1];
        for (let i = i1; i <= i2; i++) {
            const t = i2 > i1 ? (i - i1) / (i2 - i1) : 1;
            records[ageKeys[i]].routine = Math.round((v1 + (v2 - v1) * t) * 10) / 10;
        }
    }
};

const estimateMissingSkills = (player, ageKeys, records) => {
    const { isGK } = player;
    const gw = normalizeTrainingWeights(player?.training ?? null, isGK);
    const hasSkills = key => records[key]?.skills?.some(v => v != null);
    const knownKeys = ageKeys.filter(hasSkills);
    if (!knownKeys.length) return;

    const firstKnownIdx = ageKeys.indexOf(knownKeys[0]);
    const lastKnownIdx = ageKeys.indexOf(knownKeys[knownKeys.length - 1]);

    // Group 1: Before first known record
    const leadingKeys = ageKeys.slice(0, firstKnownIdx).filter(k => !hasSkills(k));
    if (leadingKeys.length) fillLeadingGap(records, leadingKeys, knownKeys[0], isGK, gw);

    // Group 2: Between consecutive known records
    for (let i = 0; i < knownKeys.length - 1; i++) {
        const sKey = knownKeys[i], eKey = knownKeys[i + 1];
        const si = ageKeys.indexOf(sKey), ei = ageKeys.indexOf(eKey);
        const gapKeys = ageKeys.slice(si + 1, ei).filter(k => !hasSkills(k));
        if (gapKeys.length) fillInteriorGap(records, gapKeys, sKey, eKey, isGK, gw);
    }

    // Group 3: After last known record
    const liveInts = player.skills?.map(s => Math.floor(skillValue(s) || 0));
    const trailingKeys = ageKeys.slice(lastKnownIdx + 1).filter(k => !hasSkills(k));
    if (liveInts && trailingKeys.length) fillTrailingGap(records, trailingKeys, knownKeys[knownKeys.length - 1], liveInts, isGK, gw);
};

const buildPlayerGraphs = (player, DBPlayer, rawGraphs = null) => {
    const statKeys = player?.isGK ? GRAPH_KEYS_GK : GRAPH_KEYS_OUT;
    const dbKeys = sortAgeKeys(Object.keys(DBPlayer?.records || {}));
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
            missing: !DBPlayer?.records?.[ageKey],
        };
        const skillIndexValue = rawGraphs?.skill_index?.[graphIndex];
        if (skillIndexValue != null) existing.SI = Number(skillIndexValue);
        const tiValue = rawGraphs?.TI?.[graphIndex + 1];
        if (tiValue != null) {
            existing.TI = Number(tiValue);
        }

        statKeys.forEach((statKey, statIndex) => {
            const statValue = rawGraphs?.[statKey]?.[graphIndex];
            if (statValue != null) existing.skills[statIndex] = Number(statValue);
        });
        if (!rawGraphs.strength) {
            const record = DBPlayer?.records?.[ageKey];
            if (record) {
                existing.skills = record.skills.map(skillValue);
            }
        }
        recordsByAgeKey[ageKey] = existing;
    });
    const ageKeys = sortAgeKeys(Object.keys(recordsByAgeKey));
    if (!ageKeys.length) return null;

    if (!rawGraphs) {
        populateMissingTIFromSkillIndex(player, ageKeys, recordsByAgeKey);
    } else if (Array.isArray(player.skills) && player.skills.length) {
        // Anchor live player skills on the current-month record if empty
        const liveKey = player.ageMonthsString;
        if (liveKey && recordsByAgeKey[liveKey] && !recordsByAgeKey[liveKey].skills?.some(v => v != null)) {
            recordsByAgeKey[liveKey].skills = player.skills.map(skillValue);
        }
        estimateMissingSkills(player, ageKeys, recordsByAgeKey);
    }

    estimateMissingRoutine(player, ageKeys, recordsByAgeKey);

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