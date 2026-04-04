import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmTable } from '../shared/tm-table.js';

const { AGE_THRESHOLDS } = TmConst;

    function injectCSS() {
        if (document.getElementById('tmsl-style')) return;
        const s = document.createElement('style');
        s.id = 'tmsl-style';
        s.textContent = `
            #tmsl-panel {
                color:var(--tmu-text-main);
            }
            #tmsl-panel * { box-sizing:border-box; }

            /* ── filter bar ── */
            #tmsl-filters {
                display:flex; flex-wrap:wrap; align-items:center; gap:var(--tmu-space-sm);
                padding:var(--tmu-space-sm) var(--tmu-space-md); background:var(--tmu-surface-card-soft); border-radius:var(--tmu-space-sm);
                border:1px solid var(--tmu-border-soft); margin-bottom:var(--tmu-space-md);
            }
            .tmsl-load-slot { margin-left:auto; }
            .tmsl-fgroup { display:flex; align-items:center; gap:var(--tmu-space-xs); }
            .tmsl-flbl { font-size:var(--tmu-font-xs); color:var(--tmu-text-faint); font-weight:700; text-transform:uppercase; letter-spacing:.4px; }
            .tmsl-pos-btn {
                padding:var(--tmu-space-xs) var(--tmu-space-sm); border-radius:0; font-size:var(--tmu-font-xs); font-weight:700;
                border:1px solid var(--tmu-border-faint); border-right-width:0;
                background:var(--tmu-surface-overlay);
                cursor:pointer; transition:all .12s; user-select:none;
            }
            .tmsl-pos-btn:hover { background:var(--tmu-surface-tab-hover); }
            .tmsl-pos-btn.active { background:var(--tmu-success-fill-hover); border-color:var(--tmu-success-fill-hover); color:#fff; }
            .tmsl-pos-btn.gk  { color:var(--tmu-success-strong); }
            .tmsl-pos-btn.de  { color:var(--tmu-info); }
            .tmsl-pos-btn.dm  { color:var(--tmu-warning); }
            .tmsl-pos-btn.mf  { color:var(--tmu-warning); }
            .tmsl-pos-btn.om  { color:var(--tmu-warning-soft); }
            .tmsl-pos-btn.fw  { color:var(--tmu-danger); }
            .tmsl-side-btn {
                padding:var(--tmu-space-xs) var(--tmu-space-sm); border-radius:0; font-size:var(--tmu-font-xs); font-weight:700;
                border:1px solid var(--tmu-border-faint); border-right-width:0;
                background:var(--tmu-surface-overlay); color:var(--tmu-text-dim);
                cursor:pointer; transition:all .12s; user-select:none;
            }
            .tmsl-side-btn:hover { background:var(--tmu-surface-tab-hover); }
            .tmsl-side-btn.active { background:var(--tmu-success-fill-hover); border-color:var(--tmu-success-fill-hover); color:#fff; }
            .tmsl-btngrp { display:flex; align-items:center; }
            .tmsl-btngrp > * { border-radius:0; border-right-width:0; }
            .tmsl-btngrp > :first-child { border-radius:var(--tmu-space-xs) 0 0 var(--tmu-space-xs); }
            .tmsl-btngrp > :last-child  { border-radius:0 var(--tmu-space-xs) var(--tmu-space-xs) 0; border-right-width:1px; }
            .tmsl-fsep { width:1px; height:20px; background:var(--tmu-border-soft); }
            #tmsl-panel > div > div:last-child > .tmu-btn {
                margin-left:auto;
                white-space:nowrap;
            }

            /* ── pagination ── */
            .tmsl-pagination {
                display:flex; align-items:center; justify-content:center; gap:var(--tmu-space-md);
                padding:var(--tmu-space-sm) 0 0; margin-top:var(--tmu-space-xs);
            }
            .tmsl-pagination .tmu-btn {
                white-space:nowrap;
            }

            /* ── table ── */
            .tmsl-table-wrap { overflow-x:auto; }
            .tmsl-table-wrap::-webkit-scrollbar { height:4px; }
            .tmsl-table-wrap::-webkit-scrollbar-thumb { background:var(--tmu-border-embedded); border-radius:var(--tmu-space-xs); }
            .tmsl-pb-inner { display:block; width:3px; min-height:16px; border-radius:var(--tmu-space-xs); }
            .tmsl-table-wrap .tmu-tbl thead th.tmsl-pb,
            .tmsl-table-wrap .tmu-tbl tbody td.tmsl-pb { width:4px; padding:0; }

            .tmsl-link { color:#fff; text-decoration:none; font-weight:500; }
            .tmsl-link:hover { color:var(--tmu-text-accent-soft) !important; text-decoration:underline; }
            .tmsl-flag { margin-right:var(--tmu-space-xs); vertical-align:middle; }


            .tmsl-time { color:var(--tmu-text-main); }
            .tmsl-time-exp { color:var(--tmu-danger); }
            .tmsl-bid { color:var(--tmu-text-strong); }
            .tmsl-asi { color:var(--tmu-text-strong); }
            .tmsl-muted { color:var(--tmu-text-dim); }
            .tmsl-strong { font-weight:700; }
            .tmsl-pending-icon { opacity:.5; font-size:var(--tmu-font-xs); }
            .tmsl-lastseen { font-size:var(--tmu-font-xs); }
            .tmsl-lastseen-stale { color:var(--tmu-danger); }
            .tmsl-lastseen-fresh { color:var(--tmu-text-faint); }
            .tmsl-row-pending { opacity:.65; }

            .tmsl-note-icon {
                display:inline-block; margin-left:var(--tmu-space-xs); font-size:var(--tmu-font-xs);
                cursor:default; opacity:.75; vertical-align:middle; position:relative;
            }
            .tmsl-note-icon:hover { opacity:1; }
            .tmsl-note-icon::after {
                content:attr(data-note); display:none; position:absolute;
                left:50%; transform:translateX(-50%); top:calc(100% + var(--tmu-space-xs));
                background:var(--tmu-surface-panel); border:1px solid var(--tmu-border-success); border-radius:var(--tmu-space-xs);
                padding:var(--tmu-space-xs) var(--tmu-space-sm); font-size:var(--tmu-font-xs); color:var(--tmu-text-main); white-space:pre-wrap;
                max-width:260px; min-width:100px; word-break:break-word;
                z-index:100002; box-shadow:0 4px 14px var(--tmu-shadow-panel); pointer-events:none;
            }
            .tmsl-note-icon:hover::after { display:block; }

        `;
        document.head.appendChild(s);
    }

    function posBarHeader() {
        return {
            key: '_bar', label: '', sortable: false, cls: 'tmsl-pb', thCls: 'tmsl-pb',
            render: (_, p) => `<span class="tmsl-pb-inner" style="background:${(p.positions || [])[0]?.color ?? 'var(--tmu-text-dim)'}"></span>`,
        };
    }

    function mainHeaders() {
        const gc = TmUtils.getColor;
        const { R5_THRESHOLDS, REC_THRESHOLDS, TI_THRESHOLDS, RTN_THRESHOLDS } = TmConst;
        return [
            posBarHeader(),
            {
                key: 'name', label: 'Player',
                sort: (a, b) => String(a.name).localeCompare(String(b.name)),
                render: (_, p) => {
                    const flag = TmUI.flag(p.country, 'tmsl-flag');
                    const noteIcon = p.txt ? `<span class="tmsl-note-icon" data-note="${p.txt.replace(/"/g, '&quot;')}">📋</span>` : '';
                    const pendingIcon = p.pending ? ' <span class="tmsl-pending-icon">⏳</span>' : '';
                    return `${flag}<a href="/players/${p.id}/" class="tmsl-link" target="_blank">${p.name}</a>${noteIcon}${pendingIcon}`;
                },
            },
            {
                key: 'pos', label: 'Pos', align: 'c',
                sort: (a, b) => {
                    const aPos = (a.positions || [])[0]?.ordering ?? 9;
                    const aAlt = (a.positions || []).length > 1 ? ((a.positions[1]?.ordering) ?? 9) : 0;
                    const bPos = (b.positions || [])[0]?.ordering ?? 9;
                    const bAlt = (b.positions || []).length > 1 ? ((b.positions[1]?.ordering) ?? 9) : 0;
                    return (aPos * 100 + ((a.positions || []).length > 1 ? 50 + aAlt : 0)) - (bPos * 100 + ((b.positions || []).length > 1 ? 50 + bAlt : 0));
                },
                render: (_, p) => TmPosition.chip(p.positions || []),
            },
            {
                key: 'age', label: 'Age', align: 'r',
                sort: (a, b) => (a.age * 12 + (a.months || 0)) - (b.age * 12 + (b.months || 0)),
                render: (_, p) => `<span class="tmu-tabular" style="color:${gc(p.age + (p.months || 0) / 12, AGE_THRESHOLDS)}">${p.age}.${p.months || 0}</span>`,
            },
            { key: 'asi', label: 'ASI', align: 'r', render: (_, p) => `<span class="tmu-tabular" style="color:var(--tmu-text-strong)">${p.asi.toLocaleString()}</span>` },
            { key: 'r5',  label: 'R5',  align: 'r', render: (_, p) => `<span class="tmu-tabular" style="color:${gc(p.r5, R5_THRESHOLDS)};font-weight:700">${p.r5}</span>` },
            { key: 'rec', label: 'REC', align: 'r', render: (_, p) => `<span class="tmu-tabular" style="color:${gc(p.rec, REC_THRESHOLDS)};font-weight:700">${p.rec}</span>` },
            { key: 'ti',  label: 'TI',  align: 'r', sort: (a, b) => (a.ti ?? -Infinity) - (b.ti ?? -Infinity), render: (_, p) => p.ti !== null ? `<span class="tmu-tabular" style="color:${gc(p.ti, TI_THRESHOLDS)}">${p.ti.toFixed(1)}</span>` : '<span style="color:var(--tmu-text-dim)">—</span>' },
            { key: 'routine', label: 'Rtn', align: 'r', render: (_, p) => `<span class="tmu-tabular" style="color:${gc(p.routine, RTN_THRESHOLDS)}">${p.routine.toFixed(1)}</span>` },
            {
                key: 'timeleft', label: 'Time', align: 'r',
                sort: (a, b) => (a.timeleft > 0 ? a.timeleft : 999999999) - (b.timeleft > 0 ? b.timeleft : 999999999),
                render: (_, p) => p.timeleft > 0
                    ? `<span class="tmsl-time tmu-tabular${p.timeleft < 3600 ? ' tmsl-time-exp' : ''}">${p.timeleft_string || ''}</span>`
                    : '<span style="color:var(--tmu-text-dim)">—</span>',
            },
            { key: 'curbid', label: 'Cur Bid', align: 'r', render: (_, p) => p.curbid ? `<span class="tmu-tabular" style="color:var(--tmu-text-strong)">${p.curbid}</span>` : '<span style="color:var(--tmu-text-dim)">—</span>' },
        ];
    }

    function indexedHeaders() {
        const gc = TmUtils.getColor;
        const { R5_THRESHOLDS, REC_THRESHOLDS, TI_THRESHOLDS, RTN_THRESHOLDS } = TmConst;
        return [
            posBarHeader(),
            {
                key: 'name', label: 'Player',
                sort: (a, b) => String(a.name).localeCompare(String(b.name)),
                render: (_, p) => {
                    const flag = TmUI.flag(p.country, 'tmsl-flag');
                    return `${flag}<a href="/players/${p.id}/" class="tmsl-link" target="_blank">${p.name || `#${p.id}`}</a>`;
                },
            },
            {
                key: 'pos', label: 'Pos', align: 'c',
                sort: (a, b) => ((a.positions || [])[0]?.ordering ?? 9) - ((b.positions || [])[0]?.ordering ?? 9),
                render: (_, p) => TmPosition.chip(p.positions || []),
            },
            {
                key: 'age', label: 'Age', align: 'r',
                sort: (a, b) => (a.age * 12 + (a.months || 0)) - (b.age * 12 + (b.months || 0)),
                render: (_, p) => `<span class="tmu-tabular" style="color:${gc(p.age + (p.months || 0) / 12, AGE_THRESHOLDS)}">${p.age}.${p.months || 0}</span>`,
            },
            { key: 'asi', label: 'ASI', align: 'r', render: (_, p) => `<span class="tmu-tabular" style="color:var(--tmu-text-strong)">${p.asi ? p.asi.toLocaleString() : '—'}</span>` },
            { key: 'r5',  label: 'R5',  align: 'r', render: (_, p) => `<span class="tmu-tabular" style="color:${gc(p.r5, R5_THRESHOLDS)};font-weight:700">${p.r5 || '—'}</span>` },
            { key: 'rec', label: 'REC', align: 'r', render: (_, p) => `<span class="tmu-tabular" style="color:${gc(p.rec, REC_THRESHOLDS)};font-weight:700">${p.rec || '—'}</span>` },
            { key: 'ti',  label: 'Last TI', align: 'r', sort: (a, b) => (a.ti ?? -Infinity) - (b.ti ?? -Infinity), render: (_, p) => p.ti !== null ? `<span class="tmu-tabular" style="color:${gc(p.ti, TI_THRESHOLDS)}">${p.ti}</span>` : '<span style="color:var(--tmu-text-dim)">—</span>' },
            { key: 'routine', label: 'Rtn', align: 'r', render: (_, p) => `<span class="tmu-tabular" style="color:${gc(p.routine, RTN_THRESHOLDS)}">${p.routine.toFixed(1)}</span>` },
            {
                key: 'lastSeen', label: 'Last Seen', align: 'r',
                render: (_, p) => {
                    const seenDate = p.lastSeen ? new Date(p.lastSeen).toLocaleDateString() : '—';
                    const staleCls = p.stale ? 'tmsl-lastseen-stale' : 'tmsl-lastseen-fresh';
                    return `<span class="tmsl-lastseen tmu-tabular ${staleCls}">${seenDate}</span>`;
                },
            },
        ];
    }

    function wireSortCallback(wrap, onSort) {
        if (!onSort || wrap.dataset.tmslSortBound === '1') return;
        wrap.dataset.tmslSortBound = '1';
        wrap.addEventListener('click', (event) => {
            const header = event.target.closest('thead th[data-sk]');
            if (!header || !wrap.contains(header)) return;
            event.stopImmediatePropagation();
            onSort(header.dataset.sk);
        }, true);
    }

    function createTableElement(players, sortCol, sortDir, onSort) {
        const wrap = TmTable.table({
            headers: mainHeaders(),
            items: players,
            sortKey: sortCol,
            sortDir,
            density: 'cozy',
            rowAttrs: (player) => ({
                'data-pid': player.id,
                class: player.pending ? 'tmsl-row-pending' : null,
            }),
        });
        wrap.classList.add('tmsl-table-wrap');
        wireSortCallback(wrap, onSort);
        return wrap;
    }

    function createIndexedTableElement(players, sortCol, sortDir, onSort) {
        const wrap = TmTable.table({
            headers: indexedHeaders(),
            items: players,
            sortKey: sortCol,
            sortDir,
            density: 'cozy',
            rowAttrs: (player) => ({ 'data-ixpid': player.id }),
        });
        wrap.classList.add('tmsl-table-wrap');
        wireSortCallback(wrap, onSort);
        return wrap;
    }

    export const TmShortlistTable = { injectCSS, createTableElement, createIndexedTableElement };

