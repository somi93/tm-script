/**
 * TmMatchUnityPlayer
 *
 * Owns all Unity 3D integration: canvas management, clip loading/playback,
 * stargate override, TM replay suppression, and clip text queue.
 *
 * Call TmMatchUnityPlayer.create(callbacks) to get a bound instance.
 *
 * callbacks: {
 *   getLiveState()           — returns current liveState object (may be null)
 *   onTextAdvanced(evtIdx, lineIdx, isComplete)
 *                            — called when a text line advances via clip sync
 *   onAllClipsFinished(min)  — called when Unity signals finished_playing
 *   syncLiveDerivedTeams()   — call to re-derive match data from liveState
 *   applyFilterSwitch(mode)  — called if a pending filter switch exists on clip finish
 * }
 */

import { TmMatchComparisonRow } from './tm-match-comparison-row.js';

const LINE_INTERVAL = 3;  // seconds between lines within a minute
const POST_DELAY = 3;     // seconds after last line before advancing to next minute

const DEFAULT_STATE = () => ({
    available: false,
    ready: false,
    playing: false,
    pendingMinute: null,
    loadedMinutes: [],
    playedMinutes: [],
    canvasParent: null,
    tmPaused: false,
    clipTextQueue: [],
    clipTextCursor: 0,
    clipTextGroups: [],
    clipGroupCursor: 0,
    clipPostQueue: [],
    activeMinute: null,
    clipFirstShown: false,
    clipSkippedFirst: false,
});

export const TmMatchUnityPlayer = {
    create(callbacks) {
        let state = DEFAULT_STATE();

        const getUW = () => typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

        // ── Text queue helpers ────────────────────────────────────────────

        const countPlayLines = (play) => {
            if (!play) return 1;
            return Math.max(1, play.segments.reduce((s, seg) => s + seg.text.filter(l => l.trim()).length, 0));
        };

        const findPlay = (mData, min, reportEvtIdx) => {
            const plays = mData.plays?.[String(min)] || [];
            return plays.find(p => p.reportEvtIdx === reportEvtIdx) || null;
        };

        const buildClipTextQueue = (mData, minute) => {
            callbacks.syncLiveDerivedTeams();
            const plays = mData.plays?.[String(minute)] || [];
            const queue = [];
            const groups = [];
            const postQueue = [];
            plays.forEach((play, playIdx) => {
                let flatIdx = 0;
                if (playIdx === 0) {
                    play.segments.forEach(seg => {
                        const groupStart = queue.length;
                        let groupCount = 0;
                        seg.text.forEach(line => {
                            if (!line || !line.trim()) return;
                            queue.push({ reportEvtIdx: play.reportEvtIdx, flatLineIdx: flatIdx });
                            flatIdx++;
                            groupCount++;
                        });
                        if (groupCount > 0) groups.push({ start: groupStart, count: groupCount });
                    });
                } else {
                    play.segments.forEach(seg => {
                        seg.text.forEach(line => {
                            if (!line || !line.trim()) return;
                            postQueue.push({ reportEvtIdx: play.reportEvtIdx, flatLineIdx: flatIdx });
                            flatIdx++;
                        });
                    });
                }
            });
            return { queue, groups, postQueue };
        };

        const advanceClipTextOneLine = () => {
            const liveState = callbacks.getLiveState();
            if (!liveState || !state.clipTextQueue.length) return;
            const idx = state.clipTextCursor;
            if (idx >= state.clipTextQueue.length) return;
            const entry = state.clipTextQueue[idx];
            state.clipTextCursor = idx + 1;

            const play = findPlay(liveState.mData, liveState.min, entry.reportEvtIdx);
            const total = play ? countPlayLines(play) : 1;
            const isComplete = entry.flatLineIdx >= total - 1;

            callbacks.onTextAdvanced(entry.reportEvtIdx, entry.flatLineIdx, isComplete);
            updateMatchFeed();
            if (isComplete) updateMatchStats();
        };

        const flushClipText = () => {
            const remaining = state.clipTextQueue.length - state.clipTextCursor;
            const postLen = state.clipPostQueue ? state.clipPostQueue.length : 0;
            console.log('[RND] flushClipText remaining=' + remaining + ' postQueue=' + postLen);
            while (state.clipTextCursor < state.clipTextQueue.length) {
                advanceClipTextOneLine();
            }
            if (state.clipPostQueue && state.clipPostQueue.length > 0) {
                state.clipPostQueue.forEach(entry => { state.clipTextQueue.push(entry); });
                state.clipPostQueue = [];
                while (state.clipTextCursor < state.clipTextQueue.length) {
                    advanceClipTextOneLine();
                }
            }
        };

        const advanceClipTextGroup = () => {
            const groups = state.clipTextGroups || [];
            const gi = state.clipGroupCursor || 0;
            if (gi >= groups.length) return;
            const group = groups[gi];
            for (let j = 0; j < group.count; j++) {
                if (state.clipTextCursor < state.clipTextQueue.length) {
                    advanceClipTextOneLine();
                }
            }
            state.clipGroupCursor = gi + 1;
            callbacks.syncLiveDerivedTeams();
            console.log('[RND] Advanced text group ' + gi + ' (' + group.count + ' lines)');
        };

        // ── Side panels ───────────────────────────────────────────────────

        const updateMatchFeed = () => {
            const liveState = callbacks.getLiveState();
            const container = $('#rnd-unity-feed');
            if (!container.length || !liveState) return;
            const mData = liveState.mData;
            const curMin = liveState.min;
            const curEvtIdx = liveState.curEvtIdx;
            const curLineIdx = liveState.curLineIdx;
            const allLines = [];
            const minPlays = (mData.plays || {})[String(curMin)] || [];
            for (const play of minPlays) {
                if (play.reportEvtIdx > curEvtIdx) break;
                let flatIdx = 0;
                for (const seg of play.segments) {
                    for (const line of seg.text) {
                        if (!line.trim()) { flatIdx++; continue; }
                        if (play.reportEvtIdx === curEvtIdx && flatIdx > curLineIdx) break;
                        allLines.push({ min: curMin, text: line });
                        flatIdx++;
                    }
                }
            }
            let html = '';
            allLines.forEach(item => {
                const text = item.text.replace(/\[(goal|yellow|red|sub|assist)\]/g, '');
                html += `<div class="rnd-unity-feed-line"><span class="rnd-unity-feed-min">${item.min}'</span><span class="rnd-unity-feed-text">${text}</span></div>`;
            });
            container.html(html);
            container.scrollTop(container[0].scrollHeight);
        };

        const updateMatchStats = () => {
            const liveState = callbacks.getLiveState();
            const container = $('#rnd-unity-stats');
            if (!container.length || !liveState) return;
            const homeStats = liveState.mData.teams.home.stats || {};
            const awayStats = liveState.mData.teams.away.stats || {};
            const statRows = [
                ['Shots', homeStats.shots, awayStats.shots],
                ['On Target', homeStats.shotsOnTarget, awayStats.shotsOnTarget],
                ['Goals', homeStats.goals, awayStats.goals],
                ['Yellow', homeStats.yellowCards, awayStats.yellowCards],
                ['Red', homeStats.redCards, awayStats.redCards],
            ];
            container.html(statRows.map(([label, leftValue, rightValue]) => TmMatchComparisonRow.stacked({
                label, leftValue, rightValue,
                rowClass: 'rnd-unity-stat-row',
                headerClass: 'rnd-unity-stat-hdr',
                leftValueClass: 'val home',
                rightValueClass: 'val away',
                labelClass: 'rnd-unity-stat-label',
                barClass: 'rnd-unity-stat-bar',
                leftSegmentClass: 'seg home',
                rightSegmentClass: 'seg away',
                leftLeadClass: 'lead',
                rightLeadClass: 'lead',
            })).join(''));
        };

        // ── Canvas management ─────────────────────────────────────────────

        const saveUnityCanvas = () => {
            if (!state.available) return;
            const webglContent = document.querySelector('.webgl-content');
            if (!webglContent) return;
            if (webglContent.parentElement && webglContent.parentElement.id === 'rnd-unity-safe') return;
            let safe = document.getElementById('rnd-unity-safe');
            if (!safe) {
                safe = document.createElement('div');
                safe.id = 'rnd-unity-safe';
                safe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;';
                document.body.appendChild(safe);
            }
            safe.appendChild(webglContent);
            console.log('[RND] Canvas saved to safe container');
        };

        const syncUnityPanelHeights = () => {
            const vp = document.getElementById('rnd-unity-viewport');
            if (!vp) return;
            requestAnimationFrame(() => {
                const h = vp.offsetHeight;
                if (!h) return;
                const feed = document.getElementById('rnd-unity-feed');
                const stats = document.getElementById('rnd-unity-stats');
                if (feed) feed.style.maxHeight = h + 'px';
                if (stats) stats.style.maxHeight = h + 'px';
            });
        };

        const moveUnityCanvas = () => {
            if (!state.available) return;
            const webglContent = document.querySelector('.webgl-content');
            if (!webglContent) return;
            const target = document.getElementById('rnd-unity-viewport');
            if (!target) return;
            if (!state.canvasParent) state.canvasParent = webglContent.parentElement;
            target.innerHTML = '';
            target.appendChild(webglContent);
            webglContent.style.display = 'block';
            const gc = document.getElementById('gameContainer');
            if (gc) { gc.style.width = '100%'; gc.style.height = '100%'; gc.style.margin = '0'; }
            target.style.display = 'block';
            const row = document.querySelector('.rnd-unity-row');
            if (row) row.classList.remove('rnd-no-unity');
            console.log('[RND] Canvas moved into viewport');
            syncUnityPanelHeights();
        };

        // ── Clip loading / playback ───────────────────────────────────────

        const playUnityClips = (minute) => {
            const uw = getUW();
            if (!state.available || !uw.gameInstance) return;
            state.playing = true;
            uw.gameInstance.SendMessage('ClipsViewerScript', 'PlayMinute', JSON.stringify({ id: minute }));
        };

        const loadUnityClips = (minute, mData) => {
            const uw = getUW();
            if (!state.available || !uw.gameInstance) return false;
            const rawEvts = (mData.report || {})[String(minute)] || [];
            const videoList = [];
            rawEvts.forEach(evt => {
                const v = evt.chance?.video;
                if (!v) return;
                if (Array.isArray(v)) videoList.push(...v);
                else videoList.push(v);
            });
            if (videoList.length === 0) return false;
            console.log('[RND] Loading clips for minute', minute, videoList.length, 'clips:', videoList);
            const { queue, groups, postQueue } = buildClipTextQueue(mData, minute);
            state.clipTextQueue = queue;
            state.clipTextGroups = groups;
            state.clipPostQueue = postQueue;
            state.clipTextCursor = 0;
            state.clipGroupCursor = 0;
            state.activeMinute = minute;
            state.clipFirstShown = false;
            state.clipSkippedFirst = false;
            state.pendingMinute = minute;
            const prepareMsg = JSON.stringify({ queue: videoList, id: minute });
            console.log('[RND] SendMessage PrepareMinute', prepareMsg);
            uw.gameInstance.SendMessage('ClipsViewerScript', 'PrepareMinute', prepareMsg);
            return true;
        };

        // ── TM replay suppression ─────────────────────────────────────────

        const stopTMReplay = () => {
            const uw = getUW();
            if (state.tmPaused) return;
            state.tmPaused = true;
            if (uw.flash_status) {
                uw.flash_status.playback_mode = 'pause';
                uw.flash_status.enabled = false;
            }
            uw._orig_run_match = uw.run_match;
            uw.run_match = function () { /* noop */ };
            if (uw.show_next_action_text_entry) {
                uw._orig_show_next_action_text_entry = uw.show_next_action_text_entry;
                uw.show_next_action_text_entry = function () { /* noop */ };
            }
            if (uw.prepare_next_minute) {
                uw._orig_prepare_next_minute = uw.prepare_next_minute;
                uw.prepare_next_minute = function () { /* noop */ };
            }
            const lastId = setTimeout(() => { }, 0);
            for (let i = lastId - 20; i <= lastId; i++) clearTimeout(i);
            console.log('[RND] TM replay stopped completely');
        };

        // ── Stargate override ─────────────────────────────────────────────

        const setupStargateOverride = () => {
            const uw = getUW();
            uw._orig_stargate = uw.stargate;
            uw.stargate = function (vars) {
                if (vars.flash_ready) {
                    state.ready = true;
                }
                if (vars.finished_loading) {
                    const min = vars.finished_loading.id;
                    state.loadedMinutes.push(min);
                    if (state.pendingMinute === min) {
                        state.pendingMinute = null;
                        playUnityClips(min);
                    }
                }
                if (vars.finished_clip) {
                    console.log('[RND] finished_clip:', JSON.stringify(vars.finished_clip));
                    if (state.clipFirstShown && !state.clipSkippedFirst) {
                        state.clipSkippedFirst = true;
                        console.log('[RND] Skipping finished_clip for group 0 (already shown on start)');
                    } else {
                        advanceClipTextGroup();
                    }
                }
                if (vars.starting_clip) {
                    console.log('[RND] starting_clip:', JSON.stringify(vars.starting_clip));
                    state.playing = true;
                    if (!state.clipFirstShown) {
                        state.clipFirstShown = true;
                        advanceClipTextGroup();
                    }
                }
                if (vars.finished_playing) {
                    const min = vars.finished_playing.id;
                    state.playedMinutes.push(min);
                    state.playing = false;
                    console.log('[RND] All clips finished for minute', min);
                    flushClipText();
                    state.activeMinute = null;
                    callbacks.onAllClipsFinished(min);
                }
            };
        };

        // ── Initialization ────────────────────────────────────────────────

        const init = () => {
            const uw = getUW();
            const poll = setInterval(() => {
                if (uw.gameInstance || uw.gameInstanceLoaded) {
                    clearInterval(poll);
                    state.available = true;
                    state.ready = true;
                    stopTMReplay();
                    setupStargateOverride();
                    const vp = document.getElementById('rnd-unity-viewport');
                    if (vp) {
                        moveUnityCanvas();
                        vp.style.display = 'block';
                    }
                    callbacks.onUnityReady();
                }
            }, 500);
            setTimeout(() => clearInterval(poll), 30000);
        };

        // ── Public API ────────────────────────────────────────────────────

        return {
            init,
            getState: () => state,
            resetState: () => { state = DEFAULT_STATE(); },
            saveUnityCanvas,
            moveUnityCanvas,
            loadUnityClips,
            updateMatchFeed,
            updateMatchStats,
        };
    },
};
