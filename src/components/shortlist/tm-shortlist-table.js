import { TmPlayersTable } from '../shared/tm-players-table.js';

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

    function createTableElement(players, sortCol, sortDir, onSort) {
        const tmp = document.createElement('div');
        TmPlayersTable.mount(tmp, players, {
            sortKey: sortCol, sortDir,
            nameDecorator: p => {
                const noteIcon = p.txt ? `<span class="tmsl-note-icon" data-note="${p.txt.replace(/"/g, '&quot;')}">📋</span>` : '';
                const pendingIcon = p.pending ? ' <span class="tmsl-pending-icon">⏳</span>' : '';
                return noteIcon + pendingIcon;
            },
            rowCls: p => p.pending ? 'tmsl-row-pending' : null,
            rowAttrs: p => ({ 'data-pid': p.id }),
            onRowClick: null,
            onSort,
        });
        return tmp.firstChild;
    }

    function createIndexedTableElement(players, sortCol, sortDir, onSort) {
        const tmp = document.createElement('div');
        TmPlayersTable.mount(tmp, players, {
            columns: { timeleft: false, curbid: false, lastSeen: true, tiLabel: 'Last TI' },
            sortKey: sortCol, sortDir,
            rowAttrs: p => ({ 'data-ixpid': p.id }),
            onRowClick: null,
            onSort,
        });
        return tmp.firstChild;
    }

    export const TmShortlistTable = { injectCSS, createTableElement, createIndexedTableElement };

