import { TmSideMenu } from '../shared/tm-side-menu.js';

const ICONS = {
    'Current Bids': '💸',
    Finances: '🏦',
    'Transfer History': '📜',
};

function normalizeItems(items, currentHref) {
    const normalized = Array.isArray(items) ? items.map(item => ({
        ...item,
        icon: item.icon || ICONS[item.label] || '📋',
    })) : [];

    if (!normalized.some(item => item.href === currentHref)) {
        normalized.unshift({ href: currentHref, label: 'Current Bids', icon: ICONS['Current Bids'] });
    }

    return normalized;
}

function mount(mainContainer, { items = [], currentHref = window.location.pathname, id = 'tmvu-bids-nav' } = {}) {
    const normalizedItems = normalizeItems(items, currentHref);
    return TmSideMenu.mount(mainContainer, {
        id,
        className: 'tmvu-bids-nav-shell',
        items: normalizedItems,
        currentHref,
    });
}

export const TmBidsSideMenu = { mount };