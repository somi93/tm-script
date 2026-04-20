/**
 * tm-match-lineup.js — Lineup panel below the match player
 *
 * Four-column layout: home list | home field (read-only) | away field (read-only) | away list
 *
 * Player list shows: 11 starters (full opacity) → divider → 5 subs (dimmed).
 * On substitution: leaving player becomes dimmed + ↓, entering becomes full + ↑.
 * Tactics fields update accordingly with each minute advance.
 *
 * Usage:
 *   const lineup = TmMatchLineup.create(match);
 *   container.appendChild(lineup.el);
 *   lineup.update(replayState);   // on each tick / minute advance
 */

import { POSITION_MAP } from '../../constants/player.js';
import { TmPlayerRow } from '../shared/tm-player-row.js';
import { TmMatchField } from './tm-match-field.js';
import { TmMatchSquadList } from './tm-match-squad-list.js';

const STYLE_ID = 'mp-lineup-style';

const isStarter = p => !!POSITION_MAP[(p.position || '').toLowerCase()];

// ── Styles ────────────────────────────────────────────────────────────────────

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        .mp-lu {
            display: flex; flex-direction: row; align-items: stretch;
            width: 100%; flex: 0 0 auto;
            border-top: 1px solid var(--tmu-border-soft-alpha);
        }

        /* ── Player columns ── */
        .mp-lu-col {
            flex: 1; min-width: 180px; box-sizing: border-box;
            display: flex; flex-direction: column;
            padding: 10px 6px 12px;
            align-self: flex-start;
            overflow-y: auto; scrollbar-width: none;
        }
        .mp-lu-col::-webkit-scrollbar { display: none; }
        .mp-lu-col-home { border-right: 1px solid var(--tmu-border-soft-alpha); }
        .mp-lu-col-away { border-left:  1px solid var(--tmu-border-soft-alpha); }

        .mp-lu-div {
            height: 1px; background: var(--tmu-border-soft-alpha);
            margin: 5px 2px;
        }

        /* ── Tactics field columns ── */
        .mp-lu-tactics-col {
            flex: 0 0 auto; min-width: 0;
            align-self: stretch;
            aspect-ratio: 2 / 3;
            display: flex; flex-direction: column;
            padding: 10px 0 12px;
        }
        .mp-lu-tactics-col-home {
            align-items: flex-end;
            border-right: 1px solid var(--tmu-border-soft-alpha);
        }
        .mp-lu-tactics-col-away {
            align-items: flex-start;
            border-left: 1px solid var(--tmu-border-soft-alpha);
        }

        /* field fills the entire col */
        .mp-lu-tactics-col .tmtc-field {
            flex: 1; height: 0; width: 100%; aspect-ratio: unset;
        }
        .mp-lu-tactics-col .tmtc-field-spacer {
            flex: 0 0 40px;
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

                for (const a of (clip.actions || [])) {
                    if (a.action === 'subOut') outs.push(String(a.by));
                    else if (a.action === 'subIn') ins.push(String(a.by));
                    else if (a.action === 'positionChange')
                        posChanges.set(String(a.by), (String(a.position || '')).toLowerCase());
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

        const el = document.createElement('div');
        el.className = 'mp-lu';

        const { el: homeCol, playerEls: homeEls } = TmMatchSquadList.create('home', match.home.lineup);
        const { el: awayCol, playerEls: awayEls } = TmMatchSquadList.create('away', match.away.lineup);

        const homePosMap = buildInitialPosMap(match.home.lineup);
        const homeField = TmMatchField.create(homePosMap, match.home.lineup);
        homeField.el.classList.add('mp-lu-tactics-col-home');

        const awayPosMap = buildInitialPosMap(match.away.lineup);
        const awayField = TmMatchField.create(awayPosMap, match.away.lineup);
        awayField.el.classList.add('mp-lu-tactics-col-away');

        el.append(homeCol, homeField.el, awayField.el, awayCol);

        const allPlayersById = new Map([
            ...match.home.lineup.map(p => [String(p.id), p]),
            ...match.away.lineup.map(p => [String(p.id), p]),
        ]);

        const homeStarterSet = new Set(match.home.lineup.filter(isStarter).map(p => String(p.id)));
        const awayStarterSet = new Set(match.away.lineup.filter(isStarter).map(p => String(p.id)));

        let lastMinute = -1;

        function update(replayState) {
            const minute = replayState?.currentMinute ?? 0;
            if (minute === lastMinute) return;
            lastMinute = minute;

            const playerSlot = derivePitchState(match, minute);

            const updateItems = (playerEls, starterSet) => {
                for (const [pid, rowEl] of playerEls) {
                    const onPitch = playerSlot.has(pid);
                    const wasSt = starterSet.has(pid);
                    let state;
                    if (onPitch && !wasSt) state = 'sub-in';
                    else if (!onPitch && wasSt) state = 'off';
                    else if (onPitch) state = 'active';
                    else state = 'bench';
                    TmPlayerRow.setState(rowEl, state);
                }
            };

            updateItems(homeEls, homeStarterSet);
            updateItems(awayEls, awayStarterSet);

            rebuildPosMap(homePosMap, 'home', playerSlot, allPlayersById);
            rebuildPosMap(awayPosMap, 'away', playerSlot, allPlayersById);
            homeField.refresh();
            awayField.refresh();
        }

        // Initial render at minute 0 (all starters on pitch)
        update(null);

        return { el, update };
    },
};
