import { TmMatchAnalysis } from '../components/match/tm-match-analysis.js';
import { TmMatchDetails } from '../components/match/tm-match-details.js';
import { TmMatchReport } from '../components/match/tm-match-report.js';
import { TmMatchHeader } from '../components/match/tm-match-header.js';
import { TmMatchUtils } from '../utils/match.js';
import { TmMatchH2H } from '../components/match/tm-match-h2h.js';
import { TmMatchLeague } from '../components/match/tm-match-league.js';
import { TmMatchLineups } from '../components/match/tm-match-lineups.js';

import { TmMatchStatistics } from '../components/match/tm-match-statistics.js';
import { TmMatchStyles } from '../components/match/tm-match-styles.js';
import { TmMatchVenue } from '../components/match/tm-match-venue.js';
import { TmTabs } from '../components/shared/tm-tabs.js';
import { TmMatchService } from '../services/match.js';
import { TmMatchUnityPlayer } from '../components/match/tm-match-unity-player.js';

export function initMatchPage(main) {
    if (!main || !main.isConnected) return;

    const injectStyles = () => TmMatchStyles.inject();
    const getOverlayTabsWrap = () => document.querySelector('#rnd-overlay .tmu-tabs');
    const getActiveOverlayTab = () => getOverlayTabsWrap()?.querySelector('.tmu-tab.active')?.dataset?.tab || '';
    const setActiveOverlayTab = (tabKey) => {
        const wrap = getOverlayTabsWrap();
        if (wrap) TmTabs.setActive(wrap, tabKey);
    };

    // ─── Match cache & rating cells ─────────────────────────────────────
    const LINE_INTERVAL = 3;  // seconds between lines within a minute
    const POST_DELAY = 3;     // seconds after last line before advancing to next minute
    const roundMatchCache = new Map(); // matchId -> {homeR5, awayR5, data}

    // ─── Match dialog ────────────────────────────────────────────────────
    // ── Live replay state (shared across tabs) ──
    let liveState = null;
    let currentMData = null;
    let prematchTimer = null;
    // liveState = { min, sec, curEvtIdx, curLineIdx, playing, timer, mData, speed:1000,
    //               maxMin, ended, schedule, eventMinList, eventMinIdx }

    // ── Unity 3D player ──
    const unity = TmMatchUnityPlayer.create({
        getLiveState: () => liveState,
        onTextAdvanced: (evtIdx, lineIdx, isComplete) => {
            liveState.curEvtIdx = evtIdx;
            liveState.curLineIdx = lineIdx;
            liveState.curEvtComplete = isComplete;
            liveState.justCompleted = isComplete;
        },
        onAllClipsFinished: (min) => {
            if (liveState) {
                liveState.sec = 59;
                if (liveState.pendingFilterSwitch) {
                    applyFilterSwitch(liveState.pendingFilterSwitch);
                }
            }
        },
        onUnityReady: () => {
            if (liveState && !liveState.playing && !liveState.ended) livePlay();
        },
        syncLiveDerivedTeams: () => syncLiveDerivedTeams(),
        applyFilterSwitch: (mode) => applyFilterSwitch(mode),
    });

    const stopLiveClockTicker = () => {
        if (!liveState?.clockTimer) return;
        clearTimeout(liveState.clockTimer);
        liveState.clockTimer = null;
    };

    const scheduleLiveClockTicker = () => {
        if (!liveState || !liveState.playing || liveState.ended || liveState.filterMode !== 'live') return;

        stopLiveClockTicker();
        liveState.clockTimer = setTimeout(() => {
            if (!liveState || !liveState.playing || liveState.ended || liveState.filterMode !== 'live') {
                stopLiveClockTicker();
                return;
            }

            const kickoff = liveState.liveKickoff;
            const info = kickoff ? calculateLiveMinute(kickoff) : null;
            const lastMin = liveState.mData.match_data.last_min || 90;

            if (!info || info.minute > lastMin) {
                liveState.min = lastMin;
                liveState.sec = 59;
                liveState.curEvtIdx = 999;
                liveState.curLineIdx = 999;
                liveState.ended = true;
                liveState.playing = false;
                liveState.liveIsHT = false;
                syncLiveDerivedTeams();
                stopLiveClockTicker();
                return;
            }

            const prevMin = liveState.min;
            const prevSec = liveState.sec;
            liveState.min = info.minute;
            liveState.sec = info.second;
            liveState.liveIsHT = info.isHT;

            if (liveState.min !== prevMin) {
                liveState.justCompleted = true;
                if (!liveState.liveIsHT && unity.getState().activeMinute !== liveState.min) {
                    syncLiveDerivedTeams();
                } else {
                    updateLiveHeader();
                }
            } else if (liveState.sec !== prevSec) {
                updateLiveHeader();
            }

            scheduleLiveClockTicker();
        }, 250);
    };

    const getLiveDerivedKey = (state) => {
        if (!state) return '';
        return [
            state.min,
            state.curEvtIdx,
            state.curLineIdx,
            state.ended ? 1 : 0,
            state.liveIsHT ? 1 : 0,
        ].join(':');
    };

    const deriveLiveMatchData = (force = false) => {
        if (!liveState?.baseMData) return liveState?.mData || null;
        const derivedKey = getLiveDerivedKey(liveState);
        if (!force && liveState.mData && liveState.derivedKey === derivedKey) {
            return liveState.mData;
        }
        const nextMatchData = TmMatchUtils.cloneMatchData(liveState.baseMData);
        liveState.mData = TmMatchUtils.deriveMatchData({ ...liveState, mData: nextMatchData });
        liveState.derivedKey = derivedKey;
        return liveState.mData;
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

    // ── Play line helpers ─────────────────────────────────────────────
    const countPlayLines = (play) => {
        if (!play) return 1;
        return Math.max(1, play.segments.reduce((s, seg) => s + seg.text.filter(l => l.trim()).length, 0));
    };

    const findPlay = (mData, min, reportEventIndex) => {
        const plays = mData.plays?.[String(min)] || [];
        return plays.find(p => p.reportEventIndex === reportEventIndex) || null;
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
                    entries.push({ evtIdx: play.reportEventIndex, lineIdx: li, sec: secCursor });
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

    const syncLiveDerivedTeams = () => {
        if (!liveState?.baseMData) return;
        deriveLiveMatchData();
        unity.updateMatchStats();
        updateLiveHeader();
        refreshActiveTab();
        console.log('[RND] Live derived data synced', liveState);
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

    const refreshLeagueTabIfActive = (force = false) => {
        if (!liveState) return;
        const tab = getActiveOverlayTab();
        if (tab !== 'league') return;
        if (!force && !liveState.justCompleted) return;
        renderDialogTab('league', liveState.mData);
    };

    // ── Refresh whichever tab is active ──
    const refreshActiveTab = () => {
        if (!liveState) return;
        const tab = getActiveOverlayTab();
        if (!tab) return;

        // When match ended/skipped, always do full render
        if (liveState.ended) {
            renderDialogTab(tab, liveState.mData);
            return;
        }
        // Report tab: incremental update driven by visiblePlays
        if (tab === 'report') {
            renderDialogTab('report', liveState.mData);
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
        // League tab: render when match state syncs or minute/event boundaries move
        if (tab === 'league') {
            renderDialogTab(tab, liveState.mData);
            return;
        }
        // Other tabs: don't re-render during live
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
                syncLiveDerivedTeams();
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
            if (unity.getState().activeMinute === liveState.min) {
                updateLiveHeader();
                liveState.timer = setTimeout(liveStep, liveState.speed);
                return;
            }
            // Show all events up to current minute
            liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
            liveState.curEvtComplete = true;
            const minuteChanged = liveState.min !== prevMin;
            liveState.justCompleted = minuteChanged;
            if (minuteChanged) refreshLeagueTabIfActive(true);
            // Load Unity clips when entering a new event minute
            if (minuteChanged && unity.getState().available && unity.getState().ready) {
                const hasClips = unity.loadUnityClips(liveState.min, liveState.mData);
                if (hasClips) {
                    updateLiveHeader();
                    liveState.timer = setTimeout(liveStep, liveState.speed);
                    return;
                }
            }

            if (minuteChanged) {
                syncLiveDerivedTeams();
            } else {
                updateLiveHeader();
            }

            liveState.timer = setTimeout(liveStep, liveState.speed);
            return;
        }

        liveState.sec++;

        // ── If Unity clips are active for this minute, just tick the clock ──
        if (unity.getState().activeMinute === liveState.min) {
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
                liveState.curEvtComplete = true;
                liveState.justCompleted = true;
                syncLiveDerivedTeams();
                return;
            }
            liveState.eventMinIdx = nextIdx;
            liveState.min = liveState.eventMinList[nextIdx];
            liveState.sec = 0;
            // Reset event tracking to prevent score from briefly showing future goals
            liveState.curEvtIdx = -1;
            liveState.curEvtComplete = false;
            refreshLeagueTabIfActive(true);

            // ── Unity 3D: trigger clip loading when entering a new minute with videos ──
            if (unity.getState().available && unity.getState().ready) {
                const hasClips = unity.loadUnityClips(liveState.min, liveState.mData);
                if (hasClips) {
                    // Timer keeps running — clock ticks, text driven by clip callbacks
                    updateLiveHeader();
                    liveState.timer = setTimeout(liveStep, liveState.speed);
                    return;
                }
            }
        }

        // Check schedule for new lines at current second (non-clip minutes only)
        liveState.justCompleted = false;
        const curEntries = liveState.schedule[liveState.min] || [];
        curEntries.forEach(entry => {
            if (entry.sec === liveState.sec) {
                liveState.curEvtIdx = entry.evtIdx;
                liveState.curLineIdx = entry.lineIdx;
                const play = findPlay(liveState.mData, liveState.min, entry.evtIdx);
                const total = play ? countPlayLines(play) : 1;
                const isComplete = entry.lineIdx >= total - 1;
                liveState.curEvtComplete = isComplete;
                if (isComplete) liveState.justCompleted = true;
            }
        });

        liveState.timer = setTimeout(liveStep, liveState.speed);
    };

    const livePlay = () => {
        if (!liveState || liveState.ended || liveState.playing) return;
        liveState.playing = true;
        $('#rnd-live-play-head').html('⏸');
        // If Unity was paused mid-animation, unpause it
        if (unity.getState().activeMinute !== null) {
            const uw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
            if (uw.gameInstance) uw.gameInstance.SendMessage('ClipsViewerScript', 'OnPauseGame');
        }
        scheduleLiveClockTicker();
        liveStep();
    };

    const livePause = () => {
        if (!liveState) return;
        liveState.playing = false;
        clearTimeout(liveState.timer);
        stopLiveClockTicker();
        $('#rnd-live-play-head').html('▶');
        // Immediately pause Unity animation if playing
        if (unity.getState().playing && unity.getState().activeMinute !== null) {
            const uw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
            if (uw.gameInstance) uw.gameInstance.SendMessage('ClipsViewerScript', 'OnPauseGame');
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
            syncLiveDerivedTeams();
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
        if (unity.getState().available && unity.getState().ready) {
            unity.loadUnityClips(liveState.min, liveState.mData);
        }
        syncLiveDerivedTeams();
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
        syncLiveDerivedTeams();
    };

    const openMatchDialog = (matchId) => {
        const cached = roundMatchCache.get(String(matchId));
        // If not cached yet, fetch on-demand
        const show = (mData) => {
            currentMData = mData;
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
                        scheduleAll: allSch, scheduleKey: keySch,
                        baseMData: TmMatchUtils.cloneMatchData(mData), derivedKey: null
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
                        scheduleAll: allSch, scheduleKey: keySch,
                        baseMData: TmMatchUtils.cloneMatchData(mData), derivedKey: null
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
            const overlay = TmMatchHeader.build(mData, matchIsFuture, matchIsLive);

            $('body').append(overlay).css('overflow', 'hidden');

            const closeDialog = () => {
                if (liveState && liveState.timer) clearTimeout(liveState.timer);
                stopLiveClockTicker();
                liveState = null;
                currentMData = null;
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
                    if (unity.getState().activeMinute !== null || unity.getState().playing) {
                        liveState.pendingFilterSwitch = mode;
                        console.log('[RND] Filter switch deferred until animation finishes');
                        return;
                    }
                    applyFilterSwitch(mode);
                });
            }

            // Tab switching
            overlay.on('click', '.tmu-tab', function () {
                const tabKey = this.dataset.tab;
                if (!tabKey || this.disabled) return;
                setActiveOverlayTab(tabKey);
                renderDialogTab(tabKey, mData);
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
            console.log('[RND] Match profiles ready', e);
            const baseMData = liveState?.baseMData ?? currentMData;
            if (!baseMData) return;
            const players = e.detail.players;
            ['home', 'away'].forEach(side => {
                const rawLineup = Object.values(baseMData.lineup?.[side] || {});
                const enrichedLineup = rawLineup.map(p => {
                    const player = players.find(pl => Number(pl.id) === Number(p.id || p.player_id));
                    return {
                        ...p,
                        name: player?.name ?? p.name,
                        lastname: player?.lastname ?? p.nameLast ?? p.lastname,
                        r5: player?.r5 ?? p.r5,
                        skills: player?.skills ?? p.skills,
                        asi: player?.asi ?? p.asi,
                        routine: player?.routine ?? p.routine,
                        positions: player?.positions ?? p.positions,
                    };
                });
                baseMData.lineup[side] = enrichedLineup.reduce((acc, player) => {
                    acc[String(player.id || player.player_id)] = player;
                    return acc;
                }, {});
                baseMData.teams[side].lineup = enrichedLineup;
                // Compute avgR5 from starters (for future matches where generateTeamData never runs)
                const starters = enrichedLineup.filter(p => !/^sub/.test(p.position || ''));
                const r5s = starters.map(p => Number(p.r5)).filter(Number.isFinite);
                if (r5s.length) baseMData.teams[side].avgR5 = r5s.reduce((a, b) => a + b, 0) / r5s.length;
            });
            baseMData.profilesReady = true;
            if (liveState) {
                liveState.derivedKey = null;
                syncLiveDerivedTeams();
            } else if (currentMData) {
                // Future match: re-render current tab with enriched data
                const activeTab = getActiveOverlayTab() || 'lineups';
                renderDialogTab(activeTab, currentMData);
            }
        });
    };

    const renderDialogTab = (tab, mData) => {
        const activeMatchData = liveState ? deriveLiveMatchData() : mData;
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
        if (tab !== 'lineups') unity.saveUnityCanvas();
        const body = $('#rnd-dlg-body');
        const sharedOpts = {
            getUnityState: () => unity.getState(),
            moveUnityCanvas: unity.moveUnityCanvas,
            saveUnityCanvas: unity.saveUnityCanvas,
            updateMatchStats: unity.updateMatchStats,
            updateMatchFeed: unity.updateMatchFeed,
            liveState: activeState
        };
        switch (tab) {
            case 'details': TmMatchDetails.render(body, activeState); break;
            case 'statistics': TmMatchStatistics.render(body, activeState); break;
            case 'report': TmMatchReport.render(body, activeState); break;
            case 'lineups': TmMatchLineups.render(body, activeState, sharedOpts); break;
            case 'venue': TmMatchVenue.render(body, activeMatchData); break;
            case 'h2h': TmMatchH2H.render(body, activeMatchData); break;
            case 'league': TmMatchLeague.render(body, activeState); break;
            case 'analysis': TmMatchAnalysis.render(body, activeMatchData, activeMatchData.teams); break;
        }
    };

    // ─── Loading indicator ───────────────────────────────────────────────
    const cleanupPage = () => {
        if (liveState && liveState.timer) clearTimeout(liveState.timer);
        stopLiveClockTicker();
        liveState = null;
        $('#rnd-overlay').remove();
        $('body').css('overflow', '');
        unity.resetState();
    };

    const initForCurrentPage = () => {
        cleanupPage();
        injectStyles();
        unity.init();
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
}
