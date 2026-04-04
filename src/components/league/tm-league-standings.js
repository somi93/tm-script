import { TmStandingsPanel } from '../shared/tm-standings-panel.js';
import { TmLeagueFixtures } from './tm-league-fixtures.js';
import { TmUI } from '../shared/tm-ui.js';

/**
 * TmLeagueStandings
 *
 * Handles standings: building from live DOM, parsing/fetching history, and rendering.
 * Reads and writes shared state via window.TmLeagueCtx.
 * Rendering is delegated to TmStandingsPanel.
 */

// Singleton panel reference — created lazily when #tsa-standings-content exists
let leaguePanelRef = null;

// ─── State helpers ───────────────────────────────────────────────────────────

const liveSeasonVal = () =>
    (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;

const getLeagueState = () => {
    const s = window.TmLeagueCtx;
    const live = liveSeasonVal();
    const isHistory = s.displayedSeason !== null && s.displayedSeason !== live;

    const maxPlayedLen = Math.max(0, ...s.standingsRows.map(r => r.playedCount || 0));
    const maxUpcomingLen = Math.max(0, ...s.standingsRows.map(r => (r.form?.length || 0) - (r.playedCount || 0)));

    return {
        rows: s.standingsRows,
        liveZoneMap: s.liveZoneMap,
        formMap: isHistory ? null : Object.fromEntries(s.standingsRows.map(r => [r.clubId, r.form || []])),
        playedCountMap: isHistory ? null : Object.fromEntries(s.standingsRows.map(r => [r.clubId, r.playedCount || 0])),
        venue: s.stdVenue,
        formN: s.stdFormN,
        formOffset: s.formOffset || 0,
        historyBanner: isHistory ? `📅 Season ${s.displayedSeason}` : null,
        canOlder: !isHistory && (maxPlayedLen + 1 - (s.formOffset || 0) > 6),
        canNewer: !isHistory && ((s.formOffset || 0) > 1 - maxUpcomingLen),
    };
};

const getOrInitPanel = () => {
    if (leaguePanelRef) return leaguePanelRef;
    const container = document.getElementById('tsa-standings-content');
    if (!container) return null;

    const s = window.TmLeagueCtx;
    leaguePanelRef = TmStandingsPanel.mount(container, {
        rows: s.standingsRows,
        liveZoneMap: s.liveZoneMap,
        venue: s.stdVenue,
        formN: s.stdFormN,
        tooltip: true,
        onVenueChange: (v) => { s.stdVenue = v; leaguePanelRef.update(getLeagueState()); },
        onFormNChange: (n) => { s.stdFormN = n; leaguePanelRef.update(getLeagueState()); },
        onFormOlder: () => { s.formOffset += 6; leaguePanelRef.update(getLeagueState()); },
        onFormNewer: () => { s.formOffset -= 6; leaguePanelRef.update(getLeagueState()); },
        onHistoryBack: () => {
            const live = liveSeasonVal();
            s.displayedSeason = null;
            s.historyFixturesData = null;
            s.standingsRows = [];
            s.formOffset = 0;
            const chip = document.getElementById('tsa-ssnpick-chip');
            if (chip) chip.textContent = `Season ${live}`;
            buildStandingsFromDOM();
            leaguePanelRef.update(getLeagueState());
            const fixCont = document.getElementById('tsa-fixtures-content');
            if (fixCont && fixCont.style.display !== 'none' && s.fixturesCache) {
                TmLeagueFixtures.renderFixturesTab(s.fixturesCache);
            }
        },
    });

    return leaguePanelRef;
};

// ─── DOM → standings rows ────────────────────────────────────────────────────

const buildStandingsFromDOM = () => {
    const s = window.TmLeagueCtx;
    s.standingsRows = [];

    const myClubId = (() => {
        const hi = document.querySelector('#overall_table tr.highlighted_row_done td a[club_link]');
        return hi ? hi.getAttribute('club_link') : null;
    })();

    // Compute form data from fixtures cache via shared utility
    const { formMap, playedCountMap } = s.fixturesCache
        ? TmStandingsPanel.buildFormData(s.fixturesCache)
        : { formMap: {}, playedCountMap: {} };

    $('#overall_table tbody tr').each(function () {
        const $tr = $(this);
        const cls = ($tr.attr('class') || '').trim();
        const $a = $tr.find('td a[club_link]').first();
        if (!$a.length) return;
        const clubId = $a.attr('club_link');
        const clubName = $a.text().trim();
        const tds = $tr.find('td');
        const rank = parseInt($(tds[0]).text().trim()) || 0;
        const gp   = parseInt($(tds[2]).text().trim()) || 0;
        const w    = parseInt($(tds[3]).text().trim()) || 0;
        const d    = parseInt($(tds[4]).text().trim()) || 0;
        const l    = parseInt($(tds[5]).text().trim()) || 0;
        const gf   = parseInt($(tds[6]).text().trim()) || 0;
        const ga   = parseInt($(tds[7]).text().trim()) || 0;
        const pts  = parseInt($(tds[8]).text().trim()) || 0;
        const isMe = cls.includes('highlighted_row_done') || clubId === myClubId;
        let zone = '';
        if (cls.includes('promotion_playoff')) zone = 'promo-po';
        else if (cls.includes('promotion')) zone = 'promo';
        else if (cls.includes('relegation_playoff')) zone = 'rel-po';
        else if (cls.includes('relegation')) zone = 'rel';
        s.standingsRows.push({
            rank, clubId, clubName, gp, w, d, l, gf, ga, pts, zone, isMe,
            form: formMap[clubId] || [],
            playedCount: playedCountMap[clubId] || 0,
        });
        if (rank && zone) s.liveZoneMap[rank] = zone;
    });
};

// ─── History ─────────────────────────────────────────────────────────────────

const parseHistoryStandings = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const table = doc.querySelector('table.border_bottom');
    if (!table) return [];
    const myClubId = (typeof SESSION !== 'undefined' && SESSION.main_id) ? String(SESSION.main_id) : null;
    const rows = [];
    table.querySelectorAll('tr').forEach(tr => {
        const tds = Array.from(tr.querySelectorAll('td'));
        let a = null;
        for (const td of tds) { a = td.querySelector('a[club_link]'); if (a) break; }
        if (!a) return;
        const cls = tr.className || '';
        const rank = parseInt(tds[0]?.textContent.trim()) || 0;
        const clubId = a.getAttribute('club_link');
        const clubName = a.textContent.trim();
        const gp  = parseInt(tds[2]?.textContent.trim()) || 0;
        const w   = parseInt(tds[3]?.textContent.trim()) || 0;
        const d   = parseInt(tds[4]?.textContent.trim()) || 0;
        const l   = parseInt(tds[5]?.textContent.trim()) || 0;
        const gp2 = (tds[6]?.textContent.trim() || '0-0').split('-');
        const gf  = parseInt(gp2[0]) || 0;
        const ga  = parseInt(gp2[1]) || 0;
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
    const panel = getOrInitPanel();
    if (!panel) return;
    panel.update({ rows: [], historyBanner: `📅 Season ${season}` });
    window.fetch(`/history/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/standings/${season}/`)
        .then(r => r.text())
        .then(html => {
            const rows = parseHistoryStandings(html);
            if (!rows.length) {
                document.getElementById('tsa-standings-content').innerHTML = TmUI.empty(`No standings data for Season ${season}`);
                return;
            }
            rows.forEach(r => { if (!r.zone && s.liveZoneMap[r.rank]) r.zone = s.liveZoneMap[r.rank]; });
            s.displayedSeason = season;
            s.standingsRows = rows;
            s.formOffset = 0;
            renderLeagueTable();
        })
        .catch(() => {
            document.getElementById('tsa-standings-content').innerHTML = TmUI.error(`Failed to load Season ${season}`);
        });
};

// ─── Render ──────────────────────────────────────────────────────────────────

const renderLeagueTable = () => {
    const panel = getOrInitPanel();
    if (!panel || !window.TmLeagueCtx?.standingsRows?.length) return;
    panel.update(getLeagueState());
};

export const TmLeagueStandings = { buildStandingsFromDOM, parseHistoryStandings, fetchHistoryStandings, renderLeagueTable };
