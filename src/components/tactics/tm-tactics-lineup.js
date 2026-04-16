import { TmPosition } from '../../lib/tm-position.js';
import { TmTable } from '../shared/tm-table.js';
import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmAlert } from '../shared/tm-alert.js';
import { TmStars } from '../shared/tm-stars.js';
import { TmPlayerTooltip } from '../player/tooltip/tm-player-tooltip.js';
import { playerStatusIconsHtml } from '../shared/tm-player-status-icons.js';
import { CountryFlag } from '../shared/country-flag.js';

'use strict';

// From player.js (via TmConst barrel) — imported once here for clarity
const FIELD_ZONES = TmConst.FIELD_ZONES;    // FWD-first array, each has { key, row, cols: [posKey|null ×5] }
const BENCH_SLOTS = TmConst.BENCH_SLOTS;    // ['sub1'..'sub5']
const SPECIAL_SLOTS = TmConst.SPECIAL_SLOTS;  // ['captain','corner','penalty','freekick']
const ALL_BENCH = [...BENCH_SLOTS, ...SPECIAL_SLOTS];
const BENCH_LABELS = TmConst.BENCH_LABELS;

// Lookup: posKey → zone key (e.g. 'dcl' → 'def')
const POSKEY_TO_ZONE = {};
for (const z of FIELD_ZONES) {
    for (const pk of z.cols) { if (pk) POSKEY_TO_ZONE[pk] = z.key; }
}

const LINE_PENALTIES = {
    1: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 },
    2: { 1: 1, 2: 0, 3: 1, 4: 2, 5: 3 },
    3: { 1: 2, 2: 1, 3: 0, 4: 1, 5: 2 },
    4: { 1: 3, 2: 2, 3: 1, 4: 0, 5: 1 },
    5: { 1: 4, 2: 3, 3: 2, 4: 1, 5: 0 },
};

// Symmetric target rank indices for N occupied slots among `total` active slots in a zone.
// 1→center, 2→CL+CR, 3→CL+C+CR, 4→L+CL+CR+R, 5→all
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

const escHtml = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: encodeNested({ on_field: assoc, players: changedPlayers, reserves, national, miniGameId }),
    });
}

/**
 * Mount the tactics lineup: field pitch (left column) + squad table (right column).
 * @param {HTMLElement} container
 * @param {object}      data  — result from tactics_get; players_by_id is pre-populated/enriched
 * @param {object}      opts  — { reserves, national, miniGameId }
 */
export function mountTacticsLineup(container, data, opts = {}) {
    const { reserves = 0, national = 0, miniGameId = 0 } = opts;
    const { players_by_id = {} } = data;
    const { R5_THRESHOLDS, RTN_THRESHOLDS, REC_THRESHOLDS } = TmConst;

    // Foreign player rule: max 5 foreigners across all 16 squad players (11 field + 5 subs)
    const clubCountry = String(window.SESSION?.country || '').trim().toLowerCase();
    const isForeigner = (p) => !!clubCountry && String(p?.country || '').trim().toLowerCase() !== clubCountry;

    // Count how many foreigners are currently in the full 16-man squad (field + bench).
    function countSquadForeigners(excludePosKey) {
        let count = 0;
        for (const pk of getOccupiedFieldKeys()) {
            if (pk === excludePosKey) continue;
            const p = players_by_id[String(assignment[pk])];
            if (p && isForeigner(p)) count++;
        }
        for (const role of BENCH_SLOTS) {
            const pid = assignment[role];
            if (!pid) continue;
            const p = players_by_id[String(pid)];
            if (p && isForeigner(p)) count++;
        }
        return count;
    }

    // Returns projected foreigner count if `incomingPid` is placed on the field,
    // accounting for `vacatingPosKey` being freed (field swap).
    function projectedForeigners(incomingPid, vacatingPosKey) {
        const base = countSquadForeigners(vacatingPosKey);
        return base + (isForeigner(players_by_id[String(incomingPid)]) ? 1 : 0);
    }

    // ══════════════════════════════════════════════════════════════════════
    // SINGLE SOURCE OF TRUTH
    // ══════════════════════════════════════════════════════════════════════

    // assignment: posKey|benchRole|specialRole → playerId  (the ONLY state object)
    const assignment = { ...data.formation_assoc };
    // Merge formation_subs in case server sends them separately
    for (const [role, pid] of Object.entries(data.formation_subs || {})) {
        if (!assignment[role] && pid) assignment[role] = pid;
    }

    // Computes occupied field posKeys on demand — always in sync with assignment (no separate state)
    const getOccupiedFieldKeys = () => new Set(
        Object.keys(assignment).filter(pk =>
            TmConst.POSITION_MAP[pk] != null && assignment[pk] && String(assignment[pk]) !== '0'
        )
    );

    // ══════════════════════════════════════════════════════════════════════
    // STATE HELPERS
    // ══════════════════════════════════════════════════════════════════════

    // Returns the field posKey the player occupies, or null
    const getFieldPosKey = pid => {
        const s = String(pid);
        for (const [pk, id] of Object.entries(assignment)) {
            if (ALL_BENCH.includes(pk)) continue;
            if (id != null && String(id) === s) return pk;
        }
        return null;
    };

    // Returns the BENCH_SLOTS role the player is assigned to, or null
    const getBenchRole = pid => {
        const s = String(pid);
        return BENCH_SLOTS.find(r => assignment[r] != null && String(assignment[r]) === s) || null;
    };

    // Sort key for squad table: GK first (0-4), DEF (5-9), …, FWD (25-29), subs (100+), out (999)
    const getSortKey = pid => {
        const pk = getFieldPosKey(pid);
        if (pk) {
            // FIELD_ZONES[0]=fwd(row5), FIELD_ZONES[5]=gk(row0). We want GK at top → invert zi.
            for (let zi = 0; zi < FIELD_ZONES.length; zi++) {
                const ci = FIELD_ZONES[zi].cols.indexOf(pk);
                if (ci >= 0) return (FIELD_ZONES.length - 1 - zi) * 5 + ci;
            }
        }
        const si = BENCH_SLOTS.findIndex(r => assignment[r] != null && String(assignment[r]) === String(pid));
        if (si >= 0) return 100 + si;
        return 999;
    };

    // Build the full on_field assoc for saving — all 23 field posKeys + bench + special roles.
    // Empty field slots are sent as 0 so the server clears previously assigned players.
    const buildAssocForSave = (outPid = null) => {
        const result = {};
        for (const pk of Object.keys(TmConst.POSITION_MAP)) {
            result[pk] = assignment[pk] || 0;
        }
        for (const role of [...BENCH_SLOTS, ...SPECIAL_SLOTS]) {
            if (assignment[role]) result[role] = assignment[role];
        }
        if (outPid) result.out = outPid;
        return result;
    };

    // ── Change listeners ───────────────────────────────────────────────────
    const changeListeners = [];
    const notifyChange = () => changeListeners.forEach(fn => fn());

    const adaptTooltipPlayer = player => {
        if (!player) return null;
        return {
            ...player,
            name: player.name || player.lastname || String(player.player_id || ''),
            rec: player._fmRec != null ? player._fmRec : player.rec,
            r5: player._fmR5 != null ? player._fmR5 : player.r5,
            routine: Number.isFinite(parseFloat(player.routine)) ? parseFloat(player.routine) : null,
        };
    };

    const parseFavPositions = player => String(player?.favposition || player?.fp || '')
        .split(',')
        .map(pos => pos.trim().toLowerCase())
        .filter(Boolean);

    const getPositionRating = (player, posKey) => {
        const positionId = TmConst.POSITION_MAP[String(posKey || '').toLowerCase()]?.id;
        if (positionId == null || !player?.allPositionRatings?.length) return null;
        return player.allPositionRatings.find(rating => rating.id === positionId) || null;
    };

    const getSlotRecommendation = (player, posKey) => {
        const rating = getPositionRating(player, posKey);
        if (rating?.rec != null) {
            const score = parseFloat(rating.rec);
            if (Number.isFinite(score)) return Math.round(score * 100) / 100;
        }
        const fallback = parseFloat(player?.rec_sort);
        return Number.isFinite(fallback) ? fallback : null;
    };

    const getSlotDisplayRating = (player, posKey) => {
        const rating = getPositionRating(player, posKey);
        if (rating?.r5 != null) {
            const score = parseFloat(rating.r5);
            if (Number.isFinite(score)) return TmUtils.formatR5(score, '—');
        }
        return '—';
    };

    const getSlotRoutineDisplay = player => {
        const routine = parseFloat(player?.routine);
        return Number.isFinite(routine) && routine > 0 ? routine.toFixed(1) : '—';
    };

    const getMoodPenalty = (player, posKey) => {
        const placed = TmConst.POSITION_MAP[String(posKey || '').toLowerCase()];
        if (!placed) return 0;

        const favEntries = parseFavPositions(player)
            .map(favKey => TmConst.POSITION_MAP[favKey] || null)
            .filter(Boolean);
        if (!favEntries.length) return 0;

        if (placed.row === 0) return favEntries.some(entry => entry.row === 0) ? 0 : 4;
        if (favEntries.some(entry => entry.row === 0)) return 4;

        const placedSide = placed.col === 0 ? 'L' : (placed.col === 4 ? 'R' : 'C');
        let bestPenalty = 4;

        for (const fav of favEntries) {
            const favSide = fav.col === 0 ? 'L' : (fav.col === 4 ? 'R' : 'C');
            let penalty = 0;

            if (favSide !== placedSide) {
                penalty += (favSide === 'C' || placedSide === 'C') ? 2 : 1;
            }

            penalty += LINE_PENALTIES[placed.row]?.[fav.row] ?? 4;
            bestPenalty = Math.min(bestPenalty, Math.min(penalty, 4));
        }

        return bestPenalty;
    };

    // ══════════════════════════════════════════════════════════════════════
    // SQUAD TABLE DATA
    // ══════════════════════════════════════════════════════════════════════
    const sortedPlayers = () => {
        // Bench players are represented entirely by their dedicated slot rows below —
        // exclude them from the main player list to avoid duplication.
        const rows = Object.values(data.players || {}).map(p => {
            const fmPosKey = getFieldPosKey(p.player_id);
            const benchRole = !fmPosKey ? getBenchRole(p.player_id) : null;

            let _fmR5, _fmRec;
            if (fmPosKey) {
                const rating = getPositionRating(p, fmPosKey);
                _fmR5 = rating?.r5 != null ? parseFloat(rating.r5) : null;
                if (_fmR5 == null) { const v = parseFloat(p.r5); if (Number.isFinite(v)) _fmR5 = v; }
                _fmRec = getSlotRecommendation(p, fmPosKey);
                if (_fmRec == null) { const v = parseFloat(p.rec); if (Number.isFinite(v)) _fmRec = v; }
            } else {
                const v5 = parseFloat(p.r5);   _fmR5  = Number.isFinite(v5)  ? v5  : null;
                const vR = parseFloat(p.rec);   _fmRec = Number.isFinite(vR)  ? vR  : null;
            }
            return {
                ...p,
                _fmOrder: getSortKey(p.player_id),
                _fmPosKey: fmPosKey,
                _benchRole: benchRole,
                _fmR5,
                _fmRec,
            };
        }).filter(p => !p._benchRole)   // bench players rendered via slot rows below
          .sort((a, b) => a._fmOrder - b._fmOrder);

        _firstOutPid = rows.find(p => getFieldPosKey(p.player_id) === null)?.player_id ?? null;

        // Always render all 5 sub slot rows. Occupied slots show the player; empty slots
        // show a ghost drop-target. This gives a permanently visible bench section.
        BENCH_SLOTS.forEach((role, idx) => {
            const pid = assignment[role];
            const player = pid ? (players_by_id[String(pid)] || null) : null;
            if (player) {
                const v5 = parseFloat(player.r5); const vR = parseFloat(player.rec);
                rows.push({
                    ...player,
                    _isBenchPlaceholder: true,
                    _benchSlotFilled: true,
                    _benchRole: role,
                    _fmOrder: 100 + idx,
                    _fmPosKey: null,
                    _fmR5:  Number.isFinite(v5) ? v5 : null,
                    _fmRec: Number.isFinite(vR)  ? vR : null,
                });
            } else {
                rows.push({
                    _isBenchPlaceholder: true,
                    _benchSlotFilled: false,
                    _benchRole: role,
                    _fmOrder: 100 + idx,
                    player_id: `_bench_${role}`, no: '', name: '', lastname: '',
                    rec_sort: null, _fmR5: null, _fmRec: null, routine: null,
                });
            }
        });

        _firstSubPid = rows.find(p => p._isBenchPlaceholder && p._benchSlotFilled)?.player_id ?? null;

        rows.sort((a, b) => a._fmOrder - b._fmOrder);

        let _ms = false, _mo = false;
        for (const r of rows) {
            if (!_ms && r._fmOrder >= 100) { r._needsSep = true; _ms = true; }
            if (!_mo && r._fmOrder >= 999) { r._needsSep = true; _mo = true; }
        }
        return rows;
    };

    // ══════════════════════════════════════════════════════════════════════
    // DOM SETUP
    // ══════════════════════════════════════════════════════════════════════

    const body = container;

    // ── 2-column layout (left: field+bench, right: squad) ────────────────
    const layout = document.createElement('div');
    layout.className = 'tmtc-lineup-2col';
    body.appendChild(layout);

    // Left column: field + special roles below
    const fieldCol = document.createElement('div');
    fieldCol.className = 'tmtc-field-col';
    layout.appendChild(fieldCol);

    // Right column: squad table — use external container if provided via opts
    const externalSquadContainer = opts.squadContainer || null;
    const squadCol = document.createElement('div');
    squadCol.className = 'tmtc-squad-col';
    if (!externalSquadContainer) layout.appendChild(squadCol);

    let hoverTooltipTimer = null;
    const clearPlayerTooltip = () => {
        clearTimeout(hoverTooltipTimer);
        TmPlayerTooltip.hide();
    };

    const bindTooltipDelegation = host => {
        if (!host || host.dataset.tmtcTooltipBound === '1') return;
        host.dataset.tmtcTooltipBound = '1';

        host.addEventListener('mouseover', event => {
            const hoverEl = event.target.closest('.tmtc-slot[data-player-id], .tmtc-bench-inner[data-player-id]');
            if (!hoverEl || !host.contains(hoverEl) || hoverEl.contains(event.relatedTarget)) return;

            const playerId = hoverEl.dataset.playerId || '';
            const player = adaptTooltipPlayer(players_by_id[String(playerId)] || null);
            if (!player) return;

            clearPlayerTooltip();
            hoverTooltipTimer = setTimeout(() => {
                TmPlayerTooltip.show(hoverEl, player);
            }, 80);
        });

        host.addEventListener('mouseout', event => {
            const hoverEl = event.target.closest('.tmtc-slot[data-player-id], .tmtc-bench-inner[data-player-id]');
            if (!hoverEl || !host.contains(hoverEl) || hoverEl.contains(event.relatedTarget)) return;
            clearPlayerTooltip();
        });
    };

    bindTooltipDelegation(layout);
    bindTooltipDelegation(externalSquadContainer || squadCol);

    const specialRolesCol = document.createElement('div');
    specialRolesCol.className = 'tmtc-bench-col';

    // ══════════════════════════════════════════════════════════════════════
    // FIELD — fixed 6-zone × 5-column grid
    // ══════════════════════════════════════════════════════════════════════
    const fieldEl = document.createElement('div');
    fieldEl.className = 'tmtc-field';
    fieldCol.appendChild(fieldEl);

    const topSpacer = document.createElement('div');
    topSpacer.className = 'tmtc-field-spacer';
    fieldEl.appendChild(topSpacer);

    const fieldOverlayBar = document.createElement('div');
    fieldOverlayBar.className = 'tmtc-fob';
    topSpacer.appendChild(fieldOverlayBar);

    // FIELD_ZONES is FWD-first; reverse and skip GK to build "4-4-2" style formation string
    const BADGE_ZONES_LU = [...FIELD_ZONES].reverse().filter(z => z.key !== 'gk');
    function getFormationStr() {
        return BADGE_ZONES_LU
            .map(z => z.cols.filter(pk => pk && assignment[pk] && String(assignment[pk]) !== '0').length)
            .filter(n => n > 0)
            .join('-') || '?';
    }

    function refreshFieldOverlay() {
        const activeKeys = getOccupiedFieldKeys();
        let totalR5 = 0, countR5 = 0, totalRtn = 0, countRtn = 0, totalAge = 0, countAge = 0;
        for (const posKey of activeKeys) {
            const pid = assignment[posKey];
            if (!pid || String(pid) === '0') continue;
            const p = players_by_id[String(pid)];
            if (!p) continue;
            const posId = TmConst.POSITION_MAP[posKey]?.id;
            if (p.allPositionRatings?.length && posId != null) {
                const rating = p.allPositionRatings.find(r => r.id === posId);
                if (rating) { totalR5 += parseFloat(rating.r5) || 0; countR5++; }
            }
            if (p.routine != null && Number(p.routine) > 0) {
                totalRtn += parseFloat(p.routine); countRtn++;
            }
            const age = (p.ageMonths != null) ? p.ageMonths / 12 : (parseInt(p.age) || 0);
            if (age > 0) { totalAge += age; countAge++; }
        }
        const gc = TmUtils.getColor;
        const r5 = countR5 > 0 ? (totalR5 / countR5).toFixed(2) : null;
        const rtn = countRtn > 0 ? (totalRtn / countRtn).toFixed(1) : null;
        const age = countAge > 0 ? (totalAge / countAge).toFixed(1) : null;
        const sep = `<span class="tmtc-fob-sep">·</span>`;
        const item = (label, value, color) =>
            `<span class="tmtc-fob-item"><span class="tmtc-fob-label">${label}</span><span class="tmtc-fob-value" style="color:${color}">${value}</span></span>`;
        fieldOverlayBar.innerHTML = [
            `<span class="tmtc-fob-formation">${getFormationStr()}</span>`,
            sep,
            item('R5', r5 ?? '—', r5 ? gc(parseFloat(r5), TmConst.R5_THRESHOLDS) : 'var(--tmu-text-faint)'),
            sep,
            item('Rtn', rtn ?? '—', rtn ? gc(parseFloat(rtn), TmConst.RTN_THRESHOLDS) : 'var(--tmu-text-faint)'),
            sep,
            item('Age', age ?? '—', 'var(--tmu-text-muted)'),
        ].join('');
    }

    const slotEls = {};   // posKey  → fieldSlotEl
    const benchSlotEls = {};   // roleKey → benchSlotEl
    let tblWrap = null;

    // Build (or rebuild) field DOM. All 6 zones are always rendered so empty slots are
    // available as ghost drop-targets when a field player is being dragged.
    function buildField() {
        while (fieldEl.lastChild !== topSpacer) fieldEl.removeChild(fieldEl.lastChild);
        for (const k of Object.keys(slotEls)) delete slotEls[k];

        for (const zone of FIELD_ZONES) {
            const section = document.createElement('div');
            section.className = 'tmtc-field-line';
            fieldEl.appendChild(section);

            const lineEl = document.createElement('div');
            lineEl.className = 'tmtc-line';
            section.appendChild(lineEl);

            // null posKey = structurally absent (GK side cols, FWD side cols) → spacer.
            // All other posKeys are real slots (may be empty ghost; only accepts field drags).
            for (const posKey of zone.cols) {
                if (!posKey) {
                    const sp = document.createElement('div');
                    sp.className = 'tmtc-slot-spacer';
                    lineEl.appendChild(sp);
                } else {
                    const slotEl = makeFieldSlot(posKey);
                    slotEls[posKey] = slotEl;
                    lineEl.appendChild(slotEl);
                }
            }
        }
    }

    // ══════════════════════════════════════════════════════════════════════
    // NORMALIZATION — redistribute occupied players symmetrically in a zone
    // ══════════════════════════════════════════════════════════════════════

    function normalizeZone(zoneKey, changed) {
        const zone = FIELD_ZONES.find(z => z.key === zoneKey);
        if (!zone) return;

        // Wings (col 0 = L, col 4 = R) stay where they are — never normalized.
        // Only center slots (col 1, 2, 3) are redistributed symmetrically.
        const centerPks = [zone.cols[1], zone.cols[2], zone.cols[3]].filter(pk => pk != null);
        if (!centerPks.length) return;

        const occupied = centerPks.filter(pk => assignment[pk] != null && String(assignment[pk]) !== '0');
        if (!occupied.length) return;

        const targetRanks = getTargetRanks(centerPks.length, occupied.length);
        const targetPks = targetRanks.map(r => centerPks[r]);
        if (occupied.every((pk, i) => pk === targetPks[i])) return; // already symmetric

        const pids = occupied.map(pk => String(assignment[pk]));
        for (const pk of occupied) assignment[pk] = null;
        for (let i = 0; i < pids.length; i++) {
            assignment[targetPks[i]] = pids[i];
            if (changed) changed[pids[i]] = targetPks[i];
        }
        // Re-render center slots
        for (const pk of centerPks) {
            const pid = assignment[pk];
            if (slotEls[pk]) renderFieldSlot(slotEls[pk], pid ? (players_by_id[pid] || null) : null, pk);
        }
    }

    // ══════════════════════════════════════════════════════════════════════
    // DOM FACTORIES
    // ══════════════════════════════════════════════════════════════════════

    function makeFieldSlot(posKey) {
        const pid = assignment[posKey];
        const player = pid ? (players_by_id[pid] || null) : null;
        const slotEl = document.createElement('div');
        slotEl.className = 'tmtc-slot';
        slotEl.dataset.posKey = posKey;
        renderFieldSlot(slotEl, player, posKey);
        setupDropTarget(slotEl, posKey);
        return slotEl;
    }

    function renderFieldSlot(slotEl, player, posKey) {
        if (!slotEl) return;
        slotEl.innerHTML = '';
        slotEl.dataset.posKey = posKey;
        slotEl.classList.toggle('tmtc-slot-empty', !player);

        if (player) {
            slotEl.setAttribute('draggable', 'true');
            slotEl.dataset.playerId = player.player_id;
            slotEl.removeEventListener('dragstart', onFieldDragStart);
            slotEl.addEventListener('dragstart', onFieldDragStart);
            const slotRec = getSlotRecommendation(player, posKey);
            const slotRating = getSlotDisplayRating(player, posKey);
            const slotRoutine = getSlotRoutineDisplay(player);
            const moodPenalty = getMoodPenalty(player, posKey);
            slotEl.innerHTML = `
                <span class="tmtc-slot-no">${escHtml(slotRating)}</span>
                <span class="tmtc-slot-name">${escHtml(player.lastname || player.name || '')}${playerStatusIconsHtml(player)}</span>
                ${TmPosition.chip([posKey || ''])}
                <span class="tmtc-slot-meta">
                    <span class="tmtc-slot-rec">${TmStars.recommendation(slotRec, 'tmtc-rec-stars tmtc-rec-stars-sm') || '<span class="tmtc-slot-rec-empty">—</span>'}</span>
                    ${moodPenalty > 0 ? `<span class="tmtc-slot-mood tmtc-slot-mood-${moodPenalty}" title="Out of natural position">☹</span>` : ''}
                </span>
                <span class="tmtc-slot-rtn" style="color:${slotRoutine !== '—' ? gc(Number(slotRoutine), RTN_THRESHOLDS) : 'var(--tmu-text-dim)'}">${slotRoutine}</span>
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
        const pid = assignment[role];
        const player = pid ? (players_by_id[pid] || null) : null;
        renderBenchSlot(el, player, BENCH_LABELS[role] || role);
        setupBenchDropTarget(el, role);
        return el;
    }

    function renderBenchSlot(el, player, label) {
        el.innerHTML = '';
        el.classList.toggle('has-player', !!player);
        const roleEl = document.createElement('span');
        roleEl.className = 'tmtc-bench-role';
        roleEl.textContent = label;
        el.appendChild(roleEl);

        if (player) {
            const inner = document.createElement('div');
            inner.setAttribute('draggable', 'true');
            inner.dataset.playerId = player.player_id;
            inner.className = 'tmtc-bench-inner';
            inner.innerHTML = `<span class="tmtc-bench-name">${escHtml(player.lastname || player.name || '')}${playerStatusIconsHtml(player)}</span>`;
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
            items: sortedPlayers(),
            sortKey: '_fmOrder',
            sortDir: 1,
            density: 'tight',
            rowAttrs: p => {
                if (p._isBenchPlaceholder && p._benchSlotFilled)
                    return { draggable: 'true', 'data-player-id': p.player_id, 'data-bench-role': p._benchRole };
                if (p._isBenchPlaceholder)
                    return { 'data-bench-role': p._benchRole };
                return { draggable: 'true', 'data-player-id': p.player_id };
            },
            rowCls: p => {
                const sep = p._needsSep ? ' tmtc-row-sep' : '';
                if (p._isBenchPlaceholder && p._benchSlotFilled) return 'tmtc-row-on-bench' + sep;
                if (p._isBenchPlaceholder) return 'tmtc-row-bench-placeholder' + sep;
                if (getFieldPosKey(p.player_id)) return 'tmtc-row-on-field' + sep;
                return 'tmtc-row-out' + sep;
            },
            headers: [
                {
                    key: '_bar', label: '', sortable: false, cls: 'tmtc-pb-cell', thCls: 'tmtc-pb-cell',
                    render: (_, p) => {
                        if (p._isBenchPlaceholder && !p._benchSlotFilled)
                            return '<span class="tmtc-pb-inner" style="background:var(--tmu-border-soft-alpha)"></span>';
                        const posStr = (p._fmPosKey || String(p.favposition || '').split(',')[0]?.trim() || '').toLowerCase();
                        const color = TmConst.POSITION_MAP[posStr]?.color || 'var(--tmu-text-dim)';
                        return `<span class="tmtc-pb-inner" style="background:${color}"></span>`;
                    },
                },
                {
                    key: 'no', label: '#', align: 'r', width: '28px', sortable: false,
                    render: (v, p) => (p._isBenchPlaceholder && !p._benchSlotFilled) ? '' : `<span style="color:var(--tmu-text-muted);font-variant-numeric:tabular-nums">${escHtml(v)}</span>`,
                },
                {
                    key: '_fmPosKey', label: 'Pos', align: 'c', width: '68px', sortable: false,
                    render: (v, p) => {
                        if (p._isBenchPlaceholder)
                            return `<span class="tmtc-sub-badge"${!p._benchSlotFilled ? ' style="opacity:.55"' : ''}>${escHtml(BENCH_LABELS[p._benchRole] || p._benchRole)}</span>`;
                        if (p._benchRole)
                            return `<span class="tmtc-sub-badge">${escHtml(BENCH_LABELS[p._benchRole] || p._benchRole)}</span>`;
                        if (!v) {
                            const positions = String(p?.favposition || '').split(',').map(s => s.trim()).filter(Boolean);
                            if (!positions.length) return '';
                            return `<span style="opacity:0.45;filter:grayscale(1)">${TmPosition.chip(positions)}</span>`;
                        }
                        return TmPosition.chip([v.toUpperCase()]);
                    },
                },
                {
                    key: 'name', label: 'Player',
                    render: (_, p) => {
                        if (p._isBenchPlaceholder && !p._benchSlotFilled)
                            return '<span style="color:var(--tmu-text-disabled);font-style:italic">drop player here</span>';
                        return `${CountryFlag.render(p.country, 'tmtc-player-flag')}<a href="/players/${p.player_id}/" style="color:var(--tmu-text-inverse);text-decoration:none;font-weight:600" onclick="event.stopPropagation()">${escHtml(p.lastname || p.name || '')}</a>${playerStatusIconsHtml(p)}`;
                    },
                },
                {
                    key: 'rec_sort', label: '★', align: 'c', width: '58px',
                    render: (v, p) => {
                        if (p._isBenchPlaceholder && !p._benchSlotFilled) return '';
                        const starValue = p._fmRec != null ? p._fmRec : v;
                        return TmStars.recommendation(starValue, 'tmtc-rec-stars tmtc-rec-stars-sm') || '—';
                    },
                },
                {
                    key: '_fmRec', label: 'REC', align: 'r', width: '40px',
                    sortable: false,
                    render: (v, p) => (p._isBenchPlaceholder && !p._benchSlotFilled) ? '' : v != null
                        ? `<span class="tmu-tabular" style="color:${gc(v, REC_THRESHOLDS)};font-weight:700">${v.toFixed(2)}</span>`
                        : `<span style="color:var(--tmu-text-dim)">—</span>`,
                },
                {
                    key: '_fmR5', label: 'R5', align: 'r', width: '40px',
                    sortable: false,
                    render: (v, p) => (p._isBenchPlaceholder && !p._benchSlotFilled) ? '' : v != null
                        ? `<span class="tmu-tabular" style="color:${gc(v, R5_THRESHOLDS)};font-weight:700">${TmUtils.formatR5(v)}</span>`
                        : `<span style="color:var(--tmu-text-dim)">—</span>`,
                },
                {
                    key: 'routine', label: 'Routine', align: 'r', width: '42px',
                    render: (v, p) => (p._isBenchPlaceholder && !p._benchSlotFilled) ? '' : v != null && v > 0
                        ? `<span class="tmu-tabular" style="color:${gc(v, RTN_THRESHOLDS)};font-weight:700">${Number(v).toFixed(1)}</span>`
                        : `<span style="color:var(--tmu-text-dim)">—</span>`,
                },
            ],
            emptyText: 'No players.',
        });

        // Delegated dragstart for table row drag (type='sidebar')
        wrap.addEventListener('dragstart', e => {
            const tr = e.target.closest('tr[data-player-id]');
            if (!tr || !wrap.contains(tr)) return;
            const pid = tr.dataset.playerId;
            if (!pid || pid.startsWith('_bench_')) return;
            const fromRoleKey = tr.dataset.benchRole || null;
            dragState = { pid, fromType: 'sidebar', fromRoleKey };
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', pid);
            tr.classList.add('tmtc-drag-source');
            // Show empty field slots: always if player is already on field, or if field has room for one more
            if (getFieldPosKey(pid) || getOccupiedFieldKeys().size < 11) fieldEl.classList.add('is-dragging');
        });

        // Delegated dragover/drop for bench-placeholder rows and player rows
        let _hovRow = null;
        const _setHovRow = tr => {
            if (_hovRow === tr) return;
            if (_hovRow) _hovRow.classList.remove('tmtc-drag-over');
            _hovRow = tr;
            if (tr) tr.classList.add('tmtc-drag-over');
        };
        wrap.addEventListener('dragover', e => {
            if (!dragState) return;
            const tr = e.target.closest('tr[data-bench-role], tr[data-player-id]');
            if (tr) { e.preventDefault(); _setHovRow(tr); }
        });
        wrap.addEventListener('dragleave', e => {
            if (_hovRow && !wrap.contains(e.relatedTarget)) _setHovRow(null);
        });
        wrap.addEventListener('drop', async e => {
            _setHovRow(null);
            const benchTr = e.target.closest('tr[data-bench-role]');
            const playerTr = !benchTr && e.target.closest('tr[data-player-id]');
            if (!benchTr && !playerTr) return;
            e.preventDefault();
            clearDragVisuals();
            const ds = dragState; dragState = null;
            if (!ds) return;
            const { pid } = ds;
            const player = players_by_id[pid];
            if (!player) return;
            const changed = {};

            if (benchTr) {
                // Drop on empty sub-placeholder → assign as that sub
                const roleKey = benchTr.dataset.benchRole;
                const prevPid = assignment[roleKey] ? String(assignment[roleKey]) : null;
                if (prevPid === String(pid)) { refreshSquadTable(); return; }
                // Foreign limit: bench counts toward squad-of-16
                if (clubCountry && isForeigner(player)) {
                    const freeing = prevPid && isForeigner(players_by_id[prevPid]);
                    const alreadyIn = [...getOccupiedFieldKeys(), ...BENCH_SLOTS].some(k => String(assignment[k]) === String(pid));
                    if (!freeing && !alreadyIn && countSquadForeigners() >= 5) {
                        TmAlert.show({ message: 'Foreign player limit is 5 (squad of 16)', tone: 'warning', duration: 3000 });
                        return;
                    }
                }
                clearSourceOldSpot(ds, changed);
                if (prevPid) backfillDisplaced(prevPid, ds, changed);
                assignment[roleKey] = pid;
                changed[pid] = roleKey;
                renderBenchSlot(benchSlotEls[roleKey], player, BENCH_LABELS[roleKey] || roleKey);
                if (ds.fromPosKey) normalizeZone(POSKEY_TO_ZONE[ds.fromPosKey], changed);

            } else {
                // Drop on player row
                const targetPid = playerTr.dataset.playerId;
                if (!targetPid || targetPid === String(pid)) { refreshSquadTable(); return; }
                const targetPosKey = getFieldPosKey(targetPid);
                const targetBenchRole = !targetPosKey ? getBenchRole(targetPid) : null;

                if (targetPosKey) {
                    // Take their field slot
                    const vacatingPosKey = ds.fromType === 'field' ? ds.fromPosKey : null;
                    if (clubCountry && projectedForeigners(pid, vacatingPosKey) > 5) {
                        TmAlert.show({ message: 'Foreign player limit is 5 (squad of 16)', tone: 'warning', duration: 3000 });
                        return;
                    }
                    clearSourceOldSpot(ds, changed);
                    backfillDisplaced(targetPid, ds, changed);
                    assignment[targetPosKey] = pid;
                    changed[pid] = targetPosKey;
                    renderFieldSlot(slotEls[targetPosKey], player, targetPosKey);
                    for (const zone of FIELD_ZONES) normalizeZone(zone.key, changed);
                    refreshSquadTable();
                    try {
                        const outPid = Object.keys(changed).find(p => changed[p] === 'out') || null;
                        await postSave(buildAssocForSave(outPid), changed, reserves, national, miniGameId);
                        TmAlert.show({ message: 'Saved', tone: 'success' });
                        notifyChange();
                    } catch { TmAlert.show({ message: 'Save failed', tone: 'error' }); }
                    return;

                } else if (targetBenchRole && BENCH_SLOTS.includes(targetBenchRole)) {
                    // Take their bench sub role
                    clearSourceOldSpot(ds, changed);
                    backfillDisplaced(targetPid, ds, changed);
                    assignment[targetBenchRole] = pid;
                    changed[pid] = targetBenchRole;
                    renderBenchSlot(benchSlotEls[targetBenchRole], player, BENCH_LABELS[targetBenchRole] || targetBenchRole);
                    for (const zone of FIELD_ZONES) normalizeZone(zone.key, changed);

                } else {
                    refreshSquadTable(); return; // out-player row, no-op
                }
            }

            refreshSquadTable();
            try {
                const outPid = Object.keys(changed).find(p => changed[p] === 'out') || null;
                await postSave(buildAssocForSave(outPid), changed, reserves, national, miniGameId);
                TmAlert.show({ message: 'Saved', tone: 'success' });
                notifyChange();
            } catch { TmAlert.show({ message: 'Save failed', tone: 'error' }); }
        });

        return wrap;
    }

    function refreshSquadTable() {
        for (const [posKey, slotEl] of Object.entries(slotEls)) {
            const pid = assignment[posKey];
            renderFieldSlot(slotEl, pid ? (players_by_id[String(pid)] || null) : null, posKey);
        }
        for (const [role, slotEl] of Object.entries(benchSlotEls)) {
            const pid = assignment[role];
            renderBenchSlot(slotEl, pid ? (players_by_id[String(pid)] || null) : null, BENCH_LABELS[role] || role);
        }
        tblWrap?.refresh({ items: sortedPlayers() });
        refreshFieldOverlay();
    }

    // ══════════════════════════════════════════════════════════════════════
    // DRAG & DROP
    // ══════════════════════════════════════════════════════════════════════

    // dragState: { pid, fromType:'field'|'bench'|'sidebar', fromPosKey?, fromRoleKey? }
    let dragState = null;

    function onFieldDragStart(e) {
        const pid = e.currentTarget.dataset.playerId;
        const posKey = e.currentTarget.dataset.posKey;
        if (!pid) { e.preventDefault(); return; }
        dragState = { pid, fromType: 'field', fromPosKey: posKey };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', pid);
        e.currentTarget.classList.add('tmtc-drag-source');
        fieldEl.classList.add('is-dragging');
    }

    function onBenchDragStart(e) {
        e.stopPropagation();
        const pid = e.currentTarget.dataset.playerId;
        const roleKey = e.currentTarget.closest('.tmtc-bench-slot')?.dataset.role || '';
        if (!pid) { e.preventDefault(); return; }
        dragState = { pid, fromType: 'bench', fromRoleKey: roleKey };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', pid);
        e.currentTarget.classList.add('tmtc-drag-source');
        // Bench player is NOT on the field — ghost slots stay hidden (no is-dragging)
    }

    // Clear the dragged player from its origin spot.
    // Side-effect for 'sidebar': sets ds.fromPosKey to the old field posKey (if any),
    // so callers can normalize that zone afterwards.
    function clearSourceOldSpot(ds, changed) {
        const { pid, fromType, fromPosKey, fromRoleKey } = ds;
        if (fromType === 'field' && fromPosKey) {
            assignment[fromPosKey] = null;
            if (slotEls[fromPosKey]) renderFieldSlot(slotEls[fromPosKey], null, fromPosKey);
        } else if (fromType === 'bench' && fromRoleKey) {
            assignment[fromRoleKey] = null;
            renderBenchSlot(benchSlotEls[fromRoleKey], null, BENCH_LABELS[fromRoleKey] || fromRoleKey);
        } else if (fromType === 'sidebar') {
            const oldPk = getFieldPosKey(pid);
            if (oldPk) {
                assignment[oldPk] = null;
                if (slotEls[oldPk]) renderFieldSlot(slotEls[oldPk], null, oldPk);
                ds.fromPosKey = oldPk;    // so caller can normalize
            }
            const oldRole = getBenchRole(pid);
            if (oldRole) {
                assignment[oldRole] = null;
                renderBenchSlot(benchSlotEls[oldRole], null, BENCH_LABELS[oldRole] || oldRole);
                ds.fromRoleKey = oldRole; // so backfillDisplaced can swap
            }
        }
    }

    // Send the player displaced from the target slot back to the drag-source slot (swap),
    // or record 'out' if there's no source slot to send them to.
    function backfillDisplaced(displacedPid, ds, changed) {
        const { fromType, fromPosKey, fromRoleKey } = ds;
        if (fromType === 'field' && fromPosKey) {
            assignment[fromPosKey] = displacedPid;
            if (slotEls[fromPosKey]) renderFieldSlot(slotEls[fromPosKey], players_by_id[displacedPid] || null, fromPosKey);
            changed[displacedPid] = fromPosKey;
        } else if ((fromType === 'bench' || fromType === 'sidebar') && fromRoleKey) {
            assignment[fromRoleKey] = displacedPid;
            renderBenchSlot(benchSlotEls[fromRoleKey], players_by_id[displacedPid] || null, BENCH_LABELS[fromRoleKey] || fromRoleKey);
            changed[displacedPid] = fromRoleKey;
        } else {
            changed[displacedPid] = 'out';
        }
    }

    function setupDropTarget(slotEl, posKey) {
        let n = 0;
        slotEl.addEventListener('dragenter', e => { e.preventDefault(); if (++n === 1) slotEl.classList.add('tmtc-drag-over'); });
        slotEl.addEventListener('dragleave', () => { if (--n <= 0) { n = 0; slotEl.classList.remove('tmtc-drag-over'); } });
        slotEl.addEventListener('dragover', e => e.preventDefault());
        slotEl.addEventListener('drop', async e => {
            e.preventDefault();
            n = 0; slotEl.classList.remove('tmtc-drag-over');
            clearDragVisuals();
            const ds = dragState; dragState = null;
            if (!ds) return;

            const { pid } = ds;
            const player = players_by_id[pid];
            if (!player) return;

            const prevPid = assignment[posKey] ? String(assignment[posKey]) : null;
            if (prevPid === String(pid)) return; // same slot, no-op

            // Empty slots only accept players already on the field (prevents adding a 12th player).
            // If the slot is empty AND the source is not from the field, only block when the field is already full (11).
            if (!prevPid && ds.fromType !== 'field' && getOccupiedFieldKeys().size >= 11) return;

            // Foreign player limit: max 5 across the full 16-man squad.
            const vacatingPosKey = ds.fromType === 'field' ? ds.fromPosKey : null;
            if (clubCountry && projectedForeigners(pid, vacatingPosKey) > 5) {
                TmAlert.show({ message: 'Foreign player limit is 5 (squad of 16)', tone: 'warning', duration: 3000 });
                return;
            }

            const changed = {};

            clearSourceOldSpot(ds, changed);       // for sidebar: also clears old field slot

            if (prevPid) backfillDisplaced(prevPid, ds, changed);

            assignment[posKey] = pid;
            changed[pid] = posKey;
            renderFieldSlot(slotEl, player, posKey);

            // Normalize all zones after every drop
            for (const zone of FIELD_ZONES) normalizeZone(zone.key, changed);
            refreshSquadTable();

            try {
                const outPid = Object.keys(changed).find(p => changed[p] === 'out') || null;
                await postSave(buildAssocForSave(outPid), changed, reserves, national, miniGameId);
                TmAlert.show({ message: 'Saved', tone: 'success' });
                notifyChange();
            } catch { TmAlert.show({ message: 'Save failed', tone: 'error' }); }
        });
    }

    function setupBenchDropTarget(el, roleKey) {
        let n = 0;
        el.addEventListener('dragenter', e => { e.preventDefault(); if (++n === 1) el.classList.add('tmtc-drag-over'); });
        el.addEventListener('dragleave', () => { if (--n <= 0) { n = 0; el.classList.remove('tmtc-drag-over'); } });
        el.addEventListener('dragover', e => e.preventDefault());
        el.addEventListener('drop', async e => {
            e.preventDefault();
            n = 0; el.classList.remove('tmtc-drag-over');
            clearDragVisuals();
            const ds = dragState; dragState = null;
            if (!ds) return;

            const { pid } = ds;
            const player = players_by_id[pid];
            if (!player) return;

            const prevPid = assignment[roleKey] ? String(assignment[roleKey]) : null;
            if (prevPid === String(pid)) return;

            // Foreign player limit: bench counts toward the squad-of-16 limit.
            // If the slot was already occupied by this or another foreigner, that slot is vacated first.
            if (clubCountry && isForeigner(player)) {
                const currentlyOccupyingForeigner = prevPid && isForeigner(players_by_id[prevPid]);
                const alreadyOnBench = BENCH_SLOTS.some(r => r !== roleKey && assignment[r] != null && String(assignment[r]) === String(pid));
                const alreadyOnField = !!getOccupiedFieldKeys().size && [...getOccupiedFieldKeys()].some(pk => String(assignment[pk]) === String(pid));
                if (!alreadyOnBench && !alreadyOnField && !currentlyOccupyingForeigner) {
                    if (countSquadForeigners() >= 5) {
                        TmAlert.show({ message: 'Foreign player limit is 5 (squad of 16)', tone: 'warning', duration: 3000 });
                        return;
                    }
                }
            }

            const changed = {};

            clearSourceOldSpot(ds, changed);
            if (prevPid) backfillDisplaced(prevPid, ds, changed);

            assignment[roleKey] = pid;
            changed[pid] = roleKey;
            renderBenchSlot(el, player, BENCH_LABELS[roleKey] || roleKey);

            for (const zone of FIELD_ZONES) normalizeZone(zone.key, changed);
            refreshSquadTable();

            try {
                const outPid = Object.keys(changed).find(p => changed[p] === 'out') || null;
                await postSave(buildAssocForSave(outPid), changed, reserves, national, miniGameId);
                TmAlert.show({ message: 'Saved', tone: 'success' });
                notifyChange();
            } catch { TmAlert.show({ message: 'Save failed', tone: 'error' }); }
        });
    }

    function clearDragVisuals() {
        document.querySelectorAll('.tmtc-drag-source, .tmtc-drag-over')
            .forEach(el => el.classList.remove('tmtc-drag-source', 'tmtc-drag-over'));
        fieldEl.classList.remove('is-dragging');
    }

    document.addEventListener('dragend', () => { dragState = null; clearDragVisuals(); });

    // ══════════════════════════════════════════════════════════════════════
    // INITIAL BUILD
    // ══════════════════════════════════════════════════════════════════════

    buildField();

    // Sub slots
    for (const role of BENCH_SLOTS) {
        benchSlotEls[role] = makeBenchSlot(role);
    }
    // Special role slots created on demand via mountSpecialRoles()
    for (const role of SPECIAL_SLOTS) {
        benchSlotEls[role] = makeBenchSlot(role);
    }

    const squadTarget = externalSquadContainer || squadCol;
    tblWrap = buildSquadTable();
    squadTarget.appendChild(tblWrap);

    // ══════════════════════════════════════════════════════════════════════
    // EXTERNAL API
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Apply a new assignment (used by panel for Pick Best 11 / formation change).
     *
     * @param {object} newAssignment   — { posKey: pid } for field; may also include bench roles.
     *                                   Bench roles in newAssignment clear & reset subs.
     *                                   Bench roles NOT in newAssignment are preserved.
     * @param {Set}    [newActiveKeys] — When provided, rebuilds field DOM for the new formation.
     */
    async function applyAssignment(newAssignment) {
        // Snapshot who was on the field before clearing
        const prevFieldPids = new Set(
            [...getOccupiedFieldKeys()].map(pk => String(assignment[pk]))
        );

        // Clear currently occupied field positions
        for (const pk of getOccupiedFieldKeys()) assignment[pk] = null;
        // Clear bench only if the new assignment explicitly touches bench slots
        const touchesBench = BENCH_SLOTS.some(r => r in newAssignment);
        if (touchesBench) for (const role of BENCH_SLOTS) assignment[role] = null;

        const changed = {};
        for (const [key, pid] of Object.entries(newAssignment)) {
            if (!pid) continue;
            assignment[key] = pid;
            changed[String(pid)] = key;
        }

        // Mark players who were on the field before but are not placed anywhere now
        for (const pid of prevFieldPids) {
            if (!changed[pid]) changed[pid] = 'out';
        }

        // Rebuild field DOM — zones and slots are derived from the updated assignment
        buildField();
        // Re-render all bench slots
        for (const [role, el] of Object.entries(benchSlotEls)) {
            const pid = assignment[role];
            renderBenchSlot(el, pid ? (players_by_id[pid] || null) : null, BENCH_LABELS[role] || role);
        }

        refreshSquadTable();
        try {
            const outPid = Object.keys(changed).find(p => changed[p] === 'out') || null;
            await postSave(buildAssocForSave(outPid), changed, reserves, national, miniGameId);
            TmAlert.show({ message: 'Saved', tone: 'success' });
            notifyChange();
        } catch { TmAlert.show({ message: 'Save failed', tone: 'error' }); }
    }

    /** Snapshot of the full current assignment { posKey|role → pid }. */
    const getAssignment = () => ({ ...assignment });

    /** Occupied field posKeys derived from current assignment — always in sync. */
    const getActiveKeys = () => getOccupiedFieldKeys();

    /** Subscribe to field-change events. Returns an unsubscribe function. */
    const subscribe = fn => {
        changeListeners.push(fn);
        return () => { const i = changeListeners.indexOf(fn); if (i >= 0) changeListeners.splice(i, 1); };
    };

    // Mount special roles (captain/corner/penalty/freekick) into an external container
    // as drag-drop list items. Called by mountTacticsSettings.
    function mountSpecialRoles(target) {
        const ROLE_LABELS = { captain: 'Captain', corner: 'Corners', penalty: 'Penalty', freekick: 'Free Kick' };
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

            // Render current player or empty
            const renderSlot = () => {
                const pid = assignment[role];
                const p = pid ? players_by_id[String(pid)] : null;
                slot.innerHTML = '';
                if (p) {
                    const chip = document.createElement('span');
                    chip.className = 'tmtc-role-chip';
                    chip.setAttribute('draggable', 'true');
                    chip.dataset.playerId = p.player_id;
                    chip.textContent = p.lastname || p.name || '';
                    chip.addEventListener('dragstart', e => {
                        dragState = { pid: String(p.player_id), fromType: 'bench', fromRoleKey: role };
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(p.player_id));
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

            // Drop target
            let _n = 0;
            slot.addEventListener('dragenter', e => { e.preventDefault(); if (++_n === 1) slot.classList.add('tmtc-drag-over'); });
            slot.addEventListener('dragleave', () => { if (--_n <= 0) { _n = 0; slot.classList.remove('tmtc-drag-over'); } });
            slot.addEventListener('dragover', e => e.preventDefault());
            slot.addEventListener('drop', async e => {
                e.preventDefault();
                _n = 0; slot.classList.remove('tmtc-drag-over');
                const ds = dragState; dragState = null;
                clearDragVisuals();
                if (!ds) return;
                const { pid } = ds;
                const player = players_by_id[pid];
                if (!player) return;
                const prevPid = assignment[role] ? String(assignment[role]) : null;
                if (prevPid === String(pid)) return;
                const changed = {};
                // Special roles are additive — player stays on field/bench, only role assignment changes.
                // Do NOT call clearSourceOldSpot (that would remove them from their field slot).
                // Just clear the previous holder of this role slot (don't backfill them anywhere).
                if (prevPid) {
                    changed[prevPid] = 'out';
                }
                assignment[role] = pid;
                changed[pid] = role;
                refreshSquadTable();
                // re-render all role slots
                for (const r of SPECIAL_SLOTS) {
                    target.querySelector(`[data-role="${r}"] .tmtc-role-slot`)?.dispatchEvent(new CustomEvent('_refresh'));
                }
                try {
                    const outPid = Object.keys(changed).find(p => changed[p] === 'out') || null;
                    await postSave(buildAssocForSave(outPid), changed, reserves, national, miniGameId);
                    TmAlert.show({ message: 'Saved', tone: 'success' });
                    notifyChange();
                } catch { TmAlert.show({ message: 'Save failed', tone: 'error' }); }
            });

            // Listen for internal refresh events
            slot.addEventListener('_refresh', renderSlot);
            // Also refresh when assignment changes via subscribe
            changeListeners.push(renderSlot);

            target.appendChild(row);
        }
    }

    return { refresh: refreshSquadTable, applyAssignment, getAssignment, getActiveKeys, subscribe, mountSpecialRoles };
}
