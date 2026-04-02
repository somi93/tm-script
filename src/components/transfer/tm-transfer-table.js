import { TmConst } from '../../lib/tm-constants.js';
import { TmLib } from '../../lib/tm-lib.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmTable } from '../shared/tm-table.js';

/**
 * tm-transfer-table.js — Transfer table formatters and HTML builders
 *
 * Exposes: TmTransferTable
 *
 * Pure formatting and HTML builder functions for the transfer market table.
 * All builder functions that need tooltip data accept (p, tooltipCache)
 * so the main script can pass its local cache without coupling.
 *
 * Depends on: TmConst (for thresholds), TmLib (for getPositionIndex)
 */

// ─── Internal constants ────────────────────────────────────────────

const SKILL_NAMES = TmConst.SKILL_LABELS;
const GK_SKILLS = TmConst.SKILL_KEYS_GK;
const OUTFIELD_SKILLS = TmConst.SKILL_KEYS_OUT;
const POSITION_MAP = TmConst.POSITION_MAP || {};

const SKILL_LONG = {
    str: 'Strength', sta: 'Stamina', pac: 'Pace', mar: 'Marking', tac: 'Tackling',
    wor: 'Workrate', pos: 'Positioning', pas: 'Passing', cro: 'Crossing', tec: 'Technique',
    hea: 'Heading', fin: 'Finishing', lon: 'Longshots', set: 'Set Pieces',
    han: 'Handling', one: 'One on ones', ref: 'Reflexes', ari: 'Aerial',
    jum: 'Jumping', com: 'Communication', kic: 'Kicking', thr: 'Throwing',
};

const BREAKDOWN_COLS = [
    { key: 'posbar', label: '', sort: false, cls: 'tms-col-posbar' },
    { key: 'flag', label: '', sort: false, cls: 'tms-col-flag' },
    { key: 'name', label: 'Name', sort: true, cls: 'tms-col-name' },
    { key: 'age', label: 'Age', sort: true, cls: 'tms-col-age' },
    { key: 'fp', label: 'Pos', sort: false, cls: 'tms-col-c' },
    { key: 'r5', label: 'R5', sort: true, cls: 'tms-col-r' },
    { key: 'rec', label: 'Rec', sort: true, cls: 'tms-col-c' },
    { key: 'ti', label: 'TI', sort: true, cls: 'tms-col-r' },
    { key: 'asi', label: 'ASI', sort: true, cls: 'tms-col-r' },
    { key: 'bid', label: 'Bid', sort: true, cls: 'tms-col-r' },
    { key: 'time', label: 'Time', sort: true, cls: 'tms-col-r' },
    { key: 'act', label: '', sort: false, cls: '' },
];

// ─── Formatting helpers ────────────────────────────────────────────

const getColor = TmUtils.getColor;

function fmtNum(n) { return TmUtils.fmtCoins(n); }

function fmtRec(val) {
    const { REC_THRESHOLDS } = TmConst;
    if (val == null || val === '') return '<span class="tms-muted">—</span>';
    const num = parseFloat(val);
    const disp = Number.isInteger(num) ? String(num) : num.toFixed(2);
    const clr = getColor(num, REC_THRESHOLDS);
    return `<span class="tms-rec" style="border-color:${clr}44;color:${clr}">${disp}</span>`;
}

function tiHtml(ti) {
    const { TI_THRESHOLDS } = TmConst;
    if (ti === null || ti === undefined) return '<span class="tms-muted">—</span>';
    const clr = getColor(ti, TI_THRESHOLDS);
    return `<span class="tms-strong-val" style="color:${clr}">${ti.toFixed(1)}</span>`;
}

function fmtR5(r5) {
    const { R5_THRESHOLDS } = TmConst;
    if (r5 == null) return '<span class="tms-tip-pending">…</span>';
    const clr = getColor(r5, R5_THRESHOLDS);
    return `<span class="tms-strong-val" style="color:${clr}">${r5.toFixed(1)}</span>`;
}

function fmtAge(ageFloat) {
    const years = Math.floor(ageFloat);
    const months = Math.round((ageFloat - years) * 100);
    return `<span class="tms-age-y">${years}.${months}</span>`;
}

function fmtPos(fp) {
    if (!fp || !fp.length) return '-';
    const sorted = [...fp].sort((a, b) => TmLib.getPositionIndex(a) - TmLib.getPositionIndex(b));
    return TmPosition.chip(sorted);
}

const skillColor = TmUtils.skillColor;

function fmtR5Range(lo, hi) {
    const { R5_THRESHOLDS } = TmConst;
    if (lo == null || hi == null) return '<span class="tms-tip-pending">…</span>';
    const loFixed = lo.toFixed(1), hiFixed = hi.toFixed(1);
    const clrLo = getColor(lo, R5_THRESHOLDS);
    const clrHi = getColor(hi, R5_THRESHOLDS);
    if (loFixed === hiFixed)
        return `<span class="tms-range-wrap"><span class="tms-strong-val" style="color:${clrHi}">${hiFixed}</span></span>`;
    return `<span class="tms-range-wrap">` +
        `<span class="tms-range-val" style="color:${clrLo}">${loFixed}</span>` +
        `<span class="tms-range-sep">–</span>` +
        `<span class="tms-range-val" style="color:${clrHi}">${hiFixed}</span></span>`;
}

// ─── HTML builders ─────────────────────────────────────────────────

function buildBidBtn(p, tooltipCache) {
    const nameJs = (p.name_js || p.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const fetched = tooltipCache[p.id] && !tooltipCache[p.id].estimated;
    const reloadBtn = fetched ? '' : TmUI.button({
        label: '↻',
        variant: 'icon',
        color: 'secondary',
        title: 'Fetch stats',
        attrs: { 'data-pid': p.id, 'data-transfer-reload': '' },
    }).outerHTML;
    const bidBtn = TmUI.button({
        label: 'Bid',
        color: 'secondary',
        size: 'xs',
        title: 'Place Bid',
        attrs: {
            onclick: `event.stopPropagation();tlpop_pop_transfer_bid('${p.next_bid || 0}',${p.pro || 0},'${p.id}','${nameJs}')`,
        },
    }).outerHTML;
    return `${reloadBtn}${bidBtn}`;
}

function buildPlayerRow(p, tooltipCache) {
    const nameLink = `<a href="/players/${p.id}/" target="_blank" onclick="event.stopPropagation()">${p.name || p.id}</a>`;
    const timeId = `tms-td-${p.id}`;
    const timeTd = p.time > 0 ? `<span id="${timeId}" class="tms-time-cell"></span>` : '—';
    const bidCls = `bid_${p.id}`;
    const cachedTip = tooltipCache[p.id];
    const recHtml = cachedTip
        ? fmtRec(cachedTip.recCalc != null ? cachedTip.recCalc : cachedTip.recSort)
        : fmtRec(p.rec);

    const barClr = p.fp && p.fp.length
        ? (() => {
            const str = p.fp[0];
            if (str === 'gk') return 'var(--tmu-success-strong)';
            const pos = str.replace(/[lcrk]$/, '');
            return POSITION_MAP[str]?.color || POSITION_MAP[pos]?.color || 'var(--tmu-text-dim)';
        })()
        : 'var(--tmu-text-dim)';

    const noteIcon = p.txt ? `<span class="tms-note-icon" data-note="${p.txt.replace(/"/g, '&quot;')}">📋</span>` : '';

    return `<tr class="tms-player-row${p.bump ? ' tms-bump' : ''}" id="player_row_${p.id}" data-pid="${p.id}">
  <td class="tms-pos-bar" style="background:${barClr}"></td>
  <td class="tms-col-flag">${p.flag || ''}</td>
  <td class="tms-col-name">${nameLink}</td>
  <td class="tms-col-age">${fmtAge(p.age)}</td>
  <td class="tms-col-c">${fmtPos(p.fp)}</td>
  <td class="tms-col-r" id="tms-r5-${p.id}">${cachedTip && cachedTip.r5 != null ? fmtR5(cachedTip.r5)
            : cachedTip && (cachedTip.r5Lo != null || cachedTip.r5Hi != null) ? fmtR5Range(cachedTip.r5Lo, cachedTip.r5Hi)
                : '<span class="tms-tip-pending">…</span>'
        }</td>
  <td class="tms-col-c" id="tms-rec-${p.id}">${recHtml}</td>
  <td class="tms-col-r" id="tms-ti-${p.id}">${cachedTip ? tiHtml(cachedTip.ti) : '<span class="tms-tip-pending">…</span>'}</td>
    <td class="tms-col-r tms-col-asi">${p.asi ? fmtNum(p.asi) : '—'}</td>
  <td class="tms-col-r ${bidCls}">${fmtNum(p.bid) || '—'}</td>
  <td class="tms-col-r">${timeTd}</td>
  <td>${buildBidBtn(p, tooltipCache)}${noteIcon}</td>
</tr>`;
}

function bindSharedSort(tableWrap, onSort) {
    tableWrap._tmsTransferSortHandler = typeof onSort === 'function' ? onSort : null;
    if (tableWrap.dataset.tmsTransferSortBound === '1') return;

    tableWrap.dataset.tmsTransferSortBound = '1';
    tableWrap.addEventListener('click', (event) => {
        const sortHandler = tableWrap._tmsTransferSortHandler;
        const header = event.target.closest('th[data-sk]');
        if (!sortHandler || !header || !tableWrap.contains(header)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        sortHandler(header.dataset.sk);
    }, true);
}

function breakdownHeaders() {
    return BREAKDOWN_COLS.map(col => ({
        key: col.key,
        label: col.label,
        sortable: !!col.sort,
        thCls: col.cls || '',
    }));
}

function createBreakdownTableElement(players, sortKey, sortDir, tooltipCache, onSort) {
    const wrap = TmTable.table({
        headers: breakdownHeaders(),
        items: players,
        sortKey,
        sortDir,
        cls: 'tms-table',
        renderRowsHtml: (sortedPlayers) => sortedPlayers.map(player => buildPlayerRow(player, tooltipCache)).join(''),
        afterRender: ({ wrap: tableWrap, table }) => {
            table.id = 'tms-table';
            bindSharedSort(tableWrap, onSort);
        },
    });

    wrap.classList.add('tms-table-wrap');
    return wrap;
}

function createSkillsTableElement(skillKeys, skillLabels, sortKey, sortDir, onSort) {
    const wrap = TmTable.table({
        headers: [
            { key: 'posbar', label: '', sortable: false, thCls: 'tms-col-posbar' },
            { key: 'flag', label: '', sortable: false, thCls: 'tms-col-flag' },
            { key: 'name', label: 'Name' },
            { key: 'age', label: 'Age' },
            { key: 'fp', label: 'Pos', sortable: false },
            ...skillKeys.map(skillKey => ({ key: `skill-${skillKey}`, label: skillLabels[skillKey], sortable: false })),
            { key: 'time', label: 'Time' },
            { key: 'act', label: '', sortable: false },
        ],
        items: [],
        sortKey,
        sortDir,
        cls: 'tms-table',
        renderRowsHtml: () => '',
        afterRender: ({ wrap: tableWrap, table }) => {
            table.id = 'tms-table';
            bindSharedSort(tableWrap, onSort);
        },
    });

    wrap.classList.add('tms-table-wrap');
    return wrap;
}

function buildExpandRow(p, tooltipCache, colCount, skillsMode) {
    const gk = p._gk;
    const skills = gk ? GK_SKILLS : OUTFIELD_SKILLS;
    const ss = p._ss;
    const ageP = p._ageP;
    const tip = tooltipCache[p.id];

    const skillCells = skills.map(s => {
        const val = (tip && tip.skills && tip.skills[s] != null) ? tip.skills[s] : (p[s] || 0);
        const pct = (val / 20) * 100;
        const clr = skillColor(val);
        return `<div class="tms-skill-cell">
  <span class="tms-sk-name">${SKILL_NAMES[s]}</span>
  <div class="tms-sk-bar"><div class="tms-sk-fill" style="width:${pct}%;background:${clr}"></div></div>
  <span class="tms-sk-val" style="color:${clr}">${val || '—'}</span>
</div>`;
    }).join('');

    const bidN = fmtNum(p.bid);
    const recDisp = tip
        ? fmtRec(tip.recCalc != null ? tip.recCalc : tip.recSort)
        : fmtRec(p.rec);
    const r5Disp = tip
        ? (tip.r5 != null ? fmtR5(tip.r5) : fmtR5Range(tip.r5Lo, tip.r5Hi))
        : '<span class="tms-muted">Loading…</span>';
    const tiDisp = tip ? tiHtml(tip.ti) : '<span class="tms-muted">Loading…</span>';
    const skillNote = tip ? '(from tooltip)' : '(transfer list stars)';

    return `<tr class="tms-expand-row">
  <td colspan="${colCount}">
    <div class="tms-expand-inner">
      <div class="tms-expand-skills">
        <div class="tms-exp-head">Skills — ${ss.count}/${ss.total} scouted &nbsp;<span class="tms-expand-note">${skillNote}</span></div>
        <div class="tms-skill-grid">${skillCells}</div>
      </div>
      <div class="tms-expand-analysis">
        <div class="tms-exp-head">Analysis</div>
        <div class="tms-an-row"><span class="tms-an-lbl">Age</span><span class="tms-an-val">${ageP.years}.${ageP.months}</span></div>
        <div class="tms-an-row"><span class="tms-an-lbl">ASI</span><span class="tms-an-val">${p.asi ? fmtNum(p.asi) : '—'}</span></div>
        <div class="tms-an-row"><span class="tms-an-lbl">Rec</span><span class="tms-an-val">${recDisp}</span></div>
        <div class="tms-an-row"><span class="tms-an-lbl">R5</span><span class="tms-an-val">${r5Disp}</span></div>
        <div class="tms-an-row"><span class="tms-an-lbl">TI / session</span><span class="tms-an-val">${tiDisp}</span></div>
        <div class="tms-an-row"><span class="tms-an-lbl">Current Bid</span><span class="tms-an-val">${bidN}</span></div>
        <div class="tms-an-row"><span class="tms-an-lbl">Position</span><span class="tms-an-val">${(p.fp || []).join(', ')}</span></div>
        <div class="tms-an-row"><span class="tms-an-lbl">Type</span><span class="tms-an-val">${gk ? 'Goalkeeper' : 'Outfield'}</span></div>
      </div>
    </div>
  </td>
</tr>`;
}

function adaptForTooltip(p, tooltipCache) {
    const { R5_THRESHOLDS, REC_THRESHOLDS, TI_THRESHOLDS } = TmConst;
    const tip = tooltipCache[p.id];
    const gk = p._gk;
    const skillKeys = gk ? GK_SKILLS : OUTFIELD_SKILLS;
    const ageP = p._ageP || {};

    const positions = (p.fp || []).map(s => {
        if (s === 'gk') return { position: 'GK' };
        const side = s.slice(-1);
        const base = s.slice(0, s.length - 1);
        const sl = { l: 'L', c: 'C', r: 'R', k: '' }[side] || '';
        return { position: base.toUpperCase() + sl };
    });

    const skills = skillKeys.map(key => ({
        name: SKILL_LONG[key] || key,
        value: (tip && tip.skills) ? (tip.skills[key] ?? null) : null,
    }));

    const recVal = tip ? (tip.recCalc != null ? tip.recCalc : tip.recSort) : null;
    const r5 = tip ? tip.r5 : null;
    const r5Lo = tip ? tip.r5Lo : null;
    const r5Hi = tip ? tip.r5Hi : null;
    const ti = tip ? tip.ti : null;
    const r5FooterVal = r5 ?? r5Hi;
    const r5FooterDisp = r5 != null ? r5.toFixed(1)
        : r5Hi != null
            ? (r5Lo != null && r5Lo.toFixed(1) !== r5Hi.toFixed(1)
                ? r5Lo.toFixed(1) + '\u2013' + r5Hi.toFixed(1)
                : r5Hi.toFixed(1))
            : '\u2026';

    return {
        name: p.name || String(p.id),
        positions,
        no: 0,
        ageMonthsString: `${ageP.years || '?'}.${String(ageP.months || 0).padStart(2, '0')}`,
        r5,
        r5Range: (r5 == null && (r5Lo != null || r5Hi != null)) ? { lo: r5Lo, hi: r5Hi } : null,
        ti,
        isGK: gk,
        skills,
        asi: p.asi || 0,
        rec: recVal,
        routine: null,
        note: p.txt || null,
        footerStats: [
            { val: r5FooterDisp, lbl: 'R5', color: r5FooterVal != null ? getColor(r5FooterVal, R5_THRESHOLDS) : 'var(--tmu-text-faint)' },
            { val: recVal != null ? recVal.toFixed(2) : '\u2026', lbl: 'Rec', color: recVal != null ? getColor(recVal, REC_THRESHOLDS) : 'var(--tmu-text-faint)' },
            { val: ti != null ? ti.toFixed(1) : '\u2026', lbl: 'TI', color: ti != null ? getColor(ti, TI_THRESHOLDS) : 'var(--tmu-text-faint)' },
            { val: fmtNum(p.asi) || '\u2014', lbl: 'ASI', color: 'var(--tmu-text-strong)' },
            { val: fmtNum(p.bid) || '\u2014', lbl: 'Bid', color: 'var(--tmu-text-main)' },
        ],
    };
}

export const TmTransferTable = {
    BREAKDOWN_COLS,
    // Formatters
    fmtRec,
    tiHtml,
    fmtR5,
    fmtR5Range,
    // Builders
    createBreakdownTableElement,
    createSkillsTableElement,
    buildExpandRow,
    adaptForTooltip,
};

