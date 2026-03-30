import { TmMatchService } from '../../services/match.js';
import { TMLeagueService } from '../../services/league.js';
import { TmMatchComparisonRow } from './tm-match-comparison-row.js';
import { TmMatchUtils } from '../../utils/match.js';
import { TmTable } from '../shared/tm-table.js';
import { TmUI } from '../shared/tm-ui.js';

const minuteBadgeHtml = (label) => TmUI.badge({ icon: '⏱', label, size: 'md', shape: 'full', weight: 'bold' }, 'live');

let leagueTabCache = null;

const ensureLeagueCache = (country, division, group) => {
    if (!leagueTabCache || leagueTabCache.country !== country || leagueTabCache.division !== division || leagueTabCache.group !== group) {
        leagueTabCache = {
            country,
            division,
            group,
            fixtures: null,
            fixturesPromise: null,
            matchDataById: {},
            matchPromisesById: {},
            failedMatchIds: {},
        };
    }
    return leagueTabCache;
};

const cloneMatchData = (mData) => TmMatchUtils.cloneMatchData(mData);

const buildPositionArrow = (diff) => {
    if (diff > 0) return `<span class="pos-arrow pos-up">▲${diff}</span>`;
    if (diff < 0) return `<span class="pos-arrow pos-down">▼${Math.abs(diff)}</span>`;
    return '<span class="pos-arrow pos-same">–</span>';
};

const createStandingsTable = ({ rows = [], preRoundRank = {}, homeId = '', awayId = '' } = {}) => {
    const totalTeams = rows.length;
    return TmTable.table({
        cls: ' rnd-league-tbl',
        items: rows,
        headers: [
            {
                key: 'pos',
                label: '#',
                sortable: false,
                cls: 'pos-num',
                render: (_value, row, index) => {
                    const pos = index + 1;
                    const prevPos = preRoundRank[row.id] || pos;
                    return `${pos} ${buildPositionArrow(prevPos - pos)}`;
                },
            },
            {
                key: 'name',
                label: 'Club',
                sortable: false,
                cls: 'l',
                render: (_value, row) => `<div class="club-cell"><img class="club-logo" src="/pics/club_logos/${row.id}_25.png" onerror="this.style.display='none'"><span class="club-name">${row.name}</span></div>`,
            },
            { key: 'p', label: 'P', sortable: false },
            { key: 'w', label: 'W', sortable: false, cls: 'w-col' },
            { key: 'd', label: 'D', sortable: false },
            { key: 'l', label: 'L', sortable: false, cls: 'l-col' },
            { key: 'gf', label: 'GF', sortable: false },
            { key: 'ga', label: 'GA', sortable: false },
            {
                key: 'gd',
                label: 'GD',
                sortable: false,
                render: (value) => `<span class="${value > 0 ? 'gd-pos' : value < 0 ? 'gd-neg' : ''}">${value > 0 ? '+' : ''}${value}</span>`,
            },
            { key: 'pts', label: 'Pts', sortable: false, cls: 'pts' },
        ],
        rowCls: (row, index) => {
            const pos = index + 1;
            const isHighlight = row.id === homeId || row.id === awayId;
            let zoneCls = '';
            if (pos > totalTeams - 4) zoneCls = ' zone-relegation';
            else if (pos >= 11 && pos <= 14) zoneCls = ' zone-playoff';
            return `${isHighlight ? 'rnd-league-hl' : ''}${zoneCls}`;
        },
    });
};

const parseFixtureScore = (result) => {
    const match = String(result || '').match(/(\d+)\s*-\s*(\d+)/);
    if (!match) return null;
    return [Number(match[1]), Number(match[2])];
};

const buildMatchSnapshot = (mData, fallbackMin = null) => {
    const safeMatchData = cloneMatchData(mData);
    const liveMin = Number(safeMatchData?.match_data?.live_min);
    const snapshotMin = Number.isFinite(fallbackMin) && fallbackMin > 0
        ? fallbackMin
        : (Number.isFinite(liveMin) && liveMin > 0 ? liveMin : TmMatchUtils.getMatchEndMin(safeMatchData));
    const liveState = {
        mData: safeMatchData,
        min: snapshotMin,
        sec: 0,
        curEvtIdx: 999,
        curLineIdx: 999,
        ended: snapshotMin >= TmMatchUtils.getMatchEndMin(safeMatchData),
    };
    liveState.mData = TmMatchUtils.deriveMatchData(liveState);
    const homeTeam = liveState.mData.teams?.home || {};
    const awayTeam = liveState.mData.teams?.away || {};
    const actions = liveState.mData.actions || [];
    const eventRank = { '⚽': 1, '🟨': 2, '🟥': 3 };
    const events = actions
        .filter(action => action.action === 'shot' && action.goal || action.action === 'yellow' || action.action === 'yellowRed' || action.action === 'red')
        .map(action => {
            let icon = '';
            if (action.action === 'shot' && action.goal) icon = '⚽';
            else if (action.action === 'yellow') icon = '🟨';
            else icon = '🟥';
            return {
                side: action.home ? 'home' : 'away',
                icon,
                name: action.player || '?',
                min: action.min,
            };
        })
        .sort((a, b) => (a.min - b.min) || ((eventRank[a.icon] || 9) - (eventRank[b.icon] || 9)) || a.name.localeCompare(b.name));

    return {
        homeGoals: homeTeam.goals || 0,
        awayGoals: awayTeam.goals || 0,
        homeId: String(homeTeam.id || safeMatchData.club?.home?.id || ''),
        awayId: String(awayTeam.id || safeMatchData.club?.away?.id || ''),
        live_min: Number.isFinite(liveMin) ? liveMin : snapshotMin,
        homeShots: homeTeam.stats?.shots || 0,
        awayShots: awayTeam.stats?.shots || 0,
        homeSoT: homeTeam.stats?.shotsOnTarget || 0,
        awaySoT: awayTeam.stats?.shotsOnTarget || 0,
        homeYC: homeTeam.stats?.yellowCards || 0,
        awayYC: awayTeam.stats?.yellowCards || 0,
        homeRC: homeTeam.stats?.redCards || 0,
        awayRC: awayTeam.stats?.redCards || 0,
        homeName: safeMatchData.club?.home?.club_name || homeTeam.name || '',
        awayName: safeMatchData.club?.away?.club_name || awayTeam.name || '',
        events,
    };
};

export const TmMatchLeague = {
    render(body, liveState) {
        const syncedRoundMin = Number.isFinite(Number(liveState.min)) && Number(liveState.min) > 0 && Number(liveState.min) < 999
            ? Number(liveState.min)
            : null;

        const homeId = String(liveState.mData.club.home.id);
        const awayId = String(liveState.mData.club.away.id);

        // Extract league info from match_data.chatroom or club data
        // chatroom format varies: "cs" (country code for league matches)
        // We need country, division, group from the clubs
        const country = liveState.mData.club.home.country || liveState.mData.match_data?.chatroom || '';
        const division = liveState.mData.club.home.division || '1';
        const group = liveState.mData.club.home.group || '1';

        if (!country) {
            body.html(TmUI.error('Cannot determine league info'));
            return;
        }

        const cache = ensureLeagueCache(country, division, group);

        const buildLeagueView = (fixtures) => {
            // Extract the date of the current match from kickoff_readable ("YYYY-MM-DD HH:MM")
            const koReadable = liveState.mData.match_data?.venue?.kickoff_readable || '';
            const matchDate = koReadable.split(' ')[0]; // "YYYY-MM-DD"

            // Collect all matches
            const allMatches = [];
            const clubNamesMap = {};
            Object.values(fixtures).forEach(month => {
                if (month?.matches) {
                    month.matches.forEach(m => {
                        allMatches.push(m);
                        if (m.hometeam_name) clubNamesMap[String(m.hometeam)] = m.hometeam_name;
                        if (m.awayteam_name) clubNamesMap[String(m.awayteam)] = m.awayteam_name;
                    });
                }
            });

            // Group by date → rounds
            const byDate = {};
            allMatches.forEach(m => {
                (byDate[m.date] = byDate[m.date] || []).push(m);
            });
            const sortedDates = Object.keys(byDate).sort((a, b) => new Date(a) - new Date(b));

            // Find current round: matches on the same date as this match
            let currentRoundDate = null;
            let currentRoundNum = 0;
            for (let i = 0; i < sortedDates.length; i++) {
                if (sortedDates[i] === matchDate) {
                    currentRoundDate = sortedDates[i];
                    currentRoundNum = i + 1;
                    break;
                }
            }

            if (!currentRoundDate) {
                body.html(TmUI.error('Could not find current round'));
                return;
            }

            const currentRoundMatches = byDate[currentRoundDate];

            // Build standings from all rounds BEFORE the current round
            const standings = {}; // clubId → { p, w, d, l, gf, ga, pts, name }
            const initClub = (id, name) => {
                if (!standings[id]) standings[id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, name: name || id };
            };

            // All matches from previous rounds
            for (const date of sortedDates) {
                if (date >= currentRoundDate) break;
                byDate[date].forEach(m => {
                    if (!m.result) return;
                    const parsedScore = parseFixtureScore(m.result);
                    if (!parsedScore) return;
                    const [hg, ag] = parsedScore;
                    const hId = String(m.hometeam);
                    const aId = String(m.awayteam);
                    initClub(hId, clubNamesMap[hId] || hId);
                    initClub(aId, clubNamesMap[aId] || aId);
                    standings[hId].p++; standings[aId].p++;
                    standings[hId].gf += hg; standings[hId].ga += ag;
                    standings[aId].gf += ag; standings[aId].ga += hg;
                    if (hg > ag) { standings[hId].w++; standings[hId].pts += 3; standings[aId].l++; }
                    else if (hg < ag) { standings[aId].w++; standings[aId].pts += 3; standings[hId].l++; }
                    else { standings[hId].d++; standings[aId].d++; standings[hId].pts++; standings[aId].pts++; }
                });
            }

            // Ensure all current round teams are in standings
            currentRoundMatches.forEach(m => {
                initClub(String(m.hometeam), clubNamesMap[String(m.hometeam)] || String(m.hometeam));
                initClub(String(m.awayteam), clubNamesMap[String(m.awayteam)] || String(m.awayteam));
            });

            // Compute pre-round rankings (before current round results)
            const preRoundRank = {}; // clubId → position
            const preRoundSorted = Object.entries(standings)
                .map(([id, s]) => ({ id, pts: s.pts, gd: s.gf - s.ga, gf: s.gf }))
                .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
            preRoundSorted.forEach((s, i) => { preRoundRank[s.id] = i + 1; });

            // Now fetch live data for current round matches to get live scores
            const finalize = () => {
                const liveScores = {};
                currentRoundMatches.forEach(m => {
                    const mid = String(m.id);
                    const md = cache.matchDataById[mid];
                    if (md) {
                        liveScores[mid] = buildMatchSnapshot(md, syncedRoundMin);
                        return;
                    }
                    if (m.result) {
                        const parsedScore = parseFixtureScore(m.result);
                        if (parsedScore) {
                            const [hg, ag] = parsedScore;
                            liveScores[mid] = {
                                homeGoals: hg,
                                awayGoals: ag,
                                homeId: String(m.hometeam),
                                awayId: String(m.awayteam),
                                events: [],
                                live_min: 0,
                                homeShots: 0,
                                awayShots: 0,
                                homeSoT: 0,
                                awaySoT: 0,
                                homeYC: 0,
                                awayYC: 0,
                                homeRC: 0,
                                awayRC: 0,
                                homeName: clubNamesMap[String(m.hometeam)] || '',
                                awayName: clubNamesMap[String(m.awayteam)] || '',
                            };
                        }
                    }
                });

                // Apply current round live scores to standings
                Object.values(liveScores).forEach(ls => {
                    const hId = ls.homeId;
                    const aId = ls.awayId;
                    initClub(hId, clubNamesMap[hId] || hId);
                    initClub(aId, clubNamesMap[aId] || aId);
                    const hg = ls.homeGoals;
                    const ag = ls.awayGoals;
                    standings[hId].p++; standings[aId].p++;
                    standings[hId].gf += hg; standings[hId].ga += ag;
                    standings[aId].gf += ag; standings[aId].ga += hg;
                    if (hg > ag) { standings[hId].w++; standings[hId].pts += 3; standings[aId].l++; }
                    else if (hg < ag) { standings[aId].w++; standings[aId].pts += 3; standings[hId].l++; }
                    else { standings[hId].d++; standings[aId].d++; standings[hId].pts++; standings[aId].pts++; }
                });

                // Sort standings: pts desc, then GD desc, then GF desc
                const sorted = Object.entries(standings)
                    .map(([id, s]) => ({ id, ...s, gd: s.gf - s.ga }))
                    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

                // Determine live minute display (use liveState.min from replay state)
                const liveMinDisplay = (liveState.min > 0 && liveState.min < 999)
                    ? Math.floor(liveState.min) + "'"
                    : null;

                // ── Build HTML ──
                // Helper: group events by player+icon → "⚽ Crain 6' 16' 32'"
                const groupEvents = (events) => {
                    const map = new Map();
                    events.forEach(ev => {
                        const key = ev.icon + '|' + ev.name;
                        if (!map.has(key)) map.set(key, { icon: ev.icon, name: ev.name, mins: [] });
                        map.get(key).mins.push(ev.min);
                    });
                    return Array.from(map.values());
                };

                let html = '<div class="rnd-league-wrap">';

                // Header
                html += '<div class="rnd-league-header">';
                html += `<span class="rnd-league-title">Round ${currentRoundNum}</span>`;
                if (liveMinDisplay) {
                    html += minuteBadgeHtml(liveMinDisplay);
                }
                html += '</div>';

                html += '<div class="rnd-league-columns">';

                // ── LEFT: Matches ──
                html += '<div class="rnd-league-col-matches">';
                html += '<div class="rnd-league-col-title">Matches</div>';

                currentRoundMatches.forEach((m, mi) => {
                    const mid = String(m.id);
                    const hId = String(m.hometeam);
                    const aId = String(m.awayteam);
                    const hName = clubNamesMap[hId] || hId;
                    const aName = clubNamesMap[aId] || aId;
                    const isCurrent = (hId === homeId && aId === awayId) || (hId === awayId && aId === homeId);
                    const ls = liveScores[mid];
                    let hGoals = '–', aGoals = '–';
                    let isLive = false;
                    if (ls) {
                        hGoals = ls.homeGoals; aGoals = ls.awayGoals;
                        isLive = ls.live_min > 0;
                    } else if (m.result) {
                        const parsedScore = parseFixtureScore(m.result);
                        if (parsedScore) {
                            hGoals = parsedScore[0];
                            aGoals = parsedScore[1];
                        }
                    }

                    html += `<div class="rnd-league-match${isCurrent ? ' rnd-league-current' : ''}${isLive ? ' live' : ''}" data-mid="${mid}">`;
                    const hRC = ls ? ls.homeRC : 0;
                    const aRC = ls ? ls.awayRC : 0;
                    html += `<span class="rnd-league-home">${hName}${hRC ? ' 🟥' : ''}</span>`;
                    html += `<img class="rnd-league-logo" src="/pics/club_logos/${hId}_25.png" onerror="this.style.visibility='hidden'">`;
                    html += '<span class="rnd-league-score-block">';
                    html += `<span class="rnd-league-score-num">${hGoals}</span>`;
                    html += '<span class="rnd-league-score-sep">–</span>';
                    html += `<span class="rnd-league-score-num">${aGoals}</span>`;
                    html += '</span>';
                    html += `<img class="rnd-league-logo" src="/pics/club_logos/${aId}_25.png" onerror="this.style.visibility='hidden'">`;
                    html += `<span class="rnd-league-away">${aRC ? '🟥 ' : ''}${aName}</span>`;
                    html += '</div>';
                });
                html += '</div>';

                // ── RIGHT: Standings ──
                html += '<div class="rnd-league-col-standings">';
                html += '<div class="rnd-league-col-title">Standings</div>';
                html += '<div id="rnd-league-standings-table"></div>';
                html += '<div class="rnd-league-legend">';
                html += '<span class="legend-item"><span class="legend-dot legend-rel"></span>Relegation</span>';
                html += '<span class="legend-item"><span class="legend-dot legend-po"></span>Playoff</span>';
                html += '</div>';
                html += '</div>';

                html += '</div>'; // columns
                html += '</div>'; // wrap
                body.html(html);
                const standingsHost = body[0].querySelector('#rnd-league-standings-table');
                if (standingsHost) {
                    standingsHost.appendChild(createStandingsTable({ rows: sorted, preRoundRank, homeId, awayId }));
                }
                body.off('.rndleague');

                // ── Hover tooltip for match rows ──
                const $tooltip = $('<div class="rnd-league-tooltip"></div>').appendTo(body);

                body.on('mouseenter.rndleague', '.rnd-league-match', function () {
                    const mid = $(this).data('mid');
                    const ls = liveScores[String(mid)];
                    if (!ls) return;
                    const hN = ls.homeName || clubNamesMap[ls.homeId] || ls.homeId;
                    const aN = ls.awayName || clubNamesMap[ls.awayId] || ls.awayId;

                    let t = '<div class="rnd-league-tt-head">';
                    t += `<img class="rnd-league-tt-logo" src="/pics/club_logos/${ls.homeId}_25.png" onerror="this.style.display='none'">`;
                    t += `<span class="rnd-league-tt-team">${hN}</span>`;
                    t += '<span class="rnd-league-tt-score">';
                    t += `<span class="rnd-league-tt-score-num">${ls.homeGoals}</span>`;
                    t += '<span class="rnd-league-tt-score-sep">–</span>';
                    t += `<span class="rnd-league-tt-score-num">${ls.awayGoals}</span>`;
                    t += '</span>';
                    t += `<span class="rnd-league-tt-team">${aN}</span>`;
                    t += `<img class="rnd-league-tt-logo" src="/pics/club_logos/${ls.awayId}_25.png" onerror="this.style.display='none'">`;
                    t += '</div>';

                    t += '<div class="rnd-league-tt-stats">';
                    const statRows = [
                        ['Shots', ls.homeShots, ls.awayShots],
                        ['On Target', ls.homeSoT, ls.awaySoT],
                        ['Yellow', ls.homeYC, ls.awayYC],
                        ['Red', ls.homeRC, ls.awayRC],
                    ];
                    t += statRows.map(([label, leftValue, rightValue]) => TmMatchComparisonRow.mirrored({
                        label,
                        leftValue,
                        rightValue,
                        rowClass: 'rnd-league-tt-stat-row',
                        leftValueClass: 'rnd-league-tt-val home',
                        rightValueClass: 'rnd-league-tt-val away',
                        labelClass: 'rnd-league-tt-label',
                        barClass: 'rnd-league-tt-bar',
                        leftSegmentClass: 'rnd-league-tt-seg home',
                        rightSegmentClass: 'rnd-league-tt-seg away',
                        leftLeadClass: 'leading',
                        rightLeadClass: 'leading',
                    })).join('');
                    t += '</div>';

                    if (ls.events.length) {
                        t += '<div class="rnd-league-tt-events">';
                        const homeEvts = groupEvents(ls.events.filter(e => e.side === 'home'));
                        const awayEvts = groupEvents(ls.events.filter(e => e.side === 'away'));
                        const maxLen = Math.max(homeEvts.length, awayEvts.length);
                        for (let ei = 0; ei < maxLen; ei++) {
                            const he = homeEvts[ei];
                            const ae = awayEvts[ei];
                            t += '<div class="rnd-league-tt-evt-row">';
                            t += `<span class="tt-evt-home">${he ? `${he.name} ${he.icon} <span class="evt-min">${he.mins.map(m => m + "'").join(' ')}</span>` : ''}</span>`;
                            t += `<span class="tt-evt-away">${ae ? `${ae.icon} ${ae.name} <span class="evt-min">${ae.mins.map(m => m + "'").join(' ')}</span>` : ''}</span>`;
                            t += '</div>';
                        }
                        t += '</div>';
                    }
                    $tooltip.html(t);
                    const rect = this.getBoundingClientRect();
                    const bodyRect = body[0].getBoundingClientRect();
                    $tooltip.css({
                        top: rect.bottom - bodyRect.top + 6,
                        left: Math.max(4, rect.left - bodyRect.left + (rect.width / 2) - 160)
                    }).addClass('visible');
                }).on('mouseleave.rndleague', '.rnd-league-match', function () {
                    $tooltip.removeClass('visible');
                });
            };

            const missingMatchIds = currentRoundMatches
                .map(m => String(m.id))
                .filter(mid => !cache.matchDataById[mid] && !cache.failedMatchIds[mid]);

            if (missingMatchIds.length === 0) {
                finalize();
                return;
            }

            const fetchPromises = missingMatchIds.map(mid => {
                if (!cache.matchPromisesById[mid]) {
                    cache.matchPromisesById[mid] = TmMatchService.fetchMatch(mid)
                        .then(md => {
                            if (md) {
                                cache.matchDataById[mid] = md;
                            } else {
                                cache.failedMatchIds[mid] = true;
                            }
                        })
                        .catch(() => {
                            cache.failedMatchIds[mid] = true;
                        })
                        .finally(() => {
                            delete cache.matchPromisesById[mid];
                        });
                }
                return cache.matchPromisesById[mid];
            });

            if (!body.find('.rnd-league-wrap').length) {
                body.html(TmUI.loading('Loading league data...'));
            }

            Promise.all(fetchPromises).finally(finalize);
        };

        if (cache.fixtures) {
            buildLeagueView(cache.fixtures);
            return;
        }

        body.html(TmUI.loading('Loading league data...'));
        if (!cache.fixturesPromise) {
            cache.fixturesPromise = TMLeagueService.fetchLeagueFixtures('league', { var1: country, var2: division, var3: group })
                .then(fixtures => {
                    if (!fixtures) throw new Error('No league fixtures');
                    cache.fixtures = fixtures;
                    return fixtures;
                })
                .finally(() => {
                    cache.fixturesPromise = null;
                });
        }
        cache.fixturesPromise
            .then(fixtures => buildLeagueView(fixtures))
            .catch(() => { body.html(TmUI.error('Failed to load league data')); });
    }
};
