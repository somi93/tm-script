import { TmAutocomplete } from '../shared/tm-autocomplete.js';

'use strict';

const MENTALITY_LABELS = { 1: 'Very Defensive', 2: 'Defensive', 3: 'Slightly Defensive', 4: 'Normal', 5: 'Slightly Attacking', 6: 'Attacking', 7: 'Very Attacking' };
const STYLE_LABELS     = { 1: 'Balanced', 2: 'Direct', 3: 'Wings', 4: 'Short Passing', 5: 'Long Balls', 6: 'Through Balls' };
const FOCUS_LABELS     = { 1: 'Balanced', 2: 'Left', 3: 'Central', 4: 'Right' };

async function saveSetting(saveKey, value, reserves, national, miniGameId) {
    const clubId = String(window.SESSION?.id || window.SESSION?.main_id || window.SESSION?.club_id || '');
    const body = { save: saveKey, value: String(value), reserves, national, club_id: clubId };
    if (saveKey !== 'focus') body.miniGameId = miniGameId;
    return fetch('/ajax/tactics_post.ajax.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body:    new URLSearchParams(body).toString(),
    });
}

export function mountTacticsSettings(container, initialValues = {}, opts = {}, lineupApi = null) {
    const { reserves = 0, national = 0, miniGameId = 0 } = opts;

    const wrap = document.createElement('div');
    wrap.className = 'tmtc-settings-rows';
    container.appendChild(wrap);

    function buildRow({ label, labelsMap, saveKey, current }) {
        const row = document.createElement('div');
        row.className = 'tmu-field tmtc-setting-row';

        const lbl = document.createElement('span');
        lbl.className = 'tmu-field-label';
        lbl.textContent = label;
        row.appendChild(lbl);

        let currentVal = current;

        const ac = TmAutocomplete.autocomplete({
            value: labelsMap[currentVal] ?? '',
            placeholder: 'Select…',
            tone: 'overlay',
            density: 'compact',
            size: 'full',
            grow: true,
            autocomplete: 'off',
        });

        const makeItems = (query = '') => {
            const q = query.trim().toLowerCase();
            return Object.entries(labelsMap)
                .filter(([, text]) => !q || text.toLowerCase().includes(q))
                .map(([val, text]) => TmAutocomplete.autocompleteItem({
                    label: text,
                    active: Number(val) === currentVal,
                    onSelect: () => {
                        currentVal = Number(val);
                        ac.setValue(text);
                        ac.hideDrop();
                        saveSetting(saveKey, currentVal, reserves, national, miniGameId);
                    },
                }));
        };

        ac.inputEl.addEventListener('focus', () => {
            ac.setItems(makeItems(''));
        });
        ac.inputEl.addEventListener('input', () => {
            ac.setItems(makeItems(ac.inputEl.value));
        });
        ac.inputEl.addEventListener('blur', () => {
            // Delay so mousedown on item fires first
            setTimeout(() => {
                ac.hideDrop();
                // Restore label if user typed something invalid
                ac.setValue(labelsMap[currentVal] ?? '');
            }, 200);
        });

        row.appendChild(ac);
        return row;
    }

    wrap.appendChild(buildRow({ label: 'Mentality',   labelsMap: MENTALITY_LABELS, saveKey: 'mentality', current: Number(initialValues.mentality) || 4 }));
    wrap.appendChild(buildRow({ label: 'Style',       labelsMap: STYLE_LABELS,    saveKey: 'attacking', current: Number(initialValues.style)     || 1 }));
    wrap.appendChild(buildRow({ label: 'Focus',       labelsMap: FOCUS_LABELS,    saveKey: 'focus',     current: Number(initialValues.focus)      || 1 }));

    if (lineupApi?.mountSpecialRoles) {
        const rolesSection = document.createElement('div');
        rolesSection.className = 'tmtc-roles-section';
        wrap.appendChild(rolesSection);
        lineupApi.mountSpecialRoles(rolesSection);
    }
}
