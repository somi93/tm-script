(function () {
    'use strict';

    if (window.top !== window.self) return;

    const SCRIPT_KEY = 'tmvu-shell';
    const MOBILE_QUERY = '(max-width: 1100px)';
    const STORAGE_KEY = 'tmvu-shell-open';
    const GROUP_STORAGE_KEY = 'tmvu-shell-group';
    const ICON_CLASS_BY_GROUP = {
        '0': 'tmvu-icon-home',
        '1': 'tmvu-icon-tactics',
        '2': 'tmvu-icon-quick',
        '3': 'tmvu-icon-league',
        '4': 'tmvu-icon-transfer',
        '5': 'tmvu-icon-forum',
        '6': 'tmvu-icon-pro',
    };
    const TOP_MENU_LABELS = {
        '0': 'Home',
        '1': 'Tactics',
        '2': 'Quick Match',
        '3': 'League',
        '4': 'Transfer',
        '5': 'Forum',
        '6': 'Buy Pro',
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

    function isUsefulLink(anchor) {
        const href = normalizeHref(anchor.getAttribute('href') || '');
        const label = cleanText(anchor.textContent);
        if (!href || !label) return false;
        if (href.includes('/logout')) return false;
        return true;
    }

    function dedupeChildren(children) {
        const seen = new Set();
        return children.filter(child => {
            if (!child.href || !child.label || seen.has(child.href)) return false;
            seen.add(child.href);
            return true;
        });
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

    function flattenLinks(groups) {
        const byHref = new Map();
        groups.forEach(group => {
            byHref.set(group.href, { href: group.href, label: group.label });
            group.children.forEach(child => {
                if (!byHref.has(child.href)) byHref.set(child.href, child);
            });
        });
        return Array.from(byHref.values());
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

    function getPageTitle() {
        const candidates = [
            document.querySelector('.headline h1'),
            document.querySelector('.headline h2'),
            document.querySelector('h1'),
            document.querySelector('h2'),
        ];

        for (const node of candidates) {
            const text = cleanText(node?.textContent);
            if (text) return text;
        }

        return cleanText(document.title.replace(/\s*-\s*TrophyManager.*$/i, '')) || 'Overview';
    }

    function getCurrentPath() {
        return normalizeHref(window.location.pathname) || '/home/';
    }

    function groupHasActiveChild(group, currentPath) {
        return group.children.some(child => child.href === currentPath);
    }

    function getInitialOpenGroup(groups, currentPath) {
        const stored = window.localStorage.getItem(GROUP_STORAGE_KEY);
        if (stored && groups.some(group => group.id === stored)) return stored;
        const active = groups.find(group => group.href === currentPath || groupHasActiveChild(group, currentPath));
        return active?.id || groups[0]?.id || '';
    }

    function injectStyles() {
        if (document.getElementById(`${SCRIPT_KEY}-styles`)) return;

        const style = document.createElement('style');
        style.id = `${SCRIPT_KEY}-styles`;
        style.textContent = `
            :root {
                --tmvu-drawer-width: 272px;
                --tmvu-appbar-height: 52px;
                --tmvu-surface: #1f2822;
                --tmvu-surface-2: #27332c;
                --tmvu-line: rgba(34, 46, 39, 0.14);
                --tmvu-text: #182019;
                --tmvu-text-soft: #5a675d;
                --tmvu-accent: #6d8f43;
                --tmvu-accent-2: #8aaa60;
                --tmvu-shadow: 0 18px 54px rgba(20, 28, 23, 0.18);
                --tmvu-font: "IBM Plex Sans", "Trebuchet MS", sans-serif;
            }

            body.tmvu-shell-active {
                padding-top: var(--tmvu-appbar-height) !important;
                padding-left: var(--tmvu-drawer-width) !important;
                transition: padding 160ms ease;
            }

            body.tmvu-shell-active.tmvu-drawer-collapsed {
                padding-left: 0 !important;
            }

            #tmvu-appbar,
            #tmvu-drawer,
            #tmvu-backdrop {
                font-family: var(--tmvu-font);
                box-sizing: border-box;
            }

            #tmvu-appbar {
                position: fixed;
                top: 0;
                left: var(--tmvu-drawer-width);
                width: calc(100% - var(--tmvu-drawer-width));
                height: var(--tmvu-appbar-height);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 0 14px;
                border: 1px solid var(--tmvu-line);
                border-radius: 0;
                background: linear-gradient(135deg, rgba(245, 241, 232, 0.96), rgba(236, 230, 218, 0.92));
                backdrop-filter: blur(14px);
                box-shadow: var(--tmvu-shadow);
                z-index: 9998;
                color: var(--tmvu-text);
            }

            #tmvu-drawer {
                position: fixed;
                top: 0;
                left: 0;
                bottom: 0;
                width: var(--tmvu-drawer-width);
                display: flex;
                flex-direction: column;
                gap: 18px;
                padding: 16px 0 0;
                border-radius: 0;
                background: linear-gradient(180deg, var(--tmvu-surface), var(--tmvu-surface-2));
                box-shadow: var(--tmvu-shadow);
                color: #f7f4ec;
                z-index: 9999;
                transform: translateX(0);
                transition: transform 160ms ease, opacity 160ms ease;
            }

            body.tmvu-shell-active.tmvu-drawer-collapsed #tmvu-drawer {
                transform: translateX(-100%);
                opacity: 0;
                pointer-events: none;
            }

            body.tmvu-shell-active.tmvu-drawer-collapsed #tmvu-appbar {
                left: 0;
                width: 100%;
            }

            #tmvu-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(10, 14, 11, 0.38);
                opacity: 0;
                pointer-events: none;
                z-index: 9997;
                transition: opacity 160ms ease;
            }

            .tmvu-mobile-open #tmvu-backdrop {
                opacity: 1;
                pointer-events: auto;
            }

            .tmvu-brand {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 8px 16px 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .tmvu-brand-logo,
            .tmvu-brand-mark {
                width: 46px;
                height: 46px;
                border-radius: 0;
                flex: 0 0 auto;
            }

            .tmvu-brand-logo {
                background: rgba(255, 255, 255, 0.08);
                object-fit: contain;
            }

            .tmvu-brand-mark {
                display: grid;
                place-items: center;
                background: linear-gradient(135deg, rgba(138, 170, 96, 0.95), rgba(84, 108, 55, 0.95));
                color: #172014;
                font-weight: 700;
                letter-spacing: 0.08em;
            }

            .tmvu-brand-copy strong,
            .tmvu-title strong {
                display: block;
                font-size: 14px;
                line-height: 1.2;
                font-weight: 700;
            }

            .tmvu-brand-copy span,
            .tmvu-title span,
            .tmvu-action-link {
                display: block;
                font-size: 11px;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                color: rgba(247, 244, 236, 0.62);
            }

            .tmvu-appbar-left,
            .tmvu-appbar-right {
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 0;
            }

            .tmvu-toggle {
                width: 34px;
                height: 34px;
                display: inline-flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 4px;
                border: 0;
                border-radius: 0;
                background: #202a22;
                cursor: pointer;
                box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
            }

            .tmvu-toggle span {
                width: 15px;
                height: 2px;
                border-radius: 0;
                background: #f5f1e8;
            }

            .tmvu-metric {
                display: flex;
                align-items: baseline;
                gap: 8px;
                padding: 0 10px;
                min-height: 32px;
                background: rgba(32, 42, 34, 0.05);
                border-left: 2px solid rgba(109, 143, 67, 0.38);
            }

            .tmvu-metric-label {
                font-size: 10px;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                color: var(--tmvu-text-soft);
            }

            .tmvu-metric-value {
                font-size: 13px;
                font-weight: 700;
                color: var(--tmvu-text);
            }

            .tmvu-nav {
                display: flex;
                flex-direction: column;
                gap: 0;
                overflow: auto;
                padding-right: 4px;
            }

            .tmvu-nav::-webkit-scrollbar {
                width: 5px;
            }

            .tmvu-nav::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.18);
                border-radius: 0;
            }

            .tmvu-group {
                display: flex;
                flex-direction: column;
            }

            .tmvu-group-header {
                display: grid;
                grid-template-columns: minmax(0, 1fr) 40px;
                align-items: stretch;
            }

            .tmvu-group-link,
            .tmvu-subitem,
            .tmvu-group-toggle {
                min-height: 46px;
                border-radius: 0;
            }

            .tmvu-group-link,
            .tmvu-subitem {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 0 16px;
                color: rgba(247, 244, 236, 0.84);
                text-decoration: none;
                border-left: 3px solid transparent;
                transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
            }

            .tmvu-group-link:hover,
            .tmvu-subitem:hover,
            .tmvu-group-toggle:hover {
                background: rgba(255, 255, 255, 0.08);
            }

            .tmvu-group-link.is-active,
            .tmvu-group.is-open .tmvu-group-link,
            .tmvu-subitem.is-active {
                background: rgba(138, 170, 96, 0.16);
                border-left-color: var(--tmvu-accent-2);
                color: #f7f4ec;
                font-weight: 700;
            }

            .tmvu-link-icon {
                width: 18px;
                height: 18px;
                flex: 0 0 auto;
                position: relative;
                opacity: 0.92;
            }

            .tmvu-link-bullet {
                width: 8px;
                height: 8px;
                flex: 0 0 auto;
                background: rgba(255, 255, 255, 0.22);
            }

            .tmvu-group-link.has-icon .tmvu-link-bullet {
                display: none;
            }

            .tmvu-icon-home,
            .tmvu-icon-tactics,
            .tmvu-icon-quick,
            .tmvu-icon-league,
            .tmvu-icon-transfer,
            .tmvu-icon-forum,
            .tmvu-icon-pro,
            .tmvu-icon-generic {
                border: 1px solid currentColor;
            }

            .tmvu-icon-home::before,
            .tmvu-icon-tactics::before,
            .tmvu-icon-quick::before,
            .tmvu-icon-league::before,
            .tmvu-icon-transfer::before,
            .tmvu-icon-forum::before,
            .tmvu-icon-pro::before,
            .tmvu-icon-generic::before,
            .tmvu-icon-home::after,
            .tmvu-icon-tactics::after,
            .tmvu-icon-quick::after,
            .tmvu-icon-league::after,
            .tmvu-icon-transfer::after,
            .tmvu-icon-forum::after,
            .tmvu-icon-pro::after,
            .tmvu-icon-generic::after {
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
                left: 4px;
                top: 1px;
                width: 8px;
                height: 8px;
                transform: rotate(45deg);
                background: transparent;
                border-top: 2px solid currentColor;
                border-left: 2px solid currentColor;
            }

            .tmvu-icon-tactics::before {
                left: 3px;
                top: 3px;
                width: 3px;
                height: 3px;
                box-shadow: 0 5px 0 currentColor, 0 10px 0 currentColor, 8px 2px 0 currentColor, 8px 7px 0 currentColor;
            }

            .tmvu-icon-tactics::after {
                left: 5px;
                top: 5px;
                width: 8px;
                height: 1px;
                transform: rotate(35deg);
            }

            .tmvu-icon-quick::before {
                left: 7px;
                top: 1px;
                width: 3px;
                height: 10px;
                transform: skewX(-18deg);
            }

            .tmvu-icon-quick::after {
                left: 5px;
                top: 8px;
                width: 3px;
                height: 8px;
                transform: skewX(-18deg);
            }

            .tmvu-icon-league::before {
                inset: 3px;
                background: transparent;
                border: 1px solid currentColor;
            }

            .tmvu-icon-league::after {
                left: 3px;
                right: 3px;
                top: 8px;
                height: 1px;
                box-shadow: 0 -4px 0 currentColor, 0 4px 0 currentColor;
            }

            .tmvu-icon-transfer::before {
                left: 2px;
                top: 4px;
                width: 9px;
                height: 2px;
            }

            .tmvu-icon-transfer::after {
                right: 2px;
                bottom: 4px;
                width: 9px;
                height: 2px;
                box-shadow: -2px -2px 0 currentColor;
            }

            .tmvu-icon-forum::before {
                left: 2px;
                top: 3px;
                width: 12px;
                height: 9px;
                background: transparent;
                border: 1px solid currentColor;
            }

            .tmvu-icon-forum::after {
                left: 5px;
                bottom: 2px;
                width: 5px;
                height: 5px;
                transform: skewX(-22deg);
            }

            .tmvu-icon-pro::before {
                left: 3px;
                top: 3px;
                width: 10px;
                height: 10px;
                border-radius: 50%;
            }

            .tmvu-icon-pro::after {
                left: 6px;
                top: 6px;
                width: 4px;
                height: 4px;
                background: var(--tmvu-surface);
                border-radius: 50%;
            }

            .tmvu-icon-generic::before {
                inset: 4px;
            }

            .tmvu-link-label {
                flex: 1 1 auto;
                min-width: 0;
            }

            .tmvu-group-toggle {
                position: relative;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border: 0;
                border-left: 1px solid rgba(255, 255, 255, 0.06);
                background: transparent;
                color: rgba(247, 244, 236, 0.72);
                cursor: pointer;
                transition: background 120ms ease, color 120ms ease;
            }

            .tmvu-group-toggle::before,
            .tmvu-group-toggle::after {
                content: '';
                position: absolute;
                width: 10px;
                height: 2px;
                background: currentColor;
                transition: transform 120ms ease;
            }

            .tmvu-group-toggle::before {
                transform: rotate(45deg) translate(2px, 2px);
            }

            .tmvu-group-toggle::after {
                transform: rotate(-45deg) translate(-2px, 2px);
            }

            .tmvu-group.is-open .tmvu-group-toggle {
                color: var(--tmvu-accent-2);
            }

            .tmvu-group.is-open .tmvu-group-toggle::before {
                transform: rotate(-45deg) translate(2px, -2px);
            }

            .tmvu-group.is-open .tmvu-group-toggle::after {
                transform: rotate(45deg) translate(-2px, -2px);
            }

            .tmvu-group-panel {
                display: grid;
                grid-template-rows: 0fr;
                transition: grid-template-rows 150ms ease;
            }

            .tmvu-group.is-open .tmvu-group-panel {
                grid-template-rows: 1fr;
            }

            .tmvu-group-panel-inner {
                overflow: hidden;
            }

            .tmvu-subitem {
                min-height: 40px;
                padding-left: 32px;
                font-size: 13px;
                border-left-width: 2px;
                color: rgba(247, 244, 236, 0.72);
            }

            .tmvu-subitem .tmvu-link-bullet {
                width: 6px;
                height: 1px;
                background: rgba(247, 244, 236, 0.32);
            }

            .tmvu-footnote {
                margin-top: auto;
                padding: 14px 16px;
                border-radius: 0;
                background: rgba(255, 255, 255, 0.04);
                color: rgba(247, 244, 236, 0.74);
                font-size: 12px;
                line-height: 1.5;
            }

            @media ${MOBILE_QUERY} {
                body.tmvu-shell-active,
                body.tmvu-shell-active.tmvu-drawer-collapsed {
                    padding-left: 0 !important;
                    padding-top: var(--tmvu-appbar-height) !important;
                }

                #tmvu-appbar,
                body.tmvu-shell-active.tmvu-drawer-collapsed #tmvu-appbar {
                    left: 0;
                    width: 100%;
                    top: 0;
                    border-radius: 0;
                    padding: 0 14px;
                }

                #tmvu-drawer {
                    top: 0;
                    left: 0;
                    bottom: 0;
                    max-width: 100vw;
                    transform: translateX(-100%);
                    opacity: 0;
                    pointer-events: none;
                }

                .tmvu-mobile-open #tmvu-drawer {
                    transform: translateX(0);
                    opacity: 1;
                    pointer-events: auto;
                }

                .tmvu-metric {
                    padding: 0 8px;
                }

                .tmvu-metric-label {
                    display: none;
                }

                .tmvu-metric-value {
                    font-size: 12px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function renderGroup(group, currentPath, openGroupId) {
        const isActive = group.href === currentPath;
        const hasActiveChild = groupHasActiveChild(group, currentPath);
        const isOpen = openGroupId === group.id;
        const hasChildren = group.children.length > 0;

        return `
            <div class="tmvu-group${isOpen ? ' is-open' : ''}${isActive || hasActiveChild ? ' is-current' : ''}" data-group-id="${group.id}">
                <div class="tmvu-group-header">
                    <button class="tmvu-group-link${isActive ? ' is-active' : ''}${group.iconClass ? ' has-icon' : ''}" type="button">
                        ${group.iconClass ? `<span class="tmvu-link-icon ${group.iconClass}"></span>` : '<span class="tmvu-link-bullet"></span>'}
                        <span class="tmvu-link-label">${group.label}</span>
                    </button>
                    ${hasChildren ? '<button class="tmvu-group-toggle" type="button" aria-label="Toggle group"></button>' : '<span></span>'}
                </div>
                ${hasChildren ? `
                    <div class="tmvu-group-panel">
                        <div class="tmvu-group-panel-inner">
                            ${group.children.map(child => `
                                <a class="tmvu-subitem${child.href === currentPath ? ' is-active' : ''}" href="${child.href}">
                                    <span class="tmvu-link-bullet"></span>
                                    <span class="tmvu-link-label">${child.label}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    function renderShell() {
        if (document.getElementById('tmvu-appbar')) return;

        const groups = collectNavGroups();
        const currentPath = getCurrentPath();
        const clubInfo = getClubInfo();
        const openGroupId = getInitialOpenGroup(groups, currentPath);
        const flatLinks = flattenLinks(groups);
        const quickLink = flatLinks.find(link => link.href !== currentPath) || flatLinks[0] || { href: '/home/', label: 'Home' };

        const backdrop = document.createElement('div');
        backdrop.id = 'tmvu-backdrop';

        const drawer = document.createElement('aside');
        drawer.id = 'tmvu-drawer';
        drawer.innerHTML = `
            <div class="tmvu-brand">
                ${clubInfo.logo
                    ? `<img class="tmvu-brand-logo" src="${clubInfo.logo}" alt="${clubInfo.clubName}">`
                    : '<div class="tmvu-brand-mark">TM</div>'}
                <div class="tmvu-brand-copy">
                    <strong>${clubInfo.clubName}</strong>
                </div>
            </div>
            <nav class="tmvu-nav">
                ${groups.map(group => renderGroup(group, currentPath, openGroupId)).join('')}
            </nav>
            <div class="tmvu-footnote">
                Eksperimentalni shell u bundle-u. Ako hoces da ga gasis lokalno, ubaci rani return u ovaj page entry.
            </div>
        `;

        const appbar = document.createElement('header');
        appbar.id = 'tmvu-appbar';
        appbar.innerHTML = `
            <div class="tmvu-appbar-left">
                <button class="tmvu-toggle" type="button" aria-label="Toggle navigation">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div class="tmvu-metric">
                    <span class="tmvu-metric-label">Pro</span>
                    <strong class="tmvu-metric-value">${clubInfo.proDays || '0'}d</strong>
                </div>
            </div>
            <div class="tmvu-appbar-right">
                <div class="tmvu-metric">
                    <span class="tmvu-metric-label">Cash</span>
                    <strong class="tmvu-metric-value">$${formatCash(clubInfo.cash)}</strong>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        document.body.appendChild(drawer);
        document.body.appendChild(appbar);
    }

    function syncLayoutState() {
        const isMobile = window.matchMedia(MOBILE_QUERY).matches;
        const stored = window.localStorage.getItem(STORAGE_KEY);
        const open = stored == null ? !isMobile : stored === '1';

        document.body.classList.add('tmvu-shell-active');

        if (isMobile) {
            document.body.classList.remove('tmvu-drawer-collapsed');
            document.body.classList.toggle('tmvu-mobile-open', open);
        } else {
            document.body.classList.remove('tmvu-mobile-open');
            document.body.classList.toggle('tmvu-drawer-collapsed', !open);
        }
    }

    function setOpenState(nextOpen) {
        window.localStorage.setItem(STORAGE_KEY, nextOpen ? '1' : '0');
        syncLayoutState();
    }

    function setOpenGroup(groupId) {
        document.querySelectorAll('.tmvu-group').forEach(group => {
            group.classList.toggle('is-open', group.getAttribute('data-group-id') === groupId);
        });
        window.localStorage.setItem(GROUP_STORAGE_KEY, groupId || '');
    }

    function bindEvents() {
        const toggle = document.querySelector('.tmvu-toggle');
        const backdrop = document.getElementById('tmvu-backdrop');
        if (!toggle || !backdrop) return;

        toggle.addEventListener('click', () => {
            const isMobile = window.matchMedia(MOBILE_QUERY).matches;
            const open = isMobile
                ? document.body.classList.contains('tmvu-mobile-open')
                : !document.body.classList.contains('tmvu-drawer-collapsed');
            setOpenState(!open);
        });

        backdrop.addEventListener('click', () => setOpenState(false));

        document.querySelectorAll('.tmvu-group-toggle, .tmvu-group-link').forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                const group = button.closest('.tmvu-group');
                if (!group) return;
                const groupId = group.getAttribute('data-group-id') || '';
                const isOpen = group.classList.contains('is-open');
                setOpenGroup(isOpen ? '' : groupId);
            });
        });

        window.addEventListener('resize', syncLayoutState);
    }

    function boot() {
        if (!document.body || !document.head) return;
        removeNativeMenus();
        injectStyles();
        renderShell();
        syncLayoutState();
        bindEvents();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
