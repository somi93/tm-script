import { TmConst } from '../../lib/tm-constants.js';
import { TmUI } from '../shared/tm-ui.js';

export const TmTransferSidebar = {
        build() {
            const { SKILL_KEYS_OUT, SKILL_KEYS_GK, SKILL_LABELS } = TmConst;
  const buttonHtml = (opts) => TmUI.button(opts).outerHTML;
  const checkboxFieldHtml = (opts) => TmUI.checkboxField(opts).outerHTML;
    const inputHtml = (opts) => TmUI.input({ type: 'number', size: 'full', density: 'regular', grow: true, ...opts }).outerHTML;
            const skillSelectOpts = (withNone = true) => {
                const combined = [...SKILL_KEYS_OUT, ...SKILL_KEYS_GK.filter(s => !SKILL_KEYS_OUT.includes(s))];
                let s = withNone ? '<option value="0">—</option>' : '';
                for (const sk of combined) s += `<option value="${sk}">${SKILL_LABELS[sk]}</option>`;
                return s;
            };

            const valOpts = `<option value="0">≥</option>${[...Array(20)].map((_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}`;

            return `
    <div id="tms-sidebar" class="tmvu-transfer-sidebar">
      <div id="tms-filter-box">
      <div class="tms-sb-section">
        <div class="tms-sb-head">Age Range
          ${checkboxFieldHtml({ id: 'tms-for', checked: true, label: 'Foreigners', cls: 'tms-for-inline' })}
        </div>
        <div class="tms-sb-body">
          <div class="tms-range-row">
            ${inputHtml({ id: 'tms-amin', min: 18, max: 37, value: 18, placeholder: 'Min' })}
            <span class="tms-range-sep">–</span>
            ${inputHtml({ id: 'tms-amax', min: 18, max: 37, value: 37, placeholder: 'Max' })}
          </div>
        </div>
      </div>

      <div class="tms-sb-section">
        <div class="tms-sb-head">Recommendation</div>
        <div class="tms-sb-body">
          <div class="tms-range-row">
            ${inputHtml({ id: 'tms-rmin', min: 0, max: 5, step: 0.01, value: 0, placeholder: 'Min' })}
            <span class="tms-range-sep">–</span>
            ${inputHtml({ id: 'tms-rmax', min: 0, max: 5, step: 0.01, value: 5, placeholder: 'Max' })}
          </div>
        </div>
      </div>

      <div class="tms-sb-section">
        <div class="tms-sb-head">R5 <span class="tms-post-note">post-filter</span></div>
        <div class="tms-sb-body">
          <div class="tms-range-row">
            ${inputHtml({ id: 'tms-r5min', min: 0, max: 200, step: 0.1, placeholder: 'Min' })}
            <span class="tms-range-sep">–</span>
            ${inputHtml({ id: 'tms-r5max', min: 0, max: 200, step: 0.1, placeholder: 'Max' })}
          </div>
        </div>
      </div>

      <div class="tms-sb-section">
        <div class="tms-sb-head">TI <span class="tms-post-note">post-filter</span></div>
        <div class="tms-sb-body">
          <div class="tms-range-row">
            ${inputHtml({ id: 'tms-timin', min: -100, max: 200, step: 0.1, placeholder: 'Min' })}
            <span class="tms-range-sep">–</span>
            ${inputHtml({ id: 'tms-timax', min: -100, max: 200, step: 0.1, placeholder: 'Max' })}
          </div>
        </div>
      </div>

      <div class="tms-sb-section">
        <div class="tms-sb-body">
          <div class="tms-pos-formation">
            <div class="tms-pos-formation-empty"></div>
            <div class="tms-filter-btn tms-gk" data-fp="gk">GK</div>
            <div class="tms-pos-formation-empty"></div>
            <div class="tms-filter-btn tms-de" data-fp="dl">DL</div>
            <div class="tms-filter-btn tms-de" data-fp="dc">DC</div>
            <div class="tms-filter-btn tms-de" data-fp="dr">DR</div>
            <div class="tms-filter-btn tms-dm" data-fp="dml">DML</div>
            <div class="tms-filter-btn tms-dm" data-fp="dmc">DMC</div>
            <div class="tms-filter-btn tms-dm" data-fp="dmr">DMR</div>
            <div class="tms-filter-btn tms-mf" data-fp="ml">ML</div>
            <div class="tms-filter-btn tms-mf" data-fp="mc">MC</div>
            <div class="tms-filter-btn tms-mf" data-fp="mr">MR</div>
            <div class="tms-filter-btn tms-om" data-fp="oml">OML</div>
            <div class="tms-filter-btn tms-om" data-fp="omc">OMC</div>
            <div class="tms-filter-btn tms-om" data-fp="omr">OMR</div>
            <div class="tms-pos-formation-empty"></div>
            <div class="tms-filter-btn tms-fw" data-fp="fc">FC</div>
            <div class="tms-pos-formation-empty"></div>
          </div>
        </div>
      </div>
      <div class="tms-primary-actions">
        ${buttonHtml({ id: 'tms-search-btn', label: '🔍 Search 100', color: 'primary', block: true })}
        ${buttonHtml({ id: 'tms-findall-btn', label: '⬇️ Find All', color: 'secondary', size: 'sm', block: true })}
      </div>
      <div class="tms-sb-section" style="margin-top:var(--tmu-space-sm)">
        <div class="tms-sb-head">Saved Filters</div>
        <div class="tms-sb-body">
          <select id="tms-saved-filters-sel" class="tms-sel" style="width:100%;margin-bottom:var(--tmu-space-sm)"><option value="">— no saved filters —</option></select>
          <div class="tms-filter-actions">
            <div class="tms-filter-action-cell">${buttonHtml({ id: 'tms-filter-load-btn', label: '📂 Load', color: 'secondary', size: 'xs', block: true })}</div>
            <div class="tms-filter-action-cell tms-filter-action-cell-wide">${buttonHtml({ id: 'tms-filter-save-btn', label: '💾 Save Current', color: 'secondary', size: 'xs', block: true })}</div>
            <div class="tms-filter-action-cell">${buttonHtml({ id: 'tms-filter-del-btn', label: '🗑', color: 'danger', size: 'xs', block: true })}</div>
          </div>
        </div>
      </div>
      <div class="tms-more-toggle-wrap">${buttonHtml({
                id: 'tms-more-toggle',
                color: 'secondary',
                size: 'xs',
                block: true,
                cls: 'tms-more-toggle',
                slot: '<span class="tms-more-toggle-content"><span>More Filters</span><span class="tms-more-arrow">▼</span></span>',
            })}</div>
      <div class="tms-more-body" id="tms-more-body">
        <div class="tms-sb-section">
          <div class="tms-sb-head">Max Price</div>
          <div class="tms-sb-body">
            <div class="tms-row">
              <select id="tms-cost" class="tms-sel">
                <option value="0" selected>Any</option>
                <option value="aff">Affordable</option>
                <option value="5">5 Mil</option>
                <option value="25">25 Mil</option>
                <option value="50">50 Mil</option>
                <option value="100">100 Mil</option>
                <option value="250">250 Mil</option>
                <option value="500">500 Mil</option>
              </select>
            </div>
          </div>
        </div>

        <div class="tms-sb-section">
          <div class="tms-sb-head">Time Left</div>
          <div class="tms-sb-body">
            <div class="tms-row">
              <select id="tms-time" class="tms-sel">
                <option value="0" selected>Any</option>
                <option value="1">15 Minutes</option>
                <option value="2">1 Hour</option>
                <option value="3">6 Hours</option>
                <option value="4">1 Day</option>
                <option value="5">2 Days</option>
                <option value="6">4 Days</option>
              </select>
            </div>
          </div>
        </div>

        <div class="tms-sb-section">
          <div class="tms-sb-head">Skill Filters</div>
          <div class="tms-sb-body">
            <div class="tms-skill-row">
              <select class="tms-sel" id="tms-sf-s0">${skillSelectOpts()}</select>
              <select class="tms-sel" id="tms-sf-v0" style="width:46px">${valOpts}</select>
            </div>
            <div class="tms-skill-row">
              <select class="tms-sel" id="tms-sf-s1">${skillSelectOpts()}</select>
              <select class="tms-sel" id="tms-sf-v1" style="width:46px">${valOpts}</select>
            </div>
            <div class="tms-skill-row">
              <select class="tms-sel" id="tms-sf-s2">${skillSelectOpts()}</select>
              <select class="tms-sel" id="tms-sf-v2" style="width:46px">${valOpts}</select>
            </div>
          </div>
        </div>
      </div>
      </div>

    </div>`;
        },
    };

