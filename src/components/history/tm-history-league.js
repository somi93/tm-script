import { TmClubService } from '../../services/club.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmHistoryHelpers } from './tm-history-helpers.js';
import { TmSummaryStrip } from '../shared/tm-summary-strip.js';

const $ = window.jQuery;
    const H = () => TmHistoryHelpers;

    /* ── module state ── */
    let _clubId = null, _seasons = null, _el = null;
    let leagueCache = null;

    /* ═══════════════════════════════════════
       LEAGUE TAB
       ═══════════════════════════════════════ */
    function renderLeague() {
        const el = _el;
        if (leagueCache) { doRenderLeague(el, leagueCache); return; }
        el.html(TmUI.loading('Loading league history…'));
        TmClubService.fetchClubLeagueHistory(_clubId, _seasons[0].id).then(function(html) {
            if (!html) { el.html(TmUI.error('Failed to load league history.')); return; }
            var data = parseLeagueHtml(html);
            leagueCache = data;
            doRenderLeague(el, data);
        });
    }

    function parseLeagueHtml(html) {
        var doc = $($.parseHTML(html));
        var table = doc.find('table.zebra.sortable');
        if (!table.length) {
            var wrap = $('<div>').append(doc);
            table = wrap.find('table.zebra.sortable');
        }
        var rows = [];
        table.find('tr').each(function () {
            var tds = $(this).find('td');
            if (!tds.length) return;
            var seasonRaw = $.trim(tds.eq(0).text());
            var isCurrent = seasonRaw.indexOf('*') !== -1;
            var season = seasonRaw.replace('*', '');
            var div = $.trim(tds.eq(1).text());
            var w = parseInt($.trim(tds.eq(2).text())) || 0;
            var d = parseInt($.trim(tds.eq(3).text())) || 0;
            var l = parseInt($.trim(tds.eq(4).text())) || 0;
            var pts = parseInt($.trim(tds.eq(5).text())) || 0;
            var goalsRaw = $.trim(tds.eq(6).text());
            var gf = 0, ga = 0;
            if (goalsRaw.indexOf('-') !== -1) {
                var gParts = goalsRaw.split('-');
                gf = parseInt(gParts[0]) || 0;
                ga = parseInt(gParts[1]) || 0;
            }
            var gd = parseInt($.trim(tds.eq(7).text())) || 0;
            var avgGoals = $.trim(tds.eq(8).text());
            var perMatch = parseFloat($.trim(tds.eq(9).text())) || 0;
            var pos = $.trim(tds.eq(10).text());
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
        if (!data.length) { container.html(TmUI.empty('No league data found.')); return; }

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
            { label: 'Seasons', value: String(totalSeasons), minWidth: '70px' },
            { label: 'Titles', value: String(titles), valueStyle: 'color:#e8d44a', minWidth: '70px' },
            { label: 'W / D / L', value: totalW + ' / ' + totalD + ' / ' + totalL, minWidth: '70px' },
            { label: 'Goals', value: totalGF + ' - ' + totalGA, minWidth: '70px' },
            { label: 'GD', valueHtml: (totalGD > 0 ? '+' : '') + String(totalGD), valueCls: H().balCls(totalGD), minWidth: '70px' },
            { label: 'Win %', value: winPct + '%', minWidth: '70px' },
            { label: 'Avg PPM', value: avgPPM, minWidth: '70px' },
            ...(bestPos !== Infinity ? [{ label: 'Best Finish', valueHtml: '#' + bestPos + ' <span style="font-size:10px;color:var(--tmu-text-faint)">(S' + bestPosSeason + ')</span>', valueCls: 'tmh-pos', minWidth: '70px' }] : []),
        ], { cls: 'tmh-summary-strip tmh-league-summary', itemMinWidth: '70px' });
        container.html(h);

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
                  render: v => v ? `<span style="font-weight:700${v === 1 ? ';color:#e8d44a' : ''}">${v}</span>` : '' },
            ],
            items: data,
            footer,
            sortKey: 'season',
            sortDir: -1,
            rowCls: r => r.isCurrent ? 'tmh-league-current' : r.pos === 1 ? 'tmh-league-champion' : '',
        });
        container[0].appendChild(tbl);
        container.append('<p style="font-size:10px;color:var(--tmu-text-faint);margin-top:4px">* Current season (projected values)</p>');
    }

    export const TmHistoryLeague = {
        render(el, ctx) {
            _el = el;
            _clubId = ctx.clubId;
            _seasons = ctx.seasons;
            renderLeague();
        }
    };
