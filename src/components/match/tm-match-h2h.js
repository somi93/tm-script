(function () {
    'use strict';

    window.TmMatchH2H = {
        render(body, mData) {
        body.html(TmUI.loading('Loading H2H…'));

        const homeId = String(mData.club.home.id);
        const awayId = String(mData.club.away.id);
        const homeName = mData.club.home.club_name;
        const awayName = mData.club.away.club_name;
        const homeLogo = mData.club.home.logo || `/pics/club_logos/${homeId}_140.png`;
        const awayLogo = mData.club.away.logo || `/pics/club_logos/${awayId}_140.png`;
        const kickoff = mData.match_data.venue.kickoff || Math.floor(Date.now() / 1000);

        window.TmApi.fetchMatchH2H(homeId, awayId, kickoff).then(data => {
            if (!data) return;

            // Compute totals for record strip
            const allStats = data.all || {};
            const hWins = allStats[homeId]?.w || 0;
            const aWins = allStats[awayId]?.w || 0;
            const draws = allStats[homeId]?.d || 0;
            const hGoalsTotal = allStats[homeId]?.gf || 0;
            const aGoalsTotal = allStats[awayId]?.gf || 0;

            let html = '<div class="rnd-h2h-wrap">';

            // Record strip: logo name [W] [D] [W] name logo
            html += `<div class="rnd-h2h-record">
                <div class="rnd-h2h-record-side">
                    <img class="rnd-h2h-record-logo" src="${homeLogo}" onerror="this.style.display='none'">
                    <span class="rnd-h2h-record-name">${homeName}</span>
                </div>
                <div class="rnd-h2h-record-stat">
                    <span class="rnd-h2h-record-num home">${hWins}</span>
                    <span class="rnd-h2h-record-label">Wins</span>
                </div>
                <div class="rnd-h2h-record-stat">
                    <span class="rnd-h2h-record-num draw">${draws}</span>
                    <span class="rnd-h2h-record-label">Draws</span>
                </div>
                <div class="rnd-h2h-record-stat">
                    <span class="rnd-h2h-record-num away">${aWins}</span>
                    <span class="rnd-h2h-record-label">Wins</span>
                </div>
                <div class="rnd-h2h-record-side away">
                    <img class="rnd-h2h-record-logo" src="${awayLogo}" onerror="this.style.display='none'">
                    <span class="rnd-h2h-record-name">${awayName}</span>
                </div>
            </div>`;

            // Goals summary line
            if (hGoalsTotal || aGoalsTotal) {
                html += `<div class="rnd-h2h-goals-summary">Goals: <span>${hGoalsTotal}</span> – <span>${aGoalsTotal}</span></div>`;
            }

            // Match history grouped by season (newest first)
            html += '<div class="rnd-h2h-matches">';
            if (data.matches) {
                const seasons = Object.keys(data.matches).sort((a, b) => Number(b) - Number(a));
                const currentSeason = SESSION?.season;
                const clubNames = {};
                clubNames[homeId] = homeName;
                clubNames[awayId] = awayName;

                seasons.forEach(season => {
                    html += `<div class="rnd-h2h-season">Season ${season}</div>`;
                    data.matches[season].forEach(m => {
                        const [hGoals, aGoals] = (m.result || '0-0').split('-').map(Number);
                        const mHomeId = String(m.hometeam);
                        const hName = clubNames[mHomeId] || m.hometeam;
                        const aName = clubNames[String(m.awayteam)] || m.awayteam;
                        const hWin = hGoals > aGoals;
                        const aWin = aGoals > hGoals;
                        const isDraw = hGoals === aGoals;
                        // Determine result class from perspective of the "home" club in H2H
                        let resultClass = 'h2h-draw';
                        if (hWin && mHomeId === homeId || aWin && mHomeId !== homeId) resultClass = 'h2h-win';
                        else if (!isDraw) resultClass = 'h2h-loss';
                        let div = m.division ? `Division ${m.division}` : (m.matchtype || '');
                        if (m.matchtype === "fl") {
                            div = "Friendly league";
                        }
                        if (m.matchtype === "f") {
                            div = "Quick match";
                        } else if (["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"].includes(m.matchtype)) {
                            div = "Cup";
                        } else if (["ueg", "ue1", "ue2"].includes(m.matchtype)) {
                            div = "Conference League";
                        } else if (["clg", "cl1", "cl2"].includes(m.matchtype)) {
                            div = "Champions League";
                        }
                        const isOldSeason = Number(season) !== currentSeason;
                        html += `<div class="rnd-h2h-match ${resultClass}${isOldSeason ? ' h2h-readonly' : ''}" data-mid="${m.id}" data-season="${season}">`;
                        html += `<div class="rnd-h2h-date">${m.date || ''}</div>`;
                        if (div) html += `<span class="rnd-h2h-type-badge">${div}</span>`;
                        html += `<div class="rnd-h2h-home${hWin ? ' winner' : ''}">${hName}</div>`;
                        html += `<div class="rnd-h2h-result">${m.result}</div>`;
                        html += `<div class="rnd-h2h-away${aWin ? ' winner' : ''}">${aName}</div>`;
                        if (m.attendance_format) html += `<div class="rnd-h2h-att">🏟 ${m.attendance_format}</div>`;
                        html += `</div>`;
                    });
                });
            }
            html += '</div></div>';

            body.html(html);

            // ── Tooltip cache & hover logic ──
            const tooltipCache = {};
            let tooltipEl = null;
            let tooltipTimer = null;
            let tooltipHideTimer = null;
            const currentSeasonNum = SESSION?.season || 0;

            // ── Tooltip from tooltip.ajax.php (older seasons, same layout as rich) ──
            const buildTooltipContent = (d) => {
                const hName = d.hometeam_name || '';
                const aName = d.awayteam_name || '';
                // Try to get team IDs for logos from the H2H context
                const hLogoId = d.hometeam || '';
                const aLogoId = d.awayteam || '';
                const hLogoUrl = hLogoId ? `/pics/club_logos/${hLogoId}_140.png` : '';
                const aLogoUrl = aLogoId ? `/pics/club_logos/${aLogoId}_140.png` : '';

                let t = '';
                // Header with logos (identical to rich tooltip)
                t += `<div class="rnd-h2h-tooltip-header">`;
                if (hLogoUrl) t += `<img class="rnd-h2h-tooltip-logo" src="${hLogoUrl}" onerror="this.style.display='none'">`;
                t += `<span class="rnd-h2h-tooltip-team">${hName}</span>`;
                t += `<span class="rnd-h2h-tooltip-score">${d.result || ''}</span>`;
                t += `<span class="rnd-h2h-tooltip-team">${aName}</span>`;
                if (aLogoUrl) t += `<img class="rnd-h2h-tooltip-logo" src="${aLogoUrl}" onerror="this.style.display='none'">`;
                t += `</div>`;

                // Meta
                t += `<div class="rnd-h2h-tooltip-meta">`;
                if (d.date) t += `<span>📅 ${d.date}</span>`;
                if (d.attendance_format) t += `<span>🏟 ${d.attendance_format}</span>`;
                t += `</div>`;

                // Events: goals & cards (same structure as rich)
                const report = d.report || {};
                const hTeamId = String(d.hometeam || hLogoId);
                const goals = [];
                const cards = [];
                Object.keys(report).forEach(k => {
                    if (k === 'mom' || k === 'mom_name') return;
                    const e = report[k];
                    if (!e || !e.minute) return;
                    const sc = e.score;
                    const isHome = String(e.team_scores) === hTeamId;
                    if (sc === 'yellow' || sc === 'red' || sc === 'orange') {
                        cards.push({ ...e, isHome });
                    } else {
                        goals.push({ ...e, isHome });
                    }
                });
                goals.sort((a, b) => Number(a.minute) - Number(b.minute));
                cards.sort((a, b) => Number(a.minute) - Number(b.minute));

                t += window.TmMatchUtils.renderLegacyEvents(goals, cards);

                // MOM
                if (report.mom_name) {
                    t += `<div class="rnd-h2h-tooltip-mom">⭐ Man of the Match: <span>${report.mom_name}</span></div>`;
                }
                return t;
            };

            // ── Rich tooltip from match.ajax.php (current season) ──
            const buildRichTooltip = (mData) => {
                const md = mData.match_data || {};
                const club = mData.club || {};
                const hName = club.home?.club_name || '';
                const aName = club.away?.club_name || '';
                const hId = String(club.home?.id || '');
                const aId = String(club.away?.id || '');
                const hLogo = club.home?.logo || `/pics/club_logos/${hId}_140.png`;
                const aLogo = club.away?.logo || `/pics/club_logos/${aId}_140.png`;
                const report = mData.report || {};

                // Find final score from report
                let finalScore = '0 - 0';
                const allMins = Object.keys(report).map(Number).sort((a, b) => a - b);
                for (let i = allMins.length - 1; i >= 0; i--) {
                    const evts = report[allMins[i]];
                    if (!Array.isArray(evts)) continue;
                    for (let j = evts.length - 1; j >= 0; j--) {
                        const p = evts[j].parameters;
                        if (p) {
                            const goal = Array.isArray(p) ? p.find(x => x.goal) : p.goal ? p : null;
                            if (goal) {
                                const g = goal.goal || goal;
                                if (g.score) { finalScore = g.score.join(' - '); break; }
                            }
                        }
                    }
                    if (finalScore !== '0 - 0') break;
                }
                // If halftime has score, at least use that
                if (finalScore === '0 - 0' && md.halftime?.chance?.text) {
                    const htText = md.halftime.chance.text.flat().join(' ');
                    const sm = htText.match(/(\d+)-(\d+)/);
                    if (sm) finalScore = sm[1] + ' - ' + sm[2];
                }

                let t = '';
                // Header with logos
                t += `<div class="rnd-h2h-tooltip-header">`;
                t += `<img class="rnd-h2h-tooltip-logo" src="${hLogo}" onerror="this.style.display='none'">`;
                t += `<span class="rnd-h2h-tooltip-team">${hName}</span>`;
                t += `<span class="rnd-h2h-tooltip-score">${finalScore}</span>`;
                t += `<span class="rnd-h2h-tooltip-team">${aName}</span>`;
                t += `<img class="rnd-h2h-tooltip-logo" src="${aLogo}" onerror="this.style.display='none'">`;
                t += `</div>`;

                // Meta
                t += `<div class="rnd-h2h-tooltip-meta">`;
                const ko = md.venue?.kickoff_readable || '';
                if (ko) {
                    const d = new Date(ko.replace(' ', 'T'));
                    t += `<span>📅 ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>`;
                }
                if (md.venue?.name) t += `<span>🏟 ${md.venue.name}</span>`;
                if (md.attendance) t += `<span>👥 ${Number(md.attendance).toLocaleString()}</span>`;
                t += `</div>`;

                // Key events: goals, cards, subs — extracted from report
                const keyEvents = [];
                allMins.forEach(min => {
                    const evts = report[min];
                    if (!Array.isArray(evts)) return;
                    evts.forEach(evt => {
                        if (!evt.parameters) return;
                        const params = Array.isArray(evt.parameters) ? evt.parameters : [evt.parameters];
                        const clubId = String(evt.club || '');
                        const isHome = clubId === hId;
                        params.forEach(p => {
                            if (p.goal) {
                                const scorer = mData.lineup?.home?.[p.goal.player] || mData.lineup?.away?.[p.goal.player];
                                const assistPlayer = mData.lineup?.home?.[p.goal.assist] || mData.lineup?.away?.[p.goal.assist];
                                keyEvents.push({
                                    min, type: 'goal', isHome,
                                    name: scorer?.nameLast || scorer?.name || '?',
                                    assist: assistPlayer?.nameLast || assistPlayer?.name || '',
                                    score: p.goal.score ? p.goal.score.join('-') : ''
                                });
                            }
                            if (p.yellow) {
                                const pl = mData.lineup?.home?.[p.yellow] || mData.lineup?.away?.[p.yellow];
                                keyEvents.push({ min, type: 'yellow', isHome, name: pl?.nameLast || pl?.name || '?' });
                            }
                            if (p.yellow_red) {
                                const pl = mData.lineup?.home?.[p.yellow_red] || mData.lineup?.away?.[p.yellow_red];
                                keyEvents.push({ min, type: 'red', isHome, name: pl?.nameLast || pl?.name || '?' });
                            }
                            if (p.red) {
                                const pl = mData.lineup?.home?.[p.red] || mData.lineup?.away?.[p.red];
                                keyEvents.push({ min, type: 'red', isHome, name: pl?.nameLast || pl?.name || '?' });
                            }
                            if (p.sub) {
                                const plIn = mData.lineup?.home?.[p.sub.player_in] || mData.lineup?.away?.[p.sub.player_in];
                                const plOut = mData.lineup?.home?.[p.sub.player_out] || mData.lineup?.away?.[p.sub.player_out];
                                keyEvents.push({
                                    min, type: 'sub', isHome,
                                    nameIn: plIn?.nameLast || plIn?.name || '?',
                                    nameOut: plOut?.nameLast || plOut?.name || '?'
                                });
                            }
                        });
                    });
                });

                // Goals & cards section
                const goals = keyEvents.filter(e => e.type === 'goal');
                const cards = keyEvents.filter(e => e.type === 'yellow' || e.type === 'red');

                t += window.TmMatchUtils.renderRichEvents(goals, cards);

                // Stats: possession, shots
                const poss = md.possession;
                const statsData = md.statistics || {};
                const shotsH = statsData.home_shots || 0;
                const shotsA = statsData.away_shots || 0;
                const onTargetH = statsData.home_on_target || 0;
                const onTargetA = statsData.away_on_target || 0;

                if (poss || shotsH || shotsA) {
                    t += `<div class="rnd-h2h-tooltip-stats">`;
                    if (poss) {
                        const hP = poss.home || 0, aP = poss.away || 0;
                        t += `<span class="rnd-h2h-tooltip-stat-home${hP > aP ? ' leading' : ''}">${hP}%</span>`;
                        t += `<span class="rnd-h2h-tooltip-stat-label">Possession</span>`;
                        t += `<span class="rnd-h2h-tooltip-stat-away${aP > hP ? ' leading' : ''}">${aP}%</span>`;
                    }
                    if (shotsH || shotsA) {
                        t += `<span class="rnd-h2h-tooltip-stat-home${shotsH > shotsA ? ' leading' : ''}">${shotsH}</span>`;
                        t += `<span class="rnd-h2h-tooltip-stat-label">Shots</span>`;
                        t += `<span class="rnd-h2h-tooltip-stat-away${shotsA > shotsH ? ' leading' : ''}">${shotsA}</span>`;
                    }
                    if (onTargetH || onTargetA) {
                        t += `<span class="rnd-h2h-tooltip-stat-home${onTargetH > onTargetA ? ' leading' : ''}">${onTargetH}</span>`;
                        t += `<span class="rnd-h2h-tooltip-stat-label">On Target</span>`;
                        t += `<span class="rnd-h2h-tooltip-stat-away${onTargetA > onTargetH ? ' leading' : ''}">${onTargetA}</span>`;
                    }
                    t += `</div>`;
                }

                // MOM
                const allPlayers = [...Object.values(mData.lineup?.home || {}), ...Object.values(mData.lineup?.away || {})];
                const mom = allPlayers.find(p => p.mom === 1 || p.mom === '1');
                if (mom) {
                    t += `<div class="rnd-h2h-tooltip-mom">⭐ Man of the Match: <span>${mom.nameLast || mom.name}</span> (${parseFloat(mom.rating).toFixed(1)})</div>`;
                }

                return t;
            };

            const showTooltip = (el, mid, season) => {
                clearTimeout(tooltipHideTimer);
                if (tooltipEl) tooltipEl.remove();
                const isCurrentSeason = Number(season) === currentSeasonNum;
                tooltipEl = $('<div class="rnd-h2h-tooltip"></div>');
                $(el).append(tooltipEl);

                if (tooltipCache[mid]) {
                    const cached = tooltipCache[mid];
                    tooltipEl.html(cached._rich ? buildRichTooltip(cached) : buildTooltipContent(cached));
                    requestAnimationFrame(() => tooltipEl.addClass('visible'));
                } else {
                    tooltipEl.html(TmUI.loading('Loading…', true));
                    requestAnimationFrame(() => tooltipEl.addClass('visible'));
                    const onFail = () => { if (tooltipEl) tooltipEl.html(TmUI.error('Failed', true)); };
                    if (isCurrentSeason) {
                        // Current season → full match data endpoint
                        window.TmApi.fetchMatch(mid).then(d => {
                            if (!d) { onFail(); return; }
                            d._rich = true;
                            tooltipCache[mid] = d;
                            if (tooltipEl && tooltipEl.closest('.rnd-h2h-match').data('mid') == mid) {
                                tooltipEl.html(buildRichTooltip(d));
                            }
                        });
                    } else {
                        // Older season → tooltip endpoint
                        window.TmApi.fetchMatchTooltip(mid, season).then(d => {
                            if (!d) { onFail(); return; }
                            // Attach team IDs from H2H context for logos
                            d._homeId = homeId;
                            d._awayId = awayId;
                            tooltipCache[mid] = d;
                            if (tooltipEl && tooltipEl.closest('.rnd-h2h-match').data('mid') == mid) {
                                tooltipEl.html(buildTooltipContent(d));
                            }
                        });
                    }
                }
            };

            const hideTooltip = () => {
                tooltipHideTimer = setTimeout(() => {
                    if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
                }, 100);
            };

            body.on('mouseenter', '.rnd-h2h-match', function () {
                const el = this;
                const mid = $(el).data('mid');
                const season = $(el).data('season');
                clearTimeout(tooltipTimer);
                tooltipTimer = setTimeout(() => showTooltip(el, mid, season), 300);
            });
            body.on('mouseleave', '.rnd-h2h-match', function () {
                clearTimeout(tooltipTimer);
                hideTooltip();
            });

            // Click on match → open in new tab (current season only)
            body.on('click', '.rnd-h2h-match', function () {
                if ($(this).hasClass('h2h-readonly')) return;
                const mid = $(this).data('mid');
                if (mid) window.open('/matches/' + mid, '_blank');
            });
        }).fail(() => {
            body.html(TmUI.error('Failed to load H2H data'));
        });
        }
    };
})();
