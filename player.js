// ==UserScript==
// @name         TM Player Enhanced
// @namespace    https://trophymanager.com
// @version      1.5.0
// @description  Player page overhaul — redesigned card, live transfer tracker, R5/REC/TI charts, skill graphs, compare tool, squad scout & more
// @match        https://trophymanager.com/players/*
// @grant        none
// @run-at       document-idle
// @downloadURL https://update.greasyfork.org/scripts/568493/TM%20Player%20Enhanced.user.js
// @updateURL https://update.greasyfork.org/scripts/568493/TM%20Player%20Enhanced.meta.js
// ==/UserScript==

(function () {
    'use strict';

    const $ = window.jQuery;
    if (!$) return;

    const urlMatch = location.pathname.match(/\/players\/(\d+)/);
    const IS_SQUAD_PAGE = !urlMatch && /\/players\/?$/.test(location.pathname);
    if (!urlMatch && !IS_SQUAD_PAGE) return;
    const PLAYER_ID = urlMatch ? urlMatch[1] : null;

    /* ═══════════════════════════════════════════════════════════
       IndexedDB Storage — replaces localStorage for player data
       (localStorage has 5 MB limit; IndexedDB has hundreds of MB)
       Provides sync reads via in-memory cache + async writes.
       ═══════════════════════════════════════════════════════════ */
    const PlayerDB = (() => {
        const DB_NAME = 'TMPlayerData';
        const STORE_NAME = 'players';
        const DB_VERSION = 1;
        let db = null;
        const cache = {};

        const open = () => new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const d = e.target.result;
                if (!d.objectStoreNames.contains(STORE_NAME))
                    d.createObjectStore(STORE_NAME);
            };
            req.onsuccess = (e) => { db = e.target.result; resolve(db); };
            req.onerror = (e) => reject(e.target.error);
        });

        /** Sync read from cache (call after init) */
        const get = (pid) => cache[pid] || null;

        /** Async write: updates cache immediately + persists to IndexedDB */
        const set = (pid, value) => {
            cache[pid] = value;
            if (!db) return Promise.resolve();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).put(value, pid);
                tx.oncomplete = () => resolve();
                tx.onerror = (e) => reject(e.target.error);
            }).catch(e => console.warn('[DB] write failed:', e));
        };

        /** Async delete: removes from cache + IndexedDB */
        const remove = (pid) => {
            delete cache[pid];
            if (!db) return Promise.resolve();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).delete(pid);
                tx.oncomplete = () => resolve();
                tx.onerror = (e) => reject(e.target.error);
            }).catch(e => console.warn('[DB] delete failed:', e));
        };

        /** Get all pids (from cache, sync) */
        const allPids = () => Object.keys(cache);

        /** Init: open DB → migrate localStorage → preload cache */
        const init = async () => {
            await open();

            /* Migrate existing localStorage _data keys to IndexedDB */
            const toMigrate = [];
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (!k || !k.endsWith('_data')) continue;
                const pid = k.replace('_data', '');
                if (!/^\d+$/.test(pid)) continue;
                try {
                    const data = JSON.parse(localStorage.getItem(k));
                    if (data) toMigrate.push({ pid, data });
                    keysToRemove.push(k);
                } catch (e) { keysToRemove.push(k); }
            }
            if (toMigrate.length > 0) {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                for (const item of toMigrate) store.put(item.data, item.pid);
                await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
                for (const k of keysToRemove) localStorage.removeItem(k);
                console.log(`%c[DB] Migrated ${toMigrate.length} player(s) from localStorage → IndexedDB`,
                    'font-weight:bold;color:#6cc040');
            }

            /* Preload ALL records into sync cache */
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const reqAll = store.getAll();
            const reqKeys = store.getAllKeys();
            await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
            for (let i = 0; i < reqKeys.result.length; i++)
                cache[reqKeys.result[i]] = reqAll.result[i];

            console.log(`[DB] Loaded ${Object.keys(cache).length} player(s) from IndexedDB`);

            /* Request persistent storage so Chrome won't auto-evict */
            if (navigator.storage && navigator.storage.persist) {
                navigator.storage.persist().then(granted => {
                    console.log(`[DB] Persistent storage: ${granted ? '✓ granted' : '✗ denied'}`);
                });
            }
        };

        return { init, get, set, remove, allPids };
    })();

    /* ── Migrate R6 old format + scan unmigrated ── */
    const scanAndMigrateR6 = () => {
        /* Phase 1: Convert R6 4-key format ({pid}_SI etc.) → PlayerDB */
        const seenPids = new Set();
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k) continue;
            const m = k.match(/^(\d+)_SI$/);
            if (!m) continue;
            const pid = m[1];
            if (seenPids.has(pid)) continue;
            seenPids.add(pid);
            const existing = PlayerDB.get(pid);
            if (existing && (existing._v === 1 || existing._v === 2 || existing._v === 3)) continue;
            try {
                const siObj = JSON.parse(localStorage.getItem(`${pid}_SI`) || '{}');
                const rerecObj = JSON.parse(localStorage.getItem(`${pid}_REREC`) || '{}');
                const r5Obj = JSON.parse(localStorage.getItem(`${pid}_R5`) || '{}');
                const skillsObj = JSON.parse(localStorage.getItem(`${pid}_skills`) || '{}');
                const ages = Object.keys(siObj);
                if (ages.length === 0) continue;
                const store = { _v: 1, lastSeen: Date.now(), records: {} };
                for (const ageKey of ages) {
                    store.records[ageKey] = {
                        SI: parseInt(siObj[ageKey]) || 0,
                        REREC: rerecObj[ageKey] ?? null,
                        R5: r5Obj[ageKey] ?? null,
                        skills: skillsObj[ageKey] || []
                    };
                }
                PlayerDB.set(pid, store);
                localStorage.removeItem(`${pid}_SI`);
                localStorage.removeItem(`${pid}_REREC`);
                localStorage.removeItem(`${pid}_R5`);
                localStorage.removeItem(`${pid}_skills`);
                console.log(`%c[Migration] Converted R6 player ${pid} (${ages.length} records) → PlayerDB v1`,
                    'color:#6cc040');
            } catch (e) {
                console.warn(`[Migration] Failed R6→PlayerDB for ${pid}:`, e.message);
            }
        }

        /* Phase 2: Log players still needing v3 migration */
        const unmigrated = [];
        for (const pid of PlayerDB.allPids()) {
            const s = PlayerDB.get(pid);
            if (s && s._v < 3 && s.records && Object.keys(s.records).length > 3) {
                const firstKey = Object.keys(s.records)[0];
                const sk = s.records[firstKey]?.skills;
                const type = Array.isArray(sk) && sk.length === 11 ? 'GK' : 'OUT';
                unmigrated.push({
                    Player: pid, Type: type, Records: Object.keys(s.records).length, Version: s._v,
                    Link: `https://trophymanager.com/players/${pid}/`
                });
            }
        }
        if (unmigrated.length > 0) {
            console.log(`%c[Migration] ${unmigrated.length} player(s) need v3 sync (visit each):`,
                'font-weight:bold;color:#fbbf24');
            unmigrated.sort((a, b) => b.Records - a.Records);
            console.table(unmigrated);
        } else {
            console.log('[Migration] All players migrated ✓');
        }
    };

    /* ═══════════════════════════════════════════════════════════
       SQUAD PAGE — Parse players table from /players/ list page
       Extracts skill values, training progress (part_up, one_up),
       TI and TI change for each player in the squad table.
       ═══════════════════════════════════════════════════════════ */
    const SKILL_NAMES_OUT_SHORT = ['Str','Sta','Pac','Mar','Tac','Wor','Pos','Pas','Cro','Tec','Hea','Fin','Lon','Set'];
    const SKILL_NAMES_GK_SHORT  = ['Str','Sta','Pac','Han','One','Ref','Aer','Jum','Com','Kic','Thr'];
    const SKILL_NAMES_OUT_FULL  = ['Strength','Stamina','Pace','Marking','Tackling','Workrate','Positioning','Passing','Crossing','Technique','Heading','Finishing','Longshots','Set Pieces'];
    const SKILL_NAMES_GK_FULL   = ['Strength','Stamina','Pace','Handling','One on ones','Reflexes','Aerial Ability','Jumping','Communication','Kicking','Throwing'];

    /* ═══════════════════════════════════════════════════════════
       SQUAD PAGE — Ensure all players (main + reserves) are visible
       Hash format: #/a/{true|false}/b/{true|false}/
       ═══════════════════════════════════════════════════════════ */
    const parseSquadHash = () => {
        const h = location.hash || '';
        const aMatch = h.match(/\/a\/(true|false)/i);
        const bMatch = h.match(/\/b\/(true|false)/i);
        return {
            a: aMatch ? aMatch[1] === 'true' : true,   /* default: main squad visible */
            b: bMatch ? bMatch[1] === 'true' : false    /* default: reserves hidden */
        };
    };

    const ensureAllPlayersVisible = () => new Promise((resolve) => {
        const sqDiv = document.getElementById('sq');
        if (!sqDiv) { resolve(); return; }

        const vis = parseSquadHash();
        const needA = !vis.a;
        const needB = !vis.b;

        if (!needA && !needB) { resolve(); return; } /* Both already visible */

        /* Set hash to show both squads */
        const newHash = '#/a/true/b/true/';
        const onHashChange = () => {
            window.removeEventListener('hashchange', onHashChange);
            /* Wait for DOM to update after hash-triggered toggle */
            setTimeout(resolve, 500);
        };
        window.addEventListener('hashchange', onHashChange);
        location.hash = newHash;

        /* If hash was already the same (no event fires), or toggles need clicking */
        setTimeout(() => {
            window.removeEventListener('hashchange', onHashChange);
            /* Fallback: click toggles directly if hash didn't work */
            if (needA) { const aBtn = document.getElementById('toggle_a_team'); if (aBtn) aBtn.click(); }
            if (needB) { const bBtn = document.getElementById('toggle_b_team'); if (bBtn) bBtn.click(); }
            setTimeout(resolve, 500);
        }, 1500);
    });

    /* ═══════════════════════════════════════════════════════════
       SQUAD PAGE — Loader/Progress overlay
       ═══════════════════════════════════════════════════════════ */
    const createSquadLoader = () => {
        const overlay = document.createElement('div');
        overlay.id = 'tmrc-squad-loader';
        overlay.innerHTML = `
            <div style="position:fixed;top:0;left:0;right:0;z-index:99999;
                         background:rgba(20,30,15,0.95);border-bottom:2px solid #6cc040;
                         padding:10px 20px;font-family:Arial,sans-serif;color:#e8f5d8;">
                <div style="display:flex;align-items:center;gap:12px;max-width:900px;margin:0 auto;">
                    <div style="font-size:14px;font-weight:700;color:#6cc040;">⚽ Squad Sync</div>
                    <div style="flex:1;background:rgba(108,192,64,0.15);border-radius:8px;height:18px;
                                overflow:hidden;border:1px solid rgba(108,192,64,0.3);">
                        <div id="tmrc-loader-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#3d6828,#6cc040);
                                  border-radius:8px;transition:width 0.3s;"></div>
                    </div>
                    <div id="tmrc-loader-text" style="font-size:12px;min-width:180px;text-align:right;">Initializing...</div>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        return {
            update: (current, total, name) => {
                const pct = Math.round((current / total) * 100);
                const bar = document.getElementById('tmrc-loader-bar');
                const txt = document.getElementById('tmrc-loader-text');
                if (bar) bar.style.width = pct + '%';
                if (txt) txt.textContent = `${current}/${total} — ${name}`;
            },
            done: (count) => {
                const bar = document.getElementById('tmrc-loader-bar');
                const txt = document.getElementById('tmrc-loader-text');
                if (bar) bar.style.width = '100%';
                if (txt) { txt.style.color = '#6cc040'; txt.textContent = `✓ ${count} players processed`; }
                setTimeout(() => {
                    const el = document.getElementById('tmrc-squad-loader');
                    if (el) { el.style.transition = 'opacity 0.5s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 600); }
                }, 2500);
            },
            error: (msg) => {
                const txt = document.getElementById('tmrc-loader-text');
                if (txt) { txt.style.color = '#f87171'; txt.textContent = msg; }
                setTimeout(() => { const el = document.getElementById('tmrc-squad-loader'); if (el) el.remove(); }, 4000);
            }
        };
    };

    const parseSquadPage = () => {
        const sqDiv = document.getElementById('sq');
        if (!sqDiv) { console.warn('[Squad] No #sq div found'); return; }

        const rows = sqDiv.querySelectorAll('table tbody tr:not(.header):not(.splitter)');
        if (!rows.length) { console.warn('[Squad] No player rows found'); return; }

        /* Detect if we've hit the GK section */
        let isGKSection = false;
        const allRows = sqDiv.querySelectorAll('table tbody tr');
        const splitterIndices = new Set();
        allRows.forEach((r, i) => { if (r.classList.contains('splitter')) splitterIndices.add(i); });

        const players = [];

        allRows.forEach((row, rowIdx) => {
            if (row.classList.contains('splitter')) {
                isGKSection = true; // After "Goalkeepers" splitter
                return;
            }
            if (row.classList.contains('header')) return;

            const cells = row.querySelectorAll('td');
            if (cells.length < 10) return; // Skip malformed rows

            /* ── Player ID from link ── */
            const link = row.querySelector('a[player_link]');
            if (!link) return;
            const pid = link.getAttribute('player_link');
            const name = link.textContent.trim();

            /* ── Squad number ── */
            const numEl = cells[0]?.querySelector('span.faux_link');
            const number = numEl ? parseInt(numEl.textContent) || 0 : 0;

            /* ── Age ── */
            const ageText = cells[2]?.textContent?.trim() || '0.0';
            const [ageYears, ageMonths] = ageText.split('.').map(s => parseInt(s) || 0);

            /* ── Position ── */
            const posEl = cells[3]?.querySelector('.favposition');
            const posText = posEl ? posEl.textContent.trim() : '';
            const isGK = isGKSection;

            /* ── Skills: parse values + training status ── */
            const skillCount = isGK ? 11 : 14;
            const skillStartIdx = 4; // Skills start at column index 4
            const skills = [];
            const improved = []; // Array of { index, type: 'part_up'|'one_up' }

            for (let i = 0; i < skillCount; i++) {
                const cell = cells[skillStartIdx + i];
                if (!cell) { skills.push(0); continue; }

                const innerDiv = cell.querySelector('div.skill');
                if (!innerDiv) { skills.push(0); continue; }

                /* Check training status */
                const hasPartUp = innerDiv.classList.contains('part_up');
                const hasOneUp = innerDiv.classList.contains('one_up');

                /* Parse skill value: could be a number or a star image */
                const starImg = innerDiv.querySelector('img');
                let skillVal = 0;
                if (starImg) {
                    const src = starImg.getAttribute('src') || '';
                    if (src.includes('star_silver')) skillVal = 19;
                    else if (src.includes('star')) skillVal = 20;
                } else {
                    skillVal = parseInt(innerDiv.textContent.trim()) || 0;
                }

                skills.push(skillVal);

                if (hasPartUp) {
                    improved.push({ index: i, type: 'part_up', skillName: isGK ? SKILL_NAMES_GK_SHORT[i] : SKILL_NAMES_OUT_SHORT[i] });
                } else if (hasOneUp) {
                    improved.push({ index: i, type: 'one_up', skillName: isGK ? SKILL_NAMES_GK_SHORT[i] : SKILL_NAMES_OUT_SHORT[i] });
                }
            }

            /* ── TI and TI change: last 2 cells (before any dashes for GK) ── */
            // For outfield: columns 4..17 = 14 skills, then col 18 = TI, col 19 = +/-
            // For GK: columns 4..14 = 11 skills, then 3 dash columns (15,16,17), then col 18 = TI, col 19 = +/-
            const tiIdx = skillStartIdx + skillCount + (isGK ? 3 : 0); // Skip 3 dash cols for GK
            const tiCell = cells[tiIdx];
            const tiChangeCell = cells[tiIdx + 1];
            const TI = tiCell ? parseInt(tiCell.textContent.trim()) || 0 : 0;
            const tiChangeText = tiChangeCell ? tiChangeCell.textContent.trim() : '0';
            const TI_change = parseInt(tiChangeText.replace('+', '')) || 0;

            /* ── Build player summary ── */
            const totalSkill = skills.reduce((s, v) => s + v, 0);
            const partUpCount = improved.filter(x => x.type === 'part_up').length;
            const oneUpCount = improved.filter(x => x.type === 'one_up').length;

            players.push({
                pid,
                name,
                number,
                ageYears,
                ageMonths,
                position: posText,
                isGK,
                skills,
                improved,
                partUpCount,
                oneUpCount,
                totalImproved: partUpCount + oneUpCount,
                TI,
                TI_change,
                totalSkill
            });
        });

        return players;
    };

    /* ═══════════════════════════════════════════════════════════
       SQUAD PAGE — Process: fetch tooltips, distribute decimals,
       log results with +/- compared to previous week.
       ═══════════════════════════════════════════════════════════ */
    const processSquadPage = async (players) => {
        if (!players || !players.length) return;

        const NAMES_OUT = ['Strength','Stamina','Pace','Marking','Tackling','Workrate','Positioning','Passing','Crossing','Technique','Heading','Finishing','Longshots','Set Pieces'];
        const NAMES_GK  = ['Strength','Stamina','Pace','Handling','One on ones','Reflexes','Aerial Ability','Jumping','Communication','Kicking','Throwing'];

        /* TI efficiency by skill level — same as analyzeGrowth */
        const eff = (lvl) => {
            if (lvl >= 20) return 0;
            if (lvl >= 18) return 0.04;
            if (lvl >= 15) return 0.05;
            if (lvl >= 5)  return 0.10;
            return 0.15;
        };

        /* ASI → total skill points */
        const totalPts = (asi, isGK) => {
            const w = isGK ? 48717927500 : 263533760000;
            return Math.pow(2, Math.log(w * asi) / Math.log(Math.pow(2, 7)));
        };

        /* Extract integer skills from tooltip [{name, value}] */
        const extractSkills = (skillsArr, isGK) => {
            const names = isGK ? NAMES_GK : NAMES_OUT;
            const sv = (name) => {
                const sk = skillsArr.find(s => s.name === name);
                if (!sk) return 0;
                const v = sk.value;
                if (typeof v === 'string') {
                    if (v.includes('star_silver')) return 19;
                    if (v.includes('star')) return 20;
                    return parseInt(v) || 0;
                }
                return parseInt(v) || 0;
            };
            return names.map(sv);
        };

        /* Fetch tooltip for a single player */
        const fetchTip = (pid) => new Promise((resolve) => {
            $.post('/ajax/tooltip.ajax.php', { player_id: pid }, (res) => {
                try {
                    const data = typeof res === 'object' ? res : JSON.parse(res);
                    resolve(data && data.player ? data.player : null);
                } catch (e) { resolve(null); }
            }).fail(() => resolve(null));
        });

        /* Delay helper */
        const delay = (ms) => new Promise(r => setTimeout(r, ms));

        console.log(`%c[Squad] Fetching tooltips for ${players.length} players...`, 'font-weight:bold;color:#38bdf8');

        /* ── Loader UI ── */
        const loader = createSquadLoader();

        const results = [];

        for (let pi = 0; pi < players.length; pi++) {
            const p = players[pi];
            loader.update(pi + 1, players.length, p.name);

            /* Skip players whose current-week record is already locked */
            const curAgeKeyCheck = `${p.ageYears}.${p.ageMonths}`;
            const existingStore = PlayerDB.get(p.pid);
            if (existingStore && existingStore.records && existingStore.records[curAgeKeyCheck]?.locked) {
                console.log(`[Squad] ${p.name} — already locked for ${curAgeKeyCheck}, skipping`);
                continue;
            }

            const tip = await fetchTip(p.pid);
            await delay(100); // avoid hammering server

            if (!tip) {
                console.warn(`[Squad] Could not fetch tooltip for ${p.name} (${p.pid})`);
                continue;
            }

            /* ── Extract data from tooltip ── */
            const asi = parseInt((tip.asi || tip.skill_index || '').toString().replace(/[^0-9]/g, '')) || 0;
            const routine = parseFloat(tip.routine) || 0;
            const wage = parseInt((tip.wage || '').toString().replace(/[^0-9]/g, '')) || 0;
            const favpos = tip.favposition || '';
            const isGK = favpos.split(',')[0].toLowerCase() === 'gk';
            const N = isGK ? 11 : 14;
            const NAMES = isGK ? NAMES_GK : NAMES_OUT;
            const SHORT = isGK ? SKILL_NAMES_GK_SHORT : SKILL_NAMES_OUT_SHORT;

            /* Integer skills from tooltip (ground truth) */
            const intSkills = tip.skills ? extractSkills(tip.skills, isGK) : p.skills;

            /* ── Get previous decimals from IndexedDB ── */
            const dbRecord = PlayerDB.get(p.pid);
            let prevDecimals = null;
            let prevAgeKey = null;
            let prevSkillsFull = null;
            let curDbSkillsFull = null;

            if (dbRecord && dbRecord.records) {
                /* Find records sorted chronologically */
                const keys = Object.keys(dbRecord.records).sort((a, b) => {
                    const [ay, am] = a.split('.').map(Number);
                    const [by, bm] = b.split('.').map(Number);
                    return (ay * 12 + am) - (by * 12 + bm);
                });

                /* Current age key from squad page */
                const curAgeKey = `${p.ageYears}.${p.ageMonths}`;

                /* Capture current week's existing DB record (if player page was visited this week) */
                const curDbRec = dbRecord.records[curAgeKey];
                if (curDbRec && curDbRec.skills && curDbRec.skills.length === N) {
                    curDbSkillsFull = curDbRec.skills.map(v => {
                        const n = typeof v === 'string' ? parseFloat(v) : v;
                        return n >= 20 ? 20 : n;
                    });
                }

                /* Use PREVIOUS week for comparison:
                   - If latest key == current age → that's THIS week, use second-to-last
                   - If latest key != current age → latest IS the previous week */
                let prevIdx = keys.length - 1;
                if (keys.length > 1 && keys[prevIdx] === curAgeKey) {
                    prevIdx = keys.length - 2;
                }

                if (prevIdx >= 0) {
                    prevAgeKey = keys[prevIdx];
                    const prevRec = dbRecord.records[prevAgeKey];
                    if (prevRec && prevRec.skills && prevRec.skills.length === N) {
                        prevSkillsFull = prevRec.skills.map(v => {
                            const n = typeof v === 'string' ? parseFloat(v) : v;
                            return n >= 20 ? 20 : n;
                        });
                        prevDecimals = prevSkillsFull.map(v => v >= 20 ? 0 : v - Math.floor(v));
                    }
                }
            }

            /* ── Compute ASI remainder ── */
            const asiTotalPts = asi > 0 ? totalPts(asi, isGK) : 0;
            const intSum = intSkills.reduce((s, v) => s + v, 0);
            const asiRemainder = asi > 0 ? Math.round((asiTotalPts - intSum) * 100) / 100 : 0;

            /* ── Build improvement map (index → type) ── */
            const improvementMap = {};
            p.improved.forEach(imp => {
                improvementMap[imp.index] = imp.type;
            });

            /* ── Distribute TI gain across improved skills ── */
            const totalGain = p.TI / 10;  // total skill points this week

            let newDecimals;

            if (prevDecimals && asi > 0) {
                /* === We have previous data — smart distribution === */
                newDecimals = [...prevDecimals];

                /* Step 1: Calculate raw gains per improved skill using eff() weights */
                const improvedIndices = p.improved.map(imp => imp.index);
                if (improvedIndices.length > 0 && totalGain > 0) {
                    /* Compute eff-weighted shares for improved skills only */
                    const effWeights = improvedIndices.map(i => eff(intSkills[i]));
                    const effTotal = effWeights.reduce((a, b) => a + b, 0);
                    const shares = effTotal > 0
                        ? effWeights.map(w => w / effTotal)
                        : effWeights.map(() => 1 / improvedIndices.length);

                    /* Distribute gain */
                    improvedIndices.forEach((idx, j) => {
                        newDecimals[idx] += totalGain * shares[j];
                    });
                }

                /* Step 2: Handle one_up → snap to .00 */
                for (const imp of p.improved) {
                    if (imp.type === 'one_up') {
                        newDecimals[imp.index] = 0.00;
                    }
                }

                /* Step 3: Handle part_up cap → if decimal ≥ 1.0, cap at .99, send overflow to pool */
                let overflow = 0;
                let passes = 0;
                do {
                    overflow = 0;
                    let freeCount = 0;
                    for (let i = 0; i < N; i++) {
                        if (intSkills[i] >= 20) { newDecimals[i] = 0; continue; }
                        if (newDecimals[i] >= 1.0) {
                            overflow += newDecimals[i] - 0.99;
                            newDecimals[i] = 0.99;
                        } else if (newDecimals[i] < 0.99) {
                            freeCount++;
                        }
                    }
                    if (overflow > 0.0001 && freeCount > 0) {
                        const add = overflow / freeCount;
                        for (let i = 0; i < N; i++) {
                            if (intSkills[i] < 20 && newDecimals[i] < 0.99) {
                                newDecimals[i] += add;
                            }
                        }
                    }
                } while (overflow > 0.0001 && ++passes < 20);

                /* Step 4: Also check subtle skills — they must NOT have crossed an integer boundary.
                   A subtle skill at previous 16.98 that got redistributed overflow to 17.01 is impossible
                   (it would show as one_up if it crossed). Cap and re-distribute. */
                let subtleOverflow = 0;
                passes = 0;
                do {
                    subtleOverflow = 0;
                    let freeCount2 = 0;
                    for (let i = 0; i < N; i++) {
                        if (intSkills[i] >= 20) continue;
                        const prevInt = prevSkillsFull ? Math.floor(prevSkillsFull[i]) : intSkills[i];
                        const curInt = intSkills[i];
                        if (!improvementMap[i] && curInt === prevInt) {
                            /* Subtle: decimal must stay < 1.0 (same integer) */
                            if (newDecimals[i] >= 1.0) {
                                subtleOverflow += newDecimals[i] - 0.99;
                                newDecimals[i] = 0.99;
                            }
                        }
                    }
                    if (subtleOverflow > 0.0001) {
                        let freeSlots = 0;
                        for (let i = 0; i < N; i++) {
                            if (intSkills[i] < 20 && newDecimals[i] < 0.99) freeSlots++;
                        }
                        if (freeSlots > 0) {
                            const add2 = subtleOverflow / freeSlots;
                            for (let i = 0; i < N; i++) {
                                if (intSkills[i] < 20 && newDecimals[i] < 0.99) {
                                    newDecimals[i] += add2;
                                }
                            }
                        }
                    }
                } while (subtleOverflow > 0.0001 && ++passes < 20);

                /* Step 5: Normalize so Σ decimals = ASI remainder */
                const decSum = newDecimals.reduce((a, b) => a + b, 0);
                if (decSum > 0.001 && asiRemainder > 0) {
                    const scale = asiRemainder / decSum;
                    newDecimals = newDecimals.map((d, i) => intSkills[i] >= 20 ? 0 : d * scale);
                } else if (asiRemainder > 0) {
                    /* All decimals near zero — seed evenly */
                    const nonMax = intSkills.filter(v => v < 20).length;
                    newDecimals = intSkills.map(v => v >= 20 ? 0 : asiRemainder / nonMax);
                }

                /* Step 6: Final cap pass (normalization could push above .99 again) */
                passes = 0;
                do {
                    overflow = 0;
                    let freeCount = 0;
                    for (let i = 0; i < N; i++) {
                        if (intSkills[i] >= 20) { newDecimals[i] = 0; continue; }
                        if (newDecimals[i] > 0.99) { overflow += newDecimals[i] - 0.99; newDecimals[i] = 0.99; }
                        else if (newDecimals[i] < 0) { newDecimals[i] = 0; }
                        else if (newDecimals[i] < 0.99) freeCount++;
                    }
                    if (overflow > 0.0001 && freeCount > 0) {
                        const add = overflow / freeCount;
                        for (let i = 0; i < N; i++) {
                            if (intSkills[i] < 20 && newDecimals[i] < 0.99) newDecimals[i] += add;
                        }
                    }
                } while (overflow > 0.0001 && ++passes < 20);
            } else if (asi > 0) {
                /* === No previous data — seed from ASI remainder evenly === */
                const nonMax = intSkills.filter(v => v < 20).length;
                newDecimals = intSkills.map(v => v >= 20 ? 0 : (nonMax > 0 ? asiRemainder / nonMax : 0));
            } else {
                /* No ASI available — can't compute */
                newDecimals = new Array(N).fill(0);
            }

            /* ── Build full skill values ── */
            const newSkillsFull = intSkills.map((v, i) => v >= 20 ? 20 : v + (newDecimals[i] || 0));

            /* ── Compute diff: New vs DB (current week record) ── */
            const diffSkills = curDbSkillsFull
                ? newSkillsFull.map((v, i) => v - curDbSkillsFull[i])
                : null;

            /* ── Compute R5 and REC for ALL positions, keep best ── */
            const allPositions = favpos.split(',').map(s => s.trim()).filter(Boolean);
            let R5 = null, REC = null, R5_DB = null;
            let bestPos = allPositions[0] || '';
            const r5ByPos = {};

            if (asi > 0) {
                let bestR5 = -Infinity;
                for (const pos of allPositions) {
                    const pIdx = pos.toLowerCase() === 'gk' ? 9 : getPositionIndex(pos);
                    const r5val = Number(calculateR5F(pIdx, newSkillsFull, asi, routine));
                    const recval = Number(calculateRemaindersF(pIdx, newSkillsFull, asi).rec);
                    r5ByPos[pos] = { R5: r5val, REC: recval };
                    if (r5val > bestR5) {
                        bestR5 = r5val;
                        R5 = r5val;
                        REC = recval;
                        bestPos = pos;
                    }
                }
                if (curDbSkillsFull) {
                    const bestPosIdx = bestPos.toLowerCase() === 'gk' ? 9 : getPositionIndex(bestPos);
                    R5_DB = Number(calculateR5F(bestPosIdx, curDbSkillsFull, asi, routine));
                }
            }

            /* ── Store result ── */
            results.push({
                pid: p.pid,
                name: p.name,
                number: p.number,
                ageYears: p.ageYears,
                ageMonths: p.ageMonths,
                position: favpos,
                isGK,
                asi,
                routine,
                TI: p.TI,
                TI_change: p.TI_change,
                intSkills,
                newDecimals,
                newSkillsFull,
                prevSkillsFull,
                curDbSkillsFull,
                diffSkills,
                improved: p.improved,
                R5,
                R5_DB,
                REC,
                r5ByPos,
                bestPos,
                asiRemainder,
                hadPrevData: !!prevDecimals
            });
        }

        /* ═══ Console output — one table per player ═══ */
        console.log(`%c[Squad] ═══ Processed ${results.length} players ═══`, 'font-weight:bold;color:#6cc040');

        const fv = (v) => v >= 20 ? '★' : v.toFixed(2);

        for (const r of results) {
            const SHORT = r.isGK ? SKILL_NAMES_GK_SHORT : SKILL_NAMES_OUT_SHORT;
            const FULL  = r.isGK ? SKILL_NAMES_GK_FULL  : SKILL_NAMES_OUT_FULL;
            const N = r.isGK ? 11 : 14;

            const rows = [];
            for (let i = 0; i < N; i++) {
                const imp = r.improved.find(x => x.index === i);
                const marker = imp ? (imp.type === 'one_up' ? '⬆+1' : '↑') : '';
                const db   = r.curDbSkillsFull ? fv(r.curDbSkillsFull[i]) : '-';
                const curr = fv(r.newSkillsFull[i]);
                const diff = r.diffSkills
                    ? (Math.abs(r.diffSkills[i]) < 0.005 ? '' : (r.diffSkills[i] >= 0 ? '+' : '') + r.diffSkills[i].toFixed(2))
                    : '';
                rows.push({
                    Skill: SHORT[i],
                    DB: db,
                    New: curr,
                    Diff: diff,
                    Train: marker
                });
            }

            /* Totals row */
            const totalNew = r.newSkillsFull.reduce((s, v) => s + v, 0);
            const totalDb   = r.curDbSkillsFull ? r.curDbSkillsFull.reduce((s, v) => s + v, 0) : null;
            rows.push({
                Skill: 'TOTAL',
                DB: totalDb != null ? totalDb.toFixed(2) : '-',
                New: totalNew.toFixed(2),
                Diff: totalDb != null ? ((totalNew - totalDb) >= 0 ? '+' : '') + (totalNew - totalDb).toFixed(2) : '',
                Train: ''
            });

            const posR5Str = Object.entries(r.r5ByPos).map(([pos, v]) =>
                `${pos}:${v.R5.toFixed(1)}`).join(' ');
            console.log(
                `%c── ${r.name} (#${r.number}) ── Age:${r.ageYears}.${String(r.ageMonths).padStart(2,'0')} | ${r.position} | ASI:${r.asi} | Rtn:${r.routine} | TI:${r.TI}(${r.TI_change>=0?'+':''}${r.TI_change}) | Best:${r.bestPos} R5_DB:${r.R5_DB!=null?r.R5_DB.toFixed(2):'?'} R5_New:${r.R5!=null?r.R5.toFixed(2):'?'} | R5[${posR5Str}] | REC:${r.REC!=null?r.REC.toFixed(2):'?'} | Rem:${r.asiRemainder.toFixed(2)} | DB:${r.curDbSkillsFull?'✓':'✗'}`,
                'font-weight:bold;color:#fbbf24'
            );
            console.table(rows);
        }

        /* ═══ Sync results to IndexedDB ═══ */
        loader.update(0, results.length, 'Syncing to DB...');
        const bar = document.getElementById('tmrc-loader-bar');
        if (bar) bar.style.width = '0%';

        let syncCount = 0;
        for (const r of results) {
            if (r.asi <= 0) { syncCount++; continue; }

            const ageKey = `${r.ageYears}.${r.ageMonths}`;
            let store = PlayerDB.get(r.pid);
            if (!store || !store._v) store = { _v: 1, lastSeen: Date.now(), records: {} };

            store.records[ageKey] = {
                SI: r.asi,
                REREC: r.REC,
                R5: r.R5,
                skills: r.newSkillsFull.map(v => Math.round(v * 100) / 100),
                routine: r.routine,
                locked: true
            };
            store.lastSeen = Date.now();
            if (!store.meta) {
                store.meta = { name: r.name, pos: r.position, isGK: r.isGK };
            }

            await PlayerDB.set(r.pid, store);
            syncCount++;

            const pct = Math.round((syncCount / results.length) * 100);
            if (bar) bar.style.width = pct + '%';
            const txt = document.getElementById('tmrc-loader-text');
            if (txt) txt.textContent = `Syncing ${syncCount}/${results.length} — ${r.name}`;
        }

        console.log(`%c[Squad] ✓ Synced ${syncCount} players to IndexedDB`, 'font-weight:bold;color:#6cc040');
        loader.done(syncCount);

        return results;
    };

    /* ═══════════════════════════════════════════════════════════
       SHARED STATE (tooltip-derived)
       ═══════════════════════════════════════════════════════════ */
    let isGoalkeeper = false;
    let playerRecSort = null;
    let playerRoutine = null;
    let playerAge = null;
    let playerASI = null;
    let playerMonths = null;
    let playerTI = null;
    let playerPosition = null;
    let playerSkillSums = null;
    let tooltipSkills = null;
    let tooltipPlayer = null;

    /* Check if player belongs to the logged-in user's club */
    const getOwnClubIds = () => {
        const s = window.SESSION;
        if (!s) return [];
        const ids = [];
        if (s.main_id) ids.push(String(s.main_id));
        if (s.b_team) ids.push(String(s.b_team));
        return ids;
    };

    /* ── per-tab cache ── */
    const dataLoaded = {};          // key → bool
    let activeMainTab = null;
    let cssInjected = false;

    /* ═══════════════════════════════════════════════════════════
       CSS — Tab bar + History + Scout + Graphs
       (Training CSS lives inside Shadow DOM)
       ═══════════════════════════════════════════════════════════ */
    const CSS = `
/* ── Layout widths ── */
.main_center { width: 1200px !important; }
.column1 { width: 300px !important; margin-right: 8px !important; margin-left: 4px !important; }
.column2_a { width: 550px !important; margin-left: 0 !important; margin-right: 8px !important; }
.column3_a { margin-left: 0 !important; margin-right: 4px !important; }

/* ── Hide native TM tabs ── */
.tabs_outer { display: none !important; }
.tabs_content { display: none !important; }

/* ═══════════════════════════════════════
   SKILLS GRID (tmps-*)
   ═══════════════════════════════════════ */
.tmps-wrap {
    background: #1c3410; border: 1px solid #3d6828; border-radius: 8px;
    overflow: hidden; padding: 0; margin-bottom: 4px;
}
.tmps-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 0;
}
.tmps-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 6px 14px; border-bottom: 1px solid rgba(42,74,28,.35);
}
.tmps-row:last-child { border-bottom: none; }
.tmps-row:hover { background: rgba(255,255,255,.03); }
.tmps-name {
    color: #6a9a58; font-size: 11px; font-weight: 600;
}
.tmps-val {
    font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums;
}
.tmps-star { font-size: 15px; line-height: 1; }
.tmps-dec  { font-size: 9px; opacity: .75; vertical-align: super; letter-spacing: 0; }
.tmps-divider {
    grid-column: 1 / -1; height: 1px; background: #3d6828; margin: 0;
}
.tmps-hidden {
    display: grid; grid-template-columns: 1fr 1fr; gap: 0;
}
.tmps-hidden .tmps-row {
    padding: 5px 14px;
}
.tmps-hidden .tmps-name { color: #5a7a48; font-size: 10px; }
.tmps-hidden .tmps-val { font-size: 11px; color: #6a9a58; }
.tmps-unlock {
    grid-column: 1 / -1; text-align: center; padding: 10px 14px;
}
.tmps-unlock-btn {
    display: inline-block; padding: 5px 16px;
    background: rgba(42,74,28,.4); border: 1px solid #2a4a1c; border-radius: 6px;
    color: #8aac72; font-size: 11px; font-weight: 600; cursor: pointer;
    transition: all 0.15s; font-family: inherit;
}
.tmps-unlock-btn:hover { background: rgba(42,74,28,.7); color: #c8e0b4; }
.tmps-unlock-btn img { height: 12px; vertical-align: middle; margin-left: 4px; position: relative; top: -1px; }

/* ═══════════════════════════════════════
   PLAYER CARD (tmpc-*)
   ═══════════════════════════════════════ */
.tmpc-card {
    background: #1c3410; border: 1px solid #3d6828; border-radius: 8px;
    overflow: hidden; margin-bottom: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.tmpc-header {
    display: flex; gap: 16px; padding: 14px; align-items: flex-start;
}
.tmpc-photo {
    width: 110px; min-width: 110px; border-radius: 6px;
    border: 3px solid #3d6828; display: block;
}
.tmpc-info { flex: 1; min-width: 0; }
.tmpc-top-grid {
    display: grid; grid-template-columns: 1fr auto;
    gap: 2px 8px; align-items: center; margin-bottom: 10px;
}
.tmpc-name {
    font-size: 16px; font-weight: 800; color: #e8f5d8;
    line-height: 1.2;
}
.tmpc-badge-chip {
    font-size: 12px; font-weight: 800; letter-spacing: -0.3px;
    line-height: 16px;
    font-variant-numeric: tabular-nums;
    display: inline-flex; align-items: baseline; gap: 4px;
    padding: 1px 8px; border-radius: 4px;
    background: rgba(232,245,216,0.08); border: 1px solid rgba(232,245,216,0.15);
    justify-self: end;
}
.tmpc-badge-lbl {
    color: #6a9a58; font-size: 9px; font-weight: 600;
    text-transform: uppercase;
}
.tmpc-pos-row {
    display: flex; align-items: center; gap: 6px;
    flex-wrap: wrap;
}
.tmpc-pos {
    display: inline-block; padding: 1px 6px; border-radius: 4px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.3px;
    line-height: 16px; text-align: center; min-width: 28px;
}
.tmpc-details {
    display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px;
}
.tmpc-detail {
    display: flex; justify-content: space-between; align-items: center;
    padding: 3px 0;
}
.tmpc-lbl {
    color: #6a9a58; font-size: 10px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.3px;
}
.tmpc-val {
    color: #c8e0b4; font-size: 12px; font-weight: 700;
    font-variant-numeric: tabular-nums;
}
.tmpc-pos-ratings {
    border-top: 1px solid #3d6828; padding: 6px 14px;
}
.tmpc-rating-row {
    display: flex; align-items: center; gap: 10px;
    padding: 5px 0;
}
.tmpc-rating-row + .tmpc-rating-row { border-top: 1px solid rgba(61,104,40,.2); }
.tmpc-pos-bar {
    width: 4px; height: 22px; border-radius: 2px; flex-shrink: 0;
}
.tmpc-pos-name {
    font-size: 11px; font-weight: 700; min-width: 32px;
    letter-spacing: 0.3px;
}
.tmpc-pos-stat {
    display: flex; align-items: baseline; gap: 4px; margin-left: auto;
}
.tmpc-pos-stat + .tmpc-pos-stat { margin-left: 16px; }
.tmpc-pos-stat-lbl {
    color: #6a9a58; font-size: 9px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.3px;
}
.tmpc-pos-stat-val {
    font-size: 14px; font-weight: 800; letter-spacing: -0.3px;
    font-variant-numeric: tabular-nums;
}
.tmpc-expand-toggle {
    display: flex; align-items: center; justify-content: center;
    gap: 6px; padding: 4px 0; cursor: pointer;
    border-top: 1px solid rgba(61,104,40,.25);
    color: #6a9a58; font-size: 10px; font-weight: 600;
    letter-spacing: 0.4px; text-transform: uppercase;
    transition: color .15s;
}
.tmpc-expand-toggle:hover { color: #80e048; }
.tmpc-expand-chevron {
    display: inline-block; font-size: 10px; transition: transform .2s;
}
.tmpc-expand-toggle.tmpc-expanded .tmpc-expand-chevron { transform: rotate(180deg); }
.tmpc-all-positions {
    max-height: 0; overflow: hidden; transition: max-height .3s ease;
}
.tmpc-all-positions.tmpc-expanded {
    max-height: 600px;
}
.tmpc-all-positions .tmpc-rating-row.tmpc-is-player-pos {
    background: rgba(61,104,40,.15);
}
.tmpc-rec-stars { font-size: 14px; letter-spacing: 1px; margin-top: 2px; line-height: 1; }
.tmpc-star-full { color: #fbbf24; }
.tmpc-star-half {
    background: linear-gradient(90deg, #fbbf24 50%, #3d6828 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmpc-star-empty { color: #3d6828; }
.tmpc-flag { vertical-align: middle; margin-left: 4px; }
.tmpc-nt {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 9px; font-weight: 700; color: #fbbf24;
    background: rgba(251,191,36,.12); border: 1px solid rgba(251,191,36,.25);
    padding: 1px 6px; border-radius: 4px; margin-left: 6px;
    vertical-align: middle; letter-spacing: 0.3px; line-height: 14px;
}

/* ── Column1 Nav (tmcn-*) ── */
.tmcn-nav {
    background: #1c3410; border: 1px solid #3d6828; border-radius: 8px;
    overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin-bottom: 10px;
}
.tmcn-nav a {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; color: #90b878; font-size: 12px; font-weight: 600;
    text-decoration: none; border-bottom: 1px solid rgba(42,74,28,.5);
    transition: all 0.15s;
}
.tmcn-nav a:last-child { border-bottom: none; }
.tmcn-nav a:hover { background: rgba(42,74,28,.4); color: #e8f5d8; }
.tmcn-nav a .tmcn-icon { font-size: 14px; width: 20px; text-align: center; flex-shrink: 0; }
.tmcn-nav a .tmcn-lbl { flex: 1; }
.column1 > .box { display: none !important; }

/* ── Strip TM box chrome in column2_a ── */
.column2_a > .box,
.column2_a > .box > .box_body { background: none !important; border: none !important; padding: 0 !important; box-shadow: none !important; }
.column2_a > .box > .box_head,
.column2_a .box_shadow,
.column2_a .box_footer,
.column2_a > h3 { display: none !important; }

/* ── Sidebar (column3_a) ── */
.tmps-sidebar {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.tmps-section {
    background: #1c3410; border: 1px solid #3d6828; border-radius: 8px;
    overflow: hidden; margin-bottom: 8px;
}
.tmps-section-head {
    font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.5px;
    padding: 8px 12px 4px; border-bottom: 1px solid rgba(61,104,40,.3);
}
.tmps-btn-list {
    display: flex; flex-direction: column; gap: 2px; padding: 6px;
}
.tmps-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 10px; border-radius: 5px; cursor: pointer;
    background: transparent; border: none; width: 100%;
    font-size: 11px; font-weight: 600; color: #c8e0b4;
    font-family: inherit; text-align: left;
    transition: background 0.12s;
}
.tmps-btn:hover { background: rgba(255,255,255,0.06); }
.tmps-btn-icon {
    width: 16px; height: 16px; display: flex; align-items: center;
    justify-content: center; font-size: 13px; flex-shrink: 0;
}
.tmps-btn.yellow { color: #fbbf24; }
.tmps-btn.red { color: #f87171; }
.tmps-btn.green { color: #4ade80; }
.tmps-btn.blue { color: #60a5fa; }
.tmps-btn.muted { color: #8aac72; }
.tmps-note {
    margin: 0 6px 6px; padding: 6px 10px; border-radius: 5px;
    background: rgba(42,74,28,0.5); border: 1px solid rgba(61,104,40,.3);
    font-size: 11px; color: #8aac72; line-height: 1.4;
}
.tmps-award-list {
    display: flex; flex-direction: column; gap: 0;
}
.tmps-award {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 12px;
}
.tmps-award + .tmps-award { border-top: 1px solid rgba(61,104,40,.2); }
.tmps-award-icon {
    width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
}
.tmps-award-icon.gold { background: rgba(212,175,55,0.15); }
.tmps-award-icon.silver { background: rgba(96,165,250,0.15); }
.tmps-award-body { flex: 1; min-width: 0; }
.tmps-award-title {
    font-size: 11px; font-weight: 700; color: #e8f5d8; line-height: 1.2;
}
.tmps-award-sub {
    font-size: 10px; color: #8aac72; line-height: 1.3; margin-top: 1px;
}
.tmps-award-sub a { color: #80e048; text-decoration: none; }
.tmps-award-sub a:hover { text-decoration: underline; }
.tmps-award-season {
    font-size: 11px; font-weight: 800; color: #fbbf24;
    flex-shrink: 0; font-variant-numeric: tabular-nums;
}

/* ── Transfer Live Card (tmtf-*) ── */
.tmtf-card {
    background: #1c3410; border: 1px solid #3d6828; border-radius: 8px;
    overflow: hidden; margin-bottom: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.tmtf-head {
    font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.5px;
    padding: 8px 12px 4px; border-bottom: 1px solid rgba(61,104,40,.3);
    display: flex; align-items: center; justify-content: space-between;
}
.tmtf-reload {
    background: none; border: none; color: #6a9a58; cursor: pointer;
    font-size: 13px; padding: 0 2px; line-height: 1;
    transition: color .15s;
}
.tmtf-reload:hover { color: #80e048; }
.tmtf-body { padding: 10px 12px; }
.tmtf-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 4px 0; font-size: 11px; color: #c8e0b4;
}
.tmtf-row + .tmtf-row { border-top: 1px solid rgba(61,104,40,.15); }
.tmtf-lbl { color: #6a9a58; font-weight: 600; font-size: 10px; text-transform: uppercase; }
.tmtf-val { font-weight: 700; font-variant-numeric: tabular-nums; }
.tmtf-val.expiry { color: #fbbf24; }
.tmtf-val.bid { color: #80e048; }
.tmtf-val.buyer { color: #60a5fa; }
.tmtf-val.agent { color: #c084fc; }
.tmtf-val.expired { color: #f87171; }
.tmtf-val.sold { color: #4ade80; }
.tmtf-bid-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    width: 100%; margin-top: 8px; padding: 8px 0;
    background: rgba(108,192,64,0.12); border: 1px solid rgba(108,192,64,0.3);
    border-radius: 6px; color: #80e048; font-size: 11px; font-weight: 700;
    cursor: pointer; transition: background .15s;
    font-family: inherit;
}
.tmtf-bid-btn:hover { background: rgba(108,192,64,0.22); }
.tmtf-spinner { display: inline-block; width: 10px; height: 10px; border: 2px solid #6a9a58; border-top-color: transparent; border-radius: 50%; animation: tmtf-spin 0.6s linear infinite; margin-left: 6px; vertical-align: middle; }
@keyframes tmtf-spin { to { transform: rotate(360deg); } }

/* ── ASI Calculator (tmac-*) ── */
.tmac-card {
    background: #1c3410; border: 1px solid #3d6828; border-radius: 8px;
    overflow: hidden; margin-bottom: 8px; padding: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.tmac-head {
    font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.5px;
    margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
}
.tmac-head::before { content: '📊'; font-size: 12px; }
.tmac-form { display: flex; flex-direction: column; gap: 8px; }
.tmac-field {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.tmac-label {
    font-size: 10px; font-weight: 600; color: #90b878;
    text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap;
}
.tmac-input {
    width: 70px; padding: 5px 8px; border-radius: 4px;
    background: rgba(0,0,0,.25); border: 1px solid rgba(42,74,28,.6);
    color: #e8f5d8; font-size: 12px; font-weight: 600;
    font-family: inherit; text-align: right; outline: none;
    transition: border-color 0.15s;
}
.tmac-input:focus { border-color: #6cc040; }
.tmac-input::placeholder { color: #5a7a48; }
.tmac-result {
    margin-top: 10px; padding: 8px 10px; border-radius: 5px;
    background: rgba(42,74,28,.3); border: 1px solid rgba(42,74,28,.5);
    display: none;
}
.tmac-result.show { display: block; }
.tmac-result-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 3px 0;
}
.tmac-result-row + .tmac-result-row { border-top: 1px solid rgba(42,74,28,.3); padding-top: 5px; margin-top: 2px; }
.tmac-result-lbl { font-size: 10px; font-weight: 600; color: #6a9a58; text-transform: uppercase; letter-spacing: 0.3px; }
.tmac-result-val { font-size: 13px; font-weight: 700; color: #e8f5d8; font-variant-numeric: tabular-nums; }
.tmac-diff { font-size: 10px; font-weight: 700; color: #6cc040; margin-left: 4px; }

/* ── Main Tab Bar ── */
#tmpe-container {
    margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.tmpe-tabs-bar {
    display: flex; background: #274a18;
    border: 1px solid #3d6828; border-bottom: none;
    border-radius: 8px 8px 0 0; overflow: hidden;
}
.tmpe-main-tab {
    flex: 1; padding: 8px 12px; text-align: center; font-size: 12px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.5px; color: #90b878; cursor: pointer;
    border: none; border-bottom: 2px solid transparent; transition: all 0.15s;
    background: transparent; font-family: inherit;
    -webkit-appearance: none; appearance: none;
    display: flex; align-items: center; justify-content: center; gap: 6px;
}
.tmpe-main-tab .tmpe-icon { font-size: 14px; line-height: 1; }
.tmpe-main-tab:hover { color: #c8e0b4; background: #305820; }
.tmpe-main-tab.active { color: #e8f5d8; border-bottom-color: #6cc040; background: #305820; }
.tmpe-panels {
    border: 1px solid #3d6828; border-top: none;
    border-radius: 0 0 8px 8px;
    padding: 0; min-height: 120px;
    background: #1c3410;
}
.tmpe-panel {
    animation: tmpe-fadeIn 0.25s ease-out;
    padding: 8px;
}
@keyframes tmpe-fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}
/* ── Loading spinner ── */
.tmpe-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 50px 20px; gap: 14px;
}
.tmpe-spinner {
    width: 28px; height: 28px; border: 3px solid #274a18;
    border-top-color: #6cc040; border-radius: 50%;
    animation: tmpe-spin 0.8s linear infinite;
}
@keyframes tmpe-spin { to { transform: rotate(360deg); } }
.tmpe-loading-text { color: #6a9a58; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; }

/* ═══════════════════════════════════════
   HISTORY (tmph-*)
   ═══════════════════════════════════════ */
#tmph-root {
    display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; line-height: 1.4;
}
.tmph-wrap {
    background: transparent; border-radius: 0; border: none; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; font-size: 13px;
}
.tmph-tabs { display: flex; gap: 6px; padding: 10px 14px 6px; flex-wrap: wrap; }
.tmph-tab {
    padding: 4px 12px; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.4px; color: #90b878; cursor: pointer;
    border-radius: 4px; background: rgba(42,74,28,.3); border: 1px solid rgba(42,74,28,.6);
    transition: all 0.15s; font-family: inherit; -webkit-appearance: none; appearance: none;
}
.tmph-tab:hover { color: #c8e0b4; background: rgba(42,74,28,.5); border-color: #3d6828; }
.tmph-tab.active { color: #e8f5d8; background: #305820; border-color: #3d6828; }
.tmph-body { padding: 6px 14px 16px; font-size: 13px; min-height: 120px; }
.tmph-tbl { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 4px; }
.tmph-tbl th {
    padding: 6px; font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #2a4a1c;
    text-align: left; white-space: nowrap;
}
.tmph-tbl th.c { text-align: center; }
.tmph-tbl th.r { text-align: right; }
.tmph-tbl td {
    padding: 5px 6px; border-bottom: 1px solid rgba(42,74,28,.4);
    color: #c8e0b4; font-variant-numeric: tabular-nums; vertical-align: middle;
}
.tmph-tbl td.c { text-align: center; }
.tmph-tbl td.r { text-align: right; }
.tmph-tbl tr:hover { background: rgba(255,255,255,.03); }
.tmph-tbl a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmph-tbl a:hover { color: #c8e0b4; text-decoration: underline; }
.tmph-tbl .tmph-tot td { border-top: 2px solid #3d6828; color: #e0f0cc; font-weight: 800; }
.tmph-transfer td {
    background: rgba(42,74,28,.2); color: #6a9a58; font-size: 10px;
    padding: 4px 6px; border-bottom: 1px solid rgba(42,74,28,.3);
}
.tmph-xfer { display: flex; align-items: center; justify-content: center; gap: 8px; }
.tmph-xfer-arrow { color: #5b9bff; font-size: 13px; line-height: 1; }
.tmph-xfer-label { color: #6a9a58; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-size: 9px; }
.tmph-xfer-sum {
    color: #fbbf24; font-weight: 700; font-size: 11px;
    background: rgba(251,191,36,.08); padding: 1px 8px; border-radius: 3px;
    border: 1px solid rgba(251,191,36,.2);
}
.tmph-div { white-space: nowrap; font-size: 11px; }
.tmph-club { display: flex; align-items: center; gap: 6px; white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
.tmph-r-good { color: #6cc040; }
.tmph-r-avg { color: #c8e0b4; }
.tmph-r-low { color: #f87171; }
.tmph-empty { text-align: center; color: #5a7a48; padding: 40px; font-size: 13px; font-style: italic; }

/* ═══════════════════════════════════════
   SCOUT (tmsc-*)
   ═══════════════════════════════════════ */
#tmsc-root {
    display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; line-height: 1.4;
}
.tmsc-wrap {
    background: transparent; border-radius: 0; border: none; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; font-size: 13px;
}
.tmsc-tabs { display: flex; gap: 6px; padding: 10px 14px 6px; flex-wrap: wrap; }
.tmsc-tab {
    padding: 4px 12px; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.4px; color: #90b878; cursor: pointer;
    border-radius: 4px; background: rgba(42,74,28,.3); border: 1px solid rgba(42,74,28,.6);
    transition: all 0.15s; font-family: inherit; -webkit-appearance: none; appearance: none;
}
.tmsc-tab:hover { color: #c8e0b4; background: rgba(42,74,28,.5); border-color: #3d6828; }
.tmsc-tab.active { color: #e8f5d8; background: #305820; border-color: #3d6828; }
.tmsc-body { padding: 6px 14px 16px; font-size: 13px; min-height: 120px; }
.tmsc-tbl { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 4px; }
.tmsc-tbl th {
    padding: 6px; font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #2a4a1c;
    text-align: left; white-space: nowrap;
}
.tmsc-tbl th.c { text-align: center; }
.tmsc-tbl td {
    padding: 5px 6px; border-bottom: 1px solid rgba(42,74,28,.4);
    color: #c8e0b4; font-variant-numeric: tabular-nums; vertical-align: middle;
}
.tmsc-tbl td.c { text-align: center; }
.tmsc-tbl tr:hover { background: rgba(255,255,255,.03); }
.tmsc-tbl a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmsc-tbl a:hover { color: #c8e0b4; text-decoration: underline; }
.tmsc-empty { text-align: center; color: #5a7a48; padding: 40px; font-size: 13px; font-style: italic; }
.tmsc-stars { font-size: 20px; letter-spacing: 2px; line-height: 1; }
.tmsc-star-full { color: #fbbf24; }
.tmsc-star-half {
    background: linear-gradient(90deg, #fbbf24 50%, #3d6828 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-star-empty { color: #3d6828; }
.tmsc-report { display: flex; flex-direction: column; gap: 14px; }
.tmsc-report-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding-bottom: 10px; border-bottom: 1px solid #2a4a1c;
}
.tmsc-report-scout { color: #e8f5d8; font-weight: 700; font-size: 14px; margin-bottom: 4px; }
.tmsc-report-date {
    color: #6a9a58; font-size: 11px; font-weight: 600;
    background: rgba(42,74,28,.4); padding: 3px 10px; border-radius: 4px; white-space: nowrap;
}
.tmsc-report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.tmsc-report-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 5px 10px; background: rgba(42,74,28,.25); border-radius: 4px;
    border: 1px solid rgba(42,74,28,.4);
}
.tmsc-report-label { color: #6a9a58; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
.tmsc-report-value { color: #e8f5d8; font-weight: 700; font-size: 12px; }
.tmsc-report-item.wide { grid-column: 1 / -1; }
.tmsc-section-title {
    color: #6a9a58; font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; padding-bottom: 6px; border-bottom: 1px solid #2a4a1c; margin-bottom: 8px;
}
.tmsc-bar-row { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
.tmsc-bar-label { color: #90b878; font-size: 11px; font-weight: 600; width: 100px; flex-shrink: 0; }
.tmsc-bar-track {
    flex: 1; height: 6px; background: #1a2e10; border-radius: 3px;
    overflow: hidden; max-width: 120px; position: relative;
}
.tmsc-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.tmsc-bar-fill-reach {
    position: absolute; top: 0; left: 0; height: 100%;
    border-radius: 3px; transition: width 0.3s;
}
.tmsc-bar-text { font-size: 11px; font-weight: 600; min-width: 60px; }
.tmsc-league-cell { white-space: nowrap; font-size: 11px; }
.tmsc-league-cell a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmsc-league-cell a:hover { color: #c8e0b4; text-decoration: underline; }
.tmsc-club-cell a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmsc-club-cell a:hover { color: #c8e0b4; text-decoration: underline; }
.tmsc-send-btn {
    background: rgba(42,74,28,.4); color: #8aac72;
    border: 1px solid #2a4a1c; border-radius: 6px;
    padding: 4px 14px; font-size: 10px; font-weight: 600; cursor: pointer;
    text-transform: uppercase; letter-spacing: 0.4px; transition: all 0.15s; font-family: inherit;
}
.tmsc-send-btn:hover { background: rgba(42,74,28,.7); color: #c8e0b4; }
.tmsc-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.tmsc-send-btn.tmsc-away {
    background: transparent; border-color: rgba(61,104,40,.4); color: #5a7a48; font-size: 9px;
}
.tmsc-online { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-left: 4px; vertical-align: middle; }
.tmsc-online.on { background: #6cc040; box-shadow: 0 0 4px rgba(108,192,64,.5); }
.tmsc-online.off { background: #3d3d3d; }
.tmsc-yd-badge {
    display: inline-block; background: #274a18; color: #6cc040; font-size: 9px;
    font-weight: 700; padding: 1px 6px; border-radius: 3px; border: 1px solid #3d6828;
    margin-left: 6px; letter-spacing: 0.5px; vertical-align: middle;
}
.tmsc-error {
    text-align: center; color: #f87171; padding: 10px; font-size: 12px; font-weight: 600;
    background: rgba(248,113,113,.06); border: 1px solid rgba(248,113,113,.15);
    border-radius: 4px; margin-bottom: 10px;
}
.tmsc-report-divider { border: none; border-top: 1px dashed #3d6828; margin: 16px 0; }
.tmsc-report-count {
    color: #6a9a58; font-size: 10px; text-align: center; padding: 4px 0;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
}
.tmsc-star-green { color: #6cc040; }
.tmsc-star-green-half {
    background: linear-gradient(90deg, #6cc040 50%, #3d6828 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-star-split {
    background: linear-gradient(90deg, #fbbf24 50%, #6cc040 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-conf {
    display: inline-block; font-size: 9px; font-weight: 700; padding: 1px 5px;
    border-radius: 3px; margin-left: 6px; letter-spacing: 0.3px;
    vertical-align: middle; white-space: nowrap;
}
.tmsc-best-wrap {
    background: rgba(42,74,28,.3); border: 1px solid #2a4a1c;
    border-radius: 6px; padding: 12px; margin-bottom: 6px;
}
.tmsc-best-title {
    color: #6cc040; font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
}
.tmsc-best-title::before { content: '★'; font-size: 13px; }

/* ═══════════════════════════════════════
   GRAPHS (tmg-*)
   ═══════════════════════════════════════ */
.tmg-chart-wrap {
    position: relative; background: rgba(0,0,0,0.18);
    border: 1px solid rgba(120,180,80,0.25); border-radius: 6px;
    padding: 6px 4px 4px; margin: 6px 0 10px;
}
.tmg-chart-title { font-size: 13px; font-weight: 700; color: #e8f5d8; padding: 2px 8px 4px; letter-spacing: 0.3px; }
.tmg-canvas { display: block; cursor: crosshair; }
.tmg-tooltip {
    position: absolute; background: rgba(0,0,0,0.88); color: #fff;
    padding: 5px 10px; border-radius: 4px; font-size: 11px; pointer-events: none;
    z-index: 1000; white-space: nowrap; display: none;
    border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
.tmg-legend {
    display: grid; grid-template-columns: 1fr 1fr; gap: 1px 12px;
    padding: 8px 12px 4px; max-width: 450px; margin: 0 auto;
}
.tmg-legend.tmg-legend-inline {
    grid-template-columns: repeat(3, auto); justify-content: center; gap: 1px 18px;
}
.tmg-legend-item {
    display: flex; align-items: center; gap: 3px; font-size: 11px;
    color: #ccc; cursor: pointer; user-select: none; padding: 1px 0;
}
.tmg-legend-item input[type="checkbox"] {
    appearance: none; -webkit-appearance: none; width: 13px; height: 13px; min-width: 13px;
    border: 1px solid rgba(255,255,255,0.25); border-radius: 2px; cursor: pointer; margin: 0;
}
.tmg-legend-dot { font-size: 9px; line-height: 1; }
.tmg-legend-toggle { display: flex; gap: 6px; justify-content: center; padding: 4px 0 6px; }
.tmg-export-btn {
    background: rgba(42,74,28,.5); color: #8aac72; border: 1px solid #3d6828;
    border-radius: 5px; padding: 2px 10px; font-size: 10px; cursor: pointer;
    font-family: inherit; letter-spacing: 0.3px;
}
.tmg-export-btn:hover { background: #305820; color: #c8e0b4; }
.tmg-btn {
    background: rgba(42,74,28,.4); color: #8aac72; border: 1px solid #2a4a1c;
    border-radius: 6px; padding: 4px 14px; font-size: 11px; cursor: pointer; font-family: inherit;
    font-weight: 600; transition: all 0.15s; text-transform: uppercase; letter-spacing: 0.4px;
}
.tmg-btn:hover { background: rgba(42,74,28,.7); color: #c8e0b4; }
.tmg-enable-card {
    background: rgba(0,0,0,0.18); border: 1px solid rgba(120,180,80,0.25);
    border-radius: 6px; padding: 14px 16px; margin: 6px 0 10px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.tmg-enable-title { font-size: 13px; font-weight: 700; color: #6a9a58; letter-spacing: 0.3px; }
.tmg-enable-desc { font-size: 11px; color: #5a7a48; margin-top: 2px; }
.tmg-enable-btn {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 6px 16px; background: rgba(42,74,28,.5); border: 1px solid #3d6828;
    border-radius: 6px; color: #80e048; font-size: 11px; font-weight: 700;
    cursor: pointer; transition: all 0.15s; font-family: inherit;
    text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap;
    -webkit-appearance: none; appearance: none;
}
.tmg-enable-btn:hover { background: #305820; color: #e8f5d8; border-color: #4a8030; }
.tmg-enable-btn .pro_icon { height: 12px; vertical-align: middle; position: relative; top: -1px; }
.tmg-enable-all {
    display: flex; justify-content: center; padding: 4px 0 8px;
}
.tmg-skill-arrow { font-size: 9px; margin-left: 1px; }

/* ═══════════════════════════════════════
   BEST ESTIMATE CARD (tmbe-*)
   ═══════════════════════════════════════ */
.tmbe-card {
    background: #1c3410; border: 1px solid #3d6828; border-radius: 8px;
    overflow: hidden; margin-bottom: 4px; padding: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.tmbe-title {
    color: #6a9a58; font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
}
.tmbe-title::before { content: '★'; font-size: 13px; color: #fbbf24; }
.tmbe-title-stars { font-size: 18px; letter-spacing: 1px; line-height: 1; margin-left: auto; }
.tmbe-grid {
    display: grid; grid-template-columns: 1fr; gap: 6px; margin-bottom: 14px;
}
.tmbe-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 6px 10px; background: rgba(42,74,28,.25); border-radius: 4px;
    border: 1px solid rgba(42,74,28,.4);
}
.tmbe-lbl { color: #6a9a58; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
.tmbe-val { color: #e8f5d8; font-weight: 700; font-size: 12px; }
.tmbe-divider {
    color: #6a9a58; font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; padding: 8px 0 2px; margin-top: 2px;
    border-top: 1px solid rgba(42,74,28,.5);
}
.tmbe-peak-item {
    flex-direction: column !important; align-items: stretch !important; gap: 6px; padding: 8px 10px !important;
}
.tmbe-peak-header {
    display: flex; justify-content: space-between; align-items: center;
}
.tmbe-peak-reach {
    font-size: 10px; font-weight: 700; line-height: 1;
    display: flex; align-items: center; gap: 12px;justify-content: space-between;
}
.tmbe-reach-item {
    display: flex; align-items: center; gap: 4px;
}
.tmbe-reach-tag {
    font-size: 8px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.3px; color: #5a7a48;
}
.tmbe-bar-row {
    display: flex; flex-direction: column; gap: 3px; padding: 6px 0;
    border-bottom: 1px solid rgba(42,74,28,.3);
}
.tmbe-bar-row:last-child { border-bottom: none; }
.tmbe-bar-header {
    display: flex; align-items: center; justify-content: space-between;
}
.tmbe-bar-label { color: #90b878; font-size: 11px; font-weight: 600; }
.tmbe-bar-right { display: flex; align-items: center; gap: 8px; }
.tmbe-bar-track {
    width: 100%; height: 6px; background: rgba(0,0,0,.3); border-radius: 3px;
    overflow: hidden; position: relative;
}
.tmbe-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.tmbe-bar-fill-reach {
    position: absolute; top: 0; left: 0; height: 100%;
    border-radius: 3px; transition: width 0.3s;
}
.tmbe-bar-val { font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; }
.tmbe-conf {
    display: inline-block; font-size: 9px; font-weight: 700; padding: 1px 5px;
    border-radius: 3px; margin-left: 6px; letter-spacing: 0.3px;
    vertical-align: middle; white-space: nowrap;
}
/* ═══════════════════════════════════════
   COMPARE MODAL (tmc-*)
   ═══════════════════════════════════════ */
.tmc-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 99999;
    display: flex; align-items: center; justify-content: center;
}
.tmc-modal {
    background: #1a3311; border: 1px solid #3d6828; border-radius: 10px;
    width: 500px; max-width: 96vw; max-height: 90vh; display: flex; flex-direction: column;
    box-shadow: 0 8px 40px rgba(0,0,0,0.7); overflow: hidden;
}
.tmc-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; background: #274a18; border-bottom: 1px solid #3d6828;
    font-weight: 700; color: #e8f5d8; font-size: 14px; flex-shrink: 0;
}
.tmc-close-btn { background: none; border: none; color: #90b878; cursor: pointer; font-size: 16px; padding: 0 4px; line-height: 1; }
.tmc-close-btn:hover { color: #e8f5d8; }
.tmc-modal-body { flex: 1; overflow-y: auto; padding: 12px 14px; min-height: 0; }
.tmc-input-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.tmc-input-icon { font-size: 14px; flex-shrink: 0; }
.tmc-input {
    flex: 1; background: rgba(0,0,0,0.3); border: 1px solid #3d6828; border-radius: 5px;
    color: #e8f5d8; padding: 6px 10px; font-size: 12px; font-family: inherit; outline: none;
}
.tmc-input:focus { border-color: #6cc040; }
.tmc-player-list { margin-top: 8px; max-height: 340px; overflow-y: auto; border: 1px solid rgba(61,104,40,0.4); border-radius: 6px; }
.tmc-player-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid rgba(61,104,40,0.25); transition: background 0.1s; }
.tmc-player-row:last-child { border-bottom: none; }
.tmc-player-row:hover { background: rgba(108,192,64,0.12); }
.tmc-row-name { flex: 1; color: #e8f5d8; font-size: 12px; font-weight: 600; }
.tmc-row-sub { font-size: 10px; color: #8aac72; }
.tmc-row-count { font-size: 10px; color: #5a7a48; font-weight: 700; }
.tmc-list-header { padding: 5px 12px 3px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #5a7a48; background: rgba(61,104,40,0.18); border-bottom: 1px solid rgba(61,104,40,0.25); }
.tmc-squad-badge { display: inline-block; font-size: 9px; font-weight: 700; line-height: 1; padding: 1px 4px; border-radius: 3px; background: #2d5a1a; color: #a8d888; margin-left: 4px; vertical-align: middle; }
.tmc-empty-list, .tmc-loading-msg { padding: 24px; text-align: center; color: #5a7a48; font-size: 12px; font-style: italic; }
.tmc-error-msg { padding: 24px; text-align: center; color: #f87171; font-size: 12px; }
.tmc-back-btn { background: rgba(42,74,28,.5); color: #8aac72; border: 1px solid #3d6828; border-radius: 5px; padding: 4px 12px; font-size: 11px; cursor: pointer; font-family: inherit; margin-bottom: 12px; display: block; }
.tmc-back-btn:hover { background: #305820; color: #c8e0b4; }
.tmc-compare-wrap { font-size: 12px; }
.tmc-compare-header { display: flex; align-items: center; gap: 0; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid rgba(61,104,40,0.4); }
.tmc-compare-col { flex: 1; text-align: center; }
.tmc-compare-vs { width: 32px; height: 32px; border-radius: 50%; background: rgba(61,104,40,0.4); color: #5a7a48; font-weight: 800; font-size: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tmc-player-name { color: #e8f5d8; font-weight: 700; font-size: 13px; }
.tmc-player-sub { color: #8aac72; font-size: 10px; margin-top: 2px; }
.tmc-section-title { font-size: 10px; font-weight: 700; color: #5a7a48; text-transform: uppercase; letter-spacing: 0.8px; margin: 12px 0 6px; padding-bottom: 3px; border-bottom: 1px solid rgba(61,104,40,0.3); }
.tmc-stat-grid { display: flex; gap: 6px; margin-bottom: 4px; }
.tmc-stat-card { flex: 1; background: rgba(42,74,28,0.35); border: 1px solid rgba(61,104,40,0.3); border-radius: 6px; padding: 8px 4px; text-align: center; }
.tmc-stat-card-label { font-size: 9px; font-weight: 700; color: #5a7a48; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; }
.tmc-stat-card-vals { display: flex; align-items: center; justify-content: center; gap: 6px; }
.tmc-stat-card-v { font-weight: 700; font-size: 14px; }
.tmc-stat-card-sep { color: #3d6828; font-size: 10px; }
.tmc-skill-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.tmc-skill-cell { display: flex; align-items: center; padding: 5px 8px; border-bottom: 1px solid rgba(61,104,40,0.15); gap: 6px; }
.tmc-skill-cell:nth-last-child(-n+2) { border-bottom: none; }
.tmc-skill-name { color: #8aac72; font-size: 11px; white-space: nowrap; flex: 1; }
.tmc-skill-vals { display: flex; align-items: baseline; gap: 1px; font-size: 12px; white-space: nowrap; }
.tmc-skill-v { font-weight: 400; font-size: 11px; }
.tmc-skill-v.win { font-weight: 800; font-size: 13px; }
.tmc-skill-sep { color: #3d6828; font-size: 10px; margin: 0 1px; }
`;

    const injectCSS = () => {
        if (cssInjected) return;
        const s = document.createElement('style');
        s.textContent = CSS;
        document.head.appendChild(s);
        cssInjected = true;
    };

    /* ═══════════════════════════════════════════════════════════
       COMPARE MODULE
       ═══════════════════════════════════════════════════════════ */
    const CompareMod = (() => {
        const NAMES_OUT = ['Strength', 'Stamina', 'Pace', 'Marking', 'Tackling', 'Workrate', 'Positioning', 'Passing', 'Crossing', 'Technique', 'Heading', 'Finishing', 'Longshots', 'Set Pieces'];
        const NAMES_GK = ['Strength', 'Stamina', 'Pace', 'Handling', 'One on ones', 'Reflexes', 'Aerial Ability', 'Jumping', 'Communication', 'Kicking', 'Throwing'];

        const fPos = p => p ? p.split(',').map(s => s.trim().toUpperCase()).join('/') : '–';
        const fAge = (y, m) => `${y}y ${m}m`;
        const fv = (v, d = 2) => v == null ? '–' : Number(v).toFixed(d);

        const latestKey = store => {
            const keys = Object.keys(store.records || {});
            if (!keys.length) return null;
            return keys.sort((a, b) => {
                const [ay, am] = a.split('.').map(Number), [by, bm] = b.split('.').map(Number);
                return (ay * 12 + am) - (by * 12 + bm);
            }).at(-1);
        };

        /* Extract integer skill array from tooltip-style skills [{name,value}] */
        const extractSkills = (skillsArr, isGK) => {
            if (!skillsArr || !skillsArr.length) return null;
            const names = isGK ? NAMES_GK : NAMES_OUT;
            const sv = (name) => {
                const sk = skillsArr.find(s => s.name === name);
                if (!sk) return 0;
                const v = sk.value;
                if (typeof v === 'string') {
                    if (v.includes('star_silver')) return 19;
                    if (v.includes('star')) return 20;
                    return parseInt(v) || 0;
                }
                return parseInt(v) || 0;
            };
            return names.map(sv);
        };

        /* Compute R5 & REC for first favposition */
        const computeR5REC = (favpos, skills, asi, routine) => {
            if (!skills || !skills.length || !asi) return { R5: null, REREC: null };
            const firstPos = (favpos || '').split(',')[0].trim();
            const posIdx = getPositionIndex(firstPos);
            const rou = routine || 0;
            const r5 = Number(calculateR5F(posIdx, skills, asi, rou));
            const rec = Number(calculateRemaindersF(posIdx, skills, asi).rec);
            return { R5: r5, REREC: rec };
        };

        const currentData = () => {
            const store = PlayerDB.get(PLAYER_ID);
            const lk = store ? latestKey(store) : null;
            const rec = lk && store ? store.records[lk] : null;
            let R5 = rec?.R5 ?? null;
            let REREC = rec?.REREC ?? null;
            let skills = rec?.skills ?? null;
            const asi = rec ? parseInt(rec.SI) || 0 : (playerASI || 0);
            /* Compute R5/REC from tooltip skills if store doesn't have them */
            if ((R5 == null || REREC == null) && tooltipSkills && asi > 0) {
                const intSkills = extractSkills(tooltipSkills, isGoalkeeper);
                if (intSkills && intSkills.some(s => s > 0)) {
                    const computed = computeR5REC(playerPosition, intSkills, asi, playerRoutine || 0);
                    if (R5 == null) R5 = computed.R5;
                    if (REREC == null) REREC = computed.REREC;
                    if (!skills) skills = intSkills;
                }
            }
            return {
                id: PLAYER_ID,
                name: store?.meta?.name || tooltipPlayer?.name || `Player #${PLAYER_ID}`,
                pos: fPos(store?.meta?.pos || playerPosition || ''),
                years: tooltipPlayer ? parseInt(tooltipPlayer.age) || 0 : null,
                months: tooltipPlayer ? parseInt(tooltipPlayer.months) || 0 : null,
                isGK: isGoalkeeper,
                SI: asi,
                R5,
                REREC,
                skills,
                records: store ? Object.keys(store.records || {}).length : 0
            };
        };

        const buildCompareHtml = (a, b) => {
            const skillNames = (a.isGK || b.isGK) ? NAMES_GK : NAMES_OUT;
            const clr = (av, bv) => {
                if (av == null || bv == null) return '#8aac72';
                if (av === bv) return '#ccc';
                return av > bv ? '#80e048' : '#f87171';
            };
            let h = `<div class="tmc-compare-wrap">`;
            h += `<div class="tmc-compare-header">
                <div class="tmc-compare-col">
                    <div class="tmc-player-name">${a.name}</div>
                    <div class="tmc-player-sub">${a.pos}${a.years != null ? ' · ' + fAge(a.years, a.months) : ''}</div>
                </div>
                <div class="tmc-compare-vs">VS</div>
                <div class="tmc-compare-col">
                    <div class="tmc-player-name">${b.name}</div>
                    <div class="tmc-player-sub">${b.pos}${b.years != null ? ' · ' + fAge(b.years, b.months) : ''}</div>
                </div>
            </div>`;
            h += `<div class="tmc-stat-grid">`;
            for (const [lbl, ak, bk, dec] of [['ASI', 'SI', 'SI', 0], ['R5', 'R5', 'R5', 2], ['REC', 'REREC', 'REREC', 2]]) {
                const av = a[ak], bv = b[bk];
                h += `<div class="tmc-stat-card">
                    <div class="tmc-stat-card-label">${lbl}</div>
                    <div class="tmc-stat-card-vals">
                        <span class="tmc-stat-card-v" style="color:${clr(av, bv)}">${fv(av, dec)}</span>
                        <span class="tmc-stat-card-sep">:</span>
                        <span class="tmc-stat-card-v" style="color:${clr(bv, av)}">${fv(bv, dec)}</span>
                    </div>
                </div>`;
            }
            h += `</div>`;
            if (a.skills || b.skills) {
                const clrA = '#6cc040', clrB = '#4a9fd6';
                h += `<div class="tmc-section-title">Skills <span style="font-weight:400;letter-spacing:0">(</span><span style="color:${clrA};font-weight:400;letter-spacing:0">${a.name.split(' ').pop()}</span> <span style="font-weight:400;letter-spacing:0">vs</span> <span style="color:${clrB};font-weight:400;letter-spacing:0">${b.name.split(' ').pop()}</span><span style="font-weight:400;letter-spacing:0">)</span></div><div class="tmc-skill-grid">`;
                const half = Math.ceil(skillNames.length / 2);
                const fmtVal = (v, isWin, clr) => {
                    if (v == null) return `<span class="tmc-skill-v" style="color:#555">–</span>`;
                    const fl = Math.floor(v);
                    if (fl >= 20) return `<span class="tmc-skill-v${isWin ? ' win' : ''}" style="color:gold">★</span>`;
                    if (fl >= 19) return `<span class="tmc-skill-v${isWin ? ' win' : ''}" style="color:silver">★</span>`;
                    return `<span class="tmc-skill-v${isWin ? ' win' : ''}" style="color:${clr}">${fl}</span>`;
                };
                for (let r = 0; r < half; r++) {
                    for (const ci of [r, r + half]) {
                        if (ci >= skillNames.length) { h += `<div class="tmc-skill-cell"></div>`; continue; }
                        const name = skillNames[ci];
                        const av = a.skills?.[ci] ?? null, bv = b.skills?.[ci] ?? null;
                        const aWin = av != null && bv != null && av > bv;
                        const bWin = av != null && bv != null && bv > av;
                        h += `<div class="tmc-skill-cell">
                            <div class="tmc-skill-name">${name}</div>
                            <div class="tmc-skill-vals">${fmtVal(av, aWin, clrA)}<span class="tmc-skill-sep">/</span>${fmtVal(bv, bWin, clrB)}</div>
                        </div>`;
                    }
                }
                h += `</div>`;
            }
            h += `</div>`;
            return h;
        };

        let overlay = null;

        const showView = (html, backFn) => {
            const body = overlay.querySelector('.tmc-modal-body');
            body.innerHTML = `<button class="tmc-back-btn">← Back</button>${html}`;
            body.querySelector('.tmc-back-btn').addEventListener('click', backFn || renderSelection);
        };

        let squadCache = null; /* { list: [{pid, name, fp, team}], post: {pid: playerObj} } */

        const fetchSquad = (cb) => {
            if (squadCache) { cb(squadCache); return; }
            const s = window.SESSION;
            const mainId = s?.main_id ? String(s.main_id) : null;
            const bId    = s?.b_team  ? String(s.b_team)  : null;
            if (!mainId) { squadCache = { list: [], post: {} }; cb(squadCache); return; }
            const parse = (res, team) => {
                try {
                    const data = typeof res === 'object' ? res : JSON.parse(res);
                    const list = (data?.squad || []).map(p => ({
                        pid: String(p.player_id),
                        name: p.name || `#${p.player_id}`,
                        fp: p.fp || '',
                        team
                    }));
                    const post = {};
                    if (data?.post) { for (const [id, p] of Object.entries(data.post)) post[String(id)] = p; }
                    return { list, post };
                } catch(e) { return { list: [], post: {} }; }
            };
            $.post('/ajax/players_get_select.ajax.php', { type: 'change', club_id: mainId }, res => {
                const main = parse(res, 'A');
                if (!bId) { squadCache = main; cb(squadCache); return; }
                $.post('/ajax/players_get_select.ajax.php', { type: 'change', club_id: bId }, res2 => {
                    const b = parse(res2, 'B');
                    squadCache = { list: [...main.list, ...b.list], post: { ...main.post, ...b.post } };
                    cb(squadCache);
                }).fail(() => { squadCache = main; cb(squadCache); });
            }).fail(() => { squadCache = { list: [], post: {} }; cb(squadCache); });
        };

        const renderSelection = () => {
            const body = overlay.querySelector('.tmc-modal-body');
            body.innerHTML = `
                <div class="tmc-input-row"><span class="tmc-input-icon">🔗</span><input class="tmc-input" id="tmc-url-input" placeholder="Paste player URL (e.g. /players/12345678/)…"></div>
                <div class="tmc-input-row"><span class="tmc-input-icon">🔍</span><input class="tmc-input" id="tmc-search-input" placeholder="Search players…"></div>
                <div id="tmc-player-list" class="tmc-player-list"><div class="tmc-empty-list">Loading squad…</div></div>`;
            const urlIn = body.querySelector('#tmc-url-input');
            urlIn.addEventListener('input', () => {
                const m = urlIn.value.match(/\/players\/(\d+)/);
                if (m) { urlIn.style.borderColor = '#6cc040'; startCompare(m[1]); }
                else urlIn.style.borderColor = '';
            });
            body.querySelector('#tmc-search-input').addEventListener('input', e => renderList(e.target.value.toLowerCase()));
            fetchSquad(() => renderList(''));
        };

        const renderList = (filter) => {
            const list = overlay.querySelector('#tmc-player-list');
            if (!list) return;
            if (!squadCache || !squadCache.list.length) { list.innerHTML = '<div class="tmc-empty-list">No players found</div>'; return; }
            const rows = squadCache.list
                .filter(p => String(p.pid) !== String(PLAYER_ID) && (!filter || p.name.toLowerCase().includes(filter) || p.pid.includes(filter)))
                .map(p =>
                    `<div class="tmc-player-row" data-pid="${p.pid}">
                        <div><div class="tmc-row-name">${p.name}${p.team === 'B' ? ' <span class="tmc-squad-badge">B</span>' : ''}</div><div class="tmc-row-sub">${p.fp}</div></div>
                    </div>`
                );
            if (!rows.length) { list.innerHTML = '<div class="tmc-empty-list">No players found</div>'; return; }
            list.innerHTML = rows.join('');
            list.querySelectorAll('.tmc-player-row').forEach(row => row.addEventListener('click', () => startCompare(row.dataset.pid)));
        };

        const startCompare = (oppId) => {
            oppId = String(oppId);
            showView('<div class="tmc-loading-msg">⏳ Loading player data…</div>');
            const a = currentData();

            const buildOpp = (p, oppStore) => {
                const lk = oppStore ? latestKey(oppStore) : null;
                const rec = lk ? oppStore.records[lk] : null;
                const fp = p.favposition || '';
                const oppIsGK = fp.split(',')[0].trim().toLowerCase() === 'gk';
                const asi = rec ? parseInt(rec.SI) || 0 : (parseInt((p.asi || p.skill_index || '').toString().replace(/[^0-9]/g, '')) || 0);
                let R5 = rec?.R5 ?? null;
                let REREC = rec?.REREC ?? null;
                let skills = rec?.skills ?? null;
                /* Compute R5/REC from skills if store doesn't have them */
                if ((R5 == null || REREC == null) && p.skills && asi > 0) {
                    const intSkills = extractSkills(p.skills, oppIsGK);
                    if (intSkills && intSkills.some(s => s > 0)) {
                        const rou = rec?.routine || parseFloat(p.routine) || 0;
                        const computed = computeR5REC(fp, intSkills, asi, rou);
                        if (R5 == null) R5 = computed.R5;
                        if (REREC == null) REREC = computed.REREC;
                        if (!skills) skills = intSkills;
                    }
                }
                return {
                    id: oppId,
                    name: p.name || p.player_name || p.player_name_long || `Player #${oppId}`,
                    pos: p.fp ? p.fp : fPos(fp),
                    years: parseInt(p.age) || 0,
                    months: parseInt(p.months || p.month) || 0,
                    isGK: oppIsGK,
                    SI: asi,
                    R5,
                    REREC,
                    skills,
                    records: oppStore ? Object.keys(oppStore.records || {}).length : 0
                };
            };

            /* Priority 1: cached post data from squad endpoint (own team) */
            const cachedPost = squadCache?.post?.[oppId];
            if (cachedPost) {
                const oppStore = PlayerDB.get(oppId);
                showView(buildCompareHtml(a, buildOpp(cachedPost, oppStore)));
                return;
            }

            /* Priority 2: tooltip endpoint (external players) */
            $.post('/ajax/tooltip.ajax.php', { player_id: oppId }, res => {
                try {
                    const data = typeof res === 'object' ? res : JSON.parse(res);
                    const p = data?.player;
                    if (!p) { showView('<div class="tmc-error-msg">⚠ Player not found</div>'); return; }
                    const oppStore = PlayerDB.get(oppId);
                    showView(buildCompareHtml(a, buildOpp(p, oppStore)));
                } catch (e) { showView('<div class="tmc-error-msg">⚠ Failed to load data</div>'); }
            }).fail(() => showView('<div class="tmc-error-msg">⚠ Network error</div>'));
        };

        const openDialog = () => {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'tmc-overlay';
                overlay.innerHTML = `<div class="tmc-modal"><div class="tmc-modal-header"><span>⚖️ Compare Player</span><button class="tmc-close-btn">✕</button></div><div class="tmc-modal-body"></div></div>`;
                document.body.appendChild(overlay);
                overlay.querySelector('.tmc-close-btn').addEventListener('click', () => overlay.style.display = 'none');
                overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });
            }
            overlay.style.display = 'flex';
            renderSelection();
        };

        window.tmCompareOpen = openDialog;
        return { openDialog };
    })();

    /* ═══════════════════════════════════════════════════════════
       PARSE NATIONAL TEAM STATS (before DOM is modified)
       ═══════════════════════════════════════════════════════════ */
    let parsedNTData = null;
    const parseNTData = () => {
        const h3s = document.querySelectorAll('h3.dark');
        for (const h3 of h3s) {
            const txt = h3.textContent;
            if (!txt.includes('Called up for') && !txt.includes('Previously played for')) continue;
            const countryLink = h3.querySelector('a.country_link');
            const countryName = countryLink ? countryLink.textContent.trim() : '';
            const flagLinks = h3.querySelectorAll('.country_link');
            const flagEl = flagLinks.length > 1 ? flagLinks[flagLinks.length - 1] : flagLinks[0];
            const flagHtml = flagEl ? flagEl.outerHTML : '';
            const nextDiv = h3.nextElementSibling;
            const table = nextDiv && nextDiv.querySelector('table');
            if (!table) continue;
            const tds = table.querySelectorAll('tr:not(:first-child) td, tr.odd td');
            if (tds.length >= 6) {
                /* Hide TM's original NT section */
                h3.style.display = 'none';
                if (nextDiv) nextDiv.style.display = 'none';
                return {
                    country: countryName,
                    flagHtml: flagHtml,
                    matches: parseInt(tds[0].textContent) || 0,
                    goals: parseInt(tds[1].textContent) || 0,
                    assists: parseInt(tds[2].textContent) || 0,
                    cards: parseInt(tds[3].textContent) || 0,
                    rating: parseFloat(tds[4].textContent) || 0,
                    mom: parseInt(tds[5].textContent) || 0
                };
            }
        }
        return null;
    };

    /* ═══════════════════════════════════════════════════════════
       SHARED TOOLTIP FETCH
       ═══════════════════════════════════════════════════════════ */
    const fetchTooltip = () => {
        $.post('/ajax/tooltip.ajax.php', { player_id: PLAYER_ID }, (res) => {
            try {
                const data = typeof res === 'object' ? res : JSON.parse(res);
                if (!data || !data.player) return;
                const p = data.player;

                /* Retired / deleted player — club is null → clean up storage */
                if (p.club_id === null || data.club === null) {
                    if (PlayerDB.get(PLAYER_ID)) {
                        PlayerDB.remove(PLAYER_ID);
                        console.log(`%c[Cleanup] Removed retired/deleted player ${PLAYER_ID} from DB`, 'font-weight:bold;color:#f87171');
                    }
                    return;
                }
                const fp = p.favposition || '';
                isGoalkeeper = fp.split(',')[0].toLowerCase() === 'gk';
                if (p.rec_sort !== undefined) playerRecSort = parseFloat(p.rec_sort) || 0;
                if (p.skill_index !== undefined) playerASI = parseTooltipNumeric(p.skill_index) || playerASI;
                if (p.routine !== undefined) playerRoutine = parseFloat(p.routine) || 0;
                if (p.age !== undefined) {
                    playerAge = (parseInt(p.age) || 0) + (parseInt(p.months) || 0) / 12;
                    playerMonths = parseInt(p.months) || 0;
                }
                if (p.favposition !== undefined) playerPosition = p.favposition;
                tooltipPlayer = p;

                /* Migrate meta.pos if missing for existing store */
                try {
                    const existingStore = PlayerDB.get(PLAYER_ID);
                    if (existingStore && p.favposition) {
                        const fp = p.favposition || '';
                        const pGK = fp.split(',')[0].toLowerCase() === 'gk';
                        if (!existingStore.meta) {
                            existingStore.meta = { name: p.name || '', pos: fp, isGK: pGK };
                            PlayerDB.set(PLAYER_ID, existingStore);
                            console.log(`[TmPlayer] Migrated meta for player ${PLAYER_ID}: pos=${fp}`);
                        } else if (!existingStore.meta.pos) {
                            existingStore.meta.pos = fp;
                            existingStore.meta.isGK = pGK;
                            if (!existingStore.meta.name && p.name) existingStore.meta.name = p.name;
                            PlayerDB.set(PLAYER_ID, existingStore);
                            console.log(`[TmPlayer] Migrated meta.pos for player ${PLAYER_ID}: pos=${fp}`);
                        }
                    }
                } catch (e) { /* non-critical */ }

                if (p.skills) {
                    tooltipSkills = p.skills;
                    const sv = (name) => {
                        const sk = p.skills.find(s => s.name === name);
                        if (!sk) return 0;
                        const v = sk.value;
                        if (typeof v === 'string' && v.includes('star')) return v.includes('silver') ? 19 : 20;
                        return parseInt(v) || 0;
                    };
                    if (isGoalkeeper) {
                        playerSkillSums = {
                            phy: sv('Strength') + sv('Stamina') + sv('Pace') + sv('Jumping'),
                            tac: sv('One on ones') + sv('Aerial Ability') + sv('Communication'),
                            tec: sv('Handling') + sv('Reflexes') + sv('Kicking') + sv('Throwing')
                        };
                    } else {
                        playerSkillSums = {
                            phy: sv('Strength') + sv('Stamina') + sv('Pace') + sv('Heading'),
                            tac: sv('Marking') + sv('Tackling') + sv('Workrate') + sv('Positioning'),
                            tec: sv('Passing') + sv('Crossing') + sv('Technique') + sv('Finishing') + sv('Longshots') + sv('Set Pieces')
                        };
                    }
                }
                /* re-render scout if already shown */
                ScoutMod.reRender();
                /* parse NT data before buildPlayerCard modifies the DOM */
                parsedNTData = parseNTData();
                /* build player card after tooltip data arrives */
                buildPlayerCard();
                tryBuildSkills();
                /* build ASI calculator with defaults after TI is computed */
                buildASICalculator();
                /* re-render history if already loaded, so NT tab appears */
                if (parsedNTData && dataLoaded['history']) HistoryMod.reRender();
                /* fetch scout data for Best Estimate card */
                fetchBestEstimate();
                /* save current visit and then patch decimal values into already-rendered skill grid */
                if (p.age !== undefined && p.months !== undefined && p.skills) {
                    const _yr = parseInt(p.age);
                    const _mo = parseInt(p.months) || 0;
                    const _NAMES_OUT = ['Strength', 'Stamina', 'Pace', 'Marking', 'Tackling', 'Workrate', 'Positioning', 'Passing', 'Crossing', 'Technique', 'Heading', 'Finishing', 'Longshots', 'Set Pieces'];
                    const _NAMES_GK = ['Strength', 'Stamina', 'Pace', 'Handling', 'One on ones', 'Reflexes', 'Aerial Ability', 'Jumping', 'Communication', 'Kicking', 'Throwing'];
                    const _names = isGoalkeeper ? _NAMES_GK : _NAMES_OUT;
                    const _skillsArr = _names.map(name => {
                        const sk = p.skills.find(s => s.name === name);
                        if (!sk) return 0;
                        const v = sk.value;
                        if (typeof v === 'string' && v.includes('star')) return v.includes('silver') ? 19 : 20;
                        return parseInt(v) || 0;
                    });
                    setTimeout(() => syncFromGraphs(_yr, _mo, _skillsArr, playerASI, isGoalkeeper), 500);
                    setTimeout(() => {
                        /* Patch the already-rendered skill grid with decimal values */
                        const ageKey = `${_yr}.${_mo}`;
                        let skillsC = null;
                        try {
                            const store = PlayerDB.get(PLAYER_ID);
                            if (store && store._v >= 1 && store.records && store.records[ageKey])
                                skillsC = store.records[ageKey].skills;
                        } catch (e) { }
                        if (!skillsC) {
                            /* Fallback: compute from ASI */
                            if (playerASI && playerASI > 0) {
                                const w = isGoalkeeper ? 48717927500 : 263533760000;
                                const log27 = Math.log(Math.pow(2, 7));
                                const allSum = _skillsArr.reduce((s, v) => s + v, 0);
                                const rem = Math.round((Math.pow(2, Math.log(w * playerASI) / log27) - allSum) * 10) / 10;
                                const gs = _skillsArr.filter(v => v === 20).length;
                                const ns = _skillsArr.length - gs;
                                skillsC = _skillsArr.map(v => v === 20 ? 20 : v + (ns > 0 ? rem / ns : 0));
                            }
                        }
                        if (!skillsC) return;
                        const _NAMES = isGoalkeeper
                            ? ['Strength', 'Stamina', 'Pace', 'Handling', 'One on ones', 'Reflexes', 'Aerial Ability', 'Jumping', 'Communication', 'Kicking', 'Throwing']
                            : ['Strength', 'Stamina', 'Pace', 'Marking', 'Tackling', 'Workrate', 'Positioning', 'Passing', 'Crossing', 'Technique', 'Heading', 'Finishing', 'Longshots', 'Set Pieces'];
                        const decMap = {};
                        _NAMES.forEach((name, i) => { decMap[name] = skillsC[i]; });
                        const renderDec = (v) => {
                            const floor = Math.floor(v);
                            const frac = v - floor;
                            if (floor >= 20) return `<span class="tmps-star" style="color:gold">★</span>`;
                            if (floor >= 19) {
                                const fracStr = frac > 0.005 ? `<span class="tmps-dec">.${Math.round(frac * 100).toString().padStart(2, '0')}</span>` : '';
                                return `<span class="tmps-star" style="color:silver">★${fracStr}</span>`;
                            }
                            const dispVal = frac > 0.005 ? `${floor}<span class="tmps-dec">.${Math.round(frac * 100).toString().padStart(2, '0')}</span>` : floor;
                            return `<span style="color:${skillColor(floor)}">${dispVal}</span>`;
                        };
                        document.querySelectorAll('.tmps-grid .tmps-row').forEach(row => {
                            const nameEl = row.querySelector('.tmps-name');
                            const valEl = row.querySelector('.tmps-val');
                            if (!nameEl || !valEl) return;
                            const name = nameEl.textContent.trim();
                            if (decMap[name] !== undefined) valEl.innerHTML = renderDec(decMap[name]);
                        });
                    }, 600);
                }
            } catch (e) { /* ignore */ }
        });
    };

    /* ═══════════════════════════════════════════════════════════
       ███  MODULE: HISTORY
       ═══════════════════════════════════════════════════════════ */
    const HistoryMod = (() => {
        let historyData = null;
        let activeTab = 'nat';
        let root = null;

        const q = (sel) => root ? root.querySelector(sel) : null;
        const qa = (sel) => root ? root.querySelectorAll(sel) : [];

        const extractClubName = (html) => { if (!html) return '-'; const m = html.match(/>([^<]+)<\/a>/); return m ? m[1] : (html === '-' ? '-' : html.replace(/<[^>]+>/g, '').trim() || '-'); };
        const extractClubLink = (html) => { if (!html) return ''; const m = html.match(/href="([^"]+)"/); return m ? m[1] : ''; };
        const fixDivFlags = (s) => s ? s.replace(/class='flag-img-([^']+)'/g, "class='flag-img-$1 tmsq-flag'") : '';
        const ratingClass = (r) => { const v = parseFloat(r); if (isNaN(v) || v === 0) return 'tmph-r-avg'; if (v >= 6.0) return 'tmph-r-good'; if (v < 4.5) return 'tmph-r-low'; return 'tmph-r-avg'; };
        const calcRating = (rating, games) => { const r = parseFloat(rating), g = parseInt(games); if (!r || !g || g === 0) return '-'; return (r / g).toFixed(2); };
        const fmtNum = (n) => (n == null || n === '' || n === 0) ? '0' : Number(n).toLocaleString();

        const buildNTTable = (nt) => {
            if (!nt) return '<div class="tmph-empty">Not called up for any national team</div>';
            const avgR = nt.matches > 0 ? nt.rating.toFixed(1) : '-';
            const rc = ratingClass(avgR);
            return `<table class="tmph-tbl"><thead><tr><th>Country</th><th></th><th class="c">Gp</th><th class="c">${isGoalkeeper ? 'Con' : 'G'}</th><th class="c">A</th><th class="c">Cards</th><th class="c">Rating</th><th class="c" style="color:#e8a832">Mom</th></tr></thead>`
                + `<tbody><tr><td><div class="tmph-club">${nt.country}</div></td><td class="tmph-div">${nt.flagHtml}</td><td class="c">${nt.matches}</td><td class="c" style="color:#6cc040;font-weight:600">${nt.goals}</td><td class="c" style="color:#5b9bff">${nt.assists}</td><td class="c" style="color:#fbbf24">${nt.cards}</td><td class="c ${rc}" style="font-weight:700">${avgR}</td><td class="c" style="color:#e8a832;font-weight:700">${nt.mom}</td></tr></tbody></table>`;
        };

        const buildTable = (rows) => {
            if (!rows || !rows.length) return '<div class="tmph-empty">No history data available</div>';
            const totalRow = rows.find(r => r.season === 'total');
            const dataRows = rows.filter(r => r.season !== 'total');
            let tb = '';
            for (const row of dataRows) {
                if (row.season === 'transfer') {
                    tb += `<tr class="tmph-transfer"><td colspan="8"><div class="tmph-xfer"><span class="tmph-xfer-arrow">⇄</span><span class="tmph-xfer-label">Transfer</span><span class="tmph-xfer-sum">${row.transfer}</span></div></td></tr>`;
                    continue;
                }
                const cn = extractClubName(row.klubnavn), cl = extractClubLink(row.klubnavn);
                const cnH = cl ? `<a href="${cl}" target="_blank">${cn}</a>` : cn;
                const divH = fixDivFlags(row.division_string);
                const avgR = calcRating(row.rating, row.games);
                tb += `<tr><td class="c" style="font-weight:700;color:#e8f5d8">${row.season}</td><td><div class="tmph-club">${cnH}</div></td><td class="tmph-div">${divH}</td><td class="c">${row.games || 0}</td><td class="c" style="color:#6cc040;font-weight:600">${isGoalkeeper ? (row.conceded || 0) : (row.goals || 0)}</td><td class="c" style="color:#5b9bff">${row.assists || 0}</td><td class="c" style="color:#fbbf24">${row.cards || 0}</td><td class="r ${ratingClass(avgR)}" style="font-weight:700">${avgR}</td></tr>`;
            }
            if (totalRow) {
                const tr = calcRating(totalRow.rating, totalRow.games);
                tb += `<tr class="tmph-tot"><td class="c" colspan="2" style="font-weight:800">Career Total</td><td></td><td class="c">${fmtNum(totalRow.games)}</td><td class="c" style="color:#6cc040">${fmtNum(isGoalkeeper ? totalRow.conceded : totalRow.goals)}</td><td class="c" style="color:#5b9bff">${fmtNum(totalRow.assists)}</td><td class="c" style="color:#fbbf24">${fmtNum(totalRow.cards)}</td><td class="r" style="color:#e0f0cc">${tr}</td></tr>`;
            }
            return `<table class="tmph-tbl"><thead><tr><th class="c" style="width:36px">S</th><th>Club</th><th>Division</th><th class="c">Gp</th><th class="c">${isGoalkeeper ? 'Con' : 'G'}</th><th class="c">A</th><th class="c">Cards</th><th class="r">Rating</th></tr></thead><tbody>${tb}</tbody></table>`;
        };

        const render = (container, data) => {
            historyData = data.table;
            activeTab = 'nat';
            container.innerHTML = '';
            const wrapper = document.createElement('div');
            wrapper.id = 'tmph-root';
            container.appendChild(wrapper);
            root = wrapper;
            const TAB_LABELS = { nat: 'League', cup: 'Cup', int: 'International', total: 'Total' };
            if (parsedNTData) TAB_LABELS.nt = 'National Team';
            let tabsH = '';
            for (const [key, label] of Object.entries(TAB_LABELS)) {
                if (key === 'nt') {
                    tabsH += `<button class="tmph-tab ${key === activeTab ? 'active' : ''}" data-tab="${key}">${label}</button>`;
                } else {
                    const rows = historyData[key] || [];
                    tabsH += `<button class="tmph-tab ${key === activeTab ? 'active' : ''}" data-tab="${key}" ${!rows.length ? 'style="opacity:0.4"' : ''}>${label}</button>`;
                }
            }
            root.innerHTML = `<div class="tmph-wrap"><div class="tmph-tabs">${tabsH}</div><div class="tmph-body" id="tmph-tab-content">${buildTable(historyData[activeTab])}</div></div>`;
            qa('.tmph-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    const key = tab.dataset.tab;
                    if (key === 'nt') {
                        if (!parsedNTData) return;
                    } else {
                        if (!(historyData[key] || []).length) return;
                    }
                    activeTab = key;
                    qa('.tmph-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    const c = q('#tmph-tab-content');
                    if (c) c.innerHTML = key === 'nt' ? buildNTTable(parsedNTData) : buildTable(historyData[key]);
                });
            });
        };

        const reRender = () => {
            if (!root || !historyData) return;
            const panel = root.closest('.tmpe-panel') || root.parentNode;
            if (panel) render(panel, { table: historyData });
        };

        return { render, reRender };
    })();

    /* ═══════════════════════════════════════════════════════════
       ███  MODULE: SCOUT
       ═══════════════════════════════════════════════════════════ */
    const ScoutMod = (() => {
        let scoutData = null;
        let root = null;
        let activeTab = 'report';
        let containerRef = null;

        const q = (sel) => root ? root.querySelector(sel) : null;
        const qa = (sel) => root ? root.querySelectorAll(sel) : [];

        const POT_LABELS = ['', 'Queasy', 'Despicable', 'Miserable', 'Horrible', 'Wretched', 'Inadequate', 'Unimpressive', 'Mediocre', 'Standard', 'Modest', 'Okay', 'Decent', 'Fine', 'Good', 'Great', 'Excellent', 'Superb', 'Outstanding', 'Extraordinary', 'Wonderkid'];
        const SPECIALTIES = ['None', 'Strength', 'Stamina', 'Pace', 'Marking', 'Tackling', 'Workrate', 'Positioning', 'Passing', 'Crossing', 'Technique', 'Heading', 'Finishing', 'Longshots', 'Set Pieces'];
        const PEAK_SUMS = {
            outfield: { phy: [64, 70, 74, 80], tac: [64, 70, 74, 80], tec: [96, 105, 111, 120] },
            gk: { phy: [64, 70, 74, 80], tac: [50, 55, 60], tec: [68, 74, 80] }
        };

        const skillColor = (v) => { v = parseInt(v); if (v >= 19) return '#6cc040'; if (v >= 16) return '#80e048'; if (v >= 13) return '#c8e0b4'; if (v >= 10) return '#fbbf24'; if (v >= 7) return '#f97316'; return '#f87171'; };
        const potColor = (pot) => { pot = parseInt(pot); if (pot >= 18) return '#6cc040'; if (pot >= 15) return '#5b9bff'; if (pot >= 12) return '#c8e0b4'; if (pot >= 9) return '#fbbf24'; return '#f87171'; };
        const extractTier = (txt) => { if (!txt) return null; const m = txt.match(/\((\d)\/(\d)\)/); return m ? { val: parseInt(m[1]), max: parseInt(m[2]) } : null; };
        const barColor = (val, max) => { const r = val / max; if (r >= 0.75) return '#6cc040'; if (r >= 0.5) return '#80e048'; if (r >= 0.25) return '#fbbf24'; return '#f87171'; };
        const reachColor = (pct) => { if (pct >= 90) return '#6cc040'; if (pct >= 80) return '#80e048'; if (pct >= 70) return '#fbbf24'; if (pct >= 60) return '#f97316'; return '#f87171'; };
        const fixFlags = (html) => html ? html.replace(/class='flag-img-([^']+)'/g, "class='flag-img-$1 tmsq-flag'").replace(/class="flag-img-([^"]+)"/g, 'class="flag-img-$1 tmsq-flag"') : '';
        const bloomColor = (txt) => { if (!txt) return '#c8e0b4'; const t = txt.toLowerCase(); if (t === 'bloomed') return '#6cc040'; if (t.includes('late bloom')) return '#80e048'; if (t.includes('middle')) return '#fbbf24'; if (t.includes('starting')) return '#f97316'; if (t.includes('not bloomed')) return '#f87171'; return '#c8e0b4'; };
        const cashColor = (c) => { if (!c) return '#c8e0b4'; if (c.includes('Astonishingly')) return '#6cc040'; if (c.includes('Incredibly')) return '#80e048'; if (c.includes('Very rich')) return '#a0d880'; if (c.includes('Rich')) return '#c8e0b4'; if (c.includes('Terrible')) return '#f87171'; if (c.includes('Poor')) return '#f97316'; return '#c8e0b4'; };
        const cleanPeakText = (txt) => txt ? txt.replace(/^\s*-\s*/, '').replace(/\s*(physique|tactical ability|technical ability)\s*$/i, '').trim() : '';
        const confPct = (skill) => Math.round((parseInt(skill) || 0) / 20 * 100);
        const confBadge = (pct) => { const c = pct >= 90 ? '#6cc040' : pct >= 70 ? '#80e048' : pct >= 50 ? '#fbbf24' : '#f87171'; const bg = pct >= 90 ? 'rgba(108,192,64,.12)' : pct >= 70 ? 'rgba(128,224,72,.1)' : pct >= 50 ? 'rgba(251,191,36,.1)' : 'rgba(248,113,113,.1)'; return `<span class="tmsc-conf" style="color:${c};background:${bg}">${pct}%</span>`; };
        const onlineDot = (on) => `<span class="tmsc-online ${on ? 'on' : 'off'}"></span>`;
        const getScoutForReport = (r) => { if (!scoutData || !scoutData.scouts || !r.scoutid) return null; return Object.values(scoutData.scouts).find(s => String(s.id) === String(r.scoutid)) || null; };
        const personalityTier = (key, value) => { value = parseInt(value) || 0; if (key === 'aggression') { if (value >= 17) return 'Alarmingly (5/5)'; if (value >= 13) return 'Somewhat (4/5)'; if (value >= 9) return 'Slightly (3/5)'; if (value >= 5) return 'Not particularly (2/5)'; return 'Not (1/5)'; } if (value >= 17) return 'Superb (5/5)'; if (value >= 13) return 'Good (4/5)'; if (value >= 9) return 'OK (3/5)'; if (value >= 5) return 'No special (2/5)'; return 'Bad (1/5)'; };

        const getCurrentBloomStatus = (allReports, scouts) => {
            if (!allReports || !allReports.length || playerAge === null) return { text: '-', certain: false, range: null };
            const getDevSkill = (r) => {
                if (!scouts) return 0;
                const s = Object.values(scouts).find(sc => String(sc.id) === String(r.scoutid));
                return s ? (parseInt(s.development) || 0) : 0;
            };
            const phaseFor = (start) => {
                if (playerAge < start) return 'not';
                if (playerAge >= start + 3) return 'done';
                const y = playerAge - start;
                return y < 1 ? 'starting' : y < 2 ? 'middle' : 'late';
            };
            const PHASE_LABEL = { not: 'Not bloomed', starting: 'Starting', middle: 'Middle', late: 'Late bloom', done: 'Bloomed' };
            const statusFrom = (start) => {
                const range = `${start}.0\u2013${start + 2}.11`;
                const p = phaseFor(start);
                if (p === 'done') return { text: 'Bloomed', certain: true, range: null };
                const notBloomedTxt = bloomType ? `Not bloomed (${bloomType})` : 'Not bloomed';
                const text = p === 'not' ? notBloomedTxt : p === 'starting' ? 'Starting to bloom' : p === 'middle' ? 'In the middle of his bloom' : 'In his late bloom';
                return { text, certain: true, range };
            };

            /* --- STEP 1: Determine bloom TYPE from the most credible "Not bloomed" scout ---
               Among all "Not bloomed" reports that include a type (Early/Normal/Late), the scout
               with the highest dev skill wins. Ties broken by most-recent report date.
               Weaker scouts' conflicting type claims are ignored for possibleStarts. */
            let seenBloomed = false;
            let bloomType = null, possibleStarts = null;
            let bloomTypeBestDevSk = -1, bloomTypeBestDate = '';
            for (const r of allReports) {
                const bt = r.bloom_status_txt || '';
                if (!bt || bt === '-') continue;
                if (bt === 'Bloomed') { seenBloomed = true; continue; }
                if (!bt.includes('Not bloomed')) continue;
                const hasType = bt.includes('Early') || bt.includes('Normal') || bt.includes('Late');
                if (!hasType) continue;
                const devSk = getDevSkill(r);
                const rDate = r.done || '';
                if (devSk > bloomTypeBestDevSk || (devSk === bloomTypeBestDevSk && rDate > bloomTypeBestDate)) {
                    bloomTypeBestDevSk = devSk;
                    bloomTypeBestDate = rDate;
                    if (bt.includes('Early')) { bloomType = 'Early'; possibleStarts = [16, 17]; }
                    else if (bt.includes('Normal')) { bloomType = 'Normal'; possibleStarts = [18, 19]; }
                    else { bloomType = 'Late'; possibleStarts = [20, 21, 22]; }
                }
            }

            /* --- STEP 2: 75% threshold for phase reports within the bloom window ---
               Phase reports are only trusted within the possible bloom window if the scout
               has dev skill >= 15 (75%). If no scout reaches 15, the best available is used.
               Outside the bloom window, phases are accepted normally (inconsistent ones rejected). */
            const MIN_PHASE_DEV = 15;
            const bloomWinMin = possibleStarts ? possibleStarts[0] : Infinity;
            const bloomWinMax = possibleStarts ? possibleStarts[possibleStarts.length - 1] + 3 : -Infinity;
            let maxPhaseDevSkInWindow = 0;
            for (const r of allReports) {
                const bt = r.bloom_status_txt || '';
                if (!bt || bt.includes('Not bloomed') || bt === 'Bloomed' || bt === '-') continue;
                const rAge = parseFloat(r.report_age) || 0;
                if (rAge < bloomWinMin || rAge >= bloomWinMax) continue;
                const devSk = getDevSkill(r);
                if (devSk > maxPhaseDevSkInWindow) maxPhaseDevSkInWindow = devSk;
            }
            const phaseThreshold = maxPhaseDevSkInWindow >= MIN_PHASE_DEV ? MIN_PHASE_DEV : maxPhaseDevSkInWindow;

            /* --- STEP 3: Find best phase report ---
               Must satisfy the threshold (when inside bloom window) and must be consistent
               with the determined bloom type (implied start must be in possibleStarts). */
            let bestPhase = null;
            for (const r of allReports) {
                const bt = r.bloom_status_txt || '';
                if (!bt || bt.includes('Not bloomed') || bt === 'Bloomed' || bt === '-') continue;
                const rAge = parseFloat(r.report_age) || 0;
                const rFloor = Math.floor(rAge);
                const devSk = getDevSkill(r);
                let candidateStart = null;
                if (bt.includes('Starting') && !bt.includes('Not')) candidateStart = rFloor;
                else if (bt.toLowerCase().includes('middle')) candidateStart = rFloor - 1;
                else if (bt.toLowerCase().includes('late bloom')) candidateStart = rFloor - 2;
                if (candidateStart === null) continue;
                const inWindow = possibleStarts && rAge >= bloomWinMin && rAge < bloomWinMax;
                /* Reject if inside window but below quality threshold */
                if (inWindow && devSk < phaseThreshold) continue;
                /* Reject if implied start conflicts with determined bloom type */
                if (possibleStarts && !possibleStarts.includes(candidateStart)) continue;
                if (!bestPhase || devSk > bestPhase.devSkill) {
                    bestPhase = { knownStart: candidateStart, devSkill: devSk };
                }
            }

            /* --- STEP 4: Dominated check ---
               If a more credible scout said "Not bloomed" at an age >= the phase's implied start,
               the phase report is contradicted and discarded. */
            if (bestPhase) {
                let dominated = false;
                for (const r of allReports) {
                    const bt = r.bloom_status_txt || '';
                    if (!bt.includes('Not bloomed')) continue;
                    const rAge = parseFloat(r.report_age) || 0;
                    const devSk = getDevSkill(r);
                    if (rAge >= bestPhase.knownStart && devSk > bestPhase.devSkill) {
                        dominated = true;
                        break;
                    }
                }
                if (!dominated) return statusFrom(bestPhase.knownStart);
            }

            if (seenBloomed) return { text: 'Bloomed', certain: true, range: null };
            if (!possibleStarts) return { text: '-', certain: false, range: null };

            /* --- STEP 5: Narrow possibleStarts using "Not bloomed" age observations ---
               All "Not bloomed" reports contribute their age for narrowing (type claim ignored
               here — we already determined the type; only the age observation matters). */
            for (const r of allReports) {
                const bt = r.bloom_status_txt || '';
                if (!bt.includes('Not bloomed')) continue;
                const rAge = parseFloat(r.report_age) || 0;
                possibleStarts = possibleStarts.filter(s => s > rAge);
            }
            if (possibleStarts.length === 0) return { text: '-', certain: false, range: null };
            if (possibleStarts.length === 1) return statusFrom(possibleStarts[0]);

            /* Multiple possible starts — determine phase for each */
            const rangeStr = possibleStarts.map(s => `${s}.0\u2013${s + 2}.11`).join(' or ');
            const phases = possibleStarts.map(s => phaseFor(s));
            const unique = [...new Set(phases)];
            const notBloomedLabel = bloomType ? `Not bloomed (${bloomType})` : 'Not bloomed';
            if (unique.length === 1) {
                if (unique[0] === 'not') return { text: notBloomedLabel, certain: true, range: rangeStr };
                if (unique[0] === 'done') return { text: 'Bloomed', certain: true, range: null };
                return { text: PHASE_LABEL[unique[0]], certain: true, range: rangeStr };
            }
            const allBlooming = phases.every(p => p !== 'not' && p !== 'done');
            if (allBlooming) {
                const labels = unique.map(p => PHASE_LABEL[p]).join(' or ');
                return { text: 'Blooming', certain: true, phases: labels, range: rangeStr };
            }
            let parts = [];
            if (phases.includes('not')) parts.push(notBloomedLabel);
            const bloomPhases = unique.filter(p => p !== 'not' && p !== 'done');
            if (bloomPhases.length) parts.push('Blooming (' + bloomPhases.map(p => PHASE_LABEL[p]).join('/') + ')');
            if (phases.includes('done')) parts.push('Bloomed');
            return { text: parts.join(' or '), certain: false, range: rangeStr };
        };

        const greenStarsHtml = (rec) => { rec = parseFloat(rec) || 0; const full = Math.floor(rec); const half = (rec % 1) >= 0.25; let h = ''; for (let i = 0; i < full; i++)h += '<span class="tmsc-star-green">★</span>'; if (half) h += '<span class="tmsc-star-green-half">★</span>'; const e = 5 - full - (half ? 1 : 0); for (let i = 0; i < e; i++)h += '<span class="tmsc-star-empty">★</span>'; return h; };

        const combinedStarsHtml = (current, potMax) => {
            current = parseFloat(current) || 0; potMax = parseFloat(potMax) || 0;
            if (potMax < current) potMax = current;
            let h = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= current) h += '<span class="tmsc-star-full">★</span>';
                else if (i - 0.5 <= current && current < i) {
                    /* Half gold — check if potMax fills the other half */
                    if (potMax >= i) h += '<span class="tmsc-star-split">★</span>';
                    else h += '<span class="tmsc-star-half">★</span>';
                }
                else if (i <= potMax) h += '<span class="tmsc-star-green">★</span>';
                else if (i - 0.5 <= potMax && potMax < i) h += '<span class="tmsc-star-green-half">★</span>';
                else h += '<span class="tmsc-star-empty">★</span>';
            }
            return h;
        };

        /* ── Build Scouts Table ── */
        const buildScoutsTable = (scouts) => {
            if (!scouts || !Object.keys(scouts).length) return '<div class="tmsc-empty">No scouts hired</div>';
            const skills = ['seniors', 'youths', 'physical', 'tactical', 'technical', 'development', 'psychology'];
            let rows = '';
            for (const s of Object.values(scouts)) {
                let sc = ''; for (const sk of skills) { const v = parseInt(s[sk]) || 0; sc += `<td class="c" style="color:${skillColor(v)};font-weight:600">${v}</td>`; }
                const bc = s.away ? 'tmsc-send-btn tmsc-away' : 'tmsc-send-btn';
                const bl = s.away ? (s.returns || 'Away') : 'Send';
                rows += `<tr><td style="font-weight:600;color:#e8f5d8;white-space:nowrap">${s.name} ${s.surname}</td>${sc}<td class="c"><button class="${bc}" data-scout-id="${s.id}" ${s.away ? 'disabled title="' + (s.returns || '') + '"' : ''}>${bl}</button></td></tr>`;
            }
            return `<table class="tmsc-tbl"><thead><tr><th>Name</th><th class="c">Sen</th><th class="c">Yth</th><th class="c">Phy</th><th class="c">Tac</th><th class="c">Tec</th><th class="c">Dev</th><th class="c">Psy</th><th class="c"></th></tr></thead><tbody>${rows}</tbody></table>`;
        };

        /* ── Build Report Card ── */
        const buildReportCard = (r) => {
            const pot = parseInt(r.old_pot) || 0;
            const potStarsVal = (parseFloat(r.potential) || 0) / 2;
            if (r.scout_name === 'YD' || r.scoutid === '0') {
                return `<div class="tmsc-report"><div class="tmsc-report-header"><div><div class="tmsc-stars">${greenStarsHtml(potStarsVal)}</div><div class="tmsc-report-scout">Youth Development<span class="tmsc-yd-badge">YD</span></div></div><div class="tmsc-report-date">${r.done || '-'}</div></div><div class="tmsc-report-grid"><div class="tmsc-report-item wide"><span class="tmsc-report-label">Potential</span><span class="tmsc-report-value" style="color:${potColor(pot)}">${pot}</span></div><div class="tmsc-report-item wide"><span class="tmsc-report-label">Age at report</span><span class="tmsc-report-value">${r.report_age || '-'}</span></div></div></div>`;
            }
            const spec = parseInt(r.specialist) || 0; const specLabel = SPECIALTIES[spec] || 'None';
            const scout = getScoutForReport(r);
            let potConf = null, bloomConf = null, phyConf = null, tacConf = null, tecConf = null, psyConf = null, specConf = null;
            if (scout) { const age = parseInt(r.report_age) || 0; const senYth = age < 20 ? (parseInt(scout.youths) || 0) : (parseInt(scout.seniors) || 0); const dev = parseInt(scout.development) || 0; potConf = confPct(Math.min(senYth, dev)); bloomConf = confPct(dev); phyConf = confPct(parseInt(scout.physical) || 0); tacConf = confPct(parseInt(scout.tactical) || 0); tecConf = confPct(parseInt(scout.technical) || 0); psyConf = confPct(parseInt(scout.psychology) || 0); if (spec > 0) { const phyS = [1, 2, 3, 11]; const tacS = [4, 5, 6, 7]; if (phyS.includes(spec)) specConf = phyConf; else if (tacS.includes(spec)) specConf = tacConf; else specConf = tecConf; } }
            const peaks = [{ label: 'Physique', text: cleanPeakText(r.peak_phy_txt), conf: phyConf }, { label: 'Tactical', text: cleanPeakText(r.peak_tac_txt), conf: tacConf }, { label: 'Technical', text: cleanPeakText(r.peak_tec_txt), conf: tecConf }];
            let peaksH = '';
            for (const p of peaks) { const tier = extractTier(p.text); if (tier) { const pct = (tier.val / tier.max) * 100; const c = barColor(tier.val, tier.max); peaksH += `<div class="tmsc-bar-row"><span class="tmsc-bar-label">${p.label}</span><div class="tmsc-bar-track"><div class="tmsc-bar-fill" style="width:${pct}%;background:${c}"></div></div><span class="tmsc-bar-text" style="color:${c}">${tier.val}/${tier.max}</span>${p.conf !== null ? confBadge(p.conf) : ''}</div>`; } }
            const charisma = parseInt(r.charisma) || 0; const professionalism = parseInt(r.professionalism) || 0; const aggression = parseInt(r.aggression) || 0;
            const pers = [{ label: 'Leadership', key: 'leadership', value: charisma }, { label: 'Professionalism', key: 'professionalism', value: professionalism }, { label: 'Aggression', key: 'aggression', value: aggression }];
            let persH = '';
            for (const p of pers) { const pct = (p.value / 20) * 100; const c = skillColor(p.value); persH += `<div class="tmsc-bar-row"><span class="tmsc-bar-label">${p.label}</span><div class="tmsc-bar-track"><div class="tmsc-bar-fill" style="width:${pct}%;background:${c}"></div></div><span class="tmsc-bar-text" style="color:${c}">${p.value}</span>${psyConf !== null ? confBadge(psyConf) : ''}</div>`; }
            return `<div class="tmsc-report"><div class="tmsc-report-header"><div><div class="tmsc-stars">${combinedStarsHtml(r.rec, potStarsVal)}</div><div class="tmsc-report-scout">${r.scout_name || 'Unknown'}</div></div><div class="tmsc-report-date">${r.done || '-'}</div></div><div class="tmsc-report-grid"><div class="tmsc-report-item"><span class="tmsc-report-label">Potential</span><span class="tmsc-report-value" style="color:${potColor(pot)}">${pot}${potConf !== null ? confBadge(potConf) : ''}</span></div><div class="tmsc-report-item"><span class="tmsc-report-label">Age</span><span class="tmsc-report-value">${r.report_age || '-'}</span></div><div class="tmsc-report-item"><span class="tmsc-report-label">Bloom</span><span class="tmsc-report-value" style="color:${bloomColor(r.bloom_status_txt)}">${r.bloom_status_txt || '-'}${bloomConf !== null ? confBadge(bloomConf) : ''}</span></div><div class="tmsc-report-item"><span class="tmsc-report-label">Development</span><span class="tmsc-report-value">${r.dev_status || '-'}${bloomConf !== null ? confBadge(bloomConf) : ''}</span></div><div class="tmsc-report-item wide"><span class="tmsc-report-label">Specialty</span><span class="tmsc-report-value" style="color:${spec > 0 ? '#fbbf24' : '#5a7a48'}">${specLabel}${specConf !== null ? confBadge(specConf) : ''}</span></div></div><div><div class="tmsc-section-title">Peak Development</div>${peaksH}</div><div><div class="tmsc-section-title">Personality</div>${persH}</div></div>`;
        };

        /* ── Build Report Tab ── */
        const buildReport = (reports, error) => {
            let h = '';
            if (error) { const msg = error === 'multi_scout' ? 'This scout is already on a mission' : error === 'multi_bid' ? 'Scout already scouting this player' : error; h += `<div class="tmsc-error">${msg}</div>`; }
            if (!reports || !reports.length) return h + '<div class="tmsc-empty">No scout reports available</div>';
            if (reports.length > 1) h += `<div class="tmsc-report-count">${reports.length} Reports</div>`;
            for (let i = 0; i < reports.length; i++) { if (i > 0) h += '<hr class="tmsc-report-divider">'; h += buildReportCard(reports[i]); }
            return h;
        };

        /* ── Build Interested ── */
        const buildInterested = (interested) => {
            if (!interested || !interested.length) return '<div class="tmsc-empty">No interested clubs</div>';
            let rows = '';
            for (const c of interested) { const ch = fixFlags(c.club_link || ''); const lh = fixFlags(c.league_link || ''); const cc = cashColor(c.cash); rows += `<tr><td class="tmsc-club-cell">${ch} ${onlineDot(c.online)}</td><td class="tmsc-league-cell">${lh}</td><td style="color:${cc};font-weight:600;font-size:11px">${c.cash}</td></tr>`; }
            return `<table class="tmsc-tbl"><thead><tr><th>Club</th><th>League</th><th>Financial</th></tr></thead><tbody>${rows}</tbody></table>`;
        };

        /* ── Render ── */
        const render = (container, data) => {
            containerRef = container;
            scoutData = data;
            activeTab = (data.reports && data.reports.length) ? 'report' : 'scouts';
            container.innerHTML = '';
            const wrapper = document.createElement('div');
            wrapper.id = 'tmsc-root';
            container.appendChild(wrapper);
            root = wrapper;
            const TAB_LABELS = { report: 'Report', scouts: 'Scouts', interested: 'Interested' };
            let tabsH = '';
            for (const [key, label] of Object.entries(TAB_LABELS)) {
                let hasData = true;
                if (key === 'report') hasData = data.reports && data.reports.length > 0;
                if (key === 'interested') hasData = data.interested && data.interested.length > 0;
                if (key === 'scouts') hasData = data.scouts && Object.keys(data.scouts).length > 0;
                tabsH += `<button class="tmsc-tab ${key === activeTab ? 'active' : ''}" data-tab="${key}" ${!hasData ? 'style="opacity:0.4"' : ''}>${label}</button>`;
            }
            const getContent = (tab) => { switch (tab) { case 'report': return buildReport(scoutData.reports, scoutData.error); case 'scouts': return buildScoutsTable(scoutData.scouts); case 'interested': return buildInterested(scoutData.interested); default: return ''; } };
            root.innerHTML = `<div class="tmsc-wrap"><div class="tmsc-tabs">${tabsH}</div><div class="tmsc-body" id="tmsc-tab-content">${getContent(activeTab)}</div></div>`;
            bindTabs();
            bindSendButtons();
        };

        const bindTabs = () => {
            qa('.tmsc-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    const key = tab.dataset.tab; activeTab = key;
                    qa('.tmsc-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active');
                    const c = q('#tmsc-tab-content'); if (!c) return;
                    switch (key) { case 'report': c.innerHTML = buildReport(scoutData.reports, scoutData.error); break; case 'scouts': c.innerHTML = buildScoutsTable(scoutData.scouts); bindSendButtons(); break; case 'interested': c.innerHTML = buildInterested(scoutData.interested); break; }
                });
            });
        };

        const bindSendButtons = () => {
            qa('.tmsc-send-btn').forEach(btn => {
                if (btn.disabled) return;
                btn.addEventListener('click', () => {
                    const scoutId = btn.dataset.scoutId; btn.disabled = true; btn.textContent = '...';
                    $.post('/ajax/players_get_info.ajax.php', { player_id: PLAYER_ID, type: 'scout', scout_id: scoutId, show_non_pro_graphs: true }, 'json')
                        .done((res) => { try { const d = typeof res === 'object' ? res : JSON.parse(res); if (d && (d.scouts || d.reports)) { render(containerRef, d); } else { btn.textContent = 'Sent'; btn.style.background = '#274a18'; btn.style.color = '#6cc040'; } } catch (e) { btn.textContent = 'Sent'; btn.style.background = '#274a18'; btn.style.color = '#6cc040'; } })
                        .fail(() => { btn.textContent = 'Error'; btn.style.color = '#f87171'; setTimeout(() => { btn.textContent = 'Send'; btn.disabled = false; btn.style.color = ''; }, 2000); });
                });
            });
        };

        const reRender = () => { if (containerRef && scoutData) render(containerRef, scoutData); };

        const getEstimateHtml = (data) => {
            const hasScouts = data && data.reports && data.reports.length && data.scouts;
            let scouts = {}, regular = [];
            let potPick = null, bloomPick = null, phyPick = null, tacPick = null, tecPick = null, psyPick = null;
            if (hasScouts) {
                scouts = data.scouts;
                regular = data.reports.filter(r => r.scout_name !== 'YD' && r.scoutid !== '0');
                if (regular.length) {
                    const scoutSkill = (r, field) => { const s = Object.values(scouts).find(s => String(s.id) === String(r.scoutid)); return s ? (parseInt(s[field]) || 0) : 0; };
                    const pickBest = (field) => { let best = null, bs = -1, bd = ''; for (const r of regular) { const sk = scoutSkill(r, field); const d = r.done || ''; if (sk > bs || (sk === bs && d > bd)) { best = r; bs = sk; bd = d; } } return best ? { report: best, conf: confPct(bs) } : null; };
                    const pickBestPot = () => { let best = null, bs = -1, bd = ''; for (const r of regular) { const s = Object.values(scouts).find(s => String(s.id) === String(r.scoutid)); const age = parseInt(r.report_age) || 0; let sk = 0; if (s) { const senYth = age < 20 ? (parseInt(s.youths) || 0) : (parseInt(s.seniors) || 0); const dev = parseInt(s.development) || 0; sk = Math.min(senYth, dev); } const d = r.done || ''; if (sk > bs || (sk === bs && d > bd)) { best = r; bs = sk; bd = d; } } return best ? { report: best, conf: confPct(bs) } : null; };
                    potPick = pickBestPot(); bloomPick = pickBest('development'); phyPick = pickBest('physical'); tacPick = pickBest('tactical'); tecPick = pickBest('technical'); psyPick = pickBest('psychology');
                }
            }
            /* If no scouts AND no skill sums, nothing to show */
            if (!regular.length && !playerSkillSums) return '';

            const pot = potPick ? parseInt(potPick.report.old_pot) || 0 : 0;
            const potStarsVal = potPick ? (parseFloat(potPick.report.potential) || 0) / 2 : 0;
            const rec = potPick ? parseFloat(potPick.report.rec) || 0 : 0;
            const bloomResult = getCurrentBloomStatus(regular, scouts);
            const bloomTxt = bloomResult.text || '-';
            const devTxt = bloomPick ? bloomPick.report.dev_status : '-';
            let specVal = 0, specLabel = 'None', specConf = null;
            for (const pick of [phyPick, tacPick, tecPick]) { if (pick) { const s = parseInt(pick.report.specialist) || 0; if (s > 0) { specVal = s; specLabel = SPECIALTIES[s] || 'None'; specConf = pick.conf; break; } } }

            const cb = (conf) => {
                if (conf === null) return '';
                if (conf === 0) return '<span class="tmbe-conf" style="background:rgba(90,122,72,.15);color:#5a7a48">?</span>';
                let bg, clr;
                if (conf >= 90) { bg = 'rgba(108,192,64,.15)'; clr = '#6cc040'; }
                else if (conf >= 70) { bg = 'rgba(251,191,36,.12)'; clr = '#fbbf24'; }
                else { bg = 'rgba(248,113,113,.1)'; clr = '#f87171'; }
                return `<span class="tmbe-conf" style="background:${bg};color:${clr}">${conf}%</span>`;
            };

            /* Peak bars with reach */
            const peaks = [
                { label: 'Physique', text: phyPick ? cleanPeakText(phyPick.report.peak_phy_txt) : '', conf: phyPick ? phyPick.conf : null, cat: 'phy' },
                { label: 'Tactical', text: tacPick ? cleanPeakText(tacPick.report.peak_tac_txt) : '', conf: tacPick ? tacPick.conf : null, cat: 'tac' },
                { label: 'Technical', text: tecPick ? cleanPeakText(tecPick.report.peak_tec_txt) : '', conf: tecPick ? tecPick.conf : null, cat: 'tec' }
            ];
            let peaksH = '';
            for (const p of peaks) {
                const isGK = isGoalkeeper;
                const peakArr = (isGK ? PEAK_SUMS.gk : PEAK_SUMS.outfield)[p.cat];
                if (!peakArr) continue;
                const maxPeakSum = peakArr[peakArr.length - 1];
                const tier = extractTier(p.text);
                const curSum = playerSkillSums ? playerSkillSums[p.cat] : null;

                if (tier && curSum !== null) {
                    /* Have both scout data and skill sums */
                    const peakSum = peakArr[tier.val - 1];
                    const peakPct = (peakSum / maxPeakSum) * 100;
                    const curPct = (curSum / maxPeakSum) * 100;
                    const c = barColor(tier.val, tier.max);
                    const rPct = Math.round(curSum / peakSum * 100); const rC = reachColor(rPct);
                    const mPct = Math.round(curSum / maxPeakSum * 100); const mC = reachColor(mPct);
                    const reachLbl = `<div class="tmbe-peak-reach"><span class="tmbe-reach-item"><span class="tmbe-reach-tag">Peak</span><span style="color:${rC}">${rPct}%</span><span style="color:#90b878;font-weight:400;font-size:9px">(${curSum}/${peakSum})</span></span><span class="tmbe-reach-item"><span class="tmbe-reach-tag">Max</span><span style="color:${mC}">${mPct}%</span><span style="color:#90b878;font-weight:400;font-size:9px">(${curSum}/${maxPeakSum})</span></span></div>`;
                    peaksH += `<div class="tmbe-item tmbe-peak-item"><div class="tmbe-peak-header"><span class="tmbe-lbl">${p.label}</span><span class="tmbe-val" style="color:${c}">${tier.val}/${tier.max}${p.conf !== null ? cb(p.conf) : ''}</span></div>${reachLbl}<div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${peakPct}%;background:${c};opacity:0.35"></div><div class="tmbe-bar-fill-reach" style="width:${curPct}%;background:${rC}"></div></div></div>`;
                } else if (curSum !== null) {
                    /* No scout but have skill sums — show current only with ? */
                    const mPct = Math.round(curSum / maxPeakSum * 100);
                    const curPct = (curSum / maxPeakSum) * 100;
                    const mC = reachColor(mPct);
                    const reachLbl = `<div class="tmbe-peak-reach"><span class="tmbe-reach-item"><span class="tmbe-reach-tag">Max</span><span style="color:${mC}">${mPct}%</span><span style="color:#90b878;font-weight:400;font-size:9px">(${curSum}/${maxPeakSum})</span></span></div>`;
                    peaksH += `<div class="tmbe-item tmbe-peak-item"><div class="tmbe-peak-header"><span class="tmbe-lbl">${p.label}</span><span class="tmbe-val" style="color:#5a7a48">?</span></div>${reachLbl}<div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${curPct}%;background:${mC}"></div></div></div>`;
                } else if (tier) {
                    /* Scout data but no skill sums */
                    const peakSum = peakArr[tier.val - 1];
                    const peakPct = (peakSum / maxPeakSum) * 100;
                    const c = barColor(tier.val, tier.max);
                    peaksH += `<div class="tmbe-item tmbe-peak-item"><div class="tmbe-peak-header"><span class="tmbe-lbl">${p.label}</span><span class="tmbe-val" style="color:${c}">${tier.val}/${tier.max}${p.conf !== null ? cb(p.conf) : ''}</span></div><div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${peakPct}%;background:${c}"></div></div></div>`;
                }
            }

            /* Personality */
            let persH = '';
            if (psyPick) {
                const pers = [{ label: 'Leadership', value: parseInt(psyPick.report.charisma) || 0 }, { label: 'Professionalism', value: parseInt(psyPick.report.professionalism) || 0 }, { label: 'Aggression', value: parseInt(psyPick.report.aggression) || 0 }];
                for (const p of pers) { const pct = (p.value / 20) * 100; const c = skillColor(p.value); persH += `<div class="tmbe-bar-row"><div class="tmbe-bar-header"><span class="tmbe-bar-label">${p.label}</span><div class="tmbe-bar-right"><span class="tmbe-bar-val" style="color:${c}">${p.value}</span>${cb(psyPick.conf)}</div></div><div class="tmbe-bar-track"><div class="tmbe-bar-fill" style="width:${pct}%;background:${c}"></div></div></div>`; }
            } else if (!hasScouts) {
                const persLabels = ['Leadership', 'Professionalism', 'Aggression'];
                for (const lbl of persLabels) { persH += `<div class="tmbe-bar-row"><div class="tmbe-bar-header"><span class="tmbe-bar-label">${lbl}</span><div class="tmbe-bar-right"><span class="tmbe-bar-val" style="color:#5a7a48">?</span></div></div></div>`; }
            }

            const currentRating = playerRecSort !== null ? playerRecSort : rec;
            const hasData = regular.length > 0;
            let h = `<div class="tmbe-card"><div class="tmbe-title">Best Estimate<span class="tmbe-title-stars">${combinedStarsHtml(currentRating, potStarsVal)}</span></div>`;
            h += `<div class="tmbe-grid">`;
            h += `<div class="tmbe-item"><span class="tmbe-lbl">Potential</span><span class="tmbe-val" style="color:${hasData ? potColor(pot) : '#5a7a48'}">${hasData ? pot : '?'}${potPick ? cb(potPick.conf) : ''}</span></div>`;
            const beBloomClr = hasData ? (bloomResult.certain ? (bloomResult.phases ? '#80e048' : bloomColor(bloomTxt)) : '#fbbf24') : '#5a7a48';
            const beBloomTxt = hasData ? (!bloomResult.certain && !bloomResult.phases ? (bloomResult.text || bloomResult.range || '-') : bloomTxt) : '?';
            let beBloomSub = '';
            if (hasData && bloomResult.phases) beBloomSub += `<span style="display:block;font-size:9px;color:#90b878;font-weight:600;margin-top:1px">${bloomResult.phases}</span>`;
            if (hasData && bloomResult.range && bloomTxt !== 'Bloomed') beBloomSub += `<span style="display:block;font-size:9px;color:#6a9a58;font-weight:600;margin-top:1px">${bloomResult.range}</span>`;
            h += `<div class="tmbe-item"><span class="tmbe-lbl">Bloom</span><span class="tmbe-val" style="color:${beBloomClr}">${beBloomTxt}${bloomPick ? cb(bloomPick.conf) : ''}${beBloomSub}</span></div>`;
            h += `<div class="tmbe-item"><span class="tmbe-lbl">Development</span><span class="tmbe-val" style="color:${hasData ? '#e8f5d8' : '#5a7a48'}">${hasData ? devTxt : '?'}${bloomPick ? cb(bloomPick.conf) : ''}</span></div>`;
            h += `<div class="tmbe-item"><span class="tmbe-lbl">Specialty</span><span class="tmbe-val" style="color:${hasData ? (specVal > 0 ? '#fbbf24' : '#5a7a48') : '#5a7a48'}">${hasData ? specLabel : '?'}${specConf !== null ? cb(specConf) : ''}</span></div>`;
            if (peaksH) h += `<div class="tmbe-divider">Peak Development</div>${peaksH}`;
            h += `</div>`;
            if (persH) h += `<div class="tmbe-divider">Personality</div>${persH}`;
            h += `</div>`;
            return h;
        };

        return { render, reRender, getEstimateHtml };
    })();

    /* ═══════════════════════════════════════════════════════════
       ███  MODULE: TRAINING (Shadow DOM)
       ═══════════════════════════════════════════════════════════ */
    const TrainingMod = (() => {
        const TRAINING_TYPES = { '1': 'Technical', '2': 'Fitness', '3': 'Tactical', '4': 'Finishing', '5': 'Defending', '6': 'Wings' };
        const MAX_PTS = 4;
        const SKILL_NAMES = { strength: 'Strength', stamina: 'Stamina', pace: 'Pace', marking: 'Marking', tackling: 'Tackling', workrate: 'Workrate', positioning: 'Positioning', passing: 'Passing', crossing: 'Crossing', technique: 'Technique', heading: 'Heading', finishing: 'Finishing', longshots: 'Longshots', set_pieces: 'Set Pieces' };
        const COLORS = ['#6cc040', '#5b9bff', '#fbbf24', '#f97316', '#a78bfa', '#f87171'];

        const TMT_CSS = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:host{display:block;all:initial;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#c8e0b4;line-height:1.4}
.tmt-wrap{background:transparent;border-radius:0;border:none;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#c8e0b4;font-size:13px}
.tmt-tabs{display:flex;gap:6px;padding:10px 14px 6px;flex-wrap:wrap}
.tmt-tab{padding:4px 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:#90b878;cursor:pointer;border-radius:4px;background:rgba(42,74,28,.3);border:1px solid rgba(42,74,28,.6);transition:all 0.15s;font-family:inherit;-webkit-appearance:none;appearance:none}
.tmt-tab:hover{color:#c8e0b4;background:rgba(42,74,28,.5);border-color:#3d6828}.tmt-tab.active{color:#e8f5d8;background:#305820;border-color:#3d6828}
.tmt-pro{display:inline-block;background:rgba(108,192,64,.2);color:#6cc040;padding:1px 5px;border-radius:3px;font-size:9px;font-weight:800;letter-spacing:0.5px;margin-left:4px;vertical-align:middle}
.tmt-body{padding:10px 14px 16px;font-size:13px}
.tmt-sbar{display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(42,74,28,.35);border:1px solid #2a4a1c;border-radius:6px;margin-bottom:10px;flex-wrap:wrap}
.tmt-sbar-label{color:#6a9a58;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px}
.tmt-sbar select{background:rgba(42,74,28,.4);color:#c8e0b4;border:1px solid #2a4a1c;padding:4px 8px;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600;font-family:inherit}
.tmt-sbar select:focus{border-color:#6cc040;outline:none}
.tmt-cards{display:flex;gap:14px;margin-bottom:12px;padding:12px 14px;background:rgba(42,74,28,.3);border:1px solid #2a4a1c;border-radius:8px;flex-wrap:wrap}
.tmt-cards>div{min-width:80px}.tmt-cards .lbl{color:#6a9a58;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;font-weight:700}.tmt-cards .val{font-size:16px;font-weight:800;margin-top:3px}
.tmt-pool-bar{height:6px;background:rgba(0,0,0,.2);border-radius:3px;overflow:hidden;display:flex;gap:1px;margin-top:8px}
.tmt-pool-seg{height:100%;border-radius:3px;transition:width 0.3s ease;min-width:0}.tmt-pool-rem{flex:1;height:100%}
.tmt-tbl{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px}
.tmt-tbl th{padding:6px;font-size:10px;font-weight:700;color:#6a9a58;text-transform:uppercase;letter-spacing:0.4px;border-bottom:1px solid #2a4a1c;text-align:left;white-space:nowrap}.tmt-tbl th.c{text-align:center}
.tmt-tbl td{padding:5px 6px;border-bottom:1px solid rgba(42,74,28,.4);color:#c8e0b4;font-variant-numeric:tabular-nums;vertical-align:middle}.tmt-tbl td.c{text-align:center}
.tmt-tbl tr:hover{background:rgba(255,255,255,.03)}
.tmt-clr-bar{width:3px;padding:0;border-radius:2px}
.tmt-dots{display:inline-flex;gap:3px;align-items:center}
.tmt-dot{width:18px;height:18px;border-radius:50%;transition:all 0.15s;cursor:pointer;display:inline-block}
.tmt-dot-empty{background:rgba(255,255,255,.06);border:1px solid rgba(42,74,28,.6)}.tmt-dot-empty:hover{background:rgba(255,255,255,.12);border-color:rgba(42,74,28,.9)}
.tmt-dot-filled{box-shadow:0 0 6px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.15)}
.tmt-btn{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;background:rgba(42,74,28,.4);border:1px solid #2a4a1c;border-radius:6px;color:#8aac72;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.15s;padding:0;line-height:1;font-family:inherit;-webkit-appearance:none;appearance:none}
.tmt-btn:hover:not(:disabled){background:rgba(42,74,28,.7);color:#c8e0b4}.tmt-btn:active:not(:disabled){background:rgba(74,144,48,.3)}.tmt-btn:disabled{opacity:0.2;cursor:not-allowed}
.tmt-pts{font-size:13px;font-weight:800;color:#e8f5d8;min-width:14px;text-align:center}
.tmt-footer{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(42,74,28,.3);border:1px solid #2a4a1c;border-radius:8px;gap:10px;flex-wrap:wrap}
.tmt-footer-total .lbl{color:#6a9a58;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;font-weight:700}
.tmt-footer-total .val{font-size:18px;font-weight:900;color:#e8f5d8;letter-spacing:-0.5px}.tmt-footer-total .dim{color:#6a9a58;font-weight:600}
.tmt-footer-acts{display:flex;gap:6px}
.tmt-act{display:inline-block;padding:4px 14px;background:rgba(42,74,28,.4);border:1px solid #2a4a1c;border-radius:6px;color:#8aac72;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;text-transform:uppercase;letter-spacing:0.4px;font-family:inherit;-webkit-appearance:none;appearance:none}
.tmt-act:hover{background:rgba(42,74,28,.7);color:#c8e0b4}
.tmt-act.dng:hover{border-color:rgba(248,113,113,.3);color:#f87171;background:rgba(248,113,113,.08)}
.tmt-saved{display:inline-block;font-size:10px;font-weight:700;color:#6cc040;background:rgba(108,192,64,.12);border:1px solid rgba(108,192,64,.25);border-radius:4px;padding:2px 8px;margin-left:8px;opacity:0;transition:opacity 0.3s;vertical-align:middle}.tmt-saved.vis{opacity:1}
.tmt-custom-off .tmt-cards{display:none}.tmt-custom-off .tmt-tbl{display:none}.tmt-custom-off .tmt-footer{display:none}
.tmt-wrap:not(.tmt-custom-off) .tmt-sbar{display:none}`;

        let trainingData = null, teamPoints = [0, 0, 0, 0, 0, 0], originalPoints = [0, 0, 0, 0, 0, 0], maxPool = 0, customOn = false, currentType = '3', shadow = null, customDataRef = null;
        const q = (sel) => shadow ? shadow.querySelector(sel) : null;
        const qa = (sel) => shadow ? shadow.querySelectorAll(sel) : [];

        const renderPoolBar = () => { const tot = teamPoints.reduce((a, b) => a + b, 0); let s = ''; for (let i = 0; i < 6; i++) { if (teamPoints[i] > 0) { s += `<div class="tmt-pool-seg" style="width:${(teamPoints[i] / maxPool * 100).toFixed(2)}%;background:${COLORS[i]};opacity:0.7"></div>`; } } const rem = ((maxPool - tot) / maxPool * 100).toFixed(2); if (rem > 0) s += `<div class="tmt-pool-rem" style="width:${rem}%"></div>`; return s; };
        const renderDots = (idx) => { const pts = teamPoints[idx]; const c = COLORS[idx]; let h = ''; for (let i = 0; i < MAX_PTS; i++) { h += i < pts ? `<span class="tmt-dot tmt-dot-filled" data-team="${idx}" data-seg="${i}" style="background:${c}"></span>` : `<span class="tmt-dot tmt-dot-empty" data-team="${idx}" data-seg="${i}"></span>`; } return h; };

        let saveDebounce = null, saveTimer = null;
        const flashSaved = () => { const el = q('#saved'); if (!el) return; el.classList.add('vis'); clearTimeout(saveTimer); saveTimer = setTimeout(() => el.classList.remove('vis'), 1800); };
        const saveCustomTraining = () => { const tot = teamPoints.reduce((a, b) => a + b, 0); if (tot !== maxPool || !customDataRef) return; clearTimeout(saveDebounce); saveDebounce = setTimeout(() => { const d = { type: 'custom', on: 1, player_id: PLAYER_ID, 'custom[points_spend]': 0, 'custom[player_id]': PLAYER_ID, 'custom[saved]': '' }; for (let i = 0; i < 6; i++) { const t = customDataRef['team' + (i + 1)]; const p = `custom[team${i + 1}]`; d[`${p}[num]`] = i + 1; d[`${p}[label]`] = t.label || `Team ${i + 1}`; d[`${p}[points]`] = teamPoints[i]; d[`${p}[skills][]`] = t.skills; } $.post('/ajax/training_post.ajax.php', d).done(() => flashSaved()); }, 300); };
        const saveTrainingType = (type) => { $.post('/ajax/training_post.ajax.php', { type: 'player_pos', player_id: PLAYER_ID, team_id: type }).done(() => flashSaved()); };

        const updateUI = () => {
            const tot = teamPoints.reduce((a, b) => a + b, 0); const rem = maxPool - tot;
            const barEl = q('#pool-bar'); if (barEl) barEl.innerHTML = renderPoolBar();
            const uEl = q('#card-used'); if (uEl) uEl.textContent = tot;
            const fEl = q('#card-free'); if (fEl) { fEl.textContent = rem; fEl.style.color = rem > 0 ? '#fbbf24' : '#6a9a58'; }
            for (let i = 0; i < 6; i++) { const dEl = q(`#dots-${i}`); if (dEl) dEl.innerHTML = renderDots(i); const pEl = q(`#pts-${i}`); if (pEl) pEl.textContent = teamPoints[i]; }
            const tEl = q('#total'); if (tEl) tEl.innerHTML = `${tot}<span class="dim">/${maxPool}</span>`;
            qa('.tmt-minus').forEach(b => { b.disabled = teamPoints[parseInt(b.dataset.team)] <= 0; });
            qa('.tmt-plus').forEach(b => { b.disabled = teamPoints[parseInt(b.dataset.team)] >= MAX_PTS || rem <= 0; });
            bindDotClicks();
        };

        const bindDotClicks = () => { qa('.tmt-dot').forEach(dot => { dot.onclick = () => { const ti = parseInt(dot.dataset.team); const si = parseInt(dot.dataset.seg); const tp = si + 1; const tot = teamPoints.reduce((a, b) => a + b, 0); const cur = teamPoints[ti]; if (tp === cur) teamPoints[ti] = si; else if (tp > cur) { const need = tp - cur; const avail = maxPool - tot; teamPoints[ti] = need <= avail ? tp : cur + avail; } else teamPoints[ti] = tp; updateUI(); saveCustomTraining(); }; }); };

        const bindEvents = () => {
            qa('.tmt-plus').forEach(b => { b.addEventListener('click', () => { const i = parseInt(b.dataset.team); if (teamPoints[i] < MAX_PTS && teamPoints.reduce((a, b) => a + b, 0) < maxPool) { teamPoints[i]++; updateUI(); saveCustomTraining(); } }); });
            qa('.tmt-minus').forEach(b => { b.addEventListener('click', () => { const i = parseInt(b.dataset.team); if (teamPoints[i] > 0) { teamPoints[i]--; updateUI(); saveCustomTraining(); } }); });
            bindDotClicks();
            q('#btn-clear')?.addEventListener('click', () => { teamPoints.fill(0); updateUI(); saveCustomTraining(); });
            q('#btn-reset')?.addEventListener('click', () => { teamPoints = [...originalPoints]; updateUI(); saveCustomTraining(); });
            const tS = q('#tab-std'), tC = q('#tab-cus'), w = q('.tmt-wrap');
            tS?.addEventListener('click', () => { if (customOn) { customOn = false; tS.classList.add('active'); tC.classList.remove('active'); w.classList.add('tmt-custom-off'); saveTrainingType(currentType); } });
            tC?.addEventListener('click', () => { if (!customOn) { customOn = true; tC.classList.add('active'); tS.classList.remove('active'); w.classList.remove('tmt-custom-off'); saveCustomTraining(); } });
            q('#type-select')?.addEventListener('change', (e) => { const v = e.target.value; if (v !== currentType) { currentType = v; saveTrainingType(v); } });
            updateUI();
        };

        const render = (container, data) => {
            trainingData = data;
            const custom = data.custom;
            const customData = custom.custom;
            customOn = !!custom.custom_on;
            currentType = String(custom.team || '3');
            customDataRef = customData;

            if (data.custom?.gk) {
                container.innerHTML = '';
                const host = document.createElement('div');
                container.appendChild(host);
                shadow = host.attachShadow({ mode: 'open' });
                shadow.innerHTML = `<style>${TMT_CSS}</style><div class="tmt-wrap"><div class="tmt-body" style="text-align:center;padding:20px 14px"><div style="font-size:22px;margin-bottom:6px">🧤</div><div style="color:#e8f5d8;font-weight:700;font-size:14px;margin-bottom:4px">Goalkeeper Training</div><div style="color:#6a9a58;font-size:11px">Training is automatically set and cannot be changed for goalkeepers.</div></div></div>`;
                return;
            }

            for (let i = 0; i < 6; i++) { const t = customData['team' + (i + 1)]; teamPoints[i] = parseInt(t.points) || 0; originalPoints[i] = teamPoints[i]; }
            const totalAlloc = teamPoints.reduce((a, b) => a + b, 0);
            maxPool = totalAlloc + (parseInt(customData.points_spend) || 0); if (maxPool < 1) maxPool = 10;
            const rem = maxPool - totalAlloc;

            container.innerHTML = ''; const host = document.createElement('div'); container.appendChild(host);
            shadow = host.attachShadow({ mode: 'open' });

            let typeOpts = customOn ? '<option value="" selected>— Select —</option>' : '';
            Object.entries(TRAINING_TYPES).forEach(([id, name]) => { typeOpts += `<option value="${id}" ${!customOn && id === currentType ? 'selected' : ''}>${name}</option>`; });

            let teamRows = '';
            for (let i = 0; i < 6; i++) { const t = customData['team' + (i + 1)]; const skills = t.skills.map(s => SKILL_NAMES[s] || s).join(', '); teamRows += `<tr data-team="${i}"><td class="tmt-clr-bar" style="background:${COLORS[i]}"></td><td style="font-weight:700;color:#e8f5d8;white-space:nowrap">T${i + 1}</td><td style="color:#8aac72;font-size:11px">${skills}</td><td class="c"><div style="display:flex;align-items:center;gap:6px;justify-content:center"><button class="tmt-btn tmt-minus" data-team="${i}">−</button><span class="tmt-dots" id="dots-${i}">${renderDots(i)}</span><span class="tmt-pts" id="pts-${i}">${teamPoints[i]}</span><button class="tmt-btn tmt-plus" data-team="${i}">+</button></div></td></tr>`; }

            shadow.innerHTML = `<style>${TMT_CSS}</style>
<div class="tmt-wrap ${customOn ? '' : 'tmt-custom-off'}">
<div class="tmt-tabs"><button class="tmt-tab ${!customOn ? 'active' : ''}" id="tab-std">Standard</button><button class="tmt-tab ${customOn ? 'active' : ''}" id="tab-cus">Custom <span class="tmt-pro">PRO</span></button></div>
<div class="tmt-body">
<div class="tmt-sbar" id="type-bar"><span class="tmt-sbar-label">Training Type</span><select id="type-select">${typeOpts}</select></div>
<div class="tmt-cards"><div><div class="lbl">Allocated</div><div class="val" style="color:#6cc040" id="card-used">${totalAlloc}</div></div><div><div class="lbl">Remaining</div><div class="val" style="color:${rem > 0 ? '#fbbf24' : '#6a9a58'}" id="card-free">${rem}</div></div><div><div class="lbl">Total Pool</div><div class="val" style="color:#e8f5d8">${maxPool}</div></div><div style="flex:1;display:flex;align-items:flex-end"><div class="tmt-pool-bar" id="pool-bar" style="width:100%">${renderPoolBar()}</div></div></div>
<table class="tmt-tbl" id="teams-tbl"><thead><tr><th style="width:3px;padding:0"></th><th style="width:30px">Team</th><th>Skills</th><th class="c">Points</th></tr></thead><tbody id="teams-body">${teamRows}</tbody></table>
<div class="tmt-footer"><div class="tmt-footer-total"><div class="lbl">Total Training</div><div class="val" id="total">${totalAlloc}<span class="dim">/${maxPool}</span></div></div><div class="tmt-footer-acts"><button class="tmt-act dng" id="btn-clear">Clear All</button><button class="tmt-act" id="btn-reset">Reset</button></div></div>
</div></div>`;
            bindEvents();
        };

        return { render };
    })();

    /* ═══════════════════════════════════════════════════════════
       ███  MODULE: GRAPHS
       ═══════════════════════════════════════════════════════════ */
    const GraphsMod = (() => {
        let lastData = null;
        let containerRef = null;

        const SKILL_META = [
            { key: 'strength', label: 'Strength', color: '#22cc22' }, { key: 'stamina', label: 'Stamina', color: '#00bcd4' },
            { key: 'pace', label: 'Pace', color: '#8bc34a' }, { key: 'marking', label: 'Marking', color: '#f44336' },
            { key: 'tackling', label: 'Tackling', color: '#26a69a' }, { key: 'workrate', label: 'Workrate', color: '#3f51b5' },
            { key: 'positioning', label: 'Positioning', color: '#9c27b0' }, { key: 'passing', label: 'Passing', color: '#e91e63' },
            { key: 'crossing', label: 'Crossing', color: '#2196f3' }, { key: 'technique', label: 'Technique', color: '#ff4081' },
            { key: 'heading', label: 'Heading', color: '#757575' }, { key: 'finishing', label: 'Finishing', color: '#4caf50' },
            { key: 'longshots', label: 'Longshots', color: '#00e5ff' }, { key: 'set_pieces', label: 'Set Pieces', color: '#607d8b' }
        ];
        const SKILL_META_GK = [
            { key: 'strength', label: 'Strength', color: '#22cc22' }, { key: 'stamina', label: 'Stamina', color: '#00bcd4' },
            { key: 'pace', label: 'Pace', color: '#8bc34a' }, { key: 'handling', label: 'Handling', color: '#f44336' },
            { key: 'one_on_ones', label: 'One on ones', color: '#26a69a' }, { key: 'reflexes', label: 'Reflexes', color: '#3f51b5' },
            { key: 'aerial_ability', label: 'Aerial Ability', color: '#9c27b0' }, { key: 'jumping', label: 'Jumping', color: '#e91e63' },
            { key: 'communication', label: 'Communication', color: '#2196f3' }, { key: 'kicking', label: 'Kicking', color: '#ff4081' },
            { key: 'throwing', label: 'Throwing', color: '#757575' }
        ];
        const getSkillMeta = () => isGoalkeeper ? SKILL_META_GK : SKILL_META;
        const PEAK_META = [
            { key: 'physical', label: 'Physical', color: '#ffeb3b' },
            { key: 'tactical', label: 'Tactical', color: '#00e5ff' },
            { key: 'technical', label: 'Technical', color: '#ff4081' }
        ];

        const calcTicks = (min, max, n) => {
            if (max === min) return [min]; const range = max - min; const raw = range / n; const mag = Math.pow(10, Math.floor(Math.log10(raw)));
            const res = raw / mag; let step; if (res <= 1.5) step = mag; else if (res <= 3) step = 2 * mag; else if (res <= 7) step = 5 * mag; else step = 10 * mag;
            const ticks = []; let t = Math.ceil(min / step) * step; while (t <= max + step * 0.01) { ticks.push(Math.round(t * 10000) / 10000); t += step; } return ticks;
        };

        const buildAges = (n, years, months) => { const cur = years + months / 12; const ages = []; for (let i = 0; i < n; i++)ages.push(cur - (n - 1 - i) / 12); return ages; };

        const drawChart = (canvas, ages, values, opts = {}) => {
            const { lineColor = '#fff', fillColor = 'rgba(255,255,255,0.06)', gridColor = 'rgba(255,255,255,0.10)', axisColor = '#9ab889', dotRadius = 2.5, yMinOverride, yMaxOverride, formatY = v => String(Math.round(v)) } = opts;
            const ctx = canvas.getContext('2d'); const dpr = window.devicePixelRatio || 1;
            const cssW = canvas.clientWidth, cssH = canvas.clientHeight;
            canvas.width = cssW * dpr; canvas.height = cssH * dpr; ctx.scale(dpr, dpr);
            const pL = 50, pR = 10, pT = 12, pB = 30, cW = cssW - pL - pR, cH = cssH - pT - pB;
            const minA = Math.floor(Math.min(...ages)), maxA = Math.ceil(Math.max(...ages));
            const rMin = Math.min(...values), rMax = Math.max(...values), m = (rMax - rMin) * 0.06 || 1;
            const yMin = yMinOverride !== undefined ? yMinOverride : Math.floor(rMin - m);
            const yMax = yMaxOverride !== undefined ? yMaxOverride : Math.ceil(rMax + m);
            const xS = v => pL + ((v - minA) / (maxA - minA)) * cW; const yS = v => pT + cH - ((v - yMin) / (yMax - yMin)) * cH;
            ctx.clearRect(0, 0, cssW, cssH); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(pL, pT, cW, cH);
            const yTicks = calcTicks(yMin, yMax, 6);
            ctx.font = '11px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'; ctx.textAlign = 'right';
            yTicks.forEach(tick => { const y = yS(tick); if (y < pT || y > pT + cH) return; ctx.strokeStyle = gridColor; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pL, y); ctx.lineTo(pL + cW, y); ctx.stroke(); ctx.fillStyle = axisColor; ctx.fillText(formatY(tick), pL - 7, y + 4); });
            ctx.textAlign = 'center';
            for (let a = minA; a <= maxA; a++) { const x = xS(a); ctx.strokeStyle = gridColor; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, pT); ctx.lineTo(x, pT + cH); ctx.stroke(); ctx.fillStyle = axisColor; ctx.fillText(String(a), x, pT + cH + 16); }
            ctx.fillStyle = axisColor; ctx.font = '12px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Age', cssW / 2, cssH - 2);
            ctx.beginPath(); ctx.moveTo(xS(ages[0]), yS(values[0])); for (let i = 1; i < values.length; i++)ctx.lineTo(xS(ages[i]), yS(values[i]));
            ctx.lineTo(xS(ages[ages.length - 1]), pT + cH); ctx.lineTo(xS(ages[0]), pT + cH); ctx.closePath(); ctx.fillStyle = fillColor; ctx.fill();
            ctx.beginPath(); ctx.strokeStyle = lineColor; ctx.lineWidth = 1.8; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
            ctx.moveTo(xS(ages[0]), yS(values[0])); for (let i = 1; i < values.length; i++)ctx.lineTo(xS(ages[i]), yS(values[i])); ctx.stroke();
            for (let i = 0; i < values.length; i++) { ctx.beginPath(); ctx.arc(xS(ages[i]), yS(values[i]), dotRadius, 0, Math.PI * 2); ctx.fillStyle = lineColor; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.8; ctx.stroke(); }
            ctx.strokeStyle = 'rgba(120,180,80,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(pL, pT, cW, cH);
            return { xS, yS, ages, values, formatY };
        };

        const drawMultiLine = (canvas, ages, seriesData, opts = {}) => {
            const { gridColor = 'rgba(255,255,255,0.10)', axisColor = '#9ab889', yMinOverride, yMaxOverride, formatY = v => String(Math.round(v)), dotRadius = 1.5, yTickCount = 6 } = opts;
            const ctx = canvas.getContext('2d'); const dpr = window.devicePixelRatio || 1;
            const cssW = canvas.clientWidth, cssH = canvas.clientHeight; canvas.width = cssW * dpr; canvas.height = cssH * dpr; ctx.scale(dpr, dpr);
            const pL = 50, pR = 10, pT = 12, pB = 30, cW = cssW - pL - pR, cH = cssH - pT - pB;
            const vis = seriesData.filter(s => s.visible); let all = []; vis.forEach(s => all.push(...s.values)); if (!all.length) all = [0, 1];
            const rMin = Math.min(...all), rMax = Math.max(...all), m = (rMax - rMin) * 0.06 || 1;
            const yMin = yMinOverride !== undefined ? yMinOverride : Math.floor(rMin - m);
            const yMax = yMaxOverride !== undefined ? yMaxOverride : Math.ceil(rMax + m);
            const minA = Math.floor(Math.min(...ages)), maxA = Math.ceil(Math.max(...ages));
            const xS = v => pL + ((v - minA) / (maxA - minA)) * cW; const yS = v => pT + cH - ((v - yMin) / (yMax - yMin)) * cH;
            ctx.clearRect(0, 0, cssW, cssH); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(pL, pT, cW, cH);
            const yTicks = calcTicks(yMin, yMax, yTickCount);
            ctx.font = '11px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'; ctx.textAlign = 'right';
            yTicks.forEach(tick => { const y = yS(tick); if (y < pT || y > pT + cH) return; ctx.strokeStyle = gridColor; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pL, y); ctx.lineTo(pL + cW, y); ctx.stroke(); ctx.fillStyle = axisColor; ctx.fillText(formatY(tick), pL - 7, y + 4); });
            ctx.textAlign = 'center';
            for (let a = minA; a <= maxA; a++) { const x = xS(a); ctx.strokeStyle = gridColor; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, pT); ctx.lineTo(x, pT + cH); ctx.stroke(); ctx.fillStyle = axisColor; ctx.fillText(String(a), x, pT + cH + 16); }
            ctx.fillStyle = axisColor; ctx.font = '12px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Age', cssW / 2, cssH - 2);
            vis.forEach(s => { ctx.beginPath(); ctx.strokeStyle = s.color; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.moveTo(xS(ages[0]), yS(s.values[0])); for (let i = 1; i < s.values.length; i++)ctx.lineTo(xS(ages[i]), yS(s.values[i])); ctx.stroke(); for (let i = 0; i < s.values.length; i++) { ctx.beginPath(); ctx.arc(xS(ages[i]), yS(s.values[i]), dotRadius, 0, Math.PI * 2); ctx.fillStyle = s.color; ctx.fill(); } });
            ctx.strokeStyle = 'rgba(120,180,80,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(pL, pT, cW, cH);
            return { xS, yS, ages, seriesData, formatY };
        };

        const attachTooltip = (wrap, canvas, info) => {
            const tip = wrap.querySelector('.tmg-tooltip'); if (!tip) return;
            canvas.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top; let best = -1, bd = Infinity; for (let i = 0; i < info.ages.length; i++) { const d = Math.hypot(mx - info.xS(info.ages[i]), my - info.yS(info.values[i])); if (d < bd && d < 25) { bd = d; best = i; } } if (best >= 0) { const a = info.ages[best], v = info.values[best]; const ay = Math.floor(a), am = Math.round((a - ay) * 12); tip.innerHTML = `<b>Age:</b> ${ay}y ${am}m &nbsp; <b>Value:</b> ${info.formatY(v)}`; tip.style.display = 'block'; const px = info.xS(a), py = info.yS(v); let tx = px - tip.offsetWidth / 2; if (tx < 0) tx = 0; if (tx + tip.offsetWidth > canvas.clientWidth) tx = canvas.clientWidth - tip.offsetWidth; tip.style.left = tx + 'px'; tip.style.top = (py - 32) + 'px'; } else tip.style.display = 'none'; });
            canvas.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
        };

        const attachMultiTooltip = (wrap, canvas, infoGetter) => {
            const tip = wrap.querySelector('.tmg-tooltip'); if (!tip) return;
            canvas.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top; const info = infoGetter(); if (!info) return; let best = null, bd = Infinity; info.seriesData.filter(s => s.visible).forEach(s => { for (let i = 0; i < s.values.length; i++) { const d = Math.hypot(mx - info.xS(info.ages[i]), my - info.yS(s.values[i])); if (d < bd && d < 25) { bd = d; best = { series: s, idx: i }; } } }); if (best) { const a = info.ages[best.idx], v = best.series.values[best.idx]; const ay = Math.floor(a), am = Math.round((a - ay) * 12); tip.innerHTML = `<span style="color:${best.series.color}">●</span> <b>${best.series.label}:</b> ${info.formatY(v)} &nbsp; <b>Age:</b> ${ay}y ${am}m`; tip.style.display = 'block'; const px = info.xS(a), py = info.yS(v); let tx = px - tip.offsetWidth / 2; if (tx < 0) tx = 0; if (tx + tip.offsetWidth > canvas.clientWidth) tx = canvas.clientWidth - tip.offsetWidth; tip.style.left = tx + 'px'; tip.style.top = (py - 32) + 'px'; } else tip.style.display = 'none'; });
            canvas.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
        };

        const CHART_DEFS = [
            { key: 'ti', title: 'Training Intensity', opts: { lineColor: '#fff', fillColor: 'rgba(255,255,255,0.05)' }, prepareData: raw => { const v = []; for (let i = 0; i < raw.length; i++) { if (i === 0 && typeof raw[i] === 'number' && Number(raw[i]) === 0) continue; v.push(Number(raw[i])); } return v; } },
            { key: 'skill_index', title: 'ASI', opts: { lineColor: '#fff', fillColor: 'rgba(255,255,255,0.05)', formatY: v => v >= 1000 ? Math.round(v).toLocaleString() : String(Math.round(v)) }, prepareData: raw => raw.map(Number) },
            { key: 'recommendation', title: 'REC', opts: { lineColor: '#fff', fillColor: 'rgba(255,255,255,0.05)', yMinOverride: 0, formatY: v => v.toFixed(1) }, prepareData: raw => { const v = raw.map(Number); return v; }, yMaxFn: vals => Math.max(6, Math.ceil(Math.max(...vals) * 10) / 10) }
        ];

        const MULTI_DEFS = [
            { title: 'Skills', get meta() { return getSkillMeta(); }, showToggle: true, enableKey: 'skills', getSeriesData: g => { const sm = getSkillMeta(); return sm.map(m => ({ key: m.key, label: m.label, color: m.color, values: (g[m.key] || []).map(Number), visible: true })); }, opts: { yMinOverride: 0, yMaxOverride: 20, dotRadius: 1.5, yTickCount: 11 } },
            {
                title: 'Peaks', meta: PEAK_META, showToggle: false, enableKey: 'peaks', getSeriesData: g => {
                    const pk = g.peaks || {};
                    console.log('[Graphs] Raw peaks data', { pk });
                    /* If TM peaks exist, use them */
                    // if (PEAK_META.some(m => pk[m.key] && pk[m.key].length > 0)) {
                    //     return PEAK_META.map(m => ({ key: m.key, label: m.label, color: m.color, values: (pk[m.key] || []).map(Number), visible: true }));
                    // }
                    /* Compute peaks from skills */
                    if (isGoalkeeper) {
                        /* GK: Physical: Str+Sta+Pac+Jum (4×20=80), Tactical: 1v1+Aer+Com (3×20=60), Technical: Han+Ref+Kic+Thr (4×20=80) */
                        const PHYS = ['strength', 'stamina', 'pace', 'jumping'];
                        const TACT = ['one_on_ones', 'aerial_ability', 'communication'];
                        const TECH = ['handling', 'reflexes', 'kicking', 'throwing'];
                        const L = (g[PHYS[0]] || []).length;
                        if (L < 2) return PEAK_META.map(m => ({ key: m.key, label: m.label, color: m.color, values: [], visible: true }));
                        const sumAt = (keys, i) => keys.reduce((s, k) => s + ((g[k] || [])[i] || 0), 0);
                        const phys = [], tact = [], tech = [];
                        for (let i = 0; i < L; i++) {
                            phys.push(Math.round(sumAt(PHYS, i) / 80 * 1000) / 10);
                            tact.push(Math.round(sumAt(TACT, i) / 60 * 1000) / 10);
                            tech.push(Math.round(sumAt(TECH, i) / 80 * 1000) / 10);
                        }
                        return [
                            { key: 'physical', label: 'Physical', color: '#ffeb3b', values: phys, visible: true },
                            { key: 'tactical', label: 'Tactical', color: '#00e5ff', values: tact, visible: true },
                            { key: 'technical', label: 'Technical', color: '#ff4081', values: tech, visible: true }
                        ];
                    }
                    /* Outfield: Physical: Str+Sta+Pac+Hea (4×20=80), Tactical: Mar+Tac+Wor+Pos (4×20=80), Technical: Pas+Cro+Tec+Fin+Lon+Set (6×20=120) */
                    const PHYS = ['strength', 'stamina', 'pace', 'heading'];
                    const TACT = ['marking', 'tackling', 'workrate', 'positioning'];
                    const TECH = ['passing', 'crossing', 'technique', 'finishing', 'longshots', 'set_pieces'];
                    const L = (g[PHYS[0]] || []).length;
                    if (L < 2) return PEAK_META.map(m => ({ key: m.key, label: m.label, color: m.color, values: [], visible: true }));
                    const sumAt = (keys, i) => keys.reduce((s, k) => s + ((g[k] || [])[i] || 0), 0);
                    const phys = [], tact = [], tech = [];
                    for (let i = 0; i < L; i++) {
                        phys.push(Math.round(sumAt(PHYS, i) / 80 * 1000) / 10);
                        tact.push(Math.round(sumAt(TACT, i) / 80 * 1000) / 10);
                        tech.push(Math.round(sumAt(TECH, i) / 120 * 1000) / 10);
                    }
                    console.log('[Graphs] Peaks computed from skills', { g });
                    return [
                        { key: 'physical', label: 'Physical', color: '#ffeb3b', values: phys, visible: true },
                        { key: 'tactical', label: 'Tactical', color: '#00e5ff', values: tact, visible: true },
                        { key: 'technical', label: 'Technical', color: '#ff4081', values: tech, visible: true }
                    ];
                }, opts: { dotRadius: 1.5, yMinOverride: 0, yMaxOverride: 100, formatY: v => v.toFixed(1) + '%' }, legendInline: true
            }
        ];

        const buildSingleChart = (el, def, graphData, player) => {
            let values, ages;
            let enhanced = false;

            /* ASI fallback: if TM's skill_index is missing, reconstruct from TI or store */
            if (def.key === 'skill_index' && (!graphData[def.key] || graphData[def.key].length < 2)) {
                /* Priority 1: reconstruct ASI from TI array + current playerASI */
                if (playerASI > 0 && graphData.ti && graphData.ti.length >= 2) {
                    try {
                        const tiRaw = graphData.ti;
                        /* TI array usually has a dummy 0 at index 0; skip it */
                        const tiStart = (typeof tiRaw[0] === 'number' && tiRaw[0] === 0) || tiRaw[0] === '0' || tiRaw[0] === 0 ? 1 : 0;
                        const tiVals = tiRaw.slice(tiStart).map(v => parseInt(v) || 0);
                        const L = tiVals.length;
                        if (L >= 2) {
                            const K = isGoalkeeper ? 48717927500 : (Math.pow(2, 9) * Math.pow(5, 4) * Math.pow(7, 7));
                            const asiArr = new Array(L);
                            asiArr[L - 1] = playerASI;
                            for (let j = L - 2; j >= 0; j--) {
                                const ti = tiVals[j + 1];
                                const base = Math.pow(asiArr[j + 1] * K, 1 / 7);
                                asiArr[j] = Math.max(0, Math.round(Math.pow(base - ti / 10, 7) / K));
                            }
                            values = asiArr;
                            ages = buildAges(L, player.years, player.months);
                            enhanced = true;
                            console.log(`[Graphs] ASI reconstructed from TI (${L} points)`);
                        }
                    } catch (e) { console.warn('[Graphs] ASI from TI failed', e); }
                }
                /* Priority 2: fall back to store SI records */
                if (!values) {
                    try {
                        const store = PlayerDB.get(PLAYER_ID);
                        if (store && store.records) {
                            const keys = Object.keys(store.records).sort((a, b) => {
                                const [ay, am] = a.split('.').map(Number);
                                const [by, bm] = b.split('.').map(Number);
                                return (ay * 12 + am) - (by * 12 + bm);
                            });
                            const tmpAges = [], tmpVals = [];
                            keys.forEach(k => {
                                const si = parseInt(store.records[k].SI) || 0;
                                if (si <= 0) return;
                                const [y, m] = k.split('.').map(Number);
                                tmpAges.push(y + m / 12);
                                tmpVals.push(si);
                            });
                            /* Extend to current age using live playerASI from page */
                            if (tmpVals.length > 0 && playerASI > 0) {
                                const curAge = player.years + player.months / 12;
                                const lastAge = tmpAges[tmpAges.length - 1];
                                if (curAge > lastAge + 0.001) {
                                    tmpAges.push(curAge);
                                    tmpVals.push(playerASI);
                                }
                            }
                            if (tmpVals.length >= 2) {
                                values = tmpVals;
                                ages = tmpAges;
                                enhanced = true;
                            }
                        }
                    } catch (e) { }
                }
                if (!values) return;
                /* REC fallback: if TM's recommendation is missing, use our store REREC */
            } else if (def.key === 'recommendation' && (!graphData[def.key] || graphData[def.key].length < 2)) {
                try {
                    const store = PlayerDB.get(PLAYER_ID);
                    if (store && store._v >= 3 && store.records) {
                        const keys = Object.keys(store.records).sort((a, b) => {
                            const [ay, am] = a.split('.').map(Number);
                            const [by, bm] = b.split('.').map(Number);
                            return (ay * 12 + am) - (by * 12 + bm);
                        });
                        const tmpAges = [], tmpVals = [];
                        keys.forEach(k => {
                            const rec = store.records[k];
                            if (rec.REREC == null) return;
                            const [y, m] = k.split('.').map(Number);
                            tmpAges.push(y + m / 12);
                            tmpVals.push(rec.REREC);
                        });
                        if (tmpVals.length >= 2) {
                            values = tmpVals;
                            ages = tmpAges;
                            enhanced = true;
                        }
                    }
                } catch (e) { }
                if (!values) return;
            /* TI fallback: compute from ASI differences when TM's TI graph is missing */
            } else if (def.key === 'ti' && (!graphData[def.key] || graphData[def.key].length < 2)) {
                const K = isGoalkeeper ? 48717927500 : (Math.pow(2, 9) * Math.pow(5, 4) * Math.pow(7, 7));
                /* Priority 1: compute TI from ASI graph data */
                if (graphData.skill_index && graphData.skill_index.length >= 2) {
                    try {
                        const asiRaw = graphData.skill_index.map(Number);
                        const tiVals = [];
                        for (let i = 1; i < asiRaw.length; i++) {
                            const prev = Math.pow(asiRaw[i - 1] * K, 1 / 7);
                            const cur = Math.pow(asiRaw[i] * K, 1 / 7);
                            tiVals.push(Math.round((cur - prev) * 10));
                        }
                        if (tiVals.length >= 2) {
                            values = tiVals;
                            /* TI[i] corresponds to training from age[i] to age[i+1], so ages start one later */
                            ages = buildAges(tiVals.length, player.years, player.months);
                            enhanced = true;
                            console.log(`[Graphs] TI computed from ASI graph (${tiVals.length} points)`);
                        }
                    } catch (e) { console.warn('[Graphs] TI from ASI graph failed', e); }
                }
                /* Priority 2: compute TI from IndexedDB SI records */
                if (!values) {
                    try {
                        const store = PlayerDB.get(PLAYER_ID);
                        if (store && store.records) {
                            const keys = Object.keys(store.records).sort((a, b) => {
                                const [ay, am] = a.split('.').map(Number);
                                const [by, bm] = b.split('.').map(Number);
                                return (ay * 12 + am) - (by * 12 + bm);
                            });
                            const tmpAges = [], tmpASI = [];
                            keys.forEach(k => {
                                const si = parseInt(store.records[k].SI) || 0;
                                if (si <= 0) return;
                                const [y, m] = k.split('.').map(Number);
                                tmpAges.push(y + m / 12);
                                tmpASI.push(si);
                            });
                            if (tmpASI.length >= 2) {
                                const tiVals = [], tiAges = [];
                                for (let i = 1; i < tmpASI.length; i++) {
                                    const prev = Math.pow(tmpASI[i - 1] * K, 1 / 7);
                                    const cur = Math.pow(tmpASI[i] * K, 1 / 7);
                                    tiVals.push(Math.round((cur - prev) * 10));
                                    tiAges.push(tmpAges[i]);
                                }
                                if (tiVals.length >= 2) {
                                    values = tiVals;
                                    ages = tiAges;
                                    enhanced = true;
                                    console.log(`[Graphs] TI computed from store SI (${tiVals.length} points)`);
                                }
                            }
                        }
                    } catch (e) { }
                }
                if (!values) return;
            } else {
                const raw = graphData[def.key]; if (!raw) return;
                values = def.prepareData(raw); if (!values.length) return;
                ages = buildAges(values.length, player.years, player.months);
            }

            /* REC hybrid: splice our v3 REREC (0.01 precision) over TM's (0.10) */
            let recSpliceIdx = -1;
            if (def.key === 'recommendation') {
                try {
                    const store = PlayerDB.get(PLAYER_ID);
                    if (store && store._v >= 3 && store.records) {
                        const curAgeMonths = player.years * 12 + player.months;
                        const L = values.length;
                        for (let i = 0; i < L; i++) {
                            const am = curAgeMonths - (L - 1 - i);
                            const key = `${Math.floor(am / 12)}.${am % 12}`;
                            const rec = store.records[key];
                            if (rec && rec.REREC != null) {
                                if (recSpliceIdx < 0) recSpliceIdx = i;
                                values[i] = rec.REREC;
                            }
                        }
                        if (recSpliceIdx >= 0) console.log(`[Graphs] REC hybrid: TM data 0..${recSpliceIdx - 1}, our data ${recSpliceIdx}..${L - 1}`);
                    }
                } catch (e) { }
            }

            /* Dynamic yMax: use yMaxFn if defined (e.g. REC → min 6.0) */
            const chartOpts = { ...def.opts };
            if (def.yMaxFn) chartOpts.yMaxOverride = def.yMaxFn(values);
            /* When we have enhanced REC data, show 2 decimals in tooltip */
            if (recSpliceIdx >= 0 || (enhanced && def.key === 'recommendation')) {
                chartOpts.formatY = v => v % 1 === 0 ? v.toFixed(1) : v.toFixed(2);
            }

            const wrap = document.createElement('div'); wrap.className = 'tmg-chart-wrap';
            let enhLabel = '';
            if (enhanced && def.key === 'skill_index') enhLabel = ' <span style="font-size:10px;color:#f0c040;font-weight:400">(from TI)</span>';
            else if (enhanced && def.key === 'ti') enhLabel = ' <span style="font-size:10px;color:#f0c040;font-weight:400">(from ASI)</span>';
            else if (enhanced && def.key === 'recommendation') enhLabel = ' <span style="font-size:10px;color:#5b9bff;font-weight:400">(computed)</span>';
            else if (recSpliceIdx >= 0) enhLabel = ' <span style="font-size:10px;color:#38bdf8;font-weight:400">(enhanced)</span>';
            wrap.innerHTML = `<div class="tmg-chart-title">${def.title}${enhLabel}</div><canvas class="tmg-canvas" style="width:100%;height:260px;"></canvas><div class="tmg-tooltip"></div>`;
            el.appendChild(wrap);
            const canvas = wrap.querySelector('canvas');
            requestAnimationFrame(() => { const info = drawChart(canvas, ages, values, chartOpts); attachTooltip(wrap, canvas, info); });
        };

        /* Build per-skill arrays from v3 store records — fallback when TM skills unavailable */
        const buildStoreSkillGraphData = (player) => {
            try {
                const store = PlayerDB.get(PLAYER_ID);
                if (!store || !store.records) { console.log('[Skills] No store or no records'); return null; }
                const sm = getSkillMeta();
                const expectedLen = sm.length; /* 14 for outfield, 11 for GK */
                const sortedKeys = Object.keys(store.records).sort((a, b) => {
                    const [ay, am] = a.split('.').map(Number);
                    const [by, bm] = b.split('.').map(Number);
                    return (ay * 12 + am) - (by * 12 + bm);
                });
                console.log('[Skills] store._v:', store._v, 'total records:', sortedKeys.length, 'isGK:', isGoalkeeper);
                const skillArrays = {};
                sm.forEach(m => { skillArrays[m.key] = []; });
                let count = 0;
                sortedKeys.forEach(k => {
                    const rec = store.records[k];
                    const hasSkills = rec.skills && rec.skills.length >= expectedLen;
                    const nonZero = hasSkills && rec.skills.some(v => v !== 0);
                    if (!hasSkills || !nonZero) {
                        console.log(`[Skills] skip ${k}: hasSkills=${hasSkills}, nonZero=${nonZero}`, rec.skills?.slice(0,3));
                        return;
                    }
                    sm.forEach((m, i) => { skillArrays[m.key].push(rec.skills[i]); });
                    count++;
                });
                console.log('[Skills] usable records with skills:', count);
                if (count < 2) return null;
                skillArrays._ages = sortedKeys.filter(k => {
                    const r = store.records[k];
                    return r.skills && r.skills.length >= expectedLen && r.skills.some(v => v !== 0);
                }).map(k => { const [y, m] = k.split('.').map(Number); return y + m / 12; });
                return skillArrays;
            } catch (e) { console.log('[Skills] error:', e); return null; }
        };

        const buildMultiChart = (el, def, graphData, player, skillpoints, isOwnPlayer) => {
            let seriesData = def.getSeriesData(graphData);
            let fromStore = false;
            let storeAges = null;
            if (!seriesData.length || !seriesData[0].values.length) {
                /* Try store fallback */
                const storeGD = buildStoreSkillGraphData(player);
                if (storeGD) {
                    storeAges = storeGD._ages;
                    seriesData = def.getSeriesData(storeGD);
                }
                if (!seriesData.length || !seriesData[0].values.length) {
                    /* No data at all — show enable card if own player, else info msg */
                    if (isOwnPlayer && def.enableKey) {
                        buildEnableCard(el, def.enableKey);
                    } else if (def.enableKey) {
                        const msg = document.createElement('div');
                        msg.style.cssText = 'background:rgba(0,0,0,0.15);border:1px solid rgba(120,180,80,0.2);border-radius:6px;padding:10px 14px;margin:4px 0 8px;color:#5a7a48;font-size:11px;';
                        msg.textContent = `${def.title}: No data available (graph not enabled)`;
                        el.appendChild(msg);
                    }
                    return;
                }
                fromStore = true;
            }
            const ages = storeAges || buildAges(seriesData[0].values.length, player.years, player.months);
            const wrap = document.createElement('div'); wrap.className = 'tmg-chart-wrap';
            const upSet = new Set((skillpoints?.up) || []); const downSet = new Set((skillpoints?.down) || []);
            const legendCls = def.legendInline ? 'tmg-legend tmg-legend-inline' : 'tmg-legend';
            let legendH = `<div class="${legendCls}">`;
            seriesData.forEach((s, i) => { let arr = ''; if (upSet.has(s.key)) arr = '<span class="tmg-skill-arrow" style="color:#4caf50">▲</span>'; else if (downSet.has(s.key)) arr = '<span class="tmg-skill-arrow" style="color:#f44336">▼</span>'; legendH += `<label class="tmg-legend-item"><input type="checkbox" data-idx="${i}" checked style="background:${s.color}"><span class="tmg-legend-dot" style="color:${s.color}">●</span>${s.label}${arr}</label>`; });
            legendH += '</div>';
            let toggleH = def.showToggle ? '<div class="tmg-legend-toggle"><button class="tmg-btn" data-action="all">All</button><button class="tmg-btn" data-action="none">None</button></div>' : '';
            const computedLabel = fromStore ? ' <span style="font-size:10px;color:#5b9bff;font-weight:400">(computed)</span>' : '';
            const enableBtn = (fromStore && isOwnPlayer && def.enableKey)
                ? `<button class="tmg-enable-btn" data-enable-key="${def.enableKey}" style="font-size:10px;padding:3px 10px;margin-left:auto;">Enable <img src="/pics/pro_icon.png" class="pro_icon"></button>`
                : '';
            wrap.innerHTML = `<div class="tmg-chart-title" style="display:flex;align-items:center;gap:8px;">${def.title}${computedLabel}${enableBtn}</div><canvas class="tmg-canvas" style="width:100%;height:280px;"></canvas><div class="tmg-tooltip"></div>${legendH}${toggleH}`;
            el.appendChild(wrap);
            if (enableBtn) {
                wrap.querySelector('.tmg-enable-btn').addEventListener('click', () => {
                    if (typeof window.graph_enable === 'function') window.graph_enable(PLAYER_ID, def.enableKey);
                });
            }
            const canvas = wrap.querySelector('canvas'); let curInfo = null;
            const redraw = () => { curInfo = drawMultiLine(canvas, ages, seriesData, def.opts); };
            wrap.querySelectorAll('.tmg-legend input[type="checkbox"]').forEach(cb => { cb.addEventListener('change', () => { const i = parseInt(cb.dataset.idx); seriesData[i].visible = cb.checked; cb.style.background = cb.checked ? seriesData[i].color : 'rgba(255,255,255,0.08)'; redraw(); }); });
            if (def.showToggle) { wrap.querySelectorAll('.tmg-btn').forEach(btn => { btn.addEventListener('click', () => { const v = btn.dataset.action === 'all'; seriesData.forEach(s => s.visible = v); wrap.querySelectorAll('.tmg-legend input[type="checkbox"]').forEach((cb, i) => { cb.checked = v; cb.style.background = v ? seriesData[i].color : 'rgba(255,255,255,0.08)'; }); redraw(); }); }); }
            attachMultiTooltip(wrap, canvas, () => curInfo);
            requestAnimationFrame(() => redraw());
        };

        /* Enable button descriptions */
        const ENABLE_INFO = {
            skill_index: { title: 'Skill Index', desc: 'Monitor your player\'s ASI increase each training.', enableKey: 'skill_index' },
            recommendation: { title: 'Recommendation', desc: 'See when your player gained new recommendation stars.', enableKey: 'recommendation' },
            skills: { title: 'Skills', desc: 'Monitor when a player gained a point in a certain skill.', enableKey: 'skills' },
            peaks: { title: 'Peaks', desc: 'See what % of weekly training went into each peak area.', enableKey: 'peaks' }
        };

        const hasGraphData = (graphData, key) => {
            if (key === 'skills') return getSkillMeta().some(m => graphData[m.key] && graphData[m.key].length > 0);
            if (key === 'peaks') return graphData.peaks && PEAK_META.some(m => graphData.peaks[m.key] && graphData.peaks[m.key].length > 0);
            return graphData[key] && graphData[key].length > 0;
        };

        /* R5 chart — reads R5 values from our v3 store (not from TM endpoint) */
        const buildR5Chart = (el, player) => {
            try {
                const store = PlayerDB.get(PLAYER_ID);
                if (!store || store._v < 3 || !store.records) return;
                const keys = Object.keys(store.records).sort((a, b) => {
                    const [ay, am] = a.split('.').map(Number);
                    const [by, bm] = b.split('.').map(Number);
                    return (ay * 12 + am) - (by * 12 + bm);
                });
                const ages = [], values = [];
                keys.forEach(k => {
                    const rec = store.records[k];
                    if (rec.R5 == null) return;
                    const [y, m] = k.split('.').map(Number);
                    ages.push(y + m / 12);
                    values.push(rec.R5);
                });
                if (values.length < 2) return;

                const rawMin = Math.min(...values), rawMax = Math.max(...values);
                const yMin = rawMin < 30 ? Math.floor(rawMin) : 30;
                const yMax = rawMax > 120 ? Math.ceil(rawMax) : 120;
                const opts = {
                    lineColor: '#5b9bff', fillColor: 'rgba(91,155,255,0.06)',
                    yMinOverride: yMin, yMaxOverride: yMax,
                    formatY: v => v % 1 === 0 ? v.toFixed(1) : v.toFixed(2)
                };

                const wrap = document.createElement('div'); wrap.className = 'tmg-chart-wrap';
                wrap.innerHTML = `<div class="tmg-chart-title" style="display:flex;align-items:center;justify-content:space-between">
                    <span>R5 <span style="font-size:10px;color:#5b9bff;font-weight:400">(computed)</span></span>
                    <button class="tmg-export-btn" title="Export to Excel">⬇ Excel</button>
                </div><canvas class="tmg-canvas" style="width:100%;height:260px;"></canvas><div class="tmg-tooltip"></div>`;
                el.appendChild(wrap);
                wrap.querySelector('.tmg-export-btn').addEventListener('click', () => {
                    const row = values.map(v => v.toFixed(2).replace('.', ',')).join(';');
                    const csv = 'sep=;\r\n' + row + '\r\n';
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `R5_player_${PLAYER_ID}.csv`;
                    document.body.appendChild(a); a.click();
                    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
                });
                const canvas = wrap.querySelector('canvas');
                requestAnimationFrame(() => { const info = drawChart(canvas, ages, values, opts); attachTooltip(wrap, canvas, info); });
            } catch (e) { }
        };


        const buildEnableCard = (container, key) => {
            const info = ENABLE_INFO[key];
            if (!info) return;
            const card = document.createElement('div');
            card.className = 'tmg-enable-card';
            card.innerHTML = `<div><div class="tmg-enable-title">${info.title}</div><div class="tmg-enable-desc">${info.desc}</div></div><button class="tmg-enable-btn" data-enable-key="${info.enableKey}">Enable <img src="/pics/pro_icon.png" class="pro_icon"></button>`;
            card.querySelector('.tmg-enable-btn').addEventListener('click', () => {
                if (typeof window.graph_enable === 'function') window.graph_enable(PLAYER_ID, info.enableKey);
            });
            container.appendChild(card);
        };

        const render = (container, data) => {
            containerRef = container;
            lastData = data;
            container.innerHTML = '';
            const graphData = data.graphs;
            const player = data.player;
            const skillpoints = data.skillpoints;
            console.log('[Graphs] Rendering with data:', { graphData, player, skillpoints });
            if (!graphData || !player) { container.innerHTML = '<div style="text-align:center;padding:40px;color:#5a7a48;font-style:italic">No graph data available</div>'; return; }

            /* Determine if this is the user's own player (for enable buttons) */
            const clubAnchor = document.querySelector('a[club_link]');
            const clubHrefRaw = clubAnchor ? (clubAnchor.getAttribute('href') || '') : '';
            const clubLinkAttr = clubAnchor ? clubAnchor.getAttribute('club_link') : null;
            const clubIdMatch = clubHrefRaw.match(/\/club\/(\d+)/i) || clubHrefRaw.match(/club_link[=\/]?(\d+)/i);
            const playerClubId = clubIdMatch ? clubIdMatch[1] : (clubLinkAttr || '');
            const isOwnPlayer = getOwnClubIds().includes(String(playerClubId));

            /* TI chart first */
            buildSingleChart(container, CHART_DEFS[0], graphData, player);

            /* R5 chart — built entirely from our v3 store */
            buildR5Chart(container, player);

            /* Remaining charts (ASI, REC) */
            for (let i = 1; i < CHART_DEFS.length; i++) buildSingleChart(container, CHART_DEFS[i], graphData, player);

            MULTI_DEFS.forEach(def => buildMultiChart(container, def, graphData, player, skillpoints, isOwnPlayer));
        };

        const reRender = () => { if (containerRef && lastData) render(containerRef, lastData); };

        return { render, reRender };
    })();

    /* ═══════════════════════════════════════════════════════════
       MAIN UI — Tab bar + panels + data fetching
       ═══════════════════════════════════════════════════════════ */
    const TABS = [
        { key: 'history', label: 'History', mod: HistoryMod },
        { key: 'scout', label: 'Scout', mod: ScoutMod },
        { key: 'training', label: 'Training', mod: TrainingMod },
        { key: 'graphs', label: 'Graphs', mod: GraphsMod }
    ];

    const switchTab = (key) => {
        activeMainTab = key;
        /* highlight active button */
        document.querySelectorAll('.tmpe-main-tab').forEach(b =>
            b.classList.toggle('active', b.dataset.tab === key));
        /* show / hide panels */
        document.querySelectorAll('.tmpe-panel').forEach(p =>
            p.style.display = p.dataset.tab === key ? '' : 'none');

        if (dataLoaded[key]) return; /* already rendered, keep DOM intact */

        const panel = document.querySelector(`.tmpe-panel[data-tab="${key}"]`);
        if (!panel) return;

        panel.innerHTML = '<div class="tmpe-loading"><div class="tmpe-spinner"></div><div class="tmpe-loading-text">Loading…</div></div>';

        $.post('/ajax/players_get_info.ajax.php', {
            player_id: PLAYER_ID,
            type: key,
            show_non_pro_graphs: true
        }).done(res => {
            try {
                const data = typeof res === 'object' ? res : JSON.parse(res);
                dataLoaded[key] = true;
                const tab = TABS.find(t => t.key === key);
                if (tab) tab.mod.render(panel, data);
            } catch (e) {
                panel.innerHTML = '<div class="tmpe-loading"><div style="font-size:20px">⚠</div><div class="tmpe-loading-text" style="color:#f87171">Failed to load data</div></div>';
            }
        }).fail(() => {
            panel.innerHTML = '<div class="tmpe-loading"><div style="font-size:20px">⚠</div><div class="tmpe-loading-text" style="color:#f87171">Failed to load data</div></div>';
        });
    };

    let initRetries = 0;
    const initUI = () => {
        const tabsContent = document.querySelector('.tabs_content');
        if (!tabsContent) {
            if (initRetries++ < 50) setTimeout(initUI, 200);
            return;
        }

        injectCSS();

        /* Build container */
        const container = document.createElement('div');
        container.id = 'tmpe-container';

        /* Tab bar */
        const bar = document.createElement('div');
        bar.className = 'tmpe-tabs-bar';
        const TAB_ICONS = { history: '📋', scout: '🔍', training: '⚙', graphs: '📊' };
        TABS.forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'tmpe-main-tab';
            btn.dataset.tab = t.key;
            btn.innerHTML = `<span class="tmpe-icon">${TAB_ICONS[t.key] || ''}</span>${t.label}`;
            btn.addEventListener('click', () => switchTab(t.key));
            bar.appendChild(btn);
        });
        container.appendChild(bar);

        /* Panels */
        const panels = document.createElement('div');
        panels.className = 'tmpe-panels';
        TABS.forEach(t => {
            const p = document.createElement('div');
            p.className = 'tmpe-panel';
            p.dataset.tab = t.key;
            p.style.display = 'none';
            panels.appendChild(p);
        });
        container.appendChild(panels);

        /* Insert before native .tabs_content */
        tabsContent.parentNode.insertBefore(container, tabsContent);

        /* Load default tab */
        switchTab('history');
    };

    /* ═══════════════════════════════════════════════════════════
       WINDOW RESIZE — redraw graphs
       ═══════════════════════════════════════════════════════════ */
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => GraphsMod.reRender(), 300);
    });

    /* ═══════════════════════════════════════════════════════════
       INIT — wait for IndexedDB, then start everything
       ═══════════════════════════════════════════════════════════ */
    PlayerDB.init().then(() => {
        scanAndMigrateR6();

        if (IS_SQUAD_PAGE) {
            /* ── Squad page: ensure reserves visible, parse, process ── */
            const runSquadSync = async () => {
                await ensureAllPlayersVisible();
                const parsed = parseSquadPage();
                if (parsed && parsed.length) {
                    await processSquadPage(parsed);
                } else {
                    console.warn('[Squad] No players parsed from table');
                }

                /* ── Watch for hash changes (toggle clicks) to re-process newly visible players ── */
                const processedPids = new Set((parsed || []).map(p => p.pid));
                let hashProcessing = false;
                window.addEventListener('hashchange', async () => {
                    if (hashProcessing) return;
                    hashProcessing = true;
                    try {
                        await new Promise(r => setTimeout(r, 600)); /* Wait for DOM update */
                        const reParsed = parseSquadPage();
                        if (!reParsed) { hashProcessing = false; return; }
                        const newPlayers = reParsed.filter(p => !processedPids.has(p.pid));
                        if (newPlayers.length > 0) {
                            console.log(`%c[Squad] Detected ${newPlayers.length} new players after toggle`, 'font-weight:bold;color:#38bdf8');
                            newPlayers.forEach(p => processedPids.add(p.pid));
                            await processSquadPage(newPlayers);
                        }
                    } catch (e) { console.error('[Squad] Re-process error:', e); }
                    hashProcessing = false;
                });
            };
            runSquadSync().catch(e => console.error('[Squad] Squad sync error:', e));
            return; /* Don't run player-specific code on squad page */
        }

        fetchTooltip();
        initUI();
    }).catch(e => {
        console.warn('[DB] IndexedDB init failed, falling back:', e);
        if (IS_SQUAD_PAGE) {
            const parsed = parseSquadPage();
            if (parsed && parsed.length) processSquadPage(parsed);
            return;
        }
        fetchTooltip();
        initUI();
    });

    /* ═══════════════════════════════════════════════════════════
       R5 / TI CALCULATION
       ═══════════════════════════════════════════════════════════ */
    const POS_MULTIPLIERS = [0.3, 0.3, 0.9, 0.6, 1.5, 0.9, 0.9, 0.6, 0.3];
    const COLOR_LEVELS = [
        { color: '#ff4c4c' }, { color: '#ff8c00' }, { color: '#ffd700' },
        { color: '#90ee90' }, { color: '#00cfcf' }, { color: '#5b9bff' }, { color: '#cc88ff' }
    ];
    const R5_THRESHOLDS = [110, 100, 90, 80, 70, 60, 0];
    const TI_THRESHOLDS = [12, 9, 6, 4, 2, 1, -Infinity];
    const REC_THRESHOLDS = [5.5, 5, 4, 3, 2, 1, 0];
    const RTN_THRESHOLDS = [90, 60, 40, 30, 20, 10, 0];

    const WEIGHT_R5 = [
        [0.41029304, 0.18048062, 0.56730138, 1.06344654, 1.02312672, 0.40831256, 0.58235457, 0.12717479, 0.05454137, 0.09089830, 0.42381693, 0.04626272, 0.02199046, 0],
        [0.42126371, 0.18293193, 0.60567629, 0.91904794, 0.89070915, 0.40038476, 0.56146633, 0.15053902, 0.15955429, 0.15682932, 0.42109742, 0.09460329, 0.03589655, 0],
        [0.23412419, 0.32032289, 0.62194779, 0.63162534, 0.63143081, 0.45218831, 0.47370658, 0.55054737, 0.17744915, 0.39932519, 0.26915814, 0.16413124, 0.07404301, 0],
        [0.27276905, 0.26814289, 0.61104798, 0.39865092, 0.42862643, 0.43582015, 0.46617076, 0.44931076, 0.25175412, 0.46446692, 0.29986350, 0.43843061, 0.21494592, 0],
        [0.25219260, 0.25112993, 0.56090649, 0.18230261, 0.18376490, 0.45928749, 0.53498118, 0.59461481, 0.09851189, 0.61601950, 0.31243959, 0.65402884, 0.29982016, 0],
        [0.28155678, 0.24090675, 0.60680245, 0.19068879, 0.20018012, 0.45148647, 0.48230007, 0.42982389, 0.26268609, 0.57933805, 0.31712419, 0.65824985, 0.29885649, 0],
        [0.22029884, 0.29229690, 0.63248227, 0.09904394, 0.10043602, 0.47469498, 0.52919791, 0.77555880, 0.10531819, 0.71048302, 0.27667115, 0.56813972, 0.21537826, 0],
        [0.21151292, 0.35804710, 0.88688492, 0.14391236, 0.13769621, 0.46586605, 0.34446036, 0.51377701, 0.59723919, 0.75126119, 0.16550722, 0.29966502, 0.12417045, 0],
        [0.35479780, 0.14887553, 0.43273380, 0.00023928, 0.00021111, 0.46931131, 0.57731335, 0.41686333, 0.05607604, 0.62121195, 0.45370457, 1.03660702, 0.43205492, 0],
        [0.45462811, 0.30278232, 0.45462811, 0.90925623, 0.45462811, 0.90925623, 0.45462811, 0.45462811, 0.30278232, 0.15139116, 0.15139116]
    ];
    const WEIGHT_RB = [
        [0.10493615, 0.05208547, 0.07934211, 0.14448971, 0.13159554, 0.06553072, 0.07778375, 0.06669303, 0.05158306, 0.02753168, 0.12055170, 0.01350989, 0.02549169, 0.03887550],
        [0.07715535, 0.04943315, 0.11627229, 0.11638685, 0.12893778, 0.07747251, 0.06370799, 0.03830611, 0.10361093, 0.06253997, 0.09128094, 0.01314110, 0.02449199, 0.03726305],
        [0.08219824, 0.08668831, 0.07434242, 0.09661001, 0.08894242, 0.08998026, 0.09281287, 0.08868309, 0.04753574, 0.06042619, 0.05396986, 0.05059984, 0.05660203, 0.03060871],
        [0.06744248, 0.06641401, 0.09977251, 0.08253749, 0.09709316, 0.09241026, 0.08513703, 0.06127851, 0.10275520, 0.07985941, 0.04618960, 0.03927270, 0.05285911, 0.02697852],
        [0.07304213, 0.08174111, 0.07248656, 0.08482334, 0.07078726, 0.09568392, 0.09464529, 0.09580381, 0.04746231, 0.07093008, 0.04595281, 0.05955544, 0.07161249, 0.03547345],
        [0.06527363, 0.06410270, 0.09701305, 0.07406706, 0.08563595, 0.09648566, 0.08651209, 0.06357183, 0.10819222, 0.07386495, 0.03245554, 0.05430668, 0.06572005, 0.03279859],
        [0.07842736, 0.07744888, 0.07201150, 0.06734457, 0.05002348, 0.08350204, 0.08207655, 0.11181914, 0.03756112, 0.07486004, 0.06533972, 0.07457344, 0.09781475, 0.02719742],
        [0.06545375, 0.06145378, 0.10503536, 0.06421508, 0.07627526, 0.09232981, 0.07763931, 0.07001035, 0.11307331, 0.07298351, 0.04248486, 0.06462713, 0.07038293, 0.02403557],
        [0.07738289, 0.05022488, 0.07790481, 0.01356516, 0.01038191, 0.06495444, 0.07721954, 0.07701905, 0.02680715, 0.07759692, 0.12701687, 0.15378395, 0.12808992, 0.03805251],
        [0.07466384, 0.07466384, 0.07466384, 0.14932769, 0.10452938, 0.14932769, 0.10452938, 0.10344411, 0.07512610, 0.04492581, 0.04479831]
    ];

    const WAGE_RATE = 15.8079;
    const TRAINING1 = new Date('2023-01-16T23:00:00Z');
    const SEASON_DAYS = 84;
    const getCurrentSession = () => {
        const now = new Date();
        let day = (now.getTime() - TRAINING1.getTime()) / 1000 / 3600 / 24;
        while (day > SEASON_DAYS - 16 / 24) day -= SEASON_DAYS;
        const s = Math.floor(day / 7) + 1;
        return s <= 0 ? 12 : s;
    };
    const currentSession = getCurrentSession();

    const posGroupColor = posIdx => {
        if (posIdx === 9) return '#4ade80';
        if (posIdx <= 1) return '#60a5fa';
        if (posIdx <= 7) return '#fbbf24';
        return '#f87171';
    };

    const fix2 = v => (Math.round(v * 100) / 100).toFixed(2);

    const getColor = (value, thresholds) => {
        for (let i = 0; i < thresholds.length; i++) {
            if (value >= thresholds[i]) return COLOR_LEVELS[i].color;
        }
        return COLOR_LEVELS[COLOR_LEVELS.length - 1].color;
    };

    const getPositionIndex = pos => {
        switch ((pos || '').toLowerCase()) {
            case 'gk': return 9;
            case 'dc': case 'dcl': case 'dcr': return 0;
            case 'dr': case 'dl': return 1;
            case 'dmc': case 'dmcl': case 'dmcr': return 2;
            case 'dmr': case 'dml': return 3;
            case 'mc': case 'mcl': case 'mcr': return 4;
            case 'mr': case 'ml': return 5;
            case 'omc': case 'omcl': case 'omcr': return 6;
            case 'omr': case 'oml': return 7;
            case 'fc': case 'fcl': case 'fcr': case 'f': return 8;
            default: return 0;
        }
    };

    const calculateRemainders = (posIdx, skills, asi) => {
        const weight = posIdx === 9 ? 48717927500 : 263533760000;
        const skillSum = skills.reduce((sum, s) => sum + parseInt(s), 0);
        const remainder = Math.round((Math.pow(2, Math.log(weight * asi) / Math.log(Math.pow(2, 7))) - skillSum) * 10) / 10;
        let rec = 0, ratingR = 0, remainderW1 = 0, remainderW2 = 0, not20 = 0;
        for (let i = 0; i < WEIGHT_RB[posIdx].length; i++) {
            rec += skills[i] * WEIGHT_RB[posIdx][i];
            ratingR += skills[i] * WEIGHT_R5[posIdx][i];
            if (skills[i] != 20) { remainderW1 += WEIGHT_RB[posIdx][i]; remainderW2 += WEIGHT_R5[posIdx][i]; not20++; }
        }
        if (remainder / not20 > 0.9 || !not20) { not20 = posIdx === 9 ? 11 : 14; remainderW1 = 1; remainderW2 = 5; }
        rec = fix2((rec + remainder * remainderW1 / not20 - 2) / 3);
        return { remainder, remainderW2, not20, ratingR, rec };
    };

    /* Float-aware version: uses parseFloat for skillSum so remainder ≈ 0 with decimal skills */
    const calculateRemaindersF = (posIdx, skills, asi) => {
        const weight = posIdx === 9 ? 48717927500 : 263533760000;
        const skillSum = skills.reduce((sum, s) => sum + parseFloat(s), 0);
        const remainder = Math.round((Math.pow(2, Math.log(weight * asi) / Math.log(Math.pow(2, 7))) - skillSum) * 10) / 10;
        let rec = 0, ratingR = 0, remainderW1 = 0, remainderW2 = 0, not20 = 0;
        for (let i = 0; i < WEIGHT_RB[posIdx].length; i++) {
            rec += skills[i] * WEIGHT_RB[posIdx][i];
            ratingR += skills[i] * WEIGHT_R5[posIdx][i];
            if (skills[i] != 20) { remainderW1 += WEIGHT_RB[posIdx][i]; remainderW2 += WEIGHT_R5[posIdx][i]; not20++; }
        }
        if (!not20) { not20 = posIdx === 9 ? 11 : 14; remainderW1 = 1; remainderW2 = 5; }
        rec = fix2((rec + remainder * remainderW1 / not20 - 2) / 3);
        return { remainder, remainderW2, not20, ratingR, rec };
    };

    const calculateR5 = (posIdx, skills, asi, rou) => {
        const r = calculateRemainders(posIdx, skills, asi);
        const routineBonus = (3 / 100) * (100 - 100 * Math.pow(Math.E, -rou * 0.035));
        let rating = Number(fix2(r.ratingR + (r.remainder * r.remainderW2 / r.not20) + routineBonus * 5));
        const rou2 = routineBonus;
        const goldstar = skills.filter(s => s == 20).length;
        const skillsB = skills.map(s => s == 20 ? 20 : s * 1 + r.remainder / (skills.length - goldstar));
        const sr = skillsB.map((s, i) => i === 1 ? s : s + rou2);
        if (skills.length !== 11) {
            const { pow, E } = Math;
            const hb = sr[10] > 12 ? fix2((pow(E, (sr[10] - 10) ** 3 / 1584.77) - 1) * 0.8 + pow(E, sr[0] ** 2 * 0.007 / 8.73021) * 0.15 + pow(E, sr[6] ** 2 * 0.007 / 8.73021) * 0.05) : 0;
            const fk = fix2(pow(E, (sr[13] + sr[12] + sr[9] * 0.5) ** 2 * 0.002) / 327.92526);
            const ck = fix2(pow(E, (sr[13] + sr[8] + sr[9] * 0.5) ** 2 * 0.002) / 983.65770);
            const pk = fix2(pow(E, (sr[13] + sr[11] + sr[9] * 0.5) ** 2 * 0.002) / 1967.31409);
            const ds = sr[0] ** 2 + sr[1] ** 2 * 0.5 + sr[2] ** 2 * 0.5 + sr[3] ** 2 + sr[4] ** 2 + sr[5] ** 2 + sr[6] ** 2;
            const os = sr[0] ** 2 * 0.5 + sr[1] ** 2 * 0.5 + sr[2] ** 2 + sr[3] ** 2 + sr[4] ** 2 + sr[5] ** 2 + sr[6] ** 2;
            const m = POS_MULTIPLIERS[posIdx];
            return fix2(rating + hb * 1 + fk * 1 + ck * 1 + pk * 1 + fix2(ds / 6 / 22.9 ** 2) * m + fix2(os / 6 / 22.9 ** 2) * m);
        }
        return fix2(rating);
    };

    /* Float-aware R5: uses calculateRemaindersF so remainder ≈ 0 with decimal skills */
    const calculateR5F = (posIdx, skills, asi, rou) => {
        const r = calculateRemaindersF(posIdx, skills, asi);
        const routineBonus = (3 / 100) * (100 - 100 * Math.pow(Math.E, -rou * 0.035));
        let rating = Number(fix2(r.ratingR + (r.remainder * r.remainderW2 / r.not20) + routineBonus * 5));
        const rou2 = routineBonus;
        const goldstar = skills.filter(s => s == 20).length;
        const skillsB = skills.map(s => s == 20 ? 20 : s * 1 + r.remainder / (skills.length - goldstar));
        const sr = skillsB.map((s, i) => i === 1 ? s : s + rou2);
        if (skills.length !== 11) {
            const { pow, E } = Math;
            const hb = sr[10] > 12 ? fix2((pow(E, (sr[10] - 10) ** 3 / 1584.77) - 1) * 0.8 + pow(E, sr[0] ** 2 * 0.007 / 8.73021) * 0.15 + pow(E, sr[6] ** 2 * 0.007 / 8.73021) * 0.05) : 0;
            const fk = fix2(pow(E, (sr[13] + sr[12] + sr[9] * 0.5) ** 2 * 0.002) / 327.92526);
            const ck = fix2(pow(E, (sr[13] + sr[8] + sr[9] * 0.5) ** 2 * 0.002) / 983.65770);
            const pk = fix2(pow(E, (sr[13] + sr[11] + sr[9] * 0.5) ** 2 * 0.002) / 1967.31409);
            const ds = sr[0] ** 2 + sr[1] ** 2 * 0.5 + sr[2] ** 2 * 0.5 + sr[3] ** 2 + sr[4] ** 2 + sr[5] ** 2 + sr[6] ** 2;
            const os = sr[0] ** 2 * 0.5 + sr[1] ** 2 * 0.5 + sr[2] ** 2 + sr[3] ** 2 + sr[4] ** 2 + sr[5] ** 2 + sr[6] ** 2;
            const m = POS_MULTIPLIERS[posIdx];
            return fix2(rating + hb * 1 + fk * 1 + ck * 1 + pk * 1 + fix2(ds / 6 / 22.9 ** 2) * m + fix2(os / 6 / 22.9 ** 2) * m);
        }
        return fix2(rating);
    };

    const calculateTI = (asi, wage, isGK) => {
        if (!asi || !wage || wage <= 30000) return null;
        const w = isGK ? 48717927500 : 263533760000;
        const { pow, log, round } = Math;
        const log27 = log(pow(2, 7));
        return round((pow(2, log(w * asi) / log27) - pow(2, log(w * wage / WAGE_RATE) / log27)) * 10);
    };

    const parseTooltipNumeric = (value) => {
        const normalized = String(value ?? '').replace(/[^0-9.-]/g, '');
        return normalized ? parseFloat(normalized) || 0 : 0;
    };

    const parseTooltipText = (html) => {
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = String(html);
        return tmp.textContent.trim();
    };

    const extractImageSrc = (html) => {
        const match = String(html || '').match(/src=['"]([^'"]+)['"]/i);
        return match ? match[1] : '';
    };

    const parseSkillValue = (value) => {
        if (typeof value === 'string' && value.includes('star')) return value.includes('silver') ? 19 : 20;
        return parseFloat(value) || 0;
    };

    const buildRecommendationStars = (html) => {
        const recHtml = String(html || '');
        if (!recHtml) return '';
        let stars = '';
        const halfStars = (recHtml.match(/half_star\.png/g) || []).length;
        const darkStars = (recHtml.match(/dark_star\.png/g) || []).length;
        const allStarMatches = (recHtml.match(/star\.png/g) || []).length;
        const fullStars = allStarMatches - halfStars - darkStars;
        for (let i = 0; i < fullStars; i++) stars += '<span class="tmpc-star-full">★</span>';
        if (halfStars) stars += '<span class="tmpc-star-half">★</span>';
        const empty = Math.max(0, 5 - fullStars - (halfStars ? 1 : 0));
        for (let i = 0; i < empty; i++) stars += '<span class="tmpc-star-empty">★</span>';
        return stars;
    };

    /* ═══════════════════════════════════════════════════════════
       PLAYER CARD — replace native info_table
       ═══════════════════════════════════════════════════════════ */
    const buildPlayerCard = () => {
        const infoTable = document.querySelector('table.info_table.zebra');
        if (!infoTable || !tooltipPlayer) return;

        /* Extract data from tooltip first; use DOM only where tooltip has no equivalent. */
        const imgEl = infoTable.querySelector('img[src*="player_pic"]');
        const photoSrc = imgEl ? imgEl.getAttribute('src') : (extractImageSrc(tooltipPlayer.appearance) || '/pics/player_pic2.php');
        const infoWrapper = infoTable.closest('div.std') || infoTable.parentElement;

        const clubTd = infoTable.querySelector('a[club_link]')?.closest('td') || null;
        const clubLink = clubTd ? clubTd.querySelector('a[club_link]') : null;
        const clubName = tooltipPlayer.club_name || (clubLink ? clubLink.textContent.trim() : '-');
        const clubHref = clubLink ? clubLink.getAttribute('href') : '';
        const clubFlag = clubTd ? (clubTd.querySelector('.country_link') || { outerHTML: '' }).outerHTML : '';

        const ageYears = parseInt(tooltipPlayer.age) || 0;
        const ageMonths = parseInt(tooltipPlayer.months) || 0;
        const ageTxt = ageYears > 0 ? `${ageYears}.${ageMonths}` : '-';
        const hwCell = [...infoTable.querySelectorAll('td')].find(td => /\d+\s*cm/i.test(td.textContent) && /\d+\s*kg/i.test(td.textContent));
        const hwRaw = hwCell ? hwCell.textContent.trim() : '';
        const hwParts = hwRaw.split('/').map(s => s.trim());
        const heightTxt = hwParts[0] || '-';
        const weightTxt = hwParts[1] || '-';

        const wageDisplay = parseTooltipText(tooltipPlayer.wage) || '-';
        const wageNum = parseTooltipNumeric(tooltipPlayer.wage);

        const asiNum = parseTooltipNumeric(tooltipPlayer.skill_index);
        const asiDisplay = tooltipPlayer.skill_index ? String(tooltipPlayer.skill_index) : '-';
        if (asiNum > 0) playerASI = asiNum;

        const routineVal = parseFloat(tooltipPlayer.routine) || 0;
        playerRoutine = routineVal;

        const statusHtml = tooltipPlayer.status || '';

        const playerName = tooltipPlayer.name || 'Player';
        const posText = tooltipPlayer.fp || parseTooltipText(tooltipPlayer.favorite_position) || '';
        const flagEl = document.querySelector('.box_sub_header .country_link');
        const flagHtml = tooltipPlayer.flag || (flagEl ? flagEl.outerHTML : '');
        const hasNT = !!document.querySelector('.nt_icon');

        /* Parse positions (comma-separated from tooltip) */
        const positions = playerPosition ? playerPosition.split(',').map(s => s.trim()) : [];
        positions.sort((a, b) => getPositionIndex(a) - getPositionIndex(b));
        const posList = positions.map(s => ({ name: s.toUpperCase(), idx: getPositionIndex(s) }));
        const posIdx = posList.length > 0 ? posList[0].idx : 0;

        const recStarsHtml = buildRecommendationStars(tooltipPlayer.recommendation);

        /* R5 / REC / TI calculation — per position */
        const posRatings = [];
        const allPosRatings = [];
        const ALL_OUTFIELD_POS = [
            { name: 'DC', idx: 0 }, { name: 'DL/DR', idx: 1 },
            { name: 'DMC', idx: 2 }, { name: 'DML/DMR', idx: 3 },
            { name: 'MC', idx: 4 }, { name: 'ML/MR', idx: 5 },
            { name: 'OMC', idx: 6 }, { name: 'OML/OMR', idx: 7 },
            { name: 'FC', idx: 8 }
        ];
        let tiVal = null;
        if (tooltipSkills && posList.length > 0) {
            const sv = (name) => {
                const sk = tooltipSkills.find(s => s.name === name);
                if (!sk) return 0;
                const v = sk.value;
                if (typeof v === 'string' && v.includes('star')) return v.includes('silver') ? 19 : 20;
                return parseInt(v) || 0;
            };
            let skills;
            if (posIdx === 9) {
                skills = [sv('Strength'), sv('Pace'), sv('Jumping'), sv('Stamina'), sv('One on ones'), sv('Reflexes'), sv('Aerial Ability'), sv('Communication'), sv('Kicking'), sv('Throwing'), sv('Handling')];
            } else {
                skills = [sv('Strength'), sv('Stamina'), sv('Pace'), sv('Marking'), sv('Tackling'), sv('Workrate'), sv('Positioning'), sv('Passing'), sv('Crossing'), sv('Technique'), sv('Heading'), sv('Finishing'), sv('Longshots'), sv('Set Pieces')];
            }
            if (asiNum > 0 && skills.some(s => s > 0)) {
                /* Try to load decimal skills from v3 store for more precise R5/REC */
                let decSkills = skills; // fallback: integer skills
                let decRoutine = routineVal;
                try {
                    const v3Store = PlayerDB.get(PLAYER_ID);
                    if (v3Store && v3Store._v >= 3 && v3Store.records) {
                        const recKeys = Object.keys(v3Store.records).sort((a, b) => {
                            const [ay, am] = a.split('.').map(Number);
                            const [by, bm] = b.split('.').map(Number);
                            return (ay * 12 + am) - (by * 12 + bm);
                        });
                        if (recKeys.length > 0) {
                            const lastRec = v3Store.records[recKeys[recKeys.length - 1]];
                            if (lastRec && lastRec.skills && lastRec.skills.length === skills.length) {
                                decSkills = lastRec.skills;
                                if (lastRec.routine != null) decRoutine = lastRec.routine;
                                console.log('[Card] Using v3 decimal skills for R5/REC');
                            }
                        }
                    }
                } catch (e) { }

                for (const pp of posList) {
                    const r5 = Number(calculateR5F(pp.idx, decSkills, asiNum, decRoutine));
                    const rec = Number(calculateRemaindersF(pp.idx, decSkills, asiNum).rec);
                    posRatings.push({ name: pp.name, idx: pp.idx, r5, rec });
                }
                /* Calculate R5/REC for ALL outfield positions */
                if (posIdx !== 9) {
                    const playerIdxSet = new Set(posList.map(p => p.idx));
                    for (const ap of ALL_OUTFIELD_POS) {
                        const r5 = Number(calculateR5F(ap.idx, decSkills, asiNum, decRoutine));
                        const rec = Number(calculateRemaindersF(ap.idx, decSkills, asiNum).rec);
                        allPosRatings.push({ name: ap.name, idx: ap.idx, r5, rec, isPlayerPos: playerIdxSet.has(ap.idx) });
                    }
                }
            }
            if (asiNum > 0 && wageNum > 0) {
                const tiRaw = calculateTI(asiNum, wageNum, posIdx === 9);
                tiVal = tiRaw !== null && currentSession > 0
                    ? Number((tiRaw / currentSession).toFixed(1)) : null;
                if (tiVal !== null) playerTI = tiVal;
            }
        }

        /* Build HTML */
        let html = `<div class="tmpc-card">`;
        html += `<div class="tmpc-header">`;
        html += `<img class="tmpc-photo" src="${photoSrc}">`;
        html += `<div class="tmpc-info">`;
        html += `<div class="tmpc-top-grid">`;
        const ntBadge = hasNT ? `<span class="tmpc-nt">🏆 NT</span>` : '';
        html += `<div class="tmpc-name">${playerName} ${flagHtml}</div>`;
        html += `<span class="tmpc-badge-chip"><span class="tmpc-badge-lbl">ASI</span><span style="color:${asiNum > 0 ? '#e8f5d8' : '#5a7a48'}">${asiDisplay}</span></span>`;
        const posChips = posList.map(pp => {
            const clr = posGroupColor(pp.idx);
            return `<span class="tmpc-pos" style="background:${clr}22;border:1px solid ${clr}44;color:${clr}">${pp.name}</span>`;
        }).join('');
        html += `<div class="tmpc-pos-row">${posChips || posText}${ntBadge}</div>`;
        html += `<span class="tmpc-badge-chip"><span class="tmpc-badge-lbl">TI</span><span style="color:${tiVal !== null ? getColor(tiVal, TI_THRESHOLDS) : '#5a7a48'}">${tiVal !== null ? tiVal.toFixed(1) : '—'}</span></span>`;
        html += `</div>`;
        html += `<div class="tmpc-details">`;
        html += `<div class="tmpc-detail"><span class="tmpc-lbl">Club</span><span class="tmpc-val"><a href="${clubHref}" style="color:#80e048;text-decoration:none;font-weight:600">${clubName}</a> ${clubFlag}</span></div>`;
        html += `<div class="tmpc-detail"><span class="tmpc-lbl">Age</span><span class="tmpc-val">${ageTxt}</span></div>`;
        html += `<div class="tmpc-detail"><span class="tmpc-lbl">Height</span><span class="tmpc-val">${heightTxt}</span></div>`;
        html += `<div class="tmpc-detail"><span class="tmpc-lbl">Weight</span><span class="tmpc-val">${weightTxt}</span></div>`;
        html += `<div class="tmpc-detail"><span class="tmpc-lbl">Wage</span><span class="tmpc-val" style="color:#fbbf24">${wageDisplay}</span></div>`;
        html += `<div class="tmpc-detail"><span class="tmpc-lbl">Status</span><span class="tmpc-val">${statusHtml}</span></div>`;
        html += `<div class="tmpc-detail"><span class="tmpc-lbl">REC</span><span class="tmpc-rec-stars">${recStarsHtml}</span></div>`;
        html += `<div class="tmpc-detail"><span class="tmpc-lbl">Routine</span><span class="tmpc-val" style="color:${getColor(routineVal, RTN_THRESHOLDS)}">${routineVal.toFixed(1)}</span></div>`;
        html += `</div>`; /* details */
        html += `</div>`; /* info */
        html += `</div>`; /* header */

        /* Position ratings — R5 & REC per position */
        if (posRatings.length > 0) {
            html += `<div class="tmpc-pos-ratings">`;
            for (const pr of posRatings) {
                const clr = posGroupColor(pr.idx);
                html += `<div class="tmpc-rating-row">`;
                html += `<div class="tmpc-pos-bar" style="background:${clr}"></div>`;
                html += `<span class="tmpc-pos-name" style="color:${clr}">${pr.name}</span>`;
                html += `<span class="tmpc-pos-stat"><span class="tmpc-pos-stat-lbl">R5</span><span class="tmpc-pos-stat-val" style="color:${getColor(pr.r5, R5_THRESHOLDS)}">${pr.r5.toFixed(2)}</span></span>`;
                html += `<span class="tmpc-pos-stat"><span class="tmpc-pos-stat-lbl">REC</span><span class="tmpc-pos-stat-val" style="color:${getColor(pr.rec, REC_THRESHOLDS)}">${pr.rec.toFixed(2)}</span></span>`;
                html += `</div>`;
            }
            /* Expand chevron for all positions (non-GK only) */
            if (allPosRatings.length > 0) {
                html += `<div class="tmpc-expand-toggle" onclick="this.classList.toggle('tmpc-expanded');this.nextElementSibling.classList.toggle('tmpc-expanded')">`;
                html += `<span>All Positions</span><span class="tmpc-expand-chevron">▼</span>`;
                html += `</div>`;
                html += `<div class="tmpc-all-positions">`;
                for (const ap of allPosRatings) {
                    const clr = posGroupColor(ap.idx);
                    const playerCls = ap.isPlayerPos ? ' tmpc-is-player-pos' : '';
                    html += `<div class="tmpc-rating-row${playerCls}">`;
                    html += `<div class="tmpc-pos-bar" style="background:${clr}"></div>`;
                    html += `<span class="tmpc-pos-name" style="color:${clr}">${ap.name}</span>`;
                    html += `<span class="tmpc-pos-stat"><span class="tmpc-pos-stat-lbl">R5</span><span class="tmpc-pos-stat-val" style="color:${getColor(ap.r5, R5_THRESHOLDS)}">${ap.r5.toFixed(2)}</span></span>`;
                    html += `<span class="tmpc-pos-stat"><span class="tmpc-pos-stat-lbl">REC</span><span class="tmpc-pos-stat-val" style="color:${getColor(ap.rec, REC_THRESHOLDS)}">${ap.rec.toFixed(2)}</span></span>`;
                    html += `</div>`;
                }
                html += `</div>`;
            }
            html += `</div>`;
        }

        html += `</div>`; /* card */

        /* ── Clean column2_a: strip TM box chrome ── */
        const col = document.querySelector('.column2_a');
        if (!col) return;
        const box = col.querySelector(':scope > .box');
        const boxBody = box ? box.querySelector(':scope > .box_body') : null;
        if (box && boxBody) {
            [...boxBody.children].forEach(el => {
                if (!el.classList.contains('box_shadow')) col.appendChild(el);
            });
            box.remove();
        }
        /* Remove h3 headers (Skills, Player Info) */
        col.querySelectorAll(':scope > h3').forEach(h => h.remove());
        /* Remove box_sub_header */
        const subHeader = document.querySelector('.box_sub_header.align_center');
        if (subHeader) subHeader.remove();

        /* Replace info_table wrapper with our card */
        const cardEl = document.createElement('div');
        cardEl.innerHTML = html;
        if (infoWrapper && infoWrapper.parentNode === col) {
            col.replaceChild(cardEl.firstChild, infoWrapper);
        } else {
            col.prepend(cardEl.firstChild);
        }
    };

    /* ═══════════════════════════════════════════════════════════
       SKILLS GRID — replace native skill table
       ═══════════════════════════════════════════════════════════ */
    const skillColor = v => {
        if (v >= 20) return 'gold';
        if (v >= 19) return 'silver';
        if (v >= 16) return '#66dd44';
        if (v >= 12) return '#cccc00';
        if (v >= 8) return '#ee9900';
        return '#ee6633';
    };

    const buildSkillsGrid = () => {
        const skillTable = document.querySelector('table.skill_table.zebra');
        if (!skillTable) return;

        /* Parse skills from native table */
        const SKILL_ORDER = [
            ['Strength', 'Passing'],
            ['Stamina', 'Crossing'],
            ['Pace', 'Technique'],
            ['Marking', 'Heading'],
            ['Tackling', 'Finishing'],
            ['Workrate', 'Longshots'],
            ['Positioning', 'Set Pieces']
        ];

        const GK_SKILL_ORDER = [
            ['Strength', 'Handling'],
            ['Stamina', 'One on ones'],
            ['Pace', 'Reflexes'],
            [null, 'Aerial Ability'],
            [null, 'Jumping'],
            [null, 'Communication'],
            [null, 'Kicking'],
            [null, 'Throwing']
        ];

        const parseSkillVal = (td) => {
            if (!td) return 0;
            const img = td.querySelector('img');
            if (img) {
                const alt = img.getAttribute('alt');
                if (alt) return parseInt(alt) || 0;
                const src = img.getAttribute('src') || '';
                if (src.includes('star_silver')) return 19;
                if (src.includes('star.png')) return 20;
            }
            const txt = td.textContent.trim();
            return parseInt(txt) || 0;
        };

        /* Build skill map from tooltip first; DOM is fallback only. */
        const skillMap = {};
        if (Array.isArray(tooltipSkills) && tooltipSkills.length) {
            tooltipSkills.forEach(skill => {
                if (skill?.name) skillMap[skill.name] = parseSkillValue(skill.value);
            });
        }
        if (!Object.keys(skillMap).length) {
            const rows = skillTable.querySelectorAll('tr');
            rows.forEach(row => {
                const ths = row.querySelectorAll('th');
                const tds = row.querySelectorAll('td');
                ths.forEach((th, i) => {
                    const name = th.textContent.trim();
                    if (name && tds[i]) {
                        skillMap[name] = parseSkillVal(tds[i]);
                    }
                });
            });
        }

        /* Detect GK from DOM skill names (fallback for async tooltip timing) */
        const isGK = isGoalkeeper || 'Handling' in skillMap;

        /* Parse hidden skills from DOM */
        const hiddenTable = document.querySelector('#hidden_skill_table');
        const hiddenSkills = [];
        let hasHiddenValues = false;
        if (hiddenTable) {
            const hRows = hiddenTable.querySelectorAll('tr');
            hRows.forEach(row => {
                const ths = row.querySelectorAll('th');
                const tds = row.querySelectorAll('td');
                ths.forEach((th, i) => {
                    const name = th.textContent.trim();
                    const td = tds[i];
                    let val = '';
                    let numVal = 0;
                    if (td) {
                        /* Check tooltip for numeric value */
                        const tip = td.getAttribute('tooltip') || '';
                        const tipMatch = tip.match(/(\d+)\/20/);
                        if (tipMatch) numVal = parseInt(tipMatch[1]) || 0;
                        val = td.textContent.trim();
                    }
                    if (name) {
                        hiddenSkills.push({ name, val, numVal });
                        if (val) hasHiddenValues = true;
                    }
                });
            });
        }

        /* Compute decimal skill values — prefer stored localStorage record for current age */
        const NAMES_OUT_R5 = ['Strength', 'Stamina', 'Pace', 'Marking', 'Tackling', 'Workrate', 'Positioning', 'Passing', 'Crossing', 'Technique', 'Heading', 'Finishing', 'Longshots', 'Set Pieces'];
        const NAMES_GK_R5 = ['Strength', 'Stamina', 'Pace', 'Handling', 'One on ones', 'Reflexes', 'Aerial Ability', 'Jumping', 'Communication', 'Kicking', 'Throwing'];
        const skillNames = isGK ? NAMES_GK_R5 : NAMES_OUT_R5;
        const decimalSkillMap = { ...skillMap };
        let usedStorage = false;
        if (playerAge !== null && playerMonths !== null) {
            const ageKey = `${parseInt(playerAge)}.${playerMonths}`;
            try {
                const store = PlayerDB.get(PLAYER_ID);
                if (store && store._v >= 1 && store.records && store.records[ageKey] && Array.isArray(store.records[ageKey].skills)) {
                    const stored = store.records[ageKey].skills;
                    skillNames.forEach((name, i) => {
                        if (stored[i] !== undefined) decimalSkillMap[name] = stored[i];
                    });
                    usedStorage = true;
                }
            } catch (e) { }
        }
        if (!usedStorage && playerASI && playerASI > 0) {
            const skillsArr = skillNames.map(n => skillMap[n] || 0);
            const w = isGK ? 48717927500 : 263533760000;
            const log27 = Math.log(Math.pow(2, 7));
            const skillSum = skillsArr.reduce((a, b) => a + b, 0);
            const remainder = Math.round((Math.pow(2, Math.log(w * playerASI) / log27) - skillSum) * 10) / 10;
            const goldstar = skillsArr.filter(s => s === 20).length;
            const nonStar = skillsArr.length - goldstar;
            if (remainder > 0 && nonStar > 0) {
                const dec = remainder / nonStar;
                skillNames.forEach(name => {
                    if ((skillMap[name] || 0) !== 20) decimalSkillMap[name] = (skillMap[name] || 0) + dec;
                });
            }
        }

        /* Build display */
        const renderVal = (v) => {
            const floor = Math.floor(v);
            const frac = v - floor;
            if (floor >= 20) return `<span class="tmps-star" style="color:gold">★</span>`;
            if (floor >= 19) {
                const fracStr = frac > 0.005 ? `<span class="tmps-dec">.${Math.round(frac * 100).toString().padStart(2, '0')}</span>` : '';
                return `<span class="tmps-star" style="color:silver">★${fracStr}</span>`;
            }
            const dispVal = frac > 0.005 ? `${floor}<span class="tmps-dec">.${Math.round(frac * 100).toString().padStart(2, '0')}</span>` : floor;
            return `<span style="color:${skillColor(floor)}">${dispVal}</span>`;
        };

        let leftCol = '', rightCol = '';
        const activeOrder = isGK ? GK_SKILL_ORDER : SKILL_ORDER;
        activeOrder.forEach(([left, right]) => {
            if (left) {
                const lv = decimalSkillMap[left] || 0;
                leftCol += `<div class="tmps-row"><span class="tmps-name">${left}</span><span class="tmps-val">${renderVal(lv)}</span></div>`;
            } else {
                leftCol += `<div class="tmps-row" style="visibility:hidden"><span class="tmps-name">&nbsp;</span><span class="tmps-val">&nbsp;</span></div>`;
            }
            if (right) {
                const rv = decimalSkillMap[right] || 0;
                rightCol += `<div class="tmps-row"><span class="tmps-name">${right}</span><span class="tmps-val">${renderVal(rv)}</span></div>`;
            }
        });

        let hiddenH = '';
        if (hasHiddenValues) {
            let hLeft = '', hRight = '';
            for (let i = 0; i < hiddenSkills.length; i++) {
                const hs = hiddenSkills[i];
                const color = hs.numVal ? skillColor(hs.numVal) : '#6a9a58';
                const row = `<div class="tmps-row"><span class="tmps-name">${hs.name}</span><span class="tmps-val" style="color:${color}">${hs.val || '-'}</span></div>`;
                if (i % 2 === 0) hLeft += row; else hRight += row;
            }
            hiddenH = `<div class="tmps-divider"></div><div class="tmps-hidden"><div>${hLeft}</div><div>${hRight}</div></div>`;
        } else {
            /* Get unlock button onclick from original */
            const unlockBtn = document.querySelector('.hidden_skills_text .button');
            const onclick = unlockBtn ? unlockBtn.getAttribute('onclick') || '' : '';
            hiddenH = `<div class="tmps-divider"></div><div class="tmps-unlock"><span class="tmps-unlock-btn" onclick="${onclick}">Assess Hidden Skills <img src="/pics/pro_icon.png" class="pro_icon"></span></div>`;
        }

        const html = `<div class="tmps-wrap"><div class="tmps-grid"><div>${leftCol}</div><div>${rightCol}</div></div>${hiddenH}</div>`;

        /* Replace the native div.std that contains skill_table */
        const parentDiv = skillTable.closest('div.std');
        if (parentDiv) {
            const newDiv = document.createElement('div');
            newDiv.innerHTML = html;
            parentDiv.parentNode.replaceChild(newDiv, parentDiv);
        }
    };

    /* Wait for DOM then replace */
    let skillRetries = 0;
    const tryBuildSkills = () => {
        const hasSkillTable = !!document.querySelector('table.skill_table.zebra');
        const hasTooltipSkillData = Array.isArray(tooltipSkills) && tooltipSkills.length > 0;
        if (hasSkillTable && (hasTooltipSkillData || skillRetries >= 40)) {
            buildSkillsGrid();
        } else if (skillRetries++ < 40) {
            setTimeout(tryBuildSkills, 200);
        }
    };
    tryBuildSkills();

    /* ═══════════════════════════════════════════════════════════
       BEST ESTIMATE — fetch scout data, render card in column1
       ═══════════════════════════════════════════════════════════ */
    const fetchBestEstimate = () => {
        const renderCard = (data) => {
            const html = ScoutMod.getEstimateHtml(data || {});
            if (!html) return;
            const col1 = document.querySelector('.column1');
            if (!col1) return;
            const existing = col1.querySelector('#tmbe-standalone');
            if (existing) existing.remove();
            const el = document.createElement('div');
            el.id = 'tmbe-standalone';
            el.innerHTML = html;
            const nav = col1.querySelector('.tmcn-nav');
            if (nav && nav.nextSibling) {
                col1.insertBefore(el, nav.nextSibling);
            } else {
                col1.appendChild(el);
            }
        };
        $.post('/ajax/players_get_info.ajax.php', {
            player_id: PLAYER_ID, type: 'scout', show_non_pro_graphs: true
        }).done(res => {
            try {
                const data = typeof res === 'object' ? res : JSON.parse(res);
                renderCard(data);
            } catch (e) { renderCard({}); }
        }).fail(() => { renderCard({}); });
    };

    /* ═══════════════════════════════════════════════════════════
       SIDEBAR — restyle column3_a
       ═══════════════════════════════════════════════════════════ */
    const buildSidebar = () => {
        const col3 = document.querySelector('.column3_a');
        if (!col3) return;

        /* ── Extract data before destroying DOM ── */
        /* Transfer buttons */
        const transferBox = col3.querySelector('.transfer_box');
        const btnData = [];
        let transferListed = null; /* { playerId, playerName, minBid } if external player is listed */
        if (transferBox) {
            /* Check if this is an external player on the transfer list */
            const tbText = transferBox.textContent || '';
            const bidBtn = transferBox.querySelector('[onclick*="tlpop_pop_transfer_bid"]');
            if (bidBtn && tbText.includes('transferlisted')) {
                const bidMatch = bidBtn.getAttribute('onclick').match(/tlpop_pop_transfer_bid\(['"]([^'"]*)['"]\s*,\s*\d+\s*,\s*(\d+)\s*,\s*['"]([^'"]*)['"]/);
                if (bidMatch) {
                    transferListed = { minBid: bidMatch[1], playerId: bidMatch[2], playerName: bidMatch[3] };
                }
            }
            if (!transferListed) {
                transferBox.querySelectorAll('span.button').forEach(btn => {
                    const onclick = btn.getAttribute('onclick') || '';
                    const label = btn.textContent.trim();
                    const imgSrc = btn.querySelector('img');
                    let icon = '⚡', cls = 'muted';
                    if (/set_asking/i.test(onclick)) { icon = '💰'; cls = 'yellow'; }
                    else if (/reject/i.test(onclick)) { icon = '🚫'; cls = 'red'; }
                    else if (/transferlist/i.test(onclick)) { icon = '📋'; cls = 'green'; }
                    else if (/fire/i.test(onclick)) { icon = '🗑️'; cls = 'red'; }
                    btnData.push({ onclick, label, icon, cls });
                });
            }
        }

        /* Other options buttons */
        const otherBtns = [];
        const otherSection = col3.querySelectorAll('.box_body .std.align_center');
        const otherDiv = otherSection.length > 1 ? otherSection[1] : (otherSection[0] && !otherSection[0].classList.contains('transfer_box') ? otherSection[0] : null);
        /* Note text */
        let noteText = '';
        const notePar = col3.querySelector('p.dark.rounded');
        if (notePar) {
            noteText = notePar.innerHTML.replace(/<span[^>]*>Note:\s*<\/span>/i, '').replace(/<br\s*\/?>/gi, ' ').trim();
        }
        if (otherDiv) {
            otherDiv.querySelectorAll('span.button').forEach(btn => {
                const onclick = btn.getAttribute('onclick') || '';
                const label = btn.textContent.trim();
                let icon = '⚙️', cls = 'muted';
                if (/note/i.test(label)) { icon = '📝'; cls = 'blue'; }
                else if (/nickname/i.test(label)) { icon = '🏷️'; cls = 'muted'; }
                else if (/favorite.*pos/i.test(label)) { icon = '🔄'; cls = 'muted'; }
                else if (/compare/i.test(label)) { icon = '⚖️'; cls = 'blue'; }
                else if (/demote/i.test(label)) { icon = '⬇️'; cls = 'red'; }
                else if (/promote/i.test(label)) { icon = '⬆️'; cls = 'green'; }
                otherBtns.push({ onclick, label, icon, cls });
            });
        }

        /* Awards — parse structured data from each award_row */
        const awardRows = [];
        col3.querySelectorAll('.award_row').forEach(li => {
            const img = li.querySelector('img');
            const imgSrc = img ? img.getAttribute('src') : '';
            const rawText = li.textContent.trim();

            /* Determine award type from image */
            let awardType = '', awardIcon = '🏆', iconCls = 'gold';
            if (/award_year_u21/.test(imgSrc)) { awardType = 'U21 Player of the Year'; awardIcon = '🌟'; iconCls = 'silver'; }
            else if (/award_year/.test(imgSrc)) { awardType = 'Player of the Year'; awardIcon = '🏆'; iconCls = 'gold'; }
            else if (/award_goal_u21/.test(imgSrc)) { awardType = 'U21 Top Scorer'; awardIcon = '⚽'; iconCls = 'silver'; }
            else if (/award_goal/.test(imgSrc)) { awardType = 'Top Scorer'; awardIcon = '⚽'; iconCls = 'gold'; }

            /* Extract season number */
            const seasonMatch = rawText.match(/season\s+(\d+)/i);
            const season = seasonMatch ? seasonMatch[1] : '';

            /* Extract league link + flag */
            const leagueLink = li.querySelector('a[league_link]');
            const leagueName = leagueLink ? leagueLink.textContent.trim() : '';
            const leagueHref = leagueLink ? leagueLink.getAttribute('href') : '';
            const flagEl = li.querySelector('.country_link');
            const flagHtml = flagEl ? flagEl.outerHTML : '';

            /* Extract stats: goals or rating */
            let statText = '';
            const goalMatch = rawText.match(/(\d+)\s+goals?\s+in\s+(\d+)\s+match/i);
            const ratingMatch = rawText.match(/rating\s+of\s+([\d.]+)\s+in\s+(\d+)\s+match/i);
            if (goalMatch) statText = `${goalMatch[1]} goals / ${goalMatch[2]} games`;
            else if (ratingMatch) statText = `${ratingMatch[1]} avg / ${ratingMatch[2]} games`;

            awardRows.push({ awardType, awardIcon, iconCls, season, leagueName, leagueHref, flagHtml, statText });
        });

        /* ── Build new sidebar HTML ── */
        let h = '<div class="tmps-sidebar">';

        /* Transfer Options (own player) */
        if (btnData.length > 0) {
            h += '<div class="tmps-section">';
            h += '<div class="tmps-section-head">Transfer Options</div>';
            h += '<div class="tmps-btn-list">';
            for (const b of btnData) {
                h += `<button class="tmps-btn ${b.cls}" onclick="${b.onclick.replace(/"/g, '&quot;')}">`;
                h += `<span class="tmps-btn-icon">${b.icon}</span>${b.label}`;
                h += '</button>';
            }
            h += '</div></div>';
        }

        /* Transfer Listed (external player) — live card */
        if (transferListed) {
            h += '<div class="tmtf-card" id="tmtf-live"></div>';
        }

        /* Other Options */
        if (noteText || otherBtns.length > 0) {
            h += '<div class="tmps-section">';
            h += '<div class="tmps-section-head">Options</div>';
            if (noteText) {
                h += `<div class="tmps-note">${noteText}</div>`;
            }
            if (otherBtns.length > 0) {
                h += '<div class="tmps-btn-list">';
                for (const b of otherBtns) {
                    const isCompare = /compare/i.test(b.label);
                    const oc = isCompare ? 'window.tmCompareOpen()' : b.onclick.replace(/"/g, '&quot;');
                    h += `<button class="tmps-btn ${b.cls}" onclick="${oc}">`;
                    h += `<span class="tmps-btn-icon">${b.icon}</span>${b.label}`;
                    h += '</button>';
                }
                h += '</div>';
            }
            h += '</div>';
        }

        /* Awards */
        if (awardRows.length > 0) {
            h += '<div class="tmps-section">';
            h += '<div class="tmps-section-head">Awards</div>';
            h += '<div class="tmps-award-list">';
            for (const a of awardRows) {
                h += `<div class="tmps-award">`;
                h += `<div class="tmps-award-icon ${a.iconCls}">${a.awardIcon}</div>`;
                h += `<div class="tmps-award-body">`;
                h += `<div class="tmps-award-title">${a.awardType}</div>`;
                let sub = '';
                if (a.flagHtml) sub += a.flagHtml + ' ';
                if (a.leagueName) sub += a.leagueHref ? `<a href="${a.leagueHref}">${a.leagueName}</a>` : a.leagueName;
                if (a.statText) sub += (sub ? ' · ' : '') + a.statText;
                if (sub) h += `<div class="tmps-award-sub">${sub}</div>`;
                h += `</div>`;
                if (a.season) h += `<span class="tmps-award-season">S${a.season}</span>`;
                h += `</div>`;
            }
            h += '</div></div>';
        }

        h += '</div>';

        /* ── Replace column3_a contents ── */
        col3.innerHTML = h;

        /* ── Live Transfer Polling ── */
        if (transferListed) {
            const tfCard = document.getElementById('tmtf-live');
            if (tfCard) {
                let tfInterval = null;
                const fmtCoin = (v) => {
                    const n = typeof v === 'string' ? parseInt(v.replace(/[^0-9]/g, '')) : v;
                    return n ? n.toLocaleString('en-US') : '0';
                };
                const fmtBidArg = (v) => {
                    const n = typeof v === 'string' ? parseInt(v.replace(/[^0-9]/g, '')) : v;
                    return n ? n.toLocaleString('en-US') : '0';
                };
                const renderTransfer = (d) => {
                    const isExpired = d.expiry === 'expired';
                    const hasBuyer = d.buyer_id && d.buyer_id !== '0' && d.buyer_name;
                    const isAgent = !hasBuyer && parseInt((d.current_bid || '0').toString().replace(/[^0-9]/g, '')) > 0;
                    let html = `<div class="tmtf-head"><span>🔄 Transfer</span>`;
                    html += `<button class="tmtf-reload" title="Refresh" id="tmtf-reload-btn">↻</button>`;
                    html += `</div><div class="tmtf-body">`;
                    /* Expiry */
                    html += `<div class="tmtf-row"><span class="tmtf-lbl">Expiry</span>`;
                    if (isExpired) {
                        html += `<span class="tmtf-val expired">Expired</span>`;
                    } else {
                        html += `<span class="tmtf-val expiry">${d.expiry}</span>`;
                    }
                    html += `</div>`;
                    /* Current Bid */
                    const curBid = parseInt((d.current_bid || '0').toString().replace(/[^0-9]/g, ''));
                    if (curBid > 0) {
                        html += `<div class="tmtf-row"><span class="tmtf-lbl">Current Bid</span>`;
                        html += `<span class="tmtf-val bid"><span class="coin">${fmtCoin(curBid)}</span></span></div>`;
                    }
                    /* Bidder */
                    if (hasBuyer) {
                        html += `<div class="tmtf-row"><span class="tmtf-lbl">Bidder</span>`;
                        html += `<span class="tmtf-val buyer"><a href="/club/${d.buyer_id}" style="color:#60a5fa;text-decoration:none">${d.buyer_name}</a></span></div>`;
                    } else if (isAgent && !isExpired) {
                        html += `<div class="tmtf-row"><span class="tmtf-lbl">Bidder</span>`;
                        html += `<span class="tmtf-val agent">Agent</span></div>`;
                    }
                    /* Next bid / min bid */
                    if (!isExpired && d.next_bid) {
                        const nextVal = typeof d.next_bid === 'number' ? d.next_bid : parseInt((d.next_bid || '0').toString().replace(/[^0-9]/g, ''));
                        html += `<div class="tmtf-row"><span class="tmtf-lbl">${curBid > 0 ? 'Next Bid' : 'Min Bid'}</span>`;
                        html += `<span class="tmtf-val bid"><span class="coin">${fmtCoin(nextVal)}</span></span></div>`;
                    }
                    /* Expired result */
                    if (isExpired) {
                        if (hasBuyer) {
                            html += `<div class="tmtf-row"><span class="tmtf-lbl">Sold To</span>`;
                            html += `<span class="tmtf-val sold"><a href="/club/${d.buyer_id}" style="color:#4ade80;text-decoration:none">${d.buyer_name}</a></span></div>`;
                            html += `<div class="tmtf-row"><span class="tmtf-lbl">Price</span>`;
                            html += `<span class="tmtf-val sold"><span class="coin">${fmtCoin(d.current_bid)}</span></span></div>`;
                        } else if (curBid > 0) {
                            html += `<div class="tmtf-row"><span class="tmtf-lbl">Result</span>`;
                            html += `<span class="tmtf-val agent">Sold to Agent</span></div>`;
                            html += `<div class="tmtf-row"><span class="tmtf-lbl">Price</span>`;
                            html += `<span class="tmtf-val sold"><span class="coin">${fmtCoin(d.current_bid)}</span></span></div>`;
                        } else {
                            html += `<div class="tmtf-row"><span class="tmtf-lbl">Result</span>`;
                            html += `<span class="tmtf-val expired">Not Sold</span></div>`;
                        }
                    }
                    /* Bid button */
                    if (!isExpired) {
                        const nb = d.next_bid ? fmtBidArg(d.next_bid) : transferListed.minBid;
                        html += `<button class="tmtf-bid-btn" onclick="tlpop_pop_transfer_bid('${nb}',1,${transferListed.playerId},'${transferListed.playerName.replace(/'/g, "\\'")}')">🔨 Make Bid / Agent</button>`;
                    }
                    html += `</div>`;
                    tfCard.innerHTML = html;
                    /* Attach reload */
                    const reloadBtn = document.getElementById('tmtf-reload-btn');
                    if (reloadBtn) reloadBtn.addEventListener('click', () => fetchTransfer());
                    /* Stop polling on expired */
                    if (isExpired && tfInterval) {
                        clearInterval(tfInterval);
                        tfInterval = null;
                    }
                };
                const fetchTransfer = () => {
                    const reloadBtn = document.getElementById('tmtf-reload-btn');
                    if (reloadBtn) { reloadBtn.innerHTML = '<span class="tmtf-spinner"></span>'; reloadBtn.disabled = true; }
                    $.post('/ajax/transfer_get.ajax.php', {
                        type: 'transfer_reload',
                        player_id: transferListed.playerId
                    }, res => {
                        try {
                            const d = typeof res === 'object' ? res : JSON.parse(res);
                            if (d.success) renderTransfer(d);
                        } catch (e) {}
                    }).fail(() => {
                        if (reloadBtn) { reloadBtn.innerHTML = '↻'; reloadBtn.disabled = false; }
                    });
                };
                /* Initial fetch + start interval */
                fetchTransfer();
                tfInterval = setInterval(fetchTransfer, 60000);
            }
        }
    };

    buildSidebar();

    /* ═══════════════════════════════════════════════════════════
       ASI CALCULATOR — widget in column3_a
       ═══════════════════════════════════════════════════════════ */
    const buildASICalculator = () => {
        const col3 = document.querySelector('.column3_a');
        if (!col3) return;

        const K = Math.pow(2, 9) * Math.pow(5, 4) * Math.pow(7, 7); // 263534560000

        const calcASI = (currentASI, trainings, avgTI) => {
            const base = Math.pow(currentASI * K, 1 / 7);
            const added = (avgTI * trainings) / 10;
            if (isGoalkeeper) {
                const ss11 = base / 14 * 11;
                const fs11 = ss11 + added;
                return Math.round(Math.pow(fs11 / 11 * 14, 7) / K);
            }
            return Math.round(Math.pow(base + added, 7) / K);
        };

        const agentVal = (si, ageM, gk) => {
            const a = ageM / 12;
            if (a < 18) return 0;
            let p = Math.round(si * 500 * Math.pow(25 / a, 2.5));
            if (gk) p = Math.round(p * 0.75);
            return p;
        };

        /* Defaults: trainings = months until .11, TI = player average TI */
        const defaultTrainings = playerMonths !== null ? (playerMonths >= 11 ? 12 : 11 - playerMonths) : '';
        const defaultTI = playerTI !== null ? playerTI : '';

        let h = '<div class="tmac-card">';
        h += '<div class="tmac-head">ASI Calculator</div>';
        h += '<div class="tmac-form">';
        h += `<div class="tmac-field"><span class="tmac-label">Trainings</span><input type="number" id="tmac-trainings" class="tmac-input" value="${defaultTrainings}" placeholder="12" min="1" max="500"></div>`;
        h += `<div class="tmac-field"><span class="tmac-label">Avg TI</span><input type="number" id="tmac-ti" class="tmac-input" value="${defaultTI}" placeholder="8" min="0.1" max="10" step="0.1"></div>`;
        h += '<button id="tmac-calc" class="tmsc-send-btn">Calculate</button>';
        h += '</div>';
        h += '<div class="tmac-result" id="tmac-result">';
        h += '<div class="tmac-result-row"><span class="tmac-result-lbl">Age</span><span class="tmac-result-val" id="tmac-age">-</span></div>';
        h += '<div class="tmac-result-row"><span class="tmac-result-lbl">New ASI</span><span class="tmac-result-val" id="tmac-asi">-</span></div>';
        h += '<div class="tmac-result-row"><span class="tmac-result-lbl">Skill Sum</span><span class="tmac-result-val" id="tmac-skillsum">-</span></div>';
        h += '<div class="tmac-result-row"><span class="tmac-result-lbl">Sell To Agent</span><span class="tmac-result-val" id="tmac-sta">-</span></div>';
        h += '</div>';
        h += '</div>';

        const el = document.createElement('div');
        el.innerHTML = h;
        col3.appendChild(el);

        document.getElementById('tmac-calc').addEventListener('click', () => {
            const trainings = parseInt(document.getElementById('tmac-trainings').value) || 0;
            const avgTI = parseFloat(document.getElementById('tmac-ti').value) || 0;
            if (trainings <= 0 || avgTI <= 0 || !playerASI) return;

            const newASI = calcASI(playerASI, trainings, avgTI);
            const asiDiff = newASI - playerASI;

            /* 1 training = 1 month */
            const resultEl = document.getElementById('tmac-result');
            resultEl.classList.add('show');

            const ageEl = document.getElementById('tmac-age');
            if (playerAge !== null && playerMonths !== null) {
                const curYears = Math.floor(playerAge);
                const totalMonths = curYears * 12 + playerMonths + trainings;
                const newYrs = Math.floor(totalMonths / 12);
                const newMos = totalMonths % 12;
                ageEl.innerHTML = `${newYrs}.${newMos}`;
            } else {
                ageEl.textContent = '-';
            }

            const asiEl = document.getElementById('tmac-asi');
            asiEl.innerHTML = `${newASI.toLocaleString()}<span class="tmac-diff">+${asiDiff.toLocaleString()}</span>`;

            /* Skill Sum: current → future */
            const rawBase = Math.pow(playerASI * K, 1 / 7);
            const curSS = isGoalkeeper ? rawBase / 14 * 11 : rawBase;
            const futSS = curSS + (avgTI * trainings) / 10;
            document.getElementById('tmac-skillsum').innerHTML =
                `${curSS.toFixed(1)} → ${futSS.toFixed(1)}`;

            /* Sell To Agent: future price with diff */
            if (playerAge !== null && playerMonths !== null) {
                const curTotMo = Math.floor(playerAge) * 12 + playerMonths;
                const futTotMo = curTotMo + trainings;
                const curSTA = agentVal(playerASI, curTotMo, isGoalkeeper);
                const futSTA = agentVal(newASI, futTotMo, isGoalkeeper);
                const staDiff = futSTA - curSTA;
                const staSign = staDiff >= 0 ? '+' : '';
                document.getElementById('tmac-sta').innerHTML =
                    `${futSTA.toLocaleString()}<span class="tmac-diff">${staSign}${staDiff.toLocaleString()}</span>`;
            } else {
                document.getElementById('tmac-sta').textContent = '-';
            }
        });
    };
    // buildASICalculator called from fetchTooltip callback

    /* ═══════════════════════════════════════════════════════════
       COLUMN1 NAV — replace native menu
       ═══════════════════════════════════════════════════════════ */
    const buildColumn1Nav = () => {
        const col1 = document.querySelector('.column1');
        if (!col1) return;
        const links = col1.querySelectorAll('.content_menu a');
        if (!links.length) return;

        const ICONS = {
            'Squad Overview': '👥',
            'Statistics': '📊',
            'History': '📜',
            'Fixtures': '📅'
        };

        let navH = '<div class="tmcn-nav">';
        links.forEach(a => {
            const label = a.textContent.trim();
            const href = a.getAttribute('href') || '#';
            const icon = ICONS[label] || '📋';
            navH += `<a href="${href}"><span class="tmcn-icon">${icon}</span><span class="tmcn-lbl">${label}</span></a>`;
        });
        navH += '</div>';

        const nav = document.createElement('div');
        nav.innerHTML = navH;
        col1.prepend(nav.firstChild);
    };

    buildColumn1Nav();

    /* ═══════════════════════════════════════════════════════════
       GRAPH SYNC — Build full skill history from graphs endpoint
       when player has unlocked skills. This gives us weekly integer
       skills + ASI from the player's debut, far more data than
       manual visits. Decision matrix:
         No store at all         → try graphs
         Store + graphSync + cur → skip (already done)
         Store + graphSync - cur → regular save (add current week)
         Store - graphSync       → try graphs (overwrite with full history)
       ═══════════════════════════════════════════════════════════ */
    const GRAPH_KEYS_OUT = ['strength', 'stamina', 'pace', 'marking', 'tackling', 'workrate', 'positioning', 'passing', 'crossing', 'technique', 'heading', 'finishing', 'longshots', 'set_pieces'];
    const GRAPH_KEYS_GK = ['strength', 'pace', 'jumping', 'stamina', 'one_on_ones', 'reflexes', 'aerial_ability', 'communication', 'kicking', 'throwing', 'handling'];

    const syncFromGraphs = (year, month, skills, SI, gk) => {
        const ageKey = `${year}.${month}`;
        const store = PlayerDB.get(PLAYER_ID);
        const hasStore = store && store.records;
        const hasGraphSync = hasStore && store.graphSync === true;
        const hasCurWeek = hasStore && store.records[ageKey];

        /* graphSync + current week exists → nothing to do (unless still v1/v2 or has null values) */
        if (hasGraphSync && hasCurWeek) {
            if (store._v < 3) {
                console.log('[GraphSync] graphSync present but store still v' + store._v + ' — running analyzeGrowth');
                setTimeout(analyzeGrowth, 500);
            } else if (!store._nullResynced &&
                       Object.values(store.records).some(r =>
                           r.REREC == null || r.R5 == null || r.routine == null)) {
                console.log('[GraphSync] v3 store has null REREC/R5/routine — re-running analyzeGrowth');
                setTimeout(analyzeGrowth, 500);
            } else {
                console.log('[GraphSync] Already synced from graphs, current week exists — skipping');
            }
            return;
        }

        /* graphSync + current week missing → just do regular save + analyzeGrowth */
        if (hasGraphSync && !hasCurWeek) {
            console.log('[GraphSync] Has graphSync but missing current week — regular save');
            saveCurrentVisit(year, month, skills, SI, gk);
            setTimeout(analyzeGrowth, 800);
            return;
        }

        /* No graphSync → try graphs endpoint */
        console.log('[GraphSync] Trying graphs endpoint...');
        $.post('/ajax/players_get_info.ajax.php', {
            player_id: PLAYER_ID, type: 'graphs', show_non_pro_graphs: true
        }, (res) => {
            try {
                const data = typeof res === 'object' ? res : JSON.parse(res);
                const g = data && data.graphs;
                const graphKeys = gk ? GRAPH_KEYS_GK : GRAPH_KEYS_OUT;
                console.log('[GraphSync] Graphs data received:', g ? Object.keys(g) : 'no graphs');
                /* Check if graphs has skill data (first skill key must exist with data) */
                const firstSkillArr = g && g[graphKeys[0]];
                if (!g || !firstSkillArr || firstSkillArr.length < 2) {
                    console.log('[GraphSync] No graph skill data available — falling back to regular');
                    saveCurrentVisit(year, month, skills, SI, gk);
                    setTimeout(analyzeGrowth, 800);
                    return;
                }

                /* Build v1 store from graph data */
                const L = firstSkillArr.length;

                /* Reconstruct ASI array: prefer skill_index, else derive from TI backwards
                   using the same formula as the ASI Calculator widget:
                   base = (ASI * K)^(1/7), then ASI = (base ± ti/10)^7 / K
                   NOTE: TI (and skill_index) arrays may be 1 longer than skill arrays
                   because they include a pre-pro dummy at index 0. We align using an offset. */
                let asiArr;
                if (g.skill_index && g.skill_index.length >= L) {
                    /* skill_index may have extra pre-pro entry; take the last L entries */
                    const off = g.skill_index.length - L;
                    asiArr = g.skill_index.slice(off).map(v => parseInt(v) || 0);
                } else if (g.ti && g.ti.length >= L) {
                    const K = gk ? 48717927500 : (Math.pow(2, 9) * Math.pow(5, 4) * Math.pow(7, 7));
                    const tiOff = g.ti.length - L; /* usually 1: TI has extra pre-pro entry */
                    asiArr = new Array(L);
                    asiArr[L - 1] = SI; /* current ASI from tooltip */
                    for (let j = L - 2; j >= 0; j--) {
                        const ti = parseInt(g.ti[j + 1 + tiOff]) || 0;
                        const base = Math.pow(asiArr[j + 1] * K, 1 / 7);
                        asiArr[j] = Math.max(0, Math.round(Math.pow(base - ti / 10, 7) / K));
                    }
                    console.log(`[GraphSync] ASI reconstructed from TI (offset=${tiOff}, skill_index unavailable)`);
                } else {
                    asiArr = new Array(L).fill(0);
                    console.log('[GraphSync] No skill_index or TI — ASI set to 0');
                }

                const curAgeMonths = year * 12 + month;
                const _prevStore = PlayerDB.get(PLAYER_ID);
                const newStore = { _v: 1, graphSync: true, lastSeen: Date.now(), records: {} };
                if (_prevStore?.meta) newStore.meta = _prevStore.meta;

                for (let i = 0; i < L; i++) {
                    const ageMonths = curAgeMonths - (L - 1 - i);
                    const yr = Math.floor(ageMonths / 12);
                    const mo = ageMonths % 12;
                    const key = `${yr}.${mo}`;
                    const si = parseInt(asiArr[i]) || 0;
                    const sk = graphKeys.map(k => parseInt(g[k]?.[i]) || 0);

                    newStore.records[key] = {
                        SI: si,
                        REREC: null,
                        R5: null,
                        skills: sk,
                        routine: null
                    };
                }

                PlayerDB.set(PLAYER_ID, newStore);
                const recCount = Object.keys(newStore.records).length;
                console.log(`%c[GraphSync] ✓ Synced player ${PLAYER_ID} from graphs: ${recCount} weeks (full career)`,
                    'font-weight:bold;color:#38bdf8');

                /* Now run analyzeGrowth to convert v1 → v3 */
                setTimeout(analyzeGrowth, 500);

            } catch (e) {
                console.warn('[GraphSync] Parse error, falling back to regular:', e.message);
                saveCurrentVisit(year, month, skills, SI, gk);
                setTimeout(analyzeGrowth, 800);
            }
        }).fail(() => {
            console.warn('[GraphSync] Request failed — falling back to regular');
            saveCurrentVisit(year, month, skills, SI, gk);
            setTimeout(analyzeGrowth, 800);
        });
    };

    /* ═══════════════════════════════════════════════════════════
       SAVE CURRENT VISIT TO GROWTH RECORD
       Writes {pid}_data["year.month"] = { SI, skills } on every visit.
       REREC and R5 are left as stored (filled in by RatingR6 script).
       ═══════════════════════════════════════════════════════════ */
    const saveCurrentVisit = (year, month, skills, SI, gk) => {
        if (!SI || SI <= 0 || !year || !skills || !skills.length) return;
        const ageKey = `${year}.${month}`;
        try {
            /* Compute decimal skill values (skillsC) — same as RatingR6 setJSON */
            const weight = gk ? 48717927500 : 263533760000;
            const log27 = Math.log(Math.pow(2, 7));
            const allSum = skills.reduce((s, v) => s + v, 0);
            const remainder = Math.round((Math.pow(2, Math.log(weight * SI) / log27) - allSum) * 10) / 10;
            const goldstar = skills.filter(v => v === 20).length;
            const nonStar = skills.length - goldstar;
            const skillsC = skills.map(v => v === 20 ? 20 : v + (nonStar > 0 ? remainder / nonStar : 0));

            let store = PlayerDB.get(PLAYER_ID);
            if (!store || !store._v) store = { _v: 1, lastSeen: Date.now(), records: {} };
            const prev = store.records[ageKey] || {};
            if (prev.locked) {
                console.log(`[TmPlayer] Record ${ageKey} is locked (squad sync) — skipping overwrite`);
                return;
            }
            store.records[ageKey] = {
                SI,
                REREC: prev.REREC ?? null,
                R5: prev.R5 ?? null,
                skills: store._v >= 2 && prev.skills ? prev.skills : skillsC,
                routine: prev.routine ?? null
            };
            store.lastSeen = Date.now();
            /* Save player meta (name, pos) for compare dialog */
            if (tooltipPlayer) {
                store.meta = { name: tooltipPlayer.name || '', pos: tooltipPlayer.favposition || '', isGK: gk };
            }
            PlayerDB.set(PLAYER_ID, store);
            console.log(store.records);
            console.log(`[TmPlayer] Saved visit: player ${PLAYER_ID}, age ${ageKey}, SI ${SI}`);
        } catch (e) {
            console.warn('[TmPlayer] saveCurrentVisit failed:', e.message);
        }
    };
    /* ═══════════════════════════════════════════════════════════
       GROWTH ANALYSIS — Week-by-week decimal estimation using
       training weights × TI efficiency curves.
       Goes through stored records chronologically, computes the
       total-skill-point delta each month from the ASI formula,
       distributes it across skills weighted by:
         W[i]  = training allocation for skill i
         eff() = TI-to-skill-point efficiency at that skill level
       Handles gold-star overflow (maxed skill's share goes to ALL
       other non-maxed skills randomly, not to its group mates).
       ═══════════════════════════════════════════════════════════ */
    const analyzeGrowth = () => {
        let store;
        try { store = PlayerDB.get(PLAYER_ID); } catch (e) { return; }
        if (!store || !store.records) return;
        if (store._v >= 3) {
            /* Check if any records have null REREC/R5/routine needing re-sync */
            if (store._nullResynced) return; /* already retried once */
            const hasNulls = Object.values(store.records).some(r =>
                r.REREC == null || r.R5 == null || r.routine == null);
            if (!hasNulls) return;
            console.log('%c[Growth] v3 store has null values — re-processing', 'color:#e8a838;font-weight:bold');
            store._v = 2; /* downgrade to allow full re-processing */
            store._resyncingNulls = true;
        }

        /* Sort records chronologically by age key (year.month) */
        const rawKeys = Object.keys(store.records).sort((a, b) => {
            const [ay, am] = a.split('.').map(Number);
            const [by, bm] = b.split('.').map(Number);
            return (ay * 12 + am) - (by * 12 + bm);
        });
        if (rawKeys.length < 2) {
            /* Single record — can't do delta analysis but can still compute R5/REREC/routine */
            const onlyKey = rawKeys[0];
            const rec = store.records[onlyKey];
            const skills = rec.skills || [];
            const isGKs = skills.length === 11;
            const posIdxS = isGKs ? 9 : (playerPosition ? getPositionIndex(playerPosition.split(',')[0].trim()) : 0);
            const si = parseInt(rec.SI) || 0;
            const rtn = playerRoutine ?? 0;
            const skillsF = skills.map(v => {
                const n = typeof v === 'string' ? parseFloat(v) : v;
                return n >= 20 ? 20 : n;
            });
            const singleStore = {
                _v: 3, lastSeen: Date.now(),
                records: {
                    [onlyKey]: {
                        SI: rec.SI,
                        REREC: Number(calculateRemaindersF(posIdxS, skillsF, si).rec),
                        R5: Number(calculateR5F(posIdxS, skillsF, si, rtn)),
                        skills: skillsF,
                        routine: rtn
                    }
                }
            };
            if (store.graphSync) singleStore.graphSync = true;
            if (store.meta) singleStore.meta = store.meta;
            if (store._nullResynced || store._resyncingNulls) singleStore._nullResynced = true;
            PlayerDB.set(PLAYER_ID, singleStore);
            console.log(`%c[Growth] ✓ Single-record player ${PLAYER_ID} upgraded to v3`,
                'font-weight:bold;color:#6cc040');
            try { GraphsMod.reRender(); } catch (e) { }
            return;
        }

        /* ── Fill gaps: interpolate missing months between recorded ones ── */
        const ageToMonths = (k) => { const [y, m] = k.split('.').map(Number); return y * 12 + m; };
        const monthsToAge = (m) => `${Math.floor(m / 12)}.${m % 12}`;
        const intSkills = (rec) => rec.skills.map(v => {
            const n = typeof v === 'string' ? parseFloat(v) : v;
            return Math.floor(n);
        });
        for (let idx = 0; idx < rawKeys.length - 1; idx++) {
            const aM = ageToMonths(rawKeys[idx]);
            const bM = ageToMonths(rawKeys[idx + 1]);
            const gap = bM - aM;
            if (gap <= 1) continue;
            const rA = store.records[rawKeys[idx]];
            const rB = store.records[rawKeys[idx + 1]];
            const siA = parseInt(rA.SI) || 0, siB = parseInt(rB.SI) || 0;
            const skA = intSkills(rA), skB = intSkills(rB);
            for (let step = 1; step < gap; step++) {
                const t = step / gap;
                const interpKey = monthsToAge(aM + step);
                if (store.records[interpKey]) continue; // already exists
                const interpSI = Math.round(siA + (siB - siA) * t);
                /* For skills: gradually increase — floored integer ramps */
                const interpSk = skA.map((sa, i) => {
                    const sb = skB[i];
                    const diff = sb - sa;
                    return sa + Math.floor(diff * t);
                });
                store.records[interpKey] = {
                    SI: interpSI,
                    REREC: null,
                    R5: null,
                    skills: interpSk,
                    _interpolated: true
                };
            }
        }
        /* Re-sort with interpolated records included */
        const ageKeys = Object.keys(store.records).sort((a, b) =>
            ageToMonths(a) - ageToMonths(b)
        );

        /* Detect GK by skill count from first record */
        const firstSkills = store.records[ageKeys[0]].skills || [];
        const isGK = firstSkills.length === 11;

        /* ── Constants (outfield vs GK) ── */
        const SK = isGK
            ? ['Strength', 'Pace', 'Jumping', 'Stamina', 'One on ones', 'Reflexes', 'Aerial Ability', 'Communication', 'Kicking', 'Throwing', 'Handling']
            : ['Strength', 'Stamina', 'Pace', 'Marking', 'Tackling', 'Workrate',
                'Positioning', 'Passing', 'Crossing', 'Technique', 'Heading',
                'Finishing', 'Longshots', 'Set Pieces'];
        const N = isGK ? 11 : 14;

        /* Training groups (indices into SK array)
           Outfield: T1=Str/Wor/Sta  T2=Mar/Tac  T3=Cro/Pac  T4=Pas/Tec/Set  T5=Hea/Pos  T6=Fin/Lon
           GK: single group — all skills get equal weight (automatic training) */
        const GRP = isGK
            ? [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]  /* GK: one group with all 11 skills */
            : [[0, 5, 1], [3, 4], [8, 2], [7, 9, 13], [10, 6], [11, 12]];
        const GRP_COUNT = isGK ? 1 : 6;
        const GRP_NAMES = isGK
            ? ['GK (all)']
            : ['Str/Wor/Sta', 'Mar/Tac', 'Cro/Pac', 'Pas/Tec/Set', 'Hea/Pos', 'Fin/Lon'];
        const s2g = new Array(N);
        GRP.forEach((g, gi) => g.forEach(si => { s2g[si] = gi; }));

        /* Standard training type → focus group index (outfield only) */
        const STD_FOCUS = { '1': 3, '2': 0, '3': 1, '4': 5, '5': 4, '6': 2 };
        const STD_NAMES = {
            '1': 'Technical', '2': 'Fitness', '3': 'Tactical',
            '4': 'Finishing', '5': 'Defending', '6': 'Wings'
        };

        /* TI efficiency by current skill level (skill points gained per 1 TI) */
        const eff = (lvl) => {
            if (lvl >= 20) return 0;        // gold star – maxed
            if (lvl >= 18) return 0.04;     // 40% chance → ~0.04
            if (lvl >= 15) return 0.05;     // 50% chance → ~0.05
            if (lvl >= 5) return 0.10;     // normal
            return 0.15;                    // 100% + 50% bonus
        };

        /* ASI → total skill points: totalPts = (WEIGHT × SI)^(1/7) */
        const ASI_WEIGHT = isGK ? 48717927500 : 263533760000;
        const LOG128 = Math.log(Math.pow(2, 7));
        const totalPts = (si) => Math.pow(2, Math.log(ASI_WEIGHT * si) / LOG128);

        /* Parse integer skills from a record (handles string / float / number) */
        const intOf = (rec) => rec.skills.map(v => {
            const n = typeof v === 'string' ? parseFloat(v) : v;
            return Math.floor(n);
        });

        /* ── Compute per-skill share of total delta ──
           share[i] = w[i]·eff(level[i]) / Σ(w·eff)
           where w[i] comes from training group allocation.
           If a skill is at 20 its share goes to ALL non-maxed skills
           (random overflow), NOT to its group mates. */
        const calcShares = (intS, gw) => {
            const base = new Array(N).fill(0);
            let overflow = 0;
            for (let gi = 0; gi < GRP_COUNT; gi++) {
                const grp = GRP[gi];
                const perSk = gw[gi] / grp.length;
                for (const si of grp) {
                    if (intS[si] >= 20) overflow += perSk;
                    else base[si] = perSk;
                }
            }
            const nonMax = intS.filter(v => v < 20).length;
            const ovfEach = nonMax > 0 ? overflow / nonMax : 0;
            const w = base.map((b, i) => intS[i] >= 20 ? 0 : b + ovfEach);
            const wE = w.map((wi, i) => wi * eff(intS[i]));
            const tot = wE.reduce((a, b) => a + b, 0);
            return tot > 0 ? wE.map(x => x / tot) : new Array(N).fill(0);
        };

        /* Cap decimals at 0.99 per skill; redistribute overflow to uncapped non-maxed skills */
        const capDecimals = (decArr, intArr) => {
            const CAP = 0.99;
            const d = [...decArr];
            let overflow = 0, passes = 0;
            do {
                overflow = 0;
                let freeCount = 0;
                for (let i = 0; i < N; i++) {
                    if (intArr[i] >= 20) { d[i] = 0; continue; }
                    if (d[i] > CAP) { overflow += d[i] - CAP; d[i] = CAP; }
                    else if (d[i] < CAP) freeCount++;
                }
                if (overflow > 0.0001 && freeCount > 0) {
                    const add = overflow / freeCount;
                    for (let i = 0; i < N; i++) {
                        if (intArr[i] < 20 && d[i] < CAP) d[i] += add;
                    }
                }
            } while (overflow > 0.0001 && ++passes < 20);
            return d;
        };

        /* ── Main analysis runner ── */
        const run = (trainingInfo, historyInfo) => {
            /* Determine group weights from training data */
            let gw = new Array(GRP_COUNT).fill(1 / GRP_COUNT);
            let desc = isGK ? 'GK (balanced)' : 'Balanced (no data)';
            if (!isGK && trainingInfo && trainingInfo.custom) {
                const c = trainingInfo.custom;
                const cd = c.custom;
                if (c.custom_on && cd) {
                    /* Custom training: read dots per group */
                    const dots = [];
                    let dtot = 0;
                    for (let i = 0; i < 6; i++) {
                        const d = parseInt(cd['team' + (i + 1)]?.points) || 0;
                        dots.push(d); dtot += d;
                    }
                    /* Laplace smoothing: 0-dot groups still get a small chance */
                    const sm = 0.5;
                    const den = dtot + 6 * sm;
                    gw = dots.map(d => (d + sm) / den);
                    desc = `Custom dots=[${dots.join(',')}]`;
                } else {
                    /* Standard training type */
                    const t = String(c.team || '3');
                    const fg = STD_FOCUS[t] ?? 1;
                    /* Focus group: 25% targeted + 75%/6 random = 37.5%
                       Other groups: 75%/6 = 12.5% each */
                    gw = new Array(6).fill(0.125);
                    gw[fg] = 0.375;
                    desc = `Standard: ${STD_NAMES[t] || t} → focus ${GRP_NAMES[fg]}`;
                }
            }

            /* ── Compute routine history from history GP data ── */
            const routineMap = {};
            if (playerRoutine !== null && playerAge !== null && historyInfo && historyInfo.table && historyInfo.table.total) {
                const totalRows = historyInfo.table.total.filter(r => typeof r.season === 'number');
                const gpBySeason = {};
                totalRows.forEach(r => { gpBySeason[r.season] = (gpBySeason[r.season] || 0) + (parseInt(r.games) || 0); });
                /* Current season = max season in history (it has games this season) */
                const curSeason = totalRows.length > 0 ? Math.max(...totalRows.map(r => r.season)) : 0;
                const curWeek = currentSession;
                const curAgeMonths = Math.floor(playerAge) * 12 + playerMonths;
                const curRoutine = playerRoutine;
                console.log('[Growth] Routine:', { curSeason, curWeek, curRoutine, gpBySeason });
                for (const ageKey of ageKeys) {
                    const recAgeMonths = ageToMonths(ageKey);
                    const weeksBack = curAgeMonths - recAgeMonths;
                    if (weeksBack <= 0) { routineMap[ageKey] = curRoutine; continue; }
                    let gamesAfter = 0;
                    for (let w = 0; w < weeksBack; w++) {
                        const absWeek = (curSeason - 65) * 12 + (curWeek - 1) - w;
                        const season = 65 + Math.floor(absWeek / 12);
                        const gp = gpBySeason[season] || 0;
                        gamesAfter += (season === curSeason) ? (curWeek > 0 ? gp / curWeek : 0) : gp / 12;
                    }
                    routineMap[ageKey] = Math.max(0, Math.round((curRoutine - gamesAfter * 0.1) * 10) / 10);
                }
                console.log(`%c[Growth] Routine history: ${Object.keys(routineMap).length} records`, 'color:#8abc78');
            }

            /* ── Initial record ── */
            const r0 = store.records[ageKeys[0]];
            const i0 = intOf(r0);
            const t0 = totalPts(r0.SI);
            const iSum0 = i0.reduce((a, b) => a + b, 0);
            const rem0 = t0 - iSum0;
            const sh0 = calcShares(i0, gw);
            let dec = capDecimals(sh0.map(s => Math.max(0, rem0 * s)), i0);

            /* Format helpers */
            const fmtDec = (intV, decV) => {
                if (intV >= 20) return '★';
                const d = Math.max(0, decV);
                return `${intV}.${Math.round(d * 100).toString().padStart(2, '0')}`;
            };

            /* Collect summary rows */
            const summary = [];
            const posIdx = isGK ? 9 : (playerPosition ? getPositionIndex(playerPosition.split(',')[0].trim()) : 0);
            const makeRow = (key, si, intArr, decArr, interp, routine) => {
                const row = { Age: interp ? `${key} ≈` : key, ASI: si };
                SK.forEach((n, i) => { row[n.substring(0, 3)] = fmtDec(intArr[i], decArr[i]); });
                const rtn = routine ?? routineMap[key];
                row.Rtn = rtn != null ? rtn : '-';
                if (si > 0) {
                    const skillsF = intArr.map((v, i) => v >= 20 ? 20 : v + decArr[i]);
                    const r = rtn != null ? rtn : 0;
                    /* Old: integer skills + flat remainder */
                    const oldRem = calculateRemainders(posIdx, intArr, si);
                    row.oREC = Number(oldRem.rec);
                    row.oR5 = Number(calculateR5(posIdx, intArr, si, r));
                    /* New: decimal skills (float-aware, no double-counting) */
                    const newRem = calculateRemaindersF(posIdx, skillsF, si);
                    row.nREC = Number(newRem.rec);
                    row.nR5 = Number(calculateR5F(posIdx, skillsF, si, r));
                } else { row.oREC = '-'; row.oR5 = '-'; row.nREC = '-'; row.nR5 = '-'; }
                return row;
            };
            summary.push(makeRow(ageKeys[0], parseInt(r0.SI) || 0, i0, dec, !!store.records[ageKeys[0]]._interpolated, routineMap[ageKeys[0]]));



            /* ── Process each subsequent record ── */
            for (let m = 1; m < ageKeys.length; m++) {
                const prevKey = ageKeys[m - 1], currKey = ageKeys[m];
                const prevRec = store.records[prevKey], currRec = store.records[currKey];
                const pi = intOf(prevRec), ci = intOf(currRec);
                const pt = totalPts(prevRec.SI), ct = totalPts(currRec.SI);
                const delta = ct - pt;
                const ciSum = ci.reduce((a, b) => a + b, 0);
                const cRem = ct - ciSum;

                /* Distribute delta by shares (prev skills determine weights) */
                const sh = calcShares(pi, gw);
                const gains = sh.map(s => delta * s);

                /* Add gains to previous decimals */
                let newDec = dec.map((d, i) => d + gains[i]);

                /* Handle level-ups: subtract integer gain, clamp to 0 */
                for (let i = 0; i < N; i++) {
                    const chg = ci[i] - pi[i];
                    if (chg > 0) {
                        newDec[i] -= chg;
                        if (newDec[i] < 0) newDec[i] = 0;
                    }
                    if (ci[i] >= 20) newDec[i] = 0;
                }

                /* Normalize: scale so Σdecimals = actual remainder from ASI */
                const ndSum = newDec.reduce((a, b) => a + b, 0);
                if (ndSum > 0.001) {
                    const scale = cRem / ndSum;
                    dec = capDecimals(newDec.map((d, i) => ci[i] >= 20 ? 0 : d * scale), ci);
                } else {
                    /* All near-zero → re-seed from shares */
                    const csh = calcShares(ci, gw);
                    dec = capDecimals(csh.map(s => Math.max(0, cRem * s)), ci);
                }

                summary.push(makeRow(currKey, parseInt(currRec.SI) || 0, ci, dec, !!currRec._interpolated, routineMap[currKey]));
            }

            /* ── Week-by-week summary table ── */
            console.log(`%c[Growth] ═══ Player ${PLAYER_ID} — ${ageKeys.length} weeks (≈ = interpolated) ═══`,
                'font-weight:bold;color:#6cc040');
            // console.table(summary);
            console.log(summary.slice(-1)[0].nR5)

            /* ── Migrate: overwrite {pid}_data with weighted decimals + routine (_v:3) ── */
            const growthStore = { _v: 3, lastSeen: Date.now(), records: {} };
            if (store.graphSync) growthStore.graphSync = true;
            if (store.meta) growthStore.meta = store.meta;
            /* Mark _nullResynced if this was a re-sync of a previously v3 store */
            if (store._nullResynced || store._resyncingNulls) growthStore._nullResynced = true;
            /* Re-iterate to build records with computed skillsC */
            /* We already have the summary, but we need the raw dec arrays.
               Re-run quickly just to collect the float arrays. */
            {
                const r0g = store.records[ageKeys[0]];
                const i0g = intOf(r0g);
                const t0g = totalPts(r0g.SI);
                const iSum0g = i0g.reduce((a, b) => a + b, 0);
                const rem0g = t0g - iSum0g;
                const sh0g = calcShares(i0g, gw);
                let decG = capDecimals(sh0g.map(s => Math.max(0, rem0g * s)), i0g);
                const skillsC0 = i0g.map((v, i) => v >= 20 ? 20 : v + decG[i]);
                const prev0 = store.records[ageKeys[0]];
                growthStore.records[ageKeys[0]] = {
                    SI: prev0.SI,
                    REREC: Number(calculateRemaindersF(posIdx, skillsC0, parseInt(prev0.SI) || 0).rec),
                    R5: Number(calculateR5F(posIdx, skillsC0, parseInt(prev0.SI) || 0, routineMap[ageKeys[0]] || 0)),
                    skills: skillsC0,
                    routine: routineMap[ageKeys[0]] ?? null
                };

                for (let m = 1; m < ageKeys.length; m++) {
                    const pKey = ageKeys[m - 1], cKey = ageKeys[m];
                    const pRec = store.records[pKey], cRec = store.records[cKey];
                    const pig = intOf(pRec), cig = intOf(cRec);
                    const ptg = totalPts(pRec.SI), ctg = totalPts(cRec.SI);
                    const deltaG = ctg - ptg;
                    const ciSumG = cig.reduce((a, b) => a + b, 0);
                    const cRemG = ctg - ciSumG;

                    const shG = calcShares(pig, gw);
                    const gainsG = shG.map(s => deltaG * s);
                    let newDecG = decG.map((d, i) => d + gainsG[i]);

                    for (let i = 0; i < N; i++) {
                        const chg = cig[i] - pig[i];
                        if (chg > 0) { newDecG[i] -= chg; if (newDecG[i] < 0) newDecG[i] = 0; }
                        if (cig[i] >= 20) newDecG[i] = 0;
                    }

                    const ndSumG = newDecG.reduce((a, b) => a + b, 0);
                    if (ndSumG > 0.001) {
                        const scaleG = cRemG / ndSumG;
                        decG = capDecimals(newDecG.map((d, i) => cig[i] >= 20 ? 0 : d * scaleG), cig);
                    } else {
                        const cshG = calcShares(cig, gw);
                        decG = capDecimals(cshG.map(s => Math.max(0, cRemG * s)), cig);
                    }

                    const skillsCm = cig.map((v, i) => v >= 20 ? 20 : v + decG[i]);
                    growthStore.records[cKey] = {
                        SI: cRec.SI,
                        REREC: Number(calculateRemaindersF(posIdx, skillsCm, parseInt(cRec.SI) || 0).rec),
                        R5: Number(calculateR5F(posIdx, skillsCm, parseInt(cRec.SI) || 0, routineMap[cKey] || 0)),
                        skills: skillsCm,
                        routine: routineMap[cKey] ?? null
                    };
                }
            }
            PlayerDB.set(PLAYER_ID, growthStore);
            console.log(`%c[Growth] ✓ Migrated player ${PLAYER_ID} to v3 (weighted decimals + routine)`,
                'font-weight:bold;color:#6cc040');

            /* Re-render graphs if already displayed, so REC chart picks up REREC */
            try { GraphsMod.reRender(); } catch (e) { }

            /* Log comparison for last record */
            const lastKey = ageKeys[ageKeys.length - 1];
            const oldRec = store.records[lastKey];
            const newRec = growthStore.records[lastKey];
            if (oldRec && newRec) {
                const cmpRows = SK.map((name, i) => {
                    const oldV = typeof oldRec.skills[i] === 'string' ? parseFloat(oldRec.skills[i]) : oldRec.skills[i];
                    const newV = newRec.skills[i];
                    const diff = newV - oldV;
                    return {
                        Skill: name,
                        Old: oldV >= 20 ? '★' : oldV.toFixed(2),
                        New: newV >= 20 ? '★' : newV.toFixed(2),
                        Diff: oldV >= 20 && newV >= 20 ? '-' : (diff >= 0 ? '+' : '') + diff.toFixed(2)
                    };
                });
                const totalOld = cmpRows.reduce((s, r) => s + (r.Old === '★' ? 20 : parseFloat(r.Old)), 0);
                const totalNew = cmpRows.reduce((s, r) => s + (r.New === '★' ? 20 : parseFloat(r.New)), 0);
                cmpRows.push({
                    Skill: '── TOTAL ──',
                    Old: totalOld.toFixed(2),
                    New: totalNew.toFixed(2),
                    Diff: ((totalNew - totalOld) >= 0 ? '+' : '') + (totalNew - totalOld).toFixed(2)
                });
                // console.table(cmpRows);

                /* Log old vs new REC and R5 for last record */
                const lastSI = parseInt(newRec.SI) || 0;
                const lastRtn = newRec.routine || 0;
                const oldSkills = oldRec.skills.map(v => typeof v === 'string' ? parseFloat(v) : v);
                const newSkills = newRec.skills;
                const oREC = Number(calculateRemainders(posIdx, oldSkills.map(Math.floor), lastSI).rec);
                const nREC = Number(calculateRemaindersF(posIdx, newSkills, lastSI).rec);
                const oR5 = Number(calculateR5(posIdx, oldSkills.map(Math.floor), lastSI, lastRtn));
                const nR5 = Number(calculateR5F(posIdx, newSkills, lastSI, lastRtn));
                console.log(`%c[Growth] REC: ${oREC} → ${nREC} (${(nREC - oREC) >= 0 ? '+' : ''}${(nREC - oREC).toFixed(2)})  |  R5: ${oR5} → ${nR5} (${(nR5 - oR5) >= 0 ? '+' : ''}${(nR5 - oR5).toFixed(2)})`,
                    'font-weight:bold;color:#5b9bff');
            }


        };

        /* Fetch training + history data in parallel */
        const _parse = r => { try { return typeof r === 'object' ? r : JSON.parse(r); } catch (e) { return null; } };
        const trainReq = $.post('/ajax/players_get_info.ajax.php', {
            player_id: PLAYER_ID, type: 'training', show_non_pro_graphs: true
        }).then(r => _parse(r), () => null);
        const histReq = $.post('/ajax/players_get_info.ajax.php', {
            player_id: PLAYER_ID, type: 'history', show_non_pro_graphs: true
        }).then(r => _parse(r), () => null);
        Promise.all([trainReq, histReq]).then(([t, h]) => run(t, h));
    };

    /* analyzeGrowth is now triggered by syncFromGraphs after data sync */

})();
