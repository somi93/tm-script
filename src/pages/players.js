import { TmTable } from '../components/shared/tm-table.js';
import { TmCheckbox } from '../components/shared/tm-checkbox.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmPosition } from '../lib/tm-position.js';
import { TmUtils } from '../lib/tm-utils.js';
import { fetchRawPlayers } from '../models/club.js';
import { runSyncPipeline } from '../workflows/player-history/sync-pipeline.js';
import { TmProgress } from '../components/shared/tm-progress.js';
import { injectPlayersPageStyles } from './players-styles.js';
import { CountryFlag } from '../components/shared/country-flag.js';

const parseSquadPageSkillChanges = (doc = document) => {
    const result = new Map();
    const links = [...doc.querySelectorAll('[player_link]')];
    links.forEach(link => {
        const row = link.closest('tr');
        if (!row) return;
        const playerId = Number(link.getAttribute('player_link'));
        if (!playerId) return;
        const skillDivs = [...row.querySelectorAll('div.skill.training')];
        const skillCount = skillDivs.length === 14 ? 14 : skillDivs.length === 11 ? 11 : null;
        if (!skillCount) return; // not an outfield (14) or GK (11) row
        const cells = [...row.querySelectorAll('td')];
        const ageText = cells[2]?.textContent?.trim() || '';
        const ageMonthsString = /^\d+\.\d+$/.test(ageText) ? ageText : null;
        const intSkills = new Array(skillCount).fill(0);
        const skillChanges = new Array(skillCount).fill(null);
        skillDivs.forEach((div, i) => {
            const img = div.querySelector('img');
            intSkills[i] = img
                ? (img.src.includes('star_silver') ? 19 : 20)
                : (parseInt(div.textContent.trim(), 10) || 0);
            if (div.classList.contains('one_up')) skillChanges[i] = 'one_up';
            else if (div.classList.contains('part_up')) skillChanges[i] = 'part_up';
            else if (div.classList.contains('one_down')) skillChanges[i] = 'one_down';
            else if (div.classList.contains('part_down')) skillChanges[i] = 'part_down';
        });
        result.set(playerId, { intSkills, skillChanges, ageMonthsString });
    });
    return result;
};

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

    const weeklyChanges = player.weeklyChanges?.skillChanges || [];

    return (latestRecord.skills || [])
        .map((value, index) => {
            const latestValue = Number(value);
            const previousValue = Number(previousRecord.skills[index]);
            if (!Number.isFinite(latestValue) || !Number.isFinite(previousValue)) return null;

            const delta = latestValue - previousValue;
            const weeklyChange = weeklyChanges[index] || null;
            if (!delta && !weeklyChange) return null;

            return {
                index,
                delta,
                type: delta > 0 ? 'pos' : 'neg',
                weeklyChange,
            };
        })
        .filter(Boolean);
};

const getR5Change = (player) => {
    const { latestRecord, previousRecord } = getLatestRecordPair(player);
    const latestValue = Number(latestRecord?.r5);
    const previousValue = Number(previousRecord?.r5);
    if (!Number.isFinite(latestValue) || !Number.isFinite(previousValue)) return null;

    return latestValue - previousValue;
};
const getTiChange = (player) => {
    const { latestRecord, previousRecord } = getLatestRecordPair(player);
    const latestValue = Number(latestRecord?.TI);
    const previousValue = Number(previousRecord?.TI);
    if (!Number.isFinite(latestValue) || !Number.isFinite(previousValue)) return null;

    return latestValue - previousValue;
};
const skillCellHtml = (player, index) => {
    const value = getSkillValue(player, index);
    const change = player.skillChanges?.find((item) => item.index === index) || null;
    const wc = change?.weeklyChange;
    const bgCls = wc === 'one_up' ? ' gain-integer'
        : wc === 'part_up' ? ' gain-decimal'
            : wc === 'one_down' ? ' loss-integer'
                : wc === 'part_down' ? ' loss-decimal'
                    : '';
    const cls = `${value >= 20 ? ' max' : value >= 19 ? ' elite' : ''}${bgCls}`;
    const label = value >= 20 ? '★' : value >= 19 ? `★.${value.toFixed(2).split('.')[1]}` : value.toFixed(2);
    const title = value >= 19 ? String(value) : '';
    const deltaText = change?.delta ? `${change.delta > 0 ? '+' : ''}${change.delta.toFixed(2)}` : '';
    const deltaHtml = deltaText && deltaText !== '+0.00' && deltaText !== '-0.00' && deltaText !== '0.00'
        ? `<span class="tmvu-players-skill-delta ${change.delta > 0 ? 'pos' : 'neg'}">${deltaText}</span>`
        : '';
    const arrowHtml = '';
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

export function initPlayersPage(main) {
    if (!/^\/players\/?$/i.test(window.location.pathname)) return;
    if (!window.location.hash) {
        window.location.replace('/players/#/a/true/b/true/');
        window.location.reload();
        return;
    }
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

    const controlsHost = document.createElement('div');
    const sectionsHost = document.createElement('div');
    sectionsHost.className = 'tmvu-players-sections';
    shell.appendChild(controlsHost);
    shell.appendChild(sectionsHost);
    renderHost.appendChild(shell);

    const state = {
        squads: {
            main: createSquadModel('main', 'Main Squad', true),
            reserves: createSquadModel('reserves', 'Reserves', true),
        },
    };

    const decoratePlayers = (players) => (players || []).map((player) => {
        const { latestRecord } = getLatestRecordPair(player);
        const recordSkills = Array.isArray(latestRecord?.skills) ? latestRecord.skills : null;
        const skills = recordSkills
            ? (player.skills || []).map(skill => ({ ...skill, value: recordSkills[skill.id] ?? skill.value }))
            : player.skills;
        const latestTI = Number(latestRecord?.TI);
        const latestR5 = Number(latestRecord?.r5);
        return {
            ...player,
            skills,
            r5: Number.isFinite(latestR5) ? latestR5 : player.r5,
            ti: Number.isFinite(latestTI) ? latestTI : player.ti,
            TI_change: getTiChange(player),
            skillChanges: getSkillChanges(player),
            r5Change: getR5Change(player),
        };
    });


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
            {
                key: 'no', label: '#', align: 'c', width: '42px', defaultSortDir: 1,
                sort: (a, b) => (Number(a.number ?? a.no) || 0) - (Number(b.number ?? b.no) || 0),
                render: (_, item) => {
                    const num = item.number ?? item.no ?? '';
                    const reserves = item.b ? 1 : 0;
                    return `<span class="tmvu-players-no" onclick="pop_player_number(${item.id},${Number(num) || 0},&quot;${escapeHtml(item.name)}&quot;,${reserves})" title="Change number">${escapeHtml(String(num || ''))}</span>`;
                },
            },
            {
                key: 'name',
                label: 'Player',
                width: '220px',
                defaultSortDir: 1,
                sort: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
                render: (_, item) => `<div class="tmvu-players-name">${CountryFlag.render(item.country, 'tmvu-players-flag')}<a href="/players/${escapeHtml(item.id)}/">${escapeHtml(item.name)}</a></div>`
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

        const skillHeaders = (skillLabels || []).map((label, index) => ({
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
                    const deltaHtml = item.TI_change !== null && Number.isFinite(delta)
                        ? `<span class="tmvu-players-delta ${delta > 0 ? 'pos' : delta < 0 ? 'neg' : 'zero'}">${escapeHtml(formatTiDelta(delta))}</span>`
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

    const resyncAll = async () => {
        const squad = state.squads.main;
        if (!squad.rawPlayers?.length || squad.loading) return;
        squad.loading = true;
        render();
        const syncBar = TmProgress.progressBar({ title: '⚡ Force resyncing players' });
        try {
            const resynced = await runSyncPipeline(squad.rawPlayers, (done, total) => {
                syncBar.update(done, total, `Resyncing ${done}/${total}`);
            }, { mode: 'force-resync' });
            syncBar.done();
            squad.rawPlayers = resynced;
            squad.players = decoratePlayers(resynced);
        } catch (err) {
            syncBar.done();
            squad.loadError = err?.message || 'Resync failed.';
        }
        squad.loading = false;
        render();
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
                render();
            },
        });

        row.appendChild(mainToggle);
        row.appendChild(reserveToggle);

        const resyncBtn = TmUI.button({
            label: 'Resync All',
            color: 'primary',
            size: 'sm',
            cls: 'tmvu-players-resync-btn',
            disabled: !state.squads.main.rawPlayers?.length || state.squads.main.loading,
            onClick: () => resyncAll(),
        });
        resyncBtn.style.marginLeft = 'auto';
        row.appendChild(resyncBtn);

        controlsHost.appendChild(row);
    };

    const renderSections = () => {
        sectionsHost.innerHTML = '';

        const showMain = state.squads.main.visible;
        const showReserves = state.squads.reserves.visible;
        const mainSquad = state.squads.main;

        if (!showMain && !showReserves) {
            sectionsHost.innerHTML = '<div class="tmvu-players-empty">No squad is selected.</div>';
            return;
        }

        if (mainSquad.loading && !mainSquad.players.length) {
            sectionsHost.innerHTML = `<div class="tmvu-players-empty">${escapeHtml(mainSquad.syncMessage || 'Loading...')}</div>`;
            return;
        }

        if (mainSquad.loadError && !mainSquad.players.length) {
            sectionsHost.innerHTML = `<div class="tmvu-players-empty">${escapeHtml(mainSquad.loadError)}</div>`;
            return;
        }

        const visiblePlayers = mainSquad.players.filter(player => {
            if (player.b) return showReserves;
            return showMain;
        });

        if (!visiblePlayers.length) {
            sectionsHost.innerHTML = '<div class="tmvu-players-empty">No players available.</div>';
            return;
        }

        const isGK = p => !!p.isGK;

        const renderTeamPanel = (players, teamLabel) => {
            if (!players.length) return;
            const panel = document.createElement('div');
            panel.className = 'tmu-flat-panel tmvu-players-team-panel';

            const panelHead = document.createElement('div');
            panelHead.className = 'tmu-card-head';
            panelHead.innerHTML = `<span class="tmvu-players-team-title">${escapeHtml(teamLabel)} <span class="tmvu-players-team-count">${players.length}</span></span>`;
            panel.appendChild(panelHead);

            const body = document.createElement('div');
            body.className = 'tmvu-players-panel-body';
            panel.appendChild(body);

            const outfield = players.filter(p => !isGK(p));
            const gks = players.filter(p => isGK(p));

            if (outfield.length) {
                body.appendChild(TmTable.table({ headers: buildTableHeaders(false), items: outfield, sortKey: 'no', sortDir: 1 }));
            }
            if (gks.length) {
                const gkLbl = document.createElement('div');
                gkLbl.className = 'tmvu-players-section-title';
                gkLbl.textContent = `Goalkeepers (${gks.length})`;
                body.appendChild(gkLbl);
                body.appendChild(TmTable.table({ headers: buildTableHeaders(true), items: gks, sortKey: 'no', sortDir: 1 }));
            }

            sectionsHost.appendChild(panel);
        };

        if (showMain) renderTeamPanel(visiblePlayers.filter(p => !p.b), 'A Team');
        if (showReserves) renderTeamPanel(visiblePlayers.filter(p => p.b), 'B Team');
    };

    const render = () => {
        renderControls();
        renderSections();
    };

    const waitForSkillChanges = (doc, timeout = 2000) => new Promise((resolve) => {
        const getRowCount = () => doc.querySelectorAll('[player_link]').length;
        const finish = (map) => { console.log('[WC:0 waitForSkillChanges] resolved, map.size:', map.size); resolve(map); };
        let lastCount = -1;
        let stableFor = 0;
        const limit = window.setTimeout(() => {
            window.clearInterval(timer);
            const count = getRowCount();
            if (count > 0) {
                console.log('[WC:0 waitForSkillChanges] TIMEOUT — using partial rows:', count);
                finish(parseSquadPageSkillChanges(doc));
            } else {
                console.log('[WC:0 waitForSkillChanges] TIMEOUT — no rows found in', timeout, 'ms');
                resolve(new Map());
            }
        }, timeout);
        const timer = window.setInterval(() => {
            const count = getRowCount();
            if (count > 0 && count === lastCount) {
                stableFor++;
                if (stableFor >= 2) {
                    window.clearInterval(timer);
                    window.clearTimeout(limit);
                    finish(parseSquadPageSkillChanges(doc));
                }
            } else {
                lastCount = count;
                stableFor = 0;
            }
        }, 10);
    });

    const loadMainSquad = async () => {
        const squad = state.squads.main;
        squad.loading = true;
        squad.loadError = '';
        render();

        // Step 1: Parse skill changes from DOM
        // /players/#/a/true/b/true/ renders both A and B team in the same table,
        // so one waitForSkillChanges call covers all own players.
        const skillChangesMap = await waitForSkillChanges(document);

        console.log('[Step 1] Skill changes parsed from DOM — total:', skillChangesMap);

        // Step 2: Load players — main + reserves in parallel, merge, attach skill changes
        const mainClubId = String(window.SESSION?.main_id || '').trim();
        const bTeamId = String(window.SESSION?.b_team || '').trim();

        const [mainPlayers, reservePlayers] = await Promise.all([
            fetchRawPlayers(mainClubId),
            bTeamId ? fetchRawPlayers(bTeamId) : Promise.resolve([]),
        ]);

        const reserveIds = new Set(reservePlayers.map(p => p.id));
        const allPlayers = [...mainPlayers, ...reservePlayers].map(player => ({
            ...player,
            b: reserveIds.has(player.id) ? true : undefined,
            weeklyChanges: skillChangesMap.get(player.id) || null,
        }));

        console.group('[Step 2] Players loaded — total:', allPlayers.map(p => p.weeklyChanges));
        console.log(allPlayers);
        console.groupEnd();

        // Steps 3-11: sync pipeline
        let syncBar = null;
        const allPlayersWithData = await runSyncPipeline(allPlayers, (done, total) => {
            if (!syncBar) syncBar = TmProgress.progressBar({ title: '⚡ Syncing players' });
            syncBar.update(done, total, `Syncing ${done}/${total}`);
        });
        if (syncBar) syncBar.done();

        squad.players = decoratePlayers(allPlayersWithData);
        squad.rawPlayers = allPlayersWithData;
        console.log(squad.players);
        squad.loaded = true;
        squad.syncMessage = null;
        squad.loading = false;
        render();
    };

    render();

    loadMainSquad().catch((error) => {
        state.squads.main.loading = false;
        state.squads.main.loadError = error?.message || 'Main squad load failed.';
        render();
    });
}
