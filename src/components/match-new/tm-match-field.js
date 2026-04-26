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
     * @returns {{ el: HTMLElement, refresh: () => void }}
     */
    create(posPlayerMap, players = []) {
        injectTacticsStyles();

        const col = document.createElement('div');
        col.className = 'mp-lu-tactics-col';

        const { refresh, showMatchRatingRef } = mountTacticsFieldReadOnly(col, posPlayerMap, players);

        return { el: col, refresh, showMatchRatingRef };
    },
};
