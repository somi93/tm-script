/**
 * tm-unity-engine.js ΓÇö Clean Unity 3D integration layer
 *
 * Only knows about the Unity API ΓÇö no match state, no text rendering.
 * Responsibilities:
 *   - Poll for gameInstance availability, suppress TM's own replay
 *   - Move / save the .webgl-content canvas
 *   - Intercept window.stargate callbacks from Unity
 *   - Load clip queues and start playback
 *   - Expose pause toggle (OnPauseGame is a toggle in the Unity build)
 *
 * Unity API (ClipsViewerScript):
 *   SendMessage('ClipsViewerScript', 'PrepareMinute', JSON.stringify({ queue: Clip[], id: number }))
 *     Clip = { video: string, att1?, att2?, gk?, def1?, def2? }
 *   SendMessage('ClipsViewerScript', 'PlayMinute',   JSON.stringify({ id: number }))
 *   SendMessage('ClipsViewerScript', 'OnPauseGame')   ΓÇö toggles pause/resume
 *
 * Stargate callbacks (Unity ΓåÆ JS):
 *   { flash_ready: 1 }                  Unity WebGL context ready
 *   { finished_loading: { id } }        PrepareMinute done, safe to play
 *   { starting_clip:    { ... } }       A single clip started
 *   { finished_clip:    { ... } }       A single clip ended
 *   { finished_playing: { id } }        All clips for minute id done
 *
 * Usage:
 *   const engine = TmUnityEngine.create({ viewportId, onReady, onClipStart, onClipEnd, onMinuteDone });
 *   engine.init();              // start polling for gameInstance
 *   engine.load(report, min);  // queue clips for a minute
 *   engine.sendPauseToggle();  // pause or resume mid-animation
 */

export const TmUnityEngine = {
    create({ viewportId, onReady, onClipStart, onClipEnd, onMinuteDone }) {
        const uw = () => typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

        let available = false;
        let ready = false;
        let playing = false;     // true between starting_clip and finished_playing
        let activeMinute = null; // minute whose clips are currently loaded / playing
        let pendingMinute = null;// minute waiting for finished_loading before auto-play
        let tmStopped = false;
        let canvasParent = null;

        // Maps clip index (0-based within a minute) ΓåÆ play index in match.plays[minute].
        // Built on every PrepareMinute call so starting_clip can emit the right playIdx.
        let clipStartCounter = 0;
        let clipEndCounter = 0;

        // ΓöÇΓöÇ Extract video clip list for one minute from a normalized report ΓöÇΓöÇ
        // report[min] is an array of events; each event may have .chance.video[]
        // clipData shape: { video: clipName, att1?, att2?, gk?, def1?, def2? }
        const clipsForMinute = (report, minute) =>
            (report[String(minute)] || []).flatMap(evt => {
                const v = evt.chance?.video;
                if (!v) return [];
                return Array.isArray(v) ? v : [v];
            });

        // ΓöÇΓöÇ Canvas management ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

        const saveCanvas = () => {
            if (!available) return;
            const webgl = document.querySelector('.webgl-content');
            if (!webgl || webgl.parentElement?.id === 'mp-canvas-safe') return;
            let safe = document.getElementById('mp-canvas-safe');
            if (!safe) {
                safe = document.createElement('div');
                safe.id = 'mp-canvas-safe';
                safe.style.cssText =
                    'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;';
                document.body.appendChild(safe);
            }
            safe.appendChild(webgl);
        };

        const moveCanvas = () => {
            if (!available) return;
            const webgl = document.querySelector('.webgl-content');
            if (!webgl) return;
            const target = document.getElementById(viewportId);
            if (!target) return;
            if (!canvasParent) canvasParent = webgl.parentElement;
            target.innerHTML = '';
            target.appendChild(webgl);
            webgl.style.display = 'block';
            const gc = document.getElementById('gameContainer');
            if (gc) { gc.style.width = '100%'; gc.style.height = '100%'; gc.style.margin = '0'; }
        };

        // ΓöÇΓöÇ TM replay suppression ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        // TM runs its own flash/JS replay on match pages.
        // We override its entry points so it doesn't fight with our replay.

        const stopTm = () => {
            if (tmStopped) return;
            tmStopped = true;
            const w = uw();
            if (w.flash_status) {
                w.flash_status.playback_mode = 'pause';
                w.flash_status.enabled = false;
            }
            w._orig_run_match = w.run_match;
            w.run_match = () => {};
            if (w.show_next_action_text_entry) {
                w._orig_show_next_action_text_entry = w.show_next_action_text_entry;
                w.show_next_action_text_entry = () => {};
            }
            if (w.prepare_next_minute) {
                w._orig_prepare_next_minute = w.prepare_next_minute;
                w.prepare_next_minute = () => {};
            }
        };

        // ΓöÇΓöÇ Stargate intercept ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        // window.stargate is Unity's callback channel.
        // We replace it (saving the original) to receive lifecycle events.

        const setupStargate = () => {
            const w = uw();
            const orig = w.stargate;
            w.stargate = (vars) => {
                // Unity WebGL context fully initialised
                if (vars.flash_ready) {
                    ready = true;
                }

                // PrepareMinute finished ΓÇö now safe to start playback
                if (vars.finished_loading) {
                    const id = vars.finished_loading.id;
                    if (pendingMinute === id) {
                        pendingMinute = null;
                        w.gameInstance?.SendMessage(
                            'ClipsViewerScript', 'PlayMinute', JSON.stringify({ id })
                        );
                    }
                }

                // An individual clip started ΓÇö emit sequential index so controller
                // can reveal the matching text segment.
                if (vars.starting_clip) {
                    playing = true;
                    onClipStart?.(clipStartCounter++);
                }

                // An individual clip ended ΓÇö emit sequential index.
                if (vars.finished_clip) {
                    onClipEnd?.(clipEndCounter++);
                }

                // All clips for the minute have finished
                if (vars.finished_playing) {
                    const id = vars.finished_playing.id;
                    playing = false;
                    activeMinute = null;
                    onMinuteDone?.(id);
                }

                // Forward to original handler if it existed
                orig?.(vars);
            };
        };

        // ΓöÇΓöÇ Public: load clips for a minute ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

        const load = (report, minute) => {
            const w = uw();
            if (!available || !w.gameInstance) return false;
            const clips = clipsForMinute(report, minute);
            if (!clips.length) return false;
            clipStartCounter = 0;
            clipEndCounter = 0;
            activeMinute = minute;
            pendingMinute = minute;
            w.gameInstance.SendMessage(
                'ClipsViewerScript', 'PrepareMinute', JSON.stringify({ queue: clips, id: minute })
            );
            return true;
        };

        // ΓöÇΓöÇ Public: toggle pause/resume (OnPauseGame is a toggle in Unity) ΓöÇΓöÇ
        // Call once to pause mid-animation, call again to resume.

        const sendPauseToggle = () => {
            if (activeMinute !== null) {
                uw().gameInstance?.SendMessage('ClipsViewerScript', 'OnPauseGame');
            }
        };

        // ΓöÇΓöÇ Initialization: poll for gameInstance ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

        const init = () => {
            const poll = setInterval(() => {
                const w = uw();
                if (w.gameInstance || w.gameInstanceLoaded) {
                    clearInterval(poll);
                    available = true;
                    ready = true;
                    stopTm();
                    setupStargate();
                    moveCanvas();
                    onReady?.();
                }
            }, 500);
            // Stop polling after 30 s ΓÇö Unity may not be present on this page
            setTimeout(() => clearInterval(poll), 30_000);
        };

        return {
            init,
            load,
            sendPauseToggle,
            moveCanvas,
            saveCanvas,
            isAvailable: () => available,
            isReady: () => ready,
            isPlaying: () => playing,
            getActiveMinute: () => activeMinute,
        };
    },
};
