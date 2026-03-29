import { TmLeaguePanel } from '../components/league/tm-league-panel.js';
import { TmLeagueRounds } from '../components/league/tm-league-rounds.js';
import { TmLeagueStandings } from '../components/league/tm-league-standings.js';
import { TmLeagueStyles } from '../components/league/tm-league-styles.js';
import { TmButton } from '../components/shared/tm-button.js';
import { TmNativeFeed } from '../components/shared/tm-native-feed.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { createSocialFeedController } from '../components/shared/tm-social-feed.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmClubService } from '../services/club.js';
import { TmApi } from '../services/index.js';
import { TmPlayerService } from '../services/player.js';
import { TmUtils } from '../lib/tm-utils.js';

(function () {
    'use strict';

    if (!/^\/league\//.test(location.pathname)) return;

    // ─── Constants ───────────────────────────────────────────────────────
    const STORAGE_KEY = 'TM_LEAGUE_LINEUP_NUM_ROUNDS';

    const SKILL_NAMES_FIELD = TmConst.SKILL_DEFS_OUT.map(d => d.label || d.key);
    const SKILL_NAMES_GK = TmConst.SKILL_DEFS_GK.map(d => d.label || d.key);

    const { REC_THRESHOLDS, R5_THRESHOLDS, AGE_THRESHOLDS } = TmConst;
    const htmlOf = node => node?.outerHTML || '';
    const inputHtml = opts => htmlOf(TmUI.input({ tone: 'overlay', density: 'regular', ...opts }));
    const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();

    // ─── Squad fetching via TmApi (one call per club per run) ─────────────
    const squadCache = new Map(); // clubId → Promise<{post:{id:player}}>

    const fetchSquad = clubId => {
        if (!squadCache.has(clubId)) {
            squadCache.set(clubId, TmClubService.fetchSquadRaw(clubId).then(data => {
                if (!data?.post) return { post: {} };
                if (Array.isArray(data.post)) {
                    const postObj = {};
                    data.post.forEach(p => { postObj[String(p.id)] = p; });
                    data.post = postObj;
                }
                return data;
            }).catch(() => ({ post: {} })));
        }
        return squadCache.get(clubId);
    };

    // ─── Per-player R5 resolution ─────────────────────────────────────────
    // squadPost is the full fetchSquad response: {post: {pid: normalizedPlayer}}.
    // Players in post are already normalized by fetchSquadRaw (r5/rec/positions/ageMonths present).
    // Tooltip fallback only for players no longer in the current squad (transferred), with a cache.
    const tooltipCache = new Map(); // pid → Promise<player|null>

    const getPlayerDataFromSquad = async (pid, squadPost, matchPos) => {

        let player = squadPost.post?.[String(pid)];
        if (!player) {
            if (!tooltipCache.has(pid)) {
                tooltipCache.set(pid, TmPlayerService.fetchPlayerTooltip(pid)
                    .then(r => r?.player ?? null).catch(() => null));
            }
            player = await tooltipCache.get(pid);
        }
        if (!player) return { Age: 0, R5: 0, REC: 0, isGK: false, skills: [], routine: 0 };
        const posData = player.positions?.find(p => p.position?.toLowerCase() === matchPos);
        const r5 = Number(posData?.r5 ?? player.r5 ?? 0);
        const rec = Number(posData?.rec ?? player.rec ?? 0);
        return { Age: player.ageMonths, R5: r5, REC: rec, isGK: player.isGK, skills: player.skills, routine: player.routine };
    };

    // ─── Team statistics (average R5 of 11 starters) ─────────────────────
    const computeTeamStats = async (playerIds, lineup, squadPost) => {
        const starters = playerIds.filter(id => !lineup[id].position.includes('sub'));
        const players = await Promise.all(starters.map(async id => {
            const matchPos = lineup[id].position;
            const p = await getPlayerDataFromSquad(id, squadPost, matchPos);
            return { id, name: lineup[id].name || String(id), pos: matchPos, ...p };
        }));
        const totals = { Age: 0, REC: 0, R5: 0 };
        players.forEach(p => { totals.Age += p.Age; totals.REC += p.REC; totals.R5 += p.R5; });
        return { totals, players };
    };

    // Page type detection
    let pagePath = window.location.pathname;
    let isLeaguePage = /^\/league\//.test(pagePath);
    let lastInitPath = '';
    let leaguePollInterval = null;
    let feedClassObserver = null;
    let lastFeedMode = null;
    let leagueFeedController = null;
    let leagueFeedObserver = null;
    let leagueFeedMount = null;
    let leagueFeedRenderPromise = null;

    // ─── State ───────────────────────────────────────────────────────────
    let urlParts = pagePath.split('/').filter(Boolean);
    let leagueCountry = isLeaguePage ? urlParts[1] : null;
    let leagueDivision = isLeaguePage ? urlParts[2] : null;
    let leagueGroup = isLeaguePage ? (urlParts[3] || '1') : null;

    let numLastRounds = parseInt(localStorage.getItem(STORAGE_KEY)) || 5;
    let clubDatas = new Map();
    let clubMap = new Map();
    let clubPlayersMap = new Map(); // clubId → Map<playerId, {pos,R5,REC,Age}>
    let totalExpected = 0;
    let totalProcessed = 0;
    let analysisInterval = null;
    let skillData = [];
    let skillSortCol = 'R5';
    let skillSortAsc = false;

    // ─── Rounds state ────────────────────────────────────────────────────
    let allRounds = [];        // [{roundNum, date, matches}] sorted by date asc
    let currentRoundIdx = 0;   // index into allRounds
    let fixturesCache = null;  // raw fixtures response

    // ─── Team of the Round state ─────────────────────────────────────────
    const totrCache = {};      // date → parsed TOTR data
    let totrCurrentDate = null;
    // Correct league params (parsed from nav link, reliable on all subpages)
    let panelCountry = null, panelDivision = null, panelGroup = null;
    let panelLeagueName = '';

    // ─── Standings state ─────────────────────────────────────────────────
    let standingsRows = [];    // parsed from DOM #overall_table
    let liveZoneMap = {};      // rank → zone, built from live #overall_table (reused for history seasons)
    let formOffset = 0;        // 0=default: 5 recent played + 1 upcoming at pos 6; positive=older; negative=more upcoming
    let stdVenue = 'total';    // 'total' | 'home' | 'away'
    let stdFormN = 0;          // 0=All, 5, 10, 15, 20, 25, 30 – last-N-matches filter
    let displayedSeason = null; // null = live current, number = history mode
    let historyFixturesData = null; // null = live, {season, groups} = history mode
    let histFixTooltipCache = {};
    let histFixTooltipEl = null;
    let histFixTooltipTimer = null;
    let histFixTooltipHideTimer = null;

    // ─── Player stats state ────────────────────────────────────────────────
    let statsStatType = 'goals'; // goals | assists | productivity | rating | cards | man-of-the-match
    let statsTeamType = 0;       // 0 = Main team (tab0), 1 = Under 21 (tab1)
    let statsMode = 'players';   // 'players' | 'clubs'
    let statsClubStat = 'goals'; // goals | attendance | injuries | possession | cards
    let transfersView = 'bought'; // 'bought' | 'sold' | 'teams'
    let statsCache = {};         // keyed by `${mode}|${stat}|${season}|${teamIdx}`


    // --- Shared context: all components access state via window.TmLeagueCtx ---
    // Components read/write state through this object; closure vars are the backing store.
    // Getter/setter pairs keep component access in sync with main-script mutations.
    const ctx = window.TmLeagueCtx = { // eslint-disable-line no-unused-vars
        // ── League identity (set by tm-league.user.js; reset on navigation) ──
        get leagueCountry() { return leagueCountry; }, set leagueCountry(v) { leagueCountry = v; },
        get leagueDivision() { return leagueDivision; }, set leagueDivision(v) { leagueDivision = v; },
        get leagueGroup() { return leagueGroup; }, set leagueGroup(v) { leagueGroup = v; },
        // ── Panel state (set by tm-league-panel.js and shared components) ──
        get panelCountry() { return panelCountry; }, set panelCountry(v) { panelCountry = v; },
        get panelDivision() { return panelDivision; }, set panelDivision(v) { panelDivision = v; },
        get panelGroup() { return panelGroup; }, set panelGroup(v) { panelGroup = v; },
        get panelLeagueName() { return panelLeagueName; }, set panelLeagueName(v) { panelLeagueName = v; },
        // ── Rounds analysis (set by tm-league-rounds.js) ──
        get numLastRounds() { return numLastRounds; }, set numLastRounds(v) { numLastRounds = v; },
        get clubDatas() { return clubDatas; }, set clubDatas(v) { clubDatas = v; },
        get clubMap() { return clubMap; }, set clubMap(v) { clubMap = v; },
        get clubPlayersMap() { return clubPlayersMap; }, set clubPlayersMap(v) { clubPlayersMap = v; },
        get totalExpected() { return totalExpected; }, set totalExpected(v) { totalExpected = v; },
        get totalProcessed() { return totalProcessed; }, set totalProcessed(v) { totalProcessed = v; },
        get analysisInterval() { return analysisInterval; }, set analysisInterval(v) { analysisInterval = v; },
        // ── Skill table (set by tm-league-skill-table.js) ──
        get skillData() { return skillData; }, set skillData(v) { skillData = v; },
        get skillSortCol() { return skillSortCol; }, set skillSortCol(v) { skillSortCol = v; },
        get skillSortAsc() { return skillSortAsc; }, set skillSortAsc(v) { skillSortAsc = v; },
        // ── Rounds list (set by tm-league-rounds.js) ──
        get allRounds() { return allRounds; }, set allRounds(v) { allRounds = v; },
        get currentRoundIdx() { return currentRoundIdx; }, set currentRoundIdx(v) { currentRoundIdx = v; },
        get fixturesCache() { return fixturesCache; }, set fixturesCache(v) { fixturesCache = v; },
        // ── Team of the Round (set by tm-league-totr.js) ──
        get totrCache() { return totrCache; },               // only mutated, not reassigned
        get totrCurrentDate() { return totrCurrentDate; }, set totrCurrentDate(v) { totrCurrentDate = v; },
        // ── Standings (set by tm-league-standings.js) ──
        get standingsRows() { return standingsRows; }, set standingsRows(v) { standingsRows = v; },
        get liveZoneMap() { return liveZoneMap; }, set liveZoneMap(v) { liveZoneMap = v; },
        get formOffset() { return formOffset; }, set formOffset(v) { formOffset = v; },
        get stdVenue() { return stdVenue; }, set stdVenue(v) { stdVenue = v; },
        get stdFormN() { return stdFormN; }, set stdFormN(v) { stdFormN = v; },
        // ── History fixtures (set by tm-league-fixtures.js; displayedSeason also by tm-league-panel.js) ──
        get displayedSeason() { return displayedSeason; }, set displayedSeason(v) { displayedSeason = v; },
        get historyFixturesData() { return historyFixturesData; }, set historyFixturesData(v) { historyFixturesData = v; },
        get histFixTooltipCache() { return histFixTooltipCache; },     // only mutated
        get histFixTooltipEl() { return histFixTooltipEl; }, set histFixTooltipEl(v) { histFixTooltipEl = v; },
        get histFixTooltipTimer() { return histFixTooltipTimer; }, set histFixTooltipTimer(v) { histFixTooltipTimer = v; },
        get histFixTooltipHideTimer() { return histFixTooltipHideTimer; }, set histFixTooltipHideTimer(v) { histFixTooltipHideTimer = v; },
        // ── Stats & transfers (set by tm-league-stats.js) ──
        get statsStatType() { return statsStatType; }, set statsStatType(v) { statsStatType = v; },
        get statsTeamType() { return statsTeamType; }, set statsTeamType(v) { statsTeamType = v; },
        get statsMode() { return statsMode; }, set statsMode(v) { statsMode = v; },
        get statsClubStat() { return statsClubStat; }, set statsClubStat(v) { statsClubStat = v; },
        get transfersView() { return transfersView; }, set transfersView(v) { transfersView = v; },
        get statsCache() { return statsCache; },              // only mutated
        // Functions — lazy getters (defined later in IIFE; called only from events/timers)
        get fetchSquad() { return fetchSquad; },
        get computeTeamStats() { return computeTeamStats; },
        get updateProgress() { return updateProgress; },
        get sortData() { return sortData; },
        // Constants — shared display config, injected from main scope
        getColor: TmUtils.getColor, STORAGE_KEY, SKILL_NAMES_FIELD, SKILL_NAMES_GK, REC_THRESHOLDS, R5_THRESHOLDS, AGE_THRESHOLDS,
        // ── Coordinated state transitions ─────────────────────────────────────────────────────
        // Use these instead of direct property writes when multiple fields must change together.
        // They prevent the partial-update bugs that arise when callers forget a related field.
        // ───────────────────────────────────────────────────────────────────────
        /** Set the three panel league params (+ optional name) atomically. */
        setPanelLeague(country, division, group, name) {
            panelCountry = country; panelDivision = division; panelGroup = group;
            if (name != null) panelLeagueName = name;
        },
        /** Switch back to live (current-season) standings view. Clears history-mode state. */
        resetToLive() {
            displayedSeason = null; historyFixturesData = null;
            standingsRows = []; formOffset = 0;
        },
        /** Switch to a history season. Clears stale fixtures data so fetchers refill it. */
        setDisplayedSeason(s) {
            displayedSeason = s; historyFixturesData = null;
        },
        /** Set the rounds list and active index atomically (avoids indexing stale allRounds). */
        setRoundsData(rounds, idx) {
            allRounds = rounds; currentRoundIdx = idx;
        },
        /** Reset analysis accumulation state. Call before kicking off a new analysis pass. */
        beginAnalysis() {
            clubDatas.clear(); clubPlayersMap.clear();
            totalExpected = 0; totalProcessed = 0;
        },
    };
    // ─── UI helpers ──────────────────────────────────────────────────────
    const updateProgress = text => {
        const el = document.getElementById('tm_script_progress');
        if (el) el.textContent = text;
    };

    const sortData = (data, col, asc) => {
        data.sort((a, b) => {
            if (col === 'name') return asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            return asc ? a[col] - b[col] : b[col] - a[col];
        });
    };

    const resolveFeedMode = (tabButton, pane) => {
        const buttonId = tabButton?.id || '';
        if (buttonId.startsWith('tab-')) return buttonId.slice(4);
        const tabActive = tabButton?.getAttribute?.('tab_active') || '';
        if (tabActive === 'league_pa') return 'pa';
        if (tabActive === 'feed') return 'league';
        const paneEl = pane instanceof Element ? pane : null;
        if (paneEl?.id === 'league_pa') return 'pa';
        if (paneEl?.id === 'feed') return 'league';
        if (paneEl?.id === 'feed_div' || paneEl?.querySelector?.('#feed_div')) return 'pa';
        if (paneEl?.id === 'tabfeed' || paneEl?.querySelector?.('#tabfeed') || paneEl?.querySelector?.('#feed')) return 'league';
        return null;
    };

    const primeLeaguePanelContext = () => {
        const ctx = window.TmLeagueCtx;
        if (!ctx?.setPanelLeague) return;
        const navLink = document.querySelector('.column1 .content_menu a[href*="/league/"], .column1_a .content_menu a[href*="/league/"]');
        if (!navLink) return;
        const parts = navLink.getAttribute('href')?.split('/').filter(Boolean) || [];
        if (parts.length >= 3) ctx.setPanelLeague(parts[1], parts[2], parts[3] || '1');
    };

    const prepareLeagueLayout = () => {
        const main = document.querySelector('.tmvu-main, .main_center');
        if (main) main.classList.add('tmvu-league-layout');

        const mainColumn = document.querySelector('.tmvu-league-main, .column2_a');
        if (mainColumn) {
            mainColumn.classList.remove('column2_a');
            mainColumn.classList.add('tmvu-league-main');
        }

        const sidebarColumn = document.querySelector('.tmvu-league-sidebar, .column3_a, .column3');
        if (sidebarColumn) {
            sidebarColumn.classList.remove('column3_a', 'column3');
            sidebarColumn.classList.add('tmvu-league-sidebar');
        }

        document.querySelectorAll('.column1, .column1_a').forEach(node => node.remove());
    };

    const requestFeedMode = (mode) => {
        if (!mode || lastFeedMode === mode) return;
        lastFeedMode = mode;
        if (typeof window.set_hash === 'function') {
            window.set_hash(mode);
            return;
        }
        if (typeof window.send_and_load === 'function') {
            window.send_and_load(mode);
        }
    };

    const ensureLeagueFeedShell = (feedBox) => {
        if (!feedBox?.parentElement) return { tabsHost: null, contentHost: null };

        let shell = document.querySelector('[data-tmvu-league-feed-shell]');
        if (!shell) {
            shell = document.createElement('section');
            shell.setAttribute('data-tmvu-league-feed-shell', '1');
            feedBox.parentElement.insertBefore(shell, feedBox);
        }

        TmSectionCard.mount(shell, {
            title: 'Feed',
            titleMode: 'body',
            flush: true,
            hostClass: 'tmvu-league-feed-card',
            bodyClass: 'tmvu-league-feed-card-body',
            bodyHtml: '<div data-tmvu-league-feed-tabs="1"></div><div data-tmvu-league-feed-panels="1"></div>',
        });

        return {
            tabsHost: shell.querySelector('[data-tmvu-league-feed-tabs]'),
            contentHost: shell.querySelector('[data-tmvu-league-feed-panels]'),
        };
    };

    const patchFeedBox = () => {
        try {
            const feedBox = document.querySelector('#feed')?.closest('.box') || document.querySelector('#tabfeed')?.closest('.box');
            if (!feedBox) return;
            if (feedClassObserver) {
                feedClassObserver.disconnect();
                feedClassObserver = null;
            }
            const tabsOuter = feedBox.querySelector('.tabs_outer');
            const nativeTabs = Array.from(feedBox.querySelectorAll('.tabs_new > div, .tmvu-native-feed-tabs > div'));
            const content = feedBox.querySelector('.tabs_content');
            const paneNodes = Array.from(content?.children || []);
            const shell = ensureLeagueFeedShell(feedBox);
            const tabsHost = shell.tabsHost;
            const contentHost = shell.contentHost;
            const tabItems = nativeTabs.map((button, index) => {
                const pane = paneNodes[index] || null;
                const label = clean(button.textContent) || `Tab ${index + 1}`;
                const key = resolveFeedMode(button, pane) || `feed-${index}`;
                return {
                    key,
                    label,
                    pane,
                };
            }).filter(item => item.pane && (item.key === 'pa' || item.key === 'league'));

            if (!content || !tabItems.length || !tabsHost || !contentHost) return;

            feedBox.classList.add('tmvu-league-feed-native-source');
            feedBox.hidden = true;
            feedBox.style.display = 'none';

            tabsOuter?.setAttribute('hidden', 'hidden');
            tabsOuter && (tabsOuter.style.display = 'none');
            content.classList.add('tmvu-native-feed-content');
            content.hidden = true;
            content.style.display = 'none';

            contentHost.innerHTML = '';

            tabItems.forEach((item) => {
                const panel = document.createElement('div');
                panel.setAttribute('data-tmvu-league-panel', item.key);
                panel.className = 'tmvu-league-feed-panel';
                contentHost.appendChild(panel);

                if (item.key === 'pa') {
                    panel.appendChild(item.pane);
                } else {
                    const mount = document.createElement('div');
                    mount.setAttribute('data-tmvu-league-feed-mount', '1');
                    panel.appendChild(mount);
                    leagueFeedMount = mount;
                }
            });

            const getActiveMode = () => {
                const activeButton = nativeTabs.find((button) => button.classList.contains('active_tab'));
                const activePane = tabItems.find((item) => item.pane?.style.display !== 'none');
                return resolveFeedMode(activeButton || null, activePane?.pane || null) || activePane?.key || tabItems[0]?.key || 'league';
            };

            const activateMode = (mode) => {
                tabItems.forEach((item) => {
                    const panel = contentHost.querySelector(`[data-tmvu-league-panel="${item.key}"]`);
                    if (panel) panel.style.display = item.key === mode ? '' : 'none';
                    if (item.pane) item.pane.style.display = item.key === mode ? '' : 'none';
                });

                tabsHost.innerHTML = '';
                tabsHost.appendChild(TmUI.tabs({
                    items: tabItems.map(({ key, label }) => ({ key, label })),
                    active: mode,
                    stretch: true,
                    onChange: (key) => {
                        activateMode(key);
                    },
                }));

                if (mode === 'league') mountLeagueFeed();
            };

            activateMode(getActiveMode());
        } catch (e) { }
    };

    const getLeagueFeedParams = () => {
        const country = panelCountry || leagueCountry || '';
        const division = panelDivision || leagueDivision || '';
        const group = panelGroup || leagueGroup || '1';
        return { country, division, group };
    };

    const renderLeagueFeed = () => {
        const mount = leagueFeedMount;
        if (!leagueFeedController || !mount) return Promise.resolve(false);
        if (leagueFeedRenderPromise) return leagueFeedRenderPromise;

        leagueFeedRenderPromise = leagueFeedController.render().catch(() => {
            mount.innerHTML = '<div class="tmvu-home-empty">Unable to load league feed.</div>';
            return false;
        }).finally(() => {
            leagueFeedRenderPromise = null;
        });

        return leagueFeedRenderPromise;
    };

    const mountLeagueFeed = () => {
        const feedRoot = document.querySelector('#feed');
        const mount = leagueFeedMount;
        if (!feedRoot || !mount) return;

        TmNativeFeed.sanitizeFeedRoot(feedRoot);
        feedRoot.classList.add('tmvu-social-feed-source', 'tmvu-social-feed-source--hidden');
        feedRoot.hidden = true;
        feedRoot.style.display = 'none';

        if (!leagueFeedController) {
            leagueFeedController = createSocialFeedController({
                mount,
                getFeedRoot: () => document.querySelector('#feed'),
                fetchFeedPayload: ({ lastPost }) => {
                    const params = getLeagueFeedParams();
                    return TmApi.fetchDetailedUserFeed({
                        feedId: '0',
                        buddies: false,
                        personal: false,
                        leagueCountry: params.country,
                        leagueDivision: params.division,
                        leagueGroup: params.group,
                        onlySystemPosts: true,
                        lastPost,
                    });
                },
                emptyCopy: 'No league feed items found.',
                loadingCopy: 'Loading league feed...',
            });
        }

        renderLeagueFeed();
    };

    const injectStyles = () => TmLeagueStyles.inject();

    const cleanupPage = () => {
        if (leaguePollInterval) { clearInterval(leaguePollInterval); leaguePollInterval = null; }
        if (analysisInterval) { clearInterval(analysisInterval); analysisInterval = null; }
        if (feedClassObserver) { feedClassObserver.disconnect(); feedClassObserver = null; }
        if (leagueFeedObserver) { leagueFeedObserver.disconnect(); leagueFeedObserver = null; }
        leagueFeedController = null;
        leagueFeedMount = null;
        leagueFeedRenderPromise = null;
        allRounds = [];
        currentRoundIdx = 0;
        fixturesCache = null;
        totrCurrentDate = null;
        Object.keys(totrCache).forEach(k => delete totrCache[k]);
        panelLeagueName = '';
        clubDatas = new Map();
        clubMap = new Map();
        clubPlayersMap = new Map();
        squadCache.clear();
        tooltipCache.clear();
        totalExpected = 0;
        totalProcessed = 0;
        skillData = [];
        standingsRows = [];
        formOffset = 0;
        const navTabs = document.getElementById('tsa-nav-tabs');
        if (navTabs) navTabs.remove();
        const sp = document.getElementById('tsa-standings-panel');
        if (sp) sp.remove();
        const nativeTable = document.getElementById('overall_table');
        if (nativeTable) {
            const wrapper = nativeTable.closest('.box') || nativeTable.parentElement;
            if (wrapper) wrapper.style.display = '';
        }
    };

    const initForCurrentPage = () => {
        const path = window.location.pathname;
        if (path === lastInitPath) return;
        lastInitPath = path;
        pagePath = path;
        isLeaguePage = /^\/league\//.test(path);
        const urlParts = path.split('/').filter(Boolean);
        leagueCountry = isLeaguePage ? urlParts[1] : null;
        leagueDivision = isLeaguePage ? urlParts[2] : null;
        leagueGroup = isLeaguePage ? (urlParts[3] || '1') : null;
        cleanupPage();
        injectStyles();
        primeLeaguePanelContext();
        patchFeedBox();
        prepareLeagueLayout();

        // Remove TM's default Rounds widget and ad placeholder
        try { $('.banner_placeholder.rectangle')[0].parentNode.removeChild($('.banner_placeholder.rectangle')[0]); } catch (e) { }
        try { $('.tmvu-league-sidebar .box').has('h2').filter(function () { return $(this).find('h2').text().trim().toUpperCase() === 'ROUNDS'; }).remove(); } catch (e) { }

        const initUI = () => {
            const clubLinks = $('#overall_table td a[club_link]');
            if (!clubLinks.length) return;
            clearInterval(leaguePollInterval);
            leaguePollInterval = null;

            $('#overall_table td').each(function () {
                const id = $(this).children('a').attr('club_link');
                if (id) clubMap.set(id, $(this).children('a')[0].innerHTML);
            });

            // Inject our custom standings panel & initial render (form added after fixtures load)
            TmLeaguePanel.injectStandingsPanel();
            TmLeagueStandings.buildStandingsFromDOM();
            TmLeagueStandings.renderLeagueTable();

            $(".tmvu-league-sidebar").append('<div id="rnd-panel"></div>');

            $(".tmvu-league-sidebar").append(`
                <div class="tmu-card mt-2">
                    <div class="tmu-card-head">Squad Analysis</div>
                    <div class="tsa-controls">
                        <span>Last</span>
                        ${inputHtml({
                id: 'tm_script_num_matches',
                type: 'number',
                size: 'xs',
                align: 'center',
                value: numLastRounds,
                min: 1,
                max: 34,
            })}
                        <span>rounds</span>
                        <span id="tm_script_analyze_mount"></span>
                        <span id="tm_script_progress" class="tsa-progress"></span>
                    </div>
                    <div id="tsa-content"></div>
                </div>
            `);

            const analyzeMount = document.getElementById('tm_script_analyze_mount');
            if (analyzeMount) {
                analyzeMount.appendChild(TmButton.button({
                    id: 'tm_script_analyze_btn',
                    label: 'Analyze',
                    color: 'primary',
                    size: 'sm',
                }));
            }

            document.getElementById('tm_script_analyze_btn').addEventListener('click', () => {
                const n = parseInt($('#tm_script_num_matches').val()) || 5;
                localStorage.setItem(STORAGE_KEY, n);
                TmLeagueRounds.startAnalysis(n);
            });
            TmLeagueRounds.startAnalysis(numLastRounds);
        };

        leaguePollInterval = setInterval(initUI, 500);
        initUI();
    };

    TmPlayerDB.init().catch(e => console.warn('[League] TmPlayerDB init failed:', e));
    setInterval(initForCurrentPage, 500);
    initForCurrentPage();
})();
