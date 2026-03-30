import { TmStatsAdvTable } from './tm-stats-adv-table.js';
import { TmStatsFilterGroup } from './tm-stats-filter-group.js';
import { TmStatsMatchList } from './tm-stats-match-list.js';
import { TmStatsTacticDropdown } from './tm-stats-tactic-dropdown.js';
import { TmSummaryStrip } from '../shared/tm-summary-strip.js';
import { TmUI } from '../shared/tm-ui.js';

const fix2 = v => (Math.round(v * 100) / 100).toFixed(2);
const TACTIC_DROPDOWN_GROUPS = {
    our: [
        { filterKey: 'ourFormation', valuesKey: 'ourFormations', label: 'Form', icon: '📋' },
        { filterKey: 'ourStyle', valuesKey: 'ourStyles', label: 'Style', icon: '🎯' },
        { filterKey: 'ourMentality', valuesKey: 'ourMentalities', label: 'Ment', icon: '⚔' },
    ],
    opp: [
        { filterKey: 'oppFormation', valuesKey: 'oppFormations', label: 'Form', icon: '📋' },
        { filterKey: 'oppStyle', valuesKey: 'oppStyles', label: 'Style', icon: '🎯' },
        { filterKey: 'oppMentality', valuesKey: 'oppMentalities', label: 'Ment', icon: '⚔' },
    ],
};

const collectTacticValues = (opts) => {
    const base = opts.getActiveMatchType() === 'all' ? opts.getAllMatchData() : opts.getAllMatchData().filter(m => m.matchType === opts.getActiveMatchType());

    const allFilters = Object.fromEntries(
        [...TACTIC_DROPDOWN_GROUPS.our, ...TACTIC_DROPDOWN_GROUPS.opp].map(({ filterKey }) => [filterKey, opts.getTacticFilter(filterKey)])
    );

    // Filter matches by all active filters EXCEPT the excluded one
    const filterExcluding = (excludeKey) => {
        return base.filter(md => {
            for (const [key, set] of Object.entries(allFilters)) {
                if (key === excludeKey || !set) continue;
                if (!set.has(md[key])) return false;
            }
            return true;
        });
    };

    const count = (arr, key) => {
        const map = {};
        arr.forEach(md => { const v = md[key]; map[v] = (map[v] || 0) + 1; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    };

    return {
        ourFormations: count(filterExcluding('ourFormation'), 'ourFormation'),
        ourStyles: count(filterExcluding('ourStyle'), 'ourStyle'),
        ourMentalities: count(filterExcluding('ourMentality'), 'ourMentality'),
        oppFormations: count(filterExcluding('oppFormation'), 'oppFormation'),
        oppStyles: count(filterExcluding('oppStyle'), 'oppStyle'),
        oppMentalities: count(filterExcluding('oppMentality'), 'oppMentality'),
    };
};

const pruneStaleFilters = (opts) => {
    const tv = collectTacticValues(opts);
    const prune = (filterSet, available, setter) => {
        if (!filterSet) return;
        const availKeys = new Set(available.map(([v]) => v));
        const cleaned = new Set([...filterSet].filter(v => availKeys.has(v)));
        if (cleaned.size === 0) setter(null);
        else if (cleaned.size !== filterSet.size) setter(cleaned);
    };
    [...TACTIC_DROPDOWN_GROUPS.our, ...TACTIC_DROPDOWN_GROUPS.opp].forEach(({ filterKey, valuesKey }) => {
        prune(opts.getTacticFilter(filterKey), tv[valuesKey], value => opts.setTacticFilter(filterKey, value));
    });
};

export const TmStatsTeamTab = {
    render(opts) {
        opts.aggregateIfNeeded();
        const body = document.getElementById('tsa-body');
        if (!body) return;

        const t = opts.getTeamOverall();

        // Match type filter buttons
        let html = opts.renderMatchTypeButtons();

        // Total/Average filter
        html += TmStatsFilterGroup.renderGroup({
            items: ['total', 'average'].map(f => ({ key: f, label: f.charAt(0).toUpperCase() + f.slice(1) })),
            active: opts.getActiveTeamFilter(),
            wrapCls: 'tsa-filters',
            itemCls: 'tsa-filter-btn',
            dataAttr: 'tfilter',
            renderItem: item => item.label,
        });

        // Tactic dropdown filters
        const tv = collectTacticValues(opts);
        const hasOurFilters = TACTIC_DROPDOWN_GROUPS.our.some(({ valuesKey }) => tv[valuesKey].length > 1);
        const hasOppFilters = TACTIC_DROPDOWN_GROUPS.opp.some(({ valuesKey }) => tv[valuesKey].length > 1);
        if (hasOurFilters) {
            html += '<div class="tsa-tactic-row">';
            html += '<span class="tsa-tr-label">Our:</span>';
            TACTIC_DROPDOWN_GROUPS.our.forEach(({ filterKey, valuesKey, label, icon }) => {
                if (tv[valuesKey].length > 1) {
                    html += TmStatsTacticDropdown.renderDropdown({ label, icon, values: tv[valuesKey], filterSet: opts.getTacticFilter(filterKey), key: filterKey });
                }
            });
            html += '</div>';
        }
        if (hasOppFilters) {
            html += '<div class="tsa-tactic-row">';
            html += '<span class="tsa-tr-label">Opp:</span>';
            TACTIC_DROPDOWN_GROUPS.opp.forEach(({ filterKey, valuesKey, label, icon }) => {
                if (tv[valuesKey].length > 1) {
                    html += TmStatsTacticDropdown.renderDropdown({ label, icon, values: tv[valuesKey], filterSet: opts.getTacticFilter(filterKey), key: filterKey });
                }
            });
            html += '</div>';
        }

        const tf = opts.getActiveTeamFilter();
        const m = t.matches || 1;

        // Summary strip
        const gd = t.goalsFor - t.goalsAgainst;
        const gdSign = gd > 0 ? '+' : '';
        const gdColor = gd > 0 ? 'var(--tmu-success)' : gd < 0 ? 'var(--tmu-danger)' : 'var(--tmu-warning)';
        html += TmSummaryStrip.render([
            { label: 'Matches', value: String(t.matches) },
            { label: 'Wins', value: String(t.wins), valueStyle: 'color:var(--tmu-success)' },
            { label: 'Draws', value: String(t.draws), valueStyle: 'color:var(--tmu-warning)' },
            { label: 'Losses', value: String(t.losses), valueStyle: 'color:var(--tmu-danger)' },
            { label: 'Goal Diff', value: `${gdSign}${gd}`, valueStyle: `color:${gdColor}` },
        ], { cls: 'tsa-summary-strip', variant: 'boxed', valueFirst: true, align: 'center' });

        // Helper to apply avg/total filter to bar values
        const bv = (val) => tf === 'average' ? fix2(val / m) : val;

        // Bar stats – For vs Against
        const barRow = (label, forVal, agVal, suffix) => {
            const fv = tf === 'average' ? Number(fix2(forVal / m)) : forVal;
            const av = tf === 'average' ? Number(fix2(agVal / m)) : agVal;
            const fDisplay = tf === 'average' ? fix2(forVal / m) : forVal;
            const aDisplay = tf === 'average' ? fix2(agVal / m) : agVal;
            const sfx = suffix || '';
            return TmUI.compareStat({
                label,
                leftValue: `${fDisplay}${sfx}`,
                rightValue: `${aDisplay}${sfx}`,
                leftNumber: fv,
                rightNumber: av,
                leftTone: 'for',
                rightTone: 'against',
                size: 'sm',
                cls: 'tsa-stat-compare',
            });
        };

        const statLabel = tf === 'average' ? 'Match Statistics — Per Match Average (For vs Against)' : 'Match Statistics (For vs Against)';
        html += `<div class="tsa-section-title">${statLabel}</div>`;

        html += barRow('Goals', t.goalsFor, t.goalsAgainst);
        html += '<div class="tsa-stat-divider"></div>';
        if (t.possCount > 0) {
            const avgPossFor = Math.round(t.possFor / t.possCount);
            const avgPossAgainst = Math.round(t.possAgainst / t.possCount);
            html += barRow('Avg Possession', avgPossFor, avgPossAgainst, '%');
            html += '<div class="tsa-stat-divider"></div>';
        }
        html += barRow('Shots', t.shotsFor, t.shotsAgainst);
        html += barRow('On Target', t.soTFor, t.soTAgainst);
        html += '<div class="tsa-stat-divider"></div>';
        html += barRow('Yellow Cards', t.yellowFor, t.yellowAgainst);
        html += barRow('Red Cards', t.redFor, t.redAgainst);
        html += '<div class="tsa-stat-divider"></div>';
        html += barRow('Free Kicks', t.setPiecesFor, t.setPiecesAgainst);
        html += barRow('Penalties', t.penaltiesFor, t.penaltiesAgainst);

        // Attacking Styles – Our attacks
        html += '<div class="tsa-section-title">Our Attacking Styles</div>';
        html += '<div id="tsa-adv-tbl-for"></div>';

        // Attacking Styles – Opponent attacks
        html += '<div class="tsa-section-title">Opponent Attacking Styles</div>';
        html += '<div id="tsa-adv-tbl-against"></div>';

        // ── Match list ──
        html += '<div id="tsa-ml"></div>';

        body.innerHTML = html;

        // Inject adv-table components
        const phFor = body.querySelector('#tsa-adv-tbl-for');
        if (phFor) phFor.replaceWith(TmStatsAdvTable.build(opts.getTeamAggFor(), { tf, mCount: m }));
        const phAgainst = body.querySelector('#tsa-adv-tbl-against');
        if (phAgainst) phAgainst.replaceWith(TmStatsAdvTable.build(opts.getTeamAggAgainst(), { tf, mCount: m }));
        const phMl = body.querySelector('#tsa-ml');
        if (phMl) phMl.replaceWith(TmStatsMatchList.build(opts.getLastFilteredMatches()));

        // Wire match type filter
        opts.bindMatchTypeButtons(body);
        TmStatsFilterGroup.bindGroup(body, {
            selector: '[data-tfilter]',
            dataAttr: 'tfilter',
            onChange: key => {
                opts.setActiveTeamFilter(key);
                opts.rerender();
            },
        });
        TmStatsTacticDropdown.bindDropdowns(body, {
            getFilter: opts.getTacticFilter,
            setFilter: opts.setTacticFilter,
            afterChange: () => {
                pruneStaleFilters(opts);
                opts.setLastAggKey(null);
                opts.rerender();
            },
        });
    },
};

