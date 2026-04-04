import { TmLeagueFixtures } from './tm-league-fixtures.js';
import { TmLeaguePicker } from './tm-league-picker.js';
import { TmLeagueStandings } from './tm-league-standings.js';
import { TmLeagueStats } from './tm-league-stats.js';
import { TmLeagueTOTR } from './tm-league-totr.js';
import { TmUI } from '../shared/tm-ui.js';

/**
 * TmLeaguePanel
 *
 * Builds and injects the main tabbed panel (Standings / Fixtures / TOTR / Stats / Transfers)
 * into the page, including the season picker and feed repositioning.
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
            .tsa-ssnpick-ac {
                position: absolute;
                left: 0;
                top: calc(100% + 5px);
                width: 110px;
                z-index: 9999;
            }
            .tsa-ssnpick-ac[hidden] { display: none !important; }
            #tsa-ssn-prev, #tsa-ssn-next { flex-shrink: 0; }
            /* ── Panel flat container (like squad) ── */
            #tsa-standings-panel {
                background: var(--tmu-border-header);
                border: 1px solid var(--tmu-border-soft-alpha);
                border-radius: var(--tmu-space-md);
                overflow: hidden;
                margin-bottom: var(--tmu-space-lg);
            }
        `;
    document.head.appendChild(_s);
}

const createAutocomplete = (opts) => TmUI.autocomplete({
    tone: 'overlay',
    density: 'compact',
    size: 'md',
    grow: false,
    ...opts,
});

const injectStandingsPanel = () => {
    if (document.getElementById('tsa-standings-panel')) return;
    const ctx = window.TmLeagueCtx;

    // Hide the native table
    const nativeTable = document.getElementById('overall_table');
    if (nativeTable) {
        const wrapper = nativeTable.closest('.box') || nativeTable.parentElement;
        if (wrapper) wrapper.style.display = 'none';
    }

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
    const prevSeasonBtn = TmUI.button({
        id: 'tsa-ssn-prev',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
        color: 'secondary',
        size: 'xs',
        disabled: currentSeason <= 1,
    }).outerHTML;
    const seasonChipBtn = TmUI.button({
        id: 'tsa-ssnpick-chip',
        label: `Season ${currentSeason}`,
        color: 'secondary',
        size: 'xs',
        shape: 'full',
    }).outerHTML;
    const nextSeasonBtn = TmUI.button({
        id: 'tsa-ssn-next',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
        color: 'secondary',
        size: 'xs',
        disabled: true,
    }).outerHTML;
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
                    ${currentSeason ? `<div class="tsa-ssnpick" id="tsa-ssnpick">
                        <div style="display:flex;align-items:center;gap:2px">
                            ${prevSeasonBtn}
                            ${seasonChipBtn}
                            ${nextSeasonBtn}
                        </div>
                        <div class="tsa-ssnpick-ac" id="tsa-ssnpick-ac" hidden></div>
                    </div>` : ''}
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
        if (which === 'transfers') TmLeagueStats.renderTransfersTab();
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

    // Insert before the overall_table's closest parent .box, or just prepend to the main league column
    const col2 = document.querySelector('.tmvu-league-main, .column2_a');
    if (col2) col2.insertBefore(panel, col2.firstChild);

    // Move the native #feed element to appear right after the panel (preserves all TM like/comment JS)
    const nativeFeedEl = document.getElementById('feed');
    if (nativeFeedEl && col2) {
        const feedBox = nativeFeedEl.closest('.box') || nativeFeedEl.parentElement;
        const nodeToMove = (feedBox && feedBox !== col2) ? feedBox : nativeFeedEl;
        col2.insertBefore(nodeToMove, panel.nextSibling);
    }

    // Season autocomplete picker
    const seasonPicker = document.getElementById('tsa-ssnpick');
    const ssnChip = document.getElementById('tsa-ssnpick-chip');
    const ssnMount = document.getElementById('tsa-ssnpick-ac');
    if (seasonPicker && ssnChip && ssnMount) {
        const seasons = Array.from({ length: currentSeason }, (_, i) => currentSeason - i);
        const ssnAc = createAutocomplete({
            id: 'tsa-ssnpick-input',
            placeholder: 'Season #…',
            autocomplete: 'off',
            attrs: {
                inputmode: 'numeric',
                'aria-label': 'Season picker',
            },
        });
        ssnAc.id = 'tsa-ssnpick-ac';
        ssnAc.classList.add('tsa-ssnpick-ac');
        ssnAc.hidden = true;
        ssnMount.replaceWith(ssnAc);

        const ssnInput = ssnAc.inputEl;
        const prevBtn = document.getElementById('tsa-ssn-prev');
        const nextBtn = document.getElementById('tsa-ssn-next');

        const renderSeasonItems = (query = '') => {
            const shown = ctx.displayedSeason ?? currentSeason;
            const q = String(query).trim();
            ssnAc.setItems(seasons
                .filter(s => !q || String(s).includes(q))
                .map(s => {
                    const item = TmUI.autocompleteItem({
                        label: `Season ${s}`,
                        active: s === shown,
                        onSelect: () => {
                            closePop();
                            navigate(s);
                        },
                    });
                    item.dataset.season = String(s);
                    return item;
                }));
        };

        const openPop = () => {
            ssnAc.hidden = false;
            ssnAc.setValue('');
            renderSeasonItems();
            ssnInput.focus();
            const active = ssnAc.dropEl.querySelector('.tmu-ac-item-active');
            if (active) active.scrollIntoView({ block: 'nearest' });
        };

        const closePop = () => {
            ssnAc.hidden = true;
            ssnAc.hideDrop();
        };

        const updateChevrons = () => {
            const shown = ctx.displayedSeason ?? currentSeason;
            if (prevBtn) prevBtn.disabled = shown <= 1;
            if (nextBtn) nextBtn.disabled = shown >= currentSeason;
        };

        const navigate = s => {
            const chip = document.getElementById('tsa-ssnpick-chip');
            if (chip) chip.textContent = `Season ${s}`;
            if (s === currentSeason) {
                ctx.resetToLive();
                TmLeagueStandings.buildStandingsFromDOM();
                TmLeagueStandings.renderLeagueTable();
                const fixCont = document.getElementById('tsa-fixtures-content');
                if (fixCont && fixCont.style.display !== 'none' && ctx.fixturesCache) TmLeagueFixtures.renderFixturesTab(ctx.fixturesCache);
                const statsCont = document.getElementById('tsa-stats-content');
                if (statsCont && statsCont.style.display !== 'none') TmLeagueStats.renderPlayerStatsTab();
                const trCont = document.getElementById('tsa-transfers-content');
                if (trCont && trCont.style.display !== 'none') TmLeagueStats.renderTransfersTab();
            } else {
                ctx.setDisplayedSeason(s);
                TmLeagueStandings.fetchHistoryStandings(s);
                TmLeagueFixtures.fetchHistoryFixtures(s);
                const statsCont = document.getElementById('tsa-stats-content');
                if (statsCont && statsCont.style.display !== 'none') TmLeagueStats.renderPlayerStatsTab();
                const trCont = document.getElementById('tsa-transfers-content');
                if (trCont && trCont.style.display !== 'none') TmLeagueStats.renderTransfersTab();
            }
            updateChevrons();
            if (!ssnAc.hidden) renderSeasonItems(ssnInput.value);
        };

        seasonPicker.addEventListener('click', e => {
            if (e.target.closest('#tsa-ssnpick-chip')) {
                e.stopPropagation();
                ssnAc.hidden ? openPop() : closePop();
                return;
            }

            const shown = ctx.displayedSeason ?? currentSeason;
            if (e.target.closest('#tsa-ssn-prev')) {
                e.stopPropagation();
                if (shown > 1) navigate(shown - 1);
                return;
            }

            if (e.target.closest('#tsa-ssn-next')) {
                e.stopPropagation();
                if (shown < currentSeason) navigate(shown + 1);
            }
        });

        seasonPicker.addEventListener('focusin', e => {
            if (e.target === ssnInput) renderSeasonItems(ssnInput.value);
        });

        seasonPicker.addEventListener('input', e => {
            if (e.target === ssnInput) renderSeasonItems(ssnInput.value);
        });

        seasonPicker.addEventListener('keydown', e => {
            if (e.target !== ssnInput) return;
            if (e.key === 'Enter') {
                const visible = [...ssnAc.dropEl.querySelectorAll('.tmu-ac-item')];
                if (visible.length === 1) navigate(parseInt(visible[0].dataset.season, 10));
            }
            if (e.key === 'Escape') closePop();
        });

        seasonPicker.addEventListener('focusout', e => {
            if (e.target === ssnInput) setTimeout(() => closePop(), 150);
        });

        document.addEventListener('click', e => {
            if (!seasonPicker.contains(e.target)) closePop();
        });
    }
};

export const TmLeaguePanel = { injectStandingsPanel };
