import { TmTable } from '../shared/tm-table.js';
import { TmSectionCard } from '../shared/tm-section-card.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmModal } from '../shared/tm-modal.js';
import { TmButton } from '../shared/tm-button.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { MENTALITY_MAP_LONG, STYLE_MAP } from '../../constants/match.js';
import { TmTacticsModel } from '../../models/tactics.js';

'use strict';

const { escHtml } = TmUtils;

const EVENT_LABELS = { 1: 'Minute', 2: 'Injury', 3: 'Yellow Card', 4: 'Red Card', 5: 'Goal Scored' };
const CONDITION_LABELS = { 1: 'Winning', 2: 'Draw', 3: 'Losing', 4: 'Any' };
const ORDER_LABELS = { 1: 'Substitution', 2: 'Change Mentality', 3: 'Change Style', 4: 'Change Position' };

const POSITIONS = ['GK', 'DC', 'DCL', 'DCR', 'DL', 'DR', 'DMC', 'DMCL', 'DMCR', 'DML', 'DMR', 'MC', 'MCL', 'MCR', 'ML', 'MR', 'OMC', 'OMCL', 'OMCR', 'OML', 'OMR', 'FC', 'FCL', 'FCR'];
const SUB_ROLES = ['sub1', 'sub2', 'sub3', 'sub4', 'sub5'];

function actionCell(typeLabel, value) {
    if (!typeLabel) return '<span style="color:var(--tmu-text-disabled)">—</span>';
    return `<div class="tmtc-order-action-cell">
        <span class="tmtc-order-action-type">${escHtml(typeLabel)}</span>
        ${value ? `<span class="tmtc-order-action-val">${escHtml(String(value))}</span>` : ''}
    </div>`;
}

function eventPar(eventId, parVal, players_by_id) {
    if (Number(eventId) === 1) return parVal ? `${parVal}'` : '';
    if (Number(eventId) === 5) return '';
    const p = players_by_id?.[parVal];
    return p ? (p.lastname || p.name || String(parVal)) : (parVal ? 'Any Player' : '');
}

function orderPar(orderId, par1, par2, par3, players_by_id) {
    if (Number(orderId) === 2) return MENTALITY_MAP_LONG[Number(par1)] || (par1 ? String(par1) : '');
    if (Number(orderId) === 3) return STYLE_MAP[Number(par1)] || (par1 ? String(par1) : '');
    const parts = [];
    // Substitution: show incoming (par2) → outgoing (par1)
    const p2 = players_by_id?.[par2];
    if (p2) parts.push(p2.lastname || p2.name || '');
    const p1 = players_by_id?.[par1];
    if (p1) parts.push('\u2192 ' + (p1.lastname || p1.name || ''));
    if (par3) parts.push(String(par3).toUpperCase());
    return parts.join(' ');
}

// --- Dialog ---

function showOrderDialog(co, data, opts, onSaved) {
    const { reserves, national, miniGameId } = opts;
    const players_by_id = data.players_by_id
        || Object.fromEntries((data.players || []).map(p => [String(p.id), p]));
    const formation_assoc = data.formation_assoc || {};
    const POSITION_KEYS_LC = new Set(POSITIONS.map(p => p.toLowerCase()));
    const NON_POS_KEYS = new Set([...SUB_ROLES, 'captain', 'corner', 'penalty', 'freekick']);
    const formation_by_pos = data.formation_by_pos
        || Object.fromEntries(
            Object.entries(formation_assoc)
                .filter(([k]) => !NON_POS_KEYS.has(k) && POSITION_KEYS_LC.has(k.toLowerCase()))
        );
    const activePositions = [...new Set(Object.keys(formation_by_pos)
        .map(pos => String(pos || '').toUpperCase())
        .filter(pos => POSITIONS.includes(pos)))];
    const positionOptions = activePositions.length
        ? activePositions.sort((a, b) => POSITIONS.indexOf(a) - POSITIONS.indexOf(b))
        : POSITIONS;

    const fieldPlayers = Object.values(formation_by_pos)
        .filter(Boolean).map(String)
        .map(pid => players_by_id[pid]).filter(Boolean);

    const benchPlayers = SUB_ROLES
        .map(r => formation_assoc[r]).filter(Boolean).map(String)
        .map(pid => players_by_id[pid]).filter(Boolean);

    const state = {
        COND_ORDER_NUM: co.COND_ORDER_NUM,
        EVENT_ID: Number(co.EVENT_ID) || 0,
        EVENT_PAR: co.EVENT_PAR || 0,
        COND_ID: Number(co.COND_ID) || 0,
        COND_PAR: co.COND_PAR || 0,
        ORDER_ID: Number(co.ORDER_ID) || 0,
        ORDER_PAR1: co.ORDER_PAR1 || 0,
        ORDER_PAR2: co.ORDER_PAR2 || 0,
        ORDER_PAR3: co.ORDER_PAR3 || '',
    };

    const getFieldPositionForPlayer = pid => Object.entries(formation_by_pos)
        .find(([, playerId]) => String(playerId) === String(pid))?.[0]?.toUpperCase() || '';

    let destroy;

    function pickBtn(label, isActive, onPick, container) {
        const btn = TmButton.button({
            label: String(label), color: 'primary', size: 'xs', active: isActive,
            onClick: () => {
                container.querySelectorAll('.tmu-btn').forEach(b => b.classList.remove('tmu-btn-active'));
                btn.classList.add('tmu-btn-active');
                onPick();
            },
        });
        return btn;
    }

    function chipGroup(map, getKey, onPick) {
        const el = document.createElement('div');
        el.className = 'tmtc-co-chips';
        for (const [id, label] of Object.entries(map)) {
            el.appendChild(pickBtn(label, getKey() === Number(id), () => onPick(Number(id)), el));
        }
        return el;
    }

    function playerGroup(players, getCurrent, onPick, allowAny = false) {
        const el = document.createElement('div');
        el.className = 'tmtc-co-chips';
        const mkBtn = (label, pid) => el.appendChild(pickBtn(label, getCurrent() == pid, () => onPick(pid), el));
        if (allowAny) mkBtn('Any Player', 0);
        players.forEach(p => mkBtn(p.lastname || p.name || p.id, p.id));
        return el;
    }

    function positionGroup(getCurrent, onPick, options = positionOptions) {
        const el = document.createElement('div');
        el.className = 'tmtc-co-chips';
        options.forEach(pos => el.appendChild(
            pickBtn(pos, String(getCurrent()).toUpperCase() === pos.toUpperCase(), () => onPick(pos.toUpperCase()), el)
        ));
        return el;
    }

    function minuteGroup() {
        const el = document.createElement('div');
        el.className = 'tmtc-co-chips';
        for (let m = 5; m <= 120; m += 5) {
            el.appendChild(pickBtn(`${m}'`, state.EVENT_PAR == m, () => { state.EVENT_PAR = m; }, el));
        }
        return el;
    }

    function goalDiffGroup(getCurrent, onPick) {
        const el = document.createElement('div');
        el.className = 'tmtc-co-chips';
        for (let g = 1; g <= 5; g++) {
            el.appendChild(pickBtn(g, getCurrent() == g, () => onPick(g), el));
        }
        return el;
    }

    function lbl(text) {
        const el = document.createElement('div');
        el.className = 'tmtc-co-param-label';
        el.textContent = text;
        return el;
    }

    function renderOrderSub(id) {
        if (id === 1) {
            const w = document.createElement('div');
            w.appendChild(lbl('Player out:'));
            w.appendChild(playerGroup(fieldPlayers, () => state.ORDER_PAR1, v => {
                state.ORDER_PAR1 = v;
                if (!state.ORDER_PAR3) state.ORDER_PAR3 = getFieldPositionForPlayer(v);
            }));
            w.appendChild(lbl('Player in:'));
            w.appendChild(playerGroup(benchPlayers, () => state.ORDER_PAR2, v => { state.ORDER_PAR2 = v; }));
            w.appendChild(lbl('Position:'));
            w.appendChild(positionGroup(() => state.ORDER_PAR3, v => { state.ORDER_PAR3 = v; }));
            return w;
        }
        if (id === 2) return chipGroup(MENTALITY_MAP_LONG, () => state.ORDER_PAR1, v => { state.ORDER_PAR1 = v; });
        if (id === 3) return chipGroup(STYLE_MAP, () => state.ORDER_PAR1, v => { state.ORDER_PAR1 = v; });
        if (id === 4) {
            const w = document.createElement('div');
            w.appendChild(lbl('Player:'));
            w.appendChild(playerGroup(fieldPlayers, () => state.ORDER_PAR1, v => { state.ORDER_PAR1 = v; }));
            w.appendChild(lbl('New position:'));
            w.appendChild(positionGroup(() => state.ORDER_PAR3, v => { state.ORDER_PAR3 = v; }, POSITIONS));
            return w;
        }
        return null;
    }

    function radioSection(header, map, getVal, onSelect, buildSub) {
        const col = document.createElement('div');
        col.className = 'tmtc-co-col';
        col.appendChild(Object.assign(document.createElement('div'), { className: 'tmtc-co-col-label', textContent: header }));

        const groupName = 'tmtc-co-rg-' + Math.random().toString(36).slice(2);
        const entries = Object.entries(map);
        const itemEls = [];

        for (const [id, label] of entries) {
            const numId = Number(id);
            const isSelected = getVal() === numId;

            const item = document.createElement('div');
            item.className = 'tmtc-co-radio-item' + (isSelected ? ' selected' : '');

            const lbl = document.createElement('label');
            lbl.className = 'tmtc-co-radio-row';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = groupName;
            radio.className = 'tmtc-co-radio-input';
            radio.checked = isSelected;
            lbl.appendChild(radio);
            lbl.appendChild(Object.assign(document.createElement('span'), { className: 'tmtc-co-radio-txt', textContent: label }));
            item.appendChild(lbl);

            const sub = document.createElement('div');
            sub.className = 'tmtc-co-radio-sub';
            if (isSelected) {
                const built = buildSub(numId);
                if (built) sub.appendChild(built);
            }
            item.appendChild(sub);

            radio.addEventListener('change', () => {
                if (!radio.checked) return;
                onSelect(numId);
                itemEls.forEach((el, i) => {
                    const isNow = Number(entries[i][0]) === numId;
                    el.classList.toggle('selected', isNow);
                    const elSub = el.querySelector('.tmtc-co-radio-sub');
                    elSub.innerHTML = '';
                    if (isNow) {
                        const built = buildSub(numId);
                        if (built) elSub.appendChild(built);
                    }
                });
            });

            col.appendChild(item);
            itemEls.push(item);
        }
        return col;
    }

    function render() {
        const content = document.createElement('div');

        const body = document.createElement('div');
        body.className = 'tmtc-co-dialog-body';

        // WHEN
        body.appendChild(radioSection('When', EVENT_LABELS,
            () => state.EVENT_ID,
            v => { state.EVENT_ID = v; state.EVENT_PAR = 0; },
            id => {
                if (id === 1) {
                    const w = document.createElement('div');
                    w.appendChild(lbl('Minute:'));
                    w.appendChild(minuteGroup());
                    return w;
                }
                if (id === 2 || id === 3 || id === 4) {
                    const w = document.createElement('div');
                    w.appendChild(lbl('Player:'));
                    w.appendChild(playerGroup(fieldPlayers, () => state.EVENT_PAR, v => { state.EVENT_PAR = v; }, true));
                    return w;
                }
                return null;
            }
        ));

        // IF SCORE IS
        body.appendChild(radioSection('If score is', CONDITION_LABELS,
            () => state.COND_ID,
            v => { state.COND_ID = v; state.COND_PAR = 0; },
            id => {
                if (id === 1) {
                    const w = document.createElement('div');
                    w.appendChild(lbl('Winning by:'));
                    w.appendChild(goalDiffGroup(() => state.COND_PAR, v => { state.COND_PAR = v; }));
                    return w;
                }
                if (id === 3) {
                    const w = document.createElement('div');
                    w.appendChild(lbl('Losing by:'));
                    w.appendChild(goalDiffGroup(() => state.COND_PAR, v => { state.COND_PAR = v; }));
                    return w;
                }
                return null;
            }
        ));

        // THEN
        body.appendChild(radioSection('Then', ORDER_LABELS,
            () => state.ORDER_ID,
            v => { state.ORDER_ID = v; state.ORDER_PAR1 = 0; state.ORDER_PAR2 = 0; state.ORDER_PAR3 = ''; },
            renderOrderSub
        ));

        content.appendChild(body);

        const footer = document.createElement('div');
        footer.className = 'tmtc-co-modal-footer';
        footer.appendChild(TmButton.button({ label: 'Save', color: 'primary', size: 'sm', onClick: save }));
        footer.appendChild(TmButton.button({
            label: 'Clear', color: 'danger', size: 'sm',
            onClick: () => {
                state.EVENT_ID = 0; state.EVENT_PAR = 0;
                state.COND_ID = 0; state.COND_PAR = 0;
                state.ORDER_ID = 0; state.ORDER_PAR1 = 0; state.ORDER_PAR2 = 0; state.ORDER_PAR3 = '';
                save();
            },
        }));
        content.appendChild(footer);

        const handle = TmModal.open({
            title: `Conditional Order #${Number(co.COND_ORDER_NUM) + 1}`,
            contentEl: content,
            maxWidth: 'min(900px, 96vw)',
        });
        destroy = handle.destroy;
    }

    async function save() {
        const orderPar3 = state.ORDER_ID === 1 && !state.ORDER_PAR3
            ? getFieldPositionForPlayer(state.ORDER_PAR1)
            : state.ORDER_PAR3;
        const coData = {
            ...co,
            COND_ORDER_NUM: state.COND_ORDER_NUM,
            EVENT_ID: state.EVENT_ID || 0,
            EVENT_PAR: state.EVENT_PAR || 0,
            COND_ID: state.COND_ID || 0,
            COND_PAR: state.COND_PAR || 0,
            ORDER_ID: state.ORDER_ID || 0,
            ORDER_PAR1: state.ORDER_PAR1 || 0,
            ORDER_PAR2: state.ORDER_PAR2 || 0,
            ORDER_PAR3: orderPar3 || 0,
        };
        try {
            await TmTacticsModel.saveCondOrder(coData, reserves, national, miniGameId);
        } catch (e) {
            console.error('[tactics] co save failed', e);
        }
        destroy();
        onSaved?.();
    }

    render();
}

// --- Mount ---

export async function mountTacticsOrders(container, data, opts = {}) {
    const { reserves = 0, national = 0, miniGameId = 0 } = opts;
    const players_by_id = Object.fromEntries((data.players || []).map(p => [String(p.id), p]));

    const refs = TmSectionCard.mount(container, {
        flush: true,
        cardVariant: 'soft',
    });
    const body = refs.body;

    body.innerHTML = TmUI.loading();

    if (!window.jQuery) { body.innerHTML = TmUI.error('jQuery not available.'); return; }

    const load = async () => {
        body.innerHTML = '';

        const raw = await TmTacticsModel.fetchCondOrders(reserves, national, miniGameId);

        if (!raw) { body.innerHTML = TmUI.error('Could not load conditional orders.'); return; }

        const items = Object.values(raw).map(co => {
            const eventId = Number(co.EVENT_ID);
            const condId = Number(co.COND_ID);
            const ordId = Number(co.ORDER_ID);
            return {
                num: Number(co.COND_ORDER_NUM) + 1,
                _raw: co,
                event: EVENT_LABELS[eventId] || '',
                eventPar: eventPar(eventId, co.EVENT_PAR, players_by_id),
                condition: CONDITION_LABELS[condId] || '',
                condPar: co.COND_PAR ? String(co.COND_PAR) : '',
                order: ORDER_LABELS[ordId] || '',
                orderPar: orderPar(ordId, co.ORDER_PAR1, co.ORDER_PAR2, co.ORDER_PAR3, players_by_id),
                _empty: !eventId && !condId && !ordId,
            };
        });

        const tbl = TmTable.table({
            items,
            sortKey: 'num',
            sortDir: 1,
            density: 'tight',
            rowCls: o => o._empty ? 'tmtc-co-row-empty' : '',
            onRowClick: o => showOrderDialog(o._raw, data, { reserves, national, miniGameId }, load),
            headers: [
                { key: 'num', label: '#', align: 'c', width: '28px', sortable: false },
                { key: 'event', label: 'Event', sortable: false, render: (v, o) => actionCell(v, o.eventPar) },
                { key: 'condition', label: 'Score', sortable: false, render: (v, o) => actionCell(v, o.condPar) },
                { key: 'order', label: 'Order', sortable: false, render: (v, o) => actionCell(v, o.orderPar) },
                {
                    key: '_del', label: '', width: '32px', align: 'c', sortable: false,
                    render: (v, o) => o._empty ? '' : '<span class="tmtc-co-del-btn" title="Clear">×</span>',
                },
            ],
        });

        body.appendChild(tbl);

        // --- Delete buttons ---
        tbl.querySelectorAll('.tmtc-co-del-btn').forEach(btn => {
            const tr = btn.closest('tr[data-ri]');
            if (!tr) return;
            const item = items[Number(tr.dataset.ri)];
            if (!item || item._empty) return;
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const tr = btn.closest('tr');
                if (tr) {
                    // reset cells to empty state visually
                    tr.querySelectorAll('td:not(:first-child):not(:last-child)').forEach(td => { td.innerHTML = ''; });
                    tr.classList.add('tmtc-co-row-empty');
                    btn.remove();
                }
                TmTacticsModel.deleteCondOrder(item._raw.COND_ORDER_NUM, reserves, national, miniGameId)
                    .catch(err => console.error('[tactics] co delete failed', err));
            });
        });

        // --- Drag-and-drop reorder ---
        let dragSrcNum = null;
        const rows = tbl.querySelectorAll('tbody tr[data-ri]');
        rows.forEach(tr => {
            const idx = Number(tr.dataset.ri);
            const item = items[idx];
            if (!item) return;
            tr.draggable = true;
            tr.addEventListener('dragstart', e => {
                dragSrcNum = item._raw.COND_ORDER_NUM;
                e.dataTransfer.effectAllowed = 'move';
                tr.classList.add('tmtc-co-row-dragging');
            });
            tr.addEventListener('dragend', () => {
                tr.classList.remove('tmtc-co-row-dragging');
                rows.forEach(r => r.classList.remove('tmtc-co-row-drag-over'));
            });
            tr.addEventListener('dragover', e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                rows.forEach(r => r.classList.remove('tmtc-co-row-drag-over'));
                tr.classList.add('tmtc-co-row-drag-over');
            });
            tr.addEventListener('dragleave', () => tr.classList.remove('tmtc-co-row-drag-over'));
            tr.addEventListener('drop', async e => {
                e.preventDefault();
                tr.classList.remove('tmtc-co-row-drag-over');
                const dropNum = item._raw.COND_ORDER_NUM;
                if (dragSrcNum == null || dragSrcNum === dropNum) return;

                const srcRaw = items.find(i => i._raw.COND_ORDER_NUM === dragSrcNum)?._raw;
                const dstRaw = item._raw;
                if (!srcRaw) return;

                body.innerHTML = TmUI.loading();

                const postOrder = (raw, newNum) => TmTacticsModel.saveCondOrder(
                    { ...raw, COND_ORDER_NUM: newNum }, reserves, national, miniGameId
                );
                try {
                    await Promise.all([postOrder(srcRaw, dropNum), postOrder(dstRaw, dragSrcNum)]);
                } catch (err) {
                    console.error('[tactics] co swap failed', err);
                }
                await load();
            });
        });
    };

    await load();
}
