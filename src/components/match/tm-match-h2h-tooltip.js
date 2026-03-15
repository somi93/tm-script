import { TmMatchUtils } from '../../utils/match.js';

export const TmMatchH2HTooltip = {

    // ── Tooltip from tooltip.ajax.php (older seasons) ──
    buildTooltipContent(d) {
        const hName = d.hometeam_name || '';
        const aName = d.awayteam_name || '';
        const hLogoId = d.hometeam || '';
        const aLogoId = d.awayteam || '';
        const hLogoUrl = hLogoId ? `/pics/club_logos/${hLogoId}_140.png` : '';
        const aLogoUrl = aLogoId ? `/pics/club_logos/${aLogoId}_140.png` : '';

        let t = '';
        t += `<div class="rnd-h2h-tooltip-header">`;
        if (hLogoUrl) t += `<img class="rnd-h2h-tooltip-logo" src="${hLogoUrl}" onerror="this.style.display='none'">`;
        t += `<span class="rnd-h2h-tooltip-team">${hName}</span>`;
        t += `<span class="rnd-h2h-tooltip-score">${d.result || ''}</span>`;
        t += `<span class="rnd-h2h-tooltip-team">${aName}</span>`;
        if (aLogoUrl) t += `<img class="rnd-h2h-tooltip-logo" src="${aLogoUrl}" onerror="this.style.display='none'">`;
        t += `</div>`;

        t += `<div class="rnd-h2h-tooltip-meta">`;
        if (d.date) t += `<span>📅 ${d.date}</span>`;
        if (d.attendance_format) t += `<span>🏟 ${d.attendance_format}</span>`;
        t += `</div>`;

        const report = d.report || {};
        const hTeamId = String(d.hometeam || hLogoId);
        const goals = [];
        const cards = [];
        Object.keys(report).forEach(k => {
            if (k === 'mom' || k === 'mom_name') return;
            const e = report[k];
            if (!e || !e.minute) return;
            const sc = e.score;
            const isHome = String(e.team_scores) === hTeamId;
            if (sc === 'yellow' || sc === 'red' || sc === 'orange') {
                cards.push({ ...e, isHome });
            } else {
                goals.push({ ...e, isHome });
            }
        });
        goals.sort((a, b) => Number(a.minute) - Number(b.minute));
        cards.sort((a, b) => Number(a.minute) - Number(b.minute));
        t += TmMatchUtils.renderLegacyEvents(goals, cards);
        if (report.mom_name) {
            t += `<div class="rnd-h2h-tooltip-mom">⭐ Man of the Match: <span>${report.mom_name}</span></div>`;
        }
        return t;
    },

    // ── Rich tooltip from match.ajax.php (current season) ──
    buildRichTooltip(mData) {
        const md = mData.match_data || {};
        const club = mData.club || {};
        const hName = club.home?.club_name || '';
        const aName = club.away?.club_name || '';
        const hId = String(club.home?.id || '');
        const aId = String(club.away?.id || '');
        const hLogo = club.home?.logo || `/pics/club_logos/${hId}_140.png`;
        const aLogo = club.away?.logo || `/pics/club_logos/${aId}_140.png`;
        const report = mData.report || {};

        let finalScore = '0 - 0';
        const allMins = Object.keys(report).map(Number).sort((a, b) => a - b);
        for (let i = allMins.length - 1; i >= 0; i--) {
            const evts = report[allMins[i]];
            if (!Array.isArray(evts)) continue;
            for (let j = evts.length - 1; j >= 0; j--) {
                const p = evts[j].parameters;
                if (p) {
                    const goal = Array.isArray(p) ? p.find(x => x.goal) : p.goal ? p : null;
                    if (goal) {
                        const g = goal.goal || goal;
                        if (g.score) { finalScore = g.score.join(' - '); break; }
                    }
                }
            }
            if (finalScore !== '0 - 0') break;
        }
        if (finalScore === '0 - 0' && md.halftime?.chance?.text) {
            const htText = md.halftime.chance.text.flat().join(' ');
            const sm = htText.match(/(\d+)-(\d+)/);
            if (sm) finalScore = sm[1] + ' - ' + sm[2];
        }

        let t = '';
        t += `<div class="rnd-h2h-tooltip-header">`;
        t += `<img class="rnd-h2h-tooltip-logo" src="${hLogo}" onerror="this.style.display='none'">`;
        t += `<span class="rnd-h2h-tooltip-team">${hName}</span>`;
        t += `<span class="rnd-h2h-tooltip-score">${finalScore}</span>`;
        t += `<span class="rnd-h2h-tooltip-team">${aName}</span>`;
        t += `<img class="rnd-h2h-tooltip-logo" src="${aLogo}" onerror="this.style.display='none'">`;
        t += `</div>`;

        t += `<div class="rnd-h2h-tooltip-meta">`;
        const ko = md.venue?.kickoff_readable || '';
        if (ko) {
            const d = new Date(ko.replace(' ', 'T'));
            t += `<span>📅 ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>`;
        }
        if (md.venue?.name) t += `<span>🏟 ${md.venue.name}</span>`;
        if (md.attendance) t += `<span>👥 ${Number(md.attendance).toLocaleString()}</span>`;
        t += `</div>`;

        const keyEvents = [];
        allMins.forEach(min => {
            const evts = report[min];
            if (!Array.isArray(evts)) return;
            evts.forEach(evt => {
                if (!evt.parameters) return;
                const params = Array.isArray(evt.parameters) ? evt.parameters : [evt.parameters];
                const clubId = String(evt.club || '');
                const isHome = clubId === hId;
                params.forEach(p => {
                    if (p.goal) {
                        const scorer = mData.lineup?.home?.[p.goal.player] || mData.lineup?.away?.[p.goal.player];
                        const assistPlayer = mData.lineup?.home?.[p.goal.assist] || mData.lineup?.away?.[p.goal.assist];
                        keyEvents.push({
                            min, type: 'goal', isHome,
                            name: scorer?.nameLast || scorer?.name || '?',
                            assist: assistPlayer?.nameLast || assistPlayer?.name || '',
                            score: p.goal.score ? p.goal.score.join('-') : ''
                        });
                    }
                    if (p.yellow) {
                        const pl = mData.lineup?.home?.[p.yellow] || mData.lineup?.away?.[p.yellow];
                        keyEvents.push({ min, type: 'yellow', isHome, name: pl?.nameLast || pl?.name || '?' });
                    }
                    if (p.yellow_red) {
                        const pl = mData.lineup?.home?.[p.yellow_red] || mData.lineup?.away?.[p.yellow_red];
                        keyEvents.push({ min, type: 'red', isHome, name: pl?.nameLast || pl?.name || '?' });
                    }
                    if (p.red) {
                        const pl = mData.lineup?.home?.[p.red] || mData.lineup?.away?.[p.red];
                        keyEvents.push({ min, type: 'red', isHome, name: pl?.nameLast || pl?.name || '?' });
                    }
                    if (p.sub) {
                        const plIn = mData.lineup?.home?.[p.sub.player_in] || mData.lineup?.away?.[p.sub.player_in];
                        const plOut = mData.lineup?.home?.[p.sub.player_out] || mData.lineup?.away?.[p.sub.player_out];
                        keyEvents.push({
                            min, type: 'sub', isHome,
                            nameIn: plIn?.nameLast || plIn?.name || '?',
                            nameOut: plOut?.nameLast || plOut?.name || '?'
                        });
                    }
                });
            });
        });

        const goals = keyEvents.filter(e => e.type === 'goal');
        const cards = keyEvents.filter(e => e.type === 'yellow' || e.type === 'red');
        t += TmMatchUtils.renderRichEvents(goals, cards);

        const poss = md.possession;
        const statsData = md.statistics || {};
        const shotsH = statsData.home_shots || 0;
        const shotsA = statsData.away_shots || 0;
        const onTargetH = statsData.home_on_target || 0;
        const onTargetA = statsData.away_on_target || 0;

        if (poss || shotsH || shotsA) {
            t += `<div class="rnd-h2h-tooltip-stats">`;
            if (poss) {
                const hP = poss.home || 0, aP = poss.away || 0;
                t += `<span class="rnd-h2h-tooltip-stat-home${hP > aP ? ' leading' : ''}">${hP}%</span>`;
                t += `<span class="rnd-h2h-tooltip-stat-label">Possession</span>`;
                t += `<span class="rnd-h2h-tooltip-stat-away${aP > hP ? ' leading' : ''}">${aP}%</span>`;
            }
            if (shotsH || shotsA) {
                t += `<span class="rnd-h2h-tooltip-stat-home${shotsH > shotsA ? ' leading' : ''}">${shotsH}</span>`;
                t += `<span class="rnd-h2h-tooltip-stat-label">Shots</span>`;
                t += `<span class="rnd-h2h-tooltip-stat-away${shotsA > shotsH ? ' leading' : ''}">${shotsA}</span>`;
            }
            if (onTargetH || onTargetA) {
                t += `<span class="rnd-h2h-tooltip-stat-home${onTargetH > onTargetA ? ' leading' : ''}">${onTargetH}</span>`;
                t += `<span class="rnd-h2h-tooltip-stat-label">On Target</span>`;
                t += `<span class="rnd-h2h-tooltip-stat-away${onTargetA > onTargetH ? ' leading' : ''}">${onTargetA}</span>`;
            }
            t += `</div>`;
        }

        const allPlayers = [...Object.values(mData.lineup?.home || {}), ...Object.values(mData.lineup?.away || {})];
        const mom = allPlayers.find(p => p.mom === 1 || p.mom === '1');
        if (mom) {
            t += `<div class="rnd-h2h-tooltip-mom">⭐ Man of the Match: <span>${mom.nameLast || mom.name}</span> (${parseFloat(mom.rating).toFixed(1)})</div>`;
        }
        return t;
    },
};
