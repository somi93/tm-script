// ==UserScript==
// @name         TM Player Enhanced
// @namespace    https://trophymanager.com
// @version      1.0.0
// @description  Player page overhaul - redesigned card, live transfer tracker, R5/REC/TI charts, skill graphs, compare tool, squad scout & more
// @match        https://trophymanager.com/players/*			
// @exclude      https://trophymanager.com/players/
// @exclude      https://trophymanager.com/players/#/a/*
// @exclude	     https://trophymanager.com/players/compare/*
// @grant        none
// @require      file://H:/projects/Moji/tmscripts/lib/tm-constants.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-position.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-utils.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-lib.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-playerdb.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-dbsync.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-services.js
// @require      file://H:/projects/Moji/tmscripts/components/shared/tm-ui.js
// @require      file://H:/projects/Moji/tmscripts/components/shared/tm-canvas-utils.js
// @require      file://H:/projects/Moji/tmscripts/components/player/tm-player-styles.js
// @require      file://H:/projects/Moji/tmscripts/components/player/tm-history-mod.js
// @require      file://H:/projects/Moji/tmscripts/components/player/tm-scout-mod.js
// @require      file://H:/projects/Moji/tmscripts/components/player/tm-training-mod.js
// @require      file://H:/projects/Moji/tmscripts/components/player/tm-graphs-mod.js
// @require      file://H:/projects/Moji/tmscripts/components/player/tm-tabs-mod.js
// @require      file://H:/projects/Moji/tmscripts/components/player/tm-skills-grid.js
// @require      file://H:/projects/Moji/tmscripts/components/player/tm-player-sidebar.js
// @require      file://H:/projects/Moji/tmscripts/components/player/tm-sidebar-nav.js
// @require      file://H:/projects/Moji/tmscripts/components/player/tm-asi-calculator.js
// @require      file://H:/projects/Moji/tmscripts/components/player/tm-best-estimate.js
// @require      file://H:/projects/Moji/tmscripts/components/player/tm-player-card.js
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const $ = window.jQuery;
    if (!$) return;

    const urlMatch = location.pathname.match(/\/players\/(\d+)/);
    if (!urlMatch) return;
    const PLAYER_ID = urlMatch[1];

    const PlayerDB = window.TmPlayerDB;
    const PlayerArchiveDB = window.TmPlayerArchiveDB;

    /* -----------------------------------------------------------
       SHARED STATE (tooltip-derived)
       ----------------------------------------------------------- */
    let player = null;
    let club = null;


    /* Check if player belongs to the logged-in user's club */
    const getOwnClubIds = () => {
        const s = window.SESSION;
        if (!s) return [];
        const ids = [];
        if (s.main_id) ids.push(String(s.main_id));
        if (s.b_team) ids.push(String(s.b_team));
        return ids;
    };

    const injectCSS = () => window.TmPlayerStyles.inject();

    const applyTooltip = (data) => {
        if (!data || !data.player) return;
        if (data.retired) return;

        player = data.player;
        club = data.club ?? null;

        /* re-render scout if already shown */
        TmScoutMod.reRender();
        /* parse NT data before card renders (cleans DOM) */
        const parsedNTData = TmHistoryMod.parseNT();

        /* build player card after tooltip data arrives */
        TmPlayerCard.render({
            player,
            club
        });

        /* build ASI calculator with defaults after TI is computed */
        TmAsiCalculator.mount(
            document.querySelector('.column3_a'),
            { player }
        );

        /* re-render history if already loaded, so NT tab appears */
        if (parsedNTData && TmTabsMod.isLoaded('history')) TmHistoryMod.reRender();

        /* fetch scout data for Best Estimate card */
        fetchBestEstimate();

        TmSkillsGrid.mount({ player });

        TmTabsMod.mount({ player, getOwnClubIds, injectCSS });
    };

    //    INIT - run DB init and tooltip fetch in parallel
    //    -----------------------------------------------------------
    Promise.all([
        PlayerDB.init().then(() => PlayerArchiveDB.init()).catch(e => {
            console.warn('[DB] IndexedDB init failed, falling back:', e);
        }),
        TmApi.fetchPlayerTooltip(PLAYER_ID),
    ]).then(([, data]) => applyTooltip(data));

    /* -----------------------------------------------------------
       BEST ESTIMATE see components/player/tm-player-best-estimate.js
       ----------------------------------------------------------- */
    const fetchBestEstimate = () => {
        const col1 = document.querySelector('.column1');
        if (!col1) return;
        const existing = col1.querySelector('#tmbe-standalone');
        if (existing) existing.remove();
        const el = document.createElement('div');
        el.id = 'tmbe-standalone';
        const nav = col1.querySelector('.tmcn-nav');
        if (nav && nav.nextSibling) col1.insertBefore(el, nav.nextSibling);
        else col1.appendChild(el);
        TmApi.fetchPlayerInfo(PLAYER_ID, 'scout').then(data => {
            TmBestEstimate.render(el, {
                scoutData: data || {},
                player,
            });
        });
    };

    /* -----------------------------------------------------------
       SIDEBAR see components/player/tm-player-sidebar.js
       ----------------------------------------------------------- */
    const col3 = document.querySelector('.column3_a');
    if (col3) TmPlayerSidebar.mount(col3);

    /* -----------------------------------------------------------
       SIDEBAR NAV see components/player/tm-sidebar-nav.js
       ----------------------------------------------------------- */
    const col1Nav = document.querySelector('.column1');
    if (col1Nav) TmSidebarNav.mount(col1Nav);

    window.addEventListener('tm:growthUpdated', () => {
        try { TmGraphsMod.reRender(); } catch (e) { }
        try { TmSkillsGrid.reRender(); } catch (e) { }
    });

})();