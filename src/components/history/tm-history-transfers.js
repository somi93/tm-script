import { TmClubService } from '../../services/club.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmHistoryHelpers } from './tm-history-helpers.js';
import { TmSummaryStrip } from '../shared/tm-summary-strip.js';
import { TmPlayersTable } from '../shared/tm-players-table.js';
import { TmSeasonBar } from '../shared/tm-season-bar.js';

const H = () => TmHistoryHelpers;

/* ── module state ── */
let _clubId = null, _seasons = null, _el = null;
let _sbar = null;

function setExtraBtnActive(id) {
    _sbar?.setExtraBtnActive(id);
}
let transferCache = {};
let currentSeason = null;

/* ═══════════════════════════════════════
   TRANSFERS TAB
   ═══════════════════════════════════════ */
function renderTransfers() {
    const el = _el;
    el.innerHTML = '<div id="tmh-tdata"></div>';

    function goSeason(sid) {
        currentSeason = sid;
        setExtraBtnActive(null);
        renderTransfers();
    }

    _sbar = TmSeasonBar.mount(el, {
        seasons: _seasons,
        current: currentSeason,
        onChange: goSeason,
        extraButtons: [
            { id: 'tmh-all-btn', label: 'Load All Seasons Summary', color: 'primary' },
            { id: 'tmh-still-btn', label: 'Still Playing (sold)', color: 'primary' },
        ],
    });
    el.appendChild(el.querySelector('#tmh-tdata')); // move data div after bar

    el.querySelector('#tmh-all-btn')?.addEventListener('click', function () { setExtraBtnActive('tmh-all-btn'); loadAllSeasons(); });
    el.querySelector('#tmh-still-btn')?.addEventListener('click', function () { setExtraBtnActive('tmh-still-btn'); loadStillPlaying(); });

    loadSeason(currentSeason);
}

/* ─── load single season ─── */
function loadSeason(sid) {
    const c = document.getElementById('tmh-tdata');
    if (!c) return;
    if (transferCache[sid]) { renderSeasonData(c, transferCache[sid]); return; }

    c.innerHTML = TmUI.loading('Loading Season ' + sid + '…');

    TmClubService.fetchClubTransferHistory(_clubId, sid).then(function (html) {
        if (html) {
            const d = parseTransfers(html);
            transferCache[sid] = d;
            renderSeasonData(c, d);
        } else {
            c.innerHTML = TmUI.error('Failed to load transfers');
        }
    });
}

/* ─── parse transfer page ─── */
function parseTransfers(html) {
    const doc = document.createElement('div');
    doc.innerHTML = html;

    let boughtTable = null, soldTable = null;
    Array.from(doc.querySelectorAll('h3')).forEach(function (h3) {
        const txt = h3.textContent.trim().toLowerCase();
        const next = h3.nextElementSibling;
        if (txt === 'bought' && next?.tagName === 'TABLE') boughtTable = next;
        if (txt === 'sold' && next?.tagName === 'TABLE') soldTable = next;
    });

    function parseTable(table) {
        if (!table) return [];
        return Array.from(table.querySelectorAll('tr')).slice(1).flatMap(tr => {
            const tds = Array.from(tr.querySelectorAll('td'));
            if (tds.length < 4 || tds[0].getAttribute('colspan')) return [];
            const a = tds[0].querySelector('a[player_link]');
            if (!a) return [];
            return [{ name: a.textContent.trim(), pid: a.getAttribute('player_link'), url: a.getAttribute('href'), starsHtml: tds[1].innerHTML, price: parseFloat(tds[3].textContent.replace(/,/g, '').trim()) || 0 }];
        });
    }

    const bought = parseTable(boughtTable);
    const sold = parseTable(soldTable);

    let totalBought = 0, totalSold = 0, balance = 0;
    Array.from(doc.querySelectorAll('td[colspan]')).forEach(function (td) {
        const txt = td.textContent.trim();
        const val = parseFloat((td.querySelector('strong')?.textContent || '0').replace(/,/g, '')) || 0;
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
function transferSummaryHtml(b, s, bal, n, extra) {
    return TmSummaryStrip.render([
        { label: 'Bought', valueHtml: H().fmt(b) + ' M', valueCls: 'tmh-neg' },
        { label: 'Sold', valueHtml: H().fmt(s) + ' M', valueCls: 'tmh-pos' },
        { label: 'Balance', valueHtml: (bal >= 0 ? '+' : '') + H().fmt(bal) + ' M', valueCls: H().balCls(bal) },
        { label: 'Transfers', value: String(n) },
        ...(extra || []),
    ], { variant: 'boxed', valueFirst: true, align: 'center' });
}

function renderSeasonData(c, d) {
    let h = transferSummaryHtml(d.totalBought, d.totalSold, d.balance, d.bought.length + d.sold.length);

    h += '<div class="tmh-sec">Bought (' + d.bought.length + ')</div>';
    h += '<div id="tmh-bought-wrap"></div>';

    h += '<div class="tmh-sec">Sold (' + d.sold.length + ')</div>';
    h += '<div id="tmh-sold-wrap"></div>';

    c.innerHTML = h;
    renderSortablePlayerTable(c.querySelector('#tmh-bought-wrap'), d.bought, 'From');
    renderSortablePlayerTable(c.querySelector('#tmh-sold-wrap'), d.sold, 'To');
}

function renderSortablePlayerTable(c, arr, clubLabel, opts) {
    opts = opts || {};
    if (!arr.length) { c.innerHTML = TmUI.empty('No players', true); return; }

    const pic = H().playerInfoCache;
    const makePlayers = () => arr.map((p, idx) => {
        const retired = /retired/i.test(p.starsHtml || '');
        const info = pic[p.pid];
        return {
            _idx: idx + 1,
            id: p.pid, pid: p.pid,
            name: p.name,
            href: p.url || `/players/${p.pid}/`,
            fp: retired ? '' : (info?.pos || ''),
            age: retired ? null : (info?.age ?? null),
            months: retired ? 0 : (info?.months ?? 0),
            asi: retired ? null : (info?.asi ?? null),
            r5: retired ? null : (info?.r5 ?? null),
            rec: retired ? null : (info?.rec ?? null),
            _starsHtml: p.starsHtml || '',
            _price: p.price,
        };
    });

    c.innerHTML = '';
    const wrap = TmPlayersTable.mount(c, makePlayers(), {
        columns: { rtn: false, timeleft: false, curbid: false },
        sortKey: opts.defaultSort || '_price',
        sortDir: opts.defaultDir !== undefined ? opts.defaultDir : -1,
        onRowClick: null, rowCls: null,
        extraColsBefore: [{ key: '_idx', label: '#', sortable: false }],
        extraColsAfter: [
            { key: '_starsHtml', label: clubLabel, sortable: false, cls: 'c tmh-stars', render: v => v },
            { key: '_price', label: 'Price (M)', align: 'r', render: v => `<span class="tmu-tabular" style="color:var(--tmu-text-strong)">${H().fmt(v)}</span>` },
        ],
    });

    H().prefetchPlayers(arr.map(p => p.pid), () => wrap.refresh(makePlayers()));
}

/* ═══════════════════════════════════════
   STILL PLAYING (sold players not retired)
   ═══════════════════════════════════════ */
function loadStillPlaying() {
    const btn = _el.querySelector('#tmh-still-btn');
    const wrap = _el.querySelector('#tmh-tdata');
    if (btn) { btn.classList.add('busy'); btn.textContent = 'Loading…'; }

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
        if (btn) { btn.classList.remove('busy'); btn.textContent = 'Still Playing (sold)'; }

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
            let h = '<div class="tmh-sec">Sold Players Still Playing (' + list.length + ')</div>';
            c.innerHTML = h;
            if (!list.length) { c.insertAdjacentHTML('beforeend', TmUI.empty('No sold players still active')); return; }

            const pic = H().playerInfoCache;
            const makePlayers = () => list.map((p, idx) => {
                const info = pic[p.pid];
                return { _idx: idx + 1, id: p.pid, pid: p.pid, name: p.name, href: p.url || `/players/${p.pid}/`, fp: info?.pos || '', age: info?.age ?? null, months: info?.months ?? 0, asi: info?.asi ?? null, r5: info?.r5 ?? null, rec: info?.rec ?? null, _sales: p.sales.length, _seasons: p.sales.map(s => 'S' + s.season).join(', ') };
            });

            const wrap = TmPlayersTable.mount(c, makePlayers(), {
                columns: { rtn: false, timeleft: false, curbid: false },
                sortKey: 'r5', sortDir: -1,
                onRowClick: null, rowCls: null,
                extraColsBefore: [{ key: '_idx', label: '#', sortable: false }],
                extraColsAfter: [
                    { key: '_sales', label: 'Sales', align: 'r' },
                    { key: '_seasons', label: 'Seasons', sortable: false, render: v => `<span style="font-size:var(--tmu-font-xs);color:var(--tmu-text-accent-soft)">${v}</span>` },
                ],
            });
            H().prefetchPlayers(list.map(p => p.pid), () => wrap.refresh(makePlayers()));
        }

        renderStillPlayingTable(c, stillPlaying);
    }
}

/* ═══════════════════════════════════════
   LOAD ALL SEASONS (aggregate)
   ═══════════════════════════════════════ */
function loadAllSeasons() {
    const btn = _el.querySelector('#tmh-all-btn');
    const wrap = _el.querySelector('#tmh-tdata');
    if (btn) { btn.classList.add('busy'); btn.textContent = 'Loading…'; }

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
        if (btn) { btn.classList.remove('busy'); btn.textContent = 'Load All Seasons Summary'; }
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

    let h = transferSummaryHtml(gB, gS, gBal, gN, [{ label: 'Seasons', value: String(_seasons.length) }]);

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

    c.innerHTML = h;
    renderSortableSeasonTable(c.querySelector('#tmh-szn-wrap'), rows, gB, gS, gBal, gN);
    renderSortablePlayerTable(c.querySelector('#tmh-top-buy'), topBuy.slice(0, 10), 'From', { showSeason: true });
    renderSortablePlayerTable(c.querySelector('#tmh-top-sell'), topSell.slice(0, 10), 'To', { showSeason: true });
    if (trades.length) {
        renderSortableTradeTable(c.querySelector('#tmh-best-trades'), trades.slice(0, 10));
        var worst2 = trades.filter(t => t.profit < 0).sort((a, b) => a.profit - b.profit);
        if (worst2.length) renderSortableTradeTable(c.querySelector('#tmh-worst-trades'), worst2.slice(0, 10));
    }
    if (academy.rows.length) renderSortableAcademyTable(c.querySelector('#tmh-academy'), academy);
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
            setExtraBtnActive(null);
            currentSeason = String(row.sid);
            const sel = _el.querySelector('#tmh-sel-season');
            if (sel) sel.value = currentSeason;
            loadSeason(currentSeason);
        },
    });
    c.innerHTML = '';
    c.appendChild(tbl);
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
    c.innerHTML = '';
    c.appendChild(tbl);
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
    c.innerHTML = '';
    c.appendChild(tbl);
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
