import { TmClubModel } from '../../models/club.js';
import { TmMatchModel } from '../../models/match.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmHistoryHelpers } from './tm-history-helpers.js';
import { TmSummaryStrip } from '../shared/tm-summary-strip.js';
import { TmSeasonBar } from '../shared/tm-season-bar.js';
import { TmFixturesList } from '../shared/tm-fixtures-list.js';
import { TmFixtureMatchRow } from '../shared/tm-fixture-match-row.js';

const H = () => TmHistoryHelpers;

/* ── module state ── */
let _clubId = null, _seasons = null, _el = null;
let matchesCache = {};
let matchFilter = 'all';
let currentSeason = null;
let _matchDataCache = {};

/* ═══════════════════════════════════════
   MATCHES TAB
   ═══════════════════════════════════════ */
function renderMatches() {
    const el = _el;
    const matchSeasons = _seasons.filter(s => s.id != _seasons[0].id);
    if (!matchSeasons.length) {
        el.innerHTML = TmUI.empty('No past seasons found');
        return;
    }

    const validSeason = matchSeasons.find(s => s.id == currentSeason) ? currentSeason : matchSeasons[0].id;
    if (validSeason !== currentSeason) currentSeason = validSeason;

    el.innerHTML = '<div id="tmh-mdata"></div>';

    function goSeason(sid) { currentSeason = sid; renderMatches(); }

    TmSeasonBar.mount(el, { seasons: matchSeasons, current: currentSeason, onChange: goSeason });
    el.appendChild(el.querySelector('#tmh-mdata'));

    loadMatches(currentSeason);
}

/* ─── load matches for a season ─── */
function loadMatches(sid) {
    const c = document.getElementById('tmh-mdata');
    if (!c) return;
    if (matchesCache[sid]) { renderMatchList(c, matchesCache[sid], sid); return; }

    c.innerHTML = TmUI.loading('Loading Season ' + sid + ' matches…');

    TmClubModel.fetchClubMatchHistory(_clubId, sid).then(function (html) {
        if (!html) { c.innerHTML = TmUI.error('Failed to load matches'); return; }
        const d = parseMatchesHtml(html);
        matchesCache[sid] = d;
        renderMatchList(c, d, sid);
    });
}

/* ─── parse matches HTML ─── */
function parseMatchesHtml(html) {
    const doc = document.createElement('div');
    doc.innerHTML = html;
    const matches = [];

    Array.from(doc.querySelectorAll('.match_list li')).forEach(function (li) {
        const calImg = li.querySelector('.match_date img')?.getAttribute('src') || '';
        const dayMatch = calImg.match(/calendar_numeral_(\d+)/);
        const day = dayMatch ? dayMatch[1] : '';

        const matchType = li.querySelector('.matchtype')?.textContent.trim() || '';

        const homeEl = li.querySelector('.hometeam a');
        const homeName = homeEl?.textContent.trim() || '';
        const homeLink = homeEl?.getAttribute('club_link') || '';

        const awayEl = li.querySelector('.awayteam a');
        const awayName = awayEl?.textContent.trim() || '';
        const awayLink = awayEl?.getAttribute('club_link') || '';

        const resultEl = li.querySelector('.match_results span[match_link]');
        const result = resultEl?.querySelector('a')?.textContent.trim() || '';
        const matchId = resultEl?.getAttribute('match_link') || '';
        const matchSeason = resultEl?.getAttribute('match_season') || '';

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

    return { matches };
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
        c.innerHTML = TmUI.empty('No matches found for this season');
        return;
    }

    const typeCounts = new Map();
    matches.forEach(m => {
        const type = matchTypeShort(m.matchType);
        typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    });

    const filtered = (matchFilter === 'all' ? matches : matches.filter(m => matchTypeShort(m.matchType) === matchFilter))
        .map(m => {
            const scoreParts = m.result.split('-').map(Number);
            const hasNumericScore = scoreParts.length === 2 && !isNaN(scoreParts[0]) && !isNaN(scoreParts[1]);
            const scoreHome = hasNumericScore ? scoreParts[0] : null;
            const scoreAway = hasNumericScore ? scoreParts[1] : null;
            return {
                ...m,
                _scoreHome: scoreHome,
                _scoreAway: scoreAway,
                _homeWin: hasNumericScore && scoreHome > scoreAway,
                _awayWin: hasNumericScore && scoreAway > scoreHome,
            };
        });

    let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;
    filtered.forEach(m => {
        if (m.outcome === 'win') wins++;
        else if (m.outcome === 'loss') losses++;
        else draws++;
        if (m._scoreHome !== null && m._scoreAway !== null) {
            if (m.isHome) { gf += m._scoreHome; ga += m._scoreAway; }
            else { gf += m._scoreAway; ga += m._scoreHome; }
        }
    });

    let h = '';

    h += TmSummaryStrip.render([
        { label: 'Played', value: String(filtered.length) },
        { label: 'Won', value: String(wins), valueCls: 'tmh-pos' },
        { label: 'Drawn', value: String(draws), valueCls: 'tmh-neut' },
        { label: 'Lost', value: String(losses), valueCls: 'tmh-neg' },
        { label: 'GF', value: String(gf) },
        { label: 'GA', value: String(ga) },
        { label: 'GD', valueHtml: (gf - ga > 0 ? '+' : '') + String(gf - ga), valueCls: H().balCls(gf - ga) },
        { label: 'Win %', value: (filtered.length ? Math.round(wins / filtered.length * 100) : 0) + '%' },
    ], { variant: 'boxed', valueFirst: true, align: 'center' });

    const filterBtn = (f, label, active) =>
        `<button class="tmu-btn tmu-btn-primary tmu-btn-sm rounded-full${active ? ' tmu-btn-active' : ''}" data-f="${f}">${label}</button>`;

    h += '<div class="tmh-filter-bar">';
    h += filterBtn('all', 'All (' + matches.length + ')', matchFilter === 'all');
    if (typeCounts.has('league')) h += filterBtn('league', 'League (' + typeCounts.get('league') + ')', matchFilter === 'league');
    if (typeCounts.has('cup')) h += filterBtn('cup', 'Cup (' + typeCounts.get('cup') + ')', matchFilter === 'cup');
    if (typeCounts.has('friendly')) h += filterBtn('friendly', 'Friendly (' + typeCounts.get('friendly') + ')', matchFilter === 'friendly');
    if (typeCounts.has('international')) h += filterBtn('international', 'International (' + typeCounts.get('international') + ')', matchFilter === 'international');
    h += '</div>';

    h += '<div id="tmh-match-list"></div>';
    h += '<div style="margin-top:var(--tmu-space-md)">';
    h += TmUI.button({ color: 'secondary', size: 'xs', id: 'tmh-pstats-btn', label: 'Load Player Stats', cls: 'tmh-btn' }).outerHTML;
    h += '</div>';
    h += '<div id="tmh-pstats"></div>';

    c.innerHTML = h;

    const listEl = c.querySelector('#tmh-match-list');
    listEl.innerHTML = filtered.map(m => TmFixtureMatchRow.render(
        { matchId: m.matchId, homeId: m.homeLink, homeName: m.homeName, awayId: m.awayLink, awayName: m.awayName, scoreText: m.result, matchtype_sort: m.matchType },
        { myClubId: String(_clubId), season: m.matchSeason, showType: true }
    )).join('');
    TmFixturesList.bindHover(listEl, { season: sid });
    TmFixturesList.bindRowNav(listEl);

    c.addEventListener('click', function (e) {
        if (e.target.closest('[data-f]')) { matchFilter = e.target.closest('[data-f]').dataset.f; renderMatchList(c, data, sid); return; }
        const statsBtn = e.target.closest('#tmh-pstats-btn');
        if (statsBtn) { statsBtn.classList.add('busy'); loadPlayerStats(data); }
    });
}

/* ─── load player stats for all matches in a season ─── */
function loadPlayerStats(data) {
    const c = document.getElementById('tmh-pstats');
    if (!c) return;
    const matches = data.matches;
    const filtered = matchFilter === 'all' ? matches : matches.filter(m => matchTypeShort(m.matchType) === matchFilter);
    if (!filtered.length) {
        c.innerHTML = TmUI.empty('No matches to analyze');
        return;
    }

    const progress = H().progressState(c, { message: 'Loading match data…', total: filtered.length });

    let done = 0;
    const queue = filtered.slice();
    const results = [];
    const currentSeasonNum = window.SESSION ? window.SESSION.season : 0;
    const concurrency = 4;
    let running = 0;

    function updateProg() {
        progress.update(done);
    }

    function processNext() {
        if (!queue.length) {
            if (running === 0) {
                aggregateAndRender(results, c);
            }
            return;
        }

        const m = queue.shift();
        running++;
        const mid = m.matchId;
        const season = m.matchSeason;
        const isCurrentSeason = Number(season) === currentSeasonNum;

        if (_matchDataCache[mid]) {
            results.push({ matchData: _matchDataCache[mid], isRich: !!_matchDataCache[mid]._rich, matchInfo: m });
            done++;
            running--;
            updateProg();
            processNext();
            return;
        }

        const p = isCurrentSeason
            ? TmMatchModel.fetchMatch(mid).then(function (d) {
                if (d) {
                    d._rich = true;
                    _matchDataCache[mid] = d;
                    results.push({ matchData: d, isRich: true, matchInfo: m });
                }
            })
            : TmMatchModel.fetchTooltip(mid, season).then(function (d) {
                if (d) {
                    _matchDataCache[mid] = d;
                    results.push({ matchData: d, isRich: false, matchInfo: m });
                }
            });

        p.finally(function () {
            done++;
            running--;
            updateProg();
            processNext();
        });
    }

    for (let i = 0; i < Math.min(concurrency, queue.length); i++) {
        processNext();
    }
}

/* ─── aggregate stats from all fetched match tooltips ─── */
function aggregateAndRender(results, c) {
    const players = {};

    function getPlayer(name) {
        if (!name || name === '?') return null;
        if (!players[name]) players[name] = { name: name, goals: 0, yellows: 0, reds: 0, mom: 0 };
        return players[name];
    }

    results.forEach(function (r) {
        const d = r.matchData;

        if (r.isRich) {
            const hId = String(d.home?.club?.id || '');
            const aId = String(d.away?.club?.id || '');
            const report = d.report || {};
            // Build pid → player map for lookups (new Match format has lineup as array)
            const allLineup = [...(d.home?.lineup || []), ...(d.away?.lineup || [])];
            const playerById = Object.fromEntries(allLineup.map(p => [String(p.id), p]));
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
                            const scorer = playerById[String(p.goal.player)];
                            if (scorer) {
                                const sp = getPlayer(scorer.nameLast || scorer.name);
                                if (sp) sp.goals++;
                            }
                        }
                        if (p.yellow) {
                            const pl = playerById[String(p.yellow)];
                            if (pl) {
                                const pp = getPlayer(pl.nameLast || pl.name);
                                if (pp) pp.yellows++;
                            }
                        }
                        if (p.yellow_red) {
                            const pl2 = playerById[String(p.yellow_red)];
                            if (pl2) {
                                const pp2 = getPlayer(pl2.nameLast || pl2.name);
                                if (pp2) pp2.reds++;
                            }
                        }
                        if (p.red) {
                            const pl3 = playerById[String(p.red)];
                            if (pl3) {
                                const pp3 = getPlayer(pl3.nameLast || pl3.name);
                                if (pp3) pp3.reds++;
                            }
                        }
                    });
                });
            });

            const mom = allLineup.find(function (p) { return p.mom === 1 || p.mom === '1'; });
            if (mom) {
                const momInHome = d.home?.playerIds?.has(String(mom.id));
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
        c.innerHTML = TmUI.empty('No player stats found');
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
            { key: 'name', label: 'Player' },
            { key: 'goals', label: '⚽ Goals', align: 'c', render: v => v || '-' },
            { key: 'yellows', label: '🟡 Yellow', align: 'c', render: v => v || '-' },
            { key: 'reds', label: '🔴 Red', align: 'c', render: v => v || '-' },
            { key: 'mom', label: '⭐ MOM', align: 'c', render: v => v || '-' },
        ],
        items: arr, sortKey: 'goals', sortDir: -1,
    });
    c.innerHTML = '';
    c.appendChild(sec);
    c.appendChild(tbl);
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
