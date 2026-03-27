import { TmUI } from '../shared/tm-ui.js';
import { TmApi } from '../../services/index.js';
import { TmUtils } from '../../lib/tm-utils.js';

const STYLE_ID = 'tmvu-nt-save-style';
const SCAN_SEASON_COUNT = 15;
const RESULT_COLUMNS = [
    { key: 'name', label: 'Player' },
    { key: 'clubName', label: 'Club' },
    { key: 'age', label: 'Age' },
    { key: 'asi', label: 'ASI' },
    { key: 'position', label: 'Pos' },
    { key: 'reasons', label: 'Reasons' },
    { key: 'sources', label: 'Sources' },
];

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const lowerText = (value) => cleanText(value).toLowerCase();
const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function normalizeCountryCode(value) {
    const raw = cleanText(value);
    if (!raw) return '';

    const bracketMatch = raw.match(/^\[([a-z]{2,3})\]$/i);
    if (bracketMatch) return lowerText(bracketMatch[1]);

    const hrefMatch = raw.match(/\/national-teams\/([a-z]{2,3})\//i);
    if (hrefMatch) return lowerText(hrefMatch[1]);

    const flagClassMatch = raw.match(/flag-img-([a-z]{2,3})/i);
    if (flagClassMatch) return lowerText(flagClassMatch[1]);

    return lowerText(raw);
}

function resolvePlayerCountryCode(player = {}) {
    return normalizeCountryCode(
        player?.country
        || player?.player_country
        || player?.nationality
        || player?.country_link
        || player?.country_html
        || player?.flag
        || ''
    );
}

function matchesTargetCountry(player, targetCountryCode) {
    return resolvePlayerCountryCode(player) === normalizeCountryCode(targetCountryCode);
}

const buttonHtml = (opts) => TmUI.button(opts).outerHTML;

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-nt-save-panel {
            margin-top: 12px;
            padding: 12px;
            border: 1px solid #28451d;
            border-radius: 8px;
            background: #1c3410;
            box-shadow: 0 0 9px #192a19;
        }

        .tmvu-nt-save-kicker {
            color: #8aac72;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .tmvu-nt-save-title {
            margin-top: 6px;
            color: #eef8e8;
            font-size: 13px;
            font-weight: 700;
        }

        .tmvu-nt-save-copy {
            margin-top: 6px;
            color: #90b878;
            font-size: 11px;
            line-height: 1.55;
        }

        .tmvu-nt-save-btn {
            width: 100%;
            margin-top: 10px;
            justify-content: center;
        }

        .tmvu-nt-save-mini {
            margin-top: 8px;
            min-height: 16px;
            color: #8aac72;
            font-size: 10px;
            line-height: 1.5;
        }

        .tmvu-side-menu-nav .tmu-list-item.tmvu-nt-save-action {
            color: #d7efbf;
            background: rgba(108, 192, 64, 0.08);
            font-weight: 700;
        }

        .tmvu-side-menu-nav .tmu-list-item.tmvu-nt-save-action:hover {
            background: rgba(108, 192, 64, 0.16);
            color: #eef8e8;
        }

        .tmvu-nt-save-inline-status {
            margin-top: 8px;
            padding: 8px 10px;
            border: 1px solid rgba(61, 104, 40, 0.24);
            border-radius: 8px;
            background: rgba(12, 24, 9, 0.3);
            color: #8aac72;
            font-size: 10px;
            line-height: 1.45;
        }

        .tmvu-nt-save-overlay {
            position: fixed;
            inset: 0;
            z-index: 10080;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 14px;
            background: rgba(4, 10, 3, 0.76);
            backdrop-filter: blur(4px);
        }

        .tmvu-nt-save-overlay[hidden] {
            display: none !important;
        }

        .tmvu-nt-save-dialog {
            width: min(1200px, calc(100vw - 20px));
            max-height: calc(100vh - 20px);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: linear-gradient(180deg, #17300f, #0f2209 72%);
            border: 1px solid rgba(74, 144, 48, 0.72);
            box-shadow: 0 28px 80px rgba(0, 0, 0, 0.48);
            color: #d9e7d1;
        }

        .tmvu-nt-save-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            padding: 18px 18px 12px;
            border-bottom: 1px solid rgba(61, 104, 40, 0.3);
        }

        .tmvu-nt-save-head h2 {
            margin: 4px 0 0;
            color: #f0f6ec;
            font-size: 20px;
            line-height: 1.15;
        }

        .tmvu-nt-save-head p {
            margin: 6px 0 0;
            color: #90b878;
            font-size: 12px;
        }

        .tmvu-nt-save-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .tmvu-nt-save-body {
            min-height: 0;
            overflow-y: auto;
            padding: 16px 18px 18px;
        }

        .tmvu-nt-save-status {
            padding: 10px 12px;
            border: 1px solid rgba(61, 104, 40, 0.26);
            background: rgba(12, 24, 9, 0.36);
            color: #d7ebc9;
            font-size: 12px;
        }

        .tmvu-nt-save-status strong {
            color: #eef8e8;
        }

        .tmvu-nt-save-progress {
            margin-top: 12px;
            padding: 12px;
            border: 1px solid rgba(61, 104, 40, 0.26);
            background: rgba(12, 24, 9, 0.34);
        }

        .tmvu-nt-save-progress-top {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 8px;
        }

        .tmvu-nt-save-progress-label {
            color: #d7ebc9;
            font-size: 12px;
            font-weight: 700;
        }

        .tmvu-nt-save-progress-meta {
            color: #8aac72;
            font-size: 11px;
        }

        .tmvu-nt-save-progress-track {
            height: 10px;
            overflow: hidden;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.06);
            box-shadow: inset 0 0 0 1px rgba(61, 104, 40, 0.22);
        }

        .tmvu-nt-save-progress-bar {
            width: 0%;
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, #4a9030, #80e048);
            transition: width 0.18s ease;
        }

        .tmvu-nt-save-progress-note {
            margin-top: 8px;
            color: #8aac72;
            font-size: 11px;
            line-height: 1.5;
        }

        .tmvu-nt-save-summary {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
            margin-top: 14px;
        }

        .tmvu-nt-save-metric {
            padding: 12px;
            border: 1px solid rgba(61, 104, 40, 0.26);
            background: rgba(12, 24, 9, 0.32);
        }

        .tmvu-nt-save-metric-label {
            color: #8aac72;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .tmvu-nt-save-metric-value {
            margin-top: 6px;
            color: #eef8e8;
            font-size: 20px;
            font-weight: 800;
        }

        .tmvu-nt-save-result-table {
            width: 100%;
            margin-top: 14px;
            border-collapse: collapse;
            border: 1px solid rgba(61, 104, 40, 0.22);
            background: rgba(12, 24, 9, 0.32);
        }

        .tmvu-nt-save-result-table th,
        .tmvu-nt-save-result-table td {
            padding: 9px 10px;
            border-bottom: 1px solid rgba(61, 104, 40, 0.16);
            text-align: left;
            vertical-align: top;
            font-size: 12px;
        }

        .tmvu-nt-save-result-table th {
            color: #8aac72;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .tmvu-nt-save-results-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-top: 14px;
            color: #8aac72;
            font-size: 11px;
        }

        .tmvu-nt-save-results-toolbar strong {
            color: #eef8e8;
        }

        .tmvu-nt-save-sort {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 0;
            border: 0;
            background: transparent;
            color: inherit;
            font: inherit;
            letter-spacing: inherit;
            text-transform: inherit;
            cursor: pointer;
        }

        .tmvu-nt-save-sort::after {
            content: '↕';
            opacity: 0.4;
            font-size: 10px;
        }

        .tmvu-nt-save-sort.is-active {
            color: #d7efbf;
        }

        .tmvu-nt-save-sort.is-active::after {
            opacity: 1;
        }

        .tmvu-nt-save-sort.is-active.asc::after {
            content: '▲';
        }

        .tmvu-nt-save-sort.is-active.desc::after {
            content: '▼';
        }

        .tmvu-nt-save-export[disabled] {
            opacity: 0.55;
            pointer-events: none;
        }

        .tmvu-nt-save-result-table td {
            color: #d7ebc9;
        }

        .tmvu-nt-save-result-table a {
            color: #eef8e8;
            text-decoration: none;
        }

        .tmvu-nt-save-result-table a:hover {
            text-decoration: underline;
        }

        .tmvu-nt-save-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .tmvu-nt-save-tag {
            display: inline-flex;
            align-items: center;
            min-height: 20px;
            padding: 0 8px;
            border-radius: 999px;
            border: 1px solid rgba(61, 104, 40, 0.32);
            background: rgba(108, 192, 64, 0.1);
            color: #d7efbf;
            font-size: 10px;
            font-weight: 700;
            white-space: nowrap;
        }

        .tmvu-nt-save-tag.is-danger {
            border-color: rgba(239, 68, 68, 0.34);
            background: rgba(239, 68, 68, 0.12);
            color: #f7b2b2;
        }

        .tmvu-nt-save-tag.is-muted {
            border-color: rgba(61, 104, 40, 0.24);
            background: rgba(255, 255, 255, 0.04);
            color: #9bbc84;
        }

        .tmvu-nt-save-sources {
            color: #8aac72;
            font-size: 11px;
            line-height: 1.55;
        }

        .tmvu-nt-save-empty {
            margin-top: 14px;
            padding: 16px;
            border: 1px solid rgba(61, 104, 40, 0.22);
            background: rgba(12, 24, 9, 0.28);
            color: #90b878;
            font-size: 12px;
        }

        @media (max-width: 900px) {
            .tmvu-nt-save-summary {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }

        @media (max-width: 760px) {
            .tmvu-nt-save-dialog {
                width: calc(100vw - 10px);
                max-height: calc(100vh - 10px);
            }

            .tmvu-nt-save-head {
                flex-direction: column;
                align-items: stretch;
            }

            .tmvu-nt-save-actions {
                justify-content: flex-end;
            }

            .tmvu-nt-save-summary {
                grid-template-columns: 1fr;
            }
        }
    `;

    document.head.appendChild(style);
}

function extractClubId(anchor) {
    if (!anchor) return '';
    const attrId = cleanText(anchor.getAttribute('club_link'));
    if (attrId) return attrId;
    const href = cleanText(anchor.getAttribute('href'));
    return href.match(/\/club\/(\d+)\//)?.[1] || '';
}

function extractPlayerId(anchor) {
    if (!anchor) return '';
    const attrId = cleanText(anchor.getAttribute('player_link'));
    if (attrId) return attrId;
    const href = cleanText(anchor.getAttribute('href'));
    return href.match(/\/players\/(\d+)\//)?.[1] || '';
}

function extractCountryCodeFromNode(node) {
    if (!node) return '';

    const anchor = node.matches?.('a.country_link[href*="/national-teams/"], a[href*="/national-teams/"]')
        ? node
        : node.querySelector?.('a.country_link[href*="/national-teams/"], a[href*="/national-teams/"]');

    if (anchor) {
        const href = cleanText(anchor.getAttribute('href'));
        const hrefCode = normalizeCountryCode(href);
        if (hrefCode) return hrefCode;

        const classCode = normalizeCountryCode(anchor.innerHTML);
        if (classCode) return classCode;
    }

    const htmlCode = normalizeCountryCode(node.innerHTML || '');
    if (htmlCode) return htmlCode;

    return '';
}

function extractTransferPlayerCountryCode(row, playerAnchor) {
    const playerCell = playerAnchor?.closest?.('td');
    return extractCountryCodeFromNode(playerCell || row);
}

function normalizeDivisionGroups(divisions = []) {
    return divisions.flatMap(item => {
        const division = cleanText(item?.division);
        const groups = Math.max(1, Number(item?.groups) || 1);
        const name = cleanText(item?.name) || `Division ${division}`;
        if (!division) return [];
        return Array.from({ length: groups }, (_, index) => ({
            division,
            group: String(index + 1),
            name,
        }));
    });
}

function parseLeagueFlaggedClubs(html, groupCtx) {
    if (!html) return [];
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const map = new Map();
    doc.querySelectorAll('tr').forEach(row => {
        const clubAnchor = row.querySelector('a[club_link], a[href*="/club/"]');
        if (!clubAnchor) return;
        const clubId = extractClubId(clubAnchor);
        if (!clubId) return;

        const hasBanned = !!row.querySelector('img[src*="/pics/icons/lg_ban.gif"]');
        const hasInactive = !!row.querySelector('img[src*="/pics/icons/lg_ina.gif"]');
        if (!hasBanned && !hasInactive) return;

        const existing = map.get(clubId) || {
            clubId,
            clubName: cleanText(clubAnchor.textContent) || `Club ${clubId}`,
            division: groupCtx.division,
            group: groupCtx.group,
            statuses: new Set(),
        };
        if (hasBanned) existing.statuses.add('league-banned');
        if (hasInactive) existing.statuses.add('league-inactive');
        map.set(clubId, existing);
    });
    return Array.from(map.values()).map(item => ({ ...item, statuses: [...item.statuses] }));
}

function parseTransferHistory(html, groupCtx, season, targetCountryCode) {
    if (!html) return [];

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tables = [];
    doc.querySelectorAll('h3').forEach(h3 => {
        const label = lowerText(h3.textContent);
        let table = h3.nextElementSibling;
        while (table && table.tagName !== 'TABLE') table = table.nextElementSibling;
        if (!table) return;
        if (label.includes('bought')) tables.push({ type: 'bought', table });
        if (label.includes('sold')) tables.push({ type: 'sold', table });
    });

    const items = [];
    tables.forEach(({ type, table }) => {
        table.querySelectorAll('tr').forEach(row => {
            const playerAnchor = row.querySelector('a[player_link], a[href*="/players/"]');
            const clubAnchor = row.querySelector('a[club_link], a[href*="/club/"]');
            if (!playerAnchor || !clubAnchor) return;

            const playerCountryCode = extractTransferPlayerCountryCode(row, playerAnchor);
            if (!playerCountryCode || playerCountryCode !== normalizeCountryCode(targetCountryCode)) return;

            const playerId = extractPlayerId(playerAnchor);
            const clubId = extractClubId(clubAnchor);
            if (!playerId) return;

            items.push({
                playerId,
                playerName: cleanText(playerAnchor.textContent),
                clubId,
                clubName: cleanText(clubAnchor.textContent),
                transferType: type,
                division: groupCtx.division,
                group: groupCtx.group,
                season: String(season),
                playerCountryCode,
            });
        });
    });

    return items;
}

function hasClubBannedBadge(html) {
    return /\/pics\/club_banned\.png/i.test(String(html || ''));
}

function buildCandidateRecord(player, club, clubId = '', clubName = '') {
    return {
        playerId: cleanText(player?.player_id || player?.id),
        name: cleanText(player?.name || player?.player_name) || 'Unknown player',
        country: resolvePlayerCountryCode(player),
        age: Number(player?.age) || 0,
        months: Number(player?.months ?? player?.month) || 0,
        asi: TmUtils.parseNum(player?.skill_index || player?.asi),
        position: cleanText(player?.favposition || player?.fp || player?.favorite_position),
        clubId: cleanText(clubId || player?.club_id || club?.id),
        clubName: cleanText(clubName || player?.club_name || club?.club_name) || 'Unknown club',
        clubCreated: lowerText(club?.created),
        sources: [],
        reasons: [],
    };
}

function upsertCandidate(map, candidate) {
    if (!candidate?.playerId) return;

    const existing = map.get(candidate.playerId) || {
        ...candidate,
        sources: [],
        reasons: [],
    };

    existing.name = existing.name || candidate.name;
    existing.country = existing.country || candidate.country;
    existing.age = existing.age || candidate.age;
    existing.months = existing.months || candidate.months;
    existing.asi = existing.asi || candidate.asi;
    existing.position = existing.position || candidate.position;
    existing.clubId = existing.clubId || candidate.clubId;
    existing.clubName = existing.clubName || candidate.clubName;
    existing.clubCreated = existing.clubCreated || candidate.clubCreated;

    candidate.reasons.forEach(reason => {
        if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
    });
    candidate.sources.forEach(source => {
        if (!existing.sources.includes(source)) existing.sources.push(source);
    });

    map.set(candidate.playerId, existing);
}

function createSummaryHtml(summary) {
    const metrics = [
        ['League Groups', summary.groupsScanned],
        ['Transfer Candidates', summary.transferCandidates],
        ['Flagged Clubs', summary.flaggedClubs],
        ['NT Save Players', summary.results],
    ];

    return `
        <div class="tmvu-nt-save-summary">
            ${metrics.map(([label, value]) => `
                <div class="tmvu-nt-save-metric">
                    <div class="tmvu-nt-save-metric-label">${escapeHtml(label)}</div>
                    <div class="tmvu-nt-save-metric-value">${escapeHtml(String(value))}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function createReasonTags(reasons = []) {
    if (!reasons.length) return '<span class="tmvu-nt-save-tag is-muted">No reasons</span>';
    return reasons.map(reason => {
        const danger = /inactive|banned/i.test(reason);
        return `<span class="tmvu-nt-save-tag${danger ? ' is-danger' : ''}">${escapeHtml(reason)}</span>`;
    }).join('');
}

function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.round((Number(ms) || 0) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getResultSortValue(item, key) {
    switch (key) {
        case 'name': return lowerText(item.name);
        case 'clubName': return lowerText(item.clubName);
        case 'age': return ((Number(item.age) || 0) * 12) + (Number(item.months) || 0);
        case 'asi': return Number(item.asi) || 0;
        case 'position': return lowerText(item.position);
        case 'reasons': return lowerText((item.reasons || []).join(' | '));
        case 'sources': return lowerText((item.sources || []).join(' | '));
        default: return lowerText(item.name);
    }
}

function compareResultItems(left, right, sortKey, sortDir) {
    const a = getResultSortValue(left, sortKey);
    const b = getResultSortValue(right, sortKey);
    let cmp = 0;
    if (typeof a === 'number' && typeof b === 'number') cmp = a - b;
    else cmp = String(a).localeCompare(String(b));
    if (cmp !== 0) return cmp * sortDir;

    const nameCmp = lowerText(left.name).localeCompare(lowerText(right.name));
    if (nameCmp !== 0) return nameCmp;
    return (Number(right.asi) || 0) - (Number(left.asi) || 0);
}

function getSortedResults(state) {
    return [...state.results.values()].sort((left, right) => compareResultItems(left, right, state.sortKey, state.sortDir));
}

function syncExportButton(state) {
    if (!state.exportEl) return;
    state.exportEl.disabled = state.isScanning || state.results.size === 0;
}

function toCsvCell(value) {
    const text = String(value ?? '').replace(/\r?\n/g, ' | ');
    return `"${text.replace(/"/g, '""')}"`;
}

function toExcelHyperlink(url, label) {
    const safeUrl = String(url ?? '').replace(/"/g, '""');
    const safeLabel = String(label ?? '').replace(/"/g, '""');
    return `=HYPERLINK("${safeUrl}","${safeLabel}")`;
}

function exportResultsToCsv(state) {
    const results = getSortedResults(state);
    if (!results.length) return;

    const rows = [
        ['Player ID', 'Player Link', 'Player', 'Country', 'Club ID', 'Club Link', 'Club', 'Age', 'ASI', 'Pos', 'Reasons', 'Sources'],
        ...results.map(item => ([
            item.playerId,
            item.playerId ? toExcelHyperlink(`${window.location.origin}/players/${item.playerId}/`, item.playerId) : '',
            item.name,
            item.country,
            item.clubId,
            item.clubId ? toExcelHyperlink(`${window.location.origin}/club/${item.clubId}/`, item.clubId) : '',
            item.clubName,
            `${item.age}.${item.months}`,
            item.asi,
            item.position,
            (item.reasons || []).join(' | '),
            (item.sources || []).join(' | '),
        ])),
    ];

    const csv = `\uFEFF${rows.map(row => row.map(toCsvCell).join(',')).join('\r\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `nt-save-${state.countryCode}-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

function handleResultSort(state, sortKey) {
    if (!sortKey) return;
    if (state.sortKey === sortKey) state.sortDir *= -1;
    else {
        state.sortKey = sortKey;
        state.sortDir = sortKey === 'asi' || sortKey === 'age' ? -1 : 1;
    }
    renderResults(state);
}

function renderResults(state) {
    const results = getSortedResults(state);

    state.summary.results = results.length;
    syncExportButton(state);

    if (!state.resultsEl) return;

    if (!results.length) {
        state.resultsEl.innerHTML = `<div class="tmvu-nt-save-empty">No NT save candidates were found for ${escapeHtml(state.countryCode.toUpperCase())}.</div>`;
        return;
    }

    state.resultsEl.innerHTML = `
        ${createSummaryHtml(state.summary)}
        <div class="tmvu-nt-save-results-toolbar">
            <div>Sorted by <strong>${escapeHtml(RESULT_COLUMNS.find(col => col.key === state.sortKey)?.label || 'Player')}</strong> ${state.sortDir === 1 ? 'ascending' : 'descending'}.</div>
            <div>${escapeHtml(String(results.length))} rows</div>
        </div>
        <table class="tmvu-nt-save-result-table">
            <thead>
                <tr>
                    ${RESULT_COLUMNS.map(col => `
                        <th>
                            <button
                                type="button"
                                class="tmvu-nt-save-sort${state.sortKey === col.key ? ` is-active ${state.sortDir === 1 ? 'asc' : 'desc'}` : ''}"
                                data-nt-save-sort="${escapeHtml(col.key)}"
                            >${escapeHtml(col.label)}</button>
                        </th>
                    `).join('')}
                </tr>
            </thead>
            <tbody>
                ${results.map(item => `
                    <tr>
                        <td>
                            <a href="/players/${escapeHtml(item.playerId)}/" target="_blank" rel="noreferrer">${escapeHtml(item.name)}</a>
                        </td>
                        <td>
                            ${item.clubId ? `<a href="/club/${escapeHtml(item.clubId)}/" target="_blank" rel="noreferrer">${escapeHtml(item.clubName)}</a>` : escapeHtml(item.clubName)}
                        </td>
                        <td>${escapeHtml(`${item.age}.${item.months}`)}</td>
                        <td>${escapeHtml(String(item.asi || 0))}</td>
                        <td>${escapeHtml(item.position || '-')}</td>
                        <td><div class="tmvu-nt-save-tags">${createReasonTags(item.reasons)}</div></td>
                        <td><div class="tmvu-nt-save-sources">${item.sources.map(source => escapeHtml(source)).join('<br>')}</div></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    state.resultsEl.querySelectorAll('[data-nt-save-sort]').forEach(button => {
        button.addEventListener('click', () => handleResultSort(state, button.getAttribute('data-nt-save-sort')));
    });
}

function setStatus(state, html) {
    if (state.statusEl) state.statusEl.innerHTML = html;
    if (state.miniStatusEl) state.miniStatusEl.textContent = cleanText(html.replace(/<[^>]+>/g, ' '));
}

function setProgress(state, { phase = '', current = 0, total = 0, note = '' } = {}) {
    const safeTotal = Math.max(0, Number(total) || 0);
    const safeCurrent = Math.max(0, Math.min(safeTotal || Number(current) || 0, Number(current) || 0));
    const percent = safeTotal > 0 ? Math.max(0, Math.min(100, Math.round((safeCurrent / safeTotal) * 100))) : 0;
    const now = Date.now();

    if (!state.progressTimer || state.progressTimer.phase !== phase || safeCurrent < (state.progress?.current || 0)) {
        state.progressTimer = { phase, startedAt: now };
    }

    let etaText = 'ETA --:--';
    if (safeTotal > 0 && safeCurrent > 0 && state.progressTimer?.startedAt) {
        const elapsedMs = Math.max(1, now - state.progressTimer.startedAt);
        const rate = safeCurrent / elapsedMs;
        if (rate > 0) {
            const remainingMs = Math.max(0, (safeTotal - safeCurrent) / rate);
            etaText = `ETA ${formatDuration(remainingMs)}`;
        }
    }

    state.progress = {
        phase,
        current: safeCurrent,
        total: safeTotal,
        percent,
        note,
        etaText,
    };

    if (state.progressBarEl) state.progressBarEl.style.width = `${percent}%`;
    if (state.progressPhaseEl) state.progressPhaseEl.textContent = phase || 'Idle';
    if (state.progressMetaEl) state.progressMetaEl.textContent = safeTotal > 0 ? `${safeCurrent}/${safeTotal} · ${percent}% · ${etaText}` : '0/0 · 0% · ETA --:--';
    if (state.progressNoteEl) state.progressNoteEl.textContent = note || '';
    if (state.miniStatusEl) {
        const phaseText = phase ? `${phase} · ` : '';
        state.miniStatusEl.textContent = `${phaseText}${safeTotal > 0 ? `${safeCurrent}/${safeTotal} · ${percent}% · ${etaText}` : 'idle'}`;
    }
}

function ensureDialog(state) {
    if (state.overlayEl) return;

    const overlay = document.createElement('div');
    overlay.className = 'tmvu-nt-save-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
        <div class="tmvu-nt-save-dialog" role="dialog" aria-modal="true" aria-labelledby="tmvu-nt-save-title">
            <div class="tmvu-nt-save-head">
                <div>
                    <div class="tmvu-nt-save-kicker">National Teams</div>
                    <h2 id="tmvu-nt-save-title">NT Save Scan · ${escapeHtml(state.countryCode.toUpperCase())}</h2>
                    <p>Scans last ${SCAN_SEASON_COUNT} seasons of league transfers and flagged league clubs for national-team save candidates.</p>
                </div>
                <div class="tmvu-nt-save-actions">
                    ${buttonHtml({ label: 'Run Scan', color: 'primary', size: 'sm', cls: 'tmvu-nt-save-run', attrs: { 'data-nt-save-run': '1' } })}
                    ${buttonHtml({ label: 'Export Excel CSV', color: 'secondary', size: 'sm', cls: 'tmvu-nt-save-export', attrs: { 'data-nt-save-export': '1' } })}
                    ${buttonHtml({ label: 'Close', color: 'secondary', size: 'sm', cls: 'tmvu-nt-save-close', attrs: { 'data-nt-save-close': '1' } })}
                </div>
            </div>
            <div class="tmvu-nt-save-body">
                <div class="tmvu-nt-save-status" data-nt-save-status>Ready to scan ${escapeHtml(state.countryCode.toUpperCase())}.</div>
                <div class="tmvu-nt-save-progress" data-nt-save-progress>
                    <div class="tmvu-nt-save-progress-top">
                        <div class="tmvu-nt-save-progress-label" data-nt-save-progress-phase>Idle</div>
                        <div class="tmvu-nt-save-progress-meta" data-nt-save-progress-meta>0/0 · 0%</div>
                    </div>
                    <div class="tmvu-nt-save-progress-track">
                        <div class="tmvu-nt-save-progress-bar" data-nt-save-progress-bar></div>
                    </div>
                    <div class="tmvu-nt-save-progress-note" data-nt-save-progress-note>Waiting to start scan.</div>
                </div>
                <div data-nt-save-results></div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    state.overlayEl = overlay;
    state.statusEl = overlay.querySelector('[data-nt-save-status]');
    state.resultsEl = overlay.querySelector('[data-nt-save-results]');
    state.runEl = overlay.querySelector('[data-nt-save-run]');
    state.exportEl = overlay.querySelector('[data-nt-save-export]');
    state.progressPhaseEl = overlay.querySelector('[data-nt-save-progress-phase]');
    state.progressMetaEl = overlay.querySelector('[data-nt-save-progress-meta]');
    state.progressBarEl = overlay.querySelector('[data-nt-save-progress-bar]');
    state.progressNoteEl = overlay.querySelector('[data-nt-save-progress-note]');

    overlay.addEventListener('click', event => {
        if (event.target === overlay || event.target.closest('[data-nt-save-close]')) {
            overlay.hidden = true;
        }
    });

    state.runEl?.addEventListener('click', () => runScan(state));
    state.exportEl?.addEventListener('click', () => exportResultsToCsv(state));
    syncExportButton(state);
    setProgress(state, { phase: 'Idle', current: 0, total: 0, note: 'Waiting to start scan.' });
}

async function getTooltipCandidate(state, playerId) {
    if (!playerId) return null;
    if (!state.tooltipCache.has(playerId)) {
        state.tooltipCache.set(playerId, TmApi.fetchTooltipRaw(playerId).then(data => data || null));
    }
    return state.tooltipCache.get(playerId);
}

async function getClubPage(state, clubId) {
    if (!clubId) return null;
    if (!state.clubPageCache.has(clubId)) {
        state.clubPageCache.set(clubId, TmApi.fetchClubPageHtml(clubId).then(html => html || null));
    }
    return state.clubPageCache.get(clubId);
}

async function collectTransferPages(state, divisionGroups) {
    const seasonStart = Number(state.currentSeason) || 0;
    const seenPlayers = new Map();
    const totalSteps = divisionGroups.reduce((sum, groupCtx) => sum + 1 + SCAN_SEASON_COUNT, 0);
    let completedSteps = 0;

    for (const groupCtx of divisionGroups) {
        state.summary.groupsScanned += 1;
        setStatus(state, `<strong>Scanning</strong> ${escapeHtml(groupCtx.name)} · Group ${escapeHtml(groupCtx.group)} · current league status`);
        setProgress(state, {
            phase: 'League scan',
            current: completedSteps,
            total: totalSteps,
            note: `${groupCtx.name} · Group ${groupCtx.group} · current league flags`,
        });

        const leagueHtml = await TmApi.fetchLeaguePageHtml(state.countryCode, groupCtx.division, groupCtx.group);
        parseLeagueFlaggedClubs(leagueHtml, groupCtx).forEach(item => {
            const existing = state.flaggedClubs.get(item.clubId) || { ...item, statuses: [] };
            item.statuses.forEach(status => {
                if (!existing.statuses.includes(status)) existing.statuses.push(status);
            });
            state.flaggedClubs.set(item.clubId, existing);
        });
        completedSteps += 1;

        for (let offset = 0; offset < SCAN_SEASON_COUNT; offset++) {
            const season = seasonStart - offset;
            setStatus(state, `<strong>Scanning</strong> ${escapeHtml(groupCtx.name)} · Group ${escapeHtml(groupCtx.group)} · Season ${escapeHtml(String(season))} transfers`);
            setProgress(state, {
                phase: 'Transfer history',
                current: completedSteps,
                total: totalSteps,
                note: `${groupCtx.name} · Group ${groupCtx.group} · Season ${season}`,
            });
            const html = await TmApi.fetchLeagueTransferHistory(state.countryCode, groupCtx.division, groupCtx.group, season);
            parseTransferHistory(html, groupCtx, season, state.countryCode).forEach(entry => {
                const existing = seenPlayers.get(entry.playerId) || {
                    playerId: entry.playerId,
                    playerName: entry.playerName,
                    playerCountryCode: entry.playerCountryCode,
                    hits: [],
                };
                existing.playerName = existing.playerName || entry.playerName;
                existing.playerCountryCode = existing.playerCountryCode || entry.playerCountryCode;
                existing.hits.push(entry);
                seenPlayers.set(entry.playerId, existing);
            });
            completedSteps += 1;
        }
    }

    state.summary.flaggedClubs = state.flaggedClubs.size;
    state.summary.transferCandidates = seenPlayers.size;
    return [...seenPlayers.values()];
}

async function processTransferCandidates(state, transferCandidates) {
    for (let index = 0; index < transferCandidates.length; index++) {
        const candidate = transferCandidates[index];
        if (candidate.playerCountryCode !== normalizeCountryCode(state.countryCode)) continue;

        setStatus(state, `<strong>Inspecting players</strong> ${index + 1}/${transferCandidates.length} · ${escapeHtml(candidate.playerName || candidate.playerId)}`);
        setProgress(state, {
            phase: 'Tooltip checks',
            current: index + 1,
            total: transferCandidates.length,
            note: candidate.playerName || candidate.playerId,
        });

        const tooltipData = await getTooltipCandidate(state, candidate.playerId);
        const player = tooltipData?.player;
        const club = tooltipData?.club;
        if (!player) continue;
        if (!matchesTargetCountry(player, state.countryCode)) continue;

        const record = buildCandidateRecord(player, club);
        const transferSources = candidate.hits.slice(0, 10).map(hit => `S${hit.season} · D${hit.division}.${hit.group} · ${hit.transferType}`);
        record.sources.push(...transferSources);

        if (lowerText(club?.created) === 'inactive') {
            record.reasons.push('club inactive');
            upsertCandidate(state.results, record);
            continue;
        }

        const clubId = record.clubId;
        const clubHtml = await getClubPage(state, clubId);
        if (hasClubBannedBadge(clubHtml)) {
            record.reasons.push('club banned');
            upsertCandidate(state.results, record);
        }
    }
}

async function processFlaggedClubs(state) {
    const flaggedClubs = [...state.flaggedClubs.values()];
    for (let index = 0; index < flaggedClubs.length; index++) {
        const flaggedClub = flaggedClubs[index];
        setStatus(state, `<strong>Inspecting clubs</strong> ${index + 1}/${flaggedClubs.length} · ${escapeHtml(flaggedClub.clubName)}`);
        setProgress(state, {
            phase: 'Flagged club squads',
            current: index + 1,
            total: flaggedClubs.length,
            note: flaggedClub.clubName,
        });

        const squadData = await TmApi.fetchSquadRaw(flaggedClub.clubId, { skipSync: true });
        const squadPlayers = Array.isArray(squadData?.post) ? squadData.post : [];

        for (const squadPlayer of squadPlayers) {
            let countryCode = resolvePlayerCountryCode(squadPlayer);
            let tooltipData = null;
            if (!countryCode) {
                tooltipData = await getTooltipCandidate(state, squadPlayer.id || squadPlayer.player_id);
                countryCode = resolvePlayerCountryCode(tooltipData?.player);
            }
            if (countryCode !== normalizeCountryCode(state.countryCode)) continue;

            const player = tooltipData?.player || squadPlayer;
            const club = tooltipData?.club || {
                id: flaggedClub.clubId,
                club_name: flaggedClub.clubName,
                created: flaggedClub.statuses.includes('league-inactive') ? 'inactive' : '',
            };

            const record = buildCandidateRecord(player, club, flaggedClub.clubId, flaggedClub.clubName);
            flaggedClub.statuses.forEach(status => {
                record.reasons.push(status === 'league-inactive' ? 'league inactive squad' : 'league banned squad');
            });
            record.sources.push(`Current league · D${flaggedClub.division}.${flaggedClub.group}`);
            upsertCandidate(state.results, record);
        }
    }
}

async function runScan(state) {
    if (state.isScanning) return;
    state.isScanning = true;
    state.progressTimer = null;
    state.results.clear();
    state.flaggedClubs.clear();
    state.summary = {
        groupsScanned: 0,
        transferCandidates: 0,
        flaggedClubs: 0,
        results: 0,
    };
    ensureDialog(state);
    state.overlayEl.hidden = false;
    state.runEl.disabled = true;
    syncExportButton(state);
    state.resultsEl.innerHTML = '';
    setProgress(state, { phase: 'Preparing', current: 0, total: 1, note: `Loading divisions for ${state.countryCode.toUpperCase()}` });

    try {
        setStatus(state, `<strong>Preparing</strong> divisions for ${escapeHtml(state.countryCode.toUpperCase())}...`);
        const divisionsData = await TmApi.fetchLeagueDivisions(state.countryCode);
        const divisionGroups = normalizeDivisionGroups(divisionsData?.divisions || []);

        if (!divisionGroups.length) {
            setStatus(state, `<strong>Failed</strong> to load league divisions for ${escapeHtml(state.countryCode.toUpperCase())}.`);
            setProgress(state, { phase: 'Failed', current: 0, total: 0, note: 'No divisions returned.' });
            renderResults(state);
            return;
        }

        const transferCandidates = await collectTransferPages(state, divisionGroups);
        await processTransferCandidates(state, transferCandidates);
        await processFlaggedClubs(state);

        setStatus(state, `<strong>Done</strong> scan complete for ${escapeHtml(state.countryCode.toUpperCase())}. Found ${escapeHtml(String(state.results.size))} candidates.`);
        setProgress(state, {
            phase: 'Completed',
            current: state.results.size,
            total: Math.max(state.results.size, 1),
            note: `Found ${state.results.size} candidates for ${state.countryCode.toUpperCase()}.`,
        });
        renderResults(state);
    } catch (error) {
        setStatus(state, `<strong>Failed</strong> ${escapeHtml(error?.message || 'Unknown error')}`);
        setProgress(state, { phase: 'Failed', current: 0, total: 0, note: error?.message || 'Unknown error' });
        renderResults(state);
    } finally {
        state.isScanning = false;
        if (state.runEl) state.runEl.disabled = false;
        syncExportButton(state);
    }
}

export const TmNationalTeamsNtSave = {
    mount({ navEl, countryCode = '', currentSeason = null } = {}) {
        if (!navEl || !countryCode) return null;
        injectStyles();

        const state = {
            countryCode: lowerText(countryCode),
            currentSeason: Number(currentSeason) || Number(window.SESSION?.season) || null,
            tooltipCache: new Map(),
            clubPageCache: new Map(),
            flaggedClubs: new Map(),
            results: new Map(),
            summary: {
                groupsScanned: 0,
                transferCandidates: 0,
                flaggedClubs: 0,
                results: 0,
            },
            isScanning: false,
            overlayEl: null,
            statusEl: null,
            resultsEl: null,
            runEl: null,
            miniStatusEl: null,
            progressPhaseEl: null,
            progressMetaEl: null,
            progressBarEl: null,
            progressNoteEl: null,
            exportEl: null,
            progress: null,
            progressTimer: null,
            sortKey: 'name',
            sortDir: 1,
        };

        const panel = document.createElement('section');
        panel.className = 'tmvu-nt-save-panel';
        panel.innerHTML = `
            <div class="tmvu-nt-save-kicker">National Teams</div>
            <div class="tmvu-nt-save-title">NT Save Finder · ${escapeHtml(state.countryCode.toUpperCase())}</div>
            <div class="tmvu-nt-save-copy">Scans league transfer history, inactive clubs, banned clubs and flagged league squads for players eligible for NT save.</div>
            ${buttonHtml({ label: 'Find NT Save Players', color: 'secondary', size: 'sm', cls: 'tmvu-nt-save-btn', attrs: { 'data-nt-save-open': '1' } })}
            <div class="tmvu-nt-save-mini" data-nt-save-mini>Idle</div>
        `;

        panel.querySelector('[data-nt-save-open]')?.addEventListener('click', () => {
            ensureDialog(state);
            state.overlayEl.hidden = false;
            if (!state.results.size && !state.isScanning) runScan(state);
        });
        state.miniStatusEl = panel.querySelector('[data-nt-save-mini]');

        const navListEl = navEl.querySelector('.tmvu-side-menu-nav');
        if (navListEl) {
            const separator = document.createElement('div');
            separator.className = 'tmvu-side-menu-separator';

            const actionButton = document.createElement('button');
            actionButton.type = 'button';
            actionButton.className = 'tmu-list-item tmvu-nt-save-action';
            actionButton.innerHTML = '<span class="tmu-list-icon">🛟</span><span class="tmu-list-lbl">NT Save Players</span>';
            actionButton.addEventListener('click', () => {
                ensureDialog(state);
                state.overlayEl.hidden = false;
                if (!state.results.size && !state.isScanning) runScan(state);
            });

            const inlineStatus = document.createElement('div');
            inlineStatus.className = 'tmvu-nt-save-inline-status';
            inlineStatus.textContent = 'Idle';
            state.miniStatusEl = inlineStatus;

            navListEl.append(separator, actionButton);
            navEl.appendChild(inlineStatus);
            return actionButton;
        }

        navEl.appendChild(panel);
        return panel;
    },
};