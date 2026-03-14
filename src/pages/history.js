// ==UserScript==
// @name         TM Club History Enhanced
// @namespace    https://trophymanager.com
// @version      1
// @description  Enhanced club history page with tabbed interface for Records, Transfers, Matches, and League
// @match        https://trophymanager.com/history/club/*
// @grant        none
// @require      file://H:/projects/Moji/tmscripts/lib/tm-constants.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-position.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-utils.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-lib.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-playerdb.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-dbsync.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-services.js
// @require      file://H:/projects/Moji/tmscripts/components/shared/tm-ui.js
// @require      file://H:/projects/Moji/tmscripts/components/history/tm-history-styles.js
// @require      file://H:/projects/Moji/tmscripts/components/history/tm-history-helpers.js
// @require      file://H:/projects/Moji/tmscripts/components/history/tm-history-records.js
// @require      file://H:/projects/Moji/tmscripts/components/history/tm-history-transfers.js
// @require      file://H:/projects/Moji/tmscripts/components/history/tm-history-matches.js
// @require      file://H:/projects/Moji/tmscripts/components/history/tm-history-league.js
// ==/UserScript==

(function () {
    'use strict';

    const $ = window.jQuery;
    if (!$) return;

    const clubId = $('#club_id').val() || location.pathname.split('/').filter(Boolean)[3];
    if (!clubId) return;

    const seasons = [];
    $('#stats_season option').each(function () {
        const v = $(this).val();
        if (v) seasons.push({ id: v, label: $(this).text().trim() });
    });
    if (!seasons.length) return;

    const clubName = $('.box_sub_header .large strong a').first().text().trim() || 'Club';

    /* ───────── state ───────── */
    let activeTab = 'records';

    /* ───────── CSS ───────── */
    window.TmHistoryStyles.inject();

    /* =========================================================
       BUILD UI
       ========================================================= */
    function buildUI() {
        const boxBody = $('.column2_a .box_body');
        if (!boxBody.length) return;

        const hdr = boxBody.find('.box_sub_header').first();
        const hdrHtml = hdr.length ? hdr[0].outerHTML : '';

        boxBody.html(
            '<div class="box_shadow"></div>' +
            hdrHtml +
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

        boxBody.on('click', '.tmh-tab', function () {
            const t = $(this).data('t');
            if (t === activeTab) return;
            boxBody.find('.tmh-tab').removeClass('active');
            $(this).addClass('active');
            activeTab = t;
            render();
        });

        render();
    }

    function render() {
        const el = $('#tmh-wrap');
        const ctx = { clubId, seasons, clubName };
        switch (activeTab) {
            case 'records': window.TmHistoryRecords.render(el, ctx); break;
            case 'transfers': window.TmHistoryTransfers.render(el, ctx); break;
            case 'matches': window.TmHistoryMatches.render(el, ctx); break;
            case 'league': window.TmHistoryLeague.render(el, ctx); break;
        }
    }

    /* =========================================================
       INIT
       ========================================================= */
    $(document).ready(function () {
        setTimeout(buildUI, 400);
    });

})();
