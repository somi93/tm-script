
import { _post } from './engine.js';
import { TmConst } from '../lib/tm-constants.js';
import { TmLib } from '../lib/tm-lib.js';
import { TmUtils } from '../lib/tm-utils.js';

// ─── Private transfer calc helpers ─────────────────────────────────────
const _SKILL_NAME_TO_KEY = {
    'Strength': 'str', 'Stamina': 'sta', 'Pace': 'pac', 'Marking': 'mar', 'Tackling': 'tac',
    'Workrate': 'wor', 'Positioning': 'pos', 'Passing': 'pas', 'Crossing': 'cro',
    'Technique': 'tec', 'Heading': 'hea', 'Finishing': 'fin', 'Longshots': 'lon', 'Set Pieces': 'set',
    'Handling': 'han', 'One on ones': 'one', 'Reflexes': 'ref', 'Aerial Ability': 'ari',
    'Jumping': 'jum', 'Communication': 'com', 'Kicking': 'kic', 'Throwing': 'thr',
};
const _GK_WEIGHT_ORDER = TmConst.SKILL_KEYS_GK_WEIGHT;
const _OUTFIELD_SKILLS = TmConst.SKILL_KEYS_OUT;
function _skillsToArray(skillsObj, posIdx) {
    const order = posIdx === 9 ? _GK_WEIGHT_ORDER : _OUTFIELD_SKILLS;
    return order.map(k => skillsObj[k] || 0);
}

export const TmTransferService = {

    /**
     * Fetch the current transfer status for a listed player.
     * @param {string|number} playerId
     * @returns {Promise<object|null>}
     */
    fetchTransfer(playerId) {
        return _post('/ajax/transfer_get.ajax.php', { type: 'transfer_reload', player_id: playerId });
    },

    /**
     * Search the transfer market by a pre-built hash string.
     * Returns the raw API response { list: [], refresh: bool } or null on error.
     * The `list` array contains raw TM transfer player objects — call
     * normalizeTransferPlayer() on each entry before use.
     * @param {string} hash   — path-style hash built by buildHash() / buildHashRaw()
     * @param {string|number} clubId — SESSION.id (used by TM to exclude own players)
     * @returns {Promise<{list: object[], refresh: boolean}|null>}
     */
    fetchTransferSearch(hash, clubId) {
        return _post('/ajax/transfer.ajax.php', { search: hash, club_id: clubId });
    },

    /**
     * Normalise a raw transfer-list player object in place.
     * Adds computed helper fields:
     *   _gk    {boolean}  — true for goalkeepers
     *   _ageP  {object}   — { years, months, totalMonths, decimal }
     *   _ss    {object}   — { sum, count, total, max } star-sum of scouted skills
     * @param {object} p — raw player from transfer list
     * @returns {object} the same object (mutated), for chaining
     */
    normalizeTransferPlayer(p) {
        const OUTFIELD = ['str', 'sta', 'pac', 'mar', 'tac', 'wor', 'pos', 'pas', 'cro', 'tec', 'hea', 'fin', 'lon', 'set'];
        const GK = ['str', 'sta', 'pac', 'han', 'one', 'ref', 'ari', 'jum', 'com', 'kic', 'thr'];
        const gk = !!(p.fp && p.fp[0] === 'gk');
        const skills = gk ? GK : OUTFIELD;
        let sum = 0, count = 0;
        for (const s of skills) { if (p[s] > 0) { sum += p[s]; count++; } }
        const age = parseFloat(p.age) || 0;
        const years = Math.floor(age);
        const months = Math.round((age - years) * 100);
        p._gk = gk;
        p._ss = { sum, count, total: skills.length, max: skills.length * 20 };
        p._ageP = { years, months, totalMonths: years * 12 + months, decimal: years + months / 12 };
        return p;
    },

    /**
     * Compute R5 range estimate from transfer-list skills (no tooltip needed).
     * Uses assumed routine range [0 … 4.2*(age-15)].
     * Requires player to be pre-normalized via normalizeTransferPlayer().
     * @param {object} p — normalized transfer player
     * @returns {{ r5Lo, r5Hi, recCalc, routineMax }|null}
     */
    estimateTransferPlayer(p) {
        const asi = p.asi || 0;
        if (!asi) return null;
        const skillKeys = p._gk ? _GK_WEIGHT_ORDER : _OUTFIELD_SKILLS;
        const skills = skillKeys.map(k => p[k] || 0);
        if (skills.every(s => s === 0)) return null;
        const positions = [...(p.fp || [])].sort((a, b) => TmLib.getPositionIndex(a) - TmLib.getPositionIndex(b));
        if (!positions.length) return null;
        const ageYears = p._ageP ? p._ageP.years : Math.floor(parseFloat(p.age) || 20);
        const routineMax = Math.max(0, TmConst.ROUTINE_SCALE * (ageYears - TmConst.ROUTINE_AGE_MIN));
        let r5Lo = null, r5Hi = null, recCalc = null;
        for (const pos of positions) {
            const pi = TmLib.getPositionIndex(pos);
            const lo = TmLib.calcR5(pi, skills, asi, 0);
            const hi = TmLib.calcR5(pi, skills, asi, routineMax);
            const rec = TmLib.calcRec(pi, skills, asi);
            if (r5Lo === null || lo > r5Lo) r5Lo = lo;
            if (r5Hi === null || hi > r5Hi) r5Hi = hi;
            if (recCalc === null || rec > recCalc) recCalc = rec;
        }
        return { r5Lo, r5Hi, recCalc, routineMax };
    },

    /**
     * Enrich a transfer player with tooltip-derived values: recSort, recCalc,
     * r5 (exact if routine known), r5Lo, r5Hi, ti, skills.
     * Does NOT do any DB access — pure calculation.
     * Requires player to be pre-normalized via normalizeTransferPlayer().
     * @param {object} player        — normalized transfer player (has _gk, _ageP)
     * @param {object} tooltipData   — raw response from tooltip.ajax.php
     * @param {number} currentSession — TmLib.getCurrentSession() result
     * @returns {{ recSort, recCalc, r5, r5Lo, r5Hi, ti, skills }|null}
     */
    enrichTransferFromTooltip(player, tooltipData, currentSession) {
        if (!tooltipData?.player) return null;
        const tp = tooltipData.player;

        const recSort = tp.rec_sort !== undefined ? parseFloat(tp.rec_sort) : null;

        const wageNum = TmUtils.parseNum(tp.wage);
        const asiNum = player.asi || TmUtils.parseNum(tp.asi || tp.skill_index);
        const favpos = tp.favposition || '';
        const isGK = favpos.split(',')[0].toLowerCase() === 'gk';
        let ti = null;
        if (asiNum && wageNum) {
            const tiRaw = TmLib.calculateTI({ asi: asiNum, wage: wageNum, isGK });
            if (tiRaw !== null && currentSession > 0)
                ti = Number((tiRaw / currentSession).toFixed(1));
        }

        let skills = null;
        if (tp.skills && Array.isArray(tp.skills)) {
            skills = {};
            for (const sk of tp.skills) {
                const key = _SKILL_NAME_TO_KEY[sk.name];
                if (!key) continue;
                const v = sk.value;
                if (typeof v === 'string') {
                    if (v.includes('star_silver')) skills[key] = 19;
                    else if (v.includes('star')) skills[key] = 20;
                    else skills[key] = parseInt(v) || 0;
                } else {
                    skills[key] = parseInt(v) || 0;
                }
            }
        }

        const tooltipRoutine = tp.routine != null ? parseFloat(tp.routine) : null;
        let recCalc = null, r5 = null, r5Lo = null, r5Hi = null;
        if (skills && asiNum) {
            const positions = favpos.split(',').map(s => s.trim()).filter(Boolean);
            if (positions.length) {
                const ageYears = player._ageP ? player._ageP.years : Math.floor(parseFloat(player.age) || 20);
                const routineMax = Math.max(0, TmConst.ROUTINE_SCALE * (ageYears - TmConst.ROUTINE_AGE_MIN));
                for (const pos of positions) {
                    const pix = TmLib.getPositionIndex(pos);
                    const sax = _skillsToArray(skills, pix);
                    const rec = TmLib.calcRec(pix, sax, asiNum);
                    const lo = TmLib.calcR5(pix, sax, asiNum, 0);
                    const hi = TmLib.calcR5(pix, sax, asiNum, routineMax);
                    if (recCalc === null || rec > recCalc) recCalc = rec;
                    if (r5Lo === null || lo > r5Lo) r5Lo = lo;
                    if (r5Hi === null || hi > r5Hi) r5Hi = hi;
                    if (tooltipRoutine !== null) {
                        const exact = TmLib.calcR5(pix, sax, asiNum, tooltipRoutine);
                        if (r5 === null || exact > r5) r5 = exact;
                    }
                }
            }
        }

        return { recSort, recCalc, r5, r5Lo, r5Hi, ti, skills };
    },


}