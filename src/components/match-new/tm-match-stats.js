/**
 * tm-match-stats.js
 *
 * Exports deriveStats(match, replayState) — full team stats:
 * goals, shots, sot, corners, penalties, yellow, red, possession,
 * advanced (attacking styles with events[]), events[].
 *
 * Used by: tm-match-league.js, tm-match-intcup.js, Unity HUD, pages/match.js.
 */

import { ATTACK_STYLES, STYLE_ORDER } from '../../constants/match.js';

// ── Full stat derivation ─────────────────────────────────────────────────────

export const deriveStats = (match, replayState) => {
    const homeClubId = String(match.home.club.id);
    const { committedClipIndex, currentMinute } = replayState;

    const mkAdv = () => {
        const o = {};
        STYLE_ORDER.forEach(s => { o[s] = { a: 0, sh: 0, l: 0, g: 0, events: [] }; });
        return o;
    };
    const acc = {
        home: { goals: 0, shots: 0, sot: 0, yellow: 0, red: 0, penalties: 0, corners: 0, plays: 0, advanced: mkAdv() },
        away: { goals: 0, shots: 0, sot: 0, yellow: 0, red: 0, penalties: 0, corners: 0, plays: 0, advanced: mkAdv() },
    };
    const events = [];
    const allPlayers = [...(match.home.lineup || []), ...(match.away.lineup || [])];
    const nameOf = (pid) => { const p = allPlayers.find(pl => String(pl.id) === pid); return p?.nameLast || p?.name || pid; };

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
                        const sotRevealed = !isCurrent || (ci + 1 <= committedClipIndex);
                        if (action.onTarget && sotRevealed) {
                            acc[aSide].sot++;
                            if (action.goal) {
                                acc[aSide].goals++;
                                events.push({ side: aSide, icon: '⚽', name: nameOf(String(action.by)), min });
                            }
                        }
                        if (action.penalty) acc[aSide].penalties++;
                    } else if (action.action === 'yellow' || action.action === 'yellowRed') {
                        acc[aSide].yellow++;
                        if (action.action === 'yellowRed') acc[aSide].red++;
                        events.push({ side: aSide, icon: action.action === 'yellowRed' ? '🟥' : '🟨', name: nameOf(String(action.by)), min });
                    } else if (action.action === 'red') {
                        acc[aSide].red++;
                        events.push({ side: aSide, icon: '🟥', name: nameOf(String(action.by)), min });
                    }
                }
            }

            if (!isCurrent || playHadClip) {
                acc[side].plays++;
                const styleEntry = ATTACK_STYLES.find(s => s.key === play.style);
                const advLabel = /^p_/.test(play.style) ? 'Penalties' : styleEntry?.label;
                if (advLabel && acc[side].advanced[advLabel]) {
                    const d = acc[side].advanced[advLabel];
                    d.a++;
                    if (play.outcome === 'goal') { d.g++; d.sh++; }
                    else if (play.outcome === 'shot') d.sh++;
                    else d.l++;
                    d.events.push({ min, play });
                }
            }
        }
    }

    const totalPlays = acc.home.plays + acc.away.plays;
    const homePoss = totalPlays ? Math.round(acc.home.plays / totalPlays * 100) : 50;

    return { home: acc.home, away: acc.away, homePoss, awayPoss: 100 - homePoss, events: events.sort((a, b) => a.min - b.min) };
};
