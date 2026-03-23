import { TmPlayerTooltip } from '../player/tm-player-tooltip.js';
import { TmShortlistFilters } from './tm-shortlist-filters.js';
import { TmShortlistTable } from './tm-shortlist-table.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';

/**
 * TmShortlistPanel
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

     const htmlOf = (node) => node ? node.outerHTML : '';
     const buttonHtml = (opts) => TmUI.button(opts).outerHTML;

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
        panel.className = 'tmu-panel tmu-panel-page';

        // ── Tabs row ──
        const fs = filterState;
        const filtered = allPlayers.filter(p => TmShortlistFilters.playerMatchesFilters(p, fs));
        const slCountHtml = filtered.length < allPlayers.length
            ? `<span class="tmsl-tab-count">(${filtered.length}/${allPlayers.length})</span>`
            : `<span class="tmsl-tab-count">(${allPlayers.length})</span>`;

        const ixFiltered = indexedPlayers ? indexedPlayers.filter(p => TmShortlistFilters.playerMatchesFilters(p, fs)) : null;
        const ixCountHtml = ixFiltered !== null
            ? ` ${ixFiltered.length < indexedPlayers.length
                ? `<span class="tmsl-tab-count">(${ixFiltered.length}/${indexedPlayers.length})</span>`
                : `<span class="tmsl-tab-count">(${indexedPlayers.length})</span>`}`
            : '';
        const isLoading = shortlistLoading || loadMoreState === 'loading';
        const tabs = TmUI.tabs({
            items: [
                { key: 'shortlist', slot: `📋 Shortlist ${slCountHtml}` },
                { key: 'indexed', slot: `🗄 Indexed${ixCountHtml}`, disabled: shortlistLoading, title: shortlistLoading ? 'Pričekaj dok se shortlist učita…' : '' },
            ],
            active: activeTab,
            color: 'primary',
        });

        let h = `<div>${htmlOf(tabs)}`;
        h += `<div style="margin-left:auto;display:flex;align-items:center;gap:8px">`;
        if (isLoading) {
            const prog = loadProgress ? `${loadProgress.done}/${loadProgress.total}` : '…';
            h += buttonHtml({ label: `⏳ ${prog}`, color: 'secondary', size: 'xs', disabled: true });
        } else if (loadMoreState === 'done') {
            h += buttonHtml({ label: '✓ All loaded', color: 'secondary', size: 'xs', disabled: true });
        } else {
            h += buttonHtml({ id: 'tmsl-loadmore-btn', label: '⬇ Fetch More', color: 'secondary', size: 'xs' });
        }
        h += `</div></div>`;

        if (shortlistLoading) {
            const prog = loadProgress ? `${loadProgress.done} / ${loadProgress.total}` : '…';
            h += `<div style="text-align:center;padding:60px 20px;color:#4a7a38;font-size:15px;font-weight:600">
                    ⏳ Loading shortlist… <span style="font-weight:400;font-size:13px">(${prog})</span>
                  </div>`;
        } else if (activeTab === 'shortlist') {
            sortPlayers(filtered, sortCol, sortDir);
            h += TmShortlistFilters.buildFilters(fs);
            if (filtered.length) {
                const pageSize = SL_PAGE_SIZE || 50;
                const totalPages = Math.ceil(filtered.length / pageSize);
                const page = Math.min(slPage || 0, totalPages - 1);
                const pageSlice = filtered.slice(page * pageSize, (page + 1) * pageSize);
                h += '<div id="tmsl-table-slot"></div>';
                if (totalPages > 1) {
                    const from = page * pageSize + 1;
                    const to = Math.min((page + 1) * pageSize, filtered.length);
                    h += `<div class="tmsl-pagination">`;
                    h += buttonHtml({ id: 'tmsl-sl-prev', label: '← Prev', color: 'secondary', size: 'xs', disabled: page === 0 });
                    h += `<span style="font-size:12px;color:#a0c080">${from}–${to} of ${filtered.length}</span>`;
                    h += buttonHtml({ id: 'tmsl-sl-next', label: 'Next →', color: 'secondary', size: 'xs', disabled: page >= totalPages - 1 });
                    h += `</div>`;
                }
            } else {
                h += '<div style="text-align:center;padding:40px;color:#4a7a38;font-size:13px">No players match current filters</div>';
            }
        } else {
            if (!indexedPlayers) {
                h += '<div style="text-align:center;padding:40px;color:#4a7a38;font-size:13px">Loading indexed players…</div>';
            } else {
                h += TmShortlistFilters.buildFilters(fs);
                if (!ixFiltered.length) {
                    h += '<div style="text-align:center;padding:40px;color:#4a7a38;font-size:13px">No players match current filters</div>';
                } else {
                    const pageSize = IX_PAGE_SIZE || 50;
                    const totalPages = Math.ceil(ixFiltered.length / pageSize);
                    const page = Math.min(ixPage || 0, totalPages - 1);
                    const pageSlice = ixFiltered.slice(page * pageSize, (page + 1) * pageSize);
                    h += '<div id="tmsl-indexed-table-slot"></div>';
                    if (totalPages > 1) {
                        const from = page * pageSize + 1;
                        const to = Math.min((page + 1) * pageSize, ixFiltered.length);
                        h += `<div class="tmsl-pagination">`;
                        h += buttonHtml({ id: 'tmsl-ix-prev', label: '← Prev', color: 'secondary', size: 'xs', disabled: page === 0 });
                        h += `<span style="font-size:12px;color:#a0c080">${from}–${to} of ${ixFiltered.length}</span>`;
                        h += buttonHtml({ id: 'tmsl-ix-next', label: 'Next →', color: 'secondary', size: 'xs', disabled: page >= totalPages - 1 });
                        h += `</div>`;
                    }
                }
            }
        }

        panel.innerHTML = h;

        const ref = TmUtils.getMainContainer();
        if (ref) ref.parentNode.insertBefore(panel, ref);
        else document.body.appendChild(panel);

        // ── Tab click ──
        panel.querySelectorAll('.tmu-tab[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.disabled || shortlistLoading) return;
                onTabChange(btn.dataset.tab);
            });
        });

        TmShortlistFilters.bindFilters(panel, { onGroupFilter, onSideFilter, onNumFilter });

        if (!shortlistLoading && activeTab === 'shortlist' && filtered.length) {
            const pageSize = SL_PAGE_SIZE || 50;
            const totalPages = Math.ceil(filtered.length / pageSize);
            const page = Math.min(slPage || 0, totalPages - 1);
            const pageSlice = filtered.slice(page * pageSize, (page + 1) * pageSize);
            const slot = panel.querySelector('#tmsl-table-slot');
            if (slot) {
                slot.replaceWith(TmShortlistTable.createTableElement(pageSlice, sortCol, sortDir, onSort));
            }
        }

        if (!shortlistLoading && activeTab === 'indexed' && indexedPlayers && ixFiltered && ixFiltered.length) {
            const pageSize = IX_PAGE_SIZE || 50;
            const totalPages = Math.ceil(ixFiltered.length / pageSize);
            const page = Math.min(ixPage || 0, totalPages - 1);
            const pageSlice = ixFiltered.slice(page * pageSize, (page + 1) * pageSize);
            const slot = panel.querySelector('#tmsl-indexed-table-slot');
            if (slot) {
                slot.replaceWith(TmShortlistTable.createIndexedTableElement(pageSlice, ixSortCol, ixSortDir, onIxSort));
            }
        }

        // ── load more ──
        const lmBtn = document.getElementById('tmsl-loadmore-btn');
        if (lmBtn) lmBtn.addEventListener('click', onLoadMore);

        if (activeTab === 'shortlist') {
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
                    if (p) TmPlayerTooltip.show(link, adaptForTooltip(p));
                });
                link.addEventListener('mouseleave', TmPlayerTooltip.hide);
            });
        } else {
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
                    if (p) TmPlayerTooltip.show(link, adaptForTooltip(p));
                });
                link.addEventListener('mouseleave', TmPlayerTooltip.hide);
            });
        }
    }

    export const TmShortlistPanel = { render };
