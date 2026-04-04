import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmPageHero } from '../components/shared/tm-page-hero.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmTable } from '../components/shared/tm-table.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmPosition } from '../lib/tm-position.js';
import { TmTrainingMod } from '../components/player/tm-training-mod.js';
import { PlayerTrainingDots } from '../components/shared/tm-training-dots.js';
import { TmClubService } from '../services/club.js';
import { TmTrainingService } from '../services/training.js';

(function () {
    'use strict';

    if (!/^\/training\/?$/i.test(window.location.pathname)) return;

    const main = document.querySelector('.tmvu-main, .main_center');
    if (!main) return;

    const sourceRoot = main.cloneNode(true);
    const ownClubId = String(window.SESSION?.main_id || '').trim();
    const bTeamClubId = String(window.SESSION?.b_team || '').trim();
    if (!ownClubId) return;

    const STYLE_ID = 'tmvu-training-style';
    let mainColumn = null;
    let renderScheduled = false;

    const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const formatAge = (years, months) => `${Number(years) || 0}.${String(Number(months) || 0).padStart(2, '0')}`;
    const htmlOf = (node) => node?.outerHTML || '';
    const chipHtml = (opts) => htmlOf(TmUI.chip(opts));
    const metricHtml = (opts) => TmUI.metric(opts);
    const badgeHtml = (opts, tone = 'muted') => TmUI.badge({ size: 'md', shape: 'full', weight: 'bold', ...opts }, tone);
    const inputHtml = (opts) => htmlOf(TmUI.input({ tone: 'overlay', density: 'comfy', ...opts }));

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        injectTmPageLayoutStyles();

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-tr-copy {
                color: var(--tmu-text-main);
                font-size: var(--tmu-font-sm);
                line-height: 1.65;
                max-width: 50%;
            }

            .tmvu-tr-native-stash {
                position: absolute;
                left: -99999px;
                top: 0;
                width: 1px;
                height: 1px;
                overflow: hidden;
                opacity: 0;
                pointer-events: none;
            }

            .tmvu-tr-hero-side-stats {
                display: flex;
                flex-direction: row;
                gap: var(--tmu-space-md);
            }

            .tmvu-tr-kicker {
                color: var(--tmu-text-panel-label);
                font-size: var(--tmu-font-xs);
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-tr-toolbar {
                margin-top: var(--tmu-space-lg);
                display: flex;
                flex-wrap: wrap;
                gap: var(--tmu-space-md);
                align-items: center;
            }

            .tmvu-tr-search-slot {
                min-width: 240px;
                max-width: 400px;
                flex: 1 1 280px;
            }

            .tmvu-tr-content {
                display: grid;
                grid-template-columns: minmax(0, 1.45fr) minmax(340px, .9fr);
                gap: var(--tmu-space-lg);
                align-items: start;
            }

            .tmvu-tr-editor-col {
                position: sticky;
                top: var(--tmu-space-lg);
                align-self: start;
            }

            .tmvu-tr-table .tmvu-tr-row-selected td {
                background: var(--tmu-success-fill-faint);
            }

            .tmvu-tr-table .tmvu-tr-row-selected:hover td {
                background: var(--tmu-success-fill-soft);
            }

            .tmvu-tr-player-cell {
                display: flex;
                align-items: center;
                gap: var(--tmu-space-sm);
                min-width: 0;
            }

            .tmvu-tr-player-meta {
                min-width: 0;
            }

            .tmvu-tr-player-name {
                color: var(--tmu-text-strong);
                font-weight: 800;
                text-decoration: none;
            }

            .tmvu-tr-player-name:hover {
                text-decoration: underline;
            }

            .tmvu-tr-player-sub {
                margin-top: var(--tmu-space-xs);
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-xs);
            }

            .tmvu-tr-status {
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-xs);
                font-weight: 700;
            }

            .tmvu-tr-status.ok {
                color: var(--tmu-success);
            }

            .tmvu-tr-status.err {
                color: var(--tmu-danger);
            }

            .tmvu-tr-pb { width: 4px; padding: 0 !important; }
            .tmvu-tr-pb-inner { display: block; width: 3px; min-height: 16px; border-radius: var(--tmu-space-xs); }

            .tmvu-tr-editor-header {
                display: grid;
                gap: var(--tmu-space-sm);
                padding-bottom: var(--tmu-space-md);
                border-bottom: 1px solid var(--tmu-border-soft);
            }

            .tmvu-tr-editor-title {
                min-width: 0;
                display: grid;
                gap: var(--tmu-space-xs);
            }

            .tmvu-tr-editor-kicker {
                color: var(--tmu-text-panel-label);
                font-size: var(--tmu-font-2xs);
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-tr-editor-name {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-xl);
                font-weight: 900;
                line-height: 1.1;
                letter-spacing: -.03em;
                text-wrap: balance;
            }

            .tmvu-tr-editor-sub {
                display: flex;
                flex-wrap: wrap;
                gap: var(--tmu-space-sm);
                align-items: center;
                justify-content: flex-start;
            }

            .tmvu-tr-editor-sub .tmu-badge,
            .tmvu-tr-editor-sub .tmu-chip {
                flex: 0 0 auto;
            }

            .tmvu-tr-editor-body {
                display: grid;
                gap: var(--tmu-space-md);
            }

            @media (max-width: 900px) {
                .tmvu-tr-editor-header {
                    gap: var(--tmu-space-sm);
                }
            }

            .tmvu-tr-editor-grid {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: var(--tmu-space-sm);
            }

            .tmvu-tr-editor-grid .tmu-metric {
                min-width: 0;
            }


            @media (max-width: 1180px) {
                .tmvu-tr-content {
                    grid-template-columns: 1fr;
                }

                .tmvu-tr-editor-col {
                    position: static;
                }
            }
        `;

        document.head.appendChild(style);
    };

    const parseMenu = () => Array.from(sourceRoot.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
        if (node.tagName === 'HR') return [{ type: 'separator' }];
        if (node.tagName !== 'A') return [];
        const label = cleanText(node.textContent);
        return [{
            type: 'link',
            href: node.getAttribute('href') || '#',
            label,
            icon: /training/i.test(label) ? '🏋' : /player/i.test(label) ? '🧒' : /facilit/i.test(label) ? '🏟' : '•',
            isSelected: node.classList.contains('selected'),
        }];
    });

    const getPlayerPositions = (player) => String(player?.favposition || '')
        .split(',')
        .map(pos => String(pos || '').trim().toLowerCase())
        .filter(Boolean)
        .map(pos => {
            const entry = TmConst.POSITION_MAP[pos] || TmConst.POSITION_MAP[pos.replace(/[lrc]$/, '')];
            return {
                position: entry?.position || TmPosition.label(pos),
                color: entry?.color || 'var(--tmu-text-dim)',
                ordering: Number(entry?.ordering) || 999,
            };
        });

    const decoratePlayer = (player, clubId) => ({
        ...player,
        id: parseInt(player?.player_id || player?.id, 10) || 0,
        name: player?.player_name || player?.name || '',
        age: parseInt(player?.age, 10) || 0,
        months: parseInt(player?.month || player?.months, 10) || 0,
        favposition: String(player?.favposition || ''),
        club_id: clubId,
        positions: getPlayerPositions(player),
        trainingState: TmTrainingService.normalizeTrainingState(TmTrainingService.adaptSquadTraining(player)),
        trainingLoaded: true,
        trainingLoading: false,
        trainingError: '',
        saving: false,
    });

    const state = {
        players: [],
        query: '',
        notice: '',
        selectedPlayerId: '',
        loadingCount: 0,
        totalCount: 0,
    };

    const getFilteredPlayers = () => {
        const query = cleanText(state.query).toLowerCase();
        if (!query) return state.players;
        return state.players.filter(player => {
            const name = cleanText(player.name).toLowerCase();
            const pos = cleanText(player.favposition).toLowerCase();
            return name.includes(query) || pos.includes(query);
        });
    };

    const getSelectedPlayer = () => state.players.find(player => String(player.id) === String(state.selectedPlayerId)) || null;

    const queueRender = () => {
        if (renderScheduled) return;
        renderScheduled = true;
        window.setTimeout(() => {
            renderScheduled = false;
            renderPage();
        }, 0);
    };

    const updatePlayer = (playerId, updater) => {
        state.players = state.players.map(player => {
            if (String(player.id) !== String(playerId)) return player;
            return typeof updater === 'function' ? updater(player) : { ...player, ...updater };
        });
    };

    const setSelectedPlayer = (playerId) => {
        const next = state.players.find(player => String(player.id) === String(playerId));
        state.selectedPlayerId = next ? String(next.id) : '';
        queueRender();
    };

    const renderModeChip = (label, tone = 'overlay') => chipHtml({
        label: escapeHtml(label),
        tone,
        size: 'md',
        shape: 'full',
        uppercase: true,
    });

    const renderDots = (trainingState) => {
        if (trainingState.isGK) return renderModeChip('GK', 'success');
        if (!trainingState.customOn) return renderModeChip(trainingState.typeLabel, 'overlay');
        return PlayerTrainingDots.render(trainingState.teams.map(team => String(team.points)).join(''), 'lg');
    };

    const getPlayerSubtitle = (trainingState) => {
        if (trainingState?.isGK) return 'Automatic';
        if (trainingState?.customOn) return 'Custom allocation';
        return trainingState?.typeLabel || 'Unknown';
    };

    const renderHero = () => {
        const filtered = getFilteredPlayers();
        const customCount = state.players.filter(player => player.trainingState.customOn).length;
        const standardCount = state.players.filter(player => !player.trainingState.isGK && !player.trainingState.customOn).length;

        const hero = document.createElement('div');
        const refs = TmPageHero.mount(hero, {
            slots: {
                kicker: 'Squad',
                title: 'Training',
                main: `
                    <div class="tmvu-tr-copy">Training is read directly from squad data, including B team players when available. The table stays overview-first, while the editor on the right lets you update the selected player without leaving the page.</div>
                    <div class="tmvu-tr-toolbar">
                        <div class="tmvu-tr-search-slot">${inputHtml({
            type: 'search',
            size: 'full',
            grow: true,
            value: state.query,
            placeholder: 'Filter players by name or position',
            attrs: { 'data-tr-search': '' },
        })}</div>
                    </div>
                `,
                side: `
                    <div class="tmvu-tr-hero-side-stats">
                        ${metricHtml({ label: 'Custom', value: String(customCount), tone: 'overlay', size: 'md', align: 'center' })}
                        ${metricHtml({ label: 'Standard', value: String(standardCount), tone: 'overlay', size: 'md', align: 'center' })}
                    </div>
                `,
                footer: state.notice ? TmUI.notice(state.notice) : '',
            },
        });
        refs.hero?.querySelector('[data-tr-search]')?.addEventListener('input', (event) => {
            state.query = event.target.value || '';
            queueRender();
        });
        return hero.firstElementChild || hero;
    };

    const buildOverviewTable = () => {
        const table = TmTable.table({
            cls: 'tmvu-tr-table',
            items: getFilteredPlayers(),
            sortKey: 'pos',
            sortDir: -1,
            rowCls: (player) => String(player.id) === String(state.selectedPlayerId) ? 'tmvu-tr-row-selected' : '',
            onRowClick: (player) => setSelectedPlayer(player.id),
            headers: [
                {
                    key: '_bar', label: '', sortable: false, cls: 'tmvu-tr-pb', thCls: 'tmvu-tr-pb',
                    render: (_, player) => `<span class="tmvu-tr-pb-inner" style="background:${(player.positions || [])[0]?.color ?? 'var(--tmu-text-dim)'}"></span>`,
                },
                {
                    key: 'name',
                    label: 'Player',
                    render: (_, player) => `
                        <div class="tmvu-tr-player-cell">
                            <div class="tmvu-tr-player-meta">
                                <a class="tmvu-tr-player-name" href="/players/${player.id}/">${escapeHtml(player.name)}</a>
                                <div class="tmvu-tr-player-sub">${escapeHtml(getPlayerSubtitle(player.trainingState))}</div>
                            </div>
                        </div>
                    `,
                },
                {
                    key: 'pos',
                    label: 'Pos',
                    align: 'c',
                    sort: (a, b) => {
                        const aOrder = Math.max(...(a.positions || []).map(position => Number(position.ordering) || 0), Number.NEGATIVE_INFINITY);
                        const bOrder = Math.max(...(b.positions || []).map(position => Number(position.ordering) || 0), Number.NEGATIVE_INFINITY);
                        return aOrder - bOrder;
                    },
                    render: (_, player) => TmPosition.chip(player.positions?.length ? player.positions : [String(player.favposition || '').split(',')[0] || '']),
                },
                {
                    key: 'age',
                    label: 'Age',
                    align: 'r',
                    sort: (a, b) => (a.age * 12 + a.months) - (b.age * 12 + b.months),
                    render: (_, player) => formatAge(player.age, player.months),
                },
                {
                    key: 'mode',
                    label: 'Mode',
                    align: 'c',
                    sort: (a, b) => a.trainingState.modeLabel.localeCompare(b.trainingState.modeLabel),
                    render: (_, player) => renderModeChip(player.trainingState.modeLabel, 'overlay'),
                },
                {
                    key: 'alloc',
                    label: 'Allocation',
                    align: 'c',
                    sortable: false,
                    render: (_, player) => renderDots(player.trainingState),
                },
            ],
        });
        return table;
    };

    const mountOverview = (host) => {
        const refs = TmSectionCard.mount(host, {
            title: 'Squad Training Overview',
            icon: '🏋',
            titleMode: 'body',
            cardVariant: 'soft',
            hostClass: 'tmvu-tr-card-host',
            bodyClass: 'tmvu-tr-card-body tmu-stack tmu-stack-density-regular',
        });

        refs.body.appendChild(buildOverviewTable());
    };

    const mountEditor = (host) => {
        const player = getSelectedPlayer();
        const refs = TmSectionCard.mount(host, {
            title: 'Training Editor',
            icon: '🛠',
            titleMode: 'body',
            cardVariant: 'soft',
            hostClass: 'tmvu-tr-editor-host',
            bodyClass: 'tmvu-tr-editor-body tmu-stack tmu-stack-density-regular',
        });
        const body = refs.body || host;
        body.innerHTML = '';

        if (!player) {
            body.appendChild(TmUI.empty('Select a player from the overview to inspect or update training.'));
            return;
        }

        body.insertAdjacentHTML('beforeend', `
            <div class="tmvu-tr-editor-header">
                <div class="tmvu-tr-editor-title">
                    <div class="tmvu-tr-editor-kicker">Selected Player</div>
                    <div class="tmvu-tr-editor-name">${escapeHtml(player.name)}</div>
                    <div class="tmvu-tr-editor-sub">
                        <span>${TmPosition.chip(player.positions?.length ? player.positions : [String(player.favposition || '').split(',')[0] || ''])}</span>
                        ${badgeHtml({ label: 'Age', value: formatAge(player.age, player.months) }, 'muted')}
                    </div>
                </div>
            </div>
        `);

        const editorMount = document.createElement('div');
        body.appendChild(editorMount);

        TmTrainingMod.render(editorMount, TmTrainingService.adaptSquadTraining(player), {
            playerId: player.id,
            readOnly: false,
            onStateChange: (trainingState) => {
                updatePlayer(player.id, {
                    trainingState,
                    training: trainingState.currentType,
                    training_custom: trainingState.customOn ? trainingState.dots : '',
                    trainingLoaded: true,
                    trainingError: '',
                });
            },
        });
    };

    const renderPage = () => {
        if (!mainColumn) return;

        const activeElement = document.activeElement;
        const shouldRestoreSearchFocus = Boolean(activeElement?.matches?.('[data-tr-search]'));
        const searchSelectionStart = shouldRestoreSearchFocus ? activeElement.selectionStart : null;
        const searchSelectionEnd = shouldRestoreSearchFocus ? activeElement.selectionEnd : null;

        mainColumn.innerHTML = '';
        mainColumn.appendChild(renderHero());

        const content = document.createElement('div');
        content.className = 'tmvu-tr-content';

        const overviewHost = document.createElement('div');
        const editorHost = document.createElement('div');
        editorHost.className = 'tmvu-tr-editor-col';

        content.appendChild(overviewHost);
        content.appendChild(editorHost);
        mainColumn.appendChild(content);

        mountOverview(overviewHost);
        mountEditor(editorHost);

        if (shouldRestoreSearchFocus) {
            const searchInput = mainColumn.querySelector('[data-tr-search]');
            if (searchInput) {
                searchInput.focus({ preventScroll: true });
                if (searchSelectionStart !== null && searchSelectionEnd !== null) {
                    searchInput.setSelectionRange(searchSelectionStart, searchSelectionEnd);
                }
            }
        }
    };

    const init = async () => {
        const squadData = await TmClubService.fetchSquadPost(ownClubId);
        const youthData = bTeamClubId ? await TmClubService.fetchSquadPost(bTeamClubId) : null;
        const squadPlayers = Object.values(squadData || {}).map(player => decoratePlayer(player, ownClubId));
        const youthPlayers = Object.values(youthData || {}).map(player => decoratePlayer(player, bTeamClubId));
        const allPlayers = [...squadPlayers, ...youthPlayers];
        state.players = allPlayers;
        state.totalCount = state.players.length;
        state.loadingCount = state.players.length;
        if (state.players.length) {
            state.selectedPlayerId = String(state.players[0].id);
        }

        renderPage();
    };

    const menuItems = parseMenu();
    injectStyles();

    main.classList.add('tmvu-training-page', 'tmu-page-density-regular');
    if (menuItems.length) main.classList.add('tmu-page-layout-2col');

    const nativeStash = document.createElement('div');
    nativeStash.className = 'tmvu-tr-native-stash';
    while (main.firstChild) nativeStash.appendChild(main.firstChild);
    main.appendChild(nativeStash);

    const appHost = document.createElement('section');
    appHost.className = 'tmvu-tr-main tmu-page-section-stack';
    main.appendChild(appHost);

    if (menuItems.length) {
        TmSideMenu.mount(main, {
            id: 'tmvu-training-side-menu',
            className: 'tmu-page-sidebar-stack',
            items: menuItems,
            currentHref: menuItems.find(item => item.isSelected)?.href || window.location.pathname,
        });
    }

    mainColumn = appHost;
    if (!mainColumn) return;

    mainColumn.innerHTML = TmUI.loading();

    init().catch(error => {
        mainColumn.innerHTML = TmUI.error(error?.message || 'Failed to load training page.');
    });
})();