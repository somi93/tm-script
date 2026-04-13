import { TmSquadTable } from '../components/squad/tm-squad-table.js';
import { initClubLayout, normalizeClubHref } from '../components/club/tm-club-layout.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmClubModel } from '../models/club.js';

'use strict';

let CURRENT_PATH = '';
let _main = null;
let processed = false;
let allPlayers = [];
let bTeamPlayers = [];
let bTeamFetched = false;
const onSaleIds = new Set();

const getSquadContainer = () => {
    if (_main) {
        let c = _main.querySelector('.tmvu-club-main');
        if (!c) {
            c = document.createElement('div');
            c.className = 'tmvu-club-main';
            _main.appendChild(c);
        }
        return c;
    }
    return null;
};

    const setPendingVisibility = (pending) => {
        getSquadContainer()?.classList.toggle('tmvu-squad-pending', pending);
    };

    const waitForSquadContainer = () => Promise.resolve(getSquadContainer());

    const waitForJQuery = () => new Promise(resolve => {
        if (window.jQuery) {
            resolve(window.jQuery);
            return;
        }

        const poll = window.setInterval(() => {
            if (!window.jQuery) return;
            window.clearInterval(poll);
            resolve(window.jQuery);
        }, 50);
    });

    const scanForSales = () => {
        document.querySelectorAll('img[src*="auction_hammer"]').forEach(img => {
            const tr = img.closest('tr');
            if (!tr) return;
            const link = tr.querySelector('a[href*="/players/"]');
            if (!link) return;
            const m = link.getAttribute('href').match(/\/players\/(\d+)/);
            if (m) onSaleIds.add(m[1]);
        });
    };

    const fetchBTeamInfo = clubId => {
        fetch(`/club/${clubId}/`)
            .then(r => r.text())
            .then(html => {
                const idMatch = html.match(/B-Team:\s*<\/strong>\s*<a\s+href="\/club\/(\d+)\//)
                    || html.match(/B-Team:[\s\S]*?\/club\/(\d+)\//);
                if (!idMatch) return;
                const bTeamId = idMatch[1];
                TmClubModel.fetchSquadRaw(bTeamId).then(data => {
                    const players = Array.isArray(data) ? data : [];
                    if (players.length) {
                        bTeamPlayers = players.map(p => ({ ...p, isBTeam: true }));
                        renderPanel();
                    }
                });
            })
            .catch(() => { });
    };

    /* ═══════════════════════════════════════════════════════════
       RENDERING
       ═══════════════════════════════════════════════════════════ */
    const renderPanel = () => {
        scanForSales();
        initClubLayout({ currentPath: CURRENT_PATH, singleColumn: true });

        let panel = document.getElementById('tmsq-panel');
        if (panel) panel.remove();
        panel = document.createElement('div');
        panel.id = 'tmsq-panel';
        panel.className = 'tmu-flat-panel';

        TmSquadTable.render(panel, [...allPlayers, ...bTeamPlayers], { onSaleIds });

        const target = getSquadContainer();
        if (target) {
            target.innerHTML = '';
            target.appendChild(panel);
            setPendingVisibility(false);
        }
    };

    /* ═══════════════════════════════════════════════════════════
       INITIALIZATION
       ═══════════════════════════════════════════════════════════ */

    const tryFetch = async () => {
        if (processed) return;
        const clubId = location.pathname.match(/\/club\/(\d+)/)?.[1];
        if (!clubId) return;

        await waitForJQuery();
        const data = await TmClubModel.fetchSquadRaw(clubId);
        if (data?.length) {
            allPlayers = data;
            processed = true;
            renderPanel();

            if (!bTeamFetched) {
                bTeamFetched = true;
                fetchBTeamInfo(clubId);
            }
            return;
        }

        const target = getSquadContainer();
        if (target) {
            target.innerHTML = TmSquadTableError();
            setPendingVisibility(false);
        }
    };

    const TmSquadTableError = () => TmUI.error('Failed to load squad data.');

    const start = async () => {
        initClubLayout({ currentPath: CURRENT_PATH, singleColumn: true });
        setPendingVisibility(true);
        await waitForSquadContainer();
        tryFetch().catch(err => {
            console.error('[Squad] init error:', err);
            setPendingVisibility(false);
        });
    };

export function initSquadPage(main) {
    if (!main || !main.isConnected) return;
    _main = main;
    CURRENT_PATH = normalizeClubHref(window.location.pathname);
    processed = false;
    allPlayers = []; bTeamPlayers = []; bTeamFetched = false;
    onSaleIds.clear();
    start().catch(err => console.error('[Squad] start error:', err));
}
