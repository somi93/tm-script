import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';

function fmtNum(n) { return TmUtils.fmtCoins(n); }

export function fmtRec(val) {
    if (val == null || val === '') return '<span class="tms-muted tmu-text-faint">—</span>';
    const num = parseFloat(val);
    const disp = Number.isInteger(num) ? String(num) : num.toFixed(2);
    return `<span class="tms-rec tmu-tabular">${disp}</span>`;
}

export function tiHtml(ti) {
    if (ti === null || ti === undefined) return '<span class="tms-muted tmu-text-faint">—</span>';
    return `<span class="tms-strong-val tmu-tabular">${ti.toFixed(1)}</span>`;
}

export function fmtR5(r5) {
    if (r5 == null) return '<span class="tms-tip-pending">…</span>';
    return `<span class="tms-strong-val tmu-tabular">${TmUtils.formatR5(r5)}</span>`;
}

export function fmtR5Range(lo, hi) {
    if (lo == null || hi == null) return '<span class="tms-tip-pending">…</span>';
    const loFixed = TmUtils.formatR5(lo), hiFixed = TmUtils.formatR5(hi);
    if (loFixed === hiFixed)
        return `<span class="tms-range-wrap tmu-tabular"><span class="tms-strong-val tmu-tabular">${hiFixed}</span></span>`;
    return `<span class="tms-range-wrap tmu-tabular">` +
        `<span class="tms-range-val tmu-tabular">${loFixed}</span>` +
        `<span class="tms-range-sep">–</span>` +
        `<span class="tms-range-val tmu-tabular">${hiFixed}</span></span>`;
}

const MOUNT_OPTIONS = {
    columns: { rtn: false, colorize: false },
    sortKey: 'timeleft',
    sortDir: 1,
    onRowClick: null,
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

