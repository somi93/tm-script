import { TmConst } from '../../lib/tm-constants.js';

const { STYLE_ORDER, PLAYER_STAT_ZERO } = TmConst;

    export const TmStatsAggregator = {
        /**
         * Aggregate all match data into player/team summaries.
         * Pure function — reads allMatchData + filters, returns new state objects.
         *
         * @param {Array}  allMatchData
         * @param {Object} filters  { activeMatchType, filterOurFormation, filterOurStyle,
         *                            filterOurMentality, filterOppFormation, filterOppStyle,
         *                            filterOppMentality }
         * @returns {{ playerAgg, teamAggFor, teamAggAgainst, teamOverall, lastFilteredMatches }}
         */
        aggregate(allMatchData, filters) {
            const {
                activeMatchType,
                filterOurFormation, filterOurStyle, filterOurMentality,
                filterOppFormation, filterOppStyle, filterOppMentality,
            } = filters;

            const playerAgg = {};
            const teamAggFor = {};
            const teamAggAgainst = {};
            STYLE_ORDER.forEach(s => {
                teamAggFor[s]     = { a: 0, l: 0, sh: 0, g: 0 };
                teamAggAgainst[s] = { a: 0, l: 0, sh: 0, g: 0 };
            });
            const teamOverall = {
                matches: 0, wins: 0, draws: 0, losses: 0,
                goalsFor: 0, goalsAgainst: 0,
                shotsFor: 0, shotsAgainst: 0,
                soTFor: 0, soTAgainst: 0,
                yellowFor: 0, yellowAgainst: 0,
                redFor: 0, redAgainst: 0,
                setPiecesFor: 0, setPiecesAgainst: 0,
                penaltiesFor: 0, penaltiesAgainst: 0,
                possFor: 0, possAgainst: 0, possCount: 0,
            };

            const lastFilteredMatches = allMatchData.filter(md => {
                if (activeMatchType !== 'all' && md.matchType !== activeMatchType) return false;
                if (filterOurFormation && !filterOurFormation.has(md.ourFormation)) return false;
                if (filterOurStyle     && !filterOurStyle.has(md.ourStyle))         return false;
                if (filterOurMentality && !filterOurMentality.has(md.ourMentality)) return false;
                if (filterOppFormation && !filterOppFormation.has(md.oppFormation)) return false;
                if (filterOppStyle     && !filterOppStyle.has(md.oppStyle))         return false;
                if (filterOppMentality && !filterOppMentality.has(md.oppMentality)) return false;
                return true;
            });

            lastFilteredMatches.forEach(md => {
                const { matchInfo, matchStats, advFor: af, advAgainst: aa, playerMatchData, isHome } = md;

                // Team overall
                teamOverall.matches++;
                const [h, a] = matchInfo.result.split('-').map(Number);
                const ourGoals = isHome ? h : a;
                const oppGoals = isHome ? a : h;
                teamOverall.goalsFor     += ourGoals;
                teamOverall.goalsAgainst += oppGoals;
                if (ourGoals > oppGoals)      teamOverall.wins++;
                else if (ourGoals === oppGoals) teamOverall.draws++;
                else                           teamOverall.losses++;

                teamOverall.shotsFor       += isHome ? matchStats.homeShots    : matchStats.awayShots;
                teamOverall.shotsAgainst   += isHome ? matchStats.awayShots    : matchStats.homeShots;
                teamOverall.soTFor         += isHome ? matchStats.homeSoT      : matchStats.awaySoT;
                teamOverall.soTAgainst     += isHome ? matchStats.awaySoT      : matchStats.homeSoT;
                teamOverall.yellowFor      += isHome ? matchStats.homeYellow   : matchStats.awayYellow;
                teamOverall.yellowAgainst  += isHome ? matchStats.awayYellow   : matchStats.homeYellow;
                teamOverall.redFor         += isHome ? matchStats.homeRed      : matchStats.awayRed;
                teamOverall.redAgainst     += isHome ? matchStats.awayRed      : matchStats.homeRed;
                teamOverall.setPiecesFor   += isHome ? matchStats.homeSetPieces: matchStats.awaySetPieces;
                teamOverall.setPiecesAgainst += isHome ? matchStats.awaySetPieces: matchStats.homeSetPieces;
                teamOverall.penaltiesFor   += isHome ? matchStats.homePenalties: matchStats.awayPenalties;
                teamOverall.penaltiesAgainst += isHome ? matchStats.awayPenalties: matchStats.homePenalties;
                if (matchStats.homePoss || matchStats.awayPoss) {
                    teamOverall.possFor     += isHome ? matchStats.homePoss : matchStats.awayPoss;
                    teamOverall.possAgainst += isHome ? matchStats.awayPoss : matchStats.homePoss;
                    teamOverall.possCount++;
                }

                // Attacking styles
                STYLE_ORDER.forEach(s => {
                    ['a', 'l', 'sh', 'g'].forEach(k => {
                        teamAggFor[s][k]     += af[s]?.[k] ?? 0;
                        teamAggAgainst[s][k] += aa[s]?.[k] ?? 0;
                    });
                });

                // Player stats
                Object.entries(playerMatchData).forEach(([pid, ps]) => {
                    if (!playerAgg[pid]) {
                        playerAgg[pid] = {
                            name: ps.name, position: ps.position, isGK: ps.isGK,
                            matches: 0, minutes: 0, rating: 0, ratingCount: 0,
                            passesCompleted: 0, passesFailed: 0, crossesCompleted: 0, crossesFailed: 0,
                            shots: 0, shotsOnTarget: 0, shotsOffTarget: 0,
                            shotsFoot: 0, shotsOnTargetFoot: 0, goalsFoot: 0,
                            shotsHead: 0, shotsOnTargetHead: 0, goalsHead: 0,
                            saves: 0, goals: 0, assists: 0, keyPasses: 0,
                            duelsWon: 0, duelsLost: 0, interceptions: 0, tackles: 0,
                            headerClearances: 0, tackleFails: 0,
                            setpieceTakes: 0, freekickGoals: 0,
                            penaltiesTaken: 0, penaltiesScored: 0,
                            yellowCards: 0, redCards: 0, fouls: 0,
                        };
                    }
                    const pa = playerAgg[pid];
                    pa.matches++;
                    pa.minutes += ps.minutes;
                    if (ps.rating > 0) { pa.rating += ps.rating; pa.ratingCount++; }
                    pa.passesCompleted   += ps.passesCompleted   || 0;
                    pa.passesFailed      += ps.passesFailed      || 0;
                    pa.crossesCompleted  += ps.crossesCompleted  || 0;
                    pa.crossesFailed     += ps.crossesFailed     || 0;
                    pa.shots             += ps.shots             || 0;
                    pa.shotsOnTarget     += ps.shotsOnTarget     || 0;
                    pa.shotsOffTarget    += ps.shotsOffTarget    || 0;
                    pa.shotsFoot         += ps.shotsFoot         || 0;
                    pa.shotsOnTargetFoot += ps.shotsOnTargetFoot || 0;
                    pa.goalsFoot         += ps.goalsFoot         || 0;
                    pa.shotsHead         += ps.shotsHead         || 0;
                    pa.shotsOnTargetHead += ps.shotsOnTargetHead || 0;
                    pa.goalsHead         += ps.goalsHead         || 0;
                    pa.saves             += ps.saves             || 0;
                    pa.goals             += ps.goals             || 0;
                    pa.assists           += ps.assists           || 0;
                    pa.keyPasses         += ps.keyPasses         || 0;
                    pa.duelsWon          += ps.duelsWon          || 0;
                    pa.duelsLost         += ps.duelsLost         || 0;
                    pa.interceptions     += ps.interceptions     || 0;
                    pa.tackles           += ps.tackles           || 0;
                    pa.headerClearances  += ps.headerClearances  || 0;
                    pa.tackleFails       += ps.tackleFails       || 0;
                    pa.setpieceTakes     += ps.setpieceTakes     || 0;
                    pa.freekickGoals     += ps.freekickGoals     || 0;
                    pa.penaltiesTaken    += ps.penaltiesTaken    || 0;
                    pa.penaltiesScored   += ps.penaltiesScored   || 0;
                    pa.yellowCards       += ps.yellowCards       || 0;
                    pa.redCards          += ps.redCards          || 0;
                    pa.fouls             += ps.fouls             || 0;
                    // Update name from latest appearance
                    pa.name = ps.name;
                    if (!ps.position.includes('sub')) pa.position = ps.position;
                    pa.isGK = ps.isGK || pa.isGK;
                });
            });

            return { playerAgg, teamAggFor, teamAggAgainst, teamOverall, lastFilteredMatches };
        },
    };

