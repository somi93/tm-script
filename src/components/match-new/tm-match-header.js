/**
 * tm-match-header.js — Match header component
 *
 * Owns the scoreboard, clock, progress bar, and playback controls.
 * Receives only static props at creation (team names, callbacks).
 * Call update(match, replayState, maximumMinute) on every tick to refresh the display.
 *
 * Usage:
 *   const header = TmMatchHeader.create({
 *       homeName, awayName,
 *       onToggle, onSkip, onClose, onModeChange,
 *   });
 *   container.appendChild(header.el);
 *   header.update(match, replayState, maximumMinute);
 */

import { TmButton }      from '../shared/tm-button.js';
import { TmButtonGroup } from '../shared/tm-button-group.js';

const STYLE_ID = 'mp-header-style';

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        .mp-head {
            flex-shrink: 0; padding: 12px 48px 8px; position: relative;
            background: linear-gradient(180deg, var(--tmu-surface-card-soft) 0%, var(--tmu-surface-panel) 100%);
            border-bottom: 1px solid var(--tmu-border-soft);
        }
        .mp-head-row {
            display: flex; align-items: center; justify-content: center; gap: 16px;
        }
        .mp-team {
            flex: 1; font-size: 15px; font-weight: 700;
            color: var(--tmu-text-strong); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .mp-team.home { text-align: right; }
        .mp-team.away { text-align: left; }
        .mp-score-block {
            display: flex; flex-direction: column; align-items: center; flex-shrink: 0; min-width: 100px;
        }
        .mp-score {
            font-size: 28px; font-weight: 800; color: var(--tmu-text-inverse);
            letter-spacing: 4px; line-height: 1;
            text-shadow: 0 0 20px var(--tmu-success-fill-hover);
        }
        .mp-minute {
            font-size: 11px; font-weight: 700; color: var(--tmu-accent);
            margin-top: 2px; letter-spacing: 0.5px;
            animation: mp-pulse 1.2s ease-in-out infinite;
        }
        .mp-minute.ended { animation: none; color: var(--tmu-text-panel-label); }
        @keyframes mp-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }

        .mp-controls {
            display: flex; align-items: center; gap: 8px; margin-top: 8px; justify-content: center;
        }
        .mp-progress {
            flex: 1; max-width: 400px; height: 4px;
            background: var(--tmu-accent-fill); border-radius: 2px; overflow: hidden;
        }
        .mp-progress-fill {
            height: 100%; width: 0; border-radius: 2px;
            background: linear-gradient(90deg, var(--tmu-compare-home-grad-start), var(--tmu-accent));
            transition: width 0.5s ease;
        }
        .mp-btn-close { position: absolute; top: 8px; right: 12px; }
    `;
    document.head.appendChild(s);
};

// ── Score helper ──────────────────────────────────────────────────────────────

// committedActionIndex: for the current minute, only count goals at reportEventIndex <= this.
// committedActionIndex advances on clip END (not clip start), so the score only updates
// after the goal animation finishes. For past minutes all goals count.
export const scoreAt = (match, currentMinute, committedActionIndex = 999) => {
    let h = 0, a = 0;
    for (const [minStr, evts] of Object.entries(match.report)) {
        const min = Number(minStr);
        if (min > currentMinute) continue;
        evts.forEach((evt, idx) => {
            if (min === currentMinute && idx > committedActionIndex) return;
            if (!evt.goal) return;
            const pid = String(evt.goal.player);
            if (match.home.playerIds?.has(pid)) h++;
            else a++;
        });
    }
    return { h, a };
};

// ── Public factory ────────────────────────────────────────────────────────────

export const TmMatchHeader = {
    /**
     * @param {{ homeName, awayName, onToggle, onSkip, onClose, onModeChange }} opts
     * @returns {{ el, update(match, replayState, maximumMinute) }}
     */
    create({ homeName, awayName, initialMode = 'all', onToggle, onSkip, onClose, onModeChange }) {
        injectStyles();

        const el = document.createElement('div');
        el.className = 'mp-head';

        // ── Close button ──────────────────────────────────────────────
        const closeBtn = TmButton.button({
            label: '✕', variant: 'secondary', size: 'xs',
            cls: 'mp-btn-close', onClick: () => onClose?.(),
        });
        el.appendChild(closeBtn);

        // ── Score row ─────────────────────────────────────────────────
        const headRow = document.createElement('div');
        headRow.className = 'mp-head-row';
        headRow.innerHTML = `
            <div class="mp-team home">${homeName}</div>
            <div class="mp-score-block">
                <div class="mp-score">0 - 0</div>
                <div class="mp-minute">0:00</div>
            </div>
            <div class="mp-team away">${awayName}</div>
        `;
        el.appendChild(headRow);

        // ── Controls row ──────────────────────────────────────────────
        const controls = document.createElement('div');
        controls.className = 'mp-controls';

        const progress = document.createElement('div');
        progress.className = 'mp-progress';
        progress.innerHTML = '<div class="mp-progress-fill"></div>';
        controls.appendChild(progress);

        const toggleBtn = TmButton.button({ label: '▶', variant: 'secondary', size: 'sm', onClick: () => onToggle?.() });
        controls.appendChild(toggleBtn);

        const skipBtn = TmButton.button({ label: '⏭', variant: 'secondary', size: 'sm', onClick: () => onSkip?.() });
        controls.appendChild(skipBtn);

        const { el: modeSwitcher, setActive: setModeActive } = TmButtonGroup.buttonGroup({
            items: [
                { key: 'all', label: 'All' },
                { key: 'key', label: 'Key' },
            ],
            active: initialMode,
            size: 'xs',
            onChange: (key) => onModeChange?.(key),
        });
        controls.appendChild(modeSwitcher);

        el.appendChild(controls);

        // ── Refs ──────────────────────────────────────────────────────
        const scoreEl = headRow.querySelector('.mp-score');
        const minEl   = headRow.querySelector('.mp-minute');
        const progEl  = progress.querySelector('.mp-progress-fill');

        const update = (match, replayState, maximumMinute) => {
            const { h, a } = scoreAt(match, replayState.currentMinute, replayState.committedActionIndex);
            scoreEl.textContent = `${h} - ${a}`;

            if (replayState.ended) {
                minEl.textContent = 'FT';
                minEl.classList.add('ended');
            } else {
                minEl.textContent = `${replayState.currentMinute}:${String(replayState.seconds).padStart(2, '0')}`;
                minEl.classList.remove('ended');
            }

            const pct = Math.min(100, Math.round((replayState.currentMinute * 60 + replayState.seconds) / (maximumMinute * 60) * 100));
            progEl.style.width = pct + '%';

            toggleBtn.textContent = (replayState.playing && !replayState.ended) ? '⏸' : '▶';

            setModeActive(replayState.mode);
        };

        return { el, update };
    },
};
