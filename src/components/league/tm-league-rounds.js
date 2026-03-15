import { TmApi }  from '../../services/index.js' ;
import { TmLeagueFixtures } from './tm-league-fixtures.js';
import { TmLeagueSkillTable } from './tm-league-skill-table.js';
import { TmLeagueStandings } from './tm-league-standings.js';

/**
 * TmLeagueRounds
 *
 * Round navigation widget, per-match R5 ratings, and the full squad-analysis
 * pipeline (processMatchData / startAnalysis).
 *
 * Reads/writes from window.TmLeagueCtx:
 *   allRounds, currentRoundIdx, fixturesCache    (r/w)
 *   clubMap, clubDatas, clubPlayersMap            (r/w)
 *   leagueCountry, leagueDivision, leagueGroup   (r)
 *   panelLeagueName                              (r/w)
 *   numLastRounds, totalExpected, totalProcessed (r/w)
 *   analysisInterval                             (r/w)
 *   R5_THRESHOLDS, getColor                      (r)
 *   fetchSquad, computeTeamStats, updateProgress (r — functions on ctx)
 *
 * Cross-component calls:
 *   TmLeagueStandings.buildStandingsFromDOM()
 *   TmLeagueStandings.renderLeagueTable()
 *   TmLeagueFixtures.renderFixturesTab(fixtures)
 *   TmLeagueSkillTable.showSkill()
 */

    if (!document.getElementById('tsa-league-rounds-style')) {
        const _s = document.createElement('style');
        _s.id = 'tsa-league-rounds-style';
        _s.textContent = `
            .tmu-card-head.rnd-nav { padding: 6px 12px; }
            .tmu-card-head.rnd-nav .rnd-title { flex: 1; text-align: center; }
            .rnd-nav-btn {
                width: 24px; height: 24px;
                font-size: 0; line-height: 0;
                display: inline-flex; align-items: center; justify-content: center;
                border-radius: 4px; padding: 0;
                background: none; border: none; color: #a0c888; cursor: pointer;
                transition: color 0.15s;
            }
            .rnd-nav-btn svg { width: 16px; height: 16px; fill: currentColor; }
            .rnd-nav-btn:disabled { opacity: 0.3; cursor: default; }
            .rnd-nav-btn:not(:disabled):hover { color: #fff; }
            .tsa-table td.rnd-home { text-align: right; padding-right: 8px !important; width: 42%; }
            .tsa-table td.rnd-away { text-align: left; padding-left: 8px !important; width: 42%; }
            .rnd-team-wrap { display: inline-flex; align-items: center; gap: 6px; width: 100%; }
            .rnd-home .rnd-team-wrap { justify-content: space-between; }
            .rnd-away .rnd-team-wrap { justify-content: space-between; }
            .rnd-logo { width: 18px; height: 18px; vertical-align: middle; }
            .tsa-table td.rnd-score { width: 16%; cursor: pointer; transition: background 0.15s; }
            .tsa-table td.rnd-score:hover { background: rgba(255,255,255,0.08); }
            .rnd-rating {
                font-size: 11px; font-weight: 700;
                font-variant-numeric: tabular-nums;
                color: #90b878;
            }
            .tsa-table td.rnd-score {
                text-align: center; color: #f0fce0;
                font-weight: 700; font-size: 13px; min-width: 40px;
            }
            .tsa-table td.rnd-score-upcoming { color: #90b878; font-weight: 400; font-size: 11px; }
            .rnd-info-btn {
                background: none; border: none;
                color: #90b878; cursor: pointer;
                font-size: 14px; padding: 2px 4px;
                transition: color 0.15s;
            }
            .rnd-info-btn:hover { color: #c8e0b4; }
            #rnd-content .tsa-table td { padding: 4px 6px; }
        `;
        document.head.appendChild(_s);
    }

    // Module-level caches (not on ctx — private to this component)
    const roundMatchCache   = new Map(); // matchId → { homeR5, awayR5, data }
    const roundFetchInFlight = new Set(); // matchIds currently being fetched

    // ─── Round navigation ────────────────────────────────────────────────

    const buildRounds = (fixtures) => {
        const s = window.TmLeagueCtx;

        // Collect ALL matches (played + upcoming)
        const allMatches = [];
        Object.values(fixtures).forEach(month => {
            if (month?.matches) month.matches.forEach(m => allMatches.push(m));
        });

        // Group by date → each date is one round
        const byDate = {};
        allMatches.forEach(m => {
            (byDate[m.date] = byDate[m.date] || []).push(m);
        });

        // Sort dates ascending, assign round numbers
        const sortedDates = Object.keys(byDate).sort((a, b) => new Date(a) - new Date(b));
        const rounds = sortedDates.map((date, idx) => ({
            roundNum: idx + 1,
            date,
            matches: byDate[date]
        }));

        // Determine current round: last round with any results, or 0
        let current = 0;
        for (let i = rounds.length - 1; i >= 0; i--) {
            if (rounds[i].matches.some(m => m.result)) {
                current = i;
                break;
            }
        }
        s.setRoundsData(rounds, current);

        // Trigger round-panel render if UI is ready
        if (document.getElementById('rnd-content')) renderRound();

        // Rebuild standings form data now that fixtures are loaded
        TmLeagueStandings.buildStandingsFromDOM();
        TmLeagueStandings.renderLeagueTable();

        // Render fixtures tab (hidden until user clicks it)
        if (document.getElementById('tsa-fixtures-content')) {
            TmLeagueFixtures.renderFixturesTab(fixtures);
        }
    };

    const renderRound = () => {
        const s = window.TmLeagueCtx;
        if (!s.allRounds.length) {
            $('#rnd-title').text('Round —');
            $('#rnd-content').html('<div style="text-align:center;padding:12px;color:#5a7a48;font-size:12px;">No rounds available</div>');
            return;
        }
        const round = s.allRounds[s.currentRoundIdx];
        $('#rnd-title').text(`Round ${round.roundNum}`);
        $('#rnd-prev').prop('disabled', s.currentRoundIdx <= 0);
        $('#rnd-next').prop('disabled', s.currentRoundIdx >= s.allRounds.length - 1);

        let html = '<table class="tsa-table">';
        round.matches.forEach((m, idx) => {
            const rowClass  = idx % 2 === 0 ? 'tsa-even' : 'tsa-odd';
            const homeName  = s.clubMap.get(String(m.hometeam)) || m.hometeam;
            const awayName  = s.clubMap.get(String(m.awayteam)) || m.awayteam;
            const score     = m.result ? m.result : '—';
            const scoreClass = m.result ? 'rnd-score' : 'rnd-score rnd-score-upcoming';

            html += `<tr class="${rowClass}">
                <td class="rnd-home">
                    <div class="rnd-team-wrap">
                        <span class="rnd-rating" id="rnd-r-h-${m.id}">—</span>
                        <span class="tsa-club">${homeName}</span>
                    </div>
                </td>
                <td class="${scoreClass}" data-match-id="${m.id}">${score}</td>
                <td class="rnd-away">
                    <div class="rnd-team-wrap">
                        <span class="tsa-club">${awayName}</span>
                        <span class="rnd-rating" id="rnd-r-a-${m.id}">—</span>
                    </div>
                </td>
            </tr>`;
        });
        html += '</table>';
        $('#rnd-content').html(html);

        // Click score → open match page
        $('#rnd-content').off('click', '.rnd-score').on('click', '.rnd-score', function () {
            const mid = $(this).data('match-id');
            if (mid) window.location.href = `/matches/${mid}/`;
        });

        // Fill ratings from cache
        round.matches.forEach(m => {
            const c = roundMatchCache.get(String(m.id));
            if (c) fillRatingCells(String(m.id), c.homeR5, c.awayR5);
        });

        // Fetch ratings for played matches not yet in cache
        fetchRoundRatings(round);
    };

    // ─── Match cache & rating cells ──────────────────────────────────────

    const fetchRoundRatings = (round) => {
        round.matches.forEach(m => {
            if (!m.result) return; // skip upcoming
            const mid = String(m.id);
            if (roundMatchCache.has(mid) || roundFetchInFlight.has(mid)) return;
            roundFetchInFlight.add(mid);
            TmApi.fetchMatchCached(mid)
                .then(data => {
                    roundFetchInFlight.delete(mid);
                    if (data) processRoundMatchData(mid, data);
                })
                .catch(e => {
                    roundFetchInFlight.delete(mid);
                    console.warn('[League] fetchRoundRatings error', mid, e);
                });
        });
    };

    const fillRatingCells = (matchId, homeR5, awayR5) => {
        const s = window.TmLeagueCtx;
        const hEl = document.getElementById(`rnd-r-h-${matchId}`);
        const aEl = document.getElementById(`rnd-r-a-${matchId}`);
        if (hEl) {
            hEl.textContent  = homeR5.toFixed(2);
            hEl.style.color  = s.getColor(homeR5, s.R5_THRESHOLDS);
        }
        if (aEl) {
            aEl.textContent  = awayR5.toFixed(2);
            aEl.style.color  = s.getColor(awayR5, s.R5_THRESHOLDS);
        }
    };

    /** Processes a single match for the Rounds panel only (never touches totalProcessed). */
    const processRoundMatchData = (matchId, data) => {
        const s = window.TmLeagueCtx;
        const homeId = String(data.club.home.id);
        const awayId = String(data.club.away.id);
        Promise.all([s.fetchSquad(homeId), s.fetchSquad(awayId)]).then(([homeSquad, awaySquad]) => {
            return Promise.all([
                s.computeTeamStats(Object.keys(data.lineup.home), data.lineup.home, homeSquad),
                s.computeTeamStats(Object.keys(data.lineup.away), data.lineup.away, awaySquad)
            ]);
        }).then(([homeResult, awayResult]) => {
            const homeR5 = Number((homeResult.totals.R5 / 11).toFixed(2));
            const awayR5 = Number((awayResult.totals.R5 / 11).toFixed(2));
            roundMatchCache.set(String(matchId), { homeR5, awayR5, data });
            fillRatingCells(String(matchId), homeR5, awayR5);
        }).catch(e => console.warn('[League] processRoundMatchData error', matchId, e));
    };

    const showLoading = () => {
        $('#tsa-content').html(`
            <div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">
                <div style="margin-bottom:6px;">⏳</div>Analyzing...
            </div>
        `);
    };

    // ─── Full squad-analysis pipeline ────────────────────────────────────

    /** Processes a match for the full analysis (updates clubDatas, clubPlayersMap, totalProcessed). */
    const processMatchData = (matchId, data) => {
        const s = window.TmLeagueCtx;
        const homeId = String(data.club.home.id);
        const awayId = String(data.club.away.id);

        // Capture tournament name from first available match
        if (!s.panelLeagueName && data.match_data?.venue?.tournament) {
            s.panelLeagueName = data.match_data.venue.tournament;
            const el = document.getElementById('tsa-panel-league-name');
            if (el) el.textContent = s.panelLeagueName;
        }

        const homeLineup = data.lineup.home;
        const awayLineup = data.lineup.away;
        Promise.all([s.fetchSquad(homeId), s.fetchSquad(awayId)]).then(([homeSquad, awaySquad]) => {
            return Promise.all([
                s.computeTeamStats(Object.keys(homeLineup), homeLineup, homeSquad),
                s.computeTeamStats(Object.keys(awayLineup), awayLineup, awaySquad)
            ]);
        }).then(([homeResult, awayResult]) => {
            if (!s.clubDatas.has(homeId)) s.clubDatas.set(homeId, []);
            if (!s.clubDatas.has(awayId)) s.clubDatas.set(awayId, []);
            s.clubDatas.get(homeId).push(homeResult.totals);
            s.clubDatas.get(awayId).push(awayResult.totals);

            // Per-player tracking (latest match overwrites previous)
            if (!s.clubPlayersMap.has(homeId)) s.clubPlayersMap.set(homeId, new Map());
            if (!s.clubPlayersMap.has(awayId)) s.clubPlayersMap.set(awayId, new Map());
            homeResult.players.forEach(p => s.clubPlayersMap.get(homeId).set(p.id, {
                name: p.name, pos: p.pos, R5: p.R5, REC: p.REC, Age: p.Age,
                skills: p.skills, isGK: p.isGK, routine: p.routine
            }));
            awayResult.players.forEach(p => s.clubPlayersMap.get(awayId).set(p.id, {
                name: p.name, pos: p.pos, R5: p.R5, REC: p.REC, Age: p.Age,
                skills: p.skills, isGK: p.isGK, routine: p.routine
            }));

            // Cache per-match R5 for Rounds panel
            const homeR5 = Number((homeResult.totals.R5 / 11).toFixed(2));
            const awayR5 = Number((awayResult.totals.R5 / 11).toFixed(2));
            roundMatchCache.set(String(matchId), { homeR5, awayR5, data });
            fillRatingCells(String(matchId), homeR5, awayR5);

            s.totalProcessed += 2;
            s.updateProgress(`Processed ${s.totalProcessed}/${s.totalExpected}`);
        }).catch(e => {
            console.warn('[League] processMatchData error:', e);
            s.totalProcessed += 2;
        });
    };

    const startAnalysis = n => {
        const s = window.TmLeagueCtx;
        s.numLastRounds = n;
        s.beginAnalysis();
        s.updateProgress('Fetching fixtures...');
        showLoading();

        const doAnalysis = (fixtures) => {
            // Collect all played matches
            const allPlayed = [];
            Object.values(fixtures).forEach(month => {
                if (month?.matches) month.matches.forEach(m => { if (m.result) allPlayed.push(m); });
            });

            // Group by date (each date = one matchday)
            const byDate = {};
            allPlayed.forEach(m => {
                (byDate[m.date] = byDate[m.date] || []).push(m);
            });

            // Take last N matchdays
            const dates    = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a)).slice(0, s.numLastRounds);
            const matchIds = dates.flatMap(d => byDate[d].map(m => String(m.id)));

            s.totalExpected = matchIds.length * 2;
            s.updateProgress(`Loading ${matchIds.length} matches (${dates.length} rounds)...`);

            matchIds.forEach(id => {
                TmApi.fetchMatchCached(id)
                    .then(data => {
                        if (data) processMatchData(id, data);
                        else s.totalProcessed += 2;
                    })
                    .catch(() => { s.totalProcessed += 2; });
            });

            // Poll for completion, then show skill table
            if (s.analysisInterval) clearInterval(s.analysisInterval);
            s.analysisInterval = setInterval(() => {
                if (s.totalExpected > 0 && s.totalProcessed >= s.totalExpected) {
                    clearInterval(s.analysisInterval);
                    s.analysisInterval = null;
                    s.updateProgress('');
                    TmLeagueSkillTable.showSkill();
                }
            }, 500);
        };

        if (s.fixturesCache) {
            doAnalysis(s.fixturesCache);
        } else {
            TmApi.fetchLeagueFixtures(s.leagueCountry, s.leagueDivision, s.leagueGroup)
                .then(data => {
                    if (!data) return;
                    s.fixturesCache = data;
                    buildRounds(s.fixturesCache);
                    doAnalysis(s.fixturesCache);
                });
        }
    };

    export const TmLeagueRounds = {
        buildRounds,
        renderRound,
        fetchRoundRatings,
        fillRatingCells,
        processRoundMatchData,
        showLoading,
        processMatchData,
        startAnalysis,
        roundMatchCache,
        roundFetchInFlight,
    };
