import { TmUtils } from '../../lib/tm-utils.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmMatchUtils } from '../../utils/match.js';
import { buildPlayerStatsCompact } from './tm-match-player-stats.js';

export const showPlayerDialog = (player, liveState) => {
    $('.rnd-plr-overlay').remove();

    const mData = liveState?.mData;
    const matchFuture = mData ? TmMatchUtils.isMatchFuture(mData) : false;
    const matchEnded = !matchFuture && (liveState?.ended || !!player.rating);

    const pid = String(player.player_id || player.id);
    const playerUrl = `https://trophymanager.com/players/${pid}/#/page/history/`;
    const isSub = /^sub\d+$/.test(player.position);
    const rawPos = isSub ? (player.fp || '').split(',')[0] : player.position;
    const isGK = (player.position || player.fp || '').toLowerCase().split(',')[0] === 'gk';
    const { statsArray = [], minsPlayed = 0 } = player;

    // ── Header ──
    let html = `<div class="rnd-plr-overlay">
        <div class="rnd-plr-dialog" style="position:relative">
            <button class="rnd-plr-close">&times;</button>
            <div class="rnd-plr-header">
                <div class="rnd-plr-face"><img src="${player.faceUrl}" alt="${player.no}"></div>
                <div class="rnd-plr-info">
                    <div class="rnd-plr-name-row">
                        <a class="rnd-plr-name" href="${playerUrl}" target="_blank">${player.name || player.nameLast || ''}</a>
                        <a class="rnd-plr-link" href="${playerUrl}" target="_blank" title="Open player profile">&#x1F517;</a>
                    </div>
                    <div class="rnd-plr-badges">
                        <span class="rnd-plr-badge"><span class="badge-icon">👕</span> #${player.no}</span>
                        ${TmPosition.chip([rawPos])}`;
    if (player.age) html += `<span class="rnd-plr-badge"><span class="badge-icon">🎂</span> ${player.age}</span>`;
    if (matchEnded) html += `<span class="rnd-plr-badge"><span class="badge-icon">⏱️</span> ${minsPlayed}'</span>`;
    html += '</div></div>';
    if (matchEnded && player.rating) {
        const rVal = Number(player.rating).toFixed(2);
        html += '<div class="rnd-plr-rating-wrap">';
        html += `<div class="rnd-plr-rating-big" style="color:${TmUtils.ratingColor(player.rating)}">${rVal}</div>`;
        html += '<div class="rnd-plr-rating-label">Rating</div>';
        html += '</div>';
    }
    if (player.r5 != null) {
        html += '<div class="rnd-plr-rating-wrap">';
        html += `<div class="rnd-plr-rating-big" style="color:${TmUtils.r5Color(player.r5)}">${Number(player.r5).toFixed(2)}</div>`;
        html += '<div class="rnd-plr-rating-label">R5</div>';
        html += '</div>';
    }
    html += '</div>'; // end header

    html += '<div class="rnd-plr-body">';


    // ── Match stats ──
    if (!matchFuture && statsArray.length) {
        html += buildPlayerStatsCompact(statsArray, isGK);
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
