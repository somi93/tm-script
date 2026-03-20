import { TmMatchService } from '../../services/match.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmMatchUtils } from '../../utils/match.js';

const STYLE_ID = 'tmvu-match-h2h-tooltip-style';
const dataCache = new Map();
const requestCache = new Map();

const cacheKeyFor = (matchId, rich) => `${rich ? 'rich' : 'legacy'}:${matchId}`;
const currentSeason = () => ((typeof SESSION !== 'undefined' && SESSION.season) ? String(SESSION.season) : null);
const resolveLegacySeason = (anchorEl) => anchorEl?.dataset?.season || anchorEl?.closest?.('[data-season]')?.dataset?.season || currentSeason();

const fetchTooltipData = (matchId, rich, anchorEl) => {
    const key = cacheKeyFor(matchId, rich);
    if (dataCache.has(key)) return Promise.resolve(dataCache.get(key));
    if (requestCache.has(key)) return requestCache.get(key);

    const request = (rich
        ? TmMatchService.fetchMatchCached(matchId, { dbSync: false }).then(data => {
            if (!data) return null;
            data._rich = true;
            return data;
        })
        : (() => {
            const season = resolveLegacySeason(anchorEl);
            if (!season) return Promise.resolve(null);
            return TmMatchService.fetchMatchTooltip(matchId, season);
        })())
        .then(data => {
            if (data) dataCache.set(key, data);
            requestCache.delete(key);
            return data;
        })
        .catch(error => {
            requestCache.delete(key);
            throw error;
        });

    requestCache.set(key, request);
    return request;
};

export const TmMatchH2HTooltip = {

    ensureStyles() {
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
    },

    show(anchorEl, matchId, rich = false) {
        if (!anchorEl || !matchId) return null;

        this.ensureStyles();

        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'rnd-h2h-tooltip';
        tooltipEl.dataset.matchId = String(matchId);
        anchorEl.appendChild(tooltipEl);

        const render = (html) => {
            if (!tooltipEl.isConnected || tooltipEl.dataset.matchId !== String(matchId)) return;
            tooltipEl.innerHTML = html;
        };

        render(TmUI.loading('Loading…', true));
        requestAnimationFrame(() => tooltipEl.classList.add('visible'));

        fetchTooltipData(matchId, !!rich, anchorEl)
            .then(data => {
                if (!data) {
                    render(TmUI.error('Failed', true));
                    return;
                }
                render(data._rich ? this.buildRichTooltip(data) : this.buildTooltipContent(data));
            })
            .catch(() => render(TmUI.error('Failed', true)));

        return tooltipEl;
    },

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
                        const cardIsHome = p.yellow in (mData.lineup?.home || {});
                        keyEvents.push({ min, type: 'yellow', isHome: cardIsHome, name: pl?.nameLast || pl?.name || '?' });
                    }
                    if (p.yellow_red) {
                        const pl = mData.lineup?.home?.[p.yellow_red] || mData.lineup?.away?.[p.yellow_red];
                        const cardIsHome = p.yellow_red in (mData.lineup?.home || {});
                        keyEvents.push({ min, type: 'red', isHome: cardIsHome, name: pl?.nameLast || pl?.name || '?' });
                    }
                    if (p.red) {
                        const pl = mData.lineup?.home?.[p.red] || mData.lineup?.away?.[p.red];
                        const cardIsHome = p.red in (mData.lineup?.home || {});
                        keyEvents.push({ min, type: 'red', isHome: cardIsHome, name: pl?.nameLast || pl?.name || '?' });
                    }
                    if (p.sub) {
                        const plIn = mData.lineup?.home?.[p.sub.player_in] || mData.lineup?.away?.[p.sub.player_in];
                        const plOut = mData.lineup?.home?.[p.sub.player_out] || mData.lineup?.away?.[p.sub.player_out];
                        const subIsHome = p.sub.player_in in (mData.lineup?.home || {});
                        keyEvents.push({
                            min, type: 'sub', isHome: subIsHome,
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
