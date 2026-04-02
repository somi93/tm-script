import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
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
    const trophyIcon = (rank) => {
        if (rank === 1) return '<img src="/pics/trophy_qm_gold_mini.png" alt="1">';
        if (rank === 2) return '<img src="/pics/trophy_qm_silver_mini.png" alt="2">';
        if (rank === 3) return '<img src="/pics/trophy_qm_bronze_mini.png" alt="3">';
        return '';
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

    const parseLatestMatches = () => Array.from(sourceRoot.querySelectorAll('#match_type_ranked table.zebra tr')).map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length < 4) return null;

        const clubAnchors = cells.slice(1, 3).map(cell => cell.querySelector('a[club_link]'));
        const matchLink = cells[3]?.querySelector('a.match_link');
        if (!matchLink || clubAnchors.some(anchor => !anchor)) return null;

        const matchId = (matchLink.getAttribute('href') || '').match(/\/matches\/(\d+)\//)?.[1] || '';
        return {
            date: cleanText(cells[0].textContent),
            home: {
                id: clubAnchors[0]?.getAttribute('club_link') || '',
                name: cleanText(clubAnchors[0]?.textContent),
                href: clubAnchors[0]?.getAttribute('href') || '#',
            },
            away: {
                id: clubAnchors[1]?.getAttribute('club_link') || '',
                name: cleanText(clubAnchors[1]?.textContent),
                href: clubAnchors[1]?.getAttribute('href') || '#',
            },
            scoreText: cleanText(matchLink.textContent),
            scoreHref: matchLink.getAttribute('href') || '#',
            matchId,
        };
    }).filter(Boolean);

    const parseLatestMatchesHref = () => sourceRoot.querySelector('#match_type_ranked a.arrow_right[href*="/quickmatch/stats/"]')?.getAttribute('href') || '/quickmatch/stats/';
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

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        injectTmPageLayoutStyles();

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-qm-hero-side {
                min-width: 190px;
                display: grid;
                gap: 10px;
            }

            .tmvu-qm-hero-card {
                grid-template-columns: minmax(0, 1fr) minmax(190px, .38fr);
                gap: 16px;
                padding: 18px 20px;
                background:
                    radial-gradient(circle at top left, var(--tmu-success-fill-soft), transparent 34%),
                    linear-gradient(140deg, var(--tmu-surface-card), var(--tmu-surface-dark-muted));
                border: 1px solid var(--tmu-border-soft-alpha-mid);
                box-shadow: 0 12px 28px var(--tmu-shadow-elev);
            }

            .tmvu-qm-note,
            .tmvu-qm-queue {
                padding: 10px 12px;
                border-radius: 12px;
                border: 1px solid var(--tmu-border-soft-alpha-mid);
                background: var(--tmu-highlight-fill);
            }

            .tmvu-qm-note .tmvu-qm-side-metric,
            .tmvu-qm-queue .tmvu-qm-side-metric {
                padding: 0;
                background: transparent;
                border: 0;
                box-shadow: none;
            }

            .tmvu-qm-note .tmvu-qm-side-metric .tmu-metric-value,
            .tmvu-qm-queue .tmvu-qm-side-metric .tmu-metric-value {
                font-size: 20px;
                line-height: 1.1;
            }

            .tmvu-qm-queue .tmvu-qm-side-metric .tmu-metric-value {
                font-size: 14px;
                font-weight: 800;
            }

            .tmvu-qm-note-actions {
                margin-top: 10px;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .tmvu-qm-toolbar,
            .tmvu-qm-subtabs,
            .tmvu-qm-show-group-tabs,
            .tmvu-qm-card-actions,
            .tmvu-qm-show-footer {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-items: center;
            }

            .tmvu-qm-toolbar {
                justify-content: space-between;
            }

            .tmvu-qm-layout {
                display: grid;
                grid-template-columns: minmax(0, 1.35fr) minmax(320px, .85fr);
                gap: 16px;
                align-items: start;
            }

            .tmvu-qm-ranked-table .tmvu-qm-rank-me td {
                background: var(--tmu-success-fill-faint);
                color: var(--tmu-text-inverse);
                font-weight: 800;
            }

            .tmvu-qm-rank-cell {
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }

            .tmvu-qm-rank-icon img {
                width: 16px;
                height: 16px;
                object-fit: contain;
            }

            .tmvu-qm-flag-fallback {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 20px;
                height: 14px;
                padding: 0 4px;
                border-radius: 3px;
                background: var(--tmu-border-contrast);
                color: var(--tmu-text-strong);
                font-size: 9px;
                font-weight: 800;
            }

            .tmvu-qm-magnify {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                border-radius: 999px;
                background: var(--tmu-surface-accent-soft);
                color: var(--tmu-text-main);
                text-decoration: none;
            }

            .tmvu-qm-magnify:hover {
                color: var(--tmu-text-inverse);
                background: var(--tmu-success-fill-hover);
            }

            .tmvu-qm-match-row {
                display: grid;
                grid-template-columns: 62px minmax(0, 1fr) auto minmax(0, 1fr);
                gap: 10px;
                align-items: center;
                padding: 10px 12px;
                border-radius: 10px;
                border: 1px solid var(--tmu-border-soft-alpha);
                background: var(--tmu-surface-dark-mid);
            }

            .tmvu-qm-match-date {
                color: var(--tmu-text-muted);
                font-size: 11px;
                font-weight: 700;
            }

            .tmvu-qm-match-team {
                min-width: 0;
                color: var(--tmu-text-main);
                font-size: 12px;
            }

            .tmvu-qm-match-team.home {
                text-align: right;
            }

            .tmvu-qm-match-team a,
            .tmvu-qm-show-option a,
            .tmvu-qm-friendly-body a {
                color: var(--tmu-text-strong);
                text-decoration: none;
            }

            .tmvu-qm-match-team a:hover,
            .tmvu-qm-show-option a:hover,
            .tmvu-qm-friendly-body a:hover {
                text-decoration: underline;
            }

            .tmvu-qm-match-score {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 58px;
                min-height: 28px;
                padding: 0 10px;
                border-radius: 999px;
                background: var(--tmu-surface-accent-soft);
                color: var(--tmu-text-strong);
                font-size: 13px;
                font-weight: 800;
                text-decoration: none;
            }

            .tmvu-qm-show-list {
                display: grid;
                gap: 10px;
            }

            .tmvu-qm-show-option {
                display: grid;
                grid-template-columns: auto minmax(0, 1fr);
                gap: 10px;
                align-items: start;
                padding: 10px 12px;
                border-radius: 10px;
                background: var(--tmu-surface-dark-muted);
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
                margin-top: 2px;
                border-radius: 999px;
                border: 2px solid var(--tmu-text-muted);
                position: relative;
                flex: 0 0 auto;
            }

            .tmvu-qm-show-option.is-selected .tmvu-qm-radio::after {
                content: '';
                position: absolute;
                inset: 3px;
                border-radius: 999px;
                background: var(--tmu-accent);
            }

            .tmvu-qm-show-copy {
                color: var(--tmu-text-main);
                font-size: 12px;
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
                font-size: 15px;
                margin: 0 0 8px;
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
                gap: 12px;
                padding: 12px;
                border-radius: 12px;
                background: var(--tmu-surface-dark-muted);
                border: 1px solid var(--tmu-border-soft-alpha);
            }

            .tmvu-qm-friendly-search-row {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                align-items: center;
            }

            .tmvu-qm-friendly-label {
                color: var(--tmu-text-panel-label);
                font-size: 10px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-qm-friendly-search.tmu-input {
                flex: 1 1 260px;
                min-width: 220px;
                min-height: 38px;
                padding: 0 12px;
                border-radius: 10px;
                border-color: var(--tmu-border-soft-alpha-strong);
                background: var(--tmu-surface-input-dark);
                font-size: 12px;
                font-weight: 700;
            }

            .tmvu-qm-friendly-selected {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                padding: 10px 12px;
                border-radius: 10px;
                background: var(--tmu-surface-dark-muted);
                border: 1px solid var(--tmu-border-soft-alpha);
            }

            .tmvu-qm-friendly-selected #club_to_challenge {
                color: var(--tmu-text-strong);
                font-size: 13px;
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

                .tmvu-qm-hero-card {
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
        latestMatches: parseLatestMatches(),
        latestMatchesHref: parseLatestMatchesHref(),
        completeStandingsHref: parseCompleteStandingsHref(),
        showGroups,
        activeShowGroup: showGroups[0]?.key || '',
        showSelections,
        notice: '',
        queue: {
            active: false,
            text: '',
            type: '',
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
            queuePollTimer = window.setTimeout(poll, 3000);
        };
        queuePollTimer = window.setTimeout(poll, 3000);
    };

    const applyQueueState = (data, fallbackType = '') => {
        if ((data?.in_queue === true) || Number(data?.match_id) > 0) {
            state.queue.active = true;
            state.queue.type = fallbackType || state.queue.type || '';
            state.queue.text = cleanText(data?.text || 'Searching for a match...');
            queueRender();
            if (Number(data?.match_id) > 0) {
                window.location.href = `/matches/${data.match_id}/`;
                return true;
            }
            startQueuePolling();
            return true;
        }
        state.queue.active = false;
        state.queue.text = '';
        stopQueuePolling();
        return false;
    };

    const loadRankings = async (mode = state.rankedMode) => {
        state.rankedMode = mode;
        state.rankedLoading = true;
        queueRender();
        const data = await TmQuickmatchService.fetchRankings(mode);
        const rankingRows = Array.isArray(data?.rankings)
            ? data.rankings
            : Object.entries(data?.rankings || {})
                .sort((left, right) => Number(left[0]) - Number(right[0]))
                .map(([, row]) => row);

        state.rankedRows = rankingRows.length
            ? rankingRows.filter(Boolean).map((row, index) => ({
                rank: index + 1,
                rating: Number(row.rating) || 0,
                division: cleanText(row.division),
                clubId: String(row.club_id || ''),
                clubLinkHtml: row.club_link || escapeHtml(cleanText(row.club_name || 'Club')),
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
        const data = await TmQuickmatchService.queue('ranked');
        if (!applyQueueState(data, 'ranked')) {
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
                render: (value, row) => `<span class="tmvu-qm-rank-cell"><span class="tmvu-qm-rank-icon">${trophyIcon(row.rank)}</span><span>${row.rank}</span></span>`,
            },
            {
                key: 'rating',
                label: 'Rating',
                align: 'r',
                sortable: false,
                render: value => String(value),
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
                key: 'magnify',
                label: '',
                align: 'c',
                sortable: false,
                render: (_, row) => row.clubId ? `<a class="tmvu-qm-magnify" href="/quickmatch/stats/${row.clubId}/" title="Open quickmatch stats">⌕</a>` : '',
            },
        ],
    });

    const renderHero = () => {
        const hero = document.createElement('div');
        const refs = TmHeroCard.mount(hero, {
            heroClass: 'tmvu-qm-hero-card',
            sideClass: 'tmvu-qm-hero-side',
            slots: {
                title: 'Quick Match',
                side: `
                    <div class="tmvu-qm-note">
                        ${metricHtml({ label: state.activeTab === 'ranked' ? 'Play Ranked' : 'Cost', value: escapeHtml(state.costCopy), tone: 'overlay', size: 'xl', cls: 'tmvu-qm-side-metric' })}
                        ${state.activeTab === 'ranked' ? '<div class="tmvu-qm-note-actions" data-qm-hero-play></div>' : ''}
                    </div>
                    ${state.queue.active ? `
                        <div class="tmvu-qm-queue">
                            ${metricHtml({ label: 'In Queue', value: escapeHtml(state.queue.text || 'Searching for a match...'), tone: 'overlay', size: 'md', cls: 'tmvu-qm-side-metric' })}
                        </div>
                    ` : ''}
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

    const renderLatestMatches = () => state.latestMatches.length ? `
        <div class="tmvu-qm-match-list tmu-stack tmu-stack-density-tight">
            ${state.latestMatches.map(match => `
                <div class="tmvu-qm-match-row">
                    <div class="tmvu-qm-match-date">${escapeHtml(match.date)}</div>
                    <div class="tmvu-qm-match-team home"><a href="${match.home.href}">${escapeHtml(match.home.name)}</a></div>
                    <a class="tmvu-qm-match-score" href="${match.scoreHref}">${escapeHtml(match.scoreText)}</a>
                    <div class="tmvu-qm-match-team"><a href="${match.away.href}">${escapeHtml(match.away.name)}</a></div>
                </div>
            `).join('')}
        </div>
    ` : TmUI.empty('No recent quickmatch games were listed.');

    const mountRankedContent = (container) => {
        const topCard = document.createElement('div');
        const topRefs = TmSectionCard.mount(topCard, {
            title: 'Ranked Ladder',
            icon: '🏁',
            titleMode: 'body',
            cardVariant: 'soft',
            hostClass: 'tmvu-qm-card-host',
            bodyClass: 'tmvu-qm-card-body tmu-stack tmu-stack-density-regular',
        });

        const toolbar = document.createElement('div');
        toolbar.className = 'tmvu-qm-toolbar';

        const subtabs = TmUI.tabs({
            items: RANKED_MODES.map(mode => ({ key: mode.key, label: mode.label })),
            active: state.rankedMode,
            onChange: key => loadRankings(key),
        });
        subtabs.classList.add('tmvu-qm-subtabs');
        toolbar.appendChild(subtabs);

        const actions = document.createElement('div');
        actions.className = 'tmvu-qm-card-actions';
        actions.appendChild(TmUI.button({
            label: 'Complete Standings',
            color: 'secondary',
            size: 'sm',
            onClick: () => { window.location.href = state.completeStandingsHref; },
        }));
        toolbar.appendChild(actions);
        topRefs.body.appendChild(toolbar);

        if (state.rankedLoading) {
            topRefs.body.appendChild(TmUI.loading('Loading ranked ladder...'));
        } else if (state.rankedRows.length) {
            topRefs.body.appendChild(buildRankingsTable());
        } else {
            topRefs.body.insertAdjacentHTML('beforeend', TmUI.empty('No ranked ladder data returned for this view.'));
        }

        const sideCard = document.createElement('div');
        const sideRefs = TmSectionCard.mount(sideCard, {
            title: 'Latest Three',
            icon: '🕒',
            titleMode: 'body',
            cardVariant: 'soft',
            hostClass: 'tmvu-qm-side-host',
            bodyClass: 'tmvu-qm-side-body tmu-stack tmu-stack-density-regular',
            bodyHtml: `${renderLatestMatches()}<div class="tmvu-qm-card-actions"></div>`,
        });
        sideRefs.body.querySelector('.tmvu-qm-card-actions')?.appendChild(TmUI.button({
            label: 'All Games',
            color: 'secondary',
            size: 'sm',
            onClick: () => { window.location.href = state.latestMatchesHref; },
        }));

        const layout = document.createElement('div');
        layout.className = 'tmvu-qm-layout';

        const left = document.createElement('div');
        left.className = 'tmvu-qm-col tmu-page-section-stack';
        left.appendChild(topCard);

        const right = document.createElement('aside');
        right.className = 'tmvu-qm-side tmu-page-section-stack';
        right.appendChild(sideCard);

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
            cardVariant: 'soft',
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
            cardVariant: 'soft',
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