(function () {
    'use strict';

    if (window.top !== window.self) return;

    const SCRIPT_KEY = 'tmvu-shell';
    const MOBILE_QUERY = '(max-width: 1100px)';
    const STORAGE_KEY = 'tmvu-shell-open';
    const TOP_MENU_LABELS = {
        '0': 'Home',
        '1': 'Tactics',
        '2': 'Quick Match',
        '3': 'League',
        '4': 'Transfer',
        '5': 'Forum',
        '6': 'Buy Pro',
    };
    const DEFAULT_LINKS = [
        { href: '/home/', label: 'Home' },
        { href: '/club/', label: 'Club' },
        { href: '/finances/', label: 'Finances' },
        { href: '/stadium/', label: 'Stadium' },
        { href: '/account/', label: 'Account' },
        { href: '/tactics/', label: 'Tactics' },
        { href: '/players/', label: 'Players' },
        { href: '/youth-development/', label: 'Youth Development' },
        { href: '/training/', label: 'Training' },
        { href: '/quickmatch/', label: 'Quick Match' },
        { href: '/friendly-league/', label: 'Friendly League' },
        { href: '/league/', label: 'League' },
        { href: '/cup/', label: 'Cup' },
        { href: '/international-cup/', label: 'International Cup' },
        { href: '/national-teams/', label: 'National Teams' },
        { href: '/matches/', label: 'Matches' },
        { href: '/transfer/', label: 'Transfer' },
        { href: '/shortlist/', label: 'Shortlist' },
        { href: '/bids/', label: 'Bids' },
        { href: '/scouts/', label: 'Scouts' },
        { href: '/forum/', label: 'Forum' },
        { href: '/user-guide/', label: 'User Guide' },
        { href: '/about-tm/', label: 'About TM' },
        { href: '/teamsters/', label: 'Teamsters' },
        { href: '/buy-pro/', label: 'Buy Pro' },
        { href: '/about-pro/', label: 'About Pro' },
        { href: '/donations/', label: 'Donations' },
        { href: '/support-pro/', label: 'Support' },
        { href: '/squad/', label: 'Squad' },
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

    function getTopMenuIcon(anchor) {
        const iconNode = anchor.querySelector('.menu_ico');
        if (!iconNode) return '';
        const bg = iconNode.style.backgroundImage || window.getComputedStyle(iconNode).backgroundImage || '';
        const match = bg.match(/url\((['"]?)(.*?)\1\)/i);
        return match ? match[2] : '';
    }

    function collectNavLinks() {
        const byHref = new Map();

        const addLink = (link) => {
            if (!link.href || !link.label) return;
            const existing = byHref.get(link.href);
            if (!existing) {
                byHref.set(link.href, link);
                return;
            }

            byHref.set(link.href, {
                ...existing,
                ...link,
                icon: existing.icon || link.icon || '',
                primary: existing.primary || link.primary || false,
            });
        };

        document.querySelectorAll('#top_menu > ul > li > a[top_menu]').forEach(anchor => {
            const href = normalizeHref(anchor.getAttribute('href') || '');
            const menuId = anchor.getAttribute('top_menu') || '';
            const label = TOP_MENU_LABELS[menuId] || cleanText(anchor.getAttribute('title')) || href;
            addLink({
                href,
                label,
                icon: getTopMenuIcon(anchor),
                primary: true,
            });
        });

        document.querySelectorAll('#mega_menu_items a').forEach(anchor => {
            if (!isUsefulLink(anchor)) return;
            addLink({
                href: normalizeHref(anchor.getAttribute('href') || ''),
                label: cleanText(anchor.textContent),
                primary: false,
            });
        });

        if (byHref.size < 4) {
            DEFAULT_LINKS.forEach(link => addLink({ ...link, primary: false, icon: '' }));
        }

        return Array.from(byHref.values());
    }

    function getClubInfo() {
        const session = window.SESSION || {};
        const clubId = String(session.main_id || session.club_id || '').trim();
        const clubName = cleanText(
            session.main_name ||
            session.club_name ||
            document.querySelector('a[href*="/club/"]')?.textContent ||
            'TrophyManager'
        );

        return {
            clubId,
            clubName,
            logo: clubId ? `/pics/club_logos/${clubId}_140.png` : '',
        };
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
        const path = normalizeHref(window.location.pathname);
        return path || '/home/';
    }

    function injectStyles() {
        if (document.getElementById(`${SCRIPT_KEY}-styles`)) return;

        const style = document.createElement('style');
        style.id = `${SCRIPT_KEY}-styles`;
        style.textContent = `
            :root {
                --tmvu-drawer-width: 272px;
                --tmvu-appbar-height: 68px;
                --tmvu-surface: #1f2822;
                --tmvu-surface-2: #27332c;
                --tmvu-paper: #f5f1e8;
                --tmvu-paper-2: #ece6da;
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
                gap: 16px;
                padding: 0 18px;
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

            .tmvu-brand-logo {
                width: 46px;
                height: 46px;
                border-radius: 0;
                background: rgba(255, 255, 255, 0.08);
                object-fit: contain;
                flex: 0 0 auto;
            }

            .tmvu-brand-mark {
                width: 46px;
                height: 46px;
                display: grid;
                place-items: center;
                border-radius: 0;
                background: linear-gradient(135deg, rgba(138, 170, 96, 0.95), rgba(84, 108, 55, 0.95));
                color: #172014;
                font-weight: 700;
                letter-spacing: 0.08em;
                flex: 0 0 auto;
            }

            .tmvu-brand-copy strong,
            .tmvu-title strong {
                display: block;
                font-size: 15px;
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
                gap: 14px;
                min-width: 0;
            }

            .tmvu-toggle {
                width: 42px;
                height: 42px;
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
                width: 18px;
                height: 2px;
                border-radius: 999px;
                background: #f5f1e8;
            }

            .tmvu-title {
                min-width: 0;
            }

            .tmvu-title span {
                color: var(--tmvu-text-soft);
            }

            .tmvu-title strong {
                max-width: min(54vw, 640px);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: var(--tmvu-text);
                font-size: 18px;
            }

            .tmvu-action-link {
                padding: 11px 14px;
                border-radius: 0;
                background: rgba(32, 42, 34, 0.06);
                color: var(--tmvu-text);
                text-decoration: none;
                letter-spacing: 0.08em;
                transition: background 120ms ease, transform 120ms ease;
            }

            .tmvu-action-link:hover {
                background: rgba(32, 42, 34, 0.1);
                transform: translateY(-1px);
            }

            .tmvu-nav {
                display: flex;
                flex-direction: column;
                gap: 6px;
                overflow: auto;
                padding-right: 4px;
            }

            .tmvu-nav-section {
                display: flex;
                flex-direction: column;
                gap: 0;
            }

            .tmvu-nav-section + .tmvu-nav-section {
                margin-top: 12px;
                padding-top: 14px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .tmvu-nav-caption {
                padding: 0 16px 6px;
                font-size: 11px;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                color: rgba(247, 244, 236, 0.46);
            }

            .tmvu-nav::-webkit-scrollbar {
                width: 5px;
            }

            .tmvu-nav::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.18);
                border-radius: 0;
            }

            .tmvu-link {
                display: flex;
                align-items: center;
                gap: 12px;
                min-height: 46px;
                padding: 0 16px;
                border-radius: 0;
                border-left: 3px solid transparent;
                color: rgba(247, 244, 236, 0.84);
                text-decoration: none;
                transition: background 120ms ease, color 120ms ease, border-color 120ms ease, transform 120ms ease;
            }

            .tmvu-link.tmvu-subitem {
                min-height: 40px;
                padding-left: 28px;
                font-size: 13px;
                color: rgba(247, 244, 236, 0.72);
                border-left-width: 2px;
            }

            .tmvu-link-icon {
                width: 18px;
                height: 18px;
                flex: 0 0 auto;
                background-repeat: no-repeat;
                background-position: center;
                background-size: contain;
                opacity: 0.92;
            }

            .tmvu-link-label {
                flex: 1 1 auto;
                min-width: 0;
            }

            .tmvu-link::before {
                content: '';
                width: 8px;
                height: 8px;
                border-radius: 0;
                background: rgba(255, 255, 255, 0.22);
                flex: 0 0 auto;
            }

            .tmvu-link:hover {
                color: #fff;
                background: rgba(255, 255, 255, 0.08);
                border-left-color: rgba(138, 170, 96, 0.72);
                transform: none;
            }

            .tmvu-link.is-active {
                background: rgba(138, 170, 96, 0.16);
                border-left-color: var(--tmvu-accent-2);
                color: #f7f4ec;
                font-weight: 700;
            }

            .tmvu-link.is-active::before {
                background: var(--tmvu-accent-2);
            }

            .tmvu-link.has-icon::before {
                display: none;
            }

            .tmvu-link.tmvu-subitem::before {
                width: 6px;
                height: 1px;
                background: rgba(247, 244, 236, 0.32);
            }

            .tmvu-link.tmvu-subitem.is-active::before {
                background: var(--tmvu-accent-2);
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

                #tmvu-appbar {
                    left: 0;
                    right: auto;
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

                .tmvu-action-link {
                    display: none;
                }

                .tmvu-title strong {
                    max-width: 52vw;
                    font-size: 16px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function renderShell() {
        if (document.getElementById('tmvu-appbar')) return;

        const links = collectNavLinks();
        const primaryLinks = links.filter(link => link.primary);
        const secondaryLinks = links.filter(link => !link.primary);
        const currentPath = getCurrentPath();
        const clubInfo = getClubInfo();
        const pageTitle = getPageTitle();
        const quickLink = links.find(link => link.href !== currentPath) || DEFAULT_LINKS[0];

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
                    <span>Minimal shell</span>
                    <strong>${clubInfo.clubName}</strong>
                </div>
            </div>
            <nav class="tmvu-nav">
                <div class="tmvu-nav-section">
                    <div class="tmvu-nav-caption">Main</div>
                    ${primaryLinks.map(link => `
                        <a class="tmvu-link${currentPath === link.href ? ' is-active' : ''}${link.icon ? ' has-icon' : ''}" href="${link.href}">
                            ${link.icon ? `<span class="tmvu-link-icon" style="background-image:url('${link.icon}')"></span>` : ''}
                            <span class="tmvu-link-label">${link.label}</span>
                        </a>
                    `).join('')}
                </div>
                <div class="tmvu-nav-section">
                    <div class="tmvu-nav-caption">Mega Menu</div>
                    ${secondaryLinks.map(link => `
                        <a class="tmvu-link tmvu-subitem${currentPath === link.href ? ' is-active' : ''}" href="${link.href}">
                            <span class="tmvu-link-label">${link.label}</span>
                        </a>
                    `).join('')}
                </div>
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
                <div class="tmvu-title">
                    <span>TM Scripts Lab</span>
                    <strong>${pageTitle}</strong>
                </div>
            </div>
            <div class="tmvu-appbar-right">
                <a class="tmvu-action-link" href="${quickLink.href}">${quickLink.label}</a>
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
        window.addEventListener('resize', syncLayoutState);
    }

    function boot() {
        if (!document.body || !document.head) return;
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