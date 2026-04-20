/**
 * tm-match-lineup.js — Home and away side panels for the match page.
 *
 * Returns { homePanel, awayPanel, update }.
 * Home panel: tactics field (top) + squad list (bottom).
 * Away panel: squad list (top) + tactics field (bottom).
 * Fields are adjacent to the center canvas when assembled in the page.
 *
 * Player list: 11 starters (full opacity) → divider → 5 subs (dimmed).
 * On substitution: leaving player becomes dimmed + ↓, entering becomes full + ↑.
 * Tactics fields update accordingly with each minute advance.
 *
 * Usage:
 *   const lineup = TmMatchLineup.create(match);
 *   body.append(lineup.homePanel.el, center, lineup.awayPanel.el);
 *   lineup.update(replayState);   // on each tick / minute advance
 */

import { POSITION_MAP } from '../../constants/player.js';
import { TmMatchField }     from './tm-match-field.js';
import { TmMatchSquadList } from './tm-match-squad-list.js';
import { TmPlayerRow }      from '../shared/tm-player-row.js';

const STYLE_ID = 'mp-lineup-style';

// ── Styles ────────────────────────────────────────────────────────────────────────────────────────────

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        /* ── Side panels ── */
        .mp-lu-side {
            flex: 0 0 450px; min-width: 0; min-height: 0;
            display: flex; flex-direction: column;
            overflow: hidden; padding: 2px;
        }

        /* field: width-driven, height follows aspect-ratio */
        .mp-lu-side .mp-lu-tactics-col {
            flex: 0 0 auto; width: 100%;
            align-self: auto; aspect-ratio: unset;
            display: flex; flex-direction: column;
            padding: 0;
        }
        .mp-lu-side .mp-lu-tactics-col .tmtc-field {
            flex: 0 0 auto; height: auto; width: 100%; aspect-ratio: 2 / 3;
        }
        .mp-lu-side .mp-lu-tactics-col .tmtc-field-spacer {
            flex: 0 0 32px;
        }
        /* ── Tactic footer below field ── */ /* removed */

        /* ── Squad list columns (lineups tab) ── */
        .mp-lu-col {
            flex: 1 1 0; min-width: 0;
            display: flex; flex-direction: column;
            overflow-y: auto; padding: 0 4px;
        }

        /* ── Lineups tab wrap ── */
        .mp-lu-tab-wrap {
            height: 100%;
        }
        .mp-lu-tab-wrap .mp-lu-tactics-col {
            flex: 0 0 auto;
            height: 100%;
            width: auto;
            aspect-ratio: 2 / 3;
        }
        .mp-lu-tab-wrap .mp-lu-tactics-col .tmtc-field {
            height: 100%;
            width: auto;
            aspect-ratio: 2 / 3;
        }
    `;
    document.head.appendChild(s);
}

// ── Pitch state derivation ────────────────────────────────────────────────────
// Returns Map<pid, 'side:posKey'> representing who is currently on the pitch.

function derivePitchState(match, currentMinute) {
    const playerSlot = new Map();  // pid → 'side:posKey'
    const slotPlayer = new Map();  // 'side:posKey' → pid

    for (const side of ['home', 'away']) {
        for (const p of match[side].lineup) {
            const pos = (p.position || '').toLowerCase();
            if (!POSITION_MAP[pos]) continue;
            const fk = `${side}:${pos}`;
            playerSlot.set(String(p.id), fk);
            slotPlayer.set(fk, String(p.id));
        }
    }

    const homePids = new Set(match.home.lineup.map(p => String(p.id)));

    for (const min of Object.keys(match.plays).map(Number).sort((a, b) => a - b)) {
        if (min > currentMinute) break;
        for (const play of match.plays[String(min)]) {
            for (const clip of (play.clips || [])) {
                const outs = [], ins = [];
                const posChanges = new Map();
                const injured = [];

                for (const a of (clip.actions || [])) {
                    if (a.action === 'subOut') outs.push(String(a.by));
                    else if (a.action === 'subIn') ins.push(String(a.by));
                    else if (a.action === 'injury') injured.push(String(a.by));
                    else if (a.action === 'positionChange')
                        posChanges.set(String(a.by), (String(a.position || '')).toLowerCase());
                }

                // If injured player is not already subbed out in this clip, remove them
                for (const pid of injured) {
                    if (!outs.includes(pid)) {
                        const slot = playerSlot.get(pid);
                        if (slot) slotPlayer.delete(slot);
                        playerSlot.delete(pid);
                    }
                }

                for (let i = 0; i < outs.length; i++) {
                    const outId = outs[i];
                    const inId = ins[i];
                    const outSlot = playerSlot.get(outId);
                    if (outSlot) slotPlayer.delete(outSlot);
                    playerSlot.delete(outId);

                    if (inId) {
                        let inSlot = outSlot;
                        const newPos = posChanges.get(inId);
                        if (newPos && POSITION_MAP[newPos]) {
                            const inSide = homePids.has(inId) ? 'home' : 'away';
                            inSlot = `${inSide}:${newPos}`;
                        }
                        if (inSlot) {
                            slotPlayer.set(inSlot, inId);
                            playerSlot.set(inId, inSlot);
                        }
                    }
                }
            }
        }
    }

    return playerSlot;
}


// ── Helpers ───────────────────────────────────────────────────────────────────

function buildInitialPosMap(lineup) {
    const map = {};
    for (const p of lineup) {
        const key = (p.position || '').toLowerCase();
        if (POSITION_MAP[key]) map[key] = p;
    }
    return map;
}

function rebuildPosMap(map, side, playerSlot, allPlayersById) {
    for (const k of Object.keys(map)) delete map[k];
    for (const [pid, slot] of playerSlot) {
        if (!slot.startsWith(side + ':')) continue;
        const pk = slot.slice(side.length + 1);
        if (!POSITION_MAP[pk]) continue;
        const p = allPlayersById.get(pid);
        if (p) map[pk] = p;
    }
}

// ── Export ────────────────────────────────────────────────────────────────────

export const TmMatchLineup = {
    create(match) {
        injectStyles();

        // Home side panel: field (top) → squad (bottom)
        const homePanel = document.createElement('div');
        homePanel.className = 'mp-lu-side mp-lu-side-home';

        // Away side panel: squad (top) → field (bottom)
        const awayPanel = document.createElement('div');
        awayPanel.className = 'mp-lu-side mp-lu-side-away';

        const homePosMap = buildInitialPosMap(match.home.lineup);
        const homeField = TmMatchField.create(homePosMap, match.home.lineup);

        const awayPosMap = buildInitialPosMap(match.away.lineup);
        const awayField = TmMatchField.create(awayPosMap, match.away.lineup);

        // ── Lineups-tab instances (separate DOM, shared posMap) ───────
        const luHomeField = TmMatchField.create(homePosMap, match.home.lineup);
        const luAwayField = TmMatchField.create(awayPosMap, match.away.lineup);
        const luHomeList  = TmMatchSquadList.create('home', match.home.lineup);
        const luAwayList  = TmMatchSquadList.create('away', match.away.lineup);

        const starterHomePids = new Set(match.home.lineup.filter(p => POSITION_MAP[(p.position||'').toLowerCase()]).map(p => String(p.id)));
        const starterAwayPids = new Set(match.away.lineup.filter(p => POSITION_MAP[(p.position||'').toLowerCase()]).map(p => String(p.id)));

        // ── Panels ────────────────────────────────────────────────────
        homePanel.append(homeField.el);
        awayPanel.append(awayField.el);

        const allPlayersById = new Map([
            ...match.home.lineup.map(p => [String(p.id), p]),
            ...match.away.lineup.map(p => [String(p.id), p]),
        ]);

        let lastMinute = -1;

        function deriveLiveMentality(side, upToMinute) {
            const clubId = String(match[side].club.id);
            let mentality = match[side].tactics.mentality ?? 4;
            for (const min of Object.keys(match.plays).map(Number).sort((a, b) => a - b)) {
                if (min > upToMinute) break;
                for (const play of match.plays[String(min)]) {
                    for (const clip of (play.clips || [])) {
                        for (const act of (clip.actions || [])) {
                            if (act.action === 'mentality_change' && String(act.team) === clubId)
                                mentality = act.mentality;
                        }
                    }
                }
            }
            return mentality;
        }
        void deriveLiveMentality; // kept for future use

        function update(replayState) {
            const minute = replayState?.currentMinute ?? 0;
            if (minute === lastMinute) return;
            lastMinute = minute;

            const playerSlot = derivePitchState(match, minute);

            rebuildPosMap(homePosMap, 'home', playerSlot, allPlayersById);
            rebuildPosMap(awayPosMap, 'away', playerSlot, allPlayersById);
            homeField.refresh();
            awayField.refresh();
            luHomeField.refresh();
            luAwayField.refresh();

            const applyStates = (playerEls, starterPids) => {
                for (const [pid, el] of playerEls) {
                    TmPlayerRow.setState(el, playerSlot.has(pid)
                        ? (starterPids.has(pid) ? 'active' : 'sub-in')
                        : (starterPids.has(pid) ? 'off'    : 'bench'));
                }
            };
            applyStates(luHomeList.playerEls, starterHomePids);
            applyStates(luAwayList.playerEls, starterAwayPids);
        }

        // Initial render at minute 0 (all starters on pitch)
        update(null);

        return {
            homePanel: { el: homePanel }, awayPanel: { el: awayPanel },
            luHomeListEl: luHomeList.el, luHomeFieldEl: luHomeField.el,
            luAwayFieldEl: luAwayField.el, luAwayListEl: luAwayList.el,
            update,
        };
    },
};
