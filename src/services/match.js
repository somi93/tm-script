import { _post, _get } from './engine.js';
import { TmStatsMatchProcessor } from '../components/stats/tm-stats-match-processor.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmMatchCacheDB } from '../lib/tm-playerdb.js';
import { fetchRawPlayers } from '../models/club_new.js';
import { TmPlayerModel } from '../models/player.js';
import { TmMatchUtils } from '../utils/match.js';

export const TmMatchService = {

    /**
     * Fetch the match tooltip (past seasons) from tooltip.ajax.php.
     * @param {string|number} matchId
     * @param {string|number} season
     * @returns {Promise<object|null>}
     */
    fetchMatchTooltip(matchId, season) {
        return _post('/ajax/tooltip.ajax.php', { type: 'match', match_id: matchId, season });
    },
    /**
     * Fetch head-to-head match history between two clubs.
     * @param {string|number} homeId
     * @param {string|number} awayId
     * @param {number} date — Unix timestamp of kickoff
     * @returns {Promise<object|null>}
     */
    fetchMatchH2H(homeId, awayId, date) {
        return _get(`/ajax/match_h2h.ajax.php?home_team=${homeId}&away_team=${awayId}&date=${date}`);
    },
    /**
     * Fetch the player tooltip endpoint.
     * Returns the full parsed response (contains .player, .club, etc.) or null.
     * @param {string|number} pid
     * @returns {Promise<{player: object, club: object, [key: string]: any}|null>}
     */
    /**
     * Promote each event's `parameters` array into direct properties on the event object.
     * Mutates in place. After normalization callers read evt.goal, evt.shot, etc. directly.
     * @param {object} report — mData.report keyed by minute string
     */
    normalizeReport(report) {
        for (const evts of Object.values(report || {})) {
            for (const evt of evts) {
                if (!evt.parameters) continue;
                for (const p of evt.parameters) {
                    if (p.goal !== undefined) evt.goal = p.goal;
                    if (p.shot !== undefined) evt.shot = p.shot;
                    if (p.yellow !== undefined) evt.yellow = p.yellow;
                    if (p.yellow_red !== undefined) evt.yellow_red = p.yellow_red;
                    if (p.red !== undefined) evt.red = p.red;
                    if (p.injury !== undefined) evt.injury = p.injury;
                    if (p.sub !== undefined) evt.sub = p.sub;
                    if (p.penalty !== undefined) evt.penalty = p.penalty;
                    if (p.set_piece !== undefined) evt.set_piece = p.set_piece;
                    if (p.mentality_change !== undefined) evt.mentality_change = p.mentality_change;
                }
            }
        }
    },

    /**
     * Build the normalized plays structure from a raw match report.
     * Requires normalizeReport() to have been called first.
     * @param {object} report — mData.report (post-normalizeReport)
     * @param {object} lineup — mData.lineup with .home and .away player maps
     * @returns {object} normalized plays keyed by minute string
     */
    buildNormalizedPlays(report, lineup) {
        const { PASS_VIDS, CROSS_VIDS, DEFWIN_VIDS, FINISH_VIDS, RUN_DUEL_VIDS } = TmConst;
        const nameMap = {};
        ['home', 'away'].forEach(side => {
            Object.values(lineup?.[side] || {}).forEach(p => {
                nameMap[String(p.player_id)] = p.name || '?';
            });
        });
        const resolveText = (lines) =>
            (lines || []).map(l => l.replace(/\[player=(\d+)\]/g, (_, pid) => nameMap[pid] || pid));

        const result = {};
        const sortedMins = Object.keys(report || {}).map(Number).sort((a, b) => a - b);

        for (const min of sortedMins) {
            const evts = report[String(min)] || [];
            const plays = [];

            evts.forEach((evt, reportEventIndex) => {
                const gPrefix = evt.type ? evt.type.replace(/[0-9]+.*/, '') : '';

                const vids = evt.chance?.video;
                if (!vids?.length) return;

                const evtHasShot = !!evt.shot;
                const evtShotOnTarget = evt.shot?.target === 'on';
                const outcome = evt.goal ? 'goal' : evt.shot ? 'shot' : 'lost';
                const clips = [];

                for (let vi = 0; vi < vids.length; vi++) {
                    const v = vids[vi];
                    const clip = v.video;
                    const text = resolveText(evt.chance?.text?.[vi]);
                    const nextClip = vi + 1 < vids.length ? vids[vi + 1].video : null;
                    const prevClip = vi > 0 ? vids[vi - 1].video : null;

                    const nextIsDefwin = !!(nextClip && DEFWIN_VIDS.test(nextClip));
                    const nextIsFinish = !!(nextClip && FINISH_VIDS.test(nextClip));
                    const prevIsCornerkick = !!(prevClip && /^cornerkick/.test(prevClip));
                    const actions = [];

                    if (/^penaltyshot$/.test(clip)) {
                        const shooter = evt.penalty || evt.goal?.player || v.att1;
                        if (shooter) {
                            const isGoal = !!(evt.goal && String(evt.goal.player) === String(shooter));
                            const onTarget = isGoal || /^save/.test(nextClip || '') || /^goal_/.test(nextClip || '');
                            actions.push({ action: 'shot', by: shooter, onTarget, head: false, foot: true, goal: isGoal, freekick: false, penalty: true });
                        }
                    } else if (PASS_VIDS.test(clip)) {
                        const isGkDist = /^gk(throw|kick)/.test(clip);
                        const by = isGkDist ? v.gk : v.att1;
                        if (by) {
                            const isPreshort = /^preshort/.test(clip);
                            const rawLines = evt.chance?.text?.[vi] || [];
                            const preshortSkip = isPreshort && !rawLines.some(l => l.includes('[player=' + by + ']'));
                            if (!preshortSkip) {
                                const failed = nextIsDefwin;
                                actions.push({ action: 'pass', success: !failed, by });
                                if (!failed && evtHasShot) actions.push({ action: 'keyPass', by });
                            }
                        }
                    } else if (CROSS_VIDS.test(clip) && v.att1) {
                        if (/^freekick/.test(clip) && evtHasShot) {
                            const isGoal = !!(evt.goal && String(evt.goal.player) === String(v.att1));
                            const onTarget = isGoal || evtShotOnTarget;
                            const penalty = /^p_/.test(gPrefix);
                            const freekick = gPrefix === 'dire';
                            actions.push({ action: 'shot', by: v.att1, onTarget, head: false, foot: true, goal: isGoal, freekick, penalty });
                            if (isGoal && evt.goal.assist) actions.push({ action: 'assist', by: evt.goal.assist });
                        } else {
                            const failed = nextIsDefwin;
                            actions.push({ action: 'cross', success: !failed, by: v.att1 });
                            if (!failed && evtHasShot) actions.push({ action: 'keyPass', by: v.att1 });
                        }
                    } else if (FINISH_VIDS.test(clip) && v.att1) {
                        if (!nextIsFinish) {
                            const isHead = /^header/.test(clip);
                            const isGoal = !!(evt.goal && String(evt.goal.player) === String(v.att1));
                            const onTarget = isGoal || evtShotOnTarget;
                            const penalty = /^p_/.test(gPrefix);
                            const freekick = gPrefix === 'dire';
                            actions.push({ action: 'shot', by: v.att1, onTarget, head: isHead, foot: !isHead, goal: isGoal, freekick, penalty });
                            if (isGoal && evt.goal.assist) actions.push({ action: 'assist', by: evt.goal.assist });
                        }
                    } else if (DEFWIN_VIDS.test(clip)) {
                        const tAll = (evt.chance?.text || []).flat();
                        const winner = [v.def1, v.def2].find(d => d && tAll.some(l => l.includes('[player=' + d + ']')));
                        if (winner) {
                            if (!prevIsCornerkick) actions.push({ action: 'duelWon', by: winner });
                            const tSeg = evt.chance?.text?.[vi] || [];
                            const isHeader = /^defwin5$/.test(clip) || tSeg.some(l => /\bheader\b|\bhead(ed|s)?\b/i.test(l));
                            const isTackle = /^defwin(3|6)$/.test(clip);
                            actions.push({ action: isHeader ? 'headerClear' : isTackle ? 'tackle' : 'interception', by: winner });
                        }
                    } else if (RUN_DUEL_VIDS.test(clip)) {
                        if (!nextIsDefwin) {
                            if (!prevIsCornerkick) {
                                const tAll = (evt.chance?.text || []).flat();
                                [v.def1, v.def2].forEach(d => {
                                    if (d && tAll.some(l => l.includes('[player=' + d + ']')))
                                        actions.push({ action: 'duelLost', by: d });
                                });
                            }
                            if (nextIsFinish && v.def1) actions.push({ action: 'tackleFail', by: v.def1 });
                        }
                    } else if (/^save/.test(clip) && v.gk) {
                        actions.push({ action: 'save', by: v.gk });
                    } else if (/^foulcall/.test(clip) && v.def1) {
                        actions.push({ action: 'foul', by: v.def1 });
                    } else if (/^yellow/.test(clip)) {
                        const pid = evt.yellow || evt.yellow_red || v.def1;
                        if (pid) actions.push({ action: evt.yellow_red ? 'yellowRed' : 'yellow', by: pid });
                    } else if (/^red/.test(clip)) {
                        const pid = evt.red || v.def1;
                        if (pid) actions.push({ action: 'red', by: pid });
                    } else if (/^sub/.test(clip) && evt.sub) {
                        actions.push({ action: 'subIn', by: evt.sub.player_in });
                        actions.push({ action: 'subOut', by: evt.sub.player_out });
                        if (evt.sub.player_position) actions.push({ action: 'positionChange', by: evt.sub.player_in, position: evt.sub.player_position });
                    } else if (/^injury_sub/.test(clip) && evt.sub) {
                        actions.push({ action: 'subIn', by: evt.sub.player_in });
                        actions.push({ action: 'subOut', by: evt.sub.player_out });
                        if (evt.sub.player_position) actions.push({ action: 'positionChange', by: evt.sub.player_in, position: evt.sub.player_position });
                    } else if (/^injurystart/.test(clip)) {
                        // player not yet injured – no actions emitted
                    } else if (/^injury/.test(clip) && evt.injury) {
                        actions.push({ action: 'injury', by: evt.injury });
                    }

                    clips.push({ video: clip, text, actions });
                }

                if (evt.set_piece && clips.length > 0)
                    clips[clips.length - 1].actions.push({ action: 'setpiece', by: evt.set_piece, style: gPrefix });
                if (evt.mentality_change && clips.length > 0)
                    clips[clips.length - 1].actions.push({ action: 'mentality_change', team: String(evt.mentality_change.team), mentality: Number(evt.mentality_change.mentality) });
                plays.push({ team: evt.club, style: gPrefix, outcome, clips, reportEventIndex, severity: evt.severity });
            });

            if (plays.length) result[String(min)] = plays;
        }

        return result;
    },

    /**
     * Enrich a raw mData object with derived fields. Mutates in place.
     * Adds: club colors, plays.
     * @param {object} mData — raw or compressed match API response
     * @returns {object} mData (mutated)
     */
    normalizeMatchData(mData, { dbSync = true } = {}) {
        const { club, lineup } = mData;

        mData.teams = { home: {}, away: {} };
        ['home', 'away'].forEach(side => {
            const color = '#' + (club[side].colors?.club_color1 || (side === 'home' ? '4a9030' : '5b9bff'));
            const captainId = Number(mData.match_data?.captain?.[side]);

            // Mutate source lineup dict items so buildActiveLineup inherits all fields
            Object.values(lineup[side]).forEach(p => {
                p.id = Number(p.player_id);
                p.faceUrl = TmMatchUtils.faceUrl(p, color);
                p.captain = Number(p.player_id) === captainId;
                p.skills = p.skills || [];
                p.routine = p.routine ? Number(p.routine) : null;
            });

            mData.teams[side] = {
                ...club[side],
                color,
                lineup: Object.values(lineup[side]),
                mentality: Number(mData.match_data?.mentality?.[side] ?? 4),
                attackingStyle: mData.match_data?.attacking_style?.[side] ?? null,
                focusSide: mData.match_data?.focus_side?.[side] ?? null,
            };
        });

        mData.homePlayerSet = new Set(Object.keys(lineup.home));
        mData.awayPlayerSet = new Set(Object.keys(lineup.away));
        mData.allPlayers = [...Object.values(lineup.home), ...Object.values(lineup.away)];

        this.normalizeReport(mData.report);
        mData.plays = this.buildNormalizedPlays(mData.report, lineup);

        // Fire-and-forget: enrich lineup players with profile data
        const allPids = new Set(mData.allPlayers.map(p => String(p.id)));
        const homeClubId = mData.teams.home.id;
        const awayClubId = mData.teams.away.id;

        if (dbSync) {
            (async () => {
                // Fetch both squads in parallel — covers the vast majority of players
                const [homeData, awayData] = await Promise.all([
                    fetchRawPlayers(homeClubId).catch(() => null),
                    fetchRawPlayers(awayClubId).catch(() => null),
                ]);

                console.log('Squad data fetched', { homeData, awayData });
                // Build pid → normalized player map from squad results
                const squadMap = {};
                [homeData, awayData].forEach(squad => {
                    if (!Array.isArray(squad)) return;
                    squad.forEach(p => { squadMap[String(p.id)] = p; });
                });

                // Split into found (in squad) and missing (sold/released)
                const players = [];
                const missingPids = [];
                for (const pid of allPids) {
                    const p = squadMap[pid];
                    if (p) players.push(p);
                    else missingPids.push(pid);
                }

                // Fetch tooltips only for players not found in squad
                if (missingPids.length > 0) {
                    await Promise.all(missingPids.map(pid =>
                        TmPlayerModel.fetchPlayerTooltip(pid)
                            .then(data => { if (data) players.push(data); })
                            .catch(() => { })
                    ));
                }

                window.dispatchEvent(new CustomEvent('tm:match-profiles-ready', { detail: { players } }));
            })();
        }

        return mData;
    },

    /**
     * Fetch the full match data object for a given match ID.
     * Automatically normalizes the response (report promotion, plays, colors, player sets).
     * @param {string|number} matchId
     * @param {{dbSync?: boolean}} [options]
     * @returns {Promise<object|null>}
     */
    async fetchMatch(matchId, options = {}) {
        const raw = await _get(`/ajax/match.ajax.php?id=${matchId}`);
        if (!raw) return null;
        return this.normalizeMatchData(raw, options);
    },

    /**
     * Fetch match data without cache usage or async player profile enrichment.
     * Intended for pages that only need the raw match payload and lineup/report data.
     * @param {string|number} matchId
     * @returns {Promise<object|null>}
     */
    async fetchMatchLite(matchId) {
        return this.fetchMatch(matchId, { dbSync: false });
    },

    /**
     * Fetch a match via the standard match normalization path and return
     * the stats-ready payload consumed by the club statistics page.
     * @param {object} matchInfo
     * @param {string|number} clubId
     * @param {{dbSync?: boolean}} [options]
     * @returns {Promise<object|null>}
     */
    async fetchMatchForStats(matchInfo, clubId, options = {}) {
        const mData = await this.fetchMatch(matchInfo.id, options);
        if (!mData) return null;
        return TmStatsMatchProcessor.process(matchInfo, mData, clubId);
    },

    /**
     * Strip unnecessary fields from a raw match API response.
     * Removes: udseende2/looks from lineup, text_team from report events,
     * colors/logos/form/meta from club sections.
     * Result is ~30% smaller and fully compatible with all scripts.
     * @param {object} raw — raw response from match.ajax.php
     * @returns {object} compressed match object
     */
    compressMatch(raw) {
        const cPlayer = p => ({
            player_id: Number(p.player_id),
            id: Number(p.player_id),
            name: p.name,
            position: p.position,
            fp: p.fp,
            no: p.no,
            rating: p.rating,
            mom: p.mom,
            rec: p.rec,
            routine: p.routine,
            age: p.age,
            udseende2: p.udseende2,
        });
        const cLineupSide = side => {
            const out = {};
            for (const [pid, p] of Object.entries(raw.lineup?.[side] || {}))
                out[pid] = cPlayer(p);
            return out;
        };
        const cReport = report => {
            const out = {};
            for (const [min, events] of Object.entries(report || {})) {
                out[min] = events.map(evt => {
                    const e = {};
                    if (evt.type !== undefined) e.type = evt.type;
                    if (evt.club !== undefined) e.club = evt.club;
                    if (evt.severity !== undefined) e.severity = evt.severity;
                    if (evt.parameters) e.parameters = evt.parameters;
                    if (evt.chance) {
                        e.chance = {};
                        if (evt.chance.video) e.chance.video = evt.chance.video;
                        if (evt.chance.text) e.chance.text = evt.chance.text;
                        // text_team dropped — not used by any script
                    }
                    return e;
                });
            }
            return out;
        };
        const cClub = c => ({
            id: c.id,
            club_name: c.club_name,
            club_nick: c.club_nick,
            fanclub: c.fanclub,
            stadium: c.stadium,
            manager_name: c.manager_name,
            country: c.country,
            division: c.division,
            group: c.group,
        });
        const md = raw.match_data || {};
        return {
            match_data: {
                attacking_style: md.attacking_style,
                mentality: md.mentality,
                focus_side: md.focus_side,
                possession: md.possession,
                attendance: md.attendance,
                regular_last_min: md.regular_last_min,
                extra_time: md.extra_time,
                last_min: md.last_min,
                halftime: md.halftime,
                captain: md.captain,
                venue: md.venue,
            },
            lineup: {
                home: cLineupSide('home'),
                away: cLineupSide('away'),
            },
            report: cReport(raw.report),
            club: {
                home: raw.club?.home ? cClub(raw.club.home) : undefined,
                away: raw.club?.away ? cClub(raw.club.away) : undefined,
            },
        };
    },

    /**
     * Fetch a match, using TmMatchCacheDB as a cache.
     * First call: fetches from TM API, compresses, stores, returns.
     * Subsequent calls: returns stored compressed record instantly.
     * @param {string|number} matchId
     * @param {{dbSync?: boolean}} [options]
     * @returns {Promise<object|null>}
     */
    async fetchMatchCached(matchId, options = {}) {
        const db = TmMatchCacheDB;
        const cached = await db.get(matchId);
        if (cached) return this.normalizeMatchData(cached, options);
        const raw = await _get(`/ajax/match.ajax.php?id=${matchId}`);
        if (!raw) return null;
        const compressed = this.compressMatch(raw);
        db.set(matchId, compressed); // fire-and-forget
        return this.normalizeMatchData(compressed, options);
    },

    /**
     * Build a per-minute text schedule from match.plays.
     * Used by the replay loop to know at which second each commentary line appears.
     *
     * @param {object} plays  — match.plays from buildNormalizedPlays
     * @param {number} lineInterval  — seconds between consecutive lines (default 3)
     * @returns {{ schedule: object, eventMins: number[] }}
     */
    buildSchedule(plays, lineInterval = 3) {
        const schedule = {};
        for (const [minStr, minPlays] of Object.entries(plays)) {
            let seconds = 0;
            const entries = [];
            for (const action of minPlays) {
                const lineCount = Math.max(
                    1,
                    action.clips.reduce((s, clip) => s + clip.text.filter(l => l.trim()).length, 0)
                );
                for (let actionLineIndex = 0; actionLineIndex < lineCount; actionLineIndex++) {
                    entries.push({ actionIndex: action.reportEventIndex, lineIndex: actionLineIndex, seconds });
                    seconds += lineInterval;
                }
            }
            if (entries.length) {
                schedule[Number(minStr)] = entries;
            }
        }
        return { schedule };
    },

}