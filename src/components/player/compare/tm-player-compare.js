import { TmPlayerModel } from '../../../models/player.js';
import { TmAutocomplete } from '../../shared/tm-autocomplete.js';
import { TmInput } from '../../shared/tm-input.js';
import { TmUI } from '../../shared/tm-ui.js';
import { fetchRawPlayers } from '../../../models/club.js';
import { TmUtils } from '../../../lib/tm-utils.js';
import { SKILL_DEFS_OUT, SKILL_DEFS_GK } from '../../../constants/skills.js';
import { TmCompareStat } from '../../shared/tm-compare-stat.js';
import { TmTabs } from '../../shared/tm-tabs.js';
import { TmSkill } from '../../shared/tm-skill.js';

const STYLE_ID = 'tmpc-styles';

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    document.head.appendChild(Object.assign(document.createElement('style'), {
        id: STYLE_ID,
        textContent: `
.tmpc-overlay{position:fixed;inset:0;z-index:10070;display:flex;background:var(--tmu-surface-overlay-strong);backdrop-filter:blur(4px)}
.tmpc-dialog{width:100%;display:flex;flex-direction:column;background:var(--tmu-surface-panel);color:var(--tmu-text-main);overflow:hidden}
.tmpc-head{display:flex;align-items:center;justify-content:space-between;padding:var(--tmu-space-md) var(--tmu-space-xl);border-bottom:1px solid var(--tmu-border-soft-alpha);flex-shrink:0}
.tmpc-head-title{font-size:var(--tmu-font-sm);font-weight:800;color:var(--tmu-text-strong);text-transform:uppercase;letter-spacing:.08em}
.tmpc-close-btn{background:none;border:none;color:var(--tmu-text-muted);cursor:pointer;font-size:var(--tmu-font-xl);line-height:1;padding:0 4px;border-radius:var(--tmu-space-xs)}
.tmpc-close-btn:hover{color:var(--tmu-text-strong)}
.tmpc-body{flex:1;overflow-y:auto;padding:var(--tmu-space-xl);display:flex;flex-direction:column;gap:var(--tmu-space-lg);scrollbar-width:thin;scrollbar-color:var(--tmu-border-soft-alpha) transparent}
.tmpc-picker{display:flex;gap:var(--tmu-space-md);align-items:center;flex-wrap:wrap}
.tmpc-picker-with-label{display:flex;align-items:center;gap:var(--tmu-space-sm);flex:0 0 auto}
.tmpc-picker-label{font-size:var(--tmu-font-xs);color:var(--tmu-text-panel-label);margin-bottom:var(--tmu-space-xs);font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.tmpc-picker-group{display:flex;flex-direction:column;flex:1;min-width:150px}
.tmpc-picker-or{font-size:var(--tmu-font-sm);color:var(--tmu-text-muted);padding:0 2px;align-self:flex-end;padding-bottom:9px}
.tmpc-error{color:var(--tmu-danger);font-size:var(--tmu-font-sm)}
.tmpc-players-hdr{display:grid;grid-template-columns:1fr 36px 1fr;gap:var(--tmu-space-sm);text-align:center;padding:var(--tmu-space-md) 0;border-bottom:1px solid var(--tmu-border-soft-alpha);margin-bottom:var(--tmu-space-xs)}
.tmpc-player-name{font-size:var(--tmu-font-sm);font-weight:700;color:var(--tmu-text-strong);word-break:break-word}
.tmpc-player-pos{font-size:var(--tmu-font-xs);color:var(--tmu-accent);margin-top:2px}
.tmpc-player-stars{color:var(--tmu-metal-gold);font-size:var(--tmu-font-sm);margin-top:4px;letter-spacing:1px}
.tmpc-vs{font-size:var(--tmu-font-xs);color:var(--tmu-text-muted);align-self:center;font-weight:700;padding-top:calc(var(--tmu-space-md) + 6px)}
.tmpc-section-title{font-size:var(--tmu-font-xs);font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--tmu-text-panel-label);padding:var(--tmu-space-sm) 0 var(--tmu-space-xs);border-bottom:1px solid var(--tmu-border-soft-alpha);margin-top:var(--tmu-space-sm)}
.tmpc-col-name{font-size:var(--tmu-font-xs);font-weight:700;color:var(--tmu-text-muted);text-align:center;padding-bottom:var(--tmu-space-xs);border-bottom:1px solid var(--tmu-border-soft-alpha);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tmpc-radar-wrap{display:flex;flex-direction:column;align-items:center}
.tmpc-radar-legend{display:flex;gap:var(--tmu-space-xl);flex-wrap:wrap;justify-content:center;margin-top:var(--tmu-space-sm)}
.tmpc-radar-legend-item{display:flex;align-items:center;gap:var(--tmu-space-xs);font-size:var(--tmu-font-xs);color:var(--tmu-text-muted)}
.tmpc-radar-legend-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.tmpc-skills-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 var(--tmu-space-xl);align-items:start}
.tmpc-skills-radar-layout{display:grid;grid-template-columns:3fr 1fr;gap:0 var(--tmu-space-xl);align-items:start}
.tmpc-srow{display:flex;align-items:center;gap:var(--tmu-space-sm);padding:5px 0;border-bottom:1px solid var(--tmu-border-soft-alpha)}
.tmpc-sval{width:36px;font-size:var(--tmu-font-lg);font-weight:800;font-variant-numeric:tabular-nums;text-align:right;line-height:1.2;flex-shrink:0}
.tmpc-sval-win{}
.tmpc-sval-loss{opacity:.6}
.tmpc-slabel{flex:1;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--tmu-text-panel-label)}
.tmpc-tab-panel{padding-top:var(--tmu-space-md)}
.tmpc-result-tabs{border-bottom:1px solid var(--tmu-border-soft-alpha);margin-top:var(--tmu-space-md)}
.tmpc-dialog .tmu-ac-drop{z-index:10080!important}
`,
    }));
};

// ─── Skill value helpers ───────────────────────────────────────────────────

const getSkillVal = (player, key) => {
    const s = player.skills?.find(sk => sk.key === key || sk.key2 === key);
    return Number.isFinite(s?.value) ? Number(s.value) : 0;
};

const fmtSkill = (v) => TmSkill.skillBadge(v > 0 ? v : null);

// ─── Position label ────────────────────────────────────────────────────────

const posDisplay = (player) => {
    if (player.isGK) return 'GK';
    const pref = (player.positions || []).filter(p => p.preferred && p.position);
    if (pref.length) return pref.map(p => p.position).join('/');
    const first = (player.positions || []).find(p => p.main && p.position);
    return first ? first.position : '—';
};

// ─── Stars from R5 ────────────────────────────────────────────────────────

const starsHtml = (r5) => {
    const n = !r5 ? 0 : r5 >= 110 ? 5 : r5 >= 90 ? 4 : r5 >= 70 ? 3 : r5 >= 50 ? 2 : 1;
    return '★'.repeat(n) + '☆'.repeat(5 - n);
};

// ─── Radar groups ─────────────────────────────────────────────────────────

const RADAR_OUT = [
    { label: 'Physical', keys: ['strength', 'stamina', 'pace'] },
    { label: 'Defending', keys: ['marking', 'tackling'] },
    { label: 'Work', keys: ['workrate', 'positioning'] },
    { label: 'Technical', keys: ['passing', 'crossing', 'technique'] },
    { label: 'Aerial', keys: ['heading'] },
    { label: 'Attacking', keys: ['finishing', 'longshots', 'set_pieces'] },
];

const RADAR_GK = [
    { label: 'Physical', keys: ['strength', 'stamina', 'pace'] },
    { label: 'Shot Stop', keys: ['handling', 'reflexes'] },
    { label: '1v1', keys: ['oneonones'] },
    { label: 'Aerial', keys: ['arialability', 'jumping'] },
    { label: 'Command', keys: ['communication'] },
    { label: 'Distrib.', keys: ['kicking', 'throwing'] },
];

// ─── Radar chart ──────────────────────────────────────────────────────────

const drawRadar = (canvas, groups, pA, pB) => {
    const dpr = window.devicePixelRatio || 1;
    const sz = canvas.clientWidth || 280;
    canvas.width = sz * dpr;
    canvas.height = sz * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const N = groups.length;
    const cx = sz / 2;
    const cy = sz * 0.43;
    const r = sz * 0.33;
    const lr = sz * 0.38;
    const ang = (i) => (i / N) * Math.PI * 2 - Math.PI / 2;

    const groupScore = (player, group) => {
        const vals = group.keys.map(k => getSkillVal(player, k));
        return vals.reduce((a, b) => a + b, 0) / vals.length;
    };

    const rs = getComputedStyle(document.documentElement);
    const gridClr = rs.getPropertyValue('--tmu-border-soft-alpha-mid').trim() || 'rgba(128,128,128,0.25)';
    const axisClr = rs.getPropertyValue('--tmu-text-panel-label').trim() || 'rgba(160,160,160,0.8)';

    // Grid rings
    [0.25, 0.5, 0.75, 1].forEach(f => {
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
            const a = ang(i);
            const px = cx + Math.cos(a) * r * f;
            const py = cy + Math.sin(a) * r * f;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = gridClr;
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    // Axes
    for (let i = 0; i < N; i++) {
        const a = ang(i);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.strokeStyle = gridClr;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Player polygons
    const drawPoly = (player, fillClr, strokeClr) => {
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
            const score = groupScore(player, groups[i]);
            const pr = r * Math.min(score / 20, 1);
            const a = ang(i);
            i === 0
                ? ctx.moveTo(cx + Math.cos(a) * pr, cy + Math.sin(a) * pr)
                : ctx.lineTo(cx + Math.cos(a) * pr, cy + Math.sin(a) * pr);
        }
        ctx.closePath();
        ctx.fillStyle = fillClr;
        ctx.fill();
        ctx.strokeStyle = strokeClr;
        ctx.lineWidth = 1.8;
        ctx.stroke();
    };

    drawPoly(pA, 'rgba(30,160,255,0.18)', 'rgba(30,160,255,0.85)');
    drawPoly(pB, 'rgba(255,120,30,0.18)', 'rgba(255,120,30,0.85)');

    // Labels — align based on position on circle
    ctx.font = `bold 11px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif`;
    ctx.fillStyle = axisClr;
    for (let i = 0; i < N; i++) {
        const a = ang(i);
        const lx = cx + Math.cos(a) * lr;
        const ly = cy + Math.sin(a) * lr;
        ctx.textAlign = Math.cos(a) > 0.3 ? 'left' : Math.cos(a) < -0.3 ? 'right' : 'center';
        ctx.textBaseline = Math.sin(a) > 0.3 ? 'top' : Math.sin(a) < -0.3 ? 'bottom' : 'middle';
        ctx.fillText(groups[i].label, lx, ly);
    }
};

// ─── HTML escape ──────────────────────────────────────────────────────────

const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// ─── Build comparison result ──────────────────────────────────────────────

const buildResult = (container, pA, pB) => {
    const defs = pA.isGK ? SKILL_DEFS_GK : SKILL_DEFS_OUT;
    const groups = pA.isGK ? RADAR_GK : RADAR_OUT;

    const fmtRtn = (p) => typeof p.routine === 'number' ? p.routine.toFixed(1) : '—';
    const half = Math.ceil(defs.length / 2);

    // ── Player header ──────────────────────────────────────────────────────
    const hdr = document.createElement('div');
    hdr.className = 'tmpc-players-hdr';
    hdr.innerHTML = `
        <div>
            <div class="tmpc-player-name">${esc(pA.name)}</div>
            <div class="tmpc-player-pos">${esc(posDisplay(pA))}</div>
            <div class="tmpc-player-stars">${starsHtml(pA.r5)}</div>
        </div>
        <div class="tmpc-vs">vs.</div>
        <div>
            <div class="tmpc-player-name">${esc(pB.name)}</div>
            <div class="tmpc-player-pos">${esc(posDisplay(pB))}</div>
            <div class="tmpc-player-stars">${starsHtml(pB.r5)}</div>
        </div>`;

    // ── Skill number rows (single column list) ────────────────────────────
    const makeNumberRows = (subset) => subset.map(def => {
        const vA = getSkillVal(pA, def.key);
        const vB = getSkillVal(pB, def.key);
        return `<div class="tmpc-srow">
            <span class="tmpc-slabel">${esc(def.name)}</span>
            <span class="tmpc-sval">${fmtSkill(vA)}</span>
            <span class="tmpc-sval">${fmtSkill(vB)}</span>
        </div>`;
    }).join('');

    const otherNumberRows = (() => {
        const vA = pA.routine || 0, vB = pB.routine || 0;
        const aW = vA > vB, bW = vB > vA;
        return `<div class="tmpc-srow">
            <span class="tmpc-slabel">Routine</span>
            <span class="tmpc-sval ${aW ? 'tmpc-sval-win' : bW ? 'tmpc-sval-loss' : ''}">${fmtRtn(pA)}</span>
            <span class="tmpc-sval ${bW ? 'tmpc-sval-win' : aW ? 'tmpc-sval-loss' : ''}">${fmtRtn(pB)}</span>
        </div>`;
    })();

    // ── Skills tab — left: 7+7 grid, right: radar ─────────────────────────
    const skillsPanel = document.createElement('div');
    skillsPanel.className = 'tmpc-tab-panel';
    skillsPanel.innerHTML = `
        <div class="tmpc-skills-radar-layout">
            <div>
                <div class="tmpc-skills-grid">
                    <div><div class="tmpc-col-name">${esc(pA.name)}</div>${makeNumberRows(defs.slice(0, half))}</div>
                    <div><div class="tmpc-col-name">${esc(pB.name)}</div>${makeNumberRows(defs.slice(half))}</div>
                </div>
                <div class="tmpc-section-title" style="margin-top:var(--tmu-space-lg)">Other</div>
                ${otherNumberRows}
            </div>
            <div class="tmpc-radar-wrap">
                <div class="tmpc-radar-legend" style="margin-top:0;margin-bottom:var(--tmu-space-sm)">
                    <div class="tmpc-radar-legend-item">
                        <div class="tmpc-radar-legend-dot" style="background:rgba(30,160,255,0.85)"></div>
                        <span>${esc(pA.name)}</span>
                    </div>
                    <div class="tmpc-radar-legend-item">
                        <div class="tmpc-radar-legend-dot" style="background:rgba(255,120,30,0.85)"></div>
                        <span>${esc(pB.name)}</span>
                    </div>
                </div>
                <canvas data-tmpc-radar style="width:100%;aspect-ratio:1;display:block"></canvas>
            </div>
        </div>`;

    // ── Graphs tab — compare bars ─────────────────────────────────────────
    const makeBarsRows = (subset) => subset.map(def => {
        const vA = getSkillVal(pA, def.key);
        const vB = getSkillVal(pB, def.key);
        return TmCompareStat.compareStat({ label: def.name, leftValue: fmtSkill(vA), rightValue: fmtSkill(vB), leftNumber: vA, rightNumber: vB });
    }).join('');

    const otherBarsRows = TmCompareStat.compareStat({ label: 'Routine', leftValue: fmtRtn(pA), rightValue: fmtRtn(pB), leftNumber: pA.routine || 0, rightNumber: pB.routine || 0 });

    const graphsPanel = document.createElement('div');
    graphsPanel.className = 'tmpc-tab-panel';
    graphsPanel.hidden = true;
    graphsPanel.innerHTML = `
        <div class="tmpc-skills-grid">
            <div>${makeBarsRows(defs.slice(0, half))}</div>
            <div>${makeBarsRows(defs.slice(half))}</div>
        </div>
        <div class="tmpc-section-title" style="margin-top:var(--tmu-space-lg)">Other</div>
        ${otherBarsRows}`;

    // ── Tab bar ────────────────────────────────────────────────────────────
    let radarDrawn = false; // eslint-disable-line no-unused-vars
    const tabBar = TmTabs.tabs({
        items: [
            { key: 'skills', label: 'Skills' },
            { key: 'graphs', label: 'Graphs' },
        ],
        active: 'skills',
        onChange: (key) => {
            skillsPanel.hidden = key !== 'skills';
            graphsPanel.hidden = key !== 'graphs';
        },
    });
    tabBar.className += ' tmpc-result-tabs';

    container.innerHTML = '';
    container.appendChild(hdr);
    container.appendChild(tabBar);
    container.appendChild(skillsPanel);
    container.appendChild(graphsPanel);

    // Draw radar once the skills panel is in the DOM
    requestAnimationFrame(() => {
        const canvas = skillsPanel.querySelector('[data-tmpc-radar]');
        if (canvas) drawRadar(canvas, groups, pA, pB);
    });
};

// ─── Export ───────────────────────────────────────────────────────────────

export const TmPlayerCompare = {

    open(currentPlayer) {
        injectStyles();

        const overlay = document.createElement('div');
        overlay.className = 'tmpc-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'tmpc-dialog';
        overlay.appendChild(dialog);

        let closed = false;
        const close = () => {
            if (closed) return;
            closed = true;
            document.removeEventListener('keydown', onKeydown);
            overlay.remove();
            document.body.style.overflow = '';
        };

        const onKeydown = (e) => { if (e.key === 'Escape') close(); };

        // Head
        const head = document.createElement('div');
        head.className = 'tmpc-head';
        head.innerHTML = `<div class="tmpc-head-title">Compare Players</div><button class="tmpc-close-btn" aria-label="Close">×</button>`;
        head.querySelector('.tmpc-close-btn').addEventListener('click', close);
        dialog.appendChild(head);

        // Body
        const body = document.createElement('div');
        body.className = 'tmpc-body';
        dialog.appendChild(body);

        // Squad players (fetched async)
        let squadPlayers = [];
        const ownClubIds = TmUtils.getOwnClubIds();
        if (ownClubIds?.length) {
            fetchRawPlayers(ownClubIds[0]).then(players => {
                squadPlayers = (players || []).filter(p => Number(p.id) !== Number(currentPlayer.id));
            });
        }

        // Picker
        let selectedPlayer = null;

        const acRoot = TmAutocomplete.autocomplete({
            placeholder: 'Search your squad…',
            size: 'full',
            density: 'comfy',
            tone: 'overlay',
            onInput: (e) => {
                selectedPlayer = null;
                populateAc(e.target.value || '');
            },
        });

        const populateAc = (rawQ = '') => {
            const q = rawQ.toLowerCase().trim();
            const items = squadPlayers
                .filter(p => !q || (p.name || '').toLowerCase().includes(q))
                .slice(0, 20)
                .map(p => TmAutocomplete.autocompleteItem({
                    label: `${p.name} (${posDisplay(p)})`,
                    onSelect: () => {
                        selectedPlayer = p;
                        acRoot.setValue(p.name);
                        acRoot.hideDrop();
                        idInput.value = '';
                        clearError();
                        runCompare(p);
                    },
                }));
            acRoot.setItems(items);
        };

        // Show all players on focus
        acRoot.inputEl.addEventListener('focus', () => { selectedPlayer = null; populateAc(acRoot.inputEl.value || ''); });
        // Hide dropdown on blur
        acRoot.inputEl.addEventListener('blur', () => setTimeout(() => acRoot.hideDrop(), 120));

        const idInput = TmInput.input({
            placeholder: 'Player ID…',
            size: 'full',
            density: 'comfy',
            tone: 'overlay',
            type: 'number',
            min: 1,
            onInput: () => {
                selectedPlayer = null;
                acRoot.setValue('');
                acRoot.hideDrop();
            },
        });

        const withLabel = document.createElement('div');
        withLabel.className = 'tmpc-picker-with-label';
        const withLabelText = document.createElement('span');
        withLabelText.className = 'tmpc-picker-label';
        withLabelText.textContent = 'Compare with:';
        const acWrap = document.createElement('div');
        acWrap.style.cssText = 'width:320px;flex-shrink:0';
        acWrap.appendChild(acRoot);
        withLabel.appendChild(withLabelText);
        withLabel.appendChild(acWrap);

        const orEl = document.createElement('div');
        orEl.className = 'tmpc-picker-or';
        orEl.textContent = 'or';

        const groupId = document.createElement('div');
        groupId.style.cssText = 'display:flex;flex-direction:column;flex:0 0 auto;width:120px';
        groupId.appendChild(idInput);

        const compareBtn = TmUI.button({ slot: 'Compare', color: 'primary', size: 'sm' });
        const btnWrap = document.createElement('div');
        btnWrap.style.cssText = 'flex-shrink:0';
        btnWrap.appendChild(compareBtn);

        const pickerDiv = document.createElement('div');
        pickerDiv.className = 'tmpc-picker';
        pickerDiv.appendChild(withLabel);
        pickerDiv.appendChild(orEl);
        pickerDiv.appendChild(groupId);
        pickerDiv.appendChild(btnWrap);

        const errorEl = document.createElement('div');
        errorEl.className = 'tmpc-error';
        errorEl.hidden = true;

        const clearError = () => { errorEl.hidden = true; };
        const showError = (msg) => { errorEl.textContent = msg; errorEl.hidden = false; };

        const resultDiv = document.createElement('div');

        body.appendChild(pickerDiv);
        body.appendChild(errorEl);
        body.appendChild(resultDiv);

        // Compare logic (shared by button + auto-compare on selection)
        let busy = false;
        const runCompare = async (directPlayer) => {
            if (busy) return;
            clearError();
            resultDiv.innerHTML = '';

            const playerObj = directPlayer || selectedPlayer || null;
            let opponentId = playerObj ? Number(playerObj.id) : null;
            if (!opponentId) {
                const raw = idInput.value.trim();
                opponentId = raw ? Number(raw) : null;
            }

            if (!opponentId || !Number.isFinite(opponentId) || opponentId < 1) {
                showError('Select a player from squad or enter a valid player ID.');
                return;
            }
            if (opponentId === Number(currentPlayer.id)) {
                showError('Cannot compare a player with themselves.');
                return;
            }

            busy = true;
            compareBtn.disabled = true;
            compareBtn.textContent = 'Loading…';

            try {
                const opponent = (playerObj?.skills?.length)
                    ? playerObj
                    : await TmPlayerModel.fetchPlayerTooltip(opponentId);

                if (!opponent) { showError('Could not load player data. Check the player ID.'); return; }
                if (Boolean(currentPlayer.isGK) !== Boolean(opponent.isGK)) {
                    showError('Cannot compare a Goalkeeper with an outfield player.');
                    return;
                }

                buildResult(resultDiv, currentPlayer, opponent);
                setTimeout(() => resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
            } catch {
                showError('Failed to load player data. Please try again.');
            } finally {
                busy = false;
                compareBtn.disabled = false;
                compareBtn.textContent = 'Compare';
            }
        };

        compareBtn.addEventListener('click', () => runCompare());

        // Overlay backdrop close
        overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', onKeydown);

        document.body.style.overflow = 'hidden';
        document.body.appendChild(overlay);
    },

    mountButton(container, { player }) {
        injectStyles();
        if (!container) return;
        TmUI.render(container,
            `<tm-row data-cls="px-1 pt-1 pb-1" data-justify="flex-start">
                <tm-button data-variant="secondary" data-size="sm" data-action="compare">⇄ Compare players</tm-button>
            </tm-row>`,
            { compare: () => TmPlayerCompare.open(player) },
        );
    },
};
