import { TmUI } from '../shared/tm-ui.js';
import { TmTable } from '../shared/tm-table.js';
import { TmApi } from '../../services/index.js';
import { TmPlayerModel } from '../../models/player.js';
import { TmClubModel } from '../../models/club.js';
import { TmLeagueModel } from '../../models/league.js';
import { TmConst } from '../../lib/tm-constants.js';
import { TmLib } from '../../lib/tm-lib.js';
import { TmUtils } from '../../lib/tm-utils.js';

const STYLE_ID = 'tmvu-nt-save-style';
const SCAN_SEASON_COUNT = 13;
const RESULT_COLUMNS = [
    { key: 'name', label: 'Player' },
    { key: 'clubName', label: 'Club' },
    { key: 'age', label: 'Age' },
    { key: 'asi', label: 'ASI' },
    { key: 'r5', label: 'R5' },
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
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-sm);
            padding: var(--tmu-space-md);
            border: 1px solid var(--tmu-border-soft-alpha-mid);
            border-radius: var(--tmu-space-md);
            background: var(--tmu-surface-dark-mid);
        }

        .tmvu-nt-save-kicker {
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .tmvu-nt-save-title {
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-sm);
            font-weight: 700;
            line-height: 1.35;
        }

        .tmvu-nt-save-copy {
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
            line-height: 1.5;
        }

        .tmvu-nt-save-mini {
            padding: var(--tmu-space-sm) var(--tmu-space-md);
            border: 1px solid var(--tmu-border-soft-alpha-mid);
            border-radius: var(--tmu-space-sm);
            background: var(--tmu-surface-dark-mid);
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
            line-height: 1.45;
        }

        .tmvu-side-menu-nav .tmu-list-item.tmvu-nt-save-action {
            color: var(--tmu-accent);
            background: var(--tmu-success-fill-faint);
            font-weight: 700;
        }

        .tmvu-side-menu-nav .tmu-list-item.tmvu-nt-save-action:hover {
            background: var(--tmu-success-fill-hover);
            color: var(--tmu-text-strong);
        }

        .tmvu-nt-save-inline-status {
            margin-top: var(--tmu-space-sm);
            padding: var(--tmu-space-sm) var(--tmu-space-md);
            border: 1px solid var(--tmu-border-soft-alpha-mid);
            border-radius: var(--tmu-space-sm);
            background: var(--tmu-surface-dark-mid);
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
            line-height: 1.45;
        }

        .tmvu-nt-save-overlay {
            position: fixed;
            inset: 0;
            z-index: 10080;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--tmu-space-lg);
            background: var(--tmu-shadow-panel);
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
            background: linear-gradient(180deg, var(--tmu-surface-panel) 0%, var(--tmu-surface-card-soft) 72%);
            border: 1px solid var(--tmu-border-success);
            box-shadow: 0 28px 80px var(--tmu-shadow-panel);
            color: var(--tmu-text-main);
        }

        .tmvu-nt-save-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: var(--tmu-space-lg);
            padding: var(--tmu-space-xl) var(--tmu-space-xl) var(--tmu-space-md);
            border-bottom: 1px solid var(--tmu-border-soft-alpha-strong);
        }

        .tmvu-nt-save-head h2 {
            margin: var(--tmu-space-xs) 0 0;
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-xl);
            line-height: 1.15;
        }

        .tmvu-nt-save-head p {
            margin: var(--tmu-space-sm) 0 0;
            color: var(--tmu-text-panel-label);
            font-size: var(--tmu-font-sm);
        }

        .tmvu-nt-save-actions {
            display: flex;
            align-items: center;
            gap: var(--tmu-space-sm);
        }

        .tmvu-nt-save-body {
            min-height: 0;
            overflow-y: auto;
            padding: var(--tmu-space-lg) var(--tmu-space-xl) var(--tmu-space-xl);
        }

        .tmvu-nt-save-status {
            padding: var(--tmu-space-md);
            border: 1px solid var(--tmu-border-soft-alpha-mid);
            background: var(--tmu-surface-dark-mid);
            color: var(--tmu-text-main);
            font-size: var(--tmu-font-sm);
        }

        .tmvu-nt-save-status strong {
            color: var(--tmu-text-strong);
        }

        .tmvu-nt-save-scope {
            margin-bottom: var(--tmu-space-md);
            padding: var(--tmu-space-md);
            border: 1px solid var(--tmu-border-soft-alpha-mid);
            background: var(--tmu-surface-dark-mid);
        }

        .tmvu-nt-save-scope-head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: var(--tmu-space-md);
            margin-bottom: var(--tmu-space-md);
            flex-wrap: wrap;
        }

        .tmvu-nt-save-scope-title {
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-sm);
            font-weight: 700;
        }

        .tmvu-nt-save-scope-copy {
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
        }

        .tmvu-nt-save-scope-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(220px, 1fr));
            gap: var(--tmu-space-md);
        }

        .tmvu-nt-save-field {
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-xs);
        }

        .tmvu-nt-save-field label {
            color: var(--tmu-text-panel-label);
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }

        .tmvu-nt-save-field input {
            box-sizing: border-box;
            width: 100%;
            min-height: 34px;
            padding: var(--tmu-space-sm) var(--tmu-space-md);
            border: 1px solid var(--tmu-border-input);
            border-radius: var(--tmu-space-sm);
            background: var(--tmu-surface-input-dark);
            color: var(--tmu-text-main);
            font-size: var(--tmu-font-sm);
        }

        .tmvu-nt-save-field input:focus {
            outline: none;
            border-color: var(--tmu-border-embedded);
            background: var(--tmu-surface-input-dark-focus);
        }

        .tmvu-nt-save-scope-note {
            margin-top: var(--tmu-space-md);
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
            line-height: 1.45;
        }

        .tmvu-nt-save-progress {
            margin-top: var(--tmu-space-md);
            padding: var(--tmu-space-md);
            border: 1px solid var(--tmu-border-soft-alpha-mid);
            background: var(--tmu-surface-dark-mid);
        }

        .tmvu-nt-save-progress-top {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: var(--tmu-space-md);
            margin-bottom: var(--tmu-space-sm);
        }

        .tmvu-nt-save-progress-label {
            color: var(--tmu-text-main);
            font-size: var(--tmu-font-sm);
            font-weight: 700;
        }

        .tmvu-nt-save-progress-meta {
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
        }

        .tmvu-nt-save-progress-track {
            height: 10px;
            overflow: hidden;
            border-radius: 999px;
            background: var(--tmu-border-contrast);
            box-shadow: inset 0 0 0 1px var(--tmu-border-soft-alpha-mid);
        }

        .tmvu-nt-save-progress-bar {
            width: 0%;
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, var(--tmu-accent-fill), var(--tmu-accent));
            transition: width 0.18s ease;
        }

        .tmvu-nt-save-progress-note {
            margin-top: var(--tmu-space-sm);
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
            line-height: 1.5;
        }

        .tmvu-nt-save-summary {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: var(--tmu-space-md);
            margin-top: var(--tmu-space-lg);
        }

        .tmvu-nt-save-metric {
            padding: var(--tmu-space-md);
            border: 1px solid var(--tmu-border-soft-alpha-mid);
            background: var(--tmu-surface-dark-mid);
        }

        .tmvu-nt-save-metric-label {
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .tmvu-nt-save-metric-value {
            margin-top: var(--tmu-space-sm);
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-xl);
            font-weight: 800;
        }

        .tmvu-nt-save-result-table {
            width: 100%;
            margin-top: var(--tmu-space-lg);
            border-collapse: collapse;
            border: 1px solid var(--tmu-border-soft-alpha-mid);
            background: var(--tmu-surface-dark-mid);
        }

        .tmvu-nt-save-result-table th,
        .tmvu-nt-save-result-table td {
            padding: var(--tmu-space-sm) var(--tmu-space-md);
            border-bottom: 1px solid var(--tmu-border-soft-alpha);
            text-align: left;
            vertical-align: top;
            font-size: var(--tmu-font-sm);
        }

        .tmvu-nt-save-result-table th {
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .tmvu-nt-save-results-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--tmu-space-md);
            margin-top: var(--tmu-space-lg);
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
        }

        .tmvu-nt-save-results-toolbar strong {
            color: var(--tmu-text-strong);
        }

        .tmvu-nt-save-export[disabled] {
            opacity: 0.55;
            pointer-events: none;
        }

        .tmvu-nt-save-result-table td {
            color: var(--tmu-text-main);
        }

        .tmvu-nt-save-result-table a {
            color: var(--tmu-text-strong);
            text-decoration: none;
        }

        .tmvu-nt-save-result-table a:hover {
            text-decoration: underline;
        }

        .tmvu-nt-save-tags {
            display: flex;
            flex-wrap: wrap;
            gap: var(--tmu-space-sm);
        }

        .tmvu-nt-save-tag {
            display: inline-flex;
            align-items: center;
            min-height: 20px;
            padding: 0 var(--tmu-space-sm);
            border-radius: 999px;
            border: 1px solid var(--tmu-border-soft-alpha-strong);
            background: var(--tmu-success-fill-faint);
            color: var(--tmu-accent);
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            white-space: nowrap;
        }

        .tmvu-nt-save-tag.is-danger {
            border-color: var(--tmu-border-danger);
            background: var(--tmu-danger-fill);
            color: var(--tmu-danger);
        }

        .tmvu-nt-save-tag.is-muted {
            border-color: var(--tmu-border-soft-alpha-mid);
            background: var(--tmu-border-contrast);
            color: var(--tmu-text-main);
        }

        .tmvu-nt-save-sources {
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
            line-height: 1.55;
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

            .tmvu-nt-save-scope-grid {
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

function getRecommendationStarsFromHtml(html) {
    const value = String(html || '');
    if (!value) return null;

    const halfStars = (value.match(/half_star\.png/gi) || []).length;
    const darkStars = (value.match(/dark_star\.png/gi) || []).length;
    const allStars = (value.match(/star\.png/gi) || []).length;
    const fullStars = Math.max(0, allStars - halfStars - darkStars);
    return fullStars + (halfStars * 0.5);
}

function extractTransferRecommendationStars(row, playerAnchor) {
    const playerCell = playerAnchor?.closest?.('td');
    const starsCell = playerCell?.nextElementSibling;
    if (!starsCell) return null;

    const htmlStars = getRecommendationStarsFromHtml(starsCell.innerHTML);
    if (htmlStars != null) return htmlStars;

    const sortValue = parseFloat(starsCell.getAttribute('sortvalue'));
    if (Number.isFinite(sortValue)) return sortValue;

    return null;
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

function getDivisionBounds(divisionGroups = []) {
    const divisionNumbers = divisionGroups
        .map(groupCtx => Number(groupCtx?.division))
        .filter(Number.isFinite);

    if (!divisionNumbers.length) return { min: 1, max: 1 };

    return {
        min: Math.min(...divisionNumbers),
        max: Math.max(...divisionNumbers),
    };
}

function getDefaultScanScope(currentSeason) {
    const seasonTo = Math.max(1, Number(currentSeason) || Number(window.SESSION?.season) || 1);
    const seasonFrom = Math.max(1, seasonTo - SCAN_SEASON_COUNT + 1);
    return {
        seasonFrom,
        seasonTo,
        leagueFrom: null,
        leagueTo: null,
    };
}

function readScanScope(state) {
    const defaults = state.scanScope || getDefaultScanScope(state.currentSeason);
    const rawSeasonFrom = Number(state.seasonFromEl?.value);
    const rawSeasonTo = Number(state.seasonToEl?.value);
    const rawLeagueFrom = Number(state.leagueFromEl?.value);
    const rawLeagueTo = Number(state.leagueToEl?.value);

    let seasonFrom = Number.isFinite(rawSeasonFrom) ? Math.max(1, Math.round(rawSeasonFrom)) : defaults.seasonFrom;
    let seasonTo = Number.isFinite(rawSeasonTo) ? Math.max(1, Math.round(rawSeasonTo)) : defaults.seasonTo;
    let leagueFrom = Number.isFinite(rawLeagueFrom) ? Math.max(1, Math.round(rawLeagueFrom)) : defaults.leagueFrom;
    let leagueTo = Number.isFinite(rawLeagueTo) ? Math.max(1, Math.round(rawLeagueTo)) : defaults.leagueTo;

    if (seasonFrom > seasonTo) [seasonFrom, seasonTo] = [seasonTo, seasonFrom];
    if (leagueFrom > leagueTo) [leagueFrom, leagueTo] = [leagueTo, leagueFrom];

    return { seasonFrom, seasonTo, leagueFrom, leagueTo };
}

function writeScanScope(state, scope) {
    const bounds = state.availableDivisionBounds;
    const leagueFromValue = scope.leagueFrom ?? bounds?.min ?? '';
    const leagueToValue = scope.leagueTo ?? bounds?.max ?? '';

    if (state.seasonFromEl) state.seasonFromEl.value = String(scope.seasonFrom);
    if (state.seasonToEl) state.seasonToEl.value = String(scope.seasonTo);
    if (state.leagueFromEl) state.leagueFromEl.value = String(leagueFromValue);
    if (state.leagueToEl) state.leagueToEl.value = String(leagueToValue);
}

function applyDivisionBoundsToScope(scope, bounds) {
    const minDivision = Number(bounds?.min) || 1;
    const maxDivision = Number(bounds?.max) || minDivision;
    let leagueFrom = Math.min(maxDivision, Math.max(minDivision, Number(scope?.leagueFrom) || minDivision));
    let leagueTo = Math.min(maxDivision, Math.max(minDivision, Number(scope?.leagueTo) || maxDivision));
    if (leagueFrom > leagueTo) [leagueFrom, leagueTo] = [leagueTo, leagueFrom];
    return {
        ...scope,
        leagueFrom,
        leagueTo,
    };
}

function updateScopeHint(state) {
    if (!state.scopeHintEl) return;

    const scope = readScanScope(state);
    const available = state.availableDivisionBounds;
    const availableText = available
        ? `Available leagues: ${available.min}-${available.max}.`
        : 'Available leagues will be detected automatically.';

    state.scopeHintEl.textContent = `${availableText} Scan seasons ${scope.seasonFrom}-${scope.seasonTo}, leagues ${scope.leagueFrom}-${scope.leagueTo}.`;
}

async function loadDivisionBounds(state) {
    if (!state.countryCode || state.availableDivisionBounds) {
        updateScopeHint(state);
        return state.availableDivisionBounds;
    }

    try {
        const divisionsData = await TmLeagueModel.fetchLeagueDivisions(state.countryCode);
        const divisionGroups = normalizeDivisionGroups(divisionsData?.divisions || []);
        if (!divisionGroups.length) {
            updateScopeHint(state);
            return null;
        }

        state.availableDivisionBounds = getDivisionBounds(divisionGroups);
        state.scanScope = applyDivisionBoundsToScope(readScanScope(state), state.availableDivisionBounds);
        writeScanScope(state, state.scanScope);

        const { min, max } = state.availableDivisionBounds;
        if (state.leagueFromEl) {
            state.leagueFromEl.min = String(min);
            state.leagueFromEl.max = String(max);
        }
        if (state.leagueToEl) {
            state.leagueToEl.min = String(min);
            state.leagueToEl.max = String(max);
        }
        updateScopeHint(state);
        return state.availableDivisionBounds;
    } catch (_error) {
        updateScopeHint(state);
        return null;
    }
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

function parseTransferHistory(html, groupCtx, season, targetCountryCode, currentSeason) {
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

            const recommendationStars = extractTransferRecommendationStars(row, playerAnchor);
            const seasonsAgo = getTransferSeasonsAgo({ hits: [{ season: String(season) }] }, currentSeason);
            const requiredRecommendation = getTransferRecommendationThreshold(seasonsAgo);
            const passesRecommendation = recommendationStars != null && recommendationStars >= requiredRecommendation;
            if (!passesRecommendation) return;

            console.log('[NT Save][Transfer History Pass]', {
                playerId,
                playerName: cleanText(playerAnchor.textContent),
                country: playerCountryCode,
                seasonScanned: season,
                transferType: type,
                sourceDivision: `${groupCtx.division}.${groupCtx.group}`,
                transferRecommendation: recommendationStars,
                currentSeason,
                seasonsAgo,
                requiredRecommendation,
                conditionMatched: `transfer rec >= ${requiredRecommendation}`,
            });

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
                transferRecommendation: recommendationStars,
                requiredRecommendation,
            });
        });
    });

    return items;
}

function hasClubBannedBadge(html) {
    return /\/pics\/club_banned\.png/i.test(String(html || ''));
}

function getRecommendationStars(player = {}) {
    const recSort = player?.rec_sort != null ? parseFloat(player.rec_sort) : NaN;
    if (Number.isFinite(recSort)) return recSort;

    return getRecommendationStarsFromHtml(player?.recommendation || '');
}

function getTransferSeasonsAgo(candidate, currentSeason) {
    const seasonNow = Number(currentSeason);
    if (!Number.isFinite(seasonNow)) return null;

    const mostRecentSeason = Math.max(...(candidate?.hits || []).map(hit => Number(hit.season)).filter(Number.isFinite));
    if (!Number.isFinite(mostRecentSeason)) return null;

    return Math.max(0, seasonNow - mostRecentSeason);
}

function getTransferRecommendationThreshold(seasonsAgo) {
    if (seasonsAgo == null) return 5;
    if (seasonsAgo <= 0) return 3;
    if (seasonsAgo === 1) return 3.5;
    if (seasonsAgo === 2 || seasonsAgo === 3) return 4;
    if (seasonsAgo === 4) return 4.5;
    return 5;
}

function getMostRecentTransferSeason(candidate) {
    const mostRecentSeason = Math.max(...(candidate?.hits || []).map(hit => Number(hit.season)).filter(Number.isFinite));
    return Number.isFinite(mostRecentSeason) ? mostRecentSeason : null;
}

function getTransferThresholdDebug(candidate, currentSeason) {
    const mostRecentTransferSeason = getMostRecentTransferSeason(candidate);
    const seasonsAgo = getTransferSeasonsAgo(candidate, currentSeason);
    const requiredRecommendation = getTransferRecommendationThreshold(seasonsAgo);
    return {
        mostRecentTransferSeason,
        seasonsAgo,
        requiredRecommendation,
    };
}

function computeCandidateR5(player = {}) {
    try {
        const calcPlayer = { ...player };
        TmApi._parseScalars(calcPlayer);

        const defs = calcPlayer.isGK ? TmConst.SKILL_DEFS_GK : TmConst.SKILL_DEFS_OUT;
        const resolvedSkills = TmApi._resolveSkills(calcPlayer, defs, null);
        const numericSkills = TmApi._toNumericSkills(resolvedSkills);
        if (!numericSkills.length || !Number.isFinite(calcPlayer.asi)) return null;

        const positionKeys = Array.isArray(calcPlayer.positions) && calcPlayer.positions.some(p => p.preferred)
            ? calcPlayer.positions.filter(p => p.preferred).map(p => p.key)
            : String(calcPlayer.favposition || calcPlayer.fp || (calcPlayer.isGK ? 'gk' : ''))
                .split(',')
                .map(value => value.trim().toLowerCase())
                .filter(Boolean);

        const ratings = positionKeys
            .map(positionKey => TmConst.POSITION_MAP[positionKey])
            .filter(Boolean)
            .map(positionData => Number(TmLib.calculatePlayerR5(positionData, {
                ...calcPlayer,
                skills: numericSkills,
                asi: calcPlayer.asi,
                routine: calcPlayer.routine || 0,
            })));

        if (!ratings.length) return null;
        return Math.max(...ratings);
    } catch (_error) {
        return null;
    }
}

function buildCandidateRecord(player, club, clubId = '', clubName = '') {
    return {
        playerId: cleanText(player?.id),
        name: cleanText(player?.name) || 'Unknown player',
        country: resolvePlayerCountryCode(player),
        age: Number(player?.age) || 0,
        months: Number(player?.month) || 0,
        asi: TmUtils.parseNum(player?.asi),
        r5: computeCandidateR5(player),
        position: Array.isArray(player?.positions) && player.positions.some(p => p.preferred)
            ? player.positions.filter(p => p.preferred).map(p => p.key).join(',')
            : '',
        clubId: cleanText(clubId || player?.club_id || club?.id),
        clubName: cleanText(clubName || player?.club_name || club?.name) || 'Unknown club',
        clubCreated: lowerText(club?.created),
        sources: [],
        reasons: [],
    };
}

function upsertCandidate(map, candidate) {
    if (!candidate?.playerId) return { candidate: null, changed: false };

    const hadExisting = map.has(candidate.playerId);
    const existing = map.get(candidate.playerId) || {
        ...candidate,
        sources: [],
        reasons: [],
    };
    let changed = !hadExisting;

    if (!existing.name && candidate.name) {
        existing.name = candidate.name;
        changed = true;
    }
    if (!existing.country && candidate.country) {
        existing.country = candidate.country;
        changed = true;
    }
    if (!existing.age && candidate.age) {
        existing.age = candidate.age;
        changed = true;
    }
    if (!existing.months && candidate.months) {
        existing.months = candidate.months;
        changed = true;
    }
    if (!existing.asi && candidate.asi) {
        existing.asi = candidate.asi;
        changed = true;
    }
    if ((existing.r5 == null || existing.r5 === '') && candidate.r5 != null) {
        existing.r5 = candidate.r5;
        changed = true;
    }
    if (!existing.position && candidate.position) {
        existing.position = candidate.position;
        changed = true;
    }
    if (!existing.clubId && candidate.clubId) {
        existing.clubId = candidate.clubId;
        changed = true;
    }
    if (!existing.clubName && candidate.clubName) {
        existing.clubName = candidate.clubName;
        changed = true;
    }
    if (!existing.clubCreated && candidate.clubCreated) {
        existing.clubCreated = candidate.clubCreated;
        changed = true;
    }

    candidate.reasons.forEach(reason => {
        if (!existing.reasons.includes(reason)) {
            existing.reasons.push(reason);
            changed = true;
        }
    });
    candidate.sources.forEach(source => {
        if (!existing.sources.includes(source)) {
            existing.sources.push(source);
            changed = true;
        }
    });

    map.set(candidate.playerId, existing);
    return { candidate: existing, changed };
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
        case 'r5': return Number(item.r5) || 0;
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
        ['Player ID', 'Player Link', 'Player', 'Country', 'Club ID', 'Club Link', 'Club', 'Age', 'ASI', 'R5', 'Pos', 'Reasons', 'Sources'],
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
            item.r5 != null ? Number(item.r5).toFixed(2) : '',
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

function getResultHeaders() {
    return RESULT_COLUMNS.map(col => ({
        key: col.key,
        label: col.label,
        align: col.key === 'age' || col.key === 'asi' || col.key === 'r5' ? 'r' : 'l',
        defaultSortDir: col.key === 'asi' || col.key === 'age' || col.key === 'r5' ? -1 : 1,
        sort: (left, right) => compareResultItems(left, right, col.key, 1),
        render: (_value, item) => {
            if (col.key === 'name') {
                return `<a href="/players/${escapeHtml(item.playerId)}/" target="_blank" rel="noreferrer">${escapeHtml(item.name)}</a>`;
            }
            if (col.key === 'clubName') {
                return item.clubId
                    ? `<a href="/club/${escapeHtml(item.clubId)}/" target="_blank" rel="noreferrer">${escapeHtml(item.clubName)}</a>`
                    : escapeHtml(item.clubName);
            }
            if (col.key === 'age') return escapeHtml(`${item.age}.${item.months}`);
            if (col.key === 'asi') return escapeHtml(String(item.asi || 0));
            if (col.key === 'r5') return item.r5 != null ? escapeHtml(Number(item.r5).toFixed(2)) : '-';
            if (col.key === 'position') return escapeHtml(item.position || '-');
            if (col.key === 'reasons') {
                return `<div class="tmvu-nt-save-tags">${createReasonTags(item.reasons)}</div>`;
            }
            if (col.key === 'sources') {
                return `<div class="tmvu-nt-save-sources">${item.sources.map(source => escapeHtml(source)).join('<br>')}</div>`;
            }
            return escapeHtml(String(item[col.key] ?? ''));
        },
    }));
}

function updateResultsToolbar(state, results) {
    if (state.resultsToolbarEl) {
        state.resultsToolbarEl.innerHTML = `Sorted by <strong>${escapeHtml(RESULT_COLUMNS.find(col => col.key === state.sortKey)?.label || 'Player')}</strong> ${state.sortDir === 1 ? 'ascending' : 'descending'}.`;
    }
    if (state.resultsCountEl) {
        state.resultsCountEl.textContent = `${results.length} rows`;
    }
}

function renderResults(state) {
    const results = getSortedResults(state);

    state.summary.results = results.length;
    syncExportButton(state);

    if (!state.resultsEl) return;

    if (!results.length) {
        state.resultsEl.innerHTML = TmUI.empty(`No NT save candidates were found for ${escapeHtml(state.countryCode.toUpperCase())}.`);
        state.resultsToolbarEl = null;
        state.resultsCountEl = null;
        return;
    }

    state.resultsEl.innerHTML = `
        ${createSummaryHtml(state.summary)}
        <div class="tmvu-nt-save-results-toolbar">
            <div data-nt-save-results-toolbar></div>
            <div data-nt-save-results-count></div>
        </div>
        <div data-nt-save-results-table></div>
    `;

    state.resultsToolbarEl = state.resultsEl.querySelector('[data-nt-save-results-toolbar]');
    state.resultsCountEl = state.resultsEl.querySelector('[data-nt-save-results-count]');

    const tableHost = state.resultsEl.querySelector('[data-nt-save-results-table]');
    const table = TmTable.table({
        cls: ' tmvu-nt-save-result-table',
        items: results,
        headers: getResultHeaders(),
        sortKey: state.sortKey,
        sortDir: state.sortDir,
        afterRender: ({ sortedItems, sortKey, sortDir }) => {
            state.sortKey = sortKey;
            state.sortDir = sortDir;
            updateResultsToolbar(state, sortedItems);
        },
    });

    tableHost?.appendChild(table);
    updateResultsToolbar(state, results);
}

async function flushLiveResults(state) {
    renderResults(state);
    await new Promise(resolve => window.setTimeout(resolve, 0));
}

function setStatus(state, html) {
    if (state.statusEl) state.statusEl.innerHTML = html;
    if (state.miniStatusEl) state.miniStatusEl.textContent = cleanText(html.replace(/<[^>]+>/g, ' '));
}

function setProgress(state, { phase = '', current = 0, total = 0, note = '', unitLabel = '' } = {}) {
    const safeTotal = Math.max(0, Number(total) || 0);
    const safeCurrent = Math.max(0, Math.min(safeTotal || Number(current) || 0, Number(current) || 0));
    const percent = safeTotal > 0 ? Math.max(0, Math.min(100, Math.round((safeCurrent / safeTotal) * 100))) : 0;
    const now = Date.now();
    const unitSuffix = unitLabel ? ` ${unitLabel}` : '';

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
        unitLabel,
        etaText,
    };

    if (state.progressBarEl) state.progressBarEl.style.width = `${percent}%`;
    if (state.progressPhaseEl) state.progressPhaseEl.textContent = phase || 'Idle';
    if (state.progressMetaEl) state.progressMetaEl.textContent = safeTotal > 0 ? `${safeCurrent}/${safeTotal}${unitSuffix} · ${percent}% · ${etaText}` : '0/0 · 0% · ETA --:--';
    if (state.progressNoteEl) state.progressNoteEl.textContent = note || '';
    if (state.miniStatusEl) {
        const phaseText = phase ? `${phase} · ` : '';
        state.miniStatusEl.textContent = `${phaseText}${safeTotal > 0 ? `${safeCurrent}/${safeTotal}${unitSuffix} · ${percent}% · ${etaText}` : 'idle'}`;
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
                    <p>Scans the selected season and league range for transfers, inactive clubs, banned clubs and flagged squads.</p>
                </div>
                <div class="tmvu-nt-save-actions">
                    ${buttonHtml({ label: 'Run Scan', color: 'primary', size: 'sm', attrs: { 'data-nt-save-run': '1' } })}
                    ${buttonHtml({ label: 'Export Excel CSV', color: 'secondary', size: 'sm', cls: 'tmvu-nt-save-export', attrs: { 'data-nt-save-export': '1' } })}
                    ${buttonHtml({ label: 'Close', color: 'secondary', size: 'sm', attrs: { 'data-nt-save-close': '1' } })}
                </div>
            </div>
            <div class="tmvu-nt-save-body">
                <div class="tmvu-nt-save-scope">
                    <div class="tmvu-nt-save-scope-head">
                        <div class="tmvu-nt-save-scope-title">Scan Scope</div>
                        <div class="tmvu-nt-save-scope-copy">Limit seasons and league divisions before large scans.</div>
                    </div>
                    <div class="tmvu-nt-save-scope-grid">
                        <div class="tmvu-nt-save-field">
                            <label for="tmvu-nt-save-season-from">Season From</label>
                            <input id="tmvu-nt-save-season-from" type="number" min="1" step="1" data-nt-save-season-from>
                        </div>
                        <div class="tmvu-nt-save-field">
                            <label for="tmvu-nt-save-season-to">Season To</label>
                            <input id="tmvu-nt-save-season-to" type="number" min="1" step="1" data-nt-save-season-to>
                        </div>
                        <div class="tmvu-nt-save-field">
                            <label for="tmvu-nt-save-league-from">League From</label>
                            <input id="tmvu-nt-save-league-from" type="number" min="1" step="1" data-nt-save-league-from>
                        </div>
                        <div class="tmvu-nt-save-field">
                            <label for="tmvu-nt-save-league-to">League To</label>
                            <input id="tmvu-nt-save-league-to" type="number" min="1" step="1" data-nt-save-league-to>
                        </div>
                    </div>
                    <div class="tmvu-nt-save-scope-note" data-nt-save-scope-note>Loading available league bounds...</div>
                </div>
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
    state.seasonFromEl = overlay.querySelector('[data-nt-save-season-from]');
    state.seasonToEl = overlay.querySelector('[data-nt-save-season-to]');
    state.leagueFromEl = overlay.querySelector('[data-nt-save-league-from]');
    state.leagueToEl = overlay.querySelector('[data-nt-save-league-to]');
    state.scopeHintEl = overlay.querySelector('[data-nt-save-scope-note]');

    writeScanScope(state, state.scanScope || getDefaultScanScope(state.currentSeason));
    updateScopeHint(state);
    void loadDivisionBounds(state);

    overlay.addEventListener('click', event => {
        if (event.target === overlay || event.target.closest('[data-nt-save-close]')) {
            overlay.hidden = true;
            return;
        }

        if (event.target.closest('[data-nt-save-run]')) {
            runScan(state);
            return;
        }

        if (event.target.closest('[data-nt-save-export]')) {
            exportResultsToCsv(state);
        }
    });
    overlay.addEventListener('input', event => {
        const scopeInput = event.target.closest('[data-nt-save-season-from], [data-nt-save-season-to], [data-nt-save-league-from], [data-nt-save-league-to]');
        if (!scopeInput || !overlay.contains(scopeInput)) return;
        updateScopeHint(state);
    });
    syncExportButton(state);
    setProgress(state, { phase: 'Idle', current: 0, total: 0, note: 'Waiting to start scan.' });
}

async function getTooltipCandidate(state, playerId) {
    if (!playerId) return null;
    if (!state.tooltipCache.has(playerId)) {
        state.tooltipCache.set(playerId, TmPlayerModel.fetchTooltipCached(playerId)
            .catch(() => null));
    }
    return state.tooltipCache.get(playerId);
}

async function getTooltipCandidateBatch(state, playerIds = [], batchSize = 10) {
    const uniqueIds = [...new Set(playerIds.map(id => cleanText(id)).filter(Boolean))];
    const results = new Map();

    for (let index = 0; index < uniqueIds.length; index += batchSize) {
        const batchIds = uniqueIds.slice(index, index + batchSize);
        const batchData = await Promise.all(batchIds.map(async playerId => ([
            playerId,
            await getTooltipCandidate(state, playerId),
        ])));

        batchData.forEach(([playerId, data]) => {
            results.set(playerId, data || null);
        });
    }

    return results;
}

async function getClubPage(state, clubId) {
    if (!clubId) return null;
    if (!state.clubPageCache.has(clubId)) {
        state.clubPageCache.set(clubId, TmClubModel.fetchClubPageHtml(clubId)
            .then(html => html || null)
            .catch(() => null));
    }
    return state.clubPageCache.get(clubId);
}

async function getClubPageBatch(state, clubIds = [], batchSize = 10) {
    const uniqueIds = [...new Set(clubIds.map(id => cleanText(id)).filter(Boolean))];
    const results = new Map();

    for (let index = 0; index < uniqueIds.length; index += batchSize) {
        const batchIds = uniqueIds.slice(index, index + batchSize);
        const batchData = await Promise.all(batchIds.map(async clubId => ([
            clubId,
            await getClubPage(state, clubId),
        ])));

        batchData.forEach(([clubId, data]) => {
            results.set(clubId, data || null);
        });
    }

    return results;
}

async function collectTransferPages(state, divisionGroups) {
    const seasonFrom = Number(state.scanScope?.seasonFrom) || Math.max(1, (Number(state.currentSeason) || 1) - SCAN_SEASON_COUNT + 1);
    const seasonTo = Number(state.scanScope?.seasonTo) || Number(state.currentSeason) || 1;
    const seasonCount = Math.max(0, seasonTo - seasonFrom + 1);
    const seenPlayers = new Map();
    const transferHistoryBatchCount = Math.ceil(seasonCount / 10);
    const totalBatches = divisionGroups.length * (1 + transferHistoryBatchCount);
    let completedBatches = 0;

    for (const groupCtx of divisionGroups) {
        state.summary.groupsScanned += 1;
        setStatus(state, `<strong>Scanning</strong> ${escapeHtml(groupCtx.name)} · Group ${escapeHtml(groupCtx.group)} · current league status`);
        setProgress(state, {
            phase: 'League scan',
            current: completedBatches,
            total: totalBatches,
            note: `${groupCtx.name} · Group ${groupCtx.group} · current league flags`,
            unitLabel: 'batches',
        });

        const leagueHtml = await TmLeagueModel.fetchLeaguePageHtml(state.countryCode, groupCtx.division, groupCtx.group);
        parseLeagueFlaggedClubs(leagueHtml, groupCtx).forEach(item => {
            const existing = state.flaggedClubs.get(item.clubId) || { ...item, statuses: [] };
            item.statuses.forEach(status => {
                if (!existing.statuses.includes(status)) existing.statuses.push(status);
            });
            state.flaggedClubs.set(item.clubId, existing);
        });
        completedBatches += 1;
        setProgress(state, {
            phase: 'League scan',
            current: completedBatches,
            total: totalBatches,
            note: `${groupCtx.name} · Group ${groupCtx.group} · current league flags done`,
            unitLabel: 'batches',
        });

        const seasons = Array.from({ length: seasonCount }, (_, offset) => seasonTo - offset);
        for (let batchStart = 0; batchStart < seasons.length; batchStart += 10) {
            const seasonBatch = seasons.slice(batchStart, batchStart + 10);
            const firstSeason = seasonBatch[0];
            const lastSeason = seasonBatch[seasonBatch.length - 1];

            setStatus(state, `<strong>Scanning</strong> ${escapeHtml(groupCtx.name)} · Group ${escapeHtml(groupCtx.group)} · Seasons ${escapeHtml(String(firstSeason))}-${escapeHtml(String(lastSeason))} transfers`);
            setProgress(state, {
                phase: 'Transfer history',
                current: completedBatches,
                total: totalBatches,
                note: `${groupCtx.name} · Group ${groupCtx.group} · Batch ${Math.floor(batchStart / 10) + 1}`,
                unitLabel: 'batches',
            });

            const historyBatch = await Promise.all(seasonBatch.map(async season => ({
                season,
                html: await TmLeagueModel.fetchLeagueTransferHistory(state.countryCode, groupCtx.division, groupCtx.group, season),
            })));

            historyBatch.forEach(({ season, html }) => {
                parseTransferHistory(html, groupCtx, season, state.countryCode, state.currentSeason).forEach(entry => {
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

                    const thresholdInfo = getTransferThresholdDebug(existing, state.currentSeason);
                    console.log('[NT Save][Transfer History Add]', {
                        playerId: existing.playerId,
                        playerName: existing.playerName,
                        country: existing.playerCountryCode,
                        seasonScanned: season,
                        transferType: entry.transferType,
                        sourceDivision: `${entry.division}.${entry.group}`,
                        transferRecommendation: entry.transferRecommendation,
                        hitCount: existing.hits.length,
                        currentSeason: state.currentSeason,
                        ...thresholdInfo,
                    });
                });
            });

            completedBatches += 1;
            setProgress(state, {
                phase: 'Transfer history',
                current: completedBatches,
                total: totalBatches,
                note: `${groupCtx.name} · Group ${groupCtx.group} · Batch ${Math.floor(batchStart / 10) + 1} done`,
                unitLabel: 'batches',
            });
        }
    }

    state.summary.flaggedClubs = state.flaggedClubs.size;
    state.summary.transferCandidates = seenPlayers.size;
    return [...seenPlayers.values()];
}

async function processTransferCandidates(state, transferCandidates) {
    const targetCountryCode = normalizeCountryCode(state.countryCode);
    const totalTooltipBatches = Math.ceil(transferCandidates.length / 10);
    let completedTooltipBatches = 0;

    for (let batchStart = 0; batchStart < transferCandidates.length; batchStart += 10) {
        const batch = transferCandidates.slice(batchStart, batchStart + 10);
        const eligibleBatch = batch.filter(candidate => candidate.playerCountryCode === targetCountryCode);

        setStatus(state, `<strong>Inspecting players</strong> ${batchStart + 1}-${Math.min(batchStart + batch.length, transferCandidates.length)}/${transferCandidates.length} · fetching tooltip batch`);
        setProgress(state, {
            phase: 'Tooltip checks',
            current: completedTooltipBatches,
            total: totalTooltipBatches,
            note: `Tooltip batch ${Math.floor(batchStart / 10) + 1}`,
            unitLabel: 'batches',
        });

        const tooltipMap = await getTooltipCandidateBatch(state, eligibleBatch.map(candidate => candidate.playerId), 10);

        const clubIdsToCheck = eligibleBatch
            .map(candidate => {
                const tooltipData = tooltipMap.get(candidate.playerId) || null;
                const player = tooltipData;
                const club = tooltipData?.club;
                if (!player || !matchesTargetCountry(player, state.countryCode)) return '';
                if (lowerText(club?.created) === 'inactive') return '';
                return cleanText(club?.id || player?.club_id);
            })
            .filter(Boolean);

        setStatus(state, `<strong>Inspecting players</strong> ${batchStart + 1}-${Math.min(batchStart + batch.length, transferCandidates.length)}/${transferCandidates.length} · fetching club batch`);
        const clubPageMap = await getClubPageBatch(state, clubIdsToCheck, 10);

        for (let offset = 0; offset < batch.length; offset++) {
            const index = batchStart + offset;
            const candidate = batch[offset];
            if (candidate.playerCountryCode !== targetCountryCode) continue;

            const tooltipData = tooltipMap.get(candidate.playerId) || null;
            const player = tooltipData;
            const club = tooltipData?.club;
            if (!player) continue;
            if (!matchesTargetCountry(player, state.countryCode)) continue;

            const thresholdInfo = getTransferThresholdDebug(candidate, state.currentSeason);
            const mostRecentSeason = thresholdInfo.mostRecentTransferSeason;
            const seasonsAgo = thresholdInfo.seasonsAgo;
            const minRecommendation = thresholdInfo.requiredRecommendation;
            const recommendationStars = getRecommendationStars(player);
            const transferDebug = {
                playerId: candidate.playerId,
                playerName: player?.name || candidate.playerName || candidate.playerId,
                currentSeason: state.currentSeason,
                mostRecentTransferSeason: mostRecentSeason,
                seasonsAgo,
                requiredRecommendation: minRecommendation,
                tooltipRecommendation: recommendationStars,
                hitCount: Array.isArray(candidate.hits) ? candidate.hits.length : 0,
                passesThreshold: recommendationStars != null && recommendationStars >= minRecommendation,
            };
            console.log('[NT Save][Transfer Check]', transferDebug);
            if (recommendationStars == null || recommendationStars < minRecommendation) {
                console.log('[NT Save][Transfer Reject]', transferDebug);
                continue;
            }
            console.log('[NT Save][Transfer Pass]', transferDebug);

            const record = buildCandidateRecord(player, club);
            const transferSources = candidate.hits.slice(0, 10).map(hit => `S${hit.season} · D${hit.division}.${hit.group} · ${hit.transferType}`);
            record.sources.push(...transferSources);

            if (lowerText(club?.created) === 'inactive') {
                record.reasons.push('club inactive');
                const { changed } = upsertCandidate(state.results, record);
                if (changed) await flushLiveResults(state);
                console.log('[NT Save][Transfer Result Add]', {
                    playerId: record.playerId,
                    playerName: record.name,
                    clubId: record.clubId,
                    clubName: record.clubName,
                    reasons: [...record.reasons],
                    sources: [...record.sources],
                    tooltipRecommendation: recommendationStars,
                    currentSeason: state.currentSeason,
                    ...thresholdInfo,
                    conditionMatched: `rec >= ${minRecommendation} and club inactive`,
                });
                continue;
            }

            const clubId = record.clubId;
            const clubHtml = clubPageMap.get(cleanText(clubId)) || null;
            if (hasClubBannedBadge(clubHtml)) {
                record.reasons.push('club banned');
                const { changed } = upsertCandidate(state.results, record);
                if (changed) await flushLiveResults(state);
                console.log('[NT Save][Transfer Result Add]', {
                    playerId: record.playerId,
                    playerName: record.name,
                    clubId: record.clubId,
                    clubName: record.clubName,
                    reasons: [...record.reasons],
                    sources: [...record.sources],
                    tooltipRecommendation: recommendationStars,
                    currentSeason: state.currentSeason,
                    ...thresholdInfo,
                    conditionMatched: `rec >= ${minRecommendation} and club banned`,
                });
            }
        }

        completedTooltipBatches += 1;
        setProgress(state, {
            phase: 'Tooltip checks',
            current: completedTooltipBatches,
            total: totalTooltipBatches,
            note: `${batchStart + 1}-${Math.min(batchStart + batch.length, transferCandidates.length)}/${transferCandidates.length} players checked`,
            unitLabel: 'batches',
        });
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

        const squadPlayers = await TmClubModel.fetchSquadRaw(flaggedClub.clubId) || [];

        const squadPlayersMissingCountry = squadPlayers.filter(squadPlayer => {
            const countryCode = resolvePlayerCountryCode(squadPlayer);
            return !countryCode && cleanText(squadPlayer.id);
        });
        const squadTooltipMap = await getTooltipCandidateBatch(
            state,
            squadPlayersMissingCountry.map(squadPlayer => squadPlayer.id),
            10,
        );

        for (const squadPlayer of squadPlayers) {
            let countryCode = resolvePlayerCountryCode(squadPlayer);
            let tooltipData = null;
            if (!countryCode) {
                tooltipData = squadTooltipMap.get(cleanText(squadPlayer.id)) || null;
                countryCode = resolvePlayerCountryCode(tooltipData);
            }
            if (countryCode !== normalizeCountryCode(state.countryCode)) continue;

            const player = tooltipData || squadPlayer;
            const club = tooltipData?.club || {
                id: flaggedClub.clubId,
                name: flaggedClub.clubName,
                created: flaggedClub.statuses.includes('league-inactive') ? 'inactive' : '',
            };

            const record = buildCandidateRecord(player, club, flaggedClub.clubId, flaggedClub.clubName);
            flaggedClub.statuses.forEach(status => {
                record.reasons.push(status === 'league-inactive' ? 'league inactive squad' : 'league banned squad');
            });
            record.sources.push(`Current league · D${flaggedClub.division}.${flaggedClub.group}`);
            const { changed } = upsertCandidate(state.results, record);
            if (changed) await flushLiveResults(state);
        }
    }
}

async function runScan(state) {
    if (state.isScanning) return;
    state.scanScope = readScanScope(state);
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
        const divisionsData = await TmLeagueModel.fetchLeagueDivisions(state.countryCode);
        const allDivisionGroups = normalizeDivisionGroups(divisionsData?.divisions || []);

        if (allDivisionGroups.length) {
            state.availableDivisionBounds = getDivisionBounds(allDivisionGroups);
            state.scanScope = applyDivisionBoundsToScope(state.scanScope, state.availableDivisionBounds);
            writeScanScope(state, state.scanScope);
            updateScopeHint(state);
        }

        const divisionGroups = allDivisionGroups.filter(groupCtx => {
            const divisionNumber = Number(groupCtx.division);
            if (!Number.isFinite(divisionNumber)) return false;
            return divisionNumber >= state.scanScope.leagueFrom && divisionNumber <= state.scanScope.leagueTo;
        });

        if (!divisionGroups.length) {
            setStatus(state, `<strong>Failed</strong> no leagues matched divisions ${escapeHtml(String(state.scanScope.leagueFrom))}-${escapeHtml(String(state.scanScope.leagueTo))} for ${escapeHtml(state.countryCode.toUpperCase())}.`);
            setProgress(state, { phase: 'Failed', current: 0, total: 0, note: 'No leagues matched the selected scope.' });
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

        const existingAction = navEl.querySelector('.tmvu-nt-save-action');
        if (existingAction) return existingAction;

        const existingPanel = navEl.querySelector('.tmvu-nt-save-panel');
        if (existingPanel) return existingPanel;

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
            scanScope: getDefaultScanScope(Number(currentSeason) || Number(window.SESSION?.season) || null),
            availableDivisionBounds: null,
            seasonFromEl: null,
            seasonToEl: null,
            leagueFromEl: null,
            leagueToEl: null,
            scopeHintEl: null,
        };

        const navListEl = navEl.querySelector('.tmvu-side-menu-nav');
        if (navListEl) {
            const separator = document.createElement('div');
            separator.className = 'tmvu-side-menu-separator';

            const actionButton = TmUI.button({
                slot: '<span class="tmu-list-icon">🛟</span><span class="tmu-list-lbl">NT Save Players</span>',
                color: 'secondary',
                size: 'sm',
                cls: 'tmu-list-item tmvu-nt-save-action',
            });
            actionButton.addEventListener('click', () => {
                ensureDialog(state);
                state.overlayEl.hidden = false;
            });

            const inlineStatus = document.createElement('div');
            inlineStatus.className = 'tmvu-nt-save-inline-status';
            inlineStatus.textContent = 'Idle';
            state.miniStatusEl = inlineStatus;

            navListEl.append(separator, actionButton);
            navEl.appendChild(inlineStatus);
            return actionButton;
        }

        const panel = document.createElement('section');
        panel.className = 'tmvu-nt-save-panel';
        panel.innerHTML = `
            <div class="tmvu-nt-save-kicker">National Teams</div>
            <div class="tmvu-nt-save-title">NT Save Finder · ${escapeHtml(state.countryCode.toUpperCase())}</div>
            <div class="tmvu-nt-save-copy">Scans league transfer history, inactive clubs, banned clubs and flagged league squads for players eligible for NT save.</div>
            ${buttonHtml({ label: 'Find NT Save Players', color: 'secondary', size: 'sm', attrs: { 'data-nt-save-open': '1' } })}
            <div class="tmvu-nt-save-mini" data-nt-save-mini>Idle</div>
        `;

        panel.onclick = (event) => {
            if (!event.target.closest('[data-nt-save-open]')) return;
            ensureDialog(state);
            state.overlayEl.hidden = false;
        };
        state.miniStatusEl = panel.querySelector('[data-nt-save-mini]');

        navEl.appendChild(panel);
        return panel;
    },
};