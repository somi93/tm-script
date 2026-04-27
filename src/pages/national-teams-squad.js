import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmPlayersTable } from '../components/shared/tm-players-table.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { mountNationalTeamsSideMenu } from '../components/national-teams/tm-national-teams-side-menu.js';
import { TmPlayerModel } from '../models/player.js';

const STYLE_ID = 'tmvu-national-teams-squad-style';

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-nt-squad-page {
            --tmu-page-sidebar-width: 200px;
        }

        .tmvu-nt-squad-title {
            font-size: var(--tmu-font-sm);
            font-weight: 700;
            color: var(--tmu-text-strong);
            letter-spacing: 0.3px;
        }

        .tmvu-nt-squad-wrap {
            padding: var(--tmu-space-lg);
        }
    `;
    document.head.appendChild(style);
};

const extractPlayerId = (anchor) => {
    const playerLink = anchor?.getAttribute('player_link');
    if (playerLink) return String(playerLink).trim();
    return anchor?.getAttribute('href')?.match(/\/players\/(\d+)\//i)?.[1] || '';
};

const parseTableRows = (table) => Array.from(table?.querySelectorAll('tr') || []).map((row) => {
    const cells = Array.from(row.querySelectorAll('td'));
    const playerAnchor = row.querySelector('a[player_link], a[href*="/players/"]');
    const playerId = extractPlayerId(playerAnchor);
    if (!playerId || cells.length < 2) return null;
    return {
        playerId,
        number: cleanText(cells[0]?.textContent || ''),
        name: cleanText(playerAnchor?.textContent || ''),
        href: playerAnchor?.getAttribute('href') || `/players/${playerId}/`,
    };
}).filter(Boolean);

const findSquadSource = (root) => {
    const boxes = Array.from(root.querySelectorAll('.column2_a > .box, .column2 > .box, .column3_a > .box, .column3 > .box'));
    const candidates = boxes.map((box) => {
        const title = cleanText(box.querySelector('.box_head h2, .box_sub_header .large')?.textContent || 'Squad');
        const bestTable = Array.from(box.querySelectorAll('table')).map((table) => ({ rows: parseTableRows(table) }))
            .sort((left, right) => right.rows.length - left.rows.length)[0];

        return {
            title,
            rows: bestTable?.rows || [],
            score: (/squad|players/i.test(title) ? 1000 : 0) + (bestTable?.rows?.length || 0),
        };
    }).filter((candidate) => candidate.rows.length);

    return candidates.sort((left, right) => right.score - left.score)[0] || null;
};

const dedupeRows = (rows) => {
    const seen = new Set();
    return rows.filter((row) => {
        if (seen.has(row.playerId)) return false;
        seen.add(row.playerId);
        return true;
    });
};

const loadSquadPlayers = async (rows) => {
    const players = await Promise.all(rows.map(async (row) => {
        try {
            const player = await TmPlayerModel.fetchTooltipCached(row.playerId);
            if (!player) return null;
            return {
                ...player,
                no: row.number || player.no || '',
                href: row.href || `/players/${row.playerId}/`,
                name: player.name || row.name,
            };
        } catch {
            return null;
        }
    }));

    return players.filter(Boolean);
};

export function initNationalTeamsSquadPage(main) {
    if (!main || !main.isConnected) return;
    const routeMatch = window.location.pathname.match(/^\/national-teams\/([a-z]{2,3})\/squad\/?$/i);
    if (!routeMatch) return;

    const countryCode = routeMatch[1].toLowerCase();
    const sourceRoot = document.querySelector('.main_center') || main;
    const squadSource = findSquadSource(sourceRoot);

    injectTmPageLayoutStyles();
    injectStyles();
    TmPlayersTable.injectCSS();

    main.innerHTML = '';
    main.classList.add('tmvu-nt-squad-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');

    mountNationalTeamsSideMenu(main, {
        root: sourceRoot,
        id: 'tmvu-national-teams-squad-nav',
        countryCode,
        currentSeason: Number(window.SESSION?.season) || null,
    });

    const mainColumn = document.createElement('section');
    mainColumn.className = 'tmu-page-section-stack';
    const card = document.createElement('section');
    card.className = 'tmu-card';
    card.innerHTML = `
        <div class="tmu-card-head">
            <span class="tmvu-nt-squad-title">${escapeHtml(squadSource?.title || 'Squad')}</span>
        </div>
        <div class="tmu-card-body tmu-card-body-flush">
            <div data-ref="panel" class="tmvu-nt-squad-wrap"></div>
        </div>
    `;
    mainColumn.appendChild(card);
    main.appendChild(mainColumn);

    const panelHost = card.querySelector('[data-ref="panel"]');
    if (!panelHost) return;

    const rows = dedupeRows(squadSource?.rows || []);
    if (!rows.length) {
        panelHost.innerHTML = TmUI.empty('No squad players found.', true);
        return;
    }

    panelHost.innerHTML = TmUI.loading('Loading squad...', true);

    loadSquadPlayers(rows).then((players) => {
        if (!players.length) {
            panelHost.innerHTML = TmUI.empty('No squad players found.', true);
            return;
        }

        panelHost.innerHTML = '';
        TmPlayersTable.mount(panelHost, players, {
            columns: { timeleft: false, curbid: false },
            sortKey: 'pos',
            sortDir: 1,
            rowCls: () => null,
            onRowClick: () => {},
            extraColsBefore: [{
                key: 'no',
                label: '#',
                align: 'r',
                render: (_value, player) => `<span class="tmu-tabular">${escapeHtml(player.no || '')}</span>`,
            }],
        });
    }).catch((error) => {
        panelHost.innerHTML = TmUI.error(`Failed to load squad: ${error.message}`, true);
    });
}