import { injectTacticsStyles } from '../tactics/tm-tactics-styles.js';
import { mountTacticsFieldReadOnly } from '../tactics/tm-tactics-field.js';

'use strict';

/**
 * TmMatchField — read-only tactics field for the match lineup panel.
 *
 * Injects tactics CSS on first use, wraps `mountTacticsFieldReadOnly`,
 * and creates the `.mp-lu-tactics-col` wrapper with an optional heading.
 */
export const TmMatchField = {
    /**
     * @param {object} posPlayerMap   — { [posKey]: playerObject }  (mutated externally on update)
     * @param {Array}  players        — full player list (for tooltips)
     * @param {object} [opts]
     * @param {function} [opts.onPlayerClick]  — called with (player) when a field slot is clicked
     * @returns {{ el: HTMLElement, refresh: () => void, showMatchRatingRef: object }}
     */
    create(posPlayerMap, players = [], opts = {}) {
        injectTacticsStyles();

        const col = document.createElement('div');
        col.className = 'mp-lu-tactics-col';

        const { refresh, showMatchRatingRef } = mountTacticsFieldReadOnly(col, posPlayerMap, players);

        if (opts.onPlayerClick) {
            col.addEventListener('click', e => {
                const slot = e.target.closest('.tmtc-slot[data-player-id]');
                if (!slot) return;
                const pid = slot.dataset.playerId;
                const player = players.find(p => String(p.id) === pid);
                if (player) opts.onPlayerClick(player);
            });
        }

        return { el: col, refresh, showMatchRatingRef };
    },
};
