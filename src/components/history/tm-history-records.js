import { TmApi }  from '../../services/index.js' ;

const $ = window.jQuery;

    let _clubId = null, _el = null;
    let recordsCache = null;

    function renderRecords() {
        const el = _el;
        if (recordsCache) { el.html(recordsCache); return; }

        el.html('<div class="tmh-load"><div class="tmu-spinner tmu-spinner-md" style="margin-bottom:6px"></div><br>Loading records…</div>');

        TmApi.fetchClubRecords(_clubId).then(function(html) {
            if (!html) { el.html('<div class="tmh-load" style="color:#f44">Failed to load records</div>'); return; }
            const doc = $('<div>').html(html);

                const prTbl = doc.find('h3').filter(function () {
                    return /player\s*records/i.test($(this).text());
                }).next('table');

                const thBlk = doc.find('#tab0');

                let h = '<div class="tmh-sec">Player Records</div>';
                h += prTbl.length ? prTbl[0].outerHTML : '<div class="tmh-ph">No player records found</div>';
                h += '<div class="tmh-sec">Tournament History</div>';
                h += thBlk.length ? thBlk.html() : '<div class="tmh-ph">No tournament history found</div>';

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
