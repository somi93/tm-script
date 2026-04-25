import { TmAutocomplete } from '../shared/tm-autocomplete.js';
import { TmTacticsModel } from '../../models/tactics.js';
import { MENTALITY_MAP_LONG, STYLE_MAP, FOCUS_MAP } from '../../constants/match.js';

'use strict';

export function mountTacticsSettings(container, tactics = {}, opts = {}, lineupApi = null) {
    const { reserves = 0, national = 0, miniGameId = 0 } = opts;

    const wrap = document.createElement('div');
    wrap.className = 'tmtc-settings-rows';
    container.appendChild(wrap);

    function buildRow({ label, labelsMap, saveKey, current, onSave }) {
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
                        onSave?.(currentVal);
                        ac.setValue(text);
                        ac.hideDrop();
                        TmTacticsModel.saveSettingValue(saveKey, currentVal, reserves, national, miniGameId);
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

    wrap.appendChild(buildRow({ label: 'Mentality', labelsMap: MENTALITY_MAP_LONG, saveKey: 'mentality', current: tactics.mentality || 4, onSave: v => { tactics.mentality = v; } }));
    wrap.appendChild(buildRow({ label: 'Style',     labelsMap: STYLE_MAP,        saveKey: 'attacking', current: tactics.attacking || 1, onSave: v => { tactics.attacking = v; } }));
    wrap.appendChild(buildRow({ label: 'Focus',     labelsMap: FOCUS_MAP,        saveKey: 'focus',     current: tactics.focus    || 1, onSave: v => { tactics.focus    = v; } }));

    if (lineupApi) {
        const rolesSection = document.createElement('div');
        rolesSection.className = 'tmtc-roles-section';
        wrap.appendChild(rolesSection);
        lineupApi.mountSpecialRoles(rolesSection);
    }
}
