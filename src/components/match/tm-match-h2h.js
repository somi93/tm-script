import { TmMatchService } from '../../services/match.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmMatchH2HTooltip } from './tm-match-h2h-tooltip.js';
import { TmFixtureMatchRow } from '../shared/tm-fixture-match-row.js';

const h2hTypeSortKey = (m) => {
    if (m.division) return 'League';
    const mt = m.matchtype || '';
    if (mt === 'fl') return 'Friendly League';
    if (mt === 'f' || mt === 'fq') return 'Friendly';
    if (/^p\d$/.test(mt)) return 'Cup';
    if (['ueg', 'ue1', 'ue2', 'clg', 'cl1', 'cl2'].includes(mt)) return 'International Cup';
    return '';
};

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
                    const isOldSeason = Number(season) !== currentSeason;
                    data.matches[season].forEach(m => {
                        html += TmFixtureMatchRow.render({
                            id: m.id,
                            hometeam: m.hometeam,
                            hometeam_name: clubNames[String(m.hometeam)] || String(m.hometeam),
                            awayteam: m.awayteam,
                            awayteam_name: clubNames[String(m.awayteam)] || String(m.awayteam),
                            result: m.result,
                            matchtype_sort: h2hTypeSortKey(m),
                        }, {
                            dateText: m.date || '',
                            showType: true,
                            myClubId: homeId,
                            season: String(season),
                            extraClass: isOldSeason ? 'h2h-readonly' : '',
                        });
                    });
                });
            }
            html += '</div></div>';

            body.html(html);

            // â”€â”€ Tooltip cache & hover logic â”€â”€
            let tooltipEl = null;
            let tooltipTimer = null;
            let tooltipHideTimer = null;
            const currentSeasonNum = SESSION?.season || 0;

            const showTooltip = (el, mid, season) => {
                clearTimeout(tooltipHideTimer);
                if (tooltipEl) tooltipEl.remove();
                tooltipEl = $(TmMatchH2HTooltip.show(el, mid, Number(season) === currentSeasonNum));
            };

            const hideTooltip = () => {
                tooltipHideTimer = setTimeout(() => {
                    if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
                }, 100);
            };

            body.on('mouseenter', '.tmvu-fixture-row', function () {
                const el = this;
                const mid = $(el).data('mid');
                const season = $(el).data('season');
                clearTimeout(tooltipTimer);
                tooltipTimer = setTimeout(() => showTooltip(el, mid, season), 300);
            });
            body.on('mouseleave', '.tmvu-fixture-row', function () {
                clearTimeout(tooltipTimer);
                hideTooltip();
            });

            // Click on match -> open in new tab (current season only)
            body.on('click', '.tmvu-fixture-row', function () {
                if ($(this).hasClass('h2h-readonly')) return;
                const mid = $(this).data('mid');
                if (mid) window.open('/matches/' + mid, '_blank');
            });
        }).catch((error) => {
            console.log('Failed to fetch H2H data', error);
            body.html(TmUI.error('Failed to load H2H data'));
        });
    },
};
