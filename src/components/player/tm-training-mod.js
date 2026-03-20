import { TmTrainingService } from '../../services/training.js';
import { TmUI } from '../shared/tm-ui.js';

'use strict';

export const TmTrainingMod = (() => {
    const TRAINING_TYPES = { '1': 'Technical', '2': 'Fitness', '3': 'Tactical', '4': 'Finishing', '5': 'Defending', '6': 'Wings' };
    const MAX_PTS = 4;
    const SKILL_NAMES = { strength: 'Strength', stamina: 'Stamina', pace: 'Pace', marking: 'Marking', tackling: 'Tackling', workrate: 'Workrate', positioning: 'Positioning', passing: 'Passing', crossing: 'Crossing', technique: 'Technique', heading: 'Heading', finishing: 'Finishing', longshots: 'Longshots', set_pieces: 'Set Pieces' };
    const COLORS = ['#6cc040', '#5b9bff', '#fbbf24', '#f97316', '#a78bfa', '#f87171'];
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
:host{display:block;all:initial;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#c8e0b4;line-height:1.4}
.rounded-md{border-radius:6px}.text-xs{font-size:10px}.text-sm{font-size:12px}.px-2{padding-left:8px;padding-right:8px}.px-3{padding-left:12px;padding-right:12px}.py-0{padding-top:0;padding-bottom:0}.py-1{padding-top:4px;padding-bottom:4px}
.tmu-btn{border:none;cursor:pointer;font-family:inherit;font-weight:700;letter-spacing:.3px;transition:background .15s,opacity .15s}.tmu-btn-variant-button{display:inline-flex;align-items:center;justify-content:center;gap:6px}.tmu-btn-variant-icon{display:inline-flex;align-items:center;justify-content:center;background:none!important;border:none!important;padding:0!important;min-width:0}.tmu-btn-variant-icon:hover:not(:disabled){background:none!important}.tmu-btn-block{width:100%}.tmu-btn:disabled{opacity:.45;cursor:not-allowed}.tmu-btn-primary{background:#3d6828;color:#e8f5d8}.tmu-btn-primary:hover:not(:disabled){background:#4e8234}.tmu-btn-secondary{background:rgba(42,74,28,.4);color:#90b878;border:1px solid #3d6828}.tmu-btn-secondary:hover:not(:disabled){background:rgba(42,74,28,.7);color:#e8f5d8}.tmu-btn-danger{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3)}.tmu-btn-danger:hover:not(:disabled){background:rgba(239,68,68,.25)}.tmu-btn-lime{background:rgba(108,192,64,.12);border:1px solid rgba(108,192,64,.3);color:#80e048;display:flex;align-items:center;justify-content:center;gap:6px}.tmu-btn-lime:hover:not(:disabled){background:rgba(108,192,64,.22)}
.tmu-tabs{display:flex;align-items:stretch;background:var(--tmu-tabs-bg,var(--tmu-tabs-primary-bg,#274a18));border:1px solid var(--tmu-tabs-border,var(--tmu-tabs-primary-border,#3d6828));overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;scrollbar-color:var(--tmu-tabs-scrollbar,var(--tmu-tabs-primary-border,#3d6828)) transparent}.tmu-tabs-color-primary{--tmu-tabs-bg:var(--tmu-tabs-primary-bg,#274a18);--tmu-tabs-border:var(--tmu-tabs-primary-border,#3d6828);--tmu-tabs-text:var(--tmu-tabs-primary-text,#90b878);--tmu-tabs-hover-text:var(--tmu-tabs-primary-hover-text,#c8e0b4);--tmu-tabs-hover-bg:var(--tmu-tabs-primary-hover-bg,#305820);--tmu-tabs-active-text:var(--tmu-tabs-primary-active-text,#e8f5d8);--tmu-tabs-active-bg:var(--tmu-tabs-primary-active-bg,#305820);--tmu-tabs-active-border:var(--tmu-tabs-primary-active-border,#6cc040)}.tmu-tabs-color-secondary{--tmu-tabs-bg:var(--tmu-tabs-secondary-bg,#1f2e16);--tmu-tabs-border:var(--tmu-tabs-secondary-border,#455f34);--tmu-tabs-text:var(--tmu-tabs-secondary-text,#9eb88a);--tmu-tabs-hover-text:var(--tmu-tabs-secondary-hover-text,#d2e4c6);--tmu-tabs-hover-bg:var(--tmu-tabs-secondary-hover-bg,#314726);--tmu-tabs-active-text:var(--tmu-tabs-secondary-active-text,#f0f7ea);--tmu-tabs-active-bg:var(--tmu-tabs-secondary-active-bg,#314726);--tmu-tabs-active-border:var(--tmu-tabs-secondary-active-border,#8fb96c)}.tmu-tabs-stretch .tmu-tab{flex:1 1 0;min-width:0}.tmu-tab{padding:8px 12px;text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--tmu-tabs-text,var(--tmu-tabs-primary-text,#90b878));cursor:pointer;border:none;border-bottom:2px solid transparent;transition:all .15s;background:transparent;font-family:inherit;-webkit-appearance:none;appearance:none;display:flex;align-items:center;justify-content:center;gap:6px;flex:0 0 auto;min-width:max-content}.tmu-tab:hover:not(:disabled){color:var(--tmu-tabs-hover-text,var(--tmu-tabs-primary-hover-text,#c8e0b4));background:var(--tmu-tabs-hover-bg,var(--tmu-tabs-primary-hover-bg,#305820))}.tmu-tab.active{color:var(--tmu-tabs-active-text,var(--tmu-tabs-primary-active-text,#e8f5d8));border-bottom-color:var(--tmu-tabs-active-border,var(--tmu-tabs-primary-active-border,#6cc040));background:var(--tmu-tabs-active-bg,var(--tmu-tabs-primary-active-bg,#305820))}.tmu-tab:disabled{opacity:.4;cursor:not-allowed}.tmu-tab-icon{font-size:14px;line-height:1;flex-shrink:0}
.tmt-wrap{background:transparent;border-radius:0;border:none;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#c8e0b4;font-size:13px}
.tmt-tabs{gap:6px;padding:10px 14px 6px;flex-wrap:wrap;background:transparent;border:none;overflow:visible}.tmt-tab{padding:4px 12px;font-size:11px;border:1px solid rgba(42,74,28,.6);border-radius:4px}.tmt-tab:hover:not(:disabled){border-color:#3d6828}.tmt-tab.active{border-bottom-color:#3d6828}.tmt-tab-pro::after{content:'PRO';display:inline-block;background:rgba(108,192,64,.2);color:#6cc040;padding:1px 5px;border-radius:3px;font-size:9px;font-weight:800;letter-spacing:.5px;margin-left:4px;vertical-align:middle}
.tmt-body{padding:10px 14px 16px;font-size:13px}
.tmt-sbar{display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(42,74,28,.35);border:1px solid #2a4a1c;border-radius:6px;margin-bottom:10px;flex-wrap:wrap}
.tmt-sbar-label{color:#6a9a58;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px}
.tmt-sbar select{background:rgba(42,74,28,.4);color:#c8e0b4;border:1px solid #2a4a1c;padding:4px 8px;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600;font-family:inherit}
.tmt-sbar select:focus{border-color:#6cc040;outline:none}
.tmt-cards{display:flex;gap:14px;margin-bottom:12px;padding:12px 14px;background:rgba(42,74,28,.3);border:1px solid #2a4a1c;border-radius:8px;flex-wrap:wrap}
.tmt-cards>div{min-width:80px}.tmt-cards .lbl{color:#6a9a58;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;font-weight:700}.tmt-cards .val{font-size:16px;font-weight:800;margin-top:3px}
.tmt-pool-bar{height:6px;background:rgba(0,0,0,.2);border-radius:3px;overflow:hidden;display:flex;gap:1px;margin-top:8px}
.tmt-pool-seg{height:100%;border-radius:3px;transition:width 0.3s ease;min-width:0}.tmt-pool-rem{flex:1;height:100%}
.tmt-tbl{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px}
.tmt-tbl th{padding:6px;font-size:10px;font-weight:700;color:#6a9a58;text-transform:uppercase;letter-spacing:0.4px;border-bottom:1px solid #2a4a1c;text-align:left;white-space:nowrap}.tmt-tbl th.c{text-align:center}
.tmt-tbl td{padding:5px 6px;border-bottom:1px solid rgba(42,74,28,.4);color:#c8e0b4;font-variant-numeric:tabular-nums;vertical-align:middle}.tmt-tbl td.c{text-align:center}
.tmt-tbl tr:hover{background:rgba(255,255,255,.03)}
.tmt-clr-bar{width:3px;padding:0;border-radius:2px}
.tmt-dots{display:inline-flex;gap:3px;align-items:center}
.tmt-dot{width:18px;height:18px;border-radius:50%;transition:all 0.15s;cursor:pointer;display:inline-block}
.tmt-dot-empty{background:rgba(255,255,255,.06);border:1px solid rgba(42,74,28,.6)}.tmt-dot-empty:hover{background:rgba(255,255,255,.12);border-color:rgba(42,74,28,.9)}
.tmt-dot-filled{box-shadow:0 0 6px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.15)}
.tmt-btn{width:24px;height:24px;min-width:24px;padding:0;line-height:1;font-size:14px}.tmt-btn:active:not(:disabled){background:rgba(74,144,48,.3)}.tmt-btn:disabled{opacity:.2}
.tmt-pts{font-size:13px;font-weight:800;color:#e8f5d8;min-width:14px;text-align:center}
.tmt-footer{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(42,74,28,.3);border:1px solid #2a4a1c;border-radius:8px;gap:10px;flex-wrap:wrap}
.tmt-footer-total .lbl{color:#6a9a58;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;font-weight:700}
.tmt-footer-total .val{font-size:18px;font-weight:900;color:#e8f5d8;letter-spacing:-0.5px}.tmt-footer-total .dim{color:#6a9a58;font-weight:600}
.tmt-footer-acts{display:flex;gap:6px}
.tmt-act{text-transform:uppercase;letter-spacing:.4px}.tmt-act.dng:hover{border-color:rgba(248,113,113,.3);color:#f87171;background:rgba(248,113,113,.08)}
.tmt-saved{display:inline-block;font-size:10px;font-weight:700;color:#6cc040;background:rgba(108,192,64,.12);border:1px solid rgba(108,192,64,.25);border-radius:4px;padding:2px 8px;margin-left:8px;opacity:0;transition:opacity 0.3s;vertical-align:middle}.tmt-saved.vis{opacity:1}
.tmt-custom-off .tmt-cards{display:none}.tmt-custom-off .tmt-tbl{display:none}.tmt-custom-off .tmt-footer{display:none}
.tmt-wrap:not(.tmt-custom-off) .tmt-sbar{display:none}
.tmt-readonly .tmt-btn{opacity:0.25;pointer-events:none}.tmt-readonly .tmt-dot{pointer-events:none;cursor:default}
.tmt-readonly .tmt-act{opacity:0.25;pointer-events:none}.tmt-readonly #type-select{pointer-events:none;opacity:0.6}
.tmt-readonly .tmt-tab{pointer-events:none}
.tmt-readonly-badge{display:none}.tmt-readonly .tmt-readonly-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;color:#fbbf24;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.25);border-radius:4px;padding:2px 8px;margin-left:8px;vertical-align:middle}`;

    let _container = null, _data = null, _playerId = null, _readOnly = false;
    let trainingData = null, teamPoints = [0, 0, 0, 0, 0, 0], originalPoints = [0, 0, 0, 0, 0, 0], maxPool = 0, customOn = false, currentType = '3', shadow = null, customDataRef = null;
    const q = (sel) => shadow ? shadow.querySelector(sel) : null;
    const qa = (sel) => shadow ? shadow.querySelectorAll(sel) : [];

    const renderPoolBar = () => { const tot = teamPoints.reduce((a, b) => a + b, 0); let s = ''; for (let i = 0; i < 6; i++) { if (teamPoints[i] > 0) { s += `<div class="tmt-pool-seg" style="width:${(teamPoints[i] / maxPool * 100).toFixed(2)}%;background:${COLORS[i]};opacity:0.7"></div>`; } } const rem = ((maxPool - tot) / maxPool * 100).toFixed(2); if (rem > 0) s += `<div class="tmt-pool-rem" style="width:${rem}%"></div>`; return s; };
    const renderDots = (idx) => { const pts = teamPoints[idx]; const c = COLORS[idx]; let h = ''; for (let i = 0; i < MAX_PTS; i++) { h += i < pts ? `<span class="tmt-dot tmt-dot-filled" data-team="${idx}" data-seg="${i}" style="background:${c}"></span>` : `<span class="tmt-dot tmt-dot-empty" data-team="${idx}" data-seg="${i}"></span>`; } return h; };

    let saveDebounce = null, saveTimer = null;
    const flashSaved = () => { const el = q('#saved'); if (!el) return; el.classList.add('vis'); clearTimeout(saveTimer); saveTimer = setTimeout(() => el.classList.remove('vis'), 1800); };
    const saveCustomTraining = () => { const tot = teamPoints.reduce((a, b) => a + b, 0); if (tot !== maxPool || !customDataRef) return; clearTimeout(saveDebounce); saveDebounce = setTimeout(() => { const d = { type: 'custom', on: 1, player_id: _playerId, 'custom[points_spend]': 0, 'custom[player_id]': _playerId, 'custom[saved]': '' }; for (let i = 0; i < 6; i++) { const t = customDataRef['team' + (i + 1)]; const p = `custom[team${i + 1}]`; d[`${p}[num]`] = i + 1; d[`${p}[label]`] = t.label || `Team ${i + 1}`; d[`${p}[points]`] = teamPoints[i]; d[`${p}[skills][]`] = t.skills; } TmTrainingService.saveTraining(d).then(() => flashSaved()); }, 300); };
    const saveTrainingType = (type) => { TmTrainingService.saveTrainingType(_playerId, type).then(() => flashSaved()); };

    const updateUI = () => {
        const tot = teamPoints.reduce((a, b) => a + b, 0); const rem = maxPool - tot;
        const barEl = q('#pool-bar'); if (barEl) barEl.innerHTML = renderPoolBar();
        const uEl = q('#card-used'); if (uEl) uEl.textContent = tot;
        const fEl = q('#card-free'); if (fEl) { fEl.textContent = rem; fEl.style.color = rem > 0 ? '#fbbf24' : '#6a9a58'; }
        for (let i = 0; i < 6; i++) { const dEl = q(`#dots-${i}`); if (dEl) dEl.innerHTML = renderDots(i); const pEl = q(`#pts-${i}`); if (pEl) pEl.textContent = teamPoints[i]; }
        const tEl = q('#total'); if (tEl) tEl.innerHTML = `${tot}<span class="dim">/${maxPool}</span>`;
        qa('.tmt-minus').forEach(b => { b.disabled = teamPoints[parseInt(b.dataset.team)] <= 0; });
        qa('.tmt-plus').forEach(b => { b.disabled = teamPoints[parseInt(b.dataset.team)] >= MAX_PTS || rem <= 0; });
        bindDotClicks();
    };

    const bindDotClicks = () => { qa('.tmt-dot').forEach(dot => { dot.onclick = () => { const ti = parseInt(dot.dataset.team); const si = parseInt(dot.dataset.seg); const tp = si + 1; const tot = teamPoints.reduce((a, b) => a + b, 0); const cur = teamPoints[ti]; if (tp === cur) teamPoints[ti] = si; else if (tp > cur) { const need = tp - cur; const avail = maxPool - tot; teamPoints[ti] = need <= avail ? tp : cur + avail; } else teamPoints[ti] = tp; updateUI(); saveCustomTraining(); }; }); };

    const bindEvents = () => {
        qa('.tmt-plus').forEach(b => { b.addEventListener('click', () => { const i = parseInt(b.dataset.team); if (teamPoints[i] < MAX_PTS && teamPoints.reduce((a, b) => a + b, 0) < maxPool) { teamPoints[i]++; updateUI(); saveCustomTraining(); } }); });
        qa('.tmt-minus').forEach(b => { b.addEventListener('click', () => { const i = parseInt(b.dataset.team); if (teamPoints[i] > 0) { teamPoints[i]--; updateUI(); saveCustomTraining(); } }); });
        bindDotClicks();
        q('#btn-clear')?.addEventListener('click', () => { teamPoints.fill(0); updateUI(); saveCustomTraining(); });
        q('#btn-reset')?.addEventListener('click', () => { teamPoints = [...originalPoints]; updateUI(); saveCustomTraining(); });
        const tS = q('.tmt-tab[data-tab="std"]'), tC = q('.tmt-tab[data-tab="cus"]'), w = q('.tmt-wrap');
        tS?.addEventListener('click', () => { if (customOn) { customOn = false; tS.classList.add('active'); tC.classList.remove('active'); w.classList.add('tmt-custom-off'); saveTrainingType(currentType); } });
        tC?.addEventListener('click', () => { if (!customOn) { customOn = true; tC.classList.add('active'); tS.classList.remove('active'); w.classList.remove('tmt-custom-off'); saveCustomTraining(); } });
        q('#type-select')?.addEventListener('change', (e) => { const v = e.target.value; if (v !== currentType) { currentType = v; saveTrainingType(v); } });
        updateUI();
    };

    const render = (container, data, { playerId, readOnly = false } = {}) => {
        _container = container; _data = data; _playerId = playerId; _readOnly = readOnly;
        trainingData = data;

        const custom = data?.custom;

        if (!custom || custom.gk) {
            container.innerHTML = '';
            const host = document.createElement('div');
            container.appendChild(host);
            shadow = host.attachShadow({ mode: 'open' });
            shadow.innerHTML = `<style>${TMT_CSS}</style><div class="tmt-wrap"><div class="tmt-body" style="text-align:center;padding:20px 14px"><div style="font-size:22px;margin-bottom:6px">🧤</div><div style="color:#e8f5d8;font-weight:700;font-size:14px;margin-bottom:4px">Goalkeeper Training</div><div style="color:#6a9a58;font-size:11px">Training is automatically set and cannot be changed for goalkeepers.</div></div></div>`;
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

        let teamRows = '';
        for (let i = 0; i < 6; i++) { const t = customData['team' + (i + 1)]; const skills = t.skills.map(s => SKILL_NAMES[s] || s).join(', '); teamRows += `<tr data-team="${i}"><td class="tmt-clr-bar" style="background:${COLORS[i]}"></td><td style="font-weight:700;color:#e8f5d8;white-space:nowrap">T${i + 1}</td><td style="color:#8aac72;font-size:11px">${skills}</td><td class="c"><div style="display:flex;align-items:center;gap:6px;justify-content:center">${buttonHtml({ label: '−', color: 'secondary', size: 'xs', cls: 'tmt-btn tmt-minus', id: `tmt-minus-${i}`, attrs: { 'data-team': i } })}<span class="tmt-dots" id="dots-${i}">${renderDots(i)}</span><span class="tmt-pts" id="pts-${i}">${teamPoints[i]}</span>${buttonHtml({ label: '+', color: 'secondary', size: 'xs', cls: 'tmt-btn tmt-plus', id: `tmt-plus-${i}`, attrs: { 'data-team': i } })}</div></td></tr>`; }

        shadow.innerHTML = `<style>${TMT_CSS}</style>
<div class="tmt-wrap ${customOn ? '' : 'tmt-custom-off'} ${_readOnly ? 'tmt-readonly' : ''}">
    ${tabsHtml(customOn).replace('</div>', '<span class="tmt-readonly-badge">👁 View only</span></div>')}
<div class="tmt-body">
<div class="tmt-sbar" id="type-bar"><span class="tmt-sbar-label">Training Type</span><select id="type-select">${typeOpts}</select></div>
<div class="tmt-cards"><div><div class="lbl">Allocated</div><div class="val" style="color:#6cc040" id="card-used">${totalAlloc}</div></div><div><div class="lbl">Remaining</div><div class="val" style="color:${rem > 0 ? '#fbbf24' : '#6a9a58'}" id="card-free">${rem}</div></div><div><div class="lbl">Total Pool</div><div class="val" style="color:#e8f5d8">${maxPool}</div></div><div style="flex:1;display:flex;align-items:flex-end"><div class="tmt-pool-bar" id="pool-bar" style="width:100%">${renderPoolBar()}</div></div></div>
<table class="tmt-tbl" id="teams-tbl"><thead><tr><th style="width:3px;padding:0"></th><th style="width:30px">Team</th><th>Skills</th><th class="c">Points</th></tr></thead><tbody id="teams-body">${teamRows}</tbody></table>
    <div class="tmt-footer"><div class="tmt-footer-total"><div class="lbl">Total Training</div><div class="val" id="total">${totalAlloc}<span class="dim">/${maxPool}</span></div></div><div class="tmt-footer-acts">${buttonHtml({ id: 'btn-clear', label: 'Clear All', color: 'danger', size: 'sm', cls: 'tmt-act dng' })}${buttonHtml({ id: 'btn-reset', label: 'Reset', color: 'secondary', size: 'sm', cls: 'tmt-act' })}</div></div>
</div></div>`;
        if (!_readOnly) bindEvents();
    };

    const reRender = () => { if (_container && _data) render(_container, _data, { playerId: _playerId, readOnly: _readOnly }); };

    return { render, reRender };
})();
