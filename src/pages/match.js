import { TmMatchAnalysis } from '../components/match/tm-match-analysis.js';
import { TmMatchDialog } from '../components/match/tm-match-dialog.js';
import { TmMatchUtils } from '../utils/match.js';
import { TmMatchH2H } from '../components/match/tm-match-h2h.js';
import { TmMatchLeague } from '../components/match/tm-match-league.js';
import { TmMatchLineups } from '../components/match/tm-match-lineups.js';
import { TmMatchStatistics } from '../components/match/tm-match-statistics.js';
import { TmMatchStyles } from '../components/match/tm-match-styles.js';
import { TmMatchVenue } from '../components/match/tm-match-venue.js';
import { TmMatchService } from '../services/match.js';

// ==UserScript==
// @name         TM Match Viewer
// @namespace    https://trophymanager.com
// @version      1.4.0
// @description  Enhanced match viewer with live replay, lineups, statistics, venue and H2H tabs
// @match        https://trophymanager.com/matches/*
// @require      file://H:/projects/Moji/tmscripts/lib/tm-constants.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-position.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-utils.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-lib.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-playerdb.js
// @require      file://H:/projects/Moji/tmscripts/lib/tm-services.js
// @require      file://H:/projects/Moji/tmscripts/components/shared/tm-ui.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-styles.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-utils.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-dialog.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-venue.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-h2h.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-analysis.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-league.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-statistics.js
// @require      file://H:/projects/Moji/tmscripts/components/match/tm-match-lineups.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (!/\/matches\/\d+/.test(location.pathname)) return;

    const injectStyles = () => TmMatchStyles.inject();

    // ─── Match cache & rating cells ─────────────────────────────────────
    const roundMatchCache = new Map(); // matchId -> {homeR5, awayR5, data}

    // ─── Match dialog ────────────────────────────────────────────────────
    // ── Live replay state (shared across tabs) ──
    let liveState = null;
    let prematchTimer = null;
    // liveState = { min, sec, curEvtIdx, curLineIdx, playing, timer, mData, speed:1000,
    //               maxMin, ended, schedule, eventMinList, eventMinIdx }

    // ── Unity 3D integration state ──
    let unityState = {
        available: false,       // gameInstance exists on page
        ready: false,           // lineup loaded, ready to play clips
        playing: false,         // currently playing a clip sequence
        pendingMinute: null,    // minute waiting for finished_loading
        loadedMinutes: [],      // minutes that finished loading
        playedMinutes: [],      // minutes that finished playing
        canvasParent: null,     // original parent of the Unity canvas
        tmPaused: false,        // whether we've paused TM's replay
        clipTextQueue: [],      // flat list of {evtIdx, lineIdx} for current minute (first event only)
        clipTextCursor: 0,      // how many text lines we've shown
        clipTextGroups: [],     // group boundaries [{start, count}]
        clipGroupCursor: 0,     // how many groups we've shown
        clipPostQueue: [],      // remaining events' text, shown after animation
        activeMinute: null,     // the minute currently being clip-played
        clipFirstShown: false,  // whether first text group was shown on starting_clip
        clipSkippedFirst: false, // whether we skipped the first finished_clip
    };

    // ── Unity integration helpers ──
    const getUW = () => {
        return typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    };

    const initUnity = () => {
        const uw = getUW();
        const poll = setInterval(() => {
            if (uw.gameInstance || uw.gameInstanceLoaded) {
                clearInterval(poll);
                unityState.available = true;
                unityState.ready = true;  // flash_ready already fired before our override
                stopTMReplay();
                setupStargateOverride();
                // If Lineups tab already rendered, move canvas immediately
                const vp = document.getElementById('rnd-unity-viewport');
                if (vp) {
                    moveUnityCanvas();
                    vp.style.display = 'block';
                }
                // Auto-play live match if paused (e.g. page refresh)
                if (liveState && !liveState.playing && !liveState.ended) {
                    livePlay();
                }
            }
        }, 500);
        setTimeout(() => clearInterval(poll), 30000);
    };

    const stopTMReplay = () => {
        const uw = getUW();
        if (unityState.tmPaused) return;
        unityState.tmPaused = true;
        // Pause TM's replay system completely
        if (uw.flash_status) {
            uw.flash_status.playback_mode = 'pause';
            uw.flash_status.enabled = false;  // prevent TM from sending clips
        }
        // Kill TM's run_match loop
        uw._orig_run_match = uw.run_match;
        uw.run_match = function () { /* noop */ };
        // Also kill TM's text display functions so they don't interfere
        if (uw.show_next_action_text_entry) {
            uw._orig_show_next_action_text_entry = uw.show_next_action_text_entry;
            uw.show_next_action_text_entry = function () { /* noop */ };
        }
        if (uw.prepare_next_minute) {
            uw._orig_prepare_next_minute = uw.prepare_next_minute;
            uw.prepare_next_minute = function () { /* noop */ };
        }
        // Clear any pending setTimeout from TM's run_match chain
        // (clear a range of recent timer IDs to catch the pending one)
        const lastId = setTimeout(() => { }, 0);
        for (let i = lastId - 20; i <= lastId; i++) {
            clearTimeout(i);
        }
        console.log('[RND] TM replay stopped completely');
    };

    // Build flat text-line queue for a minute
    // Only the FIRST play is synced to the animation (distributed by segments over clip duration)
    // Remaining plays are queued as postQueue, shown after animation finishes
    const buildClipTextQueue = (mData, minute) => {
        const plays = mData.plays?.[String(minute)] || [];
        const queue = [];
        const groups = []; // each entry = { start, count } into queue
        const postQueue = []; // remaining plays' text lines
        plays.forEach((play, playIdx) => {
            syncLiveDerivedTeams();
            updateLiveHeader();
            refreshActiveTab();
            let flatIdx = 0;
            if (playIdx === 0) {
                // First play: animation-synced text — one group per segment
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
                // Remaining plays: post-animation text
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

    // Show ONE text line from the clip queue
    const advanceClipTextOneLine = () => {
        if (!liveState || !unityState.clipTextQueue.length) return;
        const idx = unityState.clipTextCursor;
        if (idx >= unityState.clipTextQueue.length) return;
        const entry = unityState.clipTextQueue[idx];
        unityState.clipTextCursor = idx + 1;

        liveState.curEvtIdx = entry.reportEvtIdx;
        liveState.curLineIdx = entry.flatLineIdx;

        // Check if this event is complete
        const play = findPlay(liveState.mData, liveState.min, entry.reportEvtIdx);
        const total = play ? countPlayLines(play) : 1;
        const isComplete = entry.flatLineIdx >= total - 1;
        liveState.curEvtComplete = isComplete;
        liveState.justCompleted = isComplete;

        // Also update the unity side panels
        updateUnityFeed();
        // Only update stats when event is fully complete
        if (isComplete) {
            updateUnityStats();
        };
    };

    // ── Update the left-side feed panel next to viewport (current minute only) ──
    const updateUnityFeed = () => {
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
            // [player=xxx] tags are already resolved in plays; strip event-marker tags
            const text = item.text.replace(/\[(goal|yellow|red|sub|assist)\]/g, '');
            html += `<div class="rnd-unity-feed-line"><span class="rnd-unity-feed-min">${item.min}'</span><span class="rnd-unity-feed-text">${text}</span></div>`;
        });
        container.html(html);
        // Auto-scroll to bottom
        container.scrollTop(container[0].scrollHeight);
    };

    // ── Update the right-side mini stats panel next to viewport ──
    const updateUnityStats = () => {
        const container = $('#rnd-unity-stats');
        if (!container.length || !liveState) return;
        const mData = liveState.mData;
        const homeId = String(mData.teams.home.id);
        const homeIds = mData.homePlayerSet;
        const plays = mData.plays || {};
        const curMin = liveState.min;
        const curEvtIdx = liveState.curEvtIdx;
        const curLineIdx = liveState.curLineIdx;
        const s = TmMatchUtils.extractStats(homeIds, homeId, {
            plays, upToMin: curMin, upToEvtIdx: curEvtIdx, upToLineIdx: curLineIdx,
        });
        const miniBar = (label, hv, av) => {
            const total = hv + av;
            const hp = total === 0 ? 50 : Math.round(hv / total * 100);
            const ap = 100 - hp;
            const hLead = hv > av ? ' lead' : '';
            const aLead = av > hv ? ' lead' : '';
            return `<div class="rnd-unity-stat-row">
                <div class="rnd-unity-stat-hdr"><span class="val home${hLead}">${hv}</span><span class="rnd-unity-stat-label">${label}</span><span class="val away${aLead}">${av}</span></div>
                <div class="rnd-unity-stat-bar"><div class="seg home" style="width:${hp}%"></div><div class="seg away" style="width:${ap}%"></div></div>
            </div>`;
        };
        let h = '';
        h += miniBar('Shots', s.homeShots, s.awayShots);
        h += miniBar('On Target', s.homeSoT, s.awaySoT);
        h += miniBar('Goals', s.homeGoals, s.awayGoals);
        h += miniBar('Yellow', s.homeYellow, s.awayYellow);
        h += miniBar('Red', s.homeRed, s.awayRed);
        h += miniBar('Set Pieces', s.homeSetPieces, s.awaySetPieces);
        container.html(h);
    };

    // Flush all remaining text lines at once (for finished_playing)
    const flushClipText = () => {
        if (!liveState) return;
        const remaining = unityState.clipTextQueue.length - unityState.clipTextCursor;
        const postLen = unityState.clipPostQueue ? unityState.clipPostQueue.length : 0;
        console.log('[RND] flushClipText remaining=' + remaining + ' postQueue=' + postLen);
        // Flush remaining animation text (first event)
        while (unityState.clipTextCursor < unityState.clipTextQueue.length) {
            advanceClipTextOneLine();
        }
        // Append and flush post-animation text (remaining events)
        if (unityState.clipPostQueue && unityState.clipPostQueue.length > 0) {
            unityState.clipPostQueue.forEach(entry => {
                unityState.clipTextQueue.push(entry);
            });
            unityState.clipPostQueue = [];
            while (unityState.clipTextCursor < unityState.clipTextQueue.length) {
                advanceClipTextOneLine();
            }
        }
    };

    // Advance the next text group (called on each finished_clip from Unity)
    const advanceClipTextGroup = () => {
        const groups = unityState.clipTextGroups || [];
        const gi = unityState.clipGroupCursor || 0;
        if (gi >= groups.length) return;
        const group = groups[gi];
        // Show all lines in this group at once
        for (let j = 0; j < group.count; j++) {
            if (unityState.clipTextCursor < unityState.clipTextQueue.length) {
                advanceClipTextOneLine();
            }
        }
        unityState.clipGroupCursor = gi + 1;
        console.log('CALLED PLAYED MINUTES START');
        syncLiveDerivedTeams();
        updateLiveHeader();
        refreshActiveTab();
        console.log('CALLED PLAYED MINUTES END');
        console.log('[RND] Advanced text group ' + gi + ' (' + group.count + ' lines)');
    };

    const setupStargateOverride = () => {
        const uw = getUW();
        uw._orig_stargate = uw.stargate;
        uw.stargate = function (vars) {
            if (vars.flash_ready) {
                unityState.ready = true;
            }

            if (vars.finished_loading) {
                const min = vars.finished_loading.id;
                unityState.loadedMinutes.push(min);

                if (unityState.pendingMinute === min) {
                    unityState.pendingMinute = null;
                    playUnityClips(min);
                }
            }

            // A single clip finished → show the next text group
            // Skip the first finished_clip because its text was already shown on starting_clip
            if (vars.finished_clip) {
                console.log('[RND] finished_clip:', JSON.stringify(vars.finished_clip));
                if (unityState.clipFirstShown && !unityState.clipSkippedFirst) {
                    // First clip just finished; text was already shown via starting_clip
                    unityState.clipSkippedFirst = true;
                    console.log('[RND] Skipping finished_clip for group 0 (already shown on start)');
                } else {
                    advanceClipTextGroup();
                }
            }

            // A clip is starting
            if (vars.starting_clip) {
                console.log('[RND] starting_clip:', JSON.stringify(vars.starting_clip));
                unityState.playing = true;
                // Show first text group immediately when the first clip starts
                if (!unityState.clipFirstShown) {
                    unityState.clipFirstShown = true;
                    advanceClipTextGroup();
                }
                // Goal clip → update score after a short delay
                if (vars.starting_clip.clip && vars.starting_clip.clip.substring(0, 4) === 'goal') {
                    setTimeout(() => {
                        updateLiveHeader();
                        refreshActiveTab();
                    }, 1200);
                }
            }

            // All clips for a minute finished → let timer advance to next minute
            if (vars.finished_playing) {
                const min = vars.finished_playing.id;
                unityState.playedMinutes.push(min);
                unityState.playing = false;
                console.log('[RND] All clips finished for minute', min);
                // Show any remaining lines
                flushClipText();
                // Clear activeMinute so liveStep resumes normal schedule-based flow
                unityState.activeMinute = null;
                // Force sec to 59 so liveStep advances to next minute on next tick
                if (liveState) {
                    liveState.sec = 59;
                    // Apply deferred filter switch if pending
                    if (liveState.pendingFilterSwitch) {
                        applyFilterSwitch(liveState.pendingFilterSwitch);
                    }
                }
            }
        };
    };

    // Save canvas to a hidden container so it survives tab switches
    const saveUnityCanvas = () => {
        if (!unityState.available) return;
        const webglContent = document.querySelector('.webgl-content');
        if (!webglContent) return;
        // Don't save if already in safe container
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

    const moveUnityCanvas = () => {
        if (!unityState.available) return;
        const webglContent = document.querySelector('.webgl-content');
        if (!webglContent) return;
        const target = document.getElementById('rnd-unity-viewport');
        if (!target) return;
        // Remember original parent so we could restore if needed
        if (!unityState.canvasParent) unityState.canvasParent = webglContent.parentElement;
        // Move the .webgl-content into our viewport
        target.innerHTML = '';
        target.appendChild(webglContent);
        // Make .webgl-content visible (TM hides it initially)
        webglContent.style.display = 'block';
        // Clear inline dimensions on #gameContainer (it has width:300px;height:200px)
        const gc = document.getElementById('gameContainer');
        if (gc) {
            gc.style.width = '100%';
            gc.style.height = '100%';
            gc.style.margin = '0';
        }
        // Show viewport
        target.style.display = 'block';
        // Remove no-unity layout class now that canvas is present
        const row = document.querySelector('.rnd-unity-row');
        if (row) row.classList.remove('rnd-no-unity');
        console.log('[RND] Canvas moved into viewport');
        // Sync feed & stats height to viewport height
        syncUnityPanelHeights();
    };

    // Keep feed and stats panels the same height as the viewport
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

    const loadUnityClips = (minute, mData) => {
        const uw = getUW();
        if (!unityState.available || !uw.gameInstance) return false;
        // Use raw report objects so Unity receives full {video, att1, def1, ...} entries
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
        // Prepare the text queue for this minute
        const { queue, groups, postQueue } = buildClipTextQueue(mData, minute);
        unityState.clipTextQueue = queue;
        unityState.clipTextGroups = groups;
        unityState.clipPostQueue = postQueue;
        unityState.clipTextCursor = 0;
        unityState.clipGroupCursor = 0;
        unityState.activeMinute = minute;
        unityState.clipFirstShown = false;
        unityState.clipSkippedFirst = false;
        unityState.pendingMinute = minute;
        const prepareMsg = JSON.stringify({ queue: videoList, id: minute });
        console.log('[RND] SendMessage PrepareMinute', prepareMsg);
        uw.gameInstance.SendMessage('ClipsViewerScript', 'PrepareMinute', prepareMsg);
        return true;
    };



    const playUnityClips = (minute) => {
        const uw = getUW();
        if (!unityState.available || !uw.gameInstance) return;
        unityState.playing = true;
        const playMsg = JSON.stringify({ id: minute });
        uw.gameInstance.SendMessage('ClipsViewerScript', 'PlayMinute', playMsg);
    };

    const LINE_INTERVAL = 3;  // seconds between lines within a minute
    const POST_DELAY = 3;     // seconds after last line before advancing to next minute

    // ── Count total non-empty lines in a play (from plays structure) ──
    const countPlayLines = (play) => {
        if (!play) return 1;
        return Math.max(1, play.segments.reduce((s, seg) => s + seg.text.filter(l => l.trim()).length, 0));
    };

    // ── Count total non-empty lines in an event's chance.text (fallback) ──
    const countEventLines = (evt) => {
        if (!evt.chance || !evt.chance.text) return 1;
        let n = 0;
        evt.chance.text.forEach(textArr => {
            textArr.forEach(line => { if (line && line.trim()) n++; });
        });
        return Math.max(1, n);
    };

    // ── Find the play for a given reportEvtIdx in a minute ──
    const findPlay = (mData, min, reportEvtIdx) => {
        const plays = mData.plays?.[String(min)] || [];
        return plays.find(p => p.reportEvtIdx === reportEvtIdx) || null;
    };

    // ── Calculate current match minute from kickoff timestamp ──
    const calculateLiveMinute = (kickoff) => {
        const now = Math.floor(Date.now() / 1000);
        const elapsed = now - kickoff;
        if (elapsed < 0) return null; // not started
        const FIRST_HALF = 45 * 60;  // 2700s
        const HT_BREAK = 15 * 60;  // 900s
        if (elapsed < FIRST_HALF) {
            return { minute: Math.floor(elapsed / 60), second: elapsed % 60, isHT: false };
        } else if (elapsed < FIRST_HALF + HT_BREAK) {
            return { minute: 45, second: 0, isHT: true };
        } else {
            const sh = elapsed - FIRST_HALF - HT_BREAK;
            return { minute: 45 + Math.floor(sh / 60), second: sh % 60, isHT: false };
        }
    };

    // ── Check if match is currently in progress (via API's live_min) ──
    const isMatchCurrentlyLive = (mData) => {
        const lm = mData.match_data?.live_min;
        return typeof lm === 'number' && lm > 0;
    };

    // ── Derive effective kickoff timestamp from API's live_min ──
    // live_min = total real elapsed minutes since kickoff (includes HT break).
    // calculateLiveMinute then handles the 45min/15min-HT/second-half split.
    const deriveKickoff = (mData) => {
        const lm = mData.match_data.live_min;
        const now = Math.floor(Date.now() / 1000);
        return now - Math.round(lm * 60);
    };

    // ── Build per-minute schedule: which lines appear at which second ──
    const buildSchedule = (plays, keyOnly = false) => {
        const schedule = {};     // min → [{evtIdx, lineIdx, sec}]
        const eventMinList = []; // sorted list of minutes that have events
        const mins = Object.keys(plays).map(Number).sort((a, b) => a - b);
        mins.forEach(min => {
            const minPlays = plays[String(min)] || [];
            const entries = [];
            let secCursor = 0;
            minPlays.forEach(play => {
                if (keyOnly && play.severity !== 1) return;
                const lineCount = countPlayLines(play);
                for (let li = 0; li < lineCount; li++) {
                    entries.push({ evtIdx: play.reportEvtIdx, lineIdx: li, sec: secCursor });
                    secCursor += LINE_INTERVAL;
                }
            });
            if (entries.length > 0) {
                schedule[min] = entries;
                eventMinList.push(min);
            }
        });
        return { schedule, eventMinList };
    };

    // ── Check if an event is visible at the current live step (event-level) ──
    const isEventVisible = TmMatchUtils.isEventVisible;

    const syncLiveDerivedTeams = () => {
        console.log('syncLiveDerivedTeams', liveState);
        if (!liveState?.mData) return;
        liveState.mData = TmMatchUtils.deriveMatchData(liveState);
    };

    // ── Update live header (score + minute + progress) ──
    const updateLiveHeader = () => {
        if (!liveState) return;
        $('#rnd-overlay .rnd-dlg-score').text(`${liveState.mData.teams.home.goals} - ${liveState.mData.teams.away.goals}`);
        const minDisplay = liveState.ended ? 'FT'
            : liveState.liveIsHT ? 'HT'
                : `${liveState.min}:${String(liveState.sec).padStart(2, '0')}`;
        $('#rnd-live-min-head').text(minDisplay);
        const maxMin = liveState.maxMin || 90;
        const pct = Math.min(100, Math.round((liveState.min * 60 + liveState.sec) / (maxMin * 60) * 100));
        $('#rnd-live-progress-head').css('width', pct + '%');
        if (liveState.ended) {
            $('#rnd-overlay .rnd-dlg-head').removeClass('rnd-live-active');
            $('#rnd-live-play-head').html('▶');
        }
        const hChip = $('#rnd-chip-ment-home');
        if (hChip.length) hChip.find('.chip-val').text(liveState.mData.teams.home.mentalityLabel || liveState.mData.teams.home.mentality);
        const aChip = $('#rnd-chip-ment-away');
        if (aChip.length) aChip.find('.chip-val').text(liveState.mData.teams.away.mentalityLabel || liveState.mData.teams.away.mentality);
    };

    // ── Refresh whichever tab is active ──
    const refreshActiveTab = () => {
        if (!liveState) return;
        const tab = $('#rnd-overlay .rnd-tab.active').attr('data-tab');
        if (!tab) return;

        // When match ended/skipped, always do full render
        if (liveState.ended) {
            renderDialogTab(tab, liveState.mData);
            return;
        }
        // Report tab: append/update lines from schedule for current minute
        if (tab === 'report') {
            const entries = liveState.schedule[liveState.min] || [];
            const maxLinePerEvt = {};
            entries.forEach(e => {
                if (e.sec <= liveState.sec) {
                    if (maxLinePerEvt[e.evtIdx] === undefined || e.lineIdx > maxLinePerEvt[e.evtIdx]) {
                        maxLinePerEvt[e.evtIdx] = e.lineIdx;
                    }
                }
            });
            Object.entries(maxLinePerEvt).forEach(([eidx, lidx]) => {
                appendReportText(liveState.mData, liveState.min, Number(eidx), lidx);
            });
            return;
        }
        // Details tab: re-render only when an event just became complete (all text shown)
        if (tab === 'details') {
            if (liveState.justCompleted) renderDialogTab(tab, liveState.mData);
            return;
        }
        // Statistics tab: same — only re-render on event completion
        if (tab === 'statistics') {
            if (liveState.justCompleted) renderDialogTab(tab, liveState.mData);
            return;
        }
        // Lineups tab: re-render on every text step (icons update per action)
        if (tab === 'lineups') {
            renderDialogTab(tab, liveState.mData);
            return;
        }
        // Other tabs: don't re-render during live
    };

    // ── Build HTML for a single report event accordion ──
    // maxLineIdx: how many individual lines to show (-1 = all)
    // hideBadges: when true, hide goal/red/sub badges (show text preview instead)
    const buildReportEventHtml = (evt, min, evtIdx, playerNames, homeId, maxLineIdx = -1, hideBadges = false) => {
        if (!evt) return '';
        // ── Play adapter: convert normalized play to report-event shape ──
        if (evt.segments) {
            const acts = evt.segments.flatMap(s => s.actions);
            const goalAct = acts.find(a => a.action === 'shot' && a.goal);
            const assistAct = acts.find(a => a.action === 'assist');
            const yellowAct = acts.find(a => a.action === 'yellow');
            const yellowRedAct = acts.find(a => a.action === 'yellowRed');
            const redAct = acts.find(a => a.action === 'red');
            const subInAct = acts.find(a => a.action === 'subIn');
            const subOutAct = acts.find(a => a.action === 'subOut');
            const injAct = acts.find(a => a.action === 'injury');
            const adapted = {
                chance: { text: evt.segments.map(s => s.text || []) },
                club: evt.team,
            };
            if (goalAct) adapted.goal = { player: goalAct.by, assist: assistAct?.by };
            if (yellowAct) adapted.yellow = yellowAct.by;
            if (yellowRedAct) adapted.yellow_red = yellowRedAct.by;
            if (redAct) adapted.red = redAct.by;
            if (subInAct && subOutAct) adapted.sub = { player_in: subInAct.by, player_out: subOutAct.by };
            if (injAct) adapted.injury = injAct.by;
            evt = adapted;
        }
        const chance = evt.chance;
        if (!chance || !chance.text) return '';

        const evtClub = String(evt.club || 0);
        const isHome = evtClub === homeId;
        const isNeutral = !evt.club || evtClub === '0';

        let headerBadges = '';
        let hasEvents = false;
        if (!hideBadges) {
            if (evt.goal) {
                hasEvents = true;
                const scorer = playerNames[evt.goal.player] || '?';
                const score = evt.goal.score ? evt.goal.score.join('-') : '';
                let b = `⚽ ${scorer}`;
                if (score) b += ` (${score})`;
                if (evt.goal.assist) b += ` <span style="font-size:11px;color:#90b878">ast. ${playerNames[evt.goal.assist] || '?'}</span>`;
                headerBadges += `<div class="rnd-report-evt-badge evt-goal">${b}</div>`;
            }
            if (evt.yellow) { hasEvents = true; headerBadges += `<div class="rnd-report-evt-badge evt-yellow">🟨 ${playerNames[evt.yellow] || '?'}</div>`; }
            if (evt.yellow_red) { hasEvents = true; headerBadges += `<div class="rnd-report-evt-badge evt-red">🟥🟨 ${playerNames[evt.yellow_red] || '?'}</div>`; }
            if (evt.red) { hasEvents = true; headerBadges += `<div class="rnd-report-evt-badge evt-red">🟥 ${playerNames[evt.red] || '?'}</div>`; }
            if (evt.injury) {
                hasEvents = true;
                headerBadges += `<div class="rnd-report-evt-badge evt-injury"><span style="color:#ff3c3c;font-weight:800">✚</span> ${playerNames[evt.injury] || '?'}</div>`;
            }
            if (evt.sub) {
                hasEvents = true;
                const pIn = playerNames[evt.sub.player_in] || '?';
                const pOut = playerNames[evt.sub.player_out] || '?';
                headerBadges += `<div class="rnd-report-evt-badge evt-sub">🔄 ↑${pIn} ↓${pOut}</div>`;
            }
        }

        // Build lines, respecting maxLineIdx limit (flat line count)
        const lines = [];
        let flatIdx = 0;
        chance.text.forEach((textArr) => {
            textArr.forEach(line => {
                if (!line || !line.trim()) return;
                if (maxLineIdx >= 0 && flatIdx > maxLineIdx) { flatIdx++; return; }
                let resolved = resolvePlayerTags(line, playerNames);
                resolved = resolved.replace(/\[goal\]/g, '<span class="rnd-goal-text">⚽ ');
                resolved = resolved.replace(/\[yellow\]/g, '<span class="rnd-yellow-text">🟨 ');
                resolved = resolved.replace(/\[red\]/g, '<span class="rnd-red-text">🟥 ');
                resolved = resolved.replace(/\[sub\]/g, '<span class="rnd-sub-text">🔄 ');
                resolved = resolved.replace(/\[assist\]/g, '');
                const openTags = (resolved.match(/<span class="rnd-(goal|yellow|red|sub)-text">/g) || []).length;
                for (let t = 0; t < openTags; t++) resolved += '</span>';
                lines.push(resolved);
                flatIdx++;
            });
        });

        const goalCls = headerBadges.includes('evt-goal') ? ' rnd-acc-goal' : '';
        const chevron = '<svg class="rnd-acc-chevron" viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>';
        let headerContent = headerBadges;
        if (!hasEvents) {
            const preview = lines.length ? lines[0] : '';
            headerContent = `<span style="color:#90b878;font-size:12px">${preview}</span>`;
        }

        const totalLines = countEventLines(evt);
        let html = `<div class="rnd-acc" data-acc="${min}-${evtIdx}" data-line-count="${maxLineIdx >= 0 ? maxLineIdx + 1 : totalLines}">`;
        html += `<div class="rnd-acc-head${goalCls}">`;
        html += `<div class="rnd-acc-home">${isHome ? headerContent : ''}</div>`;
        html += `<div class="rnd-acc-min">${min}'</div>`;
        html += `<div class="rnd-acc-away">${!isHome && !isNeutral ? headerContent : (isNeutral ? headerContent : '')}</div>`;
        html += chevron;
        html += `</div>`;
        html += `<div class="rnd-acc-body"><div class="rnd-report-text">${lines.join('<br>')}</div></div>`;
        html += `</div>`;
        return html;
    };

    // ── Append or update lines in the Report tab (line-level stepping) ──
    const appendReportText = (mData, curMin, curEvtIdx, curLineIdx) => {
        const container = $('#rnd-report-timeline');
        // If container doesn't exist, the Report tab hasn't been rendered yet — do full render
        if (!container.length) {
            renderDialogTab('report', mData);
            return;
        }

        const visibleReportState = TmMatchUtils.buildVisibleReportState(mData.plays || {}, curMin, curEvtIdx, curLineIdx);
        const currentEvent = visibleReportState.find(evt => evt.min === curMin && evt.evtIdx === curEvtIdx);
        if (!currentEvent) return;

        const playerNames = buildPlayerNames(mData);
        const homeId = String(mData.teams.home.id);
        const key = `${curMin}-${curEvtIdx}`;
        const existing = container.find(`[data-acc="${key}"]`);

        if (existing.length) {
            // Event accordion already exists — update with one more line
            const oldCount = Number(existing.attr('data-line-count') || 0);
            if (curLineIdx < oldCount) return;  // already shown this line
            // Re-build the accordion with updated line count
            const newHtml = buildReportEventHtml(currentEvent.play, currentEvent.min, currentEvent.evtIdx, playerNames, homeId, currentEvent.maxLineIdx, currentEvent.hideBadges);
            if (!newHtml) return;
            const wasOpen = existing.hasClass('open');
            const $new = $(newHtml);
            if (wasOpen) $new.addClass('open');
            existing.replaceWith($new);
        } else {
            // New event — collapse all other accordions, then append with auto-open
            container.find('.rnd-acc.open').removeClass('open');
            const evtHtml = buildReportEventHtml(currentEvent.play, currentEvent.min, currentEvent.evtIdx, playerNames, homeId, currentEvent.maxLineIdx, currentEvent.hideBadges);
            if (!evtHtml) return;
            const $el = $(evtHtml).addClass('rnd-live-feed-line open');
            container.append($el);
        }

        // Auto-scroll the dialog body to show the latest content
        const dlgBody = $('#rnd-dlg-body');
        dlgBody.animate({ scrollTop: dlgBody[0].scrollHeight }, 300);
    };

    // ── Advance one second in the live replay ──
    const liveStep = () => {
        if (!liveState || !liveState.playing) return;

        // ── LIVE mode: wall-clock driven ticking ──
        if (liveState.filterMode === 'live') {
            const kickoff = liveState.liveKickoff;
            if (!kickoff) return;
            const info = calculateLiveMinute(kickoff);
            const lastMin = liveState.mData.match_data.last_min || 90;
            if (!info || info.minute > lastMin) {
                // Match ended
                liveState.min = lastMin; liveState.sec = 59;
                liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
                liveState.ended = true; liveState.playing = false;
                liveState.liveIsHT = false;
                updateLiveHeader(); refreshActiveTab();
                return;
            }
            const prevMin = liveState.min;
            liveState.min = info.minute;
            liveState.sec = info.second;
            liveState.liveIsHT = info.isHT;
            if (info.isHT) {
                // Halftime — all first-half events visible, just tick clock
                liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
                liveState.curEvtComplete = true;
                updateLiveHeader();
                liveState.timer = setTimeout(liveStep, liveState.speed);
                return;
            }
            // If Unity clips are playing for this minute, just tick the clock
            if (unityState.activeMinute === liveState.min) {
                updateLiveHeader();
                liveState.timer = setTimeout(liveStep, liveState.speed);
                return;
            }
            // Show all events up to current minute
            liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
            liveState.curEvtComplete = true;
            const minuteChanged = liveState.min !== prevMin;
            liveState.justCompleted = minuteChanged;
            // Load Unity clips when entering a new event minute
            if (minuteChanged && unityState.available && unityState.ready) {
                const hasClips = loadUnityClips(liveState.min, liveState.mData);
                if (hasClips) {
                    // Clips loaded — animation will play, text driven by stargate callbacks
                    updateLiveHeader();
                    refreshActiveTab();
                    liveState.timer = setTimeout(liveStep, liveState.speed);
                    return;
                }
            }
            updateLiveHeader();
            if (minuteChanged) refreshActiveTab();
            liveState.timer = setTimeout(liveStep, liveState.speed);
            return;
        }

        liveState.sec++;

        // ── If Unity clips are active for this minute, just tick the clock ──
        if (unityState.activeMinute === liveState.min) {
            // Clock advances, but text is driven by stargate callbacks (advanceClipText)
            // Don't process schedule, don't advance minute — wait for finished_playing
            updateLiveHeader();
            liveState.timer = setTimeout(liveStep, liveState.speed);
            return;
        }

        // Check if current minute is finished (past last line + delay, or >= 60)
        const entries = liveState.schedule[liveState.min] || [];
        const lastSec = entries.length > 0 ? entries[entries.length - 1].sec : -1;
        const minuteEnd = lastSec + POST_DELAY;

        if (liveState.sec > minuteEnd || liveState.sec >= 60) {
            // Move to next event minute
            const nextIdx = liveState.eventMinIdx + 1;
            if (nextIdx >= liveState.eventMinList.length) {
                // Match finished
                liveState.min = liveState.maxMin;
                liveState.sec = 59;
                liveState.curEvtIdx = 999;
                liveState.curLineIdx = 999;
                liveState.playing = false;
                liveState.ended = true;
                updateLiveHeader();
                refreshActiveTab();
                return;
            }
            liveState.eventMinIdx = nextIdx;
            liveState.min = liveState.eventMinList[nextIdx];
            liveState.sec = 0;
            // Reset event tracking to prevent score from briefly showing future goals
            liveState.curEvtIdx = -1;
            liveState.curEvtComplete = false;

            // ── Unity 3D: trigger clip loading when entering a new minute with videos ──
            if (unityState.available && unityState.ready) {
                const hasClips = loadUnityClips(liveState.min, liveState.mData);
                if (hasClips) {
                    // Timer keeps running — clock ticks, text driven by clip callbacks
                    updateLiveHeader();
                    liveState.timer = setTimeout(liveStep, liveState.speed);
                    return;
                }
            }
        }

        // Check schedule for new lines at current second (non-clip minutes only)
        let hasNew = false;
        liveState.justCompleted = false;
        const curEntries = liveState.schedule[liveState.min] || [];
        curEntries.forEach(entry => {
            if (entry.sec === liveState.sec) {
                liveState.curEvtIdx = entry.evtIdx;
                liveState.curLineIdx = entry.lineIdx;
                hasNew = true;
                const play = findPlay(liveState.mData, liveState.min, entry.evtIdx);
                const total = play ? countPlayLines(play) : 1;
                const isComplete = entry.lineIdx >= total - 1;
                liveState.curEvtComplete = isComplete;
                if (isComplete) liveState.justCompleted = true;
            }
        });

        updateLiveHeader();
        if (hasNew) refreshActiveTab();
        liveState.timer = setTimeout(liveStep, liveState.speed);
    };

    const livePlay = () => {
        if (!liveState || liveState.ended || liveState.playing) return;
        liveState.playing = true;
        $('#rnd-live-play-head').html('⏸');
        // If Unity was paused mid-animation, unpause it
        if (unityState.activeMinute !== null) {
            const uw = getUW();
            if (uw.gameInstance) {
                uw.gameInstance.SendMessage('ClipsViewerScript', 'OnPauseGame');
            }
        }
        liveStep();
    };
    const livePause = () => {
        if (!liveState) return;
        liveState.playing = false;
        clearTimeout(liveState.timer);
        $('#rnd-live-play-head').html('▶');
        // Immediately pause Unity animation if playing
        if (unityState.playing && unityState.activeMinute !== null) {
            const uw = getUW();
            if (uw.gameInstance) {
                uw.gameInstance.SendMessage('ClipsViewerScript', 'OnPauseGame');
            }
        }
    };
    const liveToggle = () => {
        if (!liveState) return;
        if (liveState.playing) livePause(); else livePlay();
    };

    // Apply a deferred or immediate filter mode switch (All ↔ Key ↔ Live)
    const applyFilterSwitch = (mode) => {
        if (!liveState) return;
        // LIVE mode: switch to all-events schedule and jump to current wall-clock minute
        if (mode === 'live') {
            const sch = liveState.scheduleAll;
            liveState.schedule = sch.schedule;
            liveState.eventMinList = sch.eventMinList;
            liveState.maxMin = sch.eventMinList.length ? sch.eventMinList[sch.eventMinList.length - 1] : 90;
            let kickoff = liveState.liveKickoff;
            if (!kickoff && isMatchCurrentlyLive(liveState.mData)) {
                kickoff = deriveKickoff(liveState.mData);
                liveState.liveKickoff = kickoff;
            }
            const info = kickoff ? calculateLiveMinute(kickoff) : null;
            const lastMin = liveState.mData.match_data.last_min || 90;
            if (info && info.minute <= lastMin) {
                liveState.min = info.minute;
                liveState.sec = info.second;
                liveState.liveIsHT = info.isHT;
                liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
                liveState.curEvtComplete = true; liveState.justCompleted = true;
                liveState.ended = false;
            } else {
                // Match over
                liveState.min = lastMin; liveState.sec = 59;
                liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
                liveState.ended = true; liveState.playing = false;
                liveState.liveIsHT = false;
            }
            liveState.pendingFilterSwitch = null;
            console.log('[RND] Filter switch applied: live (min ' + liveState.min + ')');
            updateLiveHeader(); refreshActiveTab();
            return;
        }
        liveState.liveIsHT = false;
        const sch = mode === 'key' ? liveState.scheduleKey : liveState.scheduleAll;
        liveState.schedule = sch.schedule;
        liveState.eventMinList = sch.eventMinList;
        liveState.maxMin = sch.eventMinList.length ? sch.eventMinList[sch.eventMinList.length - 1] : 90;
        // Find next event minute AFTER current (don't re-play the minute we just finished)
        const curMin = liveState.min;
        let newIdx = sch.eventMinList.findIndex(m => m > curMin);
        if (newIdx < 0) {
            // No more minutes — match finished
            liveState.min = liveState.maxMin;
            liveState.sec = 59;
            liveState.curEvtIdx = 999;
            liveState.curLineIdx = 999;
            liveState.playing = false;
            liveState.ended = true;
            liveState.pendingFilterSwitch = null;
            updateLiveHeader();
            refreshActiveTab();
            return;
        }
        liveState.eventMinIdx = newIdx;
        liveState.min = sch.eventMinList[newIdx];
        liveState.sec = -1;
        liveState.curEvtIdx = -1;
        liveState.curLineIdx = -1;
        liveState.curEvtComplete = true;
        liveState.justCompleted = false;
        liveState.pendingFilterSwitch = null;
        console.log('[RND] Filter switch applied: ' + mode);
        // Load Unity clips for the new minute (so animation + clip-driven text work)
        if (unityState.available && unityState.ready) {
            loadUnityClips(liveState.min, liveState.mData);
        }
        updateLiveHeader();
        refreshActiveTab();
    };

    const liveSkip = () => {
        if (!liveState) return;
        livePause();
        liveState.min = liveState.maxMin;
        liveState.sec = 59;
        liveState.curEvtIdx = 999;
        liveState.curLineIdx = 999;
        liveState.eventMinIdx = liveState.eventMinList.length;
        liveState.ended = true;
        updateLiveHeader();
        refreshActiveTab();
    };

    const openMatchDialog = (matchId) => {
        const cached = roundMatchCache.get(String(matchId));
        // If not cached yet, fetch on-demand
        const show = (mData) => {
            // Determine if this match is in the future
            const matchIsFuture = TmMatchUtils.isMatchFuture(mData);

            // Determine if match is currently live
            const matchIsLive = !matchIsFuture && isMatchCurrentlyLive(mData);

            // Build schedules & live state only for non-future matches
            if (!matchIsFuture) {
                const allSch = buildSchedule(mData.plays, false);
                const keySch = buildSchedule(mData.plays, true);
                const { schedule: keySchedule, eventMinList: keyEventMinList } = keySch;
                const maxMin = keyEventMinList.length ? keyEventMinList[keyEventMinList.length - 1] : 90;

                if (liveState && liveState.timer) clearTimeout(liveState.timer);
                if (matchIsLive) {
                    const { schedule: allSchedule, eventMinList: allEventMinList } = allSch;
                    const allMaxMin = allEventMinList.length ? allEventMinList[allEventMinList.length - 1] : 90;
                    const effectiveKickoff = deriveKickoff(mData);
                    const info = calculateLiveMinute(effectiveKickoff);
                    const lastMin = mData.match_data.last_min || 90;
                    const liveMin = info ? Math.min(info.minute, lastMin) : Math.floor(mData.match_data.live_min);
                    const liveSec = info ? info.second : 0;
                    const liveHT = info ? info.isHT : false;
                    console.log('[RND] LIVE detected — live_min:', mData.match_data.live_min, '→ min:', liveMin, 'sec:', liveSec, 'HT:', liveHT);
                    liveState = {
                        min: liveMin, sec: liveSec,
                        curEvtIdx: 999, curLineIdx: 999,
                        curEvtComplete: true, justCompleted: false,
                        playing: false, timer: null, mData,
                        speed: 1000, maxMin: allMaxMin,
                        ended: info ? info.minute > lastMin : false,
                        schedule: allSchedule, eventMinList: allEventMinList, eventMinIdx: 0,
                        filterMode: 'live', liveIsHT: liveHT,
                        liveKickoff: effectiveKickoff,
                        scheduleAll: allSch, scheduleKey: keySch
                    };
                } else {
                    liveState = {
                        min: keyEventMinList.length ? keyEventMinList[0] : 0,
                        sec: -1,
                        curEvtIdx: -1, curLineIdx: -1,
                        curEvtComplete: true, justCompleted: false,
                        playing: false, timer: null, mData,
                        speed: 1000, maxMin, ended: false,
                        schedule: keySchedule, eventMinList: keyEventMinList, eventMinIdx: 0,
                        filterMode: 'key', liveIsHT: false,
                        liveKickoff: null,
                        scheduleAll: allSch, scheduleKey: keySch
                    };
                }
                console.log('[RND] Live state initialized', liveState, mData);
                syncLiveDerivedTeams();
            } else {
                // Future match: no live state needed
                if (liveState && liveState.timer) clearTimeout(liveState.timer);
                liveState = null;
            }

            // Build dialog overlay
            const overlay = TmMatchDialog.build(mData, matchIsFuture, matchIsLive);

            $('body').append(overlay).css('overflow', 'hidden');

            const closeDialog = () => {
                if (liveState && liveState.timer) clearTimeout(liveState.timer);
                liveState = null;
                if (prematchTimer) { clearTimeout(prematchTimer); prematchTimer = null; }
                overlay.remove();
                $('body').css('overflow', '');
            };

            // Close handlers
            overlay.on('click', '#rnd-dlg-close', closeDialog);
            overlay.on('click', (e) => { if (e.target === overlay[0]) closeDialog(); });
            $(document).one('keydown.rndDlg', (e) => {
                if (e.key === 'Escape') { closeDialog(); $(document).off('keydown.rndDlg'); }
            });

            // Live replay controls & filters (skip for future matches)
            if (!matchIsFuture) {
                overlay.on('click', '#rnd-live-play-head', liveToggle);
                overlay.on('click', '#rnd-live-skip-head', liveSkip);
                overlay.on('click', '.rnd-live-filter-btn', function () {
                    const mode = $(this).data('filter');
                    if (!liveState || liveState.filterMode === mode) return;
                    liveState.filterMode = mode;
                    overlay.find('.rnd-live-filter-btn').removeClass('active');
                    $(this).addClass('active');
                    if (unityState.activeMinute !== null || unityState.playing) {
                        liveState.pendingFilterSwitch = mode;
                        console.log('[RND] Filter switch deferred until animation finishes');
                        return;
                    }
                    applyFilterSwitch(mode);
                });
            }

            // Tab switching
            overlay.on('click', '.rnd-tab', function () {
                overlay.find('.rnd-tab').removeClass('active');
                $(this).addClass('active');
                renderDialogTab($(this).attr('data-tab'), mData);
            });

            // Render default tab + start live replay
            // Add rnd-live-active class to header when live
            if (!matchIsFuture) {
                $('#rnd-overlay .rnd-dlg-head').addClass('rnd-live-active');
            }
            renderDialogTab('lineups', mData);
            if (!matchIsFuture) {
                updateLiveHeader();
                setTimeout(() => livePlay(), 500);
            } else {
                // Schedule auto-reload when match kicks off
                const lm = mData.match_data?.live_min;
                if (typeof lm === 'number' && lm < 0) {
                    const msUntilKickoff = Math.abs(lm) * 60 * 1000 + 5000; // +5s buffer
                    if (prematchTimer) clearTimeout(prematchTimer);
                    prematchTimer = setTimeout(() => {
                        prematchTimer = null;
                        // Close current dialog, clear cache, re-open with fresh data
                        closeDialog();
                        roundMatchCache.delete(String(matchId));
                        openMatchDialog(matchId);
                    }, msUntilKickoff);
                    console.log('[RND] Prematch timer set — auto-reload in', Math.round(msUntilKickoff / 1000), 'seconds');
                }
            }


        };

        if (cached && cached.data) {
            show(cached.data);
        } else {
            // Fetch match data on demand
            TmMatchService.fetchMatch(matchId).then(mData => {
                if (mData) {
                    console.log('[RND] Match data fetched for matchId', matchId, mData);
                    show(mData);
                }
            });
        }

        // When all tooltip profiles are ready, refresh analysis tab if active
        window.addEventListener('tm:match-profiles-ready', (e) => {
            const activeMData = liveState?.mData;
            if (activeMData && e.detail === activeMData) {
                const activeTab = $('.rnd-tab.active').data('tab');
                if (activeTab === 'lineups' || activeTab === 'analysis') renderDialogTab(activeTab, activeMData);
            }
        });
    };

    const renderDialogTab = (tab, mData) => {
        const activeMatchData = liveState?.mData || mData;
        const curMin = liveState?.min ?? 999;
        const curEvtIdx = liveState?.curEvtIdx ?? 999;
        const curLineIdx = liveState?.curLineIdx ?? 999;
        const activeState = liveState || {
            mData: activeMatchData,
            min: curMin,
            curEvtIdx,
            curLineIdx,
            ended: true,
        };
        // Save Unity canvas before destroying lineups tab DOM
        // Skip for lineups — it handles in-place updates without destroying viewport
        if (tab !== 'lineups') saveUnityCanvas();
        const body = $('#rnd-dlg-body');
        const sharedOpts = {
            getUnityState: () => unityState,
            moveUnityCanvas,
            saveUnityCanvas,
            updateUnityStats,
            liveState: activeState,
            isEventVisible,
            buildPlayerNames,
            buildReportEventHtml,
        };
        console.log(`[RND] Rendering tab "${tab}" liveState `, liveState);
        switch (tab) {
            case 'details': renderDetailsTab(body, activeMatchData, curMin, curEvtIdx, curLineIdx); break;
            case 'statistics': TmMatchStatistics.render(body, activeMatchData, curMin, curEvtIdx, curLineIdx, sharedOpts); break;
            case 'report': renderReportTab(body, activeMatchData, curMin, curEvtIdx, curLineIdx); break;
            case 'lineups': TmMatchLineups.render(body, liveState, sharedOpts); break;
            case 'venue': TmMatchVenue.render(body, activeMatchData); break;
            case 'h2h': TmMatchH2H.render(body, activeMatchData); break;
            case 'league': TmMatchLeague.render(body, activeMatchData, curMin, curEvtIdx); break;
            case 'analysis': TmMatchAnalysis.render(body, activeMatchData, activeMatchData.teams); break;
        }
    };

    // ── Helper: build player name lookup ──
    const buildPlayerNames = TmMatchUtils.buildPlayerNames;

    // ── Helper: resolve [player=ID] tags in text ──
    const resolvePlayerTags = (text, playerNames) => {
        return text.replace(/\[player=(\d+)\]/g, (_, id) => {
            const name = playerNames[id] || id;
            return `<span class="rnd-player-name">${name}</span>`;
        });
    };

    const renderDetailsTab = (body, mData, curMin = 999, curEvtIdx = 999, curLineIdx = 999) => {
        const playerNames = buildPlayerNames(mData);
        const homeIds = mData.homePlayerSet;
        const homeId = String(mData.teams.home.id);
        const visiblePlays = mData.visiblePlays || TmMatchUtils.buildVisiblePlays(mData.plays || {}, curMin, curEvtIdx, curLineIdx);

        let html = '<div style="max-width:900px;margin:0 auto">';

        // ── Parse key events from plays (filtered by current step) ──
        const events = [];
        Object.keys(visiblePlays).sort((a, b) => Number(a) - Number(b)).forEach(minKey => {
            const min = Number(minKey);
            (visiblePlays[minKey] || []).forEach(play => {
                for (const seg of play.segments) {
                    for (const act of seg.actions) {
                        if (act.action === 'shot' && act.goal) {
                            const assistAct = seg.actions.find(a => a.action === 'assist')
                                || play.segments.flatMap(s => s.actions).find(a => a.action === 'assist');
                            events.push({
                                min, type: 'goal',
                                isHome: String(play.team) === homeId,
                                player: playerNames[act.by] || '?',
                                assist: assistAct?.by ? (playerNames[assistAct.by] || null) : null
                            });
                        } else if (act.action === 'yellow') {
                            events.push({ min, type: 'yellow', isHome: homeIds.has(String(act.by)), player: playerNames[act.by] || '?' });
                        } else if (act.action === 'yellowRed') {
                            events.push({ min, type: 'yellowred', isHome: homeIds.has(String(act.by)), player: playerNames[act.by] || '?' });
                        } else if (act.action === 'subIn') {
                            const subOutAct = seg.actions.find(a => a.action === 'subOut');
                            const isHome = homeIds.has(String(act.by)) || (subOutAct && homeIds.has(String(subOutAct.by)));
                            events.push({ min, type: 'sub', isHome, playerIn: playerNames[act.by] || '?', playerOut: subOutAct ? (playerNames[subOutAct.by] || '?') : '?' });
                        } else if (act.action === 'injury') {
                            events.push({ min, type: 'injury', isHome: homeIds.has(String(act.by)), player: playerNames[act.by] || '?' });
                        }
                    }
                }
            });
        });

        // ── Build event text (icon placement depends on side) ──
        const evtText = (evt, side) => {
            const icons = { goal: '⚽', yellow: '🟨', yellowred: '🟥', sub: '🔄', injury: '<span style="color:#ff3c3c;font-weight:800">✚</span>' };
            const icon = icons[evt.type];
            let text = '';
            if (evt.type === 'goal') {
                text = `<strong style="color:#f0fce0">${evt.player}</strong>`;
                if (evt.assist) text += ` <span style="color:#90b878;font-size:11px">(${evt.assist})</span>`;
            } else if (evt.type === 'sub') {
                text = `<span style="color:#80d848">↑ ${evt.playerIn}</span>  <span style="color:#c07050">↓ ${evt.playerOut}</span>`;
            } else if (evt.type === 'injury') {
                text = `<span style="color:#ff8c3c">${evt.player}</span>`;
            } else {
                text = evt.player;
            }
            return side === 'home' ? `${text} ${icon}` : `${icon} ${text}`;
        };

        // ── Render timeline ──
        html += '<div class="rnd-timeline">';
        events.forEach(evt => {
            const cls = evt.type === 'goal' ? ' rnd-tl-goal' : '';
            html += `<div class="rnd-tl-row${cls}">`;
            html += `<div class="rnd-tl-home">${evt.isHome ? evtText(evt, 'home') : ''}</div>`;
            html += `<div class="rnd-tl-min">${evt.min}'</div>`;
            html += `<div class="rnd-tl-away">${!evt.isHome ? evtText(evt, 'away') : ''}</div>`;
            html += `</div>`;
        });
        html += '</div></div>';

        body.html(html);
    };

    const renderReportTab = (body, mData, curMin = 999, curEvtIdx = 999, curLineIdx = 999) => {
        const playerNames = buildPlayerNames(mData);
        const homeId = String(mData.teams.home.id);
        const visibleReportState = mData.visibleReportState || TmMatchUtils.buildVisibleReportState(mData.plays || {}, curMin, curEvtIdx, curLineIdx);

        let html = '<div style="max-width:900px;margin:0 auto"><div id="rnd-report-timeline" class="rnd-timeline">';

        visibleReportState.forEach(evt => {
            html += buildReportEventHtml(evt.play, evt.min, evt.evtIdx, playerNames, homeId, evt.maxLineIdx, evt.hideBadges);
        });

        html += '</div></div>';
        body.html(html);

        // Accordion toggle (delegated)
        body.off('click.rndacc').on('click.rndacc', '.rnd-acc-head', function () {
            $(this).closest('.rnd-acc').toggleClass('open');
        });
    };

    // ─── Loading indicator ───────────────────────────────────────────────
    const cleanupPage = () => {
        if (liveState && liveState.timer) clearTimeout(liveState.timer);
        liveState = null;
        $('#rnd-overlay').remove();
        $('body').css('overflow', '');
        unityState = {
            available: false, ready: false, playing: false,
            pendingMinute: null, loadedMinutes: [], playedMinutes: [],
            canvasParent: null, tmPaused: false,
            clipTextQueue: [], clipTextCursor: 0,
            clipTextGroups: [], clipGroupCursor: 0,
            clipPostQueue: [], activeMinute: null,
            clipFirstShown: false, clipSkippedFirst: false
        };
    };

    const initForCurrentPage = () => {
        cleanupPage();
        injectStyles();
        initUnity();
        const matchId = window.location.pathname.match(/\/matches\/(\d+)/)?.[1];
        if (!matchId) return;
        // Remove TM's default Rounds widget and ad placeholder
        try { $('.banner_placeholder.rectangle')[0].parentNode.removeChild($('.banner_placeholder.rectangle')[0]); } catch (e) { }
        try { $('.column3_a .box').has('h2').filter(function () { return $(this).find('h2').text().trim().toUpperCase() === 'ROUNDS'; }).remove(); } catch (e) { }
        const pollInterval = setInterval(() => {
            if ($('body').length && document.readyState !== 'loading') {
                clearInterval(pollInterval);
                openMatchDialog(matchId);
            }
        }, 500);
    };

    initForCurrentPage();
})();
