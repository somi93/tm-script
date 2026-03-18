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
    render({ clubName, logo, proDays, cash, groups, currentPath, openGroupId }) {
        return `
            <header id="tmvu-header">
                <div class="tmvu-header-shell">
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

    renderPrimaryGroup(group, currentPath, openGroupId) {
        const isOpen = openGroupId === group.id;
        const isCurrent = group.children.some(child => child.href === currentPath);

        return `
            <section class="tmvu-menu-group${isOpen ? ' is-open' : ''}${isCurrent ? ' is-current' : ''}" data-group-id="${group.id}">
                <button class="tmvu-menu-trigger" type="button" data-group-trigger="${group.id}" data-group-href="${group.href || ''}" aria-expanded="${isOpen ? 'true' : 'false'}">
                    <span class="tmvu-icon" aria-hidden="true">${group.icon || '•'}</span>
                    <span class="tmvu-group-label">${group.label}</span>
                </button>
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