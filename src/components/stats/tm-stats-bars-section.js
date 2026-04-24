import { TmUI } from '../shared/tm-ui.js';
import { TmStatsAdvTable } from './tm-stats-adv-table.js';

/**
 * TmStatsBarsSection — shared match statistics bars + attacking styles section.
 *
 * TmStatsBarsSection.render({ bars, advLeft, advRight, leftTone, rightTone, tf, mCount })
 *   → { html: string, mountAdvTables(container, { onTable? }) }
 *
 * bars:
 *   goals, shots, sot, yellow, red, freekicks, penalties — [leftTotal, rightTotal]
 *   poss — [leftVal, rightVal] | null  (pass pre-normalized value; tf averaging is applied)
 *
 * advLeft / advRight  — attacking-styles advData objects (passed to TmStatsAdvTable.build)
 * leftTone / rightTone — compareStat tone ('home'|'away'|'for'|'against')
 * tf      — 'total' | 'average'   (applied to all bar values including poss)
 * mCount  — number of matches for average calculation
 * onTable(tbl, 'left'|'right') — optional callback after each adv table is mounted
 */

const _fix2 = v => (Math.round(v * 100) / 100).toFixed(2);
const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const TmStatsBarsSection = {
    render({ bars, advLeft, advRight, leftTone = 'for', rightTone = 'against', tf = 'total', mCount = 1, leftLabel = null, rightLabel = null }) {
        const bNum = (v) => tf === 'average' ? Number(_fix2(v / mCount)) : v;
        const bStr = (v) => tf === 'average' ? _fix2(v / mCount) : String(v);

        const bar = (label, lv, rv, suffix = '') => TmUI.compareStat({
            label, size: 'sm', cls: 'tsa-stat-compare',
            leftValue:  `${bStr(lv)}${suffix}`,
            rightValue: `${bStr(rv)}${suffix}`,
            leftNumber:  bNum(lv),
            rightNumber: bNum(rv),
            leftTone, rightTone,
        });

        const statLabel = tf === 'average'
            ? 'Match Statistics — Per Match Average (For vs Against)'
            : 'Match Statistics (For vs Against)';

        let html = `<div class="tsa-section-title">${statLabel}</div>`;
        html += bar('Goals',        bars.goals[0],     bars.goals[1]);
        if (bars.poss != null) html += bar('Possession', bars.poss[0], bars.poss[1], '%');
        html += bar('Shots',        bars.shots[0],     bars.shots[1]);
        html += bar('On Target',    bars.sot[0],       bars.sot[1]);
        html += bar('Yellow Cards', bars.yellow[0],    bars.yellow[1]);
        html += bar('Red Cards',    bars.red[0],       bars.red[1]);
        html += bar('Free Kicks',   bars.freekicks[0], bars.freekicks[1]);
        html += bar('Penalties',    bars.penalties[0], bars.penalties[1]);

        html += `<div class="tsa-section-title">${leftLabel ? escapeHtml(leftLabel) + ' Attacking Styles' : 'Our Attacking Styles'}</div>`;
        html += '<div data-tsbs="left"></div>';
        html += `<div class="tsa-section-title">${rightLabel ? escapeHtml(rightLabel) + ' Attacking Styles' : 'Opponent Attacking Styles'}</div>`;
        html += '<div data-tsbs="right"></div>';

        const mountAdvTables = (container, { onTable } = {}) => {
            const phL = container.querySelector('[data-tsbs="left"]');
            const phR = container.querySelector('[data-tsbs="right"]');
            if (phL) { const t = TmStatsAdvTable.build(advLeft,  { tf, mCount }); phL.replaceWith(t); onTable?.(t, 'left');  }
            if (phR) { const t = TmStatsAdvTable.build(advRight, { tf, mCount }); phR.replaceWith(t); onTable?.(t, 'right'); }
        };

        return { html, mountAdvTables };
    },
};
