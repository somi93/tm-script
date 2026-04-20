/**
 * tm-match-feed.js — Live commentary feed component
 *
 * Append-only feed — never clears, never re-renders existing lines.
 * Tracks rendered lines by key so new lines animate in without triggering
 * animation on already-visible lines (no blink).
 *
 * Usage:
 *   const feed = TmMatchFeed.create();
 *   container.appendChild(feed.el);
 *   feed.sync(match, currentMinute, currentActionIndex, currentActionLineIndex);  // on every tick
 *   feed.clear();  // reset (e.g. on match change)
 */

const STYLE_ID = 'mp-feed-style';

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        /* Feed panel — 20% of mp-body */
        .mp-feed {
            flex: 0 0 260px; min-width: 0;
            display: flex; flex-direction: column;
            gap: 3px; overflow-y: auto; overflow-x: hidden;
            scrollbar-width: none;
            padding: 8px; box-sizing: border-box;
            border-right: 1px solid var(--tmu-border-soft-alpha);
            max-height: var(--mp-canvas-h, 100%);
        }
        .mp-feed::-webkit-scrollbar { display: none; }

        .mp-feed-line {
            display: flex; align-items: baseline; gap: 5px;
            font-size: 12px; color: var(--tmu-text-main); line-height: 1.4;
            padding: 2px 0;
            animation: mp-feed-in 0.4s ease;
        }
        @keyframes mp-feed-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }

        .mp-feed-min {
            font-size: 10px; font-weight: 700; color: var(--tmu-accent);
            background: var(--tmu-surface-overlay); border-radius: 3px;
            padding: 0 4px; white-space: nowrap; flex-shrink: 0;
        }
        .mp-feed-text { color: var(--tmu-text-main); }
    `;
    document.head.appendChild(s);
};

// ── Public factory ────────────────────────────────────────────────────────────

export const TmMatchFeed = {
    /**
     * @returns {{ el, sync(match, currentMinute, currentActionIndex, currentActionLineIndex), clear() }}
     */
    create() {
        injectStyles();

        const el = document.createElement('div');
        el.className = 'mp-feed';

        // Set of rendered line keys: "min:reportEventIndex:lineIndex"
        const rendered = new Set();
        let lastMinute = null;

        const appendLine = (min, text) => {
            const div = document.createElement('div');
            div.className = 'mp-feed-line';
            div.innerHTML =
                `<span class="mp-feed-min">${min}'</span>` +
                `<span class="mp-feed-text">${text.replace(/\[\w+\]/g, '').trim()}</span>`;
            el.appendChild(div);
            el.scrollTop = el.scrollHeight;
        };

        /**
         * Show only the current minute's commentary lines.
         * Clears and re-renders whenever the minute advances.
         */
        const sync = (match, currentMinute, currentActionIndex, currentActionLineIndex) => {
            if (currentMinute !== lastMinute) {
                clear();
                lastMinute = currentMinute;
            }
            for (const action of (match.plays[String(currentMinute)] || [])) {
                if (action.reportEventIndex > currentActionIndex) break;
                let lineIndex = 0;
                for (const clip of action.clips) {
                    for (const line of clip.text) {
                        if (!line.trim()) { lineIndex++; continue; }
                        if (action.reportEventIndex === currentActionIndex && lineIndex > currentActionLineIndex) {
                            lineIndex++; continue;
                        }
                        const key = `${currentMinute}:${action.reportEventIndex}:${lineIndex}`;
                        if (!rendered.has(key)) {
                            rendered.add(key);
                            appendLine(currentMinute, line);
                        }
                        lineIndex++;
                    }
                }
            }
        };

        const clear = () => {
            rendered.clear();
            el.innerHTML = '';
            lastMinute = null;
        };

        return { el, sync, clear };
    },
};
