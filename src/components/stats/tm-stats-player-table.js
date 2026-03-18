import { TmUtils } from '../../lib/tm-utils.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmConst } from '../../lib/tm-constants.js';

const _ratClr = TmUtils.ratingColor;
const BASE_COLS = TmConst.PLAYER_STAT_COLS;
const SYNTHETIC_COLS = [
    { key: 'shotsFoot', title: 'Shots by Foot' },
    { key: 'shotsOnTargetFoot', title: 'Shots on Target by Foot' },
    { key: 'shotsHead', title: 'Shots by Head' },
    { key: 'shotsOnTargetHead', title: 'Shots on Target by Head' },
];
const COL_META = new Map([...BASE_COLS, ...SYNTHETIC_COLS].map(col => [col.key, col]));

const CATEGORY_CONFIG = {
    shooting: {
        sortKey: 'goals',
        cols: [
            'goals', 'shots', 'shotsOnTarget',
            'goalsFoot', 'shotsFoot', 'shotsOnTargetFoot',
            'goalsHead', 'shotsHead', 'shotsOnTargetHead',
        ],
        groups: [
            { label: 'Total', keys: ['goals', 'shots', 'shotsOnTarget'] },
            { label: 'Foot', keys: ['goalsFoot', 'shotsFoot', 'shotsOnTargetFoot'] },
            { label: 'Head', keys: ['goalsHead', 'shotsHead', 'shotsOnTargetHead'] },
        ],
    },
    passing: {
        sortKey: 'assists',
        cols: [
            'assists', 'keyPasses',
            'passesCompleted', 'passesFailed', 'crossesCompleted', 'crossesFailed',
        ],
        groups: [
            { label: 'Passing', keys: ['assists', 'keyPasses', 'passesCompleted', 'passesFailed', 'crossesCompleted', 'crossesFailed'] },
        ],
    },
    defending: {
        sortKey: 'interceptions',
        cols: [
            'interceptions', 'tackles', 'headerClearances', 'tackleFails', 'duelsWon', 'duelsLost', 'fouls',
            'yellowCards', 'yellowRedCards', 'redCards',
        ],
        groups: [
            { label: 'Defending', keys: ['interceptions', 'tackles', 'headerClearances', 'tackleFails', 'duelsWon', 'duelsLost', 'fouls'] },
            { label: 'Cards', keys: ['yellowCards', 'yellowRedCards', 'redCards'] },
        ],
    },
};

const HEADER_LABELS = {
    goals: 'G',
    assists: 'A',
    shots: 'Sh',
    shotsOnTarget: 'SoT',
    shotsFoot: 'ShF',
    shotsOnTargetFoot: 'SoTF',
    goalsFoot: 'GF',
    shotsHead: 'ShH',
    shotsOnTargetHead: 'SoTH',
    goalsHead: 'GH',
    keyPasses: 'KP',
    passesCompleted: 'SP',
    passesFailed: 'UP',
    crossesCompleted: 'SC',
    crossesFailed: 'UC',
    interceptions: 'INT',
    tackles: 'TKL',
    headerClearances: 'HC',
    tackleFails: 'TF',
    duelsWon: 'DW',
    duelsLost: 'DL',
    fouls: 'Fls',
    yellowCards: 'YC',
    yellowRedCards: 'Y-R',
    redCards: 'RC',
};

const buildColumnsForCategory = (category = 'shooting') => {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.shooting;
    const keyRank = new Map(config.cols.map((key, index) => [key, index]));
    const orderedCols = config.cols
        .map(key => COL_META.get(key) || { key, title: key })
        .sort((a, b) => (keyRank.get(a.key) ?? 99) - (keyRank.get(b.key) ?? 99));
    const groupHeaders = [{
        cls: 'tmu-grp-row',
        cells: [
            { label: '', colspan: 5 },
            ...config.groups.map(group => ({ label: group.label, colspan: group.keys.length, cls: 'c' })),
        ],
    }];
    return { config, orderedCols, groupHeaders };
};

const _dv = (total, matches, minutes, filter) => {
    if (filter === 'total')   return total;
    if (filter === 'average') return matches > 0 ? (total / matches) : 0;
    if (filter === 'per90')   return minutes > 0 ? (total / minutes * 90) : 0;
    return total;
};

const TOP_COLS = BASE_COLS.filter(c => c.top).map(c => c.key);

export const TmStatsPlayerTable = {
        build(players, { filter: f = 'total', matchTypeCount = 0, category = 'shooting' } = {}) {
            const { config, orderedCols: ORDERED_COLS, groupHeaders: STAT_GROUP_HEADERS } = buildColumnsForCategory(category);
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
                return col.warn ? 'cell-warn' : '';
            };

            const totals = {};
            ORDERED_COLS.forEach(col => { totals[col.key] = 0; });
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
                ORDERED_COLS.forEach(col => {
                    item[col.key] = _dv(p[col.key] || 0, m, mins, f);
                    totals[col.key] = (totals[col.key] || 0) + (p[col.key] || 0);
                });
                totMin += mins;
                if (p.avgRating > 0) { totRat += p.rating; totRatC += p.ratingCount; }
                return item;
            });

            const tRat = totRatC > 0 ? totRat / totRatC : 0;

            const footerCells = [
                `Total (${players.length})`, '', matchTypeCount, `${totMin}'`,
                { content: `<span class="tsa-rat" style="color:${_ratClr(tRat)}">${tRat > 0 ? tRat.toFixed(2) : '-'}</span>` },
                ...ORDERED_COLS.map(col => ({
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
                                            render: (_, it) => TmPosition.chip([it.pos], 'tm-pos-chip tsa-pos-chip') },
                    { key: 'matches', label: 'M',   align: 'c' },
                    { key: 'minSort', label: 'Min', align: 'c', render: (_, it) => it.minsDisp },
                    { key: 'rat', label: 'Rat', align: 'c',
                      render: (val) => val > 0
                          ? `<span class="tsa-rat" style="color:${_ratClr(val)}">${val.toFixed(2)}</span>`
                          : `<span class="cell-zero">-</span>` },
                    ...ORDERED_COLS.map(col => ({
                        key: col.key,
                        label: category === 'shooting'
                            ? (col.key.includes('goals') ? 'G' : col.key.includes('shotsOnTarget') ? 'SoT' : 'Sh')
                            : (HEADER_LABELS[col.key] || col.abbr || col.title || col.key),
                        title: col.title || col.abbr,
                        align: 'c',
                        render: (val) => `<span class="${cc(val, col)}">${fmt(val)}</span>`,
                    })),
                ],
                groupHeaders: STAT_GROUP_HEADERS,
                items,
                sortKey: config.sortKey,
                sortDir: -1,
                rowCls: (it) => it.lowMins ? 'tsa-low-mins' : '',
                footer: [{ cls: 'tmu-tbl-tot', cells: footerCells }],
            });
        },
    };
