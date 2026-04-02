import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmTable } from '../components/shared/tm-table.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmPosition } from '../lib/tm-position.js';
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
    const DOT_COLORS = [
        'var(--tmu-surface-tab-active)',
        'var(--tmu-danger-fill)',
        'var(--tmu-warning-fill)',
        'var(--tmu-highlight-fill)',
        'var(--tmu-success-fill-strong)',
        'var(--tmu-success-strong)',
    ];
    const TRAINING_TYPES = TmConst.TRAINING_NAMES || {};

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
    const inputHtml = (opts) => htmlOf(TmUI.input({ tone: 'overlay', density: 'comfy', ...opts }));

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        injectTmPageLayoutStyles();

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-tr-hero-card {
                grid-template-columns: minmax(0, 1fr) auto;
                gap: 16px;
                padding: 18px 20px;
                background:
                    radial-gradient(circle at top left, var(--tmu-success-fill-soft), transparent 34%),
                    linear-gradient(140deg, var(--tmu-surface-card), var(--tmu-surface-dark-muted));
                border: 1px solid var(--tmu-border-soft-alpha-mid);
                box-shadow: 0 12px 28px var(--tmu-shadow-elev);
            }

            .tmvu-tr-hero-side {
                display: flex;
                align-items: flex-start;
            }

            .tmvu-tr-copy {
                color: var(--tmu-text-main);
                font-size: 12px;
                line-height: 1.65;
                max-width: 72ch;
            }

            .tmvu-tr-kicker,
            .tmvu-tr-label,
            .tmvu-tr-editor-label {
                color: var(--tmu-text-panel-label);
                font-size: 10px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-tr-hero-note {
                min-width: 180px;
                padding: 10px 12px;
                border-radius: 12px;
                border: 1px solid var(--tmu-border-soft-alpha);
                background: var(--tmu-success-fill-faint);
            }

            .tmvu-tr-hero-note .tmvu-tr-hero-note-metric {
                padding: 0;
                background: transparent;
                border: 0;
                box-shadow: none;
            }

            .tmvu-tr-hero-note .tmvu-tr-hero-note-metric .tmu-metric-value {
                font-size: 22px;
                line-height: 1;
            }

            .tmvu-tr-toolbar {
                margin-top: 14px;
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                align-items: center;
                justify-content: space-between;
            }

            .tmvu-tr-search-slot {
                min-width: 240px;
                max-width: 320px;
                flex: 1 1 280px;
            }

            .tmvu-tr-summary {
                display: grid;
                grid-template-columns: repeat(6, minmax(0, 1fr));
                gap: 10px;
            }

            .tmvu-tr-summary .tmu-metric {
                min-width: 0;
            }

            .tmvu-tr-content {
                display: grid;
                grid-template-columns: minmax(0, 1.45fr) minmax(340px, .9fr);
                gap: 16px;
                align-items: start;
            }

            .tmvu-tr-editor-col {
                position: sticky;
                top: 16px;
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
                gap: 8px;
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
                margin-top: 2px;
                color: var(--tmu-text-muted);
                font-size: 10px;
            }

            .tmvu-tr-status {
                color: var(--tmu-text-muted);
                font-size: 10px;
                font-weight: 700;
            }

            .tmvu-tr-status.ok {
                color: var(--tmu-success);
            }

            .tmvu-tr-status.err {
                color: var(--tmu-danger);
            }

            .tmvu-tr-dots {
                display: inline-flex;
                gap: 4px;
                align-items: center;
            }

            .tmvu-tr-dot {
                width: 18px;
                height: 18px;
                border-radius: 999px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: var(--tmu-text-strong);
                font-size: 10px;
                font-weight: 800;
                border: 1px solid var(--tmu-border-soft-alpha);
                box-shadow: inset 0 1px 0 var(--tmu-border-contrast);
            }

            .tmvu-tr-editor-header {
                display: grid;
                gap: 8px;
            }

            .tmvu-tr-editor-name {
                color: var(--tmu-text-strong);
                font-size: 20px;
                font-weight: 900;
                line-height: 1.15;
            }

            .tmvu-tr-editor-sub {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-items: center;
            }

            .tmvu-tr-editor-grid {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 8px;
            }

            .tmvu-tr-editor-grid .tmu-metric {
                min-width: 0;
            }

            .tmvu-tr-editor-toggle,
            .tmvu-tr-editor-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .tmvu-tr-editor-panel {
                padding: 12px;
                border-radius: 12px;
                background: var(--tmu-surface-dark-mid);
                border: 1px solid var(--tmu-border-soft-alpha);
                display: grid;
                gap: 12px;
            }

            .tmvu-tr-editor-select {
                min-height: 34px;
                padding: 7px 10px;
                border-radius: 10px;
                border: 1px solid var(--tmu-border-soft-alpha-mid);
                background: var(--tmu-surface-input-dark);
                color: var(--tmu-text-strong);
                font: inherit;
                font-size: 12px;
                font-weight: 700;
            }

            .tmvu-tr-team-list {
                display: grid;
                gap: 10px;
            }

            .tmvu-tr-team-row {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                gap: 10px;
                align-items: center;
                padding: 10px;
                border-radius: 10px;
                background: var(--tmu-surface-dark-muted);
                border: 1px solid var(--tmu-border-soft-alpha);
            }

            .tmvu-tr-team-name {
                color: var(--tmu-text-strong);
                font-size: 12px;
                font-weight: 800;
            }

            .tmvu-tr-team-skills {
                margin-top: 4px;
                color: var(--tmu-text-muted);
                font-size: 10px;
                line-height: 1.45;
            }

            .tmvu-tr-team-controls {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .tmvu-tr-team-dots {
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }

            .tmvu-tr-team-dot {
                width: 18px;
                height: 18px;
                border-radius: 999px;
                display: inline-block;
                cursor: pointer;
                transition: all 0.15s;
                border: 1px solid var(--tmu-border-input);
                background: var(--tmu-border-contrast);
            }

            .tmvu-tr-team-dot:hover {
                background: var(--tmu-border-soft-alpha);
                border-color: var(--tmu-border-embedded);
            }

            .tmvu-tr-team-dot.filled {
                border-color: var(--tmu-border-soft-alpha-strong);
                box-shadow: 0 0 6px var(--tmu-shadow-elev), inset 0 1px 0 var(--tmu-border-soft-alpha-mid);
            }

            .tmvu-tr-team-points {
                min-width: 20px;
                color: var(--tmu-text-strong);
                font-size: 14px;
                font-weight: 900;
                text-align: center;
            }

            .tmvu-tr-gk {
                color: var(--tmu-text-main);
                font-size: 12px;
                line-height: 1.65;
            }

            @media (max-width: 1180px) {
                .tmvu-tr-content {
                    grid-template-columns: 1fr;
                }

                .tmvu-tr-editor-col {
                    position: static;
                }

                .tmvu-tr-hero-card {
                    grid-template-columns: 1fr;
                }

                .tmvu-tr-summary {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
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

    const cloneTrainingState = (trainingState) => JSON.parse(JSON.stringify(trainingState || null));

    const decoratePlayer = (player) => ({
        ...player,
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
        editorDraft: null,
        editorDirty: false,
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
        state.editorDraft = next ? cloneTrainingState(next.trainingState) : null;
        state.editorDirty = false;
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
        return `<span class="tmvu-tr-dots">${trainingState.teams.map((team, index) => `<span class="tmvu-tr-dot" style="background:${DOT_COLORS[team.points] || DOT_COLORS[index]}">${team.points}</span>`).join('')}</span>`;
    };

    const getPlayerSubtitle = (trainingState) => {
        if (trainingState?.isGK) return 'Automatic';
        if (trainingState?.customOn) return 'Custom allocation';
        return trainingState?.typeLabel || 'Unknown';
    };

    const renderEditableDots = (trainingState, teamIndex) => {
        const team = trainingState?.teams?.[teamIndex];
        if (!team) return '';

        const color = DOT_COLORS[team.points] || DOT_COLORS[teamIndex];
        let html = '';
        for (let segmentIndex = 0; segmentIndex < 4; segmentIndex += 1) {
            const filled = segmentIndex < team.points;
            html += `<span class="tmvu-tr-team-dot${filled ? ' filled' : ''}" data-tr-dot-team="${teamIndex}" data-tr-dot-seg="${segmentIndex}"${filled ? ` style="background:${color}"` : ''}></span>`;
        }
        return `<span class="tmvu-tr-team-dots">${html}</span>`;
    };

    const renderHero = () => {
        const filtered = getFilteredPlayers();
        const customCount = state.players.filter(player => player.trainingState.customOn).length;
        const standardCount = state.players.filter(player => !player.trainingState.isGK && !player.trainingState.customOn).length;
        const gkCount = state.players.filter(player => player.trainingState.isGK).length;

        const hero = document.createElement('div');
        const refs = TmHeroCard.mount(hero, {
            heroClass: 'tmvu-tr-hero-card',
            sideClass: 'tmvu-tr-hero-side',
            slots: {
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
                        <div class="tmvu-tr-summary">
                            ${metricHtml({ label: 'Players', value: String(state.players.length), tone: 'overlay', size: 'lg', align: 'center' })}
                            ${metricHtml({ label: 'Squad Source', value: String(state.totalCount), tone: 'overlay', size: 'lg', align: 'center' })}
                            ${metricHtml({ label: 'Custom', value: String(customCount), tone: 'overlay', size: 'lg', align: 'center' })}
                            ${metricHtml({ label: 'Standard', value: String(standardCount), tone: 'overlay', size: 'lg', align: 'center' })}
                            ${metricHtml({ label: 'Goalkeepers', value: String(gkCount), tone: 'overlay', size: 'lg', align: 'center' })}
                            ${metricHtml({ label: 'Visible Rows', value: String(filtered.length), tone: 'overlay', size: 'lg', align: 'center' })}
                        </div>
                    </div>
                `,
                side: `
                    <div class="tmvu-tr-hero-note">
                        ${metricHtml({ label: 'Players Loaded', value: String(state.players.length), tone: 'overlay', size: 'xl', cls: 'tmvu-tr-hero-note-metric' })}
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

    const updateDraft = (updater) => {
        if (!state.editorDraft) return;
        state.editorDraft = typeof updater === 'function' ? updater(state.editorDraft) : updater;
        state.editorDirty = true;
        queueRender();
    };

    const setTeamPoints = (teamIndex, targetPoints) => {
        const draft = state.editorDraft;
        if (!draft || draft.isGK || !draft.customOn) return;

        const teams = draft.teams.map(team => ({ ...team }));
        const current = teams[teamIndex];
        if (!current) return;

        const currentTotal = teams.reduce((sum, team) => sum + team.points, 0);
        let nextPoints = Math.max(0, Math.min(4, Number(targetPoints) || 0));
        if (nextPoints > current.points) {
            const available = Math.max(0, draft.maxPool - currentTotal);
            nextPoints = Math.min(nextPoints, current.points + available);
        }
        const nextTotal = currentTotal - current.points + nextPoints;
        if (nextTotal > draft.maxPool) return;

        teams[teamIndex] = { ...current, points: nextPoints };
        updateDraft({
            ...draft,
            teams,
            totalAllocated: nextTotal,
            remaining: Math.max(0, draft.maxPool - nextTotal),
            dots: teams.map(team => team.points).join(''),
        });
    };

    const resetDraft = () => {
        const player = getSelectedPlayer();
        if (!player) return;
        state.editorDraft = cloneTrainingState(player.trainingState);
        state.editorDirty = false;
        queueRender();
    };

    const saveStandard = async () => {
        const player = getSelectedPlayer();
        const draft = state.editorDraft;
        if (!player || !draft || draft.isGK) return;

        updatePlayer(player.id, { saving: true });
        queueRender();
        try {
            await TmTrainingService.saveTrainingType(player.id, draft.currentType);
            const nextState = {
                ...draft,
                customOn: false,
                modeLabel: 'Standard',
                typeLabel: TRAINING_TYPES[draft.currentType] || 'Unknown',
            };
            updatePlayer(player.id, { trainingState: nextState, trainingLoaded: true, trainingError: '', saving: false });
            state.editorDraft = cloneTrainingState(nextState);
            state.editorDirty = false;
            state.notice = `${player.name} training type updated.`;
        } catch (error) {
            updatePlayer(player.id, { saving: false, trainingError: error?.message || 'Failed to save standard training.' });
            state.notice = error?.message || `Failed to save ${player.name}.`;
        }
        queueRender();
    };

    const saveCustom = async () => {
        const player = getSelectedPlayer();
        const draft = state.editorDraft;
        if (!player || !draft || draft.isGK) return;

        updatePlayer(player.id, { saving: true });
        queueRender();
        try {
            await TmTrainingService.saveTraining(TmTrainingService.buildCustomTrainingPayload(player.id, draft));
            const nextState = {
                ...draft,
                customOn: true,
                modeLabel: 'Custom',
                typeLabel: TRAINING_TYPES[draft.currentType] || 'Unknown',
            };
            updatePlayer(player.id, { trainingState: nextState, trainingLoaded: true, trainingError: '', saving: false });
            state.editorDraft = cloneTrainingState(nextState);
            state.editorDirty = false;
            state.notice = `${player.name} custom training saved.`;
        } catch (error) {
            updatePlayer(player.id, { saving: false, trainingError: error?.message || 'Failed to save custom training.' });
            state.notice = error?.message || `Failed to save ${player.name}.`;
        }
        queueRender();
    };

    const buildEditorContent = () => {
        const player = getSelectedPlayer();
        if (!player) return TmUI.empty('Select a player from the overview to inspect or update training.');
        if (player.trainingState.isGK) return '<div class="tmvu-tr-gk">Goalkeeper training is automatic and cannot be edited.</div>';

        const draft = state.editorDraft || cloneTrainingState(player.trainingState);
        const typeOptions = Object.entries(TRAINING_TYPES).map(([value, label]) => `
            <option value="${escapeHtml(value)}"${String(draft.currentType) === String(value) ? ' selected' : ''}>${escapeHtml(label)}</option>
        `).join('');

        return `
            <div class="tmvu-tr-editor-header">
                <div class="tmvu-tr-editor-name">${escapeHtml(player.name)}</div>
                <div class="tmvu-tr-editor-sub">
                    ${renderModeChip(draft.modeLabel, 'overlay')}
                    <span>${TmPosition.chip(player.positions?.length ? player.positions : [String(player.favposition || '').split(',')[0] || ''])}</span>
                    <span class="tmvu-tr-status${player.trainingError ? ' err' : ' ok'}">${player.trainingError ? 'Fallback data' : 'Squad data loaded'}</span>
                </div>
            </div>
            <div class="tmvu-tr-editor-grid">
                ${metricHtml({ label: 'Age', value: formatAge(player.age, player.months), tone: 'overlay', size: 'md' })}
                ${metricHtml({ label: 'Mode', value: escapeHtml(draft.modeLabel), tone: 'overlay', size: 'md' })}
                ${metricHtml({ label: 'Pool', value: `${draft.totalAllocated}/${draft.maxPool}`, tone: 'overlay', size: 'md' })}
            </div>
            <div class="tmvu-tr-editor-toggle" data-tr-editor-toggle></div>
            <div class="tmvu-tr-editor-panel">
                ${draft.customOn ? `
                    <div>
                        <div class="tmvu-tr-editor-label">Custom Teams</div>
                        <div class="tmvu-tr-copy" style="margin-top:6px">Adjust the six custom team buckets and save them back through the training post endpoint.</div>
                        <div style="margin-top:10px">${renderDots(draft)}</div>
                    </div>
                    <div class="tmvu-tr-team-list">
                        ${draft.teams.map((team, index) => `
                            <div class="tmvu-tr-team-row">
                                <div>
                                    <div class="tmvu-tr-team-name">${escapeHtml(team.label)}</div>
                                    <div class="tmvu-tr-team-skills">${escapeHtml(team.skillLabels.join(', ') || 'No skill labels returned for this team.')}</div>
                                </div>
                                <div class="tmvu-tr-team-controls">
                                    ${renderEditableDots(draft, index)}
                                    <span class="tmvu-tr-team-points">${team.points}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="tmvu-tr-editor-actions" data-tr-editor-actions></div>
                ` : `
                    <label>
                        <div class="tmvu-tr-editor-label">Standard Training Type</div>
                        <select class="tmvu-tr-editor-select" data-tr-type-select>${typeOptions}</select>
                    </label>
                    <div class="tmvu-tr-editor-actions" data-tr-editor-actions></div>
                `}
            </div>
        `;
    };

    const mountEditor = (host) => {
        const refs = TmSectionCard.mount(host, {
            title: 'Training Editor',
            icon: '🛠',
            titleMode: 'body',
            cardVariant: 'soft',
            hostClass: 'tmvu-tr-editor-host',
            bodyClass: 'tmvu-tr-editor-body tmu-stack tmu-stack-density-regular',
            beforeBodyHtml: '<div data-ref="content"></div>',
        });
        const body = refs.body || host;
        if (body.dataset.tmvuTrEditorBound !== '1') {
            body.dataset.tmvuTrEditorBound = '1';
            body.addEventListener('change', (event) => {
                const typeSelect = event.target.closest('[data-tr-type-select]');
                if (!typeSelect || !body.contains(typeSelect)) return;

                const draft = state.editorDraft;
                if (!draft) return;
                updateDraft({
                    ...draft,
                    currentType: typeSelect.value,
                    typeLabel: TRAINING_TYPES[typeSelect.value] || 'Unknown',
                    customOn: false,
                    modeLabel: 'Standard',
                });
            });
            body.addEventListener('click', (event) => {
                const dot = event.target.closest('[data-tr-dot-team][data-tr-dot-seg]');
                if (!dot || !body.contains(dot)) return;

                const draft = state.editorDraft;
                if (!draft) return;
                const teamIndex = Number(dot.getAttribute('data-tr-dot-team'));
                const segmentIndex = Number(dot.getAttribute('data-tr-dot-seg'));
                const currentPoints = draft.teams?.[teamIndex]?.points || 0;
                const nextPoints = segmentIndex + 1 === currentPoints ? segmentIndex : segmentIndex + 1;
                setTeamPoints(teamIndex, nextPoints);
            });
        }
        body.innerHTML = buildEditorContent();

        const player = getSelectedPlayer();
        const draft = state.editorDraft;
        if (!player || !draft || draft.isGK) return;

        const toggleMount = body.querySelector('[data-tr-editor-toggle]');
        toggleMount?.appendChild(TmUI.button({
            label: 'Standard',
            variant: draft.customOn ? 'secondary' : 'primary',
            size: 'sm',
            onClick: () => updateDraft({ ...draft, customOn: false, modeLabel: 'Standard' }),
        }));
        toggleMount?.appendChild(TmUI.button({
            label: 'Custom',
            variant: draft.customOn ? 'primary' : 'secondary',
            size: 'sm',
            onClick: () => updateDraft({ ...draft, customOn: true, modeLabel: 'Custom' }),
        }));

        const actionsMount = body.querySelector('[data-tr-editor-actions]');
        if (draft.customOn) {
            actionsMount?.appendChild(TmUI.button({
                label: 'Save Custom',
                color: 'primary',
                size: 'sm',
                disabled: !state.editorDirty,
                onClick: saveCustom,
            }));
            actionsMount?.appendChild(TmUI.button({
                label: 'Clear',
                color: 'danger',
                size: 'sm',
                onClick: () => updateDraft({
                    ...draft,
                    teams: draft.teams.map(team => ({ ...team, points: 0 })),
                    totalAllocated: 0,
                    remaining: draft.maxPool,
                    dots: '000000',
                }),
            }));
        } else {
            actionsMount?.appendChild(TmUI.button({
                label: 'Save Type',
                color: 'primary',
                size: 'sm',
                disabled: !state.editorDirty,
                onClick: saveStandard,
            }));
        }

        actionsMount?.appendChild(TmUI.button({
            label: 'Reset',
            color: 'secondary',
            size: 'sm',
            disabled: !state.editorDirty,
            onClick: resetDraft,
        }));
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
        const squadData = await TmClubService.fetchSquadRaw(ownClubId, { skipSync: true });
        const youthData = bTeamClubId ? await TmClubService.fetchSquadRaw(bTeamClubId, { skipSync: true }) : null;
        const squadPlayers = Array.isArray(squadData?.post) ? squadData.post : [];
        const youthPlayers = Array.isArray(youthData?.post) ? youthData.post : [];
        const allPlayers = [...squadPlayers, ...youthPlayers];
        state.players = allPlayers.map(decoratePlayer);
        state.totalCount = state.players.length;
        state.loadingCount = state.players.length;
        if (state.players.length) {
            state.selectedPlayerId = String(state.players[0].id);
            state.editorDraft = cloneTrainingState(state.players[0].trainingState);
        }

        renderPage();
    };

    const menuItems = parseMenu();
    injectStyles();

    main.classList.add('tmvu-training-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');
    main.innerHTML = '<section class="tmvu-tr-main tmu-page-section-stack"></section>';

    if (menuItems.length) {
        TmSideMenu.mount(main, {
            id: 'tmvu-training-side-menu',
            className: 'tmu-page-sidebar-stack',
            items: menuItems,
            currentHref: menuItems.find(item => item.isSelected)?.href || window.location.pathname,
        });
    }

    mainColumn = main.querySelector('.tmvu-tr-main');
    if (!mainColumn) return;

    mainColumn.innerHTML = TmUI.loading();

    init().catch(error => {
        mainColumn.innerHTML = TmUI.error(error?.message || 'Failed to load training page.');
    });
})();