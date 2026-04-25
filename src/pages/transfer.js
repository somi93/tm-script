import { TmPlayerTooltip } from '../components/player/tooltip/tm-player-tooltip.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmBidsDialog } from '../components/bids/tm-bids-dialog.js';
import { TmTransferSidebar } from '../components/transfer/tm-transfer-sidebar.js';
import { TmTransferStyles } from '../components/transfer/tm-transfer-styles.js';
import { TmPlayersTable } from '../components/shared/tm-players-table.js';
import { TmTransferTable } from '../components/transfer/tm-transfer-table.js';
import { TmTransferModel } from '../models/transfer.js';
import { TmPlayerModel } from '../models/player.js';
import { TmTransferFilters } from '../components/transfer/tm-transfer-filters.js';
import { TmUtils } from '../lib/tm-utils.js';

export function initTransferPage(main) {
    if (!main || !main.isConnected) return;

    let allPlayers = [];
    let isLoading = false;
    const tooltipPromiseCache = new Map();
    let tooltipFetchAbort = false;
    let findAllRunning = false;
    let findAllAbort = false;
    let _tableWrap = null;
    let _refreshPending = false;
    let _tickInterval = null;

    function _fmtTime(sec) {
        const s = Math.max(0, sec);
        const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
        if (d > 0) return `${d}d ${h}h`;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m ${s % 60}s`;
    }

    function startTick() {
        if (_tickInterval) clearInterval(_tickInterval);
        const sessionId = window.SESSION?.main_id || window.SESSION?.club_id || window.SESSION?.id || '';

        _tickInterval = setInterval(() => {
            let needsRefresh = false;
            for (const p of allPlayers) {
                if (p.timeleft <= 0) continue;

                // ── live bid poll ──────────────────────────────────────
                const pollInterval = p.timeleft <= 120 ? 10 : 60;
                p._pollCountdown = (p._pollCountdown ?? pollInterval) - 1;
                if (p._pollCountdown <= 0) {
                    p._pollCountdown = p.timeleft <= 120 ? 10 : 60;
                    if (sessionId) {
                        TmTransferModel.fetchTransferBidDialog(p.id, sessionId).then(data => {
                            if (!data) return;
                            const fresh = Number(data.deadline);
                            if (Number.isFinite(fresh) && fresh >= 0) p.timeleft = fresh;
                            if (data.transfer?.next_bid != null) {
                                p.next_bid = data.transfer.next_bid;
                                const bid = data.transfer.current_bid ?? data.transfer.bid ?? null;
                                if (bid != null) {
                                    p.bid = bid;
                                    p.curbid = TmUtils.fmtCoins(bid);
                                }
                            }
                        });
                    }
                }

                // ── local tick ────────────────────────────────────────
                p.timeleft--;
                p.timeleft_string = _fmtTime(p.timeleft);
                if (p.timeleft <= 0) { needsRefresh = true; continue; }
                const span = document.querySelector(`[data-time-pid="${p.id}"]`);
                if (!span) continue;
                span.textContent = p.timeleft_string;
                if (p.timeleft < 3600) span.classList.add('tmpt-time-exp');
            }
            if (needsRefresh) scheduleRefresh();
        }, 1000);
    }

    function stopTick() {
        if (_tickInterval) { clearInterval(_tickInterval); _tickInterval = null; }
    }

    function processPlayer(p) {
        return TmTransferModel.normalizeTransferPlayer(p);
    }

    function scheduleRefresh() {
        if (_refreshPending) return;
        _refreshPending = true;
        requestAnimationFrame(() => { _refreshPending = false; refreshDisplay(); });
    }

    // ═══════════════════════════════════════════════════════════════════
    //  FILTER + SORT + REFRESH
    // ═══════════════════════════════════════════════════════════════════

    function getVisible() {
        const pf = TmTransferFilters.getPostFilters();
        return allPlayers
            .filter(player => TmTransferFilters.passesPostFilters(player, pf))
            .sort((a, b) => (b.bump ? 1 : 0) - (a.bump ? 1 : 0));
    }

    function refreshDisplay() {
        const container = document.getElementById('tms-table-wrap');
        if (!container) return;

        const visiblePlayers = getVisible();
        document.getElementById('tms-hits').textContent = visiblePlayers.length;

        if (!visiblePlayers.length) {
            container.innerHTML = TmUI.empty('No players found. Try adjusting your filters.');
            _tableWrap = null;
            return;
        }

        const adapted = visiblePlayers;

        if (_tableWrap) {
            _tableWrap.refresh(adapted);
            return;
        }

        container.innerHTML = '';
        _tableWrap = TmPlayersTable.mount(container, adapted, TmTransferTable.MOUNT_OPTIONS);

        // Hover tooltip on player name
        container.addEventListener('mouseover', e => {
            const playerRow = e.target.closest('tr[data-pid]');
            if (!playerRow || !container.contains(playerRow)) return;
            const playerId = playerRow.dataset.pid;
            const player = allPlayers.find(x => String(x.id) === playerId);
            if (!player) return;
            const anchor = playerRow.querySelector('.tmpt-link') || playerRow;
            TmPlayerTooltip.show(anchor, player);
            if (!player.tooltipFetched) {
                fetchOnePlayer(player).then(() => {
                    if (playerRow.matches(':hover'))
                        TmPlayerTooltip.show(anchor, player);
                });
            }
        });
        container.addEventListener('mouseout', e => {
            if (e.target.closest('tr[data-pid]')) TmPlayerTooltip.hide();
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    //  TOOLTIP BACKGROUND FETCHER
    // ═══════════════════════════════════════════════════════════════════

    function updateTooltipCells(p) {
        const recVal = p.rec;
        const pf = TmTransferFilters.getPostFilters();
        const failsRec = (() => {
            if (recVal == null) return false;
            const decMin = parseFloat(document.getElementById('tms-rmin').value) || 0;
            const decMax = parseFloat(document.getElementById('tms-rmax').value);
            const maxVal = isNaN(decMax) ? 5 : decMax;
            return (decMin > 0 || maxVal < 5) && (recVal < decMin || recVal > maxVal);
        })();
        const failsR5 = p.r5 != null
            ? ((pf.r5min !== null && p.r5 < pf.r5min) || (pf.r5max !== null && p.r5 > pf.r5max))
            : ((pf.r5min !== null && p.r5Hi != null && p.r5Hi < pf.r5min) ||
                (pf.r5max !== null && p.r5Lo != null && p.r5Lo > pf.r5max));
        const failsTI = (pf.timin !== null && p.ti != null && p.ti < pf.timin) ||
            (pf.timax !== null && p.ti != null && p.ti > pf.timax);
        if (failsRec || failsR5 || failsTI) {
            allPlayers = allPlayers.filter(pl => pl.id !== p.id);
        }
        scheduleRefresh();
    }

    async function fetchOnePlayer(player) {
        if (player.tooltipFetched) return player;
        const playerId = String(player.id);
        if (tooltipPromiseCache.has(playerId)) return tooltipPromiseCache.get(playerId);

        const request = TmPlayerModel.fetchTooltipCached(playerId)
            .then(data => {
                const result = TmTransferModel.enrichTransferFromTooltip(player, data);
                if (!result) return null;
                updateTooltipCells(player);
                return player;
            })
            .finally(() => {
                tooltipPromiseCache.delete(playerId);
            });

        tooltipPromiseCache.set(playerId, request);
        return request;
    }

    async function startTooltipFetch(players) {
        tooltipFetchAbort = false;
        const uncached = players.filter(player => !player.tooltipFetched && !tooltipPromiseCache.has(String(player.id)));
        // Fire all in parallel — browser caps at ~6 concurrent naturally
        await Promise.all(uncached.map(async player => {
            if (!tooltipFetchAbort) await fetchOnePlayer(player);
        }));
    }

    // ═══════════════════════════════════════════════════════════════════
    //  SEARCH
    // ═══════════════════════════════════════════════════════════════════

    function doSearch() {
        if (isLoading) return;
        isLoading = true;
        tooltipFetchAbort = true;
        findAllAbort = true;
        stopTick();
        _tableWrap = null;
        document.getElementById('tms-table-wrap').innerHTML = TmUI.loading('Searching transfer market…');

        // Clear old countdowns
        if (window.countDowns) {
            for (const id in window.countDowns) { window.countDowns[id] = null; }
            window.countDowns = {};
        }

        const hash = TmTransferFilters.buildHash();
        const clubId = window.SESSION ? window.SESSION.id : 0;

        TmTransferModel.fetchTransferSearch(hash, clubId).then(function (data) {
            isLoading = false;

            if (!data) {
                document.getElementById('tms-table-wrap').innerHTML = TmUI.error('No data received. Please try again.');
                return;
            }
            if (data.refresh) { location.reload(); return; }

            const raw = Array.isArray(data.list) ? data.list : [];
            window.transfer_info_ar = raw;
            allPlayers = raw.map(processPlayer);
            refreshDisplay();
            startTick();
            // Start background tooltip enrichment
            tooltipFetchAbort = true; // abort any previous fetch
            setTimeout(() => startTooltipFetch(allPlayers), 300);
        }).catch(function (error) {
            console.warn('[TMS] Search failed', error);
            isLoading = false;
            document.getElementById('tms-table-wrap').innerHTML = TmUI.error('Network error. Please try again.');
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    //  FIND ALL PLAYERS (exhaustive cartesian scan: pos × age × rec)
    // ═══════════════════════════════════════════════════════════════════

    function fetchWithHash(hash) {
        const clubId = window.SESSION ? window.SESSION.id : 0;
        return TmTransferModel.fetchTransferSearch(hash, clubId)
            .then(data => Array.isArray(data?.list) ? data.list : []);
    }

    const showModal = (opts) => TmUI.modal(opts);

    const promptModal = (opts) => TmUI.prompt(opts);

    async function findAllPlayers() {
        if (isLoading || findAllRunning) return;

        // Warn if age range > 3 years and no position/rec filter is set
        const _amin = Math.max(18, parseInt(document.getElementById('tms-amin').value) || 18);
        const _amax = Math.min(37, parseInt(document.getElementById('tms-amax').value) || 37);
        const _hasPos = document.querySelectorAll('[data-fp].active').length > 0;
        const _rmin = parseFloat(document.getElementById('tms-rmin').value) || 0;
        const _rmax = parseFloat(document.getElementById('tms-rmax').value);
        const _hasRec = _rmin > 0 || (!isNaN(_rmax) && _rmax < 5);
        if ((_amax - _amin) > 3 && !_hasPos && !_hasRec) {
            const choice = await showModal({
                icon: '⚠️',
                title: 'This scan may take a long time',
                message: 'A wide age range is selected and no <strong class="tmu-text-strong">position</strong> or ' +
                    '<strong class="tmu-text-strong">recommendation</strong> filter is active.<br><br>' +
                    'Consider adding one to speed things up significantly.',
                buttons: [
                    { label: 'Proceed Anyway', value: 'ok', style: 'secondary' },
                    { label: 'Cancel', value: 'cancel', style: 'danger' },
                ],
            });
            if (choice !== 'ok') return;
        }

        findAllRunning = true;
        findAllAbort = false;
        tooltipFetchAbort = true;
        stopTick();

        if (window.countDowns) {
            for (const id in window.countDowns) window.countDowns[id] = null;
            window.countDowns = {};
        }

        const base = TmTransferFilters.readBaseFilters();
        const rminNum = Math.max(0, TmTransferFilters.decRecToTM(base.rmin));
        const rmaxNum = Math.min(10, TmTransferFilters.decRecToTM(parseFloat(base.rmax) || 5));
        const aminNum = Math.max(18, parseInt(base.amin) || 18);
        const amaxNum = Math.min(37, parseInt(base.amax) || 37);

        // ── 1. Position combos: respect user's sidebar selection ──────────
        const activeFps = [...document.querySelectorAll('[data-fp].active')].map(el => el.dataset.fp);
        const fpKeys = activeFps.length ? activeFps : Object.keys(TmTransferFilters.FP_MAP);
        const posCombos = fpKeys.map(fp => {
            const m = TmTransferFilters.FP_MAP[fp];
            return { positions: [m.group], sides: m.side ? [m.side] : [] };
        });

        // ── 2. Age: one step per year ─────────────────────────────────────
        const ages = [];
        for (let a = aminNum; a <= amaxNum; a++) ages.push(a);

        // ── 3. Rec: one step per unit ─────────────────────────────────────
        const recRanges = [];
        for (let r = rminNum; r < rmaxNum; r++) recRanges.push([r, r + 1]);
        if (recRanges.length === 0) recRanges.push([rminNum, rmaxNum]);

        // ── 4. Full cartesian product ─────────────────────────────────────
        const tasks = [];
        for (const pos of posCombos) {
            for (const age of ages) {
                for (const [lo, hi] of recRanges) {
                    tasks.push({ pos, age, recLo: lo, recHi: hi });
                }
            }
        }

        const collected = new Map();
        const total = tasks.length;
        let done = 0;

        const updateProgress = () => {
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            document.getElementById('tms-table-wrap').innerHTML = TmUI.loading(`Scanning… ${done}/${total} (${pct}%) - ${collected.size} players found...`);
        };
        updateProgress();

        // Fire all tasks in parallel; browser naturally caps at ~6 concurrent
        await Promise.all(tasks.map(async (task) => {
            if (findAllAbort) return;
            const hash = TmTransferFilters.buildHashRaw({
                ...base,
                positions: task.pos.positions,
                sides: task.pos.sides,
                amin: String(task.age),
                amax: String(task.age),
                rmin: String(task.recLo),
                rmax: String(task.recHi),
            });
            const result = await fetchWithHash(hash);
            if (!findAllAbort) {
                for (const p of result) collected.set(p.id, p);
            }
            done++;
            updateProgress();
        }));

        findAllRunning = false;
        if (findAllAbort) return;

        const foundCount = collected.size;
        let fetchTooltips = true;
        if (foundCount > 600) {
            const choice = await showModal({
                icon: '📊',
                title: `${foundCount} players found`,
                message: 'Fetching full stats (R5, Rec, TI) for this many players may take several minutes.' +
                    '<br><br>Or get an <strong class="tmu-text-strong">instant R5 range estimate</strong> ' +
                    'based on transfer-data skills and assumed routine ' +
                    '<span class="tmu-text-main">0 – 4.2 × (age − 15)</span>, with no API calls.',
                buttons: [
                    { label: 'Full Analysis', value: 'full', style: 'primary', sub: 'Fetches R5 · Rec · TI via tooltip API — slower' },
                    { label: 'Quick Estimate', value: 'estimate', style: 'secondary', sub: 'Shows R5 range instantly, no extra API calls' },
                    { label: 'Cancel', value: 'cancel', style: 'danger' },
                ],
            });
            if (choice === 'cancel') return;
            fetchTooltips = (choice === 'full');
        }

        allPlayers = [...collected.values()].map(processPlayer);
        _tableWrap = null;
        refreshDisplay();
        startTick();
        if (fetchTooltips) setTimeout(() => startTooltipFetch(allPlayers), 300);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  LAYOUT
    // ═══════════════════════════════════════════════════════════════════

    function buildLayout() {
        if (document.getElementById('tms-main') || document.getElementById('tms-sidebar')) return;
        const layoutHtml = `
  ${TmTransferSidebar.build()}
    <div id="tms-main" class="tmvu-transfer-main tmu-panel">
    <div id="tms-toolbar">
      <span id="tms-hits">0</span>
      <span class="tms-toolbar-label"> players</span>
    </div>
    <div id="tms-table-wrap">
            ${TmUI.loading('Loading transfer market…')}
    </div>
  </div>
<div id="transfer_list" style="display:none"></div>
        `;

        main.classList.add('tmvu-transfer-page');
        main.querySelectorAll('.column1_d').forEach(node => node.remove());
        const outer = document.getElementById('tms-outer');
        if (outer) outer.style.display = 'none';
        main.insertAdjacentHTML('beforeend', layoutHtml);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  EVENT BINDING
    // ═══════════════════════════════════════════════════════════════════

    function bindEvents() {
        document.addEventListener('click', async e => {
            if (e.target.closest('#tms-search-btn')) { doSearch(); return; }

            const reloadBtn = e.target.closest('[data-transfer-reload]');
            if (reloadBtn) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                const pid = reloadBtn.dataset.pid;
                const player = allPlayers.find(x => x.id == pid);
                if (!player) return;
                reloadBtn.classList.add('tms-reloading');
                player.tooltipFetched = false;
                fetchOnePlayer(player).then(() => {
                    const container = document.getElementById('tms-table-wrap');
                    const row = container?.querySelector(`tr[data-pid="${player.id}"]`);
                    if (row?.matches(':hover')) {
                        const anchor = row.querySelector('.tmpt-link') || row;
                        TmPlayerTooltip.show(anchor, player);
                    }
                });
                return;
            }

            const bidBtn = e.target.closest('[data-transfer-bid]');
            if (bidBtn) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                const pid = bidBtn.dataset.pid;
                const player = allPlayers.find(x => String(x.id) === pid);
                if (player) TmBidsDialog.open(player);
                return;
            }

            const row = e.target.closest('#tms-table-wrap tr[data-pid]');
            if (row && !e.target.closest('[data-transfer-bid],[data-transfer-reload],a,button,input')) {
                const pid = row.dataset.pid;
                const player = allPlayers.find(x => String(x.id) === pid);
                if (player && Number(player.timeleft) > 0) TmBidsDialog.open(player);
                return;
            }

            const fpBtn = e.target.closest('[data-fp]');
            if (fpBtn) { fpBtn.classList.toggle('active'); return; }

            if (e.target.closest('#tms-findall-btn')) { findAllPlayers(); return; }

            const moreToggle = e.target.closest('#tms-more-toggle');
            if (moreToggle) {
                moreToggle.classList.toggle('open');
                document.getElementById('tms-more-body').classList.toggle('open');
                return;
            }

            if (e.target.closest('#tms-filter-save-btn')) {
                const currentSel = document.getElementById('tms-saved-filters-sel').value;
                const name = await promptModal({
                    icon: '💾',
                    title: 'Save Current Filter',
                    placeholder: 'Enter filter name…',
                    defaultValue: currentSel || '',
                });
                if (!name) return;
                TmTransferFilters.saveNamedFilter(name, TmTransferFilters.readCurrentFilterState());
                TmTransferFilters.populateSavedFiltersDropdown();
                document.getElementById('tms-saved-filters-sel').value = name;
                return;
            }

            if (e.target.closest('#tms-filter-load-btn')) {
                const name = document.getElementById('tms-saved-filters-sel').value;
                if (!name) return;
                const state = TmTransferFilters.getSavedFilters()[name];
                if (!state) return;
                TmTransferFilters.applyFilterState(state);
                doSearch();
                return;
            }

            if (e.target.closest('#tms-filter-del-btn')) {
                const name = document.getElementById('tms-saved-filters-sel').value;
                if (!name) return;
                const confirmed = await showModal({
                    icon: '🗑️',
                    title: 'Delete saved filter',
                    message: `Delete "<strong class="tmu-text-strong">${name}</strong>"?`,
                    buttons: [
                        { label: 'Delete', value: 'ok', style: 'danger' },
                        { label: 'Cancel', value: 'cancel', style: 'secondary' },
                    ],
                });
                if (confirmed !== 'ok') return;
                TmTransferFilters.deleteNamedFilter(name);
                TmTransferFilters.populateSavedFiltersDropdown();
                return;
            }
        });

        document.addEventListener('keydown', e => {
            if (e.target.closest('#tms-sidebar') && e.key === 'Enter') doSearch();
        });

        document.addEventListener('input', e => {
            if (e.target.matches('#tms-r5min, #tms-r5max, #tms-timin, #tms-timax')) refreshDisplay();
        });
    }

    function init() {
        TmTransferStyles.inject();
        buildLayout();
        bindEvents();
        TmTransferFilters.populateSavedFiltersDropdown();
        doSearch();
    }
    init();
}
