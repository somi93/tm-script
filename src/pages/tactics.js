import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmPlayerService } from '../services/player.js';
import { injectTacticsStyles } from '../components/tactics/tm-tactics-styles.js';
import { mountTacticsLineup } from '../components/tactics/tm-tactics-lineup.js';
import { mountTacticsSettings } from '../components/tactics/tm-tactics-settings.js';
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

    // ── 3-column layout: field | players | settings+orders ───────────────
    const mainGrid = document.createElement('div');
    mainGrid.className = 'tmtc-main-grid';
    host.appendChild(mainGrid);

    const leftPanel  = document.createElement('div');
    leftPanel.className  = 'tmtc-main-left';
    const midPanel   = document.createElement('div');
    midPanel.className   = 'tmtc-main-mid';
    const rightPanel = document.createElement('div');
    rightPanel.className = 'tmtc-main-right';

    mainGrid.appendChild(leftPanel);
    mainGrid.appendChild(midPanel);
    mainGrid.appendChild(rightPanel);

    const { refresh: refreshLineup } = mountTacticsLineup(leftPanel, data, { ...opts, squadContainer: midPanel });
    mountTacticsSettings(rightPanel, initialSettings, opts);
    mountTacticsOrders(rightPanel, data, opts);

    // Fetch tooltip (normalizes skills → allPositionRatings, routine) for each squad player
    let refreshTimer = null;
    const scheduleRefresh = () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(refreshLineup, 50); };
    for (const p of Object.values(players_by_id)) {
        TmPlayerService.fetchPlayerTooltip(p.player_id).then(tooltipData => {
            if (!tooltipData?.player) return;
            const np = tooltipData.player;
            p.allPositionRatings = np.allPositionRatings;
            p.routine = np.routine;
            scheduleRefresh();
        }).catch(() => {});
    }
}
