// ==UserScript==
// @name         TM Stats — Basic Player Table Component
// @namespace    https://trophymanager.com
// @version      1.0.0
// @description  Builds the Basic sub-tab player table for the Season Match Analysis script.
//               Depends on: TmUI (tm-ui.js)
//               CSS classes (.tsa-pos-*, .tsa-plr-link, .tsa-low-mins*, .tsa-rat, .cell-*)
//               are injected by tm-stats.user.js.
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ── Pure helpers (mirrors tm-stats.user.js local functions) ──────────

    const _ratClr  = window.TmUtils.ratingColor;
    const _fix2    = window.TmUtils.fix2;
    const _posGroup = window.TmUtils.classifyPosition;
    const _posLabel = window.TmUtils.posLabel;

    const _getDisplayValue = (total, matches, minutes, filter) => {
        if (filter === 'total')   return total;
        if (filter === 'average') return matches > 0 ? (total / matches) : 0;
        if (filter === 'per90')   return minutes > 0 ? (total / minutes * 90) : 0;
        return total;
    };

    const _fmtVal = (val, filter) => {
        if (filter === 'total') return typeof val === 'number' ? val : val;
        return Number(val).toFixed(2);
    };

    const _topCls = (val, col, tops) => window.TmUtils.topNClass(val, col, tops);

    // ── Component ─────────────────────────────────────────────────────────

    /**
     * Build the basic-tab outfield player table.
     *
     * @param {object[]} outfield      — aggregated player records (from playerAgg)
     * @param {object}   opts
     * @param {string}   opts.filter         — 'total' | 'average' | 'per90'
     * @param {object}   opts.tops           — { colKey: { v1, v2, v3 } } top-3 thresholds
     * @param {number}   opts.matchTypeCount — total match count shown in footer
     * @returns {HTMLDivElement}  TmUI table wrapper element
     */
    const build = (outfield, { filter: f, tops, matchTypeCount }) => {
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

        let totMin = 0, totRat = 0, totRatC = 0;
        let totG = 0, totA = 0, totKP = 0, totYC = 0, totRC = 0, totFouls = 0;

        const items = outfield.map(p => {
            const m = p.matches, mins = p.minutes, rat = p.avgRating;
            const gv     = _getDisplayValue(p.g,     m, mins, f);
            const av     = _getDisplayValue(p.a,     m, mins, f);
            const kpv    = _getDisplayValue(p.kp,    m, mins, f);
            const foulsv = _getDisplayValue(p.fouls, m, mins, f);
            const pg = _posGroup(p.position);
            const pl = _posLabel(p.position);
            const po = { gk: 0, def: 1, mid: 2, att: 3 }[pg] ?? 2;
            const minsDisp = f === 'per90' ? "90'" :
                f === 'average' ? (m > 0 ? Math.round(mins / m) : 0) + "'" :
                mins + "'";
            totMin += mins; totG += p.g; totA += p.a;
            totKP += p.kp; totYC += p.yc; totRC += p.rc; totFouls += p.fouls;
            if (rat > 0) { totRat += p.rating; totRatC += p.ratingCount; }
            return {
                pid: p.pid, name: p.name, pg, pl,
                posSort: po * 1000 + pl.charCodeAt(0),
                matches: m, minSort: mins, minsDisp,
                rat, gv, av, kpv, foulsv,
                yc: p.yc, rc: p.rc,
                lowMins: f === 'per90' && mins < 90,
            };
        });

        const tRat = totRatC > 0 ? totRat / totRatC : 0;
        const tf = v => v || '-';

        return TmUI.table({
            headers: [
                { key: 'name',    label: 'Player',
                  render: (val, it) =>
                      `<a href="/players/${it.pid}/#/page/history/" class="tsa-plr-link" target="_blank">${val}</a>` +
                      (it.lowMins ? '<span class="tsa-low-mins-icon" title="Less than 90 min — per90 stats unreliable">⚠</span>' : '') },
                { key: 'posSort', label: 'Pos', align: 'c',
                  render: (_, it) => `<span class="tsa-pos tsa-pos-${it.pg}">${it.pl}</span>` },
                { key: 'matches', label: 'M',      align: 'c' },
                { key: 'minSort', label: 'Min',    align: 'c',
                  render: (_, it) => it.minsDisp },
                { key: 'rat',     label: 'Rat',    align: 'c',
                  render: (val) => val > 0
                      ? `<span class="tsa-rat" style="color:${_ratClr(val)}">${val.toFixed(2)}</span>`
                      : `<span class="cell-zero">-</span>` },
                { key: 'gv',     label: 'G',      align: 'c',
                  render: (val) => `<span class="${cc(val,'g','good')}">${dv(val)}</span>` },
                { key: 'av',     label: 'A',      align: 'c',
                  render: (val) => `<span class="${cc(val,'a','good')}">${dv(val)}</span>` },
                { key: 'kpv',    label: 'KP',     align: 'c',
                  render: (val) => `<span class="${cc(val,'kp','')}">${dv(val)}</span>` },
                { key: 'yc',     label: '🟨',     align: 'c',
                  render: (val) => `<span class="${val ? 'cell-yc' : 'cell-zero'}">${val || '-'}</span>` },
                { key: 'rc',     label: '🟥',     align: 'c',
                  render: (val) => `<span class="${val ? 'cell-rc' : 'cell-zero'}">${val || '-'}</span>` },
                { key: 'foulsv', label: 'Fouls',  align: 'c',
                  render: (val) => `<span class="${cc(val,'fouls','warn')}">${dv(val)}</span>` },
            ],
            items,
            sortKey: 'gv',
            sortDir: -1,
            rowCls: (it) => it.lowMins ? 'tsa-low-mins' : '',
            footer: [{
                cls: 'tmu-tbl-tot',
                cells: [
                    `Total (${outfield.length})`, '', matchTypeCount, `${totMin}'`,
                    { content: `<span class="tsa-rat" style="color:${_ratClr(tRat)}">${tRat > 0 ? tRat.toFixed(2) : '-'}</span>` },
                    { content: `<span class="${totG ? 'cell-good' : 'cell-zero'}">${tf(totG)}</span>` },
                    { content: `<span class="${totA ? 'cell-good' : 'cell-zero'}">${tf(totA)}</span>` },
                    tf(totKP),
                    { content: `<span class="${totYC ? 'cell-yc' : 'cell-zero'}">${tf(totYC)}</span>` },
                    { content: `<span class="${totRC ? 'cell-rc' : 'cell-zero'}">${tf(totRC)}</span>` },
                    tf(totFouls),
                ],
            }],
        });
    };

    window.TmStatsBasicTable = { build };

})();
