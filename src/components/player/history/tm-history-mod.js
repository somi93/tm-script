import { TmUI } from '../../shared/tm-ui.js';
import { TmPlayerDataTable } from '../skills/tm-player-data-table.js';
import { TmPlayerService } from '../../../services/player.js';
import { CountryFlag } from '../../shared/country-flag.js';
import { TmUtils } from '../../../lib/tm-utils.js';

const CSS = `
/* ═══════════════════════════════════════
   HISTORY (tmph-*)
   ═══════════════════════════════════════ */
#tmph-root {
    display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;line-height: 1.4;
}
.tmu-tabs.tmph-tabs { margin-bottom: var(--tmu-space-md); border-radius: var(--tmu-space-sm); overflow: hidden; }
.tmph-transfer td {
    background: var(--tmu-surface-accent-soft); color: var(--tmu-text-faint); font-size: var(--tmu-font-xs);
    padding: var(--tmu-space-xs) var(--tmu-space-sm); border-bottom: 1px solid var(--tmu-border-soft-alpha-mid);
}
.tmph-xfer-sum { background: var(--tmu-warning-fill); padding: 0 var(--tmu-space-sm); border-radius: var(--tmu-space-xs); border: 1px solid var(--tmu-border-warning); }
.tmph-div { white-space: nowrap; font-size: var(--tmu-font-xs); }
.tmph-club { display: flex; align-items: center; gap: var(--tmu-space-sm); white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: CSS }));

/* ── internal state ── */
let player = null;
let activeTab = 'nat';
let root = null;

const q = (sel) => root ? root.querySelector(sel) : null;

/* ── helpers ── */
const setContent = (el, content) => {
    if (!el) return;
    el.innerHTML = '';
    if (content instanceof Node) el.appendChild(content);
    else el.innerHTML = content;
};

const buildNTTable = (nt) => {
    if (!nt) return TmUI.empty('Not called up for any national team', true);
    const avgR = nt.matches > 0 ? nt.rating.toFixed(1) : '-';
    return TmPlayerDataTable.table({
        tableClass: 'tmph-tbl',
        headerRows: [{
            cells: [
                { content: 'Country' },
                { content: '' },
                { content: 'Gp', cls: 'c' },
                { content: player?.isGK ? 'Con' : 'G', cls: 'c' },
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
                { content: avgR, cls: 'c font-bold', attrs: { style: `color:${TmUtils.ratingColor(avgR)}` } },
                { content: nt.mom, cls: 'c font-bold', attrs: { style: 'color:var(--tmu-warning)' } },
            ],
        }],
    });
};

const buildTable = (rows) => {
    if (!rows || !rows.length) return TmUI.empty('No history data available', true);
    const totalRow = rows.find(r => r.type === 'total');
    const dataRows = rows.filter(r => r.type !== 'total');
    const bodyRows = [];
    for (const row of dataRows) {
        if (row.type === 'transfer') {
            bodyRows.push({
                cls: 'tmph-transfer',
                cells: [{
                    content: `<tm-row data-justify="center" data-gap="8px">
                        <span class="blue" style="font-size:var(--tmu-font-sm);line-height:1">⇄</span>
                        <span class="muted text-xs font-semibold uppercase">Transfer</span>
                        <span class="tmph-xfer-sum yellow font-bold text-sm">${row.amount}</span>
                    </tm-row>`,
                    attrs: { colspan: 8 },
                }],
            });
            continue;
        }
        const clubHtml = row.club_href
            ? `<a href="${row.club_href}" target="_blank">${row.club_name || ''}</a>`
            : (row.club_name || '-');
        bodyRows.push({
            cells: [
                { content: row.season, cls: 'c font-bold' },
                { content: `<div class="tmph-club">${clubHtml}</div>` },
                { content: `${CountryFlag.render(row.country, 'tmsq-flag')} ${row.division ?? ''}.${row.group ?? ''}`, cls: 'tmph-div' },
                { content: row.games, cls: 'c' },
                { content: player?.isGK ? row.conceded : row.goals, cls: 'c font-semibold', attrs: { style: 'color:var(--tmu-success)' } },
                { content: row.assists, cls: 'c', attrs: { style: 'color:var(--tmu-info)' } },
                { content: row.cards, cls: 'c yellow' },
                { content: row.rating, cls: 'r font-bold', attrs: { style: `color:${TmUtils.ratingColor(row.rating)}` } },
            ],
        });
    }
    if (totalRow) {
        bodyRows.push({
            cls: 'tmph-tot',
            cells: [
                { content: 'Career Total', cls: 'c', attrs: { colspan: 2 } },
                { content: '' },
                { content: totalRow.games, cls: 'c' },
                { content: player?.isGK ? totalRow.conceded : totalRow.goals, cls: 'c', attrs: { style: 'color:var(--tmu-success)' } },
                { content: totalRow.assists, cls: 'c', attrs: { style: 'color:var(--tmu-info)' } },
                { content: totalRow.cards, cls: 'c yellow' },
                { content: totalRow.rating_avg ?? '-', cls: 'r' },
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
                { content: player?.isGK ? 'Con' : 'G', cls: 'c' },
                { content: 'A', cls: 'c' },
                { content: 'Cards', cls: 'c' },
                { content: 'Rating', cls: 'r' },
            ],
        }],
        bodyRows,
    });
};

const parseNT = (playerArg) => {
    const h3s = document.querySelectorAll('h3.dark');
    for (const h3 of h3s) {
        const txt = h3.textContent;
        if (!txt.includes('Called up for') && !txt.includes('Previously played for')) continue;
        const countryLink = h3.querySelector('a.country_link');
        const countryName = countryLink ? countryLink.textContent.trim() : '';
        const nextDiv = h3.nextElementSibling;
        const table = nextDiv && nextDiv.querySelector('table');
        if (!table) continue;
        const tds = table.querySelectorAll('tr:not(:first-child) td, tr.odd td');
        if (tds.length >= 6) {
            h3.style.display = 'none';
            if (nextDiv) nextDiv.style.display = 'none';
            return {
                country: countryName,
                flagHtml: CountryFlag.render(playerArg?.country, 'tmsq-flag'),
                matches: parseInt(tds[0].textContent) || 0,
                goals: parseInt(tds[1].textContent) || 0,
                assists: parseInt(tds[2].textContent) || 0,
                cards: parseInt(tds[3].textContent) || 0,
                rating: parseFloat(tds[4].textContent) || 0,
                mom: parseInt(tds[5].textContent) || 0,
            };
        }
    }
    return null;
};

const render = (container, p) => {
    player = p;
    activeTab = 'nat';
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.id = 'tmph-root';
    container.appendChild(wrapper);
    root = wrapper;

    const TAB_LABELS = { nat: 'League', cup: 'Cup', int: 'International', total: 'Total' };
    if (player.stats.nationalTeam) TAB_LABELS.nt = 'National Team';

    const tabsEl = TmUI.tabs({
        items: Object.entries(TAB_LABELS).map(([key, label]) => ({
            key, label,
            disabled: key === 'nt' ? !player.stats.nationalTeam : !(player.stats[key] || []).length,
        })),
        active: activeTab,
        color: 'primary',
        cls: 'tmph-tabs',
        stretch: true,
        onChange: (key) => {
            activeTab = key;
            const tabContent = q('#tmph-tab-content');
            if (tabContent) setContent(tabContent, key === 'nt' ? buildNTTable(player.stats.nationalTeam) : buildTable(player.stats[key]));
            if (tabContent) TmUI?.render(tabContent);
        },
    });

    root.innerHTML = `<div class="tmph-wrap"></div>`;
    const wrap = root.querySelector('.tmph-wrap');
    wrap.appendChild(tabsEl);
    const bodyEl = document.createElement('div');
    bodyEl.className = 'tmph-body';
    bodyEl.id = 'tmph-tab-content';
    setContent(bodyEl, buildTable(player.stats[activeTab]));
    wrap.appendChild(bodyEl);
    TmUI?.render(root);
};

const load = (container, playerArg) => {
    container.innerHTML = TmUI.loading();
    Promise.all([
        TmPlayerService.fetchPlayerHistory(playerArg.id),
        Promise.resolve(parseNT(playerArg)),
    ]).then(([stats, nt]) => {
        if (!stats) {
            container.innerHTML = TmUI.error('Failed to load data');
            return;
        }
        playerArg.stats = stats;
        playerArg.stats.nationalTeam = nt;
        render(container, playerArg);
    });
};

export const TmHistoryMod = { render, load };
