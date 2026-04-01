import { TmLib } from '../lib/tm-lib.js';
import { TmPlayerArchiveDB, TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmPlayerService } from '../services/player.js';
import { TmSquad } from '../lib/tm-squad.js';
import { TmUtils } from '../lib/tm-utils.js';

(function () {
    'use strict';

    if (!/^\/players\/?$/.test(location.pathname)) return;

    const getSquadRoot = () => document.getElementById('sq');

    const ensureSquadRootInDom = () => {
        let sq = getSquadRoot();
        if (sq) return { sq, created: false };

        sq = document.createElement('div');
        sq.id = 'sq';

        const filters = document.getElementById('filters');
        if (filters?.parentNode) {
            filters.parentNode.insertBefore(sq, filters.nextSibling);
            return { sq, created: true };
        }

        const primaryHost = document.querySelector('.column2_a') || document.querySelector('.main_center');
        if (primaryHost) {
            primaryHost.appendChild(sq);
            return { sq, created: true };
        }

        document.body.appendChild(sq);
        return { sq, created: true };
    };

    const installJqueryBrowserCompat = () => {
        const jq = window.jQuery || window.$;
        if (!jq || jq.browser) return !!jq;
        const ua = navigator.userAgent || '';
        const msieMatch = ua.match(/(?:msie |rv:)(\d+(?:\.\d+)?)/i);
        jq.browser = {
            msie: /msie|trident/i.test(ua),
            version: msieMatch ? msieMatch[1] : '0'
        };
        return true;
    };

    const waitForSquadRoot = (timeoutMs = 12000) => new Promise(resolve => {
        const existing = getSquadRoot();
        if (existing) { resolve(existing); return; }

        const started = Date.now();
        const timer = window.setInterval(() => {
            const sq = getSquadRoot();
            if (sq) {
                window.clearInterval(timer);
                resolve(sq);
                return;
            }
            if ((Date.now() - started) >= timeoutMs) {
                window.clearInterval(timer);
                resolve(null);
            }
        }, 250);
    });

    installJqueryBrowserCompat();
    ensureSquadRootInDom();

    const PlayerDB = TmPlayerDB;
    const PlayerArchiveDB = TmPlayerArchiveDB;
    const { NAMES_OUT_SHORT, NAMES_GK_SHORT, extractSkills,
        createSquadLoader, parseSquadPage } = TmSquad;

    /* -----------------------------------------------------------
       Process: fetch tooltips, distribute decimals,
       log results with +/- compared to previous week.
       ----------------------------------------------------------- */
    const processSquadPage = async (players) => {
        if (!players || !players.length) return;

        /* Efficiency weight for decimal distribution (same scale as TM's internal model) */
        const eff = TmUtils.skillEff;

        const fetchTip = pid => TmPlayerService.fetchPlayerTooltip(pid).then(d => d?.player ?? null);
        const delay = ms => new Promise(r => setTimeout(r, ms));

        console.log(`%c[Squad] Fetching tooltips for ${players.length} players...`, 'font-weight:bold;color:var(--tmu-info)');

        const loader = createSquadLoader();
        const results = [];

        for (let pi = 0; pi < players.length; pi++) {
            const p = players[pi];
            loader.update(pi + 1, players.length, p.name);

            const curAgeKeyCheck = `${p.ageYears}.${p.ageMonths}`;
            const existingStore = PlayerDB.get(p.pid);
            const existingRec = existingStore?.records?.[curAgeKeyCheck];
            const weeksSince = (Date.now() - (existingStore?.lastSeen || 0)) / 604800000;
            if (existingRec?.locked || (existingRec && weeksSince < 1)) {
                const reason = existingRec?.locked ? 'locked' : `fresh (${weeksSince.toFixed(1)}w ago)`;
                console.log(`[Squad] ${p.name} — ${reason} for ${curAgeKeyCheck}, skipping`);
                continue;
            }

            const tip = await fetchTip(p.pid);
            await delay(100);

            if (!tip) {
                console.warn(`[Squad] Could not fetch tooltip for ${p.name} (${p.pid})`);
                continue;
            }

            /* tip is already normalizePlayer'd by TmApi.fetchPlayerTooltip */
            const asi = tip.asi;
            const routine = tip.routine;
            const favpos = tip.favposition || '';
            const isGK = tip.isGK;
            const N = isGK ? 11 : 14;

            const intSkills = tip.skills ? extractSkills(tip.skills, isGK) : p.skills;

            /* --- Previous DB record for decimal propagation --- */
            const dbRecord = PlayerDB.get(p.pid);
            let prevDecimals = null, prevSkillsFull = null, curDbSkillsFull = null;

            if (dbRecord?.records) {
                const keys = Object.keys(dbRecord.records).sort((a, b) => {
                    const [ay, am] = a.split('.').map(Number);
                    const [by, bm] = b.split('.').map(Number);
                    return (ay * 12 + am) - (by * 12 + bm);
                });

                const curAgeKey = `${p.ageYears}.${p.ageMonths}`;
                const curDbRec = dbRecord.records[curAgeKey];
                if (curDbRec?.skills?.length === N) {
                    curDbSkillsFull = curDbRec.skills.map(v => {
                        const n = typeof v === 'string' ? parseFloat(v) : v;
                        return n >= 20 ? 20 : n;
                    });
                }

                let prevIdx = keys.length - 1;
                if (keys.length > 1 && keys[prevIdx] === curAgeKey) prevIdx = keys.length - 2;

                if (prevIdx >= 0) {
                    const prevRec = dbRecord.records[keys[prevIdx]];
                    if (prevRec?.skills?.length === N) {
                        prevSkillsFull = prevRec.skills.map(v => {
                            const n = typeof v === 'string' ? parseFloat(v) : v;
                            return n >= 20 ? 20 : n;
                        });
                        prevDecimals = prevSkillsFull.map(v => v >= 20 ? 0 : v - Math.floor(v));
                    }
                }
            }

            /* --- ASI remainder (total decimal points not yet reflected as integer gains) --- */
            const K = isGK ? 48717927500 : 263533760000;
            const intSum = intSkills.reduce((s, v) => s + v, 0);
            const asiRemainder = asi > 0
                ? Math.round((Math.pow(2, Math.log(K * asi) / Math.log(128)) - intSum) * 100) / 100
                : 0;

            const improvementMap = {};
            p.improved.forEach(imp => { improvementMap[imp.index] = imp.type; });

            const totalGain = p.TI / 10;
            let newDecimals;

            if (prevDecimals && asi > 0) {
                newDecimals = [...prevDecimals];

                const improvedIndices = p.improved.map(imp => imp.index);
                if (improvedIndices.length > 0 && totalGain > 0) {
                    const effWeights = improvedIndices.map(i => eff(intSkills[i]));
                    const effTotal = effWeights.reduce((a, b) => a + b, 0);
                    const shares = effTotal > 0
                        ? effWeights.map(w => w / effTotal)
                        : effWeights.map(() => 1 / improvedIndices.length);
                    improvedIndices.forEach((idx, j) => { newDecimals[idx] += totalGain * shares[j]; });
                }

                for (const imp of p.improved) {
                    if (imp.type === 'one_up') newDecimals[imp.index] = 0.00;
                }

                let overflow = 0, passes = 0;
                do {
                    overflow = 0; let freeCount = 0;
                    for (let i = 0; i < N; i++) {
                        if (intSkills[i] >= 20) { newDecimals[i] = 0; continue; }
                        if (newDecimals[i] >= 1.0) { overflow += newDecimals[i] - 0.99; newDecimals[i] = 0.99; }
                        else if (newDecimals[i] < 0.99) freeCount++;
                    }
                    if (overflow > 0.0001 && freeCount > 0) {
                        const add = overflow / freeCount;
                        for (let i = 0; i < N; i++) { if (intSkills[i] < 20 && newDecimals[i] < 0.99) newDecimals[i] += add; }
                    }
                } while (overflow > 0.0001 && ++passes < 20);

                let subtleOverflow = 0;
                passes = 0;
                do {
                    subtleOverflow = 0;
                    for (let i = 0; i < N; i++) {
                        if (intSkills[i] >= 20) continue;
                        const prevInt = prevSkillsFull ? Math.floor(prevSkillsFull[i]) : intSkills[i];
                        if (!improvementMap[i] && intSkills[i] === prevInt && newDecimals[i] >= 1.0) {
                            subtleOverflow += newDecimals[i] - 0.99;
                            newDecimals[i] = 0.99;
                        }
                    }
                    if (subtleOverflow > 0.0001) {
                        let freeSlots = 0;
                        for (let i = 0; i < N; i++) { if (intSkills[i] < 20 && newDecimals[i] < 0.99) freeSlots++; }
                        if (freeSlots > 0) {
                            const add2 = subtleOverflow / freeSlots;
                            for (let i = 0; i < N; i++) { if (intSkills[i] < 20 && newDecimals[i] < 0.99) newDecimals[i] += add2; }
                        }
                    }
                } while (subtleOverflow > 0.0001 && ++passes < 20);

                const decSum = newDecimals.reduce((a, b) => a + b, 0);
                if (decSum > 0.001 && asiRemainder > 0) {
                    const scale = asiRemainder / decSum;
                    newDecimals = newDecimals.map((d, i) => intSkills[i] >= 20 ? 0 : d * scale);
                } else if (asiRemainder > 0) {
                    const nonMax = intSkills.filter(v => v < 20).length;
                    newDecimals = intSkills.map(v => v >= 20 ? 0 : asiRemainder / nonMax);
                }

                passes = 0;
                do {
                    overflow = 0; let freeCount = 0;
                    for (let i = 0; i < N; i++) {
                        if (intSkills[i] >= 20) { newDecimals[i] = 0; continue; }
                        if (newDecimals[i] > 0.99) { overflow += newDecimals[i] - 0.99; newDecimals[i] = 0.99; }
                        else if (newDecimals[i] < 0) { newDecimals[i] = 0; }
                        else if (newDecimals[i] < 0.99) freeCount++;
                    }
                    if (overflow > 0.0001 && freeCount > 0) {
                        const add = overflow / freeCount;
                        for (let i = 0; i < N; i++) { if (intSkills[i] < 20 && newDecimals[i] < 0.99) newDecimals[i] += add; }
                    }
                } while (overflow > 0.0001 && ++passes < 20);

            } else if (asi > 0) {
                const nonMax = intSkills.filter(v => v < 20).length;
                newDecimals = intSkills.map(v => v >= 20 ? 0 : (nonMax > 0 ? asiRemainder / nonMax : 0));
            } else {
                newDecimals = new Array(N).fill(0);
            }

            const newSkillsFull = intSkills.map((v, i) => v >= 20 ? 20 : v + (newDecimals[i] || 0));
            const diffSkills = curDbSkillsFull ? newSkillsFull.map((v, i) => v - curDbSkillsFull[i]) : null;

            /* --- R5 / REC per position --- */
            const allPositions = favpos.split(',').map(s => s.trim()).filter(Boolean);
            let R5 = null, REC = null, R5_DB = null;
            let bestPos = allPositions[0] || '';
            const r5ByPos = {};

            if (asi > 0) {
                let bestR5 = -Infinity;
                for (const pos of allPositions) {
                    const posIdx = TmLib.getPositionIndex(pos);
                    const fakePlayer = { skills: newSkillsFull, asi, routine: routine || 0 };
                    const r5v = TmLib.calculatePlayerR5({ id: posIdx }, fakePlayer);
                    const recv = TmLib.calculatePlayerREC({ id: posIdx }, fakePlayer);
                    r5ByPos[pos] = { R5: r5v, REC: recv };
                    if (r5v > bestR5) { bestR5 = r5v; R5 = r5v; REC = recv; bestPos = pos; }
                }
                if (curDbSkillsFull) {
                    R5_DB = TmLib.calculatePlayerR5({ id: TmLib.getPositionIndex(bestPos) }, { skills: curDbSkillsFull, asi, routine: routine || 0 });
                }
            }

            results.push({
                pid: p.pid, name: p.name, number: p.number,
                ageYears: p.ageYears, ageMonths: p.ageMonths,
                position: favpos, isGK, asi, routine,
                TI: p.TI, TI_change: p.TI_change,
                intSkills, newDecimals, newSkillsFull,
                prevSkillsFull, curDbSkillsFull, diffSkills,
                improved: p.improved,
                R5, R5_DB, REC, r5ByPos, bestPos,
                asiRemainder, hadPrevData: !!prevDecimals
            });
        }

        /* --- Console output --- */
        console.log(`%c[Squad] --- Processed ${results.length} players ---`, 'font-weight:bold;color:var(--tmu-success)');

        const fv = v => v >= 20 ? '★' : v.toFixed(2);

        for (const r of results) {
            const SHORT = r.isGK ? NAMES_GK_SHORT : NAMES_OUT_SHORT;
            const N = r.isGK ? 11 : 14;
            const rows = [];

            for (let i = 0; i < N; i++) {
                const imp = r.improved.find(x => x.index === i);
                const marker = imp ? (imp.type === 'one_up' ? '↑+1' : '↑') : '';
                rows.push({
                    Skill: SHORT[i],
                    DB: r.curDbSkillsFull ? fv(r.curDbSkillsFull[i]) : '-',
                    New: fv(r.newSkillsFull[i]),
                    Diff: r.diffSkills
                        ? (Math.abs(r.diffSkills[i]) < 0.005 ? '' : (r.diffSkills[i] >= 0 ? '+' : '') + r.diffSkills[i].toFixed(2))
                        : '',
                    Train: marker
                });
            }

            const totalNew = r.newSkillsFull.reduce((s, v) => s + v, 0);
            const totalDb = r.curDbSkillsFull ? r.curDbSkillsFull.reduce((s, v) => s + v, 0) : null;
            rows.push({
                Skill: 'TOTAL',
                DB: totalDb != null ? totalDb.toFixed(2) : '-',
                New: totalNew.toFixed(2),
                Diff: totalDb != null ? ((totalNew - totalDb) >= 0 ? '+' : '') + (totalNew - totalDb).toFixed(2) : '',
                Train: ''
            });

            const posR5Str = Object.entries(r.r5ByPos).map(([pos, v]) => `${pos}:${v.R5.toFixed(1)}`).join(' ');
            console.log(
                `%c-- ${r.name} (#${r.number}) -- Age:${r.ageYears}.${String(r.ageMonths).padStart(2, '0')} | ${r.position} | ASI:${r.asi} | Rtn:${r.routine} | TI:${r.TI}(${r.TI_change >= 0 ? '+' : ''}${r.TI_change}) | Best:${r.bestPos} R5_DB:${r.R5_DB != null ? r.R5_DB.toFixed(2) : '?'} R5_New:${r.R5 != null ? r.R5.toFixed(2) : '?'} | R5[${posR5Str}] | REC:${r.REC != null ? r.REC.toFixed(2) : '?'} | Rem:${r.asiRemainder.toFixed(2)} | DB:${r.curDbSkillsFull ? '✓' : '✗'}`,
                'font-weight:bold;color:var(--tmu-warning)'
            );
            console.table(rows);
        }

        /* --- Sync to IndexedDB --- */
        loader.update(0, results.length, 'Syncing to DB...');
        const bar = document.getElementById('tmrc-loader-bar');
        if (bar) bar.style.width = '0%';

        let syncCount = 0;
        for (const r of results) {
            if (r.asi <= 0) { syncCount++; continue; }

            const ageKey = `${r.ageYears}.${r.ageMonths}`;
            let store = PlayerDB.get(r.pid);
            if (!store?._v) store = { _v: 1, lastSeen: Date.now(), records: {} };

            store.records[ageKey] = {
                SI: r.asi,
                REREC: r.REC,
                R5: r.R5,
                skills: r.newSkillsFull.map(v => Math.round(v * 100) / 100),
                routine: r.routine,
                locked: true
            };
            store.lastSeen = Date.now();
            if (!store.meta) store.meta = { name: r.name, pos: r.position, isGK: r.isGK };

            await PlayerDB.set(r.pid, store);
            syncCount++;

            const pct = Math.round((syncCount / results.length) * 100);
            if (bar) bar.style.width = pct + '%';
            const txt = document.getElementById('tmrc-loader-text');
            if (txt) txt.textContent = `Syncing ${syncCount}/${results.length} — ${r.name}`;
        }

        console.log(`%c[Squad] ✓ Synced ${syncCount} players to IndexedDB`, 'font-weight:bold;color:var(--tmu-success)');
        loader.done(syncCount);

        return results;
    };

    /* -----------------------------------------------------------
       INIT — wait for IndexedDB, then start
       ----------------------------------------------------------- */
    const runSquadSync = async () => {
        const sq = await waitForSquadRoot();
        if (!sq) {
            console.warn('[Squad] #sq did not appear; skipping players sync init');
            return;
        }
        const parsed = parseSquadPage();
        if (!parsed?.length) { console.warn('[Squad] No players parsed from table'); return; }

        await processSquadPage(parsed);
    };

    PlayerDB.init().then(() => PlayerArchiveDB.init()).then(() => {
        runSquadSync().catch(e => console.error('[Squad] Squad sync error:', e));
    }).catch(e => {
        console.warn('[DB] IndexedDB init failed, falling back:', e);
        const parsed = parseSquadPage();
        if (parsed?.length) processSquadPage(parsed);
    });

})();
