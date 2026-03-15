import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmPosition } from '../../lib/tm-position.js';

// ── Pure helpers ──────────────────────────────────────────────────────

    const _ratClr  = TmUtils.ratingColor;

    const _posGroup = TmUtils.classifyPosition;
    const _posLabel = TmUtils.posLabel;

    const _getDisplayValue = (total, matches, minutes, filter) => {
        if (filter === 'total')   return total;
        if (filter === 'average') return matches > 0 ? (total / matches) : 0;
        if (filter === 'per90')   return minutes > 0 ? (total / minutes * 90) : 0;
        return total;
    };

    const _fmtVal = (val, filter) => {
        if (filter === 'total') return val;
        return Number(val).toFixed(2);
    };

    const _topCls = (val, col, tops) => TmUtils.topNClass(val, col, tops);

    const _pctStr = (part, total) => total > 0 ? Math.round(part / total * 100) + '%' : '-';

    // ── Component ─────────────────────────────────────────────────────────

    /**
     * Build the defending-tab outfield player table + legend.
     *
     * @param {object[]} outfield
     * @param {object}   opts
     * @param {string}   opts.filter         — 'total' | 'average' | 'per90'
     * @param {object}   opts.tops           — { colKey: { v1, v2, v3 } }
     * @param {number}   opts.matchTypeCount
     * @returns {HTMLDivElement}  wrapper containing the TmUI table + legend
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
        let totINT = 0, totTKL = 0, totHC = 0, totTF = 0;
        let totDW = 0, totDL = 0, totFouls = 0, totYC = 0;

        const items = outfield.map(p => {
            const m = p.matches, mins = p.minutes, rat = p.avgRating;
            const intv   = _getDisplayValue(p.interceptions,          m, mins, f);
            const tklv   = _getDisplayValue(p.tackles,          m, mins, f);
            const hcv    = _getDisplayValue(p.headerClearances,           m, mins, f);
            const tfv    = _getDisplayValue(p.tackleFails,           m, mins, f);
            const dwv    = _getDisplayValue(p.duelsWon,           m, mins, f);
            const tdv    = _getDisplayValue(p.duelsWon + p.duelsLost,    m, mins, f);
            const foulsv = _getDisplayValue(p.fouls,        m, mins, f);
            const pg = _posGroup(p.position);
            const pl = _posLabel(p.position);
            const po = { gk: 0, def: 1, mid: 2, att: 3 }[pg] ?? 2;
            const minsDisp = f === 'per90' ? "90'" :
                f === 'average' ? (m > 0 ? Math.round(mins / m) : 0) + "'" :
                mins + "'";
            const dwpct = p.duelsWon + p.duelsLost > 0 ? p.duelsWon / (p.duelsWon + p.duelsLost) * 100 : 0;

            totMin += mins;
            totINT += p.interceptions; totTKL += p.tackles; totHC += p.headerClearances; totTF += p.tackleFails;
            totDW += p.duelsWon; totDL += p.duelsLost; totFouls += p.fouls; totYC += p.yellowCards;
            if (rat > 0) { totRat += p.rating; totRatC += p.ratingCount; }

            return {
                pid: p.pid, name: p.name, pg, pl, pos: p.position,
                posSort: po * 1000 + pl.charCodeAt(0),
                matches: m, minSort: mins, minsDisp,
                rat, intv, tklv, hcv, tfv, dwv, tdv, foulsv,
                dwpct,
                yc: p.yellowCards,
                _dw: p.duelsWon, _dl: p.duelsLost,   // raw for footer pct
                lowMins: f === 'per90' && mins < 90,
            };
        });

        const tRat = totRatC > 0 ? totRat / totRatC : 0;
        const tf = v => v || '-';
        const totTD = totDW + totDL;

        const tbl = TmUI.table({
            headers: [
                { key: 'name',    label: 'Player',
                  render: (val, it) =>
                      `<a href="/players/${it.pid}/#/page/history/" class="tsa-plr-link" target="_blank">${val}</a>` +
                      (it.lowMins ? '<span class="tsa-low-mins-icon" title="Less than 90 min — per90 stats unreliable">⚠</span>' : '') },
                { key: 'posSort', label: 'Pos', align: 'c',
                  render: (_, it) => TmPosition.chip([it.pos], 'tsa-pos-chip') },
                { key: 'matches', label: 'M',    align: 'c' },
                { key: 'minSort', label: 'Min',  align: 'c',
                  render: (_, it) => it.minsDisp },
                { key: 'rat',     label: 'Rat',  align: 'c',
                  render: (val) => val > 0
                      ? `<span class="tsa-rat" style="color:${_ratClr(val)}">${val.toFixed(2)}</span>`
                      : `<span class="cell-zero">-</span>` },
                // Defending group
                { key: 'intv',   label: 'INT',   align: 'c', thCls: 'col-group-start', cls: 'col-group-start',
                  render: (val) => `<span class="${cc(val,'int','')}">${dv(val)}</span>` },
                { key: 'tklv',   label: 'TKL',   align: 'c',
                  render: (val) => `<span class="${cc(val,'tkl','')}">${dv(val)}</span>` },
                { key: 'hcv',    label: 'HC',    align: 'c',
                  render: (val) => `<span class="${cc(val,'hc','')}">${dv(val)}</span>` },
                { key: 'tfv',    label: 'TF',    align: 'c',
                  render: (val) => `<span class="${cc(val,'','warn')}">${dv(val)}</span>` },
                // Duels group
                { key: 'tdv',    label: 'Σ',     align: 'c', thCls: 'col-group-start', cls: 'col-group-start',
                  render: (val) => `<span class="${cc(val,'','')}">${dv(val)}</span>` },
                { key: 'dwv',    label: 'W',     align: 'c',
                  render: (val) => `<span class="${cc(val,'dw','')}">${dv(val)}</span>` },
                { key: 'dwpct',  label: '%',     align: 'c', sortable: false,
                  render: (_, it) => `<span class="tsa-pct">${_pctStr(it._dw, it._dw + it._dl)}</span>` },
                // Discipline group
                { key: 'foulsv', label: 'Fouls', align: 'c', thCls: 'col-group-start', cls: 'col-group-start',
                  render: (val) => `<span class="${cc(val,'fouls','warn')}">${dv(val)}</span>` },
                { key: 'yc',     label: '🟨',    align: 'c',
                  render: (val) => `<span class="${val ? 'cell-yc' : 'cell-zero'}">${val || '-'}</span>` },
            ],
            items,
            sortKey: 'intv',
            sortDir: -1,
            rowCls: (it) => it.lowMins ? 'tsa-low-mins' : '',
            footer: [{
                cls: 'tmu-tbl-tot',
                cells: [
                    `Total (${outfield.length})`, '', matchTypeCount, `${totMin}'`,
                    { content: `<span class="tsa-rat" style="color:${_ratClr(tRat)}">${tRat > 0 ? tRat.toFixed(2) : '-'}</span>` },
                    // Defending
                    { content: tf(totINT),  cls: 'col-group-start' },
                    tf(totTKL), tf(totHC), tf(totTF),
                    // Duels
                    { content: tf(totTD),   cls: 'col-group-start' },
                    tf(totDW),
                    { content: `<span class="tsa-pct">${_pctStr(totDW, totTD)}</span>` },
                    // Discipline
                    { content: tf(totFouls), cls: 'col-group-start' },
                    { content: `<span class="${totYC ? 'cell-yc' : 'cell-zero'}">${tf(totYC)}</span>` },
                ],
            }],
        });

        // Wrap table + legend together
        const wrap = document.createElement('div');
        wrap.appendChild(tbl);

        const legend = document.createElement('div');
        legend.className = 'tsa-legend';
        legend.innerHTML = `
            <div class="tsa-legend-title">Column Descriptions</div>
            <div class="tsa-legend-grid">
                <div class="tsa-legend-item"><span class="tsa-legend-key">INT</span> Interceptions — read the play and intercepted the ball without a physical challenge</div>
                <div class="tsa-legend-item"><span class="tsa-legend-key">TKL</span> Tackles Won — successful challenges where the defender physically took the ball</div>
                <div class="tsa-legend-item"><span class="tsa-legend-key">HC</span> Header Clearances — aerial duels won, heading the ball away on crosses and corners</div>
                <div class="tsa-legend-item"><span class="tsa-legend-key">TF</span> Tackles Failed — attempted to stop attacker in a 1v1 run but got beaten, leading to a shot</div>
                <div class="tsa-legend-item"><span class="tsa-legend-key">Duels W</span> Duels Won — stopped the attacker in a 1v1 running duel or defensive situation</div>
                <div class="tsa-legend-item"><span class="tsa-legend-key">Fouls</span> Fouls Committed — times the player committed a foul during play</div>
            </div>`;
        wrap.appendChild(legend);

        return wrap;
    };

    export const TmStatsDefendingTable = { build };

