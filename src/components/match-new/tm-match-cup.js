/**
 * tm-match-cup.js — Cup round tab for the new match player.
 *
 * Fetches all fixtures for the current cup round (matchtype "p8", "p7", etc.)
 * in the same country, filters to the same date as this match, and displays
 * them as a flat list — current match is highlighted.
 */

import { TmCupModel } from '../../models/cup.js';
import { TmMatchModel } from '../../models/match.js';
import { snapshotFromMData, buildModalContentEl, injectLeagueMatchStyles } from './tm-match-league.js';
import { TmFixtureMatchRow } from '../shared/tm-fixture-match-row.js';
import { TmUI } from '../shared/tm-ui.js';

const isPow2 = (n) => n > 0 && (n & (n - 1)) === 0;
const roundLabelFromCount = (matchCount) => {
    if (!isPow2(matchCount)) return 'First Qualification Round';
    const teams = matchCount * 2;
    if (teams === 2)  return 'Final';
    if (teams === 4)  return 'Semifinals';
    if (teams === 8)  return 'Quarterfinals';
    if (teams === 16) return 'Round of 16';
    return `Round of ${teams}`;
};

const STYLE_ID = 'mp-cup-style';
const injectStyles = () => {
    injectLeagueMatchStyles();
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        .mp-cup { width: 100%; padding: 16px 0; box-sizing: border-box; }
        .mp-cup-wrap { max-width: 780px; margin: 0 auto; padding: 0 0 var(--tmu-space-xl); }
        .mp-cup-header { display: flex; align-items: center; justify-content: center; gap: 14px; padding: var(--tmu-space-md) var(--tmu-space-xl); background: linear-gradient(180deg, var(--tmu-surface-accent-soft) 0%, transparent 100%); border-bottom: 1px solid var(--tmu-border-soft-alpha); margin-bottom: var(--tmu-space-xs); }
        .mp-cup-title { font-size: var(--tmu-font-sm); font-weight: 700; color: var(--tmu-text-main); text-transform: uppercase; letter-spacing: 1.5px; }
        .mp-cup-badge { display: none; }
        .mp-cup-badge.on { display: inline-flex; }
        .mp-cup-badge .tmu-badge { animation: cup-pulse 1.5s ease-in-out infinite; }
        @keyframes cup-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
        .mp-cup-list { padding: 0 var(--tmu-space-lg); }
        .mp-cup-current { background: var(--tmu-success-fill-hover) !important; box-shadow: inset 3px 0 0 var(--tmu-success); }
        .mp-cup-current:hover { background: var(--tmu-success-fill-strong) !important; }
        .mp-cup-tip { position: fixed; z-index: 99999; background: var(--tmu-surface-card-soft); border-radius: var(--tmu-space-md); padding: 0; min-width: 320px; max-width: 420px; max-height: 70vh; overflow-y: auto; box-shadow: 0 8px 32px var(--tmu-shadow-panel); pointer-events: auto; opacity: 0; transition: opacity 0.12s; }
        .mp-cup-tip.in { opacity: 1; }
    `;
    document.head.appendChild(s);
};

export const TmMatchCupNew = {
    create(match, initialReplayState) {
        injectStyles();

        const typeRaw   = match.competition?.typeRaw || '';
        const roundNum  = /^p(\d+)$/.exec(typeRaw)?.[1] ?? '';
        const country   = match.home.club.country;
        const matchDate = match.date;
        const myMatchId = String(match.id || '');
        const myHomeId  = String(match.home.club.id);
        const myAwayId  = String(match.away.club.id);
        const cupName   = match.competition?.name || 'Cup';

        const parseTimeOfDay = (str) => { const [h, m] = (str || '').split(':').map(Number); return ((h || 0) * 3600 + (m || 0) * 60); };
        const myKickoff = match.kickoff ? match.kickoff + parseTimeOfDay(match.kickoffTime) : null;

        const el = document.createElement('div');
        el.className = 'mp-cup';

        if (!country || !roundNum || !matchDate) {
            el.innerHTML = TmUI.error('Cannot determine cup round info');
            return { el, update: () => {} };
        }

        const initialMin = initialReplayState?.currentMinute != null ? initialReplayState.currentMinute : Infinity;
        let lastMin = initialMin;

        // matchId → { mData, rowEl, statusEl, scoreEl }
        const rowMap = {};

        // ── Tooltip ────────────────────────────────────────────────────────────
        let _tip = null, _showT = null, _hideT = null;
        const destroyTip = () => { if (_tip) { _tip.remove(); _tip = null; } };
        const placeTip = (anchor) => {
            if (!_tip) return;
            const r = anchor.getBoundingClientRect();
            const w = _tip.offsetWidth || 380;
            let left = r.left + r.width / 2 - w / 2;
            let top  = r.bottom + 6;
            if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
            if (left < 8) left = 8;
            if (top + 300 > window.innerHeight) top = Math.max(8, r.top - 6 - (_tip.offsetHeight || 300));
            _tip.style.left = left + 'px';
            _tip.style.top  = top + 'px';
        };

        const toVirtualNow = (minCutoff) => {
            if (!myKickoff) return null;
            const min = Number.isFinite(minCutoff) ? Math.floor(minCutoff) : (match.duration?.total ?? 95);
            return myKickoff + min * 60;
        };

        const computeStatus = (mData, minCutoff) => {
            if (mData.status === 'future') {
                const time = mData.kickoffTime || '';
                return { statusText: time || '–', statusCls: '', homeGoals: null, awayGoals: null };
            }
            const itemKickoff = mData.kickoff ? mData.kickoff + parseTimeOfDay(mData.kickoffTime) : null;
            const virtualNow  = toVirtualNow(minCutoff);
            if (!itemKickoff || !virtualNow) {
                const snap = snapshotFromMData(mData, Infinity);
                return { statusText: 'FT', statusCls: 'ft', homeGoals: snap.homeGoals, awayGoals: snap.awayGoals };
            }
            const elapsed = virtualNow - itemKickoff;
            if (elapsed < 0) {
                const time = mData.kickoffTime || '';
                return { statusText: time || '–', statusCls: '', homeGoals: null, awayGoals: null };
            }
            const matchDuration = (mData.duration?.total ?? 95) * 60;
            if (elapsed > matchDuration) {
                const snap = snapshotFromMData(mData, Infinity);
                return { statusText: 'FT', statusCls: 'ft', homeGoals: snap.homeGoals, awayGoals: snap.awayGoals };
            }
            const min  = Math.max(1, Math.floor(elapsed / 60));
            const snap = snapshotFromMData(mData, min + 1);
            return { statusText: min + "'", statusCls: 'live', homeGoals: snap.homeGoals, awayGoals: snap.awayGoals };
        };

        const wireRow = (matchId, mData, rowEl) => {
            rowEl.style.cursor = 'pointer';
            rowEl.addEventListener('click', (e) => {
                if (e.target.closest('a')) return;
                window.location.href = `/matches/${matchId}/`;
            });
            rowEl.addEventListener('mouseenter', () => {
                clearTimeout(_hideT);
                clearTimeout(_showT);
                destroyTip();
                _showT = setTimeout(() => {
                    _tip = document.createElement('div');
                    _tip.className = 'mp-cup-tip';
                    document.body.appendChild(_tip);
                    placeTip(rowEl);
                    _tip.addEventListener('mouseenter', () => clearTimeout(_hideT));
                    _tip.addEventListener('mouseleave', () => { _hideT = setTimeout(destroyTip, 200); });
                    const tipMin = (() => {
                        const vn  = toVirtualNow(lastMin);
                        const iko = mData.kickoff ? mData.kickoff + parseTimeOfDay(mData.kickoffTime) : null;
                        if (!vn || !iko) return Infinity;
                        const elapsed = vn - iko;
                        if (elapsed > (mData.duration?.total ?? 95) * 60) return Infinity;
                        if (elapsed < 0) return 0;
                        return Math.max(1, Math.floor(elapsed / 60)) + 1;
                    })();
                    _tip.innerHTML = '';
                    _tip.appendChild(buildModalContentEl(snapshotFromMData(mData, tipMin)));
                    requestAnimationFrame(() => { placeTip(rowEl); _tip?.classList.add('in'); });
                }, 200);
            });
            rowEl.addEventListener('mouseleave', () => {
                clearTimeout(_showT);
                _hideT = setTimeout(destroyTip, 200);
            });
        };

        const fmtKickoff = () => {
            const [yr, mo, dy] = (match.date || '').split('-');
            const d = dy && mo && yr ? `${dy}.${mo}.${yr}` : (match.date || '');
            const t = match.kickoffTime || '';
            return t ? `${d} · ${t}` : d;
        };

        const renderUpdate = (minCutoff) => {
            const badge = el.querySelector('.mp-cup-badge');
            if (badge) {
                if (match.status === 'future') {
                    badge.innerHTML = TmUI.badge({ label: fmtKickoff(), size: 'md', shape: 'full' }, 'muted');
                    badge.classList.add('on');
                } else if (Number.isFinite(minCutoff)) {
                    badge.innerHTML = TmUI.badge({ icon: '⏱', label: Math.floor(minCutoff) + "'", size: 'md', shape: 'full', weight: 'bold' }, 'live');
                    badge.classList.add('on');
                } else {
                    badge.classList.remove('on');
                }
            }
            for (const [matchId, entry] of Object.entries(rowMap)) {
                if (!entry.mData || !entry.statusEl) continue;
                const st = computeStatus(entry.mData, minCutoff);
                entry.statusEl.textContent = st.statusText;
                entry.statusEl.className = `mp-icup-status${st.statusCls ? ' ' + st.statusCls : ''}`;
                if (entry.scoreEl) {
                    entry.scoreEl.innerHTML = st.homeGoals != null
                        ? `<span>${st.homeGoals}</span>-<span>${st.awayGoals}</span>`
                        : '<span style="opacity:0.4">–</span>';
                }
            }
        };

        const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

        // ── Build DOM ──────────────────────────────────────────────────────────
        el.innerHTML = TmUI.loading('Loading cup fixtures…');

        TmCupModel.fetchCupFixtures(country, roundNum).then(data => {
            const allInRound = [];
            if (data) {
                for (const monthData of Object.values(data)) {
                    if (!monthData?.matches) continue;
                    for (const m of monthData.matches) allInRound.push(m);
                }
            }
            const allMatches = allInRound.filter(m => m.date === matchDate);
            const roundLabel = allInRound.length ? roundLabelFromCount(allInRound.length) : '';

            if (!allMatches.length) {
                el.innerHTML = TmUI.error('No cup fixtures found for this round');
                return;
            }

            // Build HTML for all rows
            const rowsHtml = allMatches.map((m, idx) => {
                const matchId  = String(m.id);
                const isCur    = matchId === myMatchId;
                const homeName = m.hometeam_name || String(m.hometeam);
                const awayName = m.awayteam_name || String(m.awayteam);
                const homeId   = String(m.hometeam);
                const awayId   = String(m.awayteam);
                return TmFixtureMatchRow.render(
                    { homeId, awayId, homeName, awayName, matchId, scoreText: '' },
                    { index: idx, extraClass: isCur ? ' mp-cup-current' : '' }
                );
            }).join('');

            el.innerHTML = `
                <div class="mp-cup-wrap">
                    <div class="mp-cup-header">
                        <span class="mp-cup-title">${esc(cupName)}${roundLabel ? ' · ' + esc(roundLabel) : ''}</span>
                        <span class="mp-cup-badge"></span>
                    </div>
                    <div class="mp-cup-list">${rowsHtml}</div>
                </div>`;

            // Wire status badges and fetch match data for live score updates
            allMatches.forEach(m => {
                const matchId = String(m.id);
                const isCur   = matchId === myMatchId;
                const rowEl   = el.querySelector(`.tmvu-fixture-row[data-mid="${matchId}"]`);
                if (!rowEl) return;

                const statusEl = document.createElement('span');
                statusEl.className = 'mp-icup-status';
                statusEl.textContent = '…';
                rowEl.prepend(statusEl);

                const scoreEl = rowEl.querySelector('.tmvu-fixture-score');
                rowMap[matchId] = { mData: null, rowEl, statusEl, scoreEl };

                const fetchTarget = isCur ? Promise.resolve(match) : TmMatchModel.fetchMatch(matchId, { dbSync: false });
                fetchTarget.then(mData => {
                    if (!mData) return;
                    rowMap[matchId].mData = mData;
                    wireRow(matchId, mData, rowEl);
                    renderUpdate(lastMin);
                }).catch(() => {});
            });

            renderUpdate(lastMin);
        }).catch(() => {
            el.innerHTML = TmUI.error('Failed to load cup fixtures');
        });

        return {
            el,
            update(replayState) {
                lastMin = replayState?.currentMinute != null ? replayState.currentMinute : Infinity;
                renderUpdate(lastMin);
            },
        };
    },
};
