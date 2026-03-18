import { TmConst } from '../../lib/tm-constants.js';
import { TmMatchUtils } from '../../utils/match.js';

const {
    STYLE_ORDER,
    STYLE_MAP, MENTALITY_MAP,
    PLAYER_STAT_ZERO,
} = TmConst;

const getFormation = (lineup) => {
    const positions = Object.values(lineup)
        .map(p => (p.position || '').toLowerCase())
        .filter(pos => pos && !pos.startsWith('sub') && pos !== 'gk');
    let def = 0, dm = 0, mid = 0, am = 0, att = 0;
    positions.forEach(p => {
        if (/^(d[^m]|sw|lb|rb|wb)/.test(p)) def++;
        else if (/^dmc/.test(p)) dm++;
        else if (/^(mc|ml|mr)/.test(p)) mid++;
        else if (/^amc/.test(p)) am++;
        else att++; // fc, fcl, fcr, st, wl, wr, lw, rw, etc.
    });
    const lines = [def];
    if (dm > 0) lines.push(dm);
    if (mid > 0) lines.push(mid);
    if (am > 0) lines.push(am);
    lines.push(att);
    return lines.join('-');
};


const classifyMatchType = (matchtype) => {
    switch (matchtype) {
        case 'l': return 'league';
        case 'f': return 'friendly';
        case 'fl': return 'fl';
        case 'c': case 'cl': case 'cup': return 'cup';
        default: return 'other';
    }
};

const summarizePlayerStats = (entries = []) => {
    const stats = { ...PLAYER_STAT_ZERO };
    entries.forEach(e => {
        if (e.shot) {
            stats.shots++;
            if (e.onTarget) stats.shotsOnTarget++;
            else stats.shotsOffTarget++;
            if (e.head) {
                stats.shotsHead++;
                if (e.onTarget) stats.shotsOnTargetHead++;
            }
            if (e.foot) {
                stats.shotsFoot++;
                if (e.onTarget) stats.shotsOnTargetFoot++;
            }
            if (e.goal) {
                stats.goals++;
                if (e.head) stats.goalsHead++;
                else stats.goalsFoot++;
            }
            if (e.penalty) stats.penaltiesTaken++;
            if (e.goal && e.penalty) stats.penaltiesScored++;
            if (e.goal && e.freekick) stats.freekickGoals++;
        }
        if (e.assist) stats.assists++;
        if (e.keyPass) stats.keyPasses++;
        if (e.pass) e.success ? stats.passesCompleted++ : stats.passesFailed++;
        if (e.cross) e.success ? stats.crossesCompleted++ : stats.crossesFailed++;
        if (e.save) stats.saves++;
        if (e.foul) stats.fouls++;
        if (e.duelWon) stats.duelsWon++;
        if (e.duelLost) stats.duelsLost++;
        if (e.tackle) stats.tackles++;
        if (e.interception) stats.interceptions++;
        if (e.headerClear) stats.headerClearances++;
        if (e.tackleFail) stats.tackleFails++;
        if (e.yellow) stats.yellowCards++;
        if (e.yellowRed) stats.yellowRedCards++;
        if (e.red) stats.redCards++;
        if (e.setpiece) stats.setpieceTakes++;
        if (e.subIn) stats.subIn = true;
        if (e.subOut) stats.subOut = true;
        if (e.injury) stats.injured = true;
    });
    return stats;
};

const getDisplayPosition = (player) => {
    const originalPosition = player.originalPosition || player.position || '';
    const currentPosition = player.position || '';
    const perMinute = player.perMinute || [];
    const subIn = perMinute.some(e => e.subIn);
    const subOut = perMinute.some(e => e.subOut);

    if (subOut && originalPosition && !/^sub\d+$/i.test(originalPosition)) {
        return originalPosition;
    }
    if (subIn) {
        return !/^sub\d+$/i.test(currentPosition)
            ? currentPosition
            : ((player.fp || '').split(',')[0] || originalPosition || currentPosition);
    }
    if (/^sub\d+$/i.test(currentPosition) && !/^sub\d+$/i.test(originalPosition)) {
        return originalPosition;
    }
    return currentPosition || originalPosition;
};

const countSetPieces = (actions = [], teamId) =>
    actions.filter(a => String(a.teamId) === String(teamId) && a.action === 'setpiece').length;

const countPenalties = (advanced = {}) => advanced.Penalties?.a || 0;

const mapAdvancedStats = (advanced = {}) => {
    const out = {};
    STYLE_ORDER.forEach(style => {
        const entry = advanced[style] || {};
        out[style] = {
            a: entry.a || 0,
            l: entry.l || 0,
            sh: entry.sh || 0,
            g: entry.g || 0,
        };
    });
    return out;
};


export const TmStatsMatchProcessor = {
    process(matchInfo, mData, clubId) {
        void clubId;
        const matchEndMin = TmMatchUtils.getMatchEndMin(mData);
        const derived = TmMatchUtils.deriveMatchData({
            mData,
            min: matchEndMin,
            curEvtIdx: 999,
            curLineIdx: 999,
        });

        const isHome = matchInfo.isHome;
        const ourSide = isHome ? 'home' : 'away';
        const oppSide = isHome ? 'away' : 'home';
        const homeTeam = derived.teams?.home || {};
        const awayTeam = derived.teams?.away || {};
        const ourTeam = derived.teams?.[ourSide] || {};
        const oppTeam = derived.teams?.[oppSide] || {};
        const ourLineup = ourTeam.lineup || [];
        const oppLineup = oppTeam.lineup || [];
        const md = derived.match_data || {};
        const matchType = classifyMatchType(matchInfo.matchtype);

        // ── Basic match stats ──
        const matchStats = {
            homeYellow: 0, awayYellow: 0, homeRed: 0, awayRed: 0,
            homeShots: 0, awayShots: 0, homeSoT: 0, awaySoT: 0,
            homeSetPieces: 0, awaySetPieces: 0, homePenalties: 0, awayPenalties: 0,
            homePoss: 0, awayPoss: 0,
            homeGoalsReport: 0, awayGoalsReport: 0,
        };

        if (md.possession) {
            matchStats.homePoss = Number(md.possession.home) || 0;
            matchStats.awayPoss = Number(md.possession.away) || 0;
        }

        matchStats.homeYellow = homeTeam.stats?.yellowCards || 0;
        matchStats.awayYellow = awayTeam.stats?.yellowCards || 0;
        matchStats.homeRed = homeTeam.stats?.redCards || 0;
        matchStats.awayRed = awayTeam.stats?.redCards || 0;
        matchStats.homeShots = homeTeam.stats?.shots || 0;
        matchStats.awayShots = awayTeam.stats?.shots || 0;
        matchStats.homeSoT = homeTeam.stats?.shotsOnTarget || 0;
        matchStats.awaySoT = awayTeam.stats?.shotsOnTarget || 0;
        matchStats.homeSetPieces = countSetPieces(derived.actions, homeTeam.id);
        matchStats.awaySetPieces = countSetPieces(derived.actions, awayTeam.id);
        matchStats.homePenalties = countPenalties(homeTeam.stats?.advanced);
        matchStats.awayPenalties = countPenalties(awayTeam.stats?.advanced);
        matchStats.homeGoalsReport = homeTeam.goals || 0;
        matchStats.awayGoalsReport = awayTeam.goals || 0;

        const advFor = mapAdvancedStats(ourTeam.stats?.advanced);
        const advAgainst = mapAdvancedStats(oppTeam.stats?.advanced);

        // ── Compute per-player minutes and ratings for OUR players ──
        const playerMatchData = {};
        ourLineup.forEach(player => {
            const position = getDisplayPosition(player);
            const isBench = /^sub\d+$/i.test(position || '');
            if (isBench && !player.minsPlayed) return;

            const pid = String(player.player_id || player.id);
            playerMatchData[pid] = {
                name: player.name || player.nameLast || pid,
                position,
                isGK: position === 'gk',
                minutes: player.minsPlayed || 0,
                rating: player.rating ? Number(player.rating) : 0,
                ...summarizePlayerStats(player.perMinute || []),
            };
        });

        // ── Extract tactics ──
        const ourStyle = STYLE_MAP[ourTeam.attackingStyle] || 'Unknown';
        const oppStyle = STYLE_MAP[oppTeam.attackingStyle] || 'Unknown';
        const ourMentality = MENTALITY_MAP[ourTeam.mentality] || 'Unknown';
        const oppMentality = MENTALITY_MAP[oppTeam.mentality] || 'Unknown';
        const ourFormation = getFormation(ourLineup);
        const oppFormation = getFormation(oppLineup);

        return {
            matchInfo,
            matchType,
            matchStats,
            advFor,
            advAgainst,
            playerMatchData,
            isHome,
            unclassifiedGoals: [],
            ourStyle,
            oppStyle,
            ourMentality,
            oppMentality,
            ourFormation,
            oppFormation
        };
    },
};

