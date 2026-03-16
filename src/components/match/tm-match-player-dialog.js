import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmMatchUtils } from '../../utils/match.js';
import { buildPlayerStatsCompact, buildPlayerEventsHtml } from './tm-match-player-stats.js';

export const showPlayerDialog = (player, mData, opts) => {
    const { getLiveState, isMatchFuture } = opts;
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
    if (!matchFuture) {
        html += buildPlayerStatsCompact(statsArray, player.isGK);
    }
    if (!matchFuture) {
        const { buildReportEventHtml, buildPlayerNames } = opts;
        const homeId = String(mData.teams.home.id);
        const playerNames = buildPlayerNames(mData);
        const evtsHtml = buildPlayerEventsHtml(statsArray, mData.report, homeId, buildReportEventHtml, playerNames);
        if (evtsHtml) {
            html += '<div class="rnd-plr-section-title"><span class="sec-icon">⚡</span> Chances Involved</div>';
            html += `<div class="rnd-adv-evt-list">${evtsHtml}</div>`;
        }
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
