'use strict';

import { TmTrainingModel } from '../../../models/training.js';
import { TmUI } from '../../shared/tm-ui.js';
import { TmTable } from '../../shared/tm-table.js';
import { TRAINING_CUSTOM } from '../../../constants/training.js';
const MAX_PTS = 4;
const MAX_POOL = 12;

const renderDots = (player, idx) => {
    const pts = player.training.custom[idx];
    const c = TRAINING_CUSTOM[idx].color;
    let h = '';
    for (let i = 0; i < MAX_PTS; i++) {
        h += i < pts
            ? `<span class="tmt-dot tmt-dot-filled" data-team="${idx}" data-seg="${i}" style="background:${c}"></span>`
            : `<span class="tmt-dot tmt-dot-empty" data-team="${idx}" data-seg="${i}"></span>`;
    }
    return h;
};

const renderPoolBar = (player) => {
    const tot = player.training.custom.reduce((a, b) => a + b, 0);
    let s = '';
    player.training.custom.forEach((pts, i) => {
        if (pts > 0) s += `<div class="tmt-pool-seg" style="width:${(pts / MAX_POOL * 100).toFixed(2)}%;background:${TRAINING_CUSTOM[i].color};opacity:0.7"></div>`;
    });
    const rem = ((MAX_POOL - tot) / MAX_POOL * 100).toFixed(2);
    if (rem > 0) s += `<div class="tmt-pool-rem" style="width:${rem}%"></div>`;
    return s;
};

const renderSummary = (player) => {
    const totalAlloc = player.training.custom.reduce((a, b) => a + b, 0);
    const rem = MAX_POOL - totalAlloc;
    return `<div class="tmt-summary">
    <div class="tmt-summary-card">
        <div class="tmt-summary-value"><span id="card-used" class="tmt-summary-success">${totalAlloc}</span></div>
        <div class="tmt-summary-label">Allocated</div>
    </div>
    <div class="tmt-summary-card">
        <div class="tmt-summary-value"><span id="card-free" style="color:${rem > 0 ? 'var(--tmu-warning)' : 'var(--tmu-text-faint)'}">${rem}</span></div>
        <div class="tmt-summary-label">Remaining</div>
    </div>
    <div class="tmt-summary-card">
        <div class="tmt-summary-value"><span class="tmt-summary-strong">${MAX_POOL}</span></div>
        <div class="tmt-summary-label">Total Pool</div>
    </div>
    <div class="tmt-summary-pool">
        <div class="tmt-pool-wrap"><div class="tmt-pool-bar" id="pool-bar">${renderPoolBar(player)}</div></div>
        <div class="tmt-summary-label">Pool Bar</div>
    </div>
</div>`;
};

const renderTable = (player) => TmTable.table({
    cls: ' tmt-tbl',
    items: Array.from({ length: 6 }, (_, i) => ({ teamIdx: i, teamLabel: `T${i + 1}`, skills: TRAINING_CUSTOM[i].label })),
    headers: [
        {
            key: 'colorBar',
            label: '',
            sortable: false,
            cls: 'tmt-clr-bar',
            width: '3px',
            render: (_v, row) => `<span style="display:block;width:100%;height:100%;background:${TRAINING_CUSTOM[row.teamIdx].color}"></span>`,
        },
        {
            key: 'teamLabel',
            label: 'Team',
            sortable: false,
            width: '30px',
            render: (v) => `<span class="tmt-team-label">${v}</span>`,
        },
        {
            key: 'skills',
            label: 'Skills',
            sortable: false,
            render: (v, row) =>
                `<span class="tmt-skill-badge" style="background:${TRAINING_CUSTOM[row.teamIdx].color}1a;color:${TRAINING_CUSTOM[row.teamIdx].color};border-color:${TRAINING_CUSTOM[row.teamIdx].color}66">${v}</span>`,
        },
        {
            key: 'points',
            label: 'Points',
            sortable: false,
            align: 'r',
            render: (_v, row) => `
            <div class="tmt-points-cell">
                ${TmUI.button({
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
                color: 'primary',
                size: 'xs',
                cls: 'tmt-btn tmt-minus',
                id: `tmt-minus-${row.teamIdx}`,
                attrs: { 'data-team': row.teamIdx }
            }).outerHTML}
                <span class="tmt-dots" id="dots-${row.teamIdx}">${renderDots(player, row.teamIdx)}</span>
                <span class="tmt-pts" id="pts-${row.teamIdx}">${player.training.custom[row.teamIdx]}</span>
                ${TmUI.button({
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
                color: 'primary',
                size: 'xs',
                cls: 'tmt-btn tmt-plus',
                id: `tmt-plus-${row.teamIdx}`,
                attrs: { 'data-team': row.teamIdx }
            }).outerHTML}
            </div>`,
        },
    ],
}).outerHTML;

export const mountCustomTraining = (el, player, { readOnly = false, onStateChange = null } = {}) => {
    player.training.custom.forEach((v, i) => {
        player.training.custom[i] = v ?? 0;
    });
    const originalPoints = player.training.custom.slice();
    const totalAlloc = player.training.custom.reduce((a, b) => a + b, 0);

    el.innerHTML = `
        ${renderSummary(player)}
        <div class="tmt-table-shell">${renderTable(player)}</div>
        <div class="tmt-footer">
            <div class="tmt-footer-total">
                <div class="lbl">Total Training</div>
                <div class="val" id="total">${totalAlloc}<span class="dim">/${MAX_POOL}</span></div>
            </div>
            <div class="tmt-footer-acts">
                ${TmUI.button({ id: 'btn-clear', label: 'Clear All', color: 'primary', size: 'sm', cls: 'tmt-act' }).outerHTML}
                ${TmUI.button({ id: 'btn-reset', label: 'Reset', color: 'primary', size: 'sm', cls: 'tmt-act' }).outerHTML}
            </div>
        </div>`;

    if (readOnly) return;

    const q = (sel) => el.querySelector(sel);
    const qa = (sel) => el.querySelectorAll(sel);

    const emitStateChange = () => onStateChange?.(player.training);

    let saveDebounce = null;
    const saveCustom = () => {
        const tot = player.training.custom.reduce((a, b) => a + b, 0);
        if (tot !== MAX_POOL) return;
        clearTimeout(saveDebounce);
        saveDebounce = setTimeout(() => {
            const d = {
                type: 'custom',
                on: 1,
                player_id: player.id,
                'custom[points_spend]': 0,
                'custom[player_id]': player.id,
                'custom[saved]': ''
            };
            player.training.custom.forEach((pts, i) => {
                const p = `custom[team${i + 1}]`;
                d[`${p}[num]`] = i + 1;
                d[`${p}[label]`] = `Team ${i + 1}`;
                d[`${p}[points]`] = pts;
                d[`${p}[skills][]`] = [];
            });
            TmTrainingModel.saveTraining(d);
        }, 300);
    };

    const updateUI = () => {
        const tot = player.training.custom.reduce((a, b) => a + b, 0);
        const rem = MAX_POOL - tot;
        const barEl = q('#pool-bar');
        if (barEl) barEl.innerHTML = renderPoolBar(player);
        const uEl = q('#card-used');
        if (uEl) uEl.textContent = tot;
        const fEl = q('#card-free');
        if (fEl) {
            fEl.textContent = rem;
            fEl.style.color = rem > 0 ? 'var(--tmu-warning)' : 'var(--tmu-text-faint)';
        }
        player.training.custom.forEach((pts, i) => {
            const dEl = q(`#dots-${i}`); if (dEl) dEl.innerHTML = renderDots(player, i);
            const pEl = q(`#pts-${i}`); if (pEl) pEl.textContent = pts;
        });
        const tEl = q('#total');
        if (tEl) tEl.innerHTML = `${tot}<span class="dim">/${MAX_POOL}</span>`;
        qa('.tmt-minus').forEach((b) => {
            b.disabled = player.training.custom[parseInt(b.dataset.team, 10)] <= 0;
        });
        qa('.tmt-plus').forEach((b) => {
            b.disabled = player.training.custom[parseInt(b.dataset.team, 10)] >= MAX_PTS || tot >= MAX_POOL;
        });
        emitStateChange();
    };

    const applyDotSelection = (teamIndex, segmentIndex) => {
        const targetPoints = segmentIndex + 1;
        const totalPoints = player.training.custom.reduce((a, b) => a + b, 0);
        const currentPoints = player.training.custom[teamIndex];
        if (targetPoints === currentPoints) {
            player.training.custom[teamIndex] = segmentIndex;
        }
        else if (targetPoints > currentPoints) {
            const needed = targetPoints - currentPoints;
            const available = MAX_POOL - totalPoints;
            player.training.custom[teamIndex] = needed <= available ?
                targetPoints : currentPoints + available;
        }
        else {
            player.training.custom[teamIndex] = targetPoints
        };
        updateUI();
        saveCustom();
    };

    el.onclick = (event) => {
        const plusButton = event.target.closest('.tmt-plus');
        if (plusButton) {
            const idx = parseInt(plusButton.dataset.team, 10);
            if (player.training.custom[idx] < MAX_PTS && player.training.custom.reduce((a, b) => a + b, 0) < MAX_POOL) {
                player.training.custom[idx] += 1;
                updateUI();
                saveCustom();
            }
            return;
        }
        const minusButton = event.target.closest('.tmt-minus');
        if (minusButton) {
            const idx = parseInt(minusButton.dataset.team, 10);
            if (player.training.custom[idx] > 0) {
                player.training.custom[idx] -= 1;
                updateUI();
                saveCustom();
            }
            return;
        }
        const dot = event.target.closest('.tmt-dot');
        if (dot) {
            applyDotSelection(parseInt(dot.dataset.team, 10), parseInt(dot.dataset.seg, 10));
            return;
        }
        if (event.target.closest('#btn-clear')) {
            player.training.custom.fill(0);
            updateUI();
            saveCustom();
            return;
        }
        if (event.target.closest('#btn-reset')) {
            originalPoints.forEach((v, i) => { player.training.custom[i] = v; });
            updateUI();
            saveCustom();
            return;
        }
    };

    updateUI();
};