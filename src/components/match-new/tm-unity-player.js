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

import { TmUnityEngine } from './tm-unity-engine.js';

const STYLE_ID = 'mp-unity-style';

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        /* TV frame — bezel wrapping the canvas */
        #mp-viewport-wrap {
            flex: 0 0 auto; width: 100%;
            position: relative;
            display: flex; align-items: flex-start; justify-content: center;
            background: transparent; overflow: visible; box-sizing: border-box;
        }

        /* Outer bezel */
        .mp-tv {
            width: 100%;
            background: linear-gradient(160deg, #2a2a2a 0%, #141414 60%, #1c1c1c 100%);
            border-radius: 8px 8px 4px 4px;
            padding: 10px 10px 0;
            box-sizing: border-box;
            box-shadow: 0 0 0 1px #111, 0 2px 0 #3a3a3a inset, 0 8px 32px rgba(0,0,0,0.8);
        }

        /* Screen surround — position:relative so HUD and click overlay are scoped here */
        .mp-tv-screen {
            position: relative;
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
            position: relative; width: 100%;
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

        /* Exit-fullscreen button — visible only in fullscreen */
        .mp-fs-exit-btn {
            display: none;
            position: absolute; top: 12px; right: 12px; z-index: 100;
            background: rgba(0,0,0,0.55); border: 1px solid rgba(255,255,255,0.15);
            border-radius: 4px; cursor: pointer; padding: 5px 7px;
            color: rgba(255,255,255,0.6); line-height: 1;
            transition: background 0.15s, color 0.15s;
        }
        .mp-fs-exit-btn:hover { background: rgba(0,0,0,0.85); color: #fff; }
        #mp-viewport-wrap.mp-fs-active .mp-fs-exit-btn { display: flex; align-items: center; }

        /* Goal banner — TV lower-third */
        .mp-goal-banner {
            position: absolute; bottom: 15%; left: 0; z-index: 20;
            pointer-events: none;
            transform: translateX(-105%);
        }
        .mp-goal-banner.mp-gb-in {
            animation: mp-gb-slide 9s ease forwards;
        }
        @keyframes mp-gb-slide {
            0%   { transform: translateX(-105%); }
            6%   { transform: translateX(0); }
            85%  { transform: translateX(0); }
            100% { transform: translateX(-105%); }
        }
        .mp-gb-label {
            display: inline-flex; align-items: center; gap: 5px;
            background: #b71c1c;
            color: #fff;
            font-family: Arial, sans-serif;
            font-size: 9.5px; font-weight: 900;
            letter-spacing: 0.2em; text-transform: uppercase;
            padding: 4px 10px;
        }
        .mp-gb-body {
            background: rgba(5,5,5,0.90);
            border-left: 3px solid #b71c1c;
            padding: 5px 18px 7px 10px;
        }
        .mp-gb-name {
            font-family: Arial, sans-serif;
            font-size: 17px; font-weight: 800;
            color: #fff; letter-spacing: 0.01em;
            line-height: 1.15; white-space: nowrap;
        }
        .mp-gb-assist {
            font-family: Arial, sans-serif;
            font-size: 10px; color: rgba(255,255,255,0.48);
            margin-top: 2px; white-space: nowrap;
        }
        .mp-gb-score {
            font-family: Arial, sans-serif;
            font-size: 10px; font-weight: 700;
            color: rgba(255,255,255,0.55);
            margin-top: 4px; letter-spacing: 0.04em; white-space: nowrap;
        }
        .mp-gb-season-stats {
            font-family: Arial, sans-serif;
            font-size: 10px; color: rgba(255,255,255,0.35);
            margin-top: 2px; white-space: nowrap;
        }

        /* Event banner (card / injury / sub) — TV lower-third, right side */
        .mp-event-banner {
            position: absolute; bottom: 20%; right: 0; z-index: 20;
            pointer-events: none;
            transform: translateX(105%);
        }
        .mp-event-banner.mp-eb-in {
            animation: mp-eb-slide 6s ease forwards;
        }
        @keyframes mp-eb-slide {
            0%   { transform: translateX(105%); }
            10%  { transform: translateX(0); }
            80%  { transform: translateX(0); }
            100% { transform: translateX(105%); }
        }
        .mp-eb-strip {
            display: flex; align-items: stretch;
            background: rgba(8,8,8,0.90);
            min-width: 165px;
        }
        .mp-eb-accent {
            width: 4px; flex-shrink: 0;
            background: var(--eb-color, #888);
        }
        .mp-eb-content {
            padding: 7px 18px 8px 11px;
        }
        .mp-eb-type {
            font-family: Arial, sans-serif; font-size: 8px; font-weight: 700;
            letter-spacing: 0.18em; text-transform: uppercase;
            color: var(--eb-color, #aaa);
            display: flex; align-items: center; gap: 5px;
            margin-bottom: 3px;
        }
        .mp-eb-card-icon {
            display: inline-block; width: 7px; height: 10px;
            background: var(--eb-color, #aaa); border-radius: 1px;
            flex-shrink: 0;
        }
        .mp-eb-name {
            font-family: Arial, sans-serif; font-size: 17px; font-weight: 800;
            color: #fff; white-space: nowrap; letter-spacing: 0.01em; line-height: 1.2;
        }
        .mp-eb-sub-in {
            font-family: Arial, sans-serif; font-size: 14px; font-weight: 700;
            color: #69f0ae; white-space: nowrap; line-height: 1.35;
        }
        .mp-eb-sub-out {
            font-family: Arial, sans-serif; font-size: 12px; font-weight: 500;
            color: rgba(255,255,255,0.42); white-space: nowrap; line-height: 1.25;
        }
        .mp-eb-yellow { --eb-color: #fdd835; }
        .mp-eb-red    { --eb-color: #ef5350; }
        .mp-eb-yr     { --eb-color: #ff7043; }
        .mp-eb-injury { --eb-color: #66bb6a; }
        .mp-eb-sub    { --eb-color: #42a5f5; }
        .mp-eb-tactic { --eb-color: #ab47bc; }
        .mp-eb-tactic-team {
            font-family: Arial, sans-serif; font-size: 10px; font-weight: 600;
            color: rgba(255,255,255,0.5); white-space: nowrap; margin-bottom: 1px;
        }
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
            </div>
            <button class="mp-fs-exit-btn" title="Exit fullscreen">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 1H1v3.5h1.5V2.5H4.5V1zM9.5 1v1.5h1.5V4.5H13V1H9.5zM1 9.5V13h3.5v-1.5H2.5V9.5H1zm10 2H9.5V13H13V9.5h-1.5V11.5z"/>
                </svg>
            </button>`;

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
        wrap.querySelector('.mp-fs-exit-btn').addEventListener('click', () => exitFs());

        const viewport = wrap.querySelector('#mp-viewport');

        // ── Goal banner ───────────────────────────────────────────────
        let _goalBannerTimer = null;
        const showGoalBanner = ({ scorerName, assistName, isOwnGoal, h, a, homeName, awayName }) => {
            let banner = viewport.querySelector('.mp-goal-banner');
            if (!banner) {
                banner = document.createElement('div');
                banner.className = 'mp-goal-banner';
                viewport.appendChild(banner);
            }
            banner.classList.remove('mp-gb-in');
            void banner.offsetWidth; // reflow to restart animation
            const label = isOwnGoal ? '⚽ OWN GOAL' : '⚽ GOAL';
            banner.innerHTML =
                `<div class="mp-gb-label">${label}</div>` +
                `<div class="mp-gb-body">` +
                `<div class="mp-gb-name">${scorerName}</div>` +
                (assistName ? `<div class="mp-gb-assist">Assist: ${assistName}</div>` : '') +
                `<div class="mp-gb-score">${homeName}  ${h} · ${a}  ${awayName}</div>` +
                `<div class="mp-gb-season-stats"></div>` +
                `</div>`;
            clearTimeout(_goalBannerTimer);
            banner.classList.add('mp-gb-in');
            _goalBannerTimer = setTimeout(() => banner.classList.remove('mp-gb-in'), 9500);
        };

        const updateGoalBannerStats = ({ goals, games }) => {
            const el = viewport.querySelector('.mp-gb-season-stats');
            if (!el) return;
            const goalsText = `${goals} goal${goals !== 1 ? 's' : ''}`;
            el.textContent = games != null
                ? `${goalsText} in ${games} match${games !== 1 ? 'es' : ''} this season`
                : `${goalsText} this season`;
        };

        // ── Event banner (card / injury / sub) ───────────────────────
        const EVENT_META = {
            yellow:   { cls: 'mp-eb-yellow',  label: 'YELLOW CARD',  cardIcon: true },
            red:      { cls: 'mp-eb-red',     label: 'RED CARD',     cardIcon: true },
            yellowRed:{ cls: 'mp-eb-yr',      label: 'RED CARD',     cardIcon: true },
            injury:   { cls: 'mp-eb-injury',  label: 'INJURY',       prefix: '\u271A' },
            sub:      { cls: 'mp-eb-sub',     label: 'SUBSTITUTION' },
            tactic:   { cls: 'mp-eb-tactic',  label: 'MENTALITY CHANGE', prefix: '\u25C6' },
        };
        let _eventBannerTimer = null;
        const showEventBanner = ({ type, name, nameIn, nameOut, teamName }) => {
            const meta = EVENT_META[type];
            if (!meta) return;
            let banner = viewport.querySelector('.mp-event-banner');
            if (!banner) {
                banner = document.createElement('div');
                banner.className = 'mp-event-banner';
                viewport.appendChild(banner);
            }
            banner.classList.remove('mp-eb-in');
            void banner.offsetWidth;
            const typeIcon = meta.cardIcon
                ? '<span class="mp-eb-card-icon"></span>'
                : (meta.prefix ? `<span>${meta.prefix}</span>` : '');
            let innerHtml;
            if (type === 'sub') {
                innerHtml =
                    `<div class="mp-eb-type">${typeIcon}${meta.label}</div>` +
                    `<div class="mp-eb-sub-in">\u25B2 ${nameIn}</div>` +
                    `<div class="mp-eb-sub-out">\u25BC ${nameOut}</div>`;
            } else if (type === 'tactic') {
                innerHtml =
                    `<div class="mp-eb-type">${typeIcon}${meta.label}</div>` +
                    (teamName ? `<div class="mp-eb-tactic-team">${teamName}</div>` : '') +
                    `<div class="mp-eb-name">${name}</div>`;
            } else {
                innerHtml =
                    `<div class="mp-eb-type">${typeIcon}${meta.label}</div>` +
                    `<div class="mp-eb-name">${name}</div>`;
            }
            banner.innerHTML =
                `<div class="mp-eb-strip ${meta.cls}">` +
                `<div class="mp-eb-accent"></div>` +
                `<div class="mp-eb-content">${innerHtml}</div>` +
                `</div>`;
            clearTimeout(_eventBannerTimer);
            banner.classList.add('mp-eb-in');
            _eventBannerTimer = setTimeout(() => banner.classList.remove('mp-eb-in'), 6500);
        };

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
            showGoalBanner,
            updateGoalBannerStats,
            showEventBanner,
        };
    },
};
