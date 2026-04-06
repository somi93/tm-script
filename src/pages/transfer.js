import { TmPlayerTooltip } from '../components/player/tm-player-tooltip.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmTransferSidebar } from '../components/transfer/tm-transfer-sidebar.js';
import { TmTransferStyles } from '../components/transfer/tm-transfer-styles.js';
import { TmTransferTable } from '../components/transfer/tm-transfer-table.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmLib } from '../lib/tm-lib.js';
import { TmTransferService } from '../services/transfer.js';
import { TmPlayerService } from '../services/player.js';
import { TmUtils } from '../lib/tm-utils.js';

export function initTransferPage(main) {
    if (!main || !main.isConnected) return;

    const $ = window.jQuery;
    if (!$) return;

    // ═══════════════════════════════════════════════════════════════════
    //  CONSTANTS
    // ═══════════════════════════════════════════════════════════════════

    const SAVED_FILTERS_KEY = 'tms_saved_filters';

    const { SKILL_KEYS_ALL: ALL_SKILLS, SKILL_LABELS: SKILL_NAMES } = TmConst;

    // Individual formation position → TM API group + side
    const FP_MAP = {
        gk: { group: 'gk', side: null },
        dl: { group: 'de', side: 'le' },
        dc: { group: 'de', side: 'ce' },
        dr: { group: 'de', side: 'ri' },
        dml: { group: 'dm', side: 'le' },
        dmc: { group: 'dm', side: 'ce' },
        dmr: { group: 'dm', side: 'ri' },
        ml: { group: 'mf', side: 'le' },
        mc: { group: 'mf', side: 'ce' },
        mr: { group: 'mf', side: 'ri' },
        oml: { group: 'om', side: 'le' },
        omc: { group: 'om', side: 'ce' },
        omr: { group: 'om', side: 'ri' },
        fc: { group: 'fw', side: null },
    };

    // ═══════════════════════════════════════════════════════════════════
    //  STATE
    // ═══════════════════════════════════════════════════════════════════

    let allPlayers = [];
    let sortKey = 'time';
    let sortDir = 1;  // 1 = asc, -1 = desc
    let isLoading = false;
    let skillsMode = false;
    let tooltipCache = {};   // pid → { recSort, ti, skills }
    const tooltipPromiseCache = new Map();
    let tooltipFetchAbort = false;
    let findAllRunning = false;
    let findAllAbort = false;

    // ═══════════════════════════════════════════════════════════════════
    //  CALCULATION HELPERS
    // ═══════════════════════════════════════════════════════════════════

    const fmtRec = TmTransferTable.fmtRec;
    const tiHtml = TmTransferTable.tiHtml;
    const fmtR5 = TmTransferTable.fmtR5;
    const fmtR5Range = TmTransferTable.fmtR5Range;
    const BREAKDOWN_COLS = TmTransferTable.BREAKDOWN_COLS;

    const getCurrentSession = TmLib.getCurrentSession;
    const CURRENT_SESSION = getCurrentSession();

    // Pre-populate tooltipCache with R5 estimates for players not yet fully fetched
    function computeAllEstimates(players) {
        for (const p of players) {
            if (tooltipCache[p.id] && !tooltipCache[p.id].estimated) continue;
            const est = TmTransferService.estimateTransferPlayer(p);
            if (est) {
                console.log(`[TMS] ${p.name_js || p.name} | age ${p.age} | routineMax ${est.routineMax.toFixed(1)} | R5: ${est.r5Lo != null ? est.r5Lo.toFixed(1) : '?'}-${est.r5Hi != null ? est.r5Hi.toFixed(1) : '?'} | Rec: ${est.recCalc != null ? est.recCalc.toFixed(2) : '?'}`);
                tooltipCache[p.id] = {
                    estimated: true,
                    r5Lo: est.r5Lo, r5Hi: est.r5Hi,
                    recCalc: est.recCalc,
                    r5: null, recSort: null, ti: null, skills: null,
                };
            }
        }
    }

    function processPlayer(p) {
        return TmTransferService.normalizeTransferPlayer(p);
    }

    function tooltipPid(playerOrId) {
        return String(typeof playerOrId === 'object' ? playerOrId?.id : playerOrId);
    }

    function hasFullTooltip(playerOrId) {
        const pid = tooltipPid(playerOrId);
        return !!(tooltipCache[pid] && !tooltipCache[pid].estimated);
    }

    function decRecToTM(val) {
        return Math.min(10, Math.max(0, Math.floor(parseFloat(val) * 2)));
    }

    // ═══════════════════════════════════════════════════════════════════
    //  TABLE RENDER
    // ═══════════════════════════════════════════════════════════════════

    const buildExpandRow = (p, colCount) => TmTransferTable.buildExpandRow(p, tooltipCache, colCount, skillsMode);

    // ═══════════════════════════════════════════════════════════════════
    //  FILTER + SORT + REFRESH
    // ═══════════════════════════════════════════════════════════════════

    function getPostFilters() {
        const r5min = $('#tms-r5min').val(); const r5max = $('#tms-r5max').val();
        const timin = $('#tms-timin').val(); const timax = $('#tms-timax').val();
        return {
            r5min: r5min !== '' ? parseFloat(r5min) : null,
            r5max: r5max !== '' ? parseFloat(r5max) : null,
            timin: timin !== '' ? parseFloat(timin) : null,
            timax: timax !== '' ? parseFloat(timax) : null,
        };
    }

    function passesPostFilters(p, pf) {
        const tip = tooltipCache[p.id];
        if (!tip) return true; // no tooltip yet — show until we know
        if (tip.r5 != null) {
            if (pf.r5min !== null && tip.r5 < pf.r5min) return false;
            if (pf.r5max !== null && tip.r5 > pf.r5max) return false;
        } else {
            if (pf.r5min !== null && tip.r5Hi != null && tip.r5Hi < pf.r5min) return false;
            if (pf.r5max !== null && tip.r5Lo != null && tip.r5Lo > pf.r5max) return false;
        }
        if (pf.timin !== null && tip.ti != null && tip.ti < pf.timin) return false;
        if (pf.timax !== null && tip.ti != null && tip.ti > pf.timax) return false;
        return true;
    }

    function getVisible() {
        const pf = getPostFilters();
        let arr = allPlayers.filter(p => passesPostFilters(p, pf));
        arr.sort((a, b) => {
            // Bump players always float to the top
            if (a.bump && !b.bump) return -1;
            if (!a.bump && b.bump) return 1;
            let av, bv;
            switch (sortKey) {
                case 'name': av = (a.name || '').toLowerCase(); bv = (b.name || '').toLowerCase(); break;
                case 'age': av = a.age || 0; bv = b.age || 0; break;
                case 'rec': {
                    const ta = tooltipCache[a.id]; const tb = tooltipCache[b.id];
                    av = ta && ta.recCalc != null ? ta.recCalc : (ta && ta.recSort != null ? ta.recSort : (a.rec || 0));
                    bv = tb && tb.recCalc != null ? tb.recCalc : (tb && tb.recSort != null ? tb.recSort : (b.rec || 0));
                    break;
                }
                case 'r5': {
                    const ta = tooltipCache[a.id]; const tb = tooltipCache[b.id];
                    av = ta ? (ta.r5 != null ? ta.r5 : (ta.r5Hi != null ? ta.r5Hi : -9999)) : -9999;
                    bv = tb ? (tb.r5 != null ? tb.r5 : (tb.r5Hi != null ? tb.r5Hi : -9999)) : -9999;
                    break;
                }
                case 'ti': {
                    const ta = tooltipCache[a.id]; const tb = tooltipCache[b.id];
                    av = ta && ta.ti != null ? ta.ti : -9999;
                    bv = tb && tb.ti != null ? tb.ti : -9999;
                    break;
                }
                case 'asi': av = a.asi || 0; bv = b.asi || 0; break;
                case 'bid': av = a.bid || 0; bv = b.bid || 0; break;
                default:
                case 'time': av = a.time || 0; bv = b.time || 0; break;
            }
            if (typeof av === 'string') return sortDir * av.localeCompare(bv);
            return sortDir * (av - bv);
        });

        return arr;
    }

    function startCountdowns(arr) {
        arr.forEach(p => {
            if (!p.time || p.time <= 0) return;
            const $span = $(`#tms-td-${p.id}`);
            if (!$span.length) return;

            // Reuse existing countdown if alive
            if (window.countDowns && window.countDowns[p.id]) {
                try { $span.html(window.countDowns[p.id].getJQ()); return; } catch (e) { }
            }

            if (!window.Countdown) { $span.text(p.time + 's'); return; }

            const cd = new window.Countdown(p.time, '', 'highest', true, (cntdwn) => {
                if (!cntdwn || !cntdwn.getJQ) return;
                const $row = cntdwn.getJQ().closest('tr');
                if (!$row.length) return;
                if ($row.hasClass('watched-player-currentbid')) {
                    $row.find('.tms-time-cell').text('Won').removeClass('tms-time-cell');
                } else if ($row.hasClass('watched-player-outbid')) {
                    $row.find('.tms-time-cell').text('Lost').removeClass('tms-time-cell');
                } else {
                    $row.find('td').css({ color: 'var(--tmu-danger)' });
                    $row.find('.tms-bid-btn').remove();
                    cntdwn.getJQ().closest('td').html('—');
                    setTimeout(() => $row.fadeOut(800, () => $row.remove()), 3000);
                }
            });

            if (window.countDowns) window.countDowns[p.id] = cd;
            try { $span.html(cd.getJQ()); } catch (e) { $span.text(p.time + 's'); }
        });
    }

    function removePlayerTip() {
        TmPlayerTooltip.hide();
    }

    function refreshDisplay() {
        const $wrap = $('#tms-table-wrap');
        if (!$wrap.length) return;

        const arr = getVisible();
        $('#tms-hits').text(arr.length);

        if (!arr.length) {
            $wrap.html(TmUI.empty('No players found. Try adjusting your filters.'));
            return;
        }

        if (skillsMode) {
            const tableEl = TmTransferTable.createSkillsTableElement(ALL_SKILLS, SKILL_NAMES, sortKey, sortDir, (key) => {
                const defaultDir = key === 'time' ? 1 : (key === 'name' ? 1 : -1);
                ({ key: sortKey, dir: sortDir } = TmUtils.toggleSort(key, sortKey, sortDir, defaultDir));
                refreshDisplay();
            });
            $wrap.empty().append(tableEl);
            startCountdowns(arr);
        } else {
            const tableEl = TmTransferTable.createBreakdownTableElement(arr, sortKey, sortDir, tooltipCache, (key) => {
                const defaultDir = key === 'time' ? 1 : (key === 'name' ? 1 : -1);
                ({ key: sortKey, dir: sortDir } = TmUtils.toggleSort(key, sortKey, sortDir, defaultDir));
                refreshDisplay();
            });
            $wrap.empty().append(tableEl);
            startCountdowns(arr);
        }

        // Row hover tooltip
        removePlayerTip();
        $('#tms-table tbody')
            .on('mouseenter', '.tms-player-row', function () {
                const pid = $(this).data('pid');
                const player = allPlayers.find(x => x.id == pid);
                if (!player) return;
                const nameCell = this.querySelector('.tms-col-name') || this;
                const $row = $(this);
                TmPlayerTooltip.show(nameCell, TmTransferTable.adaptForTooltip(player, tooltipCache));
                // Fetch tooltip on hover if not yet loaded
                const cachedTip = tooltipCache[pid];
                if (!cachedTip || cachedTip.estimated) {
                    fetchOnePlayer(player).then(() => {
                        if ($row.is(':hover'))
                            TmPlayerTooltip.show(nameCell, TmTransferTable.adaptForTooltip(player, tooltipCache));
                    });
                }
            })
            .on('mouseleave', '.tms-player-row', removePlayerTip);

        // Compatibility hooks
        if (typeof window.make_highlighted_rows === 'function') {
            try { window.make_highlighted_rows(); } catch (e) { }
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  TOOLTIP BACKGROUND FETCHER
    // ═══════════════════════════════════════════════════════════════════

    function updateTooltipCells(pid, tip) {
        const recVal = tip.recCalc != null ? tip.recCalc : tip.recSort;

        // Post-filters: remove rows that no longer pass after tooltip data arrives
        const pf = getPostFilters();
        const failsRec = (() => {
            if (recVal == null) return false;
            const decMin = parseFloat($('#tms-rmin').val()) || 0;
            const decMax = parseFloat($('#tms-rmax').val());
            const maxVal = isNaN(decMax) ? 5 : decMax;
            return (decMin > 0 || maxVal < 5) && (recVal < decMin || recVal > maxVal);
        })();
        const failsR5 = tip.r5 != null
            ? ((pf.r5min !== null && tip.r5 < pf.r5min) || (pf.r5max !== null && tip.r5 > pf.r5max))
            : ((pf.r5min !== null && tip.r5Hi != null && tip.r5Hi < pf.r5min) ||
                (pf.r5max !== null && tip.r5Lo != null && tip.r5Lo > pf.r5max));
        const failsTI = (pf.timin !== null && tip.ti != null && tip.ti < pf.timin) ||
            (pf.timax !== null && tip.ti != null && tip.ti > pf.timax);
        if (failsRec || failsR5 || failsTI) {
            const $row = $(`#player_row_${pid}`);
            $row.next('.tms-expand-row').remove();
            $row.remove();
            allPlayers = allPlayers.filter(p => String(p.id) !== String(pid));
            const parts = ($('#tms-hits').text() || '').split('/');
            const shown = parseInt(parts[0]) || 0;
            const total = parseInt(parts[1]) || 0;
            $('#tms-hits').text((shown > 0 ? shown - 1 : 0) + ' / ' + (total > 0 ? total - 1 : 0));
            return;
        }

        // Remove reload button now that we have full data
        $(`#player_row_${pid} [data-transfer-reload]`).remove();

        const $rec = $(`#tms-rec-${pid}`);
        if ($rec.length && recVal != null) $rec.html(fmtRec(recVal));

        const $r5 = $(`#tms-r5-${pid}`);
        if ($r5.length) {
            if (tip.r5 != null) $r5.html(fmtR5(tip.r5));
            else if (tip.r5Lo != null || tip.r5Hi != null) $r5.html(fmtR5Range(tip.r5Lo, tip.r5Hi));
        }

        const $ti = $(`#tms-ti-${pid}`);
        if ($ti.length) $ti.html(tiHtml(tip.ti));

        // Refresh open expand row for this player (legacy — no-op when no expand rows)
        const $expRow = $(`#player_row_${pid}`).next('.tms-expand-row');
        if ($expRow.length) {
            const player = allPlayers.find(x => x.id == pid);
            if (player) {
                const colCount = skillsMode ? (5 + ALL_SKILLS.length + 2) : BREAKDOWN_COLS.length;
                $expRow.replaceWith(buildExpandRow(player, colCount));
            }
        }

        // Refresh hover tooltip if it's showing this player
        const $hovRow = $(`#player_row_${pid}`);
        if ($hovRow.length && $hovRow.is(':hover')) {
            const player = allPlayers.find(x => x.id == pid);
            if (player) {
                const anchor = $hovRow[0].querySelector('.tms-col-name') || $hovRow[0];
                TmPlayerTooltip.show(anchor, TmTransferTable.adaptForTooltip(player, tooltipCache));
            }
        }
    }

    async function fetchOnePlayer(p) {
        const pid = tooltipPid(p);
        if (hasFullTooltip(pid)) return tooltipCache[pid];
        if (tooltipPromiseCache.has(pid)) return tooltipPromiseCache.get(pid);

        const request = TmPlayerService.fetchTooltipCached(pid)
            .then(data => {
                const tip = TmTransferService.enrichTransferFromTooltip(p, data, CURRENT_SESSION);
                if (!tip) return null;
                tooltipCache[pid] = tip;
                updateTooltipCells(pid, tip);
                return tip;
            })
            .finally(() => {
                tooltipPromiseCache.delete(pid);
            });

        tooltipPromiseCache.set(pid, request);
        return request;
    }

    async function startTooltipFetch(players) {
        tooltipFetchAbort = false;
        const uncached = players.filter(p => !hasFullTooltip(p.id) && !tooltipPromiseCache.has(tooltipPid(p)));
        // Fire all in parallel — browser caps at ~6 concurrent naturally
        await Promise.all(uncached.map(async p => {
            if (!tooltipFetchAbort) await fetchOnePlayer(p);
        }));
    }

    // ═══════════════════════════════════════════════════════════════════
    //  SEARCH
    // ═══════════════════════════════════════════════════════════════════

    function buildHash() {
        let h = '/';
        const activeFps = $('[data-fp].active').map(function () { return $(this).data('fp'); }).get();
        if (activeFps.length) {
            const groups = new Set(), sides = new Set();
            for (const fp of activeFps) {
                const m = FP_MAP[fp]; if (!m) continue;
                groups.add(m.group);
                if (m.side) sides.add(m.side);
            }
            for (const g of groups) h += g + '/';
            for (const s of sides) h += s + '/';
        }
        if ($('#tms-for').is(':checked')) h += 'for/';

        const amin = $('#tms-amin').val(), amax = $('#tms-amax').val();
        if (amin !== '18') h += `amin/${amin}/`;
        if (amax !== '37') h += `amax/${amax}/`;

        const recMin = parseFloat($('#tms-rmin').val()) || 0;
        const recMax = parseFloat($('#tms-rmax').val());
        const tmRmin = decRecToTM(recMin);
        const tmRmax = decRecToTM(isNaN(recMax) ? 5 : recMax);
        if (tmRmin > 0) h += `rmin/${tmRmin}/`;
        if (tmRmax < 10) h += `rmax/${tmRmax}/`;

        const cost = $('#tms-cost').val();
        if (cost && cost !== '0') h += `cost/${cost}/`;

        const time = $('#tms-time').val();
        if (time && time !== '0') h += `time/${time}/`;

        for (let i = 0; i < 3; i++) {
            const sk = $(`#tms-sf-s${i}`).val();
            const sv = $(`#tms-sf-v${i}`).val();
            if (sk && sk !== '0' && sv && sv !== '0') h += `${sk}/${sv}/`;
        }
        return h;
    }

    function doSearch() {
        if (isLoading) return;
        isLoading = true;
        tooltipFetchAbort = true; // cancel in-flight tooltip fetches
        findAllAbort = true;      // cancel in-flight findAll scan
        $('#tms-table-wrap').html(TmUI.loading('Searching transfer market…'));

        // Clear old countdowns
        if (window.countDowns) {
            for (const id in window.countDowns) { window.countDowns[id] = null; }
            window.countDowns = {};
        }

        const hash = buildHash();
        const clubId = window.SESSION ? window.SESSION.id : 0;

        TmTransferService.fetchTransferSearch(hash, clubId).then(function (data) {
            isLoading = false;

            if (!data) {
                $('#tms-table-wrap').html(TmUI.error('No data received. Please try again.'));
                return;
            }
            if (data.refresh) { location.reload(); return; }

            const raw = Array.isArray(data.list) ? data.list : [];
            window.transfer_info_ar = raw;
            allPlayers = raw.map(processPlayer);
            computeAllEstimates(allPlayers);
            refreshDisplay();
            // Start background tooltip enrichment
            tooltipFetchAbort = true; // abort any previous fetch
            setTimeout(() => startTooltipFetch(allPlayers), 300);
        }).catch(function (error) {
            console.warn('[TMS] Search failed', error);
            isLoading = false;
            $('#tms-table-wrap').html(TmUI.error('Network error. Please try again.'));
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    //  SAVED FILTERS
    // ═══════════════════════════════════════════════════════════════════

    function readCurrentFilterState() {
        const positions = $('[data-fp].active').map(function () { return $(this).data('fp'); }).get();
        const skills = [];
        for (let i = 0; i < 3; i++) {
            skills.push([$(`#tms-sf-s${i}`).val() || '0', $(`#tms-sf-v${i}`).val() || '0']);
        }
        return {
            positions,
            foreigners: $('#tms-for').is(':checked'),
            amin: $('#tms-amin').val(),
            amax: $('#tms-amax').val(),
            rmin: $('#tms-rmin').val(),
            rmax: $('#tms-rmax').val(),
            cost: $('#tms-cost').val(),
            time: $('#tms-time').val(),
            skills,
            r5min: $('#tms-r5min').val(),
            r5max: $('#tms-r5max').val(),
            timin: $('#tms-timin').val(),
            timax: $('#tms-timax').val(),
        };
    }

    function applyFilterState(state) {
        if (!state) return;
        $('[data-fp]').removeClass('active');
        (state.positions || []).forEach(fp => $(`[data-fp="${fp}"]`).addClass('active'));
        $('#tms-for').prop('checked', !!state.foreigners);
        $('#tms-amin').val(state.amin != null ? state.amin : '18');
        $('#tms-amax').val(state.amax != null ? state.amax : '37');
        $('#tms-rmin').val(state.rmin != null ? state.rmin : '0');
        $('#tms-rmax').val(state.rmax != null ? state.rmax : '5');
        $('#tms-cost').val(state.cost || '0');
        $('#tms-time').val(state.time || '0');
        const skills = state.skills || [];
        for (let i = 0; i < 3; i++) {
            const [sk, sv] = skills[i] || ['0', '0'];
            $(`#tms-sf-s${i}`).val(sk);
            $(`#tms-sf-v${i}`).val(sv);
        }
        $('#tms-r5min').val(state.r5min || '');
        $('#tms-r5max').val(state.r5max || '');
        $('#tms-timin').val(state.timin || '');
        $('#tms-timax').val(state.timax || '');
        // Open "More Filters" if any of those fields are active
        const hasMore = (state.cost && state.cost !== '0') ||
            (state.time && state.time !== '0') ||
            (skills.some(([sk]) => sk && sk !== '0'));
        if (hasMore) {
            $('#tms-more-toggle').addClass('open');
            $('#tms-more-body').addClass('open');
        }
    }

    function getSavedFilters() {
        try {
            return JSON.parse(localStorage.getItem(SAVED_FILTERS_KEY) || '{}');
        } catch (e) { return {}; }
    }

    function saveNamedFilter(name, state) {
        const filters = getSavedFilters();
        filters[name] = state;
        localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
    }

    function deleteNamedFilter(name) {
        const filters = getSavedFilters();
        delete filters[name];
        localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
    }

    function populateSavedFiltersDropdown() {
        const filters = getSavedFilters();
        const names = Object.keys(filters);
        const $sel = $('#tms-saved-filters-sel');
        if (!$sel.length) return;
        const current = $sel.val();
        $sel.empty();
        if (names.length === 0) {
            $sel.append('<option value="">— no saved filters —</option>');
        } else {
            $sel.append('<option value="">— select filter —</option>');
            for (const name of names) {
                $sel.append(`<option value="${name}"${name === current ? ' selected' : ''}>${name}</option>`);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  FIND ALL PLAYERS (exhaustive cartesian scan: pos × age × rec)
    // ═══════════════════════════════════════════════════════════════════

    function readBaseFilters() {
        return {
            foreigners: $('#tms-for').is(':checked'),
            amin: $('#tms-amin').val() || '18',
            amax: $('#tms-amax').val() || '37',
            rmin: $('#tms-rmin').val() || '0',
            rmax: $('#tms-rmax').val() || '5',
            cost: $('#tms-cost').val() || '0',
            time: $('#tms-time').val() || '0',
            skills: [0, 1, 2].map(i => [$(`#tms-sf-s${i}`).val() || '0', $(`#tms-sf-v${i}`).val() || '0']),
        };
    }

    function buildHashRaw({ positions = [], sides = [], foreigners, amin, amax, rmin, rmax, cost, time, skills = [] }) {
        let h = '/';
        for (const p of positions) h += p + '/';
        for (const s of sides) h += s + '/';
        if (foreigners) h += 'for/';
        if (amin && amin !== '18') h += `amin/${amin}/`;
        if (amax && amax !== '37') h += `amax/${amax}/`;
        if (rmin && rmin !== '0') h += `rmin/${rmin}/`;
        if (rmax && rmax !== '10') h += `rmax/${rmax}/`;
        if (cost && cost !== '0') h += `cost/${cost}/`;
        if (time && time !== '0') h += `time/${time}/`;
        for (const [sk, sv] of skills) {
            if (sk && sk !== '0' && sv && sv !== '0') h += `${sk}/${sv}/`;
        }
        return h;
    }

    function fetchWithHash(hash) {
        const clubId = window.SESSION ? window.SESSION.id : 0;
        return TmTransferService.fetchTransferSearch(hash, clubId)
            .then(data => Array.isArray(data?.list) ? data.list : []);
    }

    const showModal = (opts) => TmUI.modal(opts);

    const promptModal = (opts) => TmUI.prompt(opts);

    async function findAllPlayers() {
        if (isLoading || findAllRunning) return;

        // Warn if age range > 3 years and no position/rec filter is set
        const _amin = Math.max(18, parseInt($('#tms-amin').val()) || 18);
        const _amax = Math.min(37, parseInt($('#tms-amax').val()) || 37);
        const _hasPos = $('[data-fp].active').length > 0;
        const _rmin = parseFloat($('#tms-rmin').val()) || 0;
        const _rmax = parseFloat($('#tms-rmax').val());
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

        if (window.countDowns) {
            for (const id in window.countDowns) window.countDowns[id] = null;
            window.countDowns = {};
        }

        const base = readBaseFilters();
        const rminNum = Math.max(0, decRecToTM(base.rmin));
        const rmaxNum = Math.min(10, decRecToTM(parseFloat(base.rmax) || 5));
        const aminNum = Math.max(18, parseInt(base.amin) || 18);
        const amaxNum = Math.min(37, parseInt(base.amax) || 37);

        // ── 1. Position combos: respect user's sidebar selection ──────────
        const activeFps = $('[data-fp].active').map(function () { return $(this).data('fp'); }).get();
        const fpKeys = activeFps.length ? activeFps : Object.keys(FP_MAP);
        const posCombos = fpKeys.map(fp => {
            const m = FP_MAP[fp];
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
            $('#tms-table-wrap').html(TmUI.loading(`Scanning… ${done}/${total} (${pct}%) - ${collected.size} players found...`));
        };
        updateProgress();

        // Fire all tasks in parallel; browser naturally caps at ~6 concurrent
        await Promise.all(tasks.map(async (task) => {
            if (findAllAbort) return;
            const hash = buildHashRaw({
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
        computeAllEstimates(allPlayers);
        refreshDisplay();
        if (fetchTooltips) setTimeout(() => startTooltipFetch(allPlayers), 300);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  LAYOUT
    // ═══════════════════════════════════════════════════════════════════

    function buildLayout() {
        if ($('#tms-main').length || $('#tms-sidebar').length) return;
        const layoutHtml = `
  ${TmTransferSidebar.build()}
    <div id="tms-main" class="tmvu-transfer-main">
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
        main.insertAdjacentHTML('beforeend', layoutHtml);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  EVENT BINDING
    // ═══════════════════════════════════════════════════════════════════

    function bindEvents() {
        $(document).on('click', '#tms-search-btn', doSearch);
        $(document).on('keydown', '#tms-sidebar', function (e) {
            if (e.key === 'Enter') doSearch();
        });

        $(document).on('click', '[data-transfer-reload]', function (e) {
            e.stopPropagation();
            const pid = $(this).data('pid');
            const player = allPlayers.find(x => x.id == pid);
            if (!player) return;
            $(this).addClass('tms-reloading');
            fetchOnePlayer(player);
        });

        $(document).on('click', '[data-fp]', function () { $(this).toggleClass('active'); });
        $(document).on('click', '#tms-findall-btn', findAllPlayers);

        $(document).on('click', '#tms-more-toggle', function () {
            $(this).toggleClass('open');
            $('#tms-more-body').toggleClass('open');
        });

        $(document).on('click', '#tms-filter-save-btn', async function () {
            const currentSel = $('#tms-saved-filters-sel').val();
            const name = await promptModal({
                icon: '💾',
                title: 'Save Current Filter',
                placeholder: 'Enter filter name…',
                defaultValue: currentSel || '',
            });
            if (!name) return;
            saveNamedFilter(name, readCurrentFilterState());
            populateSavedFiltersDropdown();
            $('#tms-saved-filters-sel').val(name);
        });

        $(document).on('click', '#tms-filter-load-btn', function () {
            const name = $('#tms-saved-filters-sel').val();
            if (!name) return;
            const state = getSavedFilters()[name];
            if (!state) return;
            applyFilterState(state);
            doSearch();
        });

        $(document).on('click', '#tms-filter-del-btn', async function () {
            const name = $('#tms-saved-filters-sel').val();
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
            deleteNamedFilter(name);
            populateSavedFiltersDropdown();
        });

        $(document).on('input', '#tms-r5min, #tms-r5max, #tms-timin, #tms-timax', function () {
            refreshDisplay();
        });


        $(document).on('click', '#tms-mode-bd', function () {
            skillsMode = false;
            $(this).addClass('active');
            $('#tms-mode-sk').removeClass('active');
            refreshDisplay();
        });

        $(document).on('click', '#tms-mode-sk', function () {
            skillsMode = true;
            $(this).addClass('active');
            $('#tms-mode-bd').removeClass('active');
            refreshDisplay();
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    //  NEUTRALIZE TM'S OWN RENDER PIPELINE
    // ═══════════════════════════════════════════════════════════════════

    function neutralizeTM() {
        console.log('Neutralizing TM rendering');
        // Stop the hash-check interval TM registered on document.ready
        if (window.hashCheck) {
            clearInterval(window.hashCheck);
            window.hashCheck = null;
        }
        // Make TM's rendering functions no-ops so their AJAX callback
        // doesn't overwrite our UI (they still populate transfer_info_ar)
        window.makeTable = function (arr) { if (arr) window.transfer_info_ar = arr; };
        window.sort_it = function () { };
        window.startSearch = function () { };
        window.check_hash = function () { };
        window.popFilterImages = function () { };
    }

    // ═══════════════════════════════════════════════════════════════════
    //  INIT
    // ═══════════════════════════════════════════════════════════════════

    function init() {
        neutralizeTM();
        TmTransferStyles.inject();
        buildLayout();
        bindEvents();
        populateSavedFiltersDropdown();
        // Tiny delay gives TM's own DOM-ready callbacks time to clear,
        // then we kick off our first search
        setTimeout(doSearch, 150);
        console.log('Transfer Market Scanner initialized');
    }

    init();
}
