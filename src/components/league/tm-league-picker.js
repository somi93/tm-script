import { TMLeagueService } from '../../services/league.js';
import { TmUI } from '../shared/tm-ui.js';

/**
 * TmLeaguePicker
 *
 * Handles the "Change League" dialog: country/division/group autocomplete and navigation.
 * Reads leagueCountry/leagueDivision/leagueGroup from window.TmLeagueCtx.
 */

if (!document.getElementById('tsa-league-picker-style')) {
    const _s = document.createElement('style');
    _s.id = 'tsa-league-picker-style';
    _s.textContent = `
            #tsa-league-dialog-overlay {
                position: fixed; inset: 0; z-index: 99999;
                background: var(--tmu-shadow-panel);
                display: flex; align-items: center; justify-content: center;
            }
            .tsa-ld-box {
                background: var(--tmu-surface-card-soft); border: 1px solid var(--tmu-border-input);
                border-radius: 8px; box-shadow: 0 12px 40px var(--tmu-shadow-panel);
                width: 780px; max-width: 96vw;
                display: flex; flex-direction: column; overflow: visible;
            }
            .tsa-ld-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 10px 14px; background: var(--tmu-surface-overlay-strong);
                border-bottom: 1px solid var(--tmu-border-input-overlay);
                border-radius: 8px 8px 0 0;
            }
            .tsa-ld-title { font-size: 12px; font-weight: 700; color: var(--tmu-success); text-transform: uppercase; letter-spacing: 0.6px; }
            #tsa-ld-close {
                background: none; border: none; color: var(--tmu-text-faint); font-size: 18px; line-height: 1;
                padding: 0 2px; transition: color 0.12s, opacity 0.15s; min-width: 0;
            }
            #tsa-ld-close:hover { color: var(--tmu-text-strong); }
            .tsa-ld-body { padding: 0; }
            .tsa-ld-loading { padding: 20px; text-align: center; font-size: 11px; color: var(--tmu-text-dim); }
            .tsa-ld-picker { display: flex; flex-direction: row; align-items: flex-end; gap: 10px; padding: 14px; }
            .tsa-ld-field { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
            .tsa-ld-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--tmu-text-dim); }
            .tsa-ld-footer { display: flex; flex-shrink: 0; }
            #tsa-ld-go { text-transform: uppercase; letter-spacing: 0.5px; }
            #tsa-ld-go:disabled { background: var(--tmu-surface-tab-active); color: var(--tmu-text-disabled-strong); cursor: not-allowed; }
        `;
    document.head.appendChild(_s);
}

const buttonHtml = (opts) => TmUI.button(opts).outerHTML;
const createAutocomplete = (opts) => TmUI.autocomplete({ tone: 'overlay', density: 'comfy', size: 'full', grow: true, ...opts });
const createFlag = (suffix) => {
    if (!suffix) return null;
    const img = document.createElement('img');
    img.className = 'tmu-ac-media';
    img.src = `/pics/flags/gradient/${suffix}.png`;
    img.alt = '';
    img.onerror = () => { img.style.display = 'none'; };
    return img;
};

const openLeagueDialog = () => {
    const s = window.TmLeagueCtx;
    const existing = document.getElementById('tsa-league-dialog-overlay');
    if (existing) { existing.remove(); return; }

    const overlay = document.createElement('div');
    overlay.id = 'tsa-league-dialog-overlay';
    overlay.innerHTML = `
            <div class="tsa-ld-box" id="tsa-ld-box">
                <div class="tsa-ld-header">
                    <span class="tsa-ld-title">Change League</span>
                    ${buttonHtml({ id: 'tsa-ld-close', label: '×', variant: 'icon', color: 'secondary', size: 'xs' })}
                </div>
                <div class="tsa-ld-body" id="tsa-ld-body">
                    ${TmUI.loading('Loading leagues...')}
                </div>
            </div>`;
    document.body.appendChild(overlay);
    document.getElementById('tsa-ld-close').addEventListener('click', () => overlay.remove());

    TMLeagueService.fetchLeagueDivisions(s.leagueCountry || 'cs').then(data => {
        if (!data) { document.getElementById('tsa-ld-body').innerHTML = TmUI.error('Failed to load leagues.'); return; }
        renderLeaguePicker(data, document.getElementById('tsa-ld-body'));
    });
};

const renderLeaguePicker = (data, body) => {
    const s = window.TmLeagueCtx;
    const allCountries = Object.values(data.countries).flat()
        .sort((a, b) => a.country.localeCompare(b.country));
    const currentSuffix = (s.leagueCountry || 'cs').toLowerCase();

    body.innerHTML = `
            <div class="tsa-ld-picker">
                <div class="tsa-ld-field">
                    <label class="tsa-ld-label">Country</label>
                    <div id="tsa-ld-country-ac"></div>
                </div>
                <div class="tsa-ld-field">
                    <label class="tsa-ld-label">Division</label>
                    <div id="tsa-ld-div-ac"></div>
                </div>
                <div class="tsa-ld-field" id="tsa-ld-group-field" hidden>
                    <label class="tsa-ld-label">Group</label>
                    <div id="tsa-ld-group-ac"></div>
                </div>
                <div class="tsa-ld-footer">
                    ${buttonHtml({ id: 'tsa-ld-go', label: 'Go', color: 'primary', disabled: true })}
                </div>
            </div>`;

    let selCountry = null, selDivision = null, selGroup = null, divisionData = null;
    const groupField = document.getElementById('tsa-ld-group-field');
    const goBtn = document.getElementById('tsa-ld-go');

    const countryAc = createAutocomplete({ id: 'tsa-ld-country-input', placeholder: 'Type to search…', autocomplete: 'off' });
    const divAc = createAutocomplete({ id: 'tsa-ld-div-input', placeholder: 'Select country first…', autocomplete: 'off', disabled: true });
    const groupAc = createAutocomplete({ id: 'tsa-ld-group-input', placeholder: 'Select group…', autocomplete: 'off', disabled: true });

    document.getElementById('tsa-ld-country-ac')?.replaceWith(countryAc);
    document.getElementById('tsa-ld-div-ac')?.replaceWith(divAc);
    document.getElementById('tsa-ld-group-ac')?.replaceWith(groupAc);

    const countryInput = countryAc.inputEl;
    const divInput = divAc.inputEl;
    const groupInput = groupAc.inputEl;

    const updateGo = () => {
        const nGroups = selDivision ? parseInt(selDivision.groups) || 1 : 0;
        goBtn.disabled = !(selCountry && selDivision && (nGroups <= 1 || selGroup));
    };
    const makeItem = (label, flagSuffix, onClick) => {
        return TmUI.autocompleteItem({ label, icon: createFlag(flagSuffix), onSelect: onClick });
    };

    const applyDivisions = divs => {
        divisionData = divs;
        divInput.placeholder = divs.length ? 'Select division…' : 'No divisions found';
        divAc.setDisabled(!divs.length);
    };
    const selectGroup = g => {
        selGroup = g;
        groupAc.setValue(`Group ${g}`);
        groupAc.hideDrop();
        updateGo();
    };
    const selectDivision = d => {
        selDivision = d;
        selGroup = null;
        divAc.setValue(d.name);
        divAc.hideDrop();
        const nGroups = parseInt(d.groups) || 1;
        if (nGroups > 1) {
            groupField.hidden = false;
            groupAc.setDisabled(false);
            groupAc.setValue('');
            groupInput.placeholder = `Select group (1–${nGroups})…`;
            groupAc.hideDrop();
        } else {
            groupField.hidden = true;
            selGroup = 1;
        }
        updateGo();
    };
    const selectCountry = (c, prefetchedDivisions) => {
        selCountry = c;
        selDivision = null;
        selGroup = null;
        countryAc.setValue(c.country);
        countryAc.setLeading(createFlag(c.suffix));
        countryAc.hideDrop();
        divAc.setValue('');
        groupField.hidden = true;
        groupAc.setValue('');
        groupAc.setDisabled(true);
        updateGo();
        if (prefetchedDivisions) {
            applyDivisions(prefetchedDivisions);
        } else {
            divInput.placeholder = 'Loading divisions…';
            divAc.setDisabled(true);
            TMLeagueService.fetchLeagueDivisions(c.suffix).then(d => {
                if (d) applyDivisions(d.divisions || []);
            });
        }
    };

    const countryDivs = c => c.suffix === currentSuffix ? (data.divisions || []) : null;

    countryInput.addEventListener('focus', () => {
        const q = countryInput.value;
        const items = allCountries
            .filter(c => !q || c.country.toLowerCase().includes(q.toLowerCase()))
            .map(c => makeItem(c.country, c.suffix, () => selectCountry(c, countryDivs(c))));
        countryAc.setItems(items);
    });
    countryInput.addEventListener('input', () => {
        const q = countryInput.value.toLowerCase();
        const items = allCountries
            .filter(c => c.country.toLowerCase().includes(q))
            .map(c => makeItem(c.country, c.suffix, () => selectCountry(c, countryDivs(c))));
        countryAc.setItems(items);
    });
    countryInput.addEventListener('blur', () => setTimeout(() => countryAc.hideDrop(), 150));

    divInput.addEventListener('focus', () => {
        if (!divisionData) return;
        divAc.setItems(divisionData.map(d => makeItem(d.name, null, () => selectDivision(d))));
    });
    divInput.addEventListener('input', () => {
        if (!divisionData) return;
        const q = divInput.value.toLowerCase();
        divAc.setItems(divisionData
            .filter(d => d.name.toLowerCase().includes(q))
            .map(d => makeItem(d.name, null, () => selectDivision(d))));
    });
    divInput.addEventListener('blur', () => setTimeout(() => divAc.hideDrop(), 150));

    groupInput.addEventListener('focus', () => {
        if (!selDivision) return;
        const nGroups = parseInt(selDivision.groups) || 1;
        groupAc.setItems(Array.from({ length: nGroups }, (_, i) => i + 1)
            .map(g => makeItem(`Group ${g}`, null, () => selectGroup(g))));
    });
    groupInput.addEventListener('blur', () => setTimeout(() => groupAc.hideDrop(), 150));

    goBtn.addEventListener('click', () => {
        if (!selCountry || !selDivision) return;
        document.getElementById('tsa-league-dialog-overlay')?.remove();
        window.location.href = `/league/${selCountry.suffix}/${selDivision.division}/${selGroup || 1}/`;
    });

    const cur = allCountries.find(c => c.suffix === currentSuffix);
    if (cur) {
        selectCountry(cur, data.divisions || []);
        if (s.leagueDivision) {
            const curDiv = (data.divisions || []).find(d => String(d.division) === String(s.leagueDivision));
            if (curDiv) {
                selectDivision(curDiv);
                const g = parseInt(s.leagueGroup) || 1;
                const nGroups = parseInt(curDiv.groups) || 1;
                if (nGroups > 1) selectGroup(g);
            }
        }
    }
};

export const TmLeaguePicker = { openLeagueDialog };
