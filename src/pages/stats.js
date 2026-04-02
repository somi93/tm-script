import { TmUI } from '../components/shared/tm-ui.js';
import { TmStatsAggregator } from '../components/stats/tm-stats-aggregator.js';
import { TmStatsPlayerTab } from '../components/stats/tm-stats-player-tab.js';
import { TmStatsStyles } from '../components/stats/tm-stats-styles.js';
import { TmStatsTeamTab } from '../components/stats/tm-stats-team-tab.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { initClubLayout, normalizeClubHref } from '../components/club/tm-club-layout.js';
import { TmClubService } from '../services/club.js';
import { TmMatchService } from '../services/match.js';

(function () {
    'use strict';

    const getStatsContainer = () => document.querySelector('.tmvu-club-main, .column2_a');

    // ─── Extract club ID from URL ────────────────────────────────────────
    const urlMatch = location.pathname.match(/\/statistics\/club\/(\d+)/);
    if (!urlMatch) return;
    const CLUB_ID = urlMatch[1];
    const CURRENT_PATH = normalizeClubHref(window.location.pathname);

    const setPendingVisibility = (pending) => {
        document.querySelectorAll('.tmvu-club-main, .column2_a').forEach(node => {
            node.classList.toggle('tmvu-stats-pending', pending);
        });
    };

    const waitForStatsContainer = () => new Promise(resolve => {
        const existing = getStatsContainer();
        if (existing) {
            resolve(existing);
            return;
        }

        const observer = new MutationObserver(() => {
            const container = getStatsContainer();
            if (!container) return;
            observer.disconnect();
            resolve(container);
        });

        observer.observe(document.body, { childList: true, subtree: true });
    });


    // ─── State ───────────────────────────────────────────────────────────
    let allMatchData = [];       // Array of processed match data objects
    let playerAgg = {};          // playerId → aggregated stats
    let teamAggFor = {};         // Our attacking styles (for)
    let teamAggAgainst = {};     // Opponent attacking styles (against)
    let teamOverall = {};        // Overall match stats (shots, cards, etc.)
    let lastFilteredMatches = []; // Filtered match list (after all filters)
    let activeTab = 'player';
    let activeFilter = 'total';  // total | average | per90
    let activeTeamFilter = 'total'; // total | average  (team tab)
    let activeMatchType = 'all'; // all | league | friendly | cup | fl
    let lastAggKey = null; // track when aggregation needs refresh
    // Multi-select tactic filters (null = all selected)
    let filterOurFormation = null;   // Set or null
    let filterOurStyle = null;
    let filterOurMentality = null;
    let filterOppFormation = null;
    let filterOppStyle = null;
    let filterOppMentality = null;
    let activePlayerSubTab = 'shooting'; // shooting | passing | defending
    let loadingComplete = false;
    let matchCount = { total: 0, loaded: 0 };

    // ─── Collect played matches from fixtures ────────────────────────────
    const getPlayedMatches = (fixturesData) => {
        const matches = [];
        Object.values(fixturesData).forEach(month => {
            if (!month.matches) return;
            month.matches.forEach(m => {
                if (m.result && m.result !== 'x-x') {
                    matches.push({
                        id: m.id,
                        date: m.date,
                        matchtype: m.matchtype,
                        matchtype_name: m.matchtype_sort || m.matchtype_name,
                        hometeam: String(m.hometeam),
                        awayteam: String(m.awayteam),
                        hometeam_name: m.hometeam_name,
                        awayteam_name: m.awayteam_name,
                        result: m.result,
                        isHome: String(m.hometeam) === CLUB_ID,
                    });
                }
            });
        });
        return matches;
    };

    // ─── Aggregate all match data (only when filters change) ──────────
    const getAggKey = () => JSON.stringify([
        activeMatchType,
        ...TACTIC_FILTER_KEYS.map(key => {
            const filter = getTacticFilter(key);
            return filter ? [...filter] : null;
        })
    ]);
    const aggregateIfNeeded = () => {
        const key = getAggKey();
        if (lastAggKey === key) return;
        const result = TmStatsAggregator.aggregate(allMatchData, {
            activeMatchType,
            ...getTacticFilterSnapshot(),
        });
        playerAgg = result.playerAgg;
        teamAggFor = result.teamAggFor;
        teamAggAgainst = result.teamAggAgainst;
        teamOverall = result.teamOverall;
        lastFilteredMatches = result.lastFilteredMatches;
        lastAggKey = key;
    };

    // ─── Render functions ────────────────────────────────────────────────

    // ─── Collect unique tactic values with cascading filters ────────────
    // For each filter field, show only values that exist in matches passing
    // all OTHER active filters (so options narrow as you select).
    // ─── Shared match type filter buttons ────────────────────────────────
    const MATCH_TYPES = [
        { key: 'all', label: 'All' },
        { key: 'league', label: 'League' },
        { key: 'friendly', label: 'Friendly' },
        { key: 'fl', label: 'FL' },
        { key: 'cup', label: 'Cup' },
    ];
    const TACTIC_FILTER_KEYS = ['ourFormation', 'ourStyle', 'ourMentality', 'oppFormation', 'oppStyle', 'oppMentality'];

    const getTacticFilter = (key) => ({
        ourFormation: filterOurFormation,
        ourStyle: filterOurStyle,
        ourMentality: filterOurMentality,
        oppFormation: filterOppFormation,
        oppStyle: filterOppStyle,
        oppMentality: filterOppMentality,
    })[key];

    const setTacticFilter = (key, value) => {
        if (key === 'ourFormation') filterOurFormation = value;
        else if (key === 'ourStyle') filterOurStyle = value;
        else if (key === 'ourMentality') filterOurMentality = value;
        else if (key === 'oppFormation') filterOppFormation = value;
        else if (key === 'oppStyle') filterOppStyle = value;
        else if (key === 'oppMentality') filterOppMentality = value;
    };

    const resetTacticFilters = () => {
        TACTIC_FILTER_KEYS.forEach(key => setTacticFilter(key, null));
    };

    const getTacticFilterSnapshot = () => Object.fromEntries(
        TACTIC_FILTER_KEYS.map(key => [key, getTacticFilter(key)])
    );

    const renderMatchTypeButtons = () => {
        return TmUI.tabs({
            items: MATCH_TYPES.map(mt => {
                const count = mt.key === 'all' ? allMatchData.length : allMatchData.filter(m => m.matchType === mt.key).length;
                if (count === 0 && mt.key !== 'all') return null;
                const wdl = getWDL(mt.key);
                return {
                    key: mt.key,
                    slot: `${mt.label} (${count}) <span class="tsa-mf-wdl">${wdl.w}W-${wdl.d}D-${wdl.l}L</span>`,
                };
            }).filter(Boolean),
            active: activeMatchType,
            color: 'secondary',
            cls: 'tsa-match-filters',
            itemCls: 'tsa-mf-btn',
        }).outerHTML;
    };

    const bindMatchTypeButtons = (body) => {
        if (body.dataset.tsaMatchTypeBound === '1') return;
        body.dataset.tsaMatchTypeBound = '1';

        body.addEventListener('click', (event) => {
            const button = event.target.closest('.tsa-match-filters .tmu-tab[data-tab]');
            if (!button || !body.contains(button)) return;
            const nextMatchType = button.dataset.tab;
            if (!nextMatchType || nextMatchType === activeMatchType) return;
            activeMatchType = nextMatchType;
            resetTacticFilters();
            renderCurrentTab();
        });
    };

    // ─── Get W-D-L for a match type filter ────────────────────────────────
    const getWDL = (matchTypeKey) => {
        const matches = matchTypeKey === 'all' ? allMatchData : allMatchData.filter(m => m.matchType === matchTypeKey);
        let w = 0, d = 0, l = 0;
        matches.forEach(md => {
            const [h, a] = md.matchInfo.result.split('-').map(Number);
            const our = md.isHome ? h : a;
            const opp = md.isHome ? a : h;
            if (our > opp) w++; else if (our === opp) d++; else l++;
        });
        return { w, d, l };
    };

    const renderPlayerTab = () => TmStatsPlayerTab.render({
        aggregateIfNeeded,
        renderMatchTypeButtons,
        getTeamOverall: () => teamOverall,
        getPlayerAgg: () => playerAgg,
        getActivePlayerSubTab: () => activePlayerSubTab,
        setActivePlayerSubTab: v => { activePlayerSubTab = v; },
        getActiveFilter: () => activeFilter,
        setActiveFilter: v => { activeFilter = v; },
        bindMatchTypeButtons,
        rerender: () => renderPlayerTab(),
    });

    const renderTeamTab = () => TmStatsTeamTab.render({
        aggregateIfNeeded,
        renderMatchTypeButtons,
        getTeamOverall: () => teamOverall,
        getTeamAggFor: () => teamAggFor,
        getTeamAggAgainst: () => teamAggAgainst,
        getLastFilteredMatches: () => lastFilteredMatches,
        getAllMatchData: () => allMatchData,
        getActiveTeamFilter: () => activeTeamFilter,
        setActiveTeamFilter: v => { activeTeamFilter = v; },
        getActiveMatchType: () => activeMatchType,
        bindMatchTypeButtons,
        getTacticFilter,
        setTacticFilter,
        setLastAggKey: v => { lastAggKey = v; },
        rerender: () => renderTeamTab(),
    });

    const renderCurrentTab = () => {
        if (activeTab === 'player') renderPlayerTab();
        else renderTeamTab();
    };

    // ─── Build the main container ────────────────────────────────────────
    const buildUI = () => {
        const container = getStatsContainer();
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        const wrap = document.createElement('div');
        const refs = TmSectionCard.mount(wrap, {
            title: 'Statistics',
            icon: '📊',
            titleMode: 'body',
            subtitle: 'Loading...',
            subtitleId: 'tsa-subtitle',
            flush: true,
            cardVariant: 'embedded',
            hostClass: 'tsa-card-host',
            metaClass: 'tsa-meta',
            subtitleClass: 'tsa-subtitle',
            beforeBodyHtml: '<div data-ref="tabsHost" class="tsa-tabs"></div>',
            bodyClass: 'tsa-body',
            bodyId: 'tsa-body',
            bodyHtml: `
                ${TmUI.loading('Loading match data…')}
                <div class="tsa-progress" id="tsa-progress">0 / 0 matches</div>
            `,
        });

        const tabs = TmUI.tabs({
            items: [
                { key: 'player', label: 'Player' },
                { key: 'team', label: 'Team' },
            ],
            active: activeTab,
            stretch: true,
            onChange: (key) => {
                if (!loadingComplete || key === activeTab) return;
                activeTab = key;
                renderCurrentTab();
            },
        });
        refs.tabsHost?.appendChild(tabs);

        container.appendChild(wrap);
        setPendingVisibility(false);
    };

    const updateProgress = () => {
        const el = document.getElementById('tsa-progress');
        if (el) el.textContent = `${matchCount.loaded} / ${matchCount.total} matches`;
    };

    // ─── Main initialization ─────────────────────────────────────────────
    const init = async () => {
        TmStatsStyles.inject();
        buildUI();

        try {
            // 1. Fetch fixtures
            const fixtures = await TmClubService.fetchClubFixtures(CLUB_ID);
            if (!fixtures) throw new Error('Failed to fetch fixtures');
            const playedMatches = getPlayedMatches(fixtures);
            matchCount.total = playedMatches.length;
            matchCount.loaded = 0;
            updateProgress();

            // 2. Fetch each match in batches of 3 using the standard match parser,
            // but without squad/tooltip enrichment for stats.
            const BATCH_SIZE = 3;
            for (let i = 0; i < playedMatches.length; i += BATCH_SIZE) {
                const batch = playedMatches.slice(i, i + BATCH_SIZE);
                const results = await Promise.all(
                    batch.map(async (matchInfo) => {
                        try {
                            const statsMatch = await TmMatchService.fetchMatchForStats(matchInfo, CLUB_ID, { dbSync: false });
                            if (!statsMatch) throw new Error('null response');
                            return statsMatch;
                        } catch (err) {
                            console.warn(`Failed to load match ${matchInfo.id}:`, err);
                            return null;
                        }
                    })
                );
                results.forEach(r => { if (r) allMatchData.push(r); });
                matchCount.loaded += batch.length;
                updateProgress();
            }

            // 3. Done loading
            loadingComplete = true;
            lastAggKey = null; // force first aggregation

            const subtitle = document.getElementById('tsa-subtitle');
            if (subtitle) {
                if (allMatchData.length > 0) {
                    const firstMatch = allMatchData[0];
                    const clubName = firstMatch.matchInfo.isHome
                        ? firstMatch.matchInfo.hometeam_name
                        : firstMatch.matchInfo.awayteam_name;
                    subtitle.textContent = `${clubName} — ${allMatchData.length} matches analyzed`;
                } else {
                    subtitle.textContent = 'No matches analyzed';
                }
            }

            renderCurrentTab();

        } catch (err) {
            console.error('TM Season Analysis error:', err);
            const body = document.getElementById('tsa-body');
            if (body) body.innerHTML = TmUI.error(`Error loading data: ${err.message}`);
            setPendingVisibility(false);
        }
    };

    const start = async () => {
        TmStatsStyles.inject();
        initClubLayout({ currentPath: CURRENT_PATH });
        setPendingVisibility(true);
        await waitForStatsContainer();
        init();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            start().catch(err => console.error('TM Season Analysis start error:', err));
        }, { once: true });
    } else {
        start().catch(err => console.error('TM Season Analysis start error:', err));
    }
})();
