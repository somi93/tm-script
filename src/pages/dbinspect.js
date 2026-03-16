import { TmDbInspectStyles } from '../components/dbinspect/tm-dbinspect-styles.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmLib } from '../lib/tm-lib.js';
import { TmPlayerService } from '../services/player.js';
import { TmUtils } from '../lib/tm-utils.js';

(function () {
    'use strict';

    if (true) return;
    if (!/^\/123/.test(location.pathname)) return;

    const DB_NAME = 'TMPlayerData';
    const STORE_NAME = 'players';

    // Abbreviated names for display in the table
    const SKILL_NAMES_FIELD = TmConst.SKILL_LABELS_OUT;
    const SKILL_NAMES_GK = TmConst.SKILL_LABELS_GK;
    // Full names as returned by tooltip API (must match exactly)
    const TOOLTIP_NAMES_FIELD = TmConst.SKILL_DEFS_OUT.map(s => s.name);
    const _gkNameMap = Object.fromEntries(TmConst.SKILL_DEFS_GK.flatMap(s =>
        [[s.key, s.name], ...(s.key2 ? [[s.key2, s.name]] : [])]));
    const TOOLTIP_NAMES_GK = TmConst.GRAPH_KEYS_GK.map(k => _gkNameMap[k]);



    const ageToM = TmUtils.ageToMonths;
    const mToAge = TmUtils.monthsToAge;
    const { ASI_WEIGHT_OUTFIELD, ASI_WEIGHT_GK } = TmConst;

    const getPosIndex = TmLib.getPositionIndex;

    /* ═══ R5 / REC calculation — delegates to TmLib ═══ */
    const calcR5 = TmLib.calcR5;
    const calcRemainders = (posIdx, skills, asi) => ({ rec: TmLib.calcRec(posIdx, skills, asi) });

    const computeDecimalSkills = (intSkills, asi, isGK, gw) => TmLib.calcSkillDecimals(intSkills, asi, isGK, gw);

    /* ═══ Season / routine helpers ═══ */

    const fetchHistoryGP = pid => TmPlayerService.fetchPlayerInfo(pid, 'history').then(data => {
        try {
            const total = data?.table?.total;
            if (!total) return null;
            const rows = total.filter(r => typeof r.season === 'number');
            const gpBySeason = {};
            rows.forEach(r => { gpBySeason[r.season] = (gpBySeason[r.season] || 0) + (parseInt(r.games) || 0); });
            const curSeason = rows.length ? Math.max(...rows.map(r => r.season)) : 0;
            return { gpBySeason, curSeason };
        } catch (e) { return null; }
    });

    const buildRoutineMap = TmLib.buildRoutineMap;

    /* ═══ Fetch training data for a player (returns group weights) ═══ */
    const STD_FOCUS = TmConst.STD_FOCUS;
    const fetchTrainingWeights = (pid, isGK) => {
        if (isGK) return Promise.resolve(null); // GK: single group, balanced
        return TmPlayerService.fetchPlayerInfo(pid, 'training').then(data => {
            try {
                const c = data?.custom;
                if (!c) return null;
                const cd = c.custom;
                if (c.custom_on && cd) {
                    const dots = [];
                    let dtot = 0;
                    for (let i = 0; i < 6; i++) {
                        const d = parseInt(cd['team' + (i + 1)]?.points) || 0;
                        dots.push(d); dtot += d;
                    }
                    const sm = 0.5;
                    const den = dtot + 6 * sm;
                    const gw = dots.map(d => (d + sm) / den);
                    console.log(`[DBI] Player ${pid}: custom training dots=[${dots.join(',')}]`);
                    return gw;
                } else {
                    const t = String(c.team || '3');
                    const fg = STD_FOCUS[t] ?? 1;
                    const gw = new Array(6).fill(0.125);
                    gw[fg] = 0.375;
                    console.log(`[DBI] Player ${pid}: standard training type=${t} focus=${fg}`);
                    return gw;
                }
            } catch (e) { return null; }
        });
    };

    /* ═══ IndexedDB helpers ═══ */
    let db = null;
    const openDB = () => new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = e => {
            const d = e.target.result;
            if (!d.objectStoreNames.contains(STORE_NAME)) d.createObjectStore(STORE_NAME);
        };
        req.onsuccess = e => { db = e.target.result; resolve(db); };
        req.onerror = () => reject(req.error);
    });

    const loadAll = () => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const all = store.getAll();
        const keys = store.getAllKeys();
        tx.oncomplete = () => {
            const result = {};
            for (let i = 0; i < keys.result.length; i++) result[keys.result[i]] = all.result[i];
            resolve(result);
        };
        tx.onerror = () => reject(tx.error);
    });

    const savePlayer = (pid, data) => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(data, String(pid));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });

    /* ═══ Re-interpolate a player's gaps ═══ */
    const reInterpolate = (store, isGK, gw) => {
        const posIdx = getPosIndex((store.meta && store.meta.pos || 'mc').split(',')[0].trim());
        // Gather only real keys (non-interpolated, non-interpolated2)
        const realKeys = Object.keys(store.records)
            .filter(k => !store.records[k]._interpolated && !store.records[k]._interpolated2)
            .sort((a, b) => ageToM(a) - ageToM(b));

        // Delete all old _interpolated records
        for (const k of Object.keys(store.records)) {
            if (store.records[k]._interpolated) delete store.records[k];
        }

        if (realKeys.length < 2) return;

        const makeInterp = (siA, skAint, rouA, siB, skBint, rouB, mA, mB) => {
            const gap = mB - mA;
            if (gap <= 1) return;
            for (let step = 1; step < gap; step++) {
                const t = step / gap;
                const ik = mToAge(mA + step);
                // Don't overwrite real records
                if (store.records[ik] && !store.records[ik]._interpolated && !store.records[ik]._interpolated2) continue;
                const iSI = Math.round(siA + (siB - siA) * t);
                const iInt = skAint.map((sa, j) => sa + Math.floor(((skBint[j] !== undefined ? skBint[j] : sa) - sa) * t));
                const iRou = Math.round((rouA + (rouB - rouA) * t) * 10) / 10;
                const iFullSk = (iSI > 0 && iInt.length) ? computeDecimalSkills(iInt, iSI, isGK, gw) : iInt;
                store.records[ik] = {
                    SI: iSI,
                    REREC: Number(calcRemainders(posIdx, iFullSk, iSI).rec),
                    R5: Number(calcR5(posIdx, iFullSk, iSI, iRou)),
                    skills: iFullSk,
                    routine: iRou,
                    _interpolated2: true,
                };
            }
        };

        // Fill gaps between consecutive real records
        for (let i = 0; i < realKeys.length - 1; i++) {
            const kA = realKeys[i], kB = realKeys[i + 1];
            const rA = store.records[kA], rB = store.records[kB];
            if (!rA.skills || !rB.skills) continue;
            const skAint = rA.skills.map(v => Math.floor(typeof v === 'string' ? parseFloat(v) : v));
            const skBint = rB.skills.map(v => Math.floor(typeof v === 'string' ? parseFloat(v) : v));
            makeInterp(parseInt(rA.SI) || 0, skAint, rA.routine || 0,
                parseInt(rB.SI) || 0, skBint, rB.routine || 0,
                ageToM(kA), ageToM(kB));
        }

        // Recompute TI for all records
        const allKeys = Object.keys(store.records).sort((a, b) => ageToM(a) - ageToM(b));
        for (let i = 1; i < allKeys.length; i++) {
            const rec = store.records[allKeys[i]];
            const prevSI = Number(store.records[allKeys[i - 1]].SI) || 0;
            const curSI = Number(rec.SI) || 0;
            if (prevSI > 0 && curSI > 0) {
                const K = isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
                rec.TI = Math.round((Math.pow(curSI * K, 1 / 7) - Math.pow(prevSI * K, 1 / 7)) * 10);
            } else {
                rec.TI = null;
            }
        }
    };

    /* ═══ Compute decimal skills anchored on a previous record (tm-player.user.js style) ═══
       - Skills that crossed an integer boundary since prevRec → decimal snaps to 0.00
       - Skills at same integer level → keep prevRec decimals (proportional)
       - Normalize so Σ decimals = asiRemainder
       Falls back to training-aware computeDecimalSkills if no useful anchor.
    ═══════════════════════════════════════════════════════════════════ */
    const computeDecimalSkillsAnchored = (prevRec, intSk, liveAsi, isGK, gw) => {
        const KASIW = isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
        const totalPtsLive = Math.pow(2, Math.log(KASIW * liveAsi) / Math.log(128));
        const asiRemainder = totalPtsLive - intSk.reduce((a, b) => a + b, 0);
        const N = intSk.length;

        if (!prevRec || !prevRec.skills || prevRec.skills.length !== N || asiRemainder <= 0) {
            return computeDecimalSkills(intSk, liveAsi, isGK, gw);
        }

        const prevInt = prevRec.skills.map(v => Math.floor(typeof v === 'string' ? parseFloat(v) : v));
        const prevDec = prevRec.skills.map(v => {
            const f = typeof v === 'string' ? parseFloat(v) : v;
            return f >= 20 ? 0 : f - Math.floor(f);
        });

        // Skills that crossed at least one integer → snap decimal to 0.00
        // Skills at same integer → keep previous decimal as seed
        let newDec = prevDec.map((d, i) => (intSk[i] >= 20 || intSk[i] > prevInt[i]) ? 0 : d);

        // Normalize seed to asiRemainder
        const decSum = newDec.reduce((a, b) => a + b, 0);
        if (decSum > 0.001) {
            const scale = asiRemainder / decSum;
            newDec = newDec.map((d, i) => intSk[i] >= 20 ? 0 : d * scale);
        } else {
            // All skills improved (or no seed) — fall back to training-aware
            return computeDecimalSkills(intSk, liveAsi, isGK, gw);
        }

        // Cap at 0.99 with overflow redistribution (identical to player script Step 6)
        const CAP = 0.99;
        let passes = 0;
        do {
            let ovfl = 0, freeCount = 0;
            for (let i = 0; i < N; i++) {
                if (intSk[i] >= 20) { newDec[i] = 0; continue; }
                if (newDec[i] > CAP) { ovfl += newDec[i] - CAP; newDec[i] = CAP; }
                else if (newDec[i] < CAP) freeCount++;
            }
            if (ovfl > 0.0001 && freeCount > 0) {
                const add = ovfl / freeCount;
                for (let i = 0; i < N; i++) if (intSk[i] < 20 && newDec[i] < CAP) newDec[i] += add;
            } else break;
        } while (++passes < 20);

        return intSk.map((v, i) => v >= 20 ? 20 : v + newDec[i]);
    };

    /* ═══ Apply sync-real preview to store and save ═══ */
    const applySyncReal = async (pid, store, isGK, proposed) => {
        for (const { ageKey, rec } of proposed) {
            if (store.records[ageKey] && store.records[ageKey].locked) continue;
            store.records[ageKey] = rec;
        }
        // Recompute TI for all records
        const allKeys = Object.keys(store.records).sort((a, b) => ageToM(a) - ageToM(b));
        for (let i = 1; i < allKeys.length; i++) {
            const rec = store.records[allKeys[i]];
            const prevSI = Number(store.records[allKeys[i - 1]].SI) || 0;
            const curSI = Number(rec.SI) || 0;
            if (prevSI > 0 && curSI > 0) {
                const K = isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
                rec.TI = Math.round((Math.pow(curSI * K, 1 / 7) - Math.pow(prevSI * K, 1 / 7)) * 10);
            } else {
                rec.TI = null;
            }
        }
        await savePlayer(pid, store);
    };

    /* ═══ Compute sync-real preview (no save) ═══
       Walks ALL records chronologically:
         - LOCKED record → resets the chain anchor to that locked rec
         - non-locked record → recompute decimals anchored on prevRec, chain forward
       Handles INTERP between two LOCKED records as well as after the last one.
       Outputs _interpolated3 records. Live tooltip becomes new REAL.
       Returns array of proposed records WITHOUT modifying the store.
    ═══════════════════════════════════════════════════════════════════ */
    const computeSyncRealPreview = (store, isGK, livePlayer, gw, gpData) => {
        const favPos = livePlayer ? String(livePlayer.favposition) : (store.meta && store.meta.pos || 'mc');
        const posIdx = getPosIndex(favPos.split(',')[0].trim());
        const liveAsi = livePlayer ? Number(String(livePlayer.skill_index || 0).replace(/,/g, '')) || 0 : 0;
        const liveAgeY = livePlayer ? parseInt(livePlayer.age) || 0 : 0;
        const liveAgeM_months = livePlayer ? parseInt(livePlayer.months) || 0 : 0;
        const liveRou = livePlayer ? parseFloat(livePlayer.routine) || 0 : 0;
        const liveAgeKey = livePlayer ? `${liveAgeY}.${liveAgeM_months}` : null;

        const intSk = livePlayer ? skillsFromTooltip(livePlayer, isGK) : [];

        // Last locked key (for display in preview header)
        const lockedKeys = Object.keys(store.records)
            .filter(k => store.records[k].locked)
            .sort((a, b) => ageToM(a) - ageToM(b));
        const lastLockedKey = lockedKeys.length ? lockedKeys[lockedKeys.length - 1] : null;

        // All records sorted chronologically
        const allKeys = Object.keys(store.records).sort((a, b) => ageToM(a) - ageToM(b));

        // Build routineMap only when live data is available
        const routineMap = livePlayer
            ? buildRoutineMap(liveRou, liveAgeY, liveAgeM_months, gpData,
                [...allKeys.filter(k => !store.records[k].locked), ...(liveAgeKey ? [liveAgeKey] : [])])
            : {};

        const proposed = [];
        let prevRec = null;

        // Walk chronologically: locked resets anchor, non-locked gets recomputed and chains forward
        for (const k of allKeys) {
            const rec = store.records[k];
            if (rec.locked) {
                prevRec = rec;
            } else {
                const iIntSk = (rec.skills || []).map(v => Math.floor(typeof v === 'string' ? parseFloat(v) : v));
                const iSI = Number(rec.SI) || 0;
                // Use routineMap (live-based) when available, else fall back to stored routine
                const iRou = routineMap[k] !== undefined ? routineMap[k] : (rec.routine || liveRou);
                const iF = iSI > 0 && iIntSk.length ? computeDecimalSkillsAnchored(prevRec, iIntSk, iSI, isGK, gw) : iIntSk;
                const newRec = {
                    SI: iSI,
                    REREC: Number(calcRemainders(posIdx, iF, iSI).rec),
                    R5: Number(calcR5(posIdx, iF, iSI, iRou)),
                    skills: iF, routine: iRou, _estimated: true,
                };
                proposed.push({ ageKey: k, isNewReal: false, rec: newRec });
                prevRec = newRec;
            }
        }

        // Live tooltip endpoint — only when player data is available
        if (livePlayer && liveAgeKey) {
            const liveRouFinal = routineMap[liveAgeKey] !== undefined ? routineMap[liveAgeKey] : liveRou;
            const fullSk = liveAsi > 0 && intSk.length
                ? computeDecimalSkillsAnchored(prevRec, intSk, liveAsi, isGK, gw)
                : intSk;
            const liveR5 = Number(calcR5(posIdx, fullSk, liveAsi, liveRouFinal));
            const liveREC = Number(calcRemainders(posIdx, fullSk, liveAsi).rec);

            proposed.push({
                ageKey: liveAgeKey,
                isNewReal: true,
                rec: { SI: liveAsi, REREC: liveREC, R5: liveR5, skills: fullSk, routine: liveRouFinal },
            });
        }

        return { lastLockedKey, proposed };
    };

    /* ═══ Fetch live player data from tooltip endpoint ═══ */
    const fetchPlayerTooltip = pid => TmPlayerService.fetchTooltipRaw(pid);

    const skillsFromTooltip = (player, isGK) => {
        const names = isGK ? TOOLTIP_NAMES_GK : TOOLTIP_NAMES_FIELD;
        return names.map(name => {
            const sk = (player.skills || []).find(s => s.name === name);
            if (!sk) return 0;
            const v = sk.value;
            if (typeof v === 'string') {
                if (v.includes('star_silver') || v.includes('19')) return 19;
                if (v.includes('star') || v.includes('20')) return 20;
                return parseInt(v) || 0;
            }
            return Math.floor(Number(v)) || 0;
        });
    };

    /* ═══ Format helpers ═══ */
    const fmtSkills = (skills, isGK) => {
        if (!skills || !skills.length) return '—';
        const names = isGK ? SKILL_NAMES_GK : SKILL_NAMES_FIELD;
        return names.map((n, i) => {
            const v = skills[i];
            const vStr = typeof v === 'number' && v % 1 !== 0 ? v.toFixed(2) : String(v != null ? v : '?');
            return `<span style="color:#aaa">${n}:</span>${vStr}`;
        }).join(' ');
    };


    /* ═══ Main state ═══ */
    let allDB = {};
    let containerRef = null;

    const getPlayerList = () => {
        const playerList = [];
        for (const [pid, store] of Object.entries(allDB)) {
            if (!store || !store.records) continue;
            const keys = Object.keys(store.records);
            const interpKeys = keys.filter(k => store.records[k]._interpolated);
            const interp2Keys = keys.filter(k => store.records[k]._interpolated2);
            const estimatedKeys = keys.filter(k => store.records[k]._estimated);
            const lockedKeys = keys.filter(k => store.records[k].locked);
            const plainRealKeys = keys.filter(k => !store.records[k].locked && !store.records[k]._interpolated && !store.records[k]._interpolated2 && !store.records[k]._estimated);
            playerList.push({
                pid, store,
                name: (store.meta && store.meta.name) || '?',
                country: (store.meta && store.meta.country) || '',
                isGK: !!(store.meta && store.meta.isGK),
                pos: (store.meta && store.meta.pos) || '',
                totalRecords: keys.length,
                interpCount: interpKeys.length,
                interp2Count: interp2Keys.length,
                estimatedCount: estimatedKeys.length,
                realCount: keys.length - interpKeys.length - interp2Keys.length - estimatedKeys.length,
                lockedCount: lockedKeys.length,
                plainRealCount: plainRealKeys.length,
            });
        }
        return playerList;
    };

    const render = () => {
        const allPlayers = getPlayerList();
        const playersWithInterp = allPlayers.filter(p => p.interpCount > 0 || p.interp2Count > 0);
        playersWithInterp.sort((a, b) => b.interpCount - a.interpCount);

        const totalPlayers = Object.keys(allDB).length;
        const withOldInterp = allPlayers.filter(p => p.interpCount > 0).length;
        const cleanEstimated = allPlayers.filter(p => p.estimatedCount > 0 && p.lockedCount + p.interp2Count + p.estimatedCount >= p.totalRecords).length;

        let html = `<div class="dbi-wrap">`;
        html += `<div class="dbi-title">DB Inspector</div>`;
        html += `<div class="dbi-stats">${totalPlayers} players total — ${withOldInterp} with old interp — <span style="color:#c090ff">${cleanEstimated} clean (estimated)</span> — <strong style="color:#e0e0e0">${playersWithInterp.length} shown</strong></div>`;
        html += `<div class="dbi-filter">
            <label>Sort by:</label>
            <select id="dbi-sort">
                <option value="interp">Most interpolated</option>
                <option value="name">Name</option>
                <option value="ratio">Interp ratio</option>
            </select>
            <label>Search:</label>
            <input type="text" id="dbi-search" placeholder="Player name or ID...">
            <button class="dbi-sync-all" id="dbi-sync-all">🔄 Re-sync All</button>
            <button class="dbi-syncreal-all" id="dbi-syncreal-all">🔧 Sync Real All</button>
            <button class="dbi-migrate-btn" id="dbi-migrate-i3">🔁 Migrate interp3→estimated</button>
            <label style="margin-left:12px"><input type="checkbox" id="dbi-invert"> Invert</label>
            <span class="dbi-status" id="dbi-global-status"></span>
            <span class="dbi-status" id="dbi-syncreal-all-status"></span>
            <span class="dbi-status" id="dbi-migrate-status"></span>
        </div>`;

        html += `<div id="dbi-list">`;
        playersWithInterp.forEach((p, idx) => { html += buildPlayerHTML(p, idx); });
        html += `</div></div>`;

        TmDbInspectStyles.inject();

        containerRef = document.createElement('div');
        containerRef.innerHTML = html;

        const main = document.querySelector('#content') || document.querySelector('.container') || document.body;
        main.prepend(containerRef);

        bindEvents(playersWithInterp);
    };

    const bindEvents = (playersList) => {
        // Expand/collapse
        containerRef.querySelectorAll('.dbi-header').forEach(hdr => {
            hdr.addEventListener('click', e => {
                if (e.target.closest('.dbi-sync-btn')) return; // don't toggle on sync click
                const arrow = hdr.querySelector('.dbi-arrow');
                const recs = hdr.nextElementSibling;
                arrow.classList.toggle('open');
                recs.classList.toggle('open');
            });
        });

        // Per-player Sync Real (preview) buttons
        containerRef.querySelectorAll('.dbi-syncreal-btn').forEach(btn => {
            btn.addEventListener('click', async e => {
                e.stopPropagation();
                const pid = btn.dataset.pid;
                const p = playersList.find(x => x.pid === pid);
                if (!p) return;
                btn.disabled = true;
                btn.textContent = '⏳…';
                try {
                    const [tooltipData, gw, gpData] = await Promise.all([
                        fetchPlayerTooltip(pid),
                        fetchTrainingWeights(pid, p.isGK),
                        fetchHistoryGP(pid),
                    ]);
                    const player = tooltipData && tooltipData.player;
                    if (!player) { btn.textContent = '❌ No data'; btn.disabled = false; return; }

                    const { lastLockedKey, proposed } = computeSyncRealPreview(p.store, p.isGK, player, gw, gpData);

                    const playerEl = btn.closest('.dbi-player');
                    const recsEl = playerEl.querySelector('.dbi-records');

                    // Remove previous preview
                    const oldPreview = recsEl.querySelector('.dbi-preview-wrap');
                    if (oldPreview) oldPreview.remove();

                    // Build preview HTML
                    let ph = `<div class="dbi-preview-wrap">`;
                    ph += `<div class="dbi-preview-title">⚠️ PREVIEW — proposed changes (not saved)</div>`;
                    ph += `<div class="dbi-preview-anchor">Anchor: ${lastLockedKey ? `LOCKED @ ${lastLockedKey}` : 'no locked record — full fill from nothing'}</div>`;
                    ph += `<table class="dbi-rec-tbl"><thead><tr>`;
                    ph += `<th>Age</th><th>Type</th><th>SI</th><th>R5</th><th>REC</th><th>Rtn</th><th>Skills</th>`;
                    ph += `</tr></thead><tbody>`;
                    for (const { ageKey, rec, isNewReal } of proposed) {
                        const cls = isNewReal ? 'preview-real' : 'preview-interp';
                        const badge = isNewReal
                            ? '<span class="dbi-badge dbi-badge-preview-real">NEW REAL</span>'
                            : '<span class="dbi-badge dbi-badge-preview-interp">NEW ESTIMATED</span>';
                        ph += `<tr class="${cls}">`;
                        ph += `<td>${ageKey}</td><td>${badge}</td><td>${rec.SI}</td>`;
                        ph += `<td>${Number(rec.R5).toFixed(2)}</td><td>${Number(rec.REREC).toFixed(2)}</td>`;
                        ph += `<td>${rec.routine}</td>`;
                        ph += `<td class="dbi-skills">${fmtSkills(rec.skills, p.isGK)}</td>`;
                        ph += `</tr>`;
                    }
                    ph += `</tbody></table></div>`;

                    recsEl.insertAdjacentHTML('beforeend', ph);
                    recsEl.classList.add('open');
                    playerEl.querySelector('.dbi-arrow').classList.add('open');

                    btn.textContent = '✅ Preview ready';
                    btn.disabled = false;
                } catch (err) {
                    btn.textContent = '❌ Error';
                    btn.disabled = false;
                    console.error('[DBI] syncreal failed', pid, err);
                }
            });
        });

        // Per-player fetch buttons
        containerRef.querySelectorAll('.dbi-fetch-btn').forEach(btn => {
            btn.addEventListener('click', async e => {
                e.stopPropagation();
                const pid = btn.dataset.pid;
                const p = playersList.find(x => x.pid === pid);
                if (!p) return;
                btn.disabled = true;
                btn.textContent = '⏳…';
                try {
                    const data = await fetchPlayerTooltip(pid);
                    const player = data && data.player;
                    if (!player) { btn.textContent = '❌ No data'; btn.disabled = false; return; }
                    const liveIsGK = String(player.favposition).split(',')[0].trim().toLowerCase() === 'gk';
                    const liveAsi = Number(String(player.skill_index || 0).replace(/,/g, '')) || 0;
                    const liveAgeY = parseInt(player.age) || 0;
                    const liveAgeM = parseInt(player.months) || 0;
                    const liveRou = parseFloat(player.routine) || 0;
                    const liveFP = String(player.favposition);
                    const livePosIdx = getPosIndex(liveFP.split(',')[0].trim());
                    const intSk = skillsFromTooltip(player, liveIsGK);
                    const gw = null; // balanced for preview — training fetch separate
                    const fullSk = liveAsi > 0 && intSk.length ? computeDecimalSkills(intSk, liveAsi, liveIsGK, gw) : intSk;
                    const liveREC = Number(calcRemainders(livePosIdx, fullSk, liveAsi).rec);
                    const liveR5 = Number(calcR5(livePosIdx, fullSk, liveAsi, liveRou));
                    const ageKey = `${liveAgeY}.${liveAgeM}`;
                    // Inject live row into this player's table
                    const playerEl = btn.closest('.dbi-player');
                    const tbl = playerEl.querySelector('.dbi-rec-tbl tbody');
                    if (tbl) {
                        // Remove previous live rows
                        tbl.querySelectorAll('tr.live').forEach(r => r.remove());
                        const badge = '<span class="dbi-badge dbi-badge-live">LIVE</span>';
                        const tr = document.createElement('tr');
                        tr.className = 'live';
                        tr.innerHTML = `<td>${ageKey}</td><td>${badge}</td><td>${liveAsi}</td>` +
                            `<td>${liveR5.toFixed(2)}</td><td>${liveREC.toFixed(2)}</td>` +
                            `<td>${liveRou}</td><td>—</td>` +
                            `<td class="dbi-skills">${fmtSkills(fullSk, liveIsGK)}</td>`;
                        tbl.appendChild(tr);
                        // Ensure table is visible
                        const recsEl = playerEl.querySelector('.dbi-records');
                        const arrow = playerEl.querySelector('.dbi-arrow');
                        recsEl.classList.add('open');
                        arrow.classList.add('open');
                    }
                    btn.textContent = '✅ Fetched';
                    btn.disabled = false;
                } catch (err) {
                    btn.textContent = '❌ Error';
                    btn.disabled = false;
                    console.error('[DBI] fetch failed', pid, err);
                }
            });
        });

        // Per-player sync buttons
        containerRef.querySelectorAll('.dbi-sync-btn').forEach(btn => {
            btn.addEventListener('click', async e => {
                e.stopPropagation();
                const pid = btn.dataset.pid;
                const p = playersList.find(x => x.pid === pid);
                if (!p) return;
                btn.disabled = true;
                btn.textContent = '⏳…';
                try {
                    const gw = await fetchTrainingWeights(pid, p.isGK);
                    reInterpolate(p.store, p.isGK, gw);
                    await savePlayer(pid, p.store);
                    allDB[pid] = p.store;
                    btn.textContent = '✅ Done';
                    // Refresh this player's record table
                    const playerEl = btn.closest('.dbi-player');
                    const recsEl = playerEl.querySelector('.dbi-records');
                    recsEl.innerHTML = buildRecordsHTML(p.store, p.isGK);
                    // Update counts in header
                    const keys = Object.keys(p.store.records);
                    const ic = keys.filter(k => p.store.records[k]._interpolated).length;
                    const i2c = keys.filter(k => p.store.records[k]._interpolated2).length;
                    const i3c = keys.filter(k => p.store.records[k]._estimated).length;
                    const rc = keys.length - ic - i2c - i3c;
                    const countEl = playerEl.querySelector('.dbi-interp-count');
                    if (countEl) countEl.textContent = ic > 0
                        ? `${ic} interp / ${keys.length} total (${rc} real)`
                        : i3c > 0
                            ? `${i3c} estimated / ${keys.length} total (${rc} real)`
                            : `${i2c} interp2 / ${keys.length} total (${rc} real)`;
                } catch (err) {
                    btn.textContent = '❌ Error';
                    console.error('[DBI] sync failed', pid, err);
                }
            });
        });

        // Sort
        const isInverted = () => document.getElementById('dbi-invert')?.checked;
        const filterPlayers = () => {
            const inv = isInverted();
            return getPlayerList().filter(p => inv
                ? p.lockedCount + p.interp2Count + p.estimatedCount >= p.totalRecords || p.totalRecords <= 1
                : p.lockedCount + p.interp2Count + p.estimatedCount < p.totalRecords && p.totalRecords > 1
            );
        };

        document.getElementById('dbi-invert').addEventListener('change', () => {
            const q = document.getElementById('dbi-search').value.toLowerCase().trim();
            const list = filterPlayers();
            reRenderList(q ? list.filter(p => p.name.toLowerCase().includes(q) || p.pid.includes(q)) : list);
        });

        document.getElementById('dbi-sort').addEventListener('change', e => {
            const v = e.target.value;
            const list = filterPlayers();
            if (v === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
            else if (v === 'ratio') list.sort((a, b) => (b.interpCount / b.totalRecords) - (a.interpCount / a.totalRecords));
            else list.sort((a, b) => b.interpCount - a.interpCount);
            reRenderList(list);
        });

        // Search
        document.getElementById('dbi-search').addEventListener('input', e => {
            const q = e.target.value.toLowerCase().trim();
            const list = filterPlayers();
            const filtered = q ? list.filter(p => p.name.toLowerCase().includes(q) || p.pid.includes(q)) : list;
            reRenderList(filtered);
        });

        // Sync All
        document.getElementById('dbi-sync-all').addEventListener('click', async () => {
            const btn = document.getElementById('dbi-sync-all');
            const statusEl = document.getElementById('dbi-global-status');
            btn.disabled = true;
            const list = getPlayerList().filter(p => p.interpCount > 0); // only those with old _interpolated
            for (let i = 0; i < list.length; i++) {
                const p = list[i];
                statusEl.textContent = `Syncing ${i + 1}/${list.length}: ${p.name}…`;
                try {
                    const gw = await fetchTrainingWeights(p.pid, p.isGK);
                    reInterpolate(p.store, p.isGK, gw);
                    await savePlayer(p.pid, p.store);
                    allDB[p.pid] = p.store;
                } catch (err) {
                    console.error('[DBI] sync all failed for', p.pid, err);
                }
                // Small delay between API calls
                if (i < list.length - 1) await new Promise(r => setTimeout(r, 200));
            }
            statusEl.textContent = `✅ Done — ${list.length} players re-synced`;
            btn.disabled = false;
            // Refresh full list
            reRenderList(getPlayerList().filter(p => p.lockedCount + p.interp2Count + p.estimatedCount < p.totalRecords && p.totalRecords > 1));
        });

        // Sync Real All
        document.getElementById('dbi-syncreal-all').addEventListener('click', async () => {
            const btn = document.getElementById('dbi-syncreal-all');
            const statusEl = document.getElementById('dbi-syncreal-all-status');
            btn.disabled = true;
            document.getElementById('dbi-sync-all').disabled = true;
            let done = 0, failed = 0;
            const syncList = playersList.filter(p => p.interpCount > 0 || p.interp2Count > 0);
            const total = syncList.length;
            statusEl.textContent = `0/${total} (0.00%) synced…`;
            for (let i = 0; i < syncList.length; i++) {
                const p = syncList[i];
                const pct = ((i + 1) / total * 100).toFixed(2);
                statusEl.textContent = `${i + 1}/${total} (${pct}%): ${p.name}…`;
                try {
                    // All data is already in DB — no network requests needed for bulk sync
                    const { proposed } = computeSyncRealPreview(p.store, p.isGK, null, null, null);
                    await applySyncReal(p.pid, p.store, p.isGK, proposed);
                    allDB[p.pid] = p.store;
                    done++;
                } catch (err) {
                    failed++;
                    console.error('[DBI] sync real all failed for', p.pid, err);
                }
            }
            statusEl.textContent = `✅ Done — ${done}/${total} synced${failed ? `, ${failed} failed` : ''}`;
            btn.disabled = false;
            document.getElementById('dbi-sync-all').disabled = false;
        });

        // Migrate _interpolated3 → _estimated
        document.getElementById('dbi-migrate-i3').addEventListener('click', async () => {
            const btn = document.getElementById('dbi-migrate-i3');
            const statusEl = document.getElementById('dbi-migrate-status');
            btn.disabled = true;
            let migrated = 0, skipped = 0;
            for (const [pid, store] of Object.entries(allDB)) {
                let changed = false;
                for (const k of Object.keys(store.records)) {
                    const rec = store.records[k];
                    if (rec._interpolated3) {
                        delete rec._interpolated3;
                        rec._estimated = true;
                        changed = true;
                    }
                }
                if (changed) {
                    await savePlayer(pid, store);
                    allDB[pid] = store;
                    migrated++;
                } else {
                    skipped++;
                }
            }
            statusEl.textContent = `✅ Migrated ${migrated} players (${skipped} already clean)`;
            btn.disabled = false;
            render();
        });
    };

    const reRenderList = (players) => {
        const list = containerRef.querySelector('#dbi-list');
        let html = '';
        players.forEach((p, idx) => { html += buildPlayerHTML(p, idx); });
        list.innerHTML = html;
        bindEvents(players);
    };

    const buildRecordsHTML = (store, isGK) => {
        const keys = Object.keys(store.records).sort((a, b) => ageToM(a) - ageToM(b));
        let html = `<table class="dbi-rec-tbl"><thead><tr>`;
        html += `<th>Age</th><th>Type</th><th>SI</th><th>R5</th><th>REC</th><th>Rtn</th><th>TI</th><th>Skills</th>`;
        html += `</tr></thead><tbody>`;
        keys.forEach(k => {
            const rec = store.records[k];
            const isInterp = !!rec._interpolated;
            const isInterp2 = !!rec._interpolated2;
            const isEstimated = !!rec._estimated;
            const isLocked = !!rec.locked;
            let cls = 'real', badge = '';
            if (isInterp) { cls = 'interp'; badge = '<span class="dbi-badge dbi-badge-interp">INTERP</span>'; }
            else if (isInterp2) { cls = 'interp2'; badge = '<span class="dbi-badge dbi-badge-interp2">INTERP2</span>'; }
            else if (isEstimated) { cls = 'estimated'; badge = '<span class="dbi-badge dbi-badge-estimated">ESTIMATED</span>'; }
            else if (isLocked) { badge = '<span class="dbi-badge dbi-badge-locked">LOCKED</span>'; }
            else { badge = '<span class="dbi-badge dbi-badge-real">REAL</span>'; }
            html += `<tr class="${cls}">`;
            html += `<td>${k}</td><td>${badge}</td>`;
            html += `<td>${rec.SI || '—'}</td>`;
            html += `<td>${rec.R5 != null ? Number(rec.R5).toFixed(2) : '—'}</td>`;
            html += `<td>${rec.REREC != null ? Number(rec.REREC).toFixed(2) : '—'}</td>`;
            html += `<td>${rec.routine != null ? rec.routine : '—'}</td>`;
            html += `<td>${rec.TI != null ? rec.TI : '—'}</td>`;
            html += `<td class="dbi-skills">${fmtSkills(rec.skills, isGK)}</td>`;
            html += `</tr>`;
        });
        html += `</tbody></table>`;
        return html;
    };

    const buildPlayerHTML = (p) => {
        const keys = Object.keys(p.store.records);
        const ic = keys.filter(k => p.store.records[k]._interpolated).length;
        const i2c = keys.filter(k => p.store.records[k]._interpolated2).length;
        const i3c = keys.filter(k => p.store.records[k]._estimated).length;
        const rc = keys.length - ic - i2c - i3c;
        const countText = ic > 0
            ? `${ic} interp / ${keys.length} total (${rc} real)`
            : i3c > 0
                ? `${i3c} estimated / ${keys.length} total (${rc} real)`
                : i2c > 0
                    ? `${i2c} interp2 / ${keys.length} total (${rc} real)`
                    : `${keys.length} records (${rc} real)`;
        const showSync = ic > 0; // only show sync if old _interpolated exist

        let html = `<div class="dbi-player">`;
        html += `<div class="dbi-header">`;
        html += `<span class="dbi-arrow">▶</span>`;
        html += `<span class="dbi-pid">#${p.pid}</span>`;
        html += `<a class="dbi-name" href="https://trophymanager.com/players/${p.pid}/" target="_blank" rel="noopener">${p.name}</a>`;
        html += `<span class="dbi-country">${p.country}</span>`;
        html += `<span class="dbi-meta">${p.pos} ${p.isGK ? '(GK)' : ''}</span>`;
        html += `<span class="dbi-interp-count">${countText}</span>`;
        if (showSync) html += `<button class="dbi-sync-btn" data-pid="${p.pid}">🔄 Sync</button>`;
        html += `<button class="dbi-fetch-btn" data-pid="${p.pid}">📡 Fetch</button>`;
        html += `<button class="dbi-syncreal-btn" data-pid="${p.pid}">🔧 Sync Real</button>`;
        html += `</div>`;
        html += `<div class="dbi-records">${buildRecordsHTML(p.store, p.isGK)}</div>`;
        html += `</div>`;
        return html;
    };

    // Wait for page + jQuery, then open DB, load all, render
    const init = async () => {
        await openDB();
        allDB = await loadAll();
        render();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init().catch(e => console.error('[DBInspect]', e)));
    } else {
        init().catch(e => console.error('[DBInspect]', e));
    }
})();
