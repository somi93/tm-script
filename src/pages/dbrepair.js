import { TmDbRepairStyles } from '../components/dbrepair/tm-dbrepair-styles.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmSync } from '../lib/tm-dbsync.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmApi } from '../lib/tm-services.js';
import { TmUtils } from '../lib/tm-utils.js';

(function () {
    'use strict';

    /* ─────────────────────────────────────────────────────────
       HELPERS
       ───────────────────────────────────────────────────────── */

    /**
     * Returns true if DBPlayer needs re-analysis:
     *   - any record has R5 or REREC null, OR
     *   - any record has all integer skills (no decimal portion stored)
     */
    const needsRepair = (DBPlayer) => {
        if (!DBPlayer?.records) return false;
        const recs = Object.values(DBPlayer.records);
        if (!recs.length) return false;
        return recs.some(r => {
            if (r.R5 == null || r.REREC == null) return true;
            if (!Array.isArray(r.skills)) return false;
            return r.skills.every(s => {
                const v = typeof s === 'object' ? parseFloat(s?.value) : parseFloat(s);
                return isFinite(v) && v % 1 === 0;
            });
        });
    };

    const META_FIELDS = ['name', 'pos', 'isGK', 'country', 'club_id'];

    const missingMetaFields = (DBPlayer) => {
        if (!DBPlayer?.meta) return META_FIELDS;
        return META_FIELDS.filter(f => DBPlayer.meta[f] == null || DBPlayer.meta[f] === '');
    };

    const needsMetaRepair = (DBPlayer) => missingMetaFields(DBPlayer).length > 0;

    const formatEta = (startTime, done, total) => {
        if (done <= 0) return '';
        const etaMs = (total - done) * (Date.now() - startTime) / done;
        if (!isFinite(etaMs) || etaMs < 1500) return '';
        const sec = Math.round(etaMs / 1000);
        if (sec < 60) return `~${sec}s left`;
        const min = Math.floor(sec / 60), s = sec % 60;
        return s > 0 ? `~${min}m ${s}s left` : `~${min}m left`;
    };

    /** Reconstruct trainingInfo from squad player object (has .training + .training_custom) */
    const buildTrainingInfoFromPlayer = (p) => {
        if (!p || (!p.training && !p.training_custom)) return null;
        const raw = p.training_custom;
        const customParsed = raw
            ? (typeof raw === 'object' ? raw : (() => { try { return JSON.parse(raw); } catch (e) { return null; } })())
            : null;
        return { custom: { team: String(p.training || '3'), custom_on: customParsed ? 1 : 0, custom: customParsed || {} } };
    };

    /**
     * Build a minimal fake player object from stored DB meta so we can call
     * analyzeGrowth without a live API-fetched player.
     * The multi-record analyzeGrowth path only needs: id, isGK, positions, routine.
     * Training and history are passed as null so no API calls are made.
     */
    const buildFakePlayer = (pid, DBPlayer) => {
        const meta = DBPlayer.meta || {};
        const recs = DBPlayer.records || {};
        const keys = Object.keys(recs).sort((a, b) =>
            TmUtils.ageToMonths(b) - TmUtils.ageToMonths(a));
        const latestKey = keys[0] || '18.0';
        const [ageStr, monthStr] = latestKey.split('.');
        const age = parseInt(ageStr) || 18;
        const months = parseInt(monthStr) || 0;

        // Determine isGK from meta, or infer from skill count (11 = GK, 14 = outfield)
        const firstSkills = recs[keys[0]]?.skills;
        const skillCount = Array.isArray(firstSkills) ? firstSkills.length : 14;
        const isGK = meta.isGK != null ? meta.isGK : (skillCount === 11);

        // Build positions array from stored favposition string
        let positions = [];
        if (meta.pos) {
            positions = String(meta.pos).split(',').map(s => {
                return TmConst.POSITION_MAP[s.trim().toLowerCase()];
            }).filter(Boolean);
        }
        if (!positions.length) {
            positions = isGK
                ? [TmConst.POSITION_MAP.gk]
                : [TmConst.POSITION_MAP.dc || { id: 0 }];
        }

        // skills from latest record — needed for single-record analyzeGrowth path (calcSkillDecimalsSimple)
        const latestSkills = recs[latestKey]?.skills;
        const skills = Array.isArray(latestSkills)
            ? latestSkills.map(v => typeof v === 'object' && v !== null ? parseFloat(v.value) || 0 : parseFloat(v) || 0)
            : [];

        return {
            id: pid,
            isGK,
            positions,
            skills,
            routine: recs[latestKey]?.routine ?? 0,
            age,
            months,
            ageMonthsString: latestKey,
            asi: parseInt(recs[latestKey]?.SI) || 0,
        };
    };

    /* ─────────────────────────────────────────────────────────
       UI
       ───────────────────────────────────────────────────────── */

    const injectUI = () => {
        TmDbRepairStyles.inject();

        const panel = document.createElement('div');
        panel.id = 'tmrep-panel';
        panel.innerHTML = `
            <h2>🔧 DB Repair Tool</h2>
            <div id="tmrep-stats">Scanning...</div>
            <button id="tmrep-btn" class="tmrep-btn" disabled>Repair All</button>
            <button id="tmrep-btn-others" class="tmrep-btn" disabled>Repair Others</button>
            <div class="tmrep-bar-wrap"><div id="tmrep-bar"></div></div>
            <div id="tmrep-status"></div>
            <div id="tmrep-log"></div>
        `;

        const target = document.querySelector('#middle_column') || document.body;
        target.insertBefore(panel, target.firstChild);

        // Meta repair panel
        const metaPanel = document.createElement('div');
        metaPanel.id = 'tmmeta-panel';
        metaPanel.innerHTML = `
            <h2>🏷️ Meta Repair Tool</h2>
            <div id="tmmeta-stats">Scanning...</div>
            <button id="tmmeta-btn" class="tmrep-btn" disabled>Fix Meta</button>
            <div class="tmrep-bar-wrap"><div id="tmmeta-bar"></div></div>
            <div id="tmmeta-status"></div>
            <div id="tmmeta-log"></div>
        `;
        target.insertBefore(metaPanel, target.firstChild);

        // Routine repair panel
        const rtnPanel = document.createElement('div');
        rtnPanel.id = 'tmrtn-panel';
        rtnPanel.innerHTML = `
            <h2>&#x23f1;&#xfe0f; Routine Repair Tool</h2>
            <div id="tmrtn-stats">Scanning...</div>
            <button id="tmrtn-btn" class="tmrep-btn" disabled>Fix Routine</button>
            <div class="tmrep-bar-wrap"><div id="tmrtn-bar"></div></div>
            <div id="tmrtn-status"></div>
            <div id="tmrtn-log"></div>
        `;
        target.insertBefore(rtnPanel, target.firstChild);

        // Key type fix panel
        const keyPanel = document.createElement('div');
        keyPanel.id = 'tmkey-panel';
        keyPanel.innerHTML = `
            <h2>&#x1f511; Key Type Fix</h2>
            <div id="tmkey-stats">Scanning...</div>
            <button id="tmkey-btn" class="tmrep-btn" disabled>Fix String Keys</button>
            <button id="tmkey-del-btn" class="tmrep-btn" disabled>Delete String Keys</button>
            <div class="tmrep-bar-wrap"><div id="tmkey-bar"></div></div>
            <div id="tmkey-status"></div>
            <div id="tmkey-log"></div>
        `;
        target.insertBefore(keyPanel, target.firstChild);
    };

    /* ─────────────────────────────────────────────────────────
       META SCAN + REPAIR LOGIC
       ───────────────────────────────────────────────────────── */

    let brokenMetaPids = [];
    let isMetaRunning = false;

    const logMeta = (msg, cls = 'tmrep-info') => {
        const el = document.getElementById('tmmeta-log');
        if (!el) return;
        const line = document.createElement('div');
        line.className = cls;
        line.textContent = msg;
        el.appendChild(line);
        el.scrollTop = el.scrollHeight;
    };

    const scanMeta = () => {
        const all = TmPlayerDB.allPids();
        brokenMetaPids = all.filter(pid => needsMetaRepair(TmPlayerDB.get(pid)));

        const statsEl = document.getElementById('tmmeta-stats');
        if (statsEl) {
            const breakdown = META_FIELDS.map(f => {
                const count = brokenMetaPids.filter(pid => {
                    const db = TmPlayerDB.get(pid);
                    return db?.meta == null || db.meta[f] == null || db.meta[f] === '';
                }).length;
                return count ? `${f}: ${count}` : null;
            }).filter(Boolean).join(', ');
            statsEl.innerHTML =
                `Tracked: <strong>${all.length}</strong> players — ` +
                `Missing meta: <strong style="color:#6cc040">${brokenMetaPids.length}</strong>` +
                (breakdown ? ` (${breakdown})` : '');
        }

        const btn = document.getElementById('tmmeta-btn');
        if (btn) btn.disabled = brokenMetaPids.length === 0;
    };

    const runMetaRepair = async () => {
        if (isMetaRunning || !brokenMetaPids.length) return;
        isMetaRunning = true;

        const btn = document.getElementById('tmmeta-btn');
        if (btn) btn.disabled = true;

        const logEl = document.getElementById('tmmeta-log');
        if (logEl) logEl.innerHTML = '';

        const total = brokenMetaPids.length;
        let done = 0, fixed = 0, failed = 0;

        const updateBar = () => {
            const bar = document.getElementById('tmmeta-bar');
            if (bar) bar.style.width = Math.round((done / total) * 100) + '%';
        };

        const startTime = Date.now();
        const updateStatus = (name = '') => {
            updateBar();
            const eta = formatEta(startTime, done, total);
            const statusEl = document.getElementById('tmmeta-status');
            if (statusEl) statusEl.textContent = `${done} / ${total}${name ? '  —  ' + name : ''}${eta ? '  |  ' + eta : ''}`;
        };

        // remaining: every broken pid — removed as soon as found in any squad response
        const remaining = new Set(brokenMetaPids.map(String));

        // stillBrokenAfterSquad: found in squad but meta still incomplete → needs tooltip
        const stillBrokenAfterSquad = [];

        // Clubs to fetch squads for — deduplicated list from players with a known club_id
        const clubsToFetch = [...new Set(
            brokenMetaPids
                .map(pid => TmPlayerDB.get(pid)?.meta?.club_id)
                .filter(Boolean)
        )];

        const noClubCount = brokenMetaPids.length - clubsToFetch.reduce(
            (acc, cid) => acc + brokenMetaPids.filter(p => TmPlayerDB.get(p)?.meta?.club_id === cid).length, 0);

        logMeta(`Phase 1: ${clubsToFetch.length} squad fetch(es) — scanning all squad members against ${total} tracked players (${noClubCount} have no club_id, may be caught opportunistically)...`);

        // Phase 1 — squad fetches
        // For each squad response we scan ALL players in post, not just expected ones.
        // This opportunistically resolves even "no club_id" players if they happen to be in fetched squads.
        for (const clubId of clubsToFetch) {
            // Skip if all known members of this club were already resolved by a previous squad fetch
            const hasAnyLeft = brokenMetaPids.some(p =>
                remaining.has(String(p)) && TmPlayerDB.get(p)?.meta?.club_id === clubId
            );
            if (!hasAnyLeft && !remaining.size) break;

            updateStatus(`Club ${clubId}…`);
            try {
                const squadData = await TmApi.fetchSquadRaw(clubId);
                // fetchSquadRaw already called normalizePlayer → _migratePlayerMeta for every player in the squad,
                // which auto-fills name/country/pos/isGK/club_id in the DB cache.

                for (const sp of (squadData?.post || [])) {
                    const pid = String(sp.id || sp.player_id);
                    if (!remaining.has(pid)) continue;  // not one of ours (or already resolved)
                    remaining.delete(pid);  // claim immediately — won't be picked up again

                    // patch name if _migratePlayerMeta left it empty (player_name alias timing)
                    const db = TmPlayerDB.get(pid);
                    if (db?.meta && !db.meta.name && sp.player_name) {
                        db.meta.name = sp.player_name;
                        await TmPlayerDB.set(pid, db);
                    }

                    done++;

                    if (needsMetaRepair(TmPlayerDB.get(pid))) {
                        logMeta(`~ ${sp.player_name || '#' + pid} (${pid}) still incomplete → tooltip fallback`, 'tmrep-info');
                        stillBrokenAfterSquad.push(pid);
                    } else {
                        fixed++;
                        logMeta(`✓ ${sp.player_name || '#' + pid} (${pid}) [squad]`, 'tmrep-ok');
                    }
                    updateStatus(sp.player_name || '#' + pid);
                }

                // Any expected pids from this club not found in squad → transferred
                for (const pid of (brokenMetaPids.filter(p =>
                    remaining.has(String(p)) && TmPlayerDB.get(p)?.meta?.club_id === clubId
                ))) {
                    remaining.delete(pid);
                    done++;
                    logMeta(`~ #${pid} not in squad ${clubId} → tooltip fallback`, 'tmrep-info');
                    stillBrokenAfterSquad.push(pid);
                    updateStatus(`#${pid}`);
                }
            } catch (e) {
                // Squad fetch failed — move all known members of this club to tooltip fallback
                for (const pid of brokenMetaPids.filter(p =>
                    remaining.has(String(p)) && TmPlayerDB.get(p)?.meta?.club_id === clubId
                )) {
                    remaining.delete(pid);
                    done++;
                    stillBrokenAfterSquad.push(pid);
                }
                logMeta(`✗ squad ${clubId}: ${e.message} — falling back to tooltip`, 'tmrep-err');
                updateStatus(`Club ${clubId} error`);
            }
            await new Promise(r => setTimeout(r, 50));
        }

        // Phase 2 — tooltip for: still broken after squad + never found in any squad (remaining)
        const phase2 = [...stillBrokenAfterSquad, ...remaining];
        if (phase2.length) {
            logMeta(`Phase 2: tooltip for ${phase2.length} players...`);
            for (const pid of phase2) {
                const db = TmPlayerDB.get(pid);
                const nameHint = db?.meta?.name || `#${pid}`;
                // remaining pids were never counted in phase 1
                const wasCounted = !remaining.has(String(pid));
                if (!db) {
                    if (!wasCounted) { done++; updateStatus(nameHint); }
                    continue;
                }
                const missing = missingMetaFields(db);
                try {
                    const resp = await TmApi.fetchPlayerTooltip(pid);
                    const p = resp?.player;
                    if (!p) throw new Error('no player in response');
                    if (!db.meta) db.meta = {};
                    if (missing.includes('name') && p.name) db.meta.name = p.name;
                    if (missing.includes('pos') && p.favposition) db.meta.pos = p.favposition;
                    if (missing.includes('isGK')) db.meta.isGK = String(p.favposition || '').split(',')[0].trim().toLowerCase() === 'gk';
                    if (missing.includes('country') && p.country) db.meta.country = p.country;
                    if (p.club_id) db.meta.club_id = String(p.club_id);
                    await TmPlayerDB.set(pid, db);
                    fixed++;
                    logMeta(`✓ ${p.name || nameHint} (${pid}) — ${missing.join(', ')} [tooltip]`, 'tmrep-ok');
                } catch (e) {
                    failed++;
                    logMeta(`✗ ${nameHint} (${pid}): ${e.message}`, 'tmrep-err');
                }
                if (!wasCounted) { done++; }
                updateStatus(nameHint);
                await new Promise(r => setTimeout(r, 11));
            }
        }

        const bar = document.getElementById('tmmeta-bar');
        if (bar) bar.style.width = '100%';
        const statusEl = document.getElementById('tmmeta-status');
        if (statusEl) statusEl.textContent = `Done — ${fixed} fixed, ${failed} errors.`;
        logMeta(`─── Meta repair complete: ${fixed} fixed, ${failed} errors ───`);

        isMetaRunning = false;
    };

    /* ─────────────────────────────────────────────────────────
       ROUTINE SCAN + REPAIR LOGIC
       Players with null routine need historyInfo so
       buildRoutineMap can back-calculate per-week routine.
       ───────────────────────────────────────────────────────── */

    let brokenRtnPids = [];
    let isRtnRunning = false;

    const logRtn = (msg, cls = 'tmrep-info') => {
        const el = document.getElementById('tmrtn-log');
        if (!el) return;
        const line = document.createElement('div');
        line.className = cls;
        line.textContent = msg;
        el.appendChild(line);
        el.scrollTop = el.scrollHeight;
    };

    const needsRoutineRepair = (DBPlayer) => {
        if (!DBPlayer?.records) return false;
        return Object.values(DBPlayer.records).some(r => r.routine == null);
    };

    const scanRoutine = () => {
        const all = TmPlayerDB.allPids();
        brokenRtnPids = all.filter(pid => needsRoutineRepair(TmPlayerDB.get(pid)));
        const statsEl = document.getElementById('tmrtn-stats');
        if (statsEl) {
            statsEl.innerHTML =
                `Tracked: <strong>${all.length}</strong> players &mdash; ` +
                `Null routine: <strong style="color:#6cc040">${brokenRtnPids.length}</strong>`;
        }
        const btn = document.getElementById('tmrtn-btn');
        if (btn) btn.disabled = brokenRtnPids.length === 0;
    };

    const runRoutineRepair = async () => {
        if (isRtnRunning || !brokenRtnPids.length) return;
        isRtnRunning = true;

        const btn = document.getElementById('tmrtn-btn');
        if (btn) btn.disabled = true;

        const logEl = document.getElementById('tmrtn-log');
        if (logEl) logEl.innerHTML = '';

        const total = brokenRtnPids.length;
        let done = 0, fixed = 0, failed = 0;
        const startTime = Date.now();

        logRtn(`Fetching history for ${total} players with null routine...`);

        for (const pid of brokenRtnPids) {
            const db = TmPlayerDB.get(pid);
            if (!db) { done++; continue; }

            const name = db.meta?.name || `#${pid}`;
            const nullCount = Object.values(db.records || {}).filter(r => r.routine == null).length;

            try {
                const fakePlayer = buildFakePlayer(pid, db);
                const [tooltipResp, historyInfo] = await Promise.all([
                    TmApi.fetchPlayerTooltip(pid),
                    TmApi.fetchPlayerInfo(pid, 'history'),
                ]);
                // fakePlayer.routine comes from DB (null→0), so override with the live value
                const liveRoutine = tooltipResp?.player?.routine;
                if (liveRoutine != null) fakePlayer.routine = liveRoutine;
                await TmSync.analyzeGrowth(fakePlayer, db, null, historyInfo);

                fixed++;
                logRtn(`✓ ${name} (${pid}) — ${nullCount} null routines filled`, 'tmrep-ok');
            } catch (e) {
                failed++;
                logRtn(`✗ ${name} (${pid}): ${e.message}`, 'tmrep-err');
            }

            done++;
            const bar = document.getElementById('tmrtn-bar');
            if (bar) bar.style.width = Math.round((done / total) * 100) + '%';
            const eta = formatEta(startTime, done, total);
            const statusEl = document.getElementById('tmrtn-status');
            if (statusEl) statusEl.textContent = `${done} / ${total}  —  ${name}${eta ? '  |  ' + eta : ''}`;

            await new Promise(r => setTimeout(r, 200));
        }

        const bar = document.getElementById('tmrtn-bar');
        if (bar) bar.style.width = '100%';
        const statusEl = document.getElementById('tmrtn-status');
        if (statusEl) statusEl.textContent = `Done — ${fixed} fixed, ${failed} errors.`;
        logRtn(`─── Routine repair complete: ${fixed} fixed, ${failed} errors ───`);

        isRtnRunning = false;
    };

    /* ─────────────────────────────────────────────────────────
       KEY TYPE FIX
       Copies string-keyed IDB records to integer keys.
       String keys are NOT deleted yet.
       ───────────────────────────────────────────────────────── */

    const logKey = (msg, cls = 'tmrep-info') => {
        const el = document.getElementById('tmkey-log');
        if (!el) return;
        const line = document.createElement('div');
        line.className = cls;
        line.textContent = msg;
        el.appendChild(line);
        el.scrollTop = el.scrollHeight;
    };

    const openRawDB = () => new Promise((resolve, reject) => {
        const req = indexedDB.open('TMPlayerData', 1);
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });

    const getRawKeys = (db) => new Promise((resolve, reject) => {
        const tx = db.transaction('players', 'readonly');
        const req = tx.objectStore('players').getAllKeys();
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e.target.error);
    });

    const getRawValue = (db, key) => new Promise((resolve, reject) => {
        const tx = db.transaction('players', 'readonly');
        const req = tx.objectStore('players').get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e.target.error);
    });

    const putRawValue = (db, key, value) => new Promise((resolve, reject) => {
        const tx = db.transaction('players', 'readwrite');
        tx.objectStore('players').put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
    });

    let stringKeyPids = [];
    let isKeyRunning = false;

    const scanKeyTypes = async () => {
        try {
            const db = await openRawDB();
            const keys = await getRawKeys(db);
            db.close();
            // string keys that look like integers
            stringKeyPids = keys.filter(k => typeof k === 'string' && /^\d+$/.test(k));
            const statsEl = document.getElementById('tmkey-stats');
            if (statsEl) {
                const intCount = keys.filter(k => typeof k === 'number').length;
                statsEl.innerHTML =
                    `Total IDB keys: <strong>${keys.length}</strong> — ` +
                    `Integer keys: <strong>${intCount}</strong> — ` +
                    `String keys to fix: <strong style="color:#6cc040">${stringKeyPids.length}</strong>`;
            }
            const btn = document.getElementById('tmkey-btn');
            if (btn) btn.disabled = stringKeyPids.length === 0;
            const delBtn = document.getElementById('tmkey-del-btn');
            if (delBtn) delBtn.disabled = stringKeyPids.length === 0;
        } catch (e) {
            const statsEl = document.getElementById('tmkey-stats');
            if (statsEl) statsEl.textContent = `Error scanning: ${e.message}`;
        }
    };

    const runKeyDelete = async () => {
        if (isKeyRunning || !stringKeyPids.length) return;
        isKeyRunning = true;
        document.getElementById('tmkey-btn')?.setAttribute('disabled', '');
        document.getElementById('tmkey-del-btn')?.setAttribute('disabled', '');
        document.getElementById('tmkey-log').innerHTML = '';

        const db = await openRawDB();
        const total = stringKeyPids.length;
        let done = 0, deleted = 0, failed = 0;
        const startTime = Date.now();

        logKey(`Deleting ${total} string-keyed records from IDB...`);

        for (const strKey of stringKeyPids) {
            try {
                await new Promise((resolve, reject) => {
                    const tx = db.transaction('players', 'readwrite');
                    tx.objectStore('players').delete(strKey);
                    tx.oncomplete = () => resolve();
                    tx.onerror = (e) => reject(e.target.error);
                });
                deleted++;
                logKey(`✓ deleted ${strKey}`, 'tmrep-ok');
            } catch (e) {
                failed++;
                logKey(`✗ ${strKey}: ${e.message}`, 'tmrep-err');
            }
            done++;
            const bar = document.getElementById('tmkey-bar');
            if (bar) bar.style.width = Math.round((done / total) * 100) + '%';
            const eta = formatEta(startTime, done, total);
            document.getElementById('tmkey-status').textContent = `${done} / ${total}${eta ? '  |  ' + eta : ''}`;
        }

        db.close();
        stringKeyPids = [];
        document.getElementById('tmkey-bar').style.width = '100%';
        document.getElementById('tmkey-status').textContent =
            `Done — ${deleted} deleted, ${failed} errors.`;
        logKey(`─── Delete complete: ${deleted} deleted, ${failed} errors ───`);
        isKeyRunning = false;
        // rescan to confirm
        await scanKeyTypes();
    };

    const runKeyFix = async () => {
        if (isKeyRunning || !stringKeyPids.length) return;
        isKeyRunning = true;
        document.getElementById('tmkey-btn')?.setAttribute('disabled', '');
        document.getElementById('tmkey-log').innerHTML = '';

        const db = await openRawDB();
        const allKeys = new Set(await getRawKeys(db));
        const total = stringKeyPids.length;
        let done = 0, copied = 0, skipped = 0, failed = 0;
        const startTime = Date.now();

        logKey(`Copying ${total} string-keyed records to integer keys (originals kept)...`);

        for (const strKey of stringKeyPids) {
            const intKey = parseInt(strKey);
            try {
                if (allKeys.has(intKey)) {
                    skipped++;
                    logKey(`~ ${strKey} — integer key already exists, skipped`, 'tmrep-info');
                } else {
                    const value = await getRawValue(db, strKey);
                    await putRawValue(db, intKey, value);
                    copied++;
                    logKey(`✓ ${strKey} → ${intKey}`, 'tmrep-ok');
                }
            } catch (e) {
                failed++;
                logKey(`✗ ${strKey}: ${e.message}`, 'tmrep-err');
            }
            done++;
            const bar = document.getElementById('tmkey-bar');
            if (bar) bar.style.width = Math.round((done / total) * 100) + '%';
            const eta = formatEta(startTime, done, total);
            document.getElementById('tmkey-status').textContent = `${done} / ${total}${eta ? '  |  ' + eta : ''}`;
        }

        db.close();
        document.getElementById('tmkey-bar').style.width = '100%';
        document.getElementById('tmkey-status').textContent =
            `Done — ${copied} copied, ${skipped} skipped (already existed), ${failed} errors.`;
        logKey(`─── Key fix complete: ${copied} copied, ${skipped} skipped, ${failed} errors ───`);
        isKeyRunning = false;
        // Enable delete button now that copies exist
        const delBtn = document.getElementById('tmkey-del-btn');
        if (delBtn && copied > 0) delBtn.removeAttribute('disabled');
    };

    /* ─────────────────────────────────────────────────────────
       SCAN + REPAIR LOGIC
       ───────────────────────────────────────────────────────── */

    let brokenPids = [];
    let otherPids = [];  // all non-own tracked players (independent of needsRepair)
    let isRunning = false;

    const log = (msg, cls = 'tmrep-info') => {
        const el = document.getElementById('tmrep-log');
        if (!el) return;
        const line = document.createElement('div');
        line.className = cls;
        line.textContent = msg;
        el.appendChild(line);
        el.scrollTop = el.scrollHeight;
    };

    const scan = () => {
        const all = TmPlayerDB.allPids();
        brokenPids = all.filter(pid => needsRepair(TmPlayerDB.get(pid)));

        const nullCount = brokenPids.filter(pid => {
            const db = TmPlayerDB.get(pid);
            return Object.values(db.records || {}).some(r => r.R5 == null || r.REREC == null);
        }).length;

        const intCount = brokenPids.filter(pid => {
            const db = TmPlayerDB.get(pid);
            return Object.values(db.records || {}).some(r =>
                r.R5 != null && r.REREC != null &&
                Array.isArray(r.skills) &&
                r.skills.every(s => { const v = typeof s === 'object' ? parseFloat(s?.value) : parseFloat(s); return isFinite(v) && v % 1 === 0; })
            );
        }).length;

        const s = window.SESSION;
        const ownClubIds = s ? [s.main_id, s.b_team].filter(Boolean).map(Number) : [];
        otherPids = all.filter(pid => {
            const clubId = TmPlayerDB.get(pid)?.meta?.club_id;
            if (clubId == null) return true;  // no club_id stored → assume non-own
            return !ownClubIds.includes(Number(clubId));
        });

        const statsEl = document.getElementById('tmrep-stats');
        if (statsEl) {
            statsEl.innerHTML =
                `Tracked: <strong>${all.length}</strong> players — ` +
                `Needs repair: <strong style="color:#6cc040">${brokenPids.length}</strong> ` +
                `(${nullCount} null R5/REREC, ${intCount} integer-only skills) — ` +
                `Others tracked: <strong style="color:#6cc040">${otherPids.length}</strong>`;
        }

        const btn = document.getElementById('tmrep-btn');
        if (btn) btn.disabled = brokenPids.length === 0;
        const btnOthers = document.getElementById('tmrep-btn-others');
        if (btnOthers) btnOthers.disabled = otherPids.length === 0;
    };

    const runRepair = async (pids) => {
        if (isRunning || !pids?.length) return;
        isRunning = true;

        document.getElementById('tmrep-btn')?.setAttribute('disabled', '');
        document.getElementById('tmrep-btn-others')?.setAttribute('disabled', '');

        const logEl = document.getElementById('tmrep-log');
        if (logEl) logEl.innerHTML = '';

        const total = pids.length;
        let done = 0, fixed = 0, failed = 0;
        const startTime = Date.now();

        const s = window.SESSION;
        const ownClubIds = s ? [s.main_id, s.b_team].filter(Boolean).map(Number) : [];
        const squadCache = {};  // clubId → fetchSquadRaw response (cached)

        log(`Fetching training and running analyzeGrowth for ${total} players...`);

        for (const pid of pids) {
            const db = TmPlayerDB.get(pid);
            if (!db) { done++; continue; }

            const name = db.meta?.name || `#${pid}`;
            const recCount = Object.keys(db.records || {}).length;

            try {
                const fakePlayer = buildFakePlayer(pid, db);

                const clubId = db.meta?.club_id ? String(db.meta.club_id) : null;
                const isOwnPlayer = clubId != null && ownClubIds.includes(Number(clubId));

                // Fetch training: own players → training endpoint; others → squad (cached per club)
                let trainingInfo = null;
                if (!fakePlayer.isGK) {
                    if (isOwnPlayer) {
                        trainingInfo = await TmApi.fetchPlayerInfo(pid, 'training');
                    } else {
                        let resolvedClubId = clubId;

                        // If we have a club_id, try squad first
                        if (resolvedClubId) {
                            if (!squadCache[resolvedClubId]) squadCache[resolvedClubId] = await TmApi.fetchSquadRaw(resolvedClubId);
                            const sp = (squadCache[resolvedClubId]?.post || []).find(p => String(p.id) === String(pid));
                            if (sp) {
                                trainingInfo = buildTrainingInfoFromPlayer(sp);
                            } else {
                                resolvedClubId = null;  // not in squad → transferred
                            }
                        }

                        // No club_id or player not found in old squad → fetch tooltip for current club
                        if (!resolvedClubId) {
                            const tooltipResp = await TmApi.fetchPlayerTooltip(pid);
                            const newClubId = tooltipResp?.player?.club_id ? String(tooltipResp.player.club_id) : null;
                            if (newClubId && newClubId !== clubId) {
                                if (!db.meta) db.meta = {};
                                db.meta.club_id = newClubId;
                                TmPlayerDB.set(pid, db);
                            }
                            resolvedClubId = newClubId;
                            if (resolvedClubId && !ownClubIds.includes(Number(resolvedClubId))) {
                                if (!squadCache[resolvedClubId]) squadCache[resolvedClubId] = await TmApi.fetchSquadRaw(resolvedClubId);
                                const sp = (squadCache[resolvedClubId]?.post || []).find(p => String(p.id) === String(pid));
                                trainingInfo = buildTrainingInfoFromPlayer(sp);
                            }
                        }
                    }
                }

                const historyInfo = null;  // routine already stored per record; buildRoutineMap falls back to rec.routine

                await TmSync.analyzeGrowth(fakePlayer, db, trainingInfo, historyInfo);

                // Small delay to avoid hammering the server
                await new Promise(r => setTimeout(r, 10));

                fixed++;
                log(`✓ ${name} (${pid}) — ${recCount} records`, 'tmrep-ok');
            } catch (e) {
                failed++;
                log(`✗ ${name} (${pid}): ${e.message}`, 'tmrep-err');
                const db2 = TmPlayerDB.get(pid);
                const fakeP2 = (() => { try { return buildFakePlayer(pid, db2); } catch (_) { return null; } })();
                console.group(`[REPAIR ERROR] pid=${pid} name=${name}`);
                console.error('Error:', e);
                console.log('fakePlayer:', fakeP2);
                console.log('DBPlayer.meta:', db2?.meta);
                console.log('DBPlayer.records:', db2?.records);
                console.groupEnd();
            }

            done++;
            const bar = document.getElementById('tmrep-bar');
            if (bar) bar.style.width = Math.round((done / total) * 100) + '%';
            const eta = formatEta(startTime, done, total);
            const statusEl = document.getElementById('tmrep-status');
            if (statusEl) statusEl.textContent = `${done} / ${total}  —  ${name}${eta ? '  |  ' + eta : ''}`;
        }

        const bar = document.getElementById('tmrep-bar');
        if (bar) bar.style.width = '100%';
        const statusEl = document.getElementById('tmrep-status');
        if (statusEl) statusEl.textContent = `Done — ${fixed} fixed, ${failed} errors.`;
        log(`─── Repair complete: ${fixed} fixed, ${failed} errors ───`, 'tmrep-info');

        isRunning = false;
    };

    /* ─────────────────────────────────────────────────────────
       INIT
       ───────────────────────────────────────────────────────── */

    const init = () => {
        injectUI();
        TmPlayerDB.init().then(() => {
            scan();
            const btn = document.getElementById('tmrep-btn');
            if (btn) btn.addEventListener('click', () => runRepair(brokenPids));
            const btnOthers = document.getElementById('tmrep-btn-others');
            if (btnOthers) btnOthers.addEventListener('click', () => runRepair(otherPids));

            scanMeta();
            const metaBtn = document.getElementById('tmmeta-btn');
            if (metaBtn) metaBtn.addEventListener('click', runMetaRepair);

            scanRoutine();
            const rtnBtn = document.getElementById('tmrtn-btn');
            if (rtnBtn) rtnBtn.addEventListener('click', runRoutineRepair);

            scanKeyTypes();
            const keyBtn = document.getElementById('tmkey-btn');
            if (keyBtn) keyBtn.addEventListener('click', runKeyFix);
            const keyDelBtn = document.getElementById('tmkey-del-btn');
            if (keyDelBtn) keyDelBtn.addEventListener('click', runKeyDelete);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
