import { TmBidsSideMenu } from '../components/bids/tm-bids-side-menu.js';
import { TmPlayersTable } from '../components/shared/tm-players-table.js';
import { TmBidsDialog } from '../components/bids/tm-bids-dialog.js';
import { TmShortlistTable } from '../components/shortlist/tm-shortlist-table.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmShortlistService } from '../services/shortlist.js';
import { TmPlayerModel } from '../models/player.js';
import { TmUtils } from '../lib/tm-utils.js';

'use strict';

const STYLE_ID = 'tmvu-bids-style';
const COLS = { asi: false, rtn: false, rec: false, nameWidth: '220px' };

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    injectTmPageLayoutStyles();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `.tmvu-bids-page { --tmu-page-sidebar-width: 240px; } .tmvu-bids-main { min-width: 0; } .tmvu-bids-main .tmu-card .tmpt-wrap { padding: var(--tmu-space-md) var(--tmu-space-lg); }`;
    document.head.appendChild(style);
}

function mountCard(container, title, rows, sortKey = 'timeleft') {
    if (!rows.length) return;
    const card = document.createElement('div');
    card.className = 'tmu-card';
    const head = document.createElement('div');
    head.className = 'tmu-card-head';
    head.textContent = title;
    card.appendChild(head);
    TmPlayersTable.mount(card, rows, {
        columns: COLS,
        sortKey,
        sortDir: 1,
        onRowClick: p => TmBidsDialog.open(p),
    });
    container.appendChild(card);
}

export async function initBidsPage(mountedMain) {
    if (!mountedMain) return;

    injectStyles();
    TmShortlistTable.injectCSS();

    const menuItems = Array.from(document.querySelectorAll('.column1 .content_menu a, .column1_a .content_menu a'))
        .map(a => ({ href: a.getAttribute('href') || '#', label: String(a.textContent || '').replace(/\s+/g, ' ').trim() }));

    mountedMain.classList.add('tmvu-bids-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');
    mountedMain.innerHTML = '';
    TmBidsSideMenu.mount(mountedMain, { className: 'tmu-page-sidebar-stack', items: menuItems, currentHref: '/bids/' });

    const panel = document.createElement('div');
    panel.id = 'tmsl-panel';
    panel.innerHTML = TmUI.loading('Loading bids…', true);
    const content = document.createElement('section');
    content.className = 'tmvu-bids-main tmu-page-section-stack';
    content.appendChild(panel);
    mountedMain.appendChild(content);

    const bidMeta = await TmShortlistService.fetchHomeBids();

    if (!bidMeta.length) {
        panel.innerHTML = TmUI.empty('No active transfer list bids found.', true);
        return;
    }

    const tooltips = await Promise.all(
        bidMeta.map(m => TmPlayerModel.fetchTooltipCached(m.id).catch(() => null))
    );

    const rows = bidMeta.map((meta, i) => {
        const player = tooltips[i];
        if (!player) return null;
        return {
            ...player,
            href: `/players/${player.id}/`,
            curbid: meta.curbid,
            bid: meta.bid,
            timeleft: meta.timeleft,
            timeleft_string: meta.timeleft_string,
            direction: meta.direction,
        };
    }).filter(Boolean);

    if (!rows.length) {
        panel.innerHTML = TmUI.empty('No active transfer list bids found.', true);
        return;
    }

    panel.innerHTML = '';
    mountCard(panel, 'Transfers In', rows.filter(r => r.direction === 'in'));
    mountCard(panel, 'My Players for Sale', rows.filter(r => r.direction === 'out'));
}
