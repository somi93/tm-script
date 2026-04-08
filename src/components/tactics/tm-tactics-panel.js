import { TmAutocomplete } from '../shared/tm-autocomplete.js';
import { TmButton } from '../shared/tm-button.js';
import { TmMetric } from '../shared/tm-metric.js';
import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { mountTacticsSettings } from './tm-tactics-settings.js';

'use strict';

// Badge zones ordered DEF→FWD (FIELD_ZONES is FWD-first and includes GK — we reverse and skip GK)
const BADGE_ZONES = [...TmConst.FIELD_ZONES].reverse().filter(z => z.key !== 'gk');

function getFormationName(assignment, activeKeys) {
    return BADGE_ZONES
        .map(z => z.cols.filter(pk => pk && activeKeys.has(pk) && assignment[pk] && String(assignment[pk]) !== '0').length)
        .filter(n => n > 0)
        .join('-') || '?';
}

const DEF_KEYS = {
    1: ['dc'],
    2: ['dcl', 'dcr'],
    3: ['dcl', 'dc', 'dcr'],
    4: ['dl', 'dcl', 'dcr', 'dr'],
    5: ['dl', 'dcl', 'dc', 'dcr', 'dr'],
};
const DM_KEYS = {
    1: ['dmc'],
    2: ['dmcl', 'dmcr'],
    3: ['dml', 'dmc', 'dmr'],
    4: ['dml', 'dmcl', 'dmcr', 'dmr'],
    5: ['dml', 'dmcl', 'dmc', 'dmcr', 'dmr'],
};
const MID_KEYS = {
    1: ['mc'],
    2: ['mcl', 'mcr'],
    3: ['mcl', 'mc', 'mcr'],
    4: ['ml', 'mcl', 'mcr', 'mr'],
    5: ['ml', 'mcl', 'mc', 'mcr', 'mr'],
};
const OM_KEYS = {
    1: ['omc'],
    2: ['omcl', 'omcr'],
    3: ['oml', 'omc', 'omr'],
    4: ['oml', 'omcl', 'omcr', 'omr'],
    5: ['oml', 'omcl', 'omc', 'omcr', 'omr'],
};
const FWD_KEYS = {
    1: ['fc'],
    2: ['fcl', 'fcr'],
    3: ['fcl', 'fc', 'fcr'],
};

function buildPresetPositions(nDef, nDm, nMid, nOm, nFwd) {
    const pos = new Array(24).fill(null);
    pos[0] = 'gk';
    const set = (start, keys) => (keys || []).forEach((k, i) => { pos[start + i] = k; });
    set(1, DEF_KEYS[nDef]);
    set(6, DM_KEYS[nDm]);
    set(11, MID_KEYS[nMid]);
    set(16, OM_KEYS[nOm]);
    set(21, FWD_KEYS[nFwd]);
    return pos;
}

const FORMATION_PRESETS = {
    '4-4-2': buildPresetPositions(4, 0, 4, 0, 2),
    '4-3-3': buildPresetPositions(4, 0, 3, 0, 3),
    '4-2-3-1': buildPresetPositions(4, 2, 0, 3, 1),
    '4-5-1': buildPresetPositions(4, 0, 5, 0, 1),
    '4-1-4-1': buildPresetPositions(4, 1, 4, 0, 1),
    '4-3-2-1': buildPresetPositions(4, 0, 3, 2, 1),
    '4-2-2-2': buildPresetPositions(4, 2, 2, 0, 2),
    '4-1-2-3': buildPresetPositions(4, 1, 2, 0, 3),
    '3-5-2': buildPresetPositions(3, 0, 5, 0, 2),
    '3-4-3': buildPresetPositions(3, 0, 4, 0, 3),
    '5-3-2': buildPresetPositions(5, 0, 3, 0, 2),
    '5-4-1': buildPresetPositions(5, 0, 4, 0, 1),
    '4-1-3-2': buildPresetPositions(4, 1, 3, 0, 2),
};
const FORMATION_NAMES = Object.keys(FORMATION_PRESETS);

const gc = TmUtils.getColor;
const R5_THRESHOLDS = TmConst.R5_THRESHOLDS;
const RTN_THRESHOLDS = TmConst.RTN_THRESHOLDS;

function computeStats(assignment, activeKeys, players_by_id) {
    let totalR5 = 0, countR5 = 0, totalRtn = 0, countRtn = 0;
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
            totalRtn += parseFloat(p.routine) || 0; countRtn++;
        }
    }
    return {
        avgR5: countR5 > 0 ? totalR5 / countR5 : null,
        avgRtn: countRtn > 0 ? totalRtn / countRtn : null,
    };
}

// pickBest11: receives Set<posKey> → returns { posKey: pid } for the optimal assignment
function pickBest11(activeKeys, players_by_id) {
    const activeSlots = [...activeKeys]
        .map(pk => ({ posKey: pk, posId: TmConst.POSITION_MAP[pk]?.id }))
        .filter(s => s.posId != null);
    console.log('[pickBest11] activeKeys:', activeKeys);
    console.log('[pickBest11] activeSlots:', activeSlots);
    const players = Object.values(players_by_id).filter(p => p?.player_id && p.allPositionRatings?.length);
    const n = activeSlots.length;
    if (!players.length || !n) return {};

    // profit[i][j] = player i R5 at slot j's posId (0 = no rating)
    const profit = players.map(p =>
        activeSlots.map(({ posId }) => {
            const r = p.allPositionRatings.find(rt => rt.id === posId);
            return r ? (parseFloat(r.r5) || 0) : 0;
        })
    );

    // Hungarian algorithm (Kuhn-Munkres O(m^3)) — finds globally optimal assignment.
    // Pad to square m×m: dummy extra jobs (j >= n) have cost 0 so surplus players
    // absorb them without affecting the real assignment.
    const m = players.length;
    const maxV = profit.reduce((mx, row) => Math.max(mx, ...row), 0) + 1;
    const getCost = (i, j) => j < n ? maxV - profit[i][j] : 0; // convert to minimization

    const INF = 1e15;
    const u = new Float64Array(m + 1);   // worker (player) potentials
    const v = new Float64Array(m + 1);   // job (slot) potentials
    const p = new Int32Array(m + 1);     // p[j] = worker assigned to job j
    const way = new Int32Array(m + 1);

    for (let i = 1; i <= m; i++) {
        p[0] = i;
        let j0 = 0;
        const minval = new Float64Array(m + 1).fill(INF);
        const used = new Uint8Array(m + 1);
        do {
            used[j0] = 1;
            const i0 = p[j0];
            let delta = INF, j1 = 0;
            for (let j = 1; j <= m; j++) {
                if (!used[j]) {
                    const cur = getCost(i0 - 1, j - 1) - u[i0] - v[j];
                    if (cur < minval[j]) { minval[j] = cur; way[j] = j0; }
                    if (minval[j] < delta) { delta = minval[j]; j1 = j; }
                }
            }
            for (let j = 0; j <= m; j++) {
                if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
                else minval[j] -= delta;
            }
            j0 = j1;
        } while (p[j0] !== 0);
        for (; j0;) { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; }
    }

    const result = {};
    for (let j = 1; j <= n; j++) {
        result[activeSlots[j - 1].posKey] = players[p[j] - 1].player_id;
    }
    return result;
}

export function mountTacticsPanel(container, data, initialSettings, opts, lineupApi) {
    const { players_by_id = {} } = data;
    const { getAssignment, getActiveKeys, applyAssignment, subscribe } = lineupApi;

    // Formation badge + autocomplete
    const fmWrap = document.createElement('div');
    fmWrap.className = 'tmtc-panel-row';
    container.appendChild(fmWrap);

    const fmBadge = document.createElement('span');
    fmBadge.className = 'tmtc-panel-fm-badge';
    fmBadge.textContent = getFormationName(getAssignment(), getActiveKeys());
    fmWrap.appendChild(fmBadge);

    const ac = TmAutocomplete.autocomplete({
        placeholder: 'Change...',
        size: 'sm',
        tone: 'overlay',
        density: 'compact',
    });
    ac.style.flex = '1 1 0';
    fmWrap.appendChild(ac);

    function buildAcItems(filter) {
        const q = (filter || '').trim().toLowerCase();
        return FORMATION_NAMES
            .filter(n => !q || n.includes(q))
            .map(name => TmAutocomplete.autocompleteItem({
                label: name,
                active: name === getFormationName(getAssignment(), getActiveKeys()),
                onSelect: async () => {
                    ac.hideDrop();
                    ac.setValue('');
                    fmBadge.textContent = name;
                    const newActiveKeys = new Set(FORMATION_PRESETS[name].filter(Boolean));
                    const newAssignment = pickBest11(newActiveKeys, players_by_id);
                    await applyAssignment(newAssignment);
                    refreshStats();
                },
            }));
    }

    ac.inputEl.addEventListener('focus', () => ac.setItems(buildAcItems('')));
    ac.inputEl.addEventListener('input', () => ac.setItems(buildAcItems(ac.inputEl.value)));
    document.addEventListener('click', e => { if (!ac.contains(e.target)) ac.hideDrop(); }, true);

    // Stats
    const statsWrap = document.createElement('div');
    statsWrap.className = 'tmtc-panel-stats';
    container.appendChild(statsWrap);

    statsWrap.innerHTML = [
        TmMetric.metric({ label: 'Avg R5', value: '--', layout: 'row', tone: 'overlay', size: 'sm', attrs: { 'data-stat': 'r5' } }),
        TmMetric.metric({ label: 'Avg Rtn', value: '--', layout: 'row', tone: 'overlay', size: 'sm', attrs: { 'data-stat': 'rtn' } }),
    ].join('');

    const r5El = statsWrap.querySelector('[data-stat="r5"]  .tmu-metric-value');
    const rtnEl = statsWrap.querySelector('[data-stat="rtn"] .tmu-metric-value');

    function refreshStats() {
        const st = computeStats(getAssignment(), getActiveKeys(), players_by_id);
        if (st.avgR5 != null) {
            r5El.textContent = st.avgR5.toFixed(1);
            r5El.style.color = gc(st.avgR5, R5_THRESHOLDS);
        } else { r5El.textContent = '--'; r5El.style.color = ''; }
        if (st.avgRtn != null) {
            rtnEl.textContent = st.avgRtn.toFixed(1);
            rtnEl.style.color = gc(st.avgRtn, RTN_THRESHOLDS);
        } else { rtnEl.textContent = '--'; rtnEl.style.color = ''; }
    }

    subscribe(refreshStats);
    subscribe(() => { fmBadge.textContent = getFormationName(getAssignment(), getActiveKeys()); });
    refreshStats();

    // Pick Best 11
    const pickBtn = TmButton.button({
        label: 'Pick Best 11',
        color: 'lime',
        size: 'sm',
        block: true,
        onClick: async () => {
            pickBtn.disabled = true;
            const currentAssignment = getAssignment();
            // Derive active field slots from which posKeys currently have a player assigned
            const currentActiveKeys = new Set(
                Object.keys(currentAssignment).filter(
                    pk => TmConst.POSITION_MAP[pk] != null
                       && currentAssignment[pk]
                       && String(currentAssignment[pk]) !== '0'
                )
            );
            console.log('Current active keys before picking best 11:', currentActiveKeys);
            const newFBP = pickBest11(currentActiveKeys, players_by_id);
            if (Object.keys(newFBP).length) {
                // Pick 5 subs (1 per role group) from non-starters.
                // Sort all available players best-first by R5 (or rec_sort if tooltip not yet loaded).
                // Match by favposition so we don't need tooltip data to be present.
                const usedPids = new Set(Object.values(newFBP).map(String));

                const DEF_POS = new Set(['dl', 'dcl', 'dc', 'dcr', 'dr']);
                const MID_POS = new Set(['dmc', 'dmcl', 'dmcr', 'mc', 'mcl', 'mcr', 'omc', 'omcl', 'omcr']);
                const WING_POS = new Set(['dml', 'dmr', 'ml', 'mr', 'oml', 'omr']);
                const FWD_POS = new Set(['fc', 'fcl', 'fcr']);

                const avail = Object.values(players_by_id)
                    .filter(p => p?.player_id && !usedPids.has(String(p.player_id)))
                    .map(p => {
                        const fav = String(p.favposition || '').split(',')[0].trim().toLowerCase();
                        const r5 = p.allPositionRatings?.length
                            ? Math.max(0, ...p.allPositionRatings.map(r => parseFloat(r.r5) || 0))
                            : (parseFloat(p.rec_sort) || 0);
                        return { pid: p.player_id, fav, r5 };
                    })
                    .sort((a, b) => b.r5 - a.r5);

                const pickBestSub = (posSet) => {
                    const hit = avail.find(a => !usedPids.has(String(a.pid)) && posSet.has(a.fav));
                    if (!hit) return null;
                    usedPids.add(String(hit.pid));
                    return hit.pid;
                };

                const newAssignment = { ...newFBP };
                newAssignment.sub1 = pickBestSub(new Set(['gk']));
                newAssignment.sub2 = pickBestSub(DEF_POS);
                newAssignment.sub3 = pickBestSub(MID_POS);
                newAssignment.sub4 = pickBestSub(WING_POS);
                newAssignment.sub5 = pickBestSub(FWD_POS);
                await applyAssignment(newAssignment);
                refreshStats();
            }
            pickBtn.disabled = false;
        },
    });
    container.appendChild(pickBtn);

    // Separator
    const hr = document.createElement('hr');
    hr.className = 'tmtc-panel-sep';
    container.appendChild(hr);

    // Settings (mentality / style / focus)
    mountTacticsSettings(container, initialSettings, opts);

    return { refreshStats };
}