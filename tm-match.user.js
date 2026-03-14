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

    // ─── Constants ───────────────────────────────────────────────────────
    const { REC_THRESHOLDS } = window.TmConst;

    // ─── Utility helpers ─────────────────────────────────────────────────
    const parseNum = str => Number(String(str).replace(/,/g, ''));

    const getColor = window.TmUtils.getColor;

    // ─── Player data fetching (with Promise-based cache) ─────────────────
    const tooltipCache = new Map();

    const fetchTooltip = playerId => {
        const pid = String(playerId);
        if (!tooltipCache.has(pid)) {
            tooltipCache.set(pid, window.TmApi.fetchTooltipRaw(playerId).then(data => {
                if (!data) throw new Error('tooltip fetch failed');
                return data;
            }));
        }
        return tooltipCache.get(pid);
    };

    const getPlayerData = (playerId, routineMap, positionMap) => {
        return fetchTooltip(playerId).then(rawData => {
            const player = JSON.parse(JSON.stringify(rawData.player));
            if (routineMap.has(playerId)) player.routine = String(routineMap.get(playerId));
            if (positionMap.has(playerId)) player.favposition = positionMap.get(playerId);
            const DBPlayer = window.TmPlayerDB.get(parseInt(player.player_id));
            window.TmApi.normalizePlayer(player, DBPlayer, { skipSync: true });
            return { Age: player.ageMonths, REC: player.rec, R5: player.r5 };
        });
    };

    const injectStyles = () => window.TmMatchStyles.inject();

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
                console.log('[RND] Unity gameInstance detected, assuming ready');
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
                    console.log('[RND] Auto-playing live match after Unity detected');
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
    // Only the FIRST event is synced to the animation (distributed by groups over clip duration)
    // Remaining events are queued as postQueue, shown after animation finishes
    const buildClipTextQueue = (mData, minute) => {
        const report = mData.report || {};
        const evts = report[String(minute)] || [];
        const queue = [];
        const groups = []; // each entry = { start, count } into queue
        const postQueue = []; // remaining events' text lines
        evts.forEach((evt, evtIdx) => {
            if (!evt.chance || !evt.chance.text) return;
            let flatIdx = 0;
            if (evtIdx === 0) {
                // First event: animation-synced text
                evt.chance.text.forEach(textArr => {
                    const groupStart = queue.length;
                    let groupCount = 0;
                    textArr.forEach(line => {
                        if (!line || !line.trim()) return;
                        queue.push({ evtIdx, lineIdx: flatIdx });
                        flatIdx++;
                        groupCount++;
                    });
                    if (groupCount > 0) groups.push({ start: groupStart, count: groupCount });
                });
            } else {
                // Remaining events: post-animation text
                evt.chance.text.forEach(textArr => {
                    textArr.forEach(line => {
                        if (!line || !line.trim()) return;
                        postQueue.push({ evtIdx, lineIdx: flatIdx });
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

        liveState.curEvtIdx = entry.evtIdx;
        liveState.curLineIdx = entry.lineIdx;

        // Check if this event is complete
        const report = liveState.mData.report || {};
        const evts = report[String(liveState.min)] || [];
        const evt = evts[entry.evtIdx];
        const total = evt ? countEventLines(evt) : 1;
        const isComplete = entry.lineIdx >= total - 1;
        liveState.curEvtComplete = isComplete;
        liveState.justCompleted = isComplete;

        updateLiveHeader();
        refreshActiveTab();
        // Also update the unity side panels
        updateUnityFeed();
        // Only update stats when event is fully complete
        if (isComplete) updateUnityStats();
    };

    // ── Update the left-side feed panel next to viewport (current minute only) ──
    const updateUnityFeed = () => {
        const container = $('#rnd-unity-feed');
        if (!container.length || !liveState) return;
        const mData = liveState.mData;
        const report = mData.report || {};
        const playerNames = buildPlayerNames(mData);
        const curMin = liveState.min;
        const curEvtIdx = liveState.curEvtIdx;
        const curLineIdx = liveState.curLineIdx;
        const allLines = [];
        // Only show events for the CURRENT minute
        const evts = report[String(curMin)] || [];
        for (let ei = 0; ei < evts.length; ei++) {
            if (!isEventVisible(curMin, ei, curMin, curEvtIdx)) continue;
            const evt = evts[ei];
            if (!evt || !evt.chance || !evt.chance.text) continue;
            let flatIdx = 0;
            evt.chance.text.forEach(textArr => {
                textArr.forEach(line => {
                    if (!line || !line.trim()) return;
                    if (ei === curEvtIdx && flatIdx > curLineIdx) { flatIdx++; return; }
                    allLines.push({ min: curMin, text: line });
                    flatIdx++;
                });
            });
        }
        let html = '';
        allLines.forEach(item => {
            let resolved = resolvePlayerTags(item.text, playerNames);
            resolved = resolved.replace(/\[(goal|yellow|red|sub|assist)\]/g, '');
            html += `<div class="rnd-unity-feed-line"><span class="rnd-unity-feed-min">${item.min}'</span><span class="rnd-unity-feed-text">${resolved}</span></div>`;
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
        const homeId = String(mData.club.home.id);
        const homeIds = new Set(Object.keys(mData.lineup.home));
        const report = mData.report || {};
        const curMin = liveState.min;
        const curEvtIdx = liveState.curEvtIdx;
        let hShots = 0, aShots = 0, hSoT = 0, aSoT = 0, hGoals = 0, aGoals = 0;
        let hYellow = 0, aYellow = 0, hRed = 0, aRed = 0, hSetPieces = 0, aSetPieces = 0;
        const sortedMins = Object.keys(report).map(Number).sort((a, b) => a - b);
        for (const min of sortedMins) {
            const evts = report[String(min)] || [];
            for (let ei = 0; ei < evts.length; ei++) {
                if (!isEventVisible(min, ei, curMin, curEvtIdx)) continue;
                const evt = evts[ei];
                if (!evt || !evt.parameters) continue;
                evt.parameters.forEach(p => {
                    if (p.shot) {
                        const isHome = String(p.shot.team) === homeId;
                        if (isHome) { hShots++; if (p.shot.target === 'on') hSoT++; }
                        else { aShots++; if (p.shot.target === 'on') aSoT++; }
                    }
                    if (p.goal) {
                        const scorerId = String(p.goal.player);
                        const isHome = homeIds.has(scorerId);
                        if (isHome) hGoals++; else aGoals++;
                    }
                    if (p.yellow) {
                        if (homeIds.has(String(p.yellow))) hYellow++; else aYellow++;
                    }
                    if (p.yellow_red) {
                        if (homeIds.has(String(p.yellow_red))) hRed++; else aRed++;
                    }
                    if (p.red) {
                        if (homeIds.has(String(p.red))) hRed++; else aRed++;
                    }
                    if (p.set_piece) {
                        if (homeIds.has(String(p.set_piece))) hSetPieces++; else aSetPieces++;
                    }
                });
            }
        }
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
        h += miniBar('Shots', hShots, aShots);
        h += miniBar('On Target', hSoT, aSoT);
        h += miniBar('Goals', hGoals, aGoals);
        h += miniBar('Yellow', hYellow, aYellow);
        h += miniBar('Red', hRed, aRed);
        h += miniBar('Set Pieces', hSetPieces, aSetPieces);
        container.html(h);
    };

    // Flush all remaining text lines at once (for finished_playing)
    const flushClipText = () => {
        if (!liveState) return;
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
        console.log('[RND] Advanced text group ' + gi + ' (' + group.count + ' lines)');
    };

    const setupStargateOverride = () => {
        const uw = getUW();
        uw._orig_stargate = uw.stargate;
        uw.stargate = function (vars) {
            console.log('[RND] stargate:', JSON.stringify(vars));

            if (vars.flash_ready) {
                unityState.ready = true;
                console.log('[RND] Unity ready');
            }

            if (vars.finished_loading) {
                const min = vars.finished_loading.id;
                unityState.loadedMinutes.push(min);
                console.log('[RND] Clips loaded for minute', min);
                if (unityState.pendingMinute === min) {
                    unityState.pendingMinute = null;
                    playUnityClips(min);
                }
            }

            // A single clip finished → show the next text group
            // Skip the first finished_clip because its text was already shown on starting_clip
            if (vars.finished_clip) {
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
        const report = mData.report || {};
        const evts = report[String(minute)] || [];
        const videoList = [];
        evts.forEach(evt => {
            if (evt.chance && evt.chance.video) {
                const v = evt.chance.video;
                if (Array.isArray(v)) {
                    videoList.push(...v);
                } else {
                    videoList.push(v);
                }
            }
        });
        if (videoList.length === 0) return false;
        console.log('[RND] Loading clips for minute', minute, videoList.length, 'clips');
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
        uw.gameInstance.SendMessage('ClipsViewerScript', 'PrepareMinute', JSON.stringify({
            queue: videoList,
            id: minute
        }));
        return true;
    };

    const playUnityClips = (minute) => {
        const uw = getUW();
        if (!unityState.available || !uw.gameInstance) return;
        unityState.playing = true;
        console.log('[RND] Playing clips for minute', minute);
        uw.gameInstance.SendMessage('ClipsViewerScript', 'PlayMinute', JSON.stringify({ id: minute }));
    };

    const LINE_INTERVAL = 3;  // seconds between lines within a minute
    const POST_DELAY = 3;     // seconds after last line before advancing to next minute

    // ── Count total non-empty lines in an event's chance.text ──
    const countEventLines = (evt) => {
        if (!evt.chance || !evt.chance.text) return 1;
        let n = 0;
        evt.chance.text.forEach(textArr => {
            textArr.forEach(line => { if (line && line.trim()) n++; });
        });
        return Math.max(1, n);
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

    // ── Check if match is in the future (not yet started) ──
    const isMatchFuture = (mData) => {
        const md = mData.match_data;
        // Negative live_min means countdown to kickoff → match is in the future
        const lm = md?.live_min;
        if (typeof lm === 'number' && lm < 0) return true;
        // Positive live_min means match is in progress
        if (typeof lm === 'number' && lm > 0) return false;
        // Fallback: check kickoff timestamp
        const ko = md?.venue?.kickoff;
        if (ko) {
            const now = Math.floor(Date.now() / 1000);
            return Number(ko) > now;
        }
        return false;
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
    const buildSchedule = (report, keyOnly = false) => {
        const schedule = {};     // min → [{evtIdx, lineIdx, sec}]
        const eventMinList = []; // sorted list of minutes that have events
        const mins = Object.keys(report).map(Number).sort((a, b) => a - b);
        mins.forEach(min => {
            const evts = report[min] || [];
            const entries = [];
            let secCursor = 0;
            evts.forEach((evt, evtIdx) => {
                if (keyOnly && evt.severity !== 1) return;
                const lineCount = countEventLines(evt);
                for (let li = 0; li < lineCount; li++) {
                    entries.push({ evtIdx, lineIdx: li, sec: secCursor });
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
    const isEventVisible = (evtMin, evtIdx, curMin, curEvtIdx) => {
        if (evtMin < curMin) return true;
        if (evtMin === curMin && evtIdx <= curEvtIdx) return true;
        return false;
    };

    // ── Compute score up to current step ──
    const scoreAtStep = (mData, curMin, curEvtIdx) => {
        const score = [0, 0];
        const homeId = String(mData.club.home.id);
        const report = mData.report || {};
        Object.keys(report).forEach(minKey => {
            const min = Number(minKey);
            (report[minKey] || []).forEach((evt, si) => {
                if (!isEventVisible(min, si, curMin, curEvtIdx)) return;
                if (!evt.parameters) return;
                evt.parameters.forEach(p => {
                    if (p.goal) {
                        if (String(evt.club) === homeId) score[0]++; else score[1]++;
                    }
                });
            });
        });
        return score;
    };

    // ── Compute active roster at current step (subs + red cards) ──
    // Returns { home: Set<playerId>, away: Set<playerId>, subbedPositions: Map<playerId, position> }
    const computeActiveRoster = (mData, curMin, curEvtIdx) => {
        const homeIds = new Set(Object.keys(mData.lineup.home));
        const homeActive = new Set();
        const awayActive = new Set();
        // Start with starters
        Object.values(mData.lineup.home).forEach(p => {
            if (!p.position.includes('sub')) homeActive.add(String(p.player_id));
        });
        Object.values(mData.lineup.away).forEach(p => {
            if (!p.position.includes('sub')) awayActive.add(String(p.player_id));
        });

        // Track position of subbed-in players (inherit from subbed-out player)
        const subbedPositions = new Map(); // player_id → position

        const report = mData.report || {};
        Object.keys(report).forEach(minKey => {
            const min = Number(minKey);
            (report[minKey] || []).forEach((evt, si) => {
                if (!isEventVisible(min, si, curMin, curEvtIdx)) return;
                if (!evt.parameters) return;
                evt.parameters.forEach(param => {
                    if (param.sub) {
                        const inId = String(param.sub.player_in);
                        const outId = String(param.sub.player_out);
                        const isHome = homeActive.has(outId) || homeIds.has(outId);
                        // Find position of outgoing player
                        const outPlayer = mData.lineup[isHome ? 'home' : 'away'][outId];
                        const outPos = subbedPositions.get(outId) || (outPlayer ? outPlayer.position : null);
                        if (outPos) subbedPositions.set(inId, outPos);
                        if (isHome) { homeActive.delete(outId); homeActive.add(inId); }
                        else { awayActive.delete(outId); awayActive.add(inId); }
                    }
                    if (param.red || param.yellow_red) {
                        const pid = String(param.red || param.yellow_red);
                        homeActive.delete(pid);
                        awayActive.delete(pid);
                    }
                });
            });
        });
        return { homeActive, awayActive, subbedPositions };
    };

    // ── Update live header (score + minute + progress) ──
    const updateLiveHeader = () => {
        if (!liveState) return;
        // Defer score update: don't count current event's goal until all its text lines are shown
        const scoreEvtIdx = (!liveState.ended && !liveState.curEvtComplete) ? liveState.curEvtIdx - 1 : liveState.curEvtIdx;
        const s = scoreAtStep(liveState.mData, liveState.min, scoreEvtIdx);
        $('#rnd-overlay .rnd-dlg-score').text(`${s[0]} - ${s[1]}`);
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
        // Live-update mentality chips from report mentality_change events
        if (liveState.mData) {
            const mentalityMapH = { 1: 'V.Def', 2: 'Def', 3: 'Sl.Def', 4: 'Normal', 5: 'Sl.Att', 6: 'Att', 7: 'V.Att' };
            const homeClubId = String(liveState.mData.club.home.id);
            const awayClubId = String(liveState.mData.club.away.id);
            const mdH = liveState.mData.match_data;
            const curMent = {
                home: Number(mdH.mentality ? mdH.mentality.home : 4),
                away: Number(mdH.mentality ? mdH.mentality.away : 4)
            };
            const rpt = liveState.mData.report || {};
            Object.keys(rpt).forEach(mk => {
                const eMin = Number(mk);
                (rpt[mk] || []).forEach((evt, si) => {
                    if (!isEventVisible(eMin, si, liveState.min, scoreEvtIdx)) return;
                    if (!evt.parameters) return;
                    evt.parameters.forEach(p => {
                        if (p.mentality_change) {
                            const tid = String(p.mentality_change.team);
                            if (tid === homeClubId) curMent.home = Number(p.mentality_change.mentality);
                            else if (tid === awayClubId) curMent.away = Number(p.mentality_change.mentality);
                        }
                    });
                });
            });
            const hChip = $('#rnd-chip-ment-home');
            if (hChip.length) hChip.find('.chip-val').text(mentalityMapH[curMent.home] || curMent.home);
            const aChip = $('#rnd-chip-ment-away');
            if (aChip.length) aChip.find('.chip-val').text(mentalityMapH[curMent.away] || curMent.away);
        }
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
        // Lineups tab: re-render only when an event completes (goals, subs, etc. deferred)
        if (tab === 'lineups') {
            if (liveState.justCompleted) renderDialogTab(tab, liveState.mData);
            return;
        }
        // Other tabs: don't re-render during live
    };

    // ── Build HTML for a single report event accordion ──
    // maxLineIdx: how many individual lines to show (-1 = all)
    // hideBadges: when true, hide goal/red/sub badges (show text preview instead)
    const buildReportEventHtml = (evt, min, evtIdx, playerNames, homeId, maxLineIdx = -1, hideBadges = false) => {
        const chance = evt.chance;
        if (!chance || !chance.text) return '';

        const evtClub = String(evt.club || 0);
        const isHome = evtClub === homeId;
        const isNeutral = !evt.club || evtClub === '0';

        let headerBadges = '';
        let hasEvents = false;
        if (evt.parameters && !hideBadges) {
            evt.parameters.forEach(param => {
                if (param.goal) {
                    hasEvents = true;
                    const scorer = playerNames[param.goal.player] || '?';
                    const score = param.goal.score ? param.goal.score.join('-') : '';
                    let b = `⚽ ${scorer}`;
                    if (score) b += ` (${score})`;
                    if (param.goal.assist) b += ` <span style="font-size:11px;color:#90b878">ast. ${playerNames[param.goal.assist] || '?'}</span>`;
                    headerBadges += `<div class="rnd-report-evt-badge evt-goal">${b}</div>`;
                }
                if (param.yellow) { hasEvents = true; headerBadges += `<div class="rnd-report-evt-badge evt-yellow">🟨 ${playerNames[param.yellow] || '?'}</div>`; }
                if (param.yellow_red) { hasEvents = true; headerBadges += `<div class="rnd-report-evt-badge evt-red">🟥🟨 ${playerNames[param.yellow_red] || '?'}</div>`; }
                if (param.red) { hasEvents = true; headerBadges += `<div class="rnd-report-evt-badge evt-red">🟥 ${playerNames[param.red] || '?'}</div>`; }
                if (param.injury) {
                    hasEvents = true;
                    headerBadges += `<div class="rnd-report-evt-badge evt-injury"><span style="color:#ff3c3c;font-weight:800">✚</span> ${playerNames[param.injury] || '?'}</div>`;
                }
                if (param.sub) {
                    hasEvents = true;
                    const pIn = playerNames[param.sub.player_in] || '?';
                    const pOut = playerNames[param.sub.player_out] || '?';
                    headerBadges += `<div class="rnd-report-evt-badge evt-sub">🔄 ↑${pIn} ↓${pOut}</div>`;
                }
            });
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

        const report = mData.report || {};
        const evts = report[String(curMin)] || [];
        const evt = evts[curEvtIdx];
        if (!evt || !evt.chance || !evt.chance.text) return;

        const playerNames = buildPlayerNames(mData);
        const homeId = String(mData.club.home.id);
        const key = `${curMin}-${curEvtIdx}`;
        const existing = container.find(`[data-acc="${key}"]`);

        // During live, hide badges until all lines of this event are shown
        const totalLines = countEventLines(evt);
        const isComplete = curLineIdx >= totalLines - 1;
        const hideBadges = liveState && !liveState.ended && !isComplete;

        if (existing.length) {
            // Event accordion already exists — update with one more line
            const oldCount = Number(existing.attr('data-line-count') || 0);
            if (curLineIdx < oldCount) return;  // already shown this line
            // Re-build the accordion with updated line count
            const newHtml = buildReportEventHtml(evt, curMin, curEvtIdx, playerNames, homeId, curLineIdx, hideBadges);
            if (!newHtml) return;
            const wasOpen = existing.hasClass('open');
            const $new = $(newHtml);
            if (wasOpen) $new.addClass('open');
            existing.replaceWith($new);
        } else {
            // New event — collapse all other accordions, then append with auto-open
            container.find('.rnd-acc.open').removeClass('open');
            const evtHtml = buildReportEventHtml(evt, curMin, curEvtIdx, playerNames, homeId, curLineIdx, hideBadges);
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
        const report = liveState.mData.report || {};
        const evts = report[String(liveState.min)] || [];
        curEntries.forEach(entry => {
            if (entry.sec === liveState.sec) {
                liveState.curEvtIdx = entry.evtIdx;
                liveState.curLineIdx = entry.lineIdx;
                hasNew = true;
                // Check if event just became complete (all text lines shown)
                const evt = evts[entry.evtIdx];
                const total = evt ? countEventLines(evt) : 1;
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
        if (!liveState || liveState.ended) return;
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
            const matchIsFuture = isMatchFuture(mData);

            // Determine if match is currently live
            const matchIsLive = !matchIsFuture && isMatchCurrentlyLive(mData);

            // Build schedules & live state only for non-future matches
            if (!matchIsFuture) {
                const rpt = mData.report || {};
                const allSch = buildSchedule(rpt, false);
                const keySch = buildSchedule(rpt, true);
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
            } else {
                // Future match: no live state needed
                if (liveState && liveState.timer) clearTimeout(liveState.timer);
                liveState = null;
            }

            // Build dialog overlay
            const overlay = window.TmMatchDialog.build(mData, matchIsFuture, matchIsLive);

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
            window.TmApi.fetchMatch(matchId).then(mData => { if (mData) show(mData); });
        }
    };

    const renderDialogTab = (tab, mData) => {
        // Save Unity canvas before destroying lineups tab DOM
        // Skip for lineups — it handles in-place updates without destroying viewport
        if (tab !== 'lineups') saveUnityCanvas();
        const body = $('#rnd-dlg-body');
        const curMin = liveState ? liveState.min : 999;
        const curEvtIdx = liveState ? liveState.curEvtIdx : 999;
        // For tabs showing parameters (goals/subs/reds), defer until event text is complete
        const paramEvtIdx = (liveState && !liveState.ended && !liveState.curEvtComplete) ? curEvtIdx - 1 : curEvtIdx;
        const matchEnded = !liveState || liveState.ended;
        const sharedOpts = {
            getLiveState: () => liveState,
            getUnityState: () => unityState,
            isMatchPage: true,
            moveUnityCanvas, saveUnityCanvas, updateUnityStats,
            computeActiveRoster, isMatchFuture, isEventVisible,
            getPlayerData,
            fetchTooltip, parseNum, getColor,
            REC_THRESHOLDS,
            buildPlayerNames, buildReportEventHtml, resolvePlayerTags,
        };
        const statsOpts = { liveState, isEventVisible, buildPlayerNames, buildReportEventHtml, matchEnded };
        switch (tab) {
            case 'details': renderDetailsTab(body, mData, curMin, paramEvtIdx); break;
            case 'statistics': TmMatchStatistics.render(body, mData, curMin, paramEvtIdx, statsOpts); break;
            case 'report': renderReportTab(body, mData, curMin, curEvtIdx); break;
            case 'lineups': TmMatchLineups.render(body, mData, curMin, paramEvtIdx, sharedOpts); break;
            case 'venue': TmMatchVenue.render(body, mData); break;
            case 'h2h': TmMatchH2H.render(body, mData); break;
            case 'league': TmMatchLeague.render(body, mData, curMin, paramEvtIdx); break;
            case 'analysis': TmMatchAnalysis.render(body, mData, { getPlayerData }); break;
        }
    };

    // ── Helper: build player name lookup ──
    const buildPlayerNames = (mData) => {
        const names = {};
        ['home', 'away'].forEach(side => {
            Object.values(mData.lineup[side]).forEach(p => {
                names[p.player_id] = p.nameLast || p.name;
            });
        });
        return names;
    };

    // ── Helper: resolve [player=ID] tags in text ──
    const resolvePlayerTags = (text, playerNames) => {
        return text.replace(/\[player=(\d+)\]/g, (_, id) => {
            const name = playerNames[id] || id;
            return `<span class="rnd-player-name">${name}</span>`;
        });
    };

    const renderDetailsTab = (body, mData, curMin = 999, curEvtIdx = 999) => {
        const playerNames = buildPlayerNames(mData);
        const homeIds = new Set(Object.keys(mData.lineup.home));
        const homeId = String(mData.club.home.id);

        let html = '<div style="max-width:900px;margin:0 auto">';

        // ── Parse key events from report (filtered by current step) ──
        const events = [];
        const report = mData.report || {};
        Object.keys(report).sort((a, b) => Number(a) - Number(b)).forEach(minKey => {
            const min = Number(minKey);
            report[minKey].forEach((evt, si) => {
                if (!isEventVisible(min, si, curMin, curEvtIdx)) return;
                if (!evt.parameters) return;
                evt.parameters.forEach(param => {
                    if (param.goal) {
                        events.push({
                            min, type: 'goal',
                            isHome: String(evt.club) === homeId,
                            player: playerNames[param.goal.player] || '?',
                            assist: param.goal.assist ? (playerNames[param.goal.assist] || null) : null
                        });
                    }
                    if (param.yellow) {
                        events.push({
                            min, type: 'yellow',
                            isHome: homeIds.has(String(param.yellow)),
                            player: playerNames[param.yellow] || '?'
                        });
                    }
                    if (param.yellow_red) {
                        events.push({
                            min, type: 'yellowred',
                            isHome: homeIds.has(String(param.yellow_red)),
                            player: playerNames[param.yellow_red] || '?'
                        });
                    }
                    if (param.sub) {
                        const isHome = homeIds.has(String(param.sub.player_in)) || homeIds.has(String(param.sub.player_out));
                        events.push({
                            min, type: 'sub', isHome,
                            playerIn: playerNames[param.sub.player_in] || '?',
                            playerOut: playerNames[param.sub.player_out] || '?'
                        });
                    }
                    if (param.injury) {
                        const pid = String(param.injury);
                        events.push({
                            min, type: 'injury',
                            isHome: homeIds.has(pid),
                            player: playerNames[pid] || '?'
                        });
                    }
                });
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

    const renderReportTab = (body, mData, curMin = 999, curEvtIdx = 999) => {
        const playerNames = buildPlayerNames(mData);
        const homeId = String(mData.club.home.id);
        const report = mData.report || {};
        const allMinutes = Object.keys(report).sort((a, b) => Number(a) - Number(b));

        let html = '<div style="max-width:900px;margin:0 auto"><div id="rnd-report-timeline" class="rnd-timeline">';

        allMinutes.forEach(minKey => {
            const min = Number(minKey);
            report[minKey].forEach((evt, evtIdx) => {
                if (!isEventVisible(min, evtIdx, curMin, curEvtIdx)) return;
                html += buildReportEventHtml(evt, min, evtIdx, playerNames, homeId);
            });
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
