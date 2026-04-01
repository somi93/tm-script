import { TmTrainingService } from '../../services/training.js';
import { TmTable, injectTmTableCss } from '../shared/tm-table.js';
import { TmUI } from '../shared/tm-ui.js';
import { injectTmUiCss } from '../shared/tm-ui.js';
import { injectTmButtonCss } from '../shared/tm-button.js';
import { injectTmTabsCss } from '../shared/tm-tabs.js';
import { ensureTmTheme } from '../shared/tm-theme.js';
import { TmSummaryStrip } from '../shared/tm-summary-strip.js';

'use strict';

export const TmTrainingMod = (() => {
    const TRAINING_TYPES = { '1': 'Technical', '2': 'Fitness', '3': 'Tactical', '4': 'Finishing', '5': 'Defending', '6': 'Wings' };
    const MAX_PTS = 4;
    const SKILL_NAMES = { strength: 'Strength', stamina: 'Stamina', pace: 'Pace', marking: 'Marking', tackling: 'Tackling', workrate: 'Workrate', positioning: 'Positioning', passing: 'Passing', crossing: 'Crossing', technique: 'Technique', heading: 'Heading', finishing: 'Finishing', longshots: 'Longshots', set_pieces: 'Set Pieces' };
    const COLORS = [
        'var(--tmu-success)',
        'var(--tmu-info-strong)',
        'var(--tmu-warning)',
        'var(--tmu-warning-soft)',
        'var(--tmu-purple)',
        'var(--tmu-danger)',
    ];
    const htmlOf = (node) => node ? node.outerHTML : '';
    const buttonHtml = (opts) => TmUI.button(opts).outerHTML;
    const tabsHtml = (customOn) => htmlOf(TmUI.tabs({
        items: [
            { key: 'std', label: 'Standard' },
            { key: 'cus', label: 'Custom', cls: 'tmt-tab-pro' },
        ],
        active: customOn ? 'cus' : 'std',
        color: 'primary',
        cls: 'tmt-tabs',
        itemCls: 'tmt-tab',
    }));

    const TMT_CSS = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:host{display:block;all:initial;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--tmu-text-main);line-height:1.4}
${TmSummaryStrip.cssText}
.tmt-wrap{background:transparent;border-radius:0;border:none;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--tmu-text-main);font-size:13px}
.tmt-state{padding:20px 14px;text-align:center}
.tmt-state-icon{font-size:22px;margin-bottom:6px}
.tmt-state-title{color:var(--tmu-text-strong);font-weight:700;font-size:14px;margin-bottom:4px}
.tmt-state-copy{color:var(--tmu-text-faint);font-size:11px}
.tmt-tabs{gap:6px;padding:10px 14px 6px;flex-wrap:wrap;background:transparent;border:none;overflow:visible}.tmt-tab{padding:4px 12px;font-size:11px;border:1px solid var(--tmu-border-input);border-radius:4px}.tmt-tab:hover:not(:disabled){border-color:var(--tmu-border-embedded)}.tmt-tab.active{border-bottom-color:var(--tmu-border-embedded)}.tmt-tab-pro::after{content:'PRO';display:inline-block;background:var(--tmu-success-fill);color:var(--tmu-success);padding:1px 5px;border-radius:3px;font-size:9px;font-weight:800;letter-spacing:.5px;margin-left:4px;vertical-align:middle}
.tmt-body{padding:10px 14px 16px;font-size:13px}
.tmt-sbar{display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--tmu-surface-tab-active);border:1px solid var(--tmu-border-soft);border-radius:6px;margin-bottom:10px;flex-wrap:wrap}
.tmt-sbar-label{color:var(--tmu-text-faint);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px}
.tmt-sbar select{background:var(--tmu-surface-tab-hover);color:var(--tmu-text-main);border:1px solid var(--tmu-border-soft);padding:4px 8px;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600;font-family:inherit}
.tmt-sbar select:focus{border-color:var(--tmu-success);outline:none}
.tmt-summary{margin-bottom:12px}
.tmt-pool-bar{height:6px;background:var(--tmu-surface-overlay-soft);border-radius:3px;overflow:hidden;display:flex;gap:1px;margin-top:8px}
.tmt-pool-seg{height:100%;border-radius:3px;transition:width 0.3s ease;min-width:0}.tmt-pool-rem{flex:1;height:100%}
.tmt-tbl{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px}
.tmt-tbl th{padding:6px;font-size:10px;font-weight:700;color:var(--tmu-text-faint);text-transform:uppercase;letter-spacing:0.4px;border-bottom:1px solid var(--tmu-border-soft);text-align:left;white-space:nowrap}.tmt-tbl th.c{text-align:center}
.tmt-tbl td{padding:5px 6px;border-bottom:1px solid var(--tmu-border-faint);color:var(--tmu-text-main);font-variant-numeric:tabular-nums;vertical-align:middle}.tmt-tbl td.c{text-align:center}
.tmt-tbl tr:hover{background:var(--tmu-border-contrast)}
.tmt-team-label{font-weight:700;color:var(--tmu-text-strong);white-space:nowrap}
.tmt-skills-copy{color:var(--tmu-text-muted);font-size:11px}
.tmt-clr-bar{width:3px;padding:0;border-radius:2px}
.tmt-dots{display:inline-flex;gap:3px;align-items:center}
.tmt-dot{width:18px;height:18px;border-radius:50%;transition:all 0.15s;cursor:pointer;display:inline-block}
.tmt-dot-empty{background:var(--tmu-border-contrast);border:1px solid var(--tmu-border-input)}.tmt-dot-empty:hover{background:var(--tmu-surface-overlay-soft);border-color:var(--tmu-border-embedded)}
.tmt-dot-filled{box-shadow:0 0 6px var(--tmu-shadow-ring),inset 0 1px 0 var(--tmu-border-contrast);border:1px solid var(--tmu-border-soft-alpha-mid)}
.tmt-btn{width:24px;height:24px;min-width:24px;padding:0;line-height:1;font-size:14px}.tmt-btn:active:not(:disabled){background:var(--tmu-success-fill-strong)}.tmt-btn:disabled{opacity:.2}
.tmt-pts{font-size:13px;font-weight:800;color:var(--tmu-text-strong);min-width:14px;text-align:center}
.tmt-footer{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--tmu-surface-tab-active);border:1px solid var(--tmu-border-soft);border-radius:8px;gap:10px;flex-wrap:wrap}
.tmt-footer-total .lbl{color:var(--tmu-text-faint);font-size:9px;text-transform:uppercase;letter-spacing:0.5px;font-weight:700}
.tmt-footer-total .val{font-size:18px;font-weight:900;color:var(--tmu-text-strong);letter-spacing:-0.5px}.tmt-footer-total .dim{color:var(--tmu-text-faint);font-weight:600}
.tmt-footer-acts{display:flex;gap:6px}
.tmt-act{text-transform:uppercase;letter-spacing:.4px}.tmt-act.dng:hover{border-color:var(--tmu-border-danger);color:var(--tmu-danger);background:var(--tmu-danger-fill)}
.tmt-summary-success{color:var(--tmu-success)}
.tmt-summary-strong{color:var(--tmu-text-strong)}
.tmt-pool-wrap{min-width:160px;display:flex;align-items:flex-end}
.tmt-pool-wrap .tmt-pool-bar{width:100%}
.tmt-custom-off .tmt-cards{display:none}.tmt-custom-off .tmt-tbl{display:none}.tmt-custom-off .tmt-footer{display:none}
.tmt-wrap:not(.tmt-custom-off) .tmt-sbar{display:none}
.tmt-readonly .tmt-btn{opacity:0.25;pointer-events:none}.tmt-readonly .tmt-dot{pointer-events:none;cursor:default}
.tmt-readonly .tmt-act{opacity:0.25;pointer-events:none}.tmt-readonly #type-select{pointer-events:none;opacity:0.6}
.tmt-readonly .tmt-tab{pointer-events:none}
.tmt-readonly-badge{display:none}.tmt-readonly .tmt-readonly-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;color:var(--tmu-warning);background:var(--tmu-warning-fill);border:1px solid var(--tmu-border-warning);border-radius:4px;padding:2px 8px;margin-left:8px;vertical-align:middle}`;

    const attachSharedShadowStyles = (root) => {
        ensureTmTheme(root);
        injectTmUiCss(root);
        injectTmButtonCss(root);
        injectTmTableCss(root);
        injectTmTabsCss(root);
        TmSummaryStrip.injectCSS(root);
    };

    let _container = null, _data = null, _playerId = null, _readOnly = false;
    let teamPoints = [0, 0, 0, 0, 0, 0], originalPoints = [0, 0, 0, 0, 0, 0], maxPool = 0, customOn = false, currentType = '3', shadow = null, customDataRef = null;
    const q = (sel) => shadow ? shadow.querySelector(sel) : null;
    const qa = (sel) => shadow ? shadow.querySelectorAll(sel) : [];

    const renderPoolBar = () => { const tot = teamPoints.reduce((a, b) => a + b, 0); let s = ''; for (let i = 0; i < 6; i++) { if (teamPoints[i] > 0) { s += `<div class="tmt-pool-seg" style="width:${(teamPoints[i] / maxPool * 100).toFixed(2)}%;background:${COLORS[i]};opacity:0.7"></div>`; } } const rem = ((maxPool - tot) / maxPool * 100).toFixed(2); if (rem > 0) s += `<div class="tmt-pool-rem" style="width:${rem}%"></div>`; return s; };
    const renderDots = (idx) => { const pts = teamPoints[idx]; const c = COLORS[idx]; let h = ''; for (let i = 0; i < MAX_PTS; i++) { h += i < pts ? `<span class="tmt-dot tmt-dot-filled" data-team="${idx}" data-seg="${i}" style="background:${c}"></span>` : `<span class="tmt-dot tmt-dot-empty" data-team="${idx}" data-seg="${i}"></span>`; } return h; };

    let saveDebounce = null;
    const saveCustomTraining = () => { const tot = teamPoints.reduce((a, b) => a + b, 0); if (tot !== maxPool || !customDataRef) return; clearTimeout(saveDebounce); saveDebounce = setTimeout(() => { const d = { type: 'custom', on: 1, player_id: _playerId, 'custom[points_spend]': 0, 'custom[player_id]': _playerId, 'custom[saved]': '' }; for (let i = 0; i < 6; i++) { const t = customDataRef['team' + (i + 1)]; const p = `custom[team${i + 1}]`; d[`${p}[num]`] = i + 1; d[`${p}[label]`] = t.label || `Team ${i + 1}`; d[`${p}[points]`] = teamPoints[i]; d[`${p}[skills][]`] = t.skills; } TmTrainingService.saveTraining(d); }, 300); };
    const saveTrainingType = (type) => { TmTrainingService.saveTrainingType(_playerId, type); };

    const updateUI = () => {
        const tot = teamPoints.reduce((a, b) => a + b, 0); const rem = maxPool - tot;
        const barEl = q('#pool-bar'); if (barEl) barEl.innerHTML = renderPoolBar();
        const uEl = q('#card-used'); if (uEl) uEl.textContent = tot;
        const fEl = q('#card-free'); if (fEl) { fEl.textContent = rem; fEl.style.color = rem > 0 ? 'var(--tmu-warning)' : 'var(--tmu-text-faint)'; }
        for (let i = 0; i < 6; i++) { const dEl = q(`#dots-${i}`); if (dEl) dEl.innerHTML = renderDots(i); const pEl = q(`#pts-${i}`); if (pEl) pEl.textContent = teamPoints[i]; }
        const tEl = q('#total'); if (tEl) tEl.innerHTML = `${tot}<span class="dim">/${maxPool}</span>`;
        qa('.tmt-minus').forEach(b => { b.disabled = teamPoints[parseInt(b.dataset.team)] <= 0; });
        qa('.tmt-plus').forEach(b => { b.disabled = teamPoints[parseInt(b.dataset.team)] >= MAX_PTS || rem <= 0; });
    };

    const applyDotSelection = (teamIndex, segmentIndex) => {
        const targetPoints = segmentIndex + 1;
        const totalPoints = teamPoints.reduce((a, b) => a + b, 0);
        const currentPoints = teamPoints[teamIndex];
        if (targetPoints === currentPoints) teamPoints[teamIndex] = segmentIndex;
        else if (targetPoints > currentPoints) {
            const needed = targetPoints - currentPoints;
            const available = maxPool - totalPoints;
            teamPoints[teamIndex] = needed <= available ? targetPoints : currentPoints + available;
        } else teamPoints[teamIndex] = targetPoints;
        updateUI();
        saveCustomTraining();
    };

    const handleShadowClick = (event) => {
        const plusButton = event.target.closest('.tmt-plus');
        if (plusButton) {
            const teamIndex = parseInt(plusButton.dataset.team, 10);
            if (teamPoints[teamIndex] < MAX_PTS && teamPoints.reduce((a, b) => a + b, 0) < maxPool) {
                teamPoints[teamIndex] += 1;
                updateUI();
                saveCustomTraining();
            }
            return;
        }

        const minusButton = event.target.closest('.tmt-minus');
        if (minusButton) {
            const teamIndex = parseInt(minusButton.dataset.team, 10);
            if (teamPoints[teamIndex] > 0) {
                teamPoints[teamIndex] -= 1;
                updateUI();
                saveCustomTraining();
            }
            return;
        }

        const dot = event.target.closest('.tmt-dot');
        if (dot) {
            applyDotSelection(parseInt(dot.dataset.team, 10), parseInt(dot.dataset.seg, 10));
            return;
        }

        if (event.target.closest('#btn-clear')) {
            teamPoints.fill(0);
            updateUI();
            saveCustomTraining();
            return;
        }

        if (event.target.closest('#btn-reset')) {
            teamPoints = [...originalPoints];
            updateUI();
            saveCustomTraining();
            return;
        }

        const standardTab = event.target.closest('.tmt-tab[data-tab="std"]');
        if (standardTab) {
            if (customOn) {
                customOn = false;
                q('.tmt-tab[data-tab="std"]')?.classList.add('active');
                q('.tmt-tab[data-tab="cus"]')?.classList.remove('active');
                q('.tmt-wrap')?.classList.add('tmt-custom-off');
                saveTrainingType(currentType);
            }
            return;
        }

        const customTab = event.target.closest('.tmt-tab[data-tab="cus"]');
        if (customTab && !customOn) {
            customOn = true;
            q('.tmt-tab[data-tab="cus"]')?.classList.add('active');
            q('.tmt-tab[data-tab="std"]')?.classList.remove('active');
            q('.tmt-wrap')?.classList.remove('tmt-custom-off');
            saveCustomTraining();
        }
    };

    const handleShadowChange = (event) => {
        const typeSelect = event.target.closest('#type-select');
        if (!typeSelect) return;
        const value = typeSelect.value;
        if (value !== currentType) {
            currentType = value;
            saveTrainingType(value);
        }
    };

    const render = (container, data, { playerId, readOnly = false } = {}) => {
        _container = container; _data = data; _playerId = playerId; _readOnly = readOnly;
        const custom = data?.custom;

        if (!custom || custom.gk) {
            container.innerHTML = '';
            const host = document.createElement('div');
            container.appendChild(host);
            shadow = host.attachShadow({ mode: 'open' });
            shadow.innerHTML = `<style>${TMT_CSS}</style><div class="tmt-wrap"><div class="tmt-body tmt-state"><div class="tmt-state-icon">🧤</div><div class="tmt-state-title">Goalkeeper Training</div><div class="tmt-state-copy">Training is automatically set and cannot be changed for goalkeepers.</div></div></div>`;
            attachSharedShadowStyles(shadow);
            return;
        }

        const customData = custom.custom;
        customOn = !!custom.custom_on;
        currentType = String(custom.team || '3');
        customDataRef = customData;

        for (let i = 0; i < 6; i++) { const t = customData['team' + (i + 1)]; teamPoints[i] = parseInt(t.points) || 0; originalPoints[i] = teamPoints[i]; }
        const totalAlloc = teamPoints.reduce((a, b) => a + b, 0);
        maxPool = totalAlloc + (parseInt(customData.points_spend) || 0); if (maxPool < 1) maxPool = 10;
        const rem = maxPool - totalAlloc;

        container.innerHTML = ''; const host = document.createElement('div'); container.appendChild(host);
        shadow = host.attachShadow({ mode: 'open' });

        let typeOpts = customOn ? '<option value="" selected>— Select —</option>' : '';
        Object.entries(TRAINING_TYPES).forEach(([id, name]) => { typeOpts += `<option value="${id}" ${!customOn && id === currentType ? 'selected' : ''}>${name}</option>`; });

        const teamsTable = TmTable.table({
            cls: ' tmt-tbl',
            items: customData ? Array.from({ length: 6 }, (_, i) => {
                const team = customData['team' + (i + 1)];
                return {
                    teamIdx: i,
                    teamLabel: `T${i + 1}`,
                    skills: team.skills.map(s => SKILL_NAMES[s] || s).join(', '),
                };
            }) : [],
            headers: [
                {
                    key: 'colorBar',
                    label: '',
                    sortable: false,
                    cls: 'tmt-clr-bar',
                    width: '3px',
                    render: (_value, row) => `<span style="display:block;width:100%;height:100%;background:${COLORS[row.teamIdx]}"></span>`,
                },
                {
                    key: 'teamLabel',
                    label: 'Team',
                    sortable: false,
                    width: '30px',
                    render: (value) => `<span class="tmt-team-label">${value}</span>`,
                },
                {
                    key: 'skills',
                    label: 'Skills',
                    sortable: false,
                    render: (value) => `<span class="tmt-skills-copy">${value}</span>`,
                },
                {
                    key: 'points',
                    label: 'Points',
                    sortable: false,
                    align: 'c',
                    render: (_value, row) => `<div style="display:flex;align-items:center;gap:6px;justify-content:center">${buttonHtml({ label: '−', color: 'secondary', size: 'xs', cls: 'tmt-btn tmt-minus', id: `tmt-minus-${row.teamIdx}`, attrs: { 'data-team': row.teamIdx } })}<span class="tmt-dots" id="dots-${row.teamIdx}">${renderDots(row.teamIdx)}</span><span class="tmt-pts" id="pts-${row.teamIdx}">${teamPoints[row.teamIdx]}</span>${buttonHtml({ label: '+', color: 'secondary', size: 'xs', cls: 'tmt-btn tmt-plus', id: `tmt-plus-${row.teamIdx}`, attrs: { 'data-team': row.teamIdx } })}</div>`,
                },
            ],
        });

        shadow.innerHTML = `<style>${TMT_CSS}</style>
<div class="tmt-wrap ${customOn ? '' : 'tmt-custom-off'} ${_readOnly ? 'tmt-readonly' : ''}">
    ${tabsHtml(customOn).replace('</div>', '<span class="tmt-readonly-badge">👁 View only</span></div>')}
<div class="tmt-body">
<div class="tmt-sbar" id="type-bar"><span class="tmt-sbar-label">Training Type</span><select id="type-select">${typeOpts}</select></div>
${TmSummaryStrip.render([
            { label: 'Allocated', valueHtml: `<span id="card-used" class="tmt-summary-success">${totalAlloc}</span>` },
            { label: 'Remaining', valueHtml: `<span id="card-free" style="color:${rem > 0 ? 'var(--tmu-warning)' : 'var(--tmu-text-faint)'}">${rem}</span>` },
            { label: 'Total Pool', valueHtml: `<span class="tmt-summary-strong">${maxPool}</span>` },
            { label: 'Pool Bar', valueHtml: `<div class="tmt-pool-wrap"><div class="tmt-pool-bar" id="pool-bar">${renderPoolBar()}</div></div>`, itemCls: 'tmu-summary-item-center', minWidth: '180px' },
        ], { cls: 'tmt-summary', variant: 'boxed', valueFirst: true })}
${teamsTable.outerHTML}
    <div class="tmt-footer"><div class="tmt-footer-total"><div class="lbl">Total Training</div><div class="val" id="total">${totalAlloc}<span class="dim">/${maxPool}</span></div></div><div class="tmt-footer-acts">${buttonHtml({ id: 'btn-clear', label: 'Clear All', color: 'danger', size: 'sm', cls: 'tmt-act dng' })}${buttonHtml({ id: 'btn-reset', label: 'Reset', color: 'secondary', size: 'sm', cls: 'tmt-act' })}</div></div>
</div></div>`;
        attachSharedShadowStyles(shadow);
        if (!_readOnly) {
            shadow.onclick = handleShadowClick;
            shadow.onchange = handleShadowChange;
        }
        updateUI();
    };

    const reRender = () => { if (_container && _data) render(_container, _data, { playerId: _playerId, readOnly: _readOnly }); };

    return { render, reRender };
})();
