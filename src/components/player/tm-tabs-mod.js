import { TmApi } from '../../lib/tm-services.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmGraphsMod } from './tm-graphs-mod.js';
import { TmHistoryMod } from './tm-history-mod.js';
import { TmScoutMod } from './tm-scout-mod.js';
import { TmTrainingMod } from './tm-training-mod.js';

'use strict';

export const TmTabsMod = (() => {
    const CSS = `
#tmpe-container {
    margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.tmpe-tabs-bar {
    display: flex; background: #274a18;
    border: 1px solid #3d6828; border-bottom: none;
    border-radius: 8px 8px 0 0; overflow: hidden;
}
.tmpe-main-tab {
    flex: 1; padding: 8px 12px; text-align: center; font-size: 12px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.5px; color: #90b878; cursor: pointer;
    border: none; border-bottom: 2px solid transparent; transition: all 0.15s;
    background: transparent; font-family: inherit;
    -webkit-appearance: none; appearance: none;
    display: flex; align-items: center; justify-content: center; gap: 6px;
}
.tmpe-main-tab .tmpe-icon { font-size: 14px; line-height: 1; }
.tmpe-main-tab:hover { color: #c8e0b4; background: #305820; }
.tmpe-main-tab.active { color: #e8f5d8; border-bottom-color: #6cc040; background: #305820; }
.tmpe-panels {
    border: 1px solid #3d6828; border-top: none;
    border-radius: 0 0 8px 8px;
    padding: 0; min-height: 120px;
    background: #1c3410;
}
.tmpe-panel {
    animation: tmpe-fadeIn 0.25s ease-out;
    padding: 8px;
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
    let _getOwnClubIds = () => [];

    const _isGK = () => String(player?.favposition || '').split(',')[0].trim().toLowerCase() === 'gk';
    const _playerASI = () => (player?.asi > 0) ? player.asi : 0;
    const _playerClubId = () => player?.club_id ?? null;

    const getProps = () => {
        const ownIds = _getOwnClubIds();
        const clubId = String(_playerClubId() ?? '');
        return {
            isGK: _isGK(),
            playerId: player?.id ?? null,
            playerASI: _playerASI(),
            ownClubIds: ownIds,
            isOwnPlayer: !!clubId && ownIds.includes(clubId),
        };
    };

    /* Build a TmTrainingMod-compatible data object from a squad player entry.
       squad player has: training (type string), training_custom (6-char dots string), favposition */
    const _adaptSquadTraining = (sp) => {
        const gk = String(sp.favposition || '').split(',')[0].trim().toLowerCase() === 'gk';
        if (gk) return { custom: { gk: true } };
        const customStr = sp.training_custom || '';
        const isCustom = customStr.length === 6;
        const custom = {};
        for (let i = 0; i < 6; i++) {
            custom[`team${i + 1}`] = { points: isCustom ? (parseInt(customStr[i]) || 0) : 0, skills: [], label: `Team ${i + 1}` };
        }
        custom.points_spend = 0;
        return { custom: { gk: false, custom_on: isCustom, team: String(sp.training || '3'), custom } };
    };

    const _ERR_HTML = (msg) => TmUI.error(msg);

    /* Fetch training for own player (full edit) or foreign player (read-only via squad) */
    const _fetchTraining = (panel) => {
        const ownIds = _getOwnClubIds();
        const clubId = String(_playerClubId() ?? '');
        const isOwn = !!clubId && ownIds.includes(clubId);

        const playerId = player?.id ?? null;
        if (isOwn) {
            TmApi.fetchPlayerInfo(playerId, 'training').then(data => {
                if (!data) { panel.innerHTML = _ERR_HTML('Failed to load data'); return; }
                dataLoaded['training'] = true;
                TmTrainingMod.render(panel, data, getProps());
            });
        } else {
            if (!clubId) { panel.innerHTML = _ERR_HTML('Cannot load training — club not yet loaded, try again'); return; }
            TmApi.fetchSquadRaw(clubId).then(data => {
                const post = data?.post ?? {};
                const sp = post[String(playerId)];
                if (!sp) { panel.innerHTML = _ERR_HTML('Player not found in squad data'); return; }
                dataLoaded['training'] = true;
                TmTrainingMod.render(panel, _adaptSquadTraining(sp), { playerId, readOnly: true });
            });
        }
    };

    const switchTab = (key) => {
        document.querySelectorAll('.tmpe-main-tab').forEach(b =>
            b.classList.toggle('active', b.dataset.tab === key));
        document.querySelectorAll('.tmpe-panel').forEach(p =>
            p.style.display = p.dataset.tab === key ? '' : 'none');

        if (dataLoaded[key]) return;

        const panel = document.querySelector(`.tmpe-panel[data-tab="${key}"]`);
        if (!panel) return;

        panel.innerHTML = TmUI.loading();

        if (key === 'training') { _fetchTraining(panel); return; }

        TmApi.fetchPlayerInfo(player?.id ?? null, key).then(data => {
            if (!data) {
                panel.innerHTML = TmUI.error('Failed to load data');
                return;
            }
            dataLoaded[key] = true;
            const tab = TABS_DEF.find(t => t.key === key);
            if (tab) tab.mod.render(panel, data, getProps());
        });
    };

    const isLoaded = (key) => !!dataLoaded[key];

    let resizeTimer = null;
    let initRetries = 0;
    let _cssInjector = null;

    const _tryMount = () => {
        const tabsContent = document.querySelector('.tabs_content');
        if (!tabsContent) {
            if (initRetries++ < 50) setTimeout(_tryMount, 200);
            return;
        }

        _cssInjector?.();

        const container = document.createElement('div');
        container.id = 'tmpe-container';

        const bar = document.createElement('div');
        bar.className = 'tmpe-tabs-bar';
        TABS_DEF.forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'tmpe-main-tab';
            btn.dataset.tab = t.key;
            btn.innerHTML = `<span class="tmpe-icon">${TAB_ICONS[t.key] || ''}</span>${t.label}`;
            btn.addEventListener('click', () => switchTab(t.key));
            bar.appendChild(btn);
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

        tabsContent.parentNode.insertBefore(container, tabsContent);

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => TmGraphsMod.reRender(), 300);
        });

        switchTab('history');
    };

    const mount = ({ player: p, getOwnClubIds, injectCSS }) => {
        player = p;
        _getOwnClubIds = getOwnClubIds;
        _cssInjector = injectCSS;
        initRetries = 0;
        _tryMount();
    };

    return { mount, isLoaded, switchTab };
})();
