import { getDefaultHeaderGroups, getHeaderGroupMeta, TmAppShellHeader } from '../components/shared/tm-app-shell-header.js';

const GROUP_STORAGE_KEY = 'tmvu-shell-group';
const IMPORT_PATH = '/import/';

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
        const meta = getHeaderGroupMeta(id, cleanText(anchor.getAttribute('title')) || href);
        groups.push({
            id,
            href,
            label: meta.label,
            icon: meta.icon,
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

    const resolvedGroups = groups.length < 4
        ? getDefaultHeaderGroups()
        : groups.map(group => ({
            ...group,
            children: dedupeChildren(group.children),
        }));

    return resolvedGroups.map(group => ({
        ...group,
        children: dedupeChildren(group.children),
    }));
}

function getHeaderFab(currentPath) {
    return {
        href: IMPORT_PATH,
        label: 'Import',
        icon: '📥',
        isActive: currentPath === IMPORT_PATH,
    };
}

function groupHasActiveChild(group, currentPath) {
    return group.children.some(child => child.href === currentPath);
}

function getInitialOpenGroup(groups, currentPath) {
    return '';
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
    document.querySelectorAll('#cookies_disabled_message, .cookies_disabled_message, .column1_d').forEach(node => node.remove());
}

function replaceMainCenterClass() {
    document.querySelectorAll('.main_center').forEach(mainCenter => {
        if (mainCenter.id === 'cookies_disabled_message') {
            mainCenter.remove();
            return;
        }
        mainCenter.classList.remove('main_center');
        mainCenter.classList.add('tmvu-main');
    });
}

function injectStyles() {
    if (document.getElementById('tmvu-shell-styles')) return;

    const style = document.createElement('style');
    style.id = 'tmvu-shell-styles';
    style.textContent = `
        :root {
            --tmvu-header-height: 140px;
            --tmvu-surface: #1a3210;
            --tmvu-surface-2: #1d3811;
            --tmvu-surface-3: #234217;
            --tmvu-border: rgba(255, 255, 255, 0.08);
            --tmvu-text: #e7eee6;
            --tmvu-text-soft: rgba(231, 238, 230, 0.56);
            --tmvu-text-inverse: #edf2eb;
            --tmvu-accent: #9dbc71;
            --tmvu-accent-soft: rgba(157, 188, 113, 0.16);
            --tmvu-font: "IBM Plex Sans", "Segoe UI", sans-serif;
        }

        body.tmvu-shell-active {
            margin: 0 !important;
            padding-top: var(--tmvu-header-height) !important;
            background-image: none !important;
            background-color: #203f08 !important;
            background: #203f08 !important;
            color: var(--tmvu-text) !important;
            font-family: var(--tmvu-font) !important;
            font-size: 13px !important;
            line-height: 1.4;
            text-align: left;
            min-height: 100vh;
        }

        body.tmvu-shell-active #body_foot,
        body.tmvu-shell-active .body_foot,
        body.tmvu-shell-active .link_area,
        body.tmvu-shell-active #body_end,
        body.tmvu-shell-active .body_end,
        body.tmvu-shell-active #cookies_disabled_message,
        body.tmvu-shell-active .notice_box {
            display: none !important;
        }

        body.tmvu-shell-active .tmvu-main {
            width: min(1250px, calc(100% - 24px)) !important;
            max-width: 1250px !important;
            margin: 16px auto !important;
            display: flex;
            gap: 16px;
            background: transparent !important;
            background-color: transparent !important;
            box-shadow: none !important;
        }

        #tmvu-header {
            box-sizing: border-box;
            font-family: var(--tmvu-font);
        }

        #tmvu-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(180deg, #1c3410, #1d3811 58%, #1b3410);
            color: var(--tmvu-text-inverse);
            border-bottom: 1px solid rgba(61, 104, 40, 0.42);
            box-shadow: inset 0 -1px 0 rgba(8, 16, 6, 0.24);
            z-index: 9999;
        }

        .tmvu-header-shell {
            width: min(1250px, calc(100% - 24px));
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .tmvu-header-top {
            min-height: 80px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 4px 0 4px;
        }

        .tmvu-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
        }

        .tmvu-brand-logo,
        .tmvu-brand-mark {
            width: 72px;
            height: 72px;
            flex: 0 0 auto;
            display: grid;
            place-items: center;
        }

        .tmvu-brand-logo {
            object-fit: cover;
        }

        .tmvu-brand-mark {
            color: var(--tmvu-accent);
            background: var(--tmvu-surface-3);
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.08em;
        }

        .tmvu-brand-copy {
            min-width: 0;
        }

        .tmvu-brand-copy strong {
            display: block;
            font-size: 26px;
            line-height: 1.05;
            font-weight: 700;
            color: var(--tmvu-text-inverse);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .tmvu-header-meta {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
            min-width: 0;
            padding-right: 92px;
        }

        .tmvu-header-fab {
            position: absolute;
            top: 14px;
            right: 0;
            min-height: 34px;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 0 12px;
            border-radius: 999px;
            border: 1px solid rgba(61, 104, 40, 0.45);
            background: rgba(8, 16, 6, 0.22);
            color: rgba(237, 242, 235, 0.92);
            text-decoration: none;
            white-space: nowrap;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
        }

        .tmvu-header-fab:hover {
            background: rgba(108, 192, 64, 0.14);
            color: #fff;
        }

        .tmvu-header-fab.is-active {
            background: rgba(108, 192, 64, 0.18);
            border-color: rgba(157, 188, 113, 0.65);
            color: #fff;
        }

        .tmvu-header-fab-label {
            font-size: 12px;
            font-weight: 600;
        }

        .tmvu-brand-metrics {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }

        .tmvu-nav-wrap {
            display: flex;
            flex-direction: column;
            border-top: 1px solid rgba(61, 104, 40, 0.28);
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

        .tmvu-nav-primary {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 0 6px;
            overflow-x: auto;
            overflow-y: hidden;
        }

        .tmvu-nav-secondary {
            display: none;
        }

        .tmvu-nav-secondary.has-open {
            display: block;
            min-height: 36px;
            padding: 0 0 2px;
        }

        .tmvu-secondary-group {
            display: none;
            align-items: center;
            gap: 10px;
            min-height: 36px;
            overflow-x: auto;
            overflow-y: hidden;
        }

        .tmvu-secondary-group.is-open {
            display: flex;
        }

        .tmvu-menu-group {
            flex: 0 0 auto;
        }

        .tmvu-menu-trigger {
            min-height: 36px;
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 0 13px;
            border: 0;
            border-bottom: 2px solid transparent;
            background: transparent;
            color: rgba(237, 242, 235, 0.92);
            cursor: pointer;
            text-align: left;
            white-space: nowrap;
            text-decoration: none;
        }

        .tmvu-menu-trigger:hover {
            background: rgba(108, 192, 64, 0.08);
        }

        .tmvu-menu-group.is-open .tmvu-menu-trigger,
        .tmvu-menu-group.is-current .tmvu-menu-trigger {
            background: rgba(108, 192, 64, 0.12);
            border-bottom-color: var(--tmvu-accent);
            color: #fff;
        }

        .tmvu-group-label {
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
        }

        .tmvu-subitem {
            min-height: 36px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0 11px;
            color: rgba(237, 242, 235, 0.74);
            text-decoration: none;
            border-bottom: 2px solid transparent;
            white-space: nowrap;
            flex: 0 0 auto;
        }

        .tmvu-subitem:hover {
            background: rgba(108, 192, 64, 0.08);
            color: #fff;
        }

        .tmvu-subitem.is-active {
            color: #fff;
            background: rgba(108, 192, 64, 0.12);
            border-bottom-color: var(--tmvu-accent);
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
            gap: 6px;
            min-height: 22px;
            padding: 0 6px;
            border: 1px solid rgba(61, 104, 40, 0.34);
            background: rgba(8, 16, 6, 0.16);
        }

        .tmvu-metric-label {
            font-size: 8px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--tmvu-text-soft);
        }

        .tmvu-metric-value {
            font-size: 11px;
            font-weight: 600;
            color: var(--tmvu-text-inverse);
        }

        .tmvu-icon {
            width: 18px;
            height: 18px;
            flex: 0 0 auto;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: currentColor;
            font-size: 15px;
            line-height: 1;
            transform: translateY(-0.5px);
        }
    `;

    document.head.appendChild(style);
}

function syncLayoutState() {
    document.body.classList.add('tmvu-shell-active');
}

function setOpenGroup(groupId) {
    const nextGroupId = groupId || '';

    document.querySelectorAll('.tmvu-menu-group').forEach(group => {
        const isOpen = group.getAttribute('data-group-id') === nextGroupId;
        group.classList.toggle('is-open', isOpen);
        const trigger = group.querySelector('[data-group-trigger]');
        if (trigger) trigger.setAttribute('aria-expanded', String(isOpen));
    });

    document.querySelectorAll('.tmvu-secondary-group').forEach(group => {
        const isOpen = group.getAttribute('data-group-id') === nextGroupId;
        group.classList.toggle('is-open', isOpen);
    });

    document.querySelectorAll('.tmvu-nav-secondary').forEach(nav => {
        nav.classList.toggle('has-open', Boolean(nextGroupId));
    });

    if (nextGroupId) {
        window.localStorage.removeItem(GROUP_STORAGE_KEY);
    }
}

export function initAppShellLayout() {
    if (!document.body || !document.head) return;
    if (document.getElementById('tmvu-header')) return;

    removeNativeMenus();
    replaceMainCenterClass();
    injectStyles();

    const currentPath = normalizeHref(window.location.pathname) || '/home/';
    const groups = collectNavGroups();
    const clubInfo = getClubInfo();
    const openGroupId = getInitialOpenGroup(groups, currentPath);
    const headerFab = getHeaderFab(currentPath);
    const headerHtml = TmAppShellHeader.render({
        clubName: clubInfo.clubName,
        logo: clubInfo.logo,
        proDays: clubInfo.proDays || '0',
        cash: formatCash(clubInfo.cash),
        groups,
        currentPath,
        openGroupId,
        headerFab,
    });

    document.body.insertAdjacentHTML('beforeend', headerHtml);

    document.querySelectorAll('[data-group-trigger]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const groupId = trigger.getAttribute('data-group-trigger') || '';
            const groupHref = trigger.getAttribute('data-group-href') || '';
            const group = trigger.closest('.tmvu-menu-group');
            const isOpen = group?.classList.contains('is-open');
            if (isOpen && groupHref) {
                window.location.assign(groupHref);
                return;
            }
            setOpenGroup(groupId);
        });
    });

    syncLayoutState();
}
