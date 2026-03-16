import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmMatchUtils } from '../../utils/match.js';
import { buildPlayerStatSections, buildMatchActionsHtml } from './tm-match-player-stats.js';

export const showPlayerDialog = (player, mData, opts) => {
    const { getLiveState, isMatchFuture, getColor, REC_THRESHOLDS } = opts;
    const liveState = getLiveState();
    // Remove any existing dialog
    $('.rnd-plr-overlay').remove();

    const pid = String(player.player_id);
    const isHome = !!mData.teams.home.lineup[pid];
    const clubColor = isHome ? mData.teams.home.color : mData.teams.away.color;

    const fUrl = TmMatchUtils.faceUrl(player, clubColor);
    const ratClr = TmUtils.ratingColor;

    const { statsArray, minsPlayed } = player;

    const isSub = player.position.includes('sub');
    const rawPos = isSub ? (player.fp || '').split(',')[0] : player.position;

    const playerUrl = `https://trophymanager.com/players/${pid}/#/page/history/`;
    const matchFuture = isMatchFuture(mData);
    const matchEnded = !matchFuture && (!liveState || liveState.ended);

    // ── Profile section ──
    const skills = player.skills.map(s => s.value);
    const skillNames = player.isGK ? TmConst.SKILL_NAMES_GK_SHORT : TmConst.SKILL_LABELS_OUT;
    const leftIdx = player.isGK ? [0, 1, 2] : [0, 1, 2, 3, 4, 5, 6];
    const rightIdx = player.isGK ? [3, 4, 5, 6, 7, 8, 9, 10] : [7, 8, 9, 10, 11, 12, 13];
    const svc = TmUtils.skillColor;
    const fmtVal = (val) => {
        const { display, starCls } = TmUtils.formatSkill(val);
        const suffix = starCls === ' star-gold' ? ' rnd-plr-skill-star' : starCls === ' star-silver' ? ' rnd-plr-skill-star silver' : '';
        return { display, starCls: suffix };
    };

    let profileHtml = '';
    if (player.country) {
        const flagUrl = `https://trophymanager.com/pics/flags/gradient/${player.country}.png`;
        const countryName = player.country_name || player.country || '';
        profileHtml += `<div class="rnd-plr-country-row">`;
        profileHtml += `<img class="rnd-plr-country-flag" src="${flagUrl}" onerror="this.style.display='none'">`;
        profileHtml += `<span class="rnd-plr-country-name">${countryName}</span>`;
        profileHtml += `</div>`;
    }
    profileHtml += '<div class="rnd-plr-skills-grid">';
    const renderSkillCol = (indices) => {
        let c = '<div>';
        indices.forEach(i => {
            const val = typeof skills[i] === 'number' ? skills[i] : parseInt(skills[i]);
            const { display, starCls } = fmtVal(val);
            c += `<div class="rnd-plr-skill-row">
                    <span class="rnd-plr-skill-name">${skillNames[i] || ''}</span>
                    <span class="rnd-plr-skill-val${starCls}" style="color:${svc(val)}">${display}</span>
                </div>`;
        });
        return c + '</div>';
    };
    profileHtml += renderSkillCol(leftIdx) + renderSkillCol(rightIdx);
    profileHtml += '</div>';
    profileHtml += '<div class="rnd-plr-profile-footer">';
    profileHtml += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:#e0f0cc">${player.asi.toLocaleString()}</div><div class="rnd-plr-profile-stat-lbl">ASI</div></div>`;
    profileHtml += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:${getColor(player.r5, REC_THRESHOLDS)}">${player.r5}</div><div class="rnd-plr-profile-stat-lbl">R5</div></div>`;
    profileHtml += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:${getColor(player.rec, REC_THRESHOLDS)}">${player.rec}</div><div class="rnd-plr-profile-stat-lbl">REC</div></div>`;
    profileHtml += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:#8abc78">${parseFloat(player.routine).toFixed(1)}</div><div class="rnd-plr-profile-stat-lbl">Routine</div></div>`;
    profileHtml += '</div>';

    // ── Build HTML ──
    let html = `<div class="rnd-plr-overlay">
        <div class="rnd-plr-dialog" style="position:relative">
            <button class="rnd-plr-close">&times;</button>
            <div class="rnd-plr-header">
                <div class="rnd-plr-face">
                    <img src="${fUrl}" alt="${player.no}">
                </div>
                <div class="rnd-plr-info">
                    <div class="rnd-plr-name-row">
                        <a class="rnd-plr-name" href="${playerUrl}" target="_blank">${player.name || player.nameLast || ''}</a>
                        <a class="rnd-plr-link" href="${playerUrl}" target="_blank" title="Open player profile">&#x1F517;</a>
                    </div>
                    <div class="rnd-plr-badges">
                        <span class="rnd-plr-badge"><span class="badge-icon">👕</span> #${player.no}</span>
                        ${TmPosition.chip([rawPos])}
                        <span class="rnd-plr-badge"><span class="badge-icon">🎂</span> ${player.ageMonthsString}</span>`;
    if (matchEnded) html += `<span class="rnd-plr-badge"><span class="badge-icon">⏱️</span> ${minsPlayed}'</span>`;
    html += '</div></div>';
    if (matchEnded && player.rating) {
        const rVal = Number(player.rating).toFixed(2);
        html += '<div class="rnd-plr-rating-wrap">';
        html += `<div class="rnd-plr-rating-big" style="color:${ratClr(player.rating)}">${rVal}</div>`;
        html += '<div class="rnd-plr-rating-label">Rating</div>';
        html += '</div>';
    }
    html += '</div>';

    html += '<div class="rnd-plr-body">';
    html += '<div class="rnd-plr-section-title"><span class="sec-icon">🧑</span> Player Profile</div>';
    html += `<div class="rnd-plr-profile-wrap">${profileHtml}</div>`;
    if (!matchFuture) {
        const actHtml = buildMatchActionsHtml(statsArray);
        if (actHtml) {
            html += '<div class="rnd-plr-section-title"><span class="sec-icon">⏱️</span> Match Actions</div>';
            html += `<div class="rnd-act-list">${actHtml}</div>`;
        }
        html += buildPlayerStatSections(statsArray, player.isGK);
    }
    html += '</div></div></div>';

    const $overlay = $(html).appendTo('body');
    $overlay.find('.rnd-plr-close').on('click', () => $overlay.remove());
    $overlay.on('click', (e) => { if ($(e.target).hasClass('rnd-plr-overlay')) $overlay.remove(); });
    $overlay.on('click', '.rnd-acc-head', function (e) {
        e.stopPropagation();
        $(this).closest('.rnd-acc').toggleClass('open');
    });
};
