import { TmLib } from '../../lib/tm-lib.js';
import { TmConst } from '../../lib/tm-constants.js';
import { normalizeTrainingWeights } from './shared.js';

const { TRAINING_GROUPS_OUT, TRAINING_GROUPS_GK, GRAPH_KEYS_OUT, GRAPH_KEYS_GK, ASI_WEIGHT_OUTFIELD } = TmConst;

/** First month with at least one non-null skill. Returns key or null. */
export const findSkillsAnchor = (monthKeys, records) => {
    for (const key of monthKeys) {
        const skills = records[key]?.skills;
        if (Array.isArray(skills) && skills.some(v => v != null)) return key;
    }
    return null;
};

/**
 * Anchor month: distribute ASI remainder evenly across non-maxed skills.
 * Uses calcSkillDecimalsSimple — no training weights needed here.
 */
const applyDecimalsToAnchor = (player) => {
    const { skillsAnchorKey, records, isGK } = player;
    if (!skillsAnchorKey) return;
    const record = records[skillsAnchorKey];
    if (!record) return;
    const intSkills = record.skills;
    const anchorASI = record.ASI;
    if (!Array.isArray(intSkills) || anchorASI == null) return;
    const skillCount = isGK ? 11 : 14;
    record.skills = TmLib.calcSkillDecimalsSimple({
        asi: anchorASI,
        isGK,
        skills: intSkills.slice(0, skillCount).map(v => ({ value: v ?? 0 })),
    }).map(s => s.value);
};

/**
 * Backward fill: from anchor going to oldest month.
 *
 * For each step backward (e.g. 26.5 → 26.4):
 *   1. Start with next month's decimal skills (e.g. 26.5)
 *   2. totalGain = TI_of_next_month / 10
 *   3. Each skill i is reduced: newSkill[i] = curSkill[i] - totalGain * skillShare[i]
 *      skillShare[i] = gw[group_of_i] / skills_in_that_group  (sums to 1)
 *   4. If any skill would drop below 1.0 → clamp at 1.0,
 *      redistribute the "couldn't subtract" amount equally across remaining free skills
 */
/**
 * Distribute delta (expectedSum - actualSum from ASI) iteratively across skills
 * with room, clamping each to [floor, cap]. Mutates newSkills in-place.
 */
const balanceSkillsToASI = (newSkills, caps, floors, asi, isGK) => {
    if (asi == null) return;
    const hardCap = 20;
    const base = Math.pow(asi * ASI_WEIGHT_OUTFIELD, 1 / 7);
    const expectedSum = isGK ? base / 14 * 11 : base;
    let delta = expectedSum - newSkills.reduce((s, v) => s + v, 0);
    let passes = 0;
    while (Math.abs(delta) > 0.0001 && passes++ < 20) {
        const eligible = newSkills
            .map((v, si) => (delta > 0 ? v < Math.min(caps[si], hardCap) : v > floors[si]) ? si : -1)
            .filter(si => si >= 0);
        if (!eligible.length) break;
        const share = delta / eligible.length;
        let remaining = 0;
        for (const si of eligible) {
            const effectiveCap = Math.min(caps[si], hardCap);
            const candidate = newSkills[si] + share;
            if (delta > 0 && candidate > effectiveCap) {
                remaining += candidate - effectiveCap;
                newSkills[si] = effectiveCap;
            } else if (delta < 0 && candidate < floors[si]) {
                remaining += candidate - floors[si];
                newSkills[si] = floors[si];
            } else {
                newSkills[si] = candidate;
            }
        }
        delta = remaining;
    }
};

const fillSkillsBackward = (player) => {
    const { monthKeys, records, isGK, training, skillsAnchorKey } = player;
    if (!skillsAnchorKey) return;
    const anchorIdx = monthKeys.indexOf(skillsAnchorKey);
    if (anchorIdx <= 0) return;

    const GRP = isGK ? TRAINING_GROUPS_GK : TRAINING_GROUPS_OUT;
    const N = isGK ? 11 : 14;
    const gw = normalizeTrainingWeights(training ?? null, isGK);
    const skillShare = new Array(N).fill(0);
    for (let gi = 0; gi < GRP.length; gi++) {
        const perSkill = gw[gi] / GRP[gi].length;
        for (const si of GRP[gi]) {
            if (si < N) skillShare[si] = perSkill;
        }
    }

    let curSkills = records[skillsAnchorKey].skills.map(Number);

    for (let i = anchorIdx - 1; i >= 0; i--) {
        const key = monthKeys[i];
        const nextKey = monthKeys[i + 1];
        const ti = records[nextKey]?.TI ?? 0;
        const totalGain = ti / 10;

        const hasKnown = records[key].skills != null && records[key].skills.some(v => v != null);
        const knownInts = hasKnown
            ? records[key].skills.map(v => v != null ? Math.floor(Number(v)) : null)
            : null;

        const caps   = new Array(N);
        const floors = new Array(N);
        for (let si = 0; si < N; si++) {
            if (knownInts?.[si] != null) {
                caps[si]   = Math.min(knownInts[si] + 0.99, 20);
                floors[si] = knownInts[si];
            } else {
                caps[si]   = Math.min(curSkills[si], 20);
                floors[si] = 1.0;
            }
        }

        const newSkills = curSkills.map((v, si) =>
            Math.max(floors[si], Math.min(caps[si], v - skillShare[si] * totalGain))
        );

        balanceSkillsToASI(newSkills, caps, floors, records[key].ASI, isGK);

        records[key].skills = newSkills;
        curSkills = newSkills;
    }

    const tableKeys = monthKeys.slice(0, anchorIdx + 1);
    console.groupCollapsed(`[Step 7b] ← ${player.name} (${tableKeys.length} months to anchor)`);
    console.log(player.records);
    console.groupEnd();
};

const fillSkillsForward = (player) => {
    const { monthKeys, records, isGK, training, skillsAnchorKey } = player;
    if (!skillsAnchorKey) return;
    const anchorIdx = monthKeys.indexOf(skillsAnchorKey);
    if (anchorIdx < 0 || anchorIdx >= monthKeys.length - 1) return;

    const GRP = isGK ? TRAINING_GROUPS_GK : TRAINING_GROUPS_OUT;
    const N = isGK ? 11 : 14;
    const gw = normalizeTrainingWeights(training ?? null, isGK);

    const defaultShare = new Array(N).fill(0);
    for (let gi = 0; gi < GRP.length; gi++) {
        const perSkill = gw[gi] / GRP[gi].length;
        for (const si of GRP[gi]) {
            if (si < N) defaultShare[si] = perSkill;
        }
    }

    let curSkills = records[skillsAnchorKey].skills.map(Number);
    console.log(monthKeys);
    for (let i = anchorIdx + 1; i < monthKeys.length; i++) {
        const key = monthKeys[i];
        const record = records[key];
        if (!record) continue;

        const ti = record.TI ?? 0;
        const totalGain = ti / 10;
        const wc = record.weeklyChanges;

        // per-skill gain: default from training weights, or exact from weeklyChanges
        // weeklyChanges: each down skill gets -0.10, remainder distributed equally to up skills
        let gain = defaultShare.map(w => w * totalGain);
        if (wc?.skillChanges?.length) {
            const upIdxs = wc.skillChanges
                .map((c, idx) => (c === 'one_up' || c === 'part_up') && idx < N ? idx : -1)
                .filter(idx => idx >= 0);
            const downIdxs = wc.skillChanges
                .map((c, idx) => (c === 'one_down' || c === 'part_down') && idx < N ? idx : -1)
                .filter(idx => idx >= 0);
            if (upIdxs.length > 0 || downIdxs.length > 0) {
                gain = new Array(N).fill(0);
                console.log(`Applying weeklyChanges for ${player.name} at ${key}:`, wc.skillChanges, upIdxs, downIdxs);
                if (upIdxs.length > 0 && downIdxs.length > 0) {
                    // nominal: every changed skill gets ±0.10
                    // excess vs nominal goes to ups (if positive) or downs (if negative)
                    const nominalTotal = (upIdxs.length - downIdxs.length) * 0.10;
                    const excess = totalGain - nominalTotal;
                    if (excess >= 0) {
                        // ups absorb the excess above nominal
                        const upGainPer = 0.10 + excess / upIdxs.length;
                        for (const si of upIdxs) gain[si] = upGainPer;
                        for (const si of downIdxs) gain[si] = -0.10;
                    } else {
                        // downs absorb the deficit below nominal
                        const downGainPer = -0.10 + excess / downIdxs.length;
                        for (const si of upIdxs) gain[si] = 0.10;
                        for (const si of downIdxs) gain[si] = downGainPer;
                    }
                } else if (upIdxs.length > 0) {
                    // only ups: split totalGain equally
                    const upGainPer = totalGain / upIdxs.length;
                    for (const si of upIdxs) gain[si] = upGainPer;
                } else {
                    // only downs: split totalGain equally
                    const downGainPer = totalGain / downIdxs.length;
                    for (const si of downIdxs) gain[si] = downGainPer;
                }
            }
        }

        // per-skill cap and floor for this month
        const hasKnown = record.skills != null && record.skills.some(v => v != null);
        const knownInts = hasKnown
            ? record.skills.map(v => v != null ? Math.floor(Number(v)) : null)
            : null;

        let futureInts = null;
        if (!hasKnown) {
            for (let j = i + 1; j < monthKeys.length; j++) {
                const fSkills = records[monthKeys[j]]?.skills;
                if (fSkills && fSkills.some(v => v != null)) {
                    futureInts = fSkills.map(v => v != null ? Math.floor(Number(v)) : null);
                    break;
                }
            }
        }

        const caps = new Array(N);
        const floors = new Array(N);
        for (let si = 0; si < N; si++) {
            const curInt = Math.floor(curSkills[si]);
            if (knownInts?.[si] != null) {
                caps[si] = knownInts[si] + 0.99;
                floors[si] = knownInts[si];
            } else if (futureInts?.[si] != null) {
                const futInt = futureInts[si];
                caps[si] = (ti >= 0 && futInt === curInt) ? curInt + 0.99 : (ti < 0 ? curInt + 0.99 : Infinity);
                floors[si] = ti < 0 ? futInt : curInt;
            } else {
                caps[si] = Infinity;
                floors[si] = 1.0;
            }
            if (curInt >= 20) { caps[si] = 20; floors[si] = 20; }
            caps[si] = Math.min(caps[si], 20);
        }

        // apply gain clamped to [floor, cap]
        const newSkills = curSkills.map((v, si) =>
            Math.max(floors[si], Math.min(caps[si], v + gain[si]))
        );

        balanceSkillsToASI(newSkills, caps, floors, record.ASI, isGK);

        record.skills = newSkills;
        curSkills = newSkills;
    }

    const tableKeys = monthKeys.slice(anchorIdx);
    console.groupCollapsed(`[Step 7c] → ${player.name} (${tableKeys.length} months from anchor)`);
    console.log(player.records);
    console.groupEnd();
};

/**
 * Step 7 entry: anchor detection + decimals at anchor + backward + forward fill.
 * Mutates players in-place.
 */
export const attachSkillsAnchor = (players) => {
    players.forEach(player => {
        console.log(player.name, player.monthKeys);
    })
    for (const player of players) {
        if (!player.needSync) continue;
        player.skillsAnchorKey = findSkillsAnchor(player.monthKeys, player.records);
        applyDecimalsToAnchor(player);
        fillSkillsBackward(player);
        fillSkillsForward(player);
    }
    return players;
};
