import { TmConst } from '../../lib/tm-constants.js';
import { TmLib } from '../../lib/tm-lib.js';
import { TmPlayerDB } from '../../lib/tm-playerdb.js';
import { TmUtils } from '../../lib/tm-utils.js';

/* =============================================================
   TmImportSync — Import pipeline for old-format player JSON
   Shared component for tm-import.user.js

   Exports: TmImportSync = { parseImportFile, parseAge, syncPlayer }
   ============================================================= */

    const { ageToMonths } = TmUtils;
    const { getPositionIndex, calcR5, calcRec, fillMissingMonths, computeGrowthDecimals, buildRoutineMap } = TmLib;

    const calculateR5F = calcR5;
    const calculateRemaindersF = (posIdx, skills, asi) => ({ rec: calcRec(posIdx, skills, asi) });

    /* ─── Detect whether JSON is v3 native export ────────────────
       Returns true if the first non-meta entry has _v === 3 OR
       has a `records` object whose values have SI/R5/REREC keys.   */
    const isV3Format = (json) => {
        for (const [pid, data] of Object.entries(json)) {
            if (!pid || !/^\d+$/.test(pid)) continue;
            if (!data || typeof data !== 'object') continue;
            if (data._v === 3) return true;
            if (data.records && typeof data.records === 'object') {
                const firstRec = Object.values(data.records)[0];
                if (firstRec && ('R5' in firstRec || 'REREC' in firstRec)) return true;
            }
            break;
        }
        return false;
    };

    /* ─── Parse v3 native export ─────────────────────────────────
       { pid: { _v, meta, records, lastSeen, graphSync } }
       Returns: [{ pid, store, ageKeys, isGK }]                     */
    const parseV3File = (json) => {
        const players = [];
        for (const [pid, data] of Object.entries(json)) {
            if (!pid || !/^\d+$/.test(pid)) continue;
            if (!data?.records || typeof data.records !== 'object') continue;
            const ageKeys = Object.keys(data.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));
            if (ageKeys.length === 0) continue;
            const firstRec = data.records[ageKeys[0]];
            const skillLen = Array.isArray(firstRec?.skills) ? firstRec.skills.length : 0;
            const isGK = data.meta?.isGK ?? (skillLen === 11);
            players.push({ pid, store: data, ageKeys, isGK, name: data.meta?.name || '' });
        }
        return players;
    };

    /* ─── Parse import file — auto-detects format ───────────────
       Returns: { format: 'v3'|'legacy', players }               */
    const parseImportFile = (json) => {
        if (isV3Format(json)) {
            return { format: 'v3', players: parseV3File(json) };
        }
        return { format: 'legacy', players: parseLegacyFile(json) };
    };

    /* ─── Parse legacy import file (old R6 format) ──────────────
       { "pid": { SI: { "17.3": 7200 }, skills: { "17.3": [10,9,...] } } }
       Returns: [{ pid, records, ageKeys, isGK }]                    */
    const parseLegacyFile = (json) => {
        const players = [];
        for (const [pid, data] of Object.entries(json)) {
            if (!pid || !/^\d+$/.test(pid)) continue;
            if (!data || !data.SI || !data.skills) continue;

            const allKeys = new Set([
                ...Object.keys(data.SI || {}),
                ...Object.keys(data.skills || {})
            ]);
            const ageKeys = [...allKeys].sort((a, b) => ageToMonths(a) - ageToMonths(b));

            const records = {};
            for (const key of ageKeys) {
                const si = parseInt(data.SI[key]) || 0;
                const rawSkills = data.skills[key] || [];
                const skills = rawSkills.map(v => {
                    const n = typeof v === 'string' ? parseFloat(v) : v;
                    return Math.floor(n);
                });
                if (si > 0 && skills.length > 0) {
                    records[key] = { SI: si, skills };
                }
            }

            const recKeys = Object.keys(records).sort((a, b) => ageToMonths(a) - ageToMonths(b));

            if (recKeys.length > 0) {
                const isGK = records[recKeys[0]].skills.length === 11;
                players.push({ pid, records, ageKeys: recKeys, isGK });
            }
        }
        return players;
    };

    /* ─── Restore v3 players directly to DB (no sync pipeline) ──
       Merges into existing DB records (existing keys NOT overwritten
       unless the incoming record has R5+REREC computed).            */
    const restoreV3 = async (players, logFn) => {
        const PlayerDB = TmPlayerDB;
        let ok = 0, fail = 0;
        for (const p of players) {
            try {
                const incoming = p.store;
                const existing = PlayerDB.get(p.pid);
                if (existing?.records) {
                    // Merge: incoming wins if it has R5 computed, else keep existing
                    for (const [key, rec] of Object.entries(existing.records)) {
                        if (!incoming.records[key]) {
                            incoming.records[key] = rec;
                        }
                    }
                }
                incoming._v = 3;
                if (!incoming.lastSeen) incoming.lastSeen = Date.now();
                await PlayerDB.set(p.pid, incoming);
                ok++;
                logFn?.(`  ✓ ${p.pid} — ${p.name} — ${p.ageKeys.length} records`, 'ok');
            } catch (e) {
                fail++;
                logFn?.(`  ✗ ${p.pid} failed: ${e.message}`, 'warn');
            }
        }
        return { ok, fail };
    };

    /* ─── Parse age from tooltip ─────────────────────────────────
       Returns: { years, months } or null                           */
    const parseAge = (tip) => {
        if (!tip) return null;
        const m = (tip.age || '').match(/(\d+)\s*(?:years?|y|г|let|Jahr|año|an)?\s*(\d+)/i);
        if (m) return { years: parseInt(m[1]), months: parseInt(m[2]) };
        const ageVal = parseFloat(tip.age);
        if (ageVal > 0) return { years: Math.floor(ageVal), months: Math.round((ageVal % 1) * 12) };
        return null;
    };

    /* ─── Sync a single player — full v3 pipeline ───────────────
       p          : { pid, records, ageKeys, isGK }
       tip        : tooltip API response (player object)
       histData   : history API response
       squadPlayer: squad API player object or null (own players only)
       logFn      : (msg, cls?) → void — caller-provided log function
       Returns: v3Store saved to PlayerDB                           */
    const syncPlayer = async (p, tip, histData, squadPlayer, logFn) => {
        const { pid, records, isGK } = p;
        const PlayerDB = TmPlayerDB;

        /* ── Position ── */
        const favpos = tip.favposition || '';
        const firstPos = favpos.split(',')[0].trim();
        const posIdx = isGK ? 9 : getPositionIndex(firstPos);

        /* ── Current age / routine from tooltip ── */
        const curRoutine = parseFloat(tip.routine) || 0;
        const age = parseAge(tip);
        let curAgeTotalMonths = 0;
        if (age) {
            curAgeTotalMonths = age.years * 12 + age.months;
        } else {
            const lastKey = p.ageKeys[p.ageKeys.length - 1];
            const [ly, lm] = lastKey.split('.').map(Number);
            curAgeTotalMonths = ly * 12 + lm + 1;
            logFn(`  ⚠ Could not parse age from tooltip, using fallback ${Math.floor(curAgeTotalMonths / 12)}.${curAgeTotalMonths % 12}`);
        }

        /* ── Build working store with file records ── */
        const store = { records: {} };
        for (const [key, rec] of Object.entries(records)) {
            store.records[key] = { SI: rec.SI, skills: [...rec.skills] };
        }

        /* ── Fill gaps: interpolate missing months ── */
        fillMissingMonths(store.records);

        const ageKeys = Object.keys(store.records).sort((a, b) => ageToMonths(a) - ageToMonths(b));

        /* ── Routine computation from history ── */
        let gpData = null;
        if (histData?.table?.total) {
            const totalRows = histData.table.total
                .map(r => ({ ...r, season: parseInt(r.season) }))
                .filter(r => isFinite(r.season));
            if (totalRows.length > 0) {
                const gpBySeason = {};
                totalRows.forEach(r => { gpBySeason[r.season] = (gpBySeason[r.season] || 0) + (parseInt(r.games) || 0); });
                gpData = { gpBySeason, curSeason: Math.max(...totalRows.map(r => r.season)) };
            }
        }
        const routineMap = buildRoutineMap(
            curRoutine,
            Math.floor(curAgeTotalMonths / 12), curAgeTotalMonths % 12,
            gpData, ageKeys
        );

        /* ── Training weights ── */
        const GRP_COUNT = isGK ? 1 : 6;
        let gw = new Array(GRP_COUNT).fill(1 / GRP_COUNT);

        if (!isGK && squadPlayer) {
            try {
                const STD_FOCUS = { '1': 3, '2': 0, '3': 1, '4': 5, '5': 4, '6': 2 };
                const customStr = squadPlayer.training_custom || '';
                const trainType = String(squadPlayer.training || '3');

                if (customStr.length === 6) {
                    const dots = [];
                    let dtot = 0;
                    for (let i = 0; i < 6; i++) {
                        const d = parseInt(customStr[i]) || 1;
                        dots.push(d); dtot += d;
                    }
                    const sm = 0.5;
                    const den = dtot + 6 * sm;
                    gw = dots.map(d => (d + sm) / den);
                    logFn(`  Training: Custom dots=[${dots.join(',')}]`);
                } else {
                    const fg = STD_FOCUS[trainType] ?? 1;
                    gw = new Array(6).fill(0.125);
                    gw[fg] = 0.375;
                    logFn(`  Training: Standard ${TmConst.TRAINING_NAMES[trainType] || trainType}`);
                }
            } catch (e) { /* balanced */ }
        } else if (!isGK) {
            logFn(`  Training: Not in squad, using balanced weights`);
        }

        /* ── Decimal distribution + build v3 store ── */
        const decsByKey = computeGrowthDecimals(store.records, ageKeys, { isGK }, gw);

        const v3Store = { _v: 3, lastSeen: Date.now(), records: {} };
        v3Store.meta = { name: tip.name || '', pos: favpos, isGK };

        for (const ageKey of ageKeys) {
            const rec = store.records[ageKey];
            const intS = rec.skills.map(v => Math.floor(typeof v === 'string' ? parseFloat(v) : v));
            const dec = decsByKey[ageKey];
            const skillsC = intS.map((v, i) => v >= 20 ? 20 : v + (dec[i] || 0));
            const rtn = routineMap[ageKey] ?? null;
            v3Store.records[ageKey] = {
                SI: rec.SI,
                REREC: Number(calculateRemaindersF(posIdx, skillsC, rec.SI).rec),
                R5: Number(calculateR5F(posIdx, skillsC, rec.SI, rtn || 0)),
                skills: skillsC.map(v => Math.round(v * 100) / 100),
                routine: rtn,
                locked: true
            };
        }

        /* ── Merge: preserve existing DB records not in the import file ── */
        const existing = PlayerDB.get(pid);
        if (existing && existing.records) {
            for (const [key, rec] of Object.entries(existing.records)) {
                if (!v3Store.records[key]) {
                    v3Store.records[key] = rec;
                }
            }
            if (existing.graphSync) v3Store.graphSync = true;
        }

        await PlayerDB.set(pid, v3Store);

        const recCount = Object.keys(v3Store.records).length;
        const lastKey = ageKeys[ageKeys.length - 1];
        const lastRec = v3Store.records[lastKey];
        const lastR5 = lastRec ? Number(lastRec.R5).toFixed(2) : '?';
        logFn(`  ✓ Saved ${recCount} records → v3 | Last R5: ${lastR5}`);
        console.log(`%c[Import] ✓ ${pid} — ${tip.name || '?'} — ${recCount} records → v3 | R5=${lastR5}`,
            'font-weight:bold;color:#6cc040');

        return v3Store;
    };

    export const TmImportSync = { parseImportFile, parseAge, syncPlayer, restoreV3 };
