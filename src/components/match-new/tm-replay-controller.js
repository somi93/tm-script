/**
 * tm-replay-controller.js — Match replay state machine
 *
 * Owns all timing logic: tick loop, minute advancement, play/pause/skip.
 * Has zero knowledge of DOM or components.
 * Communicates via callbacks:
 *
 *   onTick(replayState)             — every second (clock update, new feed lines revealed)
 *   onMinuteAdvanced(replayState)   — moved to a new event minute
 *   onEnded(replayState)            — replay reached the last minute
 *
 * The `replayState` snapshot passed to callbacks is a plain object:
 *   { currentMinute, seconds, currentActionIndex, currentActionLineIndex, playing, ended }
 *
 * Usage:
 *   const ctrl = TmReplayController.create({
 *       match, maximumMinute, schedule, unity,
 *       postDelay,            // optional, default 3 s
 *       onTick, onMinuteAdvanced, onEnded,
 *   });
 *   ctrl.play();
 *   ctrl.pause();
 *   ctrl.toggle();
 *   ctrl.skip();
 *   ctrl.destroy();          // clears any pending timer
 */

export const TmReplayController = {
    /**
     * @param {{
     *   match:           object,
     *   maximumMinute:   number,
     *   schedule:        object,
     *   unity:           object,       // TmUnityPlayer instance
     *   postDelay?:      number,
     *   onTick?:         (replayState) => void,
     *   onMinuteAdvanced?: (replayState) => void,
     *   onEnded?:        (replayState) => void,
     * }} opts
     */
    create(opts) {
        const {
            match, maximumMinute, schedule, unity,
            postDelay = 3,
            clipRevealDelay = 1,
            initialMode = 'all',
            onTick, onMinuteAdvanced, onEnded,
        } = opts;

        // Sorted list of minutes — all, and key (severity === 1) only.
        const allPlayMinutes = Object.keys(match.plays).map(Number).sort((a, b) => a - b);
        const keyPlayMinutes = allPlayMinutes.filter(min =>
            (match.plays[String(min)] || []).some(action => action.severity === 1)
        );

        const initialPlayMinutes = initialMode === 'key' ? keyPlayMinutes : allPlayMinutes;

        const replayState = {
            mode: initialMode,
            playMinutes: initialPlayMinutes,
            schedule,
            playMinuteIndex: 0,
            currentMinute: initialPlayMinutes[0] ?? 0,
            seconds: 0,
            currentActionIndex: -1,
            currentActionLineIndex: -1,
            committedActionIndex: -1,
            committedClipIndex: -1,
            playing: false,
            ended: initialPlayMinutes.length === 0,
            tickTimer: null,
            advanceTimer: null,
            clipRevealTimer: null,
            speed: 1000,
        };

        const snapshot = () => ({
            currentMinute: replayState.currentMinute,
            seconds: replayState.seconds,
            currentActionIndex: replayState.currentActionIndex,
            currentActionLineIndex: replayState.currentActionLineIndex,
            committedActionIndex: replayState.committedActionIndex,
            committedClipIndex: replayState.committedClipIndex,
            playing: replayState.playing,
            ended: replayState.ended,
            mode: replayState.mode,
            unityActive: unity.getActiveMinute() !== null,
        });

        // Per-minute Unity clip state.
        // Rebuilt each time a Unity minute loads.
        // clipMap[flatClipIndex] = { actionReportIndex, lastLineIndex, hasOutcome }
        // hasOutcome=true when the clip animates a goal, card, injury, or substitution.
        // committedActionIndex (used for score) only advances on those clips.
        let clipMap = [];

        const OUTCOME_ACTIONS = new Set(['yellow', 'yellowRed', 'red', 'injury', 'subIn']);

        // Build clipMap for all actions of a minute.
        // Unity sends clips as a flat sequence across all actions, so we iterate
        // every action and every clip in order, tracking per-action line counters.
        const buildClipMap = (minute) => {
            clipMap = [];
            for (const action of (match.plays[String(minute)] || [])) {
                const isGoalPlay = action.outcome === 'goal';
                // For goal plays: score updates on the goal_* clip (ball entering net).
                // If no goal_ clip exists, fall back to last clip.
                const goalClipIdx = isGoalPlay
                    ? (() => {
                        const idx = action.clips.findIndex(c => /^goal_/.test(c.video));
                        return idx !== -1 ? idx : action.clips.length - 1;
                    })()
                    : -1;
                let actionLineIndex = 0;
                action.clips.forEach((clip, clipIdx) => {
                    let clipHasLines = false;
                    for (const line of clip.text) {
                        if (!line.trim()) { actionLineIndex++; continue; }
                        actionLineIndex++;
                        clipHasLines = true;
                    }
                    // Goals: committedActionIndex advances on the goal_ clip (ball in net).
                    // Other outcomes: on the clip that carries the action.
                    const hasOutcome = isGoalPlay
                        ? clipIdx === goalClipIdx
                        : clip.actions.some(a => OUTCOME_ACTIONS.has(a.action));
                    const entry = {
                        actionReportIndex: action.reportEventIndex,
                        lastLineIndex: clipHasLines ? actionLineIndex - 1 : -1,
                        hasOutcome,
                    };
                    clipMap.push(clipHasLines || hasOutcome ? entry : null);
                });
            }
        };

        // ── Tick loop ─────────────────────────────────────────────────

        const tick = () => {
            if (!replayState.playing || replayState.ended) return;

            // Unity owns this minute — just advance the clock, wait for onMinuteDone
            if (unity.getActiveMinute() !== null) {
                replayState.seconds = Math.min(replayState.seconds + 1, 59);
                onTick?.(snapshot());
                replayState.tickTimer = setTimeout(tick, replayState.speed);
                return;
            }

            replayState.seconds++;

            const entries = replayState.schedule[replayState.currentMinute] || [];
            for (const entry of entries) {
                if (entry.seconds === replayState.seconds) {
                    replayState.currentActionIndex = entry.actionIndex;
                    replayState.currentActionLineIndex = entry.lineIndex;
                    replayState.committedActionIndex = entry.actionIndex;
                }
            }
            onTick?.(snapshot());

            const lastScheduledSecond = entries.length ? entries[entries.length - 1].seconds : -1;
            if (replayState.seconds >= 60 || replayState.seconds > lastScheduledSecond + postDelay) {
                advanceMinute();
                return;
            }

            replayState.tickTimer = setTimeout(tick, replayState.speed);
        };

        // ── Minute advancement ────────────────────────────────────────

        const advanceMinute = () => {
            clearTimeout(replayState.tickTimer);
            clearTimeout(replayState.advanceTimer);
            clearTimeout(replayState.clipRevealTimer);
            replayState.tickTimer = null;
            replayState.advanceTimer = null;
            replayState.clipRevealTimer = null;
            if (replayState.playMinuteIndex + 1 >= replayState.playMinutes.length) {
                replayState.currentMinute = maximumMinute;
                replayState.seconds = 59;
                replayState.currentActionIndex = 999;
                replayState.currentActionLineIndex = 999;
                replayState.committedActionIndex = 999;
                replayState.committedClipIndex = 999;
                replayState.playing = false;
                replayState.ended = true;
                onEnded?.(snapshot());
                return;
            }

            replayState.playMinuteIndex++;
            replayState.currentMinute = replayState.playMinutes[replayState.playMinuteIndex];
            replayState.seconds = 0;
            replayState.currentActionIndex = -1;
            replayState.currentActionLineIndex = -1;
            replayState.committedActionIndex = -1;
            replayState.committedClipIndex = -1;
            clipMap = [];

            if (unity.isAvailable() && unity.isReady()) {
                const loaded = unity.load(match.report, replayState.currentMinute);
                if (loaded) buildClipMap(replayState.currentMinute);
            }

            onMinuteAdvanced?.(snapshot());
            replayState.tickTimer = setTimeout(tick, replayState.speed);
        };

        // ── Unity clip/minute handoff ─────────────────────────────────
        // Called by TmUnityPlayer callbacks (wired in pages/match.js).

        // Clip clipIndex just started — reveal its text lines in the feed after a short delay.
        const onClipStart = (clipIndex) => {
            const entry = clipMap[clipIndex];
            if (!entry) return;
            clearTimeout(replayState.clipRevealTimer);
            replayState.clipRevealTimer = setTimeout(() => {
                replayState.clipRevealTimer = null;
                replayState.currentActionIndex = entry.actionReportIndex;
                replayState.currentActionLineIndex = entry.lastLineIndex;
                onTick?.(snapshot());
            }, clipRevealDelay * 1000);
        };

        // Clip clipIndex just ended:
        //   - always advance committedClipIndex and fire onTick (stats update per-clip)
        //   - advance committedActionIndex only for outcome clips (score gating)
        const onClipEnd = (clipIndex) => {
            replayState.committedClipIndex = clipIndex;
            const entry = clipMap[clipIndex];
            if (entry?.hasOutcome) {
                replayState.committedActionIndex = entry.actionReportIndex;
            }
            onTick?.(snapshot());
        };

        // All clips for the minute finished — reveal everything (remaining clip text
        // + post-queue actions 1..) then advance after postDelay.
        const onUnityMinuteDone = () => {
            clearTimeout(replayState.tickTimer);   // stop tick loop — Unity is done
            replayState.tickTimer = null;
            replayState.currentActionIndex = 999;
            replayState.currentActionLineIndex = 999;
            replayState.committedActionIndex = 999;
            replayState.committedClipIndex = 999;
            onTick?.(snapshot());
            replayState.advanceTimer = setTimeout(advanceMinute, postDelay * 1000);
        };

        // ── Public controls ───────────────────────────────────────────

        const play = () => {
            if (replayState.ended || replayState.playing) return;
            replayState.playing = true;
            if (unity.getActiveMinute() !== null) unity.sendPauseToggle();
            onTick?.(snapshot());
            tick();
        };

        const pause = () => {
            if (!replayState.playing) return;
            replayState.playing = false;
            clearTimeout(replayState.tickTimer);
            clearTimeout(replayState.advanceTimer);
            clearTimeout(replayState.clipRevealTimer);
            replayState.tickTimer = null;
            replayState.advanceTimer = null;
            replayState.clipRevealTimer = null;
            if (unity.isPlaying()) unity.sendPauseToggle();
            onTick?.(snapshot());
        };

        const toggle = () => (replayState.playing ? pause() : play());

        const skip = () => {
            clearTimeout(replayState.tickTimer);
            clearTimeout(replayState.advanceTimer);
            clearTimeout(replayState.clipRevealTimer);
            replayState.tickTimer = null;
            replayState.advanceTimer = null;
            replayState.clipRevealTimer = null;
            replayState.playing = false;
            if (unity.isPlaying()) unity.sendPauseToggle();
            replayState.currentMinute = maximumMinute;
            replayState.seconds = 59;
            replayState.currentActionIndex = 999;
            replayState.currentActionLineIndex = 999;
            replayState.committedActionIndex = 999;
            replayState.committedClipIndex = 999;
            replayState.playMinuteIndex = replayState.playMinutes.length;
            replayState.ended = true;
            onEnded?.(snapshot());
        };

        const setMode = (newMode) => {
            if (replayState.mode === newMode) return;
            replayState.mode = newMode;
            replayState.playMinutes = newMode === 'key' ? keyPlayMinutes : allPlayMinutes;
            // Keep the current minute playing; position index so the NEXT advance
            // lands on the first minute > curMin in the new list.
            const curMin = replayState.currentMinute;
            let idx = replayState.playMinutes.findIndex(m => m > curMin);
            if (idx === -1) idx = replayState.playMinutes.length;
            replayState.playMinuteIndex = idx - 1;
            replayState.ended = replayState.playMinutes.length === 0;
            onTick?.(snapshot());
        };

        const destroy = () => {
            clearTimeout(replayState.tickTimer);
            clearTimeout(replayState.advanceTimer);
            clearTimeout(replayState.clipRevealTimer);
            replayState.playing = false;
        };

        return { play, pause, toggle, skip, destroy, setMode, onClipStart, onClipEnd, onUnityMinuteDone, getState: snapshot };
    },
};
