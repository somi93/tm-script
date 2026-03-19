import { TmMatchService } from '../../services/match.js';
import { TmMatchUtils } from '../../utils/match.js';
import { TmUI } from './tm-ui.js';

const STYLE_ID = 'tmvu-match-hover-card-style';

const state = {
    cache: {},
    tooltipEl: null,
    showTimer: null,
    hideTimer: null,
};

const currentSeason = () => ((typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null);

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .rnd-h2h-tooltip {
            position: absolute; z-index: 100;
            background: #111f0a; border: 1px solid rgba(80,160,48,.25);
            border-radius: 10px; padding: 18px 24px;
            min-width: 520px; max-width: 600px;
            box-shadow: 0 8px 32px rgba(0,0,0,.6);
            pointer-events: none; opacity: 0; transition: opacity 0.15s;
            left: 50%; top: 100%; transform: translateX(-50%); margin-top: 4px;
        }
        .rnd-h2h-tooltip.visible { opacity: 1; }
        .rnd-h2h-tooltip-header {
            display: flex; align-items: center; justify-content: center;
            gap: 14px; padding-bottom: 12px; margin-bottom: 10px;
            border-bottom: 1px solid rgba(80,160,48,.12);
        }
        .rnd-h2h-tooltip-logo { width: 40px; height: 40px; object-fit: contain; filter: drop-shadow(0 1px 3px rgba(0,0,0,.4)); }
        .rnd-h2h-tooltip-team { font-size: 15px; font-weight: 700; color: #c8e4b0; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rnd-h2h-tooltip-score { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: 3px; text-shadow: 0 0 16px rgba(128,224,64,.15); }
        .rnd-h2h-tooltip-meta { display: flex; align-items: center; justify-content: center; gap: 18px; font-size: 11px; color: #5a7a48; margin-bottom: 10px; }
        .rnd-h2h-tooltip-meta span { display: flex; align-items: center; gap: 3px; }
        .rnd-h2h-tooltip-events { display: flex; flex-direction: column; gap: 5px; }
        .rnd-h2h-tooltip-evt { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #a0c890; padding: 3px 0; }
        .rnd-h2h-tooltip-evt.away-evt { flex-direction: row-reverse; text-align: right; }
        .rnd-h2h-tooltip-evt.away-evt .rnd-h2h-tooltip-evt-min { text-align: left; }
        .rnd-h2h-tooltip-evt-min { font-weight: 700; color: #80b868; min-width: 32px; font-size: 13px; text-align: right; flex-shrink: 0; }
        .rnd-h2h-tooltip-evt-icon { flex-shrink: 0; font-size: 16px; }
        .rnd-h2h-tooltip-evt-text { color: #b8d8a0; }
        .rnd-h2h-tooltip-evt-assist { font-size: 12px; color: #5a8a48; font-weight: 500; margin-left: 2px; }
        .rnd-h2h-tooltip-mom { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(80,160,48,.1); font-size: 13px; color: #6a9a58; text-align: center; }
        .rnd-h2h-tooltip-mom span { color: #e8d44a; font-weight: 700; }
        .rnd-h2h-tooltip-divider { height: 1px; background: rgba(80,160,48,.1); margin: 8px 0; }
        .rnd-h2h-tooltip-stats { display: grid; grid-template-columns: 1fr auto 1fr; gap: 4px 12px; margin: 10px 0; font-size: 14px; }
        .rnd-h2h-tooltip-stat-home { text-align: right; font-weight: 700; color: #b8d8a0; }
        .rnd-h2h-tooltip-stat-label { text-align: center; font-size: 10px; color: #5a7a48; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; padding: 0 6px; }
        .rnd-h2h-tooltip-stat-away { text-align: left; font-weight: 700; color: #b8d8a0; }
        .rnd-h2h-tooltip-stat-home.leading { color: #6adc3a; }
        .rnd-h2h-tooltip-stat-away.leading { color: #6adc3a; }
    `;
    document.head.appendChild(style);
};

const buildLegacyTooltipContent = (data) => {
    const hName = data.hometeam_name || '';
    const aName = data.awayteam_name || '';
    const hLogoId = data.hometeam || '';
    const aLogoId = data.awayteam || '';
    const hLogoUrl = hLogoId ? `/pics/club_logos/${hLogoId}_140.png` : '';
    const aLogoUrl = aLogoId ? `/pics/club_logos/${aLogoId}_140.png` : '';

    let html = '';
    html += `<div class="rnd-h2h-tooltip-header">`;
    if (hLogoUrl) html += `<img class="rnd-h2h-tooltip-logo" src="${hLogoUrl}" onerror="this.style.display='none'">`;
    html += `<span class="rnd-h2h-tooltip-team">${hName}</span>`;
    html += `<span class="rnd-h2h-tooltip-score">${data.result || ''}</span>`;
    html += `<span class="rnd-h2h-tooltip-team">${aName}</span>`;
    if (aLogoUrl) html += `<img class="rnd-h2h-tooltip-logo" src="${aLogoUrl}" onerror="this.style.display='none'">`;
    html += `</div>`;

    html += `<div class="rnd-h2h-tooltip-meta">`;
    if (data.date) html += `<span>📅 ${data.date}</span>`;
    if (data.attendance_format) html += `<span>🏟 ${data.attendance_format}</span>`;
    html += `</div>`;

    const report = data.report || {};
    const hTeamId = String(data.hometeam || hLogoId);
    const goals = [];
    const cards = [];
    Object.keys(report).forEach(key => {
        if (key === 'mom' || key === 'mom_name') return;
        const event = report[key];
        if (!event || !event.minute) return;
        const score = event.score;
        const isHome = String(event.team_scores) === hTeamId;
        if (score === 'yellow' || score === 'red' || score === 'orange') {
            cards.push({ ...event, isHome });
        } else {
            goals.push({ ...event, isHome });
        }
    });
    goals.sort((left, right) => Number(left.minute) - Number(right.minute));
    cards.sort((left, right) => Number(left.minute) - Number(right.minute));

    html += TmMatchUtils.renderLegacyEvents(goals, cards);

    if (report.mom_name) {
        html += `<div class="rnd-h2h-tooltip-mom">⭐ Man of the Match: <span>${report.mom_name}</span></div>`;
    }
    return html;
};

const buildRichTooltip = (matchData) => {
    const md = matchData.match_data || {};
    const club = matchData.club || {};
    const hName = club.home?.club_name || '';
    const aName = club.away?.club_name || '';
    const hId = String(club.home?.id || '');
    const aId = String(club.away?.id || '');
    const hLogo = club.home?.logo || `/pics/club_logos/${hId}_140.png`;
    const aLogo = club.away?.logo || `/pics/club_logos/${aId}_140.png`;
    const report = matchData.report || {};

    let finalScore = '0 - 0';
    const minutes = Object.keys(report).map(Number).sort((left, right) => left - right);
    for (let i = minutes.length - 1; i >= 0; i -= 1) {
        const events = report[minutes[i]];
        if (!Array.isArray(events)) continue;
        for (let j = events.length - 1; j >= 0; j -= 1) {
            const params = events[j].parameters;
            if (!params) continue;
            const goal = Array.isArray(params) ? params.find(item => item.goal) : params.goal ? params : null;
            if (!goal) continue;
            const goalData = goal.goal || goal;
            if (goalData.score) {
                finalScore = goalData.score.join(' - ');
                break;
            }
        }
        if (finalScore !== '0 - 0') break;
    }

    let html = '';
    html += `<div class="rnd-h2h-tooltip-header">`;
    html += `<img class="rnd-h2h-tooltip-logo" src="${hLogo}" onerror="this.style.display='none'">`;
    html += `<span class="rnd-h2h-tooltip-team">${hName}</span>`;
    html += `<span class="rnd-h2h-tooltip-score">${finalScore}</span>`;
    html += `<span class="rnd-h2h-tooltip-team">${aName}</span>`;
    html += `<img class="rnd-h2h-tooltip-logo" src="${aLogo}" onerror="this.style.display='none'">`;
    html += `</div>`;

    html += `<div class="rnd-h2h-tooltip-meta">`;
    const kickoff = md.venue?.kickoff_readable || '';
    if (kickoff) {
        const dt = new Date(kickoff.replace(' ', 'T'));
        html += `<span>📅 ${dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>`;
    }
    if (md.venue?.name) html += `<span>🏟 ${md.venue.name}</span>`;
    if (md.attendance) html += `<span>👥 ${Number(md.attendance).toLocaleString()}</span>`;
    html += `</div>`;

    const keyEvents = [];
    minutes.forEach(minute => {
        const events = report[minute];
        if (!Array.isArray(events)) return;
        events.forEach(event => {
            if (!event.parameters) return;
            const params = Array.isArray(event.parameters) ? event.parameters : [event.parameters];
            const clubId = String(event.club || '');
            const isHome = clubId === hId;
            params.forEach(param => {
                if (param.goal) {
                    const scorer = matchData.lineup?.home?.[param.goal.player] || matchData.lineup?.away?.[param.goal.player];
                    const assistPlayer = matchData.lineup?.home?.[param.goal.assist] || matchData.lineup?.away?.[param.goal.assist];
                    keyEvents.push({
                        min: minute,
                        type: 'goal',
                        isHome,
                        name: scorer?.nameLast || scorer?.name || '?',
                        assist: assistPlayer?.nameLast || assistPlayer?.name || '',
                        score: param.goal.score ? param.goal.score.join('-') : ''
                    });
                }
                if (param.yellow) {
                    const player = matchData.lineup?.home?.[param.yellow] || matchData.lineup?.away?.[param.yellow];
                    const cardIsHome = param.yellow in (matchData.lineup?.home || {});
                    keyEvents.push({ min: minute, type: 'yellow', isHome: cardIsHome, name: player?.nameLast || player?.name || '?' });
                }
                if (param.yellow_red) {
                    const player = matchData.lineup?.home?.[param.yellow_red] || matchData.lineup?.away?.[param.yellow_red];
                    const cardIsHome = param.yellow_red in (matchData.lineup?.home || {});
                    keyEvents.push({ min: minute, type: 'red', isHome: cardIsHome, name: player?.nameLast || player?.name || '?' });
                }
                if (param.red) {
                    const player = matchData.lineup?.home?.[param.red] || matchData.lineup?.away?.[param.red];
                    const cardIsHome = param.red in (matchData.lineup?.home || {});
                    keyEvents.push({ min: minute, type: 'red', isHome: cardIsHome, name: player?.nameLast || player?.name || '?' });
                }
            });
        });
    });

    const goals = keyEvents.filter(event => event.type === 'goal');
    const cards = keyEvents.filter(event => event.type === 'yellow' || event.type === 'red');
    html += TmMatchUtils.renderRichEvents(goals, cards);

    const possession = md.possession;
    const stats = md.statistics || {};
    const shotsH = stats.home_shots || 0;
    const shotsA = stats.away_shots || 0;
    const onTargetH = stats.home_on_target || 0;
    const onTargetA = stats.away_on_target || 0;

    if (possession || shotsH || shotsA) {
        html += `<div class="rnd-h2h-tooltip-stats">`;
        if (possession) {
            const hPossession = possession.home || 0;
            const aPossession = possession.away || 0;
            html += `<span class="rnd-h2h-tooltip-stat-home${hPossession > aPossession ? ' leading' : ''}">${hPossession}%</span>`;
            html += `<span class="rnd-h2h-tooltip-stat-label">Possession</span>`;
            html += `<span class="rnd-h2h-tooltip-stat-away${aPossession > hPossession ? ' leading' : ''}">${aPossession}%</span>`;
        }
        if (shotsH || shotsA) {
            html += `<span class="rnd-h2h-tooltip-stat-home${shotsH > shotsA ? ' leading' : ''}">${shotsH}</span>`;
            html += `<span class="rnd-h2h-tooltip-stat-label">Shots</span>`;
            html += `<span class="rnd-h2h-tooltip-stat-away${shotsA > shotsH ? ' leading' : ''}">${shotsA}</span>`;
        }
        if (onTargetH || onTargetA) {
            html += `<span class="rnd-h2h-tooltip-stat-home${onTargetH > onTargetA ? ' leading' : ''}">${onTargetH}</span>`;
            html += `<span class="rnd-h2h-tooltip-stat-label">On Target</span>`;
            html += `<span class="rnd-h2h-tooltip-stat-away${onTargetA > onTargetH ? ' leading' : ''}">${onTargetA}</span>`;
        }
        html += `</div>`;
    }

    const allPlayers = [...Object.values(matchData.lineup?.home || {}), ...Object.values(matchData.lineup?.away || {})];
    const mom = allPlayers.find(player => player.mom === 1 || player.mom === '1');
    if (mom) {
        html += `<div class="rnd-h2h-tooltip-mom">⭐ Man of the Match: <span>${mom.nameLast || mom.name}</span> (${parseFloat(mom.rating).toFixed(1)})</div>`;
    }
    return html;
};

const removeTooltip = () => {
    if (state.tooltipEl) {
        state.tooltipEl.remove();
        state.tooltipEl = null;
    }
};

const show = (el, matchId, season) => {
    injectStyles();
    clearTimeout(state.hideTimer);
    removeTooltip();

    const isCurrentSeason = Number(season) === currentSeason();
    state.tooltipEl = document.createElement('div');
    state.tooltipEl.className = 'rnd-h2h-tooltip';
    el.appendChild(state.tooltipEl);

    if (state.cache[matchId]) {
        const cached = state.cache[matchId];
        state.tooltipEl.innerHTML = cached._rich ? buildRichTooltip(cached) : buildLegacyTooltipContent(cached);
        requestAnimationFrame(() => state.tooltipEl?.classList.add('visible'));
        return;
    }

    state.tooltipEl.innerHTML = TmUI.loading('Loading…', true);
    requestAnimationFrame(() => state.tooltipEl?.classList.add('visible'));

    const onFail = () => {
        if (state.tooltipEl) state.tooltipEl.innerHTML = TmUI.error('Failed', true);
    };

    if (isCurrentSeason) {
        TmMatchService.fetchMatchCached(matchId, { dbSync: false }).then(data => {
            if (!data) {
                onFail();
                return;
            }
            data._rich = true;
            state.cache[matchId] = data;
            if (state.tooltipEl && state.tooltipEl.closest('[data-mid]')?.dataset.mid === String(matchId)) {
                state.tooltipEl.innerHTML = buildRichTooltip(data);
            }
        }).catch(onFail);
        return;
    }

    TmMatchService.fetchMatchTooltip(matchId, season).then(data => {
        if (!data) {
            onFail();
            return;
        }
        state.cache[matchId] = data;
        if (state.tooltipEl && state.tooltipEl.closest('[data-mid]')?.dataset.mid === String(matchId)) {
            state.tooltipEl.innerHTML = buildLegacyTooltipContent(data);
        }
    }).catch(onFail);
};

const bind = (rows, { season } = {}) => {
    injectStyles();
    rows.forEach(row => {
        if (row.dataset.hoverBound === '1') return;
        row.dataset.hoverBound = '1';
        row.addEventListener('mouseenter', () => {
            clearTimeout(state.hideTimer);
            const matchId = row.dataset.mid;
            if (!matchId) return;
            state.showTimer = setTimeout(() => show(row, matchId, season ?? currentSeason()), 300);
        });
        row.addEventListener('mouseleave', () => {
            clearTimeout(state.showTimer);
            state.hideTimer = setTimeout(() => removeTooltip(), 100);
        });
    });
};

export const TmMatchHoverCard = {
    injectStyles,
    show,
    bind,
    removeTooltip,
    buildLegacyTooltipContent,
    buildRichTooltip,
};