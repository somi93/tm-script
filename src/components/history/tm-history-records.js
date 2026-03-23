import { TmClubService } from '../../services/club.js';
import { TmUI } from '../shared/tm-ui.js';

const $ = window.jQuery;

    let _clubId = null, _el = null;
    let recordsCache = null;

    function renderRecords() {
        const el = _el;
        if (recordsCache) { el.html(recordsCache); return; }

        el.html(TmUI.loading('Loading records…'));

        TmClubService.fetchClubRecords(_clubId).then(function(html) {
            if (!html) { el.html(TmUI.error('Failed to load records')); return; }
            const doc = $('<div>').html(html);

                const prTbl = doc.find('h3').filter(function () {
                    return /player\s*records/i.test($(this).text());
                }).next('table');

                const thBlk = doc.find('#tab0');

                let h = '<div class="tmh-sec">Player Records</div>';
                h += prTbl.length ? prTbl[0].outerHTML : TmUI.empty('No player records found');
                h += '<div class="tmh-sec">Tournament History</div>';
                h += thBlk.length ? thBlk.html() : TmUI.empty('No tournament history found');

                recordsCache = h;
                el.html(h);
        });
    }

    export const TmHistoryRecords = {
        render(el, ctx) {
            _el = el;
            _clubId = ctx.clubId;
            renderRecords();
        }
    };
