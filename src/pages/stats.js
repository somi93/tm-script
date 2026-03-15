import { TmUI } from '../components/shared/tm-ui.js';
import { TmStatsAggregator } from '../components/stats/tm-stats-aggregator.js';
import { TmStatsMatchProcessor } from '../components/stats/tm-stats-match-processor.js';
import { TmStatsPlayerTab } from '../components/stats/tm-stats-player-tab.js';
import { TmStatsStyles } from '../components/stats/tm-stats-styles.js';
import { TmStatsTeamTab } from '../components/stats/tm-stats-team-tab.js';
import { TmMatchCacheDB } from '../lib/tm-playerdb.js';
import { TmApi }  from '../services/index.js' ;

(function () {
    'use strict';

    // ─── Extract club ID from URL ────────────────────────────────────────
    const urlMatch = location.pathname.match(/\/statistics\/club\/(\d+)/);
    if (!urlMatch) return;
    const CLUB_ID = urlMatch[1];


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
    let activePlayerSubTab = 'basic'; // basic | attacking | defending — kept for backwards compat, unused
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
    const getAggKey = () => JSON.stringify([activeMatchType,
        filterOurFormation ? [...filterOurFormation] : null,
        filterOurStyle ? [...filterOurStyle] : null,
        filterOurMentality ? [...filterOurMentality] : null,
        filterOppFormation ? [...filterOppFormation] : null,
        filterOppStyle ? [...filterOppStyle] : null,
        filterOppMentality ? [...filterOppMentality] : null]);
    const aggregateIfNeeded = () => {
        const key = getAggKey();
        if (lastAggKey === key) return;
        const result = TmStatsAggregator.aggregate(allMatchData, {
            activeMatchType,
            filterOurFormation, filterOurStyle, filterOurMentality,
            filterOppFormation, filterOppStyle, filterOppMentality,
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

    const renderMatchTypeButtons = () => {
        let html = '<div class="tsa-match-filters">';
        MATCH_TYPES.forEach(mt => {
            const count = mt.key === 'all' ? allMatchData.length : allMatchData.filter(m => m.matchType === mt.key).length;
            if (count === 0 && mt.key !== 'all') return;
            const wdl = getWDL(mt.key);
            html += `<div class="tsa-mf-btn${activeMatchType === mt.key ? ' active' : ''}" data-mtype="${mt.key}">${mt.label} (${count}) <span class="tsa-mf-wdl">${wdl.w}W-${wdl.d}D-${wdl.l}L</span></div>`;
        });
        html += '</div>';
        return html;
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
        getActiveFilter: () => activeFilter,
        setActiveFilter: v => { activeFilter = v; },
        getActiveMatchType: () => activeMatchType,
        setActiveMatchType: v => { activeMatchType = v; },
        setFilterOurFormation: v => { filterOurFormation = v; },
        setFilterOurStyle: v => { filterOurStyle = v; },
        setFilterOurMentality: v => { filterOurMentality = v; },
        setFilterOppFormation: v => { filterOppFormation = v; },
        setFilterOppStyle: v => { filterOppStyle = v; },
        setFilterOppMentality: v => { filterOppMentality = v; },
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
        setActiveMatchType: v => { activeMatchType = v; },
        getFilterOurFormation: () => filterOurFormation,
        setFilterOurFormation: v => { filterOurFormation = v; },
        getFilterOurStyle: () => filterOurStyle,
        setFilterOurStyle: v => { filterOurStyle = v; },
        getFilterOurMentality: () => filterOurMentality,
        setFilterOurMentality: v => { filterOurMentality = v; },
        getFilterOppFormation: () => filterOppFormation,
        setFilterOppFormation: v => { filterOppFormation = v; },
        getFilterOppStyle: () => filterOppStyle,
        setFilterOppStyle: v => { filterOppStyle = v; },
        getFilterOppMentality: () => filterOppMentality,
        setFilterOppMentality: v => { filterOppMentality = v; },
        setLastAggKey: v => { lastAggKey = v; },
        rerender: () => renderTeamTab(),
    });

    const renderCurrentTab = () => {
        if (activeTab === 'player') renderPlayerTab();
        else renderTeamTab();
    };

    // ─── Build the main container ────────────────────────────────────────
    const buildUI = () => {
        const container = document.querySelector('.column2_a');
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        const wrap = document.createElement('div');
        wrap.className = 'tsa-wrap';
        wrap.innerHTML = `
            <div class="tsa-header">
                <div class="tsa-title">Season Match Analysis</div>
                <div class="tsa-subtitle" id="tsa-subtitle">Loading...</div>
            </div>
            <div class="tsa-tabs">
                <div class="tsa-tab${activeTab === 'player' ? ' active' : ''}" data-tab="player">Player</div>
                <div class="tsa-tab${activeTab === 'team' ? ' active' : ''}" data-tab="team">Team</div>
            </div>
            <div class="tsa-body" id="tsa-body">
                ${TmUI.loading('Loading match data…')}
                <div class="tsa-progress" id="tsa-progress">0 / 0 matches</div>
            </div>
        `;

        container.appendChild(wrap);

        // Tab click handling
        wrap.querySelectorAll('.tsa-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                if (!loadingComplete) return;
                wrap.querySelectorAll('.tsa-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                activeTab = tab.dataset.tab;
                renderCurrentTab();
            });
        });
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
            // 1. Fetch fixtures (TmMatchCacheDB opens lazily on first fetchMatchCached call)
            const fixtures = await TmApi.fetchClubFixtures(CLUB_ID);
            if (!fixtures) throw new Error('Failed to fetch fixtures');
            const playedMatches = getPlayedMatches(fixtures);
            matchCount.total = playedMatches.length;
            matchCount.loaded = 0;
            updateProgress();

            // Prune stale entries from previous seasons (fire-and-forget)
            TmMatchCacheDB.pruneExcept(playedMatches.map(m => m.id));

            // 2. Fetch each match in batches of 3 — served from IndexedDB cache after first visit
            const BATCH_SIZE = 3;
            for (let i = 0; i < playedMatches.length; i += BATCH_SIZE) {
                const batch = playedMatches.slice(i, i + BATCH_SIZE);
                const results = await Promise.all(
                    batch.map(async (matchInfo) => {
                        try {
                            const mData = await TmApi.fetchMatchCached(matchInfo.id);
                            if (!mData) throw new Error('null response');
                            return TmStatsMatchProcessor.process(matchInfo, mData, CLUB_ID);
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

            // Get club name from first match data if available
            if (allMatchData.length > 0) {
                const firstMatch = allMatchData[0];
                const clubName = firstMatch.matchInfo.isHome
                    ? firstMatch.matchInfo.hometeam_name
                    : firstMatch.matchInfo.awayteam_name;
                const subtitle = document.querySelector('.tsa-subtitle');
                if (subtitle) subtitle.textContent = `${clubName} — ${allMatchData.length} matches analyzed`;
            }

            renderCurrentTab();

        } catch (err) {
            console.error('TM Season Analysis error:', err);
            const body = document.getElementById('tsa-body');
            if (body) body.innerHTML = TmUI.error(`Error loading data: ${err.message}`);
        }
    };

    // Wait for jQuery and page load
    const waitForReady = () => {
        if (typeof $ !== 'undefined' && document.querySelector('.column2_a')) {
            init();
        } else {
            setTimeout(waitForReady, 500);
        }
    };

    waitForReady();
})();
