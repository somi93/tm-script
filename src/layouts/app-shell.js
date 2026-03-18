import { TmAppShellDrawer } from '../components/shared/tm-app-shell-drawer.js';

const GROUP_STORAGE_KEY = 'tmvu-shell-group';
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

function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeHref(href) {
    try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return '';
        if (!url.pathname || url.pathname === '/') return '/home/';
        return url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
    } catch {
        return '';
    }
}

function dedupeChildren(children) {
    const seen = new Set();
    return children.filter(child => {
        if (!child.href || !child.label || seen.has(child.href)) return false;
        seen.add(child.href);
        return true;
    });
}

function isUsefulLink(anchor) {
    const href = normalizeHref(anchor.getAttribute('href') || '');
    const label = cleanText(anchor.textContent);
    if (!href || !label) return false;
    if (href.includes('/logout')) return false;
    return true;
}

function collectNavGroups() {
    const groups = [];

    document.querySelectorAll('#top_menu > ul > li > a[top_menu]').forEach(anchor => {
        const id = anchor.getAttribute('top_menu') || '';
        const href = normalizeHref(anchor.getAttribute('href') || '');
        if (!href) return;
        groups.push({
            id,
            href,
            label: TOP_MENU_LABELS[id] || cleanText(anchor.getAttribute('title')) || href,
            iconClass: ICON_CLASS_BY_GROUP[id] || 'tmvu-icon-generic',
            children: [],
        });
    });

    Array.from(document.querySelectorAll('#mega_menu_items > div')).forEach((column, index) => {
        const group = groups[index];
        if (!group) return;
        column.querySelectorAll('a').forEach(anchor => {
            if (!isUsefulLink(anchor)) return;
            group.children.push({
                href: normalizeHref(anchor.getAttribute('href') || ''),
                label: cleanText(anchor.textContent),
            });
        });
        group.children = dedupeChildren(group.children);
    });

    if (groups.length < 4) {
        return DEFAULT_GROUPS.map(group => ({
            ...group,
            children: group.children.map(child => ({ ...child })),
        }));
    }

    return groups.map(group => ({
        ...group,
        children: dedupeChildren(group.children),
    }));
}

function groupHasActiveChild(group, currentPath) {
    return group.children.some(child => child.href === currentPath);
}

function getInitialOpenGroup(groups, currentPath) {
    const stored = window.localStorage.getItem(GROUP_STORAGE_KEY);
    if (stored && groups.some(group => group.id === stored)) return stored;
    const active = groups.find(group => groupHasActiveChild(group, currentPath));
    return active?.id || groups[0]?.id || '';
}

function getClubInfo() {
    const session = window.SESSION || {};
    const clubId = String(session.main_id || session.club_id || '').trim();
    const clubName = cleanText(
        session.main_name ||
        session.clubname ||
        session.club_name ||
        document.querySelector('a[href*="/club/"]')?.textContent ||
        'TrophyManager'
    );

    return {
        clubId,
        clubName,
        logo: clubId ? `/pics/club_logos/${clubId}_140.png` : '',
        proDays: String(session.pro_days ?? '').trim(),
        cash: Number(session.cash || 0),
    };
}

function formatCash(value) {
    const amount = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat('en-US').format(amount);
}

function removeNativeMenus() {
    document.getElementById('top_menu')?.remove();
    document.getElementById('top_menu_sub')?.remove();
}

function injectStyles() {
    if (document.getElementById('tmvu-shell-styles')) return;

    const style = document.createElement('style');
    style.id = 'tmvu-shell-styles';
    style.textContent = `
        :root {
            --tmvu-drawer-width: 280px;
            --tmvu-surface: #1d2420;
            --tmvu-surface-2: #232c27;
            --tmvu-surface-3: #2a342e;
            --tmvu-border: rgba(255, 255, 255, 0.08);
            --tmvu-text: #e7eee6;
            --tmvu-text-soft: rgba(231, 238, 230, 0.56);
            --tmvu-text-inverse: #edf2eb;
            --tmvu-accent: #9dbc71;
            --tmvu-accent-soft: rgba(157, 188, 113, 0.16);
            --tmvu-font: "IBM Plex Sans", "Segoe UI", sans-serif;
        }

        body.tmvu-shell-active {
            padding-left: var(--tmvu-drawer-width) !important;
        }

        #tmvu-drawer {
            box-sizing: border-box;
            font-family: var(--tmvu-font);
        }

        #tmvu-drawer {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: var(--tmvu-drawer-width);
            display: flex;
            flex-direction: column;
            background: linear-gradient(180deg, var(--tmvu-surface), var(--tmvu-surface-2));
            color: var(--tmvu-text-inverse);
            border-right: 1px solid rgba(0, 0, 0, 0.24);
            z-index: 9999;
        }

        .tmvu-brand {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            min-height: 72px;
            padding: 14px 16px 12px;
            border-bottom: 1px solid var(--tmvu-border);
        }

        .tmvu-brand-logo,
        .tmvu-brand-mark {
            width: 36px;
            height: 36px;
            flex: 0 0 auto;
            display: grid;
            place-items: center;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.04);
        }

        .tmvu-brand-logo {
            object-fit: cover;
        }

        .tmvu-brand-mark {
            color: var(--tmvu-accent);
            background: var(--tmvu-surface-3);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
        }

        .tmvu-brand-copy {
            flex: 1 1 auto;
            min-width: 0;
        }

        .tmvu-brand-copy strong {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: var(--tmvu-text-inverse);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .tmvu-brand-metrics {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 8px;
        }

        .tmvu-nav {
            flex: 1 1 auto;
            padding: 8px 0 12px;
            overflow-y: auto;
            overflow-x: hidden;
        }

        .tmvu-metric-icon {
            width: 12px;
            height: 12px;
            position: relative;
            flex: 0 0 auto;
            color: rgba(231, 238, 230, 0.7);
        }

        .tmvu-metric-icon::before,
        .tmvu-metric-icon::after {
            content: '';
            position: absolute;
            background: currentColor;
        }

        .tmvu-metric-icon-pro::before {
            inset: 1px;
            border: 1px solid currentColor;
            background: transparent;
            border-radius: 50%;
        }

        .tmvu-metric-icon-pro::after {
            left: 5px;
            top: 3px;
            width: 1px;
            height: 4px;
            box-shadow: 2px 2px 0 0 currentColor;
            transform: rotate(45deg);
        }

        .tmvu-metric-icon-cash::before {
            left: 5px;
            top: 1px;
            width: 1px;
            height: 10px;
        }

        .tmvu-metric-icon-cash::after {
            left: 3px;
            top: 2px;
            width: 5px;
            height: 6px;
            background: transparent;
            border: 1px solid currentColor;
            border-radius: 45%;
        }

        .tmvu-group {
            display: flex;
            flex-direction: column;
        }

        .tmvu-group-header {
            display: block;
        }

        .tmvu-group-trigger {
            width: 100%;
            min-height: 42px;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 14px 0 16px;
            border: 0;
            border-left: 3px solid transparent;
            background: transparent;
            color: rgba(237, 242, 235, 0.92);
            cursor: pointer;
            text-align: left;
        }

        .tmvu-group-trigger:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        .tmvu-group.is-open .tmvu-group-trigger,
        .tmvu-group.is-current .tmvu-group-trigger {
            background: var(--tmvu-accent-soft);
            border-left-color: var(--tmvu-accent);
            color: #fff;
        }

        .tmvu-group-label {
            flex: 1 1 auto;
            min-width: 0;
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .tmvu-group-caret {
            width: 8px;
            height: 8px;
            border-right: 1px solid currentColor;
            border-bottom: 1px solid currentColor;
            transform: rotate(45deg);
            transition: transform 140ms ease;
            opacity: 0.72;
        }

        .tmvu-group.is-open .tmvu-group-caret {
            transform: rotate(225deg);
        }

        .tmvu-group-panel {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows 140ms ease;
            overflow: hidden;
        }

        .tmvu-group.is-open .tmvu-group-panel {
            grid-template-rows: 1fr;
        }

        .tmvu-group-panel-inner {
            overflow: hidden;
        }

        .tmvu-subitem {
            min-height: 36px;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 0 14px 0 34px;
            color: rgba(237, 242, 235, 0.74);
            text-decoration: none;
            border-left: 2px solid transparent;
        }

        .tmvu-subitem:hover {
            background: rgba(255, 255, 255, 0.04);
            color: #fff;
        }

        .tmvu-subitem.is-active {
            color: #fff;
            background: rgba(255, 255, 255, 0.06);
            border-left-color: var(--tmvu-accent);
        }

        .tmvu-subitem-label {
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .tmvu-subitem-dot {
            width: 5px;
            height: 5px;
            background: currentColor;
            opacity: 0.55;
        }

        .tmvu-metric {
            display: flex;
            align-items: center;
            gap: 7px;
            min-height: 24px;
            padding: 0 8px;
            border: 1px solid rgba(255, 255, 255, 0.06);
            background: rgba(255, 255, 255, 0.03);
        }

        .tmvu-metric-label {
            font-size: 9px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--tmvu-text-soft);
        }

        .tmvu-metric-value {
            font-size: 12px;
            font-weight: 600;
            color: var(--tmvu-text-inverse);
        }

        .tmvu-icon {
            width: 16px;
            height: 16px;
            flex: 0 0 auto;
            position: relative;
            color: currentColor;
        }

        .tmvu-icon::before,
        .tmvu-icon::after {
            content: '';
            position: absolute;
            background: currentColor;
        }

        .tmvu-icon-home::before {
            left: 2px;
            right: 2px;
            bottom: 2px;
            height: 6px;
        }

        .tmvu-icon-home::after {
            left: 3px;
            top: 1px;
            width: 8px;
            height: 8px;
            background: transparent;
            border-top: 2px solid currentColor;
            border-left: 2px solid currentColor;
            transform: rotate(45deg);
        }

        .tmvu-icon-tactics::before {
            left: 2px;
            top: 2px;
            width: 3px;
            height: 3px;
            box-shadow: 0 5px 0 currentColor, 0 10px 0 currentColor, 8px 2px 0 currentColor, 8px 7px 0 currentColor;
        }

        .tmvu-icon-tactics::after {
            left: 4px;
            top: 4px;
            width: 8px;
            height: 1px;
            transform: rotate(35deg);
        }

        .tmvu-icon-quick::before {
            left: 7px;
            top: 1px;
            width: 3px;
            height: 8px;
            transform: skewX(-18deg);
        }

        .tmvu-icon-quick::after {
            left: 5px;
            top: 7px;
            width: 3px;
            height: 8px;
            transform: skewX(-18deg);
        }

        .tmvu-icon-league::before {
            inset: 2px;
            background: transparent;
            border: 1px solid currentColor;
        }

        .tmvu-icon-league::after {
            left: 3px;
            right: 3px;
            top: 7px;
            height: 1px;
            box-shadow: 0 -3px 0 currentColor, 0 3px 0 currentColor;
        }

        .tmvu-icon-transfer::before {
            left: 1px;
            top: 4px;
            width: 9px;
            height: 2px;
        }

        .tmvu-icon-transfer::after {
            right: 1px;
            bottom: 4px;
            width: 9px;
            height: 2px;
            box-shadow: -2px -2px 0 currentColor;
        }

        .tmvu-icon-forum::before {
            left: 2px;
            top: 2px;
            width: 11px;
            height: 8px;
            background: transparent;
            border: 1px solid currentColor;
        }

        .tmvu-icon-forum::after {
            left: 5px;
            bottom: 2px;
            width: 5px;
            height: 5px;
            transform: skewX(-24deg);
        }

        .tmvu-icon-pro::before {
            left: 2px;
            top: 2px;
            width: 12px;
            height: 12px;
            border: 1px solid currentColor;
            border-radius: 50%;
            background: transparent;
        }

        .tmvu-icon-pro::after {
            left: 6px;
            top: 6px;
            width: 4px;
            height: 4px;
            border-radius: 50%;
        }

        .tmvu-icon-generic::before {
            inset: 3px;
        }

        @media (max-width: 1100px) {
            :root {
                --tmvu-drawer-width: 248px;
            }

            .tmvu-brand {
                padding: 12px 12px 10px;
            }
        }
    `;

    document.head.appendChild(style);
}

function syncLayoutState() {
    document.body.classList.add('tmvu-shell-active');
}

function setOpenGroup(groupId) {
    const fallbackGroupId = groupId || document.querySelector('.tmvu-group')?.getAttribute('data-group-id') || '';

    document.querySelectorAll('.tmvu-group').forEach(group => {
        const isOpen = group.getAttribute('data-group-id') === fallbackGroupId;
        group.classList.toggle('is-open', isOpen);
        const trigger = group.querySelector('[data-group-trigger]');
        if (trigger) trigger.setAttribute('aria-expanded', String(isOpen));
    });

    window.localStorage.setItem(GROUP_STORAGE_KEY, fallbackGroupId);
}

export function initAppShellLayout() {
    if (!document.body || !document.head) return;
    if (document.getElementById('tmvu-drawer')) return;

    removeNativeMenus();
    injectStyles();

    const currentPath = normalizeHref(window.location.pathname) || '/home/';
    const groups = collectNavGroups();
    const clubInfo = getClubInfo();
    const openGroupId = getInitialOpenGroup(groups, currentPath);
    const drawerHtml = TmAppShellDrawer.render({
        clubName: clubInfo.clubName,
        logo: clubInfo.logo,
        proDays: clubInfo.proDays || '0',
        cash: formatCash(clubInfo.cash),
        groups,
        currentPath,
        openGroupId,
    });

    document.body.insertAdjacentHTML('beforeend', drawerHtml);

    document.querySelectorAll('[data-group-trigger]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const groupId = trigger.getAttribute('data-group-trigger') || '';
            const group = trigger.closest('.tmvu-group');
            const isOpen = group?.classList.contains('is-open');
            setOpenGroup(isOpen ? groupId : groupId);
        });
    });

    syncLayoutState();
}
