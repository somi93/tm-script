import { TmTable, injectTmTableCss } from './tm-table.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmConst } from '../../lib/tm-constants.js';
import { TmBidsDialog } from '../bids/tm-bids-dialog.js';

'use strict';

export function injectPlayersTableCSS() {
    if (document.getElementById('tmpt-style')) return;
    const s = document.createElement('style');
    s.id = 'tmpt-style';
    s.textContent = `
        .tmpt-wrap { overflow-x: auto; }
        .tmpt-wrap::-webkit-scrollbar { height: 4px; }
        .tmpt-wrap::-webkit-scrollbar-thumb { background: var(--tmu-border-embedded); border-radius: 2px; }
        .tmpt-pb-cell { width: 4px !important; padding: 0 !important; }
        .tmpt-pb-inner { display: block; width: 3px; min-height: 16px; border-radius: 2px; }
        .tmpt-link { color: var(--tmu-text-inverse); text-decoration: none; font-weight: 500; }
        .tmpt-link:hover { color: var(--tmu-text-accent-soft) !important; text-decoration: underline; }
        .tmpt-flag { margin-right: var(--tmu-space-xs); vertical-align: middle; }
        .tmpt-row-clickable { cursor: pointer; }
        .tmpt-row-clickable:hover td { background: var(--tmu-surface-tab-hover) !important; }
        .tmpt-time-exp { color: var(--tmu-danger) !important; }
    `;
    document.head.appendChild(s);
}

function posBarCol() {
    return {
        key: '_bar', label: '', sortable: false, cls: 'tmpt-pb-cell', thCls: 'tmpt-pb-cell',
        render: (_, p) => {
            const all = p.positions || [];
            const preferred = all.filter(pos => pos.preferred);
            const color = (preferred.length ? preferred : all)[0]?.color ?? 'var(--tmu-text-dim)';
            return `<span class="tmpt-pb-inner" style="background:${color}"></span>`;
        },
    };
}

function isExpiredTimeleft(player) {
    return String(player?.timeleft_string || '').trim().toLowerCase() === 'expired';
}

function hasVisibleBidRowState(player) {
    return Number(player?.timeleft) > 0 || isExpiredTimeleft(player);
}

function renderTimeleftCell(player) {
    if (Number(player?.timeleft) > 0) {
        return `<span class="tmu-tabular${Number(player.timeleft) < 3600 ? ' tmpt-time-exp' : ''}" data-time-pid="${player.id}">${player.timeleft_string || ''}</span>`;
    }
    if (isExpiredTimeleft(player)) {
        return '<span class="tmu-tabular tmpt-time-exp">Expired</span>';
    }
    return '<span style="color:var(--tmu-text-dim)">—</span>';
}

/**
 * Build TmTable-compatible column definitions for a player table.
 * @param {object} [opts]
 * @param {boolean}  [opts.asi=true]          — show ASI column
 * @param {boolean}  [opts.rtn=true]          — show Routine column
 * @param {boolean}  [opts.timeleft=true]     — show Time column
 * @param {boolean}  [opts.curbid=true]       — show Cur Bid column
 * @param {boolean}  [opts.lastSeen=false]    — show Last Seen column (instead of Time+Bid)
 * @param {string}   [opts.tiLabel='TI']      — label for the TI column
 * @param {Function} [opts.nameDecorator]     — (p) => extraHtml appended after player link
 */
export function buildPlayerHeaders(opts = {}) {
    const showAsi = opts.asi !== false;
    const showRtn = opts.rtn !== false;
    const showRec = opts.rec !== false;
    const nameWidth = opts.nameWidth || null;
    const showTimeleft = opts.timeleft !== false && !opts.lastSeen;
    const showCurbid = opts.curbid !== false && !opts.lastSeen;
    const showLastSeen = !!opts.lastSeen;
    const tiLabel = opts.tiLabel || 'TI';
    const nameDecorator = typeof opts.nameDecorator === 'function' ? opts.nameDecorator : null;
    const gc = TmUtils.getColor;
    const { R5_THRESHOLDS, REC_THRESHOLDS, TI_THRESHOLDS, RTN_THRESHOLDS } = TmConst;
    const AGE_THRESHOLDS = TmConst.AGE_THRESHOLDS;

    const cols = [
        posBarCol(),
        {
            key: 'name', label: 'Player',
            ...(nameWidth ? { width: nameWidth } : {}),
            sort: (a, b) => String(a.name).localeCompare(String(b.name)),
            render: (_, p) => {
                const country = (p.country || p.countryCode || '').toLowerCase();
                const href = p.href || (p.id ? `/players/${p.id}/` : '#');
                const flag = country ? `<ib class="tmpt-flag flag-img-${country}"></ib>` : '';
                const extra = nameDecorator ? nameDecorator(p) : '';
                return `${flag}<a href="${href}" class="tmpt-link" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${p.name}</a>${extra}`;
            },
        },
        {
            key: 'pos', label: 'Pos', align: 'c',
            sort: (a, b) => {
                const pa = a.positions.filter(p => p.preferred);
                const pb = b.positions.filter(p => p.preferred);
                return (pa[0]?.ordering ?? 99) - (pb[0]?.ordering ?? 99);
            },
            render: (_, p) => {
                const all = p.positions || [];
                const preferred = all.filter(pos => pos.preferred);
                return TmPosition.chip(preferred.length ? preferred : all);
            },
        },
        {
            key: 'age', label: 'Age', align: 'r',
            sort: (a, b) => {
                return a.ageMonths - b.ageMonths;
            },
            render: (_, p) => {
                const yr = p.age || 0;
                const mo = p.month || 0;
                return `<span class="tmu-tabular" style="color:${gc(yr + mo / 12, AGE_THRESHOLDS)}">${yr}.${mo}</span>`;
            },
        },
    ];

    if (showAsi) cols.push({
        key: 'asi', label: 'ASI', align: 'r',
        render: (_, p) => p.asi != null
            ? `<span class="tmu-tabular" style="color:var(--tmu-text-strong)">${(p.asi || 0).toLocaleString()}</span>`
            : '<span style="color:var(--tmu-text-dim)">—</span>',
    });

    cols.push(
        {
            key: 'r5', label: 'R5', align: 'r',
            sort: (a, b) => (a.r5 ?? a.r5Hi ?? -Infinity) - (b.r5 ?? b.r5Hi ?? -Infinity),
            render: (_, p) => {
                if (p.r5 != null)
                    return `<span class="tmu-tabular" style="color:${gc(p.r5, R5_THRESHOLDS)};font-weight:700">${TmUtils.formatR5(p.r5)}</span>`;
                if (p.r5Lo != null && p.r5Hi != null) {
                    const loStr = TmUtils.formatR5(p.r5Lo), hiStr = TmUtils.formatR5(p.r5Hi);
                    const clrLo = gc(p.r5Lo, R5_THRESHOLDS), clrHi = gc(p.r5Hi, R5_THRESHOLDS);
                    if (loStr === hiStr)
                        return `<span class="tmu-tabular" style="color:${clrHi};font-weight:700">${hiStr}</span>`;
                    return `<span class="tmu-tabular"><span style="color:${clrLo}">${loStr}</span><span style="color:var(--tmu-text-dim)"> – </span><span style="color:${clrHi};font-weight:700">${hiStr}</span></span>`;
                }
                return '<span style="color:var(--tmu-text-dim)">—</span>';
            },
        },
        ...(showRec ? [{
            key: 'rec', label: 'REC', align: 'r',
            render: (_, p) => p.rec != null
                ? `<span class="tmu-tabular" style="color:${gc(p.rec, REC_THRESHOLDS)};font-weight:700">${p.rec}</span>`
                : '<span style="color:var(--tmu-text-dim)">—</span>',
        }] : []),
        {
            key: 'ti', label: tiLabel, align: 'r',
            sort: (a, b) => (a.ti ?? -Infinity) - (b.ti ?? -Infinity),
            render: (_, p) => p.ti != null
                ? `<span class="tmu-tabular" style="color:${gc(p.ti, TI_THRESHOLDS)}">${(p.ti || 0).toFixed(1)}</span>`
                : '<span style="color:var(--tmu-text-dim)">—</span>',
        },
    );

    if (showRtn) cols.push({
        key: 'routine', label: 'RTN', align: 'r',
        render: (_, p) => p.routine != null
            ? `<span class="tmu-tabular" style="color:${gc(p.routine, RTN_THRESHOLDS)}">${(p.routine || 0).toFixed(1)}</span>`
            : '<span style="color:var(--tmu-text-dim)">—</span>',
    });

    if (showTimeleft) cols.push({
        key: 'timeleft', label: 'Time', align: 'r',
        sort: (a, b) => (Number(a.timeleft) > 0 ? Number(a.timeleft) : (isExpiredTimeleft(a) ? 999999998 : 999999999)) - (Number(b.timeleft) > 0 ? Number(b.timeleft) : (isExpiredTimeleft(b) ? 999999998 : 999999999)),
        render: (_, p) => renderTimeleftCell(p),
    });

    if (showCurbid) cols.push({
        key: 'curbid', label: 'Cur Bid', align: 'r',
        render: (_, p) => (p.curbid || p.bid)
            ? `<span class="tmu-tabular" style="color:var(--tmu-text-strong)">${p.curbid || p.bid}</span>`
            : '<span style="color:var(--tmu-text-dim)">—</span>',
    });

    if (showLastSeen) cols.push({
        key: 'lastSeen', label: 'Last Seen', align: 'r',
        render: (_, p) => {
            const seenDate = p.lastSeen ? new Date(p.lastSeen).toLocaleDateString() : '—';
            const staleCls = p.stale ? 'tmpt-time-exp' : '';
            return `<span class="tmu-tabular ${staleCls}">${seenDate}</span>`;
        },
    });

    return cols;
}

export const TmPlayersTable = {
    headers: buildPlayerHeaders,
    injectCSS: injectPlayersTableCSS,

    /**
     * Mount a sortable player table into container.
     * @param {HTMLElement} container
     * @param {object[]} players  — raw player/bid rows (normalized internally)
     * @param {object}  [opts]
     * @param {object}  [opts.columns]          — { asi, rtn, timeleft, curbid } — column visibility
     * @param {object[]} [opts.extraColsBefore]  — extra TmTable column defs prepended before standard cols
     * @param {object[]} [opts.extraColsAfter]   — extra TmTable column defs appended after standard cols
     * @param {string}  [opts.sortKey]           — initial sort column key
     * @param {number}  [opts.sortDir]           — 1 asc / -1 desc
     * @param {string}  [opts.sectionTitle]      — passed through to TmBidsDialog
     * @param {string}  [opts.emptyText]
     * @returns {HTMLDivElement} wrap — has .refresh(newPlayers?) method
     */
    mount(container, players, opts = {}) {
        injectTmTableCss();
        injectPlayersTableCSS();

        const rows = [...(players || [])];
        const headers = [
            ...(opts.extraColsBefore || []),
            ...buildPlayerHeaders({
                ...(opts.columns || {}),
                ...(opts.nameDecorator ? { nameDecorator: opts.nameDecorator } : {}),
            }),
            ...(opts.extraColsAfter || []),
        ];
        const sectionTitle = opts.sectionTitle || '';

        const tableEl = TmTable.table({
            headers,
            items: rows,
            sortKey: opts.sortKey || 'timeleft',
            sortDir: opts.sortDir !== undefined ? opts.sortDir : 1,
            density: 'cozy',
            emptyText: opts.emptyText || 'No players found.',
            rowCls: opts.rowCls !== undefined
                ? opts.rowCls
                : (p) => hasVisibleBidRowState(p) ? 'tmpt-row-clickable' : null,
            rowAttrs: opts.rowAttrs || null,
            onRowClick: opts.onRowClick !== undefined
                ? opts.onRowClick
                : (p) => { if (hasVisibleBidRowState(p)) TmBidsDialog.open({ ...p, sectionTitle }); },
        });

        const wrap = document.createElement('div');
        wrap.className = 'tmpt-wrap';
        wrap.appendChild(tableEl);
        container.appendChild(wrap);

        wrap.refresh = (newPlayers) => {
            const updated = [...(newPlayers || [])];
            rows.length = 0;
            updated.forEach(r => rows.push(r));
            tableEl.refresh();
        };

        if (opts.onSort) {
            wrap.addEventListener('click', (e) => {
                const th = e.target.closest('thead th[data-sk]');
                if (!th || !wrap.contains(th)) return;
                e.stopImmediatePropagation();
                opts.onSort(th.dataset.sk);
            }, true);
        }

        return wrap;
    },
};
