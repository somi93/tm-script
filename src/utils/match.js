import { TmConst } from '../lib/tm-constants.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmPlayerService } from '../services/player.js';

// tm-match-utils.js — Shared match event parsing utilities
// Depends on: TmPlayerDB, TmPlayerService (for enrichMatchPlayer)
// Exposed as: TmMatchUtils

export const TmMatchUtils = {

    /**
     * Check if a match has not started yet.
     * Negative live_min means countdown to kickoff.
     * @param {object} mData
     * @returns {boolean}
     */
    isMatchFuture(mData) {
        const md = mData?.match_data;
        const liveMin = md?.live_min;
        if (typeof liveMin === 'number' && liveMin < 0) return true;
        if (typeof liveMin === 'number' && liveMin > 0) return false;
        const kickoff = md?.venue?.kickoff;
        if (kickoff) {
            const now = Math.floor(Date.now() / 1000);
            return Number(kickoff) > now;
        }
        return false;
    },

    /**
     * Resolve a player's display name from a match lineup object.
     * @param {object} lineup — mData.lineup (has .home and .away sub-objects keyed by player_id)
     * @param {string|number} pid — player id
     * @returns {string} last name, or full name, or '?'
     */
    resolvePlayerName(lineup, pid) {
        if (!pid) return '?';
        const p = lineup?.home?.[String(pid)] || lineup?.away?.[String(pid)];
        return p?.nameLast || p?.name || '?';
    },

    /**
     * Returns true if the given player id is in the home side's lineup.
     * @param {Set<string>} homeIds — Set of home player ids as strings
     * @param {string|number} pid
     * @returns {boolean}
     */
    isHome(homeIds, pid) {
        return homeIds.has(String(pid));
    },

    /**
     * Extract aggregated match statistics from plays.
     *
     * @param {Set}     homeIds  — Set<string> of home player IDs
     * @param {string}  homeId   — home club ID (string) — used to identify shot ownership
     * @param {object}  [opts]
     * @param {object}  [opts.plays]           — mData.plays keyed by minute string
     * @param {number}  [opts.upToMin]         — stop processing after this minute
        * @param {number}  [opts.upToEvtIdx]      — secondary event index ceiling
        * @param {number}  [opts.upToLineIdx]     — visible line index within the current event
     * @param {object}  [opts.lineup]          — mData.lineup — if provided, events[] is populated with named entries
     * @returns {{ homeGoals, awayGoals, homeYellow, awayYellow, homeRed, awayRed,
     *            homeShots, awayShots, homeSoT, awaySoT,
     *            homeSetPieces, awaySetPieces, homePenalties, awayPenalties,
     *            events: Array<{min, icon, name, side}> }}
     */
    extractStats(homeIds, homeId, opts = {}) {
        const stats = {
            homeGoals: 0, awayGoals: 0,
            homeYellow: 0, awayYellow: 0, homeRed: 0, awayRed: 0,
            homeShots: 0, awayShots: 0, homeSoT: 0, awaySoT: 0,
            homeSetPieces: 0, awaySetPieces: 0, homePenalties: 0, awayPenalties: 0,
            events: [],
        };
        return stats;
        const lineup = opts.lineup || null;
        const { upToMin = 999, upToEvtIdx = 999, upToLineIdx = 999 } = opts;
        const self = this;
        const plays = opts.visiblePlays || self.buildVisiblePlays(opts.plays || {}, upToMin, upToEvtIdx, upToLineIdx);

        for (const minKey of Object.keys(plays)) {
            const eMin = Number(minKey);
            for (const play of (plays[minKey] || [])) {
                const home = String(play.team) === homeId;
                const isPenalty = /^p_/.test(play.style);
                const playActions = self.getPlayActions(play);

                for (const seg of play.segments) {
                    if (play.outcome === 'goal' && seg.actions.some(a => a.action === 'goal')) {
                        if (home) stats.homeGoals++; else stats.awayGoals++;
                        if (home) stats.homeShots++; else stats.awayShots++;
                        if (home) stats.homeSoT++; else stats.awaySoT++;
                        if (isPenalty) { if (home) stats.homePenalties++; else stats.awayPenalties++; }
                        if (lineup) {
                            const scorer = seg.actions.find(a => a.action === 'goal')?.by;
                            stats.events.push({ min: eMin, icon: '⚽', name: self.resolvePlayerName(lineup, scorer), side: home ? 'home' : 'away' });
                        }
                    } else if (play.outcome === 'shot' && seg.actions.some(a => a.action === 'shot')) {
                        if (home) stats.homeShots++; else stats.awayShots++;
                        const shotAct = seg.actions.find(a => a.action === 'shot');
                        if (shotAct?.onTarget) { if (home) stats.homeSoT++; else stats.awaySoT++; }
                    }

                }

                for (const act of playActions) {
                    if (act.action === 'yellow' || act.action === 'yellowRed' || act.action === 'red') {
                        const pid = act.by;
                        const h = self.isHome(homeIds, pid);
                        if (act.action === 'yellow') { if (h) stats.homeYellow++; else stats.awayYellow++; if (lineup) stats.events.push({ min: eMin, icon: '🟨', name: self.resolvePlayerName(lineup, pid), side: h ? 'home' : 'away' }); }
                        if (act.action === 'yellowRed') {
                            if (h) stats.homeYellow++; else stats.awayYellow++;
                            if (h) stats.homeRed++; else stats.awayRed++; if (lineup) stats.events.push({ min: eMin, icon: '🟥', name: self.resolvePlayerName(lineup, pid), side: h ? 'home' : 'away' });
                        }
                        if (act.action === 'red') { if (h) stats.homeRed++; else stats.awayRed++; if (lineup) stats.events.push({ min: eMin, icon: '🟥', name: self.resolvePlayerName(lineup, pid), side: h ? 'home' : 'away' }); }
                    } else if (act.action === 'setpiece') {
                        const h = self.isHome(homeIds, act.player);
                        if (h) stats.homeSetPieces++; else stats.awaySetPieces++;
                    }
                }
            }
        }

        return stats;
    },

    getPlayerStats(plays, pid, opts = {}) {
        const { upToMin = 999, upToEvtIdx = 999, upToLineIdx = 999 } = opts;
        const visiblePlays = opts.visiblePlays || this.buildVisiblePlays(plays, upToMin, upToEvtIdx, upToLineIdx);
        const perMinute = Object.entries(visiblePlays).flatMap(([minKey, minPlays]) => {
            const eMin = Number(minKey);
            return (minPlays || [])
                .flatMap(play => {
                    const evtIdx = play.reportEvtIdx ?? null;
                    return play.segments.flatMap(seg => {
                        const acts = seg.actions.filter(a => a.by === pid);
                        return acts.length ? [Object.assign({ min: eMin, evtIdx }, ...acts.map(({ action, by, ...rest }) => ({ [action]: true, ...rest })))] : [];
                    });
                });
        });
        const _test = {
            goals: e => e.shot && e.goal,
            assists: e => e.assist,
            keyPasses: e => e.keyPass,
            shots: e => e.shot,
            saves: e => e.save,
            shotsOnTarget: e => e.shot && e.onTarget,
            goalsFoot: e => e.shot && e.goal && e.foot,
            goalsHead: e => e.shot && e.goal && e.head,
            passesCompleted: e => e.pass && e.success,
            passesFailed: e => e.pass && !e.success,
            crossesCompleted: e => e.cross && e.success,
            crossesFailed: e => e.cross && !e.success,
            interceptions: e => e.interception,
            tackles: e => e.tackle,
            headerClearances: e => e.headerClear,
            tackleFails: e => e.tackleFail,
            duelsWon: e => e.duelWon,
            duelsLost: e => e.duelLost,
            fouls: e => e.foul,
            yellowCards: e => e.yellow,
            yellowRedCards: e => e.yellowRed,
            redCards: e => e.red,
            injured: e => e.injury,
            subIn: e => e.subIn,
            subOut: e => e.subOut,
        };
        const grouped = TmConst.PLAYER_STAT_COLS
            .flatMap(col => {
                const fn = _test[col.key];
                if (!fn) return [];
                const count = col.lineupBool ? (perMinute.some(fn) ? 1 : 0) : perMinute.filter(fn).length;
                return count ? [{ ...col, count }] : [];
            });
        return { perMinute, grouped };
    },

    /**
     * Render the goals+cards events section HTML from legacy tooltip API data.
     * (tooltip.ajax.php format — events have .minute, .scorer_name, .score, .assist_id)
     * @param {Array} goals  — sorted goal event objects with .isHome flag
     * @param {Array} cards  — sorted card event objects with .isHome flag
     * @returns {string} HTML string (empty string if no events)
     */
    renderLegacyEvents(goals, cards) {
        if (!goals.length && !cards.length) return '';
        let t = '<div class="rnd-h2h-tooltip-events">';
        goals.forEach(e => {
            const sideClass = e.isHome ? '' : ' away-evt';
            t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
            t += `<span class="rnd-h2h-tooltip-evt-min">${e.minute}'</span>`;
            t += `<span class="rnd-h2h-tooltip-evt-icon">⚽</span>`;
            t += `<span class="rnd-h2h-tooltip-evt-text">${e.scorer_name || ''}`;
            if (e.assist_id && e.assist_id !== '') {
                t += ` <span class="rnd-h2h-tooltip-evt-assist">(${e.score})</span>`;
            } else {
                t += ` <span class="rnd-h2h-tooltip-evt-assist">${e.score}</span>`;
            }
            t += `</span></div>`;
        });
        if (goals.length && cards.length) t += '<div class="rnd-h2h-tooltip-divider"></div>';
        cards.forEach(e => {
            const icon = e.score === 'yellow' ? '🟡' : e.score === 'orange' ? '🟡🟡→🔴' : '🔴';
            const sideClass = e.isHome ? '' : ' away-evt';
            t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
            t += `<span class="rnd-h2h-tooltip-evt-min">${e.minute}'</span>`;
            t += `<span class="rnd-h2h-tooltip-evt-icon">${icon}</span>`;
            t += `<span class="rnd-h2h-tooltip-evt-text">${e.scorer_name || ''}</span>`;
            t += `</div>`;
        });
        t += '</div>';
        return t;
    },

    /**
     * Render the goals+cards events section HTML from full match API data.
     * (match.ajax.php format — events have .min, .name, .assist, .type)
     * @param {Array} goals  — goal event objects with .isHome flag
     * @param {Array} cards  — card event objects with .isHome flag
     * @returns {string} HTML string (empty string if no events)
     */
    renderRichEvents(goals, cards) {
        if (!goals.length && !cards.length) return '';
        let t = '<div class="rnd-h2h-tooltip-events">';
        goals.forEach(e => {
            const sideClass = e.isHome ? '' : ' away-evt';
            t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
            t += `<span class="rnd-h2h-tooltip-evt-min">${e.min}'</span>`;
            t += `<span class="rnd-h2h-tooltip-evt-icon">⚽</span>`;
            t += `<span class="rnd-h2h-tooltip-evt-text">${e.name}`;
            if (e.assist) t += ` <span class="rnd-h2h-tooltip-evt-assist">(${e.assist})</span>`;
            t += `</span></div>`;
        });
        if (goals.length && cards.length) t += '<div class="rnd-h2h-tooltip-divider"></div>';
        cards.forEach(e => {
            const icon = e.type === 'yellow' ? '🟡' : '🔴';
            const sideClass = e.isHome ? '' : ' away-evt';
            t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
            t += `<span class="rnd-h2h-tooltip-evt-min">${e.min}'</span>`;
            t += `<span class="rnd-h2h-tooltip-evt-icon">${icon}</span>`;
            t += `<span class="rnd-h2h-tooltip-evt-text">${e.name}</span>`;
            t += `</div>`;
        });
        t += '</div>';
        return t;
    },

    /**
     * Count non-empty text lines in a segment.
     * @param {object} seg
     * @returns {number}
     */
    countSegmentLines(seg) {
        return Math.max(1, (seg?.text || []).filter(line => line && line.trim()).length);
    },

    /**
     * Return segment line ranges inside a play.
     * @param {object} play
     * @returns {Array<{ seg: object, startLineIdx: number, endLineIdx: number }>}
     */
    getSegmentRanges(play) {
        let lineCursor = 0;
        return (play?.segments || []).map(seg => {
            const startLineIdx = lineCursor;
            const endLineIdx = lineCursor + this.countSegmentLines(seg) - 1;
            lineCursor = endLineIdx + 1;
            return { seg, startLineIdx, endLineIdx };
        });
    },

    /**
     * Flatten all actions from a play into a single array.
     * @param {object} play
     * @returns {Array<object>}
     */
    getPlayActions(play) {
        return (play?.segments || []).flatMap(seg => seg.actions || []);
    },

    /**
     * Return minute keys sorted numerically.
     * @param {object} plays
     * @returns {string[]}
     */
    getSortedMinuteKeys(plays) {
        return Object.keys(plays || {}).sort((a, b) => Number(a) - Number(b));
    },

    /**
     * Group visible events into a minute-keyed plays object.
     * @param {Array<object>} visibleEvents
     * @returns {object}
     */
    buildVisiblePlaysFromEvents(visibleEvents) {
        const visible = {};
        for (const evt of (visibleEvents || [])) {
            const minKey = String(evt.min);
            if (!visible[minKey]) visible[minKey] = [];
            visible[minKey].push(evt.visiblePlay);
        }
        return visible;
    },


    /**
     * Build a visible snapshot of plays for the current live step.
     * Returned plays preserve ordering and include only currently visible segments.
     * @param {object} plays
     * @param {number} [curMin]
     * @param {number} [curEvtIdx]
     * @param {number} [curLineIdx]
     * @returns {object}
     */
    buildVisiblePlays(plays, curMin = 999, curEvtIdx = 999, curLineIdx = 999) {

    },

    /**
     * Check if an event or event line is visible at the current live step.
     * @param {number} evtMin    — minute of the event
     * @param {number} evtIdx    — event index within that minute
     * @param {number} curMin    — current live minute
     * @param {number} curEvtIdx — current live event index
     * @param {number} [curLineIdx=999] — current visible line index within the event
     * @param {number} [evtLineIdx=-1]  — tested line index within the event
     * @returns {boolean}
     */
    isEventVisible(evtMin, evtIdx, curMin, curEvtIdx, curLineIdx = 999, evtLineIdx = -1) {
        if (evtMin < curMin) return true;
        if (evtMin > curMin) return false;
        if (evtIdx < curEvtIdx) return true;
        if (evtIdx > curEvtIdx) return false;
        return evtLineIdx <= curLineIdx;
    },

    /**
     * Build a playerId → displayName lookup from match lineup data.
     * @param {object} mData — match data with .lineup.home and .lineup.away
     * @returns {{ [playerId: string]: string }}
     */
    buildPlayerNames(mData) {
        const names = {};
        ['home', 'away'].forEach(side => {
            const lineup = mData.lineup?.[side] || mData.teams?.[side]?.lineup || {};
            Object.values(lineup).forEach(p => {
                names[p.player_id] = p.nameLast || p.name;
            });
        });
        return names;
    },

    /**
     * Build routineMap and positionMap for all players in a match.
     * Both keyed by stringified player_id.
     * @param {object} mData — match data with .allPlayers array
     * @returns {{ routineMap: Map<string,number>, positionMap: Map<string,string> }}
     */
    buildMatchMaps(mData) {
        const routineMap = new Map();
        const positionMap = new Map();
        (mData.allPlayers || []).forEach(p => {
            const id = String(p.player_id);
            routineMap.set(id, parseFloat(p.routine));
            if (p.fp) positionMap.set(id, p.fp);
        });
        return { routineMap, positionMap };
    },

    /**
     * Enrich a raw tooltip player object with match-lineup overrides then normalize.
     * Applies routine + favposition overrides from the given maps, then calls
     * TmPlayerService.normalizePlayer to compute skills, r5, rec, isGK, etc.
     * @param {object} rawData      — result from fetchTooltip(pid):  { player, ... }
     * @param {string} pid          — stringified player id
     * @param {Map}    routineMap   — pid → routine float
     * @param {Map}    positionMap  — pid → favposition string
     * @returns {object} enriched player object
     */
    enrichMatchPlayer(rawData, pid, routineMap, positionMap) {
        const player = JSON.parse(JSON.stringify(rawData.player));
        if (routineMap.has(pid)) player.routine = String(routineMap.get(pid));
        if (positionMap.has(pid)) player.favposition = positionMap.get(pid);
        const DBPlayer = TmPlayerDB.get(parseInt(player.player_id));
        TmPlayerService.normalizePlayer(player, DBPlayer, { skipSync: true });
        return player;
    },

    /**
     * Build a playerId → { subInMin?, subOutMin? } map from all plays.
     * Does not apply visibility filtering — covers the full match timeline.
     * @param {object} plays — mData.plays keyed by minute string
     * @returns {{ [playerId: string]: { subInMin?: number, subOutMin?: number } }}
     */
    buildSubstitutionMap(plays) {
        const subMap = {};
        // for (const evt of this.buildVisibleEvents(plays)) {
        //     for (const act of evt.visibleActions) {
        //         if (act.action === 'subIn') {
        //             const id = String(act.by);
        //             if (!subMap[id]) subMap[id] = {};
        //             subMap[id].subInMin = evt.min;
        //         } else if (act.action === 'subOut') {
        //             const id = String(act.by);
        //             if (!subMap[id]) subMap[id] = {};
        //             subMap[id].subOutMin = evt.min;
        //         }
        //     }
        // }
        return subMap;
    },

    /**
     * Build the active lineup map for a side at the given live step.
     * Starts from the original XI and applies visible substitutions and red cards.
     * @param {object} mData
     * @param {string} side        — 'home' | 'away'
     * @param {number} [curMin]
      * @param {number} [curEvtIdx]
      * @param {number} [curLineIdx]
     * @returns {{ [playerId: string]: object }}
     */
    buildActiveLineup(mData, side) {
        const teamData = mData.teams[side] || {};
        const sourceLineup = mData.lineup?.[side] || teamData.lineup || {};
        const activeLineup = {};

        Object.values(sourceLineup)
            .filter(p => !p.position.includes('sub'))
            .forEach(p => {
                activeLineup[String(p.player_id)] = { ...p };
            });

        const visibleEvents = mData.visibleEvents || [];
        for (const evt of visibleEvents) {
            const subInAct = evt.visibleActions.find(a => a.action === 'subIn');
            const subOutAct = evt.visibleActions.find(a => a.action === 'subOut');
            if (subInAct && subOutAct) {
                const inId = String(subInAct.by);
                const outId = String(subOutAct.by);
                const outPlayer = activeLineup[outId];
                if (outPlayer) {
                    const inPlayer = sourceLineup[inId] || mData.lineup?.home?.[inId] || mData.lineup?.away?.[inId];
                    delete activeLineup[outId];
                    if (inPlayer) {
                        activeLineup[inId] = { ...inPlayer, position: outPlayer.position };
                    }
                }
            }
            for (const act of evt.visibleActions) {
                if (act.action === 'red' || act.action === 'yellowRed') {
                    delete activeLineup[String(act.by)];
                }
            }
        }

        return activeLineup;
    },

    /**
     * Enrich a single player with live event data for the current match step.
     * Adds grouped stats, per-minute entries, minsPlayed, and statsArray.
     * @param {object} player
     * @param {object} mData
     * @param {number} [curMin]
     * @param {number} [curEvtIdx]
     * @param {number} [curLineIdx]
     * @returns {object}
     */
    buildPlayerEventData(player, mData, curMin = 999, curEvtIdx = 999, curLineIdx = 999) {
        if (!player) return player;
        const plays = mData.plays || {};
        const sortedMins = Object.keys(plays).map(Number).sort((a, b) => a - b);
        const matchEndMin = mData.match_data?.regular_last_min || Math.max(...sortedMins, 90);
        const matchFuture = !plays || !Object.keys(plays).length;
        const subMap = matchFuture ? null : this.buildSubstitutionMap(plays);
        const pid = String(player.player_id);
        const entry = matchFuture ? {} : this.getPlayerStats(plays, pid, {
            upToMin: curMin,
            upToEvtIdx: curEvtIdx,
            upToLineIdx: curLineIdx,
            visiblePlays: mData.visiblePlays || {},
        });
        if (!matchFuture) {
            const subEvts = subMap[pid] || {};
            const isSub = player?.position?.includes('sub');
            entry.minsPlayed = isSub
                ? (subEvts.subInMin ? (subEvts.subOutMin || matchEndMin) - subEvts.subInMin : 0)
                : (subEvts.subOutMin || matchEndMin);
        }
        return {
            ...player,
            grouped: entry.grouped || [],
            perMinute: entry.perMinute || [],
            statsArray: entry.perMinute || [],
            minsPlayed: entry.minsPlayed || 0,
        };
    },

    /**
     * Resolve live tactical settings for a side at the current match step.
     * Currently mentality can change during the match; style and focus stay at base values.
     * @param {object} mData
     * @param {string} side
     * @param {number} [curMin]
     * @param {number} [curEvtIdx]
     * @param {number} [curLineIdx]
     * @returns {{ mentality: number, attackingStyle: any, focusSide: any, mentalityLabel: string, attackingStyleLabel: string, focusSideLabel: string }}
     */
    buildLiveTeamTactics(mData, side) {
        const teamData = mData.teams[side] || {};
        const clubId = String(teamData.id);
        let mentality = Number(teamData.mentality ?? 4);

        const visibleEvents = mData.visibleEvents || [];
        for (const evt of visibleEvents) {
            for (const act of evt.visibleActions) {
                if (act.action === 'mentality_change' && String(act.team) === clubId) {
                    mentality = Number(act.mentality);
                }
            }
        }

        const attackingStyle = teamData.attackingStyle ?? null;
        const focusSide = teamData.focusSide ?? null;
        return {
            mentality,
            attackingStyle,
            focusSide,
            mentalityLabel: TmConst.MENTALITY_MAP_LONG[mentality] || '?',
            attackingStyleLabel: TmConst.STYLE_MAP[attackingStyle] || '?',
            focusSideLabel: TmConst.FOCUS_MAP[focusSide] || '?',
        };
    },

    /**
     * Resolve the live score at the current match step.
     * @param {object} mData
     * @param {number} [curMin]
     * @param {number} [curEvtIdx]
     * @param {number} [curLineIdx]
     * @returns {{ homeGoals: number, awayGoals: number }}
     */
    buildLiveScore(mData, curMin = 999, curEvtIdx = 999, curLineIdx = 999) {
        const homeLineup = mData.lineup?.home || {};
        const homeIds = new Set(Object.keys(homeLineup));
        const homeId = String(mData.teams.home.id);
        const stats = this.extractStats(homeIds, homeId, {
            plays: mData.plays || {},
            upToMin: curMin,
            upToEvtIdx: curEvtIdx,
            upToLineIdx: curLineIdx,
            visiblePlays: mData.visiblePlays || {},
        });
        return {
            homeGoals: stats.homeGoals,
            awayGoals: stats.awayGoals,
        };
    },

    setVisiblePlays(mData, curMin = 999, curEvtIdx = 999, curLineIdx = 999) {
        // mData.visiblePlays = 
        // mData.visiblePlays = this.buildVisiblePlaysFromEvents(mData.visibleEvents);
    },
    deriveMatchData(liveState) {
        liveState.mData.teams = this.generateTeamData(liveState);
        this.setVisiblePlays(liveState);
        return liveState.mData;
    },

    /**
     * Compute enriched team data for a given side and match minute.
     * - starting: original starting XI (unchanged by subs)
     * - subs:     original substitutes (unchanged)
     * - lineup:   active players at curMin (subs applied, red-carded removed), sorted by r5 desc
     * Averages (avgR5, avgRtn, avgAge) and per-line R5 are based on the active lineup.
     * @param {object} mData
     * @param {string} side        — 'home' | 'away'
     * @param {number} [curMin]
    * @param {number} [curEvtIdx]
    * @param {number} [curLineIdx]
     * @returns {object} team data object
     */
    generateTeamData(liveState) {
        const { mData, curMin, curEvtIdx, curLineIdx } = liveState;
        const buildTeam = side => {
            const teamData = mData.teams[side];
            const sourceLineup = mData.lineup?.[side] || teamData.lineup || {};
            const liveScore = null;
            // const liveScore = this.buildLiveScore(mData, curMin, curEvtIdx, curLineIdx);

            const GK_POS = new Set(['gk']);
            const DEF_POS = new Set(['dl', 'dr', 'dc', 'dcl', 'dcr']);
            const MID_POS = new Set(['dml', 'dmr', 'dmc', 'dmcl', 'dmcr', 'ml', 'mr', 'mc', 'mcl', 'mcr', 'oml', 'omr', 'omc', 'omcl', 'omcr']);
            const ATT_POS = new Set(['fcl', 'fc', 'fcr']);
            const getLine = (pos) => {
                if (GK_POS.has(pos)) return 'GK';
                if (DEF_POS.has(pos)) return 'DEF';
                if (MID_POS.has(pos)) return 'MID';
                if (ATT_POS.has(pos)) return 'ATT';
                return 'SUB';
            };
            const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

            // Fixed: original starters and subs (unaffected by match events)
            const allPlayers = Object.values(sourceLineup).map(player => {
                return this.buildPlayerEventData(player, mData, curMin, curEvtIdx, curLineIdx);
            });
            const starting = allPlayers
                .filter(p => !p.position.includes('sub'))
                .map(p => ({ ...p, line: getLine(p.position) }));
            const subs = allPlayers
                .filter(p => p.position.includes('sub'))
                .map(p => ({ ...p, line: getLine((p.fp || '').split(',')[0].toLowerCase()) }))
                .sort((a, b) => b.r5 - a.r5);

            const liveTactics = this.buildLiveTeamTactics(mData, side);
            const activeLineup = this.buildActiveLineup(mData, side);
            const lineup = Object.values(activeLineup)
                .map(player => this.buildPlayerEventData(player, mData, curMin, curEvtIdx, curLineIdx))
                .map(p => ({ ...p, line: getLine(p.position) }))
                .sort((a, b) => b.r5 - a.r5);

            const detectFormation = (players) => {
                let d = 0, m = 0, a = 0;
                players.forEach(p => {
                    if (p.line === 'DEF') d++;
                    else if (p.line === 'MID') m++;
                    else if (p.line === 'ATT') a++;
                });
                return `${d}-${m}-${a}`;
            };

            const calcForm = (form) => {
                if (!form?.length) return { dots: [], pts: 0, last5: 0 };
                const dots = form.map(f => f.result);
                const pts = dots.reduce((s, r) => s + (r === 'w' ? 3 : r === 'd' ? 1 : 0), 0);
                const last5 = dots.slice(-5).reduce((s, r) => s + (r === 'w' ? 3 : r === 'd' ? 1 : 0), 0);
                return { dots, pts, last5 };
            };

            const team = {
                id: teamData.id,
                name: teamData.club_name || teamData.name,
                color: teamData.color,
                goals: side === 'home' ? liveScore?.homeGoals : liveScore?.awayGoals,
                goalsAgainst: side === 'home' ? liveScore?.awayGoals : liveScore?.homeGoals,
                lineup,
                starting,
                subs,
                avgAge: avg(starting.map(p => p.age)) / 12,
                avgRtn: avg(lineup.map(p => p.routine)),
                avgR5: avg(lineup.map(p => p.r5)),
                subsR5: avg(subs.map(p => p.r5)),
                formation: detectFormation(lineup),
                form: calcForm(teamData.form),
                attackingStyle: liveTactics.attackingStyle,
                mentality: liveTactics.mentality,
                focusSide: liveTactics.focusSide,
                attackingStyleLabel: liveTactics.attackingStyleLabel,
                mentalityLabel: liveTactics.mentalityLabel,
                focusSideLabel: liveTactics.focusSideLabel,
            };
            ['GK', 'DEF', 'MID', 'ATT'].forEach(line => {
                team[line] = avg(lineup.filter(p => p.line === line).map(p => p.r5));
            });
            return team;
        }

        liveState.mData.teams.home = buildTeam('home');
        liveState.mData.teams.away = buildTeam('away');

        return liveState.mData.teams;
    },

    /**
     * Build a player face image URL from udseende2 appearance data.
     * @param {object} p         — player object (needs .udseende2, .age)
     * @param {string} colorHex  — club color hex (with or without #)
     * @param {number} [w=96]    — image width in pixels
     * @returns {string} full URL
     */
    faceUrl(p, colorHex, w = 96) {
        const u = (p && p.udseende2) || {};
        const clr = String(colorHex).replace('#', '');
        return `https://trophymanager.com/pics/player_pic2.php?face=${u.face || 1}&nose=${u.nose || 1}&eyes=${u.eyes || 1}&ears=${u.ears || 1}&mouth=${u.mouth || 1}&brows=${u.brows || 1}&hcolor=${u.hair_color || 1}&scolor=${u.skin_color || 1}&hair=${u.hair || 1}&age=${(p && p.age) || 25}&rgb=${clr}&w=${w}`;
    },

};