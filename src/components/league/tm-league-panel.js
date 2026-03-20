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
                font-size: 12px; font-weight: 700; color: #d2e8bf;
                letter-spacing: 0.3px; text-transform: none;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 260px;
            }
            .tsa-season-label {
                font-size: 11px; color: #7faa62; font-weight: 700;
                white-space: nowrap; flex-shrink: 0;
            }
            /* ── Season autocomplete picker ── */
            .tsa-ssnpick { position: relative; flex-shrink: 0; }
            #tsa-ssn-prev,
            #tsa-ssn-next {
                width: 20px; height: 20px; padding: 0 !important;
                min-width: 20px; line-height: 1; font-size: 14px;
                flex-shrink: 0;
            }
            .tsa-ssnpick-pop {
                display: none; flex-direction: column;
                position: absolute; left: 0; top: calc(100% + 5px);
                width: 110px; background: #162b0f;
                border: 1px solid #3d6828; border-radius: 4px;
                box-shadow: 0 8px 20px rgba(0,0,0,0.7); z-index: 9999;
            }
            .tsa-ssnpick-input {
                background: rgba(0,0,0,0.3); border: none;
                border-bottom: 1px solid #3d6828;
                color: #c8e0b4; font-size: 11px; font-weight: 700;
                padding: 6px 9px; outline: none; border-radius: 4px 4px 0 0;
                width: 100%; box-sizing: border-box;
            }
            .tsa-ssnpick-input::placeholder { color: #4a7038; }
            .tsa-ssnpick-list {
                max-height: 160px; overflow-y: auto;
                scrollbar-width: thin; scrollbar-color: #3d6828 transparent;
            }
            .tsa-ssnpick-item {
                padding: 5px 9px; font-size: 11px; color: #7ab060;
                cursor: pointer; white-space: nowrap;
            }
            .tsa-ssnpick-item:hover { background: rgba(108,192,64,0.12); color: #c8e0b4; }
            .tsa-ssnpick-item.tsa-ssnpick-active { color: #6cc040; font-weight: 700; }
        `;
        document.head.appendChild(_s);
    }

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
        panel.className = 'tmu-card';
        panel.id = 'tsa-standings-panel';
        const prevSeasonBtn = TmUI.button({
            id: 'tsa-ssn-prev',
            label: '‹',
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
            label: '›',
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
                <div style="display:flex;align-items:center;gap:6px;min-width:0">
                    <span id="tsa-panel-league-name" class="tsa-panel-league-name">${ctx.panelLeagueName || 'League'}</span>
                    ${lDivision ? `<span class="tsa-season-label">(${lDivision}.${lGroup})</span>` : ''}
                    ${currentSeason ? `<div class="tsa-ssnpick" id="tsa-ssnpick">
                        <div style="display:flex;align-items:center;gap:2px">
                            ${prevSeasonBtn}
                            ${seasonChipBtn}
                            ${nextSeasonBtn}
                        </div>
                        <div class="tsa-ssnpick-pop" id="tsa-ssnpick-pop">
                            <input class="tsa-ssnpick-input" id="tsa-ssnpick-input" type="text" placeholder="Season #…" autocomplete="off">
                            <div class="tsa-ssnpick-list" id="tsa-ssnpick-list">${Array.from({ length: currentSeason }, (_, i) => currentSeason - i)
                    .map(s => `<div class="tsa-ssnpick-item${s === currentSeason ? ' tsa-ssnpick-active' : ''}" data-s="${s}">Season ${s}</div>`)
                    .join('')
                }</div>
                        </div>
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

        panel.querySelector('#tsa-change-league-btn')?.addEventListener('click', TmLeaguePicker.openLeagueDialog);

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
                else document.getElementById('tsa-totr-content').innerHTML = '<div style="text-align:center;padding:20px;color:#5a7a48;font-size:12px;">Waiting for fixtures data...</div>';
            }
            if (which === 'stats') TmLeagueStats.renderPlayerStatsTab();
            if (which === 'transfers') TmLeagueStats.renderTransfersTab();
        };

        panel.querySelector('#tsa-panel-tabs')?.appendChild(TmUI.tabs({
            items: [
                { key: 'standings', label: 'Standings', icon: '🏆' },
                { key: 'fixtures', label: 'Fixtures', icon: '📅' },
                { key: 'totr', label: 'Team of Round', icon: '⭐' },
                { key: 'stats', label: 'Statistics', icon: '📊' },
                { key: 'transfers', label: 'Transfers', icon: '🔄' },
            ],
            active: 'standings',
            color: 'primary',
            stretch: true,
            cls: 'tsa-panel-tabs',
            itemCls: 'tsa-panel-tab',
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
        const ssnChip = document.getElementById('tsa-ssnpick-chip');
        const ssnPop = document.getElementById('tsa-ssnpick-pop');
        const ssnInput = document.getElementById('tsa-ssnpick-input');
        const ssnList = document.getElementById('tsa-ssnpick-list');
        if (ssnChip && ssnPop) {
            const openPop = () => {
                ssnPop.style.display = 'flex';
                ssnInput.value = '';
                ssnInput.focus();
                // scroll active item into view
                const active = ssnList.querySelector('.tsa-ssnpick-active');
                if (active) active.scrollIntoView({ block: 'nearest' });
            };
            const closePop = () => { ssnPop.style.display = 'none'; };
            ssnChip.addEventListener('click', e => { e.stopPropagation(); ssnPop.style.display === 'none' ? openPop() : closePop(); });
            ssnInput.addEventListener('input', () => {
                const q = ssnInput.value.trim();
                ssnList.querySelectorAll('.tsa-ssnpick-item').forEach(el => {
                    el.style.display = (!q || el.dataset.s.includes(q)) ? '' : 'none';
                });
            });
            ssnInput.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    const visible = [...ssnList.querySelectorAll('.tsa-ssnpick-item')].filter(el => el.style.display !== 'none');
                    if (visible.length === 1) visible[0].click();
                }
                if (e.key === 'Escape') closePop();
            });
            const updateChevrons = () => {
                const shown = ctx.displayedSeason ?? currentSeason;
                const prevBtn = document.getElementById('tsa-ssn-prev');
                const nextBtn = document.getElementById('tsa-ssn-next');
                if (prevBtn) prevBtn.disabled = shown <= 1;
                if (nextBtn) nextBtn.disabled = shown >= currentSeason;
            };
            const navigate = s => {
                ssnList.querySelectorAll('.tsa-ssnpick-item').forEach(el =>
                    el.classList.toggle('tsa-ssnpick-active', parseInt(el.dataset.s) === s));
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
            };
            ssnList.addEventListener('click', e => {
                const item = e.target.closest('.tsa-ssnpick-item');
                if (!item) return;
                closePop();
                navigate(parseInt(item.dataset.s));
            });
            document.getElementById('tsa-ssn-prev')?.addEventListener('click', e => {
                e.stopPropagation();
                const shown = ctx.displayedSeason ?? currentSeason;
                if (shown > 1) navigate(shown - 1);
            });
            document.getElementById('tsa-ssn-next')?.addEventListener('click', e => {
                e.stopPropagation();
                const shown = ctx.displayedSeason ?? currentSeason;
                if (shown < currentSeason) navigate(shown + 1);
            });
            document.addEventListener('click', e => { if (!document.getElementById('tsa-ssnpick').contains(e.target)) closePop(); });
        }
    };

    export const TmLeaguePanel = { injectStandingsPanel };
