import { TmLeaguePanel } from '../components/league/tm-league-panel.js';
import { TmLeagueRounds } from '../components/league/tm-league-rounds.js';
import { TmLeagueStandings } from '../components/league/tm-league-standings.js';
import { TmLeagueStyles } from '../components/league/tm-league-styles.js';
import { TmButton } from '../components/shared/tm-button.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { createSocialFeedController } from '../components/shared/tm-social-feed.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmConst } from '../lib/tm-constants.js';
import { fetchRawPlayers } from '../models/club.js';
import { TmMessagesModel } from '../models/messages.js';
import { TmPlayerModel } from '../models/player.js';
import { TmUtils } from '../lib/tm-utils.js';

export function initLeaguePage(main) {
    if (!main || !main.isConnected) return;

    // ─── Constants ───────────────────────────────────────────────────────
    const STORAGE_KEY = 'TM_LEAGUE_LINEUP_NUM_ROUNDS';

    const SKILL_NAMES_FIELD = TmConst.SKILL_DEFS_OUT.map(d => d.label || d.key);
    const SKILL_NAMES_GK = TmConst.SKILL_DEFS_GK.map(d => d.label || d.key);

    const { REC_THRESHOLDS, R5_THRESHOLDS, AGE_THRESHOLDS } = TmConst;
    const htmlOf = node => node?.outerHTML || '';
    const inputHtml = opts => htmlOf(TmUI.input({ tone: 'overlay', density: 'regular', ...opts }));
    const appendHtml = (parent, html) => {
        if (!parent) return null;
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        const fragment = template.content;
        const firstElement = fragment.firstElementChild || null;
        parent.appendChild(fragment);
        return firstElement;
    };
    const getLeagueRouteParams = (path = window.location.pathname) => {
        const parts = path.split('/').filter(Boolean);
        const isLeagueRoute = /^\/league\//.test(path);
        return {
            leagueCountry: isLeagueRoute ? parts[1] : null,
            leagueDivision: isLeagueRoute ? parts[2] : null,
            leagueGroup: isLeagueRoute ? (parts[3] || '1') : null,
        };
    };

    // ─── Squad fetching (one call per club per analysis run) ───────────────
    // Each entry resolves to {id, name, squad: [normalizedPlayer, ...]}
    const squadCache = new Map(); // clubId → Promise<{id, name, squad}>

    const fetchSquad = (clubId, name = '') => {
        if (!squadCache.has(clubId)) {
            squadCache.set(clubId, fetchRawPlayers(clubId).then(players => {
                const result = { id: String(clubId), name, squad: players || [] };
                if (!result.squad.length) squadCache.delete(clubId);
                return result;
            }).catch(() => {
                squadCache.delete(clubId);
                return { id: String(clubId), name, squad: [] };
            }));
        }
        return squadCache.get(clubId);
    };

    // ─── Per-player R5 resolution ─────────────────────────────────────────
    // squadData is the fetchSquad result: {id, name, squad: [normalizedPlayer]}.
    // players_get_select.ajax.php returns only minimal data (no ASI, no skills, no age),
    // so we always need a tooltip fetch to get real R5/REC.
    // The squad pre-fetch is still useful to avoid duplicate tooltip fetches for the same club.
    const getPlayerDataFromSquad = async (pid, squadData, matchPos) => {
        // players_get_select only gives name/fp/no — no asi/skills → always need tooltip for ratings
        let player = await TmPlayerModel.fetchTooltipCached(pid).catch(() => null);
        // squad fallback: if tooltip fails (e.g. player deleted), try squad data
        if (!player) {
            player = (squadData.squad || []).find(p => String(p.id) === String(pid)) || null;
        }
        if (!player) return { Age: 0, R5: 0, REC: 0, isGK: false, skills: [], routine: 0 };
        const posData = player.positions?.find(p => p.key?.toLowerCase() === matchPos);
        const posR5  = posData ? Number(posData.r5)  : NaN;
        const posRec = posData ? Number(posData.rec) : NaN;
        const r5  = Number.isFinite(posR5)  ? posR5  : (Number.isFinite(Number(player.r5))  ? Number(player.r5)  : 0);
        const rec = Number.isFinite(posRec) ? posRec : (Number.isFinite(Number(player.rec)) ? Number(player.rec) : 0);
        const age = Number.isFinite(player.ageMonths) ? player.ageMonths : 0;
        return { Age: age, R5: r5, REC: rec, isGK: player.isGK, skills: player.skills, routine: player.routine };
    };

    // ─── Team statistics (average R5 of 11 starters) ─────────────────────
    const computeTeamStats = async (playerIds, lineup, squadData) => {
        const starters = playerIds.filter(id => !lineup[id].position.includes('sub'));
        const players = await Promise.all(starters.map(async id => {
            const matchPos = lineup[id].position;
            const p = await getPlayerDataFromSquad(id, squadData, matchPos);
            return { id, name: lineup[id].name || String(id), pos: matchPos, ...p };
        }));
        const totals = { Age: 0, REC: 0, R5: 0 };
        players.forEach(p => { totals.Age += p.Age; totals.REC += p.REC; totals.R5 += p.R5; });
        return { totals, players };
    };

    // Page type detection
    let lastInitPath = '';
    let leagueBootstrapped = false;
    let leaguePollInterval = null;
    let leagueFeedController = null;
    let leagueFeedMount = null;
    let leagueFeedRenderPromise = null;

    // ─── State ───────────────────────────────────────────────────────────
    let { leagueCountry, leagueDivision, leagueGroup } = getLeagueRouteParams();

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

    const primeLeaguePanelContext = () => {
        const ctx = window.TmLeagueCtx;
        if (!ctx?.setPanelLeague) return;
        const navLink = document.querySelector('.column1 .content_menu a[href*="/league/"], .column1_a .content_menu a[href*="/league/"]');
        if (!navLink) return;
        const parts = navLink.getAttribute('href')?.split('/').filter(Boolean) || [];
        if (parts.length >= 3) ctx.setPanelLeague(parts[1], parts[2], parts[3] || '1');
    };

    const prepareLeagueLayout = () => {
        const main = document.querySelector('.tmvu-main');
        if (!main) return { mainHost: null, sidebarHost: null };
        main.classList.add('tmvu-league-layout');

        let mainHost = main.querySelector(':scope > .tmvu-league-main');
        if (!mainHost) {
            mainHost = document.createElement('section');
            mainHost.className = 'tmvu-league-main';
            main.appendChild(mainHost);
        }

        let sidebarHost = main.querySelector(':scope > .tmvu-league-sidebar');
        if (!sidebarHost) {
            sidebarHost = document.createElement('aside');
            sidebarHost.className = 'tmvu-league-sidebar';
            main.appendChild(sidebarHost);
        }

        return { mainHost, sidebarHost };
    };

    const getLeagueMainHost = () => document.querySelector('.tmvu-main > .tmvu-league-main');

    const getLeagueSidebarHost = () => document.querySelector('.tmvu-main > .tmvu-league-sidebar');

    const hasLeagueRoots = () => Boolean(document.querySelector('.tmvu-main') && document.querySelector('#overall_table'));

    const ensureLeagueFeedShell = () => {
        const mainHost = getLeagueMainHost();
        if (!mainHost) return null;

        let shell = document.querySelector('[data-tmvu-league-feed-shell]');
        if (!shell) {
            shell = document.createElement('section');
            shell.setAttribute('data-tmvu-league-feed-shell', '1');
            mainHost.appendChild(shell);
        }

        TmSectionCard.mount(shell, {
            title: 'Feed',
            titleMode: 'body',
            flush: true,
            hostClass: 'tmvu-league-feed-card',
            bodyClass: 'tmvu-league-feed-card-body',
            bodyHtml: '<div data-tmvu-league-feed-mount="1"></div>',
        });

        return shell.querySelector('[data-tmvu-league-feed-mount]');
    };

    const initLeagueFeed = () => {
        try {
            if (!document.querySelector('#feed')) return;
            leagueFeedMount = ensureLeagueFeedShell();
            if (!leagueFeedMount) return;
            mountLeagueFeed();
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
            mount.innerHTML = TmUI.empty('Unable to load league feed.', true);
            return false;
        }).finally(() => {
            leagueFeedRenderPromise = null;
        });

        return leagueFeedRenderPromise;
    };

    const mountLeagueFeed = () => {
        const mount = leagueFeedMount;
        if (!mount) return;

        if (!leagueFeedController) {
            leagueFeedController = createSocialFeedController({
                mount,
                getFeedRoot: () => document.querySelector('#feed'),
                fetchFeedPayload: ({ lastPost }) => {
                    const params = getLeagueFeedParams();
                    return TmMessagesModel.fetchDetailedUserFeed({
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
        totalExpected = 0;
        totalProcessed = 0;
        skillData = [];
        standingsRows = [];
        formOffset = 0;
        document.querySelectorAll('.tmvu-main > .tmvu-league-main, .tmvu-main > .tmvu-league-sidebar').forEach((host) => {
            host.innerHTML = '';
        });
    };

    const initForCurrentPage = () => {
        const path = window.location.pathname;
        const routeChanged = path !== lastInitPath;
        if (routeChanged) {
            lastInitPath = path;
            leagueBootstrapped = false;
            cleanupPage();
        }
        if (leagueBootstrapped || !hasLeagueRoots()) return;

        ({ leagueCountry, leagueDivision, leagueGroup } = getLeagueRouteParams(path));
        injectStyles();
        primeLeaguePanelContext();
        prepareLeagueLayout();
        initLeagueFeed();
        leagueBootstrapped = true;

        const initUI = () => {
            const clubLinks = Array.from(document.querySelectorAll('#overall_table td a[club_link]'));
            if (!clubLinks.length) return;
            clearInterval(leaguePollInterval);
            leaguePollInterval = null;

            document.querySelectorAll('#overall_table td').forEach((cell) => {
                const link = cell.querySelector(':scope > a');
                const id = link?.getAttribute('club_link') || '';
                if (id) clubMap.set(id, link.innerHTML);
            });

            // Inject our custom standings panel & initial render (form added after fixtures load)
            TmLeaguePanel.injectStandingsPanel();
            TmLeagueStandings.buildStandingsFromDOM();
            TmLeagueStandings.renderLeagueTable();

            const sidebar = getLeagueSidebarHost();
            if (!sidebar) return;

            if (!document.getElementById('rnd-panel')) {
                appendHtml(sidebar, '<div id="rnd-panel"></div>');
            }

            if (!document.getElementById('tsa-content')) {
                appendHtml(sidebar, `
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
            }

            const analyzeMount = document.getElementById('tm_script_analyze_mount');
            if (analyzeMount && !document.getElementById('tm_script_analyze_btn')) {
                analyzeMount.appendChild(TmButton.button({
                    id: 'tm_script_analyze_btn',
                    label: 'Analyze',
                    color: 'primary',
                    size: 'sm',
                }));
            }

            document.getElementById('tm_script_analyze_btn').addEventListener('click', () => {
                const input = document.getElementById('tm_script_num_matches');
                const n = parseInt(input?.value, 10) || 5;
                localStorage.setItem(STORAGE_KEY, n);
                TmLeagueRounds.startAnalysis(n);
            });
            TmLeagueRounds.startAnalysis(numLastRounds);
        };

        leaguePollInterval = setInterval(initUI, 500);
        initUI();
    };

    setInterval(initForCurrentPage, 500);
    initForCurrentPage();
}
