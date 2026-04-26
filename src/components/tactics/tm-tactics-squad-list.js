import { TmTable } from '../shared/tm-table.js';
import { TmConst } from '../../lib/tm-constants.js';
import { TmAlert } from '../shared/tm-alert.js';
import { TmPlayerRow } from '../shared/tm-player-row.js';
import { TmPosition } from '../../lib/tm-position.js';

'use strict';

const { BENCH_SLOTS, POSKEY_TO_ZONE } = TmConst;

/**
 * Mount the squad player list (sidebar table).
 *
 * @param {HTMLElement} container
 * @param {object}      ctx      — shared context from mountTacticsLineup
 * @param {object}      fieldApi — { normalizeZone, renderSlot, setDragging, clearDragVisuals, refresh }
 */
export function mountTacticsSquadList(container, ctx, fieldApi, { compact = false } = {}) {
    const {
        players, players_by_id,
        CLUB_COUNTRY, isForeigner, countSquadForeigners,
        getPlayerSlot, getPlayerAtSlot, setPlayerSlot,
        isFieldSlot, isBenchSlot,
        getOccupiedFieldKeys,
        drag, save,
    } = ctx;

    // ── Sorted player rows ──────────────────────────────────────────────

    function sortedPlayers() {
        const fieldRows = players
            .filter(p => isFieldSlot(getPlayerSlot(p)))
            .sort((a, b) => (TmConst.POSITION_MAP[getPlayerSlot(a)?.toLowerCase()]?.ordering ?? 99) - (TmConst.POSITION_MAP[getPlayerSlot(b)?.toLowerCase()]?.ordering ?? 99));

        const benchRows = BENCH_SLOTS.map(role => {
            const p = getPlayerAtSlot(role);
            return p
                ? { ...p, _isBenchPlaceholder: true, _benchSlotFilled: true, _benchRole: role }
                : { _isBenchPlaceholder: true, _benchSlotFilled: false, _benchRole: role, id: `_bench_${role}`, no: '', name: '', lastname: '' };
        });

        const outRows = players.filter(p => !getPlayerSlot(p));

        if (benchRows.length) benchRows[0]._needsSep = true;
        if (outRows.length) outRows[0]._needsSep = true;
        return [...fieldRows, ...benchRows, ...outRows];
    }

    // ── Squad table ─────────────────────────────────────────────────────

    const stateOf = p => (ctx.stateOf ?? (p => p._isBenchPlaceholder ? 'bench' : isFieldSlot(getPlayerSlot(p)) ? 'active' : 'off'))(p);

    const tblWrap = TmTable.table({
        items: sortedPlayers(),
        density: 'tight',
        sortKey: null,
        rowAttrs: p => {
            if (ctx.readOnly) return p._isBenchPlaceholder
                ? { 'data-bench-role': p._benchRole }
                : { 'data-player-id': p.id };
            if (p._isBenchPlaceholder && p._benchSlotFilled)
                return { draggable: 'true', 'data-player-id': p.id, 'data-bench-role': p._benchRole };
            if (p._isBenchPlaceholder)
                return { 'data-bench-role': p._benchRole };
            return { draggable: 'true', 'data-player-id': p.id };
        },
        rowCls: p => {
            const sep = p._needsSep ? ' tmtc-row-sep' : '';
            if (p._isBenchPlaceholder && p._benchSlotFilled) return 'tmtc-row-on-bench' + sep;
            if (p._isBenchPlaceholder) return 'tmtc-row-bench-placeholder' + sep;
            const slot = getPlayerSlot(p);
            if (isFieldSlot(slot)) return 'tmtc-row-on-field' + sep;
            return 'tmtc-row-out' + sep;
        },
        headers: [
            {
                key: 'name', label: 'Player', sortable: false,
                render: (_, p) => {
                    if (p._isBenchPlaceholder && !p._benchSlotFilled)
                        return '<span data-tpr-empty class="tmtc-pr-empty"><span style="color:var(--tmu-text-disabled);font-style:italic">drop player here</span></span>';
                    const benchAttr = p._benchRole ? ` data-tpr-bench="${p._benchRole}"` : '';
                    return `<span data-tpr-pid="${String(p.id)}" data-tpr-state="${stateOf(p)}"${benchAttr}></span>`;
                },
            },
        ],
        emptyText: 'No players.',
        afterRender: ({ table }) => {
            table.querySelectorAll('tbody [data-tpr-pid]').forEach(placeholder => {
                const pid = placeholder.dataset.tprPid;
                const state = placeholder.dataset.tprState || 'active';
                const benchRole = placeholder.dataset.tprBench || null;
                const player = players_by_id[String(pid)];
                if (!player) return;
                const slot = getPlayerSlot(player);
                const posKey = isFieldSlot(slot) ? slot : null;
                const row = TmPlayerRow.build(player, { posKey, state, compact, showMatchRating: ctx.showMatchRating ?? false });
                if (benchRole) {
                    const num = benchRole.replace('sub', '');
                    const posWrap = row.querySelector('.tm-pr-pos');
                    if (posWrap) posWrap.innerHTML = TmPosition.chip([{ position: `SUB ${num}`, color: 'var(--tmu-text-muted)' }]);
                }
                placeholder.parentNode.replaceChild(row, placeholder);
            });
        },
    });

    container.appendChild(tblWrap);

    if (!ctx.readOnly) {
        // ── Drag: start ─────────────────────────────────────────────────────

        tblWrap.addEventListener('dragstart', e => {
            const tr = e.target.closest('tr[data-player-id]');
            if (!tr || !tblWrap.contains(tr)) return;
            const pid = tr.dataset.playerId;
            if (!pid || pid.startsWith('_bench_')) return;
            const fromRoleKey = tr.dataset.benchRole || null;
            drag.state = { pid, fromType: 'sidebar', fromRoleKey };
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', pid);
            tr.classList.add('tmtc-drag-source');
            const player = players_by_id[pid];
            const playerSlot = player ? getPlayerSlot(player) : null;
            if (isFieldSlot(playerSlot) || getOccupiedFieldKeys().size < 11) fieldApi.setDragging(true);
        });

        // ── Drag: over / leave ──────────────────────────────────────────────

        let _hovRow = null;
        const _setHovRow = tr => {
            if (_hovRow === tr) return;
            if (_hovRow) _hovRow.classList.remove('tmtc-drag-over');
            _hovRow = tr;
            if (tr) tr.classList.add('tmtc-drag-over');
        };
        tblWrap.addEventListener('dragover', e => {
            if (!drag.state) return;
            const tr = e.target.closest('tr[data-bench-role], tr[data-player-id]');
            if (tr) { e.preventDefault(); _setHovRow(tr); }
        });
        tblWrap.addEventListener('dragleave', e => {
            if (_hovRow && !tblWrap.contains(e.relatedTarget)) _setHovRow(null);
        });

        // ── Drag: drop ──────────────────────────────────────────────────────

        tblWrap.addEventListener('drop', async e => {
            _setHovRow(null);
            const benchTr = e.target.closest('tr[data-bench-role]');
            const playerTr = !benchTr && e.target.closest('tr[data-player-id]');
            if (!benchTr && !playerTr) return;
            e.preventDefault();
            fieldApi.clearDragVisuals();
            const ds = drag.state; drag.state = null;
            if (!ds) return;

            const player = players_by_id[ds.pid];
            if (!player) return;

            let targetSlot, targetPlayer;
            if (benchTr) {
                targetSlot = benchTr.dataset.benchRole;
                targetPlayer = getPlayerAtSlot(targetSlot);
            } else {
                targetPlayer = players_by_id[playerTr.dataset.playerId];
                if (!targetPlayer) { refresh(); return; }
                targetSlot = getPlayerSlot(targetPlayer);
                if (!targetSlot) { refresh(); return; } // out-player row, no-op
            }

            if (targetPlayer && String(targetPlayer.id) === ds.pid) { refresh(); return; }

            if (CLUB_COUNTRY) {
                const projected = countSquadForeigners()
                    + (isForeigner(player) && !getPlayerSlot(player) ? 1 : 0)
                    - (targetPlayer && isForeigner(targetPlayer) ? 1 : 0);
                if (projected > 5) {
                    TmAlert.show({ message: 'Foreign player limit is 5 (squad of 16)', tone: 'warning', duration: 3000 });
                    return;
                }
            }

            const sourceSlot = getPlayerSlot(player);
            const changed = {};
            setPlayerSlot(player, targetSlot);
            changed[ds.pid] = targetSlot;
            if (targetPlayer) {
                setPlayerSlot(targetPlayer, sourceSlot);
                changed[String(targetPlayer.id)] = sourceSlot ?? 'out';
            }

            if (isFieldSlot(targetSlot)) {
                fieldApi.normalizeAll(changed);
            } else if (sourceSlot && isFieldSlot(sourceSlot)) {
                fieldApi.normalizeZone(POSKEY_TO_ZONE[sourceSlot], changed);
            }

            ctx.refreshAll();
            await save(changed);
        });
    } // end if (!ctx.readOnly)

    function refresh() {
        tblWrap?.refresh({ items: sortedPlayers() });
    }

    return { refresh };
}
