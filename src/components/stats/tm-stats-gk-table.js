import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';

// ── Pure helpers ──────────────────────────────────────────────────────

    const _ratClr  = TmUtils.ratingColor;

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

    const _pctStr = (part, total) => total > 0 ? Math.round(part / total * 100) + '%' : '-';

    // ── Component ─────────────────────────────────────────────────────────

    /**
     * Build the goalkeeper table shown below outfield tables on all sub-tabs.
     *
     * @param {object[]} keepers        — aggregated keeper records
     * @param {object}   opts
     * @param {string}   opts.filter    — 'total' | 'average' | 'per90'
     * @param {boolean}  opts.showCards — show 🟨/🟥 columns (basic sub-tab only)
     * @returns {HTMLDivElement}  wrapper with section title + TmUI table
     */
    const build = (keepers, { filter: f, showCards }) => {
        const dv = (val) => {
            const raw = f === 'total' ? val : Number(val);
            if (!raw) return '-';
            return _fmtVal(val, f);
        };

        const items = keepers.map(p => {
            const m = p.matches, mins = p.minutes, rat = p.avgRating;
            const svv = _getDisplayValue(p.sv,          m, mins, f);
            const gv  = _getDisplayValue(p.g,           m, mins, f);
            const av  = _getDisplayValue(p.a,           m, mins, f);
            const spv = _getDisplayValue(p.sp,          m, mins, f);
            const tpv = _getDisplayValue(p.sp + p.up,   m, mins, f);
            const minsDisp = f === 'per90' ? "90'" :
                f === 'average' ? (m > 0 ? Math.round(mins / m) : 0) + "'" :
                mins + "'";
            return {
                pid: p.pid, name: p.name,
                matches: m, minSort: mins, minsDisp,
                rat, svv, gv, av, spv, tpv,
                yc: p.yc, rc: p.rc,
                _sp: p.sp, _tp: p.sp + p.up,
                lowMins: f === 'per90' && mins < 90,
            };
        });

        const headers = [
            { key: 'name',    label: 'Player',
              render: (val, it) =>
                  `<a href="/players/${it.pid}/#/page/history/" class="tsa-plr-link" target="_blank">${val}</a>` +
                  (it.lowMins ? '<span class="tsa-low-mins-icon" title="Less than 90 min — per90 stats unreliable">⚠</span>' : '') },
            { key: 'matches', label: 'M',   align: 'c' },
            { key: 'minSort', label: 'Min', align: 'c', render: (_, it) => it.minsDisp },
            { key: 'rat',     label: 'Rat', align: 'c',
              render: (val) => val > 0
                  ? `<span class="tsa-rat" style="color:${_ratClr(val)}">${val.toFixed(2)}</span>`
                  : `<span class="cell-zero">-</span>` },
            { key: 'svv',     label: 'Sv',  align: 'c', render: (val) => dv(val) },
            { key: 'gv',      label: 'G',   align: 'c', render: (val) => dv(val) },
            { key: 'av',      label: 'A',   align: 'c', render: (val) => dv(val) },
            { key: 'spv',     label: '✓',   align: 'c', render: (val) => dv(val) },
            { key: 'tpv',     label: 'Σ',   align: 'c', render: (val) => dv(val) },
            { key: '_sp',     label: '%',   align: 'c', sortable: false,
              render: (_, it) => `<span class="tsa-pct">${_pctStr(it._sp, it._tp)}</span>` },
        ];

        if (showCards) {
            headers.push(
                { key: 'yc', label: '🟨', align: 'c',
                  render: (val) => `<span class="${val ? 'cell-yc' : 'cell-zero'}">${val || '-'}</span>` },
                { key: 'rc', label: '🟥', align: 'c',
                  render: (val) => `<span class="${val ? 'cell-rc' : 'cell-zero'}">${val || '-'}</span>` },
            );
        }

        const tbl = TmUI.table({
            headers,
            items,
            sortKey: 'svv',
            sortDir: -1,
            rowCls: (it) => it.lowMins ? 'tsa-low-mins' : '',
        });

        const wrap = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'tsa-section-title';
        title.style.marginTop = '16px';
        title.textContent = 'Goalkeepers';
        wrap.appendChild(title);
        wrap.appendChild(tbl);
        return wrap;
    };

    export const TmStatsGKTable = { build };

