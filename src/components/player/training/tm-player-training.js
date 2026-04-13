'use strict';

import { TmPlayerService } from '../../../services/player.js';
import { TmClubService } from '../../../services/club.js';
import { TmUI } from '../../shared/tm-ui.js';
import { TMT_CSS, attachSharedShadowStyles } from './training-styles.js';
import { mountGkTraining } from './gk-training.js';
import { mountStandardTraining } from './standard-training.js';
import { mountCustomTraining } from './custom-training.js';

export const TmTrainingMod = (() => {
    let player = null;
    let readOnly = false;
    let onStateChange = null;

    const tabsHtml = (customOn) => {
        const node = TmUI.tabs({
            items: [
                { key: 'std', label: 'Standard' },
                { key: 'cus', label: 'Custom', cls: 'tmt-tab-pro' },
            ],
            active: customOn ? 'cus' : 'std',
            color: 'primary',
            stretch: true,
            cls: 'tmt-tabs',
            itemCls: 'tmt-tab',
        });
        return node ? node.outerHTML : '';
    };

    const render = (container, { player: playerArg, readOnly: readOnlyArg = false, onStateChange: onStateChangeArg = null } = {}) => {
        player = playerArg; readOnly = readOnlyArg; onStateChange = onStateChangeArg;

        if (player.isGK) return mountGkTraining(container);

        const customOn = player.training.custom.some(v => v !== null);

        container.innerHTML = '';
        const host = document.createElement('div');
        container.appendChild(host);
        const shadow = host.attachShadow({ mode: 'open' });

        shadow.innerHTML = `<style>${TMT_CSS}</style>
            <div class="tmt-wrap ${readOnly ? 'tmt-readonly' : ''}">
                ${tabsHtml(customOn).replace('</div>', '<span class="tmt-readonly-badge">\uD83D\uDC41 View only</span></div>')}
                <div class="tmt-body" id="tmt-body"></div>
            </div>`;
        attachSharedShadowStyles(shadow);

        const body = shadow.getElementById('tmt-body');

        const switchToStandard = () => {
            shadow.querySelector('.tmt-tab[data-tab="cus"]')?.classList.remove('active');
            shadow.querySelector('.tmt-tab[data-tab="std"]')?.classList.add('active');
            mountStandardTraining(body, player, { readOnly, onStateChange });
        };
        const switchToCustom = () => {
            shadow.querySelector('.tmt-tab[data-tab="std"]')?.classList.remove('active');
            shadow.querySelector('.tmt-tab[data-tab="cus"]')?.classList.add('active');
            mountCustomTraining(body, player, { readOnly, onStateChange });
        };

        if (!readOnly) {
            shadow.addEventListener('click', (e) => {
                if (e.target.closest('.tmt-tab[data-tab="std"]') && !shadow.querySelector('.tmt-tab[data-tab="std"]')?.classList.contains('active')) switchToStandard();
                if (e.target.closest('.tmt-tab[data-tab="cus"]') && !shadow.querySelector('.tmt-tab[data-tab="cus"]')?.classList.contains('active')) switchToCustom();
            });
        }

        if (customOn) mountCustomTraining(body, player, { readOnly, onStateChange });
        else mountStandardTraining(body, player, { readOnly, onStateChange });
    };

    const load = (container, player) => {
        if (player.isOwnPlayer) {
            container.innerHTML = TmUI.loading();
            TmPlayerService.fetchPlayerTraining(player.id).then(training => {
                if (!training) {
                    container.innerHTML = TmUI.error('Failed to load data');
                    return;
                }
                console.log('Fetched training data:', training);
                player.training = training;
                render(container, { player });
            });
        } else if (player.training != null) {
            render(container, { player, readOnly: true });
        } else {
            container.innerHTML = TmUI.loading();
            TmClubService.fetchSquadRaw(player.club_id).then(squad => {
                const found = (squad || []).find(p => Number(p.id) === Number(player.id));
                if (!found) {
                    container.innerHTML = TmUI.error('Player not found in squad data');
                    return;
                }
                player.training = found.training;
                render(container, { player, readOnly: true });
            });
        }
    };

    return { render, load };
})();
