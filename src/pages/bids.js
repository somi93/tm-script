import { TmBidsSideMenu } from '../components/bids/tm-bids-side-menu.js';
import { TmPlayersTable } from '../components/shared/tm-players-table.js';
import { TmBidsDialog } from '../components/bids/tm-bids-dialog.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmShortlistService } from '../services/shortlist.js';
// import { enrichPlayers, toPageRecord } from '../services/players-enrich.js';

'use strict';

const STYLE_ID = 'tmvu-bids-style';

function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    injectTmPageLayoutStyles();

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-bids-page { --tmu-page-sidebar-width: 240px; }
        .tmvu-bids-main { min-width: 0; }
    `;

    document.head.appendChild(style);
}

function parseMenuItems() {
    return Array.from(document.querySelectorAll('.column1 .content_menu a, .column1_a .content_menu a')).map(anchor => ({
        href: anchor.getAttribute('href') || '#',
        label: cleanText(anchor.textContent),
    }));
}

function createSectionCard(section, rows, onRowClick) {
    const host = document.createElement('section');
    TmUI.render(host, `<tm-card data-title="${escapeHtml(section.title)}"></tm-card>`);
    const card = host.firstElementChild || host;
    const body = card.querySelector('.tmu-card-body') || card;

    if (rows.length) {
        TmPlayersTable.mount(body, rows, {
            columns: { asi: false, rtn: false },
            sectionTitle: section.title,
            sortKey: 'timeleft',
            sortDir: 1,
            onRowClick,
        });
    } else {
        body.innerHTML = TmUI.empty(section.emptyText || 'No rows found.', true);
    }

    return card;
}

function renderPage(mountedMain, menuItems, bodyNode) {
    mountedMain.classList.add('tmvu-bids-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');
    mountedMain.innerHTML = '';

    TmBidsSideMenu.mount(mountedMain, {
        className: 'tmu-page-sidebar-stack',
        items: menuItems,
        currentHref: '/bids/',
    });

    const content = document.createElement('section');
    content.className = 'tmvu-bids-main tmu-page-section-stack';
    content.appendChild(bodyNode);
    mountedMain.appendChild(content);
}

export async function initBidsPage(mountedMain) {
    if (!mountedMain) return;

    injectStyles();
    const menuItems = parseMenuItems();

    const loading = document.createElement('section');
    loading.innerHTML = TmUI.loading('Loading bids...', true);
    renderPage(mountedMain, menuItems, loading);

    const [shortlistSections, myPlayerSections] = await Promise.all([
        TmShortlistService.fetchShortlistBidSections(),
        TmShortlistService.fetchOwnSaleBidSections(),
    ]);

    const sections = [
        shortlistSections[0] || { title: 'Shortlist', rows: [], emptyText: 'No active shortlist bids found.' },
        myPlayerSections[0] || { title: 'My Players', rows: [], emptyText: 'No active bids on your listed players.' },
    ];

    // Build page record map for enrich
    const pageRecords = {};
    for (const section of sections) {
        for (const p of section.rows) pageRecords[String(p.id)] = toPageRecord(p);
    }

    // Collect all IDs across sections (active bids only)
    const allIds = sections.flatMap(s => s.rows.map(p => String(p.id)));

    const content = document.createElement('div');
    const removedIds = new Set();
    // enrichedBySection[i] = latest enriched rows for section i
    const enrichedBySection = sections.map(s => s.rows.slice());

    function rerenderSectionBody(idx) {
        const { section, body } = sectionEls[idx];
        const rows = enrichedBySection[idx].filter(p => !removedIds.has(String(p.id)));
        body.innerHTML = '';
        if (rows.length) {
            TmPlayersTable.mount(body, rows, {
                columns: { asi: false, rtn: false },
                sectionTitle: section.title,
                sortKey: 'timeleft',
                sortDir: 1,
                onRowClick: makeRowClick(idx),
            });
        } else {
            body.innerHTML = TmUI.empty(section.emptyText || 'No rows found.', true);
        }
    }

    function makeRowClick(idx) {
        const title = sections[idx].title;
        return (p) => {
            if (p.timeleft <= 0) return;
            TmBidsDialog.open({ ...p, sectionTitle: title }, {
                onRemoved: (pid) => {
                    removedIds.add(String(pid));
                    rerenderSectionBody(idx);
                },
            });
        };
    }

    // Initial render with stub data (timeleft + curbid visible immediately)
    const sectionEls = sections.map((section, idx) => {
        const card = createSectionCard(section, section.rows, makeRowClick(idx));
        content.appendChild(card);
        return { section, card, body: card.querySelector('.tmu-card-body') || card };
    });
    renderPage(mountedMain, menuItems, content);

    if (!allIds.length) return;

    // Enrich with full stats — re-render each section as data arrives
    await enrichPlayers(allIds, pageRecords, {
        onUpdate: (enriched) => {
            for (let idx = 0; idx < sectionEls.length; idx++) {
                const { section } = sectionEls[idx];
                const sectionRows = enriched.filter(p => section.rows.some(r => String(r.id) === p.id));
                if (!sectionRows.length) continue;
                enrichedBySection[idx] = sectionRows;
                rerenderSectionBody(idx);
            }
        },
    });
}