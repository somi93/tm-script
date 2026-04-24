import { TmStatsMatchList } from './tm-stats-match-list.js';
import { TmStatsTacticDropdown } from './tm-stats-tactic-dropdown.js';
import { TmSummaryStrip } from '../shared/tm-summary-strip.js';
import { TmStatsBarsSection } from './tm-stats-bars-section.js';
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
        const tf0 = opts.getActiveTeamFilter();
        html += `<div class="tsa-filters">${['total', 'average'].map(f => {
            const label = f.charAt(0).toUpperCase() + f.slice(1);
            const active = f === tf0;
            return `<button type="button" class="tmu-btn tmu-btn-variant-button tmu-btn-primary rounded-md tmu-btn-size-sm${active ? ' tmu-btn-active' : ''}" data-tfilter="${f}">${label}</button>`;
        }).join('')}</div>`;

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

        const { html: statsHtml, mountAdvTables } = TmStatsBarsSection.render({
            bars: {
                goals:     [t.goalsFor, t.goalsAgainst],
                poss:      t.possCount > 0 ? [Math.round(t.possFor / t.possCount), Math.round(t.possAgainst / t.possCount)] : null,
                shots:     [t.shotsFor, t.shotsAgainst],
                sot:       [t.soTFor, t.soTAgainst],
                yellow:    [t.yellowFor, t.yellowAgainst],
                red:       [t.redFor, t.redAgainst],
                freekicks: [t.setPiecesFor, t.setPiecesAgainst],
                penalties: [t.penaltiesFor, t.penaltiesAgainst],
            },
            advLeft:   opts.getTeamAggFor(),
            advRight:  opts.getTeamAggAgainst(),
            leftTone:  'for',
            rightTone: 'against',
            tf, mCount: m,
        });
        html += statsHtml;
        html += '<div id="tsa-ml"></div>';

        body.innerHTML = html;

        mountAdvTables(body);
        const phMl = body.querySelector('#tsa-ml');
        if (phMl) phMl.replaceWith(TmStatsMatchList.build(opts.getLastFilteredMatches()));

        // Wire match type filter
        opts.bindMatchTypeButtons(body);
        body.addEventListener('click', (event) => {
            const btn = event.target.closest('[data-tfilter]');
            if (!btn || !body.contains(btn)) return;
            const key = btn.dataset.tfilter;
            if (!key || key === opts.getActiveTeamFilter()) return;
            opts.setActiveTeamFilter(key);
            opts.rerender();
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

