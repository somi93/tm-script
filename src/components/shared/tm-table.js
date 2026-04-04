import { TmState } from './tm-state.js';

const STYLE_ID = 'tmu-table-style';

const TMU_TABLE_CSS = `
/* ── Table ── */
.tmu-tbl{width:100%;border-collapse:collapse;font-size:var(--tmu-font-sm);--tmu-tbl-head-py:var(--tmu-space-sm);--tmu-tbl-head-px:var(--tmu-space-sm);--tmu-tbl-body-py:var(--tmu-space-xs);--tmu-tbl-body-px:var(--tmu-space-sm)}
.tmu-tbl.tmu-tbl-density-cozy{--tmu-tbl-head-py:var(--tmu-space-sm);--tmu-tbl-head-px:var(--tmu-space-sm);--tmu-tbl-body-py:var(--tmu-space-sm);--tmu-tbl-body-px:var(--tmu-space-sm)}
.tmu-tbl.tmu-tbl-density-tight{--tmu-tbl-head-py:var(--tmu-space-xs);--tmu-tbl-head-px:var(--tmu-space-xs);--tmu-tbl-body-py:var(--tmu-space-xs);--tmu-tbl-body-px:var(--tmu-space-xs)}
.tmu-tbl thead th{padding:var(--tmu-tbl-head-py) var(--tmu-tbl-head-px);font-size:var(--tmu-font-xs);font-weight:700;color:var(--tmu-text-faint);text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid var(--tmu-border-soft);text-align:left;white-space:nowrap;transition:color .15s}
.tmu-tbl thead th.r{text-align:right} .tmu-tbl thead th.c{text-align:center}
.tmu-tbl thead th.sortable{cursor:pointer;user-select:none}
.tmu-tbl thead th.sortable:hover{color:var(--tmu-text-main)}
.tmu-tbl thead th.sort-active{color:var(--tmu-text-main)}
.tmu-tbl tbody td{padding:var(--tmu-tbl-body-py) var(--tmu-tbl-body-px);border-bottom:1px solid var(--tmu-border-faint);color:var(--tmu-text-main);font-variant-numeric:tabular-nums;text-align:left}
.tmu-tbl tbody td.r{text-align:right} .tmu-tbl tbody td.c{text-align:center}
.tmu-tbl tbody tr:nth-child(odd){background:var(--tmu-color-accent)}
.tmu-tbl tbody tr:nth-child(even){background:var(--tmu-color-base)}
.tmu-tbl tbody tr:hover{background:var(--tmu-surface-dark-mid) !important}
.tmu-tbl thead th.tmu-tbl-col-action,.tmu-tbl tbody td.tmu-tbl-col-action{width:1%;white-space:nowrap;text-align:right}
.tmu-tbl tbody tr.tmu-tbl-empty-row:hover{background:transparent}
.tmu-tbl tbody tr.tmu-tbl-empty-row td{padding:0;border-bottom:none}
.tmu-tbl-empty-cell{padding:var(--tmu-space-sm) 0}
.tmu-tbl-tot td{border-top:2px solid var(--tmu-border-embedded);color:var(--tmu-text-strong);font-weight:800}
.tmu-tbl-avg td{color:var(--tmu-text-faint);font-weight:600}
.tmu-tbl .tmu-grp-row th{background:var(--tmu-surface-tab-active);color:var(--tmu-text-faint);font-size:var(--tmu-font-2xs);text-align:center;letter-spacing:.2px;border-bottom:1px solid var(--tmu-border-soft);padding:var(--tmu-space-xs) var(--tmu-space-xs);white-space:nowrap;font-weight:600;text-transform:none;border-right:1px solid var(--tmu-border-soft)}
`;

export function injectTmTableCss(target = document.head) {
    if (!target) return;
    if (target === document.head) {
        if (document.getElementById(STYLE_ID)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID}`)) {
        return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = TMU_TABLE_CSS;
    target.appendChild(style);
}

injectTmTableCss();

let _tblCounter = 0;

/**
 * Reusable sortable data table that supports per-column render slots.
 *
 * @param {object}   opts
 * @param {Array}    opts.headers        — column definitions (see below)
 * @param {Array}    opts.items          — data rows (plain objects)
 * @param {object}  [opts.sortDefs]      — additional sort definitions keyed by sort key
 * @param {string}  [opts.sortKey]       — initial sort column key (default: first sortable column)
 * @param {number}  [opts.sortDir]       — 1 = asc, -1 = desc (default: -1)
 * @param {string}  [opts.density]       — 'tight' | 'compact' | 'cozy' (default: 'compact')
 * @param {string}  [opts.cls]           — extra CSS class on <table>
 * @param {string}  [opts.emptyText]     — shared empty-state copy rendered inside tbody when items are empty
 * @param {string}  [opts.emptyHtml]     — pre-rendered empty-state HTML rendered inside tbody when items are empty
 * @param {boolean|object} [opts.prependIndex] — prepend an index column; object supports { label, align, cls, thCls, width, render }
 * @param {Function}[opts.rowCls]        — (item, sortedIndex) => string
 * @param {Function}[opts.rowAttrs]      — (item, sortedIndex) => object of attributes for <tr>
 * @param {Function}[opts.onRowClick]    — (item, sortedIndex) => void
 * @param {Function}[opts.renderRowsHtml] — (sortedItems) => raw tbody HTML
 * @param {Function}[opts.afterRender]   — ({ wrap, table, sortedItems, sortKey, sortDir }) => void
 *
 * Header definition object:
 *   { key, label, align?, cls?, thCls?, width?, sortable?, sort?, render?, kind? }
 *   - key       {string}   field name in the item object
 *   - label     {string}   column header text
 *   - align     {string}   'l' | 'c' | 'r'  (applied to both th and td)
 *   - cls       {string}   extra class on every <td>
 *   - thCls     {string}   extra class on <th>
 *   - width     {string}   CSS width on <th> e.g. '80px'
 *   - sortable  {boolean}  default true
 *   - sort      {Function} custom comparator (a, b) => number (receives raw items)
 *   - render    {Function} (value, item) => HTML string  — the cell "slot"
 *   - kind      {string}   set to 'action' for trailing action columns
 *   - defaultSortDir {number} default direction when column becomes active (1 | -1)
 *                          omit to render value as plain text
 *
 * @returns {HTMLDivElement}  wrapper element with a .refresh({ items, sortKey, sortDir }) method
 */
export const TmTable = {
    table({ headers = [], items = [], groupHeaders = [], footer = [], sortDefs = {}, sortKey = null, sortDir = -1, density = 'cozy', cls = '', emptyText = '', emptyHtml = '', prependIndex = false, rowCls = null, rowAttrs = null, onRowClick = null, renderRowsHtml = null, afterRender = null } = {}) {
        const wrap = document.createElement('div');
        const id = 'tmu-tbl-' + (++_tblCounter);
        const tableDensityClass = density === 'tight' ? 'tmu-tbl-density-tight' : density === 'cozy' ? 'tmu-tbl-density-cozy' : 'tmu-tbl-density-compact';
        const indexCfg = prependIndex
            ? {
                label: '#',
                align: 'c',
                cls: '',
                thCls: '',
                width: '32px',
                render: null,
                ...(typeof prependIndex === 'object' ? prependIndex : {}),
            }
            : null;

        const getSortDef = (key) => {
            if (!key) return null;
            return headers.find(h => h.key === key) || sortDefs[key] || null;
        };

        let _items = items;
        let _footer = footer;
        let _sk = sortKey != null ? sortKey : (headers.find(h => h.sortable !== false) || {}).key || null;
        let _sd = sortDir;
        let _sortedItems = [];

        const attrText = (attrs = {}) => Object.entries(attrs)
            .filter(([, value]) => value !== undefined && value !== null && value !== false)
            .map(([key, value]) => value === true ? ` ${key}` : ` ${key}="${String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
            .join('');

        const isActionCol = (hdr) => !!hdr && (hdr.kind === 'action' || (!String(hdr.label ?? '').trim() && hdr.align === 'r' && hdr.sortable === false));

        function _render() {
            const sortHdr = getSortDef(_sk);
            const sorted = _items.slice().sort((a, b) => {
                if (!sortHdr) return 0;
                if (sortHdr.sort) return _sd * sortHdr.sort(a, b);
                const va = a[_sk], vb = b[_sk];
                if (typeof va === 'number' && typeof vb === 'number') return _sd * (va - vb);
                return _sd * String(va ?? '').localeCompare(String(vb ?? ''));
            });
            _sortedItems = sorted;

            const arrow = _sd > 0 ? ' ▲' : ' ▼';
            const emptyStateHtml = emptyHtml ? String(emptyHtml) : (emptyText ? TmState.empty(emptyText, true) : '');
            let h = `<table class="tmu-tbl ${tableDensityClass}${cls ? ' ' + cls : ''}" id="${id}"><thead>`;

            groupHeaders.forEach(row => {
                const rc = row.cls || '';
                h += `<tr${rc ? ` class="${rc}"` : ''}>`;
                (row.cells || []).forEach(cell => {
                    const canSort = !!cell.key;
                    const isActive = canSort && _sk === cell.key;
                    const cc = [cell.cls || '', canSort ? 'sortable' : '', isActive ? 'sort-active' : '', cell.kind === 'action' ? 'tmu-tbl-col-action' : ''].filter(Boolean).join(' ');
                    const label = `${cell.label ?? ''}${isActive ? arrow : ''}`;
                    h += `<th${cc ? ` class="${cc}"` : ''}${canSort ? ` data-sk="${cell.key}"` : ''}${cell.colspan ? ` colspan="${cell.colspan}"` : ''}${cell.rowspan ? ` rowspan="${cell.rowspan}"` : ''}${cell.title ? ` title="${cell.title}"` : ''}${cell.style ? ` style="${cell.style}"` : ''}${cell.attrs ? attrText(cell.attrs) : ''}>${label}</th>`;
                });
                h += '</tr>';
            });

            if (indexCfg || headers.length) {
                h += '<tr>';
                if (indexCfg) {
                    const align = indexCfg.align && indexCfg.align !== 'l' ? ' ' + indexCfg.align : '';
                    const thCls = [align, indexCfg.thCls || ''].filter(Boolean).join(' ');
                    h += `<th${thCls ? ` class="${thCls}"` : ''}${indexCfg.width ? ` style="width:${indexCfg.width}"` : ''}>${indexCfg.label}</th>`;
                }
                headers.forEach(hdr => {
                    const align = hdr.align && hdr.align !== 'l' ? ' ' + hdr.align : '';
                    const canSort = hdr.sortable !== false && !isActionCol(hdr);
                    const isActive = canSort && _sk === hdr.key;
                    const thCls = [canSort ? 'sortable' : '', isActive ? 'sort-active' : '', align, isActionCol(hdr) ? 'tmu-tbl-col-action' : '', hdr.thCls || ''].filter(Boolean).join(' ');
                    h += `<th${thCls ? ` class="${thCls}"` : ''}${canSort ? ` data-sk="${hdr.key}"` : ''}${hdr.width ? ` style="width:${hdr.width}"` : ''}${hdr.title ? ` title="${hdr.title}"` : ''}>`;
                    h += hdr.label + (isActive ? arrow : '') + '</th>';
                });
                h += '</tr>';
            }

            h += '</thead><tbody>';

            if (!sorted.length && emptyStateHtml) {
                const colCount = Math.max((indexCfg ? 1 : 0) + headers.length, 1);
                h += `<tr class="tmu-tbl-empty-row"><td colspan="${colCount}"><div class="tmu-tbl-empty-cell">${emptyStateHtml}</div></td></tr>`;
            } else if (typeof renderRowsHtml === 'function') {
                h += renderRowsHtml(sorted);
            } else {
                sorted.forEach((item, i) => {
                    const rc = rowCls ? rowCls(item, i) : '';
                    const ra = rowAttrs ? rowAttrs(item, i) : null;
                    h += `<tr${rc ? ` class="${rc}"` : ''}${onRowClick ? ` data-ri="${i}"` : ''}${ra ? attrText(ra) : ''}>`;
                    if (indexCfg) {
                        const align = indexCfg.align && indexCfg.align !== 'l' ? ' ' + indexCfg.align : '';
                        const tdCls = [align, indexCfg.cls || ''].filter(Boolean).join(' ');
                        const content = typeof indexCfg.render === 'function' ? indexCfg.render(item, i) : (i + 1);
                        h += `<td${tdCls ? ` class="${tdCls}"` : ''}>${content}</td>`;
                    }
                    headers.forEach(hdr => {
                        const val = item[hdr.key];
                        const align = hdr.align && hdr.align !== 'l' ? ' ' + hdr.align : '';
                        const tdCls = [align, isActionCol(hdr) ? 'tmu-tbl-col-action' : '', hdr.cls || ''].filter(Boolean).join(' ');
                        const content = hdr.render ? hdr.render(val, item, i) : (val == null ? '' : val);
                        h += `<td${tdCls ? ` class="${tdCls}"` : ''}>${content}</td>`;
                    });
                    h += '</tr>';
                });
            }

            h += '</tbody>';

            if (_footer.length) {
                h += '<tfoot>';
                _footer.forEach(fRow => {
                    const rc = fRow.cls || '';
                    h += `<tr${rc ? ` class="${rc}"` : ''}>`;
                    if (indexCfg) {
                        h += '<td></td>';
                    }
                    (fRow.cells || []).forEach((cell, ci) => {
                        const hdr = headers[ci];
                        const defaultAlign = hdr && hdr.align && hdr.align !== 'l' ? ' ' + hdr.align : '';
                        if (cell == null || typeof cell !== 'object') {
                            h += `<td${defaultAlign ? ` class="${defaultAlign}"` : ''}>${cell ?? ''}</td>`;
                        } else {
                            const tc = [defaultAlign, cell.cls || ''].filter(Boolean).join(' ');
                            h += `<td${tc ? ` class="${tc}"` : ''}>${cell.content ?? ''}</td>`;
                        }
                    });
                    h += '</tr>';
                });
                h += '</tfoot>';
            }

            h += '</table>';
            wrap.innerHTML = h;

            const tbl = wrap.firstElementChild;

            if (afterRender) {
                afterRender({ wrap, table: tbl, sortedItems: sorted, sortKey: _sk, sortDir: _sd });
            }
        }

        wrap.addEventListener('click', (event) => {
            const sortHeader = event.target.closest('thead th[data-sk]');
            if (sortHeader && wrap.contains(sortHeader)) {
                const key = sortHeader.dataset.sk;
                if (_sk === key) {
                    _sd *= -1;
                } else {
                    _sk = key;
                    const nextHdr = getSortDef(key);
                    _sd = Number(nextHdr?.defaultSortDir) || -1;
                }
                _render();
                return;
            }

            if (!onRowClick) return;
            const row = event.target.closest('tbody tr[data-ri]');
            if (!row || !wrap.contains(row)) return;
            const index = Number(row.dataset.ri);
            if (!Number.isFinite(index) || !_sortedItems[index]) return;
            onRowClick(_sortedItems[index], index);
        });

        _render();

        wrap.refresh = ({ items: newItems, sortKey: sk, sortDir: sd, footer: newFooter } = {}) => {
            if (newItems !== undefined) _items = newItems;
            if (sk !== undefined) _sk = sk;
            if (sd !== undefined) _sd = sd;
            if (newFooter !== undefined) _footer = newFooter;
            _render();
        };

        return wrap;
    },
};
