import { TmPosition } from '../../lib/tm-position.js';
import { TmUI } from '../shared/tm-ui.js';

const inputHtml = (opts = {}) => TmUI.input({ type: 'number', size: 'xs', density: 'compact', ...opts }).outerHTML;
const POSITION_FILTERS = [
  { key: 'gk', label: 'GK', cls: 'gk' },
  { key: 'de', label: 'D', cls: 'de' },
  { key: 'dm', label: 'DM', cls: 'dm' },
  { key: 'mf', label: 'M', cls: 'mf' },
  { key: 'om', label: 'OM', cls: 'om' },
  { key: 'fw', label: 'F', cls: 'fw' },
];
const SIDE_FILTERS = [
  { key: 'l', label: 'L' },
  { key: 'c', label: 'C' },
  { key: 'r', label: 'R' },
];
const NUMERIC_FILTER_IDS = [
  'tmsl-agemin', 'tmsl-agemax', 'tmsl-r5min', 'tmsl-r5max',
  'tmsl-recmin', 'tmsl-recmax', 'tmsl-timin', 'tmsl-timax'
];

function renderToggleGroup(items, opts) {
  const baseCls = opts.baseCls;
  const dataAttr = opts.dataAttr;
  const isActive = opts.isActive;
  let html = '<div class="tmsl-btngrp">';
  items.forEach(item => {
    html += `<span class="${baseCls}${item.cls ? ' ' + item.cls : ''}${isActive(item.key) ? ' active' : ''}" data-${dataAttr}="${item.key}">${item.label}</span>`;
  });
  html += '</div>';
  return html;
}

/**
     * Build filter bar HTML.
     * @param {object} state — { fPos, fSide, fAgeMin, fAgeMax, fR5Min, fR5Max, fRecMin, fRecMax, fTiMin, fTiMax }
     * @returns {string} HTML string
     */
    function buildFilters(state) {
        const { fPos, fSide, fAgeMin, fAgeMax, fR5Min, fR5Max, fRecMin, fRecMax, fTiMin, fTiMax } = state;
        return `
<div id="tmsl-filters">
  ${renderToggleGroup(POSITION_FILTERS, { baseCls: 'tmsl-pos-btn', dataAttr: 'group', isActive: key => fPos.has(key) })}
  ${renderToggleGroup(SIDE_FILTERS, { baseCls: 'tmsl-side-btn', dataAttr: 'side', isActive: key => fSide.has(key) })}
  <div class="tmsl-fsep"></div>
  <div class="tmsl-fgroup">
    <span class="tmsl-flbl">Age:</span>
    ${inputHtml({ id: 'tmsl-agemin', min: 0, max: 40, value: fAgeMin || '', placeholder: 'Min' })}
    <span style="color:var(--tmu-text-dim);font-size:var(--tmu-font-xs)">–</span>
    ${inputHtml({ id: 'tmsl-agemax', min: 0, max: 40, value: fAgeMax === 99 ? '' : fAgeMax, placeholder: 'Max' })}
  </div>
  <div class="tmsl-fsep"></div>
  <div class="tmsl-fgroup">
    <span class="tmsl-flbl">R5:</span>
    ${inputHtml({ id: 'tmsl-r5min', min: 0, step: 0.1, value: fR5Min, placeholder: 'Min' })}
    <span style="color:var(--tmu-text-dim);font-size:var(--tmu-font-xs)">–</span>
    ${inputHtml({ id: 'tmsl-r5max', min: 0, step: 0.1, value: fR5Max, placeholder: 'Max' })}
  </div>
  <div class="tmsl-fsep"></div>
  <div class="tmsl-fgroup">
    <span class="tmsl-flbl">REC:</span>
    ${inputHtml({ id: 'tmsl-recmin', min: 0, step: 0.01, value: fRecMin, placeholder: 'Min' })}
    <span class="tmsl-flbl">–</span>
    ${inputHtml({ id: 'tmsl-recmax', min: 0, step: 0.01, value: fRecMax, placeholder: 'Max' })}
  </div>
  <div class="tmsl-fsep"></div>
  <div class="tmsl-fgroup">
    <span class="tmsl-flbl">TI:</span>
    ${inputHtml({ id: 'tmsl-timin', step: 0.1, value: fTiMin, placeholder: 'Min' })}
    <span class="tmsl-flbl">–</span>
    ${inputHtml({ id: 'tmsl-timax', step: 0.1, value: fTiMax, placeholder: 'Max' })}
  </div>
</div>`;
    }

  function bindFilters(panel, handlers) {
    panel._tmslFilterHandlers = handlers;
    if (panel.dataset.tmslFiltersBound === '1') return;

    panel.dataset.tmslFiltersBound = '1';

    panel.addEventListener('click', event => {
      const filterHandlers = panel._tmslFilterHandlers;
      if (!filterHandlers) return;

      const groupButton = event.target.closest('.tmsl-pos-btn[data-group]');
      if (groupButton && panel.contains(groupButton)) {
        filterHandlers.onGroupFilter(groupButton.dataset.group);
        return;
      }

      const sideButton = event.target.closest('.tmsl-side-btn[data-side]');
      if (sideButton && panel.contains(sideButton)) {
        filterHandlers.onSideFilter(sideButton.dataset.side);
      }
    });

    panel.addEventListener('change', event => {
      const filterHandlers = panel._tmslFilterHandlers;
      const filterId = event.target?.id;
      if (!filterHandlers || !NUMERIC_FILTER_IDS.includes(filterId)) return;
      filterHandlers.onNumFilter(filterId, event.target.value);
    });
  }

    /**
     * Test whether a player passes the current filters.
     * @param {object} p     — player model (needs .posList, .ageFloat, .r5, .rec, .ti)
     * @param {object} state — same shape as buildFilters state
     * @returns {boolean}
     */
    function playerMatchesFilters(p, state) {
        const { fPos, fSide, fAgeMin, fAgeMax, fR5Min, fR5Max, fRecMin, fRecMax, fTiMin, fTiMax } = state;

        if (fPos.size > 0) {
            const groups = new Set((p.positions || []).map(pp => TmPosition.filterGroup(pp.id)));
            if (![...fPos].some(g => groups.has(g))) return false;
        }
        if (fSide.size > 0) {
            const sides = new Set((p.positions || []).map(pp => {
                const n = pp.position;
                if (n === 'gk') return 'c';
                if (n.endsWith('l')) return 'l';
                if (n.endsWith('r')) return 'r';
                return 'c';
            }));
            if (![...fSide].some(s => sides.has(s))) return false;
        }
        const ageFloat = p.age + (p.months || 0) / 12;
        if (ageFloat < fAgeMin || ageFloat > fAgeMax) return false;
        if (fR5Min  !== '' && p.r5  < parseFloat(fR5Min))  return false;
        if (fR5Max  !== '' && p.r5  > parseFloat(fR5Max))  return false;
        if (fRecMin !== '' && p.rec < parseFloat(fRecMin)) return false;
        if (fRecMax !== '' && p.rec > parseFloat(fRecMax)) return false;
        if (fTiMin  !== '' && (p.ti === null || p.ti < parseFloat(fTiMin))) return false;
        if (fTiMax  !== '' && (p.ti === null || p.ti > parseFloat(fTiMax))) return false;
        return true;
    }

    export const TmShortlistFilters = { buildFilters, bindFilters, playerMatchesFilters };

