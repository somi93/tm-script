import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmPosition } from '../../lib/tm-position.js';

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
            .column1_d { display: none !important; }
            .main_center { padding-top: 6px !important; padding-bottom: 6px !important; }

            #tmsl-panel {
                background:#1c3410; border-radius:10px; padding:14px;
                margin:10px auto 16px; max-width:1200px;
                font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
                color:#c8e0b4; box-shadow:0 4px 24px rgba(0,0,0,.5);
                border:1px solid #2a4a1c;
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
            .tmsl-side-btn {
                padding:3px 8px; border-radius:0; font-size:11px; font-weight:700;
                border:1px solid rgba(61,104,40,.5); border-right-width:0;
                background:rgba(0,0,0,.15); color:#c8e0b4;
                cursor:pointer; transition:all .12s; user-select:none;
            }
            .tmsl-side-btn:hover { background:#2a4a1c; }
            .tmsl-side-btn.active { background:#3d6828; border-color:#6cc040; color:#fff; }
            .tmsl-btngrp { display:flex; align-items:center; }
            .tmsl-btngrp > * { border-radius:0; border-right-width:0; }
            .tmsl-btngrp > :first-child { border-radius:4px 0 0 4px; }
            .tmsl-btngrp > :last-child  { border-radius:0 4px 4px 0; border-right-width:1px; }
            .tmsl-fnum {
                width:54px; padding:4px 6px; border-radius:4px;
                background:rgba(0,0,0,.25); border:1px solid rgba(42,74,28,.6);
                color:#e8f5d8; font-size:11px; outline:none; font-family:inherit;
                -moz-appearance:textfield;
            }
            .tmsl-fnum:focus { border-color:#6cc040; }
            .tmsl-fnum::placeholder { color:#4a6a38; }
            .tmsl-fsep { width:1px; height:20px; background:#2a4a1c; }
            .tmsl-loadbtn {
                margin-left:auto; padding:5px 12px; border-radius:5px;
                border:1px solid #3d6828; background:rgba(61,104,40,.12);
                color:#6cc040; font-size:11px; font-weight:700; cursor:pointer;
                font-family:inherit; transition:background .15s; white-space:nowrap;
            }
            .tmsl-loadbtn:hover:not(:disabled) { background:rgba(61,104,40,.3); }
            .tmsl-loadbtn:disabled { opacity:.45; cursor:default; }

            /* ── pagination ── */
            .tmsl-pagination {
                display:flex; align-items:center; justify-content:center; gap:12px;
                padding:8px 0 2px; margin-top:4px;
            }
            .tmsl-page-btn {
                padding:4px 12px; border-radius:5px; border:1px solid #3d6828;
                background:rgba(61,104,40,.12); color:#6cc040; font-size:11px;
                font-weight:700; cursor:pointer; font-family:inherit;
                transition:background .15s;
            }
            .tmsl-page-btn:hover:not(:disabled) { background:rgba(61,104,40,.3); }
            .tmsl-page-btn:disabled { opacity:.35; cursor:default; }

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

            /* ── tabs ── */
            .tmsl-tabs {
                display:flex; align-items:center; gap:6px;
                margin-bottom:10px; border-bottom:2px solid #2a4a1c;
                padding-bottom:0;
            }
            .tmsl-tab {
                padding:6px 16px; border-radius:6px 6px 0 0;
                border:1px solid transparent; border-bottom:none;
                background:transparent; color:#6a9a58;
                font-size:12px; font-weight:700; cursor:pointer;
                font-family:inherit; transition:all .15s;
                position:relative; bottom:-2px;
            }
            .tmsl-tab:hover  { background:#1e3812; color:#90b878; border-color:rgba(42,74,28,.5); }
            .tmsl-tab.active { background:#243d18; color:#e0f0cc; border-color:#3d6828; border-bottom-color:#243d18; }
            .tmsl-tab.disabled, .tmsl-tab:disabled { opacity:.35; cursor:not-allowed; pointer-events:none; }
            .tmsl-tab-count  { font-weight:400; font-size:10px; color:#6a9a58; }
            .tmsl-tab.active .tmsl-tab-count { color:#8abc78; }
            .tmsl-reloadbtn {
                padding:3px 7px; border-radius:5px; border:1px solid #3d6828;
                background:#1c3410; color:#90b878; font-size:13px;
                cursor:pointer; font-family:inherit; transition:all .15s;
            }
            .tmsl-reloadbtn:hover { background:#243d18; color:#c8e0b4; }
        `;
        document.head.appendChild(s);
    }

    function buildTable(players, sortCol, sortDir) {
        const { POSITION_MAP, R5_THRESHOLDS, REC_THRESHOLDS, TI_THRESHOLDS, RTN_THRESHOLDS } = TmConst;
        const gc = TmUtils.getColor;

        let h = '<div class="tmsl-table-wrap"><table class="tmsl-table"><thead><tr>';
        h += '<th style="width:4px;padding:0"></th>';
        COLS.forEach(c => {
            const sorted = sortCol === c.key;
            const arrow = sorted ? (sortDir > 0 ? ' ▲' : ' ▼') : '';
            const cls = [c.align || '', sorted ? 'sorted' : ''].filter(Boolean).join(' ');
            h += `<th data-col="${c.key}"${cls ? ` class="${cls}"` : ''}>${c.lbl}${arrow}</th>`;
        });
        h += '</tr></thead><tbody>';

        players.forEach(p => {
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

            h += `<tr data-pid="${p.id}"${p.pending ? ' style="opacity:.65"' : ''}>`;
            h += `<td class="pos-bar" style="background:${posClr}"></td>`;
            h += `<td class="l">${flag}<a href="/players/${p.id}/" class="tmsl-link" target="_blank">${p.name}</a>${noteIcon}${pendingIcon}</td>`;
            h += `<td class="c">${TmPosition.chip(p.positions || [])}</td>`;
            h += `<td class="r" style="color:${gc(ageFloat, AGE_THRESHOLDS)}">${p.age}.${p.months || 0}</td>`;
            h += `<td class="r" style="color:#e0f0cc">${p.asi.toLocaleString()}</td>`;
            h += `<td class="r" style="color:${gc(p.r5, R5_THRESHOLDS)};font-weight:700">${p.r5}</td>`;
            h += `<td class="r" style="color:${gc(p.rec, REC_THRESHOLDS)};font-weight:700">${p.rec}</td>`;
            h += p.ti !== null
                ? `<td class="r" style="color:${gc(p.ti, TI_THRESHOLDS)}">${p.ti.toFixed(1)}</td>`
                : '<td class="r" style="color:#555">—</td>';
            h += `<td class="r" style="color:${gc(p.routine, RTN_THRESHOLDS)}">${p.routine.toFixed(1)}</td>`;
            h += `<td class="r">${timeHtml}</td>`;
            h += `<td class="r">${bidHtml}</td>`;
            h += '</tr>';
        });
        h += '</tbody></table></div>';
        return h;
    }

    function buildIndexedTable(players, sortCol, sortDir) {
        const { POSITION_MAP, R5_THRESHOLDS, REC_THRESHOLDS, TI_THRESHOLDS, RTN_THRESHOLDS } = TmConst;
        const gc = TmUtils.getColor;

        players.sort((a, b) => {
            if (sortCol === 'age') return sortDir * ((a.age * 12 + (a.months || 0)) - (b.age * 12 + (b.months || 0)));
            if (sortCol === 'name') return sortDir * String(a.name).localeCompare(String(b.name));
            if (sortCol === 'pos') return sortDir * (((a.positions || [])[0]?.ordering ?? 9) - ((b.positions || [])[0]?.ordering ?? 9));
            return sortDir * ((a[sortCol] || 0) - (b[sortCol] || 0));
        });

        let h = '<div class="tmsl-table-wrap"><table class="tmsl-table"><thead><tr>';
        h += '<th style="width:4px;padding:0"></th>';
        INDEXED_COLS.forEach(c => {
            const sorted = sortCol === c.key;
            const arrow = sorted ? (sortDir > 0 ? ' ▲' : ' ▼') : '';
            const cls = [c.align || '', sorted ? 'sorted' : ''].filter(Boolean).join(' ');
            h += `<th data-ixcol="${c.key}"${cls ? ` class="${cls}"` : ''}>${c.lbl}${arrow}</th>`;
        });
        h += '</tr></thead><tbody>';

        players.forEach(p => {
            const flag = TmUI.flag(p.country, 'tmsl-flag');
            const pos0 = (p.positions || [])[0];
            const posClr = pos0?.color ?? '#aaa';
            const seenDate = p.lastSeen ? new Date(p.lastSeen).toLocaleDateString() : '—';
            const staleClr = p.stale ? '#f87171' : '#6a9a58';

            h += `<tr data-ixpid="${p.id}">`;
            h += `<td class="pos-bar" style="background:${posClr}"></td>`;
            h += `<td class="l">${flag}<a href="/players/${p.id}/" class="tmsl-link" target="_blank">${p.name || `#${p.id}`}</a></td>`;
            h += `<td class="c">${TmPosition.chip(p.positions || [])}</td>`;
            h += `<td class="r" style="color:${gc(p.age + (p.months || 0) / 12, AGE_THRESHOLDS)}">${p.age}.${p.months || 0}</td>`;
            h += `<td class="r" style="color:#e0f0cc">${p.asi ? p.asi.toLocaleString() : '—'}</td>`;
            h += `<td class="r" style="color:${gc(p.r5, R5_THRESHOLDS)};font-weight:700">${p.r5 ? p.r5 : '—'}</td>`;
            h += `<td class="r" style="color:${gc(p.rec, REC_THRESHOLDS)};font-weight:700">${p.rec ? p.rec : '—'}</td>`;
            h += p.ti !== null
                ? `<td class="r" style="color:${gc(p.ti, TI_THRESHOLDS)}">${p.ti}</td>`
                : '<td class="r" style="color:#555">—</td>';
            h += `<td class="r" style="color:${gc(p.routine, RTN_THRESHOLDS)}">${p.routine.toFixed(1)}</td>`;
            h += `<td class="r" style="color:${staleClr};font-size:10px">${seenDate}</td>`;
            h += '</tr>';
        });
        h += '</tbody></table></div>';
        return h;
    }

    export const TmShortlistTable = { injectCSS, buildTable, buildIndexedTable, COLS, INDEXED_COLS };

