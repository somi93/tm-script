import { TmPosition } from '../../lib/tm-position.js';
import { TmTable } from '../shared/tm-table.js';
import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';

'use strict';

// Lines ordered FWD → GK so GK renders at the bottom (field top = attack)
const LINES = [
    { key: 'fwd', label: 'FWD', from: 21, to: 23 },
    { key: 'om',  label: 'OM',  from: 16, to: 20 },
    { key: 'mid', label: 'MID', from: 11, to: 15 },
    { key: 'dm',  label: 'DM',  from: 6,  to: 10 },
    { key: 'def', label: 'DEF', from: 1,  to: 5  },
    { key: 'gk',  label: 'GK',  from: 0,  to: 0  },
];

const SUB_ROLES     = ['sub1', 'sub2', 'sub3', 'sub4', 'sub5'];
const SPECIAL_ROLES = ['captain', 'corner', 'penalty', 'freekick'];
const BENCH_ROLES   = [...SUB_ROLES, ...SPECIAL_ROLES];
const BENCH_LABELS  = {
    sub1: 'GK', sub2: 'DEF', sub3: 'MID', sub4: 'Wing', sub5: 'FWD',
    captain: 'Captain', corner: 'Corner', penalty: 'Penalty', freekick: 'Free Kick',
};

// Symmetric target rank indices for a sub-group of `total` slots with `count` occupied.
// Rule: 1→center, 2→CL+CR (skip center), 3→CL+C+CR, 4→L+CL+CR+R, 5→all.
function getTargetRanks(total, count) {
    if (count <= 0) return [];
    if (count >= total) return Array.from({ length: total }, (_, i) => i);
    const c = Math.floor((total - 1) / 2); // center index
    const result = [];
    if (count % 2 === 1) result.push(c);  // odd count: include center
    for (let r = 1; result.length < count; r++) {
        if (c - r >= 0) result.push(c - r);
        if (result.length < count && c + r < total) result.push(c + r);
    }
    return result.sort((a, b) => a - b);
}

// Map a field position index back to its line key in LINES.
function lineKeyForPosIndex(posIndex) {
    if (posIndex == null) return null;
    return LINES.find(l => posIndex >= l.from && posIndex <= l.to)?.key || null;
}

// Visual column placement for 5-column pitch grid.
// Returns an array of visual col indices (0=L, 1=CL, 2=C, 3=CR, 4=R)
// for the N active positions in a row.
function getVisualCols(count, rowKey) {
    if (rowKey === 'gk') return [2]; // GK always center
    if (rowKey === 'fwd') {
        // FWD never L(0) or R(4) — only CL, C, CR
        return ([undefined, [2], [1, 3], [1, 2, 3]][count]) || [1, 2, 3];
    }
    // D, DM, M, OM: 1→C  2→CL+CR  3→CL+C+CR  4→L+CL+CR+R  5→all
    const maps = [undefined, [2], [1, 3], [1, 2, 3], [0, 1, 3, 4], [0, 1, 2, 3, 4]];
    return maps[count] || [0, 1, 2, 3, 4];
}

const escHtml = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const recStars = r => { const n = Math.min(Math.round(Number(r) || 0), 5); return n ? '★'.repeat(n) : ''; };
const gc = TmUtils.getColor;

// Encode a nested object as PHP-style form data: on_field[gk]=123
function encodeNested(obj, prefix = '') {
    const parts = [];
    for (const [key, val] of Object.entries(obj)) {
        const k = prefix ? `${prefix}[${key}]` : key;
        if (val !== null && val !== undefined && typeof val === 'object') {
            parts.push(encodeNested(val, k));
        } else if (val !== null && val !== undefined) {
            parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(val)}`);
        }
    }
    return parts.join('&');
}

async function postSave(assoc, changedPlayers, reserves, national, miniGameId) {
    return fetch('/ajax/tactics_post.ajax.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body:    encodeNested({ on_field: assoc, players: changedPlayers, reserves, national, miniGameId }),
    });
}

/**
 * Mount the 3-column formation lineup panel with drag & drop.
 * @param {HTMLElement} container
 * @param {object}      data  — result from tactics_get.ajax.php (players may have .r5/.routine)
 * @param {object}      opts  — { reserves, national, miniGameId }
 */
export function mountTacticsLineup(container, data, opts = {}) {
    const { reserves = 0, national = 0, miniGameId = 0 } = opts;
    const { players_by_id = {}, positions = [] } = data;
    const { R5_THRESHOLDS, RTN_THRESHOLDS, REC_THRESHOLDS } = TmConst;

    // ── Mutable state ─────────────────────────────────────────────────────
    // fieldByPos : posIndex (number) → playerId
    // assoc      : posKey string    → playerId  (field positions + special roles)
    const fieldByPos = { ...data.formation_by_pos };
    const assoc      = { ...data.formation_assoc };

    // ── State helpers ─────────────────────────────────────────────────────
    const getFieldPosIndex = pid => {
        if (!pid) return null;
        const s = String(pid);
        for (const [idx, id] of Object.entries(fieldByPos)) {
            if (id != null && String(id) === s) return Number(idx);
        }
        return null;
    };

    const getBenchRole = pid => {
        if (!pid) return null;
        const s = String(pid);
        return BENCH_ROLES.find(r => assoc[r] != null && String(assoc[r]) === s) || null;
    };

    const isOnField = pid => getFieldPosIndex(pid) !== null || getBenchRole(pid) !== null;

    const buildAssocForSave = () =>
        Object.fromEntries(Object.entries(assoc).filter(([, v]) => v != null && String(v) !== '' && String(v) !== '0'));

    // Formation sort key: starters GK-first (0=GK, 23=FWD), subs 100-104, rest 999
    const getFormationSortKey = pid => {
        const s = String(pid);
        for (const [idx, id] of Object.entries(fieldByPos)) {
            if (id != null && String(id) === s) return Number(idx);
        }
        const si = ['sub1','sub2','sub3','sub4','sub5'].findIndex(r => assoc[r] != null && String(assoc[r]) === s);
        if (si >= 0) return 100 + si;
        return 999;
    };

    // Formation position key for a player (e.g. 'dmc'), 'sub', or null
    const getFormationPos = pid => {
        const s = String(pid);
        for (const [idx, id] of Object.entries(fieldByPos)) {
            if (id != null && String(id) === s) return String(positions[idx] || '').toLowerCase() || null;
        }
        for (const sub of ['sub1','sub2','sub3','sub4','sub5']) {
            if (assoc[sub] != null && String(assoc[sub]) === s) return sub;
        }
        return null;
    };

    // ── Player list sorted by formation order ──────────────────────
    let _firstSubPid = null, _firstOutPid = null;
    const sortedPlayers = () => {
        const rows = Object.values(data.players || {}).map(p => {
        const fmPos  = getFormationPos(p.player_id);
        const posStr = (fmPos && !BENCH_LABELS[fmPos])
            ? fmPos
            : String(p.favposition || '').split(',')[0]?.trim() || '';
        let _fmR5 = null, _fmRec = null;
        if (p.allPositionRatings?.length) {
            const posId  = TmConst.POSITION_MAP[posStr.toLowerCase()]?.id;
            const rating = posId != null ? p.allPositionRatings.find(r => r.id === posId) : null;
            if (rating) {
                _fmR5  = parseFloat(rating.r5);
                _fmRec = Math.round((parseFloat(rating.rec) || 0) * 100) / 100;
            }
        }
        return {
            ...p,
            _fmOrder: getFormationSortKey(p.player_id),
            _fmPos:   fmPos,
            _fmR5,
            _fmRec,
        };
        }).sort((a, b) => a._fmOrder - b._fmOrder);
        _firstSubPid = rows.find(p => SUB_ROLES.some(r => assoc[r] != null && String(assoc[r]) === String(p.player_id)))?.player_id ?? null;
        _firstOutPid = rows.find(p => getFieldPosIndex(p.player_id) === null && getBenchRole(p.player_id) === null)?.player_id ?? null;
        return rows;
    };

    // ── Mount directly into container ─────────────────────────────────────
    const body = container;

    // ── Save status bar ───────────────────────────────────────────────────
    const statusBar = document.createElement('div');
    statusBar.className = 'tmtc-save-status';
    body.appendChild(statusBar);

    let statusTimer = null;
    function showStatus(ok, msg) {
        clearTimeout(statusTimer);
        statusBar.className = 'tmtc-save-status ' + (ok ? 'tmtc-save-ok' : 'tmtc-save-err');
        statusBar.textContent = msg;
        statusTimer = setTimeout(() => { statusBar.className = 'tmtc-save-status'; statusBar.textContent = ''; }, 2500);
    }

    // ── 2-column layout (left: field+bench, right: squad) ────────────────
    const layout = document.createElement('div');
    layout.className = 'tmtc-lineup-2col';
    body.appendChild(layout);

    // Left column: field + bench below
    const fieldCol = document.createElement('div');
    fieldCol.className = 'tmtc-field-col';
    layout.appendChild(fieldCol);

    // Right column: squad table — use external container if provided via opts
    const externalSquadContainer = opts.squadContainer || null;
    const squadCol = document.createElement('div');
    squadCol.className = 'tmtc-squad-col';
    if (!externalSquadContainer) layout.appendChild(squadCol);

    // benchCol is now inside fieldCol (below the pitch)
    const benchCol = document.createElement('div');
    benchCol.className = 'tmtc-bench-col';

    // ── DOM registries ────────────────────────────────────────────────────
    const slotEls      = {};   // posIndex → fieldSlotEl
    const benchSlotEls = {};   // roleKey  → benchSlotEl
    let tblWrap        = null;

    // ══════════════════════════════════════════════════════════════════════
    // Field
    // ══════════════════════════════════════════════════════════════════════
    const fieldEl = document.createElement('div');
    fieldEl.className = 'tmtc-field';
    fieldCol.appendChild(fieldEl);

    // Spacer at top to push rows toward GK end without affecting background SVG
    const topSpacer = document.createElement('div');
    topSpacer.className = 'tmtc-field-spacer';
    fieldEl.appendChild(topSpacer);

    for (const line of LINES) {
        const indices = [];
        for (let i = line.from; i <= line.to; i++) {
            if (positions[i]) indices.push(i);
        }
        if (!indices.length) continue;

        const section = document.createElement('div');
        section.className = 'tmtc-field-line';
        fieldEl.appendChild(section);

        const lineEl = document.createElement('div');
        lineEl.className = 'tmtc-line';
        section.appendChild(lineEl);

        const activeCols = getVisualCols(indices.length, line.key);
        for (let col = 0; col < 5; col++) {
            const activeIdx = activeCols.indexOf(col);
            if (activeIdx !== -1 && indices[activeIdx] !== undefined) {
                const slotEl = makeFieldSlot(indices[activeIdx]);
                slotEls[indices[activeIdx]] = slotEl;
                lineEl.appendChild(slotEl);
            } else {
                const spacer = document.createElement('div');
                spacer.className = 'tmtc-slot-spacer';
                lineEl.appendChild(spacer);
            }
        }
    }

    // Bench (not rendered — to be added later)
    for (const role of SUB_ROLES) {
        benchSlotEls[role] = makeBenchSlot(role);  // keep in memory for DnD swaps
    }
    for (const role of SPECIAL_ROLES) {
        benchSlotEls[role] = makeBenchSlot(role);
    }

    // ══════════════════════════════════════════════════════════════════════
    // Squad table column
    // ══════════════════════════════════════════════════════════════════════
    tblWrap = buildSquadTable();
    (externalSquadContainer || squadCol).appendChild(tblWrap);

    // ══════════════════════════════════════════════════════════════════════
    // DOM factories
    // ══════════════════════════════════════════════════════════════════════

    function makeFieldSlot(posIndex) {
        const posKey = String(positions[posIndex] || '');
        const pid    = fieldByPos[posIndex];
        const player = pid ? (players_by_id[pid] || null) : null;

        const slotEl = document.createElement('div');
        slotEl.className = 'tmtc-slot';
        slotEl.dataset.posIndex = posIndex;
        slotEl.dataset.posKey   = posKey;
        renderFieldSlot(slotEl, player, posKey);
        setupDropTarget(slotEl, posIndex, posKey);
        return slotEl;
    }

    function renderFieldSlot(slotEl, player, posKey) {
        // Keep data-pos* attrs, clear the rest
        const pi = slotEl.dataset.posIndex;
        const pk = slotEl.dataset.posKey;
        slotEl.innerHTML = '';
        slotEl.dataset.posIndex = pi;
        slotEl.dataset.posKey   = pk;
        slotEl.classList.toggle('tmtc-slot-empty', !player);

        if (player) {
            slotEl.setAttribute('draggable', 'true');
            slotEl.dataset.playerId = player.player_id;
            slotEl.removeEventListener('dragstart', onFieldDragStart);
            slotEl.addEventListener('dragstart', onFieldDragStart);
            slotEl.innerHTML = `
                <span class="tmtc-slot-no">${escHtml(player.no || '')}</span>
                <span class="tmtc-slot-name">${escHtml(player.lastname || player.name || '')}</span>
                ${TmPosition.chip([posKey || ''])}
                <span class="tmtc-slot-rec">${recStars(player.rec_sort)}</span>
            `;
        } else {
            slotEl.removeAttribute('draggable');
            delete slotEl.dataset.playerId;
            slotEl.innerHTML = `<span class="tmtc-slot-poskey">${escHtml(posKey.toUpperCase() || '—')}</span>`;
        }
    }

    function makeBenchSlot(role) {
        const el = document.createElement('div');
        el.className = 'tmtc-bench-slot';
        el.dataset.role = role;
        const pid    = assoc[role];
        const player = pid ? (players_by_id[pid] || null) : null;
        renderBenchSlot(el, player, BENCH_LABELS[role] || role);
        setupBenchDropTarget(el, role);
        return el;
    }

    function renderBenchSlot(el, player, label) {
        el.innerHTML = '';
        const roleEl = document.createElement('span');
        roleEl.className = 'tmtc-bench-role';
        roleEl.textContent = label;
        el.appendChild(roleEl);

        if (player) {
            const inner = document.createElement('div');
            inner.setAttribute('draggable', 'true');
            inner.dataset.playerId = player.player_id;
            inner.className = 'tmtc-bench-inner';
            inner.innerHTML = `<span class="tmtc-bench-name">${escHtml(player.lastname || player.name || '')}</span>`;
            inner.addEventListener('dragstart', onBenchDragStart);
            el.appendChild(inner);
        } else {
            const emptyEl = document.createElement('span');
            emptyEl.className = 'tmtc-bench-empty';
            emptyEl.textContent = '—';
            el.appendChild(emptyEl);
        }
    }

    function buildSquadTable() {
        const wrap = TmTable.table({
            items:    sortedPlayers(),
            sortKey:  '_fmOrder',
            sortDir:  1,
            density:  'tight',
            rowAttrs: p => ({ draggable: 'true', 'data-player-id': p.player_id }),
            rowCls:   p => {
                const pid = String(p.player_id);
                const sep = (pid === String(_firstSubPid) || pid === String(_firstOutPid)) ? ' tmtc-row-sep' : '';
                if (getFieldPosIndex(p.player_id) !== null) return 'tmtc-row-on-field' + sep;
                if (getBenchRole(p.player_id) !== null) return 'tmtc-row-on-bench' + sep;
                return 'tmtc-row-out' + sep;
            },
            headers:  [
                {
                    key: '_bar', label: '', sortable: false, cls: 'tmtc-pb-cell', thCls: 'tmtc-pb-cell',
                    render: (_, p) => {
                        const pos = (p._fmPos && !BENCH_LABELS[p._fmPos])
                            ? p._fmPos
                            : String(p.favposition || '').split(',')[0]?.trim() || '';
                        const color = TmConst.POSITION_MAP[pos.toLowerCase()]?.color || 'var(--tmu-text-dim)';
                        return `<span class="tmtc-pb-inner" style="background:${color}"></span>`;
                    },
                },
                {
                    key: 'no', label: '#', align: 'r', width: '28px', sortable: false,
                    render: v => `<span style="color:var(--tmu-text-muted);font-variant-numeric:tabular-nums">${escHtml(v)}</span>`,
                },
                {
                    key: '_fmPos', label: 'Pos', align: 'c', width: '68px',
                    sortable: false,
                    render: (v, p) => {
                        if (!v) {
                            const pos = String(p?.favposition || '').split(',')[0]?.trim() || '';
                            if (!pos) return '';
                            return `<span style="opacity:0.45;filter:grayscale(1)">${TmPosition.chip([pos])}</span>`;
                        }
                        if (BENCH_LABELS[v]) return `<span class="tmtc-sub-badge">${escHtml(BENCH_LABELS[v])}</span>`;
                        return TmPosition.chip([v.toUpperCase()]);
                    },
                },
                {
                    key: 'name', label: 'Player',
                    render: (_, p) => `<a href="/players/${p.player_id}/" style="color:var(--tmu-text-inverse);text-decoration:none;font-weight:600" onclick="event.stopPropagation()">${escHtml(p.lastname || p.name || '')}</a>`,
                },
                {
                    key: 'rec_sort', label: '★', align: 'c', width: '44px',
                    render: v => {
                        const n = Math.min(Math.round(Number(v) || 0), 5);
                        return n ? `<span style="color:var(--tmu-warning);font-size:var(--tmu-font-2xs)">${'★'.repeat(n)}</span>` : '—';
                    },
                },
                {
                    key: '_fmRec', label: 'REC', align: 'r', width: '40px',
                    sortable: false,
                    render: v => v != null
                        ? `<span class="tmu-tabular" style="color:${gc(v, REC_THRESHOLDS)};font-weight:700">${v.toFixed(2)}</span>`
                        : `<span style="color:var(--tmu-text-dim)">—</span>`,
                },
                {
                    key: '_fmR5', label: 'R5', align: 'r', width: '40px',
                    sortable: false,
                    render: v => v != null
                        ? `<span class="tmu-tabular" style="color:${gc(v, R5_THRESHOLDS)};font-weight:700">${v}</span>`
                        : `<span style="color:var(--tmu-text-dim)">—</span>`,
                },
                {
                    key: 'routine', label: 'Routine', align: 'r', width: '42px',
                    render: v => v != null && v > 0
                        ? `<span class="tmu-tabular" style="color:${gc(v, RTN_THRESHOLDS)};font-weight:700">${Number(v).toFixed(1)}</span>`
                        : `<span style="color:var(--tmu-text-dim)">—</span>`,
                },
            ],
            emptyText: 'No players.',
        });

        // Delegated dragstart for all table rows
        wrap.addEventListener('dragstart', e => {
            const tr = e.target.closest('tr[data-player-id]');
            if (!tr || !wrap.contains(tr)) return;
            const pid = tr.dataset.playerId;
            if (!pid) return;
            dragState = { pid, fromType: 'sidebar' };
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', pid);
            tr.classList.add('tmtc-drag-source');
            fieldEl.classList.add('is-dragging');
        });

        return wrap;
    }

    function refreshSquadTable() {
        tblWrap?.refresh({ items: sortedPlayers() });
    }

    // ══════════════════════════════════════════════════════════════════════
    // Drag & Drop
    // ══════════════════════════════════════════════════════════════════════

    // dragState: { pid, fromType: 'field'|'bench'|'sidebar', fromPosIndex?, fromPosKey?, fromRoleKey? }
    let dragState = null;

    function onFieldDragStart(e) {
        const pid      = e.currentTarget.dataset.playerId;
        const posIndex = Number(e.currentTarget.dataset.posIndex);
        const posKey   = String(e.currentTarget.dataset.posKey || '');
        if (!pid) { e.preventDefault(); return; }
        dragState = { pid, fromType: 'field', fromPosIndex: posIndex, fromPosKey: posKey };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', pid);
        e.currentTarget.classList.add('tmtc-drag-source');
        fieldEl.classList.add('is-dragging');
    }

    function onBenchDragStart(e) {
        e.stopPropagation();
        const pid     = e.currentTarget.dataset.playerId;
        const roleKey = e.currentTarget.closest('.tmtc-bench-slot')?.dataset.role || '';
        if (!pid) { e.preventDefault(); return; }
        dragState = { pid, fromType: 'bench', fromRoleKey: roleKey };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', pid);
        e.currentTarget.classList.add('tmtc-drag-source');
        fieldEl.classList.add('is-dragging');
    }

    // Clear dragged player from its origin slot (field / bench / squad-table).
    function clearSourceOldSpot(pid, fromType, fromPosIndex, fromPosKey, fromRoleKey) {
        if (fromType === 'field') {
            fieldByPos[fromPosIndex] = null;
            if (fromPosKey) assoc[fromPosKey] = null;
            renderFieldSlot(slotEls[fromPosIndex], null, fromPosKey);
        } else if (fromType === 'bench' && fromRoleKey) {
            assoc[fromRoleKey] = null;
            renderBenchSlot(benchSlotEls[fromRoleKey], null, BENCH_LABELS[fromRoleKey] || fromRoleKey);
        } else if (fromType === 'sidebar') {
            const oldFieldIdx = getFieldPosIndex(pid);
            if (oldFieldIdx !== null) {
                const oldPk = String(positions[oldFieldIdx] || '');
                fieldByPos[oldFieldIdx] = null;
                if (oldPk) assoc[oldPk] = null;
                renderFieldSlot(slotEls[oldFieldIdx], null, oldPk);
            }
            const oldRole = getBenchRole(pid);
            if (oldRole) {
                assoc[oldRole] = null;
                renderBenchSlot(benchSlotEls[oldRole], null, BENCH_LABELS[oldRole] || oldRole);
            }
        }
    }

    // After any field change: normalize positions symmetrically (1→C, 2→CL+CR, 3→CL+C+CR).
    // Only normalizes rows listed in `affectedLineKeys` (Set of line.key strings).
    function normalizeField(changed, affectedLineKeys) {
        for (const line of LINES) {
            if (affectedLineKeys && !affectedLineKeys.has(line.key)) continue;
            const allIndices = [];
            for (let i = line.from; i <= line.to; i++) {
                if (positions[i]) allIndices.push(i);
            }
            if (!allIndices.length) continue;

            const N = allIndices.length;
            // Center sub-group: exclude outermost L/R wings when N > 3
            const centerRanks = N <= 3 ? Array.from({ length: N }, (_, i) => i)
                              : N === 4 ? [1, 2]
                              : [1, 2, 3];
            const centerIndices = centerRanks.map(r => allIndices[r]);

            // Occupied center positions, sorted left-to-right
            const occupiedCenters = centerIndices
                .filter(i => fieldByPos[i] != null && String(fieldByPos[i]) !== '0')
                .sort((a, b) => allIndices.indexOf(a) - allIndices.indexOf(b));

            const count = occupiedCenters.length;
            if (count === 0) continue;

            const targetRanks = getTargetRanks(centerIndices.length, count);
            const targetCenterIndices = targetRanks.map(r => centerIndices[r]);

            if (occupiedCenters.every((idx, j) => idx === targetCenterIndices[j])) continue;

            // Collect player ids in order
            const pids = occupiedCenters.map(i => String(fieldByPos[i]));

            // Clear current center occupants
            for (const idx of occupiedCenters) {
                const pk = String(positions[idx] || '');
                fieldByPos[idx] = null;
                if (pk) assoc[pk] = null;
                if (slotEls[idx]) renderFieldSlot(slotEls[idx], null, pk);
            }

            // Re-place at normalized target positions
            for (let j = 0; j < pids.length; j++) {
                const pid = pids[j];
                const targetIdx = targetCenterIndices[j];
                const pk = String(positions[targetIdx] || '');
                fieldByPos[targetIdx] = pid;
                if (pk) assoc[pk] = pid;
                if (changed) changed[pid] = pk || String(targetIdx);
                if (slotEls[targetIdx]) renderFieldSlot(slotEls[targetIdx], players_by_id[pid] || null, pk);
            }
        }
    }

    function setupDropTarget(slotEl, posIndex, posKey) {
        let n = 0;
        slotEl.addEventListener('dragenter',  e => { e.preventDefault(); if (++n === 1) slotEl.classList.add('tmtc-drag-over'); });
        slotEl.addEventListener('dragleave',  ()  => { if (--n <= 0) { n = 0; slotEl.classList.remove('tmtc-drag-over'); } });
        slotEl.addEventListener('dragover',   e => e.preventDefault());
        slotEl.addEventListener('drop', async e => {
            e.preventDefault();
            n = 0;
            slotEl.classList.remove('tmtc-drag-over');
            clearDragVisuals();

            const ds = dragState;
            dragState = null;
            if (!ds) return;

            const { pid, fromType, fromPosIndex, fromPosKey, fromRoleKey } = ds;
            const player = players_by_id[pid];
            if (!player) return;

            const prevPid = fieldByPos[posIndex] ? String(fieldByPos[posIndex]) : null;
            if (prevPid === String(pid)) return;  // same slot

            const changed = {};

            // Track rows that will be affected BEFORE clearing source
            const affectedLines = new Set();
            affectedLines.add(lineKeyForPosIndex(posIndex));
            if (fromType === 'field' && fromPosIndex != null) affectedLines.add(lineKeyForPosIndex(fromPosIndex));
            if (fromType === 'sidebar') {
                const oldIdx = getFieldPosIndex(pid);
                if (oldIdx !== null) affectedLines.add(lineKeyForPosIndex(oldIdx));
            }
            affectedLines.delete(null);

            // Remove dragged player from its old spot
            clearSourceOldSpot(pid, fromType, fromPosIndex, fromPosKey, fromRoleKey);

            // Handle player already in destination slot
            if (prevPid) {
                const prevP = players_by_id[prevPid];
                if (prevP) {
                    if (fromType === 'field') {
                        // Swap: prev player goes to dragged player's old field slot
                        fieldByPos[fromPosIndex] = prevPid;
                        if (fromPosKey) assoc[fromPosKey] = prevPid;
                        changed[prevPid] = fromPosKey || String(fromPosIndex);
                        renderFieldSlot(slotEls[fromPosIndex], prevP, fromPosKey);
                    } else if (fromType === 'bench' && fromRoleKey) {
                        // Displaced field player swaps to the source bench slot
                        assoc[fromRoleKey] = prevPid;
                        renderBenchSlot(benchSlotEls[fromRoleKey], prevP, BENCH_LABELS[fromRoleKey] || fromRoleKey);
                        changed[prevPid] = fromRoleKey;
                    } else {
                        // From squad table: displaced player is removed from field
                        changed[prevPid] = 'out';
                    }
                }
            }

            // Place dragged player in new slot
            fieldByPos[posIndex] = pid;
            if (posKey) assoc[posKey] = pid;
            changed[pid] = posKey || String(posIndex);
            renderFieldSlot(slotEl, player, posKey);
            normalizeField(changed, affectedLines);
            refreshSquadTable();

            try {
                await postSave(buildAssocForSave(), changed, reserves, national, miniGameId);
                showStatus(true, 'Saved ✓');
            } catch {
                showStatus(false, 'Save failed');
            }
        });
    }

    function setupBenchDropTarget(el, roleKey) {
        let n = 0;
        el.addEventListener('dragenter',  e => { e.preventDefault(); if (++n === 1) el.classList.add('tmtc-drag-over'); });
        el.addEventListener('dragleave',  ()  => { if (--n <= 0) { n = 0; el.classList.remove('tmtc-drag-over'); } });
        el.addEventListener('dragover',   e => e.preventDefault());
        el.addEventListener('drop', async e => {
            e.preventDefault();
            n = 0;
            el.classList.remove('tmtc-drag-over');
            clearDragVisuals();

            const ds = dragState;
            dragState = null;
            if (!ds) return;

            const { pid, fromType, fromPosIndex, fromPosKey, fromRoleKey } = ds;
            const player = players_by_id[pid];
            if (!player) return;

            const prevPid = assoc[roleKey] ? String(assoc[roleKey]) : null;
            if (prevPid === String(pid)) return;

            const changed = {};

            // Remove dragged player from old spot
            clearSourceOldSpot(pid, fromType, fromPosIndex, fromPosKey, fromRoleKey);

            // Handle displaced bench occupant
            if (prevPid) {
                const prevP = players_by_id[prevPid];
                if (prevP) {
                    if (fromType === 'field' && fromPosIndex != null) {
                        // Prev bench player goes to dragged player's old field slot
                        fieldByPos[fromPosIndex] = prevPid;
                        if (fromPosKey) assoc[fromPosKey] = prevPid;
                        changed[prevPid] = fromPosKey || String(fromPosIndex);
                        renderFieldSlot(slotEls[fromPosIndex], prevP, fromPosKey);
                    } else if (fromType === 'bench' && fromRoleKey) {
                        // Bench swap
                        assoc[fromRoleKey] = prevPid;
                        renderBenchSlot(benchSlotEls[fromRoleKey], prevP, BENCH_LABELS[fromRoleKey] || fromRoleKey);
                        changed[prevPid] = fromRoleKey;
                    } else {
                        changed[prevPid] = 'out';
                    }
                }
            }

            assoc[roleKey] = pid;
            changed[pid] = roleKey;
            renderBenchSlot(el, player, BENCH_LABELS[roleKey] || roleKey);

            // For bench drops, normalize the field row freed by a field source
            const affectedLines = new Set();
            if (fromType === 'field' && fromPosIndex != null) affectedLines.add(lineKeyForPosIndex(fromPosIndex));
            affectedLines.delete(null);
            if (affectedLines.size) normalizeField(changed, affectedLines);
            refreshSquadTable();

            try {
                await postSave(buildAssocForSave(), changed, reserves, national, miniGameId);
                showStatus(true, 'Saved ✓');
            } catch {
                showStatus(false, 'Save failed');
            }
        });
    }

    function clearDragVisuals() {
        document.querySelectorAll('.tmtc-drag-source, .tmtc-drag-over')
            .forEach(el => el.classList.remove('tmtc-drag-source', 'tmtc-drag-over'));
        fieldEl.classList.remove('is-dragging');
    }

    document.addEventListener('dragend', () => {
        dragState = null;
        clearDragVisuals();
    });

    // sidebar dragstart also shows ghost placeholders
    // (the delegated handler on tblWrap fires after above; we add is-dragging there too)

    return { refresh: refreshSquadTable };
}
