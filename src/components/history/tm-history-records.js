import { TmClubService } from '../../services/club.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmMetric } from '../shared/tm-metric.js';

let _clubId = null, _el = null;
let recordsCache = null;

function parsePlayerRecords(tbl) {
    const rows = [];
    tbl.querySelectorAll('tbody tr').forEach(tr => {
        const tds = tr.querySelectorAll('td');
        if (tds.length < 3) return;
        const label = tds[0].textContent.trim();
        const playerA = Array.from(tds[1].querySelectorAll('a')).find(a => a.getAttribute('href')?.startsWith('/players/'));
        const player = playerA
            ? { name: playerA.textContent.trim(), url: playerA.getAttribute('href') }
            : { name: tds[1].textContent.trim(), url: null };
        const subtle = tds[2].querySelector('.subtle');
        const season = subtle ? subtle.textContent.trim() : '';
        const val = tds[2].textContent.replace(season, '').trim();
        rows.push({ label, player, val, season });
    });
    return rows;
}

function parseTournamentHistory(tab0) {
    const rows = [];
    const note = tab0.querySelector('p.std')?.textContent.trim() || null;
    tab0.querySelectorAll('table tbody tr').forEach(tr => {
        const tds = tr.querySelectorAll('td');
        if (!tds.length) return;
        const label = tds[0].textContent.trim();
        if (tds.length === 2) {
            const subtle = tds[1].querySelector('.subtle');
            const dim = subtle ? subtle.textContent.trim() : '';
            const val = tds[1].textContent.replace(dim, '').trim();
            rows.push({ label, wide: true, val, dim });
        } else {
            const num = tds[1].textContent.trim();
            const ctxTd = tds[2];
            const subtle = ctxTd.querySelector('.subtle');
            const season = subtle ? subtle.textContent.trim() : '';
            const ctx = ctxTd.textContent.replace(season, '').trim();
            rows.push({ label, num, ctx, season });
        }
    });
    return { rows, note };
}

const _rec = (opts) => TmMetric.metric({
    layout: 'row', tone: '', size: 'sm',
    valueAttrs: { style: 'font-size:var(--tmu-font-sm);font-weight:700' },
    ...opts,
});

function buildRecordsHtml(playerRows, { rows: tournRows, note }) {
    const playerSection = playerRows.length
        ? playerRows.map(r => {
            const playerNote = r.player.url
                ? `<a href="${r.player.url}">${r.player.name}</a>`
                : r.player.name;
            const valHtml = r.season
                ? `${r.val} <span class="tmu-meta">${r.season}</span>`
                : r.val;
            return _rec({ label: r.label, note: playerNote, value: valHtml });
        }).join('')
        : TmUI.empty('No data');

    const noteHtml = note ? `<p class="tmu-meta" style="padding:var(--tmu-space-xs) var(--tmu-space-md);margin:0;border-bottom:1px solid var(--tmu-border-faint)">${note}</p>` : '';
    const tournSection = tournRows.length
        ? noteHtml + tournRows.map(r => {
            if (r.wide) {
                const valHtml = r.dim
                    ? `${r.val} <span class="tmu-meta">${r.dim}</span>`
                    : r.val;
                return _rec({ label: r.label, value: valHtml });
            }
            const ctxNote = r.ctx + (r.season ? ` <span class="tmu-meta">${r.season}</span>` : '');
            return _rec({ label: r.label, note: ctxNote, value: r.num });
        }).join('')
        : TmUI.empty('No data');

    return `
        <div class="tmh-sec">Player Records</div>
        <div class="tmh-records">${playerSection}</div>
        <div class="tmh-sec">Tournament History</div>
        <div class="tmh-records">${tournSection}</div>
    `;
}

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
        const playerRows = prTbl ? parsePlayerRecords(prTbl) : [];
        const tournData = thBlk ? parseTournamentHistory(thBlk) : { rows: [], note: null };
        recordsCache = buildRecordsHtml(playerRows, tournData);
        el.innerHTML = recordsCache;
    });
}

export const TmHistoryRecords = {
    render(el, ctx) {
        _el = el;
        _clubId = ctx.clubId;
        renderRecords();
    }
};
