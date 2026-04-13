import { TmUI } from '../../shared/tm-ui.js';
import { TmGraphsMod } from '../graphs/tm-graphs-mod.js';
import { TmHistoryMod } from '../history/tm-history-mod.js';
import { TmScoutMod } from '../scout/tm-scout-mod.js';
import { TmTrainingMod } from '../training/tm-player-training.js';

'use strict';

export const TmTabsMod = (() => {
    const CSS = `
#tmpe-container {
    margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.tmpe-panels {
    border: 1px solid var(--tmu-border-soft); border-top: none;
    border-radius: 0 0 var(--tmu-space-md) var(--tmu-space-md);
    padding: 0; min-height: 120px;
    background: var(--tmu-surface-card);
    box-shadow: 0 14px 30px var(--tmu-shadow-elev);
}
.tmpe-panel {
    animation: tmpe-fadeIn 0.25s ease-out;
    padding: var(--tmu-space-xl) var(--tmu-space-xl) var(--tmu-space-xl);
    background: var(--tmu-surface-dark-soft);
}
@keyframes tmpe-fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
    (() => { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); })();

    const TABS_DEF = [
        { key: 'history', label: 'History', mod: TmHistoryMod },
        { key: 'scout', label: 'Scout', mod: TmScoutMod },
        { key: 'training', label: 'Training', mod: TmTrainingMod },
        { key: 'graphs', label: 'Graphs', mod: TmGraphsMod },
    ];
    const TAB_ICONS = { history: '📋', scout: '🔍', training: '⚙', graphs: '📊' };

    const dataLoaded = {};
    let player = null;
    let rootContainer = null;

    const getProps = () => ({ player });

    const switchTab = (key) => {
        rootContainer?.querySelectorAll('.tmpe-main-tab').forEach(b =>
            b.classList.toggle('active', b.dataset.tab === key));
        rootContainer?.querySelectorAll('.tmpe-panel').forEach(p =>
            p.style.display = p.dataset.tab === key ? '' : 'none');

        if (dataLoaded[key]) return;

        const panel = rootContainer?.querySelector(`.tmpe-panel[data-tab="${key}"]`);
        if (!panel) return;

        dataLoaded[key] = true;

        const tab = TABS_DEF.find(t => t.key === key);
        if (tab?.mod?.load) { tab.mod.load(panel, player); return; }

        panel.innerHTML = TmUI.error('No loader for tab: ' + key);
    };

    const isLoaded = (key) => !!dataLoaded[key];

    let resizeTimer = null;
    let initRetries = 0;
    let _cssInjector = null;
    let _resizeBound = false;

    const onWindowResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => TmGraphsMod.reRender(), 300);
    };

    const _tryMount = () => {
        const mainRail = document.querySelector('#tmvp-main');
        const tabsContent = document.querySelector('.tabs_content');
        if (!mainRail || !tabsContent) {
            if (initRetries++ < 50) setTimeout(_tryMount, 200);
            return;
        }

        const existingContainer = document.getElementById('tmpe-container');
        if (existingContainer) {
            rootContainer = existingContainer;
            return;
        }

        _cssInjector?.();

        const container = document.createElement('div');
        container.id = 'tmpe-container';
        rootContainer = container;

        const bar = TmUI.tabs({
            items: TABS_DEF.map(t => ({
                key: t.key,
                label: t.label,
                icon: TAB_ICONS[t.key] || '',
            })),
            active: 'history',
            color: 'primary',
            stretch: true,
            itemCls: 'tmpe-main-tab',
            onChange: switchTab,
        });
        container.appendChild(bar);

        const panels = document.createElement('div');
        panels.className = 'tmpe-panels';
        TABS_DEF.forEach(t => {
            const p = document.createElement('div');
            p.className = 'tmpe-panel';
            p.dataset.tab = t.key;
            p.style.display = 'none';
            panels.appendChild(p);
        });
        container.appendChild(panels);

        mainRail.appendChild(container);

        if (!_resizeBound) {
            window.addEventListener('resize', onWindowResize);
            _resizeBound = true;
        }

        switchTab('history');
    };

    const mount = ({ player: p, injectCSS }) => {
        player = p;
        _cssInjector = injectCSS;
        initRetries = 0;
        _tryMount();
    };

    return { mount, isLoaded };
})();
