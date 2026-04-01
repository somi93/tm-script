import { TmStandingsTable } from '../shared/tm-standings-table.js';
import { TmLeagueFixtures } from './tm-league-fixtures.js';
import { TmButton } from '../shared/tm-button.js';
import { TmUI } from '../shared/tm-ui.js';

/**
 * TmLeagueStandings
 *
 * Handles standings: building from live DOM, parsing/fetching history, and rendering.
 * Reads and writes shared state via window.TmLeagueCtx.
 */

if (!document.getElementById('tsa-league-standings-style')) {
    const _s = document.createElement('style');
    _s.id = 'tsa-league-standings-style';
    _s.textContent = `
            .std-hover-opp td { background: var(--tmu-success-fill-strong) !important; outline: 1px solid var(--tmu-success); }
            .std-hover-opp td:first-child { border-left: 3px solid var(--tmu-success) !important; }
            #std-form-tooltip {
                position: fixed; z-index: 9999; pointer-events: none;
                background: var(--tmu-surface-card-soft); border: 1px solid var(--tmu-border-embedded);
                border-radius: 5px; padding: 6px 10px;
                font-size: 12px; color: var(--tmu-text-strong);
                box-shadow: 0 3px 10px var(--tmu-shadow-panel);
                white-space: nowrap; display: none;
            }
            #std-form-tooltip .sft-score { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
            #std-form-tooltip .sft-opp   { color: var(--tmu-text-panel-label); font-size: 11px; }
            .tsa-standings-wrap { overflow: hidden; }
            .tsa-standings-page-ctrl {
                display: flex; align-items: center; justify-content: flex-end;
                gap: 6px; padding: 5px 10px 0;
            }
            .tsa-standings-page-ctrl span { font-size: 11px; color: var(--tmu-text-panel-label); }
            .std-promo    { }
            .std-promo-po { }
            .std-rel-po   { }
            .std-rel      { }
            .form-badge {
                display: inline-flex; align-items: center; justify-content: center;
                width: 16px; height: 16px; border-radius: 3px;
                font-size: 10px; font-weight: 700; cursor: pointer;
                transition: opacity 0.15s; text-decoration: none;
                flex: 0 0 auto;
            }
            .form-badge:hover { opacity: 0.75; }
            .std-form-row {
                display: inline-flex;
                align-items: center;
                gap: 2px;
                flex-wrap: nowrap;
                white-space: nowrap;
            }
            .form-w { background: var(--tmu-success-fill-strong); color: var(--tmu-text-inverse); }
            .form-d { background: var(--tmu-warning-fill); color: var(--tmu-text-inverse); }
            .form-l { background: var(--tmu-danger-fill); color: var(--tmu-text-inverse); }
            .form-u { background: var(--tmu-info-fill); color: var(--tmu-text-inverse); }
            .tsa-std-controls {
                display: flex; align-items: center; justify-content: space-between;
                padding: 5px 10px; background: var(--tmu-surface-overlay);
                border-bottom: 1px solid var(--tmu-border-soft-alpha-strong); flex-wrap: wrap; gap: 6px;
            }
            .tsa-std-ctrl-group { display: flex; align-items: center; gap: 3px; }
            .tsa-std-ctrl-label {
                font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em;
                color: var(--tmu-text-faint); margin-right: 4px; user-select: none;
            }
            .tsa-std-controls [data-std-venue], .tsa-std-controls [data-std-n] { line-height: 1.2; }
            .tsa-std-ctrl-active {
                background: var(--tmu-success-fill-soft) !important; color: var(--tmu-text-main) !important;
                border-color: var(--tmu-border-success) !important; font-weight: 600;
            }
        `;
    document.head.appendChild(_s);
}

const buttonHtml = ({ attrs = {}, cls = '', active = false, ...opts } = {}) => {
    const btn = TmButton.button({
        color: 'secondary',
        size: 'xs',
        cls: `${cls}${active ? ' tsa-std-ctrl-active' : ''}`,
        attrs,
        ...opts,
    });
    return btn.outerHTML;
};

const positionStandingsTooltip = (tooltip, event) => {
    tooltip.style.left = (event.clientX + 14) + 'px';
    tooltip.style.top = (event.clientY - 10) + 'px';
};

const clearHoveredOpponentRows = (container) => {
    container.querySelectorAll('tr[data-club].std-hover-opp').forEach(tr => tr.classList.remove('std-hover-opp'));
};

const buildStandingsFromDOM = () => {
    const s = window.TmLeagueCtx;
    s.standingsRows = [];
    const myClubId = (() => {
        const hi = document.querySelector('#overall_table tr.highlighted_row_done td a[club_link]');
        return hi ? hi.getAttribute('club_link') : null;
    })();

    const formMap = {};
    const playedCountMap = {};
    if (s.fixturesCache) {
        const played = [], upcoming = [];
        Object.values(s.fixturesCache).forEach(month => {
            if (month?.matches) month.matches.forEach(m => {
                if (m.result) played.push(m); else upcoming.push(m);
            });
        });
        played.sort((a, b) => new Date(a.date) - new Date(b.date));
        played.forEach(m => {
            const res = m.result;
            if (!res) return;
            const parts = res.split('-').map(Number);
            if (parts.length !== 2) return;
            const [hg, ag] = parts;
            const hid = String(m.hometeam), aid = String(m.awayteam);
            if (!formMap[hid]) { formMap[hid] = []; playedCountMap[hid] = 0; }
            if (!formMap[aid]) { formMap[aid] = []; playedCountMap[aid] = 0; }
            formMap[hid].push({ r: hg > ag ? 'W' : hg < ag ? 'L' : 'D', id: m.id, oppId: aid, score: `${hg}–${ag}`, home: true });
            formMap[aid].push({ r: ag > hg ? 'W' : ag < hg ? 'L' : 'D', id: m.id, oppId: hid, score: `${ag}–${hg}`, home: false });
            playedCountMap[hid]++;
            playedCountMap[aid]++;
        });
        upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
        upcoming.forEach(m => {
            const hid = String(m.hometeam), aid = String(m.awayteam);
            if (!formMap[hid]) { formMap[hid] = []; playedCountMap[hid] = 0; }
            if (!formMap[aid]) { formMap[aid] = []; playedCountMap[aid] = 0; }
            formMap[hid].push({ r: '?', id: m.id, oppId: aid, score: '', home: true });
            formMap[aid].push({ r: '?', id: m.id, oppId: hid, score: '', home: false });
        });
    }

    $('#overall_table tbody tr').each(function () {
        const $tr = $(this);
        const cls = ($tr.attr('class') || '').trim();
        const $a = $tr.find('td a[club_link]').first();
        if (!$a.length) return;
        const clubId = $a.attr('club_link');
        const clubName = $a.text().trim();
        const tds = $tr.find('td');
        const rank = parseInt($(tds[0]).text().trim()) || 0;
        const gp = parseInt($(tds[2]).text().trim()) || 0;
        const w = parseInt($(tds[3]).text().trim()) || 0;
        const d = parseInt($(tds[4]).text().trim()) || 0;
        const l = parseInt($(tds[5]).text().trim()) || 0;
        const gf = parseInt($(tds[6]).text().trim()) || 0;
        const ga = parseInt($(tds[7]).text().trim()) || 0;
        const pts = parseInt($(tds[8]).text().trim()) || 0;
        const isMe = cls.includes('highlighted_row_done') || clubId === myClubId;
        let zone = '';
        if (cls.includes('promotion_playoff')) zone = 'promo-po';
        else if (cls.includes('promotion')) zone = 'promo';
        else if (cls.includes('relegation_playoff')) zone = 'rel-po';
        else if (cls.includes('relegation')) zone = 'rel';
        s.standingsRows.push({ rank, clubId, clubName, gp, w, d, l, gf, ga, pts, zone, isMe, form: formMap[clubId] || [], playedCount: playedCountMap[clubId] || 0 });
        if (rank && zone) s.liveZoneMap[rank] = zone;
    });
};

const parseHistoryStandings = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const table = doc.querySelector('table.border_bottom');
    if (!table) return [];
    const myClubId = (typeof SESSION !== 'undefined' && SESSION.main_id) ? String(SESSION.main_id) : null;
    const rows = [];
    table.querySelectorAll('tr').forEach(tr => {
        const tds = Array.from(tr.querySelectorAll('td'));
        let a = null;
        for (const td of tds) {
            a = td.querySelector('a[club_link]');
            if (a) break;
        }
        if (!a) return;
        const cls = tr.className || '';
        const rank = parseInt(tds[0]?.textContent.trim()) || 0;
        const clubId = a.getAttribute('club_link');
        const clubName = a.textContent.trim();
        const gp = parseInt(tds[2]?.textContent.trim()) || 0;
        const w = parseInt(tds[3]?.textContent.trim()) || 0;
        const d = parseInt(tds[4]?.textContent.trim()) || 0;
        const l = parseInt(tds[5]?.textContent.trim()) || 0;
        const goalParts = (tds[6]?.textContent.trim() || '0-0').split('-');
        const gf = parseInt(goalParts[0]) || 0;
        const ga = parseInt(goalParts[1]) || 0;
        const pts = parseInt(tds[7]?.textContent.trim()) || 0;
        let zone = '';
        if (cls.includes('promotion_playoff')) zone = 'promo-po';
        else if (cls.includes('promotion')) zone = 'promo';
        else if (cls.includes('relegation_playoff')) zone = 'rel-po';
        else if (cls.includes('relegation')) zone = 'rel';
        const isMe = cls.includes('highlighted_row_done') || (myClubId && clubId === myClubId);
        rows.push({ rank, clubId, clubName, gp, w, d, l, gf, ga, pts, zone, isMe: !!isMe, form: [], playedCount: 0 });
    });
    return rows;
};

const fetchHistoryStandings = (season) => {
    const s = window.TmLeagueCtx;
    const container = document.getElementById('tsa-standings-content');
    if (!container) return;
    container.innerHTML = TmUI.loading(`Loading Season ${season}…`);
    window.fetch(`/history/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/standings/${season}/`)
        .then(r => r.text())
        .then(html => {
            const rows = parseHistoryStandings(html);
            if (!rows.length) {
                container.innerHTML = TmUI.empty(`No standings data for Season ${season}`);
                return;
            }
            rows.forEach(r => { if (!r.zone && s.liveZoneMap[r.rank]) r.zone = s.liveZoneMap[r.rank]; });
            s.displayedSeason = season;
            s.standingsRows = rows;
            s.formOffset = 0;
            TmLeagueStandings.renderLeagueTable();
        })
        .catch(() => {
            container.innerHTML = TmUI.error(`Failed to load Season ${season}`);
        });
};

const renderLeagueTable = () => {
    const s = window.TmLeagueCtx;
    const container = document.getElementById('tsa-standings-content');
    if (!container || !s.standingsRows.length) return;

    const liveSeasonVal = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;
    const isHistory = s.displayedSeason !== null && s.displayedSeason !== liveSeasonVal;
    const historyBanner = isHistory
        ? `<div class="tsa-history-banner">📅 Season ${s.displayedSeason} ${buttonHtml({ id: 'tsa-history-live-btn', label: '↩ Back to live' })}</div>`
        : '';

    const isFiltered = !isHistory && (s.stdVenue !== 'total' || s.stdFormN > 0);
    const rows = isFiltered ? (() => {
        const mapped = s.standingsRows.map(r => {
            const played = r.form.filter(f => f.r !== '?');
            const veued = s.stdVenue === 'home' ? played.filter(f => f.home)
                : s.stdVenue === 'away' ? played.filter(f => !f.home)
                    : played;
            const sliced = s.stdFormN > 0 ? veued.slice(-s.stdFormN) : veued;
            let w = 0, d = 0, l = 0, gf = 0, ga = 0;
            sliced.forEach(f => {
                if (f.r === 'W') w++;
                else if (f.r === 'D') d++;
                else if (f.r === 'L') l++;
                if (f.score) {
                    const p = f.score.split(/[\u2013\-]/);
                    if (p.length === 2) { gf += parseInt(p[0], 10) || 0; ga += parseInt(p[1], 10) || 0; }
                }
            });
            return { ...r, gp: sliced.length, w, d, l, gf, ga, pts: w * 3 + d };
        });
        mapped.sort((a, b) => (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf));
        mapped.forEach((r, i) => { r.rank = i + 1; });
        return mapped;
    })() : s.standingsRows;

    const venueBtns = ['total', 'home', 'away'].map(v =>
        buttonHtml({
            label: v.charAt(0).toUpperCase() + v.slice(1),
            active: s.stdVenue === v,
            attrs: { 'data-std-venue': v },
        })
    ).join('');
    const nBtns = [0, 5, 10, 15, 20, 25, 30].map(n =>
        buttonHtml({
            label: n === 0 ? 'All' : String(n),
            active: s.stdFormN === n,
            attrs: { 'data-std-n': String(n) },
        })
    ).join('');
    const controlsHtml = isHistory ? '' : `
            <div class="tsa-std-controls">
                <div class="tsa-std-ctrl-group"><span class="tsa-std-ctrl-label">View</span>${venueBtns}</div>
                <div class="tsa-std-ctrl-group"><span class="tsa-std-ctrl-label">Form</span>${nBtns}</div>
            </div>`;

    const maxPlayedLen = Math.max(0, ...rows.map(r => r.playedCount));
    const maxUpcomingLen = Math.max(0, ...rows.map(r => r.form.length - r.playedCount));
    const canOlder = maxPlayedLen + 1 - s.formOffset > 6;
    const canNewer = s.formOffset > 1 - maxUpcomingLen;

    const formHtml = (form, playedCount) => {
        let slice;
        if (s.stdVenue !== 'total') {
            const isHome = s.stdVenue === 'home';
            const filtered = form.filter(f => f.r !== '?' && (isHome ? f.home : !f.home));
            slice = filtered.slice(-6);
        } else {
            const windowEnd = Math.min(form.length, Math.max(0, playedCount + 1 - s.formOffset));
            const windowStart = Math.max(0, windowEnd - 6);
            slice = form.slice(windowStart, windowEnd);
        }
        if (!slice.length) return '<span style="color:var(--tmu-text-dim);font-size:10px;">—</span>';
        const badges = slice.map(f => {
            const cls = f.r === 'W' ? 'form-w' : f.r === 'D' ? 'form-d' : f.r === 'L' ? 'form-l' : 'form-u';
            const oppName = (s.standingsRows.find(sr => sr.clubId === f.oppId) || {}).clubName || f.oppId;
            return `<a class="form-badge ${cls}" href="/matches/${f.id}/" target="_blank"
                    data-opp="${f.oppId}" data-score="${f.score || ''}" data-opp-name="${oppName}"
                    data-venue="${f.home ? 'H' : 'A'}">${f.r}</a>`;
        }).join('');
        return `<span class="std-form-row">${badges}</span>`;
    };

    const tableHtml = TmStandingsTable.buildHtml({
        rows,
        liveZoneMap: s.liveZoneMap,
        isFiltered,
        showForm: !isHistory,
        formHtml,
        canOlder,
        canNewer,
    });

    container.innerHTML = `${historyBanner}${controlsHtml}${tableHtml}`;

    let tooltip = document.getElementById('std-form-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'std-form-tooltip';
        document.body.appendChild(tooltip);
    }

    container.onclick = (event) => {
        const venueButton = event.target.closest('[data-std-venue]');
        if (venueButton && container.contains(venueButton)) {
            s.stdVenue = venueButton.dataset.stdVenue;
            renderLeagueTable();
            return;
        }

        const formButton = event.target.closest('[data-std-n]');
        if (formButton && container.contains(formButton)) {
            s.stdFormN = parseInt(formButton.dataset.stdN, 10);
            renderLeagueTable();
            return;
        }

        if (event.target.closest('#tsa-history-live-btn')) {
            s.displayedSeason = null;
            s.historyFixturesData = null;
            const chip = document.getElementById('tsa-ssnpick-chip');
            if (chip) chip.textContent = `Season ${liveSeasonVal}`;
            s.standingsRows = [];
            s.formOffset = 0;
            buildStandingsFromDOM();
            renderLeagueTable();
            const fixCont = document.getElementById('tsa-fixtures-content');
            if (fixCont && fixCont.style.display !== 'none' && s.fixturesCache) {
                TmLeagueFixtures.renderFixturesTab(s.fixturesCache);
            }
            return;
        }

        if (event.target.closest('#std-form-older')) {
            s.formOffset += 6;
            renderLeagueTable();
            return;
        }

        if (event.target.closest('#std-form-newer')) {
            s.formOffset -= 6;
            renderLeagueTable();
        }
    };

    container.onmouseover = (event) => {
        const badge = event.target.closest('.form-badge[data-opp]');
        if (!badge || !container.contains(badge)) return;
        if (badge.contains(event.relatedTarget)) return;

        const oppId = badge.dataset.opp;
        container.querySelectorAll('tr[data-club]').forEach(tr => {
            tr.classList.toggle('std-hover-opp', tr.dataset.club === oppId);
        });

        const score = badge.dataset.score;
        const oppName = badge.dataset.oppName;
        const venue = badge.dataset.venue;
        const venueLabel = venue === 'H'
            ? '<span style="color:var(--tmu-text-panel-label)">(H)</span>'
            : '<span style="color:var(--tmu-text-panel-label)">(A)</span>';
        tooltip.innerHTML = `<div class="sft-score">${score} ${venueLabel}</div><div class="sft-opp">vs ${oppName}</div>`;
        positionStandingsTooltip(tooltip, event);
        tooltip.style.display = 'block';
    };

    container.onmousemove = (event) => {
        const badge = event.target.closest('.form-badge[data-opp]');
        if (!badge || !container.contains(badge) || tooltip.style.display !== 'block') return;
        positionStandingsTooltip(tooltip, event);
    };

    container.onmouseout = (event) => {
        const badge = event.target.closest('.form-badge[data-opp]');
        if (!badge || !container.contains(badge)) return;
        if (badge.contains(event.relatedTarget)) return;
        clearHoveredOpponentRows(container);
        tooltip.style.display = 'none';
    };
};

export const TmLeagueStandings = { buildStandingsFromDOM, fetchHistoryStandings, renderLeagueTable };
