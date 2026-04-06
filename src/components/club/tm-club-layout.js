import { TmClubSideMenu } from './tm-club-side-menu.js';
import { TmUtils } from '../../lib/tm-utils.js';

const ICONS = {
    Overview: '🏠',
    Squad: '⚽️',
    Fixtures: '📅',
    Statistics: '📊',
    History: '📜',
    Stadium: '🏟',
    Table: '🏆',
};

const CLUB_ROUTE_RE = /^\/club\/(?:\d+\/(?:squad\/)?|)$/;
const CLUB_FIXTURES_RE = /^\/fixtures\/club\/\d+\/$/;
const CLUB_STATS_RE = /^\/statistics\/club\/\d+\/$/;
const CLUB_HISTORY_RE = /^\/history\/club\/records\/\d+\/$/;
const CLUB_STADIUM_RE = /^\/stadium\/\d+\/$/;

function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

export function normalizeClubHref(href) {
    try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return '';
        return url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
    } catch {
        return '';
    }
}

export function isClubWorkspaceRoute(pathname = window.location.pathname) {
    return CLUB_ROUTE_RE.test(pathname)
        || CLUB_FIXTURES_RE.test(pathname)
        || CLUB_STATS_RE.test(pathname)
        || CLUB_HISTORY_RE.test(pathname)
        || CLUB_STADIUM_RE.test(pathname);
}

function mapLabel(label) {
    if (label === 'Club') return 'Overview';
    if (label === 'Squad Overview') return 'Squad';
    return label;
}

function hasMeaningfulSecondaryContent(column) {
    if (!column) return false;

    const content = Array.from(column.childNodes).filter(node => {
        if (node.nodeType === Node.TEXT_NODE) return String(node.textContent || '').trim().length > 0;
        if (node.nodeType !== Node.ELEMENT_NODE) return false;

        const element = node;
        if (element.matches('.box') && !element.textContent.trim() && element.children.length === 0) return false;

        return !element.matches('.box:empty, .box_shadow:empty, script, style');
    });

    if (!content.length) return false;

    return content.some(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return true;

        const element = node;
        if (!element.matches('.box')) return true;

        const meaningfulDescendant = element.querySelector(
            'h1, h2, h3, h4, table, form, img, a, button, input, select, textarea, iframe, .content_menu, .box_body > *'
        );

        return Boolean(meaningfulDescendant) || element.textContent.trim().length > 0;
    });
}

export function collectClubMenuItems() {
    const menu = document.querySelector('.column1 .content_menu, .column1_a .content_menu');
    if (!menu) return [];

    const items = [];
    Array.from(menu.children).forEach(node => {
        if (node.tagName === 'HR') {
            items.push({ type: 'separator' });
            return;
        }
        if (node.tagName !== 'A') return;

        const href = normalizeClubHref(node.getAttribute('href') || '');
        const label = mapLabel(cleanText(node.textContent));
        if (!href || !label) return;
        items.push({ type: 'link', href, label, icon: ICONS[label] || '📋' });
    });

    return items.filter((item, index, list) => {
        if (item.type !== 'separator') return true;
        if (index === 0 || index === list.length - 1) return false;
        return list[index - 1]?.type !== 'separator';
    });
}

export function resolveClubCurrentPath(currentPath = normalizeClubHref(window.location.pathname)) {
    if (currentPath !== '/club/') return currentPath;

    const selected = document.querySelector('.column1 .content_menu a.selected, .column1_a .content_menu a.selected');
    return normalizeClubHref(selected?.getAttribute('href') || '') || currentPath;
}

export function initClubLayout({ main: _main, currentPath = normalizeClubHref(window.location.pathname), singleColumn = false } = {}) {
    currentPath = resolveClubCurrentPath(currentPath);

    const main = _main || TmUtils.getMainContainer();
    const items = collectClubMenuItems();
    const existingNav = main?.querySelector('#tmvu-club-nav');
    if (!main || (!items.length && !existingNav)) return null;

    main.classList.add('tmvu-club-layout');
    main.classList.toggle('tmvu-club-single', Boolean(singleColumn));

    // Create fresh content containers inside .tmvu-main — never touch native columns
    let mainColumn = main.querySelector('.tmvu-club-main');
    if (!mainColumn) {
        mainColumn = document.createElement('div');
        mainColumn.className = 'tmvu-club-main';
        main.appendChild(mainColumn);
    }

    let secondaryColumn = main.querySelector('.tmvu-club-secondary');
    if (!secondaryColumn && !singleColumn) {
        const nativeSecondary = document.querySelector('.column3_a, .column3');
        if (nativeSecondary && hasMeaningfulSecondaryContent(nativeSecondary)) {
            secondaryColumn = document.createElement('div');
            secondaryColumn.className = 'tmvu-club-secondary';
            main.appendChild(secondaryColumn);
        }
    }

    if (items.length) {
        TmClubSideMenu.mount(main, { items, currentHref: currentPath });
    }

    return { main, mainColumn, secondaryColumn };
}