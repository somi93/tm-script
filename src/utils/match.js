import { TmConst } from '../lib/tm-constants.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmPlayerService } from '../services/player.js';

// tm-match-utils.js — Shared match event parsing utilities
// Depends on: TmPlayerDB, TmPlayerService (for enrichMatchPlayer)
// Exposed as: TmMatchUtils

export const TmMatchUtils = {

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
        const lineup = opts.lineup || null;
        const plays = opts.plays || {};
        const { upToMin = 999, upToEvtIdx = 999 } = opts;
        const self = this;

        for (const minKey of Object.keys(plays)) {
            const eMin = Number(minKey);
            if (eMin > upToMin) continue;
            for (const play of (plays[minKey] || [])) {
                if (!self.isEventVisible(eMin, play.reportEvtIdx, upToMin, upToEvtIdx)) continue;
                const home = String(play.team) === homeId;
                const isPenalty = /^p_/.test(play.style);

                if (play.outcome === 'goal') {
                    if (home) stats.homeGoals++; else stats.awayGoals++;
                    if (home) stats.homeShots++; else stats.awayShots++;
                    if (home) stats.homeSoT++; else stats.awaySoT++;
                    if (isPenalty) { if (home) stats.homePenalties++; else stats.awayPenalties++; }
                    if (lineup) {
                        const scorer = play.segments.flatMap(s => s.actions).find(a => a.action === 'goal')?.by;
                        stats.events.push({ min: eMin, icon: '⚽', name: self.resolvePlayerName(lineup, scorer), side: home ? 'home' : 'away' });
                    }
                } else if (play.outcome === 'shot') {
                    if (home) stats.homeShots++; else stats.awayShots++;
                    const shotAct = play.segments.flatMap(s => s.actions).find(a => a.action === 'shot');
                    if (shotAct?.onTarget) { if (home) stats.homeSoT++; else stats.awaySoT++; }
                }

                for (const seg of play.segments) {
                    for (const act of seg.actions) {
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
        }

        return stats;
    },

    getPlayerStats(plays, pid, opts = {}) {
        const { upToMin = 999, upToEvtIdx = 999 } = opts;
        const perMinute = Object.entries(plays).flatMap(([minKey, minPlays]) => {
            const eMin = Number(minKey);
            if (eMin > upToMin) return [];
            return (minPlays || [])
                .filter(play => this.isEventVisible(eMin, play.reportEvtIdx, upToMin, upToEvtIdx))
                .flatMap(({ segments }) => segments.flatMap(seg => {
                    const acts = seg.actions.filter(a => a.by === pid);
                    return acts.length ? [Object.assign({ min: eMin }, ...acts.map(({ action, by, ...rest }) => ({ [action]: true, ...rest })))] : [];
                }));
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
            yellowCards: e => e.yellow || e.yellowRed,
            redCards: e => e.red || e.yellowRed,
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
     * Check if an event at (evtMin, evtIdx) is visible at the current live step.
     * @param {number} evtMin    — minute of the event
     * @param {number} evtIdx    — event index within that minute
     * @param {number} curMin    — current live minute
     * @param {number} curEvtIdx — current live event index
     * @returns {boolean}
     */
    isEventVisible(evtMin, evtIdx, curMin, curEvtIdx) {
        if (evtMin < curMin) return true;
        if (evtMin === curMin && evtIdx <= curEvtIdx) return true;
        return false;
    },

    /**
     * Build a playerId → displayName lookup from match lineup data.
     * @param {object} mData — match data with .lineup.home and .lineup.away
     * @returns {{ [playerId: string]: string }}
     */
    buildPlayerNames(mData) {
        const names = {};
        ['home', 'away'].forEach(side => {
            Object.values(mData.teams[side].lineup).forEach(p => {
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
        for (const minKey of Object.keys(plays || {})) {
            const min = Number(minKey);
            for (const play of (plays[minKey] || [])) {
                for (const seg of play.segments) {
                    for (const act of seg.actions) {
                        if (act.action === 'subIn') {
                            const id = String(act.by);
                            if (!subMap[id]) subMap[id] = {};
                            subMap[id].subInMin = min;
                        } else if (act.action === 'subOut') {
                            const id = String(act.by);
                            if (!subMap[id]) subMap[id] = {};
                            subMap[id].subOutMin = min;
                        }
                    }
                }
            }
        }
        return subMap;
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