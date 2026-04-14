import { TmTable } from '../components/shared/tm-table.js';
import { TmCheckbox } from '../components/shared/tm-checkbox.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmPosition } from '../lib/tm-position.js';
import { TmUtils } from '../lib/tm-utils.js';
import { TmClubModel } from '../models/club.js';
import { injectPlayersPageStyles } from './players-styles.js';
import playerDbBackupSelected from '../../api_responses/playerdb-backup-selected-2026-04-06.json';

const RESERVES_URL = '/players/#/a//b/true/';
let backupSeedPromise = null;

const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatTiDelta = (value) => {
    const n = Number(value) || 0;
    if (!n) return '0';
    return `${n > 0 ? '+' : ''}${n}`;
};

const getSkillValue = (player, index) => Number(player.skills?.[index]?.value || 0);

const getLatestRecordPair = (player) => {
    const recordKeys = TmUtils.sortAgeKeys(Object.keys(player?.records || {}));
    if (recordKeys.length < 2) return { latestRecord: null, previousRecord: null };
    // console.log(player.name, player.records?.[recordKeys.at(-1)], player.records?.[recordKeys.at(-2)]);
    return {
        latestRecord: player.records?.[recordKeys.at(-1)] || null,
        previousRecord: player.records?.[recordKeys.at(-2)] || null,
    };
};

const getSkillChanges = (player) => {
    const { latestRecord, previousRecord } = getLatestRecordPair(player);
    if (!Array.isArray(latestRecord?.skills) || !Array.isArray(previousRecord?.skills)) return [];

    return latestRecord.skills
        .map((value, index) => {
            const latestValue = Number(value);
            const previousValue = Number(previousRecord.skills[index]);
            if (!Number.isFinite(latestValue) || !Number.isFinite(previousValue)) return null;

            const delta = latestValue - previousValue;
            if (!delta) return null;

            return {
                index,
                delta,
                type: delta > 0 ? 'pos' : 'neg',
            };
        })
        .filter(Boolean);
};

const getR5Change = (player) => {
    const { latestRecord, previousRecord } = getLatestRecordPair(player);
    const latestValue = Number(latestRecord?.R5);
    const previousValue = Number(previousRecord?.R5);
    if (!Number.isFinite(latestValue) || !Number.isFinite(previousValue)) return null;

    return latestValue - previousValue;
};

const skillCellHtml = (player, index) => {
    const value = getSkillValue(player, index);
    const change = player.skillChanges?.find((item) => item.index === index) || null;
    const toneCls = change?.type ? ` ${change.type}` : '';
    const cls = `${value >= 20 ? ' max' : value >= 19 ? ' elite' : ''}${toneCls}`;
    const label = value >= 20 ? '★' : value >= 19 ? `☆.${value.toFixed(2).split('.')[1]}` : value.toFixed(2);
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
});

const seedPlayersFromBackup = async () => {
    if (backupSeedPromise) return backupSeedPromise;

    backupSeedPromise = Promise.all(
        Object.entries(playerDbBackupSelected || {}).map(([playerId, data]) => TmPlayerDB.set(playerId, data))
    ).catch((error) => {
        backupSeedPromise = null;
        throw error;
    });

    return backupSeedPromise;
};

export function initPlayersPage(main) {
    if (!/^\/players\/?$/i.test(window.location.pathname)) return;
    if (document.getElementById('tmvu-players-shell')) return;

    injectPlayersPageStyles();

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
        squads: {
            main: createSquadModel('main', 'Main Squad', true),
            reserves: createSquadModel('reserves', 'Reserves', false),
        },
        reserveLoadStarted: false,
    };

    const decoratePlayers = (players) => players.map((player) => ({
        ...player,
        skillChanges: getSkillChanges(player),
        r5Change: getR5Change(player),
    }));


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
            { key: 'no', label: '#', align: 'c', width: '42px', defaultSortDir: 1 },
            {
                key: 'name',
                label: 'Player',
                width: '220px',
                defaultSortDir: 1,
                sort: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
                render: (_, item) => `<div class="tmvu-players-name"><a href="/players/${escapeHtml(item.id)}/">${escapeHtml(item.name)}</a></div>`
            },
            {
                key: 'ageMonths',
                label: 'Age',
                align: 'c',
                width: '60px',
                defaultSortDir: 1,
                sort: (a, b) => (Number(a.ageMonths) || 0) - (Number(b.ageMonths) || 0),
                render: (_, item) => escapeHtml(item.ageMonthsString)
            },
            {
                key: 'positions',
                label: 'Pos',
                align: 'c',
                width: '92px',
                defaultSortDir: 1,
                render: (_, item) => TmPosition.chip(item.positions.filter((position) => position.preferred))
            },
        ];

        const skillHeaders = skillLabels.map((label, index) => ({
            key: `skill_${index}`,
            label,
            align: 'c',
            width: '42px',
            defaultSortDir: -1,
            sort: (a, b) => getSkillValue(a, index) - getSkillValue(b, index),
            render: (_, item) => skillCellHtml(item, index),
        }));

        return [
            ...baseHeaders,
            ...skillHeaders,
            {
                key: 'ti',
                label: 'TI',
                align: 'r',
                width: '54px',
                defaultSortDir: -1,
                sort: (a, b) => (Number(a.ti) || -Infinity) - (Number(b.ti) || -Infinity),
                render: (_, item) => {
                    const value = Number(item.ti);
                    if (!Number.isFinite(value)) return '<span class="tmvu-players-r5 is-pending">...</span>';
                    const delta = Number(item.TI_change);
                    const deltaHtml = Number.isFinite(delta) && delta !== 0
                        ? `<span class="tmvu-players-delta ${delta > 0 ? 'pos' : 'neg'}">${escapeHtml(formatTiDelta(delta))}</span>`
                        : '';
                    return `<span class="tmvu-players-r5-stack"><span class="tmvu-players-r5">${escapeHtml(String(value))}</span>${deltaHtml}</span>`;
                }
            },
            {
                key: 'r5',
                label: 'R5',
                align: 'r',
                width: '64px',
                defaultSortDir: -1,
                sort: (a, b) => (Number(a.r5) || -Infinity) - (Number(b.r5) || -Infinity),
                render: (_, item) => {
                    const value = item.r5;
                    if (value == null) return '<span class="tmvu-players-r5 is-pending">...</span>';
                    const delta = Number(item.r5Change);
                    const deltaHtml = Number.isFinite(delta) && delta !== 0
                        ? `<span class="tmvu-players-delta ${delta > 0 ? 'pos' : 'neg'}">${escapeHtml(`${delta > 0 ? '+' : ''}${delta.toFixed(2)}`)}</span>`
                        : '';
                    return `<span class="tmvu-players-r5-stack"><span class="tmvu-players-r5">${escapeHtml(TmUtils.formatR5(value))}</span>${deltaHtml}</span>`;
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
                    sortKey: 'no',
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

    const fetchSquadForRender = async (clubId) => {
        if (!clubId) return [];
        // await seedPlayersFromBackup();
        const players = await TmClubModel.fetchSquadRaw(clubId, true) || [];
        return decoratePlayers(players);
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
        const players = await fetchSquadForRender(clubId);

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
            squad.players = await fetchSquadForRender(clubId);
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
