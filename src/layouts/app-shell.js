import { getDefaultHeaderGroups, getHeaderGroupMeta, TmAppShellHeader } from '../components/shared/tm-app-shell-header.js';
import { createAppShellPmController } from '../components/shared/tm-app-shell-pm.js';
import { ensureTmTheme } from '../components/shared/tm-theme.js';
import { TmThemeDialog } from '../components/shared/tm-theme-dialog.js';
import { initBidsPage } from '../pages/bids.js';
import { initFinancesMaintenancePage } from '../pages/finances-maintenance.js';
import { initFinancesPage } from '../pages/finances.js';
import { initFinancesWagesPage } from '../pages/finances-wages.js';
import { initFriendlyLeaguePage } from '../pages/friendly-league.js';
import { initQuickmatchPage } from '../pages/quickmatch.js';
import { initScoutsPage } from '../pages/scouts.js';
import { initScoutsHirePage } from '../pages/scouts-hire.js';
import { initSponsorsPage } from '../pages/sponsors.js';
import { initTrainingPage } from '../pages/training.js';
import { initYouthDevelopmentPage } from '../pages/youth-development.js';
import { initShortlistPage } from '../pages/shortlist.js';
import { initSquadPage } from '../pages/squad.js';
import { initHistoryPage } from '../pages/history.js';
import { initClubPage } from '../pages/club.js';
import { initFixturesPage } from '../pages/fixtures.js';
import { initStatsPage } from '../pages/stats.js';
import { initTransferPage } from '../pages/transfer.js';
import { initLeaguePage } from '../pages/league.js';
import { initMatchPage } from '../pages/match.js';
import { initCupPage } from '../pages/cup.js';
import { initHomePage } from '../pages/home.js';
import { initInternationalCupPage } from '../pages/international-cup.js';
import { initForumPage } from '../pages/forum.js';
import { initImportPage } from '../pages/import.js';
import { initTeamstersPage } from '../pages/teamsters.js';
import { initAboutTmPage } from '../pages/about-tm.js';
import { initAboutProPage } from '../pages/about-pro.js';
import { initBuyProPage } from '../pages/buy-pro.js';
import { initFreeProPage } from '../pages/free-pro.js';
import { initDonationsPage } from '../pages/donations.js';
import { initUserGuidePage } from '../pages/user-guide.js';
import { initInternationalCupCoefficientsPage } from '../pages/international-cup-coefficients.js';
import { initInternationalCupStatisticsPage } from '../pages/international-cup-statistics.js';
import { initDbInspectPage } from '../pages/dbinspect.js';
import { initDbRepairPage } from '../pages/dbrepair.js';
import { initNationalTeamsRankingsPage } from '../pages/national-teams-rankings.js';
import { initNationalTeamsFixturesPage } from '../pages/national-teams-fixtures.js';
import { initNationalTeamsHistoryPage } from '../pages/national-teams-history.js';
import { initNationalTeamsStatisticsPage } from '../pages/national-teams-statistics.js';
import { initNationalTeamsElectionPage } from '../pages/national-teams-election.js';
import { initNationalTeamsRegionPage } from '../pages/national-teams-region.js';
import { initNationalTeamsPage } from '../pages/national-teams.js';
import { initSupportProPage } from '../pages/support-pro.js';
import { initPlayerPage } from '../pages/player.js';
import { initTacticsPage } from '../pages/tactics.js';

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

function getInitialOpenGroup() {
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
        newPms: Number(session.new_pms || 0),
        newFeed: Number(session.new_feed || 0),
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
        mainCenter.style.display = 'none';
        if (mainCenter.id === 'cookies_disabled_message') {
            mainCenter.remove();
        }
    });
}

function injectStyles() {
    ensureTmTheme();

    if (document.getElementById('tmvu-shell-styles')) return;

    const style = document.createElement('style');
    style.id = 'tmvu-shell-styles';
    style.textContent = `
        :root {
            --tmvu-header-height: 140px;
            --tmvu-surface: var(--tmu-surface-card-soft);
            --tmvu-surface-2: var(--tmu-surface-header);
            --tmvu-surface-3: var(--tmu-surface-card);
            --tmvu-border: var(--tmu-border-soft-alpha);
            --tmvu-text: var(--tmu-text-main);
            --tmvu-text-soft: var(--tmu-text-muted);
            --tmvu-text-inverse: var(--tmu-text-inverse);
            --tmvu-accent: var(--tmu-accent);
            --tmvu-accent-soft: var(--tmu-surface-nav-pill-active);
            --tmvu-font: "IBM Plex Sans", "Segoe UI", sans-serif;
        }

        .main_center{
            display: none !important;
        }
        body.tmvu-shell-active {
            margin: 0 !important;
            padding-top: var(--tmvu-header-height) !important;
            background-image: none !important;
            background-color: var(--tmu-surface-panel) !important;
            background: var(--tmu-surface-panel) !important;
            color: var(--tmvu-text) !important;
            font-family: var(--tmvu-font) !important;
            font-size: var(--tmu-font-sm) !important;
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
            margin: var(--tmu-space-lg) auto !important;
            display: flex;
            gap: var(--tmu-space-lg);
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
            background: var(--tmu-color-accent);
            color: var(--tmvu-text-inverse);
            border-bottom: 1px solid var(--tmu-border-header);
            box-shadow: inset 0 -1px 0 var(--tmu-shadow-ring);
            z-index: 9999;
        }

        .tmvu-header-shell {
            width: min(1250px, calc(100% - 24px));
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            position: relative;
            padding-bottom: 0;
        }

        .tmvu-header-top {
            min-height: 80px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--tmu-space-lg);
            padding: var(--tmu-space-sm) 0 var(--tmu-space-sm);
        }

        .tmvu-brand {
            display: flex;
            align-items: center;
            gap: var(--tmu-space-md);
            min-width: 0;
            color: inherit;
            text-decoration: none;
            padding: var(--tmu-space-xs) var(--tmu-space-sm);
            border-radius: var(--tmu-space-sm);
            background: transparent;
            border: 1px solid transparent;
            transition: background .15s ease, border-color .15s ease;
        }

        .tmvu-brand:hover {
            text-decoration: none;
            background: var(--tmu-surface-dark-soft);
            border-color: transparent;
        }

        .tmvu-brand-logo,
        .tmvu-brand-mark {
            width: 72px;
            height: 72px;
            flex: 0 0 auto;
            display: grid;
            place-items: center;
            border-radius: var(--tmu-space-sm);
        }

        .tmvu-brand-logo {
            object-fit: cover;
            box-shadow: none;
        }

        .tmvu-brand-mark {
            color: var(--tmvu-accent);
            background: var(--tmvu-surface-3);
            font-size: var(--tmu-font-lg);
            font-weight: 700;
            letter-spacing: 0.08em;
            box-shadow: none;
        }

        .tmvu-brand-copy {
            min-width: 0;
        }

        .tmvu-brand-copy strong {
            display: block;
            font-size: var(--tmu-font-2xl);
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
            gap: var(--tmu-font-xs);
            min-width: 0;
            padding-right: 44px;
        }

        .tmvu-header-fab {
            position: fixed;
            top: 6px;
            right: 8px;
            width: 32px;
            height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            border-radius: var(--tmu-space-sm);
            border: 1px solid var(--tmu-border-soft-alpha-mid);
            background: var(--tmu-surface-card-soft);
            color: var(--tmu-text-main);
            text-decoration: none;
            box-shadow: none;
            z-index: 10040;
        }

        .tmvu-header-fab:hover {
            background: var(--tmu-surface-item-strong);
            color: var(--tmu-text-inverse);
        }

        .tmvu-header-fab.is-active {
            background: var(--tmu-success-fill-strong);
            border-color: var(--tmu-border-embedded);
            color: var(--tmu-text-inverse);
        }

        .tmvu-theme-fab {
            right: 44px;
            cursor: pointer;
        }

        .tmvu-brand-metrics {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 6px;
        }

        .tmvu-nav-wrap {
            display: flex;
            flex-direction: column;
            border-top: 1px solid var(--tmu-border-header);
        }

        .tmvu-metric-icon {
            width: 13px;
            height: 13px;
            display: inline-block;
            flex: 0 0 auto;
            background-color: currentColor;
            -webkit-mask-position: center;
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-size: contain;
            mask-position: center;
            mask-repeat: no-repeat;
            mask-size: contain;
        }

        .tmvu-metric-icon::before,
        .tmvu-metric-icon::after {
            content: none;
        }

        .tmvu-metric-icon-pro {
            color: var(--tmu-success-strong);
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23000' d='M8 1.2l1.72 3.48 3.84.56-2.78 2.71.66 3.83L8 10.02 4.56 11.8l.66-3.83L2.44 5.26l3.84-.56z'/%3E%3C/svg%3E");
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23000' d='M8 1.2l1.72 3.48 3.84.56-2.78 2.71.66 3.83L8 10.02 4.56 11.8l.66-3.83L2.44 5.26l3.84-.56z'/%3E%3C/svg%3E");
        }

        .tmvu-metric-icon-cash {
            color: var(--tmu-warning);
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round' d='M8 1.5v13M10.6 4.1c-.58-.5-1.44-.85-2.6-.85-1.93 0-3.1.93-3.1 2.24 0 3.03 6.2 1.47 6.2 4.75 0 1.42-1.28 2.5-3.24 2.5-1.3 0-2.45-.38-3.25-1.06'/%3E%3C/svg%3E");
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round' d='M8 1.5v13M10.6 4.1c-.58-.5-1.44-.85-2.6-.85-1.93 0-3.1.93-3.1 2.24 0 3.03 6.2 1.47 6.2 4.75 0 1.42-1.28 2.5-3.24 2.5-1.3 0-2.45-.38-3.25-1.06'/%3E%3C/svg%3E");
        }

        .tmvu-metric-icon-mail {
            color: var(--tmu-info-strong);
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect x='2' y='3.2' width='12' height='9.2' rx='1.8' fill='none' stroke='%23000' stroke-width='1.4'/%3E%3Cpath d='M3 4.4l5 4 5-4' fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect x='2' y='3.2' width='12' height='9.2' rx='1.8' fill='none' stroke='%23000' stroke-width='1.4'/%3E%3Cpath d='M3 4.4l5 4 5-4' fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        }

        .tmvu-metric-icon-feed {
            color: var(--tmu-purple);
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round' d='M8 2.2a3 3 0 0 1 3 3c0 2 1 2.8 1.7 3.45.24.22.3.58.17.87-.13.28-.42.46-.73.46H3.8c-.31 0-.6-.18-.73-.46a.8.8 0 0 1 .17-.87C3.98 8 5 7.2 5 5.2a3 3 0 0 1 3-3Zm-1.8 10.2h3.6A1.8 1.8 0 0 1 8 14a1.8 1.8 0 0 1-1.8-1.6Z'/%3E%3C/svg%3E");
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round' d='M8 2.2a3 3 0 0 1 3 3c0 2 1 2.8 1.7 3.45.24.22.3.58.17.87-.13.28-.42.46-.73.46H3.8c-.31 0-.6-.18-.73-.46a.8.8 0 0 1 .17-.87C3.98 8 5 7.2 5 5.2a3 3 0 0 1 3-3Zm-1.8 10.2h3.6A1.8 1.8 0 0 1 8 14a1.8 1.8 0 0 1-1.8-1.6Z'/%3E%3C/svg%3E");
        }

        .tmvu-nav-primary {
            display: flex;
            align-items: center;
            gap: var(--tmu-space-sm);
            padding: var(--tmu-space-sm) 0 var(--tmu-space-sm);
            overflow-x: auto;
            overflow-y: hidden;
        }

        .tmvu-nav-secondary {
            display: none;
        }

        .tmvu-nav-secondary.has-open {
            display: block;
            min-height: 36px;
            padding: 0;
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
            background: var(--tmu-surface-nav-pill);
            color: var(--tmu-text-muted);
            cursor: pointer;
            text-align: left;
            white-space: nowrap;
            text-decoration: none;
            border-radius: 0;
            font-weight: 700;
            transition: background .15s ease, color .15s ease, border-color .15s ease;
        }

        .tmvu-menu-trigger:hover {
            background: var(--tmu-surface-item-dark);
            color: var(--tmu-text-strong);
        }

        .tmvu-menu-group.is-open .tmvu-menu-trigger,
        .tmvu-menu-group.is-current .tmvu-menu-trigger {
            background: var(--tmu-surface-item-strong);
            border-bottom-color: var(--tmvu-accent);
            color: var(--tmu-text-inverse);
        }

        .tmvu-group-label {
            font-size: var(--tmu-font-sm);
            font-weight: 700;
            white-space: nowrap;
        }

        .tmvu-subitem {
            min-height: 36px;
            display: flex;
            align-items: center;
            gap: var(--tmu-space-sm);
            padding: 0 11px;
            color: var(--tmu-text-muted);
            text-decoration: none;
            border-bottom: 2px solid transparent;
            border-radius: 0;
            white-space: nowrap;
            flex: 0 0 auto;
            background: var(--tmu-surface-nav-pill);
            transition: background .15s ease, color .15s ease, border-color .15s ease;
        }

        .tmvu-subitem:hover {
            background: var(--tmu-surface-item-dark);
            color: var(--tmu-text-inverse);
        }

        .tmvu-subitem.is-active {
            color: var(--tmu-text-inverse);
            background: var(--tmu-surface-item-strong);
            border-bottom-color: var(--tmvu-accent);
        }

        .tmvu-subitem-label {
            font-size: var(--tmu-font-sm);
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
            min-height: 25px;
            padding: 0 var(--tmu-space-sm);
            border: 1px solid var(--tmu-border-soft-alpha);
            border-radius: 999px;
            background: var(--tmu-surface-dark-soft);
            box-shadow: inset 0 1px 0 var(--tmu-border-contrast);
        }

        .tmvu-metric--pro {
            border-color: var(--tmu-border-success);
        }

        .tmvu-metric--cash {
            border-color: var(--tmu-border-warning);
        }

        .tmvu-metric--pm {
            border-color: var(--tmu-border-info);
        }

        .tmvu-metric--alerts {
            border-color: var(--tmu-border-accent);
        }

        .tmvu-metric-link {
            color: inherit;
            text-decoration: none;
            cursor: pointer;
            transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }

        .tmvu-metric-link:hover,
        .tmvu-metric-link:focus-visible {
            background: var(--tmu-surface-item-dark);
            border-color: var(--tmu-border-pill-active);
            color: var(--tmu-text-inverse);
        }

        .tmvu-metric-link:focus-visible {
            outline: 1px solid var(--tmu-border-input-overlay);
            outline-offset: 1px;
        }

        .tmvu-metric-label {
            font-size: var(--tmu-font-2xs);
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--tmvu-text-soft);
        }

        .tmvu-metric-value {
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            color: var(--tmvu-text-inverse);
        }

        .tmvu-icon {
            width: 16px;
            height: 16px;
            flex: 0 0 auto;
               color: inherit;
               text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: currentColor;
            font-size: var(--tmu-font-md);
            line-height: 1;
            transform: translateY(-0.5px);
        }
    `;
    document.head.appendChild(style);
}

function initCurrentPage() {
    const main = document.querySelector('.tmvu-main');
    if (!main) return;

    const currentPath = normalizeHref(window.location.pathname) || '/home/';
    if (/^\/bids\/?$/i.test(currentPath)) {
        initBidsPage(main);
        return;
    }
    if (/^\/quickmatch(?:\/complete-standings(?:\/[^/]+)?)?\/?$/i.test(currentPath)) {
        initQuickmatchPage(main);
        return;
    }
    if (/^\/finances\/maintenance\/?$/i.test(currentPath)) {
        initFinancesMaintenancePage(main);
        return;
    }
    if (/^\/finances\/wages\/?$/i.test(currentPath)) {
        initFinancesWagesPage(main);
        return;
    }
    if (/^\/finances\/?$/i.test(currentPath)) {
        initFinancesPage(main);
        return;
    }
    if (/^(?:\/friendly-league(?:\/\d+)?|\/fixtures\/friendly-league\/\d+|\/statistics\/friendly-league\/\d+(?:\/[^/]+)?|\/history\/friendly-league\/(?:standings|matches)(?:\/.+)?)\/?$/i.test(currentPath)) {
        initFriendlyLeaguePage(main);
        return;
    }
    if (/^\/sponsors\/?$/i.test(currentPath)) {
        initSponsorsPage(main);
        return;
    }
    if (/^\/scouts\/?$/i.test(currentPath)) {
        initScoutsPage(main);
        return;
    }
    if (/^\/scouts\/hire\/?$/i.test(currentPath)) {
        initScoutsHirePage(main);
        return;
    }
    if (/^\/training\/?$/i.test(currentPath)) {
        initTrainingPage(main);
        return;
    }
    if (/^\/tactics(?:\/reserves)?\/?$/i.test(currentPath)) {
        initTacticsPage(main);
        return;
    }
    if (/^\/youth-development(?:\/.*)?$/i.test(currentPath)) {
        initYouthDevelopmentPage(main);
    }
    if (/^\/club\/\d+\/squad\/?$/i.test(currentPath)) {
        initSquadPage(main);
        return;
    }
    if (/^\/shortlist\/?$/i.test(currentPath)) {
        initShortlistPage(main);
    }
    if (/^\/history\/club\//i.test(currentPath)) {
        initHistoryPage(main);
    }
    if (/^\/club(?:\/\d+(?:\/(?:overview\/)?)?)?\/?$/i.test(currentPath)) {
        initClubPage(main);
    }
    if (/^\/fixtures\/club\/\d+\/?$/i.test(currentPath)) {
        initFixturesPage(main);
    }
    if (/^\/fixtures\/national-teams\/[a-z]{2,3}\/?$/i.test(currentPath)) {
        initNationalTeamsFixturesPage(main);
    }
    if (/^\/history\/national-teams\/[a-z]{2,3}\/?$/i.test(currentPath)) {
        initNationalTeamsHistoryPage(main);
    }
    if (/^\/statistics\/club\/\d+\/?$/i.test(currentPath)) {
        initStatsPage(main);
    }
    if (/^\/statistics\/national-teams\/[a-z]{2,3}(?:\/players\/[^/]+)?\/?$/i.test(currentPath)) {
        initNationalTeamsStatisticsPage(main);
    }
    if (/^\/transfer\/?$/i.test(currentPath)) {
        initTransferPage(main);
    }
    if (/^\/league\//.test(currentPath)) {
        initLeaguePage(main);
    }
    if (/^\/matches\/\d+/.test(currentPath)) {
        initMatchPage(main);
    }
    if (/^\/cup\/?$/i.test(currentPath)) {
        initCupPage(main);
    }
    if (/^\/home\/?$/i.test(currentPath)) {
        initHomePage(main);
    }
    if (/^\/international-cup(?:\/\d+)?\/?$/i.test(currentPath)) {
        initInternationalCupPage(main);
    }
    if (/^\/forum\//i.test(currentPath)) {
        initForumPage(main);
    }
    if (/^\/import\/?$/i.test(currentPath)) {
        initImportPage(main);
    }
    if (/^\/teamsters\//i.test(currentPath)) {
        initTeamstersPage(main);
    }
    if (/^\/about-tm\//i.test(currentPath)) {
        initAboutTmPage(main);
    }
    if (/^\/about-pro\/?$/i.test(currentPath)) {
        initAboutProPage(main);
    }
    if (/^\/buy-pro\/?$/i.test(currentPath)) {
        initBuyProPage(main);
    }
    if (/^\/free-pro\/?$/i.test(currentPath)) {
        initFreeProPage(main);
    }
    if (/^\/donations(\/legendary)?\/?$/i.test(currentPath)) {
        initDonationsPage(main);
    }
    if (/^\/user-guide\//i.test(currentPath)) {
        initUserGuidePage(main);
    }
    if (/^\/international-cup\/coefficients/i.test(currentPath)) {
        initInternationalCupCoefficientsPage(main);
    }
    if (/^\/statistics\/international-cup\//i.test(currentPath)) {
        initInternationalCupStatisticsPage(main);
    }
    if (/^\/123/.test(currentPath)) {
        initDbInspectPage(main);
        initDbRepairPage(main);
    }
    if (/^\/national-teams\/rankings\//i.test(currentPath)) {
        initNationalTeamsRankingsPage(main);
    }
    if (/^\/national-teams\/election\/?$/i.test(currentPath)) {
        initNationalTeamsElectionPage(main);
    }
    if (/^\/national-teams\/region\//i.test(currentPath)) {
        initNationalTeamsRegionPage(main);
    }
    if (/^\/national-teams\//i.test(currentPath)) {
        initNationalTeamsPage(main);
    }
    if (/^\/support-pro\/?$/i.test(currentPath)) {
        initSupportProPage(main);
    }
    if (/^\/players\/\d+/i.test(currentPath)) {
        initPlayerPage(main);
    }
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

}

export function initAppShellLayout() {
    if (!document.body || !document.head) return;
    if (document.getElementById('tmvu-header')) {
        initCurrentPage();
        return;
    }

    removeNativeMenus();
    replaceMainCenterClass();
    injectStyles();

    const currentPath = normalizeHref(window.location.pathname) || '/home/';
    const groups = collectNavGroups();
    const clubInfo = getClubInfo();
    const openGroupId = getInitialOpenGroup();
    const headerFab = getHeaderFab(currentPath);
    const headerHtml = TmAppShellHeader.render({
        clubName: clubInfo.clubName,
        logo: clubInfo.logo,
        proDays: clubInfo.proDays || '0',
        cash: formatCash(clubInfo.cash),
        pmCount: clubInfo.newPms || 0,
        feedCount: clubInfo.newFeed || 0,
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

    const pmController = createAppShellPmController({
        clubId: clubInfo.clubId,
        initialCount: clubInfo.newPms || 0,
        initialFeedCount: clubInfo.newFeed || 0,
    });
    pmController.bind();

    syncLayoutState();

    const themeFab = document.createElement('button');
    themeFab.className = 'tmvu-header-fab tmvu-theme-fab';
    themeFab.setAttribute('title', 'Choose theme');
    themeFab.setAttribute('aria-label', 'Choose theme');
    themeFab.setAttribute('type', 'button');
    themeFab.innerHTML = '<span class="tmvu-icon" aria-hidden="true">🎨</span>';
    themeFab.addEventListener('click', () => TmThemeDialog.open());
    document.body.appendChild(themeFab);

    TmThemeDialog.mount();

    pmController.refreshCount();
    initCurrentPage();
}
