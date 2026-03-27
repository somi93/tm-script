import { TmButton } from './tm-button.js';

const STYLE_ID = 'tmvu-standings-table-style';
const htmlOf = (node) => node ? node.outerHTML : '';
const buttonHtml = (opts) => htmlOf(TmButton.button(opts));

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-standings-wrap {
            border: 1px solid rgba(61,104,40,0.22);
            border-radius: 10px;
            overflow: hidden;
            background: rgba(12,24,9,0.28);
        }

        .tmvu-standings-group + .tmvu-standings-group {
            border-top: 1px solid rgba(61,104,40,0.22);
        }

        .tmvu-standings-group-title {
            padding: 10px 12px;
            background: rgba(19,40,10,0.92);
            border-bottom: 1px solid rgba(61,104,40,0.22);
            color: #e8f5d8;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .tsa-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            table-layout: auto;
        }

        .tsa-table thead tr {
            background: rgba(0,0,0,0.18);
            border-bottom: 1px solid rgba(61,104,40,0.34);
        }

        .tsa-table th {
            padding: 7px 10px;
            text-align: right;
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #7faa62;
            background: #13280a;
            border-bottom: 1px solid rgba(61,104,40,0.34);
            user-select: none;
            transition: color 0.15s;
            white-space: nowrap;
        }

        .tsa-table th.tsa-left {
            text-align: left;
        }

        .tsa-table th:not(.tsa-left),
        .tsa-table td:not(.tsa-left) {
            text-align: right;
        }

        .tsa-table td {
            padding: 6px 10px;
            text-align: right;
            border-bottom: 1px solid rgba(42,74,28,0.4);
            font-variant-numeric: tabular-nums;
            color: #c8e0b4;
        }

        .tsa-table td.tsa-left {
            text-align: left;
        }

        .tsa-table tr.tsa-even {
            background: #19310e;
        }

        .tsa-table tr.tsa-odd {
            background: #14280a;
        }

        .tsa-table tbody tr:hover {
            background: #244114 !important;
        }

        .tsa-rank {
            color: #6a9a58;
            font-size: 12px;
        }

        .std-me {
            background: rgba(108,192,64,0.10) !important;
            box-shadow: inset 3px 0 0 rgba(108,192,64,0.55);
        }

        .std-sep-green td {
            border-bottom: 2px solid #4ade80 !important;
        }

        .std-sep-orange td {
            border-bottom: 2px solid #fb923c !important;
        }

        .std-sep-red td {
            border-bottom: 2px solid #ef4444 !important;
        }

        .tsa-club-cell {
            color: #f4f8f0;
            font-weight: 500;
            white-space: nowrap;
            padding-top: 8px;
            padding-bottom: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }

        .tsa-club-link {
            color: inherit;
            text-decoration: none;
        }

        .tsa-club-link:hover {
            text-decoration: underline;
        }

        .tsa-club-logo {
            width: 18px;
            height: 18px;
            vertical-align: middle;
            margin-right: 4px;
            flex-shrink: 0;
        }

        .tsa-form-head,
        .tsa-form-cell {
            white-space: nowrap;
        }

        .tsa-form-cell {
            min-width: 124px;
        }
    `;

    document.head.appendChild(style);
}

function zoneColor(zone) {
    if (zone === 'promo') return '#4ade80';
    if (zone === 'promo-po') return '#fbbf24';
    if (zone === 'rel-po') return '#fb923c';
    if (zone === 'rel') return '#ef4444';
    return null;
}

function zoneBg(zone) {
    if (zone === 'promo') return 'rgba(74,222,128,0.18)';
    if (zone === 'promo-po') return 'rgba(251,191,36,0.18)';
    if (zone === 'rel-po') return 'rgba(251,146,60,0.18)';
    if (zone === 'rel') return 'rgba(239,68,68,0.18)';
    return 'transparent';
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildHtml({ rows = [], liveZoneMap = {}, isFiltered = false, showForm = false, formHtml = () => '', canOlder = false, canNewer = false } = {}) {
    injectStyles();

    const headerForm = showForm
        ? `<th class="tsa-right tsa-form-head" style="padding-left:6px;white-space:nowrap">
                ${buttonHtml({ id: 'std-form-older', label: '‹', color: 'secondary', size: 'xs', disabled: !canOlder, attrs: { style: 'padding:0 5px;font-size:14px;line-height:16px;margin-right:4px' } })}
                Form
                ${buttonHtml({ id: 'std-form-newer', label: '›', color: 'secondary', size: 'xs', disabled: !canNewer, attrs: { style: 'padding:0 5px;font-size:14px;line-height:16px;margin-left:4px' } })}
           </th>`
        : '';

    let html = `<table class="tsa-table">
        <colgroup>
            <col style="width:44px">
            <col style="width:auto">
            <col style="width:50px">
            <col style="width:50px">
            <col style="width:50px">
            <col style="width:50px">
            <col style="width:54px">
            <col style="width:54px">
            <col style="width:54px">
            ${showForm ? '<col style="width:124px">' : ''}
        </colgroup>
        <thead>
            <tr>
                <th class="tsa-left" style="width:24px">#</th>
                <th class="tsa-left">Club</th>
                <th title="Games played">Gp</th>
                <th title="Won">W</th>
                <th title="Drawn">D</th>
                <th title="Lost">L</th>
                <th title="Goals for">GF</th>
                <th title="Goals against">GA</th>
                <th title="Points">Pts</th>
                ${headerForm}
            </tr>
        </thead>
        <tbody>`;

    rows.forEach((row, index) => {
        const effectiveZone = isFiltered ? (liveZoneMap[row.rank] || '') : row.zone;
        const nextZone = isFiltered ? (liveZoneMap[rows[index + 1]?.rank] || null) : (rows[index + 1]?.zone ?? null);
        const sepClass = isFiltered ? '' : (() => {
            if (row.zone === nextZone || nextZone === null) return '';
            if (nextZone === 'rel') return ' std-sep-red';
            if (nextZone === 'rel-po') return ' std-sep-orange';
            if (row.zone === 'promo' || row.zone === 'promo-po') return ' std-sep-green';
            return '';
        })();
        const rowClass = `${index % 2 === 0 ? 'tsa-even' : 'tsa-odd'}${row.isMe ? ' std-me' : ''}${sepClass}`;
        const clubHref = row.clubId ? `/club/${row.clubId}/` : '';
        const clubLogo = row.clubId
            ? `<img class="tsa-club-logo" src="/pics/club_logos/${escapeHtml(row.clubId)}_25.png" onerror="this.style.visibility='hidden'">`
            : '';

        html += `<tr class="${rowClass}" data-club="${escapeHtml(row.clubId ?? '')}">
            <td class="tsa-left tsa-rank" style="background:${zoneBg(effectiveZone)};color:${zoneColor(effectiveZone) || '#6a9a58'};font-weight:700;padding-top:8px;padding-bottom:8px">${escapeHtml(row.rank)}</td>
            <td class="tsa-left tsa-club-cell">${clubLogo}${clubHref ? `<a class="tsa-club-link" href="${clubHref}">${escapeHtml(row.clubName)}</a>` : escapeHtml(row.clubName)}</td>
            <td>${escapeHtml(row.gp)}</td>
            <td style="color:#4ade80;font-weight:700">${escapeHtml(row.w)}</td>
            <td style="color:#fde68a">${escapeHtml(row.d)}</td>
            <td style="color:#fca5a5">${escapeHtml(row.l)}</td>
            <td>${escapeHtml(row.gf)}</td>
            <td>${escapeHtml(row.ga)}</td>
            <td style="font-weight:700;color:#e8f5d8">${escapeHtml(row.pts)}</td>
            ${showForm ? `<td class="tsa-right tsa-form-cell" style="padding-left:6px">${formHtml(row.form || [], row.playedCount || 0)}</td>` : ''}
        </tr>`;
    });

    html += '</tbody></table>';
    return html;
}

function buildGroupedHtml({ groups = [] } = {}) {
    injectStyles();

    const validGroups = groups.filter(group => Array.isArray(group?.rows) && group.rows.length);
    if (!validGroups.length) return '';

    return `
        <div class="tmvu-standings-wrap">
            ${validGroups.map(group => `
                <section class="tmvu-standings-group">
                    ${group.title ? `<div class="tmvu-standings-group-title">${escapeHtml(group.title)}</div>` : ''}
                    ${buildHtml({ rows: group.rows })}
                </section>
            `).join('')}
        </div>
    `;
}

export const TmStandingsTable = { injectStyles, buildHtml, buildGroupedHtml };