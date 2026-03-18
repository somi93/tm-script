import { TmHistoryLeague } from '../components/history/tm-history-league.js';
import { TmHistoryMatches } from '../components/history/tm-history-matches.js';
import { TmHistoryRecords } from '../components/history/tm-history-records.js';
import { TmHistoryStyles } from '../components/history/tm-history-styles.js';
import { TmHistoryTransfers } from '../components/history/tm-history-transfers.js';
import { initClubLayout, normalizeClubHref } from '../components/club/tm-club-layout.js';

(function () {
    'use strict';
    if (!/^\/history\/club/.test(location.pathname)) return;

    const $ = window.jQuery;
    if (!$) return;

    const CURRENT_PATH = normalizeClubHref(window.location.pathname);
    const getHistoryContainer = () => document.querySelector('.tmvu-club-main, .column2_a');

    if (!document.getElementById('tmvu-history-pending-style')) {
        const style = document.createElement('style');
        style.id = 'tmvu-history-pending-style';
        style.textContent = `
            .tmvu-club-main.tmvu-history-pending,
            .column2_a.tmvu-history-pending {
                visibility: hidden;
            }
        `;
        document.head.appendChild(style);
    }

    const setPendingVisibility = (pending) => {
        document.querySelectorAll('.tmvu-club-main, .column2_a').forEach(node => {
            node.classList.toggle('tmvu-history-pending', pending);
        });
    };

    const waitForHistoryContainer = () => new Promise(resolve => {
        const existing = getHistoryContainer();
        if (existing) {
            resolve(existing);
            return;
        }

        const observer = new MutationObserver(() => {
            const container = getHistoryContainer();
            if (!container) return;
            observer.disconnect();
            resolve(container);
        });

        observer.observe(document.body, { childList: true, subtree: true });
    });

    const waitForDomReady = () => new Promise(resolve => {
        if (document.readyState !== 'loading') {
            resolve();
            return;
        }
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
    });

    let clubId = null;
    let seasons = [];
    let clubName = 'Club';

    /* ───────── state ───────── */
    let activeTab = 'records';

    /* ───────── CSS ───────── */
    TmHistoryStyles.inject();

    /* =========================================================
       BUILD UI
       ========================================================= */
    function buildUI() {
        const container = getHistoryContainer();
        if (!container) return;

        const $container = $(container);

        $container.html(
            '<div class="tmh-outer tmu-card">' +
            '<div class="tmh-tabs">' +
            '<div class="tmh-tab active" data-t="records">Records</div>' +
            '<div class="tmh-tab" data-t="transfers">Transfers</div>' +
            '<div class="tmh-tab" data-t="matches">Matches</div>' +
            '<div class="tmh-tab" data-t="league">League</div>' +
            '</div>' +
            '<div class="tmh-wrap" id="tmh-wrap"></div>' +
            '</div>'
        );

        setPendingVisibility(false);

        $container.off('click', '.tmh-tab').on('click', '.tmh-tab', function () {
            const t = $(this).data('t');
            if (t === activeTab) return;
            $container.find('.tmh-tab').removeClass('active');
            $(this).addClass('active');
            activeTab = t;
            render();
        });

        render();
    }

    function initializeContext() {
        clubId = $('#club_id').val() || location.pathname.split('/').filter(Boolean)[3];
        if (!clubId) return false;

        seasons = [];
        $('#stats_season option').each(function () {
            const value = $(this).val();
            if (value) seasons.push({ id: value, label: $(this).text().trim() });
        });
        if (!seasons.length) return false;

        clubName = $('.box_sub_header .large strong a').first().text().trim() || 'Club';
        return true;
    }

    function render() {
        const el = $('#tmh-wrap');
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
        await waitForDomReady();
        initClubLayout({ currentPath: CURRENT_PATH });
        setPendingVisibility(true);
        await waitForHistoryContainer();

        if (!initializeContext()) {
            setPendingVisibility(false);
            return;
        }

        buildUI();
    }

    start();

})();
