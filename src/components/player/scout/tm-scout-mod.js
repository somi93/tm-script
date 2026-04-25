import { TmScoutsModel } from '../../../models/scouts.js';
import { TmUI } from '../../shared/tm-ui.js';
import { mountScoutReport } from './scout-report.js';
import { mountScoutScouts } from './scout-scouts.js';
import { mountScoutInterested } from './scout-interested.js';
import './scout-styles.js';

export const TmScoutMod = (() => {
    let containerRef = null;
    let player = null;
    let activeTab = 'report';
    let root = null;

    const q = (sel) => root ? root.querySelector(sel) : null;

    const mountTab = (el, tab) => {
        switch (tab) {
            case 'report': return mountScoutReport(el, player.scoutReports);
            case 'scouts': return mountScoutScouts(el, player.scouts, player, {
                onReRender: (newData) => render(containerRef, { player }),
            });
            case 'interested': return mountScoutInterested(el, player.interestedClubs);
        }
    };

    const render = (container, { player: p } = {}) => {
        containerRef = container;
        player = p;
        activeTab = (player.scoutReports && player.scoutReports.length) ? 'report' : 'scouts';

        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.id = 'tmsc-root';
        container.appendChild(wrapper);
        root = wrapper;

        const TAB_LABELS = {
            report: 'Report',
            scouts: 'Scouts',
            interested: 'Interested'
        };
        const hasData = k => k === 'report' ? !!(player.scoutReports && player.scoutReports.length > 0)
            : k === 'interested' ? !!(player.interestedClubs && player.interestedClubs.length > 0)
                : k === 'scouts' ? !!(player.scouts && Object.keys(player.scouts).length > 0)
                    : true;

        const tabsEl = TmUI.tabs({
            items: Object.entries(TAB_LABELS).map(([key, label]) => ({ key, label, disabled: !hasData(key) })),
            active: activeTab,
            color: 'primary',
            cls: 'tmsc-tabs',
            stretch: true,
            onChange: (key) => {
                activeTab = key;
                const c = q('#tmsc-tab-content');
                if (!c) return;
                mountTab(c, key);
            },
        });

        root.innerHTML = '<div class="tmsc-wrap"></div>';
        const scWrap = root.querySelector('.tmsc-wrap');
        scWrap.appendChild(tabsEl);

        const bodyEl = document.createElement('div');
        bodyEl.className = 'tmsc-body';
        bodyEl.id = 'tmsc-tab-content';
        scWrap.appendChild(bodyEl);

        mountTab(bodyEl, activeTab);
        TmUI?.render(root);
    };

    const load = (container, player) => {
        if (player.scoutReports) {
            render(container, { player });
            return;
        }
        container.innerHTML = TmUI.loading();
        TmScoutsModel.fetchPlayerScouting(player.id).then(data => {
            if (!data) {
                container.innerHTML = TmUI.error('Failed to load data');
                return;
            }
            player.scoutReports    = data.reports    || [];
            player.scouts          = data.scouts     || {};
            player.interestedClubs = data.interested || [];
            player.bestEstimate    = data.bestEstimate || null;
            render(container, { player });
        });
    };

    return { render, load };
})();
