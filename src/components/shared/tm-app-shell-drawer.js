const TOP_MENU_LABELS = {
    '0': 'Home',
    '1': 'Tactics',
    '2': 'Quick Match',
    '3': 'League',
    '4': 'Transfer',
    '5': 'Forum',
    '6': 'Buy Pro',
};

const ICON_CLASS_BY_GROUP = {
    '0': 'tmvu-icon-home',
    '1': 'tmvu-icon-tactics',
    '2': 'tmvu-icon-quick',
    '3': 'tmvu-icon-league',
    '4': 'tmvu-icon-transfer',
    '5': 'tmvu-icon-forum',
    '6': 'tmvu-icon-pro',
};

const DEFAULT_GROUPS = [
    {
        id: '0',
        href: '/home/',
        label: 'Home',
        iconClass: 'tmvu-icon-home',
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
        iconClass: 'tmvu-icon-tactics',
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
        iconClass: 'tmvu-icon-quick',
        children: [
            { href: '/quickmatch/', label: 'Quick Match' },
            { href: '/friendly-league/', label: 'Friendly League' },
        ],
    },
    {
        id: '3',
        href: '/league/',
        label: 'League',
        iconClass: 'tmvu-icon-league',
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
        iconClass: 'tmvu-icon-transfer',
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
        iconClass: 'tmvu-icon-forum',
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
        iconClass: 'tmvu-icon-pro',
        children: [
            { href: '/buy-pro/', label: 'Buy Pro' },
            { href: '/about-pro/', label: 'About Pro' },
            { href: '/donations/', label: 'Donations' },
            { href: '/support-pro/', label: 'Support' },
        ],
    },
];

export function getDrawerGroupMeta(id, fallbackLabel) {
    return {
        label: TOP_MENU_LABELS[id] || fallbackLabel,
        iconClass: ICON_CLASS_BY_GROUP[id] || 'tmvu-icon-generic',
    };
}

export function getDefaultDrawerGroups() {
    return DEFAULT_GROUPS.map(group => ({
        ...group,
        children: group.children.map(child => ({ ...child })),
    }));
}

export const TmAppShellDrawer = {
    render({ clubName, logo, proDays, cash, groups, currentPath, openGroupId }) {
        return `
            <aside id="tmvu-drawer">
                <div class="tmvu-brand">
                    ${logo
                        ? `<img class="tmvu-brand-logo" src="${logo}" alt="${clubName}">`
                        : '<div class="tmvu-brand-mark">TM</div>'}
                    <div class="tmvu-brand-copy">
                        <strong title="${clubName}">${clubName}</strong>
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
                <nav class="tmvu-nav">
                    ${groups.map(group => this.renderGroup(group, currentPath, openGroupId)).join('')}
                </nav>
            </aside>
        `;
    },

    renderGroup(group, currentPath, openGroupId) {
        const isOpen = openGroupId === group.id;
        const isCurrent = group.children.some(child => child.href === currentPath);

        return `
            <section class="tmvu-group${isOpen ? ' is-open' : ''}${isCurrent ? ' is-current' : ''}" data-group-id="${group.id}">
                <div class="tmvu-group-header">
                    <button class="tmvu-group-trigger" type="button" data-group-trigger="${group.id}" aria-expanded="${isOpen ? 'true' : 'false'}">
                        <span class="tmvu-icon ${group.iconClass}"></span>
                        <span class="tmvu-group-label">${group.label}</span>
                        <span class="tmvu-group-caret"></span>
                    </button>
                </div>
                <div class="tmvu-group-panel">
                    <div class="tmvu-group-panel-inner">
                        ${group.children.map(child => `
                            <a class="tmvu-subitem${child.href === currentPath ? ' is-active' : ''}" href="${child.href}">
                                <span class="tmvu-subitem-dot"></span>
                                <span class="tmvu-subitem-label">${child.label}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    },
};
