/**
 * tm-match-league.js — League tab for the new match player.
 * Returns { el, update(replayState) } — update() called by match.js on every tick.
 */

import { TMLeagueService } from '../../services/league.js';
import { TmMatchService } from '../../services/match.js';
import { deriveStats } from './tm-match-stats.js';
import { TmStandingsTable } from '../shared/tm-standings-table.js';
import { TmFixtureMatchRow } from '../shared/tm-fixture-match-row.js';
import { TmCompareStat } from '../shared/tm-compare-stat.js';
import { TmUI } from '../shared/tm-ui.js';

const STYLE_ID = 'mp-nleague-style';

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        .mp-league-tab { width: 100%; padding: 16px 0; box-sizing: border-box; }
        .rnd-league-wrap { max-width: 100%; margin: 0 auto; padding: 0 0 var(--tmu-space-xl); }
        .rnd-league-header { display: flex; align-items: center; justify-content: center; gap: 14px; padding: var(--tmu-space-md) var(--tmu-space-xl); background: linear-gradient(180deg, var(--tmu-surface-accent-soft) 0%, transparent 100%); border-bottom: 1px solid var(--tmu-border-soft-alpha); margin-bottom: var(--tmu-space-xs); }
        .rnd-league-title { font-size: var(--tmu-font-sm); font-weight: 700; color: var(--tmu-text-main); text-transform: uppercase; letter-spacing: 1.5px; }
        .rnd-league-min-badge { display: none; }
        .rnd-league-min-badge.visible { display: inline-flex; }
        .rnd-league-min-badge .tmu-badge { animation: rnd-pulse 1.5s ease-in-out infinite; }
        @keyframes rnd-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
        .rnd-league-columns { display: flex; gap: var(--tmu-space-xxl); padding: 0 var(--tmu-space-lg); }
        .rnd-league-col-matches { flex: 1; min-width: 0; }
        .rnd-league-col-standings { flex: 1.15; min-width: 0; overflow-x: auto; }
        .rnd-league-col-title { font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-faint); text-transform: uppercase; letter-spacing: 1.5px; padding: var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-md); border-bottom: 1px solid var(--tmu-border-soft-alpha); }
        .tmvu-fixture-row.rnd-league-current { background: var(--tmu-success-fill-hover) !important; box-shadow: inset 3px 0 0 var(--tmu-success); }
        .tmvu-fixture-row.rnd-league-current:hover { background: var(--tmu-success-fill-strong) !important; }
        .rnd-league-modal-content { padding: var(--tmu-space-lg); }
        .rnd-league-modal-head { display: flex; align-items: center; justify-content: center; gap: var(--tmu-space-sm); padding-bottom: var(--tmu-space-md); margin-bottom: var(--tmu-space-md); border-bottom: 1px solid var(--tmu-border-soft-alpha); }
        .rnd-league-modal-logo { width: 32px; height: 32px; filter: drop-shadow(0 1px 3px var(--tmu-surface-overlay)); }
        .rnd-league-modal-team { font-size: var(--tmu-font-sm); font-weight: 700; color: var(--tmu-text-main); max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rnd-league-modal-score { font-size: var(--tmu-font-3xl); font-weight: 800; color: var(--tmu-text-inverse); letter-spacing: 3px; }
        .rnd-league-modal-events { display: flex; flex-direction: column; gap: var(--tmu-space-xs); margin-top: var(--tmu-space-md); }
        .rnd-league-modal-evt { display: flex; align-items: center; gap: var(--tmu-space-md); font-size: var(--tmu-font-sm); color: var(--tmu-text-main); padding: var(--tmu-space-xs) 0; }
        .rnd-league-modal-evt.away-evt { flex-direction: row-reverse; text-align: right; }
        .rnd-league-modal-evt.away-evt .rnd-league-modal-evt-min { text-align: left; }
        .rnd-league-modal-evt-min { font-weight: 700; color: var(--tmu-text-panel-label); min-width: 32px; font-size: var(--tmu-font-sm); text-align: right; flex-shrink: 0; }
        .rnd-league-modal-evt-icon { flex-shrink: 0; font-size: var(--tmu-font-lg); }
        .rnd-league-tip { position: fixed; z-index: 99999; background: var(--tmu-surface-card-soft); border-radius: var(--tmu-space-md); padding: 0; min-width: 360px; max-width: 440px; max-height: 70vh; overflow-y: auto; box-shadow: 0 8px 32px var(--tmu-shadow-panel); pointer-events: auto; opacity: 0; transition: opacity 0.12s; }
        .rnd-league-tip.in { opacity: 1; }
    `;
    document.head.appendChild(s);
};

export const injectLeagueMatchStyles = () => injectStyles();



const parseScore = (result) => {
    const m = String(result).match(/(\d+)\s*-\s*(\d+)/);
    return m ? [Number(m[1]), Number(m[2])] : null;
};

const blankRow = (name) => ({ p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, name });
const applyResult = (team, gf, ga) => {
    team.p++; team.gf += gf; team.ga += ga;
    if (gf > ga) { team.w++; team.pts += 3; }
    else if (gf < ga) { team.l++; }
    else { team.d++; team.pts++; }
};

export const snapshotFromMData = (mData, minCutoff = Infinity) => {
    const stats = deriveStats(mData, { currentMinute: minCutoff, committedClipIndex: Infinity });
    return {
        homeId: String(mData.home.club.id), awayId: String(mData.away.club.id),
        homeName: mData.home.club.name, awayName: mData.away.club.name,
        homeGoals: stats.home.goals, awayGoals: stats.away.goals,
        homeShots: stats.home.shots, awayShots: stats.away.shots,
        homeSoT: stats.home.sot, awaySoT: stats.away.sot,
        homeYC: stats.home.yellow, awayYC: stats.away.yellow,
        homeRC: stats.home.red, awayRC: stats.away.red,
        events: stats.events,
    };
};


export const buildModalContentEl = (ls) => {
    const wrap = document.createElement('div');
    wrap.className = 'rnd-league-modal-content';

    let html = `<div class="rnd-league-modal-head">
        <img class="rnd-league-modal-logo" src="/pics/club_logos/${ls.homeId}_25.png" onerror="this.style.display='none'">
        <span class="rnd-league-modal-team">${ls.homeName}</span>
        <span class="rnd-league-modal-score">${ls.homeGoals} – ${ls.awayGoals}</span>
        <span class="rnd-league-modal-team">${ls.awayName}</span>
        <img class="rnd-league-modal-logo" src="/pics/club_logos/${ls.awayId}_25.png" onerror="this.style.display='none'">
    </div>`;

    html += [['Shots', ls.homeShots, ls.awayShots], ['On Target', ls.homeSoT, ls.awaySoT], ['Yellow', ls.homeYC, ls.awayYC], ['Red', ls.homeRC, ls.awayRC]]
        .map(([label, lv, rv]) => TmCompareStat.compareStat({ label, leftValue: String(lv), rightValue: String(rv), size: 'sm' }))
        .join('');

    if (ls.events.length) {
        html += '<div class="rnd-league-modal-events">';
        ls.events.forEach(ev => {
            const isAway = ev.side === 'away';
            html += `<div class="rnd-league-modal-evt${isAway ? ' away-evt' : ''}">`;
            html += `<span class="rnd-league-modal-evt-min">${ev.min}'</span>`;
            html += `<span class="rnd-league-modal-evt-icon">${ev.icon}</span>`;
            html += `<span>${ev.name}</span>`;
            html += '</div>';
        });
        html += '</div>';
    }

    wrap.innerHTML = html;
    return wrap;
};

let _cache = null;
const ensureCache = (country, division, group) => {
    if (!_cache || _cache.country !== country || _cache.division !== division || _cache.group !== group) {
        _cache = { country, division, group, fixtures: null, fixturesPromise: null, matchDataById: {}, matchPromisesById: {}, failedIds: {} };
    }
    return _cache;
};

export const TmMatchLeagueNew = {
    create(match, initialReplayState) {
        injectStyles();

        const country = match.home.club.country;
        const division = match.home.club.division;
        const group = match.home.club.group;
        const homeId = String(match.home.club.id);
        const awayId = String(match.away.club.id);
        const matchDate = match.date;
        const ourMatchId = String(match.id);

        const el = document.createElement('div');
        el.className = 'mp-league-tab';

        if (!country || !matchDate) {
            el.innerHTML = TmUI.error('Cannot determine league info');
            return { el, update: () => { } };
        }

        const cache = ensureCache(country, division, group);

        let dataReady = false;
        let lastMin = -1;
        let currentLiveScores = {};
        let currentRoundMatches = [];
        let clubNamesMap = {};
        let preRoundStandings = {};
        let preRoundRank = {};

        let _tip = null, _showT = null, _hideT = null;
        const _destroyTip = () => { if (_tip) { _tip.remove(); _tip = null; } };
        const _placeTip = (anchor) => {
            const r = anchor.getBoundingClientRect();
            const w = _tip.offsetWidth || 400;
            let left = r.left + r.width / 2 - w / 2;
            let top = r.bottom + 6;
            if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
            if (left < 8) left = 8;
            if (top + 300 > window.innerHeight) top = Math.max(8, r.top - 6 - (_tip.offsetHeight || 300));
            _tip.style.left = left + 'px';
            _tip.style.top = top + 'px';
        };

        const computeLiveScores = (minCutoff) => {
            const liveScores = {};
            currentRoundMatches.forEach(m => {
                const mid = String(m.id);
                if (mid === ourMatchId) { liveScores[mid] = snapshotFromMData(match, minCutoff); return; }
                const mData = cache.matchDataById[mid];
                if (mData) { liveScores[mid] = snapshotFromMData(mData, minCutoff); return; }
                if (m.result) {
                    const scored = parseScore(m.result);
                    if (scored) {
                        const [hg, ag] = scored;
                        liveScores[mid] = { homeId: String(m.hometeam), awayId: String(m.awayteam), homeName: clubNamesMap[String(m.hometeam)], awayName: clubNamesMap[String(m.awayteam)], homeGoals: hg, awayGoals: ag, homeShots: 0, awayShots: 0, homeSoT: 0, awaySoT: 0, homeYC: 0, awayYC: 0, homeRC: 0, awayRC: 0, events: [] };
                    }
                }
            });
            return liveScores;
        };

        const computeSortedRows = (liveScores) => {
            const s = {};
            for (const [id, row] of Object.entries(preRoundStandings)) s[id] = { ...row };
            Object.values(liveScores).forEach(ls => {
                if (!s[ls.homeId]) s[ls.homeId] = blankRow(ls.homeName || ls.homeId);
                if (!s[ls.awayId]) s[ls.awayId] = blankRow(ls.awayName || ls.awayId);
                applyResult(s[ls.homeId], ls.homeGoals, ls.awayGoals);
                applyResult(s[ls.awayId], ls.awayGoals, ls.homeGoals);
            });
            return Object.entries(s).map(([id, row]) => ({ id, ...row, gd: row.gf - row.ga })).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
        };

        const renderUpdate = (minCutoff) => {
            currentLiveScores = computeLiveScores(minCutoff);
            const sortedRows = computeSortedRows(currentLiveScores);

            const badgeWrap = el.querySelector('.rnd-league-min-badge');
            if (badgeWrap) {
                if (minCutoff < Infinity) {
                    badgeWrap.innerHTML = TmUI.badge({ icon: '⏱', label: Math.floor(minCutoff) + "'", size: 'md', shape: 'full', weight: 'bold' }, 'live');
                    badgeWrap.classList.add('visible');
                } else {
                    badgeWrap.classList.remove('visible');
                }
            }

            currentRoundMatches.forEach(m => {
                const mid = String(m.id);
                const row = el.querySelector(`.tmvu-fixture-row[data-mid="${mid}"]`);
                if (!row) return;
                const ls = currentLiveScores[mid];
                const scoreEl = row.querySelector('.tmvu-fixture-score');
                if (scoreEl) scoreEl.innerHTML = ls ? `<span>${ls.homeGoals}</span>-<span>${ls.awayGoals}</span>` : '–';
                const hRC = ls ? ls.homeRC : 0, aRC = ls ? ls.awayRC : 0;
                const homeNameEl = row.querySelector('.tmvu-fixture-team-home .tmvu-fixture-team-name');
                const awayNameEl = row.querySelector('.tmvu-fixture-team-away .tmvu-fixture-team-name');
                if (homeNameEl) homeNameEl.textContent = (clubNamesMap[String(m.hometeam)] || '') + (hRC ? ' 🟥' : '');
                if (awayNameEl) awayNameEl.textContent = (aRC ? '🟥 ' : '') + (clubNamesMap[String(m.awayteam)] || '');
            });

            const host = el.querySelector('.rnd-league-standings-host');
            if (host) {
                const totalTeams = sortedRows.length;
                const mapped = sortedRows.map((row, i) => {
                    const pos = i + 1;
                    const prev = preRoundRank[row.id];
                    return { rank: pos, clubName: row.name, clubId: row.id, gp: row.p, w: row.w, d: row.d, l: row.l, gf: row.gf, ga: row.ga, pts: row.pts, isMe: row.id === homeId || row.id === awayId, zone: pos > totalTeams - 4 ? 'rel' : (pos >= 11 && pos <= 14) ? 'rel-po' : '', rankDelta: prev ? prev - pos : 0 };
                });
                host.innerHTML = TmStandingsTable.buildHtml({ rows: mapped });
            }
        };

        const setup = (currentRoundNum, initialMin) => {
            let html = '<div class="rnd-league-wrap">';
            html += '<div class="rnd-league-header">';
            html += `<span class="rnd-league-title">Round ${currentRoundNum}</span>`;
            html += '<span class="rnd-league-min-badge"></span>';
            html += '</div>';
            html += '<div class="rnd-league-columns">';
            html += '<div class="rnd-league-col-matches">';
            html += '<div class="rnd-league-col-title">Matches</div>';
            currentRoundMatches.forEach(m => {
                const hId = String(m.hometeam);
                const aId = String(m.awayteam);
                const isCurrent = (hId === homeId && aId === awayId) || (hId === awayId && aId === homeId);
                html += TmFixtureMatchRow.render(
                    { ...m, result: '' },
                    { extraClass: isCurrent ? ' rnd-league-current' : '' }
                );
            });
            html += '</div>';
            html += '<div class="rnd-league-col-standings">';
            html += '<div class="rnd-league-col-title">Standings</div>';
            html += '<div class="rnd-league-standings-host"></div>';
            html += '<div class="rnd-league-legend">';
            html += '</div></div></div>';
            el.innerHTML = html;

            el.querySelectorAll('.tmvu-fixture-row').forEach(row => {
                row.addEventListener('mouseenter', () => {
                    clearTimeout(_hideT);
                    if (_tip && _tip._mid === row.dataset.mid) return;
                    clearTimeout(_showT);
                    _showT = setTimeout(() => {
                        const ls = currentLiveScores[row.dataset.mid];
                        if (!ls) return;
                        _destroyTip();
                        _tip = document.createElement('div');
                        _tip.className = 'rnd-league-tip';
                        _tip._mid = row.dataset.mid;
                        _tip.appendChild(buildModalContentEl(ls));
                        document.body.appendChild(_tip);
                        _placeTip(row);
                        requestAnimationFrame(() => { _placeTip(row); _tip?.classList.add('in'); });
                        _tip.addEventListener('mouseenter', () => clearTimeout(_hideT));
                        _tip.addEventListener('mouseleave', () => { _hideT = setTimeout(_destroyTip, 200); });
                    }, 200);
                });
                row.addEventListener('mouseleave', () => {
                    clearTimeout(_showT);
                    _hideT = setTimeout(_destroyTip, 200);
                });
            });

            dataReady = true;
            renderUpdate(initialMin);
        };

        const buildView = (fixtures, initialMin) => {
            const allMatches = [];
            Object.values(fixtures).forEach(month => {
                (month?.matches || []).forEach(m => {
                    allMatches.push(m);
                    if (m.hometeam_name) clubNamesMap[String(m.hometeam)] = m.hometeam_name;
                    if (m.awayteam_name) clubNamesMap[String(m.awayteam)] = m.awayteam_name;
                });
            });
            const byDate = {};
            allMatches.forEach(m => { (byDate[m.date] = byDate[m.date] || []).push(m); });
            const sortedDates = Object.keys(byDate).sort();
            const roundIdx = sortedDates.indexOf(matchDate);
            if (roundIdx === -1) { el.innerHTML = TmUI.error('Current round not found in league fixtures'); return; }

            currentRoundMatches = byDate[sortedDates[roundIdx]];

            const initClub = (id, name) => {
                if (!preRoundStandings[id]) preRoundStandings[id] = blankRow(name || id);
            };
            for (let i = 0; i < roundIdx; i++) {
                byDate[sortedDates[i]].forEach(m => {
                    if (!m.result) return;
                    const scored = parseScore(m.result); if (!scored) return;
                    const [hg, ag] = scored;
                    const hId = String(m.hometeam), aId = String(m.awayteam);
                    initClub(hId, clubNamesMap[hId]); initClub(aId, clubNamesMap[aId]);
                    applyResult(preRoundStandings[hId], hg, ag);
                    applyResult(preRoundStandings[aId], ag, hg);
                });
            }
            currentRoundMatches.forEach(m => {
                initClub(String(m.hometeam), clubNamesMap[String(m.hometeam)]);
                initClub(String(m.awayteam), clubNamesMap[String(m.awayteam)]);
            });

            Object.entries(preRoundStandings)
                .map(([id, s]) => ({ id, pts: s.pts, gd: s.gf - s.ga, gf: s.gf }))
                .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
                .forEach((s, i) => { preRoundRank[s.id] = i + 1; });

            const missingIds = currentRoundMatches
                .map(m => String(m.id))
                .filter(mid => mid !== ourMatchId && !cache.matchDataById[mid] && !cache.failedIds[mid]);

            if (missingIds.length === 0) { setup(roundIdx + 1, initialMin); return; }

            if (!el.querySelector('.rnd-league-wrap')) el.innerHTML = TmUI.loading('Loading league data…');

            const fetches = missingIds.map(mid => {
                if (!cache.matchPromisesById[mid]) {
                    cache.matchPromisesById[mid] = TmMatchService.fetchMatch(mid, { dbSync: false })
                        .then(mData => { if (mData) cache.matchDataById[mid] = mData; else cache.failedIds[mid] = true; })
                        .catch(() => { cache.failedIds[mid] = true; })
                        .finally(() => { delete cache.matchPromisesById[mid]; });
                }
                return cache.matchPromisesById[mid];
            });

            Promise.all(fetches).finally(() => setup(roundIdx + 1, initialMin));
        };

        const initialMin = (initialReplayState?.currentMinute != null) ? initialReplayState.currentMinute : Infinity;

        if (cache.fixtures) {
            buildView(cache.fixtures, initialMin);
        } else {
            el.innerHTML = TmUI.loading('Loading league data…');
            if (!cache.fixturesPromise) {
                cache.fixturesPromise = TMLeagueService
                    .fetchLeagueFixtures('league', { var1: country, var2: division, var3: group })
                    .then(fixtures => { if (!fixtures) throw new Error('No fixtures returned'); cache.fixtures = fixtures; return fixtures; })
                    .finally(() => { cache.fixturesPromise = null; });
            }
            cache.fixturesPromise
                .then(f => buildView(f, initialMin))
                .catch(() => { el.innerHTML = TmUI.error('Failed to load league data'); });
        }

        const update = (replayState) => {
            if (!dataReady) return;
            const min = replayState.currentMinute;
            if (min === lastMin) return;
            lastMin = min;
            renderUpdate(min);
        };

        return { el, update };
    },
};
