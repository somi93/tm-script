import { TmConst } from '../../lib/tm-constants.js';
import { mountTacticsField } from './tm-tactics-field.js';
import { mountTacticsSquadList } from './tm-tactics-squad-list.js';

'use strict';

const { BENCH_SLOTS, SPECIAL_SLOTS } = TmConst;

/**
 * Mount the full tactics lineup: field (left) + squad list (right).
 * @param {HTMLElement} container
 * @param {object}      tactics  � mutable tactics state from TmTacticsModel
 * @param {object}      opts     � { reserves, national, miniGameId, squadContainer? }
 */
export function mountTacticsLineup(container, tactics, opts = {}) {
    const {
        CLUB_COUNTRY = null, isForeigner = () => false,
        squadContainer = null,
        onSave = async () => {},
    } = opts;
    const { players, specialRoles } = tactics;
    const players_by_id = Object.fromEntries(players.map(p => [String(p.id), p]));

    // == Slot helpers =====================================================
    // A player's current slot is encoded as playing:true on one of their positions.
    // Sub bench slots (sub1�sub5) are virtual positions added to the array.

    const getPlayerSlot = p => p.positions.find(pos => pos.playing)?.key ?? null;
    const isFieldSlot   = slot => slot != null && TmConst.POSITION_MAP[slot] != null;
    const isBenchSlot   = slot => BENCH_SLOTS.includes(slot);
    const getPlayerAtSlot = slot => players.find(p => getPlayerSlot(p) === slot) ?? null;
    const getOccupiedFieldKeys = () => new Set(players.map(getPlayerSlot).filter(isFieldSlot));

    function setPlayerSlot(player, newSlot) {
        for (const pos of player.positions) pos.playing = false;
        if (!newSlot) return;
        let pos = player.positions.find(p => p.key === newSlot);
        if (!pos) player.positions.push(pos = { key: newSlot });
        pos.playing = true;
    }

    // Count foreigners currently occupying any active slot.
    function countSquadForeigners() {
        return players.filter(p => getPlayerSlot(p) && isForeigner(p)).length;
    }

    // == Change listeners + save ==========================================

    const changeListeners = [];
    const notifyChange = () => changeListeners.forEach(fn => fn());
    const drag = { state: null };

    async function save(changed) {
        await onSave(changed);
        notifyChange();
    }

    // == Layout DOM =======================================================

    const layout = document.createElement('div');
    layout.className = 'tmtc-lineup-2col';
    container.appendChild(layout);

    const fieldCol = document.createElement('div');
    fieldCol.className = 'tmtc-field-col';
    layout.appendChild(fieldCol);

    const squadCol = document.createElement('div');
    squadCol.className = 'tmtc-squad-col';
    if (!squadContainer) layout.appendChild(squadCol);

    // == Shared context ===================================================

    const ctx = {
        players, players_by_id, specialRoles,
        CLUB_COUNTRY, isForeigner,
        getPlayerSlot, getPlayerAtSlot, setPlayerSlot,
        isFieldSlot, isBenchSlot,
        getOccupiedFieldKeys, countSquadForeigners,
        drag, changeListeners, notifyChange, save,
        refreshAll: () => {},
    };

    // == Mount components =================================================

    const fieldApi = mountTacticsField(fieldCol, ctx);
    const squadApi = mountTacticsSquadList(squadContainer || squadCol, ctx, fieldApi);
    ctx.refreshAll = () => { fieldApi.refresh(); squadApi.refresh(); };
    ctx.clearDragVisuals = fieldApi.clearDragVisuals;

    // == Special roles (captain / corners / penalty / freekick) ===========
    // Directly reads/writes tactics.specialRoles � no separate assignment state.

    function mountSpecialRoles(target) {
        const { BENCH_LABELS: ROLE_LABELS } = TmConst;
        for (const role of SPECIAL_SLOTS) {
            const row = document.createElement('div');
            row.className = 'tmtc-role-row';
            row.dataset.role = role;

            const lbl = document.createElement('span');
            lbl.className = 'tmtc-role-label';
            lbl.textContent = ROLE_LABELS[role] || role;
            row.appendChild(lbl);

            const slot = document.createElement('div');
            slot.className = 'tmtc-role-slot';
            slot.dataset.role = role;
            row.appendChild(slot);

            const renderSlot = () => {
                const pid = specialRoles[role];
                const p = pid ? players_by_id[String(pid)] : null;
                slot.innerHTML = '';
                if (p) {
                    const chip = document.createElement('span');
                    chip.className = 'tmtc-role-chip';
                    chip.setAttribute('draggable', 'true');
                    chip.dataset.playerId = String(p.id);
                    chip.textContent = p.lastname || p.name || '';
                    chip.addEventListener('dragstart', e => {
                        drag.state = { pid: String(p.id), fromType: 'bench', fromRoleKey: role };
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(p.id));
                        chip.classList.add('tmtc-drag-source');
                    });
                    slot.appendChild(chip);
                } else {
                    const empty = document.createElement('span');
                    empty.className = 'tmtc-role-empty';
                    empty.textContent = '—';
                    slot.appendChild(empty);
                }
            };

            renderSlot();

            let _n = 0;
            slot.addEventListener('dragenter', e => { e.preventDefault(); if (++_n === 1) slot.classList.add('tmtc-drag-over'); });
            slot.addEventListener('dragleave', () => { if (--_n <= 0) { _n = 0; slot.classList.remove('tmtc-drag-over'); } });
            slot.addEventListener('dragover', e => e.preventDefault());
            slot.addEventListener('drop', async e => {
                e.preventDefault();
                _n = 0; slot.classList.remove('tmtc-drag-over');
                const ds = drag.state; drag.state = null;
                fieldApi.clearDragVisuals();
                if (!ds) return;
                const { pid } = ds;
                if (!players_by_id[pid]) return;
                if (String(specialRoles[role]) === pid) return;
                const prevPid = specialRoles[role] != null ? String(specialRoles[role]) : null;
                const changed = {};
                // Player dragged from a bench sub-slot leaves that slot
                if (ds.fromType === 'bench' && ds.fromRoleKey && isBenchSlot(ds.fromRoleKey)) {
                    const srcPlayer = players_by_id[pid];
                    if (srcPlayer) setPlayerSlot(srcPlayer, null);
                }
                if (prevPid) changed[prevPid] = 'out';
                specialRoles[role] = Number(pid);
                changed[pid] = role;
                ctx.refreshAll();
                await save(changed);
            });

            changeListeners.push(renderSlot);
            target.appendChild(row);
        }
    }

    // == Apply assignment (used by panel / Pick Best 11) ==================

    async function applyAssignment(slotMap) {
        const prevFieldPids = new Set(
            players.filter(p => isFieldSlot(getPlayerSlot(p))).map(p => String(p.id))
        );
        // Clear all field and bench slots
        for (const p of players) {
            const slot = getPlayerSlot(p);
            if (slot && (isFieldSlot(slot) || isBenchSlot(slot))) setPlayerSlot(p, null);
        }
        const changed = {};
        for (const [slot, pid] of Object.entries(slotMap)) {
            if (!pid) continue;
            const p = players_by_id[String(pid)];
            if (!p) continue;
            setPlayerSlot(p, slot);
            changed[String(pid)] = slot;
        }
        for (const pid of prevFieldPids) {
            if (!changed[pid]) changed[pid] = 'out';
        }
        fieldApi.rebuild();
        squadApi.refresh();
        await save(changed);
    }

    // == External API =====================================================

    return {
        refresh: ctx.refreshAll,
        applyAssignment,
        getActiveKeys: getOccupiedFieldKeys,
        subscribe: fn => {
            changeListeners.push(fn);
            return () => { const i = changeListeners.indexOf(fn); if (i >= 0) changeListeners.splice(i, 1); };
        },
        mountSpecialRoles,
    };
}