import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { PlayerTrainingDots } from '../shared/tm-training-dots.js';
import { TmPlayerTooltip } from '../player/tm-player-tooltip.js';
import { TmSummaryStrip } from '../shared/tm-summary-strip.js';
import { playerStatusIconsHtml } from '../shared/tm-player-status-icons.js';
import { TmPlayersTable } from '../shared/tm-players-table.js';

/* ═══════════════════════════════════════════════════════════
   SUMMARY BAR
   ═══════════════════════════════════════════════════════════ */
const buildSummary = players => {
    const { getColor } = TmUtils;
    const { AGE_THRESHOLDS, REC_THRESHOLDS, R5_THRESHOLDS, TI_THRESHOLDS } = TmConst;
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
   INTERNAL STATE
   ═══════════════════════════════════════════════════════════ */
let _container, _allPlayers, _onSaleIds, _titleHtml, _showTraining;

const _tableOpts = () => ({
    columns: { timeleft: false, curbid: false },
    sortKey: 'pos', sortDir: 1,
    onRowClick: null, rowCls: null,
    nameDecorator: p => playerStatusIconsHtml({ ...p, onSale: _onSaleIds.has(String(p.id)) }),
    extraColsBefore: [{ key: 'no', label: '#', align: 'r' }],
    extraColsAfter: _showTraining
        ? [{ key: 'trainingCustom', label: 'Training', align: 'c', sortable: false, render: v => PlayerTrainingDots.render(v) }]
        : [],
});

const _doRender = () => {
    const seniors = _allPlayers.filter(p => p.age > 21);
    const youth = _allPlayers.filter(p => p.age <= 21);

    const body = _container;

    const heading = document.createElement('div');
    heading.className = 'tmsq-page-title';
    heading.innerHTML = _titleHtml || '<span class="tmsq-page-title-icon">⚽️</span> Squad Overview';
    body.appendChild(heading);

    const senLbl = document.createElement('div');
    senLbl.className = 'tmsq-section-lbl';
    senLbl.textContent = `Seniors (${seniors.length})`;
    body.appendChild(senLbl);
    body.insertAdjacentHTML('beforeend', buildSummary(seniors));
    TmPlayersTable.mount(body, seniors, _tableOpts());

    const youthLbl = document.createElement('div');
    youthLbl.className = 'tmsq-section-lbl';
    youthLbl.style.marginTop = 'var(--tmu-space-lg)';
    youthLbl.textContent = `Youth ≤21 (${youth.length})`;
    body.appendChild(youthLbl);
    body.insertAdjacentHTML('beforeend', buildSummary(youth));
    TmPlayersTable.mount(body, youth, _tableOpts());
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

            .tmsq-section-lbl {
                font-size: var(--tmu-font-sm); font-weight: 700; color: var(--tmu-success);
                text-transform: uppercase; letter-spacing: 0.5px;
                margin-bottom: var(--tmu-space-sm); padding: var(--tmu-space-xs) 0;
                border-bottom: 1px solid var(--tmu-border-soft);
            }
            .tmpt-wrap .tm-pos-chip { font-size: var(--tmu-font-xs); }
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
const render = (container, players, { onSaleIds = new Set(), titleHtml = '', showTraining = true } = {}) => {
    if (!cssInjected) { injectCSS(); cssInjected = true; }
    _container = container;
    _allPlayers = players;
    _onSaleIds = onSaleIds;
    _titleHtml = titleHtml;
    _showTraining = showTraining;

    // Tooltip delegation — survives sort re-renders
    container.addEventListener('mouseover', e => {
        const link = e.target.closest('.tmpt-link');
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

