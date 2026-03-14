// tm-match-utils.js — Shared match event parsing utilities
// Depends on: nothing
// Exposed as: window.TmMatchUtils
(function () {
    'use strict';

    window.TmMatchUtils = {

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
                if (!evt.parameters) return;
                const params = Array.isArray(evt.parameters) ? evt.parameters : [evt.parameters];
                const isPen = params.some(p => p.penalty);
                params.forEach(p => {
                    if (p.goal) {
                        const home = self.isHome(homeIds, p.goal.player);
                        if (home) stats.homeGoals++; else stats.awayGoals++;
                        if (isPen) { if (home) stats.homePenalties++; else stats.awayPenalties++; }
                        if (lineup) stats.events.push({ min, icon: '⚽', name: self.resolvePlayerName(lineup, p.goal.player), side: home ? 'home' : 'away' });
                    }
                    if (p.yellow) {
                        const home = self.isHome(homeIds, p.yellow);
                        if (home) stats.homeYellow++; else stats.awayYellow++;
                        if (lineup) stats.events.push({ min, icon: '🟨', name: self.resolvePlayerName(lineup, p.yellow), side: home ? 'home' : 'away' });
                    }
                    if (p.yellow_red) {
                        const home = self.isHome(homeIds, p.yellow_red);
                        if (home) stats.homeRed++; else stats.awayRed++;
                        if (lineup) stats.events.push({ min, icon: '🟥', name: self.resolvePlayerName(lineup, p.yellow_red), side: home ? 'home' : 'away' });
                    }
                    if (p.red) {
                        const home = self.isHome(homeIds, p.red);
                        if (home) stats.homeRed++; else stats.awayRed++;
                        if (lineup) stats.events.push({ min, icon: '🟥', name: self.resolvePlayerName(lineup, p.red), side: home ? 'home' : 'away' });
                    }
                    if (p.shot) {
                        const home = String(p.shot.team) === homeId;
                        if (home) { stats.homeShots++; if (p.shot.target === 'on') stats.homeSoT++; }
                        else { stats.awayShots++; if (p.shot.target === 'on') stats.awaySoT++; }
                    }
                    if (p.set_piece) {
                        const home = self.isHome(homeIds, p.set_piece);
                        if (home) stats.homeSetPieces++; else stats.awaySetPieces++;
                    }
                });
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

            const { PASS_VIDS, CROSS_VIDS, DEFWIN_VIDS, FINISH_VIDS, RUN_DUEL_VIDS } = window.TmConst;
            const pStats = {};

            const ensureP = (rawId) => {
                if (!rawId) return null;
                const id = String(rawId);
                if (pidFilter && id !== pidFilter) return null;
                if (!pStats[id]) {
                    pStats[id] = {
                        sp: 0, up: 0, sc: 0, uc: 0,
                        sh: 0, sot: 0, soff: 0, shf: 0, sotf: 0, gf: 0, shh: 0, soth: 0, gh: 0,
                        sv: 0,
                        g: 0, a: 0, kp: 0,
                        dw: 0, dl: 0, int: 0, tkl: 0, hc: 0, tf: 0,
                        fouls: 0, yc: 0, rc: 0,
                        stp: 0, fkg: 0, pen: 0, peng: 0,
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
                    const evtHasShot = evt.parameters?.some(pr => pr.shot);
                    const evtShotOnTarget = evt.parameters?.find(pr => pr.shot)?.shot?.target === 'on';

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
                                        if (failed) { p.up++; addEvent(rawId, min, si, evt, 'pass_fail'); }
                                        else { p.sp++; if (evtHasShot) p.kp++; addEvent(rawId, min, si, evt, 'pass_ok'); }
                                    }
                                }
                            }

                            // ── Crosses ──
                            if (CROSS_VIDS.test(v.video) && v.att1) {
                                const p = ensureP(v.att1);
                                if (p) {
                                    if (/^freekick/.test(v.video) && evtHasShot) {
                                        p.sh++; p.shf++;
                                        if (evtShotOnTarget) { p.sot++; p.sotf++; } else p.soff++;
                                        addEvent(v.att1, min, si, evt, 'shot');
                                    } else {
                                        const failed = vi + 1 < vids.length && DEFWIN_VIDS.test(vids[vi + 1].video);
                                        if (failed) { p.uc++; addEvent(v.att1, min, si, evt, 'cross_fail'); }
                                        else { p.sc++; if (evtHasShot) p.kp++; addEvent(v.att1, min, si, evt, 'cross_ok'); }
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
                                        p.sh++;
                                        if (isHead) {
                                            p.shh++;
                                            if (evtShotOnTarget) { p.sot++; p.soth++; } else p.soff++;
                                        } else {
                                            p.shf++;
                                            if (evtShotOnTarget) { p.sot++; p.sotf++; } else p.soff++;
                                        }
                                        const shooterId = String(v.att1);
                                        const hasGoalForShooter = evt.parameters?.some(pr => pr.goal && String(pr.goal.player) === shooterId);
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
                                        if (isFinrunBefore || !isCornerkickBefore) p.dw++;
                                        const defwinTextLines = evt.chance?.text?.[vi] || [];
                                        const isHeader = defwinTextLines.some(l => /\bheader\b|\bhead(ed|s)?\b/i.test(l));
                                        if (/^defwin5$/.test(v.video) || isHeader) {
                                            p.hc++; addEvent(winner, min, si, evt, 'header_clear');
                                        } else if (/^defwin(3|6)$/.test(v.video)) {
                                            p.tkl++; addEvent(winner, min, si, evt, 'tackle');
                                        } else {
                                            p.int++; addEvent(winner, min, si, evt, 'intercept');
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
                                                p.dl++; addEvent(d, min, si, evt, 'duel_lost');
                                            }
                                        });
                                    }
                                    const nextVid = vi + 1 < vids.length ? vids[vi + 1].video : '';
                                    if (FINISH_VIDS.test(nextVid) && v.def1) {
                                        const p = ensureP(v.def1);
                                        if (p) { p.tf++; addEvent(v.def1, min, si, evt, 'tackle_fail'); }
                                    }
                                }
                            }

                            // ── Saves ──
                            if (/^save/.test(v.video) && v.gk) {
                                const p = ensureP(v.gk);
                                if (p) { p.sv++; addEvent(v.gk, min, si, evt, 'save'); }
                            }

                            // ── Fouls ──
                            if (/^foulcall/.test(v.video) && v.def1) {
                                const p = ensureP(v.def1);
                                if (p) { p.fouls++; addEvent(v.def1, min, si, evt, 'foul'); }
                            }
                        }
                    }

                    // ── Goals, assists, cards, set-pieces from parameters ──
                    if (evt.parameters) {
                        const isPenGoal = evt.parameters.some(pr => pr.penalty);
                        const gPrefix = evt.type ? evt.type.replace(/[0-9]+.*/, '') : '';
                        evt.parameters.forEach(param => {
                            if (param.goal) {
                                const scorer = String(param.goal.player);
                                const p = ensureP(scorer);
                                if (p) {
                                    p.g++;
                                    if (!isPenGoal) {
                                        const evtVids = evt.chance?.video;
                                        const isHeaderGoal = evtVids && Array.isArray(evtVids) && evtVids.some(v => /^header/.test(v.video));
                                        if (isHeaderGoal) p.gh++; else p.gf++;
                                    }
                                    if (gPrefix === 'dire') p.fkg++;
                                    addEvent(scorer, min, si, evt, 'goal');
                                }
                                if (param.goal.assist) {
                                    const ap = ensureP(param.goal.assist);
                                    if (ap) { ap.a++; addEvent(param.goal.assist, min, si, evt, 'assist'); }
                                }
                            }
                            if (param.yellow) {
                                const p = ensureP(param.yellow);
                                if (p) { p.yc++; addEvent(param.yellow, min, si, evt, 'yellow'); }
                            }
                            if (param.yellow_red) {
                                const p = ensureP(param.yellow_red);
                                if (p) { p.yc++; p.rc++; addEvent(param.yellow_red, min, si, evt, 'red'); }
                            }
                            if (param.red) {
                                const p = ensureP(param.red);
                                if (p) { p.rc++; addEvent(param.red, min, si, evt, 'red'); }
                            }
                            if (param.penalty) {
                                const p = ensureP(param.penalty);
                                if (p) p.pen++;
                            }
                            if (param.set_piece && gPrefix === 'dire') {
                                const p = ensureP(param.set_piece);
                                if (p) p.stp++;
                            }
                        });
                        // Penalty goal: track peng separately
                        const hasGoalParam = evt.parameters.some(pr => pr.goal);
                        if (isPenGoal && hasGoalParam) {
                            const penPlayer = evt.parameters.find(pr => pr.penalty);
                            if (penPlayer) {
                                const p = ensureP(penPlayer.penalty);
                                if (p) p.peng++;
                            }
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
    };

})();
