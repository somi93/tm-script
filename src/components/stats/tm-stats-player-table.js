import { TmUtils } from '../../lib/tm-utils.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmConst } from '../../lib/tm-constants.js';

    const _ratClr = TmUtils.ratingColor;
    const TABLE_COLS = TmConst.PLAYER_STAT_COLS.filter(c => c.abbr);

    const _dv = (total, matches, minutes, filter) => {
        if (filter === 'total')   return total;
        if (filter === 'average') return matches > 0 ? (total / matches) : 0;
        if (filter === 'per90')   return minutes > 0 ? (total / minutes * 90) : 0;
        return total;
    };

    const TOP_COLS = TABLE_COLS.filter(c => c.top).map(c => c.key);

    export const TmStatsPlayerTable = {
        build(players, { filter: f = 'total', matchTypeCount = 0 } = {}) {
            const tops = TmUtils.getTopNThresholds(players, TOP_COLS,
                (p, col) => _dv(p[col] || 0, p.matches, p.minutes, f));

            const fmt = (val) => {
                const raw = f === 'total' ? (val || 0) : Number(val);
                if (!raw) return '-';
                return f === 'total' ? val : raw.toFixed(2);
            };

            const cc = (val, col) => {
                const raw = f === 'total' ? (val || 0) : Number(val);
                if (!raw) return 'cell-zero';
                if (col.yc) return 'cell-yc';
                if (col.rc) return 'cell-rc';
                if (col.top) {
                    const t = TmUtils.topNClass(raw, col.key, tops);
                    if (t) return 'cell-' + t;
                }
                return col.warn ? 'cell-warn' : '';
            };

            const totals = {};
            TABLE_COLS.forEach(col => { totals[col.key] = 0; });
            let totMin = 0, totRat = 0, totRatC = 0;

            const items = players.map(p => {
                const m = p.matches, mins = p.minutes;
                const pg = TmUtils.classifyPosition(p.position);
                const pl = TmUtils.posLabel(p.position);
                const po = { gk: 0, def: 1, mid: 2, att: 3 }[pg] ?? 2;
                const minsDisp = f === 'per90' ? "90'"
                    : f === 'average' ? (m > 0 ? Math.round(mins / m) : 0) + "'"
                    : mins + "'";
                const item = {
                    pid: p.pid, name: p.name, pg, pl, pos: p.position,
                    posSort: po * 1000 + pl.charCodeAt(0),
                    matches: m, minSort: mins, minsDisp,
                    rat: p.avgRating,
                    lowMins: f === 'per90' && mins < 90,
                };
                TABLE_COLS.forEach(col => {
                    item[col.key] = _dv(p[col.key] || 0, m, mins, f);
                    totals[col.key] += p[col.key] || 0;
                });
                totMin += mins;
                if (p.avgRating > 0) { totRat += p.rating; totRatC += p.ratingCount; }
                return item;
            });

            const tRat = totRatC > 0 ? totRat / totRatC : 0;

            const footerCells = [
                `Total (${players.length})`, '', matchTypeCount, `${totMin}'`,
                { content: `<span class="tsa-rat" style="color:${_ratClr(tRat)}">${tRat > 0 ? tRat.toFixed(2) : '-'}</span>` },
                ...TABLE_COLS.map(col => ({
                    content: totals[col.key]
                        ? `<span class="${col.yc ? 'cell-yc' : col.rc ? 'cell-rc' : col.warn ? 'cell-warn' : ''}">${totals[col.key]}</span>`
                        : `<span class="cell-zero">-</span>`,
                })),
            ];

            return TmUI.table({
                cls: 'tsa-table',
                headers: [
                    { key: 'name', label: 'Player',
                      render: (val, it) =>
                          `<a href="/players/${it.pid}/#/page/history/" class="tsa-plr-link" target="_blank">${val}</a>` +
                          (it.lowMins ? '<span class="tsa-low-mins-icon" title="Less than 90 min — per90 stats unreliable">⚠</span>' : '') },
                    { key: 'posSort', label: 'Pos', align: 'c',
                      render: (_, it) => TmPosition.chip([it.pos], 'tsa-pos-chip') },
                    { key: 'matches', label: 'M',   align: 'c' },
                    { key: 'minSort', label: 'Min', align: 'c', render: (_, it) => it.minsDisp },
                    { key: 'rat', label: 'Rat', align: 'c',
                      render: (val) => val > 0
                          ? `<span class="tsa-rat" style="color:${_ratClr(val)}">${val.toFixed(2)}</span>`
                          : `<span class="cell-zero">-</span>` },
                    ...TABLE_COLS.map(col => ({
                        key: col.key, label: col.abbr, title: col.title, align: 'c',
                        render: (val) => `<span class="${cc(val, col)}">${fmt(val)}</span>`,
                    })),
                ],
                items,
                sortKey: 'goals',
                sortDir: -1,
                rowCls: (it) => it.lowMins ? 'tsa-low-mins' : '',
                footer: [{ cls: 'tmu-tbl-tot', cells: footerCells }],
            });
        },
    };
