import { TmNativeFeed } from '../shared/tm-native-feed.js';
import { TmTable } from '../shared/tm-table.js';

const STYLE_ID = 'tmvu-club-overview-style';

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-main.tmvu-club-layout {
            align-items: flex-start;
        }

        .tmvu-club-main.tmco-main,
        .tmvu-club-secondary.tmco-side {
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-lg);
        }

        .tmco-box {
            width: auto !important;
            margin: 0 !important;
            float: none !important;
            border: 1px solid var(--tmu-border-soft);
            border-radius: var(--tmu-space-md);
            overflow: hidden;
            background:
                radial-gradient(circle at top left, var(--tmu-success-fill-faint), transparent 42%),
                linear-gradient(180deg, var(--tmu-surface-card-soft) 0%, var(--tmu-surface-dark-muted) 100%);
            box-shadow: 0 14px 30px var(--tmu-shadow-elev);
        }

        .tmco-box-head {
            background: linear-gradient(180deg, var(--tmu-success-fill-soft), var(--tmu-success-fill-faint));
            border-bottom: 1px solid var(--tmu-border-soft-alpha);
            padding: 0 var(--tmu-space-lg);
            min-height: 48px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--tmu-space-md);
        }

        .tmco-box-title {
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-md);
            font-weight: 800;
            letter-spacing: 0.02em;
        }

        .tmco-box-body {
            padding: 0;
        }

        .tmco-club-top {
            padding: var(--tmu-space-xl) var(--tmu-space-xxl) var(--tmu-space-md);
            position: relative;
            border-bottom: 1px solid var(--tmu-border-soft-alpha);
            background: linear-gradient(180deg, var(--tmu-border-contrast), transparent);
        }

        .tmco-club-action {
            position: absolute;
            top: var(--tmu-space-xl);
            right: var(--tmu-space-xl);
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            text-decoration: none;
        }

        .tmco-club-action:hover {
            color: var(--tmu-accent);
        }

        .tmco-club-name {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--tmu-space-sm);
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-3xl);
            line-height: 1.15;
            font-weight: 900;
            text-align: center;
        }

        .tmco-wing {
            opacity: 0.55;
            filter: hue-rotate(28deg) saturate(1.15);
        }

        .tmco-club-name a {
            color: var(--tmu-text-strong);
            text-decoration: none;
        }

        .tmco-club-name a:hover {
            color: var(--tmu-accent);
        }

        .tmco-club-meta {
            color: var(--tmu-text-main);
            font-size: var(--tmu-font-sm);
            text-align: center;
            margin-top: var(--tmu-space-sm);
        }

        .tmco-club-meta a {
            color: var(--tmu-accent);
            text-decoration: none;
        }

        .tmco-club-meta a:hover {
            color: var(--tmu-text-strong);
        }

        .tmco-logo-stage {
            padding: var(--tmu-space-xl) var(--tmu-space-xxl) var(--tmu-space-lg);
            background:
                radial-gradient(circle at center, var(--tmu-success-fill-soft), transparent 58%),
                linear-gradient(180deg, var(--tmu-border-contrast), transparent);
        }

        .tmco-logo-shell {
            position: relative;
            min-height: 190px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .tmco-logo-card {
            position: relative;
            width: 152px;
            height: 152px;
                border-radius: var(--tmu-space-xxl);
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--tmu-surface-panel-dark);
            border: 1px solid var(--tmu-border-soft-alpha-mid);
            box-shadow: 0 18px 36px var(--tmu-shadow-elev);
            z-index: 1;
        }

        .tmco-logo-card img {
            width: 136px;
            height: 136px;
            object-fit: contain;
        }

        .tmco-founded {
            display: flex;
            justify-content: center;
            padding: 0 var(--tmu-space-xxl) var(--tmu-space-lg);
        }

        .tmco-founded span {
            display: inline-flex;
            align-items: center;
            min-height: 28px;
            padding: 0 var(--tmu-space-md);
            border-radius: 999px;
            background: var(--tmu-surface-accent-soft);
            border: 1px solid var(--tmu-border-soft-alpha);
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-xs);
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .tmco-players-table-wrap {
            padding: 0 var(--tmu-space-lg) var(--tmu-space-lg);
        }

        .tmco-players-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            overflow: hidden;
            border: 1px solid var(--tmu-border-soft-alpha);
            border-radius: var(--tmu-space-md);
            background: var(--tmu-surface-dark-soft);
        }

        .tmco-players-table tr {
            background: transparent;
        }

        .tmco-players-table tr:nth-child(even) {
            background: var(--tmu-border-contrast);
        }

        .tmco-players-table td {
            border: 0;
            padding: var(--tmu-space-md);
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-sm);
            white-space: nowrap;
        }

        .tmco-players-table tr + tr td {
            border-top: 1px solid var(--tmu-border-soft-alpha);
        }

        .tmco-players-table a {
            color: var(--tmu-text-strong);
            text-decoration: none;
            font-weight: 700;
        }

        .tmco-players-table a:hover {
            color: var(--tmu-accent);
        }

        .tmco-info-block {
            margin: 0 var(--tmu-space-lg) var(--tmu-space-xl);
            border-radius: var(--tmu-space-md);
            background: var(--tmu-surface-dark-strong);
            border: 1px solid var(--tmu-border-soft-alpha);
            overflow: hidden;
        }

        .tmco-info-link {
            display: block;
            padding: var(--tmu-space-md) var(--tmu-space-lg) 0;
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            text-decoration: none;
        }

        .tmco-info-link:hover {
            color: var(--tmu-accent);
        }

        .tmco-info-body {
            padding: var(--tmu-space-lg) var(--tmu-space-lg) var(--tmu-space-lg);
            color: var(--tmu-text-main);
            font-size: var(--tmu-font-sm);
            line-height: 1.75;
        }

        .tmco-info-body strong {
            color: var(--tmu-text-strong);
            font-weight: 800;
        }

        .tmco-info-body a {
            color: var(--tmu-accent);
            text-decoration: none;
        }

        .tmco-info-body a:hover {
            color: var(--tmu-text-strong);
        }

        .tmco-info-body .subtle,
        .tmco-trophy-sub,
        .tmco-trophies .subtle {
            color: var(--tmu-text-muted);
        }

        .tmco-trophies {
            padding: var(--tmu-space-md) var(--tmu-space-lg) var(--tmu-space-xl);
        }

        .tmco-trophy {
            display: grid;
            grid-template-columns: 75px minmax(0, 1fr);
            gap: var(--tmu-space-md);
            align-items: center;
            color: var(--tmu-text-strong);
            padding: var(--tmu-space-md) 0;
        }

        .tmco-trophy + .tmco-trophy {
            border-top: 1px solid var(--tmu-border-soft-alpha);
        }

        .tmco-trophy.small {
            grid-template-columns: 75px minmax(0, 1fr);
            min-height: 36px;
        }

        .tmco-trophy-icon {
            height: 65px;
            background-position: center;
            background-repeat: no-repeat;
            background-size: contain;
            opacity: 0.96;
            filter: saturate(1.04);
        }

        .tmco-trophy.small .tmco-trophy-icon {
            height: 30px;
            margin-top: var(--tmu-space-xs);
        }

        .tmco-trophy-title {
            color: var(--tmu-text-strong);
            font-weight: 700;
            line-height: 1.45;
        }

        .tmco-trophy.small .tmco-trophy-title {
            color: var(--tmu-text-strong);
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .tmco-expand {
            overflow: hidden;
        }

        .tmco-expand[hidden] {
            display: none;
        }

        .tmco-expand-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 40px;
            margin-top: calc(-1 * var(--tmu-space-md));
            background-image: linear-gradient(180deg, transparent, var(--tmu-surface-panel-dark));
            color: var(--tmu-accent);
            font-weight: 800;
            cursor: pointer;
            user-select: none;
        }

        .tmco-expand-toggle:hover {
            color: var(--tmu-text-strong);
        }
    `;

    document.head.appendChild(style);
}

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

function normalizeFoundedText(text) {
    return cleanText(text).replace(/^Founded\s+Founded/i, 'Founded').replace(/^Founded(\d)/i, 'Founded $1');
}

function parsePlayers(table) {
    if (!table) return [];

    return Array.from(table.querySelectorAll('tr')).map(row => {
        const cells = row.querySelectorAll('td');
        const playerLink = row.querySelector('a[player_link], a[href*="/players/"]');
        if (!playerLink || cells.length < 4) return null;
        return {
            name: cleanText(playerLink.textContent),
            href: playerLink.getAttribute('href') || '#',
            firstCellHtml: cells[0].innerHTML,
            starsHtml: cells[1].innerHTML,
            rating: cleanText(cells[2].textContent),
            goals: cleanText(cells[3].textContent),
        };
    }).filter(Boolean);
}

function extractInfoBlock(overviewBox) {
    const infoRoot = overviewBox?.querySelector('#club_info');
    if (!infoRoot) return { changeHref: '', bodyHtml: '' };
    const changeLink = infoRoot.querySelector('#change_club_info_link');
    const body = infoRoot.querySelector('div:last-child');
    return {
        changeHref: changeLink?.getAttribute('href') || '',
        bodyHtml: body?.innerHTML || '',
    };
}

function parseTrophies(box) {
    const std = box?.querySelector('.box_body > .std, .box_body .std');
    if (!std) return { visible: [], hidden: [] };

    const visible = [];
    const hidden = [];
    let inHidden = false;

    Array.from(std.children).forEach(node => {
        if (node.classList?.contains('expandable')) {
            inHidden = true;
            Array.from(node.querySelectorAll(':scope > .clearfix')).forEach(row => hidden.push(row));
            return;
        }
        if (!node.classList?.contains('clearfix')) return;
        if (inHidden) hidden.push(node);
        else visible.push(node);
    });

    const mapRow = row => {
        const icon = row.children[0];
        const content = row.children[1];
        const season = cleanText(content?.querySelector('.subtle')?.textContent || '');
        const title = season ? cleanText(content?.textContent.replace(season, '') || '') : cleanText(content?.textContent || '');
        return {
            small: row.classList.contains('small'),
            iconStyle: icon?.getAttribute('style') || '',
            title,
            season,
        };
    };

    return {
        visible: visible.map(mapRow),
        hidden: hidden.map(mapRow),
    };
}

function parseOverview(mainColumn, secondaryColumn) {
    const boxes = Array.from(mainColumn.querySelectorAll(':scope > .box'));
    const overviewBox = boxes.find(box => !box.querySelector('#feed')) || boxes[0] || null;
    const feedRoot = mainColumn.querySelector('#feed') || null;
    const trophyBox = Array.from(secondaryColumn?.querySelectorAll('.box') || []).find(box => box.querySelector('.clearfix[tooltip], .expandable .clearfix')) || null;
    const clubNameLink = overviewBox?.querySelector('.box_sub_header .large a[club_link]');
    const topMeta = overviewBox?.querySelector('.box_sub_header');
    const competitionLine = topMeta?.querySelectorAll(':scope > div')[1] || null;
    const logoImg = overviewBox?.querySelector('.big_wings img.club_logo');
    const founded = normalizeFoundedText(overviewBox?.querySelector('.align_center > strong')?.textContent || '');
    const changeClubHref = overviewBox?.querySelector('.box_sub_header a.float_right')?.getAttribute('href') || '';
    const players = parsePlayers(overviewBox?.querySelector('table.zebra'));
    const infoBlock = extractInfoBlock(overviewBox);
    const trophies = parseTrophies(trophyBox);

    return {
        clubHref: clubNameLink?.getAttribute('href') || '#',
        clubName: cleanText(clubNameLink?.textContent || 'Club'),
        statusHtml: topMeta?.querySelector('.large')?.innerHTML || '',
        competitionHtml: competitionLine?.innerHTML || '',
        changeClubHref,
        founded,
        logoSrc: logoImg?.getAttribute('src') || '',
        logoAlt: logoImg?.getAttribute('alt') || 'club logo',
        players,
        infoChangeHref: infoBlock.changeHref,
        infoHtml: infoBlock.bodyHtml,
        trophies,
        feedRoot,
    };
}

function buildPlayersTableHtml(players) {
    if (!players.length) return '';

    const table = TmTable.table({
        cls: ' tmco-players-table',
        items: players,
        headers: [],
        renderRowsHtml: (rows) => rows.map(player => `
            <tr>
                <td>${player.firstCellHtml}</td>
                <td>${player.starsHtml}</td>
                <td class="align_center">${escapeHtml(player.rating)}</td>
                <td class="align_center">${escapeHtml(player.goals)}</td>
            </tr>
        `).join(''),
    });

    return `
        <div class="tmco-players-table-wrap">
            ${table.outerHTML}
        </div>
    `;
}

function buildTrophyRows(items) {
    return items.map(item => `
        <div class="tmco-trophy${item.small ? ' small' : ''}">
            <div class="tmco-trophy-icon" style="${item.iconStyle}"></div>
            <div>
                <div class="tmco-trophy-title">${escapeHtml(item.title)}</div>
                ${item.season ? `<div class="tmco-trophy-sub">${escapeHtml(item.season)}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function mountClubBox(container, data) {
    const section = document.createElement('section');
    section.className = 'tmco-box';
    section.innerHTML = `
        <div class="tmco-box-body">
            <div class="tmco-club-top">
                ${data.changeClubHref ? `<a class="tmco-club-action" href="${data.changeClubHref}">Change</a>` : ''}
                <div class="tmco-club-name">
                    <img class="tmco-wing" src="/pics/club_wing_left.gif" alt="">
                    <a href="${data.clubHref}">${escapeHtml(data.clubName)}</a>
                    ${data.statusHtml.replace(/^[\s\S]*?<a[^>]*club_link[^>]*>.*?<\/a>/i, '').replace(/<img src="\/pics\/club_wing_right\.gif">/i, '')}
                    <img class="tmco-wing" src="/pics/club_wing_right.gif" alt="">
                </div>
                <div class="tmco-club-meta">${data.competitionHtml}</div>
            </div>
            <div class="tmco-logo-stage">
                <div class="tmco-logo-shell">
                    <div class="tmco-logo-card">
                        ${data.logoSrc ? `<img src="${data.logoSrc}" alt="${escapeHtml(data.logoAlt)}">` : ''}
                    </div>
                </div>
            </div>
            ${data.founded ? `<div class="tmco-founded"><span>${escapeHtml(data.founded)}</span></div>` : ''}
            ${buildPlayersTableHtml(data.players)}
            <div class="tmco-info-block">
                ${data.infoChangeHref ? `<a class="tmco-info-link" href="${data.infoChangeHref}">Change info</a>` : ''}
                <div class="tmco-info-body">${data.infoHtml}</div>
            </div>
        </div>
    `;
    container.appendChild(section);
}

function mountTrophiesBox(container, data) {
    const section = document.createElement('section');
    section.className = 'tmco-box';
    section.innerHTML = `
        <div class="tmco-box-head">
            <div class="tmco-box-title">Trophies</div>
        </div>
        <div class="tmco-box-body">
            <div class="tmco-trophies">
                ${buildTrophyRows(data.visible)}
                ${data.hidden.length ? `<div class="tmco-expand" hidden>${buildTrophyRows(data.hidden)}</div><div class="tmco-expand-toggle">↓ ↓ ↓</div>` : ''}
            </div>
        </div>
    `;

    section.onclick = (event) => {
        const toggle = event.target.closest('.tmco-expand-toggle');
        const hidden = section.querySelector('.tmco-expand');
        if (!toggle || !hidden || !section.contains(toggle)) return;

        const isHidden = hidden.hasAttribute('hidden');
        if (isHidden) {
            hidden.removeAttribute('hidden');
            toggle.textContent = '↑ ↑ ↑';
            return;
        }

        hidden.setAttribute('hidden', 'hidden');
        toggle.textContent = '↓ ↓ ↓';
    };

    container.appendChild(section);
}

export const TmClubOverview = {
    mount({ mainColumn, secondaryColumn }) {
        if (!mainColumn) return;
        injectStyles();
        TmNativeFeed.injectStyles();

        const data = parseOverview(mainColumn, secondaryColumn);

        mainColumn.classList.add('tmco-main');
        mainColumn.innerHTML = '';
        mountClubBox(mainColumn, data);

        if (data.feedRoot) {
            const feedHost = document.createElement('div');
            mainColumn.appendChild(feedHost);
            TmNativeFeed.mountStandaloneFeed(feedHost, data.feedRoot, { title: 'Feed' });
        }

        if (secondaryColumn) {
            secondaryColumn.classList.add('tmco-side');
            secondaryColumn.innerHTML = '';
            mountTrophiesBox(secondaryColumn, data.trophies);
        }
    },
};
