import { TmSideMenu } from '../components/shared/tm-side-menu.js';
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
        const matchLink = row.querySelector('a.match_link');
        const clubAnchors = row.querySelectorAll('a[club_link]');
        const cells = row.querySelectorAll('td');
        if (!matchLink || clubAnchors.length < 2 || cells.length < 4) return null;

        const matchId = (matchLink.getAttribute('href') || '').match(/\/matches\/(\d+)\//)?.[1] || '';
        return {
            date: cleanText(cells[0].textContent),
            home: {
                id: clubAnchors[0].getAttribute('club_link') || '',
                name: cleanText(clubAnchors[0].textContent),
                href: clubAnchors[0].getAttribute('href') || '#',
            },
            away: {
                id: clubAnchors[1].getAttribute('club_link') || '',
                name: cleanText(clubAnchors[1].textContent),
                href: clubAnchors[1].getAttribute('href') || '#',
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

    const parseFriendlyMarkup = () => sourceRoot.querySelector('#match_type_friendly')?.innerHTML || '<div class="tmvu-qm-empty">Challenge section was not available in the source page.</div>';

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-main.tmvu-qm-page {
                display: flex !important;
                gap: 16px;
                align-items: flex-start;
            }

            .tmvu-qm-main {
                flex: 1 1 auto;
                width: 0;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .tmvu-qm-hero {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                gap: 18px;
                padding: 20px;
                border-radius: 16px;
                background:
                    radial-gradient(circle at top left, rgba(255,205,84,.13), rgba(255,205,84,0) 34%),
                    linear-gradient(135deg, rgba(19,34,11,.96), rgba(10,18,6,.92));
                border: 1px solid rgba(90,126,42,.24);
                box-shadow: 0 12px 28px rgba(0,0,0,.16);
            }

            .tmvu-qm-title {
                color: #eef8e8;
                font-size: 30px;
                font-weight: 900;
                line-height: 1.02;
            }

            .tmvu-qm-copy {
                margin-top: 10px;
                color: #a2c089;
                font-size: 12px;
                line-height: 1.65;
                max-width: 74ch;
            }

            .tmvu-qm-kicker,
            .tmvu-qm-stat-label,
            .tmvu-qm-subtle-label {
                color: #7fa669;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-qm-hero-side {
                min-width: 190px;
                display: grid;
                gap: 10px;
            }

            .tmvu-qm-note,
            .tmvu-qm-queue {
                padding: 10px 12px;
                border-radius: 12px;
                border: 1px solid rgba(90,126,42,.2);
                background: rgba(255,205,84,.05);
            }

            .tmvu-qm-note-actions {
                margin-top: 10px;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .tmvu-qm-note-actions .tmu-btn {
                width: 100%;
                justify-content: center;
            }

            .tmvu-qm-note-value,
            .tmvu-qm-queue-text {
                margin-top: 4px;
                color: #eef8e8;
                font-size: 20px;
                font-weight: 900;
                line-height: 1.1;
            }

            .tmvu-qm-queue-text {
                font-size: 14px;
                font-weight: 800;
            }

            .tmvu-qm-summary {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 14px;
            }

            .tmvu-qm-stat {
                min-width: 110px;
                padding: 10px 12px;
                border-radius: 12px;
                background: rgba(12,24,9,.34);
                border: 1px solid rgba(90,126,42,.16);
            }

            .tmvu-qm-stat-value {
                margin-top: 4px;
                color: #eef8e8;
                font-size: 18px;
                font-weight: 900;
                line-height: 1;
            }

            .tmvu-qm-banner {
                padding: 10px 12px;
                border-radius: 12px;
                border: 1px solid rgba(90,126,42,.18);
                background: rgba(128,224,72,.06);
                color: #d6e8ca;
                font-size: 12px;
                line-height: 1.55;
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

            .tmvu-qm-col,
            .tmvu-qm-side {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .tmvu-qm-card-host .tmu-card,
            .tmvu-qm-side-host .tmu-card,
            .tmvu-qm-friendly-host .tmu-card {
                background: #16270f;
                border: 1px solid #28451d;
                border-radius: 12px;
                box-shadow: 0 0 9px #192a19;
            }

            .tmvu-qm-card-body,
            .tmvu-qm-side-body,
            .tmvu-qm-friendly-body {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .tmvu-qm-ranked-table .tmvu-qm-rank-me td {
                background: rgba(128,224,72,.08);
                color: #fff;
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
                background: rgba(255,255,255,.08);
                color: #eef8e8;
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
                background: rgba(42,74,28,.36);
                color: #c8e0b4;
                text-decoration: none;
            }

            .tmvu-qm-magnify:hover {
                color: #fff;
                background: rgba(108,192,64,.18);
            }

            .tmvu-qm-match-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .tmvu-qm-match-row {
                display: grid;
                grid-template-columns: 62px minmax(0, 1fr) auto minmax(0, 1fr);
                gap: 10px;
                align-items: center;
                padding: 10px 12px;
                border-radius: 10px;
                border: 1px solid rgba(90,126,42,.16);
                background: rgba(7,16,5,.26);
            }

            .tmvu-qm-match-date {
                color: #8aac72;
                font-size: 11px;
                font-weight: 700;
            }

            .tmvu-qm-match-team {
                min-width: 0;
                color: #d7ebc9;
                font-size: 12px;
            }

            .tmvu-qm-match-team.home {
                text-align: right;
            }

            .tmvu-qm-match-team a,
            .tmvu-qm-show-option a,
            .tmvu-qm-friendly-body a {
                color: #eef8e8;
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
                background: rgba(42,74,28,.36);
                color: #eef8e8;
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
                background: rgba(7,16,5,.28);
                border: 1px solid rgba(90,126,42,.16);
                cursor: pointer;
            }

            .tmvu-qm-show-option.is-selected {
                background: rgba(108,192,64,.12);
                border-color: rgba(108,192,64,.3);
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
                border: 2px solid rgba(138,172,114,.75);
                position: relative;
                flex: 0 0 auto;
            }

            .tmvu-qm-show-option.is-selected .tmvu-qm-radio::after {
                content: '';
                position: absolute;
                inset: 3px;
                border-radius: 999px;
                background: #80e048;
            }

            .tmvu-qm-show-copy {
                color: #d7ebc9;
                font-size: 12px;
                line-height: 1.6;
            }

            .tmvu-qm-show-copy .subtle {
                color: #8aac72;
            }

            .tmvu-qm-empty {
                color: #8aac72;
                font-size: 12px;
                line-height: 1.6;
            }

            .tmvu-qm-friendly-body .std,
            .tmvu-qm-friendly-body #match_type_friendly,
            .tmvu-qm-friendly-body .match_type {
                display: block !important;
            }

            .tmvu-qm-friendly-body h3 {
                color: #eef8e8;
                font-size: 15px;
                margin: 0 0 8px;
            }

            .tmvu-qm-friendly-body p {
                color: #a2c089;
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
                background: rgba(7,16,5,.28);
                border: 1px solid rgba(90,126,42,.16);
            }

            .tmvu-qm-friendly-search-row {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                align-items: center;
            }

            .tmvu-qm-friendly-label {
                color: #7fa669;
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
                border-color: rgba(90,126,42,.24);
                background: rgba(12,24,9,.52);
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
                background: rgba(12,24,9,.42);
                border: 1px solid rgba(90,126,42,.16);
            }

            .tmvu-qm-friendly-selected #club_to_challenge {
                color: #eef8e8;
                font-size: 13px;
                font-weight: 700;
            }

            .tmvu-qm-friendly-selected #club_to_challenge .italic.subtle {
                color: #8aac72;
                font-style: normal;
                font-weight: 600;
            }

            .tmvu-qm-friendly-native-btn {
                display: none !important;
            }

            .tmvu-qm-friendly-send {
                min-width: 180px;
                justify-content: center;
            }

            @media (max-width: 1120px) {
                .tmvu-qm-layout {
                    grid-template-columns: 1fr;
                }

                .tmvu-qm-hero {
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
        const hero = document.createElement('section');
        hero.className = 'tmvu-qm-hero';
        hero.innerHTML = `
            <div>
                <div class="tmvu-qm-title">Quick Match</div>
                ${state.notice ? `<div class="tmvu-qm-banner">${escapeHtml(state.notice)}</div>` : ''}
            </div>
            <div class="tmvu-qm-hero-side">
                <div class="tmvu-qm-note">
                    <div class="tmvu-qm-kicker">${state.activeTab === 'ranked' ? 'Play Ranked' : 'Cost'}</div>
                    <div class="tmvu-qm-note-value">${escapeHtml(state.costCopy)}</div>
                    ${state.activeTab === 'ranked' ? '<div class="tmvu-qm-note-actions" data-qm-hero-play></div>' : ''}
                </div>
                ${state.queue.active ? `
                    <div class="tmvu-qm-queue">
                        <div class="tmvu-qm-kicker">In Queue</div>
                        <div class="tmvu-qm-queue-text">${escapeHtml(state.queue.text || 'Searching for a match...')}</div>
                    </div>
                ` : ''}
            </div>
        `;

        if (state.activeTab === 'ranked') {
            hero.querySelector('[data-qm-hero-play]')?.appendChild(TmUI.button({
                label: state.queue.active ? 'Queue Active' : 'Play Ranked',
                variant: 'primary',
                size: 'sm',
                disabled: state.queue.active,
                onClick: startRanked,
            }));
        }

        return hero;
    };

    const renderLatestMatches = () => state.latestMatches.length ? `
        <div class="tmvu-qm-match-list">
            ${state.latestMatches.map(match => `
                <div class="tmvu-qm-match-row">
                    <div class="tmvu-qm-match-date">${escapeHtml(match.date)}</div>
                    <div class="tmvu-qm-match-team home"><a href="${match.home.href}">${escapeHtml(match.home.name)}</a></div>
                    <a class="tmvu-qm-match-score" href="${match.scoreHref}">${escapeHtml(match.scoreText)}</a>
                    <div class="tmvu-qm-match-team"><a href="${match.away.href}">${escapeHtml(match.away.name)}</a></div>
                </div>
            `).join('')}
        </div>
    ` : '<div class="tmvu-qm-empty">No recent quickmatch games were listed.</div>';

    const mountRankedContent = (container) => {
        const topCard = document.createElement('div');
        const topRefs = TmSectionCard.mount(topCard, {
            title: 'Ranked Ladder',
            icon: '🏁',
            titleMode: 'body',
            hostClass: 'tmvu-qm-card-host',
            bodyClass: 'tmvu-qm-card-body',
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
            variant: 'secondary',
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
            topRefs.body.insertAdjacentHTML('beforeend', '<div class="tmvu-qm-empty">No ranked ladder data returned for this view.</div>');
        }

        const sideCard = document.createElement('div');
        const sideRefs = TmSectionCard.mount(sideCard, {
            title: 'Latest Three',
            icon: '🕒',
            titleMode: 'body',
            hostClass: 'tmvu-qm-side-host',
            bodyClass: 'tmvu-qm-side-body',
            bodyHtml: `${renderLatestMatches()}<div class="tmvu-qm-card-actions"></div>`,
        });
        sideRefs.body.querySelector('.tmvu-qm-card-actions')?.appendChild(TmUI.button({
            label: 'All Games',
            variant: 'secondary',
            size: 'sm',
            onClick: () => { window.location.href = state.latestMatchesHref; },
        }));

        const layout = document.createElement('div');
        layout.className = 'tmvu-qm-layout';

        const left = document.createElement('div');
        left.className = 'tmvu-qm-col';
        left.appendChild(topCard);

        const right = document.createElement('aside');
        right.className = 'tmvu-qm-side';
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
            hostClass: 'tmvu-qm-card-host',
            bodyClass: 'tmvu-qm-card-body',
        });

        if (!activeGroup) {
            refs.body.insertAdjacentHTML('beforeend', '<div class="tmvu-qm-empty">No showmatch opponents were found in the source page.</div>');
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
        refs.body.insertAdjacentHTML('beforeend', `<div class="tmvu-qm-banner">Select one of the curated clubs below. TM will queue a showmatch immediately against that opponent.</div>`);

        const list = document.createElement('div');
        list.className = 'tmvu-qm-show-list';
        activeGroup.options.forEach(option => {
            const node = document.createElement('div');
            node.className = `tmvu-qm-show-option${state.showSelections[activeGroup.key] === option.id ? ' is-selected' : ''}${option.disabled ? ' is-disabled' : ''}`;
            node.innerHTML = `
                <span class="tmvu-qm-radio"></span>
                <div class="tmvu-qm-show-copy">${option.labelHtml}</div>
            `;
            if (!option.disabled) {
                node.addEventListener('click', () => {
                    state.showSelections[activeGroup.key] = option.id;
                    queueRender();
                });
            }
            list.appendChild(node);
        });
        refs.body.appendChild(list);

        const footer = document.createElement('div');
        footer.className = 'tmvu-qm-show-footer';
        footer.appendChild(TmUI.button({
            label: state.queue.active ? 'Queue Active' : 'Play Showmatch',
            variant: 'primary',
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
            hostClass: 'tmvu-qm-friendly-host',
            bodyClass: 'tmvu-qm-friendly-body',
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
                challengeButton.classList.add('tmvu-qm-friendly-native-btn');
                const sendButton = TmUI.button({
                    label: 'Send Challenge',
                    variant: 'primary',
                    size: 'sm',
                    cls: 'tmvu-qm-friendly-send',
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

    main.classList.add('tmvu-qm-page');
    main.innerHTML = '<section class="tmvu-qm-main"></section>';

    if (state.menuItems.length) {
        TmSideMenu.mount(main, {
            id: 'tmvu-qm-side-menu',
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