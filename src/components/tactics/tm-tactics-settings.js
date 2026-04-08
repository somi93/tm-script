import { TmInput } from '../shared/tm-input.js';

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

export function mountTacticsSettings(container, initialValues = {}, opts = {}) {
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

        const sel = document.createElement('select');
        sel.className = 'tmu-input tmu-input-tone-overlay tmu-input-density-compact tmu-input-full';
        for (const [val, text] of Object.entries(labelsMap)) {
            const opt = document.createElement('option');
            opt.value  = val;
            opt.textContent = text;
            if (Number(val) === current) opt.selected = true;
            sel.appendChild(opt);
        }
        sel.addEventListener('change', () => {
            saveSetting(saveKey, parseInt(sel.value, 10), reserves, national, miniGameId);
        });
        row.appendChild(sel);
        return row;
    }

    wrap.appendChild(buildRow({ label: 'Mentality',   labelsMap: MENTALITY_LABELS, saveKey: 'mentality', current: Number(initialValues.mentality) || 4 }));
    wrap.appendChild(buildRow({ label: 'Style',       labelsMap: STYLE_LABELS,    saveKey: 'attacking', current: Number(initialValues.style)     || 1 }));
    wrap.appendChild(buildRow({ label: 'Focus',       labelsMap: FOCUS_LABELS,    saveKey: 'focus',     current: Number(initialValues.focus)      || 1 }));
}
