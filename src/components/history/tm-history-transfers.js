import { TmClubService } from '../../services/club.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmHistoryHelpers } from './tm-history-helpers.js';
import { TmSummaryStrip } from '../shared/tm-summary-strip.js';

const $ = window.jQuery;
const H = () => TmHistoryHelpers;

/* ── module state ── */
let _clubId = null, _seasons = null, _el = null;
let transferCache = {};
let currentSeason = null;

/* ═══════════════════════════════════════
   TRANSFERS TAB
   ═══════════════════════════════════════ */
function renderTransfers() {
    const el = _el;
    let h = H().seasonBar({
        seasons: _seasons,
        currentSeason,
        selectId: 'tmh-sel-season',
        prevId: 'tmh-prev',
        nextId: 'tmh-next',
        extraButtons: [
            { id: 'tmh-all-btn', label: 'Load All Seasons Summary' },
            { id: 'tmh-still-btn', label: 'Still Playing (sold)' },
        ],
    });
    h += '<div id="tmh-tdata"></div>';
    el.html(h);

    function goSeason(sid) {
        currentSeason = sid;
        renderTransfers();
    }

    H().bindSeasonBar(el, {
        seasons: _seasons,
        currentSeason,
        selectId: 'tmh-sel-season',
        prevId: 'tmh-prev',
        nextId: 'tmh-next',
        onChange: goSeason,
    });

    $('#tmh-all-btn').on('click', function () { loadAllSeasons(); });
    $('#tmh-still-btn').on('click', function () { loadStillPlaying(); });

    loadSeason(currentSeason);
}

/* ─── load single season ─── */
function loadSeason(sid) {
    const c = $('#tmh-tdata');
    if (transferCache[sid]) { renderSeasonData(c, transferCache[sid]); return; }

    c.html(TmUI.loading('Loading Season ' + sid + '…'));

    TmClubService.fetchClubTransferHistory(_clubId, sid).then(function (html) {
        if (html) {
            const d = parseTransfers(html);
            transferCache[sid] = d;
            renderSeasonData(c, d);
        } else {
            c.html(TmUI.error('Failed to load transfers'));
        }
    });
}

/* ─── parse transfer page ─── */
function parseTransfers(html) {
    const doc = $('<div>').html(html);

    const h3s = doc.find('h3');
    let boughtTable = null, soldTable = null;
    h3s.each(function () {
        const txt = $(this).text().trim().toLowerCase();
        if (txt === 'bought') boughtTable = $(this).next('table');
        if (txt === 'sold') soldTable = $(this).next('table');
    });

    const bought = [], sold = [];

    if (boughtTable && boughtTable.length) {
        boughtTable.find('tr').each(function (i) {
            if (i === 0) return;
            const tds = $(this).find('td');
            if (tds.length < 4) return;
            const a = tds.eq(0).find('a[player_link]');
            if (!a.length) return;
            bought.push({
                name: a.text().trim(),
                pid: a.attr('player_link'),
                url: a.attr('href'),
                starsHtml: tds.eq(1).html(),
                price: parseFloat(tds.eq(3).text().replace(/,/g, '').trim()) || 0
            });
        });
    }

    if (soldTable && soldTable.length) {
        soldTable.find('tr').each(function (i) {
            if (i === 0) return;
            const tds = $(this).find('td');
            if (tds.length < 4) return;
            if (tds.eq(0).attr('colspan')) return;
            const a = tds.eq(0).find('a[player_link]');
            if (!a.length) return;
            sold.push({
                name: a.text().trim(),
                pid: a.attr('player_link'),
                url: a.attr('href'),
                starsHtml: tds.eq(1).html(),
                price: parseFloat(tds.eq(3).text().replace(/,/g, '').trim()) || 0
            });
        });
    }

    let totalBought = 0, totalSold = 0, balance = 0;
    const allTds = doc.find('td[colspan]');
    allTds.each(function () {
        const txt = $(this).text().trim();
        const val = parseFloat(($(this).find('strong').text() || '0').replace(/,/g, '')) || 0;
        if (/Total Bought/i.test(txt)) totalBought = val;
        else if (/Total Sold/i.test(txt)) totalSold = val;
        else if (/Balance/i.test(txt)) balance = val;
    });

    if (!totalBought && bought.length) totalBought = bought.reduce((s, p) => s + p.price, 0);
    if (!totalSold && sold.length) totalSold = sold.reduce((s, p) => s + p.price, 0);
    if (!balance) balance = totalSold - totalBought;

    return { bought, sold, totalBought, totalSold, balance };
}

/* ─── render single season ─── */
function renderSeasonData(c, d) {
    const bc = H().balCls(d.balance);
    let h = '';

    h += TmSummaryStrip.render([
        { label: 'Bought', valueHtml: H().fmt(d.totalBought) + ' M', valueCls: 'tmh-neg' },
        { label: 'Sold', valueHtml: H().fmt(d.totalSold) + ' M', valueCls: 'tmh-pos' },
        { label: 'Balance', valueHtml: (d.balance >= 0 ? '+' : '') + H().fmt(d.balance) + ' M', valueCls: bc },
        { label: 'Transfers', value: String(d.bought.length + d.sold.length), valueStyle: 'color:var(--tmu-text-highlight)', minWidth: '80px' },
    ], { cls: 'tmh-summary-strip', itemMinWidth: '80px' });

    h += '<div class="tmh-sec">Bought (' + d.bought.length + ')</div>';
    h += '<div id="tmh-bought-wrap"></div>';

    h += '<div class="tmh-sec">Sold (' + d.sold.length + ')</div>';
    h += '<div id="tmh-sold-wrap"></div>';

    c.html(h);
    renderSortablePlayerTable($('#tmh-bought-wrap'), d.bought, 'From');
    renderSortablePlayerTable($('#tmh-sold-wrap'), d.sold, 'To');
}

function renderSortablePlayerTable(c, arr, clubLabel, opts) {
    opts = opts || {};
    if (!arr.length) {
        c.html(TmUI.empty('No players', true));
        return;
    }
    const pic = H().playerInfoCache;
    const headers = [
        { key: '#', label: '#', sortable: false, render: (_, __, i) => i + 1 },
        { key: 'name', label: 'Player', render: (_, p) => `<a href="${p.url}">${p.name}</a>` },
        {
            key: 'pos', label: 'Pos', align: 'c',
            sort: (a, b) => (pic[a.pid]?.pos || '').localeCompare(pic[b.pid]?.pos || ''),
            render: (_, p) => { const i = pic[p.pid]; return i ? TmUI.chip(i.pos, H().posVariant(i.pos)) : '…'; }
        },
        {
            key: 'age', label: 'Age', align: 'r',
            sort: (a, b) => ((pic[a.pid]?.age || 0) * 12 + (pic[a.pid]?.months || 0)) - ((pic[b.pid]?.age || 0) * 12 + (pic[b.pid]?.months || 0)),
            render: (_, p) => { const i = pic[p.pid]; return i ? i.age + '.' + i.months : '…'; }
        },
        {
            key: 'asi', label: 'ASI', align: 'r',
            sort: (a, b) => (pic[a.pid]?.asi || 0) - (pic[b.pid]?.asi || 0),
            render: (_, p) => { const i = pic[p.pid]; return i ? H().fmt(i.asi, 0) : '…'; }
        },
        {
            key: 'r5', label: 'R5', align: 'r',
            sort: (a, b) => (pic[a.pid]?.r5 || 0) - (pic[b.pid]?.r5 || 0),
            render: (_, p) => { const i = pic[p.pid]; return i ? `<span style="color:${H().r5Color(i.r5)};font-weight:700">${H().fix2(i.r5)}</span>` : '…'; }
        },
        {
            key: 'rec', label: 'Rec', align: 'c',
            sort: (a, b) => (pic[a.pid]?.rec || 0) - (pic[b.pid]?.rec || 0),
            render: (_, p) => { const i = pic[p.pid]; return i ? (i.rec || '—') : '…'; }
        },
        { key: 'starsHtml', label: clubLabel, sortable: false, cls: 'c tmh-stars' },
        { key: 'price', label: 'Price (M)', align: 'r', render: v => H().fmt(v) },
    ];
    if (opts.showSeason) {
        headers.push({ key: 'season', label: 'Season', align: 'r', render: v => 'S' + v });
    }
    const tbl = TmUI.table({ headers, items: arr, sortKey: opts.defaultSort || 'price', sortDir: opts.defaultDir || -1 });
    c.html('');
    c[0].appendChild(tbl);
    H().prefetchPlayers(arr.map(p => p.pid), () => tbl.refresh());
}

/* ═══════════════════════════════════════
   STILL PLAYING (sold players not retired)
   ═══════════════════════════════════════ */
function loadStillPlaying() {
    const btn = $('#tmh-still-btn');
    const wrap = $('#tmh-tdata');
    btn.addClass('busy').text('Loading…');

    const total = _seasons.length;
    let loaded = 0;
    const allData = {};

    const progress = H().progressState(wrap, { message: 'Scanning all seasons…', total });

    function tick() {
        loaded++;
        progress.update(loaded);
        if (loaded === total) finishStillPlaying(wrap, allData);
    }

    _seasons.forEach(s => {
        if (transferCache[s.id]) {
            allData[s.id] = transferCache[s.id];
            tick();
            return;
        }
        TmClubService.fetchClubTransferHistory(_clubId, s.id).then(function (html) {
            if (html) {
                const d = parseTransfers(html);
                transferCache[s.id] = d;
                allData[s.id] = d;
            } else {
                allData[s.id] = { bought: [], sold: [], totalBought: 0, totalSold: 0, balance: 0 };
            }
            tick();
        });
    });

    function finishStillPlaying(c, all) {
        btn.removeClass('busy').text('Still Playing (sold)');

        const pMap = {};
        _seasons.forEach(s => {
            const d = all[s.id];
            if (!d) return;
            d.sold.forEach(p => {
                if (!pMap[p.pid]) {
                    pMap[p.pid] = {
                        name: p.name, url: p.url,
                        starsHtml: p.starsHtml,
                        retired: /retired/i.test(p.starsHtml || ''),
                        sales: []
                    };
                }
                const entry = pMap[p.pid];
                if (p.starsHtml && !(/retired/i.test(p.starsHtml))) {
                    entry.starsHtml = p.starsHtml;
                    entry.retired = false;
                }
                if (/retired/i.test(p.starsHtml || '')) entry.retired = true;
                entry.sales.push({ season: s.id });
            });
        });

        const stillPlaying = [];
        for (const pid in pMap) {
            const p = pMap[pid];
            if (!p.retired) {
                p.sales.sort((a, b) => Number(b.season) - Number(a.season));
                stillPlaying.push({ pid, ...p });
            }
        }

        function renderStillPlayingTable(c, list) {
            const pic = H().playerInfoCache;
            let h = '<div class="tmh-sec">Sold Players Still Playing (' + list.length + ')</div>';
            c.html(h);
            if (!list.length) {
                c.append(TmUI.empty('No sold players still active'));
                return;
            }
            const headers = [
                { key: '#', label: '#', sortable: false, render: (_, __, i) => i + 1 },
                { key: 'name', label: 'Player', render: (_, p) => `<a href="${p.url}">${p.name}</a>` },
                {
                    key: 'pos', label: 'Pos', align: 'c',
                    sort: (a, b) => (pic[a.pid]?.pos || '').localeCompare(pic[b.pid]?.pos || ''),
                    render: (_, p) => { const i = pic[p.pid]; return i ? TmUI.chip(i.pos, H().posVariant(i.pos)) : '…'; }
                },
                {
                    key: 'age', label: 'Age', align: 'r',
                    sort: (a, b) => ((pic[a.pid]?.age || 0) * 12 + (pic[a.pid]?.months || 0)) - ((pic[b.pid]?.age || 0) * 12 + (pic[b.pid]?.months || 0)),
                    render: (_, p) => { const i = pic[p.pid]; return i ? i.age + '.' + i.months : '…'; }
                },
                {
                    key: 'asi', label: 'ASI', align: 'r',
                    sort: (a, b) => (pic[a.pid]?.asi || 0) - (pic[b.pid]?.asi || 0),
                    render: (_, p) => { const i = pic[p.pid]; return i ? H().fmt(i.asi, 0) : '…'; }
                },
                {
                    key: 'r5', label: 'R5', align: 'r',
                    sort: (a, b) => (pic[a.pid]?.r5 || 0) - (pic[b.pid]?.r5 || 0),
                    render: (_, p) => { const i = pic[p.pid]; return i ? `<span style="color:${H().r5Color(i.r5)};font-weight:700">${H().fix2(i.r5)}</span>` : '…'; }
                },
                {
                    key: 'rec', label: 'Rec', align: 'c',
                    sort: (a, b) => (pic[a.pid]?.rec || 0) - (pic[b.pid]?.rec || 0),
                    render: (_, p) => { const i = pic[p.pid]; return i ? (i.rec || '—') : '…'; }
                },
                { key: 'sales', label: 'Sales', align: 'r', render: (_, p) => p.sales.length },
                {
                    key: 'seasons', label: 'Seasons', sortable: false,
                    render: (_, p) => `<span style="font-size:10px;color:var(--tmu-text-accent-soft)">${p.sales.map(s => 'S' + s.season).join(', ')}</span>`
                },
            ];
            const tbl = TmUI.table({ headers, items: list, sortKey: 'r5', sortDir: -1 });
            c[0].appendChild(tbl);
            H().prefetchPlayers(list.map(p => p.pid), () => tbl.refresh());
        }

        renderStillPlayingTable(c, stillPlaying);
    }
}

/* ═══════════════════════════════════════
   LOAD ALL SEASONS (aggregate)
   ═══════════════════════════════════════ */
function loadAllSeasons() {
    const btn = $('#tmh-all-btn');
    const wrap = $('#tmh-tdata');
    btn.addClass('busy').text('Loading…');

    const total = _seasons.length;
    let loaded = 0;
    const allData = {};

    const progress = H().progressState(wrap, { message: 'Loading all seasons…', total });

    function tick() {
        loaded++;
        progress.update(loaded);
        if (loaded === total) finish();
    }

    function finish() {
        btn.removeClass('busy').text('Load All Seasons Summary');
        renderAllSeasons(wrap, allData);
    }

    _seasons.forEach(s => {
        if (transferCache[s.id]) {
            allData[s.id] = transferCache[s.id];
            tick();
            return;
        }
        TmClubService.fetchClubTransferHistory(_clubId, s.id).then(function (html) {
            if (html) {
                const d = parseTransfers(html);
                transferCache[s.id] = d;
                allData[s.id] = d;
            } else {
                allData[s.id] = { bought: [], sold: [], totalBought: 0, totalSold: 0, balance: 0 };
            }
            tick();
        });
    });
}

function renderAllSeasons(c, all) {
    let gB = 0, gS = 0, gBal = 0, gN = 0;
    let topBuy = [], topSell = [];

    let rows = [];
    _seasons.forEach(s => {
        const d = all[s.id];
        if (!d) return;
        gB += d.totalBought;
        gS += d.totalSold;
        gBal += d.balance;
        const n = d.bought.length + d.sold.length;
        gN += n;
        rows.push({ sid: s.id, label: s.label, b: d.totalBought, s: d.totalSold, bal: d.balance, n: n });
        d.bought.forEach(p => topBuy.push({ ...p, season: s.id }));
        d.sold.forEach(p => topSell.push({ ...p, season: s.id }));
    });

    let h = '';

    h += TmSummaryStrip.render([
        { label: 'Total Bought', valueHtml: H().fmt(gB) + ' M', valueCls: 'tmh-neg' },
        { label: 'Total Sold', valueHtml: H().fmt(gS) + ' M', valueCls: 'tmh-pos' },
        { label: 'Net Balance', valueHtml: (gBal >= 0 ? '+' : '') + H().fmt(gBal) + ' M', valueCls: H().balCls(gBal) },
        { label: 'Transfers', value: String(gN), valueStyle: 'color:var(--tmu-text-highlight)', minWidth: '80px' },
        { label: 'Seasons', value: String(_seasons.length), valueStyle: 'color:var(--tmu-text-highlight)', minWidth: '80px' },
    ], { cls: 'tmh-summary-strip', itemMinWidth: '80px' });

    h += '<div class="tmh-sec">Season-by-Season</div>';
    h += '<div id="tmh-szn-wrap"></div>';

    topBuy.sort((a, b) => b.price - a.price);
    h += '<div class="tmh-sec">Top 10 Most Expensive Purchases</div>';
    h += '<div id="tmh-top-buy"></div>';

    topSell.sort((a, b) => b.price - a.price);
    h += '<div class="tmh-sec">Top 10 Most Expensive Sales</div>';
    h += '<div id="tmh-top-sell"></div>';

    const trades = buildTrades(all);
    if (trades.length) {
        trades.sort((a, b) => b.profit - a.profit);
        h += '<div class="tmh-sec">Top 10 Best Trades (incl. 6% tax)</div>';
        h += '<div id="tmh-best-trades"></div>';

        const worst = trades.filter(t => t.profit < 0).sort((a, b) => a.profit - b.profit);
        if (worst.length) {
            h += '<div class="tmh-sec">Top 10 Worst Trades</div>';
            h += '<div id="tmh-worst-trades"></div>';
        }
    }

    const academy = buildAcademy(all);
    if (academy.rows.length) {
        h += '<div class="tmh-sec">Academy Revenue (sold without prior purchase)</div>';
        h += '<div id="tmh-academy"></div>';
    }

    c.html(h);
    renderSortableSeasonTable($('#tmh-szn-wrap'), rows, gB, gS, gBal, gN);
    renderSortablePlayerTable($('#tmh-top-buy'), topBuy.slice(0, 10), 'From', { showSeason: true });
    renderSortablePlayerTable($('#tmh-top-sell'), topSell.slice(0, 10), 'To', { showSeason: true });
    if (trades.length) {
        renderSortableTradeTable($('#tmh-best-trades'), trades.slice(0, 10));
        var worst2 = trades.filter(t => t.profit < 0).sort((a, b) => a.profit - b.profit);
        if (worst2.length) renderSortableTradeTable($('#tmh-worst-trades'), worst2.slice(0, 10));
    }
    if (academy.rows.length) renderSortableAcademyTable($('#tmh-academy'), academy);
}

/* ─── sortable season-by-season table ─── */
function renderSortableSeasonTable(c, rows, gB, gS, gBal, gN) {
    const n = rows.length || 1;
    const footer = [
        {
            cls: 'tmu-tbl-tot', cells: [
                'TOTAL',
                { content: H().fmt(gB), cls: 'r' },
                { content: H().fmt(gS), cls: 'r' },
                { content: (gBal >= 0 ? '+' : '') + H().fmt(gBal), cls: 'r ' + H().balCls(gBal) },
                { content: String(gN), cls: 'r' },
            ]
        },
        {
            cls: 'tmu-tbl-avg', cells: [
                'AVERAGE',
                { content: H().fmt(gB / n), cls: 'r' },
                { content: H().fmt(gS / n), cls: 'r' },
                { content: H().fmt(gBal / n), cls: 'r ' + H().balCls(gBal / n) },
                { content: H().fmt(gN / n), cls: 'r' },
            ]
        },
    ];
    const tbl = TmUI.table({
        headers: [
            { key: 'label', label: 'Season', sort: (a, b) => Number(a.sid) - Number(b.sid) },
            { key: 'b', label: 'Bought (M)', align: 'r', render: v => H().fmt(v) },
            { key: 's', label: 'Sold (M)', align: 'r', render: v => H().fmt(v) },
            {
                key: 'bal', label: 'Balance (M)', align: 'r',
                render: v => `<span class="${H().balCls(v)}">${(v >= 0 ? '+' : '') + H().fmt(v)}</span>`
            },
            { key: 'n', label: '#', align: 'r' },
        ],
        items: rows, footer, sortKey: 'label', sortDir: 1,
        onRowClick: row => {
            currentSeason = String(row.sid);
            $('#tmh-sel-season').val(currentSeason);
            loadSeason(currentSeason);
        },
    });
    c.html('');
    c[0].appendChild(tbl);
}

/* ─── sortable trade table ─── */
function renderSortableTradeTable(c, arr) {
    const tbl = TmUI.table({
        headers: [
            { key: '#', label: '#', sortable: false, render: (_, __, i) => i + 1 },
            { key: 'name', label: 'Player', render: (_, t) => `<a href="${t.url}">${t.name}</a>` },
            { key: 'buyPrice', label: 'Buy (M)', align: 'r', render: v => H().fmt(v) },
            { key: 'sellPrice', label: 'Sell (M)', align: 'r', render: v => H().fmt(v) },
            { key: 'afterTax', label: 'After Tax', align: 'r', render: v => H().fmt(v) },
            {
                key: 'profit', label: 'Profit (M)', align: 'r',
                render: v => `<span class="${H().balCls(v)}">${(v >= 0 ? '+' : '') + H().fmt(v)}</span>`
            },
            {
                key: 'seasons', label: 'Seasons', sortable: false,
                render: (_, t) => `S${t.buySeason} → S${t.sellSeason}`
            },
        ],
        items: arr, sortKey: 'profit', sortDir: -1,
    });
    c.html('');
    c[0].appendChild(tbl);
}

/* ─── sortable academy revenue table ─── */
function renderSortableAcademyTable(c, academy) {
    const footer = [{
        cls: 'tmu-tbl-tot', cells: [
            'TOTAL',
            { content: H().fmt(academy.totalSold), cls: 'r' },
            { content: String(academy.totalCount), cls: 'r' },
            { content: H().fmt(academy.totalCount ? academy.totalSold / academy.totalCount : 0), cls: 'r' },
        ]
    }];
    const tbl = TmUI.table({
        headers: [
            { key: 'sid', label: 'Season', render: v => 'Season ' + v },
            { key: 'sold', label: 'Sold (M)', align: 'r', render: v => H().fmt(v) },
            { key: 'count', label: '#', align: 'r' },
            { key: 'avg', label: 'Avg (M)', align: 'r', render: v => H().fmt(v) },
        ],
        items: academy.rows, footer, sortKey: 'sid', sortDir: 1,
    });
    c.html('');
    c[0].appendChild(tbl);
}

/* ─── build trades: match buy→sell per player across seasons ─── */
function buildTrades(all) {
    const pMap = {};

    _seasons.forEach(s => {
        const d = all[s.id];
        if (!d) return;
        d.bought.forEach(p => {
            if (!pMap[p.pid]) pMap[p.pid] = [];
            pMap[p.pid].push({ type: 'buy', season: s.id, price: p.price, name: p.name, url: p.url });
        });
        d.sold.forEach(p => {
            if (!pMap[p.pid]) pMap[p.pid] = [];
            pMap[p.pid].push({ type: 'sell', season: s.id, price: p.price, name: p.name, url: p.url });
        });
    });

    const trades = [];
    for (const pid in pMap) {
        const txs = pMap[pid].sort((a, b) => Number(a.season) - Number(b.season) || (a.type === 'buy' ? -1 : 1));
        let waitSell = false;
        let buyTx = null;
        txs.forEach(tx => {
            if (tx.type === 'buy') {
                waitSell = true;
                buyTx = tx;
            } else if (tx.type === 'sell' && waitSell && buyTx) {
                const afterTax = +(tx.price * 0.94).toFixed(1);
                const profit = +(afterTax - buyTx.price).toFixed(1);
                trades.push({
                    name: tx.name || buyTx.name,
                    url: tx.url || buyTx.url,
                    pid: pid,
                    buyPrice: buyTx.price,
                    sellPrice: tx.price,
                    afterTax: afterTax,
                    profit: profit,
                    buySeason: buyTx.season,
                    sellSeason: tx.season
                });
                waitSell = false;
                buyTx = null;
            }
        });
    }
    return trades;
}

/* ─── build academy revenue: sold without prior purchase ─── */
function buildAcademy(all) {
    const pMap = {};
    _seasons.forEach(s => {
        const d = all[s.id];
        if (!d) return;
        d.bought.forEach(p => { pMap[p.pid] = (pMap[p.pid] || 0) | 1; });
        d.sold.forEach(p => { pMap[p.pid] = (pMap[p.pid] || 0) | 2; });
    });

    const acadPids = new Set();
    for (const pid in pMap) {
        if (pMap[pid] === 2) acadPids.add(pid);
    }

    let totalSold = 0, totalCount = 0;
    const rows = [];
    _seasons.forEach(s => {
        const d = all[s.id];
        if (!d) return;
        let sum = 0, cnt = 0;
        d.sold.forEach(p => {
            if (acadPids.has(p.pid)) { sum += p.price; cnt++; }
        });
        if (cnt) {
            rows.push({ sid: s.id, sold: sum, count: cnt, avg: sum / cnt });
            totalSold += sum;
            totalCount += cnt;
        }
    });

    return { rows, totalSold, totalCount };
}

export const TmHistoryTransfers = {
    render(el, ctx) {
        _el = el;
        _clubId = ctx.clubId;
        _seasons = ctx.seasons;
        if (currentSeason === null) currentSeason = ctx.seasons[0].id;
        renderTransfers();
    }
};
