// ==UserScript==
// @name         TM Shortlist Panel Component
// @namespace    https://trophymanager.com
// ==/UserScript==

/**
 * window.TmShortlistPanel
 *
 * Renders the full shortlist/indexed panel into the DOM and wires all
 * interactive events via callbacks supplied in the `ctx` argument.
 *
 * ctx shape:
 *   allPlayers, indexedPlayers, activeTab,
 *   sortCol, sortDir, ixSortCol, ixSortDir,
 *   loadMoreState, enrichProgress, indexedProgress, shortlistLoading,
 *   filterState   – pre-built filter snapshot {fPos, fSide, ...}
 *   onTabChange(tab), onGroupFilter(group), onSideFilter(side),
 *   onNumFilter(id, value), onSort(col), onIxSort(col),
 *   onLoadMore(), onReload()
 */
(function () {
    'use strict';

    function getSortVal(p, col) {
        if (col === 'age') return p.age * 12 + (p.months || 0);
        if (col === 'pos') {
            const ord0 = (p.positions || [])[0]?.ordering ?? 9;
            const ord1 = (p.positions || []).length > 1 ? ((p.positions[1]?.ordering) ?? 9) : 0;
            return ord0 * 100 + ((p.positions || []).length > 1 ? 50 + ord1 : 0);
        }
        if (col === 'timeleft') return p.timeleft > 0 ? p.timeleft : 999999999;
        if (col === 'name') return p.name;
        return p[col];
    }

    function sortPlayers(arr, col, dir) {
        arr.sort((a, b) => {
            const va = getSortVal(a, col);
            const vb = getSortVal(b, col);
            if (col === 'name') return dir * String(va).localeCompare(String(vb));
            return dir * ((va || 0) - (vb || 0));
        });
    }

    function adaptForTooltip(p) {
        return {
            ...p,
            no: p.no || 0,
            // skills: shortlist tab = rich objects; indexed tab = plain numbers
            skills: (p.skills || []).map((s, i) => typeof s === 'object' ? s : { value: s, name: p.labels?.[i] || '' }),
        };
    }

    function render(ctx) {
        const {
            allPlayers, indexedPlayers, activeTab,
            sortCol, sortDir, ixSortCol, ixSortDir, ixPage, IX_PAGE_SIZE, slPage, SL_PAGE_SIZE,
            loadMoreState, loadProgress, shortlistLoading,
            filterState,
            onTabChange, onGroupFilter, onSideFilter, onNumFilter,
            onSort, onIxSort, onIxPage, onSlPage, onLoadMore,
        } = ctx;

        let panel = document.getElementById('tmsl-panel');
        if (panel) panel.remove();
        panel = document.createElement('div');
        panel.id = 'tmsl-panel';

        // ── Tabs row ──
        const fs = filterState;
        const filtered = allPlayers.filter(p => window.TmShortlistFilters.playerMatchesFilters(p, fs));
        const slCountHtml = filtered.length < allPlayers.length
            ? `<span class="tmsl-tab-count">(${filtered.length}/${allPlayers.length})</span>`
            : `<span class="tmsl-tab-count">(${allPlayers.length})</span>`;

        const ixFiltered = indexedPlayers ? indexedPlayers.filter(p => window.TmShortlistFilters.playerMatchesFilters(p, fs)) : null;
        const ixCountHtml = ixFiltered !== null
            ? ` ${ixFiltered.length < indexedPlayers.length
                ? `<span class="tmsl-tab-count">(${ixFiltered.length}/${indexedPlayers.length})</span>`
                : `<span class="tmsl-tab-count">(${indexedPlayers.length})</span>`}`
            : '';
        const isLoading = shortlistLoading || loadMoreState === 'loading';
        const ixDisabled = shortlistLoading ? ' disabled title="Pričekaj dok se shortlist učita…"' : '';

        let h = `<div class="tmsl-tabs">`;
        h += `<button class="tmsl-tab${activeTab === 'shortlist' ? ' active' : ''}" data-tab="shortlist">📋 Shortlist ${slCountHtml}</button>`;
        h += `<button class="tmsl-tab${activeTab === 'indexed' ? ' active' : ''}${shortlistLoading ? ' disabled' : ''}" data-tab="indexed"${ixDisabled}>🗄 Indexed${ixCountHtml}</button>`;
        h += `<div style="margin-left:auto;display:flex;align-items:center;gap:8px">`;
        if (isLoading) {
            const prog = loadProgress ? `${loadProgress.done}/${loadProgress.total}` : '…';
            h += `<button class="tmsl-loadbtn" disabled>⏳ ${prog}</button>`;
        } else if (loadMoreState === 'done') {
            h += `<button class="tmsl-loadbtn" disabled>✓ All loaded</button>`;
        } else {
            h += `<button id="tmsl-loadmore-btn" class="tmsl-loadbtn">⬇ Fetch More</button>`;
        }
        h += `</div></div>`;

        if (shortlistLoading) {
            const prog = loadProgress ? `${loadProgress.done} / ${loadProgress.total}` : '…';
            h += `<div style="text-align:center;padding:60px 20px;color:#4a7a38;font-size:15px;font-weight:600">
                    ⏳ Loading shortlist… <span style="font-weight:400;font-size:13px">(${prog})</span>
                  </div>`;
        } else if (activeTab === 'shortlist') {
            sortPlayers(filtered, sortCol, sortDir);
            h += window.TmShortlistFilters.buildFilters(fs);
            if (filtered.length) {
                const pageSize = SL_PAGE_SIZE || 50;
                const totalPages = Math.ceil(filtered.length / pageSize);
                const page = Math.min(slPage || 0, totalPages - 1);
                const pageSlice = filtered.slice(page * pageSize, (page + 1) * pageSize);
                h += window.TmShortlistTable.buildTable(pageSlice, sortCol, sortDir);
                if (totalPages > 1) {
                    const from = page * pageSize + 1;
                    const to = Math.min((page + 1) * pageSize, filtered.length);
                    h += `<div class="tmsl-pagination">`;
                    h += `<button class="tmsl-page-btn" id="tmsl-sl-prev"${page === 0 ? ' disabled' : ''}>&#8592; Prev</button>`;
                    h += `<span style="font-size:12px;color:#a0c080">${from}–${to} of ${filtered.length}</span>`;
                    h += `<button class="tmsl-page-btn" id="tmsl-sl-next"${page >= totalPages - 1 ? ' disabled' : ''}>Next &#8594;</button>`;
                    h += `</div>`;
                }
            } else {
                h += '<div style="text-align:center;padding:40px;color:#4a7a38;font-size:13px">No players match current filters</div>';
            }
        } else {
            if (!indexedPlayers) {
                h += '<div style="text-align:center;padding:40px;color:#4a7a38;font-size:13px">Loading indexed players…</div>';
            } else {
                h += window.TmShortlistFilters.buildFilters(fs);
                if (!ixFiltered.length) {
                    h += '<div style="text-align:center;padding:40px;color:#4a7a38;font-size:13px">No players match current filters</div>';
                } else {
                    const pageSize = IX_PAGE_SIZE || 50;
                    const totalPages = Math.ceil(ixFiltered.length / pageSize);
                    const page = Math.min(ixPage || 0, totalPages - 1);
                    const pageSlice = ixFiltered.slice(page * pageSize, (page + 1) * pageSize);
                    h += window.TmShortlistTable.buildIndexedTable(pageSlice, ixSortCol, ixSortDir);
                    if (totalPages > 1) {
                        const from = page * pageSize + 1;
                        const to = Math.min((page + 1) * pageSize, ixFiltered.length);
                        h += `<div class="tmsl-pagination">`;
                        h += `<button class="tmsl-page-btn" id="tmsl-ix-prev"${page === 0 ? ' disabled' : ''}>&#8592; Prev</button>`;
                        h += `<span style="font-size:12px;color:#a0c080">${from}–${to} of ${ixFiltered.length}</span>`;
                        h += `<button class="tmsl-page-btn" id="tmsl-ix-next"${page >= totalPages - 1 ? ' disabled' : ''}>Next &#8594;</button>`;
                        h += `</div>`;
                    }
                }
            }
        }

        panel.innerHTML = h;

        const ref = document.querySelector('.column1_d') || document.querySelector('.main_center');
        if (ref) ref.parentNode.insertBefore(panel, ref);
        else document.body.appendChild(panel);

        const mc = document.querySelector('.main_center');
        if (mc) mc.style.maxWidth = '1250px';

        // ── Tab click ──
        panel.querySelectorAll('.tmsl-tab[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.disabled || shortlistLoading) return;
                onTabChange(btn.dataset.tab);
            });
        });

        // ── position filter buttons ──
        panel.querySelectorAll('.tmsl-pos-btn[data-group]').forEach(btn => {
            btn.addEventListener('click', () => onGroupFilter(btn.dataset.group));
        });

        // ── side filter buttons ──
        panel.querySelectorAll('.tmsl-side-btn[data-side]').forEach(btn => {
            btn.addEventListener('click', () => onSideFilter(btn.dataset.side));
        });

        // ── number filters ──
        ['tmsl-agemin', 'tmsl-agemax', 'tmsl-r5min', 'tmsl-r5max',
         'tmsl-recmin', 'tmsl-recmax', 'tmsl-timin', 'tmsl-timax'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', e => onNumFilter(id, e.target.value));
        });

        // ── load more ──
        const lmBtn = document.getElementById('tmsl-loadmore-btn');
        if (lmBtn) lmBtn.addEventListener('click', onLoadMore);

        if (activeTab === 'shortlist') {
            // ── sort click ──
            panel.querySelectorAll('th[data-col]').forEach(th => {
                th.addEventListener('click', () => onSort(th.dataset.col));
            });
            // ── pagination ──
            const slPrevBtn = document.getElementById('tmsl-sl-prev');
            if (slPrevBtn) slPrevBtn.addEventListener('click', () => onSlPage(-1));
            const slNextBtn = document.getElementById('tmsl-sl-next');
            if (slNextBtn) slNextBtn.addEventListener('click', () => onSlPage(1));
            // ── tooltip on name hover ──
            panel.querySelectorAll('tr[data-pid]').forEach(tr => {
                const link = tr.querySelector('.tmsl-link');
                if (!link) return;
                link.addEventListener('mouseenter', () => {
                    const p = allPlayers.find(pl => pl.id === tr.dataset.pid);
                    if (p) window.TmPlayerTooltip.show(link, adaptForTooltip(p));
                });
                link.addEventListener('mouseleave', window.TmPlayerTooltip.hide);
            });
        } else {
            // ── indexed sort click ──
            panel.querySelectorAll('th[data-ixcol]').forEach(th => {
                th.addEventListener('click', () => onIxSort(th.dataset.ixcol));
            });
            // ── pagination ──
            const prevBtn = document.getElementById('tmsl-ix-prev');
            if (prevBtn) prevBtn.addEventListener('click', () => onIxPage(-1));
            const nextBtn = document.getElementById('tmsl-ix-next');
            if (nextBtn) nextBtn.addEventListener('click', () => onIxPage(1));
            // ── tooltip on indexed row hover ──
            panel.querySelectorAll('tr[data-ixpid]').forEach(tr => {
                const link = tr.querySelector('.tmsl-link');
                if (!link) return;
                link.addEventListener('mouseenter', () => {
                    const p = indexedPlayers && indexedPlayers.find(pl => pl.id === tr.dataset.ixpid);
                    if (p) window.TmPlayerTooltip.show(link, adaptForTooltip(p));
                });
                link.addEventListener('mouseleave', window.TmPlayerTooltip.hide);
            });
        }
    }

    window.TmShortlistPanel = { render };
})();
