import { TmUtils } from '../../lib/tm-utils.js';
import { TmStatsAttackingTable } from './tm-stats-attacking-table.js';
import { TmStatsBasicTable } from './tm-stats-basic-table.js';
import { TmStatsDefendingTable } from './tm-stats-defending-table.js';
import { TmStatsGKTable } from './tm-stats-gk-table.js';

const getDisplayValue = (total, matches, minutes, filter) => {
        if (filter === 'total') return total;
        if (filter === 'average') return matches > 0 ? (total / matches) : 0;
        if (filter === 'per90') return minutes > 0 ? (total / minutes * 90) : 0;
        return total;
    };

    const getTopValues = (players, columns, filter) => {
        return TmUtils.getTopNThresholds(players, columns, (p, col) => {
            if (col === 'rat') return p.avgRating;
            const raw = col === 'tp' ? (p.sp || 0) + (p.up || 0)
                : col === 'tc' ? (p.sc || 0) + (p.uc || 0)
                    : col === 'td' ? (p.dw || 0) + (p.dl || 0)
                        : (p[col] || 0);
            return getDisplayValue(raw, p.matches, p.minutes, filter);
        });
    };

    export const TmStatsPlayerTab = {
        render(opts) {
            opts.aggregateIfNeeded();
            const body = document.getElementById('tsa-body');
            if (!body) return;

            const matchTypeCount = opts.getTeamOverall().matches;

            // Match type filter buttons with W-D-L
            let html = opts.renderMatchTypeButtons();

            // Total/Average/Per90 filter
            html += '<div class="tsa-filters">';
            ['total', 'average', 'per90'].forEach(f => {
                const label = f === 'per90' ? 'Per 90 min' : f.charAt(0).toUpperCase() + f.slice(1);
                html += `<div class="tsa-filter-btn${opts.getActiveFilter() === f ? ' active' : ''}" data-filter="${f}">${label}</div>`;
            });
            html += '</div>';

            // Sub-tab buttons
            html += '<div class="tsa-subtabs">';
            [['basic', 'Basic'], ['attacking', 'Attacking'], ['defending', 'Defending']].forEach(([k, label]) => {
                html += `<div class="tsa-subtab-btn${opts.getActivePlayerSubTab() === k ? ' active' : ''}" data-subtab="${k}">${label}</div>`;
            });
            html += '</div>';

            // Player table
            const players = Object.entries(opts.getPlayerAgg()).map(([pid, pa]) => ({
                pid,
                ...pa,
                avgRating: pa.ratingCount > 0 ? pa.rating / pa.ratingCount : 0,
            }));

            const f = opts.getActiveFilter();

            // Compute top 3 for highlighting (outfield only)
            const outfield = players.filter(p => !p.isGK);
            const keepers = players.filter(p => p.isGK);
            const topCols = ['g', 'gf', 'gh', 'a', 'shf', 'shh', 'sotf', 'soth', 'sot', 'sh', 'tp', 'sp', 'sc', 'int', 'tkl', 'hc', 'stp', 'rat', 'kp', 'dw', 'fouls'];
            const tops = getTopValues(outfield, topCols, f);

            // ═══ BASIC TAB ═══
            if (opts.getActivePlayerSubTab() === 'basic') {
                html += '<div id="tsa-basic-tbl"></div>';
            }

            // ═══ ATTACKING TAB ═══
            if (opts.getActivePlayerSubTab() === 'attacking') {
                html += '<div id="tsa-attacking-tbl"></div>';
            }

            // ═══ DEFENDING TAB ═══
            if (opts.getActivePlayerSubTab() === 'defending') {
                html += '<div id="tsa-defending-tbl"></div>';
            }

            // ── Goalkeeper table ──
            if (keepers.length > 0) {
                html += '<div id="tsa-gk-tbl"></div>';
            }

            body.innerHTML = html;

            // ── Inject player sub-tab tables ──
            if (opts.getActivePlayerSubTab() === 'basic') {
                const ph = body.querySelector('#tsa-basic-tbl');
                if (ph) ph.replaceWith(TmStatsBasicTable.build(outfield, { filter: f, tops, matchTypeCount }));
            }
            if (opts.getActivePlayerSubTab() === 'attacking') {
                const ph = body.querySelector('#tsa-attacking-tbl');
                if (ph) ph.replaceWith(TmStatsAttackingTable.build(outfield, { filter: f, tops, matchTypeCount }));
            }
            if (opts.getActivePlayerSubTab() === 'defending') {
                const ph = body.querySelector('#tsa-defending-tbl');
                if (ph) ph.replaceWith(TmStatsDefendingTable.build(outfield, { filter: f, tops, matchTypeCount }));
            }
            if (keepers.length > 0) {
                const ph = body.querySelector('#tsa-gk-tbl');
                if (ph) ph.replaceWith(TmStatsGKTable.build(keepers, { filter: f, showCards: opts.getActivePlayerSubTab() === 'basic' }));
            }

            // Wire events
            body.querySelectorAll('.tsa-subtab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    opts.setActivePlayerSubTab(btn.dataset.subtab);
                    opts.rerender();
                });
            });
            body.querySelectorAll('.tsa-filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    opts.setActiveFilter(btn.dataset.filter);
                    opts.rerender();
                });
            });
            body.querySelectorAll('.tsa-mf-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    opts.setActiveMatchType(btn.dataset.mtype);
                    // Reset tactic filters when match type changes
                    opts.setFilterOurFormation(null);
                    opts.setFilterOurStyle(null);
                    opts.setFilterOurMentality(null);
                    opts.setFilterOppFormation(null);
                    opts.setFilterOppStyle(null);
                    opts.setFilterOppMentality(null);
                    opts.rerender();
                });
            });
        },
    };

