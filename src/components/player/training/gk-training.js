'use strict';

import { TMT_CSS, attachSharedShadowStyles } from './training-styles.js';

export const mountGkTraining = (container) => {
    container.innerHTML = '';
    const host = document.createElement('div');
    container.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>${TMT_CSS}</style><div class="tmt-wrap">
    <div class="tmt-body tmt-state">
        <div class="tmt-state-icon">🧤</div>
        <div class="tmt-state-title">Goalkeeper Training</div>
        <div class="tmt-state-copy">Training is automatically set and cannot be changed for goalkeepers.</div>
    </div>
</div>`;
    attachSharedShadowStyles(shadow);
};
