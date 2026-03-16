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

    // ── Positions R5 table ──
    if (player.positions?.length) {
        html += '<div class="rnd-plr-section-title"><span class="sec-icon">📍</span> Positions</div>';
        html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">';
        [...player.positions].sort((a, b) => a.ordering - b.ordering).forEach(pos => {
            html += `<div style="display:flex;align-items:center;gap:6px;background:rgba(42,74,28,.35);border:1px solid #2a4a1c;border-radius:7px;padding:5px 10px">`;
            html += TmPosition.chip([pos.position.toLowerCase()]);
            html += `<span style="color:${TmUtils.r5Color(pos.r5)};font-weight:800;font-size:13px">${Number(pos.r5).toFixed(1)}</span>`;
            html += `<span style="color:#6a9a58;font-size:10px">rec ${Number(pos.rec).toFixed(2)}</span>`;
            html += '</div>';
        });
        html += '</div>';
    }

    // ── Skills grid ──
    if (player.skills?.length) {
        html += '<div class="rnd-plr-section-title"><span class="sec-icon">📊</span> Skills</div>';
        html += '<div class="rnd-plr-profile-wrap"><div class="rnd-plr-skills-grid">';
        const catSkills = sk => player.skills.filter(s => s.category === sk && (isGK ? s.isGK : s.isOutfield));
        ['Physical', 'Tactical', 'Technical'].forEach(cat => {
            catSkills(cat).forEach(s => {
                const valColor = s.value >= 18 ? '#4ade80' : s.value >= 15 ? '#60a5fa' : s.value >= 12 ? '#fbbf24' : '#f87171';
                html += `<div class="rnd-plr-skill-row">`;
                html += `<span class="rnd-plr-skill-name">${s.name}</span>`;
                html += `<span class="rnd-plr-skill-val" style="color:${valColor}">${s.value}</span>`;
                html += '</div>';
            });
        });
        html += '</div></div>';
    }

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
