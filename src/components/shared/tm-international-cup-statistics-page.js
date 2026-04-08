import { TmSectionCard } from './tm-section-card.js';
import { TmTournamentPage } from './tm-tournament-page.js';
import { mountPlayerStatsBrowser, PLAYER_STAT_DEFS, PLAYER_COL_LABELS, parsePlayerStatsHtml } from './tm-player-stats-browser.js';

const MENU_ITEMS = [
    { label: 'International cup', href: '/international-cup/1/' },
    { label: 'Coefficients', href: '/international-cup/coefficients/1/' },
    { label: 'Statistics', href: '/statistics/international-cup/1/', active: true },
];



const cleanText = v => String(v ?? '').replace(/\s+/g, ' ').trim();

const statsCache = {};

const fetchPlayerStats = (tourney, stat, season, teamIdx, onDone) => {
    const seasonStr = season ? `${season}/` : '';
    const key = `${tourney}|${stat}|${season}|${teamIdx}`;
    if (statsCache[key]) { onDone(statsCache[key]); return; }
    window.fetch(`/statistics/international-cup/${tourney}/players/${stat}/${seasonStr}`)
        .then(r => r.text())
        .then(html => {
            const rows = parsePlayerStatsHtml(html, teamIdx);
            statsCache[key] = rows;
            onDone(rows);
        })
        .catch(() => onDone(null));
};

export function mountInternationalCupStatisticsPage(main) {
    if (!main) main = document.querySelector('.tmvu-main');
    if (!main) return;

    const sourceRoot = document.querySelector('.main_center') || main;
    const cleanOpts = sel => sel
        ? Array.from(sel.options).map(o => ({ value: o.value, label: cleanText(o.textContent), selected: o.selected }))
        : [];

    const tourneyOpts = cleanOpts(sourceRoot.querySelector('#tourney_number'));
    const seasonOpts = cleanOpts(sourceRoot.querySelector('#stats_season'));

    let activeTourney = tourneyOpts.find(o => o.selected)?.value ?? tourneyOpts[0]?.value ?? '1';
    let activeSeason = seasonOpts.find(o => o.selected)?.value ?? seasonOpts[0]?.value ?? '';

    // ── filter select helper ──────────────────────────────────────────────────
    const buildSelect = (opts, current, onChange) => {
        const sel = document.createElement('select');
        sel.className = 'tmu-input tmu-input-tone-overlay tmu-input-density-compact';
        opts.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o.value;
            opt.textContent = o.label;
            if (o.value === current) opt.selected = true;
            sel.appendChild(opt);
        });
        sel.addEventListener('change', () => onChange(sel.value));
        return sel;
    };

    // ── body layout ───────────────────────────────────────────────────────────
    const bodyEl = document.createElement('div');
    let browserWrap = null;

    const remountBrowser = () => {
        if (!browserWrap) return;
        browserWrap.innerHTML = '';
        mountPlayerStatsBrowser(browserWrap, {
            statDefs: PLAYER_STAT_DEFS,
            initialStat: 'goals',
            initialTeam: 0,
            fetchFn: (stat, team, cb) => fetchPlayerStats(activeTourney, stat, activeSeason, team, cb),
            colLabel: PLAYER_COL_LABELS,
        });
    };

    // Filters row
    const filtersRow = document.createElement('div');
    filtersRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:var(--tmu-space-sm);align-items:center;margin-bottom:var(--tmu-space-md);';

    const addFilter = (label, opts, current, onChange) => {
        if (!opts.length) return;
        const lbl = document.createElement('label');
        lbl.textContent = label;
        lbl.style.cssText = 'font-size:var(--tmu-font-xs);font-weight:600;color:var(--tmu-text-panel-label);text-transform:uppercase;letter-spacing:.06em;';
        filtersRow.appendChild(lbl);
        filtersRow.appendChild(buildSelect(opts, current, onChange));
    };

    if (tourneyOpts.length > 1) {
        addFilter('Tournament', tourneyOpts, activeTourney, v => { activeTourney = v; remountBrowser(); });
    }
    addFilter('Season', seasonOpts, activeSeason, v => { activeSeason = v; remountBrowser(); });

    if (filtersRow.children.length) bodyEl.appendChild(filtersRow);

    browserWrap = document.createElement('div');
    bodyEl.appendChild(browserWrap);

    // ── card + page ───────────────────────────────────────────────────────────
    const cardHost = document.createElement('div');
    const refs = TmSectionCard.mount(cardHost, {
        title: 'Player Statistics',
        bodyClass: 'tmvu-icup-stats-body',
    });
    if (refs?.body) refs.body.appendChild(bodyEl);

    TmTournamentPage.mount(main, {
        pageClass: 'tmvu-icup-page tmvu-icup-page-statistics',
        menuItems: MENU_ITEMS,
        currentHref: window.location.pathname,
        mainClass: 'tmvu-icup-main',
        sideClass: 'tmvu-icup-side',
        mainNodes: [cardHost],
        sideNodes: [],
    });

    remountBrowser();
}
