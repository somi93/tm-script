import { TmConst } from '../../lib/tm-constants.js';

// tm-match-utils.js — Shared match event parsing utilities
// Depends on: nothing
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
         * Iterate all visible events in a match report, in minute order.
         * Calls cb(min, si, evt) for each event that passes the visibility filter.
         *
         * @param {object}   report          — mData.report keyed by minute string
         * @param {object}   [opts]
         * @param {number}   [opts.upToMin=999]        — stop processing after this minute
         * @param {number}   [opts.upToEvtIdx=999]     — secondary event index ceiling (used with isEventVisible)
         * @param {Function} [opts.isEventVisible]     — (min, si, upToMin, upToEvtIdx) => boolean
         * @param {Function} cb                        — (min, si, evt) => void
         */
        eachEvent(report, opts, cb) {
            if (typeof opts === 'function') { cb = opts; opts = {}; }
            const { upToMin = 999, upToEvtIdx = 999, isEventVisible = null } = opts;
            const sortedMins = Object.keys(report).map(Number).sort((a, b) => a - b);
            for (const min of sortedMins) {
                if (min > upToMin) break;
                const evts = report[String(min)] || [];
                evts.forEach((evt, si) => {
                    if (isEventVisible && !isEventVisible(min, si, upToMin, upToEvtIdx)) return;
                    cb(min, si, evt);
                });
            }
        },

        /**
         * Extract aggregated match statistics from a report object.
         *
         * @param {object}  report   — mData.report
         * @param {Set}     homeIds  — Set<string> of home player IDs
         * @param {string}  homeId   — home club ID (string) — used to identify shot ownership
         * @param {object}  [opts]
         * @param {number}  [opts.upToMin]         — see eachEvent
         * @param {number}  [opts.upToEvtIdx]      — see eachEvent
         * @param {Function}[opts.isEventVisible]  — see eachEvent
         * @param {object}  [opts.lineup]          — mData.lineup — if provided, events[] is populated with named entries
         * @returns {{ homeGoals, awayGoals, homeYellow, awayYellow, homeRed, awayRed,
         *            homeShots, awayShots, homeSoT, awaySoT,
         *            homeSetPieces, awaySetPieces, homePenalties, awayPenalties,
         *            events: Array<{min, icon, name, side}> }}
         */
        extractStats(report, homeIds, homeId, opts = {}) {
            const stats = {
                homeGoals: 0, awayGoals: 0,
                homeYellow: 0, awayYellow: 0, homeRed: 0, awayRed: 0,
                homeShots: 0, awayShots: 0, homeSoT: 0, awaySoT: 0,
                homeSetPieces: 0, awaySetPieces: 0, homePenalties: 0, awayPenalties: 0,
                events: [],
            };
            const lineup = opts.lineup || null;
            const self = this;
            this.eachEvent(report, opts, (min, si, evt) => {
                if (evt.goal) {
                    const home = self.isHome(homeIds, evt.goal.player);
                    if (home) stats.homeGoals++; else stats.awayGoals++;
                    if (evt.penalty) { if (home) stats.homePenalties++; else stats.awayPenalties++; }
                    if (lineup) stats.events.push({ min, icon: '⚽', name: self.resolvePlayerName(lineup, evt.goal.player), side: home ? 'home' : 'away' });
                }
                if (evt.yellow) {
                    const home = self.isHome(homeIds, evt.yellow);
                    if (home) stats.homeYellow++; else stats.awayYellow++;
                    if (lineup) stats.events.push({ min, icon: '🟨', name: self.resolvePlayerName(lineup, evt.yellow), side: home ? 'home' : 'away' });
                }
                if (evt.yellow_red) {
                    const home = self.isHome(homeIds, evt.yellow_red);
                    if (home) stats.homeRed++; else stats.awayRed++;
                    if (lineup) stats.events.push({ min, icon: '🟥', name: self.resolvePlayerName(lineup, evt.yellow_red), side: home ? 'home' : 'away' });
                }
                if (evt.red) {
                    const home = self.isHome(homeIds, evt.red);
                    if (home) stats.homeRed++; else stats.awayRed++;
                    if (lineup) stats.events.push({ min, icon: '🟥', name: self.resolvePlayerName(lineup, evt.red), side: home ? 'home' : 'away' });
                }
                if (evt.shot) {
                    const home = String(evt.shot.team) === homeId;
                    if (home) { stats.homeShots++; if (evt.shot.target === 'on') stats.homeSoT++; }
                    else { stats.awayShots++; if (evt.shot.target === 'on') stats.awaySoT++; }
                }
                if (evt.set_piece) {
                    const home = self.isHome(homeIds, evt.set_piece);
                    if (home) stats.homeSetPieces++; else stats.awaySetPieces++;
                }
            });
            return stats;
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
         * Build per-player event statistics from a match report.
         * Processes both video segments (pass/cross/finish/defwin/runduel/save/foul)
         * and evt.parameters (goals, assists, cards, set-pieces, penalties).
         *
         * @param {object}   report                  — mData.report keyed by minute string
         * @param {object}   [opts]
         * @param {Function} [opts.isEventVisible]   — (min, si, upToMin, upToEvtIdx) => bool
         * @param {number}   [opts.upToMin=999]       — ceiling arg for isEventVisible
         * @param {number}   [opts.upToEvtIdx=999]    — secondary ceiling arg
         * @param {string}   [opts.pidFilter]         — if set, only accumulate for this player ID
         * @param {boolean}  [opts.recordEvents=false] — if true, populate events[] per player
         * @returns {Object<string, object>}          — map of stringified playerId → statObject
         */
        buildPlayerEventStats(report, opts = {}) {
            const {
                isEventVisible = null,
                upToMin = 999,
                upToEvtIdx = 999,
                pidFilter = null,
                recordEvents = false,
            } = opts;

            const { PASS_VIDS, CROSS_VIDS, DEFWIN_VIDS, FINISH_VIDS, RUN_DUEL_VIDS } = TmConst;
            const pStats = {};

            const ensureP = (rawId) => {
                if (!rawId) return null;
                const id = String(rawId);
                if (pidFilter && id !== pidFilter) return null;
                if (!pStats[id]) {
                    pStats[id] = {
                        passesCompleted: 0, passesFailed: 0, crossesCompleted: 0, crossesFailed: 0,
                        shots: 0, shotsOnTarget: 0, shotsOffTarget: 0, shotsFoot: 0, shotsOnTargetFoot: 0, goalsFoot: 0, shotsHead: 0, shotsOnTargetHead: 0, goalsHead: 0,
                        saves: 0,
                        goals: 0, assists: 0, keyPasses: 0,
                        duelsWon: 0, duelsLost: 0, interceptions: 0, tackles: 0, headerClearances: 0, tackleFails: 0,
                        fouls: 0, yellowCards: 0, redCards: 0,
                        setpieceTakes: 0, freekickGoals: 0, penaltiesTaken: 0, penaltiesScored: 0,
                    };
                    if (recordEvents) pStats[id].events = [];
                }
                return pStats[id];
            };

            const addEvent = (rawId, min, si, evt, action) => {
                if (!recordEvents) return;
                const p = ensureP(rawId);
                if (p) p.events.push({ min, evtIdx: si, evt, action });
            };

            const sortedMins = Object.keys(report).map(Number).sort((a, b) => a - b);
            for (const min of sortedMins) {
                const evts = report[String(min)] || [];
                for (let si = 0; si < evts.length; si++) {
                    if (isEventVisible && !isEventVisible(min, si, upToMin, upToEvtIdx)) continue;
                    const evt = evts[si];
                    const vids = evt.chance?.video;
                    const evtHasShot = !!evt.shot;
                    const evtShotOnTarget = evt.shot?.target === 'on';

                    if (vids && Array.isArray(vids)) {
                        for (let vi = 0; vi < vids.length; vi++) {
                            const v = vids[vi];

                            // ── Passes ──
                            if (PASS_VIDS.test(v.video)) {
                                const rawId = /^gk(throw|kick)/.test(v.video) ? v.gk : v.att1;
                                const p = ensureP(rawId);
                                if (p) {
                                    const sid = String(rawId);
                                    const isPreshort = /^preshort/.test(v.video);
                                    const textLines = evt.chance?.text?.[vi] || [];
                                    if (isPreshort && !textLines.some(l => l.includes('[player=' + sid + ']'))) {
                                        // Skip — att1 in preshort is part of buildup, not the actual passer
                                    } else {
                                        const failed = vi + 1 < vids.length && DEFWIN_VIDS.test(vids[vi + 1].video);
                                        if (failed) { p.passesFailed++; addEvent(rawId, min, si, evt, 'pass_fail'); }
                                        else { p.passesCompleted++; if (evtHasShot) p.keyPasses++; addEvent(rawId, min, si, evt, 'pass_ok'); }
                                    }
                                }
                            }

                            // ── Crosses ──
                            if (CROSS_VIDS.test(v.video) && v.att1) {
                                const p = ensureP(v.att1);
                                if (p) {
                                    if (/^freekick/.test(v.video) && evtHasShot) {
                                        p.shots++; p.shotsFoot++;
                                        if (evtShotOnTarget) { p.shotsOnTarget++; p.shotsOnTargetFoot++; } else p.shotsOffTarget++;
                                        addEvent(v.att1, min, si, evt, 'shot');
                                    } else {
                                        const failed = vi + 1 < vids.length && DEFWIN_VIDS.test(vids[vi + 1].video);
                                        if (failed) { p.crossesFailed++; addEvent(v.att1, min, si, evt, 'cross_fail'); }
                                        else { p.crossesCompleted++; if (evtHasShot) p.keyPasses++; addEvent(v.att1, min, si, evt, 'cross_ok'); }
                                    }
                                }
                            }

                            // ── Finishes (shots) ──
                            if (FINISH_VIDS.test(v.video) && v.att1) {
                                const nextIsAlsoFinish = vi + 1 < vids.length && FINISH_VIDS.test(vids[vi + 1].video);
                                if (!nextIsAlsoFinish) {
                                    const p = ensureP(v.att1);
                                    if (p) {
                                        const isHead = /^header/.test(v.video);
                                        p.shots++;
                                        if (isHead) {
                                            p.shotsHead++;
                                            if (evtShotOnTarget) { p.shotsOnTarget++; p.shotsOnTargetHead++; } else p.shotsOffTarget++;
                                        } else {
                                            p.shotsFoot++;
                                            if (evtShotOnTarget) { p.shotsOnTarget++; p.shotsOnTargetFoot++; } else p.shotsOffTarget++;
                                        }
                                        const shooterId = String(v.att1);
                                        const hasGoalForShooter = !!evt.goal && String(evt.goal.player) === shooterId;
                                        if (!hasGoalForShooter) addEvent(v.att1, min, si, evt, 'shot');
                                    }
                                }
                            }

                            // ── Defensive actions (defwin) ──
                            if (DEFWIN_VIDS.test(v.video)) {
                                const prevVideo = vi > 0 ? vids[vi - 1].video : '';
                                const isFinrunBefore = RUN_DUEL_VIDS.test(prevVideo);
                                const isCornerkickBefore = /^cornerkick/.test(prevVideo);
                                const tLines = (evt.chance?.text || []).flat();
                                const winner = [v.def1, v.def2].find(d => d && tLines.some(l => l.includes('[player=' + d + ']')));
                                if (winner) {
                                    const p = ensureP(winner);
                                    if (p) {
                                        if (isFinrunBefore || !isCornerkickBefore) p.duelsWon++;
                                        const defwinTextLines = evt.chance?.text?.[vi] || [];
                                        const isHeader = defwinTextLines.some(l => /\bheader\b|\bhead(ed|s)?\b/i.test(l));
                                        if (/^defwin5$/.test(v.video) || isHeader) {
                                            p.headerClearances++; addEvent(winner, min, si, evt, 'header_clear');
                                        } else if (/^defwin(3|6)$/.test(v.video)) {
                                            p.tackles++; addEvent(winner, min, si, evt, 'tackle');
                                        } else {
                                            p.interceptions++; addEvent(winner, min, si, evt, 'intercept');
                                        }
                                    }
                                }
                            }

                            // ── Duel losses / tackle fails (run duel) ──
                            if (RUN_DUEL_VIDS.test(v.video)) {
                                const nextIsDefwin = vi + 1 < vids.length && DEFWIN_VIDS.test(vids[vi + 1].video);
                                if (!nextIsDefwin) {
                                    const prevVideo = vi > 0 ? vids[vi - 1].video : '';
                                    if (!/^cornerkick/.test(prevVideo)) {
                                        const tLines = (evt.chance?.text || []).flat();
                                        [v.def1, v.def2].forEach(d => {
                                            if (!d) return;
                                            const p = ensureP(d);
                                            if (p && tLines.some(l => l.includes('[player=' + d + ']'))) {
                                                p.duelsLost++; addEvent(d, min, si, evt, 'duel_lost');
                                            }
                                        });
                                    }
                                    const nextVid = vi + 1 < vids.length ? vids[vi + 1].video : '';
                                    if (FINISH_VIDS.test(nextVid) && v.def1) {
                                        const p = ensureP(v.def1);
                                        if (p) { p.tackleFails++; addEvent(v.def1, min, si, evt, 'tackle_fail'); }
                                    }
                                }
                            }

                            // ── Saves ──
                            if (/^save/.test(v.video) && v.gk) {
                                const p = ensureP(v.gk);
                                if (p) { p.saves++; addEvent(v.gk, min, si, evt, 'save'); }
                            }

                            // ── Fouls ──
                            if (/^foulcall/.test(v.video) && v.def1) {
                                const p = ensureP(v.def1);
                                if (p) { p.fouls++; addEvent(v.def1, min, si, evt, 'foul'); }
                            }
                        }
                    }

                    // ── Goals, assists, cards, set-pieces ──
                    {
                        const gPrefix = evt.type ? evt.type.replace(/[0-9]+.*/, '') : '';
                        if (evt.goal) {
                            const scorer = String(evt.goal.player);
                            const p = ensureP(scorer);
                            if (p) {
                                p.goals++;
                                if (!evt.penalty) {
                                    const evtVids = evt.chance?.video;
                                    const isHeaderGoal = evtVids && Array.isArray(evtVids) && evtVids.some(v => /^header/.test(v.video));
                                    if (isHeaderGoal) p.goalsHead++; else p.goalsFoot++;
                                }
                                if (gPrefix === 'dire') p.freekickGoals++;
                                addEvent(scorer, min, si, evt, 'goal');
                            }
                            if (evt.goal.assist) {
                                const ap = ensureP(evt.goal.assist);
                                if (ap) { ap.assists++; addEvent(evt.goal.assist, min, si, evt, 'assist'); }
                            }
                        }
                        if (evt.yellow) {
                            const p = ensureP(evt.yellow);
                            if (p) { p.yellowCards++; addEvent(evt.yellow, min, si, evt, 'yellow'); }
                        }
                        if (evt.yellow_red) {
                            const p = ensureP(evt.yellow_red);
                            if (p) { p.yellowCards++; p.redCards++; addEvent(evt.yellow_red, min, si, evt, 'red'); }
                        }
                        if (evt.red) {
                            const p = ensureP(evt.red);
                            if (p) { p.redCards++; addEvent(evt.red, min, si, evt, 'red'); }
                        }
                        if (evt.penalty) {
                            const p = ensureP(evt.penalty);
                            if (p) { p.penaltiesTaken++; if (evt.goal) p.penaltiesScored++; }
                        }
                        if (evt.set_piece && gPrefix === 'dire') {
                            const p = ensureP(evt.set_piece);
                            if (p) p.setpieceTakes++;
                        }
                    }
                }
            }

            return pStats;
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
                Object.values(mData.lineup[side]).forEach(p => {
                    names[p.player_id] = p.nameLast || p.name;
                });
            });
            return names;
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

        /**
         * Enrich a raw mData object with derived fields that would otherwise be
         * re-computed independently in every component.  Idempotent — safe to call
         * on a cached/already-normalized object.
         *
         * Adds:
         *   mData.club.home.color  — '#rrggbb'
         *   mData.club.away.color  — '#rrggbb'
         *   mData.homePlayerSet    — Set<string> of home player ids
         *   mData.awayPlayerSet    — Set<string> of away player ids
         *   mData.allPlayers       — Array of all lineup player objects (home then away)
         */
        /**
         * Promote each event's `parameters` array into direct properties on the event object.
         * Idempotent — safe to call multiple times. Mutates in place.
         * After normalization, callers can read evt.goal, evt.shot, evt.yellow, etc. directly.
         */
        normalizeReport(report) {
            for (const evts of Object.values(report || {})) {
                for (const evt of evts) {
                    if (!evt.parameters) continue;
                    for (const p of evt.parameters) {
                        if (p.goal !== undefined)             evt.goal             = p.goal;
                        if (p.shot !== undefined)             evt.shot             = p.shot;
                        if (p.yellow !== undefined)           evt.yellow           = p.yellow;
                        if (p.yellow_red !== undefined)       evt.yellow_red       = p.yellow_red;
                        if (p.red !== undefined)              evt.red              = p.red;
                        if (p.injury !== undefined)           evt.injury           = p.injury;
                        if (p.sub !== undefined)              evt.sub              = p.sub;
                        if (p.penalty !== undefined)          evt.penalty          = p.penalty;
                        if (p.set_piece !== undefined)        evt.set_piece        = p.set_piece;
                        if (p.mentality_change !== undefined) evt.mentality_change = p.mentality_change;
                    }
                }
            }
        },

        /**
         * Build the normalized plays structure from a raw match report.
         * Requires normalizeReport() to have been called first (so evt.goal, evt.shot, etc. are promoted).
         *
         * Output shape: { [minute: string]: Play[] }
         *   Play:    { team, style, outcome, segments }
         *   Segment: { clip, text: string[], actions: Action[] }
         *   Action:  { action, by?, to?, gk?, result?, method?, type?, player?, playerIn?, playerOut? }
         *
         * @param {object} report  — mData.report (post-normalizeReport)
         * @param {object} lineup  — mData.lineup with .home and .away player maps
         * @returns {object}       — normalized plays keyed by minute string
         */
        buildNormalizedPlays(report, lineup) {
            const { PASS_VIDS, CROSS_VIDS, DEFWIN_VIDS, FINISH_VIDS, RUN_DUEL_VIDS, SKIP_PREFIXES } = TmConst;

            // Build name lookup for [player=xxx] tag resolution
            const nameMap = {};
            ['home', 'away'].forEach(side => {
                Object.values(lineup?.[side] || {}).forEach(p => {
                    nameMap[String(p.player_id)] = p.nameLast || p.name || '?';
                });
            });
            const resolveText = (lines) =>
                (lines || []).map(l => l.replace(/\[player=(\d+)\]/g, (_, pid) => nameMap[pid] || pid));

            const result = {};
            const sortedMins = Object.keys(report || {}).map(Number).sort((a, b) => a - b);

            for (const min of sortedMins) {
                const evts  = report[String(min)] || [];
                const plays = [];

                evts.forEach((evt, reportEvtIdx) => {
                    const gPrefix = evt.type ? evt.type.replace(/[0-9]+.*/, '') : '';
                    if (SKIP_PREFIXES.has(gPrefix)) return;

                    const vids = evt.chance?.video;
                    if (!vids?.length) return;

                    const evtHasShot      = !!evt.shot;
                    const evtShotOnTarget = evt.shot?.target === 'on';
                    const outcome         = evt.goal ? 'goal' : evt.shot ? 'shot' : 'lost';
                    const segments        = [];

                    for (let vi = 0; vi < vids.length; vi++) {
                        const v       = vids[vi];
                        const clip    = v.video;
                        const text    = resolveText(evt.chance?.text?.[vi]);
                        const nextClip = vi + 1 < vids.length ? vids[vi + 1].video : null;
                        const prevClip = vi > 0 ? vids[vi - 1].video : null;

                        const nextIsDefwin     = !!(nextClip && DEFWIN_VIDS.test(nextClip));
                        const nextIsFinish     = !!(nextClip && FINISH_VIDS.test(nextClip));
                        const prevIsCornerkick = !!(prevClip && /^cornerkick/.test(prevClip));
                        const actions          = [];

                        // ── Passes ──────────────────────────────────────────────────
                        if (PASS_VIDS.test(clip)) {
                            const isGkDist = /^gk(throw|kick)/.test(clip);
                            const by = isGkDist ? v.gk : v.att1;
                            if (by) {
                                const isPreshort   = /^preshort/.test(clip);
                                const rawLines     = evt.chance?.text?.[vi] || [];
                                const preshortSkip = isPreshort && !rawLines.some(l => l.includes('[player=' + by + ']'));
                                if (!preshortSkip) {
                                    const failed = nextIsDefwin;
                                    actions.push({ action: 'pass', result: failed ? 'fail' : 'ok', by, to: v.att2 || null });
                                    if (!failed && evtHasShot) actions.push({ action: 'keyPass', by });
                                }
                            }
                        }

                        // ── Crosses ─────────────────────────────────────────────────
                        else if (CROSS_VIDS.test(clip) && v.att1) {
                            if (/^freekick/.test(clip) && evtHasShot) {
                                // Direct free kick → treat as a finish
                                const isGoal = !!(evt.goal && String(evt.goal.player) === String(v.att1));
                                actions.push({ action: 'finish', result: isGoal ? 'goal' : 'miss', method: 'foot', by: v.att1, gk: v.gk || null });
                                if (isGoal && evt.goal.assist) actions.push({ action: 'assist', by: evt.goal.assist });
                            } else {
                                const failed = nextIsDefwin;
                                actions.push({ action: 'cross', result: failed ? 'fail' : 'ok', by: v.att1 });
                                if (!failed && evtHasShot) actions.push({ action: 'keyPass', by: v.att1 });
                            }
                        }

                        // ── Finish (shots) ──────────────────────────────────────────
                        else if (FINISH_VIDS.test(clip) && v.att1) {
                            // Only the last consecutive finish clip counts
                            if (!nextIsFinish) {
                                const isHead = /^header/.test(clip);
                                const isGoal = !!(evt.goal && String(evt.goal.player) === String(v.att1));
                                actions.push({ action: 'finish', result: isGoal ? 'goal' : 'miss', method: isHead ? 'head' : 'foot', by: v.att1, gk: v.gk || null });
                                if (isGoal && evt.goal.assist) actions.push({ action: 'assist', by: evt.goal.assist });
                            }
                        }

                        // ── Defwin (defensive win) ──────────────────────────────────
                        else if (DEFWIN_VIDS.test(clip)) {
                            const tAll   = (evt.chance?.text || []).flat();
                            const winner = [v.def1, v.def2].find(d => d && tAll.some(l => l.includes('[player=' + d + ']')));
                            if (winner) {
                                if (!prevIsCornerkick) actions.push({ action: 'duelWon', by: winner });
                                const tSeg     = evt.chance?.text?.[vi] || [];
                                const isHeader = /^defwin5$/.test(clip) || tSeg.some(l => /\bheader\b|\bhead(ed|s)?\b/i.test(l));
                                const isTackle = /^defwin(3|6)$/.test(clip);
                                actions.push({ action: isHeader ? 'headerClear' : isTackle ? 'tackle' : 'interception', by: winner });
                            }
                        }

                        // ── Run duel (finrun) ───────────────────────────────────────
                        else if (RUN_DUEL_VIDS.test(clip)) {
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
                        }

                        // ── Save ────────────────────────────────────────────────────
                        else if (/^save/.test(clip) && v.gk) {
                            actions.push({ action: 'save', by: v.gk });
                        }

                        // ── Foul ────────────────────────────────────────────────────
                        else if (/^foulcall/.test(clip) && v.def1) {
                            actions.push({ action: 'foul', by: v.def1 });
                        }

                        // ── Yellow card clip ────────────────────────────────────────
                        else if (/^yellow/.test(clip)) {
                            const pid = evt.yellow || evt.yellow_red || v.def1;
                            if (pid) actions.push({ action: 'card', type: evt.yellow_red ? 'yellow_red' : 'yellow', player: pid });
                        }

                        // ── Red card clip ────────────────────────────────────────────
                        else if (/^red/.test(clip)) {
                            const pid = evt.red || v.def1;
                            if (pid) actions.push({ action: 'card', type: 'red', player: pid });
                        }

                        // ── Substitution ────────────────────────────────────────────
                        else if (/^sub/.test(clip) && evt.sub) {
                            actions.push({ action: 'sub', playerIn: evt.sub.player_in, playerOut: evt.sub.player_out });
                        }

                        // ── Injury ──────────────────────────────────────────────────
                        else if (/^injury/.test(clip) && evt.injury) {
                            actions.push({ action: 'injury', player: evt.injury });
                        }

                        // Keep all segments — Unity needs every clip regardless of actions
                        segments.push({ clip, text, actions });
                    }

                    plays.push({ team: evt.club, style: gPrefix, outcome, segments, reportEvtIdx });
                });

                if (plays.length) result[String(min)] = plays;
            }

            return result;
        },

        normalizeMatchData(mData) {
            const { club, lineup } = mData;
            club.home.color = '#' + (club.home.colors?.club_color1 || '4a9030');
            club.away.color = '#' + (club.away.colors?.club_color1 || '5b9bff');
            mData.homePlayerSet = new Set(Object.keys(lineup.home));
            mData.awayPlayerSet = new Set(Object.keys(lineup.away));
            mData.allPlayers    = [...Object.values(lineup.home), ...Object.values(lineup.away)];
            this.normalizeReport(mData.report);
            mData.plays = this.buildNormalizedPlays(mData.report, lineup);
            console.log('Normalized match data', mData);
            return mData;
        },
    };

