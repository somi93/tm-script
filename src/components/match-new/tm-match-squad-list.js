import { POSITION_MAP, BENCH_SLOTS } from '../../constants/player.js';
import { TmPlayerRow } from '../shared/tm-player-row.js';

'use strict';

const isStarter = p => !!POSITION_MAP[(p.position || '').toLowerCase()];
const isBench   = p => BENCH_SLOTS.includes((p.position || '').toLowerCase());
const posKey    = p => (p.position || p.fp || '').toLowerCase().split(',')[0].replace(/^sub\d*/i, '');

/**
 * TmMatchSquadList — player list column for the match lineup panel.
 *
 * Renders 11 starters (sorted by position) then a divider then bench players.
 */
export const TmMatchSquadList = {
    /**
     * @param {'home'|'away'} side
     * @param {Array}         lineup    — all match players for this side
     * @returns {{ el: HTMLElement, playerEls: Map<string, HTMLElement> }}
     */
    create(side, lineup) {
        const col = document.createElement('div');
        col.className = `mp-lu-col mp-lu-col-${side}`;

        const starters = lineup.filter(isStarter).sort((a, b) => {
            const ma = POSITION_MAP[a.position.toLowerCase()];
            const mb = POSITION_MAP[b.position.toLowerCase()];
            return (ma?.row ?? 9) - (mb?.row ?? 9) || (ma?.col ?? 9) - (mb?.col ?? 9);
        });
        const subs = lineup.filter(isBench).sort((a, b) =>
            parseInt((a.position || '99').replace(/\D/g, '') || '99') -
            parseInt((b.position || '99').replace(/\D/g, '') || '99')
        );

        const playerEls = new Map();

        for (const p of starters) {
            const el = TmPlayerRow.build(p, { posKey: posKey(p), state: 'active' });
            col.appendChild(el);
            playerEls.set(String(p.id), el);
        }

        const divider = document.createElement('div');
        divider.className = 'mp-lu-div';
        col.appendChild(divider);

        for (const p of subs) {
            const el = TmPlayerRow.build(p, { posKey: posKey(p), state: 'bench' });
            col.appendChild(el);
            playerEls.set(String(p.id), el);
        }

        return { el: col, playerEls };
    },
};
