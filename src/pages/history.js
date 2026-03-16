import { TmHistoryLeague } from '../components/history/tm-history-league.js';
import { TmHistoryMatches } from '../components/history/tm-history-matches.js';
import { TmHistoryRecords } from '../components/history/tm-history-records.js';
import { TmHistoryStyles } from '../components/history/tm-history-styles.js';
import { TmHistoryTransfers } from '../components/history/tm-history-transfers.js';

(function () {
    'use strict';
    if (true) return; // disable for now, needs refactor and update to work with new site design
    if (!/^\/history\/club/.test(location.pathname)) return;

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
    TmHistoryStyles.inject();

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
            case 'records': TmHistoryRecords.render(el, ctx); break;
            case 'transfers': TmHistoryTransfers.render(el, ctx); break;
            case 'matches': TmHistoryMatches.render(el, ctx); break;
            case 'league': TmHistoryLeague.render(el, ctx); break;
        }
    }

    /* =========================================================
       INIT
       ========================================================= */
    $(document).ready(function () {
        setTimeout(buildUI, 400);
    });

})();
