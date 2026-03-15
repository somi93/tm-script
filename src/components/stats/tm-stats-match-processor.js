import { TmConst } from '../../lib/tm-constants.js';
import { TmMatchUtils } from '../match/tm-match-utils.js';

const {
        ATTACK_STYLES, STYLE_ORDER,
        STYLE_MAP, MENTALITY_MAP,
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


    export const TmStatsMatchProcessor = {
        process(matchInfo, mData, clubId) {
            const isHome = matchInfo.isHome;
            const ourSide = isHome ? 'home' : 'away';
            const oppSide = isHome ? 'away' : 'home';
            const ourLineup = mData.lineup?.[ourSide] || {};
            const oppLineup = mData.lineup?.[oppSide] || {};
            const homeIds = new Set(Object.keys(mData.lineup?.home || {}));
            const md = mData.match_data || {};
            const plays = mData.plays || {};
            const matchType = classifyMatchType(matchInfo.matchtype);

            // Build player name map
            const allLineup = { ...ourLineup, ...oppLineup };
            const playerNames = {};
            Object.entries(allLineup).forEach(([id, p]) => {
                playerNames[id] = p.name || p.nameLast || id;
            });

            // ── Sub events for minutes calculation ──
            const sortedMins = Object.keys(plays).map(Number).sort((a, b) => a - b);
            const subEvents = TmMatchUtils.buildSubstitutionMap(plays);
            const matchEndMin = md.regular_last_min || Math.max(...sortedMins, 90);

            // ── Per-player stats from shared video + parameter processor ──
            const pStats = TmMatchUtils.buildPlayerEventStats(plays);

            // ── Basic match stats ──
            const matchStats = {
                homeYellow: 0, awayYellow: 0, homeRed: 0, awayRed: 0,
                homeShots: 0, awayShots: 0, homeSoT: 0, awaySoT: 0,
                homeSetPieces: 0, awaySetPieces: 0, homePenalties: 0, awayPenalties: 0,
                homePoss: 0, awayPoss: 0,
                homeGoalsReport: 0, awayGoalsReport: 0,
            };

            // ── Attacking styles for this match ──
            const advFor = {};
            const advAgainst = {};
            STYLE_ORDER.forEach(s => {
                advFor[s] = { a: 0, l: 0, sh: 0, g: 0 };
                advAgainst[s] = { a: 0, l: 0, sh: 0, g: 0 };
            });
            const unclassifiedGoals = []; // debug: goals not matching any attacking style

            if (md.possession) {
                matchStats.homePoss = Number(md.possession.home) || 0;
                matchStats.awayPoss = Number(md.possession.away) || 0;
            }

            const homeId = String(mData.club?.home?.id || matchInfo.hometeam);

            // ── Basic match stats via shared helper ──
            const esStats = TmMatchUtils.extractStats(homeIds, homeId, { plays });
            matchStats.homeYellow    = esStats.homeYellow;
            matchStats.awayYellow    = esStats.awayYellow;
            matchStats.homeRed       = esStats.homeRed;
            matchStats.awayRed       = esStats.awayRed;
            matchStats.homeShots     = esStats.homeShots;
            matchStats.awayShots     = esStats.awayShots;
            matchStats.homeSoT       = esStats.homeSoT;
            matchStats.awaySoT       = esStats.awaySoT;
            matchStats.homeSetPieces = esStats.homeSetPieces;
            matchStats.awaySetPieces = esStats.awaySetPieces;
            matchStats.homePenalties = esStats.homePenalties;
            matchStats.awayPenalties = esStats.awayPenalties;

            for (const minKey of Object.keys(plays)) {
                const eMin = Number(minKey);
                for (const play of (plays[minKey] || [])) {
                    // Attacking styles
                    if (/^p_/.test(play.style)) {
                        const isOurAttack = String(play.team) === clubId;
                        const pd = isOurAttack ? advFor['Penalties'] : advAgainst['Penalties'];
                        pd.a++;
                        if (play.outcome === 'goal') { pd.g++; pd.sh++; }
                        else if (play.outcome === 'shot') pd.sh++;
                        continue;
                    }
                    const styleEntry = ATTACK_STYLES.find(s => s.key === play.style);
                    if (!styleEntry) {
                        if (play.outcome === 'goal')
                            unclassifiedGoals.push({ min: eMin, style: play.style, club: String(play.team), isOur: String(play.team) === clubId });
                        continue;
                    }
                    const label = styleEntry.label;
                    const isOurAttack = String(play.team) === clubId;
                    const d = isOurAttack ? advFor[label] : advAgainst[label];
                    d.a++;
                    if (play.outcome === 'goal') { d.g++; d.sh++; }
                    else if (play.outcome === 'shot') d.sh++;
                    else d.l++;
                }
            }

            matchStats.homeGoalsReport = Object.keys(pStats).reduce((s, id) => homeIds.has(id) ? s + (pStats[id].goals || 0) : s, 0);
            matchStats.awayGoalsReport = Object.keys(pStats).reduce((s, id) => !homeIds.has(id) ? s + (pStats[id].goals || 0) : s, 0);

            // ── Compute per-player minutes and ratings for OUR players ──
            const ourPlayerIds = Object.keys(ourLineup);
            const playerMatchData = {};
            ourPlayerIds.forEach(id => {
                const p = ourLineup[id];
                const isSub = p.position.includes('sub');
                const se = subEvents[String(p.player_id)] || {};
                if (isSub && !se.subInMin) return; // never played
                let minsPlayed;
                if (isSub) {
                    const endMin = se.subOutMin || matchEndMin;
                    minsPlayed = endMin - se.subInMin;
                } else {
                    const endMin = se.subOutMin || matchEndMin;
                    minsPlayed = endMin;
                }
                const pid = String(p.player_id);
                const st = pStats[pid] || { passesCompleted: 0, passesFailed: 0, crossesCompleted: 0, crossesFailed: 0, shots: 0, shotsOnTarget: 0, shotsOffTarget: 0, shotsFoot: 0, shotsOnTargetFoot: 0, goalsFoot: 0, shotsHead: 0, shotsOnTargetHead: 0, goalsHead: 0, saves: 0, goals: 0, assists: 0, duelsWon: 0, duelsLost: 0, interceptions: 0, tackles: 0, headerClearances: 0, tackleFails: 0, keyPasses: 0, setpieceTakes: 0, freekickGoals: 0, penaltiesTaken: 0, penaltiesScored: 0, yellowCards: 0, redCards: 0, fouls: 0 };
                const rating = p.rating ? Number(p.rating) : 0;
                const isGK = p.position === 'gk';

                playerMatchData[pid] = {
                    name: p.name || p.nameLast || pid,
                    position: p.position,
                    isGK,
                    minutes: minsPlayed,
                    rating,
                    ...st,
                };
            });

            // ── Extract tactics ──
            const ourStyle = STYLE_MAP[md.attacking_style?.[ourSide]] || 'Unknown';
            const oppStyle = STYLE_MAP[md.attacking_style?.[oppSide]] || 'Unknown';
            const ourMentality = MENTALITY_MAP[md.mentality?.[ourSide]] || 'Unknown';
            const oppMentality = MENTALITY_MAP[md.mentality?.[oppSide]] || 'Unknown';
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
                unclassifiedGoals,
                ourStyle,
                oppStyle,
                ourMentality,
                oppMentality,
                ourFormation,
                oppFormation,
            };
        },
    };

