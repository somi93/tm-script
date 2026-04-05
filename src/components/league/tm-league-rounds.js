import { TmFixtureRoundCards } from '../shared/tm-fixture-round-cards.js';
import { TmMatchService } from '../../services/match.js';
import { TMLeagueService } from '../../services/league.js';
import { TmLeagueFixtures } from './tm-league-fixtures.js';
import { TmLeagueSkillTable } from './tm-league-skill-table.js';
import { TmLeagueStandings } from './tm-league-standings.js';
import { TmUI } from '../shared/tm-ui.js';

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

    // Module-level caches (not on ctx — private to this component)
    const roundMatchCache   = new Map(); // matchId → { homeR5, awayR5, data }
    const roundFetchInFlight = new Set(); // matchIds currently being fetched
    let nativeRoundsCache = null; // captured early before TM ROUNDS box is removed

    // ─── Round navigation ────────────────────────────────────────────────

    /**
     * Parse the TM round table (#last_round_table or #next_round_table) into a list of matches.
     * Played matches have `result` set; upcoming matches have `result: null`.
     * Returns null if the container/table is missing or has no rows with club links.
     */
    const parseRoundFromDOM = (containerId, tableId) => {
        const table = document.getElementById(tableId);
        if (!table) return null;

        const container = document.getElementById(containerId) || table.parentElement;

        // Date: first <strong> in the container ("03. April 17:00" or similar)
        let isoDate = null;
        const strongEl = container && container.querySelector('strong');
        if (strongEl) {
            const m = strongEl.textContent.trim().match(/^(\d+)\.\s*([A-Za-z]+)/);
            if (m) {
                const MONTHS = ['january','february','march','april','may','june',
                    'july','august','september','october','november','december'];
                const monthIdx = MONTHS.indexOf(m[2].toLowerCase());
                if (monthIdx !== -1) {
                    const yr = new Date().getFullYear();
                    isoDate = `${yr}-${String(monthIdx + 1).padStart(2, '0')}-${String(parseInt(m[1], 10)).padStart(2, '0')}`;
                }
            }
        }
        if (!isoDate) return null;

        const matches = [];
        table.querySelectorAll('tbody tr').forEach(row => {
            const clubLinks = row.querySelectorAll('a[club_link]');
            if (clubLinks.length < 2) return;
            const matchLink = row.querySelector('a.match_link, a[href*="/matches/"]');
            const matchHref = matchLink?.getAttribute('href') || '';
            const idMatch = matchHref.match(/\/matches\/(\d+)\//);
            const scoreText = matchLink?.textContent.trim() || '';
            // Only treat as a result if the score looks like "N-N" (numbers and dash)
            const result = /^\d+-\d+$/.test(scoreText) ? scoreText : null;
            matches.push({
                id: idMatch ? idMatch[1] : null,
                date: isoDate,
                hometeam: clubLinks[0].getAttribute('club_link'),
                hometeam_name: clubLinks[0].textContent.trim(),
                awayteam: clubLinks[1].getAttribute('club_link'),
                awayteam_name: clubLinks[1].textContent.trim(),
                result,
                _playoff: true,
            });
        });
        return matches.length ? { date: isoDate, matches } : null;
    };

    const buildRounds = (fixtures) => {
        const s = window.TmLeagueCtx;

        // Use pre-captured round data (captured before TM removes the ROUNDS box).
        const domRounds = (nativeRoundsCache || []).filter(Boolean);

        if (domRounds.length) {
            const existingIds = new Set();
            Object.values(fixtures || {}).forEach(month => {
                (month?.matches || []).forEach(m => { if (m.id) existingIds.add(String(m.id)); });
            });
            let extra = {};
            domRounds.forEach((round, i) => {
                const newMatches = round.matches.filter(m => !m.id || !existingIds.has(String(m.id)));
                if (newMatches.length) extra[`__dom_${i}__`] = { matches: newMatches };
            });
            if (Object.keys(extra).length) {
                fixtures = Object.assign({}, fixtures, extra);
                s.fixturesCache = fixtures;
            }
        }
        const currentSeason = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;
        const highlightClubId = (typeof SESSION !== 'undefined' && SESSION.main_id) ? String(SESSION.main_id) : '';
        const roundPanel = document.getElementById('rnd-panel');
        if (roundPanel) {
            TmFixtureRoundCards.mount(roundPanel, {
                fixtures,
                season: currentSeason,
                highlightClubId,
                titlePrefix: 'Round',
                onRoundChange: ({ rounds, currentIndex }) => {
                    s.setRoundsData(rounds, currentIndex);
                },
            });
        }

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
        if (!s.fixturesCache) return;
        const currentSeason = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;
        const highlightClubId = (typeof SESSION !== 'undefined' && SESSION.main_id) ? String(SESSION.main_id) : '';
        TmFixtureRoundCards.mount(document.getElementById('rnd-panel'), {
            fixtures: s.fixturesCache,
            season: currentSeason,
            highlightClubId,
            titlePrefix: 'Round',
            initialIndex: s.currentRoundIdx,
            onRoundChange: ({ rounds, currentIndex }) => {
                s.setRoundsData(rounds, currentIndex);
            },
        });
    };

    // ─── Match cache & rating cells ──────────────────────────────────────

    const fetchRoundRatings = (round) => {
        round.matches.forEach(m => {
            if (!m.result) return; // skip upcoming
            const mid = String(m.id);
            if (roundMatchCache.has(mid) || roundFetchInFlight.has(mid)) return;
            roundFetchInFlight.add(mid);
            TmMatchService.fetchMatchCached(mid)
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
        const content = document.getElementById('tsa-content');
        if (content) content.innerHTML = TmUI.loading('Analyzing...');
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
                TmMatchService.fetchMatchCached(id)
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
            TMLeagueService.fetchLeagueFixtures('league', { var1: s.leagueCountry, var2: s.leagueDivision, var3: s.leagueGroup })
                .then(data => {
                    if (!data) return;
                    s.fixturesCache = data;
                    buildRounds(s.fixturesCache);
                    doAnalysis(s.fixturesCache);
                });
        }
    };

    /**
     * Call this BEFORE TM's native ROUNDS box is removed from the DOM.
     * Captures last/next round data so buildRounds can use it later.
     */
    const captureNativeRounds = () => {
        nativeRoundsCache = [
            parseRoundFromDOM('last_round', 'last_round_table'),
            parseRoundFromDOM('next_round', 'next_round_table'),
        ];
    };

    export const TmLeagueRounds = {
        startAnalysis,
        captureNativeRounds,
    };
