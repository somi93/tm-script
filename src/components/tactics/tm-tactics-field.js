import { TmPosition } from '../../lib/tm-position.js';
import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmAlert } from '../shared/tm-alert.js';
import { TmStars } from '../shared/tm-stars.js';
import { TmPlayerTooltip } from '../player/tooltip/tm-player-tooltip.js';
import { playerStatusIconsHtml } from '../shared/tm-player-status-icons.js';

'use strict';

const { FIELD_ZONES, RTN_THRESHOLDS } = TmConst;
const { escHtml } = TmUtils;

// Symmetric target rank indices for N occupied slots among `total` active slots in a zone.
export function getTargetRanks(total, count) {
    if (count <= 0) return [];
    if (count >= total) return Array.from({ length: total }, (_, i) => i);
    const c = Math.floor((total - 1) / 2);
    const result = [];
    if (count % 2 === 1) result.push(c);
    for (let r = 1; result.length < count; r++) {
        if (c - r >= 0) result.push(c - r);
        if (result.length < count && c + r < total) result.push(c + r);
    }
    return result.sort((a, b) => a - b);
}

const gc = TmUtils.getColor;

/**
 * Mount the tactics field: pitch grid + special roles.
 *
 * @param {HTMLElement} container  — the left-column div (tmtc-field-col)
 * @param {object}      ctx        — shared context:
 *   { players_by_id, CLUB_COUNTRY, isForeigner, countSquadForeigners,
 *     getPlayerAtSlot, getPlayerSlot, setPlayerSlot, isFieldSlot,
 *     getOccupiedFieldKeys, drag, save, refreshAll }
 *
 * @returns {{ refresh, rebuild, renderSlot, setDragging,
 *             clearDragVisuals, normalizeZone, normalizeAll }}
 */
export function mountTacticsField(container, ctx) {
    const {
        players_by_id, CLUB_COUNTRY, isForeigner, countSquadForeigners,
        getPlayerAtSlot, getPlayerSlot, setPlayerSlot,
        isFieldSlot,
        getOccupiedFieldKeys, drag, save,
        readOnly = false,
    } = ctx;

    // ── Tooltip delegation ───────────────────────────────────────────────
    let hoverTimer = null;
    container.addEventListener('mouseover', event => {
        const el = event.target.closest('.tmtc-slot[data-player-id], .tmtc-bench-inner[data-player-id]');
        if (!el || !container.contains(el) || el.contains(event.relatedTarget)) return;
        const player = players_by_id[String(el.dataset.playerId)] || null;
        if (!player) return;
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => TmPlayerTooltip.show(el, player), 80);
    });
    container.addEventListener('mouseout', event => {
        const el = event.target.closest('.tmtc-slot[data-player-id], .tmtc-bench-inner[data-player-id]');
        if (!el || !container.contains(el) || el.contains(event.relatedTarget)) return;
        clearTimeout(hoverTimer);
        TmPlayerTooltip.hide();
    });

    // ── Field DOM ────────────────────────────────────────────────────────
    const fieldEl = document.createElement('div');
    fieldEl.className = 'tmtc-field';
    container.appendChild(fieldEl);

    const topSpacer = document.createElement('div');
    topSpacer.className = 'tmtc-field-spacer';
    fieldEl.appendChild(topSpacer);

    const fieldOverlayBar = document.createElement('div');
    fieldOverlayBar.className = 'tmtc-fob';
    topSpacer.appendChild(fieldOverlayBar);

    const BADGE_ZONES_LU = [...FIELD_ZONES].reverse().filter(z => z.key !== 'gk');

    function getFormationStr() {
        return BADGE_ZONES_LU
            .map(z => z.cols.filter(pk => pk && getPlayerAtSlot(pk)).length)
            .filter(n => n > 0)
            .join('-') || '?';
    }

    function refreshFieldOverlay() {
        const activeKeys = getOccupiedFieldKeys();
        let totalR5 = 0, countR5 = 0, totalRtn = 0, countRtn = 0, totalAge = 0, countAge = 0;
        for (const posKey of activeKeys) {
            const p = getPlayerAtSlot(posKey);
            if (!p) continue;
            const posId = TmConst.POSITION_MAP[posKey]?.id;
            if (p.allPositionRatings?.length && posId != null) {
                const rating = p.allPositionRatings.find(r => r.id === posId);
                if (rating) { totalR5 += parseFloat(rating.r5) || 0; countR5++; }
            }
            if (p.routine != null && Number(p.routine) > 0) { totalRtn += parseFloat(p.routine); countRtn++; }
            const age = (p.ageMonths != null) ? p.ageMonths / 12 : (parseInt(p.age) || 0);
            if (age > 0) { totalAge += age; countAge++; }
        }
        const r5 = countR5 > 0 ? (totalR5 / countR5).toFixed(2) : null;
        const rtn = countRtn > 0 ? (totalRtn / countRtn).toFixed(1) : null;
        const age = countAge > 0 ? (totalAge / countAge).toFixed(1) : null;
        const sep = `<span class="tmtc-fob-sep">·</span>`;
        const item = (label, value, color) =>
            `<span class="tmtc-fob-item"><span class="tmtc-fob-label">${label}</span><span class="tmtc-fob-value" style="color:${color}">${value}</span></span>`;
        fieldOverlayBar.innerHTML = [
            `<span class="tmtc-fob-formation">${getFormationStr()}</span>`,
            sep, item('R5', r5 ?? '—', r5 ? gc(parseFloat(r5), TmConst.R5_THRESHOLDS) : 'var(--tmu-text-faint)'),
            sep, item('Rtn', rtn ?? '—', rtn ? gc(parseFloat(rtn), RTN_THRESHOLDS) : 'var(--tmu-text-faint)'),
            sep, item('Age', age ?? '—', 'var(--tmu-text-muted)'),
        ].join('');
    }

    const slotEls = {};  // posKey → field slot element

    // ── Field grid build ─────────────────────────────────────────────────

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

    // ── Zone normalization ───────────────────────────────────────────────

    function normalizeZone(zoneKey, changed) {
        const zone = FIELD_ZONES.find(z => z.key === zoneKey);
        if (!zone) return;
        const centerPks = [zone.cols[1], zone.cols[2], zone.cols[3]].filter(pk => pk != null);
        if (!centerPks.length) return;
        const occupied = centerPks.filter(pk => getPlayerAtSlot(pk) != null);
        if (!occupied.length) return;
        const targetRanks = getTargetRanks(centerPks.length, occupied.length);
        const targetPks = targetRanks.map(r => centerPks[r]);
        if (occupied.every((pk, i) => pk === targetPks[i])) return;
        const occupiedPlayers = occupied.map(pk => getPlayerAtSlot(pk));
        for (const p of occupiedPlayers) setPlayerSlot(p, null);
        for (let i = 0; i < occupiedPlayers.length; i++) {
            setPlayerSlot(occupiedPlayers[i], targetPks[i]);
            if (changed) changed[String(occupiedPlayers[i].id)] = targetPks[i];
        }
        for (const pk of centerPks) {
            if (slotEls[pk]) renderFieldSlot(slotEls[pk], getPlayerAtSlot(pk), pk);
        }
    }

    // ── Slot factories & renderers ───────────────────────────────────────

    const getPositionRating = (player, posKey) => {
        const posId = TmConst.POSITION_MAP[String(posKey || '').toLowerCase()]?.id;
        return posId != null ? (player?.positions?.find(p => p.id === posId) ?? null) : null;
    };

    function makeFieldSlot(posKey) {
        const player = getPlayerAtSlot(posKey);
        const slotEl = document.createElement('div');
        slotEl.className = 'tmtc-slot';
        slotEl.dataset.posKey = posKey;
        renderFieldSlot(slotEl, player, posKey);
        if (!readOnly) setupDropTarget(slotEl, posKey);
        return slotEl;
    }

    function renderFieldSlot(slotEl, player, posKey) {
        if (!slotEl) return;
        slotEl.innerHTML = '';
        slotEl.dataset.posKey = posKey;
        slotEl.classList.toggle('tmtc-slot-empty', !player);
        if (player) {
            if (!readOnly) {
                slotEl.setAttribute('draggable', 'true');
                slotEl.dataset.playerId = String(player.id);
                slotEl.removeEventListener('dragstart', onFieldDragStart);
                slotEl.addEventListener('dragstart', onFieldDragStart);
            } else {
                slotEl.dataset.playerId = String(player.id);
            }
            const slotRating = (v => v != null ? TmUtils.formatR5(v, '—') : '—')(getPositionRating(player, posKey)?.r5);
            const slotRec = getPositionRating(player, posKey)?.rec ?? null;
            const slotRoutine = player.routine > 0 ? Number(player.routine).toFixed(1) : '—';
            const moodPenalty = TmPosition.moodPenalty(player, posKey);
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
            slotEl.innerHTML = `<span class="tmtc-slot-poskey">${escHtml(posKey.toUpperCase())}</span>`;
        }
    }

    // ── Drag & drop ──────────────────────────────────────────────────────

    function onFieldDragStart(e) {
        const pid = e.currentTarget.dataset.playerId;
        const posKey = e.currentTarget.dataset.posKey;
        if (!pid) { e.preventDefault(); return; }
        drag.state = { pid, fromType: 'field', fromPosKey: posKey };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', pid);
        e.currentTarget.classList.add('tmtc-drag-source');
        fieldEl.classList.add('is-dragging');
    }

    function clearDragVisuals() {
        document.querySelectorAll('.tmtc-drag-source, .tmtc-drag-over')
            .forEach(el => el.classList.remove('tmtc-drag-source', 'tmtc-drag-over'));
        fieldEl.classList.remove('is-dragging');
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
            const ds = drag.state; drag.state = null;
            if (!ds) return;
            const { pid } = ds;
            const player = players_by_id[pid];
            if (!player) return;
            const prevPlayer = getPlayerAtSlot(posKey);
            if (prevPlayer && String(prevPlayer.id) === pid) return;
            // Don't exceed 11 field players unless this player is already on field
            if (!prevPlayer && !isFieldSlot(getPlayerSlot(player)) && getOccupiedFieldKeys().size >= 11) return;
            // Foreigner limit: count excluding mover + displaced, then add mover
            if (CLUB_COUNTRY) {
                const projected = countSquadForeigners()
                    + (isForeigner(player) && !getPlayerSlot(player) ? 1 : 0)
                    - (prevPlayer && isForeigner(prevPlayer) ? 1 : 0);
                if (projected > 5) {
                    TmAlert.show({ message: 'Foreign player limit is 5 (squad of 16)', tone: 'warning', duration: 3000 });
                    return;
                }
            }
            const changed = {};
            const sourceSlot = getPlayerSlot(player);
            setPlayerSlot(player, posKey);
            changed[pid] = posKey;
            if (prevPlayer) {
                setPlayerSlot(prevPlayer, sourceSlot);
                changed[String(prevPlayer.id)] = sourceSlot ?? 'out';
            }
            normalizeAll(changed);
            ctx.refreshAll();
            await save(changed);
        });
    }

    if (!readOnly) document.addEventListener('dragend', () => { drag.state = null; clearDragVisuals(); });

    buildField();

    // ── Public API ───────────────────────────────────────────────────────

    function refresh() {
        for (const [posKey, slotEl] of Object.entries(slotEls)) {
            renderFieldSlot(slotEl, getPlayerAtSlot(posKey), posKey);
        }
        refreshFieldOverlay();
    }

    function rebuild() {
        buildField();
        refreshFieldOverlay();
    }

    const normalizeAll = changed => { for (const zone of FIELD_ZONES) normalizeZone(zone.key, changed); };

    return {
        refresh,
        rebuild,
        renderSlot: posKey => renderFieldSlot(slotEls[posKey], getPlayerAtSlot(posKey), posKey),
        setDragging: bool => fieldEl.classList.toggle('is-dragging', bool),
        clearDragVisuals,
        normalizeZone,
        normalizeAll,
    };
}

/**
 * Display-only field — no drag/drop, no save.
 *
 * @param {HTMLElement} container
 * @param {object}      posPlayerMap  — { [posKey]: playerObject }
 * @param {Array}       players       — full player list (for tooltips)
 */
export function mountTacticsFieldReadOnly(container, posPlayerMap, players = []) {
    const players_by_id = Object.fromEntries(players.map(p => [String(p.id), p]));
    const { POSITION_MAP } = TmConst;
    return mountTacticsField(container, {
        readOnly: true,
        players_by_id,
        getPlayerAtSlot:      posKey => posPlayerMap[posKey] ?? null,
        getPlayerSlot:        ()     => null,
        setPlayerSlot:        ()     => {},
        isFieldSlot:          slot   => slot != null && POSITION_MAP[slot] != null,
        getOccupiedFieldKeys: ()     => new Set(Object.keys(posPlayerMap).filter(k => POSITION_MAP[k])),
        CLUB_COUNTRY: null,
        isForeigner:          ()     => false,
        countSquadForeigners: ()     => 0,
        drag:    { state: null },
        save:    () => {},
        refreshAll: () => {},
    });
}
