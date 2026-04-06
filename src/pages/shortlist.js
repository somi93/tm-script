import { TmShortlistPanel } from '../components/shortlist/tm-shortlist-panel.js';
import { TmShortlistTable } from '../components/shortlist/tm-shortlist-table.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmShortlistService } from '../services/shortlist.js';
import { enrichPlayers, dbRecordToPlayer, toPageRecord } from '../services/players-enrich.js';
import { TmUtils } from '../lib/tm-utils.js';

'use strict';

let mountedMain = null;
const PAGE_DATA = {};

let allPlayers = [];
let sortCol = 'r5', sortDir = -1;
let fPos = new Set(), fSide = new Set();
let fAgeMin = 0, fAgeMax = 99;
let fR5Min = '', fR5Max = '', fRecMin = '', fRecMax = '', fTiMin = '', fTiMax = '';
let shortlistLoading = true;
let loadProgress = null;       // { done, total } during any fetch
let loadMoreState = null;      // null | 'loading' | 'done'
let nextStart = 0;             // offset for next shortlist page fetch
let totalKnown = 0;            // total IDs discovered across all pages
let activeTab = 'shortlist';
let indexedPlayers = null;
let indexedLoading = false;
let ixSortCol = 'r5', ixSortDir = -1;
let ixPage = 0, slPage = 0;
const IX_PAGE_SIZE = 50, SL_PAGE_SIZE = 50;

    /* ═════════════════════════════════════════════════════════
       INDEXED TAB
       ═════════════════════════════════════════════════════════ */
    async function loadIndexedTab() {
        if (indexedLoading) return;
        indexedLoading = true;
        await TmPlayerDB.init();
        indexedPlayers = TmPlayerDB.allPids()
            .map(pid => dbRecordToPlayer(pid, TmPlayerDB.get(pid)))
            .filter(Boolean);
        indexedLoading = false;
        renderPanel();
    }

    /* ═════════════════════════════════════════════════════════
       FETCH MORE  — load subsequent shortlist pages
       ═════════════════════════════════════════════════════════ */
    async function fetchMore() {
        if (loadMoreState === 'loading' || loadMoreState === 'done') return;
        loadMoreState = 'loading';
        renderPanel();

        try {
            const pageData = await TmShortlistService.fetchShortlistPage(nextStart);
            if (!pageData.length) { loadMoreState = 'done'; renderPanel(); return; }

            for (const p of pageData) {
                const key = String(p.id);
                if (!PAGE_DATA[key]) PAGE_DATA[key] = toPageRecord(p);
            }

            const existingIds = new Set(allPlayers.map(p => String(p.id)));
            const newIds = pageData.map(p => String(p.id)).filter(id => !existingIds.has(id));
            if (!newIds.length) { loadMoreState = 'done'; renderPanel(); return; }

            nextStart += pageData.length;
            totalKnown += newIds.length;

            const enriched = await enrichPlayers(newIds, PAGE_DATA, {
                onUpdate: (updated) => {
                    for (const p of updated) {
                        const idx = allPlayers.findIndex(pl => pl.id === p.id);
                        if (idx !== -1) allPlayers[idx] = p;
                        else allPlayers.push(p);
                    }
                    loadProgress = { done: allPlayers.filter(pl => !pl.pending).length, total: totalKnown };
                    renderPanel();
                },
            });
            for (const p of enriched) {
                const idx = allPlayers.findIndex(pl => pl.id === p.id);
                if (idx !== -1) allPlayers[idx] = p;
                else allPlayers.push(p);
            }
            loadMoreState = pageData.length < 20 ? 'done' : null;
        } catch (e) {
            console.warn('[TM Shortlist] fetchMore failed', e);
            loadMoreState = null;
        }

        loadProgress = null;
        renderPanel();
    }

    /* ═════════════════════════════════════════════════════════
       CSS  — delegated to TmShortlistTable component
       ═════════════════════════════════════════════════════════ */
    function injectCSS() { TmShortlistTable.injectCSS(); }

    /* ═════════════════════════════════════════════════════════
       RENDER PANEL  — delegated to TmShortlistPanel component
       ═════════════════════════════════════════════════════════ */
    function buildCtx() {
        return {
            main: mountedMain,
            allPlayers, indexedPlayers, activeTab,
            sortCol, sortDir, ixSortCol, ixSortDir, ixPage, IX_PAGE_SIZE, slPage, SL_PAGE_SIZE,
            shortlistLoading, loadProgress, loadMoreState,
            filterState: { fPos, fSide, fAgeMin, fAgeMax, fR5Min, fR5Max, fRecMin, fRecMax, fTiMin, fTiMax },
            onTabChange(t) {
                if (activeTab === t || shortlistLoading) return;
                activeTab = t;
                if (t === 'indexed' && !indexedPlayers && !indexedLoading) loadIndexedTab();
                else renderPanel();
            },
            onGroupFilter(g) { if (fPos.has(g)) fPos.delete(g); else fPos.add(g); ixPage = 0; slPage = 0; renderPanel(); },
            onSideFilter(s) { if (fSide.has(s)) fSide.delete(s); else fSide.add(s); ixPage = 0; slPage = 0; renderPanel(); },
            onNumFilter(id, value) {
                if (id === 'tmsl-agemin') fAgeMin = parseInt(value) || 0;
                else if (id === 'tmsl-agemax') fAgeMax = parseInt(value) || 99;
                else if (id === 'tmsl-r5min') fR5Min = value;
                else if (id === 'tmsl-r5max') fR5Max = value;
                else if (id === 'tmsl-recmin') fRecMin = value;
                else if (id === 'tmsl-recmax') fRecMax = value;
                else if (id === 'tmsl-timin') fTiMin = value;
                else if (id === 'tmsl-timax') fTiMax = value;
                ixPage = 0; slPage = 0;
                renderPanel();
            },
            onSort(col)   { const r = TmUtils.toggleSort(col, sortCol,   sortDir,   (col === 'name' || col === 'pos') ? 1 : -1); sortCol   = r.key; sortDir   = r.dir; slPage = 0; renderPanel(); },
            onIxSort(col) { const r = TmUtils.toggleSort(col, ixSortCol, ixSortDir, col === 'name' ? 1 : -1);                   ixSortCol = r.key; ixSortDir = r.dir; ixPage = 0; renderPanel(); },
            onIxPage(dir) { ixPage = Math.max(0, ixPage + dir); renderPanel(); },
            onSlPage(dir) { slPage = Math.max(0, slPage + dir); renderPanel(); },
            onLoadMore: fetchMore,
        };
    }

    function renderPanel() { TmShortlistPanel.render(buildCtx()); }

    /* ═════════════════════════════════════════════════════════
       INIT
       ═════════════════════════════════════════════════════════ */
    async function init() {
        if (Array.isArray(window.players_ar)) {
            for (const p of window.players_ar) PAGE_DATA[String(p.id)] = toPageRecord(p);
        }
        if (!Array.isArray(window.players_ar) || !window.players_ar.length) return;

        injectCSS();
        const firstIds = window.players_ar.map(p => String(p.id));
        shortlistLoading = true;
        loadProgress = null;
        allPlayers = [];
        renderPanel();

        // 1. Discover all IDs — hit the same endpoint 5 more times, collect unique players (endpoint returns random each time)
        const allIds = [...firstIds];
        const seenIds = new Set(firstIds);
        console.log(`[TM Shortlist] Discovery start: firstIds=${firstIds.length}`);
        for (let i = 0; i < 5; i++) {
            try {
                console.log(`[TM Shortlist] Discovery round ${i + 1}/5`);
                const pageData = await TmShortlistService.fetchShortlistPage();
                if (!pageData.length) { console.log(`[TM Shortlist] Discovery round ${i + 1}: empty, done`); break; }
                const newBefore = allIds.length;
                for (const p of pageData) {
                    const key = String(p.id);
                    if (!PAGE_DATA[key]) PAGE_DATA[key] = toPageRecord(p);
                    if (!seenIds.has(key)) { seenIds.add(key); allIds.push(key); }
                }
                console.log(`[TM Shortlist] Discovery round ${i + 1}: got=${pageData.length}, new=${allIds.length - newBefore}, total=${allIds.length}`);
            } catch (e) { console.warn('[TM Shortlist] Discovery fetch failed', e); break; }
        }

        nextStart = 0;
        totalKnown = allIds.length;
        loadProgress = { done: 0, total: totalKnown };
        loadMoreState = 'done';

        allPlayers = await enrichPlayers(allIds, PAGE_DATA, {
            onUpdate: (updated) => {
                allPlayers = updated;
                loadProgress = { done: allPlayers.filter(pl => !pl.pending).length, total: totalKnown };
                renderPanel();
            },
        });

        shortlistLoading = false;
        loadProgress = null;
        renderPanel();
    }

export function initShortlistPage(main) {
    if (!main || !main.isConnected) return;
    if (!Array.isArray(window.players_ar) || !window.players_ar.length) return;
    mountedMain = main;
    main.classList.add('tmvu-shortlist-page', 'tmu-page-density-regular');
    allPlayers = []; indexedPlayers = null;
    sortCol = 'r5'; sortDir = -1;
    activeTab = 'shortlist';
    shortlistLoading = true; loadProgress = null; loadMoreState = null;
    nextStart = 0; totalKnown = 0; ixPage = 0; slPage = 0;
    init();
}
