import { TmConst } from '../lib/tm-constants.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmPlayerService } from '../services/player.js';
import { TmLib } from '../lib/tm-lib.js';
import { POSITION_MAP } from '../constants/player.js';

// tm-match-utils.js — Shared match event parsing utilities
// Depends on: TmPlayerDB, TmPlayerService (for)
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
     * Returns true if the given player id is in the home side's lineup.
     * @param {Set<string>} homeIds — Set of home player ids as strings
     * @param {string|number} pid
     * @returns {boolean}
     */
    isHome(homeIds, pid) {
        return homeIds.has(String(pid));
    },

    extractStats(mData, teamData) {
        const teamId = String(teamData.id);
        const acts = (mData.actions || []).filter(a => String(a.teamId) === teamId);

        // Build per-style advanced breakdown from visiblePlays
        const { ATTACK_STYLES, STYLE_ORDER } = TmConst;
        const advanced = {};
        STYLE_ORDER.forEach(s => { advanced[s] = { a: 0, sh: 0, l: 0, g: 0, events: [] }; });
        for (const [minKey, plays] of Object.entries(mData.visiblePlays || {})) {
            const eMin = Number(minKey);
            (plays || []).forEach(play => {
                if (String(play.team) !== teamId) return;
                let label;
                if (/^p_/.test(play.style)) {
                    label = 'Penalties';
                } else {
                    const entry = ATTACK_STYLES.find(s => s.key === play.style);
                    if (!entry) return;
                    label = entry.label;
                }
                const d = advanced[label];
                d.a++;
                if (play.outcome === 'goal') { d.g++; d.sh++; }
                else if (play.outcome === 'shot') d.sh++;
                else d.l++;
                d.events.push({ min: eMin, evt: play, evtIdx: play.reportEvtIdx, result: play.outcome });
            });
        }

        return {
            goals: acts.filter(a => a.action === 'shot' && a.goal).length,
            shots: acts.filter(a => a.action === 'shot').length,
            shotsOnTarget: acts.filter(a => a.action === 'shot' && a.onTarget).length,
            saves: acts.filter(a => a.action === 'save').length,
            passes: acts.filter(a => a.action === 'pass').length,
            passesCompleted: acts.filter(a => a.action === 'pass' && a.success).length,
            crosses: acts.filter(a => a.action === 'cross').length,
            crossesCompleted: acts.filter(a => a.action === 'cross' && a.success).length,
            fouls: acts.filter(a => a.action === 'foul').length,
            yellowCards: acts.filter(a => a.action === 'yellow' || a.action === 'yellowRed').length,
            redCards: acts.filter(a => a.action === 'red' || a.action === 'yellowRed').length,
            advanced,
        };
    },
    getPlayerStats(liveState, player) {
        const { mData } = liveState;
        const pid = String(player.id || player.player_id);
        const actions = (mData.actions || []).filter(a => String(a.by) === pid);
        const perMinute = actions.map(({ action, by, teamId, ...rest }) => ({ [action]: true, ...rest }));

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

        const plays = mData.plays || {};
        const sortedMins = Object.keys(plays).map(Number).sort((a, b) => a - b);
        const matchEndMin = mData.match_data?.regular_last_min || Math.max(...sortedMins, 90);
        const subInAct = actions.find(a => a.action === 'subIn');
        const subOutAct = actions.find(a => a.action === 'subOut');
        const originalPos = player.originalPosition || player.position;
        let minsPlayed;
        if (subInAct) {
            minsPlayed = (subOutAct ? subOutAct.min : matchEndMin) - (subInAct.min || 0);
        } else if (/^sub/.test(originalPos)) {
            minsPlayed = 0;
        } else {
            minsPlayed = subOutAct ? subOutAct.min : matchEndMin;
        }

        const entry = { perMinute, grouped, minsPlayed };

        const posKey = (player.position || '').split(',')[0].toLowerCase().replace(/[^a-z]/g, '');
        const posEntry = POSITION_MAP[posKey]
            || POSITION_MAP[(player.fp || '').split(',')[0].toLowerCase().replace(/[^a-z]/g, '')];
        const r5 = (posEntry && player.skills?.length && player.asi)
            ? Number(TmLib.calculatePlayerR5(posEntry, player))
            : null;


        console.log('Player actions:', {
            ...player,
            grouped: entry.grouped || [],
            perMinute: entry.perMinute || [],
            statsArray: entry.perMinute || [],
            minsPlayed: entry.minsPlayed || 0,
            r5,
        });
        return {
            ...player,
            grouped: entry.grouped || [],
            perMinute: entry.perMinute || [],
            statsArray: entry.perMinute || [],
            minsPlayed: entry.minsPlayed || 0,
            r5,
        };
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
     * Build the active lineup map for a side at the given live step.
     * Starts from the original XI and applies visible substitutions and red cards.
     * @param {object} mData
     * @param {string} side        — 'home' | 'away'
     * @param {number} [curMin]
      * @param {number} [curEvtIdx]
      * @param {number} [curLineIdx]
     * @returns {{ [playerId: string]: object }}
     */
    buildActiveLineup(liveState, side) {
        const { mData } = liveState;
        const sourceLineup = mData.teams[side].lineup || {};
        // Deep-copy all players and record original position for minsPlayed calculation
        const players = Object.values(sourceLineup).map(p => ({ ...p, originalPosition: p.position }));
        const teamId = String(mData.teams[side].id);
        const teamActions = (mData.actions || []).filter(a => String(a.teamId) === String(teamId));
        // Track which sub slots are already occupied in the original lineup
        const usedSubSlots = new Set(
            players.filter(p => /^sub\d+$/.test(p.position)).map(p => p.position)
        );
        const getNextSubSlot = () => {
            for (let i = 1; i <= 15; i++) {
                const slot = `sub${i}`;
                if (!usedSubSlots.has(slot)) { usedSubSlots.add(slot); return slot; }
            }
            return 'sub99';
        };
        // Process actions in order: subOut/red → demote to bench; positionChange → set position
        for (const act of teamActions) {
            const p = players.find(x => String(x.player_id) === String(act.by));
            if (!p) continue;
            if (act.action === 'subOut' || act.action === 'red' || act.action === 'yellowRed') {
                p.position = getNextSubSlot();
            } else if (act.action === 'positionChange' && act.position) {
                p.position = act.position;
            }
        }
        return players;
    },

    /**
     * Resolve live tactical settings for a side at the current match step.
     * Currently mentality can change during the match; style and focus stay at base values.
    * @param {object} liveState
    * @param {string} side        — 'home' | 'away'
     * @returns {{ mentality: number }}
     */
    buildLiveTeamTactics(liveState, side) {
        const { mData } = liveState || {};
        const mentalityActions = mData.actions.filter(a => a.action === 'mentality_change' && String(a.team) === String(mData.teams?.[side]?.id));
        if (!mentalityActions.length) return null;
        return mentalityActions[mentalityActions.length - 1].mentality;
    },

    /**
     * Resolve the live score at the current match step.
     * @param {object} mData
     * @param {number} [curMin]
     * @param {number} [curEvtIdx]
     * @param {number} [curLineIdx]
     * @returns {{ homeGoals: number, awayGoals: number }}
     */
    buildLiveScore(liveState) {
        const { mData } = liveState;
        const homeId = String(mData.teams.home.id);
        const awayId = String(mData.teams.away.id);
        const goals = (mData.actions || []).filter(a => a.action === 'shot' && a.goal);
        return {
            homeGoals: goals.filter(g => String(g.teamId) === homeId).length,
            awayGoals: goals.filter(g => String(g.teamId) === awayId).length,
        };
    },

    getVisiblePlays(liveState) {
        const { mData, min: curMin, curEvtIdx, curLineIdx } = liveState;
        const playedMinutes = Object.keys(mData.plays || {}).map(Number).filter(min => min <= curMin);
        const visiblePlays = {};
        playedMinutes.forEach(min => {
            const plays = mData.plays?.[String(min)] || [];
            const visibleEvents = plays.filter(play => {
                const evtIdx = play.reportEvtIdx ?? null;
                return this.isEventVisible(min, evtIdx, curMin, curEvtIdx, curLineIdx);
            });
            visibleEvents.forEach(ev => {
                const evtIdx = ev.reportEvtIdx ?? null;
                const segRanges = this.getSegmentRanges(ev);
                const visibleSegments = segRanges.filter(r =>
                    this.isEventVisible(min, evtIdx, curMin, curEvtIdx, curLineIdx, r.endLineIdx + 1)
                );
                ev.visiblePlay = { ...ev, segments: visibleSegments.map(r => r.seg) };
            });
            visiblePlays[String(min)] = visibleEvents.map(ev => ev.visiblePlay);
        });
        return visiblePlays;
    },
    deriveMatchData(liveState) {
        liveState.mData.visiblePlays = this.getVisiblePlays(liveState);
        liveState.mData.actions = [];
        Object.entries(liveState.mData.visiblePlays || {}).forEach(([minKey, plays]) => {
            const min = Number(minKey);
            plays.forEach(play => {
                play.segments.forEach(seg => {
                    seg.actions.forEach(act => {
                        let teamId = null;
                        const playerInvolved = act.by;
                        if (playerInvolved) {
                            let playerName = "";
                            if (liveState.mData.teams.home.lineup.some(p => Number(p.id) === Number(playerInvolved))) {
                                teamId = liveState.mData.teams.home.id;
                                const playerName = liveState.mData.teams.home.lineup.find(p => Number(p.id) === Number(playerInvolved))?.name ?? null;
                            } else {
                                teamId = liveState.mData.teams.away.id;
                                const playerName = liveState.mData.teams.away.lineup.find(p => Number(p.id) === Number(playerInvolved))?.name ?? null;
                            }
                        }
                        const home = teamId !== null && String(teamId) === String(liveState.mData.teams.home.id);
                        liveState.mData.actions.push({ ...act, teamId, home, by: act.by, player: playerName, min });
                    });
                });
            });
        });
        liveState.mData.teams = this.generateTeamData(liveState);
        console.log('Derived match data:', liveState.mData);
        return liveState.mData;
    },

    /**
     * Compute enriched team data.
     * @param {object} liveState
     * @returns {object} team data object
     */
    generateTeamData(liveState) {
        const { mData } = liveState;
        const buildTeam = side => {
            const teamData = mData.teams[side];
            const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

            // Build all players with live positions applied, then enrich with event data
            const lineup = this.buildActiveLineup(liveState, side)
                .map(player => this.getPlayerStats(liveState, player))
                .sort((a, b) => {
                    const aIsSub = /^sub\d+$/.test(a.position);
                    const bIsSub = /^sub\d+$/.test(b.position);
                    if (aIsSub !== bIsSub) return aIsSub ? 1 : -1;
                    if (aIsSub) {
                        return (parseInt(a.position.slice(3)) || 99) - (parseInt(b.position.slice(3)) || 99);
                    }
                    const aPosKey = (a.position || '').toLowerCase().replace(/[^a-z]/g, '');
                    const bPosKey = (b.position || '').toLowerCase().replace(/[^a-z]/g, '');
                    const aOrder = POSITION_MAP[aPosKey]?.ordering ?? 99;
                    const bOrder = POSITION_MAP[bPosKey]?.ordering ?? 99;
                    return aOrder - bOrder;
                });

            const onPitch = lineup.filter(p => !/^sub\d+$/.test(p.position));
            const onBench = lineup.filter(p => /^sub\d+$/.test(p.position));
            const newMentality = this.buildLiveTeamTactics(liveState, side);
            if (newMentality !== null) {
                liveState.mData.teams[side].mentality = newMentality;
            }

            const goals = liveState.mData.actions.filter(a => a.goal);
            const mentality = liveState.mData.teams[side].mentality ?? 4;
            const attackingStyle = teamData.attackingStyle ?? null;
            const focusSide = teamData.focusSide ?? null;
            const stats = this.extractStats(mData, teamData);

            const team = {
                id: teamData.id,
                name: teamData.club_name || teamData.name,
                color: teamData.color,
                goals: goals.filter(g => String(g.teamId) === String(teamData.id)).length,
                goalsAgainst: goals.filter(g => String(g.teamId) !== String(teamData.id)).length,
                lineup,
                stats,
                avgAge: avg(onPitch.map(p => p.age)) / 12,
                avgRtn: avg(onPitch.map(p => p.routine)),
                avgR5: avg(onPitch.map(p => p.r5)),
                subsR5: avg(onBench.map(p => p.r5)),
                formation: '4-4-2', // TODO: derive from lineup positions
                mentality,
                attackingStyle,
                focusSide,
                mentalityLabel: TmConst.MENTALITY_MAP_LONG?.[mentality] || '?',
                attackingStyleLabel: TmConst.STYLE_MAP?.[attackingStyle] || '?',
                focusSideLabel: TmConst.FOCUS_MAP?.[focusSide] || '?',
            };
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