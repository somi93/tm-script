import { TmConst } from '../../lib/tm-constants.js';

const TRN_LABELS = TmConst.TRAINING_LABELS;
export const DOT_COLORS = ['var(--tmu-text-dim)', 'var(--tmu-danger)', 'var(--tmu-warning-soft)', 'var(--tmu-warning)', 'var(--tmu-accent)', 'var(--tmu-success-strong)'];

const STYLE_ID = 'tm-trn-dots-style';

const injectCSS = () => {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        .tm-trn-dots { display: inline-flex; gap: 2px; align-items: center; }
        .tm-trn-dot {
            display: inline-block; width: 14px; height: 14px;
            border-radius: var(--tmu-space-xs); text-align: center; line-height: 14px;
            font-size: var(--tmu-font-2xs); font-weight: 900; color: var(--tmu-surface-input-dark-focus);
        }
        .tm-trn-dot-lg {
            width: 18px; height: 18px;
            border-radius: var(--tmu-space-xs); line-height: 18px;
            font-size: var(--tmu-font-xs);
        }
    `;
    document.head.appendChild(s);
};

/**
 * Render training allocation dots.
 * @param {string} tc   - 6-char string, each char is the point value for that training team (e.g. "224221")
 * @param {string} [size] - 'lg' for larger dots using the same design language
 * @returns {string} HTML string
 */
const render = (tc, size) => {
    if (!tc || tc.length !== 6) return '<span style="color:var(--tmu-text-dim)">—</span>';
    injectCSS();
    const lg = size === 'lg';
    const dotCls = lg ? 'tm-trn-dot tm-trn-dot-lg' : 'tm-trn-dot';
    const gap = lg ? 'gap:var(--tmu-space-xs)' : 'gap:2px';
    const title = tc.split('').map((d, i) => `${TRN_LABELS[i]}: ${d}`).join('  ');
    let h = `<span class="tm-trn-dots" style="${gap}" title="${title}">`;
    for (let i = 0; i < 6; i++) {
        const v = parseInt(tc[i]) || 0;
        h += `<span class="${dotCls}" style="background:${DOT_COLORS[v]}">${v}</span>`;
    }
    h += '</span>';
    return h;
};

export const PlayerTrainingDots = { render, injectCSS };
