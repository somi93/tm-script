import { TmApi } from '../../lib/tm-services.js';
import { TmMatchUtils } from '../match/tm-match-utils.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmLeagueStandings } from './tm-league-standings.js';

/**
 * TmLeagueFixtures
 *
 * Handles live fixtures tab, history fixtures, and match tooltip helpers.
 * Reads and writes shared state via window.TmLeagueCtx.
 */

    if (!document.getElementById('tsa-league-fixtures-style')) {
        const _s = document.createElement('style');
        _s.id = 'tsa-league-fixtures-style';
        _s.textContent = `
            .fix-month-tabs {
                display: flex; padding: 0;
                border-bottom: 1px solid rgba(61,104,40,0.3);
                background: rgba(0,0,0,0.1);
            }
            .fix-month-tab {
                padding: 7px 16px; font-size: 11px; font-weight: 600;
                color: #6a9a58; border: none; border-bottom: 2px solid transparent;
                background: transparent; cursor: pointer;
                text-transform: uppercase; letter-spacing: 0.5px;
                transition: all 0.15s; margin-bottom: -1px;
            }
            .fix-month-tab:hover { color: #c8e0b4; background: rgba(255,255,255,0.04); }
            .fix-month-tab.fix-month-active { color: #e8f5d8; border-bottom-color: #6cc040; }
            .fix-month-tab.fix-month-current::after { content: '\u25CF'; margin-left: 4px; color: #6cc040; font-size: 7px; vertical-align: 3px; }
            .fix-date-header {
                padding: 4px 12px; font-size: 10px; font-weight: 700;
                color: #6a9a58; text-transform: uppercase; letter-spacing: 0.5px;
                background: rgba(0,0,0,0.15); border-top: 1px solid rgba(61,104,40,0.2);
            }
            .fix-match-row {
                display: flex; align-items: center; padding: 5px 10px;
                border-bottom: 1px solid rgba(42,74,28,0.3);
                cursor: pointer; transition: background 0.12s; font-size: 12px; gap: 4px;
            }
            .fix-match-row:hover { background: #243d18 !important; }
            .fix-even { background: #1c3410; }
            .fix-odd  { background: #162e0e; }
            .fix-my-match { outline: 1px solid rgba(108,192,64,0.25); }
            .fix-team { flex: 1; display: flex; align-items: center; gap: 5px; color: #c8e0b4; min-width: 0; }
            .fix-team-home { justify-content: flex-end; }
            .fix-team-away { justify-content: flex-start; }
            .fix-team-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .fix-team.fix-my-team .fix-team-name { color: #e8f5d8; font-weight: 600; }
            .fix-score {
                width: 54px; min-width: 54px; text-align: center;
                font-size: 12px; font-weight: 700; padding: 2px 4px;
                border-radius: 3px; display: inline-block; flex-shrink: 0;
            }
            .fix-score-win      { color: #4ade80; }
            .fix-score-loss     { color: #fca5a5; }
            .fix-score-draw     { color: #fde68a; }
            .fix-score-neutral  { color: #e0f0d0; }
            .fix-score-upcoming { color: #4a6a3a; font-weight: 400; font-size: 11px; }
            .fix-tv { width: 16px; display: inline-block; text-align: center; font-size: 11px; flex-shrink: 0; }
            .fix-logo { width: 16px; height: 16px; flex-shrink: 0; }
            .hfix-match { position: relative; }
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
        document.head.appendChild(_s);
    }

    const parseHistoryMatches = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const h3s = [...doc.querySelectorAll('h3.slide_toggle_open')];
        const groups = [];
        h3s.forEach(h3 => {
            const monthLabel = h3.textContent.trim();
            let ul = h3.nextElementSibling;
            while (ul && !(ul.tagName === 'UL' && ul.classList.contains('match_list'))) ul = ul.nextElementSibling;
            if (!ul) return;
            let currentDay = 1;
            const matches = [];
            ul.querySelectorAll('li').forEach(li => {
                const dateSpan = li.querySelector('.match_date');
                if (dateSpan) {
                    const img = dateSpan.querySelector('img[src]');
                    if (img) {
                        const m = img.getAttribute('src').match(/calendar_numeral_(\d+)/);
                        if (m) currentDay = parseInt(m[1]);
                    }
                }
                const homeA = li.querySelector('.hometeam a[club_link]');
                const awayA = li.querySelector('.awayteam a[club_link]');
                const matchSpan = li.querySelector('[match_link]');
                const scoreA = li.querySelector('a.match_link');
                if (!homeA || !awayA || !matchSpan) return;
                matches.push({
                    day: currentDay,
                    homeId: homeA.getAttribute('club_link'),
                    homeName: homeA.textContent.trim(),
                    awayId: awayA.getAttribute('club_link'),
                    awayName: awayA.textContent.trim(),
                    matchId: matchSpan.getAttribute('match_link'),
                    score: scoreA ? scoreA.textContent.trim() : ''
                });
            });
            if (matches.length) groups.push({ monthLabel, matches });
        });
        return groups;
    };

    const fetchHistoryFixtures = (season) => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-fixtures-content');
        if (container && container.style.display !== 'none') {
            container.innerHTML = TmUI.loading(`Loading Season ${season} fixtures…`);
        }
        window.fetch(`/history/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/matches/${season}/`)
            .then(r => r.text())
            .then(html => {
                const groups = parseHistoryMatches(html);
                s.historyFixturesData = { season, groups };
                const cont = document.getElementById('tsa-fixtures-content');
                if (cont && cont.style.display !== 'none') {
                    renderHistoryFixturesTab(s.historyFixturesData);
                }
            })
            .catch(() => {
                const cont = document.getElementById('tsa-fixtures-content');
                if (cont && cont.style.display !== 'none') {
                    cont.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;font-size:12px;">Failed to load Season ${season} fixtures</div>`;
                }
            });
    };

    const renderFixturesTab = (fixtures) => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-fixtures-content');
        if (!container || !fixtures) return;

        const myClubId = (s.standingsRows.find(r => r.isMe) || {}).clubId || null;
        const months = Object.entries(fixtures).sort(([a], [b]) => a.localeCompare(b));
        const currentMonthKey = (months.find(([, v]) => v.current_month) || months[0] || [])[0];
        let activeKey = container.dataset.activeMonth || currentMonthKey;
        if (!fixtures[activeKey]) activeKey = currentMonthKey;

        let html = '<div class="fix-month-tabs">';
        months.forEach(([key, data]) => {
            const isActive = key === activeKey;
            const isCurrent = !!data.current_month;
            html += `<button class="fix-month-tab${isActive ? ' fix-month-active' : ''}${isCurrent ? ' fix-month-current' : ''}" data-month="${key}">${data.month}</button>`;
        });
        html += '</div>';

        const monthData = fixtures[activeKey];
        if (monthData && monthData.matches) {
            const byDate = {};
            monthData.matches.forEach(m => { (byDate[m.date] = byDate[m.date] || []).push(m); });
            const sortedDates = Object.keys(byDate).sort();
            let matchIdx = 0;
            html += '<div class="fix-month-body">';
            sortedDates.forEach(date => {
                const d = new Date(date + 'T12:00:00');
                const dayLabel = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
                const round = s.allRounds.find(r => r.date === date);
                const roundLabel = round ? `<span style="color:#4a6a3a;font-size:10px;float:right">Round ${round.roundNum}</span>` : '';
                html += `<div class="fix-date-header">${dayLabel}${roundLabel}</div>`;
                byDate[date].forEach(m => {
                    const homeId = String(m.hometeam);
                    const awayId = String(m.awayteam);
                    const isHomeMe = myClubId && homeId === myClubId;
                    const isAwayMe = myClubId && awayId === myClubId;
                    const isMyMatch = isHomeMe || isAwayMe;
                    const rowBg = matchIdx % 2 === 0 ? 'fix-even' : 'fix-odd';
                    matchIdx++;

                    let scoreHtml = '';
                    if (m.result) {
                        const parts = m.result.split('-').map(Number);
                        const [hg, ag] = parts;
                        let colorClass = 'fix-score-neutral';
                        if (myClubId) {
                            if ((isHomeMe && hg > ag) || (isAwayMe && ag > hg)) colorClass = 'fix-score-win';
                            else if ((isHomeMe && hg < ag) || (isAwayMe && ag < hg)) colorClass = 'fix-score-loss';
                            else if (isMyMatch) colorClass = 'fix-score-draw';
                        }
                        scoreHtml = `<a href="/matches/${m.id}/" class="fix-score ${colorClass}" style="text-decoration:none">${m.result}</a>`;
                    } else {
                        scoreHtml = `<a href="/matches/${m.id}/" class="fix-score fix-score-upcoming" style="text-decoration:none">—</a>`;
                    }

                    const tvBadge = m.tv === '1' ? '<span class="fix-tv" title="TV">📺</span>' : '<span class="fix-tv"></span>';
                    html += `<div class="fix-match-row ${rowBg}${isMyMatch ? ' fix-my-match' : ''}" data-mid="${m.id}">
                        <div class="fix-team fix-team-home${isHomeMe ? ' fix-my-team' : ''}">
                            <span class="fix-team-name">${m.hometeam_name}</span>
                            <img class="fix-logo" src="/pics/club_logos/${homeId}_25.png" onerror="this.style.visibility='hidden'" alt="">
                        </div>
                        ${scoreHtml}
                        <div class="fix-team fix-team-away${isAwayMe ? ' fix-my-team' : ''}">
                            <img class="fix-logo" src="/pics/club_logos/${awayId}_25.png" onerror="this.style.visibility='hidden'" alt="">
                            <span class="fix-team-name">${m.awayteam_name}</span>
                            ${tvBadge}
                        </div>
                    </div>`;
                });
            });
            html += '</div>';
        } else {
            html += '<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">No fixtures available</div>';
        }

        container.innerHTML = html;

        container.querySelectorAll('.fix-month-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                container.dataset.activeMonth = btn.dataset.month;
                renderFixturesTab(s.fixturesCache);
            });
        });
        container.querySelectorAll('.fix-match-row[data-mid]').forEach(row => {
            row.addEventListener('click', e => {
                if (e.target.closest('a')) return;
                window.location.href = `/matches/${row.dataset.mid}/`;
            });
        });
    };

    const buildHistTooltipContent = (d) => {
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
    };

    const buildHistRichTooltip = (mData) => {
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
            const dt = new Date(ko.replace(' ', 'T'));
            t += `<span>📅 ${dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>`;
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
    };

    const showHistFixTooltip = (el, mid, season) => {
        const s = window.TmLeagueCtx;
        clearTimeout(s.histFixTooltipHideTimer);
        if (s.histFixTooltipEl) s.histFixTooltipEl.remove();
        const currentSeasonNum = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;
        const isCurrentSeason = Number(season) === currentSeasonNum;
        s.histFixTooltipEl = document.createElement('div');
        s.histFixTooltipEl.className = 'rnd-h2h-tooltip';
        el.appendChild(s.histFixTooltipEl);

        if (s.histFixTooltipCache[mid]) {
            const cached = s.histFixTooltipCache[mid];
            s.histFixTooltipEl.innerHTML = cached._rich ? buildHistRichTooltip(cached) : buildHistTooltipContent(cached);
            requestAnimationFrame(() => s.histFixTooltipEl.classList.add('visible'));
        } else {
            s.histFixTooltipEl.innerHTML = TmUI.loading('Loading…', true);
            requestAnimationFrame(() => s.histFixTooltipEl.classList.add('visible'));
            const onFail = () => { if (s.histFixTooltipEl) s.histFixTooltipEl.innerHTML = TmUI.error('Failed', true); };
            if (isCurrentSeason) {
                TmApi.fetchMatch(mid).then(d => {
                    if (!d) { onFail(); return; }
                    d._rich = true;
                    s.histFixTooltipCache[mid] = d;
                    if (s.histFixTooltipEl && s.histFixTooltipEl.closest('[data-mid]')?.dataset.mid == mid) {
                        s.histFixTooltipEl.innerHTML = buildHistRichTooltip(d);
                    }
                });
            } else {
                TmApi.fetchMatchTooltip(mid, season).then(d => {
                    if (!d) { onFail(); return; }
                    s.histFixTooltipCache[mid] = d;
                    if (s.histFixTooltipEl && s.histFixTooltipEl.closest('[data-mid]')?.dataset.mid == mid) {
                        s.histFixTooltipEl.innerHTML = buildHistTooltipContent(d);
                    }
                });
            }
        }
    };

    const renderHistoryFixturesTab = (data) => {
        const s = window.TmLeagueCtx;
        const container = document.getElementById('tsa-fixtures-content');
        if (!container || !data) return;
        const myClubId = (s.standingsRows.find(r => r.isMe) || {}).clubId ||
            ((typeof SESSION !== 'undefined' && SESSION.main_id) ? String(SESSION.main_id) : null);
        const { season, groups } = data;
        const activeIdxRaw = parseInt(container.dataset.historyActiveMonth || '0');
        const activeIdx = isNaN(activeIdxRaw) ? 0 : Math.min(activeIdxRaw, groups.length - 1);

        let html = `<div class="tsa-history-banner">📅 Season ${season} <button class="tsa-history-live-btn" id="tsa-fix-history-live-btn">↩ Back to live</button></div>`;

        if (groups.length > 1) {
            html += '<div class="fix-month-tabs">';
            groups.forEach((g, idx) => {
                html += `<button class="fix-month-tab${idx === activeIdx ? ' fix-month-active' : ''}" data-hidx="${idx}">${g.monthLabel}</button>`;
            });
            html += '</div>';
        }

        const group = groups[activeIdx];
        if (group && group.matches.length) {
            let lastDay = -1;
            let matchIdx = 0;
            html += '<div class="fix-month-body">';
            group.matches.forEach(m => {
                if (m.day !== lastDay) {
                    const shortMonth = group.monthLabel.split(' ')[0].slice(0, 3);
                    html += `<div class="fix-date-header">${m.day} ${shortMonth}</div>`;
                    lastDay = m.day;
                }
                const isHomeMe = myClubId && m.homeId === String(myClubId);
                const isAwayMe = myClubId && m.awayId === String(myClubId);
                const isMyMatch = isHomeMe || isAwayMe;
                const rowBg = matchIdx % 2 === 0 ? 'fix-even' : 'fix-odd';
                matchIdx++;
                let colorClass = 'fix-score-neutral';
                if (m.score && myClubId) {
                    const parts = m.score.split('-').map(Number);
                    const [hg, ag] = parts;
                    if ((isHomeMe && hg > ag) || (isAwayMe && ag > hg)) colorClass = 'fix-score-win';
                    else if ((isHomeMe && hg < ag) || (isAwayMe && ag < hg)) colorClass = 'fix-score-loss';
                    else if (isMyMatch) colorClass = 'fix-score-draw';
                }
                const scoreHtml = m.score
                    ? `<a href="/matches/${m.matchId}/" class="fix-score ${colorClass}" style="text-decoration:none">${m.score}</a>`
                    : `<span class="fix-score fix-score-upcoming">—</span>`;
                html += `<div class="fix-match-row ${rowBg}${isMyMatch ? ' fix-my-match' : ''} hfix-match"
                    data-mid="${m.matchId}" data-season="${season}"
                    data-home-id="${m.homeId}" data-away-id="${m.awayId}"
                    style="position:relative">
                    <div class="fix-team fix-team-home${isHomeMe ? ' fix-my-team' : ''}">
                        <span class="fix-team-name">${m.homeName}</span>
                        <img class="fix-logo" src="/pics/club_logos/${m.homeId}_25.png" onerror="this.style.visibility='hidden'" alt="">
                    </div>
                    ${scoreHtml}
                    <div class="fix-team fix-team-away${isAwayMe ? ' fix-my-team' : ''}">
                        <img class="fix-logo" src="/pics/club_logos/${m.awayId}_25.png" onerror="this.style.visibility='hidden'" alt="">
                        <span class="fix-team-name">${m.awayName}</span>
                    </div>
                </div>`;
            });
            html += '</div>';
        } else {
            html += '<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">No fixtures available</div>';
        }

        container.innerHTML = html;

        container.querySelectorAll('.fix-month-tab[data-hidx]').forEach(btn => {
            btn.addEventListener('click', () => {
                container.dataset.historyActiveMonth = btn.dataset.hidx;
                renderHistoryFixturesTab(s.historyFixturesData);
            });
        });

        document.getElementById('tsa-fix-history-live-btn')?.addEventListener('click', () => {
            const lv = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;
            s.historyFixturesData = null;
            s.displayedSeason = null;
            container.dataset.historyActiveMonth = '0';
            const chip = document.getElementById('tsa-ssnpick-chip');
            if (chip && lv) chip.textContent = `Season ${lv}`;
            document.getElementById('tsa-ssnpick-list')?.querySelectorAll('.tsa-ssnpick-item').forEach(el =>
                el.classList.toggle('tsa-ssnpick-active', parseInt(el.dataset.s) === lv));
            s.standingsRows = [];
            s.formOffset = 0;
            TmLeagueStandings.buildStandingsFromDOM();
            TmLeagueStandings.renderLeagueTable();
            if (s.fixturesCache) renderFixturesTab(s.fixturesCache);
        });

        container.querySelectorAll('.hfix-match[data-mid]').forEach(row => {
            if (!row.dataset.mid) return;
            row.addEventListener('mouseenter', () => {
                clearTimeout(s.histFixTooltipHideTimer);
                const mid = row.dataset.mid;
                const rowSeason = row.dataset.season;
                s.histFixTooltipTimer = setTimeout(() => showHistFixTooltip(row, mid, rowSeason), 300);
            });
            row.addEventListener('mouseleave', () => {
                clearTimeout(s.histFixTooltipTimer);
                s.histFixTooltipHideTimer = setTimeout(() => {
                    if (s.histFixTooltipEl) { s.histFixTooltipEl.remove(); s.histFixTooltipEl = null; }
                }, 100);
            });
        });
    };

    export const TmLeagueFixtures = {
        parseHistoryMatches,
        fetchHistoryFixtures,
        renderFixturesTab,
        buildHistTooltipContent,
        buildHistRichTooltip,
        renderHistoryFixturesTab
    };
