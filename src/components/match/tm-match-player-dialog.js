import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmMatchUtils } from '../../utils/match.js';
import { buildPlayerStatSections } from './tm-match-player-stats.js';

/**
 * Show a per-player detail dialog overlay.
 *
 * @param {string|number} playerId
 * @param {object}        mData      — full match data object
 * @param {number}        curMin     — current live minute (999 = ended)
 * @param {number}        curEvtIdx  — current live event index (999 = ended)
 * @param {object}        opts       — shared match opts passed from match.js
 */
export const showPlayerDialog = (playerId, mData, curMin, curEvtIdx, opts, precomputed = null) => {
    const { getLiveState, buildPlayerNames,
        isMatchFuture,
        fetchTooltip, getColor, REC_THRESHOLDS } = opts;
    const liveState = getLiveState();
    // Remove any existing dialog
    $('.rnd-plr-overlay').remove();

    const pid = String(playerId);
    const isHome = !!mData.lineup.home[pid];
    const lineup = isHome ? mData.lineup.home : mData.lineup.away;
    const p = lineup[pid];
    if (!p) return;

    const clubColor = isHome ? mData.club.home.color : mData.club.away.color;

    // Face URL
    const fUrl = TmMatchUtils.faceUrl(p, clubColor);

    const ratClr = TmUtils.ratingColor;

    const { perMinute: statsArray, minsPlayed } = precomputed;
    const isGK = p.position === 'gk';

    // ── Position display ──
    const isSub = p.position.includes('sub');
    const rawPos = isSub ? (p.fp || '').split(',')[0] : p.position;

    const playerUrl = `https://trophymanager.com/players/${pid}/#/page/history/`;
    const matchFuture = isMatchFuture(mData);
    const matchEnded = !matchFuture && (!liveState || liveState.ended);

    let html = `<div class="rnd-plr-overlay">
        <div class="rnd-plr-dialog" style="position:relative">
            <button class="rnd-plr-close">&times;</button>
            <div class="rnd-plr-header">
                <div class="rnd-plr-face">
                    <img src="${fUrl}" alt="${p.no}">
                </div>
                <div class="rnd-plr-info">
                    <div class="rnd-plr-name-row">
                        <a class="rnd-plr-name" href="${playerUrl}" target="_blank">${p.name || p.nameLast || ''}</a>
                        <a class="rnd-plr-link" href="${playerUrl}" target="_blank" title="Open player profile">&#x1F517;</a>
                    </div>
                    <div class="rnd-plr-badges">
                        <span class="rnd-plr-badge"><span class="badge-icon">👕</span> #${p.no}</span>
                        ${TmPosition.chip([rawPos])}
                        <span class="rnd-plr-badge" id="rnd-plr-age-badge-${pid}"><span class="badge-icon">🎂</span> ${p.age || '?'}</span>`;
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
        html += buildPlayerStatSections(statsArray, isGK);
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
    const { routineMap, positionMap } = TmMatchUtils.buildMatchMaps(mData);

    fetchTooltip(pid).then(rawData => {
        if (!profileEl.length || !profileEl.closest('body').length) return;
        const player = TmMatchUtils.enrichMatchPlayer(rawData, pid, routineMap, positionMap);
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
