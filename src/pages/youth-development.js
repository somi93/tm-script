import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmPosition } from '../lib/tm-position.js';
import { TmYouthService } from '../services/youth.js';

'use strict';

const STYLE_ID = 'tmvu-youth-development-style';
let mountedMain = null;
let mainColumn = null;
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
const metricHtml = (opts) => TmUI.metric(opts);
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
        if (value >= thresholds[index]) return colors[index]?.color || 'var(--tmu-text-strong)';
    }
    return colors[colors.length - 1]?.color || 'var(--tmu-text-muted)';
};

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    injectTmPageLayoutStyles();

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
            .tmvu-yd-page {
            }

            .tmvu-yd-hero-card {
                grid-template-columns: minmax(0, 1fr) auto;
                gap: var(--tmu-space-lg);
                align-items: end;
                overflow: hidden;
                padding: var(--tmu-space-xl);
                background:
                    radial-gradient(circle at top left, var(--tmu-success-fill-soft), transparent 34%),
                    linear-gradient(140deg, var(--tmu-surface-card), var(--tmu-surface-dark-muted));
                border: 1px solid var(--tmu-border-soft-alpha-mid);
                box-shadow: 0 12px 28px var(--tmu-shadow-elev);
            }

            .tmvu-yd-hero-side {
                display: flex;
                align-items: flex-start;
            }

            .tmvu-yd-method {
                margin-top: 0;
            }

            .tmvu-yd-method-title {
                color: var(--tmu-text-panel-label);
                font-size: var(--tmu-font-xs);
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-yd-method p {
                margin: var(--tmu-space-sm) 0 0;
                color: var(--tmu-text-main);
                font-size: var(--tmu-font-sm);
                line-height: 1.65;
            }

            .tmvu-yd-hero-note {
                min-width: 176px;
                padding: var(--tmu-space-md);
                border-radius: var(--tmu-space-md);
                border: 1px solid var(--tmu-border-soft-alpha);
                background: var(--tmu-success-fill-faint);
            }

            .tmvu-yd-hero-note .tmvu-yd-hero-metric {
                padding: 0;
                background: transparent;
                border: 0;
                box-shadow: none;
            }

            .tmvu-yd-hero-note .tmvu-yd-hero-metric .tmu-metric-value {
                font-size: var(--tmu-font-xl);
                line-height: 1;
            }

            .tmvu-yd-toolbar {
                display: flex;
                flex-wrap: wrap;
                align-items: end;
                justify-content: space-between;
                gap: var(--tmu-space-md);
                margin-top: var(--tmu-space-lg);
            }

            .tmvu-yd-control-group,
            .tmvu-yd-bulk-actions {
                display: flex;
                flex-wrap: wrap;
                gap: var(--tmu-space-sm);
                align-items: end;
            }

            .tmvu-yd-select-wrap {
                display: grid;
                gap: var(--tmu-space-xs);
                min-width: 128px;
            }

            .tmvu-yd-select {
                min-height: 34px;
                padding: var(--tmu-space-sm) var(--tmu-space-md);
                border-radius: var(--tmu-space-md);
                border: 1px solid var(--tmu-border-soft-alpha-mid);
                background: var(--tmu-surface-input-dark);
                color: var(--tmu-text-strong);
                font: inherit;
                font-size: var(--tmu-font-sm);
                font-weight: 700;
            }

            .tmvu-yd-select:focus {
                outline: 1px solid var(--tmu-border-input-overlay);
                border-color: var(--tmu-border-input-overlay);
            }

            .tmvu-yd-player-card {
                display: grid;
                gap: var(--tmu-space-md);
                padding: var(--tmu-space-lg) var(--tmu-space-lg) var(--tmu-space-lg);
                min-width: 0;
                border-radius: var(--tmu-space-lg);
                background: linear-gradient(180deg, var(--tmu-surface-dark-strong), var(--tmu-surface-dark-muted));
                border: 1px solid var(--tmu-border-soft-alpha);
                box-shadow: 0 10px 22px var(--tmu-shadow-elev);
                position: relative;
            }

            .tmvu-yd-player-card::before {
                content: '';
                position: absolute;
                inset: 0 auto 0 0;
                width: var(--tmu-space-xs);
                border-radius: var(--tmu-space-lg) 0 0 var(--tmu-space-lg);
                background: linear-gradient(180deg, var(--tmu-success-strong), var(--tmu-success-fill-strong));
            }

            .tmvu-yd-player-top {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                gap: var(--tmu-space-lg);
                align-items: start;
                min-width: 0;
            }

            .tmvu-yd-player-ident {
                min-width: 0;
            }

            .tmvu-yd-player-age {
                color: var(--tmu-text-panel-label);
                font-size: var(--tmu-font-xs);
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-yd-player-name-row {
                display: flex;
                flex-wrap: wrap;
                gap: var(--tmu-space-md);
                align-items: center;
                margin-top: var(--tmu-space-sm);
            }

            .tmvu-yd-player-name {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-2xl);
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
                gap: var(--tmu-space-md);
                margin-top: var(--tmu-space-md);
                padding-top: var(--tmu-space-md);
                border-top: 1px solid var(--tmu-border-soft-alpha);
            }

            .tmvu-yd-stars-value {
                color: var(--tmu-text-strong);
                line-height: 1;
            }

            .tmvu-yd-actions-row {
                display: flex;
                flex-wrap: wrap;
                gap: var(--tmu-space-sm);
                margin-top: var(--tmu-space-md);
            }

            .tmvu-yd-rating-row {
                display: grid;
                grid-template-columns: repeat(4, minmax(82px, 1fr));
                gap: var(--tmu-space-sm);
                min-width: min(100%, 392px);
            }

            .tmvu-yd-rating-row .tmu-metric,
            .tmvu-yd-skills .tmu-metric {
                border-radius: var(--tmu-space-md);
                border: 1px solid var(--tmu-border-soft-alpha);
            }

            .tmvu-yd-rating-row .tmu-metric {
                min-width: 0;
            }

            .tmvu-yd-rating-row .tmu-metric-value {
                font-size: var(--tmu-font-xl);
                line-height: 1;
            }

            .tmvu-yd-skills-panel {
                padding: var(--tmu-space-md);
                border-radius: var(--tmu-space-lg);
                border: 1px solid var(--tmu-border-soft-alpha);
                background: var(--tmu-surface-dark-muted);
            }

            .tmvu-yd-skills-panel-hidden {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: var(--tmu-space-md);
            }

            .tmvu-yd-hidden-copy {
                color: var(--tmu-text-main);
                font-size: var(--tmu-font-sm);
                line-height: 1.55;
                max-width: 52ch;
            }

            .tmvu-yd-hidden-copy strong {
                color: var(--tmu-text-strong);
            }

            .tmvu-yd-player-card-status::before {
                background: linear-gradient(180deg, var(--tmu-success-fill-strong), var(--tmu-success-fill-soft));
            }

            .tmvu-yd-player-status {
                display: grid;
                gap: var(--tmu-space-sm);
                min-width: 0;
            }

            .tmvu-yd-player-status-title {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-lg);
                font-weight: 900;
                line-height: 1.2;
            }

            .tmvu-yd-player-status-copy {
                color: var(--tmu-text-main);
                font-size: var(--tmu-font-sm);
                line-height: 1.6;
            }

            .tmvu-yd-player-status-copy a {
                color: var(--tmu-accent);
                text-decoration: none;
            }

            .tmvu-yd-player-status-copy a:hover {
                text-decoration: underline;
            }

            .tmvu-yd-skills {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(62px, 1fr));
                gap: var(--tmu-space-sm);
            }

            .tmvu-yd-skill {
                min-width: 0;
            }

            .tmvu-yd-skills .tmu-metric {
                background: var(--tmu-surface-input-dark);
            }

            .tmvu-yd-skills .tmu-metric-value {
                font-size: var(--tmu-font-md);
                line-height: 1;
            }

            @keyframes tmvu-yd-skill-in {
                from { opacity: 0; transform: scale(0.82) translateY(3px); }
                to   { opacity: 1; transform: none; }
            }
        `;

    document.head.appendChild(style);
};

const parseMenu = (sourceRoot) => Array.from(sourceRoot.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
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

const parseSelectOptions = (sourceRoot, selector) => {
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

const parsePullControls = (sourceRoot) => {
    const ageOptions = parseSelectOptions(sourceRoot, '#age_focus');
    const positionOptions = parseSelectOptions(sourceRoot, '#position_focus');
    const pullButton = sourceRoot.querySelector('#pull_new_youths');
    return {
        available: Boolean(pullButton && ageOptions.length && positionOptions.length),
        visible: Boolean(isNodeVisible(pullButton) && ageOptions.length && positionOptions.length),
        label: cleanText(pullButton?.textContent) || 'Pull New Youths',
        ageOptions,
        positionOptions,
        selectedAge: ageOptions.reduce((min, o) => Number(o.value) < Number(min) ? o.value : min, ageOptions[0]?.value || ''),
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

let state = null;

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
    const hero = document.createElement('div');
    TmHeroCard.mount(hero, {
        heroClass: 'tmvu-yd-hero-card',
        sideClass: 'tmvu-yd-hero-side',
        slots: {
            title: 'Youth Development',
            main: `
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
                `,
            side: `
                    <div class="tmvu-yd-hero-note">
                        ${metricHtml({ label: 'Active / Hidden', value: `${activePlayers.length} / ${hiddenPlayers.length}`, tone: 'overlay', size: 'xl', cls: 'tmvu-yd-hero-metric' })}
                    </div>
                `,
            footer: state.notice ? TmUI.notice(state.notice) : '',
        },
    });
    return hero.innerHTML;
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
        .map(skill => metricHtml({
            label: escapeHtml(SKILL_LABELS[skill.key] || skill.name || '?'),
            value: String(Number(skill.value) || 0),
            tone: 'muted',
            size: 'sm',
            cls: 'tmvu-yd-skill',
        })).join('');

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
                        ${metricHtml({ label: 'ASI', value: isRevealed ? formatNumber(player.asi) : '--', tone: 'overlay', size: 'lg' })}
                        ${metricHtml({ label: 'R5', value: isRevealed ? formatFloat(player.r5, 1) : '--', tone: 'overlay', size: 'lg', valueAttrs: { style: `color:${isRevealed ? r5Color : 'var(--tmu-text-muted)'}` } })}
                        ${metricHtml({ label: 'REC', value: isRevealed ? formatFloat(player.rec, 2) : '--', tone: 'overlay', size: 'lg', valueAttrs: { style: `color:${isRevealed ? recColor : 'var(--tmu-text-muted)'}` } })}
                        ${metricHtml({ label: 'Skill Sum', value: isRevealed ? String(skillSum) : '--', tone: 'overlay', size: 'lg' })}
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
        return TmUI.empty('Youth player data was not available from the endpoint.');
    }

    return `
            <section class="tmvu-yd-player-grid tmu-stack tmu-stack-density-regular">
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
    const card = document.getElementById(`tmvu-youth-player-${Number(playerId)}`);
    if (card) {
        const skills = card.querySelectorAll('.tmvu-yd-skill');
        skills.forEach((el, i) => {
            el.style.animation = `tmvu-yd-skill-in 0.25s ${(i * 0.4).toFixed(1)}s ease both`;
        });
        const afterSkills = `${((skills.length > 0 ? (skills.length - 1) * 0.4 : 0) + 0.35).toFixed(2)}s`;
        card.querySelectorAll('.tmvu-yd-rating-row .tmu-metric').forEach(el => {
            el.style.animation = `tmvu-yd-skill-in 0.3s ${afterSkills} ease both`;
        });
        const starsValue = card.querySelector('.tmvu-yd-stars-value');
        if (starsValue) starsValue.style.animation = `tmvu-yd-skill-in 0.3s ${afterSkills} ease both`;
    }
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

export async function initYouthDevelopmentPage(main) {
    const routeMatches = /^\/youth-development(?:\/.*)?$/i.test(window.location.pathname);
    const pageTitleText = String(document.querySelector('.main_center .box_head h2, .tmvu-main .box_head h2')?.textContent || '').replace(/\s+/g, ' ').trim();
    const menuText = String(document.querySelector('.column1 .content_menu, .tmvu-main .column1 .content_menu')?.textContent || '').replace(/\s+/g, ' ').trim();
    const looksLikeYouthPage = /youth development/i.test(pageTitleText)
        || (/training/i.test(menuText) && /players/i.test(menuText) && /facilit/i.test(menuText));
    if (!routeMatches && !looksLikeYouthPage) return;
    if (!main || !main.isConnected) return;
    if (mountedMain === main && mainColumn?.isConnected) return;

    const sourceRoot = document.querySelector('.main_center');
    if (!sourceRoot) return;
    if (!sourceRoot.querySelector('.column1 .content_menu, #age_focus, #position_focus')) return;

    mountedMain = main;

    const pullControls = parsePullControls(sourceRoot);
    const initialData = await TmYouthService.fetchYouthPlayers({ skipSync: true });
    state = {
        busy: false,
        notice: '',
        cash: Number(initialData?.cash) || 0,
        squadSize: Number(initialData?.squad_size) || 0,
        pull: pullControls,
        selectedAge: pullControls.selectedAge,
        selectedPosition: pullControls.selectedPosition,
        players: syncHireAvailability(decoratePlayers(initialData?.players || [], { revealed: true }), Number(initialData?.squad_size) || 0),
    };

    const menuItems = parseMenu(sourceRoot);

    injectStyles();

    main.classList.add('tmvu-yd-page', 'tmu-page-layout-2col', 'tmu-page-density-compact');
    main.innerHTML = `
            <section class="tmvu-yd-main tmu-page-section-stack"></section>
        `;

    if (menuItems.length) {
        TmSideMenu.mount(main, {
            id: 'tmvu-yd-side-menu',
            className: 'tmu-page-sidebar-stack',
            items: menuItems,
            currentHref: menuItems.find(item => item.isSelected)?.href || window.location.pathname,
        });
    }

    mainColumn = main.querySelector('.tmvu-yd-main');
    if (!mainColumn) return;

    if (!mainColumn.dataset.tmvuYouthFiltersBound) {
        mainColumn.dataset.tmvuYouthFiltersBound = '1';
        mainColumn.addEventListener('change', (event) => {
            const ageSelect = event.target.closest('[data-youth-age]');
            if (ageSelect) {
                state.selectedAge = ageSelect.value;
                return;
            }

            const positionSelect = event.target.closest('[data-youth-position]');
            if (positionSelect) {
                state.selectedPosition = positionSelect.value;
            }
        });
    }

    renderPage();
}