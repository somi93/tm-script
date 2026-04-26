/**
 * tm-match-timeline.js — Timeline tab for the new match player.
 * Shows key events (goals, cards, injuries, substitutions) in chronological
 * order up to the current replay minute.
 *
 * Data source: match.report[minStr] — post-normalizeReport() events with:
 *   evt.goal      = { player: pid, assist: pid|null, score: [h,a] }
 *   evt.yellow    = pid string
 *   evt.yellow_red = pid string
 *   evt.red       = pid string
 *   evt.injury    = pid string
 *   evt.sub       = { in: pid, out: pid }
 *
 * Team detection: match.home.playerIds (Set<string>)
 * Player name lookup: match.home.lineup + match.away.lineup arrays
 */

import { scoreAt } from './tm-match-header.js';

// ── Styles ────────────────────────────────────────────────────────────────────

const TIMELINE_STYLE_ID = 'mp-timeline-style';
const ensureTimelineStyles = () => {
    if (document.getElementById(TIMELINE_STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = TIMELINE_STYLE_ID;
    s.textContent = `
        .tl-wrap {
            max-width: 700px;
            margin: 0 auto;
            padding: 12px 8px;
            box-sizing: border-box;
        }
        .tl-empty {
            text-align: center;
            color: var(--tmu-text-dim);
            font-size: var(--tmu-font-sm);
            padding: 32px 0;
        }
        .tl-row {
            display: grid;
            grid-template-columns: 1fr 44px 1fr;
            align-items: center;
            min-height: 30px;
            margin-bottom: 4px;
        }
        .tl-home-cell {
            text-align: right;
            padding-right: 8px;
        }
        .tl-away-cell {
            text-align: left;
            padding-left: 8px;
        }
        .tl-min-cell {
            text-align: center;
            color: var(--tmu-text-panel-label);
            font-weight: 700;
            font-size: var(--tmu-font-sm);
            background: var(--tmu-accent-fill);
            border-radius: 3px;
            padding: 2px 0;
            flex-shrink: 0;
        }
        .tl-event {
            font-size: var(--tmu-font-sm);
            color: var(--tmu-text-main);
            line-height: 1.4;
        }
        .tl-event-icon {
            margin-right: 3px;
        }
        .tl-name {
            font-weight: 600;
            color: var(--tmu-text-strong);
        }
        .tl-assist {
            font-size: var(--tmu-font-xs);
            color: var(--tmu-text-panel-label);
            margin-left: 3px;
        }
        .tl-score {
            font-size: var(--tmu-font-xs);
            color: var(--tmu-text-live);
            font-weight: 700;
            margin-left: 3px;
        }
        .tl-sub-out {
            font-size: var(--tmu-font-xs);
            color: var(--tmu-text-dim);
        }
        .tl-separator {
            border: none;
            border-top: 1px solid var(--tmu-border-soft);
            margin: 4px 0;
        }
    `;
    document.head.appendChild(s);
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns the player's display last name, falling back to full name or '?'.
 * @param {Map<string,object>} playerMap
 * @param {string|number} pid
 */
const resolveName = (playerMap, pid) => {
    const p = playerMap.get(String(pid));
    return p ? (p.lastname || p.name || '?') : '?';
};

/**
 * Determine if a player belongs to the home team.
 * @param {Set<string>} homePlayerIds
 * @param {string|number} pid
 */
const isHomePid = (homePlayerIds, pid) => homePlayerIds.has(String(pid));

/**
 * Build the HTML for a single key event cell content.
 * Returns null if the event has no key content.
 */
const buildEventHtml = (evt, evtIdx, min, match, playerMap) => {
    const homeIds = match.home.playerIds;
    const results = []; // {isHome, html}

    if (evt.goal) {
        const pid = String(evt.goal.player);
        const { h, a } = scoreAt(match, min, evtIdx);
        const name = resolveName(playerMap, pid);
        const isHome = isHomePid(homeIds, pid);
        const assistPid = evt.goal.assist ? String(evt.goal.assist) : null;
        const assistHtml = assistPid
            ? `<span class="tl-assist">ast. ${resolveName(playerMap, assistPid)}</span>`
            : '';
        const scoreHtml = `<span class="tl-score">${h}–${a}</span>`;
        results.push({
            isHome,
            html: `<span class="tl-event-icon">⚽</span><span class="tl-name">${name}</span>${assistHtml}${scoreHtml}`,
        });
    }

    if (evt.yellow) {
        const pid = String(evt.yellow);
        results.push({
            isHome: isHomePid(homeIds, pid),
            html: `<span class="tl-event-icon">🟨</span><span class="tl-name">${resolveName(playerMap, pid)}</span>`,
        });
    }

    if (evt.yellow_red) {
        const pid = String(evt.yellow_red);
        results.push({
            isHome: isHomePid(homeIds, pid),
            html: `<span class="tl-event-icon">🟥🟨</span><span class="tl-name">${resolveName(playerMap, pid)}</span>`,
        });
    }

    if (evt.red) {
        const pid = String(evt.red);
        results.push({
            isHome: isHomePid(homeIds, pid),
            html: `<span class="tl-event-icon">🟥</span><span class="tl-name">${resolveName(playerMap, pid)}</span>`,
        });
    }

    if (evt.injury) {
        const pid = String(evt.injury);
        results.push({
            isHome: isHomePid(homeIds, pid),
            html: `<span class="tl-event-icon" style="color:var(--tmu-danger);font-weight:800">✚</span><span class="tl-name">${resolveName(playerMap, pid)}</span>`,
        });
    }

    if (evt.sub) {
        const inPid  = String(evt.sub.in  ?? evt.sub.player_in  ?? '');
        const outPid = String(evt.sub.out ?? evt.sub.player_out ?? '');
        if (inPid) {
            const isHome = isHomePid(homeIds, inPid) || (outPid ? isHomePid(homeIds, outPid) : false);
            const inName  = resolveName(playerMap, inPid);
            const outName = outPid ? resolveName(playerMap, outPid) : '';
            const outHtml = outName ? `<br><span class="tl-sub-out">↓${outName}</span>` : '';
            results.push({
                isHome,
                html: `<span class="tl-event-icon">🔄</span><span class="tl-name">↑${inName}</span>${outHtml}`,
            });
        }
    }

    return results;
};

/**
 * Build the full rows HTML for all key events up to (inclusive) `upToMinute`.
 */
const buildTimelineHtml = (match, playerMap, upToMinute) => {
    const sortedMins = Object.keys(match.report || {})
        .map(Number)
        .filter(m => m <= upToMinute)
        .sort((a, b) => a - b);

    let hasAny = false;
    let html = '';

    for (const min of sortedMins) {
        const evts = match.report[String(min)] || [];
        for (let idx = 0; idx < evts.length; idx++) {
            const evt = evts[idx];
            const cells = buildEventHtml(evt, idx, min, match, playerMap);
            if (!cells.length) continue;

            hasAny = true;
            for (const { isHome, html: cellHtml } of cells) {
                html += '<div class="tl-row">';
                html += `<div class="tl-home-cell">${isHome  ? `<div class="tl-event">${cellHtml}</div>` : ''}</div>`;
                html += `<div class="tl-min-cell">${min}'</div>`;
                html += `<div class="tl-away-cell">${!isHome ? `<div class="tl-event">${cellHtml}</div>` : ''}</div>`;
                html += '</div>';
            }

            if (idx < evts.length - 1) {
                html += '<hr class="tl-separator">';
            }
        }
    }

    if (!hasAny) {
        return '<div class="tl-empty">No key events yet.</div>';
    }

    return html;
};

// ── Public API ────────────────────────────────────────────────────────────────

export const TmMatchTimeline = {
    /**
     * Create the timeline component.
     * @param {object} match — normalized match object
     * @param {object|null} initialState — replayState snapshot; null = show all
     * @returns {{ el: HTMLElement, update(replayState): void }}
     */
    create(match, initialState = null) {
        ensureTimelineStyles();

        const playerMap = new Map();
        [...match.home.lineup, ...match.away.lineup].forEach(p => {
            playerMap.set(String(p.id), p);
        });

        const wrap = document.createElement('div');
        wrap.className = 'tl-wrap';

        const upToMinute = initialState != null ? initialState.currentMinute : Infinity;
        wrap.innerHTML = buildTimelineHtml(match, playerMap, upToMinute);

        return {
            el: wrap,
            update(replayState) {
                const min = replayState?.currentMinute ?? Infinity;
                wrap.innerHTML = buildTimelineHtml(match, playerMap, min);
            },
        };
    },
};
