import { TmTable } from '../components/shared/tm-table.js';
import { TmCheckbox } from '../components/shared/tm-checkbox.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmSync } from '../lib/tm-dbsync.js';
import { TmLib } from '../lib/tm-lib.js';
import { TmPosition } from '../lib/tm-position.js';
import { TmPlayerArchiveDB, TmPlayerDB } from '../lib/tm-playerdb.js';
import { TmSquad } from '../lib/tm-squad.js';
import { TmUtils } from '../lib/tm-utils.js';
import { TmClubService } from '../services/club.js';
import { TmPlayerService } from '../services/player.js';

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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const currentAgeKeyOf = (player) => `${player.ageYears}.${player.ageMonths}`;

const previousAgeKeyOf = (player) => {
    const ageMonths = ((Number(player.ageYears) || 0) * 12) + (Number(player.ageMonths) || 0) - 1;
    if (ageMonths < 0) return null;
    return `${Math.floor(ageMonths / 12)}.${ageMonths % 12}`;
};

const numericSkills = (skills = []) => skills.map((skill) => {
    if (typeof skill === 'object' && skill !== null) return Number(skill.value) || 0;
    return Number(skill) || 0;
});

const hasAnyRecordBefore = (store, ageKey) => Object.keys(store?.records || {})
    .some((key) => TmUtils.ageToMonths(key) < TmUtils.ageToMonths(ageKey));

const previousDbRecord = (store, player) => {
    const ageKey = previousAgeKeyOf(player);
    if (!ageKey) return null;
    return store?.records?.[ageKey] || null;
};

const currentDbRecord = (store, player) => {
    const ageKey = currentAgeKeyOf(player);
    return store?.records?.[ageKey] || null;
};

const dbSkillChangesFromStore = (store, player) => {
    const currentRecord = currentDbRecord(store, player);
    const previousRecord = previousDbRecord(store, player);
    if (!currentRecord?.skills || !previousRecord?.skills) return [];

    const currentSkills = numericSkills(currentRecord.skills);
    const previousSkills = numericSkills(previousRecord.skills);
    const changes = [];

    for (let index = 0; index < Math.min(currentSkills.length, previousSkills.length); index++) {
        const currentValue = currentSkills[index];
        const previousValue = previousSkills[index];
        const delta = currentValue - previousValue;
        if (Math.abs(delta) < 0.005) continue;
        const integerChange = Math.floor(currentValue) !== Math.floor(previousValue);
        changes.push({
            index,
            delta,
            type: delta > 0
                ? (integerChange ? 'gain-integer' : 'gain-decimal')
                : (integerChange ? 'loss-integer' : 'loss-decimal')
        });
    }

    return changes;
};

const toDisplayPlayer = (player, squadKey, dbStore = null) => {
    const ageYears = Number(player.age) || 0;
    const ageMonths = Number(player.months) || 0;
    const currentRecord = currentDbRecord(dbStore, { ageYears, ageMonths });
    const displaySkills = currentRecord?.skills ? numericSkills(currentRecord.skills) : numericSkills(player.skills);
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
        skills: displaySkills,
        playerHref: `/players/${player.id || player.player_id}/`,
        TI: Number(player.ti) || 0,
        TI_change: 0,
        squadKey,
        r5: currentRecord?.R5 != null ? Number(currentRecord.R5) : (player.r5 != null ? Number(player.r5) : null),
        skillChanges: dbSkillChangesFromStore(dbStore, { ageYears, ageMonths }),
    };
};

const hasSquadRows = (root = document) => {
    if (!root) return false;
    const sq = typeof root.getElementById === 'function' ? root.getElementById('sq') : root.querySelector?.('#sq');
    if (!sq) return false;
    return sq.querySelectorAll('table tbody tr').length > 0 && sq.querySelectorAll('a[player_link]').length > 0;
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

    const PlayerDB = TmPlayerDB;
    const PlayerArchiveDB = TmPlayerArchiveDB;
    const { SKILL_LABELS_OUT, SKILL_NAMES_GK_SHORT } = TmConst;
    const { extractSkills, createSquadLoader, parseSquadDocument } = TmSquad;

    const buildGrowthPlayer = (player, dbStore) => {
        const records = dbStore?.records || {};
        const currentKey = currentAgeKeyOf(player);
        const currentRecord = records[currentKey] || currentDbRecord(dbStore, player);
        const latestKey = Object.keys(records)
            .sort((a, b) => TmUtils.ageToMonths(b) - TmUtils.ageToMonths(a))[0] || currentKey;
        const latestRecord = records[latestKey] || currentRecord || null;
        const skillSource = currentRecord?.skills || latestRecord?.skills || player.skills || [];
        const skillCount = skillSource.length;
        const isGK = player.isGK ?? dbStore?.meta?.isGK ?? skillCount === 11;
        const positionSource = dbStore?.meta?.pos || player.position || '';
        let positions = String(positionSource).split(',').map((value) => {
            const key = value.trim().toLowerCase();
            return TmConst.POSITION_MAP[key] || null;
        }).filter(Boolean);

        if (!positions.length) {
            positions = isGK
                ? [TmConst.POSITION_MAP.gk]
                : [TmConst.POSITION_MAP.dc || { id: 0 }];
        }

        return {
            id: player.pid,
            isGK,
            positions,
            skills: numericSkills(skillSource),
            routine: Number(currentRecord?.routine ?? latestRecord?.routine) || 0,
            age: player.ageYears,
            months: player.ageMonths,
            ageMonthsString: currentKey,
            asi: Number(currentRecord?.SI ?? latestRecord?.SI) || 0,
        };
    };

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
        dbReady: false,
        dbError: '',
        metricsByPid: {},
        squads: {
            main: createSquadModel('main', 'Main Squad', true),
            reserves: createSquadModel('reserves', 'Reserves', false),
        },
        reserveLoadStarted: false,
    };

    const waitForPlayers = (reader, timeoutMs = 16000) => new Promise((resolve) => {
        const immediate = reader();
        if (immediate?.length) {
            resolve(immediate);
            return;
        }

        const started = Date.now();
        const timer = window.setInterval(() => {
            const players = reader();
            if (players?.length) {
                window.clearInterval(timer);
                resolve(players);
                return;
            }
            if ((Date.now() - started) >= timeoutMs) {
                window.clearInterval(timer);
                resolve([]);
            }
        }, 250);
    });

    const decoratePlayers = (players, squadKey) => players.map((player) => {
        const dbStore = state.dbReady ? PlayerDB.get(String(player.id || player.player_id || player.pid || '')) : null;
        return toDisplayPlayer(player, squadKey, dbStore);
    });

    const seedMetricsFromDb = (players) => {
        if (!state.dbReady || !players?.length) return;
        players.forEach((player) => {
            const dbStore = PlayerDB.get(player.pid);
            const ageKey = currentAgeKeyOf(player);
            const record = dbStore?.records?.[ageKey];
            if (!record) return;
            state.metricsByPid[player.pid] = {
                r5: Number(record.R5) || null,
                rec: Number(record.REREC) || null,
                routine: Number(record.routine) || null,
            };
            if (record.skills) player.skills = numericSkills(record.skills);
            if (record.R5 != null) player.r5 = Number(record.R5);
                player.skillChanges = dbSkillChangesFromStore(dbStore, player);
        });
    };

    const ensureInterpolatedPreviousRecord = async (player) => {
        const dbStore = PlayerDB.get(player.pid);
        const currentKey = currentAgeKeyOf(player);
        const previousKey = previousAgeKeyOf(player);
        if (!dbStore?.records?.[currentKey] || !previousKey || dbStore.records[previousKey]) return false;
        if (!hasAnyRecordBefore(dbStore, previousKey)) return false;

        await TmSync.analyzeGrowth(buildGrowthPlayer(player, dbStore), dbStore, null, null);
        return !!PlayerDB.get(player.pid)?.records?.[previousKey];
    };

    const ensureInterpolatedPreviousRecords = async (players = []) => {
        if (!state.dbReady || !players.length) return false;

        let changed = false;
        for (const player of players) {
            const currentStore = PlayerDB.get(player.pid);
            if (!currentDbRecord(currentStore, player)) continue;
            if (previousDbRecord(currentStore, player)) continue;
            const updated = await ensureInterpolatedPreviousRecord(player);
            if (updated) changed = true;
            await delay(25);
        }

        if (changed) seedMetricsFromDb(players);
        return changed;
    };

    const applySyncResults = (results = []) => {
        results.forEach((result) => {
            state.metricsByPid[result.pid] = {
                r5: Number(result.R5) || null,
                rec: Number(result.REC) || null,
                routine: Number(result.routine) || null,
            };
        });
        Object.values(state.squads).forEach((squad) => {
            squad.players.forEach((player) => {
                const dbStore = PlayerDB.get(player.pid);
                const record = currentDbRecord(dbStore, player);
                if (record?.skills) player.skills = numericSkills(record.skills);
                if (record?.R5 != null) player.r5 = Number(record.R5);
                if (dbStore) player.skillChanges = dbSkillChangesFromStore(dbStore, player);
            });
        });
    };

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

    const processSquadPage = async (players) => {
        if (!players || !players.length) return [];

        const eff = TmUtils.skillEff;
        const fetchTip = (pid) => TmPlayerService.fetchPlayerTooltip(pid).then((data) => data?.player ?? null);

        console.log(`%c[Squad] Fetching tooltips for ${players.length} players...`, 'font-weight:bold;color:var(--tmu-info)');

        const loader = createSquadLoader();
        const results = [];

        for (let pi = 0; pi < players.length; pi++) {
            const player = players[pi];
            loader.update(pi + 1, players.length, player.name);

            const curAgeKeyCheck = `${player.ageYears}.${player.ageMonths}`;
            const existingStore = PlayerDB.get(player.pid);
            const existingRec = existingStore?.records?.[curAgeKeyCheck];
            if (existingRec) {
                continue;
            }

            const tip = await fetchTip(player.pid);
            await delay(100);

            if (!tip) continue;

            const asi = tip.asi;
            const routine = tip.routine;
            const favpos = tip.favposition || '';
            const isGK = tip.isGK;
            const skillCount = isGK ? 11 : 14;
            const intSkills = tip.skills ? extractSkills(tip.skills, isGK) : player.skills;

            const dbRecord = PlayerDB.get(player.pid);
            let prevDecimals = null;
            let prevSkillsFull = null;
            let curDbSkillsFull = null;

            if (dbRecord?.records) {
                const keys = Object.keys(dbRecord.records).sort((a, b) => {
                    const [ay, am] = a.split('.').map(Number);
                    const [by, bm] = b.split('.').map(Number);
                    return (ay * 12 + am) - (by * 12 + bm);
                });

                const curAgeKey = `${player.ageYears}.${player.ageMonths}`;
                const curDbRec = dbRecord.records[curAgeKey];
                if (curDbRec?.skills?.length === skillCount) {
                    curDbSkillsFull = curDbRec.skills.map((value) => {
                        const numeric = typeof value === 'string' ? parseFloat(value) : value;
                        return numeric >= 20 ? 20 : numeric;
                    });
                }

                let prevIdx = keys.length - 1;
                if (keys.length > 1 && keys[prevIdx] === curAgeKey) prevIdx = keys.length - 2;

                if (prevIdx >= 0) {
                    const prevRec = dbRecord.records[keys[prevIdx]];
                    if (prevRec?.skills?.length === skillCount) {
                        prevSkillsFull = prevRec.skills.map((value) => {
                            const numeric = typeof value === 'string' ? parseFloat(value) : value;
                            return numeric >= 20 ? 20 : numeric;
                        });
                        prevDecimals = prevSkillsFull.map((value) => value >= 20 ? 0 : value - Math.floor(value));
                    }
                }
            }

            const asiWeight = isGK ? 48717927500 : 263533760000;
            const intSum = intSkills.reduce((sum, value) => sum + value, 0);
            const asiRemainder = asi > 0
                ? Math.round((Math.pow(2, Math.log(asiWeight * asi) / Math.log(128)) - intSum) * 100) / 100
                : 0;

            const improvementMap = {};
            player.improved.forEach((imp) => { improvementMap[imp.index] = imp.type; });

            const totalGain = player.TI / 10;
            let newDecimals;

            if (prevDecimals && asi > 0) {
                newDecimals = [...prevDecimals];

                const improvedIndices = player.improved.map((imp) => imp.index);
                if (improvedIndices.length > 0 && totalGain > 0) {
                    const effWeights = improvedIndices.map((index) => eff(intSkills[index]));
                    const effTotal = effWeights.reduce((sum, value) => sum + value, 0);
                    const shares = effTotal > 0
                        ? effWeights.map((weight) => weight / effTotal)
                        : effWeights.map(() => 1 / improvedIndices.length);
                    improvedIndices.forEach((index, j) => { newDecimals[index] += totalGain * shares[j]; });
                }

                player.improved.forEach((imp) => {
                    if (imp.type === 'one_up') newDecimals[imp.index] = 0;
                });

                let overflow = 0;
                let passes = 0;
                do {
                    overflow = 0;
                    let freeCount = 0;
                    for (let i = 0; i < skillCount; i++) {
                        if (intSkills[i] >= 20) {
                            newDecimals[i] = 0;
                            continue;
                        }
                        if (newDecimals[i] >= 1) {
                            overflow += newDecimals[i] - 0.99;
                            newDecimals[i] = 0.99;
                        } else if (newDecimals[i] < 0.99) {
                            freeCount++;
                        }
                    }
                    if (overflow > 0.0001 && freeCount > 0) {
                        const add = overflow / freeCount;
                        for (let i = 0; i < skillCount; i++) {
                            if (intSkills[i] < 20 && newDecimals[i] < 0.99) newDecimals[i] += add;
                        }
                    }
                } while (overflow > 0.0001 && ++passes < 20);

                let subtleOverflow = 0;
                passes = 0;
                do {
                    subtleOverflow = 0;
                    for (let i = 0; i < skillCount; i++) {
                        if (intSkills[i] >= 20) continue;
                        const prevInt = prevSkillsFull ? Math.floor(prevSkillsFull[i]) : intSkills[i];
                        if (!improvementMap[i] && intSkills[i] === prevInt && newDecimals[i] >= 1) {
                            subtleOverflow += newDecimals[i] - 0.99;
                            newDecimals[i] = 0.99;
                        }
                    }
                    if (subtleOverflow > 0.0001) {
                        let freeSlots = 0;
                        for (let i = 0; i < skillCount; i++) {
                            if (intSkills[i] < 20 && newDecimals[i] < 0.99) freeSlots++;
                        }
                        if (freeSlots > 0) {
                            const add = subtleOverflow / freeSlots;
                            for (let i = 0; i < skillCount; i++) {
                                if (intSkills[i] < 20 && newDecimals[i] < 0.99) newDecimals[i] += add;
                            }
                        }
                    }
                } while (subtleOverflow > 0.0001 && ++passes < 20);

                const decimalSum = newDecimals.reduce((sum, value) => sum + value, 0);
                if (decimalSum > 0.001 && asiRemainder > 0) {
                    const scale = asiRemainder / decimalSum;
                    newDecimals = newDecimals.map((value, index) => intSkills[index] >= 20 ? 0 : value * scale);
                } else if (asiRemainder > 0) {
                    const nonMax = intSkills.filter((value) => value < 20).length;
                    newDecimals = intSkills.map((value) => value >= 20 ? 0 : asiRemainder / nonMax);
                }

                passes = 0;
                do {
                    overflow = 0;
                    let freeCount = 0;
                    for (let i = 0; i < skillCount; i++) {
                        if (intSkills[i] >= 20) {
                            newDecimals[i] = 0;
                            continue;
                        }
                        if (newDecimals[i] > 0.99) {
                            overflow += newDecimals[i] - 0.99;
                            newDecimals[i] = 0.99;
                        } else if (newDecimals[i] < 0) {
                            newDecimals[i] = 0;
                        } else if (newDecimals[i] < 0.99) {
                            freeCount++;
                        }
                    }
                    if (overflow > 0.0001 && freeCount > 0) {
                        const add = overflow / freeCount;
                        for (let i = 0; i < skillCount; i++) {
                            if (intSkills[i] < 20 && newDecimals[i] < 0.99) newDecimals[i] += add;
                        }
                    }
                } while (overflow > 0.0001 && ++passes < 20);
            } else if (asi > 0) {
                const nonMax = intSkills.filter((value) => value < 20).length;
                newDecimals = intSkills.map((value) => value >= 20 ? 0 : (nonMax > 0 ? asiRemainder / nonMax : 0));
            } else {
                newDecimals = new Array(skillCount).fill(0);
            }

            const newSkillsFull = intSkills.map((value, index) => value >= 20 ? 20 : value + (newDecimals[index] || 0));
            const allPositions = favpos.split(',').map((value) => value.trim()).filter(Boolean);
            let r5 = null;
            let rec = null;
            let bestPos = allPositions[0] || '';
            const r5ByPos = {};

            if (asi > 0) {
                let bestR5 = -Infinity;
                for (const pos of allPositions) {
                    const posIdx = TmLib.getPositionIndex(pos);
                    const fakePlayer = { skills: newSkillsFull, asi, routine: routine || 0 };
                    const r5Value = TmLib.calculatePlayerR5({ id: posIdx }, fakePlayer);
                    const recValue = TmLib.calculatePlayerREC({ id: posIdx }, fakePlayer);
                    r5ByPos[pos] = { R5: r5Value, REC: recValue };
                    if (r5Value > bestR5) {
                        bestR5 = r5Value;
                        r5 = r5Value;
                        rec = recValue;
                        bestPos = pos;
                    }
                }
            }

            results.push({
                pid: player.pid,
                name: player.name,
                ageYears: player.ageYears,
                ageMonths: player.ageMonths,
                position: favpos,
                isGK,
                asi,
                routine,
                TI: player.TI,
                TI_change: player.TI_change,
                improved: player.improved,
                newSkillsFull,
                r5ByPos,
                bestPos,
                R5: r5,
                REC: rec,
            });
        }

        loader.update(0, results.length, 'Syncing to DB...');
        const bar = document.getElementById('tmrc-loader-bar');
        if (bar) bar.style.width = '0%';

        let syncCount = 0;
        for (const result of results) {
            if (result.asi <= 0) {
                syncCount++;
                continue;
            }

            const ageKey = `${result.ageYears}.${result.ageMonths}`;
            let store = PlayerDB.get(result.pid);
            if (!store?._v) store = { _v: 1, lastSeen: Date.now(), records: {} };

            store.records[ageKey] = {
                SI: result.asi,
                REREC: result.REC,
                R5: result.R5,
                skills: result.newSkillsFull.map((value) => Math.round(value * 100) / 100),
                routine: result.routine,
                locked: true,
            };
            store.lastSeen = Date.now();
            if (!store.meta) store.meta = { name: result.name, pos: result.position, isGK: result.isGK };

            await PlayerDB.set(result.pid, store);
            syncCount++;

            const pct = Math.round((syncCount / results.length) * 100);
            if (bar) bar.style.width = `${pct}%`;
            const txt = document.getElementById('tmrc-loader-text');
            if (txt) txt.textContent = `Syncing ${syncCount}/${results.length} — ${result.name}`;
        }

        loader.done(syncCount);
        return results;
    };

    const syncSquad = async (squadKey, syncPlayers = []) => {
        const squad = state.squads[squadKey];
        if (!squad.players.length || squad.syncState === 'running' || !syncPlayers.length) return;
        if (!state.dbReady) {
            squad.syncMessage = state.dbError || 'IndexedDB unavailable';
            render();
            return;
        }

        squad.syncState = 'running';
        squad.syncMessage = `Syncing ${squad.players.length} players`;
        seedMetricsFromDb(squad.players);
        render();

        try {
            const results = await processSquadPage(syncPlayers);
            applySyncResults(results);
            await ensureInterpolatedPreviousRecords(squad.players);
            squad.syncState = 'done';
            squad.syncMessage = `Synced ${results.length} players`;
        } catch (error) {
            squad.syncState = 'error';
            squad.syncMessage = error?.message || 'Sync failed';
        }

        render();
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
        seedMetricsFromDb(squad.players);
        await ensureInterpolatedPreviousRecords(squad.players);
        render();

        const needsSync = squad.players.some((player) => !PlayerDB.get(player.pid)?.records?.[currentAgeKeyOf(player)]);
        if (!needsSync) return;

        waitForPlayers(() => hasSquadRows(document) ? (parseSquadDocument(document) || []) : [])
            .then((parsed) => {
                if (!parsed.length) return;
                syncSquad('main', parsed).catch((error) => console.error('[Players] Main squad sync failed:', error));
            })
            .catch((error) => console.error('[Players] Main squad sync source failed:', error));
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
            seedMetricsFromDb(squad.players);
            await ensureInterpolatedPreviousRecords(squad.players);
            const needsSync = squad.players.some((player) => !PlayerDB.get(player.pid)?.records?.[currentAgeKeyOf(player)]);
            if (needsSync) {
                const parsed = await loadSquadFromIframe(RESERVES_URL);
                syncSquad('reserves', parsed).catch((error) => console.error('[Players] Reserve squad sync failed:', error));
            }
        } catch (error) {
            state.reserveLoadStarted = false;
            squad.loadError = error?.message || `Could not load reserves from ${RESERVES_URL}.`;
        } finally {
            squad.loading = false;
            render();
        }
    };

    const dbInitPromise = PlayerDB.init()
        .then(() => PlayerArchiveDB.init())
        .then(() => {
            state.dbReady = true;
            Object.values(state.squads).forEach((squad) => seedMetricsFromDb(squad.players));
            render();
        })
        .catch((error) => {
            state.dbError = error?.message || 'IndexedDB init failed';
            render();
        });

    render();

    dbInitPromise.finally(() => {
        loadMainSquad().catch((error) => {
            state.squads.main.loading = false;
            state.squads.main.loadError = error?.message || 'Main squad load failed.';
            render();
        });
    });
}
