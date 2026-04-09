import { TmSectionCard } from './tm-section-card.js';
import { TmSideMenu } from './tm-side-menu.js';
import { TmSeasonBar } from './tm-season-bar.js';
import { TmAutocomplete } from './tm-autocomplete.js';
import { injectTmPageLayoutStyles } from './tm-page-layout.js';
import { mountPlayerStatsBrowser, PLAYER_STAT_DEFS, PLAYER_COL_LABELS, parsePlayerStatsHtml } from './tm-player-stats-browser.js';

const MENU_ITEMS = [
    { label: 'International cup', href: '/international-cup/1/' },
    { label: 'Coefficients', href: '/international-cup/coefficients/1/' },
    { label: 'Statistics', href: '/statistics/international-cup/1/', active: true },
];

const cleanText = v => String(v ?? '').replace(/\s+/g, ' ').trim();

const cleanOpts = sel => sel
    ? Array.from(sel.options)
        .map(o => ({ value: o.value, label: cleanText(o.textContent), selected: o.selected }))
        .filter(o => o.value)
    : [];

const readMenuLabels = menu => menu
    ? Array.from(menu.querySelectorAll('.ui-menu-item-wrapper'))
        .map(el => cleanText(el.textContent))
        .filter(Boolean)
    : [];

const readTourneyOpts = root => {
    const selectOpts = cleanOpts(root.querySelector('#tourney_number'));
    const menuLabels = readMenuLabels(document.querySelector('#tourney_number-menu'));
    if (!selectOpts.length) return [];
    return selectOpts.map((opt, idx) => ({
        ...opt,
        label: menuLabels[idx] || opt.label,
    })).filter(opt => opt.label);
};

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

    injectTmPageLayoutStyles();

    const sourceRoot = document.querySelector('.main_center') || main;

    const tourneyOpts = readTourneyOpts(sourceRoot);
    const seasonOpts = cleanOpts(sourceRoot.querySelector('#stats_season'));

    let activeTourney = tourneyOpts.find(o => o.selected)?.value ?? tourneyOpts[0]?.value ?? '1';
    let activeSeason = seasonOpts.find(o => o.selected)?.value ?? seasonOpts[0]?.value ?? '';

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

    // ── filters ───────────────────────────────────────────────────────────────
    const filtersRow = document.createElement('div');
    filtersRow.className = 'tmu-filters-row';

    if (tourneyOpts.length > 1) {
        const ac = TmAutocomplete.autocomplete({
            value: tourneyOpts.find(o => o.value === activeTourney)?.label ?? '',
            placeholder: 'Tournament…',
            tone: 'overlay',
            density: 'compact',
            size: 'md',
        });
        ac.style.width = '200px';
        const renderItems = (q = '') => {
            const ql = q.toLowerCase();
            ac.setItems(tourneyOpts
                .filter(o => o.value && o.label && (!ql || o.label.toLowerCase().includes(ql)))
                .map(o => TmAutocomplete.autocompleteItem({
                    label: o.label,
                    active: o.value === activeTourney,
                    onSelect: () => {
                        activeTourney = o.value;
                        ac.setValue(tourneyOpts.find(t => t.value === activeTourney)?.label ?? '');
                        ac.hideDrop();
                        remountBrowser();
                    },
                }))
            );
        };
        ac.addEventListener('focusin', e => {
            if (e.target !== ac.inputEl) return;
            ac.setValue('');
            renderItems();
        });
        ac.addEventListener('input', e => { if (e.target === ac.inputEl) renderItems(e.target.value); });
        ac.addEventListener('focusout', e => {
            if (e.target !== ac.inputEl) return;
            setTimeout(() => {
                ac.setValue(tourneyOpts.find(t => t.value === activeTourney)?.label ?? '');
                ac.hideDrop();
            }, 150);
        });
        filtersRow.appendChild(ac);
    }

    TmSeasonBar.mount(filtersRow, {
        seasons: seasonOpts.map(o => ({ id: o.value, label: o.label })),
        current: activeSeason,
        label: false,
        cls: '',
        onChange: v => { activeSeason = v; remountBrowser(); },
    });

    // ── build card body ───────────────────────────────────────────────────────
    const bodyEl = document.createElement('div');
    bodyEl.appendChild(filtersRow);

    browserWrap = document.createElement('div');
    bodyEl.appendChild(browserWrap);

    // ── assemble page ─────────────────────────────────────────────────────────
    main.innerHTML = '';
    main.classList.add('tmu-page-layout-2col', 'tmu-page-density-regular');

    TmSideMenu.mount(main, {
        className: 'tmu-page-sidebar-stack',
        items: MENU_ITEMS,
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
