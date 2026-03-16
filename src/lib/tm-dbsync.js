import { TmConst } from './tm-constants.js';
import { TmLib } from './tm-lib.js';
import { TmPlayerDB } from './tm-playerdb.js';
import { TmPlayerService } from '../services/player.js';
import { TmUtils } from './tm-utils.js';

/**
 * tm-dbsync.js — Player DB sync orchestration for TrophyManager userscripts
 *
 * Depends on: TmConst, TmLib, TmPlayerDB, TmApi
 * Load order: tm-constants.js → tm-utils.js → tm-lib.js → tm-playerdb.js → tm-dbsync.js → tm-services.js
 *
 * Exposed as: TmSync
 */


const { GRAPH_KEYS_OUT, GRAPH_KEYS_GK, ASI_WEIGHT_GK, ASI_WEIGHT_OUTFIELD } = TmConst;
const { ageToMonths } = TmUtils;
const { calcSkillDecimalsSimple, fillMissingMonths, computeGrowthDecimals, getCurrentSession, calculatePlayerR5, calculatePlayerREC } = TmLib;

/* ─── Private helpers (only used by analyzeGrowth) ─── */

/**
 * Compute training group weight array from training API response.
 * @param {boolean} isGK
 * @param {object|null} trainingInfo — Raw training API response
 * @returns {number[]} gw — group weights (length 1 for GK, 6 for outfield)
 */
const buildGroupWeights = (player, trainingInfo) => {
    const count = player.isGK ? 1 : 6;
    const gw = new Array(count).fill(1 / count);
    if (player.isGK || !trainingInfo?.custom) return gw;
    const c = trainingInfo.custom;
    const cd = c.custom;
    if (c.custom_on && cd) {
        let dtot = 0;
        const dots = [];
        for (let i = 0; i < 6; i++) {
            const d = parseInt(cd['team' + (i + 1)]?.points) || 0;
            dots.push(d); dtot += d;
        }
        const sm = TmConst.SMOOTH_WEIGHT, den = dtot + 6 * sm;
        return dots.map(d => (d + sm) / den);
    } else {
        const STD_FOCUS = TmConst.STD_FOCUS;
        const fg = STD_FOCUS[String(c.team || '3')] ?? 1;
        const gw2 = new Array(6).fill(0.125);
        gw2[fg] = 0.375;
        return gw2;
    }
};

/* Wraps TmLib.buildRoutineMap; accepts raw player object + history API response */
const buildRoutineMap = (ageKeys, tooltipPlayer, historyInfo) => {
    const curRoutine = tooltipPlayer?.routine;
    if (curRoutine == null || !historyInfo?.table?.total) return {};
    const totalRows = historyInfo.table.total
        .map(r => ({ ...r, season: parseInt(r.season) }))
        .filter(r => isFinite(r.season));
    if (!totalRows.length) return {};
    const gpBySeason = {};
    totalRows.forEach(r => { gpBySeason[r.season] = (gpBySeason[r.season] || 0) + (parseInt(r.games) || 0); });
    const curSeason = Math.max(...totalRows.map(r => r.season));
    return TmLib.buildRoutineMap(
        curRoutine,
        parseInt(tooltipPlayer?.age) || 0, parseInt(tooltipPlayer?.months) || 0,
        { gpBySeason, curSeason }, ageKeys
    );
};

/* -----------------------------------------------------------
   SYNC PLAYER STORE
   Decision matrix on every player page visit:
     hasCurWeek + (graphSync or opponent) → dispatches tm:growthUpdated (decimals already in DB)
     opponent with no cur week            → savePlayerVisit (no graphs access)
     graphSync + cur week missing         → savePlayerVisit (add this week)
     own player, no graphSync             → fetch graphs + fill full history
   @param {object}   player        Tooltip player object
   @param {object}   DBPlayer      Player object from the database
   ----------------------------------------------------------- */
function syncPlayerStore(player, DBPlayer) {
    const api = TmPlayerService;
    const isOwnPlayer = player.isOwnPlayer;
    if (!isOwnPlayer) {
        return savePlayerVisit(player, DBPlayer);
    }

    /* Skip full graph sync if current week already fully computed */
    const ageKey = player.ageMonthsString;
    const curRec = DBPlayer?.records?.[ageKey];
    const allComputed = DBPlayer?.records &&
        Object.values(DBPlayer.records).every(r => r.R5 != null && r.REREC != null);
    if (curRec?.R5 != null && curRec?.REREC != null && allComputed) {
        console.log(`[syncPlayerStore] ${ageKey} already fully computed — dispatching growthUpdated`);
        window.dispatchEvent(new CustomEvent('tm:growthUpdated', { detail: { pid: player.id } }));
        return Promise.resolve(DBPlayer);
    }

    /* If only the current week is missing but all past records are computed,
       savePlayerVisit is enough — no need to rebuild everything from graphs */
    const hasOtherRecords = DBPlayer?.records && Object.keys(DBPlayer.records).length > 0;
    const pastRecordsOk = hasOtherRecords &&
        Object.entries(DBPlayer.records)
            .filter(([k]) => k !== ageKey)
            .every(([, r]) => r.R5 != null && r.REREC != null);
    if (!curRec && pastRecordsOk) {
        console.log(`[syncPlayerStore] ${ageKey} missing, past records OK — savePlayerVisit`);
        return savePlayerVisit(player, DBPlayer);
    }

    console.log('[syncPlayerStore] → fetching graphs+training+history');
    const graphKeys = player.isGK ? GRAPH_KEYS_GK : GRAPH_KEYS_OUT;

    /* If player already has training data from squad API, reconstruct trainingInfo
       from player.training (type id) + player.trainingCustom (JSON string) */
    const trainingInfoFromPlayer = (() => {
        if (player.isGK) return null;
        const raw = player.training_custom;
        const customParsed = raw ? (typeof raw === 'object' ? raw : (() => { try { return JSON.parse(raw); } catch (e) { return null; } })()) : null;
        if (!customParsed && !player.training) return null;
        return { custom: { team: String(player.training || '3'), custom_on: customParsed ? 1 : 0, custom: customParsed || {} } };
    })();

    const trainReq = trainingInfoFromPlayer
        ? Promise.resolve(trainingInfoFromPlayer)
        : api.fetchPlayerInfo(player.id, 'training');
    const histReq = api.fetchPlayerInfo(player.id, 'history');
    return Promise.all([api.fetchPlayerInfo(player.id, 'graphs'), trainReq, histReq]).then(([data, t, h]) => {
        if (!data) {
            console.warn('[syncPlayerStore] Graphs request failed — falling back to savePlayerVisit');
            return savePlayerVisit(player, DBPlayer);
        }
        const newDBPlayer = buildStoreFromGraphs(player, data.graphs, DBPlayer, graphKeys);
        if (!newDBPlayer) {
            console.warn('[syncPlayerStore] buildStoreFromGraphs returned null — falling back to savePlayerVisit');
            return savePlayerVisit(player, DBPlayer);
        }
        console.log(`[syncPlayerStore] buildStoreFromGraphs OK — ${Object.keys(newDBPlayer.records).length} weeks, calling analyzeGrowth`);
        return analyzeGrowth(player, DBPlayer, t, h, newDBPlayer);
    });
}

/* -----------------------------------------------------------
   BUILD STORE FROM GRAPHS ENDPOINT DATA
   Parses the graphs API response into a PlayerDB store object.
   Reconstructs ASI history from skill_index (preferred) or by
   back-calculating from TI values (same formula as ASI calculator).
   Returns the populated store on success, null on bad/missing data.
   ----------------------------------------------------------- */
function buildStoreFromGraphs(player, graphsRaw, DBPlayer, graphKeys) {
    try {
        const g = graphsRaw;
        if (!g?.[graphKeys[0]] || g[graphKeys[0]].length < 2) {
            console.warn('[buildStoreFromGraphs] missing or too-short graph data for key', graphKeys[0], '→ null');
            return null;
        }
        const weekCount = g[graphKeys[0]].length;
        const SI = player.asi;
        const K = player.isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;

        const asiArr = (() => {
            /* skill_index preferred; may have extra pre-pro entry — take last weekCount */
            if (g.skill_index?.length >= weekCount)
                return g.skill_index.slice(-weekCount).map(v => parseInt(v) || 0);
            if (g.ti?.length >= weekCount) {
                const tiOff = g.ti.length - weekCount; /* usually 1: TI has extra pre-pro entry */
                const arr = new Array(weekCount);
                arr[weekCount - 1] = SI; /* current ASI from tooltip */
                for (let j = weekCount - 2; j >= 0; j--) {
                    const ti = parseInt(g.ti[j + 1 + tiOff]) || 0;
                    const base = Math.pow(arr[j + 1] * K, 1 / 7);
                    arr[j] = Math.max(0, Math.round(Math.pow(base - ti / 10, 7) / K));
                }
                return arr;
            }
            return new Array(weekCount).fill(0);
        })();

        const oldRecords = DBPlayer.records;
        DBPlayer.graphSync = true;
        DBPlayer.lastSeen = Date.now();
        DBPlayer.records = Object.fromEntries(
            Array.from({ length: weekCount }, (_, i) => {
                const ageMonths = player.ageMonths - (weekCount - 1 - i);
                const key = `${Math.floor(ageMonths / 12)}.${ageMonths % 12}`;
                const existing = oldRecords[key];
                const existingValid = existing?.locked && Array.isArray(existing.skills) && existing.skills.every(v => v != null && isFinite(v));
                if (existingValid) return [key, existing];
                return [key, {
                    SI: parseInt(asiArr[i]) || 0,
                    REREC: null,
                    R5: null,
                    skills: graphKeys.map(k => parseInt(g[k]?.[i]) || 0),
                    routine: null
                }];
            })
        );
        return DBPlayer;
    } catch (e) {
        console.warn('[buildStoreFromGraphs] exception:', e.message);
        return null;
    }
}

/* -----------------------------------------------------------
   SAVE PLAYER VISIT TO GROWTH RECORD
   Writes DBPlayer.records["year.month"] = { SI, skills } on every visit.
   Skips locked records (written by squad sync). Calls analyzeGrowth
   afterwards to compute REREC/R5/decimals (fetches training+history
   internally if not provided).
   ----------------------------------------------------------- */
function savePlayerVisit(player, DBPlayer) {
    const year = player.age;
    const month = player.months;
    console.log(`[savePlayerVisit] Player visit: ${year}.${month} (SI: ${player.asi})`, player.ageMonthsString);
    const SI = player.asi;
    if (!SI || SI <= 0 || !year) {
        console.warn('[savePlayerVisit] early return — missing SI or age', { SI, year });
        return Promise.resolve(null);
    }
    const ageKey = `${year}.${month}`;
    try {
        if (!DBPlayer) DBPlayer = { records: {} };
        if (!DBPlayer.records) DBPlayer.records = {};
        const skillsC = calcSkillDecimalsSimple(player);
        if (DBPlayer.records[ageKey]?.locked) {
            console.log(`[TmPlayer] Record ${ageKey} is locked (squad sync) — skipping overwrite`);
            return Promise.resolve(DBPlayer);
        }
        const existingRec = DBPlayer.records[ageKey];
        console.log(`[savePlayerVisit] existing record for ${ageKey}:`, DBPlayer, existingRec);
        if (existingRec?.R5 != null && existingRec?.REREC != null &&
            Object.values(DBPlayer.records).every(r => r.R5 != null && r.REREC != null)) {
            DBPlayer.lastSeen = Date.now();
            TmPlayerDB.set(player.id, DBPlayer);
            return Promise.resolve(DBPlayer);
        }
        DBPlayer.records[ageKey] = { SI, REREC: null, R5: null, skills: skillsC, routine: null };
        DBPlayer.lastSeen = Date.now();
        TmPlayerDB.set(player.id, DBPlayer);
        console.log(`[savePlayerVisit] saved record ${ageKey}, calling analyzeGrowth`);
        return analyzeGrowth(player, DBPlayer);
    } catch (e) {
        console.warn('[TmPlayer] savePlayerVisit failed:', e.message);
        return Promise.resolve(null);
    }
}

/* -----------------------------------------------------------
   GROWTH ANALYSIS — Week-by-week decimal estimation using
   training weights + TI efficiency curves.
   ----------------------------------------------------------- */
function analyzeGrowth(player, DBPlayer, trainingInfo, historyInfo, overrideRecord) {
    console.log(player.skills);
    if (overrideRecord) {
        DBPlayer = overrideRecord;
    }
    if (!DBPlayer?.records) { console.warn('[analyzeGrowth] no records, abort'); return Promise.resolve(null); }

    /* Single-record case: can't propagate decimals, but still compute R5/REREC with calcSkillDecimalsSimple */
    if (Object.keys(DBPlayer.records).length < 2) {
        const positions = player.positions?.length ? player.positions : [{ id: 0 }];
        const key = Object.keys(DBPlayer.records)[0];
        const record = DBPlayer.records[key];
        const skillsC = calcSkillDecimalsSimple(player);
        const fakePlayer = { skills: skillsC, asi: parseInt(record.SI) || 0, routine: player.routine || 0 };
        record.REREC = Math.max(...positions.map(p => Number(calculatePlayerREC(p, fakePlayer))));
        record.R5 = Math.max(...positions.map(p => Number(calculatePlayerR5(p, fakePlayer))));
        record.skills = skillsC;
        record.routine = player.routine ?? null;
        TmPlayerDB.set(player.id, DBPlayer);
        console.log('[TmPlayer] Single-record growth analysis completed for player', player.id, { record });
        window.dispatchEvent(new CustomEvent('tm:growthUpdated', { detail: { pid: player.id } }));
        return Promise.resolve(DBPlayer);
    }

    fillMissingMonths(DBPlayer.records);
    const ageKeys = Object.keys(DBPlayer.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));

    const run = (trainingInfo, historyInfo) => {
        const gw = buildGroupWeights(player, trainingInfo);
        const decsByKey = computeGrowthDecimals(DBPlayer.records, ageKeys, player, gw);
        const routineMap = buildRoutineMap(ageKeys, player, historyInfo);
        const positions = player.positions?.length ? player.positions : [{ id: 0 }];
        for (let m = 0; m < ageKeys.length; m++) {
            const key = ageKeys[m];
            const rec = DBPlayer.records[key];
            const ci = rec.skills.map(v => { const n = (typeof v === 'object' && v !== null) ? parseFloat(v.value) : parseFloat(v); return isFinite(n) ? Math.floor(n) : 0; });
            const dec = decsByKey[key];
            const allMax = ci.every(v => v >= 20);
            const skillsC = allMax
                ? (() => {
                    const K = player.isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
                    const totalPts = Math.pow(2, Math.log(K * (parseInt(rec.SI) || 0)) / Math.log(128));
                    const rem = totalPts - ci.reduce((a, b) => a + b, 0);
                    return ci.map(v => v + rem / ci.length);
                })()
                : ci.map((v, i) => v >= 20 ? 20 : v + (isFinite(dec[i]) ? dec[i] : 0));
            const fakePlayer = { skills: skillsC, asi: parseInt(rec.SI) || 0, routine: routineMap[key] ?? rec.routine ?? 0 };
            rec.REREC = Math.max(...positions.map(p => Number(calculatePlayerREC(p, fakePlayer))));
            rec.R5 = Math.max(...positions.map(p => Number(calculatePlayerR5(p, fakePlayer))));
            rec.skills = skillsC;
            rec.routine = routineMap[key] ?? rec.routine ?? null;
        }
        console.log('[TmPlayer] Growth analysis completed for player', player.id, { ageKeys, records: DBPlayer.records });
        TmPlayerDB.set(player.id, DBPlayer);
        window.dispatchEvent(new CustomEvent('tm:growthUpdated', { detail: { pid: player.id } }));
        return DBPlayer;
    };

    if (trainingInfo !== undefined && historyInfo !== undefined) {
        return Promise.resolve(run(trainingInfo, historyInfo));
    } else {
        return Promise.all([
            TmPlayerService.fetchPlayerInfo(player.id, 'training'),
            TmPlayerService.fetchPlayerInfo(player.id, 'history'),
        ]).then(([t, h]) => run(t, h));
    }
}

export const TmSync = {
    syncPlayerStore,
    savePlayerVisit,
    analyzeGrowth,
    buildStoreFromGraphs,
};


