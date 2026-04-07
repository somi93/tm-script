import { TmClubService } from '../../services/club.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmHistoryHelpers } from './tm-history-helpers.js';
import { TmSummaryStrip } from '../shared/tm-summary-strip.js';

const H = () => TmHistoryHelpers;

let _clubId = null, _seasons = null, _el = null;
let leagueCache = null;

    /* ═══════════════════════════════════════
       LEAGUE TAB
       ═══════════════════════════════════════ */
    function renderLeague() {
        const el = _el;
        if (leagueCache) { doRenderLeague(el, leagueCache); return; }
        el.innerHTML = TmUI.loading('Loading league history…');
        TmClubService.fetchClubLeagueHistory(_clubId, _seasons[0].id).then(function(html) {
            if (!html) { el.innerHTML = TmUI.error('Failed to load league history.'); return;}
            var data = parseLeagueHtml(html);
            leagueCache = data;
            doRenderLeague(el, data);
        });
    }

    function parseLeagueHtml(html) {
        const doc = document.createElement('div');
        doc.innerHTML = html;
        const table = doc.querySelector('table.zebra.sortable');
        const rows = [];
        if (!table) return rows;
        Array.from(table.querySelectorAll('tr')).forEach(function(tr) {
            const tds = Array.from(tr.querySelectorAll('td'));
            if (!tds.length) return;
            const seasonRaw = tds[0]?.textContent.trim() ?? '';
            const isCurrent = seasonRaw.indexOf('*') !== -1;
            const season = seasonRaw.replace('*', '');
            const div = tds[1]?.textContent.trim() ?? '';
            const w = parseInt(tds[2]?.textContent.trim()) || 0;
            const d = parseInt(tds[3]?.textContent.trim()) || 0;
            const l = parseInt(tds[4]?.textContent.trim()) || 0;
            const pts = parseInt(tds[5]?.textContent.trim()) || 0;
            const goalsRaw = tds[6]?.textContent.trim() ?? '';
            let gf = 0, ga = 0;
            if (goalsRaw.indexOf('-') !== -1) {
                const gParts = goalsRaw.split('-');
                gf = parseInt(gParts[0]) || 0;
                ga = parseInt(gParts[1]) || 0;
            }
            const gd = parseInt(tds[7]?.textContent.trim()) || 0;
            const avgGoals = tds[8]?.textContent.trim() ?? '';
            const perMatch = parseFloat(tds[9]?.textContent.trim()) || 0;
            const pos = tds[10]?.textContent.trim() ?? '';
            if (!season || div === '.') return;
            rows.push({
                season: season, isCurrent: isCurrent, div: div,
                w: w, d: d, l: l, pts: pts,
                gf: gf, ga: ga, gd: gd, played: w + d + l,
                avgGoals: avgGoals, perMatch: perMatch,
                pos: pos ? parseInt(pos) || pos : ''
            });
        });
        return rows;
    }

    function divLevel(divStr) {
        var n = parseFloat(divStr);
        return isNaN(n) ? 99 : Math.floor(n);
    }

    function divClass(divStr) {
        var lv = divLevel(divStr);
        if (lv <= 1) return 'tmh-div1';
        if (lv === 2) return 'tmh-div2';
        if (lv === 3) return 'tmh-div3';
        if (lv === 4) return 'tmh-div4';
        return 'tmh-div5';
    }

    function doRenderLeague(container, data) {
        if (!data.length) { container.innerHTML = TmUI.empty('No league data found.'); return; }

        const completed = data.filter(r => !r.isCurrent);

        const totalSeasons = completed.length;
        let totalW = 0, totalD = 0, totalL = 0, totalGF = 0, totalGA = 0, totalPts = 0, totalPlayed = 0;
        let titles = 0;
        let bestDiv = 99;
        let bestPos = Infinity, bestPosSeason = '';
        completed.forEach(r => {
            totalW += r.w; totalD += r.d; totalL += r.l;
            totalGF += r.gf; totalGA += r.ga; totalPts += r.pts;
            totalPlayed += r.played;
            if (r.pos === 1) titles++;
            const dl = divLevel(r.div);
            if (dl < bestDiv) bestDiv = dl;
            if (typeof r.pos === 'number' && r.pos > 0 && r.pos < bestPos) {
                bestPos = r.pos; bestPosSeason = r.season;
            }
        });
        const winPct = totalPlayed ? ((totalW / totalPlayed) * 100).toFixed(1) : '0.0';
        const avgPPM = totalPlayed ? (totalPts / totalPlayed).toFixed(2) : '0.00';
        const totalGD = totalGF - totalGA;

        let h = '';
        h += TmSummaryStrip.render([
            { label: 'Seasons', value: String(totalSeasons) },
            { label: 'Titles', value: String(titles), valueCls: 'tmh-pos' },
            { label: 'W / D / L', value: totalW + ' / ' + totalD + ' / ' + totalL },
            { label: 'Goals', value: totalGF + ' - ' + totalGA },
            { label: 'GD', valueHtml: (totalGD > 0 ? '+' : '') + String(totalGD), valueCls: H().balCls(totalGD) },
            { label: 'Win %', value: winPct + '%' },
            { label: 'Avg PPM', value: avgPPM },
            ...(bestPos !== Infinity ? [{ label: 'Best Finish', valueHtml: '#' + bestPos + ' <span style="font-size:var(--tmu-font-xs);color:var(--tmu-text-faint)">(S' + bestPosSeason + ')</span>', valueCls: 'tmh-pos' }] : []),
        ], { variant: 'boxed', valueFirst: true, align: 'center' });
        container.innerHTML = h;

        const n = totalSeasons || 1;
        const footer = completed.length ? [
            { cls: 'tmu-tbl-avg', cells: [
                { content: 'AVG', cls: 'c' },
                '',
                { content: (totalW / n).toFixed(1), cls: 'c' },
                { content: (totalD / n).toFixed(1), cls: 'c' },
                { content: (totalL / n).toFixed(1), cls: 'c' },
                { content: (totalPts / n).toFixed(1), cls: 'c' },
                { content: (totalGF / n).toFixed(1), cls: 'c' },
                { content: (totalGA / n).toFixed(1), cls: 'c' },
                { content: (totalGD / n).toFixed(1), cls: 'c' },
                { content: avgPPM, cls: 'c' },
                '',
            ]},
            { cls: 'tmu-tbl-tot', cells: [
                { content: 'TOTAL', cls: 'c' },
                { content: totalSeasons + ' seasons', cls: 'c' },
                { content: String(totalW), cls: 'c' },
                { content: String(totalD), cls: 'c' },
                { content: String(totalL), cls: 'c' },
                { content: String(totalPts), cls: 'c' },
                { content: String(totalGF), cls: 'c' },
                { content: String(totalGA), cls: 'c' },
                { content: (totalGD > 0 ? '+' : '') + totalGD, cls: 'c ' + (totalGD > 0 ? 'tmh-pos' : totalGD < 0 ? 'tmh-neg' : '') },
                { content: avgPPM, cls: 'c' },
                '',
            ]},
        ] : [];

        const tbl = TmUI.table({
            headers: [
                { key: 'season',   label: 'Season',  align: 'c',
                  sort: (a, b) => parseInt(a.season) - parseInt(b.season),
                  render: (v, r) => v + (r.isCurrent ? '*' : '') },
                { key: 'div',      label: 'Div',     align: 'c',
                  sort: (a, b) => (parseFloat(a.div)||99) - (parseFloat(b.div)||99),
                  render: v => `<span class="${divClass(v)}">${v}</span>` },
                { key: 'w',   label: 'W',   align: 'c' },
                { key: 'd',   label: 'D',   align: 'c' },
                { key: 'l',   label: 'L',   align: 'c' },
                { key: 'pts', label: 'Pts', align: 'c',
                  render: v => `<span style="font-weight:700">${v}</span>` },
                { key: 'gf',  label: 'GF',  align: 'c' },
                { key: 'ga',  label: 'GA',  align: 'c' },
                { key: 'gd',  label: 'GD',  align: 'c',
                  render: v => `<span class="${v > 0 ? 'tmh-pos' : v < 0 ? 'tmh-neg' : ''}">${v > 0 ? '+' + v : v}</span>` },
                { key: 'perMatch', label: 'PPM', align: 'c', render: v => v.toFixed(2) },
                { key: 'pos', label: '#', align: 'c',
                  sort: (a, b) => (typeof a.pos === 'number' ? a.pos : 999) - (typeof b.pos === 'number' ? b.pos : 999),
                  render: v => v ? `<span style="font-weight:700${v === 1 ? ';color:var(--tmu-text-highlight)' : ''}">${v}</span>` : '' },
            ],
            items: data,
            footer,
            sortKey: 'season',
            sortDir: -1,
            rowCls: r => r.isCurrent ? 'tmh-league-current' : r.pos === 1 ? 'tmh-league-champion' : '',
        });
        container.appendChild(tbl);
        container.insertAdjacentHTML('beforeend', '<p style="font-size:var(--tmu-font-xs);color:var(--tmu-text-faint);margin-top:var(--tmu-space-xs)">* Current season (projected values)</p>');
    }

    export const TmHistoryLeague = {
        render(el, ctx) {
            _el = el;
            _clubId = ctx.clubId;
            _seasons = ctx.seasons;
            renderLeague();
        }
    };
