import { TmMatchService } from '../../services/match.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmMatchH2HTooltip } from './tm-match-h2h-tooltip.js';

export const TmMatchH2H = {
        render(body, mData) {
        body.html(TmUI.loading('Loading H2Hâ€¦'));

        const homeId = String(mData.club.home.id);
        const awayId = String(mData.club.away.id);
        const homeName = mData.club.home.club_name;
        const awayName = mData.club.away.club_name;
        const homeLogo = mData.club.home.logo || `/pics/club_logos/${homeId}_140.png`;
        const awayLogo = mData.club.away.logo || `/pics/club_logos/${awayId}_140.png`;
        const kickoff = mData.match_data.venue.kickoff || Math.floor(Date.now() / 1000);

        TmMatchService.fetchMatchH2H(homeId, awayId, kickoff).then(data => {
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
                html += `<div class="rnd-h2h-goals-summary">Goals: <span>${hGoalsTotal}</span> â€“ <span>${aGoalsTotal}</span></div>`;
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
                        if (m.attendance_format) html += `<div class="rnd-h2h-att">ðŸŸ ${m.attendance_format}</div>`;
                        html += `</div>`;
                    });
                });
            }
            html += '</div></div>';

            body.html(html);

            // â”€â”€ Tooltip cache & hover logic â”€â”€
            const tooltipCache = {};
            let tooltipEl = null;
            let tooltipTimer = null;
            let tooltipHideTimer = null;
            const currentSeasonNum = SESSION?.season || 0;

            const showTooltip = (el, mid, season) => {
                clearTimeout(tooltipHideTimer);
                if (tooltipEl) tooltipEl.remove();
                const isCurrentSeason = Number(season) === currentSeasonNum;
                tooltipEl = $('<div class="rnd-h2h-tooltip"></div>');
                $(el).append(tooltipEl);

                if (tooltipCache[mid]) {
                    const cached = tooltipCache[mid];
                    tooltipEl.html(cached._rich ? TmMatchH2HTooltip.buildRichTooltip(cached) : TmMatchH2HTooltip.buildTooltipContent(cached));
                    requestAnimationFrame(() => tooltipEl.addClass('visible'));
                } else {
                    tooltipEl.html(TmUI.loading('Loadingâ€¦', true));
                    requestAnimationFrame(() => tooltipEl.addClass('visible'));
                    const onFail = () => { if (tooltipEl) tooltipEl.html(TmUI.error('Failed', true)); };
                    if (isCurrentSeason) {
                        // Current season â†’ full match data endpoint
                        TmMatchService.fetchMatch(mid).then(d => {
                            if (!d) { onFail(); return; }
                            d._rich = true;
                            tooltipCache[mid] = d;
                            if (tooltipEl && tooltipEl.closest('.rnd-h2h-match').data('mid') == mid) {
                                tooltipEl.html(TmMatchH2HTooltip.buildRichTooltip(d));
                            }
                        });
                    } else {
                        // Older season â†’ tooltip endpoint
                        TmMatchService.fetchMatchTooltip(mid, season).then(d => {
                            if (!d) { onFail(); return; }
                            // Attach team IDs from H2H context for logos
                            d._homeId = homeId;
                            d._awayId = awayId;
                            tooltipCache[mid] = d;
                            if (tooltipEl && tooltipEl.closest('.rnd-h2h-match').data('mid') == mid) {
                                tooltipEl.html(TmMatchH2HTooltip.buildTooltipContent(d));
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

            // Click on match â†’ open in new tab (current season only)
            body.on('click', '.rnd-h2h-match', function () {
                if ($(this).hasClass('h2h-readonly')) return;
                const mid = $(this).data('mid');
                if (mid) window.open('/matches/' + mid, '_blank');
            });
        }).fail(() => {
            body.html(TmUI.error('Failed to load H2H data'));
        });
        },
};
