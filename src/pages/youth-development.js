import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmUtils } from '../lib/tm-utils.js';
import { TmYouthPlayerCard } from '../components/youth/tm-youth-player-card.js';
import { TmYouthHero } from '../components/youth/tm-youth-hero.js';
import { TmYouthService } from '../services/youth.js';

'use strict';

let mountedMain = null;
let mainColumn = null;

const parseMenu = (sourceRoot) => Array.from(sourceRoot.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
    if (node.tagName === 'HR') return [{ type: 'separator' }];
    if (node.tagName !== 'A') return [];
    const label = node.textContent.replace(/\s+/g, ' ').trim();
    return [{
        type: 'link',
        href: node.getAttribute('href') || '#',
        label,
        icon: /training/i.test(label) ? '🏋' : /player/i.test(label) ? '🧒' : /facilit/i.test(label) ? '🏟' : '•',
        isSelected: node.classList.contains('selected'),
    }];
});

const parseSelectOptions = (sourceRoot, selector) => {
    const select = sourceRoot.querySelector(selector);
    return Array.from(select?.options || []).map(option => ({
        value: String(option.value || ''),
        label: option.textContent.replace(/\s+/g, ' ').trim(),
        selected: option.selected,
    }));
};

const isNodeVisible = (node) => {
    if (!node) return false;
    if (node.hidden) return false;
    if (node.classList.contains('display_none')) return false;
    const inlineStyle = String(node.getAttribute('style') || '').toLowerCase();
    if (inlineStyle.includes('display:none') || inlineStyle.includes('visibility:hidden')) return false;
    return true;
};

const parsePullControls = (sourceRoot) => {
    const ageOptions = parseSelectOptions(sourceRoot, '#age_focus');
    const positionOptions = parseSelectOptions(sourceRoot, '#position_focus');
    const pullButton = sourceRoot.querySelector('#pull_new_youths');
    const pullSubmit = pullButton?.querySelector('button, input[type="submit"], input[type="button"]');
    const pullLabel = (pullSubmit?.value || pullSubmit?.textContent || '').replace(/\s+/g, ' ').trim() || 'Get Report';
    return {
        available: Boolean(pullButton && ageOptions.length && positionOptions.length),
        visible: Boolean(isNodeVisible(pullButton) && ageOptions.length && positionOptions.length),
        label: pullLabel,
        ageOptions,
        positionOptions,
        selectedAge: ageOptions.reduce((min, o) => Number(o.value) < Number(min) ? o.value : min, ageOptions[0]?.value || ''),
        selectedPosition: positionOptions.find(option => option.selected)?.value || positionOptions[0]?.value || '',
    };
};

const decoratePlayers = (players, { revealed, pulledNew = false } = {}) => (players || []).map(player => ({
    ...player,
    _revealed: revealed,
    _pulledNew: pulledNew,
    _status: 'active',
    _disableHire: false,
    _resultPlayerId: '',
}));

const syncHireAvailability = (players) => {
    // Let the backend enforce the squad cap — only disable after confirmed hire failures.
    return (players || []).map(player => player._status === 'active'
        ? { ...player, _disableHire: false }
        : player);
};

let state = null;

const getActivePlayers = () => state.players.filter(player => player._status === 'active');
const getHiddenPlayers = () => getActivePlayers().filter(player => !player._revealed);
const setPlayers = (players) => {
    state.players = syncHireAvailability(players);
};

const findPlayer = (playerId) => state.players.find(player => Number(player.id) === Number(playerId));

const confirmAction = ({ icon, title, message, confirmLabel, confirmStyle = 'primary' }) => TmUI.modal({
    icon,
    title,
    message,
    buttons: [
        { label: confirmLabel, value: 'ok', style: confirmStyle },
        { label: 'Cancel', value: 'cancel', style: 'secondary' },
    ],
});

const renderPage = () => {
    if (!mainColumn) return;
    const heroContainer = document.createElement('div');
    const heroHtml = TmYouthHero.render(heroContainer, {
        pull: state.pull,
        selectedAge: state.selectedAge,
        selectedPosition: state.selectedPosition,
        activePlayers: getActivePlayers().length,
        hiddenPlayers: getHiddenPlayers().length,
        notice: state.notice,
    });
    const playersHtml = state.players.length
        ? `<section class="tmu-stack tmu-stack-density-regular">${state.players.map(p => TmYouthPlayerCard.render(p)).join('')}</section>`
        : TmUI.empty('Youth player data was not available from the endpoint.');
    TmUI.render(mainColumn, `${heroHtml}${playersHtml}`);

    hydrateBulkActions(mainColumn);
    hydratePlayerActions(mainColumn);
};

const setBusy = (busy) => {
    state.busy = busy;
    renderPage();
};

const markPlayer = (playerId, patch) => {
    setPlayers(state.players.map(player => Number(player.id) === Number(playerId)
        ? { ...player, ...patch }
        : player));
};

const revealPlayer = (playerId) => {
    markPlayer(playerId, { _revealed: true });
    renderPage();
    TmYouthPlayerCard.animateReveal(playerId);
};

const revealAllPlayers = () => {
    setPlayers(state.players.map(player => player._status === 'active'
        ? { ...player, _revealed: true }
        : player));
    renderPage();
};

const handlePullNewPlayers = async () => {
    if (state.busy || !state.pull.available || !state.pull.visible) return;
    setBusy(true);
    try {
        const result = await TmYouthService.fetchNewYouthPlayers({
            age: state.selectedAge,
            position: state.selectedPosition,
            skipSync: true,
        });
        if (!result) {
            state.notice = 'The youth endpoint did not return data for a new pull.';
            return;
        }
        if (result.error) {
            state.notice = result.error;
            return;
        }

        const newPlayers = decoratePlayers(result.players || [], { revealed: false, pulledNew: true });
        if (!newPlayers.length) {
            state.notice = 'No new youth players were returned for the selected focus.';
            return;
        }

        setPlayers([...newPlayers, ...state.players]);
        state.pull.visible = false;
        state.notice = 'New youth players loaded. Reveal them before hire or fire actions unlock.';
    } catch (error) {
        state.notice = error?.message || 'Failed to pull new youth players.';
    } finally {
        setBusy(false);
    }
};

const handleHirePlayer = async (playerId) => {
    const player = findPlayer(playerId);
    if (!player || state.busy || player._status !== 'active' || !player._revealed || player._disableHire) return;

    const choice = await confirmAction({
        icon: '🟢',
        title: 'Hire Youth Player',
        message: `Hire <strong>${TmUtils.escHtml(player.name)}</strong> into your club?`,
        confirmLabel: 'Hire Player',
        confirmStyle: 'primary',
    });
    if (choice !== 'ok') return;

    setBusy(true);
    try {
        const result = await TmYouthService.actOnYouthPlayer({ playerId, action: 'hire' });
        if (result?.yes === 'yes') {
            state.cash -= Number(player.youthFee) || 0;
            markPlayer(playerId, {
                _status: 'hired',
                _resultPlayerId: String(result.player_id || player.id || ''),
            });
            state.notice = `${player.name} was hired successfully.`;
        } else {
            state.notice = `Failed to hire ${player.name}.`;
        }
    } catch (error) {
        state.notice = error?.message || `Failed to hire ${player.name}.`;
    } finally {
        setBusy(false);
    }
};

const handleFirePlayer = async (playerId) => {
    const player = findPlayer(playerId);
    if (!player || state.busy || player._status !== 'active' || !player._revealed) return;

    const choice = await confirmAction({
        icon: '🔴',
        title: 'Fire Youth Player',
        message: `Release <strong>${TmUtils.escHtml(player.name)}</strong> from the youth intake?`,
        confirmLabel: 'Fire Player',
        confirmStyle: 'danger',
    });
    if (choice !== 'ok') return;

    setBusy(true);
    try {
        const result = await TmYouthService.actOnYouthPlayer({ playerId, action: 'fire' });
        if (result?.yes === 'yes') {
            markPlayer(playerId, { _status: 'fired' });
            state.notice = `${player.name} was released.`;
        } else {
            state.notice = `Failed to fire ${player.name}.`;
        }
    } catch (error) {
        state.notice = error?.message || `Failed to fire ${player.name}.`;
    } finally {
        setBusy(false);
    }
};

const handleFireAllPlayers = async () => {
    const activePlayers = getActivePlayers();
    if (!activePlayers.length || state.busy || getHiddenPlayers().length) return;

    const choice = await confirmAction({
        icon: '⚠️',
        title: 'Fire All Youth Players',
        message: 'Release every active youth player in the current intake?',
        confirmLabel: 'Fire All',
        confirmStyle: 'danger',
    });
    if (choice !== 'ok') return;

    setBusy(true);
    try {
        const result = await TmYouthService.actOnYouthPlayer({ playerId: 'all', action: 'fire' });
        if (result?.yes === 'yes') {
            setPlayers(state.players.map(player => player._status === 'active'
                ? { ...player, _status: 'fired', _revealed: true }
                : player));
            state.notice = 'All active youth players were released.';
        } else {
            state.notice = 'Failed to fire all youth players.';
        }
    } catch (error) {
        state.notice = error?.message || 'Failed to fire all youth players.';
    } finally {
        setBusy(false);
    }
};

const hydrateBulkActions = (root) => {
    const mount = root.querySelector('[data-youth-bulk-actions]');
    if (!mount) return;

    const activeCount = getActivePlayers().length;
    const hiddenCount = getHiddenPlayers().length;

    if (state.pull.visible) {
        mount.appendChild(TmUI.button({
            label: state.busy ? 'Pulling...' : state.pull.label,
            color: 'primary',
            size: 'sm',
            disabled: state.busy,
            onClick: handlePullNewPlayers,
        }));
    }

    if (hiddenCount > 0) {
        mount.appendChild(TmUI.button({
            label: 'Reveal All',
            color: 'secondary',
            size: 'sm',
            disabled: state.busy,
            onClick: revealAllPlayers,
        }));
    }

    if (activeCount > 0) {
        mount.appendChild(TmUI.button({
            label: 'Fire All',
            color: 'danger',
            size: 'sm',
            disabled: state.busy || hiddenCount > 0,
            onClick: handleFireAllPlayers,
        }));
    }
};

const hydratePlayerActions = (root) => {
    root.querySelectorAll('[data-player-actions]').forEach(actionRow => {
        if (actionRow.childElementCount) return;

        const playerId = Number(actionRow.getAttribute('data-player-actions'));
        const player = findPlayer(playerId);
        if (!player || player._status !== 'active') return;

        if (!player._revealed) {
            actionRow.appendChild(TmUI.button({
                label: 'Reveal',
                color: 'primary',
                size: 'sm',
                disabled: state.busy,
                onClick: () => revealPlayer(playerId),
            }));
        }

        actionRow.appendChild(TmUI.button({
            slot: 'Hire <img src="/pics/mini_green_check.png" alt="">',
            color: 'lime',
            size: 'sm',
            disabled: state.busy || !player._revealed || player._disableHire,
            onClick: () => handleHirePlayer(playerId),
        }));

        actionRow.appendChild(TmUI.button({
            slot: 'Fire <img src="/pics/small_red_x.png" alt="">',
            color: 'danger',
            size: 'sm',
            disabled: state.busy || !player._revealed,
            onClick: () => handleFirePlayer(playerId),
        }));
    });
};

export async function initYouthDevelopmentPage(main) {
    const routeMatches = /^\/youth-development(?:\/.*)?$/i.test(window.location.pathname);
    const pageTitleText = String(document.querySelector('.main_center .box_head h2, .tmvu-main .box_head h2')?.textContent || '').replace(/\s+/g, ' ').trim();
    const menuText = String(document.querySelector('.column1 .content_menu, .tmvu-main .column1 .content_menu')?.textContent || '').replace(/\s+/g, ' ').trim();
    const looksLikeYouthPage = /youth development/i.test(pageTitleText)
        || (/training/i.test(menuText) && /players/i.test(menuText) && /facilit/i.test(menuText));
    if (!routeMatches && !looksLikeYouthPage) return;
    if (!main || !main.isConnected) return;
    if (mountedMain === main && mainColumn?.isConnected) return;

    const sourceRoot = document.querySelector('.main_center');
    if (!sourceRoot) return;
    if (!sourceRoot.querySelector('.column1 .content_menu, #age_focus, #position_focus')) return;

    mountedMain = main;

    const pullControls = parsePullControls(sourceRoot);
    const initialData = await TmYouthService.fetchYouthPlayers({ skipSync: true });
    state = {
        busy: false,
        notice: '',
        cash: Number(initialData?.cash) || 0,
        squadSize: Number(initialData?.squad_size) || 0,
        pull: pullControls,
        selectedAge: pullControls.selectedAge,
        selectedPosition: pullControls.selectedPosition,
        players: syncHireAvailability(decoratePlayers(initialData?.players || [], { revealed: true })),
    };

    const menuItems = parseMenu(sourceRoot);

    injectTmPageLayoutStyles();
    TmYouthPlayerCard.injectStyles();

    main.classList.add('tmvu-yd-page', 'tmu-page-layout-2col', 'tmu-page-density-compact');
    main.innerHTML = `
            <section class="tmvu-yd-main tmu-page-section-stack"></section>
        `;

    if (menuItems.length) {
        TmSideMenu.mount(main, {
            id: 'tmvu-yd-side-menu',
            className: 'tmu-page-sidebar-stack',
            items: menuItems,
            currentHref: menuItems.find(item => item.isSelected)?.href || window.location.pathname,
        });
    }

    mainColumn = main.querySelector('.tmvu-yd-main');
    if (!mainColumn) return;

    if (!mainColumn.dataset.tmvuYouthFiltersBound) {
        mainColumn.dataset.tmvuYouthFiltersBound = '1';
        mainColumn.addEventListener('change', (event) => {
            const ageSelect = event.target.closest('[data-youth-age]');
            if (ageSelect) {
                state.selectedAge = ageSelect.value;
                return;
            }

            const positionSelect = event.target.closest('[data-youth-position]');
            if (positionSelect) {
                state.selectedPosition = positionSelect.value;
            }
        });
    }

    renderPage();
}