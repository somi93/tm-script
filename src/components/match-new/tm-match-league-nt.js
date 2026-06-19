/**
 * tm-match-league-nt.js — "League" tab for national team matches.
 *
 * Fetches NT fixtures for one team's country, finds the current match,
 * groups all matches that share the same matchtype_name, then:
 *   - Group stage  → standings + current-matchday fixtures
 *   - Knockout     → current-round fixtures only
 */

import { TmNationalTeamsModel } from '../../models/national-teams.js';
import { TmStandingsTable }     from '../shared/tm-standings-table.js';
import { TmFixtureMatchRow }    from '../shared/tm-fixture-match-row.js';
import { CountryFlag }          from '../shared/country-flag.js';
import { TmUI }                 from '../shared/tm-ui.js';
import { injectLeagueMatchStyles } from './tm-match-league.js';

'use strict';

const STYLE_ID = 'mp-nt-league-style';

const injectStyles = () => {
    injectLeagueMatchStyles();
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        .mp-ntl-tab  { width:100%; padding:16px 0; box-sizing:border-box; }
        .mp-ntl-wrap { max-width:100%; margin:0 auto; padding:0 0 var(--tmu-space-xl); }
        .mp-ntl-header {
            display:flex; align-items:center; justify-content:center; gap:14px;
            padding:var(--tmu-space-md) var(--tmu-space-xl);
            background:linear-gradient(180deg,var(--tmu-surface-accent-soft) 0%,transparent 100%);
            border-bottom:1px solid var(--tmu-border-soft-alpha);
            margin-bottom:var(--tmu-space-xs);
        }
        .mp-ntl-title {
            font-size:var(--tmu-font-sm); font-weight:700; color:var(--tmu-text-main);
            text-transform:uppercase; letter-spacing:1.5px; text-align:center;
        }
        .mp-ntl-columns { display:flex; gap:var(--tmu-space-xxl); padding:0 var(--tmu-space-lg); }
        .mp-ntl-col-matches  { flex:1; min-width:0; }
        .mp-ntl-col-standings { flex:1.15; min-width:0; overflow-x:auto; }
        .mp-ntl-col-title {
            font-size:var(--tmu-font-xs); font-weight:700; color:var(--tmu-text-faint);
            text-transform:uppercase; letter-spacing:1.5px;
            padding:var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-md);
            border-bottom:1px solid var(--tmu-border-soft-alpha);
        }
        .tmvu-fixture-row.mp-ntl-current {
            background:var(--tmu-success-fill-hover) !important;
            box-shadow:inset 3px 0 0 var(--tmu-success);
        }
        .tmvu-fixture-row.mp-ntl-current:hover { background:var(--tmu-success-fill-strong) !important; }
        .mp-ntl-knockout { padding:0 var(--tmu-space-lg); }
        .mp-ntl-ko-date-header {
            font-size:var(--tmu-font-xs); font-weight:700; color:var(--tmu-text-faint);
            text-transform:uppercase; letter-spacing:1px;
            padding:var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-xs);
            border-bottom:1px solid var(--tmu-border-soft-alpha);
            margin-top:var(--tmu-space-md);
        }
        .mp-ntl-ko-date-header:first-child { margin-top:0; }
    `;
    document.head.appendChild(s);
};

// ── helpers ───────────────────────────────────────────────────────────────────

const escapeHtml = v => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const cleanText = v => String(v || '').replace(/\s+/g,' ').trim();

const parseScore = result => {
    const m = String(result).match(/(\d+)\s*-\s*(\d+)/);
    return m ? [Number(m[1]), Number(m[2])] : null;
};

const isPlayed = result => !!parseScore(result);

const formatDate = dateStr => {
    const d = new Date(dateStr + 'T12:00:00');
    return isNaN(d) ? dateStr : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

const extractHref = html => {
    const w = document.createElement('div'); w.innerHTML = String(html || '');
    return w.querySelector('a[href]')?.getAttribute('href') || '';
};

const normalizeFlag = html => {
    const w = document.createElement('div'); w.innerHTML = String(html || '').trim();
    return w.firstElementChild?.innerHTML || w.innerHTML || '';
};

// Parse the raw NT fixture payload into a flat match array.
const parseNtFixtures = payload => {
    const all = [];
    Object.values(payload || {}).forEach(month => {
        (month?.matches || []).forEach(m => {
            const matchId = String(m?.id || '');
            const homeName = cleanText(m?.hometeamname || '');
            const awayName = cleanText(m?.awayteamname || '');
            if (!matchId || !homeName || !awayName) return;
            all.push({
                matchId,
                date: cleanText(m?.date || ''),
                homeId: cleanText(m?.hometeam || ''),
                homeName,
                homeFlagHtml: normalizeFlag(m?.home_flag),
                homeHref: extractHref(m?.home_link),
                awayId: cleanText(m?.awayteam || ''),
                awayName,
                awayFlagHtml: normalizeFlag(m?.away_flag),
                awayHref: extractHref(m?.away_link),
                matchHref: extractHref(m?.match_link) || `/matches/nt/${matchId}/`,
                result: cleanText(m?.result || ''),
                matchtype_name: cleanText(m?.matchtype_name || m?.matchtype_sort || ''),
            });
        });
    });
    return all;
};

const blankRow  = name => ({ p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0, name });
const applyResult = (team, gf, ga) => {
    team.p++; team.gf += gf; team.ga += ga;
    if (gf > ga) { team.w++; team.pts += 3; }
    else if (gf < ga) { team.l++; }
    else { team.d++; team.pts++; }
};

// Build a standings map from completed matches.
const buildStandings = (matches) => {
    const s = {};
    const ensure = (id, name) => { if (!s[id]) s[id] = blankRow(name || id); };
    matches.forEach(m => {
        const scored = parseScore(m.result);
        if (!scored) return;
        const [hg, ag] = scored;
        ensure(m.homeId, m.homeName); ensure(m.awayId, m.awayName);
        applyResult(s[m.homeId], hg, ag);
        applyResult(s[m.awayId], ag, hg);
    });
    return s;
};

// ── Main component ────────────────────────────────────────────────────────────

export const TmMatchLeagueNt = {
    create(match, rawMatchId) {
        injectStyles();

        const el = document.createElement('div');
        el.className = 'mp-ntl-tab';

        const homeCountry = match.home.club.country;

        // rawMatchId is the URL-based ID (e.g. 'nt55669' or '55669').
        // Strip 'nt' prefix to get the numeric ID used in the fixtures response.
        const rawId = String(rawMatchId ?? match.id ?? '');
        const numericOurId = rawId.startsWith('nt') ? rawId.slice(2) : rawId;

        if (!homeCountry) {
            el.innerHTML = TmUI.error('Cannot determine national team country');
            return { el, update: () => {} };
        }

        el.innerHTML = TmUI.loading('Loading competition data…');

        TmNationalTeamsModel.fetchFixtures(homeCountry)
            .then(payload => {
                const allMatches = parseNtFixtures(payload);

                // Find the current match.
                const currentMatch = allMatches.find(m => m.matchId === numericOurId);
                if (!currentMatch) {
                    el.innerHTML = TmUI.error(`Match not found (country=${homeCountry}, id=${numericOurId})`);
                    return;
                }

                const competitionName = currentMatch.matchtype_name;
                const matchDate       = currentMatch.date;
                const compMatches     = allMatches.filter(m => m.matchtype_name === competitionName);

                const teamMatchCount = {};
                compMatches.forEach(m => {
                    teamMatchCount[m.homeId] = (teamMatchCount[m.homeId] || 0) + 1;
                    teamMatchCount[m.awayId] = (teamMatchCount[m.awayId] || 0) + 1;
                });
                const isGroup = Object.values(teamMatchCount).some(c => c > 1);

                console.log('[NT-League] currentMatch:', JSON.stringify(currentMatch));
                console.log('[NT-League] competitionName:', JSON.stringify(competitionName), '| matchDate:', matchDate, '| compMatches:', compMatches.length, '| isGroup:', isGroup);
                console.log('[NT-League] teamMatchCount:', JSON.stringify(teamMatchCount));
                console.log('[NT-League] all compMatches:', JSON.stringify(compMatches.map(m => ({ id: m.matchId, date: m.date, home: m.homeId, away: m.awayId, result: m.result }))));

                try {
                    if (isGroup) {
                        renderGroupStage(el, match, competitionName, matchDate, compMatches, numericOurId);
                    } else {
                        renderKnockout(el, match, competitionName, matchDate, compMatches, numericOurId);
                    }
                } catch (err) {
                    console.error('[NT-League] render error:', err);
                    el.innerHTML = TmUI.error(`Render error: ${err.message}`);
                }
            })
            .catch(err => { console.error('[NT-League] fetch error:', err); el.innerHTML = TmUI.error('Failed to load national team fixtures'); });

        return { el, update: () => {} };
    },
};

// ── Group stage view ──────────────────────────────────────────────────────────

function renderGroupStage(el, match, competitionName, matchDate, compMatches, numericOurId) {
    const homeCountry = match.home.club.country;
    const awayCountry = match.away.club.country;

    // Current-matchday matches (same date).
    const matchdayMatches = compMatches.filter(m => m.date === matchDate);

    // All completed matches before or on the same date except the current match
    // (for pre-round standings: exclude current matchday entirely so standings reflect state before this round).
    const completedBefore = compMatches.filter(m => m.date < matchDate && isPlayed(m.result));

    // Live: apply current match score from the match model (it won't be in the NT fixtures yet).
    // We only update the current match row to show the live score (simplified — no live update tick).
    const liveScore = {
        homeGoals: 0,
        awayGoals: 0,
    };

    const preStandings = buildStandings(completedBefore);

    // Ensure all teams that appear in the matchday are in standings.
    compMatches.forEach(m => {
        if (!preStandings[m.homeId]) preStandings[m.homeId] = blankRow(m.homeName);
        if (!preStandings[m.awayId]) preStandings[m.awayId] = blankRow(m.awayName);
    });

    // Include completed matchday results (other than the current match, which we handle live).
    const matchdayCompleted = matchdayMatches.filter(m => m.matchId !== numericOurId && isPlayed(m.result));

    const displayStandings = {};
    for (const [id, row] of Object.entries(preStandings)) displayStandings[id] = { ...row };
    matchdayCompleted.forEach(m => {
        const [hg, ag] = parseScore(m.result);
        applyResult(displayStandings[m.homeId], hg, ag);
        applyResult(displayStandings[m.awayId], ag, hg);
    });

    // Current match: apply live or final score.
    const currentResult = parseScore(match.competition?.result || '');
    if (currentResult) {
        const [hg, ag] = currentResult;
        applyResult(displayStandings[homeCountry], hg, ag);
        applyResult(displayStandings[awayCountry], ag, hg);
    }

    const sortedRows = Object.entries(displayStandings)
        .map(([id, row]) => ({ id, ...row, gd: row.gf - row.ga }))
        .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

    const standingsHtml = TmStandingsTable.buildHtml({
        nameLabel: 'Country',
        rows: sortedRows.map((row, i) => ({
            rank: i + 1,
            nameHtml: buildCountryNameCell(row.id, row.name),
            clubId: '',
            clubName: row.name,
            gp: row.p,
            w: row.w,
            d: row.d,
            l: row.l,
            gf: row.gf,
            ga: row.ga,
            pts: row.pts,
            isMe: row.id === homeCountry || row.id === awayCountry,
        })),
    });

    let html = '<div class="mp-ntl-wrap">';
    html += '<div class="mp-ntl-header">';
    html += `<span class="mp-ntl-title">${escapeHtml(competitionName)}</span>`;
    html += '</div>';
    html += '<div class="mp-ntl-columns">';

    // Matches column.
    html += '<div class="mp-ntl-col-matches">';
    html += `<div class="mp-ntl-col-title">${escapeHtml(formatDate(matchDate))}</div>`;
    matchdayMatches.forEach((m, idx) => {
        const isCurrent = m.matchId === numericOurId;
        html += TmFixtureMatchRow.render(m, {
            index: idx,
            extraClass: isCurrent ? ' mp-ntl-current' : '',
        });
    });
    html += '</div>';

    // Standings column.
    html += '<div class="mp-ntl-col-standings">';
    html += '<div class="mp-ntl-col-title">Group Standings</div>';
    html += standingsHtml;
    html += '</div>';

    html += '</div></div>';
    el.innerHTML = html;
}

// ── Knockout view ─────────────────────────────────────────────────────────────

function renderKnockout(el, match, competitionName, matchDate, compMatches, numericOurId) {
    const homeCountry = match.home.club.country;
    const awayCountry = match.away.club.country;

    // Group by date.
    const byDate = {};
    compMatches.forEach(m => { (byDate[m.date] = byDate[m.date] || []).push(m); });
    const sortedDates = Object.keys(byDate).sort();

    let html = '<div class="mp-ntl-wrap">';
    html += '<div class="mp-ntl-header">';
    html += `<span class="mp-ntl-title">${escapeHtml(competitionName)}</span>`;
    html += '</div>';
    html += '<div class="mp-ntl-knockout">';

    sortedDates.forEach(date => {
        const matches = byDate[date];
        html += `<div class="mp-ntl-ko-date-header">${escapeHtml(formatDate(date))}</div>`;
        matches.forEach((m, idx) => {
            const isCurrent = m.matchId === numericOurId;
            html += TmFixtureMatchRow.render(m, {
                index: idx,
                myClubId: homeCountry || awayCountry,
                extraClass: isCurrent ? ' mp-ntl-current' : '',
            });
        });
    });

    html += '</div></div>';
    el.innerHTML = html;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildCountryNameCell(countryCode, name) {
    const flagHtml = countryCode ? CountryFlag.render(countryCode) : '';
    const href = countryCode ? `/national-teams/${countryCode}/` : '';
    const nameHtml = href
        ? `<a href="${href}">${escapeHtml(name)}</a>`
        : escapeHtml(name);
    return `<span class="std-club-cell">${flagHtml}${nameHtml}</span>`;
}
