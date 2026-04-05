import { TmTable, injectTmTableCss } from './tm-table.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmConst } from '../../lib/tm-constants.js';
import { TmUI } from './tm-ui.js';
import { TmBidsDialog } from '../bids/tm-bids-dialog.js';

'use strict';

const FP_EXPAND = { d: 'dc', dm: 'dmc', m: 'mc', om: 'omc', f: 'fc', gk: 'gk' };

function parseFp(fp) {
    if (!fp) return [];
    const keys = [];
    for (const seg of String(fp).split(',').map(s => s.trim()).filter(Boolean)) {
        for (const part of seg.split('/').map(p => p.replace(/\s+/g, '').toLowerCase())) {
            if (part) keys.push(FP_EXPAND[part] || part);
        }
    }
    return keys;
}

export function normalizeRow(p) {
    const hasRichPositions = Array.isArray(p.positions) && p.positions.length && typeof p.positions[0] === 'object';
    const fpString = p.fp || p.position || '';
    const positions = hasRichPositions
        ? p.positions
        : parseFp(fpString).map(k => {
            const entry = TmConst.POSITION_MAP[k];
            return entry ? { ...entry } : { position: k.toUpperCase(), color: 'var(--tmu-text-disabled)', ordering: 99 };
        });

    let ageYears = 0, ageMonths = 0;
    if (typeof p.age === 'number') {
        ageYears = p.age;
        ageMonths = p.months || 0;
    } else {
        const parts = String(p.age || '').replace(',', '.').split('.');
        ageYears = parseInt(parts[0]) || 0;
        ageMonths = parseInt(parts[1]) || 0;
    }

    return {
        ...p,
        positions,
        ageYears,
        ageMonths,
        country: (p.country || p.countryCode || '').toLowerCase(),
        timeleft: Number(p.timeleft) || 0,
        timeleft_string: p.timeleft_string || p.timeLeft || '',
        curbid: p.curbid || p.bid || '',
        href: p.href || (p.id ? `/players/${p.id}/` : '#'),
        asi: p.asi != null ? p.asi : null,
        r5: p.r5 != null ? p.r5 : null,
        rec: p.rec != null ? p.rec : null,
        ti: p.ti !== undefined ? p.ti : null,
        routine: p.routine != null ? p.routine : null,
    };
}

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
        .tmpt-link { color: #fff; text-decoration: none; font-weight: 500; }
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
        render: (_, p) => `<span class="tmpt-pb-inner" style="background:${(p.positions || [])[0]?.color ?? 'var(--tmu-text-dim)'}"></span>`,
    };
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
    const showAsi      = opts.asi      !== false;
    const showRtn      = opts.rtn      !== false;
    const showTimeleft = opts.timeleft !== false && !opts.lastSeen;
    const showCurbid   = opts.curbid   !== false && !opts.lastSeen;
    const showLastSeen = !!opts.lastSeen;
    const tiLabel      = opts.tiLabel || 'TI';
    const nameDecorator = typeof opts.nameDecorator === 'function' ? opts.nameDecorator : null;
    const gc = TmUtils.getColor;
    const { R5_THRESHOLDS, REC_THRESHOLDS, TI_THRESHOLDS, RTN_THRESHOLDS } = TmConst;
    const AGE_THRESHOLDS = TmConst.AGE_THRESHOLDS;

    const cols = [
        posBarCol(),
        {
            key: 'name', label: 'Player',
            sort: (a, b) => String(a.name).localeCompare(String(b.name)),
            render: (_, p) => {
                const flag = p.country ? `<ib class="tmpt-flag flag-img-${p.country}"></ib>` : '';
                const extra = nameDecorator ? nameDecorator(p) : '';
                return `${flag}<a href="${p.href}" class="tmpt-link" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${p.name}</a>${extra}`;
            },
        },
        {
            key: 'pos', label: 'Pos', align: 'c',
            sort: (a, b) => {
                const ao = (a.positions || [])[0]?.ordering ?? 99;
                const bo = (b.positions || [])[0]?.ordering ?? 99;
                const ao2 = (a.positions || [])[1]?.ordering ?? 0;
                const bo2 = (b.positions || [])[1]?.ordering ?? 0;
                const as = ao * 100 + (a.positions?.length > 1 ? 50 + ao2 : 0);
                const bs = bo * 100 + (b.positions?.length > 1 ? 50 + bo2 : 0);
                return as - bs;
            },
            render: (_, p) => TmPosition.chip(p.positions || []),
        },
        {
            key: 'age', label: 'Age', align: 'r',
            sort: (a, b) => {
                const ay = (a.ageYears ?? a.age ?? 0) * 12 + (a.ageMonths ?? a.months ?? 0);
                const by = (b.ageYears ?? b.age ?? 0) * 12 + (b.ageMonths ?? b.months ?? 0);
                return ay - by;
            },
            render: (_, p) => {
                const yr = p.ageYears ?? p.age ?? 0;
                const mo = p.ageMonths ?? p.months ?? 0;
                return `<span class="tmu-tabular" style="color:${gc(yr + mo / 12, AGE_THRESHOLDS)}">${yr}.${mo}</span>`;
            },
        },
    ];

    if (showAsi) cols.push({
        key: 'asi', label: 'ASI', align: 'r',
        render: (_, p) => p.asi != null
            ? `<span class="tmu-tabular" style="color:var(--tmu-text-strong)">${p.asi.toLocaleString ? p.asi.toLocaleString() : p.asi}</span>`
            : '<span style="color:var(--tmu-text-dim)">—</span>',
    });

    cols.push(
        {
            key: 'r5', label: 'R5', align: 'r',
            render: (_, p) => p.r5 != null
                ? `<span class="tmu-tabular" style="color:${gc(p.r5, R5_THRESHOLDS)};font-weight:700">${p.r5}</span>`
                : '<span style="color:var(--tmu-text-dim)">—</span>',
        },
        {
            key: 'rec', label: 'REC', align: 'r',
            render: (_, p) => p.rec != null
                ? `<span class="tmu-tabular" style="color:${gc(p.rec, REC_THRESHOLDS)};font-weight:700">${p.rec}</span>`
                : '<span style="color:var(--tmu-text-dim)">—</span>',
        },
        {
            key: 'ti', label: tiLabel, align: 'r',
            sort: (a, b) => (a.ti ?? -Infinity) - (b.ti ?? -Infinity),
            render: (_, p) => p.ti != null
                ? `<span class="tmu-tabular" style="color:${gc(p.ti, TI_THRESHOLDS)}">${p.ti.toFixed ? p.ti.toFixed(1) : p.ti}</span>`
                : '<span style="color:var(--tmu-text-dim)">—</span>',
        },
    );

    if (showRtn) cols.push({
        key: 'routine', label: 'RTN', align: 'r',
        render: (_, p) => p.routine != null
            ? `<span class="tmu-tabular" style="color:${gc(p.routine, RTN_THRESHOLDS)}">${p.routine.toFixed ? p.routine.toFixed(1) : p.routine}</span>`
            : '<span style="color:var(--tmu-text-dim)">—</span>',
    });

    if (showTimeleft) cols.push({
        key: 'timeleft', label: 'Time', align: 'r',
        sort: (a, b) => (a.timeleft > 0 ? a.timeleft : 999999999) - (b.timeleft > 0 ? b.timeleft : 999999999),
        render: (_, p) => p.timeleft > 0
            ? `<span class="tmu-tabular${p.timeleft < 3600 ? ' tmpt-time-exp' : ''}">${p.timeleft_string || ''}</span>`
            : '<span style="color:var(--tmu-text-dim)">—</span>',
    });

    if (showCurbid) cols.push({
        key: 'curbid', label: 'Cur Bid', align: 'r',
        render: (_, p) => p.curbid
            ? `<span class="tmu-tabular" style="color:var(--tmu-text-strong)">${p.curbid}</span>`
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
    normalizeRow,
    injectCSS: injectPlayersTableCSS,

    /**
     * Mount a sortable player table into container.
     * @param {HTMLElement} container
     * @param {object[]} players  — raw player/bid rows (normalized internally)
     * @param {object}  [opts]
     * @param {object}  [opts.columns]       — { asi, rtn } — column visibility
     * @param {string}  [opts.sortKey]       — initial sort column key
     * @param {number}  [opts.sortDir]       — 1 asc / -1 desc
     * @param {string}  [opts.sectionTitle]  — passed through to TmBidsDialog
     * @param {string}  [opts.emptyText]
     */
    mount(container, players, opts = {}) {
        injectTmTableCss();
        injectPlayersTableCSS();

        const rows = (players || []).map(normalizeRow);
        const headers = buildPlayerHeaders({
            ...(opts.columns || {}),
            ...(opts.nameDecorator ? { nameDecorator: opts.nameDecorator } : {}),
        });
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
                : (p) => p.timeleft > 0 ? 'tmpt-row-clickable' : null,
            rowAttrs: opts.rowAttrs || null,
            onRowClick: opts.onRowClick !== undefined
                ? opts.onRowClick
                : (p) => { if (p.timeleft > 0) TmBidsDialog.open({ ...p, sectionTitle }); },
        });

        const wrap = document.createElement('div');
        wrap.className = 'tmpt-wrap';
        wrap.appendChild(tableEl);
        container.appendChild(wrap);

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
