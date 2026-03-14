// ==UserScript==
// @name         TM Squad Viewer
// @namespace    https://trophymanager.com
// @version      1.2.0
// @description  Enhanced squad overview with R5/REC ratings, training table, skill tooltips and sortable tables
// @match        https://trophymanager.com/club/*/squad*
// @grant        none
// @require      file://H:/projects/Moji/tmscripts/lib/tm-constants.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-position.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-utils.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-lib.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-playerdb.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-dbsync.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-services.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-squad.js
// @require      file://H:/projects/Moji/tmscripts/components/player/tm-player-tooltip.js
// @require      file://H:/projects/Moji/tmscripts/components/shared/tm-ui.js
// @require      file://H:/projects/Moji/tmscripts/components/squad/tm-squad-table.js
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    /* ═══════════════════════════════════════════════════════════
       CONSTANTS
       ═══════════════════════════════════════════════════════════ */
    const PlayerDB = window.TmPlayerDB;
    const PlayerArchiveDB = window.TmPlayerArchiveDB;

    /* ═══════════════════════════════════════════════════════════
       DATA PROCESSING
       ═══════════════════════════════════════════════════════════ */
    let processed = false;
    let allPlayers = [];
    let bTeamPlayers = [];
    let bTeamFetched = false;
    const onSaleIds = new Set();

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
        const dbRec = window.TmPlayerDB?.get(pid)?.records?.[`${player.age}.${player.month}`];
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
                TmApi.fetchSquadRaw(bTeamId).then(data => {
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

        let panel = document.getElementById('tmsq-panel');
        if (panel) panel.remove();
        panel = document.createElement('div');
        panel.id = 'tmsq-panel';

        TmSquadTable.render(panel, [...allPlayers, ...bTeamPlayers], { onSaleIds });

        const target = document.querySelector('.column2_a');
        if (target) {
            target.innerHTML = '';
            target.appendChild(panel);
        } else {
            const fallback = document.querySelector('#middle_column') || document.body;
            fallback.insertBefore(panel, fallback.firstChild);
        }
        widenLayout();
    };

    /* ═══════════════════════════════════════════════════════════
       INITIALIZATION
       ═══════════════════════════════════════════════════════════ */
    // Remove column3_a and widen column2_a
    const widenLayout = () => {
        const col3 = document.querySelector('.column3_a');
        if (col3) col3.remove();
        const col2 = document.querySelector('.column2_a');
        if (col2) col2.style.width = '790px';
    };

    const tryFetch = () => {
        if (processed) return;
        const clubId = location.pathname.match(/\/club\/(\d+)/)?.[1];
        if (!clubId) return;

        const waitForJQ = setInterval(() => {
            if (typeof $ === 'undefined') return;
            clearInterval(waitForJQ);
            PlayerDB.init().then(() => {
                PlayerArchiveDB.init();
                TmApi.fetchSquadRaw(clubId).then(data => {
                    if (data?.post.length) {
                        allPlayers = data?.post;
                        processed = true;
                        renderPanel();

                        if (!bTeamFetched) {
                            bTeamFetched = true;
                            const clubId = location.pathname.match(/\/club\/(\d+)/)?.[1];
                            if (clubId) fetchBTeamInfo(clubId);
                        }
                    }
                });
            })
        }, 200);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(tryFetch, 800));
    } else {
        setTimeout(tryFetch, 800);
    }

})();
