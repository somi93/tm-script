import { TmStatsGKTable } from './tm-stats-gk-table.js';
import { TmStatsPlayerTable } from './tm-stats-player-table.js';
import { TmStatsFilterGroup } from './tm-stats-filter-group.js';
import { TmUI } from '../shared/tm-ui.js';

const PLAYER_SUB_TABS = [
    { key: 'shooting', label: 'Shooting' },
    { key: 'passing', label: 'Passing' },
    { key: 'defending', label: 'Defending' },
];

    export const TmStatsPlayerTab = {
        render(opts) {
            opts.aggregateIfNeeded();
            const body = document.getElementById('tsa-body');
            if (!body) return;

            const matchTypeCount = opts.getTeamOverall().matches;
            const f = opts.getActiveFilter();
            const activePlayerSubTab = opts.getActivePlayerSubTab();

            const players = Object.entries(opts.getPlayerAgg()).map(([pid, pa]) => ({
                pid, ...pa,
                avgRating: pa.ratingCount > 0 ? pa.rating / pa.ratingCount : 0,
            }));
            const outfield = players.filter(p => !p.isGK);
            const keepers  = players.filter(p =>  p.isGK);

            let html = opts.renderMatchTypeButtons();
            html += '<div id="tsa-player-subtabs" class="tsa-subtabs"></div>';
            html += TmStatsFilterGroup.renderGroup({
                items: ['total', 'average', 'per90'].map(fk => ({
                    key: fk,
                    label: fk === 'per90' ? 'Per 90 min' : fk.charAt(0).toUpperCase() + fk.slice(1),
                })),
                active: f,
                wrapCls: 'tsa-filters',
                itemCls: 'tsa-filter-btn',
                dataAttr: 'filter',
                renderItem: item => item.label,
            });
            html += '<div id="tsa-player-tbl"></div>';
            if (keepers.length > 0) html += '<div id="tsa-gk-tbl"></div>';

            body.innerHTML = html;

            body.querySelector('#tsa-player-subtabs')
                ?.appendChild(TmUI.tabs({
                    items: PLAYER_SUB_TABS,
                    active: activePlayerSubTab,
                    color: 'secondary',
                    cls: 'tsa-subtabs-bar',
                    onChange: key => {
                        opts.setActivePlayerSubTab(key);
                        opts.rerender();
                    },
                }));

            body.querySelector('#tsa-player-tbl')
                .replaceWith(TmStatsPlayerTable.build(outfield, { filter: f, matchTypeCount, category: activePlayerSubTab }));
            if (keepers.length > 0)
                body.querySelector('#tsa-gk-tbl')
                    .replaceWith(TmStatsGKTable.build(keepers, { filter: f, category: activePlayerSubTab, showCards: activePlayerSubTab === 'defending' }));

            TmStatsFilterGroup.bindGroup(body, {
                selector: '.tsa-filter-btn',
                dataAttr: 'filter',
                onChange: key => {
                    opts.setActiveFilter(key);
                    opts.rerender();
                },
            });
            opts.bindMatchTypeButtons(body);
        },
    };

