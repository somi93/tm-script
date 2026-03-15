import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmPosition } from '../../lib/tm-position.js';

// tm-stats-attacking-table.js — Attacking stats table component (multi-level headers)
// API: TmStatsAttackingTable.build(outfield, { filter, tops, matchTypeCount }) → HTMLElement (TmUI.table widget)
// Depends on: TmUI (tm-ui.js), TmUtils (tm-utils.js)
    const _ratClr  = TmUtils.ratingColor;

    const _posGroup = TmUtils.classifyPosition;
    const _posLabel = TmUtils.posLabel;

    const _getDisplayValue = (total, matches, minutes, filter) => {
        if (filter === 'total') return total;
        if (filter === 'average') return matches > 0 ? (total / matches) : 0;
        if (filter === 'per90') return minutes > 0 ? (total / minutes * 90) : 0;
        return total;
    };

    const _fmtVal = (val, filter) => {
        if (filter === 'total') return typeof val === 'number' ? val : val;
        return Number(val).toFixed(2);
    };

    const _pctStr = (part, total) => total > 0 ? Math.round(part / total * 100) + '%' : '-';

    const _topCls = (val, col, tops) => TmUtils.topNClass(val, col, tops);

    export const TmStatsAttackingTable = {
        build(outfield, { filter: f = 'total', tops = {}, matchTypeCount = 0 } = {}) {
            const dv = (val) => {
                const raw = f === 'total' ? val : Number(val);
                if (!raw) return '-';
                return _fmtVal(val, f);
            };
            const cc = (val, colKey, warnType) => {
                const raw = f === 'total' ? val : Number(val);
                if (!raw) return 'cell-zero';
                const t = _topCls(raw, colKey, tops);
                if (t) return 'cell-' + t;
                return warnType ? 'cell-' + warnType : '';
            };
            const pct = (part, total) => `<span class="tsa-pct">${_pctStr(part, total)}</span>`;

            let totM = 0, totMin = 0, totRat = 0, totRatC = 0;
            let totG = 0, totA = 0, totSh = 0, totSoT = 0;
            let totShF = 0, totSoTF = 0, totGF = 0;
            let totShH = 0, totSoTH = 0, totGH = 0;
            let totSP = 0, totUP = 0, totSC = 0, totUC = 0;
            let totSTP = 0, totFKG = 0, totPen = 0, totPenG = 0;

            const items = outfield.map(p => {
                const m = p.matches, mins = p.minutes;
                const fv = stat => _getDisplayValue(p[stat] || 0, m, mins, f);
                const tpRaw = (p.passesCompleted || 0) + (p.passesFailed || 0);
                const tcRaw = (p.crossesCompleted || 0) + (p.crossesFailed || 0);
                const pg = _posGroup(p.position);
                const pl = _posLabel(p.position);
                const po = { gk: 0, def: 1, mid: 2, att: 3 }[pg] ?? 2;
                const minsDisp = f === 'per90' ? "90'" :
                    f === 'average' ? (m > 0 ? Math.round(mins / m) : 0) + "'" :
                    mins + "'";

                totM += m; totMin += mins;
                totG += p.goals || 0; totA += p.assists || 0;
                totSh += p.shots || 0; totSoT += p.shotsOnTarget || 0;
                totShF += p.shotsFoot || 0; totSoTF += p.shotsOnTargetFoot || 0; totGF += p.goalsFoot || 0;
                totShH += p.shotsHead || 0; totSoTH += p.shotsOnTargetHead || 0; totGH += p.goalsHead || 0;
                totSP += p.passesCompleted || 0; totUP += p.passesFailed || 0;
                totSC += p.crossesCompleted || 0; totUC += p.crossesFailed || 0;
                totSTP += p.setpieceTakes || 0; totFKG += p.freekickGoals || 0;
                totPen += p.penaltiesTaken || 0; totPenG += p.penaltiesScored || 0;
                if (p.avgRating > 0) { totRat += p.rating; totRatC += p.ratingCount; }

                return {
                    pid: p.pid, name: p.name, pg, pl, pos: p.position,
                    posSort: po * 1000 + pl.charCodeAt(0),
                    matches: m, minSort: mins, minsDisp,
                    rat: p.avgRating,
                    // Shooting Total
                    sh: fv('shots'), sot: fv('shotsOnTarget'), g: fv('goals'),
                    gpct: (p.shots || 0) > 0 ? (p.goals || 0) / p.shots : 0,
                    // Shooting Foot
                    shf: fv('shotsFoot'), sotf: fv('shotsOnTargetFoot'), gf: fv('goalsFoot'),
                    gfpct: (p.shotsFoot || 0) > 0 ? (p.goalsFoot || 0) / p.shotsFoot : 0,
                    // Shooting Head
                    shh: fv('shotsHead'), soth: fv('shotsOnTargetHead'), gh: fv('goalsHead'),
                    ghpct: (p.shotsHead || 0) > 0 ? (p.goalsHead || 0) / p.shotsHead : 0,
                    // Passes
                    tp: _getDisplayValue(tpRaw, m, mins, f), sp: fv('passesCompleted'),
                    cppct: tpRaw > 0 ? (p.passesCompleted || 0) / tpRaw : 0,
                    a: fv('assists'),
                    // Crosses
                    tc: _getDisplayValue(tcRaw, m, mins, f), sc: fv('crossesCompleted'),
                    crpct: tcRaw > 0 ? (p.crossesCompleted || 0) / tcRaw : 0,
                    // FK
                    stp: fv('setpieceTakes'), fkg: fv('freekickGoals'),
                    // Pen
                    pen: fv('penaltiesTaken'), peng: fv('penaltiesScored'),
                    // Raw values for percentage display
                    _shRaw: p.shots || 0, _gRaw: p.goals || 0,
                    _shfRaw: p.shotsFoot || 0, _gfRaw: p.goalsFoot || 0,
                    _shhRaw: p.shotsHead || 0, _ghRaw: p.goalsHead || 0,
                    _tpRaw: tpRaw, _spRaw: p.passesCompleted || 0,
                    _tcRaw: tcRaw, _scRaw: p.crossesCompleted || 0,
                    lowMins: f === 'per90' && mins < 90,
                };
            });

            const tRat = totRatC > 0 ? totRat / totRatC : 0;
            const tf = v => v || '-';
            const totTP = totSP + totUP;
            const totTC = totSC + totUC;

            return TmUI.table({
                cls: 'tsa-table',
                groupHeaders: [
                    {
                        cls: 'tsa-super-row',
                        cells: [
                            { label: '', colspan: 5, rowspan: 2 },
                            { label: 'Shooting', colspan: 12, cls: 'col-group-start' },
                            { label: 'Passes', colspan: 4, rowspan: 2, cls: 'col-group-start' },
                            { label: 'Crosses', colspan: 3, rowspan: 2, cls: 'col-group-start' },
                            { label: 'FK', colspan: 2, rowspan: 2, cls: 'col-group-start' },
                            { label: 'Pen', colspan: 2, rowspan: 2, cls: 'col-group-start' },
                        ],
                    },
                    {
                        cls: 'tsa-group-row',
                        cells: [
                            { label: 'Total', colspan: 4, cls: 'col-group-start' },
                            { label: 'Foot',  colspan: 4, cls: 'col-group-start' },
                            { label: 'Head',  colspan: 4, cls: 'col-group-start' },
                        ],
                    },
                ],
                headers: [
                    { key: 'name',    label: 'Player',
                      render: (val, it) =>
                          `<a href="/players/${it.pid}/#/page/history/" class="tsa-plr-link" target="_blank">${val}</a>` +
                          (it.lowMins ? '<span class="tsa-low-mins-icon" title="Less than 90 min — per90 stats unreliable">⚠</span>' : '') },
                    { key: 'posSort', label: 'Pos',  align: 'c', title: 'Position',
                      render: (_, it) => TmPosition.chip([it.pos], 'tsa-pos-chip') },
                    { key: 'matches', label: 'M',    align: 'c', title: 'Matches' },
                    { key: 'minSort', label: 'Min',  align: 'c', title: 'Minutes',
                      render: (_, it) => it.minsDisp },
                    { key: 'rat',     label: 'Rat',  align: 'c', title: 'Avg Rating',
                      render: (val) => val > 0
                          ? `<span class="tsa-rat" style="color:${_ratClr(val)}">${val.toFixed(2)}</span>`
                          : `<span class="cell-zero">-</span>` },
                    // Shooting Total
                    { key: 'sh',    label: 'Σ',  align: 'c', title: 'Total Shots',      thCls: 'col-group-start', cls: 'col-group-start',
                      render: (val) => `<span class="${cc(val,'sh','')}">${dv(val)}</span>` },
                    { key: 'sot',   label: 'OT', align: 'c', title: 'On Target',
                      render: (val) => `<span class="${cc(val,'sot','')}">${dv(val)}</span>` },
                    { key: 'g',     label: 'G',  align: 'c', title: 'Goals',
                      render: (val) => `<span class="${cc(val,'g','good')}">${dv(val)}</span>` },
                    { key: 'gpct',  label: '%',  align: 'c', title: 'Conversion %',
                      render: (_, it) => pct(it._gRaw, it._shRaw) },
                    // Shooting Foot
                    { key: 'shf',   label: 'Σ',  align: 'c', title: 'Foot Shots',       thCls: 'col-group-start', cls: 'col-group-start',
                      render: (val) => `<span class="${cc(val,'shf','')}">${dv(val)}</span>` },
                    { key: 'sotf',  label: 'OT', align: 'c', title: 'On Target (Foot)',
                      render: (val) => `<span class="${cc(val,'sotf','')}">${dv(val)}</span>` },
                    { key: 'gf',    label: 'G',  align: 'c', title: 'Goals (Foot)',
                      render: (val) => `<span class="${cc(val,'gf','good')}">${dv(val)}</span>` },
                    { key: 'gfpct', label: '%',  align: 'c', title: 'Conversion % (Foot)',
                      render: (_, it) => pct(it._gfRaw, it._shfRaw) },
                    // Shooting Head
                    { key: 'shh',   label: 'Σ',  align: 'c', title: 'Header Shots',     thCls: 'col-group-start', cls: 'col-group-start',
                      render: (val) => `<span class="${cc(val,'shh','')}">${dv(val)}</span>` },
                    { key: 'soth',  label: 'OT', align: 'c', title: 'On Target (Head)',
                      render: (val) => `<span class="${cc(val,'soth','')}">${dv(val)}</span>` },
                    { key: 'gh',    label: 'G',  align: 'c', title: 'Goals (Head)',
                      render: (val) => `<span class="${cc(val,'gh','good')}">${dv(val)}</span>` },
                    { key: 'ghpct', label: '%',  align: 'c', title: 'Conversion % (Head)',
                      render: (_, it) => pct(it._ghRaw, it._shhRaw) },
                    // Passes
                    { key: 'tp',    label: 'Σ',  align: 'c', title: 'Total Passes',      thCls: 'col-group-start', cls: 'col-group-start',
                      render: (val) => `<span class="${cc(val,'tp','')}">${dv(val)}</span>` },
                    { key: 'sp',    label: '✓',  align: 'c', title: 'Completed Passes',
                      render: (val) => `<span class="${cc(val,'sp','')}">${dv(val)}</span>` },
                    { key: 'cppct', label: '%',  align: 'c', title: 'Completion %',
                      render: (_, it) => pct(it._spRaw, it._tpRaw) },
                    { key: 'a',     label: 'A',  align: 'c', title: 'Assists',
                      render: (val) => `<span class="${cc(val,'a','good')}">${dv(val)}</span>` },
                    // Crosses
                    { key: 'tc',    label: 'Σ',  align: 'c', title: 'Total Crosses',     thCls: 'col-group-start', cls: 'col-group-start',
                      render: (val) => `<span class="${cc(val,'','')}">${dv(val)}</span>` },
                    { key: 'sc',    label: '✓',  align: 'c', title: 'Successful Crosses',
                      render: (val) => `<span class="${cc(val,'sc','')}">${dv(val)}</span>` },
                    { key: 'crpct', label: '%',  align: 'c', title: 'Cross Success %',
                      render: (_, it) => pct(it._scRaw, it._tcRaw) },
                    // FK
                    { key: 'stp',   label: 'Σ',  align: 'c', title: 'Free Kicks',        thCls: 'col-group-start', cls: 'col-group-start',
                      render: (val) => `<span class="${cc(val,'stp','')}">${dv(val)}</span>` },
                    { key: 'fkg',   label: 'G',  align: 'c', title: 'Free Kick Goals',
                      render: (val) => `<span class="${val ? 'cell-good' : 'cell-zero'}">${dv(val)}</span>` },
                    // Pen
                    { key: 'pen',   label: 'Σ',  align: 'c', title: 'Penalties Taken',   thCls: 'col-group-start', cls: 'col-group-start',
                      render: (val) => `<span class="${cc(val,'pen','')}">${dv(val)}</span>` },
                    { key: 'peng',  label: 'G',  align: 'c', title: 'Penalty Goals',
                      render: (val) => `<span class="${val ? 'cell-good' : 'cell-zero'}">${dv(val)}</span>` },
                ],
                items,
                sortKey: 'g',
                sortDir: -1,
                rowCls: (it) => it.lowMins ? 'tsa-low-mins' : '',
                footer: [{
                    cls: 'tmu-tbl-tot',
                    cells: [
                        `Total (${outfield.length})`, '', matchTypeCount, `${totMin}'`,
                        { content: `<span class="tsa-rat" style="color:${_ratClr(tRat)}">${tRat > 0 ? tRat.toFixed(2) : '-'}</span>` },
                        // Shooting Total
                        { content: tf(totSh),  cls: 'col-group-start' }, tf(totSoT),
                        { content: `<span class="${totG  ? 'cell-good' : 'cell-zero'}">${tf(totG)}</span>` },
                        { content: pct(totG,  totSh) },
                        // Shooting Foot
                        { content: tf(totShF), cls: 'col-group-start' }, tf(totSoTF),
                        { content: `<span class="${totGF ? 'cell-good' : 'cell-zero'}">${tf(totGF)}</span>` },
                        { content: pct(totGF, totShF) },
                        // Shooting Head
                        { content: tf(totShH), cls: 'col-group-start' }, tf(totSoTH),
                        { content: `<span class="${totGH ? 'cell-good' : 'cell-zero'}">${tf(totGH)}</span>` },
                        { content: pct(totGH, totShH) },
                        // Passes
                        { content: tf(totTP),  cls: 'col-group-start' }, tf(totSP),
                        { content: pct(totSP, totTP) },
                        { content: `<span class="${totA  ? 'cell-good' : 'cell-zero'}">${tf(totA)}</span>` },
                        // Crosses
                        { content: tf(totTC),  cls: 'col-group-start' }, tf(totSC),
                        { content: pct(totSC, totTC) },
                        // FK
                        { content: tf(totSTP), cls: 'col-group-start' },
                        { content: `<span class="${totFKG  ? 'cell-good' : 'cell-zero'}">${tf(totFKG)}</span>` },
                        // Pen
                        { content: tf(totPen), cls: 'col-group-start' },
                        { content: `<span class="${totPenG ? 'cell-good' : 'cell-zero'}">${tf(totPenG)}</span>` },
                    ],
                }],
            });
        },
    };
