/**
 * tm-match-stats.js — Live match statistics panel
 *
 * Derives 7 per-team stats from match.plays up to replayState.committedClipIndex.
 *
 * NOTE: committedClipIndex is per-minute (resets to -1 on minute advance).
 *   Past minutes are counted in full; current minute is gated by committedClipIndex.
 *
 * Stats tracked: shots, shots on target, corners, penalties, yellow cards,
 * red cards, and possession (derived from play count per team).
 *
 * Usage:
 *   const stats = TmMatchStats.create(match);
 *   container.appendChild(stats.el);
 *   stats.update(replayState);   // on every tick
 */

const STYLE_ID = 'mp-stats-style';

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        .mp-stats {
            flex: 0 0 220px; min-width: 0;
            display: flex; flex-direction: column;
            overflow-y: auto; overflow-x: hidden;
            scrollbar-width: none;
            padding: 10px 8px; box-sizing: border-box;
            border-left: 1px solid var(--tmu-border-soft-alpha);
        }
        .mp-stats::-webkit-scrollbar { display: none; }

        .mp-stats-heading {
            font-size: 9px; font-weight: 700; letter-spacing: 0.07em;
            text-transform: uppercase; color: var(--tmu-text-muted);
            padding-bottom: 8px; text-align: center;
        }

        .mp-stats-row {
            display: flex; align-items: center; gap: 3px;
            margin-bottom: 7px;
        }
        .mp-stats-num {
            width: 26px; font-size: 13px; font-weight: 700;
            color: var(--tmu-text-main); line-height: 1;
        }
        .mp-stats-num.home { text-align: right; }
        .mp-stats-num.away { text-align: left; }

        .mp-stats-mid {
            flex: 1; display: flex; flex-direction: column;
            align-items: stretch; gap: 3px; min-width: 0;
        }
        .mp-stats-label {
            font-size: 9px; color: var(--tmu-text-muted);
            text-align: center; white-space: nowrap; line-height: 1;
        }
        .mp-stats-bar {
            display: flex; height: 3px; border-radius: 2px; overflow: hidden;
        }
        .mp-stats-bar-h {
            background: var(--tmu-accent);
            transition: flex 0.4s ease;
        }
        .mp-stats-bar-a {
            background: var(--tmu-surface-overlay-strong);
            transition: flex 0.4s ease;
        }

        .mp-stats-row.poss .mp-stats-num {
            font-size: 11px;
        }
    `;
    document.head.appendChild(s);
};

// ── Stat derivation ───────────────────────────────────────────────────────────

// committedClipIndex is per-minute (resets to -1 on each minute advance).
//   Past minutes (min < currentMinute) : fully done, count every clip.
//   Current minute (min === currentMinute): count only clips 0..committedClipIndex.
//   Future minutes: skip.
// match.plays contains ALL plays regardless of key/all mode — mode only controls
// which minutes are animated (replayState.playMinutes), not the data.
export const deriveStats = (match, replayState) => {
    const homeClubId = String(match.home.club.id);
    const { committedClipIndex, currentMinute } = replayState;

    const acc = {
        home: { shots: 0, sot: 0, yellow: 0, red: 0, penalties: 0, corners: 0, plays: 0 },
        away: { shots: 0, sot: 0, yellow: 0, red: 0, penalties: 0, corners: 0, plays: 0 },
    };

    const minuteKeys = Object.keys(match.plays).map(Number).sort((a, b) => a - b);

    for (const min of minuteKeys) {
        if (min > currentMinute) break;
        const isCurrent = (min === currentMinute);
        let ci = -1;
        let minDone = false;

        for (const play of (match.plays[String(min)] || [])) {
            if (minDone) break;
            const side = String(play.team) === homeClubId ? 'home' : 'away';
            let playHadClip = false;

            for (const clip of play.clips) {
                if (isCurrent) {
                    ci++;
                    if (ci > committedClipIndex) { minDone = true; break; }
                }
                playHadClip = true;

                if (/^cornerkick/.test(clip.video)) acc[side].corners++;

                for (const action of clip.actions) {
                    if (!action.by) continue;
                    const aSide = match.home.playerIds?.has(String(action.by)) ? 'home' : 'away';
                    if (action.action === 'shot') {
                        acc[aSide].shots++;
                        // onTarget is visually confirmed by the *next* clip (save* or goal_).
                        // For the current minute: only count sot once that next clip has committed.
                        // For past minutes (!isCurrent): all clips are done, count freely.
                        const sotRevealed = !isCurrent || (ci + 1 <= committedClipIndex);
                        if (action.onTarget && sotRevealed) acc[aSide].sot++;
                        if (action.penalty) acc[aSide].penalties++;
                    } else if (action.action === 'yellow' || action.action === 'yellowRed') {
                        acc[aSide].yellow++;
                        if (action.action === 'yellowRed') acc[aSide].red++;
                    } else if (action.action === 'red') {
                        acc[aSide].red++;
                    }
                }
            }

            if (!isCurrent || playHadClip) acc[side].plays++;
        }
    }

    const totalPlays = acc.home.plays + acc.away.plays;
    const homePoss = totalPlays ? Math.round(acc.home.plays / totalPlays * 100) : 50;

    return { home: acc.home, away: acc.away, homePoss, awayPoss: 100 - homePoss };
};

// ── DOM builder — created once, updated in-place (no flicker) ─────────────────

const STAT_ROWS = [
    { key: 'shots',    label: 'Shots' },
    { key: 'sot',      label: 'On target' },
    { key: 'corners',  label: 'Corners' },
    { key: 'penalties',label: 'Penalties' },
    { key: 'yellow',   label: 'Yellow' },
    { key: 'red',      label: 'Red' },
];

const makeRow = (label, isPoss = false) => {
    const row = document.createElement('div');
    row.className = 'mp-stats-row' + (isPoss ? ' poss' : '');

    const hNum = document.createElement('span');
    hNum.className = 'mp-stats-num home';
    hNum.textContent = '0';

    const mid = document.createElement('div');
    mid.className = 'mp-stats-mid';

    const lbl = document.createElement('div');
    lbl.className = 'mp-stats-label';
    lbl.textContent = label;

    const bar = document.createElement('div');
    bar.className = 'mp-stats-bar';

    const barH = document.createElement('div');
    barH.className = 'mp-stats-bar-h';
    barH.style.flex = '1';

    const barA = document.createElement('div');
    barA.className = 'mp-stats-bar-a';
    barA.style.flex = '1';

    bar.appendChild(barH);
    bar.appendChild(barA);
    mid.appendChild(lbl);
    mid.appendChild(bar);

    const aNum = document.createElement('span');
    aNum.className = 'mp-stats-num away';
    aNum.textContent = '0';

    row.appendChild(hNum);
    row.appendChild(mid);
    row.appendChild(aNum);

    return { row, hNum, aNum, barH, barA };
};

// ── Public factory ────────────────────────────────────────────────────────────

export const TmMatchStats = {
    /**
     * @param {object} match  Normalised match object (home.playerIds must be populated)
     * @returns {{ el: HTMLElement, update(replayState): void }}
     */
    create(match) {
        injectStyles();

        const el = document.createElement('div');
        el.className = 'mp-stats';

        const heading = document.createElement('div');
        heading.className = 'mp-stats-heading';
        heading.textContent = 'Stats';
        el.appendChild(heading);

        // Build stat rows once
        const rowEls = {};
        for (const { key, label } of STAT_ROWS) {
            const r = makeRow(label);
            rowEls[key] = r;
            el.appendChild(r.row);
        }

        // Possession row
        const possR = makeRow('Possession', true);
        possR.hNum.textContent = '50%';
        possR.aNum.textContent = '50%';
        el.appendChild(possR.row);

        const update = (replayState) => {
            const { home, away, homePoss, awayPoss } = deriveStats(match, replayState);

            for (const { key } of STAT_ROWS) {
                const h = home[key], a = away[key];
                const total = h + a || 1;
                const hf = Math.round(h / total * 100);
                rowEls[key].hNum.textContent = String(h);
                rowEls[key].aNum.textContent = String(a);
                rowEls[key].barH.style.flex = String(hf);
                rowEls[key].barA.style.flex = String(100 - hf);
            }

            possR.hNum.textContent = homePoss + '%';
            possR.aNum.textContent = awayPoss + '%';
            possR.barH.style.flex = String(homePoss);
            possR.barA.style.flex = String(awayPoss);
        };

        return { el, update };
    },
};
