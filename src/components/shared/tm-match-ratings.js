import { TmConst } from '../../lib/tm-constants.js';
import { TmClubModel } from '../../models/club.js';
import { TmMatchModel } from '../../models/match.js';
import { TmPlayerModel } from '../../models/player.js';

const squadCache = new Map();
const tooltipCache = new Map();
const matchCache = new Map();

const fetchSquad = (clubId) => {
    if (!squadCache.has(clubId)) {
        squadCache.set(clubId, TmClubModel.fetchSquadRaw(clubId).then(data => {
            const post = {};
            (data || []).forEach(player => {
                post[String(player.id)] = player;
            });
            return { post };
        }).catch(() => ({ post: {} })));
    }
    return squadCache.get(clubId);
};

const getPlayerDataFromSquad = async (playerId, squadPost, matchPos) => {
    let player = squadPost.post?.[String(playerId)];
    if (!player) {
        if (!tooltipCache.has(playerId)) {
            tooltipCache.set(playerId, TmPlayerModel.fetchPlayerTooltip(playerId)
                .then(response => response?.player ?? null)
                .catch(() => null));
        }
        player = await tooltipCache.get(playerId);
    }
    if (!player) return { R5: 0 };
    const posData = player.positions?.find(pos => pos.position?.toLowerCase() === matchPos);
    const r5 = Number(posData?.r5 ?? player.r5 ?? 0);
    return { R5: Number.isFinite(r5) ? r5 : 0 };
};

const computeTeamStats = async (playerIds, lineup, squadPost) => {
    const starters = playerIds.filter(id => !String(lineup[id]?.position || '').includes('sub'));
    const players = await Promise.all(starters.map(async id => {
        const matchPos = lineup[id].position;
        const data = await getPlayerDataFromSquad(id, squadPost, matchPos);
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