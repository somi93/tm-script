import { TmConst } from '../../lib/tm-constants.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { PlayerTrainingDots } from '../shared/tm-training-dots.js';
import { TmPlayerTooltip } from '../player/tooltip/tm-player-tooltip.js';
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
let _container, _allPlayers, _onSaleIds, _titleHtml, _showTraining, _showSummary, _splitBy;

const _tableOpts = () => ({
    columns: { timeleft: false, curbid: false },
    sortKey: 'pos', sortDir: 1,
    onRowClick: null, rowCls: null,
    nameDecorator: p => playerStatusIconsHtml({ ...p, onSale: _onSaleIds.has(String(p.id)) }),
    extraColsBefore: [{ key: 'no', label: '#', align: 'r' }],
    extraColsAfter: _showTraining
        ? [{ key: 'training', label: 'Training', align: 'c', sortable: false, render: (v) => PlayerTrainingDots.render(Array.isArray(v?.custom) ? v.custom.join('') : '') }]
        : [],
});

const _appendSection = (body, label, players, marginTop = false) => {
    const lbl = document.createElement('div');
    lbl.className = 'tmsq-section-lbl';
    if (marginTop) lbl.style.marginTop = 'var(--tmu-space-lg)';
    lbl.textContent = label;
    body.appendChild(lbl);
    if (_showSummary) body.insertAdjacentHTML('beforeend', buildSummary(players));
    TmPlayersTable.mount(body, players, _tableOpts());
};

const _doRender = () => {
    const body = _container;

    const heading = document.createElement('div');
    heading.className = 'tmsq-page-title';
    heading.innerHTML = _titleHtml || '<span class="tmsq-page-title-icon">⚽️</span> Squad Overview';
    body.appendChild(heading);

    if (_splitBy === 'team') {
        const aTeam = _allPlayers.filter(p => !p.b);
        const bTeam = _allPlayers.filter(p => p.b);
        _appendSection(body, `A Team (${aTeam.length})`, aTeam);
        if (bTeam.length) _appendSection(body, `B Team (${bTeam.length})`, bTeam, true);
    } else {
        const seniors = _allPlayers.filter(p => p.age > 21);
        const youth = _allPlayers.filter(p => p.age <= 21);
        _appendSection(body, `Seniors (${seniors.length})`, seniors);
        _appendSection(body, `Youth ≤21 (${youth.length})`, youth, true);
    }
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
const render = (container, players, { onSaleIds = new Set(), titleHtml = '', showTraining = true, showSummary = true, splitBy = 'age' } = {}) => {
    if (!cssInjected) { injectCSS(); cssInjected = true; }
    _container = container;
    _allPlayers = players;
    _onSaleIds = onSaleIds;
    _titleHtml = titleHtml;
    _showTraining = showTraining;
    _showSummary = showSummary;
    _splitBy = splitBy;

    // Tooltip delegation — survives sort re-renders
    container.addEventListener('mouseover', e => {
        const row = e.target.closest('tr');
        if (!row) return;
        const link = row.querySelector('.tmpt-link');
        if (!link || !TmPlayerTooltip) return;
        const m = link.href.match(/\/players\/(\d+)/);
        if (!m) return;
        const p = _allPlayers.find(pl => String(pl.id) === m[1]);
        if (p) TmPlayerTooltip.show(link, p);
    });
    container.addEventListener('mouseout', e => {
        if (!TmPlayerTooltip) return;
        const row = e.target.closest('tr');
        if (!row) return;
        if (row.contains(e.relatedTarget)) return;
        TmPlayerTooltip.hide();
    });

    _doRender();
};

export const TmSquadTable = { render };

