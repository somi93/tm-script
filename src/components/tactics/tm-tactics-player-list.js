import { TmTable } from '../shared/tm-table.js';
import { TmSectionCard } from '../shared/tm-section-card.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmConst } from '../../lib/tm-constants.js';
import { TmPlayerTooltip } from '../player/tm-player-tooltip.js';

'use strict';

const escHtml = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cleanText = v => String(v || '').replace(/\s+/g, ' ').trim();
const formatAge = (years, months) => `${Number(years) || 0}.${String(Number(months) || 0).padStart(2, '0')}`;

// Filter groups
const LINE_GROUPS  = ['gk', 'd', 'm', 'f'];
const SIDE_GROUPS  = ['l', 'c', 'r'];

function matchesLine(player, lineFilter) {
    if (!lineFilter.size || lineFilter.size === LINE_GROUPS.length) return true;
    const fp = String(player.favposition || '').toLowerCase();
    for (const key of lineFilter) {
        if (key === 'gk' && fp === 'gk') return true;
        if (key === 'd'  && fp.includes('d') && !fp.startsWith('dm') && (fp.includes('dl') || fp.includes('dc') || fp.includes('dr'))) return true;
        if (key === 'm'  && (fp.includes('m') || fp.includes('dm') || fp.includes('om'))) return true;
        if (key === 'f'  && fp.includes('f')) return true;
    }
    return false;
}

function matchesSide(player, sideFilter) {
    if (!sideFilter.size || sideFilter.size === SIDE_GROUPS.length) return true;
    const fp = String(player.favposition || '').toLowerCase();
    if (fp === 'gk' || fp === 'f') return true; // no l/c/r concept
    for (const key of sideFilter) {
        if (fp.includes(key)) return true;
    }
    return false;
}

function getPositions(player) {
    return String(player.favposition || '').split(',').map(s => s.trim()).filter(Boolean)
        .flatMap(seg => seg.split('/').map(p => p.replace(/\s+/g, '').toLowerCase()).filter(Boolean));
}

function adaptForTooltip(player) {
    const positions = player.positions?.length
        ? player.positions
        : getPositions(player).map(key => {
            const entry = TmConst.POSITION_MAP[key] || TmConst.POSITION_MAP[key.replace(/[lrc]$/, '')];
            return { position: entry?.position || key.toUpperCase(), color: entry?.color };
        });

    const skills = Array.isArray(player.skills)
        ? player.skills.map((skill, index) => typeof skill === 'object'
            ? skill
            : { value: skill, name: (player.isGK ? TmConst.SKILL_LABELS_GK : TmConst.SKILL_LABELS_OUT)[index] || '' })
        : [];

    return {
        ...player,
        positions,
        ageMonthsString: player.ageMonthsString || formatAge(player.age, player.months),
        skills,
        rec: Number.isFinite(parseFloat(player.rec)) ? parseFloat(player.rec) : (Number.isFinite(parseFloat(player.rec_sort)) ? parseFloat(player.rec_sort) : null),
        r5: Number.isFinite(parseFloat(player.r5)) ? parseFloat(player.r5) : null,
        routine: Number.isFinite(parseFloat(player.routine)) ? parseFloat(player.routine) : null,
    };
}

function buildTable(players, query) {
    const q = cleanText(query).toLowerCase();
    const filtered = q
        ? players.filter(p => cleanText(p.name).toLowerCase().includes(q) || cleanText(p.favposition).toLowerCase().includes(q))
        : players;

    return TmTable.table({
        items: filtered,
        sortKey: 'rec_sort',
        sortDir: -1,
        density: 'tight',
        headers: [
            {
                key: '_bar', label: '', sortable: false, cls: 'tmtc-pb-cell', thCls: 'tmtc-pb-cell',
                render: (_, p) => {
                    const posKeys = getPositions(p);
                    const v = TmPosition.variant(posKeys[0] || '');
                    const colorMap = { gk: 'var(--tmu-success-strong)', d: 'var(--tmu-info-dark)', m: 'var(--tmu-warning)', f: 'var(--tmu-danger-deep)' };
                    const color = colorMap[v] || 'var(--tmu-text-dim)';
                    return `<span class="tmtc-pb-inner" style="background:${color}"></span>`;
                },
            },
            {
                key: 'no', label: '#', align: 'r', width: '36px',
                render: (v) => `<span style="color:var(--tmu-text-muted);font-variant-numeric:tabular-nums">${escHtml(v)}</span>`,
            },
            {
                key: 'favposition', label: 'Pos', align: 'c',
                sort: (a, b) => String(a.favposition || '').localeCompare(String(b.favposition || '')),
                render: (_, p) => {
                    const posKeys = getPositions(p);
                    return TmPosition.chip(posKeys);
                },
            },
            {
                key: 'name', label: 'Player',
                render: (_, p) => {
                    const flagHtml = p.show_flag && p.flag ? `${p.flag} ` : '';
                    const statusHtml = p.status_no_check ? `<span style="margin-left:2px;font-size:var(--tmu-font-xs)">${escHtml(p.status_no_count)}</span>` : '';
                    return `<a href="/players/${p.player_id}/" style="color:var(--tmu-text-inverse);text-decoration:none;font-weight:600">${flagHtml}${escHtml(p.name)}${statusHtml}</a>`;
                },
            },
            {
                key: 'rec_sort', label: 'Rec', align: 'c', width: '64px',
                render: (v) => {
                    const n = Math.round(Number(v) || 0);
                    return n ? `<span style="color:var(--tmu-warning)">${'★'.repeat(Math.min(n, 5))}</span>` : '—';
                },
            },
        ],
        emptyText: q ? 'No players match the search.' : 'No players in this group.',
    });
}

/**
 * Mount the full squad player list with filters.
 * @param {HTMLElement} container
 * @param {object}      data  — result from tactics_get.ajax.php
 */
export function mountTacticsPlayerList(container, data) {
    const allPlayers = Object.values(data.players || {});

    const lineFilter = new Set(LINE_GROUPS);
    const sideFilter = new Set(SIDE_GROUPS);
    let showInjured  = true;
    let query        = '';

    const refs = TmSectionCard.mount(container, {
        title:      'Players',
        icon:       '👤',
        titleMode:  'body',
        cardVariant: 'soft',
        bodyClass:  'tmu-stack tmu-stack-density-tight',
    });
    const body = refs.body;

    // ── Toolbar ─────────────────────────────────────────────────────────
    const toolbar = document.createElement('div');
    toolbar.className = 'tmtc-filters';

    // Search
    const searchWrap = document.createElement('div');
    searchWrap.style.cssText = 'flex:1 1 180px;max-width:280px';
    const searchEl = TmUI.input({ type: 'search', placeholder: 'Filter players…', tone: 'overlay', density: 'comfy', size: 'full', grow: true });
    searchWrap.appendChild(searchEl);
    searchEl.addEventListener('input', e => { query = e.target.value || ''; refresh(); });
    toolbar.appendChild(searchWrap);

    const sep1 = document.createElement('div'); sep1.className = 'tmtc-filter-sep'; toolbar.appendChild(sep1);

    // Line filters
    const lineGroup = document.createElement('div');
    lineGroup.className = 'tmtc-filter-group';
    const lineLabels = { gk: 'GK', d: 'DEF', m: 'MID', f: 'FWD' };
    for (const key of LINE_GROUPS) {
        const btn = TmUI.button({ label: lineLabels[key], variant: 'primary', size: 'sm', attrs: { 'data-line': key } });
        btn.classList.toggle('opacity-60', !lineFilter.has(key));
        btn.addEventListener('click', () => {
            lineFilter.has(key) ? lineFilter.delete(key) : lineFilter.add(key);
            btn.classList.toggle('opacity-60', !lineFilter.has(key));
            refresh();
        });
        lineGroup.appendChild(btn);
    }
    toolbar.appendChild(lineGroup);

    const sep2 = document.createElement('div'); sep2.className = 'tmtc-filter-sep'; toolbar.appendChild(sep2);

    // Side filters
    const sideGroup = document.createElement('div');
    sideGroup.className = 'tmtc-filter-group';
    const sideLabels = { l: 'L', c: 'C', r: 'R' };
    for (const key of SIDE_GROUPS) {
        const btn = TmUI.button({ label: sideLabels[key], variant: 'primary', size: 'sm', attrs: { 'data-side': key } });
        btn.classList.toggle('opacity-60', !sideFilter.has(key));
        btn.addEventListener('click', () => {
            sideFilter.has(key) ? sideFilter.delete(key) : sideFilter.add(key);
            btn.classList.toggle('opacity-60', !sideFilter.has(key));
            refresh();
        });
        sideGroup.appendChild(btn);
    }
    toolbar.appendChild(sideGroup);

    const sep3 = document.createElement('div'); sep3.className = 'tmtc-filter-sep'; toolbar.appendChild(sep3);

    // Injured toggle
    const injBtn = TmUI.button({ label: 'Injured', variant: 'secondary', size: 'sm' });
    injBtn.classList.toggle('opacity-60', !showInjured);
    injBtn.addEventListener('click', () => {
        showInjured = !showInjured;
        injBtn.classList.toggle('opacity-60', !showInjured);
        refresh();
    });
    toolbar.appendChild(injBtn);

    body.appendChild(toolbar);

    // ── Table slot ───────────────────────────────────────────────────────
    const tableSlot = document.createElement('div');
    body.appendChild(tableSlot);

    let hoverTooltipTimer = null;
    const clearTooltip = () => {
        clearTimeout(hoverTooltipTimer);
        TmPlayerTooltip.hide();
    };

    tableSlot.addEventListener('mouseover', event => {
        const link = event.target.closest('a[href*="/players/"]');
        if (!link || !tableSlot.contains(link) || link.contains(event.relatedTarget)) return;
        const playerId = link.getAttribute('href')?.match(/\/players\/(\d+)\//)?.[1] || '';
        const player = allPlayers.find(p => String(p.player_id || '') === playerId);
        if (!player) return;
        clearTooltip();
        hoverTooltipTimer = setTimeout(() => {
            TmPlayerTooltip.show(link, adaptForTooltip(player));
        }, 80);
    });

    tableSlot.addEventListener('mouseout', event => {
        const link = event.target.closest('a[href*="/players/"]');
        if (!link || !tableSlot.contains(link) || link.contains(event.relatedTarget)) return;
        clearTooltip();
    });

    function getVisible() {
        return allPlayers.filter(p => {
            if (!showInjured && (p.injury > 0 || p.banned)) return false;
            if (!matchesLine(p, lineFilter)) return false;
            if (!matchesSide(p, sideFilter)) return false;
            return true;
        });
    }

    function refresh() {
        tableSlot.innerHTML = '';
        tableSlot.appendChild(buildTable(getVisible(), query));
    }

    refresh();
}
