import { TmSectionCard } from '../shared/tm-section-card.js';

'use strict';

const escHtml = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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

/**
 * Mount the Advanced Settings panel (Mentality / Attacking Style / Focus Side).
 *
 * @param {HTMLElement} container
 * @param {object}      initialValues  — { mentality, style, focus } (numeric values)
 * @param {object}      opts           — { reserves, national, miniGameId }
 */
export function mountTacticsSettings(container, initialValues = {}, opts = {}) {
    const { reserves = 0, national = 0, miniGameId = 0 } = opts;

    const refs = TmSectionCard.mount(container, {
        title:      'Advanced Settings',
        icon:       '⚙️',
        titleMode:  'body',
        cardVariant: 'soft',
        bodyClass:  'tmu-stack tmu-stack-density-tight',
    });
    const body = refs.body;

    const grid = document.createElement('div');
    grid.className = 'tmtc-settings-grid';
    body.appendChild(grid);

    function buildSettingCard({ label, labelsMap, saveKey, current }) {
        const valueText = labelsMap[current] || '—';

        const card = document.createElement('div');
        card.className = 'tmtc-setting-card';
        card.innerHTML = `
            <div class="tmtc-setting-label">${escHtml(label)}</div>
            <div class="tmtc-setting-value" data-setting-val="${saveKey}">${escHtml(valueText)}</div>
        `;

        const sel = document.createElement('select');
        sel.style.cssText = 'background:var(--tmu-surface-dark-mid);color:var(--tmu-text-main);border:1px solid var(--tmu-border-embedded);border-radius:var(--tmu-space-sm);padding:var(--tmu-space-xs) var(--tmu-space-sm);font-size:var(--tmu-font-sm);width:100%;margin-top:var(--tmu-space-xs);';
        for (const [val, lbl] of Object.entries(labelsMap)) {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = lbl;
            if (Number(val) === current) opt.selected = true;
            sel.appendChild(opt);
        }

        sel.addEventListener('change', () => {
            const newVal = parseInt(sel.value, 10);
            const valEl = card.querySelector(`[data-setting-val="${saveKey}"]`);
            if (valEl) valEl.textContent = labelsMap[newVal] || String(newVal);
            saveSetting(saveKey, newVal, reserves, national, miniGameId);
        });

        card.appendChild(sel);
        return card;
    }

    grid.appendChild(buildSettingCard({ label: 'Mentality',      labelsMap: MENTALITY_LABELS, saveKey: 'mentality', current: Number(initialValues.mentality) || 4 }));
    grid.appendChild(buildSettingCard({ label: 'Attacking Style', labelsMap: STYLE_LABELS,    saveKey: 'attacking', current: Number(initialValues.style)     || 1 }));
    grid.appendChild(buildSettingCard({ label: 'Focus Side',      labelsMap: FOCUS_LABELS,    saveKey: 'focus',     current: Number(initialValues.focus)      || 1 }));
}
