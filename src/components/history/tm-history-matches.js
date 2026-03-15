import { TmClubService } from '../../services/club.js';
import { TmMatchService } from '../../services/match.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmHistoryHelpers } from './tm-history-helpers.js';

const $ = window.jQuery;
    const H = () => TmHistoryHelpers;

    /* ── module state ── */
    let _clubId = null, _seasons = null, _el = null;
    let matchesCache = {};
    let matchFilter = 'all';
    let currentSeason = null;
    let _matchTooltipCache = {};
    let _matchTooltipEl = null;
    let _matchTooltipTimer = null;
    let _matchTooltipHideTimer = null;
    let _matchTooltipMid = null;

    /* ═══════════════════════════════════════
       MATCHES TAB
       ═══════════════════════════════════════ */
    function renderMatches() {
        const el = _el;
        const matchSeasons = _seasons.filter(s => s.id != _seasons[0].id);
        if (!matchSeasons.length) {
            el.html('<div class="tmh-ph">No past seasons found</div>');
            return;
        }

        const validSeason = matchSeasons.find(s => s.id == currentSeason) ? currentSeason : matchSeasons[0].id;
        if (validSeason !== currentSeason) currentSeason = validSeason;

        const sIdx = matchSeasons.findIndex(s => s.id == currentSeason);
        const prevDis = sIdx >= matchSeasons.length - 1 ? ' dis' : '';
        const nextDis = sIdx <= 0 ? ' dis' : '';

        let h = '<div class="tmh-sbar">';
        h += '<button class="tmu-btn tmu-btn-secondary rounded-md py-1 px-2 tmh-arrow' + prevDis + '" id="tmh-m-prev" title="Previous season">◀</button>';
        h += '<label>Season:</label>';
        h += '<select id="tmh-m-sel">';
        matchSeasons.forEach(s => {
            h += '<option value="' + s.id + '"' + (s.id == currentSeason ? ' selected' : '') + '>' + s.label + '</option>';
        });
        h += '</select>';
        h += '<button class="tmu-btn tmu-btn-secondary rounded-md py-1 px-2 tmh-arrow' + nextDis + '" id="tmh-m-next" title="Next season">▶</button>';
        h += '</div>';
        h += '<div id="tmh-mdata"></div>';
        el.html(h);

        function goSeason(sid) {
            currentSeason = sid;
            renderMatches();
        }

        $('#tmh-m-sel').on('change', function () { goSeason($(this).val()); });
        $('#tmh-m-prev').on('click', function () {
            const i = matchSeasons.findIndex(s => s.id == currentSeason);
            if (i < matchSeasons.length - 1) goSeason(matchSeasons[i + 1].id);
        });
        $('#tmh-m-next').on('click', function () {
            const i = matchSeasons.findIndex(s => s.id == currentSeason);
            if (i > 0) goSeason(matchSeasons[i - 1].id);
        });

        loadMatches(currentSeason);
    }

    /* ─── load matches for a season ─── */
    function loadMatches(sid) {
        const c = $('#tmh-mdata');
        if (matchesCache[sid]) { renderMatchList(c, matchesCache[sid], sid); return; }

        c.html('<div class="tmh-load"><div class="tmu-spinner tmu-spinner-md" style="margin-bottom:6px"></div><br>Loading Season ' + sid + ' matches…</div>');

        TmClubService.fetchClubMatchHistory(_clubId, sid).then(function(html) {
            if (!html) { c.html('<div class="tmh-load" style="color:#f44">Failed to load matches</div>'); return; }
            const d = parseMatchesHtml(html);
            matchesCache[sid] = d;
            renderMatchList(c, d, sid);
        });
    }

    /* ─── parse matches HTML ─── */
    function parseMatchesHtml(html) {
        const doc = $('<div>').html(html);
        const matches = [];

        doc.find('.match_list li').each(function () {
            const li = $(this);
            const calImg = li.find('.match_date img').attr('src') || '';
            const dayMatch = calImg.match(/calendar_numeral_(\d+)/);
            const day = dayMatch ? dayMatch[1] : '';

            const matchType = li.find('.matchtype').text().trim();

            const homeEl = li.find('.hometeam a');
            const homeName = homeEl.text().trim();
            const homeLink = homeEl.attr('club_link') || '';

            const awayEl = li.find('.awayteam a');
            const awayName = awayEl.text().trim();
            const awayLink = awayEl.attr('club_link') || '';

            const resultEl = li.find('.match_results span[match_link]');
            const result = resultEl.find('a').text().trim();
            const matchId = resultEl.attr('match_link') || '';
            const matchSeason = resultEl.attr('match_season') || '';

            const isHome = homeLink == _clubId;
            const isAway = awayLink == _clubId;

            const parts = result.split('-').map(Number);
            let outcome = 'draw';
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const hg = parts[0], ag = parts[1];
                if (hg > ag) outcome = isHome ? 'win' : 'loss';
                else if (ag > hg) outcome = isAway ? 'win' : 'loss';
            }

            if (result && matchId) {
                matches.push({
                    day, matchType, homeName, homeLink, awayName, awayLink,
                    result, matchId, matchSeason, isHome, isAway, outcome
                });
            }
        });

        const months = [];
        doc.find('h3[id$="_month_arrow"]').each(function () {
            months.push($(this).text().trim());
        });

        return { matches, months };
    }

    /* ─── categorize match type ─── */
    function matchTypeShort(t) {
        const tl = t.toLowerCase();
        if (tl === 'league') return 'league';
        if (tl === 'cup') return 'cup';
        if (tl === 'friendly league' || tl === 'friendly') return 'friendly';
        if (/champions|international/i.test(tl)) return 'international';
        return 'other';
    }

    /* ─── render the match list ─── */
    function renderMatchList(c, data, sid) {
        const matches = data.matches;
        if (!matches.length) {
            c.html('<div class="tmh-ph">No matches found for this season</div>');
            return;
        }

        const types = new Set();
        matches.forEach(m => types.add(matchTypeShort(m.matchType)));

        const filtered = matchFilter === 'all' ? matches : matches.filter(m => matchTypeShort(m.matchType) === matchFilter);

        let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;
        filtered.forEach(m => {
            if (m.outcome === 'win') wins++;
            else if (m.outcome === 'loss') losses++;
            else draws++;
            const p = m.result.split('-').map(Number);
            if (p.length === 2 && !isNaN(p[0]) && !isNaN(p[1])) {
                if (m.isHome) { gf += p[0]; ga += p[1]; }
                else { gf += p[1]; ga += p[0]; }
            }
        });

        let h = '';

        h += '<div class="tmh-match-summary">';
        h += '<div><div class="lbl">Played</div><div class="val" style="color:#c8e0b4">' + filtered.length + '</div></div>';
        h += '<div><div class="lbl">Won</div><div class="val tmh-pos">' + wins + '</div></div>';
        h += '<div><div class="lbl">Drawn</div><div class="val tmh-neut">' + draws + '</div></div>';
        h += '<div><div class="lbl">Lost</div><div class="val tmh-neg">' + losses + '</div></div>';
        h += '<div><div class="lbl">GF</div><div class="val" style="color:#c8e0b4">' + gf + '</div></div>';
        h += '<div><div class="lbl">GA</div><div class="val" style="color:#c8e0b4">' + ga + '</div></div>';
        h += '<div><div class="lbl">GD</div><div class="val ' + H().balCls(gf - ga) + '">' + (gf - ga > 0 ? '+' : '') + (gf - ga) + '</div></div>';
        h += '<div><div class="lbl">Win %</div><div class="val" style="color:#c8e0b4">' + (filtered.length ? Math.round(wins / filtered.length * 100) : 0) + '%</div></div>';
        h += '</div>';

        h += '<div class="tmh-filter-bar">';
        h += '<span class="tmh-filter' + (matchFilter === 'all' ? ' active' : '') + '" data-f="all">All (' + matches.length + ')</span>';
        if (types.has('league')) {
            const cnt = matches.filter(m => matchTypeShort(m.matchType) === 'league').length;
            h += '<span class="tmh-filter' + (matchFilter === 'league' ? ' active' : '') + '" data-f="league">League (' + cnt + ')</span>';
        }
        if (types.has('cup')) {
            const cnt = matches.filter(m => matchTypeShort(m.matchType) === 'cup').length;
            h += '<span class="tmh-filter' + (matchFilter === 'cup' ? ' active' : '') + '" data-f="cup">Cup (' + cnt + ')</span>';
        }
        if (types.has('friendly')) {
            const cnt = matches.filter(m => matchTypeShort(m.matchType) === 'friendly').length;
            h += '<span class="tmh-filter' + (matchFilter === 'friendly' ? ' active' : '') + '" data-f="friendly">Friendly (' + cnt + ')</span>';
        }
        if (types.has('international')) {
            const cnt = matches.filter(m => matchTypeShort(m.matchType) === 'international').length;
            h += '<span class="tmh-filter' + (matchFilter === 'international' ? ' active' : '') + '" data-f="international">International (' + cnt + ')</span>';
        }
        h += '</div>';

        h += '<div class="tmh-match-list" id="tmh-match-list">';
        filtered.forEach(function (m) {
            const cls = m.outcome === 'win' ? 'tmh-win' : m.outcome === 'loss' ? 'tmh-loss' : 'tmh-draw';
            const p = m.result.split('-').map(Number);
            let homeWin = false, awayWin = false;
            if (p.length === 2 && p[0] > p[1]) homeWin = true;
            else if (p.length === 2 && p[1] > p[0]) awayWin = true;

            h += '<div class="tmh-match-row ' + cls + '" data-mid="' + m.matchId + '" data-season="' + m.matchSeason + '">';
            h += '<span class="tmh-match-date">' + m.day + '</span>';
            h += '<span class="tmh-match-type">' + m.matchType + '</span>';
            h += '<span class="tmh-match-home' + (homeWin ? ' tmh-winner' : '') + '">' + m.homeName + '</span>';
            h += '<span class="tmh-match-result">' + m.result + '</span>';
            h += '<span class="tmh-match-away' + (awayWin ? ' tmh-winner' : '') + '">' + m.awayName + '</span>';
            h += '</div>';
        });
        h += '</div>';

        h += '<div style="margin-top:10px">';
        h += '<button class="tmu-btn tmu-btn-secondary rounded-md py-1 px-2" id="tmh-pstats-btn">Load Player Stats</button>';
        h += '</div>';
        h += '<div id="tmh-pstats"></div>';

        c.html(h);

        c.on('click', '.tmh-filter', function () {
            matchFilter = $(this).data('f');
            renderMatchList(c, data, sid);
        });

        c.on('click', '#tmh-pstats-btn', function () {
            $(this).addClass('busy');
            loadPlayerStats(data, sid);
        });

        c.on('mouseenter', '.tmh-match-row', function () {
            const el = this;
            const mid = $(el).data('mid');
            const season = $(el).data('season');
            clearTimeout(_matchTooltipTimer);
            _matchTooltipTimer = setTimeout(function () { showMatchTooltip(el, mid, season); }, 300);
        });
        c.on('mouseleave', '.tmh-match-row', function () {
            clearTimeout(_matchTooltipTimer);
            hideMatchTooltip();
        });
    }

    /* ─── load player stats for all matches in a season ─── */
    function loadPlayerStats(data, sid) {
        const c = $('#tmh-pstats');
        const matches = data.matches;
        const filtered = matchFilter === 'all' ? matches : matches.filter(m => matchTypeShort(m.matchType) === matchFilter);
        if (!filtered.length) { c.html('<div class="tmh-ph">No matches to analyze</div>'); return; }

        c.html('<div class="tmh-load"><div class="tmu-spinner tmu-spinner-md" style="margin-bottom:6px"></div><br>Loading match data… <span id="tmh-pstats-prog">0/' + filtered.length + '</span>' +
               '<div class="tmh-prog"><div class="tmh-prog-bar" id="tmh-pstats-bar" style="width:0%"></div></div></div>');

        let done = 0;
        const queue = filtered.slice();
        const results = [];
        const currentSeasonNum = window.SESSION ? window.SESSION.season : 0;
        const concurrency = 4;
        let running = 0;

        function updateProg() {
            var pct = Math.round(done / filtered.length * 100);
            $('#tmh-pstats-prog').text(done + '/' + filtered.length);
            $('#tmh-pstats-bar').css('width', pct + '%');
        }

        function processNext() {
            if (!queue.length) {
                if (running === 0) {
                    aggregateAndRender(results, c, sid);
                }
                return;
            }
            const m = queue.shift();
            running++;
            const mid = m.matchId;
            const season = m.matchSeason;
            const isCurrentSeason = Number(season) === currentSeasonNum;

            if (_matchTooltipCache[mid]) {
                results.push({ matchData: _matchTooltipCache[mid], isRich: !!_matchTooltipCache[mid]._rich, matchInfo: m });
                done++; running--;
                updateProg();
                processNext();
                return;
            }

            const p = isCurrentSeason
                ? TmMatchService.fetchMatch(mid).then(function(d) {
                    if (d) { d._rich = true; _matchTooltipCache[mid] = d; results.push({ matchData: d, isRich: true, matchInfo: m }); }
                })
                : TmMatchService.fetchMatchTooltip(mid, season).then(function(d) {
                    if (d) { _matchTooltipCache[mid] = d; results.push({ matchData: d, isRich: false, matchInfo: m }); }
                });
            p.finally(function() { done++; running--; updateProg(); processNext(); });
        }

        for (let i = 0; i < Math.min(concurrency, queue.length); i++) {
            processNext();
        }
    }

    /* ─── aggregate stats from all fetched match tooltips ─── */
    function aggregateAndRender(results, c, sid) {
        const players = {};

        function getPlayer(name) {
            if (!name || name === '?') return null;
            if (!players[name]) players[name] = { name: name, goals: 0, yellows: 0, reds: 0, mom: 0 };
            return players[name];
        }

        results.forEach(function (r) {
            const d = r.matchData;
            const m = r.matchInfo;

            if (r.isRich) {
                const club = d.club || {};
                const hId = String(club.home ? club.home.id || '' : '');
                const aId = String(club.away ? club.away.id || '' : '');
                const report = d.report || {};
                const allMins = Object.keys(report).map(Number).sort(function (a, b) { return a - b; });

                allMins.forEach(function (min) {
                    var evts = report[min];
                    if (!Array.isArray(evts)) return;
                    evts.forEach(function (evt) {
                        if (!evt.parameters) return;
                        const evtClub = String(evt.club || '');
                        const isOurs = evtClub === String(_clubId);
                        if (!isOurs) return;
                        const params = Array.isArray(evt.parameters) ? evt.parameters : [evt.parameters];
                        params.forEach(function (p) {
                            if (p.goal) {
                                const scorer = (d.lineup && d.lineup.home && d.lineup.home[p.goal.player]) ||
                                               (d.lineup && d.lineup.away && d.lineup.away[p.goal.player]);
                                if (scorer) {
                                    const sp = getPlayer(scorer.nameLast || scorer.name);
                                    if (sp) sp.goals++;
                                }
                            }
                            if (p.yellow) {
                                const pl = (d.lineup && d.lineup.home && d.lineup.home[p.yellow]) ||
                                           (d.lineup && d.lineup.away && d.lineup.away[p.yellow]);
                                if (pl) { const pp = getPlayer(pl.nameLast || pl.name); if (pp) pp.yellows++; }
                            }
                            if (p.yellow_red) {
                                const pl2 = (d.lineup && d.lineup.home && d.lineup.home[p.yellow_red]) ||
                                            (d.lineup && d.lineup.away && d.lineup.away[p.yellow_red]);
                                if (pl2) { const pp2 = getPlayer(pl2.nameLast || pl2.name); if (pp2) pp2.reds++; }
                            }
                            if (p.red) {
                                const pl3 = (d.lineup && d.lineup.home && d.lineup.home[p.red]) ||
                                            (d.lineup && d.lineup.away && d.lineup.away[p.red]);
                                if (pl3) { const pp3 = getPlayer(pl3.nameLast || pl3.name); if (pp3) pp3.reds++; }
                            }
                        });
                    });
                });

                let allPlrs = [];
                if (d.lineup) {
                    if (d.lineup.home) allPlrs = allPlrs.concat(Object.values(d.lineup.home));
                    if (d.lineup.away) allPlrs = allPlrs.concat(Object.values(d.lineup.away));
                }
                const mom = allPlrs.find(function (p) { return p.mom === 1 || p.mom === '1'; });
                if (mom) {
                    const momInHome = d.lineup && d.lineup.home && Object.values(d.lineup.home).indexOf(mom) !== -1;
                    const momClub = momInHome ? hId : aId;
                    if (momClub === String(_clubId)) {
                        const mp = getPlayer(mom.nameLast || mom.name);
                        if (mp) mp.mom++;
                    }
                }

            } else {
                const report2 = d.report || {};
                const hTeamId = String(d.hometeam || '');
                const isHomeClub = hTeamId === String(_clubId);

                Object.keys(report2).forEach(function (k) {
                    if (k === 'mom' || k === 'mom_name') return;
                    const e = report2[k];
                    if (!e || !e.minute) return;
                    const isHome = String(e.team_scores) === hTeamId;
                    const isOurs = (isHomeClub && isHome) || (!isHomeClub && !isHome);
                    if (!isOurs) return;

                    const sc = e.score;
                    if (sc === 'yellow') {
                        const pp = getPlayer(e.scorer_name);
                        if (pp) pp.yellows++;
                    } else if (sc === 'red' || sc === 'orange') {
                        const pp2 = getPlayer(e.scorer_name);
                        if (pp2) pp2.reds++;
                    } else {
                        const gp = getPlayer(e.scorer_name);
                        if (gp) gp.goals++;
                    }
                });

                if (report2.mom_name) {
                    const mp2 = players[report2.mom_name];
                    if (mp2) mp2.mom++;
                }
            }
        });

        const arr = Object.values(players).filter(function (p) {
            return p.goals || p.yellows || p.reds || p.mom;
        });

        if (!arr.length) {
            c.html('<div class="tmh-ph">No player stats found</div>');
            return;
        }

        renderPlayerStatsTable(c, arr);
    }

    /* ─── sortable player stats table ─── */
    function renderPlayerStatsTable(c, arr) {
        const sec = document.createElement('div');
        sec.className = 'tmh-sec';
        sec.textContent = 'Player Stats';
        const tbl = TmUI.table({
            headers: [
                { key: 'name',    label: 'Player' },
                { key: 'goals',   label: '⚽ Goals',  align: 'c', render: v => v || '-' },
                { key: 'yellows', label: '🟡 Yellow', align: 'c', render: v => v || '-' },
                { key: 'reds',    label: '🔴 Red',    align: 'c', render: v => v || '-' },
                { key: 'mom',     label: '⭐ MOM',   align: 'c', render: v => v || '-' },
            ],
            items: arr, sortKey: 'goals', sortDir: -1,
        });
        c.html('');
        c[0].appendChild(sec);
        c[0].appendChild(tbl);
    }

    /* ─── build tooltip content from tooltip.ajax.php response ─── */
    function buildMatchTooltipContent(d) {
        const hName = d.hometeam_name || '';
        const aName = d.awayteam_name || '';
        const hId = d.hometeam || '';
        const aId = d.awayteam || '';
        const hLogoUrl = hId ? '/pics/club_logos/' + hId + '_140.png' : '';
        const aLogoUrl = aId ? '/pics/club_logos/' + aId + '_140.png' : '';

        let t = '';
        t += '<div class="tmh-tooltip-header">';
        if (hLogoUrl) t += '<img class="tmh-tooltip-logo" src="' + hLogoUrl + '" onerror="this.style.display=\'none\'">';
        t += '<span class="tmh-tooltip-team">' + hName + '</span>';
        t += '<span class="tmh-tooltip-score">' + (d.result || '') + '</span>';
        t += '<span class="tmh-tooltip-team">' + aName + '</span>';
        if (aLogoUrl) t += '<img class="tmh-tooltip-logo" src="' + aLogoUrl + '" onerror="this.style.display=\'none\'">';
        t += '</div>';

        t += '<div class="tmh-tooltip-meta">';
        if (d.date) t += '<span>📅 ' + d.date + '</span>';
        if (d.attendance_format) t += '<span>🏟 ' + d.attendance_format + '</span>';
        t += '</div>';

        const report = d.report || {};
        const hTeamId = String(d.hometeam || '');
        const goals = [];
        const cards = [];

        Object.keys(report).forEach(function (k) {
            if (k === 'mom' || k === 'mom_name') return;
            const e = report[k];
            if (!e || !e.minute) return;
            const sc = e.score;
            const isHome = String(e.team_scores) === hTeamId;
            if (sc === 'yellow' || sc === 'red' || sc === 'orange') {
                cards.push({ minute: e.minute, score: sc, name: e.scorer_name || '', isHome: isHome });
            } else {
                goals.push({ minute: e.minute, score: sc, name: e.scorer_name || '', isHome: isHome, assist: e.assist_id });
            }
        });
        var allEvents = goals.concat(cards);
        allEvents.sort(function (a, b) { return Number(a.minute) - Number(b.minute); });

        if (allEvents.length) {
            t += '<div class="tmh-tooltip-events">';
            allEvents.forEach(function (e) {
                var sideClass = e.isHome ? '' : ' away-evt';
                var isCard = e.score === 'yellow' || e.score === 'red' || e.score === 'orange';
                t += '<div class="tmh-tooltip-evt' + sideClass + '">';
                t += '<span class="tmh-tooltip-evt-min">' + e.minute + "'" + '</span>';
                if (isCard) {
                    var icon = e.score === 'yellow' ? '🟡' : e.score === 'orange' ? '🟡🟡→🔴' : '🔴';
                    t += '<span class="tmh-tooltip-evt-icon">' + icon + '</span>';
                    t += '<span class="tmh-tooltip-evt-text">' + e.name + '</span>';
                } else {
                    t += '<span class="tmh-tooltip-evt-icon">⚽</span>';
                    t += '<span class="tmh-tooltip-evt-text">' + e.name;
                    if (e.assist && e.assist !== '') {
                        t += ' <span class="tmh-tooltip-evt-assist">(' + e.score + ')</span>';
                    } else {
                        t += ' <span class="tmh-tooltip-evt-assist">' + e.score + '</span>';
                    }
                    t += '</span>';
                }
                t += '</div>';
            });
            t += '</div>';
        }

        if (report.mom_name) {
            t += '<div class="tmh-tooltip-mom">⭐ Man of the Match: <span>' + report.mom_name + '</span></div>';
        }
        return t;
    }

    /* ─── build rich tooltip from match.ajax.php (current season) ─── */
    function buildMatchRichTooltip(mData) {
        const md = mData.match_data || {};
        const club = mData.club || {};
        const hName = club.home ? club.home.club_name || '' : '';
        const aName = club.away ? club.away.club_name || '' : '';
        const hId = String(club.home ? club.home.id || '' : '');
        const aId = String(club.away ? club.away.id || '' : '');
        const hLogo = (club.home && club.home.logo) || '/pics/club_logos/' + hId + '_140.png';
        const aLogo = (club.away && club.away.logo) || '/pics/club_logos/' + aId + '_140.png';
        const report = mData.report || {};

        var finalScore = '0 - 0';
        var allMins = Object.keys(report).map(Number).sort(function (a, b) { return a - b; });
        for (var i = allMins.length - 1; i >= 0; i--) {
            var evts = report[allMins[i]];
            if (!Array.isArray(evts)) continue;
            for (var j = evts.length - 1; j >= 0; j--) {
                var p = evts[j].parameters;
                if (p) {
                    var goal = Array.isArray(p) ? p.find(function (x) { return x.goal; }) : p.goal ? p : null;
                    if (goal) {
                        var g = goal.goal || goal;
                        if (g.score) { finalScore = g.score.join(' - '); break; }
                    }
                }
            }
            if (finalScore !== '0 - 0') break;
        }

        var t = '';
        t += '<div class="tmh-tooltip-header">';
        t += '<img class="tmh-tooltip-logo" src="' + hLogo + '" onerror="this.style.display=\'none\'">';
        t += '<span class="tmh-tooltip-team">' + hName + '</span>';
        t += '<span class="tmh-tooltip-score">' + finalScore + '</span>';
        t += '<span class="tmh-tooltip-team">' + aName + '</span>';
        t += '<img class="tmh-tooltip-logo" src="' + aLogo + '" onerror="this.style.display=\'none\'">';
        t += '</div>';

        t += '<div class="tmh-tooltip-meta">';
        var ko = md.venue ? md.venue.kickoff_readable || '' : '';
        if (ko) {
            var dt = new Date(ko.replace(' ', 'T'));
            t += '<span>📅 ' + dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + '</span>';
        }
        if (md.venue && md.venue.name) t += '<span>🏟 ' + md.venue.name + '</span>';
        if (md.attendance) t += '<span>👥 ' + Number(md.attendance).toLocaleString() + '</span>';
        t += '</div>';

        var keyEvents = [];
        allMins.forEach(function (min) {
            var evts = report[min];
            if (!Array.isArray(evts)) return;
            evts.forEach(function (evt) {
                if (!evt.parameters) return;
                var params = Array.isArray(evt.parameters) ? evt.parameters : [evt.parameters];
                var evtClub = String(evt.club || '');
                var isHome = evtClub === hId;
                params.forEach(function (p) {
                    if (p.goal) {
                        var scorer = (mData.lineup && mData.lineup.home && mData.lineup.home[p.goal.player]) ||
                                     (mData.lineup && mData.lineup.away && mData.lineup.away[p.goal.player]);
                        var assistPl = (mData.lineup && mData.lineup.home && mData.lineup.home[p.goal.assist]) ||
                                       (mData.lineup && mData.lineup.away && mData.lineup.away[p.goal.assist]);
                        keyEvents.push({
                            min: min, type: 'goal', isHome: isHome,
                            name: scorer ? (scorer.nameLast || scorer.name || '?') : '?',
                            assist: assistPl ? (assistPl.nameLast || assistPl.name || '') : '',
                            score: p.goal.score ? p.goal.score.join('-') : ''
                        });
                    }
                    if (p.yellow) {
                        var pl = (mData.lineup && mData.lineup.home && mData.lineup.home[p.yellow]) ||
                                 (mData.lineup && mData.lineup.away && mData.lineup.away[p.yellow]);
                        keyEvents.push({ min: min, type: 'yellow', isHome: isHome, name: pl ? (pl.nameLast || pl.name || '?') : '?' });
                    }
                    if (p.yellow_red) {
                        var pl2 = (mData.lineup && mData.lineup.home && mData.lineup.home[p.yellow_red]) ||
                                  (mData.lineup && mData.lineup.away && mData.lineup.away[p.yellow_red]);
                        keyEvents.push({ min: min, type: 'red', isHome: isHome, name: pl2 ? (pl2.nameLast || pl2.name || '?') : '?' });
                    }
                    if (p.red) {
                        var pl3 = (mData.lineup && mData.lineup.home && mData.lineup.home[p.red]) ||
                                  (mData.lineup && mData.lineup.away && mData.lineup.away[p.red]);
                        keyEvents.push({ min: min, type: 'red', isHome: isHome, name: pl3 ? (pl3.nameLast || pl3.name || '?') : '?' });
                    }
                });
            });
        });

        keyEvents.sort(function (a, b) { return Number(a.min) - Number(b.min); });

        if (keyEvents.length) {
            t += '<div class="tmh-tooltip-events">';
            keyEvents.forEach(function (e) {
                var sideClass = e.isHome ? '' : ' away-evt';
                t += '<div class="tmh-tooltip-evt' + sideClass + '">';
                t += '<span class="tmh-tooltip-evt-min">' + e.min + "'" + '</span>';
                if (e.type === 'goal') {
                    t += '<span class="tmh-tooltip-evt-icon">⚽</span>';
                    t += '<span class="tmh-tooltip-evt-text">' + e.name;
                    if (e.assist) t += ' <span class="tmh-tooltip-evt-assist">(' + e.assist + ')</span>';
                    t += '</span>';
                } else {
                    var icon = e.type === 'yellow' ? '🟡' : '🔴';
                    t += '<span class="tmh-tooltip-evt-icon">' + icon + '</span>';
                    t += '<span class="tmh-tooltip-evt-text">' + e.name + '</span>';
                }
                t += '</div>';
            });
            t += '</div>';
        }

        var poss = md.possession;
        var statsData = md.statistics || {};
        var shotsH = statsData.home_shots || 0;
        var shotsA = statsData.away_shots || 0;
        var onTargetH = statsData.home_on_target || 0;
        var onTargetA = statsData.away_on_target || 0;

        if (poss || shotsH || shotsA) {
            t += '<div class="tmh-tooltip-stats">';
            if (poss) {
                var hP = poss.home || 0, aP = poss.away || 0;
                t += '<span class="tmh-tooltip-stat-home' + (hP > aP ? ' leading' : '') + '">' + hP + '%</span>';
                t += '<span class="tmh-tooltip-stat-label">Possession</span>';
                t += '<span class="tmh-tooltip-stat-away' + (aP > hP ? ' leading' : '') + '">' + aP + '%</span>';
            }
            if (shotsH || shotsA) {
                t += '<span class="tmh-tooltip-stat-home' + (shotsH > shotsA ? ' leading' : '') + '">' + shotsH + '</span>';
                t += '<span class="tmh-tooltip-stat-label">Shots</span>';
                t += '<span class="tmh-tooltip-stat-away' + (shotsA > shotsH ? ' leading' : '') + '">' + shotsA + '</span>';
            }
            if (onTargetH || onTargetA) {
                t += '<span class="tmh-tooltip-stat-home' + (onTargetH > onTargetA ? ' leading' : '') + '">' + onTargetH + '</span>';
                t += '<span class="tmh-tooltip-stat-label">On Target</span>';
                t += '<span class="tmh-tooltip-stat-away' + (onTargetA > onTargetH ? ' leading' : '') + '">' + onTargetA + '</span>';
            }
            t += '</div>';
        }

        var allPlayers = [];
        if (mData.lineup) {
            if (mData.lineup.home) allPlayers = allPlayers.concat(Object.values(mData.lineup.home));
            if (mData.lineup.away) allPlayers = allPlayers.concat(Object.values(mData.lineup.away));
        }
        var mom = allPlayers.find(function (p) { return p.mom === 1 || p.mom === '1'; });
        if (mom) {
            t += '<div class="tmh-tooltip-mom">⭐ Man of the Match: <span>' + (mom.nameLast || mom.name) + '</span> (' + parseFloat(mom.rating).toFixed(1) + ')</div>';
        }

        return t;
    }

    /* ─── tooltip positioning and show/hide ─── */
    function positionTooltip(el) {
        if (!_matchTooltipEl || !_matchTooltipEl.length) return;
        var rect = el.getBoundingClientRect();
        var ttW = _matchTooltipEl.outerWidth();
        var ttH = _matchTooltipEl.outerHeight();
        var left = rect.left + rect.width / 2 - ttW / 2;
        var top = rect.bottom + 4;
        if (top + ttH > window.innerHeight - 10) top = rect.top - ttH - 4;
        if (left < 8) left = 8;
        if (left + ttW > window.innerWidth - 8) left = window.innerWidth - ttW - 8;
        _matchTooltipEl.css({ left: left + 'px', top: top + 'px' });
    }

    function showMatchTooltip(el, mid, season) {
        clearTimeout(_matchTooltipHideTimer);
        if (_matchTooltipEl) _matchTooltipEl.remove();
        var currentSeasonNum = window.SESSION ? window.SESSION.season : 0;
        var isCurrentSeason = Number(season) === currentSeasonNum;
        _matchTooltipMid = mid;

        _matchTooltipEl = $('<div class="tmh-tooltip"></div>');
        $('body').append(_matchTooltipEl);
        positionTooltip(el);

        if (_matchTooltipCache[mid]) {
            var cached = _matchTooltipCache[mid];
            _matchTooltipEl.html(cached._rich ? buildMatchRichTooltip(cached) : buildMatchTooltipContent(cached));
            positionTooltip(el);
            requestAnimationFrame(function () { _matchTooltipEl.addClass('visible'); });
        } else {
            _matchTooltipEl.html('<div class="tmh-tooltip-loading">⏳ Loading...</div>');
            requestAnimationFrame(function () { _matchTooltipEl.addClass('visible'); });

            var onFail = function() {
                if (_matchTooltipEl) _matchTooltipEl.html('<div class="tmh-tooltip-loading" style="color:#ff6b6b">Failed</div>');
            };
            if (isCurrentSeason) {
                TmMatchService.fetchMatch(mid).then(function(d) {
                    if (!d) { onFail(); return; }
                    d._rich = true;
                    _matchTooltipCache[mid] = d;
                    if (_matchTooltipEl && _matchTooltipMid == mid) {
                        _matchTooltipEl.html(buildMatchRichTooltip(d));
                        positionTooltip(el);
                    }
                });
            } else {
                TmMatchService.fetchMatchTooltip(mid, season).then(function(d) {
                    if (!d) { onFail(); return; }
                    _matchTooltipCache[mid] = d;
                    if (_matchTooltipEl && _matchTooltipMid == mid) {
                        _matchTooltipEl.html(buildMatchTooltipContent(d));
                        positionTooltip(el);
                    }
                });
            }
        }
    }

    function hideMatchTooltip() {
        _matchTooltipHideTimer = setTimeout(function () {
            if (_matchTooltipEl) { _matchTooltipEl.remove(); _matchTooltipEl = null; }
        }, 100);
    }

    export const TmHistoryMatches = {
        render(el, ctx) {
            _el = el;
            _clubId = ctx.clubId;
            _seasons = ctx.seasons;
            if (currentSeason === null) currentSeason = ctx.seasons[0].id;
            renderMatches();
        }
    };
