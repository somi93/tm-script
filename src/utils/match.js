import { TmConst } from '../lib/tm-constants.js';
import { TmLib } from '../lib/tm-lib.js';
import { POSITION_MAP } from '../constants/player.js';

// tm-match-utils.js — Shared match event parsing utilities
// Exposed as: TmMatchUtils

export const TmMatchUtils = {

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
        const teamId = String(teamData.club?.id ?? teamData.id);
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
                d.events.push({ min: eMin, evt: play, evtIdx: play.reportEventIndex, result: play.outcome });
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
    getMatchEndMin(mData) {
        const playMins = Object.keys(mData?.plays || {}).map(Number).filter(Number.isFinite);
        const reportMins = Object.keys(mData?.report || {}).map(Number).filter(Number.isFinite);
        const actionMins = (mData?.actions || []).map(a => Number(a.min)).filter(Number.isFinite);
        const candidates = [
            Number(mData?.duration?.total),
            Number(mData?.duration?.regular),
            Number(mData?.liveMin),
            ...playMins,
            ...reportMins,
            ...actionMins,
        ].filter(n => Number.isFinite(n) && n > 0);
        return candidates.length ? Math.max(90, ...candidates) : 90;
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

    const matchEndMin = this.getMatchEndMin(mData);
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
        const all = [
            ...goals.map(e => ({ ...e, _type: 'goal' })),
            ...cards.map(e => ({ ...e, _type: 'card' })),
        ].sort((a, b) => Number(a.minute) - Number(b.minute));
        if (!all.length) return '';
        let t = '<div class="rnd-h2h-tooltip-events">';
        all.forEach(e => {
            const sideClass = e.isHome ? '' : ' away-evt';
            t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
            t += `<span class="rnd-h2h-tooltip-evt-min">${e.minute}'</span>`;
            if (e._type === 'goal') {
                t += `<span class="rnd-h2h-tooltip-evt-icon">⚽</span>`;
                t += `<span class="rnd-h2h-tooltip-evt-text">${e.scorer_name || ''}`;
                if (e.assist_id && e.assist_id !== '') {
                    t += ` <span class="rnd-h2h-tooltip-evt-assist">(${e.score})</span>`;
                } else {
                    t += ` <span class="rnd-h2h-tooltip-evt-assist">${e.score}</span>`;
                }
                t += `</span>`;
            } else {
                const icon = e.score === 'yellow' ? '🟡' : e.score === 'orange' ? '🟡🟡→🔴' : '🔴';
                t += `<span class="rnd-h2h-tooltip-evt-icon">${icon}</span>`;
                t += `<span class="rnd-h2h-tooltip-evt-text">${e.scorer_name || ''}</span>`;
            }
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
        const all = [...goals, ...cards].sort((a, b) => a.min - b.min);
        if (!all.length) return '';
        let t = '<div class="rnd-h2h-tooltip-events">';
        all.forEach(e => {
            const sideClass = e.isHome ? '' : ' away-evt';
            t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
            t += `<span class="rnd-h2h-tooltip-evt-min">${e.min}'</span>`;
            if (e.type === 'goal') {
                t += `<span class="rnd-h2h-tooltip-evt-icon">⚽</span>`;
                t += `<span class="rnd-h2h-tooltip-evt-text">${e.name}`;
                if (e.assist) t += ` <span class="rnd-h2h-tooltip-evt-assist">(${e.assist})</span>`;
                t += `</span>`;
            } else {
                const icon = e.type === 'yellow' ? '🟡' : '🔴';
                t += `<span class="rnd-h2h-tooltip-evt-icon">${icon}</span>`;
                t += `<span class="rnd-h2h-tooltip-evt-text">${e.name}</span>`;
            }
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
        const sourceLineup = mData[side]?.lineup || [];
        // Deep-copy all players and record original position for minsPlayed calculation
        const players = sourceLineup.map(p => ({ ...p, originalPosition: p.position }));
        const teamId = String(mData[side].club.id);
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
            const p = players.find(x => String(x.id) === String(act.by));
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
        const teamId = String(mData[side]?.club?.id);
        const mentalityActions = mData.actions.filter(a => a.action === 'mentality_change' && String(a.team) === teamId);
        if (!mentalityActions.length) return null;
        return mentalityActions[mentalityActions.length - 1].mentality;
    },

    getVisiblePlays(liveState) {
        const { mData, min: curMin, curEvtIdx, curLineIdx } = liveState;
        const playedMinutes = Object.keys(mData.plays || {}).map(Number).filter(min => min <= curMin);
        const visiblePlays = {};
        playedMinutes.forEach(min => {
            const plays = mData.plays?.[String(min)] || [];
            const visibleEvents = plays.filter(play => {
                const evtIdx = play.reportEventIndex ?? null;
                return this.isEventVisible(min, evtIdx, curMin, curEvtIdx, curLineIdx);
            });
            visibleEvents.forEach(ev => {
                const evtIdx = ev.reportEventIndex ?? null;
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
        const homeId = String(liveState.mData.home.club.id);
        const awayId = String(liveState.mData.away.club.id);
        Object.entries(liveState.mData.visiblePlays || {}).forEach(([minKey, plays]) => {
            const min = Number(minKey);
            plays.forEach(play => {
                play.segments.forEach(seg => {
                    seg.actions.forEach(act => {
                        let teamId = null;
                        const playerInvolved = act.by;
                        let playerName = '';
                        if (playerInvolved) {
                            const inHome = liveState.mData.home.lineup.some(p => String(p.id) === String(playerInvolved));
                            if (inHome) {
                                teamId = homeId;
                                playerName = liveState.mData.home.lineup.find(p => String(p.id) === String(playerInvolved))?.name ?? null;
                            } else {
                                teamId = awayId;
                                playerName = liveState.mData.away.lineup.find(p => String(p.id) === String(playerInvolved))?.name ?? null;
                            }
                        }
                        const home = teamId !== null && teamId === homeId;
                        liveState.mData.actions.push({ ...act, teamId, home, player: playerName, min, evtIdx: play.reportEventIndex });
                    });
                });
            });
        });
        liveState.mData.teams = this.generateTeamData(liveState);
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
            const sideData = mData[side]; // canonical Match side
            const clubId = String(sideData.club.id);
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
            const mentality = (newMentality !== null ? newMentality : sideData.tactics.mentality) ?? 4;
            const attackingStyle = sideData.tactics.style ?? null;
            const focusSide = sideData.tactics.focus ?? null;

            // teamData shape expected by extractStats
            const teamData = { id: sideData.club.id };
            const stats = this.extractStats(mData, teamData);

            const goals = liveState.mData.actions.filter(a => a.goal);
            return {
                id: sideData.club.id,
                name: sideData.club.name,
                color: sideData.color,
                goals: goals.filter(g => String(g.teamId) === clubId).length,
                goalsAgainst: goals.filter(g => String(g.teamId) !== clubId).length,
                lineup,
                stats,
                avgAge: avg(onPitch.map(p => {
                    const years = Number(p.age);
                    const months = Number(p.month);
                    if (!Number.isFinite(years) || years <= 0) return null;
                    return Number.isFinite(months) && months >= 0 ? years + (months / 12) : years;
                })),
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
        };

        if (!mData.teams) mData.teams = {};
        mData.teams.home = buildTeam('home');
        mData.teams.away = buildTeam('away');
        return mData.teams;
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