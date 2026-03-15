import { TmConst } from '../../lib/tm-constants.js';
import { TmPlayerDB } from '../../lib/tm-playerdb.js';
import { TmApi } from '../../lib/tm-services.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmMatchUtils } from './tm-match-utils.js';
import { showPlayerDialog } from './tm-match-player-dialog.js';

// ── Pitch grid position maps — [row, col] (1-based), 5 rows × 12 cols ──
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
const mentalityMap = { 1: 'Very Defensive', 2: 'Defensive', 3: 'Slightly Defensive', 4: 'Normal', 5: 'Slightly Attacking', 6: 'Attacking', 7: 'Very Attacking' };
const styleMap     = TmConst.STYLE_MAP;
const focusMap     = { 1: 'Balanced', 2: 'Left', 3: 'Central', 4: 'Right' };
const focusIcons   = { Balanced: '⚖️', Left: '⬅️', Central: '⬆️', Right: '➡️' };
// SVG pitch markings — static, created once at module load
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
        const homeColor = mData.club.home.color;
        const awayColor = mData.club.away.color;

        // Split starters and subs
        const splitLineup = (lineup) => {
            const starters = [], subs = [];
            Object.values(lineup).forEach(p => {
                if (p.position.includes('sub')) subs.push(p); else starters.push(p);
            });
            // Sort starters by position order
            const posOrder = TmConst.POSITION_ORDER;
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
                if (evt.goal) {
                    const pid = String(evt.goal.player);
                    if (!pEvents[pid]) pEvents[pid] = initPE();
                    pEvents[pid].goals++;
                    if (evt.goal.assist) {
                        const aid = String(evt.goal.assist);
                        if (!pEvents[aid]) pEvents[aid] = initPE();
                        pEvents[aid].assists++;
                    }
                }
                if (evt.yellow) {
                    const pid = String(evt.yellow);
                    if (!pEvents[pid]) pEvents[pid] = initPE();
                    pEvents[pid].yellows++;
                }
                if (evt.yellow_red) {
                    const pid = String(evt.yellow_red);
                    if (!pEvents[pid]) pEvents[pid] = initPE();
                    pEvents[pid].reds++; pEvents[pid].yellows++;
                }
                if (evt.red) {
                    const pid = String(evt.red);
                    if (!pEvents[pid]) pEvents[pid] = initPE();
                    pEvents[pid].reds++;
                }
                if (evt.injury) {
                    const pid = String(evt.injury);
                    if (!pEvents[pid]) pEvents[pid] = initPE();
                    pEvents[pid].injured = true;
                }
                if (evt.sub) {
                    const inId = String(evt.sub.player_in);
                    const outId = String(evt.sub.player_out);
                    if (!pEvents[inId]) pEvents[inId] = initPE();
                    if (!pEvents[outId]) pEvents[outId] = initPE();
                    pEvents[inId].subIn = true;
                    pEvents[outId].subOut = true;
                }
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

        const ratingColor = TmUtils.ratingColor;
        const r5Color = TmUtils.r5Color;

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
                h += `<span class="rnd-lu-pos">${TmPosition.chip([p.position], 'rnd-lu-pos-chip')}</span>`;
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
                h += `<span class="rnd-lu-pos">${TmPosition.chip([(p.fp || '').split(',')[0]], 'rnd-lu-pos-chip')}</span>`;
                if (matchEnded) {
                    const rFmtS = p.rating ? Number(p.rating).toFixed(2) : '-';
                    h += `<span class="rnd-lu-rating" style="color:${ratingColor(p.rating)}">${rFmtS}</span>`;
                }
                h += `<span class="rnd-lu-r5" data-pid="${p.player_id}">···</span>`;
                h += `</div>`;
            });
            return h;
        };

        // Build face image URL from udseende2 data
        const faceNode = (p, clubColor) => {
            const url = TmMatchUtils.faceUrl(p, clubColor);
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

        // ── Build per-side tactics HTML ── (mentalityMap, styleMap, focusMap, focusIcons defined at module level)
        const md = mData.match_data;

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
                    if (evt.mentality_change) {
                        const teamId = String(evt.mentality_change.team);
                        if (teamId === homeClubId) liveMentality.home = Number(evt.mentality_change.mentality);
                        else if (teamId === awayClubId) liveMentality.away = Number(evt.mentality_change.mentality);
                    }
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
                showPlayerDialog(clickedPid, mData, cMin, cParamIdx, opts);
            });

            // Initialize stats panel with zeros
            updateUnityStats();

            // ── Pitch hover tooltip ──
            const GK_SKILL_NAMES   = TmConst.SKILL_NAMES_GK_SHORT;
            const FIELD_SKILL_NAMES = TmConst.SKILL_LABELS_OUT;
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
        const allPlayers = mData.allPlayers;
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
        }).catch(() => { });
    },
    showPlayer(playerId, mData, curMin, curEvtIdx, opts) {
        showPlayerDialog(playerId, mData, curMin, curEvtIdx, opts);
    }
};
