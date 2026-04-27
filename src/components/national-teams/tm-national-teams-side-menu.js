import { TmSideMenu } from '../shared/tm-side-menu.js';
import { TmNationalTeamsNtSave } from './tm-national-teams-nt-save.js';

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const normalizePath = (value) => {
    const text = String(value || '').trim();
    if (!text) return '';
    return text.endsWith('/') ? text : `${text}/`;
};

const getIcon = (label, href) => {
    if (/\/national-teams\/[a-z]{2,3}\/?$/i.test(href)) return '🌍';
    if (/players/i.test(label)) return '👥';
    if (/tournaments/i.test(label)) return '🏆';
    if (/rankings/i.test(label)) return '📈';
    if (/fixtures/i.test(label)) return '📅';
    if (/statistics/i.test(label)) return '📊';
    if (/history/i.test(label)) return '📜';
    if (/election/i.test(label)) return '🗳';
    return '🌍';
};

export const buildNationalTeamsMenu = (root, currentPath = window.location.pathname) => {
    const normalizedCurrentPath = normalizePath(currentPath);
    const items = Array.from(root.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
        if (node.tagName === 'HR') return [{ type: 'separator' }];
        if (node.tagName !== 'A') return [];

        const href = node.getAttribute('href') || '#';
        const label = cleanText(node.textContent);
        if (!label) return [];

        return [{
            type: 'link',
            href,
            label,
            icon: getIcon(label, href),
            isSelected: node.classList.contains('selected') || normalizePath(href) === normalizedCurrentPath,
        }];
    });

    const linkItems = items.filter(item => item.type === 'link');
    const selectedHref = linkItems.find(item => item.isSelected)?.href || '';
    const matchingItem = linkItems
        .filter(item => {
            const normalizedHref = normalizePath(item.href);
            return normalizedHref && normalizedCurrentPath.startsWith(normalizedHref);
        })
        .sort((left, right) => normalizePath(right.href).length - normalizePath(left.href).length)[0] || null;
    const exactItem = linkItems.find(item => normalizePath(item.href) === normalizedCurrentPath) || null;
    const activeHref = exactItem?.href || matchingItem?.href || selectedHref || normalizedCurrentPath;
    return { items, activeHref };
};

const hasElectionItem = (items = []) => items.some(item => item?.type === 'link' && /election/i.test(item.label || ''));

const getCanonicalNationalTeamsPath = (countryCode) => {
    const code = cleanText(countryCode).toLowerCase();
    return code ? `/national-teams/${code}/` : '';
};

const areMenusEquivalent = (leftItems = [], rightItems = []) => {
    const leftLinks = leftItems.filter(item => item.type === 'link').map(item => `${item.href}|${item.label}`);
    const rightLinks = rightItems.filter(item => item.type === 'link').map(item => `${item.href}|${item.label}`);
    return leftLinks.length === rightLinks.length && leftLinks.every((item, index) => item === rightLinks[index]);
};

const remountSideMenu = (main, navEl, { id, className, items, activeHref, includeSave, countryCode, currentSeason }) => {
    if (navEl?.parentNode === main) navEl.remove();

    const nextNavEl = TmSideMenu.mount(main, {
        id,
        className,
        items,
        currentHref: activeHref,
    });

    if (includeSave && nextNavEl && countryCode) {
        TmNationalTeamsNtSave.mount({
            navEl: nextNavEl,
            countryCode,
            currentSeason,
        });
    }

    return nextNavEl;
};

const syncMenuFromCanonicalPage = async (main, navEl, options, currentItems) => {
    const canonicalPath = getCanonicalNationalTeamsPath(options.countryCode);
    if (!canonicalPath || normalizePath(options.currentPath) === normalizePath(canonicalPath)) return navEl;

    try {
        const response = await window.fetch(canonicalPath, { credentials: 'same-origin' });
        if (!response.ok) return navEl;

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const { items, activeHref } = buildNationalTeamsMenu(doc, options.currentPath);
        if (!items.length || areMenusEquivalent(currentItems, items)) return navEl;

        return remountSideMenu(main, navEl, {
            ...options,
            items,
            activeHref,
        });
    } catch {
        return navEl;
    }
};

export const mountNationalTeamsSideMenu = (main, {
    root,
    id,
    className = 'tmu-page-sidebar-stack',
    currentPath = window.location.pathname,
    countryCode = '',
    currentSeason = null,
    includeSave = true,
} = {}) => {
    const { items, activeHref } = buildNationalTeamsMenu(root, currentPath);
    let navEl = TmSideMenu.mount(main, {
        id,
        className,
        items,
        currentHref: activeHref,
    });

    if (includeSave && navEl && countryCode) {
        TmNationalTeamsNtSave.mount({
            navEl,
            countryCode,
            currentSeason,
        });
    }

    if (main && root && countryCode && !hasElectionItem(items)) {
        syncMenuFromCanonicalPage(main, navEl, {
            id,
            className,
            currentPath,
            countryCode,
            currentSeason,
            includeSave,
        }, items).then(nextNavEl => {
            navEl = nextNavEl || navEl;
        });
    }

    return { navEl, items, activeHref };
};