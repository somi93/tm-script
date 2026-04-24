import { TmConst } from '../../lib/tm-constants.js';

'use strict';

const { BENCH_SLOTS, SPECIAL_SLOTS } = TmConst;

/**
 * Build the shared tactics context (slot helpers, drag state, change listeners).
 * Does not touch the DOM - just data layer.
 * @param {object} tactics  — mutable tactics state from TmTacticsModel
 * @param {object} opts     — { CLUB_COUNTRY, isForeigner, onSave }
 */
export function createTacticsCtx(tactics, opts = {}) {
    const {
        CLUB_COUNTRY = null,
        isForeigner = () => false,
        onSave = async () => {},
    } = opts;

    const { players, specialRoles } = tactics;
    const players_by_id = Object.fromEntries(players.map(p => [String(p.id), p]));

    const getPlayerSlot    = p => p.positions.find(pos => pos.playing)?.key ?? null;
    const isFieldSlot      = slot => slot != null && TmConst.POSITION_MAP[slot] != null;
    const isBenchSlot      = slot => BENCH_SLOTS.includes(slot);
    const getPlayerAtSlot  = slot => players.find(p => getPlayerSlot(p) === slot) ?? null;
    const getOccupiedFieldKeys = () => new Set(players.map(getPlayerSlot).filter(isFieldSlot));

    function setPlayerSlot(player, newSlot) {
        for (const pos of player.positions) pos.playing = false;
        if (!newSlot) return;
        let pos = player.positions.find(p => p.key === newSlot);
        if (!pos) player.positions.push(pos = { key: newSlot });
        pos.playing = true;
    }

    function countSquadForeigners() {
        return players.filter(p => getPlayerSlot(p) && isForeigner(p)).length;
    }

    const changeListeners = [];
    const notifyChange = () => changeListeners.forEach(fn => fn());
    const drag = { state: null };

    async function save(changed) {
        await onSave(changed);
        notifyChange();
    }

    // refreshAll / rebuildAll / clearDragVisuals are patched by the caller
    // after field + squad are mounted.
    return {
        players, players_by_id, specialRoles,
        CLUB_COUNTRY, isForeigner,
        getPlayerSlot, getPlayerAtSlot, setPlayerSlot,
        isFieldSlot, isBenchSlot,
        getOccupiedFieldKeys, countSquadForeigners,
        drag, changeListeners, notifyChange, save,
        refreshAll:       () => {},
        rebuildAll:       () => {},
        clearDragVisuals: () => {},
    };
}

// == Special roles (captain / corners / penalty / freekick) ================
export function mountTacticsSpecialRoles(target, ctx) {
    const { BENCH_LABELS: ROLE_LABELS } = TmConst;
    const { specialRoles, players_by_id, isBenchSlot, setPlayerSlot, drag, changeListeners } = ctx;

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
                empty.textContent = '\u2014';
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
            ctx.clearDragVisuals();
            if (!ds) return;
            const { pid } = ds;
            if (!players_by_id[pid]) return;
            if (String(specialRoles[role]) === pid) return;
            const prevPid = specialRoles[role] != null ? String(specialRoles[role]) : null;
            const changed = {};
            if (ds.fromType === 'bench' && ds.fromRoleKey && isBenchSlot(ds.fromRoleKey)) {
                const srcPlayer = players_by_id[pid];
                if (srcPlayer) setPlayerSlot(srcPlayer, null);
            }
            if (prevPid) changed[prevPid] = 'out';
            specialRoles[role] = Number(pid);
            changed[pid] = role;
            ctx.refreshAll();
            await ctx.save(changed);
        });

        changeListeners.push(renderSlot);
        target.appendChild(row);
    }
}

// == Batch-apply a full slot assignment (Pick Best 11 / load saved) ========
export async function applyTacticsAssignment(ctx, slotMap) {
    const { players, players_by_id, isFieldSlot, isBenchSlot, getPlayerSlot, setPlayerSlot } = ctx;
    const prevFieldPids = new Set(
        players.filter(p => isFieldSlot(getPlayerSlot(p))).map(p => String(p.id))
    );
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
    ctx.rebuildAll();
    await ctx.save(changed);
}
