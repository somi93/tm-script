import { TmMatchUtils } from '../../utils/match.js';
import { TmUI } from './tm-ui.js';

const STYLE_ID = 'tmvu-match-tooltip-style';

const ensureStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .rnd-h2h-tooltip {
            position: absolute; z-index: 100;
            background: var(--tmu-surface-card-soft); border: 1px solid var(--tmu-border-success);
            border-radius: var(--tmu-space-md); padding: var(--tmu-space-xl) var(--tmu-space-xxl);
            min-width: 520px; max-width: 600px;
            box-shadow: 0 8px 32px var(--tmu-shadow-panel);
            pointer-events: none; opacity: 0; transition: opacity 0.15s;
            left: 50%; top: 100%; transform: translateX(-50%); margin-top: var(--tmu-space-xs);
        }
        .rnd-h2h-tooltip.visible { opacity: 1; }
        .rnd-h2h-tooltip-header {
            display: flex; align-items: center; justify-content: center;
            gap: var(--tmu-space-lg); padding-bottom: var(--tmu-space-md); margin-bottom: var(--tmu-space-md);
            border-bottom: 1px solid var(--tmu-border-input-overlay);
        }
        .rnd-h2h-tooltip-logo { width: 40px; height: 40px; object-fit: contain; filter: drop-shadow(0 1px 3px var(--tmu-surface-overlay)); }
        .rnd-h2h-tooltip-team { font-size: 15px; font-weight: 700; color: var(--tmu-text-main); max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rnd-h2h-tooltip-score { font-size: 28px; font-weight: 800; color: var(--tmu-text-inverse); letter-spacing: 3px; text-shadow: 0 0 16px var(--tmu-success-fill-soft); }
        .rnd-h2h-tooltip-meta { display: flex; align-items: center; justify-content: center; gap: var(--tmu-space-xl); font-size: 11px; color: var(--tmu-text-faint); margin-bottom: var(--tmu-space-md); }
        .rnd-h2h-tooltip-meta span { display: flex; align-items: center; gap: var(--tmu-space-xs); }
        .rnd-h2h-tooltip-events { display: flex; flex-direction: column; gap: var(--tmu-space-xs); }
        .rnd-h2h-tooltip-evt { display: flex; align-items: center; gap: var(--tmu-space-md); font-size: 13px; color: var(--tmu-text-main); padding: var(--tmu-space-xs) 0; }
        .rnd-h2h-tooltip-evt.away-evt { flex-direction: row-reverse; text-align: right; }
        .rnd-h2h-tooltip-evt.away-evt .rnd-h2h-tooltip-evt-min { text-align: left; }
        .rnd-h2h-tooltip-evt-min { font-weight: 700; color: var(--tmu-text-panel-label); min-width: 32px; font-size: 13px; text-align: right; flex-shrink: 0; }
        .rnd-h2h-tooltip-evt-icon { flex-shrink: 0; font-size: 16px; }
        .rnd-h2h-tooltip-evt-text { color: var(--tmu-text-main); }
        .rnd-h2h-tooltip-evt-assist { font-size: 12px; color: var(--tmu-text-faint); font-weight: 500; margin-left: var(--tmu-space-xs); }
        .rnd-h2h-tooltip-mom { margin-top: var(--tmu-space-md); padding-top: var(--tmu-space-md); border-top: 1px solid var(--tmu-border-input-overlay); font-size: 13px; color: var(--tmu-text-faint); text-align: center; }
        .rnd-h2h-tooltip-mom span { color: var(--tmu-text-highlight); font-weight: 700; }
        .rnd-h2h-tooltip-divider { height: 1px; background: var(--tmu-border-input-overlay); margin: var(--tmu-space-sm) 0; }
        .rnd-h2h-tooltip-stats { margin: var(--tmu-space-md) 0; }
    `;
    document.head.appendChild(style);
};

const buildHeader = ({ homeName = '', awayName = '', homeLogo = '', awayLogo = '', score = '' } = {}) => {
    let html = '<div class="rnd-h2h-tooltip-header">';
    if (homeLogo) html += `<img class="rnd-h2h-tooltip-logo" src="${homeLogo}" onerror="this.style.display='none'">`;
    html += `<span class="rnd-h2h-tooltip-team">${homeName}</span>`;
    html += `<span class="rnd-h2h-tooltip-score">${score}</span>`;
    html += `<span class="rnd-h2h-tooltip-team">${awayName}</span>`;
    if (awayLogo) html += `<img class="rnd-h2h-tooltip-logo" src="${awayLogo}" onerror="this.style.display='none'">`;
    html += '</div>';
    return html;
};

const buildMeta = (parts = []) => {
    const visibleParts = parts.filter(Boolean);
    if (!visibleParts.length) return '';
    return `<div class="rnd-h2h-tooltip-meta">${visibleParts.map(part => `<span>${part}</span>`).join('')}</div>`;
};

const buildFinalScore = (matchData) => {
    const md = matchData.match_data || {};
    const report = matchData.report || {};

    let finalScore = '0 - 0';
    const allMins = Object.keys(report).map(Number).sort((a, b) => a - b);
    for (let i = allMins.length - 1; i >= 0; i--) {
        const evts = report[allMins[i]];
        if (!Array.isArray(evts)) continue;
        for (let j = evts.length - 1; j >= 0; j--) {
            const params = evts[j].parameters;
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

    if (finalScore === '0 - 0' && md.halftime?.chance?.text) {
        const halftimeText = md.halftime.chance.text.flat().join(' ');
        const match = halftimeText.match(/(\d+)-(\d+)/);
        if (match) finalScore = `${match[1]} - ${match[2]}`;
    }

    return finalScore;
};

const buildRichEvents = (matchData, homeId) => {
    const report = matchData.report || {};
    const allMins = Object.keys(report).map(Number).sort((a, b) => a - b);
    const keyEvents = [];

    allMins.forEach(min => {
        const events = report[min];
        if (!Array.isArray(events)) return;
        events.forEach(event => {
            if (!event.parameters) return;
            const params = Array.isArray(event.parameters) ? event.parameters : [event.parameters];
            const clubId = String(event.club || '');
            const isHome = clubId === homeId;

            params.forEach(param => {
                if (param.goal) {
                    const scorer = matchData.lineup?.home?.[param.goal.player] || matchData.lineup?.away?.[param.goal.player];
                    const assistPlayer = matchData.lineup?.home?.[param.goal.assist] || matchData.lineup?.away?.[param.goal.assist];
                    keyEvents.push({
                        min,
                        type: 'goal',
                        isHome,
                        name: scorer?.nameLast || scorer?.name || '?',
                        assist: assistPlayer?.nameLast || assistPlayer?.name || '',
                    });
                }
                if (param.yellow) {
                    const player = matchData.lineup?.home?.[param.yellow] || matchData.lineup?.away?.[param.yellow];
                    const cardIsHome = param.yellow in (matchData.lineup?.home || {});
                    keyEvents.push({ min, type: 'yellow', isHome: cardIsHome, name: player?.nameLast || player?.name || '?' });
                }
                if (param.yellow_red) {
                    const player = matchData.lineup?.home?.[param.yellow_red] || matchData.lineup?.away?.[param.yellow_red];
                    const cardIsHome = param.yellow_red in (matchData.lineup?.home || {});
                    keyEvents.push({ min, type: 'red', isHome: cardIsHome, name: player?.nameLast || player?.name || '?' });
                }
                if (param.red) {
                    const player = matchData.lineup?.home?.[param.red] || matchData.lineup?.away?.[param.red];
                    const cardIsHome = param.red in (matchData.lineup?.home || {});
                    keyEvents.push({ min, type: 'red', isHome: cardIsHome, name: player?.nameLast || player?.name || '?' });
                }
            });
        });
    });

    return {
        goals: keyEvents.filter(event => event.type === 'goal'),
        cards: keyEvents.filter(event => event.type === 'yellow' || event.type === 'red'),
    };
};

const buildMom = (label, name, rating = null) => {
    if (!name) return '';
    return `<div class="rnd-h2h-tooltip-mom">⭐ ${label}: <span>${name}</span>${rating != null ? ` (${rating})` : ''}</div>`;
};

export const TmMatchTooltip = {
    ensureStyles,

    buildLegacyTooltipContent(data) {
        const homeName = data.hometeam_name || '';
        const awayName = data.awayteam_name || '';
        const homeLogoId = data.hometeam || '';
        const awayLogoId = data.awayteam || '';
        const homeLogo = homeLogoId ? `/pics/club_logos/${homeLogoId}_140.png` : '';
        const awayLogo = awayLogoId ? `/pics/club_logos/${awayLogoId}_140.png` : '';

        let html = buildHeader({ homeName, awayName, homeLogo, awayLogo, score: data.result || '' });
        html += buildMeta([
            data.date ? `📅 ${data.date}` : '',
            data.attendance_format ? `🏟 ${data.attendance_format}` : '',
        ]);

        const report = data.report || {};
        const homeTeamId = String(data.hometeam || homeLogoId);
        const goals = [];
        const cards = [];
        Object.keys(report).forEach(key => {
            if (key === 'mom' || key === 'mom_name') return;
            const event = report[key];
            if (!event || !event.minute) return;
            const score = event.score;
            const isHome = String(event.team_scores) === homeTeamId;
            if (score === 'yellow' || score === 'red' || score === 'orange') cards.push({ ...event, isHome });
            else goals.push({ ...event, isHome });
        });
        goals.sort((left, right) => Number(left.minute) - Number(right.minute));
        cards.sort((left, right) => Number(left.minute) - Number(right.minute));
        html += TmMatchUtils.renderLegacyEvents(goals, cards);
        html += buildMom('Man of the Match', report.mom_name || '');
        return html;
    },

    buildRichTooltip(matchData) {
        const md = matchData.match_data || {};
        const club = matchData.club || {};
        const homeName = club.home?.club_name || '';
        const awayName = club.away?.club_name || '';
        const homeId = String(club.home?.id || '');
        const awayId = String(club.away?.id || '');
        const homeLogo = club.home?.logo || `/pics/club_logos/${homeId}_140.png`;
        const awayLogo = club.away?.logo || `/pics/club_logos/${awayId}_140.png`;

        let html = buildHeader({
            homeName,
            awayName,
            homeLogo,
            awayLogo,
            score: buildFinalScore(matchData),
        });

        const kickoff = md.venue?.kickoff_readable || '';
        html += buildMeta([
            kickoff ? `📅 ${new Date(kickoff.replace(' ', 'T')).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : '',
            md.venue?.name ? `🏟 ${md.venue.name}` : '',
            md.attendance ? `👥 ${Number(md.attendance).toLocaleString()}` : '',
        ]);

        const events = buildRichEvents(matchData, homeId);
        html += TmMatchUtils.renderRichEvents(events.goals, events.cards);

        const possession = md.possession;
        const stats = md.statistics || {};
        if (possession || stats.home_shots || stats.away_shots || stats.home_on_target || stats.away_on_target) {
            html += TmUI.matchTooltipStats({ possession, statistics: stats, cls: 'rnd-h2h-tooltip-stats' });
        }

        const allPlayers = [...Object.values(matchData.lineup?.home || {}), ...Object.values(matchData.lineup?.away || {})];
        const mom = allPlayers.find(player => player.mom === 1 || player.mom === '1');
        html += buildMom('Man of the Match', mom?.nameLast || mom?.name || '', mom ? parseFloat(mom.rating).toFixed(1) : null);

        return html;
    },
};