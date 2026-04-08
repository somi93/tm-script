import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmClubService } from '../services/club.js';
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

    // Enrich players_by_id using the squad endpoint (one request, all players normalized with allPositionRatings)
    const clubId = String(window.SESSION?.main_id || '');
    if (clubId) {
        await TmPlayerDB.init();
        TmClubService.fetchSquadRaw(clubId, { skipSync: true }).then(data => {
            if (!data?.post?.length) return;
            for (const sp of data.post) {
                const pid = String(sp.id || sp.player_id || '');
                if (!pid) continue;
                const existing = players_by_id[pid];
                if (existing) {
                    existing.allPositionRatings = sp.allPositionRatings;
                    existing.routine = sp.routine;
                    existing.favposition = sp.favposition;
                } else {
                    players_by_id[pid] = sp;
                }
            }
            lineupApi.refresh();
            panelApi.refreshStats();
        }).catch(() => {});
    }
}
