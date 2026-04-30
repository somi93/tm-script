import { POSITION_MAP } from '../../constants/player.js';
import { TmConst } from '../../lib/tm-constants.js';
import { TmClubModel } from '../../models/club.js';
import { TmMatchModel } from '../../models/match.js';
import { TmPlayerModel } from '../../models/player.js';

const squadCache = new Map();
const matchCache = new Map();
const POS_CANONICAL = {
    dcl: 'dc',
    dcr: 'dc',
    dmcl: 'dmc',
    dmcr: 'dmc',
    mcl: 'mc',
    mcr: 'mc',
    omcl: 'omc',
    omcr: 'omc',
    fcl: 'fc',
    fcr: 'fc',
};

const resolveMatchPosition = (player, matchPos) => {
    const rawPos = String(matchPos || '').toLowerCase();
    const mappedKey = POS_CANONICAL[rawPos] || rawPos;
    const direct = player.positions?.find(pos => String(pos.key || pos.position || '').toLowerCase() === mappedKey);
    if (direct) return { lookupPos: mappedKey, selectedPosition: direct };
    const targetPos = POSITION_MAP[rawPos] || POSITION_MAP[mappedKey] || null;
    if (!targetPos) return { lookupPos: mappedKey, selectedPosition: null };
    const fallback = player.positions?.find(pos => pos?.main && Number(pos.id) === Number(targetPos.id)) || null;
    return { lookupPos: mappedKey, selectedPosition: fallback };
};

const resolvePlayerR5 = (player, matchPos) => {
    const { lookupPos, selectedPosition } = resolveMatchPosition(player, matchPos);
    const r5 = Number(selectedPosition?.r5 ?? player?.r5 ?? 0);
    return { lookupPos, r5: Number.isFinite(r5) ? r5 : 0 };
};

const fetchSquad = (clubId) => {
    if (!squadCache.has(clubId)) {
        squadCache.set(clubId, TmClubModel.fetchSquadRaw(clubId).then(data => {
            return { squad: data || [] };
        }).catch(() => ({ squad: [] })));
    }
    return squadCache.get(clubId);
};

const getPlayerDataFromSquad = async (playerId, squadData, matchPos) => {
    let player = (squadData.squad || []).find(p => String(p.id) === String(playerId)) || null;
    let fromSquad = !!player;
    if (!player) {
        player = await TmPlayerModel.fetchTooltipCached(playerId).catch(() => null);
        fromSquad = false;
    }
    if (!player) return { R5: 0 };
    let { lookupPos, r5 } = resolvePlayerR5(player, matchPos);
    if (fromSquad && player.isGK && r5 <= 0) {
        const tooltipPlayer = await TmPlayerModel.fetchTooltipCached(playerId).catch(() => null);
        if (tooltipPlayer) {
            player = tooltipPlayer;
            ({ lookupPos, r5 } = resolvePlayerR5(player, matchPos));
        }
    }
    console.log(`[Round R5] ${player.name || playerId} | pos=${lookupPos} | r5=${Number.isFinite(r5) ? r5 : 0}`);
    return { R5: Number.isFinite(r5) ? r5 : 0 };
};

const computeTeamStats = async (playerIds, lineup, squadData) => {
    const starters = playerIds.filter(id => !String(lineup[id]?.position || '').includes('sub'));
    const players = await Promise.all(starters.map(async id => {
        const matchPos = lineup[id].position;
        const data = await getPlayerDataFromSquad(id, squadData, matchPos);
        return { id, ...data };
    }));
    const totals = { R5: 0 };
    players.forEach(player => {
        totals.R5 += player.R5;
    });
    return { totals, players };
};

const fetchMatchR5 = (matchId) => {
    const key = String(matchId);
    if (!matchCache.has(key)) {
        matchCache.set(key, TmMatchModel.fetchMatchCached(key).then(async data => {
            if (!data?.home?.club?.id || !data?.away?.club?.id) return null;
            const homeId = String(data.home.club.id);
            const awayId = String(data.away.club.id);
            const homeLineupMap = Object.fromEntries(data.home.lineup.map(p => [String(p.id), p]));
            const awayLineupMap = Object.fromEntries(data.away.lineup.map(p => [String(p.id), p]));
            const [homeSquad, awaySquad] = await Promise.all([fetchSquad(homeId), fetchSquad(awayId)]);
            const [homeResult, awayResult] = await Promise.all([
                computeTeamStats(Object.keys(homeLineupMap), homeLineupMap, homeSquad),
                computeTeamStats(Object.keys(awayLineupMap), awayLineupMap, awaySquad),
            ]);
            return {
                homeR5: Number((homeResult.totals.R5 / 11).toFixed(2)),
                awayR5: Number((awayResult.totals.R5 / 11).toFixed(2)),
                thresholds: TmConst.R5_THRESHOLDS,
                data,
            };
        }).catch(() => null));
    }
    return matchCache.get(key);
};

export const TmMatchRatings = {
    fetchMatchR5,
};