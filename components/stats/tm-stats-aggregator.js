(function () {
    'use strict';

    const { STYLE_ORDER } = window.TmConst;

    window.TmStatsAggregator = {
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
                            sp: 0, up: 0, sc: 0, uc: 0, sh: 0, sot: 0, soff: 0, shf: 0, sotf: 0, gf: 0,
                            shh: 0, soth: 0, gh: 0, sv: 0, g: 0, a: 0, dw: 0, dl: 0,
                            int: 0, tkl: 0, hc: 0, tf: 0, kp: 0, stp: 0, fkg: 0,
                            pen: 0, peng: 0, yc: 0, rc: 0, fouls: 0,
                        };
                    }
                    const pa = playerAgg[pid];
                    pa.matches++;
                    pa.minutes += ps.minutes;
                    if (ps.rating > 0) { pa.rating += ps.rating; pa.ratingCount++; }
                    pa.sp   += ps.sp;   pa.up  += ps.up;  pa.sc  += ps.sc;  pa.uc += ps.uc;
                    pa.sh   += ps.sh;   pa.sot += ps.sot; pa.soff+= ps.soff;
                    pa.shf  += ps.shf;  pa.sotf+= ps.sotf;pa.gf  += ps.gf;
                    pa.shh  += ps.shh;  pa.soth+= ps.soth;pa.gh  += ps.gh;
                    pa.sv   += ps.sv;   pa.g   += ps.g;   pa.a   += ps.a;
                    pa.dw   += ps.dw;   pa.dl  += ps.dl;
                    pa.int  += ps.int;  pa.tkl += ps.tkl; pa.hc  += ps.hc;  pa.tf += ps.tf;
                    pa.kp   += ps.kp;   pa.stp += ps.stp; pa.fkg += ps.fkg;
                    pa.pen  += ps.pen;  pa.peng+= ps.peng;
                    pa.yc   += ps.yc;   pa.rc  += ps.rc;  pa.fouls += ps.fouls;
                    // Update name from latest appearance
                    pa.name = ps.name;
                    if (!ps.position.includes('sub')) pa.position = ps.position;
                    pa.isGK = ps.isGK || pa.isGK;
                });
            });

            return { playerAgg, teamAggFor, teamAggAgainst, teamOverall, lastFilteredMatches };
        },
    };

})();
