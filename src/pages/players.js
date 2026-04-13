import { TmTable } from '../components/shared/tm-table.js';
import { TmCheckbox } from '../components/shared/tm-checkbox.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmPosition } from '../lib/tm-position.js';
import { TmUtils } from '../lib/tm-utils.js';
import { TmClubService } from '../services/club.js';

const STYLE_ID = 'tmvu-players-page-style';
const RESERVES_URL = '/players/#/a//b/true/';

function injectPlayersPageStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-players-shell {
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-lg);
            width: 100%;
            min-width: 0;
        }
        .tmvu-players-head {
            display: flex;
            align-items: center;
            gap: var(--tmu-space-md);
            padding: 0 0 var(--tmu-space-sm);
        }
        .tmvu-players-title {
            margin: 0;
            color: var(--tmu-text-strong);
            font-size: 24px;
            font-weight: 800;
            letter-spacing: .01em;
        }
        .tmvu-players-controls {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--tmu-space-md);
            margin-bottom: var(--tmu-space-md);
        }
        .tmvu-players-sections {
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-lg);
            min-width: 0;
        }
        .tmvu-players-sections > section {
            min-width: 0;
        }
        .tmvu-players-table-wrap {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow-x: auto;
            overflow-y: hidden;
        }
        .tmvu-players-section-title {
            margin: 0 0 var(--tmu-space-sm);
            font-size: var(--tmu-font-md);
            font-weight: 800;
            color: var(--tmu-text-strong);
        }
        .tmvu-players-table .tmvu-players-name a {
            color: var(--tmu-text-strong);
            text-decoration: none;
            font-weight: 700;
        }
        .tmvu-players-table .tmvu-players-name a:hover {
            color: var(--tmu-accent);
            text-decoration: none;
        }
        .tmvu-players-table .tmvu-players-pos {
            color: var(--tmu-text-muted);
            font-weight: 700;
            white-space: nowrap;
        }
        .tmvu-players-table .tmvu-players-r5 {
            color: var(--tmu-text-strong);
            font-weight: 700;
        }
        .tmvu-players-table .tmvu-players-r5.is-pending {
            color: var(--tmu-text-faint);
        }
        .tmvu-players-table .tmvu-players-delta {
            font-weight: 700;
        }
        .tmvu-players-table .tmvu-players-delta.pos {
            color: var(--tmu-success);
        }
        .tmvu-players-table .tmvu-players-delta.neg {
            color: var(--tmu-danger);
        }
        .tmvu-players-skill-cell {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1px;
            min-width: 44px;
            width: 100%;
            padding: 3px 4px;
            border-radius: var(--tmu-space-xs);
            font-weight: 700;
            color: var(--tmu-text-main);
        }
        .tmvu-players-skill-cell.gain-decimal {
            background: color-mix(in srgb, var(--tmu-success) 14%, transparent);
        }
        .tmvu-players-skill-cell.gain-integer {
            background: color-mix(in srgb, var(--tmu-success) 28%, transparent);
        }
        .tmvu-players-skill-cell.loss-decimal,
        .tmvu-players-skill-cell.loss-integer {
            background: color-mix(in srgb, var(--tmu-danger) 12%, transparent);
        }
        .tmvu-players-skill-cell.max {
            color: var(--tmu-metal-gold);
        }
        .tmvu-players-skill-cell.elite {
            color: var(--tmu-metal-silver);
        }
        .tmvu-players-skill-main {
            line-height: 1.1;
        }
        .tmvu-players-skill-delta {
            font-size: 10px;
            line-height: 1;
            font-weight: 700;
        }
        .tmvu-players-skill-delta.pos {
            color: var(--tmu-success-strong);
        }
        .tmvu-players-skill-delta.neg {
            color: var(--tmu-danger);
        }
        .tmvu-players-empty {
            padding: var(--tmu-space-md) 0;
            color: var(--tmu-text-muted);
        }
        .tmvu-players-source-frame {
            width: 0;
            height: 0;
            border: 0;
            position: absolute;
            left: -9999px;
            top: -9999px;
            opacity: 0;
            pointer-events: none;
        }
    `;

    document.head.appendChild(style);
}

const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const installJqueryBrowserCompat = () => {
    const jq = window.jQuery || window.$;
    if (!jq || jq.browser) return !!jq;
    const ua = navigator.userAgent || '';
    const msieMatch = ua.match(/(?:msie |rv:)(\d+(?:\.\d+)?)/i);
    jq.browser = {
        msie: /msie|trident/i.test(ua),
        version: msieMatch ? msieMatch[1] : '0'
    };
    return true;
};

const formatTiDelta = (value) => {
    const n = Number(value) || 0;
    if (!n) return '0';
    return `${n > 0 ? '+' : ''}${n}`;
};

const numericSkills = (skills = []) => skills.map((skill) => {
    if (typeof skill === 'object' && skill !== null) return Number(skill.value) || 0;
    return Number(skill) || 0;
});
const toDisplayPlayer = (player, squadKey) => {
    const ageYears = Number(player.age) || 0;
    const ageMonths = Number(player.months) || 0;
    return {
        ...player,
        pid: String(player.id || player.player_id || ''),
        name: player.name || player.player_name || '',
        ageYears,
        ageMonths,
        ageLabel: `${ageYears}.${ageMonths}`,
        ageSort: (ageYears * 12) + ageMonths,
        position: player.favposition || '',
        isGK: !!player.isGK,
        skills: numericSkills(player.skills),
        playerHref: `/players/${player.id || player.player_id}/`,
        TI: Number(player.ti) || 0,
        TI_change: 0,
        squadKey,
        r5: player.r5 != null ? Number(player.r5) : null,
        skillChanges: [],
    };
};

const skillCellHtml = (player, index) => {
    const value = Number(player.skills?.[index] || 0);
    const change = player.skillChanges?.find((item) => item.index === index) || null;
    const toneCls = change?.type ? ` ${change.type}` : '';
    const cls = `${value >= 20 ? ' max' : value >= 19 ? ' elite' : ''}${toneCls}`;
    const label = value >= 20 ? '★' : value >= 19 ? '☆' : value.toFixed(2);
    const title = value >= 19 ? String(value) : '';
    const deltaText = change ? `${change.delta > 0 ? '+' : ''}${change.delta.toFixed(2)}` : '';
    const deltaHtml = deltaText && deltaText !== '+0.00' && deltaText !== '-0.00' && deltaText !== '0.00'
        ? `<span class="tmvu-players-skill-delta ${change.delta > 0 ? 'pos' : 'neg'}">${deltaText}</span>`
        : '';
    return `<span class="tmvu-players-skill-cell${cls}"${title ? ` title="${title}"` : ''}><span class="tmvu-players-skill-main">${label}</span>${deltaHtml}</span>`;
};

const createSquadModel = (key, label, defaultVisible) => ({
    key,
    label,
    visible: defaultVisible,
    players: [],
    loaded: false,
    loading: false,
    loadError: '',
    syncState: 'idle',
    syncMessage: '',
});

export function initPlayersPage(main) {
    if (!/^\/players\/?$/i.test(window.location.pathname)) return;
    if (document.getElementById('tmvu-players-shell')) return;

    injectPlayersPageStyles();
    installJqueryBrowserCompat();

    const { SKILL_LABELS_OUT, SKILL_NAMES_GK_SHORT } = TmConst;

    const sourceRoot = document.querySelector('.main_center') || document.body;
    const renderHost = main || sourceRoot;

    if (main) {
        main.classList.add('tmvu-players-page', 'tmu-page-density-regular');
        main.style.minWidth = '0';
    }

    const shell = document.createElement('div');
    shell.id = 'tmvu-players-shell';
    shell.className = 'tmvu-players-shell tmu-panel-page';

    const head = document.createElement('div');
    head.className = 'tmvu-players-head';
    head.innerHTML = '<div class="tmvu-players-title">Players</div>';
    shell.appendChild(head);

    const controlsHost = document.createElement('div');
    const sectionsHost = document.createElement('div');
    sectionsHost.className = 'tmvu-players-sections';
    shell.appendChild(controlsHost);
    shell.appendChild(sectionsHost);
    renderHost.appendChild(shell);

    const state = {
        metricsByPid: {},
        squads: {
            main: createSquadModel('main', 'Main Squad', true),
            reserves: createSquadModel('reserves', 'Reserves', false),
        },
        reserveLoadStarted: false,
    };

    const decoratePlayers = (players, squadKey) => players.map((player) => toDisplayPlayer(player, squadKey));


    const createSectionHost = (title) => {
        const host = document.createElement('section');
        const heading = document.createElement('h3');
        heading.className = 'tmvu-players-section-title';
        heading.textContent = title;
        const body = document.createElement('div');
        body.className = 'tmvu-players-table-wrap';
        host.appendChild(heading);
        host.appendChild(body);
        sectionsHost.appendChild(host);
        return body;
    };

    const buildTableHeaders = (isGK) => {
        const skillLabels = isGK ? SKILL_NAMES_GK_SHORT : SKILL_LABELS_OUT;
        const baseHeaders = [
            { key: 'number', label: '#', align: 'c', width: '42px', defaultSortDir: 1 },
            {
                key: 'name',
                label: 'Player',
                width: '220px',
                defaultSortDir: 1,
                sort: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
                render: (_, item) => `<div class="tmvu-players-name"><a href="${escapeHtml(item.playerHref)}">${escapeHtml(item.name)}</a></div>`
            },
            { key: 'ageSort', label: 'Age', align: 'c', width: '60px', defaultSortDir: 1, render: (_, item) => escapeHtml(item.ageLabel) },
            { key: 'position', label: 'Pos', align: 'c', width: '92px', defaultSortDir: 1, render: (_, item) => TmPosition.chip(String(item.position || '').split(',').map(s => s.trim()).filter(Boolean)) },
        ];

        const skillHeaders = skillLabels.map((label, index) => ({
            key: `skill_${index}`,
            label,
            align: 'c',
            width: '42px',
            defaultSortDir: -1,
            sort: (a, b) => (Number(a.skills?.[index]) || 0) - (Number(b.skills?.[index]) || 0),
            render: (_, item) => skillCellHtml(item, index),
        }));

        return [
            ...baseHeaders,
            ...skillHeaders,
            { key: 'TI', label: 'TI', align: 'r', width: '54px', defaultSortDir: -1 },
            {
                key: 'TI_change',
                label: 'Δ',
                align: 'r',
                width: '54px',
                defaultSortDir: -1,
                render: (_, item) => {
                    const value = Number(item.TI_change) || 0;
                    const cls = value > 0 ? ' pos' : value < 0 ? ' neg' : '';
                    return `<span class="tmvu-players-delta${cls}">${escapeHtml(formatTiDelta(value))}</span>`;
                }
            },
            {
                key: 'r5',
                label: 'R5',
                align: 'r',
                width: '64px',
                defaultSortDir: -1,
                sort: (a, b) => (((state.metricsByPid[a.pid]?.r5 ?? a.r5) ?? -Infinity) - (((state.metricsByPid[b.pid]?.r5 ?? b.r5) ?? -Infinity))),
                render: (_, item) => {
                    const value = state.metricsByPid[item.pid]?.r5 ?? item.r5;
                    if (value == null) return '<span class="tmvu-players-r5 is-pending">...</span>';
                    return `<span class="tmvu-players-r5">${escapeHtml(TmUtils.formatR5(value))}</span>`;
                }
            },
        ];
    };

    const renderControls = () => {
        controlsHost.innerHTML = '';
        const row = document.createElement('div');
        row.className = 'tmvu-players-controls';

        const mainToggle = TmCheckbox.checkboxField({
            checked: state.squads.main.visible,
            label: 'Main Squad',
            onChange: (event) => {
                state.squads.main.visible = !!event.target.checked;
                render();
            },
        });

        const reserveToggle = TmCheckbox.checkboxField({
            checked: state.squads.reserves.visible,
            label: 'Reserves',
            onChange: (event) => {
                state.squads.reserves.visible = !!event.target.checked;
                if (state.squads.reserves.visible && !state.reserveLoadStarted) {
                    loadReserveSquad().catch((error) => console.error('[Players] Reserve load failed:', error));
                }
                render();
            },
        });

        row.appendChild(mainToggle);
        row.appendChild(reserveToggle);
        controlsHost.appendChild(row);
    };

    const renderSections = () => {
        sectionsHost.innerHTML = '';

        const activeSquads = Object.values(state.squads).filter((squad) => squad.visible);
        if (!activeSquads.length) {
            const body = createSectionHost('No Squad Selected');
            body.innerHTML = '<div class="tmvu-players-empty">No squad is selected.</div>';
            return;
        }

        activeSquads.forEach((squad) => {
            if (squad.loading && !squad.players.length) {
                const body = createSectionHost(squad.label);
                body.innerHTML = '<div class="tmvu-players-empty">Loading players...</div>';
                return;
            }

            if (squad.loadError && !squad.players.length) {
                const body = createSectionHost(squad.label);
                body.innerHTML = `<div class="tmvu-players-empty">${escapeHtml(squad.loadError)}</div>`;
                return;
            }

            const sections = [
                { title: `${squad.label} • Outfield`, isGK: false, players: squad.players.filter((player) => !player.isGK) },
                { title: `${squad.label} • Goalkeepers`, isGK: true, players: squad.players.filter((player) => player.isGK) },
            ].filter((section) => section.players.length);

            if (!sections.length) {
                const body = createSectionHost(squad.label);
                body.innerHTML = '<div class="tmvu-players-empty">No players available.</div>';
                return;
            }

            sections.forEach((section) => {
                const body = createSectionHost(section.title);
                const table = TmTable.table({
                    headers: buildTableHeaders(section.isGK),
                    items: section.players,
                    density: 'tight',
                    cls: 'tmvu-players-table',
                    sortKey: 'number',
                    sortDir: 1,
                    emptyText: 'No players found.',
                });
                body.appendChild(table);
            });
        });
    };

    const render = () => {
        renderControls();
        renderSections();
    };

    const fetchSquadForRender = async (clubId, squadKey) => {
        if (!clubId) return [];
        const data = await TmClubService.fetchSquadRaw(clubId, { skipSync: true });
        const players = Array.isArray(data?.post) ? data.post : [];
        return decoratePlayers(players, squadKey);
    };

    const loadSquadFromIframe = (path) => new Promise((resolve, reject) => {
        const frame = document.createElement('iframe');
        frame.className = 'tmvu-players-source-frame';
        frame.src = `${window.location.origin}${path}`;
        document.body.appendChild(frame);

        let pollTimer = null;
        let timeoutTimer = null;

        const cleanup = () => {
            if (pollTimer) window.clearInterval(pollTimer);
            if (timeoutTimer) window.clearTimeout(timeoutTimer);
            frame.remove();
        };

        const tryParse = () => {
            try {
                const doc = frame.contentDocument;
                if (!hasSquadRows(doc)) return;
                const parsed = parseSquadDocument(doc);
                if (parsed?.length) {
                    cleanup();
                    resolve(parsed);
                }
            } catch (error) {
                cleanup();
                reject(error);
            }
        };

        frame.addEventListener('load', () => {
            tryParse();
            pollTimer = window.setInterval(tryParse, 300);
            timeoutTimer = window.setTimeout(() => {
                cleanup();
                reject(new Error('Reserve squad table did not load in time.'));
            }, 20000);
        }, { once: true });
    });

    const loadMainSquad = async () => {
        const squad = state.squads.main;
        squad.loading = true;
        squad.loadError = '';
        render();

        const clubId = String(window.SESSION?.main_id || window.SESSION?.club_id || '').trim();
        const players = await fetchSquadForRender(clubId, 'main');
        squad.loading = false;

        if (!players.length) {
            squad.loadError = 'Main squad endpoint returned no players.';
            render();
            return;
        }

        squad.players = players;
        squad.loaded = true;
        render();
    };

    const loadReserveSquad = async () => {
        const squad = state.squads.reserves;
        if (state.reserveLoadStarted) return;
        state.reserveLoadStarted = true;
        squad.loading = true;
        squad.loadError = '';
        render();

        try {
            const clubId = String(window.SESSION?.b_team || '').trim();
            squad.players = await fetchSquadForRender(clubId, 'reserves');
            squad.loaded = true;
        } catch (error) {
            state.reserveLoadStarted = false;
            squad.loadError = error?.message || `Could not load reserves from ${RESERVES_URL}.`;
        } finally {
            squad.loading = false;
            render();
        }
    };

    render();

    loadMainSquad().catch((error) => {
        state.squads.main.loading = false;
        state.squads.main.loadError = error?.message || 'Main squad load failed.';
        render();
    });
}
