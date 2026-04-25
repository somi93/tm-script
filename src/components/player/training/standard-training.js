'use strict';

import { TmTrainingModel } from '../../../models/training.js';
import { TRAINING_NAMES } from '../../../constants/training.js';

export const mountStandardTraining = (el, player, { readOnly = false, onStateChange = null } = {}) => {
    let currentType = String(player.training.standard || '3');

    let opts = '';
    Object.entries(TRAINING_NAMES).forEach(([id, name]) => {
        opts += `<option value="${id}" ${id === currentType ? 'selected' : ''}>${name}</option>`;
    });

    el.innerHTML = `<div class="tmt-sbar">
        <span class="tmt-sbar-label">Training Type</span>
        <select id="type-select">${opts}</select>
    </div>`;

    if (readOnly) return;

    el.onchange = (event) => {
        const sel = event.target.closest('#type-select');
        if (!sel) return;
        const value = sel.value;
        if (value !== currentType) {
            currentType = value;
            player.training.standard = value;
            TmTrainingModel.saveTrainingType(player.id, value);
            onStateChange?.(player.training);
        }
    };
};
