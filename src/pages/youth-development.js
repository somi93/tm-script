import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmPosition } from '../lib/tm-position.js';
import { TmYouthService } from '../services/youth.js';

(async function () {
    'use strict';

    const routeMatches = /^\/youth-development(?:\/.*)?$/i.test(window.location.pathname);
    const pageTitleText = String(document.querySelector('.main_center .box_head h2, .tmvu-main .box_head h2')?.textContent || '').replace(/\s+/g, ' ').trim();
    const menuText = String(document.querySelector('.column1 .content_menu, .tmvu-main .column1 .content_menu')?.textContent || '').replace(/\s+/g, ' ').trim();
    const looksLikeYouthPage = /youth development/i.test(pageTitleText)
        || (/training/i.test(menuText) && /players/i.test(menuText) && /facilit/i.test(menuText));
    if (!routeMatches && !looksLikeYouthPage) return;

    const main = document.querySelector('.tmvu-main, .main_center');
    if (!main) return;

    const sourceRoot = main.cloneNode(true);
    const STYLE_ID = 'tmvu-youth-development-style';
    const SKILL_LABELS = {
        strength: 'Str',
        stamina: 'Sta',
        pace: 'Pac',
        marking: 'Mar',
        tackling: 'Tac',
        workrate: 'Wor',
        positioning: 'Pos',
        passing: 'Pas',
        crossing: 'Cro',
        technique: 'Tec',
        heading: 'Hea',
        finishing: 'Fin',
        longshots: 'Lon',
        set_pieces: 'Set',
        handling: 'Han',
        oneonones: 'One',
        one_on_ones: 'One',
        reflexes: 'Ref',
        aerialability: 'Aer',
        aerial_ability: 'Aer',
        jumping: 'Jum',
        communication: 'Com',
        kicking: 'Kic',
        throwing: 'Thr',
    };

    const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const formatAge = (years, months) => {
        if (!Number.isFinite(years)) return '-';
        const safeMonths = Number.isFinite(months) ? months : 0;
        return `${years}.${String(safeMonths).padStart(2, '0')}`;
    };

    const formatFloat = (value, digits = 1) => Number.isFinite(value) ? value.toFixed(digits) : '-';
    const formatNumber = (value) => Number.isFinite(value) ? Math.round(value).toLocaleString('en-US') : '-';

    const valueColor = (value, thresholds) => {
        const colors = TmConst.COLOR_LEVELS || [];
        for (let index = 0; index < thresholds.length; index++) {
            if (value >= thresholds[index]) return colors[index]?.color || '#eef8e8';
        }
        return colors[colors.length - 1]?.color || '#8aac72';
    };

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-main.tmvu-yd-page {
                display: grid !important;
                grid-template-columns: 184px minmax(0, 1fr);
                gap: 16px;
                align-items: start;
            }

            .tmvu-yd-main {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 14px;
            }

            .tmvu-yd-hero {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                gap: 18px;
                align-items: end;
                overflow: hidden;
                padding: 18px 20px;
                border-radius: 16px;
                background:
                    radial-gradient(circle at top left, rgba(128,224,72,.16), rgba(128,224,72,0) 34%),
                    linear-gradient(140deg, rgba(16,32,10,.96), rgba(9,20,6,.92));
                border: 1px solid rgba(78,130,54,.22);
                box-shadow: 0 12px 28px rgba(0,0,0,.16);
            }

            .tmvu-yd-title {
                color: #eef8e8;
                font-size: 30px;
                font-weight: 900;
                line-height: 1.02;
            }

            .tmvu-yd-method {
                margin-top: 10px;
            }

            .tmvu-yd-method-title,
            .tmvu-yd-rating-label,
            .tmvu-yd-skill-label {
                color: #7fa669;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-yd-method p {
                margin: 8px 0 0;
                color: #9bbc84;
                font-size: 12px;
                line-height: 1.65;
            }

            .tmvu-yd-hero-note {
                min-width: 176px;
                padding: 10px 12px;
                border-radius: 12px;
                border: 1px solid rgba(78,130,54,.18);
                background: rgba(128,224,72,.06);
            }

            .tmvu-yd-hero-note-value {
                margin-top: 4px;
                color: #eef8e8;
                font-size: 22px;
                font-weight: 900;
                line-height: 1;
            }

            .tmvu-yd-toolbar {
                display: flex;
                flex-wrap: wrap;
                align-items: end;
                justify-content: space-between;
                gap: 12px;
                margin-top: 14px;
            }

            .tmvu-yd-control-group,
            .tmvu-yd-bulk-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-items: end;
            }

            .tmvu-yd-select-wrap {
                display: grid;
                gap: 4px;
                min-width: 128px;
            }

            .tmvu-yd-select {
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

            .tmvu-yd-select:focus {
                outline: 1px solid rgba(128,224,72,.45);
                border-color: rgba(128,224,72,.45);
            }

            .tmvu-yd-banner {
                margin-top: 12px;
                padding: 10px 12px;
                border-radius: 12px;
                border: 1px solid rgba(78,130,54,.18);
                background: rgba(128,224,72,.06);
                color: #d6e8ca;
                font-size: 12px;
                line-height: 1.55;
            }

            .tmvu-yd-player-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 12px;
            }

            .tmvu-yd-player-card {
                display: grid;
                gap: 12px;
                padding: 14px 16px 16px;
                min-width: 0;
                border-radius: 16px;
                background: linear-gradient(180deg, rgba(14,30,8,.56), rgba(10,22,7,.48));
                border: 1px solid rgba(78,130,54,.18);
                box-shadow: 0 10px 22px rgba(0,0,0,.12);
                position: relative;
            }

            .tmvu-yd-player-card::before {
                content: '';
                position: absolute;
                inset: 0 auto 0 0;
                width: 4px;
                border-radius: 16px 0 0 16px;
                background: linear-gradient(180deg, rgba(146,222,98,.85), rgba(90,156,56,.45));
            }

            .tmvu-yd-player-top {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                gap: 14px;
                align-items: start;
                min-width: 0;
            }

            .tmvu-yd-player-ident {
                min-width: 0;
            }

            .tmvu-yd-player-age {
                color: #aac690;
                font-size: 11px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-yd-player-name-row {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                align-items: center;
                margin-top: 6px;
            }

            .tmvu-yd-player-name {
                color: #eef8e8;
                font-size: 24px;
                font-weight: 900;
                line-height: 1.15;
            }

            .tmvu-yd-player-name a {
                color: inherit;
                text-decoration: none;
            }

            .tmvu-yd-player-name a:hover {
                text-decoration: underline;
            }

            .tmvu-yd-stars-row {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid rgba(78,130,54,.14);
            }

            .tmvu-yd-stars-value {
                color: #d4e9c6;
                line-height: 1;
            }

            .tmvu-yd-actions-row {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 10px;
            }

            .tmvu-yd-rating-row {
                display: grid;
                grid-template-columns: repeat(4, minmax(82px, 1fr));
                gap: 8px;
                min-width: min(100%, 392px);
            }

            .tmvu-yd-rating-box,
            .tmvu-yd-skill {
                border-radius: 12px;
                border: 1px solid rgba(78,130,54,.16);
            }

            .tmvu-yd-rating-box {
                padding: 10px 10px 9px;
                background: rgba(128,224,72,.06);
                min-width: 0;
            }

            .tmvu-yd-rating-value {
                margin-top: 4px;
                font-size: 22px;
                font-weight: 900;
                line-height: 1;
            }

            .tmvu-yd-skills-panel {
                padding: 12px;
                border-radius: 14px;
                border: 1px solid rgba(78,130,54,.16);
                background: rgba(7,16,5,.34);
            }

            .tmvu-yd-skills-panel-hidden {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }

            .tmvu-yd-hidden-copy {
                color: #9bbc84;
                font-size: 12px;
                line-height: 1.55;
                max-width: 52ch;
            }

            .tmvu-yd-hidden-copy strong {
                color: #eef8e8;
            }

            .tmvu-yd-player-card-status::before {
                background: linear-gradient(180deg, rgba(90,156,56,.65), rgba(78,130,54,.32));
            }

            .tmvu-yd-player-status {
                display: grid;
                gap: 6px;
                min-width: 0;
            }

            .tmvu-yd-player-status-title {
                color: #eef8e8;
                font-size: 18px;
                font-weight: 900;
                line-height: 1.2;
            }

            .tmvu-yd-player-status-copy {
                color: #a9c593;
                font-size: 12px;
                line-height: 1.6;
            }

            .tmvu-yd-player-status-copy a {
                color: #80e048;
                text-decoration: none;
            }

            .tmvu-yd-player-status-copy a:hover {
                text-decoration: underline;
            }

            .tmvu-yd-skills {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(62px, 1fr));
                gap: 8px;
            }

            .tmvu-yd-skill {
                padding: 8px 8px 7px;
                background: rgba(12,24,9,.62);
                min-width: 0;
            }

            .tmvu-yd-skill-value {
                margin-top: 4px;
                color: #eef8e8;
                font-size: 15px;
                font-weight: 900;
                line-height: 1;
            }

            .tmvu-yd-empty {
                padding: 18px;
                border-radius: 12px;
                background: rgba(12,24,9,.28);
                border: 1px solid rgba(78,130,54,.18);
                color: #8aac72;
                font-size: 12px;
                line-height: 1.6;
            }

            @media (max-width: 1240px) {
                .tmvu-yd-hero {
                    grid-template-columns: 1fr;
                }

                .tmvu-yd-player-top {
                    grid-template-columns: 1fr;
                }

                .tmvu-yd-rating-row {
                    min-width: 0;
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

    const parseSelectOptions = (selector) => {
        const select = sourceRoot.querySelector(selector);
        return Array.from(select?.options || []).map(option => ({
            value: String(option.value || ''),
            label: cleanText(option.textContent),
            selected: option.selected,
        }));
    };

    const isNodeVisible = (node) => {
        if (!node) return false;
        if (node.hidden) return false;
        if (node.classList.contains('display_none')) return false;
        const inlineStyle = String(node.getAttribute('style') || '').toLowerCase();
        if (inlineStyle.includes('display:none') || inlineStyle.includes('visibility:hidden')) return false;
        return true;
    };

    const parsePullControls = () => {
        const ageOptions = parseSelectOptions('#age_focus');
        const positionOptions = parseSelectOptions('#position_focus');
        const pullButton = sourceRoot.querySelector('#pull_new_youths');
        return {
            available: Boolean(pullButton && ageOptions.length && positionOptions.length),
            visible: Boolean(isNodeVisible(pullButton) && ageOptions.length && positionOptions.length),
            label: cleanText(pullButton?.textContent) || 'Pull New Youths',
            ageOptions,
            positionOptions,
            selectedAge: ageOptions.find(option => option.selected)?.value || ageOptions[0]?.value || '',
            selectedPosition: positionOptions.find(option => option.selected)?.value || positionOptions[0]?.value || '',
        };
    };

    const decoratePlayers = (players, { revealed, pulledNew = false } = {}) => (players || []).map(player => ({
        ...player,
        _revealed: revealed,
        _pulledNew: pulledNew,
        _status: 'active',
        _disableHire: false,
        _resultPlayerId: '',
    }));

    const syncHireAvailability = (players, squadSize) => {
        const disableHire = Number(squadSize) >= 70;
        return (players || []).map(player => player._status === 'active'
            ? { ...player, _disableHire: disableHire }
            : player);
    };

    const pullControls = parsePullControls();
    const initialData = await TmYouthService.fetchYouthPlayers({ skipSync: true });
    const state = {
        busy: false,
        notice: '',
        cash: Number(initialData?.cash) || 0,
        squadSize: Number(initialData?.squad_size) || 0,
        pull: pullControls,
        selectedAge: pullControls.selectedAge,
        selectedPosition: pullControls.selectedPosition,
        players: syncHireAvailability(decoratePlayers(initialData?.players || [], { revealed: true }), Number(initialData?.squad_size) || 0),
    };

    const getActivePlayers = () => state.players.filter(player => player._status === 'active');
    const getHiddenPlayers = () => getActivePlayers().filter(player => !player._revealed);
    const setPlayers = (players) => {
        state.players = syncHireAvailability(players, state.squadSize);
    };

    const renderSelectOptions = (options, selectedValue) => options.map(option => `
        <option value="${escapeHtml(option.value)}"${option.value === selectedValue ? ' selected' : ''}>${escapeHtml(option.label)}</option>
    `).join('');

    const renderHero = () => {
        const activePlayers = getActivePlayers();
        const hiddenPlayers = getHiddenPlayers();
        return `
            <section class="tmvu-yd-hero">
                <div>
                    <div class="tmvu-yd-title">Youth Development</div>
                    <div class="tmvu-yd-method">
                        <div class="tmvu-yd-method-title">How Estimates Work</div>
                        <p>Current youth players show their full report immediately. Newly pulled players stay hidden until you reveal them, matching the native youth flow before actions unlock.</p>
                    </div>
                    <div class="tmvu-yd-toolbar">
                        ${state.pull.visible ? `
                            <div class="tmvu-yd-control-group">
                                <label class="tmvu-yd-select-wrap">
                                    <span class="tmvu-yd-method-title">Age Focus</span>
                                    <select class="tmvu-yd-select" data-youth-age>
                                        ${renderSelectOptions(state.pull.ageOptions, state.selectedAge)}
                                    </select>
                                </label>
                                <label class="tmvu-yd-select-wrap">
                                    <span class="tmvu-yd-method-title">Position Focus</span>
                                    <select class="tmvu-yd-select" data-youth-position>
                                        ${renderSelectOptions(state.pull.positionOptions, state.selectedPosition)}
                                    </select>
                                </label>
                            </div>
                        ` : ''}
                        <div class="tmvu-yd-bulk-actions" data-youth-bulk-actions></div>
                    </div>
                    ${state.notice ? `<div class="tmvu-yd-banner">${escapeHtml(state.notice)}</div>` : ''}
                </div>
                <div class="tmvu-yd-hero-note">
                    <div class="tmvu-yd-method-title">Active / Hidden</div>
                    <div class="tmvu-yd-hero-note-value">${activePlayers.length} / ${hiddenPlayers.length}</div>
                </div>
            </section>
        `;
    };

    const renderActionButtons = (player) => {
        if (!player.id || player._status !== 'active') return '';
        return `<div class="tmvu-yd-actions-row" data-player-actions="${Number(player.id)}"></div>`;
    };

    const renderStatusCard = (player) => {
        const statusTitle = player._status === 'hired' ? 'Player Hired' : 'Player Released';
        const statusCopy = player._status === 'hired'
            ? `The youth player was hired successfully.${player._resultPlayerId ? ` <a href="/players/${escapeHtml(player._resultPlayerId)}">Open player profile</a>.` : ''}`
            : 'The youth player was released from the intake.';
        return `
            <article class="tmvu-yd-player-card tmvu-yd-player-card-status">
                <div class="tmvu-yd-player-status">
                    <div class="tmvu-yd-player-age">Age ${formatAge(player.age, player.months)}</div>
                    <div class="tmvu-yd-player-status-title">${escapeHtml(player.name || 'Youth Player')}</div>
                    <div>${TmPosition.chip(player.positions?.length ? player.positions : [String(player.favposition || '').split(',')[0] || ''])}</div>
                    <div class="tmvu-yd-player-status-copy">${statusCopy}</div>
                </div>
            </article>
        `;
    };

    const renderPlayerCard = (player) => {
        if (player._status !== 'active') return renderStatusCard(player);

        const isRevealed = Boolean(player._revealed);
        const r5Color = valueColor(player.r5, TmConst.R5_THRESHOLDS || []);
        const recColor = valueColor(player.rec, TmConst.REC_THRESHOLDS || []);
        const skillSum = (player.skills || []).reduce((sum, skill) => sum + (Number(skill?.value) || 0), 0);
        const positionChip = TmPosition.chip(player.positions?.length ? player.positions : [String(player.favposition || '').split(',')[0] || '']);
        const profileName = player.id
            ? `<a href="/players/${escapeHtml(player.id)}">${escapeHtml(player.name)}</a>`
            : escapeHtml(player.name);
        const fullSkillList = (player.skills || [])
            .filter(skill => Number.isFinite(Number(skill?.value)))
            .map(skill => `
                <div class="tmvu-yd-skill">
                    <div class="tmvu-yd-skill-label">${escapeHtml(SKILL_LABELS[skill.key] || skill.name || '?')}</div>
                    <div class="tmvu-yd-skill-value">${Number(skill.value) || 0}</div>
                </div>
            `).join('');

        return `
            <article class="tmvu-yd-player-card" id="tmvu-youth-player-${Number(player.id)}">
                <div class="tmvu-yd-player-top">
                    <div class="tmvu-yd-player-ident">
                        <div class="tmvu-yd-player-age">Age ${formatAge(player.age, player.months)}</div>
                        <div class="tmvu-yd-player-name-row">
                            <div class="tmvu-yd-player-name">${profileName}</div>
                            <div>${positionChip}</div>
                        </div>
                        <div class="tmvu-yd-stars-row">
                            <div class="tmvu-yd-rating-label">Stars</div>
                            <div class="tmvu-yd-stars-value">${isRevealed ? (player.youthRecommendationHtml || '-') : 'Hidden until reveal'}</div>
                        </div>
                        ${renderActionButtons(player)}
                    </div>
                    <div class="tmvu-yd-rating-row">
                        <div class="tmvu-yd-rating-box">
                            <div class="tmvu-yd-rating-label">ASI</div>
                            <div class="tmvu-yd-rating-value">${isRevealed ? formatNumber(player.asi) : '--'}</div>
                        </div>
                        <div class="tmvu-yd-rating-box">
                            <div class="tmvu-yd-rating-label">R5</div>
                            <div class="tmvu-yd-rating-value" style="color:${isRevealed ? r5Color : '#8aac72'}">${isRevealed ? formatFloat(player.r5, 1) : '--'}</div>
                        </div>
                        <div class="tmvu-yd-rating-box">
                            <div class="tmvu-yd-rating-label">REC</div>
                            <div class="tmvu-yd-rating-value" style="color:${isRevealed ? recColor : '#8aac72'}">${isRevealed ? formatFloat(player.rec, 2) : '--'}</div>
                        </div>
                        <div class="tmvu-yd-rating-box">
                            <div class="tmvu-yd-rating-label">Skill Sum</div>
                            <div class="tmvu-yd-rating-value">${isRevealed ? skillSum : '--'}</div>
                        </div>
                    </div>
                </div>
                <div class="tmvu-yd-skills-panel${isRevealed ? '' : ' tmvu-yd-skills-panel-hidden'}">
                    ${isRevealed ? `
                        <div class="tmvu-yd-skills">${fullSkillList}</div>
                    ` : `
                        <div class="tmvu-yd-hidden-copy"><strong>Skills are hidden.</strong> Reveal this youth report to unlock skill values, recommendation stars and player actions.</div>
                    `}
                </div>
            </article>
        `;
    };

    const renderPlayers = () => {
        if (!state.players.length) {
            return `
                <div class="tmvu-yd-empty">
                    Youth player data was not available from the endpoint.
                </div>
            `;
        }

        return `
            <section class="tmvu-yd-player-grid">
                ${state.players.map(renderPlayerCard).join('')}
            </section>
        `;
    };

    const findPlayer = (playerId) => state.players.find(player => Number(player.id) === Number(playerId));

    const confirmAction = ({ icon, title, message, confirmLabel, confirmStyle = 'primary' }) => TmUI.modal({
        icon,
        title,
        message,
        buttons: [
            { label: confirmLabel, value: 'ok', style: confirmStyle },
            { label: 'Cancel', value: 'cancel', style: 'secondary' },
        ],
    });

    const renderPage = () => {
        if (!mainColumn) return;
        TmUI.render(mainColumn, `
            ${renderHero()}
            ${renderPlayers()}
        `);

        const ageSelect = mainColumn.querySelector('[data-youth-age]');
        if (ageSelect) {
            ageSelect.addEventListener('change', (event) => {
                state.selectedAge = event.target.value;
            });
        }

        const positionSelect = mainColumn.querySelector('[data-youth-position]');
        if (positionSelect) {
            positionSelect.addEventListener('change', (event) => {
                state.selectedPosition = event.target.value;
            });
        }

        hydrateBulkActions(mainColumn);
        hydratePlayerActions(mainColumn);
    };

    const setBusy = (busy) => {
        state.busy = busy;
        renderPage();
    };

    const markPlayer = (playerId, patch) => {
        setPlayers(state.players.map(player => Number(player.id) === Number(playerId)
            ? { ...player, ...patch }
            : player));
    };

    const revealPlayer = (playerId) => {
        markPlayer(playerId, { _revealed: true });
        renderPage();
    };

    const revealAllPlayers = () => {
        setPlayers(state.players.map(player => player._status === 'active'
            ? { ...player, _revealed: true }
            : player));
        renderPage();
    };

    const handlePullNewPlayers = async () => {
        if (state.busy || !state.pull.available || !state.pull.visible) return;
        setBusy(true);
        try {
            const result = await TmYouthService.fetchNewYouthPlayers({
                age: state.selectedAge,
                position: state.selectedPosition,
                skipSync: true,
            });
            if (!result) {
                state.notice = 'The youth endpoint did not return data for a new pull.';
                return;
            }
            if (result.error) {
                state.notice = result.error;
                return;
            }

            const newPlayers = decoratePlayers(result.players || [], { revealed: false, pulledNew: true });
            if (!newPlayers.length) {
                state.notice = 'No new youth players were returned for the selected focus.';
                return;
            }

            setPlayers([...newPlayers, ...state.players]);
            state.pull.visible = false;
            state.notice = 'New youth players loaded. Reveal them before hire or fire actions unlock.';
        } catch (error) {
            state.notice = error?.message || 'Failed to pull new youth players.';
        } finally {
            setBusy(false);
        }
    };

    const handleHirePlayer = async (playerId) => {
        const player = findPlayer(playerId);
        if (!player || state.busy || player._status !== 'active' || !player._revealed || player._disableHire) return;

        const choice = await confirmAction({
            icon: '🟢',
            title: 'Hire Youth Player',
            message: `Hire <strong>${escapeHtml(player.name)}</strong> into your club?`,
            confirmLabel: 'Hire Player',
            confirmStyle: 'primary',
        });
        if (choice !== 'ok') return;

        setBusy(true);
        try {
            const result = await TmYouthService.actOnYouthPlayer({ playerId, action: 'hire' });
            if (result?.yes === 'yes') {
                state.squadSize += 1;
                state.cash -= Number(player.youthFee) || 0;
                markPlayer(playerId, {
                    _status: 'hired',
                    _resultPlayerId: String(result.player_id || player.id || ''),
                });
                state.notice = `${player.name} was hired successfully.`;
            } else {
                state.notice = `Failed to hire ${player.name}.`;
            }
        } catch (error) {
            state.notice = error?.message || `Failed to hire ${player.name}.`;
        } finally {
            setBusy(false);
        }
    };

    const handleFirePlayer = async (playerId) => {
        const player = findPlayer(playerId);
        if (!player || state.busy || player._status !== 'active' || !player._revealed) return;

        const choice = await confirmAction({
            icon: '🔴',
            title: 'Fire Youth Player',
            message: `Release <strong>${escapeHtml(player.name)}</strong> from the youth intake?`,
            confirmLabel: 'Fire Player',
            confirmStyle: 'danger',
        });
        if (choice !== 'ok') return;

        setBusy(true);
        try {
            const result = await TmYouthService.actOnYouthPlayer({ playerId, action: 'fire' });
            if (result?.yes === 'yes') {
                markPlayer(playerId, { _status: 'fired' });
                state.notice = `${player.name} was released.`;
            } else {
                state.notice = `Failed to fire ${player.name}.`;
            }
        } catch (error) {
            state.notice = error?.message || `Failed to fire ${player.name}.`;
        } finally {
            setBusy(false);
        }
    };

    const handleFireAllPlayers = async () => {
        const activePlayers = getActivePlayers();
        if (!activePlayers.length || state.busy || getHiddenPlayers().length) return;

        const choice = await confirmAction({
            icon: '⚠️',
            title: 'Fire All Youth Players',
            message: 'Release every active youth player in the current intake?',
            confirmLabel: 'Fire All',
            confirmStyle: 'danger',
        });
        if (choice !== 'ok') return;

        setBusy(true);
        try {
            const result = await TmYouthService.actOnYouthPlayer({ playerId: 'all', action: 'fire' });
            if (result?.yes === 'yes') {
                setPlayers(state.players.map(player => player._status === 'active'
                    ? { ...player, _status: 'fired', _revealed: true }
                    : player));
                state.notice = 'All active youth players were released.';
            } else {
                state.notice = 'Failed to fire all youth players.';
            }
        } catch (error) {
            state.notice = error?.message || 'Failed to fire all youth players.';
        } finally {
            setBusy(false);
        }
    };

    const hydrateBulkActions = (root) => {
        const mount = root.querySelector('[data-youth-bulk-actions]');
        if (!mount) return;

        const activeCount = getActivePlayers().length;
        const hiddenCount = getHiddenPlayers().length;

        if (state.pull.visible) {
            mount.appendChild(TmUI.button({
            label: state.busy ? 'Pulling...' : state.pull.label,
                color: 'primary',
                size: 'sm',
                disabled: state.busy,
                onClick: handlePullNewPlayers,
            }));
        }

        if (hiddenCount > 0) {
            mount.appendChild(TmUI.button({
                label: 'Reveal All',
                color: 'secondary',
                size: 'sm',
                disabled: state.busy,
                onClick: revealAllPlayers,
            }));
        }

        if (activeCount > 0) {
            mount.appendChild(TmUI.button({
                label: 'Fire All',
                color: 'danger',
                size: 'sm',
                disabled: state.busy || hiddenCount > 0,
                onClick: handleFireAllPlayers,
            }));
        }
    };

    const hydratePlayerActions = (root) => {
        root.querySelectorAll('[data-player-actions]').forEach(actionRow => {
            if (actionRow.childElementCount) return;

            const playerId = Number(actionRow.getAttribute('data-player-actions'));
            const player = findPlayer(playerId);
            if (!player || player._status !== 'active') return;

            if (!player._revealed) {
                actionRow.appendChild(TmUI.button({
                    label: 'Reveal',
                    color: 'primary',
                    size: 'sm',
                    disabled: state.busy,
                    onClick: () => revealPlayer(playerId),
                }));
            }

            actionRow.appendChild(TmUI.button({
                slot: 'Hire <img src="/pics/mini_green_check.png" alt="">',
                color: 'lime',
                size: 'sm',
                disabled: state.busy || !player._revealed || player._disableHire,
                onClick: () => handleHirePlayer(playerId),
            }));

            actionRow.appendChild(TmUI.button({
                slot: 'Fire <img src="/pics/small_red_x.png" alt="">',
                color: 'danger',
                size: 'sm',
                disabled: state.busy || !player._revealed,
                onClick: () => handleFirePlayer(playerId),
            }));
        });
    };

    const menuItems = parseMenu();

    injectStyles();

    main.classList.add('tmvu-yd-page');
    main.innerHTML = `
        <section class="tmvu-yd-main"></section>
    `;

    if (menuItems.length) {
        TmSideMenu.mount(main, {
            id: 'tmvu-yd-side-menu',
            items: menuItems,
            currentHref: menuItems.find(item => item.isSelected)?.href || window.location.pathname,
        });
    }

    const mainColumn = main.querySelector('.tmvu-yd-main');
    if (!mainColumn) return;

    renderPage();
})();