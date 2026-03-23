document.head.appendChild(Object.assign(document.createElement('style'), {
    textContent: `
/* ── Table ── */
.tmu-tbl{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px}
.tmu-tbl thead th{padding:6px 6px;font-size:10px;font-weight:700;color:#6a9a58;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid #2a4a1c;text-align:left;white-space:nowrap;transition:color .15s}
.tmu-tbl thead th.r{text-align:right} .tmu-tbl thead th.c{text-align:center}
.tmu-tbl thead th.sortable{cursor:pointer;user-select:none}
.tmu-tbl thead th.sortable:hover{color:#c8e0b4}
.tmu-tbl thead th.sort-active{color:#c8e0b4}
.tmu-tbl tbody td{padding:5px 6px;border-bottom:1px solid rgba(42,74,28,.4);color:#c8e0b4;font-variant-numeric:tabular-nums}
.tmu-tbl tbody td.r{text-align:right} .tmu-tbl tbody td.c{text-align:center}
.tmu-tbl tbody tr:hover{background:rgba(255,255,255,.03)}
.tmu-tbl a{color:#80e048;text-decoration:none;font-weight:600}
.tmu-tbl a:hover{color:#c8e0b4;text-decoration:underline}
.tmu-tbl-tot td{border-top:2px solid #3d6828;color:#e0f0cc;font-weight:800}
.tmu-tbl-avg td{color:#6a9a58;font-weight:600}
.tmu-tbl .tmu-grp-row th{background:rgba(42,74,28,.35);color:#6a9a58;font-size:9px;text-align:center;letter-spacing:.2px;border-bottom:1px solid #2a4a1c;padding:2px 4px;white-space:nowrap;font-weight:600;text-transform:none;border-right:1px solid #2a4a1c}
` }));

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
 * @param {string}  [opts.cls]           — extra CSS class on <table>
 * @param {boolean|object} [opts.prependIndex] — prepend an index column; object supports { label, align, cls, thCls, width, render }
 * @param {Function}[opts.rowCls]        — (item, sortedIndex) => string
 * @param {Function}[opts.rowAttrs]      — (item, sortedIndex) => object of attributes for <tr>
 * @param {Function}[opts.onRowClick]    — (item, sortedIndex) => void
 * @param {Function}[opts.renderRowsHtml] — (sortedItems) => raw tbody HTML
 * @param {Function}[opts.afterRender]   — ({ wrap, table, sortedItems, sortKey, sortDir }) => void
 *
 * Header definition object:
 *   { key, label, align?, cls?, thCls?, width?, sortable?, sort?, render? }
 *   - key       {string}   field name in the item object
 *   - label     {string}   column header text
 *   - align     {string}   'l' | 'c' | 'r'  (applied to both th and td)
 *   - cls       {string}   extra class on every <td>
 *   - thCls     {string}   extra class on <th>
 *   - width     {string}   CSS width on <th> e.g. '80px'
 *   - sortable  {boolean}  default true
 *   - sort      {Function} custom comparator (a, b) => number (receives raw items)
 *   - render    {Function} (value, item) => HTML string  — the cell "slot"
 *   - defaultSortDir {number} default direction when column becomes active (1 | -1)
 *                          omit to render value as plain text
 *
 * @returns {HTMLDivElement}  wrapper element with a .refresh({ items, sortKey, sortDir }) method
 */
export const TmTable = {
    table({ headers = [], items = [], groupHeaders = [], footer = [], sortDefs = {}, sortKey = null, sortDir = -1, cls = '', prependIndex = false, rowCls = null, rowAttrs = null, onRowClick = null, renderRowsHtml = null, afterRender = null } = {}) {
        const wrap = document.createElement('div');
        const id = 'tmu-tbl-' + (++_tblCounter);
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

        const attrText = (attrs = {}) => Object.entries(attrs)
            .filter(([, value]) => value !== undefined && value !== null && value !== false)
            .map(([key, value]) => value === true ? ` ${key}` : ` ${key}="${String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
            .join('');

        function _render() {
            const sortHdr = getSortDef(_sk);
            const sorted = _items.slice().sort((a, b) => {
                if (!sortHdr) return 0;
                if (sortHdr.sort) return _sd * sortHdr.sort(a, b);
                const va = a[_sk], vb = b[_sk];
                if (typeof va === 'number' && typeof vb === 'number') return _sd * (va - vb);
                return _sd * String(va ?? '').localeCompare(String(vb ?? ''));
            });

            const arrow = _sd > 0 ? ' ▲' : ' ▼';
            let h = `<table class="tmu-tbl${cls ? ' ' + cls : ''}" id="${id}"><thead>`;

            groupHeaders.forEach(row => {
                const rc = row.cls || '';
                h += `<tr${rc ? ` class="${rc}"` : ''}>`;
                (row.cells || []).forEach(cell => {
                    const canSort = !!cell.key;
                    const isActive = canSort && _sk === cell.key;
                    const cc = [cell.cls || '', canSort ? 'sortable' : '', isActive ? 'sort-active' : ''].filter(Boolean).join(' ');
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
                    const canSort = hdr.sortable !== false;
                    const isActive = canSort && _sk === hdr.key;
                    const thCls = [canSort ? 'sortable' : '', isActive ? 'sort-active' : '', align, hdr.thCls || ''].filter(Boolean).join(' ');
                    h += `<th${thCls ? ` class="${thCls}"` : ''}${canSort ? ` data-sk="${hdr.key}"` : ''}${hdr.width ? ` style="width:${hdr.width}"` : ''}${hdr.title ? ` title="${hdr.title}"` : ''}>`;
                    h += hdr.label + (isActive ? arrow : '') + '</th>';
                });
                h += '</tr>';
            }

            h += '</thead><tbody>';

            if (typeof renderRowsHtml === 'function') {
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
                        const tdCls = [align, hdr.cls || ''].filter(Boolean).join(' ');
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

            tbl.querySelectorAll('thead th[data-sk]').forEach(th => {
                th.addEventListener('click', () => {
                    const key = th.dataset.sk;
                    if (_sk === key) {
                        _sd *= -1;
                    } else {
                        _sk = key;
                        const nextHdr = getSortDef(key);
                        _sd = Number(nextHdr?.defaultSortDir) || -1;
                    }
                    _render();
                });
            });

            if (onRowClick) {
                tbl.querySelectorAll('tbody tr[data-ri]').forEach(tr => {
                    const i = +tr.dataset.ri;
                    tr.addEventListener('click', () => onRowClick(sorted[i], i));
                });
            }

                if (afterRender) {
                    afterRender({ wrap, table: tbl, sortedItems: sorted, sortKey: _sk, sortDir: _sd });
                }
        }

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
