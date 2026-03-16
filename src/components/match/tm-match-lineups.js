import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmPlayerTooltip } from '../player/tm-player-tooltip.js';
import { TmMatchUtils } from '../../utils/match.js';
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
const mentalityMap = TmConst.MENTALITY_MAP_LONG;
const styleMap = TmConst.STYLE_MAP;
const focusMap = TmConst.FOCUS_MAP;
const focusIcons = { Balanced: '⚖️', Left: '⬅️', Central: '⬆️', Right: '➡️' };
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
    render(body, liveState, sharedOpts) {
        const { saveUnityCanvas, updateUnityStats } = sharedOpts;
        const unityState = sharedOpts.getUnityState ? sharedOpts.getUnityState() : null;
        const { mData } = liveState || {};
        const matchFuture = TmMatchUtils.isMatchFuture(mData);
        const matchEnded = !matchFuture && (!liveState || liveState.ended);
        const homeColor = mData.teams.home.color;
        const awayColor = mData.teams.away.color;

        // Build per-player stats for all players
        const home = { starters: mData.teams.home.starting || [], subs: mData.teams.home.subs || [] };
        const away = { starters: mData.teams.away.starting || [], subs: mData.teams.away.subs || [] };
        const allPlayers = [...home.starters, ...home.subs, ...away.starters, ...away.subs];
        const pEvents = Object.fromEntries(allPlayers.map(player => [String(player.player_id), player]));

        // Build event icons string for a player — only lineupIcon cols with count > 0
        const eventIcons = (pid) => {
            const result = pEvents[String(pid)];
            if (!result?.grouped?.length) return '';
            return result.grouped
                .filter(col => col.lineupIcon).map(col => {
                    const prefix = (!col.lineupBool && col.count > 1) ? col.count + '×' : '';
                    const icon = col.iconStyle
                        ? `<span style="${col.iconStyle}">${col.icon}</span>`
                        : (col.icon || col.abbr);
                    return prefix + icon;
                }).join('');
        };

        const ratingColor = TmUtils.ratingColor;
        const r5Color = TmUtils.r5Color;

        const renderList = (team) => {
            let h = '';
            team.starters.forEach(p => {
                const pid = String(p.player_id);
                const evts = eventIcons(p.player_id);
                const isMom = matchEnded && Number(p.mom) === 1;
                h += `<div class="rnd-lu-player${mData.profilesReady ? ' rnd-lu-clickable' : ''}" data-pid="${pid}">`;
                h += `<span class="rnd-lu-pos">${TmPosition.chip([p.position])}</span>`;
                h += `<span class="rnd-lu-name ml-3">${p.name}`;
                if (!!p.captain) h += ` <span class="rnd-lu-captain" title="Captain">©</span>`;
                if (isMom) h += ` <span class="rnd-lu-mom" title="Man of the Match">⭐</span>`;
                h += `</span>`;
                if (evts) h += `<span class="rnd-lu-events">${evts}</span>`;
                if (matchEnded) {
                    const rFmt = p.rating ? Number(p.rating).toFixed(2) : '-';
                    h += `<span class="rnd-lu-rating" style="color:${ratingColor(p.rating)}">${rFmt}</span>`;
                }
                const r5Badge = p.r5 !== null && p.r5 !== undefined ? p.r5 : '···';
                const r5Style = p.r5 !== null && p.r5 !== undefined ? ` style="background:${r5Color(p.r5)}"` : '';
                h += `<span class="rnd-lu-r5" data-pid="${p.player_id}"${r5Style}>${r5Badge}</span>`;
                h += `</div>`;
            });
            h += `<div class="rnd-lu-sub-header">Substitutes</div>`;
            team.subs.forEach(p => {
                const pid = String(p.player_id);
                const evts = eventIcons(p.player_id);
                const isMom = matchEnded && Number(p.mom) === 1;
                const subPosStr = (p.fp || '').split(',')[0].toUpperCase() || '?';
                const isGkSub = subPosStr === 'GK';
                h += `<div class="rnd-lu-player${mData.profilesReady ? ' rnd-lu-clickable' : ''}" data-pid="${pid}">`;
                h += `<span class="rnd-lu-pos">${TmPosition.chip([(p.fp || '').split(',')[0]])}</span>`;
                h += `<span class="rnd-lu-name ml-3"${isGkSub ? ' style="color:#7a9a68"' : ''}>${p.name}`;
                if (isMom) h += ` <span class="rnd-lu-mom" title="Man of the Match">⭐</span>`;
                h += `</span>`;
                if (evts) h += `<span class="rnd-lu-events">${evts}</span>`;
                if (matchEnded) {
                    const rFmtS = p.rating ? Number(p.rating).toFixed(2) : '-';
                    h += `<span class="rnd-lu-rating" style="color:${ratingColor(p.rating)}">${rFmtS}</span>`;
                }
                const r5Badge = p.r5 !== null && p.r5 !== undefined ? p.r5 : '···';
                const r5Style = p.r5 !== null && p.r5 !== undefined ? ` style="background:${r5Color(p.r5)}"` : '';
                h += `<span class="rnd-lu-r5" data-pid="${p.player_id}"${r5Style}>${r5Badge}</span>`;
                h += `</div>`;
            });
            return h;
        };

        // Build face node from pre-computed faceUrl
        const faceNode = (p, clubColor) =>
            `<div class="rnd-pitch-face" style="border:2.5px solid ${clubColor}"><img src="${p.faceUrl}" alt="${p.no}"></div>`;

        // Build grid cells: 5 rows × 12 cols = 60 cells
        // teams.home.lineup / teams.away.lineup already represent the active roster for this step
        const allLineup = Object.fromEntries([
            ...(mData.teams.home.lineup || []),
            ...(mData.teams.away.lineup || []),
        ].map(player => [String(player.player_id), player]));

        const cellMap = {};  // "row-col" → html
        const cellPidMap = {};  // "row-col" → player id
        const placeNode = (pid, posMap, color) => {
            const p = allLineup[pid];
            if (!p) return;
            const posKey = p.position;
            const pos = posMap[posKey];
            if (!pos) return;
            const [row, col] = pos;
            const key = `${row}-${col}`;
            const evts = eventIcons(p.player_id);
            const rFmt = (matchEnded && p.rating) ? Number(p.rating).toFixed(1) : '';
            const isCaptain = !!p.captain;
            const isMom = matchEnded && Number(p.mom) === 1;
            cellPidMap[key] = pid;
            let h = faceNode(p, color);
            // Captain armband indicator on face
            if (isCaptain) h += `<div class="rnd-pitch-captain">C</div>`;
            // MOM star on face
            if (isMom) h += `<div class="rnd-pitch-mom">⭐</div>`;
            h += `<div class="rnd-pitch-info">`;
            h += `<div class="rnd-pitch-label">${p.nameLast || p.name}</div>`;
            if (rFmt) h += `<div class="rnd-pitch-rating" style="color:${ratingColor(p.rating)}">${rFmt}</div>`;
            if (evts) h += `<div class="rnd-pitch-events">${evts}</div>`;
            h += `</div>`;
            cellMap[key] = h;
        };
        (mData.teams.home.lineup || []).forEach(player => {
            placeNode(String(player.player_id), homePosMap, homeColor);
        });
        (mData.teams.away.lineup || []).forEach(player => {
            placeNode(String(player.player_id), awayPosMap, awayColor);
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
        const buildTactics = (side) => {
            const future = TmMatchUtils.isMatchFuture(mData);
            const team = mData.teams[side];
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
                const lvl = team.mentality;
                const val = team.mentalityLabel || mentalityMap[lvl] || lvl;
                t += `<div class="rnd-tactic-row">
                    <span class="rnd-tactic-icon">⚔️</span>
                    <span class="rnd-tactic-label">Mentality</span>
                    <div class="rnd-tactic-meter"><div class="rnd-tactic-meter-fill ${side}" style="width:${Math.round(lvl / 7 * 100)}%"></div></div>
                    <span class="rnd-tactic-value">${val}</span>
                </div>`;
            }
            // Attacking Style
            if (team.attackingStyle) {
                const sVal = team.attackingStyleLabel || styleMap[team.attackingStyle] || team.attackingStyle;
                t += `<div class="rnd-tactic-row">
                    <span class="rnd-tactic-icon">🎯</span>
                    <span class="rnd-tactic-label">Style</span>
                    <span class="rnd-tactic-value-pill ${side}">${sVal}</span>
                </div>`;
            }
            // Focus Side
            if (team.focusSide) {
                const fVal = team.focusSideLabel || focusMap[team.focusSide] || team.focusSide;
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
            if (isLive) {
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
                const player = mData.teams.home.lineup[clickedPid] || mData.teams.away.lineup[clickedPid];
                if (!player) return;
                // Recompute from full mData.plays at click time (live reference, not animation-filtered)
                const pe = pEvents[String(clickedPid)];
                showPlayerDialog({ ...player, minsPlayed: pe?.minsPlayed, statsArray: pe?.statsArray || pe?.perMinute || [] }, mData, opts);
            });

            // Initialize stats panel with zeros
            updateUnityStats();

            // ── Pitch hover tooltip ──
            let pitchTooltipTimer = null;

            const removePitchTooltip = () => {
                clearTimeout(pitchTooltipTimer);
                TmPlayerTooltip.hide();
            };

            body.on('mouseenter', '.rnd-pitch-cell[data-pid], .rnd-lu-player[data-pid]', function (e) {
                const pid = String($(this).data('pid'));
                removePitchTooltip();

                const player = allLineup[pid];
                if (!player?.skills) return;

                pitchTooltipTimer = setTimeout(() => {
                    TmPlayerTooltip.show(this, player);
                }, 80);
            });

            body.on('mouseleave', '.rnd-pitch-cell[data-pid], .rnd-lu-player[data-pid]', removePitchTooltip);

            // ── Unity: move canvas into viewport on match page ──
            if (unityState.available) {
                setTimeout(() => {
                    const vp = document.getElementById('rnd-unity-viewport');
                    if (vp) {
                        moveUnityCanvas();
                        vp.style.display = 'block';
                    }
                }, 100);
            }
        }

        // Fill avg R5 bars from precomputed team data
        if (mData.profilesReady) {
            const fillAvg = (side, avg) => {
                if (avg === null || avg === undefined) return;
                const pct = Math.min(100, Math.max(0, Math.round((avg - 40) / (120 - 40) * 100)));
                const card = body.find(`[data-avg-r5="${side}"]`);
                card.find('.rnd-r5-side-meter-fill').css('width', pct + '%');
                card.find('.rnd-r5-side-val').text(avg.toFixed(2)).css('color', r5Color(avg));
            };
            fillAvg('home', mData.teams.home.avgR5);
            fillAvg('away', mData.teams.away.avgR5);
            // Update header R5 chips
            const headerR5 = (side, avg) => {
                if (avg === null || avg === undefined) return;
                $(`#rnd-chip-r5-${side} .chip-val`).text(avg.toFixed(2));
            };
            headerR5('home', mData.teams.home.avgR5);
            headerR5('away', mData.teams.away.avgR5);
        }
    },
};
