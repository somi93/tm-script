(function () {
    'use strict';

    const fix2 = v => (Math.round(v * 100) / 100).toFixed(2);

    const collectTacticValues = (opts) => {
        const base = opts.getActiveMatchType() === 'all' ? opts.getAllMatchData() : opts.getAllMatchData().filter(m => m.matchType === opts.getActiveMatchType());

        const allFilters = {
            ourFormation: opts.getFilterOurFormation(),
            ourStyle: opts.getFilterOurStyle(),
            ourMentality: opts.getFilterOurMentality(),
            oppFormation: opts.getFilterOppFormation(),
            oppStyle: opts.getFilterOppStyle(),
            oppMentality: opts.getFilterOppMentality(),
        };

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
        prune(opts.getFilterOurFormation(), tv.ourFormations, opts.setFilterOurFormation);
        prune(opts.getFilterOurStyle(), tv.ourStyles, opts.setFilterOurStyle);
        prune(opts.getFilterOurMentality(), tv.ourMentalities, opts.setFilterOurMentality);
        prune(opts.getFilterOppFormation(), tv.oppFormations, opts.setFilterOppFormation);
        prune(opts.getFilterOppStyle(), tv.oppStyles, opts.setFilterOppStyle);
        prune(opts.getFilterOppMentality(), tv.oppMentalities, opts.setFilterOppMentality);
    };

    const buildDropdown = (label, icon, values, filterSet, dataAttr) => {
        const isAll = !filterSet;
        // Button display
        let btnContent;
        if (isAll) {
            btnContent = `<span class="tsa-dd-icon">${icon}</span>${label}: All`;
        } else {
            const tags = [...filterSet].map(v => `<span class="tsa-dd-tag">${v}</span>`).join('');
            btnContent = `<span class="tsa-dd-icon">${icon}</span><span class="tsa-dd-tags">${tags}</span>`;
        }
        let html = `<div class="tsa-dd-wrap">`;
        html += `<div class="tsa-dd-btn${isAll ? '' : ' has-filter'}" data-dd="${dataAttr}">${btnContent}<span class="tsa-dd-arrow">▾</span></div>`;
        html += `<div class="tsa-dd-panel" data-dd-panel="${dataAttr}">`;
        // "All" option
        html += `<div class="tsa-dd-opt tsa-dd-all${isAll ? ' selected' : ''}" data-tactic="${dataAttr}" data-val="__all__"><span class="tsa-dd-check">${isAll ? '✓' : ''}</span>All<span class="tsa-dd-cnt">${values.reduce((s, v) => s + v[1], 0)}</span></div>`;
        values.forEach(([val, cnt]) => {
            const sel = isAll || filterSet.has(val);
            html += `<div class="tsa-dd-opt${sel && !isAll ? ' selected' : ''}" data-tactic="${dataAttr}" data-val="${val}"><span class="tsa-dd-check">${sel && !isAll ? '✓' : ''}</span>${val}<span class="tsa-dd-cnt">${cnt}</span></div>`;
        });
        html += `</div></div>`;
        return html;
    };

    window.TmStatsTeamTab = {
        render(opts) {
            opts.aggregateIfNeeded();
            const body = document.getElementById('tsa-body');
            if (!body) return;

            const t = opts.getTeamOverall();

            // Match type filter buttons
            let html = opts.renderMatchTypeButtons();

            // Total/Average filter
            html += '<div class="tsa-filters">';
            ['total', 'average'].forEach(f => {
                const label = f.charAt(0).toUpperCase() + f.slice(1);
                html += `<div class="tsa-filter-btn${opts.getActiveTeamFilter() === f ? ' active' : ''}" data-tfilter="${f}">${label}</div>`;
            });
            html += '</div>';

            // Tactic dropdown filters
            const tv = collectTacticValues(opts);
            const hasOurFilters = tv.ourFormations.length > 1 || tv.ourStyles.length > 1 || tv.ourMentalities.length > 1;
            const hasOppFilters = tv.oppFormations.length > 1 || tv.oppStyles.length > 1 || tv.oppMentalities.length > 1;
            if (hasOurFilters) {
                html += '<div class="tsa-tactic-row">';
                html += '<span class="tsa-tr-label">Our:</span>';
                if (tv.ourFormations.length > 1) html += buildDropdown('Form', '📋', tv.ourFormations, opts.getFilterOurFormation(), 'ourFormation');
                if (tv.ourStyles.length > 1) html += buildDropdown('Style', '🎯', tv.ourStyles, opts.getFilterOurStyle(), 'ourStyle');
                if (tv.ourMentalities.length > 1) html += buildDropdown('Ment', '⚔', tv.ourMentalities, opts.getFilterOurMentality(), 'ourMentality');
                html += '</div>';
            }
            if (hasOppFilters) {
                html += '<div class="tsa-tactic-row">';
                html += '<span class="tsa-tr-label">Opp:</span>';
                if (tv.oppFormations.length > 1) html += buildDropdown('Form', '📋', tv.oppFormations, opts.getFilterOppFormation(), 'oppFormation');
                if (tv.oppStyles.length > 1) html += buildDropdown('Style', '🎯', tv.oppStyles, opts.getFilterOppStyle(), 'oppStyle');
                if (tv.oppMentalities.length > 1) html += buildDropdown('Ment', '⚔', tv.oppMentalities, opts.getFilterOppMentality(), 'oppMentality');
                html += '</div>';
            }

            const tf = opts.getActiveTeamFilter();
            const m = t.matches || 1;

            // Summary cards
            html += '<div class="tsa-summary-cards">';
            html += `<div class="tsa-summary-card"><div class="tsa-summary-val">${t.matches}</div><div class="tsa-summary-lbl">Matches</div></div>`;
            html += `<div class="tsa-summary-card"><div class="tsa-summary-val" style="color:#80e048">${t.wins}</div><div class="tsa-summary-lbl">Wins</div></div>`;
            html += `<div class="tsa-summary-card"><div class="tsa-summary-val" style="color:#bbcc00">${t.draws}</div><div class="tsa-summary-lbl">Draws</div></div>`;
            html += `<div class="tsa-summary-card"><div class="tsa-summary-val" style="color:#ee5533">${t.losses}</div><div class="tsa-summary-lbl">Losses</div></div>`;
            const gd = t.goalsFor - t.goalsAgainst;
            const gdSign = gd > 0 ? '+' : '';
            const gdColor = gd > 0 ? '#80e048' : gd < 0 ? '#ee5533' : '#bbcc00';
            html += `<div class="tsa-summary-card"><div class="tsa-summary-val" style="color:${gdColor}">${gdSign}${gd}</div><div class="tsa-summary-lbl">Goal Diff</div></div>`;
            html += '</div>';

            // Helper to apply avg/total filter to bar values
            const bv = (val) => tf === 'average' ? fix2(val / m) : val;

            // Bar stats – For vs Against
            const barRow = (label, forVal, agVal, suffix) => {
                const fv = tf === 'average' ? Number(fix2(forVal / m)) : forVal;
                const av = tf === 'average' ? Number(fix2(agVal / m)) : agVal;
                const fDisplay = tf === 'average' ? fix2(forVal / m) : forVal;
                const aDisplay = tf === 'average' ? fix2(agVal / m) : agVal;
                const sfx = suffix || '';
                const total = fv + av;
                const fPct = total === 0 ? 50 : Math.round(fv / total * 100);
                const aPct = 100 - fPct;
                const fLead = fv > av ? ' leading' : '';
                const aLead = av > fv ? ' leading' : '';
                return `<div class="tsa-stat-row">
                    <div class="tsa-stat-header">
                        <span class="tsa-stat-val for${fLead}">${fDisplay}${sfx}</span>
                        <span class="tsa-stat-label">${label}</span>
                        <span class="tsa-stat-val against${aLead}">${aDisplay}${sfx}</span>
                    </div>
                    <div class="tsa-stat-bar-wrap">
                        <div class="tsa-stat-seg for" style="width:${fPct}%"></div>
                        <div class="tsa-stat-seg against" style="width:${aPct}%"></div>
                    </div>
                </div>`;
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
            // Wire team filter (total/average)
            body.querySelectorAll('[data-tfilter]').forEach(btn => {
                btn.addEventListener('click', () => {
                    opts.setActiveTeamFilter(btn.dataset.tfilter);
                    opts.rerender();
                });
            });
            // Wire dropdown open/close
            const filterMap = {
                ourFormation: v => opts.setFilterOurFormation(v),
                ourStyle: v => opts.setFilterOurStyle(v),
                ourMentality: v => opts.setFilterOurMentality(v),
                oppFormation: v => opts.setFilterOppFormation(v),
                oppStyle: v => opts.setFilterOppStyle(v),
                oppMentality: v => opts.setFilterOppMentality(v),
            };
            const filterGet = {
                ourFormation: () => opts.getFilterOurFormation(),
                ourStyle: () => opts.getFilterOurStyle(),
                ourMentality: () => opts.getFilterOurMentality(),
                oppFormation: () => opts.getFilterOppFormation(),
                oppStyle: () => opts.getFilterOppStyle(),
                oppMentality: () => opts.getFilterOppMentality(),
            };

            const closeAllDropdowns = () => {
                body.querySelectorAll('.tsa-dd-panel.open').forEach(p => p.classList.remove('open'));
            };

            // Toggle dropdown on button click
            body.querySelectorAll('.tsa-dd-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const attr = btn.dataset.dd;
                    const panel = body.querySelector(`.tsa-dd-panel[data-dd-panel="${attr}"]`);
                    const wasOpen = panel.classList.contains('open');
                    closeAllDropdowns();
                    if (!wasOpen) {
                        // Check if panel would go off-screen right
                        panel.classList.add('open');
                        const rect = panel.getBoundingClientRect();
                        if (rect.right > window.innerWidth - 10) {
                            panel.classList.add('align-right');
                        }
                    }
                });
            });

            // Handle option clicks
            body.querySelectorAll('.tsa-dd-opt').forEach(opt => {
                opt.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const attr = opt.dataset.tactic;
                    const val = opt.dataset.val;
                    const currentSet = filterGet[attr]();
                    const allVals = [...body.querySelectorAll(`.tsa-dd-opt[data-tactic="${attr}"]:not(.tsa-dd-all)`)].map(o => o.dataset.val);

                    if (val === '__all__') {
                        // Reset to all
                        filterMap[attr](null);
                    } else if (!currentSet) {
                        // Currently all — first click selects only this one
                        filterMap[attr](new Set([val]));
                    } else if (currentSet.has(val)) {
                        // Toggle off
                        currentSet.delete(val);
                        if (currentSet.size === 0) filterMap[attr](null);
                    } else {
                        // Toggle on
                        currentSet.add(val);
                        if (currentSet.size === allVals.length) filterMap[attr](null);
                    }
                    pruneStaleFilters(opts);
                    opts.setLastAggKey(null);
                    opts.rerender();
                });
            });

            // Close dropdowns on outside click
            const outsideClick = (e) => {
                if (!e.target.closest('.tsa-dd-wrap')) closeAllDropdowns();
            };
            document.addEventListener('click', outsideClick, { once: true, capture: true });
            // Re-register on each render since body.innerHTML is replaced
            body.addEventListener('click', (e) => {
                if (!e.target.closest('.tsa-dd-wrap')) closeAllDropdowns();
            });
        },
    };

})();
