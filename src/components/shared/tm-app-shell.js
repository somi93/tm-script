const DEFAULT_MENU = [
    {
        title: 'Home',
        link: '/home/',
        icon: '⌂',
        items: [
            { title: 'Home', link: '/home/' },
            { title: 'Club', link: '/club/' },
            { title: 'Finances', link: '/finances/' },
            { title: 'Stadium', link: '/stadium/' },
            { title: 'Account', link: 'https://trophymanager.com/account/' },
        ],
    },
    {
        title: 'Squad',
        link: '/tactics/',
        icon: '⚽',
        items: [
            { title: 'Tactics', link: '/tactics/' },
            { title: 'Players', link: '/players/' },
            { title: 'Youth Development', link: '/youth-development/' },
            { title: 'Training', link: '/training/' },
        ],
    },
    {
        title: 'Friendlies',
        link: '/quickmatch/',
        icon: '✦',
        items: [
            { title: 'Quick Match', link: '/quickmatch/' },
            { title: 'Friendly league', link: '/friendly-league/' },
        ],
    },
    {
        title: 'Tournaments',
        link: '/league/',
        icon: '🏆',
        items: [
            { title: 'League', link: '/league/' },
            { title: 'Cup', link: '/cup/' },
            { title: 'International cup', link: '/international-cup/' },
            { title: 'National teams', link: '/national-teams/' },
        ],
    },
    {
        title: 'Transfer',
        link: '/transfer/',
        icon: '⇄',
        items: [
            { title: 'Transfer', link: '/transfer/' },
            { title: 'Shortlist', link: '/shortlist/' },
            { title: 'Bids', link: '/bids/' },
            { title: 'Scouts', link: '/scouts/' },
        ],
    },
    {
        title: 'Community',
        link: '/forum/',
        icon: '☰',
        items: [
            { title: 'Forum', link: '/forum/' },
            { title: 'User Guide', link: '/user-guide/' },
            { title: 'About TM', link: '/about-tm/' },
            { title: 'Teamsters', link: '/teamsters/' },
        ],
    },
    {
        title: 'Pro',
        link: '/buy-pro/',
        icon: '★',
        items: [
            { title: 'Buy pro', link: '/buy-pro/' },
            { title: 'About pro', link: '/about-pro/' },
            { title: 'Donations', link: '/donations/' },
            { title: 'Support', link: '/support-pro/' },
        ],
    },
];

const HIDDEN_SELECTORS = [
    '#top_menu',
    '#top_menu_sub',
    '.body_foot',
    '.link_area',
    '.body_end',
];

let stylesInjected = false;
let clockTimer = null;

const normalizeHref = (href, https = false) => {
    if (!href) return '/';
    if (/^https?:\/\//i.test(href)) return href;
    const prefix = https ? 'https://trophymanager.com' : '';
    if (href.startsWith('/')) return prefix + href;
    return prefix + '/' + href.replace(/^\/+/, '') + (href.endsWith('/') ? '' : '/');
};

const stripOrigin = href => {
    try {
        const url = new URL(href, location.origin);
        return url.pathname.replace(/\/+$/, '/') || '/';
    } catch {
        return href;
    }
};

const isActiveLink = href => {
    const current = stripOrigin(location.pathname);
    const target = stripOrigin(href);
    if (target === '/') return current === '/';
    return current === target || current.startsWith(target);
};

const fmtMoney = value => {
    const amount = Number(value || 0);
    return Number.isFinite(amount) ? new Intl.NumberFormat('en-US').format(amount) : '0';
};

const initials = (text) => {
    const parts = String(text || 'TM').trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'TM';
};

const extractPageTitle = () => {
    const head = document.querySelector('.main_center .box_head h2');
    if (head?.textContent?.trim()) return head.textContent.trim();
    const title = document.title.replace(/\s*-\s*Trophy Manager\s*$/i, '').trim();
    return title || 'Dashboard';
};

const findClubLogoSrc = () => {
    const mainId = window.SESSION?.main_id;
    const selectors = [
        mainId ? `img[src*="/club_logos/${mainId}_"]` : null,
        '.column1 img[class*="club_logo"]',
        '.column2_a img[class*="club_logo"]',
        'img.club_logo',
    ].filter(Boolean);
    for (const selector of selectors) {
        const img = document.querySelector(selector);
        if (img?.src) return img.src;
    }
    return '';
};

const getMenuData = () => {
    const data = window.top_menu?.vars?.menu_data;
    if (!Array.isArray(data) || !data.length) return DEFAULT_MENU;
    return data.map(group => ({
        title: group.title,
        link: normalizeHref(group.link, group.https),
        icon: DEFAULT_MENU.find(item => item.title === group.title)?.icon || '•',
        items: Array.isArray(group.items)
            ? group.items.map(item => ({ title: item.title, link: normalizeHref(item.link, item.https) }))
            : [],
    }));
};

const buildNav = () => getMenuData().map(group => {
    const groupActive = isActiveLink(group.link) || group.items.some(item => isActiveLink(item.link));
    const items = group.items.map(item => `
        <a class="tmapp-nav-link${isActiveLink(item.link) ? ' is-active' : ''}" href="${item.link}">${item.title}</a>
    `).join('');

    return `
        <section class="tmapp-nav-group${groupActive ? ' is-active' : ''}">
            <a class="tmapp-nav-group-link" href="${group.link}">
                <span class="tmapp-nav-icon">${group.icon}</span>
                <span>${group.title}</span>
            </a>
            <div class="tmapp-nav-links">${items}</div>
        </section>
    `;
}).join('');

const buildClubMedia = (clubName, logoSrc) => {
    if (logoSrc) return `<img class="tmapp-club-logo" src="${logoSrc}" alt="${clubName}">`;
    return `<div class="tmapp-club-fallback">${initials(clubName)}</div>`;
};

const buildShellMarkup = () => {
    const clubName = window.SESSION?.clubname || 'Your Club';
    const season = window.SESSION?.season || '—';
    const cash = fmtMoney(window.SESSION?.cash);
    const proDays = window.SESSION?.pro_days ?? '—';
    const country = (window.SESSION?.country || '').toUpperCase() || 'TM';
    const logoSrc = findClubLogoSrc();
    const pageTitle = extractPageTitle();

    return `
        <div id="tmapp-backdrop"></div>
        <aside id="tmapp-drawer">
            <div class="tmapp-brand">
                <div class="tmapp-brand-mark">TM</div>
                <div>
                    <div class="tmapp-brand-title">TM Scripts</div>
                    <div class="tmapp-brand-subtitle">Navigation Drawer</div>
                </div>
            </div>

            <section class="tmapp-club-card">
                <div class="tmapp-club-media">${buildClubMedia(clubName, logoSrc)}</div>
                <div class="tmapp-club-copy">
                    <div class="tmapp-kicker">Season ${season}</div>
                    <div class="tmapp-club-name">${clubName}</div>
                    <div class="tmapp-club-meta">${country} league club</div>
                </div>
                <div class="tmapp-club-stats">
                    <div class="tmapp-stat">
                        <span class="tmapp-stat-label">Cash</span>
                        <span class="tmapp-stat-value">${cash}</span>
                    </div>
                    <div class="tmapp-stat">
                        <span class="tmapp-stat-label">Pro Days</span>
                        <span class="tmapp-stat-value">${proDays}</span>
                    </div>
                </div>
            </section>

            <nav class="tmapp-nav">${buildNav()}</nav>

            <div class="tmapp-drawer-footer">
                <a href="/forum/" class="tmapp-mini-link">Forum</a>
                <a href="/user-guide/" class="tmapp-mini-link">Guide</a>
                <a href="https://trophymanager.com/account/" class="tmapp-mini-link">Account</a>
            </div>
        </aside>

        <header id="tmapp-topbar">
            <button id="tmapp-toggle" type="button" aria-label="Toggle navigation">☰</button>
            <div class="tmapp-topbar-copy">
                <div class="tmapp-topbar-kicker">Trophy Manager Workspace</div>
                <div class="tmapp-topbar-title">${pageTitle}</div>
            </div>
            <div class="tmapp-topbar-meta">
                <span class="tmapp-pill">Season ${season}</span>
                <span class="tmapp-pill">${country}</span>
                <span class="tmapp-clock" id="tmapp-clock">--:--:--</span>
            </div>
        </header>

        <footer id="tmapp-footer">
            <div class="tmapp-footer-left">TM Scripts layout shell</div>
            <div class="tmapp-footer-center">Keep the content, replace the chrome.</div>
            <div class="tmapp-footer-right"><a href="/?logout">Log out</a></div>
        </footer>
    `;
};

const injectStyles = () => {
    if (stylesInjected) return;
    stylesInjected = true;
    const style = document.createElement('style');
    style.id = 'tm-app-shell-style';
    style.textContent = `
        :root {
            --tmapp-drawer-width: 292px;
            --tmapp-shell-gap: 16px;
            --tmapp-topbar-height: 74px;
            --tmapp-footer-height: 54px;
            --tmapp-bg: #224b0f;
            --tmapp-panel: rgba(8, 20, 5, 0.9);
            --tmapp-panel-soft: rgba(22, 45, 12, 0.88);
            --tmapp-border: rgba(108, 192, 64, 0.22);
            --tmapp-text: #d8edc0;
            --tmapp-muted: #8fb26a;
            --tmapp-accent: #9fe870;
            --tmapp-shadow: 0 18px 48px rgba(0, 0, 0, 0.3);
        }

        html.tm-app-shell-html,
        body.tm-app-shell-body {
            min-height: 100%;
            background:
                radial-gradient(circle at top left, rgba(180, 255, 120, 0.12), transparent 24%),
                linear-gradient(180deg, #336d15 0%, #295513 18%, #1d3c0f 100%);
        }

        body.tm-app-shell-body {
            position: relative;
            color: var(--tmapp-text);
        }

        body.tm-app-shell-body::before {
            content: '';
            position: fixed;
            inset: 0;
            background-image:
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 22px 22px;
            opacity: 0.08;
            pointer-events: none;
            z-index: 0;
        }

        body.tm-app-shell-body ${HIDDEN_SELECTORS.join(', body.tm-app-shell-body ')} {
            display: none !important;
        }

        #tmapp-drawer,
        #tmapp-topbar,
        #tmapp-footer {
            font-family: Georgia, 'Times New Roman', serif;
            z-index: 1000;
        }

        #tmapp-drawer {
            position: fixed;
            left: 14px;
            top: 14px;
            bottom: 14px;
            width: var(--tmapp-drawer-width);
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 18px;
            border: 1px solid var(--tmapp-border);
            border-radius: 24px;
            background: linear-gradient(180deg, rgba(10, 24, 6, 0.96), rgba(16, 38, 8, 0.9));
            box-shadow: var(--tmapp-shadow);
            backdrop-filter: blur(12px);
            overflow: auto;
        }

        #tmapp-topbar {
            position: fixed;
            top: 14px;
            left: calc(var(--tmapp-drawer-width) + 28px);
            right: 14px;
            min-height: var(--tmapp-topbar-height);
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 14px 18px;
            border: 1px solid var(--tmapp-border);
            border-radius: 22px;
            background: linear-gradient(180deg, rgba(14, 31, 8, 0.92), rgba(16, 39, 9, 0.86));
            box-shadow: var(--tmapp-shadow);
            backdrop-filter: blur(12px);
        }

        #tmapp-footer {
            position: fixed;
            left: calc(var(--tmapp-drawer-width) + 28px);
            right: 14px;
            bottom: 14px;
            min-height: var(--tmapp-footer-height);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 12px 18px;
            border: 1px solid var(--tmapp-border);
            border-radius: 22px;
            background: linear-gradient(180deg, rgba(10, 22, 5, 0.9), rgba(14, 28, 7, 0.88));
            box-shadow: var(--tmapp-shadow);
            backdrop-filter: blur(10px);
            font-size: 12px;
            color: var(--tmapp-muted);
        }

        #tmapp-footer a {
            color: var(--tmapp-text);
            text-decoration: none;
        }

        #tmapp-toggle {
            display: none;
            width: 42px;
            height: 42px;
            border: 1px solid var(--tmapp-border);
            border-radius: 12px;
            background: rgba(255,255,255,0.04);
            color: var(--tmapp-text);
            cursor: pointer;
            font-size: 20px;
        }

        #tmapp-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.18s ease;
            z-index: 999;
        }

        .tmapp-brand {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .tmapp-brand-mark {
            width: 48px;
            height: 48px;
            display: grid;
            place-items: center;
            border-radius: 16px;
            background: linear-gradient(135deg, rgba(159,232,112,0.22), rgba(255,255,255,0.04));
            border: 1px solid rgba(159,232,112,0.28);
            font-size: 18px;
            font-weight: 700;
            color: var(--tmapp-accent);
        }

        .tmapp-brand-title {
            font-size: 20px;
            font-weight: 700;
            color: #f2f9e8;
        }

        .tmapp-brand-subtitle,
        .tmapp-topbar-kicker,
        .tmapp-kicker,
        .tmapp-stat-label {
            font-size: 10px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--tmapp-muted);
        }

        .tmapp-club-card {
            padding: 16px;
            border-radius: 20px;
            background: linear-gradient(180deg, rgba(33, 70, 19, 0.5), rgba(14, 29, 7, 0.55));
            border: 1px solid rgba(159,232,112,0.18);
        }

        .tmapp-club-media {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 14px;
        }

        .tmapp-club-logo,
        .tmapp-club-fallback {
            width: 72px;
            height: 72px;
            border-radius: 20px;
            object-fit: cover;
            border: 1px solid rgba(159,232,112,0.24);
            background: rgba(255,255,255,0.04);
        }

        .tmapp-club-fallback {
            display: grid;
            place-items: center;
            font-size: 24px;
            font-weight: 700;
            color: var(--tmapp-accent);
        }

        .tmapp-club-copy {
            text-align: center;
            margin-bottom: 14px;
        }

        .tmapp-club-name {
            font-size: 24px;
            line-height: 1.1;
            color: #f2f9e8;
            margin-top: 6px;
        }

        .tmapp-club-meta {
            color: var(--tmapp-muted);
            font-size: 12px;
            margin-top: 4px;
        }

        .tmapp-club-stats {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
        }

        .tmapp-stat {
            padding: 10px 12px;
            border-radius: 14px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.05);
        }

        .tmapp-stat-value {
            display: block;
            margin-top: 4px;
            font-size: 16px;
            font-weight: 700;
            color: #f2f9e8;
        }

        .tmapp-nav {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .tmapp-nav-group {
            padding: 10px;
            border-radius: 18px;
            background: rgba(255,255,255,0.03);
            border: 1px solid transparent;
        }

        .tmapp-nav-group.is-active {
            border-color: rgba(159,232,112,0.18);
            background: rgba(159,232,112,0.06);
        }

        .tmapp-nav-group-link,
        .tmapp-nav-link,
        .tmapp-mini-link {
            color: var(--tmapp-text);
            text-decoration: none;
        }

        .tmapp-nav-group-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 10px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
        }

        .tmapp-nav-group-link:hover,
        .tmapp-nav-link:hover,
        .tmapp-mini-link:hover {
            background: rgba(255,255,255,0.05);
            color: #f2f9e8;
        }

        .tmapp-nav-icon {
            width: 24px;
            color: var(--tmapp-accent);
            text-align: center;
        }

        .tmapp-nav-links {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px;
            padding-top: 8px;
        }

        .tmapp-nav-link {
            display: block;
            padding: 8px 10px;
            border-radius: 12px;
            font-size: 12px;
            color: var(--tmapp-muted);
        }

        .tmapp-nav-link.is-active {
            background: linear-gradient(135deg, rgba(159,232,112,0.18), rgba(255,255,255,0.03));
            color: #f2f9e8;
            box-shadow: inset 0 0 0 1px rgba(159,232,112,0.18);
        }

        .tmapp-drawer-footer {
            margin-top: auto;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .tmapp-mini-link,
        .tmapp-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 8px 12px;
            border-radius: 999px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.06);
            font-size: 11px;
            color: var(--tmapp-muted);
        }

        .tmapp-topbar-copy {
            min-width: 0;
        }

        .tmapp-topbar-title {
            font-size: 28px;
            line-height: 1.05;
            color: #f4faec;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .tmapp-topbar-meta {
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }

        .tmapp-clock {
            min-width: 82px;
            text-align: center;
            font-variant-numeric: tabular-nums;
            color: #f2f9e8;
        }

        body.tm-app-shell-body .main_center {
            position: relative;
            z-index: 1;
            width: auto !important;
            max-width: none !important;
            margin-left: calc(var(--tmapp-drawer-width) + 28px) !important;
            margin-right: 14px !important;
            margin-top: 0 !important;
            padding-top: calc(var(--tmapp-topbar-height) + 26px) !important;
            padding-bottom: calc(var(--tmapp-footer-height) + 28px) !important;
            box-sizing: border-box;
        }

        body.tm-app-shell-body .main_center > .notice_box,
        body.tm-app-shell-body .main_center > .box {
            position: relative;
            z-index: 1;
        }

        @media (max-width: 1180px) {
            body.tm-app-shell-body .main_center {
                margin-left: calc(var(--tmapp-drawer-width) + 22px) !important;
            }

            .tmapp-nav-links {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 980px) {
            #tmapp-toggle {
                display: inline-grid;
                place-items: center;
            }

            #tmapp-drawer {
                left: 0;
                top: 0;
                bottom: 0;
                border-radius: 0 24px 24px 0;
                transform: translateX(calc(-100% - 18px));
                transition: transform 0.2s ease;
            }

            body.tm-app-shell-body.tm-app-nav-open #tmapp-drawer {
                transform: translateX(0);
            }

            body.tm-app-shell-body.tm-app-nav-open #tmapp-backdrop {
                opacity: 1;
                pointer-events: auto;
            }

            #tmapp-topbar,
            #tmapp-footer,
            body.tm-app-shell-body .main_center {
                left: auto;
                margin-left: 14px !important;
            }

            #tmapp-topbar,
            #tmapp-footer {
                right: 14px;
                left: 14px;
            }

            .tmapp-topbar-title {
                font-size: 22px;
            }
        }

        @media (max-width: 720px) {
            #tmapp-topbar,
            #tmapp-footer {
                border-radius: 18px;
                padding: 12px 14px;
            }

            #tmapp-footer {
                display: grid;
                grid-template-columns: 1fr;
                gap: 4px;
                text-align: center;
            }

            .tmapp-topbar-meta {
                width: 100%;
                margin-left: 0;
            }
        }
    `;
    document.head.appendChild(style);
};

const bindEvents = () => {
    const toggle = document.getElementById('tmapp-toggle');
    const backdrop = document.getElementById('tmapp-backdrop');
    const close = () => document.body.classList.remove('tm-app-nav-open');
    const open = () => document.body.classList.add('tm-app-nav-open');

    toggle?.addEventListener('click', () => {
        if (document.body.classList.contains('tm-app-nav-open')) close();
        else open();
    });

    backdrop?.addEventListener('click', close);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') close();
    });
};

const startClock = () => {
    if (clockTimer) return;
    const target = document.getElementById('tmapp-clock');
    if (!target) return;

    const sync = () => {
        const source = document.getElementById('tm_clock');
        const value = source?.textContent?.trim();
        if (value) {
            target.textContent = value;
            return;
        }
        target.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
    };

    sync();
    clockTimer = window.setInterval(sync, 1000);
};

const mount = () => {
    if (document.getElementById('tmapp-drawer')) return;
    if (!document.body || !document.querySelector('.main_center')) return;

    injectStyles();
    document.documentElement.classList.add('tm-app-shell-html');
    document.body.classList.add('tm-app-shell-body');

    const shell = document.createElement('div');
    shell.id = 'tmapp-shell';
    shell.innerHTML = buildShellMarkup();
    document.body.prepend(shell);

    bindEvents();
    startClock();
};

export const TmAppShell = { mount };