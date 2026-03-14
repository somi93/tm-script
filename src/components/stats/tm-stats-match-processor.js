import { TmConst } from '../../lib/tm-constants.js';
import { TmMatchUtils } from '../match/tm-match-utils.js';

const {
        ATTACK_STYLES, STYLE_ORDER, SKIP_PREFIXES,
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
            const report = mData.report || {};
            const homeIds = new Set(Object.keys(mData.lineup?.home || {}));
            const md = mData.match_data || {};
            const matchType = classifyMatchType(matchInfo.matchtype);

            // Build player name map
            const allLineup = { ...ourLineup, ...oppLineup };
            const playerNames = {};
            Object.entries(allLineup).forEach(([id, p]) => {
                playerNames[id] = p.name || p.nameLast || id;
            });

            // ── Sub events for minutes calculation ──
            const sortedMins = Object.keys(report).map(Number).sort((a, b) => a - b);
            const subEvents = {};
            for (const min of sortedMins) {
                (report[String(min)] || []).forEach(evt => {
                    if (!evt.parameters) return;
                    evt.parameters.forEach(param => {
                        if (param.sub) {
                            const inId = String(param.sub.player_in);
                            const outId = String(param.sub.player_out);
                            if (!subEvents[inId]) subEvents[inId] = {};
                            subEvents[inId].subInMin = min;
                            if (!subEvents[outId]) subEvents[outId] = {};
                            subEvents[outId].subOutMin = min;
                        }
                    });
                });
            }
            const matchEndMin = md.regular_last_min || Math.max(...sortedMins, 90);

            // ── Per-player stats from shared video + parameter processor ──
            const pStats = TmMatchUtils.buildPlayerEventStats(report);

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

            for (const min of sortedMins) {
                const evts = report[String(min)] || [];
                for (let si = 0; si < evts.length; si++) {
                    const evt = evts[si];

                    // Basic match stats from parameters
                    if (evt.parameters) {
                        const gPrefix = evt.type ? evt.type.replace(/[0-9]+.*/, '') : '';
                        evt.parameters.forEach(param => {
                            if (param.yellow) {
                                if (homeIds.has(String(param.yellow))) matchStats.homeYellow++;
                                else matchStats.awayYellow++;
                            }
                            if (param.yellow_red) {
                                if (homeIds.has(String(param.yellow_red))) matchStats.homeRed++;
                                else matchStats.awayRed++;
                            }
                            if (param.red) {
                                if (homeIds.has(String(param.red))) matchStats.homeRed++;
                                else matchStats.awayRed++;
                            }
                            if (param.shot) {
                                const isHomeSide = String(param.shot.team) === homeId;
                                if (isHomeSide) { matchStats.homeShots++; if (param.shot.target === 'on') matchStats.homeSoT++; }
                                else { matchStats.awayShots++; if (param.shot.target === 'on') matchStats.awaySoT++; }
                            }
                            if (param.set_piece && gPrefix === 'dire') {
                                if (homeIds.has(String(param.set_piece))) matchStats.homeSetPieces++;
                                else matchStats.awaySetPieces++;
                            }
                        });

                        // Penalty detection
                        const isPenalty = evt.parameters.some(p => p.penalty);
                        const hasGoalParam = evt.parameters.some(p => p.goal);
                        if (isPenalty && hasGoalParam) {
                            const goalParam = evt.parameters.find(p => p.goal);
                            if (goalParam && homeIds.has(String(goalParam.goal.player))) matchStats.homePenalties++;
                            else if (goalParam) matchStats.awayPenalties++;
                        }
                    }

                    // Attacking styles
                    if (evt.type) {
                        const prefix = evt.type.replace(/[0-9]+.*/, '');

                        // Handle penalty events (type starts with p_)
                        const isPenEvt = /^p_/.test(evt.type);
                        const hasShot = evt.parameters?.some(p => p.shot);
                        const hasGoal = evt.parameters?.some(p => p.goal);
                        const hasPenParam = evt.parameters?.some(p => p.penalty);

                        if (isPenEvt && hasPenParam && hasGoal) {
                            // Penalty goal → Penalties row
                            const club = String(evt.club);
                            const isOurAttack = club === clubId;
                            const pd = isOurAttack ? advFor['Penalties'] : advAgainst['Penalties'];
                            pd.a++; pd.g++; pd.sh++;
                        } else if (isPenEvt && hasShot && !hasGoal) {
                            // Penalty shot missed/saved
                            const club = String(evt.club);
                            const isOurAttack = club === clubId;
                            const pd = isOurAttack ? advFor['Penalties'] : advAgainst['Penalties'];
                            pd.a++; pd.sh++;
                        } else if (!isPenEvt && !SKIP_PREFIXES.has(prefix)) {
                            const styleEntry = ATTACK_STYLES.find(s => s.key === prefix);
                            if (styleEntry) {
                                const label = styleEntry.label;
                                const club = String(evt.club);
                                const isOurAttack = club === clubId;
                                const d = isOurAttack ? advFor[label] : advAgainst[label];
                                d.a++;
                                if (hasGoal) { d.g++; d.sh++; }
                                else if (hasShot) { d.sh++; }
                                else { d.l++; }
                            } else if (hasGoal) {
                                // Goal in event with unrecognized type
                                const club = String(evt.club);
                                unclassifiedGoals.push({ min, type: evt.type, prefix, club, isOur: club === clubId, evt });
                            }
                        } else if (isPenEvt && !hasPenParam && hasGoal) {
                            // p_ event with goal but no penalty param — unusual
                            const club = String(evt.club);
                            unclassifiedGoals.push({ min, type: evt.type, prefix, club, isOur: club === clubId, evt, note: 'p_ without penalty param' });
                        }
                    }

                }
            }

            matchStats.homeGoalsReport = Object.keys(pStats).reduce((s, id) => homeIds.has(id) ? s + (pStats[id].g || 0) : s, 0);
            matchStats.awayGoalsReport = Object.keys(pStats).reduce((s, id) => !homeIds.has(id) ? s + (pStats[id].g || 0) : s, 0);

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
                const st = pStats[pid] || { sp: 0, up: 0, sc: 0, uc: 0, sh: 0, sot: 0, soff: 0, shf: 0, sotf: 0, gf: 0, shh: 0, soth: 0, gh: 0, sv: 0, g: 0, a: 0, dw: 0, dl: 0, int: 0, tkl: 0, hc: 0, tf: 0, kp: 0, stp: 0, fkg: 0, pen: 0, peng: 0, yc: 0, rc: 0, fouls: 0 };
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

