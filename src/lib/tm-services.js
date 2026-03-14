/**
 * tm-services.js — TrophyManager API service layer
 *
 * Usage (via Tampermonkey @require):
 *   // @require  https://raw.githubusercontent.com/.../lib/tm-services.js
 *
 * Exposed as: window.TmApi
 *
 * All functions return a Promise that always resolves (never rejects).
 * On network failure or JSON parse error the promise resolves to null.
 *
 * API:
 *   TmApi.fetchClubFixtures(clubId)                  → Promise<object|null>
 *   TmApi.fetchLeagueFixtures(country, div, group)   → Promise<object|null>
 *   TmApi.fetchClubMatchHistory(clubId, sid)         → Promise<string|null>
 *   TmApi.fetchMatchTooltip(matchId, season)         → Promise<object|null>
 *   TmApi.fetchTooltipRaw(playerId)                  → Promise<object|null>
 *   TmApi.fetchMatchH2H(homeId, awayId, date)        → Promise<object|null>
 *   TmApi.fetchLeagueDivisions(country)              → Promise<object|null>
 *   TmApi.fetchSquadPost(clubId)                     → Promise<object|null>
 *   TmApi.fetchClubTransferHistory(clubId, sid)      → Promise<string|null>
 *   TmApi.fetchClubRecords(clubId)                   → Promise<string|null>
 *   TmApi.fetchClubLeagueHistory(clubId, sid)        → Promise<string|null>
 *   TmApi.fetchPlayerTooltip(pid)                    → Promise<{player,club,...}|null>
 *   TmApi.fetchPlayerInfo(pid, type, extra={})        → Promise<data|null>
 *   TmApi.fetchSquadRaw(clubId)                      → Promise<{squad,post,...}|null>
 *   TmApi.fetchTransfer(playerId)                    → Promise<data|null>
 *   TmApi.saveTraining(data)                         → Promise<void>
 *   TmApi.saveTrainingType(playerId, teamId)         → Promise<void>
 *   TmApi.normalizePlayer(p, DBPlayer)               → p  (mutates in place, returns p)
 */

(function () {
    'use strict';

    const _errors = [];
    const _logError = (context, err) => {
        const entry = { context, err, time: Date.now() };
        _errors.push(entry);
        if (typeof window.TmApi?.onError === 'function') window.TmApi.onError(entry);
        console.warn(`[TmApi] ${context}`, err);
    };

    const _post = (url, data) => new Promise(resolve => {
        const $ = window.jQuery;
        if (!$) { resolve(null); return; }
        $.post(url, data)
            .done(res => {
                try { resolve(typeof res === 'object' ? res : JSON.parse(res)); }
                catch (e) { _logError(`JSON parse: ${url}`, e); resolve(null); }
            })
            .fail((xhr, s, e) => { _logError(`POST ${url}`, e || s); resolve(null); });
    });

    const _get = (url) => new Promise(resolve => {
        const $ = window.jQuery;
        if (!$) { resolve(null); return; }
        $.get(url)
            .done(res => {
                try { resolve(typeof res === 'object' ? res : JSON.parse(res)); }
                catch (e) { _logError(`JSON parse: ${url}`, e); resolve(null); }
            })
            .fail((xhr, s, e) => { _logError(`GET ${url}`, e || s); resolve(null); });
    });

    const _getHtml = (url) => new Promise(resolve => {
        const $ = window.jQuery;
        if (!$) { resolve(null); return; }
        $.ajax({ url, type: 'GET', dataType: 'html' })
            .done(res => resolve(res || null))
            .fail(() => resolve(null));
    });

    // ─── In-flight deduplication ────────────────────────────────────────────
    // Prevents multiple concurrent identical fetches for the same key.
    const _inflight = new Map();
    const _dedup = (key, promiseFn) => {
        if (_inflight.has(key)) return _inflight.get(key);
        const p = promiseFn().finally(() => _inflight.delete(key));
        _inflight.set(key, p);
        return p;
    };

    // ─── Private transfer calc helpers ─────────────────────────────────────
    const _SKILL_NAME_TO_KEY = {
        'Strength':'str','Stamina':'sta','Pace':'pac','Marking':'mar','Tackling':'tac',
        'Workrate':'wor','Positioning':'pos','Passing':'pas','Crossing':'cro',
        'Technique':'tec','Heading':'hea','Finishing':'fin','Longshots':'lon','Set Pieces':'set',
        'Handling':'han','One on ones':'one','Reflexes':'ref','Aerial Ability':'ari',
        'Jumping':'jum','Communication':'com','Kicking':'kic','Throwing':'thr',
    };
    const _GK_WEIGHT_ORDER  = window.TmConst.SKILL_KEYS_GK_WEIGHT;
    const _OUTFIELD_SKILLS  = window.TmConst.SKILL_KEYS_OUT;
    const _getPosIndex = pos => window.TmLib.getPositionIndex(pos);

    function _skillsToArray(skillsObj, posIdx) {
        const order = posIdx === 9 ? _GK_WEIGHT_ORDER : _OUTFIELD_SKILLS;
        return order.map(k => skillsObj[k] || 0);
    }

    // ─────────────────────────────────────────────────────────────────────────

    window.TmApi = {

        /**
         * Fetch club fixtures (all matches for a given club this season).
         * @param {string|number} clubId
         * @returns {Promise<object|null>}
         */
        fetchClubFixtures(clubId) {
            return _post('/ajax/fixtures.ajax.php', { type: 'club', var1: clubId });
        },

        /**
         * Fetch league fixtures for a given country/division/group.
         * @param {string|number} country
         * @param {string|number} division
         * @param {string|number} group
         * @returns {Promise<object|null>}
         */
        fetchLeagueFixtures(country, division, group) {
            return _post('/ajax/fixtures.ajax.php', { type: 'league', var1: country, var2: division, var3: group });
        },

        /**
         * Fetch the match history HTML page for a club in a given season.
         * Returns the raw HTML string (not JSON) or null on failure.
         * @param {string|number} clubId
         * @param {string|number} seasonId
         * @returns {Promise<string|null>}
         */
        fetchClubMatchHistory(clubId, seasonId) {
            return _getHtml(`/history/club/matches/${clubId}/${seasonId}/`);
        },

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
         * Fetch raw player tooltip response without normalization or DB writes.
         * Use this when you need the plain API response in non-playerdb contexts.
         * @param {string|number} playerId
         * @returns {Promise<object|null>}
         */
        fetchTooltipRaw(playerId) {
            return _dedup(`tooltip:${playerId}`, () => _post('/ajax/tooltip.ajax.php', { player_id: playerId }));
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
         * Fetch available league divisions for a given country.
         * @param {string} country — country suffix (e.g. 'cs', 'de')
         * @returns {Promise<object|null>}
         */
        fetchLeagueDivisions(country) {
            return _post('https://trophymanager.com/ajax/league_get_divisions.ajax.php', { get: 'new', country });
        },

        /**
         * Fetch the players_get_select post map for a club (raw, no normalization).
         * Returns a { [playerId: string]: player } map, or null on failure.
         * @param {string|number} clubId
         * @returns {Promise<object|null>}
         */
        fetchSquadPost(clubId) {
            return _post('/ajax/players_get_select.ajax.php', { type: 'change', club_id: clubId }).then(data => {
                if (!data?.post) return null;
                const map = {};
                for (const [id, p] of Object.entries(data.post)) map[String(id)] = p;
                return map;
            });
        },

        /**
         * Fetch the club transfer history HTML page for a given season.
         * @param {string|number} clubId
         * @param {string|number} seasonId
         * @returns {Promise<string|null>}
         */
        fetchClubTransferHistory(clubId, seasonId) {
            return _getHtml(`/history/club/transfers/${clubId}/${seasonId}/`);
        },

        /**
         * Fetch the club records HTML page.
         * @param {string|number} clubId
         * @returns {Promise<string|null>}
         */
        fetchClubRecords(clubId) {
            return _getHtml(`/history/club/records/${clubId}/`);
        },

        /**
         * Fetch the club league history HTML page for a given season.
         * @param {string|number} clubId
         * @param {string|number} seasonId
         * @returns {Promise<string|null>}
         */
        fetchClubLeagueHistory(clubId, seasonId) {
            return _getHtml(`/history/club/league/${clubId}/${seasonId}/`);
        },

        /**
         * Fetch a shortlist page and return the parsed players_ar array.
         * @param {number} [start] — page offset (omit for first/random page)
         * @returns {Promise<Array>}
         */
        fetchShortlistPage(start) {
            const url = start != null ? `/shortlist/?start=${start}` : '/shortlist/';
            return _getHtml(url).then(html => {
                if (!html) return [];
                const m = html.match(/var\s+players_ar\s*=\s*(\[[\s\S]*?\]);/);
                if (!m) return [];
                try { return JSON.parse(m[1]); } catch { return []; }
            });
        },

        /**
         * Fetch the player tooltip endpoint.
         * Returns the full parsed response (contains .player, .club, etc.) or null.
         * @param {string|number} pid
         * @returns {Promise<{player: object, club: object, [key: string]: any}|null>}
         */
        /**
         * Fetch the full match data object for a given match ID.
         * @param {string|number} matchId
         * @returns {Promise<object|null>}
         */
        fetchMatch(matchId) {
            return _get(`/ajax/match.ajax.php?id=${matchId}`);
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
                player_id: p.player_id,
                name: p.name,
                nameLast: p.nameLast,
                position: p.position,
                fp: p.fp,
                no: p.no,
                rating: p.rating,
                mom: p.mom,
                rec: p.rec,
                routine: p.routine,
                age: p.age,
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
         * @returns {Promise<object|null>}
         */
        async fetchMatchCached(matchId) {
            const db = window.TmMatchCacheDB;
            const cached = await db.get(matchId);
            if (cached) return cached;
            const raw = await this.fetchMatch(matchId);
            if (!raw) return null;
            const compressed = this.compressMatch(raw);
            db.set(matchId, compressed); // fire-and-forget
            return compressed;
        },

        fetchPlayerTooltip(player_id) {
            return _dedup(`tooltip:${player_id}`, () => _post('/ajax/tooltip.ajax.php', { player_id })).then(data => {
                if (!data?.player) return data;
                data.retired = data.player.club_id === null || data.club === null;
                const DBPlayer = window.TmPlayerDB.get(player_id);
                if (data.retired) {
                    if (DBPlayer) {
                        window.TmPlayerArchiveDB.set(player_id, DBPlayer).then(() => window.TmPlayerDB.remove(player_id));
                        console.log(`%c[Cleanup] Archived retired/deleted player ${player_id}`, 'font-weight:bold;color:#fbbf24');
                    }
                    return data;
                }
                this.normalizePlayer(data.player, DBPlayer);
                return data;
            });
        },

        /**
         * Fetch the players_get_info endpoint.
         * show_non_pro_graphs is always included automatically.
         * @param {string|number} pid
         * @param {string} type — 'history' | 'training' | 'graphs' | 'scout' | etc.
         * @param {object} [extra={}] — optional extra params (e.g. { scout_id: '123' })
         * @returns {Promise<object|null>}
         */
        fetchPlayerInfo(pid, type, extra = {}) {
            return _post('/ajax/players_get_info.ajax.php', {
                player_id: pid,
                type,
                show_non_pro_graphs: true,
                ...extra
            });
        },

        /**
         * Fetch the squad player list for a club (players_get_select endpoint).
         * All entries in data.post are normalized in place via normalizePlayer.
         * @param {string|number} clubId
         * @returns {Promise<{squad: object[], post: object, [key: string]: any}|null>}
         */
        fetchSquadRaw(clubId) {
            return _post('/ajax/players_get_select.ajax.php', { type: 'change', club_id: clubId })
                .then(data => {
                    if (data?.post) {
                        const players = Object.values(data.post).map(player => {
                            player.club_id = clubId;  // not included in this endpoint but needed for normalization
                            const DBPlayer = window.TmPlayerDB.get(player.id);
                            this.normalizePlayer(player, DBPlayer);
                            return player;
                        });
                        data.post = players;
                    }
                    return data;

                });
        },

        /**
         * Fetch the current transfer status for a listed player.
         * @param {string|number} playerId
         * @returns {Promise<object|null>}
         */
        fetchTransfer(playerId) {
            return _post('/ajax/transfer_get.ajax.php', { type: 'transfer_reload', player_id: playerId });
        },

        /**
         * Search the transfer market by a pre-built hash string.
         * Returns the raw API response { list: [], refresh: bool } or null on error.
         * The `list` array contains raw TM transfer player objects — call
         * normalizeTransferPlayer() on each entry before use.
         * @param {string} hash   — path-style hash built by buildHash() / buildHashRaw()
         * @param {string|number} clubId — SESSION.id (used by TM to exclude own players)
         * @returns {Promise<{list: object[], refresh: boolean}|null>}
         */
        fetchTransferSearch(hash, clubId) {
            return _post('/ajax/transfer.ajax.php', { search: hash, club_id: clubId });
        },

        /**
         * Map a TM position string to a 0-9 index used by R5/Rec weight tables.
         * GK=9, DC=0, DR/DL=1, DMC=2, DMR/DML=3, MC=4, MR/ML=5, OMC=6, OMR/OML=7, FC/F=8.
         * Also exposed here so display code can import it without redeclaring locally.
         * @param {string} pos
         * @returns {number}
         */
        getPosIndex: _getPosIndex,

        /**
         * Normalise a raw transfer-list player object in place.
         * Adds computed helper fields:
         *   _gk    {boolean}  — true for goalkeepers
         *   _ageP  {object}   — { years, months, totalMonths, decimal }
         *   _ss    {object}   — { sum, count, total, max } star-sum of scouted skills
         * @param {object} p — raw player from transfer list
         * @returns {object} the same object (mutated), for chaining
         */
        normalizeTransferPlayer(p) {
            const OUTFIELD = ['str','sta','pac','mar','tac','wor','pos','pas','cro','tec','hea','fin','lon','set'];
            const GK       = ['str','sta','pac','han','one','ref','ari','jum','com','kic','thr'];
            const gk = !!(p.fp && p.fp[0] === 'gk');
            const skills = gk ? GK : OUTFIELD;
            let sum = 0, count = 0;
            for (const s of skills) { if (p[s] > 0) { sum += p[s]; count++; } }
            const age = parseFloat(p.age) || 0;
            const years  = Math.floor(age);
            const months = Math.round((age - years) * 100);
            p._gk  = gk;
            p._ss  = { sum, count, total: skills.length, max: skills.length * 20 };
            p._ageP = { years, months, totalMonths: years * 12 + months, decimal: years + months / 12 };
            return p;
        },

        /**
         * Compute R5 range estimate from transfer-list skills (no tooltip needed).
         * Uses assumed routine range [0 … 4.2*(age-15)].
         * Requires player to be pre-normalized via normalizeTransferPlayer().
         * @param {object} p — normalized transfer player
         * @returns {{ r5Lo, r5Hi, recCalc, routineMax }|null}
         */
        estimateTransferPlayer(p) {
            const asi = p.asi || 0;
            if (!asi) return null;
            const skillKeys = p._gk ? _GK_WEIGHT_ORDER : _OUTFIELD_SKILLS;
            const skills = skillKeys.map(k => p[k] || 0);
            if (skills.every(s => s === 0)) return null;
            const positions = [...(p.fp || [])].sort((a, b) => _getPosIndex(a) - _getPosIndex(b));
            if (!positions.length) return null;
            const ageYears = p._ageP ? p._ageP.years : Math.floor(parseFloat(p.age) || 20);
            const routineMax = Math.max(0, window.TmConst.ROUTINE_SCALE * (ageYears - window.TmConst.ROUTINE_AGE_MIN));
            let r5Lo = null, r5Hi = null, recCalc = null;
            for (const pos of positions) {
                const pi = _getPosIndex(pos);
                const lo  = window.TmLib.calcR5(pi, skills, asi, 0);
                const hi  = window.TmLib.calcR5(pi, skills, asi, routineMax);
                const rec = window.TmLib.calcRec(pi, skills, asi);
                if (r5Lo === null || lo > r5Lo) r5Lo = lo;
                if (r5Hi === null || hi > r5Hi) r5Hi = hi;
                if (recCalc === null || rec > recCalc) recCalc = rec;
            }
            return { r5Lo, r5Hi, recCalc, routineMax };
        },

        /**
         * Enrich a transfer player with tooltip-derived values: recSort, recCalc,
         * r5 (exact if routine known), r5Lo, r5Hi, ti, skills.
         * Does NOT do any DB access — pure calculation.
         * Requires player to be pre-normalized via normalizeTransferPlayer().
         * @param {object} player        — normalized transfer player (has _gk, _ageP)
         * @param {object} tooltipData   — raw response from tooltip.ajax.php
         * @param {number} currentSession — TmLib.getCurrentSession() result
         * @returns {{ recSort, recCalc, r5, r5Lo, r5Hi, ti, skills }|null}
         */
        enrichTransferFromTooltip(player, tooltipData, currentSession) {
            if (!tooltipData?.player) return null;
            const tp = tooltipData.player;

            const recSort = tp.rec_sort !== undefined ? parseFloat(tp.rec_sort) : null;

            const wageNum = window.TmUtils.parseNum(tp.wage);
            const asiNum  = player.asi || window.TmUtils.parseNum(tp.asi || tp.skill_index);
            const favpos  = tp.favposition || '';
            const isGK    = favpos.split(',')[0].toLowerCase() === 'gk';
            let ti = null;
            if (asiNum && wageNum) {
                const tiRaw = window.TmLib.calculateTI({ asi: asiNum, wage: wageNum, isGK });
                if (tiRaw !== null && currentSession > 0)
                    ti = Number((tiRaw / currentSession).toFixed(1));
            }

            let skills = null;
            if (tp.skills && Array.isArray(tp.skills)) {
                skills = {};
                for (const sk of tp.skills) {
                    const key = _SKILL_NAME_TO_KEY[sk.name];
                    if (!key) continue;
                    const v = sk.value;
                    if (typeof v === 'string') {
                        if (v.includes('star_silver')) skills[key] = 19;
                        else if (v.includes('star'))   skills[key] = 20;
                        else skills[key] = parseInt(v) || 0;
                    } else {
                        skills[key] = parseInt(v) || 0;
                    }
                }
            }

            const tooltipRoutine = tp.routine != null ? parseFloat(tp.routine) : null;
            let recCalc = null, r5 = null, r5Lo = null, r5Hi = null;
            if (skills && asiNum) {
                const positions = favpos.split(',').map(s => s.trim()).filter(Boolean);
                if (positions.length) {
                    const ageYears = player._ageP ? player._ageP.years : Math.floor(parseFloat(player.age) || 20);
                    const routineMax = Math.max(0, window.TmConst.ROUTINE_SCALE * (ageYears - window.TmConst.ROUTINE_AGE_MIN));
                    for (const pos of positions) {
                        const pix = _getPosIndex(pos);
                        const sax = _skillsToArray(skills, pix);
                        const rec = window.TmLib.calcRec(pix, sax, asiNum);
                        const lo  = window.TmLib.calcR5(pix, sax, asiNum, 0);
                        const hi  = window.TmLib.calcR5(pix, sax, asiNum, routineMax);
                        if (recCalc === null || rec > recCalc) recCalc = rec;
                        if (r5Lo === null || lo > r5Lo) r5Lo = lo;
                        if (r5Hi === null || hi > r5Hi) r5Hi = hi;
                        if (tooltipRoutine !== null) {
                            const exact = window.TmLib.calcR5(pix, sax, asiNum, tooltipRoutine);
                            if (r5 === null || exact > r5) r5 = exact;
                        }
                    }
                }
            }

            return { recSort, recCalc, r5, r5Lo, r5Hi, ti, skills };
        },

        /**
         * Save a custom training plan.
         * The caller is responsible for building the full training_post payload.
         * @param {object} data — fully-formed training_post payload
         * @returns {Promise<void>}
         */
        saveTraining(data) {
            return _post('/ajax/training_post.ajax.php', data).then(() => { });
        },

        /**
         * Save the training type / position group for a player.
         * @param {string|number} playerId
         * @param {string|number} teamId
         * @returns {Promise<void>}
         */
        saveTrainingType(playerId, teamId) {
            return _post('/ajax/training_post.ajax.php', {
                type: 'player_pos',
                player_id: playerId,
                team_id: teamId
            }).then(() => { });
        },

        /**
         * One-time migration: backfill meta (name, pos, isGK, country) on existing DB records
         * that were saved before the meta field existed. Safe to call on every tooltip fetch —
         * no-ops once the record already has meta.pos populated.
         * @param {object} player — normalized player object
         * @param {object|null} DBPlayer — existing DB record for this player, or null if not found
         */
        _migratePlayerMeta(player, DBPlayer) {
            try {
                if (!DBPlayer || !DBPlayer.meta) {
                    if (!DBPlayer) DBPlayer = {};
                    DBPlayer.meta = {
                        name: player.name || '',
                        pos: player.favposition,
                        isGK: player.isGK,
                        country: player.country || '',
                        club_id: player.club_id != null ? String(player.club_id) : undefined,
                    };
                    window.TmPlayerDB.set(player.id, DBPlayer);
                } else {
                    let dirty = false;
                    if (!DBPlayer.meta.name && player.name) { DBPlayer.meta.name = player.name; dirty = true; }
                    if (!DBPlayer.meta.country && player.country) { DBPlayer.meta.country = player.country; dirty = true; }
                    // pos + isGK always sync — player may have changed position
                    if (player.favposition && player.favposition !== DBPlayer.meta.pos) {
                        DBPlayer.meta.pos = player.favposition;
                        DBPlayer.meta.isGK = player.isGK;
                        dirty = true;
                    } else if (DBPlayer.meta.isGK == null) { DBPlayer.meta.isGK = player.isGK; dirty = true; }
                    // club_id always sync — player may have transferred
                    if (player.club_id != null && String(player.club_id) !== DBPlayer.meta.club_id) {
                        DBPlayer.meta.club_id = String(player.club_id); dirty = true;
                    }
                    if (dirty) window.TmPlayerDB.set(player.id, DBPlayer);
                }
            } catch (e) { _logError('_migratePlayerMeta', e); }
        },

        /**
         * Parses all raw string/numeric scalar fields on a player object in-place.
         * Called by normalizePlayer() before skill or position resolution.
         */
        _parseScalars(player) {
            player.asi = TmUtils.parseNum(player.asi || player.skill_index);
            player.wage = TmUtils.parseNum(player.wage);
            player.age = parseInt(player.age) || 0;
            player.id = parseInt(player.player_id || player.id);
            player.months = parseInt(player.month || player.months) || 0;
            player.ageMonths = player.age * 12 + player.months;
            player.ageMonthsString = `${player.age}.${player.months}`;
            player.trainingCustom = player.training_custom || '';
            player.training = player.training || '';
            const s = window.SESSION;
            const ownClubIds = s ? [s.main_id, s.b_team].filter(Boolean).map(Number) : [];
            player.isOwnPlayer = ownClubIds.includes(Number(player.club_id));
            player.routine = parseFloat(player.rutine || player.routine) || 0;
            player.isGK = String(player.favposition || '').split(',')[0].trim().toLowerCase() === 'gk';
        },

        /**
         * Resolves a player's skills array from one of three sources (in priority order):
         *   1. IndexedDB record for the player's current age key
         *   2. Tooltip-API rich objects (already { key, value } shaped)
         *   3. Squad-API flat numeric fields on the player object
         * Returns an array of skill objects matching the given defs.
         */
        _resolveSkills(player, defs, DBRecord) {
            const ageKey = player.ageMonthsString;
            if (DBRecord && DBRecord.records?.[ageKey]) {
                const skills = DBRecord.records[ageKey].skills;
                return defs.map(def => {
                    const raw = skills[def.id];
                    const v = (typeof raw === 'object' && raw !== null) ? raw.value : raw;
                    return { ...def, value: parseFloat(v) || 0 };
                });
            }
            if (player.skills && Array.isArray(player.skills) && typeof player.skills[0] === 'object' && 'key' in player.skills[0]) {
                /* Tooltip API: skills already rich objects — reorder to match defs and normalise value */
                return defs.map(def => {
                    const sk = player.skills.find(s => s.key === def.key || (def.key2 && s.key === def.key2));
                    const raw = sk?.value ?? 0;
                    const value = typeof raw === 'string' && raw.includes('star') ? (raw.includes('silver') ? 19 : 20) : (parseFloat(raw) || 0);
                    return { ...def, value };
                });
            }
            /* Squad API: individual numeric fields on player — use key, falling back to removing underscores */
            return defs.map(def => {
                const raw = player[def.key] ?? player[def.key.replace(/_/g, '')];
                return { ...def, value: parseFloat(raw) || 0 };
            });
        },

        /**
         * Converts string fields (asi, wage, age, months, routine) to numbers.
         * Safe to call multiple times (idempotent once numeric).
         * @param {object} player — raw player from fetchPlayerTooltip / tooltip.ajax.php
         * @param {object|null} DBPlayer — existing DB record for this player, or null if not found
         * @returns {object} the same player, mutated
         */
        normalizePlayer(player, DBPlayer, { skipSync = false } = {}) {
            this._parseScalars(player);
            this._migratePlayerMeta(player, DBPlayer);
            const defs = player.isGK ? TmConst.SKILL_DEFS_GK : TmConst.SKILL_DEFS_OUT;
            player.skills = this._resolveSkills(player, defs, DBPlayer);
            const applyPositions = () => {
                player.positions = String(player.favposition || '').split(',').map(s => {
                    const pos = s.trim().toLowerCase();
                    const positionData = TmConst.POSITION_MAP[pos];
                    if (!positionData) return null;
                    return {
                        ...positionData,
                        r5: TmLib.calculatePlayerR5(positionData, player),
                        rec: TmLib.calculatePlayerREC(positionData, player)
                    };
                }).filter(Boolean).sort((a, b) => a.ordering - b.ordering);
                player.r5 = Math.max(0, ...player.positions.map(p => parseFloat(p.r5) || 0));
                player.rec = Math.max(0, ...player.positions.map(p => parseFloat(p.rec) || 0));
                player.ti = TmLib.calculateTIPerSession(player);
            };

            const syncPromise = skipSync ? null : window.TmSync?.syncPlayerStore(player, DBPlayer);
            if (syncPromise instanceof Promise) {
                syncPromise.then(updatedDB => {
                    const curRec = updatedDB?.records?.[player.ageMonthsString];
                    if (!curRec?.skills) return;
                    player.skills = this._resolveSkills(player, defs, updatedDB);
                    applyPositions();
                    window.dispatchEvent(new CustomEvent('tm:player-synced', { detail: { id: player.id, player } }));
                });
            }

            applyPositions();
            player.name = player.player_name || player.name;
            return player;
        },

        errors: _errors,
        onError: null,

    };

})();
