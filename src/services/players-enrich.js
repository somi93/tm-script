import { TmConst } from '../lib/tm-constants.js';
import { TmLib } from '../lib/tm-lib.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmPlayerService } from './player.js';
import { TmClubService } from './club.js';

/**
 * Extract the page-specific bid/status fields from a raw players_ar entry.
 * Used by both the shortlist page and the bids page.
 */
export function toPageRecord(p) {
    return {
        timeleft: parseInt(p.timeleft) || 0,
        timeleft_string: p.timeleft_string || null,
        curbid: p.curbid || null,
        next_bid: parseInt(p.next_bid) || 0,
        bid_level: parseInt(p.bid) || 0,
        txt: p.txt || '',
        ban: p.ban || '0',
        inj: p.inj != null ? String(p.inj) : null,
        locked: typeof p.status === 'string' && p.status.includes('status_unknown'),
        retire: p.retire || '0',
        no: parseInt(p.no) || 0,
        wage: parseInt(p.wage) || 0,
        club: p.club || '0',
    };
}
/**
 * Build a player object from a local DB record.
 * Used by both shortlist (indexed tab) and enrichPlayers().
 */
export function dbRecordToPlayer(pid, dbStore, pageRecord = {}) {
    if (!dbStore || !dbStore.records) return null;
    const keys = Object.keys(dbStore.records).sort((a, b) => {
        const [ay, am] = a.split('.').map(Number);
        const [by, bm] = b.split('.').map(Number);
        return (ay * 12 + am) - (by * 12 + bm);
    });
    if (!keys.length) return null;

    const lastKey = keys[keys.length - 1];
    const [ky, km] = lastKey.split('.').map(Number);
    const weeksSince = (Date.now() - (dbStore.lastSeen || 0)) / 604800000;
    const addMonths = Math.floor(weeksSince);
    const totalM = km + addMonths;
    const newYears = ky + Math.floor(totalM / 12);
    const newMonths = totalM % 12;

    const dbRec = dbStore.records[lastKey] || {};
    const meta = dbStore.meta || {};
    const isGK = !!meta.isGK;
    const favPos = meta.pos || 'mc';
    const skills = (dbRec.skills || []).map(Number);
    const asi = dbRec.SI || 0;
    const routine = dbRec.routine || 0;

    const posKeys = String(favPos).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const positions = posKeys.map(key => {
        const posData = TmConst.POSITION_MAP[key] || { position: key, id: 0, ordering: 9, color: 'var(--tmu-text-disabled)' };
        if (asi > 0 && skills.length) {
            const fakePlayer = { skills, asi, routine, isGK };
            return { ...posData, r5: parseFloat(TmLib.calculatePlayerR5(posData, fakePlayer)) || 0, rec: parseFloat(TmLib.calculatePlayerREC(posData, fakePlayer)) || 0 };
        }
        return { ...posData, r5: 0, rec: 0 };
    });
    if (!positions.length) positions.push({ position: 'dc', id: 0, ordering: 0, color: 'var(--tmu-info)', r5: 0, rec: 0 });

    const wage = parseInt(pageRecord.wage) || dbStore.meta?.wage || 0;

    return {
        id: String(pid),
        name: meta.name || '',
        country: meta.country || '',
        favposition: favPos,
        positions, isGK,
        age: newYears,
        months: newMonths,
        asi, r5: Math.max(...positions.map(p => p.r5), 0),
        rec: Number(Math.max(...positions.map(p => p.rec), 0)),
        ti: dbRec.TI != null ? dbRec.TI : TmLib.calculateTIPerSession({ asi, wage, isGK }),
        routine, wage, skills,
        lastSeen: dbStore.lastSeen || 0,
        stale: weeksSince >= 1,
        ...pageRecord,
    };
}

/**
 * Enrich a list of player IDs with full stats (R5, TI, ASI, positions).
 *
 * Strategy (in order):
 *   1. DB prefill — instant, no network
 *   2. Squad batch — one request per club covers all players from that club
 *   3. Tooltip fallback — one request per player for everyone else
 *
 * @param {string[]} ids            — player IDs to enrich
 * @param {object}  pageRecords     — map of pid → extra fields (timeleft, curbid, txt, etc.)
 * @param {object}  opts
 * @param {Function} opts.onUpdate  — called after each batch/tooltip with current players array
 * @returns {Promise<object[]>}     — final enriched players array
 */
export async function enrichPlayers(ids, pageRecords = {}, { onUpdate } = {}) {
    await TmPlayerDB.init();

    const players = [];

    // 1. Prefill from DB
    for (const pid of ids) {
        const dbStore = TmPlayerDB.get(pid);
        if (dbStore) {
            const p = dbRecordToPlayer(pid, dbStore, pageRecords[pid] || {});
            if (p) {
                p.pending = p.stale; // stale = needs refresh
                players.push(p);
            }
        } else {
            // Not in DB yet — placeholder so order is preserved
            players.push({ id: String(pid), pending: true, ...(pageRecords[pid] || {}) });
        }
    }
    onUpdate?.(players);

    // 2. Determine who still needs network fetch
    const needsFetch = ids.filter(pid => {
        const p = players.find(pl => pl.id === pid);
        return !p || p.pending;
    });

    if (!needsFetch.length) return players;

    // Group by club for squad batching
    const clubGroups = new Map();
    const tooltipIds = [];

    for (const pid of needsFetch) {
        const clubId = pageRecords[pid]?.club || TmPlayerDB.get(pid)?.meta?.club_id;
        if (clubId && String(clubId) !== '0') {
            const key = String(clubId);
            if (!clubGroups.has(key)) clubGroups.set(key, []);
            clubGroups.get(key).push(pid);
        } else {
            tooltipIds.push(pid);
        }
    }

    // 3. Squad batch fetches
    for (const [clubId, pids] of clubGroups) {
        if (pids.length < 2) { tooltipIds.push(...pids); continue; }
        try {
            const data = await TmClubService.fetchSquadRaw(clubId);
            if (data?.post) {
                const squadMap = new Map(data.post.map(sp => [String(sp.id), sp]));
                for (const pid of pids) {
                    const sp = squadMap.get(pid);
                    if (sp) {
                        const enriched = { ...sp, ...(pageRecords[pid] || {}), pending: false };
                        const idx = players.findIndex(pl => pl.id === pid);
                        if (idx !== -1) players[idx] = enriched;
                        else players.push(enriched);
                    } else {
                        tooltipIds.push(pid);
                    }
                }
            } else {
                tooltipIds.push(...pids);
            }
        } catch (e) {
            console.warn('[enrichPlayers] squad fetch failed', clubId, e);
            tooltipIds.push(...pids);
        }
        onUpdate?.([...players]);
    }

    // 4. Individual tooltip fallback
    for (const pid of tooltipIds) {
        try {
            const data = await TmPlayerService.fetchPlayerTooltip(pid);
            const p = data?.player;
            if (p) {
                const enriched = { ...p, ...(pageRecords[pid] || {}), pending: false };
                const idx = players.findIndex(pl => pl.id === pid);
                if (idx !== -1) players[idx] = enriched;
                else players.push(enriched);
            } else {
                const stub = players.find(pl => pl.id === pid);
                if (stub) stub.pending = false;
            }
        } catch (e) {
            console.warn('[enrichPlayers] tooltip failed', pid, e);
            const stub = players.find(pl => pl.id === pid);
            if (stub) stub.pending = false;
        }
        onUpdate?.([...players]);
    }

    return players;
}
