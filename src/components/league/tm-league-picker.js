import { TMLeagueService } from '../../services/league.js';

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
                background: rgba(0,0,0,0.72);
                display: flex; align-items: center; justify-content: center;
            }
            .tsa-ld-box {
                background: #111f0a; border: 1px solid rgba(61,104,40,0.6);
                border-radius: 8px; box-shadow: 0 12px 40px rgba(0,0,0,0.8);
                width: 780px; max-width: 96vw;
                display: flex; flex-direction: column; overflow: visible;
            }
            .tsa-ld-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 10px 14px; background: rgba(0,0,0,0.35);
                border-bottom: 1px solid rgba(61,104,40,0.35);
                border-radius: 8px 8px 0 0;
            }
            .tsa-ld-title { font-size: 12px; font-weight: 700; color: #6cc040; text-transform: uppercase; letter-spacing: 0.6px; }
            .tsa-ld-close { background: none; border: none; color: #4a7038; font-size: 18px; line-height: 1; cursor: pointer; padding: 0 2px; transition: color 0.12s; }
            .tsa-ld-close:hover { color: #c8e0b4; }
            .tsa-ld-body { padding: 0; }
            .tsa-ld-loading { padding: 20px; text-align: center; font-size: 11px; color: #5a7a48; }
            .tsa-ld-picker { display: flex; flex-direction: row; align-items: flex-end; gap: 10px; padding: 14px; }
            .tsa-ld-field { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
            .tsa-ld-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #5a7a48; }
            .tsa-ld-ac-wrap {
                position: relative; display: flex; align-items: center;
                background: rgba(0,0,0,0.35); border: 1px solid rgba(61,104,40,0.4);
                border-radius: 4px;
            }
            .tsa-ld-ac-wrap:focus-within { border-color: rgba(108,192,64,0.6); }
            .tsa-ld-ac-flag { width: 20px; height: 13px; object-fit: cover; border-radius: 2px; margin-left: 8px; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.4); }
            .tsa-ld-ac-input { flex: 1; background: transparent; border: none; outline: none; color: #c8e0b4; font-size: 12px; padding: 8px 10px; font-family: inherit; min-width: 0; }
            .tsa-ld-ac-input:disabled { color: #3a5228; cursor: not-allowed; }
            .tsa-ld-ac-input::placeholder { color: #4a6a38; }
            .tsa-ld-ac-dropdown {
                display: none; position: absolute; top: calc(100% + 2px); left: -1px; right: -1px;
                background: #0d1a07; border: 1px solid rgba(61,104,40,0.5); border-radius: 4px;
                max-height: 200px; overflow-y: auto; z-index: 100;
                scrollbar-width: thin; scrollbar-color: #3d6828 transparent;
                box-shadow: 0 6px 20px rgba(0,0,0,0.6);
            }
            .tsa-ld-ac-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; font-size: 11px; color: #c8e0b4; cursor: pointer; border-bottom: 1px solid rgba(61,104,40,0.08); }
            .tsa-ld-ac-item:hover { background: rgba(61,104,40,0.22); color: #e8f5d8; }
            .tsa-ld-flag { width: 20px; height: 13px; object-fit: cover; border-radius: 2px; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.4); }
            .tsa-ld-footer { display: flex; flex-shrink: 0; }
            .tsa-ld-go {
                padding: 8px 28px; background: #3d6828; border: none; border-radius: 4px;
                color: #e8f5d8; font-size: 12px; font-weight: 700;
                text-transform: uppercase; letter-spacing: 0.5px;
                cursor: pointer; transition: background 0.12s;
            }
            .tsa-ld-go:hover:not(:disabled) { background: #4d8830; }
            .tsa-ld-go:disabled { background: #1e3014; color: #3a5228; cursor: not-allowed; }
        `;
        document.head.appendChild(_s);
    }

    let _leagueDialogData = null;

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
                    <button class="tsa-ld-close" id="tsa-ld-close">&times;</button>
                </div>
                <div class="tsa-ld-body" id="tsa-ld-body">
                    <div class="tsa-ld-loading">Loading…</div>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        document.getElementById('tsa-ld-close').addEventListener('click', () => overlay.remove());

        TMLeagueService.fetchLeagueDivisions(s.leagueCountry || 'cs').then(data => {
            if (!data) { document.getElementById('tsa-ld-body').innerHTML = '<div class="tsa-ld-loading" style="color:#ef4444">Failed to load.</div>'; return; }
            _leagueDialogData = data;
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
                    <div class="tsa-ld-ac-wrap">
                        <img class="tsa-ld-ac-flag" id="tsa-ld-country-flag" src="" style="display:none">
                        <input class="tsa-ld-ac-input" id="tsa-ld-country-input" placeholder="Type to search…" autocomplete="off">
                        <div class="tsa-ld-ac-dropdown" id="tsa-ld-country-drop"></div>
                    </div>
                </div>
                <div class="tsa-ld-field">
                    <label class="tsa-ld-label">Division</label>
                    <div class="tsa-ld-ac-wrap">
                        <input class="tsa-ld-ac-input" id="tsa-ld-div-input" placeholder="Select country first…" autocomplete="off" disabled>
                        <div class="tsa-ld-ac-dropdown" id="tsa-ld-div-drop"></div>
                    </div>
                </div>
                <div class="tsa-ld-field" id="tsa-ld-group-field" style="display:none">
                    <label class="tsa-ld-label">Group</label>
                    <div class="tsa-ld-ac-wrap">
                        <input class="tsa-ld-ac-input" id="tsa-ld-group-input" placeholder="Select group…" autocomplete="off" disabled>
                        <div class="tsa-ld-ac-dropdown" id="tsa-ld-group-drop"></div>
                    </div>
                </div>
                <div class="tsa-ld-footer">
                    <button class="tsa-ld-go" id="tsa-ld-go" disabled>Go</button>
                </div>
            </div>`;

        let selCountry = null, selDivision = null, selGroup = null, divisionData = null;
        const countryInput = document.getElementById('tsa-ld-country-input');
        const countryDrop = document.getElementById('tsa-ld-country-drop');
        const countryFlag = document.getElementById('tsa-ld-country-flag');
        const divInput = document.getElementById('tsa-ld-div-input');
        const divDrop = document.getElementById('tsa-ld-div-drop');
        const groupField = document.getElementById('tsa-ld-group-field');
        const groupInput = document.getElementById('tsa-ld-group-input');
        const groupDrop = document.getElementById('tsa-ld-group-drop');
        const goBtn = document.getElementById('tsa-ld-go');

        const updateGo = () => {
            const nGroups = selDivision ? parseInt(selDivision.groups) || 1 : 0;
            goBtn.disabled = !(selCountry && selDivision && (nGroups <= 1 || selGroup));
        };
        const showDrop = (drop, items) => {
            drop.innerHTML = '';
            items.forEach(el => drop.appendChild(el));
            drop.style.display = items.length ? 'block' : 'none';
        };
        const hideDrop = drop => { drop.style.display = 'none'; };
        const makeItem = (label, flagSuffix, onClick) => {
            const el = document.createElement('div');
            el.className = 'tsa-ld-ac-item';
            if (flagSuffix) {
                const img = document.createElement('img');
                img.className = 'tsa-ld-flag';
                img.src = `/pics/flags/gradient/${flagSuffix}.png`;
                img.onerror = () => { img.style.display = 'none'; };
                el.appendChild(img);
                el.appendChild(document.createTextNode(label));
            } else {
                el.textContent = label;
            }
            el.addEventListener('mousedown', e => { e.preventDefault(); onClick(); });
            return el;
        };

        const applyDivisions = divs => {
            divisionData = divs;
            divInput.placeholder = divs.length ? 'Select division…' : 'No divisions found';
            divInput.disabled = !divs.length;
        };
        const selectGroup = g => {
            selGroup = g;
            groupInput.value = `Group ${g}`;
            hideDrop(groupDrop);
            updateGo();
        };
        const selectDivision = d => {
            selDivision = d;
            selGroup = null;
            divInput.value = d.name;
            hideDrop(divDrop);
            const nGroups = parseInt(d.groups) || 1;
            if (nGroups > 1) {
                groupField.style.display = '';
                groupInput.disabled = false;
                groupInput.value = '';
                groupInput.placeholder = `Select group (1–${nGroups})…`;
                hideDrop(groupDrop);
            } else {
                groupField.style.display = 'none';
                selGroup = 1;
            }
            updateGo();
        };
        const selectCountry = (c, prefetchedDivisions) => {
            selCountry = c;
            selDivision = null;
            selGroup = null;
            countryInput.value = c.country;
            countryFlag.src = `/pics/flags/gradient/${c.suffix}.png`;
            countryFlag.style.display = 'inline';
            hideDrop(countryDrop);
            divInput.value = '';
            groupField.style.display = 'none';
            updateGo();
            if (prefetchedDivisions) {
                applyDivisions(prefetchedDivisions);
            } else {
                divInput.placeholder = 'Loading divisions…';
                divInput.disabled = true;
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
            showDrop(countryDrop, items);
        });
        countryInput.addEventListener('input', () => {
            const q = countryInput.value.toLowerCase();
            const items = allCountries
                .filter(c => c.country.toLowerCase().includes(q))
                .map(c => makeItem(c.country, c.suffix, () => selectCountry(c, countryDivs(c))));
            showDrop(countryDrop, items);
        });
        countryInput.addEventListener('blur', () => setTimeout(() => hideDrop(countryDrop), 150));

        divInput.addEventListener('focus', () => {
            if (!divisionData) return;
            showDrop(divDrop, divisionData.map(d => makeItem(d.name, null, () => selectDivision(d))));
        });
        divInput.addEventListener('input', () => {
            if (!divisionData) return;
            const q = divInput.value.toLowerCase();
            showDrop(divDrop, divisionData
                .filter(d => d.name.toLowerCase().includes(q))
                .map(d => makeItem(d.name, null, () => selectDivision(d))));
        });
        divInput.addEventListener('blur', () => setTimeout(() => hideDrop(divDrop), 150));

        groupInput.addEventListener('focus', () => {
            if (!selDivision) return;
            const nGroups = parseInt(selDivision.groups) || 1;
            showDrop(groupDrop, Array.from({ length: nGroups }, (_, i) => i + 1)
                .map(g => makeItem(`Group ${g}`, null, () => selectGroup(g))));
        });
        groupInput.addEventListener('blur', () => setTimeout(() => hideDrop(groupDrop), 150));

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

    export const TmLeaguePicker = { openLeagueDialog, renderLeaguePicker };
