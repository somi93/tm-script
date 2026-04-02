import { TmButton } from './tm-button.js';
import { TmTable } from './tm-table.js';

const STYLE_ID = 'tmvu-standings-table-style';
const htmlOf = (node) => node ? node.outerHTML : '';
const buttonHtml = (opts) => htmlOf(TmButton.button(opts));

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-standings-wrap {
            border: 1px solid var(--tmu-border-input-overlay);
            border-radius: var(--tmu-space-md);
            overflow: hidden;
            background: var(--tmu-surface-dark-soft);
        }

        .tmvu-standings-group + .tmvu-standings-group {
            border-top: 1px solid var(--tmu-border-input-overlay);
        }

        .tmvu-standings-group-title {
            padding: var(--tmu-space-md) var(--tmu-space-md);
            background: var(--tmu-surface-input-dark-focus);
            border-bottom: 1px solid var(--tmu-border-input-overlay);
            color: var(--tmu-text-strong);
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
            background: var(--tmu-compare-bar-bg);
            border-bottom: 1px solid var(--tmu-border-input-overlay);
        }

        .tsa-table th {
            padding: var(--tmu-space-sm) var(--tmu-space-md);
            text-align: right;
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: var(--tmu-text-panel-label);
            background: var(--tmu-surface-card-soft);
            border-bottom: 1px solid var(--tmu-border-input-overlay);
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
            padding: var(--tmu-space-sm) var(--tmu-space-md);
            text-align: right;
            border-bottom: 1px solid var(--tmu-border-faint);
            font-variant-numeric: tabular-nums;
            color: var(--tmu-text-main);
        }

        .tsa-table td.tsa-left {
            text-align: left;
        }

        .tsa-table tr.tsa-even {
            background: var(--tmu-surface-panel);
        }

        .tsa-table tr.tsa-odd {
            background: var(--tmu-surface-card-soft);
        }

        .tsa-table tbody tr:hover {
            background: var(--tmu-surface-tab-hover) !important;
        }

        .tsa-rank {
            color: var(--tmu-text-faint);
            font-size: 12px;
        }

        .std-me {
            background: var(--tmu-success-fill-faint) !important;
            box-shadow: inset 3px 0 0 var(--tmu-success);
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

        .tsa-club-cell {
            color: var(--tmu-text-strong);
            font-weight: 500;
            white-space: nowrap;
            padding-top: var(--tmu-space-sm);
            padding-bottom: var(--tmu-space-sm);
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
            margin-right: var(--tmu-space-xs);
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

function buildHtml({ rows = [], liveZoneMap = {}, isFiltered = false, showForm = false, formHtml = () => '', canOlder = false, canNewer = false } = {}) {
    injectStyles();

    const headerForm = showForm
        ? `${buttonHtml({ id: 'std-form-older', label: '‹', color: 'secondary', size: 'xs', disabled: !canOlder, attrs: { style: 'padding:0 var(--tmu-space-xs);font-size:14px;line-height:16px;margin-right:var(--tmu-space-xs)' } })}Form${buttonHtml({ id: 'std-form-newer', label: '›', color: 'secondary', size: 'xs', disabled: !canNewer, attrs: { style: 'padding:0 var(--tmu-space-xs);font-size:14px;line-height:16px;margin-left:var(--tmu-space-xs)' } })}`
        : '';

    const headers = [
        { key: 'rank', label: '#', sortable: false, thCls: 'tsa-left', cls: 'tsa-left tsa-rank', width: '44px', render: (_value, row) => `<span style="background:${zoneBg(isFiltered ? (liveZoneMap[row.rank] || '') : row.zone)};color:${zoneColor(isFiltered ? (liveZoneMap[row.rank] || '') : row.zone) || 'var(--tmu-text-faint)'};font-weight:700;padding-top:var(--tmu-space-sm);padding-bottom:var(--tmu-space-sm);display:block">${escapeHtml(row.rank)}</span>` },
        {
            key: 'clubName',
            label: 'Club',
            sortable: false,
            thCls: 'tsa-left',
            cls: 'tsa-left tsa-club-cell',
            render: (_value, row) => {
                const clubHref = row.clubId ? `/club/${row.clubId}/` : '';
                const clubLogo = row.clubId
                    ? `<img class="tsa-club-logo" src="/pics/club_logos/${escapeHtml(row.clubId)}_25.png" onerror="this.style.visibility='hidden'">`
                    : '';
                return `${clubLogo}${clubHref ? `<a class="tsa-club-link" href="${clubHref}">${escapeHtml(row.clubName)}</a>` : escapeHtml(row.clubName)}`;
            },
        },
        { key: 'gp', label: 'Gp', sortable: false, align: 'r', width: '50px', title: 'Games played' },
        { key: 'w', label: 'W', sortable: false, align: 'r', width: '50px', title: 'Won', render: (value) => `<span style="color:var(--tmu-success);font-weight:700">${escapeHtml(value)}</span>` },
        { key: 'd', label: 'D', sortable: false, align: 'r', width: '50px', title: 'Drawn', render: (value) => `<span style="color:var(--tmu-warning)">${escapeHtml(value)}</span>` },
        { key: 'l', label: 'L', sortable: false, align: 'r', width: '50px', title: 'Lost', render: (value) => `<span style="color:var(--tmu-danger)">${escapeHtml(value)}</span>` },
        { key: 'gf', label: 'GF', sortable: false, align: 'r', width: '54px', title: 'Goals for' },
        { key: 'ga', label: 'GA', sortable: false, align: 'r', width: '54px', title: 'Goals against' },
        { key: 'pts', label: 'Pts', sortable: false, align: 'r', width: '54px', title: 'Points', render: (value) => `<span style="font-weight:700;color:var(--tmu-text-strong)">${escapeHtml(value)}</span>` },
    ];

    if (showForm) {
        headers.push({
            key: 'form',
            label: headerForm,
            sortable: false,
            align: 'r',
            thCls: 'tsa-form-head',
            cls: 'tsa-form-cell',
            width: '124px',
            render: (_value, row) => formHtml(row.form || [], row.playedCount || 0),
        });
    }

    const table = TmTable.table({
        cls: ' tsa-table',
        items: rows,
        headers,
        rowCls: (row, index) => {
            const nextRow = rows[index + 1];
            const nextZone = isFiltered ? (liveZoneMap[nextRow?.rank] || null) : (nextRow?.zone ?? null);
            const sepClass = isFiltered ? '' : (() => {
                if (row.zone === nextZone || nextZone === null) return '';
                if (nextZone === 'rel') return ' std-sep-red';
                if (nextZone === 'rel-po') return ' std-sep-orange';
                if (row.zone === 'promo' || row.zone === 'promo-po') return ' std-sep-green';
                return '';
            })();
            return `${index % 2 === 0 ? 'tsa-even' : 'tsa-odd'}${row.isMe ? ' std-me' : ''}${sepClass}`;
        },
        rowAttrs: (row) => ({ 'data-club': escapeHtml(row.clubId ?? '') }),
    });

    return table.outerHTML;
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