import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmPlayerService } from '../services/player.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { injectTacticsStyles } from '../components/tactics/tm-tactics-styles.js';
import { mountTacticsLineup } from '../components/tactics/tm-tactics-lineup.js';
import { mountTacticsPanel } from '../components/tactics/tm-tactics-panel.js';
import { mountTacticsOrders } from '../components/tactics/tm-tactics-orders.js';

'use strict';

let mountedMain = null;

// ── Capture native setting values before page replacement ───────────────────
function captureNativeSettings() {
    const getVal = (id) => parseInt(document.getElementById(id)?.value || '0', 10) || 0;
    return {
        mentality: getVal('mentality_select'),
        style:     getVal('attacking_select'),
        focus:     getVal('focus_side_select'),
    };
}

// ── Fetch tactics data ──────────────────────────────────────────────────────
async function fetchTacticsData(reserves, national, miniGameId) {
    const body = new URLSearchParams({ reserves, national, miniGameId }).toString();
    const res = await fetch('/ajax/tactics_get.ajax.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body,
    });
    if (!res.ok) throw new Error(`tactics_get failed: ${res.status}`);
    return res.json();
}

// ── Main init ────────────────────────────────────────────────────────────────
export async function initTacticsPage(main) {
    if (!/^\/tactics(?:\/reserves)?\/?$/i.test(window.location.pathname)) return;
    if (!main || !main.isConnected) return;
    if (mountedMain === main && main.querySelector('.tmtc-page')?.isConnected) return;

    mountedMain = main;

    const reserves    = Number(window.reserves    ?? 0);
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
        rawData = await fetchTacticsData(reserves, national, miniGameId);
    } catch (err) {
        host.innerHTML = TmUI.error(err?.message || 'Failed to load tactics data.');
        return;
    }

    if (!rawData) {
        host.innerHTML = TmUI.error('No tactics data returned from server.');
        return;
    }

    // Build players_by_id index
    const players    = rawData.players || {};
    const players_by_id = {};
    for (const p of Object.values(players)) {
        if (p?.player_id) players_by_id[p.player_id] = p;
    }

    const data = {
        players,
        players_by_id,
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

    mainGrid.appendChild(leftPanel);
    mainGrid.appendChild(midPanel);
    mainGrid.appendChild(statsPanel);
    mainGrid.appendChild(rightPanel);

    const lineupApi = mountTacticsLineup(leftPanel, data, { ...opts, squadContainer: midPanel });
    const panelApi  = mountTacticsPanel(statsPanel, data, initialSettings, opts, lineupApi);
    mountTacticsOrders(rightPanel, data, opts);

    // Phase 1: normalize from local DB instantly (no network, shows R5 immediately for known players)
    await TmPlayerDB.init();
    for (const p of Object.values(players_by_id)) {
        const DBPlayer = TmPlayerDB.get(p.player_id);
        if (DBPlayer) TmPlayerService.normalizePlayer(p, DBPlayer, { skipSync: true });
    }
    lineupApi.refresh();
    panelApi.refreshStats();

    // Phase 2: fetch tooltip only for players not yet enriched from DB
    let refreshTimer = null, panelTimer = null;
    const scheduleRefresh      = () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(lineupApi.refresh,       50);  };
    const schedulePanelRefresh = () => { clearTimeout(panelTimer);   panelTimer   = setTimeout(panelApi.refreshStats, 100); };
    for (const p of Object.values(players_by_id)) {
        if (p.allPositionRatings?.length) continue; // already enriched from DB
        TmPlayerService.fetchPlayerTooltip(p.player_id).then(tooltipData => {
            if (!tooltipData?.player) return;
            const np = tooltipData.player;
            p.allPositionRatings = np.allPositionRatings;
            p.routine = np.routine;
            scheduleRefresh();
            schedulePanelRefresh();
        }).catch(() => {});
    }
}
