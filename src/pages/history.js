import { TmHistoryLeague } from '../components/history/tm-history-league.js';
import { TmHistoryMatches } from '../components/history/tm-history-matches.js';
import { TmHistoryRecords } from '../components/history/tm-history-records.js';
import { TmHistoryStyles } from '../components/history/tm-history-styles.js';
import { TmHistoryTransfers } from '../components/history/tm-history-transfers.js';
import { initClubLayout, normalizeClubHref } from '../components/club/tm-club-layout.js';
import { TmUI } from '../components/shared/tm-ui.js';

'use strict';

let CURRENT_PATH = '';
const getHistoryContainer = () => document.querySelector('.tmvu-main > .tmvu-club-main');

const setPendingVisibility = (pending) => {
    getHistoryContainer()?.classList.toggle('tmvu-history-pending', pending);
};

const waitForHistoryContainer = () => Promise.resolve(getHistoryContainer());

let clubId = null;
let seasons = [];
let clubName = 'Club';
let activeTab = 'records';

/* =========================================================
   BUILD UI
   ========================================================= */
function buildUI() {
    const container = getHistoryContainer();
    if (!container) return;

    const tabItems = [
        { key: 'records', label: 'Records' },
        { key: 'transfers', label: 'Transfers' },
        { key: 'matches', label: 'Matches' },
        { key: 'league', label: 'League' },
    ];

    container.innerHTML =
        '<div class="tmh-outer tmu-card">' +
        '<div class="tmh-tabs"></div>' +
        '<div class="tmh-wrap" id="tmh-wrap"></div>' +
        '</div>';

    const tabsHost = container.querySelector('.tmh-tabs');
    tabsHost?.appendChild(TmUI.tabs({
        items: tabItems,
        active: activeTab,
        color: 'primary',
        stretch: true,
        onChange: (key) => {
            if (key === activeTab) return;
            activeTab = key;
            render();
        },
    }));

    setPendingVisibility(false);

    render();
}

function initializeContext() {
    clubId = document.getElementById('club_id')?.value || location.pathname.split('/').filter(Boolean)[3];
    if (!clubId) return false;

    seasons = [];
    Array.from(document.querySelectorAll('#stats_season option')).forEach(function (opt) {
        if (opt.value) seasons.push({ id: opt.value, label: opt.textContent.trim() });
    });
    if (!seasons.length) return false;

    clubName = document.querySelector('.box_sub_header .large strong a')?.textContent.trim() || 'Club';
    return true;
}

function render() {
    const el = document.getElementById('tmh-wrap');
    if (!el) return;
    const ctx = { clubId, seasons, clubName };
    switch (activeTab) {
        case 'records': TmHistoryRecords.render(el, ctx); break;
        case 'transfers': TmHistoryTransfers.render(el, ctx); break;
        case 'matches': TmHistoryMatches.render(el, ctx); break;
        case 'league': TmHistoryLeague.render(el, ctx); break;
    }
}

/* =========================================================
   INIT
   ========================================================= */
async function start() {
    initClubLayout({ currentPath: CURRENT_PATH });
    setPendingVisibility(true);
    await waitForHistoryContainer();

    if (!initializeContext()) {
        setPendingVisibility(false);
        return;
    }

    buildUI();
}

export function initHistoryPage(main) {
    if (!main || !main.isConnected) return;
    _main = main;
    CURRENT_PATH = normalizeClubHref(window.location.pathname);
    clubId = null; seasons = []; clubName = 'Club'; activeTab = 'records';
    TmHistoryStyles.inject();
    start();
}
