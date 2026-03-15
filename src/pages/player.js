import { TmAsiCalculator } from '../components/player/tm-asi-calculator.js';
import { TmBestEstimate } from '../components/player/tm-best-estimate.js';
import { TmGraphsMod } from '../components/player/tm-graphs-mod.js';
import { TmHistoryMod } from '../components/player/tm-history-mod.js';
import { TmPlayerCard } from '../components/player/tm-player-card.js';
import { TmPlayerSidebar } from '../components/player/tm-player-sidebar.js';
import { TmPlayerStyles } from '../components/player/tm-player-styles.js';
import { TmScoutMod } from '../components/player/tm-scout-mod.js';
import { TmSidebarNav } from '../components/player/tm-sidebar-nav.js';
import { TmSkillsGrid } from '../components/player/tm-skills-grid.js';
import { TmTabsMod } from '../components/player/tm-tabs-mod.js';
import { TmPlayerArchiveDB, TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmApi }  from '../services/index.js' ;

(function () {
    'use strict';

    const $ = window.jQuery;
    if (!$) return;

    const urlMatch = location.pathname.match(/\/players\/(\d+)/);
    if (!urlMatch) return;
    const PLAYER_ID = urlMatch[1];

    const PlayerDB = TmPlayerDB;
    const PlayerArchiveDB = TmPlayerArchiveDB;

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

    const injectCSS = () => TmPlayerStyles.inject();

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

        /* build sidebar (replaces TM native column3_a content) */
        const col3 = document.querySelector('.column3_a');
        if (col3) TmPlayerSidebar.mount(col3, { player });

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
       SIDEBAR NAV see components/player/tm-sidebar-nav.js
       ----------------------------------------------------------- */
    const col1Nav = document.querySelector('.column1');
    if (col1Nav) TmSidebarNav.mount(col1Nav);

    window.addEventListener('tm:growthUpdated', () => {
        try { TmGraphsMod.reRender(); } catch (e) { }
        try { TmSkillsGrid.reRender(); } catch (e) { }
    });

})();