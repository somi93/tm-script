import { Player } from '../../lib/player.js';
import { TmUtils } from '../../lib/tm-utils.js';
import { TmLib } from '../../lib/tm-lib.js';
import { ASI_WEIGHT_GK, ASI_WEIGHT_OUTFIELD } from '../../constants/skills.js';
import { applyPlayerPositionRatings } from './player.js';

/**
 * normalizeYouthPlayer — maps raw youth AJAX response player to a standard Player object.
 *
 * Retains youth-specific extras as own properties:
 *   player.youthRecommendationHtml  — TM star-rating HTML (pre-rendered by server)
 *   player.youthFee                 — hire fee in coins
 */
export const normalizeYouthPlayer = (raw) => {
    const player = Player.create();

    player.id    = Number(raw.id || raw.player_id || 0);
    player.age   = Number(raw.age) || 0;
    player.month = Number(raw.months || raw.month || 0);
    player.ageMonths = player.age * 12 + player.month;
    player.ageMonthsString = `${player.age}.${player.month}`;

    // TM uses 'player_name' in squad/tactic APIs; fall back to 'name' for new-youth format
    const rawName = raw.player_name || raw.name || '';
    player.name      = String(rawName);
    player.lastname  = String(raw.lastname || rawName.split(' ').pop() || '');
    player.firstname = player.name.replace(player.lastname, '').trim();
    player.country   = raw.country || null;
    player.isGK      = String(raw.favposition || '').split(',').map(s => s.trim().toUpperCase()).includes('GK');

    // ASI: TM uses 'skill_index' across all Ajax endpoints
    const rawAsi = raw.skill_index ?? raw.asi;
    player.asi = rawAsi != null ? TmUtils.parseNum(rawAsi, null) : null;

    // Skills: youth 'get' returns [{key, value, name}] array with long keys ('strength' etc.)
    // Try array format first; if that yields nothing, fall back to flat property format
    // (used by 'new' endpoint where skills come as direct object properties).
    if (Array.isArray(raw.skills) && raw.skills.length) {
        TmUtils.applyTooltipSkills(player, raw.skills);
    } else {
        TmUtils.applySquadSkills(player, raw);
    }

    // Mark preferred positions from favposition string (Player.create already built the array)
    TmUtils.applyPlayerPositions(player, String(raw.favposition || ''));

    // Youth API does not expose ASI — estimate it from skill sum so R5/REC are meaningful.
    if (player.asi == null && player.skills.length > 0) {
        const weight = player.isGK ? ASI_WEIGHT_GK : ASI_WEIGHT_OUTFIELD;
        const skillSum = player.skills.reduce((s, sk) => s + (Number(sk.value) || 0), 0);
        if (skillSum > 0) player.asi = Math.pow(skillSum, 7) / weight;
    }

    // Always compute decimal skill values and R5/REC from the normalised skills —
    // the youth API does not expose pre-computed R5/REC.
    player.skills = TmLib.calcSkillDecimalsSimple(player);
    applyPlayerPositionRatings(player);

    // Youth-only extras — field names vary by endpoint
    player.youthRecommendationHtml = raw.youthRecommendationHtml || raw.recom_html || raw.rec_stars || null;
    player.youthFee = Number(raw.youthFee || raw.fee || 0);

    return player;
};
