(function () {
    'use strict';

    if (window.top !== window.self) return;

    const SCRIPT_KEY = 'tmvu-shell';
    const MOBILE_QUERY = '(max-width: 1100px)';
    const STORAGE_KEY = 'tmvu-shell-open';
    const DEFAULT_LINKS = [
        { href: '/home/', label: 'Home' },
        { href: '/league/', label: 'League' },
        { href: '/matches/', label: 'Matches' },
        { href: '/transfer/', label: 'Transfer' },
        { href: '/players/', label: 'Players' },
        { href: '/squad/', label: 'Squad' },
        { href: '/finances/', label: 'Finances' },
        { href: '/club/', label: 'Club' },
    ];
    const NAV_SELECTORS = [
        '#menu a',
        '.main_menu a',
        '.top_menu a',
        '.menu a',
        '.column1_a a',
        '.sidebar a',
        'nav a',
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
        if (label.length > 32) return false;
        if (href.includes('/logout')) return false;
        if (href.startsWith('/forum') || href.startsWith('/blog')) return false;
        return true;
    }

    function collectNavLinks() {
        const byHref = new Map();

        NAV_SELECTORS.forEach(selector => {
            document.querySelectorAll(selector).forEach(anchor => {
                if (!isUsefulLink(anchor)) return;
                const href = normalizeHref(anchor.getAttribute('href'));
                const label = cleanText(anchor.textContent);
                if (!byHref.has(href)) byHref.set(href, { href, label });
            });
        });

        if (byHref.size < 4) {
            DEFAULT_LINKS.forEach(link => byHref.set(link.href, link));
        }

        return Array.from(byHref.values()).slice(0, 10);
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
                --tmvu-radius: 20px;
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
                left: 0;
                right: 0;
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
                padding: 18px;
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
                padding: 8px 6px 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .tmvu-brand-logo {
                width: 46px;
                height: 46px;
                border-radius: 14px;
                background: rgba(255, 255, 255, 0.08);
                object-fit: contain;
                flex: 0 0 auto;
            }

            .tmvu-brand-mark {
                width: 46px;
                height: 46px;
                display: grid;
                place-items: center;
                border-radius: 14px;
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
                border-radius: 13px;
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
                border-radius: 13px;
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

            .tmvu-nav::-webkit-scrollbar {
                width: 5px;
            }

            .tmvu-nav::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.18);
                border-radius: 999px;
            }

            .tmvu-link {
                display: flex;
                align-items: center;
                gap: 12px;
                min-height: 44px;
                padding: 0 14px;
                border-radius: 14px;
                color: rgba(247, 244, 236, 0.84);
                text-decoration: none;
                transition: background 120ms ease, color 120ms ease, transform 120ms ease;
            }

            .tmvu-link::before {
                content: '';
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.22);
                flex: 0 0 auto;
            }

            .tmvu-link:hover {
                color: #fff;
                background: rgba(255, 255, 255, 0.08);
                transform: translateX(2px);
            }

            .tmvu-link.is-active {
                background: linear-gradient(135deg, rgba(138, 170, 96, 0.92), rgba(94, 121, 62, 0.92));
                color: #162013;
                font-weight: 700;
            }

            .tmvu-link.is-active::before {
                background: #162013;
            }

            .tmvu-footnote {
                margin-top: auto;
                padding: 14px;
                border-radius: 16px;
                background: rgba(255, 255, 255, 0.06);
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
                    right: 0;
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
                ${links.map(link => `
                    <a class="tmvu-link${currentPath === link.href ? ' is-active' : ''}" href="${link.href}">
                        <span>${link.label}</span>
                    </a>
                `).join('')}
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