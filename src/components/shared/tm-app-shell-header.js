import { TmButton } from './tm-button.js';

const TOP_MENU_LABELS = {
    '0': 'Home',
    '1': 'Tactics',
    '2': 'Quick Match',
    '3': 'League',
    '4': 'Transfer',
    '5': 'Forum',
    '6': 'Buy Pro',
};

const ICON_BY_GROUP = {
    '0': '🏠',
    '1': '🎯',
    '2': '⚡',
    '3': '🏆',
    '4': '💸',
    '5': '💬',
    '6': '👑',
};

const DEFAULT_GROUPS = [
    {
        id: '0',
        href: '/home/',
        label: 'Home',
        icon: '🏠',
        children: [
            { href: '/home/', label: 'Home' },
            { href: '/club/', label: 'Club' },
            { href: '/finances/', label: 'Finances' },
            { href: '/stadium/', label: 'Stadium' },
            { href: '/account/', label: 'Account' },
        ],
    },
    {
        id: '1',
        href: '/tactics/',
        label: 'Tactics',
        icon: '🎯',
        children: [
            { href: '/tactics/', label: 'Tactics' },
            { href: '/players/', label: 'Players' },
            { href: '/youth-development/', label: 'Youth Development' },
            { href: '/training/', label: 'Training' },
        ],
    },
    {
        id: '2',
        href: '/quickmatch/',
        label: 'Quick Match',
        icon: '⚡',
        children: [
            { href: '/quickmatch/', label: 'Quick Match' },
            { href: '/friendly-league/', label: 'Friendly League' },
        ],
    },
    {
        id: '3',
        href: '/league/',
        label: 'League',
        icon: '🏆',
        children: [
            { href: '/league/', label: 'League' },
            { href: '/cup/', label: 'Cup' },
            { href: '/international-cup/', label: 'International Cup' },
            { href: '/national-teams/', label: 'National Teams' },
        ],
    },
    {
        id: '4',
        href: '/transfer/',
        label: 'Transfer',
        icon: '💸',
        children: [
            { href: '/transfer/', label: 'Transfer' },
            { href: '/shortlist/', label: 'Shortlist' },
            { href: '/bids/', label: 'Bids' },
            { href: '/scouts/', label: 'Scouts' },
        ],
    },
    {
        id: '5',
        href: '/forum/',
        label: 'Forum',
        icon: '💬',
        children: [
            { href: '/forum/', label: 'Forum' },
            { href: '/user-guide/', label: 'User Guide' },
            { href: '/about-tm/', label: 'About TM' },
            { href: '/teamsters/', label: 'Teamsters' },
        ],
    },
    {
        id: '6',
        href: '/buy-pro/',
        label: 'Buy Pro',
        icon: '👑',
        children: [
            { href: '/buy-pro/', label: 'Buy Pro' },
            { href: '/about-pro/', label: 'About Pro' },
            { href: '/donations/', label: 'Donations' },
            { href: '/support-pro/', label: 'Support' },
        ],
    },
];

const htmlOf = (node) => node ? node.outerHTML : '';

const buttonHtml = (opts) => htmlOf(TmButton.button(opts));

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function getHeaderGroupMeta(id, fallbackLabel) {
    return {
        label: TOP_MENU_LABELS[id] || fallbackLabel,
        icon: ICON_BY_GROUP[id] || '•',
    };
}

export function getDefaultHeaderGroups() {
    return DEFAULT_GROUPS.map(group => ({
        ...group,
        children: group.children.map(child => ({ ...child })),
    }));
}

function findActiveChild(group, currentPath) {
    return group.children.find(child => child.href === currentPath) || group.children[0] || null;
}

export const TmAppShellHeader = {
    render({ clubName, logo, proDays, cash, pmCount = 0, groups, currentPath, openGroupId, headerFab = null }) {
        return `
            <header id="tmvu-header">
                <div class="tmvu-header-shell">
                    ${headerFab ? this.renderHeaderFab(headerFab) : ''}
                    <div class="tmvu-header-top">
                        <div class="tmvu-brand">
                            ${logo
                ? `<img class="tmvu-brand-logo" src="${logo}" alt="${clubName}">`
                : '<div class="tmvu-brand-mark">TM</div>'}
                            <div class="tmvu-brand-copy">
                                <strong title="${clubName}">${clubName}</strong>
                            </div>
                        </div>
                        <div class="tmvu-header-meta">
                            <div class="tmvu-brand-metrics">
                                <div class="tmvu-metric">
                                    <span class="tmvu-metric-icon tmvu-metric-icon-pro"></span>
                                    <span class="tmvu-metric-label">Pro</span>
                                    <strong class="tmvu-metric-value">${proDays}d</strong>
                                </div>
                                <div class="tmvu-metric">
                                    <span class="tmvu-metric-icon tmvu-metric-icon-cash"></span>
                                    <span class="tmvu-metric-label">Cash</span>
                                    <strong class="tmvu-metric-value">$${cash}</strong>
                                </div>
                                ${this.renderPmMenu(pmCount)}
                            </div>
                        </div>
                    </div>
                    <div class="tmvu-nav-wrap">
                        <nav class="tmvu-nav-primary" aria-label="Primary navigation">
                            ${groups.map(group => this.renderPrimaryGroup(group, currentPath, openGroupId)).join('')}
                        </nav>
                        <div class="tmvu-nav-secondary${openGroupId ? ' has-open' : ''}" aria-label="Secondary navigation">
                            ${groups.map(group => this.renderSecondaryGroup(group, currentPath, openGroupId)).join('')}
                        </div>
                    </div>
                </div>
            </header>
        `;
    },

    renderPmMenu(pmCount) {
        const count = Number.isFinite(Number(pmCount)) ? Math.max(0, Number(pmCount)) : 0;

        return `
            <div class="tmvu-pm-wrap" data-pm-root>
                <button
                    class="tmvu-metric tmvu-metric-button"
                    type="button"
                    data-pm-trigger
                    aria-haspopup="true"
                    aria-expanded="false"
                    aria-controls="tmvu-pm-menu"
                >
                    <span class="tmvu-metric-icon tmvu-metric-icon-mail"></span>
                    <span class="tmvu-metric-label">PM</span>
                    <strong class="tmvu-metric-value" data-pm-count>${count}</strong>
                </button>
                <div class="tmvu-pm-menu" id="tmvu-pm-menu" data-pm-menu hidden>
                    <div class="tmvu-pm-menu-head">
                        <div>
                            <strong>Private Messages</strong>
                            <span data-pm-summary>${count} new</span>
                        </div>
                        ${buttonHtml({
                            label: 'New Message',
                            color: 'secondary',
                            size: 'xs',
                            cls: 'tmvu-pm-compose',
                            attrs: {
                                'data-pm-compose': '1',
                            },
                        })}
                    </div>
                    <div class="tmvu-pm-list" data-pm-list>
                        ${this.renderPmPlaceholder('Open PM to load the latest conversations.')}
                    </div>
                    <div class="tmvu-pm-menu-foot">
                        ${buttonHtml({
                            label: 'View All Messages',
                            color: 'secondary',
                            size: 'xs',
                            cls: 'tmvu-pm-view-all',
                            attrs: {
                                'data-pm-view-all': '1',
                            },
                        })}
                    </div>
                </div>
            </div>
        `;
    },

    renderPmPlaceholder(copy) {
        return `<div class="tmvu-pm-placeholder">${escapeHtml(copy)}</div>`;
    },

    renderPmItems(items = []) {
        if (!Array.isArray(items) || !items.length) {
            return this.renderPmPlaceholder('No recent conversations found.');
        }

        return items.map(item => {
            const sender = escapeHtml(item.senderName || 'Unknown sender');
            const subject = escapeHtml(item.subject || '(No subject)');
            const time = escapeHtml(item.time || '');
            const longTime = escapeHtml(item.longTime || item.time || '');
            const unreadClass = item.unread ? ' is-unread' : '';
            const id = escapeHtml(item.id || '');
            const conversationId = escapeHtml(item.conversationId || '0');

            return `
                <button
                    class="tmvu-pm-item${unreadClass}"
                    type="button"
                    data-pm-item
                    data-pm-id="${id}"
                    data-pm-conversation-id="${conversationId}"
                >
                    <div class="tmvu-pm-item-head">
                        <strong class="tmvu-pm-item-sender">${sender}</strong>
                        <span class="tmvu-pm-item-time" title="${longTime}">${time}</span>
                    </div>
                    <div class="tmvu-pm-item-subject" title="${subject}">${subject}</div>
                </button>
            `;
        }).join('');
    },

    renderHeaderFab(fab) {
        return `
            <a class="tmvu-header-fab${fab.isActive ? ' is-active' : ''}" href="${fab.href || '#'}">
                <span class="tmvu-icon" aria-hidden="true">${fab.icon || '•'}</span>
                <span class="tmvu-header-fab-label">${fab.label}</span>
            </a>
        `;
    },

    renderPrimaryGroup(group, currentPath, openGroupId) {
        const isOpen = openGroupId === group.id;
        const isCurrent = group.children.some(child => child.href === currentPath);

        return `
            <section class="tmvu-menu-group${isOpen ? ' is-open' : ''}${isCurrent ? ' is-current' : ''}" data-group-id="${group.id}">
                ${buttonHtml({
            slot: `<span class="tmvu-icon" aria-hidden="true">${group.icon || '•'}</span><span class="tmvu-group-label">${group.label}</span>`,
            color: 'secondary',
            size: 'sm',
            cls: 'tmvu-menu-trigger',
            attrs: {
                'data-group-trigger': group.id,
                'data-group-href': group.href || '',
                'aria-expanded': isOpen ? 'true' : 'false',
            },
        })}
            </section>
        `;
    },

    renderSecondaryGroup(group, currentPath, openGroupId) {
        const isOpen = openGroupId === group.id;

        return `
            <div class="tmvu-secondary-group${isOpen ? ' is-open' : ''}" data-group-id="${group.id}">
                ${group.children.map(child => `
                    <a class="tmvu-subitem${child.href === currentPath ? ' is-active' : ''}" href="${child.href}">
                        <span class="tmvu-subitem-dot"></span>
                        <span class="tmvu-subitem-label">${child.label}</span>
                    </a>
                `).join('')}
            </div>
        `;
    },
};