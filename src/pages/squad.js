import { TmSquadTable } from '../components/squad/tm-squad-table.js';
import { initClubLayout, normalizeClubHref } from '../components/club/tm-club-layout.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmPlayerArchiveDB, TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmClubService } from '../services/club.js';

(function () {
    'use strict';

    if (!/\/club\/\d+\/squad\//.test(location.pathname)) return;
    const CURRENT_PATH = normalizeClubHref(window.location.pathname);

    if (!document.getElementById('tmvu-squad-pending-style')) {
        const style = document.createElement('style');
        style.id = 'tmvu-squad-pending-style';
        style.textContent = `
            .tmvu-club-main.tmvu-squad-pending,
            .column2_a.tmvu-squad-pending {
                visibility: hidden;
            }
        `;
        document.head.appendChild(style);
    }

    /* ═══════════════════════════════════════════════════════════
       CONSTANTS
       ═══════════════════════════════════════════════════════════ */
    const PlayerDB = TmPlayerDB;
    const PlayerArchiveDB = TmPlayerArchiveDB;

    /* ═══════════════════════════════════════════════════════════
       DATA PROCESSING
       ═══════════════════════════════════════════════════════════ */
    let processed = false;
    let allPlayers = [];
    let bTeamPlayers = [];
    let bTeamFetched = false;
    const onSaleIds = new Set();

    const getSquadContainer = () => document.querySelector('.tmvu-club-main, .column2_a');

    const setPendingVisibility = (pending) => {
        document.querySelectorAll('.tmvu-club-main, .column2_a').forEach(node => {
            node.classList.toggle('tmvu-squad-pending', pending);
        });
    };

    const waitForSquadContainer = () => new Promise(resolve => {
        const existing = getSquadContainer();
        if (existing) {
            resolve(existing);
            return;
        }

        const observer = new MutationObserver(() => {
            const container = getSquadContainer();
            if (!container) return;
            observer.disconnect();
            resolve(container);
        });

        observer.observe(document.body, { childList: true, subtree: true });
    });

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

    // When syncPlayerStore finishes it fires tm:growthUpdated.
    // Update the player in-place from DB and re-render.
    window.addEventListener('tm:growthUpdated', e => {
        const pid = String(e.detail?.pid || '');
        if (!pid) return;
        const player = allPlayers.find(p => String(p.id) === pid)
            || bTeamPlayers.find(p => String(p.id) === pid);
        if (!player) return;
        const dbRec = TmPlayerDB?.get(pid)?.records?.[`${player.age}.${player.month}`];
        if (!dbRec || (dbRec.R5 == null && dbRec.REREC == null)) return;
        if (dbRec.R5 != null) player.r5 = dbRec.R5;
        if (dbRec.REREC != null) player.rec = dbRec.REREC;
        if (dbRec.routine != null) player.routine = dbRec.routine;
        player.fromDB = true;
        renderPanel();
    });

    const fetchBTeamInfo = clubId => {
        fetch(`/club/${clubId}/`)
            .then(r => r.text())
            .then(html => {
                const idMatch = html.match(/B-Team:\s*<\/strong>\s*<a\s+href="\/club\/(\d+)\//)
                    || html.match(/B-Team:[\s\S]*?\/club\/(\d+)\//);
                if (!idMatch) return;
                const bTeamId = idMatch[1];
                const nameMatch = html.match(/B-Team:\s*<\/strong>\s*<a[^>]*>([^<]+)<\/a>/)
                    || html.match(/B-Team:[\s\S]*?club_link='\d+'>([^<]+)<\/a>/);
                bTeamName = nameMatch ? nameMatch[1].trim() : 'B-Team';
                TmClubService.fetchSquadRaw(bTeamId).then(data => {
                    const players = data?.post ? Object.values(data.post) || [] : [];
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

        TmSquadTable.render(panel, [...allPlayers, ...bTeamPlayers], { onSaleIds });

        const target = document.querySelector('.tmvu-club-main, .column2_a');
        if (target) {
            target.innerHTML = '';
            target.appendChild(panel);
            setPendingVisibility(false);
        } else {
            const fallback = document.querySelector('#middle_column') || document.body;
            fallback.insertBefore(panel, fallback.firstChild);
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
        await PlayerDB.init();
        PlayerArchiveDB.init();

        const data = await TmClubService.fetchSquadRaw(clubId);
        if (data?.post.length) {
            allPlayers = data.post;
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            start().catch(err => console.error('[Squad] start error:', err));
        }, { once: true });
    } else {
        start().catch(err => console.error('[Squad] start error:', err));
    }

})();
