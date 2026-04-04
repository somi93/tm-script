import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmPageHero } from '../components/shared/tm-page-hero.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmFixturesList } from '../components/shared/tm-fixtures-list.js';
import { TmClubFixturesStyles } from '../components/club/tm-club-fixtures-styles.js';
import { TmTable } from '../components/shared/tm-table.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmQuickmatchService } from '../services/quickmatch.js';

(function () {
    'use strict';

    if (!/^\/quickmatch\/?$/i.test(window.location.pathname)) return;

    const main = document.querySelector('.tmvu-main, .main_center');
    if (!main) return;

    const sourceRoot = main.cloneNode(true);
    const STYLE_ID = 'tmvu-quickmatch-style';
    const HASH_TO_TAB = { '#ranked': 'ranked', '#show': 'show', '#friendly': 'friendly' };
    const TAB_TO_HASH = { ranked: '#ranked', show: '#show', friendly: '#friendly' };
    const RANKED_MODES = [
        { key: 'national', label: 'Nat. Division' },
        { key: 'international', label: 'Int. Division' },
        { key: 'overall', label: 'All' },
    ];
    const SHOW_GROUP_LABELS = {
        tab3: 'Divisional',
        tab4: 'All Stars',
        tab5: 'Game Teamsters',
    };

    let mainColumn = null;
    let renderQueued = false;
    let queuePollTimer = null;
    let queueTickTimer = null;

    const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const metricHtml = (opts) => TmUI.metric(opts);
    const renderFlag = (country) => {
        if (typeof window.get_flag === 'function' && country) return window.get_flag(country);
        if (!country) return '';
        return `<span class="tmvu-qm-flag-fallback">${escapeHtml(String(country).toUpperCase())}</span>`;
    };
    const currentHashTab = () => HASH_TO_TAB[window.location.hash] || 'ranked';
    const setHash = (tab) => {
        const hash = TAB_TO_HASH[tab] || '#ranked';
        if (window.location.hash === hash) return;
        window.history.replaceState(null, '', `${window.location.pathname}${hash}`);
    };

    const parseMenu = () => Array.from(sourceRoot.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
        if (node.tagName === 'HR') return [{ type: 'separator' }];
        if (node.tagName !== 'A') return [];
        const label = cleanText(node.textContent);
        return [{
            type: 'link',
            href: node.getAttribute('href') || '#',
            label,
            icon: /quick match/i.test(label) ? '⚡' : /standing/i.test(label) ? '🏁' : /latest/i.test(label) ? '🕒' : '🤝',
            isSelected: node.classList.contains('selected'),
        }];
    });

    const parseCompleteStandingsHref = () => sourceRoot.querySelector('#match_type_ranked a.arrow_right[href*="/quickmatch/complete-standings/"]')?.getAttribute('href') || '/quickmatch/complete-standings/';
    const parseCostCopy = () => cleanText(sourceRoot.querySelector('#select_match_type .very_large')?.textContent || 'Costs 2 TM Pro Days');

    const parseShowmatchGroups = () => {
        const labels = {};
        sourceRoot.querySelectorAll('#match_type_show .tabs [set_active]').forEach(tab => {
            labels[tab.getAttribute('set_active')] = cleanText(tab.textContent) || SHOW_GROUP_LABELS[tab.getAttribute('set_active')] || 'Showmatch';
        });

        return Array.from(sourceRoot.querySelectorAll('#match_type_show .tab_container > div[id]')).map(panel => {
            const key = panel.id;
            const options = Array.from(panel.querySelectorAll('ul.radio_buttons li.radio')).map(node => {
                const rawVal = node.getAttribute('radio_val') || '';
                const hoverText = node.querySelector('.hover_text');
                return {
                    id: rawVal,
                    labelHtml: hoverText?.innerHTML || escapeHtml(cleanText(node.textContent)),
                    disabled: node.classList.contains('disabled'),
                    selected: node.classList.contains('selected'),
                };
            });

            return {
                key,
                label: labels[key] || SHOW_GROUP_LABELS[key] || 'Showmatch',
                heading: cleanText(panel.querySelector('.align_center strong, .division_champs')?.textContent || labels[key] || ''),
                subcopy: cleanText(panel.querySelector('.align_center em, .align_center.large + ul, .align_center + em')?.previousElementSibling ? '' : panel.querySelector('em')?.textContent || ''),
                options,
            };
        }).filter(group => group.options.length);
    };

    const parseFriendlyMarkup = () => sourceRoot.querySelector('#match_type_friendly')?.innerHTML || TmUI.empty('Challenge section was not available in the source page.');

    const parseQmLatestMatchesHtml = (html) => {
        if (!html) return null;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const matches = Array.from(doc.querySelectorAll('table.zebra tr'))
            .filter(row => row.querySelector('a.match_link'))
            .map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                if (cells.length < 4) return null;
                const homeAnchor = cells[1]?.querySelector('a[club_link]');
                const awayAnchor = cells[3]?.querySelector('a[club_link]');
                const matchLink = cells[2]?.querySelector('a.match_link');
                if (!matchLink || !homeAnchor || !awayAnchor) return null;
                const matchId = (matchLink.getAttribute('href') || '').match(/\/matches\/(\d+)\//)?.[1] || '';
                const score = cleanText(matchLink.textContent);
                const isPlayed = /\d/.test(score);
                // Parse "4. April" → ISO date
                const rawDate = cleanText(cells[0].textContent);
                const parts = rawDate.match(/(\d+)\.\s*(\w+)/);
                const MONTHS = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11 };
                let isoDate = rawDate;
                if (parts && MONTHS[parts[2]] !== undefined) {
                    const d = new Date(new Date().getFullYear(), MONTHS[parts[2]], Number(parts[1]));
                    isoDate = d.toISOString().slice(0, 10);
                }
                return {
                    id: matchId,
                    date: isoDate,
                    result: isPlayed ? score : '',
                    hometeam: homeAnchor.getAttribute('club_link') || '',
                    hometeam_name: cleanText(homeAnchor.textContent),
                    awayteam: awayAnchor.getAttribute('club_link') || '',
                    awayteam_name: cleanText(awayAnchor.textContent),
                    matchtype_key: 'ranked',
                };
            }).filter(Boolean);

        if (!matches.length) return null;

        // Group by month for tabs: { 'YYYY-MM': { label, matches[] } }
        const byMonth = {};
        matches.forEach(match => {
            const [y, m] = match.date.split('-');
            const key = `${y}-${m}`;
            if (!byMonth[key]) {
                const d = new Date(`${key}-01`);
                byMonth[key] = {
                    label: d.toLocaleDateString('en-GB', { month: 'long' }).toUpperCase(),
                    matches: [],
                };
            }
            byMonth[key].matches.push(match);
        });
        return byMonth;
    };

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        injectTmPageLayoutStyles();

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-qm-note-actions {
                display: flex;
                flex-wrap: wrap;
                gap: var(--tmu-space-sm);
            }

            .tmvu-qm-finding {
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: var(--tmu-space-sm);
                min-height: 72px;
                padding: var(--tmu-space-xl) var(--tmu-space-lg);
                border-radius: var(--tmu-space-md);
                border: 1px solid rgba(255,255,255,.06);
                text-align: center;
                background:
                    radial-gradient(ellipse 90% 70% at 50% 30%, rgba(80,100,140,.18) 0%, transparent 70%),
                    var(--tmu-surface-dark-strong);
            }

            @keyframes tmvu-qm-bg-shift {
                0%, 100% { box-shadow: inset 0 0 60px rgba(0,254,167,.03); border-color: rgba(255,255,255,.07); }
                50%       { box-shadow: inset 0 0 60px rgba(0,254,167,.10); border-color: rgba(0,254,167,.18); }
            }

            .tmvu-qm-finding-content {
                position: relative;
                z-index: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .tmvu-qm-particle {
                position: absolute;
                border-radius: 999px;
                background: var(--tmu-accent);
                opacity: 0;
            }

            @keyframes tmvu-qm-wave-a {
                0%   { left: -8px; transform: translateY(0px);   opacity: 0; }
                8%   { opacity: .8; }
                25%  { transform: translateY(-13px); }
                50%  { left: 50%; transform: translateY(9px); }
                75%  { transform: translateY(-10px); }
                92%  { opacity: .8; }
                100% { left: calc(100% + 8px); transform: translateY(5px);  opacity: 0; }
            }

            @keyframes tmvu-qm-wave-b {
                0%   { left: -8px; transform: translateY(0px);   opacity: 0; }
                8%   { opacity: .55; }
                30%  { transform: translateY(11px); }
                55%  { left: 55%; transform: translateY(-15px); }
                80%  { transform: translateY(7px); }
                92%  { opacity: .55; }
                100% { left: calc(100% + 8px); transform: translateY(-4px); opacity: 0; }
            }

            @keyframes tmvu-qm-wave-c {
                0%   { left: -8px; transform: translateY(0px);   opacity: 0; }
                8%   { opacity: .45; }
                20%  { transform: translateY(-9px); }
                45%  { left: 45%; transform: translateY(13px); }
                70%  { transform: translateY(-7px); }
                92%  { opacity: .45; }
                100% { left: calc(100% + 8px); transform: translateY(9px);  opacity: 0; }
            }

            .tmvu-qm-particle:nth-child(1) { width: 5px; height: 5px; top: 28%; animation: tmvu-qm-wave-a 4.2s ease-in-out -0.5s  infinite; }
            .tmvu-qm-particle:nth-child(2) { width: 4px; height: 4px; top: 58%; animation: tmvu-qm-wave-b 5.8s ease-in-out -2.1s  infinite; }
            .tmvu-qm-particle:nth-child(3) { width: 6px; height: 6px; top: 18%; animation: tmvu-qm-wave-c 3.9s ease-in-out -1.3s  infinite; }
            .tmvu-qm-particle:nth-child(4) { width: 4px; height: 4px; top: 72%; animation: tmvu-qm-wave-a 6.3s ease-in-out -3.5s  infinite; }
            .tmvu-qm-particle:nth-child(5) { width: 5px; height: 5px; top: 44%; animation: tmvu-qm-wave-b 4.7s ease-in-out -0.85s infinite; }
            .tmvu-qm-particle:nth-child(6) { width: 4px; height: 4px; top: 14%; animation: tmvu-qm-wave-c 5.1s ease-in-out -2.7s  infinite; }
            .tmvu-qm-particle:nth-child(7) { width: 5px; height: 5px; top: 82%; animation: tmvu-qm-wave-a 3.6s ease-in-out -1.95s infinite; }

            .tmvu-qm-finding-label {
                font-size: var(--tmu-font-xs);
                font-weight: 700;
                letter-spacing: .1em;
                text-transform: uppercase;
                color: var(--tmu-text-panel-label);
            }

            .tmvu-qm-finding-timer {
                font-size: var(--tmu-font-2xl);
                font-weight: 900;
                color: var(--tmu-accent);
                font-variant-numeric: tabular-nums;
                letter-spacing: -.02em;
                line-height: 1;
                margin-top: 2px;
            }

            .tmvu-qm-toolbar,
            .tmvu-qm-subtabs,
            .tmvu-qm-show-group-tabs,
            .tmvu-qm-card-actions,
            .tmvu-qm-show-footer {
                display: flex;
                flex-wrap: wrap;
                gap: var(--tmu-space-sm);
                align-items: center;
            }

            .tmvu-qm-toolbar {
                justify-content: space-between;
            }

            .tmvu-qm-layout {
                display: grid;
                grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
                gap: var(--tmu-space-lg);
                align-items: start;
            }

            .tmvu-qm-ranked-table .tmvu-qm-rank-me td {
                background: var(--tmu-success-fill-faint);
                color: var(--tmu-text-inverse);
                font-weight: 800;
            }

            .tmvu-qm-ranked-table th:first-child,
            .tmvu-qm-ranked-table td:first-child {
                width: 2rem;
                white-space: nowrap;
            }

            .tmvu-qm-flag-fallback {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 20px;
                height: 14px;
                padding: 0 var(--tmu-space-xs);
                border-radius: var(--tmu-space-xs);
                background: var(--tmu-border-contrast);
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-2xs);
                font-weight: 800;
            }

            .tmvu-qm-show-option a,
            .tmvu-qm-friendly-body a {
                color: var(--tmu-text-strong);
                text-decoration: none;
            }

            .tmvu-qm-show-option a:hover,
            .tmvu-qm-friendly-body a:hover {
                text-decoration: underline;
            }

            .tmvu-qm-show-list {
                display: grid;
                gap: var(--tmu-space-md);
            }

            .tmvu-qm-show-option {
                display: grid;
                grid-template-columns: auto minmax(0, 1fr);
                gap: var(--tmu-space-md);
                align-items: start;
                padding: var(--tmu-space-md);
                border-radius: var(--tmu-space-md);
                background: var(--tmu-surface-card-soft);
                border: 1px solid var(--tmu-border-soft-alpha);
                cursor: pointer;
            }

            .tmvu-qm-show-option.is-selected {
                background: var(--tmu-success-fill-soft);
                border-color: var(--tmu-border-success);
            }

            .tmvu-qm-show-option.is-disabled {
                opacity: .5;
                cursor: default;
            }

            .tmvu-qm-radio {
                width: 18px;
                height: 18px;
                margin-top: var(--tmu-space-xs);
                border-radius: 999px;
                border: 2px solid var(--tmu-text-muted);
                position: relative;
                flex: 0 0 auto;
            }

            .tmvu-qm-show-option.is-selected .tmvu-qm-radio::after {
                content: '';
                position: absolute;
                inset: var(--tmu-space-xs);
                border-radius: 999px;
                background: var(--tmu-accent);
            }

            .tmvu-qm-show-copy {
                color: var(--tmu-text-main);
                font-size: var(--tmu-font-sm);
                line-height: 1.6;
            }

            .tmvu-qm-show-copy .subtle {
                color: var(--tmu-text-muted);
            }

            .tmvu-qm-friendly-body .std,
            .tmvu-qm-friendly-body #match_type_friendly,
            .tmvu-qm-friendly-body .match_type {
                display: block !important;
            }

            .tmvu-qm-friendly-body h3 {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-md);
                margin: 0 0 var(--tmu-space-sm);
            }

            .tmvu-qm-friendly-body p {
                color: var(--tmu-text-main);
                line-height: 1.6;
            }

            .tmvu-qm-friendly-body .button {
                text-decoration: none !important;
            }

            .tmvu-qm-friendly-composer {
                display: grid;
                gap: var(--tmu-space-md);
                padding: var(--tmu-space-md);
                border-radius: var(--tmu-space-md);
                background: var(--tmu-surface-card-soft);
                border: 1px solid var(--tmu-border-soft-alpha);
            }

            .tmvu-qm-friendly-search-row {
                display: flex;
                flex-wrap: wrap;
                gap: var(--tmu-space-md);
                align-items: center;
            }

            .tmvu-qm-friendly-label {
                color: var(--tmu-text-panel-label);
                font-size: var(--tmu-font-xs);
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-qm-friendly-search.tmu-input {
                flex: 1 1 260px;
                min-width: 220px;
            }

            .tmvu-qm-friendly-selected {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: var(--tmu-space-md);
                padding: var(--tmu-space-md);
                border-radius: var(--tmu-space-md);
                background: var(--tmu-surface-card-soft);
                border: 1px solid var(--tmu-border-soft-alpha);
            }

            .tmvu-qm-friendly-selected #club_to_challenge {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-sm);
                font-weight: 700;
            }

            .tmvu-qm-friendly-selected #club_to_challenge .italic.subtle {
                color: var(--tmu-text-muted);
                font-style: normal;
                font-weight: 600;
            }

            @media (max-width: 1120px) {
                .tmvu-qm-layout {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(style);
    };

    const showGroups = parseShowmatchGroups();
    const showSelections = Object.fromEntries(showGroups.map(group => [group.key, group.options.find(option => option.selected && !option.disabled)?.id || group.options.find(option => !option.disabled)?.id || '']));

    const state = {
        menuItems: parseMenu(),
        activeTab: currentHashTab(),
        rankedMode: 'national',
        rankedLoading: false,
        rankedRows: [],
        completeStandingsHref: parseCompleteStandingsHref(),
        showGroups,
        activeShowGroup: showGroups[0]?.key || '',
        showSelections,
        notice: '',
        queue: {
            active: false,
            text: '',
            type: '',
            startedAt: null,
        },
        costCopy: parseCostCopy(),
        friendlyMarkup: parseFriendlyMarkup(),
    };

    const queueRender = () => {
        if (renderQueued) return;
        renderQueued = true;
        window.setTimeout(() => {
            renderQueued = false;
            renderPage();
        }, 0);
    };

    const stopQueuePolling = () => {
        if (!queuePollTimer) return;
        window.clearTimeout(queuePollTimer);
        queuePollTimer = null;
    };

    const stopQueueTick = () => {
        if (!queueTickTimer) return;
        window.clearInterval(queueTickTimer);
        queueTickTimer = null;
    };

    const formatElapsed = (ms) => {
        const total = Math.floor(ms / 1000);
        const m = Math.floor(total / 60);
        const s = total % 60;
        return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
    };

    const tickQueueTimer = () => {
        const el = document.getElementById('tmvu-qm-elapsed');
        if (!el || !state.queue.startedAt) return;
        el.textContent = formatElapsed(Date.now() - state.queue.startedAt);
    };

    const startQueueTick = () => {
        stopQueueTick();
        tickQueueTimer();
        queueTickTimer = window.setInterval(tickQueueTimer, 1000);
    };

    const startQueuePolling = () => {
        stopQueuePolling();
        const poll = async () => {
            const data = await TmQuickmatchService.waitForMatch();
            if (Number(data?.match_id) > 0) {
                window.location.href = `/matches/${data.match_id}/`;
                return;
            }
            if (data?.text) state.queue.text = cleanText(data.text);
            queueRender();
            queuePollTimer = window.setTimeout(poll, 10000);
        };
        queuePollTimer = window.setTimeout(poll, 10000);
    };

    const applyQueueState = (data, fallbackType = '') => {
        if ((data?.in_queue === true) || Number(data?.match_id) > 0) {
            const wasActive = state.queue.active;
            state.queue.active = true;
            state.queue.type = fallbackType || state.queue.type || '';
            state.queue.text = cleanText(data?.text || 'Searching for a match...');
            if (!wasActive) state.queue.startedAt = Date.now();
            queueRender();
            if (Number(data?.match_id) > 0) {
                window.location.href = `/matches/${data.match_id}/`;
                return true;
            }
            startQueuePolling();
            startQueueTick();
            return true;
        }
        state.queue.active = false;
        state.queue.startedAt = null;
        state.queue.text = '';
        stopQueuePolling();
        stopQueueTick();
        return false;
    };

    const loadRankings = async (mode = state.rankedMode) => {
        state.rankedMode = mode;
        state.rankedLoading = true;
        queueRender();
        const data = await TmQuickmatchService.fetchRankings(mode);
        const rankingRows = Array.isArray(data?.rankings)
            ? data.rankings.map((row, i) => ({ ...row, rank: i + 1 }))
            : Object.entries(data?.rankings || {})
                .sort((left, right) => Number(left[0]) - Number(right[0]))
                .map(([key, row]) => ({ ...row, rank: Number(key) }));

        state.rankedRows = rankingRows.length
            ? rankingRows.filter(row => row && (row.club_link || row.club_name || row.name)).map((row) => ({
                rank: row.rank,
                rating: Number(row.rating) || 0,
                division: cleanText(row.division),
                clubId: String(row.club_id || ''),
                clubLinkHtml: row.club_link || escapeHtml(cleanText(row.club_name || row.name || 'Club')),
                country: cleanText(row.country),
                isUser: Number(row.is_user) === 1,
            }))
            : [];
        state.rankedLoading = false;
        queueRender();
    };

    const checkExistingQueue = async () => {
        const data = await TmQuickmatchService.queue('check');
        applyQueueState(data);
    };

    const startRanked = async () => {
        state.notice = '';
        state.queue.active = true;
        state.queue.type = 'ranked';
        state.queue.text = 'Searching for a match...';
        if (!state.queue.startedAt) state.queue.startedAt = Date.now();
        startQueueTick();
        queueRender();
        const data = await TmQuickmatchService.queue('ranked');
        if (!applyQueueState(data, 'ranked')) {
            state.queue.active = false;
            state.queue.startedAt = null;
            stopQueueTick();
            state.notice = 'Ranked queue did not start.';
            queueRender();
        }
    };

    const startShowmatch = async () => {
        const opponent = state.showSelections[state.activeShowGroup];
        if (!opponent) {
            state.notice = 'Select a showmatch opponent first.';
            queueRender();
            return;
        }

        state.notice = '';
        const data = await TmQuickmatchService.queue('showmatch', opponent);
        if (!applyQueueState(data, 'showmatch')) {
            state.notice = data?.error_text || 'Showmatch queue did not start.';
            queueRender();
        }
    };

    const setActiveTab = (tab) => {
        state.activeTab = tab;
        setHash(tab);
        queueRender();
    };

    const buildRankingsTable = () => TmTable.table({
        cls: 'tmvu-qm-ranked-table',
        items: state.rankedRows,
        rowCls: row => row.isUser ? 'tmvu-qm-rank-me' : '',
        headers: [
            {
                key: 'rank',
                label: '#',
                sortable: false,
                render: (value) => String(value),
            },
            {
                key: 'club',
                label: 'Club',
                sortable: false,
                render: (_, row) => row.clubLinkHtml,
            },
            {
                key: 'division',
                label: 'Div',
                sortable: false,
                render: (_, row) => `${row.country && state.rankedMode !== 'national' ? `${renderFlag(row.country)} ` : ''}${escapeHtml(row.division)}`,
            },
            {
                key: 'rating',
                label: 'Pts',
                align: 'r',
                sortable: false,
                render: value => String(value),
            },
        ],
    });

    const renderHero = () => {
        const hero = document.createElement('div');
        const refs = TmPageHero.mount(hero, {
            slots: {
                title: 'Quick Match',
                side: state.queue.active ? `
                    <div class="tmvu-qm-finding">
                        <div class="tmvu-qm-particle"></div>
                        <div class="tmvu-qm-particle"></div>
                        <div class="tmvu-qm-particle"></div>
                        <div class="tmvu-qm-particle"></div>
                        <div class="tmvu-qm-particle"></div>
                        <div class="tmvu-qm-particle"></div>
                        <div class="tmvu-qm-particle"></div>
                        <div class="tmvu-qm-finding-content">
                            <div class="tmvu-qm-finding-label">Finding Match</div>
                            <div class="tmvu-qm-finding-timer" id="tmvu-qm-elapsed">${formatElapsed(state.queue.startedAt ? Date.now() - state.queue.startedAt : 0)}</div>
                        </div>
                    </div>
                ` : `
                    ${metricHtml({ label: state.activeTab === 'ranked' ? 'Play Ranked' : 'Cost', value: escapeHtml(state.costCopy), layout: 'card', tone: 'panel', size: 'lg' })}
                    ${state.activeTab === 'ranked' ? '<div class="tmvu-qm-note-actions" data-qm-hero-play></div>' : ''}
                `,
                footer: state.notice ? TmUI.notice(state.notice, { tone: 'warm' }) : '',
            },
        });

        if (state.activeTab === 'ranked') {
            refs.hero?.querySelector('[data-qm-hero-play]')?.appendChild(TmUI.button({
                label: state.queue.active ? 'Queue Active' : 'Play Ranked',
                color: 'primary',
                size: 'sm',
                block: true,
                disabled: state.queue.active,
                onClick: startRanked,
            }));
        }

        return hero.firstElementChild || hero;
    };

    const mountRankedContent = (container) => {
        const topCard = document.createElement('div');
        const topRefs = TmSectionCard.mount(topCard, {
            title: 'Ranked Ladder',
            icon: '🏁',
            titleMode: 'body',
            cardVariant: 'flatpanel',
            hostClass: 'tmvu-qm-card-host',
            bodyClass: 'tmvu-qm-card-body tmu-stack tmu-stack-density-regular',
        });

        const subtabs = TmUI.tabs({
            items: RANKED_MODES.map(mode => ({ key: mode.key, label: mode.label })),
            active: state.rankedMode,
            onChange: key => loadRankings(key),
            stretch: true,
        });
        subtabs.classList.add('tmvu-qm-subtabs');
        topRefs.body.appendChild(subtabs);

        topRefs.titleBar?.appendChild(TmUI.button({
            label: 'Complete Standings',
            color: 'secondary',
            size: 'sm',
            onClick: () => { window.location.href = state.completeStandingsHref; },
        }));

        if (state.rankedLoading) {
            topRefs.body.appendChild(TmUI.loading('Loading ranked ladder...'));
        } else if (state.rankedRows.length) {
            topRefs.body.appendChild(buildRankingsTable());
        } else {
            topRefs.body.insertAdjacentHTML('beforeend', TmUI.empty('No ranked ladder data returned for this view.'));
        }

        const fixtureContainer = document.createElement('div');
        fixtureContainer.className = 'tmvu-qm-fixtures-bare';
        fixtureContainer.innerHTML = TmUI.loading('Loading matches...');
        TmClubFixturesStyles.inject();

        TmQuickmatchService.fetchLatestMatches().then(html => {
            const byMonth = parseQmLatestMatchesHtml(html);
            if (!byMonth) {
                fixtureContainer.innerHTML = TmUI.empty('No recent quickmatch games found.');
                return;
            }
            const monthKeys = Object.keys(byMonth).sort();
            let activeMonthKey = monthKeys[monthKeys.length - 1];

            const renderMonth = () => {
                const { matches } = byMonth[activeMonthKey];
                const groups = TmFixturesList.fromMatches(matches);
                fixtureContainer.innerHTML = '';
                if (monthKeys.length > 1) {
                    const tabs = TmUI.tabs({
                        items: monthKeys.map(k => ({ key: k, label: byMonth[k].label })),
                        active: activeMonthKey,
                        onChange: key => { activeMonthKey = key; renderMonth(); },
                        stretch: true,
                    });
                    fixtureContainer.appendChild(tabs);
                }
                const listWrap = document.createElement('div');
                listWrap.className = 'tmcf-month-content';
                listWrap.innerHTML = TmFixturesList.render(groups, { linkUpcoming: true });
                fixtureContainer.appendChild(listWrap);
                TmFixturesList.bindHover(listWrap);
                TmFixturesList.bindRowNav(listWrap);
            };

            renderMonth();
        });

        const layout = document.createElement('div');
        layout.className = 'tmvu-qm-layout';

        const left = document.createElement('div');
        left.className = 'tmvu-qm-col tmu-page-section-stack';
        left.appendChild(topCard);

        const right = document.createElement('aside');
        right.className = 'tmvu-qm-side tmu-page-section-stack';
        right.appendChild(fixtureContainer);

        layout.append(left, right);
        container.appendChild(layout);
    };

    const mountShowmatchContent = (container) => {
        const activeGroup = state.showGroups.find(group => group.key === state.activeShowGroup) || state.showGroups[0] || null;

        const card = document.createElement('div');
        const refs = TmSectionCard.mount(card, {
            title: 'Showmatch',
            icon: '🎭',
            titleMode: 'body',
            cardVariant: 'flatpanel',
            hostClass: 'tmvu-qm-card-host',
            bodyClass: 'tmvu-qm-card-body tmu-stack tmu-stack-density-regular',
        });

        if (!activeGroup) {
            refs.body.insertAdjacentHTML('beforeend', TmUI.empty('No showmatch opponents were found in the source page.'));
            container.appendChild(card);
            return;
        }

        const groupTabs = TmUI.tabs({
            items: state.showGroups.map(group => ({ key: group.key, label: group.label })),
            active: activeGroup.key,
            onChange: key => {
                state.activeShowGroup = key;
                queueRender();
            },
        });
        groupTabs.classList.add('tmvu-qm-show-group-tabs');
        refs.body.appendChild(groupTabs);
        refs.body.insertAdjacentHTML('beforeend', TmUI.notice('Select one of the curated clubs below. TM will queue a showmatch immediately against that opponent.', { tone: 'warm' }));

        const list = document.createElement('div');
        list.className = 'tmvu-qm-show-list';
        list.onclick = (event) => {
            const optionNode = event.target.closest('.tmvu-qm-show-option[data-show-option-id]');
            if (!optionNode || !list.contains(optionNode) || optionNode.classList.contains('is-disabled')) return;
            state.showSelections[activeGroup.key] = optionNode.dataset.showOptionId;
            queueRender();
        };
        activeGroup.options.forEach(option => {
            const node = document.createElement('div');
            node.className = `tmvu-qm-show-option${state.showSelections[activeGroup.key] === option.id ? ' is-selected' : ''}${option.disabled ? ' is-disabled' : ''}`;
            node.dataset.showOptionId = option.id;
            node.innerHTML = `
                <span class="tmvu-qm-radio"></span>
                <div class="tmvu-qm-show-copy">${option.labelHtml}</div>
            `;
            list.appendChild(node);
        });
        refs.body.appendChild(list);

        const footer = document.createElement('div');
        footer.className = 'tmvu-qm-show-footer';
        footer.appendChild(TmUI.button({
            label: state.queue.active ? 'Queue Active' : 'Play Showmatch',
            color: 'primary',
            size: 'sm',
            disabled: state.queue.active || !state.showSelections[activeGroup.key],
            onClick: startShowmatch,
        }));
        refs.body.appendChild(footer);

        container.appendChild(card);
    };

    const mountFriendlyContent = (container) => {
        const card = document.createElement('div');
        const refs = TmSectionCard.mount(card, {
            title: 'Challenge Friend',
            icon: '🤝',
            titleMode: 'body',
            cardVariant: 'flatpanel',
            hostClass: 'tmvu-qm-friendly-host',
            bodyClass: 'tmvu-qm-friendly-body tmu-stack tmu-stack-density-regular',
            bodyHtml: `<div id="tmvu-qm-friendly-native">${state.friendlyMarkup}</div>`,
        });

        const body = refs.body || card;
        const friendlyRoot = body.querySelector('#tmvu-qm-friendly-native');
        const searchInput = friendlyRoot?.querySelector('#suggest_clubs_pop');
        const challengeButton = friendlyRoot?.querySelector('#challenge_button');
        const challengeTarget = friendlyRoot?.querySelector('#club_to_challenge');

        if (searchInput && challengeTarget) {
            const searchLabel = friendlyRoot.querySelector('label[for="suggest_clubs_pop"]');
            const searchContent = friendlyRoot.querySelector('#suggest_clubs_content');
            const searchSettings = friendlyRoot.querySelector('#suggest_clubs_pop_settings');
            const searchHref = friendlyRoot.querySelector('#suggest_clubs_pop_href');
            const challengeButtonWrap = challengeButton?.parentElement || null;
            const composer = document.createElement('div');
            composer.className = 'tmvu-qm-friendly-composer';
            composer.innerHTML = `
                <div class="tmvu-qm-friendly-search-row">
                    <div class="tmvu-qm-friendly-label">Find Club</div>
                </div>
                <div class="tmvu-qm-friendly-selected"></div>
            `;

            searchLabel?.remove();
            const enhancedInput = TmUI.input({
                id: searchInput.id || 'suggest_clubs_pop',
                name: searchInput.name || '',
                type: searchInput.type || 'text',
                value: searchInput.value || '',
                placeholder: 'Type club name or id',
                size: 'full',
                cls: 'tmvu-qm-friendly-search',
                autocomplete: searchInput.autocomplete || 'off',
            });
            Array.from(searchInput.attributes).forEach(attr => {
                if (['id', 'name', 'type', 'value', 'placeholder', 'class', 'autocomplete', 'style'].includes(attr.name)) return;
                enhancedInput.setAttribute(attr.name, attr.value);
            });
            searchInput.replaceWith(enhancedInput);

            const row = composer.querySelector('.tmvu-qm-friendly-search-row');
            row?.appendChild(enhancedInput);
            if (searchHref) row?.appendChild(searchHref);
            if (searchSettings) row?.appendChild(searchSettings);

            const selected = composer.querySelector('.tmvu-qm-friendly-selected');
            selected?.appendChild(challengeTarget);

            if (challengeButton) {
                const sendButton = TmUI.button({
                    label: 'Send Challenge',
                    color: 'primary',
                    size: 'sm',
                    onClick: () => {
                        if (typeof window.challenge_send === 'function') {
                            window.challenge_send();
                            return;
                        }
                        challengeButton.click();
                    },
                });
                selected?.appendChild(sendButton);
            }

            if (searchContent) composer.appendChild(searchContent);
            challengeButtonWrap?.replaceWith(composer);
        }

        container.appendChild(card);
    };

    const mountTabContent = (container) => {
        if (state.activeTab === 'ranked') {
            mountRankedContent(container);
            return;
        }
        if (state.activeTab === 'show') {
            mountShowmatchContent(container);
            return;
        }
        mountFriendlyContent(container);
    };

    const renderPage = () => {
        if (!mainColumn) return;

        mainColumn.innerHTML = '';
        mainColumn.appendChild(renderHero());

        const tabs = TmUI.tabs({
            items: [
                { key: 'ranked', label: 'Ranked Match' },
                { key: 'show', label: 'Showmatch' },
                { key: 'friendly', label: 'Challenge Friend' },
            ],
            active: state.activeTab,
            onChange: setActiveTab,
        });
        tabs.classList.add('tmvu-qm-subtabs');
        mainColumn.appendChild(tabs);

        const content = document.createElement('div');
        mountTabContent(content);
        mainColumn.appendChild(content);
    };

    injectStyles();

    main.classList.add('tmvu-qm-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');
    main.innerHTML = '<section class="tmvu-qm-main tmu-page-section-stack"></section>';

    if (state.menuItems.length) {
        TmSideMenu.mount(main, {
            id: 'tmvu-qm-side-menu',
            className: 'tmu-page-sidebar-stack',
            items: state.menuItems,
            currentHref: state.menuItems.find(item => item.isSelected)?.href || '/quickmatch/',
        });
    }

    mainColumn = main.querySelector('.tmvu-qm-main');
    if (!mainColumn) return;

    mainColumn.innerHTML = TmUI.loading('Loading quickmatch...');

    Promise.all([
        loadRankings(state.rankedMode),
        checkExistingQueue(),
    ]).then(() => {
        state.activeTab = currentHashTab();
        renderPage();
    }).catch(error => {
        mainColumn.innerHTML = TmUI.error(error?.message || 'Failed to load quickmatch page.');
    });
})();