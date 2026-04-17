import { TmButton } from '../shared/tm-button.js';
import { TmAlert } from '../shared/tm-alert.js';
import { TmModal } from '../shared/tm-modal.js';
import { TmConst } from '../../lib/tm-constants.js';
import { mountTacticsSettings } from './tm-tactics-settings.js';

'use strict';

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

// Players serving a red card ban or carrying an injury are excluded from automated picks.
const isUnavailable = (p) =>
    (p?.ban && String(p.ban).startsWith('r')) ||
    (p?.injury && p.injury !== '0' && Number(p.injury) !== 0);

// Foreign player rule: max 5 foreigners may play on the field.
const clubCountry = String(window.SESSION?.country || '').trim().toLowerCase();
const isForeigner = (p) => !!clubCountry && String(p?.country || '').trim().toLowerCase() !== clubCountry;

// pickBest11: receives Set<posKey> → returns { posKey: pid } for the optimal assignment.
// maxForeigners caps how many foreign-country players can appear in the result (default 5).
function pickBest11(activeKeys, players_by_id, maxForeigners = 5) {
    const activeSlots = [...activeKeys]
        .map(pk => ({ posKey: pk, posId: TmConst.POSITION_MAP[pk]?.id }))
        .filter(s => s.posId != null);
    let players = Object.values(players_by_id).filter(p => p?.id && p.positions?.length && !isUnavailable(p));
    const n = activeSlots.length;
    if (!players.length || !n) return {};

    // Enforce foreign player limit: from all eligible foreigners keep only the top
    // maxForeigners ranked by their best R5 across the active slots.
    if (clubCountry && Number.isFinite(maxForeigners)) {
        const locals = players.filter(p => !isForeigner(p));
        const foreigners = players.filter(p => isForeigner(p));
        if (foreigners.length > maxForeigners) {
            const posIds = activeSlots.map(s => s.posId);
            const ranked = foreigners
                .map(p => ({
                    p,
                    best: Math.max(0, ...posIds.map(posId => {
                        const r = p.positions.find(rt => rt.id === posId);
                        return r ? (parseFloat(r.r5) || 0) : 0;
                    }))
                }))
                .sort((a, b) => b.best - a.best)
                .slice(0, maxForeigners)
                .map(({ p }) => p);
            players = [...locals, ...ranked];
        }
    }

    // profit[i][j] = player i R5 at slot j's posId (0 = no rating)
    const profit = players.map(p =>
        activeSlots.map(({ posId }) => {
            const r = p.positions.find(rt => rt.id === posId);
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
        result[activeSlots[j - 1].posKey] = players[p[j] - 1].id;
    }
    return result;
}

// Zones ordered FWD→DEF (skip GK), paired with their key tables and slot maxes.
// These match FIELD_ZONES order (FIELD_ZONES[0]=fwd, ..., FIELD_ZONES[4]=def).
const OUTFIELD_ZONE_DEFS = [
    { keys: FWD_KEYS, max: 3 },
    { keys: OM_KEYS,  max: 5 },
    { keys: MID_KEYS, max: 5 },
    { keys: DM_KEYS,  max: 5 },
    { keys: DEF_KEYS, max: 5 },
];

function computeAssignmentR5(assignment, players_by_id) {
    let total = 0;
    for (const [posKey, pid] of Object.entries(assignment)) {
        if (!pid) continue;
        const p = players_by_id[String(pid)];
        const posId = TmConst.POSITION_MAP[posKey]?.id;
        if (!p?.positions || posId == null) continue;
        const r = p.positions.find(rt => rt.id === posId);
        if (r) total += parseFloat(r.r5) || 0;
    }
    return total;
}

// Enumerate all valid zone distributions summing to 10, run Hungarian for each,
// return the assignment with highest total R5.
function findBestR5Formation(players_by_id, gkPid) {
    // Exclude GK from the candidate pool
    const outfieldById = {};
    for (const [id, p] of Object.entries(players_by_id)) {
        if (String(p?.id) !== String(gkPid) && !isUnavailable(p)) outfieldById[id] = p;
    }

    // If the GK is a foreigner, the outfield can only have (5 - 1) = 4 foreigners.
    const gkPlayer = gkPid ? (players_by_id[String(gkPid)] || null) : null;
    const outfieldMaxForeigners = clubCountry ? (isForeigner(gkPlayer) ? 4 : 5) : Infinity;

    let bestR5 = -Infinity;
    let bestAssignment = null;

    function enumerate(zoneIdx, remaining, counts) {
        if (zoneIdx === OUTFIELD_ZONE_DEFS.length) {
            if (remaining !== 0) return;
            const activeKeys = new Set();
            for (let i = 0; i < OUTFIELD_ZONE_DEFS.length; i++) {
                if (counts[i] > 0) for (const pk of (OUTFIELD_ZONE_DEFS[i].keys[counts[i]] || [])) activeKeys.add(pk);
            }
            if (activeKeys.size !== 10) return;
            const assignment = pickBest11(activeKeys, outfieldById, outfieldMaxForeigners);
            if (Object.keys(assignment).length < 10) return;
            const r5 = computeAssignmentR5(assignment, outfieldById);
            if (r5 > bestR5) { bestR5 = r5; bestAssignment = assignment; }
            return;
        }
        const max = Math.min(OUTFIELD_ZONE_DEFS[zoneIdx].max, remaining);
        for (let n = 0; n <= max; n++) {
            counts.push(n);
            enumerate(zoneIdx + 1, remaining - n, counts);
            counts.pop();
        }
    }

    enumerate(0, 10, []);
    return bestAssignment || {};
}

export function mountTacticsPanel(container, data, initialSettings, opts, lineupApi) {
    const { players_by_id = {} } = data;
    const { getAssignment, getActiveKeys, applyAssignment, subscribe } = lineupApi;

    function refreshStats() {}

    subscribe(() => {});

    // Pick Best 11
    const pickBtn = TmButton.button({
        label: 'Pick Best 11',
        color: 'primary',
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

                // Count foreigners already in the starting 11
                let foreignersUsed = clubCountry
                    ? Object.values(newFBP).filter(pid => pid && isForeigner(players_by_id[String(pid)])).length
                    : 0;

                const DEF_POS = new Set(['dl', 'dcl', 'dc', 'dcr', 'dr']);
                const MID_POS = new Set(['dmc', 'dmcl', 'dmcr', 'mc', 'mcl', 'mcr', 'omc', 'omcl', 'omcr']);
                const WING_POS = new Set(['dml', 'dmr', 'ml', 'mr', 'oml', 'omr']);
                const FWD_POS = new Set(['fc', 'fcl', 'fcr']);

                const avail = Object.values(players_by_id)
                    .filter(p => p?.id && !usedPids.has(String(p.id)) && !isUnavailable(p))
                    .map(p => {
                        const r5 = p.positions?.length
                            ? Math.max(0, ...p.positions.map(r => parseFloat(r.r5) || 0))
                            : (parseFloat(p.rec_sort) || 0);
                        const favPositions = new Set(
                            p.positions ? p.positions.filter(pos => pos.preferred).map(pos => pos.key) : []
                        );
                        return { pid: p.id, player: p, favPositions, ratings: p.positions || [], r5 };
                    })
                    .sort((a, b) => b.r5 - a.r5);

                const pickBestSub = (posSet) => {
                    const posIds = new Set(
                        [...posSet].map(pk => TmConst.POSITION_MAP[pk]?.id).filter(id => id != null)
                    );
                    const hit = avail.find(a => {
                        if (usedPids.has(String(a.pid))) return false;
                        if (clubCountry && isForeigner(a.player) && foreignersUsed >= 5) return false;
                        if (a.ratings.length) {
                            return a.ratings.some(r => posIds.has(r.id) && (parseFloat(r.r5) || 0) > 0);
                        }
                        // Fallback when tooltip not yet loaded: check all favpositions
                        return [...a.favPositions].some(fp => posSet.has(fp));
                    });
                    if (!hit) return null;
                    usedPids.add(String(hit.pid));
                    if (clubCountry && isForeigner(hit.player)) foreignersUsed++;
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

    const bestFmBtn = TmButton.button({
        label: 'Best R5 Formation',
        color: 'secondary',
        size: 'sm',
        block: true,
        onClick: async () => {
            bestFmBtn.disabled = true;
            const currentAssignment = getAssignment();
            const gkPid = currentAssignment['gk'];
            const newFBP = findBestR5Formation(players_by_id, gkPid);
            if (Object.keys(newFBP).length) {
                if (gkPid) newFBP['gk'] = gkPid;
                const usedPids = new Set(Object.values(newFBP).map(String));

                // Count foreigners already in the starting 11
                let foreignersUsed = clubCountry
                    ? Object.values(newFBP).filter(pid => pid && isForeigner(players_by_id[String(pid)])).length
                    : 0;

                const DEF_POS  = new Set(['dl', 'dcl', 'dc', 'dcr', 'dr']);
                const MID_POS  = new Set(['dmc', 'dmcl', 'dmcr', 'mc', 'mcl', 'mcr', 'omc', 'omcl', 'omcr']);
                const WING_POS = new Set(['dml', 'dmr', 'ml', 'mr', 'oml', 'omr']);
                const FWD_POS  = new Set(['fc', 'fcl', 'fcr']);

                const avail = Object.values(players_by_id)
                    .filter(p => p?.id && !usedPids.has(String(p.id)) && !isUnavailable(p))
                    .map(p => {
                        const r5 = p.positions?.length
                            ? Math.max(0, ...p.positions.map(r => parseFloat(r.r5) || 0))
                            : (parseFloat(p.rec_sort) || 0);
                        const favPositions = new Set(
                            p.positions ? p.positions.filter(pos => pos.preferred).map(pos => pos.key) : []
                        );
                        return { pid: p.id, player: p, favPositions, ratings: p.positions || [], r5 };
                    })
                    .sort((a, b) => b.r5 - a.r5);

                const pickBestSub = (posSet) => {
                    const posIds = new Set(
                        [...posSet].map(pk => TmConst.POSITION_MAP[pk]?.id).filter(id => id != null)
                    );
                    const hit = avail.find(a => {
                        if (usedPids.has(String(a.pid))) return false;
                        if (clubCountry && isForeigner(a.player) && foreignersUsed >= 5) return false;
                        if (a.ratings.length) return a.ratings.some(r => posIds.has(r.id) && (parseFloat(r.r5) || 0) > 0);
                        return [...a.favPositions].some(fp => posSet.has(fp));
                    });
                    if (!hit) return null;
                    usedPids.add(String(hit.pid));
                    if (clubCountry && isForeigner(hit.player)) foreignersUsed++;
                    return hit.pid;
                };

                newFBP.sub1 = pickBestSub(new Set(['gk']));
                newFBP.sub2 = pickBestSub(DEF_POS);
                newFBP.sub3 = pickBestSub(MID_POS);
                newFBP.sub4 = pickBestSub(WING_POS);
                newFBP.sub5 = pickBestSub(FWD_POS);
                await applyAssignment(newFBP);
                refreshStats();
            }
            bestFmBtn.disabled = false;
        },
    });
    container.appendChild(bestFmBtn);

    // ── Save / Load lineup ──────────────────────────────────────────────
    const _lsKey = `tmtc:v2:${opts.reserves || 0}:${String(window.SESSION?.main_id || '')}`;
    const _fmZones = [...TmConst.FIELD_ZONES].reverse().filter(z => z.key !== 'gk');
    const _getFormationStr = (activeKeys) =>
        _fmZones.map(z => z.cols.filter(pk => pk && activeKeys.has(pk)).length)
                .filter(n => n > 0).join('-') || '?';

    const _loadList = () => {
        try { return JSON.parse(localStorage.getItem(_lsKey) || '[]'); } catch { return []; }
    };
    const _saveList = (list) => localStorage.setItem(_lsKey, JSON.stringify(list));

    const hrSave = document.createElement('hr');
    hrSave.className = 'tmtc-panel-sep';
    container.appendChild(hrSave);

    const savedListEl = document.createElement('div');
    savedListEl.className = 'tmtc-saved-list';
    container.appendChild(savedListEl);

    const _renderList = () => {
        savedListEl.innerHTML = '';
        const list = _loadList();
        if (!list.length) {
            const empty = document.createElement('div');
            empty.className = 'tmtc-saved-empty';
            empty.textContent = 'No saved lineups';
            savedListEl.appendChild(empty);
            return;
        }
        for (const entry of list) {
            const row = document.createElement('div');
            row.className = 'tmtc-saved-row';

            const info = document.createElement('div');
            info.className = 'tmtc-saved-info';
            const name = document.createElement('span');
            name.className = 'tmtc-saved-name';
            name.textContent = entry.name;
            const meta = document.createElement('span');
            meta.className = 'tmtc-saved-meta';
            meta.textContent = `${entry.date}  ·  ${entry.formation || '?'}`;
            info.appendChild(name);
            info.appendChild(meta);

            const actions = document.createElement('div');
            actions.className = 'tmtc-saved-actions';

            const loadBtn = TmButton.button({
                label: 'Load',
                color: 'primary',
                size: 'xs',
                onClick: async () => {
                    loadBtn.disabled = true;
                    try { await applyAssignment(entry.assignment); }
                    catch { TmAlert.show({ message: 'Load failed', tone: 'error' }); }
                    loadBtn.disabled = false;
                },
            });

            const delBtn = TmButton.button({
                label: '×',
                color: 'danger',
                size: 'xs',
                onClick: async () => {
                    const confirmed = await TmModal.modal({
                        title: 'Delete lineup',
                        message: `Delete "${entry.name}"?`,
                        buttons: [
                            { label: 'Delete', style: 'danger', value: 'ok' },
                            { label: 'Cancel', style: 'secondary', value: 'cancel' },
                        ],
                    });
                    if (confirmed !== 'ok') return;
                    _saveList(_loadList().filter(e => e.id !== entry.id));
                    _renderList();
                },
            });

            actions.appendChild(loadBtn);
            actions.appendChild(delBtn);
            row.appendChild(info);
            row.appendChild(actions);
            savedListEl.appendChild(row);
        }
    };
    _renderList();

    const saveLineupBtn = TmButton.button({
        label: 'Save Lineup',
        color: 'secondary',
        size: 'sm',
        block: true,
        onClick: async () => {
            const name = await TmModal.prompt({
                title: 'Save lineup',
                placeholder: 'e.g. Home 4-4-2',
                defaultValue: '',
            });
            if (!name) return;
            const activeKeys = getActiveKeys();
            const formation = _getFormationStr(activeKeys);
            const date = new Date().toISOString().slice(0, 10);
            const entry = { id: Date.now(), name, date, formation, assignment: getAssignment() };
            try {
                const list = _loadList();
                list.unshift(entry);
                _saveList(list);
                _renderList();
                TmAlert.show({ message: 'Lineup saved', tone: 'success' });
            } catch { TmAlert.show({ message: 'Save failed', tone: 'error' }); }
        },
    });
    container.appendChild(saveLineupBtn);

    // Separator
    const hr = document.createElement('hr');
    hr.className = 'tmtc-panel-sep';
    container.appendChild(hr);

    // Settings (mentality / style / focus)
    mountTacticsSettings(container, initialSettings, opts, lineupApi);

    return { refreshStats };
}