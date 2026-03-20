import { TmSideMenu } from '../components/shared/tm-side-menu.js';
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
    const DOT_COLORS = ['#314628', '#7a2f2f', '#b86c1c', '#cf9d1b', '#7ab53c', '#4ade80'];
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

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            body.tmvu-shell-active .tmvu-main.tmvu-training-page {
                display: flex !important;
                align-items: flex-start;
                gap: 16px;
            }

            body.tmvu-shell-active .tmvu-main.tmvu-training-page > .tmvu-tr-main {
                flex: 1 1 auto;
                width: 0;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .tmvu-tr-main {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .tmvu-tr-hero {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                gap: 16px;
                padding: 18px 20px;
                border-radius: 16px;
                background:
                    radial-gradient(circle at top left, rgba(128,224,72,.14), rgba(128,224,72,0) 34%),
                    linear-gradient(140deg, rgba(16,32,10,.96), rgba(9,20,6,.92));
                border: 1px solid rgba(78,130,54,.22);
                box-shadow: 0 12px 28px rgba(0,0,0,.16);
            }

            .tmvu-tr-title {
                color: #eef8e8;
                font-size: 30px;
                font-weight: 900;
                line-height: 1.02;
            }

            .tmvu-tr-copy {
                margin-top: 10px;
                color: #9bbc84;
                font-size: 12px;
                line-height: 1.65;
                max-width: 72ch;
            }

            .tmvu-tr-kicker,
            .tmvu-tr-label,
            .tmvu-tr-stat-label,
            .tmvu-tr-editor-label {
                color: #7fa669;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-tr-hero-note {
                min-width: 180px;
                padding: 10px 12px;
                border-radius: 12px;
                border: 1px solid rgba(78,130,54,.18);
                background: rgba(128,224,72,.06);
            }

            .tmvu-tr-hero-note-value {
                margin-top: 4px;
                color: #eef8e8;
                font-size: 22px;
                font-weight: 900;
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

            .tmvu-tr-search {
                min-width: 240px;
                max-width: 320px;
                padding: 8px 10px;
                border-radius: 10px;
                border: 1px solid rgba(78,130,54,.22);
                background: rgba(7,16,5,.44);
                color: #eef8e8;
                font: inherit;
                font-size: 12px;
                font-weight: 700;
            }

            .tmvu-tr-search:focus {
                outline: 1px solid rgba(128,224,72,.45);
                border-color: rgba(128,224,72,.45);
            }

            .tmvu-tr-summary {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            .tmvu-tr-stat {
                min-width: 108px;
                padding: 10px 12px;
                border-radius: 12px;
                background: rgba(12,24,9,.34);
                border: 1px solid rgba(78,130,54,.16);
            }

            .tmvu-tr-stat-value {
                margin-top: 4px;
                color: #eef8e8;
                font-size: 18px;
                font-weight: 900;
                line-height: 1;
            }

            .tmvu-tr-banner {
                padding: 10px 12px;
                border-radius: 12px;
                border: 1px solid rgba(78,130,54,.18);
                background: rgba(128,224,72,.06);
                color: #d6e8ca;
                font-size: 12px;
                line-height: 1.55;
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

            .tmvu-tr-card-host .tmu-card,
            .tmvu-tr-editor-host .tmu-card {
                background: #16270f;
                border: 1px solid #28451d;
                border-radius: 12px;
                box-shadow: 0 0 9px #192a19;
            }

            .tmvu-tr-card-body,
            .tmvu-tr-editor-body {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .tmvu-tr-table .tmvu-tr-row-selected td {
                background: rgba(128,224,72,.06);
            }

            .tmvu-tr-table .tmvu-tr-row-selected:hover td {
                background: rgba(128,224,72,.1);
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
                color: #eef8e8;
                font-weight: 800;
                text-decoration: none;
            }

            .tmvu-tr-player-name:hover {
                text-decoration: underline;
            }

            .tmvu-tr-player-sub {
                margin-top: 2px;
                color: #8aac72;
                font-size: 10px;
            }

            .tmvu-tr-mode-badge {
                display: inline-flex;
                align-items: center;
                min-height: 22px;
                padding: 0 8px;
                border-radius: 999px;
                background: rgba(42,74,28,.34);
                border: 1px solid rgba(78,130,54,.22);
                color: #c8e0b4;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: .04em;
                text-transform: uppercase;
            }

            .tmvu-tr-status {
                color: #8aac72;
                font-size: 10px;
                font-weight: 700;
            }

            .tmvu-tr-status.ok {
                color: #80e048;
            }

            .tmvu-tr-status.err {
                color: #f87171;
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
                color: #f5ffe9;
                font-size: 10px;
                font-weight: 800;
                border: 1px solid rgba(255,255,255,.08);
                box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
            }

            .tmvu-tr-editor-header {
                display: grid;
                gap: 8px;
            }

            .tmvu-tr-editor-name {
                color: #eef8e8;
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

            .tmvu-tr-editor-stat {
                padding: 10px;
                border-radius: 10px;
                background: rgba(12,24,9,.32);
                border: 1px solid rgba(78,130,54,.16);
            }

            .tmvu-tr-editor-stat-value {
                margin-top: 4px;
                color: #eef8e8;
                font-size: 16px;
                font-weight: 900;
                line-height: 1;
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
                background: rgba(12,24,9,.26);
                border: 1px solid rgba(78,130,54,.16);
                display: grid;
                gap: 12px;
            }

            .tmvu-tr-editor-select {
                min-height: 34px;
                padding: 7px 10px;
                border-radius: 10px;
                border: 1px solid rgba(78,130,54,.22);
                background: rgba(7,16,5,.44);
                color: #eef8e8;
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
                background: rgba(7,16,5,.34);
                border: 1px solid rgba(78,130,54,.14);
            }

            .tmvu-tr-team-name {
                color: #eef8e8;
                font-size: 12px;
                font-weight: 800;
            }

            .tmvu-tr-team-skills {
                margin-top: 4px;
                color: #8aac72;
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
                border: 1px solid rgba(42,74,28,.6);
                background: rgba(255,255,255,.06);
            }

            .tmvu-tr-team-dot:hover {
                background: rgba(255,255,255,.12);
                border-color: rgba(78,130,54,.9);
            }

            .tmvu-tr-team-dot.filled {
                border-color: rgba(255,255,255,.15);
                box-shadow: 0 0 6px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.2);
            }

            .tmvu-tr-team-points {
                min-width: 20px;
                color: #eef8e8;
                font-size: 14px;
                font-weight: 900;
                text-align: center;
            }

            .tmvu-tr-empty,
            .tmvu-tr-loading,
            .tmvu-tr-gk {
                color: #9bbc84;
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

                .tmvu-tr-hero {
                    grid-template-columns: 1fr;
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

    const renderDots = (trainingState) => {
        if (trainingState.isGK) return '<span class="tmvu-tr-mode-badge">GK</span>';
        if (!trainingState.customOn) return `<span class="tmvu-tr-mode-badge">${escapeHtml(trainingState.typeLabel)}</span>`;
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

        const hero = document.createElement('section');
        hero.className = 'tmvu-tr-hero';
        hero.innerHTML = `
            <div>
                <div class="tmvu-tr-title">Training</div>
                <div class="tmvu-tr-copy">Training is read directly from squad data, including B team players when available. The table stays overview-first, while the editor on the right lets you update the selected player without leaving the page.</div>
                <div class="tmvu-tr-toolbar">
                    <input class="tmvu-tr-search" type="search" placeholder="Filter players by name or position" value="${escapeHtml(state.query)}" data-tr-search>
                    <div class="tmvu-tr-summary">
                        <div class="tmvu-tr-stat"><div class="tmvu-tr-stat-label">Players</div><div class="tmvu-tr-stat-value">${state.players.length}</div></div>
                        <div class="tmvu-tr-stat"><div class="tmvu-tr-stat-label">Squad Source</div><div class="tmvu-tr-stat-value">${state.totalCount}</div></div>
                        <div class="tmvu-tr-stat"><div class="tmvu-tr-stat-label">Custom</div><div class="tmvu-tr-stat-value">${customCount}</div></div>
                        <div class="tmvu-tr-stat"><div class="tmvu-tr-stat-label">Standard</div><div class="tmvu-tr-stat-value">${standardCount}</div></div>
                        <div class="tmvu-tr-stat"><div class="tmvu-tr-stat-label">Goalkeepers</div><div class="tmvu-tr-stat-value">${gkCount}</div></div>
                        <div class="tmvu-tr-stat"><div class="tmvu-tr-stat-label">Visible Rows</div><div class="tmvu-tr-stat-value">${filtered.length}</div></div>
                    </div>
                </div>
                ${state.notice ? `<div class="tmvu-tr-banner">${escapeHtml(state.notice)}</div>` : ''}
            </div>
            <div class="tmvu-tr-hero-note">
                <div class="tmvu-tr-kicker">Players Loaded</div>
                <div class="tmvu-tr-hero-note-value">${state.players.length}</div>
            </div>
        `;
        hero.querySelector('[data-tr-search]')?.addEventListener('input', (event) => {
            state.query = event.target.value || '';
            queueRender();
        });
        return hero;
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
                    render: (_, player) => `<span class="tmvu-tr-mode-badge">${escapeHtml(player.trainingState.modeLabel)}</span>`,
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
            hostClass: 'tmvu-tr-card-host',
            bodyClass: 'tmvu-tr-card-body',
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
        if (!player) return '<div class="tmvu-tr-empty">Select a player from the overview to inspect or update training.</div>';
        if (player.trainingState.isGK) return '<div class="tmvu-tr-gk">Goalkeeper training is automatic and cannot be edited.</div>';

        const draft = state.editorDraft || cloneTrainingState(player.trainingState);
        const typeOptions = Object.entries(TRAINING_TYPES).map(([value, label]) => `
            <option value="${escapeHtml(value)}"${String(draft.currentType) === String(value) ? ' selected' : ''}>${escapeHtml(label)}</option>
        `).join('');

        return `
            <div class="tmvu-tr-editor-header">
                <div class="tmvu-tr-editor-name">${escapeHtml(player.name)}</div>
                <div class="tmvu-tr-editor-sub">
                    <span class="tmvu-tr-mode-badge">${escapeHtml(draft.modeLabel)}</span>
                    <span>${TmPosition.chip(player.positions?.length ? player.positions : [String(player.favposition || '').split(',')[0] || ''])}</span>
                    <span class="tmvu-tr-status${player.trainingError ? ' err' : ' ok'}">${player.trainingError ? 'Fallback data' : 'Squad data loaded'}</span>
                </div>
            </div>
            <div class="tmvu-tr-editor-grid">
                <div class="tmvu-tr-editor-stat"><div class="tmvu-tr-editor-label">Age</div><div class="tmvu-tr-editor-stat-value">${formatAge(player.age, player.months)}</div></div>
                <div class="tmvu-tr-editor-stat"><div class="tmvu-tr-editor-label">Mode</div><div class="tmvu-tr-editor-stat-value">${escapeHtml(draft.modeLabel)}</div></div>
                <div class="tmvu-tr-editor-stat"><div class="tmvu-tr-editor-label">Pool</div><div class="tmvu-tr-editor-stat-value">${draft.totalAllocated}/${draft.maxPool}</div></div>
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
            hostClass: 'tmvu-tr-editor-host',
            bodyClass: 'tmvu-tr-editor-body',
            beforeBodyHtml: '<div data-ref="content"></div>',
        });
        const body = refs.body || host;
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

        body.querySelector('[data-tr-type-select]')?.addEventListener('change', (event) => {
            updateDraft({
                ...draft,
                currentType: event.target.value,
                typeLabel: TRAINING_TYPES[event.target.value] || 'Unknown',
                customOn: false,
                modeLabel: 'Standard',
            });
        });

        body.querySelectorAll('[data-tr-dot-team][data-tr-dot-seg]').forEach(node => {
            node.addEventListener('click', () => {
                const teamIndex = Number(node.getAttribute('data-tr-dot-team'));
                const segmentIndex = Number(node.getAttribute('data-tr-dot-seg'));
                const currentPoints = draft.teams?.[teamIndex]?.points || 0;
                const nextPoints = segmentIndex + 1 === currentPoints ? segmentIndex : segmentIndex + 1;
                setTeamPoints(teamIndex, nextPoints);
            });
        });

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

    main.classList.add('tmvu-training-page');
    main.innerHTML = '<section class="tmvu-tr-main"></section>';

    if (menuItems.length) {
        TmSideMenu.mount(main, {
            id: 'tmvu-training-side-menu',
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