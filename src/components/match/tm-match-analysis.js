import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmMatchUtils } from './tm-match-utils.js';

const { R5_THRESHOLDS } = TmConst;
    const getColor = TmUtils.getColor;

    export const TmMatchAnalysis = {
        render(body, mData, opts = {}) {
            const getPlayerData = opts.getPlayerData;
            body.html(TmUI.loading('Analyzing squads\u2026'));

            const homeId = String(mData.club.home.id);
            const awayId = String(mData.club.away.id);
            const homeName = mData.club.home.club_name;
            const awayName = mData.club.away.club_name;
            const homeColor = mData.club.home.color;
            const awayColor = mData.club.away.color;
            const md = mData.match_data;

            // Position categories
            const GK_POS = new Set(['gk']);
            const DEF_POS = new Set(['dl', 'dr', 'dc', 'dcl', 'dcr']);
            const MID_POS = new Set(['dml', 'dmr', 'dmc', 'dmcl', 'dmcr', 'ml', 'mr', 'mc', 'mcl', 'mcr', 'oml', 'omr', 'omc', 'omcl', 'omcr']);
            const ATT_POS = new Set(['fcl', 'fc', 'fcr']);

            const getLine = (pos) => {
                if (GK_POS.has(pos)) return 'GK';
                if (DEF_POS.has(pos)) return 'DEF';
                if (MID_POS.has(pos)) return 'MID';
                if (ATT_POS.has(pos)) return 'ATT';
                return 'SUB';
            };

            // Detect formation from starters
            const detectFormation = (lineup) => {
                let d = 0, m = 0, a = 0;
                Object.values(lineup).forEach(p => {
                    if (p.position.includes('sub')) return;
                    const line = getLine(p.position);
                    if (line === 'DEF') d++;
                    else if (line === 'MID') m++;
                    else if (line === 'ATT') a++;
                });
                return `${d}-${m}-${a}`;
            };

            // Form analysis
            const calcForm = (form) => {
                if (!form || !form.length) return { dots: [], pts: 0, last5: 0 };
                const dots = form.map(f => f.result);
                const pts = dots.reduce((s, r) => s + (r === 'w' ? 3 : r === 'd' ? 1 : 0), 0);
                const last5 = dots.slice(-5).reduce((s, r) => s + (r === 'w' ? 3 : r === 'd' ? 1 : 0), 0);
                return { dots, pts, last5 };
            };

            const homeForm = calcForm(mData.club.home.form);
            const awayForm = calcForm(mData.club.away.form);

            // Fetch R5 for all players
            const { routineMap, positionMap } = TmMatchUtils.buildMatchMaps(mData);
            const allPlayers = mData.allPlayers;

            Promise.all(allPlayers.map(p =>
                getPlayerData(p.player_id, routineMap, positionMap)
                    .then(d => ({ id: p.player_id, r5: d.R5, age: d.Age }))
                    .catch(() => ({ id: p.player_id, r5: null, age: null }))
            )).then(results => {
                // Build per-player R5 map
                const r5Map = new Map();
                const ageMap = new Map();
                results.forEach(({ id, r5, age }) => {
                    if (r5 !== null) r5Map.set(String(id), r5);
                    if (age !== null) ageMap.set(String(id), age);
                });

                // Group by line for each side
                const lineR5 = { home: { GK: [], DEF: [], MID: [], ATT: [], ALL: [] }, away: { GK: [], DEF: [], MID: [], ATT: [], ALL: [] } };
                const lineAges = { home: [], away: [] };
                const lineRoutines = { home: [], away: [] };
                const playerDetails = { home: [], away: [] };

                ['home', 'away'].forEach(side => {
                    Object.values(mData.lineup[side]).forEach(p => {
                        const pid = String(p.player_id);
                        const isSub = p.position.includes('sub');
                        const r5 = r5Map.get(pid);
                        const age = ageMap.get(pid);
                        const line = isSub ? 'SUB' : getLine(p.position);
                        const routine = parseFloat(p.routine) || 0;

                        if (r5 !== undefined) {
                            if (!isSub) {
                                if (lineR5[side][line]) lineR5[side][line].push(r5);
                                lineR5[side].ALL.push(r5);
                            }
                            playerDetails[side].push({
                                name: p.nameLast || p.name,
                                no: p.no, fp: (p.fp || p.position).split(',')[0].toUpperCase(),
                                r5, age: age ? Math.floor(age / 12) : parseInt(p.age),
                                routine, isSub, pid,
                                udseende2: p.udseende2
                            });
                        }
                        if (!isSub) {
                            if (age) lineAges[side].push(age);
                            lineRoutines[side].push(routine);
                        }
                    });
                    // Sort by R5 descending
                    playerDetails[side].sort((a, b) => b.r5 - a.r5);
                });

                const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
                const avgR5 = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / 11 : 0; // Always /11

                // Build HTML
                let html = '<div class="rnd-analysis-wrap">';

                // ── 1. FORM ──
                html += '<div class="rnd-an-section">';
                html += '<div class="rnd-an-section-head"><span class="an-icon">📊</span> Form Guide</div>';
                html += '<div class="rnd-an-form-row">';
                // Home form
                html += '<div class="rnd-an-form-side home">';
                html += `<span class="rnd-an-form-label">${homeName.length > 12 ? homeName.substring(0, 12) + '…' : homeName}</span>`;
                html += '<div class="rnd-an-form-dots">';
                homeForm.dots.forEach(r => {
                    html += `<div class="rnd-an-form-dot ${r}">${r.toUpperCase()}</div>`;
                });
                html += `</div><span class="rnd-an-form-pts">${homeForm.pts}</span>`;
                html += '</div>';
                // Away form
                html += '<div class="rnd-an-form-side away">';
                html += `<span class="rnd-an-form-label">${awayName.length > 12 ? awayName.substring(0, 12) + '…' : awayName}</span>`;
                html += '<div class="rnd-an-form-dots">';
                awayForm.dots.forEach(r => {
                    html += `<div class="rnd-an-form-dot ${r}">${r.toUpperCase()}</div>`;
                });
                html += `</div><span class="rnd-an-form-pts">${awayForm.pts}</span>`;
                html += '</div>';
                html += '</div>';
                // Form comparison bar
                const totalFormPts = homeForm.pts + awayForm.pts || 1;
                html += '<div class="rnd-an-form-bar-wrap"><div class="rnd-an-form-bar">';
                html += `<div class="rnd-an-form-seg home" style="width:${Math.round(homeForm.pts / totalFormPts * 100)}%"></div>`;
                html += `<div class="rnd-an-form-seg away" style="width:${Math.round(awayForm.pts / totalFormPts * 100)}%"></div>`;
                html += '</div></div>';
                html += '</div>';

                // ── 2. SQUAD STRENGTH ──
                html += '<div class="rnd-an-section">';
                html += '<div class="rnd-an-section-head"><span class="an-icon">💪</span> Squad Strength (R5)</div>';

                const lines = ['GK', 'DEF', 'MID', 'ATT', 'ALL'];
                const lineLabels = { GK: 'Keeper', DEF: 'Defence', MID: 'Midfield', ATT: 'Attack', ALL: 'Overall' };
                lines.forEach(line => {
                    const hR5 = line === 'ALL' ? avgR5(lineR5.home.ALL) : avg(lineR5.home[line]);
                    const aR5 = line === 'ALL' ? avgR5(lineR5.away.ALL) : avg(lineR5.away[line]);
                    const maxR5 = Math.max(hR5, aR5, 1);
                    const hPct = Math.round(hR5 / maxR5 * 100);
                    const aPct = Math.round(aR5 / maxR5 * 100);
                    const hLead = hR5 > aR5 ? ' leading' : '';
                    const aLead = aR5 > hR5 ? ' leading' : '';
                    const isOverall = line === 'ALL';

                    html += `<div class="rnd-an-strength-row"${isOverall ? ' style="padding:8px 20px;border-top:1px solid rgba(80,160,48,.1)"' : ''}>`;
                    html += `<span class="rnd-an-str-val home${hLead}" style="color:${getColor(hR5, R5_THRESHOLDS)}">${hR5.toFixed(1)}</span>`;
                    html += `<div class="rnd-an-str-bar"><div class="rnd-an-str-fill home" style="width:${hPct}%"></div></div>`;
                    html += `<span class="rnd-an-str-label">${isOverall ? '⭐ ' : ''}${lineLabels[line]}</span>`;
                    html += `<div class="rnd-an-str-bar"><div class="rnd-an-str-fill away" style="width:${aPct}%"></div></div>`;
                    html += `<span class="rnd-an-str-val away${aLead}" style="color:${getColor(aR5, R5_THRESHOLDS)}">${aR5.toFixed(1)}</span>`;
                    html += '</div>';
                });
                html += '</div>';

                // ── 3. KEY PLAYERS ──
                html += '<div class="rnd-an-section">';
                html += '<div class="rnd-an-section-head"><span class="an-icon">🌟</span> Key Players</div>';
                html += '<div class="rnd-an-keys">';

                const faceUrl = (p, clrHex) => TmMatchUtils.faceUrl(p, clrHex, 72);

                ['home', 'away'].forEach(side => {
                    const clr = side === 'home' ? homeColor.replace('#', '') : awayColor.replace('#', '');
                    const top5 = playerDetails[side].filter(p => !p.isSub).slice(0, 5);
                    html += `<div class="rnd-an-keys-side${side === 'away' ? ' away' : ''}">`;
                    top5.forEach((p, i) => {
                        const url = faceUrl(p, clr);
                        html += `<div class="rnd-an-key-player">`;
                        html += `<span class="rnd-an-key-rank">${i + 1}</span>`;
                        if (url) html += `<div class="rnd-an-key-face" style="border-color:${side === 'home' ? homeColor : awayColor}"><img src="${url}" onerror="this.style.display='none'"></div>`;
                        html += `<div class="rnd-an-key-info"><div class="rnd-an-key-name">${p.name}</div><div class="rnd-an-key-meta">${p.fp} · ${p.age}y · Rtn ${p.routine.toFixed(1)}</div></div>`;
                        html += `<span class="rnd-an-key-r5" style="color:${getColor(p.r5, R5_THRESHOLDS)}">${p.r5.toFixed(1)}</span>`;
                        html += '</div>';
                    });
                    html += '</div>';
                });
                html += '</div></div>';

                // ── 4. SQUAD PROFILE ──
                html += '<div class="rnd-an-section">';
                html += '<div class="rnd-an-section-head"><span class="an-icon">📋</span> Squad Profile</div>';
                html += '<div class="rnd-an-profile-grid">';

                const hAvgAge = avg(lineAges.home) / 12;
                const aAvgAge = avg(lineAges.away) / 12;
                const hAvgRtn = avg(lineRoutines.home);
                const aAvgRtn = avg(lineRoutines.away);
                const hStarterR5 = avgR5(lineR5.home.ALL);
                const aStarterR5 = avgR5(lineR5.away.ALL);
                const hSubs = playerDetails.home.filter(p => p.isSub);
                const aSubs = playerDetails.away.filter(p => p.isSub);
                const hBenchR5 = hSubs.length ? avg(hSubs.map(p => p.r5)) : 0;
                const aBenchR5 = aSubs.length ? avg(aSubs.map(p => p.r5)) : 0;

                html += `<div class="rnd-an-profile-card"><span class="rnd-an-profile-icon">🎂</span><div class="rnd-an-profile-info"><div class="rnd-an-profile-label">Avg Age</div><div class="rnd-an-profile-vals"><span class="rnd-an-profile-val home">${hAvgAge.toFixed(1)}</span><span class="rnd-an-profile-vs">vs</span><span class="rnd-an-profile-val away">${aAvgAge.toFixed(1)}</span></div></div></div>`;
                html += `<div class="rnd-an-profile-card"><span class="rnd-an-profile-icon">📈</span><div class="rnd-an-profile-info"><div class="rnd-an-profile-label">Avg Routine</div><div class="rnd-an-profile-vals"><span class="rnd-an-profile-val home">${hAvgRtn.toFixed(1)}</span><span class="rnd-an-profile-vs">vs</span><span class="rnd-an-profile-val away">${aAvgRtn.toFixed(1)}</span></div></div></div>`;
                html += `<div class="rnd-an-profile-card"><span class="rnd-an-profile-icon">⭐</span><div class="rnd-an-profile-info"><div class="rnd-an-profile-label">Starting XI R5</div><div class="rnd-an-profile-vals"><span class="rnd-an-profile-val home" style="color:${getColor(hStarterR5, R5_THRESHOLDS)}">${hStarterR5.toFixed(1)}</span><span class="rnd-an-profile-vs">vs</span><span class="rnd-an-profile-val away" style="color:${getColor(aStarterR5, R5_THRESHOLDS)}">${aStarterR5.toFixed(1)}</span></div></div></div>`;
                html += `<div class="rnd-an-profile-card"><span class="rnd-an-profile-icon">🪑</span><div class="rnd-an-profile-info"><div class="rnd-an-profile-label">Bench Avg R5</div><div class="rnd-an-profile-vals"><span class="rnd-an-profile-val home" style="color:${getColor(hBenchR5, R5_THRESHOLDS)}">${hBenchR5.toFixed(1)}</span><span class="rnd-an-profile-vs">vs</span><span class="rnd-an-profile-val away" style="color:${getColor(aBenchR5, R5_THRESHOLDS)}">${aBenchR5.toFixed(1)}</span></div></div></div>`;
                html += '</div></div>';

                // ── 5. TACTICAL MATCHUP ──
                html += '<div class="rnd-an-section">';
                html += '<div class="rnd-an-section-head"><span class="an-icon">⚔️</span> Tactical Matchup</div>';
                html += '<div class="rnd-an-tactics">';

                const mentalityMap = TmConst.MENTALITY_MAP_LONG;
                const styleMap = TmConst.STYLE_MAP;
                const focusMap = TmConst.FOCUS_MAP;

                ['home', 'away'].forEach(side => {
                    const formation = detectFormation(mData.lineup[side]);
                    const ment = md.mentality ? (mentalityMap[md.mentality[side]] || '?') : '?';
                    const style = md.attacking_style && md.attacking_style[side] ? (styleMap[md.attacking_style[side]] || '?') : '—';
                    const focus = md.focus_side && md.focus_side[side] ? (focusMap[md.focus_side[side]] || '?') : '—';
                    const name = side === 'home' ? homeName : awayName;

                    html += `<div class="rnd-an-tactic-side${side === 'away' ? ' away' : ''}">`;
                    html += `<div class="rnd-an-tactic-team">${name}</div>`;
                    html += `<div class="rnd-an-tactic-item"><span class="t-icon">📐</span><span class="t-label">Formation</span><span class="t-val">${formation}</span></div>`;
                    html += `<div class="rnd-an-tactic-item"><span class="t-icon">⚔️</span><span class="t-label">Mentality</span><span class="t-val">${ment}</span></div>`;
                    html += `<div class="rnd-an-tactic-item"><span class="t-icon">🎯</span><span class="t-label">Style</span><span class="t-val">${style}</span></div>`;
                    html += `<div class="rnd-an-tactic-item"><span class="t-icon">◎</span><span class="t-label">Focus</span><span class="t-val">${focus}</span></div>`;
                    html += '</div>';
                });
                html += '</div></div>';

                // ── 6. UNAVAILABLE PLAYERS ──
                const hOut = md.lineup_out?.home ? Object.values(md.lineup_out.home) : [];
                const aOut = md.lineup_out?.away ? Object.values(md.lineup_out.away) : [];
                if (hOut.length || aOut.length) {
                    html += '<div class="rnd-an-section">';
                    html += '<div class="rnd-an-section-head"><span class="an-icon">🚫</span> Unavailable</div>';
                    html += '<div class="rnd-an-unavail">';
                    html += '<div class="rnd-an-unavail-side">';
                    if (hOut.length) hOut.forEach(p => { html += `<div class="rnd-an-unavail-player">✕ ${p.name}</div>`; });
                    else html += '<div class="rnd-an-unavail-none">Full squad available</div>';
                    html += '</div>';
                    html += '<div class="rnd-an-unavail-side away">';
                    if (aOut.length) aOut.forEach(p => { html += `<div class="rnd-an-unavail-player">✕ ${p.name}</div>`; });
                    else html += '<div class="rnd-an-unavail-none">Full squad available</div>';
                    html += '</div>';
                    html += '</div></div>';
                }

                // ── 7. PREDICTION ──
                html += '<div class="rnd-an-section">';
                html += '<div class="rnd-an-section-head"><span class="an-icon">🔮</span> Match Prediction</div>';
                html += '<div class="rnd-an-prediction">';

                // Weighted prediction: 50% R5, 30% form, 20% home advantage
                const hR5Score = hStarterR5;
                const aR5Score = aStarterR5;

                // Form score (points / max possible)
                const hFormScore = homeForm.dots.length ? homeForm.pts / (homeForm.dots.length * 3) : 0.5;
                const aFormScore = awayForm.dots.length ? awayForm.pts / (awayForm.dots.length * 3) : 0.5;

                // Composite strength (0-1 scale)
                const homeAdv = TmConst.GAMEPLAY.HOME_ADVANTAGE;
                const r5Weight = 0.70;
                const formWeight = 0.15;
                const haWeight = 0.15;

                // Normalize R5 to 0-1 (range 40-120)
                const r5Norm = (v) => Math.max(0, Math.min(1, (v - 40) / 80));
                const hStrength = r5Norm(hR5Score) * r5Weight + hFormScore * formWeight + (0.5 + homeAdv) * haWeight;
                const aStrength = r5Norm(aR5Score) * r5Weight + aFormScore * formWeight + (0.5 - homeAdv) * haWeight;

                // Convert to win/draw/loss probabilities
                const diff = hStrength - aStrength;
                const drawBase = 0.24; // Base draw probability
                const drawProb = Math.max(0.08, drawBase - Math.abs(diff) * 0.6);
                const remaining = 1 - drawProb;
                const sigmoid = (x) => 1 / (1 + Math.exp(-x * 12));
                const hWinRaw = sigmoid(diff);
                let hWin = Math.round(hWinRaw * remaining * 100);
                let draw = Math.round(drawProb * 100);
                let aWin = 100 - hWin - draw;
                if (aWin < 0) { aWin = 0; hWin = 100 - draw; }

                html += '<div class="rnd-an-pred-teams">';
                html += '<div class="rnd-an-pred-side">';
                html += `<img class="rnd-an-pred-logo" src="/pics/club_logos/${homeId}_140.png" onerror="this.style.display='none'">`;
                html += `<div class="rnd-an-pred-name">${homeName}</div>`;
                html += `<div class="rnd-an-pred-pct home">${hWin}%</div>`;
                html += '<div class="rnd-an-pred-label">Win</div>';
                html += '</div>';
                html += '<div class="rnd-an-pred-draw">';
                html += `<div class="rnd-an-pred-pct draw">${draw}%</div>`;
                html += '<div class="rnd-an-pred-label">Draw</div>';
                html += '</div>';
                html += '<div class="rnd-an-pred-side">';
                html += `<img class="rnd-an-pred-logo" src="/pics/club_logos/${awayId}_140.png" onerror="this.style.display='none'">`;
                html += `<div class="rnd-an-pred-name">${awayName}</div>`;
                html += `<div class="rnd-an-pred-pct away">${aWin}%</div>`;
                html += '<div class="rnd-an-pred-label">Win</div>';
                html += '</div>';
                html += '</div>';
                html += '<div class="rnd-an-pred-bar-wrap">';
                html += `<div class="rnd-an-pred-seg home" style="width:${hWin}%"></div>`;
                html += `<div class="rnd-an-pred-seg draw" style="width:${draw}%"></div>`;
                html += `<div class="rnd-an-pred-seg away" style="width:${aWin}%"></div>`;
                html += '</div>';
                html += '</div></div>';

                html += '</div>'; // wrap
                body.html(html);
            }).catch(() => {
                body.html('<div style="text-align:center;padding:20px;color:#ff6b6b">Failed to analyze squads</div>');
            });
        }
    };
