import { TmConst } from '../../lib/tm-constants.js';
import { TmPlayerDB } from '../../lib/tm-playerdb.js';
import { TmApi } from '../../lib/tm-services.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmMatchUtils } from './tm-match-utils.js';

const _showPlayerDialog = (playerId, mData, curMin, curEvtIdx, opts) => {
        const { getLiveState, buildPlayerNames, buildReportEventHtml, isEventVisible,
            isMatchFuture,
            fetchTooltip, getColor, REC_THRESHOLDS } = opts;
        const liveState = getLiveState();
        // Remove any existing dialog
        $('.rnd-plr-overlay').remove();

        const pid = String(playerId);
        const homeId = mData.club.home.id;
        const isHome = !!mData.lineup.home[pid];
        const lineup = isHome ? mData.lineup.home : mData.lineup.away;
        const p = lineup[pid];
        if (!p) return;

        const clubColor = '#' + ((isHome ? mData.club.home : mData.club.away).colors?.club_color1 || '4a9030');
        const clubName = (isHome ? mData.club.home : mData.club.away).club_name || '';

        // Face URL
        const u = p.udseende2 || {};
        const clrHex = clubColor.replace('#', '');
        const fUrl = `https://trophymanager.com/pics/player_pic2.php?face=${u.face || 1}&nose=${u.nose || 1}&eyes=${u.eyes || 1}&ears=${u.ears || 1}&mouth=${u.mouth || 1}&brows=${u.brows || 1}&hcolor=${u.hair_color || 1}&scolor=${u.skin_color || 1}&hair=${u.hair || 1}&age=${p.age || 25}&rgb=${clrHex}&w=96`;

        const ratClr = TmUtils.ratingColor;

        // Player names map for accordion rendering
        const playerNames = buildPlayerNames(mData);

        // ── Compute player stats from video segments ──
        const report = mData.report || {};
        const pStats = TmMatchUtils.buildPlayerEventStats(report, {
            isEventVisible, upToMin: curMin, upToEvtIdx: curEvtIdx,
            pidFilter: pid, recordEvents: true,
        });
        const st = pStats[pid] || {};
        const isGK = p.position === 'gk';
        const playerEvents = st.events || [];
        const sortedMins = Object.keys(report).map(Number).sort((a, b) => a - b);

        // ── Minutes played ──
        const isSub = p.position.includes('sub');
        let minsPlayed;
        const subEvts = {};
        for (const min of sortedMins) {
            (report[String(min)] || []).forEach(evt => {
                if (!evt.parameters) return;
                evt.parameters.forEach(param => {
                    if (param.sub) {
                        if (String(param.sub.player_in) === pid) subEvts.subInMin = min;
                        if (String(param.sub.player_out) === pid) subEvts.subOutMin = min;
                    }
                });
            });
        }
        const matchEndMin = mData.match_data?.regular_last_min || Math.max(...sortedMins, 90);
        if (isSub) {
            minsPlayed = subEvts.subInMin ? (subEvts.subOutMin || matchEndMin) - subEvts.subInMin : 0;
        } else {
            minsPlayed = subEvts.subOutMin || matchEndMin;
        }

        // ── Position display ──
        const posDisplay = isSub ? (p.fp || '').split(',')[0].toUpperCase() : p.position.toUpperCase();

        // ── Build HTML ──
        const ACTION_LABELS = { pass_ok: 'pass ✓', pass_fail: 'pass ✗', cross_ok: 'cross ✓', cross_fail: 'cross ✗', shot: 'shot', save: 'save', goal: 'goal', assist: 'assist', duel_won: 'duel ✓', duel_lost: 'duel ✗', intercept: 'INT', tackle: 'TKL', header_clear: 'HC', tackle_fail: 'TF', foul: 'foul', yellow: '🟨', red: '🟥' };
        const ACTION_CLS = { pass_ok: 'shot', pass_fail: 'lost', cross_ok: 'shot', cross_fail: 'lost', shot: 'shot', save: 'shot', goal: 'goal', assist: 'goal', duel_won: 'shot', duel_lost: 'lost', intercept: 'shot', tackle: 'shot', header_clear: 'shot', tackle_fail: 'lost', foul: 'lost', yellow: 'lost', red: 'lost' };

        const playerUrl = `https://trophymanager.com/players/${pid}/#/page/history/`;
        const matchFuture = isMatchFuture(mData);
        const matchEnded = !matchFuture && (!liveState || liveState.ended);

        let html = '<div class="rnd-plr-overlay"><div class="rnd-plr-dialog" style="position:relative">';
        html += '<button class="rnd-plr-close">&times;</button>';

        // Header: face + info + R5 (loaded async)
        html += '<div class="rnd-plr-header">';
        html += `<div class="rnd-plr-face"><img src="${fUrl}" alt="${p.no}"></div>`;
        html += '<div class="rnd-plr-info">';
        html += '<div class="rnd-plr-name-row">';
        html += `<a class="rnd-plr-name" href="${playerUrl}" target="_blank">${p.name || p.nameLast || ''}</a>`;
        html += `<a class="rnd-plr-link" href="${playerUrl}" target="_blank" title="Open player profile">&#x1F517;</a>`;
        html += '</div>';
        html += '<div class="rnd-plr-badges">';
        html += `<span class="rnd-plr-badge"><span class="badge-icon">👕</span> #${p.no}</span>`;
        html += `<span class="rnd-plr-badge"><span class="badge-icon">📍</span> ${posDisplay}</span>`;
        html += `<span class="rnd-plr-badge" id="rnd-plr-age-badge-${pid}"><span class="badge-icon">🎂</span> ${p.age || '?'}</span>`;
        if (matchEnded) html += `<span class="rnd-plr-badge"><span class="badge-icon">⏱️</span> ${minsPlayed}'</span>`;
        html += '</div></div>';
        if (matchEnded && p.rating) {
            const rVal = Number(p.rating).toFixed(2);
            html += '<div class="rnd-plr-rating-wrap">';
            html += `<div class="rnd-plr-rating-big" style="color:${ratClr(p.rating)}">${rVal}</div>`;
            html += '<div class="rnd-plr-rating-label">Rating</div>';
            html += '</div>';
        }
        html += '</div>';

        // Body: profile + stats + chances
        html += '<div class="rnd-plr-body">';

        // ── Player Profile (skills, ASI, R5, REC, Routine) — loaded async ──
        html += '<div class="rnd-plr-section-title"><span class="sec-icon">🧑</span> Player Profile</div>';
        html += `<div class="rnd-plr-profile-wrap" id="rnd-plr-profile-${pid}">${TmUI.loading('Loading player data…')}</div>`;

        // ── Match Stats (hidden for future matches) ──
        if (!matchFuture) {
            // ── Shooting ──
            html += '<div class="rnd-plr-section-title"><span class="sec-icon">🎯</span> Shooting</div>';
            html += '<div class="rnd-plr-stats-row">';
            if (isGK) {
                [{ icon: '🧤', lbl: 'Saves', val: st.sv, cls: st.sv > 0 ? 'green' : '' },
                { icon: '⚽', lbl: 'Goals', val: st.g, cls: st.g > 0 ? 'gold' : '' },
                { icon: '👟', lbl: 'Assists', val: st.a, cls: st.a > 0 ? 'gold' : '' },
                { icon: '🔑', lbl: 'Key Pass', val: st.kp, cls: st.kp > 0 ? '' : '' },
                { icon: '🎯', lbl: 'Shots', val: st.sh, cls: '' },
                ].forEach(s => {
                    html += `<div class="rnd-plr-stat-card ${s.cls}"><div class="rnd-plr-stat-icon">${s.icon}</div><div class="rnd-plr-stat-val">${s.val}</div><div class="rnd-plr-stat-lbl">${s.lbl}</div></div>`;
                });
            } else {
                [{ icon: '⚽', lbl: 'Goals', val: st.g, cls: st.g > 0 ? 'gold' : '' },
                { icon: '🎯', lbl: 'Shots', val: st.sh, cls: '' },
                { icon: '✅', lbl: 'On Target', val: st.sot, cls: st.sot > 0 ? 'green' : '' },
                { icon: '🦶', lbl: 'Foot G', val: st.gf, cls: st.gf > 0 ? 'gold' : '' },
                { icon: '🗣️', lbl: 'Head G', val: st.gh, cls: st.gh > 0 ? 'gold' : '' },
                ].forEach(s => {
                    html += `<div class="rnd-plr-stat-card ${s.cls}"><div class="rnd-plr-stat-icon">${s.icon}</div><div class="rnd-plr-stat-val">${s.val}</div><div class="rnd-plr-stat-lbl">${s.lbl}</div></div>`;
                });
            }
            html += '</div>';

            // ── Passing & Creativity ──
            html += '<div class="rnd-plr-section-title"><span class="sec-icon">📊</span> Passing & Creativity</div>';
            html += '<div class="rnd-plr-stats-row">';
            const totalPasses = st.sp + st.up;
            const passAcc = totalPasses > 0 ? Math.round(st.sp / totalPasses * 100) : 0;
            const totalCross = st.sc + st.uc;
            const crossAcc = totalCross > 0 ? Math.round(st.sc / totalCross * 100) : 0;
            [{ icon: '👟', lbl: 'Assists', val: st.a, cls: st.a > 0 ? 'gold' : '' },
            { icon: '🔑', lbl: 'Key Pass', val: st.kp, cls: st.kp > 0 ? '' : '' },
            { icon: '📨', lbl: `Pass ${passAcc}%`, val: `${st.sp}/${totalPasses}`, cls: passAcc >= 70 ? 'green' : totalPasses > 0 ? 'red' : '' },
            { icon: '↗️', lbl: `Cross ${crossAcc}%`, val: `${st.sc}/${totalCross}`, cls: crossAcc >= 50 ? 'green' : totalCross > 0 ? 'red' : '' },
            { icon: '📈', lbl: 'Total', val: totalPasses + totalCross, cls: '' },
            ].forEach(s => {
                html += `<div class="rnd-plr-stat-card ${s.cls}"><div class="rnd-plr-stat-icon">${s.icon}</div><div class="rnd-plr-stat-val">${s.val}</div><div class="rnd-plr-stat-lbl">${s.lbl}</div></div>`;
            });
            html += '</div>';

            // ── Defending & Duels ──
            html += '<div class="rnd-plr-section-title"><span class="sec-icon">🛡️</span> Defending & Duels</div>';
            html += '<div class="rnd-plr-stats-row">';
            [{ icon: '👁️', lbl: 'INT', val: st.int, cls: st.int > 0 ? 'green' : '' },
            { icon: '🦵', lbl: 'TKL', val: st.tkl, cls: st.tkl > 0 ? 'green' : '' },
            { icon: '🗣️', lbl: 'HC', val: st.hc, cls: st.hc > 0 ? 'green' : '' },
            { icon: '❌', lbl: 'TF', val: st.tf, cls: st.tf > 0 ? 'red' : '' },
            { icon: '⚠️', lbl: 'Fouls', val: st.fouls, cls: st.fouls > 0 ? 'red' : '' },
            ].forEach(s => {
                html += `<div class="rnd-plr-stat-card ${s.cls}"><div class="rnd-plr-stat-icon">${s.icon}</div><div class="rnd-plr-stat-val">${s.val}</div><div class="rnd-plr-stat-lbl">${s.lbl}</div></div>`;
            });
            html += '</div>';

            // Chances list
            if (playerEvents.length) {
                html += '<div class="rnd-plr-section-title"><span class="sec-icon">⚡</span> Chances Involved (' + playerEvents.length + ')</div>';
                html += '<div class="rnd-adv-evt-list">';
                playerEvents.forEach(ev => {
                    const acls = ACTION_CLS[ev.action] || '';
                    const albl = ACTION_LABELS[ev.action] || '';
                    html += '<div class="rnd-adv-evt">';
                    if (albl) html += `<span class="adv-result-tag ${acls}">${albl}</span>`;
                    html += buildReportEventHtml(ev.evt, ev.min, ev.evtIdx, playerNames, homeId);
                    html += '</div>';
                });
                html += '</div>';
            } else {
                html += '<div style="text-align:center;padding:12px;color:#4a6a38;font-size:12px">No recorded chances</div>';
            }
        } // end !matchFuture

        html += '</div></div></div>';

        // Append to body
        const $overlay = $(html).appendTo('body');

        // Close handlers
        $overlay.find('.rnd-plr-close').on('click', () => $overlay.remove());
        $overlay.on('click', (e) => { if ($(e.target).hasClass('rnd-plr-overlay')) $overlay.remove(); });

        // Wire accordion for embedded events
        $overlay.on('click', '.rnd-acc-head', function (e) {
            e.stopPropagation();
            $(this).closest('.rnd-acc').toggleClass('open');
        });

        // ── Async: load player profile (skills, ASI, Routine) ──
        const profileEl = $overlay.find(`#rnd-plr-profile-${pid}`);
        const routineMap = new Map();
        const positionMap = new Map();
        // Populate from lineup data
        const allLineupForCard = { ...mData.lineup.home, ...mData.lineup.away };
        Object.entries(allLineupForCard).forEach(([id, lp]) => {
            routineMap.set(id, Number(lp.routine));
            if (!lp.position.includes('sub')) positionMap.set(id, lp.position);
        });

        fetchTooltip(pid).then(rawData => {
            if (!profileEl.length || !profileEl.closest('body').length) return;
            const player = JSON.parse(JSON.stringify(rawData.player));
            if (routineMap.has(pid)) player.routine = String(routineMap.get(pid));
            if (positionMap.has(pid)) player.favposition = positionMap.get(pid);

            const DBPlayer = TmPlayerDB.get(parseInt(player.player_id));
            TmApi.normalizePlayer(player, DBPlayer, { skipSync: true });
            const skills = player.skills.map(s => s.value);
            const isGKProfile = player.isGK;

            const GK_NAMES = TmConst.SKILL_NAMES_GK_SHORT;
            const FIELD_NAMES = TmConst.SKILL_LABELS_OUT;
            const skillNames = isGKProfile ? GK_NAMES : FIELD_NAMES;

            const r5 = player.r5;
            const rec = player.rec;

            const svc = TmUtils.skillColor;
            const fmtVal = (val) => {
                const { display, starCls } = TmUtils.formatSkill(val);
                const suffix = starCls === ' star-gold' ? ' rnd-plr-skill-star' : starCls === ' star-silver' ? ' rnd-plr-skill-star silver' : '';
                return { display, starCls: suffix };
            };

            // Build skills grid
            const leftIdx = isGKProfile ? [0, 1, 2] : [0, 1, 2, 3, 4, 5, 6];
            const rightIdx = isGKProfile ? [3, 4, 5, 6, 7, 8, 9, 10] : [7, 8, 9, 10, 11, 12, 13];

            let ph = '';
            // Country row
            if (player.country) {
                const flagUrl = `https://trophymanager.com/pics/flags/gradient/${player.country}.png`;
                const countryName = player.country_name || player.country || '';
                ph += `<div class="rnd-plr-country-row">`;
                ph += `<img class="rnd-plr-country-flag" src="${flagUrl}" onerror="this.style.display='none'">`;
                ph += `<span class="rnd-plr-country-name">${countryName}</span>`;
                ph += `</div>`;
            }

            ph += '<div class="rnd-plr-skills-grid">';
            // Left column
            ph += '<div>';
            leftIdx.forEach(i => {
                const val = typeof skills[i] === 'number' ? skills[i] : parseInt(skills[i]);
                const { display, starCls } = fmtVal(val);
                ph += `<div class="rnd-plr-skill-row">`;
                ph += `<span class="rnd-plr-skill-name">${skillNames[i] || ''}</span>`;
                ph += `<span class="rnd-plr-skill-val${starCls}" style="color:${svc(val)}">${display}</span>`;
                ph += '</div>';
            });
            ph += '</div>';
            // Right column
            ph += '<div>';
            rightIdx.forEach(i => {
                const val = typeof skills[i] === 'number' ? skills[i] : parseInt(skills[i]);
                const { display, starCls } = fmtVal(val);
                ph += `<div class="rnd-plr-skill-row">`;
                ph += `<span class="rnd-plr-skill-name">${skillNames[i] || ''}</span>`;
                ph += `<span class="rnd-plr-skill-val${starCls}" style="color:${svc(val)}">${display}</span>`;
                ph += '</div>';
            });
            ph += '</div>';
            ph += '</div>';

            // Footer: ASI, R5, REC, Routine
            ph += '<div class="rnd-plr-profile-footer">';
            ph += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:#e0f0cc">${player.asi.toLocaleString()}</div><div class="rnd-plr-profile-stat-lbl">ASI</div></div>`;
            ph += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:${getColor(r5, R5_THRESHOLDS)}">${r5}</div><div class="rnd-plr-profile-stat-lbl">R5</div></div>`;
            ph += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:${getColor(rec, REC_THRESHOLDS)}">${rec}</div><div class="rnd-plr-profile-stat-lbl">REC</div></div>`;
            ph += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:#8abc78">${parseFloat(player.routine).toFixed(1)}</div><div class="rnd-plr-profile-stat-lbl">Routine</div></div>`;
            ph += '</div>';

            profileEl.html(ph);

            // Update age badge with months
            const ageBadge = $(`#rnd-plr-age-badge-${pid}`);
            if (ageBadge.length) {
                const ageMonths = Number(player.months || 0);
                const ageYears = Number(player.age || 0);
                const ageDisplay = ageMonths ? `${ageYears}.${ageMonths}` : String(ageYears || '?');
                ageBadge.html(`<span class="badge-icon">🎂</span> ${ageDisplay}`);
            }
        }).catch(() => {
            profileEl.html(TmUI.error('Failed to load profile'));
        });
    };

    export const TmMatchLineups = {
        render(body, mData, curMin = 999, curEvtIdx = 999, opts) {
            const { getLiveState, getUnityState, isMatchPage, moveUnityCanvas, saveUnityCanvas,
                updateUnityStats, computeActiveRoster, isMatchFuture, isEventVisible,
                getPlayerData, fetchTooltip,
                getColor, REC_THRESHOLDS } = opts;
            const liveState = getLiveState();
            const unityState = getUnityState ? getUnityState() : null;
            const matchFuture = isMatchFuture(mData);
            const matchEnded = !matchFuture && (!liveState || liveState.ended);
            const homeColor = '#' + (mData.club.home.colors?.club_color1 || '4a9030');
            const awayColor = '#' + (mData.club.away.colors?.club_color1 || '5b9bff');
            const homeId = mData.club.home.id;
            const awayId = mData.club.away.id;

            // Split starters and subs
            const splitLineup = (lineup) => {
                const starters = [], subs = [];
                Object.values(lineup).forEach(p => {
                    if (p.position.includes('sub')) subs.push(p); else starters.push(p);
                });
                // Sort starters by position order
                const posOrder = { gk: 0, dl: 1, dcl: 2, dc: 3, dcr: 4, dr: 5, dml: 6, dmcl: 7, dmc: 8, dmcr: 9, dmr: 10, ml: 11, mcl: 12, mc: 13, mcr: 14, mr: 15, oml: 16, omcl: 17, omc: 18, omcr: 19, omr: 20, fcl: 21, fc: 22, fcr: 23 };
                starters.sort((a, b) => (posOrder[a.position] ?? 99) - (posOrder[b.position] ?? 99));
                subs.sort((a, b) => Number(a.position.replace('sub', '')) - Number(b.position.replace('sub', '')));
                return { starters, subs };
            };

            const home = splitLineup(mData.lineup.home);
            const away = splitLineup(mData.lineup.away);

            // Build event stats per player from report (filtered by current step)
            const pEvents = {};  // player_id → { goals, assists, yellows, reds, subIn, subOut, injured }
            const initPE = () => ({ goals: 0, assists: 0, yellows: 0, reds: 0, subIn: false, subOut: false, injured: false });
            const report = mData.report || {};
            if (!matchFuture) Object.keys(report).forEach(minKey => {
                const eMin = Number(minKey);
                report[minKey].forEach((evt, si) => {
                    if (!isEventVisible(eMin, si, curMin, curEvtIdx)) return;
                    if (!evt.parameters) return;
                    evt.parameters.forEach(param => {
                        if (param.goal) {
                            const pid = String(param.goal.player);
                            if (!pEvents[pid]) pEvents[pid] = initPE();
                            pEvents[pid].goals++;
                            if (param.goal.assist) {
                                const aid = String(param.goal.assist);
                                if (!pEvents[aid]) pEvents[aid] = initPE();
                                pEvents[aid].assists++;
                            }
                        }
                        if (param.yellow) {
                            const pid = String(param.yellow);
                            if (!pEvents[pid]) pEvents[pid] = initPE();
                            pEvents[pid].yellows++;
                        }
                        if (param.yellow_red) {
                            const pid = String(param.yellow_red);
                            if (!pEvents[pid]) pEvents[pid] = initPE();
                            pEvents[pid].reds++; pEvents[pid].yellows++;
                        }
                        if (param.red) {
                            const pid = String(param.red);
                            if (!pEvents[pid]) pEvents[pid] = initPE();
                            pEvents[pid].reds++;
                        }
                        if (param.injury) {
                            const pid = String(param.injury);
                            if (!pEvents[pid]) pEvents[pid] = initPE();
                            pEvents[pid].injured = true;
                        }
                        if (param.sub) {
                            const inId = String(param.sub.player_in);
                            const outId = String(param.sub.player_out);
                            if (!pEvents[inId]) pEvents[inId] = initPE();
                            if (!pEvents[outId]) pEvents[outId] = initPE();
                            pEvents[inId].subIn = true;
                            pEvents[outId].subOut = true;
                        }
                    });
                });
            });

            // Build event icons string for a player
            const eventIcons = (pid) => {
                const e = pEvents[String(pid)];
                if (!e) return '';
                let s = '';
                if (e.goals) s += (e.goals > 1 ? e.goals + '×' : '') + '⚽';
                if (e.assists) s += (e.assists > 1 ? e.assists + '×' : '') + '👟';
                if (e.yellows) s += (e.yellows > 1 ? e.yellows + '×' : '') + '🟨';
                if (e.reds) s += (e.reds > 1 ? e.reds + '×' : '') + '🟥';
                if (e.injured) s += '<span style="color:#ff3c3c;font-size:13px;font-weight:800">✚</span>';
                if (e.subIn) s += '🔼';
                if (e.subOut) s += '🔽';
                return s;
            };

            // Format name: "M. Radic" from "V. Tutić" or nameLast="Tutić", name="V. Tutić"
            const fmtName = (p) => {
                const full = p.name || '';
                const last = p.nameLast || '';
                if (last && full) {
                    const firstChar = full.charAt(0);
                    return `${firstChar}. ${last}`;
                }
                return last || full;
            };

            // Match rating color (1-10 scale, 5.0 = cutoff between red and green)
            const ratingColor = (r) => {
                if (!r || r === 0) return '#5a7a48';
                const v = Number(r);
                if (v >= 9.0) return '#00c040';
                if (v >= 8.5) return '#00dd50';
                if (v >= 8.0) return '#22e855';
                if (v >= 7.5) return '#44ee55';
                if (v >= 7.0) return '#66dd44';
                if (v >= 6.5) return '#88cc33';
                if (v >= 6.0) return '#99bb22';
                if (v >= 5.5) return '#aacc00';
                if (v >= 5.0) return '#bbcc00';
                if (v >= 4.5) return '#dd9900';
                if (v >= 4.0) return '#ee7733';
                if (v >= 3.5) return '#ee5533';
                if (v >= 3.0) return '#dd3333';
                if (v >= 2.0) return '#cc2222';
                return '#bb1111';
            };
            const r5Color = (v) => {
                if (!v) return '#5a7a48';
                // Below 95: piecewise HSL tiers
                // 95-120: explicit per-integer colors for max visual differentiation
                const hsl2rgb = (h, s, l) => {
                    s /= 100; l /= 100;
                    const c = (1 - Math.abs(2 * l - 1)) * s;
                    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
                    const m = l - c / 2;
                    let r, g, b;
                    if (h < 60) { r = c; g = x; b = 0; }
                    else if (h < 120) { r = x; g = c; b = 0; }
                    else { r = 0; g = c; b = x; }
                    return '#' + [r + m, g + m, b + m].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
                };
                // Explicit lookup for 95-120 — each integer has a unique, distinguishable color
                const topColors = {
                    95: '#8db024', // olive-yellow-green
                    96: '#7aad22', // yellow-green
                    97: '#68a820', // limey green
                    98: '#57a31e', // lime green
                    99: '#479e1c', // green-lime
                    100: '#38991a', // medium green
                    101: '#2e9418', // green
                    102: '#258e16', // rich green
                    103: '#1d8814', // deeper green
                    104: '#168212', // forest green
                    105: '#107c10', // vivid forest
                    106: '#0c720e', // dark vivid green
                    107: '#09680c', // dark green
                    108: '#075e0a', // darker green
                    109: '#055408', // very dark green
                    110: '#044a07', // deep emerald
                    111: '#034106', // deepest green
                    112: '#033905', // near-black green
                    113: '#023204', //
                    114: '#022c04', //
                    115: '#022603', // almost black-green
                    116: '#012103', //
                    117: '#011d02', //
                    118: '#011902', // darkest
                };
                const rounded = Math.round(v);
                if (rounded >= 95) return topColors[Math.min(118, rounded)] || topColors[118];
                // Below 95: HSL tiers
                const tiers = [
                    [25, 50, 0, 10, 65, 68, 28, 32],
                    [50, 70, 10, 25, 68, 72, 34, 40],
                    [70, 80, 25, 42, 72, 75, 42, 46],
                    [80, 90, 42, 58, 75, 78, 46, 48],
                    [90, 95, 58, 78, 78, 80, 48, 46],
                ];
                const clamped = Math.max(25, Math.min(95, v));
                let hue = 0, sat = 65, lit = 28;
                for (const [from, to, h0, h1, s0, s1, l0, l1] of tiers) {
                    if (clamped <= to) {
                        const t = (clamped - from) / (to - from);
                        hue = h0 + t * (h1 - h0);
                        sat = s0 + t * (s1 - s0);
                        lit = l0 + t * (l1 - l0);
                        break;
                    }
                }
                return hsl2rgb(hue, sat, lit);
            };

            // Captain IDs from match_data
            const captains = mData.match_data.captain || {};
            const homeCaptainId = String(captains.home || '');
            const awayCaptainId = String(captains.away || '');

            const renderList = (team, color, side) => {
                const captainId = side === 'home' ? homeCaptainId : awayCaptainId;
                let h = '';
                team.starters.forEach(p => {
                    const pid = String(p.player_id);
                    const evts = eventIcons(p.player_id);
                    const isCaptain = pid === captainId;
                    const isMom = matchEnded && Number(p.mom) === 1;
                    h += `<div class="rnd-lu-player rnd-lu-clickable" data-pid="${pid}">`;
                    h += `<div class="rnd-lu-no" style="background:${color};color:#fff">${p.no}</div>`;
                    h += `<span class="rnd-lu-name">${fmtName(p)}`;
                    if (isCaptain) h += ` <span class="rnd-lu-captain" title="Captain">©</span>`;
                    if (isMom) h += ` <span class="rnd-lu-mom" title="Man of the Match">⭐</span>`;
                    h += `</span>`;
                    if (evts) h += `<span class="rnd-lu-events">${evts}</span>`;
                    h += `<span class="rnd-lu-pos">${p.position.toUpperCase()}</span>`;
                    if (matchEnded) {
                        const rFmt = p.rating ? Number(p.rating).toFixed(2) : '-';
                        h += `<span class="rnd-lu-rating" style="color:${ratingColor(p.rating)}">${rFmt}</span>`;
                    }
                    h += `<span class="rnd-lu-r5" data-pid="${p.player_id}">···</span>`;
                    h += `</div>`;
                });
                h += `<div class="rnd-lu-sub-header">Substitutes</div>`;
                team.subs.forEach(p => {
                    const pid = String(p.player_id);
                    const evts = eventIcons(p.player_id);
                    const isCaptain = pid === captainId;
                    const isMom = matchEnded && Number(p.mom) === 1;
                    h += `<div class="rnd-lu-player rnd-lu-clickable" data-pid="${pid}">`;
                    h += `<div class="rnd-lu-no" style="background:${color};color:#fff;opacity:0.6">${p.no}</div>`;
                    h += `<span class="rnd-lu-name" style="color:#7a9a68">${fmtName(p)}`;
                    if (isCaptain) h += ` <span class="rnd-lu-captain" title="Captain">©</span>`;
                    if (isMom) h += ` <span class="rnd-lu-mom" title="Man of the Match">⭐</span>`;
                    h += `</span>`;
                    if (evts) h += `<span class="rnd-lu-events">${evts}</span>`;
                    h += `<span class="rnd-lu-pos">${(p.fp || '').split(',')[0].toUpperCase()}</span>`;
                    if (matchEnded) {
                        const rFmtS = p.rating ? Number(p.rating).toFixed(2) : '-';
                        h += `<span class="rnd-lu-rating" style="color:${ratingColor(p.rating)}">${rFmtS}</span>`;
                    }
                    h += `<span class="rnd-lu-r5" data-pid="${p.player_id}">···</span>`;
                    h += `</div>`;
                });
                return h;
            };

            // ── Position → grid cell [row, col] (1-based) ──
            // Grid: 12 columns (home GK=1 ... away GK=12), 5 rows (L=1, CL=2, C=3, CR=4, R=5)
            // Home cols: GK=1, D=2, DM=3, M=4, OM=5, FC=6
            // Away cols: FC=7, OM=8, M=9, DM=10, D=11, GK=12
            // Rows: L=1, CL=2, C=3, CR=4, R=5  (for home DL is bottom=row5, DR is top=row1)
            const homePosMap = {
                gk: [3, 1],
                dl: [1, 2], dcl: [2, 2], dc: [3, 2], dcr: [4, 2], dr: [5, 2],
                dml: [1, 3], dmcl: [2, 3], dmc: [3, 3], dmcr: [4, 3], dmr: [5, 3],
                ml: [1, 4], mcl: [2, 4], mc: [3, 4], mcr: [4, 4], mr: [5, 4],
                oml: [1, 5], omcl: [2, 5], omc: [3, 5], omcr: [4, 5], omr: [5, 5],
                fcl: [2, 6], fc: [3, 6], fcr: [4, 6]
            };
            const awayPosMap = {
                gk: [3, 12],
                dl: [5, 11], dcl: [4, 11], dc: [3, 11], dcr: [2, 11], dr: [1, 11],
                dml: [5, 10], dmcl: [4, 10], dmc: [3, 10], dmcr: [2, 10], dmr: [1, 10],
                ml: [5, 9], mcl: [4, 9], mc: [3, 9], mcr: [2, 9], mr: [1, 9],
                oml: [5, 8], omcl: [4, 8], omc: [3, 8], omcr: [2, 8], omr: [1, 8],
                fcl: [4, 7], fc: [3, 7], fcr: [2, 7]
            };

            // SVG pitch markings (horizontal: 150 wide x 100 tall, ratio 3:2 matches container)
            const lw = 0.4, clr = 'rgba(255,255,255,0.22)', clr2 = 'rgba(255,255,255,0.3)';
            const pitchSVG = `<svg class="rnd-pitch-lines" viewBox="0 0 150 100" preserveAspectRatio="xMidYMid meet">
            <!-- outer boundary -->
            <rect x="0" y="0" width="150" height="100" fill="none" stroke="${clr}" stroke-width="0.5"/>
            <!-- halfway line -->
            <line x1="75" y1="0" x2="75" y2="100" stroke="${clr}" stroke-width="${lw}"/>
            <!-- center circle & spot -->
            <circle cx="75" cy="50" r="13" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <circle cx="75" cy="50" r="1.2" fill="${clr2}"/>
            <!-- LEFT penalty area (24 deep, 60 wide centered) -->
            <rect x="0" y="20" width="24" height="60" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- LEFT goal area (8 deep, 28 wide centered) -->
            <rect x="0" y="36" width="8" height="28" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- LEFT penalty spot -->
            <circle cx="16" cy="50" r="1.2" fill="${clr2}"/>
            <!-- LEFT penalty arc (D) -->
            <path d="M 24 39.75 A 13 13 0 0 1 24 60.25" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- RIGHT penalty area -->
            <rect x="126" y="20" width="24" height="60" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- RIGHT goal area -->
            <rect x="142" y="36" width="8" height="28" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- RIGHT penalty spot -->
            <circle cx="134" cy="50" r="1.2" fill="${clr2}"/>
            <!-- RIGHT penalty arc (D) -->
            <path d="M 126 39.75 A 13 13 0 0 0 126 60.25" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- corner arcs -->
            <path d="M 0 1.5 A 1.5 1.5 0 0 1 1.5 0" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 0 98.5 A 1.5 1.5 0 0 0 1.5 100" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 148.5 0 A 1.5 1.5 0 0 1 150 1.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 150 98.5 A 1.5 1.5 0 0 0 148.5 100" fill="none" stroke="${clr}" stroke-width="${lw}"/>
        </svg>`;

            // Build face image URL from udseende2 data
            const faceUrl = (p, clubColor) => {
                const u = p.udseende2 || {};
                const clrHex = clubColor.replace('#', '');
                return `https://trophymanager.com/pics/player_pic2.php?face=${u.face || 1}&nose=${u.nose || 1}&eyes=${u.eyes || 1}&ears=${u.ears || 1}&mouth=${u.mouth || 1}&brows=${u.brows || 1}&hcolor=${u.hair_color || 1}&scolor=${u.skin_color || 1}&hair=${u.hair || 1}&age=${p.age || 25}&rgb=${clrHex}&w=96`;
            };
            const faceNode = (p, clubColor) => {
                const url = faceUrl(p, clubColor);
                return `<div class="rnd-pitch-face" style="border:2.5px solid ${clubColor}">`
                    + `<img src="${url}" alt="${p.no}"></div>`;
            };

            // Build grid cells: 5 rows × 12 cols = 60 cells
            // Use active roster (subs in, reds out) for pitch placement
            const roster = computeActiveRoster(mData, curMin, curEvtIdx);
            const allLineup = { ...mData.lineup.home, ...mData.lineup.away };

            const cellMap = {};  // "row-col" → html
            const cellPidMap = {};  // "row-col" → player id
            const placeNode = (pid, posMap, color, overridePos) => {
                const p = allLineup[pid];
                if (!p) return;
                const posKey = overridePos || p.position;
                const pos = posMap[posKey];
                if (!pos) return;
                const [row, col] = pos;
                const key = `${row}-${col}`;
                const evts = eventIcons(p.player_id);
                const rFmt = (matchEnded && p.rating) ? Number(p.rating).toFixed(1) : '';
                const isCaptain = String(p.player_id) === homeCaptainId || String(p.player_id) === awayCaptainId;
                const isMom = matchEnded && Number(p.mom) === 1;
                cellPidMap[key] = pid;
                let h = faceNode(p, color);
                // Captain armband indicator on face
                if (isCaptain) h += `<div class="rnd-pitch-captain">C</div>`;
                // MOM star on face
                if (isMom) h += `<div class="rnd-pitch-mom">⭐</div>`;
                h += `<div class="rnd-pitch-info">`;
                h += `<div class="rnd-pitch-label">${p.nameLast || fmtName(p)}</div>`;
                if (rFmt) h += `<div class="rnd-pitch-rating" style="color:${ratingColor(p.rating)}">${rFmt}</div>`;
                if (evts) h += `<div class="rnd-pitch-events">${evts}</div>`;
                h += `</div>`;
                cellMap[key] = h;
            };
            roster.homeActive.forEach(pid => {
                const overridePos = roster.subbedPositions.get(pid);
                placeNode(pid, homePosMap, homeColor, overridePos);
            });
            roster.awayActive.forEach(pid => {
                const overridePos = roster.subbedPositions.get(pid);
                placeNode(pid, awayPosMap, awayColor, overridePos);
            });

            // Build grid HTML
            let gridHTML = '';
            for (let r = 1; r <= 5; r++) {
                for (let c = 1; c <= 12; c++) {
                    const key = `${r}-${c}`;
                    const pidAttr = cellPidMap[key] ? ` data-pid="${cellPidMap[key]}"` : '';
                    gridHTML += `<div class="rnd-pitch-cell"${pidAttr}>${cellMap[key] || ''}</div>`;
                }
            }

            let html = '';

            // ── Build per-side tactics HTML ──
            const md = mData.match_data;
            const mentalityMap = { 1: 'Very Defensive', 2: 'Defensive', 3: 'Slightly Defensive', 4: 'Normal', 5: 'Slightly Attacking', 6: 'Attacking', 7: 'Very Attacking' };
            const styleMap = { 1: 'Balanced', 2: 'Direct', 3: 'Wings', 4: 'Short Passing', 5: 'Long Balls', 6: 'Through Balls' };
            const focusMap = { 1: 'Balanced', 2: 'Left', 3: 'Central', 4: 'Right' };
            const focusIcons = { Balanced: '⚖️', Left: '⬅️', Central: '⬆️', Right: '➡️' };

            // Compute live mentality (apply mentality_change events up to current minute)
            const homeClubId = String(mData.club.home.id);
            const awayClubId = String(mData.club.away.id);

            const liveMentality = {
                home: Number(md.mentality ? md.mentality.home : 4),
                away: Number(md.mentality ? md.mentality.away : 4)
            };
            {
                const rpt = mData.report || {};
                Object.keys(rpt).forEach(minKey => {
                    const eMin = Number(minKey);
                    (rpt[minKey] || []).forEach((evt, si) => {
                        if (!isEventVisible(eMin, si, curMin, curEvtIdx)) return;
                        if (!evt.parameters) return;
                        evt.parameters.forEach(param => {
                            if (param.mentality_change) {
                                const mc = param.mentality_change;
                                const teamId = String(mc.team);
                                if (teamId === homeClubId) liveMentality.home = Number(mc.mentality);
                                else if (teamId === awayClubId) liveMentality.away = Number(mc.mentality);
                            }
                        });
                    });
                });
            }
            const buildTactics = (side) => {
                const future = isMatchFuture(mData);
                let t = '<div class="rnd-tactics-section"><div class="rnd-tactics-grid">';
                // Avg R5 (filled async)
                t += `<div class="rnd-tactic-row r5-row" data-avg-r5="${side}">
                <span class="rnd-tactic-icon">⭐</span>
                <span class="rnd-tactic-label">Avg R5</span>
                <div class="rnd-tactic-meter"><div class="rnd-r5-side-meter-fill ${side}" style="width:0%"></div></div>
                <span class="rnd-r5-side-val" style="font-size:11px;font-weight:800;color:#e0f0cc;min-width:36px;text-align:right">···</span>
            </div>`;
                // Mentality (live)
                {
                    const lvl = liveMentality[side];
                    const val = mentalityMap[lvl] || lvl;
                    t += `<div class="rnd-tactic-row">
                    <span class="rnd-tactic-icon">⚔️</span>
                    <span class="rnd-tactic-label">Mentality</span>
                    <div class="rnd-tactic-meter"><div class="rnd-tactic-meter-fill ${side}" style="width:${Math.round(lvl / 7 * 100)}%"></div></div>
                    <span class="rnd-tactic-value">${val}</span>
                </div>`;
                }
                // Attacking Style
                if (md.attacking_style && md.attacking_style[side]) {
                    const sVal = styleMap[md.attacking_style[side]] || md.attacking_style[side];
                    t += `<div class="rnd-tactic-row">
                    <span class="rnd-tactic-icon">🎯</span>
                    <span class="rnd-tactic-label">Style</span>
                    <span class="rnd-tactic-value-pill ${side}">${sVal}</span>
                </div>`;
                }
                // Focus Side
                if (md.focus_side && md.focus_side[side]) {
                    const fVal = focusMap[md.focus_side[side]] || md.focus_side[side];
                    const fIcon = focusIcons[fVal] || '⬆️';
                    t += `<div class="rnd-tactic-row">
                    <span class="rnd-tactic-icon">◎</span>
                    <span class="rnd-tactic-label">Focus</span>
                    <span class="rnd-tactic-value-pill ${side}">${fIcon} ${fVal}</span>
                </div>`;
                }
                // Lineup Out (unavailable players) — prematch only
                if (future && md.lineup_out && md.lineup_out[side]) {
                    const outPlayers = Object.values(md.lineup_out[side]);
                    if (outPlayers.length) {
                        t += `<div class="rnd-tactic-row" style="margin-top:6px;border-top:1px solid rgba(80,160,48,.1);padding-top:6px">
                        <span class="rnd-tactic-icon">🚫</span>
                        <span class="rnd-tactic-label" style="color:#c86a4a">Unavailable</span>
                    </div>`;
                        outPlayers.forEach(op => {
                            t += `<div class="rnd-tactic-row">
                            <span class="rnd-tactic-icon" style="font-size:10px;color:#c86a4a">✕</span>
                            <span class="rnd-tactic-value" style="color:#c86a4a;font-size:11px">${op.name}</span>
                        </div>`;
                        });
                    }
                }
                t += '</div></div>';
                return t;
            };

            const isLive = liveState && !liveState.ended;
            // During live: if rnd-lu-wrap already exists, update ONLY the wrap content
            // This avoids destroying/recreating the Unity viewport (no blink)
            const existingWrap = body.find('.rnd-lu-wrap');
            if (isLive && existingWrap.length) {
                // Build only the wrap content (lists + pitch)
                let wrapHtml = '';
                wrapHtml += `<div class="rnd-lu-list">${renderList(home, homeColor, 'home')}${buildTactics('home')}</div>`;
                wrapHtml += `<div class="rnd-pitch-wrap">
              <div class="rnd-pitch">${pitchSVG}<div class="rnd-pitch-grid">${gridHTML}</div></div>
            </div>`;
                wrapHtml += `<div class="rnd-lu-list">${renderList(away, awayColor, 'away')}${buildTactics('away')}</div>`;
                existingWrap.html(wrapHtml);
            } else {
                // First render or match ended: full rebuild — save canvas first
                saveUnityCanvas();
                if (isLive) {
                    html += '<div class="rnd-lu-outer">';
                }
                // Unity viewport row: feed | viewport | stats (hide when match ended)
                if (isMatchPage && isLive) {
                    const noUnityClass = (!unityState || !unityState.available) ? ' rnd-no-unity' : '';
                    html += `<div class="rnd-unity-row${noUnityClass}">`;
                    html += '<div class="rnd-unity-feed" id="rnd-unity-feed"></div>';
                    html += '<div id="rnd-unity-viewport" class="rnd-unity-viewport" style="display:none;flex:1 1 auto;"></div>';
                    html += '<div class="rnd-unity-stats" id="rnd-unity-stats"></div>';
                    html += '</div>';
                }
                html += '<div class="rnd-lu-wrap">';
                html += `<div class="rnd-lu-list">${renderList(home, homeColor, 'home')}${buildTactics('home')}</div>`;
                html += `<div class="rnd-pitch-wrap">
              <div class="rnd-pitch">${pitchSVG}<div class="rnd-pitch-grid">${gridHTML}</div></div>
            </div>`;
                html += `<div class="rnd-lu-list">${renderList(away, awayColor, 'away')}${buildTactics('away')}</div>`;
                html += '</div>';
                if (isLive) html += '</div>';

                body.html(html);

                // Player card dialog click handler
                body.on('click', '.rnd-lu-clickable', function () {
                    const clickedPid = $(this).data('pid');
                    if (!clickedPid) return;
                    // Read live state at click time, not at render time
                    const _ls = getLiveState();
                    const cMin = _ls ? _ls.min : 999;
                    const cIdx = _ls ? _ls.curEvtIdx : 999;
                    const cParamIdx = (_ls && !_ls.ended && !_ls.curEvtComplete) ? cIdx - 1 : cIdx;
                    _showPlayerDialog(clickedPid, mData, cMin, cParamIdx, opts);
                });

                // Initialize stats panel with zeros
                updateUnityStats();

                // ── Pitch hover tooltip ──
                const GK_SKILL_NAMES = ['Str', 'Sta', 'Pac', 'Han', 'One', 'Ref', 'Aer', 'Jum', 'Com', 'Kic', 'Thr'];
                const FIELD_SKILL_NAMES = ['Str', 'Sta', 'Pac', 'Mar', 'Tac', 'Wor', 'Pos', 'Pas', 'Cro', 'Tec', 'Hea', 'Fin', 'Lon', 'Set'];
                let pitchTooltipEl = null;
                let pitchTooltipTimer = null;

                const removePitchTooltip = () => {
                    clearTimeout(pitchTooltipTimer);
                    if (pitchTooltipEl) { pitchTooltipEl.remove(); pitchTooltipEl = null; }
                };

                const skillValColor = TmUtils.skillColor;

                body.on('mouseenter', '.rnd-pitch-cell[data-pid], .rnd-lu-player[data-pid]', function (e) {
                    const cell = $(this);
                    const pid = String(cell.data('pid'));
                    removePitchTooltip();

                    // Create tooltip with loading state
                    pitchTooltipEl = $('<div class="rnd-pitch-tooltip"></div>').html(TmUI.loading('Loading…', true)).appendTo('body');
                    const tt = pitchTooltipEl;

                    // Position tooltip
                    const rect = this.getBoundingClientRect();
                    const ttLeft = rect.right + 8;
                    const ttTop = rect.top;
                    tt.css({ left: ttLeft + 'px', top: ttTop + 'px' });

                    // Show after brief delay
                    pitchTooltipTimer = setTimeout(() => {
                        tt.addClass('visible');
                    }, 80);

                    // Fetch player data
                    fetchTooltip(pid).then(rawData => {
                        if (!pitchTooltipEl || pitchTooltipEl !== tt) return; // tooltip was removed
                        const player = JSON.parse(JSON.stringify(rawData.player));
                        const lineupP = allLineup[pid];
                        if (routineMap.has(pid)) player.routine = String(routineMap.get(pid));
                        if (positionMap.has(pid)) player.favposition = positionMap.get(pid);

                        const DBPlayer = TmPlayerDB.get(parseInt(player.player_id));
                        TmApi.normalizePlayer(player, DBPlayer, { skipSync: true });
                        const skills = player.skills.map(s => s.value);
                        const isGK = player.isGK;
                        const skillNames = isGK ? GK_SKILL_NAMES : FIELD_SKILL_NAMES;

                        const r5 = player.r5;
                        const rec = player.rec;

                        let h = '<div class="rnd-pitch-tooltip-header">';
                        h += `<div><div class="rnd-pitch-tooltip-name">${player.name || lineupP?.name || ''}</div>`;
                        const ageYears = Number(player.age || lineupP?.age || 0);
                        const ageMonths = Number(player.months || 0);
                        const ageDisplay = ageMonths ? `${ageYears}.${ageMonths}` : String(ageYears || '?');
                        let infoLine = `${(lineupP?.position || '').toUpperCase()} · #${lineupP?.no || ''} · Age ${ageDisplay}`;
                        if (player.country) {
                            const flagUrl = `https://trophymanager.com/pics/flags/gradient/${player.country}.png`;
                            infoLine += ` · <img src="${flagUrl}" style="height:11px;vertical-align:-1px;margin:0 2px" onerror="this.style.display='none'">`;
                        }
                        h += `<div class="rnd-pitch-tooltip-pos">${infoLine}</div></div>`;
                        h += '<div class="rnd-pitch-tooltip-badges">';
                        h += `<span class="rnd-pitch-tooltip-badge" style="color:${r5Color(r5)}">R5 ${r5.toFixed(2)}</span>`;
                        h += '</div></div>';

                        // Skills two-column layout
                        const fieldLeft = [0, 1, 2, 3, 4, 5, 6];    // Str,Sta,Pac,Mar,Tac,Wor,Pos
                        const fieldRight = [7, 8, 9, 10, 11, 12, 13]; // Pas,Cro,Tec,Hea,Fin,Lon,Set
                        const gkLeft = [0, 1, 2];                   // Str,Sta,Pac
                        const gkRight = [3, 4, 5, 6, 7, 8, 9, 10];  // Han,One,Ref,Aer,Jum,Com,Kic,Thr
                        const leftIdx = isGK ? gkLeft : fieldLeft;
                        const rightIdx = isGK ? gkRight : fieldRight;

                        const renderCol = (indices) => {
                            let c = '<div class="rnd-pitch-tooltip-skills-col">';
                            indices.forEach(i => {
                                const val = typeof skills[i] === 'number' ? skills[i] : parseInt(skills[i]);
                                const display = TmUtils.formatSkill(val).display;
                                c += `<div class="rnd-pitch-tooltip-skill">`;
                                c += `<span class="rnd-pitch-tooltip-skill-name">${skillNames[i] || ''}</span>`;
                                c += `<span class="rnd-pitch-tooltip-skill-val" style="color:${skillValColor(val)}">${display}</span>`;
                                c += '</div>';
                            });
                            c += '</div>';
                            return c;
                        };
                        h += '<div class="rnd-pitch-tooltip-skills">';
                        h += renderCol(leftIdx);
                        h += renderCol(rightIdx);
                        h += '</div>';

                        // Footer: ASI, REC, Routine, Rating
                        h += '<div class="rnd-pitch-tooltip-footer">';
                        h += `<div class="rnd-pitch-tooltip-stat"><div class="rnd-pitch-tooltip-stat-val" style="color:#e0f0cc">${player.asi.toLocaleString()}</div><div class="rnd-pitch-tooltip-stat-lbl">ASI</div></div>`;
                        h += `<div class="rnd-pitch-tooltip-stat"><div class="rnd-pitch-tooltip-stat-val" style="color:${getColor(rec, REC_THRESHOLDS)}">${rec}</div><div class="rnd-pitch-tooltip-stat-lbl">REC</div></div>`;
                        h += `<div class="rnd-pitch-tooltip-stat"><div class="rnd-pitch-tooltip-stat-val" style="color:#8abc78">${parseFloat(player.routine).toFixed(1)}</div><div class="rnd-pitch-tooltip-stat-lbl">Routine</div></div>`;
                        h += '</div>';

                        tt.html(h);

                        // Reposition if off-screen
                        const ttRect = tt[0].getBoundingClientRect();
                        if (ttRect.right > window.innerWidth - 10) {
                            tt.css('left', (rect.left - ttRect.width - 8) + 'px');
                        }
                        if (ttRect.bottom > window.innerHeight - 10) {
                            tt.css('top', Math.max(10, window.innerHeight - ttRect.height - 10) + 'px');
                        }
                    }).catch(() => {
                        if (pitchTooltipEl === tt) {
                            tt.html(TmUI.empty('No data', true));
                        }
                    });
                });

                body.on('mouseleave', '.rnd-pitch-cell[data-pid], .rnd-lu-player[data-pid]', removePitchTooltip);

                // ── Unity: move canvas into viewport on match page ──
                if (isMatchPage && unityState.available) {
                    setTimeout(() => {
                        const vp = document.getElementById('rnd-unity-viewport');
                        if (vp) {
                            moveUnityCanvas();
                            vp.style.display = 'block';
                        }
                    }, 100);
                }
            }



            // Async: fetch R5 for all players
            const routineMap = new Map();
            const positionMap = new Map();
            const allPlayers = [...Object.values(mData.lineup.home), ...Object.values(mData.lineup.away)];
            allPlayers.forEach(p => {
                routineMap.set(p.player_id, parseFloat(p.routine));
                if (p.fp) positionMap.set(p.player_id, p.fp);
            });
            // Active roster IDs for avg R5 (based on current live minute — subs/reds applied)
            const homeActiveIds = roster.homeActive;
            const awayActiveIds = roster.awayActive;
            Promise.all(allPlayers.map(p =>
                getPlayerData(p.player_id, routineMap, positionMap)
                    .then(d => ({ id: p.player_id, r5: d.R5 }))
                    .catch(() => ({ id: p.player_id, r5: null }))
            )).then(results => {
                const homeR5s = [], awayR5s = [];
                results.forEach(({ id, r5 }) => {
                    const el = body.find(`.rnd-lu-r5[data-pid="${id}"]`);
                    if (el.length && r5 !== null) {
                        el.text(r5).css('background', r5Color(r5));
                    }
                    // Only currently active players count for avg R5
                    if (r5 !== null) {
                        if (homeActiveIds.has(String(id))) homeR5s.push(r5);
                        else if (awayActiveIds.has(String(id))) awayR5s.push(r5);
                    }
                });
                // Fill avg R5 bars (always /11 even if red card reduced count)
                const fillAvg = (side, vals) => {
                    if (!vals.length) return;
                    const avg = vals.reduce((a, b) => a + b, 0) / 11;
                    const pct = Math.min(100, Math.max(0, Math.round((avg - 40) / (120 - 40) * 100)));
                    const card = body.find(`[data-avg-r5="${side}"]`);
                    card.find('.rnd-r5-side-meter-fill').css('width', pct + '%');
                    card.find('.rnd-r5-side-val').text(avg.toFixed(2)).css('color', r5Color(avg));
                };
                fillAvg('home', homeR5s);
                fillAvg('away', awayR5s);
                // Update header R5 chips
                const headerR5 = (side, vals) => {
                    if (!vals.length) return;
                    const avg = vals.reduce((a, b) => a + b, 0) / 11;
                    $(`#rnd-chip-r5-${side} .chip-val`).text(avg.toFixed(2));
                };
                headerR5('home', homeR5s);
                headerR5('away', awayR5s);
            });
        },
        showPlayer(playerId, mData, curMin, curEvtIdx, opts) {
            _showPlayerDialog(playerId, mData, curMin, curEvtIdx, opts);
        }
    };
