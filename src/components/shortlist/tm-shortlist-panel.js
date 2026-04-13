import { TmPlayerTooltip } from '../player/tooltip/tm-player-tooltip.js';
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
        panel.className = 'tmu-panel-page';

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
            ],
            active: activeTab,
            color: 'primary',
        });

        // build load-state button HTML for injection into filter bar
        let loadBtnHtml = '';
        if (isLoading) {
            const prog = loadProgress ? `${loadProgress.done}/${loadProgress.total}` : '…';
            loadBtnHtml = buttonHtml({ label: `⏳ ${prog}`, color: 'secondary', size: 'xs', disabled: true });
        } else if (loadMoreState === 'done') {
            loadBtnHtml = buttonHtml({ label: '✓ All loaded', color: 'secondary', size: 'xs', disabled: true });
        } else {
            loadBtnHtml = buttonHtml({ id: 'tmsl-loadmore-btn', label: '⬇ Fetch More', color: 'secondary', size: 'xs' });
        }

        let h = `<div>${htmlOf(tabs)}</div>`;

        if (shortlistLoading) {
            const prog = loadProgress ? `${loadProgress.done} / ${loadProgress.total}` : '…';
            h += TmUI.loading(`Loading shortlist… (${prog})`);
        } else if (activeTab === 'shortlist') {
            sortPlayers(filtered, sortCol, sortDir);
            h += TmShortlistFilters.buildFilters(fs, { loadHtml: loadBtnHtml });
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
                    h += `<span style="font-size:var(--tmu-font-sm);color:var(--tmu-text-accent-soft)">${from}–${to} of ${filtered.length}</span>`;
                    h += buttonHtml({ id: 'tmsl-sl-next', label: 'Next →', color: 'secondary', size: 'xs', disabled: page >= totalPages - 1 });
                    h += `</div>`;
                }
            } else {
                h += TmUI.empty('No players match current filters');
            }
        } else {
            h += TmUI.empty('Indexed tab is unavailable.');
        }

        panel.innerHTML = h;

        const ref = ctx.main || TmUtils.getMainContainer();
        if (ref) ref.appendChild(panel);
        else document.body.appendChild(panel);

        panel.onclick = (event) => {
            const tabButton = event.target.closest('.tmu-tab[data-tab]');
            if (tabButton && panel.contains(tabButton)) {
                if (tabButton.disabled || shortlistLoading) return;
                onTabChange(tabButton.dataset.tab);
                return;
            }

            const loadMoreButton = event.target.closest('#tmsl-loadmore-btn');
            if (loadMoreButton && panel.contains(loadMoreButton)) {
                onLoadMore();
                return;
            }

            const shortlistPrevButton = event.target.closest('#tmsl-sl-prev');
            if (shortlistPrevButton && panel.contains(shortlistPrevButton)) {
                onSlPage(-1);
                return;
            }

            const shortlistNextButton = event.target.closest('#tmsl-sl-next');
            if (shortlistNextButton && panel.contains(shortlistNextButton)) {
                onSlPage(1);
                return;
            }

        };

        panel.onmouseover = (event) => {
            const link = event.target.closest('.tmsl-link');
            if (!link || !panel.contains(link) || link.contains(event.relatedTarget)) return;

            const shortlistRow = link.closest('tr[data-pid]');
            if (shortlistRow) {
                const player = allPlayers.find(pl => pl.id === shortlistRow.dataset.pid);
                if (player) TmPlayerTooltip.show(link, adaptForTooltip(player));
                return;
            }

        };

        panel.onmouseout = (event) => {
            const link = event.target.closest('.tmsl-link');
            if (!link || !panel.contains(link) || link.contains(event.relatedTarget)) return;
            TmPlayerTooltip.hide();
        };

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

    }

    export const TmShortlistPanel = { render };
