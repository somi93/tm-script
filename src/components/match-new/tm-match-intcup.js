/**
 * tm-match-intcup.js — International cup tab for the match player.
 *
 * Fetches the tournament overview page, finds the section for the current match,
 * and shows:
 *   - Group stage  → standings table + match list (with live scores)
 *   - Qualification / knockout → fixture list (with live scores)
 *
 * Each row fetches its full match data via TmMatchModel. All team, score, and
 * play information comes from the normalized model — nothing is pre-parsed from HTML.
 */

import { TmInternationalCupModel, parseSections, classifyStage } from '../../models/international-cup.js';
import { TmMatchModel }      from '../../models/match.js';
import { snapshotFromMData, buildModalContentEl, injectLeagueMatchStyles } from './tm-match-league.js';
import { TmStandingsTable }  from '../shared/tm-standings-table.js';
import { TmFixtureMatchRow } from '../shared/tm-fixture-match-row.js';
import { TmUI }              from '../shared/tm-ui.js';

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLE_ID = 'mp-intcup-style';
const injectStyles = () => {
    injectLeagueMatchStyles();
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        .mp-icup { width:100%; padding:16px 0; box-sizing:border-box; }
        .mp-icup-wrap { max-width:100%; margin:0 auto; padding:0 0 var(--tmu-space-xl); }
        .mp-icup-header { display:flex; align-items:center; justify-content:center; gap:14px; padding:var(--tmu-space-md) var(--tmu-space-xl); background:linear-gradient(180deg,var(--tmu-surface-accent-soft) 0%,transparent 100%); border-bottom:1px solid var(--tmu-border-soft-alpha); margin-bottom:var(--tmu-space-xs); }
        .mp-icup-title { font-size:var(--tmu-font-sm); font-weight:700; color:var(--tmu-text-main); text-transform:uppercase; letter-spacing:1.5px; }
        .mp-icup-badge { display:none; }
        .mp-icup-badge.on { display:inline-flex; }
        .mp-icup-badge .tmu-badge { animation:icup-pulse 1.5s ease-in-out infinite; }
        @keyframes icup-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

        /* group layout */
        .mp-icup-cols { display:flex; gap:var(--tmu-space-xxl); padding:0 var(--tmu-space-lg); }
        .mp-icup-col-matches { flex:1; min-width:0; }
        .mp-icup-col-standings { flex:1.15; min-width:0; overflow-x:auto; }
        .mp-icup-col-title { font-size:var(--tmu-font-xs); font-weight:700; color:var(--tmu-text-faint); text-transform:uppercase; letter-spacing:1.5px; padding:var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-md); border-bottom:1px solid var(--tmu-border-soft-alpha); }

        /* match list */
        .mp-icup-days { padding:0 var(--tmu-space-lg); }

        /* loader row placeholder */
        .mp-icup-loader-row { display:flex; align-items:center; justify-content:center; padding:var(--tmu-space-md); opacity:0.35; font-size:var(--tmu-font-xs); color:var(--tmu-text-faint); min-height:42px; letter-spacing:4px; }

        /* current match highlight */
        .mp-icup-current { background:var(--tmu-success-fill-hover) !important; box-shadow:inset 3px 0 0 var(--tmu-success); }
        .mp-icup-current:hover { background:var(--tmu-success-fill-strong) !important; }

        /* status badge (left of row) */
        .mp-icup-status { flex-shrink:0; font-size:var(--tmu-font-xs); font-weight:700; color:var(--tmu-text-dim); min-width:44px; text-align:right; padding-right:var(--tmu-space-sm); white-space:nowrap; }
        .mp-icup-status.live { color:var(--tmu-success); }
        .mp-icup-status.ft   { color:var(--tmu-text-dim); }

        /* tooltip container */
        .mp-icup-tip { position:fixed; z-index:99999; background:var(--tmu-surface-card-soft); border-radius:var(--tmu-space-md); padding:0; min-width:320px; max-width:420px; max-height:70vh; overflow-y:auto; box-shadow:0 8px 32px var(--tmu-shadow-panel); pointer-events:auto; opacity:0; transition:opacity 0.12s; }
        .mp-icup-tip.in { opacity:1; }
        .mp-icup-standings-host { overflow-x:auto; }
        .mp-icup-day-header { font-size:var(--tmu-font-xs); font-weight:700; color:var(--tmu-text-faint); text-transform:uppercase; letter-spacing:1.5px; padding:var(--tmu-space-sm) var(--tmu-space-md); border-bottom:1px solid var(--tmu-border-soft-alpha); margin-top:var(--tmu-space-sm); }
    `;
    document.head.appendChild(s);
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const esc = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

/** Extract match IDs in section order from a section's li elements. */
const parseSectionItems = (section) => {
    const ids = [];
    section.nodes.forEach(node => {
        Array.from(node.querySelectorAll('li')).forEach(li => {
            const a = li.querySelector('.match_result a[href*="/matches/"]');
            if (!a) return;
            const m = (a.getAttribute('href') || '').match(/\/matches\/(\d+)\//);
            if (m) ids.push(m[1]);
        });
    });
    return ids;
};

/** Build tooltip content element from mData + minute cutoff. */
const buildTip = (mData, minCutoff) =>
    buildModalContentEl(snapshotFromMData(mData, minCutoff));

// ── Component ─────────────────────────────────────────────────────────────────

export const TmMatchIntCupNew = {
    create(match, initialReplayState) {
        injectStyles();

        const tournamentId = (match.competition?.url || '').match(/\/international-cup\/(\d+)\//)?.[1];
        const myHomeId  = String(match.home.club.id);
        const myAwayId  = String(match.away.club.id);
        const myMatchId = String(match.id || '') || window.location.pathname.match(/\/matches\/(\d+)/)?.[1] || '';
        // venue.kickoff is midnight of the match day; match_time_of_day holds the actual start time.
        // Parse "HH:MM" → seconds offset to add to the midnight timestamp.
        const parseTimeOfDay = (str) => { const [h, m] = (str || '').split(':').map(Number); return ((h || 0) * 3600 + (m || 0) * 60); };
        const myKickoff = match.kickoff ? match.kickoff + parseTimeOfDay(match.kickoffTime) : null;

        const el = document.createElement('div');
        el.className = 'mp-icup';

        if (!tournamentId) {
            el.innerHTML = TmUI.error('Cannot determine cup tournament');
            return { el, update: () => {} };
        }

        // ── State ──────────────────────────────────────────────────────────────
        let dataReady = false;
        let lastMin   = -1;
        let isGroup   = false;
        // rowMap keyed by matchId
        // { matchId, mData: null|object, mDataResolved: bool, rowEl, statusEl, scoreEl }
        const rowMap = {};
        let standingsHost = null;

        // ── Tooltip state ──────────────────────────────────────────────────────
        let _tip=null, _showT=null, _hideT=null;
        const destroyTip = () => { if (_tip) { _tip.remove(); _tip=null; } };
        const placeTip = (anchor) => {
            if (!_tip) return;
            const r = anchor.getBoundingClientRect();
            const w = _tip.offsetWidth || 380;
            let left = r.left + r.width/2 - w/2;
            let top  = r.bottom + 6;
            if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
            if (left < 8) left = 8;
            if (top + 300 > window.innerHeight) top = Math.max(8, r.top - 6 - (_tip.offsetHeight || 300));
            _tip.style.left = left+'px';
            _tip.style.top  = top+'px';
        };

        // ── Status computation — unified virtual time for all matches ──────────
        // virtualNow = kickoff of our match + replay minutes elapsed
        // All matches (including current) are evaluated against the same clock.
        const toVirtualNow = (minCutoff) =>
            !myKickoff ? null : myKickoff + (minCutoff < Infinity ? Math.floor(minCutoff) * 60 : 10 * 3600);

        const computeStatus = (mData, minCutoff) => {
            const rawKo = mData.match_data?.venue?.kickoff;
            const itemKickoff = rawKo ? rawKo + parseTimeOfDay(mData.match_data?.match_time_of_day) : null;
            const virtualNow  = toVirtualNow(minCutoff);

            if (!itemKickoff || !virtualNow) {
                const snap = snapshotFromMData(mData, Infinity);
                return { statusText: 'FT', statusCls: 'ft', homeGoals: snap.homeGoals, awayGoals: snap.awayGoals };
            }

            const elapsed = virtualNow - itemKickoff;
            if (elapsed < -60) {
                const time = mData.match_data?.match_time_of_day || '';
                return { statusText: time || '–', statusCls: '', homeGoals: null, awayGoals: null };
            }
            if (elapsed > 95 * 60) {
                const snap = snapshotFromMData(mData, Infinity);
                return { statusText: 'FT', statusCls: 'ft', homeGoals: snap.homeGoals, awayGoals: snap.awayGoals };
            }
            const min  = Math.max(1, Math.floor(elapsed / 60));
            const snap = snapshotFromMData(mData, min + 1);
            return { statusText: min + "'", statusCls: 'live', homeGoals: snap.homeGoals, awayGoals: snap.awayGoals };
        };

        // ── Render update (called every replay tick) ───────────────────────────
        const renderUpdate = (minCutoff) => {
            const badge = el.querySelector('.mp-icup-badge');
            if (badge) {
                if (minCutoff < Infinity) {
                    badge.innerHTML = TmUI.badge({ icon: '⏱', label: Math.floor(minCutoff)+"'", size: 'md', shape: 'full', weight: 'bold' }, 'live');
                    badge.classList.add('on');
                } else {
                    badge.classList.remove('on');
                }
            }

            for (const entry of Object.values(rowMap)) {
                if (!entry.mDataResolved || !entry.mData) continue;
                const st = computeStatus(entry.mData, minCutoff);
                if (entry.statusEl) {
                    entry.statusEl.textContent = st.statusText;
                    entry.statusEl.className = `mp-icup-status${st.statusCls ? ' '+st.statusCls : ''}`;
                }
                if (entry.scoreEl) {
                    entry.scoreEl.innerHTML = st.homeGoals != null
                        ? `<span>${st.homeGoals}</span>-<span>${st.awayGoals}</span>`
                        : '<span style="opacity:0.4">–</span>';
                }
            }

            if (isGroup && standingsHost) renderStandings(minCutoff);
        };

        // ── Group standings ────────────────────────────────────────────────────
        const applyResult = (table, homeId, awayId, hg, ag) => {
            const h = table[homeId], a = table[awayId];
            if (!h || !a) return;
            h.p++; a.p++; h.gf+=hg; h.ga+=ag; a.gf+=ag; a.ga+=hg;
            if (hg > ag) { h.w++; h.pts+=3; a.l++; }
            else if (hg < ag) { a.w++; a.pts+=3; h.l++; }
            else { h.d++; a.d++; h.pts++; a.pts++; }
        };

        const renderStandings = (minCutoff) => {
            const table = {};
            const ensure = (id, name) => { if (!table[id]) table[id] = { id, name, p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 }; };

            for (const entry of Object.values(rowMap)) {
                if (!entry.mDataResolved || !entry.mData) continue;
                const mData  = entry.mData;
                const homeId = String(mData.teams.home.id);
                const awayId = String(mData.teams.away.id);
                ensure(homeId, mData.home.club.name);
                ensure(awayId, mData.away.club.name);

                const st = computeStatus(mData, minCutoff);
                if (st.homeGoals != null) applyResult(table, homeId, awayId, st.homeGoals, st.awayGoals);
            }

            const sorted = Object.values(table)
                .map(r => ({ ...r, gd: r.gf - r.ga }))
                .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

            standingsHost.innerHTML = TmStandingsTable.buildHtml({
                rows: sorted.map((r, i) => ({
                    rank: i + 1, clubId: r.id, clubName: r.name,
                    gp: r.p, w: r.w, d: r.d, l: r.l, gf: r.gf, ga: r.ga, pts: r.pts,
                    isMe: r.id === myHomeId || r.id === myAwayId, zone: '', rankDelta: 0,
                })),
            });
        };

        // ── Wire click + tooltip for an inflated row ───────────────────────────
        const wireRow = (entry, row) => {
            const { matchId, mData } = entry;
            const homeId  = String(mData.teams.home.id);
            const awayId  = String(mData.teams.away.id);
            const isCur   = (homeId === myHomeId && awayId === myAwayId) ||
                            (homeId === myAwayId && awayId === myHomeId);
            const flipped = homeId === myAwayId;

            row.style.cursor = 'pointer';
            row.addEventListener('click', (e) => {
                if (e.target.closest('a')) return;
                window.location.href = `/match/${matchId}/`;
            });

            row.addEventListener('mouseenter', () => {
                clearTimeout(_hideT);
                clearTimeout(_showT);
                destroyTip();
                _showT = setTimeout(() => {
                    _tip = document.createElement('div');
                    _tip.className = 'mp-icup-tip';
                    document.body.appendChild(_tip);
                    placeTip(row);
                    _tip.addEventListener('mouseenter', () => clearTimeout(_hideT));
                    _tip.addEventListener('mouseleave', () => { _hideT = setTimeout(destroyTip, 200); });

                    const tipMin = (() => {
                        const vn  = toVirtualNow(lastMin < 0 ? Infinity : lastMin);
                        const rawIko = mData.match_data?.venue?.kickoff;
                        const iko = rawIko ? rawIko + parseTimeOfDay(mData.match_data?.match_time_of_day) : null;
                        if (!vn || !iko) return Infinity;
                        const el  = vn - iko;
                        if (el > 95 * 60) return Infinity;
                        if (el < 0) return 0;
                        return Math.max(1, Math.floor(el / 60)) + 1;
                    })();
                    _tip.innerHTML = '';
                    _tip.appendChild(buildTip(mData, tipMin));
                    requestAnimationFrame(() => { placeTip(row); _tip?.classList.add('in'); });
                }, 200);
            });
            row.addEventListener('mouseleave', () => {
                clearTimeout(_showT);
                _hideT = setTimeout(destroyTip, 200);
            });
        };

        // ── Build DOM — fetch all, group by kickoff date into Match Days ────────
        const buildDOM = (matchIds, title, groupStage, initialMin) => {
            isGroup = groupStage;
            el.innerHTML = TmUI.loading('Loading matches…');

            Promise.all(matchIds.map(id =>
                TmMatchModel.fetchMatch(id, { dbSync: false })
                    .then(mData => { if (mData) rowMap[id] = { matchId: id, mData, mDataResolved: true, rowEl: null, statusEl: null, scoreEl: null }; })
                    .catch(() => {})
            )).then(() => {
                // Group entries by kickoff date → Match Days
                const byDate = {};
                matchIds.forEach(id => {
                    const entry = rowMap[id];
                    if (!entry) return;
                    const ko   = entry.mData.match_data?.venue?.kickoff;
                    const date = ko ? new Date(ko * 1000).toISOString().slice(0, 10) : 'z_unknown';
                    (byDate[date] = byDate[date] || []).push(entry);
                });
                const matchDays = Object.keys(byDate).sort().map((date, i) => ({
                    label:   `Match Day ${i + 1}`,
                    entries: byDate[date].sort((a, b) =>
                        (a.mData.match_data?.venue?.kickoff || 0) - (b.mData.match_data?.venue?.kickoff || 0)
                    ),
                }));

                const rowsHtml = (entries) => entries.map(({ matchId, mData }) => {
                    const homeId = String(mData.teams.home.id);
                    const awayId = String(mData.teams.away.id);
                    const isCur  = (homeId === myHomeId && awayId === myAwayId) || (homeId === myAwayId && awayId === myHomeId);
                    return TmFixtureMatchRow.render(
                        { homeId, awayId, homeName: mData.home.club.name, awayName: mData.away.club.name, matchId, scoreText: '' },
                        { extraClass: isCur ? ' mp-icup-current' : '' }
                    );
                }).join('');

                const daysHtml = matchDays.map(md =>
                    `<div class="mp-icup-day-header">${esc(md.label)}</div>${rowsHtml(md.entries)}`
                ).join('');

                let html = `<div class="mp-icup-wrap">
                    <div class="mp-icup-header">
                        <span class="mp-icup-title">${esc(title)}</span>
                        <span class="mp-icup-badge"></span>
                    </div>`;

                if (isGroup) {
                    html += `<div class="mp-icup-cols">
                        <div class="mp-icup-col-matches">
                            <div class="mp-icup-col-title">Matches</div>
                            ${daysHtml}
                        </div>
                        <div class="mp-icup-col-standings">
                            <div class="mp-icup-col-title">Group Table</div>
                            <div class="mp-icup-standings-host"></div>
                        </div>
                    </div>`;
                } else {
                    html += `<div class="mp-icup-days">${daysHtml}</div>`;
                }
                html += '</div>';
                el.innerHTML = html;

                standingsHost = el.querySelector('.mp-icup-standings-host');

                // Wire status badges and tooltips onto each rendered row
                for (const entry of Object.values(rowMap)) {
                    const row = el.querySelector(`.tmvu-fixture-row[data-mid="${entry.matchId}"]`);
                    if (!row) continue;
                    const badge = document.createElement('span');
                    badge.className = 'mp-icup-status';
                    row.prepend(badge);
                    entry.rowEl    = row;
                    entry.statusEl = badge;
                    entry.scoreEl  = row.querySelector('.tmvu-fixture-score');
                    wireRow(entry, row);
                }

                dataReady = true;
                renderUpdate(initialMin);
            });
        };

        // ── Parse overview document and find our section ───────────────────────
        const buildView = (doc, initialMin) => {
            const sections = parseSections(doc);
            if (!sections.length) { el.innerHTML = TmUI.error('No cup data found'); return; }

            let matchSection = null;
            let passedGroup  = false;
            let groupStage   = false;

            for (const sec of sections) {
                const stage = classifyStage(sec.title, passedGroup);
                if (stage === 'group') passedGroup = true;

                outer: for (const node of sec.nodes) {
                    for (const li of Array.from(node.querySelectorAll('li'))) {
                        const a = li.querySelector('.match_result a[href*="/matches/"]');
                        if (!a) continue;
                        const m = (a.getAttribute('href') || '').match(/\/matches\/(\d+)\//);
                        if (m && m[1] === myMatchId) {
                            matchSection = sec;
                            groupStage   = (stage === 'group');
                            break outer;
                        }
                    }
                }
                if (matchSection) break;
            }

            if (!matchSection) {
                matchSection = sections[sections.length - 1];
                groupStage   = classifyStage(matchSection.title, passedGroup) === 'group';
            }

            buildDOM(parseSectionItems(matchSection), matchSection.title, groupStage, initialMin);
        };

        // ── Bootstrap ──────────────────────────────────────────────────────────
        const initialMin = initialReplayState?.currentMinute != null ? initialReplayState.currentMinute : Infinity;
        el.innerHTML = TmUI.loading('Loading cup data…');

        TmInternationalCupModel.fetchOverviewDocument(tournamentId)
            .then(doc => {
                if (!doc) { el.innerHTML = TmUI.error('Failed to load cup data'); return; }
                buildView(doc, initialMin);
            })
            .catch(() => { el.innerHTML = TmUI.error('Failed to load cup data'); });

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
