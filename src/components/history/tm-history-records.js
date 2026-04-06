import { TmClubService } from '../../services/club.js';
import { TmUI } from '../shared/tm-ui.js';

let _clubId = null, _el = null;
let recordsCache = null;

function renderRecords() {
    const el = _el;
    if (recordsCache) { el.innerHTML = recordsCache; return; }
    el.innerHTML = TmUI.loading('Loading records…');
    TmClubService.fetchClubRecords(_clubId).then(function(html) {
        if (!html) { el.innerHTML = TmUI.error('Failed to load records'); return; }
        const doc = document.createElement('div');
        doc.innerHTML = html;
        const h3s = Array.from(doc.querySelectorAll('h3'));
        const prTblH3 = h3s.find(h => /player\s*records/i.test(h.textContent));
        const prTbl = prTblH3?.nextElementSibling?.tagName === 'TABLE' ? prTblH3.nextElementSibling : null;
        const thBlk = doc.querySelector('#tab0');
        let h = '<div class="tmh-sec">Player Records</div>';
        h += prTbl ? prTbl.outerHTML : TmUI.empty('No player records found');
        h += '<div class="tmh-sec">Tournament History</div>';
        h += thBlk ? thBlk.innerHTML : TmUI.empty('No tournament history found');
        recordsCache = h;
        el.innerHTML = h;
    });
}

export const TmHistoryRecords = {
    render(el, ctx) {
        _el = el;
        _clubId = ctx.clubId;
        renderRecords();
    }
};
