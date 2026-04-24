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
            overflow: hidden;
            background: var(--tmu-surface-dark-soft);
            border: 1px solid var(--tmu-border-soft-alpha-mid);
        }

        .tmvu-standings-wrap table {
            width: 100%;
            border-collapse: collapse;
        }

        .tmvu-standings-wrap tr { background: transparent !important; }
        .tmvu-standings-wrap tr:nth-child(even) { background: var(--tmu-border-contrast) !important; }

        .tmvu-standings-wrap td,
        .tmvu-standings-wrap th {
            border: 0;
            border-bottom: 1px solid var(--tmu-border-soft-alpha);
            padding: var(--tmu-space-md) var(--tmu-space-sm);
            color: var(--tmu-text-main);
            font-size: var(--tmu-font-sm);
            text-align: center;
        }

        .tmvu-standings-wrap th {
            color: var(--tmu-text-faint);
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        .tmvu-standings-wrap td.std-left,
        .tmvu-standings-wrap th.std-left {
            text-align: left;
        }

        .tmvu-standings-wrap td.std-right,
        .tmvu-standings-wrap th.std-right {
            text-align: right;
        }

        .tmvu-standings-wrap td.std-left {
            min-width: 160px;
        }

        .std-club-cell {
            display: inline-flex;
            align-items: center;
            gap: var(--tmu-space-xs);
        }

        .tmvu-standings-wrap a {
            color: var(--tmu-text-strong);
            text-decoration: none;
        }

        .tmvu-standings-wrap a:hover {
            text-decoration: underline;
        }

        .tmvu-standings-group + .tmvu-standings-group {
            border-top: 1px solid var(--tmu-border-input-overlay);
        }

        .tmvu-standings-group-title {
            padding: var(--tmu-space-md) var(--tmu-space-md);
            background: var(--tmu-surface-input-dark-focus);
            border-bottom: 1px solid var(--tmu-border-input-overlay);
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-sm);
            font-weight: 800;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .std-me td {
            background: var(--tmu-success-fill-soft) !important;
            color: var(--tmu-text-strong);
            font-weight: 700;
        }

        .std-sep-green td {
            border-bottom: 2px solid var(--tmu-success) !important;
        }

        .std-sep-orange td {
            border-bottom: 2px solid var(--tmu-warning-soft) !important;
        }

        .std-sep-red td {
            border-bottom: 2px solid var(--tmu-danger) !important;
        }

        .std-rank-cell {
            padding: 0 !important;
            text-align: center !important;
            width: 36px;
            position: relative;
        }

        .std-rank-inner {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
        }

        .std-club-logo {
            width: 21px;
            height: 21px;
            vertical-align: middle;
            margin-right: var(--tmu-space-xs);
            flex-shrink: 0;
        }

        .std-form-head,
        .std-form-cell {
            white-space: nowrap;
        }

        .std-form-cell {
            min-width: 124px;
        }
    `;

    document.head.appendChild(style);
}

function zoneColor(zone) {
    if (zone === 'promo') return 'var(--tmu-success)';
    if (zone === 'promo-po') return 'var(--tmu-warning)';
    if (zone === 'rel-po') return 'var(--tmu-warning-soft)';
    if (zone === 'rel') return 'var(--tmu-danger)';
    return null;
}

function zoneBg(zone) {
    if (zone === 'promo') return 'var(--tmu-success-fill-hover)';
    if (zone === 'promo-po') return 'var(--tmu-warning-fill)';
    if (zone === 'rel-po') return 'var(--tmu-highlight-fill)';
    if (zone === 'rel') return 'var(--tmu-danger-fill)';
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

function buildHtml({ rows = [], liveZoneMap = {}, isFiltered = false, showForm = false, formHtml = () => '', canOlder = false, canNewer = false, promotionCount = 1, nameLabel = 'Club' } = {}) {
    injectStyles();

    const headerForm = showForm
        ? `${buttonHtml({ id: 'std-form-older', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>', color: 'secondary', size: 'xs', disabled: !canOlder, attrs: { style: 'margin-right:var(--tmu-space-xs)' } })}Form${buttonHtml({ id: 'std-form-newer', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>', color: 'secondary', size: 'xs', disabled: !canNewer, attrs: { style: 'margin-left:var(--tmu-space-xs)' } })}`
        : '';

    const headCells = [
        `<th class="std-rank-cell" style="width:36px">#</th>`,
        `<th class="std-left" style="min-width:320px">${escapeHtml(nameLabel)}</th>`,
        `<th class="std-right" style="width:38px" title="Games played">Gp</th>`,
        `<th class="std-right" style="width:38px" title="Won">W</th>`,
        `<th class="std-right" style="width:38px" title="Drawn">D</th>`,
        `<th class="std-right" style="width:38px" title="Lost">L</th>`,
        `<th class="std-right" style="width:42px" title="Goals for">GF</th>`,
        `<th class="std-right" style="width:42px" title="Goals against">GA</th>`,
        `<th class="std-right" style="width:42px" title="Points">Pts</th>`,
        ...(showForm ? [`<th class="std-right std-form-head" style="width:110px">${headerForm}</th>`] : []),
    ];

    const bodyRows = rows.map((row, index) => {
        let bg, color;
        if (row.rank <= promotionCount) {
            bg = 'var(--tmu-success-fill-hover)'; color = 'var(--tmu-success)';
        } else if (row.rank <= 4) {
            bg = 'rgba(56,189,248,0.10)'; color = 'var(--tmu-info-strong)';
        } else {
            const zone = isFiltered ? (liveZoneMap[row.rank] || '') : row.zone;
            bg = zoneBg(zone); color = zoneColor(zone) || 'var(--tmu-text-faint)';
        }
        const delta = row.rankDelta;
        const deltaHtml = delta
            ? `<span style="position:absolute;bottom:2px;right:2px;font-size:10px;line-height:1;font-weight:900;color:${delta > 0 ? 'var(--tmu-success-strong)' : 'var(--tmu-danger-strong)'}">${delta > 0 ? '▲' : '▼'}</span>`
            : '';

        const rankCell = `<td class="std-rank-cell"><div class="std-rank-inner" style="background:${bg};color:${color};">${escapeHtml(row.rank)}${deltaHtml}</div></td>`;

        let clubInner;
        if (row.nameHtml) {
            clubInner = row.nameHtml;
        } else {
            const clubHref = row.clubId ? `/club/${row.clubId}/` : '';
            const clubLogo = row.clubId
                ? `<img class="std-club-logo" src="/pics/club_logos/${escapeHtml(row.clubId)}_25.png" onerror="this.style.visibility='hidden'">`
                : '';
            clubInner = `<span class="std-club-cell">${clubLogo}${clubHref ? `<a href="${clubHref}">${escapeHtml(row.clubName)}</a>` : escapeHtml(row.clubName)}</span>`;
        }
        const clubCell = `<td class="std-left">${clubInner}</td>`;

        const nextRow = rows[index + 1];
        const nextZone = isFiltered ? (liveZoneMap[nextRow?.rank] || null) : (nextRow?.zone ?? null);
        const sepClass = isFiltered ? '' : (() => {
            if (row.zone === nextZone || nextZone === null) return '';
            if (nextZone === 'rel') return ' std-sep-red';
            if (nextZone === 'rel-po') return ' std-sep-orange';
            if (row.zone === 'promo' || row.zone === 'promo-po') return ' std-sep-green';
            return '';
        })();
        const rowCls = `${row.isMe ? 'std-me' : ''}${sepClass}`.trim();

        const dataCells = [
            `<td class="std-right">${escapeHtml(row.gp)}</td>`,
            `<td class="std-right">${escapeHtml(row.w)}</td>`,
            `<td class="std-right">${escapeHtml(row.d)}</td>`,
            `<td class="std-right">${escapeHtml(row.l)}</td>`,
            `<td class="std-right">${escapeHtml(row.gf)}</td>`,
            `<td class="std-right">${escapeHtml(row.ga)}</td>`,
            `<td class="std-right">${escapeHtml(row.pts)}</td>`,
            ...(showForm ? [`<td class="std-right std-form-cell">${formHtml(row.form || [], row.playedCount || 0)}</td>`] : []),
        ];

        return `<tr${rowCls ? ` class="${rowCls}"` : ''} data-club="${escapeHtml(row.clubId ?? '')}">${rankCell}${clubCell}${dataCells.join('')}</tr>`;
    });

    return `<div class="tmvu-standings-wrap"><table><thead><tr>${headCells.join('')}</tr></thead><tbody>${bodyRows.join('')}</tbody></table></div>`;
}

function buildTableHtml(args) {
    // Returns just the <table> without the wrapper — used internally by buildGroupedHtml
    const full = buildHtml(args);
    const start = full.indexOf('<table');
    const end = full.lastIndexOf('</table>') + '</table>'.length;
    return full.slice(start, end);
}

function buildGroupedHtml({ groups = [], promotionCount = 1, ...opts } = {}) {
    injectStyles();

    const validGroups = groups.filter(group => Array.isArray(group?.rows) && group.rows.length);
    if (!validGroups.length) return '';

    return `
        <div class="tmvu-standings-wrap">
            ${validGroups.map(group => `
                <section class="tmvu-standings-group">
                    ${group.title ? `<div class="tmvu-standings-group-title">${escapeHtml(group.title)}</div>` : ''}
                    ${buildTableHtml({ rows: group.rows, promotionCount, ...opts })}
                </section>
            `).join('')}
        </div>
    `;
}

export const TmStandingsTable = { injectStyles, buildHtml, buildGroupedHtml };