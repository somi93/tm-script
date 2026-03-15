import { TmConst } from '../../lib/tm-constants.js';
import { TmPlayerDB } from '../../lib/tm-playerdb.js';
import { TmApi } from '../../lib/tm-services.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmMatchUtils } from './tm-match-utils.js';

/**
 * Show a per-player detail dialog overlay.
 *
 * @param {string|number} playerId
 * @param {object}        mData      — full match data object
 * @param {number}        curMin     — current live minute (999 = ended)
 * @param {number}        curEvtIdx  — current live event index (999 = ended)
 * @param {object}        opts       — shared match opts passed from match.js
 */
export const showPlayerDialog = (playerId, mData, curMin, curEvtIdx, opts) => {
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

    const clubColor = isHome ? mData.club.home.color : mData.club.away.color;

    // Face URL
    const fUrl = TmMatchUtils.faceUrl(p, clubColor);

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
            if (evt.sub) {
                if (String(evt.sub.player_in) === pid) subEvts.subInMin = min;
                if (String(evt.sub.player_out) === pid) subEvts.subOutMin = min;
            }
        });
    }
    const matchEndMin = mData.match_data?.regular_last_min || Math.max(...sortedMins, 90);
    if (isSub) {
        minsPlayed = subEvts.subInMin ? (subEvts.subOutMin || matchEndMin) - subEvts.subInMin : 0;
    } else {
        minsPlayed = subEvts.subOutMin || matchEndMin;
    }

    // ── Position display ──
    const rawPos = isSub ? (p.fp || '').split(',')[0] : p.position;

    // ── Build HTML ──
    const { ACTION_LABELS, ACTION_CLS } = TmConst;

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
    html += TmPosition.chip([rawPos]);
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
            [{ icon: '🧤', lbl: 'Saves', val: st.saves, cls: st.saves > 0 ? 'green' : '' },
            { icon: '⚽', lbl: 'Goals', val: st.goals, cls: st.goals > 0 ? 'gold' : '' },
            { icon: '👟', lbl: 'Assists', val: st.assists, cls: st.assists > 0 ? 'gold' : '' },
            { icon: '🔑', lbl: 'Key Pass', val: st.keyPasses, cls: st.keyPasses > 0 ? '' : '' },
            { icon: '🎯', lbl: 'Shots', val: st.shots, cls: '' },
            ].forEach(s => {
                html += `<div class="rnd-plr-stat-card ${s.cls}"><div class="rnd-plr-stat-icon">${s.icon}</div><div class="rnd-plr-stat-val">${s.val}</div><div class="rnd-plr-stat-lbl">${s.lbl}</div></div>`;
            });
        } else {
            [{ icon: '⚽', lbl: 'Goals', val: st.goals, cls: st.goals > 0 ? 'gold' : '' },
            { icon: '🎯', lbl: 'Shots', val: st.shots, cls: '' },
            { icon: '✅', lbl: 'On Target', val: st.shotsOnTarget, cls: st.shotsOnTarget > 0 ? 'green' : '' },
            { icon: '🦶', lbl: 'Foot G', val: st.goalsFoot, cls: st.goalsFoot > 0 ? 'gold' : '' },
            { icon: '🗣️', lbl: 'Head G', val: st.goalsHead, cls: st.goalsHead > 0 ? 'gold' : '' },
            ].forEach(s => {
                html += `<div class="rnd-plr-stat-card ${s.cls}"><div class="rnd-plr-stat-icon">${s.icon}</div><div class="rnd-plr-stat-val">${s.val}</div><div class="rnd-plr-stat-lbl">${s.lbl}</div></div>`;
            });
        }
        html += '</div>';

        // ── Passing & Creativity ──
        html += '<div class="rnd-plr-section-title"><span class="sec-icon">📊</span> Passing & Creativity</div>';
        html += '<div class="rnd-plr-stats-row">';
        const totalPasses = st.passesCompleted + st.passesFailed;
        const passAcc = totalPasses > 0 ? Math.round(st.passesCompleted / totalPasses * 100) : 0;
        const totalCross = st.crossesCompleted + st.crossesFailed;
        const crossAcc = totalCross > 0 ? Math.round(st.crossesCompleted / totalCross * 100) : 0;
        [{ icon: '👟', lbl: 'Assists', val: st.assists, cls: st.assists > 0 ? 'gold' : '' },
        { icon: '🔑', lbl: 'Key Pass', val: st.keyPasses, cls: st.keyPasses > 0 ? '' : '' },
        { icon: '📨', lbl: `Pass ${passAcc}%`, val: `${st.passesCompleted}/${totalPasses}`, cls: passAcc >= 70 ? 'green' : totalPasses > 0 ? 'red' : '' },
        { icon: '↗️', lbl: `Cross ${crossAcc}%`, val: `${st.crossesCompleted}/${totalCross}`, cls: crossAcc >= 50 ? 'green' : totalCross > 0 ? 'red' : '' },
        { icon: '📈', lbl: 'Total', val: totalPasses + totalCross, cls: '' },
        ].forEach(s => {
            html += `<div class="rnd-plr-stat-card ${s.cls}"><div class="rnd-plr-stat-icon">${s.icon}</div><div class="rnd-plr-stat-val">${s.val}</div><div class="rnd-plr-stat-lbl">${s.lbl}</div></div>`;
        });
        html += '</div>';

        // ── Defending & Duels ──
        html += '<div class="rnd-plr-section-title"><span class="sec-icon">🛡️</span> Defending & Duels</div>';
        html += '<div class="rnd-plr-stats-row">';
        [{ icon: '👁️', lbl: 'INT', val: st.interceptions, cls: st.interceptions > 0 ? 'green' : '' },
        { icon: '🦵', lbl: 'TKL', val: st.tackles, cls: st.tackles > 0 ? 'green' : '' },
        { icon: '🗣️', lbl: 'HC', val: st.headerClearances, cls: st.headerClearances > 0 ? 'green' : '' },
        { icon: '❌', lbl: 'TF', val: st.tackleFails, cls: st.tackleFails > 0 ? 'red' : '' },
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
        ph += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:${getColor(r5, REC_THRESHOLDS)}">${r5}</div><div class="rnd-plr-profile-stat-lbl">R5</div></div>`;
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
