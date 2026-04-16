import { TmUI } from '../components/shared/tm-ui.js';
import { TmConst } from './tm-constants.js';
import { TmUtils } from './tm-utils.js';

// tm-player-age.js — Shared age badge renderer
// Mirrors the colored Age badge used in tm-player-tooltip.
// Exposed as: TmPlayerAge

export const TmPlayerAge = {
    /**
     * Render a muted badge with the player's age, colored by AGE_THRESHOLDS.
     * @param {{ age: number, month: number, ageMonthsString: string }} player
     * @returns {string} HTML string
     */
    chip(player) {
        const ageColor = TmUtils.getColor(
            player.age + player.month / 12,
            TmConst.AGE_THRESHOLDS
        );
        return TmUI.badge(
            { label: 'Age', value: player.ageMonthsString, size: 'sm', shape: 'rounded', weight: 'bold' },
            'muted'
        ).replace('tmu-badge-tone-muted"', `tmu-badge-tone-muted" style="color:${ageColor}"`);
    },
};
