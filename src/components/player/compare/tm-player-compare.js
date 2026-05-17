import { TmPlayerModel } from '../../../models/player.js';
import { TmAutocomplete } from '../../shared/tm-autocomplete.js';
import { TmInput } from '../../shared/tm-input.js';
import { TmUI } from '../../shared/tm-ui.js';
import { fetchRawPlayers } from '../../../models/club.js';
import { TmUtils } from '../../../lib/tm-utils.js';
import { SKILL_DEFS_OUT, SKILL_DEFS_GK } from '../../../constants/skills.js';
import { TmSkill } from '../../shared/tm-skill.js';
import { TmStars } from '../../shared/tm-stars.js';
import { TmPosition } from '../../../lib/tm-position.js';
import { TmPlayerRadar } from '../../shared/tm-player-radar.js';

const STYLE_ID = 'tmpc-styles';

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    document.head.appendChild(Object.assign(document.createElement('style'), {
        id: STYLE_ID,
        textContent: `
.tmpc-overlay{position:fixed;inset:0;z-index:10070;display:flex;background:var(--tmu-surface-overlay-strong);backdrop-filter:blur(4px)}
.tmpc-dialog{width:100%;height:1000px;display:flex;flex-direction:column;background:var(--tmu-surface-panel);color:var(--tmu-text-main);overflow:hidden}
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
.tmpc-pcard{display:flex;flex-direction:column}
.tmpc-pcard-head{padding-bottom:12px;border-bottom:1px solid var(--tmu-border-soft-alpha)}
.tmpc-pcard-name{font-size:var(--tmu-font-lg);font-weight:800;color:var(--tmu-text-strong);line-height:1.2}
.tmpc-pcard-stat{display:flex;align-items:center;gap:var(--tmu-space-sm);padding:12px 0;border-bottom:1px solid var(--tmu-border-soft-alpha)}
.tmpc-pcard-lbl{flex:1;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--tmu-text-panel-label)}
.tmpc-pcard-val{font-size:var(--tmu-font-md);font-weight:700;color:var(--tmu-text-strong)}
.tmpc-col-name{font-size:var(--tmu-font-xs);font-weight:700;color:var(--tmu-text-muted);padding-bottom:var(--tmu-space-xs);border-bottom:1px solid var(--tmu-border-soft-alpha);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tmpc-radar-wrap{display:flex;flex-direction:column;align-items:center}
.tmpc-compare-cols{display:grid;grid-template-columns:260px 260px 1fr 1fr 500px;gap:0 var(--tmu-space-xl);align-items:start;padding-top:var(--tmu-space-md)}
.tmpc-srow{display:flex;align-items:center;gap:var(--tmu-space-sm);padding:12px 0;border-bottom:1px solid var(--tmu-border-soft-alpha)}
.tmpc-sval{width:36px;font-size:var(--tmu-font-lg);font-weight:800;font-variant-numeric:tabular-nums;text-align:right;line-height:1.2;flex-shrink:0}
.tmpc-slabel{flex:1;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--tmu-text-panel-label)}
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

const posChip = (player) => {
    if (player.isGK) return TmPosition.chip(['GK']);
    const pref = (player.positions || []).filter(p => p.preferred && p.position);
    if (pref.length) return TmPosition.chip(pref);
    const first = (player.positions || []).find(p => p.main && p.position);
    return first ? TmPosition.chip([first]) : '—';
};

const posText = (player) => {
    if (player.isGK) return 'GK';
    const pref = (player.positions || []).filter(p => p.preferred && p.position);
    if (pref.length) return pref.map(p => p.position).join('/');
    return (player.positions || []).find(p => p.main && p.position)?.position || '';
};

const playerRec = (player) =>
    (player.positions || []).filter(p => p.preferred || p.main)
        .sort((a, b) => (b.rec || 0) - (a.rec || 0))[0]?.rec || 0;

// ─── Radar groups ─────────────────────────────────────────────────────────

export const RADAR_OUT = [
    { label: 'Defending', keys: [['marking', 1.5], ['tackling', 1.5], ['strength', 0.75], ['positioning', 0.75], ['pace', 0.5]] },
    { label: 'Pressing', keys: ['workrate', 'positioning', 'marking'] },
    { label: 'Pace', keys: ['pace'] },
    { label: 'Set Piece', keys: [['set_pieces', 1.4], ['longshots', 0.9], ['technique', 0.85], ['crossing', 0.85]] },
    { label: 'Shooting', keys: [['finishing', 1.2], ['longshots', 1.0], ['technique', 0.8]] },
    { label: 'Creativity', keys: [['passing', 0.95], ['crossing', 0.95], ['technique', 1.1]] },
    { label: 'Aerial', keys: ['heading', 'strength'] },
    { label: 'Physique', keys: ['strength', 'stamina', 'pace', 'heading'] },
];

export const RADAR_GK = [
    { label: 'Physical', keys: ['strength', 'stamina', 'pace'] },
    { label: 'Shot Stop', keys: ['handling', 'reflexes'] },
    { label: '1v1', keys: ['oneonones'] },
    { label: 'Aerial', keys: ['arialability', 'jumping'] },
    { label: 'Command', keys: ['communication'] },
    { label: 'Distrib.', keys: ['kicking', 'throwing'] },
];

// ─── Radar chart ──────────────────────────────────────────────────────────

// ─── HTML escape ─────────────────────────────────────────────────────────

const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// ─── Build comparison result ──────────────────────────────────────────────

const buildResult = (container, pA, pB) => {
    const defs = pA.isGK ? SKILL_DEFS_GK : SKILL_DEFS_OUT;
    const groups = pA.isGK ? RADAR_GK : RADAR_OUT;

    const fmtRtn = (p) => typeof p.routine === 'number' ? p.routine.toFixed(1) : '—';
    const fmtWage = (p) => p.wage != null ? `€\u202f${Number(p.wage).toLocaleString()}` : '—';
    const fmtAsi  = (p) => p.asi  != null ? Number(p.asi).toLocaleString() : '—';

    const half = Math.ceil(defs.length / 2);

    const makeSkillRows = (subset) => subset.map(def => {
        const vA = getSkillVal(pA, def.key);
        const vB = getSkillVal(pB, def.key);
        return `<div class="tmpc-srow">
            <span class="tmpc-slabel">${esc(def.name)}</span>
            <span class="tmpc-sval">${fmtSkill(vA)}</span>
            <span class="tmpc-sval">${fmtSkill(vB)}</span>
        </div>`;
    }).join('');

    const pCard = (p, dotClr) => `
        <div class="tmpc-pcard">
            <div class="tmpc-pcard-head">
                <div class="tmpc-pcard-name">${esc(p.name)}</div>
            </div>
            <div class="tmpc-pcard-stat"><span class="tmpc-pcard-lbl">Pos</span>${posChip(p)}</div>
            <div class="tmpc-pcard-stat"><span class="tmpc-pcard-lbl">Age</span><span class="tmpc-pcard-val">${esc(p.ageMonthsString || '—')}</span></div>
            <div class="tmpc-pcard-stat"><span class="tmpc-pcard-lbl">Routine</span><span class="tmpc-pcard-val">${fmtRtn(p)}</span></div>
            <div class="tmpc-pcard-stat"><span class="tmpc-pcard-lbl">R5</span><span class="tmpc-pcard-val">${p.r5 != null ? Number(p.r5).toFixed(2) : '—'}</span></div>
            <div class="tmpc-pcard-stat"><span class="tmpc-pcard-lbl">Rec</span><span class="tmpc-pcard-val">${p.rec != null ? Number(p.rec).toFixed(2) : '—'}</span></div>
            <div class="tmpc-pcard-stat"><span class="tmpc-pcard-lbl">ASI</span><span class="tmpc-pcard-val">${fmtAsi(p)}</span></div>
            <div class="tmpc-pcard-stat"><span class="tmpc-pcard-lbl">Wage</span><span class="tmpc-pcard-val">${fmtWage(p)}</span></div>
        </div>`;

    const panel = document.createElement('div');
    panel.innerHTML = `
        <div class="tmpc-compare-cols">
            ${pCard(pA, 'rgba(30,160,255,0.85)')}
            ${pCard(pB, 'rgba(255,120,30,0.85)')}
            <div>
                <div class="tmpc-pcard-head" aria-hidden="true" style="visibility:hidden"><div class="tmpc-pcard-name">&#160;</div></div>
                ${makeSkillRows(defs.slice(0, half))}
            </div>
            <div>
                <div class="tmpc-pcard-head" aria-hidden="true" style="visibility:hidden"><div class="tmpc-pcard-name">&#160;</div></div>
                ${makeSkillRows(defs.slice(half))}
            </div>
            <div class="tmpc-radar-wrap"></div>
        </div>`;

    container.innerHTML = '';
    container.appendChild(panel);

    TmPlayerRadar.mount(
        panel.querySelector('.tmpc-radar-wrap'),
        groups,
        [pA, pB],
        { legendClass: 'tmpc-pcard-head' }
    );
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
                    label: `${p.name} (${posText(p)})`,
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
                const [pA, pB] = await Promise.all([
                    TmPlayerModel.fetchPlayerTooltip(currentPlayer.id),
                    TmPlayerModel.fetchPlayerTooltip(opponentId),
                ]);

                if (!pA) { showError('Could not load current player data.'); return; }
                if (!pB) { showError('Could not load player data. Check the player ID.'); return; }
                if (Boolean(pA.isGK) !== Boolean(pB.isGK)) {
                    showError('Cannot compare a Goalkeeper with an outfield player.');
                    return;
                }

                buildResult(resultDiv, pA, pB);
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
