import { TmUtils } from '../../lib/tm-utils.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmMatchUtils } from '../../utils/match.js';
import { TmUI } from '../shared/tm-ui.js';

const buttonHtml = (opts) => TmUI.button(opts).outerHTML;
const badgeHtml = (opts, tone = 'muted') => TmUI.badge({ size: 'sm', shape: 'full', weight: 'bold', ...opts }, tone);
const metricHtml = (opts) => TmUI.metric(opts);

const buildPlayerStatsCompact = (statsArray, isGK) => {
    const st = {
        passesCompleted: 0, passesFailed: 0, crossesCompleted: 0, crossesFailed: 0,
        shots: 0, shotsOnTarget: 0, shotsOffTarget: 0,
        shotsFoot: 0, shotsOnTargetFoot: 0, goalsFoot: 0,
        shotsHead: 0, shotsOnTargetHead: 0, goalsHead: 0,
        saves: 0, goals: 0, assists: 0, keyPasses: 0,
        duelsWon: 0, duelsLost: 0, interceptions: 0, tackles: 0, headerClearances: 0, tackleFails: 0,
        fouls: 0, yellowCards: 0, redCards: 0,
    };
    for (const e of (statsArray || [])) {
        if (e.shot) {
            st.shots++;
            if (e.onTarget) st.shotsOnTarget++; else st.shotsOffTarget++;
            if (e.head) { st.shotsHead++; if (e.goal) st.goalsHead++; }
            if (e.foot) { st.shotsFoot++; if (e.goal) st.goalsFoot++; }
            if (e.goal) st.goals++;
        }
        if (e.assist) st.assists++;
        if (e.keyPass) st.keyPasses++;
        if (e.pass) { e.success ? st.passesCompleted++ : st.passesFailed++; }
        if (e.cross) { e.success ? st.crossesCompleted++ : st.crossesFailed++; }
        if (e.save) st.saves++;
        if (e.foul) st.fouls++;
        if (e.duelWon) st.duelsWon++;
        if (e.duelLost) st.duelsLost++;
        if (e.tackle) st.tackles++;
        if (e.interception) st.interceptions++;
        if (e.headerClear) st.headerClearances++;
        if (e.tackleFail) st.tackleFails++;
        if (e.yellow || e.yellowRed) st.yellowCards++;
        if (e.red || e.yellowRed) st.redCards++;
    }

    const totalPass = st.passesCompleted + st.passesFailed;
    const totalCross = st.crossesCompleted + st.crossesFailed;
    const passAcc = totalPass > 0 ? Math.round(st.passesCompleted / totalPass * 100) : 0;
    const crossAcc = totalCross > 0 ? Math.round(st.crossesCompleted / totalCross * 100) : 0;
    const cell = (icon, val, lbl, mod = '') =>
        `<div class="rnd-pls-cell${mod ? ' ' + mod : ''}">`
        + `<span class="rnd-pls-icon">${icon}</span>`
        + `<span class="rnd-pls-val">${val}</span>`
        + `<span class="rnd-pls-lbl">${lbl}</span>`
        + `</div>`;

    let html = '<div class="rnd-plr-body-section"><div class="rnd-plr-section-title"><span class="sec-icon">📋</span> Match Snapshot</div><div class="rnd-pls-wrap">';

    html += '<div class="rnd-pls-row">';
    if (isGK) {
        html += cell('🧤', st.saves, 'Saves', st.saves > 0 ? 'hi-green' : '');
        html += cell('⚽', st.goals, 'Conceded', st.goals > 0 ? 'hi-red' : '');
        html += cell('🎯', st.shots, 'Shots');
    } else {
        html += cell('⚽', st.goals, 'Goals', st.goals > 0 ? 'hi-gold' : '');
        html += cell('🎯', st.shots, 'Shots');
        html += cell('✅', st.shotsOnTarget, 'On Target', st.shotsOnTarget > 0 ? 'hi-green' : '');
        html += cell('👟', st.assists, 'Assists', st.assists > 0 ? 'hi-gold' : '');
        html += cell('🔑', st.keyPasses, 'Key Pass', st.keyPasses > 0 ? 'hi-green' : '');
    }
    html += '</div>';

    html += '<div class="rnd-pls-row">';
    html += cell('📨', `${st.passesCompleted}/${totalPass}`, `Pass ${passAcc}%`, passAcc >= 70 ? 'hi-green' : totalPass > 0 ? 'hi-red' : '');
    html += cell('↗️', `${st.crossesCompleted}/${totalCross}`, `Cross ${crossAcc}%`, crossAcc >= 50 ? 'hi-green' : totalCross > 0 ? 'hi-red' : '');
    html += cell('👁️', st.interceptions, 'INT', st.interceptions > 0 ? 'hi-green' : '');
    html += cell('🦵', st.tackles, 'TKL', st.tackles > 0 ? 'hi-green' : '');
    html += cell('👊', `${st.duelsWon}/${st.duelsWon + st.duelsLost}`, 'Duels', st.duelsWon > st.duelsLost ? 'hi-green' : st.duelsLost > st.duelsWon ? 'hi-red' : '');
    html += '</div>';

    html += '<div class="rnd-pls-row">';
    html += cell('🗣️', st.headerClearances, 'HC', st.headerClearances > 0 ? 'hi-green' : '');
    html += cell('❌', st.tackleFails, 'TF', st.tackleFails > 0 ? 'hi-red' : '');
    html += cell('⚠️', st.fouls, 'Fouls', st.fouls > 0 ? 'hi-red' : '');
    html += cell('🟨', st.yellowCards, 'Yellow', st.yellowCards > 0 ? 'hi-red' : '');
    html += cell('🟥', st.redCards, 'Red', st.redCards > 0 ? 'hi-red' : '');
    html += '</div>';

    html += '</div></div>';
    return html;
};

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
    const displayName = player.name || player.nameLast || '';
    const metaBadges = [
        badgeHtml({ icon: '👕', label: `#${player.no}` }),
        TmPosition.chip([rawPos]),
    ];
    if (player.age) metaBadges.push(badgeHtml({ icon: '🎂', label: String(player.age) }));
    if (matchEnded) metaBadges.push(badgeHtml({ icon: '⏱️', label: `${minsPlayed}'` }));
    if (isSub) metaBadges.push(badgeHtml({ icon: '↔️', label: 'Sub' }));

    const statPills = [];
    if (matchEnded && player.rating) {
        statPills.push({ label: 'Rating', value: Number(player.rating).toFixed(2), color: TmUtils.ratingColor(player.rating) });
    }
    if (player.r5 != null) {
        statPills.push({ label: 'R5', value: Number(player.r5).toFixed(2), color: TmUtils.r5Color(player.r5) });
    }

    // ── Header ──
    let html = `<div class="rnd-plr-overlay">
        <div class="rnd-plr-dialog" style="position:relative">
            ${buttonHtml({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', color: 'secondary', size: 'sm', shape: 'full', cls: 'rnd-plr-close' })}
            <div class="rnd-plr-header">
                <div class="rnd-plr-face"><img src="${player.faceUrl}" alt="${player.no}"></div>
                <div class="rnd-plr-header-main">
                    <div class="rnd-plr-info">
                    <div class="rnd-plr-name-row">
                        <a class="rnd-plr-name" href="${playerUrl}" target="_blank">${displayName}</a>
                        <a class="rnd-plr-link" href="${playerUrl}" target="_blank" title="Open player profile">&#x1F517;</a>
                    </div>
                    <div class="rnd-plr-badges">${metaBadges.join('')}</div>
                    </div>
                    ${statPills.length ? `<div class="rnd-plr-kpis">${statPills.map(s => metricHtml({ label: s.label, value: s.value, tone: 'panel', size: 'xl', align: 'center', labelPosition: 'bottom', cls: 'rnd-plr-kpi-metric', attrs: { style: 'min-width:72px' }, valueAttrs: { style: `color:${s.color}` } })).join('')}</div>` : ''}
                </div>`;
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
};
