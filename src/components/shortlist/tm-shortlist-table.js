import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmTable } from '../shared/tm-table.js';

const { AGE_THRESHOLDS } = TmConst;

    const COLS = [
        { key: 'name', lbl: 'Player' },
        { key: 'pos', lbl: 'Pos', align: 'c' },
        { key: 'age', lbl: 'Age', align: 'r' },
        { key: 'asi', lbl: 'ASI', align: 'r' },
        { key: 'r5', lbl: 'R5', align: 'r' },
        { key: 'rec', lbl: 'REC', align: 'r' },
        { key: 'ti', lbl: 'TI', align: 'r' },
        { key: 'routine', lbl: 'Rtn', align: 'r' },
        { key: 'timeleft', lbl: 'Time', align: 'r' },
        { key: 'curbid', lbl: 'Cur Bid', align: 'r' },
    ];

    const INDEXED_COLS = [
        { key: 'name', lbl: 'Player' },
        { key: 'pos', lbl: 'Pos', align: 'c' },
        { key: 'age', lbl: 'Age', align: 'r' },
        { key: 'asi', lbl: 'ASI', align: 'r' },
        { key: 'r5', lbl: 'R5', align: 'r' },
        { key: 'rec', lbl: 'REC', align: 'r' },
        { key: 'ti', lbl: 'Last TI', align: 'r' },
        { key: 'routine', lbl: 'Rtn', align: 'r' },
        { key: 'lastSeen', lbl: 'Last Seen', align: 'r' },
    ];

    function injectCSS() {
        if (document.getElementById('tmsl-style')) return;
        const s = document.createElement('style');
        s.id = 'tmsl-style';
        s.textContent = `
            #tmsl-panel {
                color:#c8e0b4;
            }
            #tmsl-panel * { box-sizing:border-box; }

            /* ── header ── */
            .tmsl-header {
                display:flex; align-items:center; justify-content:space-between;
                margin-bottom:10px;
            }
            .tmsl-title { font-size:15px; font-weight:700; color:#fff; display:flex; align-items:center; gap:6px; }

            /* ── filter bar ── */
            #tmsl-filters {
                display:flex; flex-wrap:wrap; align-items:center; gap:8px;
                padding:8px 10px; background:#162e0e; border-radius:8px;
                border:1px solid #2a4a1c; margin-bottom:10px;
            }
            .tmsl-fgroup { display:flex; align-items:center; gap:4px; }
            .tmsl-flbl { font-size:10px; color:#6a9a58; font-weight:700; text-transform:uppercase; letter-spacing:.4px; }
            .tmsl-pos-btn {
                padding:3px 8px; border-radius:0; font-size:11px; font-weight:700;
                border:1px solid rgba(61,104,40,.5); border-right-width:0;
                background:rgba(0,0,0,.15);
                cursor:pointer; transition:all .12s; user-select:none;
            }
            .tmsl-pos-btn:hover { background:#2a4a1c; }
            .tmsl-pos-btn.active { background:#3d6828; border-color:#6cc040; }
            .tmsl-pos-btn.gk  { color:#4ade80; }
            .tmsl-pos-btn.de  { color:#60a5fa; }
            .tmsl-pos-btn.dm  { color:#fbbf24; }
            .tmsl-pos-btn.mf  { color:#fbbf24; }
            .tmsl-pos-btn.om  { color:#fb923c; }
            .tmsl-pos-btn.fw  { color:#f87171; }
            .tmsl-side-btn:hover { background:#2a4a1c; }
            .tmsl-side-btn.active { background:#3d6828; border-color:#6cc040; color:#fff; }
            .tmsl-btngrp { display:flex; align-items:center; }
            .tmsl-btngrp > * { border-radius:0; border-right-width:0; }
            .tmsl-btngrp > :first-child { border-radius:4px 0 0 4px; }
            .tmsl-btngrp > :last-child  { border-radius:0 4px 4px 0; border-right-width:1px; }
            .tmsl-fsep { width:1px; height:20px; background:#2a4a1c; }
            #tmsl-panel > div > div:last-child > .tmu-btn {
                margin-left:auto;
                white-space:nowrap;
            }

            /* ── pagination ── */
            .tmsl-pagination {
                display:flex; align-items:center; justify-content:center; gap:12px;
                padding:8px 0 2px; margin-top:4px;
            }
            .tmsl-pagination .tmu-btn {
                white-space:nowrap;
            }

            /* ── table ── */
            .tmsl-table-wrap { overflow-x:auto; border-radius:8px; border:1px solid #2a4a1c; }
            .tmsl-table-wrap::-webkit-scrollbar { height:4px; }
            .tmsl-table-wrap::-webkit-scrollbar-thumb { background:#3d6828; border-radius:2px; }
            .tmsl-table { width:100%; border-collapse:collapse; font-size:12px; }
            .tmsl-table thead th {
                background:#162e0e; color:#6a9a58; padding:6px 7px;
                text-align:left; font-size:10px; font-weight:700;
                text-transform:uppercase; letter-spacing:.4px;
                border-bottom:1px solid #2a4a1c; cursor:pointer;
                user-select:none; white-space:nowrap;
                position:sticky; top:0; z-index:2;
            }
            .tmsl-table thead th:hover  { color:#c8e0b4; background:#243d18; }
            .tmsl-table thead th.sorted { color:#6cc040; }
            .tmsl-table tbody tr {
                border-bottom:1px solid rgba(42,74,28,.4);
                transition:background .12s;
            }
            .tmsl-table tbody tr:nth-child(odd)  { background:#1c3410; }
            .tmsl-table tbody tr:nth-child(even) { background:#162e0e; }
            .tmsl-table tbody tr:hover { background:#243d18 !important; }
            .tmsl-table td { padding:4px 7px; white-space:nowrap; vertical-align:middle; }
            .tmsl-table td.l, .tmsl-table th.l { text-align:left; }
            .tmsl-table td.r, .tmsl-table th.r { text-align:right; }
            .tmsl-table td.c, .tmsl-table th.c { text-align:center; }
            .tmsl-table .pos-bar { width:3px; padding:0; border-radius:2px; }
            .tmsl-table th.pos-bar-h { width:4px; padding:0; }

            .tmsl-link { color:#90b878; text-decoration:none; font-weight:500; }
            .tmsl-link:hover { color:#c8e0b4; text-decoration:underline; }
            .tmsl-flag { margin-right:4px; vertical-align:middle; }


            .tmsl-time { font-variant-numeric:tabular-nums; color:#a0c888; }
            .tmsl-time-exp { color:#f87171; }
            .tmsl-bid { font-variant-numeric:tabular-nums; color:#e0f0cc; }

            .tmsl-note-icon {
                display:inline-block; margin-left:5px; font-size:11px;
                cursor:default; opacity:.75; vertical-align:middle; position:relative;
            }
            .tmsl-note-icon:hover { opacity:1; }
            .tmsl-note-icon::after {
                content:attr(data-note); display:none; position:absolute;
                left:50%; transform:translateX(-50%); top:calc(100% + 5px);
                background:#1a2e14; border:1px solid #4a9030; border-radius:5px;
                padding:5px 8px; font-size:11px; color:#c8e0b4; white-space:pre-wrap;
                max-width:260px; min-width:100px; word-break:break-word;
                z-index:100002; box-shadow:0 4px 14px rgba(0,0,0,.6); pointer-events:none;
            }
            .tmsl-note-icon:hover::after { display:block; }

        `;
        document.head.appendChild(s);
    }

    function createSortInterceptor(tableWrap, onSort) {
        if (typeof onSort !== 'function') return;
        tableWrap.querySelectorAll('th[data-sk]').forEach(th => {
            th.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();
                onSort(th.dataset.sk);
            }, true);
        });
    }

    function buildMainHeaders() {
        return [
            {
                key: '__posbar',
                label: '',
                sortable: false,
                cls: 'pos-bar',
                thCls: 'pos-bar-h',
                width: '4px',
                render: (_value, player) => '',
            },
            ...COLS.map(col => ({
                key: col.key,
                label: col.lbl,
                align: col.align,
                sort: col.key === 'age'
                    ? (a, b) => (a.age * 12 + (a.months || 0)) - (b.age * 12 + (b.months || 0))
                    : col.key === 'name'
                        ? (a, b) => String(a.name).localeCompare(String(b.name))
                        : col.key === 'pos'
                            ? (a, b) => {
                                const aPos = (a.positions || [])[0]?.ordering ?? 9;
                                const aAlt = (a.positions || []).length > 1 ? (((a.positions || [])[1]?.ordering) ?? 9) : 0;
                                const bPos = (b.positions || [])[0]?.ordering ?? 9;
                                const bAlt = (b.positions || []).length > 1 ? (((b.positions || [])[1]?.ordering) ?? 9) : 0;
                                return (aPos * 100 + ((a.positions || []).length > 1 ? 50 + aAlt : 0)) - (bPos * 100 + ((b.positions || []).length > 1 ? 50 + bAlt : 0));
                            }
                            : col.key === 'timeleft'
                                ? (a, b) => (a.timeleft > 0 ? a.timeleft : 999999999) - (b.timeleft > 0 ? b.timeleft : 999999999)
                                : undefined,
                render: columnRenderer(col.key),
            })),
        ];
    }

    function buildIndexedHeaders() {
        return [
            {
                key: '__posbar',
                label: '',
                sortable: false,
                cls: 'pos-bar',
                thCls: 'pos-bar-h',
                width: '4px',
                render: () => '',
            },
            ...INDEXED_COLS.map(col => ({
                key: col.key,
                label: col.lbl,
                align: col.align,
                sort: col.key === 'age'
                    ? (a, b) => (a.age * 12 + (a.months || 0)) - (b.age * 12 + (b.months || 0))
                    : col.key === 'name'
                        ? (a, b) => String(a.name).localeCompare(String(b.name))
                        : col.key === 'pos'
                            ? (a, b) => (((a.positions || [])[0]?.ordering ?? 9) - (((b.positions || [])[0]?.ordering ?? 9)))
                            : undefined,
                render: indexedColumnRenderer(col.key),
            })),
        ];
    }

    function columnRenderer(key) {
        const { POSITION_MAP, R5_THRESHOLDS, REC_THRESHOLDS, TI_THRESHOLDS, RTN_THRESHOLDS } = TmConst;
        const gc = TmUtils.getColor;

        return (_value, p) => {
            const flag = TmUI.flag(p.country, 'tmsl-flag');
            const pos0 = (p.positions || [])[0];
            const posClr = pos0?.color ?? '#aaa';
            const noteIcon = p.txt ? `<span class="tmsl-note-icon" data-note="${p.txt.replace(/"/g, '&quot;')}">📋</span>` : '';
            const pendingIcon = p.pending ? ' <span style="opacity:.5;font-size:10px">⏳</span>' : '';
            const timeHtml = p.timeleft > 0
                ? `<span class="tmsl-time${p.timeleft < 3600 ? ' tmsl-time-exp' : ''}">${p.timeleft_string || ''}</span>`
                : '<span style="color:#4a5a40">—</span>';
            const bidHtml = p.curbid
                ? `<span class="tmsl-bid">${p.curbid}</span>`
                : '<span style="color:#4a5a40">—</span>';
            const ageFloat = p.age + (p.months || 0) / 12;

            if (key === '__posbar') return `<span style="display:block;width:100%;height:100%;background:${posClr}"></span>`;
            if (key === 'name') return `${flag}<a href="/players/${p.id}/" class="tmsl-link" target="_blank">${p.name}</a>${noteIcon}${pendingIcon}`;
            if (key === 'pos') return TmPosition.chip(p.positions || []);
            if (key === 'age') return `<span style="color:${gc(ageFloat, AGE_THRESHOLDS)}">${p.age}.${p.months || 0}</span>`;
            if (key === 'asi') return `<span style="color:#e0f0cc">${p.asi.toLocaleString()}</span>`;
            if (key === 'r5') return `<span style="color:${gc(p.r5, R5_THRESHOLDS)};font-weight:700">${p.r5}</span>`;
            if (key === 'rec') return `<span style="color:${gc(p.rec, REC_THRESHOLDS)};font-weight:700">${p.rec}</span>`;
            if (key === 'ti') {
                return p.ti !== null
                    ? `<span style="color:${gc(p.ti, TI_THRESHOLDS)}">${p.ti.toFixed(1)}</span>`
                    : '<span style="color:#555">—</span>';
            }
            if (key === 'routine') return `<span style="color:${gc(p.routine, RTN_THRESHOLDS)}">${p.routine.toFixed(1)}</span>`;
            if (key === 'timeleft') return timeHtml;
            if (key === 'curbid') return bidHtml;
            return p[key] ?? '';
        };
    }

    function createTableElement(players, sortCol, sortDir, onSort) {
        const wrap = TmTable.table({
            headers: buildMainHeaders(),
            items: players,
            sortKey: sortCol,
            sortDir,
            cls: 'tmsl-table',
            rowAttrs: (player) => ({
                'data-pid': player.id,
                style: player.pending ? 'opacity:.65' : null,
            }),
            afterRender: ({ wrap: tableWrap }) => createSortInterceptor(tableWrap, onSort),
        });
        wrap.classList.add('tmsl-table-wrap');
        return wrap;
    }

    function indexedColumnRenderer(key) {
        const { POSITION_MAP, R5_THRESHOLDS, REC_THRESHOLDS, TI_THRESHOLDS, RTN_THRESHOLDS } = TmConst;
        const gc = TmUtils.getColor;

        return (_value, p) => {
            const flag = TmUI.flag(p.country, 'tmsl-flag');
            const pos0 = (p.positions || [])[0];
            const posClr = pos0?.color ?? '#aaa';
            const seenDate = p.lastSeen ? new Date(p.lastSeen).toLocaleDateString() : '—';
            const staleClr = p.stale ? '#f87171' : '#6a9a58';

            if (key === '__posbar') return `<span style="display:block;width:100%;height:100%;background:${posClr}"></span>`;
            if (key === 'name') return `${flag}<a href="/players/${p.id}/" class="tmsl-link" target="_blank">${p.name || `#${p.id}`}</a>`;
            if (key === 'pos') return TmPosition.chip(p.positions || []);
            if (key === 'age') return `<span style="color:${gc(p.age + (p.months || 0) / 12, AGE_THRESHOLDS)}">${p.age}.${p.months || 0}</span>`;
            if (key === 'asi') return `<span style="color:#e0f0cc">${p.asi ? p.asi.toLocaleString() : '—'}</span>`;
            if (key === 'r5') return `<span style="color:${gc(p.r5, R5_THRESHOLDS)};font-weight:700">${p.r5 ? p.r5 : '—'}</span>`;
            if (key === 'rec') return `<span style="color:${gc(p.rec, REC_THRESHOLDS)};font-weight:700">${p.rec ? p.rec : '—'}</span>`;
            if (key === 'ti') {
                return p.ti !== null
                    ? `<span style="color:${gc(p.ti, TI_THRESHOLDS)}">${p.ti}</span>`
                    : '<span style="color:#555">—</span>';
            }
            if (key === 'routine') return `<span style="color:${gc(p.routine, RTN_THRESHOLDS)}">${p.routine.toFixed(1)}</span>`;
            if (key === 'lastSeen') return `<span style="color:${staleClr};font-size:10px">${seenDate}</span>`;
            return p[key] ?? '';
        };
    }

    function createIndexedTableElement(players, sortCol, sortDir, onSort) {
        const wrap = TmTable.table({
            headers: buildIndexedHeaders(),
            items: players,
            sortKey: sortCol,
            sortDir,
            cls: 'tmsl-table',
            rowAttrs: (player) => ({ 'data-ixpid': player.id }),
            afterRender: ({ wrap: tableWrap }) => createSortInterceptor(tableWrap, onSort),
        });
        wrap.classList.add('tmsl-table-wrap');
        return wrap;
    }

    function buildTable(players, sortCol, sortDir) {
        return createTableElement(players, sortCol, sortDir).outerHTML;
    }

    function buildIndexedTable(players, sortCol, sortDir) {
        return createIndexedTableElement(players, sortCol, sortDir).outerHTML;
    }

    export const TmShortlistTable = { injectCSS, buildTable, buildIndexedTable, createTableElement, createIndexedTableElement, COLS, INDEXED_COLS };

