/**
 * tm-unity-player.js — Unity viewport component
 *
 * Owns only the viewport DOM element and the TmUnityEngine wrapper.
 * Has no knowledge of match state, score, feed, or header.
 *
 * Usage:
 *   const unity = TmUnityPlayer.create({ onReady, onClipStart, onClipEnd, onMinuteDone });
 *   container.appendChild(unity.el);  // element must be in DOM before init()
 *   unity.init();
 *
 *   unity.load(match.report, minute);
 *   unity.sendPauseToggle();
 *   unity.saveCanvas();
 *   unity.isAvailable() / isReady() / isPlaying() / getActiveMinute()
 */

import { TmUnityEngine } from '../match/tm-unity-engine.js';

const STYLE_ID = 'mp-unity-style';

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        /* TV frame — bezel wrapping the canvas */
        #mp-viewport-wrap {
            flex: 0 0 auto; align-self: stretch;
            position: relative;
            display: flex; align-items: stretch; justify-content: center;
            background: transparent; overflow: visible; box-sizing: border-box;
        }

        /* Outer bezel */
        .mp-tv {
            display: flex; flex-direction: column; height: 100%;
            background: linear-gradient(160deg, #2a2a2a 0%, #141414 60%, #1c1c1c 100%);
            border-radius: 8px 8px 4px 4px;
            padding: 10px 10px 0;
            box-sizing: border-box;
            box-shadow: 0 0 0 1px #111, 0 2px 0 #3a3a3a inset, 0 8px 32px rgba(0,0,0,0.8);
        }

        /* Screen surround — position:relative so HUD and click overlay are scoped here */
        .mp-tv-screen {
            position: relative; flex: 1;
            background: #050505;
            border-radius: 3px 3px 0 0;
            box-shadow: inset 0 0 8px rgba(0,0,0,0.9), inset 0 1px 3px rgba(0,0,0,0.6);
        }

        /* Brand bar */
        .mp-tv-brand {
            display: flex; align-items: center; justify-content: center;
            height: 28px; gap: 5px; position: relative;
        }
        .mp-tv-fullscreen {
            position: absolute; right: 8px;
            background: none; border: none; cursor: pointer;
            color: #555; padding: 0; line-height: 1;
            display: flex; align-items: center;
            transition: color 0.15s;
        }
        .mp-tv-fullscreen:hover { color: #aaa; }

        /* Viewport box */
        #mp-viewport {
            position: relative; height: 100%;
            aspect-ratio: 780 / 447;
            overflow: hidden; background: #000;
        }

        /* Unity canvas overrides */
        #mp-viewport .webgl-content {
            position: relative !important;
            top: auto !important; left: auto !important;
            right: auto !important; bottom: auto !important;
            transform: none !important;
            width: 100% !important; height: 100% !important;
            margin: 0 !important; padding: 0 !important;
            display: block !important;
        }
        #mp-viewport #gameContainer {
            position: relative !important;
            top: auto !important; left: auto !important;
            right: auto !important; bottom: auto !important;
            transform: none !important;
            width: 100% !important; height: 100% !important;
            margin: 0 !important; padding: 0 !important;
        }
        #mp-viewport #gameContainer .footer { display: none !important; }
        #mp-viewport #gameContainer button { display: none !important; }
        #mp-viewport #gameContainer img { display: none !important; }
        #mp-viewport #gameContainer #unityPlayer { display: none !important; }
        #mp-viewport canvas {
            width: 100% !important; height: 100% !important;
            display: block !important; object-fit: contain;
        }
        .mp-no-unity { color: var(--tmu-text-faint); font-size: 11px; text-align: center; padding: 12px; }

        /* Grain overlay */
        #mp-viewport::after {
            content: ''; position: absolute; inset: 0; z-index: 2; pointer-events: none;
            background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.35'/></svg>");
            opacity: 0.045; animation: mp-grain 0.35s steps(1) infinite;
        }
        @keyframes mp-grain {
            0%   { background-position: 0 0; }   20% { background-position: -30px 20px; }
            40%  { background-position: 20px -40px; } 60% { background-position: -45px 15px; }
            80%  { background-position: 30px 35px; }
        }

        /* Transparent click overlay — covers exact canvas area for pause/play */
        .mp-canvas-click {
            position: absolute; inset: 0; z-index: 5; cursor: pointer;
        }

        /* HUD — scoreboard inside the screen, always visible, above the click overlay */
        .mp-hud {
            position: absolute; top: 10px; left: 10px; z-index: 10;
            pointer-events: auto; user-select: none;
        }
        .mp-hud-main {
            display: flex; align-items: stretch;
            background: rgba(8,8,8,0.86); backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.09);
            font-family: Arial, sans-serif; white-space: nowrap; overflow: hidden;
        }
        .mp-hud-team {
            font-size: 11px; font-weight: 700; letter-spacing: 0.04em;
            color: #cacaca; text-transform: uppercase;
            padding: 6px 9px; line-height: 1; display: flex; align-items: center;
        }
        .mp-hud-score-block {
            display: flex; align-items: center; gap: 3px;
            background: rgba(255,255,255,0.07); padding: 0 9px;
        }
        .mp-hud-score-h, .mp-hud-score-a {
            font-size: 13px; font-weight: 800; color: #fff;
            min-width: 13px; text-align: center; line-height: 1; padding: 0 1px;
        }
        .mp-hud-score-dash {
            font-size: 11px; color: rgba(255,255,255,0.3);
        }
        .mp-hud-vdiv {
            width: 1px; background: rgba(255,255,255,0.1); align-self: stretch;
        }
        .mp-hud-time {
            font-size: 10px; font-weight: 700; color: #e53935;
            padding: 6px 8px; letter-spacing: 0.03em;
            display: flex; align-items: center;
        }
        .mp-hud-stats-toggle {
            background: none; border: none; cursor: pointer;
            color: rgba(255,255,255,0.35); padding: 6px 7px; font-size: 10px;
            border-left: 1px solid rgba(255,255,255,0.09);
            display: flex; align-items: center; line-height: 1;
            transition: color 0.15s;
        }
        .mp-hud-stats-toggle:hover { color: rgba(255,255,255,0.75); }

        /* Stats dropdown panel */
        .mp-hud-stats-panel {
            background: rgba(8,8,8,0.92); backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.09); border-top: none;
            padding: 8px 8px 6px;
        }
        .mp-hud-stats-panel[hidden] { display: none; }
        .mp-hud-stat-row {
            display: flex; align-items: center; gap: 6px;
            margin-bottom: 5px; font-family: Arial, sans-serif;
        }
        .mp-hud-stat-row:last-child { margin-bottom: 0; }
        .mp-hud-stat-h, .mp-hud-stat-a {
            font-size: 11px; font-weight: 800; color: #e0e0e0; width: 18px; line-height: 1;
        }
        .mp-hud-stat-h { text-align: right; }
        .mp-hud-stat-a { text-align: left; }
        .mp-hud-stat-label {
            flex: 1; font-size: 9px; color: rgba(255,255,255,0.38);
            text-align: center; text-transform: uppercase; letter-spacing: 0.05em;
            min-width: 64px;
        }
        .mp-hud-stat-row.poss .mp-hud-stat-h,
        .mp-hud-stat-row.poss .mp-hud-stat-a { font-size: 10px; }

        /* CSS fullscreen */
        #mp-viewport-wrap.mp-fs-active {
            position: fixed; inset: 0; z-index: 99999;
            max-width: none; background: #000;
            align-items: center; justify-content: center;
        }
        #mp-viewport-wrap.mp-fs-active .mp-tv {
            width: min(100vw, calc(100vh * (780 / 447)));
            max-width: none;
        }
        #mp-viewport-wrap.mp-fs-active .mp-tv-brand { display: none; }
    `;
    document.head.appendChild(s);
};

// ── Public factory ────────────────────────────────────────────────────────────

export const TmUnityPlayer = {
    /**
     * @param {{ onReady, onClipStart, onClipEnd, onMinuteDone }} opts
     * @returns {{ el, init, load, sendPauseToggle, saveCanvas, isAvailable, isReady, isPlaying, getActiveMinute }}
     */
    create({ onReady, onClipStart, onClipEnd, onMinuteDone, onCanvasClick, getHUD, getStats }) {
        injectStyles();

        const wrap = document.createElement('div');
        wrap.id = 'mp-viewport-wrap';

        const tvBrandSvg = `<svg width="48" height="14" viewBox="0 0 48 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="11" font-family="Arial,sans-serif" font-size="11" font-weight="700" letter-spacing="1" fill="#888">TM</text>
            <rect x="23" y="4" width="1" height="6" rx="0.5" fill="#444"/>
            <text x="27" y="11" font-family="Arial,sans-serif" font-size="11" font-weight="700" letter-spacing="1" fill="#e53935">TV</text>
        </svg>`;

        const fullscreenSvg = `<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1h4v1.5H2.5V4H1V1zm8 0h4v3h-1.5V2.5H9V1zM1 9h1.5v1.5H4V12H1V9zm9.5 1.5H9V12h4V9h-1.5v1.5z"/>
        </svg>`;

        const HUD_STATS = [
            { key: 'shots',     label: 'Shots' },
            { key: 'sot',       label: 'On target' },
            { key: 'corners',   label: 'Corners' },
            { key: 'penalties', label: 'Penalties' },
            { key: 'yellow',    label: 'Yellow' },
            { key: 'red',       label: 'Red' },
        ];
        const statsRowsHTML = HUD_STATS.map(({ label }) =>
            `<div class="mp-hud-stat-row">
                <span class="mp-hud-stat-h">0</span>
                <span class="mp-hud-stat-label">${label}</span>
                <span class="mp-hud-stat-a">0</span>
            </div>`
        ).join('') +
            `<div class="mp-hud-stat-row poss">
                <span class="mp-hud-stat-h">50%</span>
                <span class="mp-hud-stat-label">Possession</span>
                <span class="mp-hud-stat-a">50%</span>
            </div>`;

        wrap.innerHTML = `
            <div class="mp-tv">
                <div class="mp-tv-screen">
                    <div id="mp-viewport"><div class="mp-no-unity">Loading Unity…</div></div>
                    <div class="mp-hud">
                        <div class="mp-hud-main">
                            <span class="mp-hud-team mp-hud-home-val"></span>
                            <div class="mp-hud-score-block">
                                <span class="mp-hud-score-h mp-hud-h-val">0</span>
                                <span class="mp-hud-score-dash">-</span>
                                <span class="mp-hud-score-a mp-hud-a-val">0</span>
                            </div>
                            <span class="mp-hud-team mp-hud-away-val"></span>
                            <div class="mp-hud-vdiv"></div>
                            <span class="mp-hud-time mp-hud-time-val">00:00</span>
                            <button class="mp-hud-stats-toggle" title="Stats">▾</button>
                        </div>
                        <div class="mp-hud-stats-panel" hidden>${statsRowsHTML}</div>
                    </div>
                    <div class="mp-canvas-click"></div>
                </div>
                <div class="mp-tv-brand">
                    ${tvBrandSvg}
                    <button class="mp-tv-fullscreen" title="Fullscreen">${fullscreenSvg}</button>
                </div>
            </div>`;

        // HUD refs
        const hudHome    = wrap.querySelector('.mp-hud-home-val');
        const hudAway    = wrap.querySelector('.mp-hud-away-val');
        const hudH       = wrap.querySelector('.mp-hud-h-val');
        const hudA       = wrap.querySelector('.mp-hud-a-val');
        const hudTime    = wrap.querySelector('.mp-hud-time-val');
        const statsPanel = wrap.querySelector('.mp-hud-stats-panel');
        const statsTgl   = wrap.querySelector('.mp-hud-stats-toggle');
        const statHEls   = [...wrap.querySelectorAll('.mp-hud-stat-h')];
        const statAEls   = [...wrap.querySelectorAll('.mp-hud-stat-a')];

        const STAT_KEYS = ['shots', 'sot', 'corners', 'penalties', 'yellow', 'red'];

        statsTgl.addEventListener('click', (e) => {
            e.stopPropagation();
            const opening = statsPanel.hasAttribute('hidden');
            if (opening) statsPanel.removeAttribute('hidden');
            else statsPanel.setAttribute('hidden', '');
            statsTgl.textContent = opening ? '▴' : '▾';
        });

        const updateHUD = () => {
            if (getHUD) {
                const { homeName, awayName, homeScore, awayScore, minute, seconds } = getHUD();
                hudHome.textContent = homeName;
                hudAway.textContent = awayName;
                hudH.textContent = homeScore;
                hudA.textContent = awayScore;
                const mm = String(minute).padStart(2, '0');
                const ss = String(seconds).padStart(2, '0');
                hudTime.textContent = `${mm}:${ss}`;
            }
            if (getStats && !statsPanel.hasAttribute('hidden')) {
                const { home, away, homePoss, awayPoss } = getStats();
                STAT_KEYS.forEach((key, i) => {
                    statHEls[i].textContent = String(home[key]);
                    statAEls[i].textContent = String(away[key]);
                });
                statHEls[6].textContent = homePoss + '%';
                statAEls[6].textContent = awayPoss + '%';
            }
        };

        // Click canvas → pause/play
        wrap.querySelector('.mp-canvas-click').addEventListener('click', () => {
            onCanvasClick?.();
        });

        // Fullscreen toggle
        const onFsKey = (e) => { if (e.key === 'Escape') exitFs(); };
        const enterFs = () => { wrap.classList.add('mp-fs-active'); document.addEventListener('keydown', onFsKey); };
        const exitFs  = () => { wrap.classList.remove('mp-fs-active'); document.removeEventListener('keydown', onFsKey); };
        wrap.querySelector('.mp-tv-fullscreen').addEventListener('click', () => {
            wrap.classList.contains('mp-fs-active') ? exitFs() : enterFs();
        });

        const engine = TmUnityEngine.create({
            viewportId: 'mp-viewport',
            onReady, onClipStart, onClipEnd, onMinuteDone,
        });

        return {
            el:              wrap,
            init:            () => engine.init(),
            load:            (report, minute) => engine.load(report, minute),
            sendPauseToggle: () => engine.sendPauseToggle(),
            saveCanvas:      () => engine.saveCanvas(),
            isAvailable:     () => engine.isAvailable(),
            isReady:         () => engine.isReady(),
            isPlaying:       () => engine.isPlaying(),
            getActiveMinute: () => engine.getActiveMinute(),
            updateHUD,
        };
    },
};
