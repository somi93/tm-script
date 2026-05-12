import { TmSectionCard } from './tm-section-card.js';
import { TmSideMenu } from './tm-side-menu.js';
import { TmSeasonBar } from './tm-season-bar.js';
import { injectTmPageLayoutStyles } from './tm-page-layout.js';
import { mountPlayerStatsBrowser, PLAYER_STAT_DEFS, PLAYER_COL_LABELS, parsePlayerStatsHtml } from './tm-player-stats-browser.js';

const cleanText = v => String(v ?? '').replace(/\s+/g, ' ').trim();

const cleanOpts = sel => (sel && sel.options)
    ? Array.from(sel.options)
        .map(o => ({ value: o.value, label: cleanText(o.textContent), selected: o.selected }))
        .filter(o => o.value)
    : [];

function parseMenu() {
    return Array.from(document.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
        if (node.tagName === 'HR') return [{ type: 'separator' }];
        if (node.tagName !== 'A') return [];
        return [{
            type: 'link',
            href: node.getAttribute('href') || '#',
            label: cleanText(node.textContent),
            icon: /cup/i.test(node.textContent) ? '🏆' : /fixture/i.test(node.textContent) ? '📅' : /stat/i.test(node.textContent) ? '📊' : /history/i.test(node.textContent) ? '📜' : '📋',
        }];
    });
}

function buildDefaultMenu(country) {
    return [
        { type: 'link', href: '/cup/', label: 'Cup', icon: '🏆' },
        { type: 'link', href: `/statistics/cup/${country}/`, label: 'Statistics', icon: '📊' },
        { type: 'link', href: `/history/cup/${country}/`, label: 'History', icon: '📜' },
    ];
}

const statsCache = {};

const fetchPlayerStats = (country, stat, season, teamIdx, onDone) => {
    const seasonStr = season ? `${season}/` : '';
    const key = `${country}|${stat}|${season}|${teamIdx}`;
    if (statsCache[key]) { onDone(statsCache[key]); return; }
    window.fetch(`/statistics/cup/${country}/players/${stat}/${seasonStr}`)
        .then(r => r.text())
        .then(html => {
            const rows = parsePlayerStatsHtml(html, teamIdx);
            statsCache[key] = rows;
            onDone(rows);
        })
        .catch(() => onDone(null));
};

export function mountCupStatisticsPage(main) {
    if (!main) main = document.querySelector('.tmvu-main');
    if (!main) return;

    injectTmPageLayoutStyles();

    const sourceRoot = document.querySelector('.main_center') || main;

    // Extract country from URL: /statistics/cup/{country}/...
    const country = window.location.pathname.match(/\/statistics\/cup\/([^/]+)\//)?.[1] ?? '';
    const seasonFromUrl = window.location.pathname.match(/\/statistics\/cup\/[^/]+\/players\/[^/]+\/(\d+)/)?.[1] ?? '';

    const domSeasonOpts = cleanOpts(sourceRoot.querySelector('#stats_type, #stats_season'));

    // Fallback: generate seasons 1..SESSION.season when the DOM has no <select>
    const maxSeason = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : 90;
    const seasonOpts = domSeasonOpts.length
        ? domSeasonOpts
        : Array.from({ length: maxSeason }, (_, i) => maxSeason - i)
            .map(n => ({ value: String(n), label: `Season ${n}`, selected: String(n) === (seasonFromUrl || String(maxSeason)) }));

    let activeSeason = seasonFromUrl || seasonOpts.find(o => o.selected)?.value || seasonOpts[0]?.value || '';

    const domMenuItems = parseMenu();
    const menuItems = domMenuItems.length ? domMenuItems : buildDefaultMenu(country);

    let browserWrap = null;

    const remountBrowser = () => {
        if (!browserWrap) return;
        browserWrap.innerHTML = '';
        mountPlayerStatsBrowser(browserWrap, {
            statDefs: PLAYER_STAT_DEFS,
            initialStat: 'goals',
            initialTeam: 0,
            showTeamToggle: false,
            fetchFn: (stat, team, cb) => fetchPlayerStats(country, stat, activeSeason, team, cb),
            colLabel: PLAYER_COL_LABELS,
        });
    };

    // ── filters row ───────────────────────────────────────────────────────────
    const filtersRow = document.createElement('div');
    filtersRow.className = 'tmu-filters-row';

    TmSeasonBar.mount(filtersRow, {
        seasons: seasonOpts.map(o => ({ id: o.value, label: o.label })),
        current: activeSeason,
        label: false,
        cls: '',
        onChange: v => { activeSeason = v; remountBrowser(); },
    });

    // ── card body ─────────────────────────────────────────────────────────────
    const bodyEl = document.createElement('div');
    bodyEl.appendChild(filtersRow);

    browserWrap = document.createElement('div');
    bodyEl.appendChild(browserWrap);

    // ── page layout ───────────────────────────────────────────────────────────
    main.innerHTML = '';
    main.classList.add('tmu-page-layout-2col', 'tmu-page-density-regular');

    TmSideMenu.mount(main, {
        className: 'tmu-page-sidebar-stack',
        items: menuItems,
        currentHref: window.location.pathname,
    });

    const section = document.createElement('section');
    section.className = 'tmu-page-section-stack';
    main.appendChild(section);

    const cardHost = document.createElement('div');
    const refs = TmSectionCard.mount(cardHost, { title: 'Player Statistics' });
    if (refs?.body) refs.body.appendChild(bodyEl);
    section.appendChild(cardHost);

    remountBrowser();
}
