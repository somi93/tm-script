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
import { TmConst } from '../../lib/tm-constants.js';
import { TmMatchField }           from './tm-match-field.js';
import { mountTacticsSquadList }  from '../tactics/tm-tactics-squad-list.js';

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

// ── Readonly tactics-squad ctx from a match lineup ────────────────────────────

function makeMatchSquadCtx(lineup) {
    const { BENCH_SLOTS, POSITION_MAP: PM } = TmConst;
    const players = lineup.map(p => ({ ...p, positions: p.positions || [] }));
    const players_by_id = Object.fromEntries(players.map(p => [String(p.id), p]));

    const getPlayerSlot  = p => p.positions.find(pos => pos.playing)?.key ?? null;
    const isFieldSlot    = slot => slot != null && PM[slot] != null;
    const isBenchSlot    = slot => BENCH_SLOTS.includes(slot);
    const getPlayerAtSlot = slot => players.find(p => getPlayerSlot(p) === slot) ?? null;
    const getOccupiedFieldKeys = () => new Set(players.map(getPlayerSlot).filter(isFieldSlot));

    // Seed playing:true from p.position (match slot)
    for (const p of players) {
        const key = (p.position || '').toLowerCase();
        if (PM[key]) {
            for (const pos of p.positions) pos.playing = false;
            let pos = p.positions.find(pos => pos.key === key);
            if (!pos) p.positions.push(pos = { key });
            pos.playing = true;
        }
    }

    return {
        players, players_by_id,
        specialRoles: {},
        CLUB_COUNTRY: null, isForeigner: () => false,
        countSquadForeigners: () => 0,
        getPlayerSlot, getPlayerAtSlot,
        setPlayerSlot: () => {},
        isFieldSlot, isBenchSlot,
        getOccupiedFieldKeys,
        drag: { state: null },
        save: async () => {},
        changeListeners: [],
        notifyChange: () => {},
        refreshAll: () => {},
        readOnly: true,
        stateOf: null,   // set per tick by update()
    };
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

        const starterHomePids = new Set(match.home.lineup.filter(p => POSITION_MAP[(p.position||'').toLowerCase()]).map(p => String(p.id)));
        const starterAwayPids = new Set(match.away.lineup.filter(p => POSITION_MAP[(p.position||'').toLowerCase()]).map(p => String(p.id)));

        const luHomeCtx = makeMatchSquadCtx(match.home.lineup);
        const luAwayCtx = makeMatchSquadCtx(match.away.lineup);

        const luHomeListEl = document.createElement('div');
        luHomeListEl.className = 'mp-lu-col mp-lu-col-home';
        const luAwayListEl = document.createElement('div');
        luAwayListEl.className = 'mp-lu-col mp-lu-col-away';

        const NOOP_FIELD_API = { setDragging: ()=>{}, clearDragVisuals: ()=>{}, normalizeAll: ()=>{}, normalizeZone: ()=>{} };
        const luHomeSquad = mountTacticsSquadList(luHomeListEl, luHomeCtx, NOOP_FIELD_API, { compact: true });
        const luAwaySquad = mountTacticsSquadList(luAwayListEl, luAwayCtx, NOOP_FIELD_API, { compact: true });

        // ── Panels ────────────────────────────────────────────────────
        homePanel.append(homeField.el);
        awayPanel.append(awayField.el);

        const allPlayersById = new Map([
            ...match.home.lineup.map(p => [String(p.id), p]),
            ...match.away.lineup.map(p => [String(p.id), p]),
        ]);

        let lastMinute = -1;

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

            const homePitchPids = new Set([...playerSlot].filter(([, s]) => s.startsWith('home:')).map(([pid]) => pid));
            const awayPitchPids = new Set([...playerSlot].filter(([, s]) => s.startsWith('away:')).map(([pid]) => pid));

            luHomeCtx.stateOf = p => homePitchPids.has(String(p.id))
                ? (starterHomePids.has(String(p.id)) ? 'active' : 'sub-in')
                : (starterHomePids.has(String(p.id)) ? 'off' : 'bench');
            luAwayCtx.stateOf = p => awayPitchPids.has(String(p.id))
                ? (starterAwayPids.has(String(p.id)) ? 'active' : 'sub-in')
                : (starterAwayPids.has(String(p.id)) ? 'off' : 'bench');
            luHomeSquad.refresh();
            luAwaySquad.refresh();
        }

        // Initial render at minute 0 (all starters on pitch)
        update(null);

        return {
            homePanel: { el: homePanel }, awayPanel: { el: awayPanel },
            luHomeListEl, luHomeFieldEl: luHomeField.el,
            luAwayFieldEl: luAwayField.el, luAwayListEl,
            update,
        };
    },
};
