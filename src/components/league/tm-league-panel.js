import { TmLeagueFixtures } from './tm-league-fixtures.js';
import { TmLeaguePicker } from './tm-league-picker.js';
import { TmLeagueStandings } from './tm-league-standings.js';
import { TmLeagueStats } from './tm-league-stats.js';
import { TmLeagueTransfers } from './tm-league-transfers.js';
import { TmLeagueTOTR } from './tm-league-totr.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmSeasonBar } from '../shared/tm-season-bar.js';

/**
 * TmLeaguePanel
 *
 * Builds and injects the main tabbed panel (Standings / Fixtures / TOTR / Stats / Transfers)
 * into the custom league host, including the season picker.
 * Reads and writes shared state via window.TmLeagueCtx.
 */

if (!document.getElementById('tsa-league-panel-style')) {
    const _s = document.createElement('style');
    _s.id = 'tsa-league-panel-style';
    _s.textContent = `
            /* ── Panel header league name + season ── */
            .tsa-panel-league-name {
                font-size: var(--tmu-font-sm); font-weight: 700; color: var(--tmu-text-strong);
                letter-spacing: 0.3px; text-transform: none;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 260px;
            }
            .tsa-season-label {
                font-size: var(--tmu-font-xs); color: var(--tmu-text-muted); font-weight: 700;
                white-space: nowrap; flex-shrink: 0;
            }
            /* ── Season autocomplete picker ── */
            .tsa-ssnpick { position: relative; flex-shrink: 0; }
            /* ── Panel flat container (like squad) ── */
            #tsa-standings-panel {
                background: var(--tmu-league-panel-bg, var(--tmu-border-header));
                border: 1px solid var(--tmu-league-panel-border, var(--tmu-border-soft-alpha));
                border-radius: var(--tmu-space-md);
                overflow: hidden;
                margin-bottom: var(--tmu-space-lg);
            }
        `;
    document.head.appendChild(_s);
}

const injectStandingsPanel = () => {
    if (document.getElementById('tsa-standings-panel')) return;
    const ctx = window.TmLeagueCtx;

    // Parse league params from the nav links (most reliable source — full URL always present)
    let lCountry = ctx.panelCountry || ctx.leagueCountry;
    let lDivision = ctx.panelDivision || ctx.leagueDivision;
    let lGroup = ctx.panelGroup || ctx.leagueGroup || '1';
    const navLink = document.querySelector('.column1 .content_menu a[href*="/league/"], .column1_a .content_menu a[href*="/league/"]');
    if (navLink) {
        const parts = navLink.getAttribute('href').split('/').filter(Boolean);
        // parts: ['league', 'cs', '1', '1']
        if (parts.length >= 3) { lCountry = parts[1]; lDivision = parts[2]; lGroup = parts[3] || '1'; }
    }
    // Store for use by fetchAndRenderTOTR (leagueCountry etc. may be wrong on subpages)
    const leagueAnchor = document.querySelector('a[league_link][href*="/league/"].normal.large, a[league_link][href*="/league/"]');
    ctx.setPanelLeague(lCountry, lDivision, lGroup, leagueAnchor?.textContent.trim() || null);

    // League name: try DOM first (link on the page), will be updated from match data later

    const currentSeason = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;

    const panel = document.createElement('div');
    panel.id = 'tsa-standings-panel';
    panel.className = 'tmu-flat-panel';
    const changeLeagueBtn = TmUI.button({
        id: 'tsa-change-league-btn',
        label: 'Change League',
        color: 'secondary',
        size: 'xs',
    }).outerHTML;
    panel.innerHTML = `
            <div class="tmu-card-head">
                <div style="display:flex;align-items:center;gap:var(--tmu-space-sm);min-width:0">
                    <div>
                        <span id="tsa-panel-league-name" class="tsa-panel-league-name">${ctx.panelLeagueName || 'League'}</span>
                        ${lDivision ? `<span class="tsa-season-label">(${lDivision}.${lGroup})</span>` : ''}    
                    </div>
                    ${currentSeason ? `<div class="tsa-ssnpick" id="tsa-ssnpick"></div>` : ''}
                </div>
                ${changeLeagueBtn}
            </div>
            <div id="tsa-panel-tabs"></div>
            <div id="tsa-standings-content" class="tsa-standings-wrap"></div>
            <div id="tsa-fixtures-content" style="display:none"></div>
            <div id="tsa-totr-content" style="display:none"></div>
            <div id="tsa-stats-content" style="display:none"></div>
            <div id="tsa-transfers-content" style="display:none"></div>
        `;

    panel.onclick = (event) => {
        if (!event.target.closest('#tsa-change-league-btn')) return;
        TmLeaguePicker.openLeagueDialog();
    };

    const switchPanel = (which) => {
        document.getElementById('tsa-standings-content').style.display = which === 'standings' ? '' : 'none';
        document.getElementById('tsa-fixtures-content').style.display = which === 'fixtures' ? '' : 'none';
        document.getElementById('tsa-totr-content').style.display = which === 'totr' ? '' : 'none';
        document.getElementById('tsa-stats-content').style.display = which === 'stats' ? '' : 'none';
        document.getElementById('tsa-transfers-content').style.display = which === 'transfers' ? '' : 'none';
        if (which === 'fixtures') {
            if (ctx.displayedSeason !== null && ctx.historyFixturesData) TmLeagueFixtures.renderHistoryFixturesTab(ctx.historyFixturesData);
            else if (ctx.displayedSeason !== null && !ctx.historyFixturesData) { /* fetch still in progress, shows loading */ }
            else if (ctx.fixturesCache) TmLeagueFixtures.renderFixturesTab(ctx.fixturesCache);
        }
        if (which === 'totr') {
            const date = ctx.totrCurrentDate || (ctx.allRounds[ctx.currentRoundIdx] && ctx.allRounds[ctx.currentRoundIdx].date);
            if (date) TmLeagueTOTR.fetchAndRenderTOTR(date);
            else document.getElementById('tsa-totr-content').innerHTML = TmUI.empty('Waiting for fixtures data...');
        }
        if (which === 'stats') TmLeagueStats.renderPlayerStatsTab();
        if (which === 'transfers') TmLeagueTransfers.renderTransfersTab();
    };

    panel.querySelector('#tsa-panel-tabs')?.appendChild(TmUI.tabs({
        items: [
            { key: 'standings', label: 'Standings', icon: '🏆' },
            { key: 'fixtures', label: 'Fixtures', icon: '📅' },
            { key: 'totr', label: 'Round XI', icon: '⭐' },
            { key: 'stats', label: 'Statistics', icon: '📊' },
            { key: 'transfers', label: 'Transfers', icon: '🔄' },
        ],
        active: 'standings',
        color: 'primary',
        stretch: true,
        onChange: switchPanel,
    }));

    // Insert into the custom league main host only.
    const col2 = document.querySelector('.tmvu-league-main');
    if (col2) col2.insertBefore(panel, col2.firstChild);

    // Season picker
    if (currentSeason) {
        const navigate = s => {
            if (s === currentSeason) {
                ctx.resetToLive();
                TmLeagueStandings.buildStandingsFromDOM();
                TmLeagueStandings.renderLeagueTable();
                const fixCont = document.getElementById('tsa-fixtures-content');
                if (fixCont && fixCont.style.display !== 'none' && ctx.fixturesCache) TmLeagueFixtures.renderFixturesTab(ctx.fixturesCache);
                const statsCont = document.getElementById('tsa-stats-content');
                if (statsCont && statsCont.style.display !== 'none') TmLeagueStats.renderPlayerStatsTab();
                const trCont = document.getElementById('tsa-transfers-content');
                if (trCont && trCont.style.display !== 'none') TmLeagueTransfers.renderTransfersTab();
            } else {
                ctx.setDisplayedSeason(s);
                TmLeagueStandings.fetchHistoryStandings(s);
                TmLeagueFixtures.fetchHistoryFixtures(s);
                const statsCont = document.getElementById('tsa-stats-content');
                if (statsCont && statsCont.style.display !== 'none') TmLeagueStats.renderPlayerStatsTab();
                const trCont = document.getElementById('tsa-transfers-content');
                if (trCont && trCont.style.display !== 'none') TmLeagueTransfers.renderTransfersTab();
            }
        };
        TmSeasonBar.mount(panel.querySelector('#tsa-ssnpick'), {
            max: currentSeason,
            current: currentSeason,
            label: false,
            cls: '',
            onChange: id => navigate(Number(id)),
        });
    }
};

export const TmLeaguePanel = { injectStandingsPanel };
