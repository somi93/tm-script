import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmPlayerModel } from '../../models/player.js';

const { GRAPH_KEYS_OUT, GRAPH_KEYS_GK } = TmConst;
const { skillValue } = TmUtils;

const keyToAbs = (key) => {
    const [a, m] = String(key).split('.').map(Number);
    return a * 12 + m;
};

const absToKey = (abs) => `${Math.floor(abs / 12)}.${abs % 12}`;

/**
 * Build sorted array of all age.month keys from first to current (no gaps).
 * Own players: range derived from graph TI length.
 * Foreign players: range from DB records, or just current month.
 */
const buildMonthKeys = (player, graphData, DBPlayer) => {
    const currentAbs = keyToAbs(player.ageMonthsString);
    let firstAbs;

    // graph.TI[0] = current TI (unused here), TI[1..n] = history → n months back
    const graphMonths = graphData?.TI?.length ? graphData.TI.length - 1 : 0;

    if (player.isOwnPlayer && graphMonths > 0) {
        firstAbs = currentAbs - graphMonths + 1;
    } else {
        const dbKeys = Object.keys(DBPlayer?.records || {});
        firstAbs = dbKeys.length
            ? Math.min(...dbKeys.map(keyToAbs))
            : currentAbs;
    }

    const keys = [];
    for (let abs = firstAbs; abs <= currentAbs; abs++) {
        keys.push(absToKey(abs));
    }
    return keys;
};

/**
 * Build records skeleton for all month keys.
 * Skills priority per month:
 *   current month → live player.skills (floored)
 *   other months  → graph integers → DB integers → null
 * weeklyChanges:
 *   current month → player.weeklyChanges
 *   other months  → DBPlayer.records[key].weeklyChanges
 */
const buildRecordSkeleton = (player, monthKeys, graphData, DBPlayer) => {
    const statKeys = player.isGK ? GRAPH_KEYS_GK : GRAPH_KEYS_OUT;
    const skillCount = statKeys.length;
    const currentAbs = keyToAbs(player.ageMonthsString);

    // Map age.month → graph array index (index 0 = oldest historical month)
    const graphMonths = graphData?.TI?.length ? graphData.TI.length - 1 : 0;
    const graphKeyMap = new Map();
    for (let i = 0; i < graphMonths; i++) {
        const abs = currentAbs - graphMonths + 1 + i;
        graphKeyMap.set(absToKey(abs), i);
    }

    const records = {};
    for (const key of monthKeys) {
        const isCurrentMonth = key === player.ageMonthsString;
        const graphIndex = graphKeyMap.get(key);
        const dbRecord = DBPlayer?.records?.[key];

        let skills = null;
        if (isCurrentMonth) {
            skills = Array.isArray(player.skills)
                ? player.skills.map(s => Math.floor(skillValue(s) || 0))
                : new Array(skillCount).fill(null);
        } else if (graphIndex != null && graphData) {
            const fromGraph = statKeys.map(sk => {
                const v = graphData[sk]?.[graphIndex];
                return v != null ? Number(v) : null;
            });
            if (fromGraph.some(v => v != null)) {
                skills = fromGraph;
            }
        }
        if (skills === null && dbRecord?.skills) {
            skills = dbRecord.skills.map(s => Math.floor(skillValue(s) || 0));
        }


        const weeklyChanges = isCurrentMonth
            ? (player.weeklyChanges || null)
            : (dbRecord?.weeklyChanges || null);

        const routine = isCurrentMonth
            ? (dbRecord?.routine ?? player.routine ?? null)
            : (dbRecord?.routine ?? null);
        records[key] = { TI: null, ASI: null, skills, weeklyChanges, routine };
    }
    return records;
};

/**
 * Step 4: For each player with needSync, fetch graphs + training (own players only),
 * build full monthKeys list and records skeleton.
 * Players with needSync: false are returned unchanged.
 *
 * @param {object[]} players - from attachSyncStatus (have needSync + DBPlayer)
 * @returns {Promise<object[]>}
 */
export const buildHistorySkeletons = async (players, onProgress) => {
    const total = players.filter(p => p.needSync && p.isOwnPlayer).length;
    let done = 0;

    const fetches = await Promise.all(
        players.map(async (player) => {
            if (!player.needSync || !player.isOwnPlayer) {
                return { graphData: null, training: null };
            }
            const [graphData, training] = await Promise.all([
                TmPlayerModel.fetchPlayerGraphs(player),
                TmPlayerModel.fetchPlayerTrainingForSync(player),
            ]);
            done++;
            onProgress?.(done, total);
            return { graphData, training };
        })
    );

    return players.map((player, i) => {
        if (!player.needSync) return player;

        const { graphData: rawGraphData, training } = fetches[i];
        const graphData = rawGraphData?.graphs ?? null;
        const monthKeys = buildMonthKeys(player, graphData, player.DBPlayer);
        const records = buildRecordSkeleton(player, monthKeys, graphData, player.DBPlayer);

        return { ...player, graphData, training, monthKeys, records };
    });
};
