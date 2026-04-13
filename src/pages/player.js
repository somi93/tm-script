import { TmAsiCalculator } from '../components/player/card/tm-asi-calculator.js';
import { TmBestEstimate } from '../components/player/scout/tm-best-estimate.js';
import { TmGraphsMod } from '../components/player/graphs/tm-graphs-mod.js';
import { TmScoutsService } from '../services/scouts.js';
import { TmHistoryMod } from '../components/player/history/tm-history-mod.js';
import { TmPlayerCard } from '../components/player/card/tm-player-card.js';
import { TmPlayerSidebar } from '../components/player/card/tm-player-sidebar.js';
import { TmPlayerStyles } from '../components/player/card/tm-player-styles.js';
import { TmScoutMod } from '../components/player/scout/tm-scout-mod.js';
import { TmSkillsGrid } from '../components/player/skills/tm-skills-grid.js';
import { TmTabsMod } from '../components/player/tabs/tm-tabs-mod.js';
import { TmPlayerModel } from '../models/player.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';

export function initPlayerPage(main) {
    if (!main || !main.isConnected) return;

    const urlMatch = location.pathname.match(/\/players\/(\d+)/);
    if (!urlMatch) return;
    const PLAYER_ID = urlMatch[1];
    let nativeSidebarSnapshot = null;

    /* -----------------------------------------------------------
       SHARED STATE (tooltip-derived)
       ----------------------------------------------------------- */
    let player = null;


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
        });

        const sidebarLayout = ensureSidebarLayout();
        if (sidebarLayout?.sidebarSlot) {
            TmPlayerSidebar.mount(sidebarLayout.sidebarSlot, {
                player,
                isOwnPlayer: player.isOwnPlayer,
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
        if (!data) return;
        if (data.retired) return;

        player = data;

        renderPlayerChrome();

        /* fetch scout data — populates player.scoutReports/scouts/interestedClubs/bestEstimate */
        fetchScoutData();

        TmTabsMod.mount({ player, injectCSS });
    };

    //    INIT - run DB init and tooltip fetch in parallel
    //    -----------------------------------------------------------
    bootstrapShell();

    TmPlayerModel.fetchPlayerTooltip(PLAYER_ID)
        .then((data) => applyTooltip(data));

    /* -----------------------------------------------------------
       SCOUT DATA — fetched once after tooltip, shared by Best Estimate
       and the scout tab (TmScoutMod.load skips fetch if already set)
       ----------------------------------------------------------- */
    const fetchScoutData = () => {
        const col1 = ensurePlayerLayout()?.leftRail;
        if (!col1) return;
        const el = ensureRailSlot(col1, 'tmbe-standalone', { prepend: true });
        if (!el) return;
        TmScoutsService.fetchPlayerScouting(PLAYER_ID).then(data => {
            if (!data) return;
            player.scoutReports = data.reports || [];
            player.scouts = data.scouts || {};
            player.interestedClubs = data.interested || [];
            player.bestEstimate = data.bestEstimate || null;
            TmBestEstimate.render(el, { player });
        });
    };

}