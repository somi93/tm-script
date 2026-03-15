import { TmShortlistPanel } from '../components/shortlist/tm-shortlist-panel.js';
import { TmShortlistTable } from '../components/shortlist/tm-shortlist-table.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmLib } from '../lib/tm-lib.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmShortlistService } from '../services/shortlist.js';
import { TmPlayerService } from '../services/player.js';
import { TmClubService } from '../services/club.js';
import { TmUtils } from '../lib/tm-utils.js';

(function () {
    'use strict';

    if (!/^\/shortlist\/?$/.test(location.pathname)) return;

    const FIELD_LABELS = TmConst.SKILL_LABELS_OUT;
    const GK_LABELS    = TmConst.SKILL_LABELS_GK;

    /* Page data lookup — timeleft/bid fields only available from the shortlist page */
    const PAGE_DATA = {};
    if (Array.isArray(window.players_ar)) {
        for (const p of window.players_ar) {
            PAGE_DATA[String(p.id)] = {
                timeleft: parseInt(p.timeleft) || 0,
                timeleft_string: p.timeleft_string || null,
                curbid: p.curbid || null,
                next_bid: parseInt(p.next_bid) || 0,
                bid_level: parseInt(p.bid) || 0,
                txt: p.txt || '',
                ban: p.ban || '0',
                inj: p.inj != null ? String(p.inj) : null,
                locked: typeof p.status === 'string' && p.status.includes('status_unknown'),
                retire: p.retire || '0',
                no: parseInt(p.no) || 0,
                wage: parseInt(p.wage) || 0,
                club: p.club || '0',
            };
        }
    }


    //    ═════════════════════════════════════════════════════════ */
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
    function dbRecordToPlayer(pid, dbStore) {
        if (!dbStore || !dbStore.records) return null;
        const keys = Object.keys(dbStore.records).sort((a, b) => {
            const [ay, am] = a.split('.').map(Number);
            const [by, bm] = b.split('.').map(Number);
            return (ay * 12 + am) - (by * 12 + bm);
        });
        if (!keys.length) return null;

        const lastKey = keys[keys.length - 1];
        const [ky, km] = lastKey.split('.').map(Number);
        const weeksSince = (Date.now() - (dbStore.lastSeen || 0)) / 604800000;
        const addMonths = Math.floor(weeksSince);
        const totalM = km + addMonths;
        const newYears = ky + Math.floor(totalM / 12);
        const newMonths = totalM % 12;

        const dbRec = dbStore.records[lastKey] || {};
        const meta = dbStore.meta || {};
        const isGK = !!meta.isGK;
        const favPos = meta.pos || 'mc';
        const skills = (dbRec.skills || []).map(Number);
        const asi = dbRec.SI || 0;
        const routine = dbRec.routine || 0;

        const posKeys = String(favPos).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        const positions = posKeys.map(key => {
            const posData = TmConst.POSITION_MAP[key] || { position: key, id: 0, ordering: 9, color: '#aaa' };
            if (asi > 0 && skills.length) {
                const fakePlayer = { skills, asi, routine, isGK };
                return { ...posData, r5: parseFloat(TmLib.calculatePlayerR5(posData, fakePlayer)) || 0, rec: parseFloat(TmLib.calculatePlayerREC(posData, fakePlayer)) || 0 };
            }
            return { ...posData, r5: 0, rec: 0 };
        });
        if (!positions.length) positions.push({ position: 'dc', id: 0, ordering: 0, color: '#60a5fa', r5: 0, rec: 0 });
        const r5 = Math.max(...positions.map(p => p.r5), 0);
        const rec = Math.max(...positions.map(p => p.rec), 0);
        const ti = dbRec.TI != null ? dbRec.TI : null;

        return {
            id: String(pid),
            name: meta.name || '',
            country: meta.country || '',
            favposition: favPos,
            positions, isGK,
            age: newYears,
            months: newMonths,
            asi, r5, rec: Number(rec), ti,
            routine, wage: 0,
            skills,
            labels: isGK ? GK_LABELS : FIELD_LABELS,
            lastSeen: dbStore.lastSeen || 0,
            stale: weeksSince >= 1,
        };
    }

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

            if (!pageData.length) {
                loadMoreState = 'done';
                renderPanel();
                return;
            }

            // Merge PAGE_DATA for any new entries
            for (const p of pageData) {
                const key = String(p.id);
                if (!PAGE_DATA[key]) {
                    PAGE_DATA[key] = {
                        timeleft: parseInt(p.timeleft) || 0,
                        timeleft_string: p.timeleft_string || null,
                        curbid: p.curbid || null,
                        next_bid: parseInt(p.next_bid) || 0,
                        bid_level: parseInt(p.bid) || 0,
                        txt: p.txt || '',
                        ban: p.ban || '0',
                        inj: p.inj != null ? String(p.inj) : null,
                        locked: typeof p.status === 'string' && p.status.includes('status_unknown'),
                        retire: p.retire || '0',
                        no: parseInt(p.no) || 0,
                        wage: parseInt(p.wage) || 0,
                        club: p.club || '0',
                    };
                }
            }

            const existingIds = new Set(allPlayers.map(p => String(p.id)));
            const newIds = pageData.map(p => String(p.id)).filter(id => !existingIds.has(id));

            if (!newIds.length) {
                loadMoreState = 'done';
                renderPanel();
                return;
            }

            nextStart += pageData.length;
            totalKnown += newIds.length;

            // Pre-fill new IDs from DB
            for (const pid of newIds) {
                const dbStore = TmPlayerDB.get(pid);
                if (dbStore) {
                    const p = dbRecordToPlayer(pid, dbStore);
                    if (p) {
                        Object.assign(p, PAGE_DATA[String(pid)] || {});
                        p.pending = true;
                        allPlayers.push(p);
                    }
                }
            }
            loadProgress = { done: allPlayers.filter(pl => !pl.pending).length, total: totalKnown };
            renderPanel();

            for (const pid of newIds) {
                try {
                    const data = await TmPlayerService.fetchPlayerTooltip(pid);
                    const p = data?.player;
                    if (p) {
                        Object.assign(p, PAGE_DATA[String(pid)] || {});
                        const idx = allPlayers.findIndex(pl => pl.id === String(pid));
                        if (idx !== -1) allPlayers[idx] = p;
                        else allPlayers.push(p);
                    }
                } catch (e) {
                    console.warn('[TM Shortlist] fetchMore tooltip failed', pid, e);
                    const stub = allPlayers.find(pl => pl.id === String(pid));
                    if (stub) stub.pending = false;
                }
                loadProgress = { done: allPlayers.filter(pl => !pl.pending).length, total: totalKnown };
                renderPanel();
            }

            // If the page returned fewer entries than a full page, assume we're done
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
        if (!Array.isArray(window.players_ar) || !window.players_ar.length) return;

        const t0 = performance.now();
        let tDiscovery, tPrefill, tFetch;

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
                    if (!PAGE_DATA[key]) {
                        PAGE_DATA[key] = {
                            timeleft: parseInt(p.timeleft) || 0,
                            timeleft_string: p.timeleft_string || null,
                            curbid: p.curbid || null,
                            next_bid: parseInt(p.next_bid) || 0,
                            bid_level: parseInt(p.bid) || 0,
                            txt: p.txt || '',
                            ban: p.ban || '0',
                            inj: p.inj != null ? String(p.inj) : null,
                            locked: typeof p.status === 'string' && p.status.includes('status_unknown'),
                            retire: p.retire || '0',
                            no: parseInt(p.no) || 0,
                            wage: parseInt(p.wage) || 0,
                            club: p.club || '0',
                        };
                    }
                    if (!seenIds.has(key)) { seenIds.add(key); allIds.push(key); }
                }
                console.log(`[TM Shortlist] Discovery round ${i + 1}: got=${pageData.length}, new=${allIds.length - newBefore}, total=${allIds.length}`);
            } catch (e) { console.warn('[TM Shortlist] Discovery fetch failed', e); break; }
        }

        nextStart = 0;
        totalKnown = allIds.length;
        loadProgress = { done: 0, total: totalKnown };
        loadMoreState = 'done'; // discovery already fetched all available pages
        tDiscovery = performance.now();

        // 2. Pre-fill all known IDs from DB immediately
        await TmPlayerDB.init();
        for (const pid of allIds) {
            const dbStore = TmPlayerDB.get(pid);
            if (dbStore) {
                const p = dbRecordToPlayer(pid, dbStore);
                if (p) {
                    Object.assign(p, PAGE_DATA[String(pid)] || {});
                    p.pending = true;
                    allPlayers.push(p);
                }
            }
        }
        renderPanel();
        tPrefill = performance.now();

        // 3. Fetch fresh data — squad batching for known clubs, tooltip fallback for rest
        // Players with a fresh DB record (seen < 1 week) are considered current — skip tooltip fetch
        for (const p of allPlayers) {
            if (p.pending && !p.stale) p.pending = false;
        }
        loadProgress = { done: allPlayers.filter(pl => !pl.pending).length, total: totalKnown };
        renderPanel();

        const clubGroups = new Map();
        const tooltipIds = [];

        for (const pid of allIds) {
            const existing = allPlayers.find(pl => pl.id === pid);
            if (existing && !existing.pending) continue; // fresh DB record, no fetch needed
            // PAGE_DATA always has club for IDs from players_ar; DB meta is fallback for fetchMore IDs
            const clubId = PAGE_DATA[pid]?.club || TmPlayerDB.get(pid)?.meta?.club_id;
            if (clubId && String(clubId) !== '0') {
                const key = String(clubId);
                if (!clubGroups.has(key)) clubGroups.set(key, []);
                clubGroups.get(key).push(String(pid));
            } else {
                tooltipIds.push(String(pid));
            }
        }

        // Clubs with ≥2 shortlisted players: one squad fetch covers all of them
        for (const [clubId, pids] of clubGroups) {
            if (pids.length < 2) { tooltipIds.push(...pids); continue; }
            try {
                const data = await TmClubService.fetchSquadRaw(clubId);
                if (data?.post) {
                    const squadMap = new Map(data.post.map(sp => [String(sp.id), sp]));
                    for (const pid of pids) {
                        const sp = squadMap.get(pid);
                        if (sp) {
                            Object.assign(sp, PAGE_DATA[pid] || {});
                            const idx = allPlayers.findIndex(pl => pl.id === pid);
                            if (idx !== -1) allPlayers[idx] = sp;
                            else allPlayers.push(sp);
                        } else {
                            tooltipIds.push(pid); // player left the club
                        }
                    }
                } else {
                    tooltipIds.push(...pids);
                }
            } catch (e) {
                console.warn('[TM Shortlist] squad fetch failed', clubId, e);
                tooltipIds.push(...pids);
            }
            loadProgress = { done: allPlayers.filter(pl => !pl.pending).length, total: totalKnown };
            renderPanel();
        }

        // Individual tooltips for everyone not covered by squad
        for (const pid of tooltipIds) {
            try {
                const data = await TmPlayerService.fetchPlayerTooltip(pid);
                const p = data?.player;
                if (p) {
                    Object.assign(p, PAGE_DATA[pid] || {});
                    const idx = allPlayers.findIndex(pl => pl.id === pid);
                    if (idx !== -1) allPlayers[idx] = p;
                    else allPlayers.push(p);
                }
            } catch (e) {
                console.warn('[TM Shortlist] tooltip failed', pid, e);
                const stub = allPlayers.find(pl => pl.id === pid);
                if (stub) stub.pending = false;
            }
            loadProgress = { done: allPlayers.filter(pl => !pl.pending).length, total: totalKnown };
            renderPanel();
        }

        shortlistLoading = false;
        loadProgress = null;
        tFetch = performance.now();

        renderPanel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
