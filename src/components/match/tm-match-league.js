import { TmApi }  from '../../services/index.js' ;
import { TmMatchUtils } from './tm-match-utils.js';

let leagueTabCache = null;

export const TmMatchLeague = {
    render(body, mData, curMin = 999, curEvtIdx = 999) {
        body.html('<div style="text-align:center;padding:20px;color:#5a7a48">⏳ Loading league data...</div>');

        const homeId = String(mData.club.home.id);
        const awayId = String(mData.club.away.id);

        // Extract league info from match_data.chatroom or club data
        // chatroom format varies: "cs" (country code for league matches)
        // We need country, division, group from the clubs
        const country = mData.club.home.country || mData.match_data?.chatroom || '';
        const division = mData.club.home.division || '1';
        const group = mData.club.home.group || '1';

        if (!country) {
            body.html('<div style="text-align:center;padding:20px;color:#ff6b6b">Cannot determine league info</div>');
            return;
        }

        const buildLeagueView = (fixtures) => {
            // Extract the date of the current match from kickoff_readable ("YYYY-MM-DD HH:MM")
            const koReadable = mData.match_data?.venue?.kickoff_readable || '';
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
                body.html('<div style="text-align:center;padding:20px;color:#ff6b6b">Could not find current round</div>');
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
                    const [hg, ag] = m.result.split('-').map(Number);
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
            const matchIds = currentRoundMatches.map(m => String(m.id));
            const liveScores = {}; // matchId → { homeGoals, awayGoals, homeId, awayId, events[], live_min }
            let loaded = 0;

            const finalize = () => {
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

                // Determine live minute display (use curMin from replay state)
                const liveMinDisplay = (curMin > 0 && curMin < 999)
                    ? Math.floor(curMin) + "'"
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
                    html += `<span class="rnd-league-minute-badge">⏱ ${liveMinDisplay}</span>`;
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
                        const parts = m.result.split('-');
                        hGoals = parts[0]; aGoals = parts[1];
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
                html += '<table class="rnd-league-tbl">';
                html += '<tr><th>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr>';
                const totalTeams = sorted.length;
                sorted.forEach((s, i) => {
                    const isHL = s.id === homeId || s.id === awayId;
                    const pos = i + 1;
                    const gdCls = s.gd > 0 ? ' gd-pos' : (s.gd < 0 ? ' gd-neg' : '');

                    // Position change arrow
                    const prevPos = preRoundRank[s.id] || pos;
                    const diff = prevPos - pos; // positive = moved up, negative = moved down
                    let arrow = '';
                    if (diff > 0) arrow = `<span class="pos-arrow pos-up">▲${diff}</span>`;
                    else if (diff < 0) arrow = `<span class="pos-arrow pos-down">▼${Math.abs(diff)}</span>`;
                    else arrow = `<span class="pos-arrow pos-same">–</span>`;

                    // Zone classes: relegation (last 4), baraž (11-14)
                    let zoneCls = '';
                    if (pos > totalTeams - 4) zoneCls = ' zone-relegation';
                    else if (pos >= 11 && pos <= 14) zoneCls = ' zone-playoff';

                    html += `<tr class="${isHL ? 'rnd-league-hl' : ''}${zoneCls}">`;
                    html += `<td class="pos-num">${pos} ${arrow}</td>`;
                    html += `<td><div class="club-cell"><img class="club-logo" src="/pics/club_logos/${s.id}_25.png" onerror="this.style.display='none'"><span class="club-name">${s.name}</span></div></td>`;
                    html += `<td>${s.p}</td><td class="w-col">${s.w}</td><td>${s.d}</td><td class="l-col">${s.l}</td>`;
                    html += `<td>${s.gf}</td><td>${s.ga}</td><td class="${gdCls}">${s.gd > 0 ? '+' : ''}${s.gd}</td>`;
                    html += `<td class="pts">${s.pts}</td>`;
                    html += '</tr>';
                });
                html += '</table>';
                html += '<div class="rnd-league-legend">';
                html += '<span class="legend-item"><span class="legend-dot legend-rel"></span>Relegation</span>';
                html += '<span class="legend-item"><span class="legend-dot legend-po"></span>Playoff</span>';
                html += '</div>';
                html += '</div>';

                html += '</div>'; // columns
                html += '</div>'; // wrap
                body.html(html);

                // ── Hover tooltip for match rows ──
                const $tooltip = $('<div class="rnd-league-tooltip"></div>').appendTo(body);

                const ttBar = (hVal, aVal) => {
                    const total = hVal + aVal;
                    const hPct = total === 0 ? 50 : Math.round(hVal / total * 100);
                    return `<div class="rnd-league-tt-bar"><div class="rnd-league-tt-seg home" style="width:${hPct}%"></div><div class="rnd-league-tt-seg away" style="width:${100 - hPct}%"></div></div>`;
                };

                body.on('mouseenter', '.rnd-league-match', function (e) {
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
                    const statRow = (label, hv, av) => {
                        const hLead = hv > av ? ' leading' : '';
                        const aLead = av > hv ? ' leading' : '';
                        return `<div class="rnd-league-tt-stat-row"><span class="rnd-league-tt-val home${hLead}">${hv}</span>${ttBar(hv, av)}<span class="rnd-league-tt-label">${label}</span>${ttBar(hv, av)}<span class="rnd-league-tt-val away${aLead}">${av}</span></div>`;
                    };
                    t += statRow('Shots', ls.homeShots, ls.awayShots);
                    t += statRow('On Target', ls.homeSoT, ls.awaySoT);
                    t += statRow('Yellow', ls.homeYC, ls.awayYC);
                    t += statRow('Red', ls.homeRC, ls.awayRC);
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
                }).on('mouseleave', '.rnd-league-match', function () {
                    $tooltip.removeClass('visible');
                });
            };

            // Fetch live data for each match in current round
            if (matchIds.length === 0) {
                finalize();
                return;
            }

            matchIds.forEach(mid => {
                TmApi.fetchMatch(mid).then(md => {
                    if (!md) {
                        // If fetch fails, use fixture result as fallback
                        const m = currentRoundMatches.find(x => String(x.id) === mid);
                        if (m && m.result) {
                            const [hg, ag] = m.result.split('-').map(Number);
                            liveScores[mid] = {
                                homeGoals: hg, awayGoals: ag,
                                homeId: String(m.hometeam), awayId: String(m.awayteam),
                                events: [], live_min: 0
                            };
                        }
                        return;
                    }
                    const hId = String(md.club?.home?.id || '');
                    const aId = String(md.club?.away?.id || '');
                    const livMin = md.match_data?.live_min || 0;

                    // Update club names from live data
                    if (md.club?.home?.club_name) clubNamesMap[hId] = md.club.home.club_name;
                    if (md.club?.away?.club_name) clubNamesMap[aId] = md.club.away.club_name;

                    // Extract goals, shots, cards from plays up to curMin
                    const homeLineupIds = new Set(Object.keys(md.lineup?.home || {}));
                    const ms = TmMatchUtils.extractStats(homeLineupIds, hId, {
                        upToMin: curMin, plays: md.plays, lineup: md.lineup,
                    });
                    const homeGoals = ms.homeGoals, awayGoals = ms.awayGoals;
                    const homeShots = ms.homeShots, awayShots = ms.awayShots;
                    const homeSoT = ms.homeSoT, awaySoT = ms.awaySoT;
                    const homeYC = ms.homeYellow, awayYC = ms.awayYellow;
                    const homeRC = ms.homeRed, awayRC = ms.awayRed;
                    const events = ms.events;

                    liveScores[mid] = {
                        homeGoals, awayGoals, homeId: hId, awayId: aId, events, live_min: livMin,
                        homeShots, awayShots, homeSoT, awaySoT, homeYC, awayYC, homeRC, awayRC,
                        homeName: md.club?.home?.club_name || '', awayName: md.club?.away?.club_name || ''
                    };
                }).finally(() => {
                    loaded++;
                    if (loaded >= matchIds.length) finalize();
                });
            });
        };

        // Check cache
        if (leagueTabCache && leagueTabCache.country === country && leagueTabCache.division === division) {
            buildLeagueView(leagueTabCache.fixtures);
            return;
        }

        // Fetch fixtures
        TmApi.fetchLeagueFixtures(country, division, group)
            .then(fixtures => {
                if (!fixtures) { body.html('<div style="text-align:center;padding:20px;color:#ff6b6b">Failed to load league data</div>'); return; }
                leagueTabCache = { country, division, group, fixtures };
                buildLeagueView(fixtures);
            })
            .catch(() => { body.html('<div style="text-align:center;padding:20px;color:#ff6b6b">Failed to load league data</div>'); });
    }
};
