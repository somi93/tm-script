import { TmAsiCalculator } from '../components/player/tm-asi-calculator.js';
import { TmBestEstimate } from '../components/player/tm-best-estimate.js';
import { TmGraphsMod } from '../components/player/tm-graphs-mod.js';
import { TmHistoryMod } from '../components/player/tm-history-mod.js';
import { TmPlayerCard } from '../components/player/tm-player-card.js';
import { TmPlayerSidebar } from '../components/player/tm-player-sidebar.js';
import { TmPlayerStyles } from '../components/player/tm-player-styles.js';
import { TmScoutMod } from '../components/player/tm-scout-mod.js';
import { TmSkillsGrid } from '../components/player/tm-skills-grid.js';
import { TmTabsMod } from '../components/player/tm-tabs-mod.js';
import { TmPlayerArchiveDB, TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmPlayerService } from '../services/player.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';

export function initPlayerPage(main) {
    if (!main || !main.isConnected) return;

    const urlMatch = location.pathname.match(/\/players\/(\d+)/);
    if (!urlMatch) return;
    const PLAYER_ID = urlMatch[1];
    let nativeSidebarSnapshot = null;

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

    const injectCSS = () => {
        injectTmPageLayoutStyles();
        TmPlayerStyles.inject();
    };

    const bootstrapShell = () => {
        injectCSS();
        ensurePlayerLayout();
    };

    const ensureRailSlot = (rail, slotId, { prepend = false } = {}) => {
        if (!rail) return null;

        let slot = rail.querySelector(`:scope > #${slotId}`);
        if (slot) return slot;

        slot = document.createElement('div');
        slot.id = slotId;

        if (prepend) rail.prepend(slot);
        else rail.appendChild(slot);

        return slot;
    };

    const ensurePlayerLayout = () => {
        const main = document.querySelector('.tmvu-main');
        const tmMain = document.querySelector('.main_center');
        if (!main || !tmMain) return null;

        main.classList.add('tmvu-player-page');

        let layout = main.querySelector(':scope > #tmvp-layout');
        if (layout) {
            return {
                main,
                layout,
                leftRail: layout.querySelector('#tmvp-left'),
                mainRail: layout.querySelector('#tmvp-main'),
                rightRail: layout.querySelector('#tmvp-right'),
            };
        }

        const nativeCol3 = tmMain.querySelector(':scope > .column3_a');

        if (!nativeSidebarSnapshot && nativeCol3) {
            nativeSidebarSnapshot = nativeCol3.cloneNode(true);
        }

        layout = document.createElement('div');
        layout.id = 'tmvp-layout';
        layout.className = 'tmvp-layout tmu-page-layout-3rail tmu-page-density-regular tmu-page-rail-break-wide';

        const leftRail = document.createElement('div');
        leftRail.id = 'tmvp-left';
        leftRail.className = 'tmvp-rail tmvp-rail-left tmu-page-sidebar-stack';

        const mainRail = document.createElement('div');
        mainRail.id = 'tmvp-main';
        mainRail.className = 'tmvp-rail tmvp-rail-main tmu-page-section-stack';

        const rightRail = document.createElement('div');
        rightRail.id = 'tmvp-right';
        rightRail.className = 'tmvp-rail tmvp-rail-right tmu-page-rail-stack';

        layout.appendChild(leftRail);
        layout.appendChild(mainRail);
        layout.appendChild(rightRail);
        console.log('Inserting player layout', layout, main);
        main.appendChild(layout);

        return { main, layout, leftRail, mainRail, rightRail };
    };

    const ensureSidebarLayout = () => {
        const layout = ensurePlayerLayout();
        const col3 = layout?.rightRail;
        if (!col3) return null;

        if (!col3.__tmvuNativeSnapshot) {
            col3.__tmvuNativeSnapshot = nativeSidebarSnapshot ? nativeSidebarSnapshot.cloneNode(true) : col3.cloneNode(true);
        }

        let sidebarSlot = col3.querySelector('#tmps-sidebar-slot');
        let calcSlot = col3.querySelector('#tmac-slot');

        if (!sidebarSlot || !calcSlot) {
            col3.innerHTML = '';

            sidebarSlot = ensureRailSlot(col3, 'tmps-sidebar-slot');
            calcSlot = ensureRailSlot(col3, 'tmac-slot');
        }

        return {
            col3,
            sidebarSlot,
            calcSlot,
            nativeSnapshot: col3.__tmvuNativeSnapshot,
        };
    };

    const renderPlayerChrome = ({ rerenderSkills = false } = {}) => {
        if (!player) return;

        TmPlayerCard.render({
            player,
            club
        });

        const sidebarLayout = ensureSidebarLayout();
        if (sidebarLayout?.sidebarSlot) {
            TmPlayerSidebar.mount(sidebarLayout.sidebarSlot, {
                player,
                sourceRoot: sidebarLayout.nativeSnapshot,
            });
        }

        if (sidebarLayout?.calcSlot) {
            TmAsiCalculator.mount(sidebarLayout.calcSlot, { player });
        }

        if (rerenderSkills) TmSkillsGrid.reRender();
        else TmSkillsGrid.mount({ player });
    };

    const applyTooltip = (data) => {
        if (!data || !data.player) return;
        if (data.retired) return;

        player = data.player;
        club = data.club ?? null;

        /* re-render scout if already shown */
        TmScoutMod.reRender();
        /* parse NT data before card renders (cleans DOM) */
        const parsedNTData = TmHistoryMod.parseNT();

        renderPlayerChrome();

        /* re-render history if already loaded, so NT tab appears */
        if (parsedNTData && TmTabsMod.isLoaded('history')) TmHistoryMod.reRender();

        /* fetch scout data for Best Estimate card */
        fetchBestEstimate();

        TmTabsMod.mount({ player, getOwnClubIds, injectCSS });
    };

    //    INIT - run DB init and tooltip fetch in parallel
    //    -----------------------------------------------------------
    bootstrapShell();

    Promise.all([
        PlayerDB.init().then(() => PlayerArchiveDB.init()).catch(e => {
            console.warn('[DB] IndexedDB init failed, falling back:', e);
        }),
        TmPlayerService.fetchPlayerTooltip(PLAYER_ID),
    ])
        .then(([, data]) => applyTooltip(data));

    /* -----------------------------------------------------------
       BEST ESTIMATE see components/player/tm-player-best-estimate.js
       ----------------------------------------------------------- */
    const fetchBestEstimate = () => {
        const col1 = ensurePlayerLayout()?.leftRail;
        if (!col1) return;
        const el = ensureRailSlot(col1, 'tmbe-standalone', { prepend: true });
        if (!el) return;
        TmPlayerService.fetchPlayerInfo(PLAYER_ID, 'scout').then(data => {
            TmBestEstimate.render(el, {
                scoutData: data || {},
                player,
            });
        });
    };

    window.addEventListener('tm:growthUpdated', () => {
        try { TmGraphsMod.reRender(); } catch (e) { }
        try { TmSkillsGrid.reRender(); } catch (e) { }
    });

    window.addEventListener('tm:player-synced', event => {
        const syncedPlayer = event.detail?.player;
        const syncedId = event.detail?.id;
        if (!syncedPlayer || Number(syncedId) !== Number(PLAYER_ID)) return;
        player = syncedPlayer;
        try { renderPlayerChrome({ rerenderSkills: true }); } catch (e) { }
    });

}