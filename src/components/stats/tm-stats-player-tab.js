import { TmStatsGKTable } from './tm-stats-gk-table.js';
import { TmStatsPlayerTable } from './tm-stats-player-table.js';

    export const TmStatsPlayerTab = {
        render(opts) {
            opts.aggregateIfNeeded();
            const body = document.getElementById('tsa-body');
            if (!body) return;

            const matchTypeCount = opts.getTeamOverall().matches;
            const f = opts.getActiveFilter();

            const players = Object.entries(opts.getPlayerAgg()).map(([pid, pa]) => ({
                pid, ...pa,
                avgRating: pa.ratingCount > 0 ? pa.rating / pa.ratingCount : 0,
            }));
            const outfield = players.filter(p => !p.isGK);
            const keepers  = players.filter(p =>  p.isGK);

            let html = opts.renderMatchTypeButtons();
            html += '<div class="tsa-filters">';
            ['total', 'average', 'per90'].forEach(fk => {
                const label = fk === 'per90' ? 'Per 90 min' : fk.charAt(0).toUpperCase() + fk.slice(1);
                html += `<div class="tsa-filter-btn${f === fk ? ' active' : ''}" data-filter="${fk}">${label}</div>`;
            });
            html += '</div>';
            html += '<div id="tsa-player-tbl"></div>';
            if (keepers.length > 0) html += '<div id="tsa-gk-tbl"></div>';

            body.innerHTML = html;

            body.querySelector('#tsa-player-tbl')
                .replaceWith(TmStatsPlayerTable.build(outfield, { filter: f, matchTypeCount }));
            if (keepers.length > 0)
                body.querySelector('#tsa-gk-tbl')
                    .replaceWith(TmStatsGKTable.build(keepers, { filter: f, showCards: true }));

            body.querySelectorAll('.tsa-filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    opts.setActiveFilter(btn.dataset.filter);
                    opts.rerender();
                });
            });
            body.querySelectorAll('.tsa-mf-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    opts.setActiveMatchType(btn.dataset.mtype);
                    opts.setFilterOurFormation(null); opts.setFilterOurStyle(null); opts.setFilterOurMentality(null);
                    opts.setFilterOppFormation(null); opts.setFilterOppStyle(null); opts.setFilterOppMentality(null);
                    opts.rerender();
                });
            });
        },
    };

