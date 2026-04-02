import { TmUI } from '../shared/tm-ui.js';
import { TmPlayerDataTable } from './tm-player-data-table.js';

const CSS = `
/* ═══════════════════════════════════════
   HISTORY (tmph-*)
   ═══════════════════════════════════════ */
#tmph-root {
    display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--tmu-text-main); line-height: 1.4;
}
.tmph-wrap {
    background: transparent; border-radius: 0; border: none; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--tmu-text-main); font-size: var(--tmu-font-sm);
}
.tmu-tabs.tmph-tabs { margin: var(--tmu-space-md) var(--tmu-space-lg) var(--tmu-space-sm); border-radius: var(--tmu-space-sm); overflow: hidden; }
.tmph-body { padding: var(--tmu-space-sm) var(--tmu-space-lg) var(--tmu-space-lg); font-size: var(--tmu-font-sm); min-height: 120px; }
.tmph-tbl { width: 100%; border-collapse: collapse; font-size: var(--tmu-font-xs); margin-bottom: var(--tmu-space-xs); }
.tmph-tbl th {
    padding: var(--tmu-space-sm); font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-faint);
    text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid var(--tmu-border-soft);
    text-align: left; white-space: nowrap;
}
.tmph-tbl th.c { text-align: center; }
.tmph-tbl th.r { text-align: right; }
.tmph-tbl td {
    padding: var(--tmu-space-xs) var(--tmu-space-sm); border-bottom: 1px solid var(--tmu-border-faint);
    color: var(--tmu-text-main); font-variant-numeric: tabular-nums; vertical-align: middle;
}
.tmph-tbl td.c { text-align: center; }
.tmph-tbl td.r { text-align: right; }
.tmph-tbl tr:hover { background: var(--tmu-border-contrast); }
.tmph-tbl a { color: var(--tmu-accent); text-decoration: none; font-weight: 600; }
.tmph-tbl a:hover { color: var(--tmu-text-main); text-decoration: underline; }
.tmph-tbl .tmph-tot td { border-top: 2px solid var(--tmu-border-embedded); color: var(--tmu-text-strong); font-weight: 800; }
.tmph-transfer td {
    background: var(--tmu-surface-accent-soft); color: var(--tmu-text-faint); font-size: var(--tmu-font-xs);
    padding: var(--tmu-space-xs) var(--tmu-space-sm); border-bottom: 1px solid var(--tmu-border-soft-alpha-mid);
}
.tmph-xfer-sum { background: var(--tmu-warning-fill); padding: 0 var(--tmu-space-sm); border-radius: var(--tmu-space-xs); border: 1px solid var(--tmu-border-warning); }
.tmph-div { white-space: nowrap; font-size: var(--tmu-font-xs); }
.tmph-club { display: flex; align-items: center; gap: var(--tmu-space-sm); white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
.tmph-tbl td.tmph-r-good { color: var(--tmu-success); }
.tmph-tbl td.tmph-r-low { color: var(--tmu-danger); }
`;
    const _s = document.createElement('style');
    _s.textContent = CSS;
    document.head.appendChild(_s);

    /* ── internal state ── */
    let _ntData = null;
    let _historyData = null;
    let _isGK = false;
    let _activeTab = 'nat';
    let _root = null;

    const q = (sel) => _root ? _root.querySelector(sel) : null;

    /* ── helpers ── */
    const extractClubName = (html) => { if (!html) return '-'; const m = html.match(/>([^<]+)<\/a>/); return m ? m[1] : (html === '-' ? '-' : html.replace(/<[^>]+>/g, '').trim() || '-'); };
    const extractClubLink = (html) => { if (!html) return ''; const m = html.match(/href="([^"]+)"/); return m ? m[1] : ''; };
    const fixDivFlags = (s) => s ? s.replace(/class='flag-img-([^']+)'/g, "class='flag-img-$1 tmsq-flag'") : '';
    const ratingClass = (r) => { const v = parseFloat(r); if (isNaN(v) || v === 0) return ''; if (v >= 6.0) return 'tmph-r-good'; if (v < 4.5) return 'tmph-r-low'; return ''; };
    const calcRating = (rating, games) => { const r = parseFloat(rating), g = parseInt(games); if (!r || !g || g === 0) return '-'; return (r / g).toFixed(2); };
    const fmtNum = (n) => (n == null || n === '' || n === 0) ? '0' : Number(n).toLocaleString();
    const setContent = (el, content) => {
        if (!el) return;
        el.innerHTML = '';
        if (content instanceof Node) el.appendChild(content);
        else el.innerHTML = content;
    };

    const buildNTTable = (nt) => {
        if (!nt) return TmUI.empty('Not called up for any national team', true);
        const avgR = nt.matches > 0 ? nt.rating.toFixed(1) : '-';
        const rc = ratingClass(avgR);
        return TmPlayerDataTable.table({
            tableClass: 'tmph-tbl',
            headerRows: [{
                cells: [
                    { content: 'Country' },
                    { content: '' },
                    { content: 'Gp', cls: 'c' },
                    { content: _isGK ? 'Con' : 'G', cls: 'c' },
                    { content: 'A', cls: 'c' },
                    { content: 'Cards', cls: 'c' },
                    { content: 'Rating', cls: 'c' },
                    { content: 'Mom', cls: 'c', attrs: { style: 'color:var(--tmu-warning)' } },
                ],
            }],
            bodyRows: [{
                cells: [
                    { content: `<div class="tmph-club">${nt.country}</div>` },
                    { content: nt.flagHtml, cls: 'tmph-div' },
                    { content: nt.matches, cls: 'c' },
                    { content: nt.goals, cls: 'c font-semibold', attrs: { style: 'color:var(--tmu-success)' } },
                    { content: nt.assists, cls: 'c', attrs: { style: 'color:var(--tmu-info)' } },
                    { content: nt.cards, cls: 'c yellow' },
                    { content: avgR, cls: `c font-bold ${rc}`.trim() },
                    { content: nt.mom, cls: 'c font-bold', attrs: { style: 'color:var(--tmu-warning)' } },
                ],
            }],
        });
    };

    const buildTable = (rows) => {
        if (!rows || !rows.length) return TmUI.empty('No history data available', true);
        const totalRow = rows.find(r => r.season === 'total');
        const dataRows = rows.filter(r => r.season !== 'total');
        const bodyRows = [];
        for (const row of dataRows) {
            if (row.season === 'transfer') {
                bodyRows.push({
                    cls: 'tmph-transfer',
                    cells: [{
                        content: `<tm-row data-justify="center" data-gap="8px"><span class="blue" style="font-size:var(--tmu-font-sm);line-height:1">⇄</span><span class="muted text-xs font-semibold uppercase">Transfer</span><span class="tmph-xfer-sum yellow font-bold text-sm">${row.transfer}</span></tm-row>`,
                        attrs: { colspan: 8 },
                    }],
                });
                continue;
            }
            const cn = extractClubName(row.klubnavn), cl = extractClubLink(row.klubnavn);
            const cnH = cl ? `<a href="${cl}" target="_blank">${cn}</a>` : cn;
            const divH = fixDivFlags(row.division_string);
            const avgR = calcRating(row.rating, row.games);
            bodyRows.push({
                cells: [
                    { content: row.season, cls: 'c font-bold' },
                    { content: `<div class="tmph-club">${cnH}</div>` },
                    { content: divH, cls: 'tmph-div' },
                    { content: row.games || 0, cls: 'c' },
                    { content: _isGK ? (row.conceded || 0) : (row.goals || 0), cls: 'c font-semibold', attrs: { style: 'color:var(--tmu-success)' } },
                    { content: row.assists || 0, cls: 'c', attrs: { style: 'color:var(--tmu-info)' } },
                    { content: row.cards || 0, cls: 'c yellow' },
                    { content: avgR, cls: `r font-bold ${ratingClass(avgR)}`.trim() },
                ],
            });
        }
        if (totalRow) {
            const tr = calcRating(totalRow.rating, totalRow.games);
            bodyRows.push({
                cls: 'tmph-tot',
                cells: [
                    { content: 'Career Total', cls: 'c', attrs: { colspan: 2 } },
                    { content: '' },
                    { content: fmtNum(totalRow.games), cls: 'c' },
                    { content: fmtNum(_isGK ? totalRow.conceded : totalRow.goals), cls: 'c', attrs: { style: 'color:var(--tmu-success)' } },
                    { content: fmtNum(totalRow.assists), cls: 'c', attrs: { style: 'color:var(--tmu-info)' } },
                    { content: fmtNum(totalRow.cards), cls: 'c yellow' },
                    { content: tr, cls: 'r' },
                ],
            });
        }
        return TmPlayerDataTable.table({
            tableClass: 'tmph-tbl',
            headerRows: [{
                cells: [
                    { content: 'S', cls: 'c', attrs: { style: 'width:36px' } },
                    { content: 'Club' },
                    { content: 'Division' },
                    { content: 'Gp', cls: 'c' },
                    { content: _isGK ? 'Con' : 'G', cls: 'c' },
                    { content: 'A', cls: 'c' },
                    { content: 'Cards', cls: 'c' },
                    { content: 'Rating', cls: 'r' },
                ],
            }],
            bodyRows,
        });
    };

    /**
     * parseNT()
     *
     * Scrapes national team stats from the original TM DOM (must be called
     * before any operation that cleans the DOM, e.g. TmPlayerCard.render).
     * Hides the native NT section and stores the data internally.
     *
     * @returns {object|null}  Parsed NT data, or null if not found.
     */
    const parseNT = () => {
        const h3s = document.querySelectorAll('h3.dark');
        for (const h3 of h3s) {
            const txt = h3.textContent;
            if (!txt.includes('Called up for') && !txt.includes('Previously played for')) continue;
            const countryLink = h3.querySelector('a.country_link');
            const countryName = countryLink ? countryLink.textContent.trim() : '';
            const flagLinks = h3.querySelectorAll('.country_link');
            const flagEl = flagLinks.length > 1 ? flagLinks[flagLinks.length - 1] : flagLinks[0];
            const flagHtml = flagEl ? flagEl.outerHTML : '';
            const nextDiv = h3.nextElementSibling;
            const table = nextDiv && nextDiv.querySelector('table');
            if (!table) continue;
            const tds = table.querySelectorAll('tr:not(:first-child) td, tr.odd td');
            if (tds.length >= 6) {
                h3.style.display = 'none';
                if (nextDiv) nextDiv.style.display = 'none';
                _ntData = {
                    country: countryName,
                    flagHtml,
                    matches: parseInt(tds[0].textContent) || 0,
                    goals: parseInt(tds[1].textContent) || 0,
                    assists: parseInt(tds[2].textContent) || 0,
                    cards: parseInt(tds[3].textContent) || 0,
                    rating: parseFloat(tds[4].textContent) || 0,
                    mom: parseInt(tds[5].textContent) || 0,
                };
                return _ntData;
            }
        }
        _ntData = null;
        return null;
    };

    /**
     * render(container, data, { isGK })
     *
     * Renders the full history tab into container.
     * Called by the tab system when the user first opens the History tab.
     *
     * @param {Element}  container
     * @param {object}   data       - API response: { table: { nat, cup, int, total } }
     * @param {object}   [opts]
     * @param {boolean}  [opts.isGK=false]
     */
    const render = (container, data, { isGK = false } = {}) => {
        _historyData = data.table;
        _isGK = isGK;
        _activeTab = 'nat';
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.id = 'tmph-root';
        container.appendChild(wrapper);
        _root = wrapper;

        const TAB_LABELS = { nat: 'League', cup: 'Cup', int: 'International', total: 'Total' };
        if (_ntData) TAB_LABELS.nt = 'National Team';

        const tabsEl = TmUI.tabs({
            items: Object.entries(TAB_LABELS).map(([key, label]) => ({
                key, label,
                disabled: key === 'nt' ? !_ntData : !(_historyData[key] || []).length,
            })),
            active: _activeTab,
            color: 'primary',
            cls: 'tmph-tabs',
            stretch: true,
            onChange: (key) => {
                _activeTab = key;
                const c = q('#tmph-tab-content');
                if (c) setContent(c, key === 'nt' ? buildNTTable(_ntData) : buildTable(_historyData[key]));
                if (c) TmUI?.render(c);
            },
        });

        _root.innerHTML = `<div class="tmph-wrap"></div>`;
        const wrap = _root.querySelector('.tmph-wrap');
        wrap.appendChild(tabsEl);
        const bodyEl = document.createElement('div');
        bodyEl.className = 'tmph-body';
        bodyEl.id = 'tmph-tab-content';
        setContent(bodyEl, buildTable(_historyData[_activeTab]));
        wrap.appendChild(bodyEl);
        TmUI?.render(_root);
    };

    /**
     * reRender({ isGK })
     *
     * Re-renders the tab using stored data. Pass updated isGK if the player
     * position became known after the initial render (e.g. tooltip arrived).
     *
     * @param {object}  [opts]
     * @param {boolean} [opts.isGK]  - If provided, updates stored isGK.
     */
    const reRender = ({ isGK = _isGK } = {}) => {
        if (!_root || !_historyData) return;
        const panel = _root.closest('.tmpe-panel') || _root.parentNode;
        if (panel) render(panel, { table: _historyData }, { isGK });
    };

    export const TmHistoryMod = { parseNT, render, reRender };
