import { TmUI } from './tm-ui.js';

const STYLE_ID = 'tmu-countdown-block-style';

const esc = (v) => String(v || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-cdb-wrap {
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--tmu-space-sm);
            min-height: 72px;
            min-width: 240px;
            padding: var(--tmu-space-xl) var(--tmu-space-lg);
            border-radius: var(--tmu-space-md);
            border: 1px solid rgba(255,255,255,.06);
            text-align: center;
            background:
                radial-gradient(ellipse 90% 70% at 50% 30%, rgba(80,100,140,.18) 0%, transparent 70%),
                var(--tmu-surface-dark-strong);
        }

        .tmvu-cdb-content {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }

        .tmvu-cdb-particle {
            position: absolute;
            border-radius: 999px;
            background: var(--tmu-accent);
            opacity: 0;
        }

        @keyframes tmvu-cdb-wave-a {
            0%   { left: -8px; transform: translateY(0px);   opacity: 0; }
            8%   { opacity: .8; }
            25%  { transform: translateY(-13px); }
            50%  { left: 50%; transform: translateY(9px); }
            75%  { transform: translateY(-10px); }
            92%  { opacity: .8; }
            100% { left: calc(100% + 8px); transform: translateY(5px);  opacity: 0; }
        }

        @keyframes tmvu-cdb-wave-b {
            0%   { left: -8px; transform: translateY(0px);   opacity: 0; }
            8%   { opacity: .55; }
            30%  { transform: translateY(11px); }
            55%  { left: 55%; transform: translateY(-15px); }
            80%  { transform: translateY(7px); }
            92%  { opacity: .55; }
            100% { left: calc(100% + 8px); transform: translateY(-4px); opacity: 0; }
        }

        @keyframes tmvu-cdb-wave-c {
            0%   { left: -8px; transform: translateY(0px);   opacity: 0; }
            8%   { opacity: .45; }
            20%  { transform: translateY(-9px); }
            45%  { left: 45%; transform: translateY(13px); }
            70%  { transform: translateY(-7px); }
            92%  { opacity: .45; }
            100% { left: calc(100% + 8px); transform: translateY(9px);  opacity: 0; }
        }

        .tmvu-cdb-particle:nth-child(1) { width: 5px; height: 5px; top: 28%; animation: tmvu-cdb-wave-a 4.2s ease-in-out -0.5s  infinite; }
        .tmvu-cdb-particle:nth-child(2) { width: 4px; height: 4px; top: 58%; animation: tmvu-cdb-wave-b 5.8s ease-in-out -2.1s  infinite; }
        .tmvu-cdb-particle:nth-child(3) { width: 6px; height: 6px; top: 18%; animation: tmvu-cdb-wave-c 3.9s ease-in-out -1.3s  infinite; }
        .tmvu-cdb-particle:nth-child(4) { width: 4px; height: 4px; top: 72%; animation: tmvu-cdb-wave-a 6.3s ease-in-out -3.5s  infinite; }
        .tmvu-cdb-particle:nth-child(5) { width: 5px; height: 5px; top: 44%; animation: tmvu-cdb-wave-b 4.7s ease-in-out -0.85s infinite; }
        .tmvu-cdb-particle:nth-child(6) { width: 4px; height: 4px; top: 14%; animation: tmvu-cdb-wave-c 5.1s ease-in-out -2.7s  infinite; }
        .tmvu-cdb-particle:nth-child(7) { width: 5px; height: 5px; top: 82%; animation: tmvu-cdb-wave-a 3.6s ease-in-out -1.95s infinite; }

        .tmvu-cdb-label {
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            letter-spacing: .1em;
            text-transform: uppercase;
            color: var(--tmu-text-panel-label);
        }

        .tmvu-cdb-timer {
            font-size: var(--tmu-font-2xl);
            font-weight: 900;
            color: var(--tmu-accent);
            font-variant-numeric: tabular-nums;
            letter-spacing: -.02em;
            line-height: 1;
            margin-top: 2px;
        }

        .tmvu-cdb-actions {
            display: flex;
            flex-wrap: wrap;
            gap: var(--tmu-space-sm);
            justify-content: center;
            margin-top: var(--tmu-space-xs);
        }
    `;
    document.head.appendChild(style);
};

/**
 * Animated countdown/elapsed block with floating particles.
 *
 * mount(container, { title, getDisplayText, actions })
 *   title          — upper label text
 *   getDisplayText — () => string | null  (called every second)
 *                    string  → shown in timer slot
 *                    null    → expired: hide timer, show actions
 *                    omit    → immediately show actions (or blank timer if no actions)
 *   actions        — [{ label, onClick }]  shown when expired / when no getDisplayText
 *
 * Returns { destroy() } — stops the interval and removes the element.
 */
export const TmCountdownBlock = {
    mount(container, { title = '', getDisplayText = null, actions = [] } = {}) {
        injectStyles();

        const wrap = document.createElement('div');
        wrap.className = 'tmvu-cdb-wrap';
        wrap.innerHTML = `
            <div class="tmvu-cdb-particle"></div>
            <div class="tmvu-cdb-particle"></div>
            <div class="tmvu-cdb-particle"></div>
            <div class="tmvu-cdb-particle"></div>
            <div class="tmvu-cdb-particle"></div>
            <div class="tmvu-cdb-particle"></div>
            <div class="tmvu-cdb-particle"></div>
            <div class="tmvu-cdb-content">
                <div class="tmvu-cdb-label">${esc(title)}</div>
                <div class="tmvu-cdb-timer" data-ref="timer"></div>
                <div class="tmvu-cdb-actions" data-ref="acts" hidden></div>
            </div>
        `;
        container.appendChild(wrap);

        const timerEl = wrap.querySelector('[data-ref="timer"]');
        const actsEl = wrap.querySelector('[data-ref="acts"]');

        const showExpiredState = () => {
            timerEl.hidden = true;
            actsEl.hidden = false;
            actsEl.replaceChildren();
            if (actions.length) {
                actions.forEach(({ label, onClick }) => {
                    actsEl.appendChild(TmUI.button({ label, color: 'primary', size: 'sm', onClick }));
                });
            } else {
                timerEl.hidden = false;
                timerEl.textContent = '—';
            }
        };

        let interval = null;

        if (getDisplayText) {
            const tick = () => {
                const text = getDisplayText();
                if (text === null) {
                    if (interval) { clearInterval(interval); interval = null; }
                    showExpiredState();
                } else {
                    timerEl.textContent = text;
                }
            };
            tick();
            interval = setInterval(tick, 1000);
        } else {
            showExpiredState();
        }

        return {
            destroy() {
                if (interval) { clearInterval(interval); interval = null; }
                wrap.remove();
            },
        };
    },
};
