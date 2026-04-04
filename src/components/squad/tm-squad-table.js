import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { PlayerTrainingDots } from '../shared/tm-training-dots.js';
import { TmPlayerTooltip } from '../player/tm-player-tooltip.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmSummaryStrip } from '../shared/tm-summary-strip.js';
import { playerStatusIconsHtml } from '../shared/tm-player-status-icons.js';

/* ═══════════════════════════════════════════════════════════
       CONSTANTS
       ═══════════════════════════════════════════════════════════ */
const { AGE_THRESHOLDS } = TmConst;
const badgeHtml = (opts, tone = 'muted') => TmUI.badge({ size: 'xs', shape: 'rounded', weight: 'bold', ...opts }, tone);


/* ═══════════════════════════════════════════════════════════
   ROW HELPERS
   ═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   SUMMARY BAR
   ═══════════════════════════════════════════════════════════ */
const buildSummary = players => {
    const { getColor } = TmUtils;
    const { REC_THRESHOLDS, R5_THRESHOLDS, TI_THRESHOLDS } = TmConst;
    const n = players.length;
    if (!n) return '';
    const avgR5 = players.reduce((s, p) => s + Number(p.r5), 0) / n;
    const avgRec = players.reduce((s, p) => s + Number(p.rec), 0) / n;
    const avgAge = players.reduce((s, p) => s + p.age + p.month / 12, 0) / n;
    const avgASI = players.reduce((s, p) => s + p.asi, 0) / n;
    const tiPlayers = players.filter(p => p.ti !== null);
    const avgTI = tiPlayers.length ? tiPlayers.reduce((s, p) => s + p.ti, 0) / tiPlayers.length : 0;

    return TmSummaryStrip.render([
        { label: 'Players', value: String(n) },
        { label: 'Avg R5', value: avgR5.toFixed(2), valueStyle: `color:${getColor(avgR5, R5_THRESHOLDS)}` },
        { label: 'Avg REC', value: avgRec.toFixed(2), valueStyle: `color:${getColor(avgRec, REC_THRESHOLDS)}` },
        ...(tiPlayers.length ? [{ label: 'Avg TI', value: avgTI.toFixed(1), valueStyle: `color:${getColor(avgTI, TI_THRESHOLDS)}` }] : []),
        { label: 'Avg Age', value: avgAge.toFixed(1), valueStyle: `color:${getColor(avgAge, AGE_THRESHOLDS)}` },
        { label: 'Avg ASI', value: Math.round(avgASI).toLocaleString(), valueStyle: 'color:var(--tmu-text-strong)' },
    ], { cls: 'tmsq-summary', variant: 'boxed', valueFirst: true });
};

/* ═══════════════════════════════════════════════════════════
   TABLE
   ═══════════════════════════════════════════════════════════ */
const buildSquadTable = (players, onSaleIds) => {
    const { getColor } = TmUtils;
    const { R5_THRESHOLDS, REC_THRESHOLDS, RTN_THRESHOLDS, TI_THRESHOLDS } = TmConst;

    const tbl = TmUI.table({
        headers: [
            {
                key: '_bar', label: '', sortable: false, cls: 'tmsq-pb', thCls: 'tmsq-pb',
                render: (_, p) => `<span class="tmsq-pb-inner" style="background:${p.positions[0].color}"></span>`
            },
            { key: 'no', label: '#', align: 'r' },
            {
                key: 'name', label: 'Player',
                render: (_, p) => {
                    const flag = TmUI.flag(p.country, 'tmsq-flag');
                    const enriched = { ...p, onSale: onSaleIds.has(String(p.id)) };
                    return `${flag}<a href="/players/${p.id}/" class="tmsq-link">${p.name}</a>${playerStatusIconsHtml(enriched)}`;
                }
            },
            {
                key: 'pos', label: 'Pos', align: 'c',
                sort: (a, b) => {
                    const getMin = p => Math.min(...(p.positions || p.posList).map(pos => pos.ordering ?? (pos.id === 9 ? 0 : (pos.id ?? pos.idx ?? 0) + 1)));
                    return getMin(a) - getMin(b);
                },
                render: (_, p) => TmPosition.chip(p.positions)
            },
            {
                key: 'age', label: 'Age', align: 'r',
                sort: (a, b) => (a.age * 12 + a.month) - (b.age * 12 + b.month),
                render: (_, p) => `<span style="color:${getColor(p.age, AGE_THRESHOLDS)}">${p.age}.${String(p.month).padStart(2, '0')}</span>`
            },
            {
                key: 'asi', label: 'ASI', align: 'r',
                render: v => `<span style="color:var(--tmu-text-strong)">${Number(v).toLocaleString()}</span>`
            },
            {
                key: 'r5', label: 'R5', align: 'r',
                render: v => `<span style="color:${getColor(v, R5_THRESHOLDS)};font-weight:700">${v}</span>`
            },
            {
                key: 'rec', label: 'REC', align: 'r',
                render: v => `<span style="color:${getColor(Number(v), REC_THRESHOLDS)};font-weight:700">${Number(v)}</span>`
            },
            {
                key: 'ti', label: 'TI', align: 'r',
                sort: (a, b) => (a.ti ?? -Infinity) - (b.ti ?? -Infinity),
                render: v => v !== null ? `<span style="color:${getColor(v, TI_THRESHOLDS)}">${v.toFixed(1)}</span>` : '<span style="color:var(--tmu-text-dim)">—</span>'
            },
            {
                key: 'routine', label: 'Rtn', align: 'r',
                render: v => `<span style="color:${getColor(v, RTN_THRESHOLDS)}">${v.toFixed(1)}</span>`
            },
            {
                key: 'trainingCustom', label: 'Training', align: 'c', sortable: false,
                render: v => PlayerTrainingDots.render(v)
            },
        ],
        items: players,
        sortKey: 'pos',
        sortDir: 1,
        density: 'cozy',
    });
    tbl.className = 'tmsq-table-wrap';
    return tbl;
};

/* ═══════════════════════════════════════════════════════════
   INTERNAL STATE
   ═══════════════════════════════════════════════════════════ */
let _container, _allPlayers, _onSaleIds;

const _doRender = () => {
    const seniors = _allPlayers.filter(p => p.age > 21);
    const youth = _allPlayers.filter(p => p.age <= 21);

    const body = _container;

    const heading = document.createElement('div');
    heading.className = 'tmsq-page-title';
    heading.innerHTML = '<span class="tmsq-page-title-icon">⚽️</span> Squad Overview';
    body.appendChild(heading);

    const senLbl = document.createElement('div');
    senLbl.className = 'tmsq-section-lbl';
    senLbl.textContent = `Seniors (${seniors.length})`;
    body.appendChild(senLbl);
    body.insertAdjacentHTML('beforeend', buildSummary(seniors));
    body.appendChild(buildSquadTable(seniors, _onSaleIds));

    const youthLbl = document.createElement('div');
    youthLbl.className = 'tmsq-section-lbl';
    youthLbl.style.marginTop = 'var(--tmu-space-lg)';
    youthLbl.textContent = `Youth ≤21 (${youth.length})`;
    body.appendChild(youthLbl);
    body.insertAdjacentHTML('beforeend', buildSummary(youth));
    body.appendChild(buildSquadTable(youth, _onSaleIds));
};

/* ═══════════════════════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════════════════════ */
const injectCSS = () => {
    const style = document.createElement('style');
    style.id = 'tmsq-table-styles';
    style.textContent = `
            #tmsq-panel {
                padding: var(--tmu-space-lg);
            }
            #tmsq-panel * { box-sizing: border-box; }

            .tmsq-page-title {
                font-size: var(--tmu-font-lg);
                font-weight: 700;
                color: var(--tmu-text-strong);
                margin-bottom: var(--tmu-space-lg);
                display: flex;
                align-items: center;
                gap: var(--tmu-space-sm);
            }
            .tmsq-page-title-icon { font-size: var(--tmu-font-lg); }

            .tmsq-summary { margin-bottom: var(--tmu-space-md); }
            .tmsq-pb-inner { display: block; width: 3px; min-height: 16px; border-radius: var(--tmu-space-xs); }

            .tmsq-link {
                color: #fff !important; text-decoration: none; font-weight: 500;
            }
            .tmsq-link:hover { color: var(--tmu-text-accent-soft) !important; text-decoration: underline; }

            .tmsq-flag { margin-right: var(--tmu-space-xs); vertical-align: middle; }

            .tmsq-section-lbl {
                font-size: var(--tmu-font-sm); font-weight: 700; color: var(--tmu-success);
                text-transform: uppercase; letter-spacing: 0.5px;
                margin-bottom: var(--tmu-space-sm); padding: var(--tmu-space-xs) 0;
                border-bottom: 1px solid var(--tmu-border-soft);
            }
            .tmsq-table-wrap .tm-pos-chip { font-size: var(--tmu-font-xs); }
        `;
    document.head.appendChild(style);
};

/* ═══════════════════════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════════════════════ */
let cssInjected = false;

/**
 * Render the squad table into `container`.
 * @param {HTMLElement} container   - Element to write into (e.g. #tmsq-panel div)
 * @param {Array}       players     - Combined array (seniors + b-team, already enriched)
 * @param {Object}      [options]
 * @param {Set}         [options.onSaleIds]  - Set of player id strings currently on sale
 */
const render = (container, players, { onSaleIds = new Set() } = {}) => {
    if (!cssInjected) { injectCSS(); cssInjected = true; }
    _container = container;
    _allPlayers = players;
    _onSaleIds = onSaleIds;

    // Tooltip delegation — survives TmUI.table() internal re-renders on sort
    container.addEventListener('mouseover', e => {
        const link = e.target.closest('.tmsq-link');
        if (!link || !TmPlayerTooltip) return;
        const m = link.href.match(/\/players\/(\d+)/);
        if (!m) return;
        const p = _allPlayers.find(pl => String(pl.id) === m[1]);
        if (p) TmPlayerTooltip.show(link, p);
    });
    container.addEventListener('mouseout', e => {
        if (e.target.closest('.tmsq-link') && TmPlayerTooltip) TmPlayerTooltip.hide();
    });

    _doRender();
};

export const TmSquadTable = { render };

