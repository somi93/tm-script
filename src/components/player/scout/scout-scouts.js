'use strict';

import { TmPlayerService } from '../../../services/player.js';
import { TmPlayerDataTable } from '../skills/tm-player-data-table.js';
import { TmUI } from '../../shared/tm-ui.js';
import { TmUtils } from '../../../lib/tm-utils.js';

const buildTable = (scouts) => {
    if (!scouts || !Object.keys(scouts).length) return TmUI.empty('No scouts hired', true);
    const skills = ['seniors', 'youths', 'physical', 'tactical', 'technical', 'development', 'psychology'];
    const bodyRows = [];
    for (const s of Object.values(scouts)) {
        const skillCells = skills.map(sk => {
            const v = parseInt(s[sk]) || 0;
            return { content: v, cls: 'c font-semibold', attrs: { style: `color:${TmUtils.skillColor(v)}` } };
        });
        const bc = s.away ? 'tmsc-send-btn tmsc-away' : 'tmsc-send-btn';
        const bl = s.away ? (s.returns || 'Away') : 'Send';
        bodyRows.push({
            cells: [
                { content: `${s.name} ${s.surname}`, cls: 'font-semibold', attrs: { style: 'color:var(--tmu-text-strong);white-space:nowrap' } },
                ...skillCells,
                { content: `<tm-button data-variant="primary" data-size="xs" data-cls="${bc}" data-scout-id="${s.id}" ${s.away ? `title="${s.returns || ''}"` : ''}>${bl}</tm-button>`, cls: 'c' },
            ],
        });
    }
    return TmPlayerDataTable.table({
        tableClass: 'tmsc-tbl',
        headerRows: [{
            cells: [
                { content: 'Name' },
                { content: 'Sen', cls: 'c' },
                { content: 'Yth', cls: 'c' },
                { content: 'Phy', cls: 'c' },
                { content: 'Tac', cls: 'c' },
                { content: 'Tec', cls: 'c' },
                { content: 'Dev', cls: 'c' },
                { content: 'Psy', cls: 'c' },
                { content: '', cls: 'c' },
            ],
        }],
        bodyRows,
    });
};

export const mountScoutScouts = (el, scouts, player, { onReRender = null } = {}) => {
    const wrapper = document.createElement('div');
    el.innerHTML = '';
    el.appendChild(wrapper);
    wrapper.appendChild(buildTable(scouts));
    TmUI?.render(wrapper);

    wrapper.addEventListener('click', (event) => {
        const btn = event.target.closest('.tmsc-send-btn');
        if (!btn || !wrapper.contains(btn) || btn.classList.contains('tmsc-away') || btn.disabled) return;

        const scoutId = btn.dataset.scoutId;
        btn.disabled = true;
        btn.textContent = '...';
        TmPlayerService.fetchPlayerInfo(player?.id, 'scout', { scout_id: scoutId }).then(d => {
            if (!d) {
                btn.textContent = 'Error';
                btn.style.color = 'var(--tmu-danger)';
                setTimeout(() => { btn.textContent = 'Send'; btn.disabled = false; btn.style.color = ''; }, 2000);
                return;
            }
            if ((d.scouts || d.reports) && onReRender) { onReRender(d); return; }
            btn.textContent = 'Sent';
            btn.style.background = 'var(--tmu-surface-tab-hover)';
            btn.style.color = 'var(--tmu-success)';
        });
    });
};
