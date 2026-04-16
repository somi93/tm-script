import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';

const getColor = TmUtils.getColor;

function fmtNum(n) { return TmUtils.fmtCoins(n); }

export function fmtRec(val) {
    const { REC_THRESHOLDS } = TmConst;
    if (val == null || val === '') return '<span class="tms-muted tmu-text-faint">—</span>';
    const num = parseFloat(val);
    const disp = Number.isInteger(num) ? String(num) : num.toFixed(2);
    const clr = getColor(num, REC_THRESHOLDS);
    return `<span class="tms-rec tmu-tabular" style="border-color:${clr}44;color:${clr}">${disp}</span>`;
}

export function tiHtml(ti) {
    const { TI_THRESHOLDS } = TmConst;
    if (ti === null || ti === undefined) return '<span class="tms-muted tmu-text-faint">—</span>';
    const clr = getColor(ti, TI_THRESHOLDS);
    return `<span class="tms-strong-val tmu-tabular" style="color:${clr}">${ti.toFixed(1)}</span>`;
}

export function fmtR5(r5) {
    const { R5_THRESHOLDS } = TmConst;
    if (r5 == null) return '<span class="tms-tip-pending">…</span>';
    const clr = getColor(r5, R5_THRESHOLDS);
    return `<span class="tms-strong-val tmu-tabular" style="color:${clr}">${TmUtils.formatR5(r5)}</span>`;
}

export function fmtR5Range(lo, hi) {
    const { R5_THRESHOLDS } = TmConst;
    if (lo == null || hi == null) return '<span class="tms-tip-pending">…</span>';
    const loFixed = TmUtils.formatR5(lo), hiFixed = TmUtils.formatR5(hi);
    const clrLo = getColor(lo, R5_THRESHOLDS);
    const clrHi = getColor(hi, R5_THRESHOLDS);
    if (loFixed === hiFixed)
        return `<span class="tms-range-wrap tmu-tabular"><span class="tms-strong-val tmu-tabular" style="color:${clrHi}">${hiFixed}</span></span>`;
    return `<span class="tms-range-wrap tmu-tabular">` +
        `<span class="tms-range-val tmu-tabular" style="color:${clrLo}">${loFixed}</span>` +
        `<span class="tms-range-sep">–</span>` +
        `<span class="tms-range-val tmu-tabular" style="color:${clrHi}">${hiFixed}</span></span>`;
}

const MOUNT_OPTIONS = {
    columns: { rtn: false },
    sortKey: 'timeleft',
    sortDir: 1,
    rowCls(player) { return player.timeleft > 0 ? 'tmpt-row-clickable' : null; },
    rowAttrs(player) { return { 'data-pid': String(player.id) }; },
    nameDecorator(player) {
        return player.note ? `<span title="${player.note.replace(/"/g, '&quot;')}">&#x1F4CB;</span>` : '';
    },
    extraColsAfter: [{
        key: 'next_bid', label: '', sortable: false, width: '88px',
        render(v, player) {
            const reload = TmUI.button({
                slot: '&#x21BB;',
                variant: 'icon',
                size: 'xs',
                title: player.tooltipFetched ? 'Refresh stats' : 'Fetch stats',
                attrs: { 'data-transfer-reload': true, 'data-pid': String(player.id) },
            }).outerHTML;
            if (!player.timeleft) return reload;
            const bid = TmUI.button({
                label: 'Bid',
                color: 'primary',
                size: 'sm',
                shape: 'full',
                attrs: {
                    'data-transfer-bid': true,
                    'data-pid': String(player.id),
                },
            }).outerHTML;
            return `<span style="display:inline-flex;gap:4px;align-items:center">${reload}${bid}</span>`;
        },
    }],
};

export const TmTransferTable = { fmtRec, tiHtml, fmtR5, fmtR5Range, MOUNT_OPTIONS };

