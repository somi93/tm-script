import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { injectTacticsStyles } from '../components/tactics/tm-tactics-styles.js';
import { mountTacticsLineup } from '../components/tactics/tm-tactics-lineup.js';
import { mountTacticsPanel } from '../components/tactics/tm-tactics-panel.js';
import { mountTacticsOrders } from '../components/tactics/tm-tactics-orders.js';
import { TmTacticsService } from '../services/tactics.js';

'use strict';

let mountedMain = null;
let mountedPath = '';
let tacticsSyncListener = null;

function getBTeamClubId() {
    return String(window.SESSION?.b_team || '').trim();
}

function hasReservesTeam() {
    return Boolean(getBTeamClubId());
}

function getTacticsTeamMode(pathname = window.location.pathname) {
    return /^\/tactics\/reserves\/?$/i.test(pathname) ? 'reserves' : 'first-team';
}

function getTacticsRoute(pathname = window.location.pathname, teamMode = getTacticsTeamMode(pathname)) {
    return teamMode === 'reserves' ? '/tactics/reserves/' : '/tactics/';
}

// ── Capture native setting values before page replacement ───────────────────
function captureNativeSettings() {
    const getVal = (id) => parseInt(document.getElementById(id)?.value || '0', 10) || 0;
    return {
        mentality: getVal('mentality_select'),
        style:     getVal('attacking_select'),
        focus:     getVal('focus_side_select'),
    };
}

function replaceSyncedPlayer(data, syncedPlayer) {
    const syncedId = String(syncedPlayer?.id || syncedPlayer?.player_id || '').trim();
    if (!syncedId) return false;

    let changed = false;
    if (data.players_by_id?.[syncedId]) {
        data.players_by_id[syncedId] = syncedPlayer;
        changed = true;
    }

    for (const [key, player] of Object.entries(data.players || {})) {
        if (String(player?.player_id || player?.id || '') !== syncedId) continue;
        data.players[key] = syncedPlayer;
        changed = true;
    }

    return changed;
}

// ── Main init ────────────────────────────────────────────────────────────────
export async function initTacticsPage(main) {
    if (!/^\/tactics(?:\/reserves)?\/?$/i.test(window.location.pathname)) return;
    if (!main || !main.isConnected) return;
    if (mountedMain === main && mountedPath === window.location.pathname && main.querySelector('.tmtc-page')?.isConnected) return;

    mountedMain = main;
    mountedPath = window.location.pathname;

    const teamMode = getTacticsTeamMode(window.location.pathname);
    const bTeamClubId = getBTeamClubId();
    const showReserves = hasReservesTeam();
    const activeTeamTab = teamMode === 'reserves' && showReserves ? 'reserves' : 'first-team';

    if (teamMode === 'reserves' && !showReserves) {
        window.location.assign('/tactics/');
        return;
    }

    const reserves = teamMode === 'reserves' ? 1 : 0;
    const clubId = teamMode === 'reserves'
        ? bTeamClubId
        : String(window.SESSION?.main_id || '');

    const national    = Number(window.national    ?? 0);
    const miniGameId  = Number(window.miniGameId  ?? 0);

    // Capture settings from native page BEFORE we clear content
    const initialSettings = captureNativeSettings();

    injectTmPageLayoutStyles();
    injectTacticsStyles();

    main.classList.add('tmtc-page');
    main.replaceChildren();

    const host = document.createElement('section');
    host.className = 'tmu-page-section-stack';
    main.appendChild(host);

    host.innerHTML = TmUI.loading();

    let rawData;
    try {
        rawData = await TmTacticsService.fetchTactics(reserves, national, miniGameId, { clubId });
    } catch (err) {
        host.innerHTML = TmUI.error(err?.message || 'Failed to load tactics data.');
        return;
    }

    if (!rawData) {
        host.innerHTML = TmUI.error('No tactics data returned from server.');
        return;
    }

    const data = {
        players: rawData.players || {},
        players_by_id: rawData.players_by_id || {},
        formation:         rawData.formation         || {},
        formation_by_pos:  rawData.formation_by_pos  || {},
        formation_subs:    rawData.formation_subs    || {},
        formation_assoc:   rawData.formation_assoc   || {},
        positions:         rawData.positions         || [],
    };

    const opts = { reserves, national, miniGameId };

    host.innerHTML = '';

    // ── 4-column layout: field | players | panel (formation+stats+settings) | orders ─
    const mainGrid = document.createElement('div');
    mainGrid.className = 'tmtc-main-grid';
    host.appendChild(mainGrid);

    const leftPanel  = document.createElement('div');
    leftPanel.className  = 'tmtc-main-left';
    const midPanel   = document.createElement('div');
    midPanel.className   = 'tmtc-main-mid';
    const statsPanel = document.createElement('div');
    statsPanel.className = 'tmtc-main-stats';
    const rightPanel = document.createElement('div');
    rightPanel.className = 'tmtc-main-right';
    const rightSwitch = document.createElement('div');
    rightSwitch.className = 'tmtc-orders-switch';
    const ordersHost = document.createElement('div');
    ordersHost.className = 'tmtc-orders-host';

    mainGrid.appendChild(leftPanel);
    mainGrid.appendChild(midPanel);
    mainGrid.appendChild(statsPanel);
    mainGrid.appendChild(rightPanel);
    rightPanel.appendChild(rightSwitch);
    rightPanel.appendChild(ordersHost);

    const teamTabs = TmUI.tabs({
        items: [
            { key: 'first-team', label: 'First Team' },
            ...(showReserves ? [{ key: 'reserves', label: 'Reserves' }] : []),
        ],
        active: activeTeamTab,
        stretch: true,
        onChange: (nextMode) => {
            const nextPath = getTacticsRoute(window.location.pathname, nextMode);
            if (nextPath === window.location.pathname) return;
            window.location.assign(nextPath);
        },
    });
    TmUI.setActive?.(teamTabs, activeTeamTab);
    rightSwitch.appendChild(teamTabs);

    const lineupApi = mountTacticsLineup(leftPanel, data, { ...opts, squadContainer: midPanel });
    const panelApi  = mountTacticsPanel(statsPanel, data, initialSettings, opts, lineupApi);
    mountTacticsOrders(ordersHost, data, opts);

    lineupApi.refresh();
    panelApi.refreshStats();

    if (tacticsSyncListener) {
        window.removeEventListener('tm:player-synced', tacticsSyncListener);
        tacticsSyncListener = null;
    }
}
