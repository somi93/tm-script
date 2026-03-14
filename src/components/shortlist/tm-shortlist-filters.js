import { TmPosition } from '../../lib/tm-position.js';

/**
     * Build filter bar HTML.
     * @param {object} state — { fPos, fSide, fAgeMin, fAgeMax, fR5Min, fR5Max, fRecMin, fRecMax, fTiMin, fTiMax }
     * @returns {string} HTML string
     */
    function buildFilters(state) {
        const { fPos, fSide, fAgeMin, fAgeMax, fR5Min, fR5Max, fRecMin, fRecMax, fTiMin, fTiMax } = state;
        const btnActive = g => fPos.has(g) ? ' active' : '';
        const sideActive = s => fSide.has(s) ? ' active' : '';
        return `
<div id="tmsl-filters">
  <div class="tmsl-btngrp">
    <span class="tmsl-pos-btn gk${btnActive('gk')}" data-group="gk">GK</span>
    <span class="tmsl-pos-btn de${btnActive('de')}" data-group="de">D</span>
    <span class="tmsl-pos-btn dm${btnActive('dm')}" data-group="dm">DM</span>
    <span class="tmsl-pos-btn mf${btnActive('mf')}" data-group="mf">M</span>
    <span class="tmsl-pos-btn om${btnActive('om')}" data-group="om">OM</span>
    <span class="tmsl-pos-btn fw${btnActive('fw')}" data-group="fw">F</span>
  </div>
  <div class="tmsl-btngrp">
    <span class="tmsl-side-btn${sideActive('l')}" data-side="l">L</span>
    <span class="tmsl-side-btn${sideActive('c')}" data-side="c">C</span>
    <span class="tmsl-side-btn${sideActive('r')}" data-side="r">R</span>
  </div>
  <div class="tmsl-fsep"></div>
  <div class="tmsl-fgroup">
    <span class="tmsl-flbl">Age:</span>
    <input class="tmsl-fnum" id="tmsl-agemin" type="number" min="0" max="40" value="${fAgeMin || ''}" placeholder="Min">
    <span style="color:#4a6a38;font-size:11px">–</span>
    <input class="tmsl-fnum" id="tmsl-agemax" type="number" min="0" max="40" value="${fAgeMax === 99 ? '' : fAgeMax}" placeholder="Max">
  </div>
  <div class="tmsl-fsep"></div>
  <div class="tmsl-fgroup">
    <span class="tmsl-flbl">R5:</span>
    <input class="tmsl-fnum" id="tmsl-r5min" type="number" min="0" step="0.1" value="${fR5Min}" placeholder="Min">
    <span style="color:#4a6a38;font-size:11px">–</span>
    <input class="tmsl-fnum" id="tmsl-r5max" type="number" min="0" step="0.1" value="${fR5Max}" placeholder="Max">
  </div>
  <div class="tmsl-fsep"></div>
  <div class="tmsl-fgroup">
    <span class="tmsl-flbl">REC:</span>
    <input class="tmsl-fnum" id="tmsl-recmin" type="number" min="0" step="0.01" value="${fRecMin}" placeholder="Min">
    <span class="tmsl-flbl">–</span>
    <input class="tmsl-fnum" id="tmsl-recmax" type="number" min="0" step="0.01" value="${fRecMax}" placeholder="Max">
  </div>
  <div class="tmsl-fsep"></div>
  <div class="tmsl-fgroup">
    <span class="tmsl-flbl">TI:</span>
    <input class="tmsl-fnum" id="tmsl-timin" type="number" step="0.1" value="${fTiMin}" placeholder="Min">
    <span class="tmsl-flbl">–</span>
    <input class="tmsl-fnum" id="tmsl-timax" type="number" step="0.1" value="${fTiMax}" placeholder="Max">
  </div>
</div>`;
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

    export const TmShortlistFilters = { buildFilters, playerMatchesFilters };

